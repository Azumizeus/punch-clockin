# Runbook — bump de version (répétition générale v1.6.9)

> **FR** — La liste exacte des commandes pour passer de v1.6.8 à v1.6.9, et ce
> que chaque garde-fou de la CI vérifie à chaque étape. À suivre dans l'ordre :
> les étapes 3 à 5 exigent que l'APK de la **nouvelle** version soit déjà
> installé sur le Seeker (voir « Les 3 pièges » en bas).
>
> **EN** — The exact command sequence to go from v1.6.8 to v1.6.9, and what
> each CI guard verifies at every step. Follow in order: steps 3–5 require the
> **new** APK to be already installed on the Seeker (see « The 3 traps » below).

---

## 0. Ce qui va vérifier chaque garde-fou / What each guard verifies

| Garde-fou (CI) | Script | Vérifie / Verifies | Échoue quand / Fails when |
|---|---|---|---|
| Device gallery sync | `tools/check_device_sync.py` | MANIFEST version = app.json, sha256 + octets de chaque image, refs et **badges `✓` du guide** | bump poussé sans relancer la vitrine |
| Proof page sync | `tools/make_proof_page.py --check` | `proof.html` régénérée depuis le MANIFEST (zéro chiffre à la main) | la page dérive du manifeste |
| Release tag sync | `tools/check_release_tag.py` | la release publiée n'est **jamais plus récente** que app.json (plus ancienne = warning) | release en avance sur le code |
| Release assets check | `tools/check_release_assets.py` | APK re-téléchargé = son `.sha256` ; MANIFEST embarqué = celui du repo (JSON sémantique) | asset remplacé, régénéré sans son compagnon, ou trace divergente |
| Release tag sync (workflow Release) | idem mode `--tag` | **avant tout build** : tag = app.json = MANIFEST | tag poussé sans bump ou sans vitrine |

## 1. Le bump (sur le poste de dev)

```bash
# app.json : "version": "1.6.8" -> "1.6.9" (versionCode 22 -> 23)
git checkout -b bump-1.6.9   # ou directement sur master selon l'habitude
```

Éditer `punch-native/app.json` :

```json
"version": "1.6.9",
```

et `versionCode` +1 (23). **Ne pas commit encore.**

## 2. Installer la v1.6.9 sur le Seeker (AVANT la vitrine)

Construire l'APK bumpé et l'installer sur le téléphone (le workflow Release ne
peut pas servir ici : il exige le tag, qui exige justement la vitrine — c'est le
piège n° 1) :

```bash
cd punch-native
npx expo prebuild -p android --no-install
cd android && ./gradlew assembleRelease --no-daemon && cd ..
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell dumpsys package com.anonymous.punchnative | grep versionName   # -> 1.6.9
```

## 3. La vitrine (captures v1.6.9 + MANIFEST)

```bash
python scripts/device/vitrine.py          # auto : lit app.json -> 1.6.9
```

Vérifications à l'écran du script : `version 1.6.9 confirmee dans l'UI`, ligne
`Version 1.6.9` visible. Il régénère `docs/site/device/home.png`,
`settings.png` et `MANIFEST.json` (version 1.6.9, nouveaux sha256), en
**préservant** la clé `video` du MANIFEST (block démo Réseau v1.6.8). Les
badges du guide (`✓ 7c076aa4` / `✓ 477db2c8`) ne sont plus valables :
**mettre à jour les 4 badges** dans `docs/site/guide-jury.html` avec les 8
premiers caractères des nouveaux sha256 (copiés depuis le MANIFEST fraîchement
généré). Puis :

```bash
python tools/make_proof_page.py           # régénère proof.html depuis le MANIFEST
```

## 4. Commit + push (les gardes deviennent verts de nouveau)

```bash
git add punch-native/app.json docs/site/device/ docs/site/proof.html docs/site/guide-jury.html
git commit -m "Bump v1.6.9 : app.json + versionCode, vitrine Seeker (captures + MANIFEST), page proof et badges regeneres"
git push
```

La CI sur ce push vérifie : device-sync (MANIFEST 1.6.9 = app.json, images,
badges), proof-page-sync, release-tag-sync (release v1.6.8 **plus ancienne**
que app.json 1.6.9 → simple `::warning`, **pas** d'échec), release-assets-check
(APK v1.6.8 intact sur sa release, MANIFEST embarqué = repo → vert).

## 5. Le tag (la release se fait toute seule)

```bash
git tag v1.6.9
git push origin v1.6.9
```

Le workflow **Release** enchaîne, dans l'ordre :

1. `check_release_tag.py --tag v1.6.9` — **avant tout build** : tag = app.json
   = MANIFEST (sinon échec immédiat, rien n'est construit) ;
2. secret trésor obligatoire (sinon échec explicite) ;
3. prebuild + `gradlew assembleRelease` (APK signé arm64) ;
4. renommage `punch-clockin-seeker-v1.6.9.apk` + `sha256sum > .apk.sha256` ;
5. purge des anciens assets puis création de la release avec **APK + `.sha256`
   + MANIFEST.json (du repo, donc à jour 1.6.9) + démo mp4/srt**.

## 6. Vérifier la release (tout doit être déjà vert)

```bash
GITHUB_TOKEN=... python tools/check_release_assets.py   # APK = .sha256, MANIFEST = repo
GITHUB_TOKEN=... python tools/check_release_tag.py      # release v1.6.9 = app.json 1.6.9
```

Puis : `proof.html` reste synchro (le MANIFEST du repo n'a pas changé depuis
l'étape 4) ; la vidéo de démo de la release est l'ancienne (v1.6.8) tant qu'une
nouvelle démo n'est pas tournée — cf. `demo_reseau.py` si on veut la rafraîchir
et ré-uploader l'asset + la clé `video` du MANIFEST.

## Les 3 pièges / The 3 traps

1. **L'ordre vitrine/APK.** La vitrine photographie l'app **installée**. Si on
   la lance avant d'avoir installé le build 1.6.9, elle produirait des
   captures « Version 1.6.8 » avec un MANIFEST clamant 1.6.9 — le device-sync
   ne le détecterait pas (il compare MANIFEST ↔ app.json, pas ↔ l'écran).
   D'où l'ordre : **installer l'APK 1.6.9 d'abord** (étape 2), vitrine ensuite.
2. **La fenêtre de CI jaune.** Entre le push du bump (étape 4) et le tag
   (étape 5), la release v1.6.8 est « plus ancienne » que app.json : la CI est
   **verte avec un warning**, pas rouge — c'est voulu (sinon tout push de bump
   rougirait la CI pendant des heures).
3. **Le MANIFEST embarqué.** `check_release_assets.py` compare le MANIFEST de
   la release à celui du repo en **JSON sémantique** (insensible CRLF/LF,
   strict sur le contenu). Comme la release est désormais construite **depuis
   le repo** (étape 5), toute divergence est structurellement impossible — le
   garde-fou ne sert plus qu'à le prouver au jury.

---

*Runbook vérifié en revue le 26/09/2026 ; les garde-fous listés sont ceux de
`.github/workflows/ci.yml` (7 étapes) et `.github/workflows/release.yml`.*
