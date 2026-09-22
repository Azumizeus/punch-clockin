# PUNCH — release v1.6.8

**APK signé (arm64) :** [`punch-clockin-seeker-v1.6.8.apk`](https://github.com/Azumizeus/punch-clockin/releases/tag/v1.6.8) — construit et signé par la CI (secret trésor injecté au build, prouvé par dérivation), SHA-256 dans le fichier `.sha256` joint.

## Nouveau dans v1.6.8 — l'honnêteté va jusqu'aux données sociales

La règle de la maison : **l'app ne présente jamais comme réel ce qui ne l'est pas.**

- La statistique **« Personnes là »** et le **flux live** sont un réseau social simulé en démo : la stat est désormais étiquetée **« Démo · en direct »** et une note sous les Seekers proches sépare explicitement le simulé (voisinage, feed) du réel (pointages, paiements, soldes — on-chain).
- L'argent, lui, n'a jamais été simulé : chaque pointage, paiement, swap, stake ou sortie reste une **vraie transaction signée Seed Vault**, vérifiable sur explorer.solana.com (cluster devnet).

## Rappel v1.6.7 — trésor réel en CI + RPC au choix

- Le secret `TREASURY_SECRET_DEVNET` est injecté par la CI au build : les lots de bienvenue et paiements partent du trésor réel, et le workflow **refuse tout build sans secret**.
- Réglages → **Réseau** : endpoint RPC au choix, ping de test avec latence mesurée, retour au RPC public en un tap.

## Installer

```bash
adb install -r punch-clockin-seeker-v1.6.8.apk
```
