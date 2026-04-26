import { NextRequest, NextResponse } from "next/server";

// 🔑 Cache do token
let cachedToken: string | null = null;
let tokenExpiry = 0;

// 🖼️ Cache de capas
const coverCache = new Map<string, string | null>();

export async function GET(req: NextRequest) {
  const rawTitle = req.nextUrl.searchParams.get("title");

  if (!rawTitle) {
    return NextResponse.json({ error: "No title" }, { status: 400 });
  }

  // 🧠 Normaliza título (melhora busca no IGDB)
  const title = rawTitle.replace(/[:\-].*/, "").trim();

  try {
    // ⚡ 1. Verifica cache primeiro
    if (coverCache.has(title)) {
      return NextResponse.json({ coverUrl: coverCache.get(title) });
    }

    // 🔑 2. Token (com cache)
    if (!cachedToken || Date.now() > tokenExpiry) {
      const tokenRes = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
        { method: "POST" },
      );

      const tokenData = await tokenRes.json();

      cachedToken = tokenData.access_token;
      tokenExpiry = Date.now() + tokenData.expires_in * 1000;
    }

    // 🎮 3. Busca no IGDB
    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${cachedToken}`,
        "Content-Type": "text/plain",
      },
      body: `
        search "${title}";
        fields name, cover.image_id;
        limit 1;
      `,
    });

    const data = await igdbRes.json();

    // ❌ Sem resultado
    if (!data.length || !data[0].cover) {
      coverCache.set(title, null);
      return NextResponse.json({ coverUrl: null });
    }

    const imageId = data[0].cover.image_id;

    const coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;

    // 💾 salva no cache
    coverCache.set(title, coverUrl);

    return NextResponse.json({ coverUrl });
  } catch (error) {
    console.error("IGDB error:", error);

    // salva erro como null pra evitar retry infinito
    coverCache.set(title, null);

    return NextResponse.json({ coverUrl: null });
  }
}
