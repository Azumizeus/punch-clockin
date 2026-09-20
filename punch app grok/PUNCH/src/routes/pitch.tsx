import { createFileRoute } from "@tanstack/react-router";
import { PitchScreen } from "@/components/pitch-screen";

export const Route = createFileRoute("/pitch")({ component: PitchScreen });
