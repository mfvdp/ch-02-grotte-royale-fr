// État global du jeu.
//
// MakeCode n'a ni import ni export : tout ce qui est écrit ici est visible dans tous les autres fichiers.

// ---- Progression ----
let niveauActuel = 1
let nombreCles = 0
let bossEstActif = false
let partieEnCours = true
// Verrou pour la bulle de parole avec l'indice à l'escalier : le gestionnaire de tuile se déclenche à chaque image tant
// que le héros s'y tient.
let finIndiceMs = 0

// ---- Héros ----
let heros: Sprite = null
let vitesseHeros = VITESSE_HEROS
let regardX = 1
let regardY = 0
let rechargeMs = RECHARGE_NORMALE_MS
let tirPossibleDesMs = 0
let finProtectionMs = 0
let aTirTriple = false
let aAppuye = false

// ---- Affichage, lumière et obscurité ----
let affichageCle: Sprite = null
let spriteObscurite: Sprite = null
let rayonLumiere = 0
let finLumiereMs = 0
// Les deux images d'affichage (la carte et le panneau du niveau) sont faites une fois au démarrage, puis seulement
// repeintes. En fabriquer de nouvelles encore et encore en plein jeu morcellerait la mémoire, jusqu'à ce que l'une
// d'elles échoue et que le jeu plante. Le ramasse-miettes de MakeCode nettoie bien, mais il ne rassemble pas
// les morceaux libres.
let tamponCarte: Image = null
let tamponNiveau: Image = null

// ---- Grille et salles ----
let grille: number[] = []
let centreSalleX: number[] = []
let centreSalleY: number[] = []
let calqueMurs: Image = null

// ---- Ennemis ----
let ennemis: Ennemi[] = []

// Variables d'aide que plusieurs fonctions utilisent ensemble. Elles sont tout en haut pour que chaque fichier les
// voie, même si seules quelques fonctions en ont besoin. Noms courts : x, y = coordonnées ; s et r = sprites ;
// nouvelleBoule = la dernière boule de feu du héros ; imageNouvelEnnemi = l'image de l'ennemi que placerEnnemi est en
// train de placer ; ennemiTouche = l'ennemi qui a été touché ; imageObscurite = l'image de l'obscurité (160 × 120) ;
// toileEcran = l'image plein écran pour l'intro, les panneaux du tutoriel et la fin (160 × 120) ; imageTitreAvecInvite
// et imageTitreSimple = les deux images du titre avec et sans l'invite.
let sorteMax = 0
let derniereSalle = 0
let choixCoffre = 0
let compteurClignotement = 0
let vieNouvelEnnemi = 0
let vitesseNouvelEnnemi = 0
let ennemiX = 0
let ennemiY = 0
let x = 0
let y = 0
let s: Sprite = null
let nouvelleBoule: Sprite = null
let r: Sprite = null
let ennemiTouche: Ennemi = null
let imageObscurite: Image = null
let toileEcran: Image = null
let imageNouvelEnnemi: Image = null
let imageTitreAvecInvite: Image = null
let imageTitreSimple: Image = null
// Les nuages d'étoiles des ennemis vaincus qu'on peut voir en ce moment (disparaitre dans evenements.ts). La liste est
// vide dès qu'aucun ne tourne.
let nuages: Sprite[] = []
