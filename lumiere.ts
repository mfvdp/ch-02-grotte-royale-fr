// Obscurité et lumière : le cercle de vue autour du héros.
//
// L'image de l'obscurité mesure 160 × 120 pixels et est accrochée comme un sprite devant la caméra, relativement à
// elle. Le cercle de lumière est repeint à chaque image à la position du héros à l'écran (dessinerLumiere, appelée par
// game.onUpdate dans main.ts). Cela fait trois appels de remplissage intégrés par image et ne coûte pratiquement rien.
//
// Une image en coordonnées du monde autour du héros devrait mesurer 320 × 240 pixels, car aux bords du donjon la caméra
// reste immobile et le héros s'éloigne jusqu'à 80 et 60 pixels du milieu. Cela ferait 38 Ko d'un seul bloc, la moitié
// de toute la mémoire, et chaque place libre de la mémoire serait coupée en deux. Une image de 160 × 120 pixels ne
// prend que 9,6 Ko.
//
// L'image est faite une seule fois au démarrage (main.ts), puis seulement repeinte.

// Retient seulement le rayon voulu. Le dessin est refait à chaque image.
function reglerLumiere (r: number) {
    rayonLumiere = r
}

// Peint l'obscurité : tout en noir, un anneau de crépuscule et un trou au milieu, centré sur la position du héros à
// l'écran. On la calcule à partir de sa position dans le monde moins la vue de la caméra. Le cercle est donc juste même
// quand la caméra reste au bord du donjon.
function dessinerLumiere () {
    if (imageObscurite == null || heros == null) {
        return
    }
    let sx = heros.x - scene.cameraProperty(CameraProperty.Left)
    let sy = heros.y - scene.cameraProperty(CameraProperty.Top)
    imageObscurite.fill(15)
    imageObscurite.fillCircle(sx, sy, rayonLumiere + 6, 12)
    imageObscurite.fillCircle(sx, sy, rayonLumiere, 0)
}
