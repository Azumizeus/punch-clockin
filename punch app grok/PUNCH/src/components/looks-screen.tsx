import { Link, useNavigate } from "@tanstack/react-router";
import { usePunch } from "@/lib/punch/store";
import { lookGallery } from "@/lib/punch/looks";
import type { Skin } from "@/lib/punch/types";

const LOOKS: Array<{ id: Skin; src: string }> = [
  { id: "b", src: "/looks/b.jpg" },
  { id: "c", src: "/looks/c.jpg" },
];

export function LooksScreen() {
  const setSkin = usePunch((s) => s.setSkin);
  const navigate = useNavigate();

  function open(id: Skin) {
    setSkin(id);
    void navigate({ to: "/punch" });
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg text-fg">
      <header className="flex items-center justify-between px-4 pt-3">
        <Link to="/" className="flex h-11 items-center text-sm text-muted">
          ← Mode d’emploi
        </Link>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">2 habillages</p>
      </header>
      <h1 className="px-5 pt-3 font-display text-3xl font-medium tracking-tight">Habillage</h1>
      <p className="px-5 pt-2 text-sm text-muted">
        B ticket ou C hardware. Couleur à part : clair, sombre, Gold Seeker Premium.
      </p>
      <div className="mt-4 flex flex-col gap-4 px-5 pb-10">
        {LOOKS.map((l) => (
          <article key={l.id} className="overflow-hidden rounded-2xl bg-surface shadow-border">
            <img src={l.src} alt={lookGallery[l.id].name} className="h-48 w-full object-cover object-top" />
            <div className="p-4">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">{lookGallery[l.id].sub}</p>
              <p className="mt-1 font-display text-2xl font-medium">{lookGallery[l.id].name}</p>
              <p className="mt-1 text-sm text-muted">{lookGallery[l.id].desc.fr}</p>
              <button
                type="button"
                onClick={() => open(l.id)}
                className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-accent text-sm font-medium text-accent-fg"
              >
                Appliquer {l.id.toUpperCase()} →
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}