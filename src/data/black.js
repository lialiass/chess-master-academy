// Répertoire NOIR — « Système universel du fianchetto » : …g6, …Fg7, …d6, …Cf6, …O-O,
// puis rupture …e5 ou …c5. Le cavalier en e7 reste une arme, mais au bon moment
// (après …Cc6, …e5 et la poussée blanche d5).
//
// Format :
//  - lines[].pgn : coups en notation SAN anglaise (N,B,R,Q,K) — c'est ce que lit chess.js.
//    Les commentaires {…} s'attachent au coup qui précède. [%cal Ge2e4] = flèche, [%csl Rf7] = case.
//    Glyphes sur les coups ADVERSES : ?! imprécision, ? erreur, ?? gaffe, !? coup rare mais solide.
//  - alts : réponses possibles de l'élève qui ne sont PAS le coup du répertoire.
//    clé = coups joués avant (sans numéros) ; valeur = { SAN: [type, texte, réfutation?] }
//    type : 'alt' (bonne alternative), 'inacc' (imprécision de répertoire), 'err' (erreur objective).
//  - qa : réponses aux questions « Comprendre le pourquoi », clé = coups joués jusqu'au coup inclus.
// Toutes les lignes sont contrôlées par scripts/verify.mjs (légalité + Stockfish).

export const BLACK_CHAPTERS = [
  {
    id: 'b-pirc-classique',
    side: 'b',
    group: 'Noirs contre 1.e4',
    title: 'Pirc-Moderne : système classique (4.Cf3)',
    eco: 'B08',
    summary:
      "Tu laisses les Blancs construire le centre e4-d4, puis tu l'attaques à distance : le fou g7 vise d4, le cavalier f6 vise e4, et la rupture …e5 vient au bon moment. Quand les Blancs ferment le centre par d5, ton cavalier part en e7 et le pion f part en …f5 : c'est là que ta structure préférée (Ce7) prend tout son sens.",
    plan: [
      'Développer : …g6, …Fg7, …d6, …Cf6, …O-O (dans cet ordre en général).',
      "Mettre la pression sur d4 : …Fg4 (pour échanger un défenseur, le Cf3) et …Cc6.",
      'Rupture centrale …e5 quand d4 est attaqué deux fois.',
      'Si les Blancs jouent d5 : …Ce7, puis …Cd7 / …Ch5 et la poussée …f5 vers l’aile roi.',
      'Si les Blancs prennent en e5 (dxe5 dxe5) : position symétrique et saine, vise la case d4.',
    ],
    squares: 'Cases clés : d4 (cible de Fg7 + Cc6), e5 (case de rupture), f5 (case de poussée après d5).',
    pieces: 'Pièce maîtresse : le fou g7 — ne l’échange pas sans raison. Pièce à activer : le fou c8 (via g4 ou d7).',
    transition:
      "Milieu de jeu : centre fermé (d5) → jeu sur l'aile roi avec …f5 ; centre ouvert (dxe5) → jeu de pièces, cases d4/c5.",
    abandon:
      "Abandonne le plan …Fg4 si les Blancs ont déjà joué h3 : le fou se fait chasser. Abandonne …f5 si ton roi devient faible (Dame blanche en h6, fou noir g7 échangé).",
    lines: [
      {
        name: 'Ligne principale : 7.Fe3 Cc6 8.Dd2 e5 9.d5 Ce7',
        pgn: `1.e4 g6 {Le pion g6 prépare le fianchetto. Ton fou ira en g7, sur la grande diagonale h8-a1. [%cal Gf8g7,Gg7a1]}
        2.d4 Bg7 {Le fou vise déjà d4 et, plus loin, b2. C'est ta pièce la plus importante. [%cal Gg7d4] [%csl Yd4]}
        3.Nc3 d6 {Le pion d6 contrôle e5 : il empêche e4-e5 de te gêner et ouvre la diagonale du fou c8. [%cal Gd6e5] [%csl Ge5]}
        4.Nf3 Nf6 {Le cavalier en f6 attaque e4 et défend ton futur roi. Contre 1.e4, f6 est meilleur que e7 : en e7 le cavalier n'attaque rien. [%cal Gf6e4] [%csl Re4]}
        5.Be2 O-O {Le roi est en sécurité avant toute action au centre.}
        6.O-O Bg4 {Le fou attaque le cavalier f3, qui défend d4. Idée : échanger ce défenseur, puis attaquer d4 avec …Cc6 et …e5. [%cal Gg4f3,Gf3d4]}
        7.Be3 Nc6 {Deuxième pièce contre d4. Les Blancs doivent maintenant surveiller cette case en permanence. [%cal Gc6d4,Gg7d4] [%csl Rd4]}
        8.Qd2 e5 {La rupture ! d4 est attaqué trois fois. Les Blancs doivent choisir : prendre (dxe5) ou fermer (d5). [%cal Ge5d4]}
        9.d5 Ne7 {Le centre est fermé : ton cavalier passe en e7 (ta case préférée !), libère le pion f et vise f5/g6. [%cal Gc6e7,Gf7f5] [%csl Gf5]}
        10.h3 Bd7 {Le fou recule sans s'échanger. Plan : …Ch5 ou …Ce8, puis …f5 pour attaquer l'aile roi blanche. Les Blancs, eux, joueront à l'aile dame (a4, b4, c4).}`,
      },
      {
        name: 'Les Blancs prennent : 9.dxe5 dxe5',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Nf3 Nf6 5.Be2 O-O 6.O-O Bg4 7.Be3 Nc6 8.Qd2 e5
        9.dxe5 {Les Blancs ouvrent le centre. Pas de panique : la position est symétrique.}
        dxe5 {On reprend vers le centre. La case d4 devient un excellent avant-poste pour ton cavalier c6. [%csl Gd4] [%cal Gc6d4]}
        10.Rad1 Qxd2 {Échanger les dames quand les Blancs alignent tour et dame sur la colonne d. Ton roi n'aura plus rien à craindre.}
        11.Rxd2 Rad8 {Tu contestes immédiatement la colonne ouverte. Position égale, facile à jouer.}`,
      },
      {
        name: 'Fermeture immédiate : 8.d5 Fxf3',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Nf3 Nf6 5.Be2 O-O 6.O-O Bg4 7.Be3 Nc6
        8.d5 {Le cavalier c6 est attaqué. Le moteur juge ce coup correct, mais il abandonne le contrôle de la case e5 : à toi d'en profiter.}
        Bxf3 {D'abord échanger : le cavalier f3 était le seul gardien de e5. [%cal Gg4f3] [%csl Ge5]}
        9.Bxf3 Ne5 {Ton cavalier s'installe en e5, au centre, et ne peut plus être chassé par un pion d. [%csl Ge5]}
        10.Be2 c6 {Tu attaques le pion d5 pour ouvrir la colonne c. Plan : …Da5, …Tc8 et jeu à l'aile dame.}`,
      },
      {
        name: '7.h3 : les Blancs chassent le fou',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Nf3 Nf6 5.Be2 O-O 6.O-O Bg4
        7.h3 {La question est posée au fou.}
        Bxf3 {On échange : tu donnes la paire de fous, mais d4 perd un défenseur. [%cal Gg4f3]}
        8.Bxf3 Nc6 {Pression immédiate sur d4. [%cal Gc6d4,Gg7d4]}
        9.Be3 e5 {Même rupture que dans la ligne principale.}
        10.d5 Ne7 {Centre fermé : cavalier en e7, puis …Cd7 et …f5. Le fou blanc f3 est gêné par son propre pion e4.}`,
      },
      {
        name: '7.a4 : la réponse la plus précise selon le moteur',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Nf3 Nf6 5.Be2 O-O 6.O-O Bg4
        7.a4!? {Coup de moteur : les Blancs prennent de l'espace à l'aile dame avant de décider.}
        Nc6 {Même schéma : pression sur d4.}
        8.d5 Bxf3 {On élimine le gardien de e5.}
        9.Bxf3 Ne5 {Cavalier central.}
        10.Be2 c6 {Ouvrir la colonne c contre le pion d5.}`,
      },
      {
        name: '5.Fc4 : le « fork trick »',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Nf3 Nf6
        5.Bc4 {Le fou vise f7, mais il est exposé en c4.}
        O-O 6.O-O Nxe4! {Le « truc de la fourchette » : tu prends e4 et tu récupères la pièce par …d5, qui attaque fou et cavalier. [%cal Gf6e4,Gd7d5]}
        7.Nxe4 d5 {Fourchette de pion : fou c4 et cavalier e4 sont attaqués. Tu récupères ta pièce. [%cal Gd5c4,Gd5e4]}
        8.Bd3 dxe4 9.Bxe4 Nd7 {Matériel égal, centre blanc dissous, fou g7 très actif. Le moteur juge la position équilibrée.}`,
      },
      {
        name: '5.h3 : système moderne',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Nf3 Nf6
        5.h3 {Les Blancs empêchent …Fg4 et …Cg4.}
        O-O 6.Be3 a6 {Puisque …Fg4 est impossible, on change de plan : …b5, …Fb7 et pression sur e4 depuis l'aile dame. [%cal Ga6b5]}
        7.a4 b6 {Si les Blancs bloquent …b5, on prépare …c5 et …Fb7.}`,
      },
      {
        name: '5.Fd3',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Nf3 Nf6
        5.Bd3 O-O 6.O-O Nc6 {Le fou d3 ne défend pas d4 : pression immédiate. [%cal Gc6d4]}
        7.h3 e5 {Rupture classique.}
        8.d5 Ne7 {Centre fermé → cavalier en e7 et …f5 plus tard.}`,
      },
    ],
    alts: {
      'e4': {
        d6: ['alt', "1…d6 (Pirc) est excellent et transpose souvent après …Cf6 et …g6. Notre ordre de coups est 1…g6, qui garde l'option …c6/…d5."],
        e5: ['alt', "1…e5 est un très bon coup, mais ce n'est pas ton répertoire fianchetto."],
        c5: ['alt', '1…c5 (Sicilienne) est excellent, mais demande une théorie énorme. On reste sur …g6.'],
        e6: ['alt', "1…e6 (Française) est solide, mais elle enferme ton fou c8 et n'a rien à voir avec le fianchetto."],
      },
      'e4 g6 d4': {
        e6: ['inacc', "C'est ton ancienne habitude. 2…e6 n'est pas une gaffe, mais il affaiblit les cases noires d6 et f6 et enferme le fou c8. Joue d'abord 2…Fg7 : le fou met la pression sur d4 tout de suite."],
        d6: ['alt', "2…d6 est jouable et transpose souvent. Mais 2…Fg7 d'abord met immédiatement la pression sur d4."],
        Nf6: ['inacc', "2…Cf6 ? permet 3.e5 qui chasse le cavalier (Ch5 ou Cd5) avec gain de temps. Avec …d6 d'abord, e5 n'est plus une menace.", 'e5'],
      },
      'e4 g6 d4 Bg7 Nc3': {
        e6: ['inacc', "3…e6 est ton ancienne structure. Ce n'est pas perdant, mais ça laisse e5 sans contrôle, bloque le fou c8 et crée des trous en d6/f6. 3…d6 contrôle e5 et garde le fou c8 libre."],
        c6: ['alt', "3…c6 (idée …d5) est un bon coup de la Moderne, mais notre répertoire choisit …d6, plus simple à jouer."],
        a6: ['alt', "3…a6 (idée …b5) est jouable. Notre répertoire préfère 3…d6, plus classique."],
        c5: ['inacc', "3…c5 est jouable, mais après 4.dxc5 ou 4.d5 tu entres dans des positions très différentes de ton système."],
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3': {
        a6: ['alt', "4…a6 est une idée de la Moderne (…b5). Bon coup, mais on préfère …Cf6 qui attaque e4."],
        c6: ['alt', '4…c6 est jouable ; notre répertoire préfère attaquer e4 tout de suite avec …Cf6.'],
        e6: ['inacc', "4…e6 bloque ton fou c8 et ne gêne pas le centre blanc. Cf6 est plus actif."],
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6 Be2 O-O O-O': {
        e5: ['alt', "6…e5 est même le premier choix du moteur (finale égale après 7.dxe5 dxe5 8.Dxd8). Notre répertoire préfère 6…Fg4, qui garde plus de jeu."],
        Nc6: ['alt', '6…Cc6 est un excellent coup. Notre répertoire joue d’abord 6…Fg4 pour éliminer le défenseur f3.'],
        c6: ['alt', '6…c6 est un système solide (idée …b5). Bon coup, autre plan.'],
        a6: ['alt', '6…a6 est jouable (idée …b5).'],
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6 Be2 O-O O-O Bg4 Be3': {
        Nbd7: ['alt', "7…Cbd7 est solide, mais il ne met pas la pression sur d4. …Cc6 est plus cohérent avec notre plan."],
        c6: ['alt', '7…c6 est jouable, mais moins actif.'],
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6 Be2 O-O O-O Bg4 Be3 Nc6 Qd2 e5 d5': {
        Nb8: ['inacc', "8…Cb8 recule sans plan. Le cavalier n'a plus d'avenir ; en e7 il prépare …f5."],
        Bxf3: ['inacc', "9…Fxf3 tout de suite permet 10.Fxf3 Cd4 11.Fxd4 exd4 12.Cb5 : tu perds le pion d4. Joue d'abord …Ce7."],
        Nb4: ['inacc', '9…Cb4 est trop optimiste : après a3, le cavalier doit reculer avec perte de temps.'],
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6 Be2 O-O O-O Bg4 Be3 Nc6 Qd2 e5 d5 Ne7 h3': {
        Bh5: ['err', "10…Fh5 ?? 11.g4 ! et le fou est coincé : il ne lui reste que …Cxg4, un sacrifice perdant.", 'g4'],
        Bxf3: ['alt', '10…Fxf3 est jouable aussi (le moteur le juge un peu moins bon). Notre répertoire garde le fou avec …Fd7.'],
        Bc8: ['alt', "10…Fc8 est jouable, mais …Fd7 relie mieux les tours."],
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6 Bc4 O-O O-O': {
        Bg4: ['inacc', '6…Fg4 est bon aussi. Mais 6…Cxe4 ! résout tout de suite le problème du centre. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
        c6: ['inacc', '6…c6 (idée …b5 qui chasse le fou) est solide. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6 Bc4 O-O O-O Nxe4 Nxe4': {
        Bg4: ['err', "Sans …d5, tu as simplement perdu ton cavalier pour un pion. La fourchette …d5 est obligatoire.", ''],
      },
    },
    qa: {
      'e4 g6 d4 Bg7': {
        why: 'Le fou en g7 contrôle la grande diagonale : il attaque d4 aujourd’hui et b2 demain si la diagonale s’ouvre.',
        whyNow: "Avant …d6, pour que d4 soit sous pression immédiatement et que le fou ne soit jamais bloqué.",
        notOther: "…e6 (ton ancienne habitude) bloque le fou c8 et crée des trous en d6/f6. …Fg7 d’abord est plus actif.",
        weak: 'Les cases f6 et h6 deviennent sensibles si ce fou est échangé : garde-le !',
      },
      'e4 g6 d4 Bg7 Nc3 d6': {
        why: 'd6 contrôle e5. Sans ce pion, e4-e5 gagne de l’espace et chasse ton futur Cf6.',
        notOther: "…e6 ne contrôle pas e5 et bloque le fou c8. …d6 laisse le fou c8 libre d’aller en g4.",
        threat: "Rien n'est menacé : c'est un coup de prophylaxie (empêcher le plan adverse).",
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6': {
        why: 'Le cavalier attaque e4 : les Blancs doivent défendre leur centre au lieu de le pousser.',
        notOther: "En e7 (ton ancienne case), le cavalier ne touche ni e4 ni d5. Il est excellent plus tard, une fois le centre fermé.",
        oppPlan: 'Les Blancs veulent Fe2, O-O puis éventuellement e5 ou d5 pour gagner de l’espace.',
        attackOrDevelop: 'Développer et roquer. Aucune attaque avant le roque.',
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6 Be2 O-O O-O Bg4': {
        why: 'Le cavalier f3 défend d4. En menaçant de l’échanger, tu affaiblis d4 avant de jouer …Cc6 et …e5.',
        exchange: 'Fxf3 est favorable quand il élimine un défenseur important (d4 ou e5). Il est mauvais s’il ne fait que donner la paire de fous.',
        whyNow: 'Les Blancs n’ont pas encore joué h3 : le fou a une belle case.',
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6 Be2 O-O O-O Bg4 Be3 Nc6 Qd2 e5': {
        why: 'C’est la rupture du système : d4 est attaqué par le pion e5, le cavalier c6 et (indirectement) le fou g7.',
        capture: 'Si dxe5 dxe5 : position symétrique et égale, ton cavalier vise d4. Si d5 : le centre se ferme, tu joues …Ce7 et …f5.',
        oppPlan: 'Les Blancs voudraient pousser d5 pour gagner de l’espace et jouer à l’aile dame (a4, b4, c4).',
      },
      'e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6 Be2 O-O O-O Bg4 Be3 Nc6 Qd2 e5 d5 Ne7': {
        why: 'Le cavalier c6 était attaqué. En e7 il ne bloque pas le fou g7, se dirige vers f5/g6 et libère le pion f.',
        convert: "Plan : …Ch5 ou …Ce8, puis …f5. Les Blancs attaquent à l'aile dame, toi à l'aile roi : c'est une course.",
        weak: 'Pour les Blancs, la case f4 et le roi deviennent des cibles après …f5-f4.',
      },
    },
  },

  {
    id: 'b-pirc-150',
    side: 'b',
    group: 'Noirs contre 1.e4',
    title: 'Pirc-Moderne : attaque « 150 » (Fe3, Dd2, f3)',
    eco: 'B07',
    summary:
      "Les Blancs veulent jouer Fh6 pour échanger ton fou g7, puis grand roque et h4-h5. Ta réponse : retarder le roque, jouer …c6 et …b5 pour contre-attaquer à l'aile dame, et ne roquer qu'une fois la menace Fh6 neutralisée.",
    plan: [
      'Ne pas roquer trop tôt : avec Fh6 et h4-h5, ton roi serait la cible.',
      '…c6 et …b5 : expansion à l’aile dame, là où le roi blanc ira (grand roque).',
      '…Cbd7, …Fb7 ou …Da5 pour attaquer vite.',
      'Si Fh6 : échanger …Fxh6 et répondre Dxh6 par …Da5 ou …Fb7 (activité immédiate).',
    ],
    squares: 'Cases clés : h6 (case de l’échange des fous), b5/b4 (avancée noire), c4.',
    pieces: 'Le fou g7 sera souvent échangé : ton roi doit alors rester au centre ou à l’aile dame jusqu’à ce que la position se clarifie.',
    transition: 'Course d’attaques opposées : la vitesse compte plus que le matériel.',
    abandon: 'Si les Blancs roquent petit, tu peux roquer aussi et revenir au schéma classique …e5.',
    lines: [
      {
        name: 'Ligne principale : 4.Fe3 Cf6 5.Dd2 c6 6.f3 b5',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6
        4.Be3 {Le fou se place pour aller en h6 après Dd2.}
        Nf6 5.Qd2 {Menace Fh6 : échanger ton meilleur fou.}
        c6 {On prépare …b5 sans encore roquer. [%cal Gc7c6,Gb7b5]}
        6.f3 {Protège e4 et prépare g4/h4.}
        b5 {Contre-attaque à l'aile dame. Le pion menace …b4 qui chasse le Cc3, défenseur d'e4. [%cal Gb5b4,Gb4c3]}
        7.Nge2 Nbd7 {Développement : le cavalier ira en b6 ou soutiendra …e5.}
        8.Bh6 Bxh6 {On accepte l'échange : sinon Fxg7 te coûte ton fou et un temps.}
        9.Qxh6 Qa5 {La dame s'active tout de suite et prépare …b4. Ton roi est en sécurité au centre pour l'instant.}`,
      },
      {
        name: '6.Fh6 tout de suite',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Be3 Nf6 5.Qd2 c6
        6.Bh6 Bxh6 7.Qxh6 Qa5 {Même idée : dame active, …b5 et …b4 suivront. Les Blancs ont échangé le fou, mais n'ont pas encore de menace concrète sur ton roi.}`,
      },
      {
        name: '6.Cf3 : version calme',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Be3 Nf6 5.Qd2 c6
        6.Nf3 b5 {Même expansion.}
        7.Bd3 O-O {Sans f3, l'attaque g4-h5 est plus lente : tu peux roquer.}`,
      },
      {
        name: '7.g4 : l’attaque à l’aile roi',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Be3 Nf6 5.Qd2 c6 6.f3 b5
        7.g4 h5 {On freine la poussée g5 : la colonne h ne s'ouvre pas facilement.}
        8.g5 Nfd7 {Le cavalier recule, mais f4 n'est pas encore joué. Plan : …b4 et …c5.}`,
      },
      {
        name: 'Transposition : 5.f3 c6 6.Dd2 b5',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Be3 Nf6
        5.f3 c6 6.Qd2 b5 {Même position que la ligne principale par un autre ordre : c'est une transposition. Le site la reconnaît automatiquement.}`,
      },
    ],
    alts: {
      'e4 g6 d4 Bg7 Nc3 d6 Be3 Nf6 Qd2': {
        'O-O': ['inacc', "Roquer tout de suite face à Dd2/Fh6 te met dans la ligne de mire : Fh6, grand roque, h4-h5. Ce n'est pas perdant, mais c'est exactement ce que les Blancs cherchent."],
        a6: ['alt', '5…a6 (idée …b5) est jouable et proche de notre plan.'],
      },
      'e4 g6 d4 Bg7 Nc3 d6 Be3 Nf6 Qd2 c6 f3 b5 Nge2 Nbd7 Bh6': {
        'O-O': ['inacc', '8…O-O permet Fxg7 Rxg7 puis h4-h5 : ton roi devient la cible.'],
        Bf8: ['inacc', '8…Ff8 perd du temps. On échange et on contre-attaque.'],
      },
    },
    qa: {
      'e4 g6 d4 Bg7 Nc3 d6 Be3 Nf6 Qd2 c6': {
        why: '…c6 prépare …b5, contrôle d5 et donne une case à la dame (a5/b6).',
        oppPlan: 'Fh6 pour échanger ton fou g7, grand roque, puis h4-h5 contre ton roi.',
        attackOrDevelop: 'Ici on attaque vite à l’aile dame : c’est là que le roi blanc va s’installer.',
      },
      'e4 g6 d4 Bg7 Nc3 d6 Be3 Nf6 Qd2 c6 f3 b5': {
        why: '…b5-b4 chassera le cavalier c3, qui défend e4. Tu attaques le roi blanc avant qu’il ne t’attaque.',
        threat: 'Menace …b4 suivi de …Cxe4.',
      },
    },
  },

  {
    id: 'b-pirc-autrichienne',
    side: 'b',
    group: 'Noirs contre 1.e4',
    title: 'Pirc-Moderne : attaque autrichienne (4.f4)',
    eco: 'B09',
    summary:
      "Les Blancs construisent un énorme centre e4-d4-f4 et menacent e5. Ce centre est puissant mais fragile : il faut le frapper avant qu’il n’avance. Contre 6.Fe2, la rupture …c5 est la clé ; contre 6.Fd3, …Cc6 puis …e5 attaque d4.",
    plan: [
      'Roquer vite : le centre blanc peut exploser.',
      'Frapper la base du centre : …c5 (contre d4) ou …e5.',
      'Si e5 arrive, attaquer le pion avancé avec …dxe5, …Cfd7, …c5.',
      'Ne jamais laisser les Blancs pousser e5 ET f5 sans contre-jeu.',
    ],
    squares: 'Cases clés : d4 (base du centre), e5 (case de poussée blanche), c5.',
    pieces: 'Le fou g7 devient monstrueux dès que d4 tombe.',
    transition: 'Si le centre blanc est détruit, tes pièces deviennent plus actives ; s’il tient, joue …e6/…exd5 pour ouvrir.',
    abandon: 'Si les Blancs ont déjà joué e5 sans soutien, oublie …c5 tranquille : attaque e5 immédiatement.',
    lines: [
      {
        name: 'Ligne principale : 6.Fe2 c5',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6
        4.f4 {Trois pions au centre : c'est l'attaque autrichienne.}
        Nf6 5.Nf3 O-O {On met le roi à l'abri avant que le centre ne s'ouvre.}
        6.Be2 c5! {On frappe d4 tout de suite. Le fou g7 vise déjà la diagonale. [%cal Gc5d4,Gg7d4]}
        7.dxc5 Qa5 {On récupère le pion c5 et on cloue le Cc3 (le roi blanc n'a pas roqué). [%cal Ga5c3]}
        8.O-O Qxc5+ {Échec, matériel égal.}
        9.Kh1 Nc6 {Développement. Plan : …Fg4, …Tac8 et pression sur la colonne c.}`,
      },
      {
        name: '7.d5 : les Blancs avancent',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.f4 Nf6 5.Nf3 O-O 6.Be2 c5
        7.d5 e6 {On attaque la pointe du centre. [%cal Ge6d5]}
        8.dxe6 Bxe6 {Le fou s'active ; le pion e4 et la case d4 deviennent des cibles.}`,
      },
      {
        name: '6.Fd3 Cc6',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.f4 Nf6 5.Nf3 O-O
        6.Bd3 Nc6 {Le fou d3 ne défend pas d4 : le cavalier l'attaque, avec …e5 en préparation. [%cal Gc6d4]}
        7.O-O e5 {Rupture centrale.}
        8.d5 Ne7 {Centre fermé : cavalier en e7, puis …exf4 ou …Cd7/…f5.}`,
      },
      {
        name: '5.e5?! : le centre avance trop tôt',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.f4 Nf6
        5.e5?! {Coup ambitieux mais prématuré : le pion e5 devient une cible.}
        Nfd7 {On ne prend pas tout de suite : on prépare …c5 pour attaquer la base. [%cal Gc7c5]}
        6.Nf3 c5! {La base d4 est attaquée : le centre blanc commence à craquer. [%cal Gc5d4]}`,
      },
    ],
    alts: {
      'e4 g6 d4 Bg7 Nc3 d6 f4 Nf6 Nf3 O-O Be2': {
        Na6: ['inacc', "6…Ca6 est jouable, mais nettement moins précis que …c5 selon le moteur : on laisse les Blancs consolider le centre."],
        Nc6: ['inacc', '6…Cc6 ? 7.e5 ! chasse le Cf6 avec gain d’espace.', 'e5'],
        Bg4: ['inacc', '6…Fg4 est moins efficace que …c5 contre ce centre.'],
      },
      'e4 g6 d4 Bg7 Nc3 d6 f4 Nf6 Nf3 O-O Be2 c5 dxc5': {
        dxc5: ['inacc', "7…dxc5 échange les dames dans une finale où les Blancs ont plus d'espace. …Da5 récupère le pion avec activité."],
        Qc7: ['inacc', '7…Dc7 est passif comparé à …Da5.'],
      },
      'e4 g6 d4 Bg7 Nc3 d6 f4 Nf6 e5': {
        dxe5: ['inacc', "5…dxe5 6.dxe5 Dxd1+ 7.Rxd1 est jouable (le moteur le juge un peu moins bon), mais tu entres dans une finale passive. Selon le moteur, il est un peu moins précis que le coup du répertoire."],
        Ng4: ['inacc', "5…Cg4 6.h3 Ch6 : le cavalier finit hors-jeu au bord de l'échiquier."],
        Ng8: ['inacc', '5…Cg8 recule sans contre-jeu.'],
      },
    },
    qa: {
      'e4 g6 d4 Bg7 Nc3 d6 f4 Nf6 Nf3 O-O Be2 c5': {
        why: 'On attaque la base du centre blanc (d4). Un centre se détruit par sa base, pas par sa pointe.',
        whyNow: 'Avant que les Blancs ne jouent e5 : après e5, Cf6 doit reculer et …c5 devient plus difficile.',
        capture: 'Si dxc5, …Da5 récupère le pion avec un clouage sur c3. Si d5, …e6 attaque la pointe.',
      },
    },
  },

  {
    id: 'b-moderne-c4',
    side: 'b',
    group: 'Noirs contre 1.e4',
    title: 'Moderne : les Blancs jouent c4 (structure Maroczy)',
    eco: 'B06',
    summary:
      "Après 1.e4 g6 2.d4 Fg7 3.c4, les Blancs prennent beaucoup d'espace. On répond par …d6 et …e5 : si le centre s'ouvre, ton cavalier va en e7 (ta case préférée) et ton fou g7 respire. Si les Blancs poussent d5, on joue comme dans une Est-indienne.",
    plan: [
      '…d6 puis …e5 : contester tout de suite le centre.',
      'Après …exd4 Cxd4 : …Cc6 et …Cge7 (le cavalier g8 en e7 ne bloque pas le fou g7).',
      'Après d5 : …a5, …Ca6-c5 et plus tard …f5.',
    ],
    squares: 'Cases clés : d4 (après l’échange), c5 et e5 (avant-postes noirs).',
    pieces: 'Le fou g7, libéré après …exd4, est la meilleure pièce noire.',
    transition: 'Structure ouverte : jeu de pièces contre le pion e4. Structure fermée : plan …f5.',
    abandon: 'Si les Blancs échangent les dames (dxe5 dxe5 Dxd8+), oublie l’attaque : joue la finale, roi au centre.',
    lines: [
      {
        name: 'Ligne principale : 5.Cf3 exd4 6.Cxd4 Cc6 7.Fe3 Cge7',
        pgn: `1.e4 g6 2.d4 Bg7
        3.c4 {Les Blancs prennent de l'espace avec trois pions.}
        d6 4.Nc3 e5 {Contre-attaque centrale immédiate. [%cal Ge5d4]}
        5.Nf3 exd4 {On ouvre la diagonale du fou g7.}
        6.Nxd4 Nc6 {Le cavalier d4 est attaqué deux fois. [%cal Gc6d4,Gg7d4]}
        7.Be3 Nge7 {Ta structure préférée : le cavalier en e7 ne bloque pas le fou g7 et peut aller en f5. Le moteur juge la position équilibrée. [%cal Ge7f5]}`,
      },
      {
        name: '5.d5 : centre fermé',
        pgn: `1.e4 g6 2.d4 Bg7 3.c4 d6 4.Nc3 e5
        5.d5 a5 {On empêche b4 et on prépare …Ca6-c5.}
        6.Nf3 Nf6 7.Be2 O-O 8.O-O Na6 {Le cavalier ira en c5, case parfaite devant le pion d6. Plan suivant : …Cd7 ou …Ch5 et …f5.}`,
      },
      {
        name: 'Transposition : 5.Cge2',
        pgn: `1.e4 g6 2.d4 Bg7 3.c4 d6 4.Nc3 e5
        5.Nge2 exd4 6.Nxd4 Nc6 7.Be3 Nge7 {Même position que la ligne principale : le cavalier est arrivé en d4 par e2 au lieu de f3.}`,
      },
    ],
    alts: {
      'e4 g6 d4 Bg7 c4 d6 Nc3': {
        Nf6: ['alt', '4…Cf6 transpose dans une Est-indienne, c’est très bien aussi. On choisit …e5 pour garder ton cavalier en e7.'],
        Nc6: ['inacc', '4…Cc6 est une idée valable (pression sur d4). Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
        e6: ['inacc', "4…e6 bloque ton fou c8 et ne conteste pas le centre. …e5 est plus logique."],
      },
      'e4 g6 d4 Bg7 c4 d6 Nc3 e5 Nf3 exd4 Nxd4 Nc6 Be3': {
        Nf6: ['alt', '7…Cf6 est jouable, mais e4-e5 peut le chasser. En e7, le cavalier est à l’abri.'],
        Nxd4: ['alt', '7…Cxd4 8.Fxd4 Cf6 est solide aussi.'],
      },
    },
    qa: {
      'e4 g6 d4 Bg7 c4 d6 Nc3 e5 Nf3 exd4 Nxd4 Nc6 Be3 Nge7': {
        why: 'Le cavalier en e7 ne bloque pas le fou g7 (contrairement à f6) et ne peut pas être chassé par e5.',
        notOther: '…Cf6 est aussi possible, mais e4-e5 serait alors un coup avec gain de temps.',
        convert: 'Plan : …O-O, …f5 ou …Ce5/…a5 ; le fou g7 vise b2 et le cavalier d4.',
      },
    },
  },

  {
    id: 'b-moderne-autres',
    side: 'b',
    group: 'Noirs contre 1.e4',
    title: 'Moderne : coups rares et ordres de coups',
    eco: 'B06',
    summary:
      "Toutes les déviations blanches ne demandent pas de théorie : il suffit de connaître ton schéma (…Fg7, …d6, …Cf6, …O-O). Ici tu apprends aussi le seul cas où ton ancienne habitude …e6 est le meilleur coup : quand la dame blanche vise f7.",
    plan: [
      'Garder le même schéma : la plupart des coups blancs transposent.',
      'Fc4 + Df3 menace f7 : …e6 ! ferme la diagonale.',
      'Contre un système lent (c3, Fd3) : …Cc6 et …e5, ou …c5.',
    ],
    squares: 'f7 (point faible quand le fou blanc est en c4), e5.',
    pieces: 'Le fou g7 et le cavalier f6.',
    transition: 'Mêmes plans que dans le système classique.',
    abandon: 'Si l’adversaire attaque f7 tôt, priorité à la défense, même au prix d’un fou c8 un peu bloqué.',
    lines: [
      {
        name: '2.Fc4 Fg7 3.Df3 e6 !',
        pgn: `1.e4 g6
        2.Bc4 Bg7 3.Qf3 {Menace Dxf7 mat ! [%cal Rf3f7,Rc4f7] [%csl Rf7]}
        e6 {Ici …e6 est le meilleur coup selon le moteur : le pion bloque la diagonale du fou c4. C'est ta structure préférée, utilisée au bon moment. [%cal Ge6d5]}
        4.Ne2 Nc6 {Développement, puis …Cge7 (ton cavalier e7 !) et …d5.}`,
      },
      {
        name: '2.Cf3 Fg7 3.d4 d6 : transposition',
        pgn: `1.e4 g6 2.Nf3 Bg7 3.d4 d6
        4.Nc3 Nf6 {On retombe dans le système classique (4.Cf3) par un autre ordre.}`,
      },
      {
        name: '4.Fc4 (sans Cf3)',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6
        4.Bc4 Nf6 {On attaque e4 ; Fc4 laisse e4 sans défense supplémentaire.}
        5.Qe2 Nc6 {Pression sur d4 et idée …Fg4.}`,
      },
      {
        name: '4.Fc4 Cf6 5.e5 : on simplifie',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Bc4 Nf6
        5.e5 dxe5 6.dxe5 Qxd1+ 7.Nxd1 Nfd7 {Finale équilibrée ; le pion e5 sera attaqué par …Cc6 et …Cb6/…Cxe5.}`,
      },
      {
        name: 'Système c3 : 3.Cf3 d6 4.c3',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nf3 d6
        4.c3 Nf6 5.Bd3 O-O 6.O-O Nc6 {Pression sur d4, puis …e5.}`,
      },
      {
        name: '4.Fg5',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6
        4.Bg5 Nf6 {Même schéma ; si Dd2, …h6 et …c6/…b5 comme contre l'attaque 150.}`,
      },
    ],
    alts: {
      'e4 g6 Bc4 Bg7 Qf3': {
        Nh6: ['inacc', '3…Ch6 défend aussi f7, mais le moteur le juge nettement moins bon que …e6 : le cavalier est mal placé au bord.'],
        Nf6: ['err', "3…Cf6 ? bloque la dame, mais 4.e5 chasse le cavalier, qui n'a plus de bonne case : le moteur donne un gros avantage aux Blancs.", 'e5'],
        d6: ['err', "3…d6 ?? 4.Dxf7 mat ! Toujours vérifier les menaces de mat avant de jouer ton plan.", 'Qxf7#'],
        d5: ['inacc', '3…d5 est jouable mais complexe ; …e6 est simple et fort.'],
      },
    },
    qa: {
      'e4 g6 Bc4 Bg7 Qf3 e6': {
        why: 'La dame f3 et le fou c4 visent f7 : c’est une menace de mat. Le pion e6 coupe la diagonale du fou.',
        threat: 'Dxf7 mat était menacé.',
        notOther: '…Cf6 défend aussi, mais e4-e5 le chasse. …e6 règle le problème durablement.',
      },
    },
  },

  {
    id: 'b-est-indienne',
    side: 'b',
    group: 'Noirs contre 1.d4',
    title: 'Est-indienne : variante classique',
    eco: 'E97',
    summary:
      "La défense Est-indienne est la cousine de ta Pirc contre 1.d4 : mêmes coups (…Cf6, …g6, …Fg7, …d6, …O-O, …e5). Quand les Blancs ferment par d5, ton cavalier va de c6 à e7 et tu lances …f5 : c'est le plan Mar del Plata, l'un des plus célèbres de l'histoire des échecs.",
    plan: [
      '…Cf6, …g6, …Fg7, …d6, …O-O, puis la rupture …e5.',
      'Si d5 : …Ce7, …Cd7 (ou …Ce8) et …f5 : attaque à l’aile roi.',
      'Si dxe5 dxe5 Dxd8 : finale égale, ne pas avoir peur.',
      'Les Blancs attaquent à l’aile dame (b4, c5) : sois plus rapide à l’aile roi.',
    ],
    squares: 'Cases clés : d4 (avant …e5), f5 et f4 (poussée noire), c5 (case blanche).',
    pieces: 'Fou g7 (souvent bloqué par e5 : il revient en jeu après …f5-f4-g5). Cavalier e7 → g6.',
    transition: 'Course d’attaques : Noirs à l’aile roi, Blancs à l’aile dame.',
    abandon: 'Si les Blancs n’ont pas roqué petit, ne lance pas …f5 aveuglément.',
    lines: [
      {
        name: 'Ligne principale : Mar del Plata (9.Ce1)',
        pgn: `1.d4 Nf6 {Contre 1.d4, on commence par le cavalier : il empêche e4 tout de suite.}
        2.c4 g6 3.Nc3 Bg7 {Fianchetto : ton fou préféré sur la grande diagonale.}
        4.e4 d6 {Comme dans la Pirc : d6 contrôle e5.}
        5.Nf3 O-O 6.Be2 e5 {La rupture de l'Est-indienne. [%cal Ge5d4]}
        7.O-O Nc6 {Deuxième attaque sur d4. Les Blancs doivent décider. [%cal Gc6d4]}
        8.d5 Ne7 {Centre fermé : le cavalier passe en e7, comme dans ta structure préférée. [%cal Gc6e7]}
        9.Ne1 {Le cavalier blanc va en d3 pour soutenir c5 et f4.}
        Nd7 {Libère le pion f. [%cal Gf6d7,Gf7f5]}
        10.Nd3 f5 {L'attaque commence. Plan : …Cf6, …f4, …g5-g4. [%cal Gf5f4,Gg6g5]}
        11.Bd2 Nf6 12.f3 f4 {On ferme l'aile roi et on prépare …g5-g4. Position riche, jouée par Kasparov et Fischer.}`,
      },
      {
        name: '9.b4 : l’attaque à la baïonnette',
        pgn: `1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7
        9.b4 a5 {On attaque la chaîne blanche avant qu'elle n'avance (c5).}
        10.bxa5 Rxa5 {La tour s'active sur la colonne a.}`,
      },
      {
        name: '9.Cd2',
        pgn: `1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7
        9.Nd2 a5 {Ralentir b4.}
        10.Rb1 Nd7 {Puis …f5 : même plan que la ligne principale.}`,
      },
      {
        name: '7.dxe5 : échange des dames',
        pgn: `1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5
        7.dxe5 dxe5 8.Qxd8 Rxd8 {Finale équilibrée. Attention à e5.}
        9.Bg5 Re8 {La tour protège e5. Plan : …c6, …Ca6-c5 ou …Cbd7-c5. Cases d4 et c5 pour tes cavaliers.}`,
      },
      {
        name: '9.Cxe5 : la fausse prise de pion',
        pgn: `1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.dxe5 dxe5 8.Qxd8 Rxd8
        9.Nxe5 {Les Blancs croient gagner un pion…}
        Nxe4! {… mais tu récupères immédiatement le pion e4. [%cal Gf6e4]}
        10.Nxe4 Bxe5 {Matériel égal, ton fou est actif. Le moteur juge la position égale ou légèrement meilleure pour les Noirs.}`,
      },
      {
        name: '7.Fe3 Cg4',
        pgn: `1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5
        7.Be3 Ng4 {On attaque le fou e3 : la paire de fous est menacée. [%cal Gf6g4,Gg4e3]}
        8.Bg5 f6 9.Bh4 Nc6 {Pression sur d4.}
        10.d5 Ne7 {Même structure : cavalier en e7, puis …Ch6 / …f5.}`,
      },
      {
        name: '7.d5 : fermeture immédiate',
        pgn: `1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5
        7.d5 a5 {On prend la case c5 pour le cavalier (…Ca6-c5) et on empêche b4.}
        8.Be3 Ng4 {On chasse le fou. Plan : …f5.}`,
      },
    ],
    alts: {
      'd4': {
        d5: ['alt', "1…d5 est excellent, mais ce n'est pas ton système fianchetto."],
        g6: ['inacc', "1…g6 est jouable, mais 1…Cf6 empêche e4 tout de suite. Selon le moteur, il est un peu moins précis que le coup du répertoire."],
        e6: ['inacc', "1…e6 garde des options, mais l'idée du répertoire est …Cf6 et …g6."],
      },
      'd4 Nf6 c4 g6 Nc3': {
        d5: ['alt', '3…d5 est la Grünfeld, une excellente défense mais très théorique. On garde le système …Fg7, …d6.'],
      },
      'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2': {
        c5: ['alt', '6…c5 est jouable (structure Benoni), mais …e5 est le cœur de notre système.'],
        Nbd7: ['inacc', '6…Cbd7 prépare aussi …e5 : bon coup, autre ordre. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
        Na6: ['inacc', '6…Ca6 est un système moderne valable. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
      },
      'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5': {
        Nb8: ['inacc', '8…Cb8 est jouable mais passif : en e7 le cavalier soutient …f5.'],
        Nd4: ['inacc', "8…Cd4 est jouable selon le moteur, mais il échange ton cavalier et renonce au plan …f5, cœur du système."],
      },
      'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 Ne1': {
        Ne8: ['alt', '9…Ce8 est aussi une façon classique de préparer …f5.'],
        Nh5: ['inacc', '9…Ch5 est jouable, mais le cavalier est moins bien placé en h5.'],
      },
      'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 dxe5 dxe5 Qxd8 Rxd8 Nxe5': {
        Re8: ['alt', '9…Te8 est également correct, mais …Cxe4 récupère le pion tout de suite.'],
        Nbd7: ['inacc', "9…Cbd7 laisse les Blancs consolider leur pion de plus."],
      },
    },
    qa: {
      'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5': {
        why: 'C’est la rupture de l’Est-indienne : on conteste d4 et on gagne de l’espace au centre.',
        capture: 'Si dxe5 dxe5 Dxd8 Txd8 : finale égale. Si Cxe5 ensuite, …Cxe4 ! récupère le pion.',
        oppPlan: 'Les Blancs veulent d5 pour gagner de l’espace et jouer c5 à l’aile dame.',
      },
      'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7': {
        why: 'Le cavalier, chassé de c6, part vers l’aile roi (g6) où se jouera ton attaque. Il libère aussi le pion c pour …c6 éventuel.',
        convert: 'Plan Mar del Plata : …Cd7 (ou …Ce8), …f5, …Cf6, …f4, …g5-g4.',
        attackOrDevelop: 'Le développement est terminé : c’est le moment d’attaquer.',
      },
      'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 Ne1 Nd7 Nd3 f5': {
        why: 'La rupture …f5 attaque e4 et prépare l’avancée des pions de l’aile roi.',
        weak: 'Après …f5, la case e6 et la diagonale a2-g8 peuvent devenir faibles : surveille Fc4 éventuel.',
      },
    },
  },

  {
    id: 'b-est-indienne-autres',
    side: 'b',
    group: 'Noirs contre 1.d4',
    title: 'Est-indienne : Sämisch, quatre pions, fianchetto',
    eco: 'E60–E89',
    summary:
      "Contre les systèmes agressifs (f3, f4) ou calmes (g3), le schéma reste le même. Contre le Sämisch (f3) on frappe avec …c5 ; contre les quatre pions (f4) aussi ; contre le fianchetto, …Cbd7 et …e5.",
    plan: [
      'Contre f3 : …c5 (gambit Sämisch) ou …e5 ; ne pas laisser les Blancs attaquer tranquillement.',
      'Contre f4 : …c5 et …e6 pour ouvrir la colonne e contre le centre blanc.',
      'Contre g3 : jeu calme, …Cbd7 et …e5.',
    ],
    squares: 'd4, c5, e5 selon la structure.',
    pieces: 'Fou g7 toujours prioritaire.',
    transition: 'Structures Benoni (après …c5 d5 e6) ou Est-indienne classique.',
    abandon: 'Si le centre blanc s’effondre, prends-le !',
    lines: [
      {
        name: 'Sämisch : 5.f3 O-O 6.Fe3 c5',
        pgn: `1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6
        5.f3 {Le Sämisch : les Blancs préparent Fe3, Dd2 et une attaque g4-h4.}
        O-O 6.Be3 c5 {On frappe d4 tout de suite. [%cal Gc5d4]}
        7.dxc5 dxc5 8.Qxd8 Rxd8 9.Bxc5 Nc6 {Les Blancs ont gagné un pion, mais tu as un grand développement : …Cd7 ou …Fe6 et pression sur d4/b2. Le moteur juge cette compensation suffisante.}`,
      },
      {
        name: 'Quatre pions : 5.f4 O-O 6.Cf3 c5',
        pgn: `1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6
        5.f4 O-O 6.Nf3 c5 {Même idée : frapper la base.}
        7.d5 e6 8.Be2 exd5 9.cxd5 Re8 {La tour met la pression sur e4. Plan : …Fg4, …Cbd7, …b5.}`,
      },
      {
        name: 'Fianchetto : 3.Cf3 Fg7 4.g3',
        pgn: `1.d4 Nf6 2.c4 g6 3.Nf3 Bg7
        4.g3 O-O 5.Bg2 d6 6.O-O Nbd7 {Plan calme : …e5.}
        7.Nc3 e5 8.e4 exd4 {On ouvre la diagonale et on joue contre e4.}
        9.Nxd4 Re8 {Pression sur e4. Plan : …Cc5, …a5, …c6.}`,
      },
      {
        name: 'Système Averbakh : 5.Fe2 O-O 6.Fg5',
        pgn: `1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6
        5.Be2 O-O 6.Bg5 c5 {Contre Fg5, …c5 est l'antidote classique.}
        7.d5 h6 {On demande au fou de choisir.}`,
      },
    ],
    alts: {
      'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f3 O-O Be3': {
        e5: ['inacc', '6…e5 est aussi un coup principal (après 7.d5, …c6 ou …Ch5). Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
      },
    },
    qa: {},
  },

  {
    id: 'b-londres',
    side: 'b',
    group: 'Noirs contre 1.d4',
    title: 'Contre le Système de Londres, le Colle et la Trompowsky',
    eco: 'A45–A48, D02',
    summary:
      "Très fréquent à ton niveau ! Contre le Londres (Ff4, e3, Cf3), on garde le fianchetto et on frappe avec …c5 et …Db6 (attaque sur b2). Contre le Colle (Fd3, e3), …d6, …Cbd7 et …e5.",
    plan: [
      'Contre Ff4 : …g6, …Fg7, …O-O, …d6, puis …c5 et …Db6.',
      'Contre le Colle : …d6, …Cbd7, …e5.',
      'Contre Fg5 (Trompowsky) : …g6 ; si Fxf6 exf6, tu as la paire de fous.',
    ],
    squares: 'b2 (cible de …Db6), d4, e5.',
    pieces: 'Fou g7 sur la diagonale ouverte après …c5.',
    transition: 'Positions de manœuvre : patience, la rupture …e5 ou …c5 décide.',
    abandon: 'Si les Blancs jouent Db3 contre ta Db6, échanger ou garder dépend de la colonne a ouverte.',
    lines: [
      {
        name: 'Londres : …c5 et …Db6',
        pgn: `1.d4 Nf6 2.Bf4 {Le Système de Londres.}
        g6 3.e3 Bg7 4.Nf3 O-O 5.Be2 d6 6.O-O c5 {Frappe d4. [%cal Gc5d4]}
        7.c3 Qb6 {Attaque b2. Le fou f4 a quitté c1 : b2 n'est plus défendu. [%cal Gb6b2] [%csl Rb2]}
        8.Qb3 Nc6 {On développe ; si Dxb6 axb6, la colonne a s'ouvre pour ta tour.}`,
      },
      {
        name: 'Londres avec h3',
        pgn: `1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O 5.Be2 d6
        6.h3 c5 7.c3 Qb6 {Même plan.}
        8.Qc1 Nc6 {Pression sur d4 ; plan …cxd4 et …e5.}`,
      },
      {
        name: 'Colle : …Cbd7 et …e5',
        pgn: `1.d4 Nf6 2.Nf3 g6
        3.e3 Bg7 4.Bd3 O-O 5.O-O d6 6.c3 Nbd7 {Préparer …e5.}
        7.e4 e5 {Le centre est équilibré.}`,
      },
      {
        name: 'Trompowsky : 2.Fg5 g6 3.Fxf6',
        pgn: `1.d4 Nf6 2.Bg5 g6
        3.Bxf6 exf6 {Tu as la paire de fous. Le pion doublé f n'est pas grave : il contrôle e5 et g5.}
        4.e3 Bg7 {Plan : …d5 ou …f5, …O-O, …c5.}`,
      },
      {
        name: 'Veresov : 2.Cc3 g6 3.Fg5 Fg7',
        pgn: `1.d4 Nf6 2.Nc3 g6
        3.Bg5 Bg7 4.Qd2 d5 {Ici …d5 (selon le moteur) bloque e4. On roquera ensuite. Note : après 2.Cc3, le moteur préfère 2…d5 à 2…g6, mais 2…g6 reste jouable et garde ton système.}`,
      },
      {
        name: '2.Cc3 g6 3.e4 d6 : transposition Pirc',
        pgn: `1.d4 Nf6 2.Nc3 g6
        3.e4 d6 {Tu es dans la Pirc ! Si 4.f4 Fg7, c'est l'attaque autrichienne. Si 4.Cf3 Fg7, c'est le système classique.}`,
      },
    ],
    alts: {
      'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 O-O': {
        Nh5: ['alt', '6…Ch5 (chasser le fou f4) est aussi excellent selon le moteur.'],
        Nbd7: ['alt', '6…Cbd7 et …e5 est un plan valable aussi.'],
      },
      'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 O-O c5 c3': {
        cxd4: ['alt', '7…cxd4 est jouable aussi.'],
        Nc6: ['alt', '7…Cc6 est bon.'],
      },
    },
    qa: {
      'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 O-O c5 c3 Qb6': {
        why: 'Le fou blanc est parti en f4 : b2 n’est défendu par personne. La dame l’attaque.',
        threat: 'Menace …Dxb2.',
        oppPlan: 'Les Blancs voudraient un jeu tranquille (h3, Cbd2, Ce5). …Db6 les force à réagir.',
      },
    },
  },

  {
    id: 'b-anglaise-cf3',
    side: 'b',
    group: 'Noirs contre 1.c4, 1.Cf3 et coups rares',
    title: 'Contre 1.c4, 1.Cf3 et les premiers coups rares',
    eco: 'A04–A29',
    summary:
      "Le grand avantage de ton système : il fonctionne presque contre tout. Contre 1.c4 ou 1.Cf3 : …Cf6, …g6, …Fg7, …O-O, …d6 et …e5. Tu n'as quasiment rien à apprendre en plus.",
    plan: [
      '…Cf6, …g6, …Fg7, …O-O, …d6.',
      'Puis …e5 (et souvent …Cc6).',
      'Si les Blancs jouent d4 + c4 + Cc3 + e4 : c’est l’Est-indienne.',
    ],
    squares: 'e5, d4.',
    pieces: 'Fou g7.',
    transition: 'Milieux de jeu de manœuvre.',
    abandon: 'Si l’adversaire joue un coup rare et agressif, demande-toi d’abord ce qu’il menace.',
    lines: [
      {
        name: 'Anglaise : 1.c4 Cf6 2.Cc3 g6 3.g3',
        pgn: `1.c4 Nf6 2.Nc3 g6 3.g3 Bg7 4.Bg2 O-O
        5.Nf3 d6 6.O-O e5 {On occupe le centre.}
        7.d3 Nc6 {Plan : …a5, …h6, …Fe6 ou …Ch5 et …f5.}`,
      },
      {
        name: 'Anglaise avec e4 (Botvinnik)',
        pgn: `1.c4 Nf6 2.Nc3 g6 3.g3 Bg7 4.Bg2 O-O
        5.e4 d6 6.Nge2 e5 7.O-O c5 {On bloque la case d4 de façon symétrique ; plan …Cc6, …a6, …Tb8 et …b5.}`,
      },
      {
        name: 'Anglaise vers l’Est-indienne',
        pgn: `1.c4 Nf6 2.Nc3 g6
        3.e4 d6 4.d4 Bg7 {Transposition dans l'Est-indienne : même plan …O-O et …e5.}`,
      },
      {
        name: '1.Cf3 : le même schéma',
        pgn: `1.Nf3 Nf6 2.g3 g6 3.Bg2 Bg7 4.O-O O-O
        5.d3 d6 6.e4 e5 {Structure symétrique et équilibrée.}
        7.Nc3 Nc6 {Plan : …a5, …h6, …Ch5 / …Fe6.}`,
      },
      {
        name: '1.Cf3 avec d4 et c4',
        pgn: `1.Nf3 Nf6 2.g3 g6 3.Bg2 Bg7 4.O-O O-O
        5.d4 d6 6.c4 Nbd7 {Même position que l'Est-indienne fianchetto (transposition) : on prépare …e5. Le moteur préfère légèrement …c5, mais garder un seul plan est plus simple.}`,
      },
      {
        name: '1.b3 (Larsen)',
        pgn: `1.b3 Nf6 2.Bb2 g6
        3.Bxf6 exf6 {Tu as la paire de fous. Le moteur juge déjà la position confortable pour les Noirs.}`,
      },
      {
        name: '1.f4 (Bird)',
        pgn: `1.f4 Nf6 2.Nf3 g6 3.e3 Bg7 4.Be2 O-O 5.O-O d6
        6.d3 c5 {Plan : …Cc6, …Tb8, …b5 à l’aile dame.}`,
      },
    ],
    alts: {
      'c4': {
        e5: ['alt', '1…e5 est excellent, mais notre système commence par …Cf6.'],
        c5: ['alt', '1…c5 est excellent aussi.'],
      },
      'Nf3': {
        d5: ['alt', '1…d5 est très bon, mais pas ton système.'],
      },
    },
    qa: {},
  },
];
