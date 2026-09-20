import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { usePunch } from "@/lib/punch/store";
import { cn } from "@/lib/utils";

const SLIDES = {
  en: [
    {
      k: "01",
      t: "People bought the phone. Then they stopped opening it.",
      b: "150,000 Seekers. After the SKR airdrop, daily use dropped. CLOCK IN scores apps on one thing first: do people come back tomorrow?",
    },
    {
      k: "02",
      t: "PUNCH is a paycheck, not a game.",
      b: "A shop or a team locks real digital dollars. You show up with your Seeker. You do a short job. You get paid. No points that might become money later.",
    },
    {
      k: "03",
      t: "Your phone proves a human was there.",
      b: "The Seeker signs. A laptop farm cannot fake a phone that is not in the café. That is the surprise: presence you can pay, because it is scarce.",
    },
    {
      k: "04",
      t: "92% you. 3% SKR holders. 5% the app.",
      b: "The 5% is the creator — shown on every receipt. Holders get real dollars, not printed tokens. Rank only lets you see better jobs first.",
    },
    {
      k: "05",
      t: "Say hi in the street. Both of you get paid.",
      b: "Nearby Seekers can greet. Ten cents each, paid from the app's cut. A reason to look up from the screen — and a reason to open PUNCH again.",
    },
    {
      k: "06",
      t: "That is PUNCH. Presence you can pay.",
      b: "Daily check-in. Paid jobs. Public cut. SKR as access. A laptop cannot fake a phone that is not in the café.",
    },
    {
      k: "07",
      t: "PLI is the other verb: hide.",
      b: "You seal a note on the Seeker. Someone pays USDC to unwrap it. Solana sees the payment. The phone holds the text. The chain is blind.",
    },
    {
      k: "08",
      t: "Two products. One honest cut.",
      b: "PUNCH sells presence. PLI sells a secret. Neither prints a wage. 92 / 3 / 5 on both. You come back to Punch to be there — to Pli because a seal matured, or someone paid to read you.",
    },
  ],
  fr: [
    {
      k: "01",
      t: "Les gens ont le téléphone. Puis ils ne l’ouvrent plus.",
      b: "150 000 Seekers. Après l’airdrop SKR, l’usage quotidien a chuté. CLOCK IN note d’abord une chose : est-ce qu’on revient demain ?",
    },
    {
      k: "02",
      t: "PUNCH est une paie, pas un jeu.",
      b: "Un commerce ou une équipe bloque de vrais dollars numériques. Tu te présentes avec ton Seeker. Tu fais une courte mission. Tu es payé. Pas de points qui « deviendront » de l’argent.",
    },
    {
      k: "03",
      t: "Ton téléphone prouve qu’un humain était là.",
      b: "Le Seeker signe. Une ferme d’ordinateurs ne simule pas un téléphone qui n’est pas dans le café. C’est la surprise : une présence qu’on peut payer, parce qu’elle est rare.",
    },
    {
      k: "04",
      t: "92 % toi. 3 % ceux qui gardent du SKR. 5 % l’app.",
      b: "Les 5 %, c’est le créateur — écrit sur chaque reçu. Les gardiens SKR touchent de vrais dollars, pas des jetons imprimés. Le rang sert seulement à voir les meilleures missions en premier.",
    },
    {
      k: "05",
      t: "Un bonjour dans la rue. Vous êtes payés tous les deux.",
      b: "Les Seekers près de toi peuvent se saluer. 10 cents chacun, payés avec la part de l’app. Une raison de lever les yeux — et de rouvrir PUNCH.",
    },
    {
      k: "06",
      t: "Ça, c’est PUNCH. Une présence qu’on peut payer.",
      b: "Check-in du jour. Missions payées. Part publique. SKR = accès. Un ordinateur ne simule pas un téléphone qui n’est pas dans le café.",
    },
    {
      k: "07",
      t: "PLI, c’est l’autre verbe : cacher.",
      b: "Tu scelles une note sur le Seeker. Quelqu’un paie en USDC pour la décacheter. Solana voit le paiement. Le téléphone garde le texte. La chaîne est aveugle.",
    },
    {
      k: "08",
      t: "Deux produits. Une part honnête.",
      b: "PUNCH vend la présence. PLI vend un secret. Aucun des deux n’imprime un salaire. 92 / 3 / 5 partout. On revient à Punch pour être là — à Pli parce qu’un sceau a mûri, ou que quelqu’un a payé pour te lire.",
    },
  ],
};

export function PitchScreen() {
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);
  const [i, setI] = useState(0);
  const slides = SLIDES[locale];
  const slide = slides[i];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg text-fg">
      <div className="flex items-center justify-between px-5 pt-4">
        <Link to="/" className="flex h-11 items-center text-sm text-muted">
          ← {locale === "fr" ? "Les deux apps" : "Both apps"}
        </Link>
        <button
          type="button"
          className="h-11 px-3 text-sm text-muted"
          onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
        >
          {locale === "fr" ? "EN" : "FR"}
        </button>
      </div>
      <div key={slide.k} className="stagger-in flex flex-1 flex-col px-5 pt-8">
        <p className="text-sm text-muted">
          {slide.k} / 08
        </p>
        <h1 className="mt-4 font-display text-3xl font-medium leading-[1.15] tracking-tight">
          {slide.t}
        </h1>
        <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-muted">{slide.b}</p>
      </div>

      <div className="flex items-center gap-2 px-5">
        {slides.map((s, idx) => (
          <button
            key={s.k}
            type="button"
            aria-label={s.k}
            onClick={() => setI(idx)}
            className={cn(
              "h-2 rounded-full transition-[width,background-color] duration-200",
              idx === i ? "w-6 bg-accent" : "w-2 bg-line-strong",
            )}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 px-5 pb-8">
        <button
          type="button"
          className="h-12 rounded-xl bg-surface text-sm font-medium shadow-border disabled:opacity-30"
          disabled={i === 0}
          onClick={() => setI((n) => Math.max(0, n - 1))}
        >
          {locale === "fr" ? "Précédent" : "Back"}
        </button>
        {i < slides.length - 1 ? (
          <button
            type="button"
            className="h-12 rounded-xl bg-accent text-sm font-medium text-accent-fg"
            onClick={() => setI((n) => n + 1)}
          >
            {locale === "fr" ? "Suivant" : "Next"}
          </button>
        ) : (
          <Link
            to="/"
            className="flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-medium text-accent-fg"
          >
            {locale === "fr" ? "Les deux apps" : "Both apps"}
          </Link>
        )}
      </div>
    </div>
  );
}
