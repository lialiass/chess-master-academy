// Répertoire BLANC autour de 1.e4 — Italienne lente (Giuoco Pianissimo) + un système par défense.
// Même format que black.js.

export const WHITE_CHAPTERS = [
  {
    id: 'w-italienne-pianissimo',
    side: 'w',
    group: 'Blancs : 1.e4 e5',
    title: 'Italienne : Giuoco Pianissimo (3…Fc5)',
    eco: 'C50–C54',
    summary:
      "C'est le système que tu cherchais : Cf3, Fc4, petit roque. On ajoute c3 et d3 pour un centre solide, puis la manœuvre clé Cb1-d2-f1-g3 — voilà ton fameux « cavalier en g3 » ! Il ne s'y développe pas directement : il y arrive en trois étapes, après le roque et Te1.",
    plan: [
      'Développer : Cf3, Fc4, c3, d3, O-O, Te1.',
      'Fb3 pour garder le fou sur la diagonale a2-g8 (cible : f7).',
      'h3 pour empêcher …Fg4 / …Cg4.',
      'Manœuvre Cbd2-f1-g3 : le cavalier rejoint l’aile roi (cases f5, h5).',
      'Plus tard : d3-d4 pour ouvrir le centre au bon moment.',
    ],
    squares: 'Cases clés : f7 (cible du fou), f5 (avant-poste du Cg3), d4 (poussée future).',
    pieces: 'Le fou c4/b3 est ta meilleure pièce : évite qu’il se fasse échanger par …Ca5.',
    transition: 'Milieu de jeu de manœuvre : Cg3, Fe3 ou Fg5, puis d4 ou Ch4-f5.',
    abandon: "Si les Noirs jouent tôt …d5 ou …Cg4, oublie la manœuvre lente : réagis au centre (exd5, h3, d4).",
    lines: [
      {
        name: 'Ligne principale jusqu’à 12.Cg3',
        pgn: `1.e4 {Le pion contrôle d5 et f5, et libère la dame et le fou f1.}
        e5 2.Nf3 {Développe et attaque e5 tout de suite. [%cal Gf3e5]}
        Nc6 3.Bc4 {Le fou vise f7, le point le plus faible du camp noir (défendu par le roi seul). [%cal Gc4f7] [%csl Rf7]}
        Bc5 4.c3 {Prépare d4 plus tard et enlève la case d4 au cavalier noir. [%csl Gd4]}
        Nf6 5.d3 {Version « pianissimo » : on protège e4 calmement. d4 viendra plus tard, quand tout sera prêt.}
        d6 6.O-O O-O 7.Re1 {La tour soutient e4 et prépare la manœuvre Cbd2-f1.}
        a6 8.Bb3 {On anticipe …Ca5 et …b5 : le fou se met à l'abri sans quitter la diagonale.}
        Ba7 9.h3 {Empêche …Fg4 et …Cg4. Ce petit coup est très important.}
        h6 10.Nbd2 Re8 11.Nf1 {Étape 2 : le cavalier libère d2 et se dirige vers g3.}
        Be6 12.Ng3 {Voilà ton cavalier en g3 ! Il vise f5 et h5, et protège e4. Le moteur juge la position équilibrée et riche. [%cal Gg3f5,Gg3h5] [%csl Gf5]}`,
      },
      {
        name: '5…d5 : les Noirs ouvrent le centre',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3
        d5 {Les Noirs prennent l'initiative au centre.}
        6.exd5 Nxd5 7.Qb3! {Attaque d5 deux fois (dame + fou) et vise f7. Le moteur juge ce coup nettement plus fort que 7.O-O. [%cal Gb3d5,Gc4d5,Gb3f7]}`,
      },
      {
        name: 'Transposition : 5…O-O 6.O-O d6',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3
        O-O 6.O-O d6 7.Re1 {Même position que la ligne principale.}`,
      },
      {
        name: '5…a6 6.O-O d6 7.a4',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3
        a6 6.O-O d6 7.a4 {On prend de l'espace et on garde le fou en c4 ou a2.}
        Ba7 8.Nbd2 {Même manœuvre ensuite : Te1, Cf1, Cg3.}`,
      },
      {
        name: '4…d6 : on prend le centre',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3
        d6 5.d4 {Sans …Cf6, e4 n'est pas attaqué : on peut prendre le centre immédiatement. [%cal Gd2d4]}
        exd4 6.cxd4 Bb6 7.Nc3 {Centre idéal e4-d4 et développement rapide.}`,
      },
      {
        name: '4…De7',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3
        Qe7 5.d4 {La dame défend e5, mais d4 gagne du temps sur le fou c5.}
        Bb6 6.O-O Nf6 7.Re1 {Développement harmonieux.}`,
      },
    ],
    alts: {
      'e4 e5': {
        Bc4: ['alt', "2.Fc4 est jouable, mais 2.Cf3 attaque e5 immédiatement et garde toutes les options."],
        Nc3: ['alt', '2.Cc3 (Viennoise) est un bon coup, mais pas ton répertoire.'],
        d4: ['inacc', '2.d4 (Centre) est jouable, mais la dame noire se développe avec gain de temps après 2…exd4 3.Dxd4 Cc6. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
        Qh5: ['inacc', "2.Dh5 vise f7 mais sort la dame trop tôt : après 2…Cc6 3.Fc4 g6, la dame se fait chasser. Un bon adversaire en profite."],
        f4: ['inacc', "2.f4 (Gambit du roi) est spectaculaire, mais le moteur le juge nettement moins bon : risqué et très théorique."],
      },
      'e4 e5 Nf3 Nc6': {
        Bb5: ['alt', "3.Fb5 (Espagnole) est l'ouverture la plus jouée au haut niveau, mais elle demande beaucoup de théorie. On choisit l'Italienne, plus simple à comprendre."],
        d4: ['alt', '3.d4 (Écossaise) est un excellent choix aussi.'],
        Nc3: ['alt', '3.Cc3 (Trois cavaliers) est solide mais moins ambitieux.'],
      },
      'e4 e5 Nf3 Nc6 Bc4 Bc5': {
        'O-O': ['alt', '4.O-O est bon, mais 4.c3 prépare d4 et enlève d4 au cavalier noir.'],
        d3: ['alt', '4.d3 est bon aussi et transpose souvent.'],
        b4: ['alt', '4.b4 (Gambit Evans) est un gambit correct, mais plus risqué.'],
        Nc3: ['alt', '4.Cc3 est jouable mais permet …Cf6 et …d6 confortablement.'],
        Bxf7: ['err', "4.Fxf7+ ? Rxf7 5.Cxe5+ Cxe5 : tu as donné une pièce pour deux pions et le roi noir est en sécurité.", 'Kxf7'],
        Ng5: ['err', "4.Cg5 ?? attaque f7, mais le cavalier n'est pas défendu : 4…Dxg5 gagne une pièce.", 'Qxg5'],
      },
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6': {
        d4: ['alt', "5.d4 (Giuoco Piano classique) est le coup le plus ambitieux, mais très théorique (5…exd4 6.cxd4 Fb4+). On choisit 5.d3, plus solide."],
        b4: ['alt', '5.b4 est une idée valable (gain d’espace).'],
        Ng5: ['inacc', "5.Cg5 attaque f7 mais après 5…O-O ton cavalier est mal placé et e4 tombe vite."],
        'O-O': ['inacc', "5.O-O ? permet 5…Cxe4 : le pion e4 n'est plus défendu. Joue d'abord 5.d3.", 'Nxe4'],
      },
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6': {
        a4: ['alt', '8.a4 est une excellente alternative (empêcher …b5).'],
        Nbd2: ['alt', '8.Cbd2 est bon aussi, mais 8.Fb3 anticipe …b5 et …Ca5.'],
        h3: ['alt', '8.h3 est jouable.'],
      },
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 Bb3 Ba7': {
        Nbd2: ['alt', '9.Cbd2 est bon, mais permet …Cg4 ou …Fg4. 9.h3 d’abord est plus précis.'],
        Bg5: ['inacc', '9.Fg5 h6 10.Fh4 g5 : le fou est repoussé et ton roi s’affaiblit après …g5 ? Ce n’est pas une erreur, mais h3 est plus cohérent.'],
      },
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 Bb3 Ba7 h3 h6 Nbd2 Re8': {
        d4: ['inacc', "11.d4 est prématuré selon le moteur : le centre s'ouvre avant que tes pièces soient prêtes. Termine d'abord la manœuvre Cf1-g3."],
      },
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 Bb3 Ba7 h3 h6 Nbd2 Re8 Nf1 Be6': {
        Bc2: ['alt', '12.Fc2 est jouable aussi (le moteur les juge équivalents).'],
        Be3: ['alt', '12.Fe3 est jouable aussi.'],
        Bxe6: ['alt', '12.Fxe6 est jouable, mais ouvre la colonne f aux Noirs.'],
      },
    },
    qa: {
      'e4 e5 Nf3 Nc6 Bc4': {
        why: 'Le fou vise f7, la case la plus faible du camp noir au début de la partie : seul le roi la défend.',
        notOther: 'Fb5 (Espagnole) est excellent mais très théorique. Fc4 est plus direct et plus facile à comprendre.',
        attackOrDevelop: 'Développer ! L’attaque sur f7 n’est qu’une pression, pas un plan immédiat.',
      },
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3': {
        why: 'c3 prépare la poussée d4 et enlève la case d4 au cavalier c6.',
        weak: 'La case d3 et le pion d sont un peu en retard : on jouera d3 tout de suite.',
        oppPlan: 'Les Noirs veulent …Cf6 pour attaquer e4.',
      },
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3': {
        why: 'Le pion d3 défend e4 calmement. On garde d4 pour plus tard.',
        whyNow: 'e4 était attaqué par le Cf6 : il fallait le défendre.',
        notOther: '5.d4 est plus ambitieux mais demande de connaître beaucoup de théorie. 5.O-O ? perd le pion e4.',
      },
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 Bb3 Ba7 h3': {
        why: 'h3 empêche …Fg4 (clouage du Cf3) et …Cg4 (attaque sur f2).',
        attackOrDevelop: 'On termine la mise en place avant d’ouvrir le jeu.',
      },
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 Bb3 Ba7 h3 h6 Nbd2 Re8 Nf1 Be6 Ng3': {
        why: 'Le cavalier en g3 surveille f5 et h5, deux cases d’attaque près du roi noir.',
        convert: 'Plans suivants : Ch4-f5, ou Fe3 et d4 pour ouvrir le centre au bon moment.',
        exchange: 'Si …Fxb3, reprends Dxb3 : ta dame attaque b7 et f7.',
      },
    },
  },

  {
    id: 'w-italienne-deux-cavaliers',
    side: 'w',
    group: 'Blancs : 1.e4 e5',
    title: 'Italienne : Deux cavaliers (3…Cf6) et Hongroise',
    eco: 'C55',
    summary:
      "Contre 3…Cf6, on joue 4.d3 : on évite la théorie très tranchante de 4.Cg5 et on garde la même structure que le Pianissimo. Contre 3…Fe7 et 3…d6, même schéma : c3, d3, O-O, Te1.",
    plan: ['d3, O-O, Te1, c3, puis la manœuvre Cbd2-f1-g3.', 'Contre …Ca5 : Fb5 ou Fb3, garder le fou.'],
    squares: 'f7, d4, f5.',
    pieces: 'Fou c4 (diagonale a2-g8).',
    transition: 'Mêmes plans que le Pianissimo.',
    abandon: 'Si les Noirs jouent …d5 tôt, prends exd5 et attaque e5.',
    lines: [
      {
        name: 'Ligne principale : 4.d3 Fe7',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6
        4.d3 {On défend e4. Même esprit que le Pianissimo.}
        Be7 5.O-O O-O 6.Re1 d6 7.c3 {Même structure.}
        Na5 8.Bb5 {On garde le fou : l'échange …Cxc4 aiderait les Noirs.}
        a6 9.Ba4 c5 {Le fou reste sur la diagonale a4-e8.}`,
      },
      {
        name: 'Transposition : 4…Fc5 5.c3',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3
        Bc5 5.c3 {Exactement le Giuoco Pianissimo : tu connais déjà la suite.}`,
      },
      {
        name: '4…h6',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3
        h6 5.O-O d6 6.c3 {Même plan.}`,
      },
      {
        name: '4…d5 : ouverture du centre',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3
        d5 5.exd5 Nxd5 6.O-O {Puis Te1 pour attaquer e5.}
        Be7 7.Re1 {Pression sur e5. Le moteur juge cette position un peu meilleure pour les Blancs.}`,
      },
      {
        name: 'Hongroise : 3…Fe7',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4
        Be7 4.d3 Nf6 5.O-O O-O {Même position que 3…Cf6 4.d3 Fe7 5.O-O O-O : transposition.}
        6.Re1 d6 7.c3 {Même structure.}`,
      },
      {
        name: '3…d6 4.c3 Cf6?! 5.Cg5 !',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4
        d6 4.c3 {Même plan : préparer d4.}
        Nf6?! 5.Ng5! {Ici f7 n'est défendu que par le roi et …d5 n'est plus aussi efficace : le moteur juge 5.Cg5 nettement plus fort que 5.d3. [%cal Gg5f7,Gc4f7] [%csl Rf7]}
        d5 6.exd5 {Si 6…Cxd5 ?, 7.d4 ! ouvre le centre contre le roi noir. La meilleure défense, 6…Ca5, mène à une position tactique où les Blancs gardent l'avantage selon le moteur.}`,
      },
      {
        name: '3…d6 4.c3 Fe7',
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 d6 4.c3
        Be7 5.d3 Nf6 6.O-O O-O 7.Re1 {Transposition vers la structure du Pianissimo.}`,
      },
    ],
    alts: {
      'e4 e5 Nf3 Nc6 Bc4 Nf6': {
        Ng5: ['alt', "4.Cg5 est le coup le plus agressif (vers le Fegatello), mais il mène à une théorie énorme après 4…d5 5.exd5 Ca5. On choisit 4.d3."],
        d4: ['alt', '4.d4 est un bon coup tranchant.'],
        Nc3: ['inacc', '4.Cc3 permet le coup de fourchette …Cxe4 ! 5.Cxe4 d5. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
      },
    },
    qa: {
      'e4 e5 Nf3 Nc6 Bc4 Nf6 d3': {
        why: 'e4 était attaqué. d3 le protège sans engager la partie dans la théorie de 4.Cg5.',
        notOther: '4.Cg5 attaque f7 mais après 4…d5 ! la position devient très tactique.',
      },
    },
  },

  {
    id: 'w-e5-rares',
    side: 'w',
    group: 'Blancs : 1.e4 e5',
    title: 'Réponses rares au 2e coup : Philidor, Petrov, Latvian…',
    eco: 'C40–C42',
    summary:
      "Quand les Noirs ne jouent pas 2…Cc6, on applique des principes simples : prendre le centre (d4) contre la Philidor, savoir reprendre son pion contre la Petrov, et punir les gambits douteux.",
    plan: ['Contre 2…d6 : 3.d4.', 'Contre 2…Cf6 : 3.Cxe5 d6 4.Cf3.', 'Contre les gambits : prendre et se développer.'],
    squares: 'e5, d4, f7.',
    pieces: 'Cavalier f3, fou c4.',
    transition: 'Avantage d’espace contre la Philidor ; jeu ouvert contre la Petrov.',
    abandon: 'Si l’adversaire joue un coup inattendu, vérifie d’abord : est-ce qu’il pend une pièce ?',
    lines: [
      {
        name: 'Philidor : 2…d6 3.d4',
        pgn: `1.e4 e5 2.Nf3 d6
        3.d4 {On prend le centre. [%cal Gd2d4]}
        exd4 4.Nxd4 Nf6 5.Nc3 Be7 6.Bf4 {Développement actif. Plan : Dd2 et grand roque.}`,
      },
      {
        name: 'Philidor : 3…Cf6 4.Cc3 Cbd7',
        pgn: `1.e4 e5 2.Nf3 d6 3.d4 Nf6
        4.Nc3 Nbd7 5.Bc4 {Le fou vise f7. Plan : O-O, Te1, a4.}`,
      },
      {
        name: 'Philidor : 3…Fg4?! (la partie de l’Opéra)',
        pgn: `1.e4 e5 2.Nf3 d6 3.d4
        Bg4?! 4.dxe5 {On attaque e5 et le fou cloue un cavalier qui n'est plus nécessaire.}
        Bxf3 5.Qxf3 dxe5 6.Bc4 {Double menace sur f7. [%cal Gf3f7,Gc4f7]}
        Nf6 7.Qb3 {Double attaque : f7 et b7. C'est le début de la célèbre partie Morphy (1858). [%cal Gb3f7,Gb3b7]}`,
      },
      {
        name: 'Petrov : 2…Cf6 3.Cxe5 d6 4.Cf3',
        pgn: `1.e4 e5 2.Nf3 Nf6
        3.Nxe5 {On prend le pion.}
        d6 4.Nf3 {On recule. Attention : 4.Cxf7 ? est un sacrifice douteux.}
        Nxe4 5.d4 d5 6.Bd3 {Position classique : développement rapide.}`,
      },
      {
        name: 'Latvian : 2…f5?!',
        pgn: `1.e4 e5 2.Nf3 f5?!
        3.Nxe5 {On prend le pion central.}
        Qf6 4.d4 d6 5.Nc4 fxe4 6.Nc3 {Développement rapide : les Blancs ont un avantage clair selon le moteur.}`,
      },
      {
        name: 'Éléphant : 2…d5?!',
        pgn: `1.e4 e5 2.Nf3 d5?!
        3.exd5 e4 4.Qe2 {On attaque e4 et on cloue le pion.}
        Nf6 5.d3 {On récupère e4 avec un pion de plus.}`,
      },
      {
        name: '2…Fc5?! : le pion e5 est gratuit',
        pgn: `1.e4 e5 2.Nf3 Bc5?!
        3.Nxe5 {Le pion e5 n'était pas défendu.}
        Nc6 4.Nxc6 dxc6 5.c3 {Un pion de plus. Si …Dh4, réponds De2 ou Df3.}`,
      },
    ],
    alts: {
      'e4 e5 Nf3 Nf6 Nxe5 d6': {
        Nxf7: ['inacc', "4.Cxf7 ?! (gambit Cochrane) donne une pièce pour deux pions et une attaque. Jouable en blitz, mais le moteur le juge mauvais."],
        Nc4: ['inacc', '4.Cc4 est jouable aussi. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
        Nd3: ['inacc', '4.Cd3 est jouable mais bloque le pion d. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
      },
      'e4 e5 Nf3 d6': {
        Bc4: ['alt', '3.Fc4 est jouable, mais 3.d4 prend le centre tout de suite.'],
      },
    },
    qa: {},
  },

  {
    id: 'w-sicilienne-alapin',
    side: 'w',
    group: 'Blancs contre les autres défenses',
    title: 'Sicilienne : variante Alapin (2.c3)',
    eco: 'B22',
    summary:
      "Contre 1…c5, on évite la Sicilienne ouverte (énorme théorie) avec 2.c3 : on prépare d4 pour reprendre avec le pion c et garder un centre e4-d4. Une seule idée contre toutes les suites noires.",
    plan: ['2.c3 puis d4.', 'Après …cxd4 cxd4 : centre de pions et développement rapide.', 'Pion isolé d4 possible : l’utiliser pour l’attaque (cases e5, c5).'],
    squares: 'd4, e5, d5.',
    pieces: 'Cavaliers f3/c3, fou d3 ou e2.',
    transition: 'Positions avec pion d isolé : attaque sur l’aile roi, Ce5, Fd3, Df3/Dd3.',
    abandon: 'Si les Noirs jouent …d6 et …g6, construis simplement un centre e4-d4 et développe.',
    lines: [
      {
        name: '2…d5 3.exd5 Dxd5 4.d4 Cf6 5.Cf3 e6',
        pgn: `1.e4 c5 2.c3 {Prépare d4.}
        d5 3.exd5 Qxd5 4.d4 {La dame noire est centralisée, mais elle sera chassée par Cc3.}
        Nf6 5.Nf3 e6 6.Be2 {Développement simple.}
        cxd4 7.cxd4 Nc6 8.Nc3 {Gain de temps sur la dame.}
        Qd6 9.O-O Be7 10.Re1 {Pion d4 isolé mais actif. Plan : Fd3, a3, Fg5/Ce5.}`,
      },
      {
        name: '5…Fg4 (dame active)',
        pgn: `1.e4 c5 2.c3 d5 3.exd5 Qxd5 4.d4 Nf6 5.Nf3
        Bg4 6.Be2 e6 7.h3 Bh5 8.O-O Nc6 9.Be3 cxd4 10.cxd4 Be7 11.Nc3 {Même structure : pion isolé d4, développement complet.}`,
      },
      {
        name: '2…Cf6 3.e5 Cd5 4.d4 cxd4 5.Cf3',
        pgn: `1.e4 c5 2.c3 Nf6
        3.e5 {On chasse le cavalier.}
        Nd5 4.d4 cxd4 5.Nf3 Nc6 6.Bc4 {Le fou attaque d5.}
        Nb6 7.Bb3 d5 8.exd6 Qxd6 9.O-O {Développement rapide ; pions d4 et c3 seront échangés.}`,
      },
      {
        name: '2…Cf6 … 4…cxd4 5.Cf3 e6',
        pgn: `1.e4 c5 2.c3 Nf6 3.e5 Nd5 4.d4 cxd4 5.Nf3
        e6 6.cxd4 d6 7.Bc4 {Le fou attaque le cavalier d5 ; plan O-O, De2, Cc3.}`,
      },
      {
        name: '2…Cc6 3.d4 d5',
        pgn: `1.e4 c5 2.c3 Nc6 3.d4 d5 4.exd5 Qxd5 5.Nf3 {Développement ; …cxd4 cxd4 donnera la même structure.}`,
      },
      {
        name: '2…e6 3.d4 d5 4.e5 : transposition Française !',
        pgn: `1.e4 c5 2.c3 e6 3.d4 d5
        4.e5 {On arrive dans la Française avance : tu joueras exactement la même chose que contre 1…e6.}
        Nc6 5.Nf3 Qb6 6.a3 {Position de la Française avance.}`,
      },
      {
        name: '2…d6 et 2…g6',
        pgn: `1.e4 c5 2.c3 d6 3.d4 Nf6 4.Bd3 {On protège e4 et on garde le centre.}`,
      },
      {
        name: '2…g6 3.d4 cxd4 4.cxd4 d5 5.e5',
        pgn: `1.e4 c5 2.c3 g6 3.d4 cxd4 4.cxd4 d5
        5.e5 {On ferme le centre : le fou g7 noir mord sur un pion solide. Plan : Cc3, Cf3, Fe2/Fb5.}`,
      },
      {
        name: '2…e5 3.Cf3 Cc6 4.Fc4',
        pgn: `1.e4 c5 2.c3 e5 3.Nf3 Nc6 4.Bc4 {Comme une Italienne : le pion c5 noir laisse d5 faible.}`,
      },
    ],
    alts: {
      'e4 c5': {
        Nf3: ['alt', "2.Cf3 (vers la Sicilienne ouverte) est le coup le plus joué, mais il demande d'apprendre la Najdorf, la Dragon, la Sveshnikov… On choisit 2.c3."],
        Nc3: ['alt', '2.Cc3 (fermée/Grand Prix) est jouable.'],
        d4: ['alt', '2.d4 (Smith-Morra après 2…cxd4 3.c3) est un gambit jouable.'],
      },
      'e4 c5 c3 d5 exd5 Qxd5': {
        Nf3: ['alt', '4.Cf3 est bon aussi, mais 4.d4 prend le centre tout de suite.'],
      },
    },
    qa: {
      'e4 c5 c3': {
        why: 'c3 prépare d4 : si …cxd4, on reprend cxd4 et on garde deux pions au centre.',
        notOther: '2.Cf3 + 3.d4 mène à une théorie gigantesque. 2.c3 te donne un seul plan contre tout.',
        weak: 'Le cavalier b1 ne peut plus aller en c3 tout de suite.',
      },
    },
  },

  {
    id: 'w-francaise-avance',
    side: 'w',
    group: 'Blancs contre les autres défenses',
    title: 'Française : variante d’avance (3.e5)',
    eco: 'C02',
    summary:
      "Contre 1…e6 2.d4 d5, on pousse 3.e5 : on gagne de l'espace et on coupe le roi noir de ses défenseurs. Les Noirs attaquent la base d4 (…c5, …Cc6, …Db6) : ton travail est de la tenir.",
    plan: ['Soutenir d4 : c3, Cf3, a3 + b4 ou Fe2 + O-O.', 'Ne pas laisser les Noirs gagner d4.', 'Attaque à l’aile roi plus tard grâce à e5.'],
    squares: 'd4 (base), e5 (pointe), f6.',
    pieces: 'Fou c1 bloqué par la chaîne noire : il sert souvent en b2 ou e3.',
    transition: 'Les Noirs jouent à l’aile dame, toi à l’aile roi et au centre.',
    abandon: 'Si les Noirs détruisent d4, bascule sur un jeu de pièces actif.',
    lines: [
      {
        name: '3…c5 4.c3 Cc6 5.Cf3 Db6 6.a3',
        pgn: `1.e4 e6 2.d4 d5
        3.e5 {On gagne de l'espace.}
        c5 4.c3 {Soutien de d4.}
        Nc6 5.Nf3 Qb6 {Trois attaques sur d4 ; et b2 est visé.}
        6.a3 {Prépare b4 pour gagner de l'espace à l'aile dame.}
        c4 7.Nbd2 Na5 8.Rb1 {Défend b2 et prépare b3. Plan : Fe2, O-O, puis b3 ou h4.}
        Bd7 9.Be2 {Développement ; le moteur juge la position légèrement favorable aux Blancs.}`,
      },
      {
        name: '6…Fd7 7.b4',
        pgn: `1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6 6.a3
        Bd7 7.b4 cxd4 8.cxd4 Rc8 9.Bb2 {d4 tient grâce au fou b2.}`,
      },
      {
        name: '6…Ch6 7.b4',
        pgn: `1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6 6.a3
        Nh6 7.b4 cxd4 8.cxd4 Nf5 9.Bb2 {Même idée : b2 soutient d4.}`,
      },
      {
        name: '6…cxd4 7.cxd4 Cxd4?? (piège)',
        pgn: `1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6 6.a3
        cxd4 7.cxd4 Nxd4?? 8.Qxd4 {Le cavalier n'était défendu que par la dame b6 : après 8…Dxd4 9.Cxd4, les Noirs ont perdu une pièce.}
        Qxd4 9.Nxd4 {Une pièce de plus.}`,
      },
      {
        name: '5…Fd7 6.Fe2',
        pgn: `1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3
        Bd7 6.Be2 Nge7 7.O-O {Développement ; les Noirs vont attaquer d4 avec …Cf5.}`,
      },
      {
        name: '4…Db6 5.Cf3 Fd7 6.Fe2',
        pgn: `1.e4 e6 2.d4 d5 3.e5 c5 4.c3
        Qb6 5.Nf3 Bd7 6.Be2 {Le fou défend la diagonale et prépare O-O.}`,
      },
      {
        name: '3…b6',
        pgn: `1.e4 e6 2.d4 d5 3.e5 b6 4.c3 {Les Noirs veulent échanger leur mauvais fou par …Fa6. Plan simple : Cf3, Fxa6 ou h4 pour l’espace.}`,
      },
      {
        name: '2…c5 3.d5',
        pgn: `1.e4 e6 2.d4 c5 3.d5 {On gagne de l'espace ; les Noirs n'ont pas de Benoni confortable.}`,
      },
    ],
    alts: {
      'e4 e6': {
        d3: ['inacc', '2.d3 (Attaque est-indienne) est jouable mais passif. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
        Nf3: ['alt', '2.Cf3 est jouable ; 2.d4 prend le centre.'],
      },
      'e4 e6 d4 d5': {
        Nc3: ['alt', "3.Cc3 est le coup le plus ambitieux, mais il demande de connaître la Winawer (…Fb4) et la Classique (…Cf6). 3.e5 est plus simple."],
        Nd2: ['alt', '3.Cd2 (Tarrasch) est un excellent choix aussi.'],
        exd5: ['alt', '3.exd5 (Échange) est solide mais symétrique.'],
      },
      'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6': {
        Bd3: ['inacc', "6.Fd3 est jouable mais c'est un gambit : après 6…cxd4 7.cxd4 Fd7, le pion d4 est difficile à garder. 6.a3 est plus simple."],
        Be2: ['alt', '6.Fe2 est un bon coup aussi (idée O-O, pion d4 sous pression).'],
      },
    },
    qa: {
      'e4 e6 d4 d5 e5': {
        why: 'e5 gagne de l’espace et enlève la case f6 au cavalier noir.',
        weak: 'La base de ta chaîne (d4) devient la cible : …c5, …Cc6, …Db6.',
        oppPlan: 'Les Noirs vont attaquer d4 et éventuellement e5 avec …f6.',
      },
    },
  },

  {
    id: 'w-caro-avance',
    side: 'w',
    group: 'Blancs contre les autres défenses',
    title: 'Caro-Kann : variante d’avance, système court',
    eco: 'B12',
    summary:
      "Même idée que contre la Française : 3.e5 pour l'espace. Avec le « système court » (Cf3, Fe2, O-O), on se développe sans risque et on garde un petit avantage d'espace.",
    plan: ['3.e5, Cf3, Fe2, O-O.', 'c3 ou c4 selon les cas.', 'Contre …c5 : Fe3 et c4.'],
    squares: 'e5, d4.',
    pieces: 'Cavaliers f3 et d2-b3.',
    transition: 'Avantage d’espace, jeu calme.',
    abandon: 'Si les Noirs ouvrent le centre (…c5), joue activement (Fe3, c4).',
    lines: [
      {
        name: '3…Ff5 4.Cf3 e6 5.Fe2 Cd7 6.O-O',
        pgn: `1.e4 c6 2.d4 d5
        3.e5 {Espace.}
        Bf5 4.Nf3 e6 5.Be2 {Le système court.}
        Nd7 6.O-O Ne7 7.Nbd2 {Plan : Cb3, c3, Ce1-d3.}`,
      },
      {
        name: '5…c5 6.Fe3',
        pgn: `1.e4 c6 2.d4 d5 3.e5 Bf5 4.Nf3 e6 5.Be2
        c5 6.Be3 {Soutient d4.}
        cxd4 7.Nxd4 Ne7 8.c4 {On attaque d5 ; jeu actif.}`,
      },
      {
        name: '5…Ce7 6.O-O',
        pgn: `1.e4 c6 2.d4 d5 3.e5 Bf5 4.Nf3 e6 5.Be2
        Ne7 6.O-O {Puis Cbd2, c3 ou Ch4.}`,
      },
      {
        name: '3…c5 4.dxc5 e6 5.Fe3',
        pgn: `1.e4 c6 2.d4 d5 3.e5
        c5 4.dxc5 {On prend : le pion c5 sera défendu par le fou.}
        e6 5.Be3 {Plan : Cf3, Fd3, c3.}`,
      },
      {
        name: '2…g6 3.Cc3',
        pgn: `1.e4 c6 2.d4 g6 3.Nc3 d5 4.h3 {On empêche …Fg4 ; plan Cf3, Fd3 / Fe3.}`,
      },
    ],
    alts: {
      'e4 c6 d4 d5': {
        Nc3: ['alt', '3.Cc3 (classique) est excellent mais demande plus de théorie.'],
        exd5: ['alt', '3.exd5 (Échange) est solide.'],
        Nd2: ['alt', '3.Cd2 est bon et transpose souvent avec 3.Cc3.'],
      },
    },
    qa: {},
  },

  {
    id: 'w-scandinave',
    side: 'w',
    group: 'Blancs contre les autres défenses',
    title: 'Scandinave : 2.exd5 et 3.Cc3',
    eco: 'B01',
    summary:
      "La dame noire sort tôt : on la chasse avec gain de temps (Cc3), on prend le centre (d4) et on se développe. Attention au coup tactique Cd5 ! dans certaines positions.",
    plan: ['2.exd5, 3.Cc3 avec gain de temps.', 'd4, Cf3, Fc4, O-O.', 'Fd2 pour préparer Cd5 contre la dame a5.'],
    squares: 'd5 (case tactique), d4.',
    pieces: 'Cavalier c3, fou d2.',
    transition: 'Avance de développement et espace.',
    abandon: 'Si la dame noire va en d6/d8, oublie Cd5 : développe normalement.',
    lines: [
      {
        name: '3…Da5 4.d4 Cf6 5.Cf3 c6 6.Fc4 Ff5 7.Fd2 e6 8.Cd5 !',
        pgn: `1.e4 d5 2.exd5 Qxd5
        3.Nc3 {Gain de temps sur la dame.}
        Qa5 4.d4 Nf6 5.Nf3 c6 6.Bc4 Bf5 7.Bd2 {Le fou d2 regarde la dame a5 à travers le cavalier c3. [%cal Gd2a5]}
        e6 8.Nd5! {Attaque à la découverte : la dame a5 est attaquée par le fou d2, et le cavalier menace Cxf6+. La seule bonne réponse est …Dd8. [%cal Rd2a5,Gd5f6]}
        Qd8 9.Nxf6+ Qxf6 {Les Blancs ont la paire de fous et un développement facile.}`,
      },
      {
        name: '3…Dd6',
        pgn: `1.e4 d5 2.exd5 Qxd5 3.Nc3
        Qd6 4.d4 Nf6 5.Nf3 a6 6.g3 {Le fou ira en g2 ; la dame d6 sera gênée par Ff4 plus tard. Le moteur aime ce plan.}`,
      },
      {
        name: '3…Dd6 … 5…Fg4?! 6.h3',
        pgn: `1.e4 d5 2.exd5 Qxd5 3.Nc3 Qd6 4.d4 Nf6 5.Nf3
        Bg4?! 6.h3 Bh5 7.g4 Bg6 8.Ne5 {Le cavalier menace Cxg6 et Cc4/Fb5+. Les Blancs ont un avantage net.}`,
      },
      {
        name: '3…Dd8',
        pgn: `1.e4 d5 2.exd5 Qxd5 3.Nc3 Qd8 4.d4 Nf6 5.Nf3 {Développement : Fc4, O-O, Te1.}`,
      },
      {
        name: '2…Cf6 3.d4',
        pgn: `1.e4 d5 2.exd5 Nf6
        3.d4 Nxd5 4.Nf3 {Développement ; plan c4, Cc3, Fe2.}
        Bg4 5.Be2 e6 6.O-O Nc6 7.c4 Nb6 8.Nc3 {Centre fort.}`,
      },
      {
        name: '2…Cf6 3.d4 Fg4 (portugaise)',
        pgn: `1.e4 d5 2.exd5 Nf6 3.d4
        Bg4 4.Be2 {On échange le fou ; le pion d5 reste un temps.}
        Bxe2 5.Qxe2 Qxd5 6.Nf3 {Développement simple.}`,
      },
    ],
    alts: {
      'e4 d5': {
        e5: ['inacc', '2.e5 est jouable (structure type Caro-Kann avance), mais 2.exd5 gagne du temps sur la dame. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
        Nc3: ['inacc', "2.Cc3 permet aux Noirs d'obtenir un jeu confortable selon le moteur. 2.exd5 est le coup principal."],
      },
      'e4 d5 exd5 Qxd5': {
        Nf3: ['alt', '3.Cf3 est bon aussi ; 3.Cc3 gagne du temps sur la dame.'],
      },
      'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4 Bf5 Bd2 e6': {
        Qe2: ['alt', '8.De2 est jouable aussi, mais 8.Cd5 ! force la dame à reculer.'],
        'O-O': ['inacc', '8.O-O est jouable. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
      },
    },
    qa: {
      'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4 Bf5 Bd2 e6 Nd5': {
        why: 'Le cavalier découvre l’attaque du fou d2 sur la dame a5, tout en menaçant Cxf6+.',
        capture: 'Si …cxd5 ?? 9.Fxa5 et les Blancs gagnent la dame. Si …Dxd2+ 9.Dxd2 cxd5 : les Blancs ont gagné du matériel (dame contre fou + cavalier).',
        threat: 'Fxa5 (la dame) et Cxf6+.',
      },
    },
  },

  {
    id: 'w-alekhine',
    side: 'w',
    group: 'Blancs contre les autres défenses',
    title: 'Alekhine : variante moderne (4.Cf3)',
    eco: 'B04–B05',
    summary:
      "Les Noirs provoquent l’avance de tes pions pour les attaquer. Avec la variante moderne (2.e5, 3.d4, 4.Cf3), tu gardes un centre solide et un développement simple.",
    plan: ['2.e5, 3.d4, 4.Cf3, Fe2, O-O, c4.', 'Garder e5 soutenu.', 'Punir …Cd7 ? par Cxf7 !'],
    squares: 'e5, d4, f7.',
    pieces: 'Cavalier f3/e5.',
    transition: 'Avantage d’espace.',
    abandon: 'Si le centre est sur-étendu, échange en e5 et joue les pièces.',
    lines: [
      {
        name: '4…Fg4 5.Fe2 e6 6.O-O Fe7 7.c4 Cb6',
        pgn: `1.e4 Nf6 2.e5 {On chasse le cavalier.}
        Nd5 3.d4 d6 4.Nf3 {La variante moderne : solide.}
        Bg4 5.Be2 e6 6.O-O Be7 7.c4 Nb6 8.h3 Bh5 9.Nc3 O-O 10.Be3 d5 11.c5 {Gain d'espace à l'aile dame.}
        Bxf3 12.Bxf3 Nc4 13.Bf4 {Le moteur préfère garder le fou (13.b3 Cxe3 14.fxe3 est l'autre option, moins précise). Plan : b3 pour chasser le cavalier, puis b4-b5.}`,
      },
      {
        name: '4…g6 5.Fc4',
        pgn: `1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3
        g6 5.Bc4 Nb6 6.Bb3 Bg7 7.a4 {On menace a5 qui chasse encore le cavalier.}`,
      },
      {
        name: '4…dxe5 5.Cxe5',
        pgn: `1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3
        dxe5 5.Nxe5 {Le cavalier e5 est fort.}
        g6 6.Bc4 c6 7.O-O {Développement ; attention à f7.}`,
      },
      {
        name: '5…Cd7?! 6.Cxf7 !',
        pgn: `1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 dxe5 5.Nxe5
        Nd7?! 6.Nxf7! {Sacrifice correct : le roi noir est attiré au centre.}
        Kxf7 7.Qh5+ Ke6 8.c4 {On chasse le cavalier d5 qui protège le roi. (8.g3 suivi de Fh3+ est l'autre idée.) Le moteur donne un net avantage aux Blancs.}`,
      },
      {
        name: '2…Cg8 et 2…Ce4',
        pgn: `1.e4 Nf6 2.e5 Ng8 3.d4 {Simple : centre et développement.}`,
      },
    ],
    alts: {
      'e4 Nf6': {
        Nc3: ['inacc', '2.Cc3 est jouable mais permet …e5 ou …d5 tranquillement. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
        d3: ['inacc', '2.d3 est jouable mais passif. Selon le moteur, il est un peu moins précis que le coup du répertoire.'],
      },
      'e4 Nf6 e5 Nd5': {
        c4: ['alt', '3.c4 est jouable (vers les quatre pions), mais plus risqué.'],
      },
    },
    qa: {},
  },

  {
    id: 'w-pirc-150',
    side: 'w',
    group: 'Blancs contre les autres défenses',
    title: 'Pirc / Moderne : attaque 150',
    eco: 'B07',
    summary:
      "Tu connais déjà cette structure côté noir ! Avec les Blancs : Fe3, Dd2, f3, Fh6 pour échanger le fou g7, grand roque et h4-h5. Un plan simple et dangereux.",
    plan: ['Fe3, Dd2, f3.', 'Fh6 pour échanger le fou g7.', 'O-O-O et h4-h5.'],
    squares: 'h6, h5, g7.',
    pieces: 'Fou e3 (pour l’échange en h6), dame d2.',
    transition: 'Attaque sur le roi noir.',
    abandon: 'Si le roi noir reste au centre, ne précipite pas h4-h5 : développe d’abord.',
    lines: [
      {
        name: '1…d6 2.d4 Cf6 3.Cc3 g6 4.Fe3 Fg7 5.Dd2 O-O 6.O-O-O',
        pgn: `1.e4 d6 2.d4 Nf6 3.Nc3 g6
        4.Be3 Bg7 5.Qd2 {Prépare Fh6.}
        O-O 6.O-O-O {Grand roque : on lancera h4-h5.}
        c6 7.f3 {Protège e4 et prépare g4/h4.}`,
      },
      {
        name: '5…c6 6.f3 b5 7.Cge2',
        pgn: `1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Be3 Bg7 5.Qd2
        c6 6.f3 b5 7.Nge2 {Le cavalier va en c1-b3 ou g3 ; Fh6 suivra.}`,
      },
      {
        name: '1…g6 : même plan',
        pgn: `1.e4 g6 2.d4 Bg7 3.Nc3 d6
        4.Be3 Nf6 5.Qd2 {Transposition vers la même idée.}`,
      },
      {
        name: '3…e5 (Philidor)',
        pgn: `1.e4 d6 2.d4 Nf6 3.Nc3 e5 4.Nf3 {On est dans une Philidor : développement Fe2 / Fc4, O-O.}`,
      },
    ],
    alts: {
      'e4 d6': {
        Nc3: ['alt', '2.Cc3 est bon aussi.'],
      },
    },
    qa: {},
  },

  {
    id: 'w-rares',
    side: 'w',
    group: 'Blancs contre les autres défenses',
    title: 'Premiers coups rares (1…Cc6, 1…b6, 1…a6…)',
    eco: 'B00',
    summary: "Contre les coups rares : prendre le centre avec 2.d4, se développer, roquer. Pas besoin de théorie.",
    plan: ['2.d4 et le centre.', 'Développement naturel.'],
    squares: 'e4, d4.',
    pieces: 'Toutes : développe !',
    transition: 'Avantage d’espace.',
    abandon: '—',
    lines: [
      { name: '1…Cc6 2.d4 d5 3.e5', pgn: `1.e4 Nc6 2.d4 d5 3.e5 {Comme une Française avance où le cavalier bloque le pion c.} Bf5 4.Nf3 e6 5.c3` },
      { name: '1…b6 2.d4 Fb7 3.Fd3', pgn: `1.e4 b6 2.d4 Bb7 3.Bd3 {Le fou défend e4.} e6 4.Nf3 c5 5.c3` },
      { name: '1…a6 2.d4', pgn: `1.e4 a6 2.d4 {Centre.}` },
    ],
    alts: {},
    qa: {},
  },
];
