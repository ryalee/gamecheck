import { NextRequest, NextResponse } from "next/server";

interface SystemSpecs {
  cpu: { brand: string; cores: number; speed: number };
  ram: { total: number };
  gpu: { model: string; vram: number; vendor: string };
  os: { platform: string; distro: string };
  disk: { totalGB: number };
}

export async function POST(request: NextRequest) {
  try {
    const { specs }: { specs: SystemSpecs } = await request.json();

    const prompt = `You are a PC gaming expert. Based on the system specs below, suggest 12 games that run well on this machine.

SYSTEM SPECS:
- CPU: ${specs.cpu.brand} (${specs.cpu.cores} cores @ ${specs.cpu.speed}GHz)
- RAM: ${specs.ram.total}GB
- GPU: ${specs.gpu.model} (${specs.gpu.vram}MB VRAM)
- OS: ${specs.os.distro || specs.os.platform}

Return ONLY a JSON array with exactly 12 games. No markdown, no explanation, just the raw JSON array.
Each game must have:
- id: unique string slug
- title: game name
- genre: genre (e.g. "Action RPG", "FPS", "Strategy")
- year: release year (number)
- description: 1-2 sentence description of the game (in Portuguese)
- developer: developer name
- coverColor: a hex color that fits the game's vibe (e.g. "#1a1a2e")
- minReqs: { cpu: string, ram: number (GB), gpu: string, vram: number (MB) }
- performance: "smooth" if runs at 60+ FPS ultra settings, or "limited" if runs well at medium/lower settings or 30-60fps
- performanceNote: short note in Portuguese explaining performance (max 12 words), e.g. "Roda em ultra 60fps com folga" or "Melhor em médio/alto, 45-60fps"
- tags: array of 2-3 short tags in Portuguese like ["Mundo aberto", "Multijogador", "Cooperativo"]

Mix popular and indie games. Vary genres. Be accurate about requirements.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    const textContent = data.choices?.[0]?.message?.content || "";

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Clean and parse JSON
    const cleaned = textContent
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Find JSON array in the response
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }

    const games = JSON.parse(jsonMatch[0]);

    const gamesWithStore = games.map((game: any) => {
      const slug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");

      return {
        ...game,
        storeUrl: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.title)}`,
      };
    });
    return NextResponse.json({ success: true, games: gamesWithStore });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch game recommendations" },
      { status: 500 },
    );
  }
}
