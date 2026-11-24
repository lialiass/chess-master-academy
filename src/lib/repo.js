import { Chess } from 'chess.js';
import { buildRepertoire, posKey, parseMoves } from './pgnline.js';
import { BLACK_CHAPTERS } from '../data/black.js';
import { WHITE_CHAPTERS } from '../data/white.js';
import EVALS from '../data/evals.json';

export const CHAPTERS = [...WHITE_CHAPTERS, ...BLACK_CHAPTERS];
export const CHAPTER = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));
export const REP = { w: buildRepertoire(WHITE_CHAPTERS), b: buildRepertoire(BLACK_CHAPTERS) };
export const LINE = Object.fromEntries([...REP.w.lines, ...REP.b.lines].map((l) => [l.id, l]));
export const ALL_LINES = [...REP.w.lines, ...REP.b.lines];
export { posKey, parseMoves, EVALS };

if (REP.w.errors.length || REP.b.errors.length) console.warn('Erreurs de répertoire', REP.w.errors, REP.b.errors);

export function nodeAt(side, fen) {
  return REP[side].nodes.get(posKey(fen));
}

export function linesOf(chapterId) {
  return ALL_LINES.filter((l) => l.chapterId === chapterId);
}

// Notation française : C (cavalier), F (fou), T (tour), D (dame), R (roi)
const FR = { N: 'C', B: 'F', R: 'T', Q: 'D', K: 'R' };
export function fr(san) {
  if (!san) return '';
  return san.replace(/^[NBRQK]/, (m) => FR[m]).replace(/=([NBRQ])/, (_, p) => '=' + FR[p]);
}

export function moveListText(moves, startPly = 0) {
  const parts = [];
  moves.forEach((m, i) => {
    const ply = startPly + i;
    if (ply % 2 === 0) parts.push(`${ply / 2 + 1}.${fr(m)}`);
    else if (i === 0) parts.push(`${Math.floor(ply / 2) + 1}…${fr(m)}`);
    else parts.push(fr(m));
  });
  return parts.join(' ');
}

/** Toutes les positions du répertoire où l'élève doit jouer, pour un chapitre (ou tous). */
export function userPositions(side, chapterId = null) {
  const out = [];
  for (const n of REP[side].nodes.values()) {
    if (n.user && (!chapterId || n.chapters.has(chapterId))) out.push(n);
  }
  return out;
}

export function cardInfo(side, node, chapterId) {
  return {
    key: node.key,
    fen: node.fen,
    san: node.user.san,
    side,
    chapterId: chapterId || node.user.chapterId,
    path: node.path,
    label: (CHAPTER[chapterId || node.user.chapterId]?.title || '') + ' — après ' + (moveListText(node.path) || 'le début'),
  };
}

/** Arbre de répertoire (pour la carte) depuis la position initiale. */
export function treeFrom(side, maxDepth = 40) {
  const seen = new Set();
  const walk = (fen, path, depth) => {
    const n = nodeAt(side, fen);
    if (!n || depth > maxDepth) return null;
    const children = [];
    const moves = n.user ? [{ san: n.user.san, user: true }] : [...n.opp.values()].map((o) => ({ san: o.san, user: false, tag: o.tag, glyph: o.glyph }));
    for (const m of moves) {
      const c = new Chess(fen);
      c.move(m.san);
      const k = posKey(c.fen());
      const child = { san: m.san, user: m.user, tag: m.tag, glyph: m.glyph, key: n.key, path: [...path, m.san], childKey: k, children: [] };
      if (!seen.has(k)) {
        seen.add(k);
        const sub = walk(c.fen(), [...path, m.san], depth + 1);
        child.children = sub ? sub.children : [];
      } else child.transposition = true;
      children.push(child);
    }
    return { children };
  };
  return walk(new Chess().fen(), [], 0);
}
