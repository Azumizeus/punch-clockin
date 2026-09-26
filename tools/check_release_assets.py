# -*- coding: utf-8 -*-
"""Garde-fou CI : les assets de la release GitHub sont ceux qu'on croit.

Verifie, sur la release la plus recente (latest) :
  1. il existe un asset .apk et son compagnon .apk.sha256 ;
  2. le sha256 de l'APK TELECHARGE correspond au fichier .sha256 embarque
     (le nom de fichier cite par le .sha256 doit aussi correspondre) ;
  3. l'asset MANIFEST.json embarque est octet-pour-octet celui du repo
     (docs/site/device/MANIFEST.json) — la trace device publiee sur la release
     ne peut pas diverger de la trace verifiee en CI par check_device_sync.py.

La release a verifier peut etre forcee : PUNCH_RELEASE_TAG=v1.6.8 (sinon
« latest »). Reutilisation du token CI standard (GITHUB_TOKEN, fourni
automatiquement par Actions ; permissions du workflow : contents: read).

Usage : python tools/check_release_assets.py
"""
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = "Azumizeus/punch-clockin"
API = "https://api.github.com/repos/%s" % REPO


def fail(msg, *hints):
    print("!! " + msg)
    for h in hints:
        print("   " + h)
    sys.exit(1)


def http_get(url, token):
    req = urllib.request.Request(url, headers={
        "Authorization": "Bearer %s" % token,
        "Accept": "application/vnd.github+json",
        "User-Agent": "punch-release-check",
    })
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def main():
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        fail("GITHUB_TOKEN absent",
             "En CI, Actions le fournit automatiquement (permissions: contents: read).",
             "En local : utilise un token perso via la variable GITHUB_TOKEN.")

    tag = os.environ.get("PUNCH_RELEASE_TAG", "").strip()
    if tag:
        rel = json.loads(http_get("%s/releases/tags/%s" % (API, tag), token))
    else:
        rel = json.loads(http_get(API + "/releases/latest", token))
    if "id" not in rel:
        fail("release introuvable (%s)" % rel.get("message", "?"))
    tag = rel.get("tag_name", "?")
    assets = {a["name"]: a for a in rel.get("assets", [])}
    print("release %s (%d assets)" % (tag, len(assets)))

    # 1. APK + compagnon .sha256
    apks = [n for n in assets if n.lower().endswith(".apk")]
    if len(apks) != 1:
        fail("la release doit contenir exactement un .apk (trouves : %s)" % ", ".join(apks) or "aucun")
    apk_name = apks[0]
    sum_name = apk_name + ".sha256"
    if sum_name not in assets:
        fail("compagnon %s absent de la release" % sum_name,
             "Regenere la release : le workflow Release joint toujours le .sha256.")

    # 2. sha256 de l'APK telecharge == fichier .sha256 embarque
    print("telechargement de %s (%.1f Mo)..." % (apk_name, assets[apk_name]["size"] / 1e6))
    apk_url = assets[apk_name]["browser_download_url"]
    apk_bytes = http_get(apk_url, token)
    digest = hashlib.sha256(apk_bytes).hexdigest()
    expected = http_get(assets[sum_name]["browser_download_url"], token).decode("utf-8", "replace")
    m = re.search(r"\b([0-9a-f]{64})\b", expected.lower())
    mname = re.search(r"\b([A-Za-z0-9._-]+\.apk)\b", expected)
    if not m:
        fail("%s ne contient pas d'empreinte sha256 lisible" % sum_name)
    if m.group(1) != digest:
        fail("sha256 DESYNC : l'APK telecharge ne correspond pas au .sha256 embarque",
             "  %s     : %s..." % (sum_name, m.group(1)[:16]),
             "  telecharge : %s..." % digest[:16],
             "L'APK de la release a ete remplace ou regenere sans son compagnon : re-taguer la release.")
    if mname and mname.group(1) != apk_name:
        fail("%s cite %r mais l'asset s'appelle %r" % (sum_name, mname.group(1), apk_name))
    print("OK : %s = %s... (match .sha256)" % (apk_name, digest[:16]))

    # 3. MANIFEST.json embarque == celui du repo
    local = os.path.join(ROOT, "docs", "site", "device", "MANIFEST.json")
    if not os.path.exists(local):
        fail("docs/site/device/MANIFEST.json introuvable dans le repo",
             "Sur le poste avec le Seeker : cd punch-native && python scripts/device/vitrine.py")
    if "MANIFEST.json" not in assets:
        fail("asset MANIFEST.json absent de la release %s" % tag,
             "Re-uploade : curl -X POST --data-binary @docs/site/device/MANIFEST.json "
             "\"https://uploads.github.com/repos/%s/releases/<id>/assets?name=MANIFEST.json\"" % REPO)
    online = http_get(assets["MANIFEST.json"]["browser_download_url"], token)
    if hashlib.sha256(online).hexdigest() != hashlib.sha256(open(local, "rb").read()).hexdigest():
        fail("MANIFEST.json embarque sur la release != docs/site/device/MANIFEST.json du repo",
             "La trace device de la release a diverge : re-uploade le MANIFEST du repo sur la release.",
             "Si la version a change, re-taguer la release apres avoir relance la vitrine.")
    print("OK : MANIFEST.json embarque = MANIFEST.json du repo")
    print("Release %s : assets verifies." % tag)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except urllib.error.HTTPError as e:
        print("!! HTTP %s sur %s" % (e.code, e.url))
        sys.exit(1)
