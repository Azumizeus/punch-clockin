// Diagnostic : retrouve les transferts SOL significatifs (pas les micro-frais)
// sur les dernières transactions du trésor et de comptes associés.
// Usage : node scripts/trace-sol-transfers.mjs [adresse-wallet-utilisateur]
import { Connection, PublicKey } from "@solana/web3.js";

const TREASURY = new PublicKey("FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn");
const conn = new Connection("https://api.devnet.solana.com", "confirmed");
const L = 1_000_000_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function safe(fn, label) {
  for (let i = 0; i < 4; i++) {
    try {
      return await fn();
    } catch (e) {
      if (!/429/.test(String(e))) throw e;
      await sleep(3000 * (i + 1));
    }
  }
  console.log(`(rate-limit persistant sur ${label})`);
  return null;
}

// delta SOL par compte d'une tx + description des transferts SystemProgram
function describe(tx, accounts) {
  const d = tx.meta.postBalances.map((p, i) => (p - tx.meta.preBalances[i]) / L);
  const sys = [];
  for (const il of tx.transaction.message.instructions) {
    if (il.programId.toBase58() === "11111111111111111111111111111111") {
      const parsed = il;
      if (parsed.parsed?.type === "transfer") {
        const { source, destination, lamports } = parsed.parsed.info;
        sys.push(`${(lamports / L).toFixed(6)} SOL : ${source.slice(0, 6)}… → ${destination.slice(0, 6)}…`);
      } else if (parsed.parsed?.type) {
        sys.push(parsed.parsed.type);
      }
    }
  }
  return { d, sys };
}

async function scan(address, limit, label) {
  const pk = new PublicKey(address);
  const sigs = await safe(() => conn.getSignaturesForAddress(pk, { limit }), label);
  if (!sigs) return;
  console.log(`\n=== ${label} ${address.slice(0, 8)}… (${sigs.length} tx) ===`);
  for (const s of sigs) {
    await sleep(1500);
    const tx = await safe(
      () => conn.getParsedTransaction(s.signature, { maxSupportedTransactionVersion: 0 }),
      label
    );
    if (!tx) {
      console.log(`${s.signature.slice(0, 12)} ${when(s)} — tx introuvable`);
      continue;
    }
    const keys = tx.transaction.message.accountKeys.map((k) => k.pubkey.toBase58());
    const idx = keys.indexOf(pk.toBase58());
    const { d, sys } = describe(tx, keys);
    const delta = idx >= 0 ? d[idx] : 0;
    const big = tx.meta.preBalances.some((p, i) => Math.abs(d[i]) >= 0.5);
    const flag = big || tx.meta.err ? " ⚠" : "";
    console.log(
      `${s.signature.slice(0, 12)} ${when(s)} delta=${delta >= 0 ? "+" : ""}${delta.toFixed(6)} SOL${flag}` +
        (tx.meta.err ? ` ERREUR=${JSON.stringify(tx.meta.err)}` : "") +
        (sys.length ? `\n    system: ${sys.join(" | ")}` : "")
    );
  }
}

function when(s) {
  return s.blockTime ? new Date(s.blockTime * 1000).toISOString().slice(0, 16).replace("T", " ") : "?";
}

// 1. Le trésor : dernières tx
await scan(TREASURY.toBase58(), 25, "TRÉSOR");

// 2. Wallet utilisateur passé en argument (optionnel)
const userArg = process.argv[2];
if (userArg) await scan(userArg, 25, "UTILISATEUR");
else console.log("\nAstuce : passe l'adresse du wallet Seeker en argument : node scripts/trace-sol-transfers.mjs <adresse>");
