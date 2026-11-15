// Sound effect backend for Android and web, built on expo-audio.
// iOS uses sfx.ios.js so that no recording-capable audio library ships in the iOS app.
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

const players = {};

export function loadEffects(sources) {
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: "mixWithOthers" }).catch(() => {});
  Object.entries(sources).forEach(([name, source]) => {
    try {
      players[name] = createAudioPlayer(source);
    } catch {
      // A missing sound must never stop the game.
    }
  });
}

export function playEffect(name) {
  const player = players[name];
  if (!player) return;
  try {
    Promise.resolve(player.seekTo(0)).catch(() => {});
    player.play();
  } catch {
    // Ignore playback errors.
  }
}
