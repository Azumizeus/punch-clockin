# -*- coding: utf-8 -*-
"""Montage v3 de punch-clockin-demo-{fr,en}.mp4 : rushs demo-v169 (sans relief 3D).

Chaine reprise de make_demo_video_v2.py, parametree par langue :
  rushs demo-v169-{fr,en} -> coupe -> normalise 1080x2400 30fps h264 crf18,
  fondus -> cartes titre/cloture drawtext (or/creme) -> concat -> voix off
  edge-tts (EN en-US-AndrewNeural / FR fr-FR-HenriNeural, textes mot pour mot
  de docs/SCRIPT-VIDEO.md) mixees a l'offset -> fichier final.
Sous-titres : make_subs_v169.py (meme table).

Usage :
    python make_demo_video_v169.py en   # montage EN
    python make_demo_video_v169.py fr   # montage FR
"""
import asyncio
import os
import shutil
import subprocess
import sys

import edge_tts

sys.stdout.reconfigure(errors="replace")

FFDIR = os.path.join(os.environ["LOCALAPPDATA"], "Microsoft", "WinGet", "Packages",
                     "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
                     "ffmpeg-9.0.1-full_build", "bin")
FFMPEG = os.path.join(FFDIR, "ffmpeg.exe")
FFPROBE = os.path.join(FFDIR, "ffprobe.exe")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LANG = (sys.argv[1] if len(sys.argv) > 1 else "en").lower()
if LANG not in ("fr", "en"):
    raise SystemExit("usage : python make_demo_video_v169.py fr|en")
RUSH = os.path.join(ROOT, "punch-native", "_shots", "demo-v169-" + LANG)
VODIR = os.path.join(RUSH, "vo")
WORK = os.path.join(RUSH, "pieces")
OUT = os.path.join(ROOT, "punch-native", "releases", "punch-clockin-demo-%s.mp4" % LANG)
os.makedirs(VODIR, exist_ok=True)
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

VOICE, VO_RATE = {"en": ("en-US-AndrewNeural", "-4%"), "fr": ("fr-FR-HenriNeural", "-4%")}[LANG]

# Textes VO mot pour mot depuis docs/SCRIPT-VIDEO.md — 1 segment par bloc.
# La passe demo-v169 ne contient pas de plan explorer dedie : les blocs
# « explorer / leave the network » sont racontes en VO sur le plan seg-07
# (reglages = preuve RPC reseau on-chain) puis la cloture.
SCRIPT = {
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

# Texte PARLE : les symboles « 92/3/5 » sont lus litteralement par edge-tts
# (« quatre-vingt-douze barre trois... ») — on dictte les nombres en toutes
# lettres. Les sous-titres (make_subs_v169.py) gardent l'affichage « 92/3/5 ».
SPOKEN_9235 = {"fr": "quatre-vingt-douze, trois, cinq", "en": "ninety-two, three, five"}
TTS_TEXT = {k: v.replace("92/3/5", SPOKEN_9235[LANG]) for k, v in SCRIPT.items()}
# Prononciation FR : edge-tts lit mal certains mots techniques.
if LANG == "fr":
    TTS_TEXT = {k: v.replace("l'app", "l'application")
                   .replace("L'app", "L'application")
                   .replace("explorer", "explorateur")
                   .replace("Explorer", "Explorateur")
                   .replace("Seeker", "Siiker")  # prononce "si-ker", pas "seker"
                for k, v in TTS_TEXT.items()}

# ------------------------------------------------------------------- rushs
# (rush, ss, dur, gel) — rushs demo-v169 (1200x2670 -> normalise 1080x2400).
# Pas de plan explorer dedie : seg-08 sert de plan « reseau/quitter ».
CUTS = [
    ("seg-00-connect.mp4", 0.0, 26.0, 0.0),   # CLOCK IN -> feuille vault -> signature
    ("seg-01-punch.mp4", 0.0, 24.0, 2.0),     # tap -> feuille -> empreinte -> ticket
    ("seg-02-jobs.mp4", 0.0, 16.0, 0.0),      # board missions
    ("seg-03-money.mp4", 0.0, 17.0, 0.0),     # wallet soldes
    ("seg-04-world.mp4", 0.0, 14.0, 0.0),     # globe
    ("seg-05-hellos.mp4", 0.0, 12.0, 1.0),    # say hi -> paye (10 cents)
    ("seg-07-settings.mp4", 0.0, 15.0, 0.0),  # reglages : reseau on-chain
    ("seg-08-arc.mp4", 0.0, 18.0, 0.0),       # quitter le reseau (sortie signee)
]
CARD_TITLE = 4.5
CARD_CLOSE = 13.5   # la VO close fait 12.5 s — carte prolongee
# Gel supplementaire : rushs courts (jobs/wallet) — la VO board (22.8 s) doit
# tenir dans la fenetre plans 03+04 (sinon chevauchement de voix).
FREEZE_EXTRA = {3: 9.0}

ENC = ["-c:v", "libx264", "-crf", "18", "-preset", "medium", "-an"]


def run(args, cwd=None):
    r = subprocess.run(args, capture_output=True, cwd=cwd)
    if r.returncode != 0:
        print(r.stderr.decode("utf-8", "replace")[-1200:])
        raise SystemExit("ffmpeg a echoue : " + " ".join(args[:6]))


def probe_dur(path):
    r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True)
    return float(r.stdout.decode().strip())


async def gen_vo():
    print("== Voix off (%s) ==" % VOICE)
    for seg, text in TTS_TEXT.items():
        dst = os.path.join(VODIR, seg + ".mp3")
        tts = edge_tts.Communicate(text, VOICE, rate=VO_RATE)
        await tts.save(dst)
        print("  %s : %.1f s" % (seg, probe_dur(dst)))


def base_vf():
    return "scale=1080:2403:flags=lanczos,crop=1080:2400,fps=30,format=yuv420p"


def fades(dur):
    return "fade=t=in:st=0:d=0.4,fade=t=out:st=%.3f:d=0.4" % (dur - 0.4)


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


asyncio.run(gen_vo())

print("== Rushs -> pieces normalisees ==")
pieces = []
offsets = []
slot_durs = []
t = CARD_TITLE  # la VO hook commence apres la carte titre
for i, (name, ss, dur, freeze) in enumerate(CUTS):
    freeze = freeze + FREEZE_EXTRA.get(i, 0)
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
    if i == 1:  # legende 92/3/5 sur le plan ticket (payoff)
        vf += (",drawtext=fontfile=%s:text='92 / 3 / 5':fontsize=84:fontcolor=%s"
               ":x=(w-text_w)/2:y=h-330:box=1:boxcolor=black@0.55:boxborderw=20"
               ":enable='lt(t,8)'" % (GEORGIA, GOLD))
    if i == len(CUTS) - 1:  # legende reseau sur l'arc quitter
        vf += (",drawtext=fontfile=%s:text='Everything on chain — devnet'"
               ":fontsize=30:fontcolor=%s:x=(w-text_w)/2:y=90:box=1:boxcolor=black@0.5"
               ":boxborderw=14" % (CONSOLA, CREAM))
    run([FFMPEG, "-y", "-ss", str(ss), "-t", str(dur), "-i", src, "-vf", vf, *ENC, dst], cwd=WORK)
    pieces.append(dst)
    offsets.append(t)
    slot_durs.append(dur)
    t += dur
    print("  piece %02d : %.1f s (VO a partir de %.1f)" % (i + 1, dur, offsets[-1]))

CLOSE_START = t  # debut de la carte de cloture

print("== Cartes ==")
card("00-title.mp4", CARD_TITLE, [
    ("PUNCH : Clock'in", 190, GOLD, GEORGIA, 0),
    ("Proof of presence. Paid honestly.", 44, CREAM, GEORGIA, 260),
    ("CLOCK IN hackathon - Solana Seeker", 34, DIM, CONSOLA, 340),
])
card("90-close.mp4", CARD_CLOSE, [
    ("PUNCH : Clock'in", 130, GOLD, GEORGIA, 0),
    ("you show up, you get paid", 48, CREAM, GEORGIA, 190),
    ("92 / 3 / 5", 100, GOLD, GEORGIA, 420),
    ("github.com/Azumizeus/punch-clockin", 36, CREAM, CONSOLA, 640),
    ("Signed APK v1.7.0 - see repo releases", 30, DIM, CONSOLA, 710),
])

TOTAL = sum(probe_dur(p) for p in pieces)

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

# Voix off : cascade — chaque voix demarre apres la precedente, CENTREE sur
# son plan (marge egale avant/apres) pour ne jamais etre en avance sur le
# visuel, avec un plan adapte a sa duree (jamais 2 voix en meme temps).
print("== Mix voix off ==")
print("  total video : %.1f s" % TOTAL)
ORDER = ["hook", "punch", "board", "globe", "honesty", "close"]
SLOT = {"punch": (0, 1), "board": (2, 3), "globe": (4, 5),
        "honesty": (6, 7)}  # (plan_debut, plan_fin_inclus) — indices dans offsets[]
VO_OFF = {"hook": 0.8}
for prev, key in zip(ORDER, ORDER[1:]):
    d_prev = probe_dur(os.path.join(VODIR, prev + ".mp3"))
    d = probe_dur(os.path.join(VODIR, key + ".mp3"))
    if key == "close":
        slot_a, slot_b = CLOSE_START, TOTAL  # la carte de cloture est dimensionnee pour la voix
    else:
        i0, i1 = SLOT[key]
        slot_a = offsets[i0]
        slot_b = offsets[i1] + slot_durs[i1]  # fin du plan de fin
    slot_len = slot_b - slot_a
    centered = slot_a + max((slot_len - d) / 2.0, 0.0)
    VO_OFF[key] = max(centered, VO_OFF[prev] + d_prev + 0.3)
    assert VO_OFF[key] + d <= slot_b + 2.5, \
        "VO %s depasse son plan : %.1f+%.1f > %.1f" % (key, VO_OFF[key], d, slot_b)
inputs = ["-i", nosound]
filters = []
for i, key in enumerate(ORDER, start=1):
    path = os.path.join(VODIR, key + ".mp3")
    d = probe_dur(path)
    off = VO_OFF[key]
    assert off + d <= TOTAL - 0.5, "VO %s deborde : %.1f+%.1f > %.1f" % (key, off, d, TOTAL)
    print("  %s @ %.1f s (%.1f s)" % (key, off, d))
    inputs += ["-i", path]
    ms = int(off * 1000)
    filters.append("[%d]adelay=%d|%d[v%d]" % (i, ms, ms, i))
filters.append("".join("[v%d]" % i for i in range(1, len(ORDER) + 1))
               + "amix=inputs=%d:normalize=0:dropout_transition=0,apad[lv];"
                 "[lv]loudnorm=I=-16:TP=-1.5:LRA=11[aa]" % len(ORDER))
run([FFMPEG, "-y", *inputs, "-filter_complex", ";".join(filters),
     "-map", "0:v", "-map", "[aa]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
     "-t", str(TOTAL), "-movflags", "+faststart", OUT])

r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration,size",
                    "-of", "csv=p=0", OUT], capture_output=True)
dur, size = r.stdout.decode().strip().split(",")
print("==== OK : %s — %s s, %.1f Mo ====" % (OUT, dur, int(size) / 1e6))
