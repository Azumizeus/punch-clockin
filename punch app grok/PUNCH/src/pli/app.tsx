import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PliBox } from "@/pli/box";
import { PliCompte } from "@/pli/compte";
import { PliLetter } from "@/pli/letter";
import { PliWrite } from "@/pli/write";
import { ReceiptCard } from "@/shared/receipt-card";
import { usePunch, useT } from "@/lib/punch/store";

export function PliApp() {
  const connected = usePunch((s) => s.wallet.connected);
  const setProduct = usePunch((s) => s.setProduct);

  useEffect(() => {
    setProduct("pli");
  }, [setProduct]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        {!connected ? <PliConnect /> : <PliSigned />}
      </div>
    </div>
  );
}

function PliConnect() {
  const t = useT();
  const connect = usePunch((s) => s.connect);
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-8 pt-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex h-11 items-center text-sm text-muted">
          ← {t.atelier}
        </Link>
        <button
          type="button"
          className="h-11 px-3 text-sm text-muted"
          onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
        >
          {locale === "fr" ? "EN" : "FR"}
        </button>
      </div>
      <div className="mt-8 flex flex-col items-center text-center">
        <span className="wax text-sm font-medium">PL</span>
        <h1 className="mt-5 max-w-[12ch] font-display text-4xl font-medium leading-[1.08] tracking-tight">
          {t.pliConnectTitle}
        </h1>
        <p className="mt-3 max-w-[32ch] text-base leading-relaxed text-muted">{t.pliTag}</p>
        <Button
          className="mt-8 w-full"
          size="lg"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            window.setTimeout(() => connect("pli"), 800);
          }}
        >
          {busy ? t.connecting : t.pliConnectCta}
        </Button>
        <p className="mt-3 text-sm text-subtle">{t.demoVault}</p>
      </div>
    </div>
  );
}

function PliSigned() {
  const t = useT();
  const tab = usePunch((s) => s.tab);
  const view = usePunch((s) => s.view);
  const setTab = usePunch((s) => s.setTab);
  const setView = usePunch((s) => s.setView);
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);
  const receiptId = usePunch((s) => s.lastReceiptId);
  const receipt = usePunch((s) => s.receipts.find((r) => r.id === receiptId));

  if (view === "letter") return <PliLetter />;
  if (view === "receipt") {
    return (
      <div className="flex min-h-dvh flex-col px-5 pb-10 pt-4">
        <button type="button" className="h-11 self-start text-sm text-muted" onClick={() => setView("app")}>
          ← {t.back}
        </button>
        {receipt ? (
          <div className="mt-4">
            <ReceiptCard receipt={receipt} featured />
          </div>
        ) : null}
        <Button className="mt-6 w-full" size="lg" onClick={() => setView("app")}>
          {t.pliSeeBox}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-2 px-4 pt-3">
        <Link to="/" className="flex h-11 items-center text-sm text-muted">
          ← {t.atelier}
        </Link>
        <p className="font-display text-xl font-medium tracking-tight">{t.pliName}</p>
        <div className="flex">
          <button
            type="button"
            className="h-11 px-2 text-sm text-muted"
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
          >
            {locale === "fr" ? "EN" : "FR"}
          </button>
          <button
            type="button"
            className="h-11 px-2 text-sm"
            onClick={() => setTab("wallet")}
          >
            {t.pliCompte}
          </button>
        </div>
      </header>
      <main className="flex-1 pb-28">
        {tab === "write" ? <PliWrite /> : null}
        {tab === "wallet" ? <PliCompte /> : null}
        {tab === "box" || tab === "punch" || tab === "board" || tab === "split" ? <PliBox /> : null}
      </main>
      {tab !== "write" ? (
        <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          <Button className="w-full" size="lg" onClick={() => setTab("write")}>
            {t.pliWriteTitle}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
