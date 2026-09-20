import { createFileRoute } from "@tanstack/react-router";
import { StudioScreen } from "@/components/studio-screen";

export const Route = createFileRoute("/apps")({ component: StudioScreen });
