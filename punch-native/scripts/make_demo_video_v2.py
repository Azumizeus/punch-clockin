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

# (rush, ss, dur, gel) — coupes calibrees ~3:10. Gel = prolongation par clone
# de la derniere frame (le rush ticket est court : ~7 s reel pour 11 s voulus).
CUTS = [
    ("seg01-connect.mp4", 0.0, 19.6, 0.0),  # CLOCK IN -> feuille vault -> registre
    ("seg02-cadran.mp4", 3.0, 12.0, 0.0),   # cadran + horloge + registre
    ("seg03-punch.mp4", 0.0, 25.0, 0.0),    # cadran -> feuille Transaction -> signature
    ("seg03b-ticket.mp4", 0.0, 7.0, 4.0),   # le ticket papier (prolonge par gel)
    ("seg04-board.mp4", 0.0, 15.0, 0.0),    # missions payees
    ("seg05-wallet.mp4", 0.0, 17.0, 0.0),   # soldes reels + rangs
    ("seg06-globe.mp4", 0.0, 19.0, 0.0),    # globe physique
    ("seg07-reseau.mp4", 0.0, 22.0, 0.0),   # ping RPC + historique
    ("seg08-leave.mp4", 0.0, 28.0, 0.0),    # quitter le reseau (signe) -> CLOCK IN final
    ("seg09-explorer.mp4", 0.0, 11.0, 0.0), # tresor sur l'explorer
]
CARD_TITLE = 4.5
CARD_CLOSE = 6.0
TOTAL = CARD_TITLE + sum(c[2] for c in CUTS) + CARD_CLOSE

# Voix off : (fichier, offset s) — ordre narratif, pas l'ordre des fichiers.
# Timeline : carte 0-4.5 | connect 4.5-24.1 | cadran -36.1 | punch -61.1 |
# ticket -72.1 | board -87.1 | wallet -104.1 | globe -123.1 | reseau -145.1 |
# leave -173.1 | explorer -184.1 | cloture -190.1
VO = [
    ("seg01.mp3", 6.0),     # hook 92/3/5 pendant la connexion
    ("seg02.mp3", 27.0),    # « every punch is real » (fin connect + debut punch)
    ("seg02b.mp3", 47.0),   # le moment vault/ticket
    ("seg03.mp3", 73.0),    # board / missions
    ("seg04.mp3", 88.0),    # wallet / staking
    ("seg05.mp3", 105.0),   # globe / bonjour
    ("seg06.mp3", 143.0),   # quitter honnetement + historique
    ("seg08.mp3", 160.0),   # « built for CLOCK IN » sur l'ecran final
    ("seg07.mp3", 172.0),   # tout est reel / tresor (sur l'explorer)
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
    if i == 0:  # overlay 92/3/5 pendant le hook
        vf += (",drawtext=fontfile=%s:text='92 / 3 / 5':fontsize=84:fontcolor=%s"
               ":x=(w-text_w)/2:y=h-330:box=1:boxcolor=black@0.55:boxborderw=20" % (GEORGIA, GOLD))
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
