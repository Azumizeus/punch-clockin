import { Link } from "@tanstack/react-router";
import { usePunch, useT } from "@/lib/punch/store";
import { cn } from "@/lib/utils";

export function PunchBar() {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);
  const theme = usePunch((s) => s.theme);
  const setTheme = usePunch((s) => s.setTheme);

  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-3">
      <Link to="/" className="flex h-11 items-center text-sm text-muted">
        ← {t.atelier}
      </Link>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={cn(
            "h-11 min-w-11 rounded-lg px-3 text-sm",
            theme === "dark" ? "bg-surface-2 text-fg" : "text-muted",
          )}
          onClick={() => setTheme("dark")}
        >
          {t.themeDark}
        </button>
        <button
          type="button"
          className={cn(
            "h-11 min-w-11 rounded-lg px-3 text-sm",
            theme === "light" ? "bg-surface-2 text-fg" : "text-muted",
          )}
          onClick={() => setTheme("light")}
        >
          {t.themeLight}
        </button>
        <button
          type="button"
          className="h-11 rounded-lg px-3 text-sm text-muted"
          onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
        >
          {locale === "fr" ? "EN" : "FR"}
        </button>
      </div>
    </div>
  );
}
