import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import { lookTokens } from "../lib/punch/looks";
import { tokenColors } from "../lib/punch/theme";
import { formatAmt, splitOf } from "../lib/punch/format";

export default function ShiftScreen() {
  const t = useT();
  const c = useColors();
  // L'habillage pilote aussi les rayons de CET écran (15e règle du portage :
  // CTA / inputs / chips suivent ctaRadius, comme --cta-radius côté web).
  const look = usePunch((st) => st.look);
  const lk = useMemo(() => lookTokens(look), [look]);
  const s = useMemo(() => makeStyles(c, lk), [c, lk]);
  const locale = usePunch((s) => s.locale);
  const activeShiftId = usePunch((s) => s.activeShiftId);
  const shifts = usePunch((s) => s.shifts);
  const cashShift = usePunch((s) => s.cashShift);
  const fillPosted = usePunch((s) => s.fillPosted);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signing, setSigning] = useState(false);

  const shift = shifts.find((x) => x.id === activeShiftId);

  if (!shift) {
    return (
      <View style={s.wrap}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>{t.back}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = shift.title[locale] ?? shift.title.en;
  const parts = splitOf(shift.payout);

  async function finish() {
    setSigning(true);
    usePunch.setState({ lastTxError: null });
    try {
      const rec = await cashShift(shift.id, title);
      if (!rec) {
        Alert.alert(t.txFailed, usePunch.getState().lastTxError ?? undefined);
        return;
      }
      router.push("/receipt");
    } finally {
      setSigning(false);
    }
  }

  function handleFillPosted() {
    fillPosted(shift.id);
    router.back();
  }

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
        <Text style={s.backText}>← {t.back}</Text>
      </TouchableOpacity>

      <Text style={s.sponsor}>{shift.sponsor} · {shift.city[locale]}</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.blurb}>{shift.blurb[locale]}</Text>

      <View style={s.metaRow}>
        <View style={[s.tokenChip, { backgroundColor: tokenColors[shift.token] + "26" }]}>
          <Text style={[s.tokenChipTxt, { color: tokenColors[shift.token] }]}>{shift.token}</Text>
        </View>
        <Text style={s.metaTxt}>
          {formatAmt(shift.payout, shift.token)} {shift.token} · {shift.durationMin} {t.min}
        </Text>
      </View>

      <View style={s.splitCard}>
        <SplitLine s={s} k={t.worker} v={`${formatAmt(parts.worker, shift.token)} · 92%`} />
        <SplitLine s={s} k={t.stakers} v={`${formatAmt(parts.stakers, shift.token)} · 3%`} />
        <SplitLine s={s} k={t.protocol} v={`${formatAmt(parts.protocol, shift.token)} · 5%`} last />
      </View>

      {shift.userPosted && shift.taken === 0 ? (
        <View style={s.section}>
          <Text style={s.hint}>{t.fill}</Text>
          <TouchableOpacity style={s.ctaBtn} onPress={handleFillPosted} activeOpacity={0.8}>
            <Text style={s.ctaText}>{t.fillCta}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.section}>
          {(shift.kind === "dwell" || shift.kind === "watch") && (
            <HoldTask
              s={s}
              c={c}
              seconds={12}
              holdLabel={shift.kind === "watch" ? t.watchHold : t.dwellHold}
              startLabel={shift.kind === "watch" ? t.watchCta : t.dwellCta}
              onDone={() => setReady(true)}
            />
          )}
          {shift.kind === "review" && (
            <ReviewTask s={s} c={c} label={t.reviewLabel} hint={t.reviewHint} cta={t.reviewCta} onDone={() => setReady(true)} />
          )}
          {shift.kind === "scan" && (
            <ScanTask s={s} labels={[t.scanStep1, t.scanStep2, t.scanStep3]} cta={t.scanCta} onDone={() => setReady(true)} />
          )}
          {shift.kind === "swap" && (
            <PulseSwapTask s={s} spread={t.spread} spreadSplit={t.spreadSplit} cta={t.swapCta} onDone={() => setReady(true)} />
          )}

          <TouchableOpacity
            style={[s.ctaBtn, (!ready || signing) && s.ctaDisabled]}
            disabled={!ready || signing}
            onPress={finish}
            activeOpacity={0.8}
          >
            <Text style={s.ctaText}>{signing ? t.signing : t.complete}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function SplitLine({ s, k, v, last }: { s: ReturnType<typeof makeStyles>; k: string; v: string; last?: boolean }) {
  return (
    <View style={[s.splitLine, last && s.splitLineLast]}>
      <Text style={s.splitK}>{k}</Text>
      <Text style={s.splitV}>{v}</Text>
    </View>
  );
}

function HoldTask({
  s, c, seconds, holdLabel, startLabel, onDone,
}: {
  s: ReturnType<typeof makeStyles>; c: ReturnType<typeof useColors>;
  seconds: number; holdLabel: string; startLabel: string; onDone: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(seconds);
  const done = useRef(false);

  useEffect(() => {
    if (!running || done.current) return;
    if (left <= 0) {
      done.current = true;
      onDone();
      return;
    }
    const id = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left]);

  if (!running) {
    return (
      <TouchableOpacity style={s.secondaryBtn} onPress={() => setRunning(true)} activeOpacity={0.8}>
        <Text style={s.secondaryBtnTxt}>{startLabel}</Text>
      </TouchableOpacity>
    );
  }

  const p = 1 - left / seconds;
  return (
    <View style={s.holdCard}>
      <Text style={s.holdLabel}>{holdLabel}</Text>
      <Text style={s.holdCount}>{Math.max(0, left)}</Text>
      <View style={s.holdTrack}>
        <View style={[s.holdFill, { width: `${Math.min(100, p * 100)}%`, backgroundColor: c.accent }]} />
      </View>
      <Text style={s.holdSub}>demo · 12s = shift clock</Text>
    </View>
  );
}

function ReviewTask({ s, c, label, hint, cta, onDone }: {
  s: ReturnType<typeof makeStyles>; c: ReturnType<typeof useColors>;
  label: string; hint: string; cta: string; onDone: () => void;
}) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ok = text.trim().length >= 40;
  return (
    <View>
      <Text style={s.taskLabel}>{label}</Text>
      <TextInput
        style={s.textInput}
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={5}
        placeholderTextColor={c.dim}
      />
      <Text style={s.holdSub}>{text.trim().length}/40 · {hint}</Text>
      <TouchableOpacity
        style={[s.secondaryBtn, (!ok || submitted) && s.ctaDisabled]}
        disabled={!ok || submitted}
        onPress={() => { setSubmitted(true); onDone(); }}
        activeOpacity={0.8}
      >
        <Text style={s.secondaryBtnTxt}>{cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ScanTask({ s, labels, cta, onDone }: { s: ReturnType<typeof makeStyles>; labels: string[]; cta: string; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (step === 0 || step >= 3) return;
    const id = setTimeout(() => setStep((n) => n + 1), 700);
    return () => clearTimeout(id);
  }, [step]);

  useEffect(() => {
    if (step === 3 && !done.current) {
      done.current = true;
      onDone();
    }
  }, [step]);

  return (
    <TouchableOpacity style={s.scanBox} onPress={() => step === 0 && setStep(1)} activeOpacity={0.8}>
      <View style={s.scanFrame}>
        <Text style={s.scanFrameTxt}>{labels[Math.min(step, 2)]}</Text>
      </View>
      {step === 0 && <Text style={s.scanText}>{cta}</Text>}
    </TouchableOpacity>
  );
}

function PulseSwapTask({ s, spread, spreadSplit, cta, onDone }: {
  s: ReturnType<typeof makeStyles>; spread: string; spreadSplit: string; cta: string; onDone: () => void;
}) {
  const [done, setDone] = useState(false);
  return (
    <View style={s.swapCard}>
      <Text style={s.taskLabel}>SKR → USDC</Text>
      <Text style={s.swapAmount}>24 SKR → 0.43 USDC</Text>
      <Text style={s.holdSub}>{spread} · {spreadSplit}</Text>
      <TouchableOpacity
        style={[s.secondaryBtn, done && s.ctaDisabled]}
        disabled={done}
        onPress={() => { setDone(true); onDone(); }}
        activeOpacity={0.8}
      >
        <Text style={s.secondaryBtnTxt}>{cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, lk: ReturnType<typeof lookTokens>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 64, paddingBottom: 40, paddingHorizontal: 24 },
    backBtn: { marginBottom: 16 },
    backText: { fontFamily: fonts.body, color: c.dim, fontSize: 14 },
    sponsor: { fontFamily: fonts.mono, fontSize: 11, color: c.dim, textTransform: "uppercase", letterSpacing: 1 },
    title: { fontFamily: fonts.display, fontSize: 26, color: c.fg, marginTop: 6, lineHeight: 30 },
    blurb: { fontFamily: fonts.body, fontSize: 14, color: c.dim2, lineHeight: 20, marginTop: 10 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
    tokenChip: { backgroundColor: c.card, borderRadius: lk.ctaRadius, paddingHorizontal: 10, paddingVertical: 4 },
    tokenChipTxt: { fontFamily: lk.ticketMono ? fonts.mono : fonts.bodySemi, fontSize: 11, color: c.dim2 },
    metaTxt: { fontFamily: fonts.mono, fontSize: 13, color: c.fg },
    splitCard: { backgroundColor: c.card, borderRadius: 16, padding: 14, marginTop: 16 },
    splitLine: {
      flexDirection: "row", justifyContent: "space-between", paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.borderLight,
    },
    splitLineLast: { borderBottomWidth: 0 },
    splitK: { fontFamily: fonts.mono, fontSize: 12, color: c.dim },
    splitV: { fontFamily: fonts.mono, fontSize: 12, color: c.fg },
    section: { marginTop: 24 },
    hint: { fontFamily: fonts.body, fontSize: 14, color: c.dim2, marginBottom: 12 },
    taskLabel: { fontFamily: fonts.mono, fontSize: 11, color: c.dim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
    textInput: {
      backgroundColor: c.card, borderRadius: lk.ctaRadius, padding: 14, color: c.fg,
      fontFamily: fonts.body, fontSize: 14, minHeight: 110, textAlignVertical: "top",
    },
    scanBox: { alignItems: "center", backgroundColor: c.card, borderRadius: 24, paddingVertical: 40 },
    scanFrame: { width: 112, height: 112, borderRadius: 12, borderWidth: 1, borderColor: c.border, alignItems: "center", justifyContent: "center" },
    scanFrameTxt: { fontFamily: fonts.mono, fontSize: 11, color: c.dim },
    scanText: { fontFamily: fonts.body, fontSize: 14, color: c.dim2, marginTop: 16 },
    swapCard: { backgroundColor: c.card, borderRadius: 16, padding: 16 },
    swapAmount: { fontFamily: fonts.display, fontSize: 22, color: c.fg, marginTop: 6 },
    holdCard: { backgroundColor: c.card, borderRadius: 16, padding: 20, alignItems: "center" },
    holdLabel: { fontFamily: fonts.mono, fontSize: 11, color: c.dim, textTransform: "uppercase" },
    holdCount: { fontFamily: fonts.display, fontSize: 44, color: c.fg, marginTop: 10 },
    holdTrack: { width: "100%", height: 4, borderRadius: 2, backgroundColor: c.input, marginTop: 16, overflow: "hidden" },
    holdFill: { height: 4, borderRadius: 2 },
    holdSub: { fontFamily: fonts.mono, fontSize: 10, color: c.dim, marginTop: 10 },
    secondaryBtn: { backgroundColor: c.card, borderRadius: lk.ctaRadius, paddingVertical: 14, alignItems: "center" },
    secondaryBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 15, color: c.fg },
    ctaBtn: { backgroundColor: c.accent, borderRadius: lk.ctaRadius, paddingVertical: 15, alignItems: "center", marginTop: 14 },
    ctaText: { fontFamily: fonts.bodySemi, fontSize: 16, color: c.accentFg },
    ctaDisabled: { opacity: 0.4 },
  });
}
