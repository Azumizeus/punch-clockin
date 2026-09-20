import { Button } from "@/components/ui/button";
import { formatAmt, splitOf } from "@/lib/punch/format";
import { usePunch, useT } from "@/lib/punch/store";

export function PliLetter() {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const id = usePunch((s) => s.activePliId);
  const pli = usePunch((s) => s.plis.find((x) => x.id === id));
  const setView = usePunch((s) => s.setView);

  if (!pli) {
    return (
      <div className="px-5 py-10">
        <Button variant="ghost" onClick={() => setView("app")}>
          {t.back}
        </Button>
      </div>
    );
  }

  const parts = splitOf(pli.price);

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-10 pt-4">
      <button type="button" className="h-11 self-start text-sm text-muted" onClick={() => setView("app")}>
        ← {t.back}
      </button>
      <p className="text-sm tracking-wide text-muted">{t.pliLetter}</p>
      <article className="letter-sheet receipt-enter mt-4 rounded-sm bg-paper p-5 text-paper-fg">
        <div className="flex items-start justify-between">
          <p className="text-sm text-paper-muted">
            {pli.author} · {pli.city[locale]}
          </p>
          <span className="wax text-[10px] font-medium">OK</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-medium leading-snug">{pli.tease[locale]}</h1>
        <p className="mt-6 font-display text-xl leading-7">{pli.body[locale]}</p>
        <dl className="mt-8 space-y-1 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-paper-muted">{t.gross}</dt>
            <dd>
              {formatAmt(pli.price, pli.token)} {pli.token}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-paper-muted">{t.worker}</dt>
            <dd>
              {formatAmt(parts.worker, pli.token)} · 92%
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-paper-muted">{t.stakers}</dt>
            <dd>{formatAmt(parts.stakers, pli.token)} · 3%</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-paper-muted">{t.protocol}</dt>
            <dd>{formatAmt(parts.protocol, pli.token)} · 5%</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm leading-relaxed text-paper-muted">{t.pliChain}</p>
      </article>
      <Button className="mt-6 w-full" size="lg" onClick={() => setView("app")}>
        {t.pliSeeBox}
      </Button>
    </div>
  );
}
