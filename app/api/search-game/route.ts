import { NextRequest, NextResponse } from "next/server";
import { getIgdbToken } from "../../lib/igdb-token";

const cache = new Map<string, object>();

async function fetchGameRequirements(title: string): Promise<string> {
  try {
    const token = await getIgdbToken();

    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `search "${title}"; fields name, system_requirements.minimum, system_requirements.recommended; limit 1;`,
    });

    const data = await res.json();
    const reqs = data[0]?.system_requirements?.[0];

    if (!reqs)
      return `No database requirements found for "${title}". Use your best knowledge.`;

    return `REAL REQUIREMENTS FROM IGDB DATABASE:
Minimum: ${reqs.minimum ?? "not listed"}
Recommended: ${reqs.recommended ?? "not listed"}`;
  } catch {
    return `Could not fetch requirements. Use your best knowledge of "${title}".`;
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
You are a PC gaming performance expert.

GAME: "${title}"

PC SPECS:
- CPU: ${specs.cpu.brand} (${specs.cpu.cores} cores @ ${specs.cpu.speed}GHz)
- RAM: ${specs.ram.total}GB
- GPU: ${specs.gpu.model} (VRAM: ${specs.gpu.vram}MB)

${requirements}

Compare the PC specs against the requirements above and give your verdict.

RULES:
- "smooth"     → PC meets or exceeds RECOMMENDED requirements (60fps+ on high/ultra)
- "limited"    → PC meets MINIMUM but not recommended (30-60fps on low/medium)
- "unplayable" → PC clearly fails MINIMUM requirements
- For lightweight indie games (Terraria, Stardew Valley, Celeste, etc): almost always "smooth"
- ${specs.gpu.vram}MB VRAM is a hard limit — if the game needs more, performance will suffer
- Be realistic, not overly pessimistic or optimistic
- Intel UHD / Intel Iris / AMD Radeon Graphics (integrated): treat as having 1-2GB shared VRAM. Can run lightweight and older games fine.

Return ONLY valid JSON:
{
  "title": "${title}",
  "performance": "smooth" | "limited" | "unplayable",
  "fpsEstimate": string,
  "recommendedSettings": string,
  "reason": string (in Portuguese, max 15 words, mention the bottleneck if any)
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

    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro na busca" }, { status: 500 });
  }
}
