import { fonts } from "./fonts";
import type { Look } from "./types";

// GOLD SEEKER PREMIUM — LA COMPOSITION UNIQUE (v1.5.0).
// Fusion assumée de B (serif Fraunces, angles bruts 2 px, étiquettes TIME,
// nav pointillée, pressTilt) et de C (onglets hardware, espacement éditorial
// des titres, monolithe) : une seule manière d'être affiché.

// Polices : le corps entier en Fraunces serif (héritage B), titres Fraunces,
// mono réservé aux horodatages et aux codes. C'était la signature de B.
export function lookShape(look: Look): { radius: number; bodyFont: string; displayFont: string } {
  return { radius: 2, bodyFont: fonts.display, displayFont: fonts.display };
}

// Nom et accroche de l'identité — un seul habillage dorénavant.
export const lookGallery: Record<Look, { name: string; sub: string; desc: { fr: string; en: string } }> = {
  b: {
    name: "Seeker Premium",
    sub: "GOLD EDITION · FUSION B+C",
    desc: {
      fr: "Le monolithe noir à lampe or, les tickets ivoire à encre brûlée — une seule identité.",
      en: "The warm-black monolith with its gold lamp, ivory tickets in burnt ink — one identity.",
    },
  },
};

// Les flags de composition de la fusion — un seul jeu pour toute l'app.
export interface LookTokens {
  /** Titre CLOCK IN en mono industriel. */
  monoTitle: boolean;
  /** Libellés UI (CTA, sous-titres) en mono + capitales. */
  monoUi: boolean;
  /** Étiquettes TIME / COUNTRY / SPLIT sur le ticket (héritage B). */
  labels: boolean;
  /** Capitales sur les valeurs du ticket. */
  upper: boolean;
  titleSpacing: number;
  /** Rayon des boutons : 2 px bruts — la signature ticket. */
  ctaRadius: number;
  /** true = cadran couleur accent ; false = cadran ivoire. */
  dialInnerAccent: boolean;
  /** Anneau du cadran : or machine. */
  dialRing: "accent" | "gold";
  /** Horloge live sous le titre. */
  clockTag: false | "dash" | "mono";
  /** Onglets hardware ‖ DOM / 2 VUE sous le titre (héritage C). */
  hwNav: boolean;
  ticketRadius: number;
  /** Bordure franche autour du ticket. */
  ticketBorder: boolean;
  /** Bordure POINTILLÉE façon déchirure de ticket (héritage B). */
  ticketDashed: boolean;
  /** Le ticket s'enfonce au toucher (héritage B). */
  pressTilt: boolean;
  /** Ticket entièrement en mono. */
  ticketMono: boolean;
}

export function lookTokens(look: Look): LookTokens {
  return {
    monoTitle: false,
    monoUi: true,
    labels: true,
    upper: true,
    titleSpacing: -1.6, // espacement éditorial C (letter-spacing -0.04em)
    ctaRadius: 2,
    dialInnerAccent: true,
    dialRing: "gold", // anneau or machine, signature de l'identité
    clockTag: "mono", // LOCAL TIME de C — utile sur un Seeker
    hwNav: true,
    ticketRadius: 2,
    ticketBorder: false,
    ticketDashed: true,
    pressTilt: true,
    ticketMono: false,
  };
}

export const isB = (look: Look) => look === "b";
