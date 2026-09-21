import { PunchShell } from "@/punch/shell";
import { usePunch } from "@/lib/punch/store";
import { ConnectB } from "@/skins/b/connect";
import { HomeB } from "@/skins/b/home";
import { ConnectC } from "@/skins/c/connect";
import { HomeC } from "@/skins/c/home";

export function PunchApp() {
  const skin = usePunch((s) => s.skin);
  const connect = skin === "c" ? <ConnectC /> : <ConnectB />;
  const home = skin === "c" ? <HomeC /> : <HomeB />;
  return <PunchShell connect={connect} home={home} />;
}
