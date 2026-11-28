import { INITIAL_UNLOCKED_ACCESSORIES } from '../data/accessories';
import { COLLECTION_BADGES, COLLECTION_CHAIN_SETS } from '../data/collection';
import { TITLE_DEFINITIONS } from '../data/encyclopedia';
import { INITIAL_FOOD_INVENTORY } from '../data/foods';
import { syncCollectionProgress } from './collection';
import { getGrowthStage } from '../data/growth';
import {
  FARM_DECORATION_BY_ID,
  FLOORING_BY_ID,
  ROOM_GRID_COLS,
  ROOM_GRID_ROWS,
  ROOM_ITEM_BY_ID,
  SHARED_GOAL_BY_ID,
  WALLPAPER_BY_ID,
  getZoneForCell,
} from '../data/house';
import {
  INGREDIENT_IDS,
  INGREDIENTS,
  KITCHEN_RECIPES,
  createInitialFarmPlots,
  createInitialIngredients,
} from '../data/kitchen';
import {
  DAILY_TASK_TEMPLATES,
  createDailyTasksForDate,
  createInitialDailyTasks,
} from '../data/quests';
import { isValidStickerId } from '../data/stickers';
import { PERSONALITY_IDS, PET_PREFERENCES } from '../data/personality';
import { COOP_BADGES, COOP_FARM_DAILY_ORDERS } from '../data/coop';
import { WEATHER_META } from '../data/dialogue';
import {
  MILESTONE_DEFINITIONS,
  MEMORY_TYPE_META,
  SHARED_MEMORY_DEFINITIONS,
} from '../data/memories';
import {
  PHOTO_BACKGROUND_BY_ID,
  PHOTO_FILTER_BY_ID,
  PHOTO_FRAME_BY_ID,
  PHOTO_POSE_BY_ID,
  PHOTO_SCENE_BY_ID,
  PHOTO_STICKER_BY_ID,
  STUDIO_BADGES,
  WEEKLY_OUTFIT_THEMES,
} from '../data/photoStudio';
import {
  FAMILY_DAILY_TASK_TEMPLATES,
  RESERVED_SPECIAL_PETS,
} from '../data/pets';
import {
  VISITOR_AFFINITY_THRESHOLDS,
  VISITOR_BY_ID,
  VISITOR_DECOR_BY_ID,
  VISITOR_TREAT_BY_ID,
} from '../data/visitors';
import {
  ACTIVE_TOWN_LOCATION_IDS,
  COOP_TOWN_EXPLORE_TEMPLATES,
  LOCATION_DAILY_QUEST_TEMPLATES,
  TOWN_MARKET_FURNITURE_IDS,
  TOWN_SHOP_ITEM_BY_ID,
  TOWN_VISITOR_BY_ID,
  VISITOR_HUT_FACILITY_BY_ID,
} from '../data/town';
import {
  AccessorySlot,
  AccessoryTheme,
  ActiveTownLocationId,
  BirthdayCake,
  BirthdayCakeBase,
  BirthdayCakeCream,
  BirthdayCakeDecor,
  BirthdayCakeId,
  BirthdayCard,
  BirthdayConfig,
  BirthdayDecorationId,
  BirthdayGiftId,
  BirthdayOrder,
  BirthdaySystemState,
  BirthdayTask,
  CollectionBadgeId,
  CollectionOfflineSummary,
  CoopBadgeId,
  CoopBirthdaySession,
  CoopBirthdayTaskKey,
  CoopEventSession,
  CoopFarmOrderState,
  CoopGameType,
  CoopHubState,
  CoopMessageCard,
  CoopOfflineEvent,
  CoopReward,
  CoopRoomCandidate,
  CoopSession,
  CoopDuoChallengeSubmission,
  CoopDuoPhotoChallengeState,
  CoopTownExploreSession,
  CoopTownExploreTemplateId,
  CoopVisitorContribution,
  CoopVisitorRequirement,
  CoopVisitorSession,
  CropPlot,
  DailyTask,
  DailyWeatherForecastItem,
  DialogueCategory,
  DialogueLine,
  DialogueResponse,
  DialogueState,
  EncyclopediaState,
  EventMilestone,
  EventPhotoScoreBreakdown,
  EventTask,
  FamilyDailyTask,
  FarmDecorationId,
  FeedLog,
  FlooringId,
  FurnitureNote,
  GameMilestoneId,
  GameState,
  IngredientId,
  MemoryAlbumState,
  MemoryEntry,
  MemoryType,
  Milestone,
  MonthlyActivityTracker,
  MonthlyRecap,
  NoviceGrowthStats,
  PersonalityId,
  Pet,
  PetMemoryEvent,
  PetMemoryEventType,
  PetMessage,
  PetPersonality,
  PetSpecies,
  PetUnlockRuleType,
  PetViewDirection,
  PhotoBackground,
  PhotoComment,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScene,
  PhotoStickerId,
  PhotoStudioState,
  PlacedRoomItem,
  RoomPhotoPoseId,
  RoomPhotoRecord,
  SeasonEvent,
  SeasonEventCoopTask,
  SeasonEventId,
  SeasonEventTask,
  SeasonId,
  SeasonOfflineSummary,
  SeasonRoomThemeId,
  SeasonSystemState,
  SeasonYardThemeId,
  SeasonalEvent,
  StudioBadgeId,
  StudioScoreBreakdown,
  WeeklyOutfitChallengeThemeId,
  SharedGoalId,
  SharedHouse,
  SharedMemory,
  SharedMemoryKey,
  SharedMilestoneId,
  StageBackgroundId,
  ThemeSetId,
  TimePeriodId,
  TitleId,
  TownLocationProgressState,
  TownLocationQuest,
  TownLocationVisitorInstance,
  TownMapState,
  TownOrder,
  TownOrderCategory,
  TownOrderItemReq,
  TownOrderPhotoReq,
  TownVisitorAffinityRecord,
  TownVisitorId,
  TreasuryContribution,
  VisitorAffinity,
  VisitorBehavior,
  VisitorDecorId,
  VisitorHutFacilityId,
  VisitorId,
  VisitorSystemState,
  VisitorTreatId,
  VisitorVisit,
  WallpaperId,
  WeatherCondition,
  WeatherState,
  WeatherTask,
  WeightLog,
} from '../types';
import {
  MinigameBadgeId,
  MinigameHubState,
  MinigameId,
  MinigameWeeklyChallengeId,
} from '../types/minigame';
import { syncAllAccessoryProgress } from './accessories';
import {
  createDailyFarmOrder,
  createInitialCoopHubState,
  createZeroWarehouse,
  syncCoopHubState,
} from './coop';
import {
  createInitialDialogueState,
  createInitialWeatherState,
  getRandomProactiveCooldownMs,
  syncDialogueDaily,
} from './dialogue';
import { createInitialEncyclopediaState } from './encyclopedia';
import { createInitialSharedHouse, syncHouseProgress } from './house';
import {
  createInitialMemoryAlbumState,
  evaluateAndSyncMilestones,
  recordMemoryEntry,
} from './memories';
import {
  createInitialMinigameHubState,
  createZeroRecord,
  getLocalDateKey,
  getLocalWeekKey,
  isMinigameBadgeId,
  isMinigameId,
  isWeeklyChallengeId,
  syncMinigameHubState,
} from './minigame';
import {
  clearNoviceGrowthMirror,
  createInitialNoviceGrowthStats,
  saveNoviceGrowthMirror,
} from './noviceGrowth';
import { createInitialPetPersonality } from './personality';
import {
  createInitialFamilyDailyTasks,
  getActivePet,
  getDefaultWeightForSpecies,
  syncFamilyDailyTasks,
} from './pets';
import { createInitialTownOrders } from './townOrders';
import {
  FREE_STUDIO_BACKGROUNDS,
  FREE_STUDIO_FILTERS,
  FREE_STUDIO_FRAMES,
  FREE_STUDIO_POSES,
  createInitialPhotoStudioState,
  getLocalWeekKey as getStudioWeekKey,
  getWeeklyOutfitChallengeTheme,
  syncPhotoStudioState,
} from './photoStudio';
import {
  createDefaultAffinities,
  createInitialVisitorState,
  getAffinityLevelFromExp,
} from './visitors';
import {
  STRAWBERRY_DAILY_TASK_TEMPLATES,
  STRAWBERRY_SHOP_ITEMS,
  buildDailyEventTasksForDate,
  createInitialStrawberryMilestones,
} from '../data/events/strawberrySeason';
import {
  createDailyCoopEventSession,
  createInitialSeasonalEvent,
  syncSeasonalEventState,
} from './seasonalEvent';
import {
  createInitialTownMapState,
  getOrCreateCoopTownSession,
  getTownVisitorLevelForExp,
  syncTownMapState,
} from './townMap';
import {
  DEFAULT_CITY_ID,
  SAKURA_PICNIC_SHOP_ITEMS,
  SEASON_ROOM_THEME_BY_ID,
  SEASON_YARD_THEMES,
  WEATHER_CITY_BY_ID,
  buildDailyWeatherTasks,
  buildSakuraDailyTasks,
  createInitialSpringSakuraEvent,
} from '../data/seasons';
import {
  addDaysToDateKey,
  createInitialSeasonSystemState,
  getSeasonFromDate,
  syncSeasonSystemState,
} from './seasons';
import {
  BIRTHDAY_CAKE_BY_ID,
  BIRTHDAY_DECORATION_BY_ID,
  BIRTHDAY_GIFT_BY_ID,
  buildDailyBirthdayTasks,
  buildInitialCoopBirthdaySteps,
} from '../data/birthday';
import {
  buildDailyBirthdayOrders,
  clampBirthdayDay,
  createInitialBirthdaySystemState,
  syncBirthdaySystemState,
} from './birthday';

export const STORAGE_KEY = 'mengchong_canteen_save_v2';
const LEGACY_STORAGE_KEY = 'mengchong_canteen_save_v1';

export function formatLocalDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatLocalTime(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function roundWeight(val: number): number {
  return Math.round(val * 10) / 10;
}

export function clampWeight(val: number): number {
  return Math.min(30, Math.max(0.5, roundWeight(val)));
}

export function clampStat(val: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(val)));
}

export function createInitialPet(): Pet {
  return {
    id: 'pet_1',
    name: '布丁',
    species: 'pig',
    level: 1,
    growth: 0,
    intimacy: 10,
    hunger: 72,
    mood: 82,
    cleanliness: 88,
    energy: 85,
    weight: 8.5,
    roundness: 28,
    accessories: {
      head: 'pink_bow',
      face: null,
      neck: null,
      body: null,
      held: null,
      back: null,
    },
    hatched: false,
    consecutiveFastFood: 0,
    personality: createInitialPetPersonality('pig'),
    preference: PET_PREFERENCES.pig,
    ownerId: 'local',
    isSharedCoopPet: true,
    adoptedAt: Date.now(),
    source: 'starter',
  };
}

export function createInitialGameState(): GameState {
  const today = formatLocalDate();
  const initialPet = createInitialPet();
  return {
    version: 2,
    pets: [initialPet],
    activePetId: initialPet.id,
    coins: 120,
    furnitureShards: 0,
    foods: { ...INITIAL_FOOD_INVENTORY },
    ingredients: createInitialIngredients(),
    farmPlots: createInitialFarmPlots(4),
    yardMoodBuffPeriods: [],
    accessories: [...INITIAL_UNLOCKED_ACCESSORIES],
    weightLogs: [],
    feedLogs: [],
    dailyTasks: createInitialDailyTasks(today),
    dailyTasksDate: today,
    familyDailyTasks: createInitialFamilyDailyTasks(today),
    familyDailyTasksDate: today,
    claimedPetSlots: [1],
    completedTownOrdersCount: 0,
    reservedSpecialPets: [...RESERVED_SPECIAL_PETS],
    messages: [],
    soundEnabled: true,
    lastSavedAt: Date.now(),
    noviceGrowth: createInitialNoviceGrowthStats(today),
    encyclopedia: createInitialEncyclopediaState(),
    unlockedBackgrounds: ['default'],
    activeBackground: 'default',
    minigameHub: createInitialMinigameHubState(today),
    house: createInitialSharedHouse(),
    personality: initialPet.personality ?? createInitialPetPersonality('pig'),
    coop: createInitialCoopHubState(today),
    dialogue: createInitialDialogueState(today),
    memoryAlbum: createInitialMemoryAlbumState('布丁'),
    farmSpeedTickets: 1,
    filterShards: 0,
    visitorTreats: { seeds_mix: 2, fresh_lettuce: 1 },
    visitorState: createInitialVisitorState(),
    townOrders: createInitialTownOrders(today),
    photoStudio: createInitialPhotoStudioState(),
    seasonalEvent: createInitialSeasonalEvent(),
    townMap: createInitialTownMapState(),
    seasonSystem: createInitialSeasonSystemState(),
    birthdaySystem: createInitialBirthdaySystemState(),
  };
}

export function applyTimeDecay(pet: Pet, elapsedMs: number): Pet {
  if (elapsedMs <= 0) return pet;
  const elapsedMinutes = Math.min(elapsedMs / 60000, 720);
  const hungerLoss = elapsedMinutes * 0.14;
  const moodLoss = elapsedMinutes * 0.09;
  const cleanLoss = elapsedMinutes * 0.08;
  const energyLoss = elapsedMinutes * 0.1;

  return {
    ...pet,
    hunger: clampStat(pet.hunger - hungerLoss, 0, 100),
    mood: clampStat(pet.mood - moodLoss, 0, 100),
    cleanliness: clampStat(pet.cleanliness - cleanLoss, 0, 100),
    energy: clampStat(pet.energy - energyLoss, 0, 100),
  };
}

export function syncDailyTasks(
  tasks: DailyTask[],
  tasksDate: string
): { dailyTasks: DailyTask[]; dailyTasksDate: string } {
  const today = formatLocalDate();
  if (tasksDate === today && tasks.length > 0) {
    return { dailyTasks: tasks, dailyTasksDate: tasksDate };
  }
  return {
    dailyTasks: createDailyTasksForDate(today),
    dailyTasksDate: today,
  };
}

export function incrementTaskProgress(
  tasks: DailyTask[],
  taskId: string,
  amount = 1
): DailyTask[] {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    const nextProgress = Math.min(task.target, task.progress + amount);
    return {
      ...task,
      progress: nextProgress,
      completed: nextProgress >= task.target,
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asSpecies(value: unknown): PetSpecies {
  if (
    value === 'pig' ||
    value === 'rabbit' ||
    value === 'dog' ||
    value === 'cat' ||
    value === 'duck' ||
    value === 'hamster'
  ) {
    return value;
  }
  return 'pig';
}

function parseAccessoriesRecord(
  raw: unknown,
  fallback: Record<AccessorySlot, string | null>
): Record<AccessorySlot, string | null> {
  if (!isRecord(raw)) return { ...fallback };
  return {
    head: asNullableString(raw.head ?? raw['頭部']) ?? null,
    face: asNullableString(raw.face ?? raw['臉部']) ?? null,
    neck: asNullableString(raw.neck ?? raw['脖子']) ?? null,
    body: asNullableString(raw.body ?? raw['身體']) ?? null,
    held: asNullableString(raw.held ?? raw['手持']) ?? null,
    back: asNullableString(raw.back ?? raw['背部']) ?? null,
  };
}

function parseStringNumberRecord(
  raw: unknown,
  fallback: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = { ...fallback };
  if (!isRecord(raw)) return result;
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === 'number' && Number.isFinite(val)) {
      result[key] = val;
    }
  }
  return result;
}

function asIngredientId(value: unknown): IngredientId | null {
  if (
    value === 'carrot' ||
    value === 'corn' ||
    value === 'strawberry' ||
    value === 'pumpkin' ||
    value === 'blueberry' ||
    value === 'mint' ||
    value === 'sunflower' ||
    value === 'moon_wheat' ||
    value === 'dream_cocoa' ||
    value === 'watermelon' ||
    value === 'apple' ||
    value === 'mushroom' ||
    value === 'white_radish' ||
    value === 'winter_greens' ||
    value === 'snowberry'
  ) {
    return value;
  }
  return null;
}

function parseIngredients(
  raw: unknown,
  fallback: Record<IngredientId, number>
): Record<IngredientId, number> {
  const result: Record<IngredientId, number> = { ...fallback };
  if (!isRecord(raw)) return result;
  INGREDIENT_IDS.forEach((key) => {
    const val = raw[key];
    if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
      result[key] = Math.floor(val);
    }
  });
  return result;
}

function parseFarmPlots(raw: unknown, unlockedFarmPlots = 4): CropPlot[] {
  const safePlotCount = Math.min(8, Math.max(4, unlockedFarmPlots));
  const defaults = createInitialFarmPlots(safePlotCount);
  if (!Array.isArray(raw)) return defaults;

  const byId = new Map<number, Record<string, unknown>>();
  for (const item of raw) {
    if (isRecord(item) && typeof item.id === 'number' && Number.isInteger(item.id)) {
      byId.set(item.id, item);
    }
  }

  return defaults.map((template) => {
    const saved = byId.get(template.id);
    if (!saved) return template;
    const cropId = asIngredientId(saved.cropId);
    if (!cropId) return template;
    const defaultDuration = INGREDIENTS[cropId].growSeconds * 1000;
    const plantedAt =
      typeof saved.plantedAt === 'number' && Number.isFinite(saved.plantedAt)
        ? saved.plantedAt
        : Date.now();
    const durationMs =
      typeof saved.durationMs === 'number' && Number.isFinite(saved.durationMs) && saved.durationMs > 0
        ? saved.durationMs
        : defaultDuration;
    return {
      id: template.id,
      cropId,
      plantedAt,
      durationMs,
      watered: saved.watered === true,
      isGolden: saved.isGolden === true,
      windblown: saved.windblown === true,
      autoWateredByRainDate:
        typeof saved.autoWateredByRainDate === 'string' ? saved.autoWateredByRainDate : null,
    };
  });
}

function parseWeightLogs(raw: unknown): WeightLog[] {
  if (!Array.isArray(raw)) return [];
  const logs: WeightLog[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const id = asString(item.id, '');
    if (!id) continue;
    logs.push({
      id,
      petId: typeof item.petId === 'string' ? item.petId : undefined,
      date: asString(item.date ?? item.dateStr, formatLocalDate()),
      weight: asNumber(item.weight ?? item.weightAfter, 8.5),
      foodName: asString(item.foodName ?? item.sourceName, '紀錄'),
      note: asString(item.note, ''),
      weightDelta: asNumber(item.weightDelta, 0),
      timeStr: asString(item.timeStr, '00:00'),
      timestamp: asNumber(item.timestamp, Date.now()),
    });
  }
  return logs;
}

function parseFeedLogs(raw: unknown): FeedLog[] {
  if (!Array.isArray(raw)) return [];
  const logs: FeedLog[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const id = asString(item.id, '');
    if (!id) continue;
    logs.push({
      id,
      petId: typeof item.petId === 'string' ? item.petId : undefined,
      date: asString(item.date, formatLocalDate()),
      foodId: asString(item.foodId, ''),
      weightChange: asNumber(item.weightChange, 0),
    });
  }
  return logs;
}

function parsePetMessages(raw: unknown): PetMessage[] {
  if (!Array.isArray(raw)) return [];
  const messages: PetMessage[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const id = asString(item.id, '');
    if (!id) continue;
    const content = asString(item.content, '');
    const stickerId = isValidStickerId(item.stickerId) ? item.stickerId : null;
    if (!content && !stickerId) continue;
    messages.push({
      id,
      authorId: asString(item.authorId, 'local'),
      authorName: asString(item.authorName, '飼主'),
      authorTitleId: asTitleId(item.authorTitleId),
      content,
      stickerId,
      createdAt: asNumber(item.createdAt, Date.now()),
      targetPetId: typeof item.targetPetId === 'string' ? item.targetPetId : null,
      targetPetName: typeof item.targetPetName === 'string' ? item.targetPetName : null,
    });
  }
  return messages.slice(-80);
}

function parseDailyTasks(raw: unknown, tasksDate?: string): DailyTask[] {
  const fallbackTasks = createDailyTasksForDate(tasksDate || formatLocalDate());
  if (!Array.isArray(raw) || raw.length === 0) return fallbackTasks;
  const templateById = new Map(DAILY_TASK_TEMPLATES.map((t) => [t.id, t]));
  const parsed: DailyTask[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!isRecord(item) || typeof item.id !== 'string' || seen.has(item.id)) continue;
    const template = templateById.get(item.id);
    if (!template) continue;
    seen.add(item.id);
    const progress = Math.min(template.target, Math.max(0, asNumber(item.progress, 0)));
    parsed.push({
      ...template,
      reward: { ...template.reward },
      progress,
      completed: typeof item.completed === 'boolean' ? item.completed : progress >= template.target,
      claimed: typeof item.claimed === 'boolean' ? item.claimed : false,
    });
  }
  return parsed.length > 0 ? parsed : fallbackTasks;
}

function parseNoviceGrowth(
  raw: unknown,
  fallbackDate: string,
  seedFeedCount: number,
  seedWeightCount: number,
  seedUnlockedAccessoriesCount: number,
  seedClaimedDailyCount: number
): NoviceGrowthStats {
  const defaults = createInitialNoviceGrowthStats(fallbackDate);
  if (!isRecord(raw)) {
    return {
      ...defaults,
      feedCount: seedFeedCount,
      weightRecordCount: seedWeightCount,
      boughtAccessoryCount: Math.max(0, seedUnlockedAccessoriesCount - 4),
      completedDailyTasksCount: seedClaimedDailyCount,
    };
  }
  const claimedDays = Array.isArray(raw.claimedDays)
    ? Array.from(
        new Set(
          raw.claimedDays.filter(
            (d): d is number => typeof d === 'number' && Number.isInteger(d) && d >= 1 && d <= 7
          )
        )
      ).sort((a, b) => a - b)
    : [];

  return {
    startedDate: asString(raw.startedDate, fallbackDate),
    claimedDays,
    lastClaimDate: typeof raw.lastClaimDate === 'string' ? raw.lastClaimDate : null,
    feedCount: Math.max(seedFeedCount, Math.floor(asNumber(raw.feedCount, 0))),
    petCount: Math.max(0, Math.floor(asNumber(raw.petCount, 0))),
    plantedCarrotCount: Math.max(0, Math.floor(asNumber(raw.plantedCarrotCount, 0))),
    minigameCount: Math.max(0, Math.floor(asNumber(raw.minigameCount, 0))),
    cookedCount: Math.max(0, Math.floor(asNumber(raw.cookedCount, 0))),
    weightRecordCount: Math.max(seedWeightCount, Math.floor(asNumber(raw.weightRecordCount, 0))),
    boughtAccessoryCount: Math.max(
      Math.max(0, seedUnlockedAccessoriesCount - 4),
      Math.floor(asNumber(raw.boughtAccessoryCount, 0))
    ),
    walkCount: Math.max(0, Math.floor(asNumber(raw.walkCount, 0))),
    fedFavoriteCount: Math.max(0, Math.floor(asNumber(raw.fedFavoriteCount, 0))),
    completedDailyTasksCount: Math.max(
      seedClaimedDailyCount,
      Math.floor(asNumber(raw.completedDailyTasksCount, 0))
    ),
    createdSharedRoom: typeof raw.createdSharedRoom === 'boolean' ? raw.createdSharedRoom : false,
  };
}

function asTitleId(value: unknown): TitleId | null {
  if (typeof value === 'string' && value in TITLE_DEFINITIONS) {
    return value as TitleId;
  }
  return null;
}

function asAccessoryTheme(value: unknown): AccessoryTheme | null {
  if (
    value === 'strawberry_sweet' ||
    value === 'forest_camp' ||
    value === 'cloud_nap' ||
    value === 'chef_master' ||
    value === 'starry_explorer' ||
    value === 'festival_party'
  ) {
    return value;
  }
  return null;
}

function parseEncyclopedia(
  raw: unknown,
  seedFoodIds: string[],
  cookedCount = 0
): EncyclopediaState {
  const defaults = createInitialEncyclopediaState(seedFoodIds);
  if (!isRecord(raw)) return defaults;

  const rawFoods = Array.isArray(raw.collectedFoodIds)
    ? raw.collectedFoodIds.filter((x): x is string => typeof x === 'string')
    : [];
  const mergedFoods = Array.from(new Set([...defaults.collectedFoodIds, ...rawFoods]));

  const validRecipeIds = new Set(KITCHEN_RECIPES.map((r) => r.id));
  const learnedRecipeIds = Array.isArray(raw.learnedRecipeIds)
    ? Array.from(
        new Set(
          raw.learnedRecipeIds.filter(
            (x): x is string => typeof x === 'string' && validRecipeIds.has(x)
          )
        )
      )
    : cookedCount > 0
    ? KITCHEN_RECIPES.filter((r) => mergedFoods.includes(r.outputFoodId)).map((r) => r.id)
    : [];

  const claimedAccessoryMilestones = Array.isArray(raw.claimedAccessoryMilestones)
    ? Array.from(
        new Set(
          raw.claimedAccessoryMilestones.filter(
            (n): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 5
          )
        )
      ).sort((a, b) => a - b)
    : [];

  const claimedAccessoryThemeSets = Array.isArray(raw.claimedAccessoryThemeSets)
    ? Array.from(
        new Set(
          raw.claimedAccessoryThemeSets
            .map(asAccessoryTheme)
            .filter((t): t is AccessoryTheme => t !== null)
        )
      )
    : [];

  const unlockedTitles = Array.isArray(raw.unlockedTitles)
    ? Array.from(
        new Set(raw.unlockedTitles.map(asTitleId).filter((t): t is TitleId => t !== null))
      )
    : [];

  const candidateActive = asTitleId(raw.activeTitle);
  const activeTitle =
    candidateActive && unlockedTitles.includes(candidateActive)
      ? candidateActive
      : unlockedTitles[0] ?? null;

  const claimedRecipeMilestones = Array.isArray(raw.claimedRecipeMilestones)
    ? Array.from(
        new Set(
          raw.claimedRecipeMilestones.filter(
            (n): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 4
          )
        )
      ).sort((a, b) => a - b)
    : [];

  const accessoryWearCounts: Record<string, number> = {};
  if (isRecord(raw.accessoryWearCounts)) {
    for (const [accId, countVal] of Object.entries(raw.accessoryWearCounts)) {
      if (typeof countVal === 'number' && Number.isFinite(countVal) && countVal > 0) {
        accessoryWearCounts[accId] = Math.floor(countVal);
      }
    }
  }

  const claimedTotalMilestones = Array.isArray(raw.claimedTotalMilestones)
    ? Array.from(
        new Set(
          raw.claimedTotalMilestones.filter(
            (n): n is number =>
              typeof n === 'number' && Number.isInteger(n) && n >= 10 && n <= 100
          )
        )
      ).sort((a, b) => a - b)
    : [];

  const validCollectionBadgeIds = new Set(COLLECTION_BADGES.map((b) => b.id));
  const unlockedCollectionBadges = Array.isArray(raw.unlockedCollectionBadges)
    ? Array.from(
        new Set(
          raw.unlockedCollectionBadges.filter(
            (b): b is CollectionBadgeId =>
              typeof b === 'string' && validCollectionBadgeIds.has(b as CollectionBadgeId)
          )
        )
      )
    : [];

  const validChainSetIds = new Set(COLLECTION_CHAIN_SETS.map((s) => s.id));
  const unlockedChainSetIds = Array.isArray(raw.unlockedChainSetIds)
    ? Array.from(
        new Set(
          raw.unlockedChainSetIds.filter(
            (id): id is string => typeof id === 'string' && validChainSetIds.has(id)
          )
        )
      )
    : [];

  let collectionOfflineSummary: CollectionOfflineSummary | null = null;
  if (isRecord(raw.collectionOfflineSummary)) {
    const rawSum = raw.collectionOfflineSummary;
    const dateKey = typeof rawSum.dateKey === 'string' ? rawSum.dateKey : '';
    if (dateKey) {
      collectionOfflineSummary = {
        dateKey,
        totalCollected: Math.max(0, Math.floor(asNumber(rawSum.totalCollected, 0))),
        totalCount: Math.max(0, Math.floor(asNumber(rawSum.totalCount, 0))),
        totalPercent: Math.min(100, Math.max(0, Math.floor(asNumber(rawSum.totalPercent, 0)))),
        newItemsCount: Math.max(0, Math.floor(asNumber(rawSum.newItemsCount, 0))),
        unlockedMilestones: Array.isArray(rawSum.unlockedMilestones)
          ? rawSum.unlockedMilestones.filter(
              (n): n is number => typeof n === 'number' && Number.isInteger(n)
            )
          : [],
        unlockedTitleIds: Array.isArray(rawSum.unlockedTitleIds)
          ? rawSum.unlockedTitleIds
              .map(asTitleId)
              .filter((t): t is TitleId => t !== null)
          : [],
      };
    }
  }

  return {
    collectedFoodIds: mergedFoods,
    learnedRecipeIds,
    claimedRecipeMilestones,
    claimedAccessoryMilestones,
    claimedAccessoryThemeSets,
    unlockedTitles,
    activeTitle,
    accessoryWearCounts,
    claimedTotalMilestones,
    unlockedCollectionBadges,
    unlockedChainSetIds,
    collectionReminderEnabled:
      typeof raw.collectionReminderEnabled === 'boolean' ? raw.collectionReminderEnabled : true,
    lastCollectionReminderDate:
      typeof raw.lastCollectionReminderDate === 'string' ? raw.lastCollectionReminderDate : null,
    lastCollectionReminderDismissedDate:
      typeof raw.lastCollectionReminderDismissedDate === 'string'
        ? raw.lastCollectionReminderDismissedDate
        : null,
    collectionOfflineSummary,
  };
}

function asStageBackgroundId(value: unknown): StageBackgroundId {
  if (
    value === 'starlight_garden' ||
    value === 'strawberry_cafe' ||
    value === 'forest_camp_bg' ||
    value === 'cloud_dream_bg' ||
    value === 'chef_bistro_bg' ||
    value === 'starry_cosmos_bg' ||
    value === 'party_carnival_bg'
  ) {
    return value;
  }
  return 'default';
}

function parseMinigameRecord(raw: unknown): Record<MinigameId, number> {
  const base = createZeroRecord();
  if (!isRecord(raw)) return base;
  (Object.keys(base) as MinigameId[]).forEach((key) => {
    const val = raw[key];
    if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
      base[key] = Math.floor(val);
    }
  });
  return base;
}

function parseMinigameHub(raw: unknown): MinigameHubState {
  const todayStr = getLocalDateKey();
  const weekKey = getLocalWeekKey();
  const defaults = createInitialMinigameHubState(todayStr, weekKey);
  if (!isRecord(raw)) return defaults;

  const weeklyPlayedGameIds = Array.isArray(raw.weeklyPlayedGameIds)
    ? Array.from(new Set(raw.weeklyPlayedGameIds.filter(isMinigameId)))
    : [];

  const weeklyClaimedIds = Array.isArray(raw.weeklyClaimedIds)
    ? Array.from(new Set(raw.weeklyClaimedIds.filter(isWeeklyChallengeId)))
    : [];

  const unlockedBadges = Array.from(
    new Set(
      (Array.isArray(raw.unlockedBadges) ? raw.unlockedBadges : []).filter(
        (b): b is MinigameBadgeId => isMinigameBadgeId(b)
      )
    )
  );

  const parsed: MinigameHubState = {
    highScores: parseMinigameRecord(raw.highScores),
    playCounts: parseMinigameRecord(raw.playCounts),
    dailyDate: asString(raw.dailyDate, todayStr),
    dailyPlays: parseMinigameRecord(raw.dailyPlays),
    weekKey: asString(raw.weekKey, weekKey),
    weeklyPlayedGameIds,
    weeklyTotalScore: Math.max(0, Math.floor(asNumber(raw.weeklyTotalScore, 0))),
    weeklyRewardCount: Math.max(0, Math.floor(asNumber(raw.weeklyRewardCount, 0))),
    weeklyClaimedIds,
    unlockedBadges,
  };

  return syncMinigameHubState(parsed, todayStr, weekKey);
}

function parseStageBackgrounds(raw: unknown): StageBackgroundId[] {
  const result = new Set<StageBackgroundId>(['default']);
  if (Array.isArray(raw)) {
    for (const item of raw) {
      result.add(asStageBackgroundId(item));
    }
  }
  return Array.from(result);
}

function asWallpaperId(value: unknown): WallpaperId {
  if (typeof value === 'string' && value in WALLPAPER_BY_ID) {
    return value as WallpaperId;
  }
  return 'cream_warm';
}

function asFlooringId(value: unknown): FlooringId {
  if (typeof value === 'string' && value in FLOORING_BY_ID) {
    return value as FlooringId;
  }
  return 'oak_wood';
}

function asThemeSetId(value: unknown): ThemeSetId | null {
  if (value === 'strawberry_sweet' || value === 'forest_camp' || value === 'cloud_nap') {
    return value;
  }
  return null;
}

function asPhotoPoseId(value: unknown): RoomPhotoPoseId {
  if (
    value === 'normal' ||
    value === 'happy_jump' ||
    value === 'sleepy_cozy' ||
    value === 'berry_heart' ||
    value === 'camp_cheer' ||
    value === 'cloud_float'
  ) {
    return value;
  }
  return 'normal';
}

function asFarmDecorationId(value: unknown): FarmDecorationId | null {
  if (typeof value === 'string' && value in FARM_DECORATION_BY_ID) {
    return value as FarmDecorationId;
  }
  return null;
}

function asSharedGoalId(value: unknown): SharedGoalId {
  if (typeof value === 'string' && value in SHARED_GOAL_BY_ID) {
    return value as SharedGoalId;
  }
  return 'goal_cloud_bed';
}

function asSharedMilestoneId(value: unknown): SharedMilestoneId | null {
  if (
    value === 'first_furniture' ||
    value === 'four_zones_filled' ||
    value === 'theme_room_complete' ||
    value === 'farm_expanded' ||
    value === 'shared_goal_completed' ||
    value === 'first_room_photo'
  ) {
    return value;
  }
  return null;
}

function parsePlacedItems(raw: unknown): PlacedRoomItem[] {
  if (!Array.isArray(raw)) return [];
  const occupied = new Set<string>();
  const list: PlacedRoomItem[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const itemId = asString(item.itemId, '');
    if (!itemId || !(itemId in ROOM_ITEM_BY_ID)) continue;
    const x = Math.floor(asNumber(item.x, -1));
    const y = Math.floor(asNumber(item.y, -1));
    if (x < 0 || x >= ROOM_GRID_COLS || y < 0 || y >= ROOM_GRID_ROWS) continue;
    const cellKey = `${x}_${y}`;
    if (occupied.has(cellKey)) continue;
    occupied.add(cellKey);
    list.push({
      instanceId: asString(item.instanceId, `rm_${Date.now()}_${x}_${y}`),
      itemId,
      x,
      y,
      zone: getZoneForCell(x, y),
      placedBy: typeof item.placedBy === 'string' ? item.placedBy : undefined,
      updatedAt: asNumber(item.updatedAt, Date.now()),
    });
  }
  return list;
}

function parseSharedHouse(raw: unknown): SharedHouse {
  const defaults = createInitialSharedHouse();
  if (!isRecord(raw)) return defaults;

  const rawLayout = isRecord(raw.roomLayout) ? raw.roomLayout : {};
  const unlockedWallpapers = Array.from(
    new Set<WallpaperId>([
      'cream_warm',
      ...(Array.isArray(raw.unlockedWallpapers) ? raw.unlockedWallpapers.map(asWallpaperId) : []),
    ])
  );
  const unlockedFloorings = Array.from(
    new Set<FlooringId>([
      'oak_wood',
      ...(Array.isArray(raw.unlockedFloorings) ? raw.unlockedFloorings.map(asFlooringId) : []),
    ])
  );
  const reqWall = asWallpaperId(rawLayout.wallpaperId);
  const reqFloor = asFlooringId(rawLayout.flooringId);

  const ownedFurnitureCounts: Record<string, number> = {};
  if (isRecord(raw.ownedFurnitureCounts)) {
    for (const [k, v] of Object.entries(raw.ownedFurnitureCounts)) {
      if (k in ROOM_ITEM_BY_ID && typeof v === 'number' && Number.isFinite(v) && v > 0) {
        ownedFurnitureCounts[k] = Math.floor(v);
      }
    }
  }

  const placedItems = parsePlacedItems(rawLayout.placedItems);
  const collectedSet = new Set<string>(
    Array.isArray(raw.collectedFurnitureIds)
      ? raw.collectedFurnitureIds.filter((id): id is string => typeof id === 'string' && id in ROOM_ITEM_BY_ID)
      : []
  );
  Object.keys(ownedFurnitureCounts).forEach((id) => collectedSet.add(id));

  const claimedFurnitureMilestones = Array.isArray(raw.claimedFurnitureMilestones)
    ? Array.from(
        new Set(
          raw.claimedFurnitureMilestones.filter(
            (n): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 5
          )
        )
      ).sort((a, b) => a - b)
    : [];

  const completedThemeSets = Array.isArray(raw.completedThemeSets)
    ? Array.from(new Set(raw.completedThemeSets.map(asThemeSetId).filter((t): t is ThemeSetId => t !== null)))
    : [];

  const unlockedPhotoPoses = Array.from(
    new Set<RoomPhotoPoseId>([
      'normal',
      'happy_jump',
      'sleepy_cozy',
      ...(Array.isArray(raw.unlockedPhotoPoses) ? raw.unlockedPhotoPoses.map(asPhotoPoseId) : []),
    ])
  );

  const rawUpgrades = isRecord(raw.farmUpgrades) ? raw.farmUpgrades : {};
  const ownedFarmDecorations = Array.isArray(raw.ownedFarmDecorations)
    ? Array.from(
        new Set(
          raw.ownedFarmDecorations
            .map(asFarmDecorationId)
            .filter((d): d is FarmDecorationId => d !== null)
        )
      )
    : [];

  const rawActiveDecor = isRecord(raw.activeFarmDecor) ? raw.activeFarmDecor : {};
  const fenceId = asFarmDecorationId(rawActiveDecor.fenceId);
  const flowerbedId = asFarmDecorationId(rawActiveDecor.flowerbedId);
  const signId = asFarmDecorationId(rawActiveDecor.signId);

  const treasuryHistory: TreasuryContribution[] = Array.isArray(raw.treasuryHistory)
    ? raw.treasuryHistory
        .filter((h): h is Record<string, unknown> => isRecord(h))
        .map((h) => ({
          id: asString(h.id, `tr_${Date.now()}`),
          authorName: asString(h.authorName, '飼主'),
          amount: Math.max(0, Math.floor(asNumber(h.amount, 0))),
          createdAt: asNumber(h.createdAt, Date.now()),
        }))
        .slice(0, 20)
    : [];

  const completedGoalIds = Array.isArray(raw.completedGoalIds)
    ? Array.from(
        new Set(
          raw.completedGoalIds
            .map((g) => (typeof g === 'string' && g in SHARED_GOAL_BY_ID ? (g as SharedGoalId) : null))
            .filter((g): g is SharedGoalId => g !== null)
        )
      )
    : [];

  const furnitureNotes: FurnitureNote[] = Array.isArray(raw.furnitureNotes)
    ? raw.furnitureNotes
        .filter((n): n is Record<string, unknown> => isRecord(n))
        .map((n) => ({
          id: asString(n.id, `fn_${Date.now()}`),
          itemId: asString(n.itemId, ''),
          authorName: asString(n.authorName, '飼主'),
          content: asString(n.content, ''),
          createdAt: asNumber(n.createdAt, Date.now()),
        }))
        .filter((n) => n.itemId && n.content)
        .slice(0, 60)
    : [];

  const achievedMilestones = Array.isArray(raw.achievedMilestones)
    ? Array.from(
        new Set(
          raw.achievedMilestones
            .map(asSharedMilestoneId)
            .filter((m): m is SharedMilestoneId => m !== null)
        )
      )
    : [];

  const claimedMilestones = Array.isArray(raw.claimedMilestones)
    ? Array.from(
        new Set(
          raw.claimedMilestones
            .map(asSharedMilestoneId)
            .filter((m): m is SharedMilestoneId => m !== null)
        )
      )
    : [];

  const asWardrobePose = (v: unknown): PhotoPose | undefined => {
    if (typeof v === 'string' && v in PHOTO_POSE_BY_ID) {
      return v as PhotoPose;
    }
    return undefined;
  };
  const asPhotoBackground = (v: unknown): PhotoBackground | undefined => {
    if (typeof v === 'string' && v in PHOTO_BACKGROUND_BY_ID) {
      return v as PhotoBackground;
    }
    return undefined;
  };
  const asPetViewDirection = (v: unknown): PetViewDirection | undefined => {
    if (v === 'front' || v === 'left' || v === 'back' || v === 'right' || v === 'flipped') {
      return v;
    }
    return undefined;
  };
  const asPhotoFilter = (v: unknown): PhotoFilter | undefined => {
    if (typeof v === 'string' && v in PHOTO_FILTER_BY_ID) {
      return v as PhotoFilter;
    }
    return undefined;
  };
  const asPhotoFrame = (v: unknown): PhotoFrame | undefined => {
    if (typeof v === 'string' && v in PHOTO_FRAME_BY_ID) {
      return v as PhotoFrame;
    }
    return undefined;
  };
  const asPhotoScene = (v: unknown): PhotoScene | undefined => {
    if (typeof v === 'string' && v in PHOTO_SCENE_BY_ID) {
      return v as PhotoScene;
    }
    return undefined;
  };

  const photos: RoomPhotoRecord[] = Array.isArray(raw.photos)
    ? raw.photos
        .filter((p): p is Record<string, unknown> => isRecord(p))
        .map((p) => {
          const comments: PhotoComment[] | undefined = Array.isArray(p.comments)
            ? p.comments
                .filter((c): c is Record<string, unknown> => isRecord(c))
                .map((c) => ({
                  id: asString(c.id, `pcom_${Date.now()}`),
                  authorId: asString(c.authorId, 'local'),
                  authorName: asString(c.authorName, '飼主'),
                  content: asString(c.content, ''),
                  createdAt: asNumber(c.createdAt, Date.now()),
                }))
                .filter((c) => Boolean(c.content))
                .slice(-30)
            : undefined;
          const likes = Array.isArray(p.likes)
            ? Array.from(new Set(p.likes.filter((u): u is string => typeof u === 'string')))
            : undefined;
          const stickers = Array.isArray(p.stickers)
            ? Array.from(
                new Set(
                  p.stickers.filter(
                    (s): s is PhotoStickerId =>
                      typeof s === 'string' && s in PHOTO_STICKER_BY_ID
                  )
                )
              )
            : undefined;
          const kindRaw = p.photoKind;
          const photoKind: RoomPhotoRecord['photoKind'] =
            kindRaw === 'wardrobe' ||
            kindRaw === 'room' ||
            kindRaw === 'farm' ||
            kindRaw === 'album' ||
            kindRaw === 'visitor' ||
            kindRaw === 'town' ||
            kindRaw === 'birthday'
              ? kindRaw
              : undefined;
          const visitorId = asVisitorId(p.visitorId) ?? undefined;
          const townLocationId = asActiveTownLocationId(p.townLocationId) ?? undefined;
          const townVisitorId = asTownVisitorId(p.townVisitorId) ?? undefined;
          const duoPetRaw = isRecord(p.duoPet) ? p.duoPet : null;
          const duoPet: RoomPhotoRecord['duoPet'] = duoPetRaw
            ? {
                petId: typeof duoPetRaw.petId === 'string' ? duoPetRaw.petId : undefined,
                petName: asString(duoPetRaw.petName, '夥伴寶貝'),
                species: asSpecies(duoPetRaw.species),
                equipped: parseAccessoriesRecord(duoPetRaw.equipped, {
                  head: null,
                  face: null,
                  neck: null,
                  body: null,
                  held: null,
                  back: null,
                }),
                poseId: asWardrobePose(duoPetRaw.poseId),
                facing: asPetViewDirection(duoPetRaw.facing),
                weightAtCapture:
                  typeof duoPetRaw.weightAtCapture === 'number' &&
                  Number.isFinite(duoPetRaw.weightAtCapture)
                    ? duoPetRaw.weightAtCapture
                    : undefined,
              }
            : undefined;
          return {
            id: asString(p.id, `photo_${Date.now()}`),
            title: asString(p.title, '小屋合照'),
            caption: asString(p.caption, ''),
            createdAt: asNumber(p.createdAt, Date.now()),
            houseName: asString(p.houseName, '萌寵暖暖小屋'),
            petId: typeof p.petId === 'string' ? p.petId : undefined,
            species: asSpecies(p.species),
            petName: asString(p.petName, '布丁'),
            equipped: parseAccessoriesRecord(p.equipped, {
              head: null,
              face: null,
              neck: null,
              body: null,
              held: null,
              back: null,
            }),
            poseId: asPhotoPoseId(p.poseId),
            wallpaperId: asWallpaperId(p.wallpaperId),
            flooringId: asFlooringId(p.flooringId),
            placedItems: parsePlacedItems(p.placedItems),
            noteHighlight: typeof p.noteHighlight === 'string' ? p.noteHighlight : undefined,
            photoKind,
            visitorId,
            townLocationId,
            townVisitorId,
            isCoopPhoto: typeof p.isCoopPhoto === 'boolean' ? p.isCoopPhoto : undefined,
            scene: asPhotoScene(p.scene),
            wardrobePoseId: asWardrobePose(p.wardrobePoseId),
            backgroundId: asPhotoBackground(p.backgroundId),
            facing: asPetViewDirection(p.facing),
            filterId: asPhotoFilter(p.filterId),
            frameId: asPhotoFrame(p.frameId),
            stickers,
            weightAtCapture:
              typeof p.weightAtCapture === 'number' && Number.isFinite(p.weightAtCapture)
                ? p.weightAtCapture
                : undefined,
            duoPet,
            challengeScore:
              typeof p.challengeScore === 'number' && Number.isFinite(p.challengeScore)
                ? Math.max(0, Math.floor(p.challengeScore))
                : undefined,
            challengeWeekKey:
              typeof p.challengeWeekKey === 'string' ? p.challengeWeekKey : undefined,
            authorTitleId: asTitleId(p.authorTitleId),
            likes,
            comments,
          };
        })
        .slice(0, 48)
    : [];

  return {
    houseName: asString(raw.houseName, defaults.houseName).slice(0, 14) || defaults.houseName,
    roomLayout: {
      cols: ROOM_GRID_COLS,
      rows: ROOM_GRID_ROWS,
      wallpaperId: unlockedWallpapers.includes(reqWall) ? reqWall : 'cream_warm',
      flooringId: unlockedFloorings.includes(reqFloor) ? reqFloor : 'oak_wood',
      placedItems,
    },
    ownedFurnitureCounts,
    collectedFurnitureIds: Array.from(collectedSet),
    unlockedWallpapers,
    unlockedFloorings,
    claimedFurnitureMilestones,
    completedThemeSets,
    unlockedPhotoPoses,
    unlockedFarmPlots: Math.min(8, Math.max(4, Math.floor(asNumber(raw.unlockedFarmPlots, 4)))),
    farmUpgrades: {
      sprinklerLevel: Math.min(1, Math.max(0, Math.floor(asNumber(rawUpgrades.sprinklerLevel, 0)))),
      greenhouseLevel: Math.min(1, Math.max(0, Math.floor(asNumber(rawUpgrades.greenhouseLevel, 0)))),
      storageLevel: Math.min(3, Math.max(0, Math.floor(asNumber(rawUpgrades.storageLevel, 0)))),
    },
    ownedFarmDecorations,
    activeFarmDecor: {
      fenceId: fenceId && ownedFarmDecorations.includes(fenceId) ? fenceId : null,
      flowerbedId: flowerbedId && ownedFarmDecorations.includes(flowerbedId) ? flowerbedId : null,
      signId: signId && ownedFarmDecorations.includes(signId) ? signId : null,
    },
    treasuryCoins: Math.max(0, Math.floor(asNumber(raw.treasuryCoins, 0))),
    treasuryHistory,
    activeGoalId: asSharedGoalId(raw.activeGoalId),
    completedGoalIds,
    furnitureNotes,
    achievedMilestones,
    claimedMilestones,
    photos,
  };
}

function asPersonalityId(value: unknown): PersonalityId | null {
  if (typeof value === 'string' && PERSONALITY_IDS.includes(value as PersonalityId)) {
    return value as PersonalityId;
  }
  return null;
}

function parsePetPersonality(raw: unknown, species: PetSpecies): PetPersonality {
  const defaults = createInitialPetPersonality(species);
  if (!isRecord(raw)) return defaults;

  const scores: Record<PersonalityId, number> = { ...defaults.scores };
  if (isRecord(raw.scores)) {
    for (const id of PERSONALITY_IDS) {
      const val = raw.scores[id];
      if (typeof val === 'number' && Number.isFinite(val)) {
        scores[id] = clampStat(val, 0, 100);
      }
    }
  }

  const primary = asPersonalityId(raw.primary) ?? defaults.primary;
  let secondary = asPersonalityId(raw.secondary) ?? defaults.secondary;
  if (secondary === primary) {
    secondary = PERSONALITY_IDS.find((id) => id !== primary) ?? defaults.secondary;
  }

  const careActionCounts: Record<string, number> = {};
  if (isRecord(raw.careActionCounts)) {
    for (const [k, v] of Object.entries(raw.careActionCounts)) {
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
        careActionCounts[k] = Math.floor(v);
      }
    }
  }

  return {
    primary,
    secondary,
    scores,
    careActionCounts,
    lastUpdatedAt: asNumber(raw.lastUpdatedAt, defaults.lastUpdatedAt),
  };
}

function asCoopBadgeId(value: unknown): CoopBadgeId | null {
  if (typeof value === 'string' && value in COOP_BADGES) {
    return value as CoopBadgeId;
  }
  return null;
}

function asCoopGameType(value: unknown): CoopGameType {
  if (
    value === 'farm_relay' ||
    value === 'visitor_coop' ||
    value === 'event_coop' ||
    value === 'town_coop' ||
    value === 'birthday_coop'
  ) {
    return value;
  }
  return 'room_decor';
}

function asActiveTownLocationId(value: unknown): ActiveTownLocationId | null {
  if (typeof value === 'string' && ACTIVE_TOWN_LOCATION_IDS.includes(value as ActiveTownLocationId)) {
    return value as ActiveTownLocationId;
  }
  return null;
}

function asTownVisitorId(value: unknown): TownVisitorId | null {
  if (typeof value === 'string' && value in TOWN_VISITOR_BY_ID) {
    return value as TownVisitorId;
  }
  return null;
}

function asVisitorId(value: unknown): VisitorId | null {
  if (value === 'bird' || value === 'squirrel' || value === 'rabbit') {
    return value;
  }
  return null;
}

function asVisitorBehavior(value: unknown): VisitorBehavior {
  if (
    value === 'walking' ||
    value === 'sitting' ||
    value === 'smelling' ||
    value === 'looking_farm'
  ) {
    return value;
  }
  return 'walking';
}

function asVisitorDecorId(value: unknown): VisitorDecorId | null {
  if (typeof value === 'string' && value in VISITOR_DECOR_BY_ID) {
    return value as VisitorDecorId;
  }
  return null;
}

function parseCoopVisitorSession(raw: unknown): CoopVisitorSession | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id, '');
  const visitorId = asVisitorId(raw.visitorId);
  if (!id || !visitorId) return null;

  const requirements: CoopVisitorRequirement[] = Array.isArray(raw.requirements)
    ? raw.requirements
        .filter((r): r is Record<string, unknown> => isRecord(r))
        .map((r) => {
          const kind =
            r.kind === 'ingredient' || r.kind === 'food' || r.kind === 'treat'
              ? r.kind
              : 'ingredient';
          const requiredQty = Math.max(1, Math.floor(asNumber(r.requiredQty, 1)));
          const contributedQty = Math.min(
            requiredQty,
            Math.max(0, Math.floor(asNumber(r.contributedQty, 0)))
          );
          const itemId = asString(r.itemId, 'carrot');
          return {
            key: asString(r.key, `${kind}:${itemId}`),
            kind,
            itemId,
            label: asString(r.label, '點心'),
            emoji: asString(r.emoji, '🥕'),
            requiredQty,
            contributedQty,
          };
        })
    : [];

  const contributions: CoopVisitorContribution[] = Array.isArray(raw.contributions)
    ? raw.contributions
        .filter((c): c is Record<string, unknown> => isRecord(c))
        .map((c) => ({
          id: asString(c.id, `cvc_${Date.now()}`),
          userId: asString(c.userId, 'local'),
          userName: asString(c.userName, '夥伴'),
          itemKey: asString(c.itemKey, ''),
          itemLabel: asString(c.itemLabel, '點心'),
          qty: Math.max(1, Math.floor(asNumber(c.qty, 1))),
          createdAt: asNumber(c.createdAt, Date.now()),
        }))
        .slice(0, 20)
    : [];

  const rewardRareIngredients: Partial<Record<IngredientId, number>> = {};
  if (isRecord(raw.rewardRareIngredients)) {
    for (const ingId of INGREDIENT_IDS) {
      const val = raw.rewardRareIngredients[ingId];
      if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
        rewardRareIngredients[ingId] = Math.floor(val);
      }
    }
  }

  return {
    id,
    dateKey: asString(raw.dateKey, formatLocalDate()),
    visitorId,
    title: asString(raw.title, `${VISITOR_BY_ID[visitorId].name}的共養茶會`),
    description: asString(raw.description, ''),
    requirements,
    contributions,
    completed: typeof raw.completed === 'boolean' ? raw.completed : false,
    completedAt: typeof raw.completedAt === 'number' ? raw.completedAt : null,
    rewardCoins: Math.max(0, Math.floor(asNumber(raw.rewardCoins, 45))),
    rewardShards: Math.max(0, Math.floor(asNumber(raw.rewardShards, 3))),
    rewardTickets: Math.max(0, Math.floor(asNumber(raw.rewardTickets, 1))),
    rewardRareIngredients,
    claimedByUserIds: Array.isArray(raw.claimedByUserIds)
      ? raw.claimedByUserIds.filter((u): u is string => typeof u === 'string')
      : [],
    photoTaken: typeof raw.photoTaken === 'boolean' ? raw.photoTaken : false,
    sharedToBoard: typeof raw.sharedToBoard === 'boolean' ? raw.sharedToBoard : false,
  };
}

function parseCoopSession(raw: unknown): CoopSession | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id, '');
  if (!id) return null;

  const statusRaw = raw.status;
  const status: CoopSession['status'] =
    statusRaw === 'active' ||
    statusRaw === 'completed' ||
    statusRaw === 'expired'
      ? statusRaw
      : 'idle';

  const themeId = asThemeSetId(raw.themeId) ?? 'strawberry_sweet';
  const rawGoal = isRecord(raw.goal) ? raw.goal : {};
  const rawProgress = isRecord(raw.progress) ? raw.progress : {};

  const candidateQueue: CoopRoomCandidate[] = Array.isArray(raw.candidateQueue)
    ? raw.candidateQueue
        .filter((c): c is Record<string, unknown> => isRecord(c))
        .map((c) => ({
          queueId: asString(c.queueId, `q_${Date.now()}`),
          itemId: asString(c.itemId, ''),
          selectedByUserId: asString(c.selectedByUserId, 'local'),
          selectedByName: asString(c.selectedByName, '夥伴'),
          selectedAt: asNumber(c.selectedAt, Date.now()),
          placed: typeof c.placed === 'boolean' ? c.placed : false,
        }))
        .filter((c) => c.itemId in ROOM_ITEM_BY_ID)
    : [];

  const placedInstanceIds = Array.isArray(raw.placedInstanceIds)
    ? raw.placedInstanceIds.filter((x): x is string => typeof x === 'string')
    : [];

  return {
    id,
    gameType: 'room_decor',
    status,
    themeId,
    goal: {
      id: asString(rawGoal.id, `goal_${themeId}`),
      gameType: 'room_decor',
      title: asString(rawGoal.title, '合作房間佈置'),
      description: asString(rawGoal.description, ''),
      themeId,
      targetItemCount: Math.max(1, Math.floor(asNumber(rawGoal.targetItemCount, 6))),
    },
    progress: {
      completedCount: Math.max(0, Math.floor(asNumber(rawProgress.completedCount, 0))),
      targetCount: Math.max(1, Math.floor(asNumber(rawProgress.targetCount, 6))),
      harvestedCount: 0,
      harvestTarget: 0,
      craftedCount: 0,
      craftTarget: 0,
      foodsDone: {},
    },
    startedAt: asNumber(raw.startedAt, Date.now()),
    expiresAt: asNumber(raw.expiresAt, Date.now()),
    durationSeconds: Math.max(30, Math.floor(asNumber(raw.durationSeconds, 90))),
    candidateQueue,
    placedInstanceIds,
    settled: typeof raw.settled === 'boolean' ? raw.settled : false,
    rewardId: typeof raw.rewardId === 'string' ? raw.rewardId : null,
  };
}

function parseCoopFarmOrder(raw: unknown, todayStr: string): CoopFarmOrderState {
  const defaults = createDailyFarmOrder(todayStr);
  if (!isRecord(raw)) return defaults;

  const dateKey = asString(raw.dateKey, todayStr);
  if (dateKey !== todayStr) return defaults;

  const rawGoal = isRecord(raw.goal) ? raw.goal : {};
  const goalTemplate =
    COOP_FARM_DAILY_ORDERS.find((o) => o.id === rawGoal.id) ?? defaults.goal;
  const rawProgress = isRecord(raw.progress) ? raw.progress : {};

  const foodsDone: Record<string, number> = {};
  if (isRecord(rawProgress.foodsDone)) {
    for (const [k, v] of Object.entries(rawProgress.foodsDone)) {
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
        foodsDone[k] = Math.floor(v);
      }
    }
  }

  const craftTarget =
    defaults.progress.craftTarget ||
    Object.values(goalTemplate.requiredFoodCounts ?? {}).reduce((s, n) => s + n, 0);
  const harvestTarget = defaults.progress.harvestTarget;

  return {
    dateKey,
    goal: {
      ...goalTemplate,
      requiredHarvestTotal: harvestTarget,
      requiredCraftTotal: craftTarget,
    },
    progress: {
      completedCount: Math.max(0, Math.floor(asNumber(rawProgress.completedCount, 0))),
      targetCount: craftTarget,
      harvestedCount: Math.max(0, Math.floor(asNumber(rawProgress.harvestedCount, 0))),
      harvestTarget,
      craftedCount: Math.max(0, Math.floor(asNumber(rawProgress.craftedCount, 0))),
      craftTarget,
      foodsDone,
    },
    expiresAt: asNumber(raw.expiresAt, defaults.expiresAt),
    completed: typeof raw.completed === 'boolean' ? raw.completed : false,
    overdue: typeof raw.overdue === 'boolean' ? raw.overdue : false,
    rewardClaimed: typeof raw.rewardClaimed === 'boolean' ? raw.rewardClaimed : false,
    rewardId: typeof raw.rewardId === 'string' ? raw.rewardId : null,
  };
}

function parseCoopHubState(raw: unknown): CoopHubState {
  const todayStr = formatLocalDate();
  const defaults = createInitialCoopHubState(todayStr);
  if (!isRecord(raw)) return defaults;

  const pendingRewards: CoopReward[] = Array.isArray(raw.pendingRewards)
    ? raw.pendingRewards
        .filter((r): r is Record<string, unknown> => isRecord(r))
        .map((r) => {
          const rareIngredients: Partial<Record<IngredientId, number>> = {};
          if (isRecord(r.rareIngredients)) {
            for (const ingId of INGREDIENT_IDS) {
              const v = r.rareIngredients[ingId];
              if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
                rareIngredients[ingId] = Math.floor(v);
              }
            }
          }
          const badgeId = asCoopBadgeId(r.badgeId);
          return {
            id: asString(r.id, `rw_${Date.now()}`),
            gameType: asCoopGameType(r.gameType),
            title: asString(r.title, '合作遊戲獎勵'),
            coins: Math.max(0, Math.floor(asNumber(r.coins, 0))),
            furnitureShards: Math.max(0, Math.floor(asNumber(r.furnitureShards, 0))),
            intimacy: Math.max(0, Math.floor(asNumber(r.intimacy, 0))),
            rareIngredients,
            badgeId: badgeId ?? undefined,
            messageCardTitle:
              typeof r.messageCardTitle === 'string' ? r.messageCardTitle : undefined,
            messageCardBody:
              typeof r.messageCardBody === 'string' ? r.messageCardBody : undefined,
            claimedByUserIds: Array.isArray(r.claimedByUserIds)
              ? r.claimedByUserIds.filter((u): u is string => typeof u === 'string')
              : [],
            createdAt: asNumber(r.createdAt, Date.now()),
          };
        })
        .slice(0, 12)
    : [];

  const unlockedBadges = Array.isArray(raw.unlockedBadges)
    ? Array.from(
        new Set(
          raw.unlockedBadges
            .map(asCoopBadgeId)
            .filter((b): b is CoopBadgeId => b !== null)
        )
      )
    : [];

  const earnedCards: CoopMessageCard[] = Array.isArray(raw.earnedCards)
    ? raw.earnedCards
        .filter((c): c is Record<string, unknown> => isRecord(c))
        .map((c) => ({
          id: asString(c.id, `card_${Date.now()}`),
          title: asString(c.title, '合作紀念卡'),
          body: asString(c.body, ''),
          emoji: asString(c.emoji, '💌'),
          earnedDate: asString(c.earnedDate, todayStr),
          createdAt: asNumber(c.createdAt, Date.now()),
        }))
        .filter((c) => Boolean(c.body))
        .slice(0, 20)
    : [];

  const offlineEvents: CoopOfflineEvent[] = Array.isArray(raw.offlineEvents)
    ? raw.offlineEvents
        .filter((e): e is Record<string, unknown> => isRecord(e))
        .map((e) => ({
          id: asString(e.id, `coev_${Date.now()}`),
          actorUserId: asString(e.actorUserId, 'partner'),
          actorName: asString(e.actorName, '夥伴'),
          gameType: asCoopGameType(e.gameType),
          summary: asString(e.summary, ''),
          createdAt: asNumber(e.createdAt, Date.now()),
        }))
        .filter((e) => Boolean(e.summary))
        .slice(0, 20)
    : [];

  const lastSeenByUserId: Record<string, number> = {};
  if (isRecord(raw.lastSeenByUserId)) {
    for (const [k, v] of Object.entries(raw.lastSeenByUserId)) {
      if (typeof v === 'number' && Number.isFinite(v)) {
        lastSeenByUserId[k] = v;
      }
    }
  }

  const partnerShowcasePets: Pet[] = Array.isArray(raw.partnerShowcasePets)
    ? raw.partnerShowcasePets
        .filter((p): p is Record<string, unknown> => isRecord(p))
        .map((p, idx) =>
          parseSinglePet(p, asString(p.id, `partner_pet_${idx}`), 'pig', undefined, false)
        )
        .slice(0, 6)
    : [];

  const duoChallenge = parseCoopDuoChallenge(raw.duoChallenge);
  const coopEventSession = parseCoopEventSession(raw.coopEventSession, todayStr);
  const coopTownSession = parseCoopTownSession(raw.coopTownSession, todayStr);
  const coopBirthdaySession = parseCoopBirthdaySession(raw.coopBirthdaySession);

  return syncCoopHubState(
    {
      activeRoomSession: parseCoopSession(raw.activeRoomSession),
      dailyFarmOrder: parseCoopFarmOrder(raw.dailyFarmOrder, todayStr),
      sharedWarehouse: parseIngredients(raw.sharedWarehouse, createZeroWarehouse()),
      coopFarmPlots: parseFarmPlots(raw.coopFarmPlots, 4),
      pendingRewards,
      unlockedBadges,
      earnedCards,
      streakDays: Math.max(0, Math.floor(asNumber(raw.streakDays, 0))),
      lastCoopCompletedDate:
        typeof raw.lastCoopCompletedDate === 'string' ? raw.lastCoopCompletedDate : null,
      offlineEvents,
      lastSeenByUserId,
      coopVisitor: parseCoopVisitorSession(raw.coopVisitor),
      visitorStreakDays: Math.max(0, Math.floor(asNumber(raw.visitorStreakDays, 0))),
      lastVisitorCompletedDate:
        typeof raw.lastVisitorCompletedDate === 'string'
          ? raw.lastVisitorCompletedDate
          : null,
      partnerShowcasePets,
      duoChallenge,
      duoStreakWeeks: Math.max(0, Math.floor(asNumber(raw.duoStreakWeeks, 0))),
      lastDuoCompletedWeek:
        typeof raw.lastDuoCompletedWeek === 'string' ? raw.lastDuoCompletedWeek : null,
      coopEventSession,
      coopTownSession,
      townExploreStreakDays: Math.max(0, Math.floor(asNumber(raw.townExploreStreakDays, 0))),
      lastTownExploreCompletedDate:
        typeof raw.lastTownExploreCompletedDate === 'string'
          ? raw.lastTownExploreCompletedDate
          : null,
      coopBirthdaySession,
      birthdayStreak: Math.max(0, Math.floor(asNumber(raw.birthdayStreak, 0))),
      lastBirthdayCoopDateKey:
        typeof raw.lastBirthdayCoopDateKey === 'string'
          ? raw.lastBirthdayCoopDateKey
          : null,
    },
    todayStr
  );
}

function parseCoopBirthdaySession(raw: unknown): CoopBirthdaySession | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id, '');
  const petId = asString(raw.petId, '');
  if (!id || !petId) return null;
  const defaults = buildInitialCoopBirthdaySteps();
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];
  const steps = defaults.map((def) => {
    const found = rawSteps.find((s) => isRecord(s) && s.key === def.key);
    if (!isRecord(found)) return def;
    const progress = Math.min(def.target, Math.max(0, Math.floor(asNumber(found.progress, 0))));
    return {
      ...def,
      key: def.key as CoopBirthdayTaskKey,
      progress,
      contributorUserIds: Array.isArray(found.contributorUserIds)
        ? found.contributorUserIds.filter((u): u is string => typeof u === 'string')
        : [],
      contributorNames: Array.isArray(found.contributorNames)
        ? found.contributorNames.filter((n): n is string => typeof n === 'string')
        : [],
    };
  });
  const completed =
    raw.completed === true || steps.every((s) => s.progress >= s.target);
  return {
    id,
    petId,
    petName: asString(raw.petName, '布丁'),
    yearKey: asString(raw.yearKey, id.replace(/^cbday_/, '')),
    birthdayDateLabel: asString(raw.birthdayDateLabel, ''),
    steps,
    completed,
    completedAt: typeof raw.completedAt === 'number' ? raw.completedAt : null,
    claimedByUserIds: Array.isArray(raw.claimedByUserIds)
      ? raw.claimedByUserIds.filter((u): u is string => typeof u === 'string')
      : [],
    lastUpdatedByName:
      typeof raw.lastUpdatedByName === 'string' ? raw.lastUpdatedByName : null,
    lastUpdatedAt: typeof raw.lastUpdatedAt === 'number' ? raw.lastUpdatedAt : null,
  };
}

function parseCoopTownSession(
  raw: unknown,
  todayStr: string
): CoopTownExploreSession | null {
  if (!isRecord(raw)) return null;
  const dateKey = asString(raw.dateKey, todayStr);
  const templateId: CoopTownExploreTemplateId =
    raw.templateId === 'lake_fishing' ? 'lake_fishing' : 'forest_picnic';
  const tpl =
    COOP_TOWN_EXPLORE_TEMPLATES.find((t) => t.templateId === templateId) ??
    COOP_TOWN_EXPLORE_TEMPLATES[0];
  const fallback = getOrCreateCoopTownSession(dateKey);

  const rawSteps = Array.isArray(raw.steps)
    ? raw.steps.filter((s): s is Record<string, unknown> => isRecord(s))
    : [];

  const steps = tpl.steps.map((tplStep) => {
    const found = rawSteps.find((s) => s.key === tplStep.key);
    const progress = found
      ? Math.min(tplStep.target, Math.max(0, Math.floor(asNumber(found.progress, 0))))
      : 0;
    const contributors =
      found && Array.isArray(found.contributorUserIds)
        ? Array.from(
            new Set(
              found.contributorUserIds.filter((u): u is string => typeof u === 'string')
            )
          )
        : [];
    return {
      ...tplStep,
      progress,
      contributorUserIds: contributors,
    };
  });

  return {
    id: asString(raw.id, fallback.id),
    templateId: tpl.templateId,
    locationId: tpl.locationId,
    dateKey,
    title: asString(raw.title, tpl.title),
    description: asString(raw.description, tpl.description),
    emoji: asString(raw.emoji, tpl.emoji),
    steps,
    completed: raw.completed === true || steps.every((s) => s.progress >= s.target),
    completedAt:
      typeof raw.completedAt === 'number' && Number.isFinite(raw.completedAt)
        ? raw.completedAt
        : null,
    claimedByUserIds: Array.isArray(raw.claimedByUserIds)
      ? Array.from(
          new Set(raw.claimedByUserIds.filter((u): u is string => typeof u === 'string'))
        )
      : [],
    lastUpdatedByName: asNullableString(raw.lastUpdatedByName),
    lastUpdatedAt:
      typeof raw.lastUpdatedAt === 'number' && Number.isFinite(raw.lastUpdatedAt)
        ? raw.lastUpdatedAt
        : null,
  };
}

function parseTownMapState(raw: unknown): TownMapState {
  const defaults = createInitialTownMapState();
  if (!isRecord(raw)) return defaults;

  const currentLocationId = asActiveTownLocationId(raw.currentLocationId) ?? 'home_yard';
  const unlockedLocationIds: ActiveTownLocationId[] = Array.isArray(raw.unlockedLocationIds)
    ? Array.from(
        new Set<ActiveTownLocationId>([
          'home_yard',
          ...raw.unlockedLocationIds
            .map(asActiveTownLocationId)
            .filter((x): x is ActiveTownLocationId => x !== null),
        ])
      )
    : ['home_yard'];

  const rawTickets = isRecord(raw.townTickets) ? raw.townTickets : {};
  const townTickets = {
    balance: Math.max(0, Math.floor(asNumber(rawTickets.balance, 0))),
    totalEarned: Math.max(0, Math.floor(asNumber(rawTickets.totalEarned, 0))),
  };

  const rawHut = isRecord(raw.visitorHut) ? raw.visitorHut : {};
  const hutLvRaw = Math.floor(asNumber(rawHut.level, 1));
  const hutLevel = (hutLvRaw >= 1 && hutLvRaw <= 5 ? hutLvRaw : 1) as 1 | 2 | 3 | 4 | 5;
  const builtFacilities = Array.isArray(rawHut.builtFacilities)
    ? Array.from(
        new Set(
          rawHut.builtFacilities.filter(
            (f): f is VisitorHutFacilityId =>
              typeof f === 'string' && f in VISITOR_HUT_FACILITY_BY_ID
          )
        )
      )
    : [];

  const rawLocations = isRecord(raw.locations) ? raw.locations : {};
  const locations = { ...defaults.locations };
  for (const locId of ACTIVE_TOWN_LOCATION_IDS) {
    const defLoc = defaults.locations[locId];
    const rLoc = isRecord(rawLocations[locId]) ? rawLocations[locId] : {};
    const dailyDate = asString(rLoc.dailyDate, defLoc.dailyDate);

    const activeVisitors: TownLocationVisitorInstance[] = Array.isArray(rLoc.activeVisitors)
      ? rLoc.activeVisitors
          .filter((v): v is Record<string, unknown> => isRecord(v))
          .map((v) => {
            const vid = asTownVisitorId(v.visitorId);
            if (!vid) return null;
            const vDef = TOWN_VISITOR_BY_ID[vid];
            return {
              visitId: asString(v.visitId, `tv_${Date.now()}`),
              locationId: locId,
              visitorId: vid,
              rarity: vDef.rarity,
              arrivedAt: asNumber(v.arrivedAt, Date.now()),
              departAt: asNumber(v.departAt, Date.now() + 3600000),
              fedCount: Math.max(0, Math.floor(asNumber(v.fedCount, 0))),
              maxFeedCount: Math.max(1, Math.floor(asNumber(v.maxFeedCount, 2))),
              photoTaken: v.photoTaken === true,
              lastFeedReaction:
                v.lastFeedReaction === 'favorite' ||
                v.lastFeedReaction === 'neutral' ||
                v.lastFeedReaction === 'disliked'
                  ? v.lastFeedReaction
                  : null,
              lastFeedLine: asNullableString(v.lastFeedLine),
              lastRewardSummary: asNullableString(v.lastRewardSummary),
            } as TownLocationVisitorInstance;
          })
          .filter((v): v is TownLocationVisitorInstance => v !== null)
      : [];

    const rawQuests = Array.isArray(rLoc.dailyQuests)
      ? rLoc.dailyQuests.filter((q): q is Record<string, unknown> => isRecord(q))
      : [];
    const dailyQuests: TownLocationQuest[] = LOCATION_DAILY_QUEST_TEMPLATES[locId].map((tpl) => {
      const rq = rawQuests.find((q) => q.id === tpl.id);
      const progress = rq
        ? Math.min(tpl.target, Math.max(0, Math.floor(asNumber(rq.progress, 0))))
        : 0;
      return {
        ...tpl,
        progress,
        completed: rq?.completed === true || progress >= tpl.target,
        claimed: rq?.claimed === true,
      };
    });

    locations[locId] = {
      locationId: locId,
      dailyDate,
      dailyVisitorsCount: Math.max(0, Math.floor(asNumber(rLoc.dailyVisitorsCount, 0))),
      activeVisitors,
      dailyQuests,
      allQuestsBonusClaimed: rLoc.allQuestsBonusClaimed === true,
      totalVisitsHosted: Math.max(0, Math.floor(asNumber(rLoc.totalVisitsHosted, 0))),
      totalPhotosTaken: Math.max(0, Math.floor(asNumber(rLoc.totalPhotosTaken, 0))),
      unlockedBackgroundIds: Array.isArray(rLoc.unlockedBackgroundIds)
        ? Array.from(
            new Set(
              rLoc.unlockedBackgroundIds
                .map(asStudioBg)
                .filter((b): b is PhotoBackground => b !== null)
            )
          )
        : [],
      unlockedFilterIds: Array.isArray(rLoc.unlockedFilterIds)
        ? Array.from(
            new Set(
              rLoc.unlockedFilterIds
                .map(asStudioFilter)
                .filter((f): f is PhotoFilter => f !== null)
            )
          )
        : [],
      unlockedFrameIds: Array.isArray(rLoc.unlockedFrameIds)
        ? Array.from(
            new Set(
              rLoc.unlockedFrameIds
                .map(asStudioFrame)
                .filter((fr): fr is PhotoFrame => fr !== null)
            )
          )
        : [],
      encyclopediaRewardClaimed: rLoc.encyclopediaRewardClaimed === true,
    } as TownLocationProgressState;
  }

  const visitorAffinities = { ...defaults.visitorAffinities };
  const rawAffs = isRecord(raw.visitorAffinities) ? raw.visitorAffinities : {};
  for (const vid of Object.keys(TOWN_VISITOR_BY_ID) as TownVisitorId[]) {
    const rAff = isRecord(rawAffs[vid]) ? rawAffs[vid] : {};
    const exp = Math.max(0, Math.floor(asNumber(rAff.exp, 0)));
    visitorAffinities[vid] = {
      visitorId: vid,
      exp,
      level: getTownVisitorLevelForExp(exp),
      totalVisits: Math.max(0, Math.floor(asNumber(rAff.totalVisits, 0))),
      totalFed: Math.max(0, Math.floor(asNumber(rAff.totalFed, 0))),
      totalPhotos: Math.max(0, Math.floor(asNumber(rAff.totalPhotos, 0))),
      firstMetAt:
        typeof rAff.firstMetAt === 'number' && Number.isFinite(rAff.firstMetAt)
          ? rAff.firstMetAt
          : null,
    } as TownVisitorAffinityRecord;
  }

  const purchasedShopItemIds = Array.isArray(raw.purchasedShopItemIds)
    ? Array.from(
        new Set(
          raw.purchasedShopItemIds.filter(
            (id): id is string => typeof id === 'string' && id in TOWN_SHOP_ITEM_BY_ID
          )
        )
      )
    : [];

  const validMarketFurnSet = new Set<string>(TOWN_MARKET_FURNITURE_IDS);
  const unlockedMarketFurnitureIds = Array.isArray(raw.unlockedMarketFurnitureIds)
    ? Array.from(
        new Set(
          raw.unlockedMarketFurnitureIds.filter(
            (id): id is string => typeof id === 'string' && validMarketFurnSet.has(id)
          )
        )
      )
    : [];

  return {
    currentLocationId,
    unlockedLocationIds,
    townTickets,
    visitorHut: {
      level: hutLevel,
      builtFacilities,
    },
    locations,
    visitorAffinities,
    purchasedShopItemIds,
    unlockedMarketFurnitureIds,
    acornsCollectedTotal: Math.max(0, Math.floor(asNumber(raw.acornsCollectedTotal, 0))),
    fishingGamesPlayedTotal: Math.max(0, Math.floor(asNumber(raw.fishingGamesPlayedTotal, 0))),
    fishingBestScore: Math.max(0, Math.floor(asNumber(raw.fishingBestScore, 0))),
    marketDishesDeliveredTotal: Math.max(0, Math.floor(asNumber(raw.marketDishesDeliveredTotal, 0))),
  };
}

function parseCoopEventSession(raw: unknown, todayStr: string): CoopEventSession | null {
  if (!isRecord(raw)) return null;
  const dateKey = asString(raw.dateKey, todayStr);
  const defaults = createDailyCoopEventSession(dateKey);
  const harvestTarget = Math.max(1, Math.floor(asNumber(raw.harvestTarget, defaults.harvestTarget)));
  const cookTarget = Math.max(1, Math.floor(asNumber(raw.cookTarget, defaults.cookTarget)));
  const photoTarget = Math.max(1, Math.floor(asNumber(raw.photoTarget, defaults.photoTarget)));
  return {
    id: asString(raw.id, defaults.id),
    eventId: 'strawberry_season',
    dateKey,
    title: asString(raw.title, defaults.title),
    description: asString(raw.description, defaults.description),
    harvestTarget,
    harvestCount: Math.min(harvestTarget, Math.max(0, Math.floor(asNumber(raw.harvestCount, 0)))),
    harvestedByUserIds: Array.isArray(raw.harvestedByUserIds)
      ? Array.from(new Set(raw.harvestedByUserIds.filter((u): u is string => typeof u === 'string')))
      : [],
    cookTarget,
    cookCount: Math.min(cookTarget, Math.max(0, Math.floor(asNumber(raw.cookCount, 0)))),
    cookedByUserIds: Array.isArray(raw.cookedByUserIds)
      ? Array.from(new Set(raw.cookedByUserIds.filter((u): u is string => typeof u === 'string')))
      : [],
    photoTarget,
    photoCount: Math.min(photoTarget, Math.max(0, Math.floor(asNumber(raw.photoCount, 0)))),
    photoByUserIds: Array.isArray(raw.photoByUserIds)
      ? Array.from(new Set(raw.photoByUserIds.filter((u): u is string => typeof u === 'string')))
      : [],
    completed: raw.completed === true,
    completedAt:
      typeof raw.completedAt === 'number' && Number.isFinite(raw.completedAt)
        ? raw.completedAt
        : null,
    claimedByUserIds: Array.isArray(raw.claimedByUserIds)
      ? Array.from(new Set(raw.claimedByUserIds.filter((u): u is string => typeof u === 'string')))
      : [],
    picnicPhotoId: asNullableString(raw.picnicPhotoId),
    lastUpdatedByName: asNullableString(raw.lastUpdatedByName),
    lastUpdatedAt:
      typeof raw.lastUpdatedAt === 'number' && Number.isFinite(raw.lastUpdatedAt)
        ? raw.lastUpdatedAt
        : null,
  };
}

function parseEventPhotoBreakdown(raw: unknown): EventPhotoScoreBreakdown | null {
  if (!isRecord(raw)) return null;
  return {
    totalScore: Math.max(0, Math.floor(asNumber(raw.totalScore, 0))),
    strawberryAccCount: Math.max(0, Math.floor(asNumber(raw.strawberryAccCount, 0))),
    strawberryAccPoints: Math.max(0, Math.floor(asNumber(raw.strawberryAccPoints, 0))),
    backgroundMatched: raw.backgroundMatched === true,
    backgroundPoints: Math.max(0, Math.floor(asNumber(raw.backgroundPoints, 0))),
    filterMatched: raw.filterMatched === true,
    filterPoints: Math.max(0, Math.floor(asNumber(raw.filterPoints, 0))),
    frameMatched: raw.frameMatched === true,
    framePoints: Math.max(0, Math.floor(asNumber(raw.framePoints, 0))),
    fedStrawberryFood: raw.fedStrawberryFood === true,
    fedStrawberryPoints: Math.max(0, Math.floor(asNumber(raw.fedStrawberryPoints, 0))),
    fullSetCompleted: raw.fullSetCompleted === true,
    fullSetPoints: Math.max(0, Math.floor(asNumber(raw.fullSetPoints, 0))),
  };
}

function parseSeasonalEvent(raw: unknown): SeasonalEvent {
  const defaults = createInitialSeasonalEvent();
  if (!isRecord(raw)) return defaults;

  const startDate = asString(raw.startDate, defaults.startDate);
  const endDate = asString(raw.endDate, defaults.endDate);
  const status: SeasonalEvent['status'] = raw.status === 'ended' ? 'ended' : 'active';
  const rawCurrency = isRecord(raw.currency) ? raw.currency : {};
  const dailyDate = asString(raw.dailyDate, defaults.dailyDate);

  const tplByKind = new Map(STRAWBERRY_DAILY_TASK_TEMPLATES.map((t) => [t.kind, t]));
  const parsedTasks: EventTask[] = Array.isArray(raw.dailyTasks)
    ? raw.dailyTasks
        .filter((t): t is Record<string, unknown> => isRecord(t))
        .map((t) => {
          const kind = typeof t.kind === 'string' ? tplByKind.get(t.kind as EventTask['kind']) : undefined;
          if (!kind) return null;
          const progress = Math.min(kind.target, Math.max(0, Math.floor(asNumber(t.progress, 0))));
          return {
            id: asString(t.id, `evt_${dailyDate}_${kind.kind}`),
            kind: kind.kind,
            title: kind.title,
            description: kind.description,
            emoji: kind.emoji,
            target: kind.target,
            progress,
            completed: t.completed === true || progress >= kind.target,
            claimed: t.claimed === true,
            rewardTickets: kind.rewardTickets,
            rewardCoins: kind.rewardCoins,
            rewardIngredientId: kind.rewardIngredientId,
            rewardIngredientQty: kind.rewardIngredientQty,
            rewardStudioMaterials: kind.rewardStudioMaterials,
          } as EventTask;
        })
        .filter((t): t is EventTask => t !== null)
    : [];
  const dailyTasks = parsedTasks.length > 0 ? parsedTasks : buildDailyEventTasksForDate(dailyDate);

  const rawWeekly = isRecord(raw.weeklyChallenge) ? raw.weeklyChallenge : {};
  const baseMilestones = createInitialStrawberryMilestones();
  const savedMMap = new Map<string, Record<string, unknown>>();
  if (Array.isArray(raw.milestones)) {
    for (const item of raw.milestones) {
      if (isRecord(item) && typeof item.id === 'string') {
        savedMMap.set(item.id, item);
      }
    }
  }
  const milestones: EventMilestone[] = baseMilestones.map((m) => {
    const saved = savedMMap.get(m.id);
    const progress = saved
      ? Math.min(m.target, Math.max(0, Math.floor(asNumber(saved.progress, 0))))
      : 0;
    return {
      ...m,
      progress,
      completed: saved ? saved.completed === true || progress >= m.target : false,
      claimed: saved ? saved.claimed === true : false,
    };
  });

  const validShopIds = new Set(STRAWBERRY_SHOP_ITEMS.map((i) => i.id));
  const purchasedShopItemIds = Array.isArray(raw.purchasedShopItemIds)
    ? Array.from(
        new Set(
          raw.purchasedShopItemIds.filter(
            (id): id is string => typeof id === 'string' && validShopIds.has(id)
          )
        )
      )
    : [];

  const eventPhotoIds = Array.isArray(raw.eventPhotoIds)
    ? Array.from(new Set(raw.eventPhotoIds.filter((id): id is string => typeof id === 'string'))).slice(0, 48)
    : [];

  const rawStats = isRecord(raw.stats) ? raw.stats : {};
  const rawRecap = isRecord(raw.recap) ? raw.recap : {};

  return {
    eventId: 'strawberry_season',
    name: defaults.name,
    description: defaults.description,
    startDate,
    endDate,
    status,
    currency: {
      id: 'strawberry_ticket',
      name: defaults.currency.name,
      emoji: defaults.currency.emoji,
      balance: Math.max(0, Math.floor(asNumber(rawCurrency.balance, 0))),
      totalEarned: Math.max(0, Math.floor(asNumber(rawCurrency.totalEarned, 0))),
      convertedToCoins: Math.max(0, Math.floor(asNumber(rawCurrency.convertedToCoins, 0))),
      convertedToMaterials: Math.max(0, Math.floor(asNumber(rawCurrency.convertedToMaterials, 0))),
    },
    dailyDate,
    dailyTasks,
    weeklyChallenge: {
      weekKey: asString(rawWeekly.weekKey, defaults.weeklyChallenge.weekKey),
      weekNumber: Math.max(1, Math.min(2, Math.floor(asNumber(rawWeekly.weekNumber, 1)))),
      title: asString(rawWeekly.title, defaults.weeklyChallenge.title),
      description: asString(rawWeekly.description, defaults.weeklyChallenge.description),
      bestScore: Math.max(0, Math.floor(asNumber(rawWeekly.bestScore, 0))),
      submittedCount: Math.max(0, Math.floor(asNumber(rawWeekly.submittedCount, 0))),
      claimedTiers: Array.isArray(rawWeekly.claimedTiers)
        ? Array.from(
            new Set(
              rawWeekly.claimedTiers.filter(
                (t): t is number => typeof t === 'number' && [60, 100, 150].includes(t)
              )
            )
          ).sort((a, b) => a - b)
        : [],
      lastPhotoId: asNullableString(rawWeekly.lastPhotoId),
      lastBreakdown: parseEventPhotoBreakdown(rawWeekly.lastBreakdown),
    },
    consecutiveChallengeWeeks: Math.max(
      0,
      Math.floor(asNumber(raw.consecutiveChallengeWeeks, 0))
    ),
    lastQualifiedChallengeWeek: asNullableString(raw.lastQualifiedChallengeWeek),
    fedStrawberryFoodWeekKey: asNullableString(raw.fedStrawberryFoodWeekKey),
    milestones,
    purchasedShopItemIds,
    eventPhotoIds,
    stats: {
      completedTasksCount: Math.max(0, Math.floor(asNumber(rawStats.completedTasksCount, 0))),
      plantedOrHarvestedStrawberries: Math.max(
        0,
        Math.floor(asNumber(rawStats.plantedOrHarvestedStrawberries, 0))
      ),
      strawberryDishesCooked: Math.max(0, Math.floor(asNumber(rawStats.strawberryDishesCooked, 0))),
      strawberryPhotosTaken: Math.max(0, Math.floor(asNumber(rawStats.strawberryPhotosTaken, 0))),
      coopPartyCompletedCount: Math.max(
        0,
        Math.floor(asNumber(rawStats.coopPartyCompletedCount, 0))
      ),
    },
    coopStreakDays: Math.max(0, Math.floor(asNumber(raw.coopStreakDays, 0))),
    lastCoopCompletedDate: asNullableString(raw.lastCoopCompletedDate),
    recap: {
      eventId: 'strawberry_season',
      seasonKey: asString(rawRecap.seasonKey, `${startDate}_${endDate}`),
      completedTasksCount: Math.max(0, Math.floor(asNumber(rawRecap.completedTasksCount, 0))),
      totalTicketsEarned: Math.max(0, Math.floor(asNumber(rawRecap.totalTicketsEarned, 0))),
      photosTakenCount: Math.max(0, Math.floor(asNumber(rawRecap.photosTakenCount, 0))),
      accessoriesCollectedCount: Math.max(
        0,
        Math.floor(asNumber(rawRecap.accessoriesCollectedCount, 0))
      ),
      recipesCookedCount: Math.max(0, Math.floor(asNumber(rawRecap.recipesCookedCount, 0))),
      coopCompletedCount: Math.max(0, Math.floor(asNumber(rawRecap.coopCompletedCount, 0))),
      bestPhotoId: asNullableString(rawRecap.bestPhotoId),
      coverPhotoId: asNullableString(rawRecap.coverPhotoId),
      savedToMemories: rawRecap.savedToMemories === true,
      endedSettled: rawRecap.endedSettled === true,
      convertedCoins: Math.max(0, Math.floor(asNumber(rawRecap.convertedCoins, 0))),
      convertedMaterials: Math.max(0, Math.floor(asNumber(rawRecap.convertedMaterials, 0))),
    },
    carryoverCatalogItemIds: Array.isArray(raw.carryoverCatalogItemIds)
      ? Array.from(
          new Set(raw.carryoverCatalogItemIds.filter((id): id is string => typeof id === 'string'))
        )
      : [],
  };
}

function asStudioThemeId(v: unknown): WeeklyOutfitChallengeThemeId {
  if (typeof v === 'string' && WEEKLY_OUTFIT_THEMES.some((t) => t.id === v)) {
    return v as WeeklyOutfitChallengeThemeId;
  }
  return getWeeklyOutfitChallengeTheme().id;
}

function asStudioPose(v: unknown): PhotoPose | null {
  return typeof v === 'string' && v in PHOTO_POSE_BY_ID ? (v as PhotoPose) : null;
}

function asStudioBg(v: unknown): PhotoBackground | null {
  return typeof v === 'string' && v in PHOTO_BACKGROUND_BY_ID
    ? (v as PhotoBackground)
    : null;
}

function asStudioFilter(v: unknown): PhotoFilter | null {
  return typeof v === 'string' && v in PHOTO_FILTER_BY_ID ? (v as PhotoFilter) : null;
}

function asStudioFrame(v: unknown): PhotoFrame | null {
  return typeof v === 'string' && v in PHOTO_FRAME_BY_ID ? (v as PhotoFrame) : null;
}

function asStudioSticker(v: unknown): PhotoStickerId | null {
  return typeof v === 'string' && v in PHOTO_STICKER_BY_ID
    ? (v as PhotoStickerId)
    : null;
}

function parseCoopDuoChallenge(raw: unknown): CoopDuoPhotoChallengeState | null {
  if (!isRecord(raw)) return null;
  const weekKey = asString(raw.weekKey, getStudioWeekKey());
  const themeId = asStudioThemeId(raw.themeId);
  const bg = asStudioBg(raw.backgroundId) ?? 'pink_room';
  const filter = asStudioFilter(raw.filterId) ?? 'pink';
  const frame = asStudioFrame(raw.frameId) ?? 'coop_heart';
  const stickers = Array.isArray(raw.stickers)
    ? raw.stickers
        .map(asStudioSticker)
        .filter((s): s is PhotoStickerId => s !== null)
        .slice(0, 6)
    : [];
  const submissions: Record<string, CoopDuoChallengeSubmission> = {};
  if (isRecord(raw.submissions)) {
    for (const [uid, val] of Object.entries(raw.submissions)) {
      if (!isRecord(val)) continue;
      submissions[uid] = {
        userId: asString(val.userId, uid),
        userName: asString(val.userName, '飼主'),
        petId: asString(val.petId, 'pet_1'),
        petName: asString(val.petName, '布丁'),
        species: asSpecies(val.species),
        equipped: parseAccessoriesRecord(val.equipped, {
          head: null,
          face: null,
          neck: null,
          body: null,
          held: null,
          back: null,
        }),
        poseId: asStudioPose(val.poseId) ?? 'happy',
        facing:
          val.facing === 'front' ||
          val.facing === 'left' ||
          val.facing === 'back' ||
          val.facing === 'right' ||
          val.facing === 'flipped'
            ? val.facing
            : 'front',
        weightAtCapture: asNumber(val.weightAtCapture, 8.5),
        submittedAt: asNumber(val.submittedAt, Date.now()),
      };
    }
  }
  return {
    weekKey,
    themeId,
    title: asString(raw.title, '雙人穿搭紀念照').slice(0, 20),
    backgroundId: bg,
    filterId: filter,
    frameId: frame,
    stickers,
    submissions,
    mergedPhotoId: asNullableString(raw.mergedPhotoId),
    completed: raw.completed === true,
    completedAt:
      typeof raw.completedAt === 'number' && Number.isFinite(raw.completedAt)
        ? raw.completedAt
        : null,
    claimedByUserIds: Array.isArray(raw.claimedByUserIds)
      ? raw.claimedByUserIds.filter((u): u is string => typeof u === 'string')
      : [],
  };
}

function parseStudioBreakdown(raw: unknown): StudioScoreBreakdown | null {
  if (!isRecord(raw)) return null;
  return {
    totalScore: Math.max(0, Math.floor(asNumber(raw.totalScore, 0))),
    themeAccessoryCount: Math.max(0, Math.floor(asNumber(raw.themeAccessoryCount, 0))),
    themeAccessoryPoints: Math.max(0, Math.floor(asNumber(raw.themeAccessoryPoints, 0))),
    backgroundMatched: raw.backgroundMatched === true,
    backgroundPoints: Math.max(0, Math.floor(asNumber(raw.backgroundPoints, 0))),
    filterMatched: raw.filterMatched === true,
    filterPoints: Math.max(0, Math.floor(asNumber(raw.filterPoints, 0))),
    frameMatched: raw.frameMatched === true,
    framePoints: Math.max(0, Math.floor(asNumber(raw.framePoints, 0))),
    likedAccessoryCount: Math.max(0, Math.floor(asNumber(raw.likedAccessoryCount, 0))),
    likedAccessoryPoints: Math.max(0, Math.floor(asNumber(raw.likedAccessoryPoints, 0))),
    fullSetCompleted: raw.fullSetCompleted === true,
    fullSetPoints: Math.max(0, Math.floor(asNumber(raw.fullSetPoints, 0))),
  };
}

function parsePhotoStudioState(raw: unknown): PhotoStudioState {
  const defaults = createInitialPhotoStudioState();
  if (!isRecord(raw)) return defaults;

  const unlockedPoses = Array.from(
    new Set<PhotoPose>([
      ...FREE_STUDIO_POSES,
      ...(Array.isArray(raw.unlockedPoses)
        ? raw.unlockedPoses.map(asStudioPose).filter((p): p is PhotoPose => p !== null)
        : []),
    ])
  );
  const unlockedBackgrounds = Array.from(
    new Set<PhotoBackground>([
      ...FREE_STUDIO_BACKGROUNDS,
      ...(Array.isArray(raw.unlockedBackgrounds)
        ? raw.unlockedBackgrounds
            .map(asStudioBg)
            .filter((b): b is PhotoBackground => b !== null)
        : []),
    ])
  );
  const unlockedFilters = Array.from(
    new Set<PhotoFilter>([
      ...FREE_STUDIO_FILTERS,
      ...(Array.isArray(raw.unlockedFilters)
        ? raw.unlockedFilters
            .map(asStudioFilter)
            .filter((f): f is PhotoFilter => f !== null)
        : []),
    ])
  );
  const unlockedFrames = Array.from(
    new Set<PhotoFrame>([
      ...FREE_STUDIO_FRAMES,
      ...(Array.isArray(raw.unlockedFrames)
        ? raw.unlockedFrames
            .map(asStudioFrame)
            .filter((f): f is PhotoFrame => f !== null)
        : []),
    ])
  );
  const unlockedStickers = Array.from(
    new Set<PhotoStickerId>(
      Array.isArray(raw.unlockedStickers)
        ? raw.unlockedStickers
            .map(asStudioSticker)
            .filter((s): s is PhotoStickerId => s !== null)
        : []
    )
  );

  const rawWeekly = isRecord(raw.weeklyChallenge) ? raw.weeklyChallenge : {};
  const weekKey = asString(rawWeekly.weekKey, defaults.weeklyChallenge.weekKey);
  const theme = getWeeklyOutfitChallengeTheme(weekKey);
  const unlockedStudioBadges = Array.isArray(raw.unlockedStudioBadges)
    ? Array.from(
        new Set(
          raw.unlockedStudioBadges.filter(
            (b): b is StudioBadgeId => typeof b === 'string' && b in STUDIO_BADGES
          )
        )
      )
    : [];

  return {
    unlockedPoses,
    unlockedBackgrounds,
    unlockedFilters,
    unlockedFrames,
    unlockedStickers,
    studioMaterials: Math.max(0, Math.floor(asNumber(raw.studioMaterials, 0))),
    studioFrameShards: Math.max(0, Math.floor(asNumber(raw.studioFrameShards, 0))),
    weeklyChallenge: {
      weekKey,
      themeId: asStudioThemeId(rawWeekly.themeId ?? theme.id),
      bestScore: Math.max(0, Math.floor(asNumber(rawWeekly.bestScore, 0))),
      submittedCount: Math.max(0, Math.floor(asNumber(rawWeekly.submittedCount, 0))),
      claimedTiers: Array.isArray(rawWeekly.claimedTiers)
        ? Array.from(
            new Set(
              rawWeekly.claimedTiers.filter(
                (t): t is number => typeof t === 'number' && [60, 100, 150].includes(t)
              )
            )
          ).sort((a, b) => a - b)
        : [],
      lastBreakdown: parseStudioBreakdown(rawWeekly.lastBreakdown),
      lastPhotoId: asNullableString(rawWeekly.lastPhotoId),
    },
    consecutiveChallengeWeeks: Math.max(
      0,
      Math.floor(asNumber(raw.consecutiveChallengeWeeks, 0))
    ),
    lastQualifiedChallengeWeek: asNullableString(raw.lastQualifiedChallengeWeek),
    unlockedStudioBadges,
    duoChallengeStreakWeeks: Math.max(
      0,
      Math.floor(asNumber(raw.duoChallengeStreakWeeks, 0))
    ),
    lastQualifiedDuoWeek: asNullableString(raw.lastQualifiedDuoWeek),
    totalStudioPhotos: Math.max(0, Math.floor(asNumber(raw.totalStudioPhotos, 0))),
  };
}

function parseVisitorTreats(raw: unknown): Partial<Record<VisitorTreatId, number>> {
  const result: Partial<Record<VisitorTreatId, number>> = {};
  if (!isRecord(raw)) {
    return { seeds_mix: 2, fresh_lettuce: 1 };
  }
  for (const key of Object.keys(VISITOR_TREAT_BY_ID) as VisitorTreatId[]) {
    const val = raw[key];
    if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
      result[key] = Math.floor(val);
    }
  }
  return result;
}

function parseVisitorSystemState(raw: unknown): VisitorSystemState {
  const defaults = createInitialVisitorState();
  if (!isRecord(raw)) return defaults;

  const defaultAffs = createDefaultAffinities();
  const affinities: Record<VisitorId, VisitorAffinity> = { ...defaultAffs };
  const legacyThresholds = [0, 35, 90, 175, 290] as const;
  if (isRecord(raw.affinities)) {
    (['bird', 'squirrel', 'rabbit'] as VisitorId[]).forEach((vId) => {
      const item = raw.affinities && isRecord(raw.affinities) ? raw.affinities[vId] : null;
      if (isRecord(item)) {
        const rawExp = Math.round(Math.max(0, asNumber(item.exp, 0)) * 2) / 2;
        let exp = rawExp;
        const savedLevel =
          typeof item.level === 'number' && Number.isFinite(item.level)
            ? Math.min(5, Math.max(1, Math.floor(item.level)))
            : null;
        if (savedLevel !== null && getAffinityLevelFromExp(rawExp) > savedLevel) {
          const oldMin = legacyThresholds[savedLevel - 1] ?? 0;
          const oldMax = legacyThresholds[savedLevel] ?? 420;
          const newMin = VISITOR_AFFINITY_THRESHOLDS[savedLevel - 1] ?? 0;
          const newMax = VISITOR_AFFINITY_THRESHOLDS[savedLevel] ?? 36;
          const span = Math.max(1, oldMax - oldMin);
          const ratio = Math.min(0.95, Math.max(0, (rawExp - oldMin) / span));
          exp =
            Math.round((newMin + ratio * Math.max(1, newMax - newMin)) * 2) / 2;
        }
        const level = getAffinityLevelFromExp(exp);
        affinities[vId] = {
          visitorId: vId,
          level,
          exp,
          totalVisits: Math.max(0, Math.floor(asNumber(item.totalVisits, 0))),
          totalFed: Math.max(0, Math.floor(asNumber(item.totalFed, 0))),
          unlockedCostume: level >= 5 || item.unlockedCostume === true,
          unlockedDecor: level >= 2 || item.unlockedDecor === true,
          firstHostedAt:
            typeof item.firstHostedAt === 'number' && Number.isFinite(item.firstHostedAt)
              ? item.firstHostedAt
              : null,
        };
      }
    });
  }

  let activeVisit: VisitorVisit | null = null;
  if (isRecord(raw.activeVisit)) {
    const vId = asVisitorId(raw.activeVisit.visitorId);
    if (vId) {
      const arrivedAt = asNumber(raw.activeVisit.arrivedAt, Date.now());
      const departAt = asNumber(raw.activeVisit.departAt, arrivedAt + 3600000);
      const reactionRaw = raw.activeVisit.lastFeedReaction;
      activeVisit = {
        visitId: asString(raw.activeVisit.visitId, `vis_${arrivedAt}`),
        visitorId: vId,
        arrivedAt,
        departAt,
        behavior: asVisitorBehavior(raw.activeVisit.behavior),
        behaviorChangedAt: asNumber(raw.activeVisit.behaviorChangedAt, arrivedAt),
        fedCount: Math.max(0, Math.floor(asNumber(raw.activeVisit.fedCount, 0))),
        maxFeedCount: Math.max(1, Math.floor(asNumber(raw.activeVisit.maxFeedCount, 2))),
        lastFeedReaction:
          reactionRaw === 'favorite' || reactionRaw === 'neutral' || reactionRaw === 'disliked'
            ? reactionRaw
            : null,
        lastFeedLine: asNullableString(raw.activeVisit.lastFeedLine),
        lastRewardSummary: asNullableString(raw.activeVisit.lastRewardSummary),
        photoTaken: raw.activeVisit.photoTaken === true,
        likesYard: raw.activeVisit.likesYard === true,
        yardMatchReasons: Array.isArray(raw.activeVisit.yardMatchReasons)
          ? raw.activeVisit.yardMatchReasons.filter((s): s is string => typeof s === 'string')
          : [],
      };
    }
  }

  const ownedYardDecors = Array.isArray(raw.ownedYardDecors)
    ? Array.from(
        new Set([
          'oak_tree' as VisitorDecorId,
          ...raw.ownedYardDecors
            .map(asVisitorDecorId)
            .filter((d): d is VisitorDecorId => d !== null),
        ])
      )
    : defaults.ownedYardDecors;

  const placedYardDecors = Array.isArray(raw.placedYardDecors)
    ? Array.from(
        new Set(
          raw.placedYardDecors
            .map(asVisitorDecorId)
            .filter((d): d is VisitorDecorId => d !== null && ownedYardDecors.includes(d))
        )
      )
    : defaults.placedYardDecors;

  return {
    dateKey: asString(raw.dateKey, defaults.dateKey),
    dailyVisitCount: Math.max(0, Math.floor(asNumber(raw.dailyVisitCount, 0))),
    maxDailyVisits: 3,
    nextSpawnAt: asNumber(raw.nextSpawnAt, defaults.nextSpawnAt),
    activeVisit,
    affinities,
    ownedYardDecors,
    placedYardDecors,
    arrivalNoticeUnread: raw.arrivalNoticeUnread === true,
  };
}

function parseTownOrders(raw: unknown): TownOrder[] {
  const todayStr = formatLocalDate();
  if (!Array.isArray(raw) || raw.length === 0) {
    return createInitialTownOrders(todayStr);
  }
  const orders: TownOrder[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const id = asString(item.id, '');
    if (!id) continue;
    const catRaw = item.category;
    const category: TownOrderCategory =
      catRaw === 'visitor' ||
      catRaw === 'coop' ||
      catRaw === 'photo' ||
      catRaw === 'advanced'
        ? catRaw
        : 'visitor';
    const requirements: TownOrderItemReq[] = Array.isArray(item.requirements)
      ? item.requirements
          .filter((r): r is Record<string, unknown> => isRecord(r))
          .map((r) => {
            const kind =
              r.kind === 'ingredient' || r.kind === 'food' || r.kind === 'treat'
                ? r.kind
                : 'ingredient';
            const requiredQty = Math.max(1, Math.floor(asNumber(r.requiredQty, 1)));
            const deliveredQty = Math.min(
              requiredQty,
              Math.max(0, Math.floor(asNumber(r.deliveredQty, 0)))
            );
            const itemId = asString(r.itemId, 'carrot');
            return {
              key: asString(r.key, `${kind}:${itemId}`),
              kind,
              itemId,
              label: asString(r.label, '食材'),
              emoji: asString(r.emoji, '🥕'),
              requiredQty,
              deliveredQty,
            };
          })
      : [];
    let photoRequirement: TownOrderPhotoReq | undefined;
    if (isRecord(item.photoRequirement)) {
      const targetCount = Math.max(
        1,
        Math.floor(asNumber(item.photoRequirement.targetCount, 1))
      );
      const currentCount = Math.min(
        targetCount,
        Math.max(0, Math.floor(asNumber(item.photoRequirement.currentCount, 0)))
      );
      photoRequirement = {
        targetCount,
        currentCount,
        visitorId: asVisitorId(item.photoRequirement.visitorId) ?? undefined,
        requiresStudioScene:
          item.photoRequirement.requiresStudioScene === true ? true : undefined,
        label: asString(item.photoRequirement.label, '拍攝訪客合照'),
      };
    }
    const rawReward = isRecord(item.reward) ? item.reward : {};
    const rareIngredients: Partial<Record<IngredientId, number>> = {};
    if (isRecord(rawReward.rareIngredients)) {
      for (const ingId of INGREDIENT_IDS) {
        const v = rawReward.rareIngredients[ingId];
        if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
          rareIngredients[ingId] = Math.floor(v);
        }
      }
    }
    const treats: Partial<Record<VisitorTreatId, number>> = {};
    if (isRecord(rawReward.treats)) {
      for (const tId of Object.keys(VISITOR_TREAT_BY_ID) as VisitorTreatId[]) {
        const v = rawReward.treats[tId];
        if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
          treats[tId] = Math.floor(v);
        }
      }
    }
    let unlockStudio: TownOrder['reward']['unlockStudio'];
    if (isRecord(rawReward.unlockStudio)) {
      const backgroundId =
        typeof rawReward.unlockStudio.backgroundId === 'string' &&
        rawReward.unlockStudio.backgroundId in PHOTO_BACKGROUND_BY_ID
          ? (rawReward.unlockStudio.backgroundId as PhotoBackground)
          : undefined;
      const filterId =
        typeof rawReward.unlockStudio.filterId === 'string' &&
        rawReward.unlockStudio.filterId in PHOTO_FILTER_BY_ID
          ? (rawReward.unlockStudio.filterId as PhotoFilter)
          : undefined;
      const frameId =
        typeof rawReward.unlockStudio.frameId === 'string' &&
        rawReward.unlockStudio.frameId in PHOTO_FRAME_BY_ID
          ? (rawReward.unlockStudio.frameId as PhotoFrame)
          : undefined;
      if (backgroundId || filterId || frameId) {
        unlockStudio = { backgroundId, filterId, frameId };
      }
    }
    const studioMaterials =
      typeof rawReward.studioMaterials === 'number' &&
      Number.isFinite(rawReward.studioMaterials) &&
      rawReward.studioMaterials > 0
        ? Math.floor(rawReward.studioMaterials)
        : undefined;

    orders.push({
      id,
      dateKey: asString(item.dateKey, todayStr),
      category,
      visitorId: asVisitorId(item.visitorId) ?? undefined,
      title: asString(item.title, '小鎮委託單'),
      description: asString(item.description, ''),
      emoji: asString(item.emoji, '📋'),
      requirements,
      photoRequirement,
      reward: {
        coins: Math.max(0, Math.floor(asNumber(rawReward.coins, 30))),
        furnitureShards: Math.max(0, Math.floor(asNumber(rawReward.furnitureShards, 1))),
        farmSpeedTickets: Math.max(0, Math.floor(asNumber(rawReward.farmSpeedTickets, 1))),
        rareIngredients,
        treats: Object.keys(treats).length > 0 ? treats : undefined,
        studioMaterials,
        unlockStudio,
      },
      createdAt: asNumber(item.createdAt, Date.now()),
      expiresAt: asNumber(item.expiresAt, Date.now() + 86400000),
      completed: item.completed === true,
      completedAt:
        typeof item.completedAt === 'number' && Number.isFinite(item.completedAt)
          ? item.completedAt
          : null,
      overdue: item.overdue === true,
      claimedByUserIds: Array.isArray(item.claimedByUserIds)
        ? item.claimedByUserIds.filter((u): u is string => typeof u === 'string')
        : [],
    });
  }
  return orders.length > 0 ? orders : createInitialTownOrders(todayStr);
}

function asWeatherCondition(value: unknown): WeatherCondition {
  if (typeof value === 'string' && value in WEATHER_META) {
    return value as WeatherCondition;
  }
  return 'clear';
}

function asDialogueCategory(value: unknown): DialogueCategory {
  if (
    value === 'urgent' ||
    value === 'memory' ||
    value === 'special' ||
    value === 'personality' ||
    value === 'time' ||
    value === 'weather' ||
    value === 'daily' ||
    value === 'coop'
  ) {
    return value;
  }
  return 'daily';
}

function asTimePeriodId(value: unknown): TimePeriodId | null {
  if (
    value === 'dawn' ||
    value === 'morning' ||
    value === 'noon' ||
    value === 'afternoon' ||
    value === 'evening' ||
    value === 'night' ||
    value === 'late_night'
  ) {
    return value;
  }
  return null;
}

function asMemoryEventType(value: unknown): PetMemoryEventType | null {
  if (
    value === 'fedFavoriteFood' ||
    value === 'fedDislikedFood' ||
    value === 'petted' ||
    value === 'bathed' ||
    value === 'walked' ||
    value === 'slept' ||
    value === 'newAccessory' ||
    value === 'newRoomItem' ||
    value === 'partnerMessage' ||
    value === 'partnerFed' ||
    value === 'weightLogged' ||
    value === 'stuffed' ||
    value === 'milestone'
  ) {
    return value;
  }
  return null;
}

function parseDialogueResponses(raw: unknown): DialogueResponse[] {
  if (!Array.isArray(raw)) return [];
  const list: DialogueResponse[] = [];
  for (const r of raw) {
    if (!isRecord(r)) continue;
    const id = asString(r.id, '');
    const label = asString(r.label, '');
    if (!id || !label) continue;
    const act = r.actionType;
    const actionType: DialogueResponse['actionType'] =
      act === 'walk' ||
      act === 'feed_pudding' ||
      act === 'feed_meal' ||
      act === 'hug' ||
      act === 'sleep' ||
      act === 'bath'
        ? act
        : 'ack';
    const petAct = r.petAction;
    const petAction: DialogueResponse['petAction'] =
      petAct === 'petted' ||
      petAct === 'opening' ||
      petAct === 'eating' ||
      petAct === 'sleeping' ||
      petAct === 'bathing' ||
      petAct === 'walking' ||
      petAct === 'stuffed'
        ? petAct
        : 'idle';
    const expr = r.expression;
    const expression: DialogueResponse['expression'] =
      expr === 'wink' ||
      expr === 'sparkle' ||
      expr === 'shy' ||
      expr === 'happyTongue' ||
      expr === 'ticklish'
        ? expr
        : 'normal';

    list.push({
      id,
      label,
      emoji: asString(r.emoji, '💬'),
      actionType,
      replyText: asString(r.replyText, ''),
      intimacyGain: Math.max(0, Math.floor(asNumber(r.intimacyGain, 1))),
      moodGain: Math.max(0, Math.floor(asNumber(r.moodGain, 2))),
      petAction,
      expression,
    });
  }
  return list;
}

function parseDialogueLine(raw: unknown): DialogueLine | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id, '');
  const text = asString(raw.text, '');
  if (!id || !text) return null;

  const memType = asMemoryEventType(raw.memoryEventType);
  const tp = asTimePeriodId(raw.timePeriod);

  return {
    id,
    category: asDialogueCategory(raw.category),
    text,
    priority: Math.max(1, Math.min(7, Math.floor(asNumber(raw.priority, 7)))),
    createdAt: asNumber(raw.createdAt, Date.now()),
    memoryEventId: typeof raw.memoryEventId === 'string' ? raw.memoryEventId : undefined,
    memoryEventType: memType ?? undefined,
    timePeriod: tp ?? undefined,
    weatherCondition:
      typeof raw.weatherCondition === 'string'
        ? asWeatherCondition(raw.weatherCondition)
        : undefined,
    responses: parseDialogueResponses(raw.responses),
    respondedId: typeof raw.respondedId === 'string' ? raw.respondedId : null,
    respondedLabel:
      typeof raw.respondedLabel === 'string' ? raw.respondedLabel : undefined,
    isCoopHighlight:
      typeof raw.isCoopHighlight === 'boolean' ? raw.isCoopHighlight : undefined,
    actorId: typeof raw.actorId === 'string' ? raw.actorId : undefined,
  };
}

function parseDialogueState(raw: unknown): DialogueState {
  const todayStr = formatLocalDate();
  const defaults = createInitialDialogueState(todayStr);
  if (!isRecord(raw)) return defaults;

  const rawSettings = isRecord(raw.settings) ? raw.settings : {};
  const rawWeather = isRecord(raw.weather) ? raw.weather : {};
  const weatherCond = asWeatherCondition(rawWeather.condition);
  const weatherFallback = createInitialWeatherState(weatherCond);
  const weatherSeason =
    rawWeather.seasonId === 'spring' ||
    rawWeather.seasonId === 'summer' ||
    rawWeather.seasonId === 'autumn' ||
    rawWeather.seasonId === 'winter'
      ? rawWeather.seasonId
      : getSeasonFromDate();
  const dailyForecast: DailyWeatherForecastItem[] = Array.isArray(rawWeather.dailyForecast)
    ? rawWeather.dailyForecast
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .slice(0, 7)
        .map((item) => {
          const cond = asWeatherCondition(item.condition);
          const itemFallback = createInitialWeatherState(cond);
          return {
            date: asString(item.date, todayStr),
            condition: cond,
            label: asString(item.label, itemFallback.label),
            emoji: asString(item.emoji, itemFallback.emoji),
            tempMaxC: asNumber(item.tempMaxC, 24),
            tempMinC: asNumber(item.tempMinC, 20),
            weatherCode:
              typeof item.weatherCode === 'number' && Number.isFinite(item.weatherCode)
                ? item.weatherCode
                : undefined,
          };
        })
    : [];

  const weather: WeatherState = {
    condition: weatherCond,
    temperatureC: asNumber(rawWeather.temperatureC, weatherFallback.temperatureC),
    label: asString(rawWeather.label, weatherFallback.label),
    emoji: asString(rawWeather.emoji, weatherFallback.emoji),
    source: rawWeather.source === 'api_ready' ? 'api_ready' : 'fixed',
    updatedAt: asNumber(rawWeather.updatedAt, weatherFallback.updatedAt),
    cityId: typeof rawWeather.cityId === 'string' ? rawWeather.cityId : 'quebec',
    cityName: typeof rawWeather.cityName === 'string' ? rawWeather.cityName : '魁北克省',
    locationName:
      typeof rawWeather.locationName === 'string'
        ? rawWeather.locationName
        : typeof rawWeather.cityName === 'string'
        ? rawWeather.cityName
        : '魁北克省',
    nextRefreshAt:
      typeof rawWeather.nextRefreshAt === 'number' && Number.isFinite(rawWeather.nextRefreshAt)
        ? rawWeather.nextRefreshAt
        : undefined,
    lastSyncedOnlineAt:
      typeof rawWeather.lastSyncedOnlineAt === 'number' &&
      Number.isFinite(rawWeather.lastSyncedOnlineAt)
        ? rawWeather.lastSyncedOnlineAt
        : null,
    isOfflineFallback:
      typeof rawWeather.isOfflineFallback === 'boolean' ? rawWeather.isOfflineFallback : false,
    seasonId: weatherSeason,
    mode: rawWeather.mode === 'live' ? 'live' : 'simulated',
    dailyForecast,
  };

  const memoryEvents: PetMemoryEvent[] = Array.isArray(raw.memoryEvents)
    ? raw.memoryEvents
        .filter((ev): ev is Record<string, unknown> => isRecord(ev))
        .map((ev) => {
          const type = asMemoryEventType(ev.type);
          if (!type) return null;
          return {
            id: asString(ev.id, `mem_${Date.now()}`),
            type,
            detail: asString(ev.detail, ''),
            createdAt: asNumber(ev.createdAt, Date.now()),
            dateKey: asString(ev.dateKey, todayStr),
            actorId: typeof ev.actorId === 'string' ? ev.actorId : undefined,
            actorName: typeof ev.actorName === 'string' ? ev.actorName : undefined,
            foodId: typeof ev.foodId === 'string' ? ev.foodId : undefined,
            itemId: typeof ev.itemId === 'string' ? ev.itemId : undefined,
            mentionedAt: typeof ev.mentionedAt === 'number' ? ev.mentionedAt : null,
            isCoopHighlight:
              typeof ev.isCoopHighlight === 'boolean' ? ev.isCoopHighlight : undefined,
          } as PetMemoryEvent;
        })
        .filter((ev): ev is PetMemoryEvent => ev !== null)
        .slice(0, 20)
    : [];

  const history: DialogueLine[] = Array.isArray(raw.history)
    ? raw.history
        .map(parseDialogueLine)
        .filter((line): line is DialogueLine => line !== null)
        .slice(0, 60)
    : [];

  const greetedPeriodsToday = Array.isArray(raw.greetedPeriodsToday)
    ? Array.from(
        new Set(
          raw.greetedPeriodsToday
            .map(asTimePeriodId)
            .filter((p): p is TimePeriodId => p !== null)
        )
      )
    : [];

  const lastUrgentAtByStat: DialogueState['lastUrgentAtByStat'] = {};
  if (isRecord(raw.lastUrgentAtByStat)) {
    const keys: Array<'hunger' | 'mood' | 'cleanliness' | 'energy'> = [
      'hunger',
      'mood',
      'cleanliness',
      'energy',
    ];
    for (const key of keys) {
      const val = raw.lastUrgentAtByStat[key];
      if (typeof val === 'number' && Number.isFinite(val)) {
        lastUrgentAtByStat[key] = val;
      }
    }
  }

  const announcedWeightMilestones = Array.isArray(raw.announcedWeightMilestones)
    ? Array.from(
        new Set(
          raw.announcedWeightMilestones.filter(
            (n): n is number => typeof n === 'number' && Number.isFinite(n)
          )
        )
      )
    : [];

  return syncDialogueDaily(
    {
      activeBubble: parseDialogueLine(raw.activeBubble),
      history,
      memoryEvents,
      settings: {
        muteWeatherChat:
          typeof rawSettings.muteWeatherChat === 'boolean'
            ? rawSettings.muteWeatherChat
            : false,
        muteNightNotice:
          typeof rawSettings.muteNightNotice === 'boolean'
            ? rawSettings.muteNightNotice
            : false,
        muteAllProactive:
          typeof rawSettings.muteAllProactive === 'boolean'
            ? rawSettings.muteAllProactive
            : false,
      },
      weather,
      lastProactiveAt: Math.max(0, asNumber(raw.lastProactiveAt, 0)),
      nextCooldownMs: Math.max(
        60000,
        asNumber(raw.nextCooldownMs, getRandomProactiveCooldownMs())
      ),
      dailyKey: asString(raw.dailyKey, todayStr),
      urgentRemindersToday: Math.max(
        0,
        Math.floor(asNumber(raw.urgentRemindersToday, 0))
      ),
      lastUrgentAtByStat,
      greetedPeriodsToday,
      consecutiveCareDays: Math.max(
        1,
        Math.floor(asNumber(raw.consecutiveCareDays, 1))
      ),
      lastCareDate:
        typeof raw.lastCareDate === 'string' ? raw.lastCareDate : todayStr,
      announcedWeightMilestones,
      lastWeatherDialogueDate:
        typeof raw.lastWeatherDialogueDate === 'string' ? raw.lastWeatherDialogueDate : null,
      lastWeatherDialogueCondition:
        typeof raw.lastWeatherDialogueCondition === 'string'
          ? asWeatherCondition(raw.lastWeatherDialogueCondition)
          : null,
    },
    todayStr
  );
}

function asSeasonIdValue(value: unknown, fallback: SeasonId): SeasonId {
  if (value === 'spring' || value === 'summer' || value === 'autumn' || value === 'winter') {
    return value;
  }
  return fallback;
}

function asSeasonRoomThemeId(value: unknown): SeasonRoomThemeId {
  if (value === 'none') return 'none';
  if (typeof value === 'string' && value in SEASON_ROOM_THEME_BY_ID) {
    return value as SeasonRoomThemeId;
  }
  return 'none';
}

function asSeasonYardThemeId(value: unknown): SeasonYardThemeId {
  if (value === 'none') return 'none';
  if (typeof value === 'string' && value in SEASON_YARD_THEMES) {
    return value as SeasonYardThemeId;
  }
  return 'none';
}

function parseSeasonSystemState(raw: unknown): SeasonSystemState {
  const defaults = createInitialSeasonSystemState();
  if (!isRecord(raw)) return defaults;

  const currentSeason = asSeasonIdValue(raw.currentSeason, defaults.currentSeason);
  const lastKnownSeason = asSeasonIdValue(raw.lastKnownSeason, currentSeason);
  const rawCityId = asString(raw.selectedCityId, DEFAULT_CITY_ID);
  const selectedCityId = WEATHER_CITY_BY_ID[rawCityId] ? rawCityId : DEFAULT_CITY_ID;

  const weatherTasksDate = asString(raw.weatherTasksDate, defaults.weatherTasksDate);
  const weatherTasks: WeatherTask[] = Array.isArray(raw.weatherTasks)
    ? raw.weatherTasks
        .filter((t): t is Record<string, unknown> => isRecord(t))
        .map((t) => {
          const cond = asWeatherCondition(t.weatherCondition);
          const kind = t.kind;
          const validKind: WeatherTask['kind'] =
            kind === 'walk' ||
            kind === 'bath_or_sleep' ||
            kind === 'snow_photo' ||
            kind === 'cooling_food' ||
            kind === 'minigame' ||
            kind === 'soothe_pet' ||
            kind === 'indoor_care'
              ? kind
              : 'indoor_care';
          const target = Math.max(1, Math.floor(asNumber(t.target, 1)));
          const progress = Math.min(target, Math.max(0, Math.floor(asNumber(t.progress, 0))));
          return {
            id: asString(t.id, `wt_${weatherTasksDate}_${validKind}`),
            dateKey: asString(t.dateKey, weatherTasksDate),
            weatherCondition: cond,
            kind: validKind,
            title: asString(t.title, '今日天氣小任務'),
            description: asString(t.description, ''),
            emoji: asString(t.emoji, '🌤️'),
            progress,
            target,
            completed: typeof t.completed === 'boolean' ? t.completed : progress >= target,
            claimed: t.claimed === true,
            rewardCoins: Math.max(0, Math.floor(asNumber(t.rewardCoins, 40))),
            rewardStudioMaterials:
              typeof t.rewardStudioMaterials === 'number'
                ? Math.max(0, Math.floor(t.rewardStudioMaterials))
                : undefined,
            rewardFilterShards:
              typeof t.rewardFilterShards === 'number'
                ? Math.max(0, Math.floor(t.rewardFilterShards))
                : undefined,
            rewardSpeedTickets:
              typeof t.rewardSpeedTickets === 'number'
                ? Math.max(0, Math.floor(t.rewardSpeedTickets))
                : undefined,
            rewardSummary: asString(t.rewardSummary, '+40 金幣'),
          };
        })
    : buildDailyWeatherTasks(weatherTasksDate, 'clear');

  const rawEv = isRecord(raw.seasonEvent) ? raw.seasonEvent : null;
  let seasonEvent: SeasonEvent = defaults.seasonEvent;
  if (rawEv) {
    const startDate = asString(rawEv.startDate, defaults.seasonEvent.startDate);
    const endDate = asString(rawEv.endDate, addDaysToDateKey(startDate, 13));
    const baseEv = createInitialSpringSakuraEvent(startDate, endDate);
    const dailyDate = asString(rawEv.dailyDate, defaults.seasonEvent.dailyDate);

    const templateTasks = buildSakuraDailyTasks();
    const rawTasksArr = Array.isArray(rawEv.dailyTasks) ? rawEv.dailyTasks : [];
    const dailyTasks: SeasonEventTask[] = templateTasks.map((tpl) => {
      const savedTask = rawTasksArr.find((x) => isRecord(x) && x.id === tpl.id);
      if (!isRecord(savedTask)) return tpl;
      const progress = Math.min(tpl.target, Math.max(0, Math.floor(asNumber(savedTask.progress, 0))));
      return {
        ...tpl,
        progress,
        completed: typeof savedTask.completed === 'boolean' ? savedTask.completed : progress >= tpl.target,
        claimed: savedTask.claimed === true,
      };
    });

    const rawCoop = isRecord(rawEv.coopTask) ? rawEv.coopTask : null;
    const baseCoop = baseEv.coopTask!;
    const coopTask: SeasonEventCoopTask | null = rawCoop
      ? {
          id: asString(rawCoop.id, `sakura_coop_${dailyDate}`),
          dateKey: asString(rawCoop.dateKey, dailyDate),
          title: baseCoop.title,
          description: baseCoop.description,
          picnicFoodCount: Math.min(
            baseCoop.picnicFoodTarget,
            Math.max(0, Math.floor(asNumber(rawCoop.picnicFoodCount, 0)))
          ),
          picnicFoodTarget: baseCoop.picnicFoodTarget,
          photoCount: Math.min(
            baseCoop.photoTarget,
            Math.max(0, Math.floor(asNumber(rawCoop.photoCount, 0)))
          ),
          photoTarget: baseCoop.photoTarget,
          contributorUserIds: Array.isArray(rawCoop.contributorUserIds)
            ? rawCoop.contributorUserIds.filter((id): id is string => typeof id === 'string')
            : [],
          completed: rawCoop.completed === true,
          claimedByUserIds: Array.isArray(rawCoop.claimedByUserIds)
            ? rawCoop.claimedByUserIds.filter((id): id is string => typeof id === 'string')
            : [],
          rewardTickets: baseCoop.rewardTickets,
          rewardCoins: baseCoop.rewardCoins,
        }
      : baseCoop;

    const validShopIds = new Set(SAKURA_PICNIC_SHOP_ITEMS.map((i) => i.id));
    const purchasedShopItemIds = Array.isArray(rawEv.purchasedShopItemIds)
      ? Array.from(
          new Set(
            rawEv.purchasedShopItemIds.filter(
              (id): id is string => typeof id === 'string' && validShopIds.has(id)
            )
          )
        )
      : [];

    const evId: SeasonEventId = 'spring_sakura_picnic';
    const evStatus: SeasonEvent['status'] =
      rawEv.status === 'ended' ? 'ended' : rawEv.status === 'reserved' ? 'reserved' : 'active';

    seasonEvent = {
      ...baseEv,
      eventId: evId,
      status: evStatus,
      ticketBalance: Math.max(0, Math.floor(asNumber(rawEv.ticketBalance, baseEv.ticketBalance))),
      ticketTotalEarned: Math.max(
        0,
        Math.floor(asNumber(rawEv.ticketTotalEarned, baseEv.ticketTotalEarned))
      ),
      dailyDate,
      dailyTasks,
      purchasedShopItemIds,
      coopTask,
    };
  }

  let offlineSummary: SeasonOfflineSummary | null = null;
  if (isRecord(raw.offlineSummary)) {
    offlineSummary = {
      dateKey: asString(raw.offlineSummary.dateKey, defaults.weatherTasksDate),
      seasonId: asSeasonIdValue(raw.offlineSummary.seasonId, currentSeason),
      weatherCondition: asWeatherCondition(raw.offlineSummary.weatherCondition),
      weatherLabel: asString(raw.offlineSummary.weatherLabel, '晴天'),
      cityName: asString(raw.offlineSummary.cityName, '魁北克省'),
      isOffline: raw.offlineSummary.isOffline === true,
      summaryText: asString(raw.offlineSummary.summaryText, ''),
    };
  }

  return {
    currentSeason,
    lastKnownSeason,
    seasonNoticePending: raw.seasonNoticePending === true,
    selectedCityId,
    roomThemeOverride: asSeasonRoomThemeId(raw.roomThemeOverride),
    yardThemeOverride: asSeasonYardThemeId(raw.yardThemeOverride),
    weatherTasksDate,
    weatherTasks,
    seasonEvent,
    offlineSummary,
  };
}

function asPetUnlockRuleType(value: unknown): PetUnlockRuleType {
  if (
    value === 'starter' ||
    value === 'slot_unlock' ||
    value === 'minigames_count' ||
    value === 'visitors_hosted' ||
    value === 'town_orders_completed' ||
    value === 'future_festival' ||
    value === 'future_coop'
  ) {
    return value;
  }
  return 'starter';
}

function parsePetBirthday(raw: unknown): BirthdayConfig | undefined {
  if (!isRecord(raw)) return undefined;
  if (typeof raw.month !== 'number' || typeof raw.day !== 'number') return undefined;
  const clamped = clampBirthdayDay(raw.month, raw.day);
  return {
    month: clamped.month,
    day: clamped.day,
    leapYearChoice: raw.leapYearChoice === 'feb28' ? 'feb28' : 'mar1',
    updatedAt: asNumber(raw.updatedAt, Date.now()),
    customized: raw.customized === true,
  };
}

function parseBirthdaySystemState(raw: unknown): BirthdaySystemState {
  const defaults = createInitialBirthdaySystemState();
  if (!isRecord(raw)) return defaults;

  const rawTickets = isRecord(raw.tickets) ? raw.tickets : {};
  const rawPantry = isRecord(raw.pantry) ? raw.pantry : {};

  const validBases: BirthdayCakeBase[] = ['sponge', 'chocolate', 'carrot', 'ice_cream'];
  const validCreams: BirthdayCakeCream[] = ['strawberry', 'vanilla', 'chocolate', 'mint'];
  const validDecors: BirthdayCakeDecor[] = ['strawberry', 'candle', 'sprinkles', 'flags', 'heart'];

  const cakes: BirthdayCake[] = Array.isArray(raw.cakes)
    ? raw.cakes
        .filter((c): c is Record<string, unknown> => isRecord(c))
        .map((c) => {
          const typeIdRaw = asString(c.cakeTypeId, 'custom');
          const cakeTypeId: BirthdayCakeId | 'custom' =
            typeIdRaw !== 'custom' && typeIdRaw in BIRTHDAY_CAKE_BY_ID
              ? (typeIdRaw as BirthdayCakeId)
              : 'custom';
          const base = validBases.includes(c.base as BirthdayCakeBase)
            ? (c.base as BirthdayCakeBase)
            : 'sponge';
          const cream = validCreams.includes(c.cream as BirthdayCakeCream)
            ? (c.cream as BirthdayCakeCream)
            : 'strawberry';
          const decors = Array.isArray(c.decors)
            ? Array.from(
                new Set(
                  c.decors.filter((d): d is BirthdayCakeDecor =>
                    validDecors.includes(d as BirthdayCakeDecor)
                  )
                )
              )
            : (['candle'] as BirthdayCakeDecor[]);
          const placedIn: 'room' | 'yard' | null =
            c.placedIn === 'room' || c.placedIn === 'yard' ? c.placedIn : null;
          return {
            id: asString(c.id, `bcake_${Date.now()}`),
            cakeTypeId,
            name: asString(c.name, '生日蛋糕'),
            emoji: asString(c.emoji, '🎂'),
            base,
            cream,
            decors,
            plaqueText: asString(c.plaqueText, '生日快樂！'),
            moodBonus: Math.max(0, Math.floor(asNumber(c.moodBonus, 20))),
            intimacyBonus: Math.max(0, Math.floor(asNumber(c.intimacyBonus, 5))),
            petId: asString(c.petId, 'pet_1'),
            createdAt: asNumber(c.createdAt, Date.now()),
            placedIn,
            eaten: c.eaten === true,
          };
        })
        .slice(0, 24)
    : [];

  const reservedCakeByPetId: Record<string, BirthdayCakeId> = {};
  if (isRecord(raw.reservedCakeByPetId)) {
    for (const [k, v] of Object.entries(raw.reservedCakeByPetId)) {
      if (typeof v === 'string' && v in BIRTHDAY_CAKE_BY_ID) {
        reservedCakeByPetId[k] = v as BirthdayCakeId;
      }
    }
  }

  const ownedGiftIds = Array.isArray(raw.ownedGiftIds)
    ? Array.from(
        new Set(
          raw.ownedGiftIds.filter(
            (id): id is BirthdayGiftId => typeof id === 'string' && id in BIRTHDAY_GIFT_BY_ID
          )
        )
      )
    : [];

  const asRoomDecorList = (val: unknown): BirthdayDecorationId[] =>
    Array.isArray(val)
      ? Array.from(
          new Set(
            val.filter(
              (id): id is BirthdayDecorationId =>
                typeof id === 'string' &&
                id in BIRTHDAY_DECORATION_BY_ID &&
                BIRTHDAY_DECORATION_BY_ID[id as BirthdayDecorationId].target === 'room'
            )
          )
        )
      : [];

  const asYardDecorList = (val: unknown): BirthdayDecorationId[] =>
    Array.isArray(val)
      ? Array.from(
          new Set(
            val.filter(
              (id): id is BirthdayDecorationId =>
                typeof id === 'string' &&
                id in BIRTHDAY_DECORATION_BY_ID &&
                BIRTHDAY_DECORATION_BY_ID[id as BirthdayDecorationId].target === 'yard'
            )
          )
        )
      : [];

  const cards: BirthdayCard[] = Array.isArray(raw.cards)
    ? raw.cards
        .filter((c): c is Record<string, unknown> => isRecord(c))
        .map((c) => ({
          id: asString(c.id, `bcard_${Date.now()}`),
          petId: asString(c.petId, 'pet_1'),
          petName: asString(c.petName, '布丁'),
          yearKey: asString(c.yearKey, ''),
          birthdayDateLabel: asString(c.birthdayDateLabel, ''),
          blessings: Array.isArray(c.blessings)
            ? c.blessings
                .filter((b): b is Record<string, unknown> => isRecord(b))
                .map((b) => ({
                  userId: asString(b.userId, 'local'),
                  userName: asString(b.userName, '飼主'),
                  text: asString(b.text, ''),
                  createdAt: asNumber(b.createdAt, Date.now()),
                }))
                .filter((b) => Boolean(b.text))
            : [],
          stickers: Array.isArray(c.stickers)
            ? c.stickers.filter(
                (s): s is PhotoStickerId => typeof s === 'string' && s in PHOTO_STICKER_BY_ID
              )
            : [],
          completed: c.completed === true,
          savedToMemories: c.savedToMemories === true,
          sharedToBoard: c.sharedToBoard === true,
          createdAt: asNumber(c.createdAt, Date.now()),
        }))
        .slice(0, 24)
    : [];

  const dailyDate = asString(raw.dailyDate, defaults.dailyDate);
  const templateTasks = buildDailyBirthdayTasks(dailyDate);
  const rawTasks = Array.isArray(raw.tasks) ? raw.tasks : [];
  const tasks: BirthdayTask[] = templateTasks.map((tpl) => {
    const saved = rawTasks.find((t) => isRecord(t) && t.id === tpl.id);
    if (!isRecord(saved)) return tpl;
    const progress = Math.min(tpl.target, Math.max(0, Math.floor(asNumber(saved.progress, 0))));
    return {
      ...tpl,
      progress,
      completed: typeof saved.completed === 'boolean' ? saved.completed : progress >= tpl.target,
      claimed: saved.claimed === true,
    };
  });

  const templateOrders = buildDailyBirthdayOrders(dailyDate);
  const rawOrders = Array.isArray(raw.orders) ? raw.orders : [];
  const orders: BirthdayOrder[] = templateOrders.map((tpl) => {
    const saved = rawOrders.find((o) => isRecord(o) && o.id === tpl.id);
    if (!isRecord(saved)) return tpl;
    const progress = Math.min(tpl.target, Math.max(0, Math.floor(asNumber(saved.progress, 0))));
    return {
      ...tpl,
      progress,
      completed: typeof saved.completed === 'boolean' ? saved.completed : progress >= tpl.target,
      claimed: saved.claimed === true,
    };
  });

  const birthdayPhotosByYearKey: Record<string, string[]> = {};
  if (isRecord(raw.birthdayPhotosByYearKey)) {
    for (const [k, v] of Object.entries(raw.birthdayPhotosByYearKey)) {
      if (Array.isArray(v)) {
        birthdayPhotosByYearKey[k] = v.filter((id): id is string => typeof id === 'string');
      }
    }
  }

  return {
    tickets: {
      balance: Math.max(0, Math.floor(asNumber(rawTickets.balance, 0))),
      totalEarned: Math.max(0, Math.floor(asNumber(rawTickets.totalEarned, 0))),
    },
    pantry: {
      cream: Math.max(0, Math.floor(asNumber(rawPantry.cream, 1))),
      sugar: Math.max(0, Math.floor(asNumber(rawPantry.sugar, 1))),
      iceCream: Math.max(0, Math.floor(asNumber(rawPantry.iceCream, 0))),
    },
    cakes,
    reservedCakeByPetId,
    unlockedLimitedCakeRecipe: raw.unlockedLimitedCakeRecipe === true,
    ownedGiftIds,
    giftBoxesOpenedCount: Math.max(0, Math.floor(asNumber(raw.giftBoxesOpenedCount, 0))),
    ownedRoomDecorIds: asRoomDecorList(raw.ownedRoomDecorIds),
    activeRoomDecorIds: asRoomDecorList(raw.activeRoomDecorIds),
    ownedYardDecorIds: asYardDecorList(raw.ownedYardDecorIds),
    activeYardDecorIds: asYardDecorList(raw.activeYardDecorIds),
    placedCakeId: typeof raw.placedCakeId === 'string' ? raw.placedCakeId : null,
    cards,
    dailyDate,
    dailyLoginTicketDate:
      typeof raw.dailyLoginTicketDate === 'string' ? raw.dailyLoginTicketDate : null,
    birthdayDayLoginAwardedKeys: Array.isArray(raw.birthdayDayLoginAwardedKeys)
      ? raw.birthdayDayLoginAwardedKeys.filter((k): k is string => typeof k === 'string')
      : [],
    tasks,
    orders,
    purchasedShopItemIds: Array.isArray(raw.purchasedShopItemIds)
      ? Array.from(
          new Set(raw.purchasedShopItemIds.filter((id): id is string => typeof id === 'string'))
        )
      : [],
    unlockedBirthdayStudioKeys: Array.isArray(raw.unlockedBirthdayStudioKeys)
      ? Array.from(
          new Set(
            raw.unlockedBirthdayStudioKeys.filter((k): k is string => typeof k === 'string')
          )
        )
      : [],
    birthdayPhotosByYearKey,
    celebratedYearKeys: Array.isArray(raw.celebratedYearKeys)
      ? Array.from(
          new Set(raw.celebratedYearKeys.filter((k): k is string => typeof k === 'string'))
        )
      : [],
    lastCountdownToastKey:
      typeof raw.lastCountdownToastKey === 'string' ? raw.lastCountdownToastKey : null,
  };
}

function parseSinglePet(
  raw: Record<string, unknown>,
  fallbackId: string,
  fallbackSpecies: PetSpecies = 'pig',
  fallbackTopPersonality?: unknown,
  defaultShared = false
): Pet {
  const species = asSpecies(raw.species ?? fallbackSpecies);
  const growth = asNumber(raw.growth, 0);
  const defaultWeight = getDefaultWeightForSpecies(species);
  const petPersonality = parsePetPersonality(
    raw.personality ?? fallbackTopPersonality,
    species
  );
  const isFirstShared = defaultShared || raw.id === 'pet_1' || raw.isSharedCoopPet === true;

  return {
    id: asString(raw.id, fallbackId),
    name: asString(raw.name, '布丁'),
    species,
    level: getGrowthStage(growth).level,
    growth,
    intimacy: Math.max(0, asNumber(raw.intimacy, 10)),
    hunger: clampStat(asNumber(raw.hunger, 72)),
    mood: clampStat(asNumber(raw.mood, 82)),
    cleanliness: clampStat(asNumber(raw.cleanliness, 88)),
    energy: clampStat(asNumber(raw.energy, 85)),
    weight: clampWeight(asNumber(raw.weight, defaultWeight)),
    roundness: clampStat(asNumber(raw.roundness, 28)),
    accessories: parseAccessoriesRecord(
      raw.accessories,
      isFirstShared
        ? { head: 'pink_bow', face: null, neck: null, body: null, held: null, back: null }
        : { head: null, face: null, neck: null, body: null, held: null, back: null }
    ),
    hatched: typeof raw.hatched === 'boolean' ? raw.hatched : true,
    consecutiveFastFood: asNumber(raw.consecutiveFastFood, 0),
    personality: petPersonality,
    preference: PET_PREFERENCES[species] ?? PET_PREFERENCES.pig,
    ownerId: typeof raw.ownerId === 'string' ? raw.ownerId : 'local',
    isSharedCoopPet: isFirstShared,
    adoptedAt: asNumber(raw.adoptedAt, Date.now()),
    source: asPetUnlockRuleType(raw.source),
    birthday: parsePetBirthday(raw.birthday),
  };
}

function parseFamilyDailyTasks(raw: unknown, tasksDate?: string): FamilyDailyTask[] {
  const fallback = createInitialFamilyDailyTasks(tasksDate || formatLocalDate());
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  const tplById = new Map(FAMILY_DAILY_TASK_TEMPLATES.map((t) => [t.id, t]));
  const parsed: FamilyDailyTask[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!isRecord(item) || typeof item.id !== 'string' || seen.has(item.id)) continue;
    const tpl = tplById.get(item.id as FamilyDailyTask['id']);
    if (!tpl) continue;
    seen.add(item.id);
    const progress = Math.min(tpl.target, Math.max(0, asNumber(item.progress, 0)));
    parsed.push({
      ...tpl,
      reward: { ...tpl.reward },
      progress,
      completed: typeof item.completed === 'boolean' ? item.completed : progress >= tpl.target,
      claimed: typeof item.claimed === 'boolean' ? item.claimed : false,
    });
  }
  return parsed.length > 0 ? parsed : fallback;
}

function migrateLegacyV1(raw: Record<string, unknown>): GameState {
  const base = createInitialGameState();
  const basePet = base.pets[0];
  const now = Date.now();
  const rawPet = isRecord(raw.pet) ? raw.pet : {};
  const rawStats = isRecord(rawPet.stats) ? rawPet.stats : {};
  const growth = asNumber(rawPet.growth, basePet.growth);
  const lastSavedAt = asNumber(raw.lastUpdatedAt, now);

  let pet: Pet = {
    id: 'pet_1',
    name: asString(rawPet.name, basePet.name),
    species: 'pig',
    level: getGrowthStage(growth).level,
    growth,
    intimacy: clampStat(asNumber(rawPet.intimacy, basePet.intimacy), 0, 99999),
    hunger: clampStat(asNumber(rawStats.satiety, basePet.hunger)),
    mood: clampStat(asNumber(rawStats.mood, basePet.mood)),
    cleanliness: clampStat(asNumber(rawStats.cleanliness, basePet.cleanliness)),
    energy: clampStat(asNumber(rawStats.energy, basePet.energy)),
    weight: clampWeight(asNumber(rawPet.weight, basePet.weight)),
    roundness: clampStat(asNumber(rawPet.chubbiness, basePet.roundness)),
    accessories: parseAccessoriesRecord(rawPet.equipped, basePet.accessories),
    hatched: typeof rawPet.hatched === 'boolean' ? rawPet.hatched : false,
    consecutiveFastFood: asNumber(rawPet.consecutiveFastFood, 0),
    personality: createInitialPetPersonality('pig'),
    preference: PET_PREFERENCES.pig,
    ownerId: 'local',
    isSharedCoopPet: true,
    adoptedAt: now,
    source: 'starter',
  };

  if (pet.hatched) {
    pet = applyTimeDecay(pet, now - lastSavedAt);
  }

  const rawUnlocked = Array.isArray(raw.unlockedAccessories)
    ? raw.unlockedAccessories.filter((x): x is string => typeof x === 'string')
    : [];

  const legacyQuests = isRecord(raw.dailyQuests) ? raw.dailyQuests : {};
  const legacyDate = asString(legacyQuests.dateStr, formatLocalDate());
  const legacyProgress = isRecord(legacyQuests.progress) ? legacyQuests.progress : {};
  const legacyClaimed = isRecord(legacyQuests.claimed) ? legacyQuests.claimed : {};

  const migratedTasks: DailyTask[] = createInitialDailyTasks().map((task) => {
    const progress = Math.min(task.target, asNumber(legacyProgress[task.id], 0));
    const rawClaimed = legacyClaimed[task.id];
    return {
      ...task,
      progress,
      completed: progress >= task.target,
      claimed: typeof rawClaimed === 'boolean' ? rawClaimed : false,
    };
  });

  const syncedTasks = syncDailyTasks(migratedTasks, legacyDate);
  const todayStr = formatLocalDate();

  return {
    version: 2,
    pets: [pet],
    activePetId: pet.id,
    coins: asNumber(raw.coins, base.coins),
    furnitureShards: 0,
    foods: parseStringNumberRecord(raw.foodInventory, base.foods),
    ingredients: createInitialIngredients(),
    farmPlots: createInitialFarmPlots(4),
    yardMoodBuffPeriods: [],
    accessories: Array.from(new Set([...INITIAL_UNLOCKED_ACCESSORIES, ...rawUnlocked])),
    weightLogs: parseWeightLogs(raw.records),
    feedLogs: [],
    dailyTasks: syncedTasks.dailyTasks,
    dailyTasksDate: syncedTasks.dailyTasksDate,
    familyDailyTasks: createInitialFamilyDailyTasks(todayStr),
    familyDailyTasksDate: todayStr,
    claimedPetSlots: [1],
    completedTownOrdersCount: 0,
    reservedSpecialPets: [...RESERVED_SPECIAL_PETS],
    messages: [],
    soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : true,
    lastSavedAt: now,
    noviceGrowth: createInitialNoviceGrowthStats(todayStr),
    encyclopedia: createInitialEncyclopediaState(),
    unlockedBackgrounds: ['default'],
    activeBackground: 'default',
    minigameHub: createInitialMinigameHubState(),
    house: createInitialSharedHouse(),
    personality: pet.personality ?? createInitialPetPersonality('pig'),
    coop: createInitialCoopHubState(todayStr),
    dialogue: createInitialDialogueState(todayStr),
    memoryAlbum: createInitialMemoryAlbumState(pet.name),
    filterShards: 0,
    photoStudio: createInitialPhotoStudioState(),
    seasonalEvent: createInitialSeasonalEvent(),
    townMap: createInitialTownMapState(),
    seasonSystem: createInitialSeasonSystemState(),
    birthdaySystem: createInitialBirthdaySystemState(),
  };
}

function asMemoryType(value: unknown): MemoryType | null {
  if (typeof value === 'string' && value in MEMORY_TYPE_META) {
    return value as MemoryType;
  }
  return null;
}

function asPhotoPoseOption(value: unknown): PhotoPose | null {
  if (typeof value === 'string' && value in PHOTO_POSE_BY_ID) {
    return value as PhotoPose;
  }
  return null;
}

function asPhotoFrameOption(value: unknown): PhotoFrame | null {
  if (typeof value === 'string' && value in PHOTO_FRAME_BY_ID) {
    return value as PhotoFrame;
  }
  return null;
}

function parseMemoryAlbum(raw: unknown, petName: string): MemoryAlbumState {
  const defaults = createInitialMemoryAlbumState(petName);
  if (!isRecord(raw)) return defaults;

  const memories: MemoryEntry[] = Array.isArray(raw.memories)
    ? raw.memories
        .filter((m): m is Record<string, unknown> => isRecord(m))
        .map((m) => {
          const type = asMemoryType(m.type);
          if (!type) return null;
          return {
            id: asString(m.id, `mem_${Date.now()}`),
            uniqueKey: typeof m.uniqueKey === 'string' ? m.uniqueKey : undefined,
            petId: typeof m.petId === 'string' ? m.petId : undefined,
            type,
            title: asString(m.title, '幸福回憶'),
            description: asString(m.description, ''),
            dateKey: asString(m.dateKey, formatLocalDate()),
            createdAt: asNumber(m.createdAt, Date.now()),
            emoji: asString(m.emoji, MEMORY_TYPE_META[type].emoji),
            photoId: typeof m.photoId === 'string' ? m.photoId : undefined,
            accessoryId: typeof m.accessoryId === 'string' ? m.accessoryId : undefined,
            foodId: typeof m.foodId === 'string' ? m.foodId : undefined,
            weight: typeof m.weight === 'number' ? m.weight : undefined,
            level: typeof m.level === 'number' ? m.level : undefined,
            dialogueText: typeof m.dialogueText === 'string' ? m.dialogueText : undefined,
            actorName: typeof m.actorName === 'string' ? m.actorName : undefined,
            isShared: typeof m.isShared === 'boolean' ? m.isShared : undefined,
          } as MemoryEntry;
        })
        .filter((m): m is MemoryEntry => m !== null)
        .slice(0, 180)
    : [];

  const favoriteMemoryIds = Array.isArray(raw.favoriteMemoryIds)
    ? Array.from(
        new Set(raw.favoriteMemoryIds.filter((id): id is string => typeof id === 'string'))
      )
    : [];

  const rawMilestonesMap = new Map<GameMilestoneId, Record<string, unknown>>();
  if (Array.isArray(raw.milestones)) {
    for (const item of raw.milestones) {
      if (isRecord(item) && typeof item.id === 'string') {
        rawMilestonesMap.set(item.id as GameMilestoneId, item);
      }
    }
  }
  const milestones: Milestone[] = MILESTONE_DEFINITIONS.map((def) => {
    const saved = rawMilestonesMap.get(def.id);
    const unlocked = saved && typeof saved.unlocked === 'boolean' ? saved.unlocked : false;
    return {
      ...def,
      unlocked,
      unlockedAt:
        unlocked && saved && typeof saved.unlockedAt === 'number' ? saved.unlockedAt : null,
      unlockedDateKey:
        unlocked && saved && typeof saved.unlockedDateKey === 'string'
          ? saved.unlockedDateKey
          : null,
    };
  });

  const rawSharedMap = new Map<SharedMemoryKey, Record<string, unknown>>();
  if (Array.isArray(raw.sharedMemories)) {
    for (const item of raw.sharedMemories) {
      if (isRecord(item) && typeof item.key === 'string') {
        rawSharedMap.set(item.key as SharedMemoryKey, item);
      }
    }
  }
  const sharedMemories: SharedMemory[] = SHARED_MEMORY_DEFINITIONS.map((def) => {
    const saved = rawSharedMap.get(def.key);
    const unlocked = saved && typeof saved.unlocked === 'boolean' ? saved.unlocked : false;
    return {
      id: `smem_${def.key}`,
      key: def.key,
      title: def.title,
      description: def.description,
      emoji: def.emoji,
      unlocked,
      createdAt:
        unlocked && saved && typeof saved.createdAt === 'number' ? saved.createdAt : null,
      dateKey:
        unlocked && saved && typeof saved.dateKey === 'string' ? saved.dateKey : null,
      petName: saved ? asString(saved.petName, petName) : petName,
      actors:
        saved && Array.isArray(saved.actors)
          ? Array.from(new Set(saved.actors.filter((a): a is string => typeof a === 'string')))
          : [],
      rewardCoins: def.rewardCoins,
      rewardIntimacy: def.rewardIntimacy,
      rewardCardTitle: def.rewardCardTitle,
      notifiedUserIds:
        saved && Array.isArray(saved.notifiedUserIds)
          ? Array.from(
              new Set(saved.notifiedUserIds.filter((u): u is string => typeof u === 'string'))
            )
          : [],
    };
  });

  const monthlyRecaps: MonthlyRecap[] = Array.isArray(raw.monthlyRecaps)
    ? raw.monthlyRecaps
        .filter((r): r is Record<string, unknown> => isRecord(r))
        .map((r) => ({
          id: asString(r.id, `recap_${Date.now()}`),
          monthKey: asString(r.monthKey, ''),
          createdAt: asNumber(r.createdAt, Date.now()),
          generatedDateKey: asString(r.generatedDateKey, formatLocalDate()),
          favoriteFoodId: asNullableString(r.favoriteFoodId),
          favoriteFoodName: asString(r.favoriteFoodName, '等待餵食'),
          topInteractionLabel: asString(r.topInteractionLabel, '陪伴互動'),
          favoriteAccessoryId: asNullableString(r.favoriteAccessoryId),
          favoriteAccessoryName: asString(r.favoriteAccessoryName, '尚未穿戴配件'),
          weightDelta: asNumber(r.weightDelta, 0),
          growthGained: Math.max(0, Math.floor(asNumber(r.growthGained, 0))),
          coopMessagesCount: Math.max(0, Math.floor(asNumber(r.coopMessagesCount, 0))),
          coopTasksCount: Math.max(0, Math.floor(asNumber(r.coopTasksCount, 0))),
          bestPhotoId: asNullableString(r.bestPhotoId),
          coverPhotoId: asNullableString(r.coverPhotoId),
          savedToAlbum: typeof r.savedToAlbum === 'boolean' ? r.savedToAlbum : false,
        }))
        .filter((r) => Boolean(r.monthKey))
        .slice(0, 12)
    : [];

  const monthlyTrackers: Record<string, MonthlyActivityTracker> = {};
  if (isRecord(raw.monthlyTrackers)) {
    for (const [key, val] of Object.entries(raw.monthlyTrackers)) {
      if (!isRecord(val)) continue;
      monthlyTrackers[key] = {
        monthKey: asString(val.monthKey, key),
        foodCounts: parseStringNumberRecord(val.foodCounts, {}),
        interactionCounts: parseStringNumberRecord(val.interactionCounts, {}),
        accessoryCounts: parseStringNumberRecord(val.accessoryCounts, {}),
        startWeight: typeof val.startWeight === 'number' ? val.startWeight : null,
        endWeight: typeof val.endWeight === 'number' ? val.endWeight : null,
        growthGained: Math.max(0, Math.floor(asNumber(val.growthGained, 0))),
        coopMessagesCount: Math.max(0, Math.floor(asNumber(val.coopMessagesCount, 0))),
        coopTasksCount: Math.max(0, Math.floor(asNumber(val.coopTasksCount, 0))),
      };
    }
  }

  const unlockedPhotoPoses = Array.isArray(raw.unlockedPhotoPoses)
    ? Array.from(
        new Set(
          raw.unlockedPhotoPoses
            .map(asPhotoPoseOption)
            .filter((p): p is PhotoPose => p !== null)
        )
      )
    : [];

  const unlockedPhotoFrames = Array.isArray(raw.unlockedPhotoFrames)
    ? Array.from(
        new Set(
          raw.unlockedPhotoFrames
            .map(asPhotoFrameOption)
            .filter((f): f is PhotoFrame => f !== null)
        )
      )
    : [];

  const savedDialogueIds = Array.isArray(raw.savedDialogueIds)
    ? Array.from(
        new Set(raw.savedDialogueIds.filter((id): id is string => typeof id === 'string'))
      ).slice(0, 80)
    : [];

  return {
    memories,
    favoriteMemoryIds,
    milestones,
    sharedMemories,
    sharedRoomStartedDate:
      typeof raw.sharedRoomStartedDate === 'string' ? raw.sharedRoomStartedDate : null,
    sharedRoomId: typeof raw.sharedRoomId === 'string' ? raw.sharedRoomId : null,
    monthlyRecaps,
    monthlyTrackers,
    unlockedPhotoPoses,
    unlockedPhotoFrames,
    savedDialogueIds,
  };
}

export function normalizeGameState(parsed: unknown): GameState | null {
  if (!isRecord(parsed)) return null;
  const base = createInitialGameState();
  const basePet = base.pets[0];
  const now = Date.now();
  const lastSavedAt = asNumber(parsed.lastSavedAt, now);

  let pets: Pet[] = [];
  if (Array.isArray(parsed.pets) && parsed.pets.length > 0) {
    const seenIds = new Set<string>();
    parsed.pets.forEach((item, idx) => {
      if (!isRecord(item)) return;
      const p = parseSinglePet(
        item,
        idx === 0 ? 'pet_1' : `pet_${idx + 1}`,
        'pig',
        idx === 0 ? parsed.personality : undefined,
        idx === 0
      );
      if (seenIds.has(p.id)) return;
      seenIds.add(p.id);
      pets.push(p.hatched ? applyTimeDecay(p, now - lastSavedAt) : p);
    });
  }

  if (pets.length === 0) {
    const rawPet = isRecord(parsed.pet) ? parsed.pet : {};
    const legacyPet = parseSinglePet(
      {
        ...rawPet,
        hatched: typeof rawPet.hatched === 'boolean' ? rawPet.hatched : false,
      },
      basePet.id,
      'pig',
      parsed.personality,
      true
    );
    pets = [legacyPet.hatched ? applyTimeDecay(legacyPet, now - lastSavedAt) : legacyPet];
  }

  const requestedActiveId = typeof parsed.activePetId === 'string' ? parsed.activePetId : '';
  const activePetId = pets.some((p) => p.id === requestedActiveId)
    ? requestedActiveId
    : pets[0].id;
  const activePet = pets.find((p) => p.id === activePetId) ?? pets[0];

  const rawUnlocked = Array.isArray(parsed.accessories)
    ? parsed.accessories.filter((x): x is string => typeof x === 'string')
    : [];

  const parsedTasksDate = asString(parsed.dailyTasksDate, formatLocalDate());
  const syncedTasks = syncDailyTasks(
    parseDailyTasks(parsed.dailyTasks, parsedTasksDate),
    parsedTasksDate
  );

  const parsedFamilyTasksDate = asString(parsed.familyDailyTasksDate, formatLocalDate());
  const syncedFamilyTasks = syncFamilyDailyTasks(
    parseFamilyDailyTasks(parsed.familyDailyTasks, parsedFamilyTasksDate),
    parsedFamilyTasksDate
  );

  const claimedPetSlots = Array.isArray(parsed.claimedPetSlots)
    ? Array.from(
        new Set<number>([
          1,
          ...parsed.claimedPetSlots.filter(
            (n): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 6
          ),
        ])
      ).sort((a, b) => a - b)
    : [1];

  const parsedWeightLogs = parseWeightLogs(parsed.weightLogs);
  const parsedFeedLogs = parseFeedLogs(parsed.feedLogs);
  const mergedAccessories = Array.from(
    new Set([...INITIAL_UNLOCKED_ACCESSORIES, ...rawUnlocked])
  );
  const seedClaimedDailyCount = syncedTasks.dailyTasks.filter((t) => t.claimed).length;
  const seedWeightCount = parsedWeightLogs.filter((w) => w.foodName === '手動紀錄').length;
  const seedFoodIds = parsedFeedLogs.map((l) => l.foodId);
  const unlockedBackgrounds = parseStageBackgrounds(parsed.unlockedBackgrounds);
  const requestedBg = asStageBackgroundId(parsed.activeBackground);
  const activeBackground = unlockedBackgrounds.includes(requestedBg) ? requestedBg : 'default';
  const parsedHouse = parseSharedHouse(parsed.house);
  const yardMoodBuffPeriods = Array.isArray(parsed.yardMoodBuffPeriods)
    ? parsed.yardMoodBuffPeriods.slice(-100).flatMap((value) => {
        if (!isRecord(value)) return [];
        const startedAt = asNumber(value.startedAt, Number.NaN);
        const expiresAt = asNumber(value.expiresAt, Number.NaN);
        return Number.isFinite(startedAt) && expiresAt > startedAt
          ? [{ startedAt, expiresAt }]
          : [];
      })
    : [];

  const noviceGrowth = parseNoviceGrowth(
    parsed.noviceGrowth,
    formatLocalDate(),
    parsedFeedLogs.length,
    seedWeightCount,
    mergedAccessories.length,
    seedClaimedDailyCount
  );

  const draft: GameState = {
    version: 2,
    pets,
    activePetId,
    coins: asNumber(parsed.coins, base.coins),
    furnitureShards: Math.max(0, Math.floor(asNumber(parsed.furnitureShards, 0))),
    foods: parseStringNumberRecord(parsed.foods, base.foods),
    ingredients: parseIngredients(parsed.ingredients, base.ingredients),
    farmPlots: parseFarmPlots(parsed.farmPlots, parsedHouse.unlockedFarmPlots),
    yardMoodBuffPeriods,
    accessories: mergedAccessories,
    weightLogs: parsedWeightLogs,
    feedLogs: parsedFeedLogs,
    dailyTasks: syncedTasks.dailyTasks,
    dailyTasksDate: syncedTasks.dailyTasksDate,
    familyDailyTasks: syncedFamilyTasks.familyDailyTasks,
    familyDailyTasksDate: syncedFamilyTasks.familyDailyTasksDate,
    claimedPetSlots,
    completedTownOrdersCount: Math.max(
      0,
      Math.floor(asNumber(parsed.completedTownOrdersCount, 0))
    ),
    reservedSpecialPets: [...RESERVED_SPECIAL_PETS],
    messages: parsePetMessages(parsed.messages),
    soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
    lastSavedAt: now,
    noviceGrowth,
    encyclopedia: parseEncyclopedia(parsed.encyclopedia, seedFoodIds, noviceGrowth.cookedCount),
    unlockedBackgrounds,
    activeBackground,
    minigameHub: parseMinigameHub(parsed.minigameHub),
    house: parsedHouse,
    personality: activePet.personality ?? parsePetPersonality(parsed.personality, activePet.species),
    coop: parseCoopHubState(parsed.coop),
    dialogue: parseDialogueState(parsed.dialogue),
    memoryAlbum: parseMemoryAlbum(parsed.memoryAlbum, activePet.name),
    farmSpeedTickets: Math.max(
      0,
      Math.floor(asNumber(parsed.farmSpeedTickets, base.farmSpeedTickets ?? 1))
    ),
    filterShards: Math.max(0, Math.floor(asNumber(parsed.filterShards, 0))),
    visitorTreats: parseVisitorTreats(parsed.visitorTreats),
    visitorState: parseVisitorSystemState(parsed.visitorState),
    townOrders: parseTownOrders(parsed.townOrders),
    photoStudio: parsePhotoStudioState(parsed.photoStudio),
    seasonalEvent: parseSeasonalEvent(parsed.seasonalEvent),
    townMap: parseTownMapState(parsed.townMap),
    seasonSystem: parseSeasonSystemState(parsed.seasonSystem),
    birthdaySystem: parseBirthdaySystemState(parsed.birthdaySystem),
  };

  let hydrated = syncAllAccessoryProgress(syncHouseProgress(draft).nextState).nextState;
  const currentActivePet = getActivePet(hydrated);
  if (currentActivePet.hatched) {
    hydrated = recordMemoryEntry(hydrated, {
      uniqueKey: 'hatching_welcome',
      petId: pets[0]?.id ?? currentActivePet.id,
      type: 'hatching',
      title: `${pets[0]?.name ?? currentActivePet.name} 加入我們的家！`,
      description: `${pets[0]?.name ?? currentActivePet.name}破殼報到了，一起展開幸福的食堂生活吧！`,
      emoji: '🐣',
      dateKey: hydrated.noviceGrowth.startedDate || formatLocalDate(),
      weight: pets[0]?.weight ?? currentActivePet.weight,
      level: pets[0]?.level ?? currentActivePet.level,
    });
    hydrated = evaluateAndSyncMilestones(hydrated, false).nextState;
  }
  hydrated = syncTownMapState(hydrated);
  hydrated = syncPhotoStudioState(hydrated).nextState;
  hydrated = syncSeasonalEventState(hydrated);
  hydrated = syncSeasonSystemState(hydrated);
  hydrated = syncBirthdaySystemState(hydrated);
  hydrated = syncCollectionProgress(hydrated, false).nextState;
  return hydrated;
}

export function loadGameState(): GameState {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed: unknown = JSON.parse(rawV2);
      const normalized = normalizeGameState(parsed);
      if (normalized) {
        return normalized;
      }
    }

    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV1) {
      const parsedV1: unknown = JSON.parse(rawV1);
      if (isRecord(parsedV1)) {
        return migrateLegacyV1(parsedV1);
      }
    }

    return createInitialGameState();
  } catch {
    return createInitialGameState();
  }
}

export function saveGameState(state: GameState): void {
  try {
    const toStore: GameState = {
      ...state,
      lastSavedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    saveNoviceGrowthMirror(state.noviceGrowth);
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function resetGameState(): GameState {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    clearNoviceGrowthMirror();
  } catch {
    // Ignore storage errors gracefully
  }
  const fresh = createInitialGameState();
  saveGameState(fresh);
  return fresh;
}
