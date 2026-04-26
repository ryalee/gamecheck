"use client";

import { useEffect, useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query) {
        setResults([]);
        return;
      }

      const res = await fetch(`/api/search-game?q=${query}`);
      const data = await res.json();

      setResults(data.games);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="bg-red-500">
      <input
        type="text"
        placeholder="Buscar jogo..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />

      {results.length > 0 && (
        <div className="search-results">
          {results.map((game) => (
            <div key={game.id} className="search-item">
              {game.coverUrl && <img src={game.coverUrl} width={40} />}
              <span>{game.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
