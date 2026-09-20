import { createFileRoute } from "@tanstack/react-router";
import { PliApp } from "@/pli/app";

export const Route = createFileRoute("/pli")({ component: PliApp });
