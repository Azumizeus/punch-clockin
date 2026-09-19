import { ReceiptCard } from "@/shared/receipt-card";
import { Button } from "@/components/ui/button";
import { usePunch, useT } from "@/lib/punch/store";

export function ReceiptScreen() {
  const t = useT();
  const id = usePunch((s) => s.lastReceiptId);
  const receipt = usePunch((s) => s.receipts.find((r) => r.id === id));
  const setView = usePunch((s) => s.setView);
  const setTab = usePunch((s) => s.setTab);

  if (!receipt) {
    return (
      <div className="px-5 py-10">
        <Button variant="ghost" onClick={() => setView("app")}>
          {t.back}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70dvh] flex-col px-5 pb-10 pt-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{t.cashed}</p>
      <div className="mt-6">
        <ReceiptCard receipt={receipt} featured />
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-8">
        <Button
          variant="secondary"
          onClick={() => {
            setView("app", null);
            setTab("board");
          }}
        >
          {t.seeJobs}
        </Button>
        <Button
          onClick={() => {
            setView("app", null);
            setTab("split");
          }}
        >
          {t.split}
        </Button>
      </div>
    </div>
  );
}
