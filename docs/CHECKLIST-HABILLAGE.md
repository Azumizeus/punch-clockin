---
titre: Checklist complète — générer un habillage (skin) PUNCH
usage: à donner tel quel à l'IA ou au designer qui génère les 3 nouveaux habillages
mise à jour: 20 septembre 2026
---

# Checklist habillage PUNCH — liste exhaustive des éléments à générer

> Un habillage (skin) PUNCH n'est pas juste une palette : c'est **typographie globale + formes + composition des écrans clés + 4 variantes couleur**. Chaque nouveau skin DOIT définir TOUS les éléments de cette liste. Les 3 skins existants (A Horloge d'usine, B Ticket de pointeuse, C Hardware Seeker) servent d'exemples de complétude.
>
> Base de vérité : `punch-native/lib/punch/` (types.ts, looks.ts, fonts.ts, theme.ts) et le CSS source `punch app grok/PUNCH-ABC/src/styles.css`.

---

## 1. Le contrat d'intégration — fichiers à produire

Un nouveau skin (D, E, F…) n'est complet que si ces points sont livrés :

| # | Fichier | Ce qu'il faut ajouter |
|---|---|---|
| 1 | `lib/punch/types.ts` | Étendre le type `Look` (`"a" \| "b" \| "c"` → ajouter les nouvelles lettres) |
| 2 | `lib/punch/looks.ts` | `lookShape()` : rayon global + couple de polices du skin |
| 3 | `lib/punch/looks.ts` | `lookTokens()` : les **15 flags de composition** (section 3) |
| 4 | `lib/punch/looks.ts` | `lookGallery` : nom, sous-titre `SKIN X · NOM`, description FR + EN |
| 5 | `lib/punch/fonts.ts` | Branche dans `applyLookFonts()` : remplacement GLOBAL des 6 rôles de police |
| 6 | `lib/punch/theme.ts` | `lookPalettes` : overrides couleur pour chacun des 4 thèmes (peut être partiel = hérite, ou forcé comme le skin C) |
| 7 | `app/looks.tsx` | Carte de la galerie (preview, sélection) |
| 8 | `components/TopBar.tsx` | Bouton du skin dans la barre A B C → A…F |
| 9 | `app/(tabs)/index.tsx` | Composition CLOCK IN si le skin a ses propres variantes (branches `if look`) |
| 10 | `app/connect.tsx` | Composition de l'écran de connexion (idem) |
| 11 | `app/(tabs)/_layout.tsx` | Restyle de la tab bar si le skin la transforme |
| 12 | `components/Screensaver.tsx` | Miroir écran de veille dans le style du skin |
| 13 | `assets/fonts/` + chargement | Uniquement si polices neuves : fichier .ttf + load dans `_layout` |

---

## 2. Niveau 1 — Les 13 tokens couleur × 4 thèmes

Le THÈME reste maître de la couleur, l'habillage peut le surcharger (4 variantes obligatoires : `dark`, `light`, `gold` = gold black, `goldLight`). Pour chaque variante, définir (hex exact) :

| Token | Rôle | Où il est utilisé |
|---|---|---|
| `bg` | Fond d'écran | partout |
| `fg` | Texte principal | titres, valeurs, icônes |
| `dim` | Texte secondaire | labels, sous-titres (`--color-subtle`) |
| `dim2` | Texte tertiaire | compteurs, métadonnées (`--color-muted`) |
| `card` | Surface carte | cartes mission, balances, réglages (`--color-surface`) |
| `input` | Surface champ/secondaire | champs texte, pilules TopBar (`--color-surface-2`) |
| `border` | Bordure franche | cartes actives, séparateurs forts (`--color-line-strong`) |
| `borderLight` | Bordure légère | séparateurs, contours (`--color-line`) |
| `accent` | Accent principal | CTA, anneaux, sélection, dot globe |
| `accentFg` | Texte SUR accent | libellés des CTA |
| `paper` | Fond ticket papier | reçu, ticket CLOCK IN |
| `paperFg` | Texte sur ticket | reçu |
| `paperMuted` | Texte atténué sur ticket | métadonnées du reçu |

Deux stratégies possibles (comme les skins existants) :
- **Héritage teinté** (skins A et B) : dériver les 4 variantes du skin depuis sa dark/light, teintées or pour gold/goldLight.
- **Forçage monochrome** (skin C) : même palette dans TOUS les thèmes — assumé, c'est ce qui le rend reconnaissable.

Couleurs de tokens NON thémables (fixes, ne pas redéfinir) : `USDC #8aa0b3`, `USDT #8aa392`, `SKR #d7d2cb`.

---

## 3. Niveau 2 — Typographie globale (6 rôles)

L'habillage remplace la police du CORPS ENTIER (c'est la signature d'un skin), pas juste les titres :

| Rôle | Usage | Exemple A | Exemple B | Exemple C |
|---|---|---|---|---|
| `body` | texte courant | IBM Plex Mono | Fraunces | Figtree |
| `bodyMedium` | texte appuyé | mono | Fraunces semi | Figtree 500 |
| `bodySemi` | texte fort | mono | Fraunces semi | Figtree 600 |
| `display` | grands titres | Fraunces (contraste) | Fraunces | Fraunces |
| `displaySemi` | titres appuyés | Fraunces semi | Fraunces semi | Fraunces semi |
| `mono` | chiffres, horloges, signatures | IBM Plex Mono | mono (déjà) | mono |

À définir : **le couple body/display** du skin + le rayon global (`lookShape.radius`).

---

## 4. Niveau 3 — Les 15 flags de composition (`lookTokens`)

| Flag | Ce qu'il contrôle | A | B | C |
|---|---|---|---|---|
| `monoTitle` | Titre CLOCK IN en mono industriel | ✔ | – | – |
| `monoUi` | Libellés UI (CTA, sous-titres) en mono capitales | ✔ | ✔ | – |
| `labels` | Étiquettes TIME / COUNTRY / SPLIT sur le ticket | – | ✔ | – |
| `upper` | Valeurs du ticket en capitales | ✔ | ✔ | – |
| `titleSpacing` | Letter-spacing du titre | +3 | −0.5 | −0.5 |
| `ctaRadius` | Rayon des boutons (999 pilule / 4 brut / 16 doux) | 999 | 4 | 16 |
| `dialInnerAccent` | Intérieur du cadran = accent (sinon ivoire) | – | ✔ | ✔ |
| `dialRing` | Anneau du cadran : `gold` fixe ou `accent` thème | gold | accent | accent |
| `clockTag` | Horloge live : `false` / `"dash"` (— HH:MM:SS —) / `"mono"` (LOCAL TIME) | dash | false | mono |
| `hwNav` | Onglets hardware `‖ DOM / 2 VUE` sous le titre | – | – | ✔ |
| `ticketRadius` | Rayon du ticket CLOCK IN / reçu | 24 | 2 | 6 |
| `ticketBorder` | Bordure franche autour du ticket | – | – | – |
| `ticketDashed` | Bordure POINTILLÉE façon déchirure | – | ✔ | – |
| `pressTilt` | Le ticket s'enfonce au toucher | – | ✔ | – |
| `ticketMono` | Ticket entièrement en mono | ✔ | – | – |

Chaque nouveau skin choisit une valeur pour les 15 — c'est ce qui produit des compositions *distinctes*, pas des recoloriages.

---

## 5. Niveau 4 — Inventaire écran par écran (tout ce qui doit être habillé)

### 5.1 Transverse — visible partout
- Fond `bg` + texte `fg` de chaque écran
- **TopBar** : pilule de fond (`input`), titre d'écran (`fg`), statut, boutons sélecteur de skin (actif = `accent`/`accentFg`, inactif = `borderLight`)
- **Tab bar** (`(tabs)/_layout`) : 5 onglets (Punch, Board, World, Wallet, Split), pilule flottante, icônes actives/inactives, labels mono espacés (style A)
- **Écran de veille** (`Screensaver`) : miroir CLOCK IN du combo thème+skin, horloge live, réveil au tap
- Alertes système (coin du message = la vraie raison d'échec)

### 5.2 `app/connect.tsx` — écran d'entrée CLOCK IN
Logo PUNCH · titre (composition mono/serif) · cadran : anneau (`dialRing`), intérieur (`dialInnerAccent`), chiffres · horloge locale live (`clockTag`) · onglets hardware (`hwNav`) · CTA « CLOCK IN » (`accent`/`accentFg`, `ctaRadius`) · libellés mode démo/réel · lien langue

### 5.3 `(tabs)/index.tsx` — Punch (écran principal)
Bouton bolt : anneau + intérieur + icône · ticket post-pointage (paper + `ticketRadius`/`ticketBorder`/`ticketDashed`/`ticketMono`, étiquettes `labels`, capitales `upper`) · compteur streak · horloge HH:MM:SS · carte globe hero (`card`/`input`) · feed d'activité (`dim`/`dim2`) · CTA secondaires

### 5.4 `(tabs)/board.tsx` — Board (missions)
Cartes mission (`card`, `borderLight`, rayon) · chip token (couleurs fixes USDC/USDT/SKR) · payout (`accent`) · places prises/total (`dim`/`dim2`) · rang requis · CTA « Être payé » · CTA « Payer quelqu'un »

### 5.5 `(tabs)/globe.tsx` — World (globe)
Globe : mer, continents, points punch live (`accent`), pulse on-chain · drag physics (rien à habiller, mais les overlays oui) · légendes et compteurs (`dim`/`dim2`) · cartes hero (`card`, `border`)

### 5.6 `(tabs)/wallet.tsx` — Wallet
Carte balance (`card`, `fg`) · lignes par token (chips, montants) · boutons Swap / Stake / Unstake (`accent`) · historique (`dim`) · CTA « Quitter le réseau » (état danger)

### 5.7 `(tabs)/split.tsx` — Split (92/3/5)
Compteurs 92 / 3 / 5 (`paper`/`paperFg`) · barres de répartition · cartes protocole + stakers (`card`) · chiffres (`dim2`)

### 5.8 `(tabs)/settings.tsx` — Réglages
Lignes de réglage (`card`, `border`) · sélecteur de thème (4) · sélecteur de skin · durée veille (10/30/60 s) · langue · tour guidé · quitter le réseau

### 5.9 `app/shift.tsx` — détail mission
Carte sponsor (`card`) · titre + blurb (`fg`/`dim`) · chip token + payout (`accent`) · durée · timer de présence (dwell) · champ review (`input`, `border`) · compteur caractères · CTA valider (`accent`/`accentFg`) · état refusé (< 40 caractères)

### 5.10 `app/post.tsx` — poster une mission
Champs titre/ville/montant (`input`, `border`) · chips token sélectionnables (`accent`) · durée · CTA « Payer quelqu'un » (`accentFg`) — signer via Seed Vault

### 5.11 `app/receipt.tsx` — reçu
Ticket papier complet (`paper`/`paperFg`/`paperMuted`, `ticketRadius`/`ticketDashed`) · étiquettes TIME / COUNTRY / SPLIT (`labels`) · split 92/3/5 imprimé · tampon on-chain · signature cliquable vers l'explorer (`accent`) · bouton retour

### 5.12 `app/guide.tsx` — tour guidé
Cartes d'étapes (`card`) · surbrillance de l'élément ciblé · bulles (`paper`) · boutons suivant/quitter

### 5.14 `app/looks.tsx` — galerie des skins
Cartes preview par skin (`input`/`card`/`borderLight`) · état sélectionné (`accent`) · nom + accroche FR/EN · bouton A B C dans TopBar

### 5.15 `app/language.tsx` — langue
Boutons FR / EN (`accent`/`accentFg`) · état sélectionné

---

## 6. Niveau 5 — États interactifs (à spécifier pour chaque bouton/carte)

- **Normal** · **Pressé** (ex. B : le ticket s'enfonce) · **Désactivé** (`dim`) · **Sélectionné** (`accent` inversé) · **Erreur** (bordure + message honnête) · **Succès** (reçu, tampon) · **Focus champ** (`border` fort)

---

## 7. Identité de galerie (par nouveau skin)

Pour `lookGallery`, fournir : `name` (nom FR court), `sub` (`SKIN X · NOM-EN-CAPITALES`), `desc.fr` + `desc.en` (une phrase d'ambiance). Exemple : A = « Horloge d'usine / SKIN A · CLOCK-MACHINE / Chiffres monospace, pilules, cadran or sur noir — la beauté de la machine. »

---

## 8. Règles d'or (validation finale)

1. **24 combinaisons** doivent cohabiter : 6 skins × 4 thèmes — chaque écran reste lisible dans TOUTES les combos.
2. Le thème est maître des couleurs SAUF décision contraire assumée et cohérente (cf. skin C monolithe).
3. La police change GLOBALEMENT (corps entier), jamais seulement les titres.
4. Zéro toucher à la logique métier (`store.ts`, transactions, Seed Vault) — un skin = présentation uniquement.
5. Les libellés restent EXACTS (92/3/5, « Quitter le réseau », raisons d'erreur) — l'honnêteté n'est pas thémable.
6. Toutes les valeurs en hex exact / nombres exacts — pas de « à peu près ».
7. Tester en vrai sur Seeker : contraste en plein soleil, zones tactiles ≥ 44 px, ticket lisible à bout de bras.
8. Fournir le récapitulatif des 15 flags + 13 tokens × 4 thèmes sous forme de tableaux remplis — c'est ce qui sera codé.
