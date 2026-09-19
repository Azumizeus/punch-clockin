import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { DEVNET_MINTS, TOKEN_DECIMALS } from "./devnetConfig";
import type { Token } from "../punch/types";

export function mintFor(token: Token): PublicKey {
  return new PublicKey(DEVNET_MINTS[token]);
}

// Les montants dans l'app (usdc/usdt/skr) sont en unités "humaines" (ex: 12.4
// USDC). Les transactions SPL veulent des unités de base (entiers, selon les
// décimales du mint). Ces deux fonctions font l'aller-retour.
export function toBaseUnits(amount: number, token: Token): number {
  return Math.round(amount * 10 ** TOKEN_DECIMALS[token]);
}

export function fromBaseUnits(units: number, token: Token): number {
  return units / 10 ** TOKEN_DECIMALS[token];
}

/**
 * Solde réel du wallet, lu directement sur devnet — pas un nombre stocké
 * localement. Retourne 0 si le compte associé n'existe pas encore (le
 * wallet n'a jamais reçu ce token).
 */
export async function getTokenBalance(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey
): Promise<number> {
  try {
    const ata = await getAssociatedTokenAddress(mint, owner);
    const info = await connection.getTokenAccountBalance(ata);
    return info.value.uiAmount ?? 0;
  } catch {
    return 0;
  }
}
