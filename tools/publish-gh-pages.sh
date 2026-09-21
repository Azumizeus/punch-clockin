#!/bin/sh
# Publie docs/site/ sur la branche gh-pages (orphan) — le site vit a la racine.
# Le commit est pousse automatiquement (publication demandee explicitement).
set -e
cd "$(git rev-parse --show-toplevel)"
rm -rf .gh-pages-tmp 2>/dev/null || true
mkdir -p .gh-pages-tmp
cp docs/site/index.html docs/site/guide-jury.html .gh-pages-tmp/
# Les pages de livraison monolithiques (autonomes) en bonus :
cp docs/LIVRAISON.html .gh-pages-tmp/livraison.html
cp docs/qr-delivery.svg .gh-pages-tmp/qr-delivery.svg
cd .gh-pages-tmp
git init -q -b gh-pages .
git add -A
git -c user.name="PUNCH publisher" -c user.email="noreply@punch.local" \
  commit -qm "GitHub Pages : accueil PUNCH + guide jury + page de livraison"
git remote add origin "$(git -C .. remote get-url origin)"
git push -q -f origin gh-pages
cd ..
rm -rf .gh-pages-tmp
echo "gh-pages publiee."
