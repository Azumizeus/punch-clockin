---
titre: Mode d'emploi — PUNCH
mise à jour: 21 septembre 2026
---

# Mode d'emploi

PUNCH est l'appli de pointage du réseau Nexus, sur téléphone Solana Seeker. Chaque action qui touche à l'argent est une **vraie transaction Solana** signée dans ton Seed Vault — sur devnet, les jetons n'ont pas de valeur, mais rien n'est jamais simulé.

## 1. Avant de commencer

- Un téléphone **Solana Seeker** avec **Seed Vault** configuré.
- Une connexion internet (devnet est interrogé en direct).
- L'APK installé ([dernière GitHub Release](https://github.com/Azumizeus/punch-clockin/releases/latest), build arm64 signé — pas besoin d'Expo Go).

> **Ton wallet démarre à zéro ?** À la première connexion, l'appli te crédite un **lot de bienvenue** payé par le trésor du réseau : **0,05 SOL + 5 USDC + 20 USDT + 5 000 SKR**. C'est ce qui te permet de tester tous les flux sans jamais avoir besoin de faucet.

## 2. Première ouverture

1. Choisis ta **langue** (français ou anglais).
2. L'écran **CLOCK IN** s'affiche → tape **Connecter**.
3. Le **Seed Vault** te demande l'autorisation → accepte.
4. Le lot de bienvenue arrive, les soldes apparaissent dans l'onglet **Argent**.

## 3. Le quotidien

| Action | Où | Ce qui se passe |
|---|---|---|
| **Pointer** | Accueil → gros cadran | Memo `PUNCH <date>` signée par ton wallet. Ticket avec l'heure + tampon on-chain cliquable. Re-pointage possible après le délai de la session démo (75 s). |
| **Missions** | Missions | Prends une mission : le trésor te paie à la validation (transaction réelle). Tu peux en poster une toi-même (fonds réellement bloqués). |
| **Argent** | Argent | Soldes USDC/USDT/SKR rechargés en direct depuis devnet, **échange** entre jetons (frais 0,35 % affichés avant), **garder** (stake) et **relâcher** (frais de retrait 1,5 %) du SKR. |
| **Dire bonjour** | Accueil → « Seekers près de toi » | Tu salues un Seeker proche : le trésor te paie 0,10 USDC en réel + bonus SKR. Compteurs et classement dans l'onglet **Bonjours**. |
| **Globe** | Monde | Rotation à inertie (drag), tap un pays. |
| **Historique** | Argent → Historique des tickets | Les 100 derniers reçus, rouvrables, signature cliquable. |
| **Quitter** | Réglages → Quitter le réseau | Transaction de sortie obligatoire, compteurs partagés honnêtement décrémentés. Tu peux revenir quand tu veux. |

Chaque flux ouvre un **reçu** avec la ligne **Tx** : elle ouvre l'explorateur devnet sur la vraie transaction. Si tu ne vois pas la signature dans l'explorateur, c'est que ça n'a pas eu lieu — l'appli ne ment jamais.

## 4. Personnaliser l'apparence

### Une seule composition, deux identités de couleur

PUNCH porte **une seule identité** : **Seeker Premium** — monolithe noir chaud, or vrai, tickets ivoire à bordure pointillée qui s'enfonce sous le doigt, onglets hardware et horloge locale en direct.

Dans **Réglages → Identité**, deux identités de couleur (même composition) :
- **✦ Gold Seeker Premium** (défaut) — l'original : noir chaud, or champagne, encre brûlée.
- **☾ Seeker Nuit** (option) — noir bleuté, argent de lune, tickets ardoise.

Le choix est **persistant** (il survit à la fermeture complète de l'app). Un badge lingot rappelle ton identité sur l'écran Argent.

## 5. Dépannage

- **« Session expirée — rouvre ton portefeuille pour signer »** — normal : le token d'autorisation est volontairement purgé à chaque relance (règle Seed Vault). Va sur **CLOCK IN** et re-tape **Connecter** : une nouvelle autorisation, et tout remarche. Les paiements *du trésor vers toi* restent possibles même sans session.
- **« RPC devnet saturé » / « Connexion réseau perdue » / « Signature refusée »** — la vraie raison est affichée pour chaque flux (pointage, missions, bonjour, échange, staking) : vérifie ta connexion puis ton SOL (les frais partent de ton wallet), et réessaie. Rien n'est jamais perdu en silence ni simulé.
- **Je ne vois rien bouger** — ouvre la ligne **Tx** du reçu dans l'explorateur : c'est la seule source de vérité.
- **L'app redémarre après une désinstallation** — tes réglages locaux sont effacés et le lot de bienvenue re-part (le trésor paie un nouveau wallet). Pour une simple mise à jour : installer l'APK **par-dessus** (`adb install -r`), sans désinstaller.

## 6. Script démo (jury, 2 minutes)

1. Ouvrir l'app → **Connecter** (nouvelle autorisation Seed Vault).
2. **Pointer** → signer → montrer le ticket et son **tampon on-chain** sur l'explorateur.
3. **Dire bonjour** à un Seeker proche → 0,10 USDC réels, ticket dans l'**Historique**.
4. **Argent** → **Échanger** 100 SKR → USDC → signer → reçu (frais 0,35 % affichés avant).
5. **Argent** → **Garder** du SKR → signer. Puis **Relâcher** → frais 1,5 % visibles.
6. **Réglages → Identité** → basculer ✦ Gold / ☾ Nuit sous les yeux du jury.
7. Finir sur l'écran Split : la règle 92/3/5 et la trésorerie qui l'illustre.

## 7. Règles du produit (jamais négociables)

- La règle **92 / 3 / 5** est affichée sur chaque reçu, jamais cachée.
- Aucune géolocalisation précise n'est stockée — **le pays seulement**.
- Aucune fonctionnalité qui touche à l'argent n'est simulée : **une vraie transaction ou rien**.
