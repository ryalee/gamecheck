import { Cpu, HardDrive, MemoryStick, Monitor } from "lucide-react";
import { FilterType, Game, Specs } from "../types";
import GameCard from "../components/GameCard";
import SpecCard from "../components/SpecCard";
import GameDetails from "../components/GameDetails";
import SearchBar from "../components/SearchBar";
import ErrorButton from "../components/ErrorButton";
import { useState } from "react";

interface Props {
  specs: Specs;
  games: Game[];
  filteredGames: Game[];
  searchedGames: Game[];
  searchLoading: boolean;
  searchQuery: string;
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
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
  searchedGames,
  searchLoading,
  searchQuery,
  filter,
  onFilterChange,
  onSearch,
  onClearSearch,
}: Props) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // separação primeiro os jogos que rodam lisos, depois os limitados
  const smoothGames = filteredGames.filter((g) => g.performance === "smooth");

  const limitedGames = filteredGames.filter((g) => g.performance === "limited");

  return (
    <div className="flex flex-col gap-6 pt-8">
      {/* especificações */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] w-[90%] gap-2 mx-auto">
        <span>
        <SpecCard
          icon={<Cpu size={13} />}
          label="Processador"
          value={specs.cpu.brand.replace(/\(R\)|\(TM\)/g, "").trim()}
        />
        </span>
        
        <span>
          <SpecCard
            icon={<MemoryStick size={13} />}
            label="RAM"
            value={`${specs.ram.total} GB`}
          />
        </span>

        <span>
          <SpecCard
            icon={<Monitor size={13} />}
            label="GPU"
            value={specs.gpu.model || "Integrada"}
          />

          <p className="mt-1 text-[11px] text-muted text-center">⚠️ O resultado pode ser impreciso em caso de placa integrada</p>
        </span>
        
        <span>
          <SpecCard
            icon={<HardDrive size={13} />}
            label="Armazenamento"
            value={`${specs.disk.totalGB} GB ${specs.disk.type || "HD"}`}
          />
        </span>
      </div>

      {/* busca manual */}
      {specs && (
        <div className="w-full mx-auto px-6">
          <SearchBar onSearch={onSearch} isLoading={searchLoading} />
          {searchQuery && !searchLoading && (
            <button
              onClick={onClearSearch}
              className="mt-2 ml-auto block text-sm text-accent hover:text-accent-hover transition-colors"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}

      {/* Resultados da busca */}
      {searchedGames.length > 0 && (
        <div className="w-[95%] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              🔍 Será que "{searchQuery}" roda no seu PC?
            </h2>
            <button
              onClick={onClearSearch}
              className="text-sm text-muted hover:text-fg px-2 py-1 rounded transition-colors"
            >
              Fechar
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">
            {searchedGames.map((game, index) => (
              <GameCard
                key={`${game.id || game.title}-${index}`}
                game={game}
                onClick={setSelectedGame}
              />
            ))}
          </div>
        </div>
      )}

      {/* filtros */}
      <div className="flex flex-wrap items-center px-6 justify-between gap-3">
        <span className="font-mono text-muted">
          <p className="text-[#f5f5f5] font-semibold text-xl">
            Algumas das melhores opções
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

      <div className="w-[95%] mx-auto flex flex-col gap-10">
        {smoothGames.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              🟢 Roda liso no seu PC
            </h2>

            <div className="grid grid-cols-4 gap-10 place-items-center">
              {smoothGames.map((game, index) => (
                <GameCard
                  key={`${game.id || game.title}-${index}`}
                  game={game}
                  onClick={setSelectedGame}
                />
              ))}
            </div>
          </div>
        )}

        {filter !== "smooth" && limitedGames.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 opacity-70">
              ⚠️ Roda, mas com limitações
            </h2>

            <div className="grid grid-cols-4 gap-10 place-items-center opacity-80">
              {limitedGames.map((game, index) => (
                <GameCard
                  key={`${game.id || game.title}-${index}`}
                  game={game}
                  onClick={setSelectedGame}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* modal */}
      {selectedGame && (
        <GameDetails
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}

      {/* feedback */}
      <div className="py-6 px-10">
        <p className="text-sm text-muted">
          Encontrou um erro ou quer dar um feedback/sugestão?
        </p>

        <ErrorButton />
      </div>
    </div>
  );
}
