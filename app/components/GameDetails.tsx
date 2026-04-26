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
        {game.storeUrl && (
          <a
            href={game.storeUrl}
            target="_blank"
            className="block w-full text-center bg-purple-600 hover:bg-purple-700 transition py-2 rounded-lg font-medium"
          >
            Ver na loja
          </a>
        )}
      </div>
    </div>
  );
}
