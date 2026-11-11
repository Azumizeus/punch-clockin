// Config réseau PUNCH par cluster — ADDITIF, sans effet sur le build actuel.
//
// Statut : devnet reste le cluster actif (cf. devnetConfig.ts, wallet.ts,
// rpc.ts). Ce fichier prépare mainnet SANS toucher aux fonds ni aux flux :
// aucune clé, aucun transfert, juste des constantes vérifiées + garde-fous.
// Bascule le jour J : choisir le cluster AU BUILD (jamais à l'exécution).
//
// Réf : docs/PLAN-MAINNET.md §4 (clusterConfig), décisions D2/D4.

export type Cluster = "devnet" | "mainnet";

/** Chaîne MWA (= Cluster Solana Mobile) par cluster. */
export const MWA_CHAINS = {
  devnet: "solana:devnet",
  mainnet: "solana:mainnet",
} as const;

/** Mints SPL réels par cluster. */
export const MINTS: Record<Cluster, { USDC: string; USDT: string; SKR: string }> = {
  devnet: {
    USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // vrai mint devnet Circle
    USDT: "4RDtZDZKfXREAn8nvagoQoJD35WdKbP7zRqdHATeMTDB", // mint démo PUNCH
    SKR: "6fjyJGhNfXEDy9qFoQXCrSP7GwmWuyAZzuQw1qnSPfPk", // mint démo PUNCH (0 décimales)
  },
  mainnet: {
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC natif (Circle), 6 décimales
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT natif (Tether), 6 décimales
    SKR: "SKR_REAL_MINT_TO_CONFIRM", // TODO(Jour-J) : vrai mint SKR depuis docs.solanamobile.com — ne jamais deviner
  },
} as const;

/** Décimales par cluster (USDT passe de 2 en démo à 6 sur mainnet). */
export const DECIMALS: Record<Cluster, { USDC: number; USDT: number; SKR: number }> = {
  devnet: { USDC: 6, USDT: 2, SKR: 0 },
  mainnet: { USDC: 6, USDT: 6, SKR: 0 },
} as const;

/** Cluster actif — devnet tant que la bascule n'est pas décidée. */
export const ACTIVE_CLUSTER: Cluster = "devnet";

/**
 * Garde-fou : refuse un build prod pointant devnet (et inversement).
 * À appeler au démarrage du build mainnet ; aujourd'hui elle passe
 * (ACTIVE_CLUSTER === "devnet").
 */
export function assertClusterConsistency(expected: Cluster): void {
  if (ACTIVE_CLUSTER !== expected) {
    throw new Error(
      `Cluster mismatch: build "${expected}" mais ACTIVE_CLUSTER="${ACTIVE_CLUSTER}". Refus de continuer.`
    );
  }
  if (ACTIVE_CLUSTER === "mainnet" && MINTS.mainnet.SKR === "SKR_REAL_MINT_TO_CONFIRM") {
    throw new Error("Mint SKR mainnet non renseigné (D4). Bascule interdite avant confirmation officielle.");
  }
}

/** Suffixe explorer pour les liens « voir sur explorer » de l'app. */
export function explorerClusterParam(cluster: Cluster): string {
  return cluster === "devnet" ? "?cluster=devnet" : "";
}
