// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // globe.tsx est un canvas animé impératif : sa boucle RAF lit theta/Date.now
    // à chaque frame et re-rend via setState. Les règles React Compiler
    // (react-hooks/refs & purity) supposent un rendu pur et flaguent ce pattern
    // par erreur ; le compilateur bail-out déjà sur ce composant.
    files: ["**/globe.tsx"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
    },
  },
]);

