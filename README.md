# Chess Master Academy

Entraîneur d'ouvertures d'échecs interactif : tu joues toi-même chaque coup, le site corrige comme un professeur,
t'aide progressivement quand tu bloques et mémorise tes erreurs pour te les reproposer.

**Site en ligne :** https://lialiass.github.io/chess-master-academy/

## Fonctionnalités

- Répertoire Noirs (Pirc-Moderne, Est-indienne…) et Blancs (Italienne, Alapin, avance…), vérifié avec Stockfish.
- Leçons, tests, examens stricts ou accompagnés (5/10/20 positions, générés selon tes points faibles).
- Indices progressifs : message court → explication → indice stratégique → indice précis → cases → solution.
- Mémoire d'apprentissage : chaque erreur (position, coup joué, coup attendu, raison, indices, date) est
  enregistrée ; répétition espacée (10 min → J+1 → J+3 → J+7 → J+14 → J+30…).
- Adversaire imprévisible, pièges, parties complètes contre Stockfish, import PGN / Chess.com, statistiques.

## Données

La progression est enregistrée **dans le navigateur** (IndexedDB + copie localStorage, sauvegarde automatique
quotidienne sur 7 jours). Pas de synchronisation automatique entre appareils : utilise Export / Import
(Accueil → Sauvegarde de ma progression).

## Développement

```bash
npm install
npm run dev       # http://localhost:5188
npm run build     # version de production dans dist/
npm run verify    # contrôle Stockfish de tout le répertoire (télécharge stockfish à la demande)
```

Chaque `git push` sur `main` redéploie automatiquement le site (GitHub Actions → GitHub Pages).

## Licences

chess.js (BSD-2), chessground (GPL-3.0, pièces cburnett CC BY-SA), Stockfish 19 lite WASM (GPL-3.0).
Ce projet est distribué sous GPL-3.0-or-later.
