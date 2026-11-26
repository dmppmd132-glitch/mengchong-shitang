import { ACCESSORIES } from '../data/accessories';
import {
  PHOTO_BACKGROUNDS,
  PHOTO_BACKGROUND_BY_ID,
  PHOTO_FILTERS,
  PHOTO_FILTER_BY_ID,
  PHOTO_FRAMES,
  PHOTO_FRAME_BY_ID,
  PHOTO_POSES,
  PHOTO_POSE_BY_ID,
  PHOTO_STICKERS,
  PHOTO_STICKER_BY_ID,
  STUDIO_BADGES,
  STUDIO_CRAFT_RECIPES,
  STUDIO_SHOP_FILTERS,
  WEEKLY_OUTFIT_THEMES,
} from '../data/photoStudio';
import { VISITORS } from '../data/visitors';
import {
  CoopDuoChallengeSubmission,
  CoopDuoPhotoChallengeState,
  DuoPhotoPetInfo,
  GameState,
  Pet,
  PetPersonality,
  PetViewDirection,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScene,
  PhotoStickerId,
  PhotoStudioState,
  RoomPhotoRecord,
  StudioScoreBreakdown,
  WeeklyOutfitChallengeTheme,
  WeeklyOutfitChallengeThemeId,
} from '../types';
import {
  getActivePet,
  getPetDisplayPersonality,
  getPetPreferenceProfile,
  updatePetById,
} from './pets';
import {
  maybeGrantCatPhotoMemoryCard,
  recordMemoryEntry,
  recordMonthlyActivity,
} from './memories';

const ACCESSORY_BY_ID = new Map(ACCESSORIES.map((a) => [a.id, a]));

export const FREE_STUDIO_POSES: PhotoPose[] = ['happy', 'shy', 'sleep', 'eat'];
export const FREE_STUDIO_BACKGROUNDS: PhotoBackground[] = [
  'pink_room',
  'strawberry_field',
  'cloud_sky',
  'kitchen',
];
export const FREE_STUDIO_FILTERS: PhotoFilter[] = ['none'];
export const FREE_STUDIO_FRAMES: PhotoFrame[] = ['none'];
export const FREE_STUDIO_STICKERS: PhotoStickerId[] = [];

export function getLocalWeekStart(date: Date = new Date()): Date {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = local.getDay(); // 0=Sun, 1=Mon
  const diffToMonday = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + diffToMonday);
  local.setHours(0, 0, 0, 0);
  return local;
}

export function getLocalWeekKey(date: Date = new Date()): string {
  const monday = getLocalWeekStart(date);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPreviousWeekKey(weekKey: string): string {
  const parts = weekKey.split('-').map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return '';
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() - 7);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekTimeRemainingText(now: Date = new Date()): string {
  const monday = getLocalWeekStart(now);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  const diffMs = Math.max(0, nextMonday.getTime() - now.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `剩餘 ${days} 天 ${hours} 小時`;
  if (hours > 0) return `剩餘 ${hours} 小時 ${minutes} 分`;
  return `剩餘 ${Math.max(1, minutes)} 分`;
}

function getWeekIndex(weekKey: string): number {
  const parts = weekKey.split('-').map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return 0;
  const utcDays = Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
  return Math.max(0, Math.floor(utcDays / 7));
}

export function getWeeklyOutfitChallengeTheme(
  weekKey: string = getLocalWeekKey()
): WeeklyOutfitChallengeTheme {
  const idx = getWeekIndex(weekKey) % WEEKLY_OUTFIT_THEMES.length;
  return WEEKLY_OUTFIT_THEMES[idx];
}

export interface WeeklyStudioShopRotation {
  weekKey: string;
  filters: PhotoFilter[];
  frames: PhotoFrame[];
  backgrounds: PhotoBackground[];
  poses: PhotoPose[];
}

export function getWeeklyStudioShopRotation(
  weekKey: string = getLocalWeekKey()
): WeeklyStudioShopRotation {
  const weekNum = getWeekIndex(weekKey);
  const shopFilters = STUDIO_SHOP_FILTERS.filter((f) => f.source === 'shop').map(
    (f) => f.id
  );
  const shopFrames = PHOTO_FRAMES.filter((f) => f.source === 'shop').map((f) => f.id);
  const shopBgs = PHOTO_BACKGROUNDS.filter((b) => b.source === 'shop').map((b) => b.id);
  const shopPoses = PHOTO_POSES.filter((p) => p.source === 'shop').map((p) => p.id);

  const pickTwo = <T,>(arr: T[], seedOffset: number): T[] => {
    if (arr.length === 0) return [];
    if (arr.length === 1) return [arr[0]];
    const i1 = (weekNum * 2 + seedOffset) % arr.length;
    let i2 = (i1 + 1 + (weekNum % Math.max(1, arr.length - 1))) % arr.length;
    if (i2 === i1) i2 = (i1 + 1) % arr.length;
    return [arr[i1], arr[i2]];
  };

  return {
    weekKey,
    filters: pickTwo(shopFilters, 0),
    frames: pickTwo(shopFrames, 1),
    backgrounds: shopBgs.length > 0 ? [shopBgs[weekNum % shopBgs.length]] : [],
    poses: shopPoses.length > 0 ? [shopPoses[weekNum % shopPoses.length]] : [],
  };
}

export function createInitialPhotoStudioState(now: Date = new Date()): PhotoStudioState {
  const weekKey = getLocalWeekKey(now);
  const theme = getWeeklyOutfitChallengeTheme(weekKey);
  return {
    unlockedPoses: [...FREE_STUDIO_POSES],
    unlockedBackgrounds: [...FREE_STUDIO_BACKGROUNDS],
    unlockedFilters: [...FREE_STUDIO_FILTERS],
    unlockedFrames: [...FREE_STUDIO_FRAMES],
    unlockedStickers: [...FREE_STUDIO_STICKERS],
    studioMaterials: 0,
    studioFrameShards: 0,
    weeklyChallenge: {
      weekKey,
      themeId: theme.id,
      bestScore: 0,
      submittedCount: 0,
      claimedTiers: [],
      lastBreakdown: null,
      lastPhotoId: null,
    },
    consecutiveChallengeWeeks: 0,
    lastQualifiedChallengeWeek: null,
    unlockedStudioBadges: [],
    duoChallengeStreakWeeks: 0,
    lastQualifiedDuoWeek: null,
    totalStudioPhotos: 0,
  };
}

export function getPhotoStudioState(state: GameState): PhotoStudioState {
  return state.photoStudio ?? createInitialPhotoStudioState();
}

export function syncPhotoStudioState(
  state: GameState,
  now: Date = new Date()
): { nextState: GameState; newlyUnlockedPoses: PhotoPose[] } {
  const current = getPhotoStudioState(state);
  const weekKey = getLocalWeekKey(now);
  const expectedTheme = getWeeklyOutfitChallengeTheme(weekKey);

  // Sync achievement-based poses
  const nextPoses = new Set<PhotoPose>([
    ...FREE_STUDIO_POSES,
    ...current.unlockedPoses,
    ...(state.memoryAlbum?.unlockedPhotoPoses ?? []),
  ]);
  const newlyUnlockedPoses: PhotoPose[] = [];

  const hubPlayTotal = Object.values(state.minigameHub?.playCounts ?? {}).reduce(
    (sum, cnt) => sum + (typeof cnt === 'number' ? cnt : 0),
    0
  );
  const totalMinigames = Math.max(
    state.noviceGrowth?.minigameCount ?? 0,
    hubPlayTotal
  );
  if (totalMinigames >= 5 && !nextPoses.has('dance')) {
    nextPoses.add('dance');
    newlyUnlockedPoses.push('dance');
  }

  const claimedNoviceDays = state.noviceGrowth?.claimedDays ?? [];
  if (
    (claimedNoviceDays.includes(7) || claimedNoviceDays.length >= 3) &&
    !nextPoses.has('salute')
  ) {
    nextPoses.add('salute');
    newlyUnlockedPoses.push('salute');
  }

  if ((state.noviceGrowth?.fedFavoriteCount ?? 0) >= 3 && !nextPoses.has('star_eyes')) {
    nextPoses.add('star_eyes');
    newlyUnlockedPoses.push('star_eyes');
  }

  const nextFrames = new Set<PhotoFrame>([
    ...FREE_STUDIO_FRAMES,
    ...current.unlockedFrames,
    ...(state.memoryAlbum?.unlockedPhotoFrames ?? []),
  ]);

  const nextBackgrounds = new Set<PhotoBackground>([
    ...FREE_STUDIO_BACKGROUNDS,
    ...current.unlockedBackgrounds,
  ]);
  const nextFilters = new Set<PhotoFilter>([
    ...FREE_STUDIO_FILTERS,
    ...current.unlockedFilters,
  ]);

  if (state.visitorState?.affinities) {
    for (const visitor of VISITORS) {
      const affLevel = state.visitorState.affinities[visitor.id]?.level ?? 1;
      for (const reward of visitor.levelRewards) {
        if (affLevel >= reward.level && reward.unlockStudio) {
          if (reward.unlockStudio.backgroundId) {
            nextBackgrounds.add(reward.unlockStudio.backgroundId);
          }
          if (reward.unlockStudio.filterId) {
            nextFilters.add(reward.unlockStudio.filterId);
          }
          if (reward.unlockStudio.frameId) {
            nextFrames.add(reward.unlockStudio.frameId);
          }
        }
      }
    }
  }

  if (state.townMap) {
    if (state.townMap.visitorHut.level >= 5) {
      nextBackgrounds.add('dream_lodge_bg');
    }
    if (state.townMap.unlockedLocationIds.includes('acorn_forest')) {
      nextBackgrounds.add('acorn_trail');
    }
    if (state.townMap.unlockedLocationIds.includes('lake_park')) {
      nextBackgrounds.add('waterfront_bridge');
      nextFilters.add('lakeside_breeze');
    }
    if (state.townMap.unlockedLocationIds.includes('town_market')) {
      nextBackgrounds.add('wooden_stalls');
    }
    for (const loc of Object.values(state.townMap.locations)) {
      loc.unlockedBackgroundIds.forEach((b) => nextBackgrounds.add(b));
      loc.unlockedFilterIds.forEach((f) => nextFilters.add(f));
      loc.unlockedFrameIds.forEach((fr) => nextFrames.add(fr));
    }
  }

  // Roll weekly challenge if week changed
  let nextWeekly = current.weeklyChallenge;
  let nextStreak = current.consecutiveChallengeWeeks;
  if (nextWeekly.weekKey !== weekKey) {
    const prevKey = getPreviousWeekKey(weekKey);
    if (
      current.lastQualifiedChallengeWeek &&
      current.lastQualifiedChallengeWeek !== prevKey &&
      current.lastQualifiedChallengeWeek !== weekKey
    ) {
      nextStreak = 0;
    }
    nextWeekly = {
      weekKey,
      themeId: expectedTheme.id,
      bestScore: 0,
      submittedCount: 0,
      claimedTiers: [],
      lastBreakdown: null,
      lastPhotoId: null,
    };
  }

  const updatedStudio: PhotoStudioState = {
    ...current,
    unlockedPoses: Array.from(nextPoses),
    unlockedBackgrounds: Array.from(nextBackgrounds),
    unlockedFilters: Array.from(nextFilters),
    unlockedFrames: Array.from(nextFrames),
    unlockedStickers: Array.from(new Set(current.unlockedStickers)),
    weeklyChallenge: nextWeekly,
    consecutiveChallengeWeeks: nextStreak,
  };

  if (
    newlyUnlockedPoses.length === 0 &&
    state.photoStudio &&
    state.photoStudio.weeklyChallenge.weekKey === updatedStudio.weeklyChallenge.weekKey &&
    updatedStudio.unlockedPoses.length === state.photoStudio.unlockedPoses.length &&
    updatedStudio.unlockedFrames.length === state.photoStudio.unlockedFrames.length &&
    updatedStudio.unlockedBackgrounds.length === state.photoStudio.unlockedBackgrounds.length &&
    updatedStudio.unlockedFilters.length === state.photoStudio.unlockedFilters.length
  ) {
    return { nextState: state, newlyUnlockedPoses: [] };
  }

  return {
    nextState: {
      ...state,
      photoStudio: updatedStudio,
    },
    newlyUnlockedPoses,
  };
}

export function evaluateWeeklyOutfitScore(params: {
  pet: Pet;
  personality: PetPersonality;
  backgroundId: PhotoBackground;
  filterId: PhotoFilter;
  frameId: PhotoFrame;
  theme: WeeklyOutfitChallengeTheme;
}): StudioScoreBreakdown {
  const { pet, personality, backgroundId, filterId, frameId, theme } = params;
  const petPref = getPetPreferenceProfile(pet);
  const equippedIds = Object.values(pet.accessories).filter((x): x is string =>
    Boolean(x)
  );

  let themeAccessoryCount = 0;
  let likedAccessoryCount = 0;
  const matchedThemeAccessoryIds = new Set<string>();

  for (const accId of equippedIds) {
    const acc = ACCESSORY_BY_ID.get(accId);
    if (!acc) continue;
    if (acc.theme === theme.requiredAccessoryTheme) {
      themeAccessoryCount += 1;
      matchedThemeAccessoryIds.add(acc.id);
    }
    const petLikesAcc =
      acc.suitablePersonalities.includes(personality.primary) ||
      acc.suitablePersonalities.includes(personality.secondary) ||
      Boolean(petPref.favoriteAccessoryIds?.includes(acc.id));
    if (petLikesAcc) {
      likedAccessoryCount += 1;
    }
  }

  const totalThemeAccessories = ACCESSORIES.filter(
    (a) => a.theme === theme.requiredAccessoryTheme
  );
  const fullSetCompleted =
    totalThemeAccessories.length > 0 &&
    totalThemeAccessories.every((a) => matchedThemeAccessoryIds.has(a.id));

  const backgroundMatched = backgroundId === theme.targetBackgroundId;
  const filterMatched = filterId === theme.targetFilterId;
  const frameMatched = frameId === theme.targetFrameId;

  const themeAccessoryPoints = themeAccessoryCount * 10;
  const backgroundPoints = backgroundMatched ? 20 : 0;
  const filterPoints = filterMatched ? 10 : 0;
  const framePoints = frameMatched ? 10 : 0;
  const likedAccessoryPoints = likedAccessoryCount * 15;
  const fullSetPoints = fullSetCompleted ? 30 : 0;

  const totalScore =
    themeAccessoryPoints +
    backgroundPoints +
    filterPoints +
    framePoints +
    likedAccessoryPoints +
    fullSetPoints;

  return {
    totalScore,
    themeAccessoryCount,
    themeAccessoryPoints,
    backgroundMatched,
    backgroundPoints,
    filterMatched,
    filterPoints,
    frameMatched,
    framePoints,
    likedAccessoryCount,
    likedAccessoryPoints,
    fullSetCompleted,
    fullSetPoints,
  };
}

export interface StudioActionResult {
  nextState: GameState;
  ok: boolean;
  notice: string;
}

export function buyStudioPose(state: GameState, poseId: PhotoPose): StudioActionResult {
  const studio = syncPhotoStudioState(state).nextState.photoStudio!;
  const pose = PHOTO_POSE_BY_ID[poseId];
  if (!pose) return { nextState: state, ok: false, notice: '找不到此姿勢資料。' };
  if (studio.unlockedPoses.includes(poseId)) {
    return { nextState: state, ok: false, notice: `你已經擁有「${pose.label}」姿勢囉！` };
  }
  if (pose.source !== 'shop') {
    return {
      nextState: state,
      ok: false,
      notice: pose.unlockHint || '此姿勢需透過成就或里程碑解鎖！',
    };
  }
  if (state.coins < pose.price) {
    return {
      nextState: state,
      ok: false,
      notice: `金幣不足，購買「${pose.label}」需要 ${pose.price} 金幣！`,
    };
  }

  return {
    nextState: {
      ...state,
      coins: state.coins - pose.price,
      photoStudio: {
        ...studio,
        unlockedPoses: [...studio.unlockedPoses, poseId],
      },
    },
    ok: true,
    notice: `成功購買姿勢「${pose.emoji} ${pose.label}」！`,
  };
}

export function buyStudioBackground(
  state: GameState,
  bgId: PhotoBackground
): StudioActionResult {
  const studio = syncPhotoStudioState(state).nextState.photoStudio!;
  const bg = PHOTO_BACKGROUND_BY_ID[bgId];
  if (!bg) return { nextState: state, ok: false, notice: '找不到此背景資料。' };
  if (studio.unlockedBackgrounds.includes(bgId)) {
    return { nextState: state, ok: false, notice: `你已經擁有「${bg.label}」背景囉！` };
  }
  if (bg.source !== 'shop') {
    return {
      nextState: state,
      ok: false,
      notice: bg.unlockHint || '此為限定背景，不可直接用金幣購買！',
    };
  }
  if (state.coins < bg.price) {
    return {
      nextState: state,
      ok: false,
      notice: `金幣不足，購買「${bg.label}」需要 ${bg.price} 金幣！`,
    };
  }

  return {
    nextState: {
      ...state,
      coins: state.coins - bg.price,
      photoStudio: {
        ...studio,
        unlockedBackgrounds: [...studio.unlockedBackgrounds, bgId],
      },
    },
    ok: true,
    notice: `成功解鎖攝影棚背景「${bg.emoji} ${bg.label}」！`,
  };
}

export function buyStudioFilter(
  state: GameState,
  filterId: PhotoFilter
): StudioActionResult {
  const studio = syncPhotoStudioState(state).nextState.photoStudio!;
  const filter = PHOTO_FILTER_BY_ID[filterId];
  if (!filter) return { nextState: state, ok: false, notice: '找不到此濾鏡資料。' };
  if (studio.unlockedFilters.includes(filterId) || filter.source === 'free') {
    return {
      nextState: state,
      ok: false,
      notice: `你已經擁有「${filter.label}」濾鏡囉！`,
    };
  }
  if (state.coins < filter.price) {
    return {
      nextState: state,
      ok: false,
      notice: `金幣不足，購買「${filter.label}」濾鏡需要 ${filter.price} 金幣！`,
    };
  }

  return {
    nextState: {
      ...state,
      coins: state.coins - filter.price,
      photoStudio: {
        ...studio,
        unlockedFilters: [...studio.unlockedFilters, filterId],
      },
    },
    ok: true,
    notice: `成功購買濾鏡「${filter.emoji} ${filter.label}」！`,
  };
}

export function buyStudioFrame(
  state: GameState,
  frameId: PhotoFrame
): StudioActionResult {
  const studio = syncPhotoStudioState(state).nextState.photoStudio!;
  const frame = PHOTO_FRAME_BY_ID[frameId];
  if (!frame) return { nextState: state, ok: false, notice: '找不到此相框資料。' };
  if (studio.unlockedFrames.includes(frameId) || frame.source === 'free') {
    return { nextState: state, ok: false, notice: `你已經擁有「${frame.label}」相框囉！` };
  }
  if (frame.source !== 'shop') {
    return {
      nextState: state,
      ok: false,
      notice: frame.unlockHint || '此相框需透過里程碑或合成解鎖！',
    };
  }
  if (state.coins < frame.price) {
    return {
      nextState: state,
      ok: false,
      notice: `金幣不足，購買「${frame.label}」相框需要 ${frame.price} 金幣！`,
    };
  }

  return {
    nextState: {
      ...state,
      coins: state.coins - frame.price,
      photoStudio: {
        ...studio,
        unlockedFrames: [...studio.unlockedFrames, frameId],
      },
    },
    ok: true,
    notice: `成功購買相框「${frame.emoji} ${frame.label}」！`,
  };
}

export function buyStudioSticker(
  state: GameState,
  stickerId: PhotoStickerId
): StudioActionResult {
  const studio = syncPhotoStudioState(state).nextState.photoStudio!;
  const sticker = PHOTO_STICKER_BY_ID[stickerId];
  if (!sticker) return { nextState: state, ok: false, notice: '找不到此貼圖。' };
  if (studio.unlockedStickers.includes(stickerId)) {
    return {
      nextState: state,
      ok: false,
      notice: `你已經擁有「${sticker.label}」貼圖了，可無限次重複使用！`,
    };
  }
  if (state.coins < sticker.price) {
    return {
      nextState: state,
      ok: false,
      notice: `金幣不足，購買「${sticker.label}」貼圖需要 ${sticker.price} 金幣！`,
    };
  }

  return {
    nextState: {
      ...state,
      coins: state.coins - sticker.price,
      photoStudio: {
        ...studio,
        unlockedStickers: [...studio.unlockedStickers, stickerId],
      },
    },
    ok: true,
    notice: `已購入貼圖「${sticker.emoji} ${sticker.label}」（可重複使用）！`,
  };
}

export function craftStudioRecipe(
  state: GameState,
  recipeId: string
): StudioActionResult {
  const syncedState = syncPhotoStudioState(state).nextState;
  const studio = syncedState.photoStudio!;
  const recipe = STUDIO_CRAFT_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) {
    return { nextState: state, ok: false, notice: '找不到此合成配方。' };
  }

  const alreadyOwned =
    (recipe.targetKind === 'background' &&
      studio.unlockedBackgrounds.includes(recipe.targetId as PhotoBackground)) ||
    (recipe.targetKind === 'frame' &&
      studio.unlockedFrames.includes(recipe.targetId as PhotoFrame)) ||
    (recipe.targetKind === 'filter' &&
      studio.unlockedFilters.includes(recipe.targetId as PhotoFilter)) ||
    (recipe.targetKind === 'pose' &&
      studio.unlockedPoses.includes(recipe.targetId as PhotoPose)) ||
    (recipe.targetKind === 'sticker' &&
      studio.unlockedStickers.includes(recipe.targetId as PhotoStickerId));

  if (alreadyOwned) {
    return { nextState: state, ok: false, notice: `你已經擁有「${recipe.name}」囉！` };
  }
  if (studio.studioMaterials < recipe.materialCost) {
    return {
      nextState: state,
      ok: false,
      notice: `攝影材料不足（需要 ${recipe.materialCost} 個攝影材料，可於週挑戰、攝影訂單或招待訪客獲得）！`,
    };
  }
  if (studio.studioFrameShards < recipe.frameShardCost) {
    return {
      nextState: state,
      ok: false,
      notice: `限定相框碎片不足（需要 ${recipe.frameShardCost} 個相框碎片）！`,
    };
  }
  if (syncedState.coins < recipe.coinCost) {
    return {
      nextState: state,
      ok: false,
      notice: `金幣不足，合成手續費需要 ${recipe.coinCost} 金幣！`,
    };
  }

  const nextStudio: PhotoStudioState = {
    ...studio,
    studioMaterials: studio.studioMaterials - recipe.materialCost,
    studioFrameShards: studio.studioFrameShards - recipe.frameShardCost,
    unlockedBackgrounds:
      recipe.targetKind === 'background'
        ? [...studio.unlockedBackgrounds, recipe.targetId as PhotoBackground]
        : studio.unlockedBackgrounds,
    unlockedFrames:
      recipe.targetKind === 'frame'
        ? [...studio.unlockedFrames, recipe.targetId as PhotoFrame]
        : studio.unlockedFrames,
    unlockedFilters:
      recipe.targetKind === 'filter'
        ? [...studio.unlockedFilters, recipe.targetId as PhotoFilter]
        : studio.unlockedFilters,
    unlockedPoses:
      recipe.targetKind === 'pose'
        ? [...studio.unlockedPoses, recipe.targetId as PhotoPose]
        : studio.unlockedPoses,
    unlockedStickers:
      recipe.targetKind === 'sticker'
        ? [...studio.unlockedStickers, recipe.targetId as PhotoStickerId]
        : studio.unlockedStickers,
  };

  return {
    nextState: {
      ...syncedState,
      coins: syncedState.coins - recipe.coinCost,
      photoStudio: nextStudio,
    },
    ok: true,
    notice: `合成成功！解鎖「${recipe.emoji} ${recipe.name}」！`,
  };
}

export function submitWeeklyOutfitChallenge(
  state: GameState,
  params: {
    title: string;
    caption: string;
    poseId: PhotoPose;
    backgroundId: PhotoBackground;
    facing: PetViewDirection;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  },
  now: Date = new Date()
): {
  nextState: GameState;
  photo: RoomPhotoRecord;
  breakdown: StudioScoreBreakdown;
  unlockedItemsNotice: string[];
} {
  const syncedState = syncPhotoStudioState(state, now).nextState;
  const studio = syncedState.photoStudio!;
  const weekKey = studio.weeklyChallenge.weekKey;
  const theme = getWeeklyOutfitChallengeTheme(weekKey);
  const activePet = getActivePet(syncedState);
  const personality = getPetDisplayPersonality(syncedState, activePet);

  const breakdown = evaluateWeeklyOutfitScore({
    pet: activePet,
    personality,
    backgroundId: params.backgroundId,
    filterId: params.filterId,
    frameId: params.frameId,
    theme,
  });

  const nowTs = now.getTime();
  const cleanTitle =
    params.title.trim().slice(0, 20) || `${theme.title}・${activePet.name}`.slice(0, 20);
  const photo: RoomPhotoRecord = {
    id: `wch_${nowTs}_${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    caption:
      params.caption.trim().slice(0, 60) ||
      `參加本週主題「${theme.title}」獲得 ${breakdown.totalScore} 分穿搭評分！`,
    createdAt: nowTs,
    houseName: syncedState.house.houseName,
    petId: activePet.id,
    species: activePet.species,
    petName: activePet.name,
    equipped: { ...activePet.accessories },
    poseId: 'happy_jump',
    wallpaperId: syncedState.house.roomLayout.wallpaperId,
    flooringId: syncedState.house.roomLayout.flooringId,
    placedItems: [],
    photoKind: 'wardrobe',
    scene: 'wardrobe',
    wardrobePoseId: params.poseId,
    backgroundId: params.backgroundId,
    facing: params.facing,
    filterId: params.filterId,
    frameId: params.frameId,
    stickers: params.stickers.slice(0, 6),
    weightAtCapture: activePet.weight,
    challengeScore: breakdown.totalScore,
    challengeWeekKey: weekKey,
    likes: [],
    comments: [],
  };

  let nextConsecutive = studio.consecutiveChallengeWeeks;
  let nextLastQualified = studio.lastQualifiedChallengeWeek;
  const unlockedItemsNotice: string[] = [];

  if (breakdown.totalScore >= 100 && studio.lastQualifiedChallengeWeek !== weekKey) {
    const prevWeek = getPreviousWeekKey(weekKey);
    nextConsecutive =
      studio.lastQualifiedChallengeWeek === prevWeek
        ? studio.consecutiveChallengeWeeks + 1
        : 1;
    nextLastQualified = weekKey;
  }

  const nextBadges = [...studio.unlockedStudioBadges];
  if (nextConsecutive >= 3 && !nextBadges.includes('outfit_master')) {
    nextBadges.push('outfit_master');
    unlockedItemsNotice.push(`解鎖徽章「${STUDIO_BADGES.outfit_master.emoji} 穿搭達人」！`);
  }

  const nextTitles = [...syncedState.encyclopedia.unlockedTitles];
  if (nextConsecutive >= 5 && !nextTitles.includes('fashion_photographer')) {
    nextTitles.push('fashion_photographer');
    unlockedItemsNotice.push('解鎖限定稱號「📸 時尚攝影師」！');
  }

  const nextWeekly = {
    ...studio.weeklyChallenge,
    bestScore: Math.max(studio.weeklyChallenge.bestScore, breakdown.totalScore),
    submittedCount: studio.weeklyChallenge.submittedCount + 1,
    lastBreakdown: breakdown,
    lastPhotoId: photo.id,
  };

  let nextState: GameState = {
    ...syncedState,
    encyclopedia: {
      ...syncedState.encyclopedia,
      unlockedTitles: nextTitles,
    },
    house: {
      ...syncedState.house,
      photos: [photo, ...syncedState.house.photos].slice(0, 48),
    },
    photoStudio: {
      ...studio,
      weeklyChallenge: nextWeekly,
      consecutiveChallengeWeeks: nextConsecutive,
      lastQualifiedChallengeWeek: nextLastQualified,
      unlockedStudioBadges: nextBadges,
      totalStudioPhotos: studio.totalStudioPhotos + 1,
    },
  };

  nextState = recordMonthlyActivity(nextState, { interactionLabel: '每週穿搭挑戰' });
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `challenge_photo_${weekKey}`,
    petId: activePet.id,
    type: 'wardrobe',
    title: `每週穿搭「${theme.title}」拿到 ${breakdown.totalScore} 分`,
    description: `${activePet.name}以「${cleanTitle}」參加每週穿搭主題挑戰！`,
    emoji: theme.emoji,
    photoId: photo.id,
    weight: activePet.weight,
    level: activePet.level,
  });
  nextState = maybeGrantCatPhotoMemoryCard(nextState).nextState;

  return { nextState, photo, breakdown, unlockedItemsNotice };
}

export function claimWeeklyOutfitTier(
  state: GameState,
  tier: 60 | 100 | 150
): StudioActionResult {
  const syncedState = syncPhotoStudioState(state).nextState;
  const studio = syncedState.photoStudio!;
  const weekly = studio.weeklyChallenge;

  if (weekly.bestScore < tier) {
    return {
      nextState: state,
      ok: false,
      notice: `本週最高分須達到 ${tier} 分才能領取此階獎勵！`,
    };
  }
  if (weekly.claimedTiers.includes(tier)) {
    return { nextState: state, ok: false, notice: `本週已領取過 ${tier} 分階獎勵囉！` };
  }

  let coinBonus = 0;
  let materialBonus = 0;
  let shardBonus = 0;
  const nextFilters = [...studio.unlockedFilters];
  const nextPoses = [...studio.unlockedPoses];
  const nextBgs = [...studio.unlockedBackgrounds];
  let extraRewardText = '';

  if (tier === 60) {
    coinBonus = 50;
    materialBonus = 1;
    extraRewardText = '50 金幣 + 1 攝影材料';
  } else if (tier === 100) {
    coinBonus = 100;
    shardBonus = 1;
    extraRewardText = '100 金幣 + 1 限定相框碎片';
  } else {
    coinBonus = 200;
    const rewardFilterCandidate = (['candy', 'starry', 'vintage', 'mint', 'pink', 'cream'] as PhotoFilter[]).find(
      (id) => !nextFilters.includes(id)
    );
    const rewardPoseCandidate = (['runway', 'pounce', 'spin'] as PhotoPose[]).find(
      (id) => !nextPoses.includes(id)
    );
    const rewardBgCandidate = (['sakura_path', 'halloween_party', 'christmas_cabin'] as PhotoBackground[]).find(
      (id) => !nextBgs.includes(id)
    );

    if (rewardFilterCandidate) {
      nextFilters.push(rewardFilterCandidate);
      const label = PHOTO_FILTER_BY_ID[rewardFilterCandidate]?.label ?? rewardFilterCandidate;
      extraRewardText = `200 金幣 + 解鎖限定濾鏡「${label}」`;
    } else if (rewardPoseCandidate) {
      nextPoses.push(rewardPoseCandidate);
      const label = PHOTO_POSE_BY_ID[rewardPoseCandidate]?.label ?? rewardPoseCandidate;
      extraRewardText = `200 金幣 + 解鎖姿勢「${label}」`;
    } else if (rewardBgCandidate) {
      nextBgs.push(rewardBgCandidate);
      const label = PHOTO_BACKGROUND_BY_ID[rewardBgCandidate]?.label ?? rewardBgCandidate;
      extraRewardText = `200 金幣 + 解鎖限定背景「${label}」`;
    } else {
      materialBonus = 2;
      shardBonus = 1;
      extraRewardText = '200 金幣 + 2 攝影材料 + 1 限定相框碎片';
    }
  }

  return {
    nextState: {
      ...syncedState,
      coins: syncedState.coins + coinBonus,
      photoStudio: {
        ...studio,
        studioMaterials: studio.studioMaterials + materialBonus,
        studioFrameShards: studio.studioFrameShards + shardBonus,
        unlockedFilters: nextFilters,
        unlockedPoses: nextPoses,
        unlockedBackgrounds: nextBgs,
        weeklyChallenge: {
          ...weekly,
          claimedTiers: [...weekly.claimedTiers, tier].sort((a, b) => a - b),
        },
      },
    },
    ok: true,
    notice: `領取 ${tier} 分挑戰獎勵：${extraRewardText}！`,
  };
}

export function saveDuoStudioPhoto(
  state: GameState,
  params: {
    primaryPet: Pet;
    partnerPet: DuoPhotoPetInfo;
    primaryPoseId: PhotoPose;
    primaryFacing?: PetViewDirection;
    backgroundId: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
    title: string;
    caption: string;
  }
): { nextState: GameState; photo: RoomPhotoRecord } {
  const synced = syncPhotoStudioState(state).nextState;
  const studio = synced.photoStudio!;
  const nowTs = Date.now();
  const cleanTitle =
    params.title.trim().slice(0, 20) ||
    `${params.primaryPet.name}與${params.partnerPet.petName}的合照`.slice(0, 20);
  const bgMeta = PHOTO_BACKGROUND_BY_ID[params.backgroundId];

  const photo: RoomPhotoRecord = {
    id: `duo_${nowTs}_${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    caption:
      params.caption.trim().slice(0, 60) ||
      `在${bgMeta?.label ?? '攝影棚'}留下的暖心雙人合影！`,
    createdAt: nowTs,
    houseName: synced.house.houseName,
    petId: params.primaryPet.id,
    species: params.primaryPet.species,
    petName: params.primaryPet.name,
    equipped: { ...params.primaryPet.accessories },
    poseId: 'happy_jump',
    wallpaperId: synced.house.roomLayout.wallpaperId,
    flooringId: synced.house.roomLayout.flooringId,
    placedItems: [],
    photoKind: 'wardrobe',
    scene: 'wardrobe',
    isCoopPhoto: true,
    wardrobePoseId: params.primaryPoseId,
    backgroundId: params.backgroundId,
    facing: params.primaryFacing ?? 'front',
    filterId: params.filterId,
    frameId: params.frameId,
    stickers: params.stickers.slice(0, 6),
    weightAtCapture: params.primaryPet.weight,
    duoPet: {
      ...params.partnerPet,
      equipped: { ...params.partnerPet.equipped },
    },
    likes: [],
    comments: [],
  };

  let nextState: GameState = {
    ...synced,
    house: {
      ...synced.house,
      photos: [photo, ...synced.house.photos].slice(0, 48),
    },
    photoStudio: {
      ...studio,
      totalStudioPhotos: studio.totalStudioPhotos + 1,
    },
  };

  nextState = recordMonthlyActivity(nextState, { interactionLabel: '雙人合照' });
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `duo_photo_${photo.id}`,
    petId: params.primaryPet.id,
    type: 'coop',
    title: `雙人合照：「${cleanTitle}」`,
    description: `${params.primaryPet.name}與${params.partnerPet.petName}在${bgMeta?.label ?? '攝影棚'}拍下暖心紀念！`,
    emoji: '💞',
    photoId: photo.id,
    weight: params.primaryPet.weight,
    level: params.primaryPet.level,
    isShared: true,
  });
  nextState = maybeGrantCatPhotoMemoryCard(nextState).nextState;

  return { nextState, photo };
}

export function getOrCreateWeeklyDuoChallenge(
  state: GameState,
  now: Date = new Date()
): CoopDuoPhotoChallengeState {
  const weekKey = getLocalWeekKey(now);
  const existing = state.coop.duoChallenge;
  if (existing && existing.weekKey === weekKey) {
    return existing;
  }
  const theme = getWeeklyOutfitChallengeTheme(weekKey);
  return {
    weekKey,
    themeId: theme.id,
    title: `${theme.title}雙人紀念照`,
    backgroundId: theme.targetBackgroundId,
    filterId: theme.targetFilterId,
    frameId: 'coop_heart',
    stickers: ['heart', 'star'],
    submissions: {},
    mergedPhotoId: null,
    completed: false,
    completedAt: null,
    claimedByUserIds: [],
  };
}

export function submitCoopDuoChallengeEntry(
  state: GameState,
  params: {
    userId: string;
    userName: string;
    pet: Pet;
    poseId: PhotoPose;
    facing: PetViewDirection;
    title: string;
    backgroundId: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  },
  now: Date = new Date()
): {
  nextState: GameState;
  mergedPhoto: RoomPhotoRecord | null;
  notice: string;
} {
  const syncedState = syncPhotoStudioState(state, now).nextState;
  const studio = syncedState.photoStudio!;
  const currentDuo = getOrCreateWeeklyDuoChallenge(syncedState, now);
  const weekKey = currentDuo.weekKey;
  const theme = getWeeklyOutfitChallengeTheme(weekKey);

  const entry: CoopDuoChallengeSubmission = {
    userId: params.userId || 'local',
    userName: params.userName || '飼主',
    petId: params.pet.id,
    petName: params.pet.name,
    species: params.pet.species,
    equipped: { ...params.pet.accessories },
    poseId: params.poseId,
    facing: params.facing,
    weightAtCapture: params.pet.weight,
    submittedAt: now.getTime(),
  };

  const nextSubmissions = {
    ...currentDuo.submissions,
    [entry.userId]: entry,
  };
  const submitterList = Object.values(nextSubmissions).sort(
    (a, b) => a.submittedAt - b.submittedAt
  );

  const nextDuo: CoopDuoPhotoChallengeState = {
    ...currentDuo,
    title: params.title.trim().slice(0, 20) || currentDuo.title,
    backgroundId: params.backgroundId,
    filterId: params.filterId,
    frameId: params.frameId,
    stickers: params.stickers.slice(0, 6),
    submissions: nextSubmissions,
  };

  let mergedPhoto: RoomPhotoRecord | null = null;
  let nextPhotos = syncedState.house.photos;
  let nextDuoStreak = Math.max(
    syncedState.coop.duoStreakWeeks ?? 0,
    studio.duoChallengeStreakWeeks
  );
  let nextLastDuoWeek =
    syncedState.coop.lastDuoCompletedWeek ?? studio.lastQualifiedDuoWeek;
  const nextCoopBadges = [...syncedState.coop.unlockedBadges];

  if (submitterList.length >= 2 && !nextDuo.completed) {
    const first = submitterList[0];
    const second = submitterList[1];
    const mergedId = `duo_wk_${weekKey}_${now.getTime().toString(36)}`;
    mergedPhoto = {
      id: mergedId,
      title:
        nextDuo.title.slice(0, 20) ||
        `${first.petName}與${second.petName}的${theme.title}`.slice(0, 20),
      caption: `共養夥伴 ${first.userName} & ${second.userName} 合力完成「${theme.title}」每週雙人合照！`,
      createdAt: now.getTime(),
      houseName: syncedState.house.houseName,
      petId: first.petId,
      species: first.species,
      petName: first.petName,
      equipped: { ...first.equipped },
      poseId: 'happy_jump',
      wallpaperId: syncedState.house.roomLayout.wallpaperId,
      flooringId: syncedState.house.roomLayout.flooringId,
      placedItems: [],
      photoKind: 'wardrobe',
      scene: 'wardrobe',
      isCoopPhoto: true,
      wardrobePoseId: first.poseId,
      backgroundId: nextDuo.backgroundId,
      facing: first.facing,
      filterId: nextDuo.filterId,
      frameId: nextDuo.frameId,
      stickers: nextDuo.stickers,
      weightAtCapture: first.weightAtCapture,
      duoPet: {
        petId: second.petId,
        petName: second.petName,
        species: second.species,
        equipped: { ...second.equipped },
        poseId: second.poseId,
        facing: second.facing,
        weightAtCapture: second.weightAtCapture,
      },
      challengeWeekKey: weekKey,
      likes: [],
      comments: [],
    };
    nextPhotos = [mergedPhoto, ...nextPhotos].slice(0, 48);
    nextDuo.mergedPhotoId = mergedPhoto.id;
    nextDuo.completed = true;
    nextDuo.completedAt = now.getTime();

    const prevWeek = getPreviousWeekKey(weekKey);
    if (nextLastDuoWeek !== weekKey) {
      nextDuoStreak = nextLastDuoWeek === prevWeek ? nextDuoStreak + 1 : 1;
      nextLastDuoWeek = weekKey;
    }
    if (nextDuoStreak >= 3 && !nextCoopBadges.includes('best_outfit_partner')) {
      nextCoopBadges.push('best_outfit_partner');
    }
  }

  let nextState: GameState = {
    ...syncedState,
    house: {
      ...syncedState.house,
      photos: nextPhotos,
    },
    coop: {
      ...syncedState.coop,
      duoChallenge: nextDuo,
      duoStreakWeeks: nextDuoStreak,
      lastDuoCompletedWeek: nextLastDuoWeek,
      unlockedBadges: nextCoopBadges,
    },
    photoStudio: {
      ...studio,
      duoChallengeStreakWeeks: nextDuoStreak,
      lastQualifiedDuoWeek: nextLastDuoWeek,
    },
  };

  if (mergedPhoto) {
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: `coop_duo_challenge_${weekKey}`,
      type: 'coop',
      title: `雙人合照挑戰達成：${mergedPhoto.title}`,
      description: `兩人各自穿搭並合成「${theme.title}」官方雙人合照，雙人皆可領取相同獎勵！`,
      emoji: '👯',
      photoId: mergedPhoto.id,
      isShared: true,
    });
  }

  return {
    nextState,
    mergedPhoto,
    notice: mergedPhoto
      ? `兩人皆已送出造型，已自動合成「${mergedPhoto.title}」並收錄到雙方照片牆！`
      : `已送出你的「${theme.title}」穿搭造型，等待共養夥伴加入即自動合成雙人合照！`,
  };
}

export function claimCoopDuoChallengeReward(
  state: GameState,
  userId: string
): StudioActionResult {
  const syncedState = syncPhotoStudioState(state).nextState;
  const studio = syncedState.photoStudio!;
  const duo = syncedState.coop.duoChallenge;
  if (!duo || !duo.completed) {
    return {
      nextState: state,
      ok: false,
      notice: '雙方皆完成造型提交並合成雙人合照後，才能領取挑戰獎勵！',
    };
  }
  const actorKey = userId || 'local';
  if (duo.claimedByUserIds.includes(actorKey)) {
    return { nextState: state, ok: false, notice: '你已經領取過本週雙人合照獎勵囉！' };
  }

  const withIntimacy = updatePetById(syncedState, syncedState.activePetId, (p) => ({
    ...p,
    intimacy: p.intimacy + 4,
  }));

  return {
    nextState: {
      ...withIntimacy,
      coins: withIntimacy.coins + 120,
      coop: {
        ...withIntimacy.coop,
        duoChallenge: {
          ...duo,
          claimedByUserIds: [...duo.claimedByUserIds, actorKey],
        },
      },
      photoStudio: {
        ...studio,
        studioMaterials: studio.studioMaterials + 1,
        studioFrameShards: studio.studioFrameShards + 1,
      },
    },
    ok: true,
    notice: '領取共養雙人合照獎勵：+120 金幣、+1 攝影材料、+1 限定相框碎片、+4 親密度！',
  };
}

export function getStudioCollectionProgress(studio: PhotoStudioState): {
  posesOwned: number;
  posesTotal: number;
  backgroundsOwned: number;
  backgroundsTotal: number;
  filtersOwned: number;
  filtersTotal: number;
  framesOwned: number;
  framesTotal: number;
  stickersOwned: number;
  stickersTotal: number;
  totalOwned: number;
  totalCatalog: number;
} {
  const posesOwned = PHOTO_POSES.filter(
    (p) => p.source === 'free' || studio.unlockedPoses.includes(p.id)
  ).length;
  const backgroundsOwned = PHOTO_BACKGROUNDS.filter(
    (b) => b.source === 'free' || studio.unlockedBackgrounds.includes(b.id)
  ).length;
  const filtersOwned = STUDIO_SHOP_FILTERS.filter(
    (f) => f.source === 'free' || studio.unlockedFilters.includes(f.id)
  ).length;
  const framesOwned = PHOTO_FRAMES.filter(
    (f) => f.source === 'free' || studio.unlockedFrames.includes(f.id)
  ).length;
  const stickersOwned = PHOTO_STICKERS.filter((s) =>
    studio.unlockedStickers.includes(s.id)
  ).length;

  return {
    posesOwned,
    posesTotal: PHOTO_POSES.length,
    backgroundsOwned,
    backgroundsTotal: PHOTO_BACKGROUNDS.length,
    filtersOwned,
    filtersTotal: STUDIO_SHOP_FILTERS.length,
    framesOwned,
    framesTotal: PHOTO_FRAMES.length,
    stickersOwned,
    stickersTotal: PHOTO_STICKERS.length,
    totalOwned:
      posesOwned + backgroundsOwned + filtersOwned + framesOwned + stickersOwned,
    totalCatalog:
      PHOTO_POSES.length +
      PHOTO_BACKGROUNDS.length +
      STUDIO_SHOP_FILTERS.length +
      PHOTO_FRAMES.length +
      PHOTO_STICKERS.length,
  };
}

export function mergeCoopDuoChallenge(
  localDuo: CoopDuoPhotoChallengeState | null | undefined,
  remoteDuo: CoopDuoPhotoChallengeState | null | undefined
): CoopDuoPhotoChallengeState | null {
  if (!localDuo && !remoteDuo) return null;
  if (!localDuo) return remoteDuo ?? null;
  if (!remoteDuo) return localDuo;
  if (localDuo.weekKey !== remoteDuo.weekKey) {
    return remoteDuo.weekKey > localDuo.weekKey ? remoteDuo : localDuo;
  }

  const mergedSubmissions = {
    ...localDuo.submissions,
    ...remoteDuo.submissions,
  };
  const completed =
    remoteDuo.completed ||
    localDuo.completed ||
    Object.keys(mergedSubmissions).length >= 2;

  return {
    ...remoteDuo,
    submissions: mergedSubmissions,
    mergedPhotoId: remoteDuo.mergedPhotoId ?? localDuo.mergedPhotoId,
    completed,
    completedAt: remoteDuo.completedAt ?? localDuo.completedAt,
    claimedByUserIds: Array.from(
      new Set([...localDuo.claimedByUserIds, ...remoteDuo.claimedByUserIds])
    ),
  };
}

export function mergePhotoStudioRemoteState(
  localStudio: PhotoStudioState | undefined,
  remoteStudio: PhotoStudioState | undefined
): PhotoStudioState {
  const local = localStudio ?? createInitialPhotoStudioState();
  if (!remoteStudio) return local;
  return {
    ...local,
    unlockedPoses: Array.from(
      new Set([...local.unlockedPoses, ...remoteStudio.unlockedPoses])
    ),
    unlockedBackgrounds: Array.from(
      new Set([...local.unlockedBackgrounds, ...remoteStudio.unlockedBackgrounds])
    ),
    unlockedFilters: Array.from(
      new Set([...local.unlockedFilters, ...remoteStudio.unlockedFilters])
    ),
    unlockedFrames: Array.from(
      new Set([...local.unlockedFrames, ...remoteStudio.unlockedFrames])
    ),
    unlockedStickers: Array.from(
      new Set([...local.unlockedStickers, ...remoteStudio.unlockedStickers])
    ),
    studioMaterials: Math.max(local.studioMaterials, remoteStudio.studioMaterials),
    studioFrameShards: Math.max(local.studioFrameShards, remoteStudio.studioFrameShards),
    unlockedStudioBadges: Array.from(
      new Set([...local.unlockedStudioBadges, ...remoteStudio.unlockedStudioBadges])
    ),
    duoChallengeStreakWeeks: Math.max(
      local.duoChallengeStreakWeeks,
      remoteStudio.duoChallengeStreakWeeks
    ),
    lastQualifiedDuoWeek:
      remoteStudio.lastQualifiedDuoWeek ?? local.lastQualifiedDuoWeek,
    totalStudioPhotos: Math.max(local.totalStudioPhotos, remoteStudio.totalStudioPhotos),
  };
}

export function getWeeklyChallengeTitleSuggestion(
  petName: string,
  themeId: WeeklyOutfitChallengeThemeId
): string {
  const found =
    WEEKLY_OUTFIT_THEMES.find((t) => t.id === themeId) ?? WEEKLY_OUTFIT_THEMES[0];
  return `${found.title}・${petName}`.slice(0, 20);
}
