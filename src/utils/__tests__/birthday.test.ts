import { describe, expect, it } from 'vitest';
import {
  getBirthdayStatusForPet,
  reserveBirthdayCake,
  resolveCelebrationDateInYear,
  syncBirthdaySystemState,
  updatePetBirthday,
} from '../birthday';
import { createInitialGameState } from '../storage';
import { createActivePet } from './testHelpers';

describe('birthday pure logic & cross-day sync', () => {
  it('handles Feb 29 leap-year celebration choice (Feb 28 vs Mar 1 in non-leap year)', () => {
    const feb28Date = resolveCelebrationDateInYear(
      { month: 2, day: 29, leapYearChoice: 'feb28', updatedAt: 0, customized: true },
      2026
    );
    const mar1Date = resolveCelebrationDateInYear(
      { month: 2, day: 29, leapYearChoice: 'mar1', updatedAt: 0, customized: true },
      2026
    );
    const leapYearDate = resolveCelebrationDateInYear(
      { month: 2, day: 29, leapYearChoice: 'mar1', updatedAt: 0, customized: true },
      2024
    );

    expect(feb28Date.getMonth()).toBe(1);
    expect(feb28Date.getDate()).toBe(28);
    expect(mar1Date.getMonth()).toBe(2);
    expect(mar1Date.getDate()).toBe(1);
    expect(leapYearDate.getMonth()).toBe(1);
    expect(leapYearDate.getDate()).toBe(29);
  });

  it('calculates countdown, birthday day, and 3-day review period accurately', () => {
    let state = createActivePet(createInitialGameState());
    state = updatePetBirthday(state, state.pets[0].id, 5, 10, 'mar1').nextState;
    const pet = state.pets[0];

    const threeDaysBefore = getBirthdayStatusForPet(pet, new Date(2026, 4, 7, 12, 0, 0));
    expect(threeDaysBefore.phase).toBe('countdown');
    expect(threeDaysBefore.daysUntil).toBe(3);

    const onBirthday = getBirthdayStatusForPet(pet, new Date(2026, 4, 10, 12, 0, 0));
    expect(onBirthday.phase).toBe('birthday');
    expect(onBirthday.isTodayBirthday).toBe(true);

    const twoDaysAfter = getBirthdayStatusForPet(pet, new Date(2026, 4, 12, 12, 0, 0));
    expect(twoDaysAfter.phase).toBe('review');
    expect(twoDaysAfter.isReviewPeriod).toBe(true);
  });

  it('syncs tasks and orders cleanly across midnight without losing unrelated game state', () => {
    const day1 = new Date(2026, 10, 26, 20, 0, 0);
    const day2 = new Date(2026, 10, 27, 8, 0, 0);

    let state = syncBirthdaySystemState(createActivePet(createInitialGameState()), day1);
    state = reserveBirthdayCake(state, state.pets[0].id, 'strawberry_cream_cake').nextState;
    const prevCoins = state.coins;
    const day1Tickets = state.birthdaySystem!.tickets.balance;

    // Modify task progress on day 1
    state = {
      ...state,
      birthdaySystem: {
        ...state.birthdaySystem!,
        tasks: state.birthdaySystem!.tasks.map((t, i) =>
          i === 0 ? { ...t, progress: t.target, completed: true } : t
        ),
      },
    };

    const rolled = syncBirthdaySystemState(state, day2);
    expect(rolled.coins).toBe(prevCoins);
    expect(rolled.birthdaySystem?.dailyDate).toBe('2026-11-27');
    expect(rolled.birthdaySystem?.tasks.every((t) => t.progress === 0 && !t.completed)).toBe(
      true
    );
    expect(rolled.birthdaySystem?.orders.every((o) => o.dateKey === '2026-11-27')).toBe(
      true
    );
    expect(rolled.birthdaySystem?.reservedCakeByPetId[state.pets[0].id]).toBe(
      'strawberry_cream_cake'
    );
    expect(rolled.birthdaySystem?.tickets.balance).toBe(day1Tickets + 1);
  });
});
