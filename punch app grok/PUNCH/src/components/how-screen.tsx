import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/top-bar";
import { usePunch, useT } from "@/lib/punch/store";

export function HowScreen() {
  const t = useT();
  const dismissHow = usePunch((s) => s.dismissHow);

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <TopBar withBrand />
      <div className="stagger-in flex flex-1 flex-col px-5 pt-4">
        <h1 className="font-display text-3xl font-medium leading-[1.15] tracking-tight">
          {t.howTitle}
        </h1>
        <ol className="mt-4 space-y-2">
          <Step title={t.how1t} body={t.how1b} />
          <Step title={t.how2t} body={t.how2b} />
          <Step title={t.how3t} body={t.how3b} />
        </ol>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Cut n="92%" label={t.worker} />
          <Cut n="3%" label={t.stakers} />
          <Cut n="5%" label={t.protocol} accent />
        </div>
        <Button className="mt-6 w-full" size="lg" onClick={dismissHow}>
          {t.howCta}
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-subtle">{t.moneyUsdc}</p>
        <p className="mt-1 text-xs leading-relaxed text-subtle">{t.moneySkr}</p>
      </div>
    </div>
  );
}

function Step({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-xl bg-surface p-3 shadow-border">
      <p className="font-display text-base font-medium leading-snug">{title}</p>
      <p className="mt-1 text-sm leading-snug text-muted">{body}</p>
    </li>
  );
}

function Cut({ n, label, accent }: { n: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-surface px-2 py-3 shadow-border">
      <p className={`font-display text-2xl font-medium ${accent ? "text-accent" : "text-fg"}`}>
        {n}
      </p>
      <p className="mt-1 text-xs leading-snug text-muted">{label}</p>
    </div>
  );
}
