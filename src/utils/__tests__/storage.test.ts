import { describe, expect, it } from 'vitest';
import { createInitialGameState, normalizeGameState } from '../storage';

describe('storage normalization & save compatibility', () => {
  it('hydrates initial GameState with valid single-player defaults for all subsystems', () => {
    const state = createInitialGameState();

    expect(state.pets.length).toBeGreaterThanOrEqual(1);
    expect(state.photoContest).toBeDefined();
    expect(state.birthdaySystem).toBeDefined();
    expect(state.seasonSystem).toBeDefined();
    expect(state.townMap).toBeDefined();
    expect(state.dialogue.weather.condition).toBe('clear');
  });

  it('normalizes partial/older saved payloads without dropping existing user progress', () => {
    const base = createInitialGameState();
    const legacyLike = {
      ...base,
      coins: 999,
      photoContest: undefined,
      birthdaySystem: undefined,
      seasonSystem: undefined,
    };

    const normalized = normalizeGameState(legacyLike);
    expect(normalized).not.toBeNull();
    expect(normalized!.coins).toBeGreaterThanOrEqual(999);
    expect(normalized!.photoContest).toBeDefined();
    expect(normalized!.birthdaySystem).toBeDefined();
    expect(normalized!.seasonSystem).toBeDefined();
  });

  it('returns null for malformed non-object save payloads', () => {
    expect(normalizeGameState(null)).toBeNull();
    expect(normalizeGameState('invalid')).toBeNull();
    expect(normalizeGameState([])).toBeNull();
  });
});
