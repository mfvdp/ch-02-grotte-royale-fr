// Le héros : tirer des boules de feu, choisir l'image selon la direction du regard et encaisser les coups.

function tirer (viseX: number, viseY: number) {
    nouvelleBoule = sprites.createProjectileFromSprite(IMAGE_BOULE_FEU,
        heros, viseX * VITESSE_BOULE, viseY * VITESSE_BOULE)
    nouvelleBoule.lifespan = 800
    nouvelleBoule.setFlag(SpriteFlag.DestroyOnWall, true)
}

function lancerTirs () {
    if (game.runtime() < tirPossibleDesMs) {
        return
    }
    tirPossibleDesMs = game.runtime() + rechargeMs
    tirer(regardX, regardY)
    if (aTirTriple) {
        tirer(regardX + regardY, regardY + regardX)
        tirer(regardX - regardY, regardY - regardX)
    }
    Son.jouerBouleFeu()
}

// Choisit l'image qui correspond à la direction du regard. Les quatre images ont la même taille, donc la zone de
// contact ne change pas. setImage ne fait rien tout seul quand l'image est déjà la bonne.
function choisirImageHeros() {
    if (regardY > 0) {
        heros.setImage(IMAGE_HEROS_BAS)
    } else if (regardY < 0) {
        heros.setImage(IMAGE_HEROS_HAUT)
    } else if (regardX < 0) {
        heros.setImage(IMAGE_HEROS_GAUCHE)
    } else if (regardX > 0) {
        heros.setImage(IMAGE_HEROS_DROITE)
    }
}

function etreTouche (quantite: number) {
    if (game.runtime() < finProtectionMs) {
        return
    }
    finProtectionMs = game.runtime() + PROTECTION_MS
    info.changeLifeBy(0 - quantite)
    Son.jouerHerosTouche()
    scene.cameraShake(4, 250)
}
