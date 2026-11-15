import AsyncStorage from "@react-native-async-storage/async-storage";
import { DIFFICULTIES, MODES } from "./game";
import { PLAYERS } from "./players";

const KEY = "football-kids-quiz/v1";

export const DEFAULT_STORE = {
  language: "system",
  soundOn: true,
  mode: "name",
  difficulty: "medium",
  best: {},
  stars: 0,
  collected: []
};

// Everything read from disk is checked, so a damaged or outdated save can never crash the game.
function sanitize(raw) {
  const data = raw && typeof raw === "object" ? raw : {};
  const playerIds = new Set(PLAYERS.map((p) => p.id));
  const best = {};
  if (data.best && typeof data.best === "object") {
    Object.entries(data.best).forEach(([key, value]) => {
      if (Number.isFinite(value)) best[key] = value;
    });
  }
  return {
    language: ["system", "en", "tr"].includes(data.language) ? data.language : DEFAULT_STORE.language,
    soundOn: typeof data.soundOn === "boolean" ? data.soundOn : DEFAULT_STORE.soundOn,
    mode: MODES.includes(data.mode) ? data.mode : DEFAULT_STORE.mode,
    difficulty: DIFFICULTIES[data.difficulty] ? data.difficulty : DEFAULT_STORE.difficulty,
    best,
    stars: Number.isFinite(data.stars) && data.stars > 0 ? Math.floor(data.stars) : 0,
    collected: Array.isArray(data.collected) ? data.collected.filter((id) => playerIds.has(id)) : []
  };
}

export async function loadStore() {
  try {
    const text = await AsyncStorage.getItem(KEY);
    return sanitize(text ? JSON.parse(text) : null);
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveStore(store) {
  AsyncStorage.setItem(KEY, JSON.stringify(store)).catch(() => {});
}
