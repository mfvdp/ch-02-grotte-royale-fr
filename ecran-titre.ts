// L'image du titre et ses éléments : mur de pierre, torches, image du titre et écran du titre.
//
// Tout est peint à l'exécution avec des rectangles, des cercles et des lignes. Pas une seule image de plus en mémoire
// flash, seuls les sprites qui existent déjà dans graphismes.ts sont copiés dans l'image du titre comme décor.
//
// Les aides dessinerMaconnerie(), dessinerSol(), dessinerTorche(), ecrireAvecContour() et les deux échelles de couleurs
// servent aussi à l'intro dans intro.ts.

// L'échelle de clarté de la lumière de la torche :
//   13 (d) bord clair, 11 (b) pierre claire, 14 (e) brun chaud, 12 (c) ombre, 15 (f) noir

// Quelle couleur de pierre correspond à cette distance de la torche ?
function couleurPierre (distance: number) {
    if (distance < 30) {
        return 11
    }
    if (distance < 56) {
        return 14
    }
    if (distance < 86) {
        return 12
    }
    return 15
}

// Un cran plus sombre sur la même échelle.
function pierreSombre (couleur: number) {
    if (couleur == 13) {
        return 11
    }
    if (couleur == 11) {
        return 14
    }
    if (couleur == 14) {
        return 12
    }
    return 15
}

// Distance approximative entre deux points. Assez exacte pour la lumière et bien moins chère qu'une racine carrée.
function distanceLumiere (pointX: number, pointY: number, lx: number, ly: number) {
    let dx = valeurAbsolue(pointX - lx)
    let dy = valeurAbsolue(pointY - ly)
    if (dx > dy) {
        return dx + Math.idiv(dy, 2)
    }
    return dy + Math.idiv(dx, 2)
}

// Texte avec un contour sombre, sinon le texte disparaît dans la maçonnerie. Le texte est centré horizontalement.
function ecrireAvecContour (toile: Image, texte: string, y: number, couleur: number, contour: number,
    police: image.Font) {
    let x = Math.idiv(toile.width - texte.length * police.charWidth, 2)
    toile.print(texte, x - 1, y, contour, police)
    toile.print(texte, x + 1, y, contour, police)
    toile.print(texte, x, y - 1, contour, police)
    toile.print(texte, x, y + 1, contour, police)
    toile.print(texte, x, y, couleur, police)
}

// Un mur de pierre de y = haut à y = bas. torcheGaucheX et torcheDroiteX sont les deux torches à la hauteur ly : les
// pierres près d'elles deviennent claires, plus loin le mur s'enfonce dans le noir.
function dessinerMaconnerie (toile: Image, haut: number,
    bas: number, torcheGaucheX: number, torcheDroiteX: number, ly: number) {
    let rangee = 0
    let decalage = 0
    let distance = 0
    let autreDistance = 0
    let couleur = 0
    // Les joints restent noirs, donc on remplit d'abord tout en noir.
    toile.fillRect(0, haut, toile.width, bas - haut, 15)
    for (let zy = haut; zy < bas; zy += 12) {
        decalage = 0
        if (rangee % 2 == 1) {
            decalage = 11
        }
        for (let zx = decalage - 22; zx < toile.width; zx += 22) {
            distance = distanceLumiere(zx + 10, zy + 5, torcheGaucheX, ly)
            autreDistance = distanceLumiere(zx + 10, zy + 5, torcheDroiteX, ly)
            if (autreDistance < distance) {
                distance = autreDistance
            }
            couleur = couleurPierre(distance)
            // Une pierre sur trois est un peu plus sombre, cela donne de la structure.
            if ((rangee + Math.idiv(zx + 44, 22)) % 3 == 0) {
                couleur = pierreSombre(couleur)
            }
            toile.fillRect(zx, zy, 20, 10, couleur)
            if (couleur == 11) {
                toile.fillRect(zx, zy, 20, 1, 13)
                toile.fillRect(zx, zy + 9, 20, 1, 12)
            } else if (couleur == 14) {
                toile.fillRect(zx, zy, 20, 1, 4)
            }
            // Une fissure de temps en temps.
            if ((rangee * 2 + Math.idiv(zx + 44, 22)) % 7 == 3 && couleur != 15) {
                toile.drawLine(zx + 5, zy + 1, zx + 8, zy + 8, 15)
            }
        }
        rangee += 1
    }
}

// Le sol de pierre sous le mur, lui aussi dégradé par la lumière de la torche. Il est un peu plus sombre que le mur.
function dessinerSol (toile: Image, haut: number, torcheGaucheX: number, torcheDroiteX: number) {
    let rangee = 0
    let decalage = 0
    let distance = 0
    let autreDistance = 0
    toile.fillRect(0, haut, toile.width, toile.height - haut, 15)
    toile.fillRect(0, haut, toile.width, 2, 12)
    for (let zy = haut + 3; zy < toile.height; zy += 9) {
        decalage = 0
        if (rangee % 2 == 1) {
            decalage = 12
        }
        for (let zx = decalage - 24; zx < toile.width; zx += 24) {
            distance = distanceLumiere(zx + 11, zy + 4, torcheGaucheX, haut + 10)
            autreDistance = distanceLumiere(zx + 11, zy + 4, torcheDroiteX, haut + 10)
            if (autreDistance < distance) {
                distance = autreDistance
            }
            toile.fillRect(zx, zy, 22, 7, pierreSombre(couleurPierre(distance)))
        }
        rangee += 1
    }
}

// Une torche murale. fx est le milieu, fy la hauteur de la flamme. vacillement (0 ou 1) fait trembler la pointe. Ainsi,
// deux images fixes deviennent deux états d'une torche qui brûle.
function dessinerTorche (toile: Image, fx: number, vacillement: number = 0, fy: number = 42) {
    let pointe = fy - 9 - vacillement * 4
    // Manche et anneau de fer sur le mur.
    toile.fillRect(fx - 1, fy + 6, 3, 20, 14)
    toile.fillRect(fx - 3, fy + 7, 7, 3, 11)
    toile.fillRect(fx - 3, fy + 7, 7, 1, 13)
    // Flamme : orange à l'extérieur, jaune à l'intérieur, blanche au cœur.
    toile.fillCircle(fx, fy + 3, 5, 4)
    toile.drawLine(fx, pointe, fx - 4, fy + 3, 4)
    toile.drawLine(fx, pointe, fx + 4, fy + 3, 4)
    toile.drawLine(fx - 1 + vacillement * 2, pointe + 2, fx - 3, fy + 3, 4)
    toile.fillCircle(fx, fy + 2, 3, 5)
    toile.drawLine(fx, pointe + 4, fx, fy + 2, 5)
    toile.fillCircle(fx, fy + 1, 1, 1)
}

// Des toiles d'araignée dans les deux coins du haut.
function dessinerToilesAraignee (toile: Image) {
    for (let cote = 0; cote < 2; cote++) {
        let coinX = 0
        let sens = 1
        if (cote == 1) {
            coinX = toile.width - 1
            sens = -1
        }
        toile.drawLine(coinX, 0, coinX + sens * 19, 8, 11)
        toile.drawLine(coinX, 0, coinX + sens * 13, 14, 11)
        toile.drawLine(coinX, 0, coinX + sens * 7, 19, 11)
        toile.drawLine(coinX + sens * 9, 4, coinX + sens * 4, 9, 11)
        toile.drawLine(coinX + sens * 15, 7, coinX + sens * 7, 15, 11)
    }
}

// L'image du titre. invite fait apparaître « APPUYER SUR A », vacillement donne le deuxième état des torches. Ainsi,
// l'invite clignote au rythme du feu.
function dessinerImageTitre (invite: boolean, vacillement: number = 0) {
    let grandeFonte = image.doubledFont(image.font8)
    toileEcran = image.create(160, 120)
    toileEcran.fill(15)
    // Mur, sol et les deux torches tout à l'extérieur.
    dessinerMaconnerie(toileEcran, 0, 100, 14 - vacillement * 2, 146 + vacillement * 2, 46)
    dessinerSol(toileEcran, 100, 14, 146)
    dessinerTorche(toileEcran, 14, vacillement, 46)
    dessinerTorche(toileEcran, 146, vacillement, 46)
    // Des flaques de lumière sur le sol sous les torches.
    toileEcran.fillRect(4 - vacillement, 100, 21, 2, 4)
    toileEcran.fillRect(9 - vacillement, 100, 11, 1, 5)
    toileEcran.fillRect(136 + vacillement, 100, 21, 2, 4)
    toileEcran.fillRect(141 + vacillement, 100, 11, 1, 5)
    dessinerToilesAraignee(toileEcran)
    // Deux chaînes tiennent le panneau au plafond.
    for (let ky = 0; ky < 12; ky += 3) {
        toileEcran.fillRect(45, ky, 3, 2, 11)
        toileEcran.fillRect(112, ky, 3, 2, 11)
        toileEcran.setPixel(45, ky, 13)
        toileEcran.setPixel(112, ky, 13)
    }
    // Panneau de bois avec un milieu creusé.
    toileEcran.fillRect(22, 11, 116, 50, 14)
    toileEcran.fillRect(22, 22, 116, 1, 12)
    toileEcran.fillRect(22, 44, 116, 1, 12)
    toileEcran.drawRect(22, 11, 116, 50, 15)
    toileEcran.drawRect(23, 12, 114, 48, 4)
    toileEcran.fillRect(28, 17, 104, 38, 15)
    toileEcran.drawRect(28, 17, 104, 38, 12)
    toileEcran.setPixel(25, 14, 5)
    toileEcran.setPixel(134, 14, 5)
    toileEcran.setPixel(25, 57, 5)
    toileEcran.setPixel(134, 57, 5)
    // Le lettrage brille : en haut une écriture jaune avec un contour orange, dessous une écriture orange avec
    // un contour rouge.
    ecrireAvecContour(toileEcran, Jeu.LIGNES_TITRE[0], 19, 5, 4, grandeFonte)
    ecrireAvecContour(toileEcran, Jeu.LIGNES_TITRE[1], 37, 4, 2, grandeFonte)
    // Commandes et meilleur score. Ce sont deux lignes parce que font8 fait six pixels de large : sur un écran
    // de 160 pixels, seuls 26 caractères tiennent côte à côte. Le cadre du panneau de bois descend jusqu'à y = 60, donc
    // la première ligne ne commence qu'à 63 (son contour à 62), sinon les lignes du cadre passeraient sur l'écriture.
    // Le meilleur score en font8 prend les lignes 82 à 91 avec son contour, juste en dessous, à 92, se tient le héros.
    ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.COMMANDES_TITRE), 63, 13, 15, image.font8)
    ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.CARTE_TITRE), 73, 13, 15, image.font8)
    ecrireAvecContour(toileEcran, Catalogue.formater(Catalogue.IdTexte.RECORD,
        info.highScore()), 83, 5, 15, image.font8)
    // Décor sur le sol : le héros attend devant le coffre.
    toileEcran.drawTransparentImage(IMAGE_COFFRE, 14, 88)
    toileEcran.drawTransparentImage(IMAGE_CLE, 112, 92)
    toileEcran.drawTransparentImage(DECOR_OS, 130, 106)
    toileEcran.drawTransparentImage(IMAGE_HEROS, 72, 92)
    if (invite) {
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.APPUYER_A), 105, 1, 15, image.font8)
    }
    return toileEcran
}

// L'écran du titre : d'abord l'intro (histoire, carte « Calliope Hacker présente » avec la carte du titre, panneaux du
// tutoriel), puis il attend A.
//
// La toile vit à travers toutes les parties de l'intro : Intro.creerToile() la fabrique, Intro.fermerToile() la libère.
// La libération doit se faire sur tous les chemins, aussi après un arrêt avec A, sinon il manque 9,6 Ko de mémoire aux
// deux images du titre. Chaque station commence par Intro.commencerStation() : un appui sur A ne saute que la station
// en cours (voir intro.ts).
function lancerEcranTitre () {
    aAppuye = false
    // Après la fin de la partie (on rejoue avec la marque), on va directement à l'image du titre.
    if (JOUER_INTRO && !(Catalogue.versTitreDirect)) {
        Intro.creerToile()
        Intro.jouer()
        Intro.afficherCartes()
        Intro.commencerStation(true)
        Tutoriel.jouer()
        Intro.fermerToile()
    }
    imageTitreAvecInvite = dessinerImageTitre(true, 0)
    imageTitreSimple = dessinerImageTitre(false, 1)
    // L'image du titre est une station aussi : l'appui qui vient de sauter les panneaux du tutoriel ne compte plus, et
    // pendant le temps de blocage qui suit, même un A martelé ne lance pas le jeu.
    Intro.commencerStation(true)
    scene.setBackgroundImage(imageTitreAvecInvite)
    Son.lancerMusiqueTitre()
    while (!(Intro.appuye())) {
        pause(120)
        compteurClignotement += 1
        if (compteurClignotement % 6 == 0) {
            scene.setBackgroundImage(imageTitreSimple)
        } else if (compteurClignotement % 6 == 3) {
            scene.setBackgroundImage(imageTitreAvecInvite)
        }
    }
    Son.arreterMusique()
    scene.setBackgroundImage(image.create(16, 16))
    // Les deux images du titre mesurent chacune 160 × 120 pixels, ensemble un bon 19 Ko, et on n'en a plus jamais
    // besoin. Si on ne lâche pas les références, elles prendraient de la place en mémoire tout le temps que le jeu
    // tourne. C'est une part sensible sur le Calliope, qui a peu de mémoire. La variable toileEcran contient la même
    // image que imageTitreSimple, elle doit donc être vidée aussi.
    imageTitreAvecInvite = null
    imageTitreSimple = null
    toileEcran = null
}
