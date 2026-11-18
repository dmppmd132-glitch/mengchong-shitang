import {
  PetExpression,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScene,
  PhotoStickerId,
  PiggyActionState,
} from '../types';

export interface PhotoPoseOption {
  id: PhotoPose;
  label: string;
  emoji: string;
  action: PiggyActionState;
  expression: PetExpression;
  animClass: string;
  description: string;
  requiresUnlock?: boolean;
  unlockHint?: string;
}

export const PHOTO_POSES: PhotoPoseOption[] = [
  {
    id: 'happy',
    label: '開心',
    emoji: '😄',
    action: 'petted',
    expression: 'happyTongue',
    animClass: 'animate-piggy-jump',
    description: '露齒燦笑開心跳跳！',
  },
  {
    id: 'shy',
    label: '害羞',
    emoji: '😳',
    action: 'idle',
    expression: 'shy',
    animClass: 'animate-piggy-float',
    description: '臉頰泛紅小小扭捏～',
  },
  {
    id: 'sleep',
    label: '睡覺',
    emoji: '😴',
    action: 'sleeping',
    expression: 'normal',
    animClass: '',
    description: '安詳閉眼呼嚕打盹 Zzz',
  },
  {
    id: 'eat',
    label: '吃東西',
    emoji: '😋',
    action: 'eating',
    expression: 'sparkle',
    animClass: 'animate-piggy-chew',
    description: '眼睛閃亮亮大口咬咬！',
  },
  {
    id: 'dance',
    label: '跳舞',
    emoji: '💃',
    action: 'walking',
    expression: 'wink',
    animClass: 'animate-pose-dance',
    description: '左右搖擺活力起舞！',
  },
  {
    id: 'salute',
    label: '敬禮',
    emoji: '🫡',
    action: 'idle',
    expression: 'wink',
    animClass: 'animate-pose-salute',
    description: '精神飽滿舉手敬禮報告！',
  },
  {
    id: 'crown_star',
    label: '明星閃耀',
    emoji: '🌟',
    action: 'petted',
    expression: 'sparkle',
    animClass: 'animate-piggy-jump',
    description: '里程碑限定！大明星擺拍姿勢',
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
    requiresUnlock: true,
    unlockHint: '達成「100 天紀念」里程碑解鎖',
  },
];

export interface PhotoFilterOption {
  id: PhotoFilter;
  label: string;
  emoji: string;
  backdropClass: string;
  badgeClass: string;
  accentEmojis: [string, string, string, string];
}

export const PHOTO_FILTERS: PhotoFilterOption[] = [
  {
    id: 'strawberry',
    label: '草莓',
    emoji: '🍓',
    backdropClass: 'bg-gradient-to-b from-[#FFD8E6] via-[#FFF0F5] to-[#FFE8CF]',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#C43463]',
    accentEmojis: ['🍓', '🌸', '🩷', '🧁'],
  },
  {
    id: 'forest',
    label: '森林',
    emoji: '🌲',
    backdropClass: 'bg-gradient-to-b from-[#CDEFD9] via-[#EBF9EE] to-[#F7F1D8]',
    badgeClass: 'bg-[#E7F7EE] border-[#A6DFC5] text-[#1F6B54]',
    accentEmojis: ['🌲', '🍄', '🍃', '🌼'],
  },
  {
    id: 'cloud',
    label: '雲朵',
    emoji: '☁️',
    backdropClass: 'bg-gradient-to-b from-[#CBE2FF] via-[#EEF6FF] to-[#FFFDFB]',
    badgeClass: 'bg-[#EEF4FF] border-[#BFD4FA] text-[#355A9C]',
    accentEmojis: ['☁️', '🫧', '✨', '🌙'],
  },
  {
    id: 'kitchen',
    label: '廚房',
    emoji: '🍳',
    backdropClass: 'bg-gradient-to-b from-[#FFE5BF] via-[#FFF8E8] to-[#FCE5D8]',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
    accentEmojis: ['🍳', '🥐', '🍮', '🍽️'],
  },
  {
    id: 'starry',
    label: '星空',
    emoji: '🌌',
    backdropClass: 'bg-gradient-to-b from-[#3B2E6B] via-[#594B94] to-[#2B2552]',
    badgeClass: 'bg-[#EFEAFF] border-[#C9BDF2] text-[#5B449C]',
    accentEmojis: ['⭐', '🪐', '✨', '🌙'],
  },
  {
    id: 'party',
    label: '派對',
    emoji: '🎉',
    backdropClass: 'bg-gradient-to-b from-[#FFE3F0] via-[#FFF4D6] to-[#DCF6EC]',
    badgeClass: 'bg-[#FFF0F6] border-[#F4B4CB] text-[#B83B64]',
    accentEmojis: ['🎉', '🎈', '🎊', '🎂'],
  },
];

export interface PhotoFrameOption {
  id: PhotoFrame;
  label: string;
  emoji: string;
  outerClass: string;
  innerClass: string;
  cornerEmojis?: [string, string];
  isPolaroid?: boolean;
  requiresUnlock?: boolean;
  unlockHint?: string;
}

export const PHOTO_FRAMES: PhotoFrameOption[] = [
  {
    id: 'rounded',
    label: '圓角',
    emoji: '🖼️',
    outerClass: 'rounded-3xl bg-[#FFFDF8] border-4 border-[#F2D5C9] p-2 shadow-sm',
    innerClass: 'rounded-2xl overflow-hidden',
  },
  {
    id: 'heart',
    label: '愛心',
    emoji: '🩷',
    outerClass:
      'rounded-[28px] bg-gradient-to-br from-[#FFD6E6] to-[#FFF0F5] border-4 border-[#FF8EB0] p-2.5 shadow-sm',
    innerClass: 'rounded-2xl overflow-hidden border-2 border-white/80',
    cornerEmojis: ['🩷', '💖'],
  },
  {
    id: 'star',
    label: '星星',
    emoji: '⭐',
    outerClass:
      'rounded-3xl bg-gradient-to-br from-[#FFF1BA] to-[#F3EAFF] border-4 border-[#F2C94C] p-2.5 shadow-sm',
    innerClass: 'rounded-2xl overflow-hidden border-2 border-white/85',
    cornerEmojis: ['⭐', '✨'],
  },
  {
    id: 'polaroid',
    label: '拍立得',
    emoji: '📸',
    outerClass: 'rounded-xl bg-white border-2 border-[#E6DCD4] p-2.5 pb-6 shadow-md',
    innerClass: 'rounded-md overflow-hidden border border-[#EAE0D8]',
    isPolaroid: true,
  },
  {
    id: 'golden_memory',
    label: '金箔紀念',
    emoji: '🏅',
    outerClass:
      'rounded-3xl bg-gradient-to-br from-[#FFF3C4] via-[#FFE08A] to-[#FFF8E2] border-4 border-[#E6A222] p-2.5 shadow-md',
    innerClass: 'rounded-2xl overflow-hidden border-2 border-white/90',
    cornerEmojis: ['🏅', '✨'],
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
    requiresUnlock: true,
    unlockHint: '達成「共養 7 天」里程碑解鎖',
  },
];

export interface PhotoStickerOption {
  id: PhotoStickerId;
  label: string;
  emoji: string;
  positionClass: string;
}

export const PHOTO_STICKERS: PhotoStickerOption[] = [
  {
    id: 'heart',
    label: '愛心',
    emoji: '🩷',
    positionClass: 'top-7 left-4 -rotate-12',
  },
  {
    id: 'kiss',
    label: '親親',
    emoji: '😘',
    positionClass: 'top-7 right-4 rotate-12',
  },
  {
    id: 'burger',
    label: '漢堡',
    emoji: '🍔',
    positionClass: 'bottom-7 left-4 -rotate-6',
  },
  {
    id: 'fries',
    label: '薯條',
    emoji: '🍟',
    positionClass: 'bottom-7 right-4 rotate-6',
  },
  {
    id: 'carrot',
    label: '紅蘿蔔',
    emoji: '🥕',
    positionClass: 'top-1/2 left-2.5 -translate-y-1/2 -rotate-12',
  },
  {
    id: 'star',
    label: '星星',
    emoji: '⭐',
    positionClass: 'top-1/2 right-2.5 -translate-y-1/2 rotate-12',
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
    label: '衣櫥穿搭',
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
];

export const PHOTO_POSE_BY_ID: Record<PhotoPose, PhotoPoseOption> = PHOTO_POSES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<PhotoPose, PhotoPoseOption>
);

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
