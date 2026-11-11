// Construction d'un niveau entier.

function construireNiveau () {
    let salleCle: number;
let tirage: number;
let limiteCoeur: number;
viderNiveau()
    let essais = 0
    while (true) {
        viderGrille()
        creerSalles()
        essais += 1
        // Sortie de secours : creerSalles fait normalement 6 à 10 salles, 4 est pratiquement sûr. Sans cette limite,
        // une série de malchance inonderait la mémoire de grilles fraîchement construites.
        if (centreSalleX.length >= 4 || essais >= 8) {
            break;
        }
    }
    derniereSalle = centreSalleX.length - 1
    grille[centreSalleY[derniereSalle] * GRILLE_L + centreSalleX[derniereSalle]] = 2
    placerPieges()
    dessinerGrille()
    placerDecor()
    if (niveauActuel == 1) {
        placerFresque()
    }
    nombreCles = 0
    affichageCle.setFlag(SpriteFlag.Invisible, true)
    tiles.placeOnTile(heros, tiles.getTileLocation(centreSalleX[0], centreSalleY[0]))
    scene.cameraFollowSprite(heros)
    // Un boss tous les NIVEAUX_PAR_BOSS niveaux, et toujours au niveau du boss final, même si ce n'est pas un multiple.
    bossEstActif = niveauActuel % NIVEAUX_PAR_BOSS == 0 || niveauActuel == NIVEAU_BOSS_FINAL
    if (bossEstActif) {
        placerEnnemi(centreSalleX[derniereSalle], centreSalleY[derniereSalle], 5)
    } else {
        // derniereSalle est la salle de l'escalier. Si la clé y était, elle serait sur la tuile de l'escalier, et le
        // niveau serait fini dès qu'on la ramasse. derniereSalle vaut pratiquement toujours au moins 3 (la boucle plus
        // haut demande quatre salles et n'abandonne qu'après huit essais), donc la plage reste valable.
        salleCle = randint(1, derniereSalle - 1)
        placerObjet(centreSalleX[salleCle], centreSalleY[salleCle], 1)
    }
    for (let salle = 1; salle < derniereSalle + 1; salle++) {
        // L'ennemi de base compte aussi pour ENNEMIS_MAX. ennemiEnPlusArrive ne vérifie la limite que pour les
        // deuxièmes et troisièmes ennemis. Sans ce test, on ajouterait encore des ennemis de base dans un niveau à
        // nombreuses salles, même quand la liste est pleine depuis longtemps. Le boss est déjà dans la liste, il est
        // placé plus haut avant cette boucle.
        if (ennemis.length < ENNEMIS_MAX) {
            placerEnnemi(centreSalleX[salle], centreSalleY[salle], sorteAuHasard())
        }
        // Le deuxième et le troisième ennemi arrivent par une douce montée (voir ennemiEnPlusArrive dans ennemis.ts),
        // avec un décalage, sinon ils seraient exactement l'un sur l'autre.
        if (ennemiEnPlusArrive(DEUXIEME_ENNEMI_DES, DEUXIEME_ENNEMI_MAX)) {
            placerEnnemi(centreSalleX[salle], centreSalleY[salle], sorteAuHasard(), 1)
        }
        if (ennemiEnPlusArrive(TROISIEME_ENNEMI_DES, TROISIEME_ENNEMI_MAX)) {
            placerEnnemi(centreSalleX[salle], centreSalleY[salle], sorteAuHasard(), 2)
        }
        // Plus on descend, plus souvent un cœur se trouve dans la salle à la place d'une pièce. C'est un petit
        // équilibre, car plus d'ennemis et plus de pièges attendent en bas.
        limiteCoeur = 2 + Math.min(Math.idiv(niveauActuel, NIVEAUX_PAR_COEUR), COEURS_BONUS_MAX)
        tirage = randint(0, 9)
        if (tirage < limiteCoeur) {
            placerObjet(centreSalleX[salle], centreSalleY[salle], 2)
        } else if (tirage < limiteCoeur + 2) {
            placerObjet(centreSalleX[salle], centreSalleY[salle], 3)
        } else if (tirage < limiteCoeur + 4) {
            placerObjet(centreSalleX[salle], centreSalleY[salle], 4)
        } else {
            placerObjet(centreSalleX[salle], centreSalleY[salle], 5)
        }

    }
    // Une torche allumée s'arrête avec le niveau. Sans cette remise à zéro, finLumiereMs resterait dans le futur, et
    // quand ce moment finirait par arriver, le test trouverait le rayon déjà à LUMIERE_NORMALE et ne ferait rien.
    finLumiereMs = 0
    reglerLumiere(LUMIERE_NORMALE)
    afficherNiveau()
    Son.lancerMusiqueDonjon(niveauActuel)
    if (bossEstActif) {
        if (niveauActuel == NIVEAU_BOSS_FINAL) {
            heros.sayText(Catalogue.texte(Catalogue.IdTexte.VOLEUR_COURONNE), 2000, false)
        } else {
            heros.sayText(Catalogue.formater(Catalogue.IdTexte.NIVEAU_BOSS, niveauActuel), 1800, false)
        }
        Son.jouerBossArrive()
    } else {
        heros.sayText(Catalogue.formater(Catalogue.IdTexte.NIVEAU_ANNONCE, niveauActuel), 1300, false)
    }
}
