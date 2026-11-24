// Analyse des lignes de répertoire + construction de l'arbre indexé par position (FEN).
// Partagé entre l'application et le script de vérification (Node).
import { Chess } from 'chess.js';

const GLYPHS = ['??', '?!', '!?', '!!', '?', '!'];

/** Clé de position : placement + trait + roques + en passant (sans compteurs) → gère les transpositions. */
export function posKey(fen) {
  return fen.split(' ').slice(0, 4).join(' ');
}

function parseComment(raw) {
  const cal = [];
  const csl = [];
  let text = raw.replace(/\[%cal ([^\]]+)\]/g, (_, l) => {
    l.split(',').forEach((a) => {
      a = a.trim();
      if (/^[GRYB][a-h][1-8][a-h][1-8]$/.test(a)) cal.push({ c: a[0], from: a.slice(1, 3), to: a.slice(3, 5) });
    });
    return '';
  });
  text = text.replace(/\[%csl ([^\]]+)\]/g, (_, l) => {
    l.split(',').forEach((a) => {
      a = a.trim();
      if (/^[GRYB][a-h][1-8]$/.test(a)) csl.push({ c: a[0], sq: a.slice(1, 3) });
    });
    return '';
  });
  return { text: text.replace(/\s+/g, ' ').trim(), cal, csl };
}

/** Transforme "1.e4 e5 {commentaire} 2.Nf3?! ..." en liste de coups annotés. */
export function parseMoves(pgn) {
  const out = [];
  let i = 0;
  const s = pgn;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '{') {
      const j = s.indexOf('}', i);
      if (j < 0) throw new Error('Commentaire non fermé : ' + s.slice(i, i + 40));
      const c = parseComment(s.slice(i + 1, j));
      if (out.length) {
        const last = out[out.length - 1];
        last.comment = last.comment ? last.comment + ' ' + c.text : c.text;
        last.cal.push(...c.cal);
        last.csl.push(...c.csl);
      }
      i = j + 1;
      continue;
    }
    let j = i;
    while (j < s.length && !/\s|\{/.test(s[j])) j++;
    let tok = s.slice(i, j);
    i = j;
    tok = tok.replace(/^\d+\.(\.\.)?/, '');
    if (!tok) continue;
    let glyph = '';
    for (const g of GLYPHS) {
      if (tok.endsWith(g) && tok.length > g.length) { glyph = g; tok = tok.slice(0, -g.length); break; }
    }
    out.push({ san: tok, glyph, comment: '', cal: [], csl: [] });
  }
  return out;
}

/** Joue une suite de SAN (chaîne "e4 e5 Nf3" ou tableau) ; renvoie le Chess final (exception si illégal). */
export function playPath(path) {
  const c = new Chess();
  const arr = Array.isArray(path) ? path : path.split(/\s+/).filter(Boolean);
  for (const san of arr) c.move(san.replace(/^\d+\.(\.\.)?/, '').replace(/[?!]+$/, ''));
  return c;
}

export function oppTag(glyph) {
  switch (glyph) {
    case '??': return 'blunder';
    case '?': return 'mistake';
    case '?!': return 'inaccuracy';
    case '!?': return 'sideline';
    default: return 'theory';
  }
}

export const TAG_LABEL = {
  theory: 'Coup théorique',
  sideline: 'Coup solide moins fréquent',
  inaccuracy: 'Imprécision',
  mistake: 'Erreur',
  blunder: 'Gaffe',
  offbook: 'Coup hors-théorie',
};

/**
 * Construit le répertoire d'un camp.
 * Renvoie { nodes: Map<key, node>, lines: [...], errors: [...] }
 * node = { key, fen, path:[san], turn, user: {san, comment, cal, csl, chapterId, qa} | null,
 *          opp: Map<san, {san, glyph, tag, comment, cal, csl, chapterId}>, alts: {san: [type, text, refute]} , chapters:Set }
 */
export function buildRepertoire(chapters) {
  const nodes = new Map();
  const lines = [];
  const errors = [];
  const getNode = (c, path) => {
    const key = posKey(c.fen());
    let n = nodes.get(key);
    if (!n) {
      n = { key, fen: c.fen(), path: [...path], turn: c.turn(), user: null, opp: new Map(), alts: {}, chapters: new Set() };
      nodes.set(key, n);
    }
    return n;
  };
  for (const ch of chapters) {
    ch.lines.forEach((ln, li) => {
      let moves;
      try { moves = parseMoves(ln.pgn); } catch (e) { errors.push(`${ch.id}#${li}: ${e.message}`); return; }
      const c = new Chess();
      const path = [];
      const keys = [];
      const sans = [];
      for (const m of moves) {
        const node = getNode(c, path);
        node.chapters.add(ch.id);
        keys.push(node.key);
        let mv;
        try { mv = c.move(m.san); } catch {
          errors.push(`${ch.id} « ${ln.name} » : coup illégal ${m.san} après ${path.join(' ') || '(départ)'}`);
          return;
        }
        const isUser = node.turn === ch.side;
        if (isUser) {
          if (node.user && node.user.san !== mv.san) {
            errors.push(`Conflit de répertoire (${ch.id}) après « ${path.join(' ')} » : ${node.user.san} vs ${mv.san}`);
          } else if (!node.user) {
            node.user = { san: mv.san, comment: m.comment, cal: m.cal, csl: m.csl, chapterId: ch.id };
          } else if (!node.user.comment && m.comment) {
            Object.assign(node.user, { comment: m.comment, cal: m.cal, csl: m.csl });
          }
        } else {
          const ex = node.opp.get(mv.san);
          if (!ex) node.opp.set(mv.san, { san: mv.san, glyph: m.glyph, tag: oppTag(m.glyph), comment: m.comment, cal: m.cal, csl: m.csl, chapterId: ch.id });
          else if (!ex.comment && m.comment) Object.assign(ex, { comment: m.comment, cal: m.cal, csl: m.csl });
          else if (!ex.glyph && m.glyph) Object.assign(ex, { glyph: m.glyph, tag: oppTag(m.glyph) });
        }
        path.push(mv.san);
        sans.push(mv.san);
      }
      const endNode = getNode(c, path);
      endNode.chapters.add(ch.id);
      lines.push({
        id: `${ch.id}#${li}`,
        chapterId: ch.id,
        index: li,
        name: ln.name,
        side: ch.side,
        moves: sans,
        keys,
        finalComment: moves.length ? moves[moves.length - 1].comment : '',
      });
    });
    // alternatives et Q&R : clé = chemin → position
    for (const [p, alts] of Object.entries(ch.alts || {})) {
      let c;
      try { c = playPath(p); } catch { errors.push(`${ch.id} alts : chemin illégal « ${p} »`); continue; }
      const n = nodes.get(posKey(c.fen()));
      if (!n) { errors.push(`${ch.id} alts : position hors arbre « ${p} »`); continue; }
      for (const [san, val] of Object.entries(alts)) {
        const t = new Chess(c.fen());
        try { const mv = t.move(san); n.alts[mv.san] = val; } catch { errors.push(`${ch.id} alts : ${san} illégal après « ${p} »`); }
      }
    }
    for (const [p, qa] of Object.entries(ch.qa || {})) {
      let c;
      try { c = playPath(p); } catch { errors.push(`${ch.id} qa : chemin illégal « ${p} »`); continue; }
      const arr = p.split(/\s+/);
      const last = arr.pop();
      const prev = playPath(arr);
      const n = nodes.get(posKey(prev.fen()));
      if (!n || !n.user) { errors.push(`${ch.id} qa : « ${p} » n'est pas un coup du répertoire`); continue; }
      const t = new Chess(prev.fen());
      const mv = t.move(last);
      if (mv.san !== n.user.san) { errors.push(`${ch.id} qa : « ${p} » ne correspond pas au coup du répertoire (${n.user.san})`); continue; }
      n.user.qa = qa;
      void c;
    }
  }
  return { nodes, lines, errors };
}
