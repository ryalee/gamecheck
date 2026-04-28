import { div } from "framer-motion/client";
import { Game } from "../types";

interface Props {
  game: Game;
  onClose: () => void;
}

export default function GameDetails({ game, onClose }: Props) {
  if (!game) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          ✕
        </button>

        {/* capa */}
        {game.coverUrl && (
          <div className="w-full h-52 mb-4 overflow-hidden rounded-xl">
            <img
              src={game.coverUrl}
              alt={game.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* info */}
        <h2 className="text-xl font-bold mb-1">{game.title}</h2>
        <p className="text-sm text-muted mb-2">
          {game.developer} • {game.year}
        </p>

        <p className="text-sm text-white/80 mb-4">{game.description}</p>

        {/* performance */}
        <div className="mb-4">
          <span
            className={`px-3 py-1 text-xs rounded-full ${
              game.performance === "smooth"
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {game.performanceNote}
          </span>
        </div>

        {/* tags */}
        <div className="flex gap-2 flex-wrap mb-6">
          {game.tags.map((tag) => (
            <span key={tag} className="text-xs bg-white/5 px-2 py-1 rounded-md">
              {tag}
            </span>
          ))}
        </div>

        {/* botão */}
        {game.stores && (
          <div className="flex flex-col items-center">
            <div className="flex gap-2 justify-center text-center w-full">
              <a
                href={game.stores.nuuvem}
                target="_blank"
                className="bg-[#089fcf] p-3 font-semibold w-[35%] items-center gap-2 rounded-md flex"
              >
                <img src="/nuuvem.webp" alt="ver na Nuuvem" className="w-12.5 h-12.5"/>
                <p className="text-sm">Ver na Nuuvem</p>
              </a>

              <a
                href={game.stores.steam}
                target="_blank"
                className="bg-[#1f2941] p-3 font-semibold w-[35%] items-center gap-2 rounded-md flex"
              >
                <img src="/steam.webp" alt="ver na Steam" className="w-12.5 h-12.5"/>
                <p className="text-sm">Ver na Steam</p>
              </a>

              <a
                href={game.stores.epic}
                target="_blank"
                className="bg-[#363435] p-2 font-semibold w-[35%] items-center gap-2 rounded-md flex"
              >
                <img src="/epic-games.webp" alt="ver na Epic Games" className="w-12.5 h-12.5"/>
                <p className="text-sm">Ver na Epic Games</p>
              </a>
            </div>

            <p className="text-xs text-muted text-center mt-4">
              ⚠️ <span className="font-bold">Aviso:</span> pode ser que{" "}
              {game.title} não esteja disponível nessas lojas. Recomendamos que
              pesquise manualmente para evitar possiveis erros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
