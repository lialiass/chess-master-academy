import { useMemo, useState } from 'react';
import Trainer from '../components/Trainer.jsx';
import PlayGame from '../components/PlayGame.jsx';
import { CHAPTERS, linesOf, userPositions, moveListText } from '../lib/repo.js';
import { useStore, masteryOf } from '../lib/store.js';
import { short } from '../lib/coach.js';

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export function chapterMastery(state, side, chapterId) {
  const pos = userPositions(side, chapterId);
  if (!pos.length) return { total: 0, known: 0, mastered: 0, pct: 0, rate: null };
  let known = 0, mastered = 0, att = 0, succ = 0;
  for (const n of pos) {
    const c = state.cards[n.key];
    if (!c) continue;
    const m = masteryOf(c);
    if (m >= 2) known++;
    if (m >= 4) mastered++;
    att += c.attempts; succ += c.successes;
  }
  return { total: pos.length, known, mastered, pct: Math.round((known / pos.length) * 100), rate: att ? succ / att : null };
}

export default function Learn({ side }) {
  const state = useStore();
  const chapters = CHAPTERS.filter((c) => c.side === side);
  const [chapterId, setChapterId] = useState(chapters[0].id);
  const [active, setActive] = useState(null);
  const [play, setPlay] = useState(null);
  const ch = chapters.find((c) => c.id === chapterId) || chapters[0];
  const lines = useMemo(() => linesOf(ch.id), [ch.id]);
  const groups = [...new Set(chapters.map((c) => c.group))];

  const startLesson = () => setActive({
    mode: 'learn',
    title: ch.title,
    drills: lines.map((l) => ({ type: 'line', lineId: l.id })),
    next: { label: 'Étape suivante : test sans aide', run: () => startTest() },
  });
  const startTest = () => setActive({ mode: 'test', title: ch.title + ' — test sans aide', drills: shuffle(lines).map((l) => ({ type: 'line', lineId: l.id })) });
  const startExam = () => setActive({ mode: 'exam', title: ch.title + ' — examen final', drills: shuffle(lines).map((l) => ({ type: 'line', lineId: l.id })) });
  const startLine = (l, mode) => setActive({ mode, title: l.name, drills: [{ type: 'line', lineId: l.id }] });

  const sidebar = (
    <aside className="sidebar">
      {groups.map((g) => (
        <div key={g} className="side-group">
          <div className="side-group-title">{g}</div>
          {chapters.filter((c) => c.group === g).map((c) => {
            const m = chapterMastery(state, side, c.id);
            return (
              <button key={c.id} className={`side-item ${c.id === ch.id ? 'on' : ''}`} onClick={() => { setChapterId(c.id); setActive(null); setPlay(null); }}>
                <span>{c.title}</span>
                <span className="meter"><span style={{ width: m.pct + '%' }} /></span>
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );

  if (play) {
    return <div className="with-sidebar">{sidebar}<main className="main"><PlayGame side={side} startMoves={play.moves} onExit={() => setPlay(null)} /></main></div>;
  }
  if (active) {
    return (
      <div className="with-sidebar">
        {sidebar}
        <main className="main">
          <Trainer
            key={active.mode + active.title + active.drills.length}
            side={side}
            mode={active.mode}
            drills={active.drills}
            title={active.title}
            onExit={() => setActive(null)}
            onNext={active.next ? active.next.run : undefined}
            nextLabel={active.next ? active.next.label : undefined}
            onPlayFrom={(fen, moves) => { setActive(null); setPlay({ moves }); }}
          />
        </main>
      </div>
    );
  }

  const m = chapterMastery(state, side, ch.id);
  return (
    <div className="with-sidebar">
      {sidebar}
      <main className="main">
        <div className="chapter">
          <div className="chapter-head">
            <div>
              <div className="eyebrow">{ch.group} · ECO {ch.eco}</div>
              <h2>{ch.title}</h2>
            </div>
            <div className="chapter-stats">
              <div><b>{m.known}</b>/<span>{m.total}</span> positions connues</div>
              <div><b>{m.mastered}</b> maîtrisées</div>
              {m.rate != null && <div><b>{Math.round(m.rate * 100)}%</b> de réussite</div>}
            </div>
          </div>
          <p className="lead">{short(ch.summary, 180)}</p>
          <div className="progressbar big"><span style={{ width: m.pct + '%' }} /></div>
          <div className="row">
            <button className="btn primary big" onClick={startLesson}>▶ {m.known ? 'Continuer la leçon' : 'Commencer la leçon'}</button>
            <button className="btn" onClick={startTest}>Test</button>
            <button className="btn ghost" onClick={startExam}>Examen strict</button>
          </div>
          <details className="more card">
            <summary>Comprendre davantage : plan, cases clés, milieu de jeu</summary>
            <p>{ch.summary}</p>
            <h4>Plan</h4>
            <ul>{ch.plan.map((p, i) => <li key={i}>{p}</li>)}</ul>
            <p>{ch.squares}</p>
            <p>{ch.pieces}</p>
            <p><b>Transition :</b> {ch.transition}</p>
            <p><b>Quand changer de plan :</b> {ch.abandon}</p>
          </details>
          <div className="card">
            <h4>Les variantes ({lines.length})</h4>
            <table className="lines">
              <tbody>
                {lines.map((l, i) => {
                  const st = state.lines[l.id];
                  return (
                    <tr key={l.id}>
                      <td>{i === 0 ? <span className="tag">Principale</span> : null} {l.name}<div className="muted small mono">{moveListText(l.moves.slice(0, 8))}{l.moves.length > 8 ? ' …' : ''}</div></td>
                      <td className="small muted nowrap">{st?.passes ? '✓ réussie' : st?.learnedAt ? 'vue' : 'nouvelle'}</td>
                      <td className="nowrap"><button className="btn sm" onClick={() => startLine(l, 'learn')}>Apprendre</button> <button className="btn ghost sm" onClick={() => startLine(l, 'test')}>Tester</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
