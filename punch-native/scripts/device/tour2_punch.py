# -*- coding: utf-8 -*-
"""Tour 2 — porté sur la sonde durcie ui_probe.

Avant : dumps uiautomator non vérifiés (états périmés possibles sur l'accueil
non-idle) + parcours habillages A/B/C révolus. Maintenant : mesure d'écran
fiable (dump vérifié, sinon diff image cropée sur zone stable), et parcours
adapté à l'identité unique : thèmes Sombre / Clair / Or + 7 onglets, avec
vérification de CHANGEMENT d'écran (diff > seuil) plutôt qu'une moyenne RGB.
"""
import os
import sys
import time

import ui_probe

sys.stdout.reconfigure(errors="replace")

OUT = "_shots"
os.makedirs(OUT, exist_ok=True)

THEME = {"DARK": (752, 184), "LIGHT": (880, 184), "GOLD": (995, 184)}
TABS = [("punch", 100), ("board", 300), ("globe", 500), ("hellos", 643),
        ("wallet", 771), ("split", 943), ("settings", 1114)]
TAB_Y = 2592
STABLE = (0, 0, 1200, 2400)  # hors barre d'onglets et zone horloge


def shot(name):
    return ui_probe.screenshot(os.path.join(OUT, f"{name}.png"))


def changed(a, b):
    return ui_probe.screen_diff(a, b, STABLE) > 2.0


def tap_checked(name, x, y, wait=2.0):
    """Tap avec preuve de changement par diff image (fiable même non-idle)."""
    before = shot(f"chk-{name}-before")
    ui_probe.tap(x, y, wait)
    after = shot(f"chk-{name}-after")
    d = ui_probe.screen_diff(before, after, STABLE)
    print(f"tap {name}: diff={d:.2f} -> {'CHANGEMENT' if changed(before, after) else 'stable (attendu si déjà sur l écran)'}", flush=True)
    return d


def main():
    print("=== TOUR 2 (sonde durcie) ===", flush=True)

    print("--- thèmes ---", flush=True)
    for name, (x, y) in THEME.items():
        tap_checked(f"theme-{name}", x, y, 2.0)
        shot(f"30-theme-{name}")

    print("--- onglets (chaque tap doit changer l'écran) ---", flush=True)
    for name, x in TABS:
        d = tap_checked(f"tab-{name}", x, TAB_Y, 2.2)
        shot(f"40-tab-{name}")
        if name != "punch" and d < 2.0:
            print(f"  !! onglet {name}: écran inchangé — à investiguer", flush=True)

    print("--- retour accueil + état défaut ---", flush=True)
    tap_checked("retour-accueil", 100, TAB_Y, 2.2)
    tap_checked("theme-dark", *THEME["DARK"], 1.6)
    shot("99-final")
    print("TOUR2-DONE", flush=True)


if __name__ == "__main__":
    main()
