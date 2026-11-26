import {
  VisitorDecorId,
  VisitorDecorItem,
  VisitorOffering,
  VisitorTreat,
  VisitorTreatId,
} from '../../types';

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
