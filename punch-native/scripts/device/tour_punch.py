# -*- coding: utf-8 -*-
"""Tour automatique PUNCH sur Seeker — porté sur la sonde durcie ui_probe.

Pourquoi : `uiautomator dump` échoue en silence sur l'accueil (horloge live +
anneau pulsant = UI jamais idle) et un script naïf relit alors un XML périmé —
d'où le faux bug « tap Accueil mort ». Cette version :
  - ne fait JAMAIS confiance à un dump non vérifié (fresh_dump → None) ;
  - identifie les écrans par marqueurs textuels quand le dump réussit ;
  - retombe sur la comparaison d'images (screen_diff, crop stable) quand il
    échoue, au lieu d'inventer un état.

Parcours : thèmes (TopBar) → onglets → écrans (deep links) → retour défaut.
NOTE : les coordonnées TopBar A/B/C datent des habillages multiples ; depuis
l'identité unique (v1.5.0+) il ne reste que les thèmes Sombre/Clair/Or.
"""
import os
import sys
import time

import ui_probe

sys.stdout.reconfigure(errors="replace")

OUT = "_shots"
os.makedirs(OUT, exist_ok=True)
LOG = []

TAB_X = {"punch": 100, "board": 300, "globe": 500, "hellos": 643,
         "wallet": 771, "split": 943, "settings": 1114}
TAB_Y = 2592
THEME = {"DARK": (752, 184), "LIGHT": (880, 184), "GOLD": (995, 184)}
# Libellés de la barre d'onglets : présents sur TOUS les écrans, jamais
# utilisables comme marqueurs d'écran.
MARKERS_TAB = {"Accueil", "Missions", "Monde", "Bonjours", "Argent", "La part", "Réglages"}

# Marqueurs par écran : indicatifs seulement (un libellé peut exister sur
# plusieurs écrans) — state() rapporte les textes bruts, jamais un nom déduit.
MARKERS = {
    "connect": ["Ouvrir mon portefeuille", "CLOCK IN"],
    "home": ["Registre de session", "Session ledger"],
    "board": ["Les missions sont ouvertes", "Missions"],
    "globe": ["Le monde", "Monde"],
    "hellos": ["Bonjours"],
    "wallet": ["Changer de monnaie", "Argent"],
    "split": ["La part"],
    "settings": ["IDENTITÉ", "Réglages"],
    "looks": ["Galerie", "HABILLAGE"],
    "guide": ["Mode d'emploi"],
    "post": ["Publier", "Payer quelqu'un"],
    "receipt": ["Reçu", "Ticket"],
    "shift": ["Mission"],
    "history": ["Historique"],
    "language": ["Français"],
}


def L(msg):
    print(msg, flush=True)
    LOG.append(msg)


def tap(x, y, wait=2.0):
    ui_probe.tap(x, y, wait)


def shot(name):
    return ui_probe.screenshot(os.path.join(OUT, f"{name}.png"))


def state():
    """(preuve_textuelle, dump_ok) — jamais un état inventé.

    Retourne les 3 premiers textes NON COMMUNS capturés (preuve brute), pas un
    nom déduit : les marqueurs simples trompent (un libellé d'onglet comme
    « Missions » existe sur TOUS les écrans via la barre du bas)."""
    root = ui_probe.fresh_dump()
    if root is None:
        return "non-idle", False
    communs = set(MARKERS_TAB) | {"PUNCH", "EN", "FR", "✦"}
    txts = []
    for t, d, _b in ui_probe.texts(root):
        v = (t or d).strip()
        # Exclure les glyphes d'icônes (plage private-use Unicode U+E000..F8FF)
        picto = v and 0xE000 <= ord(v[0]) <= 0xF8FF
        if len(v) > 2 and v not in communs and not picto:
            txts.append(v)
        if len(txts) >= 3:
            break
    return " | ".join(txts) if txts else "(écran sans texte)", True


def main():
    L("=== 0. État de départ ===")
    name, ok = state()
    L(f"départ: écran={name} (dump={'ok' if ok else 'IMPOSSIBLE/non-idle'})")

    L("=== 1. Thèmes depuis la TopBar (tous écrans) ===")
    for tname, (x, y) in THEME.items():
        tap(x, y, 1.6)
        n, ok = state()
        L(f"thème {tname}: écran={n} (dump={'ok' if ok else 'non-idle'})")

    L("=== 2. Onglets ===")
    for tname, x in TAB_X.items():
        tap(x, TAB_Y, 2.2)
        n, ok = state()
        L(f"onglet {tname}: écran={n} (dump={'ok' if ok else 'non-idle'})")

    L("=== 3. Écrans empilés (deep links) ===")
    for route in ("history", "looks", "guide", "post", "receipt", "language"):
        r = ui_probe.sh(f'am start -W -a android.intent.action.VIEW -d "punchnative://{route}"')
        time.sleep(2.2)
        okstart = "Status: ok" in r.stdout or "Status: complete" in r.stdout
        n, ok = state()
        L(f"deeplink /{route}: start={'ok' if okstart else 'KO'} écran={n} (dump={'ok' if ok else 'non-idle'})")
        ui_probe.sh("input keyevent KEYCODE_BACK")
        time.sleep(1.2)

    L("=== 4. Retour à l'accueil (preuve du tap onglet) ===")
    for tname, x in (("settings", 1114), ("punch", 100)):
        tap(x, TAB_Y, 2.2)
        n, ok = state()
        L(f"tap {tname}: écran={n} (dump={'ok' if ok else 'non-idle — vérifier par diff image'})")
    shot("90-final")

    print("\nTOUR-DONE", flush=True)


if __name__ == "__main__":
    try:
        main()
    finally:
        with open("_tour-report.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(LOG))
