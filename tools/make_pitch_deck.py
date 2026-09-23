# -*- coding: utf-8 -*-
"""
Génère docs/punch-clockin-deck.pdf — le pitch deck de soumission CLOCK IN.
11 slides EN (contenu : docs/PITCH-DECK.md), fond sombre #0a0908, accent or #d4af37,
captures de l'app (rushes QA _shots/demo-v165, vitrine v1.6.8).

Usage : python tools/make_pitch_deck.py
Prérequis : pip install fpdf2  (PIL non requis)
"""
import os

from fpdf import FPDF

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "punch-clockin-deck.pdf")
SHOTS = os.path.join(ROOT, "punch-native", "_shots", "demo-v165")
RATIO = 1200 / 2670.0  # largeur/hauteur des captures Seeker (1200x2670)

BG = (10, 9, 8)          # fond noir chaud
FG = (244, 236, 216)     # crème
DIM = (138, 122, 86)     # or gris
GOLD = (212, 175, 55)    # accent
LINE = (60, 52, 34)      # filets

REPO = "github.com/Azumizeus/punch-clockin"
TREASURY = "FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn"
RELEASE = "github.com/Azumizeus/punch-clockin/releases/tag/v1.6.8"

FONTS = {
    "R": ["C:/Windows/Fonts/georgia.ttf", "/usr/share/fonts/truetype/msttcorefonts/Georgia-Regular.ttf"],
    "B": ["C:/Windows/Fonts/georgiab.ttf", "/usr/share/fonts/truetype/msttcorefonts/Georgia-Bold.ttf"],
    "I": ["C:/Windows/Fonts/georgiai.ttf", "/usr/share/fonts/truetype/msttcorefonts/Georgia-Italic.ttf"],
    "M": ["C:/Windows/Fonts/consola.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"],
}

SLIDES = [
    {
        "kicker": "CLOCK IN — THE SOLANA MOBILE HACKATHON",
        "title": "PUNCH",
        "sub": "Proof of presence. Paid honestly.",
        "img": "B-01-connect.png",
        "img_h": 168,
    },
    {
        "kicker": "01 · THE PROBLEM",
        "title": "Presence apps on crypto are fake\nin one of two ways",
        "bullets": [
            "The check-in isn't verified — anyone can fake it from a browser.",
            "Or the money split is hidden behind a token model nobody can audit.",
        ],
        "close": "Gig workers and communities have no honest way to turn \u201cI was here\u201d into income.",
    },
    {
        "kicker": "02 · THE SOLUTION",
        "title": "One tap a day on a real Seeker\nproves you're here — and pays you",
        "bullets": [
            "A real signed Solana transaction proves your presence — the phone signs, the explorer proves.",
            "It unlocks small paid gigs nearby: confirm a place is open, leave an honest review, scan a code.",
        ],
        "close": "Every payment follows one printed rule: 92% worker · 3% SKR holders · 5% app.\nVisible on every receipt. Never hidden.",
        "img": "B-02-ticket.png",
        "img_h": 150,
    },
    {
        "kicker": "03 · HOW IT WORKS",
        "title": "Everything is a real transaction,\nfrom punch in to cash out",
        "bullets": [
            "Punch in — memo transaction signed in Seed Vault, confirmed on devnet in seconds.",
            "Ticket — paper-style receipt: time, country, 92/3/5, on-chain stamp (clickable signature).",
            "Gigs — confirm a place is open, review it honestly, scan a code. Paid in USDC/USDT.",
            "Post a job — lock real funds from your wallet; the treasury pays the worker.",
        ],
    },
    {
        "kicker": "04 · THE SKR ECONOMY",
        "title": "Staking SKR unlocks better-paid jobs\n— real utility, zero new supply",
        "bullets": [
            "Stake SKR to climb the ranks (Silver 1,000 · Gold 5,000 · Guardian 25,000) and reach gigs first.",
            "Swap USDC/USDT/SKR at a fixed rate; unstake carries an honest 1.5% protocol fee.",
            "Protocol fees fund the protocol and buy back SKR for holders.",
        ],
        "close": "This is our CLOCK IN SKR-integration entry.",
    },
    {
        "kicker": "05 · EVERYTHING IS REAL",
        "title": "Nothing is simulated.\nEvery cent is a signed devnet transaction.",
        "bullets": [
            "Punch in, get paid, swap, stake, say-hi, leave the network — all real, all through Mobile Wallet Adapter / Seed Vault.",
            "The treasury is public: watch balances move on the explorer while you use the app.",
            "No fake numbers in local storage. Anywhere.",
        ],
        "mono": ["Treasury: " + TREASURY, "explorer.solana.com/address/" + TREASURY + "?cluster=devnet"],
    },
    {
        "kicker": "06 · PROOF ON DEVICE (v1.6.8)",
        "title": "The Settings screen proves it:\npublic RPC, version 1.6.8, honest exit",
        "bullets": [
            "Network section: custom RPC endpoint with a live \u201cTest connection\u201d check — \u201cRPC public actif\u201d when the endpoint answers.",
            "A wrong endpoint fails honestly: the exact reason is shown, nothing moves, nothing is signed.",
            "About: Version 1.6.8 — and \u201cQuitter le r\u00e9seau\u201d requires a real signed Seed Vault transaction.",
        ],
        "img": os.path.join(ROOT, "punch-native", "_shots", "v168-vitrine", "38-reglages-version.png"),
        "img_h": 168,
    },
    {
        "kicker": "07 · UX & DELIGHT",
        "title": "A punch clock you actually\nwant to come back to",
        "bullets": [
            "A real drag-physics globe: every punch in the world drops a live dot.",
            "\u201cSay hi\u201d to a nearby Seeker pays you both $0.10 — a social gesture turned into a real micro-transaction.",
            "Seeker Premium identity: Gold / Nuit themes, ticket history with clickable signatures, interactive guided tour.",
            "100% native (Expo / React Native) — signed APK, no Expo Go needed for judges.",
        ],
        "img": "B-05-globe-fin.png",
        "img_h": 150,
    },
    {
        "kicker": "08 · MARKET & STICKINESS",
        "title": "A daily ritual for Seeker owners,\nan honest wage for communities",
        "bullets": [
            "Launch: Solana Mobile Seeker owners — Seed Vault built in, no seed phrases.",
            "Daily loop: punch in, take gigs, get paid — then come back tomorrow. Staking locks users in.",
            "Expansion: any Mobile Wallet Adapter device, then community attendance (events, coworking, crews).",
        ],
        "img": "B-03-board-fin.png",
        "img_h": 138,
    },
    {
        "kicker": "09 · ROADMAP",
        "title": "Devnet today, mainnet when it\ndeserves it",
        "bullets": [
            "Now (hackathon): full devnet economy, signed APK, verifiable receipts.",
            "Next: dedicated Anchor program for on-chain per-user staking (today's bookkeeping is app-side by design); treasury key moves server-side before any mainnet push.",
            "Later: geo-verified gigs, Seeker reputation beyond stake rank, mainnet.",
        ],
    },
    {
        "kicker": "10 · TEAM & LINKS",
        "title": "Nexus Seeker — honest money\nfor real presence",
        "links": [
            ("GitHub repo — source, judge guide, signed APK", "https://" + REPO),
            ("Judge guide (step-by-step test)", "https://" + REPO + "/blob/master/docs/GUIDE-JURY.md"),
            ("Signed APK + demo video (Release v1.6.8)", "https://" + RELEASE),
            ("Treasury on devnet explorer", "https://explorer.solana.com/address/" + TREASURY + "?cluster=devnet"),
        ],
        "close": "Thank you — Clock in. Build. Get paid. 92 / 3 / 5.",
    },
]


def find_font(cands):
    for c in cands:
        if os.path.exists(c):
            return c
    raise SystemExit("Police introuvable : " + repr(cands))


class Deck(FPDF):
    slide_no = 0

    def header(self):
        pass

    def footer(self):
        self.set_fill_color(*BG)
        self.set_draw_color(*LINE)
        self.set_text_color(*DIM)
        self.set_font("M", size=8)
        self.set_y(-14)
        self.cell(0, 6, "PUNCH — built for CLOCK IN · 92 / 3 / 5", align="L")
        self.cell(0, 6, f"{self.slide_no:02d} / {len(SLIDES)}", align="R")


def chrome(pdf, kicker):
    """Fond + filet haut + kicker."""
    pdf.set_fill_color(*BG)
    pdf.rect(0, 0, 297, 210, style="F")
    pdf.set_draw_color(*GOLD)
    pdf.set_line_width(0.8)
    pdf.line(18, 10.5, 60, 10.5)
    pdf.set_font("M", size=10)
    pdf.set_text_color(*DIM)
    pdf.set_xy(18, 13.5)
    pdf.cell(0, 8, kicker.upper())


def bullet_list(pdf, items, x, y, w, size=12.5, lh=6.6):
    pdf.set_font("R", size=size)
    for it in items:
        start_y = pdf.get_y()
        pdf.set_xy(x, y)
        pdf.set_text_color(*GOLD)
        pdf.cell(5, lh, "\u2022")
        pdf.set_xy(x + 6, y)
        pdf.set_text_color(*FG)
        pdf.multi_cell(w - 6, lh, it, markdown=False)
        y = max(pdf.get_y(), start_y + lh) + 1.6


def add_slide(pdf, s):
    pdf.add_page(orientation="L", format="A4")
    Deck.slide_no += 1
    chrome(pdf, s["kicker"])

    img = s.get("img")
    img_path = img if (img and os.path.isabs(img)) else (os.path.join(SHOTS, img) if img else None)
    if img and not os.path.exists(img_path):
        raise SystemExit("Capture introuvable : " + img_path)
    img_w = (s.get("img_h", 150) / 1.0) * RATIO if img else 0
    text_w = 297 - 36 - (img_w + 14 if img else 0)

    # Titre
    pdf.set_xy(18, 26)
    pdf.set_font("B", size=25)
    pdf.set_text_color(*FG)
    pdf.multi_cell(text_w, 10.5, s["title"], markdown=False)
    if s.get("sub"):
        pdf.set_x(18)
        pdf.set_font("I", size=15)
        pdf.set_text_color(*GOLD)
        pdf.multi_cell(text_w, 8, s["sub"], markdown=False)

    # Slide 1 : la règle 92/3/5 en trois pavés
    if Deck.slide_no == 1:
        pdf.set_y(pdf.get_y() + 8)
        x0, y0, w0, h0 = 18, 118, 52, 34
        for num, label in [
            ("92 %", "to the person who\nshowed up"),
            ("3 %", "to SKR holders"),
            ("5 %", "to the app"),
        ]:
            pdf.set_fill_color(*LINE)
            pdf.set_draw_color(*LINE)
            pdf.rect(x0, y0, w0, h0, style="DF")
            pdf.set_xy(x0, y0 + 5)
            pdf.set_font("B", size=21)
            pdf.set_text_color(*GOLD)
            pdf.cell(w0, 11, num, align="C")
            pdf.set_xy(x0, y0 + 17)
            pdf.set_font("R", size=9.5)
            pdf.set_text_color(*DIM)
            pdf.multi_cell(w0, 4.6, label, align="C")
            x0 += w0 + 8
        pdf.set_xy(18, 164)
        pdf.set_font("I", size=12)
        pdf.set_text_color(*DIM)
        pdf.multi_cell(180, 6.5, "Built for CLOCK IN \u00b7 Solana Mobile \u00b7 devnet demo\n" + REPO, markdown=False)

    if s.get("bullets"):
        pdf.set_y(62 if Deck.slide_no == 1 else pdf.get_y() + 4)
        bullet_list(pdf, s["bullets"], 18, pdf.get_y(), text_w)

    if s.get("mono"):
        pdf.set_y(min(pdf.get_y() + 4, 150))
        for line in s["mono"]:
            pdf.set_x(18)
            pdf.set_font("M", size=10)
            pdf.set_text_color(*GOLD)
            pdf.cell(0, 5.4, line)
            pdf.ln(5.4)

    if s.get("close"):
        # Sur la slide liens, le close remonte pour laisser 4 lignes de liens
        # au-dessus du pied de page (196 mm).
        pdf.set_y(140 if s.get("links") else min(max(pdf.get_y() + 6, 158), 176))
        pdf.set_x(18)
        pdf.set_font("I", size=13)
        pdf.set_text_color(*GOLD)
        pdf.multi_cell(text_w, 7, s["close"], markdown=False)

    if s.get("links"):
        pdf.set_y(152)
        for label, url in s["links"]:
            y0 = pdf.get_y()
            pdf.set_x(18)
            pdf.set_font("R", size=10.5)
            pdf.set_text_color(*FG)
            pdf.cell(100, 7, label)
            pdf.set_x(122)
            pdf.set_font("M", size=8.5)
            pdf.set_text_color(*GOLD)
            pdf.cell(0, 7, url)
            pdf.set_y(y0 + 8.4)

    # Capture téléphone, bordée d'or
    if img:
        h = s.get("img_h", 150)
        w = h * RATIO
        x = 297 - 18 - w
        y = (210 - h) / 2
        pdf.set_draw_color(*GOLD)
        pdf.set_line_width(0.5)
        pdf.rect(x - 1.5, y - 1.5, w + 3, h + 3)
        pdf.image(img_path, x=x, y=y, w=w, h=h)


def main():
    pdf = Deck(orientation="L", format="A4", unit="mm")
    pdf.set_auto_page_break(False)
    pdf.set_margins(18, 16, 18)
    for style, cands in FONTS.items():
        pdf.add_font(style, "", find_font(cands))
    pdf.set_title("PUNCH — CLOCK IN pitch deck")
    pdf.set_author("Nexus Seeker")
    pdf.set_subject("Proof of presence on Solana — 92/3/5")
    for s in SLIDES:
        add_slide(pdf, s)
    pdf.output(OUT)
    print("OK :", os.path.relpath(OUT, ROOT), "—", os.path.getsize(OUT), "octets,", len(SLIDES), "slides")


if __name__ == "__main__":
    main()
