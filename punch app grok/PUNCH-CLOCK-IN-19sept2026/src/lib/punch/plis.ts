import type { Pli } from "./types";

export function seedPlis(): Pli[] {
  const soon = Date.now() + 45_000;
  return [
    {
      id: "pli-ines",
      author: "Inès",
      city: { en: "Lisbon", fr: "Lisbonne" },
      tease: {
        en: "A rooftop that is empty after 10pm.",
        fr: "Un toit vide après 22h.",
      },
      body: {
        en: "Lumen café, side door, code 4-9-1. After 22:00 nobody checks. Bring cash for the elevator guy if he’s there.",
        fr: "Café Lumen, porte de côté, code 4-9-1. Après 22h personne ne contrôle. Un billet pour le gars de l’ascenseur s’il est là.",
      },
      price: 2.4,
      token: "USDC",
      rank: "open",
      genesisRequired: false,
      opensAt: 0,
    },
    {
      id: "pli-karim",
      author: "Karim",
      city: { en: "Paris", fr: "Paris" },
      tease: {
        en: "A timed note about SKR. Sealed until the clock runs out.",
        fr: "Une note datée sur le SKR. Scellée jusqu’à la fin du compte à rebours.",
      },
      body: {
        en: "Don’t dump SKR tomorrow morning. A stall is paying witnesses in USDT at 09:00 near Oberkampf. The price is the line, not the token.",
        fr: "Ne jette pas ton SKR demain matin. Un stand paie des témoins en USDT à 9h près d’Oberkampf. Le prix, c’est la file, pas le jeton.",
      },
      price: 3.1,
      token: "USDT",
      rank: "open",
      genesisRequired: false,
      opensAt: soon,
    },
    {
      id: "pli-nao",
      author: "Nao",
      city: { en: "Tokyo", fr: "Tokyo" },
      tease: {
        en: "A stall map. Only a real Seeker can unwrap it.",
        fr: "Un plan de stands. Seul un vrai Seeker peut le décacheter.",
      },
      body: {
        en: "Night market row C, third generator. The quiet stall is a front — ask for ‘pulse’ and they route USDC under the table.",
        fr: "Marché de nuit, rangée C, troisième groupe électrogène. Le stand silencieux est une façade — demande « pulse », ils routent l’USDC en dessous.",
      },
      price: 5,
      token: "USDC",
      rank: "open",
      genesisRequired: true,
      opensAt: 0,
    },
    {
      id: "pli-mira",
      author: "Mira",
      city: { en: "Lisbon", fr: "Lisbonne" },
      tease: {
        en: "Gold only. A name you don’t put in a group chat.",
        fr: "Gold seulement. Un nom qu’on ne met pas dans un groupe.",
      },
      body: {
        en: "The buyer is ‘Helena R.’ She pays in USDT, never SKR. Meet at the yellow kiosk, not the office.",
        fr: "L’acheteuse s’appelle Helena R. Elle paie en USDT, jamais en SKR. RDV au kiosque jaune, pas au bureau.",
      },
      price: 8,
      token: "USDC",
      rank: "gold",
      genesisRequired: false,
      opensAt: 0,
    },
  ];
}
