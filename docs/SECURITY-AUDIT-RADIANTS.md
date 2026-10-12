# Radiants advisory security audit — triage

Audit run by the Radiants advisory module (Solana Mobile "Clock In" hackathon) on commit `228194e`.
Result: 22 findings (2 high, 8 medium, 12 low), no score (scan limitations: unresolved-call, unsupported-shape).
Context: PUNCH runs on **Solana devnet only**. There is no mainnet deployment, no real funds, and no backend that parses untrusted input.
Fixes are on branch `audit-fixes`.

| # | Severity | Finding | Location | Status |
|---|---|---|---|---|
| 1 | High | Possible leaked secret (gitleaks generic-api-key) | `punch app grok/PUNCH/src/lib/auth/preview.ts:20` | **Fixed (going forward).** This is a scaffold-generated, preview-only OAuth client of the Grok App Builder (web design prototype, not the native app, which never used it). The constant now reads `GROK_PREVIEW_CLIENT_SECRET` from the environment. The value is still in git history (we chose not to rewrite history), so it should be treated as exposed and rotated by its issuer. |
| 2 | High | bigint-buffer 1.1.5 buffer overflow in `toBigIntLE()` | `punch-native/package-lock.json` (via `@solana/spl-token` → `@solana/buffer-layout-utils`) | **Accepted.** There is no patched release (1.1.5 is the latest). The only "fix" npm offers is downgrading spl-token to 0.1.8, which breaks the app. The library only decodes fixed-size SPL account layouts coming from devnet RPC responses that the app requested itself. There is no attacker-controlled buffer length. It is also a pure-JS fallback on React Native, since the native addon isn't built. We'll revisit when moving to `@solana/kit`. |
| 3 | Medium | decode-uri-component 0.2.2 DoS (exponential decoding) | via `expo-router` → `query-string@7` | **Accepted.** The fix (≥0.5, ESM-only) needs an expo-router major upgrade. The only input is in-app deep-link URLs on the user's own device, and the worst case is a local freeze of your own app. |
| 4 | Medium | stream-json 1.9.1 DoS (O(depth²) filters) | via `@solana/web3.js` → `jayson` | **Accepted / not reachable.** jayson uses stream-json only in its JSON-RPC *server* stream parser. The app is a JSON-RPC client talking to Solana RPC. The fixed 3.x line is a breaking API change for jayson. |
| 5 | Medium | uuid 8.3.2 missing buf bounds check | via `jayson` | **Fixed.** npm `overrides` → uuid 11.1.1 (CJS-compatible; jayson only calls `v4()`). |
| 6 | Medium | uuid 7.0.3 missing buf bounds check | via `expo-splash-screen` → `@expo/config-plugins` → `xcode` (build-time) | **Fixed.** Same override, uuid 11.1.1. |
| 7 | Medium | Third-party action referenced by moving tag | `.github/workflows/release.yml:105` | **Fixed.** All actions (`checkout`, `setup-node`, `setup-java`, `action-gh-release`) are pinned to commit SHAs, with the version in a comment. |
| 8 | Medium | stdlib XML parser (XXE / entity expansion) | `punch-native/scripts/device/test_tx_error.py:48` | **Fixed.** Uses `defusedxml` when installed. Dev-only script that parses a uiautomator dump from our own test device. |
| 9 | Medium | stdlib XML parser (XXE / entity expansion) | `punch-native/scripts/device/ui_probe.py:52` | **Fixed.** Same as #8. |
| 10 | Medium | Filesystem path joined from a variable | `punch-native/scripts/review_video.py:200` | **False positive.** Fixed repo-local `OUTDIR` plus the constant parts "A"/"B". Offline dev script, no user input. Annotated in code. |
| 11–22 | Low ×12 | Imports `@solana/web3.js` v1 (maintenance mode) | `app/(tabs)/index.tsx`, `app/(tabs)/wallet.tsx`, `lib/punch/store.ts`, `lib/punch/useLeaveNetwork.ts`, `lib/solana/rpc.ts`, `lib/solana/tokens.ts`, `lib/solana/wallet.ts`, `scripts/check-treasury.mjs`, `scripts/debug-cashshift.mjs` (×2), `scripts/device/check-treasury-now.mjs`, `scripts/trace-sol-transfers.mjs` | **Accepted.** web3.js 1.98 still gets security fixes, and Mobile Wallet Adapter / spl-token 0.4 are built on it. A migration to `@solana/kit` is planned before any mainnet release. |

## Other known limitations (from JUDGES.md, restated for honesty)
- The devnet treasury key ships inside the APK. That is acceptable on devnet, and it would be a blocker for mainnet.
- There is no GPS or hardware attestation for presence yet.
- The SKR buyback is currently an in-app counter, not an on-chain swap.

## Verification after fixes
- `npx tsc --noEmit` (punch-native): passes.
- Economy harness `scripts/test-store-economy.mjs`: 54 ok, 0 failures.
