# -*- coding: utf-8 -*-
"""Vitrine PUNCH : captures des ecrans Reglages (version + section Reseau).

But : preuve visuelle pour la soumission — l'app affiche bien la version
courante et la section Reseau (test RPC) est presente. AUCUNE signature Seed
Vault : tout est consultable hors connexion. Reutilise les sondes durcies
(jamais de XML perime) et les helpers de demo_reseau.py.

Usage :
    python scripts/device/vitrine.py           # version auto (app.json)
    python scripts/device/vitrine.py 1.6.9     # version imposee

Sortie :
    punch-native/_shots/vitrine-<vXXX>/        # rushes pleine resolution
    docs/site/device/                          # images allegées pour Pages
    docs/site/device/MANIFEST.json             # version + sha256 + date

Le dossier docs/site/device/ alimente la galerie du guide jury, la page proof et
le check CI (tools/check_device_sync.py) : apres un bump de version, relancer ce
script pour qu'il redevienne a jour.

Les cles de premier niveau inconnues du MANIFEST (ex. "video", ajoutee a la main
pour tracer la demo Reseau) sont PRESERVEES d'un run a l'autre.
"""
import hashlib
import json
import os
import re
import sys
import time

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_probe import fresh_dump, screenshot, sh, tap  # noqa: E402
from demo_reseau import wake, focus, find_any, goto_settings, reveal_reseau  # noqa: E402

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
REPO = os.path.dirname(ROOT)
APP_JSON = os.path.join(ROOT, "app.json")
SITE_DEVICE = os.path.join(REPO, "docs", "site", "device")

# Captures exportees vers docs/site/device/ : nom local -> nom web generique.
# Note : la page Reglages tient dans un seul ecran — une seule capture
# "settings" suffit (haut de page + section Reseau + Version + Quitter).
EXPORT = {
    "01-accueil.png": "home.png",
    "30-reglages-version.png": "settings.png",
}


def detect_version():
    """Lit la version dans app.json (source de verite du bump)."""
    with open(APP_JSON, encoding="utf-8") as fh:
        m = re.search(r'"version"\s*:\s*"([\d.]+)"', fh.read())
    return m.group(1) if m else "inconnue"


def main():
    wanted = sys.argv[1] if len(sys.argv) > 1 else None
    version = wanted or detect_version()
    tag = version.replace(".", "")

    SHOTS = os.path.join(ROOT, "_shots", "vitrine-" + tag)
    os.makedirs(SHOTS, exist_ok=True)

    def shot(name):
        p = os.path.join(SHOTS, name)
        screenshot(p)
        print("  [shot] %s" % os.path.relpath(p, ROOT), flush=True)

    detected = detect_version()
    if wanted and wanted != detected:
        print("!! version demandee %s != app.json %s — capture demandee quand meme" % (wanted, detected))
    print("Vitrine pour la version %s (app.json : %s)" % (version, detected), flush=True)

    wake()
    focus()
    tap(112, 2612, wait=2.0)  # onglet Accueil : etat deterministe meme si l'app etait ailleurs
    shot("01-accueil.png")

    if not goto_settings():
        print("!! Reglages introuvable")
        shot("02-echec-reglages.png")
        return 1
    print("1. Reglages ouvert", flush=True)
    time.sleep(1.0)
    shot("10-reglages-haut.png")

    r = fresh_dump()
    if r is not None and find_any(r, [version]):
        print("   version %s confirmee dans l'UI" % version, flush=True)
    else:
        print("   (version %s non lue dans le dump — la capture reste la preuve)" % version, flush=True)

    reveal_reseau()
    print("2. Section Reseau visible", flush=True)
    time.sleep(1.0)
    shot("20-reglages-reseau.png")

    # Preuve Version : on amene la ligne a l'ecran, on VERIFIE par le dump
    # (seul critere fiable — les captures contiennent l'horloge live, toute
    # comparaison d'octets est faussée), puis on photographie.
    ok = version_on_screen(version)
    for attempt in range(4):
        if ok:
            break
        root = fresh_dump()
        bounds = None
        if root is not None:
            for node in root.iter("node"):
                if (node.get("text") or "").strip().lower() == "version":
                    bounds = node.get("bounds")
                    break
        if bounds:
            m = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", bounds)
            x = (int(m.group(1)) + int(m.group(3))) // 2
            y = (int(m.group(2)) + int(m.group(4))) // 2
            sh("input swipe %d %d %d 1100 1200" % (x, y, x))  # tire la liste vers le haut depuis la ligne
        else:
            sh("input swipe 161 1825 161 1100 1200")  # repli : marge gauche
        time.sleep(2)
        ok = version_on_screen(version)
        if not ok:
            print("   (tentative %d : ligne Version pas a l'ecran — nouvel essai)" % (attempt + 1), flush=True)
    if ok:
        print("   ligne Version %s visible a l'ecran" % version, flush=True)
    else:
        print("!! ligne Version jamais confirmee au dump — capture prise quand meme", flush=True)
    shot("30-reglages-version.png")

    export(version, SHOTS)
    return 0


def version_on_screen(version):
    """Vrai si la ligne 'Version' et le numero sont visibles dans le dump."""
    root = fresh_dump()
    if root is None:
        return False
    seen_label = seen_num = False
    for node in root.iter("node"):
        t = (node.get("text") or "").strip()
        if t.lower() == "version":
            seen_label = True
        if t == version:
            seen_num = True
    return seen_label and seen_num


def export(version, SHOTS):
    """Copie allegée vers docs/site/device/ + MANIFEST.json (version + sha256)."""
    os.makedirs(SITE_DEVICE, exist_ok=True)
    out = os.path.join(SITE_DEVICE, "MANIFEST.json")
    manifest = {"version": version, "generated": time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime()), "shots": {}}
    # Les cles extra (ex. "video" : trace de la demo Reseau) survivent au run.
    if os.path.exists(out):
        try:
            with open(out, encoding="utf-8") as fh:
                old = json.load(fh)
            for k, v in old.items():
                if k not in manifest:
                    manifest[k] = v
        except (OSError, ValueError):
            pass  # MANIFEST illisible : on repart d'un manifeste propre
    for src_name, web_name in EXPORT.items():
        src = os.path.join(SHOTS, src_name)
        if not os.path.exists(src):
            print("!! export : %s manquant" % src_name, flush=True)
            continue
        img = Image.open(src).convert("RGB")
        img.thumbnail((560, 1247))
        dst = os.path.join(SITE_DEVICE, web_name)
        img.save(dst, optimize=True)
        digest = hashlib.sha256(open(dst, "rb").read()).hexdigest()
        manifest["shots"][web_name] = {"sha256": digest, "bytes": os.path.getsize(dst)}
        print("  [export] docs/site/device/%s (%d o, sha256 %s...)" % (web_name, os.path.getsize(dst), digest[:8]), flush=True)
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, sort_keys=True)
        fh.write("\n")
    print("  [export] docs/site/device/MANIFEST.json (version %s)" % version, flush=True)


if __name__ == "__main__":
    sys.exit(main())
