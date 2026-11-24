import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from './Board.jsx';
import WhyPanel from './WhyPanel.jsx';
import { nodeAt, fr, LINE, CHAPTER, cardInfo, EVALS, moveListText } from '../lib/repo.js';
import { TAG_LABEL } from '../lib/pgnline.js';
import { evalMove, engineMove, LEVELS, classifyLoss, ENGINE_NAME, formatScore } from '../lib/engine.js';
import { recordResult, markLine, addMinutes, getState, saveExam } from '../lib/store.js';
import { short, intentOf, consequence, strategicHint, preciseHint, squaresHint, praise, autoLevel } from '../lib/coach.js';

// Poids des réponses adverses selon le niveau simulé (comportement approximatif)
const WEIGHTS = {
  800: { theory: 1, sideline: 1, inaccuracy: 2, mistake: 2.5, blunder: 2.5 },
  1000: { theory: 1.5, sideline: 1, inaccuracy: 2, mistake: 2, blunder: 1.5 },
  1200: { theory: 2.5, sideline: 1.2, inaccuracy: 1.5, mistake: 1, blunder: 0.6 },
  1500: { theory: 4, sideline: 1.5, inaccuracy: 1, mistake: 0.5, blunder: 0.2 },
  1800: { theory: 6, sideline: 2, inaccuracy: 0.6, mistake: 0.2, blunder: 0.05 },
};
const KIND = { inacc: 'Imprécision de répertoire', err: 'Erreur', unknown: 'Hors répertoire', alt: 'Bonne alternative' };
const MODE_LABEL = { learn: 'Leçon', test: 'Test', exam: 'Examen strict', guided: 'Examen accompagné', random: 'Adversaire imprévisible', review: 'Révision' };
const sideName = (s) => (s === 'w' ? 'Blancs' : 'Noirs');

function weightedPick(items) {
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const x of items) { r -= x.w; if (r <= 0) return x; }
  return items[items.length - 1];
}

/**
 * props : side, mode ('learn'|'test'|'exam'|'guided'|'random'|'review'),
 * drills [{type:'line', lineId} | {type:'random', level} | {type:'card', card}], title, onExit, onPlayFrom, onNext, nextLabel
 */
export default function Trainer({ side, mode, drills: initialDrills, title, onExit, onPlayFrom, onNext, nextLabel }) {
  const [drills, setDrills] = useState(initialDrills);
  const [di, setDi] = useState(0);
  const [fen, setFen] = useState(new Chess().fen());
  const [history, setHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [phase, setPhase] = useState('opp');
  const [msg, setMsg] = useState(null);
  const [more, setMore] = useState(false);
  const [oppNote, setOppNote] = useState(null);
  const [nonce, setNonce] = useState(0);
  const [shapes, setShapes] = useState({ arrows: [], circles: [] });
  const [browse, setBrowse] = useState(null);
  const [results, setResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [explain, setExplain] = useState(null);
  const [level, setLevel] = useState(0);
  const [drillDone, setDrillDone] = useState(0); // positions résolues dans la ligne en cours

  const game = useRef(new Chess());
  const token = useRef(0);
  const pos = useRef(null); // état de la position en cours : { key, tries, level, wrong:[], alt }
  const drillFails = useRef(0);
  const offbook = useRef(false);
  const startTime = useRef(Date.now());
  const savedExam = useRef(false);
  const defaultLevel = useMemo(() => getState().settings.level || 1200, []);

  const drill = drills[di];
  const line = drill && drill.type === 'line' ? LINE[drill.lineId] : null;
  const strict = mode === 'exam';
  const isExam = mode === 'exam' || mode === 'guided';
  const lineUserTotal = line ? line.moves.filter((_, i) => (i % 2 === 0) === (side === 'w')).length : 0;

  useEffect(() => () => { token.current++; addMinutes(Math.round((Date.now() - startTime.current) / 60000)); }, []);
  useEffect(() => { startDrill(di); /* eslint-disable-next-line */ }, [di]);

  const later = (ms, fn) => { const t = token.current; setTimeout(() => { if (t === token.current) fn(); }, ms); };
  const sync = (lm) => {
    const c = game.current;
    setFen(c.fen());
    setHistory(c.history());
    setLastMove(lm || null);
    setBrowse(null);
  };
  const newPos = () => {
    const n = nodeAt(side, game.current.fen());
    pos.current = { key: n?.key, tries: 0, level: 0, wrong: [], alt: false };
    setLevel(0);
  };

  function startDrill(i) {
    token.current++;
    const d = drills[i];
    if (!d) return;
    const c = new Chess();
    game.current = c;
    drillFails.current = 0;
    offbook.current = false;
    setMsg(null); setMore(false); setExplain(null); setOppNote(null); setShapes({ arrows: [], circles: [] }); setDrillDone(0);
    if (d.type === 'card') {
      const path = d.card.path || [];
      path.slice(0, -1).forEach((s) => c.move(s));
      sync();
      setPhase('opp');
      const go = () => { newPos(); setPhase('user'); setNonce((x) => x + 1); };
      if (path.length) later(350, () => { const mv = c.move(path[path.length - 1]); sync([mv.from, mv.to]); setOppNote({ san: mv.san, tag: 'theory' }); go(); });
      else go();
      return;
    }
    sync();
    if (c.turn() !== side) { setPhase('opp'); later(500, oppTurn); } else { newPos(); setPhase('user'); }
  }

  function pickOpponent(c) {
    const d = drills[di];
    if (d.type === 'line') {
      const l = LINE[d.lineId];
      const h = c.history();
      if (h.length >= l.moves.length || h.some((m, k) => m !== l.moves[k])) return null;
      return { san: l.moves[h.length] };
    }
    if (d.type === 'random') {
      const lv = d.level || defaultLevel;
      const n = nodeAt(side, c.fen());
      if (n && n.opp.size) {
        if (Math.random() < (LEVELS[lv]?.randomPct || 0.05)) return { offbook: true, level: lv };
        const items = [...n.opp.values()].map((o) => ({ ...o, w: (WEIGHTS[lv] || WEIGHTS[1200])[o.tag] || 1 }));
        return { san: weightedPick(items).san };
      }
    }
    return null;
  }

  async function oppTurn() {
    const c = game.current;
    if (c.isGameOver()) { finishDrill(); return; }
    const pick = pickOpponent(c);
    if (!pick) { finishDrill(); return; }
    let san = pick.san;
    let note = null;
    if (pick.offbook) {
      const t = token.current;
      try {
        if (pick.level <= 1000 && Math.random() < 0.5) throw new Error('aléatoire');
        san = await engineMove(c.fen(), pick.level);
      } catch {
        const ms = c.moves();
        san = ms[Math.floor(Math.random() * ms.length)];
      }
      if (t !== token.current) return;
      note = { tag: 'offbook', comment: 'L’adversaire sort de la théorie : joue selon les principes, le moteur jugera ton coup.' };
      offbook.current = true;
    }
    const n = nodeAt(side, c.fen());
    const o = n && n.opp.get(san);
    const mv = c.move(san);
    sync([mv.from, mv.to]);
    if (!note && o) note = { tag: o.tag, glyph: o.glyph, comment: o.comment, cal: o.cal };
    setOppNote({ ...(note || { tag: 'theory' }), san });
    setShapes(mode === 'learn' && o?.cal?.length ? { arrows: o.cal, circles: [] } : { arrows: [], circles: [] });
    if (c.isGameOver()) { finishDrill(); return; }
    const next = nodeAt(side, c.fen());
    if (!next || !next.user) offbook.current = true;
    if (drills[di].type === 'line' && !next?.user) { finishDrill(); return; }
    newPos();
    setPhase('user');
    setNonce((x) => x + 1);
  }

  // ------------------------------------------------------------ coups de l'élève
  function onUserMove(san) {
    if (phase !== 'user' || browse != null) { setNonce((x) => x + 1); return; }
    const c = game.current;
    const fenBefore = c.fen();
    const node = nodeAt(side, fenBefore);
    if (!node || !node.user || offbook.current) { judgeOffbook(fenBefore, san); return; }
    if (!pos.current || pos.current.key !== node.key) newPos();
    const expected = node.user.san;
    if (san === expected) { found(node); return; }
    if (strict) {
      // examen strict : aucune aide, on note et on continue ; correction à la fin
      pos.current.wrong.push({ san, type: node.alts[san]?.[0] || 'exam', reason: node.alts[san]?.[1] || '' });
      found(node, true);
      return;
    }
    const typed = node.alts[san];
    if (typed && typed[0] === 'alt') { alternative(node, san, typed[1]); return; }
    if (typed) { wrong(node, san, typed[0], typed[1], typed[2] ? typed[2].split(/\s+/)[0] : null); return; }
    engineJudge(node, san);
  }

  function alternative(node, san, text) {
    pos.current.alt = true;
    pos.current.tries++;
    const lvl = Math.max(pos.current.level, autoLevel(pos.current.tries));
    applyLevel(node, lvl);
    setMsg({ kind: 'alt', title: `${fr(san)} : bon coup !`, text: 'Mais ton répertoire joue autre chose ici. Retrouve-le.', more: text, hint: hintText(node, lvl) });
    setNonce((x) => x + 1);
  }

  function hintText(node, lvl) {
    if (lvl <= 0) return '';
    if (lvl === 1) return strategicHint(node.fen, node.user.san);
    if (lvl === 2) return preciseHint(node.fen, node.user.san).text;
    return squaresHint(node.fen, node.user.san).text;
  }

  function applyLevel(node, lvl) {
    pos.current.level = Math.max(pos.current.level, lvl);
    setLevel(pos.current.level);
    const L = pos.current.level;
    if (L >= 3) setShapes({ arrows: [], circles: squaresHint(node.fen, node.user.san).circles });
    else if (L === 2) setShapes({ arrows: [], circles: preciseHint(node.fen, node.user.san).circles });
    else setShapes({ arrows: [], circles: [] });
  }

  function wrong(node, san, type, text, reply, loss = null, extra = '') {
    const p = pos.current;
    p.tries++;
    const cons = consequence(node.fen, san, reply, loss);
    p.wrong.push({ san, type, reason: short(text || `${intentOf(node.fen, san)}. ${cons}`, 160) });
    drillFails.current += p.wrong.length === 1 ? 1 : 0;
    const lvl = Math.max(p.level, autoLevel(p.tries));
    const teacher = `${intentOf(node.fen, san)}. ${text ? short(text, 160) : cons || 'Ce n’est pas le plan étudié ici.'}`;
    let body;
    if (p.tries === 1) body = type === 'err' && reply ? 'Ce coup ne correspond pas au plan étudié. Regarde la réponse adverse, puis réessaie.' : 'Ce coup ne correspond pas au plan étudié. Réessaie.';
    else body = teacher;
    const m = { kind: type, title: `${fr(san)}`, text: body, hint: hintText(node, lvl), more: [text, cons, extra].filter(Boolean).join(' '), tries: p.tries };
    if (type === 'err' && reply) {
      // montrer la punition, puis revenir automatiquement
      const t = new Chess(node.fen);
      const m1 = t.move(san);
      let lm = [m1.from, m1.to];
      const arrows = [];
      try { const r = t.move(reply); arrows.push({ from: r.from, to: r.to, c: 'R' }); lm = [r.from, r.to]; } catch { /* */ }
      setFen(t.fen()); setLastMove(lm); setShapes({ arrows, circles: [] });
      setPhase('punish');
      setMsg(m);
      later(1500, () => { sync(); setPhase('user'); applyLevel(node, lvl); setNonce((x) => x + 1); });
      return;
    }
    setMsg(m);
    applyLevel(node, lvl);
    setPhase('user');
    setNonce((x) => x + 1);
  }

  async function engineJudge(node, san) {
    const fenBefore = node.fen;
    const t = token.current;
    setPhase('thinking');
    setMsg({ kind: 'thinking', title: fr(san), text: 'Je regarde ton coup…' });
    try {
      const r = await evalMove(fenBefore, san, 12);
      if (t !== token.current) return;
      const cls = classifyLoss(r.loss);
      const detail = `Écart avec le meilleur coup : ${(r.loss / 100).toFixed(2)} pion (${ENGINE_NAME}, profondeur ${r.depth}).`;
      if (cls === 'good') { setPhase('user'); alternative(node, san, `Le moteur juge ce coup solide. ${detail}`); return; }
      wrong(node, san, cls === 'inacc' ? 'inacc' : 'err', '', r.refutation[0], r.loss, detail);
    } catch (e) {
      if (t !== token.current) return;
      wrong(node, san, 'unknown', `Analyse moteur indisponible (${e.message}) : je ne peux pas juger objectivement ce coup, mais ce n’est pas celui du répertoire.`, null);
    }
  }

  function found(node, silentMove = false) {
    const c = game.current;
    const p = pos.current || { tries: 0, level: 0, wrong: [], alt: false };
    const fenBefore = c.fen();
    const san = node.user.san;
    let result = 'ok';
    if (p.wrong.length) result = 'fail';
    else if (p.level > 0) result = 'hint';
    else if (p.alt) result = 'alt';
    const info = cardInfo(side, node, line?.chapterId);
    const w0 = p.wrong[0];
    recordResult(info, result, { type: p.solution ? 'solution' : w0?.type || result, played: w0?.san || '', reason: w0?.reason || '', hintLevel: p.level, mode });
    setResults((rs) => [...rs, { key: node.key, result, level: p.level, solution: !!p.solution, tries: p.tries, played: p.wrong.map((x) => x.san), expected: san, path: node.path, label: info.label, chapterId: info.chapterId, reason: w0?.reason || '', why: short(node.user.comment, 140) }]);
    const ns = result === 'ok' || result === 'alt' ? streak + 1 : 0;
    setStreak(ns);
    const mv = c.move(san);
    sync([mv.from, mv.to]);
    setDrillDone((x) => x + 1);
    pos.current = null;
    setLevel(0);
    if (silentMove) {
      setMsg({ kind: 'info', title: 'Coup enregistré', text: 'Examen strict : la correction arrive à la fin.' });
      setShapes({ arrows: [], circles: [] });
    } else {
      const altsOk = Object.entries(node.alts).filter(([, v]) => v[0] === 'alt').map(([k]) => fr(k));
      const ev = EVALS.evals[node.key];
      const title = p.solution ? 'Voilà le coup' : result === 'ok' ? praise(ns) : result === 'hint' ? 'Trouvé avec un indice' : 'Trouvé !';
      setMsg({
        kind: 'ok',
        title: `${title} ${fr(san)}`,
        text: short(node.user.comment) || 'C’est le coup du répertoire.',
        more: [node.user.comment, altsOk.length ? `Autres bons coups possibles (non retenus) : ${altsOk.join(', ')}.` : '', ev ? `Évaluation ${EVALS.engine}, profondeur ${ev.depth} : ${formatScore({ cp: ev.played }, node.turn)} (+ = avantage blanc).` : ''].filter(Boolean).join('\n'),
      });
      setExplain({ fenBefore, san, comment: node.user.comment, qa: node.user.qa || {} });
      setShapes({ arrows: (node.user.cal || []).slice(0, 2), circles: (node.user.csl || []).slice(0, 2).map((x) => ({ sq: x.sq, c: x.c })) });
    }
    setMore(false);
    const d = drills[di];
    if (d.type === 'card') { later(silentMove ? 250 : 1100, () => finishDrill()); return; }
    if (d.type === 'line' && c.history().length >= LINE[d.lineId].moves.length) { later(1000, () => finishDrill()); return; }
    setPhase('opp');
    later(silentMove ? 400 : 900, oppTurn);
  }

  function useHint() {
    const n = nodeAt(side, game.current.fen());
    if (!n || !n.user || !pos.current) return;
    const lvl = Math.min(3, pos.current.level + 1);
    applyLevel(n, lvl);
    setMsg({ kind: 'hint', title: 'Indice', text: hintText(n, lvl) });
  }

  function showSolution() {
    const n = nodeAt(side, game.current.fen());
    if (!n || !n.user) return;
    pos.current.solution = true;
    pos.current.level = 4;
    if (!pos.current.wrong.length) pos.current.wrong.push({ san: '', type: 'solution', reason: 'Solution affichée' });
    const t = new Chess(n.fen);
    const m = t.move(n.user.san);
    setShapes({ arrows: [{ from: m.from, to: m.to, c: 'G' }], circles: [] });
    later(900, () => found(n));
  }

  async function judgeOffbook(fenBefore, san) {
    const c = game.current;
    const mv = c.move(san);
    sync([mv.from, mv.to]);
    setPhase('thinking');
    setMsg({ kind: 'thinking', title: fr(san), text: 'Hors répertoire : je regarde ton coup…' });
    const t = token.current;
    try {
      const r = await evalMove(fenBefore, san, 12);
      if (t !== token.current) return;
      const cls = classifyLoss(r.loss);
      const lab = { good: ['ok', 'Bon coup !'], inacc: ['inacc', 'Imprécis'], mistake: ['err', 'Erreur'], blunder: ['err', 'Grosse erreur'] }[cls];
      setMsg({ kind: lab[0], title: `${fr(san)} : ${lab[1]}`, text: cls === 'good' ? 'Hors théorie, tu as trouvé un coup solide.' : `${intentOf(fenBefore, san)}. Le moteur préférait ${fr(r.bestSan)}.`, more: `Écart : ${(r.loss / 100).toFixed(2)} pion (${ENGINE_NAME}, profondeur ${r.depth}).` });
    } catch (e) {
      if (t !== token.current) return;
      setMsg({ kind: 'unknown', title: fr(san), text: 'Hors répertoire. Analyse moteur indisponible.', more: e.message });
    }
    finishDrill(true);
  }

  function finishDrill(fromOffbook = false) {
    const d = drills[di];
    const ok = drillFails.current === 0;
    if (d.type === 'line') {
      markLine(d.lineId, mode === 'learn' ? 'learn' : 'test', ok);
      if ((mode === 'test' || mode === 'learn') && !ok && !d.retry) setDrills((ds) => [...ds, { ...d, retry: true }]);
    }
    setPhase('drill-done');
    if (!fromOffbook && d.type === 'line') setMsg((m) => ({ ...(m || {}), lineEnd: LINE[d.lineId].finalComment }));
    // enchaînement rapide pour les révisions et examens
    if (d.type === 'card') later(strict ? 150 : 700, () => next());
  }

  function next() {
    if (di + 1 < drills.length) setDi(di + 1);
    else setPhase('session-done');
  }

  // navigation (lecture seule)
  const shown = useMemo(() => {
    if (browse == null) return { fen, lastMove };
    const c = new Chess();
    let lm = null;
    history.slice(0, browse).forEach((s) => { const m = c.move(s); lm = [m.from, m.to]; });
    return { fen: c.fen(), lastMove: lm };
  }, [browse, fen, lastMove, history]);

  // ------------------------------------------------------------ résumé
  const summary = useMemo(() => {
    const alone = results.filter((r) => r.result === 'ok' || r.result === 'alt');
    const hinted = results.filter((r) => r.level > 0 && !r.solution);
    const errors = results.filter((r) => (r.result === 'fail' && r.level === 0) || r.solution);
    const review = results.filter((r) => r.result !== 'ok' && r.result !== 'alt');
    let goal;
    if (errors.length) goal = `Rejouer sans aide les ${errors.length} position(s) ratée(s) : elles reviennent en priorité dans tes révisions.`;
    else if (hinted.length) goal = `Retrouver seul les ${hinted.length} position(s) où tu as eu besoin d’un indice.`;
    else if (isExam) goal = `Sans faute : tente un examen plus long (${Math.min(20, results.length + 5)} positions).`;
    else goal = 'Apprends une nouvelle ligne ou lance un examen court.';
    return { alone, hinted, errors, review, goal };
  }, [results, isExam]);

  useEffect(() => {
    if (phase === 'session-done' && isExam && !savedExam.current) {
      savedExam.current = true;
      saveExam({ t: Date.now(), side, mode, total: results.length, alone: summary.alone.length, hinted: summary.hinted.length, errors: summary.errors.length, keys: results.map((r) => ({ key: r.key, result: r.result, level: r.level })) });
    }
  }, [phase]); // eslint-disable-line

  if (phase === 'session-done') {
    const total = results.length;
    return (
      <div className="session-done panel">
        <div className="eyebrow">{MODE_LABEL[mode]}</div>
        <h2>{summary.errors.length === 0 && summary.hinted.length === 0 ? 'Sans faute !' : 'Séance terminée'}</h2>
        <div className="score-grid">
          <div className="score ok"><b>{summary.alone.length}</b><span>seul, sans indice</span></div>
          <div className="score hint"><b>{summary.hinted.length}</b><span>avec indice</span></div>
          <div className="score ko"><b>{summary.errors.length}</b><span>erreurs</span></div>
        </div>
        <div className="progressbar big"><span style={{ width: (total ? (summary.alone.length / total) * 100 : 0) + '%' }} /></div>
        {summary.review.length > 0 && (
          <details className="more" open={strict}>
            <summary>Positions à revoir ({summary.review.length})</summary>
            <ul className="small">
              {summary.review.map((r, i) => (
                <li key={i}>
                  {moveListText(r.path) || 'Départ'} → <b>{fr(r.expected)}</b>
                  {r.played.filter(Boolean).length ? <span className="muted"> (tu as joué {r.played.filter(Boolean).map(fr).join(', ')})</span> : null}
                  {r.reason ? <div className="muted">{r.reason}</div> : null}
                  {r.why ? <div className="muted">Pourquoi {fr(r.expected)} : {r.why}</div> : null}
                </li>
              ))}
            </ul>
          </details>
        )}
        <div className="note"><b>Prochain objectif :</b> {summary.goal}</div>
        <div className="row">
          {onNext && <button className="btn primary" onClick={onNext}>{nextLabel || 'Continuer'}</button>}
          <button className={onNext ? 'btn ghost' : 'btn primary'} onClick={onExit}>Terminer</button>
        </div>
      </div>
    );
  }

  const progressPct = line ? Math.min(100, (drillDone / Math.max(1, lineUserTotal)) * 100) : ((di + (phase === 'drill-done' ? 1 : 0)) / drills.length) * 100;
  const canHelp = !strict && phase === 'user' && !offbook.current && pos.current;
  const m = msg;

  return (
    <div className="trainer">
      <div className="trainer-board">
        <div className="board-head">
          <span className="badge">{MODE_LABEL[mode]}</span>
          <span className="muted ellipsis">{line ? line.name : title}</span>
          <span className="muted right nowrap">{di + 1}/{drills.length}</span>
          <button className="btn ghost sm" onClick={onExit} aria-label="Quitter">✕</button>
        </div>
        <div className="progressbar"><span style={{ width: progressPct + '%' }} /></div>
        <Board
          nonce={nonce}
          fen={shown.fen}
          orientation={side === 'w' ? 'white' : 'black'}
          movable={phase === 'user' && browse == null}
          onMove={onUserMove}
          lastMove={shown.lastMove}
          arrows={browse == null ? shapes.arrows : []}
          circles={browse == null ? shapes.circles : []}
        />
        <div className="movebar">
          <div className="moves">
            {history.map((mv, i) => (
              <span key={i} className={`mv ${browse === i + 1 ? 'cur' : ''}`} onClick={() => setBrowse(i + 1)}>
                {i % 2 === 0 ? <b>{i / 2 + 1}.</b> : null}{fr(mv)}
              </span>
            ))}
          </div>
          <div className="nav">
            <button className="btn ghost sm" aria-label="Coup précédent" onClick={() => setBrowse(Math.max(0, (browse ?? history.length) - 1))}>◀</button>
            <button className="btn ghost sm" aria-label="Coup suivant" onClick={() => { const b = (browse ?? history.length) + 1; setBrowse(b >= history.length ? null : b); }}>▶</button>
            {browse != null && <button className="btn ghost sm" onClick={() => setBrowse(null)}>Position actuelle</button>}
            <button className="btn ghost sm" onClick={() => startDrill(di)}>⟲ Recommencer</button>
          </div>
        </div>
      </div>

      <div className="trainer-side">
        <div className="coach">
          {oppNote && (
            <div className={`opp-line tag-${oppNote.tag}`}>
              <span className="muted">{sideName(side === 'w' ? 'b' : 'w')} :</span> <b>{fr(oppNote.san)}{oppNote.glyph || ''}</b>
              {oppNote.tag !== 'theory' && (phase !== 'user' || mode === 'learn') && <span className="tag">{TAG_LABEL[oppNote.tag]}</span>}
              {mode === 'learn' && oppNote.comment && <div className="small muted">{short(oppNote.comment, 110)}</div>}
            </div>
          )}

          {phase === 'user' && (!m?.title || m.kind === 'ok' || m.kind === 'info') && (
            <div className="prompt">
              <div className="prompt-main">À toi de jouer</div>
              <div className="muted small">{offbook.current ? 'Hors répertoire : joue le meilleur coup selon toi.' : 'Trouve le coup de ton répertoire.'}</div>
            </div>
          )}
          {phase === 'opp' && !m && <div className="muted small">L’adversaire joue…</div>}

          {m && (
            <div className={`bubble b-${m.kind}`} key={m.title + (m.tries || '')}>
              {KIND[m.kind] && <span className="tag">{KIND[m.kind]}</span>}
              <div className="bubble-title">{m.title}</div>
              {m.text && <div>{m.text}</div>}
              {m.hint && <div className="hint-line">💡 {m.hint}</div>}
              {m.more && (
                <>
                  <button className="linkbtn" onClick={() => setMore(!more)}>{more ? 'Masquer' : 'Comprendre davantage'}</button>
                  {more && <div className="more-text">{m.more}</div>}
                </>
              )}
            </div>
          )}

          {phase === 'user' && m && m.kind !== 'ok' && m.kind !== 'info' && <div className="muted small">À toi : réessaie.</div>}

          {canHelp && (
            <div className="help-row">
              {(mode === 'learn' || mode === 'guided' || level > 0) && level < 3 && <button className="btn ghost sm" onClick={useHint}>💡 Indice</button>}
              {level >= 3 && <button className="btn ghost sm" onClick={showSolution}>Voir la solution</button>}
              {level > 0 && <span className="small muted">Aide utilisée : niveau {level}</span>}
            </div>
          )}

          {phase === 'drill-done' && drills[di].type !== 'card' && (
            <div className="drill-done">
              <div className="bubble-title">{drillFails.current === 0 ? '✓ Ligne réussie !' : `Ligne terminée — ${drillFails.current} position(s) à revoir`}</div>
              {m?.lineEnd && !strict && <div className="plan-note"><b>Et maintenant ?</b> {short(m.lineEnd, 200)}</div>}
              <div className="row">
                <button className="btn primary" onClick={next}>{di + 1 < drills.length ? (drills[di].type === 'line' ? 'Ligne suivante' : 'Partie suivante') : 'Voir le bilan'}</button>
                {onPlayFrom && !isExam && <button className="btn ghost" onClick={() => onPlayFrom(game.current.fen(), game.current.history())}>Jouer la suite</button>}
              </div>
            </div>
          )}
        </div>

        {explain && !strict && more && (
          <WhyPanel key={explain.fenBefore + explain.san} fenBefore={explain.fenBefore} san={explain.san} qa={explain.qa} comment={explain.comment} side={side} onShow={(s) => setShapes(s)} />
        )}
        {explain && !strict && !more && m?.kind === 'ok' && (
          <button className="linkbtn small" onClick={() => setMore(true)}>Pourquoi ce coup ? Poser une question</button>
        )}
        <div className="mini-stats small muted">
          {streak >= 2 && <span className="streak">🔥 {streak} d’affilée</span>}
          <span>{results.filter((r) => r.result === 'ok' || r.result === 'alt').length}/{results.length} seul</span>
          {line && CHAPTER[line.chapterId] && <span className="ellipsis">{CHAPTER[line.chapterId].title}</span>}
        </div>
      </div>
    </div>
  );
}
