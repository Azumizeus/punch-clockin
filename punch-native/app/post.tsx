import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import { lookTokens } from "../lib/punch/looks";

export default function PostScreen() {
  const t = useT();
  const c = useColors();
  // Publication : inputs et CTA suivent l'habillage (ctaRadius).
  const look = usePunch((st) => st.look);
  const lk = useMemo(() => lookTokens(look), [look]);
  const s = useMemo(() => makeStyles(c, lk), [c, lk]);
  const locale = usePunch((s) => s.locale);
  const postShift = usePunch((s) => s.postShift);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("Paris");
  const [amount, setAmount] = useState("5.00");
  const [token, setToken] = useState<"USDC" | "USDT">("USDC");
  const [minutes, setMinutes] = useState("15");
  const [posting, setPosting] = useState(false);

  async function submit() {
    const amt = Number(amount);
    const mins = Number(minutes);
    if (!title.trim() || !Number.isFinite(amt) || amt < 1) {
      Alert.alert(t.tooShort);
      return;
    }
    setPosting(true);
    try {
      const err = await postShift({
        title: title.trim(),
        city: city.trim() || "On-site",
        amount: amt,
        token,
        minutes: Number.isFinite(mins) ? mins : 15,
      });
      if (err === "bal") {
        Alert.alert(t.notEnough);
        return;
      }
      if (err === "tx") {
        Alert.alert(t.txFailed, usePunch.getState().lastTxError ?? undefined);
        return;
      }
      router.back();
    } finally {
      setPosting(false);
    }
  }

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
        <Text style={s.backText}>← {t.back}</Text>
      </TouchableOpacity>

      <Text style={s.title}>{t.postTitle}</Text>
      <Text style={s.body}>{t.postBody}</Text>

      <Text style={s.label}>{t.title}</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholderTextColor={c.dim} />

      <Text style={s.label}>{t.city}</Text>
      <TextInput style={s.input} value={city} onChangeText={setCity} placeholderTextColor={c.dim} />

      <View style={s.row2}>
        <View style={s.col}>
          <Text style={s.label}>{t.amount}</Text>
          <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={c.dim} />
        </View>
        <View style={s.col}>
          <Text style={s.label}>{t.duration}</Text>
          <TextInput style={s.input} value={minutes} onChangeText={setMinutes} keyboardType="number-pad" placeholderTextColor={c.dim} />
        </View>
      </View>

      <View style={s.tokenRow}>
        {(["USDC", "USDT"] as const).map((tok) => (
          <TouchableOpacity
            key={tok}
            style={[s.tokenBtn, token === tok && s.tokenBtnActive]}
            onPress={() => setToken(tok)}
            activeOpacity={0.8}
          >
            <Text style={[s.tokenBtnTxt, token === tok && s.tokenBtnTxtActive]}>{tok}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.ctaBtn} onPress={submit} activeOpacity={0.8} disabled={posting}>
        {posting ? <ActivityIndicator color={c.accentFg} /> : <Text style={s.ctaTxt}>{t.postCta}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, lk: ReturnType<typeof lookTokens>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 64, paddingHorizontal: 24, paddingBottom: 40 },
    backBtn: { marginBottom: 16 },
    backText: { fontFamily: fonts.body, color: c.dim, fontSize: 14 },
    title: { fontFamily: fonts.display, fontSize: 26, color: c.fg },
    body: { fontFamily: fonts.body, fontSize: 14, color: c.dim2, lineHeight: 20, marginTop: 10, maxWidth: "95%" },
    label: { fontFamily: fonts.mono, fontSize: 11, color: c.dim, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 18, marginBottom: 8 },
    input: { backgroundColor: c.card, borderRadius: lk.ctaRadius, paddingHorizontal: 16, paddingVertical: 14, fontFamily: fonts.body, fontSize: 15, color: c.fg },
    row2: { flexDirection: "row", gap: 12 },
    col: { flex: 1 },
    tokenRow: { flexDirection: "row", gap: 8, marginTop: 18 },
    tokenBtn: { flex: 1, backgroundColor: c.card, borderRadius: lk.ctaRadius, height: 44, alignItems: "center", justifyContent: "center" },
    tokenBtnActive: { backgroundColor: c.accent },
    tokenBtnTxt: { fontFamily: fonts.mono, fontSize: 12, color: c.dim },
    tokenBtnTxtActive: { color: c.accentFg },
    ctaBtn: { backgroundColor: c.accent, borderRadius: lk.ctaRadius, paddingVertical: 16, alignItems: "center", marginTop: 24 },
    ctaTxt: { fontFamily: fonts.bodySemi, fontSize: 16, color: c.accentFg },
  });
}
