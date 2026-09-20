# Audit écran par écran — portage des 3 habillages A/B/C validés

Portage web → punch-native, source : `punch app grok/PUNCH` (web validé, commit 0f76d24).

## Fondations

| Fondation | Web (source) | Native (portage) | État |
| --- | --- | --- | --- |
| 13 tokens × 4 thèmes | `src/lib/punch/looks.ts` `lookPalettes` | `lib/punch/theme.ts` `lookPalettes` | ✅ palettes EXACTES (les overlays dérivés PUNCH-ABC ont été supprimés) |
| C monolithe | `C_MONO` dans les 4 thèmes | idem, mono noir dans les 4 thèmes | ✅ |
| 15 flags | `lookTokens` (objet) | `lookTokens()` (fonction) — valeurs identiques | ✅ |
| Formes globales | `lookShape` radius a=999 / **b=2** / c=16 | `lookShape` + `useShape()` recalés (b 4→2) | ✅ |
| Police globale | `--font-sans` sur `html` | `applyLookFonts()` (mutation avant makeStyles) | ✅ |
| Thème maître | `applyLook(look, theme)` | `useColors()` = `lookPalettes[look][theme]` | ✅ |
| Défaut | — | look par défaut = **c** (Hardware Seeker), persistance accepte a/b/c | ✅ |

## 14 écrans

| Écran | Audit avant portage | Correctif appliqué |
| --- | --- | --- |
| Accueil (index) | déjà piloté par `lookTokens`/`lookShape` (titre, cadran, ticket, CTA double, clock tags, hwNav) | aucun — conforme |
| Missions (board) | rayons OK via `useShape` | aucun — conforme (chip 999 des chips tokens voulu, inchangé) |
| Mission (shift) | CTA/input/chips en dur 16px | ✅ CTA, input, chip → `ctaRadius` ; chip texte mono → `ticketMono` |
| Reçu (receipt) | ticket 24px + tout mono en dur | ✅ ticket → `ticketRadius`, mono des lignes → `ticketMono`, CTA/chip → `ctaRadius` |
| Séparation (split) | reçus 16px, tout mono | ✅ reçus → `ticketRadius`, mono → `ticketMono`, CTA/chip → `ctaRadius` |
| Argent (wallet) | rayons OK via `useShape` | aucun — conforme |
| Globe | rayons OK via `useShape` | aucun — conforme |
| Réglages (settings) | sections/pills/boutons en dur 12–16px | ✅ sections, pills, boutons guide/danger → `ctaRadius` |
| Habillages (looks) | galerie ordre c-a-b, libellés PUNCH-ABC | ✅ ordre A B C + sous-titres SKIN + descriptions validées web + CTA « Appliquer X → » |
| Connexion (connect) | compositions A/B déjà portées | ✅ rayon CTA de base → `ctaRadius` |
| Guide interactif | rayons en dur | ✅ ticket → `ticketRadius`, mono règle → `ticketMono`, CTA/découpe/hi → `ctaRadius` |
| Mode d'emploi (how) | cartes/CTA en dur | ✅ → `ctaRadius` |
| Langue (language) | boutons en dur 16px | ✅ → `ctaRadius` |
| Veille (Screensaver) | déjà piloté par look (mono/serif, rayons 999/2) | aucun — conforme |

## Transversal

- TopBar : boutons A/B/C + 4 thèmes — déjà conformes (pilules a, angles b).
- Barre d'onglets : pilule flottante a, papier b — déjà conforme.
- Règles respectées : zéro changement métier (store punch, 92/3/5, globe) ; libellés d'honnêteté intouchables ; couleurs token USDC/USDT/SKR fixes.

## Vérification

- `npx tsc --noEmit` : seules les 4 erreurs préexistantes (closures `shift`, `globalThis`, `MMKV.delete`) — aucune erreur nouvelle.
- 3 skins × 4 thèmes = 12 combos : chaque paire look/thème a maintenant une palette complète dédiée.
