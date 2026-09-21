# -*- coding: utf-8 -*-
"""Sonde UI fiable pour le controle PUNCH sur appareil (adb).

Pourquoi cet outil existe : `uiautomator dump` ECHOUE EN SILENCE sur un ecran
dont l'UI n'est jamais idle — typiquement l'accueil PUNCH (horloge live 1 Hz +
anneau pulsant du cadran). Le message "ERROR: could not get idle state" arrive,
et si le script ne verifie pas, il relit le XML PERIME de l'ecran precedent :
on croit tester un ecran, on en teste un autre. C'est ainsi qu'un faux bug
"le tap sur l'onglet Accueil ne fait rien" a failli etre corrige a tort.

Regle de cet outil : un dump sans verification explicite est un bug. En cas
d'echec, `fresh_dump()` renvoie None — jamais un vieil etat. `screen_diff()`
comparer des captures PNG quand le dump est impossible (UI non idle), avec
une fenetre Option pour ignorer les zones animees (horloge).
"""
import os
import subprocess
import time
import xml.etree.ElementTree as ET

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")

# Zone stable de l'accueil : tout sauf l'horloge live (hauteur des tags) et
# l'anneau du cadran. Ajuster si la composition change.
STABLE_BOX = (0, 0, 1200, 2400)


def sh(cmd, timeout=40):
    return subprocess.run([ADB, "shell", cmd], timeout=timeout, capture_output=True, text=True, errors="replace")


def tap(x, y, wait=2.0):
    sh(f"input tap {x} {y}")
    time.sleep(wait)


def screenshot(path):
    r = subprocess.run([ADB, "exec-out", "screencap", "-p"], capture_output=True, timeout=30)
    with open(path, "wb") as f:
        f.write(r.stdout)
    return path


def fresh_dump(local="ui_probe.xml", tries=2):
    """Dump UI avec verification explicite. None si echec — jamais de vieux XML."""
    for _ in range(tries):
        out = sh("uiautomator dump /sdcard/ui_probe.xml").stdout.lower()
        if "dumped" in out:
            p = subprocess.run([ADB, "pull", "/sdcard/ui_probe.xml", local], capture_output=True, timeout=30)
            if p.returncode == 0:
                try:
                    return ET.parse(local).getroot()
                except ET.ParseError:
                    pass
        time.sleep(1.2)
    return None


def texts(root):
    if root is None:
        return []
    return [(n.get("text") or "", n.get("content-desc") or "", n.get("bounds") or "") for n in root.iter("node")]


def find_text(root, needle):
    """Centre du premier noeud contenant `needle` (texte ou desc). None si absent."""
    n = needle.lower()
    for t, d, b in texts(root):
        if n in t.lower() or n in d.lower():
            if not b:
                continue
            b = b.strip("[]").split("][")
            x0, y0 = [int(v) for v in b[0].split(",")]
            x1, y1 = [int(v) for v in b[1].split(",")]
            return (x0 + x1) // 2, (y0 + y1) // 2, (t or d)
    return None


def gray(path, box=None):
    from PIL import Image
    im = Image.open(path).convert("L")
    if box:
        im = im.crop(box)
    return list(im.resize((120, 267)).getdata())


def screen_diff(a, b, box=None):
    """Score de difference (0 = identique). Sur captures PNG, fiable meme UI non idle."""
    da, db = gray(a, box), gray(b, box)
    return sum(abs(x - y) for x, y in zip(da, db)) / len(da)


def identify(root, markers):
    """Identifie l'ecran par marqueurs textuels. ('?', None) si aucun."""
    for name, needles in markers.items():
        for nd in needles:
            if find_text(root, nd):
                return name, nd
    return "?", None
