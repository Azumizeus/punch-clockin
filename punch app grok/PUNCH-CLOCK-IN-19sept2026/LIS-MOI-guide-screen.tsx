import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePunch, useT } from "@/lib/punch/store";
import { cn } from "@/lib/utils";

const LAST = 7;

export function GuideScreen() {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);
  const [step, setStep] = useState(0);
  const [punched, setPunched] = useState(false);
  const [cut, setCut] = useState<string | null>(null);
  const [stamped, setStamped] = useState(false);
  const [hi, setHi] = useState(false);
  const [sealed, setSealed] = useState(false);

  function next() {
    setStep((s) => Math.min(LAST, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg text-fg">
      <header className="flex items-center justify-between px-4 pt-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {step + 1} / {LAST + 1}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="h-11 px-3 text-sm text-muted"
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
          >
            {locale === "fr" ? "EN" : "FR"}
          </button>
          <Link to="/apps" className="flex h-11 items-center px-2 text-sm text-muted">
            {t.guideSkip}
          </Link>
        </div>
      </header>

      <div className="flex gap-1 px-5 pt-2">
        {Array.from({ length: LAST + 1 }).map((_, n) => (
          <button
            key={n}
            type="button"
            className={cn("h-1 flex-1 rounded-full", n <= step ? "bg-accent" : "bg-line-strong")}
            onClick={() => setStep(n)}
            aria-label={`Step ${n + 1}`}
          />
        ))}
      </div>

      <main className="flex flex-1 flex-col px-5 pb-4 pt-6">
        {step === 0 ? <StepHero t={t} onGo={next} /> : null}
        {step === 1 ? <StepPunch t={t} punched={punched} onPunch={() => setPunched(true)} /> : null}
        {step === 2 ? <StepTicket t={t} /> : null}
        {step === 3 ? <StepCut t={t} cut={cut} onCut={setCut} /> : null}
        {step === 4 ? <StepGlobe t={t} stamped={stamped} onStamp={() => setStamped(true)} /> : null}
        {step === 5 ? <StepJob t={t} /> : null}
        {step === 6 ? <StepHi t={t} hi={hi} onHi={() => setHi(true)} /> : null}
        {step === 7 ? <StepPli t={t} sealed={sealed} onSeal={() => setSealed(true)} /> : null}
      </main>

      <footer className="grid grid-cols-2 gap-2 px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {step === 0 ? (
          <Button className="col-span-2" size="lg" onClick={next}>
            {t.guideStart}
          </Button>
        ) : step === LAST ? (
          <>
            <Link
              to="/punch"
              className="flex h-12 items-center justify-center rounded-xl bg-accent text-base font-medium text-accent-fg"
            >
              {t.punchEnter}
            </Link>
            <Link
              to="/pli"
              className="flex h-12 items-center justify-center rounded-xl bg-paper text-base font-medium text-paper-fg"
            >
              {t.pliEnter}
            </Link>
          </>
        ) : (
          <>
            <Button variant="secondary" size="lg" onClick={back}>
              {t.guideBack}
            </Button>
            <Button
              size="lg"
              onClick={next}
              disabled={
                (step === 1 && !punched) ||
                (step === 3 && !cut) ||
                (step === 4 && !stamped) ||
                (step === 6 && !hi) ||
                (step === 7 && !sealed)
              }
            >
              {t.guideNext}
            </Button>
          </>
        )}
      </footer>
    </div>
  );
}

function StepHero({ t, onGo }: { t: ReturnType<typeof useT>; onGo: () => void }) {
  return (
    <button type="button" onClick={onGo} className="flex flex-1 flex-col items-center justify-center text-center">
      <svg viewBox="0 0 32 32" className="size-10" aria-hidden>
        <path fill="currentColor" d="M18.4 3.2 8.6 16.8h6.1l-2.2 12 11.6-16.1h-6.4L18.4 3.2Z" />
      </svg>
      <h1 className="mt-8 font-display text-5xl font-medium tracking-tight">{t.g1t}</h1>
      <p className="mt-4 max-w-[32ch] text-base leading-relaxed text-muted">{t.g1b}</p>
    </button>
  );
}

function StepPunch({
  t,
  punched,
  onPunch,
}: {
  t: ReturnType<typeof useT>;
  punched: boolean;
  onPunch: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <h1 className="font-display text-3xl font-medium tracking-tight">{t.g2t}</h1>
      <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-muted">{t.g2b}</p>
      <button
        type="button"
        onClick={onPunch}
        className={cn(
          "relative mt-10 grid size-44 place-items-center rounded-full",
          punched ? "bg-surface-2" : "bg-accent text-accent-fg",
        )}
      >
        {!punched ? <span className="pulse-ring pointer-events-none absolute inset-2 rounded-full border border-line-strong" /> : null}
        <svg viewBox="0 0 32 32" className="size-12" aria-hidden>
          <path fill="currentColor" d="M18.4 3.2 8.6 16.8h6.1l-2.2 12 11.6-16.1h-6.4L18.4 3.2Z" />
        </svg>
      </button>
      <p className="mt-5 font-display text-xl">{punched ? t.punched : t.g2go}</p>
    </div>
  );
}

function StepTicket({ t }: { t: ReturnType<typeof useT> }) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-display text-3xl font-medium tracking-tight">{t.g3t}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.g3b}</p>
      <article className="mt-6 rounded-sm bg-paper px-5 py-6 text-paper-fg">
        <div className="flex justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-paper-muted">{t.app}</p>
          <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
            <path fill="currentColor" d="M18.4 3.2 8.6 16.8h6.1l-2.2 12 11.6-16.1h-6.4L18.4 3.2Z" />
          </svg>
        </div>
        <p className="mt-5 font-display text-6xl font-medium leading-none">{t.ticketIn}</p>
        <p className="mt-2 font-display text-3xl">France</p>
        <p className="mt-6 font-mono text-sm">{t.ticketRule}</p>
      </article>
    </div>
  );
}

function StepCut({
  t,
  cut,
  onCut,
}: {
  t: ReturnType<typeof useT>;
  cut: string | null;
  onCut: (k: string) => void;
}) {
  const label = cut === "92" ? t.g4w : cut === "3" ? t.g4s : cut === "5" ? t.g4p : t.g4b;
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-display text-3xl font-medium tracking-tight">{t.g4t}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{label}</p>
      <div className="mt-8 grid grid-cols-3 gap-2">
        {(
          [
            ["92", t.worker],
            ["3", t.stakers],
            ["5", t.protocol],
          ] as const
        ).map(([n, k]) => (
          <button
            key={n}
            type="button"
            onClick={() => onCut(n)}
            className={cn(
              "rounded-xl px-2 py-6 text-center",
              cut === n ? "bg-accent text-accent-fg" : "bg-surface text-fg",
            )}
          >
            <p className="font-display text-4xl font-medium">{n}%</p>
            <p className="mt-2 text-xs leading-snug">{k}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepGlobe({
  t,
  stamped,
  onStamp,
}: {
  t: ReturnType<typeof useT>;
  stamped: boolean;
  onStamp: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <h1 className="font-display text-3xl font-medium tracking-tight">{t.g5t}</h1>
      <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-muted">{t.g5b}</p>
      <button
        type="button"
        onClick={onStamp}
        className="relative mt-8 grid size-48 place-items-center rounded-full bg-surface shadow-border"
      >
        <span className="absolute size-40 rounded-full border border-line-strong" />
        <span
          className={cn(
            "absolute size-3 rounded-full",
            stamped ? "bg-accent" : "bg-fg/50",
          )}
          style={{ transform: "translate(28px, -18px)" }}
        />
        <span className="font-mono text-xs text-muted">{stamped ? "FR" : "···"}</span>
      </button>
      <p className="mt-5 text-sm">{stamped ? t.globeYou : t.g5go}</p>
    </div>
  );
}

function StepJob({ t }: { t: ReturnType<typeof useT> }) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-display text-3xl font-medium tracking-tight">{t.g6t}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.g6b}</p>
      <div className="mt-6 rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-xs text-subtle">NEXUS</p>
        <p className="mt-1 font-display text-2xl font-medium">{t.needPunch}</p>
        <p className="mt-4 font-display text-3xl tabular-nums">2.50 USDC</p>
        <p className="mt-2 font-mono text-xs text-muted">92 / 3 / 5</p>
      </div>
    </div>
  );
}

function StepHi({
  t,
  hi,
  onHi,
}: {
  t: ReturnType<typeof useT>;
  hi: boolean;
  onHi: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-display text-3xl font-medium tracking-tight">{t.g7t}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.g7b}</p>
      <div className="mt-6 flex items-center justify-between rounded-xl bg-surface px-4 py-4 shadow-border">
        <div>
          <p className="font-medium">Léa</p>
          <p className="text-xs text-muted">12 {t.meters}</p>
        </div>
        <Button size="sm" variant={hi ? "secondary" : "primary"} disabled={hi} onClick={onHi}>
          {hi ? t.greeted : t.g7go}
        </Button>
      </div>
      {hi ? <p className="mt-4 text-sm">+ 0.10 USDC · {t.g4p}</p> : null}
    </div>
  );
}

function StepPli({
  t,
  sealed,
  onSeal,
}: {
  t: ReturnType<typeof useT>;
  sealed: boolean;
  onSeal: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-display text-3xl font-medium tracking-tight">{t.g8t}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.g8b}</p>
      <button type="button" onClick={onSeal} className="envelope mt-6 text-left">
        <div className="envelope-flap" />
        <div className="p-4">
          <div className="flex items-start justify-between">
            <p className="text-sm text-muted">Nexus</p>
            <span className="wax text-[10px] font-medium">{sealed ? "OK" : "PL"}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-medium">
            {sealed ? t.pliLetter : t.g8go}
          </p>
        </div>
      </button>
      <p className="mt-8 text-center font-display text-xl">{t.guideDone}</p>
    </div>
  );
}
