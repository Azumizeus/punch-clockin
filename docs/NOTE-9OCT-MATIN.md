# ☀️ Bonjour ! (9 oct, note de Buffy) — LIRE EN PREMIER

## La grosse nouvelle : ON A 4 JOURS DE PLUS 🎉
La date officielle a été **repoussée** : soumissions dues le **lundi 13 octobre 2026, 01:59 (UTC+2)**
(vérifié sur ta capture du portail Radiants cette nuit). Résultats toujours le **11 novembre**.
Objectif interne : soumettre le **10 octobre**. Docs déjà mises à jour partout (SOUMISSION, CHECKLIST, PLAN-MAINNET, pages site).

## Ce qui est fait cette nuit (tout poussé sur GitHub, master)
- **Nom officiel : « PUNCH : Clock'in »** appliqué partout (app.json, label Android, dApp Store, README, soumission, cartes vidéo v1.7.0).
- Dossier rangé (logs/probes → _archives/), config eslint + prompts habillage commités.
- Commits : 88cd6c3 (nom), 9297ba9 (dates), 05423cb (checklist restaurée).
- CI master : **tout est vert sauf « Device gallery sync »** (voir ci-dessous). Le Release v1.7.0 attend la même chose.

## Ce qu'il reste à faire CE MATIN (dans l'ordre)
1. **Écoute la voix FR corrigée** : `punch-native/releases/punch-clockin-demo-fr.mp4`
   (« l'application », « explorateur », « Siiker », chiffres dictés 92-3-5). Si OK → c'est la version finale.
2. **Vitrine pour débloquer le CI/Release** (5 min, Seeker branché) :
   - Ouvre l'app PUNCH sur le Seeker → si écran connexion, tape « Open my wallet » et **signe avec le Seed Vault**.
   - Puis je lance : `cd punch-native && PYTHONIOENCODING=utf-8 python -u scripts/device/vitrine.py`
   - Ensuite : commit MANIFEST 1.7.0 → re-push du tag v1.7.0 → CI + Release verts.
3. **Soumission sur le portail** (toi seul : https://solanamobile.radiant.nexus/) — tout est prêt dans [docs/SOUMISSION.md](SOUMISSION.md).
4. Demain : YouTube (métadonnées prêtes dans [docs/YOUTUBE-METADATA.md](YOUTUBE-METADATA.md)), Twitter Seeker Nexus, landing page.

## Réponses à tes questions (en détail dans la conversation)
- **Rangs Silver/Gold/Guardian** : oui ils se débloquent vraiment. Les transactions (punch/paiements/stake) sont 100 % réelles on-chain signées Seed Vault ; seule la *comptabilité des rangs* est tenue côté app pour l'instant (documenté honnêtement dans ROADMAP.md / AEGIS-7.md — programme Anchor dédié en Phase 1 post-hackathon). Rien de fake.
- **2 branches GitHub** : `master` (code) + `gh-pages` (site statique proof/guide) — normal.
- **Mainnet** : acté, on le fait quand on a les résultats (11 nov) — plan §6 écrit (30-50 $ sans sponsor).
