"use client";

import { useState } from "react";

export default function GameSearch({ specs, games }: any) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query) return;

    // tenta encontrar nos jogos já analisados
    const existing = games.find((g: any) =>
      g.title.toLowerCase().includes(query.toLowerCase()),
    );

    if (existing) {
      setResult({
        title: existing.title,
        performance: existing.performance,
        reason: existing.performanceNote,
        fpsEstimate: existing.performance === "smooth" ? "60fps+" : "30-60fps",
        source: "local", // 🔥 importante
      });

      return;
    }

    // fallback pra IA
    setLoading(true);

    const res = await fetch("/api/search-game", {
      method: "POST",
      body: JSON.stringify({ title: query, specs }),
    });

    const data = await res.json();

    setResult({
      ...data,
      source: "ai", // 🔥 importante
    });

    setLoading(false);
  }

  return (
    <div className="mb-8">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite um jogo..."
          className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg"
        />

        <button onClick={handleSearch} className="bg-accent px-4 rounded-lg">
          Buscar
        </button>
      </div>

      {loading && <p className="mt-2 text-sm">Analisando...</p>}

      {result && (
        <div className="mt-4 p-4 border border-border rounded-lg bg-surface">
          <h3 className="font-bold">{result.title}</h3>

          <p>
            Performance:{" "}
            {result.performance === "smooth"
              ? "🟢 Liso"
              : result.performance === "limited"
                ? "🟠 Limitado"
                : "🔴 Não roda"}
          </p>

          <p>{result.reason}</p>
          <p className="text-sm text-muted">{result.fpsEstimate}</p>
        </div>
      )}
    </div>
  );
}
