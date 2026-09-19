import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TokenChip } from "@/shared/token-chip";
import { formatAmt, splitOf } from "@/lib/punch/format";
import { usePunch, useT } from "@/lib/punch/store";
import { toast } from "sonner";

export function ShiftScreen() {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const id = usePunch((s) => s.activeShiftId);
  const shift = usePunch((s) => s.shifts.find((x) => x.id === id));
  const setView = usePunch((s) => s.setView);
  const cashShift = usePunch((s) => s.cashShift);
  const fillPosted = usePunch((s) => s.fillPosted);
  const [ready, setReady] = useState(false);
  const [signing, setSigning] = useState(false);

  if (!shift) {
    return (
      <div className="px-5 py-10">
        <Button variant="ghost" onClick={() => setView("app")}>
          {t.back}
        </Button>
      </div>
    );
  }

  const parts = splitOf(shift.payout);
  const title = shift.title[locale];
  const shiftId = shift.id;

  function finish() {
    setSigning(true);
    window.setTimeout(() => {
      cashShift(shiftId, title);
      setSigning(false);
    }, 700);
  }

  return (
    <div className="px-5 pb-10 pt-2">
      <button
        type="button"
        className="h-11 text-sm text-muted"
        onClick={() => setView("app", null)}
      >
        ← {t.back}
      </button>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        {shift.sponsor} · {shift.city[locale]}
      </p>
      <h1 className="mt-2 font-display text-3xl font-medium leading-[1.15] tracking-[-0.03em]">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{shift.blurb[locale]}</p>

      <div className="mt-5 flex items-center gap-2">
        <TokenChip token={shift.token} />
        <span className="font-mono text-sm tabular-nums">
          {formatAmt(shift.payout, shift.token)} {shift.token} · {shift.durationMin} {t.min}
        </span>
      </div>

      <div className="mt-5 rounded-xl bg-surface p-4 font-mono text-xs tabular-nums shadow-border">
        <Line k={t.worker} v={`${formatAmt(parts.worker, shift.token)} · 92%`} />
        <Line k={t.stakers} v={`${formatAmt(parts.stakers, shift.token)} · 3%`} />
        <Line k={t.protocol} v={`${formatAmt(parts.protocol, shift.token)} · 5%`} />
      </div>

      {shift.userPosted && shift.taken === 0 ? (
        <div className="mt-6">
          <p className="text-sm text-muted">{t.fill}</p>
          <Button className="mt-4 w-full" size="lg" onClick={() => fillPosted(shift.id)}>
            {t.fillCta}
          </Button>
        </div>
      ) : (
        <div className="mt-6">
          {shift.kind === "dwell" || shift.kind === "watch" ? (
            <HoldTask
              seconds={12}
              holdLabel={shift.kind === "watch" ? t.watchHold : t.dwellHold}
              startLabel={shift.kind === "watch" ? t.watchCta : t.dwellCta}
              onDone={() => setReady(true)}
            />
          ) : null}
          {shift.kind === "review" ? <ReviewTask onDone={() => setReady(true)} /> : null}
          {shift.kind === "scan" ? <ScanTask onDone={() => setReady(true)} /> : null}
          {shift.kind === "swap" ? <PulseSwapTask onDone={() => setReady(true)} /> : null}

          <Button
            className="mt-5 w-full"
            size="lg"
            disabled={!ready || signing}
            onClick={finish}
          >
            {signing ? t.signing : t.complete}
          </Button>
        </div>
      )}
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-line py-2 last:border-0">
      <span className="text-muted">{k}</span>
      <span>{v}</span>
    </div>
  );
}

function HoldTask({
  seconds,
  holdLabel,
  startLabel,
  onDone,
}: {
  seconds: number;
  holdLabel: string;
  startLabel: string;
  onDone: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(seconds);
  const done = useRef(false);

  useEffect(() => {
    if (!running || done.current) return;
    if (left <= 0) {
      done.current = true;
      onDone();
      return;
    }
    const id = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [running, left, onDone]);

  if (!running) {
    return (
      <Button variant="secondary" className="w-full" size="lg" onClick={() => setRunning(true)}>
        {startLabel}
      </Button>
    );
  }

  const p = 1 - left / seconds;
  return (
    <div className="rounded-xl bg-surface p-5 text-center shadow-border">
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{holdLabel}</p>
      <p className="mt-3 font-display text-5xl font-medium tabular-nums">{Math.max(0, left)}</p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full bg-accent transition-[width] duration-1000 ease-linear"
          style={{ width: `${Math.min(100, p * 100)}%` }}
        />
      </div>
      <p className="mt-3 font-mono text-[10px] text-subtle">demo · 12s = shift clock</p>
    </div>
  );
}

function ReviewTask({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ok = text.trim().length >= 40;
  return (
    <div>
      <label className="font-mono text-[11px] uppercase tracking-wide text-muted">
        {t.reviewLabel}
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="mt-2 w-full resize-none rounded-xl bg-surface p-4 text-sm leading-relaxed text-fg shadow-border outline-none focus:shadow-border-hover"
      />
      <p className="mt-2 font-mono text-[10px] text-subtle">
        {text.trim().length}/40 · {t.reviewHint}
      </p>
      <Button
        variant="secondary"
        className="mt-3 w-full"
        disabled={!ok || submitted}
        onClick={() => {
          if (!ok) {
            toast(t.tooShort);
            return;
          }
          setSubmitted(true);
          onDone();
        }}
      >
        {t.reviewCta}
      </Button>
    </div>
  );
}

function ScanTask({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const done = useRef(false);
  const labels = [t.scanStep1, t.scanStep2, t.scanStep3];

  useEffect(() => {
    if (step === 0 || step >= 3) return;
    const id = window.setTimeout(() => setStep((n) => n + 1), 700);
    return () => window.clearTimeout(id);
  }, [step]);

  useEffect(() => {
    if (step === 3 && !done.current) {
      done.current = true;
      onDone();
    }
  }, [step, onDone]);

  return (
    <button
      type="button"
      onClick={() => step === 0 && setStep(1)}
      className="grid w-full place-items-center rounded-2xl bg-surface py-10 shadow-border"
    >
      <span className="relative grid size-28 place-items-center">
        <span className="absolute inset-0 rounded-lg border border-line-strong" />
        <span className="absolute left-2 top-2 size-3 border-l border-t border-accent" />
        <span className="absolute right-2 top-2 size-3 border-r border-t border-accent" />
        <span className="absolute bottom-2 left-2 size-3 border-b border-l border-accent" />
        <span className="absolute bottom-2 right-2 size-3 border-b border-r border-accent" />
        <span className="font-mono text-[11px] text-muted">{labels[Math.min(step, 2)]}</span>
      </span>
      {step === 0 ? <span className="mt-4 text-sm text-muted">{t.scanCta}</span> : null}
    </button>
  );
}

function PulseSwapTask({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [done, setDone] = useState(false);
  return (
    <div className="rounded-xl bg-surface p-4 shadow-border">
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted">SKR → USDC</p>
      <p className="mt-2 font-display text-2xl">24 SKR → 0.43 USDC</p>
      <p className="mt-1 font-mono text-[11px] text-subtle">
        {t.spread} · {t.spreadSplit}
      </p>
      <Button
        variant="secondary"
        className="mt-4 w-full"
        disabled={done}
        onClick={() => {
          setDone(true);
          onDone();
        }}
      >
        {t.swapCta}
      </Button>
    </div>
  );
}
