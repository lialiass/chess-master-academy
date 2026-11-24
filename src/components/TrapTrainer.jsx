import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from './Board.jsx';
import { fr, parseMoves } from '../lib/repo.js';
import { CATEGORIES, THEMES } from '../data/traps.js';
import { evalMove, ENGINE_NAME } from '../lib/engine.js';
import { update } from '../lib/store.js';

const sans = (pgn) => parseMoves(pgn).map((m) => m.san);

export default function TrapTrainer({ trap, onExit, onNextTrap }) {
  const side = trap.side;
  const setup = sans(trap.setup);
  const sol = trap.solution.split(/\s+/);
  const game = useRef(new Chess());
  const [fen, setFen] = useState(new Chess().fen());
  const [lm, setLm] = useState(null);
  const [step, setStep] = useState(0); // index dans la solution
  const [phase, setPhase] = useState('intro');
  const [fb, setFb] = useState(null);
  const [arrows, setArrows] = useState([]);
  const [showChanged, setShowChanged] = useState(false);
  const [nonce, setNonce] = useState(0);
  const failed = useRef(false);
  const tk = useRef(0);

  const later = (ms, f) => { const t = tk.current; setTimeout(() => t === tk.current && f(), ms); };

  function reset() {
    tk.current++;
    const c = new Chess();
    setup.slice(0, -1).forEach((s) => c.move(s));
    game.current = c;
    setFen(c.fen()); setLm(null); setStep(0); setFb(null); setArrows([]); setPhase('play');
    later(500, () => { const m = c.move(setup[setup.length - 1]); setFen(c.fen()); setLm([m.from, m.to]); });
  }
  useEffect(() => { reset(); failed.current = false; setShowChanged(false); /* eslint-disable-next-line */ }, [trap.id]);

  function done(ok) {
    setPhase('solved');
    update((d) => {
      d.traps ||= {};
      const t = (d.traps[trap.id] ||= { attempts: 0, solved: 0, last: null });
      t.attempts++;
      if (ok) t.solved++;
      t.last = Date.now();
    });
  }

  async function onMove(san) {
    if (phase !== 'play') { setNonce((x) => x + 1); return; }
    const c = game.current;
    const fenBefore = c.fen();
    const accepted = (trap.accept && trap.accept[step]) || [sol[step]];
    const ok = san === sol[step] || accepted.includes(san);
    if (!ok && step === 0 && trap.wrong && trap.wrong[san]) {
      failed.current = true;
      const [text, ref] = trap.wrong[san];
      const t = new Chess(fenBefore);
      const m = t.move(san);
      const ar = [];
      let last = [m.from, m.to];
      if (ref) { const r = t.move(ref.split(/\s+/)[0]); ar.push({ from: r.from, to: r.to, c: 'R' }); last = [r.from, r.to]; }
      setFen(t.fen()); setLm(last); setArrows(ar);
      setFb({ type: 'err', text, ref: ref ? ref.split(/\s+/).map(fr).join(' ') : '' });
      setPhase('punish');
      return;
    }
    if (!ok) {
      setPhase('thinking');
      setFb({ type: 'thinking', text: 'Ce n’est pas le coup attendu : vérification avec le moteur…' });
      try {
        const r = await evalMove(fenBefore, san, 13);
        const best = await evalMove(fenBefore, sol[step], 13);
        if (r.loss <= Math.max(25, best.loss + 15)) {
          setFb({ type: 'alt', text: `${fr(san)} est aussi très fort selon le moteur (écart ${(r.loss / 100).toFixed(2)}). Mais l’exercice porte sur une autre idée : cherche le coup thématique.` });
        } else {
          failed.current = true;
          setFb({ type: 'err', text: `${fr(san)} laisse passer l’occasion : écart de ${(r.loss / 100).toFixed(2)} pion avec la bonne continuation (${ENGINE_NAME}, prof. ${r.depth}). Réessaie.` });
        }
      } catch (e) {
        failed.current = true;
        setFb({ type: 'unknown', text: `Ce n’est pas la continuation attendue. (Analyse moteur indisponible : ${e.message})` });
      }
      setPhase('play'); setNonce((x) => x + 1);
      return;
    }
    const m = c.move(san);
    setFen(c.fen()); setLm([m.from, m.to]); setArrows([]);
    setFb({ type: 'ok', text: `${fr(san)} — exact !` });
    const nextStep = step + 1;
    if (nextStep >= sol.length) { done(!failed.current); return; }
    // réponse adverse forcée de la solution
    setPhase('opp');
    later(650, () => {
      const r = c.move(sol[nextStep]);
      setFen(c.fen()); setLm([r.from, r.to]);
      if (nextStep + 1 >= sol.length) { done(!failed.current); return; }
      setStep(nextStep + 1); setPhase('play');
    });
  }

  function showDefense() {
    tk.current++;
    const d = parseMoves(trap.defense).map((m) => m.san);
    const first = trap.defense.trim().match(/^(\d+)\.(\.\.)?/);
    const ply = (+first[1] - 1) * 2 + (first[2] ? 1 : 0);
    const base = [...setup, ...sol].slice(0, ply);
    const c = new Chess();
    base.forEach((s) => c.move(s));
    setFen(c.fen()); setLm(null); setArrows([]);
    setPhase('defense');
    d.forEach((s, i) => later(700 * (i + 1), () => { const m = c.move(s); setFen(c.fen()); setLm([m.from, m.to]); }));
  }

  const oppSide = side === 'w' ? 'Noirs' : 'Blancs';
  return (
    <div className="trainer">
      <div className="trainer-board">
        <div className="board-head">
          <span className="badge">{CATEGORIES[trap.category]}</span>
          <span className="muted">{THEMES[trap.theme]}</span>
        </div>
        <Board nonce={nonce} fen={fen} orientation={side === 'w' ? 'white' : 'black'} movable={phase === 'play'} onMove={onMove} lastMove={lm} arrows={arrows} />
      </div>
      <div className="trainer-side">
        <div className="panel">
          <div className="title-row"><h3>{phase === 'solved' || phase === 'defense' ? trap.title : `${trap.title.split(' : ')[0]} — à toi de trouver`}</h3><button className="btn ghost sm" onClick={onExit}>Quitter</button></div>
          <div className="muted small">Position après : {trap.setup.replace(/\s+/g, ' ')}</div>
          <p><b>Les {oppSide} viennent de jouer.</b> {phase === 'play' && step === 0 ? 'Trouve la meilleure réponse.' : ''}</p>
          {!showChanged && phase === 'play' && step === 0 ? (
            <button className="btn ghost sm" onClick={() => setShowChanged(true)}>Qu’est-ce qui a changé ? (aide)</button>
          ) : (
            <div className="note"><b>Ce qui a changé :</b> {trap.changed}</div>
          )}
          {fb && (
            <div className={`feedback fb-${fb.type}`}>
              <div>{fb.text}</div>
              {fb.ref && <div className="small">Punition : {fb.ref}</div>}
              {phase === 'punish' && <button className="btn" onClick={() => { reset(); setNonce((x) => x + 1); }}>Réessayer</button>}
            </div>
          )}
          {(phase === 'solved' || phase === 'defense') && (
            <div className="solved">
              <h4>{failed.current ? 'Résolu après correction' : 'Résolu du premier coup !'}</h4>
              <p>{trap.explanation}</p>
              <p><b>Si le piège ne fonctionne pas :</b> {trap.ifFails}</p>
              <p><b>Convertir l’avantage :</b> {trap.convert}</p>
              <div className="row">
                <button className="btn ghost" onClick={showDefense}>Voir la meilleure défense adverse</button>
                <button className="btn ghost" onClick={() => { failed.current = false; reset(); }}>Refaire</button>
                {onNextTrap && <button className="btn" onClick={onNextTrap}>Exercice suivant</button>}
              </div>
              {phase === 'defense' && <div className="small muted">Défense : {trap.defense}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
