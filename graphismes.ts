// Graphismes : toutes les tuiles, tous les sprites et toutes les images qu'on en fabrique.
//
// Couleurs dans le donjon (les lettres sont celles des images) :
//   f noir = contours, joints, profondeur
//   c violet foncé = ton de base du sol et de la roche
//   b gris-mauve = brique, métal, pierre dans la lumière
//   d beige clair = bord brillant, peau
//   4, 5, e = tons chauds (torche, or, bois)
//
// Économise : chaque nouvelle image prend de la place en mémoire flash. C'est pourquoi les variantes ne sont faites
// qu'au démarrage, avec clone() puis fillRect, drawLine et setPixel.
let TUILE_ESCALIER: Image = null
let TUILE_PIQUES: Image = null
let IMAGE_SQUELETTE: Image = null
let IMAGE_GELEE: Image = null
let IMAGE_CHAUVE_SOURIS: Image = null
let IMAGE_MAGE: Image = null
let IMAGE_GARDE: Image = null
// Les directions du regard du garde. Il bloque tout, sauf les coups reçus en plein dos (evenements.ts). Le bouclier
// doit donc montrer clairement l'avant, sinon personne ne peut voir où est son dos.
let IMAGE_GARDE_DROITE: Image = null
let IMAGE_GARDE_HAUT: Image = null
let IMAGE_GARDE_BAS: Image = null
let IMAGE_BOSS: Image = null
let IMAGE_COEUR: Image = null
let IMAGE_CLE: Image = null
let IMAGE_PIECE: Image = null
let IMAGE_BOULE_FEU: Image = null
let IMAGE_COFFRE: Image = null
let IMAGE_TORCHE: Image = null
let IMAGE_BOULE_MAGIQUE: Image = null
let DECOR_TONNEAU: Image = null
let DECOR_OS: Image = null
// Les directions du regard du héros. IMAGE_HEROS reste l'image standard.
let IMAGE_HEROS_BAS: Image = null
let IMAGE_HEROS_HAUT: Image = null
let IMAGE_HEROS_GAUCHE: Image = null
let IMAGE_HEROS_DROITE: Image = null


// Maçonnerie en rangs décalés : les joints sont à y = 0, 4, 8 et 12, et les joints du bout des rangs sont décalés d'une
// demi-brique. Ainsi, les tuiles se raccordent sans couture, même par-dessus le bord.
let TUILE_MUR = img`
    f f f f f f f f f f f f f f f f
    d b b b b b b f d b b b b b b f
    b b b c b b b f b b b b b b b f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b f d b b b b b b f d b b b
    b b b f b b b c b b b f b b b b
    c c c f c c c c c c c f c c c c
    f f f f f f f f f f f f f f f f
    d b b b b b b f d b b b b b b f
    b b b b b b b f b b b c b b b f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b f d b b b b b b f d b b b
    b c b f b b b b b b b f b b c b
    c c c f c c c c c c c f c c c c
    `
// Dalles de pierre usées : quatre dalles par tuile, et les joints continuent par-dessus le bord de la tuile.
let TUILE_SOL = img`
    b b c c c c c f b b b c c c c f
    c c c c c c c f c c c c c c c f
    c c c f c c c f c c c c c c c f
    c c c c c c c f c c c c f c c f
    c c c c c c c f c c c c c c c f
    c f c c c c c f c c c c c c c f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b c c c c f b b c c c c c f
    c c c c c c c f c c c c c c c f
    c c c c c f c f c c c f c c c f
    c c c c c c c f c c c c c c c f
    c c f c c c c f c c c c c c c f
    c c c c c c c f c c c c c f c f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    `
// Escalier : cinq marches qui paraissent profondes, étroites et sombres en haut, plus larges et plus claires vers
// l'avant. On voit tout de suite qu'il descend, et que ce n'est pas un simple motif à rayures.
TUILE_ESCALIER = img`
    f f f f f f f f f f f f f f f f
    f f f f f f b b b b f f f f f f
    f f f f f f c c c c f f f f f f
    f f f f f b b b b b b f f f f f
    f f f f f c c c c c c f f f f f
    f f f f f c c c c c c f f f f f
    f f f f b b b b b b b b f f f f
    f f f f c c c c c c c c f f f f
    f f f f c c c c c c c c f f f f
    f f f d d d d d d d d d d f f f
    f f f b b b b b b b b b b f f f
    f f f c c c c c c c c c c f f f
    f f d d d d d d d d d d d d f f
    f f b b b b b b b b b b b b f f
    f f c c c c c c c c c c c c f f
    f f f f f f f f f f f f f f f f
    `
// Le héros de face : casque doré, tunique bleue avec un écusson bleu clair. Les quatre directions ont le même contour
// (x de 2 à 13 et y de 0 à 15), donc la zone de contact ne change pas quand on change d'image.
let IMAGE_HEROS = img`
    . . . . . f f f f f f . . . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 d d d d d d 5 f . . .
    . . . f d d f d d f d d f . . .
    . . . f d d d d d d d d f . . .
    . . . . f d d e e d d f . . . .
    . . . f f f 8 8 8 8 f f f . . .
    . . f 8 8 8 8 9 9 8 8 8 8 f . .
    . . f d 8 8 9 9 9 9 8 8 d f . .
    . . f d 8 8 8 9 9 8 8 8 d f . .
    . . f 8 4 4 4 4 4 4 4 4 8 f . .
    . . f 8 8 8 8 f f 8 8 8 8 f . .
    . . . f 8 8 f . . f 8 8 f . . .
    . . . f e e f . . f e e f . . .
    . . . f f f . . . . f f f . . .
    `
// Le héros de dos : pas de visage, toute la tête est en cheveux, et le cou se voit en dessous.
IMAGE_HEROS_HAUT = img`
    . . . . . f f f f f f . . . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f f f d d d d f f f . . .
    . . f 8 8 8 8 8 8 8 8 8 8 f . .
    . . f d 8 8 8 8 8 8 8 8 d f . .
    . . f d 8 8 8 8 8 8 8 8 d f . .
    . . f 8 4 4 4 4 4 4 4 4 8 f . .
    . . f 8 8 8 8 f f 8 8 8 8 f . .
    . . . f 8 8 f . . f 8 8 f . . .
    . . . f e e f . . f e e f . . .
    . . . f f f . . . . f f f . . .
    `
// Le héros de profil, tourné vers la gauche. Pour la droite, l'image est retournée comme dans un miroir.
IMAGE_HEROS_GAUCHE = img`
    . . . . . f f f f f . . . . . .
    . . . . f 5 5 5 5 5 f . . . . .
    . . . f 5 5 5 5 5 5 5 f . . . .
    . . . f d d 5 5 5 5 5 f . . . .
    . . . f d f d 5 5 5 5 f . . . .
    . . . f d d d 5 5 5 5 f . . . .
    . . . . f d d d 5 5 f . . . . .
    . . . f f f 8 8 8 8 f f . . . .
    . . f 8 8 8 8 8 8 8 8 8 8 f . .
    . . f d 8 8 8 9 9 8 8 8 e f . .
    . . f d 8 8 8 9 8 8 8 8 e f . .
    . . . f 8 4 4 4 4 4 4 8 f . . .
    . . . f 8 8 8 8 8 8 8 8 f . . .
    . . . f 8 8 f f 8 8 f f . . . .
    . . . f e e f . f e e f . . . .
    . . . f f f . . . f f f . . . .
    `
// Quand il regarde vers le bas, le héros ressemble à l'image standard. C'est la même image : il n'en faut donc pas une
// deuxième en mémoire flash.
IMAGE_HEROS_BAS = IMAGE_HEROS
IMAGE_HEROS_DROITE = IMAGE_HEROS_GAUCHE.clone()
IMAGE_HEROS_DROITE.flipX()
// Squelette : orbites creuses, cage thoracique, bras en os fins.
IMAGE_SQUELETTE = img`
    . . . . . f f f f f f . . . . .
    . . . . f 1 1 1 1 1 1 f . . . .
    . . . f 1 1 1 1 1 1 1 1 f . . .
    . . . f 1 f f 1 1 f f 1 f . . .
    . . . f 1 f f 1 1 f f 1 f . . .
    . . . f 1 1 1 f f 1 1 1 f . . .
    . . . . f 1 f f f f 1 f . . . .
    . . . . . f 1 1 1 1 f . . . . .
    . . . f f f 1 1 1 1 f f f . . .
    . . f 1 f 1 f 1 1 f 1 f 1 f . .
    . . f 1 f 1 1 f f 1 1 f 1 f . .
    . . f 1 f 1 f 1 1 f 1 f 1 f . .
    . . f f f . f 1 1 f . f f f . .
    . . . . . f 1 f f 1 f . . . . .
    . . . . . f 1 f f 1 f . . . . .
    . . . . f f f . . f f f . . . .
    `
// Gelée : une boule ronde, un reflet en haut à gauche, une ombre froide en bas.
IMAGE_GELEE = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . f f f f f f . . . . .
    . . . f f 7 1 7 7 7 7 f f . . .
    . . f 7 7 1 7 7 7 7 7 7 7 f . .
    . f 7 7 7 7 f f 7 7 f f 7 7 f .
    . f 7 7 7 7 f 1 7 7 f 1 7 7 f .
    . f 7 7 7 7 f f 7 7 f f 7 7 f .
    . f 7 7 7 7 7 7 7 7 7 7 7 7 f .
    . f 7 7 7 f f f f f f 7 7 7 f .
    . f 7 7 7 7 7 7 7 7 7 7 7 7 f .
    . f 7 7 6 6 7 7 7 7 6 6 7 7 f .
    . f 6 6 6 6 6 6 6 6 6 6 6 6 f .
    . f f f f f f f f f f f f f f .
    . . . . . . . . . . . . . . . .
    `
// Cœur : un reflet clair en haut à gauche, pour qu'il se détache du sol sombre.
IMAGE_COEUR = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . f f f . . . . f f f . . .
    . . f 3 3 2 f f f f 2 2 2 f . .
    . f 2 1 1 2 2 2 2 2 2 2 2 2 f .
    . f 2 1 2 2 2 2 2 2 2 2 2 2 f .
    . f 2 2 2 2 2 2 2 2 2 2 2 2 f .
    . . f 2 2 2 2 2 2 2 2 2 2 f . .
    . . . f 2 2 2 2 2 2 2 2 f . . .
    . . . . f 2 2 2 2 2 2 f . . . .
    . . . . . f 2 2 2 2 f . . . . .
    . . . . . . f 2 2 f . . . . . .
    . . . . . . . f f . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// Clé : un panneton épais, une poignée ronde avec un trou, un reflet.
IMAGE_CLE = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . f f f f . . . . . . . .
    . . . f 1 5 5 5 f . . . . . . .
    . . f 5 5 f f 5 5 f . . . . . .
    . . f 5 f f f f 5 f f f f f . .
    . . f 5 5 f f 5 5 5 5 5 5 5 f .
    . . . f 5 5 5 5 f f 5 f 5 5 f .
    . . . . f f f f . . f f f f f .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// Pièce : bord doré, un anneau en relief, un éclat en haut à gauche.
IMAGE_PIECE = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . f f f f f f . . . . .
    . . . . f 5 1 5 5 5 5 f . . . .
    . . . f 5 1 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 4 4 4 5 5 f . . .
    . . . f 5 5 4 5 5 5 4 5 f . . .
    . . . f 5 5 4 5 5 5 4 5 f . . .
    . . . f 5 5 5 4 4 4 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . . . f f f f f f . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// La boule de feu du héros : cœur blanc, puis jaune, orange et un bord rouge.
IMAGE_BOULE_FEU = img`
    . . 2 4 4 2 . .
    . 2 4 5 5 4 2 .
    2 4 5 5 5 5 4 2
    2 4 5 1 1 5 4 2
    2 4 5 1 1 5 4 2
    2 4 5 5 5 5 4 2
    . 2 4 5 5 4 2 .
    . . 2 4 4 2 . .
    `
// Tuiles dérivées : plus de variété dans le sol et dans le mur.
//
// Variante 2 : des fissures sur deux dalles.
let TUILE_SOL_2 = TUILE_SOL.clone()
TUILE_SOL_2.drawLine(1, 3, 6, 5, 15)
TUILE_SOL_2.drawLine(6, 5, 5, 6, 15)
TUILE_SOL_2.drawLine(9, 10, 13, 13, 15)
TUILE_SOL_2.setPixel(11, 9, 11)
TUILE_SOL_2.setPixel(2, 10, 15)
// Variante 3 : du gravier sur la dalle en bas à droite, une fine fissure à gauche.
let TUILE_SOL_3 = TUILE_SOL.clone()
TUILE_SOL_3.setPixel(9, 10, 11)
TUILE_SOL_3.setPixel(11, 9, 11)
TUILE_SOL_3.setPixel(12, 12, 11)
TUILE_SOL_3.setPixel(10, 13, 11)
TUILE_SOL_3.setPixel(13, 11, 15)
TUILE_SOL_3.drawLine(2, 11, 5, 11, 15)
TUILE_SOL_3.setPixel(4, 2, 11)
// Pied du mur : c'est là que le mur rencontre le sol. Un socle clair et un joint d'ombre noir en dessous montrent tout
// de suite où le mur finit.
let TUILE_PIED_MUR = TUILE_MUR.clone()
TUILE_PIED_MUR.fillRect(0, 12, 16, 2, 11)
TUILE_PIED_MUR.fillRect(0, 14, 16, 1, 12)
TUILE_PIED_MUR.fillRect(0, 15, 16, 1, 15)
TUILE_PIED_MUR.fillRect(4, 12, 1, 2, 15)
TUILE_PIED_MUR.fillRect(11, 12, 1, 2, 15)
TUILE_PIED_MUR.setPixel(1, 13, 7)
TUILE_PIED_MUR.setPixel(2, 13, 7)
TUILE_PIED_MUR.setPixel(13, 13, 7)
// Roche : la montagne pleine derrière les murs, presque noire et presque sans texture.
let TUILE_ROCHE = image.create(16, 16)
TUILE_ROCHE.fill(15)
TUILE_ROCHE.drawLine(2, 2, 5, 3, 12)
TUILE_ROCHE.drawLine(9, 6, 12, 5, 12)
TUILE_ROCHE.drawLine(4, 11, 7, 12, 12)
TUILE_ROCHE.setPixel(1, 8, 12)
TUILE_ROCHE.setPixel(6, 8, 12)
TUILE_ROCHE.setPixel(13, 9, 12)
TUILE_ROCHE.setPixel(11, 14, 12)
// Piège à piques : un trou sombre dans le sol, trois piques avec une arête brillante.
TUILE_PIQUES = TUILE_SOL.clone()
TUILE_PIQUES.fillRect(1, 1, 14, 14, 15)
TUILE_PIQUES.drawLine(1, 1, 14, 1, 12)
TUILE_PIQUES.fillRect(3, 5, 1, 3, 11)
TUILE_PIQUES.fillRect(2, 8, 3, 2, 11)
TUILE_PIQUES.fillRect(1, 10, 5, 3, 11)
TUILE_PIQUES.fillRect(8, 3, 1, 3, 11)
TUILE_PIQUES.fillRect(7, 6, 3, 3, 11)
TUILE_PIQUES.fillRect(6, 9, 5, 4, 11)
TUILE_PIQUES.fillRect(12, 5, 1, 3, 11)
TUILE_PIQUES.fillRect(11, 8, 3, 2, 11)
TUILE_PIQUES.fillRect(10, 10, 5, 3, 11)
TUILE_PIQUES.setPixel(3, 5, 1)
TUILE_PIQUES.setPixel(2, 8, 1)
TUILE_PIQUES.setPixel(1, 10, 1)
TUILE_PIQUES.setPixel(8, 3, 1)
TUILE_PIQUES.setPixel(7, 6, 1)
TUILE_PIQUES.setPixel(6, 9, 1)
TUILE_PIQUES.setPixel(12, 5, 1)
TUILE_PIQUES.setPixel(11, 8, 1)
TUILE_PIQUES.setPixel(10, 10, 1)
// Plus d'ennemis et d'objets.
//
// Chauve-souris : grandes ailes, oreilles pointues, yeux rouges.
IMAGE_CHAUVE_SOURIS = img`
    . . . . . f f . . f f . . . . .
    f f . . f a a f f a a f . . f f
    f a f f a a a a a a a a f f a f
    f a a a a a 2 a a 2 a a a a a f
    f a a a a a a f f a a a a a a f
    . f a a a a a a a a a a a a f .
    . . f f a a a a a a a a f f . .
    . . . . f f a a a a f f . . . .
    `
// Mage : une capuche pointue, des yeux qui brillent dans l'ombre, une boule magique dans les mains. La pointe rend son
// contour reconnaissable tout de suite.
IMAGE_MAGE = img`
    . . . . . . . f f . . . . . . .
    . . . . . . f a a f . . . . . .
    . . . . . f a a a a f . . . . .
    . . . . f a a a a a a f . . . .
    . . . f a a f f f f a a f . . .
    . . . f a f 9 f f 9 f a f . . .
    . . . f a f f f f f f a f . . .
    . . . . f a a a a a a f . . . .
    . . . f f a a a a a a f f . . .
    . . f a a a a a a a a a a f . .
    . . f a a a f 3 3 f a a a f . .
    . . f a a f 3 1 1 3 f a a f . .
    . . f a a a f 3 3 f a a a f . .
    . . f a a a a a a a a a a f . .
    . . f a a a a a a a a a a f . .
    . . . f f f f f f f f f f . . .
    `
// Garde : lourde armure, un casque en forme de marmite avec une fente pour les yeux et un grand bouclier rond sur le
// côté gauche. C'est lui qui a le contour le plus large de tous les ennemis.
IMAGE_GARDE = img`
    . . . . . . . f f f f f . . . .
    . . . . . . f b b b b b f . . .
    . . . . . . f f f b f f f . . .
    . . . . . . f b b b b b f . . .
    . . . . . . f f c c f f f . . .
    . . f f f f f b b b b b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . f b 6 9 6 f b c c c b b f . .
    . f b 6 9 6 f b c c c b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . . f b 6 6 f b b b b b f . . .
    . . . f b b f b b b b f . . . .
    . . . . f f f b b b b f . . . .
    . . . . . . f e e f e e f . . .
    . . . . . . f f f . f f f . . .
    `
// Le regard vers la droite est retourné comme dans un miroir (comme pour le héros). Pour le haut et le bas, le garde a
// besoin d'images à lui, car le bouclier rond passe au bord du haut ou du bas. Les quatre images sont faites au
// démarrage. Pendant le jeu, seul setImage passe de l'une à l'autre, sans fabriquer de nouvelles images.
IMAGE_GARDE_DROITE = IMAGE_GARDE.clone()
IMAGE_GARDE_DROITE.flipX()
// Regard vers le bas : casque en marmite avec la fente vue de face, le bouclier pend devant les jambes.
IMAGE_GARDE_BAS = img`
    . . . . . f f f f f f . . . . .
    . . . . f b b b b b b f . . . .
    . . . . f f b f f b f f . . . .
    . . . . f b b b b b b f . . . .
    . . . . f f c c c c f f . . . .
    . . . f b b b b b b b b f . . .
    . . . f b b b b b b b b f . . .
    . . . f b b c c c c b b f . . .
    . . . f b b b b b b b b f . . .
    . . f f f f f f f f f f f f . .
    . f 6 6 6 6 6 6 6 6 6 6 6 6 f .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . f 6 6 6 6 9 9 9 9 6 6 6 6 f .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . . f 6 6 6 6 6 6 6 6 6 6 f . .
    . . . f f f f f f f f f f . . .
    `
// Regard vers le haut : on voit le dos, et le bouclier dépasse en grand arc au-dessus du casque.
IMAGE_GARDE_HAUT = img`
    . . . f f f f f f f f f f . . .
    . . f 6 6 6 6 6 6 6 6 6 6 f . .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . f 6 6 6 6 9 9 9 9 6 6 6 6 f .
    . . f f f f f f f f f f f f . .
    . . . . . f b b b b b f . . . .
    . . . . . f b b b b b f . . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b c c b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . . f b b b b b f . . . .
    . . . . . f b b b b b f . . . .
    . . . . . f e e f e e f . . . .
    . . . . . f f f . f f f . . . .
    `
// Boss : des cornes, des yeux jaunes qui brillent, des crocs. Il est dessiné deux fois plus grand avec setScale(2),
// donc les formes sont grosses et sans petits détails.
IMAGE_BOSS = img`
    . f f . . . . . . . . . . f f .
    . f 4 f . f f f f f f . f 4 f .
    . f 4 f f 2 2 2 2 2 2 f f 4 f .
    . . f 4 2 2 2 2 2 2 2 2 4 f . .
    . . f 2 5 5 2 2 2 2 5 5 2 f . .
    . . f 2 5 f 2 2 2 2 f 5 2 f . .
    . . f 2 2 2 2 2 2 2 2 2 2 f . .
    . . f 2 f 1 1 1 1 1 1 f 2 f . .
    . . . f 2 f 1 f f 1 f 2 f . . .
    . . f f 2 2 2 2 2 2 2 2 f f . .
    . f 4 f 2 2 e e e e 2 2 f 4 f .
    . f 4 f 2 2 2 e e 2 2 2 f 4 f .
    . . f f 2 2 2 2 2 2 2 2 f f . .
    . . . f 2 2 f f f f 2 2 f . . .
    . . . f 2 2 f . . f 2 2 f . . .
    . . f f f f . . . . f f f f . .
    `
// Coffre : des planches de bois avec des joints sombres, des bandes de métal, une serrure dorée.
IMAGE_COFFRE = img`
    . . f f f f f f f f f f f f . .
    . f 4 4 4 4 4 4 4 4 4 4 4 4 f .
    . f e e e f e e e e f e e e f .
    . f e e e f e e e e f e e e f .
    . f b b b b f f f f b b b b f .
    . f e e e f 5 5 5 5 f e e e f .
    . f e e e f 5 f f 5 f e e e f .
    . f e e e f 5 5 5 5 f e e e f .
    . f e e e f e e e e f e e e f .
    . f 4 4 4 4 4 4 4 4 4 4 4 4 f .
    . f b b b b b b b b b b b b f .
    . . f f f f f f f f f f f f . .
    `
// Torche : une pointe de flamme blanche, un manche enveloppé.
IMAGE_TORCHE = img`
    . . . 5 . . . .
    . . 4 5 4 . . .
    . 4 5 1 5 4 . .
    . 4 5 1 1 5 4 .
    . 4 5 5 5 5 4 .
    . . 4 5 5 4 . .
    . . 2 4 4 2 . .
    . . f e e f . .
    . . f b b f . .
    . . f e e f . .
    . . f b b f . .
    . . f e e f . .
    `
// La boule magique des ennemis : un bord violet, un cœur rose. Elle ne ressemble pas du tout à la boule de feu
// jaune du héros.
IMAGE_BOULE_MAGIQUE = img`
    . . a a a a . .
    . a 3 3 3 3 a .
    a 3 3 1 3 3 3 a
    a 3 1 1 3 3 3 a
    a 3 3 3 3 3 3 a
    a 3 3 3 3 3 3 a
    . a 3 3 3 3 a .
    . . a a a a . .
    `
// Tonneau : un bord de couvercle clair, des planches de bois, deux cercles de métal.
DECOR_TONNEAU = img`
    . . f f f f f f f f . .
    . f d d d d d d d d f .
    . f e e f e e f e e f .
    . f b b b b b b b b f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f b b b b b b b b f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . . f f f f f f f f . .
    `
// Os : éclairé en blanc dessus, beige dans l'ombre en dessous.
DECOR_OS = img`
    . f f . . . . . . f f .
    f 1 1 f . . . . f 1 1 f
    f 1 1 1 f f f f 1 1 1 f
    f 1 1 1 1 1 1 1 1 1 1 f
    f d d d d d d d d d d f
    f d d d f f f f d d d f
    f d d f . . . . f d d f
    . f f . . . . . . f f .
    `

// Le Calliope Hacker : une personne en pull noir à capuche, capuche sur la tête, vue de dos, à un bureau avec un écran,
// un Calliope mini et un GameKit, avec un chat qui dort, un sac à dos turquoise et des baskets turquoise. L'image
// mesure 64 × 40 pixels. Ses couleurs sont choisies pour la palette standard de ce jeu (noir f, turquoise 6, lumière de
// bord 9, bois e, mur c), donc il n'y a pas besoin de changer de palette. Sur du noir, le pull serait invisible : il se
// tient donc toujours devant une plaque de couleur c (Intro.dessinerStudio).
let IMAGE_HACKER = img`
    . . . . . . . . . . . . . . . . f f f f f . . . . . . . . . . . . . . . c . . . . . . . . . . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . f f f f f f f 9 . . . . . c . c . b b b b b b b b b b b b b b b b b b b b b b . . . . . . . . . . .
    . . . . . . . . . . . . . f b b f f f f f f 9 . c . c . c . c f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f b f f f f f f f f f 9 . c . c c c c f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f b f f f f f f f f f 9 c c c c c c c f f f 9 9 9 9 9 9 f f f f f f f f f f f f f . c . . . . . . . . .
    . . . . . . . . . . . f b f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c . c . . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f 5 5 5 5 5 5 5 5 5 f f f f f f f f . c . c . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c c c . c . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f 6 6 6 6 6 f f f f f f f f f f f f c c c c . c . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c c 5 5 c . c 5 5 . .
    . . . . . . . . . . . b f f f f f f f f f f f f 9 c c c c c c f f f f f f f 2 2 2 2 2 2 2 2 f f f f f f f c c 5 8 8 8 8 8 5 . .
    . . . . . . . . . . f f b f f f f f f f f f f f f 9 c c c c c f f f f f f f f f f f f f f f f f f f f f f c 8 8 8 8 8 8 8 8 8 .
    . . . . . . . . . f f f f b b f f f f f f f f f f f 9 c c c c f f f f f 9 9 9 9 9 9 9 9 9 9 9 f f f f f f 5 8 8 8 2 8 2 8 8 8 5
    . . . . . . f f f f f f f f f b b b b f f f f f f f f 9 c c c f f f f f f f f f f f f f f f f f f f f f f 5 8 8 8 2 2 2 8 8 8 5
    . . . . . f 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 c c f f f 8 8 8 8 f f f f f f f f f f f f f f f c 8 8 8 8 2 8 8 8 8 .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 c f f f f f f f f f f f f f f f f f f f f f f c c 5 8 8 8 8 8 5 . c
    . . . . f 6 6 6 6 6 6 6 8 f f f f f f f f f f f f b f f f f 9 f f f f f f f f f f f f f f f f f f f f f f c c 5 5 c f c 5 5 c .
    . . . . f 6 6 6 6 6 6 6 8 f f f f f f f f f f f f f b f f f f 9 c c c c c c c c c b b b c c c c c c c c c c c c c c c c . c . .
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f b f f f f f d d c c c b b b b b b b b b c c c c c c c c c c c c . c . c .
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f b f f f f d d f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f f 8 b 9 b 6 b 2 b f e e e e e e e e e e f f f f f f f f f f f f e e e e
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f f 1 f f d b d f 2 f 2 f f e e e
    . . . . f 8 8 6 6 6 6 8 8 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 1 1 f f f f f 2 f 2 f f e e e
    . . . . f 8 8 6 6 6 6 8 8 f f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 f f f f f f f f f f e e e e
    . . . . . f 8 8 6 6 8 8 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . . f 8 8 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f b f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . . . f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f f f f f f f f f c c c c c c c c c c c b b c c . c . c . c . . b d d d d d d
    . . . . . . . f f f f f f f f f f f f f f f f f f f f f f f f f f f c c c c c c c c c c c b b c . c . c . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f . f f f f f . c f f f f f b . c . c . c . c . c . c b b . c . . . . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f . f f f f f . . c f f f f b c . c . c . c . c . c . b b . . 8 6 6 6 8 . . . b d b b b b d
    . . . . . . . . . . . . . . . . . f f . f f f f f . . . f f f f b . . . c . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f 6 6 6 6 6 6 6 . . f f f f b . . . . . . . . . . . . b b . 8 6 f f f 6 8 . . b d d d d d d
    . . f . . . f . . . . . . . . . . f f 6 1 6 6 6 6 6 . . f f f f b . . . . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    . . f f . f f . . . . . . . . . . f f 1 1 1 1 1 1 1 . . f f f f b . . . . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d b b b b d
    . f 1 1 1 1 1 f 1 1 . . . . . . . f f . . . . . . . . 6 6 6 6 6 6 6 6 . . . . . . . . . . b b . 8 6 b b b 6 8 . . b d d d d d d
    . 1 1 f 1 1 1 1 1 1 1 f f f f f f f f f f f f f f . 6 6 1 6 6 6 6 6 6 6 . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    f 1 1 1 1 1 1 f f 1 1 . . . . f f . . . . . . f f . 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    8 6 6 6 6 6 6 6 6 6 8 . . . . b b . . . . . . b b . . . . . . . . . . . . . . . . . . . . b b . . 8 8 8 8 8 . . . b d b b b b d
    . 8 8 8 8 8 8 8 8 8 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b d d d d d d
    `
// Le tableau sur le mur de la salle de départ au niveau 1 : le même Hacker, tout petit, dans un cadre doré. Pur décor,
// sans collision (objets.ts).
let IMAGE_HACKER_FRESQUE = img`
    5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
    4 c c c c c c c c c c c c c c c c c c 4
    4 c c c f f f c c c c f f f f f f f c 4
    4 c c f b f f 9 c c c f 5 5 5 f f f c 4
    4 c c f b f f f 9 c c f f f f f f f c 4
    4 c c f f f f f 9 c c f 9 9 9 9 f f c 4
    4 c 6 f f f f f f 9 c f f f f f f f c 4
    4 c 6 f f f f f f f 9 f f 2 2 f f f c 4
    4 c 6 f f f f f f f f 9 f f f f f f c 4
    4 c 6 f f f f f f f f d e e e e e e e 4
    4 c 6 6 6 6 f f f f c c e c c c c e c 4
    4 c c c c c f f c f f c e c c c c e c 4
    4 c c c c 6 6 c c 6 6 c e c c c c e c 4
    4 c c c c 1 1 c c 1 1 c c c c c c c c 4
    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
    `
// Le Hacker en spectateur au bord de la salle du trône dans la fin (fin.ts), vu de dos comme sur la carte du studio. La
// deuxième image applaudit, les bras levés.
let IMAGE_SPECTATEUR = img`
    . . . . . . . . . . . .
    . . . . . . . . . . . .
    . . . . . . . . . . . .
    . . . . f f f 9 . . . .
    . . . f f f f f 9 . . .
    . . b b f f f f f 9 . .
    . . b f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f 9 . . .
    . . f f f f f f f f . .
    . b f f f f f f f f 9 .
    . b f f f f f f f f 9 .
    . b . f f f f f f . 9 .
    . . . f f . . f f . . .
    . . 6 6 6 . . 6 6 6 . .
    . . 1 1 1 . . 1 1 1 . .
    `
let IMAGE_SPECTATEUR_BRAVO = img`
    . b . . . . . . . . 9 .
    . b . . . . . . . . 9 .
    . b . . . . . . . . 9 .
    . b f . f f f 9 . 9 9 .
    . . b f f f f f 9 9 . .
    . . b b f f f f f 9 . .
    . . b f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f 9 . . .
    . . f f f f f f f f . .
    . . f f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f f . . .
    . . . f f . . f f . . .
    . . 6 6 6 . . 6 6 6 . .
    . . 1 1 1 . . 1 1 1 . .
    `
// Disparition : un ennemi vaincu disparaît dans des étoiles brillantes (jaunes et blanches, jamais dans ses propres
// couleurs et jamais en rouge). Chacune des trois images dure environ 150 ms, et avancerNuages() dans evenements.ts
// passe de l'une à l'autre.
let IMAGE_NUAGE_1 = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . 5 1 5 . . . . . . .
    . . . . 5 5 1 1 1 5 5 . . . . .
    . . . . . . 5 1 5 . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
let IMAGE_NUAGE_2 = img`
    . . . . . . . 1 . . . . . . . .
    . . . 5 . . 5 1 5 . . 5 . . . .
    . . 5 1 5 . . 5 . . 5 1 5 . . .
    . . . 5 . . . . . . . 5 . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . 5 . . . . 5 1 5 . . . . 5 . .
    5 1 5 . . . . 5 . . . . 5 1 5 .
    . 5 . . . . . . . . . . . 5 . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . 5 . . . . . . . 5 . . . .
    . . 5 1 5 . . 5 . . 5 1 5 . . .
    . . . 5 . . 5 1 5 . . 5 . . . .
    . . . . . . . 1 . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
let IMAGE_NUAGE_3 = img`
    . . . . . . . . . . . . . . . .
    . 1 . . . . . . . . . . . . 5 .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . 5 . . . . . . . . . . . . .
    . . . . . . . . . . . . . 1 . .
    . . . . . . . . . . . . . . . .
    1 . . . . . . . . . . . . . . 5
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . 1 . . . . . . . . . 5 . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . 5 . . . . . . 1 . . . . . . .
    . . . . . . . . . . . . . 1 . .
    . . . . . . . . . . . . . . . .
    `
