"""Tour 2 : taps aux coordonnées calibrées par détection de blobs.

Look A : pilule active détectée x=631..712 → A=(671,184), pas B, C, DARK=767.
Look B : SOMBRE détecté x=990..1032 → DARK=(1011,184), LIGHT=(1101,184), GOLD=(1170,184).
"""
import os
import subprocess
import sys
import time
from PIL import Image

sys.stdout.reconfigure(errors="replace")

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
OUT = "_shots"
os.makedirs(OUT, exist_ok=True)


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


def tap(x, y, wait=2.0):
    shell(f"input tap {x} {y}")
    time.sleep(wait)


def diff(a, b):
    ia = Image.open(os.path.join(OUT, a)).convert("L").resize((120, 267))
    ib = Image.open(os.path.join(OUT, b)).convert("L").resize((120, 267))
    da, db = list(ia.getdata()), list(ib.getdata())
    return sum(abs(x - y) for x, y in zip(da, db)) / len(da)


def stats(path):
    im = Image.open(path).convert("RGB").resize((60, 133))
    px = list(im.getdata())
    n = len(px)
    return tuple(sum(p[i] for p in px) // n for i in range(3))


LOOKS_A = {"A": (671, 184), "B": (784, 184), "C": (890, 184)}
THEME_B = {"DARK": (1011, 184), "LIGHT": (1101, 184), "GOLD": (1170, 184)}
TAB_PUNCH = (100, 2612)

print("=== TOUR 2 (coordonnées calibrées) ===", flush=True)

# --- A / B / C en thème sombre ---
tap(*LOOKS_A["A"], wait=2.2)
shot("30-dark-A"); print(f"dark+A : {stats('_shots/30-dark-A.png')}", flush=True)
tap(*LOOKS_A["B"], wait=2.2)
shot("31-dark-B"); print(f"dark+B : {stats('_shots/31-dark-B.png')}  diff vs A={diff('30-dark-A.png','31-dark-B.png'):.1f}", flush=True)
tap(*LOOKS_A["C"], wait=2.2)
shot("32-dark-C"); print(f"dark+C : {stats('_shots/32-dark-C.png')}  diff vs B={diff('31-dark-B.png','32-dark-C.png'):.1f}", flush=True)

# --- thèmes, manipulés en look B (boutons visibles = fond input) ---
tap(*LOOKS_A["B"], wait=2.0)          # revenir en B
tap(*THEME_B["GOLD"], wait=2.2)       # ✦ or
shot("33-gold-B"); print(f"gold+B : {stats('_shots/33-gold-B.png')}  diff vs darkB={diff('31-dark-B.png','33-gold-B.png'):.1f}", flush=True)
tap(*THEME_B["GOLD"], wait=2.2)       # ✧ or clair
shot("34-goldLight-B"); print(f"orClair+B : {stats('_shots/34-goldLight-B.png')}  diff vs or={diff('33-gold-B.png','34-goldLight-B.png'):.1f}", flush=True)
tap(*THEME_B["LIGHT"], wait=2.2)      # clair
shot("35-light-B"); print(f"light+B : {stats('_shots/35-light-B.png')}  diff vs orClair={diff('34-goldLight-B.png','35-light-B.png'):.1f}", flush=True)
tap(*THEME_B["DARK"], wait=2.2)       # sombre
shot("36-dark-B"); print(f"dark+B (retour) : {stats('_shots/36-dark-B.png')}  diff vs light={diff('35-light-B.png','36-dark-B.png'):.1f}", flush=True)

# --- onglets, look B pour changer ---
for name, x in (("punch", 100), ("board", 300), ("globe", 500), ("wallet", 700), ("split", 900), ("settings", 1100)):
    tap(x, 2612, wait=2.2)
    shot(f"40-tab-{name}")
    print(f"onglet {name:8s}: {stats(f'_shots/40-tab-{name}.png')}", flush=True)

# --- retour état par défaut : sombre + A + onglet PUNCH ---
tap(1100, 2612, wait=1.6)             # settings (on y est déjà, sans effet)
tap(*THEME_B["DARK"], wait=1.6)
tap(*LOOKS_A["A"], wait=1.6)
tap(*TAB_PUNCH, wait=1.8)
shot("99-final"); print(f"final  : {stats('_shots/99-final.png')}", flush=True)
print("TOUR2-DONE", flush=True)
