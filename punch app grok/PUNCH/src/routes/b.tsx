import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PunchApp } from "@/punch/app";
import { usePunch } from "@/lib/punch/store";

function Page() {
  const setSkin = usePunch((s) => s.setSkin);
  useEffect(() => {
    setSkin("b");
  }, [setSkin]);
  return <PunchApp />;
}

export const Route = createFileRoute("/b")({ component: Page });
