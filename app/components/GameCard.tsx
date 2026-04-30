import { Star } from "lucide-react";
import { Game } from "../types";
import GameCover from "./GameCover";

interface Props {
  game: Game;
  onClick: (game: Game) => void;
}

export default function GameCard({ game, onClick }: Props) {
  const isSmooth = game.performance === "smooth";

  return (
    <div
      onClick={() => onClick(game)}
      className="card-hover flex flex-col overflow-hidden rounded-xl border border-border bg-surface w-[80%] cursor-pointer"
    >
      <GameCover game={game} />

      <div className="flex flex-1 flex-col gap-3 p-3">
        {/* header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold tracking-tight text-fg">
              {game.title}
            </h3>

            <span className="mt-0.5 block text-[11px] text-muted">
              {game.developer} · {game.year}
            </span>
          </div>
        </div>

        {/* descrição */}
        <p className="clamp-2 text-[12px] leading-[1.55] text-muted">
          {game.description}
        </p>

        {/* performance */}
        <div
          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium leading-snug
          ${
            isSmooth
              ? "border-green-500/15 bg-green-500/8 text-smooth"
              : "border-amber-500/15 bg-amber-500/8 text-limited"
          }`}
        >
          <span>{isSmooth ? "🟢" : "🟠"}</span>
          <span>{game.performanceNote}</span>
        </div>

        {/* tags */}
        <div className="mt-auto flex flex-wrap gap-1">
          {game.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border bg-surface2 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.03em] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
