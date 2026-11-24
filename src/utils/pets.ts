import { getGrowthStage } from '../data/growth';
import { ROOM_ITEMS } from '../data/house';
import { PET_PREFERENCES } from '../data/personality';
import {
  FAMILY_DAILY_TASK_TEMPLATES,
  PET_ABILITIES,
  PET_SLOT_UNLOCK_RULES,
  PET_UNLOCK_CONDITIONS,
  RESERVED_SPECIAL_PETS,
} from '../data/pets';
import { STARTER_PET_SPECIES, getPetSpeciesInfo } from '../data/species';
import {
  AccessorySlot,
  FamilyDailyTask,
  FamilyTaskId,
  GameState,
  MemoryEntry,
  Pet,
  PetAbility,
  PetSlotUnlockRule,
  PetSpecies,
  PetUnlockCondition,
  ReservedSpecialPet,
} from '../types';
import { createInitialPetPersonality } from './personality';

function getTodayDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createEmptyAccessories(
  initialHead: string | null = null
): Record<AccessorySlot, string | null> {
  return {
    head: initialHead,
    face: null,
    neck: null,
    body: null,
    held: null,
    back: null,
  };
}

export function getDefaultWeightForSpecies(species: PetSpecies): number {
  switch (species) {
    case 'hamster':
      return 1.8;
    case 'duck':
      return 3.4;
    case 'cat':
      return 4.5;
    case 'rabbit':
      return 5.2;
    case 'dog':
      return 7.8;
    case 'pig':
    default:
      return 8.5;
  }
}

export function createPetInstance(params: {
  id: string;
  name: string;
  species: PetSpecies;
  hatched?: boolean;
  ownerId?: string;
  isSharedCoopPet?: boolean;
  source?: Pet['source'];
  initialHeadAccessory?: string | null;
}): Pet {
  const {
    id,
    name,
    species,
    hatched = true,
    ownerId = 'local',
    isSharedCoopPet = false,
    source = 'starter',
    initialHeadAccessory = null,
  } = params;

  return {
    id,
    name: name.trim().slice(0, 8) || getPetSpeciesInfo(species).shortName,
    species,
    level: 1,
    growth: 0,
    intimacy: 10,
    hunger: 74,
    mood: 84,
    cleanliness: 88,
    energy: 86,
    weight: getDefaultWeightForSpecies(species),
    roundness: 28,
    accessories: createEmptyAccessories(initialHeadAccessory),
    hatched,
    consecutiveFastFood: 0,
    personality: createInitialPetPersonality(species),
    preference: PET_PREFERENCES[species] ?? PET_PREFERENCES.pig,
    ownerId,
    isSharedCoopPet,
    adoptedAt: Date.now(),
    source,
  };
}

export function getActivePet(state: GameState): Pet {
  const found = state.pets.find((p) => p.id === state.activePetId);
  if (found) return found;
  if (state.pets.length > 0) return state.pets[0];
  return createPetInstance({
    id: 'pet_1',
    name: '布丁',
    species: 'pig',
    hatched: false,
    isSharedCoopPet: true,
    initialHeadAccessory: 'pink_bow',
  });
}

export function getPetById(state: GameState, petId: string): Pet | undefined {
  return state.pets.find((p) => p.id === petId);
}

export function getPetDisplayPersonality(state: GameState, pet: Pet) {
  if (pet.personality) return pet.personality;
  if (pet.id === state.activePetId) return state.personality;
  return createInitialPetPersonality(pet.species);
}

export function getPetPreferenceProfile(pet: Pet) {
  return pet.preference ?? PET_PREFERENCES[pet.species] ?? PET_PREFERENCES.pig;
}

export function updatePetById(
  state: GameState,
  petId: string,
  updater: (pet: Pet) => Pet
): GameState {
  let updatedActivePersonality = state.personality;
  const nextPets = state.pets.map((p) => {
    if (p.id !== petId) return p;
    const nextPet = updater(p);
    const normalizedPet: Pet = {
      ...nextPet,
      level: getGrowthStage(nextPet.growth).level,
      personality: nextPet.personality ?? p.personality ?? state.personality,
      preference: nextPet.preference ?? p.preference ?? PET_PREFERENCES[nextPet.species],
    };
    if (normalizedPet.id === state.activePetId && normalizedPet.personality) {
      updatedActivePersonality = normalizedPet.personality;
    }
    return normalizedPet;
  });

  return {
    ...state,
    pets: nextPets,
    personality: updatedActivePersonality,
  };
}

export function updateActivePet(
  state: GameState,
  updater: (pet: Pet) => Pet
): GameState {
  const active = getActivePet(state);
  return updatePetById(state, active.id, updater);
}

export function switchActivePet(
  state: GameState,
  petId: string
): { nextState: GameState; ok: boolean; error?: string; notice?: string } {
  const target = state.pets.find((p) => p.id === petId);
  if (!target) {
    return { nextState: state, ok: false, error: '找不到這隻寵物喔' };
  }
  if (state.activePetId === petId) {
    return { nextState: state, ok: true };
  }
  const targetPersonality =
    target.personality ?? createInitialPetPersonality(target.species);
  const nextPets = state.pets.map((p) =>
    p.id === target.id && !p.personality
      ? { ...p, personality: targetPersonality }
      : p
  );
  return {
    nextState: {
      ...state,
      pets: nextPets,
      activePetId: target.id,
      personality: targetPersonality,
    },
    ok: true,
    notice: `已切換至「${target.name}」（${getPetSpeciesInfo(target.species).shortName}）`,
  };
}

export function isSharedCoopPet(pet: Pet): boolean {
  return Boolean(pet.isSharedCoopPet || pet.id === 'pet_1');
}

export function canUserEditPet(pet: Pet, currentUserId: string | null): boolean {
  if (isSharedCoopPet(pet)) return true;
  if (!pet.ownerId || pet.ownerId === 'local') return true;
  if (!currentUserId) return true;
  return pet.ownerId === currentUserId;
}

export interface EvaluatedPetSlot {
  rule: PetSlotUnlockRule;
  unlocked: boolean;
  claimed: boolean;
  canClaimReward: boolean;
  occupiedByPet: Pet | null;
  progressText: string;
}

export function getCompletedTownOrdersCount(state: GameState): number {
  const tracked = state.completedTownOrdersCount ?? 0;
  const currentClaimed = (state.townOrders ?? []).filter(
    (o) => o.claimedByUserIds.length > 0
  ).length;
  return Math.max(tracked, currentClaimed);
}

export function evaluatePetSlots(
  state: GameState,
  hasSharedRoom = false
): {
  slots: EvaluatedPetSlot[];
  maxSlots: number;
  unlockedSlotNumbers: number[];
  claimableSlotsCount: number;
} {
  const claimedSet = new Set(state.claimedPetSlots ?? [1]);
  const validFurnitureIds = new Set(ROOM_ITEMS.map((i) => i.id));
  const collectedFurnitureCount = state.house.collectedFurnitureIds.filter((id) =>
    validFurnitureIds.has(id)
  ).length;
  const totalFacilityLevels =
    state.house.farmUpgrades.sprinklerLevel +
    state.house.farmUpgrades.greenhouseLevel +
    state.house.farmUpgrades.storageLevel;
  const townOrdersCompleted = getCompletedTownOrdersCount(state);
  const noviceCompleted =
    state.noviceGrowth.claimedDays.length >= 7 ||
    state.noviceGrowth.claimedDays.includes(7);
  const anyPetLv2 = state.pets.some((p) => p.level >= 2);
  const coopGoalCount = state.house.completedGoalIds.length;
  const houseAchievementsCount = state.house.achievedMilestones.length;

  const slots: EvaluatedPetSlot[] = PET_SLOT_UNLOCK_RULES.map((rule, idx) => {
    let unlocked = false;
    let progressText = '';

    switch (rule.slotNumber) {
      case 1: {
        unlocked = true;
        progressText = '已解鎖';
        break;
      }
      case 2: {
        unlocked = noviceCompleted || anyPetLv2;
        const maxLv = Math.max(...state.pets.map((p) => p.level), 1);
        progressText = unlocked
          ? '已達成條件'
          : `成長之路 ${state.noviceGrowth.claimedDays.length}/7 天 · 最高 Lv.${maxLv}/2`;
        break;
      }
      case 3: {
        unlocked =
          collectedFurnitureCount >= 6 ||
          state.house.completedThemeSets.length >= 1;
        progressText = unlocked
          ? '已達成條件'
          : `已收集家具 ${collectedFurnitureCount}/6 件 · 主題套裝 ${state.house.completedThemeSets.length}/1`;
        break;
      }
      case 4: {
        unlocked =
          state.house.unlockedFarmPlots >= 6 || totalFacilityLevels >= 3;
        progressText = unlocked
          ? '已達成條件'
          : `農地 ${state.house.unlockedFarmPlots}/6 塊 · 設施升級 ${totalFacilityLevels}/3 級`;
        break;
      }
      case 5: {
        unlocked =
          state.house.unlockedFarmPlots >= 8 && townOrdersCompleted >= 3;
        progressText = unlocked
          ? '已達成條件'
          : `農地 ${state.house.unlockedFarmPlots}/8 塊 · 訂單 ${townOrdersCompleted}/3 張`;
        break;
      }
      case 6: {
        unlocked =
          coopGoalCount >= 2 ||
          houseAchievementsCount >= 5 ||
          (hasSharedRoom && state.coop.unlockedBadges.length >= 2);
        progressText = unlocked
          ? '已達成條件'
          : `共養目標 ${coopGoalCount}/2 · 小屋成就 ${houseAchievementsCount}/5`;
        break;
      }
      default:
        unlocked = false;
        progressText = '';
    }

    const claimed = rule.slotNumber === 1 ? true : claimedSet.has(rule.slotNumber);
    const hasReward =
      rule.rewardCoins > 0 ||
      (rule.rewardShards ?? 0) > 0 ||
      (rule.rewardTickets ?? 0) > 0;
    const canClaimReward = unlocked && !claimed && hasReward;

    return {
      rule,
      unlocked,
      claimed,
      canClaimReward,
      occupiedByPet: state.pets[idx] ?? null,
      progressText,
    };
  });

  const unlockedSlotNumbers = slots
    .filter((s) => s.unlocked)
    .map((s) => s.rule.slotNumber);
  const maxSlots = Math.max(1, unlockedSlotNumbers.length);
  const claimableSlotsCount = slots.filter((s) => s.canClaimReward).length;

  return {
    slots,
    maxSlots,
    unlockedSlotNumbers,
    claimableSlotsCount,
  };
}

export function claimPetSlotReward(
  state: GameState,
  slotNumber: number,
  hasSharedRoom = false
): { nextState: GameState; ok: boolean; error?: string; notice?: string } {
  const evaluated = evaluatePetSlots(state, hasSharedRoom);
  const target = evaluated.slots.find((s) => s.rule.slotNumber === slotNumber);
  if (!target) {
    return { nextState: state, ok: false, error: '找不到此寵物欄位' };
  }
  if (!target.unlocked) {
    return { nextState: state, ok: false, error: `尚未達成條件：${target.rule.conditionLabel}` };
  }
  if (target.claimed) {
    return { nextState: state, ok: false, error: '已經領取過此欄位的解鎖獎勵囉！' };
  }

  const prevClaimed = state.claimedPetSlots ?? [1];
  return {
    nextState: {
      ...state,
      coins: state.coins + target.rule.rewardCoins,
      furnitureShards: state.furnitureShards + (target.rule.rewardShards ?? 0),
      farmSpeedTickets:
        (state.farmSpeedTickets ?? 0) + (target.rule.rewardTickets ?? 0),
      claimedPetSlots: Array.from(new Set([...prevClaimed, slotNumber])).sort(
        (a, b) => a - b
      ),
    },
    ok: true,
    notice: `解鎖「${target.rule.title}」！獲得 ${target.rule.rewardText}`,
  };
}

export interface EvaluatedSpeciesUnlock {
  species: PetSpecies;
  condition: PetUnlockCondition;
  ability: PetAbility;
  unlocked: boolean;
  currentCount: number;
  targetCount: number;
  ownedCount: number;
  progressLabel: string;
}

export function getTotalMinigamesPlayed(state: GameState): number {
  const fromHub = Object.values(state.minigameHub.playCounts).reduce(
    (sum, v) => sum + (v || 0),
    0
  );
  return Math.max(state.noviceGrowth.minigameCount, fromHub);
}

export function getTotalVisitorsHostedCount(state: GameState): number {
  const affinities = state.visitorState?.affinities;
  if (!affinities) return 0;
  return Object.values(affinities).reduce(
    (sum, aff) => sum + (aff?.totalFed ?? 0),
    0
  );
}

export function evaluateSpeciesUnlocks(
  state: GameState,
  hasSharedRoom = false
): EvaluatedSpeciesUnlock[] {
  const { maxSlots } = evaluatePetSlots(state, hasSharedRoom);
  const minigamesPlayed = getTotalMinigamesPlayed(state);
  const visitorsHosted = getTotalVisitorsHostedCount(state);
  const townOrdersDone = getCompletedTownOrdersCount(state);
  const allSpecies: PetSpecies[] = ['pig', 'rabbit', 'dog', 'cat', 'duck', 'hamster'];

  return allSpecies.map((species) => {
    const condition = PET_UNLOCK_CONDITIONS[species];
    const ability = PET_ABILITIES[species];
    const ownedCount = state.pets.filter((p) => p.species === species).length;

    let unlocked = false;
    let currentCount = 0;
    let targetCount = condition.targetCount;
    let progressLabel = '';

    if (condition.ruleType === 'starter') {
      unlocked = maxSlots >= 2 || ownedCount > 0;
      currentCount = maxSlots >= 2 ? 1 : 0;
      targetCount = 1;
      progressLabel = maxSlots >= 2 ? '可選擇領養' : '需先解鎖第 2 個寵物欄位';
    } else if (condition.ruleType === 'minigames_count') {
      currentCount = Math.min(targetCount, minigamesPlayed);
      unlocked = minigamesPlayed >= targetCount;
      progressLabel = unlocked
        ? `已達成（${minigamesPlayed}/${targetCount} 次小遊戲）`
        : `小遊戲進度 ${minigamesPlayed}/${targetCount} 次`;
    } else if (condition.ruleType === 'visitors_hosted') {
      currentCount = Math.min(targetCount, visitorsHosted);
      unlocked = visitorsHosted >= targetCount;
      progressLabel = unlocked
        ? `已達成（累計招待 ${visitorsHosted}/${targetCount} 次）`
        : `招待訪客進度 ${visitorsHosted}/${targetCount} 次`;
    } else if (condition.ruleType === 'town_orders_completed') {
      currentCount = Math.min(targetCount, townOrdersDone);
      unlocked = townOrdersDone >= targetCount;
      progressLabel = unlocked
        ? `已達成（完成 ${townOrdersDone}/${targetCount} 張訂單）`
        : `完成訂單進度 ${townOrdersDone}/${targetCount} 張`;
    }

    return {
      species,
      condition,
      ability,
      unlocked,
      currentCount,
      targetCount,
      ownedCount,
      progressLabel,
    };
  });
}

export function adoptNewPet(
  state: GameState,
  params: {
    species: PetSpecies;
    name: string;
    ownerId?: string;
    hasSharedRoom?: boolean;
  }
): { nextState: GameState; ok: boolean; error?: string; notice?: string; pet?: Pet } {
  const cleanName = params.name.trim().slice(0, 8);
  if (!cleanName) {
    return { nextState: state, ok: false, error: '請先幫新夥伴取個可愛的名字（1～8 字）！' };
  }

  const slotEval = evaluatePetSlots(state, Boolean(params.hasSharedRoom));
  if (state.pets.length >= slotEval.maxSlots) {
    return {
      nextState: state,
      ok: false,
      error: `目前共有 ${slotEval.maxSlots} 個寵物欄位且已滿，請先達成下一欄位解鎖條件！`,
    };
  }

  const speciesEval = evaluateSpeciesUnlocks(state, Boolean(params.hasSharedRoom)).find(
    (s) => s.species === params.species
  );
  if (!speciesEval || !speciesEval.unlocked) {
    return {
      nextState: state,
      ok: false,
      error: `尚未解鎖「${getPetSpeciesInfo(params.species).label}」：${speciesEval?.condition.label ?? ''}`,
    };
  }

  if (state.pets.length === 1 && !STARTER_PET_SPECIES.includes(params.species)) {
    // Allow adopting cat/duck/hamster into slot 2+ as well if unlocked early, no extra block needed
  }

  const now = Date.now();
  const dateKey = getTodayDateStr(new Date(now));
  const newPetId = `pet_${now}_${Math.random().toString(36).slice(2, 6)}`;
  const newPet = createPetInstance({
    id: newPetId,
    name: cleanName,
    species: params.species,
    hatched: true,
    ownerId: params.ownerId || 'local',
    isSharedCoopPet: false,
    source: speciesEval.condition.ruleType,
  });

  const speciesLabel = getPetSpeciesInfo(params.species).label;
  const adoptMemory: MemoryEntry = {
    id: `mem_${now}_adopt`,
    uniqueKey: `pet_adopt_${newPetId}`,
    petId: newPetId,
    type: 'hatching',
    title: `歡迎「${newPet.name}」加入大家庭！`,
    description: `領養了可愛的${speciesLabel}，開啟全新的多寵物溫馨日常！`,
    dateKey,
    createdAt: now,
    emoji: PET_ABILITIES[params.species].emoji,
    weight: newPet.weight,
    level: newPet.level,
  };

  const namingMemory: MemoryEntry = {
    id: `mem_${now + 1}_name`,
    uniqueKey: `pet_name_${newPetId}`,
    petId: newPetId,
    type: 'milestone',
    title: `為${speciesLabel}取名為「${newPet.name}」`,
    description: `「${newPet.name}」帶著專屬技能「${PET_ABILITIES[params.species].title}」報到囉！`,
    dateKey,
    createdAt: now + 1,
    emoji: '🏷️',
    weight: newPet.weight,
    level: newPet.level,
  };

  const nextMemories = [namingMemory, adoptMemory, ...state.memoryAlbum.memories].slice(
    0,
    180
  );

  return {
    nextState: {
      ...state,
      pets: [...state.pets, newPet],
      activePetId: newPet.id,
      personality: newPet.personality ?? createInitialPetPersonality(params.species),
      memoryAlbum: {
        ...state.memoryAlbum,
        memories: nextMemories,
      },
    },
    ok: true,
    pet: newPet,
    notice: `成功領養「${newPet.name}」（${speciesLabel}）並切換為目前互動夥伴！`,
  };
}

export interface ActivePetAbilitySnapshot {
  pet: Pet;
  ability: PetAbility;
  cropGrowthRateMultiplier: number;
  visitorRateMultiplier: number;
  walkBonusMultiplier: number;
  pigHarvestBonusChance: number;
  hamsterIngredientBonusChance: number;
  catPhotoMemoryChance: number;
}

export function getActivePetAbilityBonus(state: GameState): ActivePetAbilitySnapshot {
  const pet = getActivePet(state);
  const ability = PET_ABILITIES[pet.species] ?? PET_ABILITIES.pig;

  return {
    pet,
    ability,
    cropGrowthRateMultiplier: pet.species === 'rabbit' ? 1.1 : 1,
    visitorRateMultiplier: pet.species === 'duck' ? 1.1 : 1,
    walkBonusMultiplier: pet.species === 'dog' ? 1.1 : 1,
    pigHarvestBonusChance: pet.species === 'pig' ? 0.1 : 0,
    hamsterIngredientBonusChance: pet.species === 'hamster' ? 0.12 : 0,
    catPhotoMemoryChance: pet.species === 'cat' ? 0.12 : 0,
  };
}

export function createInitialFamilyDailyTasks(
  _dateStr: string = getTodayDateStr()
): FamilyDailyTask[] {
  return FAMILY_DAILY_TASK_TEMPLATES.map((tpl) => ({
    ...tpl,
    reward: { ...tpl.reward },
  }));
}

export function syncFamilyDailyTasks(
  tasks: FamilyDailyTask[] | undefined,
  tasksDate: string | undefined,
  todayStr: string = getTodayDateStr()
): { familyDailyTasks: FamilyDailyTask[]; familyDailyTasksDate: string } {
  if (tasksDate === todayStr && Array.isArray(tasks) && tasks.length > 0) {
    return { familyDailyTasks: tasks, familyDailyTasksDate: tasksDate };
  }
  return {
    familyDailyTasks: createInitialFamilyDailyTasks(todayStr),
    familyDailyTasksDate: todayStr,
  };
}

export function incrementFamilyTaskProgress(
  tasks: FamilyDailyTask[] | undefined,
  taskId: FamilyTaskId,
  amount = 1,
  todayStr: string = getTodayDateStr()
): FamilyDailyTask[] {
  const base =
    Array.isArray(tasks) && tasks.length > 0
      ? tasks
      : createInitialFamilyDailyTasks(todayStr);
  return base.map((task) => {
    if (task.id !== taskId) return task;
    const nextProgress = Math.min(task.target, task.progress + amount);
    return {
      ...task,
      progress: nextProgress,
      completed: nextProgress >= task.target,
    };
  });
}

export function claimFamilyDailyTaskReward(
  state: GameState,
  taskId: FamilyTaskId
): { nextState: GameState; ok: boolean; error?: string; notice?: string } {
  const todayStr = getTodayDateStr();
  const synced = syncFamilyDailyTasks(
    state.familyDailyTasks,
    state.familyDailyTasksDate,
    todayStr
  );
  const task = synced.familyDailyTasks.find((t) => t.id === taskId);
  if (!task) {
    return { nextState: state, ok: false, error: '找不到這項全家任務' };
  }
  if (!task.completed) {
    return { nextState: state, ok: false, error: '請先讓家裡任一隻寵物完成任務條件！' };
  }
  if (task.claimed) {
    return { nextState: state, ok: false, error: '今天已經領取過這項全家共享獎勵囉！' };
  }

  const nextTasks = synced.familyDailyTasks.map((t) =>
    t.id === taskId ? { ...t, claimed: true } : t
  );

  return {
    nextState: {
      ...state,
      coins: state.coins + task.reward.coins,
      foods: {
        ...state.foods,
        [task.reward.foodId]:
          (state.foods[task.reward.foodId] ?? 0) + task.reward.foodQty,
      },
      familyDailyTasks: nextTasks,
      familyDailyTasksDate: synced.familyDailyTasksDate,
    },
    ok: true,
    notice: `領取全家今日任務「${task.title}」共享獎勵：+${task.reward.coins} 金幣！`,
  };
}

export function getReservedSpecialPets(): ReservedSpecialPet[] {
  return RESERVED_SPECIAL_PETS;
}
