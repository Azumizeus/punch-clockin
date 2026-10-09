# PUNCH : Clock'in — release v1.7.0

**Signed APK (arm64):** [`punch-clockin-seeker-v1.7.0.apk`](https://github.com/Azumizeus/punch-clockin/releases/tag/v1.7.0) — built & signed by CI (treasury secret injected at build time), SHA-256 in the attached `.sha256` file.

**APK signé (arm64) :** même fichier — construit et signé par la CI (secret trésor injecté au build), SHA-256 dans le fichier `.sha256` joint.

**Demo videos / vidéos démo :** [`punch-clockin-demo-fr.mp4`](https://github.com/Azumizeus/punch-clockin/releases/download/v1.7.0/punch-clockin-demo-fr.mp4) · [`punch-clockin-demo-en.mp4`](https://github.com/Azumizeus/punch-clockin/releases/download/v1.7.0/punch-clockin-demo-en.mp4) — filmed on a real Seeker, every Seed Vault signature real (FR 2 min 17 · EN 2 min 23).

## New in v1.7.0 — one tap a day / UN pointage par jour

**EN —** Product rule now printed on-chain: **one punch-in per day**. A same-day punch is refused (the ledger counts calendar days, matching the memo `PUNCH <date>`), plus a 75 s demo cooldown between punches so the judge can replay without spamming the devnet. Everything else is unchanged: every punch, payment, swap, stake and exit is a **real Seed Vault signed transaction**; social data stays honestly labeled "Demo · live".

**FR —** Règle produit désormais alignée on-chain : **UN pointage par jour**. Un pointage le même jour est refusé (le registre compte les jours calendaires, aligné sur le mémo `PUNCH <date>`), plus un cooldown démo de 75 s entre deux pointages pour que le jury puisse rejouer sans spammer le devnet. Le reste est inchangé : chaque pointage, paiement, swap, stake et sortie reste une **vraie transaction signée Seed Vault** ; les données sociales restent honnêtement étiquetées « Démo · en direct ».

## Reminder v1.6.9 / v1.6.8 / Rappel

**EN —** Real treasury in CI (`TREASURY_SECRET_DEVNET` required, refus de construire sans), Settings → Network lets you choose your own RPC and test it, and the honesty rule: simulated social data is labeled, money is never simulated.

**FR —** Trésor réel en CI (secret obligatoire, refus de construire sans), Réglages → Réseau : RPC au choix + test ping, et la règle d'honnêteté : les données sociales simulées sont étiquetées, l'argent n'est jamais simulé.

## Install

```bash
adb install -r punch-clockin-seeker-v1.7.0.apk
```

**Judge guide (EN first):** [docs/GUIDE-JURY.md](https://github.com/Azumizeus/punch-clockin/blob/master/docs/GUIDE-JURY.md) · **Guide jury (FR):** même fichier, français en seconde partie.
