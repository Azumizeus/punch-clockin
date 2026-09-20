# PUNCH

Pointeuse Seeker. Tu te présentes. Tu es payé. 92 / 3 / 5.

## Ce que c’est

- Check-in quotidien (Seed Vault)
- Missions payées en USDC / USDT / SKR
- Carte du monde **pays seulement** — jamais d’adresse
- Part publique sur chaque reçu

## Fichiers de cette app

```
src/punch/app.tsx              App + navigation
src/punch/bar.tsx              Sombre / Clair / FR
src/punch/connect-screen.tsx   Connexion portefeuille
src/punch/punch-screen.tsx     Bouton « Je suis là »
src/punch/globe-screen.tsx     Carte certifiée
src/punch/board-screen.tsx     Missions
src/punch/shift-screen.tsx     Une mission
src/punch/post-screen.tsx      Poster une mission
src/punch/wallet-screen.tsx    Argent
src/punch/split-screen.tsx     La part 92 / 3 / 5
src/punch/receipt-screen.tsx   Reçu
src/lib/punch/globe.ts         Pays, sans GPS
src/lib/punch/shifts.ts        Missions démo
```

Argent partagé : `src/lib/punch/` (portefeuille, reçus, règle 92/3/5)
Reçu visuel : `src/shared/`

PLI n’est pas ici. C’est une autre app.
