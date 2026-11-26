import { FOOD_BY_ID } from '../data/foods';
import { INGREDIENT_IDS, INGREDIENTS } from '../data/kitchen';
import { TOWN_ORDER_TEMPLATES, TownOrderTemplate, VISITOR_TREAT_BY_ID } from '../data/visitors';
import {
  GameState,
  RoomPhotoRecord,
  TownOrder,
  TownOrderCategory,
  VisitorTreatId,
} from '../types';
import { getPhotoStudioState } from './photoStudio';
import { grantTownTickets, syncTownMapState } from './townMap';

function formatLocalDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getEndOfDayTimestamp(dateStr: string): number {
  const parsed = new Date(`${dateStr}T23:59:59`);
  if (Number.isNaN(parsed.getTime())) {
    return Date.now() + 86400000;
  }
  return parsed.getTime();
}

function getDaySeed(dateKey: string): number {
  const parts = dateKey.split('-').map((n) => parseInt(n, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return 0;
  return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
}

function instantiateOrder(
  template: TownOrderTemplate,
  dateKey: string,
  now: number
): TownOrder {
  return {
    id: `tord_${dateKey}_${template.key}`,
    dateKey,
    category: template.category,
    visitorId: template.visitorId,
    title: template.title,
    description: template.description,
    emoji: template.emoji,
    requirements: template.requirements.map((r) => ({
      key: `${r.kind}:${r.itemId}`,
      kind: r.kind,
      itemId: r.itemId,
      label: r.label,
      emoji: r.emoji,
      requiredQty: r.requiredQty,
      deliveredQty: 0,
    })),
    photoRequirement: template.photoRequirement
      ? {
          ...template.photoRequirement,
          currentCount: 0,
        }
      : undefined,
    reward: {
      coins: template.reward.coins,
      furnitureShards: template.reward.furnitureShards,
      farmSpeedTickets: template.reward.farmSpeedTickets,
      rareIngredients: { ...template.reward.rareIngredients },
      treats: template.reward.treats ? { ...template.reward.treats } : undefined,
      studioMaterials: template.reward.studioMaterials,
      unlockStudio: template.reward.unlockStudio
        ? { ...template.reward.unlockStudio }
        : undefined,
    },
    createdAt: now,
    expiresAt: getEndOfDayTimestamp(dateKey),
    completed: false,
    completedAt: null,
    overdue: false,
    claimedByUserIds: [],
  };
}

export function createInitialTownOrders(
  dateKey: string = formatLocalDate(),
  now: number = Date.now()
): TownOrder[] {
  const seed = Math.abs(getDaySeed(dateKey));
  const categories: TownOrderCategory[] = ['visitor', 'coop', 'photo', 'advanced'];
  const orders: TownOrder[] = [];

  for (const cat of categories) {
    const pool = TOWN_ORDER_TEMPLATES.filter((t) => t.category === cat);
    if (pool.length > 0) {
      const tpl = pool[seed % pool.length];
      orders.push(instantiateOrder(tpl, dateKey, now));
    }
  }

  return orders;
}

export function syncTownOrders(
  state: GameState,
  now: number = Date.now()
): GameState {
  const todayKey = formatLocalDate(new Date(now));
  const existing = state.townOrders ?? [];

  if (existing.length === 0) {
    return {
      ...state,
      townOrders: createInitialTownOrders(todayKey, now),
    };
  }

  // Daily refresh if all orders belong to an older date
  const hasTodayOrder = existing.some((o) => o.dateKey === todayKey);
  if (!hasTodayOrder) {
    const carryOver = existing
      .filter((o) => o.claimedByUserIds.length === 0)
      .slice(0, 1)
      .map((o) => ({ ...o, overdue: true }));
    return {
      ...state,
      townOrders: [...createInitialTownOrders(todayKey, now), ...carryOver],
    };
  }

  let changed = false;
  let nextOrders = existing.map((order) => {
    if (!order.completed && !order.overdue && now > order.expiresAt) {
      changed = true;
      return { ...order, overdue: true };
    }
    return order;
  });

  // Ensure today's photo order exists even on upgraded mid-day saves
  const hasTodayPhotoOrder = nextOrders.some(
    (o) => o.dateKey === todayKey && o.category === 'photo'
  );
  if (!hasTodayPhotoOrder) {
    const photoPool = TOWN_ORDER_TEMPLATES.filter((t) => t.category === 'photo');
    if (photoPool.length > 0) {
      const seed = Math.abs(getDaySeed(todayKey));
      const tpl = photoPool[seed % photoPool.length];
      nextOrders = [...nextOrders, instantiateOrder(tpl, todayKey, now)];
      changed = true;
    }
  }

  if (!changed) return state;
  return {
    ...state,
    townOrders: nextOrders,
  };
}

export interface TownOrderActionResult {
  nextState: GameState;
  ok: boolean;
  error?: string;
  notice?: string;
}

export function getPlayerStockForRequirement(
  state: GameState,
  req: { kind: 'ingredient' | 'food' | 'treat'; itemId: string }
): number {
  if (req.kind === 'ingredient') {
    return state.ingredients[req.itemId as keyof typeof state.ingredients] ?? 0;
  }
  if (req.kind === 'treat') {
    return state.visitorTreats?.[req.itemId as VisitorTreatId] ?? 0;
  }
  return state.foods[req.itemId] ?? 0;
}

export function deliverTownOrderItem(
  state: GameState,
  orderId: string,
  itemKey: string
): TownOrderActionResult {
  const orders = state.townOrders ?? [];
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return { nextState: state, ok: false, error: '找不到這筆小鎮訂單' };
  }
  if (order.completed) {
    return { nextState: state, ok: false, error: '這筆訂單已完成準備，可直接領取獎勵！' };
  }

  const req = order.requirements.find((r) => r.key === itemKey);
  if (!req) {
    return { nextState: state, ok: false, error: '訂單不包含這個項目' };
  }
  if (req.deliveredQty >= req.requiredQty) {
    return { nextState: state, ok: false, error: `「${req.label}」已經交付滿了喔！` };
  }

  const stock = getPlayerStockForRequirement(state, req);
  if (stock <= 0) {
    const labelName =
      req.kind === 'ingredient'
        ? INGREDIENTS[req.itemId as keyof typeof INGREDIENTS]?.name ?? req.label
        : req.kind === 'treat'
        ? VISITOR_TREAT_BY_ID[req.itemId as VisitorTreatId]?.name ?? req.label
        : FOOD_BY_ID[req.itemId]?.name ?? req.label;
    return { nextState: state, ok: false, error: `庫存裡沒有「${labelName}」可以交付喔！` };
  }

  let nextIngredients = state.ingredients;
  let nextFoods = state.foods;
  let nextTreats = { ...(state.visitorTreats ?? {}) };

  if (req.kind === 'ingredient') {
    const ingKey = req.itemId as keyof typeof state.ingredients;
    nextIngredients = { ...nextIngredients, [ingKey]: Math.max(0, (nextIngredients[ingKey] ?? 0) - 1) };
  } else if (req.kind === 'treat') {
    const tKey = req.itemId as VisitorTreatId;
    nextTreats = { ...nextTreats, [tKey]: Math.max(0, (nextTreats[tKey] ?? 0) - 1) };
  } else {
    nextFoods = { ...nextFoods, [req.itemId]: Math.max(0, (nextFoods[req.itemId] ?? 0) - 1) };
  }

  const nextReqs = order.requirements.map((r) =>
    r.key === itemKey ? { ...r, deliveredQty: r.deliveredQty + 1 } : r
  );
  const itemsDone = nextReqs.every((r) => r.deliveredQty >= r.requiredQty);
  const photoDone =
    !order.photoRequirement ||
    order.photoRequirement.currentCount >= order.photoRequirement.targetCount;
  const allDone = itemsDone && photoDone;
  const now = Date.now();

  const nextOrders = orders.map((o) =>
    o.id === orderId
      ? {
          ...o,
          requirements: nextReqs,
          completed: allDone,
          completedAt: allDone ? now : null,
        }
      : o
  );

  return {
    nextState: {
      ...state,
      ingredients: nextIngredients,
      foods: nextFoods,
      visitorTreats: nextTreats,
      townOrders: nextOrders,
    },
    ok: true,
    notice: allDone
      ? `完成訂單「${order.title}」！快點擊領取獎勵吧！`
      : `已交付 1 份「${req.label}」（${req.deliveredQty + 1}/${req.requiredQty}）`,
  };
}

export function advancePhotoTownOrders(
  state: GameState,
  photo: RoomPhotoRecord
): { nextState: GameState; newlyCompletedOrderTitles: string[] } {
  const orders = state.townOrders ?? [];
  if (orders.length === 0) {
    return { nextState: state, newlyCompletedOrderTitles: [] };
  }

  const isVisitorPhoto =
    photo.photoKind === 'visitor' || photo.scene === 'visitor' || Boolean(photo.visitorId);
  if (!isVisitorPhoto) {
    return { nextState: state, newlyCompletedOrderTitles: [] };
  }

  let changed = false;
  const newlyCompletedOrderTitles: string[] = [];
  const now = Date.now();

  const nextOrders = orders.map((order) => {
    if (order.completed || !order.photoRequirement) return order;
    const req = order.photoRequirement;
    if (req.currentCount >= req.targetCount) return order;
    if (req.visitorId && photo.visitorId !== req.visitorId) return order;
    if (req.requiresStudioScene && !(photo.scene === 'visitor' && Boolean(photo.backgroundId))) {
      return order;
    }

    changed = true;
    const nextCount = Math.min(req.targetCount, req.currentCount + 1);
    const itemsDone = order.requirements.every((r) => r.deliveredQty >= r.requiredQty);
    const allDone = itemsDone && nextCount >= req.targetCount;
    if (allDone) {
      newlyCompletedOrderTitles.push(order.title);
    }
    return {
      ...order,
      photoRequirement: {
        ...req,
        currentCount: nextCount,
      },
      completed: allDone,
      completedAt: allDone ? now : order.completedAt,
    };
  });

  if (!changed) {
    return { nextState: state, newlyCompletedOrderTitles: [] };
  }

  return {
    nextState: {
      ...state,
      townOrders: nextOrders,
    },
    newlyCompletedOrderTitles,
  };
}

export function claimTownOrderReward(
  state: GameState,
  orderId: string,
  userId = 'local'
): TownOrderActionResult {
  const orders = state.townOrders ?? [];
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return { nextState: state, ok: false, error: '找不到這筆訂單' };
  }
  if (!order.completed) {
    return { nextState: state, ok: false, error: '請先交付全部所需食材或料理！' };
  }
  if (order.claimedByUserIds.includes(userId)) {
    return { nextState: state, ok: false, error: '你已經領取過這筆訂單的獎勵囉！' };
  }

  // 逾期不扣資源，只是無法獲得完整獎勵
  const coinsEarned = order.overdue
    ? Math.max(10, Math.round(order.reward.coins * 0.65))
    : order.reward.coins;
  const shardsEarned = order.overdue
    ? Math.max(1, Math.floor(order.reward.furnitureShards * 0.5))
    : order.reward.furnitureShards;
  const ticketsEarned = order.overdue ? 0 : order.reward.farmSpeedTickets;

  const nextIngredients = { ...state.ingredients };
  for (const ingId of INGREDIENT_IDS) {
    const qty = order.reward.rareIngredients[ingId] ?? 0;
    if (qty > 0 && !order.overdue) {
      nextIngredients[ingId] = (nextIngredients[ingId] ?? 0) + qty;
    }
  }

  const nextTreats = { ...(state.visitorTreats ?? {}) };
  if (order.reward.treats && !order.overdue) {
    for (const [treatId, qty] of Object.entries(order.reward.treats)) {
      if (qty && qty > 0) {
        nextTreats[treatId as VisitorTreatId] =
          (nextTreats[treatId as VisitorTreatId] ?? 0) + qty;
      }
    }
  }

  const materialsEarned = order.overdue ? 0 : (order.reward.studioMaterials ?? 0);
  const townTicketsEarned = order.overdue
    ? 5
    : order.category === 'coop'
    ? 10
    : order.category === 'photo' || order.category === 'advanced'
    ? 8
    : 5;
  const baseStudio = getPhotoStudioState(state);
  const nextBgs = new Set(baseStudio.unlockedBackgrounds);
  const nextFilters = new Set(baseStudio.unlockedFilters);
  const nextFrames = new Set(baseStudio.unlockedFrames);

  if (!order.overdue && order.reward.unlockStudio) {
    if (order.reward.unlockStudio.backgroundId) {
      nextBgs.add(order.reward.unlockStudio.backgroundId);
    }
    if (order.reward.unlockStudio.filterId) {
      nextFilters.add(order.reward.unlockStudio.filterId);
    }
    if (order.reward.unlockStudio.frameId) {
      nextFrames.add(order.reward.unlockStudio.frameId);
    }
  }

  const nextOrders = orders.map((o) =>
    o.id === orderId
      ? { ...o, claimedByUserIds: [...o.claimedByUserIds, userId] }
      : o
  );

  const rewardSummaryParts = [
    `+${coinsEarned} 金幣`,
    `+${townTicketsEarned} 小鎮券`,
    `+${shardsEarned} 家具碎片`,
  ];
  if (ticketsEarned > 0) {
    rewardSummaryParts.push(`+${ticketsEarned} 農場加速券`);
  }
  if (materialsEarned > 0) {
    rewardSummaryParts.push(`+${materialsEarned} 攝影材料`);
  }

  const syncedBase = syncTownMapState(state);
  const nextTownMap = grantTownTickets(syncedBase.townMap!, townTicketsEarned);

  return {
    nextState: {
      ...syncedBase,
      coins: syncedBase.coins + coinsEarned,
      furnitureShards: syncedBase.furnitureShards + shardsEarned,
      farmSpeedTickets: (syncedBase.farmSpeedTickets ?? 0) + ticketsEarned,
      ingredients: nextIngredients,
      visitorTreats: nextTreats,
      photoStudio: {
        ...baseStudio,
        studioMaterials: baseStudio.studioMaterials + materialsEarned,
        unlockedBackgrounds: Array.from(nextBgs),
        unlockedFilters: Array.from(nextFilters),
        unlockedFrames: Array.from(nextFrames),
      },
      townOrders: nextOrders,
      completedTownOrdersCount: (syncedBase.completedTownOrdersCount ?? 0) + 1,
      townMap: nextTownMap,
    },
    ok: true,
    notice: order.overdue
      ? `完成逾期訂單（不扣資源！取得基礎謝禮）：${rewardSummaryParts.join(' · ')}`
      : `領取完整訂單獎勵：${rewardSummaryParts.join(' · ')}`,
  };
}
