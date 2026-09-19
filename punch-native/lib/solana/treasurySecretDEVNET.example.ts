// ⚠️ DEVNET UNIQUEMENT — NE JAMAIS FAIRE ÇA SUR MAINNET.
//
// Ceci est un GABARIT, versionné publiquement. La vraie clé du trésor vit
// dans `treasurySecretDEVNET.local.ts`, à côté de ce fichier, qui n'est PAS
// versionné (voir .gitignore) — il n'existe que sur les machines de dev.
//
// Pour builder le projet localement :
//   1. Copie ce fichier en `treasurySecretDEVNET.local.ts`.
//   2. Remplace le tableau ci-dessous par une vraie paire de clés devnet :
//        import { Keypair } from "@solana/web3.js";
//        console.log(Array.from(Keypair.generate().secretKey));
//   3. Finance l'adresse publique correspondante via le faucet devnet
//      (SOL, puis les mints custom SKR/USDT/USDC — voir docs/README-NATIVE.md).
//
// Le jury n'a pas besoin de faire ça : l'APK signé fourni dans
// `punch-native/releases/` est déjà construit avec le vrai trésor.
export const TREASURY_SECRET_KEY_DEVNET: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
