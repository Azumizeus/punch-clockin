// Config de l'économie PUNCH réelle sur devnet.
// - USDC : le vrai mint de test devnet officiel de Circle (existe déjà, on ne le crée pas).
// - USDT et SKR : le vrai token mainnet "Seeker" (SKR) de Solana Mobile existe,
//   mais UNIQUEMENT sur mainnet — un mint n'existe jamais sur deux réseaux à la
//   fois. Comme l'app tourne en devnet, on a créé nos propres mints SPL devnet
//   (de vrais tokens SPL, avec de vrais transferts on-chain — pas des nombres
//   locaux) qui reproduisent SKR/USDT pour la démo. Le jour où PUNCH tourne sur
//   mainnet, il suffira de remplacer ces deux adresses par les vraies.
export const DEVNET_MINTS = {
  USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // vrai mint devnet Circle
  USDT: "4RDtZDZKfXREAn8nvagoQoJD35WdKbP7zRqdHATeMTDB", // mint devnet PUNCH (démo)
  SKR: "6fjyJGhNfXEDy9qFoQXCrSP7GwmWuyAZzuQw1qnSPfPk", // mint devnet PUNCH (démo, décimales=0 comme le vrai SKR)
} as const;

export const TREASURY_PUBKEY = "FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn";

export const TOKEN_DECIMALS = {
  USDC: 6,
  USDT: 2,
  SKR: 0,
} as const;
