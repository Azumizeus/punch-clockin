"""Filtre le champ memo renvoyé par getSignaturesForAddress (pas de getTransaction
en masse) : pagination arrière jusqu'à la fenêtre, on garde les memos contenant
"PUNCH", puis un seul getTransaction pour identifier le payeur.
"""
import json
import subprocess
import sys
import time
from datetime import datetime, timedelta, timezone

sys.stdout.reconfigure(errors="replace")

RPC = "https://api.devnet.solana.com"
MEMO = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
TZ = timezone(timedelta(hours=2))
S_LO, S_HI = 501453700, 501455400  # ~17:44 → ~17:59


def rpc(method, params, tries=4):
    payload = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params})
    for i in range(tries):
        r = subprocess.run(["curl", "-s", "-X", "POST", RPC, "-H", "Content-Type: application/json",
                            "-d", payload], capture_output=True, timeout=30)
        try:
            d = json.loads(r.stdout.decode())
        except Exception:
            d = {}
        if "result" in d:
            return d
        if "error" in d:
            print(f"erreur RPC: {json.dumps(d.get('error'))[:200]}", flush=True)
        time.sleep(1.2 * (i + 1))
    return {}


hits = []
before = None
pages = 0
while pages < 15:
    params = [MEMO, {"limit": 1000}]
    if before:
        params[1]["before"] = before
    d = rpc("getSignaturesForAddress", params)
    sigs = d.get("result") or []
    if not sigs:
        print("plus de résultats", flush=True)
        break
    pages += 1
    oldest = sigs[-1]
    print(f"page {pages}: slots {sigs[0].get('slot')}..{oldest.get('slot')}", flush=True)
    for s in sigs:
        slot = s.get("slot") or 0
        memo = (s.get("memo") or "")
        if S_LO <= slot <= S_HI and "PUNCH" in memo:
            hits.append(s)
            print(f"  >>> HIT slot={slot} memo={memo!r} sig={s['signature']}", flush=True)
    if (oldest.get("slot") or 0) < S_LO:
        break
    before = oldest["signature"]
    time.sleep(0.8)

print(f"\n{len(hits)} mémo(s) PUNCH dans la fenêtre", flush=True)
for s in hits:
    time.sleep(0.8)
    tr = rpc("getTransaction", [s["signature"],
                                {"encoding": "jsonParsed", "maxSupportedTransactionVersion": 0}])
    tx = tr.get("result")
    payer = "?"
    if tx:
        keys = [k.get("pubkey") for k in tx["transaction"]["message"].get("accountKeys", [])]
        payer = keys[0] if keys else "?"
        err = tx.get("meta", {}).get("err")
        t = tx.get("blockTime") or 0
        dt = datetime.fromtimestamp(t, TZ).strftime("%H:%M:%S") if t else "?"
    else:
        err, dt = "?", "?"
    print(f"\n== {dt} payer={payer} err={err}")
    print(f"   memo={s.get('memo')!r}")
    print(f"   sig={s['signature']}")
    print(f"   https://explorer.solana.com/tx/{s['signature']}?cluster=devnet")
