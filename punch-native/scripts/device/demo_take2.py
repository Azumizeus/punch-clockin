# -*- coding: utf-8 -*-
"""Passe 2 du tournage demo PUNCH : segments UI propres (screenrecords valides).

Demande exactement 2 signatures a l'humain :
  1. la reconnexion Seed Vault (demarrage a froid = toujours Connect),
  2. un vrai pointage (tap bolt -> feuille -> ticket).
Tout le reste est de la navigation enregistree. Segments nommes segB-*.
"""
import os
import subprocess
import sys
import time

sys.stdout.reconfigure(errors="replace")

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
PKG = "com.anonymous.punchnative"
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shots", "demo-v165")
os.makedirs(SHOTS, exist_ok=True)

def adb(*args, timeout=30):
    return subprocess.run([ADB, *args], capture_output=True, timeout=timeout).stdout.decode("utf-8", "replace")

def sh(cmd, timeout=30):
    return adb("shell", cmd, timeout=timeout)

def focus():
    return sh("dumpsys window | grep -E mCurrentFocus").strip()

def in_sheet():
    return "solanamobile" in focus()

def wait_until(pred, timeout, poll=1.0):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            if pred():
                return True
        except Exception:
            pass
        time.sleep(poll)
    return False

class Rec:
    def __init__(self, seg):
        self.seg = seg
        self.remote = "/sdcard/punchdemo/%s.mp4" % seg
        self.p = None
    def start(self):
        self.p = subprocess.Popen([ADB, "shell", "screenrecord", "--bit-rate", "8000000",
                                   "--time-limit", "180", self.remote],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1.0)
    def stop(self):
        if self.p:
            sh("pkill -INT screenrecord 2>/dev/null || kill -s INT $(pidof screenrecord) 2>/dev/null")
            try:
                self.p.wait(timeout=12)
            except Exception:
                self.p.kill()
            time.sleep(2.5)
            self.p = None
            local = os.path.join(SHOTS, "%s.mp4" % self.seg)
            adb("pull", self.remote, local, timeout=60)
            sh("rm %s" % self.remote)
            size = os.path.getsize(local) if os.path.exists(local) else 0
            print("  [rec] %s.mp4 (%d Ko) %s" % (self.seg, size // 1024, "ok" if size > 100_000 else "TROP COURT"))

def shot(name):
    remote = "/sdcard/punchdemo/%s.png" % name
    sh("screencap -p %s" % remote)
    adb("pull", remote, os.path.join(SHOTS, "%s.png" % name), timeout=60)
    sh("rm %s" % remote)
    print("  [shot] %s.png" % name)

def tap(x, y, delay=1.2):
    sh("input tap %d %d" % (x, y))
    time.sleep(delay)

def goto(tab):
    sh("am start -a android.intent.action.VIEW -d 'punc:///%s'" % tab)
    time.sleep(2.5)
    if PKG not in focus():
        sh("am start -n %s/.MainActivity" % PKG)
        time.sleep(3)

# --- passe 2 -------------------------------------------------------------
# Segment 1 : hook CLOCK IN + reconnexion signee (SIGNATURE 1 attendue)
sh("am force-stop %s" % PKG)
time.sleep(1)
rec = Rec("segB-01-clockin"); rec.start()
sh("am start -n %s/.MainActivity" % PKG)
time.sleep(6)
shot("B-01-connect")
if in_sheet():
    print(">>> SIGNATURE 1/2 : APPROVE LA CONNEXION sur le telephone <<<")
    wait_until(lambda: not in_sheet(), 120)
time.sleep(6)
shot("B-01-connecte")
rec.stop()

# Segment 2 : pointage reel (SIGNATURE 2 attendue)
goto("punch")
time.sleep(3)
rec = Rec("segB-02-punch"); rec.start()
tap(540, 1450, 2.0)
if in_sheet():
    print(">>> SIGNATURE 2/2 : APPROVE LE POINTAGE (memo) sur le telephone <<<")
    wait_until(lambda: not in_sheet(), 120)
time.sleep(5)
shot("B-02-ticket")
rec.stop()

# Segments UI purs
for seg, tab, extra in [
    ("segB-03-board", "board", "swipe"),
    ("segB-04-wallet", "wallet", None),
    ("segB-05-globe", "globe", "globe"),
    ("segB-06-hellos", "hellos", None),
]:
    goto(tab)
    time.sleep(3)
    rec = Rec(seg); rec.start()
    if extra == "swipe":
        sh("input swipe 540 1600 540 900 300")
        time.sleep(2)
    elif extra == "globe":
        for x0, x1 in [(900, 200), (200, 900), (800, 300)]:
            sh("input swipe %d 1100 %d 1100 400" % (x0, x1))
            time.sleep(2)
    shot(seg.replace("segB-", "B-") + "-fin")
    rec.stop()

# Segment 7 : historique
sh("am start -a android.intent.action.VIEW -d 'punc:///history'")
time.sleep(3)
rec = Rec("segB-07-history"); rec.start()
time.sleep(3)
shot("B-07-historique")
rec.stop()

# Segment 8 : final accueil
goto("punch")
time.sleep(3)
rec = Rec("segB-08-final"); rec.start()
time.sleep(4)
shot("B-08-final")
rec.stop()

print("\n==== PASSE 2 TERMINEE — segments dans %s ====" % SHOTS)
