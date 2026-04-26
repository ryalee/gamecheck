interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorView({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 pb-16 pt-24 text-center">
      <span className="inline-flex items-center rounded-full border border-red-400 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-red-400 opacity-85">
        Erro
      </span>
      <h1 className="text-[28px] font-bold leading-[1.1] tracking-[-0.04em] text-fg">
        Algo deu errado
      </h1>
      <p className="max-w-110 text-[15px] leading-[1.65] text-muted">{message}</p>
      <button
        onClick={onRetry}
        className="mt-1 flex cursor-pointer items-center gap-2 rounded-[10px] bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_32px_rgba(124,106,247,0.35)] transition-all hover:-translate-y-px hover:bg-accent-hover active:translate-y-0"
      >
        Tentar novamente
      </button>
    </div>
  );
}
