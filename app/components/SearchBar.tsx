import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 3) {
      onSearch(trimmed);
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
    <form
      ref={containerRef}
      onSubmit={handleSubmit}
      className="relative w-full mx-auto"
    >
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
          onBlur={(e) => {
            // não fechar quando o blur for causado por clique nas sugestões
            const next = e.relatedTarget as Node | null;
            const container =
              (containerRef.current as unknown as Node | null) ?? null;
            if (container && next && container.contains(next)) return;
            setFocused(false);
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
      </div>
    </form>
  );
}
