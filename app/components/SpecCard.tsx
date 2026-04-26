interface Props {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export default function SpecCard({ icon, label, value }: Props) {
  return (
    <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-surface px-3.5 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-accent-dim text-accent">
        {icon}
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
          {label}
        </div>
        <div className="max-w-35 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-fg">
          {value}
        </div>
      </div>
    </div>
  );
}
