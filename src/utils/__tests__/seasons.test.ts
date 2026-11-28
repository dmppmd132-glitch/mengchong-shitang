import { describe, expect, it } from 'vitest';
import { getSeasonFromDate, syncSeasonSystemState } from '../seasons';
import { createInitialGameState } from '../storage';

describe('seasons & weather pure logic', () => {
  it('maps local months strictly to spring/summer/autumn/winter', () => {
    expect(getSeasonFromDate(new Date(2026, 2, 15))).toBe('spring'); // Mar
    expect(getSeasonFromDate(new Date(2026, 6, 15))).toBe('summer'); // Jul
    expect(getSeasonFromDate(new Date(2026, 9, 15))).toBe('autumn'); // Oct
    expect(getSeasonFromDate(new Date(2026, 0, 15))).toBe('winter'); // Jan
  });

  it('defaults weather to sunny/clear and emits non-punitive season transition notice on season change', () => {
    const springDate = new Date(2026, 3, 10, 10, 0, 0).getTime(); // Apr
    const autumnDate = new Date(2026, 9, 10, 10, 0, 0).getTime(); // Oct

    const initial = createInitialGameState();
    expect(initial.dialogue.weather.condition).toBe('clear');

    const inSpring = syncSeasonSystemState(initial, springDate);
    expect(inSpring.seasonSystem?.currentSeason).toBe('spring');

    const transitioned = syncSeasonSystemState(inSpring, autumnDate);
    expect(transitioned.seasonSystem?.currentSeason).toBe('autumn');
    expect(transitioned.seasonSystem?.seasonNoticePending).toBe(true);
    expect(
      transitioned.memoryAlbum.memories.some((m) =>
        m.uniqueKey?.startsWith('season_transition_autumn')
      )
    ).toBe(true);
  });
});
