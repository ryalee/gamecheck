import { Search, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Game } from "../types";

interface Props {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  suggestions?: Game[];
  onSuggestionClick?: (game: Game) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = "Buscar jogo específico (ex: GTA V)...",
}: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = useCallback(
    (game: Game) => {
      setQuery(game.title);
      setShowSuggestions(false);
      onSearch(game.title);
    },
    [onSearch],
  );

  // ESC para limpar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focused) {
        clearSearch();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focused]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto">
      <div
        className={`relative flex w-full ${focused ? "ring-2 ring-accent ring-opacity-50" : ""}`}
      >
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-surface px-10 py-3 pr-12 text-fg placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-30 transition-all text-base"
          disabled={isLoading}
        />

        {query && !isLoading && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-fg transition-colors"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="spin-ring h-4 w-4 border-2 border-accent border-t-transparent rounded-full" />
          ) : (
            <Search size={16} className="text-accent" />
          )}
        </button>
      </div>

      {showSuggestions && query.length > 2 && (
        <p className="absolute top-full left-0 right-0 mt-1 text-xs text-muted italic bg-surface p-2 rounded-b-lg">
          Digite mais para sugestões...
        </p>
      )}

      <p className="mt-1 text-xs text-muted text-center">
        Analisa se roda no seu PC com base nos requisitos mínimos
      </p>
    </form>
  );
}
