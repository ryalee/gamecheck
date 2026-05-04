export function calculatePerformance(game: any, specs: any) {
  const ramOk = specs.ram.total >= game.minReqs.ram;
  const vramOk = specs.gpu.vram >= game.minReqs.vram;
  const cpuOk = specs.cpu.cores >= 4 || specs.cpu.speed >= 3.0; // Cores/speed básica
  const diskOk = specs.disk.totalGB >= 50;

  // Mais preciso: considera CPU + múltiplos fatores
  const score =
    (ramOk ? 1 : 0.5) +
    (vramOk ? 1 : 0.3) +
    (cpuOk ? 1 : 0.4) +
    (diskOk ? 0.2 : 0);

  if (score >= 3.2) {
    return {
      performance: "smooth",
      performanceNote: "Roda ultra 60+FPS com folga",
    };
  }

  if (score >= 2) {
    return {
      performance: "limited",
      performanceNote: "Roda médio/alto 45-60FPS",
    };
  }

  return {
    performance: "limited",
    performanceNote: "Baixo/médio 30FPS, ajustes necessários",
  };
}
