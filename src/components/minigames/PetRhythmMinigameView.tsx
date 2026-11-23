import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Music, Volume2, VolumeX } from 'lucide-react';
import { SPECIES_RHYTHM_REACTIONS } from '../../data/minigames';
import { Pet } from '../../types';
import { MinigameDifficultyProfile, MinigameResult } from '../../types/minigame';
import {
  RhythmSongEngine,
  ScheduledRhythmNote,
  generateRhythmChart,
  getRhythmConfigForTier,
} from '../../utils/rhythmAudio';
import { soundFX, triggerHaptic } from '../../utils/sound';
import { PiggyCharacter } from '../PiggyCharacter';

interface PetRhythmMinigameViewProps {
  pet: Pet;
  soundEnabled: boolean;
  usedPaidReplay: boolean;
  difficulty: MinigameDifficultyProfile;
  onComplete: (result: MinigameResult) => void;
}

interface VisibleNote extends ScheduledRhythmNote {
  x: number;
}

interface BeatTick {
  beat: number;
  x: number;
  isBarStart: boolean;
}

type JudgmentLabel = 'Perfect!' | 'Good' | 'Miss';

const ROUND_SECONDS = 40;
const HIT_ZONE_X = 20;
const SPAWN_X = 96;
const BASE_PERFECT_SEC = 0.095;
const BASE_GOOD_SEC = 0.185;

export const PetRhythmMinigameView: React.FC<PetRhythmMinigameViewProps> = ({
  pet,
  soundEnabled,
  usedPaidReplay,
  difficulty,
  onComplete,
}) => {
  const { bpm, travelSeconds } = useMemo(
    () => getRhythmConfigForTier(difficulty.tier),
    [difficulty.tier]
  );
  const beatSec = 60 / bpm;

  const [musicEnabled, setMusicEnabled] = useState<boolean>(soundEnabled);
  const [notes, setNotes] = useState<VisibleNote[]>([]);
  const [beatTicks, setBeatTicks] = useState<BeatTick[]>([]);
  const [beatInBar, setBeatInBar] = useState<number>(0);
  const [isBeatPulse, setIsBeatPulse] = useState<boolean>(false);
  const [countInLabel, setCountInLabel] = useState<string | null>('預備！跟著節拍…');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [perfectCount, setPerfectCount] = useState<number>(0);
  const [goodCount, setGoodCount] = useState<number>(0);
  const [missCount, setMissCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_SECONDS);
  const [judgment, setJudgment] = useState<{ label: JudgmentLabel; key: number } | null>(
    null
  );
  const [ringPulse, setRingPulse] = useState<'idle' | 'perfect' | 'good'>('idle');

  const activeNotesRef = useRef<ScheduledRhythmNote[]>([]);
  const engineRef = useRef<RhythmSongEngine | null>(null);
  const musicEnabledRef = useRef<boolean>(musicEnabled);
  musicEnabledRef.current = musicEnabled;

  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const perfectRef = useRef<number>(0);
  const goodRef = useRef<number>(0);
  const missRef = useRef<number>(0);
  const judgmentKeyRef = useRef<number>(1);
  const rafRef = useRef<number | null>(null);
  const finishedRef = useRef<boolean>(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const reaction = SPECIES_RHYTHM_REACTIONS[pet.species];
  const perfectWindowSec = BASE_PERFECT_SEC * difficulty.windowMultiplier;
  const goodWindowSec = BASE_GOOD_SEC * difficulty.windowMultiplier;

  useEffect(() => {
    setMusicEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    engineRef.current?.setEnabled(musicEnabled);
  }, [musicEnabled]);

  const showJudgment = useCallback((label: JudgmentLabel) => {
    setJudgment({ label, key: judgmentKeyRef.current++ });
  }, []);

  useEffect(() => {
    finishedRef.current = false;
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    perfectRef.current = 0;
    goodRef.current = 0;
    missRef.current = 0;

    const chart = generateRhythmChart(bpm, ROUND_SECONDS, difficulty.tier);
    activeNotesRef.current = chart;

    const engine = new RhythmSongEngine(bpm, musicEnabledRef.current);
    engineRef.current = engine;
    engine.start();

    const step = (now: number) => {
      const songTimeSec = Math.max(0, engine.getSongTimeSec(now));
      const remaining = Math.max(0, Math.ceil(ROUND_SECONDS - songTimeSec));
      setTimeLeft(remaining);

      const beatFloat = songTimeSec / beatSec;
      const currentBeat = Math.floor(beatFloat);
      const beatFrac = beatFloat - currentBeat;
      setBeatInBar(((currentBeat % 4) + 4) % 4);
      setIsBeatPulse(beatFrac < 0.24);

      if (beatFloat < 3.6) {
        if (currentBeat === 0) setCountInLabel('預備 3…');
        else if (currentBeat === 1) setCountInLabel('預備 2…');
        else if (currentBeat === 2) setCountInLabel('預備 1…');
        else setCountInLabel('GO！跟著節拍點！');
      } else {
        setCountInLabel(null);
      }

      // Auto-miss notes that passed beyond the good timing window
      let missedThisFrame = false;
      const remainingNotes: ScheduledRhythmNote[] = [];
      for (const note of activeNotesRef.current) {
        if (songTimeSec - note.hitTimeSec > goodWindowSec) {
          missedThisFrame = true;
          continue;
        }
        remainingNotes.push(note);
      }

      if (missedThisFrame) {
        activeNotesRef.current = remainingNotes;
        comboRef.current = 0;
        missRef.current += 1;
        setCombo(0);
        setMissCount(missRef.current);
        showJudgment('Miss');
      }

      // Map active notes to exact track X coordinates locked to the music clock
      const visibleNotes: VisibleNote[] = [];
      for (const note of activeNotesRef.current) {
        const progress = (note.hitTimeSec - songTimeSec) / travelSeconds;
        const x = HIT_ZONE_X + progress * (SPAWN_X - HIT_ZONE_X);
        if (x <= 104 && x >= HIT_ZONE_X - 12) {
          visibleNotes.push({ ...note, x });
        }
      }
      setNotes(visibleNotes);

      // Compute visible quarter-beat grid lines along the track
      const firstTickBeat = Math.max(4, Math.floor(beatFloat - 0.3));
      const lastTickBeat = Math.ceil(beatFloat + travelSeconds / beatSec + 0.2);
      const ticks: BeatTick[] = [];
      for (let b = firstTickBeat; b <= lastTickBeat; b += 1) {
        const tickTime = b * beatSec;
        const tickProgress = (tickTime - songTimeSec) / travelSeconds;
        const tx = HIT_ZONE_X + tickProgress * (SPAWN_X - HIT_ZONE_X);
        if (tx >= 8 && tx <= 99) {
          ticks.push({
            beat: b,
            x: tx,
            isBarStart: b % 4 === 0,
          });
        }
      }
      setBeatTicks(ticks);

      if (songTimeSec >= ROUND_SECONDS) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        engine.stop();
        if (!finishedRef.current) {
          finishedRef.current = true;
          soundFX.levelUp(musicEnabledRef.current);
          onCompleteRef.current({
            gameId: 'petRhythm',
            score: scoreRef.current,
            maxCombo: maxComboRef.current,
            perfectCount: perfectRef.current,
            goodCount: goodRef.current,
            missCount: missRef.current,
            usedPaidReplay,
            playedAt: Date.now(),
          });
        }
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      engine.stop();
      engineRef.current = null;
    };
  }, [
    beatSec,
    bpm,
    difficulty.tier,
    goodWindowSec,
    showJudgment,
    travelSeconds,
    usedPaidReplay,
  ]);

  const handleTapBeat = useCallback(() => {
    if (finishedRef.current) return;
    engineRef.current?.unlockAudio();

    const songTimeSec = engineRef.current ? Math.max(0, engineRef.current.getSongTimeSec()) : 0;
    const audioOn = musicEnabledRef.current;

    // Ignore accidental taps during the intro count-in before the first note enters the hit zone
    const firstNoteStartWindow = 4 * beatSec - goodWindowSec - 0.12;
    if (songTimeSec < firstNoteStartWindow) {
      soundFX.pop(audioOn);
      return;
    }

    let bestIdx = -1;
    let bestDelta = Infinity;
    for (let i = 0; i < activeNotesRef.current.length; i += 1) {
      const delta = Math.abs(activeNotesRef.current[i].hitTimeSec - songTimeSec);
      if (delta < bestDelta) {
        bestDelta = delta;
        bestIdx = i;
      }
    }

    if (bestIdx === -1 || bestDelta > goodWindowSec) {
      comboRef.current = 0;
      missRef.current += 1;
      setCombo(0);
      setMissCount(missRef.current);
      soundFX.miss(audioOn);
      triggerHaptic(24);
      showJudgment('Miss');
      return;
    }

    const updated = [...activeNotesRef.current];
    updated.splice(bestIdx, 1);
    activeNotesRef.current = updated;

    if (bestDelta <= perfectWindowSec) {
      comboRef.current += 1;
      perfectRef.current += 1;
      if (comboRef.current > maxComboRef.current) {
        maxComboRef.current = comboRef.current;
        setMaxCombo(comboRef.current);
      }
      const gained = 8 + Math.min(8, (comboRef.current - 1) * 2);
      scoreRef.current += gained;
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setPerfectCount(perfectRef.current);
      setRingPulse('perfect');
      window.setTimeout(() => setRingPulse('idle'), 130);
      triggerHaptic(16);
      if (comboRef.current >= 3) {
        soundFX.combo(audioOn, comboRef.current);
      } else {
        soundFX.rhythmPerfect(audioOn);
      }
      showJudgment('Perfect!');
    } else {
      goodRef.current += 1;
      comboRef.current = 0;
      scoreRef.current += 4;
      setScore(scoreRef.current);
      setCombo(0);
      setGoodCount(goodRef.current);
      setRingPulse('good');
      window.setTimeout(() => setRingPulse('idle'), 130);
      triggerHaptic(10);
      soundFX.rhythmGood(audioOn);
      showJudgment('Good');
    }
  }, [beatSec, goodWindowSec, perfectWindowSec, showJudgment]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleTapBeat();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleTapBeat]);

  return (
    <div className="space-y-2.5 overflow-x-hidden">
      <div className="flex items-center justify-between gap-2 px-1 text-xs font-extrabold tabular-nums">
        <span className="text-[#5A3EA6]">得分 {score}</span>

        <div className="flex items-center gap-1.5">
          {combo >= 2 ? (
            <span
              key={combo}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FFE7B3] text-[#8F5306] animate-combo-pop"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{combo} Perfect 連擊</span>
            </span>
          ) : (
            <span className="text-[#826862]">
              P:{perfectCount} · G:{goodCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const next = !musicEnabled;
              setMusicEnabled(next);
              engineRef.current?.unlockAudio();
            }}
            aria-label={musicEnabled ? '靜音節奏音樂' : '開啟節奏音樂'}
            className={`min-h-[28px] px-2 rounded-lg text-[11px] font-extrabold inline-flex items-center gap-1 transition ${
              musicEnabled
                ? 'bg-[#EDE7FE] text-[#5A3EA6]'
                : 'bg-[#F2E6E2] text-[#8A716B]'
            }`}
          >
            {musicEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{bpm} BPM</span>
          </button>
          <span className={timeLeft <= 6 ? 'text-[#D64470]' : 'text-[#5A423C]'}>
            {timeLeft}秒
          </span>
        </div>
      </div>

      <div className="relative rounded-2xl border-2 border-[#D2C6F5] bg-gradient-to-b from-[#F5F1FF] to-[#FFF6FB] px-3 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`transition-transform duration-100 ${isBeatPulse ? 'scale-105' : 'scale-100'}`}>
            <PiggyCharacter
              species={pet.species}
              growth={pet.growth}
              roundness={pet.roundness}
              action="walking"
              expression={combo >= 3 ? 'sparkle' : 'normal'}
              equipped={pet.accessories}
              interactive={false}
              customAnimClass={reaction.animClass}
              size={82}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-extrabold text-[#5A3EA6] truncate">
                {reaction.danceLabel}
              </p>
              {/* 4-beat visual measure indicator synced to BGM */}
              <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
                {[0, 1, 2, 3].map((dotIdx) => {
                  const active = beatInBar === dotIdx;
                  return (
                    <span
                      key={dotIdx}
                      className={`rounded-full transition-all duration-75 ${
                        active
                          ? dotIdx === 0
                            ? 'w-2.5 h-2.5 bg-[#FF7A9E]'
                            : 'w-2 h-2 bg-[#7E60D6]'
                          : 'w-1.5 h-1.5 bg-[#DCD2F5]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] font-bold text-[#7D635D] leading-snug mt-0.5">
              {countInLabel
                ? countInLabel
                : combo >= 3
                ? `太讚了！Perfect ${combo} 連擊跟上節拍！`
                : reaction.speech}
            </p>
          </div>
        </div>

        {judgment && (
          <span
            key={judgment.key}
            className={`text-sm font-extrabold shrink-0 px-2.5 py-1 rounded-xl animate-combo-pop ${
              judgment.label === 'Perfect!'
                ? 'bg-[#FFE7B3] text-[#8F5306]'
                : judgment.label === 'Good'
                ? 'bg-[#E4F7EE] text-[#1F6B54]'
                : 'bg-[#FFE5EC] text-[#C83B67]'
            }`}
          >
            {judgment.label}
          </span>
        )}
      </div>

      <div
        onPointerDown={(e) => {
          e.preventDefault();
          handleTapBeat();
        }}
        className="relative w-full h-[98px] rounded-2xl border-2 border-[#C7B7F2] bg-[#FAF7FF] overflow-hidden select-none touch-none cursor-pointer"
      >
        <div
          className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#E5DCF8]"
          aria-hidden="true"
        />

        {/* Beat subdivision tick marks gliding with the music */}
        {beatTicks.map((tick) => (
          <div
            key={tick.beat}
            style={{ left: `${tick.x}%` }}
            className={`pointer-events-none absolute top-3 bottom-3 -translate-x-1/2 ${
              tick.isBarStart ? 'w-[2px] bg-[#C9B7F2]' : 'w-px bg-[#E8E0FA]'
            }`}
            aria-hidden="true"
          />
        ))}

        {/* Beat-synced Target Ring */}
        <div
          style={{ left: `${HIT_ZONE_X}%` }}
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-4 flex items-center justify-center transition-transform duration-75 ${
            ringPulse === 'perfect'
              ? 'border-[#F59E0B] bg-[#FEF3C7] scale-115'
              : ringPulse === 'good'
              ? 'border-[#3BA886] bg-[#D1FAE5] scale-110'
              : isBeatPulse
              ? 'border-[#7E60D6] bg-[#F1EBFF] scale-105'
              : 'border-[#967BE3] bg-white/92 scale-100'
          }`}
        >
          <span className="text-[11px] font-extrabold text-[#5A3EA6]">TAP</span>
        </div>

        {notes.map((note) => (
          <div
            key={note.id}
            style={{
              left: `${note.x}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute top-1/2 leading-none pointer-events-none select-none will-change-transform flex items-center justify-center ${
              note.isDownbeat ? 'text-[34px] drop-shadow-xs' : 'text-3xl'
            }`}
            aria-hidden="true"
          >
            {note.emoji}
          </div>
        ))}

        {countInLabel && (
          <div className="pointer-events-none absolute right-3 top-2 px-2 py-0.5 rounded-lg bg-[#EDE7FE] text-[11px] font-extrabold text-[#5A3EA6]">
            {countInLabel}
          </div>
        )}
      </div>

      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          handleTapBeat();
        }}
        className={`w-full min-h-[76px] rounded-2xl bg-gradient-to-b from-[#8A6EE8] to-[#6F52D2] text-white font-extrabold text-base shadow-[0_4px_0_#5238AD] active:translate-y-1 active:shadow-none transition flex items-center justify-center gap-2 select-none touch-none ${
          isBeatPulse ? 'brightness-105' : ''
        }`}
      >
        <Music className="w-5 h-5" />
        <span>跟著音樂節拍點擊！</span>
      </button>

      <p className="text-center text-[11px] font-bold text-[#826862] tabular-nums">
        最高連擊 {maxCombo} · Perfect {perfectCount} · Good {goodCount} · Miss {missCount}
      </p>
    </div>
  );
};
