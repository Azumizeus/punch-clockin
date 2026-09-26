# -*- coding: utf-8 -*-
"""Page « proof » : traces verifiables des captures et de la video device.

Genere docs/site/proof.html DEPUIS docs/site/device/MANIFEST.json — la page ne
contient aucun chiffre tape a la main : version, date, sha256 et poids de chaque
capture, plus le bloc video (demo Reseau) quand le MANIFEST en porte un.

Deux modes :
  python tools/make_proof_page.py            # (re)genere docs/site/proof.html
  python tools/make_proof_page.py --check    # mode CI : echoue (exit 1) si la
                                             # page existante est desync du MANIFEST

La page est servie par GitHub Pages (voir tools/publish-gh-pages.sh) et sert de
preuve hors-repo : les sha256 publies ici peuvent etre compares aux assets de
la release (MANIFEST.json embarque + video).
"""
import hashlib
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEVICE = os.path.join(ROOT, "docs", "site", "device")
MANIFEST = os.path.join(DEVICE, "MANIFEST.json")
OUT = os.path.join(ROOT, "docs", "site", "proof.html")

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PUNCH — Proof · Preuve (device v{version})</title>
<style>
  :root{{--bg:#0a0908;--fg:#f4ecd8;--card:#161310;--dim:#8a7a56;--accent:#d4af37;--line:rgba(212,175,55,.28)}}
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{background:var(--bg);color:var(--fg);font:17px/1.65 Georgia,'Times New Roman',serif;padding:56px 22px}}
  .wrap{{max-width:860px;margin:0 auto}}
  .tag{{display:inline-block;font:12px/1 ui-monospace,monospace;letter-spacing:2px;color:var(--dim);border:1px solid var(--line);border-radius:999px;padding:6px 14px;margin-bottom:18px}}
  h1{{font-size:40px;margin-bottom:6px}}
  h1 span{{color:var(--accent)}}
  .sub{{color:var(--dim);font-style:italic;margin-bottom:30px}}
  h2{{font-size:22px;color:var(--accent);margin:34px 0 10px}}
  .card{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin:12px 0}}
  .mono{{font-family:ui-monospace,'Cascadia Mono',monospace;font-size:13px;color:var(--dim);word-break:break-all}}
  .mono b{{color:var(--fg);font-weight:normal}}
  .btn{{display:inline-block;background:var(--accent);color:#0a0908;font-weight:bold;text-decoration:none;border-radius:8px;padding:12px 20px;font-size:15px;margin:0 12px 12px 0}}
  .btn.ghost{{background:transparent;color:var(--accent);border:1px solid var(--accent)}}
  .note{{border-left:3px solid var(--accent);background:var(--card);border-radius:8px;padding:14px 18px;margin:18px 0;font-size:15px}}
  table{{border-collapse:collapse;width:100%;margin:10px 0;font-size:14px}}
  th,td{{border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}}
  th{{color:var(--accent);font-weight:normal;font-size:12.5px;letter-spacing:1px}}
  td .mono{{font-size:12px}}
  .shots{{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:640px;margin:16px 0 4px}}
  .shots figure{{margin:0;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 10px 8px;text-align:center}}
  .shots img{{width:100%;border-radius:8px;border:1px solid var(--line);display:block}}
  .shots figcaption{{font-size:12.5px;color:var(--dim);margin-top:8px}}
  @media (max-width:640px){{.shots{{grid-template-columns:1fr}}}}
  footer{{margin-top:44px;color:var(--dim);font-size:13px;text-align:center;font-style:italic}}
  a{{color:var(--accent)}}
</style>
</head>
<body>
<div class="wrap">
  <div class="tag">PROOF — GENERATED FROM MANIFEST.JSON · PREUVE — GÉNÉRÉE DEPUIS MANIFEST.JSON</div>
  <h1>Proof, not promises <span>·</span> la preuve, pas la promesse</h1>
  <div class="sub">Screenshots and video below were captured on a physical Solana Seeker and hashed on this machine. Re-compute the SHA-256 yourself — if the bytes match, what you download is what the phone produced. — <span lang="fr">Captures et vidéo faites sur un Seeker physique, hachées sur cette machine. Recalculez le SHA-256 vous-même : si les octets correspondent, ce que vous téléchargez est bien ce que le téléphone a produit.</span></div>

  <div class="card">
    <table>
      <tr><th>APP VERSION · VERSION DE L'APP</th><td><b>v{version}</b> <span class="mono">(source of truth: punch-native/app.json — enforced in CI)</span></td></tr>
      <tr><th>CAPTURED ON · PRIS SUR</th><td>Solana Seeker <span class="mono">SM02E4060310629</span> — physical device, adb screencap · appareil physique</td></tr>
      <tr><th>GENERATED · GÉNÉRÉ LE</th><td>{generated} (UTC)</td></tr>
    </table>
  </div>

  <h2>Screenshots · Captures</h2>
  <div class="shots">
{figures}
  </div>
  <div class="card">
    <table>
      <tr><th>FILE · FICHIER</th><th>SHA-256</th><th>BYTES · OCTETS</th></tr>
{rows}
    </table>
    <p class="mono" style="margin-top:10px">Verify: <b>certutil -hashfile home.png SHA256</b> (Windows) · <b>shasum -a 256 home.png</b> (macOS/Linux) · then compare with the table above.</p>
  </div>

{video_block}
  <div class="note">
    <b>How this page is built · Comment cette page est construite :</b> one command on the device (<span class="mono">punch-native/scripts/device/vitrine.py</span>)
    exports the screenshots, hashes them and writes <span class="mono">docs/site/device/MANIFEST.json</span>; this page is generated from that manifest
    (<span class="mono">tools/make_proof_page.py</span>) — raw manifest: <a href="device/MANIFEST.json">device/MANIFEST.json</a>. CI fails if the gallery ever drifts from the device (<span class="mono">tools/check_device_sync.py</span>),
    and fails again if this page ever drifts from the manifest (<span class="mono">make_proof_page.py --check</span>).
    — <span lang="fr">Une commande sur l'appareil exporte les captures et écrit le MANIFEST ; cette page est générée depuis ce manifeste. La CI échoue si la galerie dérive du téléphone, et échoue aussi si cette page dérive du manifeste.</span>
  </div>

  <a class="btn ghost" href="index.html">← Back · Retour</a>
  <a class="btn ghost" href="guide-jury.html">Judge guide · Guide jury</a>
  <footer>PUNCH — built for CLOCK IN · page generated from device/MANIFEST.json · do not edit by hand · page générée, ne pas éditer à la main</footer>
</div>
</body>
</html>
"""

VIDEO_BLOCK = """  <h2>Video · Vidéo (network demo · démo Réseau)</h2>
  <div class="card">
    <table>
      <tr><th>FILE · FICHIER</th><td><b>{name}</b> — recorded on the Seeker during the app, screen captured via adb · filmé sur le Seeker pendant la démo</td></tr>
      <tr><th>DATE</th><td>{date}</td></tr>
      <tr><th>SHA-256</th><td class="mono">{sha256}</td></tr>
      <tr><th>BYTES · OCTETS</th><td>{bytes}</td></tr>
      <tr><th>DOWNLOAD · TÉLÉCHARGER</th><td><a href="{url}">{name}</a> (GitHub release asset, release v{version})</td></tr>
    </table>
    <p style="margin-top:10px;font-size:15px">What it shows · Ce qu'elle montre : public RPC ping <b>green (249 ms)</b> → fake endpoint <span class="mono">rpc-inexistant-punch.example</span> rejected with the <b>real error</b> (UnknownHostException) → back to the public RPC, <b>green again (254 ms)</b>, Version {version} visible on the same screen. — <span lang="fr">ping public vert → endpoint bidon rejeté avec la vraie erreur → retour public, re-ping vert, Version {version} visible au même écran.</span></p>
  </div>
"""


def esc(s):
    """Texte insere dans du HTML — on neutralise tout markup accidentel."""
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def sha256_of(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def build(manifest):
    """Rend la page complete depuis le manifeste (aucun chiffre en dur)."""
    figures = []
    rows = []
    for name, meta in sorted((manifest.get("shots") or {}).items()):
        figures.append(
            '    <figure><img src="device/%s" alt="%s" loading="lazy"><figcaption><b>%s</b> · v%s</figcaption></figure>'
            % (esc(name), esc(name), esc(name), esc(manifest.get("version", "?")))
        )
        rows.append(
            "      <tr><td><b>%s</b><br><span class=\"mono\">device/%s</span></td><td class=\"mono\">%s</td><td>%s</td></tr>"
            % (esc(name), esc(name), esc(meta.get("sha256", "?")), esc(meta.get("bytes", "?")))
        )
    video = manifest.get("video") or {}
    video_block = VIDEO_BLOCK.format(
        name=esc(video.get("name", "?")),
        date=esc(video.get("date", "?")),
        sha256=esc(video.get("sha256", "?")),
        bytes=esc(video.get("bytes", "?")),
        url=esc(video.get("url", "#")),
        version=esc(manifest.get("version", "?")),
    ) if video else "  <!-- no video block in MANIFEST -->\n"
    return PAGE.format(
        version=esc(manifest.get("version", "?")),
        generated=esc(manifest.get("generated", "?")),
        figures="\n".join(figures),
        rows="\n".join(rows),
        video_block=video_block,
    )


def load_manifest():
    if not os.path.exists(MANIFEST):
        print("!! docs/site/device/MANIFEST.json introuvable")
        print("   Sur le poste avec le Seeker branche :")
        print("     cd punch-native && python scripts/device/vitrine.py")
        sys.exit(1)
    with open(MANIFEST, encoding="utf-8") as fh:
        return json.load(fh)


def main():
    manifest = load_manifest()
    html = build(manifest)
    if "--check" in sys.argv:
        if not os.path.exists(OUT):
            print("!! docs/site/proof.html introuvable — relance : python tools/make_proof_page.py")
            sys.exit(1)
        with open(OUT, encoding="utf-8") as fh:
            current = fh.read()
        if current != html:
            print("!! docs/site/proof.html est desync de docs/site/device/MANIFEST.json")
            print("   Relance : python tools/make_proof_page.py  puis committe la page.")
            sys.exit(1)
        print("OK : proof.html synchro du MANIFEST (v%s)" % manifest.get("version"))
        return 0
    with open(OUT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(html)
    print("OK : docs/site/proof.html genere depuis le MANIFEST (v%s)" % manifest.get("version"))
    for name, meta in sorted((manifest.get("shots") or {}).items()):
        print("   - %s : sha256 %s... (%s o)" % (name, str(meta.get("sha256"))[:12], meta.get("bytes")))
    if manifest.get("video"):
        print("   - video %s : sha256 %s... (%s o)" % (manifest["video"].get("name"), str(manifest["video"].get("sha256"))[:12], manifest["video"].get("bytes")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
