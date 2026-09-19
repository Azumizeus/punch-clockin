import { fonts } from "./fonts";
import type { Look } from "./types";

// Rayons et polices par habillage, source PUNCH-ABC/src/styles.css :
//  a = 999px partout + IBM Plex Mono (sans = mono, display = serif)
//  b = 2px partout + Fraunces partout (sans = serif)
//  c = rayons du design de base + Figtree/Fraunces
export function lookShape(look: Look): { radius: number; bodyFont: string; displayFont: string } {
  if (look === "a") return { radius: 999, bodyFont: fonts.mono, displayFont: fonts.display };
  if (look === "b") return { radius: 4, bodyFont: fonts.display, displayFont: fonts.display };
  return { radius: 16, bodyFont: fonts.body, displayFont: fonts.display };
}

// Noms et accroches de la galerie, repris des looks-screen.tsx du workspace web
// (« Horloge d'usine », « Ticket de pointeuse », « Hardware Seeker »).
export const lookGallery: Record<Look, { name: string; sub: string; desc: { fr: string; en: string } }> = {
  a: {
    name: "Horloge d'usine",
    sub: "SKIN A · CLOCK-MACHINE",
    desc: {
      fr: "Chiffres monospace, pillules, cadran or sur noir — la beauté de la machine.",
      en: "Monospace digits, pills, gold dial on black — the beauty of the machine.",
    },
  },
  b: {
    name: "Ticket de pointeuse",
    sub: "SKIN B · PAPER TICKET",
    desc: {
      fr: "Papier, serif, angles vifs : chaque pointage devient un reçu.",
      en: "Paper, serif type, sharp corners: every punch becomes a receipt.",
    },
  },
  c: {
    name: "Hardware Seeker",
    sub: "SKIN C · HARDWARE",
    desc: {
      fr: "Monolithe noir, lignes effacées, chiffres nus. La machine et rien d'autre.",
      en: "Black monolith, erased lines, bare digits. The machine and nothing else.",
    },
  },
};

// Les 3 habillages redéfinissent l'expérience CLOCK IN (titre, cadran, ticket,
// boutons) comme les maquettes public/looks de l'export 19 sept. :
//  - a = "Pointeuse" : mono industriel, cadran ivoire, angles vifs
//  - b = "Ticket papier" : étiquettes TIME / COUNTRY / SPLIT, angles bruts
//  - c = "Éditorial" (défaut) : serif Fraunces, angles doux — le look actuel
// Les thèmes (dark / light / gold) restent la palette de couleurs ; l'habillage
// change la typographie, les formes et la composition. Les deux se combinent.
export interface LookTokens {
  /** Titre CLOCK IN en mono industriel (look a). */
  monoTitle: boolean;
  /** Libellés UI (CTA, sous-titres) en mono + capitales. */
  monoUi: boolean;
  /** Étiquettes TIME / COUNTRY / SPLIT sur le ticket (look b). */
  labels: boolean;
  /** Capitales sur les valeurs du ticket. */
  upper: boolean;
  titleSpacing: number;
  /** Rayon des boutons : 4 (industriel), 999 (pilule), 16 (éditorial). */
  ctaRadius: number;
  /** true = cadran couleur accent ; false = cadran ivoire (c.fg, look a). */
  dialInnerAccent: boolean;
  /** Anneau du cadran : "gold" = or machine #d4af37 quel que soit le thème
   * (maquette a.jpg + accent a.dark du CSS source), "accent" = couleur thème. */
  dialRing: "accent" | "gold";
  /** Horloge live sous le titre : "—" encadré (a), "LOCAL TIME" mono (c). */
  clockTag: false | "dash" | "mono";
  /** Onglets hardware ‖ DOM / 2 VUE sous le titre (look c, fidèle à home.tsx). */
  hwNav: boolean;
  ticketRadius: number;
  /** Bordure franche autour du ticket (look a). */
  ticketBorder: boolean;
  /** Bordure POINTILLÉE façon déchirure de ticket (look b, nav.punch-nav CSS). */
  ticketDashed: boolean;
  /** Le ticket s'enfonce au toucher (look b, transform home.tsx). */
  pressTilt: boolean;
  /** Ticket entièrement en mono (look a). */
  ticketMono: boolean;
}

export function lookTokens(look: Look): LookTokens {
  if (look === "a") {
    return {
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
    };
  }
  if (look === "b") {
    return {
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
    };
  }
  return {
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
  };
}
