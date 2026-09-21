# -*- coding: utf-8 -*-
"""Demo de la section Reseau (v1.6.6) : RPC au choix de l'utilisateur + test.

AUCUNE signature Seed Vault : Reglages est accessible hors connexion.
Sequence (chaque etape = capture-preuve) :
  1. Onglet Reglages -> section Reseau
  2. Ping du RPC public -> verdict vert avec latence
  3. Endpoint faux -> erreur honnete (la vraie raison, jamais un mensonge)
  4. Retour au RPC public -> statut confirme
La sonde durcie (ui_probe) garantit qu'aucun dump n'est jamais perime.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(errors="replace")
from ui_probe import fresh_dump, find_text, screenshot, sh, tap  # noqa: E402

PKG = "com.anonymous.punchnative"
SHOTS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shots", "reseau-v166"))
os.makedirs(SHOTS, exist_ok=True)


def log(m):
    print(m, flush=True)


def shot(name):
    p = os.path.join(SHOTS, name)
    screenshot(p)
    log("  [shot] %s" % name)


def wake():
    sh("input keyevent KEYCODE_WAKEUP")
    time.sleep(1.5)
    sh("input keyevent 82")  # menu = deverrouille sans code
    time.sleep(1.5)


def focus():
    sh("am start -n %s/.MainActivity" % PKG)
    time.sleep(5)


def find_any(root, needles):
    for nd in needles:
        hit = find_text(root, nd)
        if hit:
            return hit
    return None


def goto_settings():
    """7 onglets, espacement ~171 px — Reglages est le dernier (~x=1138)."""
    for x in (1138, 1100, 1170):
        tap(x, 2612, wait=2.0)
        r = fresh_dump()
        if r is not None and find_any(r, ["Réglages", "Settings"]):
            return True
    return False


def reveal_reseau():
    """Fait defiler jusqu'a voir la section Reseau (ou son bouton Test)."""
    for i in range(4):
        r = fresh_dump()
        if r is not None and find_any(r, ["Tester la connexion", "Test connection"]):
            return r
        sh("input swipe 600 1900 600 1100 350")
        time.sleep(1.6)
    return fresh_dump()


def wait_verdict(needles, tries=8):
    """Attend le verdict du ping (l'UI peut ne pas etre idle : sonde durcie)."""
    for _ in range(tries):
        time.sleep(1.5)
        r = fresh_dump()
        if r is not None:
            hit = find_any(r, needles)
            if hit:
                return r, hit
    return (None, None) if False else (fresh_dump(), None)


CONNECT_CTA = ("Ouvrir mon portefeuille", "Open my wallet")
HOME_MARKERS = ("Je me pointe", "I'm here", "Today", "Aujourd'hui")


def on_connect(root):
    """L'ecran Connect montre AUSSI 'CLOCK IN' — le seul marqueur fiable
    est le CTA de connexion lui-meme (absent partout ailleurs)."""
    return root is not None and find_any(root, list(CONNECT_CTA)) is not None


def is_home(root):
    return root is not None and find_any(root, list(HOME_MARKERS)) is not None


def ensure_connected():
    """L'app gate tout derriere Connect : une SEULE approbationSeed Vault
    suffit (le wallet existe deja). Le pilote ouvre la feuille et attend."""
    r = fresh_dump()
    if not on_connect(r):
        return True  # deja connecte
    cta = find_any(r, list(CONNECT_CTA))
    tap(cta[0], cta[1], wait=3.0)
    print(">>> APPROVE LA CONNEXION sur le telephone (feuille Seed Vault, 150 s) <<<", flush=True)
    for _ in range(75):
        time.sleep(2)
        r = fresh_dump()
        if r is None:
            continue
        if on_connect(r):
            continue  # feuille pas encore approuvee
        if is_home(r):
            return True
        # Le flux vault peut ouvrir un Custom Tab navigateur (punch-app…) :
        # on revient a l'app et on re-verifie son vrai marqueur.
        sh("input keyevent 4")
        time.sleep(2)
    sh("am start -n %s/.MainActivity" % PKG)
    time.sleep(5)
    r = fresh_dump()
    return is_home(r)


def main():
    log("== Demo Reseau v1.6.6 — RPC au choix + test de connexion ==")
    wake()
    focus()

    if not ensure_connected():
        log("!! connexion non approuvee a temps")
        shot("00-echec-connexion.png")
        return 1
    log("1. Connecte (CTA absent, accueil affiche)")

    if not goto_settings():
        log("!! Reglages introuvable")
        shot("00-echec-reglages.png")
        return 1
    log("2. Reglages ouvert")
    shot("01-reglages.png")

    r = reveal_reseau()
    ok = r is not None and find_any(r, ["Tester la connexion", "Test connection"])
    log("3. Section Reseau visible : %s" % bool(ok))
    shot("02-section-reseau.png")
    if not ok:
        log("!! Section Reseau introuvable apres defilement")
        return 1

    # --- Ping du RPC public ---
    hit = find_any(r, ["Tester la connexion", "Test connection"])
    tap(hit[0], hit[1], wait=2.0)
    r, v = wait_verdict(["Connexion OK", "Connection OK"])
    if v:
        log("4. Ping RPC public : VERDICT VERT -> %s" % v[2])
        shot("03-ping-public-ok.png")
    else:
        log("3. Verdict non lu au dump (devnet sature ?) — capture brute")
        shot("03-ping-public-etat.png")

    # --- Endpoint faux -> erreur honnete ---
    r = fresh_dump()
    field = find_any(r, ["api.devnet"])
    if field is None:
        log("!! champ URL introuvable")
        return 1
    tap(field[0], field[1], wait=1.6)
    for _ in range(36):  # vider le champ (29 chars + marge)
        sh("input keyevent 67")
        time.sleep(0.02)
    sh("input text https://rpc-inexistant-punch.example")
    time.sleep(1.2)
    sh("input keyevent 4")  # fermer le clavier (pas de retour app)
    time.sleep(1.2)
    r = fresh_dump()
    save = find_any(r, ["Enregistrer", "Save"])
    if save is None:
        log("!! bouton Enregistrer introuvable")
        return 1
    tap(save[0], save[1], wait=2.0)  # declenche le ping de preuve
    r, v = wait_verdict(["échouée", "échoué", "failed", "Failed"])
    log("5. Endpoint FAUX : verdict -> %s" % (v[2] if v else "non lu au dump"))
    shot("04-endpoint-faux-erreur.png")

    # --- Retour au RPC public ---
    r = fresh_dump()
    back = find_any(r, ["Revenir au RPC public", "Back to public"])
    if back is None:
        sh("input swipe 600 1900 600 1300 350")
        time.sleep(1.6)
        r = fresh_dump()
        back = find_any(r, ["Revenir au RPC public", "Back to public"])
    if back is None:
        log("!! bouton retour public introuvable")
        return 1
    tap(back[0], back[1], wait=2.0)
    r, v = wait_verdict(["public actif", "Public RPC"])
    log("6. Retour public : statut -> %s" % (v[2] if v else "non lu au dump"))
    shot("05-retour-rpc-public.png")

    # --- Preuve finale : le ping redevient vert sur le public ---
    r = fresh_dump()
    test = find_any(r, ["Tester la connexion", "Test connection"])
    if test:
        tap(test[0], test[1], wait=2.0)
        r, v = wait_verdict(["Connexion OK", "Connection OK"])
        log("7. Re-ping public : %s" % (v[2] if v else "non lu"))
        shot("06-ping-public-confirme.png")

    log("== Fin de la demo — captures dans _shots/reseau-v166 ==")
    return 0


if __name__ == "__main__":
    sys.exit(main())
