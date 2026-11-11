// Son : tous les sons et toute la musique au même endroit. Le reste du jeu n'appelle que ces fonctions et ne sait pas
// comment un bruit est fabriqué.
//
// Pourquoi pas music.playTone() ? Cette fonction retient celui qui l'appelle aussi longtemps que dure la note (pour au
// plus 2000 ms, elle est suivie d'une pause). Or nos bruits jouent en plein milieu du pas de la physique, dans les
// gestionnaires de contacts. Le jeu s'arrêterait un instant à chaque pièce ramassée.
//
// À la place, nous utilisons music.Melody :
//   new music.Melody(texte)   fabrique un son à partir d'un court motif écrit
//   melodie.play(volume)      joue une fois en arrière-plan
//   melodie.loop(volume)      joue en boucle en arrière-plan
//   melodie.stop()            l'arrête
//
// play() et loop() lancent la lecture avec control.runInParallel() dans un fil à part. Celui qui appelle continue tout
// de suite, et c'est exactement ce qu'il nous faut.
//
// Le motif écrit (la notation de la musique) est fait de mots :
//   ~n            forme d'onde : 1 triangle, 2 dent de scie, 3 sinus, 4 bruit réglable, 5 bruit blanc,
//                 11 à 15 carré, 16 à 18 carré filtré
//   @a,d,s,r      enveloppe : attaque en ms, déclin en ms, volume tenu de 0 à 255, relâchement en ms
//   !hz,ms        une note de fréquence et de durée fixes
//   ^hz           fréquence visée : la note glisse jusque-là
//   C4:2          note do dans l'octave 4, durée 2 (4 = un temps)
//   R:2           silence
//   -180          tempo en temps par minute
//
// Un mot sans note et sans « ! » ne joue rien, il change seulement la forme d'onde, l'enveloppe ou le tempo. C'est
// pourquoi on peut composer un son à partir de plusieurs parties.
//
// Attention aux glissandos : avec « ^ », le relâchement r doit valoir 0. Sinon, l'analyseur continue de calculer la
// rampe de fréquence après la fin de la note et finit dans les nombres négatifs (un vilain petit cri).
namespace Son {
    // Volumes. À la fin, l'analyseur calcule (valeur × music.volume()) >> 8, ce sont donc des niveaux relatifs.
    // VOLUME_PLEIN est pour les grands moments.
    const VOLUME_PLEIN = 255
    // Récompenses normales.
    const VOLUME_MOYEN = 200
    // Bruits très fréquents.
    const VOLUME_FAIBLE = 150
    // Musique du titre.
    const VOLUME_TITRE = 165
    // Boucle dans le donjon, elle joue tout le temps.
    const VOLUME_MUSIQUE = 120
    // Deuxième voix : elle soutient seulement et ne passe pas devant.
    const VOLUME_BASSE = 115
    // Accents lointains au-dessus de la boucle de l'intro.
    const VOLUME_LOIN = 95

    // Les sons. Chacun est un objet Melody à lui, pour qu'un nouvel appel ne coupe que lui-même et pas
    // les autres bruits.

    // ---- Combat ----
    // Boule de feu : un court « pschiou » brillant qui s'éteint vite.
    const SON_BOULE_FEU = new music.Melody("~15 @1,8,120,0 !1150,50^380")
    // Ennemi touché mais encore là : un coup bref et craquant.
    const SON_COUP = new music.Melody("~4 @0,6,180,0 !520,45^200")
    // Rebondi : d'abord un clic métallique, puis un ronronnement qui monte, ce qui sonne comme un ricochet.
    const SON_BLOQUE = new music.Melody("~4 @0,0,255,0 !170,22 ~15 @0,3,110,0 !560,34^1600")
    // L'ennemi disparaît : un nuage de bruit qui tombe, puis deux notes claires.
    const SON_ENNEMI_DISPARAIT = new music.Melody("~4 @0,0,255,0 !640,50^90 ~15 @1,8,110,0 !784,40 !1046,55")
    // Le boss disparaît : une longue rafale de bruit, un craquement grave, puis une figure de victoire. Environ 1,8 s,
    // volontairement bien plus plein et plus long.
    const SON_BOSS_DISPARAIT = new music.Melody(
        "~5 @8,700,0,1 !400,1 ~2 @4,2,200,0 !260,320^60 ~15 @2,18,150,0 -230 C5:2 E5:2 G5:2 C6:6")
    // Héros touché : un gémissement grave qui glisse, avec un grondement.
    const SON_HEROS_TOUCHE = new music.Melody("~2 @0,0,255,0 !220,120^90 ~4 @0,2,170,0 !75,90")

    // ---- Objets ---- (tous montent, mais ils sonnent nettement différents)
    // Clé : un glockenspiel en quatre marches, carré filtré.
    const SON_CLE = new music.Melody("~16 @1,14,120,70 -380 C5:2 G5:2 C6:2 E6:4")
    // Cœur : un sinus chaud, plus grave et plus doux que tout le reste.
    const SON_COEUR = new music.Melody("~3 @12,2,210,90 -300 G4:2 C5:2 E5:4")
    // Pièce : seulement deux notes carrées très courtes et aiguës.
    const SON_PIECE = new music.Melody("~15 @1,4,95,45 -560 B5:2 E6:4")
    // Torche : un bruit qui enfle (l'allumage), puis un triangle chaud qui glisse vers le haut (la flambée).
    const SON_TORCHE = new music.Melody("~5 @70,2,120,90 !1,150 ~1 @14,2,190,0 !430,150^760")
    // Coffre : un choc de bois du couvercle, suivi d'un petit accord de trois notes.
    const SON_COFFRE = new music.Melody("~4 @0,0,255,0 !150,55^80 ~15 @1,10,110,80 -400 C5:2 E5:2 G5:2 C6:5")

    // ---- Intro ----
    // Son du studio : l'éclat de lumière parcourt les lettres.
    const SON_STUDIO = new music.Melody("~16 @3,26,120,140 -260 C4:2 G4:2 C5:2 E5:6")
    // L'approche de la météorite : un bruit réglable qui enfle de loin et monte en même temps. Environ 0,74 s.
    const SON_APPROCHE = new music.Melody("~4 @80,2,150,0 !70,660^1400")
    // L'impact dure environ 0,5 s : d'abord le bang blanc (construit comme SON_PORTE), puis une dent de scie qui tombe
    // tout en bas, dans la cave.
    const SON_IMPACT = new music.Melody("~5 @0,170,0,1 !240,1 ~2 @0,8,255,0 !180,320^24")
    // La fanfare de la carte du titre est en ré mineur, comme tout le jeu : à ce moment-là, l'histoire n'a pas
    // encore bien fini.
    const SON_FANFARE = new music.Melody("~16 @2,14,190,140 -190 D4:2 A4:2 D5:2 F5:6 R:1 F5:2 A5:2 D6:10")
    // Orage sur le château : d'abord le bang blanc de l'impact, puis la fin déchirante de l'éclair, et seulement après
    // le grondement. Le grondement seul sonnait comme une circulation lointaine, le coup manquait.
    const SON_TONNERRE = new music.Melody("~5 @0,24,0,1 !2800,1"
        + " ~4 @0,3,215,0 !1800,70^300"
        + " ~5 @6,540,80,0 !96,660^30")
    // Le voleur file : un sifflement qui monte en fouettant l'air.
    const SON_SOUFFLE = new music.Melody("~5 @2,14,110,0 !260,220^1500")
    // Carte du studio et image finale : le logo se pose. Deux voix, toutes deux exactement de 2,0 s (20 unités
    // de 100 ms chacune au tempo 150). En haut, un accord de ré majeur qui monte sur deux octaves ...
    const SON_LOGO_HAUT = new music.Melody("~16 @6,26,150,220 -150"
        + " D4:2 A4:2 D5:2 F#5:2 A5:4 D6:8")
    // ... en bas, la cadence ré, la, ré comme fondation dessous.
    const SON_LOGO_BAS = new music.Melody("~1 @18,40,165,260 -150"
        + " D3:8 A2:4 D3:8")

    // ---- Déroulement ----
    // Niveau terminé : une petite fanfare qui finit sur une note aiguë.
    const SON_NIVEAU_FINI = new music.Melody("~15 @2,12,150,90 -300 C5:1 E5:1 G5:2 C6:2 G5:2 C6:6")
    // Le boss apparaît : un grognement qui enfle, puis un motif grave en dent de scie avec un triton (do à fa
    // dièse), volontairement faux.
    const SON_BOSS_ARRIVE = new music.Melody(
        "~5 @150,2,110,200 !1,300 ~2 @10,2,235,120 -150 C3:2 R:1 C3:2 R:1 F#3:3 G3:8")
    // Porte fermée : d'abord le coup dur, puis le contrecoup sourd.
    const SON_PORTE = new music.Melody("~5 @0,90,0,1 !200,1 ~4 @0,10,200,0 !130,150^38")
    // Partie terminée : les notes glissent vers le bas par demi-tons (sol, fa dièse, fa, mi, mi bémol), puis tout tombe
    // sur un do grave et épais.
    const SON_FIN = new music.Melody(
        "~15 @2,16,160,110 -200 G4:2 F#4:2 F4:2 E4:2 ~2 @6,2,190,300 D#4:2 C4:10")
    // Avant le couronnement : de lentes cloches pleines d'air. Environ 1,8 s, à peu près autant que le ralenti
    // (IMAGE_COURONNEMENT_MS dans fin.ts, 1,65 s en tout).
    const SON_CLOCHE = new music.Melody("~3 @2,420,60,340 -100 D6:2 R:2 A6:2 R:1 D7:5")
    // Le couronnement : d'abord le coup de lumière, puis une fanfare qui monte en ré majeur (fa dièse au lieu de fa).
    // Tout le jeu est en ré mineur, et ici il se résout pour la première fois. Environ 1,9 s.
    const SON_COURONNE = new music.Melody("~5 @1,40,0,1 !800,1"
        + " ~16 @2,12,205,130 -180 D5:1 F#5:1 A5:1 D6:1 F#6:2 A6:2 F#6:2 D6:12")
    // La fin : le même thème que la musique du titre (ré, fa, la, sol, fa, mi, ré), mais en ré majeur, deux fois plus
    // lent et en sinus chaud. Qui connaît le jeu entend le soulagement sans savoir pourquoi. Environ 3,25 s.
    const SON_EPILOGUE = new music.Melody(
        "~3 @18,6,160,240 -120 D4:2 F#4:2 A4:4 G4:2 F#4:2 E4:4 D4:2 C#4:2 D4:6")

    // ---- Musique ----
    // Tous les grands morceaux de musique, sauf la boucle du donjon, ont deux voix : deux objets Melody qui bouclent
    // séparément (chacun dans un fil à part). Pour que les voix ne s'écartent pas l'une de l'autre, la voix haute et la
    // voix basse ont toujours le même tempo et le même nombre d'unités de durée. L'analyseur compte une unité
    // comme Math.idiv(15000, tempo).
    //   Le compte tombe juste aux tempos 100, 125 et 150.
    //
    // C'est pourquoi l'écart entre les voix reste petit et ne grandit pas.

    // Thème du titre en ré mineur, 8 mesures de 16 unités au tempo 125, ce qui fait 15,36 s par tour. Des levées
    // pointées, un saut d'octave vers ré5 à la troisième mesure et un sol dièse 4, le triton au-dessus de la basse en
    // ré. La mesure 7 descend de fa5 par mi5 et ré5 jusqu'à do dièse 5.
    const MUSIQUE_TITRE = new music.Melody("~2 @6,30,150,90 -125"
        + " D4:3 D4:1 A4:6 A#4:2 A4:4"
        + " G4:3 G4:1 F4:6 E4:2 D4:4"
        + " D5:6 A4:2 F4:4 G#4:4"
        + " A4:12 R:4"
        + " F4:3 F4:1 C5:6 A#4:2 A4:4"
        + " D5:3 D5:1 C5:6 A#4:2 A4:4"
        + " F5:4 E5:4 D5:4 C#5:4"
        + " D5:8 A4:4 D4:4")
    // La base qui va avec : une basse en quintes dans la même pulsation pointée, un triangle à la place de la dent de
    // scie, pour qu'elle porte sans gratter. Chaque mesure a 3 + 1 + 4 + 3 + 1 + 4 = 16 unités, exactement autant que
    // la mélodie. La note la plus grave est la2 (110 Hz) ; en dessous, le petit haut-parleur devient maigre.
    const MUSIQUE_TITRE_BASSE = new music.Melody("~1 @2,22,140,60 -125"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A3:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A2:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 D4:4"
        + " A2:3 A2:1 A2:4 A2:3 A2:1 E3:4"
        + " F3:3 F3:1 F3:4 F3:3 F3:1 C4:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A3:4"
        + " A#2:3 A#2:1 A#2:4 A2:3 A2:1 A2:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A2:4")

    // Fond sonore de l'intro : phrygien sur ré, avec les frottements de demi-ton mi bémol-ré et si bémol-la. Une
    // pulsation de battement de cœur, note et silence, 8 mesures de 16 unités au tempo 100, ce qui fait 19,2 s par
    // tour. Si long qu'on remarque à peine la répétition.
    const MUSIQUE_INTRO = new music.Melody("~1 @2,90,60,150 -100"
        + " D3:2 R:2 D3:2 R:2 D3:2 R:2 D3:2 R:2"
        + " D3:2 R:2 D3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " D3:2 R:2 D3:2 R:2 C3:2 R:2 D3:2 R:2"
        + " A#2:2 R:2 A#2:2 R:2 A2:2 R:2 A2:2 R:2"
        + " D3:2 R:2 D3:2 R:2 D3:2 R:2 D#3:2 R:2"
        + " F3:2 R:2 F3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " G3:2 R:2 F3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " A2:2 R:2 A2:2 R:2 A#2:2 R:2 A2:2 R:2")
    // Au-dessus, seulement trois accents en 19 secondes, presque tout est silence. Une attaque douce et un long
    // relâchement les font sonner comme s'ils venaient de loin. Cette voix compte aussi 128 unités.
    const MUSIQUE_INTRO_HAUT = new music.Melody("~16 @25,140,55,320 -100"
        + " R:16 R:16"
        + " R:8 A5:4 R:4"
        + " R:16"
        + " R:12 A#5:2 A5:2"
        + " R:16"
        + " R:8 D#5:4 D5:4"
        + " R:16")

    // Musique de victoire pour la fin : ré majeur, la même tonique que le thème du titre en ré mineur, seulement
    // éclaircie. 4 mesures de 16 unités au tempo 100, ce qui fait 9,6 s. Une dent de scie en fanfare, le sommet si5
    // arrive à la troisième mesure, puis tout redescend vers la note ré5 d'où l'on est parti.
    const MUSIQUE_VICTOIRE = new music.Melody("~2 @5,25,175,110 -100"
        + " D5:3 D5:1 F#5:4 A5:8"
        + " A5:2 G5:2 F#5:4 E5:4 D5:4"
        + " E5:3 E5:1 G5:4 B5:8"
        + " A5:6 F#5:2 D5:8")
    // Basse d'accompagnement qui marche en noires, ré, ré, sol, la/ré : toute une cadence. 64 unités, exactement aussi
    // long que la fanfare.
    const MUSIQUE_VICTOIRE_BASSE = new music.Melody("~1 @3,25,150,90 -100"
        + " D3:4 D3:4 A3:4 D3:4"
        + " D3:4 D3:4 A2:4 A2:4"
        + " G3:4 G3:4 D3:4 D3:4"
        + " D3:4 D3:4 A2:4 D3:4")

    // Désigne la musique de fond qui joue en ce moment, pour pouvoir l'arrêter exprès sans couper les bruits courts
    // (music.stopAllSounds arrêterait tout). secondeVoixEnCours est la voix basse. Elle peut rester null, et le morceau
    // sonne alors à une seule voix (comme la boucle dans le donjon).
    let musiqueEnCours: music.Melody = null
    let secondeVoixEnCours: music.Melody = null

    // Lance la musique de fond. Les deux objets Melody jouent ici chacun dans un fil à part, et celui qui appelle n'est
    // pas retenu. Pour une musique à une voix, passe null comme deuxième voix.
    function lancerMusique(voixPrincipale: music.Melody, volumePrincipal: number,
        secondeVoix: music.Melody, volumeSecondeVoix: number) {
        arreterMusique()
        musiqueEnCours = voixPrincipale
        secondeVoixEnCours = secondeVoix
        // D'abord la voix basse, puis la mélodie : la toute petite avance de la basse ne s'entend pas, dans l'autre
        // sens la mélodie traînerait nettement derrière.
        if (secondeVoixEnCours != null) {
            secondeVoixEnCours.loop(volumeSecondeVoix)
        }
        musiqueEnCours.loop(volumePrincipal)
    }

    // Joue un son court en arrière-plan. Revient tout de suite, le jeu continue sans à-coup.
    function jouerCourt(melodie: music.Melody, volume: number) {
        melodie.play(volume)
    }

    // ---- Combat ----
    export function jouerBouleFeu() {
        jouerCourt(SON_BOULE_FEU, VOLUME_FAIBLE)
    }
    export function jouerCoup() {
        jouerCourt(SON_COUP, VOLUME_MOYEN)
    }
    export function jouerBloque() {
        jouerCourt(SON_BLOQUE, VOLUME_MOYEN)
    }
    export function jouerEnnemiDisparait() {
        jouerCourt(SON_ENNEMI_DISPARAIT, VOLUME_MOYEN)
    }
    export function jouerBossDisparait() {
        jouerCourt(SON_BOSS_DISPARAIT, VOLUME_PLEIN)
    }
    export function jouerHerosTouche() {
        jouerCourt(SON_HEROS_TOUCHE, VOLUME_PLEIN)
    }

    // ---- Objets ----
    export function jouerCle() {
        jouerCourt(SON_CLE, VOLUME_MOYEN)
    }
    export function jouerCoeur() {
        jouerCourt(SON_COEUR, VOLUME_MOYEN)
    }
    export function jouerPiece() {
        jouerCourt(SON_PIECE, VOLUME_FAIBLE)
    }
    export function jouerTorche() {
        jouerCourt(SON_TORCHE, VOLUME_MOYEN)
    }
    export function jouerCoffre() {
        jouerCourt(SON_COFFRE, VOLUME_PLEIN)
    }

    // ---- Intro ----
    export function jouerStudio() {
        jouerCourt(SON_STUDIO, VOLUME_PLEIN)
    }
    export function jouerTonnerre() {
        jouerCourt(SON_TONNERRE, VOLUME_PLEIN)
    }
    export function jouerSouffle() {
        jouerCourt(SON_SOUFFLE, VOLUME_MOYEN)
    }
    export function jouerApproche() {
        jouerCourt(SON_APPROCHE, VOLUME_MOYEN)
    }
    export function jouerImpact() {
        jouerCourt(SON_IMPACT, VOLUME_PLEIN)
    }
    export function jouerFanfare() {
        jouerCourt(SON_FANFARE, VOLUME_PLEIN)
    }
    // Le logo se pose : deux voix en même temps, toutes deux de 2,0 s.
    export function jouerLogo() {
        jouerCourt(SON_LOGO_BAS, VOLUME_BASSE)
        jouerCourt(SON_LOGO_HAUT, VOLUME_TITRE)
    }

    // ---- Déroulement ----
    export function jouerNiveauFini() {
        jouerCourt(SON_NIVEAU_FINI, VOLUME_PLEIN)
    }
    export function jouerBossArrive() {
        jouerCourt(SON_BOSS_ARRIVE, VOLUME_PLEIN)
    }
    export function jouerPorteFermee() {
        jouerCourt(SON_PORTE, VOLUME_PLEIN)
    }
    export function jouerFinPartie() {
        jouerCourt(SON_FIN, VOLUME_PLEIN)
    }
    // Avant le couronnement : le temps ralentit, des cloches venues de loin.
    export function jouerCloche() {
        jouerCourt(SON_CLOCHE, VOLUME_MOYEN)
    }
    // La couronne se pose sur la tête du héros.
    export function jouerCouronne() {
        jouerCourt(SON_COURONNE, VOLUME_PLEIN)
    }
    // La fin : le thème du titre, résolu en majeur.
    export function jouerEpilogue() {
        jouerCourt(SON_EPILOGUE, VOLUME_PLEIN)
    }

    // ---- Musique ----
    // Thème du titre, deux voix, en boucle sans fin.
    export function lancerMusiqueTitre() {
        lancerMusique(MUSIQUE_TITRE, VOLUME_TITRE, MUSIQUE_TITRE_BASSE, VOLUME_BASSE)
    }

    // Fond sonore de l'intro. Il porte l'histoire et les panneaux du tutoriel, Intro.fermerToile() l'arrête.
    export function lancerMusiqueIntro() {
        lancerMusique(MUSIQUE_INTRO, VOLUME_MUSIQUE, MUSIQUE_INTRO_HAUT, VOLUME_LOIN)
    }

    // Musique de victoire dans la fin. Elle joue jusqu'à la première carte de fin, où Epilogue.jouer l'arrête.
    export function lancerMusiqueVictoire() {
        lancerMusique(MUSIQUE_VICTOIRE, VOLUME_TITRE, MUSIQUE_VICTOIRE_BASSE, VOLUME_BASSE)
    }

    // Boucle dans le donjon : un ostinato grave et battant en ré mineur. Jusqu'au niveau 9, le tempo accélère à chaque
    // niveau (100 + 12 par niveau, au plus 200). À partir du niveau 4, une phrase de réponse tordue avec sol dièse
    // s'ajoute (un triton avec ré). Volontairement dépouillée, car la musique joue tout le temps.
    export function lancerMusiqueDonjon(numeroNiveau: number) {
        let tempo: number;
        let motif: string;
        arreterMusique()
        tempo = 100 + numeroNiveau * 12
        if (tempo > 200) {
            tempo = 200
        }
        motif = "~17 @4,2,80,70 -" + convertToText(tempo) + " D3:2 R:2 D3:2 A3:2 D3:2 R:2 F3:2 E3:2"
        if (numeroNiveau >= 4) {
            motif = motif + " G#3:2 A3:2 G#3:2 D3:4"
        }
        lancerMusique(new music.Melody(motif), VOLUME_MUSIQUE, null, 0)
    }

    // Arrête les deux voix de la musique de fond. Les bruits courts qui s'éteignent à l'instant peuvent
    // aller jusqu'au bout.
    export function arreterMusique() {
        if (musiqueEnCours != null) {
            musiqueEnCours.stop()
            musiqueEnCours = null
        }
        if (secondeVoixEnCours != null) {
            secondeVoixEnCours.stop()
            secondeVoixEnCours = null
        }
    }
}
