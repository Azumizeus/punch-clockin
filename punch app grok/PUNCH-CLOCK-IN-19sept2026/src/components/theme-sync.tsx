import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { rehydratePunch, usePunch } from "@/lib/punch/store";

export function ThemeSync() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const theme = usePunch((s) => s.theme) === "light" ? "light" : "dark";
  const product = path.startsWith("/pli") ? "pli" : path.startsWith("/punch") ? "punch" : "studio";

  useEffect(() => {
    rehydratePunch();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-product", product);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const color = product === "pli" ? "#e6d3b8" : theme === "light" ? "#efece6" : "#0c0c0d";
      meta.setAttribute("content", color);
    }
  }, [theme, product]);

  return (
    <Toaster
      theme={product === "pli" ? "light" : theme}
      position="top-center"
      toastOptions={{
        className: "bg-surface text-fg shadow-border",
      }}
    />
  );
}
