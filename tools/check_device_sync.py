# -*- coding: utf-8 -*-
"""Garde-fou CI : docs/site/device/ doit refleter la version courante.

Verifie que :
  1. MANIFEST.json existe et porte la version de punch-native/app.json ;
  2. chaque image declaree existe avec le sha256 et le poids annonces ;
  3. les deux pages Pages referencees (guide-jury) pointent bien ces images.

Si un bump de version a ete fait sans relancer scripts/device/vitrine.py,
le check echoue avec la commande exacte a relancer.

Usage : python tools/check_device_sync.py   (0 = a jour, 1 = desync)
"""
import hashlib
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_JSON = os.path.join(ROOT, "punch-native", "app.json")
DEVICE = os.path.join(ROOT, "docs", "site", "device")


def fail(msg, *hints):
    print("!! " + msg)
    for h in hints:
        print("   " + h)
    sys.exit(1)


def main():
    # 1. Version courante (app.json)
    with open(APP_JSON, encoding="utf-8") as fh:
        m = re.search(r'"version"\s*:\s*"([\d.]+)"', fh.read())
    if not m:
        fail("version introuvable dans punch-native/app.json")
    version = m.group(1)

    # 2. MANIFEST present et a la bonne version
    mpath = os.path.join(DEVICE, "MANIFEST.json")
    if not os.path.exists(mpath):
        fail("docs/site/device/MANIFEST.json introuvable",
             "Sur un poste avec le Seeker branche, lance :",
             "  cd punch-native && python scripts/device/vitrine.py")
    with open(mpath, encoding="utf-8") as fh:
        manifest = json.load(fh)
    if manifest.get("version") != version:
        fail("MANIFEST.json porte la version %s mais app.json est en %s" % (manifest.get("version"), version),
             "Le vitrine n'a pas ete relancee apres le bump. Sur le poste avec le Seeker :",
             "  cd punch-native && python scripts/device/vitrine.py",
             "Puis committe docs/site/device/ avec le bump.")

    # 3. Chaque image declaree existe avec le bon sha256
    shots = manifest.get("shots") or {}
    if not shots:
        fail("MANIFEST.json ne declare aucune image")
    for name, meta in sorted(shots.items()):
        p = os.path.join(DEVICE, name)
        if not os.path.exists(p):
            fail("image declaree manquante : docs/site/device/%s" % name)
        data = open(p, "rb").read()
        digest = hashlib.sha256(data).hexdigest()
        if digest != meta.get("sha256"):
            fail("sha256 desync pour docs/site/device/%s" % name,
                 "MANIFEST: %s..." % meta.get("sha256", "?")[:12],
                 "disque  : %s..." % digest[:12])
        if meta.get("bytes") != len(data):
            fail("taille desync pour docs/site/device/%s" % name)

    # 4. Le guide jury reference bien ces images
    gpath = os.path.join(ROOT, "docs", "site", "guide-jury.html")
    with open(gpath, encoding="utf-8") as fh:
        guide = fh.read()
    refs = set(re.findall(r'src="device/([^"]+)"', guide))
    missing_refs = refs - set(shots)
    if missing_refs:
        fail("guide-jury.html reference des images absentes du MANIFEST : %s" % ", ".join(sorted(missing_refs)))

    print("OK : device sync v%s — %d image(s) verifiee(s) (%s)" % (version, len(shots), ", ".join(sorted(shots))))


if __name__ == "__main__":
    main()
