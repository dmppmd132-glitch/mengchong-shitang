import {
  SeasonId,
  SeasonPhotoContent,
  SeasonRoomThemeId,
  SeasonYardThemeId,
} from '../../types';

export interface SeasonMeta {
  id: SeasonId;
  name: string;
  shortName: string;
  emoji: string;
  monthsLabel: string;
  tagline: string;
  ambientDesc: string;
  badgeClass: string;
  stageTintClass: string;
  yardGradient: string;
  accentHex: string;
}

export const SEASON_META: Record<SeasonId, SeasonMeta> = {
  spring: {
    id: 'spring',
    name: '春季',
    shortName: '春',
    emoji: '🌸',
    monthsLabel: '3–5 月',
    tagline: '櫻花花瓣・嫩綠草地・柔和春陽',
    ambientDesc: '粉嫩櫻花瓣隨微風輕飄，草地抽芽換上柔和春光。',
    badgeClass: 'bg-[#FFEAF3] border-[#F4B4CD] text-[#B83B64]',
    stageTintClass: 'bg-gradient-to-b from-[#FFE6F2]/24 via-transparent to-[#E9F8E6]/22',
    yardGradient: 'from-[#E5F6D6] via-[#F2FAE8] to-[#FFF1F6]',
    accentHex: '#FF85B3',
  },
  summer: {
    id: 'summer',
    name: '夏季',
    shortName: '夏',
    emoji: '🌻',
    monthsLabel: '6–8 月',
    tagline: '明亮陽光・夏蟬輕鳴・湛藍晴空',
    ambientDesc: '湛藍晴空灑下金黃光束，遠方傳來夏蟬輕快的合奏。',
    badgeClass: 'bg-[#FFF5D6] border-[#F2CE6D] text-[#8E5311]',
    stageTintClass: 'bg-gradient-to-b from-[#FFF3BA]/24 via-transparent to-[#E2F7FF]/22',
    yardGradient: 'from-[#CFF0FF] via-[#F6FBE6] to-[#FFF3D1]',
    accentHex: '#FFB703',
  },
  autumn: {
    id: 'autumn',
    name: '秋季',
    shortName: '秋',
    emoji: '🍁',
    monthsLabel: '9–11 月',
    tagline: '紅楓飄落・暖金暮色・豐收氛圍',
    ambientDesc: '金紅楓葉與銀杏葉在暖色夕陽下緩緩飄落庭院。',
    badgeClass: 'bg-[#FFEEDB] border-[#EEB982] text-[#964B12]',
    stageTintClass: 'bg-gradient-to-b from-[#FFDDB5]/26 via-transparent to-[#FCE9D4]/24',
    yardGradient: 'from-[#FFEBD6] via-[#FFF4DF] to-[#F7DFBE]',
    accentHex: '#E76F51',
  },
  winter: {
    id: 'winter',
    name: '冬季',
    shortName: '冬',
    emoji: '❄️',
    monthsLabel: '12–2 月',
    tagline: '晶瑩白雪・冷靜藍調・室內暖燈',
    ambientDesc: '銀白雪景映襯窗內暖黃燈火，端一碗熱湯最幸福。',
    badgeClass: 'bg-[#E6F2FF] border-[#A7CEFA] text-[#245998]',
    stageTintClass: 'bg-gradient-to-b from-[#DCEEFF]/26 via-transparent to-[#FFF2D8]/22',
    yardGradient: 'from-[#E3F1FF] via-[#F4F9FF] to-[#FFF3E0]',
    accentHex: '#60A5FA',
  },
};

export const SEASON_ORDER: SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];

export interface SeasonRoomThemeDefinition {
  id: Exclude<SeasonRoomThemeId, 'none'>;
  seasonId: SeasonId;
  name: string;
  emoji: string;
  description: string;
  wallStyle: string;
  floorStyle: string;
  badgeClass: string;
  accentOverlayClass: string;
  decorEmojis: [string, string, string];
}

export const SEASON_ROOM_THEMES: SeasonRoomThemeDefinition[] = [
  {
    id: 'sakura_sweet',
    seasonId: 'spring',
    name: '櫻花甜心',
    emoji: '🌸',
    description: '粉嫩櫻花瓣壁紙配奶油粉格紋地板，充滿春日少女心！',
    wallStyle: 'linear-gradient(180deg, #FFEBF3 0%, #FFE0ED 100%)',
    floorStyle: 'repeating-conic-gradient(#FFF5F8 0% 25%, #FFE3EC 0% 50%) 0 0 / 28px 28px',
    badgeClass: 'bg-[#FFEAF3] border-[#F4B4CD] text-[#B83B64]',
    accentOverlayClass: 'from-[#FFD6E8]/25 to-transparent',
    decorEmojis: ['🌸', '🎀', '🍓'],
  },
  {
    id: 'spring_picnic',
    seasonId: 'spring',
    name: '春日野餐',
    emoji: '🧺',
    description: '嫩綠青草牆面與紅白野餐格子地板，不出門也能在屋內野餐！',
    wallStyle: 'linear-gradient(180deg, #E8F8EC 0%, #D9F2DF 100%)',
    floorStyle: 'repeating-conic-gradient(#FFF6EB 0% 25%, #FFE3DB 0% 50%) 0 0 / 26px 26px',
    badgeClass: 'bg-[#E6F8EE] border-[#9ADBC0] text-[#1F6B54]',
    accentOverlayClass: 'from-[#D8F5E0]/25 to-transparent',
    decorEmojis: ['🧺', '🌼', '🦋'],
  },
  {
    id: 'beach_vacation',
    seasonId: 'summer',
    name: '海邊度假',
    emoji: '🏖️',
    description: '海天晴藍壁面搭配暖陽細沙地板，彷彿聽見溫柔海浪聲！',
    wallStyle: 'linear-gradient(180deg, #D9F2FF 0%, #CBEAFF 100%)',
    floorStyle: 'repeating-linear-gradient(90deg, #F9E8C8 0px, #F9E8C8 28px, #F2DDA8 28px, #F2DDA8 56px)',
    badgeClass: 'bg-[#E4F5FF] border-[#9BD3F5] text-[#1D5C8A]',
    accentOverlayClass: 'from-[#BEE9FF]/24 to-transparent',
    decorEmojis: ['🏖️', '🐚', '🌴'],
  },
  {
    id: 'ice_cream_cottage',
    seasonId: 'summer',
    name: '冰品小屋',
    emoji: '🍨',
    description: '薄荷蘇打壁紙與草莓香草甜筒地磚，看一眼就瞬間消暑！',
    wallStyle: 'linear-gradient(180deg, #DCF9F4 0%, #E8FBF9 100%)',
    floorStyle: 'repeating-conic-gradient(#FFF5EE 0% 25%, #D9F7EF 0% 50%) 0 0 / 28px 28px',
    badgeClass: 'bg-[#E3FAF6] border-[#93E0D4] text-[#146B62]',
    accentOverlayClass: 'from-[#C8F7EE]/24 to-transparent',
    decorEmojis: ['🍨', '🍉', '🍧'],
  },
  {
    id: 'maple_study',
    seasonId: 'autumn',
    name: '楓葉書房',
    emoji: '🍁',
    description: '暖琥珀木牆配焦糖書房拼花木板，伴著落葉香讀繪本最愜意。',
    wallStyle: 'linear-gradient(180deg, #FFEAD2 0%, #F7D8B6 100%)',
    floorStyle: 'repeating-linear-gradient(0deg, #E2B892 0px, #E2B892 22px, #D4A47C 22px, #D4A47C 24px)',
    badgeClass: 'bg-[#FFEEDB] border-[#EEB982] text-[#964B12]',
    accentOverlayClass: 'from-[#FFD9B3]/24 to-transparent',
    decorEmojis: ['🍁', '📖', '🌰'],
  },
  {
    id: 'harvest_cottage',
    seasonId: 'autumn',
    name: '豐收小屋',
    emoji: '🎃',
    description: '奶油麥穗壁面與暖橘南瓜格地板，裝滿秋季果實的幸福氣息。',
    wallStyle: 'linear-gradient(180deg, #FFF1D6 0%, #FFE4B8 100%)',
    floorStyle: 'repeating-conic-gradient(#FFF4E0 0% 25%, #FFE0B8 0% 50%) 0 0 / 28px 28px',
    badgeClass: 'bg-[#FFF3DC] border-[#F0CA82] text-[#8B5212]',
    accentOverlayClass: 'from-[#FFE5B4]/24 to-transparent',
    decorEmojis: ['🎃', '🍎', '🌾'],
  },
  {
    id: 'snow_cottage',
    seasonId: 'winter',
    name: '雪中小屋',
    emoji: '⛄',
    description: '粉雪晴藍牆面與柔暖松木地板，窗外飄雪、屋內暖洋洋。',
    wallStyle: 'linear-gradient(180deg, #E2F0FF 0%, #EFF6FF 100%)',
    floorStyle: 'repeating-linear-gradient(90deg, #EEDAC4 0px, #EEDAC4 28px, #E4CCB0 28px, #E4CCB0 56px)',
    badgeClass: 'bg-[#E6F2FF] border-[#A7CEFA] text-[#245998]',
    accentOverlayClass: 'from-[#D6EBFF]/24 to-transparent',
    decorEmojis: ['⛄', '❄️', '🧣'],
  },
  {
    id: 'christmas_bedroom',
    seasonId: 'winter',
    name: '聖誕臥室',
    emoji: '🎄',
    description: '溫暖莓果紅白牆面與松綠絨毯地板，閃亮燈串點亮冬夜童話！',
    wallStyle: 'linear-gradient(180deg, #FFE4E6 0%, #FFF1E6 100%)',
    floorStyle: 'repeating-conic-gradient(#E2F3E8 0% 25%, #F9E6E8 0% 50%) 0 0 / 28px 28px',
    badgeClass: 'bg-[#FFE7EA] border-[#F3A8B4] text-[#A82C46]',
    accentOverlayClass: 'from-[#FFE0E6]/24 to-transparent',
    decorEmojis: ['🎄', '🕯️', '🎁'],
  },
];

export const SEASON_ROOM_THEME_BY_ID: Record<
  Exclude<SeasonRoomThemeId, 'none'>,
  SeasonRoomThemeDefinition
> = Object.fromEntries(
  SEASON_ROOM_THEMES.map((t) => [t.id, t])
) as Record<Exclude<SeasonRoomThemeId, 'none'>, SeasonRoomThemeDefinition>;

export interface SeasonYardThemeDefinition {
  id: Exclude<SeasonYardThemeId, 'none'>;
  name: string;
  emoji: string;
  description: string;
  decorLabels: [string, string, string];
  decorEmojis: [string, string, string];
  skyGradient: string;
  hillBackColor: string;
  hillFrontColor: string;
  lawnColor: string;
}

export const SEASON_YARD_THEMES: Record<
  Exclude<SeasonYardThemeId, 'none'>,
  SeasonYardThemeDefinition
> = {
  spring: {
    id: 'spring',
    name: '春季庭院',
    emoji: '🌸',
    description: '櫻花樹、春日花圃與蝴蝶微光燈裝飾，微風吹過都是花瓣雨。',
    decorLabels: ['櫻花樹', '春日花圃', '蝴蝶燈'],
    decorEmojis: ['🌸', '🌷', '🦋'],
    skyGradient: 'linear-gradient(180deg, #E5F5FF 0%, #FFF3F8 100%)',
    hillBackColor: '#CDEAC0',
    hillFrontColor: '#B5DF9E',
    lawnColor: '#D6EBC4',
  },
  summer: {
    id: 'summer',
    name: '夏季庭院',
    emoji: '⛱️',
    description: '戲水池、海灘陽傘與冰涼西瓜擺飾，草地變成清爽消暑基地！',
    decorLabels: ['戲水池', '遮陽傘', '西瓜擺飾'],
    decorEmojis: ['💦', '⛱️', '🍉'],
    skyGradient: 'linear-gradient(180deg, #BBE8FF 0%, #EFFBFF 100%)',
    hillBackColor: '#B4E39E',
    hillFrontColor: '#98D57F',
    lawnColor: '#C5E8A4',
  },
  autumn: {
    id: 'autumn',
    name: '秋季庭院',
    emoji: '🍁',
    description: '楓葉樹、金黃南瓜與沙沙落葉堆，刺蝟最愛躲進來歇腳。',
    decorLabels: ['楓葉樹', '金黃南瓜', '落葉堆'],
    decorEmojis: ['🍁', '🎃', '🍂'],
    skyGradient: 'linear-gradient(180deg, #FFE8CF 0%, #FFF6E6 100%)',
    hillBackColor: '#E5CA9B',
    hillFrontColor: '#D9B67C',
    lawnColor: '#E7D1A4',
  },
  winter: {
    id: 'winter',
    name: '冬季庭院',
    emoji: '⛄',
    description: '微笑雪人、戶外暖爐與掛燈雪松樹，冷冬裡依然暖烘烘！',
    decorLabels: ['微笑雪人', '溫暖壁爐', '松樹'],
    decorEmojis: ['⛄', '🔥', '🌲'],
    skyGradient: 'linear-gradient(180deg, #DCEEFF 0%, #F5FAFF 100%)',
    hillBackColor: '#DCE8F5',
    hillFrontColor: '#EEF5FC',
    lawnColor: '#E8F2FC',
  },
};

export const SEASON_PHOTO_CONTENT: Record<SeasonId, SeasonPhotoContent> = {
  spring: {
    seasonId: 'spring',
    label: '春季寫真主題',
    backgroundIds: ['sakura_path', 'spring_picnic'],
    filterIds: ['sakura_pink', 'morning_dawn'],
    frameIds: ['petal_frame', 'butterfly_frame'],
    unlockHint: '春季期間完成每日天氣任務、櫻花野餐祭或於攝影棚商店解鎖',
  },
  summer: {
    seasonId: 'summer',
    label: '夏季寫真主題',
    backgroundIds: ['beach_vacation', 'summer_festival'],
    filterIds: ['ocean_blue', 'sunny_orange'],
    frameIds: ['shell_frame', 'popsicle_frame'],
    unlockHint: '夏季晴天／炎熱天氣散步、夏日攝影合成或攝影棚商店解鎖',
  },
  autumn: {
    seasonId: 'autumn',
    label: '秋季寫真主題',
    backgroundIds: ['maple_path', 'harvest_farm'],
    filterIds: ['maple_red', 'warm_gold'],
    frameIds: ['maple_frame', 'pumpkin_frame'],
    unlockHint: '秋季收成南瓜蘋果或於攝影棚合成解鎖',
  },
  winter: {
    seasonId: 'winter',
    label: '冬季寫真主題',
    backgroundIds: ['snow_cabin', 'christmas_market'],
    filterIds: ['snow_white', 'hearth_orange'],
    frameIds: ['snowflake_frame', 'gingerbread_frame'],
    unlockHint: '下雪天氣拍照立即解鎖冬季寫真元素，亦可透過冬季商店／合成獲得',
  },
};
