import { createFileRoute } from "@tanstack/react-router";
import { LooksScreen } from "@/components/looks-screen";

export const Route = createFileRoute("/looks")({ component: LooksScreen });
