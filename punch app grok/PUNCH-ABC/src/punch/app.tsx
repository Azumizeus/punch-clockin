import { ConnectScreen } from "@/punch/connect-screen";
import { PunchScreen } from "@/punch/punch-screen";
import { PunchShell } from "@/punch/shell";

export function PunchApp() {
  return <PunchShell connect={<ConnectScreen />} home={<PunchScreen />} />;
}
