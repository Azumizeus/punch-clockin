import type { Look } from "./types";

// Palette reprise à l'identique de punch-app/src/styles.css (source de vérité du design).
export const palettes = {
  dark: {
    bg: "#0c0c0d",
    fg: "#f2f1ee",
    dim: "#6e6c68", // --color-subtle
    dim2: "#9c9a96", // --color-muted
    card: "#141416", // --color-surface
    input: "#1c1c1f", // --color-surface-2
    border: "rgba(242, 241, 238, 0.18)", // --color-line-strong
    borderLight: "rgba(242, 241, 238, 0.1)", // --color-line
    accent: "#d7d2cb",
    accentFg: "#0c0c0d",
    paper: "#ebe6dc",
    paperFg: "#1a1916",
    paperMuted: "#6a6560",
  },
  light: {
    bg: "#f3e6c1",
    fg: "#1a1308",
    dim: "#a0844c", // --color-subtle
    dim2: "#6e5730", // --color-muted
    card: "#faeecf", // --color-surface
    input: "#fff6de", // --color-surface-2
    border: "rgba(184, 137, 42, 0.38)", // --color-line-strong
    borderLight: "rgba(184, 137, 42, 0.2)", // --color-line
    accent: "#b8892a",
    accentFg: "#fff8e6",
    paper: "#fff8e6",
    paperFg: "#1a1308",
    paperMuted: "#8a7040",
  },
  // Thème premium "Solana Seeker Mobile Gold" — noir profond + accent or,
  // réservé aux Seekers qui veulent l'habillage premium de l'app.
  gold: {
    bg: "#0a0908",
    fg: "#f4ecd8",
    dim: "#8a7a56", // --color-subtle (doré éteint)
    dim2: "#c2a768", // --color-muted (doré clair)
    card: "#161310", // --color-surface
    input: "#201b14", // --color-surface-2
    border: "rgba(212, 175, 55, 0.28)", // --color-line-strong
    borderLight: "rgba(212, 175, 55, 0.14)", // --color-line
    accent: "#d4af37",
    accentFg: "#0a0908",
    paper: "#f4ecd8",
    paperFg: "#1a1510",
    paperMuted: "#7a6b4a",
  },
  // 4e thème demandé : "gold clair" — crème doré, accents or foncés.
  goldLight: {
    bg: "#f6ecd2",
    fg: "#241a06",
    dim: "#9a7f3e",
    dim2: "#6e5720",
    card: "#fbf4dd",
    input: "#fffbe8",
    border: "rgba(150, 116, 30, 0.38)",
    borderLight: "rgba(150, 116, 30, 0.2)",
    accent: "#a67c1a",
    accentFg: "#fffbe8",
    paper: "#fffbe8",
    paperFg: "#241a06",
    paperMuted: "#8a7038",
  },
};

export type Theme = keyof typeof palettes;
export type Palette = (typeof palettes)["dark"];

// Les habillages (looks PUNCH-ABC) s'appliquent à TOUTE l'app comme des
// variantes par thème — source : punch app grok/PUNCH-ABC/src/styles.css :
//   a = rond/horloge/mono  (pill radius, IBM Plex Mono, or sur noir / crème-or)
//   b = ticket/serif       (angles 2px, Fraunces, papier)
//   c = vide/hardware      (suit le thème, sans fioritures)
// Le THÈME reste maître : chaque look définit ses 4 variantes (dark, light,
// gold = gold black, goldLight = gold clair) — les deux gold sont dérivées
// des palettes dark/light du skin, teintées or pour coller au thème.
export const lookPalettes: Record<
  Look,
  {
    dark?: Partial<Palette>;
    light?: Partial<Palette>;
    gold?: Partial<Palette>;
    goldLight?: Partial<Palette>;
  } | null
> = {
  a: {
    dark: {
      bg: "#0c0a07",
      card: "#16120c",
      input: "#1e1910",
      fg: "#f0e0ad",
      dim2: "#a09060",
      accent: "#d4af37",
      accentFg: "#0c0a07",
    },
    light: {
      // Valeurs EXACTES de html[data-theme="light"][data-skin="a"] (styles.css) :
      // jaune machine saturé, accent = encre noire sur fond jaune.
      bg: "#f0c14b",
      card: "#ffe08a",
      input: "#fff3b0",
      fg: "#2a1a00",
      dim: "#7a5600", // --color-subtle
      dim2: "#5c3d00", // --color-muted
      accent: "#2a1a00",
      accentFg: "#f0c14b",
      border: "rgba(42, 26, 0, 0.18)",
      borderLight: "rgba(42, 26, 0, 0.35)",
    },
    // gold black : la variante dark du skin, accent or pur (machine or sur noir).
    gold: {
      bg: "#0b0906",
      card: "#171208",
      input: "#201a0a",
      fg: "#f2dfa4",
      dim: "#8a7a52",
      dim2: "#b09a5e",
      accent: "#e0b53e",
      accentFg: "#171208",
      border: "rgba(224, 181, 62, 0.3)",
      borderLight: "rgba(224, 181, 62, 0.15)",
    },
    // gold clair : la variante light du skin, dorée.
    goldLight: {
      bg: "#f0dc9e",
      card: "#f6e6ae",
      input: "#fdf2c8",
      fg: "#241a06",
      dim: "#96742c",
      dim2: "#6a5220",
      accent: "#8a6410",
      accentFg: "#fdf2c8",
      border: "rgba(138, 100, 16, 0.4)",
      borderLight: "rgba(138, 100, 16, 0.22)",
      paper: "#fdf2c8",
      paperFg: "#241a06",
      paperMuted: "#8a6f34",
    },
  },
  b: {
    dark: {
      bg: "#120e09",
      card: "#1c160f",
      input: "#261e14",
      fg: "#f4ead0",
      paper: "#ebe1c4",
      paperFg: "#1a1308",
      accent: "#ebe1c4",
      accentFg: "#120e09",
    },
    // gold black : ticket papier sous lampe — fond brun-noir, ticket crème-or.
    gold: {
      bg: "#140f08",
      card: "#201a10",
      input: "#2a2214",
      fg: "#f4e8c8",
      accent: "#f0e2b8",
      accentFg: "#140f08",
      paper: "#f0e6c6",
      paperFg: "#1a1408",
      paperMuted: "#7a6a44",
      border: "rgba(212, 175, 55, 0.25)",
      borderLight: "rgba(212, 175, 55, 0.13)",
    },
    // gold clair : papier doré vieilli.
    goldLight: {
      bg: "#e3cf96",
      card: "#f0e2b4",
      input: "#f9efd0",
      fg: "#241a06",
      dim: "#96742c",
      dim2: "#6a5220",
      accent: "#241a06",
      accentFg: "#f9efd0",
      paper: "#fffbe8",
      paperFg: "#241a06",
      paperMuted: "#8a7038",
      border: "rgba(120, 90, 20, 0.4)",
      borderLight: "rgba(120, 90, 20, 0.22)",
    },
    light: {
      // Valeurs EXACTES de html[data-theme="light"][data-skin="b"] : fond lin
      // sable, surfaces papier ivoire, accent = encre brune.
      bg: "#cfc3a8",
      card: "#f4efe4",
      input: "#fffaf0",
      fg: "#2c1810",
      dim: "#8a7364", // --color-subtle
      dim2: "#6b5344", // --color-muted
      accent: "#2c1810",
      accentFg: "#f4efe4",
      paper: "#fffaf0",
      paperFg: "#2c1810",
      paperMuted: "#8a7364",
      border: "rgba(44, 24, 16, 0.22)",
      borderLight: "rgba(44, 24, 16, 0.12)",
    },
  },
  c: {
    // C = MONOLITHE HARDWARE : la source force html[data-skin="c"] (et ses
    // variantes light/dark) sur bg = surface = #0c0c0d, texte clair, lignes
    // transparentes, accent = texte — DANS TOUS LES THÈMES. Le skin ignore
    // délibérément la palette du thème (c'est ce qui le rend reconnaissable).
    dark: {
      card: "#0c0c0d",
      input: "#0c0c0d",
      accent: "#f2f1ee",
      accentFg: "#0c0c0d",
      border: "transparent",
      borderLight: "transparent",
    },
    light: {
      bg: "#0c0c0d",
      card: "#0c0c0d",
      input: "#0c0c0d",
      fg: "#f2f1ee",
      dim: "#6e6c68",
      dim2: "#9c9a96",
      accent: "#f2f1ee",
      accentFg: "#0c0c0d",
      border: "transparent",
      borderLight: "transparent",
    },
    gold: {
      bg: "#0c0c0d",
      card: "#0c0c0d",
      input: "#0c0c0d",
      fg: "#f2f1ee",
      dim: "#6e6c68",
      dim2: "#9c9a96",
      accent: "#f2f1ee",
      accentFg: "#0c0c0d",
      border: "transparent",
      borderLight: "transparent",
    },
    goldLight: {
      bg: "#0c0c0d",
      card: "#0c0c0d",
      input: "#0c0c0d",
      fg: "#f2f1ee",
      dim: "#6e6c68",
      dim2: "#9c9a96",
      accent: "#f2f1ee",
      accentFg: "#0c0c0d",
      border: "transparent",
      borderLight: "transparent",
    },
  },
} as const;

// Couleurs de token, identiques quel que soit le thème (non redéfinies en clair dans styles.css).
export const tokenColors = {
  USDC: "#8aa0b3",
  USDT: "#8aa392",
  SKR: "#d7d2cb",
} as const;
