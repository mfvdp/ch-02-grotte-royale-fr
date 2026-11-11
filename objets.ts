// Objets et décor : les placer et les ranger quand le niveau change.

function placerObjet (colonne: number, ligne: number, sorte: number) {
    let spriteObjet: Sprite;
if (sorte == 1) {
        spriteObjet = sprites.create(IMAGE_CLE, SORTE_CLE)
    } else if (sorte == 2) {
        spriteObjet = sprites.create(IMAGE_COEUR, SORTE_COEUR)
    } else if (sorte == 3) {
        spriteObjet = sprites.create(IMAGE_TORCHE, SORTE_TORCHE)
    } else if (sorte == 4) {
        spriteObjet = sprites.create(IMAGE_COFFRE, SORTE_COFFRE)
    } else {
        spriteObjet = sprites.create(IMAGE_PIECE, SORTE_PIECE)
    }
    // GhostThroughTiles en plus : les objets n'ont besoin que du contact avec le héros, pas des événements de tuiles.
    // Sans ce drapeau, la physique vérifie toutes les tuiles touchées pour chaque objet à chaque image, et fabrique des
    // objets éphémères en le faisant.
    spriteObjet.setFlag(SpriteFlag.GhostThroughWalls, true)
    spriteObjet.setFlag(SpriteFlag.GhostThroughTiles, true)
    tiles.placeOnTile(spriteObjet, tiles.getTileLocation(colonne, ligne))
}

function placerDecor () {
    let x5: number;
let y5: number;
let spriteDecor: Sprite;
let spriteTorche: Sprite;
for (let indice = 0; indice < 8 + centreSalleX.length; indice++) {
        x5 = randint(1, GRILLE_L - 2)
        y5 = randint(1, GRILLE_H - 2)
        if (grille[y5 * GRILLE_L + x5] == 1) {
            if (randint(0, 1) == 0) {
                spriteDecor = sprites.create(DECOR_TONNEAU, SORTE_DECOR)
            } else {
                spriteDecor = sprites.create(DECOR_OS, SORTE_DECOR)
            }
            // Pur décor : aucun événement n'y est accroché, donc le drapeau Ghost complet. Il le retire entièrement
            // de la physique.
            spriteDecor.setFlag(SpriteFlag.Ghost, true)
            spriteDecor.z = -1
            tiles.placeOnTile(spriteDecor, tiles.getTileLocation(x5, y5))
        }
    }
    for (let indice = 0; indice < 10; indice++) {
        x5 = randint(1, GRILLE_L - 2)
        y5 = randint(1, GRILLE_H - 2)
        if (grille[y5 * GRILLE_L + x5] == 0 && estSol(x5, y5 + 1)) {
            spriteTorche = sprites.create(IMAGE_TORCHE, SORTE_DECOR)
            spriteTorche.setFlag(SpriteFlag.Ghost, true)
            spriteTorche.z = -1
            tiles.placeOnTile(spriteTorche, tiles.getTileLocation(x5, y5))
            spriteTorche.y = spriteTorche.y + 3
        }
    }
}

// La colonne wx sous le mur wy est-elle, jusqu'à la ligne de départ, du sol sans interruption ? Alors le mur appartient
// à la salle de départ.
function solJusquAuDepart (wx: number, wy: number) {
    for (let y = wy + 1; y <= centreSalleY[0]; y++) {
        if (!(estSol(wx, y))) {
            return false
        }
    }
    return true
}

// Le Calliope Hacker en tableau sur le mur de la salle de départ du niveau 1 : une petite apparition au bord, pure
// décoration sans collision (Ghost) et sous l'obscurité. On le voit dès que la lumière du héros tombe dessus. On
// cherche la tuile de mur la plus proche avec du sol en dessous (un pan de mur visible) au-dessus du point de départ,
// au plus six colonnes à côté et cinq rangées plus haut. Passage 0 : le mur appartient à la salle de départ (du sol
// jusqu'à la ligne de départ) et a du mur à gauche et à droite, car le tableau est plus large de deux pixels qu'une
// tuile. Passage 1 : sans les voisins. Passage 2 : n'importe quel mur de la zone de recherche. Vérifié sur 20 000
// niveaux construits : environ 94 % au premier passage, environ 99 % en tout. Sinon, le niveau reste sans tableau.
function placerFresque () {
    let meilleurX = -1
    let meilleurY = -1
    let meilleureDistance = 0
    let distanceCarree = 0
    for (let essai = 0; essai < 3 && meilleurX < 0; essai++) {
        for (let wy = centreSalleY[0] - 5; wy <= centreSalleY[0] - 1; wy++) {
            for (let wx = centreSalleX[0] - 6; wx <= centreSalleX[0] + 6; wx++) {
                if (wy < 1 || wx < 1 || wx > GRILLE_L - 2 ||
                    estSol(wx, wy) || !(estSol(wx, wy + 1))) {
                    continue
                }
                if (essai == 0 && (estSol(wx - 1, wy) || estSol(wx + 1, wy))) {
                    continue
                }
                if (essai < 2 && !(solJusquAuDepart(wx, wy))) {
                    continue
                }
                distanceCarree = (wx - centreSalleX[0]) * (wx - centreSalleX[0]) +
                    (wy - centreSalleY[0]) * (wy - centreSalleY[0])
                if (meilleurX < 0 || distanceCarree < meilleureDistance) {
                    meilleurX = wx
                    meilleurY = wy
                    meilleureDistance = distanceCarree
                }
            }
        }
    }
    if (meilleurX < 0) {
        return
    }
    // Une torche murale au hasard au même endroit cède la place à la fresque.
    for (let f of sprites.allOfKind(SORTE_DECOR)) {
        if (valeurAbsolue(f.x - (meilleurX * 16 + 8)) < 20 && valeurAbsolue(f.y - (meilleurY * 16 + 8)) < 16) {
            f.destroy()
        }
    }
    let spriteFresque = sprites.create(IMAGE_HACKER_FRESQUE, SORTE_DECOR)
    spriteFresque.setFlag(SpriteFlag.Ghost, true)
    spriteFresque.z = -1
    tiles.placeOnTile(spriteFresque, tiles.getTileLocation(meilleurX, meilleurY))
    // Au-dessus du pied du mur, au milieu de la surface du mur.
    spriteFresque.y = spriteFresque.y - 2
}

function viderNiveau () {
    for (let a of sprites.allOfKind(SpriteKind.Enemy)) {
        a.destroy()
    }
    for (let c of sprites.allOfKind(SORTE_CLE)) {
        c.destroy()
    }
    for (let e of sprites.allOfKind(SORTE_COEUR)) {
        e.destroy()
    }
    for (let f of sprites.allOfKind(SORTE_PIECE)) {
        f.destroy()
    }
    for (let g of sprites.allOfKind(SORTE_COFFRE)) {
        g.destroy()
    }
    for (let h of sprites.allOfKind(SORTE_TORCHE)) {
        h.destroy()
    }
    for (let m of sprites.allOfKind(SORTE_DECOR)) {
        m.destroy()
    }
    for (let n of sprites.allOfKind(SORTE_BOULE_ENNEMIE)) {
        n.destroy()
    }
    // Les boules de feu du héros aussi : sinon, un vieux tir volerait encore à travers le nouveau
    // niveau pendant jusqu'à 800 ms.
    for (let z of sprites.allOfKind(SpriteKind.Projectile)) {
        z.destroy()
    }
    for (let q of nuages) {
        q.destroy()
    }
    nuages = []
    ennemis = []
}
