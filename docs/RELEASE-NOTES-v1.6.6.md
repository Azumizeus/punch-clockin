# PUNCH — release v1.6.6

**APK signé (arm64) :** [`punch-clockin-seeker-v1.6.6.apk`](https://github.com/Azumizeus/punch-clockin/releases/tag/v1.6.6) — build CI, SHA-256 `847dc69d02300d10bf473795e3f8367a0a0cd46c4c6690b965396624b63b3b61` (fichier `.sha256` joint à la release). Build dev local de référence : `punch-clockin-seeker-v1.6.6-rpc-perso-20260921.apk` — 140 874 476 octets, SHA-256 `1c9c49e5bd97887ca0e085069f3835f28af8bab3dbb1a4cea99700fede6da196`.

**SHA-256 :** `1c9c49e5bd97887ca0e085069f3835f28af8bab3dbb1a4cea99700fede6da196`

**Vidéo démo :** `punch-clockin-demo.mp4` — 3 min 06, voix off EN, refaite le 22/09 sur Seeker v1.6.6 (connexion Seed Vault, pointage réel + feuille Transaction + ticket papier, board, wallet, globe, ping RPC, quitter le réseau, trésor sur l'explorer).

## Nouveau dans v1.6.6 — RPC au choix + test de connexion

Le devnet public sature parfois (429) : **l'app ne mentira jamais sur un échec, mais elle ne doit pas rester bloquée sur un endpoint qu'elle ne contrôle pas.** Réglages → **Réseau** permet de brancher son propre endpoint :

- **Endpoint persistant** (MMKV, clé `punch-rpc`) — les clés ne quittent jamais le téléphone.
- **« Tester la connexion »** : vrai ping JSON-RPC `getSlot` avec latence mesurée — verdict vert « Connexion OK — 384 ms » ou **la vraie raison** de l'échec (hôte introuvable, 429, réseau).
- **« Enregistrer »** applique l'endpoint à *tous* les flux on-chain (lot, pointage, swap, stake, sortie) — plus aucun URL en dur dans l'app.
- **« Revenir au RPC public »** en un tap, avec statut visible.
- Démo vérifiée sur Seeker (`_shots/reseau-v166/`) : ping public OK → endpoint faux → erreur honnête affichée (`UnknownHostException` réel) → retour public → re-ping vert.

## Installer

```bash
adb install -r punch-clockin-seeker-v1.6.6.apk
```

(ou copier l'APK sur le téléphone et l'ouvrir — sources inconnues à autoriser une fois)

## Tester en 15 minutes

1. Ouvrir l'app → **« Ouvrir mon portefeuille »** → autoriser dans la feuille Seed Vault (devnet réel).
2. Wallet vide ⇒ lot de bienvenue réel du trésor (0,05 SOL + 5 USDC + 20 USDT + 5 000 SKR).
3. Toucher l'éclair → signer → **ticket papier avec tampon on-chain cliquable**.
4. Argent → Échanger / Garder / Relâcher · Missions · Bonjours — chaque action = vraie signature.
5. **Réglages → Réseau** → « Tester la connexion » (ping vert) → endpoint quelconque → erreur honnête → retour public.
6. Réglages → **Quitter le réseau** = vraie transaction, compteurs décrémentés honnêtement.

Trésor à vérifier sur [explorer.solana.com (cluster=devnet)](https://explorer.solana.com/address/FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn?cluster=devnet) : `FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn`

## Notes

- app v1.6.6 (versionCode 20) — RPC personnalisé + test de connexion, plus le fix horloge accueil et l'identité Seeker Premium de v1.6.5 (7 onglets, historique 100 reçus, erreurs tx lisibles partout).
- Harnais économiques : `node scripts/test-store-economy.mjs` (54 vérifications offline : split 92/3/5, frais, rangs).
- Règle du produit : **jamais d'argent simulé — une vraie transaction ou rien.**
