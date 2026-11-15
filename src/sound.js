import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { loadEffects, playEffect } from "./sfx";

const SOURCES = {
  tap: require("../assets/sounds/tap.wav"),
  correct: require("../assets/sounds/correct.wav"),
  wrong: require("../assets/sounds/wrong.wav"),
  star: require("../assets/sounds/star.wav"),
  win: require("../assets/sounds/win.wav")
};

let loaded = false;
let enabled = true;

export function initSounds() {
  if (loaded) return;
  loaded = true;
  loadEffects(SOURCES);
}

export function setSoundEnabled(value) {
  enabled = value;
  if (!value) Speech.stop();
}

export function playSound(name) {
  if (enabled) playEffect(name);
}

export function tapHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function resultHaptic(success) {
  Haptics.notificationAsync(
    success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
  ).catch(() => {});
}

export function speakName(player) {
  Speech.stop();
  Speech.speak(player.name, { language: player.voice, rate: 0.8, pitch: 1.05 });
}

export function stopSpeech() {
  Speech.stop();
}
