import { PunchShell } from "@/punch/shell";
import { usePunch } from "@/lib/punch/store";
import { ConnectA } from "@/skins/a/connect";
import { HomeA } from "@/skins/a/home";
import { ConnectB } from "@/skins/b/connect";
import { HomeB } from "@/skins/b/home";
import { ConnectC } from "@/skins/c/connect";
import { HomeC } from "@/skins/c/home";

export function PunchApp() {
  const skin = usePunch((s) => s.skin);
  const connect = skin === "b" ? <ConnectB /> : skin === "c" ? <ConnectC /> : <ConnectA />;
  const home = skin === "b" ? <HomeB /> : skin === "c" ? <HomeC /> : <HomeA />;
  return <PunchShell connect={connect} home={home} />;
}
