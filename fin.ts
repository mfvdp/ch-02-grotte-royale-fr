// Fin : la victoire. Elle se joue quand le voleur de la couronne tombe (lancée dans evenements.ts,
// au niveau NIVEAU_BOSS_FINAL).
//
// Le héros s'approche du voleur renversé, la couronne flotte vers lui, il la met et s'enfuit par le portail de lumière.
// Puis game.over(true) suit.
//
// On peint comme dans l'intro, dans une image plein écran de 160 × 120 pixels. Mais ce n'est pas un fond, car la
// tilemap passerait devant une image de fond. L'image est donc accrochée à un sprite d'affichage avec z = 300, qui se
// trouve au-dessus de tout. Qui change l'image change l'affichage tout de suite, tout comme pour l'obscurité.
//
// Avant cela, jouer() range : les ennemis, les objets et surtout les 9,6 Ko de l'obscurité sont retirés. Il y a alors
// sûrement de la place pour la toile. A saute les scènes comme dans l'intro.
namespace Epilogue {
    // Devient vrai dès que A a été pressé.
    let sautDemande = false
    // Jusqu'à ce moment (game.runtime), un appui expire. La fin commence en plein combat, souvent avec un A martelé. Un
    // tir qui arrive trop tard ne doit pas sauter toute la victoire.
    let finBlocageMs = 0

    // Attend par petits morceaux et retient un appui sur un bouton.
    function attendre(dureeMs: number) {
        let reste = dureeMs
        let pas = 0
        while (reste > 0) {
            if (aAppuye && game.runtime() < finBlocageMs) {
                aAppuye = false
            }
            if (aAppuye) {
                sautDemande = true
                return
            }
            pas = 30
            if (reste < pas) {
                pas = reste
            }
            pause(pas)
            reste = reste - pas
        }
        if (aAppuye && game.runtime() >= finBlocageMs) {
            sautDemande = true
        }
    }

    // La salle du trône du voleur : mur, sol, deux torches. Devant, à droite, au bord, le Calliope Hacker se tient en
    // spectateur, vu de dos comme sur la carte du studio. Il est peint deux fois plus grand que les personnages du
    // couronnement, car à taille normale le pull noir se perdait dans les pierres sombres. Avec acclamation = true, il
    // lève les bras au rythme des torches, sinon il reste immobile.
    function dessinerSalle(vacillement: number, acclamation: boolean = false) {
        dessinerMaconnerie(toileEcran, 0, 96, 20 - vacillement * 2, 140 + vacillement * 2, 44)
        dessinerSol(toileEcran, 96, 20, 140)
        dessinerTorche(toileEcran, 20, vacillement, 44)
        dessinerTorche(toileEcran, 140, vacillement, 44)
        if (acclamation && vacillement == 1) {
            Intro.dessinerDouble(IMAGE_SPECTATEUR_BRAVO, 136, 79)
        } else {
            Intro.dessinerDouble(IMAGE_SPECTATEUR, 136, 79)
        }
    }

    // Une petite couronne, comme elle va au héros. cibleX et cibleY sont le coin en haut à gauche des pointes. s est
    // l'échelle : à s = 1, le bandeau fait huit pixels de large, à s = 2 seize. s = 2 sert pour le héros en taille
    // double au couronnement.
    function dessinerPetiteCouronne(cibleX: number, cibleY: number, s: number = 1) {
        toileEcran.fillRect(cibleX, cibleY + 2 * s, 8 * s, 2 * s, 5)
        toileEcran.fillRect(cibleX, cibleY, 2 * s, 2 * s, 5)
        toileEcran.fillRect(cibleX + 3 * s, cibleY, 2 * s, 2 * s, 5)
        toileEcran.fillRect(cibleX + 6 * s, cibleY, 2 * s, 2 * s, 5)
        toileEcran.fillRect(cibleX + 4 * s, cibleY + 2 * s, s, s, 2)
    }

    // De petites étoiles tournent au-dessus du voleur à terre.
    function dessinerEtoiles(cx: number, cy: number, f: number) {
        if (f % 3 == 0) {
            toileEcran.setPixel(cx - 8, cy, 5)
            toileEcran.setPixel(cx + 6, cy - 3, 1)
        } else if (f % 3 == 1) {
            toileEcran.setPixel(cx, cy - 5, 1)
            toileEcran.setPixel(cx + 8, cy + 1, 5)
        } else {
            toileEcran.setPixel(cx - 5, cy - 4, 5)
            toileEcran.setPixel(cx + 2, cy + 2, 1)
        }
    }

    export function jouer() {
        // Arrêter le jeu et faire de la place. moveSprite(0, 0) fige le héros. Sinon, il pourrait encore courir sur
        // l'escalier sans qu'on le voie pendant la fin et construire un nouveau niveau.
        partieEnCours = false
        Son.arreterMusique()
        // La musique de victoire porte la fin jusqu'à la carte de fin. En ré majeur, l'histoire racontée en ré mineur
        // trouve sa résolution.
        Son.lancerMusiqueVictoire()
        controller.moveSprite(heros, 0, 0)
        if (spriteObscurite != null) {
            spriteObscurite.destroy()
            spriteObscurite = null
        }
        // Lâcher aussi la référence à l'image : le sprite a disparu, mais imageObscurite garderait sinon l'image de
        // l'obscurité en mémoire.
        imageObscurite = null
        viderNiveau()
        aAppuye = false
        sautDemande = false
        finBlocageMs = game.runtime() + 1000
        // La scène : un sprite d'affichage au-dessus de tout.
        toileEcran = image.create(160, 120)
        let spriteToile = sprites.create(toileEcran, SORTE_AFFICHAGE)
        spriteToile.setFlag(SpriteFlag.Ghost, true)
        spriteToile.setFlag(SpriteFlag.RelativeToCamera, true)
        spriteToile.z = 300
        spriteToile.setPosition(80, 60)
        // Le voleur est renversé : flipY le met la tête en bas.
        let bossTombe = IMAGE_BOSS.clone()
        bossTombe.flipY()
        let grandeFonte = image.doubledFont(image.font8)
        // 1) Le héros s'approche du voleur vaincu, l'ouverture apparaît en fondu.
        for (let f = 0; f < 11; f++) {
            if (sautDemande) {
                break
            }
            dessinerSalle(f % 2)
            Intro.dessinerDouble(bossTombe, 100, 64)
            dessinerEtoiles(116, 58, f)
            Intro.dessinerCouronne(116, 56, f % 2 == 0)
            toileEcran.drawTransparentImage(IMAGE_HEROS_DROITE, -16 + f * 10, 78)
            Cinema.dessinerCadre(0, 0, Cinema.ouvrirBandes(f))
            attendre(130)
        }
        // 2) Le couronnement. Partie A : la couronne flotte vers lui, et le temps lui-même ralentit : chaque image dure
        // plus longtemps que la précédente. Des cloches au loin.
        const IMAGE_COURONNEMENT_MS = [140, 140, 160, 200, 260, 330, 420]
        Son.jouerCloche()
        for (let f = 0; f < 7; f++) {
            if (sautDemande) {
                break
            }
            let kx = 116 - f * 4
            let ky = 56 + f * 2
            dessinerSalle(f % 2, true)
            Intro.dessinerDouble(bossTombe, 100, 64)
            toileEcran.drawTransparentImage(IMAGE_HEROS_DROITE, 84, 78)
            Cinema.dessinerGuirlande(kx, ky, 24 + f * 5, f % 2, 4, 5)
            Intro.dessinerCouronne(kx, ky, true)
            Cinema.dessinerEtoile(kx, ky, 5 + (f % 2) * 2, 1)
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            attendre(IMAGE_COURONNEMENT_MS[f])
        }
        // Partie B : le flash, la couronne touche la tête.
        if (!sautDemande) {
            Son.jouerCouronne()
            toileEcran.fill(1)
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            attendre(70)
        }
        // Partie C : le héros en gros plan. Le couronné en taille double, onde de choc, guirlandes
        // de lumière, confettis.
        for (let f = 0; f < 5; f++) {
            if (sautDemande) {
                break
            }
            toileEcran.fill(15)
            Cinema.dessinerOnde(80, 50, 20 + f * 28, 1, 5, 4)
            Cinema.dessinerGuirlande(80, 50, 150, f % 2, 5, 14)
            Cinema.dessinerGuirlande(80, 50, 150, 1 - f % 2, 4, 7)
            Intro.dessinerDouble(IMAGE_HEROS_DROITE, 64, 42)
            dessinerPetiteCouronne(72, 36, 2)
            Cinema.laisserTomberConfettis(f)
            Cinema.secouer(f, Cinema.HAUTEUR_BANDE)
            attendre(90)
        }
        // Partie D : image fixe dans une lumière dorée.
        Son.jouerCoffre()
        for (let f = 0; f < 5; f++) {
            if (sautDemande) {
                break
            }
            toileEcran.fill(15)
            Cinema.dessinerGuirlande(80, 50, 150, f % 2, 14, 12)
            toileEcran.fillCircle(80, 54, 44, 4)
            toileEcran.fillCircle(80, 54, 32, 5)
            Intro.dessinerDouble(IMAGE_HEROS_DROITE, 64, 42)
            dessinerPetiteCouronne(72, 36, 2)
            Cinema.dessinerEtoile(80, 38, 8, 1)
            Cinema.laisserTomberConfettis(f + 5)
            ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.ROI_REVIENT), 96, 5, 15, image.font8)
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            attendre(200)
        }
        // 3) La fuite en découpe de papier : le héros est une silhouette devant le portail éblouissant, seule sa
        // couronne reste dorée.
        let ombreHeros = IMAGE_HEROS_GAUCHE.clone()
        for (let c = 1; c < 16; c++) {
            ombreHeros.replace(c, 15)
        }
        for (let f = 0; f < 8; f++) {
            if (sautDemande) {
                break
            }
            dessinerSalle(f % 2, true)
            Intro.dessinerDouble(bossTombe, 100, 64)
            Cinema.dessinerFaisceau(6, 70, 0, 180, 26 + f * 5, 13)
            Cinema.dessinerFaisceau(6, 70, 1, 150, 14, 1)
            Cinema.dessinerFaisceau(6, 70, 15, 150, 14, 1)
            toileEcran.fillCircle(6, 70, 22 + f * 5, 13)
            toileEcran.fillCircle(6, 70, 14 + f * 5, 1)
            toileEcran.drawTransparentImage(ombreHeros, 84 - f * 10, 78)
            dessinerPetiteCouronne(88 - f * 10, 75)
            // Le film se ferme lentement autour de la silhouette.
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE + f * 2)
            attendre(120)
        }
        // 4) La lumière inonde la salle.
        for (let f = 0; f < 6; f++) {
            if (sautDemande) {
                break
            }
            toileEcran.fillCircle(6, 70, 20 + f * 32, 1)
            Cinema.dessinerCadre(0, 0, 22)
            attendre(110)
        }
        // 5) Fermeture blanche : le flot de lumière refroidit en passant par l'or, le rouge, le brun et le gris
        // jusqu'au noir, la même lueur finale que sur la carte du studio (Intro.jouerLogo). Le cercle se ferme : le jeu
        // finit comme il a commencé.
        toileEcran.fill(1)
        for (let f = 0; f < 6; f++) {
            if (sautDemande) {
                break
            }
            Cinema.refroidir()
            Cinema.dessinerCadre(0, 0, 22)
            attendre(130)
        }
        // À partir d'ici, la carte de fin reprend la musique.
        Son.arreterMusique()
        // 6) Carte de fin 1 : LIBÉRÉ. Elle se joue toujours, même après un appui sur A, car la victoire l'a méritée.
        Son.jouerEpilogue()
        let debut = 0
        if (sautDemande) {
            debut = 3
        }
        for (let f = debut; f < 4; f++) {
            toileEcran.fill(15)
            Cinema.dessinerGuirlande(80, 24, 130, f % 2, 14, 10)
            Intro.dessinerCouronne(80, 20, f % 2 == 0)
            ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.LIBERE), 40, 5, 4, grandeFonte)
            if (f >= 1) {
                ecrireAvecContour(toileEcran,
                    Catalogue.texte(Catalogue.IdTexte.COURONNE_RETROUVEE), 62, 13, 15, image.font8)
            }
            if (f >= 2) {
                ecrireAvecContour(toileEcran, Catalogue.formater(Catalogue.IdTexte.POINTS, info.score()),
                    74, 5, 15, image.font8)
            }
            if (f >= 3) {
                ecrireAvecContour(toileEcran, Catalogue.formater(Catalogue.IdTexte.NIVEAUX,
                    niveauActuel), 86, 4, 15, image.font8)
            }
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            if (f < 3) {
                // attendre au lieu de pause : un appui sur A ne fait qu'accélérer la montée, l'image fixe terminée en
                // dessous reste en place.
                attendre(220)
            }
        }
        pause(1400)
        // 7) Carte de fin 2 : CALLIOPE HACKER, exactement la carte du studio de l'intro (avec le personnage), avec son
        // accord de 2 secondes. Le jeu commence et finit avec la même image et le même son. L'accord porte aussi le
        // long temps d'affichage au lieu de le laisser silencieux.
        Son.jouerLogo()
        debut = 0
        if (sautDemande) {
            debut = 5
        }
        for (let f = debut; f < 6; f++) {
            toileEcran.fill(15)
            Cinema.dessinerGuirlande(80, 51, 110, f % 2, 14, 8)
            ecrireAvecContour(toileEcran, "CALLIOPE", Intro.NOM_Y, 5, 4, grandeFonte)
            ecrireAvecContour(toileEcran, "HACKER", Intro.HACKER_Y, 4, 2, grandeFonte)
            Intro.dessinerStudio()
            if (f % 2 == 0) {
                Cinema.dessinerEtoile(26, Intro.NOM_Y + 4, 5, 1)
            } else {
                Cinema.dessinerEtoile(134, Intro.HACKER_Y + 10, 5, 1)
            }
            if (f >= 2) {
                ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.MERCI),
                    Intro.PRESENTE_Y, 13, 15, image.font8)
            }
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            if (f < 5) {
                attendre(150)
            }
        }
        // Volontairement plus long que la première carte de fin : cette carte est le dernier plan du jeu, il reste donc
        // assez longtemps pour être lu tranquillement.
        pause(2600)
        // Le rideau se ferme.
        for (let f = 0; f < 4; f++) {
            Cinema.dessinerCadre(0, 0, 8 + f * 17)
            pause(70)
        }
        // Ranger, enregistrer le meilleur score, montrer l'écran de victoire.
        Son.arreterMusique()
        spriteToile.destroy()
        toileEcran = null
        info.saveHighScore()
        game.over(true)
    }
}
