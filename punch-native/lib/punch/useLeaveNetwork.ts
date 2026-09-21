import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { PublicKey } from "@solana/web3.js";
import { activeConnection } from "../solana/rpc";
import { usePunch, useT } from "./store";
import { sendPunchMemo } from "../solana/wallet";

/**
 * Flux partagé "Quitter le réseau" — utilisé par le bouton de Réglages
 * ET par le bouton de l'écran Split, pour qu'il n'y ait qu'un seul vrai
 * chemin de sortie (transaction signée obligatoire, jamais de faux reset).
 */
export function useLeaveNetwork() {
  const t = useT();
  const router = useRouter();
  const wallet = usePunch((s) => s.wallet);
  const leaveNetwork = usePunch((s) => s.leaveNetwork);
  const [leaving, setLeaving] = useState(false);

  async function doLeave() {
    setLeaving(true);
    try {
      if (wallet.real && wallet.authToken) {
        // Vraie transaction signée sur devnet : preuve on-chain que ce
        // Seeker quitte le réseau. Sans ça, pas de reset — pas de faux chiffres.
        const conn = activeConnection();
        const pubkey = new PublicKey(wallet.address);
        await sendPunchMemo(conn, wallet.authToken, pubkey, `PUNCH LEAVE ${Date.now()}`);
      }
      leaveNetwork();
      router.replace("/");
    } catch {
      Alert.alert(t.leaveNetwork, t.leaveNetworkFailed);
    } finally {
      setLeaving(false);
    }
  }

  function confirmLeave() {
    Alert.alert(t.leaveNetworkConfirm, undefined, [
      { text: t.cancel, style: "cancel" },
      { text: t.confirm, style: "destructive", onPress: doLeave },
    ]);
  }

  return { leaving, confirmLeave, walletReal: wallet.real };
}
