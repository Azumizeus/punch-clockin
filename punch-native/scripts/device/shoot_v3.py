# -*- coding: utf-8 -*-
"""Tourne les plans de la NOUVELLE video demo (v1.6.6, voix off EN) — v2.

Corrections apres le premier essai :
  - in_vault() utilise adb() (l'ancien sh() de ui_probe renvoie un
    CompletedProcess, d'ou le TypeError du plan 6) ;
  - les feuilles Seed Vault suivent un protocole fiable : attendre OUVERTE,
    demander la signature, attendre FERMEE (l'ancien code fermait la feuille
    pendant qu'elle s'ouvrait) ;
  - la CONNEXION est tournee en premier (l'app purge sa session a chaque
    relance : apres une sortie, tout est gated derriere Connect) ;
  - la demo Reseau (ping) est tournee AVANT « Quitter le reseau » ;
  - l'ecran CLOCK IN final est capte en fin de plan de sortie (apres la tx).

Signatures attendues de l'utilisateur : 1) connexion, 2) pointage,
3) quitter le reseau. Sorties : punch-native/_shots/demo-v166/segNN-*.mp4
"""
import os
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(errors="replace")
from ui_probe import fresh_dump, find_text, screenshot, sh, tap  # noqa: E402

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
PKG = "com.anonymous.punchnative"
SHOTS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shots", "demo-v166"))
os.makedirs(SHOTS, exist_ok=True)

TREASURY_URL = ("https://explorer.solana.com/address/"
                "FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn?cluster=devnet")
CONNECT_CTA = ("Ouvrir mon portefeuille", "Open my wallet")
HOME_MARKERS = ("Je me pointe", "I'm here", "Today", "Aujourd'hui")
PUNCH_BTN = ("Je me pointe", "I'm here")
HELLO_BTN = ("Dire bonjour", "Say hi", "Bonjour")


def adb(*args, timeout=40):
    return subprocess.run([ADB, *args], capture_output=True, timeout=timeout).stdout.decode("utf-8", "replace")


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


def on_connect(root):
    return find_any(root, CONNECT_CTA) is not None


def is_home(root):
    return find_any(root, HOME_MARKERS) is not None


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
    """Attend la feuille OUVERTE, l'annonce, puis FERMEE. True si fermee."""
    opened = wait_until(in_vault, tries_open, 2.0, label + " (ouverture feuille)")
    if not opened:
        return False
    print(">>> SIGNATURE : %s — APPROVE SUR LE TELEPHONE <<<" % label, flush=True)
    return wait_until(lambda: not in_vault(), tries_close, 2.0, label + " (signature)")


def wake():
    sh("input keyevent KEYCODE_WAKEUP")
    time.sleep(1.5)
    sh("input keyevent 82")
    time.sleep(1.5)


def goto_tab(name, xs):
    """Ouvre un onglet (plusieurs x possibles). Verification best-effort :
    le dump echoue sur les ecrans non-idle (piège connu) — on retente puis
    on continue a l'aveugle avec les coordonnees fixes."""
    for x in xs:
        tap(x, 2592, wait=2.2)
        for _ in range(3):
            r = fresh_dump()
            if r is not None:
                if find_text(r, name):
                    return True
                break
            time.sleep(1.5)
    return False


def probe(name, xs):
    """goto_tab qui n'echoue pas si le dump est muet (coordonnees fixes sures)."""
    if goto_tab(name, xs):
        return True
    print("  (dump muet — navigation a l'aveugle sur %s)" % name, flush=True)
    tap(xs[0], 2592, wait=2.5)
    return True


# ------------------------------------------------------------------ PLAN 1
def plan1():
    """Connexion : ecran CLOCK IN + feuille Seed Vault + accueil (VO du punch)."""
    sh("am force-stop %s" % PKG)
    time.sleep(2)
    sh("am start -n %s/.MainActivity" % PKG)
    time.sleep(7)

    def actions():
        time.sleep(3)
        r = fresh_dump()
        cta = find_any(r, CONNECT_CTA)
        if cta is None:
            print("  !! ecran Connect introuvable — deja connecte ?", flush=True)
            return
        tap(cta[0], cta[1], wait=2.0)
        if not vault_cycle("1/3 LA CONNEXION (autorisation Seed Vault)"):
            return
        time.sleep(5)   # le lot de bienvenue + les soldes arrivent
        shot("seg01-connecte")
        sh("input keyevent 4")  # fermer un eventuel custom tab
        time.sleep(2)
    return record("seg01-connect", 45, actions)


# ------------------------------------------------------------------ PLAN 2
def plan2():
    """Accueil : cadran + horloge + registre (VO 17.5 s -> 24 s)."""
    def actions():
        time.sleep(8)
        sh("input swipe 540 1700 540 1400 700")
        time.sleep(8)
        shot("seg02-cadran")
    return record("seg02-cadran", 24, actions)


# ------------------------------------------------------------------ PLAN 3
def plan3():
    """Pointage reel : bolt -> feuille -> signature -> ticket (VO 11.6 -> 38 s)."""
    def actions():
        time.sleep(3)
        r = fresh_dump()
        btn = find_any(r, PUNCH_BTN)
        if btn is None:
            print("  !! bouton pointage introuvable", flush=True)
            return
        time.sleep(4)
        tap(btn[0], btn[1], wait=2.0)
        if not vault_cycle("2/3 LE POINTAGE (la memo PUNCH)"):
            return
        time.sleep(9)   # le ticket papier s'affiche
        shot("seg03-ticket")
        time.sleep(6)
    return record("seg03-punch", 38, actions)


# ------------------------------------------------------------------ PLAN 4
def plan4():
    """Board : missions payees, ouverture d'une carte (VO 14.5 -> 22 s)."""
    if not probe("Missions", (300, 340, 260)):
        return False

    def actions():
        time.sleep(6)
        sh("input swipe 540 1800 540 1100 500")
        time.sleep(4)
        r = fresh_dump()
        hit = find_any(r, ("USDC", "USDT"))
        if hit:
            tap(hit[0], hit[1] - 60, wait=3.0)
            time.sleep(6)
            shot("seg04-mission")
            sh("input keyevent 4")
        time.sleep(2)
    return record("seg04-board", 22, actions)


# ------------------------------------------------------------------ PLAN 5
def plan5():
    """Wallet : soldes reels + rangs de staking (VO 15.2 -> 24 s)."""
    if not probe("Argent", (771, 810, 740)):
        return False

    def actions():
        time.sleep(9)   # les soldes se rechargent depuis devnet
        shot("seg05-wallet")
        sh("input swipe 540 1800 540 1000 500")
        time.sleep(4)
        shot("seg05-rangs")
        sh("input swipe 540 1800 540 1000 500")
        time.sleep(3)
    return record("seg05-wallet", 24, actions)


# ------------------------------------------------------------------ PLAN 6
def plan6():
    """Globe (2 lancers) + Bonjour paye (VO 15.4 -> 26 s)."""
    if not probe("Monde", (500, 470, 540)):
        return False

    def actions():
        time.sleep(4)
        sh("input swipe 300 1400 900 1200 250")
        time.sleep(5)
        sh("input swipe 800 1500 250 1300 250")
        time.sleep(4)
        shot("seg06-globe")
        if probe("Bonjours", (643, 680, 610)):
            time.sleep(3)
            r = fresh_dump()
            hit = find_any(r, HELLO_BTN)
            if hit:
                tap(hit[0], hit[1], wait=4.0)
                time.sleep(6)
                shot("seg06-bonjour")
        time.sleep(2)
    return record("seg06-globe", 26, actions)


# ------------------------------------------------------------------ PLAN 7
def plan7():
    """Reseau (ping vert) puis Historique (VO 12.0 + 13.6 -> 30 s)."""
    if not probe("Réglages", (1138, 1114, 1170)):
        return False

    def actions():
        for _ in range(4):
            r = fresh_dump()
            if find_any(r, ("Tester la connexion", "Test connection")):
                break
            sh("input swipe 540 1900 540 1100 400")
            time.sleep(1.6)
        r = fresh_dump()
        test = find_any(r, ("Tester la connexion", "Test connection"))
        if test:
            tap(test[0], test[1], wait=2.0)
            wait_until(lambda: find_any(fresh_dump(), ("Connexion OK", "Connection OK")) is not None,
                       8, every=1.5, label="verdict ping")
            time.sleep(3)
            shot("seg07-ping")
        # Historique
        r = fresh_dump()
        hist = find_any(r, ("Historique", "History"))
        if hist:
            tap(hist[0], hist[1], wait=3.0)
            time.sleep(4)
            sh("input swipe 540 1700 540 1100 450")
            time.sleep(5)
            shot("seg07-historique")
            sh("input keyevent 4")
            time.sleep(3)
        # retour en haut des Reglages pour la suite
        sh("input swipe 540 1000 540 1900 400")
        time.sleep(2)
    return record("seg07-reseau", 30, actions)


# ------------------------------------------------------------------ PLAN 8
def plan8():
    """Quitter le reseau (signature 3/3) -> ecran CLOCK IN final (VO 11.1+ -> 40 s)."""
    def actions():
        for _ in range(5):
            r = fresh_dump()
            if find_any(r, ("Quitter le réseau", "Leave the network")):
                break
            sh("input swipe 540 1900 540 1000 400")
            time.sleep(1.6)
        r = fresh_dump()
        leave = find_any(r, ("Quitter le réseau", "Leave the network"))
        if leave is None:
            print("  !! ligne Quitter introuvable", flush=True)
            return
        time.sleep(4)
        tap(leave[0], leave[1], wait=2.0)
        if not vault_cycle("3/3 QUITTER LE RESEAU (vraie transaction de sortie)"):
            return
        time.sleep(10)  # retour Connect : l'ecran CLOCK IN final
        shot("seg08-clockin-final")
        time.sleep(8)
    return record("seg08-leave", 40, actions)


# ------------------------------------------------------------------ PLAN 9
def plan9():
    """Explorer du tresor sur le telephone (VO 12.0 -> 18 s)."""
    def actions():
        time.sleep(6)
        sh("input swipe 540 1500 540 1100 500")
        time.sleep(4)
        sh("input swipe 540 1500 540 1100 500")
        time.sleep(3)
        shot("seg09-explorer")
    sh("am start -a android.intent.action.VIEW -d '%s'" % TREASURY_URL.replace("&", "\\&"))
    time.sleep(4)
    ok = record("seg09-explorer", 18, actions)
    sh("input keyevent 4")
    time.sleep(2)
    return ok


def main():
    print("== Tournage demo v1.6.6 v2 — 3 SIGNATURES A APPROUVER SUR LE TELEPHONE ==", flush=True)
    print("   (1) connexion  (2) pointage  (3) quitter le reseau", flush=True)
    sh("rm -f /sdcard/punchdemo/*.mp4 /sdcard/punchdemo/*.png")
    wake()
    plans = [plan1, plan2, plan3, plan4, plan5, plan6, plan7, plan8, plan9]
    results = {}
    for i, p in enumerate(plans, 1):
        print("-- PLAN %d/9 --" % i, flush=True)
        try:
            results[i] = p()
        except Exception as e:
            print("  !! echec plan %d : %r" % (i, e), flush=True)
            results[i] = False
    print("== BILAN ==", flush=True)
    for i in sorted(results):
        print("  plan %d : %s" % (i, "OK" if results[i] else "RATE"), flush=True)
    return 0 if all(results.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
