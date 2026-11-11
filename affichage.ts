// Affichage : le numéro du niveau en bas à gauche et la carte sur le bouton B.
//
// Important : les deux images sont faites une fois au démarrage (creerAffichage, appelée depuis main.ts), puis
// seulement repeintes. Si l'image de la carte était refaite à chaque appui sur B (environ 5,5 Ko) et le panneau du
// niveau à chaque changement de niveau, cela morcellerait la mémoire serrée du Calliope jusqu'à ce qu'une nouvelle
// image échoue en plein jeu : le jeu plante et l'image se fige.

let affichageNiveau: Sprite = null
let spriteCarte: Sprite = null

// Longueur du côté d'une tuile du donjon sur la carte.
const CARTE_CELLULE = 4
// Bord haut de la carte, au-dessus se trouve l'étiquette.
const CARTE_MARGE_HAUT = 12

// Fabrique les deux images d'affichage, une fois au démarrage, tant que la mémoire est encore d'un seul bloc.
function creerAffichage() {
    tamponCarte = image.create(GRILLE_L * CARTE_CELLULE +
        4, GRILLE_H * CARTE_CELLULE + CARTE_MARGE_HAUT + 2)
    tamponNiveau = image.create(60, 10)
}

// Écrit le niveau actuel en bas à gauche dans l'affichage.
function afficherNiveau() {
    // image.font8 fait six pixels de large (charWidth: 6 dans screen/text.ts), pas cinq. « NIVEAU 12 » fait 9
    // caractères et demande donc 54 pixels. Avec seulement 30 pixels, tout ce qui dépasse la colonne 30 serait coupé en
    // silence, et il ne resterait que « NIVEA » sans le numéro.
    tamponNiveau.fill(0)
    tamponNiveau.print(Catalogue.formater(Catalogue.IdTexte.NIVEAU, niveauActuel), 0, 1, 5, image.font8)
    if (affichageNiveau == null) {
        affichageNiveau = sprites.create(tamponNiveau, SORTE_AFFICHAGE)
        affichageNiveau.setFlag(SpriteFlag.Ghost, true)
        affichageNiveau.setFlag(SpriteFlag.RelativeToCamera, true)
        affichageNiveau.z = 100
        affichageNiveau.setPosition(32, 112)
    }
    // Un setImage n'est pas nécessaire : le sprite montre la même image, et celui qui peint dans l'image change
    // l'affichage tout de suite.
}

// Peint l'image de la carte du niveau actuel dans le tampon fixe.
function dessinerCarte() {
    let toile = tamponCarte
    toile.fill(15)
    toile.drawRect(0, 0, toile.width, toile.height, 12)
    toile.print(Catalogue.formater(Catalogue.IdTexte.CARTE_NIVEAU, niveauActuel), 3, 2, 5, image.font8)
    for (let ky = 0; ky < GRILLE_H; ky++) {
        for (let kx = 0; kx < GRILLE_L; kx++) {
            let cellule = grille[ky * GRILLE_L + kx]
            let couleur = -1
            if (cellule == 1) {
                couleur = 12
            } else if (cellule == 2) {
                couleur = 5
            } else if (cellule == 3) {
                couleur = 2
            }
            if (couleur >= 0) {
                toile.fillRect(2 + kx * CARTE_CELLULE, CARTE_MARGE_HAUT + ky * CARTE_CELLULE,
                    CARTE_CELLULE, CARTE_CELLULE, couleur)
            }
        }
    }
    // Le héros comme un point clair. Une tuile du donjon fait 16 pixels de large.
    let hx = Math.idiv(heros.x, 16)
    let hy = Math.idiv(heros.y, 16)
    if (hx >= 0 && hx < GRILLE_L && hy >= 0 && hy < GRILLE_H) {
        toile.fillRect(2 + hx * CARTE_CELLULE, CARTE_MARGE_HAUT + hy * CARTE_CELLULE,
            CARTE_CELLULE, CARTE_CELLULE, 7)
    }
    return toile
}

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    // heros et grille ne sont faits que dans main.ts et dans construireNiveau(), donc après lancerEcranTitre(). Mais ce
    // gestionnaire est déjà enregistré pendant l'intro et l'image du titre, et l'image du titre annonce même « B
    // affiche la carte ». Sans ce test, dessinerCarte() y chercherait heros == null (heros.x est un accesseur, donc un
    // appel sur une référence nulle), et le jeu planterait avant d'avoir commencé.
    if (heros == null || grille.length == 0 || !partieEnCours || spriteCarte != null) {
        return
    }
    spriteCarte = sprites.create(dessinerCarte(), SORTE_AFFICHAGE)
    spriteCarte.setFlag(SpriteFlag.Ghost, true)
    spriteCarte.setFlag(SpriteFlag.RelativeToCamera, true)
    spriteCarte.z = 200
    spriteCarte.setPosition(80, 60)
})

controller.B.onEvent(ControllerButtonEvent.Released, function () {
    if (spriteCarte != null) {
        spriteCarte.destroy()
        spriteCarte = null
    }
})
