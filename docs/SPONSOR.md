# PUNCH — Cadre sponsor (premier investisseur : moi)

> Toi = premier investisseur et sponsor de ta propre application. Ce document
> rend l'apport propre : montant écrit, tranches datées, chaque euro traçable
> on-chain, séparation stricte avec les fonds utilisateurs.
> Pas un conseil juridique — juste de la discipline écrite.

## 1. Engagement

| Élément | Valeur |
|---|---|
| Sponsor | [TON NOM — à compléter] |
| Rôle | Premier investisseur / sponsor PUNCH |
| Montant total maximal engagé | [MONTANT + DEVISE — à compléter, ex. 500 €] |
| Période | [DATE DÉBUT] → [DATE FIN ou « jusqu'à épuisement »] |
| Compte source | Wallet perso `[ADRESSE — à compléter]` (jamais un wallet utilisateur) |
| Compte destinataire | Trésor PUNCH multisig (adresse publiée le jour de sa création) |

## 2. Tranches (déblocage conditionnel, pas automatique)

| Tranche | Montant | Condition de déblocage | Statut |
|---|---|---|---|
| T1 — Lancement mainnet | [ex. 100 € en SOL + USDC] | Multisig créé, `networkConfig.ts` basculé, tests micro-montants verts | ☐ |
| T2 — Publication store | [ex. 150 €] | APK mainnet signé, soumission dApp Store « In review » | ☐ |
| T3 — Traction | [ex. 250 €] | [ex. 100 utilisateurs actifs / 1 000 punchs — à définir] | ☐ |

Règle : une tranche ne part que si sa condition est cochée. Sinon elle reste dans ta poche.

## 3. Traçabilité on-chain (chaque versement listé ici)

| Date | Sens | Montant | Tx explorer | Objet |
|---|---|---|---|---|
| — | perso → trésor | — | — | T1 (exemple de ligne — à remplir au réel) |

Principes :
- Chaque versement = une transaction signée, jamais du cash informel.
- Le relevé on-chain fait foi : à tout moment, `total versé (explorer) = total compté ici` au centime.
- Les fonds utilisateurs (missions, stakes) ne transitent JAMAIS par ton wallet perso, et tes fonds sponsor ne paient JAMAIS une dépense perso.

## 4. Contreparties (écrites, sans promesse de rendement)

- Ton apport finance : carburant SOL du trésor, réserve USDC/USDT initiale, frais store/RPC.
- En échange : [à compléter — ex. rien / mention « sponsor fondateur » / part à définir devant notaire si société].
- Interdit dans ce document : toute promesse de rendement, de prix du token, de date de listing.

## 5. Séparation des rôles (toi × 3 casquettes)

| Casquette | Fait | Ne fait jamais |
|---|---|---|
| Sponsor | verse les tranches, lit ce doc | ne touche pas aux clés du trésor |
| Éditeur store | signe les releases (wallet publisher dédié) | ne mélange pas wallet publisher et trésor |
| Opérateur | surveille RPC/soldes, déclenche rollback | ne signe pas seul un mouvement du multisig |

## 6. Journal

| Date | Événement |
|---|---|
| 2026-10-28 | Création de ce cadre (montants à compléter par toi) |
