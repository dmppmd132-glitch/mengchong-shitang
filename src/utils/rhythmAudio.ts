import { MinigameDifficultyTier } from '../types/minigame';
import { getSharedAudioContext } from './sound';

export type RhythmLane = 'left' | 'right';

export interface ScheduledRhythmNote {
  id: number;
  beat: number;
  hitTimeSec: number;
  emoji: string;
  isDownbeat: boolean;
  isSyncopated: boolean;
  lane: RhythmLane;
}

export interface RhythmSongConfig {
  id: MinigameDifficultyTier;
  title: string;
  keyLabel: string;
  bpm: number;
  travelSeconds: number;
  isDualLane: boolean;
}

const NOTE_ICONS_ONBEAT = ['🎵', '🍎', '🍮', '🍓'];
const NOTE_ICONS_ACCENT = ['🩷', '🌟'];

const SONG_CONFIGS: Record<MinigameDifficultyTier, RhythmSongConfig> = {
  relaxed: {
    id: 'relaxed',
    title: '晨間散步曲',
    keyLabel: 'C大調 · 單軌',
    bpm: 104,
    travelSeconds: 2.1,
    isDualLane: false,
  },
  standard: {
    id: 'standard',
    title: '草莓派對曲',
    keyLabel: 'F大調 · 單軌',
    bpm: 116,
    travelSeconds: 1.85,
    isDualLane: false,
  },
  pro: {
    id: 'pro',
    title: '星夜可可舞曲',
    keyLabel: 'A小調 · 雙軌挑戰',
    bpm: 128,
    travelSeconds: 1.6,
    isDualLane: true,
  },
};

export function getRhythmConfigForTier(tier: MinigameDifficultyTier): RhythmSongConfig {
  return SONG_CONFIGS[tier] ?? SONG_CONFIGS.standard;
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
  const isDual = tier === 'pro';

  // Beat offsets within each 4-beat bar matching each arrangement's phrasing
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
    for (let idx = 0; idx < offsets.length; idx += 1) {
      const offset = offsets[idx];
      const beat = barStartBeat + offset;
      if (beat > maxBeat) break;
      const isDownbeat = offset === 0;
      const isSyncopated = offset % 1 !== 0;

      // In dual-lane Pro mode, create intuitive alternating / phrase-grouped lane patterns
      const lane: RhythmLane = !isDual
        ? 'left'
        : isSyncopated
        ? 'left'
        : Math.floor(offset) % 2 === 0
        ? bar % 2 === 0
          ? 'left'
          : 'right'
        : bar % 2 === 0
        ? 'right'
        : 'left';

      const emoji = isDual
        ? lane === 'left'
          ? isDownbeat
            ? '🍓'
            : '🩷'
          : isDownbeat
          ? '🌟'
          : '🎵'
        : isDownbeat
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
        lane,
      });
    }
  }

  return notes;
}

// MIDI helper -> frequency in Hz
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

interface SongArrangement {
  melody: number[];
  bass: number[];
  chords: number[][];
  kickHatBoost: number;
}

// Song 1: Relaxed (104 BPM) — Cheerful C-major morning walk (C | G | Am | F-G | C | G | F | G-C)
const RELAXED_ARRANGEMENT: SongArrangement = {
  melody: [
    76, 0, 79, 81, 79, 76, 72, 74,
    76, 0, 74, 0, 71, 0, 67, 0,
    69, 72, 76, 0, 81, 79, 76, 0,
    77, 0, 76, 74, 0, 79, 0, 0,
    76, 0, 79, 81, 84, 0, 81, 79,
    79, 0, 76, 74, 0, 71, 74, 0,
    72, 76, 77, 81, 79, 0, 76, 72,
    74, 0, 76, 74, 72, 0, 0, 0,
  ],
  bass: [
    48, 0, 60, 0, 55, 0, 60, 0,
    43, 0, 55, 0, 50, 0, 55, 0,
    45, 0, 57, 0, 52, 0, 57, 0,
    41, 0, 53, 0, 43, 0, 55, 0,
    48, 0, 60, 0, 55, 0, 60, 0,
    43, 0, 55, 0, 50, 0, 55, 0,
    41, 0, 53, 0, 48, 0, 53, 0,
    43, 0, 55, 0, 48, 0, 0, 0,
  ],
  chords: [
    [60, 64, 67],
    [55, 59, 62],
    [57, 60, 64],
    [53, 57, 60],
    [60, 64, 67],
    [55, 59, 62],
    [53, 57, 60],
    [55, 59, 62],
  ],
  kickHatBoost: 1,
};

// Song 2: Standard (116 BPM) — Bouncy F-major strawberry party (F | C | Dm | Bb-C | F | C | Bb | C-F)
const STANDARD_ARRANGEMENT: SongArrangement = {
  melody: [
    77, 81, 84, 0, 81, 79, 77, 0,
    79, 0, 84, 83, 81, 0, 76, 0,
    74, 77, 81, 0, 84, 81, 79, 77,
    82, 0, 81, 79, 0, 84, 0, 0,
    77, 81, 84, 86, 84, 0, 81, 77,
    79, 84, 83, 79, 0, 76, 79, 0,
    82, 0, 81, 77, 79, 81, 84, 0,
    79, 81, 79, 76, 77, 0, 0, 0,
  ],
  bass: [
    41, 0, 53, 0, 48, 0, 53, 0,
    48, 0, 60, 0, 55, 0, 60, 0,
    50, 0, 62, 0, 57, 0, 62, 0,
    46, 0, 58, 0, 48, 0, 60, 0,
    41, 0, 53, 0, 48, 0, 53, 0,
    48, 0, 60, 0, 55, 0, 60, 0,
    46, 0, 58, 0, 53, 0, 58, 0,
    48, 0, 60, 0, 41, 0, 0, 0,
  ],
  chords: [
    [65, 69, 72], // F
    [60, 64, 67], // C
    [62, 65, 69], // Dm
    [58, 62, 65], // Bb
    [65, 69, 72], // F
    [60, 64, 67], // C
    [58, 62, 65], // Bb
    [60, 64, 67], // C
  ],
  kickHatBoost: 1.08,
};

// Song 3: Pro (128 BPM) — Energetic A-minor starlit cocoa dance (Am | F | C | G | Am | F | Dm-E | Am)
const PRO_ARRANGEMENT: SongArrangement = {
  melody: [
    69, 72, 76, 0, 81, 79, 76, 72,
    77, 0, 81, 84, 81, 77, 76, 0,
    72, 76, 79, 84, 83, 79, 76, 0,
    79, 76, 74, 71, 74, 79, 83, 0,
    81, 84, 88, 0, 84, 81, 79, 76,
    77, 81, 84, 86, 84, 0, 81, 77,
    74, 77, 81, 77, 76, 79, 83, 88,
    81, 0, 84, 83, 81, 0, 0, 0,
  ],
  bass: [
    45, 57, 45, 57, 45, 57, 52, 57,
    41, 53, 41, 53, 41, 53, 48, 53,
    48, 60, 48, 60, 48, 60, 55, 60,
    43, 55, 43, 55, 43, 55, 50, 55,
    45, 57, 45, 57, 45, 57, 52, 57,
    41, 53, 41, 53, 41, 53, 48, 53,
    50, 62, 50, 62, 40, 52, 40, 52,
    45, 57, 52, 57, 45, 0, 0, 0,
  ],
  chords: [
    [57, 60, 64], // Am
    [53, 57, 60], // F
    [60, 64, 67], // C
    [55, 59, 62], // G
    [57, 60, 64], // Am
    [53, 57, 60], // F
    [50, 53, 57], // Dm
    [52, 56, 59], // E
  ],
  kickHatBoost: 1.18,
};

const SONG_ARRANGEMENTS: Record<MinigameDifficultyTier, SongArrangement> = {
  relaxed: RELAXED_ARRANGEMENT,
  standard: STANDARD_ARRANGEMENT,
  pro: PRO_ARRANGEMENT,
};

export class RhythmSongEngine {
  private bpm: number;
  private tier: MinigameDifficultyTier;
  private stepDurationSec: number;
  private wallStartPerfMs = 0;
  private schedulerTimer: number | null = null;
  private nextStepIndex = 0; // 0..7 = 4-beat count-in intro, 8+ = main song loop
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted: boolean;
  private stopped = false;

  constructor(bpm: number, enabled: boolean, tier: MinigameDifficultyTier = 'standard') {
    this.bpm = bpm;
    this.tier = tier;
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

    const arrangement = SONG_ARRANGEMENTS[this.tier] ?? STANDARD_ARRANGEMENT;
    const loopStep = (stepIdx - 8) % arrangement.melody.length;
    const stepInBar = loopStep % 8;
    const barIndex = Math.floor(loopStep / 8);

    // 1. Drums: Kick on beats 1 & 3 (steps 0, 4), Snare on beats 2 & 4 (steps 2, 6), Hat on all 8ths
    if (
      stepInBar === 0 ||
      stepInBar === 4 ||
      (stepInBar === 5 && barIndex % 2 === 1) ||
      (this.tier === 'pro' && stepInBar === 2 && barIndex % 2 === 1)
    ) {
      this.playKick(
        ctx,
        when,
        (stepInBar === 5 ? 0.11 : 0.16) * arrangement.kickHatBoost
      );
    }
    if (stepInBar === 2 || stepInBar === 6) {
      this.playSnare(ctx, when);
    }
    this.playHiHat(
      ctx,
      when,
      (stepInBar % 2 === 0 ? 0.022 : 0.013) * arrangement.kickHatBoost
    );

    // 2. Soft Warm Pad on beat 1 of each bar
    if (stepInBar === 0) {
      const chord = arrangement.chords[barIndex % arrangement.chords.length];
      for (const midi of chord) {
        this.playPadTone(ctx, when, midiToFreq(midi), this.stepDurationSec * 7.2);
      }
    }

    // 3. Bouncy Bass
    const bassMidi = arrangement.bass[loopStep];
    if (bassMidi > 0) {
      this.playBass(ctx, when, midiToFreq(bassMidi), this.stepDurationSec * 1.4);
    }

    // 4. Cute Bell / Marimba Melody
    const melodyMidi = arrangement.melody[loopStep];
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
