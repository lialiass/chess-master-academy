// Vérification complète du répertoire : légalité, cohérence (un seul coup par position),
// et contrôle Stockfish de chaque coup du répertoire, des alternatives et des pièges.
// Usage : node scripts/verify.mjs [profondeur=14]
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { Chess } from 'chess.js';
import { buildRepertoire, parseMoves, playPath, posKey } from '../src/lib/pgnline.js';
import { BLACK_CHAPTERS } from '../src/data/black.js';
import { WHITE_CHAPTERS } from '../src/data/white.js';
import { TRAPS } from '../src/data/traps.js';

const require = createRequire(import.meta.url);
const DEPTH = +(process.argv[2] || 14);

// ---------- moteur ----------
let resolveCur = null;
let info = {};
const sf = require('stockfish')('lite-single', (line) => {
  const m = line.match(/ depth (\d+) .*multipv (\d+) score (cp|mate) (-?\d+).* pv (\S+)/);
  if (m && +m[1] === DEPTH) info[m[2]] = { cp: m[3] === 'cp' ? +m[4] : (+m[4] > 0 ? 10000 - +m[4] : -10000 - +m[4]), move: m[5] };
  if (line.startsWith('bestmove') && resolveCur) { const r = resolveCur; resolveCur = null; r(info); }
});
sf.processCommand('uci');
function analyse(fen, multipv = 1, searchmoves = null) {
  return new Promise((res) => {
    info = {};
    resolveCur = res;
    sf.processCommand('setoption name MultiPV value ' + multipv);
    sf.processCommand('position fen ' + fen);
    sf.processCommand('go depth ' + DEPTH + (searchmoves ? ' searchmoves ' + searchmoves : ''));
  });
}
const uci = (c, san) => { const t = new Chess(c.fen()); const m = t.move(san); return m.from + m.to + (m.promotion || ''); };
// perte (en centipions, du point de vue du joueur au trait) entre le meilleur coup et `san`
async function loss(fen, san) {
  const c = new Chess(fen);
  const best = await analyse(fen, 1);
  const b = best['1'];
  const mv = uci(c, san);
  if (b && b.move === mv) return { loss: 0, best: b.cp, played: b.cp, bestMove: b.move };
  const p = (await analyse(fen, 1, mv))['1'];
  return { loss: Math.max(0, b.cp - p.cp), best: b.cp, played: p.cp, bestMove: b.move };
}

const report = { errors: [], warnings: [], stats: {}, evals: {} };
const fmt = (cp) => (cp / 100).toFixed(2);

for (const [side, chapters] of [['b', BLACK_CHAPTERS], ['w', WHITE_CHAPTERS]]) {
  const rep = buildRepertoire(chapters);
  report.errors.push(...rep.errors);
  let userMoves = 0;
  for (const n of rep.nodes.values()) {
    if (n.user) {
      userMoves++;
      const r = await loss(n.fen, n.user.san);
      report.evals[n.key] = { best: r.best, played: r.played, san: n.user.san, depth: DEPTH };
      if (r.loss > 60) report.warnings.push(`[${side}] ${n.path.join(' ')} → ${n.user.san} perd ${fmt(r.loss)} (meilleur ${r.bestMove})`);
      if (r.loss > 120) report.errors.push(`[${side}] coup de répertoire douteux : ${n.path.join(' ')} → ${n.user.san} (perte ${fmt(r.loss)})`);
    }
    for (const [san, [type]] of Object.entries(n.alts)) {
      const r = await loss(n.fen, san);
      if (type === 'alt' && r.loss > 25) report.warnings.push(`[${side}] alt « ${san} » après ${n.path.join(' ')} perd ${fmt(r.loss)} : mieux vaut 'inacc'`);
      if (type === 'err' && r.loss < 100) report.warnings.push(`[${side}] err « ${san} » après ${n.path.join(' ')} ne perd que ${fmt(r.loss)}`);
      if (type === 'inacc' && r.loss > 250) report.warnings.push(`[${side}] inacc « ${san} » après ${n.path.join(' ')} perd ${fmt(r.loss)} : c'est une erreur`);
    }
    for (const o of n.opp.values()) {
      if (o.tag === 'mistake' || o.tag === 'blunder' || o.tag === 'inaccuracy') {
        const r = await loss(n.fen, o.san);
        const need = { inaccuracy: 30, mistake: 80, blunder: 200 }[o.tag];
        if (r.loss < need) report.warnings.push(`[${side}] coup adverse ${o.san}${o.glyph} après ${n.path.join(' ')} ne perd que ${fmt(r.loss)}`);
      }
    }
  }
  report.stats[side] = { positions: rep.nodes.size, userMoves, lines: rep.lines.length };
}

for (const t of TRAPS) {
  try {
    const c = playPath(parseMoves(t.setup).map((m) => m.san));
    const sol = t.solution.split(/\s+/);
    const t2 = new Chess(c.fen());
    for (let i = 0; i < sol.length; i++) {
      if (i % 2 === 0) {
        const r = await loss(t2.fen(), sol[i]);
        if (r.loss > 40) report.warnings.push(`[piège ${t.id}] coup ${sol[i]} perd ${fmt(r.loss)} (meilleur ${r.bestMove})`);
      }
      t2.move(sol[i]);
    }
    for (const san of Object.keys(t.wrong || {})) {
      const r = await loss(c.fen(), san);
      if (r.loss < 100) report.warnings.push(`[piège ${t.id}] coup « faux » ${san} ne perd que ${fmt(r.loss)}`);
      const ref = t.wrong[san][1];
      if (ref) { const t3 = new Chess(c.fen()); t3.move(san); ref.split(/\s+/).forEach((s) => t3.move(s)); }
    }
    for (const alts of Object.values(t.accept || {})) for (const san of alts) new Chess(c.fen()).move(san);
    const d = parseMoves(t.defense);
    const first = t.defense.trim().match(/^(\d+)\.(\.\.)?/);
    const ply = (+first[1] - 1) * 2 + (first[2] ? 1 : 0);
    const base = [...parseMoves(t.setup).map((m) => m.san), ...sol].slice(0, ply);
    playPath([...base, ...d.map((m) => m.san)]);
  } catch (e) {
    report.errors.push(`[piège ${t.id}] ${e.message}`);
  }
}

sf.terminate();
writeFileSync(new URL('../src/data/evals.json', import.meta.url), JSON.stringify({ engine: 'Stockfish 19 lite (WASM)', depth: DEPTH, date: new Date().toISOString().slice(0, 10), evals: report.evals }));
console.log('STATS', JSON.stringify(report.stats));
console.log('\nERREURS (' + report.errors.length + ')\n' + report.errors.join('\n'));
console.log('\nAVERTISSEMENTS (' + report.warnings.length + ')\n' + report.warnings.join('\n'));
process.exit(report.errors.length ? 1 : 0);
