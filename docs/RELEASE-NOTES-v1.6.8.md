# PUNCH — release v1.6.8

**Signed APK (arm64):** [`punch-clockin-seeker-v1.6.8.apk`](https://github.com/Azumizeus/punch-clockin/releases/tag/v1.6.8) — built & signed by CI (treasury secret injected at build time, proven by key derivation), SHA-256 in the attached `.sha256` file.

**APK signé (arm64) :** même fichier — construit et signé par la CI (secret trésor injecté au build, prouvé par dérivation), SHA-256 dans le fichier `.sha256` joint.

## New in v1.6.8 — honesty extends to social data / L'honnêteté va jusqu'aux données sociales

**EN —** House rule: the app never presents simulated data as real. The **“People here”** stat and the **live feed** are a simulated social network in demo mode: the stat is now labeled **“Demo · live”**, and a note under nearby Seekers explicitly separates simulated (neighborhood, feed) from real (punch-ins, payments, balances — on-chain). Money itself has never been simulated: every punch-in, payment, swap, stake or leave is still a **real Seed Vault signed transaction**, verifiable on explorer.solana.com (devnet).

**FR —** Règle de la maison : l'app ne présente jamais comme réel ce qui ne l'est pas. La statistique **« Personnes là »** et le **flux live** sont un réseau social simulé en démo : la stat est désormais étiquetée **« Démo · en direct »** et une note sous les Seekers proches sépare explicitement le simulé (voisinage, feed) du réel (pointages, paiements, soldes — on-chain). L'argent, lui, n'a jamais été simulé : chaque pointage, paiement, swap, stake ou sortie reste une **vraie transaction signée Seed Vault**, vérifiable sur explorer.solana.com (devnet).

## Reminder v1.6.7 — real treasury in CI + custom RPC / Rappel v1.6.7

**EN —** The `TREASURY_SECRET_DEVNET` secret is injected by CI at build time: welcome grants and payments come from the real treasury, and the workflow **refuses any build without the secret**. Settings → **Network**: choose your own RPC endpoint, test ping with measured latency, one-tap return to the public RPC.

**FR —** Le secret `TREASURY_SECRET_DEVNET` est injecté par la CI au build : les lots de bienvenue et paiements partent du trésor réel, et le workflow **refuse tout build sans secret**. Réglages → **Réseau** : endpoint RPC au choix, ping de test avec latence mesurée, retour au RPC public en un tap.

## Install

```bash
adb install -r punch-clockin-seeker-v1.6.8.apk
```

**Judge guide (EN first):** [docs/GUIDE-JURY.md](https://github.com/Azumizeus/punch-clockin/blob/master/docs/GUIDE-JURY.md) · **Guide jury (FR):** même fichier, français en seconde partie.
