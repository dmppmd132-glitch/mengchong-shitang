import { CollectionCategoryId, CollectionFilterId, CollectionJumpTarget } from '../../types';

export interface CollectionCategoryMeta {
  id: CollectionCategoryId;
  label: string;
  shortLabel: string;
  emoji: string;
  description: string;
  accentClass: string;
  barClass: string;
  defaultJumpTarget: CollectionJumpTarget;
}

export const COLLECTION_CATEGORIES: CollectionCategoryMeta[] = [
  {
    id: 'pets',
    label: '寵物圖鑑',
    shortLabel: '寵物',
    emoji: '🐾',
    description: '收錄小豬、兔子、小狗、小貓、小鴨與小倉鼠的可愛檔案與解鎖條件。',
    accentClass: 'bg-[#FFEAF2] text-[#B83B64] border-[#F4B4CB]',
    barClass: 'bg-[#F06C98]',
    defaultJumpTarget: 'pets',
  },
  {
    id: 'foods',
    label: '食物圖鑑',
    shortLabel: '食物',
    emoji: '🍱',
    description: '網羅正餐、零食、速食、拿手料理與季節限定美味佳餚。',
    accentClass: 'bg-[#FFF3DC] text-[#8A5610] border-[#F0CA82]',
    barClass: 'bg-[#E6A222]',
    defaultJumpTarget: 'canteen',
  },
  {
    id: 'accessories',
    label: '配件圖鑑',
    shortLabel: '配件',
    emoji: '🎀',
    description: '頭部、臉部、脖子、身體、手持與背部配件，並記錄穿戴次數。',
    accentClass: 'bg-[#FCE8FF] text-[#7D3A9C] border-[#E0B3F5]',
    barClass: 'bg-[#B16AE0]',
    defaultJumpTarget: 'wardrobe',
  },
  {
    id: 'sets',
    label: '穿搭套裝',
    shortLabel: '套裝',
    emoji: '👗',
    description: '集齊 4 件套裝解鎖專屬稱號與回憶卡，同時預覽進階連鎖套裝。',
    accentClass: 'bg-[#FFF0F6] text-[#B83B64] border-[#F4A6C2]',
    barClass: 'bg-[#EB6193]',
    defaultJumpTarget: 'wardrobe',
  },
  {
    id: 'room',
    label: '房間圖鑑',
    shortLabel: '房間',
    emoji: '🛋️',
    description: '收集室內家具、壁紙、地板、主題套房與庭院佈置飾品。',
    accentClass: 'bg-[#FFF5E8] text-[#8A5610] border-[#ECC8A6]',
    barClass: 'bg-[#D98245]',
    defaultJumpTarget: 'house',
  },
  {
    id: 'farm',
    label: '農場圖鑑',
    shortLabel: '農場',
    emoji: '🌱',
    description: '囊括農場作物食材、廚房食譜、農具設施升級與農場裝飾。',
    accentClass: 'bg-[#E5F8F0] text-[#1F6B54] border-[#A7E0CB]',
    barClass: 'bg-[#3BA886]',
    defaultJumpTarget: 'house',
  },
  {
    id: 'visitors',
    label: '訪客圖鑑',
    shortLabel: '訪客',
    emoji: '🐿️',
    description: '記錄自家庭院與小鎮遇到的動物客人、喜好食物、好感度與贈禮。',
    accentClass: 'bg-[#E6F5FF] text-[#225C82] border-[#9ECFF0]',
    barClass: 'bg-[#469BE0]',
    defaultJumpTarget: 'town',
  },
  {
    id: 'town',
    label: '小鎮圖鑑',
    shortLabel: '小鎮',
    emoji: '🗺️',
    description: '探索小鎮地圖地點、每日據點任務、限定拍照獎勵與預留節日廣場。',
    accentClass: 'bg-[#E9F6E8] text-[#226142] border-[#9CCFA5]',
    barClass: 'bg-[#48A868]',
    defaultJumpTarget: 'town',
  },
  {
    id: 'studio',
    label: '攝影圖鑑',
    shortLabel: '攝影',
    emoji: '📸',
    description: '整理姿勢、背景、濾鏡、相框與貼圖收集進度，並支援材料合成。',
    accentClass: 'bg-[#EFEAFF] text-[#5B449C] border-[#C9BDF2]',
    barClass: 'bg-[#8364D9]',
    defaultJumpTarget: 'studio',
  },
  {
    id: 'memories',
    label: '回憶圖鑑',
    shortLabel: '回憶',
    emoji: '📖',
    description: '珍藏成長里程碑、共養回憶、節日限定紀念、照片與對話收藏。',
    accentClass: 'bg-[#FFF3E0] text-[#85540B] border-[#EED387]',
    barClass: 'bg-[#D98B2B]',
    defaultJumpTarget: 'memories',
  },
];

export const COLLECTION_CATEGORY_BY_ID: Record<CollectionCategoryId, CollectionCategoryMeta> =
  COLLECTION_CATEGORIES.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<CollectionCategoryId, CollectionCategoryMeta>
  );

export interface CollectionFilterOption {
  id: CollectionFilterId;
  label: string;
}

export const COLLECTION_FILTERS: CollectionFilterOption[] = [
  { id: 'all', label: '全部' },
  { id: 'owned', label: '已擁有' },
  { id: 'unowned', label: '未擁有' },
  { id: 'purchasable', label: '可購買' },
  { id: 'event', label: '活動限定' },
  { id: 'coop', label: '共養限定' },
  { id: 'craftable', label: '可合成' },
  { id: 'expiring', label: '即將過期' },
];
