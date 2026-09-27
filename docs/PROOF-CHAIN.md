# La chaîne de preuve / The verifiable proof chain

> **EN** — Every device artifact we publish (screenshots, video, APK) follows
> one path, and every link is enforced by CI. Nothing in the chain is
> hand-typed. A judge can re-compute any SHA-256 and match it against public
> pages that CI itself keeps honest.
>
> **FR** — Chaque artefact device publié (captures, vidéo, APK) suit un chemin
> unique, et chaque maillon est surveillé par la CI. Rien n'est tapé à la main.
> Un juge peut recalculer n'importe quel SHA-256 et le comparer aux pages
> publiques que la CI maintient honnêtes.

---

## Le chemin / The path

```
                 ┌──────────────────────────────────────────────┐
                 │  Seeker SM02E4060310629 (appareil physique)  │
                 └───────────────┬──────────────────────────────┘
                                 │  1 commande : scripts/device/vitrine.py
                                 ▼
                 ┌──────────────────────────────────────────────┐
                 │  docs/site/device/MANIFEST.json              │
                 │  version · date · sha256 · octets (+ vidéo)  │
                 └───────┬──────────────┬───────────────────────┘
              2 commits  │              │  3 génère
                         ▼              ▼
   ┌───────────────────────┐   ┌──────────────────────────────┐
   │ docs/site/device/*.png│   │ docs/site/proof.html         │
   │ docs/site/guide-jury  │   │ (zéro chiffre à la main)     │
   │ .html (badges ✓ hash) │   └──────────────┬───────────────┘
   └───────────┬───────────┘                  │ publié
               │ publié                       ▼
               ▼              https://azumizeus.github.io/punch-clockin/
        GitHub Pages                         proof.html · device/MANIFEST.json
               ▲
               │ 4 embarqué                5 vérifie (télécharge l'APK !)
   ┌───────────┴────────────┐   ┌──────────────────────────────┐
   │ GitHub Release (vX.Y.Z)│◄──│ CI : check_release_assets.py │
   │ APK + .apk.sha256 +    │   └──────────────────────────────┘
   │ MANIFEST.json + démo   │
   └────────────────────────┘
```

## Les maillons / The links

| # | Maillon / Link | Quoi / What | Garde-fou / Guard |
|---|---|---|---|
| 1 | **Device → MANIFEST** | `scripts/device/vitrine.py` capture les écrans sur le Seeker, hash les images (PIL + sha256) et écrit `MANIFEST.json` : version, date, empreintes, octets, bloc vidéo de la démo Réseau. Les clés inconnues sont préservées d'un run à l'autre. | — (c'est la source) |
| 2 | **MANIFEST → repo** | Le MANIFEST et les captures sont commités. | `check_device_sync.py` : version = `app.json`, sha256 + octets recalculés, références du guide, **badges `✓ hash` du guide**. |
| 3 | **MANIFEST → page proof** | `make_proof_page.py` **génère** `proof.html` depuis le MANIFEST — aucun chiffre tapé à la main. | `make_proof_page.py --check` : la page dérive → échec. |
| 4 | **Repo → release** | Le workflow Release (push de tag) exige `tag = app.json = MANIFEST` **avant tout build**, puis attache APK signé + `.apk.sha256` + `MANIFEST.json` + vidéo. | `check_release_tag.py --tag` (strict) ; échec avant `npm ci`. |
| 5 | **Release ↔ repo** | La release publiée est re-testée à froid. | `check_release_assets.py` : l'APK est **re-téléchargé** et son sha256 comparé au `.sha256` embarqué ; le MANIFEST embarqué est comparé (JSON sémantique) à celui du repo. |
| 6 | **Release ↔ code, en continu** | Sur chaque push, la dernière release ne doit pas dépasser `app.json`. | `check_release_tag.py` (mode CI) : release plus récente → échec ; plus ancienne → warning (fenêtre bump → tag). |

## Comment vérifier soi-même / How to verify it yourself

```bash
# Les deux captures, publiées sur Pages :
curl -sO https://azumizeus.github.io/punch-clockin/device/home.png
shasum -a 256 home.png          # macOS/Linux   (Windows : certutil -hashfile home.png SHA256)
# -> 7c076aa4... = badge de la galerie + ligne du MANIFEST + table de proof.html

# La vidéo de la démo Réseau (asset de la release v1.6.8) :
curl -sLO https://github.com/Azumizeus/punch-clockin/releases/download/v1.6.8/punch-demo-reseau-v168.mp4
shasum -a 256 punch-demo-reseau-v168.mp4    # -> a907b867... = bloc video du MANIFEST

# L'APK signé (141 Mo) et son compagnon :
curl -sLO https://github.com/Azumizeus/punch-clockin/releases/download/v1.6.8/punch-clockin-seeker-v1.6.8.apk
shasum -a 256 punch-clockin-seeker-v1.6.8.apk
# -> égal au contenu de punch-clockin-seeker-v1.6.8.apk.sha256 (vérifié en CI à chaque push)
```

Pages publiques utiles / Useful public pages :

- Preuve (version, dates, empreintes) : <https://azumizeus.github.io/punch-clockin/proof.html>
- Manifeste brut : <https://azumizeus.github.io/punch-clockin/device/MANIFEST.json>
- Galerie jury (badges ✓) : <https://azumizeus.github.io/punch-clockin/guide-jury.html>
- Release : <https://github.com/Azumizeus/punch-clockin/releases/tag/v1.6.8>

## Pourquoi c'est fort / Why this matters

- **Le téléphone est la source.** Les captures sont prises par adb sur un
  Seeker physique (version affichée à l'écran incluse) — pas de maquette.
- **L'honnêteté est structurelle.** La page proof ne peut pas mentir : elle
  est régénérée depuis le MANIFEST, et la CI échoue si l'un ou l'autre dérive.
- **L'APK ne peut pas être remplacé en silence.** Chaque push re-télécharge la
  release et re-vérifie l'empreinte de l'APK contre son `.sha256`.
- **Le tag ne peut pas mentir.** Un tag `vX.Y.Z` sans bump correspondant ni
  vitrine relancée est refusé **avant** tout build.

**FR — verdict d'un juge en 30 secondes :** recalculez le SHA-256 d'une image
de la galerie (ou de l'APK), comparez-le à la page proof et au MANIFEST brut.
Si ça matche, ce que vous téléchargez est exactement ce que le téléphone a
produit — et la CI en convient à chaque push.

*Schéma et garde-fous à jour du commit `86997fe` (26/09/2026) — voir
`docs/RUNBOOK-BUMP.md` pour la procédure complète de bump de version.*
