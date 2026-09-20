import { PunchShell } from "@/punch/shell";
import { ConnectB } from "@/skins/b/connect";
import { HomeB } from "@/skins/b/home";

export function PunchB() {
  return <PunchShell connect={<ConnectB />} home={<HomeB />} />;
}
