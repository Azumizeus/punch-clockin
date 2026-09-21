// RPC au choix de l'utilisateur — "L'échec est honnête" va jusqu'au transport.
//
// Le devnet public rate-limite (429) dès que trop de monde regarde en même
// temps. L'utilisateur peut donc brancher SON endpoint (Helius, QuickNode,
// Alchemy, son propre nœud…) depuis Réglages → Réseau, et le TESTER ici même :
// un ping `getSlot` mesure la latence réelle de l'aller-retour et le verdict
// est affiché — jamais de bouton qui "espère". Tant que le test n'est pas
// vert, on sait exactement pourquoi les transactions échoueront.
import { Connection } from "@solana/web3.js";
import { createMMKV } from "react-native-mmkv";

const rpcStore = createMMKV({ id: "punch-rpc" });

/** Endpoint public par défaut — celui que l'app a toujours utilisé. */
export const DEFAULT_RPC = "https://api.devnet.solana.com";

const KEY = "customRpcUrl";

/** L'URL RPC active : celle de l'utilisateur si définie, sinon le défaut. */
export function getRpcUrl(): string {
  return rpcStore.getString(KEY) ?? DEFAULT_RPC;
}

/** Un endpoint personnalisé est-il enregistré ? */
export function isCustomRpc(): boolean {
  return rpcStore.getString(KEY) != null;
}

/**
 * Enregistre l'endpoint personnalisé (null ou vide = revenir au défaut).
 * Appeler rebuildConnection() après, pour que les flux on-chain suivent.
 */
export function setRpcUrl(url: string | null): void {
  const clean = url?.trim() ?? "";
  if (clean === "" || clean === DEFAULT_RPC) rpcStore.remove(KEY);
  else rpcStore.set(KEY, clean);
}

// Connexion partagée : TOUS les flux on-chain (lot, pointage, swap, stake,
// quitter) passent par ici, donc un changement d'endpoint dans Réglages
// s'applique immédiatement partout — plus aucun URL codé en dur.
let conn = new Connection(getRpcUrl(), "confirmed");

/** La connexion active, prête pour les transactions. */
export function activeConnection(): Connection {
  return conn;
}

/** Reconstruit la connexion après setRpcUrl() — retourne la nouvelle. */
export function rebuildConnection(): Connection {
  conn = new Connection(getRpcUrl(), "confirmed");
  return conn;
}

/**
 * Ping réel : un POST jsonrpc getSlot, un seul aller-retour.
 * Retourne la latence mesurée, ou l'erreur honnête (429, HTTP, réseau, JSON).
 */
export async function pingRpc(
  url: string,
): Promise<{ ok: boolean; ms?: number; error?: string }> {
  const target = url.trim();
  const started = Date.now();
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
    });
    if (!res.ok) {
      if (res.status === 429)
        return { ok: false, error: "saturé (429, rate-limit)" };
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const json = (await res.json()) as {
      result?: unknown;
      error?: { message?: string };
    };
    if (json?.error)
      return { ok: false, error: json.error.message ?? "erreur RPC" };
    if (typeof json?.result !== "number")
      return { ok: false, error: "réponse inattendue (pas un slot)" };
    return { ok: true, ms: Date.now() - started };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "connexion impossible",
    };
  }
}
