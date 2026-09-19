# PUNCH — CLOCK IN

> **Note (EN):** This document is in French. See the root `README.md` for an English overview, and `docs/GUIDE-JURY.md` for the bilingual judge guide.

App mobile native (Expo / React Native) pour le hackathon Solana Mobile **CLOCK IN**. Fait partie de l'écosystème **Nexus Seeker** (PUNCH est le produit "présence" ; PLI, le produit "secret scellé", est un projet séparé, non touché ici).

PUNCH transforme le pointage en preuve on-chain : tu pointes une fois par jour, une vraie transaction Solana (devnet) enregistre ta présence, et l'app te montre honnêtement qui garde quoi sur chaque paiement (92 % toi / 3 % détenteurs de SKR / 5 % l'app).

## Ce qui est réel (pas simulé)

- **Pointage** : mémo signé via Seed Vault (Mobile Wallet Adapter), transaction devnet réelle.
- **Quitter le réseau** : même principe — décrémente honnêtement les compteurs partagés (crew en ligne, carte du monde), oblige à une vraie reconnexion pour revenir.
- **Stake / unstake / swap / paiements de missions** : vrais transferts SPL sur devnet entre le wallet de l'utilisateur et un trésor applicatif (`FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn`).
- **Tokens** : USDC = vrai mint devnet officiel de Circle. USDT et SKR = mints SPL devnet créés pour la démo (le vrai token mainnet SKR de Solana Mobile existe, mais pas sur devnet).
- **Frais protocole** réels sur pointage, sortie du réseau, et retrait de SKR misé — crédités au trésor et aux détenteurs de SKR.

## Structure

```
app/
  (tabs)/        punch, board, globe, wallet, split, settings
  connect.tsx    écran d'entrée "CLOCK IN"
  guide.tsx      mode d'emploi interactif (8 étapes)
  shift.tsx, post.tsx, receipt.tsx
lib/
  punch/         store Zustand, thèmes (dark/light/gold), traductions FR/EN, formules
  solana/        wallet Seed Vault, transferts SPL réels, config devnet
```

## Lancer le projet

```bash
npm install
npx expo start -c
```

Scanne le QR code avec Expo Go (ou ton build de dev). Connecte-toi en réel (Seed Vault) pour voir l'économie devnet fonctionner : un petit lot de bienvenue (SOL + USDC + USDT + SKR) t'est envoyé automatiquement à la première connexion.

## Documentation

Voir le dossier `../docs/` : feuille de route, pitch pour le jury, mode d'emploi bilingue, et le document de contexte complet (`AEGIS-7`).
