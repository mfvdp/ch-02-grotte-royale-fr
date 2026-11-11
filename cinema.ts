// Cinéma : la boîte à outils de l'intro et de la fin.
//
// Quatre gestes, les mêmes partout :
//   dessinerCadre()   bandes, coins arrondis, secousse de caméra, à chaque image
//   dessinerOnde()    l'onde de choc d'un impact
//   dessinerFaisceau, dessinerGuirlande   des faisceaux de lumière (rayons)
//   refroidir()   tout ce qui brille descend d'un cran vers le noir
//
// Tout est toujours peint dans l'image plein écran toileEcran. Ici, on ne fabrique jamais d'image et on n'attend jamais
// rien. L'attente et le test du bouton A restent dans Intro.attendre() et Epilogue.attendre().
//
// Cet espace de noms n'a pas d'état à lui : tout passe par les paramètres. Sinon, un jour, l'image du titre recevrait
// des bandes de cinéma.
//
// Pas de nombres à virgule et pas de fonctions d'angle : toutes les directions viennent des tableaux SENS_X et SENS_Y.
namespace Cinema {
    // La hauteur des bandes dans le cas normal : 8 en haut et 8 en bas sur 120 pixels. Cela ressemble à un écran large
    // sans écraser l'image. Reste visible : y = 8 à 111.
    export const HAUTEUR_BANDE = 8

    // 16 directions sur un cercle de rayon 64, arrondies à des nombres entiers (64 × cos et 64 × sin par pas de 22,5
    // degrés). Un point dans la direction k à la distance r est en x = cx + Math.idiv(SENS_X[k] * r, 64). Ajouter 4 à
    // une direction k donne toujours la direction tournée de 90 degrés, donc le bord du bout d'un faisceau est
    // perpendiculaire à son axe.
    const SENS_X = [64, 59, 45, 24, 0, -24, -45, -59, -64, -59, -45, -24, 0, 24, 45, 59]
    const SENS_Y = [0, 24, 45, 59, 64, 59, 45, 24, 0, -24, -45, -59, -64, -59, -45, -24]

    // Combien de pixels de la ligne j (comptée depuis le bord de la bande) restent noirs à gauche et à droite : le coin
    // arrondi du cadre de cinéma.
    const PIXELS_COIN = [10, 6, 4, 3, 2, 2, 1, 1]

    // Une secousse de caméra qui s'apaise petit à petit. Le niveau 0 est le coup lui-même.
    const SECOUSSE_X = [4, -3, 3, -2, 2, -1, 1, 0]
    const SECOUSSE_Y = [-3, 3, -2, 2, -1, 1, 0, 0]

    // Vitesses de départ des étincelles, de pures valeurs en pixels.
    const VITESSE_ETINCELLE_X = [-9, -7, -5, -2, 0, 2, 5, 7, 9, -4, 4, 0]
    const VITESSE_ETINCELLE_Y = [-3, -6, -8, -9, -10, -9, -8, -6, -3, -7, -7, -11]

    // Couleurs des confettis. À n'utiliser que dans la fin (voir laisserTomberConfettis()).
    const COULEURS_CONFETTIS = [5, 4, 1, 5, 2, 4, 3, 7, 10]

    // Le cadre de cinéma : des bandes en haut et en bas, un fin bord clair, des coins arrondis. C'est toujours la
    // dernière commande de dessin d'une image.
    //
    // decalageX et decalageY ne déplacent pas l'image, ils déplacent l'ouverture : avec decalageY = 3, la bande du haut
    // grandit et celle du bas rétrécit. L'œil y voit un sursaut de caméra. L'astuce ne coûte rien, et aucune scène n'a
    // à changer ses coordonnées pour cela. (toileEcran.scroll() serait le moyen évident, mais avec un decalageY qui
    // n'est pas nul, il fait à l'intérieur une copie de l'image de 9,6 Ko. Ne l'utilise pas.)
    export function dessinerCadre(decalageX: number, decalageY: number, hauteurBande: number) {
        let bandeHaut = hauteurBande + decalageY
        let bandeBas = hauteurBande - decalageY
        if (bandeHaut < 0) {
            bandeHaut = 0
        }
        if (bandeBas < 0) {
            bandeBas = 0
        }
        toileEcran.fillRect(0, 0, 160, bandeHaut, 15)
        toileEcran.fillRect(0, 120 - bandeBas, 160, bandeBas, 15)
        if (decalageX > 0) {
            toileEcran.fillRect(0, bandeHaut, decalageX, 120 - bandeHaut - bandeBas, 15)
        }
        if (decalageX < 0) {
            toileEcran.fillRect(160 + decalageX, bandeHaut, 0 - decalageX, 120 - bandeHaut - bandeBas, 15)
        }
        // Le bord clair : sans lui, la bande se fond dans une image noire, et on ne verrait pas du tout le cadre.
        if (bandeHaut > 0) {
            toileEcran.fillRect(0, bandeHaut - 1, 160, 1, 12)
        }
        if (bandeBas > 0) {
            toileEcran.fillRect(0, 120 - bandeBas, 160, 1, 12)
        }
        for (let j = 0; j < 8; j++) {
            toileEcran.fillRect(0, bandeHaut + j, PIXELS_COIN[j], 1, 15)
            toileEcran.fillRect(160 - PIXELS_COIN[j], bandeHaut + j, PIXELS_COIN[j], 1, 15)
            toileEcran.fillRect(0, 119 - bandeBas - j, PIXELS_COIN[j], 1, 15)
            toileEcran.fillRect(160 - PIXELS_COIN[j], 119 - bandeBas - j, PIXELS_COIN[j], 1, 15)
        }
    }

    // Cadre avec une secousse de caméra au niveau donné : 0 est le coup lui-même, plus c'est haut, plus c'est calme. À
    // partir de 8, la caméra reste immobile.
    export function secouer(niveau: number, h: number) {
        if (niveau < 0 || niveau > 7) {
            dessinerCadre(0, 0, h)
        } else {
            dessinerCadre(SECOUSSE_X[niveau], SECOUSSE_Y[niveau], h)
        }
    }

    // Hauteur des bandes pour l'image f d'une scène : les quatre premières images ouvrent peu à peu les bandes, de 59
    // jusqu'à la hauteur normale.
    export function ouvrirBandes(f: number) {
        if (f >= 3) {
            return HAUTEUR_BANDE
        }
        return HAUTEUR_BANDE + (3 - f) * 17
    }

    // Une onde de choc : trois anneaux de couleur de l'extérieur vers l'intérieur, le milieu est effacé de nouveau. À
    // n'utiliser donc que sur un fond noir et toujours en premier dans une image. Avec quatre appels fillCircle
    // intégrés, c'est très bon marché. drawCircle serait faux ici : c'est une boucle TypeScript qui appelle setPixel
    // environ 6 × r fois par cercle.
    export function dessinerOnde(cx: number, cy: number,
        r: number, couleur1: number, couleur2: number, couleur3: number) {
        if (r < 4) {
            return
        }
        toileEcran.fillCircle(cx, cy, r, couleur1)
        toileEcran.fillCircle(cx, cy, r - 3, couleur2)
        toileEcran.fillCircle(cx, cy, r - 6, couleur3)
        toileEcran.fillCircle(cx, cy, r - 10, 15)
    }

    // Un seul anneau en contour. C'est la seule façon de poser une onde sur une image déjà finie. C'est cher (voir plus
    // haut), donc au plus un appel par image et r au plus 120.
    export function dessinerAnneau(cx: number, cy: number, r: number, couleur: number) {
        if (r < 1 || r > 120) {
            return
        }
        toileEcran.drawCircle(cx, cy, r, couleur)
    }

    // Des étincelles sur une trajectoire au temps t, calculées avec des nombres entiers :
    //   x = cx + vx * t / 2
    //   y = cy + vy * t / 2 + t * t / 2   (le dernier morceau est la pesanteur)
    //
    // Elles n'ont pas besoin de s'éteindre : refroidir() transforme tout seul les étincelles restées derrière en une
    // traînée qui rougeoie. Il peut y avoir au plus 12 étincelles (n).
    export function dessinerEtincelles(cx: number, cy: number, t: number, n: number, couleur: number) {
        for (let k = 0; k < n; k++) {
            toileEcran.setPixel(cx + Math.idiv(VITESSE_ETINCELLE_X[k] * t, 2),
                cy + Math.idiv(VITESSE_ETINCELLE_Y[k] * t, 2) + Math.idiv(t * t, 2), couleur)
        }
    }

    // Un faisceau de lumière : un triangle qui part de la source dans la direction i. Le bord du bout lui est
    // perpendiculaire, donc la direction i + 4. fillTriangle est intégrée et coupe toute seule ce qui dépasse, donc
    // longueur peut aller au-delà du bord de l'image.
    export function dessinerFaisceau(sourceX: number, sourceY: number, i: number,
        longueur: number, largeur: number, couleur: number) {
        let ex = sourceX + Math.idiv(SENS_X[i % 16] * longueur, 64)
        let ey = sourceY + Math.idiv(SENS_Y[i % 16] * longueur, 64)
        let ecartX = Math.idiv(SENS_X[(i + 4) % 16] * largeur, 64)
        let ecartY = Math.idiv(SENS_Y[(i + 4) % 16] * largeur, 64)
        toileEcran.fillTriangle(sourceX, sourceY, ex +
            ecartX, ey + ecartY, ex - ecartX, ey - ecartY, couleur)
    }

    // Huit faisceaux de lumière en guirlande. phase 0 ou 1 la tourne d'une demi-division. Si on alterne entre les deux,
    // cela ressemble à un lent tour, et il n'y a rien à calculer.
    export function dessinerGuirlande(cx: number, cy: number, r: number, phase: number,
        couleur: number, largeur: number) {
        for (let i = phase; i < 16; i += 2) {
            dessinerFaisceau(cx, cy, i, r, largeur, couleur)
        }
    }

    // Un éclat à huit pointes : une croix plus des diagonales de moitié moins longues. Avec seulement quatre lignes,
    // c'est le reflet le moins cher qui existe.
    export function dessinerEtoile(sx: number, sy: number, rayon: number, couleur: number) {
        let h = Math.idiv(rayon, 2)
        toileEcran.drawLine(sx - rayon, sy, sx + rayon, sy, couleur)
        toileEcran.drawLine(sx, sy - rayon, sx, sy + rayon, couleur)
        toileEcran.drawLine(sx - h, sy - h, sx + h, sy + h, couleur)
        toileEcran.drawLine(sx - h, sy + h, sx + h, sy - h, couleur)
    }

    // Le métal chauffé refroidit : blanc, jaune, orange, rouge, brun, gris, noir. Comme pour Intro.assombrir(), l'ordre
    // va du sombre au clair, sinon une couleur tomberait d'un coup tout en bas de l'échelle.
    //
    // L'effet le plus important de toute la boîte à outils : tu peins une fois des anneaux, des faisceaux et des
    // étincelles, tu laisses la toile en place et tu n'appelles refroidir() qu'une fois par image. Tout s'éteint tout
    // seul, un système de particules sans une seule variable d'état.
    //
    // Attention : les couleurs 12 et 14 descendent aussi, donc la maçonnerie se défait. À n'utiliser que sur une toile
    // qui doit de toute façon aller au noir. Les couleurs 11 et 13 survivent : ce qui doit rester debout est peint avec
    // la couleur 13. N'appelle jamais refroidir() deux fois dans la même image.
    export function refroidir() {
        toileEcran.replace(12, 15)
        toileEcran.replace(14, 12)
        toileEcran.replace(2, 14)
        toileEcran.replace(4, 2)
        toileEcran.replace(5, 4)
        toileEcran.replace(1, 5)
    }

    // Des confettis qui tombent. Sans randint, pour qu'ils tombent vraiment et ne fassent pas que clignoter.
    //
    // À n'utiliser que dans la fin : les couleurs 3, 7 et 10 apparaissent ici, et Intro.assombrir() ne les connaît pas.
    // Dans l'intro, un tel point resterait clair pendant le fondu. La fin ne passe jamais par assombrir(), donc
    // c'est permis ici.
    export function laisserTomberConfettis(f: number) {
        for (let k = 0; k < 18; k++) {
            toileEcran.fillRect(k * 9 + 4, (k * 27 +
                f * 11) % 104 + 10, 2, 3, COULEURS_CONFETTIS[k % 9])
        }
    }
}
