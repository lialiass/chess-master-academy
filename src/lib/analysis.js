// Analyse d'une partie : comparaison au répertoire + analyse moteur coup par coup.
import { Chess } from 'chess.js';
import { nodeAt, CHAPTER, fr, moveListText } from './repo.js';
import { analyse, whitePov, pvToSan, classifyLoss } from './engine.js';

/** Compare une partie au répertoire du camp `side`. */
export function repertoireCheck(moves, side) {
  const c = new Chess();
  let chapterId = null;
  let lastBook = -1;
  for (let i = 0; i < moves.length; i++) {
    const n = nodeAt(side, c.fen());
    if (!n) {
      return { chapterId, lastBook, exit: { ply: i, who: 'position', text: `Position hors répertoire après ${moveListText(moves.slice(0, i))}.` } };
    }
    const turn = c.turn();
    const san = moves[i];
    if (turn === side && n.user) {
      chapterId = chapterId || n.user.chapterId;
      if (san !== n.user.san) {
        return { chapterId, lastBook, exit: { ply: i, who: 'me', played: san, expected: n.user.san, node: n, alt: n.alts[san] || null, text: `Tu as quitté le répertoire au coup ${Math.floor(i / 2) + 1}${turn === 'b' ? '…' : '.'}${fr(san)} (répertoire : ${fr(n.user.san)}).` } };
      }
    } else if (turn !== side) {
      if (!n.opp.has(san)) {
        const ch = n.chapters.size ? [...n.chapters][0] : chapterId;
        return { chapterId: chapterId || ch, lastBook, exit: { ply: i, who: 'opp', played: san, text: `L’adversaire est sorti de la théorie du répertoire au coup ${Math.floor(i / 2) + 1}${turn === 'b' ? '…' : '.'}${fr(san)}.` } };
      }
    }
    try { c.move(san); } catch { break; }
    lastBook = i;
  }
  return { chapterId, lastBook, exit: null };
}

/**
 * Analyse moteur des coups de `side` (jusqu'à maxPlies demi-coups).
 * Renvoie la liste { ply, san, loss, cls, bestSan, bestPv, fenBefore, evalAfter }
 */
export async function engineReview(moves, side, { depth = 11, maxPlies = 80, onProgress } = {}) {
  const c = new Chess();
  const out = [];
  let prev = null; // éval (pov blanc) de la position courante, meilleur coup
  const evalPos = async (fen) => {
    const r = await analyse(fen, { depth, multipv: 1 });
    const l = r.lines[0];
    return { score: l ? whitePov(l, fen.split(' ')[1]) : 0, best: r.bestmove, pv: l ? l.pv : [] };
  };
  const n = Math.min(moves.length, maxPlies);
  prev = await evalPos(c.fen());
  for (let i = 0; i < n; i++) {
    const fenBefore = c.fen();
    const turn = c.turn();
    let mv;
    try { mv = c.move(moves[i]); } catch { break; }
    const after = c.isGameOver() ? { score: c.isCheckmate() ? (turn === 'w' ? 100000 : -100000) : 0, best: null, pv: [] } : await evalPos(c.fen());
    if (turn === side) {
      const sign = side === 'w' ? 1 : -1;
      const lossRaw = sign * (prev.score - after.score);
      const loss = Math.max(0, Math.min(lossRaw, 2000));
      const bestUci = prev.best;
      const bestSan = bestUci ? pvToSan(fenBefore, [bestUci], 1)[0] : null;
      const isBest = bestUci && mv.from + mv.to + (mv.promotion || '') === bestUci;
      out.push({ ply: i, san: mv.san, loss: isBest ? 0 : loss, cls: isBest ? 'good' : classifyLoss(loss), bestSan, bestPv: pvToSan(fenBefore, prev.pv, 5), fenBefore, captured: !!mv.captured, before: prev.score, after: after.score });
    }
    prev = after;
    onProgress && onProgress((i + 1) / n);
  }
  return out;
}

/** Rapport complet pour la page « Partie complète » ou une partie importée. */
export function buildReport(moves, side, review, rep) {
  const c = new Chess();
  let castledAt = null;
  let queensOffAt = null;
  let myCaptures = 0;
  const center = { e4: 0, d4: 0, e5: 0, d5: 0 };
  moves.forEach((s, i) => {
    const turn = c.turn();
    const m = c.move(s);
    if (turn === side && (m.san === 'O-O' || m.san === 'O-O-O') && castledAt == null) castledAt = i;
    if (turn === side && m.captured) myCaptures++;
    const qs = c.board().flat().filter((p) => p && p.type === 'q');
    if (queensOffAt == null && qs.length === 0) queensOffAt = i;
    if (i === 19) ['e4', 'd4', 'e5', 'd5'].forEach((sq) => { const p = c.get(sq); if (p && p.type === 'p' && p.color === side) center[sq] = 1; });
  });
  const tactics = review.filter((r) => r.cls === 'blunder' || r.cls === 'mistake');
  const missed = review.filter((r) => r.loss >= 150 && !r.captured);
  const strategic = review.filter((r) => r.cls === 'inacc');
  const worst = [...review].sort((a, b) => b.loss - a.loss).slice(0, 3).filter((r) => r.loss >= 60);
  const moveNo = (ply) => `${Math.floor(ply / 2) + 1}${ply % 2 ? '…' : '.'}`;
  const sections = [];
  sections.push({
    h: 'Ouverture',
    t: rep.exit
      ? rep.exit.text + (rep.exit.who === 'me' ? (rep.exit.alt ? ` Dans le répertoire, ce coup est classé « ${rep.exit.alt[0] === 'alt' ? 'bonne alternative' : rep.exit.alt[0] === 'inacc' ? 'imprécision' : 'erreur'} » : ${rep.exit.alt[1]}` : '') : '')
      : 'Tu es resté dans le répertoire du début à la fin de la théorie connue.',
  });
  if (rep.chapterId) sections.push({ h: 'Ouverture reconnue', t: CHAPTER[rep.chapterId]?.title || rep.chapterId });
  sections.push({ h: 'Occasions tactiques et erreurs', t: tactics.length ? tactics.map((r) => `${moveNo(r.ply)}${fr(r.san)} (perte ${(r.loss / 100).toFixed(1)} ; meilleur ${fr(r.bestSan)})`).join(' · ') : 'Aucune erreur grave détectée par le moteur.' });
  if (missed.length) sections.push({ h: 'Occasions manquées', t: missed.map((r) => `${moveNo(r.ply)} tu pouvais jouer ${fr(r.bestSan)} au lieu de ${fr(r.san)}`).join(' · ') });
  sections.push({ h: 'Imprécisions stratégiques', t: strategic.length ? `${strategic.length} coup(s) imprécis : ` + strategic.slice(0, 6).map((r) => moveNo(r.ply) + fr(r.san)).join(', ') : 'Aucune imprécision notable.' });
  sections.push({ h: 'Échanges', t: `Tu as effectué ${myCaptures} prise(s). ${queensOffAt != null ? `Les dames ont disparu au demi-coup ${queensOffAt + 1}.` : 'Les dames sont restées sur l’échiquier.'}` });
  sections.push({ h: 'Centre', t: Object.values(center).some(Boolean) ? `Au coup 10, tu avais des pions en ${Object.keys(center).filter((k) => center[k]).join(', ')}.` : 'Au coup 10, tu n’avais aucun pion central (e4/d4/e5/d5).' });
  sections.push({ h: 'Sécurité du roi', t: castledAt != null ? `Roque effectué au coup ${Math.floor(castledAt / 2) + 1}.` : 'Tu n’as pas roqué : vérifie la sécurité de ton roi.' });
  sections.push({ h: 'Transition vers la finale', t: queensOffAt != null ? 'La partie est passée en finale sans dames : revois les principes (roi actif, pions passés).' : 'Pas de finale sans dames dans cette partie.' });
  return { sections, worst };
}
