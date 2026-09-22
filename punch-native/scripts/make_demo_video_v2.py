# -*- coding: utf-8 -*-
"""Montage v2 de punch-clockin-demo.mp4 : rushs demo-v166 + voix off EN.

Chaine video : chaque rush -> coupe (-ss/-t) -> normalise 1080x2400 30 fps
h264 crf18, fondus entree/sortie -> concat. Cartes titre/cloture generees
drawtext (fond or/creme du projet). Voix off : segments edge-tts places a
l'offset calcule, mix normloud. Cible : ~3 min.
Sortie : punch-native/releases/punch-clockin-demo.mp4
"""
import os
import shutil
import subprocess
import sys

sys.stdout.reconfigure(errors="replace")

FFDIR = os.path.join(os.environ["LOCALAPPDATA"], "Microsoft", "WinGet", "Packages",
                     "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
                     "ffmpeg-9.0.1-full_build", "bin")
FFMPEG = os.path.join(FFDIR, "ffmpeg.exe")
FFPROBE = os.path.join(FFDIR, "ffprobe.exe")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RUSH = os.path.join(ROOT, "punch-native", "_shots", "demo-v166")
VODIR = os.path.join(RUSH, "vo")
WORK = os.path.join(RUSH, "pieces")
OUT = os.path.join(ROOT, "punch-native", "releases", "punch-clockin-demo.mp4")
shutil.rmtree(WORK, ignore_errors=True)
os.makedirs(WORK, exist_ok=True)

GOLD = "0xd4af37"
CREAM = "0xf4ecd8"
DIM = "0x8a7a56"
BG = "0x0a0908"
GEORGIA = "georgia.ttf"
CONSOLA = "consola.ttf"
for fname in (GEORGIA, CONSOLA):
    dst = os.path.join(WORK, fname)
    if not os.path.exists(dst):
        shutil.copy(os.path.join("C:/Windows/Fonts", fname), dst)

# (rush, ss, dur, gel) — montage v6 : l'arc punch complet (feuille -> Approuve
# -> CLOCK IN -> ticket gelee) + le recu 92% en plan dedie. Pas de plan « quitter » :
# le rush ne contient pas l'approbation finale (dialogue fige), la sortie est racontee
# en voix off. Gel = prolongation par clone de la derniere frame.
CUTS = [
    ("seg01-connect.mp4", 0.0, 19.6, 0.0),   # CLOCK IN -> feuille vault -> registre
    ("seg02-cadran.mp4", 3.0, 12.0, 0.0),    # cadran + horloge + registre
    ("seg03-punch.mp4", 0.0, 21.9, 0.0),     # tap -> feuille Transaction -> empreinte (coupe avant le glitch noir ~22)
    ("seg03-punch.mp4", 22.4, 4.0, 3.5),     # Approuve -> CLOCK IN -> ticket (gele)
    ("seg03b-ticket.mp4", 0.3, 6.5, 0.0),    # carte recu « Tu gardes 92% » (le payoff)
    ("seg04-board.mp4", 0.0, 15.0, 0.0),     # missions payees
    ("seg05-wallet.mp4", 0.0, 17.0, 0.0),    # soldes reels + rangs
    ("seg06-globe.mp4", 0.0, 19.0, 0.0),     # globe physique
    ("seg07-reseau.mp4", 0.0, 22.0, 0.0),    # ping RPC + historique
    ("seg09-explorer.mp4", 0.0, 11.0, 1.5),  # tresor sur l'explorer
]
CARD_TITLE = 4.5
CARD_CLOSE = 9.0
# NB : TOTAL reel calcule apres encodage (les gels prolongent certaines pieces)

# Voix off : (fichier, offset s) — ordre narratif, pas l'ordre des fichiers.
# Timeline v6 (~166 s) : carte 0-4.5 | connect -24.1 | cadran -36.1 | punch 36.1-66
# (vault ~44.4, Approuve ~57.9, CLOCK IN ~61.5, ticket ~62.3) | recu 92% -72.3 |
# board -87.8 | wallet -104.8 | globe -123.8 | reseau -145.6 | explorer -157.8 | cloture -166.3
VO = [
    ("seg01.mp3", 6.0),     # hook 92/3/5 pendant la connexion
    ("seg02.mp3", 26.5),    # « every punch is real » (fin connect + cadran)
    ("seg02b.mp3", 41.5),   # « one tap » pendant le tap + feuille vault
    ("seg02c.mp3", 52.5),   # Approuve -> memo on chain -> CLOCK IN
    ("seg02d.mp3", 62.5),   # le ticket papier + le recu 92% : le payoff
    ("seg03.mp3", 72.5),    # board / missions
    ("seg04.mp3", 88.3),    # wallet / staking
    ("seg05.mp3", 105.3),   # globe / bonjour
    ("seg05b.mp3", 124.8),  # ecran reseau : RPC custom + ping + soldes
    ("seg06.mp3", 137.3),   # les reçus restent lisibles (bridge vers l'explorer)
    ("seg07.mp3", 144.8),   # tout est reel / tresor (sur l'explorer)
    ("seg08.mp3", 155.3),   # « built for CLOCK IN » sur la carte de cloture
]


def run(args, cwd=None):
    r = subprocess.run(args, capture_output=True, cwd=cwd)
    if r.returncode != 0:
        print(r.stderr.decode("utf-8", "replace")[-1200:])
        raise SystemExit("ffmpeg a echoue : " + " ".join(args[:6]))


def probe_dur(path):
    r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True)
    return float(r.stdout.decode().strip())


def base_vf():
    return "scale=1080:2403:flags=lanczos,crop=1080:2400,fps=30,format=yuv420p"


def fades(dur):
    return "fade=t=in:st=0:d=0.4,fade=t=out:st=%.3f:d=0.4" % (dur - 0.4)


ENC = ["-c:v", "libx264", "-crf", "18", "-preset", "medium", "-an"]

print("== Rushs -> pieces normalisees ==")
pieces = []
for i, (name, ss, dur, freeze) in enumerate(CUTS):
    src = os.path.join(RUSH, name)
    avail = probe_dur(src)
    dur = min(dur, max(avail - 0.3, 1.0))
    if freeze:
        dur += freeze
    dst = os.path.join(WORK, "%02d-%s" % (i + 1, name))
    vf = base_vf()
    if freeze:
        vf += ",tpad=stop_mode=clone:stop_duration=%.1f" % freeze
    vf += "," + fades(dur)
    if i == 0:  # overlay 92/3/5 pendant le hook — 8 s seulement (plan de montage)
        vf += (",drawtext=fontfile=%s:text='92 / 3 / 5':fontsize=84:fontcolor=%s"
               ":x=(w-text_w)/2:y=h-330:box=1:boxcolor=black@0.55:boxborderw=20:enable='lt(t,8)'" % (GEORGIA, GOLD))
    if i == len(CUTS) - 1:  # legende sur l'explorer
        vf += (",drawtext=fontfile=%s:text='Treasury — explorer.solana.com (devnet)'"
               ":fontsize=30:fontcolor=%s:x=(w-text_w)/2:y=90:box=1:boxcolor=black@0.5:boxborderw=14"
               % (CONSOLA, CREAM))
    run([FFMPEG, "-y", "-ss", str(ss), "-t", str(dur), "-i", src, "-vf", vf, *ENC, dst], cwd=WORK)
    pieces.append(dst)
    print("  piece %02d : %.1f s" % (i + 1, dur))

print("== Cartes ==")


def card(name, dur, lines):
    vf = base_vf()
    for j, (txt, size, color, font, dy) in enumerate(lines):
        vf += (",drawtext=fontfile=%s:text='%s':fontsize=%d:fontcolor=%s"
               ":x=(w-text_w)/2:y=h*0.30+%d" % (font, txt, size, color, dy))
    vf += "," + fades(dur)
    path = os.path.join(WORK, name)
    run([FFMPEG, "-y", "-f", "lavfi", "-i", "color=c=%s:s=1080x2400:d=%.1f:r=30" % (BG, dur),
         "-vf", vf, *ENC, path], cwd=WORK)
    pieces.append(path)


card("00-title.mp4", CARD_TITLE, [
    ("PUNCH", 230, GOLD, GEORGIA, 0),
    ("Proof of presence. Paid honestly.", 44, CREAM, GEORGIA, 260),
    ("CLOCK IN hackathon - Solana Seeker", 34, DIM, CONSOLA, 340),
])
card("90-close.mp4", CARD_CLOSE, [
    ("PUNCH", 160, GOLD, GEORGIA, 0),
    ("you show up, you get paid", 48, CREAM, GEORGIA, 190),
    ("92 / 3 / 5", 100, GOLD, GEORGIA, 420),
    ("github.com/Azumizeus/punch-clockin", 36, CREAM, CONSOLA, 640),
    ("Signed APK v1.6.6 - see repo releases", 30, DIM, CONSOLA, 710),
])

TOTAL = sum(probe_dur(p) for p in pieces)  # duree reelle (gels inclus)

print("== Concat video ==")


def order(p):
    n = os.path.basename(p)
    return (0 if n.startswith("00-") else 2 if n.startswith("90-") else 1, n)


lst = os.path.join(WORK, "list.txt")
with open(lst, "w", encoding="utf-8") as f:
    for p in sorted(pieces, key=order):
        f.write("file '%s'\n" % p.replace("\\", "/"))
nosound = os.path.join(WORK, "nosound.mp4")
run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", nosound])

print("== Voix off : placement + mix ==")
print("  total video : %.1f s" % TOTAL)
inputs = ["-i", nosound]
filters = []
for i, (vo, off) in enumerate(VO, start=1):
    path = os.path.join(VODIR, vo)
    d = probe_dur(path)
    assert off + d <= TOTAL - 0.5, "VO %s deborde : %.1f+%.1f > %.1f" % (vo, off, d, TOTAL)
    inputs += ["-i", path]
    ms = int(off * 1000)
    filters.append("[%d]adelay=%d|%d[v%d]" % (i, ms, ms, i))
filters.append("".join("[v%d]" % i for i in range(1, len(VO) + 1))
               + "amix=inputs=%d:normalize=0:dropout_transition=0,apad[lv];"
                 "[lv]loudnorm=I=-16:TP=-1.5:LRA=11[aa]" % len(VO))
run([FFMPEG, "-y", *inputs, "-filter_complex", ";".join(filters),
     "-map", "0:v", "-map", "[aa]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
     "-t", str(TOTAL), "-movflags", "+faststart", OUT])

r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration,size",
                    "-of", "csv=p=0", OUT], capture_output=True)
dur, size = r.stdout.decode().strip().split(",")
print("==== OK : %s — %s s, %.1f Mo ====" % (OUT, dur, int(size) / 1e6))
