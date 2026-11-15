import { PLAYERS } from "./players";

export const TOTAL_ROUNDS = 10;

// "name": see a photo, pick the name. "photo": hear/see a name, pick the photo.
export const MODES = ["name", "photo"];

export const DIFFICULTIES = {
  easy: { options: 2, seconds: 0 },
  medium: { options: 4, seconds: 0 },
  hard: { options: 4, seconds: 10 }
};

// Total stars needed to reach each rank.
export const RANK_THRESHOLDS = [0, 5, 15, 30, 50, 80];

export function shuffle(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Players not yet in the album are favoured so the collection keeps growing,
// but a few known faces stay in every game so it never feels too hard.
export function makeQuestions(collected, difficulty) {
  const optionCount = DIFFICULTIES[difficulty].options;
  const owned = new Set(collected);
  const fresh = shuffle(PLAYERS.filter((p) => !owned.has(p.id)));
  const known = shuffle(PLAYERS.filter((p) => owned.has(p.id)));
  const picked = shuffle([...fresh.slice(0, 6), ...known, ...fresh.slice(6)].slice(0, TOTAL_ROUNDS));

  return picked.map((correct) => {
    const wrong = shuffle(PLAYERS.filter((p) => p.id !== correct.id)).slice(0, optionCount - 1);
    return { correct, options: shuffle([correct, ...wrong]) };
  });
}

export function starsForScore(score) {
  if (score >= TOTAL_ROUNDS) return 3;
  if (score >= 7) return 2;
  if (score >= 4) return 1;
  return 0;
}

export function rankForStars(stars) {
  let index = 0;
  RANK_THRESHOLDS.forEach((threshold, i) => {
    if (stars >= threshold) index = i;
  });
  const next = RANK_THRESHOLDS[index + 1];
  const base = RANK_THRESHOLDS[index];
  return {
    index,
    next: next ?? null,
    progress: next ? (stars - base) / (next - base) : 1
  };
}

export function bestKey(mode, difficulty) {
  return `${mode}-${difficulty}`;
}
