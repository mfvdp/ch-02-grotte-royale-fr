// Intro : l'histoire et la carte du studio avant l'image du titre. lancerEcranTitre() dans ecran-titre.ts l'appelle.
// Elle se joue après chaque allumage, mais pas quand on rejoue après la fin de la
// partie (voir Catalogue.versTitreDirect).
//
// L'intro se déroule dans cet ordre : histoire, carte du studio, carte du titre, panneaux du tutoriel.
//   jouer()             l'histoire du héros :
//     1. Nuit d'orage : un éclair arrache le château à l'obscurité.
//     2. La salle du trésor : le voleur prend la couronne au clair de lune.
//     3. Course de caméra dans le couloir : ses yeux, sa traînée d'or.
//     4. Une torche s'allume : « Sa piste s'arrête ici. »
//     5. La herse s'écrase, les éclats volent.
//     6. Le serment : la couronne flotte dans une guirlande de rayons.
//   afficherCartes()    la carte du studio « Calliope Hacker présente » (jouerLogo(), avec le personnage au bureau),
//                       puis la carte du titre et le fondu
//   Tutoriel.jouer()    les panneaux du tutoriel (fichier à part, tutoriel.ts)
//
// creerToile() fabrique une fois l'image plein écran toileEcran pour toutes les parties, fermerToile() fait le fondu et
// la libère. lancerEcranTitre() appelle les deux, et entre les deux, toileEcran ne doit jamais être libérée.
//
// On saute avec A, station par station : un appui pendant l'histoire saute à la carte du studio, un appui sur la carte
// du studio saute à la carte du titre, un appui sur la carte du titre saute aux panneaux du tutoriel, un appui pendant
// les panneaux du tutoriel saute à l'image du titre. Chaque station commence par commencerStation() : un vieil appui
// expire, et les appuis des premières BLOCAGE_MS millisecondes ne comptent pas. Sur la carte du studio, c'est le
// blocage plus long BLOCAGE_CARTE_STUDIO_MS qui vaut. Le Calliope Hacker y est à l'écran dès la première image : qui
// continue d'appuyer l'a donc vu. Le gestionnaire dans evenements.ts ne met aAppuye que sur l'appui, jamais pendant
// qu'on tient : qui garde A enfoncé doit d'abord lâcher. Ni tenir ni marteler ne saute donc deux stations d'un coup.
//
// Tout est toujours peint dans la même image plein écran toileEcran, pour que la mémoire de travail ne se remplisse pas
// de plusieurs images de 160 × 120 pixels. La seule image en mémoire flash est le Calliope Hacker
// (IMAGE_HACKER dans graphismes.ts).
namespace Intro {
    // Point de fuite de la course de caméra.
    const POINT_FUITE_X = 80
    const POINT_FUITE_Y = 54

    // Devient vrai dès que A arrête la station en cours.
    let sautDemande = false
    // A peut-il arrêter la station en cours ?
    let peutPasser = true
    // Jusqu'à ce moment (game.runtime), chaque appui expire.
    let finBlocageMs = 0
    // Pendant ce temps après un changement de station, aucun appui ne compte.
    const BLOCAGE_MS = 500
    // Sur la carte du studio « Calliope Hacker présente », A ne compte qu'après 1,5 s. Le personnage est là dès la
    // première image (jouerLogo()).
    const BLOCAGE_CARTE_STUDIO_MS = 1500

    // Commence une nouvelle station : un vieil appui expire, et pendant les BLOCAGE_MS millisecondes suivantes, aucun
    // appui ne compte. Pour l'instant, on peut sauter chaque station ; avec sautable = false, une station irait
    // toujours jusqu'au bout.
    export function commencerStation(sautable: boolean) {
        aAppuye = false
        sautDemande = false
        peutPasser = sautable
        finBlocageMs = game.runtime() + BLOCAGE_MS
    }

    // Évalue un appui : pendant le blocage, ou sur une station qui va jusqu'au bout, il expire. Sinon, il
    // arrête la station.
    function verifierAppui() {
        if (aAppuye) {
            if (peutPasser && game.runtime() >= finBlocageMs) {
                sautDemande = true
            } else {
                aAppuye = false
            }
        }
    }

    // Pour l'image du titre : un appui valable a-t-il eu lieu depuis commencerStation() ?
    export function appuye() {
        verifierAppui()
        return sautDemande
    }

    // ---- Petites aides ----

    // Attend par petits morceaux et retient un appui sur un bouton.
    export function attendre(dureeMs: number) {
        let reste = dureeMs
        let pas = 0
        while (reste > 0) {
            verifierAppui()
            if (sautDemande) {
                return
            }
            pas = 30
            if (reste < pas) {
                pas = reste
            }
            pause(pas)
            reste = reste - pas
        }
        verifierAppui()
    }

    // Montre à l'écran l'état actuel de toileEcran.
    export function montrer() {
        scene.setBackgroundImage(toileEcran)
    }

    // Les bandes de cinéma se ferment sur l'image fixe. Repeindre n'est pas nécessaire : les bandes mangent simplement
    // la dernière image de la scène. L'inverse de Cinema.ouvrirBandes().
    export function fermerBandes() {
        for (let f = 0; f < 4; f++) {
            if (sautDemande) {
                return
            }
            Cinema.dessinerCadre(0, 0, 8 + f * 17)
            montrer()
            attendre(60)
        }
    }

    // Le flash : une seule image d'un blanc éblouissant. Jamais deux, deux feraient un clignotement de stroboscope.
    export function flashBlanc() {
        if (sautDemande) {
            return
        }
        toileEcran.fill(1)
        Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
        montrer()
        attendre(60)
    }

    // A a-t-il arrêté la station en cours ? Les panneaux du tutoriel dans tutoriel.ts le demandent, mais ne peuvent pas
    // lire sautDemande directement : la variable est privée dans cet espace de noms.
    export function estSaute() {
        return sautDemande
    }

    // Fabrique l'image plein écran dans laquelle toute l'intro est peinte, et commence la
    // première station (l'histoire).
    export function creerToile() {
        commencerStation(true)
        toileEcran = image.create(160, 120)
        toileEcran.fill(15)
        scene.setBackgroundImage(toileEcran)
    }

    // Fait le fondu et libère l'image plein écran. S'exécute toujours, même quand A a tout arrêté, et alors seul le
    // fondu est sauté (break au lieu de return). Sans la libérer, 9,6 Ko resteraient en mémoire, et les deux images du
    // titre feraient exploser la mémoire.
    export function fermerToile() {
        for (let f = 0; f < 6; f++) {
            if (sautDemande) {
                break
            }
            assombrir()
            montrer()
            attendre(70)
        }
        Son.arreterMusique()
        scene.setBackgroundImage(image.create(16, 16))
        toileEcran = null
    }

    // Peint une image de sprite existante en taille double dans toileEcran. Ainsi, les panneaux du tutoriel n'ont pas
    // besoin d'une seule image de plus en mémoire flash. La couleur 0 est transparente et reste libre. sourceX et
    // sourceY comptent les pixels dans l'image source, cibleX et cibleY sont le coin en haut à gauche sur la toile.
    export function dessinerDouble(source: Image, cibleX: number, cibleY: number) {
        let couleur = 0
        for (let sourceY = 0; sourceY < source.height; sourceY++) {
            for (let sourceX = 0; sourceX < source.width; sourceX++) {
                couleur = source.getPixel(sourceX, sourceY)
                if (couleur != 0) {
                    toileEcran.fillRect(cibleX + sourceX * 2, cibleY + sourceY * 2, 2, 2, couleur)
                }
            }
        }
    }

    // Assombrit toute l'image d'un cran. L'ordre va du sombre au clair, sinon une couleur tomberait d'un coup tout en
    // bas de l'échelle, jusqu'au noir. Les couleurs 8 et 9 sont les bleus du héros : il se tient sur le dernier panneau
    // du tutoriel, donc il doit lui aussi s'enfoncer dans le noir, sinon son corps resterait clair pendant le fondu.
    export function assombrir() {
        toileEcran.replace(12, 15)
        toileEcran.replace(14, 12)
        toileEcran.replace(2, 12)
        toileEcran.replace(8, 12)
        toileEcran.replace(11, 14)
        toileEcran.replace(4, 14)
        toileEcran.replace(13, 11)
        toileEcran.replace(5, 4)
        toileEcran.replace(1, 13)
        toileEcran.replace(9, 8)
    }

    // La carte « Calliope Hacker présente » : CALLIOPE HACKER, après l'histoire

    // Un mot sous un éclat de lumière qui se promène : ce qui est près de lui s'illumine. Il est gradué selon la
    // distance comme la lumière de la torche (couleurPierre dans ecran-titre.ts). Seules les couleurs changent : ce
    // sont celles de la braise, 5, 4, 14 et 12.
    function dessinerMotLogo(mot: string, wy: number, grandeFonte: image.Font, eclatX: number) {
        let wx = Math.idiv(160 - mot.length * 12, 2)
        let distance = 0
        let couleur = 0
        for (let i = 0; i < mot.length; i++) {
            distance = valeurAbsolue(wx + i * 12 + 6 - eclatX)
            couleur = 12
            if (distance < 46) {
                couleur = 14
            }
            if (distance < 26) {
                couleur = 4
            }
            if (distance < 12) {
                couleur = 5
            }
            toileEcran.print(mot.charAt(i), wx + i * 12, wy, couleur, grandeFonte)
        }
    }

    // Hauteurs sur la carte du studio : le nom en haut, dessous le Calliope Hacker au bureau, tout en bas « présente ».
    // La carte de fin dans fin.ts s'en sert aussi.
    export const NOM_Y = 14
    export const HACKER_Y = 32
    export const PRESENTE_Y = 99
    const CENTRE_CRATERE_Y = 31

    // Le Calliope Hacker sur sa plaque : cadre doré (comme le tableau sur le mur dans le jeu), mur dans la lueur de
    // l'écran (couleur c) et devant lui le personnage de graphismes.ts. Sans la plaque, le pull noir disparaîtrait dans
    // le fond noir. La fonction peint de nouveau à chaque image de la carte du studio, après les effets et avant le
    // cadre. Ainsi, le personnage reste immobile dès la première image, et refroidir() ne peut pas le grignoter.
    export function dessinerStudio() {
        toileEcran.fillRect(45, 52, 70, 43, 4)
        toileEcran.fillRect(46, 53, 68, 41, 12)
        toileEcran.setPixel(45, 52, 5)
        toileEcran.setPixel(114, 52, 5)
        toileEcran.drawTransparentImage(IMAGE_HACKER, 48, 54)
    }

    // La carte du studio comme un petit film d'environ cinq secondes. Il vient après l'histoire, comme la carte
    // « Calliope Hacker présente ». Le Calliope Hacker est assis au bureau, devant sa plaque, dès la première image
    // (donc pas de fondu d'ouverture). Au-dessus de lui, le lettrage se construit : nuit étoilée, un point fonce vers
    // nous, IMPACT, CALLIOPE HACKER est blanc de chaleur dans le cratère, refroidit en or, un éclat de lumière passe
    // dessus, puis « présente » apparaît.
    export function jouerLogo() {
        if (sautDemande) {
            return
        }
        let grandeFonte = image.doubledFont(image.font8)
        // Acte 1 : nuit étoilée, un point dans le ciel grossit.
        Son.jouerApproche()
        for (let f = 0; f < 2; f++) {
            if (sautDemande) {
                return
            }
            toileEcran.fill(15)
            for (let k = 0; k < 30; k++) {
                toileEcran.setPixel(randint(0, 159), randint(8, 111), 12)
            }
            for (let k = 0; k < 5; k++) {
                toileEcran.setPixel(randint(0, 159), randint(8, 111), 13)
            }
            toileEcran.fillCircle(20, 12 + f * 3, 1 + f, 13)
            dessinerStudio()
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(320)
        }
        // Acte 2 : l'approche, la météorite tire sa queue.
        for (let f = 0; f < 7; f++) {
            if (sautDemande) {
                return
            }
            let mx = 20 + Math.idiv(60 * f, 6)
            let my = 12 + Math.idiv((CENTRE_CRATERE_Y - 12) * f, 6)
            toileEcran.fill(15)
            for (let k = 0; k < 20; k++) {
                toileEcran.setPixel(randint(0, 159), randint(8, 111), 12)
            }
            toileEcran.drawLine(20, 12, mx, my, 14)
            toileEcran.drawLine(21, 13, mx, my, 4)
            toileEcran.fillCircle(mx, my, f + 3, 4)
            toileEcran.fillCircle(mx, my, f + 1, 5)
            toileEcran.fillCircle(mx, my, Math.idiv(f + 1, 2), 1)
            Cinema.dessinerEtincelles(mx, my, 2, 6, 5)
            dessinerStudio()
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(55)
        }
        // Acte 3 : l'éclair, une seule image éblouissante (comme flashBlanc(), mais avec le personnage
        // devant sa plaque).
        Son.jouerImpact()
        if (sautDemande) {
            return
        }
        toileEcran.fill(1)
        dessinerStudio()
        Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
        montrer()
        attendre(60)
        // Acte 4 : l'onde de choc file vers l'extérieur, le nom est blanc de chaleur dans le cratère. dessinerOnde()
        // doit passer en premier, car elle efface son milieu. Le cadre vient en dernier.
        const COULEURS_CRATERE = [1, 1, 5, 5, 4]
        const COULEURS_COEUR = [1, 1, 1, 5, 5]
        const COULEURS_BORD = [1, 1, 5, 5, 4]
        for (let f = 0; f < 5; f++) {
            if (sautDemande) {
                return
            }
            toileEcran.fill(15)
            Cinema.dessinerOnde(80, CENTRE_CRATERE_Y, 20 + f * 28, 1, 5, 4)
            Cinema.dessinerOnde(80, CENTRE_CRATERE_Y, 4 + f * 22, 4, 14, 12)
            Cinema.dessinerGuirlande(80, CENTRE_CRATERE_Y, 40 + f * 26, f % 2, 5, 6)
            toileEcran.fillCircle(80, CENTRE_CRATERE_Y, 16 - f * 3, COULEURS_CRATERE[f])
            ecrireAvecContour(toileEcran, "CALLIOPE",
                NOM_Y, COULEURS_COEUR[f], COULEURS_BORD[f], grandeFonte)
            ecrireAvecContour(toileEcran, "HACKER",
                HACKER_Y, COULEURS_COEUR[f], COULEURS_BORD[f], grandeFonte)
            Cinema.dessinerEtincelles(80, CENTRE_CRATERE_Y, f + 1, 12, 1)
            dessinerStudio()
            Cinema.secouer(f, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(70)
        }
        // Acte 5 : la braise refroidit. Pas de fill() : la toile de l'acte 4 reste en place, refroidir() laisse
        // s'éteindre tout seul les ondes, les faisceaux et les étincelles restées derrière, pendant que les lettres
        // sont repeintes bien chaudes à chaque image.
        const COULEURS_BRAISE = [1, 1, 5, 5, 5, 5, 5]
        for (let f = 0; f < 7; f++) {
            if (sautDemande) {
                return
            }
            Cinema.refroidir()
            Cinema.dessinerEtincelles(80, CENTRE_CRATERE_Y, f + 6, 12, 1)
            ecrireAvecContour(toileEcran, "CALLIOPE", NOM_Y, COULEURS_BRAISE[f], 4, grandeFonte)
            ecrireAvecContour(toileEcran, "HACKER", HACKER_Y, COULEURS_BRAISE[f], 2, grandeFonte)
            if (f >= 3) {
                // Neuf petites flammes brûlent au-dessus des mots (quatre au-dessus de CALLIOPE, cinq
                // au-dessus de HACKER).
                for (let lx = 62; lx <= 98; lx += 12) {
                    toileEcran.drawLine(lx, NOM_Y - 1, lx + randint(0 - 1, 1), NOM_Y - 5, 4)
                    toileEcran.setPixel(lx, NOM_Y - 6, 5)
                }
                for (let lx = 56; lx <= 104; lx += 12) {
                    toileEcran.drawLine(lx, HACKER_Y - 1, lx + randint(0 - 1, 1), HACKER_Y - 5, 4)
                    toileEcran.setPixel(lx, HACKER_Y - 6, 5)
                }
            }
            dessinerStudio()
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(120)
        }
        // Acte 6 : l'éclat de lumière passe sur les mots, la lueur du fond continue de s'éteindre.
        Son.jouerStudio()
        for (let eclatX = 0 - 20; eclatX <= 190; eclatX += 22) {
            if (sautDemande) {
                return
            }
            Cinema.refroidir()
            dessinerMotLogo("CALLIOPE", NOM_Y, grandeFonte, eclatX)
            dessinerMotLogo("HACKER", HACKER_Y, grandeFonte, eclatX)
            dessinerStudio()
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(55)
        }
        // Acte 7 : une image fixe à contre-jour, avec l'accord du logo. 16 images de 130 ms font un bon deux secondes,
        // et l'accord (2,0 s) porte presque jusqu'à la fin. Ainsi, on peut vraiment lire « présente ».
        Son.jouerLogo()
        for (let f = 0; f < 16; f++) {
            if (sautDemande) {
                return
            }
            Cinema.refroidir()
            Cinema.dessinerGuirlande(80, CENTRE_CRATERE_Y + 20, 100, f % 2, 14, 8)
            ecrireAvecContour(toileEcran, "CALLIOPE", NOM_Y, 5, 4, grandeFonte)
            ecrireAvecContour(toileEcran, "HACKER", HACKER_Y, 4, 2, grandeFonte)
            dessinerStudio()
            if (f % 2 == 0) {
                Cinema.dessinerEtoile(26, NOM_Y + 4, 5, 1)
            } else {
                Cinema.dessinerEtoile(134, HACKER_Y + 10, 5, 1)
            }
            if (f >= 2) {
                ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.PRESENTE),
                    PRESENTE_Y, 13, 15, image.font8)
            }
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(130)
        }
        fermerBandes()
    }

    // Texte de l'histoire : deux lignes s'écrivent toutes seules image après image pendant que la scène
    // continue derrière elles.

    // Peint l'état du texte pour l'image f : la ligne 1 grandit dès la première image. La ligne 2 ne commence que quand
    // la ligne 1 est finie (huit images plus tard).
    function dessinerTexteHistoire(ligne1: string, ligne2: string, f: number, y1: number, y2: number) {
        let lettres1 = Math.min(f + 1, ligne1.length)
        let lettres2 = f + 1 - ligne1.length - 8
        if (lettres2 > ligne2.length) {
            lettres2 = ligne2.length
        }
        toileEcran.print(ligne1.substr(0, lettres1), Math.idiv(160 - ligne1.length * 6, 2), y1, 13, image.font8)
        if (lettres2 > 0) {
            toileEcran.print(ligne2.substr(0, lettres2),
                Math.idiv(160 - ligne2.length * 6, 2), y2, 13, image.font8)
        }
    }

    // Combien d'images la double ligne demande, temps de lecture compris.
    function nombreImagesHistoire(ligne1: string, ligne2: string) {
        return ligne1.length + 8 + ligne2.length + 16
    }

    // ---- 1. Nuit d'orage sur le château ----

    // Silhouette du château sur la colline, étoiles, pluie. clair = un éclair illumine le ciel, et le château se dresse
    // comme une découpe de papier noire devant le mur éblouissant.
    function dessinerChateau(clair: boolean) {
        toileEcran.fill(15)
        if (clair) {
            toileEcran.fillRect(0, 0, 160, 90, 13)
        } else {
            for (let k = 0; k < 14; k++) {
                toileEcran.setPixel(randint(0, 159), randint(0, 58), 1)
            }
        }
        // La colline. Dans l'éclair, elle devient une silhouette elle aussi.
        let colline = 12
        if (clair) {
            colline = 15
        }
        toileEcran.fillCircle(80, 152, 76, colline)
        // Donjon central, deux tours, créneaux : tous des contours noirs.
        toileEcran.fillRect(64, 46, 32, 34, 15)
        toileEcran.fillRect(52, 38, 12, 42, 15)
        toileEcran.fillRect(96, 38, 12, 42, 15)
        for (let zx = 52; zx < 64; zx += 5) {
            toileEcran.fillRect(zx, 33, 3, 6, 15)
        }
        for (let zx = 96; zx < 108; zx += 5) {
            toileEcran.fillRect(zx, 33, 3, 6, 15)
        }
        for (let zx = 64; zx < 96; zx += 6) {
            toileEcran.fillRect(zx, 41, 3, 6, 15)
        }
        // Drapeau sur le donjon central.
        toileEcran.drawLine(80, 46, 80, 34, 15)
        toileEcran.fillRect(81, 34, 6, 3, 2)
        // Fenêtres éclairées : la nuit, c'est la seule chose qu'on voit.
        toileEcran.fillRect(70, 56, 3, 4, 5)
        toileEcran.fillRect(84, 52, 3, 4, 5)
        toileEcran.fillRect(56, 46, 2, 3, 5)
        toileEcran.fillRect(100, 50, 2, 3, 5)
        // Pluie, plus claire dans l'éclair.
        let pluie = 12
        if (clair) {
            pluie = 11
        }
        for (let k = 0; k < 26; k++) {
            let rx = randint(0, 159)
            let ry = randint(0, 104)
            toileEcran.drawLine(rx, ry, rx - 2, ry + 6, pluie)
        }
        // Un banc de brouillard en bas : l'écriture y reste facile à lire.
        toileEcran.fillRect(0, 92, 160, 28, 15)
        for (let k = 0; k < 20; k++) {
            toileEcran.setPixel(randint(0, 159), 92 + randint(0, 3), 12)
        }
    }

    // Un éclair : un chemin en zigzag du ciel jusqu'à l'une des tours.
    function dessinerEclair() {
        let tourX = 58
        if (randint(0, 1) == 1) {
            tourX = 102
        }
        let departX = tourX + randint(0 - 30, 30)
        let departY = 0
        let arriveeX = 0
        let arriveeY = 0
        for (let k = 1; k <= 4; k++) {
            arriveeX = tourX + randint(0 - 14, 14)
            arriveeY = Math.idiv(34 * k, 4)
            if (k == 4) {
                arriveeX = tourX
            }
            toileEcran.drawLine(departX, departY, arriveeX, arriveeY, 1)
            toileEcran.drawLine(departX + 1, departY, arriveeX + 1, arriveeY, 13)
            departX = arriveeX
            departY = arriveeY
        }
    }

    function sceneChateau() {
        if (sautDemande) {
            return
        }
        let ligne1 = Catalogue.texte(Catalogue.IdTexte.INTRO_1)
        let ligne2 = Catalogue.texte(Catalogue.IdTexte.INTRO_2)
        let eclair = 0
        let proche = false
        let total = nombreImagesHistoire(ligne1, ligne2)
        for (let f = 0; f < total; f++) {
            if (sautDemande) {
                return
            }
            // Trois éclairs, chacun reste pendant deux images. Le troisième frappe tout près : une image d'un blanc
            // éblouissant, la caméra tremble.
            if (eclair == 0 && (f == 5 || f == 30 || f == total - 8)) {
                eclair = 2
                proche = f == total - 8
                Son.jouerTonnerre()
                if (proche) {
                    Son.jouerImpact()
                }
            }
            dessinerChateau(eclair > 0)
            if (eclair > 0) {
                dessinerEclair()
                eclair -= 1
            }
            dessinerTexteHistoire(ligne1, ligne2, f, 94, 103)
            if (proche && eclair == 1) {
                toileEcran.fill(1)
            }
            Cinema.secouer(8 - eclair * 3, Cinema.ouvrirBandes(f))
            montrer()
            attendre(70)
        }
        fermerBandes()
        attendre(900)
    }

    // ---- 2. La salle du trésor : le voleur prend la couronne ----

    // La couronne, peinte et pas une image en mémoire flash. cx est le milieu, cy la hauteur des pointes. scintillement
    // ajoute des reflets. La fin s'en sert aussi pour peindre le butin du voleur de la couronne.
    export function dessinerCouronne(cx: number, cy: number, scintillement: boolean) {
        toileEcran.fillRect(cx - 10, cy + 4, 20, 5, 5)
        toileEcran.fillRect(cx - 10, cy + 8, 20, 1, 4)
        toileEcran.fillRect(cx - 10, cy, 4, 4, 5)
        toileEcran.fillRect(cx - 2, cy - 3, 4, 7, 5)
        toileEcran.fillRect(cx + 6, cy, 4, 4, 5)
        toileEcran.fillRect(cx - 1, cy + 5, 2, 2, 2)
        if (scintillement) {
            toileEcran.setPixel(cx + 3, cy - 2, 1)
            toileEcran.setPixel(cx - 7, cy + 2, 1)
        }
    }

    // La salle du trésor : un rayon de lune tombe sur le piédestal. Le rayon s'élargit vers le sol, ce qui donne de la
    // perspective : deux trapèzes au lieu de deux rectangles.
    function dessinerSalleTresor() {
        toileEcran.fill(15)
        toileEcran.fillPolygon4(70, 0, 94, 0, 104, 94, 60, 94, 14)
        toileEcran.fillPolygon4(75, 0, 89, 0, 96, 94, 68, 94, 11)
        // La poussière danse dans la lumière.
        for (let k = 0; k < 8; k++) {
            toileEcran.setPixel(randint(69, 94), randint(4, 88), 13)
        }
        // Sol et piédestal.
        toileEcran.fillRect(0, 94, 160, 3, 12)
        toileEcran.fillRect(74, 78, 16, 4, 11)
        toileEcran.fillRect(77, 82, 10, 12, 12)
        toileEcran.fillRect(72, 92, 20, 2, 11)
    }

    // Le voleur : une silhouette noire avec une capuche et des yeux rouges. centreX et centreY sont le milieu du
    // corps du voleur.
    function dessinerVoleur(centreX: number, centreY: number) {
        // D'abord le bord gris, puis le noir à l'intérieur.
        toileEcran.fillCircle(centreX, centreY - 10, 6, 12)
        toileEcran.fillCircle(centreX, centreY, 9, 12)
        toileEcran.fillRect(centreX - 9, centreY, 18, 12, 12)
        toileEcran.fillCircle(centreX, centreY - 10, 5, 15)
        toileEcran.fillCircle(centreX, centreY, 8, 15)
        toileEcran.fillRect(centreX - 8, centreY, 16, 11, 15)
        // Les yeux brillent.
        toileEcran.fillRect(centreX - 3, centreY - 11, 2, 2, 2)
        toileEcran.fillRect(centreX + 1, centreY - 11, 2, 2, 2)
    }

    function sceneVoleur() {
        if (sautDemande) {
            return
        }
        let ligne1 = Catalogue.texte(Catalogue.IdTexte.INTRO_3)
        let ligne2 = Catalogue.texte(Catalogue.IdTexte.INTRO_4)
        // La couronne brille toute seule au clair de lune.
        for (let f = 0; f < 7; f++) {
            if (sautDemande) {
                return
            }
            dessinerSalleTresor()
            dessinerCouronne(82, 69, f % 2 == 0)
            Cinema.dessinerCadre(0, 0, Cinema.ouvrirBandes(f))
            montrer()
            attendre(200)
        }
        // Le voleur se faufile par la droite.
        for (let f = 0; f < 9; f++) {
            if (sautDemande) {
                return
            }
            dessinerSalleTresor()
            dessinerCouronne(82, 69, f % 3 == 0)
            dessinerVoleur(146 - f * 6, 82)
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(100)
        }
        if (sautDemande) {
            return
        }
        // Il l'attrape ! Le rayon s'embrase, des rayons de lumière s'ouvrent en éventail vers le bas, la couronne est
        // sur la capuche.
        Son.jouerSouffle()
        dessinerSalleTresor()
        toileEcran.fillPolygon4(64, 0, 100, 0, 116, 94, 48, 94, 13)
        Cinema.dessinerFaisceau(82, 0, 3, 120, 20, 1)
        Cinema.dessinerFaisceau(82, 0, 4, 120, 24, 1)
        Cinema.dessinerFaisceau(82, 0, 5, 120, 20, 1)
        dessinerVoleur(94, 82)
        dessinerCouronne(94, 55, true)
        Cinema.dessinerEtoile(94, 52, 8, 1)
        Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
        montrer()
        attendre(280)
        // Fuite vers la gauche, des étincelles d'or volent derrière lui.
        for (let f = 0; f < 6; f++) {
            if (sautDemande) {
                return
            }
            dessinerSalleTresor()
            let voleurX = 94 - (f + 1) * 22
            dessinerVoleur(voleurX, 82)
            dessinerCouronne(voleurX, 55, true)
            Cinema.dessinerEtoile(voleurX, 55, 5, 1)
            toileEcran.drawLine(voleurX + 12, 74, voleurX + 30, 74, 12)
            toileEcran.drawLine(voleurX + 14, 84, voleurX + 32, 84, 12)
            for (let k = 0; k < 5; k++) {
                toileEcran.setPixel(voleurX + 12 + randint(0, 40), 60 + randint(0, 30), 5)
            }
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(80)
        }
        // Le piédestal vide reste derrière lui, les lignes s'écrivent toutes seules.
        let total = nombreImagesHistoire(ligne1, ligne2)
        for (let f = 0; f < total; f++) {
            if (sautDemande) {
                return
            }
            dessinerSalleTresor()
            dessinerTexteHistoire(ligne1, ligne2, f, 96, 104)
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(70)
        }
        fermerBandes()
        attendre(900)
    }

    // ---- 6. Le serment : la couronne dans une guirlande de rayons ----

    // La couronne volée flotte dans un dôme de lumière : 16 faisceaux de lumière en deux guirlandes qui semblent
    // tourner l'une contre l'autre.
    function dessinerSerment(f: number) {
        toileEcran.fill(15)
        Cinema.dessinerGuirlande(80, 36, 62, f % 2, 4, 6)
        Cinema.dessinerGuirlande(80, 36, 40, 1 - f % 2, 5, 3)
        let r = 16 + (f % 2) * 2
        toileEcran.fillCircle(80, 36, r, 4)
        toileEcran.fillCircle(80, 36, r - 2, 15)
        dessinerCouronne(80, 30, f % 2 == 0)
        if (f % 2 == 0) {
            Cinema.dessinerEtoile(80, 30, 7, 1)
        }
        // Des étincelles d'or dansent autour de la couronne.
        for (let k = 0; k < 6; k++) {
            toileEcran.setPixel(80 + randint(0 - 26, 26), 36 + randint(0 - 20, 20), 5)
        }
    }

    function sceneSerment() {
        if (sautDemande) {
            return
        }
        let ligne1 = Catalogue.texte(Catalogue.IdTexte.INTRO_5)
        let ligne2 = Catalogue.texte(Catalogue.IdTexte.INTRO_6)
        Son.jouerStudio()
        let total = nombreImagesHistoire(ligne1, ligne2)
        for (let f = 0; f < total; f++) {
            if (sautDemande) {
                return
            }
            dessinerSerment(f)
            dessinerTexteHistoire(ligne1, ligne2, f, 78, 94)
            Cinema.dessinerCadre(0, 0, Cinema.ouvrirBandes(f))
            montrer()
            attendre(70)
        }
        fermerBandes()
        attendre(400)
    }

    // ---- 7. La carte du titre avec le nom du jeu ----
    // La même suite que sur la carte du studio (jouerLogo) : flash, onde, braise. Elle termine l'histoire.
    function sceneTitre() {
        if (sautDemande) {
            return
        }
        let grandeFonte = image.doubledFont(image.font8)
        // a) Le dôme de lumière se construit à partir du noir.
        for (let f = 0; f < 3; f++) {
            if (sautDemande) {
                return
            }
            toileEcran.fill(15)
            Cinema.dessinerGuirlande(80, 46, 60 + f * 30, f % 2, 14, 8 + f * 4)
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(100)
        }
        // b) Le flash.
        Son.jouerImpact()
        flashBlanc()
        // c) Onde de choc, le titre est blanc de chaleur.
        const COULEURS_COEUR = [1, 1, 5, 5]
        const COULEURS_BORD = [1, 5, 5, 4]
        for (let f = 0; f < 4; f++) {
            if (sautDemande) {
                return
            }
            toileEcran.fill(15)
            Cinema.dessinerOnde(80, 46, 22 + f * 30, 1, 5, 4)
            Cinema.dessinerGuirlande(80, 46, 60 + f * 22, f % 2, 4, 8)
            ecrireAvecContour(toileEcran,
                Jeu.LIGNES_TITRE[0], 30, COULEURS_COEUR[f], COULEURS_BORD[f], grandeFonte)
            ecrireAvecContour(toileEcran,
                Jeu.LIGNES_TITRE[1], 50, COULEURS_COEUR[f], COULEURS_BORD[f], grandeFonte)
            Cinema.dessinerEtincelles(80, 46, f + 1, 12, 1)
            Cinema.secouer(f, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(80)
        }
        // d) Refroidissement et image fixe avec une fanfare.
        Son.jouerFanfare()
        for (let f = 0; f < 6; f++) {
            if (sautDemande) {
                return
            }
            Cinema.refroidir()
            ecrireAvecContour(toileEcran, Jeu.LIGNES_TITRE[0], 30, 5, 4, grandeFonte)
            ecrireAvecContour(toileEcran, Jeu.LIGNES_TITRE[1], 50, 4, 2, grandeFonte)
            if (f % 2 == 0) {
                Cinema.dessinerEtoile(40, 34, 6, 1)
            } else {
                Cinema.dessinerEtoile(120, 58, 6, 1)
            }
            if (f >= 2) {
                ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.CREDIT), 78, 13, 15, image.font8)
            }
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(160)
        }
        // Pas de fermerBandes() : fonduFinal() fait le fondu et le rideau.
    }

    // ---- 3. La course de caméra dans le couloir ----

    // Un anneau de mur : plus il est grand, plus il est proche et clair. rythme rend les anneaux tour à tour sombres et
    // s'occupe des torches.
    function dessinerAnneauCouloir(cx: number, cy: number, taille: number, rythme: number) {
        let h = Math.idiv(taille * 3, 4)
        let couleur = 15
        let tx = 0
        let ty = 0
        let r = 0
        if (taille > 95) {
            couleur = 11
        } else if (taille > 46) {
            couleur = 14
        } else if (taille > 20) {
            couleur = 12
        }
        if (rythme % 2 == 1) {
            couleur = pierreSombre(couleur)
        }
        toileEcran.fillRect(cx - taille, cy - h, taille * 2, h * 2, couleur)
        // Sur un anneau sur trois, une torche est accrochée à gauche et à droite.
        if (taille > 22 && rythme % 3 == 1) {
            tx = Math.idiv(taille * 8, 10)
            ty = cy - Math.idiv(h, 3)
            r = Math.idiv(taille, 14)
            if (r < 1) {
                r = 1
            }
            toileEcran.fillCircle(cx - tx, ty, r + 2, 4)
            toileEcran.fillCircle(cx - tx, ty, r, 5)
            toileEcran.fillCircle(cx + tx, ty, r + 2, 4)
            toileEcran.fillCircle(cx + tx, ty, r, 5)
        }
    }

    function sceneCouloir() {
        if (sautDemande) {
            return
        }
        // etirement va de 100 à 130, puis recommence au début. Comme les anneaux sont exactement dans un rapport de 1,3
        // les uns aux autres, le saut ne se voit pas. Le code compte seulement cycle vers le haut.
        let etirement = 100
        let vitesse = 4
        let cycle = 0
        let balancement = 0
        let soulevement = 0
        let cx = 0
        let cy = 0
        let taille = 0
        let anneau = 0
        for (let f = 0; f < 32; f++) {
            if (sautDemande) {
                return
            }
            toileEcran.fill(15)
            // Un petit balancement, comme si quelqu'un marchait vraiment là.
            balancement = f % 8
            if (balancement > 4) {
                balancement = 8 - balancement
            }
            cx = POINT_FUITE_X - 2 + balancement
            soulevement = f % 6
            if (soulevement > 3) {
                soulevement = 6 - soulevement
            }
            cy = POINT_FUITE_Y - 1 + soulevement
            taille = Math.idiv(300 * etirement, 100)
            anneau = 0
            while (taille > 7) {
                dessinerAnneauCouloir(cx, cy, taille, anneau + cycle)
                taille = Math.idiv(taille * 10, 13)
                anneau = anneau + 1
            }
            // Les bords du couloir courent vers les quatre coins.
            toileEcran.drawLine(0, 0, cx, cy, 15)
            toileEcran.drawLine(159, 0, cx, cy, 15)
            toileEcran.drawLine(0, 119, cx, cy, 15)
            toileEcran.drawLine(159, 119, cx, cy, 15)
            // Loin devant, le voleur file dans le noir : ses yeux rouges clignotent au point de fuite ...
            if (f >= 12 && f <= 26 && f % 3 != 0) {
                toileEcran.fillRect(cx - 3, cy - 2, 2, 2, 2)
                toileEcran.fillRect(cx + 2, cy - 2, 2, 2, 2)
            }
            // ... et son butin perd des étincelles d'or.
            if (f >= 6) {
                for (let k = 0; k < 3; k++) {
                    toileEcran.setPixel(cx + randint(0 - 12, 12), cy + randint(0 - 8, 8), 5)
                }
            }
            // L'histoire défile comme un sous-titre sous la course. C'est une seule ligne pour toute la course, deux à
            // la suite iraient trop vite pour être lues.
            if (f >= 8) {
                ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.INTRO_7), 96, 5, 15, image.font8)
            }
            // Le balancement devient une caméra à la main : le cadre sursaute de côté avec lui, aucune coordonnée de la
            // scène ne change.
            Cinema.dessinerCadre(balancement - 2, 0, Cinema.ouvrirBandes(f))
            montrer()
            attendre(55)
            etirement = etirement + vitesse
            if (etirement >= 130) {
                etirement = etirement - 30
                cycle = cycle + 1
            }
            // Cela va de plus en plus vite vers le bas.
            if (f % 11 == 10) {
                vitesse = vitesse + 2
            }
        }
        if (sautDemande) {
            return
        }
        // Laisse la dernière image en place un moment pour que la phrase fasse son effet.
        attendre(800)
        fermerBandes()
    }

    // ---- 4. La chambre derrière le couloir ----

    // Mur, sol, voûte et deux torches.
    function dessinerChambre(vacillement: number) {
        dessinerMaconnerie(toileEcran, 0, 96, 28 - vacillement * 2, 132 + vacillement * 2, 42)
        dessinerSol(toileEcran, 96, 28, 132)
        // Voûte : d'abord le cadre de pierre, puis le noir à l'intérieur.
        toileEcran.fillRect(62, 38, 36, 58, 12)
        toileEcran.fillCircle(80, 40, 18, 12)
        toileEcran.fillRect(65, 41, 30, 55, 15)
        toileEcran.fillCircle(80, 42, 15, 15)
        // Deux marches devant la voûte.
        toileEcran.fillRect(66, 92, 28, 2, 12)
        toileEcran.fillRect(62, 94, 36, 2, 11)
        dessinerTorche(toileEcran, 28, vacillement, 42)
        dessinerTorche(toileEcran, 132, vacillement, 42)
        // Des flaques de lumière sur le sol.
        toileEcran.fillRect(19, 96, 19, 2, 5)
        toileEcran.fillRect(123, 96, 19, 2, 5)
        // Des os épars dans la poussière.
        toileEcran.fillRect(40, 104, 11, 2, 1)
        toileEcran.fillRect(44, 100, 2, 6, 1)
        toileEcran.fillCircle(112, 107, 4, 13)
        toileEcran.setPixel(110, 106, 15)
        toileEcran.setPixel(114, 106, 15)
    }

    // Peint en noir une ligne de pixels à gauche et à droite du cercle de lumière.
    function dessinerLigneIris(yy: number, cx: number, demiLargeur: number) {
        let gauche = cx - demiLargeur
        if (gauche > 0) {
            toileEcran.fillRect(0, yy, gauche, 1, 15)
        }
        let droite = cx + demiLargeur
        if (droite < 160) {
            toileEcran.fillRect(droite, yy, 160 - droite, 1, 15)
        }
    }

    // Tout ce qui est hors du cercle est peint en noir. On dirait que la lumière de la torche n'allait pas plus loin.
    // Le panneau du tutoriel « LE DONJON » dans tutoriel.ts utilise aussi ce cercle de lumière. Le calcul n'emploie que
    // des nombres entiers et pas de Math.sqrt : la demi-largeur demiLargeur ne fait que diminuer pendant que la
    // distance dy depuis le milieu augmente, elle ne remonte jamais. Il suffit donc de r pas vers le bas sur toute
    // l'image, au lieu de 120 racines carrées.
    export function dessinerIris(cx: number, cy: number, r: number) {
        let rayonCarre = r * r
        let demiLargeur = r
        let ligne = 0
        for (let dy = 0; dy < 120; dy++) {
            while (demiLargeur > 0 && demiLargeur * demiLargeur + dy * dy > rayonCarre) {
                demiLargeur = demiLargeur - 1
            }
            ligne = cy - dy
            if (ligne >= 0 && ligne < 120) {
                dessinerLigneIris(ligne, cx, demiLargeur)
            }
            ligne = cy + dy
            if (dy > 0 && ligne >= 0 && ligne < 120) {
                dessinerLigneIris(ligne, cx, demiLargeur)
            }
        }
    }

    function sceneChambre() {
        if (sautDemande) {
            return
        }
        let r = 0
        Son.jouerTorche()
        for (let f = 0; f < 18; f++) {
            if (sautDemande) {
                return
            }
            dessinerChambre(f % 2)
            // Lumière de torche poussiéreuse : deux faisceaux tombent dans la pièce, et l'iris les coupe tout de suite
            // au cercle de lumière.
            Cinema.dessinerFaisceau(28, 44, 3, 80, 12, 14)
            Cinema.dessinerFaisceau(132, 44, 5, 80, 12, 14)
            // L'étincelle prend feu lentement, puis devient vite brillante.
            r = Math.idiv(f * f, 2) + randint(0, 3)
            if (r > 135) {
                r = 135
            }
            // Le cercle de lumière se promène de la torche de gauche vers le milieu.
            dessinerIris(28 + Math.idiv(f * 52, 17), 44, r)
            Cinema.dessinerCadre(0, 0, Cinema.ouvrirBandes(f))
            montrer()
            attendre(60)
        }
        if (sautDemande) {
            return
        }
        ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.INTRO_8), 100, 5, 15, image.font8)
        Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
        montrer()
        attendre(700)
        if (sautDemande) {
            return
        }
        // Deux yeux rouges s'allument un instant dans la voûte noire, la caméra recule d'un coup ...
        toileEcran.fillRect(76, 58, 2, 2, 2)
        toileEcran.fillRect(82, 58, 2, 2, 2)
        Cinema.secouer(3, Cinema.HAUTEUR_BANDE)
        montrer()
        attendre(400)
        // ... et ils ont disparu de nouveau.
        toileEcran.fillRect(76, 58, 2, 2, 15)
        toileEcran.fillRect(82, 58, 2, 2, 15)
        Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
        montrer()
        attendre(600)
        fermerBandes()
        attendre(400)
    }

    // ---- 5. La herse ----

    // La herse de fer. h est la hauteur des pointes des barreaux.
    function dessinerHerse(h: number) {
        // Les traverses horizontales tombent avec elle.
        for (let barreY = h - 118; barreY < h - 8; barreY += 30) {
            if (barreY > 0 - 5) {
                toileEcran.fillRect(0, barreY, 160, 5, 11)
                toileEcran.fillRect(0, barreY, 160, 1, 13)
                toileEcran.fillRect(0, barreY + 4, 160, 1, 12)
            }
        }
        // Les barreaux verticaux avec leurs pointes.
        for (let bx = 5; bx < 158; bx += 14) {
            toileEcran.fillRect(bx, 0, 5, h - 5, 11)
            toileEcran.fillRect(bx, 0, 1, h - 5, 13)
            toileEcran.fillRect(bx + 4, 0, 1, h - 5, 12)
            toileEcran.drawLine(bx, h - 5, bx + 2, h, 11)
            toileEcran.drawLine(bx + 4, h - 5, bx + 2, h, 12)
            toileEcran.drawLine(bx + 1, h - 5, bx + 2, h - 1, 13)
        }
    }

    // La poussière qui jaillit à l'impact.
    function dessinerPoussiere(f: number) {
        let hauteur = 6 + f * 4
        for (let k = 0; k < 20; k++) {
            toileEcran.fillRect(randint(0, 155), 112 - randint(0, hauteur), 3, 2, 11)
        }
    }

    function sceneHerse() {
        if (sautDemande) {
            return
        }
        let h = 0
        let numeroImage = 0
        // La herse fonce vers le bas, des traînées la suivent.
        for (h = 10; h < 118; h += 13) {
            if (sautDemande) {
                return
            }
            dessinerChambre(h % 2)
            dessinerHerse(h)
            for (let bx = 7; bx < 158; bx += 14) {
                toileEcran.drawLine(bx, h - 26, bx, h - 10, 13)
            }
            Cinema.dessinerCadre(0, 0, Cinema.ouvrirBandes(numeroImage))
            numeroImage += 1
            montrer()
            attendre(30)
        }
        Son.jouerPorteFermee()
        Son.jouerImpact()
        // Le flash : une image d'un blanc éblouissant.
        flashBlanc()
        // Impact : la herse rebondit une fois, la poussière s'envole, des éclats de pierre pleuvent, une onde de
        // pression de pierre s'éloigne du sol, la caméra tremble puis se calme.
        for (let f = 0; f < 6; f++) {
            if (sautDemande) {
                return
            }
            h = 118
            if (f == 1) {
                h = 112
            }
            dessinerChambre(f % 2)
            dessinerHerse(h)
            dessinerPoussiere(f)
            for (let k = 0; k < 8; k++) {
                toileEcran.fillRect(randint(0, 157), randint(0, 24) + f * 14, 2, 2, 12)
            }
            // Les étincelles de pierre sont grises, pas dorées.
            Cinema.dessinerAnneau(80, 118, 24 + f * 22, 11)
            Cinema.dessinerEtincelles(80, 114, f + 1, 12, 11)
            Cinema.secouer(f, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(70)
        }
        // Mots de la fin derrière les barreaux de la herse : d'abord la menace, puis la réponse courageuse du héros.
        // Chaque phrase reçoit quatre images de 300 ms, ce qui laisse assez de temps pour la lire.
        for (let f = 0; f < 8; f++) {
            if (sautDemande) {
                return
            }
            dessinerChambre(f % 2)
            dessinerHerse(118)
            if (f < 4) {
                ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.INTRO_9), 100, 2, 15, image.font8)
            } else {
                ecrireAvecContour(toileEcran, Catalogue.texte(Catalogue.IdTexte.INTRO_10), 100, 5, 15, image.font8)
            }
            Cinema.dessinerCadre(0, 0, Cinema.HAUTEUR_BANDE)
            montrer()
            attendre(300)
        }
        fermerBandes()
    }

    // ---- 8. Fondu final ----
    function fonduFinal() {
        if (sautDemande) {
            return
        }
        for (let f = 0; f < 6; f++) {
            assombrir()
            // Les bandes de cinéma se ferment avec le fondu.
            Cinema.dessinerCadre(0, 0, 8 + f * 10)
            montrer()
            attendre(70)
            if (sautDemande) {
                return
            }
        }
    }

    // Joue l'histoire. Un appui sur A saute à la carte du studio. creerToile() fabrique la toile et
    // la première station.
    export function jouer() {
        Son.lancerMusiqueIntro()
        sceneChateau()
        sceneVoleur()
        sceneCouloir()
        sceneChambre()
        sceneHerse()
        sceneSerment()
    }

    // La carte du studio « Calliope Hacker présente » avec le personnage, puis la carte du titre et le fondu. Il y a
    // deux stations : un appui sur la carte du studio (à partir de BLOCAGE_CARTE_STUDIO_MS) saute à la carte du titre,
    // un appui sur la carte du titre (à partir de BLOCAGE_MS) saute aux panneaux du tutoriel. La carte du studio a un
    // son à elle, donc la musique de l'intro se tait dessous. Elle repart avec la carte du titre et porte les panneaux
    // du tutoriel, fermerToile() l'arrête.
    export function afficherCartes() {
        commencerStation(true)
        finBlocageMs = game.runtime() + BLOCAGE_CARTE_STUDIO_MS
        Son.arreterMusique()
        jouerLogo()
        commencerStation(true)
        Son.lancerMusiqueIntro()
        sceneTitre()
        fonduFinal()
    }
}
