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

SEGMENTS = [  # seg02b : moment ticket (insert v3)
    ("seg01", "Punch in once a day from a real Seeker phone. A real Solana "
              "transaction proves you showed up — and you get paid. The whole "
              "economy follows one rule, printed everywhere: ninety-two percent "
              "to the person who showed up. Three percent to SKR holders. Five "
              "percent to the app."),
    ("seg02", "Every punch is real. The app opens Seed Vault, you sign a memo "
              "transaction with your own fingerprint, and it lands on devnet in "
              "seconds. No simulation. The explorer proves it."),
    ("seg02b", "One tap. Your fingerprint signs the memo inside Seed Vault, and "
               "seconds later the ticket is on chain — your time, your country, "
               "and the rule printed right on it."),
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
    ("seg06", "And when you're done, you leave honestly. Leaving the network is "
              "a real transaction too: counters decrement, nothing is hidden, "
              "and the receipts stay — one hundred of them, each with its "
              "clickable on-chain signature."),
    ("seg07", "Everything you just saw is a real signed devnet transaction "
              "through Mobile Wallet Adapter and Seed Vault. The treasury is "
              "public: watch the balances move on the explorer while you use "
              "the app."),
    ("seg08", "Built for the Clock In hackathon. One hundred percent native, "
              "signed APK, judge guide in the repo. Show up. Get paid. "
              "Ninety-two, three, five."),
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
