---
titre: Soumission — hackathon CLOCK IN (Solana Mobile × RadiantsDAO)
usage: tout ce qu'il faut pour inscrire et soumettre PUNCH avant le 8 octobre 2026
mise à jour: 22 septembre 2026
---

# Soumettre PUNCH à CLOCK IN

## 1. L'essentiel

| | |
|---|---|
| **Hackathon** | CLOCK IN — 3ᵉ hackathon Solana Mobile, organisé par RadiantsDAO |
| **Dates** | Inscription & soumissions : **8 sept → 8 oct 2026** · Résultats : début novembre 2026 |
| **Inscription** | **https://solanamobile.com/hackathon** (redirige vers le site officiel Radiants) — à faire avec ton compte, je ne peux pas le faire à ta place |
| **Prix** | $125 000 USDC (1ᵉʳ $30k, 2ᵉ $25k, 3ᵉ $20k, 4ᵉ $15k, 5ᵉ $10k, 6ᵉ-10ᵉ $5k) + **$10 000 en SKR** pour la meilleure intégration SKR |
| **Bonus gagnants** | Publication dApp Store, mise en avant, co-marketing, Seeker pour l'équipe, appel avec Anatoly Yakovenko |
| **Support** | Workshops hebdomadaires sur le **Discord Radiants** |

## 2. Les 4 livrables obligatoires — état pour PUNCH

| Livrable | État | Lien / action |
|---|---|---|
| **APK Android fonctionnel** | ✅ prêt (v1.6.6, arm64, signé) | https://github.com/Azumizeus/punch-clockin/releases/tag/v1.6.6 |
| **Repo GitHub source** | ✅ prêt, **public**, CI verte | https://github.com/Azumizeus/punch-clockin |
| **Vidéo démo** | ✅ refaite le 22/09 (2 min 43, voix off EN + **sous-titres incrustés**, tournée sur Seeker v1.6.6 : connexion, pointage complet → ticket, reçu 92/3/5, ping RPC, explorer) | `punch-clockin-demo.mp4` dans la release v1.6.7 (+ `.srt`) — **à uploader sur YouTube (public ou répertorié)** et lier |
| **Pitch deck** | ⚠️ contenu prêt, PDF à exporter | `docs/PITCH-DECK.md` (10 slides EN) → exporter `punch-clockin-deck.pdf` et remplacer `<lien-du-repo>` / `<lien-youtube>` |

## 3. Critères du jury (4 × 25 %) — comment PUNCH y répond

- **Stickiness & PMF** → rituel quotidien (pointer → missions → paiement), staking SKR qui fidélise, cible naturelle : possesseurs de Seeker.
- **UX** → app 100 % native Expo/RN, ticket papier après pointage, globe à physique réelle, identité Gold/Nuit, visite guidée interactive.
- **Innovation** → la présence humaine devient une monnaie ; règle 92/3/5 imprimée partout, jamais cachée ; « dire bonjour » paie 0,10 $ réels.
- **Présentation & démo** → vidéo déjà montée + `docs/PITCH-JURY.md` + `docs/GUIDE-JURY.md` (test pas-à-pas pour le jury).

Le prix SKR ($10k) vise exactement notre intégration : staking SKR → accès prioritaire aux missions, frais protocole avec rachat SKR. *(Slide 5 du deck : « This is our CLOCK IN SKR-integration entry. »)*

## 4. ⚠️ À faire avant de soumettre — le point bloquant

**L'APK de la Release v1.6.6 a été construit avec le gabarit « démo trésor »** : le secret GitHub `TREASURY_SECRET_DEVNET` n'est pas configuré, donc le jury ne verrait pas le vrai trésor (`FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn`). Pour un projet dont tout le pitch est « rien de fake », c'est rédhibitoire.

**Correction (5 min) :**
1. Ouvre https://github.com/Azumizeus/punch-clockin/settings/secrets/actions → **New repository secret**
2. Name : `TREASURY_SECRET_DEVNET` — Secret : colle le JSON de 64 octets (généré dans `cur.txt` à la racine du projet, non versionné)
3. Re-tague pour relancer la Release avec la vraie clé :
   ```bash
   git tag v1.6.7 && git push origin v1.6.7
   ```
4. Vérifie dans la nouvelle Release qu'il n'y a **plus** l'avertissement « gabarit démo ».

**Checklist complémentaire :**
- [ ] Remplacer dans `README.md` le lien APK local (`punch-native/releases/...`, gitigné) par l'URL de la GitHub Release
- [ ] Uploader la vidéo sur YouTube et noter le lien
- [ ] Exporter `punch-clockin-deck.pdf` (slides 1-10 EN, accent or `#d4af37`, 2-3 captures thème Gold : écran CLOCK IN, ticket, globe)
- [ ] Tester l'APK de la release sur un vrai Seeker : connexion, pointage, reçu avec signature cliquable

## 5. Textes prêts à coller dans le formulaire de soumission

**Project name :**
```
PUNCH — Proof of presence on Solana
```

**One-liner :**
```
Punch in once a day from a real Seeker: a real signed Solana transaction proves you
showed up, and every payment follows one printed rule — 92% worker, 3% SKR holders,
5% app. No fake check-ins, no hidden splits.
```

**Description (EN) :**
```
PUNCH turns human presence into honest money. One tap a day on a Seeker signs a real
memo transaction in Seed Vault — that's your proof of presence. It unlocks small paid
gigs nearby (confirm a place is open, leave an honest review, scan a code), paid in
USDC/USDT. Every money action in the app — punch in, get paid, swap, stake, say-hi,
leave the network — is a real signed devnet transaction through Mobile Wallet Adapter.
The public treasury is live on the explorer: watch balances move while you use the app.

SKR integration: staking SKR gives earlier access to better-paid jobs (real utility,
zero new supply), unstake carries an honest 1.5% protocol fee, and protocol fees
buy back SKR for holders. The 92/3/5 rule is printed on every receipt — never hidden.

100% native (Expo/React Native), signed APK, bilingual judge guide included.
You show up. You get paid. 92 / 3 / 5.
```

**Liens à coller :**
```
GitHub repo (source + judge guide): https://github.com/Azumizeus/punch-clockin
Signed APK (arm64): https://github.com/Azumizeus/punch-clockin/releases/latest
Demo video: <lien-youtube>
Devnet treasury on explorer: https://explorer.solana.com/address/FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn?cluster=devnet
Judge guide: https://github.com/Azumizeus/punch-clockin/blob/master/docs/GUIDE-JURY.md
Pitch deck: <fichier PDF joint ou lien>
```

## 6. Règles d'éligibilité à connaître

- Projet démarré **au plus tôt 3 mois avant le lancement** (8 juin 2026) → OK pour PUNCH (développé en sept. 2026).
- Un projet existant peut participer s'il démontre un **développement mobile significatif pendant le hackathon** → OK.
- Doit intégrer la **Solana Mobile Stack / Mobile Wallet Adapter** et interagir réellement avec Solana → OK (MWA + Seed Vault + transactions devnet réelles).
- Les gagnants doivent **publier l'app sur la dApp Store** pour toucher le prix (délai raisonnable accordé après les résultats) — à anticiper.
- Pas besoin d'un Seeker pour soumettre, mais le build cible Seeker → OK.
