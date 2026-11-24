import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.cburnett.css';

const BRUSH = { G: 'green', R: 'red', Y: 'yellow', B: 'blue' };

export function destsOf(fen) {
  const c = new Chess(fen);
  const dests = new Map();
  for (const m of c.moves({ verbose: true })) {
    if (!dests.has(m.from)) dests.set(m.from, []);
    dests.get(m.from).push(m.to);
  }
  return dests;
}

/**
 * props: fen, orientation ('white'|'black'), movable (bool), onMove(san, moveObj),
 * lastMove [from,to], arrows [{from,to,c}], circles [{sq,c}], marks {sq: cssClass}
 */
export default function Board({ fen, orientation = 'white', movable = true, onMove, lastMove, arrows = [], circles = [], marks = {}, nonce = 0 }) {
  const el = useRef(null);
  const cg = useRef(null);
  const [promo, setPromo] = useState(null); // {from,to,color}
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  useEffect(() => {
    cg.current = Chessground(el.current, {
      animation: { enabled: true, duration: 220 },
      highlight: { lastMove: true, check: true },
      premovable: { enabled: false },
      draggable: { enabled: true, showGhost: true },
      drawable: { enabled: true, visible: true },
      coordinates: true,
    });
    // l'échiquier suit la taille de son conteneur (rotation du téléphone, fenêtre redimensionnée)
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => cg.current && cg.current.redrawAll());
      ro.observe(el.current);
    }
    return () => { ro && ro.disconnect(); cg.current && cg.current.destroy(); };
  }, []);

  useEffect(() => {
    if (!cg.current) return;
    const c = new Chess(fen);
    const turn = c.turn() === 'w' ? 'white' : 'black';
    const custom = new Map(Object.entries(marks));
    cg.current.set({
      fen,
      orientation,
      turnColor: turn,
      check: c.inCheck() ? turn : false,
      lastMove: lastMove || undefined,
      highlight: { lastMove: true, check: true, custom },
      movable: {
        free: false,
        color: movable ? turn : undefined,
        dests: movable ? destsOf(fen) : new Map(),
        showDests: true,
        events: {
          after: (from, to) => {
            const piece = c.get(from);
            if (piece && piece.type === 'p' && (to[1] === '8' || to[1] === '1')) {
              setPromo({ from, to, color: piece.color });
              return;
            }
            const t = new Chess(fen);
            try {
              const mv = t.move({ from, to });
              onMoveRef.current && onMoveRef.current(mv.san, mv);
            } catch {
              cg.current.set({ fen });
            }
          },
        },
      },
      drawable: {
        autoShapes: [
          ...arrows.map((a) => ({ orig: a.from, dest: a.to, brush: BRUSH[a.c] || 'green' })),
          ...circles.map((s) => ({ orig: s.sq, brush: BRUSH[s.c] || 'green' })),
        ],
      },
    });
  }, [fen, nonce, orientation, movable, lastMove && lastMove.join(), JSON.stringify(arrows), JSON.stringify(circles), JSON.stringify(marks)]);

  const choose = (p) => {
    const { from, to } = promo;
    setPromo(null);
    const t = new Chess(fen);
    try {
      const mv = t.move({ from, to, promotion: p });
      onMoveRef.current && onMoveRef.current(mv.san, mv);
    } catch {
      cg.current.set({ fen });
    }
  };

  return (
    <div className="board-wrap">
      <div className="board" ref={el} />
      {promo && (
        <div className="promo">
          <div className="promo-box">
            <div className="promo-title">Promotion</div>
            {['q', 'r', 'b', 'n'].map((p) => (
              <button key={p} className="promo-piece" onClick={() => choose(p)} aria-label={{ q: 'Dame', r: 'Tour', b: 'Fou', n: 'Cavalier' }[p]}>
                {(promo.color === 'w' ? { q: '♕', r: '♖', b: '♗', n: '♘' } : { q: '♛', r: '♜', b: '♝', n: '♞' })[p]}
              </button>
            ))}
            <button className="btn ghost" onClick={() => { setPromo(null); cg.current.set({ fen }); }}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
