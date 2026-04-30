"use client";

import { useState, useCallback } from "react";

export default function GameSearch({ specs, games }: any) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Otimizado: uso de useCallback para evitar recriações desnecessárias
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    const searchTerm = query.toLowerCase().trim();

    // tenta encontrar nos jogos já analisados (busca otimizada)
    const existing = games.find((g: any) =>
      g.title.toLowerCase().includes(searchTerm),
    );

    if (existing) {
      setResult({
        title: existing.title,
        performance: existing.performance,
        reason: existing.performanceNote,
        fpsEstimate: existing.performance === "smooth" ? "60fps+" : "30-60fps",
        coverUrl: existing.coverUrl || null,
        source: "local",
      });

      return;
    }

    // fallback pra IA
    setLoading(true);

    try {
      const res = await fetch("/api/search-game", {
        method: "POST",
        body: JSON.stringify({ title: query, specs }),
      });

      const data = await res.json();

      setResult({
        ...data,
        source: "ai",
      });
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  }, [query, specs, games]);

  // Handler para tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 w-[90%] self-center mx-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite um jogo..."
            className="flex-1 p-4 bg-surface border border-border rounded-lg focus:outline-0"
          />

          <button
            onClick={handleSearch}
            className="bg-accent px-4 rounded-lg cursor-pointer hover:bg-accent-hover transition-all duration-300"
          >
            Buscar
          </button>

          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResult(null);
              }}
              className="bg-surface border border-border px-4 rounded-lg cursor-pointer hover:bg-border transition-all duration-300"
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        <p className="text-sm text-muted mx-20 font-semibold">
          Lembrando: podem ocorrer inúmeras variações, principalmente em casos de GPU integrada.
        </p>
      </div>

      {loading && <p className="mt-2 text-sm flex mx-auto w-[60%]">Analisando...</p>}

      {result && (
        <div className="mt-4 p-4 border border-border rounded-lg bg-surface w-[60%] mx-auto flex gap-4">
          {result.coverUrl && (
            <img
              src={result.coverUrl}
              alt={result.title}
              className="w-24 h-32 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h3 className="font-bold">{result.title}</h3>

            <p>
              Performance:{" "}
              {result.performance === "smooth"
                ? "🟢 Liso"
                : result.performance === "limited"
                  ? "🟠 Limitado"
                  : "🔴 Nem tente"}
            </p>

            <p>{result.reason}</p>
            <p className="text-sm text-muted">{result.fpsEstimate}</p>
          </div>
        </div>
      )}
    </div>
  );
}
