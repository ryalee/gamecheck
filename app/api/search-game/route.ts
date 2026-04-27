import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, specs } = await req.json();

    const prompt = `
You are a PC performance expert.

Analyze if the following game runs on this PC:

GAME: ${title}

SYSTEM:
CPU: ${specs.cpu.brand} (${specs.cpu.cores} cores @ ${specs.cpu.speed}GHz)
RAM: ${specs.ram.total}GB
GPU: ${specs.gpu.model} (${specs.gpu.vram}MB VRAM)

Be realistic and not overly strict.

Many games run on low settings even on weak hardware.

Prefer:
- "limited" instead of "unplayable" when unsure
- assume low/medium settings are acceptable

Never be too pessimistic.

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
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    const cleaned = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro na busca" }, { status: 500 });
  }
}
