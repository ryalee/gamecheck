import { isFranchiseQuery } from "../../lib/game-corrections";

type SpecsLike = {
  cpu: { brand: string; cores: number };
  ram: { total: number };
  gpu: { model: string; vram: number };
};

export function generateFallbackGame(
  query: string,
  specs: SpecsLike,
  correctedQuery: string,
  lowerQuery: string,
) {
  const franchiseInfo = isFranchiseQuery(query);

  if (franchiseInfo.isFranchise) {
    // Multi-games for franchise fallback
    const gtaGames = [
      {
        title: "GTA 1",
        key: "gta",
        reqs: { cpu: "486", ram: 8, gpu: "VGA", vram: 0 },
      },
      {
        title: "GTA 2",
        key: "gta 2",
        reqs: { cpu: "Pentium", ram: 16, gpu: "DirectX2", vram: 0 },
      },
      {
        title: "GTA III",
        key: "gta 3",
        reqs: { cpu: "Pentium III 500", ram: 96 / 1024, gpu: "16MB", vram: 16 },
      },
      {
        title: "GTA Vice City",
        key: "vice city",
        reqs: {
          cpu: "Pentium III 1GHz",
          ram: 256 / 1024,
          gpu: "32MB",
          vram: 32,
        },
      },
      {
        title: "GTA San Andreas",
        key: "gtasa",
        reqs: { cpu: "PentiumIII", ram: 1, gpu: "64MB", vram: 64 },
      },
      {
        title: "GTA IV",
        key: "gta 4",
        reqs: {
          cpu: "Core2 Duo",
          ram: 2,
          gpu: "DX9 256MB",
          vram: 256,
          heavy: true,
        },
      },
      {
        title: "GTA V",
        key: "gta v",
        reqs: {
          cpu: "i5-3470",
          ram: 8,
          gpu: "GTX660",
          vram: 2048,
          heavy: true,
        },
      },
      {
        title: "GTA VI",
        key: "gta 6",
        reqs: { cpu: "i7", ram: 16, gpu: "RTX3070", vram: 8192, heavy: true },
      },
    ];

    const games = gtaGames.map(({ title, key, reqs }, index) => {
      const cpuMatch =
        specs.cpu.brand
          .toLowerCase()
          .includes(reqs.cpu.toLowerCase().replace("-", "")) ||
        specs.cpu.cores >= 4;
      const ramEnough = specs.ram.total >= (reqs.ram || 8) * 1.2;
      const gpuEnough =
        specs.gpu.model.toLowerCase().includes("gtx") ||
        specs.gpu.model.toLowerCase().includes("rtx") ||
        specs.gpu.vram >= (reqs.vram || 2048) * 0.8;
      const vramEnough = specs.gpu.vram >= (reqs.vram || 2048);

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

      return {
        id: `fallback_${franchiseInfo.name}_${index}`,
        title,
        genre: "Análise PC",
        year: 2024,
        description: `Compatibilidade para "${query}" série. Sua config: ${specs.cpu.brand} ${specs.ram.total}GB RAM ${specs.gpu.model} ${specs.gpu.vram}MB VRAM.`,
        developer: "Rockstar Games",
        coverColor:
          performance === "smooth"
            ? "#22c55e"
            : performance === "unplayable"
              ? "#ef4444"
              : "#f59e0b",
        coverUrl: null,
        performance: performance === "unplayable" ? "limited" : performance,
        performanceNote,
        tags: [`Série ${franchiseInfo.name}`, performance.toUpperCase()],
        minReqs: reqs,
        stores: {
          steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`,
          nuuvem: `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(title)}`,
        },
      };
    });

    return { success: true, games };
  }

  // Original single game fallback
  const gameReqs: Record<
    string,
    { cpu: string; ram: number; gpu: string; vram: number; heavy?: boolean }
  > = {
    minecraft: { cpu: "i3", ram: 4, gpu: "Intel HD", vram: 512 },
    terraria: { cpu: "Core2", ram: 2, gpu: "Shader1.1", vram: 256 },
    "gta v": { cpu: "i5-3470", ram: 8, gpu: "GTX660", vram: 2048, heavy: true },
    "gta 5": { cpu: "i5-3470", ram: 8, gpu: "GTX660", vram: 2048, heavy: true },
    "gta vi": { cpu: "i7", ram: 16, gpu: "RTX3070", vram: 8192, heavy: true },
    "gta 6": { cpu: "i7", ram: 16, gpu: "RTX3070", vram: 8192, heavy: true },
    rdr2: { cpu: "i5-2500K", ram: 12, gpu: "GTX770", vram: 2048, heavy: true },
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
    default: { cpu: "i5", ram: 8, gpu: "GTX1050", vram: 4096 },
  };
  const gameKey =
    Object.keys(gameReqs).find((key) => lowerQuery.includes(key)) || "default";
  const reqs = gameReqs[gameKey];

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

  const title =
    correctedQuery.charAt(0).toUpperCase() + correctedQuery.slice(1);

  return {
    success: true,
    games: [
      {
        id: "precise_" + Date.now(),
        title,
        genre: "Análise PC",
        year: new Date().getFullYear(),
        description: `Compatibilidade precisa para "${query}" (${correctedQuery}). Sua config: ${specs.cpu.brand} ${specs.ram.total}GB RAM ${specs.gpu.model} ${specs.gpu.vram}MB VRAM.`,
        developer: "Estúdio",
        coverColor:
          performance === "smooth"
            ? "#22c55e"
            : performance === "unplayable"
              ? "#ef4444"
              : "#f59e0b",
        coverUrl: null,
        performance: performance === "unplayable" ? "limited" : performance,
        performanceNote,
        tags: [performance.toUpperCase()],
        minReqs: reqs,
        stores: {
          steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`,
          nuuvem: `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(title)}`,
        },
      },
    ],
  };
}
