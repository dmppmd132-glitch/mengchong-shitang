import { BirthdayDecoration, BirthdayDecorationId } from '../../types';

export const BIRTHDAY_DECORATIONS: BirthdayDecoration[] = [
  // Room Party Decorations (6)
  {
    id: 'room_balloon_arch',
    target: 'room',
    name: '氣球拱門',
    emoji: '🎈',
    description: '粉嫩馬卡龍氣球拱門框住溫馨小屋牆面，一秒開啟派對模式！',
    moodBonus: 8,
    priceCoins: 90,
  },
  {
    id: 'room_banner',
    target: 'room',
    name: '生日橫幅',
    emoji: '🎏',
    description: '手繪三角旗「HAPPY BIRTHDAY」暖色橫幅掛在窗上。',
    moodBonus: 8,
    priceCoins: 75,
  },
  {
    id: 'room_streamers',
    target: 'room',
    name: '彩帶',
    emoji: '🎊',
    description: '閃亮金粉緞帶與螺旋彩條從天花板輕輕垂下！',
    moodBonus: 10,
    priceCoins: 150,
    unlockedByGiftId: 'birthday_streamers',
  },
  {
    id: 'room_cake_table',
    target: 'room',
    name: '生日蛋糕桌',
    emoji: '🎂',
    description: '鋪著草莓桌巾的迷你甜點圓桌，放上生日蛋糕心情直接 +15！',
    moodBonus: 15,
    priceCoins: 140,
  },
  {
    id: 'room_gift_pile',
    target: 'room',
    name: '禮物堆',
    emoji: '🎁',
    description: '綁著蝴蝶結的五顏六色驚喜禮物盒疊在牆角。',
    moodBonus: 10,
    priceCoins: 110,
  },
  {
    id: 'room_party_lights',
    target: 'room',
    name: '派對燈串',
    emoji: '✨',
    description: '暖黃星星串燈點亮整個派對氛圍，拍照自帶柔光！',
    moodBonus: 10,
    priceCoins: 95,
  },
  // Yard Party Decorations (6)
  {
    id: 'yard_balloons',
    target: 'yard',
    name: '戶外氣球',
    emoji: '🎈',
    description: '繫在庭院木欄上的彩虹飄浮氣球，隨微風輕輕搖曳！',
    moodBonus: 10,
    priceCoins: 150,
    unlockedByGiftId: 'birthday_balloons',
  },
  {
    id: 'yard_flags',
    target: 'yard',
    name: '生日旗幟',
    emoji: '🚩',
    description: '沿著庭院草坪懸掛的慶典彩色小旗幟。',
    moodBonus: 8,
    priceCoins: 75,
  },
  {
    id: 'yard_picnic_mat',
    target: 'yard',
    name: '野餐墊',
    emoji: '🧺',
    description: '紅白格子暖心庭院野餐墊，好朋友和小訪客都能坐一起慶生！',
    moodBonus: 10,
    priceCoins: 100,
  },
  {
    id: 'yard_cake_table',
    target: 'yard',
    name: '生日蛋糕桌',
    emoji: '🎂',
    description: '擺在花圃旁的戶外蛋糕小圓桌，開派對切蛋糕心情 +15！',
    moodBonus: 15,
    priceCoins: 140,
  },
  {
    id: 'yard_gift_pile',
    target: 'yard',
    name: '禮物堆',
    emoji: '🎁',
    description: '草地上的可愛緞帶派對禮物堆，小訪客看到都會好奇湊過來～',
    moodBonus: 10,
    priceCoins: 110,
  },
  {
    id: 'yard_party_lights',
    target: 'yard',
    name: '派對燈串',
    emoji: '💡',
    description: '從庭院大樹拉到屋簷的暖光燈泡串，傍晚開派對超級浪漫！',
    moodBonus: 10,
    priceCoins: 95,
  },
];

export const BIRTHDAY_DECORATION_BY_ID: Record<BirthdayDecorationId, BirthdayDecoration> =
  BIRTHDAY_DECORATIONS.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<BirthdayDecorationId, BirthdayDecoration>);

export const ROOM_BIRTHDAY_DECORATIONS = BIRTHDAY_DECORATIONS.filter(
  (d) => d.target === 'room'
);

export const YARD_BIRTHDAY_DECORATIONS = BIRTHDAY_DECORATIONS.filter(
  (d) => d.target === 'yard'
);
