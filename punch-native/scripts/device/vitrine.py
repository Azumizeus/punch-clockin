# -*- coding: utf-8 -*-
"""Vitrine PUNCH : captures des ecrans Reglages (version + section Reseau).

But : preuve visuelle pour la soumission — l'app affiche bien la version
courante et la section Reseau (test RPC) est presente. AUCUNE signature Seed
Vault : tout est consultable hors connexion. Reutilise les sondes durcies
(jamais de XML perime) et les helpers de demo_reseau.py.

Usage :
    python scripts/device/vitrine_v168.py           # version auto (app.json)
    python scripts/device/vitrine_v168.py 1.6.9     # version imposee

Sortie : punch-native/_shots/vitrine-<version sans points>/
"""
import json
import os
import re
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_probe import fresh_dump, screenshot, sh, tap  # noqa: E402
from demo_reseau import wake, focus, find_any, goto_settings, reveal_reseau  # noqa: E402

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
APP_JSON = os.path.join(ROOT, "app.json")


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
    return 0


if __name__ == "__main__":
    sys.exit(main())
