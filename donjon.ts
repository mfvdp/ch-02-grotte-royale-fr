// Fabrication du donjon : grille, salles, couloirs, pièges et tilemap.

function viderGrille () {
    // À ne faire que la toute première fois. Un nouveau tableau pour chaque niveau devrait être recopié plusieurs fois
    // pendant le remplissage, à chaque essai de la boucle de construireNiveau, et la mémoire serait brassée dans tous
    // les sens. Chaque appel coûterait alors environ 4 Ko de données et 8 Ko de déchets de copie.
    if (grille.length != GRILLE_L * GRILLE_H) {
        grille = []
        for (let indice = 0; indice < GRILLE_L * GRILLE_H; indice++) {
            grille.push(0)
        }
        return
    }
    for (let indice = 0; indice < GRILLE_L * GRILLE_H; indice++) {
        grille[indice] = 0
    }
}

function creuser (x: number, y: number) {
    if (x > 0 && x < GRILLE_L - 1 && y > 0 && y < GRILLE_H - 1) {
        grille[y * GRILLE_L + x] = 1
    }
}

// Les couloirs font deux tuiles de large. Avec une seule tuile, un couloir ferait exactement 16 pixels de large, et le
// héros mesure 16 pixels de haut. Il passerait, mais seulement s'il est aligné au pixel près, et il resterait coincé à
// chaque virage. Comme les murs sont vraiment solides (voir dessinerGrille), c'est décisif. Avec deux tuiles, le héros
// a 16 pixels de jeu autour de lui.
function creuserCouloir (x1: number, y1: number, x2: number, y2: number) {
    x = x1
    y = y1
    while (x != x2) {
        creuser(x, y)
        creuser(x, y + 1)
        if (x < x2) {
            x += 1
        } else {
            x += -1
        }
    }
    while (y != y2) {
        creuser(x, y)
        creuser(x + 1, y)
        if (y < y2) {
            y += 1
        } else {
            y += -1
        }
    }
    creuser(x, y)
    creuser(x + 1, y)
    creuser(x, y + 1)
    creuser(x + 1, y + 1)
}

function creerSalles () {
    let largeurSalle: number;
let hauteurSalle: number;
let salleX: number;
let salleY: number;
let centreX: number;
let centreY: number;
let salleLibre: boolean;
centreSalleX = []
    centreSalleY = []
    for (let indice = 0; indice < 50; indice++) {
        largeurSalle = randint(3, 7)
        hauteurSalle = randint(3, 5)
        salleX = randint(1, GRILLE_L - largeurSalle - 2)
        salleY = randint(1, GRILLE_H - hauteurSalle - 2)
        centreX = salleX + Math.idiv(largeurSalle, 2)
        centreY = salleY + Math.idiv(hauteurSalle, 2)
        salleLibre = true
        for (let j = 0; j <= centreSalleX.length - 1; j++) {
            if (valeurAbsolue(centreSalleX[j] - centreX) < 6 && valeurAbsolue(centreSalleY[j] - centreY) < 5) {
                salleLibre = false
            }
        }
        if (salleLibre) {
            for (let y2 = 0; y2 <= hauteurSalle - 1; y2++) {
                for (let x2 = 0; x2 <= largeurSalle - 1; x2++) {
                    creuser(salleX + x2, salleY + y2)
                }
            }
            if (centreSalleX.length > 0) {
                creuserCouloir(centreSalleX[centreSalleX.length - 1],
                    centreSalleY[centreSalleY.length - 1], centreX, centreY)
            }
            centreSalleX.push(centreX)
            centreSalleY.push(centreY)
        }
    }
}

function placerPieges () {
    let x3: number;
    let y3: number;
    let assezLoin: any;
    // nombre, essais et poses sont des variables locales de cette fonction et repartent de zéro à chaque appel. Si
    // elles étaient globales, elles ne seraient jamais remises à zéro, et à partir du niveau 2 presque aucun piège
    // ne serait ajouté.
    let poses = 0
    let essais = 0
    // Un piège de plus tous les NIVEAUX_PAR_PIEGE niveaux.
    let nombre = 1 + Math.idiv(niveauActuel, NIVEAUX_PAR_PIEGE)
    if (nombre > PIEGES_MAX) {
        nombre = PIEGES_MAX
    }
    while (poses < nombre && essais < 300) {
        essais += 1
        x3 = randint(1, GRILLE_L - 2)
        y3 = randint(1, GRILLE_H - 2)
        assezLoin = valeurAbsolue(x3 - centreSalleX[0]) > 2 || valeurAbsolue(y3 - centreSalleY[0]) > 2
        if (grille[y3 * GRILLE_L + x3] == 1 && assezLoin) {
            grille[y3 * GRILLE_L + x3] = 3
            poses += 1
        }
    }
}

function dessinerGrille () {
    let cellule: number;
let numeroTuile: number;
let tampon = Buffer.create(4 + GRILLE_L * GRILLE_H)
tampon[0] = GRILLE_L
    tampon[2] = GRILLE_H
    calqueMurs = image.create(GRILLE_L, GRILLE_H)
    for (let y4 = 0; y4 <= GRILLE_H - 1; y4++) {
        for (let x4 = 0; x4 <= GRILLE_L - 1; x4++) {
            cellule = grille[y4 * GRILLE_L + x4]
            numeroTuile = 0
            if (cellule == 0) {
                // La valeur doit être exactement 2. tilemap.ts vérifie avec « layers.getPixel(col, row) === TM_WALL »,
                // et TM_WALL vaut le nombre 2. La comparaison est exacte, ce n'est pas un test « différent de zéro ».
                // Avec un autre nombre, aucun mur ne serait solide : les tirs traverseraient, les ennemis passeraient à
                // travers les murs, et la détection « coincé » de l'intelligence des ennemis ne servirait plus à rien.
                calqueMurs.setPixel(x4, y4, 2)
                if (estSol(x4, y4 + 1)) {
                    numeroTuile = 6
                } else if (estSol(x4 - 1, y4) || estSol(x4 + 1, y4) || estSol(x4, y4 - 1)) {
                    numeroTuile = 5
                } else {
                    numeroTuile = 0
                }
            } else if (cellule == 2) {
                numeroTuile = 7
            } else if (cellule == 3) {
                numeroTuile = 8
            } else {
                numeroTuile = randint(1, 3)
            }
            tampon[4 + y4 * GRILLE_L + x4] = numeroTuile
        }
    }
    tiles.setCurrentTilemap(tiles.createTilemap(tampon, calqueMurs,
        [TUILE_ROCHE, TUILE_SOL, TUILE_SOL_2, TUILE_SOL_3, TUILE_SOL,
            TUILE_MUR, TUILE_PIED_MUR, TUILE_ESCALIER, TUILE_PIQUES],
        TileScale.Sixteen))
}
