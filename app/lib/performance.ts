type Performance = "smooth" | "limited" | "unplayable";

type GameLike = {
  minReqs: {
    ram: number;
    vram: number;
  };
};

type SpecsLike = {
  ram: { total: number };
  gpu?: { model?: string; vram?: number };
  cpu: { cores: number; speed: number };
  disk: { totalGB: number };
};

export function calculatePerformance(game: GameLike, specs: SpecsLike) {
  const ramOk = specs.ram.total >= game.minReqs.ram;

  // Heurística para iGPU/placa integrada:
  // - muitas vezes `systeminformation` reporta VRAM como 0 ou valores pouco confiáveis
  // - iGPU usa RAM compartilhada, então permitir uma “concessão” quando VRAM for suspeita
  const gpuModel = String(specs.gpu?.model || "").toLowerCase();
  const looksIntegrated =
    gpuModel.includes("intel") ||
    gpuModel.includes("uhd") ||
    gpuModel.includes("iris") ||
    gpuModel.includes("hd graphics");

  const reportedVram = Number(specs.gpu?.vram || 0);
  const needsVram = Number(game.minReqs?.vram || 0);

  // Se for integrada e a VRAM reportada estiver “quase zero”, estimamos com base na RAM do sistema.
  // (Não é benchmark real, mas reduz falsos negativos.)
  const estimatedVramForCheck =
    looksIntegrated && reportedVram < 256
      ? Math.max(0, Math.min(8192, Math.round(specs.ram.total * 0.5 * 1024)))
      : reportedVram;

  const vramOk = estimatedVramForCheck >= needsVram;

  const cpuOk = specs.cpu.cores >= 4 || specs.cpu.speed >= 3.0; // Cores/speed básica
  const diskOk = specs.disk.totalGB >= 50;

  // Score com VRAM baseado na heurística (estimada para iGPU quando necessário)
  const score =
    (ramOk ? 1 : 0.5) +
    (vramOk ? 1 : 0.3) +
    (cpuOk ? 1 : 0.4) +
    (diskOk ? 0.2 : 0);

  if (score >= 3.2) {
    return {
      performance: "smooth" as Performance,
      performanceNote: "Roda ultra 60+FPS com folga",
    };
  }

  if (score >= 2) {
    return {
      performance: "limited" as Performance,
      performanceNote: "Roda médio/alto 45-60FPS",
    };
  }

  return {
    performance: "limited" as Performance,
    performanceNote: "Baixo/médio 30FPS, ajustes necessários",
  };
}
