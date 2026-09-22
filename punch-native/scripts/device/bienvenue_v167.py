# -*- coding: utf-8 -*-
"""Lot de bienvenue sur APK CI v1.6.7 : connexion signee Seed Vault + preuves.

Sequence : ecran Connect -> tap "Ouvrir mon portefeuille" -> feuille Seed Vault
(capture) -> l'utilisateur APPROUVE sur le telephone -> accueil connecte
(capture). Les signatures du tresor sont ensuite differees cote PC.
Aucune deeplink : un seul tap, coordonnees lues dans le dump.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))
from ui_probe import sh, tap, screenshot, fresh_dump, texts, find_text  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "_shots", "bienvenue-v167")
os.makedirs(OUT, exist_ok=True)
sys.stdout.reconfigure(errors="replace")


def snapshot_texts():
    root = fresh_dump()
    return texts(root) if root else []


def any_text(rows, *needles):
    joined = " ".join((t or "") + " " + (d or "") for t, d, _ in rows).lower()
    return any(n.lower() in joined for n in needles)


def main():
    print("1) etat initial")
    screenshot(os.path.join(OUT, "01-connect.png"))

    root = fresh_dump()
    pos = find_text(root, "Ouvrir mon portefeuille") if root else None
    if not pos:
        print("!! CTA introuvable")
        return 1
    print("2) tap CTA", pos)
    tap(pos[0], pos[1], wait=4.0)

    sheet_shot = False
    connected = False
    for i in range(30):  # 30 x 5 s = 150 s pour approuver
        time.sleep(5)
        rows = snapshot_texts()
        if not sheet_shot and any_text(rows, "seed vault", "portefeuille seed", "wallet seed"):
            screenshot(os.path.join(OUT, "02-feuille-seedvault.png"))
            sheet_shot = True
            print(f"   [{i*5}s] feuille Seed Vault capturee")
        # marqueurs connecte-only (jamais sur Connect) :
        if any_text(rows, "missions", "bonjour", "historique") and any_text(rows, "clock in"):
            connected = True
            screenshot(os.path.join(OUT, "03-accueil-connecte.png"))
            print(f"   [{i*5}s] ACCUEIL CONNECTE capture")
            break
        if any_text(rows, "refus", "annul", "echec", "échec"):
            print("   [!] echec/annulation cote telephone")
            break
        if i % 4 == 0:
            print(f"   [{i*5}s] en attente d'approbation...")

    if not connected:
        screenshot(os.path.join(OUT, "99-etat-final.png"))
        print("!! connexion non confirmee — voir 99-etat-final.png")
        return 2
    print("OK — captures dans", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
