import { IngredientId, SeasonCrop, SeasonId } from '../../types';

export const SEASON_CROPS: SeasonCrop[] = [
  // Spring
  {
    id: 'carrot',
    name: '紅蘿蔔',
    emoji: '🥕',
    primarySeason: 'spring',
    weatherBonusTags: ['春季 +10% 速度', '小兔最愛'],
    description: '春季當季脆甜紅蘿蔔，春陽下長得又快又甜！',
  },
  {
    id: 'strawberry',
    name: '草莓',
    emoji: '🍓',
    primarySeason: 'spring',
    weatherBonusTags: ['春季 +10% 速度', '野餐祭熱門'],
    description: '春季當季鮮採草莓，粉紅香氣迷倒所有小鎮朋友。',
  },
  {
    id: 'mint',
    name: '薄荷',
    emoji: '🌿',
    primarySeason: 'spring',
    weatherBonusTags: ['春季 +10% 速度', '清涼料理必備'],
    description: '春季嫩綠薄荷葉，做成沙拉或冰沙超清爽。',
  },
  // Summer
  {
    id: 'corn',
    name: '玉米',
    emoji: '🌽',
    primarySeason: 'summer',
    weatherBonusTags: ['夏季 +10% 速度', '陽光甜脆'],
    description: '夏季陽光照射下金黃飽滿的甜玉米！',
  },
  {
    id: 'watermelon',
    name: '西瓜',
    emoji: '🍉',
    primarySeason: 'summer',
    weatherBonusTags: ['夏季 +10% 速度', '炎熱消暑聖品'],
    description: '夏季限定多汁大西瓜，炎熱天氣打成西瓜冰沙最受歡迎！',
  },
  {
    id: 'sunflower',
    name: '向日葵',
    emoji: '🌻',
    primarySeason: 'summer',
    weatherBonusTags: ['夏季 +10% 速度', '晴天元氣'],
    description: '追隨夏陽綻放的向日葵，葵花籽烤成餅乾香酥迷人。',
  },
  // Autumn
  {
    id: 'pumpkin',
    name: '南瓜',
    emoji: '🎃',
    primarySeason: 'autumn',
    weatherBonusTags: ['秋季 +10% 速度', '豐收招牌'],
    description: '秋季圓滾滾金黃南瓜，煮濃湯或烤南瓜派都滿分。',
  },
  {
    id: 'apple',
    name: '蘋果',
    emoji: '🍎',
    primarySeason: 'autumn',
    weatherBonusTags: ['秋季 +10% 速度', '甜香酥派'],
    description: '秋風吹紅的爽脆小蘋果，最適合烘焙焦糖肉桂蘋果派！',
  },
  {
    id: 'mushroom',
    name: '蘑菇',
    emoji: '🍄',
    primarySeason: 'autumn',
    weatherBonusTags: ['秋季 +10% 速度', '雨天偏愛'],
    description: '秋日林間小蘑菇，帶點森林濕潤香氣，煮湯超鮮美。',
  },
  // Winter
  {
    id: 'white_radish',
    name: '白蘿蔔',
    emoji: '🥬',
    primarySeason: 'winter',
    coldHardy: true,
    weatherBonusTags: ['冬季 +10% 速度', '耐寒（下雪仍生長）'],
    description: '越冷越甜的冬季白蘿蔔，下雪天也能繼續茁壯！',
  },
  {
    id: 'winter_greens',
    name: '冬菜',
    emoji: '🥬',
    primarySeason: 'winter',
    coldHardy: true,
    weatherBonusTags: ['冬季 +10% 速度', '耐寒（下雪仍生長）'],
    description: '寒冬裡依然翠綠柔嫩的冬菜，熬暖暖蔬菜湯必備。',
  },
  {
    id: 'snowberry',
    name: '雪莓',
    emoji: '🫐',
    primarySeason: 'winter',
    coldHardy: true,
    weatherBonusTags: ['冬季 +10% 速度', '下雪專屬珍果'],
    description: '只在冬雪氣息中結出晶瑩白粉果實的夢幻雪莓！',
  },
];

export const SEASON_CROP_BY_ID: Partial<Record<IngredientId, SeasonCrop>> =
  Object.fromEntries(SEASON_CROPS.map((c) => [c.id, c]));

export const SEASON_CROPS_BY_SEASON: Record<SeasonId, IngredientId[]> = {
  spring: ['carrot', 'strawberry', 'mint'],
  summer: ['corn', 'watermelon', 'sunflower'],
  autumn: ['pumpkin', 'apple', 'mushroom'],
  winter: ['white_radish', 'winter_greens', 'snowberry'],
};

export const COLD_HARDY_CROP_IDS = new Set<IngredientId>(
  SEASON_CROPS.filter((c) => c.coldHardy).map((c) => c.id)
);

export function getCropPrimarySeason(cropId: IngredientId): SeasonId | null {
  return SEASON_CROP_BY_ID[cropId]?.primarySeason ?? null;
}

export function isCropInSeason(cropId: IngredientId, seasonId: SeasonId): boolean {
  const primary = getCropPrimarySeason(cropId);
  if (!primary) return true; // all-season crops (blueberry, moon_wheat, dream_cocoa)
  return primary === seasonId;
}
