# -*- coding: utf-8 -*-
"""Retourne les plans 1-3 rates : connexion, cadran, pointage reel.

Prerequis : l'app est DECONNECTEE (ecran Connect affiche) — c'est l'etat
laisse par la tx « Quitter le reseau » du run precedent.
L'ecran Connect accepte les dumps UI (pas d'anneau pulsant) ; l'Accueil non
(piege connu) — le pointage se fait donc au TAP FIXE (540, 1450), coordonnee
eprouvee par demo_take2.py (rushes segB-02 valides).

Signatures attendues : 1) connexion, 2) pointage.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(errors="replace")
from ui_probe import fresh_dump, find_text, sh, tap  # noqa: E402

PKG = "com.anonymous.punchnative"
SHOTS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shots", "demo-v166"))
CONNECT_CTA = ("Ouvrir mon portefeuille", "Open my wallet")


def adb(*args, timeout=40):
    import subprocess
    return subprocess.run([ADB, *args], capture_output=True, timeout=timeout).stdout.decode("utf-8", "replace")


ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")


def in_vault():
    return "solanamobile" in adb("shell", "dumpsys window | grep mCurrentFocus")


def find_any(root, needles):
    if root is None:
        return None
    for nd in needles:
        hit = find_text(root, nd)
        if hit:
            return hit
    return None


def wait_until(pred, tries, every=2.0, label=""):
    for _ in range(tries):
        time.sleep(every)
        try:
            if pred():
                return True
        except Exception:
            pass
    print("  !! timeout : %s" % label, flush=True)
    return False


def shot(name):
    sh("screencap -p /sdcard/punchdemo/%s.png" % name)
    adb("pull", "/sdcard/punchdemo/%s.png" % name, os.path.join(SHOTS, "%s.png" % name), timeout=60)
    sh("rm /sdcard/punchdemo/%s.png" % name)
    print("  [shot] %s.png" % name, flush=True)


def record(name, dur, actions):
    print("  [rec] %s.mp4 (%d s) ..." % (name, dur), flush=True)
    import subprocess
    rec = subprocess.Popen([ADB, "shell", "screenrecord", "--bit-rate", "6000000",
                            "--time-limit", str(dur), "/sdcard/punchdemo/%s.mp4" % name],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        actions()
    finally:
        rec.wait(timeout=dur + 30)
    time.sleep(2)
    local = os.path.join(SHOTS, "%s.mp4" % name)
    adb("pull", "/sdcard/punchdemo/%s.mp4" % name, local, timeout=120)
    sh("rm /sdcard/punchdemo/%s.mp4" % name)
    size = os.path.getsize(local) // 1024
    ok = size > 200
    print("  [rec] %s.mp4 : %d Ko %s" % (name, size, "OK" if ok else "!! TROP PETIT"), flush=True)
    return ok


def vault_cycle(label, tries_open=40, tries_close=60):
    opened = wait_until(in_vault, tries_open, 2.0, label + " (ouverture feuille)")
    if not opened:
        return False
    print(">>> SIGNATURE : %s — APPROVE SUR LE TELEPHONE <<<" % label, flush=True)
    return wait_until(lambda: not in_vault(), tries_close, 2.0, label + " (signature)")


def plan1():
    """Connexion : ecran CLOCK IN + feuille vault + accueil (45 s)."""
    sh("am force-stop %s" % PKG)
    time.sleep(2)
    sh("am start -n %s/.MainActivity" % PKG)
    time.sleep(7)

    def actions():
        time.sleep(3)
        cta = None
        for _ in range(6):
            r = fresh_dump()
            cta = find_any(r, CONNECT_CTA)
            if cta:
                break
            time.sleep(2.5)
        if cta is None:
            print("  !! CTA introuvable sur Connect", flush=True)
            return
        tap(cta[0], cta[1], wait=2.0)
        if not vault_cycle("1/2 LA CONNEXION (autorisation Seed Vault)"):
            return
        time.sleep(6)   # lot de bienvenue + soldes
        shot("seg01-connecte")
        sh("input keyevent 4")
        time.sleep(2)
    return record("seg01-connect", 45, actions)


def plan2():
    """Accueil : cadran + horloge + registre (24 s, aucun tap)."""
    def actions():
        time.sleep(8)
        sh("input swipe 540 1700 540 1400 700")
        time.sleep(8)
        shot("seg02-cadran")
    return record("seg02-cadran", 24, actions)


def plan3():
    """Pointage reel : tap fixe (540,1450) -> feuille -> signature -> ticket (38 s)."""
    def actions():
        time.sleep(5)
        sh("input tap 540 1450")
        if not vault_cycle("2/2 LE POINTAGE (la memo PUNCH)"):
            return
        time.sleep(9)   # le ticket papier
        shot("seg03-ticket")
        time.sleep(6)
    return record("seg03-punch", 38, actions)


def main():
    print("== Retake plans 1-3 — 2 SIGNATURES A APPROUVER ==", flush=True)
    plans = [plan1, plan2, plan3]
    results = {}
    for i, p in enumerate(plans, 1):
        print("-- PLAN %d/3 --" % i, flush=True)
        try:
            results[i] = p()
        except Exception as e:
            print("  !! echec : %r" % e, flush=True)
            results[i] = False
    print("== BILAN ==", flush=True)
    for i in sorted(results):
        print("  plan %d : %s" % (i, "OK" if results[i] else "RATE"), flush=True)
    return 0 if all(results.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
