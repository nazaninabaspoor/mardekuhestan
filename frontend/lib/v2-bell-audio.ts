/**
 * Cute synthesized desk-bell tones for /v2 (no audio file required).
 * Browsers need a user gesture before AudioContext can start — we unlock on first input.
 */

let ctx: AudioContext | null = null;
let unlocked = false;
let welcomePlayed = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

async function ensureRunning(): Promise<AudioContext | null> {
  const audio = getCtx();
  if (!audio) return null;
  if (audio.state === "suspended") {
    try {
      await audio.resume();
    } catch {
      return null;
    }
  }
  unlocked = true;
  return audio;
}

/** Soft metallic partials — tiny shop bell */
function strike(
  audio: AudioContext,
  opts: {
    freqs: number[];
    when?: number;
    gain?: number;
    decay?: number;
  },
) {
  const when = opts.when ?? audio.currentTime;
  const master = audio.createGain();
  master.gain.value = 0;
  master.connect(audio.destination);

  const peak = opts.gain ?? 0.18;
  const decay = opts.decay ?? 1.15;

  master.gain.setValueAtTime(0, when);
  master.gain.linearRampToValueAtTime(peak, when + 0.012);
  master.gain.exponentialRampToValueAtTime(0.0008, when + decay);

  opts.freqs.forEach((freq, i) => {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(i === 0 ? 1 : 0.28 / i, when);
    g.gain.exponentialRampToValueAtTime(0.0008, when + decay * (0.75 + i * 0.1));
    osc.connect(g);
    g.connect(master);
    osc.start(when);
    osc.stop(when + decay + 0.05);
  });
}

/** Warm welcome ding when the visitor arrives / first engages the page */
export async function playWelcomeBell() {
  if (welcomePlayed) return;
  const audio = await ensureRunning();
  if (!audio) return;
  welcomePlayed = true;
  const t = audio.currentTime + 0.02;
  strike(audio, {
    freqs: [988, 1480, 1976],
    when: t,
    gain: 0.2,
    decay: 1.35,
  });
  strike(audio, {
    freqs: [1174, 1760],
    when: t + 0.14,
    gain: 0.12,
    decay: 1.1,
  });
}

/** Shorter ding when kitchen category changes */
export async function playCategoryBell() {
  const audio = await ensureRunning();
  if (!audio) return;
  strike(audio, {
    freqs: [1046, 1568, 2093],
    when: audio.currentTime + 0.01,
    gain: 0.16,
    decay: 0.85,
  });
}

/** Call once from page effects so the first gesture unlocks + plays welcome */
export function armWelcomeBellOnGesture() {
  if (typeof window === "undefined") return () => {};

  const fire = () => {
    void playWelcomeBell();
    window.removeEventListener("pointerdown", fire, true);
    window.removeEventListener("keydown", fire, true);
    window.removeEventListener("touchstart", fire, true);
    window.removeEventListener("wheel", fire, true);
  };

  window.addEventListener("pointerdown", fire, { capture: true, passive: true });
  window.addEventListener("keydown", fire, { capture: true, passive: true });
  window.addEventListener("touchstart", fire, { capture: true, passive: true });
  window.addEventListener("wheel", fire, { capture: true, passive: true });

  return () => {
    window.removeEventListener("pointerdown", fire, true);
    window.removeEventListener("keydown", fire, true);
    window.removeEventListener("touchstart", fire, true);
    window.removeEventListener("wheel", fire, true);
  };
}

export function isBellUnlocked() {
  return unlocked;
}
