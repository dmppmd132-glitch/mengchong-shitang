import { INITIAL_UNLOCKED_ACCESSORIES } from '../data/accessories';
import { INITIAL_FOOD_INVENTORY } from '../data/foods';
import { getGrowthStage } from '../data/growth';
import { createInitialDailyTasks } from '../data/quests';
import {
  AccessorySlot,
  DailyTask,
  FeedLog,
  GameState,
  Pet,
  PetSpecies,
  WeightLog,
} from '../types';

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
    },
    hatched: false,
    consecutiveFastFood: 0,
  };
}

export function createInitialGameState(): GameState {
  const today = formatLocalDate();
  return {
    version: 2,
    pet: createInitialPet(),
    coins: 120,
    foods: { ...INITIAL_FOOD_INVENTORY },
    accessories: [...INITIAL_UNLOCKED_ACCESSORIES],
    weightLogs: [],
    feedLogs: [],
    dailyTasks: createInitialDailyTasks(),
    dailyTasksDate: today,
    soundEnabled: true,
    lastSavedAt: Date.now(),
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
    dailyTasks: createInitialDailyTasks(),
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
  if (value === 'pig' || value === 'rabbit' || value === 'dog') {
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

function parseWeightLogs(raw: unknown): WeightLog[] {
  if (!Array.isArray(raw)) return [];
  const logs: WeightLog[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const id = asString(item.id, '');
    if (!id) continue;
    logs.push({
      id,
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
      date: asString(item.date, formatLocalDate()),
      foodId: asString(item.foodId, ''),
      weightChange: asNumber(item.weightChange, 0),
    });
  }
  return logs;
}

function parseDailyTasks(raw: unknown): DailyTask[] {
  const defaults = createInitialDailyTasks();
  if (!Array.isArray(raw)) return defaults;
  const byId = new Map<string, Record<string, unknown>>();
  for (const item of raw) {
    if (isRecord(item) && typeof item.id === 'string') {
      byId.set(item.id, item);
    }
  }
  return defaults.map((template) => {
    const saved = byId.get(template.id);
    if (!saved) return template;
    const progress = Math.min(template.target, asNumber(saved.progress, 0));
    return {
      ...template,
      progress,
      completed: typeof saved.completed === 'boolean' ? saved.completed : progress >= template.target,
      claimed: typeof saved.claimed === 'boolean' ? saved.claimed : false,
    };
  });
}

function migrateLegacyV1(raw: Record<string, unknown>): GameState {
  const base = createInitialGameState();
  const now = Date.now();
  const rawPet = isRecord(raw.pet) ? raw.pet : {};
  const rawStats = isRecord(rawPet.stats) ? rawPet.stats : {};
  const growth = asNumber(rawPet.growth, base.pet.growth);
  const lastSavedAt = asNumber(raw.lastUpdatedAt, now);

  let pet: Pet = {
    id: 'pet_1',
    name: asString(rawPet.name, base.pet.name),
    species: 'pig',
    level: getGrowthStage(growth).level,
    growth,
    intimacy: clampStat(asNumber(rawPet.intimacy, base.pet.intimacy), 0, 99999),
    hunger: clampStat(asNumber(rawStats.satiety, base.pet.hunger)),
    mood: clampStat(asNumber(rawStats.mood, base.pet.mood)),
    cleanliness: clampStat(asNumber(rawStats.cleanliness, base.pet.cleanliness)),
    energy: clampStat(asNumber(rawStats.energy, base.pet.energy)),
    weight: clampWeight(asNumber(rawPet.weight, base.pet.weight)),
    roundness: clampStat(asNumber(rawPet.chubbiness, base.pet.roundness)),
    accessories: parseAccessoriesRecord(rawPet.equipped, base.pet.accessories),
    hatched: typeof rawPet.hatched === 'boolean' ? rawPet.hatched : false,
    consecutiveFastFood: asNumber(rawPet.consecutiveFastFood, 0),
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

  return {
    version: 2,
    pet,
    coins: asNumber(raw.coins, base.coins),
    foods: parseStringNumberRecord(raw.foodInventory, base.foods),
    accessories: Array.from(new Set([...INITIAL_UNLOCKED_ACCESSORIES, ...rawUnlocked])),
    weightLogs: parseWeightLogs(raw.records),
    feedLogs: [],
    dailyTasks: syncedTasks.dailyTasks,
    dailyTasksDate: syncedTasks.dailyTasksDate,
    soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : true,
    lastSavedAt: now,
  };
}

export function loadGameState(): GameState {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed: unknown = JSON.parse(rawV2);
      if (isRecord(parsed)) {
        const base = createInitialGameState();
        const now = Date.now();
        const lastSavedAt = asNumber(parsed.lastSavedAt, now);
        const rawPet = isRecord(parsed.pet) ? parsed.pet : {};
        const growth = asNumber(rawPet.growth, base.pet.growth);

        let pet: Pet = {
          id: asString(rawPet.id, base.pet.id),
          name: asString(rawPet.name, base.pet.name),
          species: asSpecies(rawPet.species),
          level: getGrowthStage(growth).level,
          growth,
          intimacy: Math.max(0, asNumber(rawPet.intimacy, base.pet.intimacy)),
          hunger: clampStat(asNumber(rawPet.hunger, base.pet.hunger)),
          mood: clampStat(asNumber(rawPet.mood, base.pet.mood)),
          cleanliness: clampStat(asNumber(rawPet.cleanliness, base.pet.cleanliness)),
          energy: clampStat(asNumber(rawPet.energy, base.pet.energy)),
          weight: clampWeight(asNumber(rawPet.weight, base.pet.weight)),
          roundness: clampStat(asNumber(rawPet.roundness, base.pet.roundness)),
          accessories: parseAccessoriesRecord(rawPet.accessories, base.pet.accessories),
          hatched: typeof rawPet.hatched === 'boolean' ? rawPet.hatched : false,
          consecutiveFastFood: asNumber(rawPet.consecutiveFastFood, 0),
        };

        if (pet.hatched) {
          pet = applyTimeDecay(pet, now - lastSavedAt);
        }

        const rawUnlocked = Array.isArray(parsed.accessories)
          ? parsed.accessories.filter((x): x is string => typeof x === 'string')
          : [];

        const syncedTasks = syncDailyTasks(
          parseDailyTasks(parsed.dailyTasks),
          asString(parsed.dailyTasksDate, formatLocalDate())
        );

        return {
          version: 2,
          pet,
          coins: asNumber(parsed.coins, base.coins),
          foods: parseStringNumberRecord(parsed.foods, base.foods),
          accessories: Array.from(new Set([...INITIAL_UNLOCKED_ACCESSORIES, ...rawUnlocked])),
          weightLogs: parseWeightLogs(parsed.weightLogs),
          feedLogs: parseFeedLogs(parsed.feedLogs),
          dailyTasks: syncedTasks.dailyTasks,
          dailyTasksDate: syncedTasks.dailyTasksDate,
          soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
          lastSavedAt: now,
        };
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
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function resetGameState(): GameState {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage errors gracefully
  }
  const fresh = createInitialGameState();
  saveGameState(fresh);
  return fresh;
}
