import {
  PetExpression,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScene,
  PhotoStickerId,
  PiggyActionState,
  StudioBadgeId,
  StudioCraftRecipe,
  StudioItemSource,
  WeeklyOutfitChallengeTheme,
  WeeklyOutfitChallengeThemeId,
} from '../types';

export interface PhotoPoseOption {
  id: PhotoPose;
  label: string;
  emoji: string;
  action: PiggyActionState;
  expression: PetExpression;
  animClass: string;
  description: string;
  source: StudioItemSource;
  price: number;
  requiresUnlock?: boolean;
  unlockHint?: string;
}

export const PHOTO_POSES: PhotoPoseOption[] = [
  {
    id: 'happy',
    label: '開心站姿',
    emoji: '😄',
    action: 'petted',
    expression: 'happyTongue',
    animClass: 'animate-piggy-jump',
    description: '露齒燦笑開心跳跳！',
    source: 'free',
    price: 0,
  },
  {
    id: 'shy',
    label: '害羞遮臉',
    emoji: '😳',
    action: 'idle',
    expression: 'shy',
    animClass: 'animate-pose-shy',
    description: '臉頰泛紅小小扭捏遮臉～',
    source: 'free',
    price: 0,
  },
  {
    id: 'sleep',
    label: '睡覺',
    emoji: '😴',
    action: 'sleeping',
    expression: 'normal',
    animClass: 'animate-house-pet-sleep',
    description: '安詳閉眼呼嚕打盹 Zzz',
    source: 'free',
    price: 0,
  },
  {
    id: 'eat',
    label: '吃東西',
    emoji: '😋',
    action: 'eating',
    expression: 'sparkle',
    animClass: 'animate-piggy-chew',
    description: '眼睛閃亮亮大口咬咬！',
    source: 'free',
    price: 0,
  },
  {
    id: 'spin',
    label: '轉圈圈',
    emoji: '🌀',
    action: 'petted',
    expression: 'happyTongue',
    animClass: 'animate-pose-spin',
    description: '360° 活力旋轉展示全套穿搭！',
    source: 'shop',
    price: 120,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（120 金幣）',
  },
  {
    id: 'pounce',
    label: '撒嬌撲倒',
    emoji: '🐾',
    action: 'petted',
    expression: 'wink',
    animClass: 'animate-pose-pounce',
    description: '軟萌飛撲討抱抱的撒嬌神技！',
    source: 'shop',
    price: 150,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（150 金幣）',
  },
  {
    id: 'runway',
    label: '時尚走秀',
    emoji: '✨',
    action: 'walking',
    expression: 'sparkle',
    animClass: 'animate-pose-runway',
    description: '踩著貓步登場的頂級模特兒台步！',
    source: 'shop',
    price: 300,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（300 金幣）',
  },
  {
    id: 'dance',
    label: '跳舞',
    emoji: '💃',
    action: 'walking',
    expression: 'wink',
    animClass: 'animate-pose-dance',
    description: '跟著節拍左右搖擺活力起舞！',
    source: 'achievement',
    price: 0,
    requiresUnlock: true,
    unlockHint: '完成 5 次小遊戲（小遊戲成就）解鎖',
  },
  {
    id: 'salute',
    label: '敬禮',
    emoji: '🫡',
    action: 'idle',
    expression: 'wink',
    animClass: 'animate-pose-salute',
    description: '精神飽滿舉手敬禮報告！',
    source: 'achievement',
    price: 0,
    requiresUnlock: true,
    unlockHint: '完成新手 7 天成長之路（任領 3 天以上或第 7 天）解鎖',
  },
  {
    id: 'star_eyes',
    label: '星星眼',
    emoji: '🤩',
    action: 'petted',
    expression: 'sparkle',
    animClass: 'animate-pose-star-eyes',
    description: '雙眼閃爍金色星芒的幸福崇拜表情！',
    source: 'achievement',
    price: 0,
    requiresUnlock: true,
    unlockHint: '累計餵食最愛食物 3 次成就解鎖',
  },
  {
    id: 'crown_star',
    label: '明星閃耀',
    emoji: '🌟',
    action: 'petted',
    expression: 'sparkle',
    animClass: 'animate-piggy-jump',
    description: '里程碑限定！大明星擺拍姿勢',
    source: 'achievement',
    price: 0,
    requiresUnlock: true,
    unlockHint: '達成「升上 Lv.3」里程碑解鎖',
  },
  {
    id: 'anniversary_cheer',
    label: '慶典歡呼',
    emoji: '🎊',
    action: 'walking',
    expression: 'happyTongue',
    animClass: 'animate-pose-dance',
    description: '里程碑限定！盛大慶典歡呼姿勢',
    source: 'achievement',
    price: 0,
    requiresUnlock: true,
    unlockHint: '達成「100 天紀念」里程碑解鎖',
  },
];

export interface PhotoBackgroundOption {
  id: PhotoBackground;
  label: string;
  emoji: string;
  description: string;
  source: StudioItemSource;
  price: number;
  isDark?: boolean;
  requiresUnlock?: boolean;
  unlockHint?: string;
}

export const PHOTO_BACKGROUNDS: PhotoBackgroundOption[] = [
  {
    id: 'pink_room',
    label: '粉紅房間',
    emoji: '🎀',
    description: '柔粉牆面搭配蕾絲窗簾與軟綿地毯，少女心滿滿！',
    source: 'free',
    price: 0,
  },
  {
    id: 'strawberry_field',
    label: '草莓田',
    emoji: '🍓',
    description: '陽光灑落紅通通草莓園，空氣都飄著果香～',
    source: 'free',
    price: 0,
  },
  {
    id: 'cloud_sky',
    label: '雲朵天空',
    emoji: '☁️',
    description: '漂浮在軟綿雲海與彩虹之間，隨時都能打個小盹！',
    source: 'free',
    price: 0,
  },
  {
    id: 'kitchen',
    label: '廚房',
    emoji: '🍳',
    description: '暖呼呼磚牆與奶油廚具，今天要端出哪道拿手菜？',
    source: 'free',
    price: 0,
  },
  {
    id: 'forest_camp',
    label: '森林露營',
    emoji: '⛺',
    description: '松樹營地掛起暖黃串燈，在微風營火旁拍森林系寫真！',
    source: 'shop',
    price: 100,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（100 金幣）',
  },
  {
    id: 'starry_night_market',
    label: '星空夜市',
    emoji: '🏮',
    description: '夜空繁星與暖暖燈籠攤位，越夜越熱鬧的小鎮夜市！',
    source: 'shop',
    price: 150,
    isDark: true,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（150 金幣）',
  },
  {
    id: 'beach_vacation',
    label: '海邊度假',
    emoji: '🏖️',
    description: '碧藍海浪、金色沙灘與椰子樹影，一秒切換海島假期！',
    source: 'shop',
    price: 200,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（200 金幣）',
  },
  {
    id: 'sakura_path',
    label: '櫻花小徑',
    emoji: '🌸',
    description: '限定背景！粉嫩櫻花瓣隨風飄舞的春日石板小道',
    source: 'limited',
    price: 0,
    requiresUnlock: true,
    unlockHint: '限定背景：週挑戰達成或於「圖鑑＆合成」以攝影材料合成',
  },
  {
    id: 'halloween_party',
    label: '萬聖節派對',
    emoji: '🎃',
    description: '限定背景！紫夜城堡、笑臉南瓜燈與可愛小幽靈派對',
    source: 'limited',
    price: 0,
    isDark: true,
    requiresUnlock: true,
    unlockHint: '限定背景：週挑戰達成或於「圖鑑＆合成」以攝影材料合成',
  },
  {
    id: 'christmas_cabin',
    label: '聖誕小屋',
    emoji: '🎄',
    description: '限定背景！壁爐暖火、閃亮聖誕樹與窗外飄雪溫馨木屋',
    source: 'limited',
    price: 0,
    isDark: true,
    requiresUnlock: true,
    unlockHint: '限定背景：共養任務、活動或以攝影材料合成解鎖',
  },
];

export interface PhotoFilterOption {
  id: PhotoFilter;
  label: string;
  emoji: string;
  backdropClass: string;
  overlayStyle: string;
  stageFilterCss: string;
  badgeClass: string;
  accentEmojis: [string, string, string, string];
  source: StudioItemSource;
  price: number;
  requiresUnlock?: boolean;
  unlockHint?: string;
  isLegacy?: boolean;
}

export const PHOTO_FILTERS: PhotoFilterOption[] = [
  {
    id: 'none',
    label: '原圖',
    emoji: '📷',
    backdropClass: 'bg-gradient-to-b from-[#FFF9F2] to-[#FFFDF8]',
    overlayStyle: 'none',
    stageFilterCss: 'none',
    badgeClass: 'bg-[#FAF4EE] border-[#EAD9D0] text-[#5A3E36]',
    accentEmojis: ['✨', '📷', '💫', '🤍'],
    source: 'free',
    price: 0,
  },
  {
    id: 'cream',
    label: '奶油',
    emoji: '🧈',
    backdropClass: 'bg-gradient-to-b from-[#FFF3DA] via-[#FFF9EC] to-[#FCEAD2]',
    overlayStyle: 'linear-gradient(180deg, rgba(255,244,214,0.28), rgba(255,226,184,0.22))',
    stageFilterCss: 'brightness(1.04) saturate(0.95) sepia(0.14)',
    badgeClass: 'bg-[#FFF6DF] border-[#F0D48C] text-[#8A5A10]',
    accentEmojis: ['🧈', '🥐', '✨', '🌼'],
    source: 'shop',
    price: 50,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（50 金幣）',
  },
  {
    id: 'pink',
    label: '粉紅',
    emoji: '🩷',
    backdropClass: 'bg-gradient-to-b from-[#FFD8E6] via-[#FFF0F5] to-[#FFE8CF]',
    overlayStyle: 'linear-gradient(180deg, rgba(255,168,200,0.24), rgba(255,214,230,0.18))',
    stageFilterCss: 'brightness(1.03) saturate(1.14) hue-rotate(-4deg)',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#C43463]',
    accentEmojis: ['🩷', '🌸', '🍓', '🎀'],
    source: 'shop',
    price: 70,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（70 金幣）',
  },
  {
    id: 'mint',
    label: '薄荷',
    emoji: '🌿',
    backdropClass: 'bg-gradient-to-b from-[#CEF2E4] via-[#ECFBF4] to-[#F7F6DF]',
    overlayStyle: 'linear-gradient(180deg, rgba(145,230,198,0.22), rgba(220,248,236,0.16))',
    stageFilterCss: 'brightness(1.03) saturate(1.08) hue-rotate(8deg)',
    badgeClass: 'bg-[#E7F7EE] border-[#A6DFC5] text-[#1F6B54]',
    accentEmojis: ['🌿', '🍃', '🫧', '🍀'],
    source: 'shop',
    price: 85,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（85 金幣）',
  },
  {
    id: 'vintage',
    label: '復古',
    emoji: '🎞️',
    backdropClass: 'bg-gradient-to-b from-[#EEDCC6] via-[#F6EBDC] to-[#E5CEB2]',
    overlayStyle: 'radial-gradient(circle, rgba(255,235,205,0.08) 45%, rgba(112,72,42,0.28) 100%)',
    stageFilterCss: 'sepia(0.36) contrast(1.04) brightness(0.97)',
    badgeClass: 'bg-[#F6EBE0] border-[#D9BEA4] text-[#6E492D]',
    accentEmojis: ['🎞️', '🕰️', '🍂', '📜'],
    source: 'shop',
    price: 110,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（110 金幣）',
  },
  {
    id: 'starry',
    label: '星空',
    emoji: '🌌',
    backdropClass: 'bg-gradient-to-b from-[#3B2E6B] via-[#594B94] to-[#2B2552]',
    overlayStyle: 'linear-gradient(180deg, rgba(64,52,138,0.28), rgba(145,112,216,0.2))',
    stageFilterCss: 'contrast(1.06) saturate(1.18) brightness(0.96)',
    badgeClass: 'bg-[#EFEAFF] border-[#C9BDF2] text-[#5B449C]',
    accentEmojis: ['⭐', '🪐', '✨', '🌙'],
    source: 'shop',
    price: 130,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（130 金幣）',
  },
  {
    id: 'candy',
    label: '糖果',
    emoji: '🍬',
    backdropClass: 'bg-gradient-to-b from-[#FFE0F0] via-[#FFF3D8] to-[#DCF6F2]',
    overlayStyle: 'linear-gradient(135deg, rgba(255,154,205,0.2), rgba(130,224,230,0.2))',
    stageFilterCss: 'saturate(1.26) brightness(1.05) contrast(1.03)',
    badgeClass: 'bg-[#FFF0F7] border-[#F6B4D5] text-[#B83B64]',
    accentEmojis: ['🍬', '🍭', '🌈', '🧁'],
    source: 'shop',
    price: 150,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（150 金幣）',
  },
  // Legacy filters preserved cleanly for older saved photos
  {
    id: 'strawberry',
    label: '草莓',
    emoji: '🍓',
    backdropClass: 'bg-gradient-to-b from-[#FFD8E6] via-[#FFF0F5] to-[#FFE8CF]',
    overlayStyle: 'linear-gradient(180deg, rgba(255,168,200,0.22), rgba(255,214,230,0.16))',
    stageFilterCss: 'brightness(1.02) saturate(1.1)',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#C43463]',
    accentEmojis: ['🍓', '🌸', '🩷', '🧁'],
    source: 'free',
    price: 0,
    isLegacy: true,
  },
  {
    id: 'forest',
    label: '森林',
    emoji: '🌲',
    backdropClass: 'bg-gradient-to-b from-[#CDEFD9] via-[#EBF9EE] to-[#F7F1D8]',
    overlayStyle: 'linear-gradient(180deg, rgba(160,225,185,0.2), rgba(240,235,205,0.15))',
    stageFilterCss: 'saturate(1.06)',
    badgeClass: 'bg-[#E7F7EE] border-[#A6DFC5] text-[#1F6B54]',
    accentEmojis: ['🌲', '🍄', '🍃', '🌼'],
    source: 'free',
    price: 0,
    isLegacy: true,
  },
  {
    id: 'cloud',
    label: '雲朵',
    emoji: '☁️',
    backdropClass: 'bg-gradient-to-b from-[#CBE2FF] via-[#EEF6FF] to-[#FFFDFB]',
    overlayStyle: 'linear-gradient(180deg, rgba(190,220,255,0.2), rgba(255,255,255,0.12))',
    stageFilterCss: 'brightness(1.04)',
    badgeClass: 'bg-[#EEF4FF] border-[#BFD4FA] text-[#355A9C]',
    accentEmojis: ['☁️', '🫧', '✨', '🌙'],
    source: 'free',
    price: 0,
    isLegacy: true,
  },
  {
    id: 'kitchen',
    label: '廚房',
    emoji: '🍳',
    backdropClass: 'bg-gradient-to-b from-[#FFE5BF] via-[#FFF8E8] to-[#FCE5D8]',
    overlayStyle: 'linear-gradient(180deg, rgba(255,220,165,0.2), rgba(252,229,216,0.15))',
    stageFilterCss: 'sepia(0.1) brightness(1.02)',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
    accentEmojis: ['🍳', '🥐', '🍮', '🍽️'],
    source: 'free',
    price: 0,
    isLegacy: true,
  },
  {
    id: 'party',
    label: '派對',
    emoji: '🎉',
    backdropClass: 'bg-gradient-to-b from-[#FFE3F0] via-[#FFF4D6] to-[#DCF6EC]',
    overlayStyle: 'linear-gradient(135deg, rgba(255,190,225,0.22), rgba(180,240,220,0.2))',
    stageFilterCss: 'saturate(1.18)',
    badgeClass: 'bg-[#FFF0F6] border-[#F4B4CB] text-[#B83B64]',
    accentEmojis: ['🎉', '🎈', '🎊', '🎂'],
    source: 'free',
    price: 0,
    isLegacy: true,
  },
];

export const STUDIO_SHOP_FILTERS = PHOTO_FILTERS.filter((f) => !f.isLegacy);

export interface PhotoFrameOption {
  id: PhotoFrame;
  label: string;
  emoji: string;
  outerClass: string;
  innerClass: string;
  cornerEmojis?: [string, string];
  isPolaroid?: boolean;
  isLace?: boolean;
  isGold?: boolean;
  source: StudioItemSource;
  price: number;
  requiresUnlock?: boolean;
  unlockHint?: string;
}

export const PHOTO_FRAMES: PhotoFrameOption[] = [
  {
    id: 'none',
    label: '無相框',
    emoji: '⬜',
    outerClass: 'rounded-2xl bg-transparent',
    innerClass: 'rounded-2xl overflow-hidden border border-[#F0DFD5]',
    source: 'free',
    price: 0,
  },
  {
    id: 'rounded',
    label: '圓角',
    emoji: '🖼️',
    outerClass: 'rounded-3xl bg-[#FFFDF8] border-4 border-[#F2D5C9] p-2 shadow-sm',
    innerClass: 'rounded-2xl overflow-hidden',
    source: 'shop',
    price: 40,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（40 金幣）',
  },
  {
    id: 'heart',
    label: '愛心',
    emoji: '🩷',
    outerClass:
      'rounded-[28px] bg-gradient-to-br from-[#FFD6E6] to-[#FFF0F5] border-4 border-[#FF8EB0] p-2.5 shadow-sm',
    innerClass: 'rounded-2xl overflow-hidden border-2 border-white/80',
    cornerEmojis: ['🩷', '💖'],
    source: 'shop',
    price: 60,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（60 金幣）',
  },
  {
    id: 'star',
    label: '星星',
    emoji: '⭐',
    outerClass:
      'rounded-3xl bg-gradient-to-br from-[#FFF1BA] to-[#F3EAFF] border-4 border-[#F2C94C] p-2.5 shadow-sm',
    innerClass: 'rounded-2xl overflow-hidden border-2 border-white/85',
    cornerEmojis: ['⭐', '✨'],
    source: 'shop',
    price: 80,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（80 金幣）',
  },
  {
    id: 'polaroid',
    label: '拍立得',
    emoji: '📸',
    outerClass: 'rounded-xl bg-white border-2 border-[#E6DCD4] p-2.5 pb-5 shadow-md',
    innerClass: 'rounded-md overflow-hidden border border-[#EAE0D8]',
    isPolaroid: true,
    source: 'shop',
    price: 120,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（120 金幣）',
  },
  {
    id: 'lace',
    label: '蕾絲',
    emoji: '🎀',
    outerClass:
      'rounded-[30px] bg-[#FFF8FB] border-[5px] border-dashed border-[#F7A8C4] p-2.5 shadow-sm ring-2 ring-[#FFE2EE]',
    innerClass: 'rounded-2xl overflow-hidden border-2 border-white',
    cornerEmojis: ['🎀', '🫧'],
    isLace: true,
    source: 'shop',
    price: 160,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（160 金幣）',
  },
  {
    id: 'gold',
    label: '金框',
    emoji: '👑',
    outerClass:
      'rounded-3xl bg-gradient-to-br from-[#FFF0B3] via-[#FFD766] to-[#FFF7DA] border-4 border-[#C98A12] p-2.5 shadow-md',
    innerClass: 'rounded-2xl overflow-hidden border-2 border-[#FFF8DF]',
    cornerEmojis: ['👑', '✨'],
    isGold: true,
    source: 'shop',
    price: 200,
    requiresUnlock: true,
    unlockHint: '於每週輪替攝影商店購買（200 金幣）',
  },
  {
    id: 'golden_memory',
    label: '金箔紀念',
    emoji: '🏅',
    outerClass:
      'rounded-3xl bg-gradient-to-br from-[#FFF3C4] via-[#FFE08A] to-[#FFF8E2] border-4 border-[#E6A222] p-2.5 shadow-md',
    innerClass: 'rounded-2xl overflow-hidden border-2 border-white/90',
    cornerEmojis: ['🏅', '✨'],
    source: 'achievement',
    price: 0,
    requiresUnlock: true,
    unlockHint: '達成「升上 Lv.4」里程碑解鎖',
  },
  {
    id: 'coop_heart',
    label: '共養心印',
    emoji: '💞',
    outerClass:
      'rounded-[28px] bg-gradient-to-br from-[#FFE0EC] via-[#FFF6E5] to-[#E0F7EE] border-4 border-[#F282A6] p-2.5 shadow-md',
    innerClass: 'rounded-2xl overflow-hidden border-2 border-white/90',
    cornerEmojis: ['💞', '🏡'],
    source: 'achievement',
    price: 0,
    requiresUnlock: true,
    unlockHint: '達成「共養 7 天」里程碑解鎖',
  },
];

export interface PhotoStickerOption {
  id: PhotoStickerId;
  label: string;
  emoji: string;
  price: number;
  positionClass: string;
}

export const PHOTO_STICKERS: PhotoStickerOption[] = [
  {
    id: 'heart',
    label: '愛心',
    emoji: '🩷',
    price: 20,
    positionClass: 'top-7 left-4 -rotate-12',
  },
  {
    id: 'kiss',
    label: '親親',
    emoji: '😘',
    price: 25,
    positionClass: 'top-7 right-4 rotate-12',
  },
  {
    id: 'burger',
    label: '漢堡',
    emoji: '🍔',
    price: 30,
    positionClass: 'bottom-7 left-4 -rotate-6',
  },
  {
    id: 'fries',
    label: '薯條',
    emoji: '🍟',
    price: 30,
    positionClass: 'bottom-7 right-4 rotate-6',
  },
  {
    id: 'carrot',
    label: '紅蘿蔔',
    emoji: '🥕',
    price: 35,
    positionClass: 'top-1/2 left-2.5 -translate-y-1/2 -rotate-12',
  },
  {
    id: 'star',
    label: '星星',
    emoji: '⭐',
    price: 40,
    positionClass: 'top-1/2 right-2.5 -translate-y-1/2 rotate-12',
  },
  {
    id: 'ribbon',
    label: '蝴蝶結',
    emoji: '🎀',
    price: 50,
    positionClass: 'top-3 left-1/4 -rotate-12',
  },
  {
    id: 'pudding',
    label: '布丁',
    emoji: '🍮',
    price: 60,
    positionClass: 'bottom-3 left-1/4 rotate-6',
  },
  {
    id: 'apple',
    label: '蘋果',
    emoji: '🍎',
    price: 65,
    positionClass: 'top-3 right-1/4 rotate-12',
  },
  {
    id: 'balloon',
    label: '氣球',
    emoji: '🎈',
    price: 75,
    positionClass: 'bottom-3 right-1/4 -rotate-6',
  },
  {
    id: 'moon',
    label: '月亮',
    emoji: '🌙',
    price: 90,
    positionClass: 'top-14 left-10 -rotate-6',
  },
  {
    id: 'fish',
    label: '小魚',
    emoji: '🐟',
    price: 100,
    positionClass: 'top-14 right-10 rotate-12',
  },
];

export interface PhotoSceneOption {
  id: PhotoScene;
  label: string;
  emoji: string;
  defaultTitleSuffix: string;
  badgeClass: string;
}

export const PHOTO_SCENES: PhotoSceneOption[] = [
  {
    id: 'wardrobe',
    label: '穿搭攝影棚',
    emoji: '🎀',
    defaultTitleSuffix: '穿搭寫真',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
  {
    id: 'room',
    label: '房間佈置',
    emoji: '🛋️',
    defaultTitleSuffix: '小屋合照',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
  },
  {
    id: 'farm',
    label: '開心農場',
    emoji: '🌱',
    defaultTitleSuffix: '農場紀念',
    badgeClass: 'bg-[#E5F8F0] border-[#A7E0CB] text-[#1F6B54]',
  },
  {
    id: 'album',
    label: '回憶寫真',
    emoji: '📸',
    defaultTitleSuffix: '幸福時刻',
    badgeClass: 'bg-[#EEF4FF] border-[#B6D1FA] text-[#2F5B9E]',
  },
  {
    id: 'visitor',
    label: '庭院訪客',
    emoji: '🐾',
    defaultTitleSuffix: '訪客紀念照',
    badgeClass: 'bg-[#E6F8F0] border-[#9ADBC2] text-[#1F6B54]',
  },
];

export const WEEKLY_OUTFIT_THEMES: WeeklyOutfitChallengeTheme[] = [
  {
    id: 'strawberry_sweet',
    title: '草莓甜心',
    emoji: '🍓',
    description: '穿上草莓甜心系列配件，搭配草莓田或粉紅濾鏡拍出甜美寫真！',
    requiredAccessoryTheme: 'strawberry_sweet',
    targetBackgroundId: 'strawberry_field',
    targetFilterId: 'pink',
    targetFrameId: 'heart',
    duoPrompt: '一起穿草莓甜心！兩位共養夥伴各自穿上甜系配件拍雙人合照～',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
  {
    id: 'forest_camp',
    title: '森林露營',
    emoji: '⛺',
    description: '換上森林露營套裝，到森林露營營地與薄荷濾鏡留下野趣紀念！',
    requiredAccessoryTheme: 'forest_camp',
    targetBackgroundId: 'forest_camp',
    targetFilterId: 'mint',
    targetFrameId: 'rounded',
    duoPrompt: '一起森系露營！攜手穿戴露營裝備拍出帳篷雙人合照～',
    badgeClass: 'bg-[#E7F7EE] border-[#A6DFC5] text-[#1F6B54]',
  },
  {
    id: 'cloud_nap',
    title: '雲朵午睡',
    emoji: '☁️',
    description: '穿戴雲朵午睡系列配件，在雲朵天空與奶油濾鏡裡軟綿綿入鏡！',
    requiredAccessoryTheme: 'cloud_nap',
    targetBackgroundId: 'cloud_sky',
    targetFilterId: 'cream',
    targetFrameId: 'lace',
    duoPrompt: '一起雲端午睡！兩人各自搭配軟綿睡衣與雲朵配件拍夢幻合照～',
    badgeClass: 'bg-[#EEF4FF] border-[#BFD4FA] text-[#355A9C]',
  },
  {
    id: 'chef_master',
    title: '廚師小當家',
    emoji: '👩‍🍳',
    description: '戴上廚師小當家全套裝備，在溫馨廚房拍出食堂主廚大片！',
    requiredAccessoryTheme: 'chef_master',
    targetBackgroundId: 'kitchen',
    targetFilterId: 'cream',
    targetFrameId: 'polaroid',
    duoPrompt: '一起當食堂主廚！夥伴各自穿好料理裝在廚房拍美味雙人照～',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
  },
  {
    id: 'starry_explorer',
    title: '星空探險',
    emoji: '🚀',
    description: '裝備星空探險造型，在星空夜市與星空濾鏡下展開銀河攝影冒險！',
    requiredAccessoryTheme: 'starry_explorer',
    targetBackgroundId: 'starry_night_market',
    targetFilterId: 'starry',
    targetFrameId: 'star',
    duoPrompt: '一起星空大冒險！兩位夥伴穿上星空配件拍攝閃耀雙人合影～',
    badgeClass: 'bg-[#EFEAFF] border-[#C9BDF2] text-[#5B449C]',
  },
];

export const STUDIO_CRAFT_RECIPES: StudioCraftRecipe[] = [
  {
    id: 'craft_bg_sakura_path',
    targetKind: 'background',
    targetId: 'sakura_path',
    name: '限定背景：櫻花小徑',
    emoji: '🌸',
    description: '用週挑戰收集的攝影材料合成唯美飄櫻場景！',
    materialCost: 2,
    frameShardCost: 0,
    coinCost: 80,
  },
  {
    id: 'craft_bg_halloween_party',
    targetKind: 'background',
    targetId: 'halloween_party',
    name: '限定背景：萬聖節派對',
    emoji: '🎃',
    description: '凝聚攝影靈感與材料，開啟南瓜城堡夜派對場景！',
    materialCost: 3,
    frameShardCost: 1,
    coinCost: 100,
  },
  {
    id: 'craft_bg_christmas_cabin',
    targetKind: 'background',
    targetId: 'christmas_cabin',
    name: '限定背景：聖誕小屋',
    emoji: '🎄',
    description: '結合溫馨攝影材料與相框碎片，點亮雪夜壁爐木屋！',
    materialCost: 3,
    frameShardCost: 1,
    coinCost: 120,
  },
  {
    id: 'craft_frame_lace',
    targetKind: 'frame',
    targetId: 'lace',
    name: '手作精工：蕾絲相框',
    emoji: '🎀',
    description: '也可使用限定相框碎片提早縫製浪漫蕾絲邊框！',
    materialCost: 1,
    frameShardCost: 1,
    coinCost: 40,
  },
  {
    id: 'craft_frame_gold',
    targetKind: 'frame',
    targetId: 'gold',
    name: '手作精工：華麗金框',
    emoji: '👑',
    description: '使用限定相框碎片鍛造閃耀皇室金框！',
    materialCost: 1,
    frameShardCost: 2,
    coinCost: 60,
  },
  {
    id: 'craft_filter_candy',
    targetKind: 'filter',
    targetId: 'candy',
    name: '特調濾鏡：糖果色彩',
    emoji: '🍬',
    description: '用攝影材料特調夢幻高飽和糖果光澤濾鏡！',
    materialCost: 2,
    frameShardCost: 0,
    coinCost: 50,
  },
];

export interface StudioBadgeDefinition {
  id: StudioBadgeId;
  name: string;
  emoji: string;
  description: string;
  conditionText: string;
  badgeClass: string;
}

export const STUDIO_BADGES: Record<StudioBadgeId, StudioBadgeDefinition> = {
  outfit_master: {
    id: 'outfit_master',
    name: '穿搭達人',
    emoji: '👗',
    description: '連續 3 週在每週穿搭主題挑戰突破 100 分的時尚達人！',
    conditionText: '連續 3 週於每週穿搭主題挑戰達 100 分以上',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
};

export const PHOTO_POSE_BY_ID: Record<PhotoPose, PhotoPoseOption> = PHOTO_POSES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<PhotoPose, PhotoPoseOption>
);

export const PHOTO_BACKGROUND_BY_ID: Record<PhotoBackground, PhotoBackgroundOption> =
  PHOTO_BACKGROUNDS.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<PhotoBackground, PhotoBackgroundOption>);

export const PHOTO_FILTER_BY_ID: Record<PhotoFilter, PhotoFilterOption> = PHOTO_FILTERS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<PhotoFilter, PhotoFilterOption>
);

export const PHOTO_FRAME_BY_ID: Record<PhotoFrame, PhotoFrameOption> = PHOTO_FRAMES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<PhotoFrame, PhotoFrameOption>
);

export const PHOTO_STICKER_BY_ID: Record<PhotoStickerId, PhotoStickerOption> =
  PHOTO_STICKERS.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<PhotoStickerId, PhotoStickerOption>
  );

export const PHOTO_SCENE_BY_ID: Record<PhotoScene, PhotoSceneOption> = PHOTO_SCENES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<PhotoScene, PhotoSceneOption>
);
