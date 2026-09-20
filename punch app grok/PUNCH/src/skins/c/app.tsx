import { PunchShell } from "@/punch/shell";
import { ConnectC } from "@/skins/c/connect";
import { HomeC } from "@/skins/c/home";

export function PunchC() {
  return <PunchShell connect={<ConnectC />} home={<HomeC />} />;
}
