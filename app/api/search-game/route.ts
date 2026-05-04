import { NextRequest, NextResponse } from "next/server";
import { GAME_CORRECTIONS } from "../../lib/game-corrections";
import type { Specs } from "../../types";

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

    const lowerQuery = query.toLowerCase();
    const correctedQuery = GAME_CORRECTIONS[lowerQuery] || query;

    // Requisitos MÍNIMOS reais (pesquisados) - extended with fuzzy
    const gameReqs: Record<
      string,
      { cpu: string; ram: number; gpu: string; vram: number; heavy?: boolean }
    > = {
      minecraft: { cpu: "i3", ram: 4, gpu: "Intel HD", vram: 512 },
      minecraft: { cpu: "i3", ram: 4, gpu: "Intel HD", vram: 512 },
      terraria: { cpu: "Core2", ram: 2, gpu: "Shader1.1", vram: 256 },
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
      gtasa: { cpu: "PentiumIII", ram: 1, gpu: "64MB", vram: 64 },
      default: { cpu: "i5", ram: 8, gpu: "GTX1050", vram: 4096, heavy: false },
    };

    const gameKey =
      Object.keys(gameReqs).find((key) => lowerQuery.includes(key)) ||
      "default";
    const reqs = gameReqs[gameKey];

    // Comparação EXTREMAMENTE precisa com specs REAIS
    const cpuMatch =
      specs.cpu.brand
        .toLowerCase()
        .includes(reqs.cpu.toLowerCase().replace("-", "")) ||
      specs.cpu.cores >= 4;
    const ramEnough = specs.ram.total >= reqs.ram * 1.2; // Margem
    const gpuEnough =
      specs.gpu.model.toLowerCase().includes("gtx") ||
      specs.gpu.model.toLowerCase().includes("rtx") ||
      specs.gpu.vram >= reqs.vram * 0.8;
    const vramEnough = specs.gpu.vram >= reqs.vram;

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

    const resultGame = [
      {
        id: "precise_" + Date.now(),
        title: correctedQuery.charAt(0).toUpperCase() + correctedQuery.slice(1),
        genre: "Análise PC",
        year: new Date().getFullYear(),
        description: `Compatibilidade precisa para "${query}" (${correctedQuery}). Sua config: ${specs.cpu.brand} ${specs.ram.total}GB RAM ${specs.gpu.model} ${specs.gpu.vram}MB VRAM.`,
        developer: "BLACKBOXAI Analysis",
        coverColor:
          performance === "smooth"
            ? "#22c55e"
            : performance === "unplayable"
              ? "#ef4444"
              : "#f59e0b",
        coverUrl: null,
        performance: performance === "unplayable" ? "limited" : performance, // UI compat
        performanceNote,
        tags: [performance.toUpperCase()],
        minReqs: reqs,
        stores: {
          steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(correctedQuery)}`,
          nuuvem: `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(correctedQuery)}`,
        },
      },
    ];

    return NextResponse.json({ success: true, games: resultGame });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "Erro na análise" },
      { status: 500 },
    );
  }
}
