import { Cpu, Layers } from 'lucide-react';

interface ScanningProps {
  scanStep: number;
  scanSteps: string[];
}

export function ScanningView({ scanStep, scanSteps }: ScanningProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-30">
      {/* Ring */}
      <div className="spin-ring relative flex h-18 w-18 items-center justify-center rounded-full border border-border-hover text-accent">
        <div className="scan-aura absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(124,106,247,0.12)_0%,transparent_70%)]" />
        <Cpu size={26} />
      </div>

      <p className="text-[15px] font-medium text-fg">{scanSteps[scanStep]}</p>

      {/* Steps list */}
      <div className="mt-2 flex flex-col gap-2">
        {scanSteps.map((step, i) => (
          <div key={step} className={`flex items-center gap-2 text-xs transition-colors duration-300 ${i <= scanStep ? 'text-fg' : 'text-muted'}`}>
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300
              ${i <= scanStep ? 'bg-accent shadow-[0_0_8px_var(--color-accent)]' : 'bg-border-hover'}`}
            />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-30">
      <div className="spin-ring-amber relative flex h-18 w-18 items-center justify-center rounded-full border border-border-hover text-limited">
        <div className="scan-aura absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.10)_0%,transparent_70%)]" />
        <Layers size={26} />
      </div>
      <p className="text-[15px] font-medium text-fg">Buscando jogos compatíveis...</p>
      <p className="text-[13px] text-muted">Consultando base de dados de requisitos</p>
    </div>
  );
}
