import { describe, expect, it } from 'vitest';
import {
  DAILY_VOTE_LIMIT,
  PHOTO_CONTEST_SHOP_ITEMS,
  PHOTO_CONTEST_THEME_BY_ID,
  WEEKLY_VOTE_LIMIT,
} from '../../data/photoContest';
import { AccessorySlot } from '../../types';
import {
  buyPhotoContestShopItem,
  claimCoopPhotoReward,
  evaluatePhotoContestScore,
  getNextVotingPair,
  getPhotoContestSchedule,
  submitContestVote,
  submitCoopPhotoContestEntry,
  submitPhotoContestEntry,
  syncPhotoContestState,
  updateCoopPhotoDecor,
  updateCoopPhotoOutfit,
} from '../photoContest';
import { createActivePet, getLocalWeekKey } from './testHelpers';
import { createInitialGameState } from '../storage';

const EMPTY_EQUIPPED: Record<AccessorySlot, string | null> = {
  head: null,
  face: null,
  neck: null,
  body: null,
  held: null,
  back: null,
};

describe('photoContest pure logic (single-player & scoring)', () => {
  it('computes 0-100 weighted score and ranks S when full strawberry theme outfit and stage match', () => {
    const theme = PHOTO_CONTEST_THEME_BY_ID.strawberry_sweet;
    const state = createInitialGameState();
    const score = evaluatePhotoContestScore({
      equipped: {
        head: 'strawberry_clip',
        face: 'round_glasses',
        neck: 'strawberry_collar',
        body: 'strawberry_cape',
        held: 'strawberry_icecream',
        back: 'angel_feather_wings',
      },
      personality: state.personality,
      poseId: theme.preferredPoses[0],
      backgroundId: theme.preferredBackgroundIds[0],
      filterId: theme.preferredFilterIds[0],
      frameId: theme.preferredFrameIds[0],
      stickers: theme.preferredStickerIds.slice(0, 2),
      theme,
      votesReceived: 0,
    });

    expect(score.hasRequiredAccessory).toBe(true);
    expect(score.themeMatch).toBeGreaterThanOrEqual(36);
    expect(score.outfitCompleteness).toBe(25);
    expect(score.photoCompletion).toBe(20);
    expect(score.totalScore).toBeGreaterThanOrEqual(90);
    expect(score.rank).toBe('S');
  });

  it('caps themeMatch to <= 16 and records helpful note when missing required accessory', () => {
    const theme = PHOTO_CONTEST_THEME_BY_ID.forest_camp;
    const state = createInitialGameState();
    const score = evaluatePhotoContestScore({
      equipped: EMPTY_EQUIPPED,
      personality: state.personality,
      poseId: 'happy',
      backgroundId: 'pink_room',
      filterId: 'none',
      frameId: 'none',
      stickers: [],
      theme,
      votesReceived: 0,
    });

    expect(score.hasRequiredAccessory).toBe(false);
    expect(score.themeMatch).toBeLessThanOrEqual(16);
    expect(score.totalScore).toBeLessThan(50);
    expect(score.notes.length).toBeGreaterThan(0);
  });

  it('detects creation phase Mon-Thu and voting phase Fri-Sun based on local date', () => {
    const wednesday = new Date(2026, 10, 25, 14, 0, 0); // Wed Nov 25 2026
    const saturday = new Date(2026, 10, 28, 14, 0, 0); // Sat Nov 28 2026

    const wedSchedule = getPhotoContestSchedule(wednesday, 'strawberry_sweet');
    const satSchedule = getPhotoContestSchedule(saturday, 'strawberry_sweet');

    expect(wedSchedule.phase).toBe('creation');
    expect(satSchedule.phase).toBe('voting');
    expect(wedSchedule.weekKey).toBe(satSchedule.weekKey);
  });

  it('submits entry, grants coins/materials/tickets, and lets player spend tickets in shop', () => {
    const now = new Date(2026, 10, 25, 10, 0, 0);
    let state = createActivePet(createInitialGameState());
    state = {
      ...state,
      pets: state.pets.map((p, idx) =>
        idx === 0
          ? {
              ...p,
              accessories: {
                ...p.accessories,
                head: 'strawberry_clip',
                neck: 'strawberry_collar',
                body: 'strawberry_cape',
              },
            }
          : p
      ),
    };

    const submitRes = submitPhotoContestEntry(
      state,
      {
        userId: 'local',
        authorLabel: '飼主',
        title: '草莓小豬寫真',
        caption: '超可愛的一天',
        poseId: 'happy',
        facing: 'front',
        backgroundId: 'strawberry_field',
        filterId: 'none',
        frameId: 'rounded',
        stickers: ['strawberry', 'heart'],
      },
      now
    );

    expect(submitRes.nextState.coins).toBeGreaterThan(state.coins);
    expect(submitRes.nextState.photoContest?.tickets.balance).toBeGreaterThanOrEqual(10);
    expect(submitRes.nextState.house.photos[0]?.photoKind).toBe('contest');

    const shopItem = PHOTO_CONTEST_SHOP_ITEMS[0];
    const richState = {
      ...submitRes.nextState,
      photoContest: {
        ...submitRes.nextState.photoContest!,
        tickets: {
          ...submitRes.nextState.photoContest!.tickets,
          balance: shopItem.ticketPrice + 20,
        },
      },
    };

    const buyRes = buyPhotoContestShopItem(richState, shopItem.id, now);
    expect(buyRes.ok).toBe(true);
    expect(buyRes.nextState.photoContest?.tickets.balance).toBe(20);
    expect(buyRes.nextState.photoContest?.purchasedShopItemIds).toContain(shopItem.id);
  });

  it('enforces voting limits (10/day, 50/week) and prevents duplicate pair voting', () => {
    const now = new Date(2026, 10, 28, 12, 0, 0);
    let state = syncPhotoContestState(createInitialGameState(), now);

    const firstPair = getNextVotingPair(state, 'local', now);
    expect(firstPair).not.toBeNull();

    const voteRes = submitContestVote(
      state,
      {
        voterUserId: 'local',
        voterName: '飼主',
        leftSubmission: firstPair![0],
        rightSubmission: firstPair![1],
        chosenSubmissionId: firstPair![0].id,
      },
      now
    );
    expect(voteRes.ok).toBe(true);
    expect(voteRes.notice).toBe('謝謝你的投票！');
    expect(voteRes.unlockedMilestones).toContain(1);
    expect(voteRes.nextState.photoContest?.dailyVoteCount).toBe(1);

    const duplicateRes = submitContestVote(
      voteRes.nextState,
      {
        voterUserId: 'local',
        voterName: '飼主',
        leftSubmission: firstPair![0],
        rightSubmission: firstPair![1],
        chosenSubmissionId: firstPair![1].id,
      },
      now
    );
    expect(duplicateRes.ok).toBe(false);

    // Simulate reaching daily limit
    state = {
      ...voteRes.nextState,
      photoContest: {
        ...voteRes.nextState.photoContest!,
        dailyVoteCount: DAILY_VOTE_LIMIT,
      },
    };
    const nextPair = getNextVotingPair(state, 'local', now);
    expect(nextPair).not.toBeNull();
    const cappedDayRes = submitContestVote(
      state,
      {
        voterUserId: 'local',
        voterName: '飼主',
        leftSubmission: nextPair![0],
        rightSubmission: nextPair![1],
        chosenSubmissionId: nextPair![0].id,
      },
      now
    );
    expect(cappedDayRes.ok).toBe(false);

    // Crossing midnight resets dailyVoteCount while preserving weeklyVoteCount
    const tomorrow = new Date(2026, 10, 29, 9, 0, 0);
    const rolledState = syncPhotoContestState(
      {
        ...state,
        photoContest: {
          ...state.photoContest!,
          weeklyVoteCount: WEEKLY_VOTE_LIMIT - 1,
        },
      },
      tomorrow
    );
    expect(rolledState.photoContest?.dailyVoteCount).toBe(0);
    expect(rolledState.photoContest?.weeklyVoteCount).toBe(WEEKLY_VOTE_LIMIT - 1);
  });

  it('auto-settles previous week on Monday rollover and rotates without repeating theme', () => {
    const week1 = new Date(2026, 10, 25, 10, 0, 0);
    const week2 = new Date(2026, 11, 1, 10, 0, 0); // Next Tuesday

    let state = syncPhotoContestState(createInitialGameState(), week1);
    const week1ThemeId = state.photoContest!.currentThemeId;

    const subRes = submitPhotoContestEntry(
      state,
      {
        userId: 'local',
        authorLabel: '飼主',
        title: '第一週紀念',
        caption: '',
        poseId: 'happy',
        facing: 'front',
        backgroundId: 'pink_room',
        filterId: 'none',
        frameId: 'rounded',
        stickers: [],
      },
      week1
    );
    state = subRes.nextState;

    const settled = syncPhotoContestState(state, week2);
    expect(settled.photoContest?.currentWeekKey).toBe(getLocalWeekKey(week2));
    expect(settled.photoContest?.currentThemeId).not.toBe(week1ThemeId);
    expect(settled.photoContest?.settledWeeks.length).toBe(1);
    expect(settled.photoContest?.pendingWeekSettlementNotice?.themeId).toBe(week1ThemeId);
  });

  it('completes duo photo contest tasks in single-player mode and grants reward once', () => {
    const now = new Date(2026, 10, 25, 11, 0, 0);
    let state = syncPhotoContestState(createActivePet(createInitialGameState()), now);
    const theme = PHOTO_CONTEST_THEME_BY_ID[state.photoContest!.currentThemeId];
    const matchingAcc = theme.requiredAccessoryIds[0];

    state = {
      ...state,
      pets: state.pets.map((p, i) =>
        i === 0 ? { ...p, accessories: { ...p.accessories, head: matchingAcc } } : p
      ),
    };

    // Progress outfit x2, decor x2, vote x3, submit x1
    state = updateCoopPhotoOutfit(state, 'local', '飼主', 'happy', now).nextState;
    state = updateCoopPhotoOutfit(state, 'local', '飼主', 'happy', now).nextState;
    state = updateCoopPhotoDecor(
      state,
      'local',
      '飼主',
      { backgroundId: 'pink_room', filterId: 'none', frameId: 'rounded', stickers: [] },
      now
    ).nextState;
    state = updateCoopPhotoDecor(
      state,
      'local',
      '飼主',
      { backgroundId: 'pink_room', filterId: 'none', frameId: 'rounded', stickers: [] },
      now
    ).nextState;

    for (let i = 0; i < 10; i += 1) {
      const pair = getNextVotingPair(state, 'local', now)!;
      state = submitContestVote(
        state,
        {
          voterUserId: 'local',
          voterName: '飼主',
          leftSubmission: pair[0],
          rightSubmission: pair[1],
          chosenSubmissionId: pair[0].id,
        },
        now
      ).nextState;
    }

    const duoRes = submitCoopPhotoContestEntry(
      state,
      {
        userId: 'local',
        userName: '飼主',
        partnerPet: { ...state.pets[0], id: 'pet_2', name: '雪球' },
        title: '雙寵合影',
        caption: '一起拍美照',
        poseId: 'happy',
        facing: 'front',
        backgroundId: 'pink_room',
        filterId: 'none',
        frameId: 'rounded',
        stickers: [],
      },
      now
    );
    expect(duoRes.ok).toBe(true);
    expect(duoRes.nextState.coop.coopPhotoSession?.completed).toBe(true);

    const claim1 = claimCoopPhotoReward(duoRes.nextState, 'local', now);
    expect(claim1.ok).toBe(true);
    const claim2 = claimCoopPhotoReward(claim1.nextState, 'local', now);
    expect(claim2.ok).toBe(false);
  });
});
