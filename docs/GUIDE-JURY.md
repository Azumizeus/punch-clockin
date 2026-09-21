---
title: Judge guide / Guide du jury — PUNCH
langues: English then Français
---

# How to test PUNCH / Comment tester PUNCH

## English

### 1. Install

```bash
cd punch-native
npm install
npx expo start -c
```

Scan the QR code with Expo Go, or install a dev build on a Solana Seeker phone (or any Android device with a Solana Mobile Wallet Adapter–compatible wallet installed, e.g. Phantom or Solflare, set to devnet).

### 2. Connect for real

On the entry screen ("CLOCK IN"), tap the connect button. This opens Mobile Wallet Adapter and asks you to authorize on devnet. Do this with a real wallet, not the demo fallback, to see real transactions.

A brand-new wallet starts at zero — that's correct, it's real. Within a few seconds the app sends it a real welcome grant from the app's treasury (0.05 SOL for fees, 5 USDC, 20 USDT-devnet, 5,000 SKR-devnet). You can verify this arriving live on a devnet explorer using your wallet address.

### 3. Punch in

Tap the bolt. This signs a real memo transaction (`PUNCH <date>`) on devnet through your wallet. After it confirms, you get a paper-style ticket: time, country, the 92/3/5 rule printed on it, and an on-chain stamp if the globe pulse fired.

### 4. Try the money features — each asks for a real signature

- **Board → Pay someone**: locks real funds from your wallet into the app's treasury (a real SPL transfer), then creates a job others can fill.
- **A job on the board → Get paid**: the treasury sends the worker's share to your wallet — a real transfer, not a local number.
- **Wallet → Swap**: two real transfers (you → treasury, treasury → you) at a fixed rate.
- **Wallet → Stake / Unstake**: real SPL transfers to/from the treasury; unstaking has a small real fee (1.5%) that funds the protocol and SKR holders.
- **Home → Say hi to a nearby Seeker**: the treasury pays you $0.10 USDC, a real transfer.
- **Settings or Split → Leave the network**: signs a real "leave" transaction, honestly decrements the shared counters (crew online, world map), disconnects you. Reconnecting requires a fresh real authorization.

### 5. What to look at as a judge

- Every action above should trigger your wallet's signing prompt. If it doesn't, something is wrong.
- The treasury address is `FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn` — check it on a devnet explorer (e.g. explorer.solana.com, cluster=devnet) before and after your actions to see balances move for real.
- The globe (World tab) uses real drag physics — grab it and let go, it keeps spinning and decays naturally.
- **Settings → Network**: paste YOUR OWN RPC endpoint (Helius, QuickNode…) and hit **Test connection** — a real `getSlot` ping shows the latency or the honest failure reason. Nothing leaves the phone, and every on-chain flow switches to your endpoint instantly. The public devnet rate-limits; your endpoint doesn't have to.
- Try the interactive guide from Settings ("Start the tour") for a scripted walkthrough of the whole economy.
- Try the identities in Settings — **Gold Seeker Premium** (default) and **Seeker Nuit**: two color identities, one composition. Your tickets are stored in **History** (Settings → History) with every signature clickable on the devnet explorer.
- Every failure is honest: if a transaction can't land (offline, RPC rate-limited, signature refused), the app shows the exact reason and nothing changes. Try airplane mode during a swap: you get a clean error, and the explorer proves nothing happened.

---

## Français

### 1. Installer

```bash
cd punch-native
npm install
npx expo start -c
```

Scanne le QR code avec Expo Go, ou installe un build de dev sur un téléphone Solana Seeker (ou tout appareil Android avec un wallet compatible Mobile Wallet Adapter installé, ex. Phantom ou Solflare, réglé sur devnet).

### 2. Se connecter en vrai

Sur l'écran d'entrée ("CLOCK IN"), touche le bouton de connexion. Ça ouvre Mobile Wallet Adapter et demande une autorisation sur devnet. Fais-le avec un vrai wallet, pas le mode démo, pour voir de vraies transactions.

Un wallet tout neuf démarre à zéro — c'est normal, c'est réel. En quelques secondes, l'app lui envoie un vrai lot de bienvenue depuis le trésor de l'app (0,05 SOL pour les frais, 5 USDC, 20 USDT-devnet, 5 000 SKR-devnet). Tu peux vérifier ça arriver en direct sur un explorateur devnet avec ton adresse de wallet.

### 3. Pointer

Touche l'éclair. Ça signe une vraie transaction mémo (`PUNCH <date>`) sur devnet via ton wallet. Une fois confirmée, tu reçois un ticket façon papier : l'heure, le pays, la règle 92/3/5 imprimée dessus, et un tampon on-chain si le pulse du globe s'est déclenché.

### 4. Teste les fonctionnalités d'argent — chacune demande une vraie signature

- **Missions → Payer quelqu'un** : bloque de vrais fonds de ton wallet dans le trésor de l'app (vrai transfert SPL), puis crée une mission que d'autres peuvent remplir.
- **Une mission → Être payé** : le trésor envoie la part du travailleur à ton wallet — un vrai transfert, pas un chiffre local.
- **Argent → Échanger** : deux vrais transferts (toi → trésor, trésor → toi) à taux fixe.
- **Argent → Garder / Relâcher du SKR** : vrais transferts SPL vers/depuis le trésor ; relâcher a un petit vrai frais (1,5 %) qui finance le protocole et les détenteurs de SKR.
- **Accueil → Dire bonjour à un Seeker à côté** : le trésor te paie 0,10 $ USDC, un vrai transfert.
- **Réglages ou La part → Quitter le réseau** : signe une vraie transaction de "sortie", décrémente honnêtement les compteurs partagés (crew en ligne, carte du monde), te déconnecte. Se reconnecter demande une nouvelle vraie autorisation.

### 5. Ce qu'il faut regarder en tant que juge

- Chaque action ci-dessus doit déclencher la fenêtre de signature de ton wallet. Si ce n'est pas le cas, quelque chose ne va pas.
- L'adresse du trésor est `FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn` — vérifie-la sur un explorateur devnet (ex. explorer.solana.com, cluster=devnet) avant/après tes actions pour voir les soldes bouger pour de vrai.
- Le globe (onglet Monde) utilise une vraie physique de glissement — attrape-le et lâche-le, il continue de tourner et ralentit naturellement.
- **Réglages → Réseau** : colle TON endpoint RPC (Helius, QuickNode…) et appuie sur **Tester la connexion** — un vrai ping `getSlot` affiche la latence ou la vraie raison de l'échec. Rien ne quitte le téléphone, et tous les flux on-chain passent instantanément sur ton endpoint. Le devnet public sature ; le tien n'a pas à le faire.
- Essaie le mode d'emploi interactif depuis Réglages ("Commencer le mode d'emploi") pour une visite guidée de toute l'économie.
- Essaie les identités dans Réglages — **Gold Seeker Premium** (défaut) et **Seeker Nuit** : deux identités de couleur, une seule composition. Tes tickets sont conservés dans l'**Historique** (Réglages → Historique) avec chaque signature cliquable vers l'explorer devnet.
- Chaque échec est honnête : si une transaction n'aboutit pas (hors ligne, RPC saturé, signature refusée), l'app affiche la vraie raison et rien ne bouge. Essaie le mode avion pendant un échange : erreur propre, et l'explorer prouve que rien n'a eu lieu.
