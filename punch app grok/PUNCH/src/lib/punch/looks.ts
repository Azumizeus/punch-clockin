import type { Look, LookPalette, LookShape, LookTokens, Theme } from "./types";

export const LOOKS: Look[] = ["a", "b", "c"];

export const THEMES: Theme[] = ["dark", "light", "gold", "goldLight"];

export const lookGallery: Record<Look, { name: string; sub: string; desc: { fr: string; en: string } }> = {
  a: {
    name: "Horloge d’usine",
    sub: "SKIN A · CLOCK-MACHINE",
    desc: {
      fr: "Chiffres monospace, pilules, cadran or — la beauté de la machine.",
      en: "Monospace figures, pills, gold dial — machine beauty.",
    },
  },
  b: {
    name: "Ticket de pointeuse",
    sub: "SKIN B · TIME-CARD",
    desc: {
      fr: "Papier, pointillés, le reçu est l’écran.",
      en: "Paper, dashes — the receipt is the screen.",
    },
  },
  c: {
    name: "Hardware Seeker",
    sub: "SKIN C · SEEKER",
    desc: {
      fr: "Noir, vide, un éclair. L’app d’un téléphone, pas d’un site.",
      en: "Black, empty, one bolt. A phone app, not a website.",
    },
  },
};

export const lookShape: Record<Look, LookShape> = {
  a: { radius: 999, body: '"IBM Plex Mono", ui-monospace, Menlo, monospace', display: '"Fraunces", ui-serif, Georgia, serif' },
  b: { radius: 2, body: '"Fraunces", ui-serif, Georgia, serif', display: '"Fraunces", ui-serif, Georgia, serif' },
  c: { radius: 16, body: '"Figtree", ui-sans-serif, system-ui, sans-serif', display: '"Fraunces", ui-serif, Georgia, serif' },
};

export const lookTokens: Record<Look, LookTokens> = {
  a: {
    monoTitle: true,
    monoUi: true,
    labels: false,
    upper: true,
    titleSpacing: 3,
    ctaRadius: 999,
    dialInnerAccent: false,
    dialRing: "gold",
    clockTag: "dash",
    hwNav: false,
    ticketRadius: 24,
    ticketBorder: false,
    ticketDashed: false,
    pressTilt: false,
    ticketMono: true,
  },
  b: {
    monoTitle: false,
    monoUi: true,
    labels: true,
    upper: true,
    titleSpacing: -0.5,
    ctaRadius: 4,
    dialInnerAccent: true,
    dialRing: "accent",
    clockTag: false,
    hwNav: false,
    ticketRadius: 2,
    ticketBorder: false,
    ticketDashed: true,
    pressTilt: true,
    ticketMono: false,
  },
  c: {
    monoTitle: false,
    monoUi: false,
    labels: false,
    upper: false,
    titleSpacing: -0.5,
    ctaRadius: 16,
    dialInnerAccent: true,
    dialRing: "accent",
    clockTag: "mono",
    hwNav: true,
    ticketRadius: 6,
    ticketBorder: false,
    ticketDashed: false,
    pressTilt: false,
    ticketMono: false,
  },
};

const C_MONO: LookPalette = {
  bg: "#0c0c0d",
  fg: "#f2f1ee",
  dim: "#6e6c68",
  dim2: "#9c9a96",
  card: "#0c0c0d",
  input: "#141416",
  border: "rgba(242,241,238,0.18)",
  borderLight: "transparent",
  accent: "#f2f1ee",
  accentFg: "#0c0c0d",
  paper: "#ebe6dc",
  paperFg: "#1a1916",
  paperMuted: "#6a6560",
};

export const lookPalettes: Record<Look, Record<Theme, LookPalette>> = {
  a: {
    dark: {
      bg: "#0c0a07",
      fg: "#f0e0ad",
      dim: "#8a7030",
      dim2: "#a09060",
      card: "#16120c",
      input: "#1e1910",
      border: "rgba(212,175,55,0.35)",
      borderLight: "rgba(212,175,55,0.18)",
      accent: "#d4af37",
      accentFg: "#0c0a07",
      paper: "#ebe1c4",
      paperFg: "#1a1308",
      paperMuted: "#8a7040",
    },
    light: {
      bg: "#f6f1e4",
      fg: "#2a1a00",
      dim: "#7a5600",
      dim2: "#5c3d00",
      card: "#fff8e6",
      input: "#fff3b0",
      border: "rgba(42,26,0,0.28)",
      borderLight: "rgba(42,26,0,0.12)",
      accent: "#2a1a00",
      accentFg: "#fff8e6",
      paper: "#fffaf0",
      paperFg: "#2a1a00",
      paperMuted: "#7a5600",
    },
    gold: {
      bg: "#1a1408",
      fg: "#f0c14b",
      dim: "#a0844c",
      dim2: "#c4a35a",
      card: "#241c0c",
      input: "#2e2410",
      border: "rgba(240,193,75,0.4)",
      borderLight: "rgba(240,193,75,0.2)",
      accent: "#f0c14b",
      accentFg: "#1a1408",
      paper: "#f0e0ad",
      paperFg: "#1a1408",
      paperMuted: "#8a7040",
    },
    goldLight: {
      bg: "#f0c14b",
      fg: "#2a1a00",
      dim: "#7a5600",
      dim2: "#5c3d00",
      card: "#ffe08a",
      input: "#fff3b0",
      border: "rgba(42,26,0,0.35)",
      borderLight: "rgba(42,26,0,0.18)",
      accent: "#2a1a00",
      accentFg: "#f0c14b",
      paper: "#fff8e6",
      paperFg: "#2a1a00",
      paperMuted: "#7a5600",
    },
  },
  b: {
    dark: {
      bg: "#120e09",
      fg: "#f4ead0",
      dim: "#8a7364",
      dim2: "#6b5344",
      card: "#1c160f",
      input: "#261e14",
      border: "rgba(244,234,208,0.28)",
      borderLight: "rgba(244,234,208,0.12)",
      accent: "#ebe1c4",
      accentFg: "#120e09",
      paper: "#ebe1c4",
      paperFg: "#1a1308",
      paperMuted: "#6b5344",
    },
    light: {
      bg: "#e8e0d2",
      fg: "#2c1810",
      dim: "#8a7364",
      dim2: "#6b5344",
      card: "#f4efe4",
      input: "#fffaf0",
      border: "rgba(44,24,16,0.22)",
      borderLight: "rgba(44,24,16,0.1)",
      accent: "#2c1810",
      accentFg: "#f4efe4",
      paper: "#fffaf0",
      paperFg: "#2c1810",
      paperMuted: "#6b5344",
    },
    gold: {
      bg: "#1c160c",
      fg: "#e8d5a0",
      dim: "#a0844c",
      dim2: "#c4a35a",
      card: "#261e10",
      input: "#2e2414",
      border: "rgba(232,213,160,0.3)",
      borderLight: "rgba(232,213,160,0.14)",
      accent: "#e8d5a0",
      accentFg: "#1c160c",
      paper: "#f4ead0",
      paperFg: "#1c160c",
      paperMuted: "#8a7040",
    },
    goldLight: {
      bg: "#cfc3a8",
      fg: "#2c1810",
      dim: "#8a7364",
      dim2: "#6b5344",
      card: "#f4efe4",
      input: "#fffaf0",
      border: "rgba(44,24,16,0.22)",
      borderLight: "rgba(44,24,16,0.1)",
      accent: "#2c1810",
      accentFg: "#f4efe4",
      paper: "#fffaf0",
      paperFg: "#2c1810",
      paperMuted: "#6b5344",
    },
  },
  c: {
    dark: C_MONO,
    light: C_MONO,
    gold: C_MONO,
    goldLight: C_MONO,
  },
};

export function resolveTheme(raw: unknown): Theme {
  if (raw === "gold" || raw === "goldLight" || raw === "dark") return raw;
  if (raw === "light") return "light";
  return "goldLight";
}

let applied = "";

export function applyLook(look: Look, theme: Theme) {
  const key = `${look}:${theme}`;
  if (applied === key) return;
  applied = key;
  const el = document.documentElement;
  const pal = lookPalettes[look][theme];
  const shape = lookShape[look];
  const tok = lookTokens[look];
  const map: Record<string, string> = {
    "--color-bg": pal.bg,
    "--color-fg": pal.fg,
    "--color-subtle": pal.dim,
    "--color-muted": pal.dim2,
    "--color-surface": pal.card,
    "--color-surface-2": pal.input,
    "--color-line-strong": pal.border,
    "--color-line": pal.borderLight,
    "--color-accent": pal.accent,
    "--color-accent-fg": pal.accentFg,
    "--color-paper": pal.paper,
    "--color-paper-fg": pal.paperFg,
    "--color-paper-muted": pal.paperMuted,
    "--font-sans": shape.body,
    "--font-display": shape.display,
    "--cta-radius": `${tok.ctaRadius}px`,
    "--ticket-radius": `${tok.ticketRadius}px`,
    "--title-spacing": `${tok.titleSpacing}px`,
    "--dial-ring": tok.dialRing === "gold" ? "#d4af37" : pal.accent,
  };
  const r = shape.radius;
  map["--radius-xs"] = r > 100 ? "999px" : `${Math.max(2, r / 8)}px`;
  map["--radius-sm"] = r > 100 ? "999px" : `${Math.max(2, r / 4)}px`;
  map["--radius-md"] = r > 100 ? "999px" : `${Math.max(2, r / 2)}px`;
  map["--radius-lg"] = r > 100 ? "999px" : `${r}px`;
  map["--radius-xl"] = r > 100 ? "999px" : `${r}px`;
  map["--radius-2xl"] = r > 100 ? "999px" : `${r}px`;
  for (const [k, v] of Object.entries(map)) el.style.setProperty(k, v);

  el.setAttribute("data-theme", theme);
  el.setAttribute("data-skin", look);
  el.setAttribute("data-look", look);
  el.toggleAttribute("data-mono-title", tok.monoTitle);
  el.toggleAttribute("data-mono-ui", tok.monoUi);
  el.toggleAttribute("data-labels", tok.labels);
  el.toggleAttribute("data-upper", tok.upper);
  el.toggleAttribute("data-ticket-border", tok.ticketBorder);
  el.toggleAttribute("data-ticket-dashed", tok.ticketDashed);
  el.toggleAttribute("data-press-tilt", tok.pressTilt);
  el.toggleAttribute("data-ticket-mono", tok.ticketMono);
  el.toggleAttribute("data-hw-nav", tok.hwNav);
  el.toggleAttribute("data-dial-inner", tok.dialInnerAccent);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", pal.bg);
}
