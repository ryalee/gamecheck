import { Search, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Game } from "../types";

interface Props {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = "Buscar...",
}: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // esc pra limpar
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
        className={`relative flex ${focused ? "ring-2 ring-accent ring-opacity-50" : ""}`}
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
          }}
          onFocus={() => setFocused(true)}
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
      </div>

      <p className="mt-1 text-xs text-muted text-center">
        Digite o nome do jogo corretamente para obter resultados precisos. Ex:
        "The Witcher 3", "Cyberpunk 2077", "GTA V"...
      </p>
    </form>
  );
}
