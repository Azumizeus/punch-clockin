# PUNCH — release v1.7.1

**Signed APK (arm64):** [`punch-clockin-seeker-v1.7.1.apk`](https://github.com/Azumizeus/punch-clockin/releases/tag/v1.7.1) — built & signed by CI (treasury secret injected at build time, proven by key derivation), SHA-256 in the attached `.sha256` file.

**APK signé (arm64) :** même fichier — construit et signé par la CI (secret trésor injecté au build, prouvé par dérivation), SHA-256 dans le fichier `.sha256` joint.

## New in v1.7.1 — honest failure & honest demo labels / L'échec honnête et le démo étiqueté

**EN —** Two audit findings applied, both about honesty:
- **Real punch-in failure is now honest:** if the Seed Vault transaction fails (RPC rate-limited, sheet closed, network lost), the alert shows **the readable real reason** (`readableTxError`) — never a silent fallback to a fake demo punch-in. No cooldown, no stats, nothing moved: the failure is a failure.
- **Demo receipts are labeled:** every receipt built on a **fake signature** (demo mode: swaps, stakes, shifts simulated locally) now shows **`· demo`** next to the signature, on all three screens (receipt, La part, history). A real signature stays a clickable link to explorer.solana.com (devnet); a fake one is plain text and clearly marked — no dead links, no pretending.
- **HTTPS-only RPC:** a custom RPC endpoint must now be a valid `https://` URL (enforced twice — UI regex and store-level `new URL()` protocol check). A signed transaction sent over plain `http://` would travel cleartext; that door is closed.
- **Zero debug logs in production:** the six `[PUNCH-TX]` console.log calls are gone from shipping code.
- **Code quality pass (49 → 0 lint errors):** React Compiler ref purity fixed via `useAnimatedValue`, dead imports removed, the push-feed interval now only runs while Home is focused.

**FR —** Deux findings d'audit appliqués, tous deux sur l'honnêteté :
- **L'échec réel du pointage est honnête :** si la transaction Seed Vault échoue (RPC saturé, feuille fermée, réseau perdu), l'alerte affiche **la vraie raison lisible** (`readableTxError`) — jamais un repli silencieux vers un faux pointage démo. Rien ne bouge : l'échec est un échec.
- **Les reçus démo sont étiquetés :** tout reçu bâti sur une **signature fictive** (mode démo : swaps, stakes, missions simulées localement) affiche désormais **`· démo`** à côté de la signature, sur les trois écrans (reçu, La part, historique). Une signature réelle reste un lien cliquable vers explorer.solana.com (devnet) ; une fictive reste du texte, clairement marquée — pas de lien mort, pas de prétention.
- **RPC https obligatoire :** un endpoint RPC personnalisé doit maintenant être une URL `https://` valide (double barrière — regex UI et vérification de protocole `new URL()` au store). Une transaction signée envoyée en `http://` partirait en clair ; cette porte est fermée.
- **Zéro log debug en production :** les six `console.log("[PUNCH-TX]")` ont été retirés du code livré.
- **Passe qualité (49 → 0 erreur de lint) :** pureté des refs React Compiler corrigée via `useAnimatedValue`, imports morts supprimés, l'intervalle du flux live ne tourne plus que quand l'Accueil est au premier plan.

## Audit context — treasury key

Appartient au lot d'audit : la **clé du trésor devnet** est toujours embarquée dans l'APK (devnet only, `.local.ts` gitignoré, documenté). Le déplacement de la signature côté serveur reste la prochaine étape d'architecture mainnet-possible — cette release ne lève pas ce point, elle le dit honnêtement.

## Install

```bash
adb install -r punch-clockin-seeker-v1.7.1.apk
```

**Judge guide (EN first):** [docs/GUIDE-JURY.md](https://github.com/Azumizeus/punch-clockin/blob/master/docs/GUIDE-JURY.md) · **Guide jury (FR):** même fichier, français en seconde partie.
