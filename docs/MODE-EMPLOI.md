---
titre: Mode d'emploi — PUNCH
mise à jour: 20 septembre 2026
---

# Mode d'emploi

PUNCH est l'appli de pointage du réseau Nexus, sur téléphone Solana Seeker. Chaque action qui touche à l'argent est une **vraie transaction Solana** signée dans ton Seed Vault — sur devnet, les jetons n'ont pas de valeur, mais rien n'est jamais simulé.

## 1. Avant de commencer

- Un téléphone **Solana Seeker** avec **Seed Vault** configuré.
- Une connexion internet (devnet est interrogé en direct).
- L'APK installé (`punch-native/android/app/build/outputs/apk/release/app-release.apk`, build arm64 signé — pas besoin d'Expo Go).

> **Ton wallet démarre à zéro ?** À la première connexion, l'appli te crédite un **lot de bienvenue** payé par le trésor du réseau : **0,05 SOL + 5 USDC + 20 USDT + 5 000 SKR**. C'est ce qui te permet de tester tous les flux sans jamais avoir besoin de faucet.

## 2. Première ouverture

1. Choisis ta **langue** (français ou anglais).
2. L'écran **CLOCK IN** s'affiche → tape **Connecter**.
3. Le **Seed Vault** te demande l'autorisation → accepte.
4. Le lot de bienvenue arrive, les soldes apparaissent dans l'onglet **Argent**.

## 3. Le quotidien

| Action | Où | Ce qui se passe |
|---|---|---|
| **Pointer** | CLOCK IN → gros cadran | Memo `PUNCH <date>` signée par ton wallet. Ticket avec l'heure + signature cliquable. Re-pointage possible après 24 h. |
| **Missions** | Missions | Prends une mission : le trésor te paie à la validation (transaction réelle). Tu peux en poster une toi-même. |
| **Argent** | Argent | Soldes SOL/USDC/USDT/SKR, **swap** entre jetons, **stake** (mise sous séquestre de SKR) et **unstake** (frais de retrait 1,5 %, le net est libéré). |
| **Dire bonjour** | CLOCK IN → « À proximité » | Tu salue un Seeker proche : petit paiement réel. |
| **Globe** | Globe | Rotation à inertie (drag), tap un pays. |
| **Quitter** | Réglages → Quitter le réseau | Transaction de sortie obligatoire, compteurs partagés honnêtement décrémentés. Tu peux revenir quand tu veux. |

Chaque flux ouvre un **reçu** avec la ligne **Tx** : elle ouvre l'explorateur devnet sur la vraie transaction. Si tu ne vois pas la signature dans l'explorateur, c'est que ça n'a pas eu lieu — l'appli ne ment jamais.

## 4. Personnaliser l'apparence

### 4 thèmes × 3 habillages = 12 apparences

- **Thèmes** (couleurs) : **Sombre**, **Clair**, **Or noir** (✦), **Or clair** (✧) — les boutons sont dans la barre du haut et dans Réglages.
- **Habillages** (forme + typo + composition), boutons **A B C** dans la barre du haut, sur tous les écrans :
  - **A — Horloge d'usine** : tout en mono IBM Plex, pilules, cadran à anneau or, horloge `— HH:MM:SS —`. En thème clair : jaune machine.
  - **B — Ticket de pointeuse** : tout en Fraunces serif, angles vifs, ticket à bordure pointillée **qui s'enfonce sous le doigt**.
  - **C — Hardware Seeker** : monolithe noir dans **tous** les thèmes, lignes effacées, onglets `‖ DOM / 2 VUE`.
- Le choix est **persistant** (il survit à la fermeture complète de l'app).

### Écran de veille

Réglages → **Veille** → 10 s / 30 s / 60 s / Off. Après le délai d'inactivité, l'écran affiche **ton** style CLOCK IN (ta combinaison thème + habillage) avec l'heure en direct. Un tap réveille l'app exactement où tu l'avais laissée.

## 5. Dépannage

- **« Session expirée — rouvre ton portefeuille pour signer »** — normal : le token d'autorisation est volontairement purgé à chaque relance (règle Seed Vault). Va sur **CLOCK IN** et re-tape **Connecter** : une nouvelle autorisation, et tout remarche. Les paiements *du trésor vers toi* restent possibles même sans session.
- **« Transaction refusée ou échouée »** — vérifie ta connexion, puis ton SOL (les frais partent de ton wallet). L'erreur exacte est journalisée (`[PUNCH-TX]` dans logcat) : aucune transaction n'est jamais perdue en silence.
- **Je ne vois rien bouger** — ouvre la ligne **Tx** du reçu dans l'explorateur : c'est la seule source de vérité.
- **L'app redémarre après une désinstallation** — tes réglages locaux sont effacés et le lot de bienvenue re-part (le trésor paie un nouveau wallet). Pour une simple mise à jour : installer l'APK **par-dessus** (`adb install -r`), sans désinstaller.
- **L'écran ne s'allume plus en veille** — la veille se désactive dans Réglages → Veille → Off.

## 6. Script démo (jury, 2 minutes)

1. Ouvrir l'app → **Connecter** (nouvelle autorisation Seed Vault).
2. **Pointer** → signer → montrer le ticket et sa signature sur l'explorateur.
3. **Argent** → **Swap** 500 SKR → USDC → signer → reçu.
4. **Argent** → **Stake** 1 000 SKR → signer → reçu. Puis **Unstake** → frais 1,5 % visibles.
5. Barre du haut → taper **A**, **B**, **C** : toute l'app change de design en direct, sous les yeux du jury.
6. ✦/✧ pour balayer les 4 thèmes.
7. Poser le téléphone → écran de veille du style courant → tap pour réveiller.

## 7. Règles du produit (jamais négociables)

- La règle **92 / 3 / 5** est affichée sur chaque reçu, jamais cachée.
- Aucune géolocalisation précise n'est stockée — **le pays seulement**.
- Aucune fonctionnalité qui touche à l'argent n'est simulée : **une vraie transaction ou rien**.
