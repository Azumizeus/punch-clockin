import type { ReactNode } from "react";
import { useEffect } from "react";
import { CircleDot, Globe, LayoutList, Scale, Wallet } from "lucide-react";
import { BoardScreen } from "@/punch/board-screen";
import { GlobeScreen } from "@/punch/globe-screen";
import { PostScreen } from "@/punch/post-screen";
import { PunchBar } from "@/punch/bar";
import { ReceiptScreen } from "@/punch/receipt-screen";
import { ShiftScreen } from "@/punch/shift-screen";
import { SplitScreen } from "@/punch/split-screen";
import { PunchSplash } from "@/punch/splash";
import { WalletScreen } from "@/punch/wallet-screen";
import { usePunch, useT } from "@/lib/punch/store";
import type { Tab } from "@/lib/punch/types";
import { cn } from "@/lib/utils";

export function PunchShell({
  connect,
  home,
}: {
  connect: ReactNode;
  home: ReactNode;
}) {
  const connected = usePunch((s) => s.wallet.connected);
  const pushFeed = usePunch((s) => s.pushFeed);
  const setProduct = usePunch((s) => s.setProduct);
  const skin = usePunch((s) => s.skin);
  const theme = usePunch((s) => s.theme);

  useEffect(() => {
    setProduct("punch");
  }, [setProduct]);

  useEffect(() => {
    if (!connected) return;
    const id = window.setInterval(() => pushFeed(), 10000);
    return () => window.clearInterval(id);
  }, [connected, pushFeed]);

  return (
    <div className="punch-root min-h-dvh bg-bg text-fg" data-skin={skin} data-theme={theme}>
      <PunchSplash />
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        {!connected ? connect : <SignedIn home={home} />}
      </div>
    </div>
  );
}

function SignedIn({ home }: { home: ReactNode }) {
  const t = useT();
  const tab = usePunch((s) => s.tab);
  const view = usePunch((s) => s.view);
  const setTab = usePunch((s) => s.setTab);
  const showNav = view === "app";

  return (
    <div className="relative flex min-h-dvh flex-col bg-bg">
      {showNav ? <PunchBar /> : null}
      <main className={cn("flex-1", showNav && "pb-24")}>
        {view === "shift" ? <ShiftScreen /> : null}
        {view === "post" ? <PostScreen /> : null}
        {view === "receipt" ? <ReceiptScreen /> : null}
        {view === "app" && tab === "punch" ? home : null}
        {view === "app" && tab === "board" ? <BoardScreen /> : null}
        {view === "app" && tab === "globe" ? <GlobeScreen /> : null}
        {view === "app" && tab === "wallet" ? <WalletScreen /> : null}
        {view === "app" && tab === "split" ? <SplitScreen /> : null}
      </main>

      {showNav ? (
        <nav className="punch-nav fixed bottom-0 left-1/2 z-10 w-full max-w-md -translate-x-1/2 border-t border-line bg-bg pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
          <ul className="grid grid-cols-5">
            <NavBtn tab="punch" current={tab} onClick={setTab} label={t.punch} icon={CircleDot} />
            <NavBtn tab="board" current={tab} onClick={setTab} label={t.board} icon={LayoutList} />
            <NavBtn tab="globe" current={tab} onClick={setTab} label={t.globe} icon={Globe} />
            <NavBtn tab="wallet" current={tab} onClick={setTab} label={t.wallet} icon={Wallet} />
            <NavBtn tab="split" current={tab} onClick={setTab} label={t.split} icon={Scale} />
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

function NavBtn({
  tab,
  current,
  onClick,
  label,
  icon: Icon,
}: {
  tab: Tab;
  current: Tab;
  onClick: (t: Tab) => void;
  label: string;
  icon: typeof CircleDot;
}) {
  const active = tab === current;
  return (
    <li>
      <button
        type="button"
        onClick={() => onClick(tab)}
        className={cn(
          "flex h-14 w-full flex-col items-center justify-center gap-1",
          active ? "text-fg" : "text-subtle",
        )}
      >
        <Icon className="size-5" strokeWidth={active ? 2.2 : 1.6} />
        <span className="text-xs font-medium">{label}</span>
      </button>
    </li>
  );
}
