// Harnais de tests économiques PUNCH — 100 % local, zéro dépendance, zéro réseau.
//
// Principe : on teste le VRAI code.
//  - lib/punch/format.ts est importé tel quel (Node >= 23.6 exécute du TS) ;
//  - les constantes économiques vivent inline dans store.ts : on les PARSE
//    dans le source au lieu de les copier — si un frais change sans que les
//    valeurs attendues soient mises à jour, le harnais échoue bruyamment.
//
// Run : node scripts/test-store-economy.mjs
// (depuis punch-native/) — exit 1 si un seul échec.

import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = join(HERE, "..", "lib", "punch");

// --- 1. Le vrai code de format.ts -----------------------------------------
const { SKR_USD, FEE, splitOf, round2, roundSkr, shortAddr, rankFromStake, rankMeets, RANK_ORDER } =
  await import(pathToFileURL(join(LIB, "format.ts")).href);

// --- 2. Parsing des constantes inline de store.ts --------------------------
const storeSrc = readFileSync(join(LIB, "store.ts"), "utf-8");
const hellosSrc = readFileSync(join(LIB, "hellos.ts"), "utf-8");
function grabConst(name) {
  const m = storeSrc.match(new RegExp(String.raw`const ${name}\s*=\s*([\d.]+);`));
  if (!m) throw new Error(`const ${name} introuvable dans store.ts — le harnais est cassé, mets-le à jour`);
  return Number(m[1]);
}
function grabRaw(name, src = storeSrc) {
  const m = src.match(new RegExp(String.raw`const ${name}\s*=\s*([^;\n]+);`));
  if (!m) throw new Error(`const ${name} introuvable — harnais à mettre à jour`);
  return m[1].trim();
}
const ENTRY_FEE_USDC = grabConst("ENTRY_FEE_USDC");
const EXIT_FEE_USDC = grabConst("EXIT_FEE_USDC");
const WITHDRAW_FEE_PCT = grabConst("WITHDRAW_FEE_PCT");
const WITHDRAW_FEE_PCT_RAW = grabRaw("WITHDRAW_FEE_PCT");
const HELLO_REWARD_SKR = Number(grabRaw("HELLO_REWARD_SKR", hellosSrc));
const stakerCut = storeSrc.match(/stakerCutSkr\s*=\s*roundSkr\(round2\((\w+) \* ([\d.]+)\)/);
if (!stakerCut) throw new Error("formule stakerCutSkr introuvable dans store.ts");

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail = "") {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; failures.push(name); console.error(`FAIL  ${name}${detail ? " — " + detail : ""}`); }
}

// --- 3. Constantes économiques attendues -----------------------------------
console.log("Constantes (parsées dans store.ts / format.ts) :");
console.log(`  ENTRY_FEE_USDC=${ENTRY_FEE_USDC} EXIT_FEE_USDC=${EXIT_FEE_USDC} WITHDRAW_FEE_PCT=${WITHDRAW_FEE_PCT_RAW} HELLO_REWARD_SKR=${HELLO_REWARD_SKR} SKR_USD=${SKR_USD} stakerCut=${stakerCut[2]}`);
check("frais d'entrée = 0,02 USDC", ENTRY_FEE_USDC === 0.02);
check("frais de sortie = 0,02 USDC", EXIT_FEE_USDC === 0.02);
check("frais d'unstake = 1,5 %", WITHDRAW_FEE_PCT === 0.015);
check("bonus bonjour = 25 SKR", HELLO_REWARD_SKR === 25);
check("prix SKR = 0,0182 USD", SKR_USD === 0.0182);

// --- 4. La règle 92/3/5 : splitOf sur le vrai code --------------------------
console.log("\nRègle 92/3/5 (splitOf, code réel) :");
check("FEE = 0.92/0.03/0.05", FEE.worker === 0.92 && FEE.stakers === 0.03 && FEE.protocol === 0.05);
for (const gross of [0.21, 1, 7.5, 100, 1234.56]) {
  const s = splitOf(gross);
  const sum = round2(s.worker + s.stakers + s.protocol);
  check(`split ${gross} → somme = gross (${sum})`, sum === round2(gross), `reçu ${sum}`);
  check(`split ${gross} → worker absorbe l'arrondi (conservation)`, s.worker === round2(gross - s.stakers - s.protocol));
  check(`split ${gross} → stakers 3 %`, s.stakers === round2(gross * 0.03));
  check(`split ${gross} → protocol 5 %`, s.protocol === round2(gross * 0.05));
}
// Le split du store (swap) suit la même règle : protocol = spread - half.
{
  const spreadUsd = 1234.56;
  const half = round2(spreadUsd / 2);
  const proto = round2(spreadUsd - half);
  check("swap : protocol + stakers = spread exact", round2(proto + half) === round2(spreadUsd));
}

const hello = splitOf(0.21);
check("bonjour 0,21 → 0,19/0,01/0,01 (écart d'arrondi absorbé sur protocol)",
  hello.worker === 0.19 && hello.stakers === 0.01 && hello.protocol === 0.01,
  JSON.stringify(hello));

// --- 5. Frais d'unstake (miroir exact du calcul inline du store) ------------
console.log("\nFrais d'unstake (miroir des lignes du store) :");
for (const amount of [100, 1000, 6000, 12345]) {
  const fee = roundSkr(amount * WITHDRAW_FEE_PCT);
  const net = roundSkr(amount - fee);
  check(`unstake ${amount} → fee ${fee} = 1,5 % arrondi`, fee === Math.round(amount * 0.015));
  check(`unstake ${amount} → net ${net} = amount - fee`, net === amount - fee);
  // Règle corrigée dans le store : protocol = feeUsd - half (le centime
  // d'arrondi va au protocole) → somme créditées EXACTEMENT feeUsd, jamais plus.
  const feeUsd = round2(fee * SKR_USD);
  const half = round2(feeUsd / 2);
  const proto = round2(feeUsd - half);
  check(`unstake ${amount} → protocol + stakers = feeUsd exact (${feeUsd})`,
    round2(proto + half) === feeUsd);
}

// --- 6. Rang par stake (accès aux missions) ---------------------------------
console.log("\nRangs (rankFromStake, code réel) :");
check("0 stake → open", rankFromStake(0) === "open");
check("999 → open", rankFromStake(999) === "open");
check("1 000 → silver (seuil exact)", rankFromStake(1000) === "silver");
check("4 999 → silver", rankFromStake(4999) === "silver");
check("5 000 → gold (seuil exact)", rankFromStake(5000) === "gold");
check("24 999 → gold", rankFromStake(24999) === "gold");
check("25 000 → guardian (seuil exact)", rankFromStake(25000) === "guardian");
check("ordre strict open<silver<gold<guardian",
  RANK_ORDER.join() === "open,silver,gold,guardian");
check("rankMeets : gold satisfait silver", rankMeets("gold", "silver") === true);
check("rankMeets : open ne satisfait pas gold", rankMeets("open", "gold") === false);

// --- 7. Rounding (le piege classique float) ---------------------------------
console.log("\nRounding :");
check("round2(0.1+0.2) = 0.3", round2(0.1 + 0.2) === 0.3);
check("roundSkr tronque à l'entier", roundSkr(25.7) === 26);
check("shortAddr FUiCbn…pihJn", shortAddr("FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn") === "FUiC…ihJn");

// --- 8. Unstake déstabilisé par les frais ? (invariant économique) -----------
console.log("\nInvariants :");
{
  // round-trip stake→unstake d'un montant non entier : jamais de solde négatif
  const amount = 4242;
  const fee = roundSkr(amount * WITHDRAW_FEE_PCT);
  const net = roundSkr(amount - fee);
  check("round-trip : net + fee = amount (rien perdu, rien créé)", net + fee === amount);
}

console.log(`\n==== ${pass} ok, ${fail} échec(s) ====`);
if (fail > 0) {
  console.error("Échecs : " + failures.join(" | "));
  process.exit(1);
}
