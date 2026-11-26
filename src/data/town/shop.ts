import { TownShopItem } from '../../types';

export const TOWN_SHOP_ITEMS: TownShopItem[] = [
  {
    id: 'shop_forest_filter',
    name: '森林濾鏡',
    emoji: '🌲',
    description: '為照片疊上透亮翠綠林蔭光斑，森系攝影必備質感濾鏡！',
    category: 'filter',
    targetId: 'forest_filter',
    ticketPrice: 120,
    locationLabel: '橡果森林系列',
  },
  {
    id: 'shop_lake_aqua',
    name: '湖邊水藍濾鏡',
    emoji: '💧',
    description: '清透冰藍與水波反光調色，一鍵拍出湖畔夏日清涼感。',
    category: 'filter',
    targetId: 'lake_aqua',
    ticketPrice: 120,
    locationLabel: '湖邊公園系列',
  },
  {
    id: 'shop_market_warm_sun',
    name: '市集暖陽濾鏡',
    emoji: '🏮',
    description: '如市集暖黃燈串般的金橘柔光，讓美食與穿搭都更有故事感！',
    category: 'filter',
    targetId: 'market_warm_sun',
    ticketPrice: 120,
    locationLabel: '小鎮市集系列',
  },
  {
    id: 'shop_forest_cabin',
    name: '森林木屋背景',
    emoji: '🪵',
    description: '被松樹與暖陽包圍的原木小木屋寫真棚景，跟小鹿和松鼠超搭！',
    category: 'background',
    targetId: 'forest_cabin',
    ticketPrice: 180,
    locationLabel: '橡果森林系列',
  },
  {
    id: 'shop_lakeside_sunset',
    name: '湖邊黃昏背景',
    emoji: '🌇',
    description: '染上粉橘暮色的寧靜水岸與木棧橋，浪漫氛圍滿分。',
    category: 'background',
    targetId: 'lakeside_sunset',
    ticketPrice: 180,
    locationLabel: '湖邊公園系列',
  },
  {
    id: 'shop_market_night',
    name: '市集夜晚背景',
    emoji: '🏮',
    description: '華燈初上的小鎮木攤市集夜景，暖暖燈籠與微光寫真最出片！',
    category: 'background',
    targetId: 'market_night',
    ticketPrice: 180,
    locationLabel: '小鎮市集系列',
  },
  {
    id: 'shop_town_deer_antlers',
    name: '森林小鹿配件',
    emoji: '🦌',
    description: '點綴小嫩芽與金色小漿果的木質小鹿角頭飾，森系可愛滿分！',
    category: 'accessory',
    targetId: 'town_deer_antlers',
    ticketPrice: 250,
    locationLabel: '橡果森林系列',
  },
  {
    id: 'shop_town_duck_hat',
    name: '湖邊小鴨配件',
    emoji: '🦆',
    description: '鵝黃圓滾滾小鴨造型漁夫帽，戴上立刻想去湖邊戲水！',
    category: 'accessory',
    targetId: 'town_duck_hat',
    ticketPrice: 250,
    locationLabel: '湖邊公園系列',
  },
  {
    id: 'shop_town_fox_tail',
    name: '市集小狐狸配件',
    emoji: '🦊',
    description: '白尖澎軟赤狐大尾巴背部配件，轉側面拍照超級蓬鬆迷人！',
    category: 'accessory',
    targetId: 'town_fox_tail',
    ticketPrice: 250,
    locationLabel: '小鎮市集系列',
  },
  {
    id: 'shop_town_explorer_title',
    name: '小鎮探險家稱號',
    emoji: '🧭',
    description: '象徵走遍小鎮每個角落並與動物朋友結緣的榮譽稱號「小鎮探險家」！',
    category: 'title',
    targetId: 'town_explorer',
    ticketPrice: 400,
    locationLabel: '全小鎮榮譽稱號',
  },
];

export const TOWN_SHOP_ITEM_BY_ID: Record<string, TownShopItem> = TOWN_SHOP_ITEMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<string, TownShopItem>
);

export const TOWN_MARKET_FURNITURE_IDS = [
  'market_acorn_stall',
  'market_lantern_stand',
  'market_flower_cart',
] as const;

export type TownMarketFurnitureId = (typeof TOWN_MARKET_FURNITURE_IDS)[number];
