// Point d'entrée custom : pose les polyfills Node (Buffer, crypto.getRandomValues)
// AVANT que expo-router ne scanne et charge toutes les routes.
//
// Avec "main": "expo-router/entry" directement, le router découvre et
// require() toutes les routes (app/**) pendant son initialisation, donc
// tout fichier qui référence `Buffer` au niveau module (ex: libs Solana)
// plante avec "Property 'Buffer' doesn't exist" — le polyfill posé dans
// app/_layout.tsx arrive trop tard dans l'ordre de chargement.
// En le posant ici, en tout premier, il est garanti disponible avant
// que quoi que ce soit d'autre ne soit chargé.

import "react-native-get-random-values";
import { Buffer } from "buffer";

if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

import "expo-router/entry";
