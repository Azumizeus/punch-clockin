# PUNCH — Fiche de publication Solana dApp Store

> Process vérifié sur docs.solanamobile.com (août 2026) : la publication passe par le
> **Publisher Portal** (publish.solanamobile.com) — compte éditeur + KYC, wallet dédié,
> upload de l'APK « New Version », signatures multiples, review en 3-5 jours ouvrés.
> L'ancienne CLI `dapp-store` exige un App NFT déjà minté via le portail : **le portail
> web est la voie officielle**, la CLI ne sert qu'aux mises à jour avancées.

## 0. Résumé exécutif

| Étape | Où | Coût | Statut |
|---|---|---|---|
| Compte éditeur + KYC | publish.solanamobile.com | 0 | ☐ à faire (≈15 min + délai KYC) |
| Wallet éditeur financé | Phantom/Solfare/Backpack | ~0,2 SOL + marge ArDrive | ☐ à faire |
| Fiche dApp (textes ci-dessous) | Portail → « Add a dApp » | 0 | ✅ textes prêts (§3) |
| Assets (icône, captures, vidéo) | `docs/store/` + release GitHub | ~0,1-0,3 SOL upload | ✅ prêts (§4) |
| Upload APK v1.6.7 « New Version » | Portail | tx ≈0,05 SOL | ☐ après release v1.6.7 |
| Review Solana Mobile | — | 0 | ☐ 3-5 jours ouvrés |

## 1. Compte éditeur (une seule fois)

1. **Portail** : https://publish.solanamobile.com → sign up, remplir le profil éditeur, soumettre le **KYC/KYB**.
2. **Wallet éditeur** : connecter un wallet d'extension (Phantom, Solfare, Backpack).
   - ⚠️ **Wallet DÉDIÉ, jamais la clé du trésor** : la clé éditeur est une identité de publication, le trésor est une clé de service. Les deux ne doivent jamais cohabiter.
   - ⚠️ Ce wallet est requis pour **toutes** les soumissions futures de l'app — ne pas perdre l'accès.
   - Financer : **~0,2 SOL** (frais de tx + mint du release NFT) **+ solde ArDrive** (estimé par l'outil du portail selon la taille de l'app ; l'APK fait ~65 Mo).
3. **Stockage** : choisir **ArDrive** (recommandé) ; utiliser l'estimateur de coût du portail et « Top Up Balance » si nécessaire. AWS S3 possible si on a déjà un bucket.

## 2. Politiques à relire avant soumission

- Publisher Policy : https://docs.solanamobile.com/dapp-store/publisher-policy
- Developer Agreement (à accepter dans le portail).
- Listing Page Guidelines : https://docs.solanamobile.com/dapp-store/listing-page-guidelines (nos assets y sont conformes, cf. §4).

## 3. Fiche dApp — textes prêts à coller (formulaire « New dApp »)

**Nom de l'app** (unique, fonctionnel) :
```
PUNCH — Clock In
```

**Description courte** (≤ 30 caractères — exigence stricte) :
```
Show up. Get paid. On chain.
```
(28 caractères ✓)

**Description longue** :
```
Real attendance, real money.

PUNCH turns showing up into a Solana fact. Once a day, clock in with one tap:
the app asks Seed Vault to sign a memo transaction with your own fingerprint,
and your presence lands on devnet in seconds — no forms, no manager, nothing
to trust but the chain.

Every check-in stamps a paper ticket that links straight to the explorer. The
whole economy follows one printed rule: 92% to the person who showed up, 3% to
SKR holders, 5% to the app.

What you can do
• CLOCK IN — one signed memo a day, verifiable forever
• Missions — small paid gigs nearby, paid in USDC by the public treasury
• Bonjours — greet a Seeker nearby: you both earn a real micro-payment
• Wallet — real USDC/USDT/SKR balances; stake SKR to climb the Silver, Gold,
  Guardian ranks and reach the better-paid jobs first
• Your rules — bring your own RPC endpoint, watch the live ping, read balances
  straight from the chain. Every error is honest; nothing is ever simulated.

PUNCH is built for Solana Seeker phones and the Seed Vault they ship with.
Runs on devnet during the Clock In hackathon — every transaction is real and
publicly auditable on the explorer.

Source code: github.com/Azumizeus/punch-clockin
```

**Catégorie** : `Finance`
**Site web** : `https://azumizeus.github.io/punch-clockin/`
**Repo / code source** : `https://github.com/Azumizeus/punch-clockin`
**Email support** : ☐ à compléter (utiliser une adresse surveillée — la review répond aussi à cette adresse)
**Réseaux** : ☐ X/Twitter si existant

## 4. Assets — conformes aux Listing Page Guidelines

| Asset | Fichier | Conformité |
|---|---|---|
| Icône (512×512 exigé) | `docs/store/icon-512.png` | ✅ 512×512, dérivée de l'icône officielle 1024 |
| Capture CLOCK IN | `docs/store/screenshot-punch.png` | ✅ 1200×2670 (≥1080px), portrait |
| Capture Missions | `docs/store/screenshot-board.png` | ✅ même ratio |
| Capture Wallet | `docs/store/screenshot-wallet.png` | ✅ même ratio |
| Capture Monde (globe) | `docs/store/screenshot-globe.png` | ✅ même ratio |
| Capture La part (92/3/5) | `docs/store/screenshot-split.png` | ✅ même ratio |
| Vidéo preview (≥720px, .mp4) | `punch-clockin-demo.mp4` (release GitHub) | ✅ 1080×2400, 2:43, voix off + sous-titres EN — orientation portrait assumée (l'app est portrait ; la reco 1080p « landscape » n'est pas obligatoire) |

> Si la review préfère du paysage 1920×1080 : la démo peut être reframée, mais
> commencer par la version portrait (les stores mobiles acceptent le portrait pour
> les apps portrait).

## 5. Soumission (« New Version »)

1. Télécharger l'APK signé de la release : `punch-clockin-seeker-v1.6.7.apk`
   (vérifier le SHA-256 du fichier `.sha256` joint).
2. Portail → app PUNCH → **New Version** → uploader l'APK.
3. Renseigner les notes de version (reprendre `docs/RELEASE-NOTES-v1.6.7.md`).
4. **Submit** → approuver **chaque** demande de signature (upload Arweave + mint du
   release NFT). ⚠️ N'en sauter aucune : des assets manquants sinon.
5. L'entre automatiquement dans la file de review — mise en ligne dès approbation.
6. Review : réponse par email de `publishersupport@dappstore.solanamobile.com` sous
   **3-5 jours ouvrés**. Silence après 5 jours → « App Review Inquiry » sur le
   **#dev-answers** du Discord Solana Mobile (rôle Developer requis).

## 6. Points d'attention spécifiques à PUNCH

- **Devnet vs mainnet-beta** : l'app tourne sur devnet (période hackathon, annoncé
  honnêtement dans la description). Pour une distribution store durable il faudra
  basculer cluster + trésor + lots sur mainnet-beta — **décision produit à prendre
  après le hackathon**, pas de bascule silencieuse.
- **Compatibilité devices** : l'app exige **Seed Vault** (cible Solana Seeker) —
  c'est exactement l'équipement des utilisateurs Saga/Seeker du store ✓. Les
  téléphones sans Seed Vault doivent voir un message clair (déjà le cas dans l'app).
- **Clé éditeur ≠ clé trésor** : ne jamais connecter/importer le trésor dans le
  portail ou le wallet éditeur.
- **Budget** : ~0,2 SOL (tx) + upload ArDrive (APK ~65 Mo + assets ≈ 10 Mo).
- **Après approbation** : tester l'installation **depuis le store** sur le Seeker
  (SM02E4060310629) et vérifier un pointage réel de bout en bout.

## 7. Checklist finale de soumission

- [ ] Compte éditeur créé, KYC validé
- [ ] Wallet éditeur dédié financé (~0,2 SOL + ArDrive)
- [ ] Politique éditeur + accord développeur relus
- [ ] Textes (§3) collés dans « New dApp »
- [ ] `docs/store/icon-512.png` + 5 captures + vidéo preview uploadés
- [ ] APK v1.6.7 (SHA-256 vérifié) uploadé en « New Version »
- [ ] Toutes les signatures approuvées, statut « In review »
- [ ] Email support renseigné et surveillé
- [ ] Après approbation : install test sur Seeker + pointage réel vérifié
