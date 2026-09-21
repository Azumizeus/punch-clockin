# Plan de montage — vidéo démo PUNCH (2 min 30)

> Rushes : `punch-native/_shots/demo-v165/segB-*.mp4` (8 segments, 87,6 s bruts, 1080×2400, tournés sur Seeker le 21/09/2026, app v1.6.5, identité Gold).
> Script : `docs/SCRIPT-VIDEO.md` (voix off EN mot pour mot). Durée cible finale : **2 min 30**.

## Table de montage

| # | Timecode cible | Voix off (SCRIPT-VIDEO) | Rush à utiliser | Manipulation |
|---|---|---|---|---|
| 1 | 0:00–0:15 | Hook — CLOCK IN, la règle 92/3/5 | `segB-01-clockin.mp4` (17,2 s) | Accélérer ×1,15 si besoin ; zoom léger sur « CLOCK IN » au début ; titre PUNCH en surimpression 0:03–0:10 |
| 2 | 0:15–0:45 | Vrai pointage — Seed Vault signe | `segB-02-punch.mp4` (4,5 s) + **plan téléphone réel à tourner** (bolt + feuille Seed Vault filmés en gros plan) | Ralentir le tap ; insérer 2–3 s d'écran explorer (tx mémo `PUNCH 2026-09-21`) ; ticket final en plein écran 2 s |
| 3 | 0:45–1:15 | L'économie est réelle — Board | `segB-03-board.mp4` (12,0 s) | Boucler le scroll ×2 pour durer ~8 s ; flèche sur une mission payée USDC |
| 4 | 1:15–1:45 | SKR + globe — Wallet & World | `segB-04-wallet.mp4` (10,0 s) + `segB-05-globe.mp4` (14,0 s) | Wallet : zoom sur soldes USDC/USDT/SKR (3 s) ; globe : garder les 2 lancers entiers (momentum visible) ; bonjour : 3 s de `segB-06-hellos.mp4` |
| 5 | 1:45–2:15 | L'honnêteté — Quitter le réseau | `segB-07-history.mp4` (10,0 s) + capture `08-settings.png` | Historique : 2 reçus défilés, zoom signature cliquable (4 s) ; settings : plan fixe sur « Quitter le réseau » (3 s) ; **à tourner à la main** : la vraie transaction de sortie (signature + compteurs qui décrémentent) |
| 6 | 2:15–2:30 | Clôture — logo + liens | `segB-08-final.mp4` (10,0 s) | Geler la dernière seconde ; logo PUNCH + « GitHub · Judge guide · APK signé » en carte ; fade to black |

## Plans complémentaires à tourner à la main (téléphone en main)

1. **Bolt + feuille Seed Vault en gros plan** (segment 2) — c'est la crédibilité : la vraie feuille système.
2. **Explorer 5 s** après le pointage (explorer.solana.com, cluster=devnet, adresse du trésor `FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn`).
3. **Quitter le réseau** en vrai (segment 5) — signature + les compteurs qui décrémentent.

## Notes de montage

- **Voix off EN obligatoire** (jury anglophone) ; sous-titres FR optionnels.
- Musique : discrète, -18 LUFS sous la voix ; cut au beat sur les transitions 1→2 et 4→5.
- La voix off du segment 4 (30 s) couvre wallet+globe+bonjour : garder chaque plan ≥ 6 s, pas de cut plus court (lisibilité).
- Chiffres animés (92/3/5) en surimpression pendant le hook et la clôture.
- Export : 1080p60 H.264, ~12 Mb/s, audio AAC 320 kb/s — `punch-clockin-demo.mp4`, à héberger sur YouTube et lier dans la soumission.
- Les rushes sont propres (touches adb invisibles à l'écran) : aucun flou nécessaire.

## Journal de la répétition générale

`punch-native/_shots/demo-v165/evidence.md` — **8/9 étapes OK** ; le « lot de bienvenue » non déclenché est le **comportement correct** (wallet Seed Vault existant ≠ wallet vide — la règle « lot uniquement aux wallets vides » a tenu). Captures-preuve : `B-01→B-08-*.png`.
