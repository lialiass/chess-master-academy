// usage: node scripts/sf.cjs depth "e4 g6 d4 Bg7" ["e4 ..."]...
const { Chess } = require("chess.js");
const depth = +process.argv[2];
const lines = process.argv.slice(3);
const sf = require("stockfish")("lite-single", onLine);
let queue = [], cur = null, res = {};
function onLine(l) {
  if (!cur) return;
  const m = l.match(/ depth (\d+) .*multipv (\d+) score (cp|mate) (-?\d+).* pv (.+)/);
  if (m && +m[1] === depth) res[m[2]] = { s: m[3] === "cp" ? (+m[4] / 100) : "M" + m[4], pv: m[5].split(" ").slice(0, 8) };
  if (l.startsWith("bestmove")) { report(); next(); }
}
function report() {
  const c = cur.chess; const turn = c.turn();
  const out = Object.keys(res).map(k => {
    const r = res[k]; const t = new Chess(c.fen()); const san = [];
    for (const u of r.pv) { try { san.push(t.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; } }
    let s = r.s; if (typeof s === "number" && turn === "b") s = -s; // white POV
    return `   ${typeof s === "number" ? (s > 0 ? "+" : "") + s.toFixed(2) : s}  ${san.join(" ")}`;
  });
  console.log(`[${cur.str}] (${turn} to move)\n` + out.join("\n"));
}
function next() {
  res = {}; cur = queue.shift(); if (!cur) { sf.terminate(); return; }
  sf.processCommand("setoption name MultiPV value 4");
  sf.processCommand("position fen " + cur.chess.fen()); sf.processCommand("go depth " + depth);
}
for (const s of lines) { const c = new Chess(); try { for (const mv of s.split(/\s+/).filter(Boolean).filter(x => !/^\d+\./.test(x))) c.move(mv); queue.push({ str: s, chess: c }); } catch (e) { console.log("ILLEGAL in", s, e.message); } }
sf.processCommand("uci"); next();
