import {
  ActiveTownLocationId,
  TownLocationDefinition,
  TownLocationId,
  VisitorHutFacility,
  VisitorHutFacilityId,
  VisitorHutLevelInfo,
} from '../../types';

export const ACTIVE_TOWN_LOCATION_IDS: ActiveTownLocationId[] = [
  'home_yard',
  'acorn_forest',
  'lake_park',
  'town_market',
];

export const TOWN_LOCATIONS: TownLocationDefinition[] = [
  {
    id: 'home_yard',
    name: '自家庭院',
    subtitle: '溫暖起點・小木屋前庭',
    emoji: '🏡',
    themeGradient: 'from-[#E9F9EE] via-[#F7FBF2] to-[#FFF6E6]',
    badgeClass: 'bg-[#E6F8EE] border-[#9ADBC0] text-[#1F6B54]',
    description:
      '陽光灑在花圃與訪客小屋前，這裡是旅途的起點，經常飛來小鳥、松鼠、小兔子，幸運的話還會遇見閃閃發亮的蝴蝶！',
    unlockConditionLabel: '預設解鎖',
    commonVisitorIds: ['bird', 'squirrel', 'rabbit'],
    rareVisitorIds: ['butterfly'],
    rewardHighlights: ['小鎮券 3～5 張', '攝影材料', '庭院專屬寫真框', '高好感稀有花種'],
    recommendedBackgroundIds: ['pink_room', 'strawberry_field', 'cloud_sky'],
    recommendedFilterIds: ['cream', 'pink', 'mint'],
    recommendedFrameIds: ['rounded', 'heart', 'star'],
  },
  {
    id: 'acorn_forest',
    name: '橡果森林',
    subtitle: '落葉小徑・栗香營地',
    emoji: '🌲',
    themeGradient: 'from-[#E7F4E4] via-[#F4F8EA] to-[#FAECD8]',
    badgeClass: 'bg-[#E9F6E8] border-[#9CCFA5] text-[#226142]',
    description:
      '穿過橡樹林道就能聽見松果落地的清脆聲響！在這裡可以採集森林橡果，與刺蝟和小鹿拍照，也能進行「森林野餐」共養探索。',
    unlockConditionLabel: '完成新手 7 天成長之路 或 寵物達 Lv.2',
    commonVisitorIds: ['squirrel', 'bird', 'hedgehog'],
    rareVisitorIds: ['deer'],
    rewardHighlights: ['森林橡果採集', '小鎮券 3～5 張', '相框與濾鏡碎片', '森林寫真景致'],
    recommendedBackgroundIds: ['forest_cabin', 'acorn_trail'],
    recommendedFilterIds: ['forest_warm_sun', 'morning_glow', 'forest_filter'],
    recommendedFrameIds: ['acorn_frame', 'feather_frame'],
  },
  {
    id: 'lake_park',
    name: '湖邊公園',
    subtitle: '微風棧橋・粼粼水岸',
    emoji: '🏞️',
    themeGradient: 'from-[#E1F3FF] via-[#EFF9FF] to-[#E6F8F2]',
    badgeClass: 'bg-[#E5F4FF] border-[#98D1F5] text-[#1D5C8A]',
    description:
      '晴空倒映在清澈湖面上，可以體驗悠閒釣魚小遊戲、陪小鴨戲水與拍湖畔美照，還能開啟「湖邊釣魚」共養探索任務！',
    unlockConditionLabel: '寵物達 Lv.3 解鎖',
    commonVisitorIds: ['duck', 'bird', 'frog'],
    rareVisitorIds: ['otter'],
    rewardHighlights: ['湖邊釣魚小遊戲', '小鎮券 3～5 張', '水岸相框與濾鏡碎片', '稀有水獺見面'],
    recommendedBackgroundIds: ['lakeside_sunset', 'waterfront_bridge'],
    recommendedFilterIds: ['lake_aqua', 'lakeside_breeze'],
    recommendedFrameIds: ['waterdrop_frame', 'duck_frame'],
  },
  {
    id: 'town_market',
    name: '小鎮市集',
    subtitle: '暖燈木攤・熱鬧街角',
    emoji: '🏮',
    themeGradient: 'from-[#FFF1DB] via-[#FFF7EB] to-[#FFE7EC]',
    badgeClass: 'bg-[#FFF3DC] border-[#F0CA82] text-[#8B5212]',
    description:
      '點亮暖黃燈串的熱鬧街角，可以交付拿手料理換取小鎮券與小費、選購專屬市集限定家具，說不定還能遇見神出鬼沒的小狐狸！',
    unlockConditionLabel: '寵物達 Lv.3 解鎖',
    commonVisitorIds: ['cat_visitor', 'dog_visitor', 'hamster_visitor'],
    rareVisitorIds: ['fox'],
    rewardHighlights: ['料理訂單交付', '市集限定家具', '小鎮券 3～5 張', '夜市寫真濾鏡相框'],
    recommendedBackgroundIds: ['market_night', 'wooden_stalls'],
    recommendedFilterIds: ['market_warm_sun', 'vintage'],
    recommendedFrameIds: ['market_sign_frame', 'wood_frame'],
  },
  {
    id: 'festival_plaza',
    name: '節日廣場',
    subtitle: '活動期間限定地點（預留）',
    emoji: '🎡',
    themeGradient: 'from-[#FFEAF4] to-[#FFF6DE]',
    badgeClass: 'bg-[#FFF0F6] border-[#F4B4CB] text-[#B83B64]',
    description: '將於未來節慶活動期間限時開放的熱鬧慶典廣場。',
    unlockConditionLabel: '活動期間限定開放（敬請期待）',
    commonVisitorIds: [],
    rareVisitorIds: [],
    rewardHighlights: ['活動限定內容'],
    recommendedBackgroundIds: [],
    recommendedFilterIds: [],
    recommendedFrameIds: [],
    reserved: true,
  },
];

export const ACTIVE_TOWN_LOCATIONS = TOWN_LOCATIONS.filter(
  (loc): loc is TownLocationDefinition & { id: ActiveTownLocationId } => !loc.reserved
);

export const TOWN_LOCATION_BY_ID: Record<TownLocationId, TownLocationDefinition> =
  TOWN_LOCATIONS.reduce(
    (acc, loc) => {
      acc[loc.id] = loc;
      return acc;
    },
    {} as Record<TownLocationId, TownLocationDefinition>
  );

export const VISITOR_HUT_LEVELS: VisitorHutLevelInfo[] = [
  {
    level: 1,
    name: '小木屋',
    emoji: '🪵',
    upgradeCostCoins: 0,
    dailyCapacityBonus: 0,
    stayBonusPercent: 0,
    rareRateBonusPercent: 0,
    description: '溫馨樸實的原木小亭，剛剛好能接待來串門子的小鎮動物朋友。',
    unlockBonusText: '基礎訪客接待（每地點每日最多 2 位訪客）',
  },
  {
    level: 2,
    name: '溫馨小屋',
    emoji: '🏡',
    upgradeCostCoins: 300,
    dailyCapacityBonus: 1,
    stayBonusPercent: 10,
    rareRateBonusPercent: 8,
    description: '鋪上柔軟迎賓墊與暖色窗框，小鎮訪客更願意停留休息了！',
    unlockBonusText: '庭院每日額外接待上限 +1、訪客停留時間 +10%、稀有訪客率 +8%',
  },
  {
    level: 3,
    name: '森林招待所',
    emoji: '🌿',
    upgradeCostCoins: 800,
    dailyCapacityBonus: 1,
    stayBonusPercent: 25,
    rareRateBonusPercent: 18,
    description: '搭起原木花架與雙層歇腳台，連森林深處的害羞小動物也會循香而來！',
    unlockBonusText: '訪客停留時間 +25%、招待獎勵微幅加成、稀有訪客率 +18%',
  },
  {
    level: 4,
    name: '小鎮旅館',
    emoji: '🏨',
    upgradeCostCoins: 1500,
    dailyCapacityBonus: 2,
    stayBonusPercent: 40,
    rareRateBonusPercent: 32,
    description: '掛起迎賓燈牌的兩層暖心小旅館，小鹿、水獺與小狐狸都常來打聽這裡！',
    unlockBonusText: '庭院每日容量 +2、停留時間 +40%、稀有訪客率 +32%',
  },
  {
    level: 5,
    name: '夢幻招待所',
    emoji: '🏰',
    upgradeCostCoins: 3000,
    dailyCapacityBonus: 2,
    stayBonusPercent: 60,
    rareRateBonusPercent: 50,
    description: '頂樓掛滿星燈與粉嫩花冠的夢幻招待所！小鎮旅人們最嚮往的打卡勝地。',
    unlockBonusText: '稀有訪客率 +50%、停留 +60%，並解鎖攝影棚限定背景「夢幻招待所」！',
    rewardBackgroundId: 'dream_lodge_bg',
  },
];

export const VISITOR_HUT_LEVEL_BY_NUM: Record<1 | 2 | 3 | 4 | 5, VisitorHutLevelInfo> = {
  1: VISITOR_HUT_LEVELS[0],
  2: VISITOR_HUT_LEVELS[1],
  3: VISITOR_HUT_LEVELS[2],
  4: VISITOR_HUT_LEVELS[3],
  5: VISITOR_HUT_LEVELS[4],
};

export const VISITOR_HUT_FACILITIES: VisitorHutFacility[] = [
  {
    id: 'bird_feeder',
    name: '餵鳥器',
    emoji: '🕊️',
    priceCoins: 150,
    description: '掛在木屋簷下的小鳥穀粒台，吸引小鳥啾啾天天飛來歇腳。',
    effectLabel: '小鳥出現機率 +45%',
    targetVisitorId: 'bird',
  },
  {
    id: 'nut_bowl',
    name: '堅果盆',
    emoji: '🌰',
    priceCoins: 180,
    description: '擺滿香脆榛果與橡子的原木盤，松鼠與刺蝟總是忍不住湊過來。',
    effectLabel: '松鼠出現機率 +45%',
    targetVisitorId: 'squirrel',
  },
  {
    id: 'carrot_patch',
    name: '紅蘿蔔花圃',
    emoji: '🥕',
    priceCoins: 200,
    description: '木屋旁的小小紅蘿蔔脆葉圃，小兔子遠遠就能聞到甜香味！',
    effectLabel: '小兔子出現機率 +45%',
    targetVisitorId: 'rabbit',
  },
  {
    id: 'mini_pond',
    name: '小水池',
    emoji: '💧',
    priceCoins: 250,
    description: '鋪著圓潤鵝卵石的迷你戲水池，小鴨與青蛙看到就想撲通跳進來！',
    effectLabel: '小鴨出現機率 +45%',
    targetVisitorId: 'duck',
  },
  {
    id: 'flower_bush',
    name: '花叢',
    emoji: '🌸',
    priceCoins: 220,
    description: '四季常開的粉白蜜源花叢，微風吹過時最容易引來閃亮蝴蝶！',
    effectLabel: '蝴蝶出現機率 +60%',
    targetVisitorId: 'butterfly',
  },
  {
    id: 'lantern',
    name: '小燈籠',
    emoji: '🏮',
    priceCoins: 300,
    description: '夜色微暗時亮起溫柔暖光的小燈籠，讓訪客們放心多待一會兒。',
    effectLabel: '所有訪客停留時間 +35%',
  },
  {
    id: 'treat_table',
    name: '招待桌',
    emoji: '🍰',
    priceCoins: 500,
    description: '寬敞的格子桌布茶點桌，可一次準備最多 3 份點心同時端上桌招待！',
    effectLabel: '解鎖一次招待 3 份點心組合（好感與小鎮券額外 +1）',
  },
  {
    id: 'rare_sign',
    name: '稀有訪客招牌',
    emoji: '✨',
    priceCoins: 1000,
    description: '畫著金色星芒的手繪歡迎木牌，連罕見的小鹿、水獺與小狐狸都會被吸引！',
    effectLabel: '全小鎮稀有訪客出現率大幅 +55%',
  },
];

export const VISITOR_HUT_FACILITY_BY_ID: Record<VisitorHutFacilityId, VisitorHutFacility> =
  VISITOR_HUT_FACILITIES.reduce(
    (acc, f) => {
      acc[f.id] = f;
      return acc;
    },
    {} as Record<VisitorHutFacilityId, VisitorHutFacility>
  );
