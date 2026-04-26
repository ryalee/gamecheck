'use client';

import { useState, useEffect } from 'react';
import { AppState, FilterType, Game, Specs } from '../types';

const SCAN_STEPS = [
  'Lendo CPU...',
  'Verificando memória RAM...',
  'Detectando placa de vídeo...',
  'Coletando dados do sistema...',
  'Analisando configurações...',
];

const STORAGE_KEY = 'gamecheck-saved';

export function useGameCheck() {
  const [state, setState] = useState<AppState>('idle');
  const [specs, setSpecs] = useState<Specs | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [errorMsg, setErrorMsg] = useState('');
  const [scanStep, setScanStep] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedGames, setSavedGames] = useState<Game[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const data: Game[] = JSON.parse(stored);
    setSavedIds(new Set(data.map((g) => g.id)));
    setSavedGames(data);
  }, []);

  async function analyze() {
    setState('scanning');
    setScanStep(0);

    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setScanStep(i);
      await new Promise((r) => setTimeout(r, 500));
    }

    try {
      const specsRes = await fetch('/api/specs');
      const specsData = await specsRes.json();
      if (!specsData.success) throw new Error(specsData.error);

      setSpecs(specsData.specs);
      setState('loading');

      const gamesRes = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specs: specsData.specs }),
      });
      const gamesData = await gamesRes.json();
      if (!gamesData.success) throw new Error(gamesData.error);

      setGames(gamesData.games);
      setState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido');
      setState('error');
    }
  }

  function reset() {
    setState('idle');
    setGames([]);
    setSpecs(null);
    setFilter('all');
  }

  function toggleSave(game: Game) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      const nextGames = next.has(game.id)
        ? savedGames.filter((g) => g.id !== game.id)
        : [...savedGames, game];

      next.has(game.id) ? next.delete(game.id) : next.add(game.id);

      setSavedGames(nextGames);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextGames));
      return next;
    });
  }

  const filteredGames = games.filter(
    (g) => filter === 'all' || g.performance === filter
  );

  return {
    state,
    specs,
    games,
    filteredGames,
    filter,
    setFilter,
    errorMsg,
    scanStep,
    scanSteps: SCAN_STEPS,
    savedIds,
    savedGames,
    analyze,
    reset,
    toggleSave,
  };
}
