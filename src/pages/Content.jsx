import { useStore, update } from '../lib/store.js';

export function AuditPage({ go }) {
  return (
    <div className="page prose">
      <div className="eyebrow">Étapes 1 et 2</div>
      <h2>Audit de ton répertoire et choix argumentés</h2>

      <h3>1. Ton répertoire noir actuel : …g6, …Fg7, …e6, …Ce7, …O-O</h3>
      <p><b>Ce que c’est réellement.</b> Contre 1.e4, ton schéma est une <b>défense Moderne</b> (1…g6) jouée avec …e6 et …Ce7 : c’est proche du système <b>« Hippopotame »</b> (…g6, …Fg7, …e6, …Ce7, …d6, …b6, …Fb7, …Cd7). Contre 1.d4, c’est un système de fianchetto du même type. La <b>Pirc</b> (1…d6, …Cf6, …g6) et la <b>Moderne</b> (1…g6 sans …Cf6 immédiat) sont les deux défenses « hypermodernes » : on laisse l’adversaire construire un centre pour l’attaquer ensuite.</p>
      <p><b>Ce qui est bon dans ton habitude :</b> le fou en fianchetto sur la grande diagonale, le petit roque rapide, une structure solide et facile à mettre en place.</p>
      <p><b>Ce qui pose problème (sans complaisance) :</b></p>
      <ul>
        <li><b>…e6 + …g6 crée des trous sur les cases noires</b> (d6, f6, h6). Si ton fou g7 est échangé (Fh6 ou Fe3-h6 très fréquent à ton niveau), ces cases deviennent des portes d’entrée vers ton roi.</li>
        <li><b>…e6 enferme ton fou c8</b> derrière ses propres pions : tu joues avec une pièce de moins pendant longtemps.</li>
        <li><b>…e6 ne contrôle pas e5.</b> Les Blancs peuvent pousser e4-e5 et gagner beaucoup d’espace, et ton cavalier ne trouve plus la case f6.</li>
        <li><b>Le cavalier en e7 n’attaque rien</b> : il ne touche ni e4 ni d5. Les Blancs construisent leur centre idéal (e4-d4, parfois f4/c4) sans être dérangés.</li>
      </ul>
      <p><b>Le cavalier en e7 est-il justifié ?</b> Oui, <b>mais au bon moment</b>. Il est excellent quand le centre est <b>fermé</b> (après …e5 et la poussée blanche d5) : il ne bloque pas le fou g7, n’est pas chassé par e5, et prépare la poussée …f5. Avant cela, <b>…Cf6 est préférable</b> : il attaque e4 et protège le roi (case h7).</p>
      <p><b>Seul cas où …e6 est le meilleur coup :</b> quand le fou blanc est en c4 et la dame en f3 (menace Dxf7 mat). Là, …e6 ferme la diagonale et le moteur le recommande. Le site te l’enseigne dans le chapitre « Coups rares ».</p>

      <h3>La version corrigée : le « système universel du fianchetto »</h3>
      <p>On garde ton identité (fou en g7, petit roque, cavalier en e7 dans les structures fermées) mais on corrige l’ordre de coups :</p>
      <ol>
        <li><b>…g6 et …Fg7</b> (contre 1.e4) ou <b>…Cf6, …g6, …Fg7</b> (contre 1.d4, 1.c4, 1.Cf3).</li>
        <li><b>…d6 au lieu de …e6</b> : contrôle e5 et libère le fou c8.</li>
        <li><b>…Cf6 au lieu de …Ce7</b> dans la phase d’ouverture : pression sur e4.</li>
        <li><b>…O-O</b>, puis la rupture centrale.</li>
        <li><b>Quand jouer quoi :</b> <b>…e5</b> quand d4 est attaqué deux fois (avec …Cc6 / …Fg4) ; <b>…c5</b> contre un centre trop étendu (f4, Fe2 sans Cf3 actif) ou contre le Système de Londres ; <b>…d5</b> seulement contre des systèmes lents (Veresov Dd2/Fg5, ou quand la dame blanche menace f7) ; <b>…e6</b> presque jamais, sauf contre Df3/Fc4.</li>
        <li><b>Après d5 des Blancs :</b> ton cavalier va en <b>e7</b> et tu pousses <b>…f5</b> (plan Mar del Plata de l’Est-indienne).</li>
      </ol>
      <p><b>Contre 1.e4 :</b> Pirc-Moderne (1…g6 2.d4 Fg7 3.Cc3 d6). <b>Contre 1.d4 :</b> Est-indienne. <b>Contre 1.c4 / 1.Cf3 / coups rares :</b> le même schéma, qui transpose presque toujours. Tu apprends <b>une seule famille de structures</b> pour toutes les ouvertures.</p>
      <p><b>Le dispositif …g6/…Fg7 est-il viable partout ?</b> Oui : la Pirc, la Moderne et l’Est-indienne sont jouées au plus haut niveau. Contre 1.e4, il cède un peu d’espace (le moteur donne en général +0,3 à +0,6 aux Blancs, ce qui est normal pour une défense active). Les lignes critiques à connaître sont l’<b>attaque 150</b> (Fe3/Dd2/Fh6) et l’<b>attaque autrichienne</b> (f4) : elles ont chacune leur chapitre.</p>

      <h3>2. Ton répertoire blanc : 1.e4 et l’Italienne</h3>
      <p><b>Corrections de tes confusions.</b> « Cavalier en g3 et fou en f4 » mélange deux systèmes :</p>
      <ul>
        <li>Le <b>fou en f4</b> appartient au <b>Système de Londres</b> (1.d4, 2.Ff4), pas à 1.e4. Après 1.e4 e5, ce fou se développe en <b>c4</b> (Italienne) et plus tard parfois en <b>e3</b> ou <b>g5</b>.</li>
        <li>Le <b>cavalier en g3</b> existe bel et bien dans l’Italienne, mais ce n’est pas le cavalier g1 : c’est le <b>cavalier b1</b>, qui fait le voyage <b>b1 → d2 → f1 → g3</b> après le roque et Te1. Le cavalier g1 va, lui, en <b>f3</b> dès le 2e coup.</li>
      </ul>
      <p><b>Choix : l’Italienne lente (Giuoco Pianissimo) — 1.e4 e5 2.Cf3 Cc6 3.Fc4 Fc5 4.c3 Cf6 5.d3.</b></p>
      <ul>
        <li><b>Solide</b> : pas de gambit, pas de sacrifice douteux ; c’est le choix des meilleurs joueurs du monde depuis 10 ans.</li>
        <li><b>Compréhensible</b> : un plan unique (c3, d3, O-O, Te1, Fb3, h3, Cbd2-f1-g3, puis d4) que tu appliques contre presque toutes les réponses noires.</li>
        <li><b>Adapté à 1 100 et utile à 1 800</b> : la structure ne change pas, seule la finesse des manœuvres augmente.</li>
        <li><b>Pas choisi pour les pièges</b>, même si l’Italienne en contient de vrais (que tu apprendras dans le module Pièges).</li>
      </ul>
      <p><b>Un système par défense, pas cinq :</b> Sicilienne → <b>Alapin 2.c3</b> ; Française → <b>avance 3.e5</b> ; Caro-Kann → <b>avance 3.e5</b> (système court) ; Scandinave → <b>2.exd5 et 3.Cc3</b> ; Alekhine → <b>variante moderne 4.Cf3</b> ; Pirc/Moderne → <b>attaque 150</b> ; coups rares → <b>2.d4</b> et le centre. La Française et la Caro-Kann partagent la même idée (espace avec e5), et l’Alapin peut transposer dans la Française avance : moins de choses à retenir.</p>
      <p><b>Si l’adversaire s’écarte au 2e, 3e, 4e ou 5e coup :</b> chaque chapitre contient les déviations principales, et pour tout coup inconnu le site analyse la position avec Stockfish au lieu d’inventer une réponse. Principe général : <i>développe, contrôle le centre, roque — et vérifie d’abord si le coup adverse laisse une pièce sans défense.</i></p>

      <h3>Distinguer « choix de répertoire » et « meilleur coup du moteur »</h3>
      <p>Chaque coup du répertoire a été contrôlé avec Stockfish (script de vérification fourni). Quand le moteur préfère un autre coup, c’est indiqué dans le commentaire (par exemple 6…e5 contre la Pirc classique, ou 7.Db3 dans l’Italienne après …d5). Pendant l’entraînement, un coup solide différent du répertoire est classé <b>« bonne alternative »</b>, jamais « erreur ».</p>
      <div className="row"><button className="btn primary" onClick={() => go('black')}>▶ Lancer la première leçon (Noirs)</button><button className="btn" onClick={() => go('white')}>Répertoire blanc</button></div>
    </div>
  );
}

const WEEKS = [
  { phase: 'Phase 1 — Fondations', weeks: [
    { t: 'Semaine 1', items: ['Lire l’audit du répertoire noir (10 min)', 'Leçon « Pirc-Moderne : système classique » (ligne principale + variantes)', 'Test sans aide du chapitre', 'Chaque jour : 10 min de tactiques simples (mats en 1-2, fourchettes)'] },
    { t: 'Semaine 2', items: ['Leçon « Italienne : Giuoco Pianissimo »', 'Leçon « Deux cavaliers et Hongroise »', 'Révisions quotidiennes', 'Finale : roi + pion contre roi (opposition)'] },
    { t: 'Semaine 3', items: ['Leçon « Est-indienne classique »', 'Leçon « Londres, Colle, Trompowsky »', 'Révisions', '2 parties rapides (15+10) puis import PGN et analyse'] },
  ] },
  { phase: 'Phase 2 — Variantes', weeks: [
    { t: 'Semaine 4', items: ['Leçons « Attaque 150 » et « Attaque autrichienne »', 'Test sans aide des deux chapitres', 'Calcul : 10 positions « que menace l’adversaire ? »'] },
    { t: 'Semaine 5', items: ['Leçons « Sicilienne Alapin » et « Française avance »', 'Remarquer la transposition Alapin → Française', 'Finale : tour + roi contre roi (mat)'] },
    { t: 'Semaine 6', items: ['Leçons « Caro-Kann avance », « Scandinave », « Alekhine »', 'Examen final Blancs (12 lignes)', 'Analyse de 3 parties importées'] },
  ] },
  { phase: 'Phase 3 — Tactiques', weeks: [
    { t: 'Semaine 7', items: ['Module Pièges : tous les exercices Blancs', 'Leçons « Moderne c4 » et « coups rares »', 'Révisions'] },
    { t: 'Semaine 8', items: ['Module Pièges : tous les exercices Noirs', 'Leçon « Sämisch, quatre pions, fianchetto »', 'Finale : règle du carré, pions passés'] },
    { t: 'Semaine 9', items: ['Adversaire imprévisible niveau 1 000 puis 1 200 (2 séries)', 'Leçon « Anglaise, 1.Cf3 et coups rares »', 'Refaire les pièges ratés'] },
  ] },
  { phase: 'Phase 4 — Autonomie', weeks: [
    { t: 'Semaine 10', items: ['Adversaire imprévisible niveau 1 500', 'Partie complète depuis la fin d’une ligne maîtrisée + exercices générés', 'Examen final Noirs'] },
    { t: 'Semaine 11', items: ['Import Chess.com : analyser toutes les parties de la semaine', 'Travailler les « erreurs répétitives »', 'Finale : tour contre pion, position de Lucena (lecture)'] },
    { t: 'Semaine 12', items: ['Examens finaux Blancs et Noirs', 'Adversaire imprévisible niveau 1 800', 'Bilan : ouvertures les plus faibles → plan des 4 semaines suivantes'] },
  ] },
];

export function PlanPage() {
  const plan = useStore((s) => s.plan);
  const toggle = (k) => update((d) => { d.plan[k] = !d.plan[k]; });
  return (
    <div className="page prose">
      <h2>Programme de 12 semaines</h2>
      <p className="lead">Séances de 30 à 45 minutes, 5 jours sur 7. Structure type d’une séance : <b>10 min</b> de révisions espacées → <b>15-20 min</b> de leçon active (tu joues tous les coups) → <b>10 min</b> de tactique, de finale ou d’analyse de partie. Ce programme ne garantit aucun Elo en 12 semaines : il garantit un répertoire maîtrisé et une méthode.</p>
      {WEEKS.map((p) => (
        <div key={p.phase} className="card">
          <h3>{p.phase}</h3>
          {p.weeks.map((w) => (
            <div key={w.t} className="week">
              <b>{w.t}</b>
              {w.items.map((it, i) => {
                const k = w.t + '#' + i;
                return <label key={k} className="check"><input type="checkbox" checked={!!plan[k]} onChange={() => toggle(k)} /> {it}</label>;
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
