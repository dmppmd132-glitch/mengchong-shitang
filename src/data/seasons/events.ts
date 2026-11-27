import {
  SeasonEvent,
  SeasonEventId,
  SeasonEventShopItem,
  SeasonEventTask,
  SeasonId,
} from '../../types';

export interface SeasonFestivalBlueprint {
  eventId: SeasonEventId;
  seasonId: SeasonId;
  name: string;
  emoji: string;
  durationDays: number;
  currencyName: string;
  currencyEmoji: string;
  description: string;
  status: 'active' | 'reserved';
  highlights: string[];
}

export const SEASON_FESTIVAL_BLUEPRINTS: SeasonFestivalBlueprint[] = [
  {
    eventId: 'spring_sakura_picnic',
    seasonId: 'spring',
    name: '櫻花野餐祭',
    emoji: '🌸',
    durationDays: 14,
    currencyName: '櫻花券',
    currencyEmoji: '🌸',
    description:
      '粉紅花瓣飄落小鎮！在 14 天慶典期間種植春季作物、料理草莓奶昔與薄荷沙拉、拍攝春櫻寫真並與共養對象舉辦櫻花野餐，蒐集「櫻花券」換取限定穿搭與寫真背景！',
    status: 'active',
    highlights: ['櫻花野餐限定任務', '共養櫻花野餐合作任務', '限定櫻花貝雷帽／披風／背景濾鏡'],
  },
  {
    eventId: 'summer_beach_fest',
    seasonId: 'summer',
    name: '夏日海邊祭',
    emoji: '🏖️',
    durationDays: 10,
    currencyName: '貝殼券',
    currencyEmoji: '🐚',
    description: '預留結構：仲夏陽光、西瓜冰沙派對與夜間螢火蟲寫真祭典（敬請期待）。',
    status: 'reserved',
    highlights: ['海邊遮陽帽', '西瓜冰沙挑戰', '夏夜煙火寫真景致'],
  },
  {
    eventId: 'autumn_harvest_fest',
    seasonId: 'autumn',
    name: '豐收感恩祭',
    emoji: '🍁',
    durationDays: 10,
    currencyName: '楓葉券',
    currencyEmoji: '🍁',
    description: '預留結構：金黃南瓜蘋果大豐收與楓葉林間市集感謝祭（敬請期待）。',
    status: 'reserved',
    highlights: ['豐收南瓜派挑戰', '楓葉小徑背景', '小刺蝟暖秋派對'],
  },
  {
    eventId: 'winter_warm_fest',
    seasonId: 'winter',
    name: '溫暖冬日祭',
    emoji: '❄️',
    durationDays: 14,
    currencyName: '雪花券',
    currencyEmoji: '❄️',
    description: '預留結構：銀白雪夜暖燈壁爐市集與雪狐冬季攝影祭（敬請期待）。',
    status: 'reserved',
    highlights: ['雪花相框', '聖誕市集寫真背景', '雪莓冬日暖湯'],
  },
];

export const SAKURA_PICNIC_SHOP_ITEMS: SeasonEventShopItem[] = [
  {
    id: 'sakura_shop_beret',
    eventId: 'spring_sakura_picnic',
    name: '櫻花花瓣貝雷帽',
    emoji: '🌸',
    description: '櫻花野餐祭限定頭飾！奶油粉絨毛貝雷帽綴上立體雙瓣櫻花，春季拍照超甜美。',
    category: 'accessory',
    targetId: 'sakura_beret',
    ticketPrice: 20,
  },
  {
    id: 'sakura_shop_cape',
    eventId: 'spring_sakura_picnic',
    name: '春櫻野餐小披風',
    emoji: '🎀',
    description: '櫻花野餐祭限定背部披風！淡粉滾邊配格紋野餐小蝴蝶結，走起路來像櫻花仙子。',
    category: 'accessory',
    targetId: 'sakura_picnic_cape',
    ticketPrice: 25,
  },
  {
    id: 'sakura_shop_bg',
    eventId: 'spring_sakura_picnic',
    name: '春日野餐（攝影背景）',
    emoji: '🧺',
    description: '櫻花樹下的格子野餐布與草莓茶點，一秒切換春季野餐寫真！',
    category: 'background',
    targetId: 'spring_picnic',
    ticketPrice: 15,
  },
  {
    id: 'sakura_shop_filter',
    eventId: 'spring_sakura_picnic',
    name: '櫻花粉（攝影濾鏡）',
    emoji: '🩷',
    description: '柔和粉櫻霧面光澤濾鏡，讓每張照片都散發暖春氣息。',
    category: 'filter',
    targetId: 'sakura_pink',
    ticketPrice: 12,
  },
  {
    id: 'sakura_shop_frame',
    eventId: 'spring_sakura_picnic',
    name: '花瓣邊框（相框）',
    emoji: '🌺',
    description: '飄舞櫻花瓣環繞的春季紀念相框。',
    category: 'frame',
    targetId: 'petal_frame',
    ticketPrice: 12,
  },
  {
    id: 'sakura_shop_title',
    eventId: 'spring_sakura_picnic',
    name: '稱號：櫻花野餐王',
    emoji: '🌸',
    description: '慶祝在櫻花季留下最溫暖野餐回憶的限定個人稱號！',
    category: 'title',
    targetId: 'sakura_picnic_host',
    ticketPrice: 30,
  },
];

export function buildSakuraDailyTasks(): SeasonEventTask[] {
  return [
    {
      id: 'sakura_task_plant',
      kind: 'plant_or_harvest',
      title: '春日播種或收成 2 次',
      description: '在農場種下或收成任意作物 2 次（春季作物更有加速喔！）',
      emoji: '🌱',
      progress: 0,
      target: 2,
      completed: false,
      claimed: false,
      rewardTickets: 8,
      rewardCoins: 35,
    },
    {
      id: 'sakura_task_cook',
      kind: 'cook_seasonal',
      title: '製作春季輕食料理 1 次',
      description: '在廚房製作草莓奶昔、薄荷沙拉或鮮果水果盒等任一料理！',
      emoji: '🥤',
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
      rewardTickets: 10,
      rewardCoins: 45,
    },
    {
      id: 'sakura_task_photo',
      kind: 'take_photo',
      title: '拍攝春日寫真 1 張',
      description: '前往攝影棚為萌寵拍下 1 張春季野餐留念照。',
      emoji: '📸',
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
      rewardTickets: 10,
      rewardCoins: 40,
    },
  ];
}

export function createInitialSpringSakuraEvent(dateKey: string, endDateKey: string): SeasonEvent {
  return {
    eventId: 'spring_sakura_picnic',
    seasonId: 'spring',
    name: '櫻花野餐祭',
    emoji: '🌸',
    description:
      '粉紅花瓣飄落小鎮！完成春日種植、野餐料理、攝影與共養合作任務，兌換櫻花限定穿搭與寫真主題！',
    durationDays: 14,
    startDate: dateKey,
    endDate: endDateKey,
    status: 'active',
    currencyName: '櫻花券',
    currencyEmoji: '🌸',
    ticketBalance: 10,
    ticketTotalEarned: 10,
    dailyDate: dateKey,
    dailyTasks: buildSakuraDailyTasks(),
    purchasedShopItemIds: [],
    coopTask: {
      id: `sakura_coop_${dateKey}`,
      dateKey,
      title: '共養夥伴：櫻花樹下的野餐約定',
      description: '與共養對象一起餵食／料理 2 次並拍下 1 張合照，即可雙人領取櫻花券！',
      picnicFoodCount: 0,
      picnicFoodTarget: 2,
      photoCount: 0,
      photoTarget: 1,
      contributorUserIds: [],
      completed: false,
      claimedByUserIds: [],
      rewardTickets: 15,
      rewardCoins: 80,
    },
    carryoverItemIds: SAKURA_PICNIC_SHOP_ITEMS.map((i) => i.targetId),
  };
}
