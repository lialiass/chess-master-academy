import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from './Board.jsx';
import { fr, moveListText } from '../lib/repo.js';
import { engineMove, LEVELS, evalMove, ENGINE_NAME } from '../lib/engine.js';
import { repertoireCheck, engineReview, buildReport } from '../lib/analysis.js';
import { update, getState } from '../lib/store.js';

export function ReportView({ report, onExercises }) {
  return (
    <div className="report">
      {report.sections.map((s, i) => (
        <div key={i} className="report-sec"><b>{s.h}</b><div>{s.t}</div></div>
      ))}
      {report.worst.length > 0 && (
        <div className="report-sec">
          <b>Tes 3 exercices personnalisés</b>
          <ol>{report.worst.map((w, i) => <li key={i}>Coup {Math.floor(w.ply / 2) + 1} : tu as joué {fr(w.san)} — retrouve mieux.</li>)}</ol>
          {onExercises && <button className="btn" onClick={onExercises}>Faire les exercices</button>}
        </div>
      )}
    </div>
  );
}

export function saveExercises(worst, side, source) {
  update((d) => {
    for (const w of worst) {
      d.exercises.push({ id: Math.random().toString(36).slice(2), fen: w.fenBefore, best: w.bestSan, played: w.san, side, source, created: Date.now(), done: false, loss: w.loss });
    }
    if (d.exercises.length > 120) d.exercises = d.exercises.slice(-120);
  });
}

export function ExerciseTrainer({ exercises, onExit }) {
  const [i, setI] = useState(0);
  const [fb, setFb] = useState(null);
  const [nonce, setNonce] = useState(0);
  const [solved, setSolved] = useState(false);
  const ex = exercises[i];
  if (!ex) return <div className="panel"><p>Aucun exercice.</p><button className="btn" onClick={onExit}>Retour</button></div>;
  const onMove = async (san) => {
    if (solved) return;
    if (san === ex.best) { setFb({ type: 'ok', text: `${fr(san)} — c’est le meilleur coup selon le moteur.` }); setSolved(true); markDone(); return; }
    if (san === ex.played) { setFb({ type: 'err', text: `C’est le coup joué dans la partie (${fr(san)}). Cherche mieux.` }); setNonce((x) => x + 1); return; }
    setFb({ type: 'thinking', text: 'Analyse…' });
    try {
      const r = await evalMove(ex.fen, san, 13);
      if (r.loss <= 25) { setFb({ type: 'ok', text: `${fr(san)} est aussi bon que le meilleur coup (${fr(r.bestSan)}) selon le moteur.` }); setSolved(true); markDone(); }
      else { setFb({ type: 'inacc', text: `${fr(san)} : écart de ${(r.loss / 100).toFixed(2)} pion (${ENGINE_NAME}). Réessaie.` }); setNonce((x) => x + 1); }
    } catch (e) {
      setFb({ type: 'unknown', text: `Analyse indisponible (${e.message}). Le coup attendu était différent.` }); setNonce((x) => x + 1);
    }
  };
  const markDone = () => update((d) => { const e = d.exercises.find((x) => x.id === ex.id); if (e) e.done = true; });
  return (
    <div className="trainer">
      <div className="trainer-board">
        <div className="board-head"><span className="badge">Exercice {i + 1} / {exercises.length}</span><span className="muted">{ex.source}</span></div>
        <Board nonce={nonce} fen={ex.fen} orientation={ex.side === 'w' ? 'white' : 'black'} movable={!solved} onMove={onMove} />
      </div>
      <div className="trainer-side">
        <div className="panel">
          <div className="title-row"><h3>Trouve le meilleur coup</h3><button className="btn ghost sm" onClick={onExit}>Quitter</button></div>
          <p className="muted small">Position tirée de ta partie. Dans la partie, tu avais joué {fr(ex.played)}.</p>
          {fb && <div className={`feedback fb-${fb.type}`}>{fb.text}</div>}
          {solved && <button className="btn" onClick={() => { setI(i + 1); setSolved(false); setFb(null); }}>{i + 1 < exercises.length ? 'Exercice suivant' : 'Terminer'}</button>}
          {!solved && <button className="btn ghost sm" onClick={() => { setFb({ type: 'info', text: `Solution : ${fr(ex.best)}` }); setSolved(true); }}>Voir la solution</button>}
        </div>
      </div>
    </div>
  );
}

export default function PlayGame({ side, startMoves = [], onExit }) {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [moves, setMoves] = useState([]);
  const [lm, setLm] = useState(null);
  const [level, setLevel] = useState(getState().settings.level || 1200);
  const [status, setStatus] = useState('play');
  const [err, setErr] = useState(null);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [exMode, setExMode] = useState(false);
  const [nonce, setNonce] = useState(0);
  const tk = useRef(0);

  useEffect(() => {
    const c = new Chess();
    startMoves.forEach((s) => c.move(s));
    game.current = c;
    sync();
    if (c.turn() !== side) think();
    return () => { tk.current++; };
    // eslint-disable-next-line
  }, []);

  function sync(m) {
    const c = game.current;
    setFen(c.fen()); setMoves(c.history()); setLm(m ? [m.from, m.to] : null);
    if (c.isGameOver()) setStatus('over');
  }

  async function think() {
    const c = game.current;
    if (c.isGameOver()) { setStatus('over'); return; }
    setStatus('thinking');
    const t = tk.current;
    try {
      const san = await engineMove(c.fen(), level);
      if (t !== tk.current) return;
      const m = c.move(san);
      sync(m);
      if (!c.isGameOver()) setStatus('play');
      setErr(null);
    } catch (e) {
      setErr('Le moteur adverse est indisponible : ' + e.message);
      setStatus('play');
    }
  }

  function onMove(san) {
    if (status !== 'play') { setNonce((x) => x + 1); return; }
    const c = game.current;
    if (c.turn() !== side) return;
    const m = c.move(san);
    sync(m);
    if (!c.isGameOver()) think();
  }

  async function analyseGame() {
    tk.current++;
    setStatus('analysing');
    setErr(null);
    try {
      const mv = game.current.history();
      const rep = repertoireCheck(mv, side);
      const review = await engineReview(mv, side, { depth: 10, onProgress: setProgress });
      const r = buildReport(mv, side, review, rep);
      setReport(r);
      saveExercises(r.worst, side, 'Partie complète');
      setStatus('report');
    } catch (e) {
      setErr('Analyse impossible : ' + e.message + '. Aucune évaluation n’est affichée sans moteur.');
      setStatus('over');
    }
  }

  const c = game.current;
  const result = c.isCheckmate() ? (c.turn() === side ? 'Tu es mat.' : 'Échec et mat, tu gagnes !') : c.isStalemate() ? 'Pat : nulle.' : c.isDraw() ? 'Nulle.' : '';

  if (exMode && report) {
    const exs = report.worst.map((w) => ({ id: 'tmp' + w.ply, fen: w.fenBefore, best: w.bestSan, played: w.san, side, source: 'Partie complète' }));
    return <ExerciseTrainer exercises={exs} onExit={() => setExMode(false)} />;
  }

  return (
    <div className="trainer">
      <div className="trainer-board">
        <div className="board-head">
          <span className="badge">Partie complète</span>
          <label className="muted small">Adversaire simulé :
            <select value={level} onChange={(e) => { setLevel(+e.target.value); update((d) => { d.settings.level = +e.target.value; }); }}>
              {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
        </div>
        <Board nonce={nonce} fen={fen} orientation={side === 'w' ? 'white' : 'black'} movable={status === 'play' && c.turn() === side} onMove={onMove} lastMove={lm} />
        <div className="movebar"><div className="moves">{moveListText(moves)}</div></div>
      </div>
      <div className="trainer-side">
        <div className="panel">
          <div className="title-row"><h3>Transformer l’ouverture en partie</h3><button className="btn ghost sm" onClick={onExit}>Quitter</button></div>
          <p className="muted small">Niveau d’adversaire simulé approximatif (Stockfish bridé) — ce n’est pas une garantie de force Elo.</p>
          {status === 'thinking' && <div className="muted">L’adversaire réfléchit…</div>}
          {status === 'play' && <div className="prompt-main">À toi de jouer</div>}
          {result && <div className="feedback fb-info">{result}</div>}
          {err && <div className="feedback fb-unknown">{err}</div>}
          {(status === 'play' || status === 'over' || status === 'thinking') && (
            <div className="row">
              <button className="btn" onClick={analyseGame} disabled={moves.length < 4}>{status === 'over' ? 'Analyser la partie' : 'Terminer et analyser'}</button>
            </div>
          )}
          {status === 'analysing' && <div className="muted">Analyse moteur en cours… {Math.round(progress * 100)}%</div>}
          {report && <ReportView report={report} onExercises={() => setExMode(true)} />}
        </div>
      </div>
    </div>
  );
}
