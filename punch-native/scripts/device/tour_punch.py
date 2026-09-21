"""Tour automatique PUNCH sur Seeker (adb) — habillages, thèmes, écrans.

Hypothèses de coordonnées (Seeker 1200x2670 px, densité 2.55x, ~470x1047 dp) :
- TopBar : boutons A B C puis Sombre Clair Or(FR intouché) à y≈184 px.
- Barre d'onglets : 6 onglets répartis sur 1200 px, y≈2612 px.
Chaque action produit une capture dans _shots/ + vérification par diff.
"""
import os
import subprocess
import sys
import time
from PIL import Image

sys.stdout.reconfigure(errors="replace")  # console Windows cp1252 : ne jamais crasher sur ✦/é

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
OUT = "_shots"
os.makedirs(OUT, exist_ok=True)

LOG = []


def L(msg):
    print(msg, flush=True)
    LOG.append(msg)


def adb(*args, timeout=40):
    return subprocess.run([ADB, *args], timeout=timeout, capture_output=True)


def shell(cmd, timeout=40):
    return adb("shell", cmd, timeout=timeout)


def shot(name):
    r = adb("exec-out", "screencap", "-p")
    path = os.path.join(OUT, f"{name}.png")
    with open(path, "wb") as f:
        f.write(r.stdout)
    return path


def tap(x, y, wait=1.8):
    shell(f"input tap {x} {y}")
    time.sleep(wait)


def stats(path):
    im = Image.open(path).convert("RGB").resize((60, 133))
    px = list(im.getdata())
    n = len(px)
    return tuple(sum(p[i] for p in px) // n for i in range(3))


def diff(a, b):
    ia = Image.open(a).convert("L").resize((80, 178))
    ib = Image.open(b).convert("L").resize((80, 178))
    da, db = list(ia.getdata()), list(ib.getdata())
    return sum(abs(x - y) for x, y in zip(da, db)) / len(da)


# --- coordonnées -----------------------------------------------------------
TOP = {"A": (445, 184), "B": (543, 184), "C": (640, 184),
       "DARK": (752, 184), "LIGHT": (880, 184), "GOLD": (995, 184)}
TABS = {"punch": 100, "board": 300, "globe": 500,
        "wallet": 700, "split": 900, "settings": 1100}
TY = 2612


def deeplink(route):
    r = shell(f'am start -W -a android.intent.action.VIEW -d "punchnative://{route}"', timeout=25)
    time.sleep(2.2)
    ok = b"Status: ok" in r.stdout or b"Status: complete" in r.stdout
    return ok, r.stdout.decode(errors="replace")[:120].replace("\n", " | ")


def main():
    L("=== 0. État de départ ===")
    p0 = shot("00-start")
    L(f"capture départ: moyenne RGB={stats(p0)}")

    L("=== 1. Habillages A / B / C (onglet PUNCH, thème sombre) ===")
    tap(*TOP["A"], wait=2.0)
    pa = shot("01-look-A")
    L(f"look A: moyenne={stats(pa)}")
    tap(*TOP["B"], wait=2.0)
    pb = shot("02-look-B")
    L(f"look B: moyenne={stats(pb)}  diff vs A={diff(pa, pb):.1f}")
    tap(*TOP["C"], wait=2.0)
    pc = shot("03-look-C")
    L(f"look C: moyenne={stats(pc)}  diff vs B={diff(pb, pc):.1f}")

    L("=== 2. Thèmes (look A) ===")
    tap(*TOP["A"], wait=1.6)
    tap(*TOP["GOLD"], wait=2.0)
    pg = shot("04-theme-gold")
    L(f"or ✦: moyenne={stats(pg)}  diff vs C={diff(pc, pg):.1f}")
    tap(*TOP["GOLD"], wait=2.0)  # ✦ -> ✧ (or clair)
    pgl = shot("05-theme-goldLight")
    L(f"or clair ✧: moyenne={stats(pgl)}  diff vs or={diff(pg, pgl):.1f}")
    tap(*TOP["LIGHT"], wait=2.0)
    pl = shot("06-theme-light")
    L(f"clair: moyenne={stats(pl)}  diff vs orClair={diff(pgl, pl):.1f}")
    tap(*TOP["DARK"], wait=2.0)
    pd = shot("07-theme-dark")
    L(f"sombre: moyenne={stats(pd)}  diff vs clair={diff(pl, pd):.1f}")

    L("=== 3. Onglets ===")
    for name, x in TABS.items():
        tap(x, TY, wait=2.0)
        p = shot(f"10-tab-{name}")
        L(f"onglet {name}: moyenne={stats(p)}")

    L("=== 4. Écrans hors onglets (deep links) ===")
    for route in ("looks", "guide", "how", "post", "shift", "receipt", "connect", "language"):
        ok, out = deeplink(route)
        p = shot(f"20-{route}")
        L(f"deeplink /{route}: start={'ok' if ok else 'KO'} ({out}) moyenne={stats(p)}")

    L("=== 5. Retour à l'état par défaut ===")
    shell("input keyevent KEYCODE_BACK")
    time.sleep(1.0)
    tap(*TOP["DARK"], wait=1.2)
    tap(*TOP["A"], wait=1.2)
    tap(TABS["punch"], TY, wait=1.6)
    pf = shot("90-final")
    L(f"final: moyenne={stats(pf)}")

    print("\nTOUR-DONE")


if __name__ == "__main__":
    try:
        main()
    finally:
        with open("_tour-report.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(LOG))
