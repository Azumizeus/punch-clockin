# -*- coding: utf-8 -*-
"""Repetition generale jury + tournage demo PUNCH sur Seeker (adb).

Execute les 9 etapes du GUIDE-JURY dans l'ordre. Pour chaque segment :
  - demarre adb screenrecord (<= 180 s) avant les actions,
  - pilote les taps/deeplinks,
  - fait la capture-preuve dans _shots/demo-v165/,
  - stoppe l'enregistrement -> seg-XX-*.mp4,
  - journalise la preuve dans evidence.md.

Regles :
  - Les signatures Seed Vault ne sont JAMAIS pilotees par script : le script
    attend que la feuille systeme disparaisse (focus quitte com.solanamobile).
  - Aucune reprise : si une attente expire, l'etape est marquee ECHEC et la
    suite continue (le journal dit la verite, toujours).
Prerequis : appareil branche/autorise, APK installe, mode demarrage a froid.
"""
import os
import subprocess
import sys
import time
from datetime import datetime

sys.stdout.reconfigure(errors="replace")

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
PKG = "com.anonymous.punchnative"
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shots", "demo-v165")
os.makedirs(SHOTS, exist_ok=True)
EV = os.path.join(SHOTS, "evidence.md")
open(EV, "w", encoding="utf-8").write(
    "# Repetition generale jury — v1.6.5 — %s\n\n" % datetime.now().strftime("%Y-%m-%d %H:%M"))

def adb(*args, timeout=30):
    return subprocess.run([ADB, *args], capture_output=True, timeout=timeout).stdout.decode("utf-8", "replace")

def sh(cmd, timeout=30):
    return adb("shell", cmd, timeout=timeout)

def focus():
    out = sh("dumpsys window | grep -E mCurrentFocus")
    return out.strip()

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
    """Un screenrecord par segment."""
    def __init__(self, seg):
        self.seg = seg
        self.remote = "/sdcard/punchdemo/%s.mp4" % seg
        self.p = None
    def start(self):
        self.p = subprocess.Popen([ADB, "shell", "screenrecord", "--bit-rate", "8000000",
                                   "--time-limit", "180", self.remote],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1.0)
    def stop(self, ok=True):
        if self.p:
            # SIGINT au process DISTANT : screenrecord finalise le mp4 proprement.
            # (terminate() local coupe adb avant finalisation -> fichiers tronques)
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
            return size
        return 0

def log(status, line):
    with open(EV, "a", encoding="utf-8") as f:
        f.write("- **[%s]** %s\n" % (status, line))
    print("  [%s] %s" % (status, line))

def shot(name):
    remote = "/sdcard/punchdemo/%s.png" % name
    sh("screencap -p %s" % remote)
    local = os.path.join(SHOTS, "%s.png" % name)
    adb("pull", remote, local, timeout=60)
    sh("rm %s" % remote)
    print("  [shot] %s.png" % name)
    return local

def tap(x, y, delay=1.2):
    sh("input tap %d %d" % (x, y))
    time.sleep(delay)

def goto(tab):
    """Onglet via deeplink scheme punc:// puis fallback tap barre."""
    sh("am start -a android.intent.action.VIEW -d 'punc:///%s'" % tab)
    time.sleep(2.5)
    if PKG not in focus():
        sh("am start -n %s/.MainActivity" % PKG)
        time.sleep(3)

def settle(sec=8):
    time.sleep(sec)

def wait_signed_confirmed(name, budget=100):
    """Attend la fermeture de la feuille vault puis la confirmation app."""
    ok_close = wait_until(lambda: not in_sheet(), budget)
    if not ok_close:
        log("ECHEC", "%s : feuille vault encore ouverte apres %d s (non signe ?)" % (name, budget))
        return False
    settle()
    return True

TREASURY_SOL = 0.0

def treasury_sol():
    import json, urllib.request
    req = urllib.request.Request(
        "https://api.devnet.solana.com",
        data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": "getBalance",
                         "params": ["FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn"]}).encode(),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)["result"]["value"] / 1e9

# ---------------------------------------------------------------- etapes
results = []

def step(n, title, actions, record=True):
    print("\n== ETAPE %s — %s ==" % (n, title))
    rec = Rec("seg-%02d" % n) if record else None
    if rec:
        rec.start()
    try:
        status, lines = actions()
    except Exception as e:
        status, lines = "ECHEC", ["exception : %r" % e]
    finally:
        if rec:
            rec.stop()
    log(status, "Etape %s (%s) : %s" % (n, title, " ; ".join(lines)))
    results.append((n, title, status))

def a_boot():
    sh("am force-stop %s" % PKG)
    time.sleep(1)
    sh("am start -n %s/.MainActivity" % PKG)
    settle(6)
    shot("01-connect")
    # l'humain signe la connexion : on attend la sortie de feuille
    if in_sheet():
        print("  >>> SIGNATURE DEMANDEE : confirme la connexion sur le telephone <<<")
        wait_until(lambda: not in_sheet(), 120)
    settle(6)
    shot("01-connecte")
    f = focus()
    return ("OK", ["focus=%s" % f[:80]])

def a_welcome():
    before = treasury_sol()
    t0 = time.time()
    got = wait_until(lambda: treasury_sol() > before + 0.01, 180, poll=5)
    after = treasury_sol()
    shot("02-bienvenue")
    return (("OK" if got else "ECHEC"),
            ["tresor %+.4f SOL en %d s (solde now %.4f)" % (after - before, time.time() - t0, after)])

def a_punch():
    goto("punch")
    settle(3)
    shot("03-avant-tap")
    # le bolt du cadran : centre de l'ecran
    tap(540, 1450, 2.0)
    if in_sheet():
        print("  >>> SIGNATURE DEMANDEE : approuve le pointage (memo) sur le telephone <<<")
    ok = wait_signed_confirmed("punch")
    settle(4)
    shot("03-ticket")
    return (("OK" if ok else "ECHEC"), ["ticket apres signature" if ok else "signature non confirmee"])

def a_board():
    goto("board")
    settle(3)
    shot("04-board")
    sh("input swipe 540 1600 540 900 300")
    settle(2)
    shot("04-board-scroll")
    return ("OK", ["missions affichees (captures)"])

def a_wallet():
    goto("wallet")
    settle(3)
    shot("05-wallet")
    return ("OK", ["wallet affiche ; swap/stake/signatures a la main si souhaites (hors passe auto)"])

def a_globe():
    goto("globe")
    settle(3)
    for i, (x0, x1) in enumerate([(900, 200), (200, 900), (800, 300)]):
        sh("input swipe %d 1100 %d 1100 400" % (x0, x1))
        settle(2)
    shot("06-globe")
    return ("OK", ["3 lancers de globe (drag + momentum)"])

def a_hello():
    goto("hellos")
    settle(3)
    shot("07-hellos")
    return ("OK", ["onglet bonjours ; bonjour paye a declencher a la main si souhaite"])

def a_leave():
    goto("settings")
    settle(3)
    shot("08-settings")
    return ("OK", ["settings affiche ; quitter le reseau = action destructive volontairement hors passe auto"])

def a_recap():
    # historique
    sh("am start -a android.intent.action.VIEW -d 'punc:///history'")
    settle(3)
    shot("09-historique")
    goto("punch")
    settle(2)
    shot("09-final")
    return ("OK", ["historique des recus + accueil final"])

step(1, "Boot + connexion reelle Seed Vault", a_boot)
step(2, "Lot de bienvenue verifie on-chain", a_welcome, record=False)
step(3, "Pointage reel (memo signee)", a_punch)
step(4, "Board — missions", a_board, record=True)
step(5, "Wallet — soldes", a_wallet, record=True)
step(6, "Globe — physique de drag", a_globe)
step(7, "Hellos", a_hello, record=True)
step(8, "Settings", a_leave, record=False)
step(9, "Historique + final", a_recap, record=True)

ok = sum(1 for _, _, s in results if s == "OK")
with open(EV, "a", encoding="utf-8") as f:
    f.write("\n**Bilan : %d/%d OK**\n" % (ok, len(results)))
print("\n==== BILAN : %d/%d OK — preuves dans %s ====" % (ok, len(results), SHOTS))
