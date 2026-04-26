import { NextRequest, NextResponse } from "next/server";

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken() {
  if (!cachedToken || Date.now() > tokenExpiry) {
    const res = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" },
    );

    const data = await res.json();

    cachedToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;
  }

  return cachedToken;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json({ games: [] });
  }

  try {
    const token = await getToken();

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `
        search "${query}";
        fields name, cover.image_id;
        limit 6;
      `,
    });

    const data = await igdbRes.json();

    const games = data.map((g: any) => ({
      id: g.id,
      title: g.name,
      coverUrl: g.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
        : null,
    }));

    return NextResponse.json({ games });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ games: [] });
  }
}
