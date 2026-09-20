// Diagnostic du trésor devnet PUNCH : soldes SOL + ATA par mint.
// Usage : node scripts/check-treasury.mjs
// Les adresses sont copiées de lib/solana/devnetConfig.ts (source de vérité).
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const DEVNET_MINTS = {
  USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // vrai mint devnet Circle
  USDT: "4RDtZDZKfXREAn8nvagoQoJD35WdKbP7zRqdHATeMTDB", // mint devnet PUNCH (démo)
  SKR: "6fjyJGhNfXEDy9qFoQXCrSP7GwmWuyAZzuQw1qnSPfPk", // mint devnet PUNCH (démo)
};
const TREASURY_PUBKEY = "FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn";

const conn = new Connection("https://api.devnet.solana.com", "confirmed");
const treasury = new PublicKey(TREASURY_PUBKEY);

const sol = await conn.getBalance(treasury);
console.log(`Trésor ${TREASURY_PUBKEY}`);
console.log(`SOL   : ${(sol / 1e9).toFixed(4)}`);

for (const [token, mint] of Object.entries(DEVNET_MINTS)) {
  const ata = await getAssociatedTokenAddress(new PublicKey(mint), treasury);
  const info = await conn.getAccountInfo(ata);
  if (!info) {
    console.log(`${token.padEnd(4)} : ATA inexistante (${mint})`);
    continue;
  }
  const bal = await conn.getTokenAccountBalance(ata);
  console.log(`${token.padEnd(4)} : ${bal.value.uiAmountString ?? bal.value.uiAmount}`);
}
