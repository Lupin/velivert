# Vélivert

Stations Vélivert (Saint-Étienne) les plus proches sur lunettes Even Realities G2.

L'app détecte votre position, interroge l'API GBFS de Saint-Étienne Métropole, calcule les distances (formule de Haversine), et affiche les 3 stations les plus proches directement sur vos lunettes. Une interface companion sur le téléphone permet de voir les détails, ajuster le rayon de recherche, et rafraîchir les données.

## Fonctionnalités

- **Géolocalisation automatique** — utilise le GPS du téléphone
- **Affichage sur lunettes G2** — stations, distances, vélos disponibles
- **UI companion** — liste, slider de rayon (300m-3km), vue détail
- **Auto-refresh** — données mises à jour toutes les 60 secondes
- **Cache** — évite les appels API redondants (TTL 60s)
- **Click G2 → refresh** — un clic sur la branche des lunettes rafraîchit les données

## Structure

```
velivert/
├── src/
│   ├── config.ts          # Types Station, constantes, version
│   ├── data.ts            # Fetch GBFS, cache, Haversine
│   ├── main.ts            # Bridge G2, CLICK_EVENT, refresh
│   └── display/
│       └── index.ts       # Rendu G2 (TextContainer)
├── index.html             # UI companion + fallback JS
├── app.json               # Manifest Even Hub
├── builds/                # .ehpk packagés + QR codes
├── sim.sh                 # Build + lance simulateur
├── pack.sh                # Build + package .ehpk + génère QR
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Prérequis

- Node.js ≥ 18
- npm ≥ 9
- [Even Hub CLI](https://github.com/evenrealities/evenhub) (`npm install -g evenhub`)
- [EvenHub Simulator](https://github.com/evenrealities/evenhub-simulator) (`npm install -g evenhub-simulator`)

## Développement

```bash
# Installer les dépendances
npm install

# Lancer le simulateur (build + Vite + simulateur)
./sim.sh

# Ou manuellement :
npm run dev          # Vite dev server sur :5175
npx evenhub-simulator http://localhost:5175
```

## Packaging & déploiement

```bash
# Builder, packager .ehpk, générer QR code
./pack.sh

# Résultat dans builds/ :
#   velivert-vX.Y.Z.ehpk   → package pour Even Hub
#   velivert-vX.Y.Z-qr.png → QR code pour sideload
```

**Pour installer sur les lunettes :**
1. Lancer le serveur : `npm run dev`
2. Scanner le QR code (`builds/velivert-vX.Y.Z-qr.png`) avec l'app Even Hub sur iPhone
3. L'app se charge depuis le serveur local (même réseau WiFi requis)

## API

Données fournies par [Saint-Étienne Métropole](https://api.saint-etienne-metropole.fr/velivert/) — format GBFS 2.x.

- **Station information** : `station_information.json`
- **Station status** : `station_status.json`

## Licence

MIT — voir [LICENSE](LICENSE)
