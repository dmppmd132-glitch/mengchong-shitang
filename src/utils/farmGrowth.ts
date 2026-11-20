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

/**
 * Estimate the real wall-clock time needed from `now`, respecting any remaining active buff
 * windows. A +10% growth rate means work accrues at 1.1x, not a 10% time reduction.
 */
export function getExpectedCropDurationMs(
  baseDurationMs: number,
  now: number,
  periods: YardMoodBuffPeriod[]
): number {
  let remainingWorkMs = Math.max(0, baseDurationMs);
  let cursor = now;

  for (const period of mergeYardMoodBuffPeriods(periods)) {
    if (period.expiresAt <= cursor) continue;

    const normalMs = Math.max(0, period.startedAt - cursor);
    if (remainingWorkMs <= normalMs) {
      return Math.max(0, Math.ceil(cursor + remainingWorkMs - now));
    }
    remainingWorkMs -= normalMs;
    cursor += normalMs;

    const boostedMs = Math.max(0, period.expiresAt - cursor);
    const boostedWorkMs = boostedMs * PICNIC_GROWTH_RATE_MULTIPLIER;
    if (remainingWorkMs <= boostedWorkMs) {
      return Math.max(0, Math.ceil(cursor + remainingWorkMs / PICNIC_GROWTH_RATE_MULTIPLIER - now));
    }
    remainingWorkMs -= boostedWorkMs;
    cursor += boostedMs;
  }

  return Math.max(0, Math.ceil(cursor + remainingWorkMs - now));
}

export function getCropGrowthState(
  plot: CropPlot,
  now: number,
  periods: YardMoodBuffPeriod[]
): CropGrowthState {
  if (plot.plantedAt === null || plot.cropId === null || plot.durationMs <= 0) {
    return { effectiveElapsedMs: 0, remainingMs: 0, progressPercent: 0, isReady: false };
  }

  const plantedAt = plot.plantedAt;
  const wallElapsedMs = Math.max(0, now - plantedAt);
  const boostedElapsedMs = mergeYardMoodBuffPeriods(periods).reduce((total, period) => {
    const overlapStart = Math.max(plantedAt, period.startedAt);
    const overlapEnd = Math.min(now, period.expiresAt);
    return total + Math.max(0, overlapEnd - overlapStart);
  }, 0);
  const effectiveElapsedMs = wallElapsedMs + boostedElapsedMs * (PICNIC_GROWTH_RATE_MULTIPLIER - 1);
  const remainingWorkMs = Math.max(0, plot.durationMs - effectiveElapsedMs);

  return {
    effectiveElapsedMs,
    remainingMs: getExpectedCropDurationMs(remainingWorkMs, now, periods),
    progressPercent: Math.min(100, Math.round((effectiveElapsedMs / plot.durationMs) * 100)),
    isReady: remainingWorkMs <= 0,
  };
}
