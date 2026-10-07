# Checklist finale — soumission CLOCK IN

> **Échéance : jeudi 9 octobre 2026, 08:59 (UTC+2)** · Objectif interne : soumettre le 7 au soir / le 8 au matin (marge pour corriger une erreur de formulaire).
> Référence complète : [docs/SOUMISSION.md](SOUMISSION.md) · Formulaire : <https://solanamobile.radiant.nexus/>

## 1. Relecture de SOUMISSION.md faite le 28/09 — tout est vert

- ✅ **Tous les liens testés HTTP 200** : repo, CI verte (`bc37065`), release v1.6.8 **publiée** (draft = false, 6 assets), proof.html, guide-jury.html, device/MANIFEST.json (identique entre Pages et release).
- ✅ **Cohérence totale de la chaîne** : tag v1.6.8 = app.json = MANIFEST = proof.html = deck = captures. Les garde-fous CI revérifient tout ça à chaque push : rien à refaire.
- ✅ **Trésor devnet financé** et visible sur l'explorer.
- 🔧 Coquille corrigée au passage : tableau §2, la vidéo démo est dans la release **v1.6.8** (pas v1.6.7, qui n'a plus de release en ligne).
- ℹ️ `<lien-youtube>` et `<PDF joint ou lien>` dans §5 sont des espaces réservés **volontaires** pour les actions A1/A2 ci-dessous.

## 2. Les 2 seules actions manuelles (≈ 15–20 min)

- [ ] **A1 — Vidéo → YouTube.** Prendre `punch-clockin-demo.mp4` (asset de la [release v1.6.8](https://github.com/Azumizeus/punch-clockin/releases/tag/v1.6.8) — 2 min 43, voix off EN + sous-titres incrustés), l'uploader sur YouTube en visibilité **Publique ou Répertorié**, et **conserver le lien** pour le champ du formulaire.
- [ ] **A2 — Deck.** [docs/punch-clockin-deck.pdf](punch-clockin-deck.pdf) (12 slides EN, diapo proof chain incluse) : soit **joindre le fichier** directement dans le formulaire, soit utiliser le lien GitHub déjà écrit dans §5 SOUMISSION.md.

## 3. Le formulaire te seul(e) — compte + copier-coller (cf. §5 de SOUMISSION.md)

- [ ] **B1.** Créer le compte / se connecter sur <https://solanamobile.radiant.nexus/>.
- [ ] **B2.** Coller les blocs prêts de §5 : *Project name* · *One-liner* · *Description (EN)* · *Device gallery (EN)* · *Verifiable proof chain (EN)* · *Argumentaire prix SKR* (si un champ dédié existe).
- [ ] **B3.** Remplir les liens courts :

  ```
  GitHub repo (source + judge guide): https://github.com/Azumizeus/punch-clockin
  Signed APK (arm64): https://github.com/Azumizeus/punch-clockin/releases/latest
  Demo video: <ton lien YouTube — remplir après A1>
  Devnet treasury on explorer: https://explorer.solana.com/address/FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn?cluster=devnet
  Judge guide: https://github.com/Azumizeus/punch-clockin/blob/master/docs/GUIDE-JURY.md
  Proof (SHA-256 of captures & video): https://azumizeus.github.io/punch-clockin/proof.html
  Pitch deck: <PDF joint, ou https://github.com/Azumizeus/punch-clockin/blob/master/docs/punch-clockin-deck.pdf>
  ```

- [ ] **B4.** Relecture avant « Submit » : aucun `<lien-youtube>` restant, chaque lien ouvert au moins une fois, champs EN sans reste de FR, galerie = les 2 PNG si le champ attend des fichiers.

## 4. Rien à refaire côté repo (argué par la CI, pas par nous)

| Élément | État vérifié (28/09) |
|---|---|
| CI | verte sur `master` @ `bc37065` (les 7 étapes) |
| Release | v1.6.8 publiée, 6 assets, APK vérifié par `check_release_assets.py` |
| Pages | galerie device + MANIFEST + proof.html + guide-jury (badges ✓) en ligne |
| Trésor | devnet financé, explorer en ligne |

> **v1.6.9 en cours localement** (bump + build + install Seeker, sans tag ni push) : n'a **aucun effet** sur la CI, la release v1.6.8 ou la soumission. Soumettre avec le repo à v1.6.8 est déjà complet ; si tu veux aussi pousser la v1.6.9 dans les temps, le runbook [docs/RUNBOOK-BUMP.md](RUNBOOK-BUMP.md) prend ~1 h (vitrine + 4 badges + commit/push + tag).

## 5. Après le Submit

- [ ] Noter dans §SOUMISSION.md la **date de soumission + le lien de confirmation** (page de statut Radiants).
- [ ] Youtube : activer si besoin le title/thumbnail la veille du 11 nov (annonce des résultats).
