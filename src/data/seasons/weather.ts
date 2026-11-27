import {
  SeasonId,
  WeatherCityOption,
  WeatherCondition,
  WeatherTask,
} from '../../types';

export const WEATHER_AUTO_REFRESH_MS = 45 * 60 * 1000; // 45 minutes (within 30-60 min spec)

export const WEATHER_CITIES: WeatherCityOption[] = [
  { id: 'quebec', name: '魁北克省', region: '加拿大・楓葉雪國', lat: 46.8139, lon: -71.208, climateBias: 'snowy' },
  { id: 'kaohsiung', name: '高雄', region: '南台灣・港都晴陽', lat: 22.6273, lon: 120.3014, climateBias: 'warm' },
  { id: 'taipei', name: '台北', region: '北台灣・盆地微風', lat: 25.033, lon: 121.5654, climateBias: 'mild' },
  { id: 'taichung', name: '台中', region: '中台灣・舒爽晴朗', lat: 24.1477, lon: 120.6736, climateBias: 'mild' },
  { id: 'tainan', name: '台南', region: '南台灣・暖陽古都', lat: 22.9997, lon: 120.227, climateBias: 'warm' },
  { id: 'hualien', name: '花蓮', region: '東台灣・山海微風', lat: 23.9872, lon: 121.6016, climateBias: 'mild' },
  { id: 'tokyo', name: '東京', region: '日本・關東四季', lat: 35.6762, lon: 139.6503, climateBias: 'cool' },
  { id: 'seoul', name: '首爾', region: '韓國・漢江四季', lat: 37.5665, lon: 126.978, climateBias: 'cool' },
  { id: 'sapporo', name: '札幌', region: '北海道・雪國北境', lat: 43.0618, lon: 141.3545, climateBias: 'snowy' },
];

export const WEATHER_CITY_BY_ID: Record<string, WeatherCityOption> = Object.fromEntries(
  WEATHER_CITIES.map((c) => [c.id, c])
);

export const DEFAULT_CITY_ID = 'quebec';

export interface WeatherEffectProfile {
  condition: WeatherCondition;
  label: string;
  emoji: string;
  badgeClass: string;
  farmEffect: string;
  visitorEffect: string;
  petEffect: string;
  gameplayEffect: string;
}

export const WEATHER_EFFECT_PROFILES: Record<WeatherCondition, WeatherEffectProfile> = {
  clear: {
    condition: 'clear',
    label: '晴天',
    emoji: '☀️',
    badgeClass: 'bg-[#FFF5D6] border-[#F2CE6D] text-[#8E5311]',
    farmEffect: '作物正常生長，當季作物額外 +10% 加速',
    visitorEffect: '小鳥、蝴蝶出現機率提升',
    petEffect: '心情更容易提升，主動想出門散步',
    gameplayEffect: '散步獎勵 +10%（金幣與好感提升）',
  },
  cloudy: {
    condition: 'cloudy',
    label: '多雲',
    emoji: '⛅',
    badgeClass: 'bg-[#EEF2F7] border-[#C5D1E0] text-[#45566E]',
    farmEffect: '作物穩定正常生長',
    visitorEffect: '訪客出現機率維持正常節奏',
    petEffect: '性格安穩放鬆，適合在室內陪伴互動',
    gameplayEffect: '室內照顧與房間互動最舒適',
  },
  rain: {
    condition: 'rain',
    label: '下雨',
    emoji: '🌧️',
    badgeClass: 'bg-[#E3F2FF] border-[#9EC9F2] text-[#1D5A94]',
    farmEffect: '作物自動澆水且生長速度 +10%',
    visitorEffect: '小鴨與青蛙出現機率大幅提高',
    petEffect: '喜歡窩在溫暖房間裡洗澡與打盹',
    gameplayEffect: '洗澡與睡覺照護獎勵提升',
  },
  snow: {
    condition: 'snow',
    label: '下雪',
    emoji: '❄️',
    badgeClass: 'bg-[#E9F5FF] border-[#B4DCFA] text-[#1D5B8C]',
    farmEffect: '一般戶外作物暫停生長（耐寒冬季作物與溫室除外）',
    visitorEffect: '小鳥、小兔子與雪狐容易來訪',
    petEffect: '想要暖毯子取暖，互動更黏人',
    gameplayEffect: '下雪時拍照可解鎖冬季攝影主題元素',
  },
  hot: {
    condition: 'hot',
    label: '炎熱',
    emoji: '🌡️',
    badgeClass: 'bg-[#FFE7DC] border-[#F5B090] text-[#9E3C16]',
    farmEffect: '作物較需要水分（未澆水略慢，澆水或溫室恢復）',
    visitorEffect: '小鴨與蝴蝶較容易前來納涼',
    petEffect: '特別想吃清涼食物消暑（推薦薄荷、西瓜、水果盒）',
    gameplayEffect: '餵食清涼食物額外提升心情與反應',
  },
  windy: {
    condition: 'windy',
    label: '大風',
    emoji: '🍃',
    badgeClass: 'bg-[#E4F8EF] border-[#9ADBC0] text-[#1F6B54]',
    farmEffect: '部分作物偶爾被吹歪，點一下「固定作物」即可恢復並獲小獎勵',
    visitorEffect: '小鳥與松鼠常順風來串門子',
    petEffect: '毛茸茸耳朵被風吹得晃晃的，特別好奇',
    gameplayEffect: '小遊戲獎勵提升 +15%',
  },
  storm: {
    condition: 'storm',
    label: '雷雨',
    emoji: '⛈️',
    badgeClass: 'bg-[#EAE7FA] border-[#BEB5EC] text-[#4C3A96]',
    farmEffect: '露天作物暫停生長（Glass Greenhouse 溫室不受影響）',
    visitorEffect: '雷雨天訪客暫時減少出門',
    petEffect: '聽到雷聲會有點害怕，渴望主人摸摸安撫',
    gameplayEffect: '摸摸安撫寵物獎勵提升（額外金幣與親密度）',
  },
};

export const COOLING_FOOD_IDS: string[] = [
  'mint_parfait',
  'watermelon_smoothie',
  'mint_salad',
  'fruit_box',
  'carrot_salad',
  'snowberry_pudding',
];

export const WARMING_FOOD_IDS: string[] = [
  'warm_veggie_soup',
  'pumpkin_soup',
  'cocoa_mint_latte',
  'pumpkin_pie',
  'apple_pie',
];

export function simulateWeatherForCity(
  cityId: string,
  seasonId: SeasonId,
  date: Date = new Date()
): { condition: WeatherCondition; temperatureC: number } {
  const city = WEATHER_CITY_BY_ID[cityId] ?? WEATHER_CITY_BY_ID[DEFAULT_CITY_ID];
  const daySeed =
    date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate();
  const slotSeed = Math.floor(date.getHours() / 3);
  const cityOffset = city.id
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const roll = (daySeed * 17 + slotSeed * 7 + cityOffset) % 100;

  let condition: WeatherCondition = 'clear';

  if (city.climateBias === 'warm') {
    if (seasonId === 'summer') {
      if (roll < 42) condition = 'clear';
      else if (roll < 68) condition = 'hot';
      else if (roll < 82) condition = 'cloudy';
      else if (roll < 94) condition = 'rain';
      else condition = 'storm';
    } else if (seasonId === 'winter') {
      if (roll < 58) condition = 'clear';
      else if (roll < 82) condition = 'cloudy';
      else if (roll < 94) condition = 'windy';
      else condition = 'rain';
    } else {
      if (roll < 48) condition = 'clear';
      else if (roll < 70) condition = 'cloudy';
      else if (roll < 86) condition = 'rain';
      else if (roll < 95) condition = 'windy';
      else condition = 'hot';
    }
  } else if (city.climateBias === 'snowy') {
    if (seasonId === 'winter') {
      if (roll < 52) condition = 'snow';
      else if (roll < 75) condition = 'cloudy';
      else if (roll < 90) condition = 'clear';
      else condition = 'windy';
    } else if (seasonId === 'summer') {
      if (roll < 52) condition = 'clear';
      else if (roll < 78) condition = 'cloudy';
      else condition = 'rain';
    } else {
      if (roll < 40) condition = 'clear';
      else if (roll < 66) condition = 'cloudy';
      else if (roll < 84) condition = 'windy';
      else if (roll < 94) condition = 'rain';
      else condition = 'snow';
    }
  } else if (city.climateBias === 'cool') {
    if (seasonId === 'winter') {
      if (roll < 36) condition = 'clear';
      else if (roll < 62) condition = 'snow';
      else if (roll < 85) condition = 'cloudy';
      else condition = 'windy';
    } else if (seasonId === 'summer') {
      if (roll < 42) condition = 'clear';
      else if (roll < 62) condition = 'hot';
      else if (roll < 82) condition = 'cloudy';
      else if (roll < 94) condition = 'rain';
      else condition = 'storm';
    } else {
      if (roll < 44) condition = 'clear';
      else if (roll < 68) condition = 'cloudy';
      else if (roll < 84) condition = 'rain';
      else condition = 'windy';
    }
  } else {
    // mild (台北/台中/花蓮)
    if (seasonId === 'summer') {
      if (roll < 40) condition = 'clear';
      else if (roll < 62) condition = 'hot';
      else if (roll < 78) condition = 'cloudy';
      else if (roll < 92) condition = 'rain';
      else condition = 'storm';
    } else if (seasonId === 'winter') {
      if (roll < 38) condition = 'clear';
      else if (roll < 68) condition = 'cloudy';
      else if (roll < 88) condition = 'rain';
      else condition = 'windy';
    } else {
      if (roll < 44) condition = 'clear';
      else if (roll < 68) condition = 'cloudy';
      else if (roll < 86) condition = 'rain';
      else condition = 'windy';
    }
  }

  const baseTempBySeason: Record<SeasonId, number> = {
    spring: 23,
    summer: 30,
    autumn: 22,
    winter: 15,
  };
  const biasOffset =
    city.climateBias === 'warm'
      ? 3
      : city.climateBias === 'snowy'
      ? -12
      : city.climateBias === 'cool'
      ? -5
      : 0;
  const condOffset: Record<WeatherCondition, number> = {
    clear: 1,
    cloudy: -1,
    rain: -3,
    snow: -10,
    hot: 5,
    windy: -2,
    storm: -4,
  };

  const rawTemp = baseTempBySeason[seasonId] + biasOffset + condOffset[condition];
  const temperatureC =
    condition === 'snow'
      ? Math.min(2, rawTemp)
      : condition === 'hot'
      ? Math.max(30, rawTemp)
      : rawTemp;

  return { condition, temperatureC };
}

export function buildDailyWeatherTasks(
  dateKey: string,
  condition: WeatherCondition
): WeatherTask[] {
  switch (condition) {
    case 'clear':
      return [
        {
          id: `wt_${dateKey}_clear_walk`,
          dateKey,
          weatherCondition: 'clear',
          kind: 'walk',
          title: '晴天去散步',
          description: '趁著陽光剛好，帶萌寵出門散步 1 次享受 +10% 獎勵！',
          emoji: '☀️',
          progress: 0,
          target: 1,
          completed: false,
          claimed: false,
          rewardCoins: 45,
          rewardStudioMaterials: 1,
          rewardSummary: '+45 金幣 · 攝影材料 ×1',
        },
        {
          id: `wt_${dateKey}_clear_photo`,
          dateKey,
          weatherCondition: 'clear',
          kind: 'snow_photo',
          title: '晴空穿搭留念',
          description: '在攝影棚幫萌寵拍下 1 張晴天美照。',
          emoji: '📸',
          progress: 0,
          target: 1,
          completed: false,
          claimed: false,
          rewardCoins: 35,
          rewardSpeedTickets: 1,
          rewardSummary: '+35 金幣 · 加速券 ×1',
        },
      ];
    case 'rain':
      return [
        {
          id: `wt_${dateKey}_rain_care`,
          dateKey,
          weatherCondition: 'rain',
          kind: 'bath_or_sleep',
          title: '雨天洗澡或睡覺',
          description: '聽著雨聲幫萌寵洗澡或蓋被睡覺 1 次，拿雨天照護獎勵！',
          emoji: '🌧️',
          progress: 0,
          target: 1,
          completed: false,
          claimed: false,
          rewardCoins: 50,
          rewardStudioMaterials: 1,
          rewardSummary: '+50 金幣 · 攝影材料 ×1',
        },
      ];
    case 'snow':
      return [
        {
          id: `wt_${dateKey}_snow_photo`,
          dateKey,
          weatherCondition: 'snow',
          kind: 'snow_photo',
          title: '雪天拍照紀念',
          description: '在下雪天替萌寵拍照 1 次，解鎖冬季寫真驚喜與獎勵！',
          emoji: '❄️',
          progress: 0,
          target: 1,
          completed: false,
          claimed: false,
          rewardCoins: 60,
          rewardFilterShards: 2,
          rewardSummary: '+60 金幣 · 濾鏡碎片 ×2',
        },
      ];
    case 'hot':
      return [
        {
          id: `wt_${dateKey}_hot_cool`,
          dateKey,
          weatherCondition: 'hot',
          kind: 'cooling_food',
          title: '炎熱天吃清涼食物',
          description: '餵萌寵吃西瓜冰沙、薄荷沙拉、薄荷聖代或水果盒 1 次！',
          emoji: '🍨',
          progress: 0,
          target: 1,
          completed: false,
          claimed: false,
          rewardCoins: 55,
          rewardSpeedTickets: 1,
          rewardSummary: '+55 金幣 · 加速券 ×1',
        },
      ];
    case 'windy':
      return [
        {
          id: `wt_${dateKey}_windy_game`,
          dateKey,
          weatherCondition: 'windy',
          kind: 'minigame',
          title: '大風天玩小遊戲',
          description: '趁大風天玩 1 次小遊戲，拿 +15% 小遊戲加碼獎勵！',
          emoji: '🍃',
          progress: 0,
          target: 1,
          completed: false,
          claimed: false,
          rewardCoins: 55,
          rewardStudioMaterials: 1,
          rewardSummary: '+55 金幣 · 攝影材料 ×1',
        },
      ];
    case 'storm':
      return [
        {
          id: `wt_${dateKey}_storm_soothe`,
          dateKey,
          weatherCondition: 'storm',
          kind: 'soothe_pet',
          title: '雷雨天安撫寵物 3 次',
          description: '外面在打雷了，溫柔摸摸安撫萌寵 3 次吧！',
          emoji: '⛈️',
          progress: 0,
          target: 3,
          completed: false,
          claimed: false,
          rewardCoins: 65,
          rewardFilterShards: 2,
          rewardSummary: '+65 金幣 · 濾鏡碎片 ×2',
        },
      ];
    case 'cloudy':
    default:
      return [
        {
          id: `wt_${dateKey}_cloudy_care`,
          dateKey,
          weatherCondition: 'cloudy',
          kind: 'indoor_care',
          title: '多雲愜意時光',
          description: '在舒服的陰天餵食或摸摸萌寵共 2 次，享受悠閒陪伴！',
          emoji: '⛅',
          progress: 0,
          target: 2,
          completed: false,
          claimed: false,
          rewardCoins: 40,
          rewardStudioMaterials: 1,
          rewardSummary: '+40 金幣 · 攝影材料 ×1',
        },
      ];
  }
}
