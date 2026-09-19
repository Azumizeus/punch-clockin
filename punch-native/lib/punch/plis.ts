import type { Pli } from "./types";

export const seedPlis = (): Pli[] => [
  {
    id: "pli-seed-1",
    author: "Nao",
    city: { en: "Lisbon", fr: "Lisbonne" },
    tease: {
      en: "The real reason the café wifi drops at 6pm",
      fr: "La vraie raison du wifi du café qui lâche à 18h",
    },
    body: {
      en: "It's the espresso machine sharing the same breaker as the router. Ask for the back table, it's on a different circuit.",
      fr: "C'est la machine à espresso sur le même disjoncteur que le routeur. Demande la table du fond, autre circuit.",
    },
    price: 1.5,
    token: "USDC",
    rank: "open",
    genesisRequired: false,
    opensAt: Date.now(),
  },
  {
    id: "pli-seed-2",
    author: "Karim",
    city: { en: "Kuala Lumpur", fr: "Kuala Lumpur" },
    tease: {
      en: "Which stall at the night market actually pays out fast",
      fr: "Le stand du marché de nuit qui paie vraiment vite",
    },
    body: {
      en: "Pasar Gate settles USDT within the minute. The one next to it batches once an hour — don't rush that one.",
      fr: "Pasar Gate règle en USDT en moins d'une minute. Celui d'à côté groupe une fois par heure — ne te presse pas là-bas.",
    },
    price: 2.2,
    token: "USDT",
    rank: "open",
    genesisRequired: false,
    opensAt: Date.now(),
  },
  {
    id: "pli-seed-3",
    author: "Inès",
    city: { en: "Paris 11e", fr: "Paris 11e" },
    tease: {
      en: "How I got Gold rank in nine days, not thirty",
      fr: "Comment j'ai eu le rang Gold en neuf jours, pas trente",
    },
    body: {
      en: "Stack the swap-pulse shifts on weekday mornings — spots refill faster than the app shows. Staked to 5,000 by day nine.",
      fr: "Enchaîne les swaps pulse le matin en semaine — les places se libèrent plus vite que l'app ne l'affiche. Gold en neuf jours.",
    },
    price: 3,
    token: "USDC",
    rank: "silver",
    genesisRequired: false,
    opensAt: Date.now() + 60_000,
  },
];
