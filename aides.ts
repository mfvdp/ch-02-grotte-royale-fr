// Petites fonctions d'aide, sans état propre.

function valeurAbsolue (n: number) {
    if (n < 0) {
        return 0 - n
    }
    return n
}

function signe (n: number) {
    if (n > 0) {
        return 1
    }
    if (n < 0) {
        return -1
    }
    return 0
}

function estSol (x: number, y: number) {
    if (x < 0 || y < 0 || x >= GRILLE_L || y >= GRILLE_H) {
        return false
    }
    return grille[y * GRILLE_L + x] > 0
}
