import { Accessory, AccessorySlot } from '../types';

export const ACCESSORY_SLOTS: AccessorySlot[] = ['head', 'face', 'neck', 'body'];

export const ACCESSORY_SLOT_LABELS: Record<AccessorySlot, string> = {
  head: '頭部',
  face: '臉部',
  neck: '脖子',
  body: '身體',
};

export const ACCESSORIES: Accessory[] = [
  // head
  {
    id: 'pink_bow',
    name: '粉紅蝴蝶結',
    slot: 'head',
    emoji: '🎀',
    description: '甜美粉嫩的緞帶蝴蝶結，戴上瞬間可愛度加倍。',
    price: 0,
    initialUnlocked: true,
  },
  {
    id: 'strawberry_clip',
    name: '草莓髮夾',
    slot: 'head',
    emoji: '🍓',
    description: '酸甜俏皮的小草莓造型髮夾。',
    price: 0,
    initialUnlocked: true,
  },
  {
    id: 'mini_crown',
    name: '奶油小皇冠',
    slot: 'head',
    emoji: '👑',
    description: '金黃閃亮的小皇冠，食堂小壽星專屬。',
    price: 80,
    initialUnlocked: false,
  },
  {
    id: 'chef_hat',
    name: '主廚高帽',
    slot: 'head',
    emoji: '👩‍🍳',
    description: '澎澎的白色小廚師帽，立志當萌寵大廚！',
    price: 65,
    initialUnlocked: false,
  },

  // face
  {
    id: 'round_glasses',
    name: '圓框眼鏡',
    slot: 'face',
    emoji: '👓',
    description: '文青感滿分的焦糖色圓框眼鏡。',
    price: 0,
    initialUnlocked: true,
  },
  {
    id: 'star_blush',
    name: '星星腮紅貼',
    slot: 'face',
    emoji: '⭐',
    description: '臉頰貼上奶油黃小星星，元氣滿滿。',
    price: 45,
    initialUnlocked: false,
  },
  {
    id: 'heart_shades',
    name: '愛心墨鏡',
    slot: 'face',
    emoji: '🕶️',
    description: '粉紅愛心造型太陽眼鏡，走在路上最吸睛。',
    price: 75,
    initialUnlocked: false,
  },

  // neck
  {
    id: 'baby_bib',
    name: '圍兜',
    slot: 'neck',
    emoji: '🍼',
    description: '奶油黃波浪花邊小圍兜，吃飯不怕弄髒！',
    price: 0,
    initialUnlocked: true,
  },
  {
    id: 'mint_bell_tie',
    name: '薄荷鈴鐺領結',
    slot: 'neck',
    emoji: '🔔',
    description: '走動時會發出清脆鈴聲的薄荷綠領結。',
    price: 55,
    initialUnlocked: false,
  },

  // body
  {
    id: 'mint_apron',
    name: '薄荷小圍裙',
    slot: 'body',
    emoji: '👕',
    description: '食堂專用薄荷綠口袋圍裙，超有職人感。',
    price: 70,
    initialUnlocked: false,
  },
  {
    id: 'strawberry_cape',
    name: '草莓點點披風',
    slot: 'body',
    emoji: '🧥',
    description: '軟綿綿的粉紅草莓小披風，保暖又時尚。',
    price: 95,
    initialUnlocked: false,
  },
];

export const INITIAL_UNLOCKED_ACCESSORIES: string[] = ACCESSORIES.filter(
  (a) => a.initialUnlocked
).map((a) => a.id);

export function getAccessoryById(id: string | null): Accessory | undefined {
  if (!id) return undefined;
  return ACCESSORIES.find((a) => a.id === id);
}
