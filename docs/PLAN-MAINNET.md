# Plan de migration mainnet — post-hackathon CLOCK IN

> **Principe acté :** la candidature CLOCK IN reste **100 % devnet** (release v1.6.9, trésor `FUiCbnDh…`, mints démo). Rien de ce document ne touche la soumission.
> **Fenêtre :** après les résultats du **11 novembre 2026** (et, si on gagne, en même temps que la publication dApp Store — voir [CHECKLIST-DAPP-STORE.md](CHECKLIST-DAPP-STORE.md)).
> **Objectif :** le même produit, sur Solana mainnet-beta, avec de la vraie valeur : trésorerie réelle financée, vrais mints USDC/USDT/SKR, transactions qui coûtent et valent de l'argent.

## 0. Décisions à prendre AVANT de toucher au code

| # | Décision | Recommandation |
|---|---|---|
| D1 | Clé du trésor mainnet : qui la génère, où, qui garde la sauvegarde | Génération **offline** (machine sans internet, `solana-keygen new --no-bip39-passphrase` ou avec), sauvegarde papier + 2 emplacements physiques. Jamais dans un repo, jamais dans un secret CI à côté d'une sauvegarde numérique non chiffrée. |
| D2 | RPC mainnet | Le RPC public est trop lent pour une app grand public : prévoir un endpoint payant (Helius / QuickNode / Triton) — budget ~$49/mois au début. Le test « RPC public actif » des Réglages doit lire ce endpoint. |
| D3 | Budget de lancement trésorerie | Rent + frais + ~2 000 transactions de démo : **1–2 SOL** de carburant + la trésorerie USDC/USDT/SKR réelle (montant produit, ex. $500 USDC de départ). |
| D4 | SKR mainnet | Utiliser le **vrai mint SKR** (existe uniquement sur mainnet, cf. commentaire de `devnetConfig.ts`). Vérifier l'adresse officielle sur docs.solanamobile.com / le compte Solana Mobile au moment de la migration — ne jamais recopier une adresse non vérifiée. |
| D5 | Étapes déployées dans quel ordre | Phase 1 (code prêt, testable en devnet avec la nouvelle config par cluster) → Phase 2 (bascule mainnet) → Phase 3 (dApp Store). Voir §5. |

## 1. Trésorerie réelle

1. **Générer le keypair mainnet offline** → `treasury-mainnet.json` (format array JSON de 64 octets, identique au format actuel).
2. **Dérivation de preuve** : vérifier que la clé engendre la pubkey attendue (même méthode que la preuve devnet — dérivation locale, jamais de print de la clé).
3. **Financer** : transférer 1–2 SOL (frais + rent des ATAs) puis la réserve initiale USDC/USDT réels (+ SKR si disponible).
4. **Poser le secret CI** `TREASURY_SECRET_MAINNET` (même format que `TREASURY_SECRET_DEVNET`, cf. §3).
5. **Comptes token du trésor** : créer les ATAs USDC/USDT/SKR du trésor au premier financement (ou explicitement avec `spl-token create-account`).

## 2. Mints USDC / USDT / SKR

| Token | Devnet (aujourd'hui) | Mainnet (cible) |
|---|---|---|
| USDC | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` (vrai mint devnet Circle) | **`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`** (USDC natif mainnet, 6 décimales) |
| USDT | `4RDtZDZKfXREAn8nvagoQoJD35WdKbP7zRqdHATeMTDB` (mint démo PUNCH) | **`Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`** (USDT natif mainnet, 6 décimales — passer `TOKEN_DECIMALS.USDT` de 2 à 6) |
| SKR | `6fjyJGhNfXEDy9qFoQXCrSP7GwmWuyAZzuQw1qnSPfPk` (mint démo PUNCH, décimales 0) | **vrai mint SKR mainnet** (adresse à prélever sur la source officielle Solana Mobile, D4) |

⚠️ **Décimales USDT : 2 → 6 sur mainnet.** Tous les montants affichés/émis passent par `TOKEN_DECIMALS` : vérifier chaque conversion (reçus, missions, say-hi 0,10 $, affichage solde) avec la nouvelle valeur.

## 3. Secrets CI

1. Poser **`TREASURY_SECRET_MAINNET`** (GitHub Actions secret) = tableau JSON des 64 octets, via l'API (même méthode libsodium que pour la devnet).
2. Généraliser `punch-native/scripts/inject-treasury.mjs` : lire `process.env.TREASURY_SECRET_*` selon le cluster cible (arg `--cluster mainnet|devnet`), générer `treasurySecret<CLUSTER>.ts`.
3. Dans `.github/workflows/release.yml` : la branche/tag mainnet injecte `TREASURY_SECRET_MAINNET` ; le build devnet continue d'injecter `TREASURY_SECRET_DEVNET`. **Jamais les deux dans le même build.**
4. Garde-fou : étape CI qui **refuse un build mainnet sans secret** (déjà le comportement devnet, à dupliquer) et vérifie que la clé dérive bien la pubkey du trésor configurée (sinon échec tôt).
5. Le fichier `treasurySecret*.local.ts` reste **hors git** (déjà le cas ; revérifier `.gitignore` avant la phase mainnet).

## 4. Changements de code — de `devnetConfig` à une config par cluster

Point d'entrée unique : [`punch-native/lib/solana/devnetConfig.ts`](../punch-native/lib/solana/devnetConfig.ts).

1. **Nouveau `lib/solana/clusterConfig.ts`** :
   ```ts
   export type Cluster = "devnet" | "mainnet";
   export const CLUSTER_CONFIG: Record<Cluster, { mints, decimals, treasuryPubkey }> = { devnet: {...}, mainnet: {...} };
   export const ACTIVE_CLUSTER: Cluster = __DEV__ ? ... : "mainnet"; // choisi au build (env EXPO_PUBLIC_CLUSTER ou constante par flavour)
   ```
   Le cluster **choisi au build**, pas à l'exécution : un binaire mainnet ne doit jamais parler à devnet (et inversement).
2. **`tokens.ts`** : `DEVNET_MINTS` → `CLUSTER_CONFIG[ACTIVE_CLUSTER].mints` (l'import est déjà centralisé, un seul fichier à toucher).
3. **`wallet.ts`** : `TREASURY_PUBKEY` depuis la config active ; `TREASURY_SECRET_KEY_DEVNET` → clé du cluster actif (fichier généré `treasurySecret<CLUSTER>.ts`).
4. **Endpoint RPC** : entrer dans la config (devnet = RPC public, mainnet = endpoint payant D2) + `cluster` passé à l'explorer dans les liens « voir sur explorer » de l'app.
5. **Scripts** : `scripts/check-treasury.mjs` et `scripts/debug-cashshift.mjs` copient les adresses à la main — les faire lire le cluster cible en arg, et ajouter un `check-cluster-consistency` (pubkey dérivée == pubkey configurée).
6. **Vitest/harnais économie (54/54)** : paramétrer les tests sur les deux clusters ; les faire tourner en `ACTIVE_CLUSTER=devnet` en CI jusqu'à la bascule.

## 5. Étapes ordonnées (runbook)

**Phase 0 — préparation (devnet, sans risque)**
- [ ] Créer `clusterConfig.ts`, migrer `tokens.ts` / `wallet.ts` / scripts ; tsc 0 erreur, harnais 54/54, CI verte.
- [ ] Vérifier qu'aucun fichier n'embarque encore la chaîne « devnet » en dur hors config (grep `FUiCbnDh`, `4RDtZDZK`, `6fjyJGhN`).
- [ ] Décisions D1–D4 actées et notées ici.

**Phase 1 — trésorerie et secrets mainnet**
- [ ] Keypair mainnet généré offline, sauvegarde papier ×2 (D1).
- [ ] Preuve de dérivation (clé → pubkey) écrite dans ce doc.
- [ ] Secret `TREASURY_SECRET_MAINNET` posé sur GitHub.
- [ ] `inject-treasury.mjs` et `release.yml` paramétrés par cluster + garde « build mainnet sans secret = échec ».

**Phase 2 — bascule**
- [ ] Branche `mainnet` : `ACTIVE_CLUSTER = "mainnet"`, endpoint RPC payant, décimales USDT 6, vrai SKR (D4).
- [ ] Tag mainnet (ex. `v2.0.0-mainnet.1`) → build CI → **vérifier sur l'explorer mainnet** : punch-in, reçu 92/3/5, say-hi, stake/unstake.
- [ ] Vitrine Seeker refaite sur le build mainnet : `vitrine.py` → MANIFEST → proof.html → badges guide-jury (la chaîne de preuve entière se régénère : garde `check_device_sync.py` + `make_proof_page.py --check`).
- [ ] `punch-demo-*.mp4` + `.srt` refaits si on veut une vidéo mainnet (les liens `?cluster=devnet` → `?cluster=mainnet` dans deck, SOUMISSION, README, proof page).
- [ ] Installer sur le Seeker de démo (attention : uninstall + install efface la session — le refaire hors période de démo jury).

**Phase 3 — dApp Store** → voir [CHECKLIST-DAPP-STORE.md](CHECKLIST-DAPP-STORE.md) (le build mainnet signé est l'APK à publier).

**Retour arrière** : garder master en devnet jusqu'à la fin de la Phase 2 vérifiée ; si problème, `ACTIVE_CLUSTER = "devnet"` + re-tag = retour à l'état soumission v1.6.9.

## 6. Plan mainnet SANS fonds (rédigé le 9 oct 2026 — à ne pas oublier)

> Contrainte réelle : pas de sponsor, pas de trésorerie, pas de gains hackathon garantis.
> Principe : le minimum vital on-chain ne coûte **presque rien** — c'est l'habillage
> (RPC payant, audits, marketing) qui coûte cher, et tout ça peut attendre la traction.

### Budget minimal de lancement (~30–50 $)

| Poste | Coût | Détail |
|---|---|---|
| SOL de frais | ~0,1 SOL (15–20 $) | Des milliers de transactions (chaque tx ≈ 0,000005 SOL). Alimente trésor + comptes. |
| Domaine SNS | ~5–10 $ | Ex. `punchnexus.sol` — requis pour signer la publication dApp Store (cf. CHECKLIST-DAPP-STORE.md). |
| RPC mainnet | 0 $ | Helius/QuickNode free tier au lancement (D2 passe à payant seulement avec de vrais utilisateurs). |
| Trésorerie USDC initiale | 10–20 $ | ~100–200 punchs réels + say-hi. **Boucle auto-entretenue** : les 5 % de frais reviennent au trésor. |
| Landing page + Twitter | 0 $ | Cloudflare Pages/Workers gratuit ; hébergement statique sans coût. |

### Ordre de financement (sans sponsor)

1. **Submit CLOCK IN en devnet** (fait/prêt — 9 oct 08:59). Les jurys financent souvent le passage mainnet : si prix → financer Phase 1+2 avec les gains, zéro poche.
2. **Si pas de prix** : 30–50 $ de poche suffisent techniquement (table ci-dessus). C'est le seul investissement obligatoire du projet.
3. **Ne PAS payer avant d'avoir des utilisateurs** : RPC payant (~$49/mois, D2), audit, KYC, marketing payant, programme Anchor peut attendre la traction (le staking reste comptable côté app, comme en devnet).
4. **Économie auto-entretenue** : dès que le trésor mainnet tourne, les frais de 5 % reconstituent la réserve — le seul coût continu est le RPC, gratuit jusqu'à ~100k requêtes/jour.

### Rappel d'ordre (le plan §5 ci-dessus reste la référence technique)

Phase 0 (config par cluster, gratuit, devnet) → Phase 1 (keypair offline + secret CI, gratuit) →
**achat SNS + financement trésor (les 30–50 $)** → Phase 2 (bascule) → Phase 3 (dApp Store).
Le programme Anchor dédié reste hors budget jusqu'à la traction (décision ROADMAP du 20 sept).
