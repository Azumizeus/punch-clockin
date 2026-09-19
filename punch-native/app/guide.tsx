import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";

const appIcon = require("../assets/images/icon.png");
const LAST = 7;

export default function GuideScreen() {
  const t = useT();
  const c = useColors();
  const s = useMemoStyles(c);
  const router = useRouter();
  const locale = usePunch((st) => st.locale);
  const setLocale = usePunch((st) => st.setLocale);
  const [step, setStep] = useState(0);
  const [punched, setPunched] = useState(false);
  const [cut, setCut] = useState<string | null>(null);
  const [stamped, setStamped] = useState(false);
  const [hi, setHi] = useState(false);
  const [sealed, setSealed] = useState(false);

  function next() {
    setStep((v) => Math.min(LAST, v + 1));
  }
  function back() {
    setStep((v) => Math.max(0, v - 1));
  }
  function finish() {
    router.replace("/");
  }

  const nextDisabled =
    (step === 1 && !punched) || (step === 3 && !cut) || (step === 4 && !stamped) || (step === 6 && !hi) || (step === 7 && !sealed);

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={s.stepCount}>
          {step + 1} / {LAST + 1}
        </Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.langBtn} onPress={() => setLocale(locale === "fr" ? "en" : "fr")}>
            <Text style={s.langBtnTxt}>{locale === "fr" ? "EN" : "FR"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.skipBtn} onPress={finish}>
            <Text style={s.skipTxt}>{t.guideSkip}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.dots}>
        {Array.from({ length: LAST + 1 }).map((_, n) => (
          <TouchableOpacity
            key={n}
            style={[s.dot, n <= step && { backgroundColor: c.accent }]}
            onPress={() => setStep(n)}
          />
        ))}
      </View>

      <View style={s.main}>
        {step === 0 && <StepHero t={t} s={s} onGo={next} />}
        {step === 1 && <StepPunch t={t} s={s} c={c} punched={punched} onPunch={() => setPunched(true)} />}
        {step === 2 && <StepTicket t={t} s={s} c={c} />}
        {step === 3 && <StepCut t={t} s={s} c={c} cut={cut} onCut={setCut} />}
        {step === 4 && <StepGlobe t={t} s={s} c={c} stamped={stamped} onStamp={() => setStamped(true)} />}
        {step === 5 && <StepJob t={t} s={s} c={c} />}
        {step === 6 && <StepHi t={t} s={s} c={c} hi={hi} onHi={() => setHi(true)} />}
        {step === 7 && <StepPli t={t} s={s} c={c} sealed={sealed} onSeal={() => setSealed(true)} />}
      </View>

      <View style={s.footer}>
        {step === 0 ? (
          <TouchableOpacity style={[s.btn, s.btnFull]} onPress={next} activeOpacity={0.8}>
            <Text style={s.btnTxt}>{t.guideStart}</Text>
          </TouchableOpacity>
        ) : step === LAST ? (
          <TouchableOpacity style={[s.btn, s.btnFull]} onPress={finish} activeOpacity={0.8}>
            <Text style={s.btnTxt}>{t.punchEnter}</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.footerRow}>
            <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={back} activeOpacity={0.8}>
              <Text style={[s.btnTxt, s.btnTxtSecondary]}>{t.guideBack}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, nextDisabled && s.btnDisabled]}
              onPress={next}
              disabled={nextDisabled}
              activeOpacity={0.8}
            >
              <Text style={s.btnTxt}>{t.guideNext}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function StepHero({ t, s, onGo }: any) {
  return (
    <TouchableOpacity style={s.centerCol} onPress={onGo} activeOpacity={0.8}>
      <Image source={appIcon} style={s.heroIcon} />
      <Text style={s.h1}>{t.g1t}</Text>
      <Text style={s.pBig}>{t.g1b}</Text>
    </TouchableOpacity>
  );
}

function StepPunch({ t, s, c, punched, onPunch }: any) {
  return (
    <View style={s.centerCol}>
      <Text style={s.h2}>{t.g2t}</Text>
      <Text style={s.p}>{t.g2b}</Text>
      <TouchableOpacity
        style={[s.guideDial, { backgroundColor: punched ? c.input : c.accent }]}
        onPress={onPunch}
        activeOpacity={0.85}
      >
        <Image source={appIcon} style={s.guideDialIcon} />
      </TouchableOpacity>
      <Text style={s.h3}>{punched ? t.punched : t.g2go}</Text>
    </View>
  );
}

function StepTicket({ t, s, c }: any) {
  return (
    <View style={s.colStart}>
      <Text style={s.h2}>{t.g3t}</Text>
      <Text style={s.p}>{t.g3b}</Text>
      <View style={[s.ticket, { backgroundColor: c.paper }]}>
        <View style={s.ticketHead}>
          <Text style={[s.ticketApp, { color: c.paperMuted }]}>{t.app}</Text>
          <Image source={appIcon} style={s.ticketIcon} />
        </View>
        <Text style={[s.ticketIn, { color: c.paperFg }]}>{t.ticketIn}</Text>
        <Text style={[s.ticketPlace, { color: c.paperFg }]}>France</Text>
        <Text style={[s.ticketRule, { color: c.paperFg }]}>{t.ticketRule}</Text>
      </View>
    </View>
  );
}

function StepCut({ t, s, c, cut, onCut }: any) {
  const label = cut === "92" ? t.g4w : cut === "3" ? t.g4s : cut === "5" ? t.g4p : t.g4b;
  return (
    <View style={s.colStart}>
      <Text style={s.h2}>{t.g4t}</Text>
      <Text style={s.p}>{label}</Text>
      <View style={s.cutRow}>
        {[
          ["92", t.worker],
          ["3", t.stakers],
          ["5", t.protocol],
        ].map(([n, k]) => (
          <TouchableOpacity
            key={n}
            style={[s.cutBtn, { backgroundColor: cut === n ? c.accent : c.card }]}
            onPress={() => onCut(n)}
            activeOpacity={0.85}
          >
            <Text style={[s.cutPct, { color: cut === n ? c.accentFg : c.fg }]}>{n}%</Text>
            <Text style={[s.cutLabel, { color: cut === n ? c.accentFg : c.dim }]}>{k}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StepGlobe({ t, s, c, stamped, onStamp }: any) {
  return (
    <View style={s.centerCol}>
      <Text style={s.h2}>{t.g5t}</Text>
      <Text style={s.pBig}>{t.g5b}</Text>
      <TouchableOpacity
        style={[s.globeDial, { backgroundColor: c.card }]}
        onPress={onStamp}
        activeOpacity={0.85}
      >
        <View style={[s.globeRing, { borderColor: c.borderLight }]} />
        <View style={[s.globeDot, { backgroundColor: stamped ? c.accent : c.dim2 }]} />
        <Text style={[s.globeCode, { color: c.dim }]}>{stamped ? "FR" : "···"}</Text>
      </TouchableOpacity>
      <Text style={s.h3}>{stamped ? t.globeYou : t.g5go}</Text>
    </View>
  );
}

function StepJob({ t, s, c }: any) {
  return (
    <View style={s.colStart}>
      <Text style={s.h2}>{t.g6t}</Text>
      <Text style={s.p}>{t.g6b}</Text>
      <View style={[s.jobCard, { backgroundColor: c.card }]}>
        <Text style={[s.jobTag, { color: c.dim }]}>NEXUS</Text>
        <Text style={[s.jobTitle, { color: c.fg }]}>{t.needPunch}</Text>
        <Text style={[s.jobAmt, { color: c.fg }]}>2.50 USDC</Text>
        <Text style={[s.jobRule, { color: c.dim2 }]}>92 / 3 / 5</Text>
      </View>
    </View>
  );
}

function StepHi({ t, s, c, hi, onHi }: any) {
  return (
    <View style={s.colStart}>
      <Text style={s.h2}>{t.g7t}</Text>
      <Text style={s.p}>{t.g7b}</Text>
      <View style={[s.hiRow, { backgroundColor: c.card }]}>
        <View>
          <Text style={[s.hiName, { color: c.fg }]}>Léa</Text>
          <Text style={[s.hiMeta, { color: c.dim }]}>12 {t.meters}</Text>
        </View>
        <TouchableOpacity
          style={[s.hiBtn, { backgroundColor: hi ? c.input : c.accent }]}
          onPress={onHi}
          disabled={hi}
          activeOpacity={0.85}
        >
          <Text style={[s.hiBtnTxt, { color: hi ? c.dim : c.accentFg }]}>{hi ? t.greeted : t.g7go}</Text>
        </TouchableOpacity>
      </View>
      {hi && <Text style={[s.hiNote, { color: c.dim2 }]}>+ 0.10 USDC · {t.g4p}</Text>}
    </View>
  );
}

// Étape 8 (portage du guide web) : l'enveloppe PLI se scelle au toucher —
// cire "PL" qui passe à "OK", comme sur l'export. Obligatoire pour finir.
function StepPli({ t, s, c, sealed, onSeal }: any) {
  return (
    <View style={s.colStart}>
      <Text style={s.h2}>{t.g8t}</Text>
      <Text style={s.p}>{t.g8b}</Text>
      <TouchableOpacity
        style={[s.envelope, { backgroundColor: c.input }]}
        onPress={onSeal}
        disabled={sealed}
        activeOpacity={0.85}
      >
        <View style={[s.envFlap, { backgroundColor: c.card }]} />
        <View style={s.envBody}>
          <View style={s.envHead}>
            <Text style={[s.envFrom, { color: c.dim }]}>Nexus</Text>
            <View style={[s.wax, { backgroundColor: c.accent }]}>
              <Text style={[s.waxTxt, { color: c.accentFg }]}>{sealed ? "OK" : "PL"}</Text>
            </View>
          </View>
          <Text style={[s.envTitle, { color: c.fg }]}>{sealed ? t.pliLetter : t.g8go}</Text>
        </View>
      </TouchableOpacity>
      <Text style={s.pliDone}>{t.guideDone}</Text>
    </View>
  );
}

function useMemoStyles(c: ReturnType<typeof useColors>) {
  return makeStyles(c);
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg, paddingTop: 54 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16 },
    stepCount: { fontFamily: fonts.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: c.dim },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
    langBtn: { paddingHorizontal: 10, height: 36, alignItems: "center", justifyContent: "center" },
    langBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 12, color: c.dim },
    skipBtn: { paddingHorizontal: 8, height: 36, alignItems: "center", justifyContent: "center" },
    skipTxt: { fontFamily: fonts.body, fontSize: 13, color: c.dim },
    dots: { flexDirection: "row", gap: 4, paddingHorizontal: 20, paddingTop: 8 },
    dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: c.borderLight },
    main: { flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
    centerCol: { flex: 1, alignItems: "center", justifyContent: "center" },
    colStart: { flex: 1 },
    heroIcon: { width: 40, height: 40, borderRadius: 8, marginBottom: 32 },
    h1: { fontFamily: fonts.display, fontSize: 40, color: c.fg, textAlign: "center", letterSpacing: -0.5 },
    h2: { fontFamily: fonts.display, fontSize: 26, color: c.fg, textAlign: "center" },
    h3: { fontFamily: fonts.display, fontSize: 19, color: c.fg, marginTop: 18, textAlign: "center" },
    p: { fontFamily: fonts.body, fontSize: 14, color: c.dim2, lineHeight: 20, marginTop: 8, textAlign: "center" },
    pBig: { fontFamily: fonts.body, fontSize: 15, color: c.dim2, lineHeight: 21, marginTop: 14, textAlign: "center", maxWidth: 280 },
    guideDial: { width: 168, height: 168, borderRadius: 84, alignItems: "center", justifyContent: "center", marginTop: 36 },
    guideDialIcon: { width: 44, height: 44, borderRadius: 10 },
    ticket: { borderRadius: 6, paddingHorizontal: 18, paddingVertical: 22, marginTop: 20 },
    ticketHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    ticketApp: { fontFamily: fonts.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 2 },
    ticketIcon: { width: 18, height: 18, borderRadius: 4 },
    ticketIn: { fontFamily: fonts.display, fontSize: 48, marginTop: 16 },
    ticketPlace: { fontFamily: fonts.display, fontSize: 22, marginTop: 6 },
    ticketRule: { fontFamily: fonts.mono, fontSize: 12, marginTop: 20 },
    cutRow: { flexDirection: "row", gap: 8, marginTop: 28 },
    cutBtn: { flex: 1, borderRadius: 14, paddingVertical: 22, alignItems: "center" },
    cutPct: { fontFamily: fonts.display, fontSize: 26 },
    cutLabel: { fontFamily: fonts.body, fontSize: 11, marginTop: 6, textAlign: "center", lineHeight: 14 },
    globeDial: { width: 176, height: 176, borderRadius: 88, alignItems: "center", justifyContent: "center", marginTop: 28 },
    globeRing: { position: "absolute", width: 148, height: 148, borderRadius: 74, borderWidth: 1 },
    globeDot: { position: "absolute", width: 10, height: 10, borderRadius: 5, transform: [{ translateX: 24 }, { translateY: -16 }] },
    globeCode: { fontFamily: fonts.mono, fontSize: 12 },
    jobCard: { borderRadius: 16, padding: 16, marginTop: 20 },
    jobTag: { fontFamily: fonts.mono, fontSize: 11 },
    jobTitle: { fontFamily: fonts.display, fontSize: 20, marginTop: 4 },
    jobAmt: { fontFamily: fonts.display, fontSize: 26, marginTop: 14 },
    jobRule: { fontFamily: fonts.mono, fontSize: 11, marginTop: 6 },
    hiRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, marginTop: 20 },
    hiName: { fontFamily: fonts.bodySemi, fontSize: 15 },
    hiMeta: { fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
    hiBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    hiBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 13 },
    hiNote: { fontFamily: fonts.body, fontSize: 14, marginTop: 14 },
    envelope: { borderRadius: 6, overflow: "hidden", marginTop: 20 },
    envFlap: { height: 10 },
    envBody: { padding: 16 },
    envHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    envFrom: { fontFamily: fonts.body, fontSize: 13 },
    wax: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    waxTxt: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5 },
    envTitle: { fontFamily: fonts.display, fontSize: 22, marginTop: 10 },
    pliDone: { fontFamily: fonts.display, fontSize: 19, color: c.fg, textAlign: "center", marginTop: 36 },
    footer: { flexDirection: "row", paddingHorizontal: 20, paddingBottom: 24 },
    footerRow: { flexDirection: "row", gap: 8, width: "100%" },
    btn: { flex: 1, backgroundColor: c.accent, borderRadius: 12, paddingVertical: 15, alignItems: "center" },
    btnFull: { width: "100%" },
    btnSecondary: { backgroundColor: c.card },
    btnDisabled: { opacity: 0.4 },
    btnTxt: { fontFamily: fonts.bodySemi, fontSize: 15, color: c.accentFg },
    btnTxtSecondary: { color: c.fg },
  });
}
