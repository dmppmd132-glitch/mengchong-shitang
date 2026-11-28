import {
  CoopPhotoTaskKey,
  CoopPhotoTaskStep,
  PetSpecies,
  PhotoContestId,
  PhotoContestTheme,
  PhotoSubmission,
} from '../../types';
import { getRankTierForScore } from './rules';

export interface CoopPhotoTaskTemplate {
  key: CoopPhotoTaskKey;
  label: string;
  emoji: string;
  target: number;
  hint: string;
}

export const COOP_PHOTO_TASK_TEMPLATES: CoopPhotoTaskTemplate[] = [
  {
    key: 'outfit',
    label: '一起穿搭',
    emoji: '👗',
    target: 2,
    hint: '兩位共養夥伴各自搭配主題配件與拍照姿勢（進度 X / 2）',
  },
  {
    key: 'decor',
    label: '一起佈置',
    emoji: '🎨',
    target: 2,
    hint: '選好攝影背景與濾鏡特效佈置雙人舞台（進度 X / 2）',
  },
  {
    key: 'vote',
    label: '一起投票',
    emoji: '🗳️',
    target: 10,
    hint: '每人投票 5 次，合計幫比賽作品投出 10 票（進度 X / 10）',
  },
  {
    key: 'submit',
    label: '一起提交',
    emoji: '📸',
    target: 1,
    hint: '攜手拍下並送出 1 張共養攝影比賽雙人作品',
  },
];

export function buildInitialCoopPhotoSteps(): CoopPhotoTaskStep[] {
  return COOP_PHOTO_TASK_TEMPLATES.map((tpl) => ({
    key: tpl.key,
    label: tpl.label,
    emoji: tpl.emoji,
    progress: 0,
    target: tpl.target,
    contributorUserIds: [],
    contributorNames: [],
  }));
}

export const COOP_PHOTO_REWARDS = {
  coins: 280,
  materials: 4,
  tickets: 30,
  intimacy: 12,
  streakBadgeWeeks: 3,
  streakTitleWeeks: 5,
} as const;

interface ShowcasePreset {
  idSuffix: string;
  species: PetSpecies;
  petName: string;
  equipped: Record<'head' | 'face' | 'neck' | 'body' | 'held' | 'back', string | null>;
  title: string;
  caption: string;
  baseScore: {
    themeMatch: number;
    outfitCompleteness: number;
    photoCompletion: number;
    creativityBonus: number;
    popularityVotes: number;
  };
}

const SHOWCASE_PRESETS_BY_THEME: Record<PhotoContestId, ShowcasePreset[]> = {
  strawberry_sweet: [
    {
      idSuffix: 'sc1',
      species: 'rabbit',
      petName: '雪球莓',
      equipped: {
        head: 'strawberry_clip',
        face: 'blush_stickers',
        neck: 'lace_choker',
        body: 'strawberry_cape',
        held: 'strawberry_icecream',
        back: null,
      },
      title: '草莓奶霜午茶',
      caption: '陽光灑在草莓園裡，甜甜奶油味融化了一整個午後！',
      baseScore: { themeMatch: 38, outfitCompleteness: 23, photoCompletion: 18, creativityBonus: 9, popularityVotes: 4 },
    },
    {
      idSuffix: 'sc2',
      species: 'cat',
      petName: '奶茶喵',
      equipped: {
        head: 'pink_bow',
        face: null,
        neck: 'ribbon_bell',
        body: 'strawberry_cape',
        held: 'strawberry_icecream',
        back: null,
      },
      title: '粉紅草莓甜心',
      caption: '戴上最喜歡的粉嫩蝴蝶結和草莓甜筒報到囉！',
      baseScore: { themeMatch: 34, outfitCompleteness: 20, photoCompletion: 17, creativityBonus: 8, popularityVotes: 3 },
    },
    {
      idSuffix: 'sc3',
      species: 'pig',
      petName: '小桃酥',
      equipped: {
        head: 'strawberry_clip',
        face: 'star_glasses',
        neck: 'pearl_necklace',
        body: null,
        held: null,
        back: 'little_angel_wings',
      },
      title: '果園散步寫真',
      caption: '偷偷把星星眼鏡配在草莓髮夾旁，意外很有雜誌感！',
      baseScore: { themeMatch: 30, outfitCompleteness: 17, photoCompletion: 16, creativityBonus: 7, popularityVotes: 3 },
    },
  ],
  forest_camp: [
    {
      idSuffix: 'fc1',
      species: 'rabbit',
      petName: '栗子球',
      equipped: {
        head: 'mushroom_hat',
        face: null,
        neck: 'camp_scarf',
        body: 'forest_cloak',
        held: 'little_lantern',
        back: 'acorn_bag',
      },
      title: '營火邊的橡果夜',
      caption: '提著小燈籠走進橡果森林，今晚營地滿是松木香氣！',
      baseScore: { themeMatch: 39, outfitCompleteness: 22, photoCompletion: 19, creativityBonus: 9, popularityVotes: 4 },
    },
    {
      idSuffix: 'fc2',
      species: 'dog',
      petName: '阿柴',
      equipped: {
        head: 'town_deer_antlers',
        face: 'round_shades',
        neck: 'camp_scarf',
        body: null,
        held: null,
        back: 'acorn_bag',
      },
      title: '林道探險隊長',
      caption: '背起橡果背包準備去尋找森林最美的落葉小路～',
      baseScore: { themeMatch: 35, outfitCompleteness: 17, photoCompletion: 16, creativityBonus: 8, popularityVotes: 3 },
    },
    {
      idSuffix: 'fc3',
      species: 'hamster',
      petName: '栗米團',
      equipped: {
        head: 'mushroom_hat',
        face: null,
        neck: null,
        body: 'forest_cloak',
        held: 'little_lantern',
        back: null,
      },
      title: '小小蘑菇露營客',
      caption: '躲進帳篷聽微風吹過樹梢的聲音，治癒度滿分！',
      baseScore: { themeMatch: 32, outfitCompleteness: 13, photoCompletion: 15, creativityBonus: 7, popularityVotes: 2 },
    },
  ],
  cloud_nap: [
    {
      idSuffix: 'cn1',
      species: 'pig',
      petName: '綿綿豬',
      equipped: {
        head: 'cloud_sleep_cap',
        face: 'sleep_mask',
        neck: 'cloud_bib',
        body: 'fluffy_pajama',
        held: 'plush_bunny_doll',
        back: 'little_angel_wings',
      },
      title: '軟綿雲海午睡',
      caption: '抱著兔兔玩偶飄在棉花糖雲朵上，夢裡都是甜的～',
      baseScore: { themeMatch: 39, outfitCompleteness: 25, photoCompletion: 19, creativityBonus: 9, popularityVotes: 4 },
    },
    {
      idSuffix: 'cn2',
      species: 'cat',
      petName: '雲朵喵',
      equipped: {
        head: 'cloud_sleep_cap',
        face: null,
        neck: 'cloud_bib',
        body: 'fluffy_pajama',
        held: 'plush_bunny_doll',
        back: null,
      },
      title: '晴空慵懶小憩',
      caption: '在藍白柔光下打了個大呵欠，今天也要好好休息！',
      baseScore: { themeMatch: 36, outfitCompleteness: 18, photoCompletion: 17, creativityBonus: 8, popularityVotes: 3 },
    },
    {
      idSuffix: 'cn3',
      species: 'rabbit',
      petName: '豆漿兔',
      equipped: {
        head: 'pink_bow',
        face: 'sleep_mask',
        neck: 'cloud_bib',
        body: null,
        held: 'plush_bunny_doll',
        back: null,
      },
      title: '午安枕頭派對',
      caption: '柔和白色蕾絲框配上眼罩，隨時都能秒睡的程度！',
      baseScore: { themeMatch: 31, outfitCompleteness: 18, photoCompletion: 16, creativityBonus: 7, popularityVotes: 2 },
    },
  ],
  chef_master: [
    {
      idSuffix: 'cm1',
      species: 'duck',
      petName: '可頌鴨',
      equipped: {
        head: 'chef_hat',
        face: 'chef_mustache',
        neck: 'chef_scarf',
        body: 'apron_outfit',
        held: 'mini_spatula',
        back: null,
      },
      title: '黃金可頌出爐中',
      caption: '戴上小鬍子與廚師高帽，今天主廚特餐準時上菜！',
      baseScore: { themeMatch: 40, outfitCompleteness: 23, photoCompletion: 18, creativityBonus: 9, popularityVotes: 4 },
    },
    {
      idSuffix: 'cm2',
      species: 'pig',
      petName: '焦糖布丁',
      equipped: {
        head: 'chef_hat',
        face: null,
        neck: 'chef_scarf',
        body: 'apron_outfit',
        held: 'mini_spatula',
        back: null,
      },
      title: '食堂招牌烘焙手',
      caption: '圍裙穿戴整齊，每一口料理都加了滿滿心意！',
      baseScore: { themeMatch: 36, outfitCompleteness: 18, photoCompletion: 17, creativityBonus: 8, popularityVotes: 3 },
    },
    {
      idSuffix: 'cm3',
      species: 'hamster',
      petName: '小泡芙',
      equipped: {
        head: 'chef_hat',
        face: 'blush_stickers',
        neck: 'donut_collar',
        body: null,
        held: 'mini_spatula',
        back: null,
      },
      title: '甜甜圈學徒日常',
      caption: '就算臉頰沾到麵粉也要帥氣舉起小鍋鏟留念！',
      baseScore: { themeMatch: 31, outfitCompleteness: 18, photoCompletion: 16, creativityBonus: 7, popularityVotes: 2 },
    },
  ],
  starry_explorer: [
    {
      idSuffix: 'se1',
      species: 'cat',
      petName: '星塵咪',
      equipped: {
        head: 'galaxy_antenna',
        face: 'star_glasses',
        neck: 'galaxy_bow',
        body: 'planet_cape',
        held: 'star_wand',
        back: 'star_wings',
      },
      title: '銀河光年旅行者',
      caption: '披風與星光羽翼全副武裝，在宇宙舞台許下流星心願！',
      baseScore: { themeMatch: 39, outfitCompleteness: 25, photoCompletion: 19, creativityBonus: 9, popularityVotes: 4 },
    },
    {
      idSuffix: 'se2',
      species: 'dog',
      petName: '銀河汪',
      equipped: {
        head: 'galaxy_antenna',
        face: 'star_glasses',
        neck: null,
        body: 'planet_cape',
        held: 'star_wand',
        back: null,
      },
      title: '星夜巡航訊號',
      caption: '接收到來自月亮的邀請函，戴上星星眼鏡即刻啟航！',
      baseScore: { themeMatch: 35, outfitCompleteness: 18, photoCompletion: 17, creativityBonus: 8, popularityVotes: 3 },
    },
    {
      idSuffix: 'se3',
      species: 'rabbit',
      petName: '月見兔',
      equipped: {
        head: 'party_crown',
        face: 'star_glasses',
        neck: 'galaxy_bow',
        body: null,
        held: 'star_wand',
        back: 'star_wings',
      },
      title: '月光仙女變身',
      caption: '紫色星雲下揮動魔法棒，閃閃發光就是最棒的魔法！',
      baseScore: { themeMatch: 32, outfitCompleteness: 20, photoCompletion: 17, creativityBonus: 8, popularityVotes: 3 },
    },
  ],
  beach_vacation: [
    {
      idSuffix: 'bv1',
      species: 'duck',
      petName: '浪花鴨',
      equipped: {
        head: 'duck_hat',
        face: 'cool_sunglasses',
        neck: 'sailor_collar',
        body: null,
        held: null,
        back: null,
      },
      title: '晴空海岸水手風',
      caption: '水手領巾配上墨鏡與清澈海風，心情瞬間放暑假！',
      baseScore: { themeMatch: 38, outfitCompleteness: 15, photoCompletion: 18, creativityBonus: 9, popularityVotes: 4 },
    },
    {
      idSuffix: 'bv2',
      species: 'dog',
      petName: '沙灘包',
      equipped: {
        head: 'flower_crown',
        face: 'round_shades',
        neck: 'sailor_collar',
        body: null,
        held: 'strawberry_icecream',
        back: null,
      },
      title: '夏日海濱冰沙日',
      caption: '踩在細白沙灘上來一口冰甜筒，藍白穿搭清爽滿點！',
      baseScore: { themeMatch: 34, outfitCompleteness: 18, photoCompletion: 17, creativityBonus: 8, popularityVotes: 3 },
    },
    {
      idSuffix: 'bv3',
      species: 'cat',
      petName: '海鹽喵',
      equipped: {
        head: 'bunny_flower_crown',
        face: 'cool_sunglasses',
        neck: 'sailor_collar',
        body: null,
        held: null,
        back: null,
      },
      title: '貝殼聽海寫真',
      caption: '藍白配色的清爽濾鏡，像把整片太平洋裝進相片裡！',
      baseScore: { themeMatch: 32, outfitCompleteness: 15, photoCompletion: 17, creativityBonus: 8, popularityVotes: 3 },
    },
  ],
  sakura_picnic: [
    {
      idSuffix: 'sp1',
      species: 'rabbit',
      petName: '花見兔',
      equipped: {
        head: 'sakura_beret',
        face: 'blush_stickers',
        neck: 'pearl_necklace',
        body: 'sakura_picnic_cape',
        held: null,
        back: 'little_angel_wings',
      },
      title: '春日櫻花樹下',
      caption: '花瓣輕輕落在貝雷帽上，柔和粉調像畫一樣溫柔！',
      baseScore: { themeMatch: 39, outfitCompleteness: 22, photoCompletion: 19, creativityBonus: 9, popularityVotes: 4 },
    },
    {
      idSuffix: 'sp2',
      species: 'cat',
      petName: '粉櫻咪',
      equipped: {
        head: 'bunny_flower_crown',
        face: null,
        neck: 'ribbon_bell',
        body: 'sakura_picnic_cape',
        held: 'strawberry_icecream',
        back: null,
      },
      title: '櫻花野餐約會',
      caption: '和花瓣一起吹著春風，每個微笑都有淡淡花香！',
      baseScore: { themeMatch: 36, outfitCompleteness: 18, photoCompletion: 18, creativityBonus: 8, popularityVotes: 3 },
    },
    {
      idSuffix: 'sp3',
      species: 'pig',
      petName: '桃子團',
      equipped: {
        head: 'flower_crown',
        face: null,
        neck: 'pink_bow',
        body: null,
        held: null,
        back: null,
      },
      title: '花田小徑散步',
      caption: '戴著花冠沿著櫻花小徑慢慢走，每一步都是好心情！',
      baseScore: { themeMatch: 30, outfitCompleteness: 10, photoCompletion: 16, creativityBonus: 7, popularityVotes: 2 },
    },
  ],
  halloween_candy: [
    {
      idSuffix: 'hc1',
      species: 'cat',
      petName: '南瓜黑糖',
      equipped: {
        head: 'party_crown',
        face: 'confetti_glasses',
        neck: 'donut_collar',
        body: 'festival_cape',
        held: 'lollipop_wand',
        back: 'devil_bat_wings',
      },
      title: '不給糖就賣萌！',
      caption: '展開小蝙蝠翅膀拿著糖果魔杖，整條萬聖街都是我的伸展台！',
      baseScore: { themeMatch: 39, outfitCompleteness: 25, photoCompletion: 19, creativityBonus: 9, popularityVotes: 4 },
    },
    {
      idSuffix: 'hc2',
      species: 'dog',
      petName: '餅乾奇奇',
      equipped: {
        head: 'party_crown',
        face: null,
        neck: 'donut_collar',
        body: null,
        held: 'little_lantern',
        back: 'devil_bat_wings',
      },
      title: '南瓜燈籠巡遊',
      caption: '提著暖橘小燈籠在夜色裡收集雙倍糖果驚喜～',
      baseScore: { themeMatch: 35, outfitCompleteness: 15, photoCompletion: 17, creativityBonus: 8, popularityVotes: 3 },
    },
    {
      idSuffix: 'hc3',
      species: 'hamster',
      petName: '糖果球',
      equipped: {
        head: 'party_crown',
        face: 'star_glasses',
        neck: null,
        body: 'festival_cape',
        held: 'lollipop_wand',
        back: null,
      },
      title: '奇幻糖果派對夜',
      caption: '橘色與黑色交織的奇幻派對，今晚糖果全部雙份快樂！',
      baseScore: { themeMatch: 32, outfitCompleteness: 18, photoCompletion: 16, creativityBonus: 7, popularityVotes: 3 },
    },
  ],
};

export function buildShowcaseEntriesForTheme(
  theme: PhotoContestTheme,
  weekKey: string
): PhotoSubmission[] {
  const presets = SHOWCASE_PRESETS_BY_THEME[theme.id] ?? [];
  return presets.map((preset, idx) => {
    const total = Math.min(
      100,
      preset.baseScore.themeMatch +
        preset.baseScore.outfitCompleteness +
        preset.baseScore.photoCompletion +
        preset.baseScore.creativityBonus +
        preset.baseScore.popularityVotes
    );
    const tier = getRankTierForScore(total);
    return {
      id: `showcase_${weekKey}_${theme.id}_${preset.idSuffix}`,
      contestWeekKey: weekKey,
      themeId: theme.id,
      authorUserId: `npc_${preset.idSuffix}`,
      authorLabel: '匿名參賽者',
      petId: `npc_pet_${preset.idSuffix}`,
      petName: preset.petName,
      species: preset.species,
      equipped: { ...preset.equipped },
      poseId: theme.preferredPoses[idx % theme.preferredPoses.length] ?? 'happy',
      facing: 'front',
      backgroundId:
        theme.preferredBackgroundIds[idx % theme.preferredBackgroundIds.length] ??
        'pink_room',
      filterId:
        theme.preferredFilterIds[idx % theme.preferredFilterIds.length] ?? 'none',
      frameId:
        theme.preferredFrameIds[idx % theme.preferredFrameIds.length] ?? 'rounded',
      stickers: theme.preferredStickerIds.slice(0, 2),
      title: preset.title,
      caption: preset.caption,
      score: {
        ...preset.baseScore,
        totalScore: total,
        rank: tier.rank,
        hasRequiredAccessory: true,
        matchingAccessoryCount: 2,
        equippedSlotCount: Object.values(preset.equipped).filter(Boolean).length,
        notes: ['官方典藏精選匿名參賽作品'],
      },
      votesReceived: 3 + (2 - idx),
      rewardCoins: 0,
      rewardMaterials: 0,
      rewardTickets: 0,
      isCoop: false,
      isShowcaseEntry: true,
      createdAt: 1700000000000 + idx * 1000,
    };
  });
}
