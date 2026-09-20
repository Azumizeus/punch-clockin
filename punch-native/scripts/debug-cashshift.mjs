// Debug du flux cashShift : trouve l'adresse du dernier wallet payé par le
// trésor, reconstruit exactement la tx de paiement (comme sendTreasuryToUserTransfer)
// et la SIMULE sur devnet pour voir l'erreur on-chain réelle.
// Usage : node scripts/debug-cashshift.mjs
import fs from "node:fs";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";

const TREASURY_PUBKEY = "FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn";
const MINTS = {
  USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  USDT: "4RDtZDZKfXREAn8nvagoQoJD35WdKbP7zRqdHATeMTDB",
  SKR: "6fjyJGhNfXEDy9qFoQXCrSP7GwmWuyAZzuQw1qnSPfPk",
};
const conn = new Connection("https://api.devnet.solana.com", "confirmed");
const treasury = new PublicKey(TREASURY_PUBKEY);

// --- clé du trésor depuis le .local (hors git, encodage UTF-16 possible) ---
const rawLocal = fs.readFileSync(
  new URL("../lib/solana/treasurySecretDEVNET.local.ts", import.meta.url)
);
const local = rawLocal.toString("utf16le").includes("TREASURY")
  ? rawLocal.toString("utf16le")
  : rawLocal.toString("utf8");
const m = local.match(/TREASURY_SECRET_KEY_DEVNET[^=]*=\s*\[([^\]]+)\]/);
if (!m) throw new Error("clé du trésor introuvable dans .local");
const secret = Uint8Array.from(
  m[1].split(/[\s,]+/).map((s) => s.trim()).filter((s) => s !== "").map(Number)
);
const keypair = Keypair.fromSecretKey(secret);
console.log("Clé du trésor OK, pubkey:", keypair.publicKey.toBase58() === TREASURY_PUBKEY ? "CORRESPOND" : "NE CORRESPOND PAS !");

// --- retrouve le dernier wallet utilisateur payé par le trésor ---
const sigs = await conn.getSignaturesForAddress(treasury, { limit: 15 });
let user = null;
for (const s of sigs) {
  const tx = await conn.getTransaction(s.signature, { maxSupportedTransactionVersion: 0 });
  if (!tx?.meta?.postTokenBalances) continue;
  for (const tb of tx.meta.postTokenBalances) {
    if (tb.owner && tb.owner !== TREASURY_PUBKEY) {
      user = new PublicKey(tb.owner);
      console.log(`Dernier wallet utilisateur vu dans une tx trésor: ${tb.owner} (mint ${tb.mint.slice(0, 8)}…, sig ${s.signature.slice(0, 12)}…)`);
      break;
    }
  }
  if (user) break;
}
if (!user) {
  console.log("Aucun wallet utilisateur trouvé dans les 15 dernières tx — je teste avec une adresse factice.");
  user = Keypair.generate().publicKey;
}

// --- reconstruit la tx de paiement EXACTEMENT comme sendTreasuryToUserTransfer ---
async function ensureAtaIx(payer, owner, mint, instructions) {
  const ata = await getAssociatedTokenAddress(mint, owner);
  const info = await conn.getAccountInfo(ata);
  if (!info) {
    console.log(`ATA ${owner.toBase58().slice(0, 8)}…/${mint.slice(0, 8)}… inexistante → ix de création ajoutée`);
    instructions.push(createAssociatedTokenAccountInstruction(payer, ata, owner, mint));
  }
  return ata;
}

async function simulate(label, mint, amountBase) {
  const instructions = [];
  const fromAta = await ensureAtaIx(treasury, treasury, mint, instructions);
  const toAta = await ensureAtaIx(treasury, user, mint, instructions);
  instructions.push(createTransferInstruction(fromAta, toAta, treasury, amountBase));
  const tx = new Transaction().add(...instructions);
  const bh = await conn.getLatestBlockhash("confirmed");
  tx.recentBlockhash = bh.blockhash;
  tx.feePayer = treasury;
  tx.sign(keypair);
  const sim = await conn.simulateTransaction(tx);
  console.log(`\n=== SIMULATION ${label} : ${sim.value.err ? "ÉCHEC" : "OK"} ===`);
  if (sim.value.err) {
    console.log("Erreur:", JSON.stringify(sim.value.err));
    (sim.value.logs ?? []).forEach((l) => console.log(" ", l));
  } else {
    console.log("La transaction passerait — le problème est ailleurs (réseau téléphone/RPC).");
  }
}

// cafe-lumen : payout 4.2 USDC, part travailleur 92% => 3.864 -> 3.86 attendu
await simulate("cafe-lumen (3.864 USDC)", new PublicKey(MINTS.USDC), Math.round(4.2 * 0.92 * 1e6));
// swap-pulse : payout 180 SKR (dec 0), 92% => 165.6 -> 166 attendu
await simulate("swap-pulse (165.6 SKR)", new PublicKey(MINTS.SKR), Math.round(180 * 0.92));
