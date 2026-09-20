import { Link } from "@tanstack/react-router";
import { usePunch, useT } from "@/lib/punch/store";

export function StudioScreen() {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="flex items-center justify-between px-5 pt-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{t.studio}</p>
        <button
          type="button"
          className="h-11 px-3 text-sm text-muted"
          onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
        >
          {locale === "fr" ? "EN" : "FR"}
        </button>
      </header>
      <h1 className="px-5 pt-3 font-display text-3xl font-medium leading-[1.1] tracking-tight">
        {t.studioTitle}
      </h1>

      <div className="mt-4 flex flex-col gap-3 px-5 pb-4">
        <article className="rounded-2xl bg-surface-2 p-4 text-fg shadow-border">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">{t.app}</p>
          <p className="mt-1 font-display text-2xl font-medium tracking-tight">{t.punchPickBody}</p>
          <Link to="/punch" className="mt-3 flex h-12 items-center text-sm font-medium">
            {t.punchEnter} →
          </Link>
          <a href="/punch-app.zip" download="punch-app.zip" className="block h-10 text-sm text-muted">
            {t.punchCode}
          </a>
        </article>
        <article className="rounded-2xl bg-paper p-4 text-paper-fg">
          <p className="font-mono text-xs uppercase tracking-widest text-paper-muted">{t.pliName}</p>
          <p className="mt-1 font-display text-2xl font-medium tracking-tight">{t.pliPickBody}</p>
          <Link to="/pli" className="mt-3 flex h-12 items-center text-sm font-medium">
            {t.pliEnter} →
          </Link>
          <a href="/pli-app.zip" download="pli-app.zip" className="block h-10 text-sm text-paper-muted">
            {t.pliCode}
          </a>
        </article>
      </div>
      <Link to="/looks" className="pb-2 text-center text-sm text-fg">
        Habillages A · B · C séparés
      </Link>
      <Link to="/pitch" className="pb-8 text-center text-sm text-muted">
        {t.pitch}
      </Link>
    </div>
  );
}
