import {
  EventId,
  EventMilestone,
  EventShopItem,
  EventTask,
  EventTaskKind,
  IngredientId,
} from '../../types';

export const STRAWBERRY_EVENT_ID: EventId = 'strawberry_season';
export const STRAWBERRY_EVENT_NAME = '草莓季';
export const STRAWBERRY_EVENT_DESCRIPTION =
  '香甜草莓盛產中！在 14 天活動期間種植草莓、烘焙草莓甜品、換上草莓甜心穿搭拍下夢幻寫真，收集「草莓券」兌換限定背景、濾鏡、拍立得相框與姿勢！';
export const STRAWBERRY_EVENT_DURATION_DAYS = 14;

export const STRAWBERRY_TICKET_REWARDS = {
  dailyTaskMin: 5,
  dailyTaskMax: 10,
  harvestStrawberry: 2,
  cookStrawberry: 3,
  strawberryPhoto: 5,
  coopPartyTask: 8,
} as const;

export const STRAWBERRY_ACCESSORY_IDS: string[] = [
  'strawberry_shake_headband',
  'strawberry_blush_sticker',
  'strawberry_shake_bib',
  'strawberry_dot_dress',
  'strawberry_clip',
  'strawberry_cape',
  'strawberry_icecream',
];

export const STRAWBERRY_SET_ACCESSORY_IDS: string[] = [
  'strawberry_shake_headband',
  'strawberry_blush_sticker',
  'strawberry_shake_bib',
  'strawberry_dot_dress',
];

export const STRAWBERRY_FOOD_IDS: string[] = [
  'fruit_box',
  'butter_cookie',
  'blueberry_tart',
];

export const STRAWBERRY_RECIPE_IDS: string[] = [
  'recipe_fruit_box',
  'recipe_cookie',
  'recipe_blueberry_tart',
];

export const STRAWBERRY_SHOP_ITEMS: EventShopItem[] = [
  {
    id: 'shop_sb_headband',
    eventId: 'strawberry_season',
    name: '草莓奶昔髮箍',
    emoji: '🍓',
    description: '擠上蓬鬆鮮奶油與鮮紅草莓的甜心髮箍（草莓甜心套裝）',
    category: 'accessory',
    targetId: 'strawberry_shake_headband',
    ticketPrice: 80,
    badgeText: '頭部配件',
  },
  {
    id: 'shop_sb_blush',
    eventId: 'strawberry_season',
    name: '草莓腮紅貼',
    emoji: '🩷',
    description: '臉頰兩側貼上粉嫩小草莓腮紅，笑容甜進心坎',
    category: 'accessory',
    targetId: 'strawberry_blush_sticker',
    ticketPrice: 60,
    badgeText: '臉部配件',
  },
  {
    id: 'shop_sb_bib',
    eventId: 'strawberry_season',
    name: '草莓奶昔圍兜',
    emoji: '🧁',
    description: '草莓奶油花邊小圍兜，正中央還有愛心草莓徽章',
    category: 'accessory',
    targetId: 'strawberry_shake_bib',
    ticketPrice: 90,
    badgeText: '脖子配件',
  },
  {
    id: 'shop_sb_dress',
    eventId: 'strawberry_season',
    name: '草莓點點小裙子',
    emoji: '👗',
    description: '粉紅荷葉邊與白色波點小洋裝，像草莓蛋糕一樣可愛',
    category: 'accessory',
    targetId: 'strawberry_dot_dress',
    ticketPrice: 120,
    badgeText: '身體配件',
  },
  {
    id: 'shop_sb_bg',
    eventId: 'strawberry_season',
    name: '草莓田背景',
    emoji: '🏞️',
    description: '草莓季限定攝影棚背景：粉紅花門與盛產草莓園',
    category: 'background',
    targetId: 'strawberry_season_field',
    ticketPrice: 150,
    badgeText: '攝影棚背景',
  },
  {
    id: 'shop_sb_filter',
    eventId: 'strawberry_season',
    name: '草莓濾鏡',
    emoji: '🎨',
    description: '草莓季限定粉甜柔焦濾鏡，讓寫真散發奶油莓果光澤',
    category: 'filter',
    targetId: 'strawberry',
    ticketPrice: 100,
    badgeText: '攝影棚濾鏡',
  },
  {
    id: 'shop_sb_frame',
    eventId: 'strawberry_season',
    name: '草莓拍立得相框',
    emoji: '🖼️',
    description: '草莓季限定粉嫩拍立得相框，邊角點綴草莓與愛心',
    category: 'frame',
    targetId: 'strawberry_polaroid',
    ticketPrice: 120,
    badgeText: '攝影棚相框',
  },
  {
    id: 'shop_sb_pose',
    eventId: 'strawberry_season',
    name: '草莓甜心姿勢',
    emoji: '✨',
    description: '草莓季限定拍照姿勢：星星眼比心甜笑！',
    category: 'pose',
    targetId: 'strawberry_sweetheart',
    ticketPrice: 200,
    badgeText: '攝影棚姿勢',
  },
  {
    id: 'shop_sb_title',
    eventId: 'strawberry_season',
    name: '限定稱號「草莓甜心」',
    emoji: '👑',
    description: '可佩戴於首頁的草莓季專屬閃耀稱號「草莓甜心」',
    category: 'title',
    targetId: 'strawberry_sweetheart_title',
    ticketPrice: 300,
    badgeText: '專屬稱號',
  },
];

export interface EventDailyTaskTemplate {
  kind: EventTaskKind;
  title: string;
  description: string;
  emoji: string;
  target: number;
  rewardTickets: number;
  rewardCoins: number;
  rewardIngredientId?: IngredientId;
  rewardIngredientQty?: number;
  rewardStudioMaterials?: number;
}

export const STRAWBERRY_DAILY_TASK_TEMPLATES: EventDailyTaskTemplate[] = [
  {
    kind: 'plant_strawberry',
    title: '播種甜甜草莓',
    description: '在開心農場種植草莓 1 次',
    emoji: '🌱',
    target: 1,
    rewardTickets: 5,
    rewardCoins: 15,
    rewardIngredientId: 'strawberry',
    rewardIngredientQty: 1,
  },
  {
    kind: 'feed_strawberry',
    title: '分享草莓點心',
    description: '餵食寶貝草莓相關食物 1 次（水果盒、草莓餅乾、藍莓卡士達塔）',
    emoji: '🧁',
    target: 1,
    rewardTickets: 6,
    rewardCoins: 20,
  },
  {
    kind: 'photo_strawberry',
    title: '捕捉草莓寫真',
    description: '在攝影棚拍攝草莓主題照片 1 張',
    emoji: '📸',
    target: 1,
    rewardTickets: 7,
    rewardCoins: 20,
    rewardStudioMaterials: 1,
  },
  {
    kind: 'equip_strawberry_acc',
    title: '草莓系造型穿搭',
    description: '讓寶貝同時穿戴草莓配件 2 件',
    emoji: '🎀',
    target: 2,
    rewardTickets: 6,
    rewardCoins: 20,
  },
  {
    kind: 'cook_strawberry',
    title: '烘焙草莓料理',
    description: '在廚房完成草莓料理 1 次',
    emoji: '👩‍🍳',
    target: 1,
    rewardTickets: 7,
    rewardCoins: 25,
    rewardIngredientId: 'strawberry',
    rewardIngredientQty: 2,
  },
  {
    kind: 'play_minigame',
    title: '慶典快樂時光',
    description: '與寶貝遊玩小遊戲 2 次',
    emoji: '🎮',
    target: 2,
    rewardTickets: 8,
    rewardCoins: 30,
  },
  {
    kind: 'coop_event_task',
    title: '草莓派對合作',
    description: '完成共養合作任務 1 次（草莓派對 / 雙人任務）',
    emoji: '💞',
    target: 1,
    rewardTickets: 10,
    rewardCoins: 35,
    rewardStudioMaterials: 1,
  },
];

export function buildDailyEventTasksForDate(dateStr: string): EventTask[] {
  const parts = dateStr.split('-').map((n) => parseInt(n, 10));
  const daySeed =
    parts.length === 3 && parts.every((n) => Number.isFinite(n))
      ? Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000)
      : 0;

  const picked: EventDailyTaskTemplate[] = [];
  const total = STRAWBERRY_DAILY_TASK_TEMPLATES.length;
  for (let i = 0; i < 4; i++) {
    const idx = (Math.abs(daySeed) * 3 + i * 2) % total;
    const candidate = STRAWBERRY_DAILY_TASK_TEMPLATES[idx];
    if (!picked.some((p) => p.kind === candidate.kind)) {
      picked.push(candidate);
    }
  }
  for (const tpl of STRAWBERRY_DAILY_TASK_TEMPLATES) {
    if (picked.length >= 4) break;
    if (!picked.some((p) => p.kind === tpl.kind)) {
      picked.push(tpl);
    }
  }

  return picked.map((tpl) => ({
    id: `evt_${dateStr}_${tpl.kind}`,
    kind: tpl.kind,
    title: tpl.title,
    description: tpl.description,
    emoji: tpl.emoji,
    target: tpl.target,
    progress: 0,
    completed: false,
    claimed: false,
    rewardTickets: tpl.rewardTickets,
    rewardCoins: tpl.rewardCoins,
    rewardIngredientId: tpl.rewardIngredientId,
    rewardIngredientQty: tpl.rewardIngredientQty,
    rewardStudioMaterials: tpl.rewardStudioMaterials,
  }));
}

export function createInitialStrawberryMilestones(): EventMilestone[] {
  return [
    {
      id: 'strawberry_rookie',
      title: '草莓新手',
      description: '完成 3 個草莓季活動任務',
      emoji: '🌱',
      target: 3,
      progress: 0,
      completed: false,
      claimed: false,
      rewardTickets: 20,
      rewardCoins: 50,
      rewardSummary: '草莓券 ×20 ＋ 金幣 ×50',
    },
    {
      id: 'strawberry_photographer',
      title: '草莓攝影師',
      description: '拍攝 3 張草莓主題照片',
      emoji: '📸',
      target: 3,
      progress: 0,
      completed: false,
      claimed: false,
      rewardTickets: 15,
      rewardCoins: 100,
      rewardSummary: '草莓濾鏡 ＋ 草莓券 ×15 ＋ 金幣 ×100',
      rewardFilterId: 'strawberry',
    },
    {
      id: 'strawberry_stylist',
      title: '草莓時尚家',
      description: '收集 3 件草莓配件',
      emoji: '🎀',
      target: 3,
      progress: 0,
      completed: false,
      claimed: false,
      rewardTickets: 15,
      rewardCoins: 150,
      rewardSummary: '草莓點點小裙子 ＋ 草莓券 ×15 ＋ 金幣 ×150',
      rewardAccessoryId: 'strawberry_dot_dress',
    },
    {
      id: 'strawberry_chef',
      title: '草莓主廚',
      description: '完成 3 道草莓料理',
      emoji: '👩‍🍳',
      target: 3,
      progress: 0,
      completed: false,
      claimed: false,
      rewardTickets: 20,
      rewardCoins: 200,
      rewardSummary: '晚安可可 ×3（稀有食材）＋ 草莓券 ×20 ＋ 金幣 ×200',
      rewardIngredient: { id: 'dream_cocoa', qty: 3 },
    },
    {
      id: 'strawberry_sweetheart',
      title: '草莓甜心',
      description: '完成 10 個草莓季活動任務',
      emoji: '🍓',
      target: 10,
      progress: 0,
      completed: false,
      claimed: false,
      rewardTickets: 30,
      rewardCoins: 150,
      rewardSummary: '草莓田背景 ＋ 限定稱號「草莓甜心」＋ 草莓券 ×30',
      rewardBackgroundId: 'strawberry_season_field',
      rewardTitleId: 'strawberry_sweetheart_title',
    },
    {
      id: 'strawberry_party',
      title: '草莓派對',
      description: '完成 1 張雙人合照（攝影棚雙人合照或草莓野餐合照）',
      emoji: '👯',
      target: 1,
      progress: 0,
      completed: false,
      claimed: false,
      rewardTickets: 25,
      rewardCoins: 120,
      rewardSummary: '草莓拍立得相框 ＋ 共同回憶卡 ＋ 草莓券 ×25 ＋ 金幣 ×120',
      rewardFrameId: 'strawberry_polaroid',
      createsSharedMemory: true,
    },
  ];
}

export interface EventCatalogEntry {
  id: string;
  eventId: EventId;
  eventName: string;
  name: string;
  emoji: string;
  categoryLabel: string;
  kind: 'accessory' | 'background' | 'filter' | 'frame' | 'pose' | 'title' | 'badge';
  targetId: string;
  unlockHint: string;
}

export const STRAWBERRY_EVENT_CATALOG_ENTRIES: EventCatalogEntry[] = [
  ...STRAWBERRY_SHOP_ITEMS.map((item) => ({
    id: item.id,
    eventId: item.eventId,
    eventName: STRAWBERRY_EVENT_NAME,
    name: item.name,
    emoji: item.emoji,
    categoryLabel: item.badgeText,
    kind: item.category,
    targetId: item.targetId,
    unlockHint: `草莓季商店 ${item.ticketPrice} 草莓券兌換`,
  })),
  {
    id: 'cat_sb_badge_photographer',
    eventId: 'strawberry_season',
    eventName: STRAWBERRY_EVENT_NAME,
    name: '徽章「草莓攝影師」',
    emoji: '📸',
    categoryLabel: '攝影棚徽章',
    kind: 'badge',
    targetId: 'strawberry_photographer',
    unlockHint: '連續 2 週草莓攝影挑戰達 100 分以上',
  },
  {
    id: 'cat_sb_title_fashionista',
    eventId: 'strawberry_season',
    eventName: STRAWBERRY_EVENT_NAME,
    name: '稱號「草莓時尚家」',
    emoji: '👑',
    categoryLabel: '專屬稱號',
    kind: 'title',
    targetId: 'strawberry_fashionista',
    unlockHint: '連續 3 週草莓攝影挑戰達 100 分以上',
  },
  {
    id: 'cat_sb_badge_coop_partner',
    eventId: 'strawberry_season',
    eventName: STRAWBERRY_EVENT_NAME,
    name: '共養徽章「草莓甜心搭檔」',
    emoji: '💞',
    categoryLabel: '共養徽章',
    kind: 'badge',
    targetId: 'strawberry_sweetheart_partner',
    unlockHint: '草莓季連續 3 天完成「草莓派對」共養合作任務',
  },
];
