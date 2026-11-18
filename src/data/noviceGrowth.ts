import { NoviceDayNumber, StageBackgroundId } from '../types';

export interface NoviceGoalConfig {
  id: string;
  label: string;
  target: number;
}

export interface NoviceRewardItem {
  kind: 'accessory' | 'ingredient' | 'food' | 'background';
  id: string;
  qty: number;
  label: string;
  emoji: string;
}

export interface NoviceDayConfig {
  day: NoviceDayNumber;
  title: string;
  subtitle: string;
  goals: NoviceGoalConfig[];
  matchAnyGoal?: boolean;
  rewardCoins: number;
  rewardItems: NoviceRewardItem[];
}

export const NOVICE_GROWTH_DAYS: NoviceDayConfig[] = [
  {
    day: 1,
    title: '第 1 天 · 初次見面',
    subtitle: '迎接可愛小夥伴，給牠第一頓點心與暖心摸摸！',
    goals: [
      { id: 'hatch_and_name', label: '孵化寵物並完成取名', target: 1 },
      { id: 'feed_1', label: '餵食 1 次', target: 1 },
      { id: 'pet_3', label: '摸摸 3 次', target: 3 },
    ],
    rewardCoins: 50,
    rewardItems: [
      {
        kind: 'accessory',
        id: 'pink_bow',
        qty: 1,
        label: '粉紅蝴蝶結',
        emoji: '🎀',
      },
    ],
  },
  {
    day: 2,
    title: '第 2 天 · 農園小農夫',
    subtitle: '種出新鮮食材，再去接接樂小遊戲賺第一桶金幣！',
    goals: [
      { id: 'plant_carrot', label: '種植紅蘿蔔 1 次', target: 1 },
      { id: 'minigame_1', label: '完成 1 次小遊戲', target: 1 },
    ],
    rewardCoins: 60,
    rewardItems: [
      {
        kind: 'ingredient',
        id: 'corn',
        qty: 2,
        label: '玉米種子禮包（玉米 ×2）',
        emoji: '🌽',
      },
    ],
  },
  {
    day: 3,
    title: '第 3 天 · 手作小主廚',
    subtitle: '用採收食材做一道美味料理，並記錄寶貝的體重成長！',
    goals: [
      { id: 'cook_1', label: '合成 1 道料理', target: 1 },
      { id: 'weigh_1', label: '記錄 1 次體重', target: 1 },
    ],
    rewardCoins: 70,
    rewardItems: [
      {
        kind: 'food',
        id: 'caramel_pudding',
        qty: 1,
        label: '焦糖布丁 ×1',
        emoji: '🍮',
      },
    ],
  },
  {
    day: 4,
    title: '第 4 天 · 時尚穿搭日',
    subtitle: '到更衣室挑一件喜歡的新配件，讓小夥伴變身最亮眼明星！',
    goals: [
      { id: 'buy_accessory_1', label: '購買 1 件配件', target: 1 },
      { id: 'equip_2', label: '同時穿戴 2 件配件', target: 2 },
    ],
    rewardCoins: 80,
    rewardItems: [
      {
        kind: 'accessory',
        id: 'strawberry_clip',
        qty: 1,
        label: '草莓髮夾',
        emoji: '🍓',
      },
    ],
  },
  {
    day: 5,
    title: '第 5 天 · 散步充充電',
    subtitle: '累積完成日常任務並帶小夥伴散步消化、維持健康！',
    goals: [
      { id: 'daily_tasks_3', label: '累積完成 3 個每日任務', target: 3 },
      { id: 'walk_1', label: '散步 1 次', target: 1 },
    ],
    rewardCoins: 90,
    rewardItems: [
      {
        kind: 'accessory',
        id: 'round_glasses',
        qty: 1,
        label: '圓框眼鏡',
        emoji: '👓',
      },
    ],
  },
  {
    day: 6,
    title: '第 6 天 · 成長大躍進',
    subtitle: '升上成長 Lv.2，並餵牠吃最愛料理見證幸福星星眼！',
    goals: [
      { id: 'reach_lv2', label: '寵物成長達到 Lv.2', target: 1 },
      { id: 'feed_favorite_1', label: '餵食最愛食物 1 次', target: 1 },
    ],
    rewardCoins: 100,
    rewardItems: [
      {
        kind: 'background',
        id: 'starlight_garden',
        qty: 1,
        label: '限定背景「星光野餐花園」',
        emoji: '🌌',
      },
    ],
  },
  {
    day: 7,
    title: '第 7 天 · 一週慶典',
    subtitle: '累積完成 5 個每日任務，或建立兩人共養小屋即可領取大獎！',
    goals: [
      { id: 'daily_tasks_5', label: '累積完成 5 個每日任務', target: 5 },
      { id: 'shared_room_1', label: '或建立共養小屋', target: 1 },
    ],
    matchAnyGoal: true,
    rewardCoins: 150,
    rewardItems: [
      {
        kind: 'accessory',
        id: 'anniversary_bib',
        qty: 1,
        label: '一週紀念圍兜',
        emoji: '🎂',
      },
      {
        kind: 'accessory',
        id: 'party_mini_cape',
        qty: 1,
        label: '派對小披風',
        emoji: '🎉',
      },
    ],
  },
];

export interface StageBackgroundConfig {
  id: StageBackgroundId;
  name: string;
  description: string;
  stageClass: string;
  badgeText: string;
}

export const STAGE_BACKGROUNDS: Record<StageBackgroundId, StageBackgroundConfig> = {
  default: {
    id: 'default',
    name: '暖陽食堂背景',
    description: '溫馨粉黃與薄荷漸層的日常食堂舞台。',
    stageClass: 'bg-gradient-to-b from-[#FFEAF0] via-[#FFF9EA] to-[#E6F8F1]',
    badgeText: '預設舞台',
  },
  starlight_garden: {
    id: 'starlight_garden',
    name: '星光野餐花園',
    description: '新手第 6 天限定背景！柔和粉紫夜空點綴金星閃光。',
    stageClass: 'bg-gradient-to-b from-[#EDE6FF] via-[#FFF1F7] to-[#DDF5EE]',
    badgeText: '第 6 天限定',
  },
  strawberry_cafe: {
    id: 'strawberry_cafe',
    name: '草莓甜點茶屋',
    description: '集齊「草莓甜心」穿搭套裝解鎖！粉嫩草莓奶昔色調的幸福舞台。',
    stageClass: 'bg-gradient-to-b from-[#FFDCE8] via-[#FFF3F7] to-[#FFEBD6]',
    badgeText: '草莓套裝限定',
  },
  forest_camp_bg: {
    id: 'forest_camp_bg',
    name: '森之野營林地',
    description: '集齊「森林露營」穿搭套裝解鎖！充滿清新葉香與暖陽的自然草地。',
    stageClass: 'bg-gradient-to-b from-[#D5F2DF] via-[#F2FBF0] to-[#F7F1D8]',
    badgeText: '露營套裝限定',
  },
  cloud_dream_bg: {
    id: 'cloud_dream_bg',
    name: '軟綿雲海夢境',
    description: '集齊「雲朵午睡」穿搭套裝解鎖！晴空粉藍與雪白雲端交織的午睡天堂。',
    stageClass: 'bg-gradient-to-b from-[#D7E9FF] via-[#F3F8FF] to-[#FFF6FC]',
    badgeText: '雲朵套裝限定',
  },
  chef_bistro_bg: {
    id: 'chef_bistro_bg',
    name: '暖暖小當家餐館',
    description: '集齊「廚師小當家」穿搭套裝解鎖！洋溢剛出爐麵包香氣的歐風小餐館。',
    stageClass: 'bg-gradient-to-b from-[#FFE6C4] via-[#FFF9EC] to-[#FBE7DB]',
    badgeText: '廚師套裝限定',
  },
  starry_cosmos_bg: {
    id: 'starry_cosmos_bg',
    name: '銀河漫遊星夜',
    description: '集齊「星空探險」穿搭套裝解鎖！璀璨星雲與柔和星光相伴的宇宙舞台。',
    stageClass: 'bg-gradient-to-b from-[#DFD8FF] via-[#EEF2FF] to-[#E2F4FA]',
    badgeText: '星空套裝限定',
  },
  party_carnival_bg: {
    id: 'party_carnival_bg',
    name: '歡樂慶典嘉年華',
    description: '集齊「節日派對」穿搭套裝解鎖！氣球、星光與彩帶齊飛的派對舞台。',
    stageClass: 'bg-gradient-to-b from-[#FFE2EE] via-[#FFF6D6] to-[#DFF7EC]',
    badgeText: '派對套裝限定',
  },
};
