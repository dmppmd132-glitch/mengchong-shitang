import { ACCESSORIES } from '../data/accessories';
import { COOP_BADGES } from '../data/coop';
import { getTitleDefinition } from '../data/encyclopedia';
import {
  STRAWBERRY_ACCESSORY_IDS,
  STRAWBERRY_EVENT_DESCRIPTION,
  STRAWBERRY_EVENT_DURATION_DAYS,
  STRAWBERRY_EVENT_ID,
  STRAWBERRY_EVENT_NAME,
  STRAWBERRY_FOOD_IDS,
  STRAWBERRY_RECIPE_IDS,
  STRAWBERRY_SET_ACCESSORY_IDS,
  STRAWBERRY_SHOP_ITEMS,
  STRAWBERRY_TICKET_REWARDS,
  buildDailyEventTasksForDate,
  createInitialStrawberryMilestones,
} from '../data/events/strawberrySeason';
import { INGREDIENTS } from '../data/kitchen';
import { PHOTO_BACKGROUND_BY_ID, PHOTO_POSE_BY_ID, STUDIO_BADGES } from '../data/photoStudio';
import {
  CoopEventSession,
  CoopOfflineEvent,
  DuoPhotoPetInfo,
  EventMilestone,
  EventMilestoneId,
  EventPhotoScoreBreakdown,
  EventShopItem,
  EventTask,
  GameState,
  KitchenRecipe,
  PetViewDirection,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoStickerId,
  RoomPhotoRecord,
  SeasonalEvent,
  TitleId,
} from '../types';
import { syncAllAccessoryProgress } from './accessories';
import {
  maybeGrantCatPhotoMemoryCard,
  recordMemoryEntry,
  recordMonthlyActivity,
} from './memories';
import { getLocalDateString } from './noviceGrowth';
import { getActivePet, isSharedCoopPet, updatePetById } from './pets';
import {
  getLocalWeekKey,
  getPhotoStudioState,
  getPreviousWeekKey,
  syncPhotoStudioState,
} from './photoStudio';

function addDaysToDateKey(dateKey: string, days: number): string {
  const parts = dateKey.split('-').map((n) => parseInt(n, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return dateKey;
  }
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getPreviousDateKey(dateKey: string): string {
  return addDaysToDateKey(dateKey, -1);
}

export function getEventWeekNumber(startDate: string, todayKey: string): number {
  const s = new Date(`${startDate}T00:00:00`).getTime();
  const t = new Date(`${todayKey}T00:00:00`).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(t)) return 1;
  const diffDays = Math.max(0, Math.floor((t - s) / 86400000));
  return diffDays >= 7 ? 2 : 1;
}

export function getEventRemainingText(
  event: Pick<SeasonalEvent, 'startDate' | 'endDate' | 'status'>,
  now: Date = new Date()
): string {
  if (event.status === 'ended') {
    return '活動已結束 · 可檢視草莓季回顧';
  }
  const endTs = new Date(`${event.endDate}T23:59:59`).getTime();
  const diffMs = endTs - now.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return '活動即將結算';
  }
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  if (days > 0) return `剩餘 ${days} 天 ${hours} 小時`;
  const mins = totalMinutes % 60;
  if (hours > 0) return `剩餘 ${hours} 小時 ${mins} 分`;
  return `剩餘 ${Math.max(1, mins)} 分`;
}

export function createInitialSeasonalEvent(now: Date = new Date()): SeasonalEvent {
  const startDate = getLocalDateString(now);
  const endDate = addDaysToDateKey(startDate, STRAWBERRY_EVENT_DURATION_DAYS - 1);
  const weekKey = getLocalWeekKey(now);

  return {
    eventId: STRAWBERRY_EVENT_ID,
    name: STRAWBERRY_EVENT_NAME,
    description: STRAWBERRY_EVENT_DESCRIPTION,
    startDate,
    endDate,
    status: 'active',
    currency: {
      id: 'strawberry_ticket',
      name: '草莓券',
      emoji: '🍓',
      balance: 0,
      totalEarned: 0,
      convertedToCoins: 0,
      convertedToMaterials: 0,
    },
    dailyDate: startDate,
    dailyTasks: buildDailyEventTasksForDate(startDate),
    weeklyChallenge: {
      weekKey,
      weekNumber: 1,
      title: '第 1 週・草莓甜心寫真大賞',
      description: '穿上草莓配件、搭配草莓田背景與草莓濾鏡/拍立得相框拍出甜美寫真！',
      bestScore: 0,
      submittedCount: 0,
      claimedTiers: [],
      lastPhotoId: null,
      lastBreakdown: null,
    },
    consecutiveChallengeWeeks: 0,
    lastQualifiedChallengeWeek: null,
    fedStrawberryFoodWeekKey: null,
    milestones: createInitialStrawberryMilestones(),
    purchasedShopItemIds: [],
    eventPhotoIds: [],
    stats: {
      completedTasksCount: 0,
      plantedOrHarvestedStrawberries: 0,
      strawberryDishesCooked: 0,
      strawberryPhotosTaken: 0,
      coopPartyCompletedCount: 0,
    },
    coopStreakDays: 0,
    lastCoopCompletedDate: null,
    recap: {
      eventId: STRAWBERRY_EVENT_ID,
      seasonKey: `${startDate}_${endDate}`,
      completedTasksCount: 0,
      totalTicketsEarned: 0,
      photosTakenCount: 0,
      accessoriesCollectedCount: 0,
      recipesCookedCount: 0,
      coopCompletedCount: 0,
      bestPhotoId: null,
      coverPhotoId: null,
      savedToMemories: false,
      endedSettled: false,
      convertedCoins: 0,
      convertedMaterials: 0,
    },
    carryoverCatalogItemIds: [],
  };
}

export function createDailyCoopEventSession(dateKey: string): CoopEventSession {
  return {
    id: `coop_evt_${STRAWBERRY_EVENT_ID}_${dateKey}`,
    eventId: STRAWBERRY_EVENT_ID,
    dateKey,
    title: '草莓派對合作任務',
    description: '兩人協力採收草莓、烘焙草莓料理並各拍一張草莓主題照，獎勵完全相同！',
    harvestTarget: 4,
    harvestCount: 0,
    harvestedByUserIds: [],
    cookTarget: 2,
    cookCount: 0,
    cookedByUserIds: [],
    photoTarget: 2,
    photoCount: 0,
    photoByUserIds: [],
    completed: false,
    completedAt: null,
    claimedByUserIds: [],
    picnicPhotoId: null,
    lastUpdatedByName: null,
    lastUpdatedAt: null,
  };
}

export function isStrawberryFood(foodId: string): boolean {
  return STRAWBERRY_FOOD_IDS.includes(foodId);
}

export function isStrawberryRecipe(recipe: Pick<KitchenRecipe, 'id' | 'name' | 'ingredients'>): boolean {
  return (
    STRAWBERRY_RECIPE_IDS.includes(recipe.id) ||
    (recipe.ingredients.strawberry ?? 0) > 0 ||
    recipe.name.includes('草莓')
  );
}

export function isStrawberryAccessoryId(accId: string | null | undefined): boolean {
  if (!accId) return false;
  if (STRAWBERRY_ACCESSORY_IDS.includes(accId)) return true;
  const found = ACCESSORIES.find((a) => a.id === accId);
  return found?.theme === 'strawberry_sweet';
}

export function isStrawberryThemedPhoto(params: {
  title?: string;
  backgroundId?: PhotoBackground;
  filterId?: PhotoFilter;
  frameId?: PhotoFrame;
  stickers?: PhotoStickerId[];
  equipped?: Record<string, string | null>;
}): boolean {
  if (
    params.backgroundId === 'strawberry_field' ||
    params.backgroundId === 'strawberry_season_field'
  ) {
    return true;
  }
  if (params.filterId === 'strawberry' || params.filterId === 'pink') {
    return true;
  }
  if (params.frameId === 'strawberry_polaroid' || params.frameId === 'heart') {
    return true;
  }
  if (params.stickers?.includes('strawberry')) {
    return true;
  }
  if (params.title && params.title.includes('草莓')) {
    return true;
  }
  if (params.equipped) {
    return Object.values(params.equipped).some((id) => isStrawberryAccessoryId(id));
  }
  return false;
}

export function isEventShopItemOwned(state: GameState, item: EventShopItem): boolean {
  const studio = getPhotoStudioState(state);
  switch (item.category) {
    case 'accessory':
      return state.accessories.includes(item.targetId);
    case 'background':
      return studio.unlockedBackgrounds.includes(item.targetId as PhotoBackground);
    case 'filter':
      return studio.unlockedFilters.includes(item.targetId as PhotoFilter);
    case 'frame':
      return (
        studio.unlockedFrames.includes(item.targetId as PhotoFrame) ||
        state.memoryAlbum.unlockedPhotoFrames.includes(item.targetId as PhotoFrame)
      );
    case 'pose':
      return (
        studio.unlockedPoses.includes(item.targetId as PhotoPose) ||
        state.memoryAlbum.unlockedPhotoPoses.includes(item.targetId as PhotoPose)
      );
    case 'title':
      return state.encyclopedia.unlockedTitles.includes(item.targetId as TitleId);
    default:
      return false;
  }
}

export function getEventCarryoverCatalogOwnedIds(state: GameState): string[] {
  const studio = getPhotoStudioState(state);
  const owned = new Set<string>(state.seasonalEvent?.carryoverCatalogItemIds ?? []);

  for (const item of STRAWBERRY_SHOP_ITEMS) {
    if (isEventShopItemOwned(state, item)) {
      owned.add(item.id);
    }
  }
  if (studio.unlockedStudioBadges.includes('strawberry_photographer')) {
    owned.add('cat_sb_badge_photographer');
  }
  if (state.encyclopedia.unlockedTitles.includes('strawberry_fashionista')) {
    owned.add('cat_sb_title_fashionista');
  }
  if (state.coop.unlockedBadges.includes('strawberry_sweetheart_partner')) {
    owned.add('cat_sb_badge_coop_partner');
  }
  return Array.from(owned);
}

export function getBestEventPhotoId(state: GameState, eventPhotoIds: string[]): string | null {
  if (eventPhotoIds.length === 0) return null;
  const photos = state.house.photos.filter((p) => eventPhotoIds.includes(p.id));
  if (photos.length === 0) return eventPhotoIds[0] ?? null;
  const sorted = [...photos].sort((a, b) => {
    const scoreDiff = (b.challengeScore ?? 0) - (a.challengeScore ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    const likeDiff = (b.likes?.length ?? 0) - (a.likes?.length ?? 0);
    if (likeDiff !== 0) return likeDiff;
    return b.createdAt - a.createdAt;
  });
  return sorted[0]?.id ?? null;
}

export function syncSeasonalEventState(
  state: GameState,
  now: Date = new Date()
): GameState {
  const todayKey = getLocalDateString(now);
  const weekKey = getLocalWeekKey(now);
  const existing = state.seasonalEvent ?? createInitialSeasonalEvent(now);

  const isEnded = todayKey > existing.endDate;
  const nextStatus: 'active' | 'ended' = isEnded ? 'ended' : 'active';

  // Daily tasks reset on local date change (never penalize unfinished tasks)
  let nextDailyTasks = existing.dailyTasks;
  let nextDailyDate = existing.dailyDate;
  if (nextDailyDate !== todayKey || nextDailyTasks.length === 0) {
    nextDailyDate = todayKey;
    nextDailyTasks = buildDailyEventTasksForDate(todayKey);
  }

  // Check equip task reactively against active pet
  const activePet = getActivePet(state);
  const equippedStrawberryCount = Object.values(activePet.accessories).filter((accId) =>
    isStrawberryAccessoryId(accId)
  ).length;
  nextDailyTasks = nextDailyTasks.map((task) => {
    if (task.kind !== 'equip_strawberry_acc') return task;
    const nextProg = Math.min(task.target, Math.max(task.progress, equippedStrawberryCount));
    return {
      ...task,
      progress: nextProg,
      completed: task.completed || nextProg >= task.target,
    };
  });

  // Weekly challenge rollover
  let nextWeekly = existing.weeklyChallenge;
  let nextConsecutiveWeeks = existing.consecutiveChallengeWeeks;
  if (nextWeekly.weekKey !== weekKey) {
    const prevWeek = getPreviousWeekKey(weekKey);
    if (
      existing.lastQualifiedChallengeWeek &&
      existing.lastQualifiedChallengeWeek !== prevWeek &&
      existing.lastQualifiedChallengeWeek !== weekKey
    ) {
      nextConsecutiveWeeks = 0;
    }
    const wkNum = getEventWeekNumber(existing.startDate, todayKey);
    nextWeekly = {
      weekKey,
      weekNumber: wkNum,
      title: `第 ${wkNum} 週・草莓甜心寫真大賞`,
      description: '穿上草莓配件、搭配草莓田背景與草莓濾鏡/拍立得相框拍出甜美寫真！',
      bestScore: 0,
      submittedCount: 0,
      claimedTiers: [],
      lastPhotoId: null,
      lastBreakdown: null,
    };
  }

  // Owned strawberry accessories count
  const ownedStrawberryAccessories = state.accessories.filter((id) =>
    isStrawberryAccessoryId(id)
  );
  const hasDuoPhoto = state.house.photos.some(
    (p) => Boolean(p.duoPet) || Boolean(p.isCoopPhoto)
  );

  // Sync milestones automatically
  const baseMilestones =
    existing.milestones.length > 0
      ? existing.milestones
      : createInitialStrawberryMilestones();
  const nextMilestones: EventMilestone[] = baseMilestones.map((m) => {
    let progress = m.progress;
    switch (m.id as EventMilestoneId) {
      case 'strawberry_rookie':
        progress = existing.stats.completedTasksCount;
        break;
      case 'strawberry_photographer':
        progress = existing.stats.strawberryPhotosTaken;
        break;
      case 'strawberry_stylist':
        progress = ownedStrawberryAccessories.length;
        break;
      case 'strawberry_chef':
        progress = existing.stats.strawberryDishesCooked;
        break;
      case 'strawberry_sweetheart':
        progress = existing.stats.completedTasksCount;
        break;
      case 'strawberry_party':
        progress = hasDuoPhoto ? 1 : m.progress;
        break;
    }
    const clamped = Math.min(m.target, Math.max(m.progress, progress));
    return {
      ...m,
      progress: clamped,
      completed: m.completed || clamped >= m.target,
    };
  });

  // Sync Coop Event Session daily
  const existingCoopSession = state.coop.coopEventSession;
  const nextCoopSession =
    existingCoopSession && existingCoopSession.dateKey === todayKey
      ? existingCoopSession
      : createDailyCoopEventSession(todayKey);

  // Sync carryover catalog & recap
  const nextCarryover = getEventCarryoverCatalogOwnedIds(state);
  const bestPhotoId = getBestEventPhotoId(state, existing.eventPhotoIds);
  const nextRecap = {
    ...existing.recap,
    completedTasksCount: existing.stats.completedTasksCount,
    totalTicketsEarned: existing.currency.totalEarned,
    photosTakenCount: existing.eventPhotoIds.length,
    accessoriesCollectedCount: ownedStrawberryAccessories.length,
    recipesCookedCount: existing.stats.strawberryDishesCooked,
    coopCompletedCount: existing.stats.coopPartyCompletedCount,
    bestPhotoId: bestPhotoId ?? existing.recap.bestPhotoId,
    coverPhotoId: existing.recap.coverPhotoId ?? bestPhotoId ?? existing.recap.bestPhotoId,
  };

  return {
    ...state,
    coop: {
      ...state.coop,
      coopEventSession: nextCoopSession,
    },
    seasonalEvent: {
      ...existing,
      status: nextStatus,
      dailyDate: nextDailyDate,
      dailyTasks: nextDailyTasks,
      weeklyChallenge: nextWeekly,
      consecutiveChallengeWeeks: nextConsecutiveWeeks,
      milestones: nextMilestones,
      recap: nextRecap,
      carryoverCatalogItemIds: nextCarryover,
    },
  };
}

function addStrawberryTickets(
  event: SeasonalEvent,
  amount: number
): SeasonalEvent {
  if (amount <= 0 || event.status !== 'active') return event;
  return {
    ...event,
    currency: {
      ...event.currency,
      balance: event.currency.balance + amount,
      totalEarned: event.currency.totalEarned + amount,
    },
  };
}

function advanceDailyEventTask(
  event: SeasonalEvent,
  kind: EventTask['kind'],
  delta: number
): SeasonalEvent {
  if (event.status !== 'active' || delta <= 0) return event;
  return {
    ...event,
    dailyTasks: event.dailyTasks.map((t) => {
      if (t.kind !== kind) return t;
      const nextProg = Math.min(t.target, t.progress + delta);
      return {
        ...t,
        progress: nextProg,
        completed: t.completed || nextProg >= t.target,
      };
    }),
  };
}

function appendEventOfflineSummary(
  events: CoopOfflineEvent[],
  actorUserId: string,
  actorName: string,
  summary: string
): CoopOfflineEvent[] {
  const entry: CoopOfflineEvent = {
    id: `ev_evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    actorUserId,
    actorName,
    gameType: 'event_coop',
    summary,
    createdAt: Date.now(),
  };
  return [entry, ...events].slice(0, 20);
}

// =========================================================================
// Gameplay Integration Hooks
// =========================================================================

export function applyEventOnPlantStrawberry(state: GameState): GameState {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  if (event.status !== 'active') return synced;
  return {
    ...synced,
    seasonalEvent: advanceDailyEventTask(event, 'plant_strawberry', 1),
  };
}

export function applyEventOnHarvestStrawberry(
  state: GameState,
  params: {
    actorUserId: string;
    actorName: string;
    hasSharedRoom: boolean;
    harvestedPlotsCount?: number;
  }
): { nextState: GameState; ticketsEarned: number } {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  if (event.status !== 'active') {
    return { nextState: synced, ticketsEarned: 0 };
  }

  const count = Math.max(1, params.harvestedPlotsCount ?? 1);
  const ticketsEarned = STRAWBERRY_TICKET_REWARDS.harvestStrawberry * count;
  let nextEvent = addStrawberryTickets(event, ticketsEarned);
  nextEvent = {
    ...nextEvent,
    stats: {
      ...nextEvent.stats,
      plantedOrHarvestedStrawberries:
        nextEvent.stats.plantedOrHarvestedStrawberries + count,
    },
  };

  let nextCoop = synced.coop;
  if (params.hasSharedRoom && synced.coop.coopEventSession) {
    const sess = synced.coop.coopEventSession;
    const nextHarvestCount = Math.min(sess.harvestTarget, sess.harvestCount + count);
    const nextHarvestUsers = sess.harvestedByUserIds.includes(params.actorUserId)
      ? sess.harvestedByUserIds
      : [...sess.harvestedByUserIds, params.actorUserId];
    const nowDone =
      nextHarvestCount >= sess.harvestTarget &&
      sess.cookCount >= sess.cookTarget &&
      sess.photoCount >= sess.photoTarget;
    nextCoop = {
      ...nextCoop,
      coopEventSession: {
        ...sess,
        harvestCount: nextHarvestCount,
        harvestedByUserIds: nextHarvestUsers,
        completed: sess.completed || nowDone,
        completedAt: sess.completedAt ?? (nowDone ? Date.now() : null),
        lastUpdatedByName: params.actorName,
        lastUpdatedAt: Date.now(),
      },
      offlineEvents: appendEventOfflineSummary(
        nextCoop.offlineEvents,
        params.actorUserId,
        params.actorName,
        `在草莓派對收成了草莓（${nextHarvestCount}/${sess.harvestTarget}）`
      ),
    };
  }

  return {
    nextState: syncSeasonalEventState({
      ...synced,
      coop: nextCoop,
      seasonalEvent: nextEvent,
    }),
    ticketsEarned,
  };
}

export function applyEventOnCookStrawberry(
  state: GameState,
  params: {
    recipe: KitchenRecipe;
    actorUserId: string;
    actorName: string;
    hasSharedRoom: boolean;
  }
): { nextState: GameState; ticketsEarned: number } {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  if (event.status !== 'active' || !isStrawberryRecipe(params.recipe)) {
    return { nextState: synced, ticketsEarned: 0 };
  }

  const ticketsEarned = STRAWBERRY_TICKET_REWARDS.cookStrawberry;
  let nextEvent = addStrawberryTickets(event, ticketsEarned);
  nextEvent = advanceDailyEventTask(nextEvent, 'cook_strawberry', 1);
  nextEvent = {
    ...nextEvent,
    stats: {
      ...nextEvent.stats,
      strawberryDishesCooked: nextEvent.stats.strawberryDishesCooked + 1,
    },
  };

  let nextCoop = synced.coop;
  if (params.hasSharedRoom && synced.coop.coopEventSession) {
    const sess = synced.coop.coopEventSession;
    const nextCookCount = Math.min(sess.cookTarget, sess.cookCount + 1);
    const nextCookUsers = sess.cookedByUserIds.includes(params.actorUserId)
      ? sess.cookedByUserIds
      : [...sess.cookedByUserIds, params.actorUserId];
    const nowDone =
      sess.harvestCount >= sess.harvestTarget &&
      nextCookCount >= sess.cookTarget &&
      sess.photoCount >= sess.photoTarget;
    nextCoop = {
      ...nextCoop,
      coopEventSession: {
        ...sess,
        cookCount: nextCookCount,
        cookedByUserIds: nextCookUsers,
        completed: sess.completed || nowDone,
        completedAt: sess.completedAt ?? (nowDone ? Date.now() : null),
        lastUpdatedByName: params.actorName,
        lastUpdatedAt: Date.now(),
      },
      offlineEvents: appendEventOfflineSummary(
        nextCoop.offlineEvents,
        params.actorUserId,
        params.actorName,
        `在草莓派對合成了「${params.recipe.name}」（${nextCookCount}/${sess.cookTarget}）`
      ),
    };
  }

  return {
    nextState: syncSeasonalEventState({
      ...synced,
      coop: nextCoop,
      seasonalEvent: nextEvent,
    }),
    ticketsEarned,
  };
}

export function applyEventOnFeedStrawberry(
  state: GameState,
  foodId: string
): GameState {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  if (event.status !== 'active' || !isStrawberryFood(foodId)) {
    return synced;
  }

  let nextEvent = advanceDailyEventTask(event, 'feed_strawberry', 1);
  nextEvent = {
    ...nextEvent,
    fedStrawberryFoodWeekKey: getLocalWeekKey(),
  };
  return syncSeasonalEventState({
    ...synced,
    seasonalEvent: nextEvent,
  });
}

export function applyEventOnMinigamePlayed(state: GameState): GameState {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  if (event.status !== 'active') return synced;
  return syncSeasonalEventState({
    ...synced,
    seasonalEvent: advanceDailyEventTask(event, 'play_minigame', 1),
  });
}

export function applyEventOnStrawberryPhoto(
  state: GameState,
  params: {
    photo: RoomPhotoRecord;
    actorUserId: string;
    actorName: string;
    hasSharedRoom: boolean;
  }
): { nextState: GameState; ticketsEarned: number } {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  if (event.status !== 'active') {
    return { nextState: synced, ticketsEarned: 0 };
  }

  const themed = isStrawberryThemedPhoto({
    title: params.photo.title,
    backgroundId: params.photo.backgroundId,
    filterId: params.photo.filterId,
    frameId: params.photo.frameId,
    stickers: params.photo.stickers,
    equipped: params.photo.equipped,
  });

  if (!themed) {
    return { nextState: synced, ticketsEarned: 0 };
  }

  const ticketsEarned = STRAWBERRY_TICKET_REWARDS.strawberryPhoto;
  let nextEvent = addStrawberryTickets(event, ticketsEarned);
  nextEvent = advanceDailyEventTask(nextEvent, 'photo_strawberry', 1);
  const nextPhotoIds = nextEvent.eventPhotoIds.includes(params.photo.id)
    ? nextEvent.eventPhotoIds
    : [params.photo.id, ...nextEvent.eventPhotoIds].slice(0, 48);

  nextEvent = {
    ...nextEvent,
    eventPhotoIds: nextPhotoIds,
    stats: {
      ...nextEvent.stats,
      strawberryPhotosTaken: nextEvent.stats.strawberryPhotosTaken + 1,
    },
  };

  let nextCoop = synced.coop;
  if (params.hasSharedRoom && synced.coop.coopEventSession) {
    const sess = synced.coop.coopEventSession;
    const nextPhotoUsers = sess.photoByUserIds.includes(params.actorUserId)
      ? sess.photoByUserIds
      : [...sess.photoByUserIds, params.actorUserId];
    const nextPhotoCount = Math.min(
      sess.photoTarget,
      Math.max(sess.photoCount, nextPhotoUsers.length)
    );
    const nowDone =
      sess.harvestCount >= sess.harvestTarget &&
      sess.cookCount >= sess.cookTarget &&
      nextPhotoCount >= sess.photoTarget;
    nextCoop = {
      ...nextCoop,
      coopEventSession: {
        ...sess,
        photoCount: nextPhotoCount,
        photoByUserIds: nextPhotoUsers,
        completed: sess.completed || nowDone,
        completedAt: sess.completedAt ?? (nowDone ? Date.now() : null),
        lastUpdatedByName: params.actorName,
        lastUpdatedAt: Date.now(),
      },
      offlineEvents: appendEventOfflineSummary(
        nextCoop.offlineEvents,
        params.actorUserId,
        params.actorName,
        `拍下草莓季主題照，草莓派對拍照進度 ${nextPhotoCount}/${sess.photoTarget}`
      ),
    };
  }

  return {
    nextState: syncSeasonalEventState({
      ...synced,
      coop: nextCoop,
      seasonalEvent: nextEvent,
    }),
    ticketsEarned,
  };
}

// =========================================================================
// Daily Task & Milestone Claiming
// =========================================================================

export interface EventActionResult {
  nextState: GameState;
  ok: boolean;
  notice: string;
}

export function claimEventDailyTask(
  state: GameState,
  taskId: string
): EventActionResult {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  if (event.status !== 'active') {
    return { nextState: synced, ok: false, notice: '草莓季活動已結束，無法領取每日任務喔！' };
  }
  const task = event.dailyTasks.find((t) => t.id === taskId);
  if (!task) {
    return { nextState: synced, ok: false, notice: '找不到此活動任務。' };
  }
  if (!task.completed) {
    return { nextState: synced, ok: false, notice: '任務尚未完成，加油！' };
  }
  if (task.claimed) {
    return { nextState: synced, ok: false, notice: '今天已經領取過這個任務獎勵囉！' };
  }

  let nextEvent = addStrawberryTickets(event, task.rewardTickets);
  nextEvent = {
    ...nextEvent,
    dailyTasks: nextEvent.dailyTasks.map((t) =>
      t.id === taskId ? { ...t, claimed: true } : t
    ),
    stats: {
      ...nextEvent.stats,
      completedTasksCount: nextEvent.stats.completedTasksCount + 1,
    },
  };

  const nextIngredients = { ...synced.ingredients };
  if (task.rewardIngredientId && task.rewardIngredientQty) {
    nextIngredients[task.rewardIngredientId] =
      (nextIngredients[task.rewardIngredientId] ?? 0) + task.rewardIngredientQty;
  }

  const studio = getPhotoStudioState(synced);
  const nextStudio = task.rewardStudioMaterials
    ? {
        ...studio,
        studioMaterials: studio.studioMaterials + task.rewardStudioMaterials,
      }
    : studio;

  const extraParts: string[] = [
    `🍓 +${task.rewardTickets} 草莓券`,
    `🪙 +${task.rewardCoins} 金幣`,
  ];
  if (task.rewardIngredientId && task.rewardIngredientQty) {
    extraParts.push(
      `${INGREDIENTS[task.rewardIngredientId].emoji} ${INGREDIENTS[task.rewardIngredientId].name} +${task.rewardIngredientQty}`
    );
  }
  if (task.rewardStudioMaterials) {
    extraParts.push(`🎞️ 攝影材料 +${task.rewardStudioMaterials}`);
  }

  const nextState = syncSeasonalEventState({
    ...synced,
    coins: synced.coins + task.rewardCoins,
    ingredients: nextIngredients,
    photoStudio: nextStudio,
    seasonalEvent: nextEvent,
  });

  return {
    nextState,
    ok: true,
    notice: `領取任務獎勵：${extraParts.join('、')}！`,
  };
}

export function claimEventMilestone(
  state: GameState,
  milestoneId: EventMilestoneId
): EventActionResult {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  const milestone = event.milestones.find((m) => m.id === milestoneId);
  if (!milestone) {
    return { nextState: synced, ok: false, notice: '找不到此里程碑。' };
  }
  if (!milestone.completed) {
    return { nextState: synced, ok: false, notice: '尚未達成此里程碑條件喔！' };
  }
  if (milestone.claimed) {
    return { nextState: synced, ok: false, notice: '此里程碑獎勵已領取！' };
  }

  const nextEventBase: SeasonalEvent = {
    ...event,
    currency: {
      ...event.currency,
      balance: event.currency.balance + milestone.rewardTickets,
      totalEarned: event.currency.totalEarned + milestone.rewardTickets,
    },
    milestones: event.milestones.map((m) =>
      m.id === milestoneId ? { ...m, claimed: true } : m
    ),
  };

  let nextState: GameState = {
    ...synced,
    coins: synced.coins + milestone.rewardCoins,
    seasonalEvent: nextEventBase,
  };

  const studio = getPhotoStudioState(nextState);
  const nextFilters = [...studio.unlockedFilters];
  const nextBackgrounds = [...studio.unlockedBackgrounds];
  const nextFrames = [...studio.unlockedFrames];
  const nextAlbumFrames = [...nextState.memoryAlbum.unlockedPhotoFrames];
  const nextAccessories = [...nextState.accessories];
  const nextTitles = [...nextState.encyclopedia.unlockedTitles];
  const nextIngredients = { ...nextState.ingredients };

  if (milestone.rewardFilterId && !nextFilters.includes(milestone.rewardFilterId)) {
    nextFilters.push(milestone.rewardFilterId);
  }
  if (
    milestone.rewardBackgroundId &&
    !nextBackgrounds.includes(milestone.rewardBackgroundId)
  ) {
    nextBackgrounds.push(milestone.rewardBackgroundId);
  }
  if (milestone.rewardFrameId) {
    if (!nextFrames.includes(milestone.rewardFrameId)) {
      nextFrames.push(milestone.rewardFrameId);
    }
    if (!nextAlbumFrames.includes(milestone.rewardFrameId)) {
      nextAlbumFrames.push(milestone.rewardFrameId);
    }
  }
  if (
    milestone.rewardAccessoryId &&
    !nextAccessories.includes(milestone.rewardAccessoryId)
  ) {
    nextAccessories.push(milestone.rewardAccessoryId);
  }
  if (milestone.rewardTitleId && !nextTitles.includes(milestone.rewardTitleId)) {
    nextTitles.push(milestone.rewardTitleId);
  }
  if (milestone.rewardIngredient) {
    nextIngredients[milestone.rewardIngredient.id] =
      (nextIngredients[milestone.rewardIngredient.id] ?? 0) +
      milestone.rewardIngredient.qty;
  }

  nextState = {
    ...nextState,
    accessories: nextAccessories,
    ingredients: nextIngredients,
    encyclopedia: {
      ...nextState.encyclopedia,
      unlockedTitles: nextTitles,
    },
    memoryAlbum: {
      ...nextState.memoryAlbum,
      unlockedPhotoFrames: nextAlbumFrames,
    },
    photoStudio: {
      ...studio,
      unlockedFilters: nextFilters,
      unlockedBackgrounds: nextBackgrounds,
      unlockedFrames: nextFrames,
    },
  };

  nextState = syncAllAccessoryProgress(nextState).nextState;
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `event_milestone_${event.eventId}_${milestone.id}`,
    type: milestone.createsSharedMemory ? 'coop' : 'festival',
    title: `草莓季里程碑：${milestone.title}`,
    description: `${milestone.description}！獲得「${milestone.rewardSummary}」`,
    emoji: milestone.emoji,
    accessoryId: milestone.rewardAccessoryId,
    isShared: Boolean(milestone.createsSharedMemory),
  });
  nextState = syncSeasonalEventState(nextState);

  return {
    nextState,
    ok: true,
    notice: `達成「${milestone.title}」里程碑！獲得 ${milestone.rewardSummary}`,
  };
}

// =========================================================================
// Strawberry Season Shop
// =========================================================================

export function buyEventShopItem(
  state: GameState,
  shopItemId: string
): EventActionResult {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  const item = STRAWBERRY_SHOP_ITEMS.find((i) => i.id === shopItemId);
  if (!item) {
    return { nextState: synced, ok: false, notice: '找不到此活動商店商品。' };
  }
  if (isEventShopItemOwned(synced, item)) {
    return { nextState: synced, ok: false, notice: `你已經擁有「${item.name}」囉！` };
  }
  if (event.currency.balance < item.ticketPrice) {
    return {
      nextState: synced,
      ok: false,
      notice: `草莓券不足！兌換「${item.name}」需要 ${item.ticketPrice} 張草莓券。`,
    };
  }

  const studio = getPhotoStudioState(synced);
  let nextAccessories = [...synced.accessories];
  let nextTitles = [...synced.encyclopedia.unlockedTitles];
  const nextBgs = [...studio.unlockedBackgrounds];
  const nextFilters = [...studio.unlockedFilters];
  const nextFrames = [...studio.unlockedFrames];
  const nextPoses = [...studio.unlockedPoses];
  const nextAlbumFrames = [...synced.memoryAlbum.unlockedPhotoFrames];
  const nextAlbumPoses = [...synced.memoryAlbum.unlockedPhotoPoses];

  switch (item.category) {
    case 'accessory':
      if (!nextAccessories.includes(item.targetId)) {
        nextAccessories = [...nextAccessories, item.targetId];
      }
      break;
    case 'background':
      if (!nextBgs.includes(item.targetId as PhotoBackground)) {
        nextBgs.push(item.targetId as PhotoBackground);
      }
      break;
    case 'filter':
      if (!nextFilters.includes(item.targetId as PhotoFilter)) {
        nextFilters.push(item.targetId as PhotoFilter);
      }
      break;
    case 'frame':
      if (!nextFrames.includes(item.targetId as PhotoFrame)) {
        nextFrames.push(item.targetId as PhotoFrame);
      }
      if (!nextAlbumFrames.includes(item.targetId as PhotoFrame)) {
        nextAlbumFrames.push(item.targetId as PhotoFrame);
      }
      break;
    case 'pose':
      if (!nextPoses.includes(item.targetId as PhotoPose)) {
        nextPoses.push(item.targetId as PhotoPose);
      }
      if (!nextAlbumPoses.includes(item.targetId as PhotoPose)) {
        nextAlbumPoses.push(item.targetId as PhotoPose);
      }
      break;
    case 'title':
      if (!nextTitles.includes(item.targetId as TitleId)) {
        nextTitles = [...nextTitles, item.targetId as TitleId];
      }
      break;
  }

  let nextState: GameState = {
    ...synced,
    accessories: nextAccessories,
    encyclopedia: {
      ...synced.encyclopedia,
      unlockedTitles: nextTitles,
    },
    memoryAlbum: {
      ...synced.memoryAlbum,
      unlockedPhotoFrames: nextAlbumFrames,
      unlockedPhotoPoses: nextAlbumPoses,
    },
    photoStudio: {
      ...studio,
      unlockedBackgrounds: nextBgs,
      unlockedFilters: nextFilters,
      unlockedFrames: nextFrames,
      unlockedPoses: nextPoses,
    },
    seasonalEvent: {
      ...event,
      currency: {
        ...event.currency,
        balance: event.currency.balance - item.ticketPrice,
      },
      purchasedShopItemIds: event.purchasedShopItemIds.includes(item.id)
        ? event.purchasedShopItemIds
        : [...event.purchasedShopItemIds, item.id],
    },
  };

  nextState = syncAllAccessoryProgress(nextState).nextState;
  nextState = syncPhotoStudioState(nextState).nextState;
  nextState = syncSeasonalEventState(nextState);

  return {
    nextState,
    ok: true,
    notice: `成功用 ${item.ticketPrice} 張草莓券兌換「${item.emoji} ${item.name}」！`,
  };
}

// =========================================================================
// Weekly Strawberry Photo Challenge (Personal Scoring)
// =========================================================================

export function evaluateEventPhotoScore(params: {
  equipped: Record<string, string | null>;
  backgroundId: PhotoBackground;
  filterId: PhotoFilter;
  frameId: PhotoFrame;
  fedStrawberryFoodThisWeek: boolean;
}): EventPhotoScoreBreakdown {
  const equippedIds = Object.values(params.equipped).filter((x): x is string =>
    Boolean(x)
  );
  const strawberryAccCount = equippedIds.filter((id) =>
    isStrawberryAccessoryId(id)
  ).length;
  const strawberryAccPoints = strawberryAccCount * 10;

  const backgroundMatched =
    params.backgroundId === 'strawberry_field' ||
    params.backgroundId === 'strawberry_season_field';
  const backgroundPoints = backgroundMatched ? 20 : 0;

  const filterMatched = params.filterId === 'strawberry';
  const filterPoints = filterMatched ? 10 : 0;

  const frameMatched = params.frameId === 'strawberry_polaroid';
  const framePoints = frameMatched ? 10 : 0;

  const fedStrawberryPoints = params.fedStrawberryFoodThisWeek ? 15 : 0;

  const fullSetCompleted = STRAWBERRY_SET_ACCESSORY_IDS.every((reqId) =>
    equippedIds.includes(reqId)
  );
  const fullSetPoints = fullSetCompleted ? 30 : 0;

  const totalScore =
    strawberryAccPoints +
    backgroundPoints +
    filterPoints +
    framePoints +
    fedStrawberryPoints +
    fullSetPoints;

  return {
    totalScore,
    strawberryAccCount,
    strawberryAccPoints,
    backgroundMatched,
    backgroundPoints,
    filterMatched,
    filterPoints,
    frameMatched,
    framePoints,
    fedStrawberryFood: params.fedStrawberryFoodThisWeek,
    fedStrawberryPoints,
    fullSetCompleted,
    fullSetPoints,
  };
}

export function submitEventPhotoChallenge(
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
    actorUserId: string;
    actorName: string;
    hasSharedRoom: boolean;
  },
  now: Date = new Date()
): {
  nextState: GameState;
  photo: RoomPhotoRecord;
  breakdown: EventPhotoScoreBreakdown;
  unlockedNotices: string[];
} {
  const synced = syncSeasonalEventState(state, now);
  const event = synced.seasonalEvent!;
  const activePet = getActivePet(synced);
  const weekKey = event.weeklyChallenge.weekKey;
  const fedThisWeek = event.fedStrawberryFoodWeekKey === weekKey;

  const breakdown = evaluateEventPhotoScore({
    equipped: activePet.accessories,
    backgroundId: params.backgroundId,
    filterId: params.filterId,
    frameId: params.frameId,
    fedStrawberryFoodThisWeek: fedThisWeek,
  });

  const nowTs = now.getTime();
  const cleanTitle =
    params.title.trim().slice(0, 20) ||
    `草莓季寫真・${activePet.name}`.slice(0, 20);
  const photo: RoomPhotoRecord = {
    id: `evp_${nowTs}_${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    caption:
      params.caption.trim().slice(0, 60) ||
      `參加草莓季攝影挑戰獲得 ${breakdown.totalScore} 分！`,
    createdAt: nowTs,
    houseName: synced.house.houseName,
    petId: activePet.id,
    species: activePet.species,
    petName: activePet.name,
    equipped: { ...activePet.accessories },
    poseId: 'happy_jump',
    wallpaperId: synced.house.roomLayout.wallpaperId,
    flooringId: synced.house.roomLayout.flooringId,
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

  let nextConsecutive = event.consecutiveChallengeWeeks;
  let nextLastQualified = event.lastQualifiedChallengeWeek;
  const unlockedNotices: string[] = [];

  if (breakdown.totalScore >= 100 && event.lastQualifiedChallengeWeek !== weekKey) {
    const prevWeek = getPreviousWeekKey(weekKey);
    nextConsecutive =
      event.lastQualifiedChallengeWeek === prevWeek
        ? event.consecutiveChallengeWeeks + 1
        : 1;
    nextLastQualified = weekKey;
  }

  const studio = getPhotoStudioState(synced);
  const nextStudioBadges = [...studio.unlockedStudioBadges];
  if (nextConsecutive >= 2 && !nextStudioBadges.includes('strawberry_photographer')) {
    nextStudioBadges.push('strawberry_photographer');
    unlockedNotices.push(
      `解鎖徽章「${STUDIO_BADGES.strawberry_photographer.emoji} ${STUDIO_BADGES.strawberry_photographer.name}」！`
    );
  }

  const nextTitles = [...synced.encyclopedia.unlockedTitles];
  if (nextConsecutive >= 3 && !nextTitles.includes('strawberry_fashionista')) {
    nextTitles.push('strawberry_fashionista');
    const titleDef = getTitleDefinition('strawberry_fashionista');
    unlockedNotices.push(`解鎖稱號「${titleDef.emoji} ${titleDef.name}」！`);
  }

  let nextState: GameState = {
    ...synced,
    encyclopedia: {
      ...synced.encyclopedia,
      unlockedTitles: nextTitles,
    },
    house: {
      ...synced.house,
      photos: [photo, ...synced.house.photos].slice(0, 48),
    },
    photoStudio: {
      ...studio,
      unlockedStudioBadges: nextStudioBadges,
      totalStudioPhotos: studio.totalStudioPhotos + 1,
    },
    seasonalEvent: {
      ...event,
      weeklyChallenge: {
        ...event.weeklyChallenge,
        bestScore: Math.max(event.weeklyChallenge.bestScore, breakdown.totalScore),
        submittedCount: event.weeklyChallenge.submittedCount + 1,
        lastPhotoId: photo.id,
        lastBreakdown: breakdown,
      },
      consecutiveChallengeWeeks: nextConsecutive,
      lastQualifiedChallengeWeek: nextLastQualified,
    },
  };

  nextState = applyEventOnStrawberryPhoto(nextState, {
    photo,
    actorUserId: params.actorUserId,
    actorName: params.actorName,
    hasSharedRoom: params.hasSharedRoom,
  }).nextState;

  nextState = recordMonthlyActivity(nextState, { interactionLabel: '草莓季攝影挑戰' });
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `event_photo_ch_${weekKey}`,
    petId: activePet.id,
    type: 'festival',
    title: `草莓季週挑戰拿到 ${breakdown.totalScore} 分！`,
    description: `${activePet.name}以「${cleanTitle}」留下一張甜蜜草莓季寫真！`,
    emoji: '🍓',
    photoId: photo.id,
    weight: activePet.weight,
    level: activePet.level,
  });
  nextState = maybeGrantCatPhotoMemoryCard(nextState).nextState;
  nextState = syncSeasonalEventState(nextState, now);

  return { nextState, photo, breakdown, unlockedNotices };
}

export function claimEventChallengeTier(
  state: GameState,
  tier: 60 | 100 | 150
): EventActionResult {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  const weekly = event.weeklyChallenge;

  if (weekly.bestScore < tier) {
    return {
      nextState: synced,
      ok: false,
      notice: `本週草莓攝影挑戰須達到 ${tier} 分才能領取此階獎勵！`,
    };
  }
  if (weekly.claimedTiers.includes(tier)) {
    return { nextState: synced, ok: false, notice: `本週已領取過 ${tier} 分階獎勵囉！` };
  }

  const studio = getPhotoStudioState(synced);
  let ticketBonus = 0;
  let coinBonus = 0;
  let shardBonus = 0;
  const nextPoses = [...studio.unlockedPoses];
  const nextAlbumPoses = [...synced.memoryAlbum.unlockedPhotoPoses];
  let summary = '';

  if (tier === 60) {
    ticketBonus = 10;
    coinBonus = 50;
    summary = '草莓券 ×10 ＋ 金幣 ×50';
  } else if (tier === 100) {
    ticketBonus = 20;
    shardBonus = 1;
    summary = '草莓券 ×20 ＋ 限定相框碎片 ×1';
  } else {
    ticketBonus = 30;
    if (!nextPoses.includes('strawberry_sweetheart')) {
      nextPoses.push('strawberry_sweetheart');
    }
    if (!nextAlbumPoses.includes('strawberry_sweetheart')) {
      nextAlbumPoses.push('strawberry_sweetheart');
    }
    const poseLabel = PHOTO_POSE_BY_ID.strawberry_sweetheart?.label ?? '草莓甜心';
    summary = `草莓券 ×30 ＋ 限定姿勢「${poseLabel}」`;
  }

  const nextEvent = addStrawberryTickets(event, ticketBonus);
  const nextState = syncSeasonalEventState({
    ...synced,
    coins: synced.coins + coinBonus,
    memoryAlbum: {
      ...synced.memoryAlbum,
      unlockedPhotoPoses: nextAlbumPoses,
    },
    photoStudio: {
      ...studio,
      studioFrameShards: studio.studioFrameShards + shardBonus,
      unlockedPoses: nextPoses,
    },
    seasonalEvent: {
      ...nextEvent,
      weeklyChallenge: {
        ...weekly,
        claimedTiers: [...weekly.claimedTiers, tier].sort((a, b) => a - b),
      },
    },
  });

  return {
    nextState,
    ok: true,
    notice: `領取草莓攝影挑戰 ${tier} 分獎勵：${summary}！`,
  };
}

// =========================================================================
// Co-op Strawberry Party Session & Sync
// =========================================================================

export function claimCoopEventSessionReward(
  state: GameState,
  userId: string
): EventActionResult {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  const session = synced.coop.coopEventSession;
  if (!session || !session.completed) {
    return {
      nextState: synced,
      ok: false,
      notice: '需先由兩人協力完成收成草莓、料理與拍照後才能領取獎勵！',
    };
  }
  const actorKey = userId || 'local';
  if (session.claimedByUserIds.includes(actorKey)) {
    return { nextState: synced, ok: false, notice: '你已經領取過今天的草莓派對合作獎勵囉！' };
  }

  const todayKey = getLocalDateString();
  const prevDate = getPreviousDateKey(todayKey);
  let nextStreak = event.coopStreakDays;
  let nextLastDate = event.lastCoopCompletedDate;
  if (event.lastCoopCompletedDate !== todayKey) {
    nextStreak = event.lastCoopCompletedDate === prevDate ? event.coopStreakDays + 1 : 1;
    nextLastDate = todayKey;
  }

  const nextBadges = [...synced.coop.unlockedBadges];
  let badgeNotice = '';
  if (nextStreak >= 3 && !nextBadges.includes('strawberry_sweetheart_partner')) {
    nextBadges.push('strawberry_sweetheart_partner');
    const bDef = COOP_BADGES.strawberry_sweetheart_partner;
    badgeNotice = ` · 解鎖徽章「${bDef.emoji} ${bDef.name}」`;
  }

  const sharedPet = synced.pets.find((p) => isSharedCoopPet(p)) ?? getActivePet(synced);
  const withIntimacy = updatePetById(synced, sharedPet.id, (pet) => ({
    ...pet,
    intimacy: pet.intimacy + 4,
  }));

  const studio = getPhotoStudioState(withIntimacy);
  let nextEvent = addStrawberryTickets(event, STRAWBERRY_TICKET_REWARDS.coopPartyTask);
  nextEvent = advanceDailyEventTask(nextEvent, 'coop_event_task', 1);
  nextEvent = {
    ...nextEvent,
    stats: {
      ...nextEvent.stats,
      coopPartyCompletedCount: nextEvent.stats.coopPartyCompletedCount + 1,
    },
    coopStreakDays: nextStreak,
    lastCoopCompletedDate: nextLastDate,
  };

  let nextState: GameState = {
    ...withIntimacy,
    coins: withIntimacy.coins + 100,
    photoStudio: {
      ...studio,
      studioMaterials: studio.studioMaterials + 1,
    },
    coop: {
      ...withIntimacy.coop,
      unlockedBadges: nextBadges,
      coopEventSession: {
        ...session,
        claimedByUserIds: [...session.claimedByUserIds, actorKey],
      },
    },
    seasonalEvent: nextEvent,
  };

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `coop_strawberry_party_${session.dateKey}`,
    petId: sharedPet.id,
    type: 'coop',
    title: '我們一起完成了草莓派對！',
    description: '兩人合力採收草莓、烘焙甜點並拍下草莓寫真，共享完全相同的甜蜜獎勵！',
    emoji: '🍓',
    isShared: true,
  });
  nextState = syncSeasonalEventState(nextState);

  return {
    nextState,
    ok: true,
    notice: `領取草莓派對合作獎勵：🍓 +8 草莓券、🪙 +100 金幣、🎞️ +1 攝影材料、💞 +4 親密度${badgeNotice}！`,
  };
}

export function createStrawberryPicnicPhoto(
  state: GameState,
  params: {
    partnerPet: DuoPhotoPetInfo;
    actorUserId: string;
    actorName: string;
  }
): { nextState: GameState; photo: RoomPhotoRecord | null; notice: string } {
  const synced = syncSeasonalEventState(state);
  const session = synced.coop.coopEventSession;
  if (!session || !session.completed) {
    return {
      nextState: synced,
      photo: null,
      notice: '先完成今日「草莓派對」合作任務，才能解鎖製作「草莓野餐合照」喔！',
    };
  }

  const activePet = getActivePet(synced);
  const nowTs = Date.now();
  const bgLabel =
    PHOTO_BACKGROUND_BY_ID.strawberry_season_field?.label ?? '草莓田（草莓季）';
  const photo: RoomPhotoRecord = {
    id: `picnic_${nowTs}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${activePet.name}與${params.partnerPet.petName}的草莓野餐合照`.slice(0, 20),
    caption: `完成「草莓派對」後在${bgLabel}鋪開野餐墊留下的甜蜜紀念！`,
    createdAt: nowTs,
    houseName: synced.house.houseName,
    petId: activePet.id,
    species: activePet.species,
    petName: activePet.name,
    equipped: { ...activePet.accessories },
    poseId: 'happy_jump',
    wallpaperId: synced.house.roomLayout.wallpaperId,
    flooringId: synced.house.roomLayout.flooringId,
    placedItems: [],
    photoKind: 'wardrobe',
    scene: 'wardrobe',
    isCoopPhoto: true,
    wardrobePoseId: 'strawberry_sweetheart',
    backgroundId: 'strawberry_season_field',
    facing: 'front',
    filterId: 'strawberry',
    frameId: 'strawberry_polaroid',
    stickers: ['strawberry', 'heart'],
    weightAtCapture: activePet.weight,
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
    coop: {
      ...synced.coop,
      coopEventSession: {
        ...session,
        picnicPhotoId: photo.id,
      },
      offlineEvents: appendEventOfflineSummary(
        synced.coop.offlineEvents,
        params.actorUserId,
        params.actorName,
        '製作了限定「草莓野餐合照」並存入照片牆！'
      ),
    },
  };

  nextState = applyEventOnStrawberryPhoto(nextState, {
    photo,
    actorUserId: params.actorUserId,
    actorName: params.actorName,
    hasSharedRoom: true,
  }).nextState;
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `strawberry_picnic_${session.dateKey}`,
    petId: activePet.id,
    type: 'coop',
    title: '草莓野餐合照紀念',
    description: `${activePet.name}與${params.partnerPet.petName}一起拍下草莓季野餐雙人寫真！`,
    emoji: '🧺',
    photoId: photo.id,
    isShared: true,
  });
  nextState = syncSeasonalEventState(nextState);

  return {
    nextState,
    photo,
    notice: '已製作成限定「草莓野餐合照」並收錄到照片牆與共同回憶冊！',
  };
}

export function mergeCoopEventSession(
  localSession: CoopEventSession | null | undefined,
  remoteSession: CoopEventSession | null | undefined
): CoopEventSession | null {
  if (!localSession && !remoteSession) return null;
  if (!localSession) return remoteSession ?? null;
  if (!remoteSession) return localSession;
  if (localSession.dateKey !== remoteSession.dateKey) {
    return remoteSession.dateKey > localSession.dateKey ? remoteSession : localSession;
  }

  const harvestCount = Math.min(
    remoteSession.harvestTarget,
    Math.max(localSession.harvestCount, remoteSession.harvestCount)
  );
  const cookCount = Math.min(
    remoteSession.cookTarget,
    Math.max(localSession.cookCount, remoteSession.cookCount)
  );
  const photoByUserIds = Array.from(
    new Set([...localSession.photoByUserIds, ...remoteSession.photoByUserIds])
  );
  const photoCount = Math.min(
    remoteSession.photoTarget,
    Math.max(localSession.photoCount, remoteSession.photoCount, photoByUserIds.length)
  );

  const completed =
    localSession.completed ||
    remoteSession.completed ||
    (harvestCount >= remoteSession.harvestTarget &&
      cookCount >= remoteSession.cookTarget &&
      photoCount >= remoteSession.photoTarget);

  const localTs = localSession.lastUpdatedAt ?? 0;
  const remoteTs = remoteSession.lastUpdatedAt ?? 0;

  return {
    ...remoteSession,
    harvestCount,
    harvestedByUserIds: Array.from(
      new Set([...localSession.harvestedByUserIds, ...remoteSession.harvestedByUserIds])
    ),
    cookCount,
    cookedByUserIds: Array.from(
      new Set([...localSession.cookedByUserIds, ...remoteSession.cookedByUserIds])
    ),
    photoCount,
    photoByUserIds,
    completed,
    completedAt: remoteSession.completedAt ?? localSession.completedAt ?? (completed ? Date.now() : null),
    claimedByUserIds: Array.from(
      new Set([...localSession.claimedByUserIds, ...remoteSession.claimedByUserIds])
    ),
    picnicPhotoId: remoteSession.picnicPhotoId ?? localSession.picnicPhotoId,
    lastUpdatedByName:
      remoteTs >= localTs
        ? remoteSession.lastUpdatedByName
        : localSession.lastUpdatedByName,
    lastUpdatedAt: Math.max(localTs, remoteTs) || null,
  };
}

// =========================================================================
// End-of-Event Conversion & Recap
// =========================================================================

export function convertRemainingEventTickets(state: GameState): EventActionResult {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  if (event.status !== 'ended') {
    return {
      nextState: synced,
      ok: false,
      notice: '活動仍在進行中！活動結束後剩餘的草莓券可在此低比例兌換金幣與攝影材料。',
    };
  }
  const bal = event.currency.balance;
  if (bal <= 0) {
    return {
      nextState: synced,
      ok: false,
      notice: '目前沒有剩餘草莓券需要轉換囉！',
    };
  }

  // Low conversion rate: 1 coin per ticket (min 5 if any), plus 1 material per 50 tickets
  const convertedCoins = Math.max(5, bal);
  const convertedMaterials = Math.floor(bal / 50);
  const studio = getPhotoStudioState(synced);

  const nextState = syncSeasonalEventState({
    ...synced,
    coins: synced.coins + convertedCoins,
    photoStudio: {
      ...studio,
      studioMaterials: studio.studioMaterials + convertedMaterials,
    },
    seasonalEvent: {
      ...event,
      currency: {
        ...event.currency,
        balance: 0,
        convertedToCoins: event.currency.convertedToCoins + convertedCoins,
        convertedToMaterials:
          event.currency.convertedToMaterials + convertedMaterials,
      },
      recap: {
        ...event.recap,
        endedSettled: true,
        convertedCoins: event.recap.convertedCoins + convertedCoins,
        convertedMaterials: event.recap.convertedMaterials + convertedMaterials,
      },
    },
  });

  const matText =
    convertedMaterials > 0 ? ` ＋ 🎞️ ${convertedMaterials} 攝影材料` : '';
  return {
    nextState,
    ok: true,
    notice: `已將 ${bal} 張草莓券轉換為 🪙 ${convertedCoins} 金幣${matText}！`,
  };
}

export function selectEventRecapCoverPhoto(
  state: GameState,
  photoId: string
): GameState {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  return {
    ...synced,
    seasonalEvent: {
      ...event,
      recap: {
        ...event.recap,
        coverPhotoId: photoId,
      },
    },
  };
}

export function saveEventRecapToMemories(state: GameState): EventActionResult {
  const synced = syncSeasonalEventState(state);
  const event = synced.seasonalEvent!;
  const recap = event.recap;

  const coverId = recap.coverPhotoId ?? recap.bestPhotoId ?? undefined;
  let nextState = recordMemoryEntry(synced, {
    uniqueKey: `event_recap_${recap.seasonKey}`,
    type: 'festival',
    title: `${event.name}活動回顧卡`,
    description: `完成 ${recap.completedTasksCount} 項任務、收集 ${recap.totalTicketsEarned} 張草莓券、拍下 ${recap.photosTakenCount} 張草莓主題照！`,
    emoji: '🍓',
    photoId: coverId,
  });

  nextState = {
    ...nextState,
    seasonalEvent: {
      ...nextState.seasonalEvent!,
      recap: {
        ...nextState.seasonalEvent!.recap,
        savedToMemories: true,
      },
    },
  };

  return {
    nextState,
    ok: true,
    notice: '已將「草莓季活動回顧卡」珍藏至回憶冊！',
  };
}

export function getEventActionBadgeCount(
  state: GameState,
  userId: string = 'local'
): number {
  const event = state.seasonalEvent;
  if (!event) return 0;
  const claimableTasks = event.dailyTasks.filter(
    (t) => t.completed && !t.claimed
  ).length;
  const claimableMilestones = event.milestones.filter(
    (m) => m.completed && !m.claimed
  ).length;
  const actorKey = userId || 'local';
  const coopClaimable =
    state.coop.coopEventSession?.completed &&
    !state.coop.coopEventSession.claimedByUserIds.includes(actorKey)
      ? 1
      : 0;
  return claimableTasks + claimableMilestones + coopClaimable;
}
