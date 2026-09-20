# Checklist habillage PUNCH

Mise à jour : 20 septembre 2026

Un habillage n’est pas une palette : typographie globale + formes + 15 flags + 13 tokens × 4 thèmes.

## Fichiers

- `src/lib/punch/types.ts` — `Look`, `Theme`
- `src/lib/punch/looks.ts` — `lookShape`, `lookTokens`, `lookGallery`, `lookPalettes`, `applyLook`
- `src/components/theme-sync.tsx` — applique le look
- `src/punch/bar.tsx` — A B C + cycle Nuit / Jour / Or / Or+
- `src/punch/splash.tsx` — veille par skin
- `src/skins/a|b|c/` — composition CLOCK IN
- Couleurs token USDC / USDT / SKR **fixes**

## 13 tokens

`bg fg dim dim2 card input border borderLight accent accentFg paper paperFg paperMuted`

## 4 thèmes

`dark` `light` `gold` `goldLight`

## 15 flags (A / B / C)

| Flag | A | B | C |
| --- | --- | --- | --- |
| monoTitle | oui | non | non |
| monoUi | oui | oui | non |
| labels | non | oui | non |
| upper | oui | oui | non |
| titleSpacing | +3 | −0.5 | −0.5 |
| ctaRadius | 999 | 4 | 16 |
| dialInnerAccent | non | oui | oui |
| dialRing | gold | accent | accent |
| clockTag | dash | non | mono |
| hwNav | non | non | oui |
| ticketRadius | 24 | 2 | 6 |
| ticketBorder | non | non | non |
| ticketDashed | non | oui | non |
| pressTilt | non | oui | non |
| ticketMono | oui | non | non |

## Règles

1. 3 skins × 4 thèmes = 12 combos lisibles (extensible à 6 skins).
2. C est un monolithe noir dans les 4 thèmes.
3. Police globale, pas seulement les titres.
4. Zéro changement métier (`store` punch, 92/3/5, globe).
5. Libellés d’honnêteté intouchables.
