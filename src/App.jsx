import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Learn from './pages/Learn.jsx';
import Games from './pages/Games.jsx';
import { RandomPage, TrapsPage, ReviewsPage, MistakesPage, StatsPage } from './pages/Training.jsx';
import { AuditPage, PlanPage } from './pages/Content.jsx';
import { useStore, dueCards } from './lib/store.js';

const TABS = [
  ['dashboard', 'Accueil'],
  ['black', 'Noirs'],
  ['white', 'Blancs'],
  ['reviews', 'Révisions & examens'],
  ['mistakes', 'Points faibles'],
  ['random', 'Adversaire'],
  ['traps', 'Pièges'],
  ['games', 'Mes parties'],
  ['stats', 'Stats'],
  ['plan', 'Programme'],
  ['audit', 'Méthode'],
];

export default function App() {
  const [tab, setTab] = useState(() => (location.hash.slice(1) && TABS.some(([k]) => k === location.hash.slice(1)) ? location.hash.slice(1) : 'dashboard'));
  const state = useStore();
  const due = dueCards(state).length;
  useEffect(() => { location.hash = tab; window.scrollTo(0, 0); }, [tab]);
  useEffect(() => {
    const f = () => { const h = location.hash.slice(1); if (TABS.some(([k]) => k === h)) setTab(h); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" onClick={() => setTab('dashboard')}><span className="logo">♞</span> Chess Master <span>Academy</span></div>
        <nav className="tabs">
          {TABS.map(([k, l]) => (
            <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
              {l}{k === 'reviews' && due > 0 ? <span className="pill">{due}</span> : null}
            </button>
          ))}
        </nav>
        <div className="elo-chip" title="Elo saisi / objectif">{state.profile.elo} → {state.profile.goal}</div>
      </header>
      <div className="content">
        {tab === 'dashboard' && <Dashboard go={setTab} />}
        {tab === 'white' && <Learn key="w" side="w" />}
        {tab === 'black' && <Learn key="b" side="b" />}
        {tab === 'random' && <RandomPage />}
        {tab === 'traps' && <TrapsPage />}
        {tab === 'mistakes' && <MistakesPage />}
        {tab === 'reviews' && <ReviewsPage />}
        {tab === 'games' && <Games />}
        {tab === 'stats' && <StatsPage />}
        {tab === 'plan' && <PlanPage />}
        {tab === 'audit' && <AuditPage go={setTab} />}
      </div>
      <footer className="foot">
        chess.js · chessground (pièces cburnett, CC BY-SA) · Stockfish 19 lite (WASM) — évaluations toujours calculées, jamais inventées · progression enregistrée dans ce navigateur.
      </footer>
    </div>
  );
}
