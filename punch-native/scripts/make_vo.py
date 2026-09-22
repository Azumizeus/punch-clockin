# -*- coding: utf-8 -*-
"""Genere les 9 segments de voix off EN (edge-tts, voix en-US-AndrewNeural).

Sortie : punch-native/_shots/demo-v166/vo/segXX.mp3 (+ durees affichees pour
caler le montage). Textes : docs/SCRIPT-VIDEO.md (voix off EN mot pour mot).
"""
import asyncio
import os
import subprocess
import sys

import edge_tts

sys.stdout.reconfigure(errors="replace")

FFPROBE = os.path.join(os.environ["LOCALAPPDATA"], "Microsoft", "WinGet", "Packages",
                       "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
                       "ffmpeg-9.0.1-full_build", "bin", "ffprobe.exe")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "punch-native", "_shots", "demo-v166", "vo")
os.makedirs(OUT, exist_ok=True)

VOICE = "en-US-AndrewNeural"
RATE = "-4%"

SEGMENTS = [  # seg02b/seg02d/seg06 reecrits (montage v6) ; seg02d = nouveau (ticket papier)
    ("seg01", "Punch in once a day from a real Seeker phone. A real Solana "
              "transaction proves you showed up — and you get paid. The whole "
              "economy follows one rule, printed everywhere: ninety-two percent "
              "to the person who showed up. Three percent to SKR holders. Five "
              "percent to the app."),
    ("seg02", "Every punch is real. The app opens Seed Vault, you sign a memo "
              "transaction with your own fingerprint, and it lands on devnet in "
              "seconds. No simulation. The explorer proves it."),
    ("seg02b", "One tap. No forms, no manager, nothing to trust — the app asks "
               "the chain to record that you showed up."),
    ("seg02c", "Approve once — and the memo lands on devnet. Your time is now "
               "a fact on chain."),
    ("seg02d", "And there it is: the split, printed on every receipt. "
               "Ninety-two, three, five."),
    ("seg03", "Being here unlocks work. The Board lists small paid gigs nearby: "
              "confirm a place is open, leave an honest review, scan a code. "
              "Take a job, and the treasury pays you in USDC — a real transfer, "
              "every time."),
    ("seg04", "The wallet holds real balances: USDC, USDT, and SKR. Stake SKR "
              "to climb the ranks — Silver, Gold, Guardian — and reach the "
              "better-paid jobs first. Real utility, zero new supply."),
    ("seg05", "And this is a clock, for the whole world. A real drag-physics "
              "globe: every punch on the planet drops a live dot. Say hi to a "
              "Seeker nearby — it pays you both ten cents. A social gesture, "
              "turned into a real micro-transaction."),
    ("seg05b", "The network screen is honest too - point a custom RPC anywhere, "
               "watch the live ping, and read the balances pulled straight from "
               "the chain. No mockups anywhere."),
    ("seg06", "And the receipts stay. Every job, every payout — each with its "
              "clickable on-chain signature."),
    ("seg07", "Everything you just saw is real: signed devnet transactions "
              "through Seed Vault. The treasury is public — watch it move on "
              "the explorer."),
    ("seg06b", "Approve - and the network simply lets you go. No lock-in, no "
               "penalty. Your time stays yours. That is the whole point."),
    ("seg08", "Built for the Clock In hackathon. One hundred percent native, "
              "signed APK, judge guide in the repo."),
]


async def gen(seg, text):
    dst = os.path.join(OUT, seg + ".mp3")
    tts = edge_tts.Communicate(text, VOICE, rate=RATE)
    await tts.save(dst)
    return dst


async def main():
    for seg, text in SEGMENTS:
        dst = await gen(seg, text)
        r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                            "-of", "csv=p=0", dst], capture_output=True)
        dur = float(r.stdout.decode().strip())
        print("%s : %.2f s — %s" % (seg, dur, os.path.getsize(dst) // 1024), "Ko")


if __name__ == "__main__":
    asyncio.run(main())
