import { ChevronRight } from 'lucide-react';

interface Props {
  onAnalyze: () => void;
}

export default function LandingView({ onAnalyze }: Props) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 pb-16 pt-24 text-center sm:pt-25">
      {/* Badge */}
      <span className="inline-flex items-center rounded-full border border-accent px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-accent opacity-85">
        Compatibilidade de jogos
      </span>

      {/* Title */}
      <h1 className="text-[clamp(38px,6vw,64px)] font-bold leading-[1.1] tracking-[-0.04em] text-fg">
        Descubra quais
        <br />
        <em className="gradient-text not-italic">jogos rodam</em>
        <br />
        no seu PC
      </h1>

      {/* Subtitle */}
      <p className="max-w-110 text-[15px] leading-[1.65] text-muted">
        Analisamos suas configurações e buscamos jogos compatíveis,
        <br />
        com indicação de desempenho esperado.
      </p>

      {/* CTA */}
      <button
        onClick={onAnalyze}
        className="mt-1 flex cursor-pointer items-center gap-2 rounded-[10px] bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_32px_rgba(124,106,247,0.35)] transition-all hover:-translate-y-px hover:bg-accent-hover hover:shadow-[0_0_48px_rgba(124,106,247,0.5)] active:translate-y-0"
      >
        Analisar configurações
        <ChevronRight size={16} />
      </button>

      {/* Hints */}
      <div className="mt-2 flex flex-wrap justify-center gap-5">
        {['🟢 Roda em ultra', '🟠 Roda com limitações', '⭐ Salve sua lista'].map((hint) => (
          <span key={hint} className="text-xs text-muted">{hint}</span>
        ))}
      </div>
    </div>
  );
}
