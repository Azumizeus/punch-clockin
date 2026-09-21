---
titre: Feuille de route — PUNCH
mise à jour: 21 septembre 2026
---

# Feuille de route

## Phase 0 — Hackathon CLOCK IN (fait)

- [x] App native Expo/React Native, clone fidèle de l'app de base (polices, couleurs, structure des 5 écrans + Réglages).
- [x] Pointage quotidien avec vraie transaction mémo signée (Seed Vault, devnet).
- [x] Globe avec vraie physique de rotation (drag, momentum, damping exponentiel).
- [x] Thème premium Solana Seeker Mobile Gold.
- [x] Bouton "Quitter le réseau" avec vraie transaction obligatoire, compteurs partagés honnêtement décrémentés.
- [x] Économie réelle sur devnet : trésor + mints SPL (USDC réel Circle, USDT/SKR démo), tous les mouvements d'argent (pointage, sortie, stake/unstake, swap, paiements de missions, "dire bonjour") sont de vraies transactions signées.
- [x] Frais protocole réels sur les transactions d'entrée/sortie et de retrait.
- [x] Nouvel habillage visuel : écran "CLOCK IN" minimal, ticket papier après pointage, mode d'emploi interactif en 8 étapes.
- [x] Documentation complète (ce dossier).

### Sprint 20 septembre — fiabilité et habillages (fait)

- [x] Crash au lancement sur appareil réel réparé (polyfill `Buffer` chargé par un point d'entrée custom **avant** expo-router — le bundle embarqué Hermes n'a pas de Buffer).
- [x] Chaîne de signature réparée de bout en bout : **Seed Vault signe, l'app soumet elle-même** la transaction (5 tentatives) puis confirme sur sa propre connexion. Avant, le vault soumettait via son endpoint RPC et échouait en silence — d'où « validée » côté vault, « refusée » côté app, et rien on-chain.
- [x] Zéro simulation possible : en mode réel, chaque flux signé refuse proprement si la session est perdue (message clair, jamais de chiffres modifiés en douce). Check de SOL avant d'ouvrir la feuille de signature.
- [x] Reçus vérifiables pour **tous** les flux (pointage, mission, bonjour, swap, stake, unstake, quitter) avec la signature réelle cliquable vers l'explorer devnet, navigation automatique vers le reçu après swap/stake/unstake.
- [x] Les 3 habillages PUNCH-ABC portés fidèlement au design source : **police globale** (A = IBM Plex Mono, B = Fraunces serif), **formes** (A = pilules, B = angles 2 px, C = monolithe), et **compositions distinctes** : écran CLOCK IN (A = anneau or `#d4af37` + horloge `— HH:MM:SS —`, B = ticket pointillé qui s'enfonce au toucher, C = onglets hardware `‖ DOM / 2 VUE` + LOCAL TIME), écran de connexion (A = CTA en anneau bordé, B = icône en ticket carré), surfaces (B = papier + ombre dure, C = transparent, lignes effacées).
- [x] **4 thèmes × 3 habillages = 12 apparences** : Sombre, Clair, Or noir, Or clair — chaque habillage possède ses 4 variantes de couleurs exactes du CSS source (A clair = jaune machine `#f0c14b`, B clair = lin/papier `#cfc3a8`/`#fffaf0`, C = monolithe noir forcé dans tous les thèmes). Boutons A B C dans la barre du haut, sur tous les écrans.
- [x] Écran de veille « miroir » : après inactivité (réglable 10/30/60 s), l'écran montre le style CLOCK IN de **ta** combinaison thème + habillage, horloge en direct, un tap réveille.
- [x] APK signé arm64 buildé localement (Gradle) et installé sur Seeker — aucune dépendance à Expo Go pour le jury.
- [x] Persistance durcie : purge du token d'autorisation à chaque relance (exigence Seed Vault), garde-fous sur les anciennes données persistées.

> **Décision du 20 sept.** — Le jury est présenté avec l'app sur **SPL standard devnet** (déjà vivant : trésor 4,9 SOL, mints, tous les flux signés vérifiables). Le programme Anchor de staking reste en Phase 1 : c'est un plus de vérifiabilité, pas un prérequis de démo — on le construit sans pression, après le hackathon.

### Sprint 21 septembre — identité, fiabilité, nettoyage (fait)

- [x] **Identité unique Seeker Premium (v1.5.0–v1.6.x)** : fusion assumée des habillages B+C (serif Fraunces, angles 2 px, onglets hardware, LOCAL TIME) ; un seul design, deux identités de couleur — **Gold** (défaut) et **Nuit** (option). Sélecteurs A/B/C et thèmes multiples retirés ; badge lingot `GoldBadge`.
- [x] **Onglet Bonjours (hellos)** : dire bonjour paie 0,10 USDC en réel (trésor → wallet) + bonus 25 SKR (assumé hors chaîne, écrit sur l'écran) ; compteurs semaine/mois/année/total et classement.
- [x] **Historique des tickets** : les 100 derniers reçus persistés (MMKV), rouvrables, signature cliquable vers l'explorer.
- [x] **Frais protocole réels** sur pointage (0,02 USDC), sortie du réseau (0,02 USDC) et unstake (1,5 %) — répartis protocole/stakers avec rachat SKR.
- [x] **Erreurs de transaction cohérentes et lisibles** : tous les flux (swap, stake/unstake, missions, bonjours, post) affichent la VRAIE raison (`readableTxError`) — « RPC devnet saturé », « réseau perdu »… ardoise `lastTxError` remise à zéro par tentative, jamais simulé.
- [x] **Horloge de l'accueil économe** : re-render seulement quand la seconde affichée change, gel hors focus/ AppState (bug sec/ms de la v1.6.4 corrigé en v1.6.5). L'anneau pulsant du cadran reste volontairement infini (design).
- [x] **Nettoyage** : écran de veille supprimé (armait une veille au milieu des transactions lentes), écran mort `how.tsx` retiré (remplacé par `guide.tsx`) — **17 écrans** au total (7 onglets + 10 écrans).
- [x] **Outillage de contrôle appareil durci** : `scripts/device/ui_probe.py` (uiautomator dump vérifié, diff image sinon — l'accueil est non-idle), tours adaptés, audit on-chain du trésor, driver du test réseau coupé.
- [x] APK signé **v1.6.5** (versionCode 19) installé et validé sur Seeker réel : punch-in réel tamponné on-chain, swap jusqu'à la feuille Seed Vault, zéro crash logcat.

## Phase 1 — Juste après le hackathon

- [ ] Programme Solana dédié (Anchor) pour le staking : aujourd'hui le SKR misé va dans un trésor commun et sa comptabilité par utilisateur est faite côté app. Un vrai programme donnerait un compte on-chain par utilisateur (PDA), vérifiable indépendamment de l'app.
- [ ] Petit serveur backend pour le trésor : sur devnet la clé du trésor est embarquée dans l'app (acceptable, tokens sans valeur). Avant toute mise en avant publique plus poussée, faire signer le trésor côté serveur.
- [ ] Vraies missions géolocalisées (aujourd'hui : liste de démo `SHIFTS`) avec vérification de présence (scan de code, preuve de position par pays uniquement — jamais de GPS précis, c'est une règle produit).
- [ ] Système de notation / réputation des Seekers au-delà du simple rang par SKR misé.

## Phase 2 — Mainnet

- [ ] Basculer `DEVNET_MINTS.SKR` sur le vrai mint mainnet Solana Mobile Seeker (`79dd8EvWuGjPTnTMMBoY6Nqtdw5u1cXaGh4azuLGjiAj` ou l'adresse confirmée au moment du switch — à revérifier, plusieurs adresses circulent).
- [ ] USDC mainnet standard, USDT mainnet standard (Tether) au lieu des mints de démo.
- [ ] Vraie conformité : KYC minimal si des paiements réels et retraits vers fiat sont proposés.
- [ ] Programme de staking on-chain audité avant tout dépôt réel de valeur.

## Phase 3 — Écosystème Nexus complet

- [ ] Intégration de **PLI** (le produit "secret scellé") comme second verbe de l'écosystème, avec son propre onboarding dans le mode d'emploi (aujourd'hui : teaser informatif seulement, "ships after CLOCK IN").
- [ ] Écran "Atelier" commun aux deux produits (PUNCH + PLI), comme dans l'app de base web.
- [ ] Partage de la trésorerie et du pool de stakers entre les deux produits, avec reporting transparent.

## Ce qui ne changera pas (principes produits, à ne jamais casser)

- La règle 92/3/5 est affichée sur chaque reçu, jamais cachée.
- Aucune donnée de géolocalisation précise n'est jamais stockée — seulement le pays.
- Aucune fonctionnalité qui touche à l'argent n'est simulée : c'est une vraie transaction ou ça n'existe pas.
