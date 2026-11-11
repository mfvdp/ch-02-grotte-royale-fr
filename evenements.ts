// Tous les gestionnaires d'événements. Ce fichier s'exécute après sortes.ts et graphismes.ts, car les gestionnaires
// lisent SORTE_* et TUILE_* dès qu'ils sont enregistrés.

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    aAppuye = true
})
sprites.onOverlap(SpriteKind.Player, SORTE_COEUR, function (joueur, chose) {
    chose.destroy(effects.hearts, 200)
    info.changeLifeBy(1)
    Son.jouerCoeur()
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (boule, spriteEnnemi) {
    let parDerriere: any;
let spriteCle: Sprite;
ennemiTouche = trouverEnnemi(spriteEnnemi)
    // Pas d'effet de feu sur le projectile : chaque effet fabrique une source de particules avec 750 ms de durée de vie
    // et deux copies d'image. Avec le tir rapide triple, cela ferait 15 par seconde. Le coup se voit assez bien sur
    // l'ennemi (gerbe et disparition).
    boule.destroy()
    if (ennemiTouche == null) {
        return
    }
    if (ennemiTouche.sorte == 4) {
        parDerriere = boule.vx * ennemiTouche.regardX > 0 || boule.vy * ennemiTouche.regardY > 0
        if (!(parDerriere)) {
            spriteEnnemi.startEffect(effects.spray, 100)
            Son.jouerBloque()
            return
        }
    }
    ennemiTouche.vie = ennemiTouche.vie - 1
ennemiX = spriteEnnemi.x
    ennemiY = spriteEnnemi.y
    if (ennemiTouche.vie <= 0) {
        // Pas d'éclatement dans ses propres couleurs : l'ennemi disparaît aussitôt dans des étoiles brillantes, le boss
        // un peu plus grand. D'abord, toutes les particules sur l'ennemi sont détruites, même celles qui volent déjà.
        // Sinon, les étincelles rouges du feu de colère (piloterBoss) flotteraient encore environ 0,7 s au-dessus des
        // étoiles et de la clé. (particleSources n'existe qu'après la première source de particules. On la parcourt à
        // l'envers, car destroy() retire la source de la liste.)
        let sources = game.currentScene().particleSources
        if (sources) {
            for (let i = sources.length - 1; i >= 0; i--) {
                if (sources[i].anchor == spriteEnnemi) {
                    sources[i].clear()
                    sources[i].destroy()
                }
            }
        }
        spriteEnnemi.destroy()
        disparaitre(ennemiX, ennemiY, ennemiTouche.sorte == 5)
        if (ennemiTouche.sorte == 5) {
            bossEstActif = false
            info.changeScoreBy(100)
            scene.cameraShake(6, 700)
            Son.jouerBossDisparait()
            if (niveauActuel >= NIVEAU_BOSS_FINAL) {
                // C'était le voleur de la couronne : la couronne est libre, la partie est gagnée. Il reste un bonus,
                // puis la fin prend le relais (elle bloque ici, comme la boîte de fin de partie).
                info.changeScoreBy(400)
                Epilogue.jouer()
                return
            }
            spriteCle = sprites.create(IMAGE_CLE, SORTE_CLE)
            // Pas SpriteFlag.Ghost ! Ghost contient GhostThroughSprites, donc la clé n'aurait plus aucun contact et on
            // ne pourrait pas la ramasser. Tous les autres objets utilisent aussi GhostThroughWalls (voir
            // placerObjet dans objets.ts).
            spriteCle.setFlag(SpriteFlag.GhostThroughWalls, true)
            spriteCle.setPosition(ennemiX, ennemiY)
        } else {
            info.changeScoreBy(10)
            Son.jouerEnnemiDisparait()
        }
    } else {
        // L'éclair du coup vient de startEffect. Une copie de l'image n'est pas nécessaire pour cela : il aurait le
        // même aspect et ne coûterait que de la mémoire à chaque coup.
        spriteEnnemi.startEffect(effects.spray, 100)
        Son.jouerCoup()
    }
})

sprites.onOverlap(SpriteKind.Player, SORTE_TORCHE, function (joueur, chose) {
    chose.destroy(effects.fire, 200)
    finLumiereMs = game.runtime() + TORCHE_DUREE_MS
    reglerLumiere(LUMIERE_TORCHE)
    heros.sayText(Catalogue.texte(Catalogue.IdTexte.TORCHE), 700, false)
    Son.jouerTorche()
})

sprites.onOverlap(SpriteKind.Player, SORTE_PIECE, function (joueur, chose) {
    chose.destroy()
    info.changeScoreBy(5)
    Son.jouerPiece()
})
sprites.onOverlap(SpriteKind.Player, SORTE_CLE, function (joueur, chose) {
    nombreCles += 1
    chose.destroy(effects.confetti, 200)
    affichageCle.setFlag(SpriteFlag.Invisible, false)
    heros.sayText(Catalogue.texte(Catalogue.IdTexte.CLE), 800, false)
    Son.jouerCle()
})

sprites.onOverlap(SpriteKind.Player, SORTE_COFFRE, function (joueur, coffre) {
    coffre.destroy(effects.confetti, 300)
    Son.jouerCoffre()
    choixCoffre = randint(0, 3)
    if (choixCoffre == 0 && !(aTirTriple)) {
        aTirTriple = true
        heros.sayText(Catalogue.texte(Catalogue.IdTexte.TIR_TRIPLE), 1200, false)
    } else if (choixCoffre == 1 && rechargeMs > RECHARGE_RAPIDE_MS) {
        rechargeMs = RECHARGE_RAPIDE_MS
        heros.sayText(Catalogue.texte(Catalogue.IdTexte.TIR_RAPIDE), 1200, false)
    } else if (choixCoffre == 2 && vitesseHeros < VITESSE_HEROS_MAX) {
        // Sans limite maximale, les bottes s'empileraient sans fin, et le héros finirait par aller trop vite pour être
        // dirigé. Quand le maximum est atteint, le coffre se rabat sur le cœur en plus.
        vitesseHeros = Math.min(vitesseHeros + VITESSE_BOTTES, VITESSE_HEROS_MAX)
        controller.moveSprite(heros, vitesseHeros, vitesseHeros)
        heros.sayText(Catalogue.texte(Catalogue.IdTexte.BOTTES), 1200, false)
    } else {
        info.changeLifeBy(1)
        heros.sayText(Catalogue.texte(Catalogue.IdTexte.COEUR_EN_PLUS), 1200, false)
    }
})

scene.onOverlapTile(SpriteKind.Player, TUILE_PIQUES, function (joueur, lieu) {
    if (game.runtime() < finProtectionMs) {
        return
    }
    etreTouche(1)
    joueur.startEffect(effects.spray, 200)
})
scene.onOverlapTile(SpriteKind.Player, TUILE_ESCALIER, function (joueur, lieu) {
    if (bossEstActif || nombreCles == 0) {
        // Ce gestionnaire se déclenche à chaque image tant que le héros est sur la tuile. Sans le verrou, sayText
        // fabrique une nouvelle boîte de texte à chaque image et la dessine lettre par lettre : environ 40 Ko de petits
        // déchets par seconde, qui morcellent la mémoire pendant que le joueur reste là, perplexe.
        if (game.runtime() < finIndiceMs) {
            return
        }
        finIndiceMs = game.runtime() + 1200
        if (bossEstActif) {
            heros.sayText(Catalogue.texte(Catalogue.IdTexte.BOSS_D_ABORD), 900, false)
        } else {
            heros.sayText(Catalogue.texte(Catalogue.IdTexte.CLE_D_ABORD), 900, false)
        }
        return
    }
    // La profondeur compte : plus on est bas, plus le niveau terminé rapporte de points. Cela compense le fait que les
    // pièces sont plus rares en profondeur (pondération des cœurs dans construireNiveau).
    info.changeScoreBy(niveauActuel * 5)
    niveauActuel += 1
    Son.jouerNiveauFini()
    construireNiveau()
})

sprites.onOverlap(SORTE_BOULE_ENNEMIE, SpriteKind.Player, function (boule, joueur) {
    boule.destroy(effects.spray, 100)
    etreTouche(1)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (joueur, spriteEnnemi) {
    if (game.runtime() < finProtectionMs) {
        return
    }
    etreTouche(1)
    if (spriteEnnemi.x > joueur.x) {
        spriteEnnemi.x = spriteEnnemi.x + 22
    } else {
        spriteEnnemi.x = spriteEnnemi.x - 22
    }
    if (spriteEnnemi.y > joueur.y) {
        spriteEnnemi.y = spriteEnnemi.y + 22
    } else {
        spriteEnnemi.y = spriteEnnemi.y - 22
    }
})

info.onLifeZero(function () {
    // D'abord arrêter, puis montrer le texte : adieux bloque, et sans ce drapeau l'intelligence des ennemis et les tirs
    // continuent pendant le dialogue.
    partieEnCours = false
    // Faire de la place avant que le texte d'adieu et game.over réclament encore 9,6 Ko d'un seul bloc : l'obscurité
    // n'est plus nécessaire, le ramasse-miettes peut prendre son image.
    if (spriteObscurite != null) {
        spriteObscurite.destroy()
        spriteObscurite = null
    }
    imageObscurite = null
    Son.jouerFinPartie()
    // Une boîte à part au lieu de game.showLongText : A ne compte qu'après une seconde (voir
    // Catalogue.adieux dans menus.ts).
    Catalogue.adieux(Catalogue.formater(Catalogue.IdTexte.FIN_PARTIE, niveauActuel, info.score()))
    // game.over(false) n'enregistre pas le meilleur score. Sans cet appel, l'image du titre afficherait toujours un
    // record de zéro.
    info.saveHighScore()
    game.over(false)
})

// Disparition : un ennemi vaincu devient un court nuage d'étoiles jaunes et blanches. Ce n'est volontairement pas un
// effet de particules (chaque source de particules fait des copies d'image, voir plus haut), mais un seul sprite
// fantôme avec trois images fixes de la mémoire flash et une durée de vie limitée. Même beaucoup d'ennemis vaincus à la
// suite ne coûtent presque pas de mémoire.
function disparaitre (x: number, y: number, grand: boolean) {
    let nuage = sprites.create(IMAGE_NUAGE_1, SORTE_NUAGE)
    nuage.setFlag(SpriteFlag.Ghost, true)
    nuage.setPosition(x, y)
    nuage.z = 6
    nuage.lifespan = NUAGE_MS
    if (grand) {
        nuage.setScale(2)
    }
    nuages.push(nuage)
}

// Fait passer chaque nuage d'étoiles en cours à son image suivante, selon le temps qui lui reste, et oublie ceux qui
// sont finis. Tourne depuis game.onUpdate.
function avancerNuages () {
    let nuage: Sprite
    for (let i = nuages.length - 1; i >= 0; i--) {
        nuage = nuages[i]
        if (nuage.flags & sprites.Flag.Destroyed) {
            nuages.removeAt(i)
        } else if (nuage.lifespan < Math.idiv(NUAGE_MS, 3)) {
            if (nuage.image != IMAGE_NUAGE_3) {
                nuage.setImage(IMAGE_NUAGE_3)
            }
        } else if (nuage.lifespan < Math.idiv(NUAGE_MS * 2, 3)) {
            if (nuage.image != IMAGE_NUAGE_2) {
                nuage.setImage(IMAGE_NUAGE_2)
            }
        }
    }
}
