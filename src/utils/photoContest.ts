import { ACCESSORIES } from '../data/accessories';
import {
  COOP_CONTEST_TICKETS,
  COOP_PHOTO_REWARDS,
  CONTEST_CHAMPION_FRAME_ID,
  DAILY_VOTE_LIMIT,
  MAX_POPULARITY_BONUS_POINTS,
  OUTFIT_SLOT_SCORE_WEIGHTS,
  PHOTO_CONTEST_SHOP_ITEM_BY_ID,
  PHOTO_CONTEST_THEMES,
  PHOTO_CONTEST_THEME_BY_ID,
  SUBMIT_BASE_TICKETS,
  VOTE_MILESTONE_CONFIGS,
  WEEKLY_VOTE_LIMIT,
  buildInitialCoopPhotoSteps,
  buildShowcaseEntriesForTheme,
  getRankTierForScore,
} from '../data/photoContest';
import { getTitleDefinition } from '../data/encyclopedia';
import {
  Accessory,
  AccessorySlot,
  CoopHubState,
  CoopOfflineEvent,
  CoopPhotoSession,
  DuoPhotoPetInfo,
  GameState,
  Pet,
  PetPersonality,
  PetViewDirection,
  PhotoBackground,
  PhotoContestId,
  PhotoContestPhase,
  PhotoContestSettlementRecord,
  PhotoContestState,
  PhotoContestTheme,
  PhotoCurrency,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScore,
  PhotoStickerId,
  PhotoSubmission,
  PhotoVote,
  RoomPhotoRecord,
  TitleId,
} from '../types';
import { recordMemoryEntry } from './memories';
import { getActivePet, getPetDisplayPersonality, updatePetById } from './pets';
import {
  createInitialPhotoStudioState,
  getLocalWeekKey,
  getLocalWeekStart,
} from './photoStudio';

const ACCESSORY_BY_ID = new Map<string, Accessory>(ACCESSORIES.map((a) => [a.id, a]));

function formatDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekIndexFromKey(weekKey: string): number {
  const parts = weekKey.split('-').map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return 0;
  const utcDays = Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
  return Math.max(0, Math.floor(utcDays / 7));
}

function getPreviousWeekKey(weekKey: string): string {
  const parts = weekKey.split('-').map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return '';
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() - 7);
  return formatDateKey(dt);
}

function formatDurationText(diffMs: number): string {
  const safe = Math.max(0, diffMs);
  const totalMinutes = Math.floor(safe / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} 天 ${hours} 小時`;
  if (hours > 0) return `${hours} 小時 ${minutes} 分`;
  return `${Math.max(1, minutes)} 分`;
}

export interface PhotoContestScheduleInfo {
  weekKey: string;
  phase: PhotoContestPhase;
  phaseLabel: string;
  phaseBadgeClass: string;
  phaseRuleSummary: string;
  remainingPhaseText: string;
  remainingWeekText: string;
  theme: PhotoContestTheme;
}

export function getPhotoContestThemeForWeek(
  weekKey: string,
  avoidThemeId?: PhotoContestId | null
): PhotoContestTheme {
  const total = PHOTO_CONTEST_THEMES.length;
  let idx = Math.abs(getWeekIndexFromKey(weekKey)) % total;
  let candidate = PHOTO_CONTEST_THEMES[idx];
  if (avoidThemeId && candidate.id === avoidThemeId && total > 1) {
    idx = (idx + 1) % total;
    candidate = PHOTO_CONTEST_THEMES[idx];
  }
  return candidate;
}

export function getPhotoContestSchedule(
  now: Date = new Date(),
  overrideThemeId?: PhotoContestId | null
): PhotoContestScheduleInfo {
  const weekStart = getLocalWeekStart(now);
  const weekKey = formatDateKey(weekStart);
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon ... 4=Thu, 5=Fri, 6=Sat

  const votingStart = new Date(weekStart);
  votingStart.setDate(weekStart.getDate() + 4); // Friday 00:00
  votingStart.setHours(0, 0, 0, 0);

  const nextMonday = new Date(weekStart);
  nextMonday.setDate(weekStart.getDate() + 7);
  nextMonday.setHours(0, 0, 0, 0);

  const isCreation = dayOfWeek >= 1 && dayOfWeek <= 4;
  const phase: PhotoContestPhase = isCreation ? 'creation' : 'voting';

  const remainingToPhaseMs = isCreation
    ? votingStart.getTime() - now.getTime()
    : nextMonday.getTime() - now.getTime();
  const remainingToWeekMs = nextMonday.getTime() - now.getTime();

  const theme =
    (overrideThemeId ? PHOTO_CONTEST_THEME_BY_ID[overrideThemeId] : null) ??
    getPhotoContestThemeForWeek(weekKey);

  return {
    weekKey,
    phase,
    phaseLabel: phase === 'creation' ? '創作期（週一～週四）' : '投票期（週五～週日）',
    phaseBadgeClass:
      phase === 'creation'
        ? 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]'
        : 'bg-[#E6F8F1] border-[#8AD8BA] text-[#1D6B52]',
    phaseRuleSummary:
      phase === 'creation'
        ? '週一 00:00 公布主題，週四 23:59 前穿搭拍照投稿；週五進入投票期，下週一 00:00 結算！'
        : '週五～週日為匿名配對投票期，仍可補交作品參賽；下週一 00:00 自動結算！',
    remainingPhaseText: `距離${phase === 'creation' ? '投票期' : '結算'}剩 ${formatDurationText(
      remainingToPhaseMs
    )}`,
    remainingWeekText: `本週剩餘 ${formatDurationText(remainingToWeekMs)}`,
    theme,
  };
}

export function isAccessoryMatchingTheme(
  acc: Accessory | undefined,
  theme: PhotoContestTheme
): boolean {
  if (!acc) return false;
  if (theme.requiredAccessoryIds.includes(acc.id)) return true;
  if (acc.theme && theme.requiredAccessoryThemes.includes(acc.theme)) return true;
  const text = `${acc.name} ${acc.description}`.toLowerCase();
  return theme.requiredKeywordTags.some((kw) => text.includes(kw.toLowerCase()));
}

export function evaluatePhotoContestScore(params: {
  equipped: Record<AccessorySlot, string | null>;
  personality: PetPersonality;
  poseId: PhotoPose;
  backgroundId: PhotoBackground;
  filterId: PhotoFilter;
  frameId: PhotoFrame;
  stickers: PhotoStickerId[];
  theme: PhotoContestTheme;
  votesReceived?: number;
}): PhotoScore {
  const {
    equipped,
    personality,
    poseId,
    backgroundId,
    filterId,
    frameId,
    stickers,
    theme,
    votesReceived = 0,
  } = params;

  const notes: string[] = [];
  let matchingAccessoryCount = 0;
  let outfitCompleteness = 0;
  let equippedSlotCount = 0;

  (Object.keys(OUTFIT_SLOT_SCORE_WEIGHTS) as AccessorySlot[]).forEach((slot) => {
    const accId = equipped[slot];
    if (!accId) return;
    equippedSlotCount += 1;
    outfitCompleteness += OUTFIT_SLOT_SCORE_WEIGHTS[slot];
    const acc = ACCESSORY_BY_ID.get(accId);
    if (isAccessoryMatchingTheme(acc, theme)) {
      matchingAccessoryCount += 1;
    }
  });

  const hasRequiredAccessory = matchingAccessoryCount > 0;
  const bgMatched = theme.preferredBackgroundIds.includes(backgroundId);
  const filterMatched = theme.preferredFilterIds.includes(filterId);
  const frameMatched = theme.preferredFrameIds.includes(frameId);
  const stickerMatched = stickers.some((s) => theme.preferredStickerIds.includes(s));
  const poseMatched = theme.preferredPoses.includes(poseId);
  const personalityMatched = theme.preferredPersonalityIds.includes(personality.primary);

  // 1. 主題符合度 40% (max 40)
  let themeMatch = 0;
  if (!hasRequiredAccessory) {
    themeMatch = (bgMatched ? 7 : 2) + (filterMatched ? 5 : 1) + (frameMatched ? 3 : 0);
    themeMatch = Math.min(16, themeMatch);
    notes.push(`尚未穿戴必備條件：${theme.requiredConditionText}`);
  } else {
    const accPoints = Math.min(34, 24 + (matchingAccessoryCount - 1) * 5);
    const stageThemeBonus = (bgMatched ? 3 : 0) + (filterMatched ? 3 : 0);
    themeMatch = Math.min(40, accPoints + stageThemeBonus);
    notes.push(`已達成主題必備條件（符合配件 ${matchingAccessoryCount} 件）`);
  }

  // 2. 穿搭完整度 25% (max 25)
  if (outfitCompleteness >= 22) {
    notes.push('全身 6 部位穿搭極為完整！');
  } else if (outfitCompleteness < 15) {
    notes.push('多搭配頭／臉／頸／身體／手持／背部配件可大幅提升穿搭分');
  }

  // 3. 照片完成度 20% (max 20)
  const bgPoints = bgMatched ? 5 : 4;
  const filterPoints = filterMatched ? 5 : filterId !== 'none' ? 4 : 2;
  const framePoints = frameMatched ? 5 : frameId !== 'none' ? 4 : 2;
  const detailPoints =
    stickers.length >= 2 && poseMatched
      ? 5
      : stickers.length >= 1 || poseId !== 'happy'
      ? 4
      : 2;
  const photoCompletion = Math.min(20, bgPoints + filterPoints + framePoints + detailPoints);

  // 4. 創意加分 10% (max 10)
  let colorHarmony = 1;
  if (bgMatched && filterMatched) {
    colorHarmony = 5;
  } else if (bgMatched || filterMatched || frameMatched) {
    colorHarmony = 3;
  } else if (filterId !== 'none' && frameId !== 'none') {
    colorHarmony = 2;
  }
  const poseBonus = poseMatched ? 3 : poseId !== 'happy' ? 2 : 1;
  const personalityBonus = personalityMatched ? 2 : 1;
  const creativityBonus = Math.min(10, colorHarmony + poseBonus + personalityBonus);

  // 5. 人氣投票 5% (max 5)
  const popularityVotes = Math.min(MAX_POPULARITY_BONUS_POINTS, Math.max(0, votesReceived));

  const totalScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        themeMatch + outfitCompleteness + photoCompletion + creativityBonus + popularityVotes
      )
    )
  );
  const rank = getRankTierForScore(totalScore).rank;

  return {
    themeMatch,
    outfitCompleteness,
    photoCompletion,
    creativityBonus,
    popularityVotes,
    totalScore,
    rank,
    hasRequiredAccessory,
    matchingAccessoryCount,
    equippedSlotCount,
    notes,
  };
}

export function createInitialPhotoCurrency(): PhotoCurrency {
  return {
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    history: [],
  };
}

export function addPhotoTickets(
  currency: PhotoCurrency,
  delta: number,
  reason: string
): PhotoCurrency {
  if (delta <= 0) return currency;
  const tx = {
    id: `ptx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    delta,
    reason,
    createdAt: Date.now(),
  };
  return {
    balance: currency.balance + delta,
    totalEarned: currency.totalEarned + delta,
    totalSpent: currency.totalSpent,
    history: [tx, ...currency.history].slice(0, 30),
  };
}

export function spendPhotoTickets(
  currency: PhotoCurrency,
  cost: number,
  reason: string
): { ok: boolean; currency: PhotoCurrency } {
  if (cost <= 0 || currency.balance < cost) {
    return { ok: false, currency };
  }
  const tx = {
    id: `ptx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    delta: -cost,
    reason,
    createdAt: Date.now(),
  };
  return {
    ok: true,
    currency: {
      balance: currency.balance - cost,
      totalEarned: currency.totalEarned,
      totalSpent: currency.totalSpent + cost,
      history: [tx, ...currency.history].slice(0, 30),
    },
  };
}

export function createInitialPhotoContestState(now: Date = new Date()): PhotoContestState {
  const weekKey = getLocalWeekKey(now);
  const todayKey = formatDateKey(now);
  const theme = getPhotoContestThemeForWeek(weekKey);
  return {
    currentWeekKey: weekKey,
    currentThemeId: theme.id,
    tickets: createInitialPhotoCurrency(),
    submissions: [],
    bestSubmissionByWeek: {},
    votes: [],
    votedPairKeys: [],
    dailyVoteDate: todayKey,
    dailyVoteCount: 0,
    weeklyVoteWeekKey: weekKey,
    weeklyVoteCount: 0,
    claimedVoteMilestones: [],
    purchasedShopItemIds: [],
    settledWeeks: [],
    lastSeenWeekKey: weekKey,
    pendingWeekSettlementNotice: null,
  };
}

export function getPhotoContestState(
  state: GameState,
  now: Date = new Date()
): PhotoContestState {
  return state.photoContest ?? createInitialPhotoContestState(now);
}

function grantStudioRewardToState(
  state: GameState,
  rewardKind: 'frame' | 'filter' | 'background' | 'title',
  targetId: string
): GameState {
  const baseStudio = state.photoStudio ?? createInitialPhotoStudioState();
  if (rewardKind === 'frame') {
    const frameId = targetId as PhotoFrame;
    const unlockedFrames = Array.from(new Set([...baseStudio.unlockedFrames, frameId]));
    const albumFrames = Array.from(
      new Set([...state.memoryAlbum.unlockedPhotoFrames, frameId])
    );
    return {
      ...state,
      photoStudio: { ...baseStudio, unlockedFrames },
      memoryAlbum: { ...state.memoryAlbum, unlockedPhotoFrames: albumFrames },
    };
  }
  if (rewardKind === 'filter') {
    const filterId = targetId as PhotoFilter;
    return {
      ...state,
      photoStudio: {
        ...baseStudio,
        unlockedFilters: Array.from(new Set([...baseStudio.unlockedFilters, filterId])),
      },
    };
  }
  if (rewardKind === 'background') {
    const bgId = targetId as PhotoBackground;
    return {
      ...state,
      photoStudio: {
        ...baseStudio,
        unlockedBackgrounds: Array.from(new Set([...baseStudio.unlockedBackgrounds, bgId])),
      },
    };
  }
  const titleId = targetId as TitleId;
  const unlockedTitles = Array.from(
    new Set([...state.encyclopedia.unlockedTitles, titleId])
  );
  return {
    ...state,
    encyclopedia: {
      ...state.encyclopedia,
      unlockedTitles,
      activeTitle: state.encyclopedia.activeTitle ?? unlockedTitles[0] ?? null,
    },
  };
}

export function syncPhotoContestState(
  state: GameState,
  now: Date = new Date()
): GameState {
  const currentWeekKey = getLocalWeekKey(now);
  const todayKey = formatDateKey(now);
  const prevContest = getPhotoContestState(state, now);

  let nextState = state;
  let nextContest = prevContest;

  if (nextContest.dailyVoteDate !== todayKey) {
    nextContest = {
      ...nextContest,
      dailyVoteDate: todayKey,
      dailyVoteCount: 0,
    };
  }

  if (nextContest.currentWeekKey !== currentWeekKey) {
    const oldWeekKey = nextContest.currentWeekKey;
    const oldTheme =
      PHOTO_CONTEST_THEME_BY_ID[nextContest.currentThemeId] ??
      getPhotoContestThemeForWeek(oldWeekKey);

    const oldWeekSubs = nextContest.submissions.filter(
      (s) => s.contestWeekKey === oldWeekKey && !s.isShowcaseEntry
    );
    const sortedBest = [...oldWeekSubs].sort(
      (a, b) => b.score.totalScore - a.score.totalScore
    );
    const bestSub = sortedBest[0] ?? null;
    const oldVotesCount = nextContest.votes.filter(
      (v) => v.contestWeekKey === oldWeekKey
    ).length;

    let extraSummary = '本週已自動安穩結算，新主題已開啟！';
    let settlementRecord: PhotoContestSettlementRecord | null = null;
    const alreadySettled = nextContest.settledWeeks.some((r) => r.weekKey === oldWeekKey);

    if (!alreadySettled && (oldWeekSubs.length > 0 || oldVotesCount > 0)) {
      const rankTier = bestSub ? getRankTierForScore(bestSub.score.totalScore) : null;
      if (bestSub && rankTier && ['S', 'A', 'B'].includes(rankTier.rank)) {
        nextState = grantStudioRewardToState(
          nextState,
          oldTheme.rewardKind,
          oldTheme.rewardTargetId
        );
        extraSummary = `最佳作品 ${bestSub.score.totalScore} 分（${rankTier.rank} 級），解鎖本週限定「${oldTheme.rewardLabel}」！`;
      } else if (bestSub) {
        extraSummary = `最佳作品 ${bestSub.score.totalScore} 分（${bestSub.score.rank} 級），已存入作品牆回憶！`;
      } else {
        extraSummary = `上週共參與投票 ${oldVotesCount} 次，本週新主題開跑囉！`;
      }

      const weekTicketsEarned = oldWeekSubs.reduce((sum, s) => sum + s.rewardTickets, 0);
      settlementRecord = {
        weekKey: oldWeekKey,
        themeId: oldTheme.id,
        themeName: oldTheme.name,
        bestScore: bestSub?.score.totalScore ?? 0,
        bestRank: bestSub?.score.rank ?? null,
        submissionsCount: oldWeekSubs.length,
        votesCastCount: oldVotesCount,
        ticketsEarned: weekTicketsEarned,
        rewardSummary: extraSummary,
        settledAt: now.getTime(),
      };
    }

    const nextTheme = getPhotoContestThemeForWeek(currentWeekKey, oldTheme.id);

    nextContest = {
      ...nextContest,
      currentWeekKey,
      currentThemeId: nextTheme.id,
      weeklyVoteWeekKey: currentWeekKey,
      weeklyVoteCount: 0,
      claimedVoteMilestones: [],
      votedPairKeys: [],
      settledWeeks: settlementRecord
        ? [settlementRecord, ...nextContest.settledWeeks].slice(0, 24)
        : nextContest.settledWeeks,
      pendingWeekSettlementNotice:
        settlementRecord ?? nextContest.pendingWeekSettlementNotice,
      lastSeenWeekKey: currentWeekKey,
    };
  }

  if (nextContest.weeklyVoteWeekKey !== currentWeekKey) {
    nextContest = {
      ...nextContest,
      weeklyVoteWeekKey: currentWeekKey,
      weeklyVoteCount: 0,
      claimedVoteMilestones: [],
      votedPairKeys: [],
    };
  }

  if (nextContest === prevContest && nextState === state) {
    return state;
  }

  return {
    ...nextState,
    photoContest: nextContest,
  };
}

export function dismissContestSettlementNotice(state: GameState): GameState {
  const contest = getPhotoContestState(state);
  if (!contest.pendingWeekSettlementNotice) return state;
  return {
    ...state,
    photoContest: {
      ...contest,
      pendingWeekSettlementNotice: null,
    },
  };
}

export interface SubmitPhotoContestResult {
  nextState: GameState;
  submission: PhotoSubmission;
  roomPhoto: RoomPhotoRecord;
  unlockedNotices: string[];
}

export function submitPhotoContestEntry(
  state: GameState,
  params: {
    userId: string;
    authorLabel: string;
    title: string;
    caption: string;
    poseId: PhotoPose;
    facing: PetViewDirection;
    backgroundId: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
    isCoop?: boolean;
    duoPet?: DuoPhotoPetInfo;
  },
  now: Date = new Date()
): SubmitPhotoContestResult {
  const syncedState = syncPhotoContestState(state, now);
  const contest = getPhotoContestState(syncedState, now);
  const theme =
    PHOTO_CONTEST_THEME_BY_ID[contest.currentThemeId] ??
    getPhotoContestThemeForWeek(contest.currentWeekKey);
  const pet = getActivePet(syncedState);
  const personality = getPetDisplayPersonality(syncedState, pet);

  const score = evaluatePhotoContestScore({
    equipped: pet.accessories,
    personality,
    poseId: params.poseId,
    backgroundId: params.backgroundId,
    filterId: params.filterId,
    frameId: params.frameId,
    stickers: params.stickers,
    theme,
    votesReceived: 0,
  });

  const tier = getRankTierForScore(score.totalScore);
  const ticketsGained =
    SUBMIT_BASE_TICKETS + tier.bonusTickets + (params.isCoop ? COOP_CONTEST_TICKETS : 0);

  const unlockedNotices: string[] = [];
  let updatedState: GameState = syncedState;
  let rewardFrameId: PhotoFrame | null = null;

  if (tier.grantsLimitedFrame) {
    rewardFrameId = CONTEST_CHAMPION_FRAME_ID;
    updatedState = grantStudioRewardToState(
      updatedState,
      'frame',
      CONTEST_CHAMPION_FRAME_ID
    );
    if (!syncedState.photoStudio?.unlockedFrames.includes(CONTEST_CHAMPION_FRAME_ID)) {
      unlockedNotices.push('達成 S 級評分！解鎖限定「比賽・金冠限定框」');
    }
  }

  // S/A 級即提前解鎖本週主題專屬獎勵項目
  if (score.rank === 'S' || score.rank === 'A') {
    const alreadyOwned =
      theme.rewardKind === 'frame'
        ? updatedState.photoStudio?.unlockedFrames.includes(
            theme.rewardTargetId as PhotoFrame
          )
        : theme.rewardKind === 'filter'
        ? updatedState.photoStudio?.unlockedFilters.includes(
            theme.rewardTargetId as PhotoFilter
          )
        : updatedState.photoStudio?.unlockedBackgrounds.includes(
            theme.rewardTargetId as PhotoBackground
          );
    updatedState = grantStudioRewardToState(
      updatedState,
      theme.rewardKind,
      theme.rewardTargetId
    );
    if (!alreadyOwned) {
      unlockedNotices.push(`榮獲 ${score.rank} 級佳績！提前解鎖主題獎勵「${theme.rewardLabel}」`);
    }
  }

  const createdAt = now.getTime();
  const roomPhotoId = `photo_contest_${createdAt}_${Math.random().toString(36).slice(2, 6)}`;
  const submissionId = `sub_${createdAt}_${Math.random().toString(36).slice(2, 6)}`;

  const cleanTitle =
    params.title.trim().slice(0, 20) ||
    `${pet.name}・${theme.name}`.slice(0, 20);
  const cleanCaption =
    params.caption.trim() ||
    `參加「${theme.name}」每週攝影比賽，獲得 ${score.totalScore} 分（${score.rank} 級）！`;

  const roomPhoto: RoomPhotoRecord = {
    id: roomPhotoId,
    title: cleanTitle,
    caption: cleanCaption,
    createdAt,
    houseName: updatedState.house.houseName,
    species: pet.species,
    petId: pet.id,
    petName: pet.name,
    equipped: { ...pet.accessories },
    poseId: 'normal',
    wallpaperId: updatedState.house.roomLayout.wallpaperId,
    flooringId: updatedState.house.roomLayout.flooringId,
    placedItems: [],
    photoKind: 'contest',
    scene: 'contest',
    wardrobePoseId: params.poseId,
    backgroundId: params.backgroundId,
    facing: params.facing,
    filterId: params.filterId,
    frameId: params.frameId,
    stickers: [...params.stickers],
    weightAtCapture: pet.weight,
    isCoopPhoto: params.isCoop ? true : undefined,
    duoPet: params.duoPet,
    challengeScore: score.totalScore,
    challengeWeekKey: contest.currentWeekKey,
    authorTitleId: updatedState.encyclopedia.activeTitle ?? null,
    likes: [],
    comments: [],
  };

  const submission: PhotoSubmission = {
    id: submissionId,
    contestWeekKey: contest.currentWeekKey,
    themeId: theme.id,
    authorUserId: params.userId || 'local',
    authorLabel: params.authorLabel.trim() || '我的萌寵',
    petId: pet.id,
    petName: pet.name,
    species: pet.species,
    equipped: { ...pet.accessories },
    poseId: params.poseId,
    facing: params.facing,
    backgroundId: params.backgroundId,
    filterId: params.filterId,
    frameId: params.frameId,
    stickers: [...params.stickers],
    title: cleanTitle,
    caption: cleanCaption,
    score,
    votesReceived: 0,
    rewardCoins: tier.coins,
    rewardMaterials: tier.materials,
    rewardTickets: ticketsGained,
    rewardFrameId,
    roomPhotoId,
    isCoop: Boolean(params.isCoop),
    duoPet: params.duoPet,
    createdAt,
  };

  const prevBestId = contest.bestSubmissionByWeek[contest.currentWeekKey];
  const prevBestSub = prevBestId
    ? contest.submissions.find((s) => s.id === prevBestId)
    : undefined;
  const nextBestId =
    !prevBestSub || submission.score.totalScore >= prevBestSub.score.totalScore
      ? submission.id
      : prevBestId;

  const baseStudio = updatedState.photoStudio ?? createInitialPhotoStudioState(now);
  const nextTickets = addPhotoTickets(
    contest.tickets,
    ticketsGained,
    `${theme.name}投稿（${score.rank}級）`
  );

  const prevCoopSubs = updatedState.coop.coopPhotoSubmissions ?? [];
  const nextCoopSubs = [
    submission,
    ...prevCoopSubs.filter((s) => s.id !== submission.id),
  ].slice(0, 30);

  let nextState: GameState = {
    ...updatedState,
    coins: updatedState.coins + tier.coins,
    house: {
      ...updatedState.house,
      photos: [roomPhoto, ...updatedState.house.photos].slice(0, 48),
    },
    coop: {
      ...updatedState.coop,
      coopPhotoSubmissions: nextCoopSubs,
    },
    photoStudio: {
      ...baseStudio,
      studioMaterials: baseStudio.studioMaterials + tier.materials,
    },
    photoContest: {
      ...contest,
      tickets: nextTickets,
      submissions: [submission, ...contest.submissions].slice(0, 60),
      bestSubmissionByWeek: {
        ...contest.bestSubmissionByWeek,
        [contest.currentWeekKey]: nextBestId,
      },
    },
  };

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `contest_submit_${contest.currentWeekKey}_${score.rank}`,
    petId: pet.id,
    type: 'photo_contest',
    title: `${theme.name}攝影比賽（${score.rank} 級・${score.totalScore} 分）`,
    description: `${pet.name}以「${cleanTitle}」參賽獲得 ${score.totalScore} 分！獲得 +${tier.coins} 金幣、+${ticketsGained} 攝影券。`,
    emoji: theme.emoji,
    photoId: roomPhotoId,
    dateKey: formatDateKey(now),
    isShared: params.isCoop,
  });

  return {
    nextState,
    submission,
    roomPhoto,
    unlockedNotices,
  };
}

export function makeCanonicalPairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}::${idB}` : `${idB}::${idA}`;
}

export function getVotingCandidatePool(
  state: GameState,
  currentUserId: string,
  now: Date = new Date()
): PhotoSubmission[] {
  const contest = getPhotoContestState(state, now);
  const weekKey = contest.currentWeekKey;
  const theme =
    PHOTO_CONTEST_THEME_BY_ID[contest.currentThemeId] ??
    getPhotoContestThemeForWeek(weekKey);
  const actorId = currentUserId || 'local';

  // Include partner/other co-op submissions + showcase entries, strictly excluding own submissions
  const coopSubs = (state.coop.coopPhotoSubmissions ?? []).filter(
    (s) =>
      s.contestWeekKey === weekKey &&
      s.authorUserId !== actorId &&
      !s.isCoop // or allow non-authored showcase
  );
  const showcaseSubs = buildShowcaseEntriesForTheme(theme, weekKey);
  const poolMap = new Map<string, PhotoSubmission>();
  for (const s of [...coopSubs, ...showcaseSubs]) {
    if (s.authorUserId !== actorId && !poolMap.has(s.id)) {
      poolMap.set(s.id, s);
    }
  }
  // Apply any locally accumulated vote counts
  const voteCounts = new Map<string, number>();
  for (const v of contest.votes) {
    if (v.contestWeekKey === weekKey) {
      voteCounts.set(v.chosenSubmissionId, (voteCounts.get(v.chosenSubmissionId) ?? 0) + 1);
    }
  }
  return Array.from(poolMap.values()).map((entry) => ({
    ...entry,
    votesReceived: entry.votesReceived + (voteCounts.get(entry.id) ?? 0),
  }));
}

export function getNextVotingPair(
  state: GameState,
  currentUserId: string,
  now: Date = new Date()
): [PhotoSubmission, PhotoSubmission] | null {
  const contest = getPhotoContestState(state, now);
  const pool = getVotingCandidatePool(state, currentUserId, now);
  if (pool.length < 2) return null;

  const votedSet = new Set(contest.votedPairKeys);
  const pairs: Array<[PhotoSubmission, PhotoSubmission]> = [];
  for (let i = 0; i < pool.length; i += 1) {
    for (let j = i + 1; j < pool.length; j += 1) {
      const key = makeCanonicalPairKey(pool[i].id, pool[j].id);
      if (!votedSet.has(key)) {
        pairs.push([pool[i], pool[j]]);
      }
    }
  }
  if (pairs.length > 0) {
    return pairs[contest.votes.length % pairs.length];
  }
  // If all unique pairs among NPC/partner entries were voted once, create rotated cross-theme showcase pairs so daily/weekly 10/50 caps remain reachable
  const otherTheme =
    PHOTO_CONTEST_THEMES.find((t) => t.id !== contest.currentThemeId) ??
    PHOTO_CONTEST_THEMES[0];
  const extraPool = [
    ...pool,
    ...buildShowcaseEntriesForTheme(otherTheme, contest.currentWeekKey).map((s, idx) => ({
      ...s,
      id: `${s.id}_ext_${contest.weeklyVoteCount}_${idx}`,
    })),
  ];
  for (let i = 0; i < extraPool.length; i += 1) {
    for (let j = i + 1; j < extraPool.length; j += 1) {
      const key = makeCanonicalPairKey(extraPool[i].id, extraPool[j].id);
      if (!votedSet.has(key)) {
        return [extraPool[i], extraPool[j]];
      }
    }
  }
  return [pool[0], pool[1]];
}

export interface SubmitContestVoteResult {
  ok: boolean;
  nextState: GameState;
  notice: string;
  unlockedMilestones: number[];
}

export function submitContestVote(
  state: GameState,
  params: {
    voterUserId: string;
    voterName: string;
    leftSubmission: PhotoSubmission;
    rightSubmission: PhotoSubmission;
    chosenSubmissionId: string;
  },
  now: Date = new Date()
): SubmitContestVoteResult {
  const syncedState = syncPhotoContestState(state, now);
  const contest = getPhotoContestState(syncedState, now);
  const voterId = params.voterUserId || 'local';

  if (
    params.chosenSubmissionId !== params.leftSubmission.id &&
    params.chosenSubmissionId !== params.rightSubmission.id
  ) {
    return {
      ok: false,
      nextState: syncedState,
      notice: '請選擇兩張參賽作品的其中一張投票喔！',
      unlockedMilestones: [],
    };
  }

  if (
    params.leftSubmission.authorUserId === voterId ||
    params.rightSubmission.authorUserId === voterId
  ) {
    return {
      ok: false,
      nextState: syncedState,
      notice: '無法替自己的作品投票，將寶貴一票投給其他小夥伴吧！',
      unlockedMilestones: [],
    };
  }

  const pairKey = makeCanonicalPairKey(
    params.leftSubmission.id,
    params.rightSubmission.id
  );
  if (contest.votedPairKeys.includes(pairKey)) {
    return {
      ok: false,
      nextState: syncedState,
      notice: '這組配對已經投過票囉，請看下一組作品！',
      unlockedMilestones: [],
    };
  }

  if (contest.dailyVoteCount >= DAILY_VOTE_LIMIT) {
    return {
      ok: false,
      nextState: syncedState,
      notice: `今日投票已達上限（${DAILY_VOTE_LIMIT} 次），明天再回來繼續評選吧！`,
      unlockedMilestones: [],
    };
  }

  if (contest.weeklyVoteCount >= WEEKLY_VOTE_LIMIT) {
    return {
      ok: false,
      nextState: syncedState,
      notice: `本週投票已達上限（${WEEKLY_VOTE_LIMIT} 次），感謝你本週的熱情評審！`,
      unlockedMilestones: [],
    };
  }

  const todayKey = formatDateKey(now);
  const vote: PhotoVote = {
    id: `pvote_${now.getTime()}_${Math.random().toString(36).slice(2, 6)}`,
    contestWeekKey: contest.currentWeekKey,
    dateKey: todayKey,
    voterUserId: voterId,
    leftSubmissionId: params.leftSubmission.id,
    rightSubmissionId: params.rightSubmission.id,
    chosenSubmissionId: params.chosenSubmissionId,
    createdAt: now.getTime(),
  };

  const nextWeeklyVoteCount = contest.weeklyVoteCount + 1;
  const nextDailyVoteCount = contest.dailyVoteCount + 1;

  let nextState = syncedState;
  let nextTickets = contest.tickets;
  let addedMaterials = 0;
  const unlockedMilestones: number[] = [];
  const nextClaimedMilestones = [...contest.claimedVoteMilestones];

  for (const ms of VOTE_MILESTONE_CONFIGS) {
    if (nextWeeklyVoteCount >= ms.votes && !nextClaimedMilestones.includes(ms.votes)) {
      nextClaimedMilestones.push(ms.votes);
      unlockedMilestones.push(ms.votes);
      addedMaterials += ms.rewardMaterials;
      if (ms.rewardTickets > 0) {
        nextTickets = addPhotoTickets(nextTickets, ms.rewardTickets, ms.label);
      }
      if (ms.rewardFrameId) {
        nextState = grantStudioRewardToState(nextState, 'frame', ms.rewardFrameId);
      }
    }
  }

  const baseStudio = nextState.photoStudio ?? createInitialPhotoStudioState(now);

  // Also credit co-op photo session vote task if active
  let nextCoop = nextState.coop;
  if (nextCoop.coopPhotoSession && nextCoop.coopPhotoSession.contestWeekKey === contest.currentWeekKey) {
    const sess = nextCoop.coopPhotoSession;
    const updatedSteps = sess.steps.map((step) => {
      if (step.key !== 'vote') return step;
      const nextProg = Math.min(step.target, step.progress + 1);
      const contributors = step.contributorUserIds.includes(voterId)
        ? step.contributorUserIds
        : [...step.contributorUserIds, voterId];
      const names = step.contributorNames.includes(params.voterName)
        ? step.contributorNames
        : [...step.contributorNames, params.voterName];
      return {
        ...step,
        progress: nextProg,
        contributorUserIds: contributors,
        contributorNames: names,
      };
    });
    const allDone = updatedSteps.every((s) => s.progress >= s.target);
    nextCoop = {
      ...nextCoop,
      coopPhotoSession: {
        ...sess,
        steps: updatedSteps,
        completed: sess.completed || allDone,
        completedAt: sess.completedAt ?? (allDone ? now.getTime() : null),
        lastUpdatedByName: params.voterName,
        lastUpdatedAt: now.getTime(),
      },
    };
  }

  // Update player's own submissions & shared co-op submissions popularity bonus
  const bumpSubmissionVote = (sub: PhotoSubmission): PhotoSubmission => {
    if (sub.id !== params.chosenSubmissionId) return sub;
    const nextVotes = sub.votesReceived + 1;
    const popBonus = Math.min(MAX_POPULARITY_BONUS_POINTS, nextVotes);
    const total = Math.min(
      100,
      sub.score.themeMatch +
        sub.score.outfitCompleteness +
        sub.score.photoCompletion +
        sub.score.creativityBonus +
        popBonus
    );
    return {
      ...sub,
      votesReceived: nextVotes,
      score: {
        ...sub.score,
        popularityVotes: popBonus,
        totalScore: total,
        rank: getRankTierForScore(total).rank,
      },
    };
  };

  const updatedSubmissions = contest.submissions.map(bumpSubmissionVote);
  const updatedCoopSubmissions = (nextCoop.coopPhotoSubmissions ?? []).map(
    bumpSubmissionVote
  );

  nextState = {
    ...nextState,
    coop: {
      ...nextCoop,
      coopPhotoSubmissions: updatedCoopSubmissions,
    },
    photoStudio: {
      ...baseStudio,
      studioMaterials: baseStudio.studioMaterials + addedMaterials,
    },
    photoContest: {
      ...contest,
      tickets: nextTickets,
      submissions: updatedSubmissions,
      votes: [vote, ...contest.votes].slice(0, 120),
      votedPairKeys: [...contest.votedPairKeys, pairKey].slice(-150),
      dailyVoteDate: todayKey,
      dailyVoteCount: nextDailyVoteCount,
      weeklyVoteWeekKey: contest.currentWeekKey,
      weeklyVoteCount: nextWeeklyVoteCount,
      claimedVoteMilestones: nextClaimedMilestones,
    },
  };

  if (unlockedMilestones.length > 0) {
    nextState = handleCoopPhotoSessionCompletionCheck(nextState, voterId, params.voterName, now);
  }

  return {
    ok: true,
    nextState,
    notice: '謝謝你的投票！',
    unlockedMilestones,
  };
}

export function isShopItemOwned(state: GameState, itemId: string): boolean {
  const item = PHOTO_CONTEST_SHOP_ITEM_BY_ID[itemId];
  if (!item) return false;
  const contest = getPhotoContestState(state);
  if (contest.purchasedShopItemIds.includes(itemId)) return true;
  if (item.category === 'frame') {
    return Boolean(state.photoStudio?.unlockedFrames.includes(item.targetId as PhotoFrame));
  }
  if (item.category === 'filter') {
    return Boolean(state.photoStudio?.unlockedFilters.includes(item.targetId as PhotoFilter));
  }
  if (item.category === 'background') {
    return Boolean(
      state.photoStudio?.unlockedBackgrounds.includes(item.targetId as PhotoBackground)
    );
  }
  return state.encyclopedia.unlockedTitles.includes(item.targetId as TitleId);
}

export function buyPhotoContestShopItem(
  state: GameState,
  itemId: string,
  now: Date = new Date()
): { ok: boolean; nextState: GameState; notice: string } {
  const syncedState = syncPhotoContestState(state, now);
  const item = PHOTO_CONTEST_SHOP_ITEM_BY_ID[itemId];
  if (!item) {
    return { ok: false, nextState: syncedState, notice: '找不到該商店商品' };
  }
  if (isShopItemOwned(syncedState, itemId)) {
    return { ok: false, nextState: syncedState, notice: '已擁有此獎勵！' };
  }
  const contest = getPhotoContestState(syncedState, now);
  const spendRes = spendPhotoTickets(
    contest.tickets,
    item.ticketPrice,
    `兌換「${item.name}」`
  );
  if (!spendRes.ok) {
    return {
      ok: false,
      nextState: syncedState,
      notice: `攝影券不足！需要 ${item.ticketPrice} 張攝影券（目前 ${contest.tickets.balance} 張）`,
    };
  }

  let nextState = grantStudioRewardToState(syncedState, item.category, item.targetId);
  nextState = {
    ...nextState,
    photoContest: {
      ...getPhotoContestState(nextState, now),
      tickets: spendRes.currency,
      purchasedShopItemIds: Array.from(
        new Set([...contest.purchasedShopItemIds, itemId])
      ),
    },
  };

  return {
    ok: true,
    nextState,
    notice: `成功使用 ${item.ticketPrice} 張攝影券兌換「${item.name}」！`,
  };
}

// =========================================================================
// Co-op Photo Contest Helpers
// =========================================================================

function appendPhotoContestOfflineEvent(
  coop: CoopHubState,
  actorUserId: string,
  actorName: string,
  summary: string
): CoopOfflineEvent[] {
  const entry: CoopOfflineEvent = {
    id: `coev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    actorUserId,
    actorName: actorName.trim() || '夥伴',
    gameType: 'photo_contest',
    summary,
    createdAt: Date.now(),
  };
  return [entry, ...coop.offlineEvents].slice(0, 20);
}

export function getOrCreateCoopPhotoSession(
  state: GameState,
  now: Date = new Date()
): CoopPhotoSession {
  const contest = getPhotoContestState(state, now);
  const existing = state.coop.coopPhotoSession;
  if (existing && existing.contestWeekKey === contest.currentWeekKey) {
    return existing;
  }
  const theme =
    PHOTO_CONTEST_THEME_BY_ID[contest.currentThemeId] ??
    getPhotoContestThemeForWeek(contest.currentWeekKey);
  return {
    id: `cphoto_${contest.currentWeekKey}`,
    contestWeekKey: contest.currentWeekKey,
    themeId: theme.id,
    steps: buildInitialCoopPhotoSteps(),
    draftPoseId: theme.preferredPoses[0] ?? 'happy',
    draftBackgroundId: theme.preferredBackgroundIds[0] ?? 'pink_room',
    draftFilterId: theme.preferredFilterIds[0] ?? 'none',
    draftFrameId: theme.preferredFrameIds[0] ?? 'rounded',
    draftStickers: theme.preferredStickerIds.slice(0, 2),
    submittedPhotoId: null,
    completed: false,
    completedAt: null,
    claimedByUserIds: [],
    lastUpdatedByName: null,
    lastUpdatedAt: null,
  };
}

function handleCoopPhotoSessionCompletionCheck(
  state: GameState,
  actorUserId: string,
  actorName: string,
  now: Date
): GameState {
  const session = state.coop.coopPhotoSession;
  if (!session) return state;
  const allDone = session.steps.every((s) => s.progress >= s.target);
  if (!allDone) return state;

  const weekKey = session.contestWeekKey;
  const prevWeek = getPreviousWeekKey(weekKey);
  let nextStreak = state.coop.photoContestStreakWeeks ?? 0;
  let lastWeek = state.coop.lastPhotoContestCoopWeek ?? null;

  if (lastWeek === weekKey) {
    nextStreak = Math.max(1, nextStreak);
  } else if (lastWeek === prevWeek) {
    nextStreak += 1;
  } else {
    nextStreak = 1;
  }
  lastWeek = weekKey;

  const nextBadges = [...state.coop.unlockedBadges];
  if (
    nextStreak >= COOP_PHOTO_REWARDS.streakBadgeWeeks &&
    !nextBadges.includes('photo_partner')
  ) {
    nextBadges.push('photo_partner');
  }

  const nextTitles = [...state.encyclopedia.unlockedTitles];
  if (
    nextStreak >= COOP_PHOTO_REWARDS.streakTitleWeeks &&
    !nextTitles.includes('best_photo_partner')
  ) {
    nextTitles.push('best_photo_partner');
  }

  const theme = PHOTO_CONTEST_THEME_BY_ID[session.themeId];
  let nextState: GameState = {
    ...state,
    encyclopedia: {
      ...state.encyclopedia,
      unlockedTitles: nextTitles,
      activeTitle: state.encyclopedia.activeTitle ?? nextTitles[0] ?? null,
    },
    coop: {
      ...state.coop,
      unlockedBadges: nextBadges,
      photoContestStreakWeeks: nextStreak,
      lastPhotoContestCoopWeek: lastWeek,
      coopPhotoSession: {
        ...session,
        completed: true,
        completedAt: session.completedAt ?? now.getTime(),
      },
      offlineEvents: appendPhotoContestOfflineEvent(
        state.coop,
        actorUserId,
        actorName,
        `已完成「${theme?.name ?? '本週'}」共養攝影比賽全部合作任務，雙方可領相同大獎！`
      ),
    },
  };

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `coop_photo_contest_${weekKey}`,
    type: 'photo_contest',
    title: `我們一起參加了${theme?.name ?? '主題'}攝影比賽！`,
    description: `兩人齊心完成「${theme?.name ?? '本週'}」共養穿搭、佈置、投票與參賽挑戰，連續合作 ${nextStreak} 週！`,
    emoji: theme?.emoji ?? '📸',
    dateKey: formatDateKey(now),
    actorName,
    isShared: true,
    photoId: session.submittedPhotoId ?? undefined,
  });

  return nextState;
}

export function updateCoopPhotoOutfit(
  state: GameState,
  userId: string,
  userName: string,
  poseId: PhotoPose,
  now: Date = new Date()
): { ok: boolean; nextState: GameState; notice: string } {
  const syncedState = syncPhotoContestState(state, now);
  const session = getOrCreateCoopPhotoSession(syncedState, now);
  const theme = PHOTO_CONTEST_THEME_BY_ID[session.themeId];
  const pet = getActivePet(syncedState);
  const hasThemeAcc = (Object.values(pet.accessories) as Array<string | null>).some(
    (id) => id && isAccessoryMatchingTheme(ACCESSORY_BY_ID.get(id), theme)
  );
  if (!hasThemeAcc) {
    return {
      ok: false,
      nextState: syncedState,
      notice: `請先在更衣室穿戴至少 1 件「${theme.name}」主題配件喔！`,
    };
  }

  const actor = userId || 'local';
  const cleanName = userName.trim() || '飼主';
  const updatedSteps = session.steps.map((step) => {
    if (step.key !== 'outfit') return step;
    const nextProgress = Math.min(step.target, step.progress + 1);
    const contributors = step.contributorUserIds.includes(actor)
      ? step.contributorUserIds
      : [...step.contributorUserIds, actor];
    const names = step.contributorNames.includes(cleanName)
      ? step.contributorNames
      : [...step.contributorNames, cleanName];
    return {
      ...step,
      progress: nextProgress,
      contributorUserIds: contributors,
      contributorNames: names,
    };
  });

  const outfitStep = updatedSteps.find((s) => s.key === 'outfit');
  const nextSession: CoopPhotoSession = {
    ...session,
    steps: updatedSteps,
    draftPoseId: poseId,
    lastUpdatedByName: cleanName,
    lastUpdatedAt: now.getTime(),
  };

  let nextState: GameState = {
    ...syncedState,
    coop: {
      ...syncedState.coop,
      coopPhotoSession: nextSession,
      offlineEvents: appendPhotoContestOfflineEvent(
        syncedState.coop,
        actor,
        cleanName,
        `完成了共養「${theme.name}」穿搭準備（穿搭已完成 ${outfitStep?.progress ?? 1} / 2）`
      ),
    },
  };
  nextState = handleCoopPhotoSessionCompletionCheck(nextState, actor, cleanName, now);

  return {
    ok: true,
    nextState,
    notice: `穿搭步驟更新成功！（穿搭已完成 ${outfitStep?.progress ?? 1} / 2）`,
  };
}

export function updateCoopPhotoDecor(
  state: GameState,
  userId: string,
  userName: string,
  decor: {
    backgroundId: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  },
  now: Date = new Date()
): { ok: boolean; nextState: GameState; notice: string } {
  const syncedState = syncPhotoContestState(state, now);
  const session = getOrCreateCoopPhotoSession(syncedState, now);
  const theme = PHOTO_CONTEST_THEME_BY_ID[session.themeId];
  const actor = userId || 'local';
  const cleanName = userName.trim() || '飼主';

  const updatedSteps = session.steps.map((step) => {
    if (step.key !== 'decor') return step;
    const nextProgress = Math.min(step.target, step.progress + 1);
    const contributors = step.contributorUserIds.includes(actor)
      ? step.contributorUserIds
      : [...step.contributorUserIds, actor];
    const names = step.contributorNames.includes(cleanName)
      ? step.contributorNames
      : [...step.contributorNames, cleanName];
    return {
      ...step,
      progress: nextProgress,
      contributorUserIds: contributors,
      contributorNames: names,
    };
  });

  const decorStep = updatedSteps.find((s) => s.key === 'decor');
  const nextSession: CoopPhotoSession = {
    ...session,
    steps: updatedSteps,
    draftBackgroundId: decor.backgroundId,
    draftFilterId: decor.filterId,
    draftFrameId: decor.frameId,
    draftStickers: [...decor.stickers],
    lastUpdatedByName: cleanName,
    lastUpdatedAt: now.getTime(),
  };

  let nextState: GameState = {
    ...syncedState,
    coop: {
      ...syncedState.coop,
      coopPhotoSession: nextSession,
      offlineEvents: appendPhotoContestOfflineEvent(
        syncedState.coop,
        actor,
        cleanName,
        `調整了「${theme.name}」共養攝影佈置與濾鏡（${decorStep?.progress ?? 1} / 2）`
      ),
    },
  };
  nextState = handleCoopPhotoSessionCompletionCheck(nextState, actor, cleanName, now);

  return {
    ok: true,
    nextState,
    notice: `共養攝影佈置已更新！（${decorStep?.progress ?? 1} / 2）`,
  };
}

export function submitCoopPhotoContestEntry(
  state: GameState,
  params: {
    userId: string;
    userName: string;
    partnerPet: Pet;
    title: string;
    caption: string;
    poseId: PhotoPose;
    facing: PetViewDirection;
    backgroundId: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  },
  now: Date = new Date()
): {
  ok: boolean;
  nextState: GameState;
  submission: PhotoSubmission;
  roomPhoto: RoomPhotoRecord;
  notice: string;
} {
  const syncedState = syncPhotoContestState(state, now);
  const session = getOrCreateCoopPhotoSession(syncedState, now);
  const theme = PHOTO_CONTEST_THEME_BY_ID[session.themeId];
  const actor = params.userId || 'local';
  const cleanName = params.userName.trim() || '飼主';

  const duoPet: DuoPhotoPetInfo = {
    petId: params.partnerPet.id,
    petName: params.partnerPet.name,
    species: params.partnerPet.species,
    equipped: { ...params.partnerPet.accessories },
    poseId: session.draftPoseId,
    facing: 'front',
    weightAtCapture: params.partnerPet.weight,
  };

  const res = submitPhotoContestEntry(
    syncedState,
    {
      userId: actor,
      authorLabel: `${cleanName} ＆ 夥伴`,
      title: params.title,
      caption: params.caption,
      poseId: params.poseId,
      facing: params.facing,
      backgroundId: params.backgroundId,
      filterId: params.filterId,
      frameId: params.frameId,
      stickers: params.stickers,
      isCoop: true,
      duoPet,
    },
    now
  );

  const updatedSteps = session.steps.map((step) => {
    if (step.key !== 'submit') return step;
    const contributors = step.contributorUserIds.includes(actor)
      ? step.contributorUserIds
      : [...step.contributorUserIds, actor];
    const names = step.contributorNames.includes(cleanName)
      ? step.contributorNames
      : [...step.contributorNames, cleanName];
    return {
      ...step,
      progress: 1,
      contributorUserIds: contributors,
      contributorNames: names,
    };
  });

  const nextSession: CoopPhotoSession = {
    ...session,
    steps: updatedSteps,
    submittedPhotoId: res.roomPhoto.id,
    lastUpdatedByName: cleanName,
    lastUpdatedAt: now.getTime(),
  };

  const existingCoopSubs = res.nextState.coop.coopPhotoSubmissions ?? [];
  let nextState: GameState = {
    ...res.nextState,
    coop: {
      ...res.nextState.coop,
      coopPhotoSession: nextSession,
      coopPhotoSubmissions: [res.submission, ...existingCoopSubs].slice(0, 30),
      offlineEvents: appendPhotoContestOfflineEvent(
        res.nextState.coop,
        actor,
        cleanName,
        `提交了「${theme.name}」共養比賽合照「${res.submission.title}」（${res.submission.score.totalScore} 分）`
      ),
    },
  };

  nextState = handleCoopPhotoSessionCompletionCheck(nextState, actor, cleanName, now);

  return {
    ok: true,
    nextState,
    submission: res.submission,
    roomPhoto: res.roomPhoto,
    notice: `共養比賽合照提交成功！獲得 ${res.submission.score.totalScore} 分（${res.submission.score.rank} 級）與 +${res.submission.rewardTickets} 攝影券！`,
  };
}

export function claimCoopPhotoReward(
  state: GameState,
  userId: string,
  now: Date = new Date()
): { ok: boolean; nextState: GameState; notice: string } {
  const syncedState = syncPhotoContestState(state, now);
  const session = syncedState.coop.coopPhotoSession;
  const actor = userId || 'local';

  if (!session || !session.completed) {
    return {
      ok: false,
      nextState: syncedState,
      notice: '請先完成全部 4 項共養攝影任務後再領取獎勵！',
    };
  }
  if (session.claimedByUserIds.includes(actor)) {
    return {
      ok: false,
      nextState: syncedState,
      notice: '你已經領取過本週共養攝影比賽獎勵囉！',
    };
  }

  const contest = getPhotoContestState(syncedState, now);
  const baseStudio = syncedState.photoStudio ?? createInitialPhotoStudioState(now);
  const nextTickets = addPhotoTickets(
    contest.tickets,
    COOP_PHOTO_REWARDS.tickets,
    '共養攝影比賽合作完賽獎勵'
  );

  const activePet = getActivePet(syncedState);
  const stateWithIntimacy = updatePetById(syncedState, activePet.id, (pet) => ({
    ...pet,
    intimacy: Math.min(100, pet.intimacy + COOP_PHOTO_REWARDS.intimacy),
  }));

  const streakWeeks = syncedState.coop.photoContestStreakWeeks ?? 1;
  const extraParts: string[] = [];
  if (streakWeeks === COOP_PHOTO_REWARDS.streakBadgeWeeks) {
    extraParts.push('解鎖徽章「攝影搭檔」');
  }
  if (streakWeeks === COOP_PHOTO_REWARDS.streakTitleWeeks) {
    extraParts.push(`解鎖稱號「${getTitleDefinition('best_photo_partner').name}」`);
  }

  return {
    ok: true,
    nextState: {
      ...stateWithIntimacy,
      coins: stateWithIntimacy.coins + COOP_PHOTO_REWARDS.coins,
      photoStudio: {
        ...baseStudio,
        studioMaterials: baseStudio.studioMaterials + COOP_PHOTO_REWARDS.materials,
      },
      photoContest: {
        ...contest,
        tickets: nextTickets,
      },
      coop: {
        ...syncedState.coop,
        coopPhotoSession: {
          ...session,
          claimedByUserIds: [...session.claimedByUserIds, actor],
        },
      },
    },
    notice: `領取共養攝影合作獎勵：+${COOP_PHOTO_REWARDS.coins} 金幣、+${COOP_PHOTO_REWARDS.materials} 攝影材料、+${COOP_PHOTO_REWARDS.tickets} 攝影券、親密度 +${COOP_PHOTO_REWARDS.intimacy}${
      extraParts.length > 0 ? ' · ' + extraParts.join(' · ') : ''
    }`,
  };
}

export function mergeCoopPhotoSession(
  localSession: CoopPhotoSession | null | undefined,
  remoteSession: CoopPhotoSession | null | undefined
): CoopPhotoSession | null {
  if (!localSession && !remoteSession) return null;
  if (!localSession) return remoteSession ?? null;
  if (!remoteSession) return localSession;
  if (localSession.contestWeekKey !== remoteSession.contestWeekKey) {
    return remoteSession.contestWeekKey > localSession.contestWeekKey
      ? remoteSession
      : localSession;
  }

  const mergedSteps = remoteSession.steps.map((rStep) => {
    const lStep = localSession.steps.find((s) => s.key === rStep.key);
    const maxProg = Math.min(
      rStep.target,
      Math.max(rStep.progress, lStep?.progress ?? 0)
    );
    return {
      ...rStep,
      progress: maxProg,
      contributorUserIds: Array.from(
        new Set([...rStep.contributorUserIds, ...(lStep?.contributorUserIds ?? [])])
      ),
      contributorNames: Array.from(
        new Set([...rStep.contributorNames, ...(lStep?.contributorNames ?? [])])
      ),
    };
  });
  const completed =
    remoteSession.completed ||
    localSession.completed ||
    mergedSteps.every((s) => s.progress >= s.target);

  return {
    ...remoteSession,
    steps: mergedSteps,
    submittedPhotoId: remoteSession.submittedPhotoId ?? localSession.submittedPhotoId,
    completed,
    completedAt:
      remoteSession.completedAt ?? localSession.completedAt ?? (completed ? Date.now() : null),
    claimedByUserIds: Array.from(
      new Set([...remoteSession.claimedByUserIds, ...localSession.claimedByUserIds])
    ),
  };
}

export function mergePhotoContestRemoteState(
  localContest: PhotoContestState | undefined,
  remoteContest: PhotoContestState | undefined,
  remoteCoopSubmissions?: PhotoSubmission[],
  now: Date = new Date()
): PhotoContestState {
  if (!localContest && !remoteContest) {
    return createInitialPhotoContestState(now);
  }
  if (!localContest) {
    return remoteContest!;
  }
  if (!remoteContest && (!remoteCoopSubmissions || remoteCoopSubmissions.length === 0)) {
    return localContest;
  }

  // Keep personal photoTickets, vote caps, personal submissions & purchased shop items local;
  // merge partner's vote boosts onto matching local submissions from remote state & coop pool.
  const remoteVoteCountById = new Map<string, number>();
  for (const rSub of [...(remoteContest?.submissions ?? []), ...(remoteCoopSubmissions ?? [])]) {
    const prev = remoteVoteCountById.get(rSub.id) ?? 0;
    if (rSub.votesReceived > prev) {
      remoteVoteCountById.set(rSub.id, rSub.votesReceived);
    }
  }
  if (remoteContest) {
    const voteTallies = new Map<string, number>();
    for (const v of remoteContest.votes) {
      voteTallies.set(v.chosenSubmissionId, (voteTallies.get(v.chosenSubmissionId) ?? 0) + 1);
    }
    for (const [subId, count] of voteTallies.entries()) {
      const prev = remoteVoteCountById.get(subId) ?? 0;
      if (count > prev) {
        remoteVoteCountById.set(subId, count);
      }
    }
  }

  let changed = false;
  const mergedSubmissions = localContest.submissions.map((sub) => {
    const remoteVotes = remoteVoteCountById.get(sub.id) ?? 0;
    if (remoteVotes <= sub.votesReceived) return sub;
    changed = true;
    const popBonus = Math.min(MAX_POPULARITY_BONUS_POINTS, remoteVotes);
    const total = Math.min(
      100,
      sub.score.themeMatch +
        sub.score.outfitCompleteness +
        sub.score.photoCompletion +
        sub.score.creativityBonus +
        popBonus
    );
    return {
      ...sub,
      votesReceived: remoteVotes,
      score: {
        ...sub.score,
        popularityVotes: popBonus,
        totalScore: total,
        rank: getRankTierForScore(total).rank,
      },
    };
  });

  if (!changed) return localContest;
  return {
    ...localContest,
    submissions: mergedSubmissions,
  };
}
