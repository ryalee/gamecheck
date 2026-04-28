import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, specs } = await req.json();
    console.log("SPECS RECEBIDAS:", JSON.stringify(specs, null, 2));
    
    const prompt = `
You are a PC gaming performance expert with knowledge of game system requirements.

Analyze if the following game runs well on this PC based on the game's ACTUAL known minimum and recommended requirements.

GAME: ${title}

SYSTEM:
CPU: ${specs.cpu.brand} (${specs.cpu.cores} cores @ ${specs.cpu.speed}GHz)
RAM: ${specs.ram.total}GB
GPU: ${specs.gpu.model} (${specs.gpu.vram}MB VRAM)

Rules:
- Use your knowledge of the game's real minimum/recommended requirements
- If the PC exceeds recommended requirements, return "smooth"
- If the PC meets minimum but not recommended, return "limited"
- Only return "unplayable" if the PC clearly fails minimum requirements
- Terraria, Stardew Valley, Among Us and similar lightweight games should almost always be "smooth"

Return ONLY JSON:
{
  "title": string,
  "performance": "smooth" | "limited" | "unplayable",
  "fpsEstimate": string,
  "recommendedSettings": string,
  "reason": string (short explanation in Portuguese)
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
          model: "llama-3.1-8b-instant",
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

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro na busca" }, { status: 500 });
  }
}
