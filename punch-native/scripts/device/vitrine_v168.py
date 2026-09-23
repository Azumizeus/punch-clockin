# -*- coding: utf-8 -*-
"""Vitrine v1.6.8 : captures des ecrans Reglages (version + section Reseau).

But : preuve visuelle pour la soumission — l'app affiche bien la version 1.6.8
et la section Reseau (test RPC) est presente. AUCUNE signature Seed Vault :
tout est consultable hors connexion. Reutilise les sondes durcies (jamais de
XML perime) et les helpers de demo_reseau.py.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_probe import fresh_dump, screenshot, sh  # noqa: E402
from demo_reseau import wake, focus, find_any, goto_settings, reveal_reseau  # noqa: E402

SHOTS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                      "..", "..", "_shots", "v168-vitrine"))
os.makedirs(SHOTS, exist_ok=True)


def log(m):
    print(m, flush=True)


def shot(name):
    p = os.path.join(SHOTS, name)
    screenshot(p)
    log("  [shot] %s" % name)


def main():
    wake()
    focus()
    shot("20-accueil.png")

    if not goto_settings():
        log("!! Reglages introuvable")
        shot("30-echec-reglages.png")
        return 1
    log("1. Reglages ouvert")
    time.sleep(1.0)
    shot("30-reglages.png")

    r = fresh_dump()
    if r is not None and find_any(r, ["1.6.8"]):
        log("   version 1.6.8 confirmee dans l'UI")
    else:
        log("   (version non lue dans le dump — la capture reste la preuve)")

    reveal_reseau()
    log("2. Section Reseau visible")
    time.sleep(1.0)
    shot("31-reglages-reseau.png")
    return 0


if __name__ == "__main__":
    sys.exit(main())
