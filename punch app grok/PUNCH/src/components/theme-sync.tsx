import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { applyLook } from "@/lib/punch/looks";
import { rehydratePunch, usePunch } from "@/lib/punch/store";

export function ThemeSync() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const theme = usePunch((s) => s.theme);
  const skin = usePunch((s) => s.skin);
  const product = path.startsWith("/pli")
    ? "pli"
    : path === "/a" ||
        path === "/b" ||
        path === "/c" ||
        path.startsWith("/punch") ||
        path === "/looks"
      ? "punch"
      : "studio";

  useEffect(() => {
    rehydratePunch();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-product", product);
    if (product === "pli") {
      document.documentElement.removeAttribute("data-skin");
      document.documentElement.removeAttribute("data-look");
    } else {
      applyLook(skin, theme);
    }
  }, [theme, product, skin]);

  return (
    <Toaster
      theme={product === "pli" ? "light" : theme === "dark" || theme === "gold" ? "dark" : "light"}
      position="top-center"
      toastOptions={{
        className: "bg-surface text-fg shadow-border",
      }}
    />
  );
}