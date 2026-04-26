export interface Specs {
  cpu: { brand: string; cores: number; speed: number };
  ram: { total: number };
  gpu: { model: string; vram: number };
  os: { platform: string; distro: string };
  disk: { totalGB: number };
}

export interface Game {
  id: string;
  title: string;
  genre: string;
  year: number;
  description: string;
  developer: string;
  coverColor: string;
  storeUrl: string;
  coverUrl: string;
  performance: 'smooth' | 'limited';
  performanceNote: string;
  tags: string[];
  minReqs: { cpu: string; ram: number; gpu: string; vram: number };
}

export type AppState = 'idle' | 'scanning' | 'loading' | 'done' | 'error';
export type FilterType = 'all' | 'smooth' | 'limited';
