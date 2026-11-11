// Réglages : change le jeu ici !
//
// Ce fichier s'exécute avant tous les autres fichiers du jeu qui en dépendent. Dans pxt.json, seuls les textes
// (textes.ts) et les menus (menus.ts) passent avant lui.
//
// Tu peux modifier chaque nombre ici et essayer le jeu tout de suite dans le simulateur.
//
// Le nom du jeu sur deux lignes, séparées par « | ». Il s'affiche en grand sur la carte du titre de l'intro et sur le
// panneau en bois de l'image du titre, chaque ligne au milieu.
namespace Jeu {
    export const TITRE = "GROTTE|ROYALE"   // Titre en lettres, « | » sépare les deux lignes
    export const LIGNES_TITRE = TITRE.split("|")
}
// Interrupteurs pour chercher les problèmes sur la vraie console.
//
// DIAGNOSTIC montre des carrés de couleur au démarrage. Chaque étape du démarrage a sa couleur et reste un instant à
// l'écran. Si le jeu s'arrête, l'image se fige sur la dernière couleur atteinte, et on voit exactement jusqu'où le
// démarrage est allé. Sur le GameKit, c'est nécessaire, car un plantage n'y montre ni code d'erreur ni smiley triste,
// seulement du noir.
//
// Avec OBSCURITE = false, l'image avec le cercle de lumière est laissée de côté (voir lumiere.ts). Elle est accrochée
// devant la caméra, aussi grande que tout l'écran, et prend environ 9,6 Ko. Cela aide beaucoup quand
// l'écran reste noir.
let DIAGNOSTIC = false
let OBSCURITE = true
// JOUER_INTRO active ou coupe toute l'intro : l'histoire, la carte « Calliope Hacker présente » avec la carte du titre,
// et les panneaux du tutoriel. Quand tu veux essayer le jeu lui-même, cela fait gagner environ une minute à chaque
// démarrage. Pour chercher un problème au démarrage, le mieux est d'activer aussi DIAGNOSTIC.
let JOUER_INTRO = true

let VIES_DEPART = 6
let VITESSE_HEROS = 95
let VITESSE_BOTTES = 25
// Limite maximale des améliorations de bottes. Sans elle, les bottes des coffres s'empileraient sans fin, et le héros
// finirait par devenir impossible à diriger.
let VITESSE_HEROS_MAX = 170
// À partir de ce palier, les ennemis n'accélèrent plus. La limite est choisie pour que même l'ennemi le plus rapide (la
// chauve-souris avec 34 + 2 × palier = 74) reste en dessous de la vitesse de base du héros, 95 : on doit toujours
// pouvoir s'enfuir. Comme un palier dure NIVEAUX_PAR_PALIER niveaux, la limite n'est atteinte qu'au niveau 39. Les
// niveaux plus profonds deviennent plus durs par plus d'ennemis et plus de pièges, pas par plus de vitesse.
let PALIER_MAX = 20
// Combien de niveaux dure un palier d'ennemis. Avec 2, la difficulté monte moitié moins vite que si chaque niveau
// apportait un nouveau palier.
let NIVEAUX_PAR_PALIER = 2

// Le niveau où une sorte d'ennemi apparaît pour la première fois. La chauve-souris, le mage et le garde sont bien
// espacés pour que la difficulté ne fasse pas de saut. Les panneaux du tutoriel dans l'intro lisent aussi ces valeurs :
// le tutoriel et le jeu ne peuvent donc jamais se contredire.
let NIVEAU_CHAUVE_SOURIS = 4
let NIVEAU_MAGE = 7
let NIVEAU_GARDE = 10

// Deuxième et troisième ennemi dans la même salle. À partir du niveau indiqué ici, la chance commence à un dixième et
// grandit d'un dixième de plus à chaque niveau, jusqu'au maximum de chaque cas (en dixièmes).
let DEUXIEME_ENNEMI_DES = 4
let DEUXIEME_ENNEMI_MAX = 6
let TROISIEME_ENNEMI_DES = 12
let TROISIEME_ENNEMI_MAX = 4
// Frein d'urgence pour la mémoire et la fluidité : il n'y a jamais plus de ENNEMIS_MAX ennemis sur un niveau.
let ENNEMIS_MAX = 18

// Pièges : tous les NIVEAUX_PAR_PIEGE niveaux, un piège de plus s'ajoute (au plus PIEGES_MAX).
let NIVEAUX_PAR_PIEGE = 2
let PIEGES_MAX = 10

// Boss : vie = VIE_BOSS_BASE + niveau, mais au plus VIE_BOSS_MAX. Ainsi, le combat ne traîne pas sans fin dans
// les niveaux profonds.
let VIE_BOSS_BASE = 14
let VIE_BOSS_MAX = 40
// Le boss s'énerve quand il ne lui reste que cette part de sa vie (3 veut dire : le dernier tiers).
let PART_COLERE_BOSS = 3

// Un équilibre pour la profondeur : tous les NIVEAUX_PAR_COEUR niveaux, une salle a un cœur à la place d'une pièce un
// dixième plus souvent, au plus COEURS_BONUS_MAX dixièmes de plus.
let NIVEAUX_PAR_COEUR = 5
let COEURS_BONUS_MAX = 2

// Le boss final attend à ce niveau : le voleur de la couronne, la couronne volée sur la tête et en pleine forme. Celui
// qui le bat gagne la partie : le héros prend la couronne et s'enfuit (fin.ts). construireNiveau place toujours le boss
// à ce niveau, même s'il n'est pas un multiple de NIVEAUX_PAR_BOSS.
let NIVEAU_BOSS_FINAL = 15
let VITESSE_BOULE = 135
let RECHARGE_NORMALE_MS = 420
let RECHARGE_RAPIDE_MS = 190
let PROTECTION_MS = 2000
let GRILLE_L = 26
let GRILLE_H = 22
let LUMIERE_NORMALE = 46
let LUMIERE_TORCHE = 80
let TORCHE_DUREE_MS = 12000
let NIVEAUX_PAR_BOSS = 5
// Combien de temps (en ms) un ennemi vaincu disparaît dans des étoiles.
let NUAGE_MS = 450
