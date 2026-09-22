# PUNCH — release v1.6.7

**APK signé (arm64) :** `punch-clockin-seeker-v1.6.7.apk` — build CI sur tag, SHA-256 dans le fichier `.sha256` joint à la release.

**Vidéo démo :** `punch-clockin-demo.mp4` — 2 min 43, voix off EN + **sous-titres EN incrustés** (version lisible sans son ; fichier `.srt` joint). Tournée sur Seeker v1.6.6 : connexion Seed Vault, pointage réel (feuille Transaction → Approve → ticket papier), reçu 92/3/5, ping RPC, trésor public sur l'explorer.

> ⚠️ **Nouveau dans cette release : l'APK est construit avec le vrai trésor.** Le secret `TREASURY_SECRET_DEVNET` (clé devnet du trésor) est injecté par la CI au build — les lots de bienvenue, paiements de missions et splits 92/3/5 partent du trésor réel, pas du gabarit zéro des versions précédentes.

## Nouveau dans v1.6.7 — build CI au vrai trésor + version sous-titrée

- **Trésor réel en CI** : le workflow Release valide le secret `TREASURY_SECRET_DEVNET` (tableau JSON de 64 octets) et l'injecte dans `treasurySecretDEVNET.local.ts` au build. Si le secret est absent, l'APK est marqué « démo trésor » dans les notes — ce n'est plus le cas ici.
- **Vidéo démo refaite** (2:43) : arc punch complet filmé (tap → feuille Seed Vault → Approve → registre mis à jour → ticket papier), reçu « Tu gardes 92% » en plan dédié, sous-titres EN incrustés, `.srt` fourni séparément.
- app v1.6.7 (versionCode 21) — même produit que v1.6.6, nouveau build signé au trésor réel.

## Installer

```bash
adb install -r punch-clockin-seeker-v1.6.7.apk
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

- app v1.6.7 (versionCode 21) — build CI au trésor réel + vidéo démo sous-titrée.
- Harnais économiques : `node scripts/test-store-economy.mjs` (54 vérifications offline : split 92/3/5, frais, rangs).
- Règle du produit : **jamais d'argent simulé — une vraie transaction ou rien.**
