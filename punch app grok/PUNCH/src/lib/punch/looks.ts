import type { Look, LookPalette, LookShape, LookTokens, Theme } from "./types";

export const LOOKS: Look[] = ["b", "c"];

export const THEMES: Theme[] = ["dark", "light", "gold"];

export const lookGallery: Record<Look, { name: string; sub: string; desc: { fr: string; en: string } }> = {
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
  b: { radius: 2, body: '"Fraunces", ui-serif, Georgia, serif', display: '"Fraunces", ui-serif, Georgia, serif' },
  c: { radius: 16, body: '"Figtree", ui-sans-serif, system-ui, sans-serif', display: '"Fraunces", ui-serif, Georgia, serif' },
};

export const lookTokens: Record<Look, LookTokens> = {
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

/** Gold Seeker Premium — one gold. Ink + champagne. Not brass yellow. */
// Bordures alignées sur punch-native (v1.6.2) : or vrai #d4af37 à 0.55/0.28 —
// sur fond noir les surfaces ne se lisent que par leurs contours, jamais fantômes.
const GOLD_B: LookPalette = {
  bg: "#12100c",
  fg: "#f3e6c8",
  dim: "#a89068",
  dim2: "#c4b08a",
  card: "#1c1912",
  input: "#262218",
  border: "rgba(212,175,55,0.55)",
  borderLight: "rgba(212,175,55,0.28)",
  accent: "#c9a24a",
  accentFg: "#12100c",
  paper: "#f3e6c8",
  paperFg: "#1a140c",
  paperMuted: "#7a6848",
};

const GOLD_C: LookPalette = {
  bg: "#0c0c0d",
  fg: "#f3e6c8",
  dim: "#8a7a58",
  dim2: "#b8a478",
  card: "#0c0c0d",
  input: "#16140f",
  // Même règle que GOLD_B : contours visibles 0.55/0.28 (alignement native).
  border: "rgba(212,175,55,0.55)",
  borderLight: "rgba(212,175,55,0.28)",
  accent: "#c9a24a",
  accentFg: "#0c0c0d",
  paper: "#f3e6c8",
  paperFg: "#1a140c",
  paperMuted: "#7a6848",
};

export const lookPalettes: Record<Look, Record<Theme, LookPalette>> = {
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
    gold: GOLD_B,
  },
  c: {
    dark: {
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
    },
    light: {
      bg: "#f4efe6",
      fg: "#1a1916",
      dim: "#7a7468",
      dim2: "#9c9688",
      card: "#f4efe6",
      input: "#ece6dc",
      border: "rgba(26,25,22,0.14)",
      borderLight: "transparent",
      accent: "#1a1916",
      accentFg: "#f4efe6",
      paper: "#fffaf0",
      paperFg: "#1a1916",
      paperMuted: "#7a7468",
    },
    gold: GOLD_C,
  },
};

export function resolveTheme(raw: unknown): Theme {
  if (raw === "dark" || raw === "light" || raw === "gold") return raw;
  if (raw === "goldLight") return "gold";
  return "gold";
}

export function resolveLook(raw: unknown): Look {
  return raw === "c" ? "c" : "b";
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
    "--dial-ring": tok.dialRing === "gold" ? "#c9a24a" : pal.accent,
  };
  const r = shape.radius;
  map["--radius-xs"] = `${Math.max(2, r / 8)}px`;
  map["--radius-sm"] = `${Math.max(2, r / 4)}px`;
  map["--radius-md"] = `${Math.max(2, r / 2)}px`;
  map["--radius-lg"] = `${r}px`;
  map["--radius-xl"] = `${r}px`;
  map["--radius-2xl"] = `${r}px`;
  for (const [k, v] of Object.entries(map)) el.style.setProperty(k, v);

  el.setAttribute("data-theme", theme);
  el.setAttribute("data-skin", look);
  el.setAttribute("data-look", look);
  el.toggleAttribute("data-mono-title", tok.monoTitle);
  el.toggleAttribute("data-mono-ui", tok.monoUi);
  el.toggleAttribute("data-labels", tok.labels);
  el.toggleAttribute("data-upper", tok.upper);
  el.toggleAttribute("data-ticket-dashed", tok.ticketDashed);
  el.toggleAttribute("data-press-tilt", tok.pressTilt);
  el.toggleAttribute("data-ticket-mono", tok.ticketMono);
  el.toggleAttribute("data-hw-nav", tok.hwNav);
  el.toggleAttribute("data-dial-inner", tok.dialInnerAccent);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", pal.bg);
}
