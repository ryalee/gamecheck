import { Cpu, RotateCcw, Star } from "lucide-react";
import Image from "next/image";

interface Props {
  showActions: boolean;
  savedCount: number;
  savedPanelOpen: boolean;
  onReset: () => void;
  onToggleSaved: () => void;
}

export default function Header({
  showActions,
  savedCount,
  savedPanelOpen,
  onReset,
  onToggleSaved,
}: Props) {
  return (
    <header className="sticky top-0 py-4 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-13 max-w-275 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.25 text-[15px] font-semibold tracking-tight text-fg">
          <Image
            src={"/logo.webp"}
            alt="Logo"
            width={50}
            height={50}
            className="w-auto h-auto"
          />
          <p className="text-xl">Tá Rodando?</p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-border bg-transparent px-2.5 py-1.5 text-xs text-muted transition-all hover:border-border-hover hover:text-fg"
            >
              <RotateCcw size={13} />
              Reanalisar
            </button>
            <button
              onClick={onToggleSaved}
              className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border bg-transparent transition-all
                ${
                  savedPanelOpen
                    ? "border-yellow-400/40 text-yellow-400"
                    : "border-border text-muted hover:border-yellow-400/40 hover:text-yellow-400"
                }`}
            >
              <Star size={13} fill={savedPanelOpen ? "currentColor" : "none"} />
              {savedCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-accent px-0.75 py-0 font-mono text-[9px] font-bold text-white">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
