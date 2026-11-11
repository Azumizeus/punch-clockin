# Exposé — Comment le Seeker a été piloté sans toucher au téléphone
*(Document de présentation : automatisation ADB du Solana Seeker pour PUNCH)*

> Question traitée : « Comment as-tu fait pour interagir avec le mobile Seeker sans mon intervention ? »
> Réponse courte : un PC Windows branché en USB pilote tout — taps, swipes, vidéos, lectures d'écran — via **ADB**. La seule chose que la machine ne peut pas faire à ta place, par sécurité Android, c'est **approuver les signatures Seed Vault du doigt sur l'écran du téléphone** (connexion, pointage, say-hi, sortie réseau). Tout le reste est 100 % automatique.

---

## 1. Plan de l'exposé (5 minutes)

1. Le montage : un câble USB, pas de magie (30 s)
2. Les 4 briques : voir, toucher, filmer, prouver (1 min)
3. Le piège qui a failli tout fausser : l'écran « jamais idle » (1 min)
4. La danse avec le Seed Vault : la machine attend, l'humain signe (1 min)
5. Ce que ça a produit : 9 segments × 2 langues, preuves à l'appui (30 s)
6. Limites honnêtes + ouverture (30 s)

---

## 2. Le montage matériel et logiciel

| Élément | Détail réel du projet |
|---|---|
| Téléphone | **Solana Seeker** (Android, 1200×2670), avec Seed Vault + PUNCH installé (`com.punchclockin.app`, `MainActivity`) |
| Liaison | Câble USB + **ADB** (`%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`) |
| Pilote | Scripts Python sur le PC : `punch-native/scripts/device/*.py` (19 scripts) |
| Rushs produits | `punch-native/_shots/demo-v169-fr/` et `demo-v169-en/` : 9 `.mp4` + ~17 `.png` + `evidence-{fr,en}.md` par langue |
| Réseau Solana | `devnet`, trésor `FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn` |

Aucune app espionne installée sur le téléphone. ADB sait déjà tout faire : `input tap`, `input swipe`, `screencap`, `screenrecord`, `am start`, `dumpsys window`, `uiautomator dump`. Les scripts ne font qu'orchestrer ces ordres.

---

## 3. Les 4 briques de l'automatisation

### 3.1 VOIR — lire l'écran sans le regarder (`ui_probe.py`)

Deux méthodes complémentaires, car aucune ne marche partout :

- **Dump XML** : `adb shell uiautomator dump /sdcard/ui_probe.xml` puis `adb pull`. On parse le XML et on cherche un texte (`find_text`) : par ex. « Ouvrir mon portefeuille » → on calcule le centre du bouton depuis `bounds="[x0,y0][x1,y1]"` et on tape dessus. C'est comme ça que le script trouve tout seul la CTA de connexion ou le bouton « Quitter le réseau » même s'il a bougé.
- **Diff d'images** : `adb exec-out screencap -p` → deux PNG comparés en niveaux de gris redimensionnés (`screen_diff`). Score 0 = identique. Utilisé quand le dump est impossible (voir §4) et pour **prouver** qu'un tap a vraiment changé d'écran (`tap_checked` : diff > 2.0 = CHANGEMENT).

Fichier : `punch-native/scripts/device/ui_probe.py` — fonctions `fresh_dump()`, `find_text()`, `screenshot()`, `screen_diff()`, `tap()`.

### 3.2 TOUCHER — taps et swipes calibrés au pixel

Le Seeker fait 1200×2670. Les coordonnées ont été lues dans de vrais dumps, pas devinées :

- Onglets (barre du bas, y = 2592) : accueil 85, missions 257, monde 428, bonjours 600, argent 771, la part 943, réglages 1114.
- Thèmes (TopBar) : sombre (752,184), clair (880,184), or (995,184). Bouton langue : (1113,184).
- Swipes : `input swipe 540 1700 540 900 400` (scroll), balayages du globe `900→200` / `200→900` pour montrer la physique.
- Touches système : `KEYCODE_WAKEUP`, `82` (déverrouillage), `4` (back pour fermer une feuille ou un onglet navigateur).

**Garde-fous** (appris à la dure le 08/10) :
- *Garde-fou focus* (`demo_v169.py::tap`) : avant chaque tap, on lit `dumpsys window | grep mCurrentFocus`. Si ni `punchnative` ni `solanamobile` n'est au premier plan, **le tap est annulé** — sinon on tapait sur le launcher et les fenêtres personnelles.
- *Deep links interdits* : `punchnative://…` cassait la route (« Unmatched Route »). Depuis, **navigation uniquement par taps d'onglets**, zéro deeplink en tournage.
- *Navigation aveugle assumée* : si le dump est muet, `probe()` re-tape les coordonnées fixes au lieu d'abandonner (« dump muet — navigation à l'aveugle »).

### 3.3 FILMER — un screenrecord par segment (`demo_v169.py`, classe `Rec`)

Principe : on démarre `adb shell screenrecord --bit-rate 8000000 --time-limit 180 /sdcard/punchdemo/seg-XX.mp4` **avant** les actions, on joue la scène, puis on arrête proprement par **SIGINT au processus distant** (`pkill -INT screenrecord`) — c'est ce qui finalise un MP4 lisible. Ensuite `adb pull` vers `_shots/` + `rm` distant, et contrôle de taille (> 100 Ko, sinon « TROP COURT »).

Chaque segment = 1 scène du parcours : `seg-00-connect`, `seg-01-punch`, `seg-02-jobs`, `seg-03-money`, `seg-04-world`, `seg-05-hellos`, `seg-06-cut`, `seg-07-settings`, `seg-08-arc` (quitter + reconnexion + punch). Photos PNG prises au moment exact (`screencap`) : `03-ticket.png`, `05-hellos-paye.png`, etc.

L'ancienne génération (`shoot_v3.py`, 9 plans) tournait en 45/38/22/24/26/30/40/18 s avec le même protocole, plus un plan navigateur vers `explorer.solana.com/...?cluster=devnet` pour filmer le trésor.

### 3.4 PROUVER — le fichier evidence (anti-trucage)

Chaque passe ajoute dans `evidence-{fr,en}.md` une ligne `[OK]` / `[ECHEC]` horodatée par étape + un bilan `x/9 OK`. Exemple : `[OK] say-hi : say-hi signé`. Les tickets et reçus restent vérifiables sur l'explorer devnet via les signatures. Le rapport de tour (`_tour-report.txt`, `tour_punch.py`) loggue chaque écran avec ses 3 premiers textes bruts — jamais un nom déduit, pour ne pas inventer un état.

---

## 4. Le piège qui a failli tout fausser : l'écran « jamais idle »

L'accueil PUNCH a une horloge live à 1 Hz + un anneau pulsant : l'UI n'est **jamais idle**, donc `uiautomator dump` répond `ERROR: could not get idle state`… **en silence**. Un script naïf relisait alors le XML périmé de l'écran précédent — c'est ainsi qu'un faux bug « le tap Accueil ne fait rien » a failli être corrigé à tort.

La règle durcie dans `ui_probe.fresh_dump()` : **un dump sans vérification explicite est un bug**. On exige le mot `dumped` dans la sortie, on re-parse, on réessaie ; en cas d'échec on renvoie `None` — jamais un vieil état. `tour_punch.py` affiche alors `non-idle` et bascule sur la preuve image ; `tour2_punch.py` ne croit qu'au **changement** mesuré par diff. C'est l'anecdote à raconter au jury : sans cette sonde, toutes les « preuves » d'écran étaient suspectes.

---

## 5. La danse avec le Seed Vault : ce que la machine ne fait PAS

C'est le point honnête de l'exposé — et c'est une force, pas une faiblesse :

1. Le script tape le bouton (connexion, bolt de pointage, say-hi, quitter).
2. Il détecte la feuille système : `"solanamobile" in dumpsys window (mCurrentFocus)`.
3. Il attend l'**ouverture** (`vault_cycle` / `wait_until(in_sheet)`), affiche `>>> SIGNE LE POINTAGE SUR LE TÉLÉPHONE <<<`, puis attend la **fermeture** (jusqu'à 60–120 s).
4. **Un doigt humain approuve sur le téléphone.** Android l'exige : aucune commande ADB ne peut signer à la place du Seed Vault.
5. Le script reprend seul : attente confirmation on-chain (~4–5 s), capture du ticket, suite du parcours.

Signatures exigées par passe complète : connexion, punch, say-hi, quitter, reconnexion (+ punch de contrôle) — le script les annonce `1/3`, `2/3`, `3/3`. Ancien protocole (`shoot_v3.py`) : ne jamais fermer la feuille pendant qu'elle s'ouvre (attendre OUVERTE → demander → attendre FERMÉE), et tourner la connexion **en premier** car l'app purge sa session à chaque relance à froid. Le plan A de `shoot_plans_v2.py` montre même la feuille **refermée au dos sans signer** (touche back) pour prouver l'écran de signature sans accorder d'autorisation.

---

## 6. Déroulé d'une passe complète (ce que fait `demo_v169.py en/fr`)

1. `switch_lang()` : lit les textes d'écran, gère 3 cas (déjà bonne langue / écran bienvenue avec bouton FR-EN / premier lancement avec lignes « Français/English »), tape la bonne ligne, **abandonne si la langue n'est pas confirmée** (pas de film dans la mauvaise langue).
2. `p_connect` : bienvenue → tap CTA → feuille → signature → lot de bienvenue → `01-connecte.png`.
3. `p_punch` : onglet accueil → tap cadran (4 positions candidates testées) → feuille → signature → ticket papier → `03-ticket.png`.
4. `p_jobs / p_money / p_world` : onglets + scrolls + captures (globe : 3 balayages).
5. `p_hellos` : cherche un bouton say-hi **hors barre d'onglets** (y < 2400) → tap → signature → `05-hellos-paye.png`.
6. `p_cut / p_settings` : la part 92/3/5, réglages (réseau + version, sans signature).
7. `p_leave_connect_punch` (l'arc honnête) : scroll 3× pour révéler « Quitter », tap → signature sortie → écran Connect → reconnexion signée → test punch (si pas de feuille : verdict honnête `ECHEC — punch filera à la bascule du jour`, car le punch est limité à 1/jour/wallet on-chain).

Lancement : `python demo_v169.py en` puis `python demo_v169.py fr` (ou `arc-only` pour rejouer juste l'arc). Bilan affiché : `PASSE EN : 9/9 OK`.

---

## 7. Chiffres et preuves à citer

- 19 scripts dans `punch-native/scripts/device/` : sonde (`ui_probe`), tours de contrôle (`tour_punch`, `tour2_punch`), tournages (`shoot_v3*`, `shoot_plans_v2`, `demo_v169`, `demo_day`, `demo_take2`), utilitaires (`scan_memo_prog`, `check-treasury-now.mjs`).
- Coordonnées : écran 1200×2670, 7 onglets, 3 thèmes, ~10 positions de tap critiques.
- Sorties par langue : 9 MP4 (screenrecord 8 Mbit/s) + ~17 PNG + evidence.md.
- Transactions réelles devnet : mémo `PUNCH <date>` (pointage), transferts SPL (missions, swap, stake/unstake −1,5 %), 0,10 USDC (say-hi), lot de bienvenue (0,05 SOL + 5 USDC + 20 USDT + 5000 SKR), sortie réseau qui décrémente les compteurs.
- Vérification : chaque signature cliquable vers l'explorer ; `readableTxError()` affiche la vraie raison d'échec (429, réseau, refus) au lieu d'avaler l'erreur.

---

## 8. Limites honnêtes (à dire au jury)

- Sans le doigt humain sur les feuilles Seed Vault, rien ne se signe — c'est la sécurité du Seeker, pas un défaut du script.
- Le punch est limité à 1/jour/wallet on-chain : impossible de refilmer le pointage à volonté avec le même wallet.
- Le devnet public rate-limite (429) : les réglages permettent de coller son propre RPC + bouton « Tester la connexion » (vrai ping `getSlot`).
- `uiautomator` reste aveugle sur écrans animés : on navigue alors aux coordonnées fixes + preuve image.
- Les vidéos finales (`punch-native/releases/punch-final-{fr,en}.mp4`) sont un **montage** de ces rushs + voix off : elles racontent le parcours, elles ne sont pas un plan-séquence brut (les bruts sont dans `_shots/`).

---

## 9. Comment les vidéos ont été fabriquées (conception complète)

> Les vidéos finales (`punch-native/releases/punch-final-{fr,en}.mp4` — FR 98 s / EN 101 s, 1200×2670, 30 fps, h264 + AAC) sont un **montage de rushs téléphone + voix off synthétique**, assemblés image-par-image par scripts Python + ffmpeg. Aucun logiciel de montage classique : tout est rejouable par commande.

### 9.1 Les rushs : d'où viennent les images

- **Tournés sur le Seeker via ADB** (voir §3.3) : `screenrecord` 8 Mbit/s par segment + captures `screencap` PNG aux moments exacts (ticket, say-hi payé, compteurs).
- **Deux banques** : `_shots/demo-v165/` (FR) et `_shots/demo-v169-en/` (EN) — 9 segments `seg-00-connect` → `seg-08-arc` + ~17 PNG par langue, avec `evidence-{fr,en}.md` comme procès-verbal.
- **Deux techniques de montage** selon le plan :
  - *Live* : tranche de rush rejouée telle quelle (`-ss` + `-t`, ex. `seg-01-punch` 8 s, `seg-04-world` 13,49 s) — pour le punch, le globe, les hellos, la sortie réseau.
  - *Freeze* : une photo PNG tenue N secondes en vidéo 30 fps (`-loop 1 -framerate 30 -t dur`, ex. ticket 6–11 s, carte finale ~7–10 s) — pour laisser le temps de lire pendant que la voix parle.
- **Versions intermédiaires** visibles dans `punch-native/_vid/` : `*-V169.mp4` (premiers assemblages), `*-JOURNEY.mp4` (parcours), `*-FIT.mp4` (calés voix), `*-GEMINI.mp4`, `*-NOEMPLOI*.mp4` (version actuelle sans le segment emploi).

### 9.2 La voix : quels outils, quelle voix

- **Aujourd'hui : Gemini TTS, voix « Charon »** (masculine, FR + EN) — script `punch-native/_vid/make-gemini-vo.py`. Clé lue dans `punch-native/_vid/gemini.key` (local, hors git, jamais affichée). API `generativelanguage.googleapis.com/v1beta/models/...:generateContent`, audio PCM 24 kHz → WAV par segment : `hook / punch / board / globe / honesty / close` (6 fichiers dans `gemini-vo-fr/` et `gemini-vo-en/`).
- **Avant : edge-tts** (gratuit, hors-ligne de clé) — `make-condensed-vo.py` : `fr-FR-HenriNeural` / `en-US-AndrewNeural`, 6 phrases + pauses 350 ms (`pause-350ms.mp3`), sorties `vo-condense-{fr,en}.mp3` (FR ~85 s / EN ~91 s). C'est cette voix qui a servi aux démos v1.7.0.
- **Détails soignés** : « 92/3/5 » prononcé en toutes lettres (« quatre-vingt-douze, trois, cinq » / « ninety-two, three, five »), « l'app » → « l'application », « explorer » → « explorateur » en FR pour éviter les fautes de prononciation.
- **Mixage** : chaque WAV est placé à son offset par `adelay`, mixés (`amix`), normalisés broadcast (`loudnorm I=-16:TP=-1.5:LRA=11`), sortie AAC 192k. En cas de dépassement, l'offset recule avec 0,6 s de gap minimum + 0,7 s de marge anti-débordement (jamais de voix coupée).

### 9.3 Le découpage : comment image et voix restent synchrones

Principe d'or : **les frontières vidéo = les offsets audio**. Chaque écran dure exactement jusqu'au début de la phrase suivante :

| Segment voix | FR (offset → durée) | EN (offset → durée) | Images montrées |
|---|---|---|---|
| hook | 5,30 s → 19,65 s | 5,30 s → 19,37 s | titre → ticket + règle 92/3/5 |
| punch | 25,55 s → 22,81 s | 25,27 s → 21,21 s | tap bolt live → ticket tenu |
| globe | 48,96 s → 23,45 s | 47,08 s → 23,41 s | wallet → globe live ×2 |
| honesty | 73,01 s → 14,49 s | 71,09 s → 14,89 s | suppression signée (`seg-08-arc`) + réglages |
| close | 88,10 s → 8,93 s | 86,58 s → 13,97 s | écran final + carte |

(Totaux : FR 98,10 s / 2943 frames, EN 101,67 s / 3050 frames — carte titre ~4–5 s en tête, queue ~1,1 s.)

Le script courant `punch-native/_vid/_gemini-fit-noemploi.py` fait les 3 étapes : `build_video` (concat + `trim` exact au frame + `setpts`), `build_audio` (adelay + amix + loudnorm), `mux` (copie sans réencodage, `+faststart`). Commande : `python _gemini-fit-noemploi.py fr en`. Le segment emploi (board/missions, ~20–24 s) a été retiré vidéo + audio des deux côtés à la demande — d'où les présents 98/101 s au lieu des 122 s précédents.

### 9.4 Chaîne d'outils résumée (à citer au jury)

`Seeker (screenrecord/screencap via ADB)` → `MP4 + PNG dans _shots/` → `ffmpeg (live/freeze/concat, libx264 preset medium CRF 17, yuv420p)` + `Gemini TTS Charon (6 WAV)` → `adelay + amix + loudnorm → AAC 192k` → `mux → punch-final-{fr,en}.mp4 (releases/)` → `git commit + push`, vérifié par `ffprobe` (durée), `count_frames` (2943/3050) et `ls-remote` (distant = local).

---

## 10. Phrases-clés pour l'oral

- « Le téléphone n'a jamais été touché sauf pour signer : tout le reste, c'est un câble USB et des scripts qui voient, touchent, filment et prouvent. »
- « Notre plus gros bug n'était pas dans l'app mais dans notre outil de mesure — et c'est en le durcissant qu'on a rendu nos preuves crédibles. »
- « Chaque point vert du globe, chaque ticket, chaque compteur décrémenté correspond à une vraie transaction devnet vérifiable par le jury ce soir. »

---

## 11. Pour aller plus loin (annexes du repo)

- `punch-native/scripts/device/ui_probe.py` — la sonde (lire en premier)
- `punch-native/scripts/device/demo_v169.py` — le tournage bilingue complet
- `punch-native/scripts/device/tour_punch.py` + `tour2_punch.py` — les tours de contrôle
- `punch-native/scripts/device/shoot_v3.py` + `shoot_plans_v2.py` — l'ancienne génération (9 plans + plans Vault/explorer/sortie)
- `docs/GUIDE-JURY.md` — le protocole que le jury peut rejouer à la main
- `punch-native/_shots/demo-v169-{fr,en}/evidence-{fr,en}.md` — les procès-verbaux de tournage
