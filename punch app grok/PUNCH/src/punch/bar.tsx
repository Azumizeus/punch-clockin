import { Link } from "@tanstack/react-router";
import { lookGallery, THEMES } from "@/lib/punch/looks";
import { usePunch } from "@/lib/punch/store";
import type { Theme } from "@/lib/punch/types";
import { cn } from "@/lib/utils";

const THEME_LABEL: Record<Theme, { fr: string; en: string }> = {
  dark: { fr: "Sombre", en: "Dark" },
  light: { fr: "Clair", en: "Light" },
  gold: { fr: "Gold", en: "Gold" },
};

export function PunchBar() {
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);
  const theme = usePunch((s) => s.theme);
  const setTheme = usePunch((s) => s.setTheme);
  const skin = usePunch((s) => s.skin);
  const setSkin = usePunch((s) => s.setSkin);

  function cycleTheme() {
    const i = THEMES.indexOf(theme);
    setTheme(THEMES[(i + 1) % THEMES.length]);
  }

  return (
    <div className="relative z-50 flex flex-col gap-1 px-4 pt-3">
      <Link to="/looks" className="text-center font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
        {lookGallery[skin].sub}
      </Link>
      <div className="flex items-center justify-center gap-1">
        {(["b", "c"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSkin(s)}
            className={cn(
              "h-11 min-w-11 px-3 text-sm font-medium",
              skin === s ? "bg-accent text-accent-fg" : "text-muted",
            )}
          >
            {s.toUpperCase()}
          </button>
        ))}
        <button type="button" className="h-11 px-3 text-sm text-muted" onClick={cycleTheme}>
          {THEME_LABEL[theme][locale]}
        </button>
        <button
          type="button"
          className="h-11 px-3 text-sm text-muted"
          onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
        >
          {locale === "fr" ? "EN" : "FR"}
        </button>
      </div>
    </div>
  );
}
