import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, countryByCode, totalSeekers, totalToday } from "@/lib/punch/globe";
import { usePunch, useT } from "@/lib/punch/store";
import { cn } from "@/lib/utils";

export function GlobeScreen() {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const country = usePunch((s) => s.country);
  const setCountry = usePunch((s) => s.setCountry);
  const today = usePunch((s) => s.globeToday);
  const pulse = usePunch((s) => s.globePulse);
  const lastPunchAt = usePunch((s) => s.lastPunchAt);
  const setTab = usePunch((s) => s.setTab);
  const [picked, setPicked] = useState(country);
  const punched = !!lastPunchAt;

  const ranked = useMemo(() => {
    return [...COUNTRIES].sort(
      (a, b) => (today[b.code] ?? 0) + b.seekers - ((today[a.code] ?? 0) + a.seekers),
    );
  }, [today]);

  const selected = countryByCode(picked);
  const you = countryByCode(country);

  return (
    <div className="px-5 pb-8 pt-2">
      <h1 className="font-display text-3xl font-medium tracking-tight">{t.globeTag}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.globePrivacy}</p>

      <GlobeCanvas
        today={today}
        pulse={pulse}
        you={country}
        selected={picked}
        onPick={setPicked}
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat k={t.globeAll} v={totalSeekers().toLocaleString()} />
        <Stat k={t.globeToday} v={totalToday(today).toLocaleString()} />
      </div>

      <div className="mt-4 rounded-xl bg-surface p-4 shadow-border">
        <p className="text-xs uppercase tracking-wide text-subtle">{selected.name[locale]}</p>
        <p className="mt-1 font-display text-2xl font-medium tabular-nums">
          {(today[selected.code] ?? 0).toLocaleString()} · {t.globeToday}
        </p>
        <p className="mt-1 text-sm text-muted">
          {selected.seekers.toLocaleString()} {t.globeAll}
        </p>
        {pulse && pulse.code === selected.code ? (
          <p className="mt-2 truncate font-mono text-[10px] text-subtle">
            {t.globeStamp} {pulse.sig.slice(0, 20)}…
          </p>
        ) : null}
      </div>

      {punched ? (
        <p className="mt-4 text-center text-sm text-fg">
          {t.globeYou} · {you.name[locale]}
        </p>
      ) : (
        <button type="button" className="mt-4 h-11 w-full text-sm text-muted" onClick={() => setTab("punch")}>
          {t.globeNeed}
        </button>
      )}

      <p className="mt-6 text-xs uppercase tracking-wide text-subtle">{t.globePick}</p>
      <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => {
              setCountry(c.code);
              setPicked(c.code);
            }}
            className={cn(
              "h-11 shrink-0 rounded-full px-4 text-sm",
              country === c.code ? "bg-accent text-accent-fg" : "bg-surface text-muted",
            )}
          >
            {c.name[locale]}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs uppercase tracking-wide text-subtle">{t.globeLive}</p>
      <ol className="mt-2 divide-y divide-line">
        {ranked.slice(0, 8).map((c) => (
          <li key={c.code}>
            <button
              type="button"
              className="flex h-12 w-full items-baseline justify-between gap-3 text-left"
              onClick={() => setPicked(c.code)}
            >
              <span className={c.code === country ? "text-fg" : "text-muted"}>{c.name[locale]}</span>
              <span className="font-mono text-xs tabular-nums">
                {(today[c.code] ?? 0).toLocaleString()}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-surface p-3 shadow-border">
      <p className="text-xs text-subtle">{k}</p>
      <p className="mt-1 font-display text-xl font-medium tabular-nums">{v}</p>
    </div>
  );
}

function GlobeCanvas({
  today,
  pulse,
  you,
  selected,
  onPick,
}: {
  today: Record<string, number>;
  pulse: { code: string; at: number } | null;
  you: string;
  selected: string;
  onPick: (code: string) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rot = useRef(-0.55);
  const omega = useRef(0.12);
  const drag = useRef({ on: false, x: 0, t: 0, moved: 0 });
  const todayRef = useRef(today);
  const pulseRef = useRef(pulse);
  const youRef = useRef(you);
  const selectedRef = useRef(selected);
  const pickRef = useRef(onPick);
  todayRef.current = today;
  pulseRef.current = pulse;
  youRef.current = you;
  selectedRef.current = selected;
  pickRef.current = onPick;

  useEffect(() => {
    const node = ref.current;
    const gfx = node?.getContext("2d", { alpha: false }) ?? null;
    if (!node || !gfx) return;
    const el: HTMLCanvasElement = node;
    const g: CanvasRenderingContext2D = gfx;
    let raf = 0;
    const parent = el.parentElement;
    let w = 0;
    let h = 0;
    let last = performance.now();
    let visible = true;
    let colors = { fg: "#f2f1ee", accent: "#d7d2cb", bg: "#0c0c0d", line: "rgba(242,241,238,0.18)" };

    const IDLE = 0.12;
    const DAMP = 1.85;
    const MAX_OMEGA = 9;

    function readColors() {
      const s = getComputedStyle(document.documentElement);
      colors = {
        fg: s.getPropertyValue("--color-fg").trim() || colors.fg,
        accent: s.getPropertyValue("--color-accent").trim() || colors.accent,
        bg: s.getPropertyValue("--color-bg").trim() || colors.bg,
        line: s.getPropertyValue("--color-line-strong").trim() || colors.line,
      };
    }

    function resize() {
      w = parent?.clientWidth ?? 360;
      h = Math.round(w * 0.92);
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function radius() {
      return Math.min(w, h) * 0.42;
    }

    function project(lat: number, lng: number) {
      const λ = (lng * Math.PI) / 180 + rot.current;
      const φ = (lat * Math.PI) / 180;
      const x = Math.cos(φ) * Math.sin(λ);
      const z = Math.cos(φ) * Math.cos(λ);
      const y = Math.sin(φ);
      if (z < 0.02) return null;
      const r = radius();
      return { x: w / 2 + x * r, y: h / 2 - y * r, z, r };
    }

    function step(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag.current.on) {
        omega.current += (IDLE - omega.current) * (1 - Math.exp(-DAMP * dt));
        rot.current += omega.current * dt;
      }
    }

    function draw(now: number) {
      if (!visible) {
        raf = 0;
        return;
      }
      step(now);
      const today = todayRef.current;
      const pulse = pulseRef.current;
      const you = youRef.current;
      const selected = selectedRef.current;
      let maxToday = 1;
      for (const c of COUNTRIES) {
        const n = today[c.code] ?? 0;
        if (n > maxToday) maxToday = n;
      }
      g.fillStyle = colors.bg;
      g.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const r = radius();

      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fillStyle = colors.bg;
      g.fill();
      g.strokeStyle = colors.line;
      g.lineWidth = 1;
      g.stroke();

      g.save();
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.clip();
      g.globalAlpha = 0.35;
      const latStep = drag.current.on ? 4 : 8;
      for (let i = -2; i <= 2; i++) {
        g.beginPath();
        let started = false;
        for (let lat = -80; lat <= 80; lat += latStep) {
          const p = project(lat, i * 36);
          if (!p) {
            started = false;
            continue;
          }
          if (!started) {
            g.moveTo(p.x, p.y);
            started = true;
          } else g.lineTo(p.x, p.y);
        }
        g.strokeStyle = colors.line;
        g.stroke();
      }
      g.globalAlpha = 1;

      const tnow = Date.now();
      for (const c of COUNTRIES) {
        const p = project(c.lat, c.lng);
        if (!p) continue;
        const n = today[c.code] ?? 0;
        let rad = 2.2 + (n / maxToday) * 5.5;
        if (pulse && pulse.code === c.code) {
          const t = Math.min(1, (tnow - pulse.at) / 1400);
          rad += (1 - t) * 8;
        }
        g.beginPath();
        g.arc(p.x, p.y, rad, 0, Math.PI * 2);
        g.fillStyle = c.code === you || c.code === selected ? colors.accent : colors.fg;
        g.globalAlpha = c.code === selected ? 1 : 0.55 + p.z * 0.35;
        g.fill();
        g.globalAlpha = 1;
      }
      g.restore();

      raf = requestAnimationFrame(draw);
    }

    function kick() {
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    }

    function pick(ev: PointerEvent) {
      const rect = el.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      let best: { code: string; d: number } | null = null;
      for (const c of COUNTRIES) {
        const p = project(c.lat, c.lng);
        if (!p) continue;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < 22 && (!best || d < best.d)) best = { code: c.code, d };
      }
      if (best) pickRef.current(best.code);
    }

    const onDown = (e: PointerEvent) => {
      drag.current = { on: true, x: e.clientX, t: performance.now(), moved: 0 };
      omega.current = 0;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.on) return;
      const now = performance.now();
      const dx = e.clientX - drag.current.x;
      const dt = Math.max(0.008, (now - drag.current.t) / 1000);
      const dTheta = dx / Math.max(80, radius());
      rot.current += dTheta;
      omega.current = Math.max(-MAX_OMEGA, Math.min(MAX_OMEGA, dTheta / dt));
      drag.current.x = e.clientX;
      drag.current.t = now;
      drag.current.moved += Math.abs(dx);
    };
    const onUp = (e: PointerEvent) => {
      const moved = drag.current.moved;
      drag.current.on = false;
      if (moved < 6) pick(e);
    };

    const onVis = () => {
      visible = document.visibilityState === "visible";
      if (visible) kick();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = !!entries[0]?.isIntersecting && document.visibilityState === "visible";
        if (visible) kick();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.05 },
    );
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-look", "data-theme", "style"] });

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    resize();
    readColors();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    last = performance.now();
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="mt-4 w-full touch-none rounded-2xl bg-surface shadow-border"
      aria-label="Globe"
    />
  );
}

