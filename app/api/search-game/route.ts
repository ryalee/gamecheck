import { NextRequest, NextResponse } from "next/server";
import { getIgdbToken } from "../../lib/igdb-token";

const cache = new Map<string, object>();

async function fetchGameRequirements(
  title: string,
): Promise<{ requirements: string; coverUrl: string | null }> {
  try {
    const token = await getIgdbToken();

    // Busca requisitos e cover juntos
    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `search "${title}"; fields name, cover.url, system_requirements.minimum, system_requirements.recommended; limit 1;`,
    });

    const data = await res.json();
    const game = data[0];
    const reqs = game?.system_requirements?.[0];

    // Cover URL do IGDB - transforma o formato "https://images.igdb.com/..."
    const coverUrl = game?.cover?.url
      ? game.cover.url
          .replace("t_thumb", "t_cover_big_2x")
          .replace("//", "https://")
      : null;

    if (!reqs) {
      return {
        requirements: `No database requirements found for "${title}". Use your best knowledge.`,
        coverUrl,
      };
    }

    return {
      requirements: `REAL REQUIREMENTS FROM IGDB DATABASE:
Minimum: ${reqs.minimum ?? "not listed"}
Recommended: ${reqs.recommended ?? "not listed"}`,
      coverUrl,
    };
  } catch {
    return {
      requirements: `Could not fetch requirements. Use your best knowledge of "${title}".`,
      coverUrl: null,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, specs } = await req.json();
    console.log("GPU:", specs.gpu.model, "VRAM:", specs.gpu.vram);

    const cacheKey = `${title.toLowerCase()}-${specs.cpu.brand}-${specs.ram.total}-${specs.gpu.model}`;
    if (cache.has(cacheKey)) return NextResponse.json(cache.get(cacheKey));

    const requirements = await fetchGameRequirements(title);

    const prompt = `
You are a PC gaming performance expert specializing in PC game compatibility analysis.

GAME: "${title}"

PC HARDWARE SPECS:
- CPU: ${specs.cpu.brand} (${specs.cpu.cores} cores @ ${specs.cpu.speed}GHz)
- RAM: ${specs.ram.total}GB DDR${specs.ram.type ? specs.ram.type : "4"}
- GPU: ${specs.gpu.model} (${specs.gpu.vram}MB VRAM)
- OS: ${specs.os.platform} ${specs.os.distro || ""}
- Storage: ${specs.disk.totalGB}GB available

${requirements}

ANALYSIS RULES:
1. VRAM LIMIT: ${specs.gpu.vram}MB is a HARD limit. If game recommends more, expect reduced settings or frame drops.
2. INTEGRATED GPU: Intel UHD/Iris/AMD Radeon Graphics = 1-2GB shared VRAM. Only handle lightweight/old games.
3. MINIMUM vs RECOMMENDED:
   - "smooth": Exceeds RECOMMENDED specs → 60fps+ high/ultra settings
   - "limited": Meets MINIMUM but not RECOMMENDED → 30-60fps on low/medium, may need settings tuning
   - "unplayable": Below MINIMUM → major frame drops, stuttering, or won't run
4. GENRE CONSIDERATIONS:
   - Indie/2D/Retro (Terraria, Stardew Valley, Celeste, Hollow Knight): almost always "smooth" even on weak hardware
   - Strategy/Cards (Hearthstone, Civ VI, LoR): CPU-bound, usually "smooth"
   - Esports (Valorant, CS2, League): highly optimized, "smooth" if meets min
   - AAA/Open World (Spider-Man, RDR2, Cyberpunk): demands high specs, check both CPU AND GPU
5. UPSCALING SUPPORT: If game supports DLSS/FSR/XeSS, a ${specs.gpu.vram}MB GPU can potentially run better than expected. Consider this for NVIDIA RTX, AMD Radeon RX 6000+, or Intel Arc.
6. BOTTLENECK ANALYSIS: Identify if CPU, GPU, or RAM is the limiting factor.

Return ONLY valid JSON:
{
  "title": "${title}",
  "performance": "smooth" | "limited" | "unplayable",
  "fpsEstimate": "60fps+" | "45-60fps" | "30-45fps" | "<30fps",
  "recommendedSettings": "Ultra/High" | "Medium" | "Low" | "Not recommended",
  "reason": "Em Portuguese, max 12 palavras, cite o gargalo (CPU/GPU/RAM/VRAM)"
}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0,
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    const cleaned = text.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const result = JSON.parse(jsonMatch[0]);

    // Adiciona a URL da capa ao resultado
    const resultWithCover = {
      ...result,
      coverUrl: requirements.coverUrl,
    };

    cache.set(cacheKey, resultWithCover);
    return NextResponse.json(resultWithCover);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro na busca" }, { status: 500 });
  }
}
