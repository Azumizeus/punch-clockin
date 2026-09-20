import type { Look, Theme } from "./types";

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

export type ThemePalette = (typeof palettes)["dark"];
export type Palette = ThemePalette;

// Palettes validées des 3 habillages — PORTAGE EXACT du web validé
// (punch app grok/PUNCH/src/lib/punch/looks.ts — lookPalettes).
// 13 tokens (bg fg dim dim2 card input border borderLight accent accentFg
// paper paperFg paperMuted) × 4 thèmes × 3 looks.
//  - a : machine or (dark or sur noir, light crème, gold lampe or, goldLight jaune machine)
//  - b : papier de pointeuse (dark brûlé, light lin, gold crème-or, goldLight lin doré)
//  - c : MONOLITHE — la même palette mono dans les 4 thèmes (le skin ignore
//    délibérément le thème, c'est ce qui le rend reconnaissable).
export const lookPalettes: Record<Look, Record<Theme, Palette>> = {
  a: {
    dark: {
      bg: "#0c0a07",
      fg: "#f0e0ad",
      dim: "#8a7030",
      dim2: "#a09060",
      card: "#16120c",
      input: "#1e1910",
      border: "rgba(212, 175, 55, 0.35)",
      borderLight: "rgba(212, 175, 55, 0.18)",
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
      border: "rgba(42, 26, 0, 0.28)",
      borderLight: "rgba(42, 26, 0, 0.12)",
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
      border: "rgba(240, 193, 75, 0.4)",
      borderLight: "rgba(240, 193, 75, 0.2)",
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
      border: "rgba(42, 26, 0, 0.35)",
      borderLight: "rgba(42, 26, 0, 0.18)",
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
      border: "rgba(244, 234, 208, 0.28)",
      borderLight: "rgba(244, 234, 208, 0.12)",
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
      border: "rgba(44, 24, 16, 0.22)",
      borderLight: "rgba(44, 24, 16, 0.1)",
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
      border: "rgba(232, 213, 160, 0.3)",
      borderLight: "rgba(232, 213, 160, 0.14)",
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
      border: "rgba(44, 24, 16, 0.22)",
      borderLight: "rgba(44, 24, 16, 0.1)",
      accent: "#2c1810",
      accentFg: "#f4efe4",
      paper: "#fffaf0",
      paperFg: "#2c1810",
      paperMuted: "#6b5344",
    },
  },
  c: {
    // C = MONOLITHE NOIR dans les 4 thèmes (règle 2 de la checklist :
    // "C est un monolithe noir dans les 4 thèmes").
    dark: {
      bg: "#0c0c0d",
      fg: "#f2f1ee",
      dim: "#6e6c68",
      dim2: "#9c9a96",
      card: "#0c0c0d",
      input: "#141416",
      border: "rgba(242, 241, 238, 0.18)",
      borderLight: "transparent",
      accent: "#f2f1ee",
      accentFg: "#0c0c0d",
      paper: "#ebe6dc",
      paperFg: "#1a1916",
      paperMuted: "#6a6560",
    },
    light: {
      bg: "#0c0c0d",
      fg: "#f2f1ee",
      dim: "#6e6c68",
      dim2: "#9c9a96",
      card: "#0c0c0d",
      input: "#141416",
      border: "rgba(242, 241, 238, 0.18)",
      borderLight: "transparent",
      accent: "#f2f1ee",
      accentFg: "#0c0c0d",
      paper: "#ebe6dc",
      paperFg: "#1a1916",
      paperMuted: "#6a6560",
    },
    gold: {
      bg: "#0c0c0d",
      fg: "#f2f1ee",
      dim: "#6e6c68",
      dim2: "#9c9a96",
      card: "#0c0c0d",
      input: "#141416",
      border: "rgba(242, 241, 238, 0.18)",
      borderLight: "transparent",
      accent: "#f2f1ee",
      accentFg: "#0c0c0d",
      paper: "#ebe6dc",
      paperFg: "#1a1916",
      paperMuted: "#6a6560",
    },
    goldLight: {
      bg: "#0c0c0d",
      fg: "#f2f1ee",
      dim: "#6e6c68",
      dim2: "#9c9a96",
      card: "#0c0c0d",
      input: "#141416",
      border: "rgba(242, 241, 238, 0.18)",
      borderLight: "transparent",
      accent: "#f2f1ee",
      accentFg: "#0c0c0d",
      paper: "#ebe6dc",
      paperFg: "#1a1916",
      paperMuted: "#6a6560",
    },
  },
};

// Couleurs de token, identiques quel que soit le thème (non redéfinies en clair dans styles.css).
export const tokenColors = {
  USDC: "#8aa0b3",
  USDT: "#8aa392",
  SKR: "#d7d2cb",
} as const;
