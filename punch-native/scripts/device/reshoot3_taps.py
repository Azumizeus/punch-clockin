# -*- coding: utf-8 -*-
"""Re-tournage PAR TAPS (les deeplinks punc:/// ne changent pas d'onglet).

Coordonnees d'onglets prouvees par le tour image-diff 100 % passant
(barre d'onglets y=2612, largeur 1080) : Accueil 85, Missions 263,
Monde 440, Bonjours 618, Argent 795, La part 973, Reglages 1114.
Historique : trouve par dump UI (ligne textuelle dans Reglages).
"""
import os
import re
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_probe import fresh_dump, find_text  # sonde durcie : jamais de vieux XML

sys.stdout.reconfigure(errors="replace")

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
PKG = "com.anonymous.punchnative"
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shots", "demo-v165")
TMP_XML = "/sdcard/punchdemo/probe.xml"

def adb(*args, timeout=30):
    return subprocess.run([ADB, *args], capture_output=True, timeout=timeout).stdout.decode("utf-8", "replace")

def sh(cmd, timeout=30):
    return adb("shell", cmd, timeout=timeout)

def tap(x, y, delay=1.6):
    sh("input tap %d %d" % (x, y))
    time.sleep(delay)

def swipe(x0, y0, x1, y1, ms, delay=1.6):
    sh("input swipe %d %d %d %d %d" % (x0, y0, x1, y1, ms))
    time.sleep(delay)

def dump_texts():
    sh("uiautomator dump /sdcard/punchdemo/probe.xml", timeout=20)
    xml = adb("exec-out", "cat", "/sdcard/punchdemo/probe.xml", timeout=20)
    out = []
    for m in re.finditer(r'<node[^>]*text="([^"]{2,})"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', xml):
        t, x0, y0, x1, y1 = m.group(1), *map(int, m.groups()[1:])
        out.append((t, (x0 + x1) // 2, (y0 + y1) // 2))
    return out

def find_tap(needle, tries=3):
    for _ in range(tries):
        for t, cx, cy in dump_texts():
            if needle.lower() in t.lower():
                tap(cx, cy)
                return True
        time.sleep(1.5)
    return False

def shoot(seg, dur, actions=None):
    rec = subprocess.Popen([ADB, "shell", "screenrecord", "--bit-rate", "8000000",
                            "--time-limit", str(dur), "/sdcard/punchdemo/%s.mp4" % seg],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(dur / 2.0)
    if actions:
        actions()
    rec.wait(timeout=dur + 25)
    time.sleep(2)
    local = os.path.join(SHOTS, "%s.mp4" % seg)
    adb("pull", "/sdcard/punchdemo/%s.mp4" % seg, local, timeout=60)
    sh("rm /sdcard/punchdemo/%s.mp4" % seg)
    print("  [rec] %s.mp4 (%d Ko)" % (seg, os.path.getsize(local) // 1024))

def goto_tab(x):
    tap(x, 2612)

def on_connect():
    """Vrai marqueur : le dump UI contient le CTA de l'ecran Connect."""
    sh("uiautomator dump /sdcard/punchdemo/probe.xml", timeout=20)
    xml = adb("exec-out", "cat", "/sdcard/punchdemo/probe.xml", timeout=20)
    return ("Ouvrir mon portefeuille" in xml) or ("Open my wallet" in xml)

# --- demarrage : si l'ecran est Connect, l'humain signe (feuille vault) ---
sh("am start -n %s/.MainActivity" % PKG)
time.sleep(5)
if on_connect():
    print(">>> SIGNATURE DEMANDEE : APPROVE LA CONNEXION sur le telephone (90 s) <<<")
    ok = False
    for _ in range(45):
        time.sleep(2)
        if not on_connect():
            ok = True
            break
    print("  connecte : %s" % ok)
time.sleep(5)

print("board (Missions)")
goto_tab(263); time.sleep(2)
shoot("segB-03-board", 12, lambda: swipe(540, 1700, 540, 800, 350))

print("wallet (Argent)")
goto_tab(795); time.sleep(2)
shoot("segB-04-wallet", 11, lambda: swipe(540, 1700, 540, 900, 350))

print("globe (Monde)")
goto_tab(440); time.sleep(2)
def globe():
    swipe(900, 1100, 200, 1100, 420, delay=2.5)
    swipe(200, 1100, 900, 1100, 420, delay=2.5)
shoot("segB-05-globe", 14, globe)

print("hellos (Bonjours)")
goto_tab(618); time.sleep(2)
shoot("segB-06-hellos", 11, lambda: swipe(540, 1700, 540, 900, 350))

print("history (Argent -> lien Historique)")
goto_tab(795); time.sleep(2)  # l'Historique vit dans l'onglet Argent (wallet.tsx:149)
# Le lien est EN HAUT du ScrollView — les swipes de tournage l'ont laisse
# deroule vers le bas : on remonte franchement avant de chercher.
for _ in range(3):
    swipe(540, 900, 540, 2000, 300)
    time.sleep(0.8)
found = False
for attempt in range(8):
    root = fresh_dump(local=os.path.join(SHOTS, "probe-history.xml"))
    hit = (find_text(root, "Historique des tickets") or find_text(root, "Ticket history")) if root else None
    if hit:
        tap(hit[0], hit[1])
        found = True
        break
    swipe(540, 1800, 540, 1000, 350)  # pas de scroll plus ample (le lien est bas dans l'onglet)
    time.sleep(1.2)
print("  Historique trouve : %s" % found)
shoot("segB-07-history", 11)

print("final (Accueil)")
goto_tab(85); time.sleep(2)
shoot("segB-08-final", 10)

print("Re-tournage par taps termine")
