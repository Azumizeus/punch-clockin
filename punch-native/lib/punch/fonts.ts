export const fonts = {
  display: "Fraunces_500Medium",
  displaySemi: "Fraunces_600SemiBold",
  body: "Figtree_400Regular",
  bodyMedium: "Figtree_500Medium",
  bodySemi: "Figtree_600SemiBold",
  mono: "IBMPlexMono_400Regular",
};

const BASE = { ...fonts };

/**
 * Portage fidèle de `html[data-skin]` du CSS PUNCH-ABC : l'habillage remplace
 * --font-sans sur TOUTE la page, donc la police du corps change globalement :
 *   a (Pointeuse)  = tout le corps en IBM Plex Mono (industriel)
 *   b (Ticket)     = tout le corps en Fraunces serif
 *   c (Éditorial)  = Figtree par défaut
 * Appelé par useColors() AVANT la création des styles des écrans.
 */
export function applyLookFonts(look: "a" | "b" | "c") {
  if (look === "a") {
    fonts.body = BASE.mono;
    fonts.bodyMedium = BASE.mono;
    fonts.bodySemi = BASE.mono;
    fonts.display = BASE.display;
    fonts.displaySemi = BASE.displaySemi;
  } else if (look === "b") {
    fonts.body = BASE.display;
    fonts.bodyMedium = BASE.displaySemi;
    fonts.bodySemi = BASE.displaySemi;
    fonts.display = BASE.display;
    fonts.displaySemi = BASE.displaySemi;
  } else {
    Object.assign(fonts, BASE);
  }
}
