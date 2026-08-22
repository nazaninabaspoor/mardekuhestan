/**
 * Playful two-note bell for the home intro teaser.
 * Uses Web Audio — no asset file required.
 */
export function playIntroBell(): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const Ctx =
    window.AudioContext ??
    (
      window as Window &
        typeof globalThis & { webkitAudioContext?: typeof AudioContext }
    ).webkitAudioContext;
  if (!Ctx) return;

  const ctx = new Ctx();

  const run = () => {
    const t = ctx.currentTime;

    const notes = [
      { freq: 783.99, delay: 0, gain: 0.1, decay: 0.62 },
      { freq: 987.77, delay: 0.1, gain: 0.085, decay: 0.72 },
      { freq: 1318.51, delay: 0.17, gain: 0.04, decay: 0.38 },
    ] as const;

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const start = t + note.delay;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.freq, start);
      amp.gain.setValueAtTime(0.0001, start);
      amp.gain.exponentialRampToValueAtTime(note.gain, start + 0.022);
      amp.gain.exponentialRampToValueAtTime(0.0001, start + note.decay);

      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + note.decay + 0.06);
    }

    window.setTimeout(() => {
      void ctx.close();
    }, 900);
  };

  if (ctx.state === "suspended") {
    void ctx.resume().then(run).catch(() => ctx.close());
    return;
  }

  run();
}
