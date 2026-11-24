import { useState } from 'react';
import { Chess } from 'chess.js';
import { useStore, update } from '../lib/store.js';
import { repertoireCheck, engineReview, buildReport } from '../lib/analysis.js';
import { evalMove, ENGINE_NAME } from '../lib/engine.js';
import { CHAPTER, posKey } from '../lib/repo.js';
import { addPositionToReview } from './Training.jsx';
import { ReportView, saveExercises, ExerciseTrainer } from '../components/PlayGame.jsx';

function splitPgns(text) {
  const parts = text.replace(/\r/g, '').split(/\n\s*\n(?=\[Event )/);
  return parts.map((p) => p.trim()).filter((p) => p.length > 10);
}

function parseGame(pgn) {
  const c = new Chess();
  c.loadPgn(pgn);
  const h = c.header();
  return { headers: h, moves: c.history() };
}

export default function Games() {
  const state = useStore();
  const [text, setText] = useState('');
  const [user, setUser] = useState(state.profile.chesscomUser || '');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const [report, setReport] = useState(null);
  const [ex, setEx] = useState(null);

  async function importPgns(pgns, sourceLabel) {
    let added = 0, failed = 0;
    const out = [];
    for (const p of pgns) {
      try {
        const g = parseGame(p);
        if (g.moves.length < 2) { failed++; continue; }
        const W = (g.headers.White || '').toLowerCase();
        const B = (g.headers.Black || '').toLowerCase();
        const me = (user || '').toLowerCase();
        let side = null;
        if (me && W === me) side = 'w';
        else if (me && B === me) side = 'b';
        const id = (g.headers.Link || g.headers.Site || '') + (g.headers.Date || '') + (g.headers.White || '') + (g.headers.Black || '') + g.moves.slice(0, 10).join('');
        if (state.games.some((x) => x.id === id)) continue;
        out.push({ id, pgn: p, headers: g.headers, moves: g.moves, side, source: sourceLabel });
        added++;
      } catch { failed++; }
    }
    // analyse répertoire (instantanée) puis jugement moteur de la sortie (si disponible)
    for (const g of out) {
      if (!g.side) continue;
      const rep = repertoireCheck(g.moves, g.side);
      g.chapterId = rep.chapterId;
      g.exit = rep.exit ? { ply: rep.exit.ply, who: rep.exit.who, played: rep.exit.played, expected: rep.exit.expected, text: rep.exit.text, alt: rep.exit.alt } : null;
      if (rep.exit && rep.exit.who === 'me') {
        const c = new Chess();
        g.moves.slice(0, rep.exit.ply).forEach((s) => c.move(s));
        g.exit.fen = c.fen();
        g.exit.key = posKey(c.fen());
        try {
          const r = await evalMove(c.fen(), rep.exit.played, 12);
          g.exit.loss = r.loss;
          g.exit.engine = `${ENGINE_NAME}, prof. ${r.depth}`;
        } catch (e) { g.exit.engineError = e.message; }
        if (addPositionToReview(g.side, c.fen(), rep.exit.played)) g.exit.addedToReview = true;
      }
    }
    update((d) => { d.games = [...out.map(({ pgn, ...rest }) => ({ ...rest, pgn: pgn.length < 20000 ? pgn : '' })), ...d.games].slice(0, 200); if (user) d.profile.chesscomUser = user; });
    setMsg(`${added} partie(s) importée(s)${failed ? `, ${failed} illisible(s)` : ''}${out.some((g) => !g.side) ? '. Pour certaines parties, ton camp n’a pas été reconnu : indique ton pseudo exact puis choisis le camp ci-dessous.' : '.'}`);
  }

  async function fromChesscom() {
    if (!user.trim()) { setMsg('Indique ton pseudo Chess.com (aucun mot de passe n’est nécessaire).'); return; }
    setBusy(true); setMsg('Récupération des archives publiques Chess.com…');
    try {
      const u = encodeURIComponent(user.trim().toLowerCase());
      const a = await fetch(`https://api.chess.com/pub/player/${u}/games/archives`);
      if (!a.ok) throw new Error(a.status === 404 ? 'pseudo introuvable' : 'HTTP ' + a.status);
      const { archives } = await a.json();
      if (!archives?.length) throw new Error('aucune archive');
      const last = archives.slice(-1)[0];
      const r = await fetch(last);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const { games } = await r.json();
      const pgns = games.filter((g) => g.pgn && (g.rules === 'chess' || !g.rules)).map((g) => g.pgn).slice(-30);
      await importPgns(pgns, 'Chess.com (API publique)');
    } catch (e) {
      setMsg('Import Chess.com impossible : ' + e.message + '. Tu peux toujours coller tes parties au format PGN.');
    }
    setBusy(false);
  }

  async function fromText() {
    setBusy(true);
    await importPgns(splitPgns(text), 'PGN collé');
    setText('');
    setBusy(false);
  }

  function setSide(g, side) {
    const rep = repertoireCheck(g.moves, side);
    update((d) => {
      const x = d.games.find((y) => y.id === g.id);
      if (!x) return;
      x.side = side; x.chapterId = rep.chapterId;
      x.exit = rep.exit ? { ply: rep.exit.ply, who: rep.exit.who, played: rep.exit.played, expected: rep.exit.expected, text: rep.exit.text, alt: rep.exit.alt } : null;
    });
    if (rep.exit && rep.exit.who === 'me') {
      const c = new Chess();
      g.moves.slice(0, rep.exit.ply).forEach((s) => c.move(s));
      addPositionToReview(side, c.fen(), rep.exit.played);
    }
  }

  async function deepAnalyse(g) {
    setOpen(g.id); setReport({ busy: true, p: 0 });
    try {
      const rep = repertoireCheck(g.moves, g.side);
      const review = await engineReview(g.moves, g.side, { depth: 10, maxPlies: 60, onProgress: (p) => setReport({ busy: true, p }) });
      const r = buildReport(g.moves, g.side, review, rep);
      saveExercises(r.worst, g.side, `Partie ${g.headers.White} – ${g.headers.Black}`);
      setReport(r);
    } catch (e) {
      setReport({ error: 'Analyse moteur indisponible : ' + e.message });
    }
  }

  if (ex) return <ExerciseTrainer exercises={ex} onExit={() => setEx(null)} />;

  // erreurs répétitives : même position, même sortie
  const rec = {};
  state.games.filter((g) => g.exit?.who === 'me' && g.exit.key).forEach((g) => { const k = g.exit.key + g.exit.played; (rec[k] ||= { n: 0, g }).n++; });
  const repeated = Object.values(rec).filter((r) => r.n >= 2);

  return (
    <div className="page">
      <h2>Mes parties (PGN / Chess.com)</h2>
      <p className="lead">Importe tes parties : le site reconnaît ton camp et ton ouverture, compare tes coups à ton répertoire, trouve la première sortie, vérifie avec le moteur si cette sortie est réellement mauvaise, et ajoute la position à tes révisions. Aucun identifiant ni mot de passe n’est demandé : seules les archives publiques de Chess.com sont lues.</p>
      <div className="grid2">
        <div className="card form">
          <h4>Import automatique Chess.com</h4>
          <label>Ton pseudo Chess.com<input value={user} onChange={(e) => setUser(e.target.value)} placeholder="pseudo" /></label>
          <button className="btn primary" disabled={busy} onClick={fromChesscom}>Importer mes dernières parties</button>
          <p className="muted small">Utilise l’API publique officielle (api.chess.com/pub), dernier mois disponible, 30 parties maximum.</p>
        </div>
        <div className="card form">
          <h4>Coller un ou plusieurs PGN</h4>
          <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={'[Event "Live Chess"]\n[White "…"]\n…\n1. e4 g6 2. d4 Bg7 …'} />
          <button className="btn" disabled={busy || !text.trim()} onClick={fromText}>Analyser ces parties</button>
        </div>
      </div>
      {msg && <div className="note">{msg}</div>}
      {repeated.length > 0 && (
        <div className="card warn">
          <h4>Erreurs répétitives détectées</h4>
          {repeated.map((r, i) => <div key={i}>{r.n} parties : {r.g.exit.text}</div>)}
        </div>
      )}
      <div className="card">
        <h4>Parties importées ({state.games.length})</h4>
        <table className="lines small">
          <thead><tr><th>Partie</th><th>Camp</th><th>Ouverture</th><th>Sortie du répertoire</th><th></th></tr></thead>
          <tbody>
            {state.games.map((g) => (
              <tr key={g.id}>
                <td>{g.headers.White} – {g.headers.Black}<div className="muted">{g.headers.Date} · {g.headers.Result} · {g.headers.TimeControl || ''}</div></td>
                <td>{g.side ? (g.side === 'w' ? 'Blancs' : 'Noirs') : (
                  <span><button className="btn sm ghost" onClick={() => setSide(g, 'w')}>Blancs</button> <button className="btn sm ghost" onClick={() => setSide(g, 'b')}>Noirs</button></span>
                )}</td>
                <td>{g.chapterId ? CHAPTER[g.chapterId]?.title : (g.headers.ECOUrl ? decodeURIComponent(g.headers.ECOUrl.split('/').pop()).replace(/-/g, ' ') : g.headers.Opening || '—')}</td>
                <td>
                  {g.exit ? (
                    <>
                      <div>{g.exit.text}</div>
                      {g.exit.who === 'me' && (
                        <div className="muted">
                          {g.exit.alt ? `Classé dans le répertoire : ${{ alt: 'bonne alternative', inacc: 'imprécision', err: 'erreur' }[g.exit.alt[0]]}. ` : ''}
                          {g.exit.loss != null ? `Moteur : écart ${(g.exit.loss / 100).toFixed(2)} pion → ${g.exit.loss <= 25 ? 'pas réellement mauvais' : g.exit.loss <= 80 ? 'imprécis' : 'vraie erreur'} (${g.exit.engine}).` : g.exit.engineError ? `Analyse moteur indisponible (${g.exit.engineError}).` : ''}
                          {g.exit.addedToReview ? ' Position ajoutée aux révisions.' : ''}
                        </div>
                      )}
                    </>
                  ) : g.side ? 'Aucune sortie détectée' : '—'}
                </td>
                <td>{g.side && <button className="btn sm" onClick={() => deepAnalyse(g)}>Analyse complète</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && report && (
        <div className="card">
          <h4>Analyse de la partie</h4>
          {report.busy && <div className="muted">Analyse en cours… {Math.round(report.p * 100)}%</div>}
          {report.error && <div className="feedback fb-unknown">{report.error}</div>}
          {report.sections && <ReportView report={report} onExercises={() => { const g = state.games.find((x) => x.id === open); setEx(report.worst.map((w) => ({ id: 'g' + w.ply, fen: w.fenBefore, best: w.bestSan, played: w.san, side: g.side, source: 'Partie importée' }))); }} />}
        </div>
      )}
    </div>
  );
}
