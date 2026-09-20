# PLI

Lettre cachetée. Tu scelles un secret. On paie pour le lire. La chaîne est aveugle.

## Ce que c’est

- Note chiffrée sur le Seeker (Seed Vault)
- Prix d’ouverture en USDC / USDT
- Solana voit le paiement, pas le texte
- Même règle d’argent : 92 / 3 / 5

## Fichiers de cette app

```
src/pli/app.tsx        App papier / cire
src/pli/box.tsx        Boîte aux lettres
src/pli/write.tsx      Sceller une note
src/pli/letter.tsx     Décacheter
src/pli/compte.tsx     Registre 92 / 3 / 5
src/lib/punch/plis.ts  Plis démo
```

Argent partagé : `src/lib/punch/` (portefeuille, reçus, règle 92/3/5)
Reçu visuel : `src/shared/`

PUNCH n’est pas ici. C’est une autre app.
