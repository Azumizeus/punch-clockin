# -*- coding: utf-8 -*-
"""Retourne board/wallet/globe avec le BON schema de deep link (punchnative://).

Cause racine des rushs statiques d'origine : le script utilisait `punc:///route`
alors que le schema declare dans app.json est `punchnative` — l'intent etait
delivre mais jamais route. Ici : navigation verifiee pixel par pixel (or),
l'app est DEJA connectee (aucune signature, aucun redemarrage).

Coordonnees pour l'ecran reel du Seeker (1200x2670).
Sortie : ecrase seg04-board.mp4 / seg05-wallet.mp4 / seg06-globe.mp4
(demo-v166/) — les noms attendus par make_demo_video_v2.py.
"""
import os
import shutil
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(errors="replace")
from ui_probe import sh, ADB as ADB_PATH  # noqa: E402

SHOTS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                      "..", "..", "_shots", "demo-v166"))
os.makedirs(SHOTS, exist_ok=True)


def in_app_gold(threshold=1.2):
    sh("screencap -p /sdcard/punchdemo/_chk.png")
    subprocess.run([ADB_PATH, "pull", "/sdcard/punchdemo/_chk.png",
                    os.path.join(SHOTS, "_chk.png")], capture_output=True, timeout=60)
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
    sh("am start -a android.intent.action.VIEW -d 'punchnative://%s'" % route)
    time.sleep(4)
    ok, pct = in_app_gold()
    print("  [nav] punchnative://%s -> or %.2f%% %s" % (route, pct, "OK" if ok else "!! HORS APP"), flush=True)
    return ok


def record(name, dur, actions):
    print("  [rec] %s.mp4 (%d s) ..." % (name, dur), flush=True)
    rec = subprocess.Popen([ADB_PATH, "shell", "screenrecord", "--bit-rate", "6000000",
                            "--time-limit", str(dur), "/sdcard/punchdemo/%s.mp4" % name],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        actions()
    finally:
        rec.wait(timeout=dur + 30)
    time.sleep(2)
    local = os.path.join(SHOTS, "%s.mp4" % name)
    subprocess.run([ADB_PATH, "pull", "/sdcard/punchdemo/%s.mp4" % name, local],
                   capture_output=True, timeout=120)
    sh("rm /sdcard/punchdemo/%s.mp4" % name)
    size = os.path.getsize(local) // 1024
    print("  [rec] %s.mp4 : %d Ko" % (name, size), flush=True)
    return size > 200


def shot(name):
    sh("screencap -p /sdcard/punchdemo/%s.png" % name)
    subprocess.run([ADB_PATH, "pull", "/sdcard/punchdemo/%s.png" % name,
                    os.path.join(SHOTS, "%s.png" % name)], capture_output=True, timeout=60)
    sh("rm /sdcard/punchdemo/%s.png" % name)
    print("  [shot] %s.png" % name, flush=True)


def plan_board():
    if not goto("board"):
        return False
    ok = record("seg04-board", 18, lambda: (
        time.sleep(6),
        sh("input swipe 600 1950 600 1280 450"),
        time.sleep(4),
        shot("seg04-board"),
        time.sleep(4),
    ))
    return ok and wait_back_in_app()


def plan_wallet():
    if not goto("wallet"):
        return False
    ok = record("seg05-wallet", 20, lambda: (
        time.sleep(9),
        shot("seg05-wallet"),
        sh("input swipe 600 1950 600 1150 450"),
        time.sleep(4),
        shot("seg05-rangs"),
        time.sleep(3),
    ))
    return ok and wait_back_in_app()


def plan_globe():
    if not goto("globe"):
        return False
    ok = record("seg06-globe", 22, lambda: (
        time.sleep(4),
        sh("input swipe 280 1280 1050 1400 300"),
        time.sleep(4),
        sh("input swipe 1000 1450 350 1280 300"),
        time.sleep(4),
        sh("input swipe 280 1380 1050 1280 300"),
        time.sleep(6),
        shot("seg06-globe"),
    ))
    return ok and wait_back_in_app()


def main():
    print("== Retake board/wallet/globe (schéma punchnative://) ==", flush=True)
    ok, pct = in_app_gold()
    print("etat avant tournage : or %.2f%% (%s)" % (pct, "dans l'app" if ok else "!! PAS dans l'app"), flush=True)
    results = {}
    for name, p in (("board", plan_board), ("wallet", plan_wallet), ("globe", plan_globe)):
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
