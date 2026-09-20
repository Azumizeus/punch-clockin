import { usePunch, useT } from "@/lib/punch/store";
import { cn } from "@/lib/utils";

export function TopBar({ withBrand = false }: { withBrand?: boolean }) {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);
  const theme = usePunch((s) => s.theme);
  const setTheme = usePunch((s) => s.setTheme);
  const product = usePunch((s) => s.product);
  const setProduct = usePunch((s) => s.setProduct);
  const connected = usePunch((s) => s.wallet.connected);

  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-3">
      {withBrand && connected ? (
        <div className="flex gap-1">
          <button
            type="button"
            className={cn(
              "h-11 rounded-lg px-3 text-sm font-medium",
              product === "punch" ? "bg-accent text-accent-fg" : "text-muted",
            )}
            onClick={() => setProduct("punch")}
          >
            {t.app}
          </button>
          <button
            type="button"
            className={cn(
              "h-11 rounded-lg px-3 text-sm font-medium",
              product === "pli" ? "bg-accent text-accent-fg" : "text-muted",
            )}
            onClick={() => setProduct("pli")}
          >
            {t.pliName}
          </button>
        </div>
      ) : withBrand ? (
        <span className="font-mono text-xs uppercase tracking-widest text-muted">{t.app}</span>
      ) : (
        <span />
      )}
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
