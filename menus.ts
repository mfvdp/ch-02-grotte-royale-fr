// Menu de pause et écran de fin du jeu, avec les textes de textes.ts.
namespace Catalogue {
    function menuPause(): void {
        if (menuOuvert) return
        menuOuvert = true
        game.pushScene()
        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
        let selection = 0
        const nombre = 2
        const r = scene.createRenderable(250, function (cible: Image) {
            cible.fill(15)
            cible.printCenter(texte(IdTexte.PAUSE), 18, 5, image.font8)
            cible.printCenter(texte(IdTexte.REPRENDRE), 46, selection == 0 ? 5 : 1, image.font8)
            cible.printCenter(formater(IdTexte.ETAT_SON, music.volume()), 64,
                selection == nombre - 1 ? 5 : 1, image.font8)
        })
        while (controller.menu.isPressed() || controller.A.isPressed() || controller.B.isPressed()) pause(20)
        let haut = false
        let bas = false
        let a = false
        let fermer = false
        while (!fermer) {
            const u = controller.up.isPressed()
            const d = controller.down.isPressed()
            const appuye = controller.A.isPressed()
            if (u && !haut) selection = (selection + nombre - 1) % nombre
            if (d && !bas) selection = (selection + 1) % nombre
            if (controller.B.isPressed() || controller.menu.isPressed()) fermer = true
            if (appuye && !a) {
                if (selection == 0) fermer = true
                else if (selection == nombre - 1) {
                    const v = music.volume() == 0 ? 128 : 0
                    music.setVolume(v)
                    settings.writeNumber("#volume", v)
                }
            }
            haut = u
            bas = d
            a = appuye
            pause(20)
        }
        while (controller.A.isPressed() || controller.B.isPressed() || controller.menu.isPressed()) pause(20)
        r.destroy()
        game.popScene()
        menuOuvert = false
    }
    export function installerMenus(): void {
        controller.menu.onEvent(ControllerButtonEvent.Pressed, menuPause)
        game.onGameOver(function (aGagne: boolean) {
            info.saveHighScore()
            const points = info.score()
            const record = info.highScore()
            game.pushScene()
            controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
            scene.createRenderable(250, function (cible: Image) {
                cible.fill(15)
                cible.printCenter(texte(aGagne ? IdTexte.GAGNE : IdTexte.PARTIE_TERMINEE),
                    26, aGagne ? 5 : 2, image.font8)
                cible.printCenter(formater(IdTexte.POINTS, points), 52, 1, image.font8)
                cible.printCenter(formater(IdTexte.RECORD, record), 69, 5, image.font8)
                cible.printCenter(texte(IdTexte.REJOUER), 98, 1, image.font8)
            })
            attendreNouvelAppuiA(1000)
            // Après la fin de la partie, rejouer ramène à l'image du titre et ne rejoue pas l'intro (voir marqueRejouer
            // dans textes.ts). La courte pause laisse au simulateur le temps d'enregistrer la marque : dans le
            // navigateur, control.reset() recharge toute la page, et les réglages n'y sont écrits que toutes
            // les 200 ms. Sur la console, ils sont écrits tout de suite dans la mémoire flash.
            settings.writeNumber(marqueRejouer, 1)
            pause(300)
            control.reset()
        })
    }

    // Attend un nouvel appui sur A, mais pas avant que blocageMs millisecondes soient passées. A est aussi le bouton de
    // tir : sans cette attente, un joueur qui garde A enfoncé ou qui appuie à toute vitesse sur le dernier coup
    // sauterait le texte de fin sans le lire.
    export function attendreNouvelAppuiA(blocageMs: number): void {
        const finBlocageMs = control.millis() + blocageMs
        let a = true
        while (true) {
            const appuye = controller.A.isPressed()
            if (appuye && !a && control.millis() >= finBlocageMs) break
            a = appuye
            pause(20)
        }
    }

    // Coupe un texte en lignes d'au plus largeur caractères. Après un point, une nouvelle ligne commence toujours, pour
    // que « Points : 345 » reste ensemble. Un deux-points avec une espace devant (comme on l'écrit en français) reste
    // avec le mot qui le précède.
    export function couperTexte(message: string, largeur: number): string[] {
        const mots = message.split(" ")
        const lignes: string[] = []
        let ligne = ""
        for (let i = 0; i < mots.length; i++) {
            let mot = mots[i]
            if (i + 1 < mots.length && mots[i + 1] == ":") {
                mot = mot + " :"
                i++
            }
            if (ligne.length == 0) ligne = mot
            else if (ligne.length + 1 + mot.length <= largeur) ligne = ligne + " " + mot
            else {
                lignes.push(ligne)
                ligne = mot
            }
            if (mot.charAt(mot.length - 1) == ".") {
                lignes.push(ligne)
                ligne = ""
            }
        }
        if (ligne.length > 0) lignes.push(ligne)
        return lignes
    }

    // Montre le texte de fin de partie (IdTexte.FIN_PARTIE) dans une boîte à part, au-dessus de l'image figée du jeu. A
    // ne compte qu'après une seconde, pour que personne ne saute le texte et les points par accident. Ensuite,
    // l'invite IdTexte.APPUYER_A apparaît.
    export function adieux(message: string): void {
        const lignes = couperTexte(message, 22)
        game.pushScene()
        game.currentScene().flags |= scene.Flag.SeeThrough
        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
        let pret = false
        const h = lignes.length * 11 + 26
        const haut = (120 - h) >> 1
        const r = scene.createRenderable(250, function (cible: Image) {
            cible.fillRect(8, haut, 144, h, 1)
            cible.drawRect(8, haut, 144, h, 12)
            cible.drawRect(9, haut + 1, 142, h - 2, 11)
            for (let i = 0; i < lignes.length; i++) {
                cible.printCenter(lignes[i], haut + 8 + i * 11, 15, image.font8)
            }
            if (pret) cible.printCenter(texte(IdTexte.APPUYER_A), haut + h - 14, 12, image.font8)
        })
        control.runInParallel(function () {
            pause(1000)
            pret = true
        })
        attendreNouvelAppuiA(1000)
        r.destroy()
        game.popScene()
    }
}
