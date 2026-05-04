import { NextRequest, NextResponse } from "next/server";
import { getIgdbToken } from "../../lib/igdb-token";
import {
  GAME_CORRECTIONS,
  getCorrectedQuery,
} from "../../lib/game-corrections";
import type { Specs } from "../../types";
import { calculatePerformance } from "../../lib/performance";

interface RequestBody {
  query: string;
  specs: Specs;
}

export async function POST(request: NextRequest) {
  try {
    const { query, specs }: RequestBody = await request.json();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: "Query muito curta" },
        { status: 400 },
      );
    }

    const token = await getIgdbToken();

    // Fuzzy correction
    const searchTerms = getCorrectedQuery(query);
    const igdbQuery = searchTerms
      .map((term) => `"${term.replace(/"/g, '\\"')}"`)
      .join(" OR ");

    // Busca IGDB simplificada (como api/cover)
    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `search ${igdbQuery}; fields name, summary, cover.image_id, release_dates.date, genres.name, involved_companies.company.name; limit 5;`,
    });

    const igdbData = await igdbRes.json();
    if (!igdbRes.ok) {
      console.error("IGDB response:", igdbData);
      return NextResponse.json({
        success: false,
        error: `IGDB ${igdbRes.status}: ${igdbData.error?.message || "Erro desconhecido"}`,
      });
    }

    const games: any[] = Array.isArray(igdbData) ? igdbData : [];

    if (games.length === 0) {
      return NextResponse.json({
        success: true,
        games: [],
      });
    }

    // Processa jogos com defaults
    const processedGames = games.slice(0, 3).map((game: any) => {
      const title = game.name.replace(/[™®©]/g, "");
      const minReqs = {
        cpu: "Intel Core i3",
        ram:
          query.toLowerCase().includes("minecraft") ||
          query.toLowerCase().includes("terraria")
            ? 4
            : 8,
        gpu:
          query.toLowerCase().includes("cs") ||
          query.toLowerCase().includes("dota")
            ? "GTX 750"
            : "GTX 1050",
        vram: 2048,
      };

      const perf = calculatePerformance({ minReqs }, specs);

      return {
        id: `igdb_${game.id}`,
        title,
        genre: game.genres?.[0]?.name || "Ação",
        year: game.release_dates?.[0]?.date
          ? new Date(game.release_dates[0].date * 1000).getFullYear()
          : 2020,
        description:
          game.summary?.substring(0, 150) + "..." ||
          "Jogo incrível para seu PC!",
        developer: game.involved_companies?.[0]?.company?.name || "Estúdio",
        coverColor: "#1a1a2e",
        coverUrl: game.cover
          ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
          : null,
        performance: perf.performance,
        performanceNote: perf.performanceNote,
        tags: ["Busca IGDB", "Manual"],
        minReqs,
        stores: {
          nuuvem: `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(title)}`,
          steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`,
          epic: `https://store.epicgames.com/pt-BR/browse?q=${encodeURIComponent(title)}`,
        },
      };
    });

    return NextResponse.json({ success: true, games: processedGames });
  } catch (error) {
    console.error("Search games error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno" },
      { status: 500 },
    );
  }
}
