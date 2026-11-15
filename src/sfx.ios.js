// Sound effect backend for iOS, built on the local playback-only KidsSound module
// (modules/kids-sound). It has no microphone or recording code at all.
import { requireOptionalNativeModule } from "expo";
import { Asset } from "expo-asset";

const native = requireOptionalNativeModule("KidsSound");

export function loadEffects(sources) {
  if (!native) return;
  Object.entries(sources).forEach(async ([name, source]) => {
    try {
      const asset = Asset.fromModule(source);
      await asset.downloadAsync();
      await native.load(name, asset.localUri ?? asset.uri);
    } catch {
      // A missing sound must never stop the game.
    }
  });
}

export function playEffect(name) {
  native?.play(name).catch(() => {});
}
