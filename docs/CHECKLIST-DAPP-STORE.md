# Checklist dApp Store — publication de PUNCH

> **Pourquoi c'est bloquant :** les gagnants de CLOCK IN doivent **publier l'app sur la dApp Store pour toucher le prix** (délai accordé après les résultats du **11 novembre 2026**). Mieux vaut un compte publisher + KYC prêts avant, pour ne pas perdre 2 semaines après l'annonce.
> **Sources officielles :** <https://publish.solanamobile.com/> (portail publisher) et <https://docs.solanamobile.com/dapp-store/submit-new-app> (soumission d'une nouvelle app).
> **Prérequis produit :** la publication vise le **build mainnet** — voir [PLAN-MAINNET.md](PLAN-MAINNET.md) Phase 2/3.

## 1. Compte publisher + KYC/KYB

- [ ] Créer le compte publisher sur **publish.solanamobile.com** (compte distinct des comptes perso → utiliser l'identité du projet Azumizeus/PUNCH).
- [ ] Compléter le **KYC (particulier) ou KYB (entreprise)** — pièce d'identité / documents société. C'est l'étape la plus longue : la lancer **avant le 11 novembre** si possible.
- [ ] Vérifier l'email / 2FA du compte et garder les accès notés (gestionnaire de mots de passe).

## 2. Wallet publisher

- [ ] Créer un **wallet publisher dédié** (≠ trésor, ≠ clé CI, ≠ wallet perso).
- [ ] Sauvegarde de la seed hors ligne (papier, ×2).
- [ ] Le financer en **SOL** : les frais de publication et de mise à jour passent par ce wallet (prévoir ~0,5–1 SOL de marge).

## 3. Keystore de signature dédié

- [ ] Le keystore de signature de l'APK publié doit être **stable et dédié** : c'est lui qui identifie l'app dans la dApp Store (les mises à jour doivent être signées par la même clé).
- [ ] Décider : keystore CI actuel (celui de `release.yml`) conservé comme keystore de publication, **ou** nouveau keystore « publication » généré exprès — dans les deux cas, **sauvegarde papier ×2 + chiffrée**, jamais uniquement en secret CI.
- [ ] Vérifier que le keystore de publication n'est **pas** celui utilisé pour signer les builds de dev quotidiens.
- [ ] Documenter l'emplacement des sauvegardes dans le coffre du projet (hors repo).

## 4. Stockage (hébergement de l'APK et des assets)

- [ ] Choisir un **storage provider** supporté par la dApp Store (Irys est le chemin standard, cf. docs Solana Mobile) — l'APK et les métadonnées sont stockés on-chain/permaweb, pas sur GitHub.
- [ ] Créer le compte, financer (frais de stockage en SOL), tester l'upload d'un petit fichier.
- [ ] Uploader l'**APK mainnet release-signé** et récupérer son URI + hash (le hash stocké doit matcher l'APK publié — même discipline que nos `.sha256` de release).

## 5. Métadonnées de l'app

- [ ] **Nom** : `PUNCH — Proof of Presence` (candidat, à trancher ≤ 30 caractères selon la limite du formulaire).
- [ ] **Description EN** : reprendre le bloc *Description (EN)* de [SOUMISSION.md](SOUMISSION.md) §5 (déjà écrit, honnête, sans promesse).
- [ ] **Catégorie** : Productivity / Lifestyle (à choisir dans la liste du portail).
- [ ] **Icône 512×512** et visuels (hero/bannières) aux formats exacts demandés par le portail — dériver de l'identité visuelle existante (Gold/Nuit).
- [ ] **URL du site / support** : https://azumizeus.github.io/punch-clockin/ + lien repo pour la transparence.
- [ ] **Domaine / association publisher** : suivre le flux du portail (signature d'un message par le wallet publisher).

## 6. Soumission + review

- [ ] Remplir le formulaire de soumission (APK URI + hash, métadonnées, publisher).
- [ ] Payer les frais de soumission depuis le wallet publisher.
- [ ] Suivre le statut dans le portail (**review catalogue** par Solana Mobile) — relancer via Discord Solana Mobile si > 1 semaine sans statut.
- [ ] En cas de rejet : corriger et re-soumettre (les frais de mise à jour sont moindres, mais chaque itération coûte du SOL → relire les raisons de rejet listées dans les docs avant de soumettre).

## 7. Après publication — mises à jour versionnées

- [ ] Toute mise à jour = nouvel APK **signé par le même keystore**, version supérieure (respecter la numérotation actuelle : après v1.6.9 mainnet, passer en v2.x), ré-uploadée au storage provider, métadonnées mises à jour si besoin.
- [ ] Réutiliser le runbook release (`release.yml`) : tag → build signé → assets → publication dApp Store.
- [ ] Les gardes CI (`check_release_assets.py`, `check_release_tag.py`, `check_device_sync.py`) restent la porte d'entrée de chaque publication.

## 8. Chronologie cible (contrainte gagnants)

| Quand | Quoi |
|---|---|
| Avant le 11 nov | Compte publisher + **KYC/KYB lancé**, wallet publisher créé et financé, keystore de publication sauvegardé, compte storage provider prêt. |
| 11 nov | Résultats. Si gagnant : lancer immédiatement la Phase 2 mainnet (build + vérifications, ~1–2 semaines). |
| Nov–déc | Publication dApp Store du build mainnet → **condition du prix remplie**. |
| Après | Mises à jour versionnées (§7) ; la vitrine devnet v1.6.9 reste l'archive du hackathon. |

> **Sécurité — rappel :** aucun secret (keystore, seed publisher, clé trésor) ne vit dans le repo, dans un secret CI non nécessaire, ou dans le chat. Sauvegardes papier, hors ligne, ×2.
