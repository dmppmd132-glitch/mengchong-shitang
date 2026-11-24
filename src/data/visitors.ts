import {
  CoopVisitorSession,
  IngredientId,
  TownOrder,
  TownOrderCategory,
  Visitor,
  VisitorBehavior,
  VisitorDecorId,
  VisitorDecorItem,
  VisitorId,
  VisitorOffering,
  VisitorTreat,
  VisitorTreatId,
} from '../types';

export function buildOfferingKey(offering: VisitorOffering): string {
  return `${offering.kind}:${offering.id}`;
}

export const VISITOR_TREATS: VisitorTreat[] = [
  {
    id: 'seeds_mix',
    name: '綜合穀粒種子',
    emoji: '🌾',
    price: 12,
    description: '香脆葵花籽與小米混合的小點心，小鳥啾啾的最愛！',
  },
  {
    id: 'roasted_nuts',
    name: '香烤綜合堅果',
    emoji: '🌰',
    price: 16,
    description: '微甜焦香的烤榛果與松果仁，松鼠果果看到眼睛會發亮！',
  },
  {
    id: 'fresh_lettuce',
    name: '水嫩脆生菜',
    emoji: '🥬',
    price: 14,
    description: '剛洗好的露水嫩生菜葉，小兔子雪球咬起來卡滋卡滋超滿足！',
  },
  {
    id: 'red_chili',
    name: '紅通通小辣椒',
    emoji: '🌶️',
    price: 10,
    description: '火辣提神的調味小辣椒，不過森林小動物們通常不太能吃辣喔…',
  },
];

export const VISITOR_TREAT_BY_ID: Record<VisitorTreatId, VisitorTreat> =
  VISITOR_TREATS.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<VisitorTreatId, VisitorTreat>
  );

export const VISITOR_DECORS: VisitorDecorItem[] = [
  {
    id: 'oak_tree',
    name: '暖陽橡樹',
    emoji: '🌳',
    price: 0,
    description: '枝葉茂密的暖心大樹，能讓小鳥與松鼠安心棲息乘涼。',
    attractsVisitorId: 'bird',
  },
  {
    id: 'potted_herbs',
    name: '窗邊香草盆栽',
    emoji: '🪴',
    price: 30,
    description: '生氣勃勃的迷迭香與小花盆栽，吸引愛停靠的小鳥探頭。',
    attractsVisitorId: 'bird',
  },
  {
    id: 'bird_feeder',
    name: '原木餵鳥器',
    emoji: '🪶',
    price: 45,
    description: '掛著小穀粒盤的木屋餵鳥器，小鳥出現機率大幅提升！',
    attractsVisitorId: 'bird',
  },
  {
    id: 'nut_bowl',
    name: '橡果堅果盆',
    emoji: '🥜',
    price: 45,
    description: '擺滿松果與核桃的小木盆，松鼠聞到香氣就會溜進庭院。',
    attractsVisitorId: 'squirrel',
  },
  {
    id: 'flower_arch',
    name: '繽紛小花拱門',
    emoji: '🌸',
    price: 50,
    description: '開滿雛菊與野花的庭園拱門，小兔子最愛在花叢旁嗅嗅聞聞。',
    attractsVisitorId: 'rabbit',
  },
  {
    id: 'feather_windchime',
    name: '七彩羽毛風鈴',
    emoji: '🎐',
    price: 0,
    description: '小鳥好感度 2 級贈禮！微風吹過會發出清脆鈴聲的羽毛吊飾。',
    attractsVisitorId: 'bird',
    unlockByAffinity: { visitorId: 'bird', level: 2 },
  },
  {
    id: 'acorn_ornament',
    name: '金秋橡果擺飾',
    emoji: '🪵',
    price: 0,
    description: '松鼠好感度 2 級贈禮！松鼠親手挑選的圓潤橡果木雕擺飾。',
    attractsVisitorId: 'squirrel',
    unlockByAffinity: { visitorId: 'squirrel', level: 2 },
  },
  {
    id: 'rabbit_garden_statue',
    name: '兔兔花園石雕',
    emoji: '🌷',
    price: 0,
    description: '小兔子好感度 2 級贈禮！帶著小花環的庭園迎賓花圃擺飾。',
    attractsVisitorId: 'rabbit',
    unlockByAffinity: { visitorId: 'rabbit', level: 2 },
  },
];

export const VISITOR_DECOR_BY_ID: Record<VisitorDecorId, VisitorDecorItem> =
  VISITOR_DECORS.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<VisitorDecorId, VisitorDecorItem>
  );

export const VISITOR_AFFINITY_THRESHOLDS = [0, 35, 90, 175, 290] as const;

export const VISITORS: Visitor[] = [
  {
    id: 'bird',
    name: '小鳥・啾啾',
    speciesLabel: '小鳥',
    emoji: '🐦',
    accentColor: '#3B82A6',
    bgGradient: 'from-[#E9F7FF] to-[#FFFDF6]',
    description: '愛在清晨與午後停在枝頭唱歌的小藍鳥，最喜歡穀粒與香脆餅乾。',
    yardTip: '在庭院放置「暖陽橡樹」、「香草盆栽」或「原木餵鳥器」會提高小鳥來訪機率！',
    baseWeight: 100,
    stayDurationMs: 55 * 60 * 1000,
    preference: {
      favoriteOfferingKeys: [
        'treat:seeds_mix',
        'ingredient:sunflower',
        'food:butter_cookie',
        'food:corn_biscuit',
        'food:honey_cookie',
      ],
      neutralOfferingKeys: [
        'ingredient:corn',
        'ingredient:strawberry',
        'ingredient:blueberry',
        'food:fruit_box',
      ],
      dislikedOfferingKeys: ['treat:red_chili'],
      favoriteTagsLabel: '種子、餅乾、向日葵籽',
      dislikedTagsLabel: '辣椒',
      preferredYardDecorIds: ['oak_tree', 'potted_herbs', 'bird_feeder', 'feather_windchime'],
      preferredFarmDecorIds: [],
      preferredCropIds: ['sunflower'],
    },
    arrivalLines: [
      '啾啾～聞到庭院剛出爐的餅乾香，我飛來串門子囉！',
      '枝頭的風好舒服呀，今天農場有什麼好吃的小種子嗎？',
    ],
    favoriteFeedLines: [
      '啾啾！這正是我最喜歡的點心，好脆好香呀～',
      '拍拍翅膀轉圈圈！謝謝你的用心招待，小種子我收下囉！',
    ],
    neutralFeedLines: [
      '啾～味道清爽又暖心，謝謝你的心意！',
      '慢慢啄了一口，在這個庭院吃東西好放鬆呢。',
    ],
    dislikedFeedLines: [
      '啾、啾啊…有點太辣了啦，不過還是謝謝你的勇氣分享！',
      '吐吐小舌頭喝口水～下次換小餅乾我會更開心的！',
    ],
    yardLikeLine: '「有高高的樹枝與小鳥盆栽，這位訪客喜歡你的庭院！」',
    levelRewards: [
      { level: 1, title: '初次相識', description: '解鎖小鳥來訪與基礎小獎勵' },
      {
        level: 2,
        title: '專屬擺飾',
        description: '解鎖「七彩羽毛風鈴」庭院擺飾',
        decorId: 'feather_windchime',
      },
      {
        level: 3,
        title: '珍稀贈禮',
        description: '獲得 2 顆向日葵籽、1 份夢幻可可與 2 個家具碎片',
      },
      {
        level: 4,
        title: '常客熟面孔',
        description: '小鳥拜訪頻率顯著提升，獎勵更豐富',
      },
      {
        level: 5,
        title: '限定造型與稱號',
        description: '解鎖頭飾「青鳥羽毛髮夾」與稱號「林間鳥語友」',
        accessoryId: 'visitor_feather_clip',
        titleId: 'bird_whisperer',
      },
    ],
  },
  {
    id: 'squirrel',
    name: '松鼠・果果',
    speciesLabel: '松鼠',
    emoji: '🐿️',
    accentColor: '#A15E24',
    bgGradient: 'from-[#FFF4E3] to-[#FFFDF6]',
    description: '抱著蓬鬆大尾巴四處探險的小松鼠，最喜歡把堅果和餅乾塞滿頰囊。',
    yardTip: '在庭院放置「暖陽橡樹」或「橡果堅果盆」會吸引松鼠更常跑來玩！',
    baseWeight: 95,
    stayDurationMs: 60 * 60 * 1000,
    preference: {
      favoriteOfferingKeys: [
        'treat:roasted_nuts',
        'ingredient:dream_cocoa',
        'food:butter_cookie',
        'food:honey_cookie',
        'food:corn_biscuit',
      ],
      neutralOfferingKeys: [
        'ingredient:corn',
        'ingredient:pumpkin',
        'ingredient:moon_wheat',
        'food:caramel_pudding',
      ],
      dislikedOfferingKeys: ['treat:red_chili'],
      favoriteTagsLabel: '堅果、餅乾、可可',
      dislikedTagsLabel: '辣椒',
      preferredYardDecorIds: ['oak_tree', 'nut_bowl', 'acorn_ornament'],
      preferredFarmDecorIds: [],
      preferredCropIds: ['dream_cocoa'],
    },
    arrivalLines: [
      '沙沙沙～我從樹梢滑下來啦！今天有沒有香噴噴的堅果呀？',
      '尾巴搖呀搖！這座庭院看起來好適合藏寶藏喔！',
    ],
    favoriteFeedLines: [
      '卡滋卡滋！我的腮幫子塞得滿滿的，幸福度破表啦！',
      '太好吃了吧！這份堅果餅乾我要記進我的秘密樹洞清單！',
    ],
    neutralFeedLines: [
      '嚼嚼嚼～淡淡的香氣很不錯呢，謝謝招待！',
      '捧在手心細細品嚐，今天也是愉快的一天！',
    ],
    dislikedFeedLines: [
      '呼哈呼哈！尾巴炸毛啦～原來這紅紅的會噴火！沒關係我吃得消！',
      '辣到跳起來轉一圈～謝謝你讓我體驗了一場刺激冒險！',
    ],
    yardLikeLine: '「有高大的樹影和堅果盆，這位訪客喜歡你的庭院！」',
    levelRewards: [
      { level: 1, title: '樹洞鄰居', description: '解鎖松鼠來訪與基礎小獎勵' },
      {
        level: 2,
        title: '專屬擺飾',
        description: '解鎖「金秋橡果擺飾」庭院擺飾',
        decorId: 'acorn_ornament',
      },
      {
        level: 3,
        title: '樹洞秘藏',
        description: '獲得 2 份月光小麥、1 份夢幻可可與 3 個家具碎片',
      },
      {
        level: 4,
        title: '庭園玩伴',
        description: '松鼠更頻繁來庭院串門子，更容易帶稀有食材來交換',
      },
      {
        level: 5,
        title: '限定造型與稱號',
        description: '解鎖頸飾「金秋橡果項鍊」與稱號「橡果收藏家」',
        accessoryId: 'visitor_acorn_charm',
        titleId: 'squirrel_friend',
      },
    ],
  },
  {
    id: 'rabbit',
    name: '小兔子・雪球',
    speciesLabel: '小兔子',
    emoji: '🐇',
    accentColor: '#C4517A',
    bgGradient: 'from-[#FFF0F6] to-[#FFFDF9]',
    description: '長耳朵一動一動的雪白小兔子，只要聞到花香與紅蘿蔔就會蹦蹦跳進庭院。',
    yardTip: '在庭院或農場佈置花圃（「雛菊花圃」、「薰衣草花圃」、「繽紛小花拱門」）與種植紅蘿蔔，會提高小兔子出現機率！',
    baseWeight: 95,
    stayDurationMs: 60 * 60 * 1000,
    preference: {
      favoriteOfferingKeys: [
        'ingredient:carrot',
        'treat:fresh_lettuce',
        'food:carrot_salad',
        'food:carrot_soup',
      ],
      neutralOfferingKeys: [
        'ingredient:strawberry',
        'ingredient:blueberry',
        'ingredient:mint',
        'food:fruit_box',
      ],
      dislikedOfferingKeys: ['food:cheese_burger', 'food:crispy_fries'],
      favoriteTagsLabel: '紅蘿蔔、生菜、清脆蔬果',
      dislikedTagsLabel: '漢堡、薯條',
      preferredYardDecorIds: ['flower_arch', 'rabbit_garden_statue'],
      preferredFarmDecorIds: ['daisy_flowerbed', 'lavender_flowerbed'],
      preferredCropIds: ['carrot'],
    },
    arrivalLines: [
      '蹦蹦跳～看到一片漂亮的花圃，我忍不住跟著蝴蝶跑進來了！',
      '耳朵動呀動～聽說這裡的紅蘿蔔又脆又甜，是真的嗎？',
    ],
    favoriteFeedLines: [
      '喀嚓喀嚓！多汁又甜的蔬果太棒了，耳朵都開心豎起來了！',
      '蹦跳三圈轉身謝禮～這是我吃過最幸福的花園下午茶！',
    ],
    neutralFeedLines: [
      '細細咬著小果實～淡淡甜味也很舒服呢！',
      '坐在草地上享用點心，感覺微風都在微笑～',
    ],
    dislikedFeedLines: [
      '嗚嗯…油炸速食對小兔子的肚子來說有點太重口味了，不過謝謝你的分享！',
      '輕輕咬了一小口～下次如果有紅蘿蔔或生菜就太好囉！',
    ],
    yardLikeLine: '「有繽紛花圃與嫩綠紅蘿蔔田，這位訪客喜歡你的庭院！」',
    levelRewards: [
      { level: 1, title: '花園初遇', description: '解鎖小兔子來訪與基礎小獎勵' },
      {
        level: 2,
        title: '專屬擺飾',
        description: '解鎖「兔兔花園石雕」庭院擺飾',
        decorId: 'rabbit_garden_statue',
      },
      {
        level: 3,
        title: '花田謝禮',
        description: '獲得 3 顆紅蘿蔔、1 份薄荷葉與 2 個家具碎片',
      },
      {
        level: 4,
        title: '花園常客',
        description: '小兔子更容易循著花香來拜訪庭院',
      },
      {
        level: 5,
        title: '限定造型與稱號',
        description: '解鎖頭飾「雪球兔花冠」與稱號「花田守護兔友」',
        accessoryId: 'visitor_rabbit_wreath',
        titleId: 'rabbit_guardian',
      },
    ],
  },
];

export const VISITOR_BY_ID: Record<VisitorId, Visitor> = VISITORS.reduce(
  (acc, v) => {
    acc[v.id] = v;
    return acc;
  },
  {} as Record<VisitorId, Visitor>
);

export const VISITOR_BEHAVIOR_META: Record<
  VisitorBehavior,
  { label: string; emoji: string }
> = {
  walking: { label: '在庭院散步中', emoji: '🐾' },
  sitting: { label: '在草地上乖乖坐著', emoji: '🛋️' },
  smelling: { label: '湊近花草聞香中', emoji: '🌼' },
  looking_farm: { label: '探頭看向開心農場', emoji: '🌾' },
};

export const COOP_VISITOR_TEMPLATES: Array<{
  visitorId: VisitorId;
  title: string;
  description: string;
  requirements: Array<{
    kind: 'ingredient' | 'food' | 'treat';
    itemId: string;
    label: string;
    emoji: string;
    requiredQty: number;
  }>;
  rewardCoins: number;
  rewardShards: number;
  rewardTickets: number;
  rewardRareIngredients: Partial<Record<IngredientId, number>>;
}> = [
  {
    visitorId: 'rabbit',
    title: '小兔子雪球的野餐邀約',
    description: '兩人合作準備香甜紅蘿蔔與焦糖布丁，就能讓雪球開心一整天！',
    requirements: [
      { kind: 'ingredient', itemId: 'carrot', label: '紅蘿蔔', emoji: '🥕', requiredQty: 2 },
      { kind: 'food', itemId: 'caramel_pudding', label: '焦糖布丁', emoji: '🍮', requiredQty: 1 },
    ],
    rewardCoins: 45,
    rewardShards: 3,
    rewardTickets: 1,
    rewardRareIngredients: { strawberry: 1, mint: 1 },
  },
  {
    visitorId: 'bird',
    title: '小鳥啾啾的晨間音樂會',
    description: '一人放穀粒種子、一人準備餅乾或玉米，一起舉辦庭院茶會！',
    requirements: [
      { kind: 'treat', itemId: 'seeds_mix', label: '綜合穀粒種子', emoji: '🌾', requiredQty: 2 },
      { kind: 'food', itemId: 'butter_cookie', label: '奶油餅乾', emoji: '🍪', requiredQty: 1 },
    ],
    rewardCoins: 45,
    rewardShards: 3,
    rewardTickets: 1,
    rewardRareIngredients: { sunflower: 2, blueberry: 1 },
  },
  {
    visitorId: 'squirrel',
    title: '松鼠果果的秋日儲糧派對',
    description: '攜手收集香烤堅果與夢幻可可，和夥伴一起招待貪吃的果果吧！',
    requirements: [
      { kind: 'treat', itemId: 'roasted_nuts', label: '香烤綜合堅果', emoji: '🌰', requiredQty: 2 },
      { kind: 'ingredient', itemId: 'dream_cocoa', label: '夢幻可可', emoji: '🍫', requiredQty: 1 },
    ],
    rewardCoins: 50,
    rewardShards: 4,
    rewardTickets: 1,
    rewardRareIngredients: { moon_wheat: 1, dream_cocoa: 1 },
  },
];

export function buildCoopVisitorSession(
  dateKey: string,
  daySeed: number
): CoopVisitorSession {
  const tpl =
    COOP_VISITOR_TEMPLATES[Math.abs(daySeed) % COOP_VISITOR_TEMPLATES.length];
  return {
    id: `coopv_${dateKey}_${tpl.visitorId}`,
    dateKey,
    visitorId: tpl.visitorId,
    title: tpl.title,
    description: tpl.description,
    requirements: tpl.requirements.map((r) => ({
      key: `${r.kind}:${r.itemId}`,
      kind: r.kind,
      itemId: r.itemId,
      label: r.label,
      emoji: r.emoji,
      requiredQty: r.requiredQty,
      contributedQty: 0,
    })),
    contributions: [],
    completed: false,
    completedAt: null,
    rewardCoins: tpl.rewardCoins,
    rewardShards: tpl.rewardShards,
    rewardTickets: tpl.rewardTickets,
    rewardRareIngredients: { ...tpl.rewardRareIngredients },
    claimedByUserIds: [],
    photoTaken: false,
    sharedToBoard: false,
  };
}

export interface TownOrderTemplate {
  key: string;
  category: TownOrderCategory;
  visitorId?: VisitorId;
  title: string;
  description: string;
  emoji: string;
  requirements: Array<{
    kind: 'ingredient' | 'food' | 'treat';
    itemId: string;
    label: string;
    emoji: string;
    requiredQty: number;
  }>;
  reward: TownOrder['reward'];
}

export const TOWN_ORDER_TEMPLATES: TownOrderTemplate[] = [
  // 訪客訂單
  {
    key: 'vis_rabbit_picnic',
    category: 'visitor',
    visitorId: 'rabbit',
    title: '招待小兔子野餐籃',
    description: '小兔子雪球最期待的紅蘿蔔與鮮果拼盤，做完立刻送去吧！',
    emoji: '🐇',
    requirements: [
      { kind: 'ingredient', itemId: 'carrot', label: '紅蘿蔔', emoji: '🥕', requiredQty: 2 },
      { kind: 'food', itemId: 'fruit_box', label: '水果盒', emoji: '🍓', requiredQty: 1 },
    ],
    reward: {
      coins: 38,
      furnitureShards: 2,
      farmSpeedTickets: 1,
      rareIngredients: { mint: 1 },
      treats: { fresh_lettuce: 1 },
    },
  },
  {
    key: 'vis_bird_teatime',
    category: 'visitor',
    visitorId: 'bird',
    title: '小鳥早安茶會委託',
    description: '啾啾想邀請林間夥伴們品嚐奶油餅乾與金黃向日葵籽！',
    emoji: '🐦',
    requirements: [
      { kind: 'food', itemId: 'butter_cookie', label: '奶油餅乾', emoji: '🍪', requiredQty: 1 },
      { kind: 'ingredient', itemId: 'sunflower', label: '向日葵籽', emoji: '🌻', requiredQty: 2 },
    ],
    reward: {
      coins: 35,
      furnitureShards: 2,
      farmSpeedTickets: 1,
      rareIngredients: { blueberry: 1 },
      treats: { seeds_mix: 1 },
    },
  },
  {
    key: 'vis_squirrel_basket',
    category: 'visitor',
    visitorId: 'squirrel',
    title: '松鼠秋果補給箱',
    description: '果果準備了小籃子，想搜集香甜玉米與香烤堅果備冬！',
    emoji: '🐿️',
    requirements: [
      { kind: 'ingredient', itemId: 'corn', label: '香甜玉米', emoji: '🌽', requiredQty: 2 },
      { kind: 'treat', itemId: 'roasted_nuts', label: '香烤綜合堅果', emoji: '🌰', requiredQty: 1 },
    ],
    reward: {
      coins: 36,
      furnitureShards: 2,
      farmSpeedTickets: 1,
      rareIngredients: { dream_cocoa: 1 },
      treats: { roasted_nuts: 1 },
    },
  },
  // 共養訂單
  {
    key: 'coop_three_dishes',
    category: 'coop',
    title: '共養溫馨餐桌委託',
    description: '兩人共同交付 3 道家常料理（紅蘿蔔沙拉、焦糖布丁與奶油餅乾）給小鎮居民！',
    emoji: '💞',
    requirements: [
      { kind: 'food', itemId: 'carrot_salad', label: '紅蘿蔔沙拉', emoji: '🥗', requiredQty: 1 },
      { kind: 'food', itemId: 'caramel_pudding', label: '焦糖布丁', emoji: '🍮', requiredQty: 1 },
      { kind: 'food', itemId: 'butter_cookie', label: '奶油餅乾', emoji: '🍪', requiredQty: 1 },
    ],
    reward: {
      coins: 55,
      furnitureShards: 3,
      farmSpeedTickets: 2,
      rareIngredients: { moon_wheat: 1, blueberry: 1 },
    },
  },
  {
    key: 'coop_berry_party',
    category: 'coop',
    title: '共養雙人甜點外送單',
    description: '一起備齊藍莓卡士達塔與草莓鮮乳，讓小鎮午後充滿甜蜜！',
    emoji: '🫐',
    requirements: [
      { kind: 'food', itemId: 'blueberry_tart', label: '藍莓卡士達塔', emoji: '🫐', requiredQty: 1 },
      { kind: 'food', itemId: 'strawberry_milk', label: '草莓鮮乳', emoji: '🥛', requiredQty: 2 },
    ],
    reward: {
      coins: 58,
      furnitureShards: 3,
      farmSpeedTickets: 2,
      rareIngredients: { dream_cocoa: 1, sunflower: 1 },
    },
  },
  // 高級訂單
  {
    key: 'adv_moonlight_feast',
    category: 'advanced',
    title: '星夜莊園特級收購單',
    description: '集結月光小麥、夢幻可可與鮮藍莓的高級食材委託，獎勵豐厚碎片與加速券！',
    emoji: '🌙',
    requirements: [
      { kind: 'ingredient', itemId: 'moon_wheat', label: '月光小麥', emoji: '🌾', requiredQty: 2 },
      { kind: 'ingredient', itemId: 'dream_cocoa', label: '夢幻可可', emoji: '🍫', requiredQty: 2 },
      { kind: 'ingredient', itemId: 'blueberry', label: '鮮採藍莓', emoji: '🫐', requiredQty: 2 },
    ],
    reward: {
      coins: 65,
      furnitureShards: 5,
      farmSpeedTickets: 2,
      rareIngredients: { moon_wheat: 1, dream_cocoa: 1 },
    },
  },
  {
    key: 'adv_artisan_bakery',
    category: 'advanced',
    title: '小鎮烘焙師頂級訂單',
    description: '需要主廚用心烹製月光可頌與熔岩可可，完成後獲得珍稀家具碎片！',
    emoji: '🥐',
    requirements: [
      { kind: 'food', itemId: 'moon_croissant', label: '月光蜜糖可頌', emoji: '🥐', requiredQty: 1 },
      { kind: 'food', itemId: 'cocoa_fondant', label: '晚安熔岩可可', emoji: '🍫', requiredQty: 1 },
      { kind: 'ingredient', itemId: 'sunflower', label: '向日葵籽', emoji: '🌻', requiredQty: 2 },
    ],
    reward: {
      coins: 72,
      furnitureShards: 5,
      farmSpeedTickets: 3,
      rareIngredients: { blueberry: 2 },
    },
  },
];
