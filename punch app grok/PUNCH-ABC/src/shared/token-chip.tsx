import { cn } from "@/lib/utils";
import type { Token } from "@/lib/punch/types";

export function TokenChip({
  token,
  className,
}: {
  token: Token;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px] tracking-wide",
        token === "USDC" && "bg-usdc/15 text-usdc",
        token === "USDT" && "bg-usdt/15 text-usdt",
        token === "SKR" && "bg-accent/15 text-accent",
        className,
      )}
    >
      {token}
    </span>
  );
}
