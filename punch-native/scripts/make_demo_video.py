# -*- coding: utf-8 -*-
"""Assemble punch-clockin-demo.mp4 a partir des 8 rushes (PLAN-MONTAGE-DEMO).

Chaine : chaque segment -> piece intermediaire normalisee (1080x2400, 30 fps,
h264 crf18) avec fondu entree/sortie -> concat sans re-encodage -> piste audio
silencieuse + faststart. Les cartes titre/92-3-5/cloture sont generees par
drawtext (fond or/creme du projet, police Georgia/Consola systeme).
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
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # repo root
RUSH = os.path.join(ROOT, "punch-native", "_shots", "demo-v165")
WORK = os.path.join(RUSH, "pieces")
OUT = os.path.join(ROOT, "punch-native", "releases", "punch-clockin-demo.mp4")
import shutil
shutil.rmtree(WORK, ignore_errors=True)
os.makedirs(WORK, exist_ok=True)

GOLD = "0xd4af37"
CREAM = "0xf4ecd8"
DIM = "0x8a7a56"
BG = "0x0a0908"
# Polices copiees dans WORK et referencees par nom nu : un chemin Windows
# (C:/...) casse le parsing du filtergraph, meme avec les ':' echappes.
GEORGIA = "georgia.ttf"
CONSOLA = "consola.ttf"
for fname in (GEORGIA, CONSOLA):
    dst_font = os.path.join(WORK, fname)
    if not os.path.exists(dst_font):
        shutil.copy(os.path.join("C:/Windows/Fonts", fname), dst_font)

SEGS = [  # (rush, duree ffprobe, gel de fin en s)
    ("segB-01-clockin.mp4", 17.230478, 0.0),
    ("segB-02-punch.mp4", 4.538922, 4.0),
    ("segB-03-board.mp4", 6.707400, 0.0),
    # segB-04 (wallet) : remplace par un plan Ken Burns depuis la capture reelle
    # v163-05 (le screenrecord du telephone echouait — stockage plein).
    ("segB-05-globe.mp4", 13.867478, 0.0),
    ("segB-06-hellos.mp4", 6.405689, 0.0),
    ("segB-07-history.mp4", 15.799511, 0.0),
    ("segB-08-final.mp4", 16.658067, 0.0),
]

def run(args, cwd=None):
    r = subprocess.run(args, capture_output=True, cwd=cwd)
    if r.returncode != 0:
        print(r.stderr.decode("utf-8", "replace")[-1200:])
        raise SystemExit("ffmpeg a echoue : " + " ".join(args[:6]))

def esc_font(p):
    return p  # nom nu, plus besoin d'echappement

def base_vf():
    return "scale=1080:2403:flags=lanczos,crop=1080:2400,fps=30,format=yuv420p"

def fades(dur):
    return "fade=t=in:st=0:d=0.4,fade=t=out:st=%.3f:d=0.4" % (dur - 0.4)

ENC = ["-c:v", "libx264", "-crf", "18", "-preset", "medium", "-an"]
ENC_KB = ["-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-an"]

print("== Segments ==")
pieces = []
for i, (name, dur, freeze) in enumerate(SEGS):
    src = os.path.join(RUSH, name)
    dst = os.path.join(WORK, "%02d-%s" % (i + 1, name))
    vf = base_vf()
    total = dur
    if freeze:
        vf += ",tpad=stop_mode=clone:stop_duration=%.1f" % freeze
        total += freeze
    vf += "," + fades(total)
    if i == 0:  # overlay 92/3/5 pendant le hook (plan de montage)
        vf += (",drawtext=fontfile=%s:text='92 / 3 / 5':fontsize=84:fontcolor=%s"
               ":x=(w-text_w)/2:y=h-330:box=1:boxcolor=black@0.55:boxborderw=20" % (esc_font(GEORGIA), GOLD))
    run([FFMPEG, "-y", "-i", src, "-vf", vf, *ENC, dst], cwd=WORK)
    pieces.append(dst)
    print("  piece %02d : %.2f s" % (i + 1, total))

print("== Plan wallet (Ken Burns depuis la capture reelle) ==")
wsrc = os.path.join(ROOT, "punch-native", "_shots", "v163-05-wallet.png")  # _shots/ est un niveau au-dessus de demo-v165/
wdst = os.path.join(WORK, "05-wallet-kenburns.mp4")
wdur = 7.0
wvf = ("scale=1200:2670,"
       "zoompan=z='min(1.0+0.0011*on,1.12)':x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2'"
       ":d=1:s=1080x2403:fps=30,"  # d=1 : l'entree est deja bouclee (-t 7) ; d>1 dupliquerait chaque frame
       "crop=1080:2400,format=yuv420p,") + fades(wdur)
run([FFMPEG, "-y", "-loop", "1", "-t", str(wdur), "-i", wsrc, "-vf", wvf, *ENC_KB, wdst], cwd=WORK)
pieces.append(wdst)
print("  piece wallet : %.1f s" % wdur)

def card(path, dur, lines):
    """Carte sur fond or : lines = [(texte, taille, couleur, font, dy depuis 0.34h)]"""
    vf = base_vf()
    for j, (txt, size, color, font, dy) in enumerate(lines):
        vf += (",drawtext=fontfile=%s:text='%s':fontsize=%d:fontcolor=%s"
               ":x=(w-text_w)/2:y=h*0.34+%d" % (esc_font(font), txt, size, color, dy))
    vf += "," + fades(dur)
    run([FFMPEG, "-y", "-f", "lavfi", "-i", "color=c=%s:s=1080x2400:d=%.1f:r=30" % (BG, dur),
         "-vf", vf, *ENC, path], cwd=WORK)
    pieces.append(path)

print("== Cartes ==")
card(os.path.join(WORK, "00-title.mp4"), 4.5, [
    ("PUNCH", 230, GOLD, GEORGIA, 0),
    ("CLOCK IN hackathon", 46, CREAM, GEORGIA, 260),
    ("Solana Seeker - real devnet transactions", 34, DIM, CONSOLA, 330),
])
card(os.path.join(WORK, "90-close.mp4"), 5.5, [
    ("PUNCH", 160, GOLD, GEORGIA, 0),
    ("you show up, you get paid", 48, CREAM, GEORGIA, 190),
    ("92 / 3 / 5", 100, GOLD, GEORGIA, 420),
    ("github.com/Azumizeus/punch-clockin", 38, CREAM, CONSOLA, 640),
    ("Signed APK v1.6.5 - see repo releases", 30, DIM, CONSOLA, 710),
])

print("== Concat ==")
# Ordre du plan : carte titre, les 8 segments, carte de cloture.
def order(p):
    n = os.path.basename(p)
    return (0 if n.startswith("00-") else 2 if n.startswith("90-") else 1, n)
lst = os.path.join(WORK, "list.txt")
with open(lst, "w", encoding="utf-8") as f:
    for p in sorted(pieces, key=order):
        f.write("file '%s'\n" % p.replace("\\", "/"))
nosound = os.path.join(WORK, "nosound.mp4")
run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", nosound])

print("== Audio silencieux + faststart ==")
run([FFMPEG, "-y", "-i", nosound, "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
     "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", OUT])

# verification
r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration,size",
                    "-of", "csv=p=0", OUT], capture_output=True)
dur, size = r.stdout.decode().strip().split(",")
print("==== OK : %s — %s s, %.1f Mo ====" % (OUT, dur, int(size) / 1e6))
