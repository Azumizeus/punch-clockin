# PUNCH — release v1.6.5 (jury)

**APK signé (arm64) :** `punch-clockin-seeker-v1.6.5-fix-horloge-20260921.apk` — 141 370 648 octets

**SHA-256 :** `9903a884f770c570e3ab1b8f5666d1eb672504b02656ee0b0a665b79587d5397`

**Vidéo démo :** `punch-clockin-demo.mp4` — 101 s, tournée sur Seeker (vrai pointage Seed Vault, board, globe, hellos, historique).

## Installer

```bash
adb install -r punch-clockin-seeker-v1.6.5-fix-horloge-20260921.apk
```

(ou copier l'APK sur le téléphone et l'ouvrir — sources inconnues à autoriser une fois)

## Tester en 15 minutes

1. Ouvrir l'app → **« Ouvrir mon portefeuille »** → autoriser dans la feuille Seed Vault (devnet réel).
2. Wallet vide ⇒ lot de bienvenue réel du trésor (0,05 SOL + 5 USDC + 20 USDT + 5 000 SKR).
3. Toucher l'éclair → signer → **ticket papier avec tampon on-chain cliquable**.
4. Argent → Échanger / Garder / Relâcher · Missions · Bonjours — chaque action = vraie signature.
5. Réglages → **Quitter le réseau** = vraie transaction, compteurs décrémentés honnêtement.

Trésor à vérifier sur [explorer.solana.com (cluster=devnet)](https://explorer.solana.com/address/FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn?cluster=devnet) : `FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn`

## Notes

- app v1.6.5 (versionCode 19) — fix horloge accueil, identité Seeker Premium unique (Or / Nuit), 7 onglets, historique 100 reçus, erreurs tx lisibles partout.
- Harnais économiques : `node scripts/test-store-economy.mjs` (54 vérifications offline : split 92/3/5, frais, rangs).
- Règle du produit : **jamais d'argent simulé — une vraie transaction ou rien.**
