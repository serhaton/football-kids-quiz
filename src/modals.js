import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import { AppText, ChunkyButton } from "./components";
import { colors, fontFamily, shadow } from "./theme";
import playerImageSources from "../docs/player_image_sources.json";

const HOLD_MS = 2000;

const IMAGE_CREDIT_ROWS = (playerImageSources?.rows || [])
  .filter((row) => row.status === "ok")
  .map((row) => ({
    player: row.player,
    author: row.author,
    license: row.licenseShortName,
    licenseUrl: row.licenseUrl,
    sourceUrl: row.commonsFilePageUrl
  }));

function Sheet({ children, wide = false }) {
  return <View style={[styles.sheet, wide && styles.sheetWide]}>{children}</View>;
}

// A single native modal hosts every dialog. Swapping its content avoids presenting one
// iOS modal while another is still closing, which can leave the screen frozen.
export function ModalHost({ modal, onClose, children }) {
  const [shown, setShown] = useState(modal);
  useEffect(() => {
    if (modal) setShown(modal);
  }, [modal]);

  return (
    <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        {children(modal ?? shown)}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Choice({ label, active, onPress }) {
  return (
    <ChunkyButton
      fill
      radius={14}
      depth={4}
      color={active ? colors.sun : colors.cardSoft}
      edge={active ? colors.sunEdge : colors.neutralEdge}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      faceStyle={styles.choiceFace}
    >
      <AppText style={styles.choiceText} adjustsFontSizeToFit numberOfLines={1}>
        {label}
      </AppText>
    </ChunkyButton>
  );
}

export function SettingsSheet({ t, store, deviceLanguage, onChange, onOpenCredits, onOpenLink, onClose }) {
  // "idle" -> "confirm" -> "done": resetting the album always takes a second, explicit tap.
  const [resetStep, setResetStep] = useState("idle");
  const deviceLabel = deviceLanguage === "tr" ? t.turkish : t.english;
  const albumEmpty = store.collected.length === 0;

  return (
    <Sheet>
      <AppText style={styles.title}>⚙️ {t.settings}</AppText>

      <AppText style={styles.label}>{t.sound}</AppText>
      <View style={styles.choiceRow}>
        <Choice label={`🔊 ${t.on}`} active={store.soundOn} onPress={() => onChange({ soundOn: true })} />
        <Choice label={`🔇 ${t.off}`} active={!store.soundOn} onPress={() => onChange({ soundOn: false })} />
      </View>

      <AppText style={styles.label}>{t.language}</AppText>
      <View style={styles.choiceRow}>
        <Choice label={t.turkish} active={store.language === "tr"} onPress={() => onChange({ language: "tr" })} />
        <Choice label={t.english} active={store.language === "en"} onPress={() => onChange({ language: "en" })} />
      </View>
      <View style={styles.choiceRowSingle}>
        <Choice
          label={`📱 ${t.useDeviceLanguage} (${deviceLabel})`}
          active={store.language === "system"}
          onPress={() => onChange({ language: "system" })}
        />
      </View>

      <AppText style={styles.label}>
        {t.album} · {store.collected.length}
      </AppText>
      {resetStep === "confirm" ? (
        <View style={styles.resetBox}>
          <AppText style={styles.resetText}>{t.resetAlbumConfirm}</AppText>
          <View style={styles.choiceRow}>
            <ChunkyButton fill radius={14} depth={4} color={colors.cardSoft} edge={colors.neutralEdge} onPress={() => setResetStep("idle")}>
              <AppText style={styles.choiceText}>{t.cancel}</AppText>
            </ChunkyButton>
            <ChunkyButton
              fill
              radius={14}
              depth={4}
              color={colors.bad}
              edge={colors.badEdge}
              onPress={() => {
                onChange({ collected: [] });
                setResetStep("done");
              }}
            >
              <AppText style={[styles.choiceText, styles.onColor]}>{t.resetAlbumYes}</AppText>
            </ChunkyButton>
          </View>
        </View>
      ) : (
        <ChunkyButton
          radius={14}
          depth={4}
          color={colors.cardSoft}
          edge={colors.neutralEdge}
          disabled={albumEmpty}
          dimmed={albumEmpty && resetStep !== "done"}
          onPress={() => setResetStep("confirm")}
          faceStyle={styles.choiceFace}
        >
          <AppText style={[styles.choiceText, styles.resetLabel]}>
            {resetStep === "done" ? t.resetAlbumDone : `🗑️ ${t.resetAlbum}`}
          </AppText>
        </ChunkyButton>
      )}

      <View style={styles.linkRow}>
        <Pressable accessibilityRole="button" style={styles.linkButton} onPress={onOpenCredits}>
          <AppText style={styles.linkButtonText}>{t.imageCredits} ›</AppText>
        </Pressable>
        <Pressable accessibilityRole="link" style={styles.linkButton} onPress={() => onOpenLink(t.privacyUrl)}>
          <AppText style={styles.linkButtonText}>{t.privacyPolicy} ›</AppText>
        </Pressable>
      </View>

      <ChunkyButton onPress={onClose} color={colors.link} edge={colors.bgTop} style={styles.closeButton}>
        <AppText style={styles.closeText}>{t.close}</AppText>
      </ChunkyButton>
    </Sheet>
  );
}

export function CreditsSheet({ t, onOpenLink, onClose }) {
  return (
    <Sheet wide>
      <AppText style={styles.title}>{t.imageCredits}</AppText>
      <AppText style={styles.subtitle}>{t.creditsSubtitle}</AppText>

      <ScrollView style={styles.creditsList}>
        {IMAGE_CREDIT_ROWS.map((item) => (
          <View key={item.player} style={styles.creditItem}>
            <AppText style={styles.creditPlayer}>{item.player}</AppText>
            <AppText style={styles.creditMeta}>
              {t.author}: {item.author || "-"}
            </AppText>
            <AppText style={styles.creditMeta}>
              {t.license}: {item.license || "-"}
            </AppText>
            <View style={styles.creditActions}>
              <Pressable accessibilityRole="link" style={styles.creditLink} onPress={() => onOpenLink(item.sourceUrl)}>
                <AppText style={styles.creditLinkText}>{t.openSource}</AppText>
              </Pressable>
              {item.licenseUrl ? (
                <Pressable accessibilityRole="link" style={styles.creditLink} onPress={() => onOpenLink(item.licenseUrl)}>
                  <AppText style={styles.creditLinkText}>{t.openLicense}</AppText>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>

      <ChunkyButton onPress={onClose} color={colors.link} edge={colors.bgTop} style={styles.closeButton}>
        <AppText style={styles.closeText}>{t.close}</AppText>
      </ChunkyButton>
    </Sheet>
  );
}

function makeChallenge() {
  const a = Math.floor(Math.random() * 6) + 7;
  const b = Math.floor(Math.random() * 6) + 4;
  const c = Math.floor(Math.random() * 8) + 2;
  return { a, b, c, answer: a * b + c };
}

// Two-step gate required before leaving the app: hold for two seconds, then solve a sum.
export function ParentalGateSheet({ t, visible, onPass, onCancel }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [challenge, setChallenge] = useState(makeChallenge);
  const hold = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setUnlocked(false);
    setInput("");
    setError(false);
    setChallenge(makeChallenge());
    hold.setValue(0);
  }, [visible, hold]);

  const startHold = () => {
    if (unlocked) return;
    Animated.timing(hold, { toValue: 1, duration: HOLD_MS, easing: Easing.linear, useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) setUnlocked(true);
      }
    );
  };

  const cancelHold = () => {
    if (unlocked) return;
    hold.stopAnimation();
    hold.setValue(0);
  };

  const submit = () => {
    if (Number(input) === challenge.answer) {
      onPass();
      return;
    }
    setError(true);
    setInput("");
    setChallenge(makeChallenge());
  };

  const canSubmit = unlocked && input.length > 0;

  return (
    <Sheet>
      <AppText style={styles.title}>🔒 {t.parentalGateTitle}</AppText>
      <AppText style={styles.gateText}>{t.parentalGateStepOne}</AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.parentalGateHoldButton}
        onPressIn={startHold}
        onPressOut={cancelHold}
        style={[styles.holdButton, unlocked && styles.holdButtonDone]}
      >
        <Animated.View style={[styles.holdFill, { transform: [{ scaleX: hold }], transformOrigin: "left" }]} />
        <AppText style={styles.holdText}>{unlocked ? t.parentalGateHoldDone : t.parentalGateHoldButton}</AppText>
      </Pressable>

      <AppText style={styles.gateText}>{t.parentalGateStepTwo}</AppText>
      <AppText style={[styles.gateQuestion, !unlocked && styles.gateLocked]}>
        {challenge.a} × {challenge.b} + {challenge.c} = ?
      </AppText>

      <TextInput
        style={[styles.gateInput, !unlocked && styles.gateLocked]}
        value={input}
        onChangeText={(text) => {
          setInput(text.replace(/[^0-9]/g, ""));
          if (error) setError(false);
        }}
        keyboardType="number-pad"
        editable={unlocked}
        placeholder={t.parentalGateInputLabel}
        placeholderTextColor="#8FA3C4"
        maxLength={4}
      />

      {error ? <AppText style={styles.gateError}>{t.parentalGateError}</AppText> : null}

      <View style={styles.gateActions}>
        <ChunkyButton fill onPress={onCancel} color={colors.cardSoft} edge={colors.neutralEdge}>
          <AppText style={styles.cancelText}>{t.parentalGateCancel}</AppText>
        </ChunkyButton>
        <ChunkyButton fill onPress={submit} disabled={!canSubmit} dimmed={!canSubmit}>
          <AppText style={styles.closeText}>{t.parentalGateContinue}</AppText>
        </ChunkyButton>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(6,32,79,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  sheet: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "92%",
    borderRadius: 28,
    backgroundColor: colors.white,
    padding: 18,
    ...shadow
  },
  sheetWide: {
    maxWidth: 560
  },
  title: {
    fontSize: 26,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "700",
    color: colors.inkSoft
  },
  label: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 15,
    color: colors.inkSoft
  },
  choiceRow: {
    flexDirection: "row",
    gap: 8
  },
  choiceRowSingle: {
    marginTop: 8,
    flexDirection: "row"
  },
  choiceFace: {
    paddingVertical: 11,
    paddingHorizontal: 8
  },
  choiceText: {
    fontSize: 16,
    fontWeight: "900"
  },
  resetBox: {
    borderRadius: 14,
    padding: 10,
    backgroundColor: colors.badSoft
  },
  resetText: {
    marginBottom: 10,
    fontSize: 14,
    textAlign: "center"
  },
  resetLabel: {
    color: colors.badEdge
  },
  onColor: {
    color: colors.white
  },
  linkRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around"
  },
  linkButton: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center"
  },
  linkButtonText: {
    fontSize: 15,
    color: colors.link
  },
  closeButton: {
    marginTop: 8
  },
  closeText: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.white
  },
  cancelText: {
    fontSize: 17,
    fontWeight: "900"
  },
  creditsList: {
    flexGrow: 0,
    flexShrink: 1
  },
  creditItem: {
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    backgroundColor: colors.cardSoft
  },
  creditPlayer: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4
  },
  creditMeta: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkSoft,
    marginBottom: 2
  },
  creditActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8
  },
  creditLink: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10
  },
  creditLinkText: {
    fontSize: 13,
    color: colors.link
  },
  gateText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: colors.inkSoft
  },
  holdButton: {
    marginTop: 10,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.cardSoft,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  holdButtonDone: {
    borderColor: colors.good
  },
  holdFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#B9F3CC"
  },
  holdText: {
    fontSize: 16,
    fontWeight: "900"
  },
  gateQuestion: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: "900"
  },
  gateLocked: {
    opacity: 0.35
  },
  gateInput: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 20,
    fontFamily,
    fontWeight: "900",
    color: colors.ink,
    backgroundColor: colors.cardSoft
  },
  gateError: {
    marginTop: 8,
    fontSize: 14,
    color: colors.badEdge
  },
  gateActions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10
  }
});
