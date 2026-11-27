import { CropPlot, YardMoodBuffPeriod } from '../types';

export const PICNIC_MOOD_BUFF_DURATION_MS = 3 * 60 * 1000;
export const PICNIC_GROWTH_RATE_MULTIPLIER = 1.1;

export interface CropGrowthState {
  effectiveElapsedMs: number;
  remainingMs: number;
  progressPercent: number;
  isReady: boolean;
}

/** Merge overlapping windows so repeated/legacy saves never stack the same +10% rate. */
export function mergeYardMoodBuffPeriods(
  periods: YardMoodBuffPeriod[]
): YardMoodBuffPeriod[] {
  const sorted = periods
    .filter(
      (period) =>
        Number.isFinite(period.startedAt) &&
        Number.isFinite(period.expiresAt) &&
        period.expiresAt > period.startedAt
    )
    .map((period) => ({ ...period }))
    .sort((a, b) => a.startedAt - b.startedAt);

  const merged: YardMoodBuffPeriod[] = [];
  for (const period of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && period.startedAt <= previous.expiresAt) {
      previous.expiresAt = Math.max(previous.expiresAt, period.expiresAt);
    } else {
      merged.push(period);
    }
  }
  return merged;
}

export function getActiveYardBuffExpiresAt(
  periods: YardMoodBuffPeriod[],
  now: number
): number | null {
  const active = mergeYardMoodBuffPeriods(periods).filter(
    (period) => period.startedAt <= now && now < period.expiresAt
  );
  return active.length > 0 ? Math.max(...active.map((period) => period.expiresAt)) : null;
}

export interface CropGrowthOptions {
  isPaused?: boolean;
  minRate?: number;
}

/**
 * Estimate the real wall-clock time needed from `now`, respecting any remaining active buff
 * windows. A +10% growth rate means work accrues at 1.1x, not a 10% time reduction.
 */
export function getExpectedCropDurationMs(
  baseDurationMs: number,
  now: number,
  periods: YardMoodBuffPeriod[],
  extraGrowthMultiplier = 1,
  options?: CropGrowthOptions
): number {
  const minRate = options?.minRate ?? 0.4;
  const baseRate = options?.isPaused ? 0 : Math.max(minRate, extraGrowthMultiplier);
  if (baseRate <= 0) {
    return Math.max(0, Math.ceil(baseDurationMs));
  }
  let remainingWorkMs = Math.max(0, baseDurationMs);
  let cursor = now;

  for (const period of mergeYardMoodBuffPeriods(periods)) {
    if (period.expiresAt <= cursor) continue;

    const normalMs = Math.max(0, period.startedAt - cursor);
    const normalWorkMs = normalMs * baseRate;
    if (remainingWorkMs <= normalWorkMs) {
      return Math.max(0, Math.ceil(cursor + remainingWorkMs / baseRate - now));
    }
    remainingWorkMs -= normalWorkMs;
    cursor += normalMs;

    const boostedMs = Math.max(0, period.expiresAt - cursor);
    const boostedRate = baseRate * PICNIC_GROWTH_RATE_MULTIPLIER;
    const boostedWorkMs = boostedMs * boostedRate;
    if (remainingWorkMs <= boostedWorkMs) {
      return Math.max(0, Math.ceil(cursor + remainingWorkMs / boostedRate - now));
    }
    remainingWorkMs -= boostedWorkMs;
    cursor += boostedMs;
  }

  return Math.max(0, Math.ceil(cursor + remainingWorkMs / baseRate - now));
}

export function getCropGrowthState(
  plot: CropPlot,
  now: number,
  periods: YardMoodBuffPeriod[],
  extraGrowthMultiplier = 1,
  options?: CropGrowthOptions
): CropGrowthState {
  if (plot.plantedAt === null || plot.cropId === null || plot.durationMs <= 0) {
    return { effectiveElapsedMs: 0, remainingMs: 0, progressPercent: 0, isReady: false };
  }

  const minRate = options?.minRate ?? 0.4;
  const isPaused = Boolean(options?.isPaused);
  const baseRate = isPaused ? 0 : Math.max(minRate, extraGrowthMultiplier);
  const plantedAt = plot.plantedAt;
  const wallElapsedMs = Math.max(0, now - plantedAt);
  const boostedElapsedMs = isPaused
    ? 0
    : mergeYardMoodBuffPeriods(periods).reduce((total, period) => {
        const overlapStart = Math.max(plantedAt, period.startedAt);
        const overlapEnd = Math.min(now, period.expiresAt);
        return total + Math.max(0, overlapEnd - overlapStart);
      }, 0);
  const effectiveElapsedMs =
    wallElapsedMs * baseRate +
    boostedElapsedMs * baseRate * (PICNIC_GROWTH_RATE_MULTIPLIER - 1);
  const remainingWorkMs = Math.max(0, plot.durationMs - effectiveElapsedMs);

  return {
    effectiveElapsedMs,
    remainingMs: isPaused
      ? Math.max(0, plot.durationMs - Math.min(plot.durationMs, wallElapsedMs * Math.max(minRate, extraGrowthMultiplier)))
      : getExpectedCropDurationMs(
          remainingWorkMs,
          now,
          periods,
          extraGrowthMultiplier,
          options
        ),
    progressPercent: Math.min(100, Math.round((effectiveElapsedMs / plot.durationMs) * 100)),
    isReady: !isPaused && remainingWorkMs <= 0,
  };
}

export function formatCropDurationLabel(totalSeconds: number): string {
  const safeSec = Math.max(1, Math.round(totalSeconds));
  if (safeSec >= 3600) {
    const hours = Math.floor(safeSec / 3600);
    const mins = Math.floor((safeSec % 3600) / 60);
    return mins > 0 ? `${hours}時${mins}分` : `${hours}小時`;
  }
  if (safeSec >= 60) {
    const mins = Math.floor(safeSec / 60);
    const secs = safeSec % 60;
    return secs > 0 ? `${mins}分${secs}秒` : `${mins}分`;
  }
  return `${safeSec}秒`;
}

export function formatRemainingTime(remainingMs: number): string {
  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000));
  if (totalSec >= 3600) {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${hours}時${String(mins).padStart(2, '0')}分`;
  }
  if (totalSec >= 60) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}分${String(secs).padStart(2, '0')}秒`;
  }
  return `${totalSec} 秒`;
}

export function getWaterBoostMs(durationMs: number): number {
  return Math.max(5000, Math.round(Math.max(0, durationMs) * 0.1));
}

export function formatWaterBoostLabel(boostMs: number): string {
  const sec = Math.max(1, Math.round(boostMs / 1000));
  if (sec >= 60) {
    const mins = Math.round(sec / 60);
    return `-${mins}分`;
  }
  return `-${sec}s`;
}

export type TimeOfDayPeriod = 'morning' | 'day' | 'night';

export function getTimeOfDayPeriod(date: Date = new Date()): TimeOfDayPeriod {
  const hour = date.getHours();
  if (hour >= 5 && hour <= 10) return 'morning';
  if (hour >= 11 && hour <= 17) return 'day';
  return 'night';
}

export function getTimeOfDayMeta(period: TimeOfDayPeriod): {
  label: string;
  emoji: string;
  badgeClass: string;
  stageTintClass: string;
} {
  if (period === 'morning') {
    return {
      label: '早安晨光',
      emoji: '🌅',
      badgeClass: 'bg-[#FFF3DC]/90 border-[#F2CE8A] text-[#8E5311]',
      stageTintClass: 'bg-gradient-to-b from-[#FFE6C7]/35 via-transparent to-[#FFF8D8]/25',
    };
  }
  if (period === 'night') {
    return {
      label: '星夜微風',
      emoji: '🌙',
      badgeClass: 'bg-[#EDE9FC]/92 border-[#C7BBE8] text-[#4C3885]',
      stageTintClass: 'bg-gradient-to-b from-[#342F63]/16 via-[#675FA8]/8 to-transparent',
    };
  }
  return {
    label: '暖陽白天',
    emoji: '☀️',
    badgeClass: 'bg-[#FFFDF5]/90 border-[#EED9C4] text-[#7A5942]',
    stageTintClass: '',
  };
}
