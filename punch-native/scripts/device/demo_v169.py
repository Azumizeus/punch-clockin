# -*- coding: utf-8 -*-
"""Tournage demo v1.6.9 — version 3 : coords d'onglets exactes, zero deeplink.

Verrouille par les echecs du 08/10 :
  - deeplink casse (Unmatched Route) : navigation UNIQUEMENT par taps sur la
    barre d'onglets, coordonnees lues dans le dump reel (1200x2670) ;
  - punch = 1/jour/wallet (on-chain) : les ecrans passifs d'abord, puis
    test Quitter-reseau -> reconnexion -> punch (nouvelle session ?) ;
  - langue : bouton EN/FR haut droite (1113,184), libelle = langue cible.

Usage :
    python demo_v169.py en    # passe EN (verify + bascule si besoin)
    python demo_v169.py fr    # passe FR
Les signatures (say-hi, quitter, connexion, punch) = DOIGT humain.
"""
import os
import subprocess
import sys
import time
from datetime import datetime

sys.stdout.reconfigure(errors="replace")

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
PKG = "com.anonymous.punchnative"
LANG = (sys.argv[1] if len(sys.argv) > 1 else "en").lower()
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shots", "demo-v169-" + LANG)
os.makedirs(SHOTS, exist_ok=True)
EV = os.path.join(SHOTS, "evidence-" + LANG + ".md")
open(EV, "a", encoding="utf-8").write(
    "\n# Passe %s — %s\n\n" % (LANG.upper(), datetime.now().strftime("%Y-%m-%d %H:%M")))

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
        sh("mkdir -p /sdcard/punchdemo")
        self.p = subprocess.Popen([ADB, "shell", "screenrecord", "--bit-rate", "8000000",
                                   "--time-limit", "180", self.remote],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1.0)
    def stop(self):
        if not self.p:
            return 0
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

def tap(x, y, delay=1.5):
    # Garde-fou incident du 08/10 : jamais de tap hors de PUNCH/Seed Vault —
    # quand l'app est fermée, les taps tombaient sur le launcher (fenêtres
    # personnelles). Si le focus est autre part, on ignore le tap.
    f = focus()
    if "punchnative" not in f and "solanamobile" not in f:
        log("SKIP", "tap annulé : app au premier plan ? (%s)" % f[:60])
        time.sleep(delay)
        return
    sh("input tap %d %d" % (x, y))
    time.sleep(delay)

def dump_rows(tries=5):
    """rows reelles de l'ecran courant (l'accueil n'est jamais idle : reessaye)."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from ui_probe import fresh_dump, texts
    rows = []
    for _ in range(tries):
        root = fresh_dump("ui_probe_nav.xml")
        if root is not None:
            rows = texts(root)
            break
        time.sleep(1.5)
    return [(t, d, b) for t, d, b in rows if b]

def joined_text(rows):
    return " ".join(((t or "") + " " + (d or "")) for t, d, _ in rows)

def tap_tab(x=1114, y=2592, delay=2.2):
    tap(x, y, delay)

def wait_signed(name, budget=45):
    ok = wait_until(lambda: not in_sheet(), budget)
    if not ok:
        log("ECHEC", "%s : feuille encore ouverte apres %d s" % (name, budget))
    else:
        time.sleep(5)
    return ok

# ------------------------------------------------------------------ langue
TAB_X = {"home": 85, "jobs": 257, "world": 428, "hellos": 600, "money": 771, "cut": 943, "settings": 1114}
MARK = {"en": ["Home", "Jobs", "World"], "fr": ["Accueil", "Missions", "Monde"]}
LANG_BTN = (1113, 184)

def switch_lang(target):
    for _ in range(3):
        rows = dump_rows()
        j = joined_text(rows)
        if all(m in j for m in MARK[target]):
            log("OK", "langue %s confirmee" % target)
            return True
        tap(*LANG_BTN, 2.5)
    log("ECHEC", "bascule langue %s non confirmee" % target)
    return False

# ----------------------------------------------------------------- passes

def p_connect():
    """Si l'app est sur l'ecran de connexion (session purgee au demarrage a
    froid), filme le bienvenue + feuille Seed Vault + accueil connecte."""
    time.sleep(2)
    rows = dump_rows()
    j = joined_text(rows)
    if not ("Open my wallet" in j or "Ouvrir mon portefeuille" in j):
        return ("OK", ["deja connecte — arc connexion saute"])
    shot("00-welcome")
    pos = None
    for t, d, b in rows:
        hay = ((t or "") + " " + (d or "")).lower()
        if ("open my wallet" in hay or "ouvrir mon portefeuille" in hay) and b:
            parts = b.strip("[]").split("][")
            x0, y0 = [int(v) for v in parts[0].split(",")]
            x1, y1 = [int(v) for v in parts[1].split(",")]
            pos = ((x0 + x1) // 2, (y0 + y1) // 2)
            break
    if not pos:
        return ("ECHEC", ["CTA connexion introuvable"])
    tap(*pos, 3.0)
    print("  >>> SIGNE LA CONNEXION SUR LE TELEPHONE <<<", flush=True)
    ok = wait_signed("connexion", 90)
    time.sleep(4)
    shot("01-connecte")
    return (("OK" if ok else "ECHEC"), ["connexion signee" if ok else "non confirmee"])

DIAL_CANDIDATES = [(600, 800), (540, 1450), (600, 1000), (600, 600)]

def p_punch():
    tap_tab(TAB_X["home"])
    time.sleep(3)
    shot("02-avant-punch")
    for cand in DIAL_CANDIDATES:
        tap(*cand, 2.0)
        if in_sheet():
            break
        time.sleep(1)
    print("  >>> SIGNE LE POINTAGE SUR LE TELEPHONE <<<", flush=True)
    ok = wait_signed("punch", 90)
    time.sleep(4)
    shot("03-ticket")
    return (("OK" if ok else "ECHEC"), ["punch signe" if ok else "feuille jamais ouverte (cadran non touche ?)"])

def p_jobs():
    tap_tab(TAB_X["jobs"])
    time.sleep(3)
    shot("02-jobs")
    sh("input swipe 540 1700 540 900 400")
    time.sleep(2)
    shot("02-jobs-scroll")
    return ("OK", ["missions"])

def p_money():
    tap_tab(TAB_X["money"])
    time.sleep(3)
    shot("03-money")
    sh("input swipe 540 1700 540 900 400")
    time.sleep(2)
    shot("03-money-scroll")
    return ("OK", ["wallet"])

def p_world():
    tap_tab(TAB_X["world"])
    time.sleep(3)
    for x0, x1 in ((900, 200), (200, 900), (800, 300)):
        sh("input swipe %d 1200 %d 1200 400" % (x0, x1))
        time.sleep(2)
    shot("04-world")
    return ("OK", ["globe"])

def p_hellos():
    tap_tab(TAB_X["hellos"])
    time.sleep(3)
    shot("05-hellos")
    # say-hi : 1 signature (le « dire bonjour paie 0,10 $ »)
    rows = dump_rows()
    pos = None
    for t, d, b in rows:
        hay = ((t or "") + " " + (d or "")).lower()
        if ("say hi" in hay or "bonjour" in hay or "dire bonjour" in hay) and b and b.find("][") > 0:
            parts = b.strip("[]").split("][")
            y0 = int(parts[0].split(",")[1])
            if y0 < 2400:  # pas la barre d'onglets
                x0, y0 = [int(v) for v in parts[0].split(",")]
                x1, y1 = [int(v) for v in parts[1].split(",")]
                pos = ((x0 + x1) // 2, (y0 + y1) // 2)
                break
    if not pos:
        return ("OK", ["pas de bouton say-hi visible — plan sans signature"])
    tap(*pos, 2.0)
    print("  >>> SIGNE LE SAY-HI SUR LE TELEPHONE <<<", flush=True)
    ok = wait_signed("say-hi", 40)
    time.sleep(3)
    shot("05-hellos-paye")
    return (("OK" if ok else "ECHEC"), ["say-hi signe" if ok else "non signe"])

def p_cut():
    tap_tab(TAB_X["cut"])
    time.sleep(3)
    shot("06-cut")
    sh("input swipe 540 1700 540 900 400")
    time.sleep(2)
    shot("06-cut-scroll")
    return ("OK", ["la part 92/3/5"])

def p_settings():
    tap_tab(TAB_X["settings"])
    time.sleep(3)
    shot("07-settings")
    return ("OK", ["reseau + version (sans signature)"])

def p_leave_connect_punch():
    """Quitter le reseau (SIGNE) -> reconnexion (SIGNE) -> test punch (SIGNE)."""
    tap_tab(TAB_X["settings"])
    time.sleep(3)
    rows = dump_rows()
    pos = None
    for t, d, b in rows:
        hay = ((t or "") + " " + (d or "")).lower()
        if ("quitter" in hay or "leave" in hay) and b and b.find("][") > 0:
            parts = b.strip("[]").split("][")
            y0 = int(parts[0].split(",")[1])
            if y0 < 2400:
                x0, y0 = [int(v) for v in parts[0].split(",")]
                x1, y1 = [int(v) for v in parts[1].split(",")]
                pos = ((x0 + x1) // 2, (y0 + y1) // 2)
                break
    if not pos:
        return ("ECHEC", ["bouton Quitter introuvable"])
    tap(*pos, 2.0)
    print("  >>> SIGNE LA SORTIE DU RESEAU SUR LE TELEPHONE <<<", flush=True)
    if not wait_signed("leave", 60):
        return ("ECHEC", ["sortie non signee"])
    time.sleep(4)
    shot("08-connect")
    # reconnexion
    rows = dump_rows()
    pos = None
    for t, d, b in rows:
        hay = ((t or "") + " " + (d or "")).lower()
        if ("ouvrir mon portefeuille" in hay or "open my wallet" in hay) and b:
            parts = b.strip("[]").split("][")
            x0, y0 = [int(v) for v in parts[0].split(",")]
            x1, y1 = [int(v) for v in parts[1].split(",")]
            pos = ((x0 + x1) // 2, (y0 + y1) // 2)
            break
    if not pos:
        return ("ECHEC", ["CTA reconnexion introuvable"])
    tap(*pos, 3.0)
    print("  >>> SIGNE LA RECONNEXION SUR LE TELEPHONE <<<", flush=True)
    if not wait_signed("connect", 60):
        return ("ECHEC", ["reconnexion non confirmee"])
    time.sleep(4)
    shot("08-connecte")
    # test punch
    tap_tab(TAB_X["home"])
    time.sleep(2)
    tap(600, 800, 2.0)
    sheet = in_sheet()
    if sheet:
        print("  >>> SIGNE LE PUNCH SUR LE TELEPHONE (arc complet ce soir !) <<<", flush=True)
        ok = wait_signed("punch", 60)
        time.sleep(4)
        shot("08-ticket")
        return (("OK" if ok else "ECHEC"), ["punch nouveau wallet: signe" if ok else "non confirme"])
    time.sleep(4)
    shot("08-ticket")
    return ("ECHEC", ["pas de feuille au 2e punch — punch filera a la bascule du jour"])

results = []

def step(seg, title, actions):
    print("\n== %s — %s ==" % (seg, title), flush=True)
    rec = Rec(seg)
    rec.start()
    try:
        status, lines = actions()
    except Exception as e:
        status, lines = "ECHEC", ["exception : %r" % e]
    finally:
        rec.stop()
    log(status, "%s : %s" % (title, " ; ".join(lines)))
    results.append((seg, title, status))

print("== Passe %s ==" % LANG.upper())
switch_lang(LANG)

step("seg-00-connect", "Bienvenue + connexion (DOIGT)", p_connect)
step("seg-01-punch", "Punch + ticket 92/3/5 (DOIGT)", p_punch)
step("seg-02-jobs", "Board — missions", p_jobs)
step("seg-03-money", "Wallet — soldes", p_money)
step("seg-04-world", "Globe", p_world)
step("seg-05-hellos", "Say hi (DOIGT)", p_hellos)
step("seg-06-cut", "La part 92/3/5", p_cut)
step("seg-07-settings", "Reglages (reseau+version)", p_settings)
step("seg-08-arc", "Quitter+Reconnexion+Punch (3 DOIGTS)", p_leave_connect_punch)

ok = sum(1 for _, _, s in results if s == "OK")
with open(EV, "a", encoding="utf-8") as f:
    f.write("\n**Bilan : %d/%d OK**\n" % (ok, len(results)))
print("\n==== PASSE %s : %d/%d OK — rushs dans %s ====" % (LANG.upper(), ok, len(results), SHOTS))
