import { getAccessoryById } from '../data/accessories';
import {
  BIRTHDAY_CAKES,
  BIRTHDAY_CAKE_BY_ID,
  BIRTHDAY_DECORATIONS,
  BIRTHDAY_DECORATION_BY_ID,
  BIRTHDAY_DEFAULT_STUDIO_BACKGROUNDS,
  BIRTHDAY_DEFAULT_STUDIO_FILTERS,
  BIRTHDAY_DEFAULT_STUDIO_FRAMES,
  BIRTHDAY_DEFAULT_STUDIO_POSES,
  BIRTHDAY_DEFAULT_STUDIO_STICKERS,
  BIRTHDAY_GIFT_BY_ID,
  BIRTHDAY_ORDER_TEMPLATES,
  BIRTHDAY_PANTRY_SHOP,
  BIRTHDAY_TICKET_SHOP_ITEMS,
  FRUIT_CAKE_INGREDIENT_IDS,
  buildDailyBirthdayTasks,
  buildInitialCoopBirthdaySteps,
} from '../data/birthday';
import { getGrowthStage } from '../data/growth';
import { ROOM_ITEM_BY_ID } from '../data/house';
import { INGREDIENTS } from '../data/kitchen';
import {
  BirthdayCake,
  BirthdayCakeBase,
  BirthdayCakeCream,
  BirthdayCakeDecor,
  BirthdayCakeId,
  BirthdayCard,
  BirthdayConfig,
  BirthdayDecorationId,
  BirthdayGiftId,
  BirthdayLeapChoice,
  BirthdayOrder,
  BirthdayPantryState,
  BirthdayPhase,
  BirthdaySystemState,
  BirthdayTask,
  BirthdayTaskKind,
  CoopBirthdaySession,
  CoopBirthdayTaskKey,
  CoopOfflineEvent,
  GameState,
  IngredientId,
  Pet,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScene,
  PhotoStickerId,
} from '../types';
import { recordMemoryEntry, recordMonthlyActivity } from './memories';
import { getLocalDateString } from './noviceGrowth';
import { getActivePet, isSharedCoopPet, updatePetById } from './pets';
import { createInitialPhotoStudioState } from './photoStudio';

export interface PetBirthdayStatus {
  petId: string;
  petName: string;
  config: BirthdayConfig;
  month: number;
  day: number;
  dateLabel: string;
  phase: BirthdayPhase;
  daysUntil: number;
  daysSince: number;
  yearKey: string;
  countdownText: string;
  isReviewPeriod: boolean;
  isTodayBirthday: boolean;
  isCountdown: boolean;
  nextBirthdayDate: Date;
}

export interface BirthdayActionResult {
  nextState: GameState;
  ok: boolean;
  notice: string;
  error?: string;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function clampBirthdayDay(month: number, day: number): { month: number; day: number } {
  const safeMonth = Math.min(12, Math.max(1, Math.floor(month)));
  const maxDays = safeMonth === 2 ? 29 : getDaysInMonth(2024, safeMonth);
  const safeDay = Math.min(maxDays, Math.max(1, Math.floor(day)));
  return { month: safeMonth, day: safeDay };
}

export function resolveCelebrationDateInYear(
  config: BirthdayConfig,
  year: number
): Date {
  const { month, day } = clampBirthdayDay(config.month, config.day);
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    if (config.leapYearChoice === 'feb28') {
      return new Date(year, 1, 28);
    }
    return new Date(year, 2, 1);
  }
  const maxDay = getDaysInMonth(year, month);
  return new Date(year, month - 1, Math.min(day, maxDay));
}

export function getPetEffectiveBirthdayConfig(
  pet: Pet,
  now: Date = new Date()
): BirthdayConfig {
  if (pet.birthday && Number.isFinite(pet.birthday.month) && Number.isFinite(pet.birthday.day)) {
    const clamped = clampBirthdayDay(pet.birthday.month, pet.birthday.day);
    return {
      month: clamped.month,
      day: clamped.day,
      leapYearChoice: pet.birthday.leapYearChoice === 'feb28' ? 'feb28' : 'mar1',
      updatedAt: pet.birthday.updatedAt ?? pet.adoptedAt ?? now.getTime(),
      customized: Boolean(pet.birthday.customized),
    };
  }
  const refDate = pet.adoptedAt ? new Date(pet.adoptedAt) : now;
  const safeDate = Number.isNaN(refDate.getTime()) ? now : refDate;
  return {
    month: safeDate.getMonth() + 1,
    day: safeDate.getDate(),
    leapYearChoice: 'mar1',
    updatedAt: pet.adoptedAt ?? now.getTime(),
    customized: false,
  };
}

export function formatBirthdayDateLabel(config: BirthdayConfig): string {
  return `${config.month} 月 ${config.day} 日`;
}

export function getBirthdayCountdownText(
  petName: string,
  phase: BirthdayPhase,
  daysUntil: number
): string {
  if (phase === 'birthday') {
    return `今天是${petName}的生日！🎂`;
  }
  if (phase === 'review') {
    return '生日回憶已保存。';
  }
  if (phase === 'countdown') {
    if (daysUntil === 1) {
      return `明天就是${petName}的生日！`;
    }
    if (daysUntil <= 3) {
      return `還有 ${daysUntil} 天，可以開始準備蛋糕了！`;
    }
    return `${petName}的生日快到了！`;
  }
  return `${petName}的生日：${daysUntil} 天後`;
}

export function getBirthdayStatusForPet(
  pet: Pet,
  now: Date = new Date()
): PetBirthdayStatus {
  const config = getPetEffectiveBirthdayConfig(pet, now);
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYear = todayMid.getFullYear();

  const candidates = [thisYear - 1, thisYear, thisYear + 1].map((year) => {
    const date = resolveCelebrationDateInYear(config, year);
    const diffDays = Math.round((date.getTime() - todayMid.getTime()) / 86400000);
    return { year, date, diffDays };
  });

  const todayMatch = candidates.find((c) => c.diffDays === 0);
  if (todayMatch) {
    return {
      petId: pet.id,
      petName: pet.name,
      config,
      month: config.month,
      day: config.day,
      dateLabel: formatBirthdayDateLabel(config),
      phase: 'birthday',
      daysUntil: 0,
      daysSince: 0,
      yearKey: `${pet.id}_${todayMatch.year}`,
      countdownText: getBirthdayCountdownText(pet.name, 'birthday', 0),
      isReviewPeriod: false,
      isTodayBirthday: true,
      isCountdown: false,
      nextBirthdayDate: todayMatch.date,
    };
  }

  const reviewMatch = candidates.find((c) => c.diffDays >= -3 && c.diffDays <= -1);
  const upcoming = candidates
    .filter((c) => c.diffDays > 0)
    .sort((a, b) => a.diffDays - b.diffDays)[0] ?? {
    year: thisYear + 1,
    date: resolveCelebrationDateInYear(config, thisYear + 1),
    diffDays: 365,
  };

  if (reviewMatch) {
    const daysSince = -reviewMatch.diffDays;
    return {
      petId: pet.id,
      petName: pet.name,
      config,
      month: config.month,
      day: config.day,
      dateLabel: formatBirthdayDateLabel(config),
      phase: 'review',
      daysUntil: upcoming.diffDays,
      daysSince,
      yearKey: `${pet.id}_${reviewMatch.year}`,
      countdownText: getBirthdayCountdownText(pet.name, 'review', 0),
      isReviewPeriod: true,
      isTodayBirthday: false,
      isCountdown: false,
      nextBirthdayDate: upcoming.date,
    };
  }

  const phase: BirthdayPhase = upcoming.diffDays <= 7 ? 'countdown' : 'none';
  return {
    petId: pet.id,
    petName: pet.name,
    config,
    month: config.month,
    day: config.day,
    dateLabel: formatBirthdayDateLabel(config),
    phase,
    daysUntil: upcoming.diffDays,
    daysSince: 0,
    yearKey: `${pet.id}_${upcoming.year}`,
    countdownText: getBirthdayCountdownText(pet.name, phase, upcoming.diffDays),
    isReviewPeriod: false,
    isTodayBirthday: false,
    isCountdown: phase === 'countdown',
    nextBirthdayDate: upcoming.date,
  };
}

export function getAllPetBirthdayStatuses(
  state: GameState,
  now: Date = new Date()
): PetBirthdayStatus[] {
  return state.pets.map((pet) => getBirthdayStatusForPet(pet, now));
}

export function getPrimaryBirthdayPetStatus(
  state: GameState,
  now: Date = new Date()
): PetBirthdayStatus {
  const statuses = getAllPetBirthdayStatuses(state, now);
  const todayBday = statuses.find((s) => s.phase === 'birthday');
  if (todayBday) return todayBday;

  const countdowns = statuses
    .filter((s) => s.phase === 'countdown')
    .sort((a, b) => a.daysUntil - b.daysUntil);
  if (countdowns.length > 0) return countdowns[0];

  const reviews = statuses
    .filter((s) => s.phase === 'review')
    .sort((a, b) => a.daysSince - b.daysSince);
  if (reviews.length > 0) return reviews[0];

  return (
    statuses.find((s) => s.petId === state.activePetId) ??
    statuses[0] ??
    getBirthdayStatusForPet(getActivePet(state), now)
  );
}

export function buildDailyBirthdayOrders(dateKey: string): BirthdayOrder[] {
  return BIRTHDAY_ORDER_TEMPLATES.map((tpl, idx) => ({
    id: `border_${dateKey}_${tpl.kind}_${idx}`,
    dateKey,
    kind: tpl.kind,
    title: tpl.title,
    description: tpl.description,
    emoji: tpl.emoji,
    progress: 0,
    target: tpl.target,
    completed: false,
    claimed: false,
    rewardTickets: tpl.rewardTickets,
    rewardCoins: tpl.rewardCoins,
  }));
}

export function createInitialBirthdaySystemState(
  now: Date = new Date()
): BirthdaySystemState {
  const dateKey = getLocalDateString(now);
  return {
    tickets: {
      balance: 0,
      totalEarned: 0,
    },
    pantry: {
      cream: 1,
      sugar: 1,
      iceCream: 0,
    },
    cakes: [],
    reservedCakeByPetId: {},
    unlockedLimitedCakeRecipe: false,
    ownedGiftIds: [],
    giftBoxesOpenedCount: 0,
    ownedRoomDecorIds: [],
    activeRoomDecorIds: [],
    ownedYardDecorIds: [],
    activeYardDecorIds: [],
    placedCakeId: null,
    cards: [],
    dailyDate: dateKey,
    dailyLoginTicketDate: null,
    birthdayDayLoginAwardedKeys: [],
    tasks: buildDailyBirthdayTasks(dateKey),
    orders: buildDailyBirthdayOrders(dateKey),
    purchasedShopItemIds: [],
    unlockedBirthdayStudioKeys: [],
    birthdayPhotosByYearKey: {},
    celebratedYearKeys: [],
    lastCountdownToastKey: null,
  };
}

export function getBirthdaySystemState(
  state: GameState,
  now: Date = new Date()
): BirthdaySystemState {
  return state.birthdaySystem ?? createInitialBirthdaySystemState(now);
}

function ensureDailyBirthdayTasksAndOrders(
  sys: BirthdaySystemState,
  now: Date = new Date()
): { sys: BirthdaySystemState; changed: boolean } {
  const todayKey = getLocalDateString(now);
  const dateChanged = sys.dailyDate !== todayKey;

  const templateTasks = buildDailyBirthdayTasks(todayKey);
  const templateTaskIds = new Set(templateTasks.map((t) => t.id));
  const tasksNeedRebuild =
    dateChanged ||
    sys.tasks.length !== templateTasks.length ||
    sys.tasks.some((t) => !templateTaskIds.has(t.id));

  let nextTasks = sys.tasks;
  if (tasksNeedRebuild) {
    if (dateChanged) {
      nextTasks = templateTasks;
    } else {
      const existingById = new Map(sys.tasks.map((t) => [t.id, t]));
      nextTasks = templateTasks.map((tpl) => existingById.get(tpl.id) ?? tpl);
    }
  }

  const templateOrders = buildDailyBirthdayOrders(todayKey);
  const templateOrderIds = new Set(templateOrders.map((o) => o.id));
  const ordersNeedRebuild =
    dateChanged ||
    sys.orders.length !== templateOrders.length ||
    sys.orders.some((o) => o.dateKey !== todayKey || !templateOrderIds.has(o.id));

  let nextOrders = sys.orders;
  if (ordersNeedRebuild) {
    if (dateChanged) {
      nextOrders = templateOrders;
    } else {
      const existingById = new Map(sys.orders.map((o) => [o.id, o]));
      nextOrders = templateOrders.map((tpl) => existingById.get(tpl.id) ?? tpl);
    }
  }

  if (!dateChanged && !tasksNeedRebuild && !ordersNeedRebuild) {
    return { sys, changed: false };
  }

  return {
    sys: {
      ...sys,
      dailyDate: todayKey,
      tasks: nextTasks,
      orders: nextOrders,
    },
    changed: true,
  };
}

function advanceBirthdayTasksAndOrders(
  sys: BirthdaySystemState,
  opts: {
    taskKind?: BirthdayTaskKind;
    orderKind?: BirthdayOrder['kind'];
    amount?: number;
  },
  now: Date = new Date()
): BirthdaySystemState {
  const { sys: syncedSys } = ensureDailyBirthdayTasksAndOrders(sys, now);
  const amt = opts.amount ?? 1;
  const tasks = opts.taskKind
    ? syncedSys.tasks.map((t) => {
        if (t.kind !== opts.taskKind || t.completed) return t;
        const nextProgress = Math.min(t.target, t.progress + amt);
        return {
          ...t,
          progress: nextProgress,
          completed: nextProgress >= t.target,
        };
      })
    : syncedSys.tasks;

  const orders = opts.orderKind
    ? syncedSys.orders.map((o) => {
        if (o.kind !== opts.orderKind || o.completed) return o;
        const nextProgress = Math.min(o.target, o.progress + amt);
        return {
          ...o,
          progress: nextProgress,
          completed: nextProgress >= o.target,
        };
      })
    : syncedSys.orders;

  return {
    ...syncedSys,
    tasks,
    orders,
  };
}

export function syncBirthdaySystemState(
  state: GameState,
  now: Date = new Date()
): GameState {
  const todayKey = getLocalDateString(now);
  const hadBirthdaySystem = Boolean(state.birthdaySystem);
  const rawCurrent = getBirthdaySystemState(state, now);
  const { sys: current, changed: dailyRolledOrNormalized } =
    ensureDailyBirthdayTasksAndOrders(rawCurrent, now);

  let ticketsChanged = false;
  let nextTickets = current.tickets;
  let loginChanged = false;
  let nextDailyLoginDate = current.dailyLoginTicketDate;

  if (nextDailyLoginDate !== todayKey) {
    nextDailyLoginDate = todayKey;
    loginChanged = true;
    nextTickets = {
      balance: nextTickets.balance + 1,
      totalEarned: nextTickets.totalEarned + 1,
    };
    ticketsChanged = true;
  }

  let bdayAwardedChanged = false;
  const nextBdayAwardedKeys = [...current.birthdayDayLoginAwardedKeys];
  let celebratedChanged = false;
  const nextCelebratedKeys = [...current.celebratedYearKeys];
  const nextUnlockedStudioKeys = new Set(current.unlockedBirthdayStudioKeys);
  const initialUnlockedKeyCount = nextUnlockedStudioKeys.size;

  const statuses = getAllPetBirthdayStatuses(state, now);
  const anyBirthdayToday = statuses.some((s) => s.phase === 'birthday');
  const memoriesToAdd: Array<{
    uniqueKey: string;
    petId: string;
    title: string;
    description: string;
    emoji: string;
  }> = [];

  for (const status of statuses) {
    if (status.phase === 'countdown') {
      memoriesToAdd.push({
        uniqueKey: `bday_countdown_${status.yearKey}`,
        petId: status.petId,
        title: `${status.petName}的生日倒數開始囉！`,
        description: `距離 ${status.dateLabel} 還有 ${status.daysUntil} 天，可以一起準備生日蛋糕、禮物和派對佈置！`,
        emoji: '🗓️',
      });
    } else if (status.phase === 'birthday') {
      if (!nextBdayAwardedKeys.includes(status.yearKey)) {
        nextBdayAwardedKeys.push(status.yearKey);
        bdayAwardedChanged = true;
        nextTickets = {
          balance: nextTickets.balance + 10,
          totalEarned: nextTickets.totalEarned + 10,
        };
        ticketsChanged = true;
      }
      if (!nextCelebratedKeys.includes(status.yearKey)) {
        nextCelebratedKeys.push(status.yearKey);
        celebratedChanged = true;
      }
      memoriesToAdd.push({
        uniqueKey: `bday_day_${status.yearKey}`,
        petId: status.petId,
        title: `今天是${status.petName}的生日！🎂`,
        description: `壽星${status.petName}迎來 ${status.dateLabel} 生日派對，快去點蠟燭、拆禮物與拍照留念！`,
        emoji: '🎂',
      });
    } else if (status.phase === 'review') {
      memoriesToAdd.push({
        uniqueKey: `bday_review_${status.yearKey}`,
        petId: status.petId,
        title: `${status.petName}的生日回憶已保存`,
        description: `雖然 ${status.dateLabel} 的派對熱鬧落幕了，所有蛋糕、合照與賀卡祝福都會永久保存在回憶冊中！`,
        emoji: '🎞️',
      });
    }
  }

  // Unlock birthday-day studio poses, default backgrounds, filters, frames & stickers when a pet celebrates today
  let nextStudio = state.photoStudio ?? createInitialPhotoStudioState(now);
  let studioChanged = false;
  if (anyBirthdayToday) {
    const poses = new Set<PhotoPose>(nextStudio.unlockedPoses);
    const bgs = new Set<PhotoBackground>(nextStudio.unlockedBackgrounds);
    const filters = new Set<PhotoFilter>(nextStudio.unlockedFilters);
    const frames = new Set<PhotoFrame>(nextStudio.unlockedFrames);
    const stickers = new Set<PhotoStickerId>(nextStudio.unlockedStickers);

    BIRTHDAY_DEFAULT_STUDIO_POSES.forEach((p) => {
      if (!poses.has(p)) {
        poses.add(p);
        studioChanged = true;
      }
      nextUnlockedStudioKeys.add(`pose:${p}`);
    });
    BIRTHDAY_DEFAULT_STUDIO_BACKGROUNDS.forEach((b) => {
      if (!bgs.has(b)) {
        bgs.add(b);
        studioChanged = true;
      }
      nextUnlockedStudioKeys.add(`bg:${b}`);
    });
    BIRTHDAY_DEFAULT_STUDIO_FILTERS.forEach((f) => {
      if (!filters.has(f)) {
        filters.add(f);
        studioChanged = true;
      }
      nextUnlockedStudioKeys.add(`filter:${f}`);
    });
    BIRTHDAY_DEFAULT_STUDIO_FRAMES.forEach((fr) => {
      if (!frames.has(fr)) {
        frames.add(fr);
        studioChanged = true;
      }
      nextUnlockedStudioKeys.add(`frame:${fr}`);
    });
    BIRTHDAY_DEFAULT_STUDIO_STICKERS.forEach((st) => {
      if (!stickers.has(st)) {
        stickers.add(st);
        studioChanged = true;
      }
      nextUnlockedStudioKeys.add(`sticker:${st}`);
    });

    if (studioChanged) {
      nextStudio = {
        ...nextStudio,
        unlockedPoses: Array.from(poses),
        unlockedBackgrounds: Array.from(bgs),
        unlockedFilters: Array.from(filters),
        unlockedFrames: Array.from(frames),
        unlockedStickers: Array.from(stickers),
      };
    }
  }

  const studioKeysChanged = nextUnlockedStudioKeys.size !== initialUnlockedKeyCount;
  const sysChanged =
    !hadBirthdaySystem ||
    dailyRolledOrNormalized ||
    ticketsChanged ||
    loginChanged ||
    bdayAwardedChanged ||
    celebratedChanged ||
    studioKeysChanged;

  const existingUniqueKeys = new Set(
    state.memoryAlbum.memories
      .map((m) => m.uniqueKey)
      .filter((k): k is string => Boolean(k))
  );
  const pendingMemories = memoriesToAdd.filter((m) => !existingUniqueKeys.has(m.uniqueKey));

  if (!sysChanged && !studioChanged && pendingMemories.length === 0) {
    return state;
  }

  const nextSys: BirthdaySystemState = sysChanged
    ? {
        ...current,
        tickets: nextTickets,
        dailyLoginTicketDate: nextDailyLoginDate,
        birthdayDayLoginAwardedKeys: bdayAwardedChanged
          ? nextBdayAwardedKeys
          : current.birthdayDayLoginAwardedKeys,
        unlockedBirthdayStudioKeys: studioKeysChanged
          ? Array.from(nextUnlockedStudioKeys)
          : current.unlockedBirthdayStudioKeys,
        celebratedYearKeys: celebratedChanged
          ? nextCelebratedKeys
          : current.celebratedYearKeys,
      }
    : current;

  let nextState: GameState = {
    ...state,
    birthdaySystem: nextSys,
    photoStudio: studioChanged ? nextStudio : state.photoStudio,
  };

  for (const mem of pendingMemories) {
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: mem.uniqueKey,
      petId: mem.petId,
      type: 'birthday',
      title: mem.title,
      description: mem.description,
      emoji: mem.emoji,
      dateKey: todayKey,
    });
  }

  return nextState;
}

export function updatePetBirthday(
  state: GameState,
  petId: string,
  month: number,
  day: number,
  leapYearChoice: BirthdayLeapChoice
): BirthdayActionResult {
  const targetPet = state.pets.find((p) => p.id === petId);
  if (!targetPet) {
    return { nextState: state, ok: false, notice: '', error: '找不到這隻毛孩喔！' };
  }
  const clamped = clampBirthdayDay(month, day);
  const nextConfig: BirthdayConfig = {
    month: clamped.month,
    day: clamped.day,
    leapYearChoice,
    updatedAt: Date.now(),
    customized: true,
  };

  let nextState = updatePetById(state, petId, (pet) => ({
    ...pet,
    birthday: nextConfig,
  }));

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `bday_first_set_${petId}`,
    petId,
    type: 'birthday',
    title: `為${targetPet.name}設定了專屬生日！`,
    description: `以後每年的 ${formatBirthdayDateLabel(nextConfig)} 都是${targetPet.name}的暖心派對日！`,
    emoji: '📅',
  });

  nextState = syncBirthdaySystemState(nextState);

  return {
    nextState,
    ok: true,
    notice: `已將${targetPet.name}的生日設定為 ${formatBirthdayDateLabel(nextConfig)}！`,
  };
}

export function buyBirthdayPantryItem(
  state: GameState,
  itemId: keyof BirthdayPantryState,
  qty = 1
): BirthdayActionResult {
  const def = BIRTHDAY_PANTRY_SHOP.find((item) => item.id === itemId);
  if (!def) {
    return { nextState: state, ok: false, notice: '', error: '找不到這個烘焙材料' };
  }
  const safeQty = Math.max(1, Math.floor(qty));
  const totalCost = def.priceCoins * safeQty;
  if (state.coins < totalCost) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: `金幣不足！購買 ${safeQty} 份${def.name}需要 ${totalCost} 金幣。`,
    };
  }
  const sys = getBirthdaySystemState(state);
  const nextState: GameState = {
    ...state,
    coins: state.coins - totalCost,
    birthdaySystem: {
      ...sys,
      pantry: {
        ...sys.pantry,
        [itemId]: (sys.pantry[itemId] ?? 0) + safeQty,
      },
    },
  };
  return {
    nextState,
    ok: true,
    notice: `購入 ${def.emoji} ${def.name} ×${safeQty}，已放進蛋糕烘焙材料櫃！`,
  };
}

export function reserveBirthdayCake(
  state: GameState,
  petId: string,
  cakeId: BirthdayCakeId
): BirthdayActionResult {
  const cakeDef = BIRTHDAY_CAKE_BY_ID[cakeId];
  if (!cakeDef) {
    return { nextState: state, ok: false, notice: '', error: '找不到此蛋糕食譜' };
  }
  const pet = state.pets.find((p) => p.id === petId) ?? getActivePet(state);
  const sys = getBirthdaySystemState(state);
  const nextState: GameState = {
    ...state,
    birthdaySystem: {
      ...sys,
      reservedCakeByPetId: {
        ...sys.reservedCakeByPetId,
        [pet.id]: cakeId,
      },
    },
  };
  return {
    nextState,
    ok: true,
    notice: `已為${pet.name}預約「${cakeDef.emoji} ${cakeDef.name}」派對主蛋糕！`,
  };
}

export function bakeBirthdayCake(
  state: GameState,
  params: {
    cakeTypeId: BirthdayCakeId | 'custom';
    petId: string;
    base: BirthdayCakeBase;
    cream: BirthdayCakeCream;
    decors: BirthdayCakeDecor[];
    plaqueText: string;
    fruitIngredientId?: IngredientId;
  }
): BirthdayActionResult {
  const sys = getBirthdaySystemState(state);
  const pet = state.pets.find((p) => p.id === params.petId) ?? getActivePet(state);

  if (params.cakeTypeId === 'birthday_limited_cake' && !sys.unlockedLimitedCakeRecipe) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: '「生日限定蛋糕」食譜需先於生日券商店（80 張生日券）解鎖！',
    };
  }

  const nextIngredients = { ...state.ingredients };
  const nextPantry = { ...sys.pantry };

  let cakeName = '客製手工生日蛋糕';
  let cakeEmoji = '🎂';
  let moodBonus = 20;
  let intimacyBonus = 5;
  let pantryCost = {
    cream: 1,
    sugar: 1,
    iceCream: params.base === 'ice_cream' ? 1 : 0,
  };
  const ingredientCost: Partial<Record<IngredientId, number>> = {};

  if (params.cakeTypeId !== 'custom') {
    const def = BIRTHDAY_CAKE_BY_ID[params.cakeTypeId];
    cakeName = def.name;
    cakeEmoji = def.emoji;
    moodBonus = def.moodBonus;
    intimacyBonus = def.intimacyBonus;
    pantryCost = { ...def.pantryCost };

    if (def.requiresFruitChoice) {
      const fruitId =
        params.fruitIngredientId && FRUIT_CAKE_INGREDIENT_IDS.includes(params.fruitIngredientId)
          ? params.fruitIngredientId
          : FRUIT_CAKE_INGREDIENT_IDS.find((id) => (nextIngredients[id] ?? 0) >= 2) ??
            'apple';
      ingredientCost[fruitId] = 2;
    } else {
      for (const [id, qty] of Object.entries(def.recipeIngredients) as [IngredientId, number][]) {
        if (qty > 0) ingredientCost[id] = qty;
      }
    }
  } else {
    if (params.base === 'chocolate') {
      ingredientCost.dream_cocoa = 1;
    } else if (params.base === 'carrot') {
      ingredientCost.carrot = 1;
    } else if (params.cream === 'strawberry') {
      ingredientCost.strawberry = 1;
    }
  }

  for (const [ingId, need] of Object.entries(ingredientCost) as [IngredientId, number][]) {
    const have = nextIngredients[ingId] ?? 0;
    if (have < need) {
      const ingName = INGREDIENTS[ingId]?.name ?? ingId;
      return {
        nextState: state,
        ok: false,
        notice: '',
        error: `農場食材「${ingName}」不足（需要 ${need} 份，目前 ${have} 份）！`,
      };
    }
    nextIngredients[ingId] = have - need;
  }

  if (nextPantry.cream < pantryCost.cream) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: `烘焙材料「鮮奶油」不足（需要 ${pantryCost.cream} 份），可在下方材料區購買！`,
    };
  }
  if (nextPantry.sugar < pantryCost.sugar) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: `烘焙材料「細砂糖」不足（需要 ${pantryCost.sugar} 份），可在下方材料區購買！`,
    };
  }
  if (nextPantry.iceCream < pantryCost.iceCream) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: `烘焙材料「香草冰淇淋磚」不足（需要 ${pantryCost.iceCream} 份），可在下方材料區購買！`,
    };
  }

  nextPantry.cream -= pantryCost.cream;
  nextPantry.sugar -= pantryCost.sugar;
  nextPantry.iceCream -= pantryCost.iceCream;

  const cleanPlaque =
    params.plaqueText.trim().slice(0, 18) || `${pet.name}生日快樂！`;
  const cleanDecors: BirthdayCakeDecor[] =
    params.decors.length > 0 ? params.decors.slice(0, 5) : ['candle'];

  const newCake: BirthdayCake = {
    id: `bcake_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    cakeTypeId: params.cakeTypeId,
    name: cakeName,
    emoji: cakeEmoji,
    base: params.base,
    cream: params.cream,
    decors: cleanDecors,
    plaqueText: cleanPlaque,
    moodBonus,
    intimacyBonus,
    petId: pet.id,
    createdAt: Date.now(),
    placedIn: null,
    eaten: false,
  };

  let nextFoods = { ...state.foods };
  let nextCollectedFoodIds = state.encyclopedia.collectedFoodIds;
  if (params.cakeTypeId !== 'custom') {
    nextFoods = {
      ...nextFoods,
      [params.cakeTypeId]: (nextFoods[params.cakeTypeId] ?? 0) + 1,
    };
    if (!nextCollectedFoodIds.includes(params.cakeTypeId)) {
      nextCollectedFoodIds = [...nextCollectedFoodIds, params.cakeTypeId];
    }
  }

  let nextSys: BirthdaySystemState = {
    ...sys,
    pantry: nextPantry,
    cakes: [newCake, ...sys.cakes].slice(0, 24),
  };
  nextSys = advanceBirthdayTasksAndOrders(nextSys, {
    taskKind: 'prep_cake',
    orderKind: 'cake',
    amount: 1,
  });

  let nextState: GameState = {
    ...state,
    ingredients: nextIngredients,
    foods: nextFoods,
    encyclopedia: {
      ...state.encyclopedia,
      collectedFoodIds: nextCollectedFoodIds,
    },
    birthdaySystem: nextSys,
  };

  const todayKey = getLocalDateString();
  nextState = recordMonthlyActivity(nextState, { interactionLabel: '製作生日蛋糕' });
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `bday_cake_${pet.id}_${todayKey}`,
    petId: pet.id,
    type: 'birthday',
    title: `完成生日蛋糕：「${cakeName}」`,
    description: `親手寫上「${cleanPlaque}」送給${pet.name}！（可擺進小屋／庭院或切開享用）`,
    emoji: cakeEmoji,
    foodId: params.cakeTypeId !== 'custom' ? params.cakeTypeId : undefined,
    dateKey: todayKey,
  });

  return {
    nextState,
    ok: true,
    notice: `🎂 烘焙完成「${cakeName}」！可擺進房間／庭院展示，或直接與${pet.name}一起吃蛋糕！`,
  };
}

export function placeBirthdayCake(
  state: GameState,
  cakeId: string,
  target: 'room' | 'yard' | null
): BirthdayActionResult {
  const sys = getBirthdaySystemState(state);
  const cake = sys.cakes.find((c) => c.id === cakeId && !c.eaten);
  if (!cake) {
    return { nextState: state, ok: false, notice: '', error: '找不到這個蛋糕或已經吃完了喔！' };
  }

  const nextCakes = sys.cakes.map((c) => {
    if (c.id === cakeId) return { ...c, placedIn: target };
    if (target !== null && c.placedIn === target) return { ...c, placedIn: null };
    return c;
  });

  const nextPlacedId = target !== null ? cakeId : sys.placedCakeId === cakeId ? null : sys.placedCakeId;

  const hasTableBonus =
    (target === 'room' && sys.activeRoomDecorIds.includes('room_cake_table')) ||
    (target === 'yard' && sys.activeYardDecorIds.includes('yard_cake_table'));
  const wasNeverPlaced = cake.placedIn === null;

  let nextState: GameState = {
    ...state,
    birthdaySystem: {
      ...sys,
      cakes: nextCakes,
      placedCakeId: nextPlacedId,
    },
  };

  let extraMsg = '';
  if (target !== null && hasTableBonus && wasNeverPlaced) {
    nextState = updatePetById(nextState, cake.petId, (pet) => ({
      ...pet,
      mood: Math.min(100, pet.mood + 15),
    }));
    extraMsg = '（生日蛋糕桌加成：壽星心情 +15！）';
  }

  return {
    nextState,
    ok: true,
    notice:
      target === 'room'
        ? `已將「${cake.name}」擺放到小屋房間派對桌！${extraMsg}`
        : target === 'yard'
        ? `已將「${cake.name}」擺放到庭院派對桌！${extraMsg}`
        : `已將「${cake.name}」收進蛋糕盒保存。`,
  };
}

export function celebrateEatBirthdayCake(
  state: GameState,
  cakeId: string,
  petId?: string
): BirthdayActionResult {
  const sys = getBirthdaySystemState(state);
  const cake = sys.cakes.find((c) => c.id === cakeId && !c.eaten);
  if (!cake) {
    return { nextState: state, ok: false, notice: '', error: '找不到這個蛋糕或已經吃完囉！' };
  }
  const targetPet =
    (petId ? state.pets.find((p) => p.id === petId) : state.pets.find((p) => p.id === cake.petId)) ??
    getActivePet(state);

  const def = cake.cakeTypeId !== 'custom' ? BIRTHDAY_CAKE_BY_ID[cake.cakeTypeId] : null;
  const hungerGain = def?.hungerBonus ?? 22;
  const growthGain = def?.growthBonus ?? 24;
  const weightGain = def?.weightGain ?? 0.2;
  const roundnessGain = def?.roundnessBonus ?? 4;

  const tableBonus =
    (cake.placedIn === 'room' && sys.activeRoomDecorIds.includes('room_cake_table')) ||
    (cake.placedIn === 'yard' && sys.activeYardDecorIds.includes('yard_cake_table'))
      ? 15
      : 0;
  const totalMoodGain = cake.moodBonus + tableBonus;

  let nextState = updatePetById(state, targetPet.id, (pet) => {
    const nextGrowth = pet.growth + growthGain;
    return {
      ...pet,
      hunger: Math.min(100, pet.hunger + hungerGain),
      mood: Math.min(100, pet.mood + totalMoodGain),
      intimacy: pet.intimacy + cake.intimacyBonus,
      growth: nextGrowth,
      level: getGrowthStage(nextGrowth).level,
      weight: Math.round((pet.weight + weightGain) * 10) / 10,
      roundness: Math.min(100, pet.roundness + roundnessGain),
    };
  });

  const nextFoods = { ...nextState.foods };
  if (cake.cakeTypeId !== 'custom' && (nextFoods[cake.cakeTypeId] ?? 0) > 0) {
    nextFoods[cake.cakeTypeId] = nextFoods[cake.cakeTypeId] - 1;
  }

  const nowTs = Date.now();
  const todayKey = getLocalDateString();
  const newLog = {
    id: `flog_bday_${nowTs}`,
    petId: targetPet.id,
    foodId: cake.cakeTypeId !== 'custom' ? cake.cakeTypeId : 'custom_birthday_cake',
    foodName: cake.name,
    emoji: cake.emoji,
    date: todayKey,
    timestamp: nowTs,
    weightAfter: Math.round((targetPet.weight + weightGain) * 10) / 10,
    weightChange: weightGain,
    hungerGain,
    moodGain: totalMoodGain,
    isFastFood: false,
  };

  nextState = {
    ...nextState,
    foods: nextFoods,
    feedLogs: [...nextState.feedLogs, newLog].slice(-80),
    birthdaySystem: {
      ...sys,
      cakes: sys.cakes.map((c) =>
        c.id === cakeId ? { ...c, eaten: true, placedIn: null } : c
      ),
      placedCakeId: sys.placedCakeId === cakeId ? null : sys.placedCakeId,
    },
  };

  nextState = recordMonthlyActivity(nextState, {
    foodId: cake.cakeTypeId !== 'custom' ? cake.cakeTypeId : undefined,
    interactionLabel: '享用生日蛋糕',
    growthDelta: growthGain,
  });
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `bday_eat_${cakeId}`,
    petId: targetPet.id,
    type: 'birthday',
    title: `和${targetPet.name}切開「${cake.name}」慶生！`,
    description: `「${cake.plaqueText}」—— 心情 +${totalMoodGain}、親密度 +${cake.intimacyBonus}！`,
    emoji: '🎂',
    dateKey: todayKey,
  });

  return {
    nextState,
    ok: true,
    notice: `🎂 ${targetPet.name}開心地品嚐「${cake.name}」！心情 +${totalMoodGain}、親密度 +${cake.intimacyBonus}${tableBonus > 0 ? '（含蛋糕桌 +15 加成）' : ''}！`,
  };
}

function applySurpriseBoxReward(state: GameState): {
  nextState: GameState;
  rewardText: string;
} {
  const sys = getBirthdaySystemState(state);
  const roll = sys.giftBoxesOpenedCount % 3;
  if (roll === 0) {
    return {
      nextState: {
        ...state,
        ingredients: {
          ...state.ingredients,
          strawberry: (state.ingredients.strawberry ?? 0) + 3,
          dream_cocoa: (state.ingredients.dream_cocoa ?? 0) + 2,
        },
        birthdaySystem: {
          ...sys,
          giftBoxesOpenedCount: sys.giftBoxesOpenedCount + 1,
        },
      },
      rewardText: '開出稀有食材「草莓 ×3 + 晚安可可 ×2」',
    };
  }
  if (roll === 1) {
    return {
      nextState: {
        ...state,
        furnitureShards: state.furnitureShards + 5,
        birthdaySystem: {
          ...sys,
          giftBoxesOpenedCount: sys.giftBoxesOpenedCount + 1,
        },
      },
      rewardText: '開出「家具碎片 ×5」',
    };
  }
  return {
    nextState: {
      ...state,
      ingredients: {
        ...state.ingredients,
        snowberry: (state.ingredients.snowberry ?? 0) + 2,
        moon_wheat: (state.ingredients.moon_wheat ?? 0) + 2,
      },
      furnitureShards: state.furnitureShards + 3,
      birthdaySystem: {
        ...sys,
        giftBoxesOpenedCount: sys.giftBoxesOpenedCount + 1,
      },
    },
    rewardText: '開出「雪莓 ×2 + 月見小麥 ×2 + 家具碎片 ×3」',
  };
}

export function buyBirthdayGift(
  state: GameState,
  giftId: BirthdayGiftId,
  petId?: string
): BirthdayActionResult {
  const gift = BIRTHDAY_GIFT_BY_ID[giftId];
  if (!gift) {
    return { nextState: state, ok: false, notice: '', error: '找不到這份生日禮物' };
  }
  const sys = getBirthdaySystemState(state);
  const targetPet = (petId ? state.pets.find((p) => p.id === petId) : null) ?? getActivePet(state);

  const isOwnedNonBox =
    gift.category !== 'box' &&
    (sys.ownedGiftIds.includes(giftId) ||
      (gift.category === 'accessory' && gift.targetId && state.accessories.includes(gift.targetId)) ||
      (gift.id === 'birthday_frame' &&
        (state.photoStudio?.unlockedFrames.includes('birthday_frame') ?? false)) ||
      (gift.id === 'birthday_bg' &&
        (state.photoStudio?.unlockedBackgrounds.includes('birthday_bg') ?? false)) ||
      (gift.id === 'birthday_balloons' && sys.ownedYardDecorIds.includes('yard_balloons')) ||
      (gift.id === 'birthday_streamers' && sys.ownedRoomDecorIds.includes('room_streamers')));

  if (isOwnedNonBox) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: `「${gift.name}」已經擁有囉！可直接幫${targetPet.name}穿戴或佈置。`,
    };
  }

  if (gift.currency === 'coins' && state.coins < gift.price) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: `金幣不足，贈送「${gift.name}」需要 ${gift.price} 金幣。`,
    };
  }
  if (gift.currency === 'birthday_tickets' && sys.tickets.balance < gift.price) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: `生日券不足，兌換「${gift.name}」需要 ${gift.price} 張生日券。`,
    };
  }

  let nextCoins = state.coins;
  let nextTickets = { ...sys.tickets };
  if (gift.currency === 'coins') {
    nextCoins -= gift.price;
  } else {
    nextTickets = {
      ...nextTickets,
      balance: nextTickets.balance - gift.price,
    };
  }

  let nextAccessories = [...state.accessories];
  const nextOwnedRoomDecors = [...sys.ownedRoomDecorIds];
  const nextActiveRoomDecors = [...sys.activeRoomDecorIds];
  const nextOwnedYardDecors = [...sys.ownedYardDecorIds];
  const nextActiveYardDecors = [...sys.activeYardDecorIds];
  let nextStudio = state.photoStudio ?? createInitialPhotoStudioState();
  const nextOwnedGiftIds = sys.ownedGiftIds.includes(giftId)
    ? sys.ownedGiftIds
    : [...sys.ownedGiftIds, giftId];

  let rewardDetail = `心情 +${gift.moodBonus}`;

  if (gift.category === 'accessory' && gift.targetId) {
    if (!nextAccessories.includes(gift.targetId)) {
      nextAccessories.push(gift.targetId);
    }
    const acc = getAccessoryById(gift.targetId);
    if (acc) {
      rewardDetail = `已存入衣櫥（${acc.name}）· 心情 +${gift.moodBonus}`;
    }
  } else if (gift.id === 'birthday_balloons') {
    if (!nextOwnedYardDecors.includes('yard_balloons')) nextOwnedYardDecors.push('yard_balloons');
    if (!nextActiveYardDecors.includes('yard_balloons')) nextActiveYardDecors.push('yard_balloons');
    rewardDetail = `已自動掛上庭院戶外氣球 · 心情 +${gift.moodBonus}`;
  } else if (gift.id === 'birthday_streamers') {
    if (!nextOwnedRoomDecors.includes('room_streamers')) nextOwnedRoomDecors.push('room_streamers');
    if (!nextActiveRoomDecors.includes('room_streamers')) nextActiveRoomDecors.push('room_streamers');
    rewardDetail = `已自動掛上房間繽紛彩帶 · 心情 +${gift.moodBonus}`;
  } else if (gift.id === 'birthday_frame') {
    if (!nextStudio.unlockedFrames.includes('birthday_frame')) {
      nextStudio = {
        ...nextStudio,
        unlockedFrames: [...nextStudio.unlockedFrames, 'birthday_frame'],
      };
    }
    rewardDetail = `已解鎖攝影棚「生日相框」· 心情 +${gift.moodBonus}`;
  } else if (gift.id === 'birthday_bg') {
    if (!nextStudio.unlockedBackgrounds.includes('birthday_bg')) {
      nextStudio = {
        ...nextStudio,
        unlockedBackgrounds: [...nextStudio.unlockedBackgrounds, 'birthday_bg'],
      };
    }
    rewardDetail = `已解鎖攝影棚「生日背景」· 心情 +${gift.moodBonus}`;
  }

  let nextSys = advanceBirthdayTasksAndOrders(
    {
      ...sys,
      tickets: nextTickets,
      ownedGiftIds: nextOwnedGiftIds,
      ownedRoomDecorIds: nextOwnedRoomDecors,
      activeRoomDecorIds: nextActiveRoomDecors,
      ownedYardDecorIds: nextOwnedYardDecors,
      activeYardDecorIds: nextActiveYardDecors,
    },
    { taskKind: 'birthday_gift', orderKind: 'gift', amount: 1 }
  );

  let nextState: GameState = updatePetById(
    {
      ...state,
      coins: nextCoins,
      accessories: nextAccessories,
      photoStudio: nextStudio,
      birthdaySystem: nextSys,
    },
    targetPet.id,
    (pet) => ({
      ...pet,
      mood: Math.min(100, pet.mood + gift.moodBonus),
    })
  );

  if (gift.category === 'box') {
    const boxRes = applySurpriseBoxReward(nextState);
    nextState = boxRes.nextState;
    rewardDetail = `${boxRes.rewardText} · 心情 +${gift.moodBonus}`;
  }

  const todayKey = getLocalDateString();
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `bday_gift_${giftId}_${targetPet.id}_${todayKey}`,
    petId: targetPet.id,
    type: 'birthday',
    title: `收到生日禮物：「${gift.name}」`,
    description: `${targetPet.name}開心地收下了「${gift.name}」（${rewardDetail}）`,
    emoji: gift.emoji,
    dateKey: todayKey,
  });

  return {
    nextState,
    ok: true,
    notice: `${gift.emoji} 已送給${targetPet.name}「${gift.name}」！${rewardDetail}`,
  };
}

export function isBirthdayTicketShopItemOwned(
  state: GameState,
  itemId: string
): boolean {
  const item = BIRTHDAY_TICKET_SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item || item.category === 'box') return false;
  const sys = getBirthdaySystemState(state);
  if (sys.purchasedShopItemIds.includes(itemId)) return true;

  switch (item.category) {
    case 'accessory':
      return state.accessories.includes(item.targetId);
    case 'cake_recipe':
      return sys.unlockedLimitedCakeRecipe;
    case 'frame':
      return state.photoStudio?.unlockedFrames.includes(item.targetId as PhotoFrame) ?? false;
    case 'background':
      return (
        state.photoStudio?.unlockedBackgrounds.includes(item.targetId as PhotoBackground) ?? false
      );
    case 'furniture':
      return (
        state.house.collectedFurnitureIds.includes(item.targetId) ||
        (state.house.ownedFurnitureCounts[item.targetId] ?? 0) > 0
      );
    case 'title':
      return state.encyclopedia.unlockedTitles.includes(item.targetId as 'birthday_superstar');
    default:
      return false;
  }
}

export function buyBirthdayTicketShopItem(
  state: GameState,
  itemId: string,
  petId?: string
): BirthdayActionResult {
  const item = BIRTHDAY_TICKET_SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) {
    return { nextState: state, ok: false, notice: '', error: '找不到此商店品項' };
  }
  if (isBirthdayTicketShopItemOwned(state, itemId)) {
    return { nextState: state, ok: false, notice: '', error: `「${item.name}」已擁有囉！` };
  }

  const sys = getBirthdaySystemState(state);
  if (sys.tickets.balance < item.ticketPrice) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: `生日券不足！兌換「${item.name}」需要 ${item.ticketPrice} 張生日券。`,
    };
  }

  let nextAccessories = [...state.accessories];
  let nextStudio = state.photoStudio ?? createInitialPhotoStudioState();
  let nextHouse = state.house;
  let nextEncyclopedia = state.encyclopedia;
  let nextLimitedCake = sys.unlockedLimitedCakeRecipe;
  const nextPurchased =
    item.category === 'box'
      ? sys.purchasedShopItemIds
      : Array.from(new Set([...sys.purchasedShopItemIds, item.id]));

  if (item.category === 'accessory') {
    if (!nextAccessories.includes(item.targetId)) nextAccessories.push(item.targetId);
  } else if (item.category === 'cake_recipe') {
    nextLimitedCake = true;
  } else if (item.category === 'frame') {
    const fId = item.targetId as PhotoFrame;
    if (!nextStudio.unlockedFrames.includes(fId)) {
      nextStudio = { ...nextStudio, unlockedFrames: [...nextStudio.unlockedFrames, fId] };
    }
  } else if (item.category === 'background') {
    const bId = item.targetId as PhotoBackground;
    if (!nextStudio.unlockedBackgrounds.includes(bId)) {
      nextStudio = {
        ...nextStudio,
        unlockedBackgrounds: [...nextStudio.unlockedBackgrounds, bId],
      };
    }
  } else if (item.category === 'furniture') {
    const furnId = item.targetId;
    if (ROOM_ITEM_BY_ID[furnId]) {
      nextHouse = {
        ...nextHouse,
        ownedFurnitureCounts: {
          ...nextHouse.ownedFurnitureCounts,
          [furnId]: (nextHouse.ownedFurnitureCounts[furnId] ?? 0) + 1,
        },
        collectedFurnitureIds: nextHouse.collectedFurnitureIds.includes(furnId)
          ? nextHouse.collectedFurnitureIds
          : [...nextHouse.collectedFurnitureIds, furnId],
      };
    }
  } else if (item.category === 'title') {
    if (!nextEncyclopedia.unlockedTitles.includes('birthday_superstar')) {
      nextEncyclopedia = {
        ...nextEncyclopedia,
        unlockedTitles: [...nextEncyclopedia.unlockedTitles, 'birthday_superstar'],
        activeTitle: nextEncyclopedia.activeTitle ?? 'birthday_superstar',
      };
    }
  }

  let nextState: GameState = {
    ...state,
    accessories: nextAccessories,
    photoStudio: nextStudio,
    house: nextHouse,
    encyclopedia: nextEncyclopedia,
    birthdaySystem: {
      ...sys,
      tickets: {
        ...sys.tickets,
        balance: sys.tickets.balance - item.ticketPrice,
      },
      unlockedLimitedCakeRecipe: nextLimitedCake,
      purchasedShopItemIds: nextPurchased,
    },
  };

  let boxDetail = '';
  if (item.category === 'box') {
    const res = applySurpriseBoxReward(nextState);
    nextState = res.nextState;
    boxDetail = `：${res.rewardText}`;
    const targetPet = (petId ? nextState.pets.find((p) => p.id === petId) : null) ?? getActivePet(nextState);
    nextState = updatePetById(nextState, targetPet.id, (p) => ({
      ...p,
      mood: Math.min(100, p.mood + 12),
    }));
  }

  return {
    nextState,
    ok: true,
    notice: `🎫 成功兌換「${item.emoji} ${item.name}」${boxDetail}！`,
  };
}

export function buyBirthdayDecoration(
  state: GameState,
  decorId: BirthdayDecorationId
): BirthdayActionResult {
  const decor = BIRTHDAY_DECORATION_BY_ID[decorId];
  if (!decor) {
    return { nextState: state, ok: false, notice: '', error: '找不到此派對佈置品項' };
  }
  const sys = getBirthdaySystemState(state);
  const ownedList =
    decor.target === 'room' ? sys.ownedRoomDecorIds : sys.ownedYardDecorIds;
  if (ownedList.includes(decorId)) {
    return toggleBirthdayDecoration(state, decorId);
  }
  if (state.coins < decor.priceCoins) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: `金幣不足！購買「${decor.name}」需要 ${decor.priceCoins} 金幣。`,
    };
  }

  const nextOwnedRoom =
    decor.target === 'room' ? [...sys.ownedRoomDecorIds, decorId] : sys.ownedRoomDecorIds;
  const nextActiveRoom =
    decor.target === 'room' && !sys.activeRoomDecorIds.includes(decorId)
      ? [...sys.activeRoomDecorIds, decorId]
      : sys.activeRoomDecorIds;
  const nextOwnedYard =
    decor.target === 'yard' ? [...sys.ownedYardDecorIds, decorId] : sys.ownedYardDecorIds;
  const nextActiveYard =
    decor.target === 'yard' && !sys.activeYardDecorIds.includes(decorId)
      ? [...sys.activeYardDecorIds, decorId]
      : sys.activeYardDecorIds;

  const nextSys = advanceBirthdayTasksAndOrders(
    {
      ...sys,
      ownedRoomDecorIds: nextOwnedRoom,
      activeRoomDecorIds: nextActiveRoom,
      ownedYardDecorIds: nextOwnedYard,
      activeYardDecorIds: nextActiveYard,
    },
    { taskKind: 'prep_decor', amount: 1 }
  );

  const activePet = getActivePet(state);
  let nextState: GameState = updatePetById(
    {
      ...state,
      coins: state.coins - decor.priceCoins,
      birthdaySystem: nextSys,
    },
    activePet.id,
    (pet) => ({
      ...pet,
      mood: Math.min(100, pet.mood + decor.moodBonus),
    })
  );

  const todayKey = getLocalDateString();
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `bday_decor_${decor.target}_${todayKey}`,
    petId: activePet.id,
    type: 'birthday',
    title:
      decor.target === 'room'
        ? `為小屋換上生日派對佈置！`
        : `為庭院掛上生日派對裝飾！`,
    description: `購買並啟用了「${decor.name}」（可隨時自由切換，不影響原有家具擺設）`,
    emoji: decor.emoji,
    dateKey: todayKey,
  });

  return {
    nextState,
    ok: true,
    notice: `${decor.emoji} 已購買並開啟「${decor.name}」！${activePet.name}心情 +${decor.moodBonus}（不覆蓋原有擺設，隨時可開關）`,
  };
}

export function toggleBirthdayDecoration(
  state: GameState,
  decorId: BirthdayDecorationId
): BirthdayActionResult {
  const decor = BIRTHDAY_DECORATION_BY_ID[decorId];
  if (!decor) {
    return { nextState: state, ok: false, notice: '', error: '找不到此派對佈置' };
  }
  const sys = getBirthdaySystemState(state);
  const owned =
    decor.target === 'room'
      ? sys.ownedRoomDecorIds.includes(decorId)
      : sys.ownedYardDecorIds.includes(decorId);
  if (!owned) {
    return { nextState: state, ok: false, notice: '', error: '尚未購買此派對佈置喔！' };
  }

  let enabledNow = false;
  let nextActiveRoom = sys.activeRoomDecorIds;
  let nextActiveYard = sys.activeYardDecorIds;

  if (decor.target === 'room') {
    if (sys.activeRoomDecorIds.includes(decorId)) {
      nextActiveRoom = sys.activeRoomDecorIds.filter((id) => id !== decorId);
      enabledNow = false;
    } else {
      nextActiveRoom = [...sys.activeRoomDecorIds, decorId];
      enabledNow = true;
    }
  } else {
    if (sys.activeYardDecorIds.includes(decorId)) {
      nextActiveYard = sys.activeYardDecorIds.filter((id) => id !== decorId);
      enabledNow = false;
    } else {
      nextActiveYard = [...sys.activeYardDecorIds, decorId];
      enabledNow = true;
    }
  }

  const nextSys = enabledNow
    ? advanceBirthdayTasksAndOrders(
        {
          ...sys,
          activeRoomDecorIds: nextActiveRoom,
          activeYardDecorIds: nextActiveYard,
        },
        { taskKind: 'prep_decor', amount: 1 }
      )
    : {
        ...sys,
        activeRoomDecorIds: nextActiveRoom,
        activeYardDecorIds: nextActiveYard,
      };

  return {
    nextState: {
      ...state,
      birthdaySystem: nextSys,
    },
    ok: true,
    notice: enabledNow
      ? `已開啟${decor.target === 'room' ? '房間' : '庭院'}派對佈置「${decor.name}」！`
      : `已暫時收起「${decor.name}」（隨時可重新開啟）。`,
  };
}

export function getOrCreateBirthdayCard(
  state: GameState,
  petId: string,
  now: Date = new Date()
): BirthdayCard {
  const pet = state.pets.find((p) => p.id === petId) ?? getActivePet(state);
  const status = getBirthdayStatusForPet(pet, now);
  const sys = getBirthdaySystemState(state, now);
  const existing = sys.cards.find((c) => c.petId === pet.id && c.yearKey === status.yearKey);
  if (existing) return existing;
  return {
    id: `bcard_${status.yearKey}`,
    petId: pet.id,
    petName: pet.name,
    yearKey: status.yearKey,
    birthdayDateLabel: status.dateLabel,
    blessings: [],
    stickers: ['bday_happy', 'bday_heart'],
    completed: false,
    savedToMemories: false,
    sharedToBoard: false,
    createdAt: now.getTime(),
  };
}

export function addBirthdayCardBlessing(
  state: GameState,
  params: {
    petId: string;
    userId: string;
    userName: string;
    text: string;
    stickers?: PhotoStickerId[];
  },
  now: Date = new Date()
): BirthdayActionResult {
  const cleanText = params.text.trim().slice(0, 120);
  if (!cleanText) {
    return { nextState: state, ok: false, notice: '', error: '請寫下一句給壽星的祝福話語！' };
  }
  const sys = getBirthdaySystemState(state, now);
  const card = getOrCreateBirthdayCard(state, params.petId, now);
  const nextBlessing = {
    userId: params.userId || 'local',
    userName: params.userName.trim() || '飼主',
    text: cleanText,
    createdAt: now.getTime(),
  };
  const updatedCard: BirthdayCard = {
    ...card,
    blessings: [...card.blessings, nextBlessing].slice(-12),
    stickers:
      params.stickers && params.stickers.length > 0
        ? params.stickers.slice(0, 6)
        : card.stickers,
  };

  const exists = sys.cards.some((c) => c.id === card.id);
  const nextCards = exists
    ? sys.cards.map((c) => (c.id === card.id ? updatedCard : c))
    : [updatedCard, ...sys.cards].slice(0, 24);

  const nextSys = advanceBirthdayTasksAndOrders(
    { ...sys, cards: nextCards },
    { orderKind: 'gift', amount: 1 }
  );

  return {
    nextState: {
      ...state,
      birthdaySystem: nextSys,
    },
    ok: true,
    notice: `💌 已將祝福寫進${card.petName}的生日賀卡！`,
  };
}

export function finalizeBirthdayCard(
  state: GameState,
  petId: string,
  stickers?: PhotoStickerId[],
  now: Date = new Date()
): BirthdayActionResult {
  const sys = getBirthdaySystemState(state, now);
  const card = getOrCreateBirthdayCard(state, petId, now);
  if (card.blessings.length === 0) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: '請先在賀卡上寫下至少一句祝福話語再存檔喔！',
    };
  }
  const updatedCard: BirthdayCard = {
    ...card,
    stickers: stickers && stickers.length > 0 ? stickers.slice(0, 6) : card.stickers,
    completed: true,
    savedToMemories: true,
  };

  const exists = sys.cards.some((c) => c.id === card.id);
  const nextCards = exists
    ? sys.cards.map((c) => (c.id === card.id ? updatedCard : c))
    : [updatedCard, ...sys.cards].slice(0, 24);

  let nextSys = advanceBirthdayTasksAndOrders(
    { ...sys, cards: nextCards },
    { taskKind: 'birthday_card', orderKind: 'gift', amount: 1 }
  );

  let nextState: GameState = {
    ...state,
    birthdaySystem: nextSys,
  };

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `bday_card_${card.id}`,
    petId: card.petId,
    type: 'birthday',
    title: `收到生日賀卡：給${card.petName}的 ${card.birthdayDateLabel} 祝福`,
    description: updatedCard.blessings
      .map((b) => `${b.userName}：「${b.text}」`)
      .join(' / '),
    emoji: '💌',
    dateKey: getLocalDateString(now),
  });

  return {
    nextState,
    ok: true,
    notice: `💌 「${card.petName}的生日賀卡」已完成並永久保存進回憶相冊！`,
  };
}

export function markBirthdayCardShared(
  state: GameState,
  cardId: string
): GameState {
  const sys = getBirthdaySystemState(state);
  return {
    ...state,
    birthdaySystem: {
      ...sys,
      cards: sys.cards.map((c) => (c.id === cardId ? { ...c, sharedToBoard: true } : c)),
    },
  };
}

export function claimBirthdayTask(
  state: GameState,
  taskId: string
): BirthdayActionResult {
  const sys = getBirthdaySystemState(state);
  const task = sys.tasks.find((t) => t.id === taskId);
  if (!task) {
    return { nextState: state, ok: false, notice: '', error: '找不到此生日任務' };
  }
  if (!task.completed) {
    return { nextState: state, ok: false, notice: '', error: '任務尚未完成喔！' };
  }
  if (task.claimed) {
    return { nextState: state, ok: false, notice: '', error: '這個任務獎勵已經領取過了！' };
  }

  return {
    nextState: {
      ...state,
      coins: state.coins + task.rewardCoins,
      birthdaySystem: {
        ...sys,
        tickets: {
          balance: sys.tickets.balance + task.rewardTickets,
          totalEarned: sys.tickets.totalEarned + task.rewardTickets,
        },
        tasks: sys.tasks.map((t) => (t.id === taskId ? { ...t, claimed: true } : t)),
      },
    },
    ok: true,
    notice: `🎫 領取生日任務獎勵：+${task.rewardTickets} 生日券、+${task.rewardCoins} 金幣！`,
  };
}

export function claimBirthdayOrder(
  state: GameState,
  orderId: string
): BirthdayActionResult {
  const sys = getBirthdaySystemState(state);
  const order = sys.orders.find((o) => o.id === orderId);
  if (!order) {
    return { nextState: state, ok: false, notice: '', error: '找不到此生日訂單' };
  }
  if (!order.completed) {
    return { nextState: state, ok: false, notice: '', error: '訂單尚未完成喔！' };
  }
  if (order.claimed) {
    return { nextState: state, ok: false, notice: '', error: '此訂單獎勵已經領取過囉！' };
  }

  return {
    nextState: {
      ...state,
      coins: state.coins + order.rewardCoins,
      birthdaySystem: {
        ...sys,
        tickets: {
          balance: sys.tickets.balance + order.rewardTickets,
          totalEarned: sys.tickets.totalEarned + order.rewardTickets,
        },
        orders: sys.orders.map((o) => (o.id === orderId ? { ...o, claimed: true } : o)),
      },
    },
    ok: true,
    notice: `🎁 完成生日訂單：+${order.rewardTickets} 生日券、+${order.rewardCoins} 金幣！`,
  };
}

export function applyBirthdayOnPhotoTaken(
  state: GameState,
  params: {
    photoId: string;
    scene: PhotoScene;
    poseId: PhotoPose;
    backgroundId?: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
    petId: string;
    petName: string;
  },
  now: Date = new Date()
): { nextState: GameState; ticketBonus: number; birthdayNotice: string | null } {
  const pet = state.pets.find((p) => p.id === params.petId) ?? getActivePet(state);
  const status = getBirthdayStatusForPet(pet, now);
  const usedBirthdayStudioItem =
    params.scene === 'birthday' ||
    params.poseId.startsWith('bday_') ||
    Boolean(params.backgroundId && (params.backgroundId.startsWith('bday_') || params.backgroundId === 'birthday_bg')) ||
    params.filterId.startsWith('bday_') ||
    params.frameId.startsWith('bday_') ||
    params.frameId === 'birthday_frame' ||
    params.stickers.some((s) => s.startsWith('bday_'));

  if (!usedBirthdayStudioItem && status.phase !== 'birthday') {
    return { nextState: state, ticketBonus: 0, birthdayNotice: null };
  }

  const sys = getBirthdaySystemState(state, now);
  const existingYearPhotos = sys.birthdayPhotosByYearKey[status.yearKey] ?? [];
  const todayKey = getLocalDateString(now);
  const todaysBirthdayPhotoCount = state.house.photos.filter((p) => {
    const pDate = getLocalDateString(new Date(p.createdAt));
    return (
      pDate === todayKey &&
      (p.scene === 'birthday' ||
        p.photoKind === 'birthday' ||
        existingYearPhotos.includes(p.id))
    );
  }).length;
  const ticketBonus = todaysBirthdayPhotoCount <= 3 ? 3 : 0;

  let nextSys: BirthdaySystemState = {
    ...sys,
    tickets: {
      balance: sys.tickets.balance + ticketBonus,
      totalEarned: sys.tickets.totalEarned + ticketBonus,
    },
    birthdayPhotosByYearKey: {
      ...sys.birthdayPhotosByYearKey,
      [status.yearKey]: [params.photoId, ...existingYearPhotos].slice(0, 20),
    },
  };
  nextSys = advanceBirthdayTasksAndOrders(nextSys, {
    taskKind: 'birthday_photo',
    orderKind: 'photo',
    amount: 1,
  });

  let nextState: GameState = {
    ...state,
    birthdaySystem: nextSys,
  };

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `bday_photo_${status.yearKey}_${params.photoId}`,
    petId: pet.id,
    type: 'birthday',
    title: `拍攝生日合照：${pet.name}的慶生寫真`,
    description: `在攝影棚為${pet.name}記錄下歡樂生日瞬間！${ticketBonus > 0 ? `（獲得 +${ticketBonus} 生日券）` : ''}`,
    emoji: '📸',
    photoId: params.photoId,
    dateKey: getLocalDateString(now),
  });

  return {
    nextState,
    ticketBonus,
    birthdayNotice:
      ticketBonus > 0
        ? `🎂 生日合照記念！獲得 +${ticketBonus} 張生日券`
        : '🎂 生日合照已存入生日回憶冊！',
  };
}

export function getOrCreateCoopBirthdaySession(
  state: GameState,
  now: Date = new Date()
): CoopBirthdaySession {
  const sharedPet = state.pets.find((p) => isSharedCoopPet(p)) ?? getActivePet(state);
  const primaryStatus = getPrimaryBirthdayPetStatus(state, now);
  const targetPet =
    primaryStatus.phase === 'birthday' || primaryStatus.phase === 'countdown'
      ? state.pets.find((p) => p.id === primaryStatus.petId) ?? sharedPet
      : sharedPet;
  const status = getBirthdayStatusForPet(targetPet, now);

  const existing = state.coop.coopBirthdaySession;
  if (
    existing &&
    existing.petId === targetPet.id &&
    existing.yearKey === status.yearKey
  ) {
    return existing;
  }

  return {
    id: `cbday_${status.yearKey}`,
    petId: targetPet.id,
    petName: targetPet.name,
    yearKey: status.yearKey,
    birthdayDateLabel: status.dateLabel,
    steps: buildInitialCoopBirthdaySteps(),
    completed: false,
    completedAt: null,
    claimedByUserIds: [],
    lastUpdatedByName: null,
    lastUpdatedAt: null,
  };
}

export function contributeCoopBirthdayStep(
  state: GameState,
  stepKey: CoopBirthdayTaskKey,
  userId: string,
  userName: string,
  now: Date = new Date()
): BirthdayActionResult {
  const session = getOrCreateCoopBirthdaySession(state, now);
  if (session.completed) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: '這場共養生日派對已經全部完成囉，快領取共同獎勵吧！',
    };
  }

  const targetStep = session.steps.find((s) => s.key === stepKey);
  if (!targetStep) {
    return { nextState: state, ok: false, notice: '', error: '找不到此共養步驟' };
  }
  if (targetStep.progress >= targetStep.target) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: `「${targetStep.label}」已經達成 ${targetStep.target} / ${targetStep.target} 囉！`,
    };
  }

  const cleanActor = userName.trim() || '共養夥伴';
  const nextSteps = session.steps.map((step) => {
    if (step.key !== stepKey) return step;
    const nextProgress = Math.min(step.target, step.progress + 1);
    const nextUsers = step.contributorUserIds.includes(userId)
      ? step.contributorUserIds
      : [...step.contributorUserIds, userId];
    const nextNames = step.contributorNames.includes(cleanActor)
      ? step.contributorNames
      : [...step.contributorNames, cleanActor];
    return {
      ...step,
      progress: nextProgress,
      contributorUserIds: nextUsers,
      contributorNames: nextNames,
    };
  });

  const allCompleted = nextSteps.every((s) => s.progress >= s.target);
  const nowTs = now.getTime();
  const todayKey = getLocalDateString(now);

  const nextSession: CoopBirthdaySession = {
    ...session,
    steps: nextSteps,
    completed: allCompleted,
    completedAt: allCompleted ? nowTs : null,
    lastUpdatedByName: cleanActor,
    lastUpdatedAt: nowTs,
  };

  let nextStreak = state.coop.birthdayStreak ?? 0;
  let nextLastBdayDate = state.coop.lastBirthdayCoopDateKey ?? null;
  const nextBadges = [...state.coop.unlockedBadges];
  const nextTitles = [...state.encyclopedia.unlockedTitles];
  const extraNotices: string[] = [];

  if (allCompleted) {
    if (nextLastBdayDate !== session.yearKey) {
      nextStreak += 1;
      nextLastBdayDate = session.yearKey;
    }
    if (nextStreak >= 3 && !nextBadges.includes('birthday_party_partner')) {
      nextBadges.push('birthday_party_partner');
      extraNotices.push('解鎖共養徽章「生日派對搭檔」');
    }
    if (nextStreak >= 5 && !nextTitles.includes('best_birthday_partner')) {
      nextTitles.push('best_birthday_partner');
      extraNotices.push('解鎖限定稱號「🎂 最佳慶生搭檔」');
    }
  }

  const updatedStep = nextSteps.find((s) => s.key === stepKey)!;
  const offlineSummary = allCompleted
    ? `我們一起完成了${session.petName}的生日派對準備，快去領取 +8 生日券與共養獎勵！`
    : `已完成${session.petName}的生日合作「${updatedStep.emoji} ${updatedStep.label}」（${updatedStep.progress} / ${updatedStep.target}）`;

  const offlineEv: CoopOfflineEvent = {
    id: `coev_bday_${nowTs}_${Math.random().toString(36).slice(2, 6)}`,
    actorUserId: userId || 'local',
    actorName: cleanActor,
    gameType: 'birthday_coop',
    summary: offlineSummary,
    createdAt: nowTs,
  };

  const sys = getBirthdaySystemState(state, now);
  const nextSys = allCompleted
    ? advanceBirthdayTasksAndOrders(sys, { taskKind: 'coop_birthday', amount: 1 })
    : sys;

  let nextState: GameState = {
    ...state,
    encyclopedia: {
      ...state.encyclopedia,
      unlockedTitles: nextTitles,
    },
    coop: {
      ...state.coop,
      coopBirthdaySession: nextSession,
      birthdayStreak: nextStreak,
      lastBirthdayCoopDateKey: nextLastBdayDate,
      unlockedBadges: nextBadges,
      offlineEvents: [offlineEv, ...state.coop.offlineEvents].slice(0, 20),
    },
    birthdaySystem: nextSys,
  };

  if (allCompleted) {
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: `coop_bday_done_${session.yearKey}`,
      petId: session.petId,
      type: 'birthday',
      title: `我們一起慶祝了${session.petName}的生日！`,
      description: `兩人共同完成了蛋糕、房間佈置、拍照與賀卡祝福！${extraNotices.length > 0 ? ' · ' + extraNotices.join(' · ') : ''}`,
      emoji: '🎉',
      dateKey: todayKey,
      actorName: cleanActor,
      isShared: true,
    });
  }

  return {
    nextState,
    ok: true,
    notice: allCompleted
      ? `🎉 我們一起慶祝了${session.petName}的生日！雙方皆可領取 +8 生日券、+80 金幣與 +6 親密度！${extraNotices.length > 0 ? ' · ' + extraNotices.join(' · ') : ''}`
      : `${updatedStep.emoji} 生日共養進度更新：已完成 ${updatedStep.progress} / ${updatedStep.target}！`,
  };
}

export function claimCoopBirthdayReward(
  state: GameState,
  userId: string,
  now: Date = new Date()
): BirthdayActionResult {
  const session = getOrCreateCoopBirthdaySession(state, now);
  if (!session.completed) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: '請先完成全部 4 項共養生日準備再領獎喔！',
    };
  }
  const actorKey = userId || 'local';
  if (session.claimedByUserIds.includes(actorKey)) {
    return {
      nextState: state,
      ok: false,
      notice: '',
      error: '你已經領取過這場生日派對的共養獎勵囉！',
    };
  }

  const sys = getBirthdaySystemState(state, now);
  let nextState = updatePetById(state, session.petId, (pet) => ({
    ...pet,
    intimacy: pet.intimacy + 6,
    mood: Math.min(100, pet.mood + 15),
  }));

  nextState = {
    ...nextState,
    coins: nextState.coins + 80,
    coop: {
      ...nextState.coop,
      coopBirthdaySession: {
        ...session,
        claimedByUserIds: [...session.claimedByUserIds, actorKey],
      },
    },
    birthdaySystem: {
      ...sys,
      tickets: {
        balance: sys.tickets.balance + 8,
        totalEarned: sys.tickets.totalEarned + 8,
      },
    },
  };

  return {
    nextState,
    ok: true,
    notice: `🎂 領取共養生日相同獎勵：+8 張生日券、+80 金幣、+${session.petName} 6 親密度！`,
  };
}

export function mergeCoopBirthdaySession(
  localSession: CoopBirthdaySession | null | undefined,
  remoteSession: CoopBirthdaySession | null | undefined
): CoopBirthdaySession | null {
  if (!localSession && !remoteSession) return null;
  if (!localSession) return remoteSession ?? null;
  if (!remoteSession) return localSession;
  if (localSession.id !== remoteSession.id) {
    return (remoteSession.lastUpdatedAt ?? 0) >= (localSession.lastUpdatedAt ?? 0)
      ? remoteSession
      : localSession;
  }

  const steps = localSession.steps.map((lStep) => {
    const rStep = remoteSession.steps.find((s) => s.key === lStep.key);
    if (!rStep) return lStep;
    const progress = Math.min(lStep.target, Math.max(lStep.progress, rStep.progress));
    return {
      ...lStep,
      progress,
      contributorUserIds: Array.from(
        new Set([...lStep.contributorUserIds, ...rStep.contributorUserIds])
      ),
      contributorNames: Array.from(
        new Set([...lStep.contributorNames, ...rStep.contributorNames])
      ),
    };
  });
  const completed =
    localSession.completed || remoteSession.completed || steps.every((s) => s.progress >= s.target);

  return {
    ...remoteSession,
    steps,
    completed,
    completedAt: remoteSession.completedAt ?? localSession.completedAt ?? (completed ? Date.now() : null),
    claimedByUserIds: Array.from(
      new Set([...localSession.claimedByUserIds, ...remoteSession.claimedByUserIds])
    ),
    lastUpdatedAt: Math.max(localSession.lastUpdatedAt ?? 0, remoteSession.lastUpdatedAt ?? 0) || null,
    lastUpdatedByName:
      (remoteSession.lastUpdatedAt ?? 0) >= (localSession.lastUpdatedAt ?? 0)
        ? remoteSession.lastUpdatedByName
        : localSession.lastUpdatedByName,
  };
}

export function mergeBirthdaySystemRemoteState(
  localSys: BirthdaySystemState | undefined,
  remoteSys: BirthdaySystemState | undefined
): BirthdaySystemState {
  if (!localSys && !remoteSys) return createInitialBirthdaySystemState();
  if (!localSys) return remoteSys!;
  if (!remoteSys) return localSys;

  const cardMap = new Map<string, BirthdayCard>();
  for (const c of localSys.cards) cardMap.set(c.id, c);
  for (const rc of remoteSys.cards) {
    const lc = cardMap.get(rc.id);
    if (!lc) {
      cardMap.set(rc.id, rc);
    } else {
      const blessingMap = new Map<string, BirthdayCard['blessings'][number]>();
      for (const b of [...lc.blessings, ...rc.blessings]) {
        blessingMap.set(`${b.userId}_${b.createdAt}`, b);
      }
      cardMap.set(rc.id, {
        ...lc,
        blessings: Array.from(blessingMap.values())
          .sort((a, b) => a.createdAt - b.createdAt)
          .slice(-12),
        stickers: Array.from(new Set([...lc.stickers, ...rc.stickers])).slice(0, 6),
        completed: lc.completed || rc.completed,
        savedToMemories: lc.savedToMemories || rc.savedToMemories,
        sharedToBoard: lc.sharedToBoard || rc.sharedToBoard,
      });
    }
  }

  return {
    ...localSys,
    cards: Array.from(cardMap.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 24),
    celebratedYearKeys: Array.from(
      new Set([...localSys.celebratedYearKeys, ...remoteSys.celebratedYearKeys])
    ),
  };
}

export function findCakeById(
  state: GameState,
  cakeId: string | null
): BirthdayCake | null {
  if (!cakeId) return null;
  const sys = state.birthdaySystem;
  if (!sys) return null;
  return sys.cakes.find((c) => c.id === cakeId && !c.eaten) ?? null;
}

export function getSuggestedFruitForCake(state: GameState): IngredientId {
  return (
    FRUIT_CAKE_INGREDIENT_IDS.find((id) => (state.ingredients[id] ?? 0) >= 2) ??
    FRUIT_CAKE_INGREDIENT_IDS[0]
  );
}

export { BIRTHDAY_CAKES, BIRTHDAY_DECORATIONS };
