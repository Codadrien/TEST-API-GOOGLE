# MVP Filtre par Couleur - Tonton Outdoor

Application React pour filtrer des produits par couleur dominante en utilisant l'API Google Vision.

## Structure du projet

```
test-api-google/
├── EXEMPLESITE.html          # HTML source principal
├── NEW DATA/                 # HTML sources additionnels (2 fichiers)
├── extractImagesFixed.js     # Script d'extraction des produits
├── products-final.json       # Base de données produits (120 produits)
├── public/                   # Fichiers statiques
├── src/
│   ├── main.jsx             # Point d'entrée React
│   ├── ProductGridFinal.jsx # Composant grille produits
│   ├── styles.css           # Styles de base
│   └── tonton-outdoor-styles.css # Styles du site original
└── index.html               # Page principale
```

## Installation

```bash
npm install
```

## Utilisation

1. **Extraire/Mettre à jour les produits** :
```bash
node extractImagesFixed.js
```
Cela génère `products-final.json` avec 120 produits extraits des 3 fichiers HTML.

2. **Lancer l'application** :
```bash
npm run dev
```
L'application sera accessible sur http://localhost:5173/

## Fonctionnalités implémentées

- ✅ **Extraction intelligente** : Récupère les vraies URLs d'images (pas le base64)
- ✅ **120 produits** : Extraits de 3 fichiers HTML différents
- ✅ **Affichage dynamique** : Grille de produits avec React
- ✅ **Vignettes interactives** : Clic pour changer l'image principale
- ✅ **Design préservé** : Apparence isométrique du site original
- ✅ **Structure prête** : URLs d'analyse pour l'API Google Vision

## Structure des données

```json
{
  "id": "product_1",
  "brand": "SAUCONY",
  "name": "ENDORPHIN SPEED 4 HOMME",
  "price": "160,00 €",
  "mainImage": {
    "url": "https://...thumbnail.../970d53-saucony.jpg",
    "alt": "ENDORPHIN SPEED 4 HOMME"
  },
  "thumbnails": [
    {
      "url": "https://...thumbnail.../970d53-saucony.jpg",
      "largeUrl": "https://...large.../970d53-saucony.jpg"
    }
  ],
  "colorAnalysisUrl": "https://...thumbnail.../970d53-saucony.jpg",
  "dominantColor": null,
  "colorPalette": []
}
```

## Prochaine étape

Intégrer l'API Google Vision pour analyser les couleurs des produits et activer le filtrage par couleur.# TEST-API-GOOGLE
# TEST-API-GOOGLE
