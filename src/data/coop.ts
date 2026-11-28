import {
  CoopBadgeId,
  CoopGoal,
  CoopMessageCard,
  CoopReward,
  IngredientId,
  ThemeSetId,
} from '../types';

export interface CoopRoomThemeTemplate {
  themeId: ThemeSetId;
  name: string;
  emoji: string;
  badgeClass: string;
  description: string;
  targetItemCount: number;
  durationSeconds: number;
  eligibleItemIds: string[];
}

export const COOP_ROOM_THEMES: CoopRoomThemeTemplate[] = [
  {
    themeId: 'strawberry_sweet',
    name: '草莓甜心派對',
    emoji: '🍓',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
    description: '攜手把粉嫩草莓家具與可愛抱枕擺進正確區域，打造甜點小屋！',
    targetItemCount: 6,
    durationSeconds: 90,
    eligibleItemIds: [
      'strawberry_lace_bed',
      'fluffy_cotton_pillow',
      'strawberry_bow_rug',
      'toy_throw_pillow',
      'strawberry_heart_mat',
      'bakery_snack_rack',
      'strawberry_cafe_art',
      'sunflower_vase',
    ],
  },
  {
    themeId: 'forest_camp',
    name: '森林露營基地',
    emoji: '⛺',
    badgeClass: 'bg-[#E6F8F0] border-[#A7DFC6] text-[#1F6B54]',
    description: '一人挑選露營裝備、一人擺入對應角落，90 秒佈置出祕密營地！',
    targetItemCount: 6,
    durationSeconds: 90,
    eligibleItemIds: [
      'wood_cozy_bed',
      'forest_plaid_blanket',
      'forest_woven_rug',
      'toy_mini_tent',
      'camp_picnic_table',
      'oak_snack_table',
      'camp_lantern_lights',
      'camp_trail_sign',
    ],
  },
  {
    themeId: 'cloud_nap',
    name: '雲朵午睡夢境',
    emoji: '☁️',
    badgeClass: 'bg-[#EEF4FF] border-[#BCD2FA] text-[#355A9C]',
    description: '蒐集鬆軟雲朵床、舒眠枕與星星燈串，合力佈置超治癒午睡房！',
    targetItemCount: 6,
    durationSeconds: 90,
    eligibleItemIds: [
      'cloud_big_bed',
      'cloud_puff_pillow',
      'cloud_star_ball',
      'toy_rainbow_ball',
      'cloud_dessert_tower',
      'gingham_placemat',
      'cloud_gauze_curtain',
      'warm_star_lights',
    ],
  },
];

export const COOP_FARM_DAILY_ORDERS: CoopGoal[] = [
  {
    id: 'order_pudding_fruit',
    gameType: 'farm_relay',
    title: '今日接力：完成 2 份焦糖布丁與 1 份水果盒',
    description: '農夫負責種植採收玉米、草莓與紅蘿蔔進共同倉庫，主廚在廚房合力合成料理！',
    requiredFoodCounts: {
      caramel_pudding: 2,
      fruit_box: 1,
    },
    requiredHarvestTotal: 4,
    requiredCraftTotal: 3,
  },
  {
    id: 'order_salad_cookie',
    gameType: 'farm_relay',
    title: '今日接力：完成 2 份紅蘿蔔沙拉與 1 份草莓脆餅',
    description: '一起收成清脆紅蘿蔔、玉米與草莓存入共同倉庫，完成營養滿分下午茶！',
    requiredFoodCounts: {
      carrot_salad: 2,
      butter_cookie: 1,
    },
    requiredHarvestTotal: 4,
    requiredCraftTotal: 3,
  },
  {
    id: 'order_soup_tart',
    gameType: 'farm_relay',
    title: '今日接力：完成 1 份南瓜濃湯與 2 份藍莓卡士達塔',
    description: '種植金黃南瓜、玉米與香甜藍莓，攜手完成夢幻烘焙訂單！',
    requiredFoodCounts: {
      pumpkin_soup: 1,
      blueberry_tart: 2,
    },
    requiredHarvestTotal: 4,
    requiredCraftTotal: 3,
  },
  {
    id: 'order_parfait_bento',
    gameType: 'farm_relay',
    title: '今日接力：完成 2 份薄荷鮮果聖代與 1 份向日葵餐盒',
    description: '把薄荷、藍莓與向日葵送進共同倉庫，接力端出元氣滿點特餐！',
    requiredFoodCounts: {
      mint_parfait: 2,
      sunflower_bento: 1,
    },
    requiredHarvestTotal: 4,
    requiredCraftTotal: 3,
  },
];

export interface CoopBadgeDefinition {
  id: CoopBadgeId;
  name: string;
  emoji: string;
  description: string;
  conditionText: string;
  badgeClass: string;
}

export const COOP_BADGES: Record<CoopBadgeId, CoopBadgeDefinition> = {
  best_partner: {
    id: 'best_partner',
    name: '最佳搭檔',
    emoji: '🤝',
    description: '連續 3 天攜手完成共養合作遊戲的閃耀紀念徽章！',
    conditionText: '連續 3 天完成合作遊戲',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
  },
  room_stylist: {
    id: 'room_stylist',
    name: '空間設計師',
    emoji: '🏡',
    description: '兩人默契滿分，在 90 秒內聯手完成「一起布置房間」！',
    conditionText: '完成任一場「一起布置房間」',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
  farm_relay_master: {
    id: 'farm_relay_master',
    name: '豐收接力隊',
    emoji: '🌾',
    description: '共同耕作並接力下廚，順利完成「農場訂單接力」！',
    conditionText: '完成任一次「農場訂單接力」',
    badgeClass: 'bg-[#E6F8F0] border-[#A7DFC6] text-[#1F6B54]',
  },
  town_host: {
    id: 'town_host',
    name: '小鎮招待員',
    emoji: '🏡',
    description: '連續 3 天與夥伴共同招待來訪的庭院小動物，小鎮人見人愛！',
    conditionText: '連續 3 天完成共養共同訪客',
    badgeClass: 'bg-[#FFF0F6] border-[#F4B4CB] text-[#B83B64]',
  },
  best_outfit_partner: {
    id: 'best_outfit_partner',
    name: '最佳穿搭搭檔',
    emoji: '👯',
    description: '連續 3 週一起完成共養雙人穿搭合照挑戰，兩人品味完全合拍！',
    conditionText: '連續 3 週完成共養雙人合照挑戰',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
  strawberry_sweetheart_partner: {
    id: 'strawberry_sweetheart_partner',
    name: '草莓甜心搭檔',
    emoji: '🍓',
    description: '連續 3 天攜手完成草莓派對合作任務，一起採草莓、烤點心與拍野餐照！',
    conditionText: '草莓季連續 3 天完成「草莓派對」共養合作任務',
    badgeClass: 'bg-[#FFE8F0] border-[#F29AB8] text-[#C43463]',
  },
  town_explore_partner: {
    id: 'town_explore_partner',
    name: '小鎮探險搭檔',
    emoji: '🧭',
    description: '連續 3 天與共養夥伴前往橡果森林野餐或湖邊釣魚，小鎮的每個角落都有你們的腳印！',
    conditionText: '連續 3 天完成小鎮地圖「共養探索」合作任務',
    badgeClass: 'bg-[#E6F8EE] border-[#8BD7B3] text-[#1D6B4F]',
  },
  birthday_party_partner: {
    id: 'birthday_party_partner',
    name: '生日派對搭檔',
    emoji: '🎂',
    description: '連續 3 次與共養夥伴一起做蛋糕、佈置房間、拍合照與寫賀卡！',
    conditionText: '連續完成 3 次共養生日任務',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
  photo_partner: {
    id: 'photo_partner',
    name: '攝影搭檔',
    emoji: '📸',
    description: '連續 3 週攜手完成共養攝影比賽穿搭、佈置、投票與提交作品！',
    conditionText: '連續 3 週完成共養攝影比賽任務',
    badgeClass: 'bg-[#FFF3D8] border-[#E8AE38] text-[#8A520E]',
  },
};

export const COOP_MESSAGE_CARD_TEMPLATES: Omit<
  CoopMessageCard,
  'id' | 'earnedDate' | 'createdAt'
>[] = [
  {
    title: '甜心接力感謝卡',
    body: '謝謝你一起把食材種得又香又甜，今天的萌寵餐桌充滿了幸福！',
    emoji: '🍮',
  },
  {
    title: '晴空共耕紀念卡',
    body: '一人採收、一人掌廚，這就是全世界最有默契的萌寵食堂搭檔！',
    emoji: '🌻',
  },
  {
    title: '星光夜話留言卡',
    body: '忙碌一天後還能一起在小屋收成與做點心，是我最喜歡的小確幸。',
    emoji: '💌',
  },
];

export const COOP_RARE_INGREDIENT_POOL: IngredientId[] = [
  'blueberry',
  'mint',
  'sunflower',
  'moon_wheat',
  'dream_cocoa',
];

export function buildRoomDecorReward(
  completedCount: number,
  targetCount: number,
  themeName: string
): Omit<CoopReward, 'id' | 'claimedByUserIds' | 'createdAt'> {
  const ratio = targetCount > 0 ? Math.min(1, completedCount / targetCount) : 0;
  const fullClear = completedCount >= targetCount && targetCount > 0;
  const coins = fullClear ? 110 : Math.max(20, Math.round(80 * ratio));
  const furnitureShards = fullClear ? 6 : Math.max(1, Math.round(4 * ratio));
  const intimacy = fullClear ? 6 : Math.max(1, Math.round(4 * ratio));

  return {
    gameType: 'room_decor',
    title: fullClear
      ? `完美佈置「${themeName}」合作獎勵`
      : `「${themeName}」合作佈置參與獎勵`,
    coins,
    furnitureShards,
    intimacy,
    rareIngredients: {},
    badgeId: fullClear ? 'room_stylist' : undefined,
  };
}

export function buildFarmRelayReward(
  orderTitle: string,
  dayIndex: number
): Omit<CoopReward, 'id' | 'claimedByUserIds' | 'createdAt'> {
  const card =
    COOP_MESSAGE_CARD_TEMPLATES[
      Math.abs(dayIndex) % COOP_MESSAGE_CARD_TEMPLATES.length
    ];
  const rareId =
    COOP_RARE_INGREDIENT_POOL[
      Math.abs(dayIndex) % COOP_RARE_INGREDIENT_POOL.length
    ];

  return {
    gameType: 'farm_relay',
    title: `${orderTitle} 完成獎勵`,
    coins: 120,
    furnitureShards: 4,
    intimacy: 6,
    rareIngredients: {
      [rareId]: 2,
      strawberry: 1,
    },
    badgeId: 'farm_relay_master',
    messageCardTitle: card.title,
    messageCardBody: card.body,
  };
}
