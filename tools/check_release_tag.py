# -*- coding: utf-8 -*-
"""Garde-fou : le tag de release, app.json et le MANIFEST device racontent
la meme version.

Deux modes :

  1. Sur un push de tag (workflow Release) :
       python tools/check_release_tag.py --tag v1.6.9
     STRICT : le tag doit egalier la version de punch-native/app.json, qui doit
     egalier celle de docs/site/device/MANIFEST.json. Un desaccord arrete le
     build AVANT de produire un APK menteur sur son etiquette.

  2. En CI sur master (sans argument) :
       python tools/check_release_tag.py
     Compare la DERNIERE release publiee a app.json :
       - tag > app.json  -> ECHEC (une release affiche une version que le code
                            ne porte plus : bump oublie ou release orpheline) ;
       - tag < app.json  -> avertissement seulement (release en attente d'un
                            re-tag, situation transitoire normale du flux
                            bump -> push -> tag) ;
       - tag == app.json -> OK.

Token : GITHUB_TOKEN (fourni par Actions) ou GH_TOKEN ; en local, un token git
du trousseau peut etre utilise par l'appelant via la meme variable.
"""
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


def app_version():
    with open(os.path.join(ROOT, "punch-native", "app.json"), encoding="utf-8") as fh:
        m = re.search(r'"version"\s*:\s*"([\d.]+)"', fh.read())
    if not m:
        fail("version introuvable dans punch-native/app.json")
    return m.group(1)


def manifest_version():
    p = os.path.join(ROOT, "docs", "site", "device", "MANIFEST.json")
    if not os.path.exists(p):
        fail("docs/site/device/MANIFEST.json introuvable",
             "Sur le poste avec le Seeker : cd punch-native && python scripts/device/vitrine.py")
    with open(p, encoding="utf-8") as fh:
        v = (json.load(fh) or {}).get("version")
    if not v:
        fail("docs/site/device/MANIFEST.json ne porte pas de version")
    return v


def cmp_versions(a, b):
    """-1 si a<b, 0 si a==b, 1 si a>b (comparaison numerique par segment)."""
    ka = [int(x) for x in a.split(".")]
    kb = [int(x) for x in b.split(".")]
    return (ka > kb) - (ka < kb)


def http_json(url, token):
    req = urllib.request.Request(url, headers={
        "Authorization": "Bearer %s" % token,
        "Accept": "application/vnd.github+json",
        "User-Agent": "punch-release-tag-check",
    })
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def check_tag_against_sources(tag):
    """Mode strict (--tag) : tag == app.json == MANIFEST. Quitte 1 au moindre ecart."""
    ver = tag[1:] if tag.startswith("v") else tag
    app = app_version()
    if cmp_versions(ver, app) != 0:
        fail("le tag %s ne correspond pas a app.json (%s)" % (tag, app),
             "Le build sur tag est arrete avant de produire un APK mal etiquette.",
             "Si c'est le bon code : corrige le tag (git tag -f v%s && git push -f origin v%s)," % (app, app),
             "sinon, complete le bump dans punch-native/app.json et re-tag.")
    man = manifest_version()
    if man != app:
        fail("MANIFEST device en %s mais app.json en %s" % (man, app),
             "La vitrine n'a pas ete relancee apres le bump. Sur le poste avec le Seeker :",
             "  cd punch-native && python scripts/device/vitrine.py",
             "Puis committe docs/site/device/ et re-tag.")
    print("OK : tag %s = app.json %s = MANIFEST device %s" % (tag, app, man))


def check_latest_release(token):
    """Mode CI : derniere release publiee vs app.json (strict au-dessus seulement)."""
    rel = http_json(API + "/releases/latest", token)
    if "tag_name" not in rel:
        print("OK : aucune release publiee encore — rien a comparer.")
        return 0
    tag = rel["tag_name"]
    ver = tag[1:] if tag.startswith("v") else tag
    app = app_version()
    order = cmp_versions(ver, app)
    if order > 0:
        fail("la release %s est PLUS RECENTE que app.json (%s)" % (tag, app),
             "L'APK publie affiche une version que le code ne porte plus.",
             "Complete le bump : punch-native/app.json = %s, commit, push — ou re-tag la release." % ver)
    if order < 0:
        # Situation transitoire normale (bump pousse, re-tag en attente) :
        # avertissement visible, mais pas d'echec — sinon la CI serait rouge
        # pendant toute la fenetre bump -> tag.
        print("::warning::release %s plus ancienne que app.json (%s) — re-tag en attente ?" % (tag, app))
        print("OK (avec avertissement) : release %s, app.json %s" % (tag, app))
        return 0
    print("OK : release %s = app.json %s" % (tag, app))
    return 0


def main():
    args = sys.argv[1:]
    if "--tag" in args:
        i = args.index("--tag")
        if i + 1 >= len(args):
            fail("--tag demande une valeur (ex. --tag v1.6.9)")
        check_tag_against_sources(args[i + 1])
        return 0
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN") or ""
    if not token:
        # Repo public : l'API reste lisible sans token (quotas stricts) ;
        # en CI, Actions fournit toujours GITHUB_TOKEN.
        print("(sans token — lecture publique de l'API)")
    return check_latest_release(token)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except urllib.error.HTTPError as e:
        print("!! HTTP %s sur %s" % (e.code, e.url))
        sys.exit(1)
