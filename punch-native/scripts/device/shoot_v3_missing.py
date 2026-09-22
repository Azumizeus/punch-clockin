# -*- coding: utf-8 -*-
"""Retourne les plans manquants : punch+ticket, cadran, board, wallet, globe.

Lecons des runs precedents appliquees :
  - navigation par DEEP LINKS `punc:///<route>` (demo_take2.py : rushs propres)
    — plus aucun tap d'onglet a l'aveugle, donc plus de sortie accidentelle ;
  - GARDE-FOU : avant et apres chaque plan, une capture est classee
    « app » (pixels or du cadran / fond sombre) ou « hors app ». Un plan
    tourne hors app est refuse immediatement (pas de faux OK par taille) ;
  - UN SEUL tap caché possible par plan, toujours dans l'app (bolt (540,1450),
    onglet (x,2592)) — jamais de back ni de swipe hors zones internes ;
  - les captures-preuves .png sont re-verifiables.

Aucune signature attendue : l'app est DEJA connectee (verifie avant tournage).
"""
import os
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(errors="replace")
from ui_probe import fresh_dump, find_text, sh, tap  # noqa: E402

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
PKG = "com.anonymous.punchnative"
SHOTS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shots", "demo-v166"))
os.makedirs(SHOTS, exist_ok=True)


def adb(*args, timeout=40):
    return subprocess.run([ADB, *args], capture_output=True, timeout=timeout).stdout.decode("utf-8", "replace")


def shot(name):
    sh("screencap -p /sdcard/punchdemo/%s.png" % name)
    adb("pull", "/sdcard/punchdemo/%s.png" % name, os.path.join(SHOTS, "%s.png" % name), timeout=60)
    sh("rm /sdcard/punchdemo/%s.png" % name)
    print("  [shot] %s.png" % name, flush=True)


def in_app_gold(threshold=1.2):
    """Capture + classification : % de pixels or du cadran. L'app sombre/or
    affiche au moins ~1,2 % de pixels or (cadran, CTA, bordures) ; le launcher
    ou une page web en ont quasi zero."""
    sh("screencap -p /sdcard/punchdemo/_chk.png")
    adb("pull", "/sdcard/punchdemo/_chk.png", os.path.join(SHOTS, "_chk.png"), timeout=60)
    sh("rm /sdcard/punchdemo/_chk.png")
    import numpy as np
    from PIL import Image
    a = np.asarray(Image.open(os.path.join(SHOTS, "_chk.png")).convert("RGB"), dtype=np.int16)
    gold = (abs(a[:, :, 0] - 212) < 45) & (abs(a[:, :, 1] - 175) < 45) & (abs(a[:, :, 2] - 55) < 55)
    dark = a.mean() < 60
    os.remove(os.path.join(SHOTS, "_chk.png"))
    pct = gold.mean() * 100
    return (pct >= threshold and dark) or (pct >= 2.0), pct


def wait_back_in_app(tries=8):
    for _ in range(tries):
        time.sleep(2)
        ok, pct = in_app_gold()
        if ok:
            return True
    return False


def goto(route):
    """Deep link interne. Verifie ensuite qu'on est bien dans l'app."""
    sh("am start -a android.intent.action.VIEW -d 'punc:///%s'" % route)
    time.sleep(3.5)
    ok, pct = in_app_gold()
    print("  [nav] punc:///%s -> or %.2f%% %s" % (route, pct, "OK" if ok else "!! HORS APP"), flush=True)
    return ok


def record(name, dur, actions):
    print("  [rec] %s.mp4 (%d s) ..." % (name, dur), flush=True)
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
    print("  [rec] %s.mp4 : %d Ko" % (name, size), flush=True)
    return size > 200


def in_vault():
    return "solanamobile" in adb("shell", "dumpsys window | grep mCurrentFocus")


def vault_cycle(label, tries_open=40, tries_close=60):
    opened = False
    for _ in range(tries_open):
        time.sleep(2)
        if in_vault():
            opened = True
            break
    if not opened:
        print("  !! feuille jamais ouverte : %s" % label, flush=True)
        return False
    print(">>> SIGNATURE : %s — APPROVE SUR LE TELEPHONE <<<" % label, flush=True)
    for _ in range(tries_close):
        time.sleep(2)
        if not in_vault():
            return True
    print("  !! timeout signature : %s" % label, flush=True)
    return False


def ensure_connected():
    """Connecte l'app si besoin (JAMAIS de force-stop : la session est purgee
    a chaque relance — regle Seed Vault). Une seule approbation suffit pour
    toute la suite des plans."""
    for _ in range(5):
        r = fresh_dump()
        cta = (find_text(r, "Ouvrir mon portefeuille") or find_text(r, "Open my wallet")) if r is not None else None
        if cta is None:
            return True  # pas l'ecran Connect -> session active
        tap(cta[0], cta[1], wait=3.0)
        if not vault_cycle("LA CONNEXION (autorisation Seed Vault)"):
            return False
        time.sleep(6)
        # ne PAS faire back : on reste dans l'app
    return False


# ------------------------------------------------------------------ cadran
def plan_cadran():
    if not goto("punch"):
        return False
    ok = record("seg02-cadran", 22, lambda: (
        time.sleep(9),
        sh("input swipe 540 1700 540 1450 600"),
        time.sleep(8),
        shot("seg02-cadran"),
    ))
    return ok and wait_back_in_app()


# ------------------------------------------------------------------ punch
def plan_punch():
    if not goto("punch"):
        return False
    ok = record("seg03-punch", 34, lambda: (
        time.sleep(5),
        sh("input tap 540 1450"),      # le bolt — feuille Seed Vault attendue
        time.sleep(26),                 # signature utilisateur + ticket
        shot("seg03-ticket"),
        time.sleep(3),
    ))
    return ok


# ------------------------------------------------------------------ board
def plan_board():
    if not goto("board"):
        return False
    ok = record("seg04-board", 18, lambda: (
        time.sleep(6),
        sh("input swipe 540 1750 540 1150 450"),
        time.sleep(4),
        shot("seg04-board"),
        time.sleep(4),
    ))
    return ok and wait_back_in_app()


# ------------------------------------------------------------------ wallet
def plan_wallet():
    if not goto("wallet"):
        return False
    ok = record("seg05-wallet", 20, lambda: (
        time.sleep(9),
        shot("seg05-wallet"),
        sh("input swipe 540 1750 540 1050 450"),
        time.sleep(4),
        shot("seg05-rangs"),
        time.sleep(3),
    ))
    return ok and wait_back_in_app()


# ------------------------------------------------------------------ globe
def plan_globe():
    if not goto("globe"):
        return False
    ok = record("seg06-globe", 22, lambda: (
        time.sleep(4),
        sh("input swipe 250 1150 950 1250 300"),   # lancers, reste dans l'ecran
        time.sleep(4),
        sh("input swipe 900 1300 300 1150 300"),
        time.sleep(4),
        sh("input swipe 250 1250 950 1150 300"),
        time.sleep(6),
        shot("seg06-globe"),
    ))
    return ok and wait_back_in_app()


def main():
    print("== Retake des 5 plans manquants (deep links + garde-fou or) ==", flush=True)
    sh("am start -n %s/.MainActivity" % PKG)
    time.sleep(7)
    if not ensure_connected():
        print("!! connexion impossible — abandon", flush=True)
        return 1
    print("session active — plans en chaine sans redemarrage", flush=True)
    plans = [("cadran", plan_cadran), ("punch", plan_punch), ("board", plan_board),
             ("wallet", plan_wallet), ("globe", plan_globe)]
    results = {}
    for name, p in plans:
        print("-- PLAN %s --" % name, flush=True)
        try:
            results[name] = p()
        except Exception as e:
            print("  !! echec : %r" % e, flush=True)
            results[name] = False
    print("== BILAN ==", flush=True)
    for name in results:
        print("  %-8s : %s" % (name, "OK" if results[name] else "RATE"), flush=True)
    return 0 if all(results.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
