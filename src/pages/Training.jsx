import { useState } from 'react';
import Trainer from '../components/Trainer.jsx';
import TrapTrainer from '../components/TrapTrainer.jsx';
import PlayGame, { ExerciseTrainer } from '../components/PlayGame.jsx';
import { TRAPS, CATEGORIES, THEMES } from '../data/traps.js';
import { LEVELS } from '../lib/engine.js';
import { useStore, update, dueCards, masteryOf, MASTERY, STATUS, statusOf, priorityOf, recentErrors } from '../lib/store.js';
import { fr, moveListText, CHAPTER, nodeAt, cardInfo, userPositions } from '../lib/repo.js';
import { buildExam } from '../lib/exam.js';

const Seg = ({ value, options, onChange }) => (
  <div className="seg">{options.map(([k, l]) => <button key={k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>)}</div>
);
const SIDES = [['w', 'Blancs'], ['b', 'Noirs']];

// ------------------------------------------------------------------ Entraînement aléatoire
export function RandomPage() {
  const state = useStore();
  const [side, setSide] = useState('b');
  const [level, setLevel] = useState(state.settings.level || 1200);
  const [count, setCount] = useState(5);
  const [run, setRun] = useState(null);
  const [play, setPlay] = useState(null);
  if (play) return <PlayGame side={play.side} startMoves={play.moves} onExit={() => setPlay(null)} />;
  if (run) {
    return (
      <Trainer key={run.k} side={run.side} mode="random" title={`Adversaire ${LEVELS[run.level].label}`}
        drills={Array.from({ length: run.count }, () => ({ type: 'random', level: run.level }))}
        onExit={() => setRun(null)} onPlayFrom={(fen, moves) => { setPlay({ side: run.side, moves }); setRun(null); }} />
    );
  }
  return (
    <div className="page narrow">
      <h2>Adversaire imprévisible</h2>
      <p className="lead">L’adversaire pioche dans ton arbre : théorie, coups rares, erreurs typiques, parfois un coup hors théorie. À toi de t’adapter.</p>
      <div className="card form">
        <label>Je joue les <Seg value={side} options={SIDES} onChange={setSide} /></label>
        <label>Niveau simulé (approximatif) <Seg value={level} options={Object.entries(LEVELS).map(([k, v]) => [+k, v.label])} onChange={(v) => { setLevel(v); update((d) => { d.settings.level = v; }); }} /></label>
        <label>Parties <Seg value={count} options={[[3, '3'], [5, '5'], [10, '10']]} onChange={setCount} /></label>
        <button className="btn primary big" onClick={() => setRun({ side, level, count, k: Date.now() })}>▶ Jouer</button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Pièges
export function TrapsPage() {
  const state = useStore();
  const [side, setSide] = useState('all');
  const [cat, setCat] = useState('all');
  const [cur, setCur] = useState(null);
  const list = TRAPS.filter((t) => (side === 'all' || t.side === side) && (cat === 'all' || t.category === cat));
  if (cur) {
    const idx = list.findIndex((t) => t.id === cur);
    const trap = TRAPS.find((t) => t.id === cur);
    return <TrapTrainer trap={trap} onExit={() => setCur(null)} onNextTrap={idx >= 0 && idx + 1 < list.length ? () => setCur(list[idx + 1].id) : null} />;
  }
  return (
    <div className="page">
      <h2>Pièges et erreurs adverses</h2>
      <p className="lead">Ton adversaire vient de se tromper : trouve comment en profiter.</p>
      <div className="row wrap">
        <Seg value={side} options={[['all', 'Tous'], ...SIDES]} onChange={setSide} />
        <Seg value={cat} options={[['all', 'Toutes catégories'], ...Object.entries(CATEGORIES)]} onChange={setCat} />
      </div>
      <div className="trap-grid">
        {list.map((t) => {
          const s = state.traps?.[t.id];
          return (
            <button key={t.id} className="card trap-card" onClick={() => setCur(t.id)}>
              <div className="row between"><span className="tag">{CATEGORIES[t.category]}</span><span className="small muted">{t.side === 'w' ? 'Blancs' : 'Noirs'}</span></div>
              <h4>{s && s.solved ? t.title : `${t.title.split(' : ')[0]} — exercice`}</h4>
              <div className="small muted">{THEMES[t.theme]} · {s ? `${s.solved}/${s.attempts} réussi(s)` : 'à découvrir'}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Révisions + examens
export function ReviewsPage() {
  const state = useStore();
  const [run, setRun] = useState(null);
  const [side, setSide] = useState('b');
  const [size, setSize] = useState(10);
  const [examMode, setExamMode] = useState('guided');
  if (run) return <Trainer key={run.k} side={run.side} mode={run.mode} title={run.title} drills={run.drills} onExit={() => setRun(null)} />;

  const due = dueCards(state);
  const dueSide = (s) => due.filter((c) => c.side === s);
  const startReview = (s) => {
    const cards = dueSide(s).slice(0, 20);
    if (cards.length) setRun({ k: Date.now(), side: s, mode: 'review', title: 'Révisions du jour', drills: cards.map((c) => ({ type: 'card', card: c })) });
  };
  const startExam = () => {
    const cards = buildExam(state, side, size);
    setRun({ k: Date.now(), side, mode: examMode, title: `Examen ${size} positions`, drills: cards.map((c) => ({ type: 'card', card: c })) });
  };
  return (
    <div className="page narrow">
      <h2>Révisions et examens</h2>
      <div className="card">
        <h4>À réviser maintenant</h4>
        {due.length ? (
          <div className="row">
            {SIDES.map(([s, l]) => <button key={s} className="btn primary" disabled={!dueSide(s).length} onClick={() => startReview(s)}>{l} · {dueSide(s).length}</button>)}
          </div>
        ) : <p className="muted small">Rien d’urgent. Lance un examen court ou apprends une ligne.</p>}
        <p className="muted small">Les erreurs récurrentes passent en premier ; une position maîtrisée revient de plus en plus rarement (10 min → J+1 → J+3 → J+7 → J+14 → J+30…).</p>
      </div>
      <div className="card form">
        <h4>Examen adaptatif</h4>
        <p className="small muted">Mélange tes erreurs passées, tes positions fragiles, tes dernières lignes, quelques positions maîtrisées et de nouvelles réponses adverses.</p>
        <label>Répertoire <Seg value={side} options={SIDES} onChange={setSide} /></label>
        <label>Longueur <Seg value={size} options={[[5, '5'], [10, '10'], [20, '20']]} onChange={setSize} /></label>
        <label>Type <Seg value={examMode} options={[['guided', 'Accompagné (indices comptés)'], ['exam', 'Strict (aucune aide)']]} onChange={setExamMode} /></label>
        <button className="btn primary big" onClick={startExam}>▶ Commencer l’examen</button>
      </div>
      {state.exams.length > 0 && (
        <div className="card">
          <h4>Derniers examens</h4>
          {state.exams.slice(0, 8).map((e, i) => (
            <div key={i} className="exam-row small">
              <span>{new Date(e.t).toLocaleDateString('fr-FR')} · {e.side === 'w' ? 'Blancs' : 'Noirs'} · {e.mode === 'exam' ? 'strict' : 'accompagné'}</span>
              <span className="exam-bar"><span className="ok" style={{ flex: e.alone }} /><span className="hint" style={{ flex: e.hinted }} /><span className="ko" style={{ flex: e.errors }} /></span>
              <b>{e.alone}/{e.total}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Mes erreurs (mémoire d'apprentissage)
const TYPES = { err: 'Erreur', inacc: 'Imprécision', hint: 'Indice', exam: 'Examen', 'hors-rep': 'Hors répertoire', unknown: 'Hors répertoire', import: 'Partie importée', solution: 'Solution vue', alt: 'Bonne alternative' };

export function MistakesPage() {
  const state = useStore();
  const [run, setRun] = useState(null);
  const [ex, setEx] = useState(null);
  const [filter, setFilter] = useState(null);
  if (run) return <Trainer key={run.k} side={run.side} mode="review" title="Mes points faibles" drills={run.drills} onExit={() => setRun(null)} />;
  if (ex) return <ExerciseTrainer exercises={ex} onExit={() => setEx(null)} />;
  const now = Date.now();
  const cards = Object.values(state.cards);
  const by = { recurrente: [], fragile: [], areviser: [], maitrisee: [], encours: [] };
  cards.forEach((c) => { const s = statusOf(c, now); (by[s] ||= []).push(c); });
  const totalPos = userPositions('w').length + userPositions('b').length;
  const active = filter || ['recurrente', 'fragile', 'areviser', 'maitrisee'].find((k) => by[k].length) || 'recurrente';
  const list = (by[active] || []).sort((a, b) => priorityOf(b, now) - priorityOf(a, now));
  const weakest = (s) => [...by.recurrente, ...by.fragile, ...by.areviser].filter((c) => c.side === s).sort((a, b) => priorityOf(b, now) - priorityOf(a, now)).slice(0, 15);
  const exercises = state.exercises.filter((e) => !e.done);
  return (
    <div className="page">
      <h2>Mes points faibles</h2>
      <div className="status-grid">
        {[['recurrente', by.recurrente.length], ['fragile', by.fragile.length], ['areviser', by.areviser.length], ['maitrisee', by.maitrisee.length]].map(([k, n]) => (
          <button key={k} className={`status-card st-${k} ${active === k ? 'on' : ''}`} onClick={() => setFilter(k)}><b>{n}</b><span>{STATUS[k]}</span></button>
        ))}
        <div className="status-card st-nouvelle"><b>{totalPos - cards.length}</b><span>{STATUS.nouvelle}s</span></div>
      </div>
      <div className="row">
        {SIDES.map(([s, l]) => <button key={s} className="btn primary" disabled={!weakest(s).length} onClick={() => setRun({ k: Date.now(), side: s, drills: weakest(s).map((c) => ({ type: 'card', card: c })) })}>Travailler mes points faibles ({l})</button>)}
        {exercises.length > 0 && <button className="btn" onClick={() => setEx(exercises)}>Exercices de mes parties ({exercises.length})</button>}
      </div>
      <div className="card">
        <table className="lines small">
          <thead><tr><th>Position</th><th>Attendu</th><th>Tes coups</th><th>Erreurs</th><th>Dernière fois</th></tr></thead>
          <tbody>
            {list.slice(0, 60).map((c) => {
              const errs = recentErrors(c, 365, now);
              const last = [...c.history].reverse().find((h) => h.type !== 'ok') || c.history[c.history.length - 1];
              const played = [...new Set(errs.map((h) => h.played).filter(Boolean))];
              return (
                <tr key={c.key}>
                  <td>{c.label}{last?.reason ? <div className="muted">{last.reason}</div> : null}</td>
                  <td><b>{fr(c.san)}</b></td>
                  <td>{played.length ? played.map(fr).join(', ') : '—'}{c.hints ? <div className="muted">{c.hints} indice(s)</div> : null}</td>
                  <td>{errs.length}</td>
                  <td className="nowrap">{last ? `${TYPES[last.type] || last.type}, ${new Date(last.t).toLocaleDateString('fr-FR')}` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!list.length && <p className="muted">Aucune position dans cette catégorie.</p>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Statistiques
export function StatsPage() {
  const state = useStore();
  const days = Object.keys(state.daily).sort().slice(-30);
  const maxR = Math.max(1, ...days.map((d) => state.daily[d].reviews));
  const cards = Object.values(state.cards);
  const dist = [0, 0, 0, 0, 0, 0];
  cards.forEach((c) => dist[masteryOf(c)]++);
  const byChapter = {};
  cards.forEach((c) => { const b = (byChapter[c.chapterId] ||= { att: 0, succ: 0, n: 0, err: 0 }); b.att += c.attempts; b.succ += c.successes; b.n++; b.err += c.errors || 0; });
  const rows = Object.entries(byChapter).map(([id, b]) => ({ id, title: CHAPTER[id]?.title || id, side: CHAPTER[id]?.side, rate: b.att ? b.succ / b.att : 0, n: b.n, att: b.att, err: b.err })).sort((a, b) => a.rate - b.rate);
  const att = cards.reduce((s, c) => s + c.attempts, 0);
  const succ = cards.reduce((s, c) => s + c.successes, 0);
  return (
    <div className="page">
      <h2>Statistiques</h2>
      <div className="kpis">
        <div className="kpi"><span>Positions travaillées</span><b>{cards.length}</b></div>
        <div className="kpi"><span>Réussite</span><b>{att ? Math.round((succ / att) * 100) : 0}%</b></div>
        <div className="kpi"><span>Examens</span><b>{state.exams.length}</b></div>
        <div className="kpi"><span>Minutes</span><b>{Object.values(state.daily).reduce((s, d) => s + (d.minutes || 0), 0)}</b></div>
      </div>
      <div className="grid2">
        <div className="card">
          <h4>Activité (30 jours)</h4>
          {days.length ? (
            <svg viewBox={`0 0 ${days.length * 22} 120`} className="chart" role="img" aria-label="Positions par jour">
              {days.map((d, i) => {
                const r = state.daily[d];
                const h = (r.reviews / maxR) * 100;
                const hc = (r.correct / maxR) * 100;
                return (
                  <g key={d}>
                    <rect x={i * 22 + 3} y={105 - h} width="16" height={h} className="bar-bg"><title>{d} : {r.reviews} positions, {r.correct} seul</title></rect>
                    <rect x={i * 22 + 3} y={105 - hc} width="16" height={hc} className="bar" />
                    <text x={i * 22 + 11} y="118" className="axis" textAnchor="middle">{d.slice(8)}</text>
                  </g>
                );
              })}
            </svg>
          ) : <p className="muted">Pas encore de données.</p>}
        </div>
        <div className="card">
          <h4>Maîtrise</h4>
          {dist.map((n, i) => (
            <div key={i} className="hbar"><span>{MASTERY[i]}</span><span className="hbar-track"><span style={{ width: (cards.length ? (n / cards.length) * 100 : 0) + '%' }} /></span><b>{n}</b></div>
          ))}
        </div>
      </div>
      <div className="card">
        <h4>Par ouverture (de la plus faible à la plus solide)</h4>
        <table className="lines small">
          <thead><tr><th>Ouverture</th><th>Camp</th><th>Positions</th><th>Erreurs</th><th>Réussite</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id}><td>{r.title}</td><td>{r.side === 'w' ? 'Blancs' : 'Noirs'}</td><td>{r.n}</td><td>{r.err}</td><td>{Math.round(r.rate * 100)}%</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

// utilitaire pour la page parties : ajouter une position du répertoire aux révisions
export function addPositionToReview(side, fen, played) {
  const n = nodeAt(side, fen);
  if (!n || !n.user) return false;
  const info = cardInfo(side, n);
  update((d) => {
    const now = Date.now();
    const c = (d.cards[n.key] ||= { ...info, attempts: 0, successes: 0, hints: 0, errors: 0, step: 0, ease: 2.3, interval: 0, okStreak: 0, lastReview: null, due: now, history: [] });
    c.step = Math.min(c.step, 1);
    c.okStreak = 0;
    c.due = now;
    c.errors = (c.errors || 0) + 1;
    c.attempts = Math.max(c.attempts, 1);
    c.history.push({ t: now, type: 'import', played: played || '', expected: n.user.san, reason: 'Partie importée' });
  });
  return true;
}

export { moveListText };
