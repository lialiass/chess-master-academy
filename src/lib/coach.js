// Le « professeur » : phrases courtes, concrètes, liées à l'échiquier.
// - intention du coup joué, conséquence, indices progressifs (sans donner la réponse trop tôt).
import { Chess } from 'chess.js';
import { fr } from './repo.js';

export const PIECE = { p: 'pion', n: 'cavalier', b: 'fou', r: 'tour', q: 'dame', k: 'roi' };
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const CENTER_FILES = 'cdef';
const isHome = (m) => (m.color === 'w' ? m.from[1] === '1' : m.from[1] === '8');
const opp = (c) => (c === 'w' ? 'b' : 'w');
const sideName = (c) => (c === 'w' ? 'les Blancs' : 'les Noirs');

/** Première phrase (ou deux si très courtes) d'un commentaire. */
export function short(text, max = 150) {
  if (!text) return '';
  const parts = text.split(/(?<=[.!?])\s+/);
  let out = parts[0];
  if (out.length < 60 && parts[1] && (out + ' ' + parts[1]).length <= max) out += ' ' + parts[1];
  return out.length > max + 40 ? out.slice(0, max).replace(/\s\S*$/, '') + '…' : out;
}

function verbose(fen, san) {
  const c = new Chess(fen);
  const m = c.move(san);
  return { m, after: c };
}

/** Pièces adverses attaquées par la pièce qui vient de bouger (et qui ne l'étaient pas avant). */
function newTargets(fen, san) {
  const before = new Chess(fen);
  const { m, after } = verbose(fen, san);
  const out = [];
  for (const row of after.board()) for (const p of row) {
    if (!p || p.color === m.color || p.type === 'k') continue;
    const att = after.attackers(p.square, m.color);
    if (att.includes(m.to) && !before.attackers(p.square, m.color).includes(m.from)) out.push(p);
  }
  return out.sort((a, b) => VAL[b.type] - VAL[a.type]);
}

/** « Tu as voulu… » : ce que cherchait le coup joué. */
export function intentOf(fen, san) {
  const { m } = verbose(fen, san);
  const name = PIECE[m.piece];
  if (m.san.startsWith('O-O')) return 'Tu as voulu mettre ton roi à l’abri en roquant';
  if (m.captured) return `Tu as voulu prendre le ${PIECE[m.captured]} en ${m.to}`;
  if ((m.piece === 'n' || m.piece === 'b') && isHome(m)) return `Tu as voulu développer ton ${name}, ce qui est une bonne idée en général`;
  if (m.piece === 'p') {
    if (CENTER_FILES.includes(m.to[0])) return `Tu as voulu jouer au centre avec ton pion ${m.to[0]}`;
    return `Tu as voulu avancer un pion sur l’aile ${'abc'.includes(m.to[0]) ? 'dame' : 'roi'}`;
  }
  if (m.piece === 'q') return 'Tu as voulu activer ta dame';
  if (m.piece === 'r') return 'Tu as voulu activer ta tour';
  if (m.piece === 'k') return 'Tu as voulu déplacer ton roi';
  const t = newTargets(fen, san);
  if (t.length) return `Tu as voulu attaquer le ${PIECE[t[0].type]} en ${t[0].square} avec ton ${name}`;
  return `Tu as voulu replacer ton ${name}`;
}

/** Conséquence concrète d'un coup selon la réponse adverse (réfutation moteur ou rédigée). */
export function consequence(fen, san, reply, loss = null) {
  if (!reply) return '';
  const { after } = verbose(fen, san);
  let r;
  try { r = after.move(reply); } catch { return ''; }
  const who = sideName(opp(new Chess(fen).turn()));
  let effect;
  if (r.captured) effect = `et prendre ton ${PIECE[r.captured]}`;
  else if (r.san.includes('+')) effect = 'avec échec';
  else if (r.piece === 'p' && 'de'.includes(r.to[0])) effect = 'et gagner de l’espace au centre';
  else if (loss != null && loss >= 200) effect = 'et prendre un net avantage';
  else effect = 'et obtenir une position plus agréable';
  return `Mais ici, ${who} peuvent répondre ${fr(reply)} ${effect}.`;
}

/** Indice niveau 1 (stratégique, ne nomme pas la pièce). */
export function strategicHint(fen, expected) {
  const { m, after } = verbose(fen, expected);
  if (m.san.startsWith('O-O')) return 'Pense à la sécurité de ton roi avant d’agir.';
  if (m.captured) return 'Une pièce adverse peut être capturée. Qu’est-ce qui n’est pas assez défendu ?';
  if (after.inCheck()) return 'Cherche un coup qui met le roi adverse sous pression.';
  const t = newTargets(fen, expected);
  if (m.piece === 'p' && (m.to === 'g6' || m.to === 'g3' || m.to === 'b6' || m.to === 'b3')) return 'Prépare une belle diagonale pour un de tes fous.';
  if (m.piece === 'p' && CENTER_FILES.includes(m.to[0])) return 'Regarde le centre : un pion peut contester les cases centrales.';
  if ((m.piece === 'n' || m.piece === 'b') && isHome(m)) return t.length ? 'Développe une pièce… en attaquant quelque chose.' : 'Une de tes pièces n’est pas encore développée.';
  if (t.length) return 'Une pièce adverse peut être attaquée avec gain de temps.';
  if (m.piece === 'p') return `Un petit coup de pion sur l’aile ${'abc'.includes(m.to[0]) ? 'dame' : 'roi'} prépare la suite.`;
  return 'Cherche la pièce la moins active et donne-lui un meilleur rôle.';
}

/** Indice niveau 2 (précis : la pièce, et ce qu'elle vise). Renvoie { text, circles } */
export function preciseHint(fen, expected) {
  const { m } = verbose(fen, expected);
  const t = newTargets(fen, expected);
  const name = PIECE[m.piece];
  let text = m.san.startsWith('O-O') ? `Ton roi et ta tour peuvent bouger ensemble.` : `Joue avec ton ${name} (${m.from}).`;
  if (m.captured) text += ` Il peut capturer quelque chose.`;
  else if (t.length) text += ` Cherche une case d’où il attaque le ${PIECE[t[0].type]} en ${t[0].square}.`;
  else if (m.piece === 'p') text += ` Avance-le d’une ou deux cases.`;
  else text += ` Cherche une case plus active.`;
  return { text, circles: [{ sq: m.from, c: 'Y' }, ...(t.length && !m.captured ? [{ sq: t[0].square, c: 'R' }] : [])] };
}

/** Indice niveau 3 : cases de départ et d'arrivée. */
export function squaresHint(fen, expected) {
  const { m } = verbose(fen, expected);
  return { text: 'Les deux cases surlignées forment le coup. À toi de le jouer !', circles: [{ sq: m.from, c: 'Y' }, { sq: m.to, c: 'G' }] };
}

const PRAISE = ['Exact !', 'Bien joué !', 'Parfait !', 'Très bien !', 'C’est ça !', 'Bravo !'];
export function praise(streak) {
  const p = PRAISE[Math.floor(Math.random() * PRAISE.length)];
  return streak >= 3 ? `${p} ${streak} d’affilée` : p;
}

/** Niveau d'aide automatique selon le nombre d'erreurs sur la position. */
export function autoLevel(tries) {
  if (tries >= 7) return 3;
  if (tries >= 5) return 2;
  if (tries >= 3) return 1;
  return 0;
}
