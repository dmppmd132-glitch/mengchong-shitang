import { GrowthStageInfo, Pet, PetSpecies, TitleId } from '../types';

export const MAX_STAGE_GROWTH = 500;
export const PRESTIGE_STAR_STEP = 200;
export const PRESTIGE_STAR_REWARD_COINS = 100;

export interface EvolutionMilestoneMeta {
  level: 0 | 1 | 2 | 3 | 4;
  badgeLabel: string;
  titleId: TitleId | null;
  accessoryIds: string[];
  highlightFeature: string;
}

export const EVOLUTION_MILESTONE_META: Record<0 | 1 | 2 | 3 | 4, EvolutionMilestoneMeta> = {
  0: {
    level: 0,
    badgeLabel: '孵化起點',
    titleId: null,
    accessoryIds: ['pink_bow', 'round_glasses'],
    highlightFeature: '輕點蛋殼破殼報到，開啟 5 大配件欄位（頭・臉・頸・手・背）與新手穿搭禮',
  },
  1: {
    level: 1,
    badgeLabel: 'Lv.1 初期寶寶',
    titleId: 'growth_sprout',
    accessoryIds: ['baby_bib'],
    highlightFeature: '解鎖可愛圍兜穿搭與專屬稱號「破殼萌芽星」',
  },
  2: {
    level: 2,
    badgeLabel: 'Lv.2 圓潤成長',
    titleId: 'growth_chubby',
    accessoryIds: ['birthday_mini_crown'],
    highlightFeature: '解鎖第 6 欄位「身體」穿搭、生日小皇冠與專屬稱號「圓滾幸福團」',
  },
  3: {
    level: 3,
    badgeLabel: 'Lv.3 元氣綻放',
    titleId: 'growth_radiant',
    accessoryIds: ['starlight_spark_pin'],
    highlightFeature: '解鎖閃亮元氣雙頰光暈、星願閃亮髮夾與專屬稱號「元氣閃亮星」',
  },
  4: {
    level: 4,
    badgeLabel: 'Lv.4 巔峰巨星',
    titleId: 'growth_superstar',
    accessoryIds: ['superstar_star_wand'],
    highlightFeature: '解鎖金星光環、閃耀星等循環（+100 金幣/★）、巨星閃耀手杖與「食堂超級巨星」',
  },
};

export const GROWTH_STAGES: GrowthStageInfo[] = [
  {
    level: 1,
    name: '粉嫩小豬',
    minGrowth: 0,
    nextGrowth: 100,
    tagline: '剛破殼的軟萌寶寶，最喜歡吃熱呼呼的點心。',
    unlockFeature: '可使用頭部、臉部、脖子、手持、背部配件',
    bodyScaleX: 0.94,
    bodyScaleY: 0.94,
    unlockedSlots: ['head', 'face', 'neck', 'held', 'back'],
  },
  {
    level: 2,
    name: '圓滾小豬',
    minGrowth: 100,
    nextGrowth: 250,
    tagline: '臉頰鼓鼓、肚肚軟綿綿，解鎖「身體」穿搭欄位！',
    unlockFeature: '解鎖「身體」配件欄位 + 圓潤體型',
    bodyScaleX: 1.03,
    bodyScaleY: 1.0,
    unlockedSlots: ['head', 'face', 'neck', 'body', 'held', 'back'],
  },
  {
    level: 3,
    name: '元氣小豬',
    minGrowth: 250,
    nextGrowth: 500,
    tagline: '眼神閃閃發光，每天充滿活力在食堂跑跳！',
    unlockFeature: '解鎖閃亮元氣表情與粉紅雙頰光暈',
    bodyScaleX: 1.06,
    bodyScaleY: 1.05,
    unlockedSlots: ['head', 'face', 'neck', 'body', 'held', 'back'],
  },
  {
    level: 4,
    name: '時尚大豬',
    minGrowth: 500,
    nextGrowth: null,
    tagline: '萌寵食堂的超級明星，全身穿搭氣場滿分！',
    unlockFeature: '解鎖專屬金星光環與閃耀星等循環獎勵',
    bodyScaleX: 1.12,
    bodyScaleY: 1.09,
    unlockedSlots: ['head', 'face', 'neck', 'body', 'held', 'back'],
  },
];

export const SPECIES_STAGE_LOCALIZATION: Record<
  PetSpecies,
  Record<number, { name: string; tagline: string }>
> = {
  pig: {
    1: {
      name: '粉嫩小豬',
      tagline: '剛破殼的軟萌寶寶，最喜歡吃熱呼呼的點心。',
    },
    2: {
      name: '圓滾小豬',
      tagline: '臉頰鼓鼓、肚肚軟綿綿，解鎖「身體」穿搭欄位！',
    },
    3: {
      name: '元氣小豬',
      tagline: '眼神閃閃發光，每天充滿活力在食堂跑跳！',
    },
    4: {
      name: '時尚大豬',
      tagline: '萌寵食堂的超級明星，全身穿搭氣場滿分！',
    },
  },
  rabbit: {
    1: {
      name: '棉花小兔',
      tagline: '耳朵軟綿綿的兔寶寶，最期待香脆紅蘿蔔與摸摸。',
    },
    2: {
      name: '蓬蓬垂耳兔',
      tagline: '毛毛變得更加蓬鬆柔暖，解鎖「身體」穿搭欄位！',
    },
    3: {
      name: '元氣跳跳兔',
      tagline: '眼睛像星光一樣閃亮，每天在食堂輕快跳躍！',
    },
    4: {
      name: '星光垂耳兔',
      tagline: '萌寵食堂的夢幻人氣偶像，全身散發柔美星光！',
    },
  },
  dog: {
    1: {
      name: '奶油小奶柴',
      tagline: '搖著小尾巴的奶油狗寶寶，最喜歡肉肉便當！',
    },
    2: {
      name: '圓滾小柴',
      tagline: '臉頰Q彈飽滿超好揉，解鎖「身體」穿搭欄位！',
    },
    3: {
      name: '元氣飛耳柴',
      tagline: '眼神充滿朝氣與光芒，散步活力永遠一百分！',
    },
    4: {
      name: '明星大柴',
      tagline: '萌寵食堂的陽光看板明星，帥氣可愛兼具！',
    },
  },
  cat: {
    1: {
      name: '蜜桃小奶貓',
      tagline: '輕手輕腳的軟萌小貓，最喜歡照鏡子與品嘗布丁。',
    },
    2: {
      name: '圓臉橘白貓',
      tagline: '毛色閃耀溫柔光澤，解鎖「身體」穿搭欄位！',
    },
    3: {
      name: '優雅星瞳貓',
      tagline: '眼神像琥珀寶石一樣閃亮，拍照永遠自帶焦點！',
    },
    4: {
      name: '皇家焦糖貓',
      tagline: '萌寵食堂的氣質偶像，一舉一動都迷倒全場！',
    },
  },
  duck: {
    1: {
      name: '奶油小黃鴨',
      tagline: '頭頂翹起呆毛的小鴨寶寶，最愛在庭院打招呼。',
    },
    2: {
      name: '澎澎陽光鴨',
      tagline: '羽毛變得如雲朵般蓬鬆，解鎖「身體」穿搭欄位！',
    },
    3: {
      name: '元氣迎賓鴨',
      tagline: '翅膀拍動充滿陽光朝氣，小動物訪客最愛找牠玩！',
    },
    4: {
      name: '黃金派對鴨',
      tagline: '庭院裡的快樂小太陽，走到哪裡都洋溢笑聲！',
    },
  },
  hamster: {
    1: {
      name: '迷你奶蓋鼠',
      tagline: '能捧在掌心的小小倉鼠，腮幫子總是鼓鼓的。',
    },
    2: {
      name: '蓬蓬泡芙鼠',
      tagline: '軟綿綿像一顆小泡芙，解鎖「身體」穿搭欄位！',
    },
    3: {
      name: '尋寶囤糧鼠',
      tagline: '眼睛亮晶晶地尋找美味食材，勤勞又可愛！',
    },
    4: {
      name: '皇家松果鼠',
      tagline: '萌寵食堂最受寵的掌中明星，隨時散發療癒魔力！',
    },
  },
};

export interface StageLevelRewardConfig {
  coins: number;
  foodId?: string;
  foodQty?: number;
  rewardText: string;
}

export const STAGE_LEVEL_REWARDS: Record<number, StageLevelRewardConfig> = {
  2: {
    coins: 80,
    rewardText: '+80 金幣',
  },
  3: {
    coins: 120,
    foodId: 'caramel_pudding',
    foodQty: 1,
    rewardText: '+120 金幣 · 焦糖布丁 ×1',
  },
  4: {
    coins: 200,
    foodId: 'sunflower_bento',
    foodQty: 1,
    rewardText: '+200 金幣 · 向日葵元氣餐盒 ×1',
  },
};

export interface GrowthSourceGuideItem {
  id: string;
  emoji: string;
  label: string;
  gainText: string;
  hint: string;
}

export const GROWTH_SOURCES_GUIDE: GrowthSourceGuideItem[] = [
  {
    id: 'feed',
    emoji: '🍱',
    label: '餵食美味料理',
    gainText: '+10 ~ +24',
    hint: '餵食寵物最愛料理再額外 +4 成長值',
  },
  {
    id: 'balance',
    emoji: '✨',
    label: '元氣滿分狀態加成',
    gainText: '+25% 額外加成',
    hint: '飽食、心情、清潔、精力皆達 70% 以上觸發',
  },
  {
    id: 'walk',
    emoji: '🌿',
    label: '外出散步消化',
    gainText: '+8',
    hint: '晴天散步額外提升心情與親密度',
  },
  {
    id: 'bath',
    emoji: '🫧',
    label: '香噴噴泡泡浴',
    gainText: '+6',
    hint: '大幅恢復清潔度並同步推進每日任務',
  },
  {
    id: 'pet',
    emoji: '🩷',
    label: '互動摸摸',
    gainText: '+5',
    hint: '輕點頭頂、臉頰、肚肚或小手手都有效',
  },
  {
    id: 'sleep',
    emoji: '💤',
    label: '安心午睡充電',
    gainText: '+4',
    hint: '補充精力維持均衡滿分狀態',
  },
  {
    id: 'minigame',
    emoji: '🎮',
    label: '食堂趣味小遊戲',
    gainText: '+4 ~ +10',
    hint: '高分與完成挑戰任務都有成長值獎勵',
  },
  {
    id: 'cook',
    emoji: '🍳',
    label: '農場手作料理',
    gainText: '+10 ~ +24',
    hint: '合成料理與完成共養目標皆可加速成長',
  },
];

export function getSpeciesStages(species: PetSpecies = 'pig'): GrowthStageInfo[] {
  const localized = SPECIES_STAGE_LOCALIZATION[species] ?? SPECIES_STAGE_LOCALIZATION.pig;
  return GROWTH_STAGES.map((stage) => {
    const custom = localized[stage.level];
    if (!custom) return stage;
    return {
      ...stage,
      name: custom.name,
      tagline: custom.tagline,
    };
  });
}

export function getGrowthStage(
  growth: number,
  species: PetSpecies = 'pig'
): GrowthStageInfo {
  const stages = getSpeciesStages(species);
  let current = stages[0];
  for (const stage of stages) {
    if (growth >= stage.minGrowth) {
      current = stage;
    }
  }
  return current;
}

export interface PrestigeStarInfo {
  isPrestigeActive: boolean;
  stars: number;
  currentStarProgress: number;
  step: number;
  remainingToNextStar: number;
  nextStarTarget: number;
  progressPercent: number;
}

export function getPrestigeStarInfo(growth: number): PrestigeStarInfo {
  if (growth < MAX_STAGE_GROWTH) {
    return {
      isPrestigeActive: false,
      stars: 0,
      currentStarProgress: 0,
      step: PRESTIGE_STAR_STEP,
      remainingToNextStar: MAX_STAGE_GROWTH - growth,
      nextStarTarget: MAX_STAGE_GROWTH,
      progressPercent: 0,
    };
  }
  const overflow = Math.max(0, growth - MAX_STAGE_GROWTH);
  const stars = Math.floor(overflow / PRESTIGE_STAR_STEP);
  const currentStarProgress = overflow % PRESTIGE_STAR_STEP;
  const remainingToNextStar = PRESTIGE_STAR_STEP - currentStarProgress;
  const nextStarTarget = MAX_STAGE_GROWTH + (stars + 1) * PRESTIGE_STAR_STEP;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentStarProgress / PRESTIGE_STAR_STEP) * 100))
  );

  return {
    isPrestigeActive: true,
    stars,
    currentStarProgress,
    step: PRESTIGE_STAR_STEP,
    remainingToNextStar,
    nextStarTarget,
    progressPercent,
  };
}

export function getGrowthRemaining(
  growth: number,
  species: PetSpecies = 'pig'
): {
  currentStage: GrowthStageInfo;
  nextStage: GrowthStageInfo | null;
  remaining: number;
  progressPercent: number;
  prestigeStars: number;
  isPrestigeActive: boolean;
  nextStarTarget: number;
} {
  const stages = getSpeciesStages(species);
  const currentStage = getGrowthStage(growth, species);
  const nextStage = stages.find((s) => s.level === currentStage.level + 1) ?? null;
  const prestige = getPrestigeStarInfo(growth);

  if (!nextStage || currentStage.nextGrowth === null) {
    return {
      currentStage,
      nextStage: null,
      remaining: prestige.remainingToNextStar,
      progressPercent: prestige.progressPercent,
      prestigeStars: prestige.stars,
      isPrestigeActive: true,
      nextStarTarget: prestige.nextStarTarget,
    };
  }

  const span = currentStage.nextGrowth - currentStage.minGrowth;
  const gained = growth - currentStage.minGrowth;
  const remaining = Math.max(0, currentStage.nextGrowth - growth);
  const progressPercent = Math.min(100, Math.max(0, Math.round((gained / span) * 100)));

  return {
    currentStage,
    nextStage,
    remaining,
    progressPercent,
    prestigeStars: 0,
    isPrestigeActive: false,
    nextStarTarget: currentStage.nextGrowth,
  };
}

export function isCareBalanced(
  pet: Pick<Pet, 'hunger' | 'mood' | 'cleanliness' | 'energy'>
): boolean {
  return (
    pet.hunger >= 70 &&
    pet.mood >= 70 &&
    pet.cleanliness >= 70 &&
    pet.energy >= 70
  );
}

export function computeGrowthGain(
  baseGain: number,
  pet: Pick<Pet, 'hunger' | 'mood' | 'cleanliness' | 'energy'>
): {
  total: number;
  base: number;
  balanceBonus: number;
  isBalanced: boolean;
} {
  const safeBase = Math.max(0, Math.round(baseGain));
  const balanced = isCareBalanced(pet);
  const balanceBonus =
    balanced && safeBase > 0 ? Math.max(1, Math.round(safeBase * 0.25)) : 0;
  return {
    total: safeBase + balanceBonus,
    base: safeBase,
    balanceBonus,
    isBalanced: balanced,
  };
}

export interface RoundnessTier {
  label: string;
  description: string;
  badgeTone: 'mint' | 'cream' | 'pink' | 'berry';
}

export function getRoundnessTier(roundness: number): RoundnessTier {
  if (roundness < 25) {
    return {
      label: '小巧輕盈',
      description: '身手矯健，適合再多吃點美味點心！',
      badgeTone: 'mint',
    };
  }
  if (roundness < 50) {
    return {
      label: '小圓',
      description: '微微圓潤的線條，抱起來剛剛好舒服。',
      badgeTone: 'cream',
    };
  }
  if (roundness < 80) {
    return {
      label: '圓滾滾',
      description: '軟綿綿的幸福肉肉感，可愛度爆表！',
      badgeTone: 'pink',
    };
  }
  return {
    label: '超級圓',
    description: '圓嘟嘟像顆小麻糬，偶爾散步也很舒壓喔！',
    badgeTone: 'berry',
  };
}
