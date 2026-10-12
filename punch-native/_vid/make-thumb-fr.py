# -*- coding: utf-8 -*-
"""Miniature YouTube 1280x720 pour punch-final-fr.mp4.

Compose (PIL, pas de re-encodage video) :
  - fond : banner-final-v2.png (64:9) redimensionne pour couvrir 1280x720,
    crop centre sur la bande heros (PUNCH + slogan + 92/3/5).
  - panneau droit : la vraie image de l'app (keyframe t=30 du final FR,
    guide 2/8 "Un tap. Tu es la." avec l'etoile or pulsante), cadre 3 px or.
  - bandeau titre a gauche : "PUNCH" Georgia bold + tagline + badge 92/3/5,
    lisibles a petite taille (contraste creme/or sur fond noir).
Sortie : punch-native/releases/thumb-final-fr.png
"""
import os
import shutil
import subprocess
import sys

sys.stdout.reconfigure(errors="replace")

VID = os.path.dirname(os.path.abspath(__file__))                      # punch-native/_vid
ROOT = os.path.dirname(os.path.dirname(VID))                          # repo root
RELEASES = os.path.join(os.path.dirname(VID), "releases")
OUT = os.path.join(RELEASES, "thumb-final-fr.png")

W, H = 1280, 720

from PIL import Image, ImageDraw, ImageFont

def ffd(quality):
    # Poster keyframe from the FR final at t=30 (guide 2/8), if missing.
    dst = os.path.join(VID, "_poster-fr30.jpg")
    if not os.path.exists(dst):
        r = subprocess.run(["ffmpeg", "-y", "-ss", "30", "-i",
                            os.path.join(VID, "punch-final-fr.mp4"),
                            "-frames:v", "1", "-q:v", str(quality), dst],
                           capture_output=True)
        if r.returncode != 0:
            raise SystemExit(r.stderr.decode(errors="replace")[-800:])
    return dst

# --- fonts ---------------------------------------------------------------
def font(name, size):
    path = os.path.join("C:/Windows/Fonts", name)
    return ImageFont.truetype(path, size)

GEORGIA_B = font("georgiab.ttf", 84)
GEORGIA_R = font("georgia.ttf", 30)
GEORGIA_TI = font("georgiai.ttf", 40)  # georgia italic for tagline
CONSOLA_B = font("consolab.ttf", 40)
CONSOLA = font("consola.ttf", 28)

GOLD = (212, 175, 55)
CREAM = (244, 236, 216)
BLACK = (10, 9, 8)
DIM = (138, 122, 86)

# --- background : banner crop gauche (le bloc heros PUNCH+slogan+92/3/5),
# mis a l'echelle pour couvrir 1280x720 sans deformer ---
# fond noir pur (identite app) : lisible a petite taille, pas de texte
# duplique du fond qui se melange avec le titre
bg = Image.new("RGB", (W, H), BLACK)
# fine ligne or en haut (rappel banniere)
draw = ImageDraw.Draw(bg)
draw.rectangle([0, 0, W, 6], fill=GOLD)

draw = ImageDraw.Draw(bg)

# --- right panel: app keyframe (phone portrait crop, keeps the star) -----
poster = Image.open(ffd(2)).convert("RGB")
pw, ph = poster.size                       # 1200x2400
panel_h = 620
# crop centre sur l'anneau pulsant (etoile ~y=56% du cadre 1200x2400)
panel = poster.crop((0, int(ph * 0.22), pw, int(ph * 0.22) + int(pw * panel_h / 460)))
panel = panel.resize((int(pw * panel_h / panel.size[1]), panel_h), Image.LANCZOS)
panel_w = panel.size[0]
px = W - panel_w - 48
py = (H - panel_h) // 2
bg.paste(panel, (px, py))
# gold frame around panel
draw = ImageDraw.Draw(bg)
for i in range(3):
    draw.rectangle([px - i, py - i, px + panel_w + i - 1, py + panel_h + i - 1],
                   outline=GOLD if i == 0 else DIM)
# drop shadow
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sdraw = ImageDraw.Draw(shadow)
sdraw.rectangle([px - 14, py + 16, px + panel_w + 14, py + panel_h + 30],
                fill=(0, 0, 0, 160))
bg = Image.alpha_composite(bg.convert("RGBA"), shadow)
bg = bg.convert("RGB")
draw = ImageDraw.Draw(bg)

# --- left title block (dans la bande noire du haut, au-dessus du slogan) --
tx = 52
draw.text((tx, 84), "PUNCH", font=GEORGIA_B, fill=CREAM)
tw = draw.textlength("PUNCH", font=GEORGIA_B)
draw.text((tx + tw + 14, 84), ":", font=GEORGIA_B, fill=GOLD)
draw.text((tx + tw + 46, 84), "Clock'in", font=GEORGIA_B, fill=GOLD)
# tagline
draw.text((tx, 196), "La preuve de présence,", font=GEORGIA_TI, fill=CREAM)
draw.text((tx, 244), "pas la promesse.", font=GEORGIA_TI, fill=CREAM)
# 92/3/5 pill
badge = "92 / 3 / 5"
bw = draw.textlength(badge, font=CONSOLA_B)
bx, by = tx, 340
draw.rounded_rectangle([bx, by, bx + bw + 44, by + 70], radius=35, fill=GOLD)
draw.text((bx + 22, by + 10), badge, font=CONSOLA_B, fill=BLACK)
# sub caption
draw.text((tx, 470), "Solana Mobile · Seeker · devnet", font=CONSOLA, fill=DIM)

# --- save ----------------------------------------------------------------
os.makedirs(RELEASES, exist_ok=True)
bg.save(OUT, "PNG", optimize=True)
print("wrote", OUT, bg.size, os.path.getsize(OUT), "bytes")
