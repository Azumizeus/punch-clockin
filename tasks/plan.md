# Plan d'action PUNCH — Mainnet + dApp Store + post-CLOCK IN

## Overview
PUNCH est aujourd'hui un build hackathon **devnet** (`punch-native/`, package `com.punchclockin.app`, v1.7.1). Le hackathon CLOCK IN est en phase de jugement (résultats attendus début novembre). Pour passer en produit réel : (1) suivre le verdict CLOCK IN, (2) publier sur le Solana dApp Store (obligatoire pour toucher un prix), (3) migrer vers mainnet sans tricher sur la sécurité (clé trésor actuellement injectée dans l'app — inacceptable en mainnet), (4) cadrer ton auto-investissement en sponsor propre.

## Nouvelles du hackathon CLOCK IN (vérifié le 28/10/2026)
- Organisé par **Solana Mobile + RadiantsDAO**. Soumissions ouvertes 08/09/2026, closes le **12/10**.
- Statut : **en jugement**. Update officielle du 20/10 : les builds sont rendus, gagnants annoncés **début novembre**.
- Prix : **125 000 $ USDC** (30/25/20/15/10 + 5×5k) + **10 000 $ SKR** (intégration SKR) + **30 000 $ ORE** ajouté après coup. Bonus gagnants : mise en avant dApp Store, co-marketing, appareils Seeker, appel avec Anatoly.
- Condition prix : les gagnants **doivent publier sur le Solana dApp Store** pour réclamer.
- Liens : annonce https://solanamobile.com/blog/clock-in-the-solana-mobile-hackathon · suivi https://solanamobile.com/blog/the-clock-in-builds-are-in-what%E2%80%99s-next-on-seeker · portail https://solanamobile.com/hackathon

## Architecture Decisions
- Mainnet = environnement séparé, pas un simple swap d'URL. Config réseau centralisée (`lib/solana/devnetConfig.ts` → futur `networkConfig.ts` avec garde-fous build devnet/mainnet).
- La clé trésor **sort du client** avant mainnet (serveur signataire ou programme Anchor). Non négociable — `docs/JUDGES.md` le dit déjà.
- Package Android définitif choisi **avant** la soumission store (`com.punchclockin.app`, acté le 2026-10-28) : immuable après création.
- Trésor mainnet sous **multisig** (ex. Squads), avec working capital séparé des réserves.

## Task List

### Phase 1 — CLOCK IN : ne pas rater le verdict (cette semaine)
- [ ] Task 1 : Surveiller les résultats + préparer la réclamation prix
- [ ] Task 2 : Compte publisher Solana Mobile prêt (KYC/KYB, wallet, site + pages légales)

### Checkpoint: Store-ready admin
- [ ] Email/portal OK, wallet publisher sauvegardé, site + CGU/confidentialité en ligne

### Phase 2 — dApp Store : soumission
- [ ] Task 3 : Identité Android définitive (package, nom ≤25 car., assets listing)
- [ ] Task 4 : Build release signé arm64-v8a + review interne + soumission portail

### Checkpoint: Soumission
- [ ] APK accepté en review (délai indicatif 3–4 j ouvrés neuf, 1–2 j update)

### Phase 3 — Mainnet : migration sécurisée
- [ ] Task 5 : Config réseau mainnet (RPC prod, mints USDC/USDT/SKR réels, MWA `solana:mainnet`, garde-fous)
- [ ] Task 6 : Trésorerie mainnet (multisig, financement SOL, trésor hors client)
- [ ] Task 7 : Tests mainnet petits montants + canary

### Checkpoint: Mainnet
- [ ] Tous les flux passent en vrai sur mainnet, clés hors client, rollback testé

### Phase 4 — Sponsor : ton auto-investissement
- [ ] Task 8 : Cadre de ton apport (montant, traçabilité on-chain, séparation perso/trésor)

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Clé trésor extraite de l'APK en mainnet | Critique — vol des fonds | Signataire serveur ou programme avant tout mainnet |
| Package `com.anonymous.*` soumis puis bloqué | Haut — reprise listing | Renommer avant la soumission (immuable après) |
| Faux mints (ticker au lieu de l'adresse) | Haut — perte fonds | Allowlist mints mainnet codée + validée on-chain |
| RPC public saturé | Moyen — tx échouées | RPC privé + backup, alertes solde/fees |
| Gagnant CLOCK IN sans app publiée | Haut — prix non réclamé | Soumettre au store dès la phase 2, même en devnet d'abord |

## Open Questions
- Montant de ton apport initial en tant que sponsor (fourchette) ?
- Raison sociale pour le compte publisher : individu ou société ?
- Programme Anchor dédié maintenant ou signataire serveur d'abord (plus rapide) ?
