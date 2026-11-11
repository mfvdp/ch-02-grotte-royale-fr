# Côté technique : Grotte royale

Ce fichier explique en bref comment le code source est organisé et comment le construire. L'accueil et les premières
idées pour changer le jeu sont dans `README.md`.

## Organisation

C'est un projet pour MakeCode Arcade, écrit en TypeScript. `pxt.json` donne le nom du projet `grotte-royale` et liste
tous les fichiers dans l'ordre où MakeCode les lit et les exécute. `mkc.json` dit pour quel appareil construire : le
Calliope mini 3 avec le GameKit (variante « n3 »). Les fichiers `tilemap.g.ts` et `tilemap.g.jres` sont fabriqués par
l'éditeur ; ils sont simplement là et on ne les change pas à la main.

Les fichiers du jeu :

- `textes.ts` : tous les textes du jeu : chaque numéro de l'énumération IdTexte a exactement un texte dans la liste
  textes.
- `menus.ts` : menu de pause et écran de fin du jeu, avec les textes de textes.ts.
- `reglages.ts` : réglages : change le jeu ici !
- `graphismes.ts` : graphismes : toutes les tuiles, tous les sprites et toutes les images qu'on en fabrique.
- `sortes.ts` : sortes de sprites (SpriteKind) pour les objets, le décor et l'affichage.
- `ennemis.ts` : ennemis : la classe de données, leur création, la recherche, les tirs et la conduite du boss.
- `etat.ts` : état global du jeu.
- `aides.ts` : petites fonctions d'aide, sans état propre.
- `son.ts` : son : tous les sons et toute la musique au même endroit.
- `cinema.ts` : cinéma : la boîte à outils de l'intro et de la fin.
- `intro.ts` : intro : l'histoire et la carte du studio avant l'image du titre.
- `tutoriel.ts` : panneaux du tutoriel : le tutoriel dans l'intro.
- `fin.ts` : fin : la victoire.
- `lumiere.ts` : obscurité et lumière : le cercle de vue autour du héros.
- `donjon.ts` : fabrication du donjon : grille, salles, couloirs, pièges et tilemap.
- `objets.ts` : objets et décor : les placer et les ranger quand le niveau change.
- `heros.ts` : le héros : tirer des boules de feu, choisir l'image selon la direction du regard et encaisser les coups.
- `ecran-titre.ts` : L'image du titre et ses éléments : mur de pierre, torches, image du titre et écran du titre.
- `niveau.ts` : construction d'un niveau entier.
- `evenements.ts` : tous les gestionnaires d'événements.
- `affichage.ts` : affichage : le numéro du niveau en bas à gauche et la carte sur le bouton B.
- `main.ts` : un jeu de donjon au hasard pour MakeCode Arcade.
- `tilemap.g.ts` : code fabriqué par l'éditeur.

## Comment le jeu se déroule

1. `Catalogue.initialiser` dans `textes.ts` regarde si ce démarrage est un nouveau départ après la fin de la partie, et
   installe les menus.
2. `lancerEcranTitre` dans `ecran-titre.ts` joue l'intro : l'histoire, la carte « Calliope Hacker présente », la carte
   du titre et les panneaux du tutoriel. Tu peux sauter chaque station avec A. Ensuite, il montre l'image du titre et
   attend A.
3. `main.ts` fabrique le héros, l'image de l'obscurité et l'affichage, puis appelle `construireNiveau`.
4. `construireNiveau` dans `niveau.ts` construit un niveau : `creerSalles` et `creuserCouloir` (dans `donjon.ts`)
   creusent des salles et des couloirs dans la grille, on y marque l'escalier, puis `placerPieges` y marque les pièges,
   et `dessinerGrille` la transforme en tilemap. Ensuite viennent le décor, la clé (ou le boss), les ennemis et les
   objets.
5. À chaque image, la fonction de `game.onUpdate` dans `main.ts` s'exécute : la direction du regard du héros, le tir
   avec A, les nuages d'étoiles et la lumière. Toutes les 280 millisecondes, `game.onUpdateInterval` dans `main.ts`
   conduit les ennemis.
6. Les contacts (une boule de feu touche un ennemi, le héros ramasse quelque chose, le héros se tient sur l'escalier)
   sont traités par les gestionnaires de `evenements.ts`.
7. Quand le voleur de la couronne tombe, `Epilogue.jouer` dans `fin.ts` joue la fin.

La grille d'un niveau fait 26 tuiles de large et 22 tuiles de haut. Chaque tuile est un
nombre dans `grille` : 0 est un mur, 2 l'escalier, 3 un piège, tout le reste est du sol. La difficulté du jeu se règle
dans `reglages.ts`.

## Son, graphismes et sauvegarde

- **Graphismes :** les images sont dans `graphismes.ts`. Les noms avec `IMAGE_` sont des sprites, ceux avec `TUILE_` des
  tuiles. Tout le reste est peint pendant le jeu avec des rectangles, des cercles et des lignes. Cela garde le fichier
  de jeu petit.
- **Son :** `son.ts` rassemble tous les sons et toute la musique. Un son est un court texte de notes (`new
  music.Melody("…")`).
- **Sauvegarde :** le meilleur score (`info.saveHighScore`) et le volume restent enregistrés sur l'appareil. Si tu y
  mets un autre programme, MakeCode efface la sauvegarde au prochain démarrage.

## Construire le jeu

- **Dans le navigateur :** ouvre arcade.makecode.com, choisis « Importer » et ouvre le fichier de jeu
  `grotte-royale.hex`. Tout le code source est dans le fichier de jeu. Le simulateur montre le jeu tout de suite.
- **Sur ton ordinateur :** avec l'outil en ligne de commande de MakeCode (le paquet npm `makecode`), lance `makecode
  build` dans ce dossier. Le fichier de jeu pour l'appareil se trouve ensuite dans `built/n3/binary.hex`.

## Sur l'appareil

Branche le Calliope mini 3 à ton ordinateur avec le câble USB. Il apparaît comme un disque. Glisse le fichier de jeu
(`.hex`) sur ce disque ; le jeu démarre alors tout seul. L'écran du GameKit fait 160 × 120 pixels et 16 couleurs.

Ce jeu existe aussi en allemand, en anglais et en espagnol. Les quatre versions sont construites à partir du même projet
source.
