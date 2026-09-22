# -*- coding: utf-8 -*-
"""Revue plan par plan de punch-clockin-demo.mp4.

1) Frontieres des plans : relevees sur les pieces encodees (pieces/, reconstruites
   a chaque run de make_demo_video_v2.py).
2) Scan numerique du final : 1 frame / 1.5 s -> luminosite moyenne, % pixels
   satures (launcher), % or (app). Audio : RMS par fenetre de 1 s -> silences.
3) Planches : 3 frames par plan, 2 moities A/B (jpg + html) pour revue visuelle.

Sorties : _review/ (a la racine du repo, fichiers temporaires).
"""
import os
import subprocess
import sys

sys.stdout.reconfigure(errors="replace")
try:
    import numpy as np
except ImportError:
    np = None
from PIL import Image

FFDIR = os.path.join(os.environ["LOCALAPPDATA"], "Microsoft", "WinGet", "Packages",
                     "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
                     "ffmpeg-9.0.1-full_build", "bin")
FFMPEG = os.path.join(FFDIR, "ffmpeg.exe")
FFPROBE = os.path.join(FFDIR, "ffprobe.exe")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FINAL = os.path.join(ROOT, "punch-native", "releases", "punch-clockin-demo.mp4")
PIECES = os.path.join(ROOT, "punch-native", "_shots", "demo-v166", "pieces")
OUTDIR = os.path.join(ROOT, "_review")
os.makedirs(OUTDIR, exist_ok=True)

LABELS = {
    "00-title": "CARTE TITRE",
    "01-seg01-connect": "1. CONNEXION Seed Vault",
    "02-seg02-cadran": "2. CADRAN + registre",
    "03-seg03-punch": "3. PUNCH (tap -> feuille -> empreinte)",
    "04-seg03-punch": "4. APPROUVE -> CLOCK IN -> ticket",
    "05-seg03b-ticket": "5. RECQU 92%",
    "06-seg04-board": "6. BOARD missions",
    "07-seg05-wallet": "7. WALLET soldes/rangs",
    "08-seg06-globe": "8. GLOBE",
    "09-seg07-reseau": "9. RESEAU ping RPC",
    "10-seg09-explorer": "10. EXPLORER tresor",
    "90-close": "CARTE CLOTURE",
}

NAMES = {
    "00-title": "carte titre",
    "01-seg01-connect": "connexion",
    "02-seg02-cadran": "cadran",
    "03-seg03-punch": "punch A (feuille)",
    "04-seg03-punch": "punch B (approuve/ticket)",
    "05-seg03b-ticket": "recu 92%",
    "06-seg04-board": "board",
    "07-seg05-wallet": "wallet",
    "08-seg06-globe": "globe",
    "09-seg07-reseau": "reseau",
    "10-seg09-explorer": "explorer",
    "90-close": "carte cloture",
}


def probe_dur(path):
    r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True)
    return float(r.stdout.decode().strip())


def frame_stats(path):
    im = Image.open(path).convert("RGB").resize((108, 240))
    a = np.asarray(im, dtype=np.float32)
    lum = a.mean(axis=2)
    mx = a.max(axis=2)
    mn = a.min(axis=2)
    sat = ((mx - mn) > 60) & (mx > 120)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    gold = (r > 130) & (g > 90) & (g < 200) & (b < 110) & (r > b + 50)
    return lum.mean(), sat.mean() * 100, gold.mean() * 100


def grab(path, t, dst):
    subprocess.run([FFMPEG, "-y", "-v", "error", "-ss", str(t), "-i", path,
                    "-frames:v", "1", dst], capture_output=True)
    return os.path.exists(dst) and os.path.getsize(dst) > 0


# ---- 1) frontieres ----
print("== Plans (frontieres relevees sur les pieces) ==")
pieces = [n for n in sorted(os.listdir(PIECES))
          if n.endswith(".mp4") and not n.startswith("nosound")]
key = lambda n: (0 if n.startswith("00-") else 2 if n.startswith("90-") else 1, n)
pieces.sort(key=key)
plans = []
t0 = 0.0
for n in pieces:
    d = probe_dur(os.path.join(PIECES, n))
    slug = n[: n.rfind(".")]
    label = NAMES.get(slug, slug)
    plans.append((slug, label, t0, t0 + d))
    t0 += d
TOTAL = t0
for slug, label, a, b in plans:
    print("  %6.1f -> %6.1f  %s" % (a, b, label))
print("  TOTAL %.1f s | final sur disque : %.1f s" % (TOTAL, probe_dur(FINAL)))

# ---- 2) scan numerique ----
print("== Scan video (1 frame / 1.5 s) ==")
alerts = []
samples = []
t = 0.5
while t < TOTAL - 0.3:
    dst = os.path.join(OUTDIR, "_scan.jpg")
    if grab(FINAL, t, dst):
        lum, sat, gold = frame_stats(dst)
        plan = next((p for p in plans if p[2] <= t < p[3]), ("?", "?", 0, TOTAL))
        samples.append((t, plan[1], lum, sat, gold))
        tag = None
        if lum < 6:
            tag = "NOIR"
        elif sat > 12:
            tag = "LAUNCHER?"
        if tag:
            alerts.append((t, plan[1], tag, "%.0f/%.0f/%.0f" % (lum, sat, gold)))
    t += 1.5
for row in samples:
    pass
print("  %d frames scannees, %d alertes" % (len(samples), len(alerts)))
for a in alerts:
    print("    t=%5.1f [%s] %s (%s)" % a)

print("== Scan audio (RMS / s) ==")
raw = os.path.join(OUTDIR, "_audio.raw")
subprocess.run([FFMPEG, "-y", "-v", "error", "-i", FINAL, "-map", "0:a",
                "-ac", "1", "-ar", "8000", "-f", "s16le", raw], capture_output=True)
pcm = np.frombuffer(open(raw, "rb").read(), dtype=np.int16).astype(np.float32) / 32768.0
sr = 8000
sil = []
cur = None
for i in range(0, len(pcm) - sr, sr):
    rms = float(np.sqrt((pcm[i:i + sr] ** 2).mean())) * 100
    db = 20 * np.log10(max(rms, 1e-6))
    s = i / sr
    if db < -55:
        if cur is None:
            cur = s
    else:
        if cur is not None and s - cur > 3.0:
            plan = next((p for p in plans if p[2] <= cur < p[3]), ("?",))
            sil.append((cur, s, plan[1]))
        cur = None
if cur is not None and TOTAL - cur > 3.0:
    plan = next((p for p in plans if p[2] <= cur < p[3]), ("?",))
    sil.append((cur, TOTAL, plan[1]))
print("  %d silences > 3 s :" % len(sil))
for a, b, p in sil:
    print("    %5.1f -> %5.1f s (%s)" % (a, b, p))

# ---- 3) planches ----
print("== Planches (3 frames / plan) ==")
W = 200  # largeur d'une frame ; 3 cote a cote par plan
rows = []
for slug, label, a, b in plans:
    d = b - a
    ts = [a + d * f for f in (0.15, 0.5, 0.85)]
    if slug == "04-seg03-punch":
        ts = [a + 0.8, a + (b - a) * 0.5, b - 1.0]
    cells = []
    for tt in ts:
        dst = os.path.join(OUTDIR, "_c.jpg")
        if grab(FINAL, min(tt, TOTAL - 0.5), dst):
            im = Image.open(dst).convert("RGB").resize((W, int(W * 2400 / 1080)))
            cells.append((im, tt))
    rows.append((slug, label, a, cells))

half = (len(rows) + 1) // 2
import base64
from PIL import ImageDraw
for part, group in (("A", rows[:half]), ("B", rows[half:])):
    FH = int(W * 2400 / 1080)
    LW = 34
    H = sum(LW + FH + 14 for _ in group) + 20
    sheet = Image.new("RGB", (W * 3 + 40, H + 10), (18, 16, 12))
    draw = ImageDraw.Draw(sheet)
    y = 8
    for slug, label, a, cells in group:
        draw.text((10, y + 4), "%s  %s  (t=%.0f s)" % (slug.split("-")[0], label, a),
                  fill=(230, 200, 120))
        y += LW
        x = 14
        for im, tt in cells:
            sheet.paste(im, (x, y))
            draw.text((x + 4, y + 4), "%.1f" % tt, fill=(255, 255, 255))
            x += W + 6
        y += FH + 14
    jp = os.path.join(OUTDIR, "planche-%s.jpg" % part)
    sheet.save(jp, quality=85)
    b64 = base64.b64encode(open(jp, "rb").read()).decode()
    open(os.path.join(OUTDIR, "planche-%s.html" % part), "w").write(
        "<!doctype html><meta charset='utf-8'><body style='margin:0;background:#111'>"
        "<img style='display:block;max-width:100%%' src='data:image/jpeg;base64,%s'>" % b64)
    print("  planche-%s : %d plans" % (part, len(group)))
print("OK ->", OUTDIR)
