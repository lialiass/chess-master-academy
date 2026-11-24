// Interface Stockfish (WASM, dans un Web Worker). Aucune évaluation n'est jamais inventée :
// si le moteur ne répond pas, les fonctions rejettent avec un message explicite.
import { Chess } from 'chess.js';

const ENGINE_URL = `${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`;
export const ENGINE_NAME = 'Stockfish 19 lite (WASM)';

class EngineWorker {
  constructor() {
    this.worker = null;
    this.ready = null;
    this.queue = Promise.resolve();
    this.listener = null;
    this.failed = null;
  }

  init() {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      try {
        this.worker = new Worker(ENGINE_URL);
      } catch (e) {
        this.failed = 'Impossible de démarrer le moteur : ' + e.message;
        reject(new Error(this.failed));
        return;
      }
      const t = setTimeout(() => {
        this.failed = "Le moteur n'a pas répondu (délai dépassé).";
        reject(new Error(this.failed));
      }, 15000);
      this.worker.onerror = (e) => {
        clearTimeout(t);
        this.failed = 'Erreur du moteur : ' + (e.message || 'chargement impossible');
        reject(new Error(this.failed));
      };
      this.worker.onmessage = (e) => {
        const line = typeof e.data === 'string' ? e.data : '';
        if (line === 'uciok') {
          clearTimeout(t);
          this.worker.onmessage = (ev) => this.listener && this.listener(String(ev.data));
          resolve();
        }
      };
      this.worker.postMessage('uci');
    });
    return this.ready;
  }

  send(cmd) { this.worker.postMessage(cmd); }

  /** Lance une recherche ; renvoie { lines: [{multipv, cp, mate, pv:[uci]}], bestmove } */
  run(setup, go, timeoutMs = 20000) {
    const job = async () => {
      await this.init();
      return new Promise((resolve, reject) => {
        const lines = {};
        let depth = 0;
        const timer = setTimeout(() => { this.send('stop'); }, timeoutMs);
        this.listener = (line) => {
          if (line.startsWith('info') && line.includes(' pv ')) {
            const d = +(line.match(/ depth (\d+)/) || [])[1];
            const mp = +((line.match(/ multipv (\d+)/) || [])[1] || 1);
            const sc = line.match(/ score (cp|mate) (-?\d+)/);
            const pv = line.split(' pv ')[1].trim().split(' ');
            if (sc && !line.includes('bound')) {
              lines[mp] = { multipv: mp, depth: d, cp: sc[1] === 'cp' ? +sc[2] : null, mate: sc[1] === 'mate' ? +sc[2] : null, pv };
              depth = Math.max(depth, d);
            }
          } else if (line.startsWith('bestmove')) {
            clearTimeout(timer);
            this.listener = null;
            const bm = line.split(' ')[1];
            if (!bm || bm === '(none)') { resolve({ lines: [], bestmove: null, depth }); return; }
            resolve({ lines: Object.values(lines).sort((a, b) => a.multipv - b.multipv), bestmove: bm, depth });
          }
        };
        try { setup.forEach((c) => this.send(c)); this.send(go); } catch (e) { clearTimeout(timer); reject(e); }
      });
    };
    const p = this.queue.then(job, job);
    this.queue = p.catch(() => {});
    return p;
  }
}

const analysisEngine = new EngineWorker();
const playEngine = new EngineWorker();

export function engineStatus() {
  return analysisEngine.failed || playEngine.failed || null;
}

/** score pour le camp au trait → en centipions du point de vue des Blancs */
export function whitePov(line, turn) {
  if (!line) return null;
  const s = line.mate != null ? (line.mate > 0 ? 100000 - line.mate : -100000 - line.mate) : line.cp;
  return turn === 'w' ? s : -s;
}

export function formatScore(line, turn) {
  if (!line) return '—';
  if (line.mate != null) {
    const m = turn === 'w' ? line.mate : -line.mate;
    return (m > 0 ? '#' : '#-') + Math.abs(m);
  }
  const v = (turn === 'w' ? line.cp : -line.cp) / 100;
  return (v > 0 ? '+' : '') + v.toFixed(2);
}

export function pvToSan(fen, pv, max = 8) {
  const c = new Chess(fen);
  const out = [];
  for (const u of pv.slice(0, max)) {
    try { out.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; }
  }
  return out;
}

export async function analyse(fen, { depth = 14, multipv = 1, searchmoves = null, timeoutMs = 20000 } = {}) {
  const res = await analysisEngine.run(
    ['ucinewgame', 'setoption name UCI_LimitStrength value false', 'setoption name Skill Level value 20', `setoption name MultiPV value ${multipv}`, `position fen ${fen}`],
    `go depth ${depth}${searchmoves ? ' searchmoves ' + searchmoves : ''}`,
    timeoutMs,
  );
  if (!res.lines.length && res.bestmove) throw new Error('Analyse incomplète.');
  return res;
}

/**
 * Évalue un coup joué : perte (cp, pour le camp qui joue) par rapport au meilleur coup.
 * Renvoie { loss, bestSan, bestLine, playedLine, refutation:[san] }
 */
export async function evalMove(fen, san, depth = 13) {
  const c = new Chess(fen);
  const mv = c.move(san);
  const uci = mv.from + mv.to + (mv.promotion || '');
  const turn = fen.split(' ')[1];
  const best = await analyse(fen, { depth, multipv: 1 });
  const b = best.lines[0];
  let p = b;
  if (best.bestmove !== uci) {
    const r = await analyse(fen, { depth, multipv: 1, searchmoves: uci });
    p = r.lines[0];
  }
  const sb = whitePov(b, turn);
  const sp = whitePov(p, turn);
  const loss = turn === 'w' ? sb - sp : sp - sb;
  return {
    loss: Math.max(0, loss),
    bestSan: pvToSan(fen, [best.bestmove], 1)[0],
    bestLine: b,
    playedLine: p,
    turn,
    depth: Math.min(b?.depth || depth, p?.depth || depth),
    refutation: p ? pvToSan(fen, p.pv, 6).slice(1) : [],
    bestPv: b ? pvToSan(fen, b.pv, 6) : [],
  };
}

/** Classement d'un coup selon la perte (cp). */
// Seuils (centipions perdus) : ≤ 25 solide · ≤ 80 imprécis · ≤ 200 erreur · au-delà grosse erreur
export function classifyLoss(loss) {
  if (loss <= 25) return 'good';
  if (loss <= 80) return 'inacc';
  if (loss <= 200) return 'mistake';
  return 'blunder';
}

// Niveaux d'adversaire simulés (approximatifs, pas une garantie de force Elo)
export const LEVELS = {
  800: { skill: 0, depth: 3, randomPct: 0.18, label: '800 (débutant)' },
  1000: { skill: 2, depth: 4, randomPct: 0.1, label: '1 000' },
  1200: { skill: 5, depth: 6, randomPct: 0.06, label: '1 200' },
  1500: { skill: 9, depth: 8, randomPct: 0.03, label: '1 500' },
  1800: { skill: 13, depth: 10, randomPct: 0.01, label: '1 800' },
};

export async function engineMove(fen, level = 1200) {
  const L = LEVELS[level] || LEVELS[1200];
  const res = await playEngine.run(
    ['setoption name UCI_LimitStrength value false', `setoption name Skill Level value ${L.skill}`, 'setoption name MultiPV value 1', `position fen ${fen}`],
    `go depth ${L.depth}`,
    15000,
  );
  if (!res.bestmove) return null;
  const c = new Chess(fen);
  const u = res.bestmove;
  return c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || 'q' }).san;
}
