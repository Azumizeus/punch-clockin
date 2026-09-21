// SKIN 3D VECTORIEL — le relief de l'identité Seeker Premium (v1.7).
// Le même design (monolithe, tickets ivoire, or machine) rendu en volume :
// badge métallique en 3 nuances, cadran avec bague et biseau, ticket papier
// qui porte une ombre. AUCUNE couleur nouvelle : tout est DÉRIVÉ des 13
// tokens (premiumPalettes) et du métal du thème (metalKit) — l'or et la
// Nuit restent les deux seules lumières de l'app.
import { metalKit, type Palette } from "./theme";

/** Ombre iOS typée (sans literal types, pour laisser chaque surface ajuster
 * son opacité) + "élévation" Android = l'ombre que le moteur dessine dessous. */
export interface IosShadow {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
}

export const SKIN3D_SHADOWS: { ios: IosShadow; android: { elevation: number } } = {
  ios: { shadowColor: "#000000", shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 7 },
};

export interface Skin3D {
  /** Décalage isométrique du bloc-titre (léger, jamais un jeu de société). */
  iso: { rx: string; ry: string; rz: string };
  /** Biseau du badge métallique : bord haut éclairé, bord bas dans l'ombre. */
  badgeBevel: { hi: string; low: string };
  /** Relief du cadran : bague claire (reflet) + assiette sombre sous le disque. */
  dial: { bezel: string; plate: string; ringTrack: string; ringOn: string };
  /** Le ticket papier quitte l'écran : ombre + liseré de découpe. */
  ticket: { shadow: IosShadow; androidElevation: number; cutEdge: string };
  /** Jetons de wallet en pièces : liseré de tranche par token. */
  coinRim: string;
  /** Relief des cartes stats (identique partout : une seule règle). */
  cardLift: { shadow: IosShadow; androidElevation: number };
}

export function skin3d(theme: "gold" | "nuit", p?: Palette): Skin3D {
  const m = metalKit(theme);
  const isGold = theme === "gold";
  // La piste d'anneau se dérive de borderLight quand la palette est fournie ;
  // sinon (composants métal seuls) un neutre du thème fait l'affaire.
  const ringTrack = p?.borderLight ?? (isGold ? "rgba(212, 175, 55, 0.28)" : "rgba(192, 199, 209, 0.28)");
  return {
    // La Nuit, lumière plus froide : même pose, un cran plus discrète.
    iso: isGold
      ? { rx: "6.5deg", ry: "-4.5deg", rz: "-2.5deg" }
      : { rx: "4.5deg", ry: "-3deg", rz: "-1.5deg" },
    badgeBevel: { hi: m.rim, low: "rgba(0, 0, 0, 0.4)" },
    // La bague reprend l'or machine ; l'assiette plonge sous le fond du mono-
    // lithe (noir absolu) pour que le disque accent "flotte" au-dessus.
    dial: {
      bezel: m.hi,
      plate: isGold ? "#030303" : "#030408",
      ringTrack,
      ringOn: m.mid,
    },
    ticket: {
      shadow: { ...SKIN3D_IOS_FALLBACK, shadowOpacity: isGold ? 0.4 : 0.55 },
      androidElevation: 6,
      // Liseré de découpe : le bord du papier attrape la lumière du métal.
      cutEdge: m.hi,
    },
    coinRim: m.rim,
    cardLift: {
      shadow: { ...SKIN3D_IOS_FALLBACK, shadowOpacity: isGold ? 0.3 : 0.5 },
      androidElevation: 5,
    },
  };
}

// Référence partagée (évite de répéter l'objet iOS) — même valeurs partout.
const SKIN3D_IOS_FALLBACK = SKIN3D_SHADOWS.ios;
