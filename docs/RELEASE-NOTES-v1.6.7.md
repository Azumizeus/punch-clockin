# PUNCH — release v1.6.7

**APK signé (arm64) :** [`punch-clockin-seeker-v1.6.7.apk`](https://github.com/Azumizeus/punch-clockin/releases/tag/v1.6.7) — **construit à 100 % par la CI** (GitHub Actions : expo prebuild + Gradle assembleRelease, signature du keystore du repo), SHA-256 dans le fichier `.sha256` joint à la release. Vérifiez-le après téléchargement :

```bash
sha256sum -c punch-clockin-seeker-v1.6.7.apk.sha256
```

## Pourquoi cette release

**Release de validation du pipeline.** v1.6.7 est fonctionnellement identique à v1.6.6 — elle prouve que la chaîne **tag → build CI signé → Release publique (APK + SHA-256 + vidéo)** fonctionne de bout en bout, notes comprises. Aucune donnée, aucun flux on-chain ne change.

## Rappel v1.6.6 — RPC au choix + test de connexion

Le devnet public sature parfois (429) : Réglages → **Réseau** permet de brancher son propre endpoint, persistant (MMKV, clé `punch-rpc`), avec **« Tester la connexion »** (ping JSON-RPC `getSlot` + latence mesurée, verdict vert ou **vraie raison** de l'échec), application à *tous* les flux on-chain, et retour au RPC public en un tap. L'app n'a plus aucun URL en dur.

## Installer

```bash
adb install -r punch-clockin-seeker-v1.6.7.apk
```

(ou copier l'APK sur le téléphone et l'ouvrir — sources inconnues à autoriser une fois)

## Tester en 15 minutes

1. Ouvrir l'app → **« Ouvrir mon portefeuille »** → autoriser dans la feuille Seed Vault (devnet réel).
2. Wallet vide ⇒ lot de bienvenue réel du trésor (0,05 SOL + 5 USDC + 20 USDT + 5 000 SKR).
3. **CLOCK IN** : pointage signé, ticket horodaté, sur le devnet — vérifiable sur l'explorer.
4. Réglages → **Réseau** : « Tester la connexion » (vert, latence affichée), endpoint faux → **erreur honnête**, retour au RPC public.
5. Réglages → **Quitter le réseau** : sortie signée, soldes relâchés.

> ⚠️ APK construit en CI sans le secret trésor (gabarit démo) : configurez le secret `TREASURY_SECRET_DEVNET` pour que le lot de bienvenue parte de la vraie clé, ou utilisez un build local avec la vraie clé.
