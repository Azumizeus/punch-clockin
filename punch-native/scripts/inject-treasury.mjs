// Garantit qu'un fichier treasurySecretDEVNET.local.ts existe pour tsc/Metro.
//
// La vraie clé du trésor n'est JAMAIS versionnée : elle vit dans
// `treasurySecretDEVNET.local.ts` (gitigné) sur les machines de dev, ou dans
// le secret GitHub Actions `TREASURY_SECRET_DEVNET` pour la CI.
//
// Comportement :
//  - secret CI défini  -> validé (JSON, 64 octets) puis écrit dans .local ;
//  - pas de secret, .local absent -> le GABARIT example est copié : la CI
//    compile, et tout APK produit est explicitement marqué « démo trésor » ;
//  - .local déjà présent (machine de dev) -> rien à faire.
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const dir = path.dirname(url.fileURLToPath(import.meta.url));
const local = path.join(dir, "..", "lib", "solana", "treasurySecretDEVNET.local.ts");
const example = path.join(dir, "..", "lib", "solana", "treasurySecretDEVNET.example.ts");

const secret = (process.env.TREASURY_SECRET_DEVNET || "").trim();
if (secret) {
  let arr;
  try {
    arr = JSON.parse(secret);
  } catch {
    console.error("TREASURY_SECRET_DEVNET invalide : JSON attendu (tableau de 64 octets).");
    process.exit(1);
  }
  if (!Array.isArray(arr) || arr.length !== 64 || arr.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    console.error("TREASURY_SECRET_DEVNET invalide : tableau JSON de 64 octets (0-255) attendu.");
    process.exit(1);
  }
  fs.writeFileSync(
    local,
    "// Injecté par CI (secret GitHub TREASURY_SECRET_DEVNET).\n" +
      "export const TREASURY_SECRET_KEY_DEVNET: number[] = " + JSON.stringify(arr) + ";\n",
  );
  console.log("Trésor : clé injectée depuis le secret CI.");
} else if (!fs.existsSync(local)) {
  fs.copyFileSync(example, local);
  console.log("Trésor : GABARIT zéro copié — APK « démo trésor » (le vrai trésor n'existe pas sur cette machine).");
  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, "TREASURY_FALLBACK=1\n");
  }
} else {
  console.log("Trésor : .local déjà présent (machine de dev) — inchangé.");
}
