import {
  CoopVisitorSession,
  IngredientId,
  TownOrder,
  TownOrderCategory,
  TownOrderPhotoReq,
  VisitorId,
} from '../../types';

export const COOP_VISITOR_TEMPLATES: Array<{
  visitorId: VisitorId;
  title: string;
  description: string;
  requirements: Array<{
    kind: 'ingredient' | 'food' | 'treat';
    itemId: string;
    label: string;
    emoji: string;
    requiredQty: number;
  }>;
  rewardCoins: number;
  rewardShards: number;
  rewardTickets: number;
  rewardRareIngredients: Partial<Record<IngredientId, number>>;
}> = [
  {
    visitorId: 'rabbit',
    title: '小兔子雪球的野餐邀約',
    description: '兩人合作準備香甜紅蘿蔔與焦糖布丁，就能讓雪球開心一整天！',
    requirements: [
      { kind: 'ingredient', itemId: 'carrot', label: '紅蘿蔔', emoji: '🥕', requiredQty: 2 },
      { kind: 'food', itemId: 'caramel_pudding', label: '焦糖布丁', emoji: '🍮', requiredQty: 1 },
    ],
    rewardCoins: 45,
    rewardShards: 3,
    rewardTickets: 1,
    rewardRareIngredients: { strawberry: 1, mint: 1 },
  },
  {
    visitorId: 'bird',
    title: '小鳥啾啾的晨間音樂會',
    description: '一人放穀粒種子、一人準備餅乾或玉米，一起舉辦庭院茶會！',
    requirements: [
      { kind: 'treat', itemId: 'seeds_mix', label: '綜合穀粒種子', emoji: '🌾', requiredQty: 2 },
      { kind: 'food', itemId: 'butter_cookie', label: '奶油餅乾', emoji: '🍪', requiredQty: 1 },
    ],
    rewardCoins: 45,
    rewardShards: 3,
    rewardTickets: 1,
    rewardRareIngredients: { sunflower: 2, blueberry: 1 },
  },
  {
    visitorId: 'squirrel',
    title: '松鼠果果的秋日儲糧派對',
    description: '攜手收集香烤堅果與夢幻可可，和夥伴一起招待貪吃的果果吧！',
    requirements: [
      { kind: 'treat', itemId: 'roasted_nuts', label: '香烤綜合堅果', emoji: '🌰', requiredQty: 2 },
      { kind: 'ingredient', itemId: 'dream_cocoa', label: '夢幻可可', emoji: '🍫', requiredQty: 1 },
    ],
    rewardCoins: 50,
    rewardShards: 4,
    rewardTickets: 1,
    rewardRareIngredients: { moon_wheat: 1, dream_cocoa: 1 },
  },
];

export function buildCoopVisitorSession(
  dateKey: string,
  daySeed: number
): CoopVisitorSession {
  const tpl =
    COOP_VISITOR_TEMPLATES[Math.abs(daySeed) % COOP_VISITOR_TEMPLATES.length];
  return {
    id: `coopv_${dateKey}_${tpl.visitorId}`,
    dateKey,
    visitorId: tpl.visitorId,
    title: tpl.title,
    description: tpl.description,
    requirements: tpl.requirements.map((r) => ({
      key: `${r.kind}:${r.itemId}`,
      kind: r.kind,
      itemId: r.itemId,
      label: r.label,
      emoji: r.emoji,
      requiredQty: r.requiredQty,
      contributedQty: 0,
    })),
    contributions: [],
    completed: false,
    completedAt: null,
    rewardCoins: tpl.rewardCoins,
    rewardShards: tpl.rewardShards,
    rewardTickets: tpl.rewardTickets,
    rewardRareIngredients: { ...tpl.rewardRareIngredients },
    claimedByUserIds: [],
    photoTaken: false,
    sharedToBoard: false,
  };
}

export interface TownOrderTemplate {
  key: string;
  category: TownOrderCategory;
  visitorId?: VisitorId;
  title: string;
  description: string;
  emoji: string;
  requirements: Array<{
    kind: 'ingredient' | 'food' | 'treat';
    itemId: string;
    label: string;
    emoji: string;
    requiredQty: number;
  }>;
  photoRequirement?: Omit<TownOrderPhotoReq, 'currentCount'>;
  reward: TownOrder['reward'];
}

export const TOWN_ORDER_TEMPLATES: TownOrderTemplate[] = [
  // 訪客訂單
  {
    key: 'vis_rabbit_picnic',
    category: 'visitor',
    visitorId: 'rabbit',
    title: '招待小兔子野餐籃',
    description: '小兔子雪球最期待的紅蘿蔔與鮮果拼盤，做完立刻送去吧！',
    emoji: '🐇',
    requirements: [
      { kind: 'ingredient', itemId: 'carrot', label: '紅蘿蔔', emoji: '🥕', requiredQty: 2 },
      { kind: 'food', itemId: 'fruit_box', label: '水果盒', emoji: '🍓', requiredQty: 1 },
    ],
    reward: {
      coins: 38,
      furnitureShards: 2,
      farmSpeedTickets: 1,
      rareIngredients: { mint: 1 },
      treats: { fresh_lettuce: 1 },
      studioMaterials: 1,
    },
  },
  {
    key: 'vis_bird_teatime',
    category: 'visitor',
    visitorId: 'bird',
    title: '小鳥早安茶會委託',
    description: '啾啾想邀請林間夥伴們品嚐奶油餅乾與金黃向日葵籽！',
    emoji: '🐦',
    requirements: [
      { kind: 'food', itemId: 'butter_cookie', label: '奶油餅乾', emoji: '🍪', requiredQty: 1 },
      { kind: 'ingredient', itemId: 'sunflower', label: '向日葵籽', emoji: '🌻', requiredQty: 2 },
    ],
    reward: {
      coins: 35,
      furnitureShards: 2,
      farmSpeedTickets: 1,
      rareIngredients: { blueberry: 1 },
      treats: { seeds_mix: 1 },
      studioMaterials: 1,
    },
  },
  {
    key: 'vis_squirrel_basket',
    category: 'visitor',
    visitorId: 'squirrel',
    title: '松鼠秋果補給箱',
    description: '果果準備了小籃子，想搜集香甜玉米與香烤堅果備冬！',
    emoji: '🐿️',
    requirements: [
      { kind: 'ingredient', itemId: 'corn', label: '香甜玉米', emoji: '🌽', requiredQty: 2 },
      { kind: 'treat', itemId: 'roasted_nuts', label: '香烤綜合堅果', emoji: '🌰', requiredQty: 1 },
    ],
    reward: {
      coins: 36,
      furnitureShards: 2,
      farmSpeedTickets: 1,
      rareIngredients: { dream_cocoa: 1 },
      treats: { roasted_nuts: 1 },
    },
  },
  // 攝影訂單
  {
    key: 'photo_visitor_snapshot',
    category: 'photo',
    title: '庭院訪客寫真記錄',
    description: '為來訪的庭院小客人拍下一張可愛的紀念合照，讓回憶牆更豐富吧！',
    emoji: '📸',
    requirements: [],
    photoRequirement: {
      targetCount: 1,
      label: '拍攝任 1 張庭院訪客合照（或於攝影棚合影）',
    },
    reward: {
      coins: 28,
      furnitureShards: 2,
      farmSpeedTickets: 1,
      rareIngredients: { sunflower: 1 },
      studioMaterials: 2,
    },
  },
  {
    key: 'photo_bird_morning',
    category: 'photo',
    visitorId: 'bird',
    title: '小鳥啾啾的晨光留念',
    description: '和「小鳥・啾啾」一起在庭院或攝影棚合拍一張暖陽寫真吧！',
    emoji: '🐦',
    requirements: [],
    photoRequirement: {
      targetCount: 1,
      visitorId: 'bird',
      label: '拍下「小鳥・啾啾」的庭院或攝影棚合照',
    },
    reward: {
      coins: 30,
      furnitureShards: 2,
      farmSpeedTickets: 1,
      rareIngredients: { blueberry: 1 },
      treats: { seeds_mix: 1 },
      studioMaterials: 2,
    },
  },
  {
    key: 'photo_rabbit_garden',
    category: 'photo',
    visitorId: 'rabbit',
    title: '小兔子雪球的花園寫真',
    description: '幫蹦蹦跳跳的「小兔子・雪球」在庭院或攝影棚拍張萌照留念！',
    emoji: '🐇',
    requirements: [],
    photoRequirement: {
      targetCount: 1,
      visitorId: 'rabbit',
      label: '拍下「小兔子・雪球」的庭院或攝影棚合照',
    },
    reward: {
      coins: 30,
      furnitureShards: 2,
      farmSpeedTickets: 1,
      rareIngredients: { mint: 1 },
      treats: { fresh_lettuce: 1 },
      studioMaterials: 2,
    },
  },
  // 共養訂單
  {
    key: 'coop_three_dishes',
    category: 'coop',
    title: '共養溫馨餐桌委託',
    description: '兩人共同交付 3 道家常料理（紅蘿蔔沙拉、焦糖布丁與奶油餅乾）給小鎮居民！',
    emoji: '💞',
    requirements: [
      { kind: 'food', itemId: 'carrot_salad', label: '紅蘿蔔沙拉', emoji: '🥗', requiredQty: 1 },
      { kind: 'food', itemId: 'caramel_pudding', label: '焦糖布丁', emoji: '🍮', requiredQty: 1 },
      { kind: 'food', itemId: 'butter_cookie', label: '奶油餅乾', emoji: '🍪', requiredQty: 1 },
    ],
    reward: {
      coins: 55,
      furnitureShards: 3,
      farmSpeedTickets: 2,
      rareIngredients: { moon_wheat: 1, blueberry: 1 },
    },
  },
  {
    key: 'coop_berry_party',
    category: 'coop',
    title: '共養雙人甜點外送單',
    description: '一起備齊藍莓卡士達塔與草莓鮮乳，讓小鎮午後充滿甜蜜！',
    emoji: '🫐',
    requirements: [
      { kind: 'food', itemId: 'blueberry_tart', label: '藍莓卡士達塔', emoji: '🫐', requiredQty: 1 },
      { kind: 'food', itemId: 'strawberry_milk', label: '草莓鮮乳', emoji: '🥛', requiredQty: 2 },
    ],
    reward: {
      coins: 58,
      furnitureShards: 3,
      farmSpeedTickets: 2,
      rareIngredients: { dream_cocoa: 1, sunflower: 1 },
    },
  },
  // 高級訂單
  {
    key: 'adv_moonlight_feast',
    category: 'advanced',
    title: '星夜莊園特級收購單',
    description: '集結月光小麥、夢幻可可與鮮藍莓的高級食材委託，獎勵豐厚碎片與加速券！',
    emoji: '🌙',
    requirements: [
      { kind: 'ingredient', itemId: 'moon_wheat', label: '月光小麥', emoji: '🌾', requiredQty: 2 },
      { kind: 'ingredient', itemId: 'dream_cocoa', label: '夢幻可可', emoji: '🍫', requiredQty: 2 },
      { kind: 'ingredient', itemId: 'blueberry', label: '鮮採藍莓', emoji: '🫐', requiredQty: 2 },
    ],
    reward: {
      coins: 65,
      furnitureShards: 5,
      farmSpeedTickets: 2,
      rareIngredients: { moon_wheat: 1, dream_cocoa: 1 },
      studioMaterials: 1,
    },
  },
  {
    key: 'adv_artisan_bakery',
    category: 'advanced',
    title: '小鎮烘焙師頂級訂單',
    description: '需要主廚用心烹製月光可頌與熔岩可可，完成後獲得珍稀家具碎片！',
    emoji: '🥐',
    requirements: [
      { kind: 'food', itemId: 'moon_croissant', label: '月光蜜糖可頌', emoji: '🥐', requiredQty: 1 },
      { kind: 'food', itemId: 'cocoa_fondant', label: '晚安熔岩可可', emoji: '🍫', requiredQty: 1 },
      { kind: 'ingredient', itemId: 'sunflower', label: '向日葵籽', emoji: '🌻', requiredQty: 2 },
    ],
    reward: {
      coins: 72,
      furnitureShards: 5,
      farmSpeedTickets: 3,
      rareIngredients: { blueberry: 2 },
      studioMaterials: 1,
    },
  },
];
