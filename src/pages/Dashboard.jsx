import { useEffect, useMemo, useState } from 'react';
import { useStore, update, dueCards, streakDays, masteryOf, MASTERY, exportData, importData, storageInfo, listBackups, restoreBackup, statusOf } from '../lib/store.js';
import { CHAPTERS, ALL_LINES, treeFrom, fr, userPositions } from '../lib/repo.js';
import { TAG_LABEL } from '../lib/pgnline.js';
import { chapterMastery } from './Learn.jsx';

function TreeNode({ node, depth, ply, cards, maxDepth }) {
  const [open, setOpen] = useState(depth < 2);
  return (
    <ul className="tree">
      {node.children.map((ch, i) => {
        const card = ch.user ? cards[ch.key] : null;
        const m = ch.user ? masteryOf(card) : null;
        const label = `${ply % 2 === 0 ? Math.floor(ply / 2) + 1 + '.' : (i === 0 || !ch.user ? Math.floor(ply / 2) + 1 + '…' : '')}${fr(ch.san)}${ch.glyph || ''}`;
        return (
          <li key={i}>
            <span className={`tnode ${ch.user ? 'me m' + m : 'opp tag-' + ch.tag}`} onClick={() => setOpen(!open)} title={ch.user ? `Ton coup — ${MASTERY[m]}` : TAG_LABEL[ch.tag]}>
              {label}{ch.transposition ? ' ⇄' : ''}
            </span>
            {ch.children.length > 0 && depth < maxDepth && (open || ch.children.length === 1) && (
              <TreeNode node={ch} depth={depth + (ch.children.length > 1 ? 1 : 0)} ply={ply + 1} cards={cards} maxDepth={maxDepth} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Dashboard({ go }) {
  const state = useStore();
  const [mapSide, setMapSide] = useState('b');
  const [showMap, setShowMap] = useState(false);
  const [backups, setBackups] = useState({});
  useEffect(() => { listBackups().then(setBackups); }, [state.savedAt]);
  const cards = Object.values(state.cards);
  const due = dueCards(state);
  const att = cards.reduce((s, c) => s + c.attempts, 0);
  const succ = cards.reduce((s, c) => s + c.successes, 0);
  const mastered = cards.filter((c) => masteryOf(c) >= 4).length;
  const recurring = cards.filter((c) => statusOf(c) === 'recurrente').length;
  const totalPos = userPositions('w').length + userPositions('b').length;
  const learnedLines = ALL_LINES.filter((l) => state.lines[l.id]?.passes > 0).length;
  const streak = streakDays(state);
  const weakest = CHAPTERS.map((c) => ({ c, m: chapterMastery(state, c.side, c.id) })).filter((x) => x.m.rate != null).sort((a, b) => a.m.rate - b.m.rate).slice(0, 3);
  const tree = useMemo(() => (showMap ? treeFrom(mapSide) : null), [mapSide, showMap]);
  const next = [...CHAPTERS].sort((a, b) => (a.side === 'b' ? 0 : 1) - (b.side === 'b' ? 0 : 1)).find((c) => chapterMastery(state, c.side, c.id).pct < 60);
  const lastExam = state.exams[0];

  return (
    <div className="page">
      <div className="hero">
        <div>
          <div className="eyebrow">Séance du jour</div>
          <h2>{due.length ? `${due.length} position(s) t’attendent` : 'Prêt pour une nouvelle ligne ?'}</h2>
          <div className="steps">
            <button className={`step ${due.length ? 'todo' : 'done'}`} onClick={() => go('reviews')}><b>1</b> Révisions{due.length ? ` (${due.length})` : ' ✓'}</button>
            <button className="step todo" onClick={() => go(next?.side === 'w' ? 'white' : 'black')}><b>2</b> Leçon : {next ? next.title.split(' : ')[0] : 'au choix'}</button>
            <button className="step todo" onClick={() => go('reviews')}><b>3</b> Examen court</button>
          </div>
        </div>
        <div className="elo-box">
          <label>Mon Elo<input type="number" value={state.profile.elo} onChange={(e) => update((d) => { d.profile.elo = +e.target.value || 0; })} /></label>
          <label>Objectif<select value={state.profile.goal} onChange={(e) => update((d) => { d.profile.goal = +e.target.value; })}>{[1300, 1500, 1800, 2000, 2200].map((g) => <option key={g} value={g}>{g}</option>)}</select></label>
          <div className="progressbar"><span style={{ width: Math.min(100, (state.profile.elo / state.profile.goal) * 100) + '%' }} /></div>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><span>Série</span><b>{streak} j</b></div>
        <div className="kpi"><span>Positions maîtrisées</span><b>{mastered}<small>/{totalPos}</small></b></div>
        <div className="kpi"><span>Lignes réussies</span><b>{learnedLines}<small>/{ALL_LINES.length}</small></b></div>
        <div className="kpi"><span>Réussite</span><b>{att ? Math.round((succ / att) * 100) : 0}%</b></div>
        <button className="kpi clickable" onClick={() => go('mistakes')}><span>Erreurs récurrentes</span><b>{recurring}</b></button>
      </div>

      <div className="grid2">
        <div className="card">
          <h4>À renforcer</h4>
          {weakest.length ? weakest.map(({ c, m }) => (
            <div key={c.id} className="hbar clickable" onClick={() => go(c.side === 'w' ? 'white' : 'black')}><span>{c.title}</span><span className="hbar-track"><span style={{ width: Math.round(m.rate * 100) + '%' }} /></span><b>{Math.round(m.rate * 100)}%</b></div>
          )) : <p className="muted small">Fais une première leçon pour voir tes points faibles.</p>}
        </div>
        <div className="card">
          <h4>Dernier examen</h4>
          {lastExam ? (
            <div><div className="big">{lastExam.alone}/{lastExam.total} seul</div><div className="small muted">{lastExam.hinted} avec indice · {lastExam.errors} erreur(s) · {new Date(lastExam.t).toLocaleDateString('fr-FR')}</div></div>
          ) : <p className="muted small">Aucun examen pour l’instant.</p>}
        </div>
      </div>

      <details className="card more" onToggle={(e) => setShowMap(e.currentTarget.open)}>
        <summary>Carte de mon répertoire</summary>
        <div className="row between">
          <div className="legend small">
            <span className="tnode me m0">nouveau</span><span className="tnode me m1">appris</span><span className="tnode me m2">familier</span><span className="tnode me m4">maîtrisé</span><span className="tnode opp tag-mistake">erreur adverse</span> ⇄ transposition
          </div>
          <div className="seg"><button className={mapSide === 'w' ? 'on' : ''} onClick={() => setMapSide('w')}>Blancs</button><button className={mapSide === 'b' ? 'on' : ''} onClick={() => setMapSide('b')}>Noirs</button></div>
        </div>
        <div className="tree-wrap">{tree && <TreeNode node={tree} depth={0} ply={0} cards={state.cards} maxDepth={30} />}</div>
      </details>

      <details className="card more small">
        <summary>Sauvegarde de ma progression</summary>
        <p>Ta progression est enregistrée automatiquement dans ce navigateur (IndexedDB{storageInfo.persisted ? ', stockage persistant accordé' : ''}), avec une copie de secours quotidienne des 7 derniers jours. Elle reste sur cet appareil : il n’y a <b>pas</b> de synchronisation automatique entre ton Mac et ton téléphone. Pour transférer, exporte puis importe le fichier.</p>
        {storageInfo.error && <p className="feedback fb-unknown">Problème de stockage : {storageInfo.error}</p>}
        <div className="row">
          <button className="btn sm" onClick={() => { const b = new Blob([exportData()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `chess-master-academy-${new Date().toISOString().slice(0, 10)}.json`; a.click(); }}>Exporter</button>
          <label className="btn sm">Importer<input type="file" accept="application/json" hidden onChange={async (e) => { const f = e.target.files[0]; if (!f) return; try { importData(await f.text()); alert('Progression restaurée.'); } catch (err) { alert(err.message); } }} /></label>
          {Object.keys(backups).sort().reverse().map((d) => <button key={d} className="btn ghost sm" onClick={() => { if (confirm(`Revenir à la sauvegarde du ${d} ? La progression actuelle sera remplacée.`)) restoreBackup(d); }}>Restaurer {d}</button>)}
        </div>
      </details>
    </div>
  );
}
