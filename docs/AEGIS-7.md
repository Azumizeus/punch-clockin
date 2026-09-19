---
titre: AEGIS-7 — document cerveau du projet PUNCH
usage: à lire en premier par tout assistant IA (Claude, Grok, autre) ou dev qui reprend le projet
mise à jour: 19 septembre 2026
---

> **Note (EN):** This document is in French. It is the project's internal "brain" — decisions and pitfalls for any AI or developer resuming the work. Jury-facing documents are in `docs/` and bilingual (English first): `PITCH-JURY.md`, `GUIDE-JURY.md`, `MODE-EMPLOI.md`.

# AEGIS-7

Ce document est le "cerveau" du projet : tout ce qu'il faut savoir pour reprendre PUNCH sans reperdre trois jours à redécouvrir les décisions déjà prises. Si tu es une IA qui vient d'ouvrir ce projet : lis ce fichier en entier avant de toucher au code.

## 1. C'est quoi, PUNCH ?

PUNCH est une app mobile native (Expo / React Native) construite pour le hackathon Solana Mobile **CLOCK IN**. Elle fait partie d'un écosystème plus large appelé **Nexus Seeker**, qui a deux produits :

- **PUNCH** (ce projet) — tu pointes une fois par jour depuis un vrai téléphone Seeker, une transaction Solana prouve ta présence, et tu accèdes à de petites missions payées.
- **PLI** — un produit séparé ("secret scellé, payant à lire, la chaîne ne voit jamais le contenu"). **PLI n'est pas touché dans ce projet.** Ne jamais construire de fonctionnalité PLI ici sauf demande explicite.

L'idée centrale : la preuve de présence humaine (un vrai téléphone Seeker, pas un bot) devient une monnaie. Chaque paiement suit la même règle partout dans l'app : **92 % à la personne qui a fait le geste, 3 % à ceux qui gardent du SKR, 5 % à l'app (le créateur)**. Cette règle est affichée partout, jamais cachée.

## 2. Les deux bases de code

Il y a DEUX projets distincts, ne jamais les confondre :

1. **`punch-native`** (`C:\Users\admin\Desktop\PUNCH\punch-native`) — l'app mobile Expo/React Native. **C'est celle-ci qui compte pour le hackathon.** C'est un vrai clone/miroir fonctionnel du design de l'app de base, plus des fonctionnalités premium ajoutées (voir section 5).
2. **L'app de base web** (Grok/xAI App Builder, dossier le plus récent : `C:\Users\admin\Desktop\PUNCH\punch app grok\PUNCH-CLOCK-IN-19sept2026`) — React/TanStack Router, construite dans un autre outil IA. C'est la **source de vérité du design** : polices, couleurs, copy, structure d'écran. Le native doit toujours suivre ce que fait cette base, pas l'inverse.

Règle d'or répétée plusieurs fois par l'utilisateur : **"un clone, un jumeau, un miroir"**. Toute divergence visuelle ou de copy avec l'app de base est un bug, sauf pour les fonctionnalités premium explicitement demandées en plus (section 5).

## 3. Stack technique (punch-native)

- Expo Router (routing par fichiers), groupe `(tabs)` avec header custom (`TopBar`).
- Zustand (`lib/punch/store.ts`) avec `persist` (stockage MMKV).
- `@solana-mobile/mobile-wallet-adapter-protocol-web3js` pour Seed Vault (`transact()`).
- `@solana/web3.js` + `@solana/spl-token` pour les transactions et transferts de tokens réels.
- Polices : Fraunces (titres), Figtree (corps), IBM Plex Mono (mono / reçus).
- Thèmes : `dark`, `light`, `gold` (Solana Seeker Mobile Gold, premium) — `lib/punch/theme.ts`.
- Traductions FR/EN complètes dans `lib/punch/copy.ts`.

## 4. Économie réelle sur devnet — ne JAMAIS revenir à du faux

Règle explicite de l'utilisateur, répétée plusieurs fois : **"rien de fake, que du vrai fonctionnel premium"**. Toute action qui touche à l'argent doit être une vraie transaction Solana devnet, jamais un nombre modifié localement en douce.

Infrastructure créée pour ça :

- **Trésor devnet** : `FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn`. Sa clé privée est dans `lib/solana/treasurySecretDEVNET.ts`, embarquée dans l'app **uniquement parce qu'on est en devnet** (tokens sans valeur réelle). Ne JAMAIS reproduire ça sur mainnet — il faudrait un vrai serveur backend qui garde la clé.
- **Mints** (`lib/solana/devnetConfig.ts`) :
  - USDC → vrai mint devnet officiel de Circle (`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`).
  - USDT et SKR → mints SPL devnet créés pour la démo (le vrai token mainnet SKR de Solana Mobile existe bel et bien, mais un mint n'existe jamais sur deux réseaux à la fois — donc pas sur devnet).
- **Helpers réels** (`lib/solana/wallet.ts`) : `sendUserToTreasuryTransfer`, `sendTreasuryToUserTransfer`, `sendTreasurySol`, tous de vrais transferts SPL/SOL signés.
- **Actions réelles** dans `store.ts` (async, gardées par `wallet.real`) : `punchIn` (mémo + frais d'entrée), `leaveNetwork` (mémo + frais de sortie), `stake`/`unstake` (transfert SPL + frais de retrait 1,5 %), `swap` (deux transferts, spread 0,35 %), `postShift`/`cashShift`/`greetNearby` (transferts réels).
- **Premier lien réel** (`connectReal`) : un wallet Seed Vault neuf démarre à zéro (normal). L'app lui envoie un vrai petit lot de bienvenue depuis le trésor (0,05 SOL, 5 USDC, 20 USDT, 5000 SKR) pour qu'il puisse tout de suite utiliser l'app.
- **Soldes affichés** : relus en direct depuis devnet après chaque transaction (`refreshWalletBalances`), pas stockés en dur.

Limite honnête à connaître : le SKR "misé" (`stakedSkr`) reste un compteur côté app, parce que le staking envoie tout le SKR dans le même trésor commun — sans un vrai programme Solana dédié (Rust/Anchor, hors scope ici), la chaîne ne peut pas savoir "combien appartient à qui". Le transfert lui-même est réel ; sa comptabilité par utilisateur est faite côté app.

## 5. Fonctionnalités premium ajoutées (au-delà du miroir de l'app de base)

Explicitement demandées par l'utilisateur, en plus du clone :

1. Globe avec vraie physique de rotation (constantes `IDLE=0.12 rad/s`, `DAMP=1.85`, `MAX_OMEGA=9 rad/s`, décroissance exponentielle, recalcul continu pendant le drag).
2. Globe agrandi pour remplir la largeur de l'écran.
3. Icône de l'app à côté du mot "PUNCH" dans la barre du haut.
4. Bouton "Quitter le réseau" avec vraie transaction blockchain obligatoire (section 4), plutôt qu'un simple reset local.
5. Thème premium **"Solana Seeker Mobile Gold"** (palette noir/or) sélectionnable dans Réglages et via un raccourci ✦ dans la barre du haut.
6. Frais protocole réels sur les mouvements d'argent qui n'en avaient pas (entrée/sortie du réseau, retrait de staking) — pour que le trésor de l'app soit vraiment rémunéré, pas juste affiché.
7. Un onglet Réglages en plus des 5 onglets de l'app de base (garder cet onglet — demande explicite).

## 6. Habillage visuel — état actuel (19 sept 2026)

L'app de base a été mise à jour avec un nouvel habillage (dossier `PUNCH-CLOCK-IN-19sept2026`), déjà répercuté dans le native :

- **Écran de connexion** : minimal — éclair, "CLOCK IN" en très gros, "Nexus paie la présence.", un bouton. (`app/connect.tsx`)
- **Après le pointage** : le ticket papier remplace l'ancien écran "punché" — carte couleur papier, "IN" énorme, l'heure, le pays, la règle 92/3/5 imprimée, tampon on-chain si disponible. (`app/(tabs)/index.tsx`)
- **Mode d'emploi interactif** : 8 étapes (`app/guide.tsx`), accessible depuis Réglages. Adapté pour PUNCH seul — l'étape PLI reste informative, sans bouton fonctionnel (PLI n'est pas construit ici).

## 7. Pièges déjà rencontrés (ne pas refaire)

- Ne jamais généraliser un rayon de bordure : certains boutons sont des pilules (`999`), d'autres non (`8`/`12`/`16` selon la taille cva `sm`/`md`/`lg`). Vérifier le vrai `button.tsx` de l'app de base avant de "corriger".
- Ne jamais confondre le dossier `punch-app/src` (ancien, supprimé) avec `punch-app/punch-app/src` (bon) ou les nouveaux exports datés type `PUNCH-CLOCK-IN-19sept2026` (le plus récent fait foi).
- Les labels de boutons doivent décrire honnêtement l'action : un bouton qui déclenche une vraie transaction et vide le compteur partagé ne doit jamais s'appeler "Recommencer la démo".
- Toute nouvelle fonctionnalité qui touche à l'argent doit être une vraie transaction devnet dès le départ — pas un nombre local "en attendant".

## 8. Où trouver le reste

- `README.md` (racine) — présentation bilingue du projet pour le jury et les visiteurs du dépôt.
- `docs/ROADMAP.md` — ce qui est fait, ce qui reste, vision long terme.
- `docs/PITCH-JURY.md` — pourquoi cette app, pour qui, ce qu'elle fait, pourquoi c'est fun (bilingue).
- `docs/GUIDE-JURY.md` — mode d'emploi pas-à-pas pour tester l'app (bilingue).
