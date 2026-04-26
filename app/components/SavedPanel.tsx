import { X } from "lucide-react";
import { Game } from "../types";

interface Props {
  games: Game[];
  onRemove: (game: Game) => void;
  onClose: () => void;
}

export default function SavedPanel({ games, onRemove, onClose }: Props) {
  return (
    <div className="panel-slide border-b border-border bg-surface">
      <div className="mx-auto max-w-275 px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">Jogos salvos</h2>
          <button
            onClick={onClose}
            className="flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-border bg-transparent px-2.5 py-1.5 text-xs text-muted transition-all hover:border-border-hover hover:text-fg"
          >
            <X size={14} />
          </button>
        </div>

        {games.length === 0 ? (
          <p className="text-[13px] text-muted">Nenhum jogo salvo ainda.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-surface2 px-2.5 py-2"
              >
                <div
                  className="h-6 w-6 shrink-0 rounded-[5px] opacity-80"
                  style={{ background: game.coverColor }}
                />
                <div className="min-w-0 flex-1">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-fg">
                    {game.title}
                  </span>
                  <span className="text-[11px] text-muted">
                    {game.genre} · {game.performance === "smooth" ? "🟢" : "🟠"}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(game)}
                  className="flex cursor-pointer items-center rounded-[7px] border border-border bg-transparent px-1.5 py-1 text-xs text-muted transition-all hover:border-border-hover hover:text-fg"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
