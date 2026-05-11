"use client";

import { useRef, useState } from "react";
import { AppState, FilterType, Game, Specs } from "../types";

const SCAN_STEPS = [
  "Lendo CPU...",
  "Verificando memória RAM...",
  "Detectando placa de vídeo...",
  "Coletando dados do sistema...",
  "Analisando configurações...",
];

export function useGameCheck() {
  const [state, setState] = useState<AppState>("idle");
  const [specs, setSpecs] = useState<Specs | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [errorMsg, setErrorMsg] = useState("");
  const [scanStep, setScanStep] = useState(0);
  const [searchedGames, setSearchedGames] = useState<Game[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const searchAbortRef = useRef<AbortController | null>(null);

  async function analyze() {
    setState("scanning");
    setScanStep(0);
    setErrorMsg("");

    // animação fake (UX 🔥)
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setScanStep(i);
      await new Promise((r) => setTimeout(r, 400));
    }

    try {
      // 🔍 pega specs
      const specsRes = await fetch("/api/specs");
      const specsData = await specsRes.json();

      if (!specsData?.success || !specsData?.specs) {
        throw new Error("Erro ao obter specs");
      }

      setSpecs(specsData.specs);
      setState("loading");

      // 🎮 pega jogos
      const gamesRes = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specs: specsData.specs }),
      });

      const gamesData = await gamesRes.json();

      if (!gamesData?.success) {
        throw new Error(gamesData?.error || "Erro ao buscar jogos");
      }

      if (!Array.isArray(gamesData.games)) {
        console.error("Resposta inválida:", gamesData);
        throw new Error("Formato inválido de jogos");
      }

      // ✅ NÃO recalcula performance aqui
      setGames(gamesData.games);

      setState("done");
    } catch (err) {
      console.error("Analyze error:", err);

      setErrorMsg(err instanceof Error ? err.message : "Erro inesperado");
      setState("error");
    }
  }

  async function searchGames(query: string) {
    if (!specs) return;
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 3) {
      setSearchError("Digite pelo menos 3 letras para buscar.");
      setSearchQuery(trimmedQuery);
      setSearchedGames([]);
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setSearchLoading(true);
    setSearchError("");
    setSearchQuery(trimmedQuery);
    setSearchedGames([]);

    try {
      const res = await fetch("/api/search-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery, specs }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("Falha ao buscar jogo no servidor.");
      }

      const data = await res.json();
      if (data.success) {
        setSearchedGames(data.games);
        if (!data.games?.length) {
          setSearchError("Nenhum resultado encontrado para essa busca.");
        }
      } else {
        setSearchedGames([]);
        setSearchError(data.error || "Não foi possível concluir a busca.");
        console.error("Search error:", data.error);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return;
      }
      console.error("Search error:", err);
      setSearchedGames([]);
      setSearchError("Erro inesperado ao buscar jogo. Tente novamente.");
    } finally {
      setSearchLoading(false);
      searchAbortRef.current = null;
    }
  }

  function clearSearch() {
    setSearchedGames([]);
    setSearchQuery("");
    setSearchError("");
    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
  }

  function reset() {
    setState("idle");
    setGames([]);
    setSpecs(null);
    setFilter("all");
    setErrorMsg("");
    clearSearch();
  }

  // 🎯 filtros
  const filteredGames = games.filter(
    (g) => filter === "all" || g.performance === filter,
  );

  // 💎 ordenação inteligente (smooth primeiro)
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (a.performance === "smooth" && b.performance !== "smooth") return -1;
    if (a.performance !== "smooth" && b.performance === "smooth") return 1;
    return 0;
  });

  return {
    state,
    specs,
    games,
    filteredGames: sortedGames,
    searchedGames,
    searchLoading,

    searchQuery,
    searchError,
    filter,
    setFilter,
    errorMsg,
    scanStep,
    scanSteps: SCAN_STEPS,
    analyze,
    searchGames,

    clearSearch,
    reset,
  };
}
