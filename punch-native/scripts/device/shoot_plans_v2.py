# -*- coding: utf-8 -*-
"""Tourne les 3 plans manquants du script video (v2).

Plan A — feuille Seed Vault : l'ecran Connect + CTA "Ouvrir mon portefeuille"
         + la feuille systeme qui s'ouvre. AUCUNE signature : on ferme la
         feuille avec back (aucune autorisation n'est accordee).
Plan B — explorer : la page explorer.solana.com du tresor sur le navigateur
         du telephone (cluster=devnet), scroll lent pour la lisibilite.
Plan C — quitter le reseau : accueil -> REGLAGES -> ligne "Quitter le reseau"
         -> la feuille Seed Vault s'ouvre et attend la signature. Si elle
         arrive dans les 120 s, on filme la sortie (retour Connect, compteurs
         decremente). Sinon : segC = la feuille qui attend (le juger voit
         l'ecran de signature, ce qui est deja la preuve demandee).

Sorties dans punch-native/_shots/demo-v165/ : segC-01-vault.mp4,
segC-02-explorer.mp4, segC-03-leave.mp4 (+ captures PNG).
"""
import os
import subprocess
import sys
import time

sys.stdout.reconfigure(errors="replace")

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
PKG = "com.anonymous.punchnative"
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shots", "demo-v165")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_probe import fresh_dump, find_text

def adb(*args, timeout=40):
    return subprocess.run([ADB, *args], capture_output=True, timeout=timeout).stdout.decode("utf-8", "replace")

def sh(cmd, timeout=40):
    return adb("shell", cmd, timeout=timeout)

def tap(x, y, d=1.8):
    sh("input tap %d %d" % (x, y))
    time.sleep(d)

def swipe(y0, y1, d=1.5):
    sh("input swipe 540 %d 540 %d 400" % (y0, y1))
    time.sleep(d)

def shot(name):
    sh("screencap -p /sdcard/punchdemo/%s.png" % name)
    adb("pull", "/sdcard/punchdemo/%s.png" % name, os.path.join(SHOTS, "%s.png" % name), timeout=60)
    sh("rm /sdcard/punchdemo/%s.png" % name)
    print("  [shot] %s.png" % name)

def record(name, dur):
    rec = subprocess.Popen([ADB, "shell", "screenrecord", "--bit-rate", "1500000",
                            "--time-limit", str(dur), "/sdcard/punchdemo/%s.mp4" % name],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(dur + 6)
    rec.wait(timeout=20)
    time.sleep(2)
    local = os.path.join(SHOTS, "%s.mp4" % name)
    adb("pull", "/sdcard/punchdemo/%s.mp4" % name, local, timeout=60)
    sh("rm /sdcard/punchdemo/%s.mp4" % name)
    print("  [rec] %s.mp4 (%d Ko)" % (name, os.path.getsize(local) // 1024))
    return local

def on_connect():
    root = fresh_dump(local=os.path.join(SHOTS, "probe-plan.xml"))
    if root is None:
        return False
    return find_text(root, "Ouvrir mon portefeuille") is not None or \
           find_text(root, "Open my wallet") is not None

def in_vault():
    return "solanamobile" in sh("dumpsys window | grep mCurrentFocus")

# ---------------------------------------------------------------- plan A
print("== PLAN A : feuille Seed Vault ==")
sh("am force-stop %s" % PKG)
time.sleep(1)
sh("am start -n %s/.MainActivity" % PKG)
time.sleep(6)
if not on_connect():
    print("  !! ecran inattendu (pas Connect) — plan A rate")
else:
    shot("segC-01a-connect")
    record("segC-01-vault", 22) if False else None  # placeholder, le vrai tourne apres le tap
    # On lance l'enregistrement PUIS on ouvre la feuille pendant le film :
    rec = subprocess.Popen([ADB, "shell", "screenrecord", "--bit-rate", "1500000",
                            "--time-limit", "22", "/sdcard/punchdemo/segC-01-vault.mp4"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    root = fresh_dump(local=os.path.join(SHOTS, "probe-plan.xml"))
    hit = find_text(root, "Ouvrir mon portefeuille") or find_text(root, "Open my wallet")
    if hit:
        tap(hit[0], hit[1], d=3)
    time.sleep(8)          # la feuille vault bien visible
    shot("segC-01b-vault")
    sh("input keyevent 4")  # fermer la feuille — AUCUNE signature
    time.sleep(3)
    rec.wait(timeout=30)
    time.sleep(2)
    adb("pull", "/sdcard/punchdemo/segC-01-vault.mp4", os.path.join(SHOTS, "segC-01-vault.mp4"), timeout=60)
    sh("rm /sdcard/punchdemo/segC-01-vault.mp4")
    print("  [rec] segC-01-vault.mp4 (%d Ko)" % (os.path.getsize(os.path.join(SHOTS, "segC-01-vault.mp4")) // 1024))

# ---------------------------------------------------------------- plan B
print("== PLAN B : explorer du tresor ==")
URL = "https://explorer.solana.com/address/FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn?cluster=devnet"
sh("am start -a android.intent.action.VIEW -d '%s'" % URL.replace("&", "\\&"))
time.sleep(12)  # le navigateur charge + le RPC devnet repond
rec = subprocess.Popen([ADB, "shell", "screenrecord", "--bit-rate", "1500000",
                        "--time-limit", "20", "/sdcard/punchdemo/segC-02-explorer.mp4"],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(3)
swipe(1500, 1100, d=2)   # scroll lent vers le bas
swipe(1500, 1100, d=2)
shot("segC-02-explorer")
rec.wait(timeout=30)
time.sleep(2)
adb("pull", "/sdcard/punchdemo/segC-02-explorer.mp4", os.path.join(SHOTS, "segC-02-explorer.mp4"), timeout=60)
sh("rm /sdcard/punchdemo/segC-02-explorer.mp4")
print("  [rec] segC-02-explorer.mp4 (%d Ko)" % (os.path.getsize(os.path.join(SHOTS, "segC-02-explorer.mp4")) // 1024))
sh("input keyevent 4")  # quitter le navigateur
time.sleep(2)

# ---------------------------------------------------------------- plan C
print("== PLAN C : quitter le reseau ==")
sh("am start -n %s/.MainActivity" % PKG)
time.sleep(5)
if on_connect():
    print("  !! app sur Connect : le plan C demande une session active.")
    print("  >>> SIGNATURE 1/2 : APPROVE LA CONNEXION (120 s) <<<")
    okc = False
    for _ in range(60):
        time.sleep(2)
        if not on_connect():
            okc = True
            break
    print("  connecte :", okc)
    time.sleep(4)
tap(1114, 2612)  # onglet Reglages
time.sleep(2.5)
swipe(1900, 1300)  # la ligne Quitter est bas dans la page
swipe(1900, 1300)
root = fresh_dump(local=os.path.join(SHOTS, "probe-plan.xml"))
hit = (find_text(root, "Quitter le réseau") or find_text(root, "Leave the network") or
       find_text(root, "Quitter le reseau")) if root is not None else None
if hit is None:
    print("  !! ligne Quitter introuvable — plan C rate")
else:
    rec = subprocess.Popen([ADB, "shell", "screenrecord", "--bit-rate", "1500000",
                            "--time-limit", "120", "/sdcard/punchdemo/segC-03-leave.mp4"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    tap(hit[0], hit[1], d=3)
    time.sleep(8)
    shot("segC-03a-feuille")
    if in_vault():
        print(">>> SIGNATURE 2/2 : APPROVE QUITTER LE RESEAU (120 s) <<<")
        for _ in range(60):
            time.sleep(2)
            if not in_vault():
                break
    time.sleep(8)   # la sortie : retour Connect + compteurs decrementes
    shot("segC-03b-sortie")
    rec.wait(timeout=40)
    time.sleep(2)
    adb("pull", "/sdcard/punchdemo/segC-03-leave.mp4", os.path.join(SHOTS, "segC-03-leave.mp4"), timeout=60)
    sh("rm /sdcard/punchdemo/segC-03-leave.mp4")
    print("  [rec] segC-03-leave.mp4 (%d Ko)" % (os.path.getsize(os.path.join(SHOTS, "segC-03-leave.mp4")) // 1024))

sh("rm -f /sdcard/punchdemo/viab.mp4")
print("Plans v2 termines")
