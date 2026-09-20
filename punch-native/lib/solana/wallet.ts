import { Buffer } from "buffer";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { toByteArray } from "react-native-quick-base64";
import { TREASURY_PUBKEY } from "./devnetConfig";
import { TREASURY_SECRET_KEY_DEVNET } from "./treasurySecretDEVNET";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);
const IDENTITY = {
  name: "PUNCH",
  uri: "https://punch-app.vercel.app",
  icon: "icon-192.png",
};

export async function connectSeedVault() {
  return await transact(async (wallet) => {
    const auth = await wallet.authorize({
      chain: "solana:devnet",
      identity: IDENTITY,
    });
    const address = new PublicKey(
      toByteArray(auth.accounts[0].address)
    ).toBase58();
    return { address, authToken: auth.auth_token };
  });
}

/**
 * Le Seed Vault SIGNE, puis NOTRE connexion soumet la transaction (sendRawTransaction
 * avec retries) et la confirme. Pourquoi : signAndSendTransactions laisse le vault
 * soumettre via son propre endpoint RPC, qui échoue en silence (rate-limit devnet)
 * — la feuille de signature est approuvée mais rien n'atterrit on-chain.
 */
async function signByUserAndSubmit(
  connection: Connection,
  authToken: string,
  tx: Transaction,
  bh: { blockhash: string; lastValidBlockHeight: number }
): Promise<string> {
  const signed = await transact(async (wallet) => {
    await wallet.reauthorize({ auth_token: authToken, identity: IDENTITY });
    const result = await wallet.signTransactions({ transactions: [tx] });
    return result[0];
  });
  const raw: Uint8Array =
    signed instanceof Uint8Array ? signed : (signed as Transaction).serialize();
  const sig = await connection.sendRawTransaction(raw, { maxRetries: 5 });
  await connection.confirmTransaction({ signature: sig, ...bh }, "confirmed");
  return sig;
}

export async function sendPunchMemo(
  connection: Connection,
  authToken: string,
  pubkey: PublicKey,
  memo: string
): Promise<string> {
  const bh = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({
    feePayer: pubkey,
    blockhash: bh.blockhash,
    lastValidBlockHeight: bh.lastValidBlockHeight,
  }).add(
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [{ pubkey, isSigner: true, isWritable: false }],
      data: Buffer.from(memo, "utf8"),
    })
  );

  return signByUserAndSubmit(connection, authToken, tx, bh);
}

function treasuryKeypair() {
  return Keypair.fromSecretKey(Uint8Array.from(TREASURY_SECRET_KEY_DEVNET));
}

async function ensureAtaIx(
  connection: Connection,
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  instructions: TransactionInstruction[]
) {
  const ata = await getAssociatedTokenAddress(mint, owner);
  const info = await connection.getAccountInfo(ata);
  if (!info) {
    instructions.push(createAssociatedTokenAccountInstruction(payer, ata, owner, mint));
  }
  return ata;
}

/**
 * Erreur transaction lisible et honnête — l'app n'avale plus la vraie raison.
 * Devnet public rate-limite (429) surtout depuis un réseau mobile ; une mission
 * payée par le trésor qui échoue doit dire POURQUOI, pas juste "échouée".
 */
export function readableTxError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e ?? "");
  if (/429|Too Many Requests|rate.?limit|-32005/i.test(raw))
    return "RPC devnet saturé (limite de débit) — réessaie dans quelques secondes.";
  if (/fetch failed|Network request failed|network request|timeout|aborted/i.test(raw))
    return "Connexion réseau perdue — vérifie internet et réessaie.";
  if (/simulation failed/i.test(raw)) {
    const log = raw.match(/Instruction \d+[^\n"]*/)?.[0] ?? "";
    return "Refusée on-chain : " + (log || raw).slice(0, 120);
  }
  if (/insufficient/i.test(raw)) return "Fonds insuffisants pour cette opération.";
  return raw.slice(0, 140);
}

/**
 * Soumission signée trésor avec retries : mêmes principes que signByUserAndSubmit.
 * Le retry re-signe la MÊME transaction (même blockhash → même signature), donc
 * c'est idempotent : jamais de double paiement, même si la 1re tentative avait
 * atterri on-chain pendant qu'on attendait une confirmation expirée.
 */
async function sendTreasuryTxWithRetry(
  connection: Connection,
  tx: Transaction,
  treasury: Keypair,
  attempts = 3
): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await sendAndConfirmTransaction(connection, tx, [treasury], {
        commitment: "confirmed",
      });
    } catch (e) {
      lastErr = e;
      if (attempt < attempts - 1) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
  }
  throw new Error(readableTxError(lastErr));
}

/**
 * Envoie un peu de SOL devnet du trésor vers le nouveau wallet, pour qu'il
 * puisse payer les frais de ses propres transactions signées (sans ça, un
 * wallet Seed Vault flambant neuf ne peut rien signer). Réel, pas simulé.
 */
export async function sendTreasurySol(connection: Connection, userPubkey: PublicKey, lamports: number) {
  const treasury = treasuryKeypair();
  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: treasury.publicKey, toPubkey: userPubkey, lamports })
  );
  return sendTreasuryTxWithRetry(connection, tx, treasury);
}

/**
 * Vrai transfert SPL signé par l'utilisateur via Seed Vault : de son wallet
 * vers le trésor de l'app (stake, achat, frais...). Pas de nombre local
 * modifié en douce — une vraie transaction devnet, visible sur l'explorer.
 */
export async function sendUserToTreasuryTransfer(
  connection: Connection,
  authToken: string,
  userPubkey: PublicKey,
  mint: PublicKey,
  amountBaseUnits: number
): Promise<string> {
  const treasury = new PublicKey(TREASURY_PUBKEY);
  const instructions: TransactionInstruction[] = [];
  const fromAta = await ensureAtaIx(connection, userPubkey, userPubkey, mint, instructions);
  const toAta = await ensureAtaIx(connection, userPubkey, treasury, mint, instructions);
  instructions.push(createTransferInstruction(fromAta, toAta, userPubkey, amountBaseUnits));

  const bh = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({ feePayer: userPubkey, blockhash: bh.blockhash, lastValidBlockHeight: bh.lastValidBlockHeight }).add(
    ...instructions
  );

  return signByUserAndSubmit(connection, authToken, tx, bh);
}

/**
 * Vrai transfert SPL signé par le trésor de l'app : du trésor vers le wallet
 * de l'utilisateur (unstake, gains de shift, swap sortant...). Le trésor
 * signe seul (pas besoin de Seed Vault côté user pour recevoir de l'argent).
 */
export async function sendTreasuryToUserTransfer(
  connection: Connection,
  userPubkey: PublicKey,
  mint: PublicKey,
  amountBaseUnits: number
): Promise<string> {
  const treasury = treasuryKeypair();
  const instructions: TransactionInstruction[] = [];
  const fromAta = await ensureAtaIx(connection, treasury.publicKey, treasury.publicKey, mint, instructions);
  const toAta = await ensureAtaIx(connection, treasury.publicKey, userPubkey, mint, instructions);
  instructions.push(createTransferInstruction(fromAta, toAta, treasury.publicKey, amountBaseUnits));

  const tx = new Transaction().add(...instructions);
  return sendTreasuryTxWithRetry(connection, tx, treasury);
}
