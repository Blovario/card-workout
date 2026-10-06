# DeckBurn

Landing statique publiée avec GitHub Pages. Les cinq décors sont rendus en temps réel avec Three.js : cartes, textures, roches, lumières, animation et réaction au pointeur. Les écrans dans les téléphones sont de vraies captures de l'application.

## Développement

```sh
npm ci
npm run build
python3 -m http.server 4173
```

Ouvrir `http://localhost:4173/` pour la version française ou `http://localhost:4173/en/` pour la version anglaise. Les politiques de confidentialité sont accessibles sur `/confidentialite.html` et `/en/privacy.html`. Le code source des scènes est dans `src/scene.js`. Le fichier `scene.bundle.js` est versionné pour que GitHub Pages puisse servir directement le dépôt sans étape de construction côté hébergeur.

Les images `assets/*-scene.webp` ne servent que de secours si WebGL est indisponible. Elles ne sont pas chargées lorsque les scènes interactives fonctionnent. `assets/stone-albedo.webp` est une texture appliquée aux roches en 3D. Les préférences de réduction du mouvement sont respectées.
