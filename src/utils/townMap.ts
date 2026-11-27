import { FOODS } from '../data/foods';
import { ROOM_ITEM_BY_ID } from '../data/house';
import { INGREDIENTS } from '../data/kitchen';
import {
  ACTIVE_TOWN_LOCATIONS,
  ACTIVE_TOWN_LOCATION_IDS,
  COOP_TOWN_EXPLORE_TEMPLATES,
  LOCATION_DAILY_QUEST_TEMPLATES,
  TOWN_LOCATION_BY_ID,
  TOWN_MARKET_FURNITURE_IDS,
  TOWN_SHOP_ITEM_BY_ID,
  TOWN_VISITOR_AFFINITY_THRESHOLDS,
  TOWN_VISITORS,
  TOWN_VISITOR_BY_ID,
  VISITOR_HUT_FACILITY_BY_ID,
  VISITOR_HUT_LEVEL_BY_NUM,
} from '../data/town';
import { VISITOR_TREAT_BY_ID } from '../data/visitors';
import {
  ActiveTownLocationId,
  CoopMessageCard,
  CoopOfflineEvent,
  CoopTownExploreSession,
  GameState,
  IngredientId,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  RoomPhotoRecord,
  TitleId,
  TownLocationProgressState,
  TownLocationQuest,
  TownLocationVisitorInstance,
  TownMapState,
  TownVisitorAffinityRecord,
  TownVisitorId,
  VisitorHutFacilityId,
  VisitorOffering,
  VisitorTreatId,
} from '../types';
import { getPhotoStudioState } from './photoStudio';
import { recordMemoryEntry } from './memories';
import { syncAllAccessoryProgress } from './accessories';
import { getSeasonalWeatherVisitorModifiers } from './seasons';

export interface TownActionResult {
  nextState: GameState;
  ok: boolean;
  notice?: string;
  error?: string;
  spawnedVisitorId?: TownVisitorId;
}

const RARE_INGREDIENT_POOL: IngredientId[] = [
  'blueberry',
  'mint',
  'sunflower',
  'moon_wheat',
  'dream_cocoa',
];

export function formatTownDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getPreviousDateKey(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return '';
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() - 1);
  return formatTownDateKey(dt);
}

function getDayIndexFromKey(dateKey: string): number {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return 0;
  return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
}

function buildDailyQuestsForLocation(locationId: ActiveTownLocationId): TownLocationQuest[] {
  return LOCATION_DAILY_QUEST_TEMPLATES[locationId].map((tpl) => ({
    ...tpl,
    progress: 0,
    completed: false,
    claimed: false,
  }));
}

function createInitialLocationProgress(
  locationId: ActiveTownLocationId,
  dateKey: string
): TownLocationProgressState {
  return {
    locationId,
    dailyDate: dateKey,
    dailyVisitorsCount: 0,
    activeVisitors: [],
    dailyQuests: buildDailyQuestsForLocation(locationId),
    allQuestsBonusClaimed: false,
    totalVisitsHosted: 0,
    totalPhotosTaken: 0,
    unlockedBackgroundIds: [],
    unlockedFilterIds: [],
    unlockedFrameIds: [],
    encyclopediaRewardClaimed: false,
  };
}

function createInitialVisitorAffinities(): Record<TownVisitorId, TownVisitorAffinityRecord> {
  return TOWN_VISITORS.reduce(
    (acc, v) => {
      acc[v.id] = {
        visitorId: v.id,
        level: 1,
        exp: 0,
        totalVisits: 0,
        totalFed: 0,
        totalPhotos: 0,
        firstMetAt: null,
      };
      return acc;
    },
    {} as Record<TownVisitorId, TownVisitorAffinityRecord>
  );
}

export function createInitialTownMapState(now: Date = new Date()): TownMapState {
  const dateKey = formatTownDateKey(now);
  return {
    currentLocationId: 'home_yard',
    unlockedLocationIds: ['home_yard'],
    townTickets: {
      balance: 0,
      totalEarned: 0,
    },
    visitorHut: {
      level: 1,
      builtFacilities: [],
    },
    locations: {
      home_yard: createInitialLocationProgress('home_yard', dateKey),
      acorn_forest: createInitialLocationProgress('acorn_forest', dateKey),
      lake_park: createInitialLocationProgress('lake_park', dateKey),
      town_market: createInitialLocationProgress('town_market', dateKey),
    },
    visitorAffinities: createInitialVisitorAffinities(),
    purchasedShopItemIds: [],
    unlockedMarketFurnitureIds: [],
    acornsCollectedTotal: 0,
    fishingGamesPlayedTotal: 0,
    fishingBestScore: 0,
    marketDishesDeliveredTotal: 0,
  };
}

export function getTownVisitorLevelForExp(exp: number): number {
  let lv = 1;
  for (let i = 0; i < TOWN_VISITOR_AFFINITY_THRESHOLDS.length; i += 1) {
    if (exp >= TOWN_VISITOR_AFFINITY_THRESHOLDS[i]) {
      lv = i + 1;
    }
  }
  return Math.min(5, lv);
}

export function isTownLocationUnlocked(
  state: GameState,
  locationId: ActiveTownLocationId
): { unlocked: boolean; reason: string } {
  const maxPetLevel = state.pets.reduce((maxLv, p) => Math.max(maxLv, p.level), 1);
  const novice7Done =
    state.noviceGrowth.claimedDays.includes(7) || state.noviceGrowth.claimedDays.length >= 7;

  switch (locationId) {
    case 'home_yard':
      return { unlocked: true, reason: '預設解鎖' };
    case 'acorn_forest':
      return {
        unlocked: novice7Done || maxPetLevel >= 2,
        reason: '完成新手 7 天成長之路 或 寵物達 Lv.2 解鎖',
      };
    case 'lake_park':
      return {
        unlocked: maxPetLevel >= 3,
        reason: '寵物達 Lv.3 解鎖',
      };
    case 'town_market':
      return {
        unlocked: maxPetLevel >= 3,
        reason: '寵物達 Lv.3 解鎖',
      };
  }
}

export function getLocationDailyVisitorMax(
  townMap: TownMapState,
  locationId: ActiveTownLocationId
): number {
  if (locationId === 'home_yard') {
    const hutInfo = VISITOR_HUT_LEVEL_BY_NUM[townMap.visitorHut.level];
    return 2 + hutInfo.dailyCapacityBonus;
  }
  return 2;
}

export function getTownRareVisitorRatePercent(
  state: GameState,
  locationId: ActiveTownLocationId
): number {
  const townMap = state.townMap ?? createInitialTownMapState();
  const hutInfo = VISITOR_HUT_LEVEL_BY_NUM[townMap.visitorHut.level];
  const locState = townMap.locations[locationId];
  const completedQuests = locState.dailyQuests.filter((q) => q.completed).length;
  const hasRareSign = townMap.visitorHut.builtFacilities.includes('rare_sign');
  const hasFlowerBush =
    locationId === 'home_yard' && townMap.visitorHut.builtFacilities.includes('flower_bush');
  const coopActive =
    Boolean(state.coop.coopTownSession) &&
    state.coop.coopTownSession?.locationId === locationId &&
    !state.coop.coopTownSession.completed;

  const base = 12;
  const total =
    base +
    hutInfo.rareRateBonusPercent * 0.4 +
    completedQuests * 10 +
    (hasRareSign ? 22 : 0) +
    (hasFlowerBush ? 10 : 0) +
    (coopActive ? 14 : 0);

  return Math.min(72, Math.round(total));
}

export function grantTownTickets(
  townMap: TownMapState,
  amount: number
): TownMapState {
  if (amount <= 0) return townMap;
  return {
    ...townMap,
    townTickets: {
      balance: townMap.townTickets.balance + amount,
      totalEarned: townMap.townTickets.totalEarned + amount,
    },
  };
}

export function syncTownMapState(state: GameState, now: Date = new Date()): GameState {
  const dateKey = formatTownDateKey(now);
  const nowMs = now.getTime();
  const base = state.townMap ?? createInitialTownMapState(now);

  const unlockedSet = new Set<ActiveTownLocationId>(['home_yard']);
  for (const locId of ACTIVE_TOWN_LOCATION_IDS) {
    if (isTownLocationUnlocked(state, locId).unlocked) {
      unlockedSet.add(locId);
    }
  }

  const nextLocations = { ...base.locations };
  const studio = getPhotoStudioState(state);
  const nextBgs = new Set<PhotoBackground>(studio.unlockedBackgrounds);
  const nextFilters = new Set<PhotoFilter>(studio.unlockedFilters);
  const nextFrames = new Set<PhotoFrame>(studio.unlockedFrames);

  let changed = !state.townMap;

  for (const locId of ACTIVE_TOWN_LOCATION_IDS) {
    const currentLoc = base.locations[locId] ?? createInitialLocationProgress(locId, dateKey);
    const activeNonExpired = currentLoc.activeVisitors.filter((v) => v.departAt > nowMs);
    const isNewDay = currentLoc.dailyDate !== dateKey;

    let updatedLoc: TownLocationProgressState = isNewDay
      ? {
          ...currentLoc,
          dailyDate: dateKey,
          dailyVisitorsCount: 0,
          activeVisitors: [],
          dailyQuests: buildDailyQuestsForLocation(locId),
          allQuestsBonusClaimed: false,
        }
      : activeNonExpired.length !== currentLoc.activeVisitors.length
      ? { ...currentLoc, activeVisitors: activeNonExpired }
      : currentLoc;

    // Auto-unlock location entry photography souvenirs when a location unlocks
    if (unlockedSet.has(locId)) {
      if (locId === 'acorn_forest' && !updatedLoc.unlockedBackgroundIds.includes('acorn_trail')) {
        updatedLoc = {
          ...updatedLoc,
          unlockedBackgroundIds: [...updatedLoc.unlockedBackgroundIds, 'acorn_trail'],
        };
        nextBgs.add('acorn_trail');
        changed = true;
      }
      if (locId === 'lake_park') {
        const addBgs: PhotoBackground[] = updatedLoc.unlockedBackgroundIds.includes('waterfront_bridge')
          ? []
          : ['waterfront_bridge'];
        const addFilters: PhotoFilter[] = updatedLoc.unlockedFilterIds.includes('lakeside_breeze')
          ? []
          : ['lakeside_breeze'];
        if (addBgs.length > 0 || addFilters.length > 0) {
          updatedLoc = {
            ...updatedLoc,
            unlockedBackgroundIds: [...updatedLoc.unlockedBackgroundIds, ...addBgs],
            unlockedFilterIds: [...updatedLoc.unlockedFilterIds, ...addFilters],
          };
          nextBgs.add('waterfront_bridge');
          nextFilters.add('lakeside_breeze');
          changed = true;
        }
      }
      if (locId === 'town_market' && !updatedLoc.unlockedBackgroundIds.includes('wooden_stalls')) {
        updatedLoc = {
          ...updatedLoc,
          unlockedBackgroundIds: [...updatedLoc.unlockedBackgroundIds, 'wooden_stalls'],
        };
        nextBgs.add('wooden_stalls');
        changed = true;
      }
    }

    if (updatedLoc !== currentLoc) {
      changed = true;
    }
    nextLocations[locId] = updatedLoc;
  }

  // Keep Visitor Hut Lv.5 background unlocked
  if (base.visitorHut.level >= 5 && !nextBgs.has('dream_lodge_bg')) {
    nextBgs.add('dream_lodge_bg');
    changed = true;
  }

  // Sync owned town market furniture from house
  const ownedMarketIds = TOWN_MARKET_FURNITURE_IDS.filter(
    (fid) =>
      (state.house.ownedFurnitureCounts[fid] ?? 0) > 0 ||
      state.house.collectedFurnitureIds.includes(fid)
  );
  const mergedMarketIds = Array.from(
    new Set([...base.unlockedMarketFurnitureIds, ...ownedMarketIds])
  );
  if (mergedMarketIds.length !== base.unlockedMarketFurnitureIds.length) {
    changed = true;
  }

  // Sync shared yard affinities (bird/squirrel/rabbit) peacefully
  const nextAffinities = { ...base.visitorAffinities };
  for (const vid of ['bird', 'squirrel', 'rabbit'] as const) {
    const yardAff = state.visitorState?.affinities[vid];
    const townAff = nextAffinities[vid];
    if (yardAff && townAff && yardAff.exp > townAff.exp) {
      nextAffinities[vid] = {
        ...townAff,
        exp: yardAff.exp,
        level: getTownVisitorLevelForExp(yardAff.exp),
        totalVisits: Math.max(townAff.totalVisits, yardAff.totalVisits),
        totalFed: Math.max(townAff.totalFed, yardAff.totalFed),
      };
      changed = true;
    }
  }

  const nextUnlockedIds = Array.from(unlockedSet);
  if (nextUnlockedIds.length !== base.unlockedLocationIds.length) {
    changed = true;
  }

  // Sync unlocked backgrounds/filters/frames from Town Shop & location rewards
  for (const loc of Object.values(nextLocations)) {
    loc.unlockedBackgroundIds.forEach((b) => nextBgs.add(b));
    loc.unlockedFilterIds.forEach((f) => nextFilters.add(f));
    loc.unlockedFrameIds.forEach((fr) => nextFrames.add(fr));
  }

  const nextTownMap: TownMapState = {
    ...base,
    unlockedLocationIds: nextUnlockedIds,
    locations: nextLocations,
    visitorAffinities: nextAffinities,
    unlockedMarketFurnitureIds: mergedMarketIds,
  };

  const studioChanged =
    nextBgs.size !== studio.unlockedBackgrounds.length ||
    nextFilters.size !== studio.unlockedFilters.length ||
    nextFrames.size !== studio.unlockedFrames.length;

  if (!changed && !studioChanged) {
    return state;
  }

  return {
    ...state,
    townMap: nextTownMap,
    photoStudio: {
      ...studio,
      unlockedBackgrounds: Array.from(nextBgs),
      unlockedFilters: Array.from(nextFilters),
      unlockedFrames: Array.from(nextFrames),
    },
  };
}

function pickWeightedTownVisitor(
  state: GameState,
  locationId: ActiveTownLocationId
): TownVisitorId {
  const townMap = state.townMap ?? createInitialTownMapState();
  const locDef = TOWN_LOCATION_BY_ID[locationId];
  const rarePercent = getTownRareVisitorRatePercent(state, locationId);
  const seasonMods = getSeasonalWeatherVisitorModifiers(state);
  const isStorm = state.dialogue.weather.condition === 'storm';
  const effectiveRarePercent = isStorm ? Math.max(5, Math.round(rarePercent * 0.7)) : rarePercent;
  const rollRare = Math.random() * 100 < effectiveRarePercent && locDef.rareVisitorIds.length > 0;

  const basePool = rollRare ? [...locDef.rareVisitorIds] : [...locDef.commonVisitorIds];
  for (const seasonVid of seasonMods.seasonActiveVisitorIds) {
    const def = TOWN_VISITOR_BY_ID[seasonVid];
    if (!def || !def.homeLocationIds.includes(locationId)) continue;
    const matchesTier = rollRare ? def.rarity === 'rare' : def.rarity === 'common';
    if (matchesTier && !basePool.includes(seasonVid)) {
      basePool.push(seasonVid);
    }
  }

  const activeIds = new Set(
    townMap.locations[locationId].activeVisitors.map((v) => v.visitorId)
  );
  const candidates = basePool.filter((id) => !activeIds.has(id));
  const finalPool = candidates.length > 0 ? candidates : basePool;

  const built = townMap.visitorHut.builtFacilities;
  const weighted = finalPool.map((vid) => {
    let w = TOWN_VISITOR_BY_ID[vid].baseWeight;
    if (vid === 'bird' && built.includes('bird_feeder')) w *= 1.45;
    if (vid === 'squirrel' && built.includes('nut_bowl')) w *= 1.45;
    if (vid === 'rabbit' && built.includes('carrot_patch')) w *= 1.45;
    if (vid === 'duck' && built.includes('mini_pond')) w *= 1.45;
    if (vid === 'butterfly' && built.includes('flower_bush')) w *= 1.6;
    if (vid === 'butterfly' && state.house.activeFarmDecor.flowerbedId) w *= 1.2;
    const swMult = seasonMods.townMultiplier[vid] ?? 1;
    w *= swMult;
    return { vid, w };
  });

  const totalW = weighted.reduce((sum, item) => sum + item.w, 0);
  let r = Math.random() * totalW;
  for (const item of weighted) {
    r -= item.w;
    if (r <= 0) return item.vid;
  }
  return weighted[0].vid;
}

export function spawnTownLocationVisitor(
  state: GameState,
  locationId: ActiveTownLocationId,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  const townMap = synced.townMap!;
  if (!townMap.unlockedLocationIds.includes(locationId)) {
    return { nextState: synced, ok: false, error: '尚未解鎖這個小鎮地點喔！' };
  }

  const locState = townMap.locations[locationId];
  const maxDaily = getLocationDailyVisitorMax(townMap, locationId);
  if (locState.dailyVisitorsCount >= maxDaily) {
    return {
      nextState: synced,
      ok: false,
      error: `今天在「${TOWN_LOCATION_BY_ID[locationId].name}」已經招待滿 ${maxDaily} 位訪客囉，明天再來吧！`,
    };
  }

  const visitorId = pickWeightedTownVisitor(synced, locationId);
  const visitorDef = TOWN_VISITOR_BY_ID[visitorId];
  const hutInfo = VISITOR_HUT_LEVEL_BY_NUM[townMap.visitorHut.level];
  const hasLantern = townMap.visitorHut.builtFacilities.includes('lantern');
  const durationMultiplier =
    1 + hutInfo.stayBonusPercent / 100 + (hasLantern ? 0.35 : 0);
  const stayMs = Math.round(visitorDef.stayDurationMs * durationMultiplier);
  const nowMs = now.getTime();

  const instance: TownLocationVisitorInstance = {
    visitId: `tv_${nowMs}_${Math.random().toString(36).slice(2, 6)}`,
    locationId,
    visitorId,
    rarity: visitorDef.rarity,
    arrivedAt: nowMs,
    departAt: nowMs + stayMs,
    fedCount: 0,
    maxFeedCount: 2,
    photoTaken: false,
    lastFeedReaction: null,
    lastFeedLine: null,
    lastRewardSummary: null,
  };

  const prevAff = townMap.visitorAffinities[visitorId];
  const nextAff: TownVisitorAffinityRecord = {
    ...prevAff,
    totalVisits: prevAff.totalVisits + 1,
    firstMetAt: prevAff.firstMetAt ?? nowMs,
  };

  let nextState: GameState = {
    ...synced,
    townMap: {
      ...townMap,
      currentLocationId: locationId,
      locations: {
        ...townMap.locations,
        [locationId]: {
          ...locState,
          dailyVisitorsCount: locState.dailyVisitorsCount + 1,
          activeVisitors: [...locState.activeVisitors, instance],
        },
      },
      visitorAffinities: {
        ...townMap.visitorAffinities,
        [visitorId]: nextAff,
      },
    },
  };

  if (visitorDef.rarity === 'rare') {
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: `town_rare_${visitorId}`,
      type: 'town',
      title: `遇見稀有訪客「${visitorDef.name}」！`,
      description: `在「${TOWN_LOCATION_BY_ID[locationId].name}」幸運邂逅稀有動物朋友 ${visitorDef.speciesLabel}！`,
      emoji: visitorDef.emoji,
      dateKey: formatTownDateKey(now),
    });
  }

  return {
    nextState,
    ok: true,
    spawnedVisitorId: visitorId,
    notice:
      visitorDef.rarity === 'rare'
        ? `✨ 稀有訪客「${visitorDef.name}」來到${TOWN_LOCATION_BY_ID[locationId].name}了！`
        : `${visitorDef.emoji} 「${visitorDef.name}」來${TOWN_LOCATION_BY_ID[locationId].name}逛逛囉！`,
  };
}

export function enterTownLocation(
  state: GameState,
  locationId: ActiveTownLocationId,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  const townMap = synced.townMap!;
  if (!townMap.unlockedLocationIds.includes(locationId)) {
    return {
      nextState: synced,
      ok: false,
      error: isTownLocationUnlocked(synced, locationId).reason,
    };
  }

  const nextState: GameState = {
    ...synced,
    townMap: {
      ...townMap,
      currentLocationId: locationId,
    },
  };

  const locState = nextState.townMap!.locations[locationId];
  const maxDaily = getLocationDailyVisitorMax(nextState.townMap!, locationId);
  if (locState.activeVisitors.length === 0 && locState.dailyVisitorsCount < maxDaily) {
    return spawnTownLocationVisitor(nextState, locationId, now);
  }

  return { nextState, ok: true };
}

function advanceLocationQuests(
  quests: TownLocationQuest[],
  matcher: (q: TownLocationQuest) => boolean,
  delta = 1
): { nextQuests: TownLocationQuest[]; newlyCompleted: string[] } {
  const newlyCompleted: string[] = [];
  const nextQuests = quests.map((q) => {
    if (q.completed || !matcher(q)) return q;
    const progress = Math.min(q.target, q.progress + delta);
    const completed = progress >= q.target;
    if (completed) newlyCompleted.push(q.title);
    return { ...q, progress, completed };
  });
  return { nextQuests, newlyCompleted };
}

export function getTownOfferingKey(offering: VisitorOffering): string {
  return `${offering.kind}:${offering.id}`;
}

export function getTownOfferingLabel(offering: VisitorOffering): {
  name: string;
  emoji: string;
} {
  if (offering.kind === 'ingredient') {
    const ing = INGREDIENTS[offering.id];
    return { name: ing.name, emoji: ing.emoji };
  }
  if (offering.kind === 'treat') {
    const tr = VISITOR_TREAT_BY_ID[offering.id];
    return { name: tr.name, emoji: tr.emoji };
  }
  const food = FOODS.find((f) => f.id === offering.id);
  return { name: food?.name ?? '料理', emoji: food?.emoji ?? '🍽️' };
}

export function feedTownVisitor(
  state: GameState,
  locationId: ActiveTownLocationId,
  visitId: string,
  offerings: VisitorOffering[],
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  let townMap = synced.townMap!;
  const locState = townMap.locations[locationId];
  const visit = locState.activeVisitors.find((v) => v.visitId === visitId);
  if (!visit) {
    return { nextState: synced, ok: false, error: '這位訪客已經先離開囉！' };
  }
  if (visit.fedCount >= visit.maxFeedCount) {
    return { nextState: synced, ok: false, error: '這位訪客已經吃得飽飽超滿足了！' };
  }

  const hasTreatTable = townMap.visitorHut.builtFacilities.includes('treat_table');
  const maxBundle = hasTreatTable ? 3 : 1;
  const chosen = offerings.slice(0, maxBundle);
  if (chosen.length === 0) {
    return { nextState: synced, ok: false, error: '請至少選擇 1 份食材或點心！' };
  }

  // Verify inventory counts
  const nextIngredients = { ...synced.ingredients };
  const nextFoods = { ...synced.foods };
  const nextTreats = { ...(synced.visitorTreats ?? {}) };

  for (const off of chosen) {
    if (off.kind === 'ingredient') {
      if ((nextIngredients[off.id] ?? 0) <= 0) {
        return { nextState: synced, ok: false, error: '庫存食材不足喔！' };
      }
      nextIngredients[off.id] = (nextIngredients[off.id] ?? 0) - 1;
    } else if (off.kind === 'food') {
      if ((nextFoods[off.id] ?? 0) <= 0) {
        return { nextState: synced, ok: false, error: '庫存料理不足喔！' };
      }
      nextFoods[off.id] = (nextFoods[off.id] ?? 0) - 1;
    } else {
      if ((nextTreats[off.id] ?? 0) <= 0) {
        return { nextState: synced, ok: false, error: '訪客點心不足喔！' };
      }
      nextTreats[off.id] = (nextTreats[off.id] ?? 0) - 1;
    }
  }

  const visitorDef = TOWN_VISITOR_BY_ID[visit.visitorId];
  let favCount = 0;
  let dislikedCount = 0;
  for (const off of chosen) {
    const key = getTownOfferingKey(off);
    if (visitorDef.favoriteOfferingKeys.includes(key)) {
      favCount += 1;
    } else if (visitorDef.dislikedOfferingKeys.includes(key)) {
      dislikedCount += 1;
    }
  }

  const reaction: 'favorite' | 'neutral' | 'disliked' =
    favCount > 0 ? 'favorite' : dislikedCount > 0 ? 'disliked' : 'neutral';

  const baseExp =
    favCount > 0 ? 4 + (favCount - 1) * 2 : dislikedCount > 0 ? 1 : 2;
  const comboExpBonus = hasTreatTable && chosen.length >= 2 ? 1 : 0;
  const expGain = baseExp + comboExpBonus;

  const isRare = visitorDef.rarity === 'rare';
  const baseCoins =
    (reaction === 'favorite' ? 28 : reaction === 'neutral' ? 18 : 10) *
      Math.max(1, chosen.length === 3 ? 2 : 1) +
    (isRare ? 15 : 0);
  const ticketReward =
    2 + (isRare ? 1 : 0) + (hasTreatTable && chosen.length >= 2 ? 1 : 0);
  const materialGain = isRare || reaction === 'favorite' ? 1 : 0;
  const filterShardGain = isRare ? 1 : reaction === 'favorite' ? 1 : 0;
  const furnitureShardGain = isRare ? 1 : 0;

  let rareIngNotice = '';
  if (isRare || (reaction === 'favorite' && Math.random() < 0.45)) {
    const rareId =
      RARE_INGREDIENT_POOL[Math.floor(Math.random() * RARE_INGREDIENT_POOL.length)];
    nextIngredients[rareId] = (nextIngredients[rareId] ?? 0) + 1;
    rareIngNotice = `、${INGREDIENTS[rareId].name} x1`;
  }

  const prevAff = townMap.visitorAffinities[visit.visitorId];
  const nextExp = prevAff.exp + expGain;
  const nextLevel = getTownVisitorLevelForExp(nextExp);
  const leveledUp = nextLevel > prevAff.level;

  const linePool =
    reaction === 'favorite'
      ? visitorDef.favoriteFeedLines
      : reaction === 'disliked'
      ? visitorDef.dislikedFeedLines
      : visitorDef.neutralFeedLines;
  const feedLine = linePool[Math.floor(Math.random() * linePool.length)];

  const rewardSummaryParts = [
    `+${ticketReward} 小鎮券`,
    `+${baseCoins} 金幣`,
    `+${expGain} 好感`,
  ];
  if (materialGain > 0) rewardSummaryParts.push(`+${materialGain} 攝影材料`);
  if (filterShardGain > 0) rewardSummaryParts.push(`+${filterShardGain} 濾鏡碎片`);
  if (furnitureShardGain > 0) rewardSummaryParts.push(`+${furnitureShardGain} 家具碎片`);
  const rewardSummary = rewardSummaryParts.join('、') + rareIngNotice;

  const nextActiveVisitors = locState.activeVisitors.map((v) =>
    v.visitId === visitId
      ? {
          ...v,
          fedCount: v.fedCount + 1,
          lastFeedReaction: reaction,
          lastFeedLine: feedLine,
          lastRewardSummary: rewardSummary,
        }
      : v
  );

  const { nextQuests, newlyCompleted } = advanceLocationQuests(
    locState.dailyQuests,
    (q) => q.kind === 'host_location_visitor'
  );

  const studio = getPhotoStudioState(synced);
  townMap = grantTownTickets(townMap, ticketReward);

  // Unlock location-specific special frame upon hosting enough visitors or level up
  const nextUnlockedFrames = new Set<PhotoFrame>(locState.unlockedFrameIds);
  const nextStudioFrames = new Set<PhotoFrame>(studio.unlockedFrames);
  if (locationId === 'lake_park' && visit.visitorId === 'duck') {
    nextUnlockedFrames.add('duck_frame');
    nextStudioFrames.add('duck_frame');
  }

  let nextState: GameState = {
    ...synced,
    coins: synced.coins + baseCoins,
    furnitureShards: synced.furnitureShards + furnitureShardGain,
    filterShards: (synced.filterShards ?? 0) + filterShardGain,
    ingredients: nextIngredients,
    foods: nextFoods,
    visitorTreats: nextTreats,
    photoStudio: {
      ...studio,
      studioMaterials: studio.studioMaterials + materialGain,
      unlockedFrames: Array.from(nextStudioFrames),
    },
    townMap: {
      ...townMap,
      locations: {
        ...townMap.locations,
        [locationId]: {
          ...locState,
          activeVisitors: nextActiveVisitors,
          dailyQuests: nextQuests,
          totalVisitsHosted: locState.totalVisitsHosted + 1,
          unlockedFrameIds: Array.from(nextUnlockedFrames),
        },
      },
      visitorAffinities: {
        ...townMap.visitorAffinities,
        [visit.visitorId]: {
          ...prevAff,
          exp: nextExp,
          level: nextLevel,
          totalFed: prevAff.totalFed + chosen.length,
        },
      },
    },
  };

  const levelNotice = leveledUp
    ? ` 🎉 ${visitorDef.speciesLabel}好感度升至 Lv.${nextLevel}！`
    : '';
  const questNotice =
    newlyCompleted.length > 0 ? ` · 完成地點任務「${newlyCompleted[0]}」` : '';

  return {
    nextState,
    ok: true,
    notice: `招待「${visitorDef.name}」獲得：${rewardSummary}${levelNotice}${questNotice}`,
  };
}

export function captureTownVisitorPhoto(
  state: GameState,
  locationId: ActiveTownLocationId,
  visitId: string,
  now: Date = new Date()
): { nextState: GameState; ticketGain: number; notice: string } {
  const synced = syncTownMapState(state, now);
  let townMap = synced.townMap!;
  const locState = townMap.locations[locationId];
  const visit = locState.activeVisitors.find((v) => v.visitId === visitId);
  if (!visit) {
    return { nextState: synced, ticketGain: 0, notice: '訪客已經先離開囉！' };
  }

  const firstPhotoThisVisit = !visit.photoTaken;
  const ticketGain = firstPhotoThisVisit ? 3 : 0;
  const filterShardGain = firstPhotoThisVisit ? 1 : 0;
  townMap = grantTownTickets(townMap, ticketGain);

  const nextActive = locState.activeVisitors.map((v) =>
    v.visitId === visitId ? { ...v, photoTaken: true } : v
  );

  const { nextQuests } = advanceLocationQuests(
    locState.dailyQuests,
    (q) =>
      q.kind === 'photo_location' ||
      (q.kind === 'photo_visitor' &&
        (!q.targetVisitorId || q.targetVisitorId === visit.visitorId || true))
  );

  const prevAff = townMap.visitorAffinities[visit.visitorId];
  const nextExp = prevAff.exp + (firstPhotoThisVisit ? 2 : 0);

  const studio = getPhotoStudioState(synced);
  const locUnlockedFrames = new Set<PhotoFrame>(locState.unlockedFrameIds);
  const studioFrames = new Set<PhotoFrame>(studio.unlockedFrames);
  if (locationId === 'lake_park') {
    locUnlockedFrames.add('duck_frame');
    studioFrames.add('duck_frame');
  } else if (locationId === 'town_market') {
    locUnlockedFrames.add('wood_frame');
    studioFrames.add('wood_frame');
  }

  let nextState: GameState = {
    ...synced,
    filterShards: (synced.filterShards ?? 0) + filterShardGain,
    photoStudio: {
      ...studio,
      unlockedFrames: Array.from(studioFrames),
    },
    townMap: {
      ...townMap,
      locations: {
        ...townMap.locations,
        [locationId]: {
          ...locState,
          activeVisitors: nextActive,
          dailyQuests: nextQuests,
          totalPhotosTaken: locState.totalPhotosTaken + 1,
          unlockedFrameIds: Array.from(locUnlockedFrames),
        },
      },
      visitorAffinities: {
        ...townMap.visitorAffinities,
        [visit.visitorId]: {
          ...prevAff,
          exp: nextExp,
          level: getTownVisitorLevelForExp(nextExp),
          totalPhotos: prevAff.totalPhotos + 1,
        },
      },
    },
  };

  const visitorDef = TOWN_VISITOR_BY_ID[visit.visitorId];
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `town_photo_${visitId}`,
    type: 'town',
    title: `與「${visitorDef.name}」在${TOWN_LOCATION_BY_ID[locationId].name}合照`,
    description: `${visitorDef.speciesLabel}開心地在鏡頭前留下足跡紀念！`,
    emoji: visitorDef.emoji,
    dateKey: formatTownDateKey(now),
  });

  return {
    nextState,
    ticketGain,
    notice:
      ticketGain > 0
        ? `已拍下${visitorDef.speciesLabel}旅拍紀念！獲得 +${ticketGain} 小鎮券、+1 濾鏡碎片`
        : `已拍下${visitorDef.speciesLabel}旅拍紀念！`,
  };
}

export function recordTownLocationPhoto(
  state: GameState,
  photo: RoomPhotoRecord,
  locationId: ActiveTownLocationId,
  townVisitorId?: TownVisitorId
): { nextState: GameState; notice?: string } {
  const synced = syncTownMapState(state);
  let townMap = synced.townMap!;
  const locState = townMap.locations[locationId];

  const ticketGain = 3;
  townMap = grantTownTickets(townMap, ticketGain);

  const { nextQuests, newlyCompleted } = advanceLocationQuests(
    locState.dailyQuests,
    (q) =>
      q.kind === 'photo_location' ||
      (q.kind === 'photo_visitor' &&
        (!q.targetVisitorId ||
          q.targetVisitorId === townVisitorId ||
          locState.activeVisitors.some((v) => v.visitorId === q.targetVisitorId) ||
          locationId === q.locationId))
  );

  const studio = getPhotoStudioState(synced);
  const locFrames = new Set<PhotoFrame>(locState.unlockedFrameIds);
  const studioFrames = new Set<PhotoFrame>(studio.unlockedFrames);
  if (locationId === 'lake_park') {
    locFrames.add('duck_frame');
    studioFrames.add('duck_frame');
  } else if (locationId === 'town_market') {
    locFrames.add('wood_frame');
    studioFrames.add('wood_frame');
  }

  let nextState: GameState = {
    ...synced,
    photoStudio: {
      ...studio,
      unlockedFrames: Array.from(studioFrames),
    },
    townMap: {
      ...townMap,
      locations: {
        ...townMap.locations,
        [locationId]: {
          ...locState,
          dailyQuests: nextQuests,
          totalPhotosTaken: locState.totalPhotosTaken + 1,
          unlockedFrameIds: Array.from(locFrames),
        },
      },
    },
  };

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `town_loc_photo_${photo.id}`,
    type: 'town',
    title: `${TOWN_LOCATION_BY_ID[locationId].name}旅拍：${photo.title}`,
    description: `在${TOWN_LOCATION_BY_ID[locationId].name}為毛孩留下珍貴小鎮風景紀念照！`,
    emoji: TOWN_LOCATION_BY_ID[locationId].emoji,
    photoId: photo.id,
  });

  return {
    nextState,
    notice: `小鎮地點攝影獎勵：+${ticketGain} 小鎮券${
      newlyCompleted.length > 0 ? ` · 完成任務「${newlyCompleted[0]}」` : ''
    }`,
  };
}

export function forageForestAcorn(
  state: GameState,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  const townMap = synced.townMap!;
  if (!townMap.unlockedLocationIds.includes('acorn_forest')) {
    return { nextState: synced, ok: false, error: '尚未解鎖橡果森林喔！' };
  }

  const locState = townMap.locations.acorn_forest;
  const { nextQuests, newlyCompleted } = advanceLocationQuests(
    locState.dailyQuests,
    (q) => q.kind === 'forage_acorn'
  );

  const coinsGain = 8;
  const foundFilterShard = Math.random() < 0.35 ? 1 : 0;

  return {
    nextState: {
      ...synced,
      coins: synced.coins + coinsGain,
      filterShards: (synced.filterShards ?? 0) + foundFilterShard,
      townMap: {
        ...townMap,
        acornsCollectedTotal: townMap.acornsCollectedTotal + 1,
        locations: {
          ...townMap.locations,
          acorn_forest: {
            ...locState,
            dailyQuests: nextQuests,
          },
        },
      },
    },
    ok: true,
    notice: `🌰 撿到 1 顆飽滿橡果！（+${coinsGain} 金幣${
      foundFilterShard > 0 ? '、+1 濾鏡碎片' : ''
    }${newlyCompleted.length > 0 ? ` · 完成「${newlyCompleted[0]}」` : ''}）`,
  };
}

export function settleLakeFishingMinigame(
  state: GameState,
  caughtCount: number,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  let townMap = synced.townMap!;
  if (!townMap.unlockedLocationIds.includes('lake_park')) {
    return { nextState: synced, ok: false, error: '尚未解鎖湖邊公園喔！' };
  }

  const coinsGain = 15 + caughtCount * 8;
  const ticketGain = caughtCount >= 3 ? 2 : 1;
  const filterShardGain = caughtCount >= 4 ? 1 : 0;
  townMap = grantTownTickets(townMap, ticketGain);

  const locState = townMap.locations.lake_park;
  const { nextQuests, newlyCompleted } = advanceLocationQuests(
    locState.dailyQuests,
    (q) => q.kind === 'lake_fishing'
  );

  const studio = getPhotoStudioState(synced);
  const nextLocFrames = new Set<PhotoFrame>(locState.unlockedFrameIds);
  const nextStudioFrames = new Set<PhotoFrame>(studio.unlockedFrames);
  if (caughtCount >= 3) {
    nextLocFrames.add('waterdrop_frame');
    nextStudioFrames.add('waterdrop_frame');
  }

  return {
    nextState: {
      ...synced,
      coins: synced.coins + coinsGain,
      filterShards: (synced.filterShards ?? 0) + filterShardGain,
      photoStudio: {
        ...studio,
        unlockedFrames: Array.from(nextStudioFrames),
      },
      townMap: {
        ...townMap,
        fishingGamesPlayedTotal: townMap.fishingGamesPlayedTotal + 1,
        fishingBestScore: Math.max(townMap.fishingBestScore, caughtCount),
        locations: {
          ...townMap.locations,
          lake_park: {
            ...locState,
            dailyQuests: nextQuests,
            unlockedFrameIds: Array.from(nextLocFrames),
          },
        },
      },
    },
    ok: true,
    notice: `🎣 釣到 ${caughtCount} 條閃亮湖魚！獲得 +${coinsGain} 金幣、+${ticketGain} 小鎮券${
      filterShardGain > 0 ? '、+1 濾鏡碎片' : ''
    }${newlyCompleted.length > 0 ? ` · 完成「${newlyCompleted[0]}」` : ''}`,
  };
}

export function deliverMarketDish(
  state: GameState,
  foodId: string,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  let townMap = synced.townMap!;
  if (!townMap.unlockedLocationIds.includes('town_market')) {
    return { nextState: synced, ok: false, error: '尚未解鎖小鎮市集喔！' };
  }
  const qty = synced.foods[foodId] ?? 0;
  if (qty <= 0) {
    return { nextState: synced, ok: false, error: '倉庫裡這道料理數量不足！' };
  }

  const food = FOODS.find((f) => f.id === foodId);
  const coinsGain = Math.max(25, Math.round((food?.price ?? 20) * 1.45));
  const ticketGain = 2;
  townMap = grantTownTickets(townMap, ticketGain);

  const locState = townMap.locations.town_market;
  const { nextQuests, newlyCompleted } = advanceLocationQuests(
    locState.dailyQuests,
    (q) => q.kind === 'deliver_market_dish'
  );

  const studio = getPhotoStudioState(synced);
  const nextLocFrames = new Set<PhotoFrame>(locState.unlockedFrameIds);
  const nextStudioFrames = new Set<PhotoFrame>(studio.unlockedFrames);
  nextLocFrames.add('market_sign_frame');
  nextStudioFrames.add('market_sign_frame');

  return {
    nextState: {
      ...synced,
      coins: synced.coins + coinsGain,
      foods: {
        ...synced.foods,
        [foodId]: qty - 1,
      },
      photoStudio: {
        ...studio,
        unlockedFrames: Array.from(nextStudioFrames),
      },
      townMap: {
        ...townMap,
        marketDishesDeliveredTotal: townMap.marketDishesDeliveredTotal + 1,
        locations: {
          ...townMap.locations,
          town_market: {
            ...locState,
            dailyQuests: nextQuests,
            unlockedFrameIds: Array.from(nextLocFrames),
          },
        },
      },
    },
    ok: true,
    notice: `🍱 成功在市集交付「${food?.name ?? '料理'}」！獲得 +${coinsGain} 金幣、+${ticketGain} 小鎮券${
      newlyCompleted.length > 0 ? ` · 完成「${newlyCompleted[0]}」` : ''
    }`,
  };
}

export function buyMarketFurniture(
  state: GameState,
  itemId: string,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  const townMap = synced.townMap!;
  if (!townMap.unlockedLocationIds.includes('town_market')) {
    return { nextState: synced, ok: false, error: '尚未解鎖小鎮市集喔！' };
  }
  const item = ROOM_ITEM_BY_ID[itemId];
  if (!item) {
    return { nextState: synced, ok: false, error: '找不到這項市集家具' };
  }
  if (synced.coins < item.price) {
    return { nextState: synced, ok: false, error: `需要 ${item.price} 金幣才能購買喔！` };
  }

  const nextCounts = {
    ...synced.house.ownedFurnitureCounts,
    [itemId]: (synced.house.ownedFurnitureCounts[itemId] ?? 0) + 1,
  };
  const nextCollected = Array.from(new Set([...synced.house.collectedFurnitureIds, itemId]));
  const nextMarketIds = Array.from(new Set([...townMap.unlockedMarketFurnitureIds, itemId]));

  const locState = townMap.locations.town_market;
  const { nextQuests, newlyCompleted } = advanceLocationQuests(
    locState.dailyQuests,
    (q) => q.kind === 'buy_market_furniture'
  );

  const studio = getPhotoStudioState(synced);
  const nextLocFrames = new Set<PhotoFrame>(locState.unlockedFrameIds);
  const nextStudioFrames = new Set<PhotoFrame>(studio.unlockedFrames);
  nextLocFrames.add('wood_frame');
  nextStudioFrames.add('wood_frame');

  let nextState: GameState = {
    ...synced,
    coins: synced.coins - item.price,
    house: {
      ...synced.house,
      ownedFurnitureCounts: nextCounts,
      collectedFurnitureIds: nextCollected,
    },
    photoStudio: {
      ...studio,
      unlockedFrames: Array.from(nextStudioFrames),
    },
    townMap: {
      ...townMap,
      unlockedMarketFurnitureIds: nextMarketIds,
      locations: {
        ...townMap.locations,
        town_market: {
          ...locState,
          dailyQuests: nextQuests,
          unlockedFrameIds: Array.from(nextLocFrames),
        },
      },
    },
  };

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `town_market_furn_${itemId}`,
    type: 'town',
    title: `購得市集限定「${item.name}」`,
    description: `在小鎮市集木攤挑選了可愛的「${item.name}」，小屋佈置更豐富了！`,
    emoji: item.emoji,
  });

  return {
    nextState,
    ok: true,
    notice: `🛍️ 購入市集家具「${item.name}」！已存入小屋家具倉庫${
      newlyCompleted.length > 0 ? ` · 完成「${newlyCompleted[0]}」` : ''
    }`,
  };
}

export function claimLocationQuestReward(
  state: GameState,
  locationId: ActiveTownLocationId,
  questId: string,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  let townMap = synced.townMap!;
  const locState = townMap.locations[locationId];
  const quest = locState.dailyQuests.find((q) => q.id === questId);
  if (!quest) {
    return { nextState: synced, ok: false, error: '找不到這個地點任務' };
  }
  if (!quest.completed) {
    return { nextState: synced, ok: false, error: '任務進度尚未達成！' };
  }
  if (quest.claimed) {
    return { nextState: synced, ok: false, error: '這個任務獎勵已經領取過囉！' };
  }

  townMap = grantTownTickets(townMap, quest.rewardTownTickets);
  const studio = getPhotoStudioState(synced);
  const matGain = quest.rewardStudioMaterials ?? 0;
  const furnGain = quest.rewardFurnitureShards ?? 0;
  const filterGain = quest.rewardFilterShards ?? 0;

  const nextIngredients = { ...synced.ingredients };
  if (quest.rewardIngredientId && quest.rewardIngredientQty) {
    nextIngredients[quest.rewardIngredientId] =
      (nextIngredients[quest.rewardIngredientId] ?? 0) + quest.rewardIngredientQty;
  }

  const nextQuests = locState.dailyQuests.map((q) =>
    q.id === questId ? { ...q, claimed: true } : q
  );

  const parts = [`+${quest.rewardTownTickets} 小鎮券`, `+${quest.rewardCoins} 金幣`];
  if (matGain > 0) parts.push(`+${matGain} 攝影材料`);
  if (furnGain > 0) parts.push(`+${furnGain} 家具碎片`);
  if (filterGain > 0) parts.push(`+${filterGain} 濾鏡碎片`);

  return {
    nextState: {
      ...synced,
      coins: synced.coins + quest.rewardCoins,
      furnitureShards: synced.furnitureShards + furnGain,
      filterShards: (synced.filterShards ?? 0) + filterGain,
      ingredients: nextIngredients,
      photoStudio: {
        ...studio,
        studioMaterials: studio.studioMaterials + matGain,
      },
      townMap: {
        ...townMap,
        locations: {
          ...townMap.locations,
          [locationId]: {
            ...locState,
            dailyQuests: nextQuests,
          },
        },
      },
    },
    ok: true,
    notice: `領取地點任務獎勵：${parts.join('、')}`,
  };
}

export function claimLocationAllQuestsBonus(
  state: GameState,
  locationId: ActiveTownLocationId,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  let townMap = synced.townMap!;
  const locState = townMap.locations[locationId];
  const allCompleted = locState.dailyQuests.every((q) => q.completed);
  if (!allCompleted) {
    return { nextState: synced, ok: false, error: '需先完成此地點今日全部 2 項任務！' };
  }
  if (locState.allQuestsBonusClaimed) {
    return { nextState: synced, ok: false, error: '今日地點全完成加碼獎勵已領取！' };
  }

  townMap = grantTownTickets(townMap, 3);
  const studio = getPhotoStudioState(synced);

  return {
    nextState: {
      ...synced,
      coins: synced.coins + 45,
      filterShards: (synced.filterShards ?? 0) + 1,
      photoStudio: {
        ...studio,
        studioMaterials: studio.studioMaterials + 1,
      },
      townMap: {
        ...townMap,
        locations: {
          ...townMap.locations,
          [locationId]: {
            ...locState,
            allQuestsBonusClaimed: true,
          },
        },
      },
    },
    ok: true,
    notice: '🎉 領取地點全完成加碼：+3 小鎮券、+45 金幣、+1 攝影材料、+1 濾鏡碎片！',
  };
}

export function upgradeVisitorHut(
  state: GameState,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  const townMap = synced.townMap!;
  const currentLv = townMap.visitorHut.level;
  if (currentLv >= 5) {
    return { nextState: synced, ok: false, error: '訪客小屋已經是最高 Lv.5 夢幻招待所囉！' };
  }

  const nextLv = (currentLv + 1) as 2 | 3 | 4 | 5;
  const info = VISITOR_HUT_LEVEL_BY_NUM[nextLv];
  if (synced.coins < info.upgradeCostCoins) {
    return {
      nextState: synced,
      ok: false,
      error: `升級「${info.name}」需要 ${info.upgradeCostCoins} 金幣！`,
    };
  }

  const studio = getPhotoStudioState(synced);
  const nextBgs = new Set<PhotoBackground>(studio.unlockedBackgrounds);
  if (info.rewardBackgroundId) {
    nextBgs.add(info.rewardBackgroundId);
  }

  let nextState: GameState = {
    ...synced,
    coins: synced.coins - info.upgradeCostCoins,
    photoStudio: {
      ...studio,
      unlockedBackgrounds: Array.from(nextBgs),
    },
    townMap: {
      ...townMap,
      visitorHut: {
        ...townMap.visitorHut,
        level: nextLv,
      },
    },
  };

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `visitor_hut_lv_${nextLv}`,
    type: 'town',
    title: `訪客小屋升級為「${info.name}」！`,
    description: info.unlockBonusText,
    emoji: info.emoji,
    dateKey: formatTownDateKey(now),
  });

  return {
    nextState,
    ok: true,
    notice: `🏡 訪客小屋成功升級至 Lv.${nextLv}「${info.name}」！${
      info.rewardBackgroundId ? '並解鎖攝影棚背景「夢幻招待所」✨' : ''
    }`,
  };
}

export function buyVisitorHutFacility(
  state: GameState,
  facilityId: VisitorHutFacilityId,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  const townMap = synced.townMap!;
  if (townMap.visitorHut.builtFacilities.includes(facilityId)) {
    return { nextState: synced, ok: false, error: '這項訪客小屋設施已經建造好囉！' };
  }
  const fac = VISITOR_HUT_FACILITY_BY_ID[facilityId];
  if (synced.coins < fac.priceCoins) {
    return {
      nextState: synced,
      ok: false,
      error: `建造「${fac.name}」需要 ${fac.priceCoins} 金幣！`,
    };
  }

  return {
    nextState: {
      ...synced,
      coins: synced.coins - fac.priceCoins,
      townMap: {
        ...townMap,
        visitorHut: {
          ...townMap.visitorHut,
          builtFacilities: [...townMap.visitorHut.builtFacilities, facilityId],
        },
      },
    },
    ok: true,
    notice: `🛠️ 建造完成「${fac.name}」！效果：${fac.effectLabel}`,
  };
}

export function isTownShopItemOwned(state: GameState, itemId: string): boolean {
  const item = TOWN_SHOP_ITEM_BY_ID[itemId];
  if (!item) return false;
  const townMap = state.townMap;
  if (townMap?.purchasedShopItemIds.includes(itemId)) return true;

  const studio = getPhotoStudioState(state);
  if (item.category === 'filter') {
    return studio.unlockedFilters.includes(item.targetId as PhotoFilter);
  }
  if (item.category === 'background') {
    return studio.unlockedBackgrounds.includes(item.targetId as PhotoBackground);
  }
  if (item.category === 'accessory') {
    return state.accessories.includes(item.targetId);
  }
  if (item.category === 'title') {
    return state.encyclopedia.unlockedTitles.includes(item.targetId as TitleId);
  }
  return false;
}

export function buyTownShopItem(
  state: GameState,
  shopItemId: string,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  const townMap = synced.townMap!;
  const item = TOWN_SHOP_ITEM_BY_ID[shopItemId];
  if (!item) {
    return { nextState: synced, ok: false, error: '找不到這項小鎮商品' };
  }
  if (isTownShopItemOwned(synced, shopItemId)) {
    return { nextState: synced, ok: false, error: '你已經擁有這項限定商品囉！' };
  }
  if (townMap.townTickets.balance < item.ticketPrice) {
    return {
      nextState: synced,
      ok: false,
      error: `小鎮券不足（需要 ${item.ticketPrice} 張，目前 ${townMap.townTickets.balance} 張）`,
    };
  }

  const studio = getPhotoStudioState(synced);
  const nextFilters = new Set<PhotoFilter>(studio.unlockedFilters);
  const nextBgs = new Set<PhotoBackground>(studio.unlockedBackgrounds);
  let nextAccessories = [...synced.accessories];
  let nextTitles = [...synced.encyclopedia.unlockedTitles];

  if (item.category === 'filter') {
    nextFilters.add(item.targetId as PhotoFilter);
  } else if (item.category === 'background') {
    nextBgs.add(item.targetId as PhotoBackground);
  } else if (item.category === 'accessory') {
    nextAccessories = Array.from(new Set([...nextAccessories, item.targetId]));
  } else if (item.category === 'title') {
    nextTitles = Array.from(new Set([...nextTitles, item.targetId as TitleId]));
  }

  let nextState: GameState = {
    ...synced,
    accessories: nextAccessories,
    encyclopedia: {
      ...synced.encyclopedia,
      unlockedTitles: nextTitles,
      activeTitle: synced.encyclopedia.activeTitle ?? nextTitles[0] ?? null,
    },
    photoStudio: {
      ...studio,
      unlockedFilters: Array.from(nextFilters),
      unlockedBackgrounds: Array.from(nextBgs),
    },
    townMap: {
      ...townMap,
      townTickets: {
        ...townMap.townTickets,
        balance: townMap.townTickets.balance - item.ticketPrice,
      },
      purchasedShopItemIds: Array.from(new Set([...townMap.purchasedShopItemIds, shopItemId])),
    },
  };

  nextState = syncAllAccessoryProgress(nextState).nextState;

  return {
    nextState,
    ok: true,
    notice: `🛍️ 兌換成功「${item.name}」！已自動收錄進圖鑑！`,
  };
}

// ==========================================
// 共養探索（Co-op Town Exploration）
// ==========================================

export function getOrCreateCoopTownSession(
  dateKey: string = formatTownDateKey()
): CoopTownExploreSession {
  const idx = Math.abs(getDayIndexFromKey(dateKey)) % COOP_TOWN_EXPLORE_TEMPLATES.length;
  const tpl = COOP_TOWN_EXPLORE_TEMPLATES[idx];
  return {
    id: `coop_town_${dateKey}_${tpl.templateId}`,
    templateId: tpl.templateId,
    locationId: tpl.locationId,
    dateKey,
    title: tpl.title,
    description: tpl.description,
    emoji: tpl.emoji,
    steps: tpl.steps.map((s) => ({ ...s, contributorUserIds: [] })),
    completed: false,
    completedAt: null,
    claimedByUserIds: [],
    lastUpdatedByName: null,
    lastUpdatedAt: null,
  };
}

export function syncCoopTownExploration(
  state: GameState,
  hasSharedRoom: boolean,
  now: Date = new Date()
): GameState {
  if (!hasSharedRoom) return state;
  const dateKey = formatTownDateKey(now);
  const existing = state.coop.coopTownSession;
  if (existing && existing.dateKey === dateKey) {
    return state;
  }

  const prevDate = getPreviousDateKey(dateKey);
  const keepStreak =
    state.coop.lastTownExploreCompletedDate === dateKey ||
    state.coop.lastTownExploreCompletedDate === prevDate;

  return {
    ...state,
    coop: {
      ...state.coop,
      coopTownSession: getOrCreateCoopTownSession(dateKey),
      townExploreStreakDays: keepStreak ? (state.coop.townExploreStreakDays ?? 0) : 0,
    },
  };
}

export function advanceCoopTownExploreStep(
  state: GameState,
  stepKey: CoopTownExploreSession['steps'][number]['key'],
  userId: string,
  userName: string,
  delta = 1,
  now: Date = new Date()
): { nextState: GameState; justCompleted: boolean; notice?: string } {
  const session = state.coop.coopTownSession;
  const dateKey = formatTownDateKey(now);
  if (!session || session.dateKey !== dateKey || session.completed) {
    return { nextState: state, justCompleted: false };
  }

  let matched = false;
  const nextSteps = session.steps.map((step) => {
    if (step.key !== stepKey || step.progress >= step.target) return step;
    matched = true;
    const progress = Math.min(step.target, step.progress + delta);
    const contributors = step.contributorUserIds.includes(userId)
      ? step.contributorUserIds
      : [...step.contributorUserIds, userId];
    return { ...step, progress, contributorUserIds: contributors };
  });

  if (!matched) {
    return { nextState: state, justCompleted: false };
  }

  const completed = nextSteps.every((s) => s.progress >= s.target);
  const nowMs = now.getTime();
  const nextSession: CoopTownExploreSession = {
    ...session,
    steps: nextSteps,
    completed,
    completedAt: completed ? nowMs : null,
    lastUpdatedByName: userName,
    lastUpdatedAt: nowMs,
  };

  let nextStreak = state.coop.townExploreStreakDays ?? 0;
  let nextLastDate = state.coop.lastTownExploreCompletedDate ?? null;
  let nextBadges = [...state.coop.unlockedBadges];
  let nextTitles = [...state.encyclopedia.unlockedTitles];
  let nextCards = [...state.coop.earnedCards];
  let nextOfflineEvents: CoopOfflineEvent[] = [...state.coop.offlineEvents];

  if (completed) {
    if (nextLastDate !== dateKey) {
      const prevDate = getPreviousDateKey(dateKey);
      nextStreak = nextLastDate === prevDate ? nextStreak + 1 : 1;
      nextLastDate = dateKey;
    }
    if (nextStreak >= 3 && !nextBadges.includes('town_explore_partner')) {
      nextBadges = [...nextBadges, 'town_explore_partner'];
    }
    if (nextStreak >= 7 && !nextTitles.includes('town_explorer')) {
      nextTitles = [...nextTitles, 'town_explorer'];
    }
    const cardId = `card_town_coop_${dateKey}`;
    if (!nextCards.some((c) => c.id === cardId)) {
      const card: CoopMessageCard = {
        id: cardId,
        title: `${session.title} 紀念卡`,
        body: `今天與夥伴一起完成「${session.title}」，把小鎮美好風景存進回憶裡！`,
        emoji: session.emoji,
        earnedDate: dateKey,
        createdAt: nowMs,
      };
      nextCards = [card, ...nextCards].slice(0, 24);
    }

    const ev: CoopOfflineEvent = {
      id: `off_town_${nowMs}_${Math.random().toString(36).slice(2, 6)}`,
      actorUserId: userId,
      actorName: userName,
      gameType: 'town_coop',
      summary: `一起完成了「${session.title}」！快去領取 +8 小鎮券相同獎勵！`,
      createdAt: nowMs,
    };
    nextOfflineEvents = [ev, ...nextOfflineEvents].slice(0, 20);
  }

  let nextState: GameState = {
    ...state,
    encyclopedia: {
      ...state.encyclopedia,
      unlockedTitles: nextTitles,
      activeTitle: state.encyclopedia.activeTitle ?? nextTitles[0] ?? null,
    },
    coop: {
      ...state.coop,
      coopTownSession: nextSession,
      townExploreStreakDays: nextStreak,
      lastTownExploreCompletedDate: nextLastDate,
      unlockedBadges: nextBadges,
      earnedCards: nextCards,
      offlineEvents: nextOfflineEvents,
    },
  };

  if (completed) {
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: `coop_town_done_${dateKey}`,
      type: 'town',
      title: `共養完成「${session.title}」`,
      description: `兩人合力完成小鎮探索，雙方都獲得相同的 +8 小鎮券與旅行紀念卡！`,
      emoji: session.emoji,
      dateKey,
      actorName: userName,
      isShared: true,
    });
  }

  return {
    nextState,
    justCompleted: completed,
    notice: completed
      ? `🎉 共養探索「${session.title}」達成！兩人都能領取 +8 小鎮券等相同獎勵！`
      : undefined,
  };
}

export function claimCoopTownReward(
  state: GameState,
  userId: string,
  now: Date = new Date()
): TownActionResult {
  const synced = syncTownMapState(state, now);
  const session = synced.coop.coopTownSession;
  if (!session || !session.completed) {
    return { nextState: synced, ok: false, error: '今日共養探索任務尚未全部完成喔！' };
  }
  if (session.claimedByUserIds.includes(userId)) {
    return { nextState: synced, ok: false, error: '你已經領取過今日共養探索獎勵囉！' };
  }

  const townMap = grantTownTickets(synced.townMap!, 8);
  const studio = getPhotoStudioState(synced);
  const rareId =
    session.templateId === 'forest_picnic' ? 'moon_wheat' : 'blueberry';

  return {
    nextState: {
      ...synced,
      coins: synced.coins + 90,
      furnitureShards: synced.furnitureShards + 2,
      filterShards: (synced.filterShards ?? 0) + 1,
      ingredients: {
        ...synced.ingredients,
        [rareId]: (synced.ingredients[rareId] ?? 0) + 2,
      },
      photoStudio: {
        ...studio,
        studioMaterials: studio.studioMaterials + 2,
      },
      townMap,
      coop: {
        ...synced.coop,
        coopTownSession: {
          ...session,
          claimedByUserIds: [...session.claimedByUserIds, userId],
        },
      },
    },
    ok: true,
    notice: `🎁 領取共養探索相同獎勵：+8 小鎮券、+90 金幣、+2 攝影材料、+2 家具碎片、+1 濾鏡碎片、${INGREDIENTS[rareId].name} x2`,
  };
}

export function mergeCoopTownSession(
  localSession?: CoopTownExploreSession | null,
  remoteSession?: CoopTownExploreSession | null
): CoopTownExploreSession | null {
  if (!remoteSession) return localSession ?? null;
  if (!localSession) return remoteSession;
  if (localSession.id !== remoteSession.id) {
    return localSession.dateKey >= remoteSession.dateKey ? localSession : remoteSession;
  }

  const mergedSteps = localSession.steps.map((lStep) => {
    const rStep = remoteSession.steps.find((s) => s.key === lStep.key);
    const progress = Math.min(
      lStep.target,
      Math.max(lStep.progress, rStep?.progress ?? 0)
    );
    const contributors = Array.from(
      new Set([...lStep.contributorUserIds, ...(rStep?.contributorUserIds ?? [])])
    );
    return { ...lStep, progress, contributorUserIds: contributors };
  });

  const completed =
    localSession.completed ||
    remoteSession.completed ||
    mergedSteps.every((s) => s.progress >= s.target);

  return {
    ...remoteSession,
    steps: mergedSteps,
    completed,
    completedAt: localSession.completedAt ?? remoteSession.completedAt ?? (completed ? Date.now() : null),
    claimedByUserIds: Array.from(
      new Set([...localSession.claimedByUserIds, ...remoteSession.claimedByUserIds])
    ),
  };
}

// ==========================================
// 小鎮圖鑑（Town Encyclopedia）
// ==========================================

export interface TownEncyclopediaItemEntry {
  key: string;
  categoryLabel: string;
  name: string;
  emoji: string;
  collected: boolean;
}

export interface TownLocationEncyclopediaProgress {
  locationId: ActiveTownLocationId;
  unlocked: boolean;
  items: TownEncyclopediaItemEntry[];
  collectedCount: number;
  totalCount: number;
  completedAll: boolean;
  rewardClaimed: boolean;
  completionTitleId: TitleId;
}

const LOCATION_COMPLETION_TITLE: Record<ActiveTownLocationId, TitleId> = {
  home_yard: 'yard_host_master',
  acorn_forest: 'acorn_forest_ranger',
  lake_park: 'lakeside_angler',
  town_market: 'town_market_vip',
};

export function getLocationEncyclopediaProgress(
  state: GameState,
  locationId: ActiveTownLocationId
): TownLocationEncyclopediaProgress {
  const townMap = state.townMap ?? createInitialTownMapState();
  const studio = getPhotoStudioState(state);
  const locDef = TOWN_LOCATION_BY_ID[locationId];
  const locState = townMap.locations[locationId];
  const unlocked = townMap.unlockedLocationIds.includes(locationId);

  const items: TownEncyclopediaItemEntry[] = [];

  // 1. Location unlocked
  items.push({
    key: `loc_${locationId}`,
    categoryLabel: '地點',
    name: `${locDef.name}探索權限`,
    emoji: locDef.emoji,
    collected: unlocked,
  });

  // 2. Visitors met/hosted at least once
  for (const vid of [...locDef.commonVisitorIds, ...locDef.rareVisitorIds]) {
    const vDef = TOWN_VISITOR_BY_ID[vid];
    const aff = townMap.visitorAffinities[vid];
    items.push({
      key: `visitor_${vid}`,
      categoryLabel: vDef.rarity === 'rare' ? '稀有訪客' : '常見訪客',
      name: vDef.name,
      emoji: vDef.emoji,
      collected: Boolean(aff && (aff.totalVisits > 0 || aff.totalFed > 0 || aff.firstMetAt !== null)),
    });
  }

  // 3. Backgrounds
  for (const bgId of locDef.recommendedBackgroundIds) {
    const nameMap: Record<string, { label: string; emoji: string }> = {
      pink_room: { label: '粉紅房間', emoji: '🎀' },
      strawberry_field: { label: '草莓田', emoji: '🍓' },
      cloud_sky: { label: '雲朵天空', emoji: '☁️' },
      forest_cabin: { label: '森林木屋', emoji: '🪵' },
      acorn_trail: { label: '橡果小徑', emoji: '🌰' },
      lakeside_sunset: { label: '湖邊黃昏', emoji: '🌇' },
      waterfront_bridge: { label: '水岸小橋', emoji: '🌉' },
      market_night: { label: '市集夜晚', emoji: '🏮' },
      wooden_stalls: { label: '木造攤位', emoji: '🛍️' },
    };
    const meta = nameMap[bgId] ?? { label: bgId, emoji: '🖼️' };
    items.push({
      key: `bg_${bgId}`,
      categoryLabel: '攝影背景',
      name: meta.label,
      emoji: meta.emoji,
      collected: studio.unlockedBackgrounds.includes(bgId),
    });
  }

  // 4. Filters
  for (const flId of locDef.recommendedFilterIds) {
    const nameMap: Record<string, { label: string; emoji: string }> = {
      cream: { label: '奶油濾鏡', emoji: '🧈' },
      pink: { label: '粉紅濾鏡', emoji: '🩷' },
      mint: { label: '薄荷濾鏡', emoji: '🌿' },
      forest_warm_sun: { label: '森林暖陽濾鏡', emoji: '☀️' },
      morning_glow: { label: '清晨微光濾鏡', emoji: '🌤️' },
      forest_filter: { label: '森林濾鏡', emoji: '🌲' },
      lake_aqua: { label: '湖邊水藍濾鏡', emoji: '💧' },
      lakeside_breeze: { label: '湖畔微風濾鏡', emoji: '🌬️' },
      market_warm_sun: { label: '市集暖陽濾鏡', emoji: '🏮' },
      vintage: { label: '復古濾鏡', emoji: '🎞️' },
    };
    const meta = nameMap[flId] ?? { label: flId, emoji: '✨' };
    items.push({
      key: `filter_${flId}`,
      categoryLabel: '攝影濾鏡',
      name: meta.label,
      emoji: meta.emoji,
      collected: studio.unlockedFilters.includes(flId),
    });
  }

  // 5. Frames
  for (const frId of locDef.recommendedFrameIds) {
    const nameMap: Record<string, { label: string; emoji: string }> = {
      rounded: { label: '圓角相框', emoji: '🖼️' },
      heart: { label: '愛心相框', emoji: '🩷' },
      star: { label: '星星相框', emoji: '⭐' },
      acorn_frame: { label: '橡果相框', emoji: '🌰' },
      feather_frame: { label: '羽毛相框', emoji: '🪶' },
      waterdrop_frame: { label: '水滴相框', emoji: '💧' },
      duck_frame: { label: '小鴨相框', emoji: '🦆' },
      market_sign_frame: { label: '市集招牌框', emoji: '🏮' },
      wood_frame: { label: '木紋相框', emoji: '🪵' },
    };
    const meta = nameMap[frId] ?? { label: frId, emoji: '🖼️' };
    items.push({
      key: `frame_${frId}`,
      categoryLabel: '攝影相框',
      name: meta.label,
      emoji: meta.emoji,
      collected: studio.unlockedFrames.includes(frId),
    });
  }

  // 6. Location-exclusive accessory or market furniture
  if (locationId === 'acorn_forest') {
    items.push({
      key: 'acc_town_deer_antlers',
      categoryLabel: '專屬配件',
      name: '森林小鹿配件',
      emoji: '🦌',
      collected: state.accessories.includes('town_deer_antlers'),
    });
  } else if (locationId === 'lake_park') {
    items.push({
      key: 'acc_town_duck_hat',
      categoryLabel: '專屬配件',
      name: '湖邊小鴨配件',
      emoji: '🦆',
      collected: state.accessories.includes('town_duck_hat'),
    });
  } else if (locationId === 'town_market') {
    items.push({
      key: 'acc_town_fox_tail',
      categoryLabel: '專屬配件',
      name: '市集小狐狸配件',
      emoji: '🦊',
      collected: state.accessories.includes('town_fox_tail'),
    });
    for (const fid of TOWN_MARKET_FURNITURE_IDS) {
      const fItem = ROOM_ITEM_BY_ID[fid];
      items.push({
        key: `furn_${fid}`,
        categoryLabel: '市集家具',
        name: fItem?.name ?? fid,
        emoji: fItem?.emoji ?? '🪑',
        collected:
          townMap.unlockedMarketFurnitureIds.includes(fid) ||
          state.house.collectedFurnitureIds.includes(fid),
      });
    }
  } else if (locationId === 'home_yard') {
    items.push({
      key: 'hut_lv5_bg',
      categoryLabel: '招待所紀念',
      name: '夢幻招待所背景',
      emoji: '🏰',
      collected: studio.unlockedBackgrounds.includes('dream_lodge_bg'),
    });
  }

  const collectedCount = items.filter((i) => i.collected).length;
  const totalCount = items.length;
  return {
    locationId,
    unlocked,
    items,
    collectedCount,
    totalCount,
    completedAll: collectedCount >= totalCount && totalCount > 0,
    rewardClaimed: locState.encyclopediaRewardClaimed,
    completionTitleId: LOCATION_COMPLETION_TITLE[locationId],
  };
}

export function getOverallTownEncyclopediaSummary(state: GameState): {
  collected: number;
  total: number;
  byLocation: TownLocationEncyclopediaProgress[];
} {
  const byLocation = ACTIVE_TOWN_LOCATIONS.map((loc) =>
    getLocationEncyclopediaProgress(state, loc.id)
  );
  const collected = byLocation.reduce((sum, x) => sum + x.collectedCount, 0);
  const total = byLocation.reduce((sum, x) => sum + x.totalCount, 0);
  return { collected, total, byLocation };
}

export function claimLocationEncyclopediaReward(
  state: GameState,
  locationId: ActiveTownLocationId
): TownActionResult {
  const synced = syncTownMapState(state);
  const progress = getLocationEncyclopediaProgress(synced, locationId);
  if (!progress.completedAll) {
    return { nextState: synced, ok: false, error: '需先收集齊全此地點全部圖鑑內容喔！' };
  }
  if (progress.rewardClaimed) {
    return { nextState: synced, ok: false, error: '這個地點的全圖鑑獎勵已經領取過囉！' };
  }

  let townMap = grantTownTickets(synced.townMap!, 20);
  const locState = townMap.locations[locationId];
  townMap = {
    ...townMap,
    locations: {
      ...townMap.locations,
      [locationId]: {
        ...locState,
        encyclopediaRewardClaimed: true,
      },
    },
  };

  const nextTitles = Array.from(
    new Set([...synced.encyclopedia.unlockedTitles, progress.completionTitleId])
  );

  return {
    nextState: {
      ...synced,
      coins: synced.coins + 120,
      encyclopedia: {
        ...synced.encyclopedia,
        unlockedTitles: nextTitles,
        activeTitle: synced.encyclopedia.activeTitle ?? nextTitles[0] ?? null,
      },
      townMap,
    },
    ok: true,
    notice: `🏆 完成「${TOWN_LOCATION_BY_ID[locationId].name}」100% 圖鑑！獲得限定稱號、+20 小鎮券、+120 金幣！`,
  };
}
