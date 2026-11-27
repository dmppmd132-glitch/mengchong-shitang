import { SeasonId, SeasonVisitor } from '../../types';

export const SEASON_VISITORS: SeasonVisitor[] = [
  {
    visitorId: 'butterfly',
    name: '蝴蝶・幻彩',
    speciesLabel: '春季蝴蝶',
    emoji: '🦋',
    seasons: ['spring', 'summer'],
    rarity: 'rare',
    preferredWeather: ['clear', 'rain'],
    description: '春天花開或雨後初霽時，在櫻花與花圃間翩翩起舞的七彩蝴蝶！',
    bonusTags: ['春雨機率上升', '夏季晴天常現'],
  },
  {
    visitorId: 'sakura_sprite',
    name: '櫻花精靈・花音',
    speciesLabel: '春季稀有訪客',
    emoji: '🧚',
    seasons: ['spring'],
    rarity: 'rare',
    preferredWeather: ['clear', 'windy'],
    description: '只在春櫻季節乘著花瓣微風現身的可愛花精靈，喜歡草莓奶昔與春季點心！',
    bonusTags: ['春季限定稀有', '野餐祭好夥伴'],
  },
  {
    visitorId: 'firefly',
    name: '螢火蟲・點點',
    speciesLabel: '夏季稀有訪客',
    emoji: '✨',
    seasons: ['summer'],
    rarity: 'rare',
    preferredWeather: ['clear', 'cloudy', 'hot'],
    description: '夏夜微風中提著小燈籠閃閃發光的夏夜精靈，夜晚來訪機率大幅提升！',
    bonusTags: ['夏夜機率大增', '喜愛清涼水果'],
  },
  {
    visitorId: 'hedgehog',
    name: '刺蝟・栗子',
    speciesLabel: '秋季常客',
    emoji: '🦔',
    seasons: ['autumn'],
    rarity: 'common',
    preferredWeather: ['clear', 'cloudy', 'windy'],
    description: '秋天最喜歡鑽進庭院與森林落葉堆裡找南瓜和蘋果的小刺蝟！',
    bonusTags: ['秋季落葉加成', '喜愛南瓜蘋果'],
  },
  {
    visitorId: 'snow_fox',
    name: '雪狐・白雪',
    speciesLabel: '冬季常客',
    emoji: '🦊',
    seasons: ['winter'],
    rarity: 'common',
    preferredWeather: ['snow', 'cloudy', 'clear'],
    description: '披著蓬鬆雪白圍巾尾巴的小狐狸，下雪天最喜歡來找暖暖蔬菜湯喝！',
    bonusTags: ['下雪出現率提升', '冬季專屬常客'],
  },
  {
    visitorId: 'arctic_bunny',
    name: '北極小兔・綿糖',
    speciesLabel: '冬季稀有訪客',
    emoji: '🐇',
    seasons: ['winter'],
    rarity: 'rare',
    preferredWeather: ['snow', 'clear'],
    description: '像雪球一樣軟綿綿的罕見北極小兔，只有雪花飄落或佈置冬景時才會悄悄來訪！',
    bonusTags: ['冬季限定稀有', '喜愛白蘿蔔與雪莓'],
  },
];

export const SEASON_VISITOR_BY_ID = Object.fromEntries(
  SEASON_VISITORS.map((v) => [v.visitorId, v])
);

export function getSeasonalVisitorsForSeason(seasonId: SeasonId): SeasonVisitor[] {
  return SEASON_VISITORS.filter((v) => v.seasons.includes(seasonId));
}
