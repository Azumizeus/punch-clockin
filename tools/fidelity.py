# -*- coding: utf-8 -*-
"""
Jauge de fidelite habillage : compare les tokens du CSS source valide
(punch app grok/PUNCH-ABC/src/styles.css) aux palettes natives
(punch-native/lib/punch/theme.ts).

Extraction :
  - CSS  : blocs html[data-theme=...][data-skin=...] { --color-x: ...; }
           + blocs de base @theme et html[data-theme=...] (heritage)
  - natif: palettes (theme de base) et lookPalettes[look][theme]

Mapping tokens CSS -> natif :
  bg=--color-bg  fg=--color-fg  card=--color-surface  input=--color-surface-2
  dim=--color-subtle  dim2=--color-muted  accent=--color-accent
  accentFg=--color-accent-fg  border=--color-line-strong  borderLight=--color-line
  paper=--color-paper  paperFg=--color-paper-fg  paperMuted=--color-paper-muted
"""
import re
import sys

CSS_PATH = "punch app grok/PUNCH-ABC/src/styles.css"
NATIVE_PATH = "punch-native/lib/punch/theme.ts"

TOKEN_MAP = {
    "--color-bg": "bg",
    "--color-fg": "fg",
    "--color-subtle": "dim",
    "--color-muted": "dim2",
    "--color-surface": "card",
    "--color-surface-2": "input",
    "--color-line-strong": "border",
    "--color-line": "borderLight",
    "--color-accent": "accent",
    "--color-accent-fg": "accentFg",
    "--color-paper": "paper",
    "--color-paper-fg": "paperFg",
    "--color-paper-muted": "paperMuted",
}
TOKENS = ["bg", "fg", "dim", "dim2", "card", "input", "border", "borderLight", "accent", "accentFg", "paper", "paperFg", "paperMuted"]


def parse_css_var(block: str, var: str):
    m = re.search(re.escape(var) + r"\s*:\s*([^;]+);", block)
    return m.group(1).strip() if m else None


def norm(v):
    if v is None:
        return None
    v = v.strip()
    v = re.sub(r"\s+", " ", v)
    # harmonise espaces dans rgba()
    v = re.sub(r"rgba\(\s*([^)]+?)\s*\)", lambda m: "rgba(" + re.sub(r"\s*,\s*", ", ", m.group(1)) + ")", v)
    v = v.lower()
    # #AABBCC -> #aabbcc deja fait ; raccourcis #abc -> #aabbcc
    m = re.fullmatch(r"#([0-9a-f]{3})", v)
    if m:
        v = "#" + "".join(c * 2 for c in m.group(1))
    return v


def parse_css():
    css = open(CSS_PATH, encoding="utf-8").read()
    # decoupe en blocs "selecteur { ... }"
    blocks = re.findall(r"([^{}]+)\{([^{}]*)\}", css)

    # base @theme
    base = {}
    theme_dark = {}   # le bloc @theme EST le dark de base
    theme_light = {}
    for sel, body in blocks:
        sel = sel.strip()
        if sel.startswith("@theme"):
            for var, tok in TOKEN_MAP.items():
                v = parse_css_var(body, var)
                if v:
                    base[tok] = norm(v)
    theme_light = {}
    for sel, body in blocks:
        sel = sel.strip()
        if sel == 'html[data-theme="light"]':
            for var, tok in TOKEN_MAP.items():
                v = parse_css_var(body, var)
                if v:
                    theme_light[tok] = norm(v)

    skins = {}  # skins[(look, theme)] = dict overrides
    for sel, body in blocks:
        sel = " ".join(sel.split())
        m = re.match(r'html\[data-theme="(\w+)"\]\[data-skin="(\w)"\]', sel)
        if not m:
            m = re.match(r'html\[data-skin="(\w)"\]', sel)
            if m:
                theme = None  # override independant du theme (fontes/rayons)
                look = m.group(1)
                skins[(look, None)] = body
                continue
            continue
        theme, look = m.group(1), m.group(2)
        d = {}
        for var, tok in TOKEN_MAP.items():
            v = parse_css_var(body, var)
            if v:
                d[tok] = norm(v)
        skins[(look, theme)] = d
    return base, theme_light, skins


def parse_native():
    src = open(NATIVE_PATH, encoding="utf-8").read()
    # palettes de base
    base_m = re.search(r"export const palettes = \{(.*?)\n\};", src, re.S)
    base_block = base_m.group(1)
    base = {}
    for theme in ("dark", "light", "gold"):
        m = re.search(theme + r":\s*\{(.*?)\n  \}", base_block, re.S)
        if not m:
            continue
        d = {}
        for tok in TOKENS:
            vm = re.search(tok + r":\s*\"([^\"]+)\"", m.group(1))
            if vm:
                d[tok] = norm(vm.group(1))
        base[theme] = d
    # lookPalettes
    lp_m = re.search(r"export const lookPalettes: Record<Look, Record<Theme, Palette>> = \{(.*)\n\};", src, re.S)
    lp_src = lp_m.group(1)
    looks = {}
    # decoupe par look b:/c: (niveau 1)
    for look in ("b", "c"):
        m = re.search(r"\n  " + look + r":\s*\{", lp_src)
        if not m:
            continue
        start = m.end()
        depth = 1
        i = start
        while depth > 0 and i < len(lp_src):
            if lp_src[i] == "{":
                depth += 1
            elif lp_src[i] == "}":
                depth -= 1
            i += 1
        block = lp_src[start:i - 1]
        themes = {}
        for theme in ("dark", "light", "gold"):
            tm = re.search(r"\n    " + theme + r":\s*\{", block)
            if not tm:
                continue
            s2 = tm.end()
            depth = 1
            j = s2
            while depth > 0 and j < len(block):
                if block[j] == "{":
                    depth += 1
                elif block[j] == "}":
                    depth -= 1
                j += 1
            tb = block[s2:j - 1]
            d = {}
            for tok in TOKENS:
                vm = re.search(r"\b" + tok + r":\s*\"([^\"]+)\"", tb)
                if vm:
                    d[tok] = norm(vm.group(1))
            themes[theme] = d
        looks[look] = themes
    return base, looks


def main():
    css_base, css_light, css_skins = parse_css()
    nat_base, nat_looks = parse_native()

    print("=" * 78)
    print("JAUGE DE FIDELITE HABILLAGE  (source CSS valide vs natif)")
    print("=" * 78)

    total = ok = 0
    diffs = []

    def cmp(label, css_map, nat_map, overrides):
        nonlocal total, ok
        for tok in TOKENS:
            cv = overrides.get(tok, css_map.get(tok))
            nv = nat_map.get(tok)
            if cv is None or nv is None:
                continue
            total += 1
            if cv == nv:
                ok += 1
            else:
                diffs.append((label, tok, cv, nv))

    # base dark = @theme, base light = html[data-theme=light]
    print("\n[THEME DE BASE]  dark (C en herite) / light")
    cmp("base dark", css_base, nat_base.get("dark", {}), {})
    cmp("base light", css_light, nat_base.get("light", {}), {})

    # skins : dark = base dark + overrides ; light = base light + overrides
    for look in ("b", "c"):
        for theme, css_theme_map in (("dark", css_base), ("light", css_light)):
            ov = css_skins.get((look, theme), {})
            nat = nat_looks.get(look, {}).get(theme, {})
            print(f"\n[HABILLAGE {look.upper()} x {theme}]  ({len(ov)} surcharges CSS)")
            cmp(f"{look} {theme}", css_theme_map, nat, ov)

    print("\n" + "=" * 78)
    pct = 100.0 * ok / total if total else 0
    print(f"SCORE : {ok}/{total} tokens conformes  ({pct:.1f} %)")
    if diffs:
        print(f"\nECARTS ({len(diffs)}) :")
        for label, tok, cv, nv in diffs:
            print(f"  {label:12s} {tok:11s} CSS={cv:26s} natif={nv}")
    else:
        print("AUCUN ECART — portage fidele a 100 %.")
    return 0 if pct >= 95 else 1


if __name__ == "__main__":
    sys.exit(main())
