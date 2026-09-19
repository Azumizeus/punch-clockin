import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePunch, useT } from "@/lib/punch/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PostScreen() {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const setView = usePunch((s) => s.setView);
  const postShift = usePunch((s) => s.postShift);
  const [title, setTitle] = useState("");
  const [city, setCity] = useState(locale === "fr" ? "Paris" : "Paris");
  const [amount, setAmount] = useState("5.00");
  const [token, setToken] = useState<"USDC" | "USDT">("USDC");
  const [minutes, setMinutes] = useState("15");

  function submit() {
    const amt = Number(amount);
    const mins = Number(minutes);
    if (!title.trim() || !Number.isFinite(amt) || amt < 1) {
      toast(t.tooShort);
      return;
    }
    const err = postShift({
      title: title.trim(),
      city: city.trim() || "On-site",
      amount: amt,
      token,
      minutes: Number.isFinite(mins) ? mins : 15,
    });
    if (err === "bal") toast(t.notEnough);
  }

  return (
    <div className="px-5 pb-10 pt-2">
      <button type="button" className="h-11 text-sm text-muted" onClick={() => setView("app")}>
        ← {t.back}
      </button>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em]">{t.postTitle}</h1>
      <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-muted">{t.postBody}</p>

      <label className="mt-6 block font-mono text-[11px] uppercase tracking-wide text-muted">
        {t.title}
      </label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mt-2 h-12 w-full rounded-xl bg-surface px-4 text-sm shadow-border outline-none"
      />

      <label className="mt-4 block font-mono text-[11px] uppercase tracking-wide text-muted">
        {t.city}
      </label>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="mt-2 h-12 w-full rounded-xl bg-surface px-4 text-sm shadow-border outline-none"
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="font-mono text-[11px] uppercase tracking-wide text-muted">{t.amount}</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            className="mt-2 h-12 w-full rounded-xl bg-surface px-4 font-mono text-sm tabular-nums shadow-border outline-none"
          />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-wide text-muted">{t.duration}</label>
          <input
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            inputMode="numeric"
            className="mt-2 h-12 w-full rounded-xl bg-surface px-4 font-mono text-sm tabular-nums shadow-border outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {(["USDC", "USDT"] as const).map((tok) => (
          <button
            key={tok}
            type="button"
            onClick={() => setToken(tok)}
            className={cn(
              "h-11 flex-1 rounded-full font-mono text-xs",
              token === tok ? "bg-accent text-accent-fg" : "bg-surface text-muted",
            )}
          >
            {tok}
          </button>
        ))}
      </div>

      <Button className="mt-6 w-full" size="lg" onClick={submit}>
        {t.postCta}
      </Button>
    </div>
  );
}
