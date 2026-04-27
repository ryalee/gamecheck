export function calculatePerformance(game: any, specs: any) {
  const ramOk = specs.ram.total >= game.minReqs.ram;
  const vramOk = specs.gpu.vram >= game.minReqs.vram;

  if (ramOk && vramOk) {
    return {
      performance: "smooth",
      performanceNote: "Roda em ultra 60fps",
    };
  }

  if (specs.ram.total >= game.minReqs.ram * 0.7) {
    return {
      performance: "limited",
      performanceNote: "Roda no médio/baixo",
    };
  }

  return {
    performance: "limited",
    performanceNote: "Pode travar em alguns momentos",
  };
}
