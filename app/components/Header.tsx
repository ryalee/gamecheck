import { Cpu, RotateCcw } from "lucide-react";
import Image from "next/image";

interface Props {
  showActions: boolean;
  onReset: () => void;
}

export default function Header({
  showActions,
  onReset,
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

        {showActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-border bg-transparent px-2.5 py-1.5 text-xs text-muted transition-all hover:border-border-hover hover:text-fg"
            >
              <RotateCcw size={13} />
              Reanalisar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
