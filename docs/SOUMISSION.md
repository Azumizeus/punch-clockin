---
titre: Soumission — hackathon CLOCK IN (Solana Mobile × RadiantsDAO)
usage: tout ce qu'il faut pour inscrire et soumettre PUNCH avant le 8 octobre 2026
mise à jour: 23 septembre 2026
---

# Soumettre PUNCH à CLOCK IN

## 1. L'essentiel

| | |
|---|---|
| **Hackathon** | CLOCK IN — 3ᵉ hackathon Solana Mobile, organisé par RadiantsDAO |
| **Dates** | Inscription & soumissions : **8 sept → 8 oct 2026** · Résultats : début novembre 2026 |
| **Inscription** | **https://solanamobile.com/hackathon** (redirige vers le site officiel Radiants) — à faire avec ton compte, je ne peux pas le faire à ta place |
| **Prix** | **$135 000 au total** : $125 000 USDC (1ᵉʳ $30k, 2ᵉ $25k, 3ᵉ $20k, 4ᵉ $15k, 5ᵉ $10k, 6ᵉ-10ᵉ $5k chacun) + **$10 000 en SKR** pour la meilleure intégration SKR (prix séparé, optionnel) |
| **Bonus gagnants** | Publication dApp Store, mise en avant, co-marketing, Seeker pour l'équipe, appel avec Anatoly Yakovenko |
| **Support** | Workshops hebdomadaires sur le **Discord Radiants** |

## 2. Les 4 livrables obligatoires — état pour PUNCH

| Livrable | État | Lien / action |
|---|---|---|
| **APK Android fonctionnel** | ✅ prêt (v1.6.8, arm64, signé, **construit en CI avec le vrai trésor**) | https://github.com/Azumizeus/punch-clockin/releases/tag/v1.6.8 |
| **Repo GitHub source** | ✅ prêt, **public**, CI verte | https://github.com/Azumizeus/punch-clockin |
| **Vidéo démo** | ✅ refaite le 22/09 (2 min 43, voix off EN + **sous-titres incrustés**, tournée sur Seeker v1.6.6 : connexion, pointage complet → ticket, reçu 92/3/5, ping RPC, explorer) | `punch-clockin-demo.mp4` dans la release v1.6.7 (+ `.srt`) — **à uploader sur YouTube (public ou répertorié)** et lier |
| **Pitch deck** | ✅ prêt | [`docs/punch-clockin-deck.pdf`](https://github.com/Azumizeus/punch-clockin/blob/master/docs/punch-clockin-deck.pdf) (10 slides EN) |

## 3. Critères du jury (4 × 25 %) — comment PUNCH y répond

- **Stickiness & PMF** → rituel quotidien (pointer → missions → paiement), staking SKR qui fidélise, cible naturelle : possesseurs de Seeker.
- **UX** → app 100 % native Expo/RN, ticket papier après pointage, globe à physique réelle, identité Gold/Nuit, visite guidée interactive.
- **Innovation** → la présence humaine devient une monnaie ; règle 92/3/5 imprimée partout, jamais cachée ; « dire bonjour » paie 0,10 $ réels.
- **Présentation & démo** → vidéo déjà montée + `docs/PITCH-JURY.md` + `docs/GUIDE-JURY.md` (test pas-à-pas pour le jury).

Le prix SKR ($10k) vise exactement notre intégration : staking SKR → accès prioritaire aux missions, frais protocole avec rachat SKR. *(Slide 5 du deck : « This is our CLOCK IN SKR-integration entry. »)*

## 4. ✅ Point bloquant résolu — le trésor réel est en CI

Le secret GitHub `TREASURY_SECRET_DEVNET` a été **posé via l'API** (valeur = le tableau JSON des 64 octets, chiffrée libsodium avec la clé publique Actions) et **prouvé par dérivation** : la clé engendre exactement le trésor `FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn`. Le workflow Release **refuse désormais tout build sans secret** (échec tôt avec message d'action) — plus jamais d'APK « gabarit zéro ».

**Dernière vérification avant de soumettre :** le corps de la [release v1.6.8](https://github.com/Azumizeus/punch-clockin/releases/tag/v1.6.8) ne doit pas contenir d'avertissement « gabarit démo » (sinon re-taguer `v1.6.8` pour reconstruire).

**Checklist complémentaire :**
- [x] Liens APK de `README.md` pointés vers la GitHub Release (fait le 22/09)
- [x] `punch-clockin-deck.pdf` exporté et commité
- [x] Tester l'APK de la release sur un vrai Seeker : connexion, pointage, reçu avec signature cliquable
- [ ] Uploader la vidéo sur YouTube et noter le lien (dernière action manuelle avant « Submit »)

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

**Argumentaire prix SKR ($10k) — si le formulaire demande la candidature :**
```
1. SKR is the gate to earning power: staking 1,000 / 5,000 / 25,000 SKR unlocks Silver, Gold and
   Guardian ranks that open better-paid missions — real utility, zero new supply, no speculation.
2. The protocol's 5% fee doesn't disappear: it buys back SKR for holders, so every clock-in in the
   app mechanically returns value to people who stake.
3. Unstaking carries an honest 1.5% fee, printed on the receipt like everything else — no hidden
   mechanics, the 92/3/5 rule is on every ticket.
4. Every stake, unstake and reward flow is a real signed Seed Vault transaction on devnet —
   verifiable on explorer.solana.com, nothing simulated.
5. PUNCH makes SKR the trust layer of human presence: you don't hold SKR to trade it, you hold it
   because it makes your daily work pay better. That's what a mobile-native L1 token should be.
```

## 6. Règles d'éligibilité à connaître

- Projet démarré **au plus tôt 3 mois avant le lancement** (8 juin 2026) → OK pour PUNCH (développé en sept. 2026).
- Un projet existant peut participer s'il démontre un **développement mobile significatif pendant le hackathon** → OK.
- Doit intégrer la **Solana Mobile Stack / Mobile Wallet Adapter** et interagir réellement avec Solana → OK (MWA + Seed Vault + transactions devnet réelles).
- Les gagnants doivent **publier l'app sur la dApp Store** pour toucher le prix (délai raisonnable accordé après les résultats) — à anticiper.
- Pas besoin d'un Seeker pour soumettre, mais le build cible Seeker → OK.
