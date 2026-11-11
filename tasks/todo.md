# TODO — PUNCH mainnet / store / sponsor

## Task 1: Surveiller CLOCK IN + préparer réclamation
**Description:** Rester collé aux annonces et avoir le dossier prix prêt (repo, vidéo, deck, APK signé v1.7.1).
**Acceptance criteria:**
- [ ] Page suivi bookmarkée : https://solanamobile.com/blog/the-clock-in-builds-are-in-what%E2%80%99s-next-on-seeker
- [ ] Canal #dev-answers du Discord Solana Mobile repéré pour questions
- [ ] Dossier prix prêt : repo public, vidéo démo, deck, APK release
**Verification:**
- [ ] Build release existant vérifié (releases/ GitHub)
- [ ] Manual check: liens explorer devnet du README répondent
**Dependencies:** None
**Files likely touched:**
- `docs/`
**Estimated scope:** Small: 1-2 files

## Task 2: Compte publisher Solana Mobile prêt
**Description:** Créer le compte sur publish.solanamobile.com, profil publisher, KYC/KYB, wallet publisher, site public + pages CGU/confidentialité.
**Acceptance criteria:**
- [ ] Compte + profil publisher créés sur https://publish.solanamobile.com/
- [ ] KYC (individu) ou KYB (société) approuvé
- [ ] Wallet publisher connecté et seed sauvegardée hors machine
- [ ] Site public + https://…/terms + https://…/privacy en ligne et valides
**Verification:**
- [ ] Manual check: le portail affiche "approved", liens testés en navigation privée
**Dependencies:** Task 1
**Files likely touched:**
- `docs/site/`
**Estimated scope:** Small: 1-2 files

## Task 3: Identité Android définitive + assets listing
**Description:** Choisir le package final (immuable après soumission), le nom ≤25 car., la description courte ≤50 car., icône 512×512 opaque, bannière 1200×600, 4–8 screenshots.
**Acceptance criteria:**
- [ ] `punch-native/app.json`: `android.package` final (ex. `com.punchclockin.app`, fini `com.anonymous.*`), `name` ≤25 car.
- [ ] Icône 512×512 opaque, bannière 1200×600, 4–8 captures produites
**Verification:**
- [ ] Build succeeds: `npx expo prebuild` sans erreur de package
- [ ] Manual check: package unique, jamais soumis avant
**Dependencies:** Task 2
**Files likely touched:**
- `punch-native/app.json`
- `punch-native/assets/images/`
**Estimated scope:** Small: 1-2 files

## Task 4: Build release signé + soumission dApp Store
**Description:** Produire l'APK release signé arm64-v8a (<2 Go, pas de debug), contrôle interne, soumission via le portail (mint App NFT + release).
**Acceptance criteria:**
- [ ] APK release signé, arm64-v8a, testé sur Seeker + un Android tiers (Seed Vault ou Phantom/Solflare)
- [ ] Soumission déposée sur https://docs.solanamobile.com/dapp-store/submit-new-app
**Verification:**
- [ ] Manual check: statut review visible portail (indicatif 3–4 j neufs)
- [ ] Manual check: en cas de silence >5 j, question posée sur #dev-answers
**Dependencies:** Task 3
**Files likely touched:**
- `punch-native/android/`
- `.github/workflows/release.yml`
**Estimated scope:** Medium: 3-5 files

## Checkpoint: Store
- [ ] Compte approuvé, APK soumis, review en cours — condition prix CLOCK IN remplissable

## Task 5: Config réseau mainnet (sans fonds d'abord)
**Description:** Introduire la config mainnet à côté de `devnetConfig.ts` : RPC prod via config/secrets, mints réels (USDC `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`, USDT `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`, vrai SKR mainnet), MWA `solana:mainnet`, garde qui refuse un build prod pointant devnet (et inversement), liens explorer sans `?cluster=devnet`.
**Acceptance criteria:**
- [ ] `solana:devnet` ne reste dans aucun chemin de build prod (`wallet.ts`, `rpc.ts`, config)
- [ ] Mints mainnet en allowlist, validés on-chain (mint + token program), décimales USDC/USDT=6
- [ ] ATA receveur auto-créée si absente, montants en décimales du mint
**Verification:**
- [ ] Tests pass: suite existante + test config (prod≠devnet)
- [ ] Manual check: build staging pointé mainnet sans signer de vrais fonds
**Dependencies:** Task 4
**Files likely touched:**
- `punch-native/lib/solana/devnetConfig.ts`
- `punch-native/lib/solana/wallet.ts`
- `punch-native/lib/solana/rpc.ts`
**Estimated scope:** Medium: 3-5 files

## Task 6: Trésorerie mainnet + clé hors client
**Description:** Créer le trésor mainnet sous multisig (ex. Squads), séparer trésor/réserves/payer, financer en vrai SOL (petit test d'abord), et sortir la signature trésor du client (serveur signataire ou programme — le client ne voit jamais la clé).
**Acceptance criteria:**
- [ ] Multisig créé, seuils + signataires indépendants, recovery testée
- [ ] Aucune clé dans le code/bundle/logs ; `TREASURY_SECRET_DEVNET` ne sert plus qu'en dev
- [ ] Réserve SOL monitorée + alertes (solde bas, tx échouées, spike fees)
**Verification:**
- [ ] Manual check: extraction de clé depuis l'APK ne donne rien d'exploitable
- [ ] Manual check: petit transfert SOL aller OK avant tout financement réel
**Dependencies:** Task 5
**Files likely touched:**
- `punch-native/lib/solana/treasurySecretDEVNET*`
- `punch-native/scripts/inject-treasury.mjs`
- `.github/workflows/`
**Estimated scope:** Medium: 3-5 files

## Task 7: Tests mainnet petits montants + canary
**Description:** Rejouer tous les flux avec des poussières sur mainnet (connect MWA mainnet, punch mémo, jobs USDC/USDT, stake/unstake, leave), confirmation `finalized` pour l'irréversible, retry anti-double-pay, RPC backup.
**Acceptance criteria:**
- [ ] Chaque flux testé en micro-montants, signatures vérifiables explorer mainnet
- [ ] Procédure rollback/incident répétée, canary monitoré avant ouverture large
**Verification:**
- [ ] Tests pass: e2e devnet verts + checklist mainnet signée
- [ ] Manual check: refus/annulation wallet, ATA manquante, expiration blockhash OK
**Dependencies:** Task 6
**Files likely touched:**
- `punch-native/lib/punch/`
- `docs/TEST-PLAN.md`
**Estimated scope:** Medium: 3-5 files

## Checkpoint: Mainnet
- [ ] Argent réel qui bouge, clés hors client, monitoring actif, rollback testé

## Task 8: Cadre ton apport de sponsor (premier investisseur = toi)
**Description:** Formaliser ton apport : montant + calendrier, versements visibles on-chain depuis ton wallet perso vers le trésor multisig, comptabilité séparée perso/société, contreparties écrites (pas de promesse de rendement), doc `docs/SPONSOR.md`.
**Acceptance criteria:**
- [ ] Montant total + tranches + conditions de déblocage écrits
- [ ] Chaque versement traçable (tx explorer listées dans `docs/SPONSOR.md`)
- [ ] Règle écrite : jamais de fonds utilisateurs pour tes dépenses, jamais l'inverse
**Verification:**
- [ ] Manual check: relevé on-chain = compta interne au centime
- [ ] Manual check: un tiers comprend le montage en lisant une page
**Dependencies:** Task 6
**Files likely touched:**
- `docs/SPONSOR.md`
**Estimated scope:** Small: 1-2 files
