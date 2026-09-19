---
titre: Plan de test — validation avant démo / soumission hackathon
mise à jour: 19 septembre 2026
---

> **Note (EN):** This test plan is in French. For a bilingual step-by-step walkthrough of the app, read `GUIDE-JURY.md` (English first, then French).

# Plan de test PUNCH

À donner tel quel à quiconque reprend le code (dev, autre IA) pour valider que tout fonctionne avant la démo.

## 0. Avant de toucher au code

Lire dans l'ordre : `docs/AEGIS-7.md` (contexte complet), puis `lib/punch/store.ts`, `lib/solana/wallet.ts`, `lib/solana/devnetConfig.ts`. Ne rien "corriger" sans avoir lu ces trois fichiers — plusieurs choix (mints custom devnet, clé du trésor embarquée, comptage du staking côté app) sont volontaires, pas des oublis.

## 1. Build — doit passer sans erreur

```bash
cd punch-native
npm install
npx tsc --noEmit
npx expo start -c
```

`tsc` peut sortir quelques erreurs pré-existantes bénignes (types manquants pour `@solana/spl-token`, un `shift` possiblement `undefined` dans `shift.tsx`, un souci de type MMKV) — ce ne sont pas des régressions, elles existaient avant. Toute NOUVELLE erreur doit être corrigée avant de continuer.

## 2. Vérifier l'état du trésor AVANT de tester

Le trésor devnet (`FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn`) paie un lot de bienvenue à chaque nouveau wallet connecté (0,05 SOL + 5 USDC + 20 USDT + 5000 SKR). Avant une session de test avec plusieurs testeurs ou avant la démo devant jury :

- Vérifier son solde SOL, USDC, USDT-devnet, SKR-devnet sur https://explorer.solana.com/address/FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn?cluster=devnet
- Si SOL ou USDC bas : redemander via https://faucet.solana.com (SOL) et https://faucet.circle.com (USDC devnet, 20 USDC/2h par adresse).
- USDT-devnet et SKR-devnet : ce sont nos propres mints, on peut en re-mint autant que nécessaire (mint authority = le trésor lui-même).

## 3. Tests fonctionnels — checklist à cocher

Connexion et onboarding :
- [ ] Écran "CLOCK IN" s'affiche correctement (icône, titre, bouton).
- [ ] Connexion réelle (Seed Vault) ouvre bien Mobile Wallet Adapter et redemande l'autorisation.
- [ ] Un wallet neuf reçoit le lot de bienvenue automatiquement (vérifier sur l'explorer que le solde bouge).
- [ ] Mode démo (fallback si MWA indisponible) fonctionne toujours sans planter.

Pointage :
- [ ] Le pointage déclenche une vraie demande de signature.
- [ ] Après confirmation, le ticket papier s'affiche (heure, pays, 92/3/5, tampon on-chain si présent).
- [ ] Le cooldown empêche un second pointage avant la fin du délai démo.
- [ ] Les stats (streak, crew en ligne, gains du jour) se mettent à jour.

Argent réel (chaque action doit demander une signature ET faire bouger un vrai solde on-chain, vérifiable sur l'explorer) :
- [ ] Poster une mission (Missions → Payer quelqu'un) bloque réellement les fonds.
- [ ] Toucher un paiement de mission crédite réellement le wallet.
- [ ] Swap (n'importe quelle paire) fait deux vrais transferts.
- [ ] Stake déplace réellement du SKR vers le trésor.
- [ ] Unstake renvoie réellement du SKR (moins 1,5 % de frais) et le frais apparaît dans la trésorerie (`protocolUsdc`/`stakerUsdc` sur l'écran Split).
- [ ] "Dire bonjour" à un Seeker proche paie réellement 0,10 USDC.
- [ ] "Quitter le réseau" (Réglages ou Split) signe une vraie transaction, décrémente les compteurs partagés, déconnecte le wallet.
- [ ] Se reconnecter après avoir quitté redemande bien une nouvelle autorisation.

Globe :
- [ ] Le globe tourne tout seul au repos (idle spin).
- [ ] Glisser le globe change la vitesse de rotation, relâcher laisse un momentum qui ralentit progressivement.
- [ ] Taper un pays sélectionne bien ce pays (pas un drag accidentel).

Thèmes et langue :
- [ ] Dark, Light, Gold changent bien toute l'app.
- [ ] Le thème choisi survit à la fermeture complète de l'app (pas juste mise en arrière-plan).
- [ ] FR/EN change tous les textes visibles, y compris dans le guide.

Mode d'emploi (Réglages → Commencer le mode d'emploi) :
- [ ] Les 8 étapes s'enchaînent, le bouton "Suivant" reste désactivé tant que l'étape n'est pas complétée quand c'est demandé.
- [ ] La dernière étape ramène bien à l'app.

## 4. Tests de robustesse (cas d'échec)

- [ ] Couper le réseau du téléphone pendant une transaction : l'app doit afficher une erreur ("transaction refusée ou échouée"), jamais planter ni faire semblant que ça a marché.
- [ ] Refuser une signature dans le wallet : même chose, message d'erreur propre, aucun solde local modifié.
- [ ] RPC devnet public parfois limité (429) : un échec ponctuel ne doit pas casser l'app, l'utilisateur peut réessayer.

## 5. Prêt pour la démo / le jury

- [ ] `docs/GUIDE-JURY.md` (ou `.html`) suivi de bout en bout par quelqu'un qui n'a jamais touché le code — s'il bloque quelque part, corriger le guide ou l'app.
- [ ] Le lien vers l'explorer du trésor est prêt à montrer en direct pendant la démo.
- [ ] Prévoir un build installable pour le jury :
  - Option rapide : `npx expo start` + QR code, jury doit avoir Expo Go.
  - Option robuste : `eas build --platform android --profile preview` (nécessite un compte Expo/EAS) pour un vrai `.apk` à installer directement, sans dépendre d'Expo Go.

## 6. "Envoyer sur devnet" — ce qu'il y a réellement à faire

Il n'y a rien à "déployer" sur la chaîne en plus de ce qui existe déjà : le trésor, les mints USDT/SKR-devnet, et le mint USDC-devnet de Circle sont déjà en place et fonctionnels sur devnet (`lib/solana/devnetConfig.ts`). "Envoyer l'app sur devnet" veut dire concrètement : s'assurer que l'app pointe bien vers `https://api.devnet.solana.com` (c'est déjà le cas partout), que le trésor a assez de fonds (section 2), et livrer un build installable (section 5) que le jury peut lancer sur un vrai téléphone.
