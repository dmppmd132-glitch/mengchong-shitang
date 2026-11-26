import { Visitor, VisitorBehavior, VisitorId } from '../../types';

export const VISITOR_AFFINITY_THRESHOLDS = [0, 6, 14, 24, 36] as const;

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
    yardLikeLine: '「訪客很喜歡這裡！有高高的樹枝與小鳥盆栽，啾啾感到超安心！」',
    levelRewards: [
      { level: 1, title: '初次相識', description: '解鎖小鳥來訪與基礎小獎勵' },
      {
        level: 2,
        title: '專屬擺飾＆濾鏡',
        description: '解鎖「七彩羽毛風鈴」庭院擺飾與攝影棚濾鏡「清晨微光」',
        decorId: 'feather_windchime',
        unlockStudio: { filterId: 'morning_glow' },
      },
      {
        level: 3,
        title: '珍稀贈禮＆相框',
        description: '獲得 2 顆向日葵籽、1 份夢幻可可、2 個家具碎片、1 份攝影材料與「羽毛相框」',
        studioMaterials: 1,
        unlockStudio: { frameId: 'feather_frame' },
      },
      {
        level: 4,
        title: '常客熟面孔＆場景',
        description: '小鳥拜訪頻率顯著提升，並解鎖攝影棚背景「樹梢藍天」',
        unlockStudio: { backgroundId: 'bird_treetop_sky' },
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
    yardLikeLine: '「訪客很喜歡這裡！有高大的樹影和堅果盆，果果開心甩著大尾巴！」',
    levelRewards: [
      { level: 1, title: '樹洞鄰居', description: '解鎖松鼠來訪與基礎小獎勵' },
      {
        level: 2,
        title: '專屬擺飾＆濾鏡',
        description: '解鎖「金秋橡果擺飾」庭院擺飾與攝影棚濾鏡「森林暖陽」',
        decorId: 'acorn_ornament',
        unlockStudio: { filterId: 'forest_warm_sun' },
      },
      {
        level: 3,
        title: '樹洞秘藏＆相框',
        description: '獲得 2 份月光小麥、1 份夢幻可可、3 個家具碎片、1 份攝影材料與「橡果相框」',
        studioMaterials: 1,
        unlockStudio: { frameId: 'acorn_frame' },
      },
      {
        level: 4,
        title: '庭園玩伴＆場景',
        description: '松鼠更頻繁來庭院串門子，並解鎖攝影棚背景「橡果森林」',
        unlockStudio: { backgroundId: 'squirrel_acorn_forest' },
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
    yardLikeLine: '「訪客很喜歡這裡！有繽紛花圃與嫩綠紅蘿蔔田，雪球開心得直蹦跳！」',
    levelRewards: [
      { level: 1, title: '花園初遇', description: '解鎖小兔子來訪與基礎小獎勵' },
      {
        level: 2,
        title: '專屬擺飾＆濾鏡',
        description: '解鎖「兔兔花園石雕」庭院擺飾與攝影棚濾鏡「草地粉彩」',
        decorId: 'rabbit_garden_statue',
        unlockStudio: { filterId: 'meadow_pastel' },
      },
      {
        level: 3,
        title: '花田謝禮＆相框',
        description: '獲得 3 顆紅蘿蔔、1 份薄荷葉、2 個家具碎片、1 份攝影材料與「紅蘿蔔相框」',
        studioMaterials: 1,
        unlockStudio: { frameId: 'carrot_frame' },
      },
      {
        level: 4,
        title: '花園常客＆場景',
        description: '小兔子更容易循著花香來拜訪庭院，並解鎖攝影棚背景「紅蘿蔔花園」',
        unlockStudio: { backgroundId: 'rabbit_carrot_garden' },
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
