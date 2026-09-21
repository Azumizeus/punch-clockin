// L'IDENTITÉ DE L'APP (v1.6.0) — deux palettes, une seule composition.
// Seeker Premium (gold, défaut) : fusion de B (tickets ivoire, or brûlé) et
// C (monolithe noir, lampe or). Seeker Nuit : la lune — noir bleuté, argent,
// tickets ardoise. La composition (serif, tickets, monolithe) est partagée ;
// seule la lumière change.

export type Palette = {
  bg: string;
  fg: string;
  dim: string;
  dim2: string;
  card: string;
  input: string;
  border: string;
  borderLight: string;
  accent: string;
  accentFg: string;
  paper: string;
  paperFg: string;
  paperMuted: string;
};

export const premiumPalettes: Record<"gold" | "nuit", Palette> = {
  gold: {
  // LE MONOLITHE (héritage C) — noir chaud profond, surfaces fondues dans le
  // fond : l'app est un bloc, pas un site. C'est le fond de tout.
  bg: "#0b0a07",
  card: "#0b0a07",
  input: "#0b0a07",

  // LA LAMPE OR — or vrai #d4af37, jamais un jaune consommateur. Titres en
  // champagne pâle, textes secondaires dorés éteints.
  fg: "#f5ead0",
  dim: "#8a7a56",
  dim2: "#c2a768",
  accent: "#d4af37",
  accentFg: "#0b0a07",

  // LES TICKETS (héritage B) — l'argent se rend sur papier ivoire chaud à
  // encre brûlée : reçus, tickets de pointage, pièces de la part.
  paper: "#f2e6c8",
  paperFg: "#1a1510",
  paperMuted: "#7a6b4a",

  // Traces d'or : bordures VISIBLES — sur un monolithe noir, les surfaces ne
  // se lisent que par leurs contours. Jamais fantômes.
  border: "rgba(212, 175, 55, 0.55)",
  borderLight: "rgba(212, 175, 55, 0.28)",
  },

  // SEEKER NUIT — l'option lunaire : même monolithe, même composition, mais
  // l'argent de lune remplace l'or. Noir BLEUTÉ (pas gris), acier pour les
  // titres-froids, argent vrai #c0c7d1 en accent, tickets ardoise.
  nuit: {
    // Le monolithe sous la lune — bleu très profond, jamais gris.
    bg: "#07090d",
    card: "#07090d",
    input: "#07090d",

    // La lumière froide — acier pâle pour les titres, argent pour l'action.
    fg: "#dfe5ee",
    dim: "#5f6a7d",
    dim2: "#9aa5b8",
    accent: "#c0c7d1", // argent de lune
    accentFg: "#07090d",

    // Les tickets ardoise — l'argent sur papier froid, encre bleutée.
    paper: "#dfe3ea",
    paperFg: "#10151d",
    paperMuted: "#6b7484",

    // Traces d'argent : bordures VISIBLES (même règle que l'or).
    border: "rgba(192, 199, 209, 0.55)",
    borderLight: "rgba(192, 199, 209, 0.28)",
  },
};

/** Alias rétro-compatible : la palette par défaut reste l'or. */
export const premiumPalette = premiumPalettes.gold;

// Couleurs de token, identiques quel que soit le contexte (non redéfinies
// dans styles.css du source).
export const tokenColors = {
  USDC: "#8aa0b3",
  USDT: "#8aa392",
  SKR: "#d7d2cb",
} as const;

/**
 * Kit de textures du métal du thème actif.
 * Le vrai métal ne se fabrique pas avec un seul apla : il vit par CONTRASTE
 * entre nuances (reflet / métal / ombre), comme le relief d'un vrai lingot.
 *  - gold : or 3 nuances (#f3dc8e / #d4af37 / #8a6d1f)
 *  - nuit : argent de lune (#f0f4f9 / #c0c7d1 / #7c8698)
 */
export function metalKit(theme: "gold" | "nuit") {
  return theme === "nuit"
    ? {
        hi: "#f0f4f9",
        mid: "#c0c7d1",
        low: "#7c8698",
        badgeBg: "#11151c",
        // Liseré du lingot : reflet blanc, identique quel que soit le métal.
        rim: "rgba(255, 255, 255, 0.35)",
      }
    : {
        hi: "#f3dc8e",
        mid: "#d4af37",
        low: "#8a6d1f",
        badgeBg: "#191510",
        rim: "rgba(255, 255, 255, 0.35)",
      };
}

/** Kit or historique (compat) — équivalent à metalKit("gold"). */
export const goldKit = metalKit("gold");
