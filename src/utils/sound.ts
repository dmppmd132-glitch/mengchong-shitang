let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration = 0.11,
  type: OscillatorType = 'sine',
  gainVal = 0.08,
  delay = 0
) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const soundFX = {
  pop(enabled: boolean) {
    if (!enabled) return;
    playTone(520, 0.08, 'sine', 0.08, 0);
    playTone(720, 0.09, 'sine', 0.06, 0.04);
  },
  heart(enabled: boolean) {
    if (!enabled) return;
    playTone(587, 0.1, 'triangle', 0.08, 0);
    playTone(784, 0.12, 'triangle', 0.08, 0.07);
  },
  chew(enabled: boolean) {
    if (!enabled) return;
    playTone(360, 0.08, 'triangle', 0.08, 0);
    playTone(440, 0.08, 'triangle', 0.08, 0.11);
    playTone(520, 0.1, 'triangle', 0.07, 0.22);
  },
  bubble(enabled: boolean) {
    if (!enabled) return;
    playTone(460, 0.07, 'sine', 0.06, 0);
    playTone(620, 0.08, 'sine', 0.06, 0.08);
    playTone(860, 0.1, 'sine', 0.06, 0.16);
  },
  levelUp(enabled: boolean) {
    if (!enabled) return;
    playTone(523.25, 0.12, 'triangle', 0.09, 0);
    playTone(659.25, 0.12, 'triangle', 0.09, 0.11);
    playTone(783.99, 0.14, 'triangle', 0.09, 0.22);
    playTone(1046.5, 0.25, 'triangle', 0.1, 0.34);
  },
  hatch(enabled: boolean) {
    if (!enabled) return;
    playTone(440, 0.1, 'sine', 0.08, 0);
    playTone(554, 0.1, 'sine', 0.08, 0.1);
    playTone(659, 0.12, 'sine', 0.08, 0.2);
    playTone(880, 0.24, 'triangle', 0.09, 0.32);
  },
};
