import { MinigameDifficultyTier } from '../types/minigame';
import { getSharedAudioContext } from './sound';

export interface ScheduledRhythmNote {
  id: number;
  beat: number;
  hitTimeSec: number;
  emoji: string;
  isDownbeat: boolean;
  isSyncopated: boolean;
}

const NOTE_ICONS_ONBEAT = ['🎵', '🍎', '🍮', '🍓'];
const NOTE_ICONS_ACCENT = ['🩷', '🌟'];

export function getRhythmConfigForTier(tier: MinigameDifficultyTier): {
  bpm: number;
  travelSeconds: number;
} {
  if (tier === 'relaxed') {
    return { bpm: 104, travelSeconds: 2.1 };
  }
  if (tier === 'pro') {
    return { bpm: 120, travelSeconds: 1.6 };
  }
  return { bpm: 112, travelSeconds: 1.85 };
}

/**
 * Generates an entire beat-locked rhythm note chart aligned with the 8-bar melody loop.
 * Beats 0..3 are the count-in intro bar; playable notes begin on beat 4 (Bar 1 downbeat).
 */
export function generateRhythmChart(
  bpm: number,
  roundSeconds: number,
  tier: MinigameDifficultyTier
): ScheduledRhythmNote[] {
  const beatSec = 60 / bpm;
  const maxBeat = Math.floor((roundSeconds - 1.0) / beatSec);

  // Beat offsets within each 4-beat bar matching the C - G - Am - F melody phrasing
  const barPatterns: Record<MinigameDifficultyTier, number[][]> = {
    relaxed: [
      [0, 1, 2, 3],
      [0, 1, 2],
      [0, 1, 2, 3],
      [0, 1, 2, 3.5],
      [0, 1, 2, 3],
      [0, 1, 2],
      [0, 1, 2, 3],
      [0, 1, 2],
    ],
    standard: [
      [0, 1, 2, 3],
      [0, 1, 2, 2.5, 3],
      [0, 0.5, 1, 2, 3],
      [0, 1, 2, 3.5],
      [0, 1, 1.5, 2, 3],
      [0, 1, 2, 2.5, 3],
      [0, 0.5, 1, 2, 3],
      [0, 1, 2, 3],
    ],
    pro: [
      [0, 1, 1.5, 2, 3],
      [0, 0.5, 1, 2, 2.5, 3],
      [0, 1, 1.5, 2, 3, 3.5],
      [0, 0.5, 1.5, 2, 3],
      [0, 1, 1.5, 2, 2.5, 3],
      [0, 0.5, 1, 2, 3, 3.5],
      [0, 1, 1.5, 2, 3],
      [0, 0.5, 1, 2, 3],
    ],
  };

  const patterns = barPatterns[tier];
  const notes: ScheduledRhythmNote[] = [];
  let idCounter = 1;

  for (let bar = 0; ; bar += 1) {
    const barStartBeat = 4 + bar * 4;
    if (barStartBeat > maxBeat) break;
    const offsets = patterns[bar % patterns.length];
    for (const offset of offsets) {
      const beat = barStartBeat + offset;
      if (beat > maxBeat) break;
      const isDownbeat = offset === 0;
      const isSyncopated = offset % 1 !== 0;
      const emoji = isDownbeat
        ? NOTE_ICONS_ACCENT[bar % NOTE_ICONS_ACCENT.length]
        : isSyncopated
        ? '🩷'
        : NOTE_ICONS_ONBEAT[idCounter % NOTE_ICONS_ONBEAT.length];
      notes.push({
        id: idCounter++,
        beat,
        hitTimeSec: beat * beatSec,
        emoji,
        isDownbeat,
        isSyncopated,
      });
    }
  }

  return notes;
}

// MIDI helper -> frequency in Hz
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// 8-bar (64 eighth-note steps) cheerful C-major pop melody loop (MIDI notes, 0 = rest)
// Progression: C | G | Am | F-G | C | G | F | G-C
const MELODY_STEPS: number[] = [
  // Bar 1 (C): E5 - G5 A5 G5 E5 C5 D5
  76, 0, 79, 81, 79, 76, 72, 74,
  // Bar 2 (G): E5 - D5 - B4 - G4 -
  76, 0, 74, 0, 71, 0, 67, 0,
  // Bar 3 (Am): A4 C5 E5 - A5 G5 E5 -
  69, 72, 76, 0, 81, 79, 76, 0,
  // Bar 4 (F -> G): F5 - E5 D5 - G5 - -
  77, 0, 76, 74, 0, 79, 0, 0,
  // Bar 5 (C): E5 - G5 A5 C6 - A5 G5
  76, 0, 79, 81, 84, 0, 81, 79,
  // Bar 6 (G): G5 - E5 D5 - B4 D5 -
  79, 0, 76, 74, 0, 71, 74, 0,
  // Bar 7 (F): C5 E5 F5 A5 G5 - E5 C5
  72, 76, 77, 81, 79, 0, 76, 72,
  // Bar 8 (G -> C): D5 - E5 D5 C5 - - -
  74, 0, 76, 74, 72, 0, 0, 0,
];

// Matching 64-step bouncy octave bassline (MIDI)
const BASS_STEPS: number[] = [
  // Bar 1 (C)
  48, 0, 60, 0, 55, 0, 60, 0,
  // Bar 2 (G)
  43, 0, 55, 0, 50, 0, 55, 0,
  // Bar 3 (Am)
  45, 0, 57, 0, 52, 0, 57, 0,
  // Bar 4 (F -> G)
  41, 0, 53, 0, 43, 0, 55, 0,
  // Bar 5 (C)
  48, 0, 60, 0, 55, 0, 60, 0,
  // Bar 6 (G)
  43, 0, 55, 0, 50, 0, 55, 0,
  // Bar 7 (F)
  41, 0, 53, 0, 48, 0, 53, 0,
  // Bar 8 (G -> C)
  43, 0, 55, 0, 48, 0, 0, 0,
];

// Soft warm pad root chords per bar (8 steps each)
const PAD_CHORDS: number[][] = [
  [60, 64, 67], // C
  [55, 59, 62], // G
  [57, 60, 64], // Am
  [53, 57, 60], // F
  [60, 64, 67], // C
  [55, 59, 62], // G
  [53, 57, 60], // F
  [55, 59, 62], // G
];

export class RhythmSongEngine {
  private bpm: number;
  private stepDurationSec: number;
  private wallStartPerfMs = 0;
  private schedulerTimer: number | null = null;
  private nextStepIndex = 0; // 0..7 = 4-beat count-in intro, 8+ = main song loop
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted: boolean;
  private stopped = false;

  constructor(bpm: number, enabled: boolean) {
    this.bpm = bpm;
    this.stepDurationSec = 60 / bpm / 2; // eighth-note step
    this.muted = !enabled;
  }

  public start(): number {
    this.stopped = false;
    this.nextStepIndex = 0;
    // Slight 40ms lead-in so beat 0 schedules cleanly
    this.wallStartPerfMs = performance.now() + 40;
    this.ensureAudioNodes();

    this.schedulerTimer = window.setInterval(() => {
      this.scheduleAhead();
    }, 25);
    this.scheduleAhead();
    return this.wallStartPerfMs;
  }

  public getSongTimeSec(nowPerfMs: number = performance.now()): number {
    return (nowPerfMs - this.wallStartPerfMs) / 1000;
  }

  public setEnabled(enabled: boolean): void {
    this.muted = !enabled;
    const ctx = getSharedAudioContext();
    if (ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(enabled ? 1 : 0, ctx.currentTime, 0.02);
    }
  }

  public unlockAudio(): void {
    this.ensureAudioNodes();
  }

  public stop(): void {
    this.stopped = true;
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    const ctx = getSharedAudioContext();
    if (ctx && this.masterGain) {
      try {
        this.masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.015);
      } catch {
        // Ignore teardown audio errors
      }
      const oldGain = this.masterGain;
      this.masterGain = null;
      window.setTimeout(() => {
        try {
          oldGain.disconnect();
        } catch {
          // Ignore
        }
      }, 80);
    }
  }

  private ensureAudioNodes(): AudioContext | null {
    const ctx = getSharedAudioContext();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    if (!this.noiseBuffer) {
      const length = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return ctx;
  }

  private scheduleAhead(): void {
    if (this.stopped) return;
    const ctx = this.ensureAudioNodes();
    const songElapsed = this.getSongTimeSec();
    const lookaheadSec = 0.16;

    while (this.nextStepIndex * this.stepDurationSec <= songElapsed + lookaheadSec) {
      const stepIdx = this.nextStepIndex;
      this.nextStepIndex += 1;

      if (this.muted || !ctx || ctx.state !== 'running' || !this.masterGain) {
        continue;
      }

      const stepTimeSec = stepIdx * this.stepDurationSec;
      const deltaFromNow = stepTimeSec - songElapsed;
      if (deltaFromNow < -0.05) {
        // Skip steps that already passed while suspended
        continue;
      }

      const audioTime = ctx.currentTime + Math.max(0, deltaFromNow);
      this.scheduleStep(ctx, stepIdx, audioTime);
    }
  }

  private scheduleStep(ctx: AudioContext, stepIdx: number, when: number): void {
    // Intro count-in bar: steps 0..7 (quarter beats at steps 0, 2, 4, 6)
    if (stepIdx < 8) {
      if (stepIdx % 2 === 0) {
        const isLastIntroBeat = stepIdx === 6;
        this.playWoodblock(
          ctx,
          when,
          isLastIntroBeat ? 987.77 : 783.99,
          isLastIntroBeat ? 0.085 : 0.06
        );
      } else {
        this.playHiHat(ctx, when, 0.012);
      }
      return;
    }

    const loopStep = (stepIdx - 8) % MELODY_STEPS.length;
    const stepInBar = loopStep % 8;
    const barIndex = Math.floor(loopStep / 8);

    // 1. Drums: Kick on beats 1 & 3 (steps 0, 4), Snare on beats 2 & 4 (steps 2, 6), Hat on all 8ths
    if (stepInBar === 0 || stepInBar === 4 || (stepInBar === 5 && barIndex % 2 === 1)) {
      this.playKick(ctx, when, stepInBar === 5 ? 0.11 : 0.16);
    }
    if (stepInBar === 2 || stepInBar === 6) {
      this.playSnare(ctx, when);
    }
    this.playHiHat(ctx, when, stepInBar % 2 === 0 ? 0.022 : 0.013);

    // 2. Soft Warm Pad on beat 1 of each bar
    if (stepInBar === 0) {
      const chord = PAD_CHORDS[barIndex % PAD_CHORDS.length];
      for (const midi of chord) {
        this.playPadTone(ctx, when, midiToFreq(midi), this.stepDurationSec * 7.2);
      }
    }

    // 3. Bouncy Bass
    const bassMidi = BASS_STEPS[loopStep];
    if (bassMidi > 0) {
      this.playBass(ctx, when, midiToFreq(bassMidi), this.stepDurationSec * 1.4);
    }

    // 4. Cute Bell / Marimba Melody
    const melodyMidi = MELODY_STEPS[loopStep];
    if (melodyMidi > 0) {
      this.playMelodyBell(ctx, when, midiToFreq(melodyMidi), this.stepDurationSec * 1.65);
    }
  }

  private playKick(ctx: AudioContext, when: number, level: number): void {
    if (!this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, when);
    osc.frequency.exponentialRampToValueAtTime(46, when + 0.1);
    gain.gain.setValueAtTime(level, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + 0.13);
  }

  private playSnare(ctx: AudioContext, when: number): void {
    if (!this.masterGain || !this.noiseBuffer) return;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2100, when);
    filter.Q.setValueAtTime(0.9, when);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.065, when);
    nGain.gain.exponentialRampToValueAtTime(0.001, when + 0.09);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(when);
    noise.stop(when + 0.1);

    // Subtle crisp snare body
    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(210, when);
    osc.frequency.exponentialRampToValueAtTime(115, when + 0.05);
    oGain.gain.setValueAtTime(0.05, when);
    oGain.gain.exponentialRampToValueAtTime(0.001, when + 0.06);
    osc.connect(oGain);
    oGain.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + 0.07);
  }

  private playHiHat(ctx: AudioContext, when: number, level: number): void {
    if (!this.masterGain || !this.noiseBuffer) return;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, when);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.032);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(when);
    noise.stop(when + 0.04);
  }

  private playWoodblock(ctx: AudioContext, when: number, freq: number, level: number): void {
    if (!this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0.001, when);
    gain.gain.linearRampToValueAtTime(level, when + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.085);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + 0.1);
  }

  private playBass(ctx: AudioContext, when: number, freq: number, dur: number): void {
    if (!this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0.001, when);
    gain.gain.linearRampToValueAtTime(0.085, when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  private playPadTone(ctx: AudioContext, when: number, freq: number, dur: number): void {
    if (!this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0.001, when);
    gain.gain.linearRampToValueAtTime(0.018, when + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + dur + 0.03);
  }

  private playMelodyBell(ctx: AudioContext, when: number, freq: number, dur: number): void {
    if (!this.masterGain) return;
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    const overGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, when);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2, when);

    gain.gain.setValueAtTime(0.001, when);
    gain.gain.linearRampToValueAtTime(0.065, when + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);

    overGain.gain.setValueAtTime(0.001, when);
    overGain.gain.linearRampToValueAtTime(0.016, when + 0.008);
    overGain.gain.exponentialRampToValueAtTime(0.001, when + dur * 0.5);

    osc.connect(gain);
    overtone.connect(overGain);
    gain.connect(this.masterGain);
    overGain.connect(this.masterGain);

    osc.start(when);
    overtone.start(when);
    osc.stop(when + dur + 0.02);
    overtone.stop(when + dur * 0.55);
  }
}
