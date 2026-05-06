import { NextRequest, NextResponse } from "next/server";
import { getIgdbToken } from "../../lib/igdb-token";
import {
  GAME_CORRECTIONS,
  FRANCHISES,
  isFranchiseQuery,
} from "../../lib/game-corrections";
import type { Specs } from "../../types";
import { generateFallbackGame } from "./fallback";

interface RequestBody {
  query: string;
  specs: Specs;
}

export async function POST(request: NextRequest) {
  try {
    const { query, specs }: RequestBody = await request.json();

    if (!query || query.length < 3) {
      return NextResponse.json({
        success: false,
        error: "Digite pelo menos 3 letras do jogo",
      });
    }

    const token = await getIgdbToken();
    const lowerQuery = query.toLowerCase();

    // Check if franchise query
    const franchiseInfo = isFranchiseQuery(query);
    let gamesData: any[] = [];

    if (franchiseInfo.isFranchise) {
      // Franchise mode: find franchise then get games
      const franchiseRes = await fetch("https://api.igdb.com/v4/franchises", {
        method: "POST",
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body: `search "${franchiseInfo.name}"; fields name,id; limit 1;`,
      });
      const franchiseData = await franchiseRes.json();
      if (
        franchiseRes.ok &&
        Array.isArray(franchiseData) &&
        franchiseData.length > 0
      ) {
        const franchiseId = franchiseData[0].id;
        const gamesRes = await fetch("https://api.igdb.com/v4/games", {
          method: "POST",
          headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID!,
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain",
          },
          body: `franchises(${franchiseId}); fields name,id,cover.image_id,involved_companies.company.name,release_dates.date,summary; limit 20;`,
        });
        gamesData = await gamesRes.json();
      }
    } else {
      // Normal single + similars
      const correctedQuery = GAME_CORRECTIONS[lowerQuery] || query;
      const searchTerms = correctedQuery
        .split(" ")
        .map((term) => `"${term.replace(/"/g, '\\"')}"`)
        .join(" OR ");
      const igdbRes = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body: `search ${searchTerms}; fields name,id,cover.image_id,involved_companies.company.name,release_dates.date,summary; limit 10;`,
      });
      gamesData = await igdbRes.json();
    }

    if (!Array.isArray(gamesData) || gamesData.length === 0) {
      // Fallback to hardcoded reqs logic
      const correctedQuery = GAME_CORRECTIONS[lowerQuery] || query;
      const fallbackResult = generateFallbackGame(
        query,
        specs,
        correctedQuery,
        lowerQuery,
      );
      return NextResponse.json(fallbackResult);
    }

    // Extended reqs for franchises
    const gameReqs: Record<
      string,
      { cpu: string; ram: number; gpu: string; vram: number; heavy?: boolean }
    > = {
      minecraft: { cpu: "i3", ram: 4, gpu: "Intel HD", vram: 512 },
      terraria: { cpu: "Core2", ram: 2, gpu: "Shader1.1", vram: 256 },
      // GTA full series
      "gta 1": { cpu: "386", ram: 4, gpu: "VGA", vram: 0 },
      gta: { cpu: "486", ram: 8, gpu: "VGA", vram: 0 },
      "gta 2": { cpu: "Pentium", ram: 16, gpu: "DirectX2", vram: 0 },
      "grand theft auto": { cpu: "Pentium", ram: 16, gpu: "DirectX2", vram: 0 },
      "gta iii": { cpu: "Pentium III 500", ram: 96, gpu: "16MB", vram: 16 },
      "gta 3": { cpu: "Pentium III 500", ram: 96, gpu: "16MB", vram: 16 },
      "gta vice city": {
        cpu: "Pentium III 1GHz",
        ram: 256,
        gpu: "32MB",
        vram: 32,
      },
      "vice city": { cpu: "Pentium III 1GHz", ram: 256, gpu: "32MB", vram: 32 },
      gtasa: { cpu: "PentiumIII", ram: 1, gpu: "64MB", vram: 64 },
      "gta san andreas": { cpu: "PentiumIII", ram: 1, gpu: "64MB", vram: 64 },
      "san andreas": { cpu: "PentiumIII", ram: 1, gpu: "64MB", vram: 64 },
      "gta iv": {
        cpu: "Core2 Duo",
        ram: 2,
        gpu: "DX9 256MB",
        vram: 256,
        heavy: true,
      },
      "gta 4": {
        cpu: "Core2 Duo",
        ram: 2,
        gpu: "DX9 256MB",
        vram: 256,
        heavy: true,
      },
      "gta v": {
        cpu: "i5-3470",
        ram: 8,
        gpu: "GTX660",
        vram: 2048,
        heavy: true,
      },
      "gta 5": {
        cpu: "i5-3470",
        ram: 8,
        gpu: "GTX660",
        vram: 2048,
        heavy: true,
      },
      "gta vi": { cpu: "i7", ram: 16, gpu: "RTX3070", vram: 8192, heavy: true },
      "gta 6": { cpu: "i7", ram: 16, gpu: "RTX3070", vram: 8192, heavy: true },
      rdr2: {
        cpu: "i5-2500K",
        ram: 12,
        gpu: "GTX770",
        vram: 2048,
        heavy: true,
      },
      "red dead 2": {
        cpu: "i5-2500K",
        ram: 12,
        gpu: "GTX770",
        vram: 2048,
        heavy: true,
      },
      cyberpunk: {
        cpu: "i7-4790",
        ram: 12,
        gpu: "GTX1060",
        vram: 6144,
        heavy: true,
      },
      "cyberpunk 2077": {
        cpu: "i7-4790",
        ram: 12,
        gpu: "GTX1060",
        vram: 6144,
        heavy: true,
      },
      csgo: { cpu: "Core2 E6600", ram: 2, gpu: "256MB", vram: 256 },
      "cs 2": { cpu: "Core2 E6600", ram: 2, gpu: "256MB", vram: 256 },
      cs: { cpu: "Core2 E6600", ram: 2, gpu: "256MB", vram: 256 },
      dota2: { cpu: "Dual2.8GHz", ram: 4, gpu: "DX9", vram: 512 },
      dota: { cpu: "Dual2.8GHz", ram: 4, gpu: "DX9", vram: 512 },
      portal2: { cpu: "Core2 E6600", ram: 2, gpu: "DX9", vram: 512 },
      factorio: { cpu: "Quad3GHz", ram: 8, gpu: "DX10", vram: 1024 },
      default: { cpu: "i5", ram: 8, gpu: "GTX1050", vram: 4096 },
    };

    const resultGames: any[] = [];

    for (const gameData of gamesData.slice(0, 12)) {
      // Limit 12 cards
      const title = gameData.name.replace(/[™®©]/g, "").toLowerCase();
      const lowerTitle = title.toLowerCase();
      const developer =
        gameData.involved_companies?.[0]?.company?.name || "Estúdio";
      const year = gameData.release_dates?.[0]?.date
        ? new Date(gameData.release_dates[0].date * 1000).getFullYear()
        : new Date().getFullYear();

      // Find best reqs match
      const gameKey =
        Object.keys(gameReqs).find((key) => lowerTitle.includes(key)) ||
        "default";
      const reqs = gameReqs[gameKey];

      // Performance calc (same logic)
      const cpuMatch =
        specs.cpu.brand
          .toLowerCase()
          .includes(reqs.cpu.toLowerCase().replace("-", "")) ||
        specs.cpu.cores >= 4;
      const ramEnough = specs.ram.total >= reqs.ram * 1.2;
      const gpuEnough =
        specs.gpu.model.toLowerCase().includes("gtx") ||
        specs.gpu.model.toLowerCase().includes("rtx") ||
        specs.gpu.vram >= reqs.vram * 0.8;
      const gpuModel = String(specs.gpu?.model || "").toLowerCase();
      const looksIntegrated =
        gpuModel.includes("intel") ||
        gpuModel.includes("uhd") ||
        gpuModel.includes("iris") ||
        gpuModel.includes("hd graphics") ||
        gpuModel.includes("radeon graphics");

      const reportedVram = Number(specs.gpu?.vram || 0);
      const needsVram = Number(reqs.vram || 0);

      const estimatedVramForCheck =
        looksIntegrated && reportedVram < 256
          ? Math.max(
              0,
              Math.min(8192, Math.round(specs.ram.total * 0.5 * 1024)),
            )
          : reportedVram;

      const vramEnough = estimatedVramForCheck >= needsVram;

      let performance: "smooth" | "limited" | "unplayable" = "limited";
      let performanceNote = "";

      if (reqs.heavy && (specs.ram.total < 8 || specs.gpu.vram < 2048)) {
        performance = "unplayable";
        performanceNote = "Não roda (RAM/GPU insuficiente para jogo pesado)";
      } else if (cpuMatch && ramEnough && gpuEnough && vramEnough) {
        performance = "smooth";
        performanceNote = "Roda perfeitamente ultra 60+FPS";
      } else if (ramEnough && vramEnough && specs.cpu.cores >= 2) {
        performance = "limited";
        performanceNote = "Roda médio/baixas 30-60FPS (ajustes necessários)";
      } else {
        performance = "unplayable";
        performanceNote = "Não roda (CPU/RAM/GPU muito abaixo)";
      }

      const coverUrl = gameData.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${gameData.cover.image_id}.jpg`
        : null;

      const gameResult = {
        id: `igdb_${gameData.id}`,
        title: gameData.name.replace(/[™®©]/g, ""),
        genre: "Análise PC",
        year,
        description:
          gameData.summary?.substring(0, 120) + "..." ||
          `Compatibilidade para "${query}". Sua config: ${specs.cpu.brand} ${specs.ram.total}GB RAM ${specs.gpu.model} ${specs.gpu.vram}MB VRAM.`,
        developer,
        coverColor:
          performance === "smooth"
            ? "#22c55e"
            : performance === "unplayable"
              ? "#ef4444"
              : "#f59e0b",
        coverUrl,
        performance: performance === "unplayable" ? "limited" : performance,
        performanceNote,
        tags: franchiseInfo.isFranchise
          ? [`Série ${franchiseInfo.name}`, performance.toUpperCase()]
          : [performance.toUpperCase()],
        minReqs: reqs,
        stores: {
          steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(gameData.name.replace(/[™®©]/g, ""))}`,
          nuuvem: `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(gameData.name.replace(/[™®©]/g, ""))}`,
        },
      };
      resultGames.push(gameResult);
    }

    return NextResponse.json({ success: true, games: resultGames });
  } catch (error) {
    console.error("Search error:", error);
    // Fallback
    const body = await request.json();
    const lowerQuery = body.query.toLowerCase();
    const correctedQuery = GAME_CORRECTIONS[lowerQuery] || body.query;
    const fallbackResult = generateFallbackGame(
      body.query,
      body.specs,
      correctedQuery,
      lowerQuery,
    );
    return NextResponse.json(fallbackResult);
  }
}
