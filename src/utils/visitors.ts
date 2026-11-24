import { getAccessoryById } from '../data/accessories';
import { getTitleDefinition } from '../data/encyclopedia';
import { FOOD_BY_ID, FOODS } from '../data/foods';
import { ROOM_ITEM_BY_ID } from '../data/house';
import { INGREDIENT_IDS, INGREDIENTS } from '../data/kitchen';
import {
  buildOfferingKey,
  VISITOR_AFFINITY_THRESHOLDS,
  VISITOR_BY_ID,
  VISITOR_DECOR_BY_ID,
  VISITOR_TREAT_BY_ID,
  VISITOR_TREATS,
  VISITORS,
} from '../data/visitors';
import {
  GameState,
  IngredientId,
  PetViewDirection,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoStickerId,
  RoomPhotoRecord,
  VisitorAffinity,
  VisitorBehavior,
  VisitorDecorId,
  VisitorId,
  VisitorOffering,
  VisitorSystemState,
  VisitorTreatId,
  VisitorVisit,
} from '../types';
import { syncAllAccessoryProgress } from './accessories';
import { syncHouseProgress } from './house';
import { maybeGrantCatPhotoMemoryCard, recordMemoryEntry } from './memories';
import { getActivePet } from './pets';

function formatLocalDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const BEHAVIORS: VisitorBehavior[] = ['walking', 'sitting', 'smelling', 'looking_farm'];
const MAX_DAILY_VISITS = 3;
const MIN_SPAWN_DELAY_MS = 2 * 60 * 60 * 1000;
const MAX_SPAWN_DELAY_MS = 4 * 60 * 60 * 1000;
const INITIAL_QUICK_SPAWN_MS = 12 * 1000;

export function isYardMoodBuffActive(state: GameState, now: number = Date.now()): boolean {
  return (state.yardMoodBuffPeriods ?? []).some(
    (period) => now >= period.startedAt && now < period.expiresAt
  );
}

export function createDefaultAffinities(): Record<VisitorId, VisitorAffinity> {
  return {
    bird: {
      visitorId: 'bird',
      level: 1,
      exp: 0,
      totalVisits: 0,
      totalFed: 0,
      unlockedCostume: false,
      unlockedDecor: false,
      firstHostedAt: null,
    },
    squirrel: {
      visitorId: 'squirrel',
      level: 1,
      exp: 0,
      totalVisits: 0,
      totalFed: 0,
      unlockedCostume: false,
      unlockedDecor: false,
      firstHostedAt: null,
    },
    rabbit: {
      visitorId: 'rabbit',
      level: 1,
      exp: 0,
      totalVisits: 0,
      totalFed: 0,
      unlockedCostume: false,
      unlockedDecor: false,
      firstHostedAt: null,
    },
  };
}

export function getAffinityLevelFromExp(exp: number): number {
  let level = 1;
  for (let i = 0; i < VISITOR_AFFINITY_THRESHOLDS.length; i += 1) {
    if (exp >= VISITOR_AFFINITY_THRESHOLDS[i]) {
      level = i + 1;
    }
  }
  return Math.min(5, Math.max(1, level));
}

export function getNextAffinityThreshold(level: number): number | null {
  if (level >= 5) return null;
  return VISITOR_AFFINITY_THRESHOLDS[level] ?? null;
}

export function getRandomSpawnIntervalMs(picnicBuffActive: boolean): number {
  const base =
    MIN_SPAWN_DELAY_MS +
    Math.random() * (MAX_SPAWN_DELAY_MS - MIN_SPAWN_DELAY_MS);
  // 野餐好心情 Buff 提高訪客出現機率 10% -> 縮短間隔約 10%
  return Math.round(picnicBuffActive ? base * 0.9 : base);
}

export function createInitialVisitorState(now: number = Date.now()): VisitorSystemState {
  const today = formatLocalDate(new Date(now));
  return {
    dateKey: today,
    dailyVisitCount: 0,
    maxDailyVisits: MAX_DAILY_VISITS,
    nextSpawnAt: now + INITIAL_QUICK_SPAWN_MS,
    activeVisit: null,
    affinities: createDefaultAffinities(),
    ownedYardDecors: ['oak_tree'],
    placedYardDecors: ['oak_tree'],
    arrivalNoticeUnread: false,
  };
}

export interface YardSynergyInfo {
  weights: Record<VisitorId, number>;
  likesByVisitor: Record<VisitorId, boolean>;
  reasonsByVisitor: Record<VisitorId, string[]>;
  picnicBuffActive: boolean;
}

export function evaluateYardSynergy(
  state: GameState,
  now: number = Date.now()
): YardSynergyInfo {
  const visitorState = state.visitorState ?? createInitialVisitorState(now);
  const placedSet = new Set(visitorState.placedYardDecors);
  const activeFlowerbed = state.house.activeFarmDecor.flowerbedId;
  const activeCrops = new Set<IngredientId>(
    state.farmPlots
      .map((p) => p.cropId)
      .filter((id): id is IngredientId => id !== null)
  );
  const picnicBuffActive = isYardMoodBuffActive(state, now);

  const weights: Record<VisitorId, number> = {
    bird: VISITOR_BY_ID.bird.baseWeight,
    squirrel: VISITOR_BY_ID.squirrel.baseWeight,
    rabbit: VISITOR_BY_ID.rabbit.baseWeight,
  };
  const reasonsByVisitor: Record<VisitorId, string[]> = {
    bird: [],
    squirrel: [],
    rabbit: [],
  };

  const duckBonusActive = getActivePet(state).species === 'duck';

  for (const visitor of VISITORS) {
    let bonus = 0;
    for (const decorId of visitor.preference.preferredYardDecorIds) {
      if (placedSet.has(decorId)) {
        const decor = VISITOR_DECOR_BY_ID[decorId];
        bonus += decorId === 'bird_feeder' || decorId === 'nut_bowl' || decorId === 'flower_arch' ? 45 : 28;
        reasonsByVisitor[visitor.id].push(decor.name);
      }
    }
    for (const farmDecorId of visitor.preference.preferredFarmDecorIds) {
      if (activeFlowerbed === farmDecorId) {
        bonus += 40;
        reasonsByVisitor[visitor.id].push(
          farmDecorId === 'daisy_flowerbed' ? '雛菊花圃' : '薰衣草花圃'
        );
      }
    }
    for (const cropId of visitor.preference.preferredCropIds) {
      if (activeCrops.has(cropId)) {
        bonus += 35;
        reasonsByVisitor[visitor.id].push(`${INGREDIENTS[cropId].name}農地`);
      }
    }

    const affinityLevel = visitorState.affinities[visitor.id]?.level ?? 1;
    if (affinityLevel >= 4) {
      bonus += 45;
      reasonsByVisitor[visitor.id].push('好感度 Lv.4+ 熟面孔');
    }

    let finalWeight = visitor.baseWeight + bonus;
    if (picnicBuffActive) {
      finalWeight = Math.round(finalWeight * 1.1);
    }
    if (duckBonusActive) {
      finalWeight = Math.round(finalWeight * 1.1);
      reasonsByVisitor[visitor.id].push('小鴨迎賓 +10%');
    }
    weights[visitor.id] = finalWeight;
  }

  return {
    weights,
    likesByVisitor: {
      bird: reasonsByVisitor.bird.length > 0,
      squirrel: reasonsByVisitor.squirrel.length > 0,
      rabbit: reasonsByVisitor.rabbit.length > 0,
    },
    reasonsByVisitor,
    picnicBuffActive,
  };
}

function pickWeightedVisitorId(weights: Record<VisitorId, number>): VisitorId {
  const entries = (Object.keys(weights) as VisitorId[]).map((id) => ({
    id,
    weight: Math.max(1, weights[id]),
  }));
  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return entries[0]?.id ?? 'bird';
}

export function createVisitForVisitor(
  visitorId: VisitorId,
  synergy: YardSynergyInfo,
  now: number = Date.now()
): VisitorVisit {
  const def = VISITOR_BY_ID[visitorId];
  const initialBehavior = BEHAVIORS[Math.floor(Math.random() * BEHAVIORS.length)];
  return {
    visitId: `vis_${now}_${Math.random().toString(36).slice(2, 6)}`,
    visitorId,
    arrivedAt: now,
    departAt: now + def.stayDurationMs,
    behavior: initialBehavior,
    behaviorChangedAt: now,
    fedCount: 0,
    maxFeedCount: 2,
    lastFeedReaction: null,
    lastFeedLine: def.arrivalLines[Math.floor(Math.random() * def.arrivalLines.length)] ?? null,
    lastRewardSummary: null,
    photoTaken: false,
    likesYard: synergy.likesByVisitor[visitorId],
    yardMatchReasons: synergy.reasonsByVisitor[visitorId],
  };
}

export function syncVisitorSystem(
  state: GameState,
  now: number = Date.now()
): { nextState: GameState; justArrivedVisitorId: VisitorId | null } {
  const today = formatLocalDate(new Date(now));
  const current = state.visitorState ?? createInitialVisitorState(now);
  const synergy = evaluateYardSynergy(state, now);

  let dateKey = current.dateKey;
  let dailyVisitCount = current.dailyVisitCount;
  let activeVisit = current.activeVisit;
  let nextSpawnAt = current.nextSpawnAt;
  let arrivalNoticeUnread = current.arrivalNoticeUnread;
  let affinities = current.affinities;
  let justArrivedVisitorId: VisitorId | null = null;

  if (dateKey !== today) {
    dateKey = today;
    dailyVisitCount = 0;
  }

  const duckBoost = getActivePet(state).species === 'duck';

  // Expire finished visit cleanly
  if (activeVisit && now >= activeVisit.departAt) {
    activeVisit = null;
    arrivalNoticeUnread = false;
    nextSpawnAt = now + getRandomSpawnIntervalMs(synergy.picnicBuffActive || duckBoost);
  }

  // Cycle visitor behavior in the yard every ~35s for lively motion
  if (activeVisit && now - activeVisit.behaviorChangedAt >= 35000) {
    const candidates = BEHAVIORS.filter((b) => b !== activeVisit?.behavior);
    const nextBehavior =
      candidates[Math.floor(Math.random() * candidates.length)] ?? 'walking';
    activeVisit = {
      ...activeVisit,
      behavior: nextBehavior,
      behaviorChangedAt: now,
    };
  }

  // Spawn new visitor if eligible (2-4 hours interval, max 3/day)
  if (!activeVisit && dailyVisitCount < current.maxDailyVisits && now >= nextSpawnAt) {
    const pickedId = pickWeightedVisitorId(synergy.weights);
    activeVisit = createVisitForVisitor(pickedId, synergy, now);
    dailyVisitCount += 1;
    arrivalNoticeUnread = true;
    justArrivedVisitorId = pickedId;
    nextSpawnAt = now + getRandomSpawnIntervalMs(synergy.picnicBuffActive || duckBoost);
    affinities = {
      ...affinities,
      [pickedId]: {
        ...affinities[pickedId],
        totalVisits: affinities[pickedId].totalVisits + 1,
      },
    };
  }

  // Also refresh yard likes status while visitor is here
  if (activeVisit) {
    const likesYard = synergy.likesByVisitor[activeVisit.visitorId];
    const yardMatchReasons = synergy.reasonsByVisitor[activeVisit.visitorId];
    if (
      likesYard !== activeVisit.likesYard ||
      yardMatchReasons.join(',') !== activeVisit.yardMatchReasons.join(',')
    ) {
      activeVisit = {
        ...activeVisit,
        likesYard,
        yardMatchReasons,
      };
    }
  }

  if (
    dateKey === current.dateKey &&
    dailyVisitCount === current.dailyVisitCount &&
    activeVisit === current.activeVisit &&
    nextSpawnAt === current.nextSpawnAt &&
    arrivalNoticeUnread === current.arrivalNoticeUnread &&
    affinities === current.affinities &&
    state.visitorState
  ) {
    return { nextState: state, justArrivedVisitorId: null };
  }

  return {
    nextState: {
      ...state,
      visitorState: {
        ...current,
        dateKey,
        dailyVisitCount,
        activeVisit,
        nextSpawnAt,
        arrivalNoticeUnread,
        affinities,
      },
    },
    justArrivedVisitorId,
  };
}

export function dismissVisitorArrivalNotice(state: GameState): GameState {
  if (!state.visitorState?.arrivalNoticeUnread) return state;
  return {
    ...state,
    visitorState: {
      ...state.visitorState,
      arrivalNoticeUnread: false,
    },
  };
}

export interface AvailableOfferingItem {
  key: string;
  offering: VisitorOffering;
  name: string;
  emoji: string;
  count: number;
  reaction: 'favorite' | 'neutral' | 'disliked';
}

export function getOfferingMeta(offering: VisitorOffering): {
  name: string;
  emoji: string;
} {
  if (offering.kind === 'ingredient') {
    const ing = INGREDIENTS[offering.id];
    return { name: ing.name, emoji: ing.emoji };
  }
  if (offering.kind === 'treat') {
    const treat = VISITOR_TREAT_BY_ID[offering.id];
    return { name: treat.name, emoji: treat.emoji };
  }
  const food = FOOD_BY_ID[offering.id];
  return { name: food?.name ?? '料理', emoji: food?.emoji ?? '🍽️' };
}

export function classifyVisitorReaction(
  visitorId: VisitorId,
  offering: VisitorOffering
): 'favorite' | 'neutral' | 'disliked' {
  const pref = VISITOR_BY_ID[visitorId].preference;
  const key = buildOfferingKey(offering);
  if (pref.favoriteOfferingKeys.includes(key)) return 'favorite';
  if (pref.dislikedOfferingKeys.includes(key)) return 'disliked';
  return 'neutral';
}

export function getAvailableVisitorOfferings(
  state: GameState,
  visitorId: VisitorId
): AvailableOfferingItem[] {
  const items: AvailableOfferingItem[] = [];

  for (const treat of VISITOR_TREATS) {
    const count = state.visitorTreats?.[treat.id] ?? 0;
    if (count > 0) {
      const offering: VisitorOffering = { kind: 'treat', id: treat.id };
      items.push({
        key: buildOfferingKey(offering),
        offering,
        name: treat.name,
        emoji: treat.emoji,
        count,
        reaction: classifyVisitorReaction(visitorId, offering),
      });
    }
  }

  for (const ingId of INGREDIENT_IDS) {
    const count = state.ingredients[ingId] ?? 0;
    if (count > 0) {
      const offering: VisitorOffering = { kind: 'ingredient', id: ingId };
      items.push({
        key: buildOfferingKey(offering),
        offering,
        name: INGREDIENTS[ingId].name,
        emoji: INGREDIENTS[ingId].emoji,
        count,
        reaction: classifyVisitorReaction(visitorId, offering),
      });
    }
  }

  for (const food of FOODS) {
    const count = state.foods[food.id] ?? 0;
    if (count > 0) {
      const offering: VisitorOffering = { kind: 'food', id: food.id };
      items.push({
        key: buildOfferingKey(offering),
        offering,
        name: food.name,
        emoji: food.emoji,
        count,
        reaction: classifyVisitorReaction(visitorId, offering),
      });
    }
  }

  const orderRank = { favorite: 0, neutral: 1, disliked: 2 };
  return items.sort((a, b) => orderRank[a.reaction] - orderRank[b.reaction]);
}

export interface VisitorActionResult {
  nextState: GameState;
  ok: boolean;
  error?: string;
  notice?: string;
}

export function feedVisitor(
  state: GameState,
  offering: VisitorOffering,
  actorName = '飼主'
): VisitorActionResult {
  const visitorState = state.visitorState ?? createInitialVisitorState();
  const visit = visitorState.activeVisit;
  if (!visit) {
    return { nextState: state, ok: false, error: '目前庭院裡沒有訪客喔！' };
  }
  if (visit.fedCount >= visit.maxFeedCount) {
    return {
      nextState: state,
      ok: false,
      error: '這位小客人這次已經吃飽飽了，留點肚子下次再來玩！',
    };
  }

  // Verify & deduct inventory
  let nextFoods = state.foods;
  let nextIngredients = state.ingredients;
  let nextTreats = { ...(state.visitorTreats ?? {}) };

  if (offering.kind === 'treat') {
    const qty = nextTreats[offering.id] ?? 0;
    if (qty <= 0) return { nextState: state, ok: false, error: '這種小點心已經用完囉！' };
    nextTreats = { ...nextTreats, [offering.id]: qty - 1 };
  } else if (offering.kind === 'ingredient') {
    const qty = nextIngredients[offering.id] ?? 0;
    if (qty <= 0) return { nextState: state, ok: false, error: '倉庫裡沒有這個食材囉！' };
    nextIngredients = { ...nextIngredients, [offering.id]: qty - 1 };
  } else {
    const qty = nextFoods[offering.id] ?? 0;
    if (qty <= 0) return { nextState: state, ok: false, error: '食堂裡沒有這份料理囉！' };
    nextFoods = { ...nextFoods, [offering.id]: qty - 1 };
  }

  const visitor = VISITOR_BY_ID[visit.visitorId];
  const reaction = classifyVisitorReaction(visit.visitorId, offering);
  const prevAff = visitorState.affinities[visit.visitorId];
  const prevLevel = prevAff.level;
  const now = Date.now();
  const isFirstHost = prevAff.firstHostedAt === null;

  // 緩慢累積好感度，避免一次餵食解鎖全部內容
  const expGain = reaction === 'favorite' ? 18 : reaction === 'neutral' ? 9 : 4;
  const nextExp = prevAff.exp + expGain;
  const nextLevel = getAffinityLevelFromExp(nextExp);

  // 控制金幣發放避免通貨膨脹：小額金幣 + 食材 / 種子 / 家具碎片
  const coinReward = reaction === 'favorite' ? 14 : reaction === 'neutral' ? 8 : 3;
  const shardReward =
    reaction === 'favorite' && (prevAff.totalFed % 2 === 0 || nextLevel >= 4) ? 1 : 0;

  let bonusItemLabel = '';
  const updatedIngredients = { ...nextIngredients };
  const updatedTreats = { ...nextTreats };

  if (reaction === 'favorite') {
    if (visitor.id === 'bird') {
      updatedTreats.seeds_mix = (updatedTreats.seeds_mix ?? 0) + 1;
      if (Math.random() < 0.45) {
        updatedIngredients.sunflower = (updatedIngredients.sunflower ?? 0) + 1;
        bonusItemLabel = '向日葵籽 ×1、綜合穀粒種子 ×1';
      } else {
        bonusItemLabel = '綜合穀粒種子 ×1';
      }
    } else if (visitor.id === 'squirrel') {
      if (Math.random() < 0.4) {
        updatedIngredients.dream_cocoa = (updatedIngredients.dream_cocoa ?? 0) + 1;
        bonusItemLabel = '夢幻可可 ×1';
      } else {
        updatedIngredients.corn = (updatedIngredients.corn ?? 0) + 1;
        bonusItemLabel = '香甜玉米 ×1';
      }
    } else {
      updatedIngredients.carrot = (updatedIngredients.carrot ?? 0) + 1;
      bonusItemLabel = '紅蘿蔔 ×1';
    }
  }

  let nextOwnedDecors = [...visitorState.ownedYardDecors];
  let nextPlacedDecors = [...visitorState.placedYardDecors];
  let nextAccessories = [...state.accessories];
  let nextUnlockedTitles = [...state.encyclopedia.unlockedTitles];
  let extraShards = shardReward;
  const milestoneMsgs: string[] = [];

  // Handle affinity level-up rewards
  for (let lv = prevLevel + 1; lv <= nextLevel; lv += 1) {
    if (lv === 2) {
      const decorId: VisitorDecorId =
        visitor.id === 'bird'
          ? 'feather_windchime'
          : visitor.id === 'squirrel'
          ? 'acorn_ornament'
          : 'rabbit_garden_statue';
      if (!nextOwnedDecors.includes(decorId)) nextOwnedDecors.push(decorId);
      if (!nextPlacedDecors.includes(decorId)) nextPlacedDecors.push(decorId);
      milestoneMsgs.push(`解鎖專屬擺飾「${VISITOR_DECOR_BY_ID[decorId].name}」`);
    } else if (lv === 3) {
      extraShards += visitor.id === 'squirrel' ? 3 : 2;
      if (visitor.id === 'bird') {
        updatedIngredients.sunflower = (updatedIngredients.sunflower ?? 0) + 2;
        updatedIngredients.dream_cocoa = (updatedIngredients.dream_cocoa ?? 0) + 1;
      } else if (visitor.id === 'squirrel') {
        updatedIngredients.moon_wheat = (updatedIngredients.moon_wheat ?? 0) + 2;
        updatedIngredients.dream_cocoa = (updatedIngredients.dream_cocoa ?? 0) + 1;
      } else {
        updatedIngredients.carrot = (updatedIngredients.carrot ?? 0) + 3;
        updatedIngredients.mint = (updatedIngredients.mint ?? 0) + 1;
      }
      milestoneMsgs.push('獲得 Lv.3 珍稀食材與家具碎片大禮！');
    } else if (lv === 4) {
      milestoneMsgs.push(`${visitor.speciesLabel}以後會更常來庭院串門子囉！`);
    } else if (lv === 5) {
      const accId =
        visitor.id === 'bird'
          ? 'visitor_feather_clip'
          : visitor.id === 'squirrel'
          ? 'visitor_acorn_charm'
          : 'visitor_rabbit_wreath';
      const titleId =
        visitor.id === 'bird'
          ? 'bird_whisperer'
          : visitor.id === 'squirrel'
          ? 'squirrel_friend'
          : 'rabbit_guardian';
      if (!nextAccessories.includes(accId)) {
        nextAccessories.push(accId);
      }
      if (!nextUnlockedTitles.includes(titleId)) {
        nextUnlockedTitles.push(titleId);
      }
      milestoneMsgs.push(
        `解鎖造型「${getAccessoryById(accId)?.name ?? accId}」與稱號「${getTitleDefinition(titleId).name}」！`
      );
    }
  }

  const lines =
    reaction === 'favorite'
      ? visitor.favoriteFeedLines
      : reaction === 'neutral'
      ? visitor.neutralFeedLines
      : visitor.dislikedFeedLines;
  const line = lines[Math.floor(Math.random() * lines.length)] ?? '謝謝你的點心！';

  const rewardParts = [`+${coinReward} 金幣`, `+${expGain} 好感`];
  if (extraShards > 0) rewardParts.push(`+${extraShards} 家具碎片`);
  if (bonusItemLabel) rewardParts.push(bonusItemLabel);
  const rewardSummary = rewardParts.join(' · ');

  const nextAffinity: VisitorAffinity = {
    ...prevAff,
    level: nextLevel,
    exp: nextExp,
    totalFed: prevAff.totalFed + 1,
    unlockedDecor: prevAff.unlockedDecor || nextLevel >= 2,
    unlockedCostume: prevAff.unlockedCostume || nextLevel >= 5,
    firstHostedAt: prevAff.firstHostedAt ?? now,
  };

  let nextState: GameState = {
    ...state,
    coins: state.coins + coinReward,
    furnitureShards: state.furnitureShards + extraShards,
    foods: nextFoods,
    ingredients: updatedIngredients,
    visitorTreats: updatedTreats,
    accessories: nextAccessories,
    encyclopedia: {
      ...state.encyclopedia,
      unlockedTitles: nextUnlockedTitles,
      activeTitle: state.encyclopedia.activeTitle ?? nextUnlockedTitles[0] ?? null,
    },
    visitorState: {
      ...visitorState,
      arrivalNoticeUnread: false,
      ownedYardDecors: nextOwnedDecors,
      placedYardDecors: nextPlacedDecors,
      affinities: {
        ...visitorState.affinities,
        [visit.visitorId]: nextAffinity,
      },
      activeVisit: {
        ...visit,
        fedCount: visit.fedCount + 1,
        lastFeedReaction: reaction,
        lastFeedLine: line,
        lastRewardSummary: rewardSummary,
      },
    },
  };

  // 回憶冊整合：初次招待與每次好感度升級自動建立回憶卡
  if (isFirstHost) {
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: `visitor_first_host_${visitor.id}`,
      type: 'visitor',
      title: `第一次招待「${visitor.name}」`,
      description: `在庭院用美味點心迎接了${visitor.name}，展開溫馨的森林友誼！`,
      emoji: visitor.emoji,
      actorName,
    });
  }

  for (let lv = prevLevel + 1; lv <= nextLevel; lv += 1) {
    const lvReward = visitor.levelRewards.find((r) => r.level === lv);
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: `visitor_affinity_${visitor.id}_lv_${lv}`,
      type: 'visitor',
      title: `${visitor.name} 好感度升至 Lv.${lv}！`,
      description: lvReward?.description ?? `和${visitor.name}變得更加親近了！`,
      emoji: visitor.emoji,
      level: lv,
      actorName,
    });
  }

  nextState = syncAllAccessoryProgress(nextState).nextState;

  const offeringMeta = getOfferingMeta(offering);
  const prefix =
    reaction === 'favorite'
      ? `${visitor.name}超喜歡「${offeringMeta.name}」！`
      : reaction === 'disliked'
      ? `餵食了「${offeringMeta.name}」，${visitor.speciesLabel}依然禮貌致謝`
      : `招待了「${offeringMeta.name}」！`;

  return {
    nextState,
    ok: true,
    notice:
      milestoneMsgs.length > 0
        ? `${prefix} ${rewardSummary} · ${milestoneMsgs.join(' ')}`
        : `${prefix} ${rewardSummary}`,
  };
}

export function captureVisitorPhoto(
  state: GameState,
  params: {
    visitorId: VisitorId;
    isCoopPhoto?: boolean;
    poseId?: PhotoPose;
    facing?: PetViewDirection;
    filterId?: PhotoFilter;
    frameId?: PhotoFrame;
    stickers?: PhotoStickerId[];
    caption?: string;
  }
): VisitorActionResult {
  const activePet = getActivePet(state);
  const visitor = VISITOR_BY_ID[params.visitorId];
  const now = Date.now();
  const photoId = `vphoto_${now}_${Math.random().toString(36).slice(2, 6)}`;
  const title = params.isCoopPhoto
    ? `我們與${visitor.name}的共同紀念照`
    : `${activePet.name}與${visitor.name}的庭院合照`;
  const caption =
    params.caption?.trim() ||
    (params.isCoopPhoto
      ? `兩人一起在庭院招待${visitor.name}留下的開心瞬間！`
      : `${activePet.name}和來訪的${visitor.name}在暖陽庭院一起合影！`);

  const photo: RoomPhotoRecord = {
    id: photoId,
    title,
    caption,
    createdAt: now,
    houseName: state.house.houseName,
    petId: activePet.id,
    species: activePet.species,
    petName: activePet.name,
    equipped: { ...activePet.accessories },
    poseId: 'happy_jump',
    wallpaperId: state.house.roomLayout.wallpaperId,
    flooringId: state.house.roomLayout.flooringId,
    placedItems: state.house.roomLayout.placedItems,
    photoKind: 'visitor',
    visitorId: params.visitorId,
    isCoopPhoto: params.isCoopPhoto,
    scene: 'visitor',
    wardrobePoseId: params.poseId ?? 'happy',
    facing: params.facing ?? 'front',
    filterId: params.filterId ?? 'forest',
    frameId: params.frameId ?? (params.isCoopPhoto ? 'coop_heart' : 'polaroid'),
    stickers: params.stickers ?? ['star'],
    weightAtCapture: activePet.weight,
    likes: [],
    comments: [],
  };

  const visitorState = state.visitorState ?? createInitialVisitorState(now);
  const nextActiveVisit =
    visitorState.activeVisit && visitorState.activeVisit.visitorId === params.visitorId
      ? { ...visitorState.activeVisit, photoTaken: true }
      : visitorState.activeVisit;

  const nextCoopVisitor =
    params.isCoopPhoto && state.coop.coopVisitor
      ? { ...state.coop.coopVisitor, photoTaken: true }
      : state.coop.coopVisitor;

  let nextState: GameState = {
    ...state,
    house: {
      ...state.house,
      photos: [photo, ...state.house.photos].slice(0, 36),
    },
    visitorState: {
      ...visitorState,
      activeVisit: nextActiveVisit,
    },
    coop: {
      ...state.coop,
      coopVisitor: nextCoopVisitor,
    },
  };

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `visitor_photo_${photoId}`,
    petId: activePet.id,
    type: 'visitor',
    title,
    description: caption,
    emoji: '📸',
    photoId,
    isShared: params.isCoopPhoto,
  });

  nextState = maybeGrantCatPhotoMemoryCard(nextState).nextState;

  return {
    nextState,
    ok: true,
    notice: `已拍下「${title}」並存入照片牆與回憶冊！`,
  };
}

export function buyVisitorTreat(
  state: GameState,
  treatId: VisitorTreatId,
  qty = 1
): VisitorActionResult {
  const treat = VISITOR_TREAT_BY_ID[treatId];
  const totalCost = treat.price * qty;
  if (state.coins < totalCost) {
    return { nextState: state, ok: false, error: `金幣不足（需要 ${totalCost} 金幣）` };
  }
  const currentQty = state.visitorTreats?.[treatId] ?? 0;
  return {
    nextState: {
      ...state,
      coins: state.coins - totalCost,
      visitorTreats: {
        ...(state.visitorTreats ?? {}),
        [treatId]: currentQty + qty,
      },
    },
    ok: true,
    notice: `購買「${treat.name}」×${qty}！可帶去庭院招待訪客`,
  };
}

export function buyOrToggleVisitorDecor(
  state: GameState,
  decorId: VisitorDecorId
): VisitorActionResult {
  const decor = VISITOR_DECOR_BY_ID[decorId];
  const visitorState = state.visitorState ?? createInitialVisitorState();
  const isOwned = visitorState.ownedYardDecors.includes(decorId);

  if (isOwned) {
    const isPlaced = visitorState.placedYardDecors.includes(decorId);
    const nextPlaced = isPlaced
      ? visitorState.placedYardDecors.filter((id) => id !== decorId)
      : [...visitorState.placedYardDecors, decorId];
    return {
      nextState: {
        ...state,
        visitorState: {
          ...visitorState,
          placedYardDecors: nextPlaced,
        },
      },
      ok: true,
      notice: isPlaced
        ? `已收起庭院擺飾「${decor.name}」`
        : `已在庭院擺出「${decor.name}」！`,
    };
  }

  if (decor.unlockByAffinity) {
    const visitorName = VISITOR_BY_ID[decor.unlockByAffinity.visitorId].name;
    return {
      nextState: state,
      ok: false,
      error: `此擺飾需要與${visitorName}好感度達到 Lv.${decor.unlockByAffinity.level} 解鎖喔！`,
    };
  }

  if (state.coins < decor.price) {
    return { nextState: state, ok: false, error: `金幣不足（需要 ${decor.price} 金幣）` };
  }

  return {
    nextState: {
      ...state,
      coins: state.coins - decor.price,
      visitorState: {
        ...visitorState,
        ownedYardDecors: [...visitorState.ownedYardDecors, decorId],
        placedYardDecors: [...visitorState.placedYardDecors, decorId],
      },
    },
    ok: true,
    notice: `購買並擺出「${decor.name}」！吸引 ${VISITOR_BY_ID[decor.attractsVisitorId].speciesLabel} 的機率提升了！`,
  };
}

export function craftShardFurniture(
  state: GameState,
  itemId: string
): VisitorActionResult {
  const item = ROOM_ITEM_BY_ID[itemId];
  if (!item || !item.shardCost || item.shardCost <= 0) {
    return { nextState: state, ok: false, error: '找不到這件碎片限定家具' };
  }
  if (state.furnitureShards < item.shardCost) {
    return {
      nextState: state,
      ok: false,
      error: `家具碎片不足（需要 ${item.shardCost} 個，目前 ${state.furnitureShards} 個）`,
    };
  }

  const nextCollected = state.house.collectedFurnitureIds.includes(item.id)
    ? state.house.collectedFurnitureIds
    : [...state.house.collectedFurnitureIds, item.id];

  const draft: GameState = {
    ...state,
    furnitureShards: state.furnitureShards - item.shardCost,
    house: {
      ...state.house,
      ownedFurnitureCounts: {
        ...state.house.ownedFurnitureCounts,
        [item.id]: (state.house.ownedFurnitureCounts[item.id] ?? 0) + 1,
      },
      collectedFurnitureIds: nextCollected,
    },
  };

  const synced = syncHouseProgress(draft);
  return {
    nextState: synced.nextState,
    ok: true,
    notice: `成功合成限定家具「${item.name}」！可前往小屋擺放囉`,
  };
}

export function useFarmSpeedTicket(
  state: GameState,
  plotId: number
): VisitorActionResult {
  const tickets = state.farmSpeedTickets ?? 0;
  if (tickets <= 0) {
    return { nextState: state, ok: false, error: '目前沒有農場加速券，可在小鎮訂單板取得！' };
  }

  const plot = state.farmPlots.find((p) => p.id === plotId);
  if (!plot || !plot.cropId || plot.plantedAt === null) {
    return { nextState: state, ok: false, error: '請先在農地種植作物再使用加速券' };
  }

  const now = Date.now();
  const readyAt = plot.plantedAt + plot.durationMs;
  const remainingMs = readyAt - now;
  if (remainingMs <= 0) {
    return { nextState: state, ok: false, error: '這塊農地的作物已經可以收成囉！' };
  }

  // 縮短一半剩餘成熟時間（至少縮短 15 分鐘，若剩餘少於 15 分鐘則直接成熟）
  const cutMs = Math.max(15 * 60 * 1000, Math.round(remainingMs * 0.5));
  const nextPlantedAt = plot.plantedAt - cutMs;
  const cropName = INGREDIENTS[plot.cropId].name;

  return {
    nextState: {
      ...state,
      farmSpeedTickets: tickets - 1,
      farmPlots: state.farmPlots.map((p) =>
        p.id === plotId ? { ...p, plantedAt: nextPlantedAt } : p
      ),
    },
    ok: true,
    notice:
      remainingMs <= cutMs
        ? `使用農場加速券！${cropName} 立刻成熟可以收成啦！`
        : `使用農場加速券！${cropName} 的剩餘成熟時間已大幅縮短！`,
  };
}
