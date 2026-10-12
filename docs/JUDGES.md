# PUNCH : Clock'in — Judges' evidence pack

> **Status, stated plainly:** PUNCH runs on **Solana devnet**. It is a hackathon build (CLOCK IN, Solana Mobile), not a mainnet product. Every money action in "real wallet" mode is a real signed devnet transaction; some accounting (staking ledger, buyback counter, entry/exit fees) is still app-side. This page says exactly which is which.

- Deck (PDF): [`docs/punch-clockin-deck.pdf`](punch-clockin-deck.pdf) — the PDF has an extractable text layer; a plain-text version of the same content is in [`docs/PITCH-DECK.md`](PITCH-DECK.md).
- Hands-on test guide: [`docs/GUIDE-JURY.md`](GUIDE-JURY.md)
- Signed APK: [v1.7.1 release](https://github.com/Azumizeus/punch-clockin/releases/tag/v1.7.1)

---

## 1. Build and verify the code

### Run the app
```bash
cd punch-native
npm ci
node scripts/inject-treasury.mjs   # creates lib/solana/treasurySecretDEVNET.local.ts (stub if no secret)
npx expo start -c                  # Expo dev server
# or a device build: npx expo run:android
```
Real-wallet mode needs an Android device with a Mobile Wallet Adapter wallet (Seeker Seed Vault, Phantom, Solflare) set to **devnet**. Without MWA (e.g. web, emulator) the app falls back to a clearly separate demo mode.

### Environment (names only — no secrets are committed)
| Name | Where | Purpose |
|---|---|---|
| `TREASURY_SECRET_DEVNET` | GitHub Actions secret | Devnet treasury keypair (JSON array of 64 bytes) injected at build time by `punch-native/scripts/inject-treasury.mjs` into the git-ignored `lib/solana/treasurySecretDEVNET.local.ts`. Without it, the template `treasurySecretDEVNET.example.ts` is used and the build cannot pay out. |
| RPC endpoint | In-app (Settings → Network) | Optional custom https RPC; default `https://api.devnet.solana.com` (`lib/solana/rpc.ts`). |

### Checks (same as CI, `.github/workflows/ci.yml`)
```bash
node punch-native/scripts/test-store-economy.mjs   # 54 offline economy checks (Node 22; on Node 20 use: npx tsx ...)
(cd punch-native && npx tsc --noEmit)
python tools/check_device_sync.py
python tools/make_proof_page.py --check
```
Verified locally on 2026-10-13: economy harness **54 ok, 0 failures**; device sync and proof page checks OK.

### Map of the on-chain code
All transaction building lives in [`punch-native/lib/solana/wallet.ts`](../punch-native/lib/solana/wallet.ts):

| Function | Line | What it does on-chain | Signer |
|---|---|---|---|
| `connectSeedVault` | 32 | MWA `authorize` on `solana:devnet` | user (Seed Vault) |
| `assertSigningSession` | 53 | MWA `reauthorize` to detect expired sessions | user |
| `signByUserAndSubmit` | ~67 | MWA `signTransactions`, then app submits via `sendRawTransaction` + confirm (75 s timeout) | user |
| `sendPunchMemo` | 92 | SPL **Memo** program instruction (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`) | user |
| `sendTreasurySol` | 187 | 0.05 devnet SOL onboarding top-up so a fresh wallet can pay fees | treasury |
| `sendUserToTreasuryTransfer` | 200 | SPL `transfer` user → treasury (creates ATAs if needed) | user |
| `sendTreasuryToUserTransfer` | 226 | SPL `transfer` treasury → user, retried idempotently (same blockhash = same signature) | treasury |
| `readableTxError` | 138 | Maps raw errors to honest messages | — |

Where each feature calls them ([`punch-native/lib/punch/store.ts`](../punch-native/lib/punch/store.ts) unless noted):

| Feature | Code | Transaction |
|---|---|---|
| Punch-in | `app/(tabs)/index.tsx` `handlePunch` (~l.95) → `sendPunchMemo("PUNCH <YYYY-MM-DD>")`, then `punchIn` (l.281) | user-signed memo |
| Onboarding | `connectReal` (l.249) | treasury → user: 0.05 SOL, 5 USDC, 20 USDT, 5000 SKR (devnet test tokens) |
| Say hello nearby | `greetNearby` (l.308) | treasury → user 0.1 USDC |
| Gig payment | `cashShift` (l.389) | treasury → user, worker share (92%) of the payout |
| Post a gig | `postShift` (l.643) | user → treasury, full amount escrowed |
| Swap | `swap` (l.454) | user → treasury in, treasury → user out |
| Stake | `stake` (l.544) | user → treasury SKR |
| Unstake | `unstake` (l.592) | treasury → user SKR, net of 1.5% fee |
| Leave network | `lib/punch/useLeaveNetwork.ts` → `sendPunchMemo("PUNCH LEAVE <ms>")` | user-signed memo |
| Balances | `refreshWalletBalances` (l.946), `lib/solana/tokens.ts` | read-only, from devnet |

---

## 2. Addresses and explorer links (devnet)

From [`punch-native/lib/solana/devnetConfig.ts`](../punch-native/lib/solana/devnetConfig.ts):

| What | Address |
|---|---|
| Treasury | [`FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn`](https://explorer.solana.com/address/FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn?cluster=devnet) |
| USDC (Circle's official devnet test mint, 6 decimals) | [`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`](https://explorer.solana.com/address/4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU?cluster=devnet) |
| USDT stand-in (PUNCH devnet demo mint, 2 decimals) | [`4RDtZDZKfXREAn8nvagoQoJD35WdKbP7zRqdHATeMTDB`](https://explorer.solana.com/address/4RDtZDZKfXREAn8nvagoQoJD35WdKbP7zRqdHATeMTDB?cluster=devnet) |
| SKR stand-in (PUNCH devnet demo mint, 0 decimals like real SKR) | [`6fjyJGhNfXEDy9qFoQXCrSP7GwmWuyAZzuQw1qnSPfPk`](https://explorer.solana.com/address/6fjyJGhNfXEDy9qFoQXCrSP7GwmWuyAZzuQw1qnSPfPk?cluster=devnet) |

The real SKR token only exists on mainnet, so USDT and SKR here are our own SPL mints on devnet (real SPL tokens, real transfers — but not the mainnet assets).

### Sample treasury signatures
These were recorded in [`docs/LIVRAISON.html`](LIVRAISON.html) as successful treasury transactions. We could not re-query devnet from our build machine when writing this page, so treat them as "recorded, please verify": the treasury link above shows the full, live history.

- [`2bNFgaa2…E6Nm8`](https://explorer.solana.com/tx/2bNFgaa2qJugt3PuXThXzXQaiS6Wup2sQYAUupoZTQH2fUt72DbNGHnfRaPJepNrkvUA33uQqhh1fAjbNB5E6Nm8?cluster=devnet)
- [`3PFPTVNe…PuzqkU`](https://explorer.solana.com/tx/3PFPTVNeoP3HQQGorSPQnEioniABKGHzvMLkCZaxf8J9mJtzRcHYJFHMT9PxBsKYxeYT2g5RspWhha6th7PuzqkU?cluster=devnet) (economy flow: swap / punch)
- [`2GWtPvXG…X1Ab2EM`](https://explorer.solana.com/tx/2GWtPvXGcCDerrDNNYrgfH3GFuxhBenawaNxXiiEoWwPoKaeAbqLQfTU7mPYiRcCobR99heAZUH5n8rptX1Ab2EM?cluster=devnet)
- [`26ctfmqf…j58DT`](https://explorer.solana.com/tx/26ctfmqf23ie41xMiLz96NZebddWBKeHCSnYQXEFqrqD39jEt4QoRackXHkynnNxw6rnGp6ojFrRFVRNvRDj58DT?cluster=devnet)

Command-line check:
```bash
curl -s https://api.devnet.solana.com -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getSignaturesForAddress","params":["FUiCbnDhEEJtz9Zcj66hGB54iGMGeyjRKD7CsTwpihJn",{"limit":10}]}'
```

### Repeatable steps (Android + MWA wallet on devnet)
Every receipt in the app shows its signature; tap it to open the explorer.
1. **Connect:** Connect → approve in Seed Vault/wallet. Expect 4 treasury → you transfers (SOL, USDC, USDT, SKR) on your address.
2. **Punch-in:** Home → PUNCH → sign. Expect a memo tx `PUNCH <today>` signed by your wallet. A second punch the same day is refused.
3. **Gig payment:** Board → open a gig (requires having punched today and the right rank) → complete. Expect treasury → you SPL transfer of 92% of the payout.
4. **Stake:** Wallet → stake e.g. 1000 SKR → sign. Expect you → treasury SKR transfer; your rank becomes Silver.
5. **Unstake:** Wallet → unstake 1000 SKR. Expect treasury → you transfer of 985 SKR (1.5% fee = 15 SKR kept), fee printed on the receipt.
6. **Leave network:** Settings (or Split) → Leave network → confirm → sign. Expect a memo tx `PUNCH LEAVE <timestamp>`; local counters reset only after it confirms.

---

## 3. Fraud and presence model — implemented vs planned

| Threat | Implemented today | Not implemented / planned |
|---|---|---|
| Fake presence | Each punch is a memo **signed by the device wallet** (Seed Vault on Seeker), so it is tied to a key, timestamped on-chain. | No GPS / geofence check, no Seeker hardware-attestation (Genesis token) verification on-chain. Copy mentioning "hardware attestation" describes the target, not current code. |
| Repeated punches | One punch per local calendar day (`sameDay` in `store.ts` l.57, enforced in `punchIn` and `handlePunch`). | Enforced client-side only; nothing on-chain prevents several memos per day. |
| Repeated self-greetings | `greetNearby` ignores an id already in `greetedIds`. | Client-side list; "nearby" people are not proven to be nearby. |
| Sybil wallets | Rank-gated gigs require staked SKR (economic cost). | No identity / one-device-one-account proof. |
| Fake gigs | Posting a gig escrows the full amount to the treasury first (`postShift`). | No dispute or proof-of-work verification for completion. |
| Treasury draining | Treasury txs are retried idempotently (no double pay on retry). | **Devnet-only shortcut:** the treasury key is injected into the app build, so a determined user could extract it from the APK. Acceptable for devnet test tokens, never for mainnet. Moving treasury signing out of the client (on-chain program or server-side signer) is required before mainnet; it is not built yet. Treasury key handling for mainnet is discussed in [`PLAN-MAINNET.md`](PLAN-MAINNET.md). |

## 4. UX edge cases handled in code

| State | Behaviour | Code |
|---|---|---|
| No MWA wallet (web, emulator) | Alert "Mobile Wallet Adapter not available. Entering demo mode." Demo mode uses local numbers and placeholder signatures — it is not presented as on-chain. | `app/connect.tsx` `handleConnect` |
| Rejected signature / sheet closed | "Signature refused or sheet closed — your money didn't move", no simulated fallback. | `readableTxError` (`wallet.ts` l.138), `handlePunch` |
| Expired session | `needReconnect`: "Session expired — open your wallet again to sign."; stake/post refuse cleanly. | `store.ts` `stake`, `postShift` |
| Wallet not responding | 75 s timeout instead of a dead button. | `signByUserAndSubmit` |
| RPC rate limit (429) / network lost | Specific messages; user can switch to own RPC with a live `getSlot` test. | `readableTxError`, `lib/solana/rpc.ts` |
| Failed tx / simulation error | "Refused on-chain: <instruction log>"; state not changed. | `readableTxError`, every flow returns early on catch |
| Insufficient funds | Pre-checks (`s.wallet.skr < amount`, `bal(...) < amount` → `"bal"`) and on-chain "insufficient" mapped to a message. | `stake`, `unstake`, `postShift`, `swap` |
| Gig not allowed | `openShift` returns `punch` (not punched today), `rank`, `genesis`, `done`, `full`. | `store.ts` `openShift` |
| Already punched today | Button shows countdown to midnight. | `cooldownLeft` |

Not covered yet: job cancellation/refund flow after posting a gig.

## 5. SKR economics — where it is computed

| Rule | Code | On-chain? |
|---|---|---|
| Ranks: Silver ≥ 1,000, Gold ≥ 5,000, Guardian ≥ 25,000 staked SKR | `punch-native/lib/punch/format.ts` `rankFromStake` (l.39), `rankMeets` | Stake transfer is on-chain; per-user staked balance is tracked in the app (no staking program yet). |
| 92 / 3 / 5 split (worker / SKR holders / app) | `format.ts` `FEE` (l.5) and `splitOf` (l.52, worker = gross − stakers − protocol, no phantom cent); used in `cashShift`, plis | Worker share is paid on-chain; the 3% and 5% stay in the treasury and are tracked as app counters (`stakerUsdc`, `protocolUsdc`). |
| 1.5% unstake fee | `store.ts` `WITHDRAW_FEE_PCT` (l.74), applied in `unstake` (l.592) | Yes: only the net amount is transferred back. |
| SKR buyback | `skrBought` counter increments in `store.ts` (e.g. l.302, 447, 536) using `SKR_USD = 0.0182` (`format.ts` l.3) | **No.** It is an app-side counter of what fees would buy; no on-chain swap/buyback exists yet. |
| Entry / exit fees 0.02 USDC | `ENTRY_FEE_USDC`, `EXIT_FEE_USDC` (`store.ts` l.72–73) | No, app-side counters. |
| Tests | `punch-native/scripts/test-store-economy.mjs` — 54 checks (split conservation, fees, balances) | — |
