'use client';

import { useState } from 'react';
import { useGameCheck } from './hooks/useGameCheck';
import Header from './components/Header';
import SavedPanel from './components/SavedPanel';
import LandingView from './screens/LandingView';
import { ScanningView, LoadingView } from './screens/ScanView';
import ErrorView from './screens/ErrorView';
import ResultsView from './screens/ResultsView';

export default function Page() {
  const [savedPanelOpen, setSavedPanelOpen] = useState(false);
  const gc = useGameCheck();

  return (
    <main>
      <Header
        showActions={gc.state === 'done'}
        savedCount={gc.savedIds.size}
        savedPanelOpen={savedPanelOpen}
        onReset={gc.reset}
        onToggleSaved={() => setSavedPanelOpen((v) => !v)}
      />

      {savedPanelOpen && (
        <SavedPanel
          games={gc.savedGames}
          onRemove={gc.toggleSave}
          onClose={() => setSavedPanelOpen(false)}
        />
      )}

      <div className="content">
        {gc.state === 'idle' && (
          <LandingView onAnalyze={gc.analyze} />
        )}

        {gc.state === 'scanning' && (
          <ScanningView scanStep={gc.scanStep} scanSteps={gc.scanSteps} />
        )}

        {gc.state === 'loading' && (
          <LoadingView />
        )}

        {gc.state === 'error' && (
          <ErrorView message={gc.errorMsg} onRetry={gc.reset} />
        )}

        {gc.state === 'done' && gc.specs && (
          <ResultsView
            specs={gc.specs}
            games={gc.games}
            filteredGames={gc.filteredGames}
            filter={gc.filter}
            savedIds={gc.savedIds}
            onFilterChange={gc.setFilter}
            onToggleSave={gc.toggleSave}
          />
        )}
      </div>
    </main>
  );
}
