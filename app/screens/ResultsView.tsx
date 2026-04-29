import { Cpu, HardDrive, MemoryStick, Monitor } from "lucide-react";
import { FilterType, Game, Specs } from "../types";
import GameCard from "../components/GameCard";
import SpecCard from "../components/SpecCard";
import GameDetails from "../components/GameDetails";
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import ErrorButton from "../components/ErrorButton";

interface Props {
  specs: Specs;
  games: Game[];
  filteredGames: Game[];
  filter: FilterType;
  savedIds: Set<string>;
  onFilterChange: (f: FilterType) => void;
  onToggleSave: (game: Game) => void;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "smooth", label: "🟢 Liso" },
  { value: "limited", label: "🟠 Limitado" },
];

export default function ResultsView({
  specs,
  games,
  filteredGames,
  filter,
  savedIds,
  onFilterChange,
  onToggleSave,
}: Props) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  return (
    <div className="flex flex-col gap-6 pt-8">
      {/* especificações */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2.5">
        <SpecCard
          icon={<Cpu size={13} />}
          label="Processador"
          value={specs.cpu.brand.replace(/\(R\)|\(TM\)/g, "").trim()}
        />
        <SpecCard
          icon={<MemoryStick size={13} />}
          label="RAM"
          value={`${specs.ram.total} GB`}
        />
        <SpecCard
          icon={<Monitor size={13} />}
          label="GPU"
          value={specs.gpu.model || "Integrada"}
        />
        <SpecCard
          icon={<HardDrive size={13} />}
          label="Armazenamento"
          value={`${specs.disk.totalGB} GB`}
        />
      </div>

      {/* input para busca de algum jogo específico */}
      <SearchBar specs={specs} games={games} />

      {/* filtros */}
      <div className="flex flex-wrap items-center px-6 justify-between gap-3">
        <span className="font-mono text-muted">
          <p className="text-[#f5f5f5] font-semibold text-xl">
            Recomendações rápidas
          </p>
          <p className="text-sm">{games.length} jogos encontrados</p>
        </span>

        <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onFilterChange(value)}
              className={`cursor-pointer rounded-md px-3.5 py-1.25 text-xs font-medium transition-all
              ${
                filter === value
                  ? "bg-surface2 text-fg"
                  : "bg-transparent text-muted hover:text-fg"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* grid de jogos */}
      <div className="grid grid-cols-4 gap-10 place-items-center w-[95%] mx-auto">
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            saved={savedIds.has(game.id)}
            onSave={() => onToggleSave(game)}
            onClick={setSelectedGame}
          />
        ))}
      </div>

      {selectedGame && (
        <GameDetails
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}

      <div className="py-6 px-10">
        <p className="text-sm text-muted">
          Encontrou um erro ou quer dar um feedback/sugestão?
        </p>

        <ErrorButton />
      </div>
    </div>
  );
}
