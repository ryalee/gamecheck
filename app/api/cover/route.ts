import { NextRequest, NextResponse } from "next/server";
import { getIgdbToken } from "../../lib/igdb-token";

const coverCache = new Map<string, string | null>();

export async function GET(req: NextRequest) {
  const rawTitle = req.nextUrl.searchParams.get("title");
  if (!rawTitle)
    return NextResponse.json({ error: "No title" }, { status: 400 });

  const title = rawTitle.replace(/[™®©]/g, "").replace(/\s+/g, " ").trim();

  if (coverCache.has(title))
    return NextResponse.json({ coverUrl: coverCache.get(title) });

  try {
    const token = await getIgdbToken();

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `search "${title}"; fields name, cover.image_id; limit 5;`,
    });

    const data = await igdbRes.json();
    const game = data.find((g: any) => g.cover) || data[0];

    if (!game?.cover) {
      coverCache.set(title, null);
      return NextResponse.json({ coverUrl: null });
    }

    const coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`;
    coverCache.set(title, coverUrl);
    return NextResponse.json({ coverUrl });
  } catch (error) {
    console.error("IGDB error:", error);
    coverCache.set(title, null);
    return NextResponse.json({ coverUrl: null });
  }
}
