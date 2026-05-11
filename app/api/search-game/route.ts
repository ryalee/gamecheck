import { NextRequest, NextResponse } from "next/server";
import { getIgdbToken } from "../../lib/igdb-token";
import {
  allowsAddons,
  getCanonicalQuery,
  normalizeQuery,
} from "../../lib/game-corrections";
import type { Specs } from "../../types";

interface RequestBody {
  query: string;
  specs: Specs;
}

interface IgdbGame {
  id?: number;
  name?: string;
  summary?: string;
  category?: number;
  cover?: { image_id?: string };
  involved_companies?: { company?: { name?: string } }[];
  release_dates?: { date?: number }[];
}

const DLC_CATEGORIES = new Set([1, 2, 3, 7, 10, 13, 14]);
const MAIN_GAME_CATEGORIES = new Set([0, 8, 9, 11]);

function safeYear(unixSeconds?: number) {
  if (!unixSeconds) return new Date().getFullYear();
  return new Date(unixSeconds * 1000).getFullYear();
}

function similarityScore(input: string, candidate: string) {
  const inputNorm = normalizeQuery(input);
  const candidateNorm = normalizeQuery(candidate);
  if (inputNorm === candidateNorm) return 100;
  if (candidateNorm.startsWith(inputNorm)) return 80;
  if (candidateNorm.includes(inputNorm)) return 65;
  if (inputNorm.includes(candidateNorm)) return 60;
  const inputTokens = new Set(inputNorm.split(" ").filter(Boolean));
  const candidateTokens = new Set(candidateNorm.split(" ").filter(Boolean));
  let overlap = 0;
  for (const token of inputTokens) {
    if (candidateTokens.has(token)) overlap += 1;
  }
  return overlap * 10;
}

function getRequirementsByTitle(title: string) {
  const gameReqs: Record<
    string,
    { cpu: string; ram: number; gpu: string; vram: number; heavy?: boolean }
  > = {
    minecraft: { cpu: "i3", ram: 4, gpu: "Intel HD", vram: 512 },
    terraria: { cpu: "Core2", ram: 2, gpu: "Shader1.1", vram: 256 },
    "red dead redemption 2": {
      cpu: "i5-2500K",
      ram: 12,
      gpu: "GTX770",
      vram: 2048,
      heavy: true,
    },
    "grand theft auto v": {
      cpu: "i5-3470",
      ram: 8,
      gpu: "GTX660",
      vram: 2048,
      heavy: true,
    },
    "cyberpunk 2077": {
      cpu: "i7-4790",
      ram: 12,
      gpu: "GTX1060",
      vram: 6144,
      heavy: true,
    },
    "counter strike 2": { cpu: "Core2 E6600", ram: 2, gpu: "256MB", vram: 256 },
    "dota 2": { cpu: "Dual2.8GHz", ram: 4, gpu: "DX9", vram: 512 },
    default: { cpu: "i5", ram: 8, gpu: "GTX1050", vram: 4096 },
  };
  const normalized = normalizeQuery(title);
  const key =
    Object.keys(gameReqs).find((candidate) => normalized.includes(candidate)) ||
    "default";
  return gameReqs[key];
}

export async function POST(request: NextRequest) {
  try {
    const { query, specs }: RequestBody = (await request.json()) as RequestBody;

    if (!query || query.length < 3) {
      return NextResponse.json({
        success: false,
        error: "Digite pelo menos 3 letras do jogo",
      });
    }

    const token = await getIgdbToken();
    const canonicalQuery = getCanonicalQuery(query);
    const includeAddons = allowsAddons(query);
    const fields =
      "fields id,name,summary,category,cover.image_id,involved_companies.company.name,release_dates.date;";

    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": (() => {
          const v = process.env.TWITCH_CLIENT_ID;
          if (!v) throw new Error("Missing TWITCH_CLIENT_ID env var");
          return v;
        })(),
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },

      body: `search "${canonicalQuery.replace(/"/g, '\\"')}"; ${fields} limit 30;`,
    });

    const rawData = (await res.json()) as unknown;
    const games = Array.isArray(rawData) ? (rawData as IgdbGame[]) : [];
    const candidates = games
      .filter((game) => game.name && game.name.trim())
      .filter((game) =>
        includeAddons
          ? true
          : game.category === undefined ||
            MAIN_GAME_CATEGORIES.has(game.category),
      )
      .filter((game) =>
        includeAddons
          ? true
          : !(game.category !== undefined && DLC_CATEGORIES.has(game.category)),
      );

    if (!candidates.length) {
      return NextResponse.json({
        success: false,
        error:
          "Nao encontramos o jogo exato. Tente selecionar no autocomplete.",
        games: [],
      });
    }

    const best = [...candidates].sort(
      (a, b) =>
        similarityScore(canonicalQuery, b.name || "") -
        similarityScore(canonicalQuery, a.name || ""),
    )[0];

    const title = (best.name || canonicalQuery).replace(/[™®©]/g, "").trim();
    const reqs = getRequirementsByTitle(title);
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
    const estimatedVramForCheck =
      looksIntegrated && reportedVram < 256
        ? Math.max(0, Math.min(8192, Math.round(specs.ram.total * 0.5 * 1024)))
        : reportedVram;
    const vramEnough = estimatedVramForCheck >= reqs.vram;

    let performance: "smooth" | "limited" | "unplayable" = "limited";
    let performanceNote = "";
    if (reqs.heavy && (specs.ram.total < 8 || specs.gpu.vram < 2048)) {
      performance = "unplayable";
      performanceNote = "Nao roda (RAM/GPU insuficiente para jogo pesado)";
    } else if (cpuMatch && ramEnough && gpuEnough && vramEnough) {
      performance = "smooth";
      performanceNote = "Roda perfeitamente ultra 60+FPS";
    } else if (ramEnough && vramEnough && specs.cpu.cores >= 2) {
      performance = "limited";
      performanceNote = "Roda medio/baixas 30-60FPS (ajustes necessarios)";
    } else {
      performance = "unplayable";
      performanceNote = "Nao roda (CPU/RAM/GPU muito abaixo)";
    }

    const result = {
      id: `igdb_${best.id ?? Date.now()}`,
      title,
      genre: "Analise PC",
      year: safeYear(best.release_dates?.[0]?.date),
      description:
        best.summary?.substring(0, 120) + "..." ||
        `Compatibilidade para "${title}". Sua config: ${specs.cpu.brand} ${specs.ram.total}GB RAM ${specs.gpu.model} ${specs.gpu.vram}MB VRAM.`,
      developer: best.involved_companies?.[0]?.company?.name || "Estudio",
      coverColor:
        performance === "smooth"
          ? "#22c55e"
          : performance === "unplayable"
            ? "#ef4444"
            : "#f59e0b",
      coverUrl: best.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${best.cover.image_id}.jpg`
        : null,
      performance,
      performanceNote,
      tags: [performance.toUpperCase()],
      minReqs: reqs,
      stores: {
        steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`,
        nuuvem: `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(title)}`,
      },
    };

    return NextResponse.json({ success: true, games: [result] });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({
      success: false,
      error: "Erro inesperado na busca",
    });
  }
}
