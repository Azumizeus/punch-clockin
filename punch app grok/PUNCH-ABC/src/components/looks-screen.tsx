import { Link } from "@tanstack/react-router";

const LOOKS = [
  { id: "A", title: "Horloge d’usine", to: "/a" as const, src: "/looks/a.jpg", body: "Le tampon est l’app." },
  { id: "B", title: "Ticket de pointeuse", to: "/b" as const, src: "/looks/b.jpg", body: "Le reçu est l’écran." },
  { id: "C", title: "Hardware Seeker", to: "/c" as const, src: "/looks/c.jpg", body: "Presque vide. CLOCK IN." },
];

export function LooksScreen() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg text-fg">
      <header className="flex items-center justify-between px-4 pt-3">
        <Link to="/" className="flex h-11 items-center text-sm text-muted">
          ← Mode d’emploi
        </Link>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">3 habillages</p>
      </header>
      <h1 className="px-5 pt-3 font-display text-3xl font-medium tracking-tight">A · B · C séparés</h1>
      <p className="px-5 pt-2 text-sm text-muted">
        Un thème pour toute l’app : accueil, missions, globe, argent, la part. Pas seulement l’écran d’entrée.
      </p>
      <div className="mt-4 flex flex-col gap-4 px-5 pb-10">
        {LOOKS.map((l) => (
          <article key={l.id} className="overflow-hidden rounded-2xl bg-surface shadow-border">
            <img src={l.src} alt={l.title} className="h-48 w-full object-cover object-top" />
            <div className="p-4">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">{l.id}</p>
              <p className="mt-1 font-display text-2xl font-medium">{l.title}</p>
              <p className="mt-1 text-sm text-muted">{l.body}</p>
              <Link
                to={l.to}
                className="mt-3 flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-medium text-accent-fg"
              >
                Ouvrir {l.id} →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
