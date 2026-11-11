// Un jeu de donjon au hasard pour MakeCode Arcade.
//
// Croix = marcher, A = boule de feu. Trouve la clé, cherche l'escalier, descends de plus en plus bas. Tous les 5
// niveaux, un boss attend. Les coffres donnent des améliorations.
//
// Ce fichier ne contient que le départ du jeu et les boucles de mise à jour. Tout le reste est dans des fichiers à
// part. L'ordre dans pxt.json est l'ordre dans lequel ils s'exécutent.

// Avec DIAGNOSTIC activé, montre une couleur et s'arrête un instant pour que l'écran puisse vraiment l'afficher. Sans
// DIAGNOSTIC, l'appel ne coûte rien.
function afficherCouleurDiagnostic(couleur: number) {
    if (!DIAGNOSTIC) {
        return
    }
    scene.setBackgroundColor(couleur)
    pause(700)
}

Catalogue.initialiser()
afficherCouleurDiagnostic(8)
lancerEcranTitre()
afficherCouleurDiagnostic(6)
scene.setBackgroundColor(15)
info.setLife(VIES_DEPART)
info.setScore(0)
heros = sprites.create(IMAGE_HEROS, SpriteKind.Player)
heros.z = 5
controller.moveSprite(heros, vitesseHeros, vitesseHeros)
afficherCouleurDiagnostic(7)
if (OBSCURITE) {
    // L'obscurité est accrochée devant la caméra (160 × 120 pixels). Le trou de lumière se déplace dans l'image jusqu'à
    // la position du héros à l'écran (dessinerLumiere, plus bas dans game.onUpdate).
    imageObscurite = image.create(160, 120)
    spriteObscurite = sprites.create(imageObscurite, SORTE_AFFICHAGE)
    spriteObscurite.setFlag(SpriteFlag.Ghost, true)
    spriteObscurite.setFlag(SpriteFlag.RelativeToCamera, true)
    spriteObscurite.z = 90
    spriteObscurite.setPosition(80, 60)
}
affichageCle = sprites.create(IMAGE_CLE, SORTE_AFFICHAGE)
affichageCle.setFlag(SpriteFlag.Ghost, true)
affichageCle.setFlag(SpriteFlag.RelativeToCamera, true)
affichageCle.setPosition(80, 10)
affichageCle.z = 100
// Fabrique tout de suite la carte et le panneau du niveau, tant que la mémoire est encore d'un seul bloc, et plus
// jamais pendant que le jeu tourne.
creerAffichage()
afficherCouleurDiagnostic(5)
reglerLumiere(LUMIERE_NORMALE)
// Peindre une fois tout de suite : game.onUpdate ne démarre qu'après construireNiveau(), et d'ici là la zone
// serait complètement transparente.
if (spriteObscurite != null) {
    dessinerLumiere()
}
afficherCouleurDiagnostic(4)
construireNiveau()
afficherCouleurDiagnostic(2)
game.onUpdate(function () {
    if (!(partieEnCours)) {
        return
    }
    if (heros.vx != 0 || heros.vy != 0) {
        if (valeurAbsolue(heros.vx) > valeurAbsolue(heros.vy)) {
            regardY = 0
            regardX = signe(heros.vx)
        } else {
            regardX = 0
            regardY = signe(heros.vy)
        }
        choisirImageHeros()
    }
    if (controller.A.isPressed()) {
        lancerTirs()
    }
    if (nuages.length > 0) {
        avancerNuages()
    }
    if (spriteObscurite != null) {
        dessinerLumiere()
    }
})
game.onUpdateInterval(280, function () {
    let sprite: Sprite;
let dx: number;
let dy: number;
let distance: any;
let estCoince: any;
let peutTourner: boolean;
let deCote: boolean;
if (!(partieEnCours)) {
        return
    }
    for (let ennemi of ennemis) {
        if (ennemi.vie > 0) {
            sprite = ennemi.sprite
dx = heros.x - sprite.x
            dy = heros.y - sprite.y
            distance = valeurAbsolue(dx) + valeurAbsolue(dy)
            if (distance > 100 && ennemi.sorte != 5) {
                sprite.vx = 0
                sprite.vy = 0
            } else {
                estCoince = valeurAbsolue(sprite.x - ennemi.ancienX) < 1 &&
                    valeurAbsolue(sprite.y - ennemi.ancienY) < 1
                ennemi.ancienX = sprite.x
ennemi.ancienY = sprite.y
peutTourner = true
                if (ennemi.sorte == 4 && game.runtime() < ennemi.prochaineActionMs) {
                    peutTourner = false
                }
                if (peutTourner) {
                    // Si dx == 0 et dy == 0, l'ancienne direction du regard est gardée. signe(0) vaudrait 0, et avec le
                    // regard (0, 0) le garde serait invulnérable de tous les côtés (le test « par derrière » dans
                    // evenements.ts ne serait jamais vrai). Il resterait immobile et montrerait la mauvaise
                    // image de bouclier.
                    if (valeurAbsolue(dx) > valeurAbsolue(dy)) {
                        ennemi.regardX = signe(dx)
ennemi.regardY = 0
                    } else if (dy != 0) {
                        ennemi.regardX = 0
ennemi.regardY = signe(dy)
                    }
                    if (ennemi.sorte == 4) {
                        ennemi.prochaineActionMs = game.runtime() + 1400
                        choisirImageGarde(ennemi)
                    }
                }
                if (ennemi.sorte == 2) {
                    sprite.vx = signe(dx) * ennemi.vitesse
                    sprite.vy = signe(dy) * ennemi.vitesse + randint(0 - 25, 25)
                } else if (ennemi.sorte == 3) {
                    if (distance < 70) {
                        sprite.vx = 0 - signe(dx) * ennemi.vitesse
                        sprite.vy = 0 - signe(dy) * ennemi.vitesse
                    } else if (distance > 115) {
                        sprite.vx = signe(dx) * ennemi.vitesse
                        sprite.vy = signe(dy) * ennemi.vitesse
                    } else {
                        sprite.vx = 0
                        sprite.vy = 0
                    }
                    if (game.runtime() > ennemi.prochaineActionMs) {
                        ennemi.prochaineActionMs = game.runtime() + 1700
tirerBouleEnnemie(sprite, signe(dx) * 70, signe(dy) * 70)
                    }
                } else if (ennemi.sorte == 4) {
                    sprite.vx = ennemi.regardX * ennemi.vitesse
                    sprite.vy = ennemi.regardY * ennemi.vitesse
                } else if (ennemi.sorte == 5) {
                    piloterBoss(ennemi, dx, dy)
                } else {
                    deCote = valeurAbsolue(dx) > valeurAbsolue(dy)
                    if (estCoince) {
                        deCote = !(deCote)
                    }
                    if (randint(0, 6) == 0) {
                        deCote = !(deCote)
                    }
                    if (deCote) {
                        sprite.vy = 0
                        sprite.vx = signe(dx) * ennemi.vitesse
                    } else {
                        sprite.vx = 0
                        sprite.vy = signe(dy) * ennemi.vitesse
                    }
                }
            }
        }
    }
})
game.onUpdateInterval(120, function () {
    if (!(partieEnCours)) {
        return
    }
    if (game.runtime() < finProtectionMs) {
        heros.setFlag(SpriteFlag.Invisible, Math.idiv(game.runtime(), 120) % 2 == 0)
    } else {
        heros.setFlag(SpriteFlag.Invisible, false)
    }
    if (finLumiereMs > 0 && game.runtime() > finLumiereMs) {
        finLumiereMs = 0
        reglerLumiere(LUMIERE_NORMALE)
    }
})
