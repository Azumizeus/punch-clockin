// Retrouve tous les crédits SOL >= 0.1 sur un wallet, en balayant TOUTE son
// historique avec des requêtes JSON-RPC batch (rapide, anti rate-limit).
// Usage : node scripts/find-sol-credits.mjs <adresse-wallet>
const RPC = "https://api.devnet.solana.com";
const addr = process.argv[2];
if (!addr) {
  console.error("usage: node scripts/find-sol-credits.mjs <adresse>");
  process.exit(1);
}

async function rpcBatch(calls) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(calls.map((c, i) => ({ jsonrpc: "2.0", id: i, ...c }))),
    });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
      continue;
    }
    const json = await res.json();
    if (!Array.isArray(json)) throw new Error("réponse inattendue " + res.status);
    return json.map((r) => r.result);
  }
  throw new Error("rate-limit persistant");
}

// 1. Toutes les signatures du wallet (pagination 1000)
const allSigs = [];
let before = null;
for (;;) {
  const params = [addr, { limit: 1000 }];
  if (before) params[1].before = before;
  const [sigs] = await rpcBatch([{ method: "getSignaturesForAddress", params }]);
  if (!sigs?.length) break;
  allSigs.push(...sigs);
  if (sigs.length < 1000) break;
  before = sigs[sigs.length - 1].signature;
}
console.log(`tx totales : ${allSigs.length}`);

// 2. Récupère toutes les tx en batch de 10
const L = 1e9;
const credits = [];
for (let i = 0; i < allSigs.length; i += 10) {
  const chunk = allSigs.slice(i, i + 10);
  const txs = await rpcBatch(
    chunk.map((s) => ({
      method: "getTransaction",
      params: [s.signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }],
    }))
  );
  txs.forEach((tx, j) => {
    if (!tx?.meta) return;
    const keys = tx.transaction.message.accountKeys.map((k) => k.pubkey);
    const idx = keys.indexOf(addr);
    if (idx < 0) return;
    const delta = (tx.meta.postBalances[idx] - tx.meta.preBalances[idx]) / L;
    if (delta >= 0.1) {
      const when = tx.blockTime ? new Date(tx.blockTime * 1000).toISOString().slice(0, 16).replace("T", " ") : "?";
      // d'où vient l'argent : plus grosse baisse chez un autre compte
      let src = "?";
      let worst = 0;
      tx.meta.postBalances.forEach((p, k) => {
        if (k === idx) return;
        const dd = (p - tx.meta.preBalances[k]) / L;
        if (dd < worst) { worst = dd; src = keys[k]; }
      });
      credits.push({ sig: chunk[j].signature, when, delta, src });
    }
  });
  if ((i / 10) % 10 === 0) console.log(`  …${Math.min(i + 10, allSigs.length)}/${allSigs.length} scannées`);
}

console.log(`\n=== CRÉDITS SOL >= 0.1 sur ${addr.slice(0, 8)}… : ${credits.length} ===`);
for (const c of credits) {
  console.log(`+${c.delta.toFixed(6)} SOL le ${c.when}  de ${c.src}  sig=${c.sig}`);
}
if (!credits.length) console.log("aucun — le 2 SOL n'est pas passé par ce wallet (ou hors fenêtre devnet).");
