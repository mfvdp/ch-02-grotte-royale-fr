# Grotte royale

Salut ! Voici **Grotte royale**, un jeu de **Calliope Hacker** pour le **Calliope mini 3 avec le GameKit**.

Un voleur a pris la couronne du château et se cache avec elle tout au fond du donjon. Toi, tu descends comme un héros,
niveau après niveau. Chaque niveau est construit à nouveau, au hasard, à chaque partie. Dans le noir, tu ne vois qu'un
petit cercle autour de toi. Trouve la clé, cherche l'escalier et fais disparaître les ennemis avec ta boule de feu. Tous
les 5 niveaux, un boss attend, et au niveau 15, le voleur de la couronne. Bats-le et rapporte la couronne ! Au fait, au
niveau 1, un petit tableau du Calliope Hacker est accroché au mur.

## Comment jouer

- **Croix directionnelle :** marcher et viser (le héros regarde du côté où il marche)
- **A :** boule de feu (garde le bouton enfoncé pour continuer à tirer)
- **Tenir B :** regarder la carte du niveau
- **Menu :** pause, et là tu peux aussi couper ou remettre le son
- **Ramasser les coffres et les torches :** tir triple, tir rapide, bottes rapides, un cœur en plus, ou plus de lumière

## À toi de construire

Tout le code source est dans ce fichier de jeu. Ouvre-le dans MakeCode Arcade (arcade.makecode.com, « Importer »). Tous
les nombres avec lesquels tu peux jouer sont dans `reglages.ts`. Change un nombre, lance le simulateur et regarde ce qui
se passe :

- **Plus de vies :** tu y trouves `VIES_DEPART = 6`. Avec `20`, tu commences avec beaucoup plus de cœurs.
- **Un plus grand cercle de lumière :** tu y trouves `LUMIERE_NORMALE = 46`. Avec `90`, tu vois bien
  plus loin dans l'obscurité.
- **Tirer plus vite :** tu y trouves `RECHARGE_NORMALE_MS = 420`, le temps d'attente entre deux
  tirs en millisecondes. Avec `100`, tu tires presque sans pause.

Une explication du code source pour les enfants, les parents et les enseignants se trouve sur calliope-hacker.de.
