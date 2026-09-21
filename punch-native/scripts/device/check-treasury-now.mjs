// Verification on-chain : dernieres transactions du tresor PUNCH (devnet).
// Repond a : le swap de test (100 SKR) est-il arrive on-chain ?
import { Connection, PublicKey } from "@solana/web3.js";

const TREASURY = "FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn";
const conn = new Connection("https://api.devnet.solana.com", "confirmed");

const sigs = await conn.getSignaturesForAddress(new PublicKey(TREASURY), { limit: 12 });
console.log(`Dernieres tx du tresor (${sigs.length}) :`);
for (const s of sigs) {
  const when = s.blockTime ? new Date(s.blockTime * 1000).toISOString().slice(11, 19) : "?";
  console.log(`  ${when}Z  ${s.signature.slice(0, 20)}…  ${s.err ? "ECHEC" : "ok"}`);
}

const recent = sigs.filter((s) => s.blockTime && Date.now() / 1000 - s.blockTime < 1800);
if (recent.length) {
  console.log("\nDetails des tx de moins de 30 min :");
  for (const s of recent.slice(0, 5)) {
    const tx = await conn.getTransaction(s.signature, { maxSupportedTransactionVersion: 0 });
    const memo = tx?.meta?.logMessages?.find((l) => l.includes("PUNCH")) ?? "";
    const keys = tx?.transaction.message.accountKeys.map((k) => k.toBase58()) ?? [];
    console.log(`  ${s.signature.slice(0, 24)}… memo=[${memo.slice(0, 60)}] comptes=${keys.length}`);
  }
} else {
  console.log("\nAucune tx du tresor dans les 30 dernieres minutes.");
}
