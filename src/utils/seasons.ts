import { getAccessoryById } from '../data/accessories';
import { getTitleDefinition } from '../data/encyclopedia';
import {
  PHOTO_BACKGROUND_BY_ID,
  PHOTO_FILTER_BY_ID,
  PHOTO_FRAME_BY_ID,
} from '../data/photoStudio';
import {
  COLD_HARDY_CROP_IDS,
  DEFAULT_CITY_ID,
  SAKURA_PICNIC_SHOP_ITEMS,
  SEASON_META,
  WEATHER_AUTO_REFRESH_MS,
  WEATHER_CITY_BY_ID,
  WEATHER_EFFECT_PROFILES,
  buildDailyWeatherTasks,
  buildSakuraDailyTasks,
  createInitialSpringSakuraEvent,
  isCropInSeason,
  simulateWeatherForCity,
} from '../data/seasons';
import {
  CropPlot,
  GameState,
  IngredientId,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  SeasonEvent,
  SeasonEventShopItem,
  SeasonEventTask,
  SeasonId,
  SeasonRoomThemeId,
  SeasonSystemState,
  SeasonYardThemeId,
  TitleId,
  TownVisitorId,
  VisitorId,
  WeatherCondition,
  WeatherState,
  WeatherTask,
} from '../types';
import { getLocalTimePeriod, isNightTimePeriod } from './dialogue';
import { recordMemoryEntry } from './memories';
import { updateActivePet } from './pets';
import { getPhotoStudioState } from './photoStudio';

export function getSeasonFromDate(date: Date = new Date()): SeasonId {
  const month = date.getMonth() + 1; // 1..12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

export function getSeasonDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const parts = dateKey.split('-').map((n) => parseInt(n, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    const dt = new Date(Date.now() + days * 86400000);
    return getSeasonDateKey(dt);
  }
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() + days);
  return getSeasonDateKey(dt);
}

export function getSeasonEventRemainingText(
  event: SeasonEvent,
  now: Date = new Date()
): string {
  if (event.status === 'ended') return '活動已結束（道具收錄於圖鑑）';
  if (event.status === 'reserved') return '敬請期待';
  const endParts = event.endDate.split('-').map((n) => parseInt(n, 10));
  if (endParts.length !== 3 || endParts.some((n) => Number.isNaN(n))) {
    return `${event.durationDays} 天慶典`;
  }
  const endDt = new Date(endParts[0], endParts[1] - 1, endParts[2], 23, 59, 59, 999);
  const diffMs = Math.max(0, endDt.getTime() - now.getTime());
  if (diffMs <= 0) return '最後倒數';
  const totalHours = Math.floor(diffMs / 3600000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return days > 0 ? `剩餘 ${days} 天 ${hours} 小時` : `剩餘 ${Math.max(1, hours)} 小時`;
}

export function createInitialSeasonSystemState(
  now: number = Date.now()
): SeasonSystemState {
  const date = new Date(now);
  const dateKey = getSeasonDateKey(date);
  const currentSeason = getSeasonFromDate(date);
  const endDateKey = addDaysToDateKey(dateKey, 13);
  return {
    currentSeason,
    lastKnownSeason: currentSeason,
    seasonNoticePending: false,
    selectedCityId: DEFAULT_CITY_ID,
    roomThemeOverride: 'none',
    yardThemeOverride: 'none',
    weatherTasksDate: dateKey,
    weatherTasks: buildDailyWeatherTasks(dateKey, 'clear'),
    seasonEvent: createInitialSpringSakuraEvent(dateKey, endDateKey),
    offlineSummary: null,
  };
}

function syncSeasonEventLifecycle(
  event: SeasonEvent,
  dateKey: string
): SeasonEvent {
  const isEnded = dateKey > event.endDate;
  const nextStatus =
    isEnded && event.status === 'active' ? 'ended' : event.status;
  const isNewDay = event.dailyDate !== dateKey;

  if (!isNewDay && nextStatus === event.status && event.coopTask) {
    return event;
  }

  const nextCoopTask = event.coopTask
    ? isNewDay
      ? {
          id: `sakura_coop_${dateKey}`,
          dateKey,
          title: event.coopTask.title,
          description: event.coopTask.description,
          picnicFoodCount: 0,
          picnicFoodTarget: event.coopTask.picnicFoodTarget,
          photoCount: 0,
          photoTarget: event.coopTask.photoTarget,
          contributorUserIds: [],
          completed: false,
          claimedByUserIds: [],
          rewardTickets: event.coopTask.rewardTickets,
          rewardCoins: event.coopTask.rewardCoins,
        }
      : event.coopTask
    : null;

  return {
    ...event,
    status: nextStatus,
    dailyDate: isNewDay ? dateKey : event.dailyDate,
    dailyTasks: isNewDay ? buildSakuraDailyTasks() : event.dailyTasks,
    coopTask: nextCoopTask,
  };
}

export function syncSeasonSystemState(
  state: GameState,
  now: number = Date.now()
): GameState {
  const nowDate = new Date(now);
  const dateKey = getSeasonDateKey(nowDate);
  const detectedSeason = getSeasonFromDate(nowDate);
  const base = state.seasonSystem ?? createInitialSeasonSystemState(now);
  const activeCondition = state.dialogue.weather.condition ?? 'clear';

  const seasonChanged = base.lastKnownSeason !== detectedSeason;
  const needNewWeatherTasks =
    base.weatherTasksDate !== dateKey ||
    base.weatherTasks.length === 0 ||
    base.weatherTasks[0]?.weatherCondition !== activeCondition;

  const syncedEvent = syncSeasonEventLifecycle(base.seasonEvent, dateKey);

  let nextSeasonSystem: SeasonSystemState = {
    ...base,
    currentSeason: detectedSeason,
    lastKnownSeason: detectedSeason,
    seasonNoticePending: seasonChanged ? true : base.seasonNoticePending,
    weatherTasksDate: needNewWeatherTasks ? dateKey : base.weatherTasksDate,
    weatherTasks: needNewWeatherTasks
      ? buildDailyWeatherTasks(dateKey, activeCondition)
      : base.weatherTasks,
    seasonEvent: syncedEvent,
  };

  let nextState: GameState = {
    ...state,
    seasonSystem: nextSeasonSystem,
  };

  if (seasonChanged) {
    const seasonMeta = SEASON_META[detectedSeason];
    const yearKey = dateKey.slice(0, 4);
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: `season_transition_${detectedSeason}_${yearKey}`,
      type: 'festival',
      title: `季節變化了！歡迎來到${seasonMeta.name}`,
      description: `${seasonMeta.ambientDesc}（${seasonMeta.monthsLabel}）`,
      emoji: seasonMeta.emoji,
      dateKey,
    });

    const unlockedTitles = new Set<TitleId>(nextState.encyclopedia.unlockedTitles);
    if (!unlockedTitles.has('four_seasons_keeper')) {
      unlockedTitles.add('four_seasons_keeper');
      nextState = {
        ...nextState,
        encyclopedia: {
          ...nextState.encyclopedia,
          unlockedTitles: Array.from(unlockedTitles),
          activeTitle: nextState.encyclopedia.activeTitle ?? 'four_seasons_keeper',
        },
      };
    }
  }

  if (activeCondition === 'rain') {
    nextState = applyRainAutoWaterToPlots(nextState, dateKey);
  }

  nextSeasonSystem = nextState.seasonSystem!;
  if (
    !seasonChanged &&
    !needNewWeatherTasks &&
    syncedEvent === base.seasonEvent &&
    state.seasonSystem &&
    nextState === state
  ) {
    return state;
  }

  return nextState;
}

export function selectWeatherCity(
  state: GameState,
  cityId: string
): GameState {
  const validCity = WEATHER_CITY_BY_ID[cityId] ?? WEATHER_CITY_BY_ID[DEFAULT_CITY_ID];
  const base = state.seasonSystem ?? createInitialSeasonSystemState();
  if (base.selectedCityId === validCity.id && state.dialogue.weather.cityId === validCity.id) {
    return state;
  }
  return {
    ...state,
    seasonSystem: {
      ...base,
      selectedCityId: validCity.id,
    },
    dialogue: {
      ...state.dialogue,
      weather: {
        ...state.dialogue.weather,
        cityId: validCity.id,
        cityName: validCity.name,
      },
    },
  };
}

interface WeatherApiResponse {
  condition?: unknown;
  temperatureC?: unknown;
  cityId?: unknown;
  cityName?: unknown;
  mode?: unknown;
  seasonId?: unknown;
}

function asValidWeatherCondition(value: unknown): WeatherCondition | null {
  if (
    value === 'clear' ||
    value === 'cloudy' ||
    value === 'rain' ||
    value === 'snow' ||
    value === 'hot' ||
    value === 'windy' ||
    value === 'storm'
  ) {
    return value;
  }
  return null;
}

export async function fetchAndApplyWeather(
  state: GameState,
  opts?: {
    cityId?: string;
    force?: boolean;
    isOnline?: boolean;
    now?: number;
  }
): Promise<GameState> {
  const now = opts?.now ?? Date.now();
  const nowDate = new Date(now);
  const dateKey = getSeasonDateKey(nowDate);
  const seasonId = getSeasonFromDate(nowDate);
  const base = state.seasonSystem ?? createInitialSeasonSystemState(now);
  const cityId = opts?.cityId ?? base.selectedCityId ?? DEFAULT_CITY_ID;
  const city = WEATHER_CITY_BY_ID[cityId] ?? WEATHER_CITY_BY_ID[DEFAULT_CITY_ID];

  const existingWeather = state.dialogue.weather;
  const shouldSkipThrottle =
    !opts?.force &&
    existingWeather.cityId === city.id &&
    existingWeather.nextRefreshAt &&
    now < existingWeather.nextRefreshAt;
  if (shouldSkipThrottle) {
    return state;
  }

  const onlineFlag =
    opts?.isOnline ?? (typeof navigator !== 'undefined' ? navigator.onLine : true);

  let resolvedCondition: WeatherCondition = existingWeather.condition ?? 'clear';
  let resolvedTemp = existingWeather.temperatureC ?? 24;
  let resolvedMode: 'simulated' | 'live' = 'simulated';
  let isOfflineFallback = !onlineFlag;

  if (onlineFlag) {
    try {
      const controller =
        typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer =
        controller && typeof window !== 'undefined'
          ? window.setTimeout(() => controller.abort(), 3500)
          : null;

      const res = await fetch(
        `/api/weather?city=${encodeURIComponent(city.id)}&season=${encodeURIComponent(seasonId)}`,
        {
          method: 'GET',
          signal: controller?.signal,
        }
      );

      if (timer !== null && typeof window !== 'undefined') {
        window.clearTimeout(timer);
      }

      if (res.ok) {
        const payload = (await res.json()) as WeatherApiResponse;
        const apiCond = asValidWeatherCondition(payload.condition);
        const apiTemp =
          typeof payload.temperatureC === 'number' &&
          Number.isFinite(payload.temperatureC)
            ? Math.round(payload.temperatureC)
            : null;
        if (apiCond) {
          resolvedCondition = apiCond;
          resolvedTemp = apiTemp ?? simulateWeatherForCity(city.id, seasonId, nowDate).temperatureC;
          resolvedMode = payload.mode === 'live' ? 'live' : 'simulated';
          isOfflineFallback = false;
        } else {
          const sim = simulateWeatherForCity(city.id, seasonId, nowDate);
          resolvedCondition = sim.condition;
          resolvedTemp = sim.temperatureC;
          resolvedMode = 'simulated';
        }
      } else {
        const sim = simulateWeatherForCity(city.id, seasonId, nowDate);
        resolvedCondition = sim.condition;
        resolvedTemp = sim.temperatureC;
        resolvedMode = 'simulated';
      }
    } catch {
      // Fall back safely to cached weather if offline, or deterministic city seasonal simulation
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        isOfflineFallback = true;
        resolvedCondition = existingWeather.condition ?? 'clear';
        resolvedTemp = existingWeather.temperatureC ?? 24;
      } else {
        const sim = simulateWeatherForCity(city.id, seasonId, nowDate);
        resolvedCondition = sim.condition;
        resolvedTemp = sim.temperatureC;
        resolvedMode = 'simulated';
      }
    }
  } else {
    // Offline: retain last synced weather (or clear default)
    resolvedCondition = existingWeather.condition ?? 'clear';
    resolvedTemp = existingWeather.temperatureC ?? 24;
    isOfflineFallback = true;
  }

  const profile = WEATHER_EFFECT_PROFILES[resolvedCondition];
  const nextWeather: WeatherState = {
    condition: resolvedCondition,
    temperatureC: resolvedTemp,
    label: profile.label,
    emoji: profile.emoji,
    source: resolvedMode === 'live' ? 'api_ready' : 'fixed',
    updatedAt: now,
    cityId: city.id,
    cityName: city.name,
    nextRefreshAt: now + WEATHER_AUTO_REFRESH_MS,
    lastSyncedOnlineAt: isOfflineFallback
      ? existingWeather.lastSyncedOnlineAt ?? null
      : now,
    isOfflineFallback,
    seasonId,
    mode: resolvedMode,
  };

  const seasonMeta = SEASON_META[seasonId];
  const nextOfflineSummary = isOfflineFallback
    ? {
        dateKey,
        seasonId,
        weatherCondition: resolvedCondition,
        weatherLabel: profile.label,
        cityName: city.name,
        isOffline: true,
        summaryText: `目前離線中，沿用上次同步天氣「${profile.emoji} ${profile.label}（${city.name}）」，季節為${seasonMeta.emoji} ${seasonMeta.name}。`,
      }
    : null;

  const updatedWeatherTasks =
    base.weatherTasksDate !== dateKey ||
    base.weatherTasks[0]?.weatherCondition !== resolvedCondition
      ? buildDailyWeatherTasks(dateKey, resolvedCondition)
      : base.weatherTasks;

  let nextState: GameState = {
    ...state,
    dialogue: {
      ...state.dialogue,
      weather: nextWeather,
    },
    seasonSystem: {
      ...base,
      currentSeason: seasonId,
      lastKnownSeason: seasonId,
      selectedCityId: city.id,
      weatherTasksDate: dateKey,
      weatherTasks: updatedWeatherTasks,
      offlineSummary: nextOfflineSummary,
    },
  };

  if (resolvedCondition === 'rain') {
    nextState = applyRainAutoWaterToPlots(nextState, dateKey);
  } else if (resolvedCondition === 'windy') {
    nextState = maybeTriggerWindblownPlot(nextState, now);
  } else if (resolvedCondition === 'snow') {
    nextState = unlockWinterSnowPhotoBonus(nextState).nextState;
  }

  return nextState;
}

export interface CropSeasonWeatherEvaluation {
  rateMultiplier: number;
  isPaused: boolean;
  pauseReason?: string;
  yieldDelta: number;
  inSeason: boolean;
  isColdHardy: boolean;
  isWindblown: boolean;
  badges: string[];
}

export function evaluateCropConditions(params: {
  cropId: IngredientId | null;
  watered?: boolean;
  windblown?: boolean;
  seasonId: SeasonId;
  weatherCondition: WeatherCondition;
  greenhouseLevel: number;
}): CropSeasonWeatherEvaluation {
  const { cropId, watered, windblown, seasonId, weatherCondition, greenhouseLevel } = params;
  const hasGreenhouse = greenhouseLevel >= 1;

  if (!cropId) {
    return {
      rateMultiplier: 1,
      isPaused: false,
      yieldDelta: 0,
      inSeason: true,
      isColdHardy: false,
      isWindblown: false,
      badges: [],
    };
  }

  const inSeason = isCropInSeason(cropId, seasonId);
  const isColdHardy = COLD_HARDY_CROP_IDS.has(cropId);
  const isWindblown = Boolean(windblown);
  const badges: string[] = [];

  let rateMultiplier = 1;
  let yieldDelta = 0;

  if (inSeason) {
    rateMultiplier *= 1.1;
    badges.push(`${SEASON_META[seasonId].emoji} 當季 +10%`);
  } else {
    rateMultiplier *= 0.75;
    yieldDelta = -1;
    badges.push('非當季略慢');
  }

  let isPaused = false;
  let pauseReason: string | undefined;

  if (weatherCondition === 'snow' && !isColdHardy && !hasGreenhouse) {
    isPaused = true;
    pauseReason = '❄️ 下雪暫停生長（耐寒作物／溫室可繼續）';
  } else if (weatherCondition === 'storm' && !hasGreenhouse) {
    isPaused = true;
    pauseReason = '⛈️ 雷雨暫停生長（升級溫室可保護）';
  }

  if (!isPaused) {
    if (weatherCondition === 'rain') {
      rateMultiplier *= 1.1;
      badges.push('🌧️ 雨天 +10%');
    } else if (weatherCondition === 'hot' && !watered && !hasGreenhouse) {
      rateMultiplier *= 0.85;
      badges.push('🌡️ 炎熱需補水');
    }
    if (weatherCondition === 'windy' && isWindblown) {
      rateMultiplier *= 0.75;
      badges.push('🍃 被風吹歪');
    }
  }

  return {
    rateMultiplier,
    isPaused,
    pauseReason,
    yieldDelta,
    inSeason,
    isColdHardy,
    isWindblown,
    badges,
  };
}

export function evaluateCropSeasonAndWeather(
  state: GameState,
  plot: CropPlot
): CropSeasonWeatherEvaluation {
  return evaluateCropConditions({
    cropId: plot.cropId,
    watered: plot.watered,
    windblown: plot.windblown,
    seasonId: state.seasonSystem?.currentSeason ?? getSeasonFromDate(),
    weatherCondition: state.dialogue.weather.condition ?? 'clear',
    greenhouseLevel: state.house.farmUpgrades.greenhouseLevel ?? 0,
  });
}

export function applyRainAutoWaterToPlots(
  state: GameState,
  dateKey: string = getSeasonDateKey()
): GameState {
  if (state.dialogue.weather.condition !== 'rain') return state;
  let changed = false;
  const nextPlots = state.farmPlots.map((plot) => {
    if (
      plot.cropId &&
      plot.plantedAt !== null &&
      (!plot.watered || plot.autoWateredByRainDate !== dateKey)
    ) {
      changed = true;
      return {
        ...plot,
        watered: true,
        autoWateredByRainDate: dateKey,
      };
    }
    return plot;
  });
  return changed ? { ...state, farmPlots: nextPlots } : state;
}

export function maybeTriggerWindblownPlot(
  state: GameState,
  now: number = Date.now()
): GameState {
  if (state.dialogue.weather.condition !== 'windy') return state;
  const planted = state.farmPlots.filter(
    (p) => p.cropId !== null && p.plantedAt !== null
  );
  if (planted.length === 0) return state;
  if (planted.some((p) => p.windblown)) return state;

  // Pick at most 1 planted plot smoothly based on plot id and hour slot
  const target = planted[Math.floor(now / 60000) % planted.length];
  return {
    ...state,
    farmPlots: state.farmPlots.map((p) =>
      p.id === target.id ? { ...p, windblown: true } : p
    ),
  };
}

export function stabilizeWindblownPlot(
  state: GameState,
  plotId: number
): { nextState: GameState; ok: boolean; notice?: string; error?: string } {
  const plot = state.farmPlots.find((p) => p.id === plotId);
  if (!plot || !plot.windblown) {
    return { nextState: state, ok: false, error: '這塊農地沒有被大風吹歪喔！' };
  }

  const nextPlots = state.farmPlots.map((p) =>
    p.id === plotId ? { ...p, windblown: false } : p
  );

  let nextState = updateActivePet(state, (pet) => ({
    ...pet,
    mood: Math.min(100, pet.mood + 2),
  }));

  nextState = {
    ...nextState,
    coins: nextState.coins + 8,
    farmPlots: nextPlots,
  };

  return {
    nextState,
    ok: true,
    notice: '已幫忙固定好被風吹歪的作物！獲得 +8 金幣、心情 +2',
  };
}

export function getSeasonalWeatherVisitorModifiers(
  state: GameState,
  now: number = Date.now()
): {
  yardMultiplier: Record<VisitorId, number>;
  townMultiplier: Partial<Record<TownVisitorId, number>>;
  spawnIntervalMultiplier: number;
  seasonActiveVisitorIds: TownVisitorId[];
} {
  const nowDate = new Date(now);
  const seasonId = state.seasonSystem?.currentSeason ?? getSeasonFromDate(nowDate);
  const condition = state.dialogue.weather.condition ?? 'clear';
  const period = getLocalTimePeriod(nowDate);
  const isNight = isNightTimePeriod(period);
  const yardTheme = state.seasonSystem?.yardThemeOverride ?? 'none';

  const yardMultiplier: Record<VisitorId, number> = {
    bird: 1,
    squirrel: 1,
    rabbit: 1,
  };
  const townMultiplier: Partial<Record<TownVisitorId, number>> = {};

  if (condition === 'clear') {
    yardMultiplier.bird *= 1.35;
    townMultiplier.bird = (townMultiplier.bird ?? 1) * 1.35;
    townMultiplier.butterfly = (townMultiplier.butterfly ?? 1) * 1.35;
  } else if (condition === 'rain') {
    townMultiplier.duck = (townMultiplier.duck ?? 1) * 1.45;
    townMultiplier.frog = (townMultiplier.frog ?? 1) * 1.5;
    if (seasonId === 'spring') {
      townMultiplier.butterfly = (townMultiplier.butterfly ?? 1) * 1.35;
    }
  } else if (condition === 'snow') {
    yardMultiplier.bird *= 1.25;
    yardMultiplier.rabbit *= 1.25;
    townMultiplier.bird = (townMultiplier.bird ?? 1) * 1.25;
    townMultiplier.rabbit = (townMultiplier.rabbit ?? 1) * 1.25;
    townMultiplier.snow_fox = (townMultiplier.snow_fox ?? 1) * 1.65;
    townMultiplier.arctic_bunny = (townMultiplier.arctic_bunny ?? 1) * 1.6;
  } else if (condition === 'hot') {
    townMultiplier.duck = (townMultiplier.duck ?? 1) * 1.35;
    townMultiplier.butterfly = (townMultiplier.butterfly ?? 1) * 1.35;
  } else if (condition === 'windy') {
    yardMultiplier.bird *= 1.3;
    yardMultiplier.squirrel *= 1.3;
    townMultiplier.bird = (townMultiplier.bird ?? 1) * 1.3;
    townMultiplier.squirrel = (townMultiplier.squirrel ?? 1) * 1.3;
  }

  const seasonActiveVisitorIds: TownVisitorId[] = [];
  if (seasonId === 'spring') {
    seasonActiveVisitorIds.push('butterfly', 'sakura_sprite');
    townMultiplier.sakura_sprite = (townMultiplier.sakura_sprite ?? 1) * 1.3;
  } else if (seasonId === 'summer') {
    seasonActiveVisitorIds.push('butterfly', 'firefly');
    if (isNight) {
      townMultiplier.firefly = (townMultiplier.firefly ?? 1) * 1.85;
    }
  } else if (seasonId === 'autumn') {
    seasonActiveVisitorIds.push('hedgehog');
    townMultiplier.hedgehog = (townMultiplier.hedgehog ?? 1) * 1.35;
  } else if (seasonId === 'winter') {
    seasonActiveVisitorIds.push('snow_fox', 'arctic_bunny');
    townMultiplier.snow_fox = (townMultiplier.snow_fox ?? 1) * 1.3;
    townMultiplier.arctic_bunny = (townMultiplier.arctic_bunny ?? 1) * 1.25;
  }

  if (yardTheme === 'spring') {
    townMultiplier.sakura_sprite = (townMultiplier.sakura_sprite ?? 1) * 1.15;
  } else if (yardTheme === 'autumn') {
    townMultiplier.hedgehog = (townMultiplier.hedgehog ?? 1) * 1.15;
  } else if (yardTheme === 'winter') {
    townMultiplier.snow_fox = (townMultiplier.snow_fox ?? 1) * 1.15;
    townMultiplier.arctic_bunny = (townMultiplier.arctic_bunny ?? 1) * 1.15;
  }

  const spawnIntervalMultiplier =
    condition === 'storm'
      ? 1.35
      : condition === 'clear' || condition === 'rain'
      ? 0.95
      : 1;

  return {
    yardMultiplier,
    townMultiplier,
    spawnIntervalMultiplier,
    seasonActiveVisitorIds,
  };
}

export function unlockWinterSnowPhotoBonus(state: GameState): {
  nextState: GameState;
  newlyUnlockedLabels: string[];
} {
  if (state.dialogue.weather.condition !== 'snow') {
    return { nextState: state, newlyUnlockedLabels: [] };
  }

  const studio = getPhotoStudioState(state);
  const bgs = new Set<PhotoBackground>(studio.unlockedBackgrounds);
  const filters = new Set<PhotoFilter>(studio.unlockedFilters);
  const frames = new Set<PhotoFrame>(studio.unlockedFrames);
  const newlyUnlockedLabels: string[] = [];

  if (!bgs.has('snow_cabin')) {
    bgs.add('snow_cabin');
    newlyUnlockedLabels.push(PHOTO_BACKGROUND_BY_ID.snow_cabin.label);
  }
  if (!filters.has('snow_white')) {
    filters.add('snow_white');
    newlyUnlockedLabels.push(PHOTO_FILTER_BY_ID.snow_white.label);
  }
  if (!frames.has('snowflake_frame')) {
    frames.add('snowflake_frame');
    newlyUnlockedLabels.push(PHOTO_FRAME_BY_ID.snowflake_frame.label);
  }

  if (newlyUnlockedLabels.length === 0) {
    return { nextState: state, newlyUnlockedLabels: [] };
  }

  return {
    nextState: {
      ...state,
      photoStudio: {
        ...studio,
        unlockedBackgrounds: Array.from(bgs),
        unlockedFilters: Array.from(filters),
        unlockedFrames: Array.from(frames),
      },
    },
    newlyUnlockedLabels,
  };
}

export function switchSeasonRoomTheme(
  state: GameState,
  themeId: SeasonRoomThemeId
): GameState {
  const base = state.seasonSystem ?? createInitialSeasonSystemState();
  return {
    ...state,
    seasonSystem: {
      ...base,
      roomThemeOverride: themeId,
    },
  };
}

export function switchSeasonYardTheme(
  state: GameState,
  themeId: SeasonYardThemeId
): GameState {
  const base = state.seasonSystem ?? createInitialSeasonSystemState();
  return {
    ...state,
    seasonSystem: {
      ...base,
      yardThemeOverride: themeId,
    },
  };
}

export function dismissSeasonNotice(state: GameState): GameState {
  if (!state.seasonSystem?.seasonNoticePending) return state;
  return {
    ...state,
    seasonSystem: {
      ...state.seasonSystem,
      seasonNoticePending: false,
    },
  };
}

export function dismissSeasonOfflineSummary(state: GameState): GameState {
  if (!state.seasonSystem?.offlineSummary) return state;
  return {
    ...state,
    seasonSystem: {
      ...state.seasonSystem,
      offlineSummary: null,
    },
  };
}

export function advanceWeatherTaskProgress(
  state: GameState,
  kind: WeatherTask['kind'],
  amount = 1
): GameState {
  const base = state.seasonSystem;
  if (!base || amount <= 0) return state;

  let changed = false;
  const nextTasks = base.weatherTasks.map((task) => {
    if (task.completed || task.kind !== kind) return task;
    changed = true;
    const progress = Math.min(task.target, task.progress + amount);
    return {
      ...task,
      progress,
      completed: progress >= task.target,
    };
  });

  if (!changed) return state;
  return {
    ...state,
    seasonSystem: {
      ...base,
      weatherTasks: nextTasks,
    },
  };
}

export function claimWeatherTask(
  state: GameState,
  taskId: string
): { nextState: GameState; ok: boolean; notice?: string; error?: string } {
  const base = state.seasonSystem ?? createInitialSeasonSystemState();
  const task = base.weatherTasks.find((t) => t.id === taskId);
  if (!task) {
    return { nextState: state, ok: false, error: '找不到這項天氣任務喔！' };
  }
  if (!task.completed) {
    return { nextState: state, ok: false, error: '還沒完成這個天氣小任務喔！' };
  }
  if (task.claimed) {
    return { nextState: state, ok: false, error: '這個天氣任務獎勵已經領過囉！' };
  }

  const studio = getPhotoStudioState(state);
  const unlockedTitles = new Set<TitleId>(state.encyclopedia.unlockedTitles);
  let titleNotice = '';
  if (!unlockedTitles.has('weather_watcher')) {
    unlockedTitles.add('weather_watcher');
    titleNotice = ` · 解鎖稱號「${getTitleDefinition('weather_watcher').name}」`;
  }

  const nextState: GameState = {
    ...state,
    coins: state.coins + task.rewardCoins,
    filterShards: (state.filterShards ?? 0) + (task.rewardFilterShards ?? 0),
    farmSpeedTickets: (state.farmSpeedTickets ?? 0) + (task.rewardSpeedTickets ?? 0),
    photoStudio: {
      ...studio,
      studioMaterials: studio.studioMaterials + (task.rewardStudioMaterials ?? 0),
    },
    encyclopedia: {
      ...state.encyclopedia,
      unlockedTitles: Array.from(unlockedTitles),
      activeTitle: state.encyclopedia.activeTitle ?? 'weather_watcher',
    },
    seasonSystem: {
      ...base,
      weatherTasks: base.weatherTasks.map((t) =>
        t.id === taskId ? { ...t, claimed: true } : t
      ),
    },
  };

  return {
    nextState,
    ok: true,
    notice: `領取天氣任務「${task.title}」：${task.rewardSummary}${titleNotice}`,
  };
}

export function advanceSakuraEventTask(
  state: GameState,
  kind: SeasonEventTask['kind'],
  amount = 1
): GameState {
  const base = state.seasonSystem;
  if (!base || base.seasonEvent.status !== 'active' || amount <= 0) {
    return state;
  }

  let changed = false;
  const nextTasks = base.seasonEvent.dailyTasks.map((task) => {
    if (task.completed || task.kind !== kind) return task;
    changed = true;
    const progress = Math.min(task.target, task.progress + amount);
    return {
      ...task,
      progress,
      completed: progress >= task.target,
    };
  });

  if (!changed) return state;
  return {
    ...state,
    seasonSystem: {
      ...base,
      seasonEvent: {
        ...base.seasonEvent,
        dailyTasks: nextTasks,
      },
    },
  };
}

export function claimSakuraEventTask(
  state: GameState,
  taskId: string
): { nextState: GameState; ok: boolean; notice?: string; error?: string } {
  const base = state.seasonSystem ?? createInitialSeasonSystemState();
  const event = base.seasonEvent;
  if (event.status !== 'active') {
    return { nextState: state, ok: false, error: '本次櫻花野餐祭活動已經結束囉！' };
  }
  const task = event.dailyTasks.find((t) => t.id === taskId);
  if (!task) {
    return { nextState: state, ok: false, error: '找不到這項活動任務！' };
  }
  if (!task.completed) {
    return { nextState: state, ok: false, error: '任務進度尚未完成喔！' };
  }
  if (task.claimed) {
    return { nextState: state, ok: false, error: '這個活動任務已經領獎囉！' };
  }

  return {
    nextState: {
      ...state,
      coins: state.coins + task.rewardCoins,
      seasonSystem: {
        ...base,
        seasonEvent: {
          ...event,
          ticketBalance: event.ticketBalance + task.rewardTickets,
          ticketTotalEarned: event.ticketTotalEarned + task.rewardTickets,
          dailyTasks: event.dailyTasks.map((t) =>
            t.id === taskId ? { ...t, claimed: true } : t
          ),
        },
      },
    },
    ok: true,
    notice: `完成「${task.title}」：+${task.rewardTickets} 櫻花券、+${task.rewardCoins} 金幣！`,
  };
}

export function isSakuraShopItemOwned(
  state: GameState,
  item: SeasonEventShopItem
): boolean {
  const base = state.seasonSystem;
  if (base?.seasonEvent.purchasedShopItemIds.includes(item.id)) return true;
  const studio = getPhotoStudioState(state);
  if (item.category === 'accessory') return state.accessories.includes(item.targetId);
  if (item.category === 'background') {
    return studio.unlockedBackgrounds.includes(item.targetId as PhotoBackground);
  }
  if (item.category === 'filter') {
    return studio.unlockedFilters.includes(item.targetId as PhotoFilter);
  }
  if (item.category === 'frame') {
    return studio.unlockedFrames.includes(item.targetId as PhotoFrame);
  }
  if (item.category === 'title') {
    return state.encyclopedia.unlockedTitles.includes(item.targetId as TitleId);
  }
  return false;
}

export function buySakuraShopItem(
  state: GameState,
  shopItemId: string
): { nextState: GameState; ok: boolean; notice?: string; error?: string } {
  const base = state.seasonSystem ?? createInitialSeasonSystemState();
  const event = base.seasonEvent;
  const item = SAKURA_PICNIC_SHOP_ITEMS.find((i) => i.id === shopItemId);
  if (!item) {
    return { nextState: state, ok: false, error: '找不到這個活動商店道具' };
  }
  if (isSakuraShopItemOwned(state, item)) {
    return { nextState: state, ok: false, error: `你已經擁有「${item.name}」囉！` };
  }
  if (event.ticketBalance < item.ticketPrice) {
    return {
      nextState: state,
      ok: false,
      error: `櫻花券不足（需要 ${item.ticketPrice} 張，目前 ${event.ticketBalance} 張）`,
    };
  }

  const studio = getPhotoStudioState(state);
  const nextAccessories = [...state.accessories];
  const nextUnlockedBgs = [...studio.unlockedBackgrounds];
  const nextUnlockedFilters = [...studio.unlockedFilters];
  const nextUnlockedFrames = [...studio.unlockedFrames];
  const nextUnlockedTitles = [...state.encyclopedia.unlockedTitles];
  let nextActiveTitle = state.encyclopedia.activeTitle;

  if (item.category === 'accessory' && !nextAccessories.includes(item.targetId)) {
    nextAccessories.push(item.targetId);
  } else if (
    item.category === 'background' &&
    !nextUnlockedBgs.includes(item.targetId as PhotoBackground)
  ) {
    nextUnlockedBgs.push(item.targetId as PhotoBackground);
  } else if (
    item.category === 'filter' &&
    !nextUnlockedFilters.includes(item.targetId as PhotoFilter)
  ) {
    nextUnlockedFilters.push(item.targetId as PhotoFilter);
  } else if (
    item.category === 'frame' &&
    !nextUnlockedFrames.includes(item.targetId as PhotoFrame)
  ) {
    nextUnlockedFrames.push(item.targetId as PhotoFrame);
  } else if (
    item.category === 'title' &&
    !nextUnlockedTitles.includes(item.targetId as TitleId)
  ) {
    nextUnlockedTitles.push(item.targetId as TitleId);
    if (!nextActiveTitle) {
      nextActiveTitle = item.targetId as TitleId;
    }
  }

  const extraAccName =
    item.category === 'accessory' ? getAccessoryById(item.targetId)?.name : undefined;

  return {
    nextState: {
      ...state,
      accessories: nextAccessories,
      photoStudio: {
        ...studio,
        unlockedBackgrounds: nextUnlockedBgs,
        unlockedFilters: nextUnlockedFilters,
        unlockedFrames: nextUnlockedFrames,
      },
      encyclopedia: {
        ...state.encyclopedia,
        unlockedTitles: nextUnlockedTitles,
        activeTitle: nextActiveTitle,
      },
      seasonSystem: {
        ...base,
        seasonEvent: {
          ...event,
          ticketBalance: event.ticketBalance - item.ticketPrice,
          purchasedShopItemIds: [...event.purchasedShopItemIds, item.id],
        },
      },
    },
    ok: true,
    notice: `成功用 ${item.ticketPrice} 張櫻花券兌換「${extraAccName ?? item.name}」！`,
  };
}

export function advanceSakuraCoopStep(
  state: GameState,
  step: 'food' | 'photo',
  userId: string
): GameState {
  const base = state.seasonSystem;
  if (!base || base.seasonEvent.status !== 'active' || !base.seasonEvent.coopTask) {
    return state;
  }
  const coopTask = base.seasonEvent.coopTask;
  const actorId = userId || 'local';
  const nextFood =
    step === 'food'
      ? Math.min(coopTask.picnicFoodTarget, coopTask.picnicFoodCount + 1)
      : coopTask.picnicFoodCount;
  const nextPhoto =
    step === 'photo'
      ? Math.min(coopTask.photoTarget, coopTask.photoCount + 1)
      : coopTask.photoCount;
  if (nextFood === coopTask.picnicFoodCount && nextPhoto === coopTask.photoCount) {
    return state;
  }
  const completed =
    nextFood >= coopTask.picnicFoodTarget && nextPhoto >= coopTask.photoTarget;

  return {
    ...state,
    seasonSystem: {
      ...base,
      seasonEvent: {
        ...base.seasonEvent,
        coopTask: {
          ...coopTask,
          picnicFoodCount: nextFood,
          photoCount: nextPhoto,
          contributorUserIds: Array.from(
            new Set([...coopTask.contributorUserIds, actorId])
          ),
          completed,
        },
      },
    },
  };
}

export function claimSakuraCoopReward(
  state: GameState,
  userId: string
): { nextState: GameState; ok: boolean; notice?: string; error?: string } {
  const base = state.seasonSystem ?? createInitialSeasonSystemState();
  const coopTask = base.seasonEvent.coopTask;
  const actorId = userId || 'local';
  if (!coopTask) {
    return { nextState: state, ok: false, error: '目前沒有共養野餐任務！' };
  }
  if (!coopTask.completed) {
    return {
      nextState: state,
      ok: false,
      error: '還沒達成野餐食物與合照目標喔！',
    };
  }
  if (coopTask.claimedByUserIds.includes(actorId)) {
    return { nextState: state, ok: false, error: '今天已經領過共養櫻花野餐獎勵囉！' };
  }

  return {
    nextState: {
      ...state,
      coins: state.coins + coopTask.rewardCoins,
      seasonSystem: {
        ...base,
        seasonEvent: {
          ...base.seasonEvent,
          ticketBalance: base.seasonEvent.ticketBalance + coopTask.rewardTickets,
          ticketTotalEarned:
            base.seasonEvent.ticketTotalEarned + coopTask.rewardTickets,
          coopTask: {
            ...coopTask,
            claimedByUserIds: [...coopTask.claimedByUserIds, actorId],
          },
        },
      },
    },
    ok: true,
    notice: `領取櫻花共養野餐獎勵：+${coopTask.rewardTickets} 櫻花券、+${coopTask.rewardCoins} 金幣！`,
  };
}

export function mergeSeasonSystemRemoteState(
  local: SeasonSystemState | undefined,
  remote: SeasonSystemState | undefined
): SeasonSystemState | undefined {
  if (!local) return remote;
  if (!remote) return local;

  const localCoop = local.seasonEvent.coopTask;
  const remoteCoop = remote.seasonEvent.coopTask;
  const mergedCoop =
    localCoop && remoteCoop && localCoop.id === remoteCoop.id
      ? {
          ...localCoop,
          picnicFoodCount: Math.max(
            localCoop.picnicFoodCount,
            remoteCoop.picnicFoodCount
          ),
          photoCount: Math.max(localCoop.photoCount, remoteCoop.photoCount),
          contributorUserIds: Array.from(
            new Set([
              ...localCoop.contributorUserIds,
              ...remoteCoop.contributorUserIds,
            ])
          ),
          completed: localCoop.completed || remoteCoop.completed,
          claimedByUserIds: Array.from(
            new Set([
              ...localCoop.claimedByUserIds,
              ...remoteCoop.claimedByUserIds,
            ])
          ),
        }
      : localCoop ?? remoteCoop;

  return {
    ...local,
    seasonEvent: {
      ...local.seasonEvent,
      coopTask: mergedCoop,
      purchasedShopItemIds: Array.from(
        new Set([
          ...local.seasonEvent.purchasedShopItemIds,
          ...remote.seasonEvent.purchasedShopItemIds,
        ])
      ),
    },
  };
}
