import { FOOD_BY_ID } from '../data/foods';
import { INGREDIENT_IDS, INGREDIENTS } from '../data/kitchen';
import { TOWN_ORDER_TEMPLATES, TownOrderTemplate, VISITOR_TREAT_BY_ID } from '../data/visitors';
import { GameState, TownOrder, TownOrderCategory, VisitorTreatId } from '../types';

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
    reward: {
      coins: template.reward.coins,
      furnitureShards: template.reward.furnitureShards,
      farmSpeedTickets: template.reward.farmSpeedTickets,
      rareIngredients: { ...template.reward.rareIngredients },
      treats: template.reward.treats ? { ...template.reward.treats } : undefined,
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
  const categories: TownOrderCategory[] = ['visitor', 'coop', 'advanced'];
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
    // Carry over unfinished recent orders marked overdue so player can still finish cleanly or see them without losing resources,
    // plus add today's fresh orders (keeping list concise: today's 3 + at most 1 unfinished overdue)
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
  const nextOrders = existing.map((order) => {
    if (!order.completed && !order.overdue && now > order.expiresAt) {
      changed = true;
      return { ...order, overdue: true };
    }
    return order;
  });

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
  const allDone = nextReqs.every((r) => r.deliveredQty >= r.requiredQty);
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

  const nextOrders = orders.map((o) =>
    o.id === orderId
      ? { ...o, claimedByUserIds: [...o.claimedByUserIds, userId] }
      : o
  );

  const rewardSummaryParts = [`+${coinsEarned} 金幣`, `+${shardsEarned} 家具碎片`];
  if (ticketsEarned > 0) {
    rewardSummaryParts.push(`+${ticketsEarned} 農場加速券`);
  }

  return {
    nextState: {
      ...state,
      coins: state.coins + coinsEarned,
      furnitureShards: state.furnitureShards + shardsEarned,
      farmSpeedTickets: (state.farmSpeedTickets ?? 0) + ticketsEarned,
      ingredients: nextIngredients,
      visitorTreats: nextTreats,
      townOrders: nextOrders,
    },
    ok: true,
    notice: order.overdue
      ? `完成逾期訂單（不扣資源！取得基礎謝禮）：${rewardSummaryParts.join(' · ')}`
      : `領取完整訂單獎勵：${rewardSummaryParts.join(' · ')}`,
  };
}
