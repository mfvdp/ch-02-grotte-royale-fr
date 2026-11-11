// Panneaux du tutoriel : le tutoriel dans l'intro. Il passe après l'histoire (Intro.jouer) et avant l'image du titre.
// Six panneaux expliquent les commandes, le but, les trésors, les ennemis et le donjon lui-même.
//
// Tout est chronométré, et A saute (comme dans l'intro) : chaque boucle demande Intro.estSaute() et s'arrête aussitôt.
//
// On peint dans la même image plein écran toileEcran que dans l'intro, donc il n'y a pas de nouvelle image en mémoire
// flash ni de mémoire de travail en plus. Les sprites viennent en taille double de graphismes.ts
// (Intro.dessinerDouble). Les icônes (croix, boutons, carte, flèche) sont de purs dessins de rectangles et de cercles.
//
// Largeur du texte : font5 et font8 font 6 pixels de large par caractère. Une ligne du panneau a au plus 22 caractères
// (x 14 à 145) : il reste ainsi 4 pixels libres à gauche et à droite jusqu'au cadre intérieur (x 9 et 150) ; à partir
// de 24 caractères, le texte est posé sur le cadre. Sur toute la largeur, il y a de la place pour 26. La ligne du bas
// est à y 103 : les jambages (g, p) finissent à 110, le contour noir du texte à 111, et le cadre intérieur est à 112.
// Les textes viennent du catalogue (textes.ts). Qui change un texte surveille ce nombre de caractères, sinon il dépasse
// du bord. font8 sait dessiner les accents, ils sont donc permis.
//
// Important : ce fichier doit figurer dans la liste « files » de pxt.json (après intro.ts), sinon il n'est pas compilé
// du tout (compilé veut dire transformé en programme, pas traduit dans une langue).
namespace Tutoriel {
    // Les réglages de la vitesse : IMAGE_MS est le temps entre deux images en millisecondes, IMAGES est le nombre
    // d'images d'un panneau normal. 9 × 550 ms font environ 5 s par panneau. Mieux vaut trop lent que trop rapide : qui
    // a fini appuie sur A.
    const IMAGE_MS = 550
    const IMAGES = 9
    // Chaque apparition d'un ennemi dure IMAGES_ENNEMI × IMAGE_ENNEMI_MS, donc un bon deux secondes. Un nom et trois
    // lignes demandent du temps de lecture.
    const IMAGE_ENNEMI_MS = 420
    const IMAGES_ENNEMI = 5

    // Le panneau : un mur de pierre avec un champ noir au milieu. Le cadre intérieur brille au rythme de la torche,
    // pour que la page vive sans que l'écriture tremble.
    function dessinerFondPanneau(vacillement: number) {
        dessinerMaconnerie(toileEcran, 0, 120, 6 - vacillement * 2, 154 + vacillement * 2, 58)
        toileEcran.fillRect(8, 6, 144, 108, 15)
        toileEcran.drawRect(8, 6, 144, 108, 12)
        toileEcran.drawRect(9, 7, 142, 106, 11 + vacillement * 2)
    }

    // ---- Petits peintres d'icônes ----

    // La croix directionnelle, 16 × 16 pixels.
    function dessinerCroix(cibleX: number, cibleY: number) {
        toileEcran.fillRect(cibleX + 5, cibleY, 6, 16, 11)
        toileEcran.fillRect(cibleX, cibleY + 5, 16, 6, 11)
        toileEcran.fillRect(cibleX + 6, cibleY + 1, 4, 14, 12)
        toileEcran.fillRect(cibleX + 1, cibleY + 6, 14, 4, 12)
    }

    // Un bouton rond avec une lettre, 16 × 16 pixels.
    function dessinerBouton(cibleX: number, cibleY: number, etiquette: string) {
        toileEcran.fillCircle(cibleX + 8, cibleY + 8, 8, 12)
        toileEcran.fillCircle(cibleX + 8, cibleY + 8, 7, 2)
        toileEcran.print(etiquette, cibleX + 5, cibleY + 4, 1, image.font8)
    }

    // Une mini-carte dans les couleurs de la vraie carte du bouton B : sol gris, escalier jaune, héros =
    // point vert (couleur 7).
    function dessinerIconeCarte(cibleX: number, cibleY: number) {
        toileEcran.fillRect(cibleX, cibleY, 18, 14, 15)
        toileEcran.drawRect(cibleX, cibleY, 18, 14, 12)
        toileEcran.fillRect(cibleX + 2, cibleY + 2, 5, 4, 12)
        toileEcran.fillRect(cibleX + 6, cibleY + 4, 4, 2, 12)
        toileEcran.fillRect(cibleX + 9, cibleY + 6, 6, 5, 12)
        toileEcran.setPixel(cibleX + 3, cibleY + 3, 7)
        toileEcran.fillRect(cibleX + 12, cibleY + 8, 2, 2, 5)
    }

    // Une flèche qui pointe vers la droite, elle va de la clé à l'escalier.
    function dessinerFleche(cibleX: number, cibleY: number, longueur: number) {
        toileEcran.fillRect(cibleX, cibleY - 1, longueur, 3, 5)
        toileEcran.drawLine(cibleX + longueur, cibleY, cibleX + longueur - 5, cibleY - 5, 5)
        toileEcran.drawLine(cibleX + longueur, cibleY, cibleX + longueur - 5, cibleY + 5, 5)
    }

    // ---- Panneau 1 : les commandes ----
    function montrerPageCommandes(vacillement: number) {
        dessinerFondPanneau(vacillement)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.COMMANDES), 12, 5, 15, image.font8)
        dessinerCroix(14, 26)
        toileEcran.drawTransparentImage(IMAGE_HEROS, 34, 26)
        toileEcran.print(Catalogue.texte(Catalogue.IdTexte.MARCHER_VISER), 56, 31, 13, image.font8)
        dessinerBouton(14, 50, "A")
        toileEcran.drawTransparentImage(IMAGE_BOULE_FEU, 34, 50)
        toileEcran.print(Catalogue.texte(Catalogue.IdTexte.BOULE_DE_FEU), 56, 55, 13, image.font8)
        dessinerBouton(14, 74, "B")
        dessinerIconeCarte(34, 75)
        toileEcran.print(Catalogue.texte(Catalogue.IdTexte.TENIR_CARTE), 56, 79, 13, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.REGARD_1), 94, 11, 15, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.REGARD_2), 104, 11, 15, image.font8)
    }

    // ---- Panneau 2 : le but ----
    function montrerPageBut(vacillement: number) {
        dessinerFondPanneau(vacillement)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.BUT), 12, 5, 15, image.font8)
        Intro.dessinerDouble(IMAGE_CLE, 26, 26)
        dessinerFleche(64, 42, 26)
        Intro.dessinerDouble(TUILE_ESCALIER, 96, 26)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.TROUVER_CLE), 62, 13, 15, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.PRENDRE_ESCALIER), 72, 13, 15, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.formater(Catalogue.IdTexte.TOUS_LES_NIVEAUX,
            NIVEAUX_PAR_BOSS), 84, 13, 15, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.BOSS_ESCALIER), 94, 13, 15, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.formater(Catalogue.IdTexte.NIVEAU_COURONNE, NIVEAU_BOSS_FINAL),
            103, 5, 15, image.font8)
    }

    // ---- Panneau 3 : les trésors ----
    function montrerPageTresors(vacillement: number) {
        dessinerFondPanneau(vacillement)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.TRESORS), 12, 5, 15, image.font8)
        toileEcran.drawTransparentImage(IMAGE_COEUR, 16, 26)
        toileEcran.print(Catalogue.texte(Catalogue.IdTexte.INFO_COEUR), 40, 31, 13, image.font8)
        toileEcran.drawTransparentImage(IMAGE_TORCHE, 16, 46)
        toileEcran.print(Catalogue.texte(Catalogue.IdTexte.INFO_TORCHE), 40, 51, 13, image.font8)
        toileEcran.drawTransparentImage(IMAGE_COFFRE, 16, 66)
        toileEcran.print(Catalogue.texte(Catalogue.IdTexte.INFO_COFFRE), 40, 71, 13, image.font8)
        toileEcran.drawTransparentImage(IMAGE_PIECE, 16, 86)
        toileEcran.print(Catalogue.texte(Catalogue.IdTexte.INFO_PIECE), 40, 91, 13, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.TOUT_PRENDRE), 103, 5, 15, image.font8)
    }

    // Panneau 4 : le défilé des ennemis. L'image, le nom et les indices de chaque ennemi sont dans des chaînes de if.
    // Des tableaux coûteraient plus ici, ils resteraient en mémoire de travail tout le temps que le jeu tourne.
    function imageEnnemi(sorte: number) {
        if (sorte == 1) {
            return IMAGE_GELEE
        }
        if (sorte == 2) {
            return IMAGE_CHAUVE_SOURIS
        }
        if (sorte == 3) {
            return IMAGE_MAGE
        }
        if (sorte == 4) {
            return IMAGE_GARDE
        }
        if (sorte == 5) {
            return IMAGE_BOSS
        }
        return IMAGE_SQUELETTE
    }

    function nomEnnemi(sorte: number) {
        if (sorte == 1) {
            return Catalogue.texte(Catalogue.IdTexte.GELEE)
        }
        if (sorte == 2) {
            return Catalogue.texte(Catalogue.IdTexte.CHAUVE_SOURIS)
        }
        if (sorte == 3) {
            return Catalogue.texte(Catalogue.IdTexte.MAGE)
        }
        if (sorte == 4) {
            return Catalogue.texte(Catalogue.IdTexte.GARDE)
        }
        if (sorte == 5) {
            return Catalogue.texte(Catalogue.IdTexte.BOSS)
        }
        return Catalogue.texte(Catalogue.IdTexte.SQUELETTE)
    }

    // Les lignes « Dès le niveau N. » sont fabriquées à partir des constantes de reglages.ts. Ainsi, le tutoriel et le
    // jeu ne peuvent jamais se contredire, même si tu changes les valeurs.
    function ligneEnnemi(sorte: number, quelle: number) {
        if (sorte == 0) {
            if (quelle == 0) {
                return Catalogue.texte(Catalogue.IdTexte.SUIT)
            }
            if (quelle == 1) {
                return Catalogue.texte(Catalogue.IdTexte.DEUX_COUPS)
            }
        } else if (sorte == 1) {
            if (quelle == 0) {
                return Catalogue.texte(Catalogue.IdTexte.RESISTANT)
            }
            if (quelle == 1) {
                return Catalogue.texte(Catalogue.IdTexte.TROIS_COUPS)
            }
        } else if (sorte == 2) {
            if (quelle == 0) {
                return Catalogue.texte(Catalogue.IdTexte.TRAVERSE_MURS)
            }
            if (quelle == 1) {
                return Catalogue.texte(Catalogue.IdTexte.UN_COUP)
            }
            if (quelle == 2) {
                return Catalogue.formater(Catalogue.IdTexte.DES_NIVEAU, NIVEAU_CHAUVE_SOURIS)
            }
        } else if (sorte == 3) {
            if (quelle == 0) {
                return Catalogue.texte(Catalogue.IdTexte.DISTANCE)
            }
            if (quelle == 1) {
                return Catalogue.texte(Catalogue.IdTexte.LANCE_BOULES)
            }
            if (quelle == 2) {
                return Catalogue.formater(Catalogue.IdTexte.DES_NIVEAU, NIVEAU_MAGE)
            }
        } else if (sorte == 4) {
            if (quelle == 0) {
                return Catalogue.texte(Catalogue.IdTexte.DE_DOS)
            }
            if (quelle == 1) {
                return Catalogue.texte(Catalogue.IdTexte.DOS_FAIBLE)
            }
            if (quelle == 2) {
                return Catalogue.formater(Catalogue.IdTexte.DES_NIVEAU, NIVEAU_GARDE)
            }
        } else if (sorte == 5) {
            if (quelle == 0) {
                return Catalogue.formater(Catalogue.IdTexte.BOSS_PERIODE, NIVEAUX_PAR_BOSS)
            }
            if (quelle == 1) {
                return Catalogue.texte(Catalogue.IdTexte.BOSS_CLE)
            }
            if (quelle == 2) {
                return Catalogue.texte(Catalogue.IdTexte.ENERVE_A_LA_FIN)
            }
        }
        return ""
    }

    function montrerPageEnnemi(sorte: number, vacillement: number) {
        dessinerFondPanneau(vacillement)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.ENNEMIS), 12, 5, 15, image.font8)
        Intro.dessinerDouble(imageEnnemi(sorte), 64, 26)
        ecrireAvecContour(toileEcran, nomEnnemi(sorte), 62, 1, 15, image.font8)
        for (let quelle = 0; quelle < 3; quelle++) {
            if (ligneEnnemi(sorte, quelle).length > 0) {
                ecrireAvecContour(toileEcran, ligneEnnemi(sorte,
                    quelle), 76 + quelle * 10, 13, 15, image.font8)
            }
        }
    }

    // Panneau 5 : le donjon lui-même. À part le salut de la fin, c'est la seule page sans panneau ni cadre, elle montre
    // la vraie vue dans le jeu, avec le cercle de lumière.
    function montrerPageDonjon(vacillement: number) {
        toileEcran.fill(15)
        dessinerSol(toileEcran, 30, 64, 64)
        toileEcran.drawTransparentImage(TUILE_PIQUES, 76, 40)
        toileEcran.drawTransparentImage(IMAGE_HEROS, 48, 40)
        // Le cercle de lumière respire légèrement au rythme de la torche.
        Intro.dessinerIris(64, 48, 32 + vacillement * 2)
        // L'écriture ne vient qu'après l'iris, sinon elle est repeinte en noir.
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.DONJON), 8, 5, 15, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.OBSCURITE), 76, 13, 15, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.PIQUES), 86, 13, 15, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.AIDE_TORCHE), 96, 13, 15, image.font8)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.AIDE_CARTE), 106, 13, 15, image.font8)
    }

    // ---- Panneau 6 : le salut de la fin, une image fixe ----
    function montrerPageAdieux() {
        toileEcran.fill(15)
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.CHANCE), 44, 5, 4, image.font8)
        Intro.dessinerDouble(IMAGE_HEROS, 64, 68)
    }

    // ---- Joue tous les panneaux. A saute le reste aussitôt. ----
    export function jouer() {
        for (let f = 0; f < IMAGES; f++) {
            if (Intro.estSaute()) {
                return
            }
            montrerPageCommandes(f % 2)
            Intro.montrer()
            Intro.attendre(IMAGE_MS)
        }
        for (let f = 0; f < 8; f++) {
            if (Intro.estSaute()) {
                return
            }
            montrerPageBut(f % 2)
            Intro.montrer()
            Intro.attendre(IMAGE_MS)
        }
        for (let f = 0; f < IMAGES; f++) {
            if (Intro.estSaute()) {
                return
            }
            montrerPageTresors(f % 2)
            Intro.montrer()
            Intro.attendre(IMAGE_MS)
        }
        for (let sorte = 0; sorte <= 5; sorte++) {
            for (let f = 0; f < IMAGES_ENNEMI; f++) {
                if (Intro.estSaute()) {
                    return
                }
                montrerPageEnnemi(sorte, f % 2)
                Intro.montrer()
                Intro.attendre(IMAGE_ENNEMI_MS)
            }
        }
        for (let f = 0; f < IMAGES; f++) {
            if (Intro.estSaute()) {
                return
            }
            montrerPageDonjon(f % 2)
            Intro.montrer()
            Intro.attendre(IMAGE_MS)
        }
        if (Intro.estSaute()) {
            return
        }
        montrerPageAdieux()
        Intro.montrer()
        Intro.attendre(1500)
    }
}
