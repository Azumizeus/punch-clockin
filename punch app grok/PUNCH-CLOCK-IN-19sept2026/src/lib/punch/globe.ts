export interface Country {
  code: string;
  lat: number;
  lng: number;
  name: { en: string; fr: string };
  seekers: number;
}

export const COUNTRIES: Country[] = [
  { code: "US", lat: 39.8, lng: -98.6, name: { en: "United States", fr: "États-Unis" }, seekers: 28410 },
  { code: "NG", lat: 9.1, lng: 8.7, name: { en: "Nigeria", fr: "Nigeria" }, seekers: 19220 },
  { code: "IN", lat: 21.1, lng: 78.9, name: { en: "India", fr: "Inde" }, seekers: 14110 },
  { code: "BR", lat: -14.2, lng: -51.9, name: { en: "Brazil", fr: "Brésil" }, seekers: 11840 },
  { code: "PH", lat: 12.9, lng: 121.8, name: { en: "Philippines", fr: "Philippines" }, seekers: 9730 },
  { code: "FR", lat: 46.2, lng: 2.2, name: { en: "France", fr: "France" }, seekers: 8210 },
  { code: "ID", lat: -2.5, lng: 118.0, name: { en: "Indonesia", fr: "Indonésie" }, seekers: 7440 },
  { code: "GB", lat: 54.0, lng: -2.5, name: { en: "United Kingdom", fr: "Royaume-Uni" }, seekers: 6120 },
  { code: "DE", lat: 51.2, lng: 10.4, name: { en: "Germany", fr: "Allemagne" }, seekers: 5480 },
  { code: "MX", lat: 23.6, lng: -102.5, name: { en: "Mexico", fr: "Mexique" }, seekers: 4970 },
  { code: "JP", lat: 36.2, lng: 138.3, name: { en: "Japan", fr: "Japon" }, seekers: 4310 },
  { code: "GH", lat: 7.9, lng: -1.0, name: { en: "Ghana", fr: "Ghana" }, seekers: 3880 },
  { code: "KR", lat: 35.9, lng: 127.8, name: { en: "South Korea", fr: "Corée du Sud" }, seekers: 3220 },
  { code: "PT", lat: 39.4, lng: -8.2, name: { en: "Portugal", fr: "Portugal" }, seekers: 2910 },
  { code: "ES", lat: 40.5, lng: -3.7, name: { en: "Spain", fr: "Espagne" }, seekers: 2740 },
  { code: "CA", lat: 56.1, lng: -106.3, name: { en: "Canada", fr: "Canada" }, seekers: 2560 },
  { code: "KE", lat: 0.0, lng: 37.9, name: { en: "Kenya", fr: "Kenya" }, seekers: 2390 },
  { code: "AU", lat: -25.3, lng: 133.8, name: { en: "Australia", fr: "Australie" }, seekers: 2180 },
  { code: "AR", lat: -38.4, lng: -63.6, name: { en: "Argentina", fr: "Argentine" }, seekers: 1940 },
  { code: "VN", lat: 14.1, lng: 108.3, name: { en: "Vietnam", fr: "Viêt Nam" }, seekers: 1810 },
  { code: "ZA", lat: -30.6, lng: 22.9, name: { en: "South Africa", fr: "Afrique du Sud" }, seekers: 1620 },
  { code: "PL", lat: 51.9, lng: 19.1, name: { en: "Poland", fr: "Pologne" }, seekers: 1280 },
];

export function countryByCode(code: string) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[5];
}

export function seedToday(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of COUNTRIES) out[c.code] = Math.max(4, Math.round(c.seekers * 0.018));
  return out;
}

export function totalSeekers() {
  return COUNTRIES.reduce((n, c) => n + c.seekers, 0);
}

export function totalToday(today: Record<string, number>) {
  return Object.values(today).reduce((n, v) => n + v, 0);
}
