import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePunch, useT } from "@/lib/punch/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PliWrite() {
  const t = useT();
  const writePli = usePunch((s) => s.writePli);
  const sellPli = usePunch((s) => s.sellPli);
  const setTab = usePunch((s) => s.setTab);
  const [body, setBody] = useState("");
  const [price, setPrice] = useState("2.50");
  const [token, setToken] = useState<"USDC" | "USDT">("USDC");
  const [delay, setDelay] = useState(0);

  function submit() {
    const amt = Number(price);
    const id = writePli({
      body,
      price: amt,
      token,
      delayMs: delay,
    });
    if (id === "short" || id === "amount") {
      toast(t.tooShort);
      return;
    }
    if (id) {
      toast(t.pliWaitingSell);
      window.setTimeout(() => {
        const rec = sellPli(id);
        if (rec) toast(t.pliSold);
      }, 8000);
    }
  }

  return (
    <div className="px-5 pb-8 pt-2">
      <button type="button" className="h-11 text-sm text-muted" onClick={() => setTab("box")}>
        ← {t.back}
      </button>
      <h1 className="font-display text-4xl font-medium tracking-tight">{t.pliWriteTitle}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">{t.pliWriteBody}</p>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={8}
        className="letter-sheet mt-5 w-full rounded-sm bg-paper p-4 font-display text-xl leading-7 text-paper-fg outline-none"
        placeholder={t.pliWriteHint}
      />

      <label className="mt-5 block text-sm text-muted">{t.pliPrice}</label>
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        inputMode="decimal"
        className="mt-2 h-12 w-full rounded-sm bg-paper px-4 text-lg tabular-nums text-paper-fg outline-none"
      />

      <div className="mt-3 flex gap-2">
        {(["USDC", "USDT"] as const).map((tok) => (
          <button
            key={tok}
            type="button"
            onClick={() => setToken(tok)}
            className={cn(
              "h-11 flex-1 rounded-sm text-sm font-medium",
              token === tok ? "bg-accent text-accent-fg" : "bg-paper text-paper-fg",
            )}
          >
            {tok}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setDelay(0)}
          className={cn(
            "h-11 flex-1 rounded-sm text-sm",
            delay === 0 ? "bg-accent text-accent-fg" : "bg-paper text-paper-fg",
          )}
        >
          {t.pliDelayNow}
        </button>
        <button
          type="button"
          onClick={() => setDelay(60_000)}
          className={cn(
            "h-11 flex-1 rounded-sm text-sm",
            delay === 60_000 ? "bg-accent text-accent-fg" : "bg-paper text-paper-fg",
          )}
        >
          {t.pliDelaySoon}
        </button>
      </div>

      <Button className="mt-6 w-full" size="lg" onClick={submit}>
        {t.pliWriteCta}
      </Button>
    </div>
  );
}
