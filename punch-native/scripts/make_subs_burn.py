# -*- coding: utf-8 -*-
"""Incruste les sous-titres EN dans la video demo (burn-in).

Entree : punch-native/releases/punch-clockin-demo.mp4 + vo/punch-clockin-demo.srt
Sortie : punch-native/releases/punch-clockin-demo-sub.mp4
Style : blanc, contour noir epais (lisible sur l'app sombre ET les cartes cremes),
Georgia gras, bas d'ecran au-dessus de la barre d'onglets. Audio copie sans
re-encodage, -movflags +faststart pour le streaming.
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
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FINAL = os.path.join(ROOT, "punch-native", "releases", "punch-clockin-demo.mp4")
SRT = os.path.join(ROOT, "punch-native", "_shots", "demo-v166", "vo", "punch-clockin-demo.srt")
OUT = os.path.join(ROOT, "punch-native", "releases", "punch-clockin-demo-sub.mp4")

# force_style : l'ASS genere du SRT a une base PlayResY=288 -> 1 unite = 8.33 px reels
STYLE = ("FontName=Georgia,Bold=1,Fontsize=6,PrimaryColour=&H00FFFFFF,"
         "OutlineColour=&H00000000,BackColour=&H80000000,BorderStyle=1,"
         "Outline=1.1,Shadow=0.6,Alignment=2,MarginV=20,Spacing=0.2")

sub = "subtitles=filename='%s':force_style='%s'" % (
    SRT.replace("\\", "/").replace(":", "\\:").replace("'", "\\'"), STYLE)

r = subprocess.run([FFMPEG, "-y", "-i", FINAL, "-vf", sub,
                    "-c:v", "libx264", "-crf", "20", "-preset", "medium",
                    "-c:a", "copy", "-movflags", "+faststart", OUT],
                   capture_output=True)
if r.returncode != 0:
    print(r.stderr.decode("utf-8", "replace")[-1500:])
    raise SystemExit("burn-in echoue")

probe = subprocess.run([os.path.join(FFDIR, "ffprobe.exe"), "-v", "error",
                        "-show_entries", "format=duration,size", "-of", "csv=p=0", OUT],
                       capture_output=True)
dur, size = probe.stdout.decode().strip().split(",")
print("==== OK : %s — %s s, %.1f Mo ====" % (OUT, dur, int(size) / 1e6))
