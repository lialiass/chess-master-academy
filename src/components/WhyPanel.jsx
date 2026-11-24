import { useState } from 'react';
import { Chess } from 'chess.js';
import { fr } from '../lib/repo.js';
import { analyse, evalMove, formatScore, pvToSan, ENGINE_NAME } from '../lib/engine.js';

export const QUESTIONS = [
  ['why', 'Pourquoi ce coup ?'],
  ['whyNow', 'Pourquoi maintenant ?'],
  ['threat', 'Quelle pièce est menacée ?'],
  ['oppPlan', 'Quel est le plan de mon adversaire ?'],
  ['notOther', 'Pourquoi pas un autre coup ?'],
  ['weak', 'Quelle case devient faible ?'],
  ['exchange', 'Quel échange me favorise ?'],
  ['capture', 'Et si mon adversaire capture ?'],
  ['attackOrDevelop', 'Attaquer ou se développer ?'],
  ['convert', 'Comment transformer l’avantage ?'],
];

const NAMES = { p: 'pion', n: 'cavalier', b: 'fou', r: 'tour', q: 'dame', k: 'roi' };
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

/** Pièces du camp `color` attaquées par l'adversaire, avec bilan attaquants/défenseurs. */
export function threatenedPieces(fen, color) {
  const c = new Chess(fen);
  const opp = color === 'w' ? 'b' : 'w';
  const out = [];
  for (const row of c.board()) for (const p of row) {
    if (!p || p.color !== color || p.type === 'k') continue;
    const att = c.attackers(p.square, opp);
    if (!att.length) continue;
    const def = c.attackers(p.square, color);
    const minAtt = Math.min(...att.map((s) => VAL[c.get(s).type]));
    const danger = !def.length || minAtt < VAL[p.type];
    out.push({ sq: p.square, type: p.type, att, def, danger });
  }
  return out;
}

function developmentAdvice(fen, color) {
  const c = new Chess(fen);
  const home = color === 'w' ? { b1: 'n', g1: 'n', c1: 'b', f1: 'b' } : { b8: 'n', g8: 'n', c8: 'b', f8: 'b' };
  const undeveloped = Object.entries(home).filter(([sq, t]) => { const p = c.get(sq); return p && p.type === t && p.color === color; }).map(([sq]) => sq);
  const kSq = color === 'w' ? 'e1' : 'e8';
  const k = c.get(kSq);
  const castled = !(k && k.type === 'k');
  if (undeveloped.length >= 2 || !castled) {
    return `Termine d'abord ton développement : ${undeveloped.length} pièce(s) mineure(s) encore à la maison${undeveloped.length ? ' (' + undeveloped.join(', ') + ')' : ''}${castled ? '' : ', roi pas encore roqué'}. N'attaque que si l'adversaire a commis une faute concrète.`;
  }
  return 'Ton développement est presque terminé : c’est le moment de chercher un plan actif (rupture de pion, pièce vers une case forte).';
}

/**
 * fenBefore : position avant le coup de l'élève ; san : coup de l'élève ; qa : réponses rédigées ; comment : commentaire.
 * onShow({arrows, circles}) : afficher des flèches sur l'échiquier.
 */
export default function WhyPanel({ fenBefore, san, qa = {}, comment, side, onShow, locked }) {
  const [open, setOpen] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [busy, setBusy] = useState(false);
  if (locked) return null;

  const ask = async (k) => {
    setOpen(k);
    const fenAfter = (() => { const c = new Chess(fenBefore); c.move(san); return c.fen(); })();
    const opp = side === 'w' ? 'b' : 'w';
    if (k === 'why' && !qa.why) { setAnswer({ text: comment || 'Pas d’explication rédigée pour ce coup.' }); return; }
    if (k === 'threat') {
      const before = threatenedPieces(fenBefore, side);
      const after = threatenedPieces(fenAfter, side);
      const oppT = threatenedPieces(fenAfter, opp);
      const lines = [];
      if (qa.threat) lines.push(qa.threat);
      const desc = (l, who) => l.map((t) => `${NAMES[t.type]} ${t.sq}${t.danger ? ' (en danger)' : ' (défendu)'}`).join(', ') || `aucune pièce ${who} attaquée`;
      lines.push(`Avant ton coup — tes pièces attaquées : ${desc(before, 'de ton camp')}.`);
      lines.push(`Après ton coup — tes pièces attaquées : ${desc(after, 'de ton camp')}.`);
      lines.push(`Pièces adverses que tu attaques : ${desc(oppT, 'adverse')}.`);
      setAnswer({ text: lines.join('\n') });
      onShow && onShow({ circles: [...after.map((t) => ({ sq: t.sq, c: t.danger ? 'R' : 'Y' })), ...oppT.map((t) => ({ sq: t.sq, c: 'G' }))], arrows: after.flatMap((t) => t.att.map((a) => ({ from: a, to: t.sq, c: 'R' }))) });
      return;
    }
    if (k === 'attackOrDevelop' && !qa.attackOrDevelop) { setAnswer({ text: developmentAdvice(fenAfter, side) }); return; }
    if (k === 'capture' && !qa.capture) {
      const c = new Chess(fenAfter);
      const caps = c.moves({ verbose: true }).filter((m) => m.captured);
      if (!caps.length) { setAnswer({ text: "Après ton coup, l'adversaire n'a aucune prise possible." }); return; }
      setBusy(true);
      const rows = [];
      try {
        for (const m of caps.slice(0, 6)) {
          const r = await evalMove(fenAfter, m.san, 11);
          rows.push(`${fr(m.san)} (prend ${NAMES[m.captured]}) → éval. après la meilleure suite : ${formatScore(r.playedLine, r.turn)} ; suite : ${r.refutation.map(fr).join(' ') || '—'}`);
        }
        setAnswer({ text: rows.join('\n') + `\n(${ENGINE_NAME}, profondeur ~11 ; + = avantage blanc)` });
      } catch (e) {
        setAnswer({ text: 'Prises possibles : ' + caps.map((m) => fr(m.san)).join(', ') + '.\nAnalyse moteur indisponible : ' + e.message });
      }
      setBusy(false);
      onShow && onShow({ arrows: caps.map((m) => ({ from: m.from, to: m.to, c: 'R' })), circles: [] });
      return;
    }
    if (k === 'engine') {
      setBusy(true);
      try {
        const r = await analyse(fenAfter, { depth: 15, multipv: 3 });
        const turn = fenAfter.split(' ')[1];
        setAnswer({ text: r.lines.map((l) => `${formatScore(l, turn)}  ${pvToSan(fenAfter, l.pv, 8).map(fr).join(' ')}`).join('\n') + `\n${ENGINE_NAME}, profondeur ${r.depth}. Évaluation du point de vue des Blancs.` });
        const b = r.lines[0];
        if (b) onShow && onShow({ arrows: [{ from: b.pv[0].slice(0, 2), to: b.pv[0].slice(2, 4), c: 'B' }], circles: [] });
      } catch (e) {
        setAnswer({ text: 'Analyse moteur indisponible : ' + e.message });
      }
      setBusy(false);
      return;
    }
    setAnswer({ text: qa[k] || "Pas de réponse rédigée pour cette question sur ce coup. Essaie « Quelle pièce est menacée ? », « Et si mon adversaire capture ? » ou l'analyse moteur, qui sont calculés sur la position." });
  };

  return (
    <div className="why">
      <div className="why-title">Comprendre le pourquoi — {fr(san)}</div>
      <div className="why-q">
        {QUESTIONS.map(([k, label]) => (
          <button key={k} className={`chip ${open === k ? 'on' : ''} ${qa[k] ? 'has' : ''}`} onClick={() => ask(k)}>{label}</button>
        ))}
        <button className={`chip ${open === 'engine' ? 'on' : ''}`} onClick={() => ask('engine')}>Analyse moteur</button>
      </div>
      {busy && <div className="muted small">Calcul en cours…</div>}
      {answer && !busy && <div className="why-a">{answer.text}</div>}
    </div>
  );
}
