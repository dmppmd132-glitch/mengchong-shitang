import { CropPlot, IngredientId, IngredientInfo, KitchenRecipe } from '../types';

export const INGREDIENT_IDS: IngredientId[] = ['carrot', 'corn', 'strawberry'];

export const INGREDIENTS: Record<IngredientId, IngredientInfo> = {
  carrot: {
    id: 'carrot',
    name: '紅蘿蔔',
    emoji: '🥕',
    growSeconds: 15,
    seedCost: 4,
    harvestYield: 2,
    description: '清脆多汁的有機紅蘿蔔，小兔最愛的健康食材。',
  },
  corn: {
    id: 'corn',
    name: '玉米',
    emoji: '🌽',
    growSeconds: 20,
    seedCost: 5,
    harvestYield: 2,
    description: '金黃香甜的玉米粒，適合做成綿密布丁與點心。',
  },
  strawberry: {
    id: 'strawberry',
    name: '草莓',
    emoji: '🍓',
    growSeconds: 25,
    seedCost: 6,
    harvestYield: 2,
    description: '酸甜多汁的鮮採草莓，做水果盒不可或缺！',
  },
};

export const KITCHEN_RECIPES: KitchenRecipe[] = [
  {
    id: 'recipe_pudding',
    outputFoodId: 'caramel_pudding',
    name: '手作焦糖布丁',
    emoji: '🍮',
    description: '用香甜玉米與紅蘿蔔慢火熬出天然甜香布丁！',
    ingredients: {
      corn: 2,
      carrot: 1,
    },
    bonusGrowth: 6,
  },
  {
    id: 'recipe_fruit_box',
    outputFoodId: 'fruit_box',
    name: '鮮果水果盒',
    emoji: '🍓',
    description: '現採草莓搭配脆甜紅蘿蔔丁，清爽又繽紛！',
    ingredients: {
      strawberry: 2,
      carrot: 1,
    },
    bonusGrowth: 8,
  },
  {
    id: 'recipe_carrot_salad',
    outputFoodId: 'carrot_salad',
    name: '鮮採紅蘿蔔沙拉',
    emoji: '🥗',
    description: '現摘紅蘿蔔加上甜玉米粒，脆口滿分。',
    ingredients: {
      carrot: 2,
      corn: 1,
    },
    bonusGrowth: 6,
  },
  {
    id: 'recipe_cookie',
    outputFoodId: 'butter_cookie',
    name: '草莓玉米脆餅',
    emoji: '🍪',
    description: '烤得金黃酥脆的草莓風味手工小餅乾。',
    ingredients: {
      corn: 2,
      strawberry: 1,
    },
    bonusGrowth: 5,
  },
];

export function createInitialIngredients(): Record<IngredientId, number> {
  return {
    carrot: 2,
    corn: 2,
    strawberry: 2,
  };
}

export function createInitialFarmPlots(): CropPlot[] {
  return [
    { id: 0, cropId: null, plantedAt: null, durationMs: 0 },
    { id: 1, cropId: null, plantedAt: null, durationMs: 0 },
    { id: 2, cropId: null, plantedAt: null, durationMs: 0 },
    { id: 3, cropId: null, plantedAt: null, durationMs: 0 },
  ];
}

export function getIngredientInfo(id: IngredientId): IngredientInfo {
  return INGREDIENTS[id];
}
