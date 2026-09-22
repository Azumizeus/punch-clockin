# PUNCH — Guide Publisher Portal : KYC + budget ArDrive (APK 141 Mo)

> Guide pas à pas pour créer le compte éditeur Solana Mobile et publier PUNCH
> sur le dApp Store. Complète `docs/DAPP-STORE-SUBMISSION.md` (textes + assets
> déjà prêts). Sources : docs.solanamobile.com (mis à jour août 2026) et
> ardrive.io/pricing (taux live).

## 1. Ce qu'il faut avant de commencer (30 min)

| Élément | Détail | Où |
|---|---|---|
| **Wallet éditeur dédié** | Phantom, Solflare ou Backpack — une adresse NEUVE, jamais la clé du trésor | extension navigateur |
| **~0,2 SOL sur ce wallet** | frais des transactions (mint Publisher/App/Release NFT) | faucet CEX ou swap |
| **Solde de stockage ArDrive** | ~10-15 $ pour l'APK + assets (cf. §4) | top-up depuis le portail |
| **Pièce d'identité** | passeport ou CNI + justificatif (KYC) ou Kbis (KYB) | scan/photo |
| **Email dédié** | la review répond à cette adresse (3-5 jours ouvrés) | — |
| **Navig. + wallet sur desktop** | le portail fonctionne au navigateur, signatures dans l'extension | — |

⚠️ **Règle d'or** : le wallet éditeur est une identité de publication. Il ne doit
**jamais** contenir ni approcher la clé du trésor PUNCH (`FUiCbn…`). Le trésor
signe des transferts côté app ; l'éditeur signe des mints NFT côté store.

## 2. Inscription + KYC (jour 1, ~20 min + délai de vérification)

1. Ouvrir **https://publish.solanamobile.com** → « Sign Up ».
2. Renseigner l'email + mot de passe, confirmer.
3. **Accepter** le Solana dApp Store Developer Agreement (lecture recommandée :
   https://docs.solanamobile.com/dapp-store/publisher-policy).
4. Remplir le **profil éditeur** :
   - Nom : `Azumizeus` (ou le nom voulu sur le store)
   - Site : `https://azumizeus.github.io/punch-clockin/`
   - Email de contact : l'email dédié ci-dessus
   - Icône éditeur : réutiliser `docs/store/icon-512.png` (ou une variante)
5. Lancer la **vérification KYC** (personne physique) ou **KYB** (société) :
   - pièce d'identité en photo (les deux faces),
   - selfie de contrôle (liveness),
   - pour un KYB : registre du commerce + représentant légal.
6. Attendre la validation (généralement **quelques heures à 48 h**).
   Le portail affiche le statut ; un email confirme l'activation.

## 3. Connecter le wallet + financer (jour 1-2)

1. Dans le portail : **Connect wallet** → choisir l'extension (Phantom…)
   → connecter le wallet ÉDITEUR (vérifier l'adresse deux fois).
2. Financer :
   - **0,2 SOL** minimum pour les frais (4-6 transactions de mint + marges) ;
   - **solde de stockage ArDrive** : dans le portail, section stockage →
     **Top Up Balance** → acheter ~10-15 $ (le montant exact est estimé par le
     portail au moment de l'upload, cf. §4).
3. Vérifier : profil complet + wallet connecté + solde ≥ 0,2 SOL + balance
   ArDrive positive → prêt à soumettre.

## 4. Budget ArDrive pour PUNCH (APK 141 Mo)

Tarif live ArDrive/Turbo : **≈ 54 $/GiB**, payé **une fois** (stockage permanent,
pas d'abonnement). Le portail paie depuis un solde de stockage (rechargé en SOL
ou carte selon l'interface) et affiche l'estimation exacte avant soumission.

| Fichier | Taille | Coût estimé |
|---|---|---|
| APK `punch-clockin-seeker-v1.6.7.apk` | 141 Mo (0,138 GiB) | **≈ 7,4 $** |
| Vidéo preview `punch-clockin-demo.mp4` | 14,6 Mo | ≈ 0,8 $ |
| Icône + bannière + 5 captures | ~1,2 Mo | ≈ 0,1 $ |
| **Total premier upload** | ~157 Mo | **≈ 8-9 $** |
| Marge sécurité (frais réseau variables) | — | +3-5 $ |
| **Budget recommandé (top-up ArDrive)** | — | **12-15 $** |
| + frais SOL des NFT (tx) | — | ~0,1-0,2 SOL |

À savoir :
- **chaque nouvelle version re-upload l'APK complet** (~7-8 $ par release) —
  prévoir ce coût récurrent pour les mises à jour ;
- uploads < 100 Ko gratuits ; le taux varie avec le prix de l'AR — le portail
  affiche le devis exact **avant** validation, ne pas hésiter à le lire ;
- alternative sans coût : **AWS S3** (bucket perso) — mais ArDrive est
  recommandé (permanent, sans compte cloud à maintenir).

## 5. Soumission de PUNCH (jour 2-3, ~1 h)

Ordre exact dans le portail :

1. **Add a dApp → New dApp** : coller les textes de
   `docs/DAPP-STORE-SUBMISSION.md` §3 (nom, description courte 28 car.,
   description longue, catégorie Finance, site, repo, email).
2. **Uploader les assets** de `docs/store/` :
   `icon-512.png`, `banner-1200x600.png`, les 5 `screenshot-*.png`,
   + la vidéo preview (télécharger `punch-clockin-demo.mp4` depuis la release
   GitHub v1.6.7 ou utiliser le fichier local `punch-native/releases/`).
3. Vérifier l'aperçu de la fiche (rendu mobile), **Save**.
4. **New Version** (bouton en haut à droite de la fiche app) :
   - uploader `punch-clockin-seeker-v1.6.7.apk` (versionCode 21 ✓ > tout
     précédent ; release signée ✓ ; SHA-256 vérifié ✓) ;
   - notes de version : reprendre `docs/RELEASE-NOTES-v1.6.7.md` ;
   - **Submit** → approuver **chaque** demande de signature de l'extension
     (upload Arweave + mint du Release NFT). Ne sauter AUCUNE fenêtre.
5. Statut attendu : « In review ». Réponse par email sous **3-5 jours ouvrés**.
6. Silence après 5 jours → « App Review Inquiry » sur le **#dev-answers** du
   Discord Solana Mobile (prendre le rôle Developer avant).

## 6. Après l'approbation (jour 5-8)

1. Sur le Seeker : ouvrir le **dApp Store** → chercher « PUNCH » → installer.
2. Vérifier que l'app installée **depuis le store** fait un pointage réel
   (feuille Seed Vault → Approve → ticket) et que le lot de bienvenue part
   du trésor `FUiCbn…` (explorer).
3. Noter l'adresse de l'App NFT (visible dans le portail) — c'est l'identité
   on-chain de l'app, à conserver avec le wallet éditeur.

## 7. Checklist finale

- [ ] Wallet éditeur dédié créé (≠ trésor), seed phrase sauvegardée hors ligne
- [ ] KYC validé (email de confirmation du portail)
- [ ] 0,2 SOL sur le wallet éditeur
- [ ] Solde ArDrive rechargé (~12-15 $)
- [ ] Fiche « New dApp » créée avec les textes de DAPP-STORE-SUBMISSION.md
- [ ] Assets uploadés (icône, bannière, 5 captures, vidéo)
- [ ] APK v1.6.7 uploadé en « New Version », toutes signatures approuvées
- [ ] Statut « In review » constaté
- [ ] Après approbation : install test Seeker + pointage réel vérifié
