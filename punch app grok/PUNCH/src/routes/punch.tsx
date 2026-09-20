import { createFileRoute } from "@tanstack/react-router";
import { PunchApp } from "@/punch/app";

export const Route = createFileRoute("/punch")({ component: PunchApp });
