# -*- coding: utf-8 -*-
"""Genere punch-clockin-demo.srt : sous-titres EN depuis la voix off.

Meme table que make_demo_video_v2.py (textes make_vo.py + offsets montage).
Chaque segment est decoupe en lignes <= 46 chars, ~2 lignes / carte, duree
proportionnelle au poids des lignes. Le SRT sert au burn-in (make_subs_burn.py)
et sera join a la release GitHub.
"""
import os
import subprocess
import sys

sys.stdout.reconfigure(errors="replace")

FFPROBE = os.path.join(os.environ["LOCALAPPDATA"], "Microsoft", "WinGet", "Packages",
                       "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
                       "ffmpeg-9.0.1-full_build", "bin", "ffprobe.exe")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "punch-native", "_shots", "demo-v166", "vo", "punch-clockin-demo.srt")

# (fichier vo/, offset s, texte) — identique a la table VO de make_demo_video_v2.py
SEGS = [
    ("seg01.mp3", 6.0, "Punch in once a day from a real Seeker phone. A real Solana transaction "
          "proves you showed up — and you get paid. The whole economy follows one rule, "
          "printed everywhere: ninety-two percent to the person who showed up. "
          "Three percent to SKR holders. Five percent to the app."),
    ("seg02.mp3", 26.5, "Every punch is real. The app opens Seed Vault, you sign a memo transaction "
           "with your own fingerprint, and it lands on devnet in seconds. No simulation. "
           "The explorer proves it."),
    ("seg02b.mp3", 41.5, "One tap. No forms, no manager, nothing to trust — the app asks the chain "
           "to record that you showed up."),
    ("seg02c.mp3", 52.5, "Approve once — and the memo lands on devnet. Your time is now a fact on chain."),
    ("seg02d.mp3", 62.5, "And there it is: the split, printed on every receipt. Ninety-two, three, five."),
    ("seg03.mp3", 72.5, "Being here unlocks work. The Board lists small paid gigs nearby: confirm a "
           "place is open, leave an honest review, scan a code. Take a job, and the "
           "treasury pays you in USDC — a real transfer, every time."),
    ("seg04.mp3", 88.3, "The wallet holds real balances: USDC, USDT, and SKR. Stake SKR to climb the "
           "ranks — Silver, Gold, Guardian — and reach the better-paid jobs first. "
           "Real utility, zero new supply."),
    ("seg05.mp3", 105.3, "And this is a clock, for the whole world. A real drag-physics globe: every "
            "punch on the planet drops a live dot. Say hi to a Seeker nearby — it pays "
            "you both ten cents. A social gesture, turned into a real micro-transaction."),
    ("seg05b.mp3", 124.8, "The network screen is honest too - point a custom RPC anywhere, watch the "
            "live ping, and read the balances pulled straight from the chain. "
            "No mockups anywhere."),
    ("seg06.mp3", 137.3, "And the receipts stay. Every job, every payout — each with its clickable "
            "on-chain signature."),
    ("seg07.mp3", 144.8, "Everything you just saw is real: signed devnet transactions through Seed "
            "Vault. The treasury is public — watch it move on the explorer."),
    ("seg08.mp3", 155.3, "Built for the Clock In hackathon. One hundred percent native, signed APK, "
            "judge guide in the repo."),
]

MAX_CHARS = 46


def split_lines(text):
    """Decoupe en cartes de <= 2 lignes de <= MAX_CHARS."""
    words = text.split()
    lines, cur = [], ""
    for w in words:
        if len(cur) + len(w) + 1 > MAX_CHARS and cur:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        lines.append(cur)
    # regroupe 2 lignes par carte
    cards = []
    for i in range(0, len(lines), 2):
        cards.append(lines[i:i + 2])
    return cards


def fmt(t):
    h = int(t // 3600)
    m = int(t % 3600 // 60)
    s = int(t % 60)
    ms = int(round((t - int(t)) * 1000))
    if ms == 1000:
        s += 1
        ms = 0
    return "%02d:%02d:%02d,%03d" % (h, m, s, ms)


def probe_dur(path):
    r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True)
    return float(r.stdout.decode().strip())


out = []
n = 0
VODIR = os.path.dirname(OUT)
for fname, off, text in SEGS:
    dur = probe_dur(os.path.join(VODIR, fname))  # duree reelle de la voix
    cards = split_lines(text)
    # duree du segment : la vraie duree mp3, relue par ffprobe
    card_dur = dur / len(cards)
    t = off
    for card in cards:
        n += 1
        out.append("%d\n%s --> %s\n%s\n" % (n, fmt(t), fmt(t + card_dur - 0.08), "\n".join(card)))
        t += card_dur

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(out))
print("OK : %d cartes -> %s" % (n, OUT))
