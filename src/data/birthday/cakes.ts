import {
  BirthdayCakeBase,
  BirthdayCakeCream,
  BirthdayCakeDecor,
  BirthdayCakeDefinition,
  BirthdayCakeId,
  IngredientId,
} from '../../types';

export const BIRTHDAY_CAKES: BirthdayCakeDefinition[] = [
  {
    id: 'strawberry_cream_cake',
    name: '草莓奶油蛋糕',
    emoji: '🍰',
    description: '新鮮草莓搭配綿密鮮奶油與細砂糖，最經典的甜美生日蛋糕！',
    moodBonus: 20,
    intimacyBonus: 5,
    hungerBonus: 24,
    growthBonus: 24,
    weightGain: 0.2,
    roundnessBonus: 4,
    price: 52,
    defaultBase: 'sponge',
    defaultCream: 'strawberry',
    defaultDecors: ['strawberry', 'candle'],
    recipeIngredients: { strawberry: 2 },
    pantryCost: { cream: 1, sugar: 1, iceCream: 0 },
  },
  {
    id: 'chocolate_cake',
    name: '巧克力蛋糕',
    emoji: '🍫',
    description: '晚安可可烘焙出的濃醇戚風蛋糕，香氣滿滿幸福感十足！',
    moodBonus: 20,
    intimacyBonus: 5,
    hungerBonus: 24,
    growthBonus: 24,
    weightGain: 0.2,
    roundnessBonus: 4,
    price: 54,
    defaultBase: 'chocolate',
    defaultCream: 'chocolate',
    defaultDecors: ['heart', 'candle'],
    recipeIngredients: { dream_cocoa: 2 },
    pantryCost: { cream: 1, sugar: 1, iceCream: 0 },
  },
  {
    id: 'fruit_cake',
    name: '水果蛋糕',
    emoji: '🧁',
    description: '嚴選 2 份水果食材搭配柔滑鮮奶油，繽紛果香慶祝專屬派對！',
    moodBonus: 20,
    intimacyBonus: 5,
    hungerBonus: 22,
    growthBonus: 24,
    weightGain: 0.2,
    roundnessBonus: 4,
    price: 52,
    defaultBase: 'sponge',
    defaultCream: 'vanilla',
    defaultDecors: ['sprinkles', 'flags'],
    recipeIngredients: {},
    requiresFruitChoice: true,
    pantryCost: { cream: 1, sugar: 1, iceCream: 0 },
  },
  {
    id: 'carrot_cake',
    name: '胡蘿蔔蛋糕',
    emoji: '🥕',
    description: '清甜紅蘿蔔揉進溫潤海綿蛋糕，兔兔與萌寵們都超喜歡的派對口味！',
    moodBonus: 20,
    intimacyBonus: 5,
    hungerBonus: 24,
    growthBonus: 24,
    weightGain: 0.1,
    roundnessBonus: 3,
    price: 48,
    defaultBase: 'carrot',
    defaultCream: 'vanilla',
    defaultDecors: ['candle', 'flags'],
    recipeIngredients: { carrot: 2 },
    pantryCost: { cream: 1, sugar: 1, iceCream: 0 },
  },
  {
    id: 'ice_cream_cake',
    name: '冰淇淋蛋糕',
    emoji: '🍨',
    description: '雙倍冰淇淋層疊鮮奶油與細砂糖，清涼甜蜜讓快樂大爆發！',
    moodBonus: 25,
    intimacyBonus: 8,
    hungerBonus: 22,
    growthBonus: 30,
    weightGain: 0.2,
    roundnessBonus: 4,
    price: 68,
    defaultBase: 'ice_cream',
    defaultCream: 'mint',
    defaultDecors: ['sprinkles', 'heart', 'candle'],
    recipeIngredients: {},
    pantryCost: { cream: 1, sugar: 1, iceCream: 2 },
  },
  {
    id: 'birthday_limited_cake',
    name: '生日限定蛋糕',
    emoji: '🎂',
    description: '集結草莓、晚安可可與雙層星光糖霜的豪華限定雙層生日大蛋糕！',
    moodBonus: 30,
    intimacyBonus: 10,
    hungerBonus: 32,
    growthBonus: 38,
    weightGain: 0.2,
    roundnessBonus: 5,
    price: 88,
    defaultBase: 'sponge',
    defaultCream: 'strawberry',
    defaultDecors: ['strawberry', 'candle', 'sprinkles', 'flags', 'heart'],
    recipeIngredients: { strawberry: 1, dream_cocoa: 1 },
    pantryCost: { cream: 1, sugar: 1, iceCream: 0 },
    limitedTicketUnlock: 80,
  },
];

export const BIRTHDAY_CAKE_BY_ID: Record<BirthdayCakeId, BirthdayCakeDefinition> =
  BIRTHDAY_CAKES.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<BirthdayCakeId, BirthdayCakeDefinition>);

export const FRUIT_CAKE_INGREDIENT_IDS: IngredientId[] = [
  'apple',
  'blueberry',
  'watermelon',
  'snowberry',
  'strawberry',
];

export const BIRTHDAY_PANTRY_SHOP = [
  {
    id: 'cream' as const,
    name: '鮮奶油',
    emoji: '🥛',
    priceCoins: 18,
    description: '打發得蓬鬆綿密的烘焙奶油，做生日蛋糕的必備基底！',
  },
  {
    id: 'sugar' as const,
    name: '細砂糖',
    emoji: '🍬',
    priceCoins: 12,
    description: '如雪花般細緻的烘焙糖霜，替蛋糕添上剛好的溫柔甜味。',
  },
  {
    id: 'iceCream' as const,
    name: '香草冰淇淋磚',
    emoji: '🍨',
    priceCoins: 25,
    description: '冰涼滑順的雙色冰淇淋基底，專屬製作冰淇淋蛋糕。',
  },
];

export const BIRTHDAY_CAKE_BASE_OPTIONS: Array<{
  id: BirthdayCakeBase;
  label: string;
  emoji: string;
  bodyColor: string;
  shadeColor: string;
}> = [
  { id: 'sponge', label: '海綿蛋糕', emoji: '🍰', bodyColor: '#FDE4AF', shadeColor: '#F2C77E' },
  { id: 'chocolate', label: '巧克力蛋糕', emoji: '🍫', bodyColor: '#7C4B38', shadeColor: '#5C3426' },
  { id: 'carrot', label: '紅蘿蔔蛋糕', emoji: '🥕', bodyColor: '#F6B47B', shadeColor: '#DB8E51' },
  { id: 'ice_cream', label: '冰淇淋蛋糕', emoji: '🍨', bodyColor: '#CBEFFF', shadeColor: '#99D8FA' },
];

export const BIRTHDAY_CAKE_CREAM_OPTIONS: Array<{
  id: BirthdayCakeCream;
  label: string;
  emoji: string;
  frostingColor: string;
  highlightColor: string;
}> = [
  { id: 'strawberry', label: '草莓奶油', emoji: '🍓', frostingColor: '#FFBDD4', highlightColor: '#FFE8F1' },
  { id: 'vanilla', label: '香草奶油', emoji: '🌼', frostingColor: '#FFF8E8', highlightColor: '#FFFFFF' },
  { id: 'chocolate', label: '巧克力奶油', emoji: '🍫', frostingColor: '#A96B52', highlightColor: '#CD937A' },
  { id: 'mint', label: '薄荷奶油', emoji: '🌿', frostingColor: '#B8F2DF', highlightColor: '#E6FCF5' },
];

export const BIRTHDAY_CAKE_DECOR_OPTIONS: Array<{
  id: BirthdayCakeDecor;
  label: string;
  emoji: string;
}> = [
  { id: 'strawberry', label: '草莓', emoji: '🍓' },
  { id: 'candle', label: '蠟燭', emoji: '🕯️' },
  { id: 'sprinkles', label: '糖珠', emoji: '✨' },
  { id: 'flags', label: '小旗子', emoji: '🚩' },
  { id: 'heart', label: '愛心', emoji: '🩷' },
];
