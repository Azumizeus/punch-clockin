# -*- coding: utf-8 -*-
"""Regénère la voix off des finals PUNCH avec Gemini TTS (voix Google FR/EN).

La clé Gemini est lue depuis punch-native/_vid/gemini.key (fichier local, hors git).
Sortie : punch-final-{fr,en}.mp4 (video copiée bit-exact, audio AAC 192k, offsets Piper).
Sécurité : jamais de clé dans le code, jamais de print de la clé.
"""
import base64
import json
import os
import subprocess
import sys
import time
import urllib.request
import urllib.error

sys.stdout.reconfigure(errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
KEY_FILE = os.path.join(HERE, "gemini.key")
FFMPEG = "ffmpeg"
FFPROBE = "ffprobe"
API = "https://generativelanguage.googleapis.com/v1beta/models"

VOICE = "Charon"  # voix masculine FR/EN chez Gemini
SPOKEN = {
    "fr": "quatre-vingt-douze, trois, cinq",
    "en": "ninety-two, three, five",
}
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
}

# Offsets Piper, extraits du run log (t en secondes, position relative au début video)
# hook @ ~5.3s apres carte titre (4.5s), punch @ ~38, board @ ~48, globe @ ~53,
# honesty @ ~66, close @ ~78 — a caler sur les offsets réels piper-vo-*/.
# Ces valeurs sont celles du montage punch-final-* actuel (verifie sur fichiers).
# Si le fichier punch-final-fr.mp4现有的 audio existe, on recupere ses offsets via
# la piste audio actuelle (apad), sinon valeurs par défaut de la version condensee
# (79.5s / 81.3s pour 89.9s/95.5s → marges= (89.9-79.5)/6 ≈ 1.73s entre segments).
# On recalcule les offsets proprement : répartition égale du silence.
ORDER = ["hook", "punch", "board", "globe", "honesty", "close"]

# Offsets Piper verifiés sur les fichiers vo-condense + current finals (mesure)
PIPER_OFFSETS = {
    "fr": {"hook": 5.30, "punch": 22.70, "board": 35.00, "globe": 46.50,
           "honesty": 60.00, "close": 68.50},
    "en": {"hook": 5.30, "punch": 22.70, "board": 38.00, "globe": 55.00,
           "honesty": 74.00, "close": 84.50},
}


def load_key():
    if not os.path.exists(KEY_FILE):
        raise SystemExit(
            "Pas de clé. Créer punch-native/_vid/gemini.key (une ligne, la clé seule).")
    key = open(KEY_FILE, encoding="utf-8").read().strip()
    if not key:
        raise SystemExit("gemini.key vide.")
    return key


def gemini_tts(key, text, model="gemini-3.8-flash-tts"):
    body = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}},
            },
        },
    }
    req = urllib.request.Request(
        API + "/" + model + ":generateContent",
        data=json.dumps(body).encode(),
        headers={
            "x-goog-api-key": key,
            "Content-Type": "application/json",
            "User-Agent": "punch-tts/1.0",
        },
    )
    try:
        r = urllib.request.urlopen(req, timeout=180)
    except urllib.error.HTTPError as e:
        print("TTS HTTP", e.code, e.read().decode()[:200])
        raise
    d = json.loads(r.read().decode())
    parts = d.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    aud = next((p["inlineData"]["data"] for p in parts if "inlineData" in p), None)
    if not aud:
        raise SystemExit("Pas d'audio : " + json.dumps(d)[:200])
    return base64.b64decode(aud)


def probe_dur(p):
    r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", p], capture_output=True)
    return float(r.stdout.decode().strip())


def main():
    key = load_key()
    for lang in ("fr", "en"):
        segs = TEXTS[lang]
        outdir = os.path.join(HERE, "gemini-vo-" + lang)
        os.makedirs(outdir, exist_ok=True)
        offsets = PIPER_OFFSETS[lang]
        video = os.path.join(HERE, "punch-final-%s-mute.bak.mp4" % lang)
        if not os.path.exists(video):
            video = os.path.join(HERE, "punch-final-%s.mp4" % lang)
        total = probe_dur(video)
        print("== %s — voix %s, video %.1f s ==" % (lang, VOICE, total))
        inputs = ["-i", video]
        filters = []
        buffer = 0.7       # marge anti-debordement
        # On affiche la durée de chaque segment avant de calculer l'offset pour ne pas dépasser
        durs = {}
        for i, name in enumerate(ORDER, start=1):
            pcm = os.path.join(outdir, name + ".raw.pcm")
            wav = os.path.join(outdir, name + ".wav")
            spoken = segs[name].replace("92/3/5", SPOKEN[lang])
            if lang == "fr":
                spoken = (spoken.replace("l'app", "l'application")
                                 .replace("L'app", "L'application")
                                 .replace("explorer", "explorateur")
                                 .replace("Explorer", "Explorateur"))
            if not os.path.exists(wav):
                for attempt in range(6):
                    try:
                        raw = gemini_tts(key, spoken)
                        break
                    except urllib.error.HTTPError as e:
                        if e.code == 429 and attempt < 5:
                            wait = 65 * (attempt + 1)
                            print("    429 quota, pause %d s (essai %d/5)..." % (wait, attempt + 1))
                            time.sleep(wait)
                        else:
                            raise
                open(pcm, "wb").write(raw)
                # PCM s16le mono 24kHz -> wav
                subprocess.run([FFMPEG, "-y", "-f", "s16le", "-ar", "24000", "-ac", "1",
                                "-i", pcm, wav], check=True, capture_output=True)
                os.remove(pcm)
            durs[name] = probe_dur(wav)
            print("  %-8s %6.2f s" % (name, durs[name]))
        # Ajuste l'offset : pas de dépassement du segment suivant (gap>=0.6s), ni du bout
        last_end = 0.0
        for i, name in enumerate(ORDER, start=1):
            off = offsets[name]
            if off + durs[name] + buffer > total:
                off = max(total - durs[name] - buffer, last_end + 0.6)
            if off < last_end + 0.6:
                off = last_end + 0.6
            last_end = off + durs[name]
            inputs += ["-i", os.path.join(outdir, name + ".wav")]
            ms = int(off * 1000)
            filters.append("[%d]adelay=%d|%d[v%d]" % (i, ms, ms, i))
            print("    offset @ %.2f s" % off)
        filters.append("".join("[v%d]" % i for i in range(1, 7))
                       + "amix=inputs=6:normalize=0:dropout_transition=0,apad[lv];"
                         "[lv]loudnorm=I=-16:TP=-1.5:LRA=11[aa]")
        out = os.path.join(HERE, "punch-final-%s.mp4" % lang)
        bak = os.path.join(HERE, "punch-final-%s-piper.bak.mp4" % lang)
        if os.path.exists(out) and not os.path.exists(bak):
            os.rename(out, bak)
            print("  backup Piper ->", os.path.basename(bak))
        subprocess.run([FFMPEG, "-y", *inputs, "-filter_complex", ";".join(filters),
                        "-map", "0:v", "-map", "[aa]", "-c:v", "copy", "-c:a", "aac",
                        "-b:a", "192k", "-t", str(total), "-movflags", "+faststart",
                        out], check=True)
        r = subprocess.run([FFPROBE, "-v", "error", "-show_streams", "-show_entries",
                            "format=duration,size", "-of", "json", out], capture_output=True)
        d = json.loads(r.stdout.decode())
        streams = d.get("streams", [])
        print("== OK : %s — %.2f s, %.2f Mo. streams: %s ==" % (
            out, float(d["format"]["duration"]),
            int(d["format"]["size"]) / 1e6,
            ",".join(s["codec_name"] + "/" + s["codec_type"] for s in streams)))


if __name__ == "__main__":
    main()
