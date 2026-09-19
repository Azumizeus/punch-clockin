import { Link, useRouterState } from "@tanstack/react-router";
import { usePunch, useT } from "@/lib/punch/store";
import { cn } from "@/lib/utils";

export function PunchBar() {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);
  const theme = usePunch((s) => s.theme);
  const setTheme = usePunch((s) => s.setTheme);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const skin = path === "/a" || path === "/b" || path === "/c" ? path.slice(1) : "";

  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-3">
      <Link to="/looks" className="flex h-11 items-center text-sm text-muted">
        ← A B C
      </Link>
      <div className="flex items-center gap-1">
        {(["a", "b", "c"] as const).map((s) => (
          <Link
            key={s}
            to={`/${s}`}
            className={cn(
              "grid size-11 place-items-center text-sm font-medium",
              skin === s ? "bg-accent text-accent-fg" : "text-muted",
            )}
          >
            {s.toUpperCase()}
          </Link>
        ))}
        <button
          type="button"
          className="h-11 px-3 text-sm text-muted"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? t.themeDark : t.themeLight}
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