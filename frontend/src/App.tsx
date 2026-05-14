import React from 'react';
import TopFailureWidget from './components/TopFailureWidget';

/**
 * App.tsx
 *
 * Hosts the TopFailureWidget and provides demo controls to preview all three
 * UI states (loading, populated, empty) without requiring a live backend.
 *
 * In production, remove the DemoControls and just render <TopFailureWidget />.
 */

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Support Analytics Dashboard</h1>
        <p>Account manager view — Customer failure pattern intelligence</p>
      </header>

      <main>
        <TopFailureWidget />
      </main>
    </div>
  );
}
