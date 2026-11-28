import {
  GameMilestoneId,
  MemoryType,
  Milestone,
  SharedMemory,
  SharedMemoryKey,
} from '../types';

export interface MemoryTypeMeta {
  id: MemoryType;
  label: string;
  emoji: string;
  badgeClass: string;
}

export const MEMORY_TYPE_META: Record<MemoryType, MemoryTypeMeta> = {
  hatching: {
    id: 'hatching',
    label: '孵化回憶',
    emoji: '🐣',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
  },
  feeding: {
    id: 'feeding',
    label: '餵食回憶',
    emoji: '🍽️',
    badgeClass: 'bg-[#FFEAF0] border-[#F4B4CB] text-[#B83B64]',
  },
  wardrobe: {
    id: 'wardrobe',
    label: '穿搭回憶',
    emoji: '🎀',
    badgeClass: 'bg-[#FCE8FF] border-[#E0B3F5] text-[#7D3A9C]',
  },
  room: {
    id: 'room',
    label: '房間回憶',
    emoji: '🛋️',
    badgeClass: 'bg-[#FFF5E8] border-[#ECC8A6] text-[#8A5610]',
  },
  farm: {
    id: 'farm',
    label: '農場回憶',
    emoji: '🌱',
    badgeClass: 'bg-[#E5F8F0] border-[#A7E0CB] text-[#1F6B54]',
  },
  weight: {
    id: 'weight',
    label: '體重回憶',
    emoji: '⚖️',
    badgeClass: 'bg-[#EAF3FF] border-[#B6D1FA] text-[#2F5B9E]',
  },
  growth: {
    id: 'growth',
    label: '成長回憶',
    emoji: '✨',
    badgeClass: 'bg-[#FFF1CC] border-[#F2C94C] text-[#85540B]',
  },
  coop: {
    id: 'coop',
    label: '共養回憶',
    emoji: '💞',
    badgeClass: 'bg-[#FFE3EE] border-[#F49EB9] text-[#B83B64]',
  },
  cooperation: {
    id: 'cooperation',
    label: '合作回憶',
    emoji: '🤝',
    badgeClass: 'bg-[#E3F7F0] border-[#8BD9BC] text-[#1F6B54]',
  },
  festival: {
    id: 'festival',
    label: '節日回憶',
    emoji: '🎉',
    badgeClass: 'bg-[#FFEBF6] border-[#F2A6D0] text-[#B83276]',
  },
  dialogue: {
    id: 'dialogue',
    label: '對話回憶',
    emoji: '💬',
    badgeClass: 'bg-[#EFEAFF] border-[#C9BDF2] text-[#5B449C]',
  },
  milestone: {
    id: 'milestone',
    label: '里程碑回憶',
    emoji: '🏆',
    badgeClass: 'bg-[#FFF3C4] border-[#E6A222] text-[#7A540E]',
  },
  visitor: {
    id: 'visitor',
    label: '訪客回憶',
    emoji: '🐾',
    badgeClass: 'bg-[#E8F8F0] border-[#9ADBC2] text-[#1F6B54]',
  },
  town: {
    id: 'town',
    label: '小鎮旅記',
    emoji: '🗺️',
    badgeClass: 'bg-[#E6F8EE] border-[#8BD7B3] text-[#1D6B4F]',
  },
  birthday: {
    id: 'birthday',
    label: '生日回憶',
    emoji: '🎂',
    badgeClass: 'bg-[#FFEAF2] border-[#FF9EB9] text-[#C43463]',
  },
  photo_contest: {
    id: 'photo_contest',
    label: '攝影比賽',
    emoji: '🏆',
    badgeClass: 'bg-[#FFF3D8] border-[#E8AE38] text-[#8A520E]',
  },
};

export const MEMORY_TYPE_ORDER: MemoryType[] = [
  'hatching',
  'birthday',
  'photo_contest',
  'feeding',
  'wardrobe',
  'room',
  'farm',
  'weight',
  'growth',
  'coop',
  'cooperation',
  'visitor',
  'town',
  'festival',
  'dialogue',
  'milestone',
];

export const MILESTONE_DEFINITIONS: Omit<
  Milestone,
  'unlocked' | 'unlockedAt' | 'unlockedDateKey'
>[] = [
  {
    id: 'first_feed',
    title: '第一次餵食',
    description: '親手端出第一份熱騰騰的食物餵飽小萌寵！',
    conditionLabel: '完成 1 次餵食',
    emoji: '🥣',
    rewardCoins: 30,
    rewardGrowth: 10,
    rewardCardTitle: '美食啟程紀念卡',
  },
  {
    id: 'first_burger',
    title: '第一次漢堡',
    description: '香噴噴的起司漢堡，第一口就讓幸福感爆棚！',
    conditionLabel: '餵食「起司漢堡」1 次',
    emoji: '🍔',
    rewardCoins: 35,
    rewardGrowth: 12,
    rewardCardTitle: '漢堡初體驗紀念卡',
  },
  {
    id: 'first_fries',
    title: '第一次薯條',
    description: '金黃酥脆的薯條咔滋作響，誰能抵擋這份快樂？',
    conditionLabel: '餵食「香脆薯條」1 次',
    emoji: '🍟',
    rewardCoins: 35,
    rewardGrowth: 12,
    rewardCardTitle: '酥脆薯條紀念卡',
  },
  {
    id: 'first_equip_accessory',
    title: '第一次穿戴配件',
    description: '在衣櫥幫小萌寵戴上第一件可愛配件，造型大變身！',
    conditionLabel: '成功穿戴任一件配件',
    emoji: '🎀',
    rewardCoins: 40,
    rewardGrowth: 15,
    rewardCardTitle: '時尚萌星紀念卡',
  },
  {
    id: 'first_weight_log',
    title: '第一次記錄體重',
    description: '在成長手帳仔細量測並記錄下第一筆體重數據！',
    conditionLabel: '在成長手帳手動記錄 1 次體重',
    emoji: '⚖️',
    rewardCoins: 30,
    rewardGrowth: 12,
    rewardCardTitle: '健康成長紀念卡',
  },
  {
    id: 'first_room_decor',
    title: '第一次房間佈置',
    description: '把第一件暖心家具擺進小屋，家開始有了溫度！',
    conditionLabel: '在寵物房擺放至少 1 件家具',
    emoji: '🛋️',
    rewardCoins: 45,
    rewardGrowth: 15,
    rewardCardTitle: '溫暖小窩紀念卡',
  },
  {
    id: 'first_farm_harvest',
    title: '第一次農場收成',
    description: '辛勤澆水等待作物成熟，收成第一份新鮮食材！',
    conditionLabel: '在開心農場收成 1 次作物',
    emoji: '🥕',
    rewardCoins: 40,
    rewardGrowth: 15,
    rewardCardTitle: '田園豐收紀念卡',
  },
  {
    id: 'reach_lv2',
    title: '成長階段 Lv.2',
    description: '小萌寵逐漸長大，解鎖更多可愛穿搭欄位與互動！',
    conditionLabel: '寵物成長等級達到 Lv.2',
    emoji: '🌱',
    rewardCoins: 60,
    rewardGrowth: 20,
    rewardCardTitle: '小小貪吃鬼紀念卡',
  },
  {
    id: 'reach_lv3',
    title: '成長階段 Lv.3',
    description: '圓滾滾又充滿活力！成為食堂裡最亮眼的小主角！',
    conditionLabel: '寵物成長等級達到 Lv.3',
    emoji: '🌟',
    rewardCoins: 90,
    rewardGrowth: 25,
    rewardCardTitle: '圓滾滾萌寵紀念卡',
    rewardPoseId: 'crown_star',
  },
  {
    id: 'reach_lv4',
    title: '成長階段 Lv.4',
    description: '達成最高階時尚萌主！一路以來的陪伴閃閃發光！',
    conditionLabel: '寵物成長等級達到 Lv.4',
    emoji: '👑',
    rewardCoins: 150,
    rewardGrowth: 30,
    rewardCardTitle: '時尚大萌主紀念卡',
    rewardFrameId: 'golden_memory',
  },
  {
    id: 'coop_7_days',
    title: '共養 7 天',
    description: '與重要的人一起攜手照護與佈置小屋滿 7 天！',
    conditionLabel: '建立共養小屋或連續合作達 7 天',
    emoji: '💞',
    rewardCoins: 120,
    rewardGrowth: 30,
    rewardCardTitle: '雙人七日約定紀念卡',
    rewardFrameId: 'coop_heart',
  },
  {
    id: 'day_100_anniversary',
    title: '100 天紀念',
    description: '共同走過 100 天的食堂時光，每一刻都珍貴無比！',
    conditionLabel: '飼養陪伴天數累計達 100 天',
    emoji: '🎂',
    rewardCoins: 300,
    rewardGrowth: 50,
    rewardCardTitle: '百日金色紀念卡',
    rewardPoseId: 'anniversary_cheer',
  },
];

export const MILESTONE_BY_ID: Record<
  GameMilestoneId,
  (typeof MILESTONE_DEFINITIONS)[number]
> = MILESTONE_DEFINITIONS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<GameMilestoneId, (typeof MILESTONE_DEFINITIONS)[number]>
);

export const SHARED_MEMORY_DEFINITIONS: Array<{
  key: SharedMemoryKey;
  title: string;
  description: string;
  emoji: string;
  rewardCoins: number;
  rewardIntimacy: number;
  rewardCardTitle: string;
}> = [
  {
    key: 'shared_first_naming',
    title: '我們的第一次取名',
    description: '共同攜手為我們的小屋與小萌寵留下正式名字紀念！',
    emoji: '🏷️',
    rewardCoins: 40,
    rewardIntimacy: 5,
    rewardCardTitle: '兩人命名契據卡',
  },
  {
    key: 'shared_first_feed',
    title: '第一次一起餵食',
    description: '在共養小屋裡一起準備美味料理餵飽小萌寵！',
    emoji: '🍱',
    rewardCoins: 50,
    rewardIntimacy: 6,
    rewardCardTitle: '雙人喂食回憶卡',
  },
  {
    key: 'shared_first_message',
    title: '第一次互相留言',
    description: '在留言板互傳貼圖與悄悄話，讓彼此的關心不間斷！',
    emoji: '💌',
    rewardCoins: 45,
    rewardIntimacy: 6,
    rewardCardTitle: '暖心雙向情書卡',
  },
  {
    key: 'shared_first_coop_task',
    title: '第一次合作任務',
    description: '並肩完成雙人佈置或農場接力任務，展現絕佳默契！',
    emoji: '🤝',
    rewardCoins: 80,
    rewardIntimacy: 10,
    rewardCardTitle: '默契雙人挑戰卡',
  },
  {
    key: 'shared_first_buy_furniture',
    title: '第一次共同購買家具',
    description: '使用兩人存下的共同金庫，為小屋添購第一件專屬家具！',
    emoji: '🛋️',
    rewardCoins: 70,
    rewardIntimacy: 8,
    rewardCardTitle: '共同築巢紀念卡',
  },
  {
    key: 'shared_house_7_days',
    title: '我們的家 7 天',
    description: '共養小屋溫暖運作滿 7 天，幸福的日常已悄悄生根！',
    emoji: '🏡',
    rewardCoins: 100,
    rewardIntimacy: 15,
    rewardCardTitle: '七日同居紀念卡',
  },
  {
    key: 'shared_house_30_days',
    title: '我們的家 30 天',
    description: '一起照顧毛孩滿一個月，感謝彼此每一天的貼心陪伴！',
    emoji: '🌸',
    rewardCoins: 180,
    rewardIntimacy: 25,
    rewardCardTitle: '三十日滿月紀念卡',
  },
  {
    key: 'shared_house_100_days',
    title: '我們的家 100 天',
    description: '攜手陪伴 100 個日夜，這是屬於兩人的最高甜蜜見證！',
    emoji: '👑',
    rewardCoins: 360,
    rewardIntimacy: 50,
    rewardCardTitle: '百日永恆回憶卡',
  },
];

export function createInitialMilestones(): Milestone[] {
  return MILESTONE_DEFINITIONS.map((def) => ({
    ...def,
    unlocked: false,
    unlockedAt: null,
    unlockedDateKey: null,
  }));
}

export function createInitialSharedMemories(petName = '布丁'): SharedMemory[] {
  return SHARED_MEMORY_DEFINITIONS.map((def) => ({
    id: `smem_${def.key}`,
    key: def.key,
    title: def.title,
    description: def.description,
    emoji: def.emoji,
    unlocked: false,
    createdAt: null,
    dateKey: null,
    petName,
    actors: [],
    rewardCoins: def.rewardCoins,
    rewardIntimacy: def.rewardIntimacy,
    rewardCardTitle: def.rewardCardTitle,
    notifiedUserIds: [],
  }));
}
