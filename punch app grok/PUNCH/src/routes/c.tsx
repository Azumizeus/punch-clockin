import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PunchApp } from "@/punch/app";
import { usePunch } from "@/lib/punch/store";

function Page() {
  const setSkin = usePunch((s) => s.setSkin);
  useEffect(() => {
    setSkin("c");
  }, [setSkin]);
  return <PunchApp />;
}

export const Route = createFileRoute("/c")({ component: Page });
