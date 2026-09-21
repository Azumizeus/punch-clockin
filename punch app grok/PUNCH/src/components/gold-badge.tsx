import { usePunch } from "@/lib/punch/store";

/**
 * SEEKER PREMIUM — le badge de l'écran wallet, miroir du composant natif
 * (punch-native/components/GoldBadge.tsx). Un lingot simple et net :
 * dégradé métal en 3 nuances (reflet → métal → ombre, mêmes hex que le
 * metalKit natif), liseré clair, ✦ scintillant, deux lignes gravées.
 * Pas de stats : c'est un blason, pas un tableau de bord.
 * Porté uniquement sur le thème gold, wallet connecté — comme en natif.
 */
export function GoldBadge() {
  const locale = usePunch((s) => s.locale);
  const theme = usePunch((s) => s.theme);
  const connected = usePunch((s) => s.wallet.connected);
  if (theme !== "gold" || !connected) return null;

  return (
    <div
      className="mt-6 flex items-center gap-3 px-[18px] py-[14px]"
      style={{
        background: "linear-gradient(135deg, #f3dc8e 0%, #d4af37 52%, #8a6d1f 100%)",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.35)",
      }}
    >
      <span style={{ fontSize: 22, color: "#191510" }}>✦</span>
      <span className="min-w-0 flex-1">
        <span
          className="block font-semibold"
          style={{ fontSize: 13, letterSpacing: 2, color: "#191510" }}
        >
          SEEKER PREMIUM
        </span>
        <span
          className="mt-0.5 block font-mono"
          style={{ fontSize: 10, letterSpacing: 1.5, color: "rgba(20, 16, 6, 0.6)" }}
        >
          {locale === "fr" ? "IDENTITÉ OR · v1.6" : "GOLD IDENTITY · v1.6"}
        </span>
      </span>
    </div>
  );
}
