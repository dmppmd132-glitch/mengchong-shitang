import { CollectionBadge, TitleId } from '../../types';

export const COLLECTION_BADGES: CollectionBadge[] = [
  {
    id: 'badge_collection_10',
    name: '初入圖鑑館',
    emoji: '🌱',
    description: '邁開萌寵收集冊第一步，已收錄超過 10% 的珍貴項目！',
    unlockCondition: '總收集進度達到 10%',
  },
  {
    id: 'badge_collection_50',
    name: '半程彩虹行者',
    emoji: '🌈',
    description: '總收集度突破 50%，彩虹小徑已在你的攝影棚閃耀！',
    unlockCondition: '總收集進度達到 50%',
  },
  {
    id: 'badge_collection_100',
    name: '傳說圓滿殿堂',
    emoji: '🏆',
    description: '全圖鑑 100% 收集達成，萌寵食堂最高榮譽收藏家！',
    unlockCondition: '總收集進度達到 100%',
  },
  {
    id: 'badge_pets_master',
    name: '六萌寵大家庭',
    emoji: '🐾',
    description: '小豬、兔子、小狗、小貓、小鴨與小倉鼠全部齊聚一堂！',
    unlockCondition: '寵物圖鑑 100%',
    categoryId: 'pets',
  },
  {
    id: 'badge_foods_master',
    name: '全食譜美食家',
    emoji: '🍽️',
    description: '收錄每一道料理、零食與節日限定佳餚！',
    unlockCondition: '食物圖鑑 100%',
    categoryId: 'foods',
  },
  {
    id: 'badge_fashion_master',
    name: '百變穿搭時尚賞',
    emoji: '👑',
    description: '收集全配件圖鑑，打造食堂最閃耀的造型衣櫥！',
    unlockCondition: '配件圖鑑達到 80% 以上',
    categoryId: 'accessories',
  },
  {
    id: 'badge_sets_3',
    name: '套裝連鎖收藏家',
    emoji: '👗',
    description: '至少集齊 3 套主題穿搭套裝並開啟進階連鎖預覽！',
    unlockCondition: '完成 3 套以上主題穿搭套裝',
    categoryId: 'sets',
  },
  {
    id: 'badge_house_master',
    name: '暖心空間設計師',
    emoji: '🛋️',
    description: '用心打造理想小屋與庭院，收集多數家具與裝潢！',
    unlockCondition: '房間圖鑑達到 60% 以上',
    categoryId: 'room',
  },
  {
    id: 'badge_town_explorer',
    name: '小鎮好鄰居勳章',
    emoji: '🗺️',
    description: '探索小鎮據點並與 8 位以上小鎮與庭院訪客建立回憶！',
    unlockCondition: '解鎖 8 位以上訪客朋友',
    categoryId: 'visitors',
  },
  {
    id: 'badge_studio_director',
    name: '攝影棚金鏡頭',
    emoji: '📸',
    description: '收集超過 60% 攝影棚姿勢、背景、濾鏡、相框與貼圖！',
    unlockCondition: '攝影圖鑑達到 60% 以上',
    categoryId: 'studio',
  },
];

export interface CollectionTitleGroup {
  id: string;
  label: string;
  emoji: string;
  titleIds: TitleId[];
}

export const COLLECTION_TITLE_GROUPS: CollectionTitleGroup[] = [
  {
    id: 'collection_core',
    label: '圖鑑核心稱號',
    emoji: '📚',
    titleIds: [
      'pet_collector',
      'gourmet_owner',
      'fashion_stylist',
      'house_designer',
      'town_farmer',
      'town_host_title',
      'town_explorer',
      'fashion_photographer',
      'memory_collector',
      'collection_master',
    ],
  },
  {
    id: 'outfit_sets',
    label: '穿搭與小屋套裝稱號',
    emoji: '👗',
    titleIds: [
      'berry_sweetheart',
      'forest_explorer',
      'cloud_dreamer',
      'little_master_chef',
      'starlight_voyager',
      'party_superstar',
      'strawberry_dreamer',
      'forest_camper',
      'cloud_napper',
    ],
  },
  {
    id: 'growth_town_coop',
    label: '成長、訪客與活動稱號',
    emoji: '🌟',
    titleIds: [
      'growth_sprout',
      'growth_chubby',
      'growth_radiant',
      'growth_superstar',
      'recipe_master',
      'bird_whisperer',
      'squirrel_friend',
      'rabbit_guardian',
      'yard_host_master',
      'acorn_forest_ranger',
      'lakeside_angler',
      'town_market_vip',
      'strawberry_sweetheart_title',
      'strawberry_fashionista',
      'coop_partner',
      'coop_best_host',
      'birthday_superstar',
      'best_birthday_partner',
    ],
  },
];
