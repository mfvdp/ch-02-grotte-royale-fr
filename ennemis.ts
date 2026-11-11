// Ennemis : la classe de données, leur création, la recherche, les tirs et la conduite du boss.

class Ennemi {
    sprite: Sprite
    sorte: number
    vie: number
    // La vie au départ, elle ne change jamais. piloterBoss s'en sert pour calculer le seuil de colère
    // comme une fraction.
    vieMax: number
    vitesse: number
    regardX: number
    regardY: number
    ancienX: number
    ancienY: number
    prochaineActionMs: number
    estEnerve: boolean
    constructor(s: Sprite, sorte: number, vie: number, vitesse: number) {
        this.sprite = s
        this.sorte = sorte
        this.vie = vie
        this.vieMax = vie
        this.vitesse = vitesse
        this.regardX = 1
        this.regardY = 0
        this.ancienX = 0
        this.ancienY = 0
        this.prochaineActionMs = 0
        this.estEnerve = false
    }
    
}

// decalage éloigne du centre de la salle le deuxième (1) et le troisième (2) ennemi d'une salle. Sans décalage, ils
// seraient exactement l'un sur l'autre : on n'en verrait qu'un, et la physique n'arrêterait pas de les écarter.
function placerEnnemi (colonne: number, ligne: number, sorte: number, decalage: number = 0) {
    // Un palier tous les NIVEAUX_PAR_PALIER niveaux, arrondi vers le haut, donc le niveau 1 reste au palier 1. À partir
    // de PALIER_MAX, les ennemis n'accélèrent plus, sinon ils finiraient par dépasser le héros, dont la vitesse
    // s'arrête à VITESSE_HEROS_MAX.
    let palier = Math.min(Math.idiv(niveauActuel + NIVEAUX_PAR_PALIER - 1, NIVEAUX_PAR_PALIER), PALIER_MAX)
    imageNouvelEnnemi = IMAGE_SQUELETTE
    vieNouvelEnnemi = 2
    vitesseNouvelEnnemi = 20 + palier * 2
    if (sorte == 1) {
        imageNouvelEnnemi = IMAGE_GELEE
        vieNouvelEnnemi = 3
        vitesseNouvelEnnemi = 16 + palier * 2
    } else if (sorte == 2) {
        imageNouvelEnnemi = IMAGE_CHAUVE_SOURIS
        vieNouvelEnnemi = 1
        vitesseNouvelEnnemi = 34 + palier * 2
    } else if (sorte == 3) {
        imageNouvelEnnemi = IMAGE_MAGE
        vieNouvelEnnemi = 2
        vitesseNouvelEnnemi = 20 + palier
    } else if (sorte == 4) {
        // Le regard commence vers la droite (voir le constructeur de Ennemi), donc le bouclier doit commencer à droite
        // aussi. L'image et le test « par derrière » ne doivent jamais se contredire.
        imageNouvelEnnemi = IMAGE_GARDE_DROITE
        vieNouvelEnnemi = 4
        vitesseNouvelEnnemi = 18 + palier * 2
    } else if (sorte == 5) {
        // La vie du boss grandit avec le niveau, mais seulement jusqu'à VIE_BOSS_MAX. Sinon, le combat durerait sans
        // fin dans les niveaux profonds.
        imageNouvelEnnemi = IMAGE_BOSS
        vieNouvelEnnemi = Math.min(VIE_BOSS_BASE + niveauActuel, VIE_BOSS_MAX)
        vitesseNouvelEnnemi = 16 + palier
        if (niveauActuel >= NIVEAU_BOSS_FINAL) {
            // Le voleur de la couronne : la couronne volée est peinte sur une copie de l'image du boss (la ligne 0 y
            // est libre, à la ligne 1 le bandeau remplace le haut de la tête). L'original dans graphismes.ts ne change
            // pas. Lui aussi commence en pleine forme, car c'est le dernier combat.
            imageNouvelEnnemi = IMAGE_BOSS.clone()
            for (let zx = 5; zx <= 10; zx++) {
                imageNouvelEnnemi.setPixel(zx, 1, 5)
            }
            imageNouvelEnnemi.setPixel(7, 1, 2)
            imageNouvelEnnemi.setPixel(8, 1, 2)
            imageNouvelEnnemi.setPixel(5, 0, 5)
            imageNouvelEnnemi.setPixel(7, 0, 5)
            imageNouvelEnnemi.setPixel(8, 0, 5)
            imageNouvelEnnemi.setPixel(10, 0, 5)
            vieNouvelEnnemi = VIE_BOSS_MAX
        }
    }
    s = sprites.create(imageNouvelEnnemi, SpriteKind.Enemy)
    if (sorte == 2) {
        s.setFlag(SpriteFlag.GhostThroughWalls, true)
    }
    if (sorte == 5) {
        s.setScale(2, ScaleAnchor.Middle)
    }
    tiles.placeOnTile(s, tiles.getTileLocation(colonne, ligne))
    // Le centre de la salle a au moins une tuile libre dans chaque direction (creerSalles : la plus petite salle fait 3
    // × 3). Les décalages de 12 et de 8 pixels restent donc toujours sur le sol.
    if (decalage == 1) {
        s.x = s.x + 12
        s.y = s.y - 8
    } else if (decalage == 2) {
        s.x = s.x - 12
        s.y = s.y + 8
    }
    ennemis.push(new Ennemi(s, sorte, vieNouvelEnnemi, vitesseNouvelEnnemi))
}

// Tire au sort si un ennemi de plus rejoint la salle. À partir du niveau depuisNiveau, la chance commence à un dixième
// et grandit d'un dixième à chaque niveau, jusqu'au maximum plafond (aussi en dixièmes).
function ennemiEnPlusArrive (depuisNiveau: number, plafond: number) {
    if (ennemis.length >= ENNEMIS_MAX) {
        return false
    }
    let chance = niveauActuel - depuisNiveau + 1
    if (chance < 1) {
        return false
    }
    if (chance > plafond) {
        chance = plafond
    }
    return randint(1, 10) <= chance
}

// Tourne le bouclier du garde pour qu'on voie la direction du regard. C'est la seule façon pour le joueur de voir où
// est « derrière », car seuls les coups en plein dos comptent. Les quatre images ont la même taille et sont faites au
// démarrage. setImage ne fait rien tout seul quand l'image est déjà la bonne.
function choisirImageGarde (garde: Ennemi) {
    if (garde.regardY > 0) {
        garde.sprite.setImage(IMAGE_GARDE_BAS)
    } else if (garde.regardY < 0) {
        garde.sprite.setImage(IMAGE_GARDE_HAUT)
    } else if (garde.regardX < 0) {
        garde.sprite.setImage(IMAGE_GARDE)
    } else {
        garde.sprite.setImage(IMAGE_GARDE_DROITE)
    }
}

function trouverEnnemi (s: Sprite) {
    for (let q of ennemis) {
        if (q.sprite == s) {
            return q
        }
    }
    return null
}

function tirerBouleEnnemie (tireur: Sprite, vx: number, vy: number) {
    r = sprites.createProjectileFromSprite(IMAGE_BOULE_MAGIQUE, tireur, vx, vy)
    r.setKind(SORTE_BOULE_ENNEMIE)
    r.lifespan = 2500
    r.setFlag(SpriteFlag.DestroyOnWall, true)
}
function sorteAuHasard () {
    // Les seuils sont dans reglages.ts. Les panneaux du tutoriel dans l'intro lisent les mêmes constantes, pour que
    // leurs lignes « Dès le niveau N. » soient toujours justes.
    sorteMax = 1
    if (niveauActuel >= NIVEAU_CHAUVE_SOURIS) {
        sorteMax = 2
    }
    if (niveauActuel >= NIVEAU_MAGE) {
        sorteMax = 3
    }
    if (niveauActuel >= NIVEAU_GARDE) {
        sorteMax = 4
    }
    return randint(0, sorteMax)
}

function piloterBoss(ennemi: Ennemi, dx: number, dy: number) {
    let sprite = ennemi.sprite
    // Énervé dans le dernier tiers du combat : la limite est une fraction de la vie, donc la phase sauvage reste une
    // vraie partie du combat, même avec des boss costauds.
    if (ennemi.vie <= Math.idiv(ennemi.vieMax, PART_COLERE_BOSS) && !ennemi.estEnerve) {
        ennemi.estEnerve = true
        ennemi.vitesse = ennemi.vitesse + 16
        sprite.startEffect(effects.fire, 500)
        scene.cameraShake(4, 400)
    }
    
    if (valeurAbsolue(dx) > valeurAbsolue(dy)) {
        sprite.vy = 0
        sprite.vx = signe(dx) * ennemi.vitesse
    } else {
        sprite.vx = 0
        sprite.vy = signe(dy) * ennemi.vitesse
    }
    
    if (game.runtime() > ennemi.prochaineActionMs) {
        ennemi.prochaineActionMs = game.runtime() + 2200
        tirerBouleEnnemie(sprite, 60, 0)
        tirerBouleEnnemie(sprite, 0 - 60, 0)
        tirerBouleEnnemie(sprite, 0, 60)
        tirerBouleEnnemie(sprite, 0, 0 - 60)
        if (ennemi.estEnerve) {
            tirerBouleEnnemie(sprite, 45, 45)
            tirerBouleEnnemie(sprite, 45, 0 - 45)
            tirerBouleEnnemie(sprite, 0 - 45, 45)
            tirerBouleEnnemie(sprite, 0 - 45, 0 - 45)
        }
        
    }
    
}
