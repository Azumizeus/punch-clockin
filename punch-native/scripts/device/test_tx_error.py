# -*- coding: utf-8 -*-
"""Test transaction en erreur : swap SKR->USDC avec reseau coupe au moment de la
soumission. Attendu (v1.6.3) : alerte PUNCH avec la vraie raison lisible
("Connexion reseau perdue..."), jamais de mensonge ni de spinner eternel."""
import os
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(errors="replace")

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
OUT = "_shots"
os.makedirs(OUT, exist_ok=True)


def adb(*args, timeout=60):
    return subprocess.run([ADB, *args], timeout=timeout, capture_output=True)


def shell(cmd, timeout=40):
    return adb("shell", cmd, timeout=timeout)


def tap(x, y, wait=1.5):
    shell(f"input tap {x} {y}")
    time.sleep(wait)


def swipe(x1, y1, x2, y2, ms=400, wait=1.5):
    shell(f"input swipe {x1} {y1} {x2} {y2} {ms}")
    time.sleep(wait)


def shot(name):
    r = adb("exec-out", "screencap", "-p")
    path = os.path.join(OUT, f"{name}.png")
    with open(path, "wb") as f:
        f.write(r.stdout)
    return path


def dump(path="ui_test.xml"):
    shell("uiautomator dump /sdcard/ui_test.xml")
    adb("pull", "/sdcard/ui_test.xml", path)
    try:
        return ET.parse(path).getroot()
    except Exception:
        return None


def texts(root):
    out = []
    if root is None:
        return out
    for n in root.iter("node"):
        t = n.get("text") or ""
        d = n.get("content-desc") or ""
        if t or d:
            out.append((t, d, n.get("bounds")))
    return out


def find(root, needle):
    needle = needle.lower()
    for t, d, b in texts(root):
        if needle in t.lower() or needle in d.lower():
            if not b:
                continue
            b = b.strip("[]").split("][")
            x0, y0 = [int(v) for v in b[0].split(",")]
            x1, y1 = [int(v) for v in b[1].split(",")]
            return (x0 + x1) // 2, (y0 + y1) // 2, (t or d)
    return None


def log(m):
    print(m, flush=True)


def main():
    log("=== 0. Etat de depart ===")
    shell("cmd statusbar collapse")
    time.sleep(1)
    r = dump()
    log("textes: " + " | ".join(t or d for t, d, _ in texts(r)[:6]))

    # Si la feuille vault est ouverte (transaction expiree), on ferme.
    if find(r, "Fermer"):
        c = find(r, "Fermer")
        log("1. Fermeture feuille vault expiree")
        tap(*c[:2])
        time.sleep(2)
        r = dump()

    # Aller sur l'onglet Argent si besoin.
    if not find(r, "Changer de monnaie"):
        log("2. Onglet Argent")
        tap(771, 2592, 2.5)
        r = dump()

    # Couper le Wi-Fi (l'appareil garde ses donnees mobiles desactivees, le
    # Seeker de test n'a que le Wi-Fi apres airplane-mode : reseau reel mort).
    log("3. Coupure Wi-Fi")
    shell("svc wifi disable")
    time.sleep(2)

    # Swap SKR -> USDC par defaut (champ deja a 100 SKR).
    btn = find(r, "Echanger") or find(r, "Échanger")
    if not btn:
        r = dump()
        btn = find(r, "Echanger") or find(r, "Échanger")
    log(f"4. Tap Echanger: {btn}")
    tap(*btn[:2], wait=3)

    # La feuille Seed Vault s'ouvre : approuver VITE (expiration ~30 s).
    approved = False
    for i in range(8):
        r = dump()
        c = find(r, "Approuver") or find(r, "Approve")
        if c:
            log(f"5. Approbation ({i}) : {c[2]}")
            tap(*c[:2], wait=4)
            approved = True
            break
        time.sleep(2)
    if not approved:
        shot("tx-err-no-approve")
        log("!! bouton Approuver introuvable, capture: tx-err-no-approve")
        return

    # Attendre l'echec de soumission puis chercher l'alerte PUNCH.
    alert = None
    for i in range(20):
        r = dump()
        for needle in ("Connexion reseau perdue", "Connexion réseau perdue",
                       "reseau perdu", "réseau perdu", "Transaction refusee",
                       "Transaction refusée"):
            c = find(r, needle)
            if c:
                alert = c
                break
        if alert:
            break
        time.sleep(2)

    shot("tx-err-final")
    if alert:
        log(f"6. ALERTE TROUVEE: {alert[2]}")
        log("=== VERDICT: la vraie raison est affichee ===")
    else:
        log("6. Aucune alerte connue trouvee")
        log("Textes visibles:")
        for t, d, _ in texts(r)[:20]:
            log("  " + (t or d))
        log("=== VERDICT: a verifier sur la capture tx-err-final ===")

    # Retour a l'etat sain : Wi-Fi remis.
    shell("svc wifi enable")
    log("7. Wi-Fi remis")


if __name__ == "__main__":
    main()
