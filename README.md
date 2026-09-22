# PUNCH — proof of presence on Solana

> **FR :** PUNCH est l'app du hackathon **CLOCK IN** (Solana Mobile) : tu pointes une fois par jour depuis un vrai téléphone Seeker, une vraie transaction Solana (devnet) prouve ta présence, et l'économie qui en découle suit une règle unique, affichée partout : **92 % à la personne qui a fait le geste, 3 % aux détenteurs de SKR, 5 % à l'app**. Fais partie de l'écosystème **Nexus Seeker**.

**EN:** PUNCH is our entry for the **CLOCK IN** hackathon (Solana Mobile): punch in once a day from a real Seeker phone, a real Solana transaction (devnet) proves your presence, and the resulting economy follows one rule, printed everywhere: **92% to the person who showed up, 3% to SKR holders, 5% to the app**. Part of the **Nexus Seeker** ecosystem.

**EN — judges, start here:** open [`docs/GUIDE-JURY.md`](docs/GUIDE-JURY.md) (English first) for a step-by-step test of the app, and [`docs/PITCH-JURY.md`](docs/PITCH-JURY.md) for the pitch. Every money-related action in the app is a **real signed devnet transaction** — nothing is simulated. Signed APK: [GitHub Release v1.6.7](https://github.com/Azumizeus/punch-clockin/releases/latest) — `punch-clockin-seeker-v1.6.7.apk` (arm64, identité Seeker Premium, RPC personnalisé + test de connexion, **trésor réel injecté en CI**).

## Démarrage rapide / Quick start

```bash
cd punch-native
npm install
npx expo start -c
```

Scan the QR code with Expo Go, or flash the signed APK on a Seeker / any Android device with a Mobile Wallet Adapter wallet (Phantom, Solflare — devnet).

## Contenu du dépôt / Repository layout

| Chemin / Path | Contenu / Contents |
|---|---|
| `punch-native/` | L'app mobile native (Expo / React Native) — l'entrée du hackathon. Native mobile app (Expo / React Native) — the hackathon entry. |
| `docs/` | Documentation bilingue pour le jury : pitch, guide de test, mode d'emploi, roadmap, plan de test. Bilingual judge docs: pitch, test guide, user guide, roadmap, test plan. |
| `punch app grok/PUNCH-ABC/`, `.../PUNCH-CLOCK-IN-19sept2026/` | App web de design (source de vérité visuelle) et exports datés. Web design source (visual source of truth) and dated exports. |

## Docs principales / Main docs

- [`docs/PITCH-JURY.md`](docs/PITCH-JURY.md) — le pitch, EN puis FR / the pitch, EN first then FR
- [`docs/GUIDE-JURY.md`](docs/GUIDE-JURY.md) — comment tester, EN puis FR / how to test, EN first then FR
- [`docs/MODE-EMPLOI.md`](docs/MODE-EMPLOI.md) — mode d'emploi / user guide (EN + FR)
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — ce qui est fait, ce qui reste / done & next
- [`docs/AEGIS-7.md`](docs/AEGIS-7.md) — document "cerveau" interne (FR) / internal project brain (FR)
- [`docs/TEST-PLAN.md`](docs/TEST-PLAN.md) — plan de validation interne (FR) / internal test plan (FR)
- [`docs/README-NATIVE.md`](docs/README-NATIVE.md) — détails techniques de `punch-native/` (FR) / technical details (FR)

## L'économie en une ligne / The economy in one line

> "Tu te présentes. Tu es payé. 92 / 3 / 5."
> "You show up. You get paid. 92 / 3 / 5."

Trésor devnet / devnet treasury: `FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn` — [voir sur l'explorer / view on explorer](https://explorer.solana.com/address/FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn?cluster=devnet).
