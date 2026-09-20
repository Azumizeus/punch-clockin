import { PunchShell } from "@/punch/shell";
import { ConnectA } from "@/skins/a/connect";
import { HomeA } from "@/skins/a/home";

export function PunchA() {
  return <PunchShell connect={<ConnectA />} home={<HomeA />} />;
}
