import { PhotoContestShopItem } from '../../types';

export const PHOTO_CONTEST_SHOP_ITEMS: PhotoContestShopItem[] = [
  {
    id: 'shop_contest_strawberry_frame',
    name: '草莓相框',
    emoji: '🍓',
    description: '滿版嫩粉奶油蝴蝶結與手繪草莓點綴的攝影比賽專屬相框！',
    category: 'frame',
    targetId: 'contest_strawberry_frame',
    ticketPrice: 120,
    badgeText: '相框',
  },
  {
    id: 'shop_contest_forest_filter',
    name: '森林濾鏡',
    emoji: '🌲',
    description: '帶出樹影光斑與溫潤木質色調的攝影大賽特調濾鏡！',
    category: 'filter',
    targetId: 'contest_forest_filter',
    ticketPrice: 120,
    badgeText: '濾鏡',
  },
  {
    id: 'shop_contest_cloud_bg',
    name: '雲朵背景',
    emoji: '☁️',
    description: '金粉晚霞映照在蓬鬆棉雲上的夢幻攝影比賽高空背景！',
    category: 'background',
    targetId: 'contest_cloud_bg',
    ticketPrice: 180,
    badgeText: '背景',
  },
  {
    id: 'shop_contest_chef_frame',
    name: '廚師相框',
    emoji: '👩‍🍳',
    description: '紅白格紋與餐具燙印裝飾的萌寵主廚榮譽比賽相框！',
    category: 'frame',
    targetId: 'contest_chef_frame',
    ticketPrice: 120,
    badgeText: '相框',
  },
  {
    id: 'shop_contest_starry_bg',
    name: '星空背景',
    emoji: '🌌',
    description: '深邃星雲、星座連線與星塵環繞的攝影大賽銀河舞台！',
    category: 'background',
    targetId: 'contest_starry_bg',
    ticketPrice: 180,
    badgeText: '背景',
  },
  {
    id: 'shop_contest_beach_filter',
    name: '海邊濾鏡',
    emoji: '🏖️',
    description: '如浪花氣泡般透亮清涼的海岸膠片攝影比賽濾鏡！',
    category: 'filter',
    targetId: 'contest_beach_filter',
    ticketPrice: 120,
    badgeText: '濾鏡',
  },
  {
    id: 'shop_contest_sakura_frame',
    name: '櫻花相框',
    emoji: '🌸',
    description: '柔粉花瓣飛舞與銀白珠光鑲邊的春日比賽限定相框！',
    category: 'frame',
    targetId: 'contest_sakura_frame',
    ticketPrice: 150,
    badgeText: '相框',
  },
  {
    id: 'shop_contest_halloween_bg',
    name: '萬聖背景',
    emoji: '🎃',
    description: '暖橘南瓜燈與糖果街屋交織的可愛奇幻萬聖夜拍攝舞台！',
    category: 'background',
    targetId: 'contest_halloween_bg',
    ticketPrice: 180,
    badgeText: '背景',
  },
  {
    id: 'shop_contest_photographer_title',
    name: '攝影師稱號',
    emoji: '📷',
    description: '攝影比賽殿堂限定稱號「攝影師」，可展示於留言板、作品牆與小屋！',
    category: 'title',
    targetId: 'contest_photographer',
    ticketPrice: 400,
    badgeText: '稱號',
  },
];

export const PHOTO_CONTEST_SHOP_ITEM_BY_ID: Record<string, PhotoContestShopItem> =
  PHOTO_CONTEST_SHOP_ITEMS.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<string, PhotoContestShopItem>
  );
