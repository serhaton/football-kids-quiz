// Synthesizes the game's sound effects into assets/sounds as 16-bit mono WAV files.
// Run: node scripts/generate_sounds.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RATE = 44100;
const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "assets", "sounds");

// A bell-like note: fundamental plus soft overtones, quick attack, exponential decay.
function note(buffer, { freq, start, duration, gain = 0.5, decay = 6, overtones = [1, 0.35, 0.12] }) {
  const from = Math.floor(start * RATE);
  const count = Math.floor(duration * RATE);
  for (let i = 0; i < count && from + i < buffer.length; i += 1) {
    const t = i / RATE;
    const attack = Math.min(1, t / 0.006);
    const release = Math.min(1, (duration - t) / 0.02);
    const envelope = attack * release * Math.exp(-decay * t);
    let sample = 0;
    overtones.forEach((level, index) => {
      sample += level * Math.sin(2 * Math.PI * freq * (index + 1) * t);
    });
    buffer[from + i] += gain * envelope * sample;
  }
}

function render(seconds, notes) {
  const buffer = new Float32Array(Math.ceil(seconds * RATE));
  notes.forEach((n) => note(buffer, n));
  return buffer;
}

function writeWav(name, buffer) {
  const peak = buffer.reduce((max, v) => Math.max(max, Math.abs(v)), 0) || 1;
  const scale = Math.min(1, 0.85 / peak);
  const data = Buffer.alloc(44 + buffer.length * 2);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + buffer.length * 2, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(RATE, 24);
  data.writeUInt32LE(RATE * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(buffer.length * 2, 40);
  buffer.forEach((v, i) => data.writeInt16LE(Math.round(v * scale * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(outDir, name), data);
}

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const E6 = 1318.5;
const G6 = 1567.98;

fs.mkdirSync(outDir, { recursive: true });

writeWav("tap.wav", render(0.09, [
  { freq: 880, start: 0, duration: 0.08, gain: 0.4, decay: 45, overtones: [1, 0.2] }
]));

writeWav("correct.wav", render(0.6, [
  { freq: C6, start: 0, duration: 0.3, decay: 9 },
  { freq: E6, start: 0.1, duration: 0.3, decay: 9 },
  { freq: G6, start: 0.2, duration: 0.4, decay: 7 }
]));

// Soft and low on purpose: a wrong answer should not feel like a punishment.
writeWav("wrong.wav", render(0.45, [
  { freq: 311.13, start: 0, duration: 0.2, gain: 0.45, decay: 8, overtones: [1, 0.15] },
  { freq: 233.08, start: 0.14, duration: 0.3, gain: 0.45, decay: 7, overtones: [1, 0.15] }
]));

writeWav("star.wav", render(0.4, [
  { freq: G6, start: 0, duration: 0.2, gain: 0.4, decay: 12 },
  { freq: 2093, start: 0.07, duration: 0.3, gain: 0.4, decay: 10 }
]));

writeWav("win.wav", render(1.6, [
  { freq: C5, start: 0, duration: 0.25, decay: 6 },
  { freq: E5, start: 0.13, duration: 0.25, decay: 6 },
  { freq: G5, start: 0.26, duration: 0.25, decay: 6 },
  { freq: C6, start: 0.39, duration: 0.3, decay: 5 },
  { freq: G5, start: 0.6, duration: 0.2, decay: 6 },
  { freq: C6, start: 0.75, duration: 0.85, gain: 0.45, decay: 3 },
  { freq: E6, start: 0.75, duration: 0.85, gain: 0.35, decay: 3 },
  { freq: G6, start: 0.75, duration: 0.85, gain: 0.3, decay: 3 }
]));

console.log(`Sounds written to ${outDir}`);
