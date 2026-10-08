# -*- coding: utf-8 -*-
"""Genere punch-clockin-demo-{fr,en}.srt : sous-titres depuis la voix off v169.

Meme table que make_demo_video_v169.py (textes docs/SCRIPT-VIDEO.md + offsets
calcules sur la timeline). Chaque segment est decoupe en cartes de 2 lignes.
Usage : python make_subs_v169.py fr|en
"""
import os
import subprocess
import sys

sys.stdout.reconfigure(errors="replace")

FFPROBE = os.path.join(os.environ["LOCALAPPDATA"], "Microsoft", "WinGet", "Packages",
                       "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
                       "ffmpeg-9.0.1-full_build", "bin", "ffprobe.exe")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LANG = (sys.argv[1] if len(sys.argv) > 1 else "en").lower()
if LANG not in ("fr", "en"):
    raise SystemExit("usage : python make_subs_v169.py fr|en")
RUSH = os.path.join(ROOT, "punch-native", "_shots", "demo-v169-" + LANG)
VODIR = os.path.join(RUSH, "vo")
OUT = os.path.join(VODIR, "punch-clockin-demo-%s.srt" % LANG)
FINAL = os.path.join(ROOT, "punch-native", "releases", "punch-clockin-demo-%s.mp4" % LANG)

# Rappel du montage v169 : titre 4.5 | cuts v169 (8 plans) | cloture 9.0
# Les offsets sont relus depuis le reel : on reutilise les memes CALCULS que
# make_demo_video_v169.py — repete ici en dur apres un montage (les durees sont
# stables, rushs figes).
CUTS = [
    ("seg-00-connect.mp4", 26.0), ("seg-01-punch.mp4", 26.0), ("seg-02-jobs.mp4", 16.0),
    ("seg-03-money.mp4", 17.0), ("seg-04-world.mp4", 14.0), ("seg-05-hellos.mp4", 13.0),
    ("seg-07-settings.mp4", 15.0), ("seg-08-arc.mp4", 18.0),
]
CARD_TITLE = 4.5
CARD_CLOSE = 9.0

TEXTS = {
    "en": {
        "hook": "Every 'proof of presence' app on crypto is fake in one of two ways: "
                "the check-in isn't verified, or the money split is hidden. PUNCH fixes "
                "both — with a real phone, a real transaction, and one rule printed on "
                "every receipt: 92 to the person who showed up, 3 to SKR holders, 5 to the app.",
        "punch": "I'm on a Solana Seeker. I tap the bolt. Seed Vault asks for my signature — "
                 "this is a real memo transaction on devnet, not a script. It confirms "
                 "on-chain in seconds, and I get a paper ticket: time, country, the 92/3/5 "
                 "rule, and an on-chain stamp. You can check every signature on the devnet "
                 "explorer — the treasury address is printed in the repo.",
        "board": "Because presence is proven, it pays. Here's the job board: real gigs "
                 "nearby, paid in USDC and USDT. When I take a job and complete it, the "
                 "treasury sends my share — a real SPL transfer, visible on the explorer. "
                 "And if I'd rather pay someone to do a job for me, I lock real funds "
                 "from my own wallet.",
        "globe": "SKR holders stake to get earlier access to better-paid jobs — real "
                 "utility, no new supply printed. Staking and unstaking are real transfers "
                 "too, with an honest 1.5% protocol fee. And this globe? Real drag physics, "
                 "and every punch in the world drops a live dot. Saying hi to a nearby "
                 "Seeker pays both of us ten cents — a real transaction for a social gesture.",
        "honesty": "One thing we're proud of: leaving the network is a real signed "
                   "transaction that honestly decrements the shared counters — crew online, "
                   "world map. No fake numbers quietly edited in local storage, anywhere in "
                   "the app. What you see is what's on chain.",
        "close": "PUNCH — you show up, you get paid, 92/3/5. Source code, judge guide and "
                 "signed APK are in the GitHub repo. Built for CLOCK IN.",
    },
    "fr": {
        "hook": "Toutes les applis « preuve de présence » en crypto sont fausses d'une des "
                "deux façons : le pointage n'est pas vérifié, ou la répartition de l'argent "
                "est cachée. PUNCH corrige les deux — avec un vrai téléphone, une vraie "
                "transaction, et une règle imprimée sur chaque reçu : 92 à la personne qui "
                "s'est présentée, 3 aux détenteurs de SKR, 5 à l'app.",
        "punch": "Je suis sur un Solana Seeker. Je tape le bolt. Seed Vault demande ma "
                 "signature — c'est une vraie transaction mémo sur devnet, pas un script. "
                 "Elle se confirme on-chain en quelques secondes, et je reçois un ticket "
                 "papier : heure, pays, la règle 92/3/5, et un tampon on-chain. Chaque "
                 "signature est vérifiable sur l'explorer devnet — l'adresse du trésor "
                 "est dans le repo.",
        "board": "Parce que la présence est prouvée, elle paie. Voici le tableau des "
                 "missions : de vrais gigs à proximité, payés en USDC et USDT. Quand je "
                 "prends une mission et la termine, le trésor m'envoie ma part — un vrai "
                 "transfert SPL, visible sur l'explorer. Et si je préfère payer quelqu'un "
                 "pour faire une mission à ma place, je bloque de vrais fonds depuis mon wallet.",
        "globe": "Les détenteurs de SKR misent pour accéder en premier aux missions les "
                 "mieux payées — une vraie utilité, sans imprimer de nouvelle offre. Miser "
                 "et retirer sont de vrais transferts aussi, avec des frais protocole "
                 "honnêtes de 1,5 %. Et ce globe ? Une vraie physique de glissement, et "
                 "chaque pointage dans le monde ajoute un point en direct. Dire bonjour à "
                 "un Seeker à côté nous paie dix centimes chacun — une vraie transaction "
                 "pour un geste social.",
        "honesty": "Un truc dont on est fiers : quitter le réseau est une vraie transaction "
                   "signée qui décrémente honnêtement les compteurs partagés — crew en "
                   "ligne, carte du monde. Aucun faux chiffre modifié en douce dans le "
                   "stockage local, nulle part dans l'app. Ce que tu vois, c'est ce qui "
                   "est on-chain.",
        "close": "PUNCH — tu te présentes, tu es payé, 92/3/5. Code source, guide jury et "
                 "APK signé sont dans le repo GitHub. Built for CLOCK IN.",
    },
}[LANG]

ORDER = ["hook", "punch", "board", "globe", "honesty", "close"]
# Reconstruit la timeline (identique a make_demo_video_v169.py) puis cascade
# : hook @0.8, chaque voix apres la precedente +0.3 s (cf. script de montage).
def probe_dur(path):
    r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True)
    return float(r.stdout.decode().strip())


offsets = []
t = CARD_TITLE
for name, dur in CUTS:
    offsets.append(t)
    t += dur
CLOSE_START = t
PLAN_AT = {"punch": offsets[0], "board": offsets[2], "globe": offsets[4],
           "honesty": offsets[6], "close": CLOSE_START}
VO_OFF = {"hook": 0.8}
for prev, key in zip(ORDER, ORDER[1:]):
    d_prev = probe_dur(os.path.join(VODIR, prev + ".mp3"))
    VO_OFF[key] = max(PLAN_AT[key], VO_OFF[prev] + d_prev + 0.3)

MAX_CHARS = 46


def split_lines(text):
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


out = []
n = 0
for key in ORDER:
    dur = probe_dur(os.path.join(VODIR, key + ".mp3"))
    cards = split_lines(TEXTS[key])
    card_dur = dur / len(cards)
    t = VO_OFF[key]
    for card in cards:
        n += 1
        out.append("%d\n%s --> %s\n%s\n" % (n, fmt(t), fmt(t + card_dur - 0.08), "\n".join(card)))
        t += card_dur

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(out))
print("OK : %d cartes -> %s" % (n, OUT))
