import { ACCESSORIES } from '../data/accessories';
import { FOODS } from '../data/foods';
import {
  MILESTONE_DEFINITIONS,
  SHARED_MEMORY_DEFINITIONS,
  createInitialMilestones,
  createInitialSharedMemories,
} from '../data/memories';
import { PHOTO_SCENES } from '../data/photoStudio';
import {
  DialogueLine,
  GameMilestoneId,
  GameState,
  MemoryAlbumState,
  MemoryEntry,
  MemoryType,
  Milestone,
  MonthlyActivityTracker,
  MonthlyRecap,
  PetMessage,
  PetViewDirection,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScene,
  PhotoStickerId,
  RoomPhotoRecord,
  SharedMemory,
  SharedMemoryKey,
  SharedPetRoom,
} from '../types';
import { getGrowthStage } from '../data/growth';
import { getActivePet, updateActivePet } from './pets';

export function getMemoryDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonthKeyFromDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getPreviousMonthKey(date: Date = new Date()): string {
  const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return getMonthKeyFromDate(prev);
}

export function daysBetweenDateKeys(startKey: string, endKey: string): number {
  const s = new Date(`${startKey}T00:00:00`);
  const e = new Date(`${endKey}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  return Math.max(0, Math.floor((e.getTime() - s.getTime()) / 86400000));
}

export function isLastDayOfMonth(date: Date = new Date()): boolean {
  const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return tomorrow.getDate() === 1;
}

export function isFirstDayOfMonth(date: Date = new Date()): boolean {
  return date.getDate() === 1;
}

export function createInitialMemoryAlbumState(petName = '布丁'): MemoryAlbumState {
  return {
    memories: [],
    favoriteMemoryIds: [],
    milestones: createInitialMilestones(),
    sharedMemories: createInitialSharedMemories(petName),
    sharedRoomStartedDate: null,
    sharedRoomId: null,
    monthlyRecaps: [],
    monthlyTrackers: {},
    unlockedPhotoPoses: [],
    unlockedPhotoFrames: [],
    savedDialogueIds: [],
  };
}

export function createEmptyMonthlyTracker(
  monthKey: string,
  currentWeight: number | null = null
): MonthlyActivityTracker {
  return {
    monthKey,
    foodCounts: {},
    interactionCounts: {},
    accessoryCounts: {},
    startWeight: currentWeight,
    endWeight: currentWeight,
    growthGained: 0,
    coopMessagesCount: 0,
    coopTasksCount: 0,
  };
}

export function recordMonthlyActivity(
  state: GameState,
  patch: {
    foodId?: string;
    interactionLabel?: string;
    accessoryId?: string | null;
    weight?: number;
    growthDelta?: number;
    coopMessageDelta?: number;
    coopTaskDelta?: number;
  },
  now: Date = new Date()
): GameState {
  const activePet = getActivePet(state);
  const monthKey = getMonthKeyFromDate(now);
  const existing =
    state.memoryAlbum.monthlyTrackers[monthKey] ??
    createEmptyMonthlyTracker(monthKey, activePet.weight);

  const nextFoodCounts = { ...existing.foodCounts };
  if (patch.foodId) {
    nextFoodCounts[patch.foodId] = (nextFoodCounts[patch.foodId] ?? 0) + 1;
  }

  const nextInteractionCounts = { ...existing.interactionCounts };
  if (patch.interactionLabel) {
    nextInteractionCounts[patch.interactionLabel] =
      (nextInteractionCounts[patch.interactionLabel] ?? 0) + 1;
  }

  const nextAccessoryCounts = { ...existing.accessoryCounts };
  if (patch.accessoryId) {
    nextAccessoryCounts[patch.accessoryId] =
      (nextAccessoryCounts[patch.accessoryId] ?? 0) + 1;
  }

  const nextTracker: MonthlyActivityTracker = {
    monthKey,
    foodCounts: nextFoodCounts,
    interactionCounts: nextInteractionCounts,
    accessoryCounts: nextAccessoryCounts,
    startWeight: existing.startWeight ?? patch.weight ?? activePet.weight,
    endWeight: patch.weight ?? activePet.weight,
    growthGained: existing.growthGained + Math.max(0, patch.growthDelta ?? 0),
    coopMessagesCount:
      existing.coopMessagesCount + Math.max(0, patch.coopMessageDelta ?? 0),
    coopTasksCount: existing.coopTasksCount + Math.max(0, patch.coopTaskDelta ?? 0),
  };

  // Keep latest 6 months of trackers to preserve lightweight storage
  const sortedKeys = Object.keys({
    ...state.memoryAlbum.monthlyTrackers,
    [monthKey]: nextTracker,
  })
    .sort()
    .slice(-6);
  const prunedTrackers: Record<string, MonthlyActivityTracker> = {};
  for (const k of sortedKeys) {
    prunedTrackers[k] =
      k === monthKey ? nextTracker : state.memoryAlbum.monthlyTrackers[k];
  }

  return {
    ...state,
    memoryAlbum: {
      ...state.memoryAlbum,
      monthlyTrackers: prunedTrackers,
    },
  };
}

export function recordMemoryEntry(
  state: GameState,
  payload: {
    uniqueKey?: string;
    petId?: string;
    type: MemoryType;
    title: string;
    description: string;
    emoji: string;
    dateKey?: string;
    createdAt?: number;
    photoId?: string;
    accessoryId?: string;
    foodId?: string;
    weight?: number;
    level?: number;
    dialogueText?: string;
    actorName?: string;
    isShared?: boolean;
  }
): GameState {
  const album = state.memoryAlbum;
  if (
    payload.uniqueKey &&
    album.memories.some((m) => m.uniqueKey === payload.uniqueKey)
  ) {
    return state;
  }

  const createdAt = payload.createdAt ?? Date.now();
  const dateKey = payload.dateKey ?? getMemoryDateKey(new Date(createdAt));
  const entry: MemoryEntry = {
    id: `mem_${createdAt}_${Math.random().toString(36).slice(2, 6)}`,
    uniqueKey: payload.uniqueKey,
    petId: payload.petId,
    type: payload.type,
    title: payload.title,
    description: payload.description,
    dateKey,
    createdAt,
    emoji: payload.emoji,
    photoId: payload.photoId,
    accessoryId: payload.accessoryId,
    foodId: payload.foodId,
    weight: payload.weight,
    level: payload.level,
    dialogueText: payload.dialogueText,
    actorName: payload.actorName,
    isShared: payload.isShared,
  };

  const combined = [entry, ...album.memories];
  const favSet = new Set(album.favoriteMemoryIds);
  const favorites = combined.filter((m) => favSet.has(m.id));
  const others = combined.filter((m) => !favSet.has(m.id));
  const capped = [...favorites, ...others.slice(0, Math.max(40, 180 - favorites.length))].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  return {
    ...state,
    memoryAlbum: {
      ...album,
      memories: capped,
    },
  };
}

export function maybeGrantCatPhotoMemoryCard(state: GameState): {
  nextState: GameState;
  bonusMemoryCreated: boolean;
} {
  const activePet = getActivePet(state);
  if (activePet.species !== 'cat' || Math.random() >= 0.12) {
    return { nextState: state, bonusMemoryCreated: false };
  }
  const now = Date.now();
  const nextState = recordMemoryEntry(state, {
    uniqueKey: `cat_photo_bonus_${now}_${Math.random().toString(36).slice(2, 5)}`,
    petId: activePet.id,
    type: 'milestone',
    title: `鏡頭靈感驚喜卡：${activePet.name}的閃耀瞬間`,
    description: `${activePet.name}發揮「鏡頭靈感」天賦，為這場拍照時光多留下了一張珍藏回憶卡！`,
    emoji: '📸',
    createdAt: now,
    weight: activePet.weight,
    level: activePet.level,
  });
  return { nextState, bonusMemoryCreated: true };
}

export function toggleFavoriteMemory(state: GameState, memoryId: string): GameState {
  const prevFavs = state.memoryAlbum.favoriteMemoryIds;
  const exists = prevFavs.includes(memoryId);
  const nextFavs = exists
    ? prevFavs.filter((id) => id !== memoryId)
    : [memoryId, ...prevFavs];

  return {
    ...state,
    memoryAlbum: {
      ...state.memoryAlbum,
      favoriteMemoryIds: nextFavs,
    },
  };
}

export function saveDialogueToMemories(
  state: GameState,
  line: DialogueLine
): { nextState: GameState; saved: boolean } {
  if (state.memoryAlbum.savedDialogueIds.includes(line.id)) {
    return { nextState: state, saved: false };
  }
  const withSavedId: GameState = {
    ...state,
    memoryAlbum: {
      ...state.memoryAlbum,
      savedDialogueIds: [line.id, ...state.memoryAlbum.savedDialogueIds].slice(0, 80),
    },
  };
  const activePet = getActivePet(state);
  const nextState = recordMemoryEntry(withSavedId, {
    uniqueKey: `dialogue_${line.id}`,
    petId: activePet.id,
    type: 'dialogue',
    title: `${activePet.name}的暖心語錄`,
    description: line.respondedLabel
      ? `「${line.text}」（你的回應：${line.respondedLabel}）`
      : `「${line.text}」`,
    emoji: '💬',
    createdAt: line.createdAt,
    dateKey: getMemoryDateKey(new Date(line.createdAt)),
    dialogueText: line.text,
    weight: activePet.weight,
    level: activePet.level,
  });
  return { nextState, saved: true };
}

export function evaluateAndSyncMilestones(
  state: GameState,
  hasSharedRoom = false,
  now: Date = new Date()
): { nextState: GameState; newlyUnlocked: Milestone[] } {
  const todayKey = getMemoryDateKey(now);
  const album = state.memoryAlbum;
  const unlockedById = new Map<GameMilestoneId, Milestone>();
  for (const m of album.milestones) {
    unlockedById.set(m.id, m);
  }

  const activePet = getActivePet(state);
  const maxEquippedCount = Math.max(
    ...state.pets.map((p) => Object.values(p.accessories).filter(Boolean).length),
    Object.values(activePet.accessories).filter(Boolean).length
  );
  const maxLevel = Math.max(...state.pets.map((p) => p.level), activePet.level);
  const startedDate = state.noviceGrowth.startedDate || todayKey;
  const companionDays = daysBetweenDateKeys(startedDate, todayKey) + 1;
  const coopStart = album.sharedRoomStartedDate;
  const coopDays = coopStart ? daysBetweenDateKeys(coopStart, todayKey) + 1 : 0;

  const conditionCheck: Record<GameMilestoneId, boolean> = {
    first_feed:
      state.feedLogs.length >= 1 ||
      state.noviceGrowth.feedCount >= 1 ||
      album.memories.some((m) => m.type === 'feeding'),
    first_burger: state.feedLogs.some((l) => l.foodId === 'cheese_burger'),
    first_fries: state.feedLogs.some((l) => l.foodId === 'crispy_fries'),
    first_equip_accessory:
      maxEquippedCount >= 1 || album.memories.some((m) => m.type === 'wardrobe'),
    first_weight_log:
      state.weightLogs.some((w) => w.foodName === '手動紀錄') ||
      state.noviceGrowth.weightRecordCount >= 1,
    first_room_decor:
      state.house.roomLayout.placedItems.length >= 1 ||
      state.house.achievedMilestones.includes('first_furniture'),
    first_farm_harvest: album.memories.some(
      (m) => m.type === 'farm' && m.uniqueKey?.startsWith('farm_harvest')
    ),
    reach_lv2: maxLevel >= 2,
    reach_lv3: maxLevel >= 3,
    reach_lv4: maxLevel >= 4,
    coop_7_days:
      state.coop.streakDays >= 7 || (hasSharedRoom && coopDays >= 7),
    day_100_anniversary: companionDays >= 100,
  };

  let bonusCoins = 0;
  let bonusGrowth = 0;
  const newlyUnlocked: Milestone[] = [];
  const nextPoses = new Set<PhotoPose>(album.unlockedPhotoPoses);
  const nextFrames = new Set<PhotoFrame>(album.unlockedPhotoFrames);

  const nextMilestones: Milestone[] = MILESTONE_DEFINITIONS.map((def) => {
    const existing = unlockedById.get(def.id);
    if (existing?.unlocked) {
      if (def.rewardPoseId) nextPoses.add(def.rewardPoseId);
      if (def.rewardFrameId) nextFrames.add(def.rewardFrameId);
      return { ...def, ...existing, unlocked: true };
    }
    if (conditionCheck[def.id]) {
      const unlockedObj: Milestone = {
        ...def,
        unlocked: true,
        unlockedAt: now.getTime(),
        unlockedDateKey: todayKey,
      };
      bonusCoins += def.rewardCoins;
      bonusGrowth += def.rewardGrowth;
      if (def.rewardPoseId) nextPoses.add(def.rewardPoseId);
      if (def.rewardFrameId) nextFrames.add(def.rewardFrameId);
      newlyUnlocked.push(unlockedObj);
      return unlockedObj;
    }
    return {
      ...def,
      unlocked: false,
      unlockedAt: null,
      unlockedDateKey: null,
    };
  });

  if (newlyUnlocked.length === 0 && nextMilestones.length === album.milestones.length) {
    return { nextState: state, newlyUnlocked: [] };
  }

  const withGrowth = updateActivePet(state, (pet) => {
    const nextGrowth = pet.growth + bonusGrowth;
    return {
      ...pet,
      growth: nextGrowth,
      level: getGrowthStage(nextGrowth).level,
    };
  });

  let nextState: GameState = {
    ...withGrowth,
    coins: withGrowth.coins + bonusCoins,
    memoryAlbum: {
      ...album,
      milestones: nextMilestones,
      unlockedPhotoPoses: Array.from(nextPoses),
      unlockedPhotoFrames: Array.from(nextFrames),
    },
  };

  const updatedActive = getActivePet(nextState);
  for (const ms of newlyUnlocked) {
    const extras: string[] = [];
    if (ms.rewardCoins > 0) extras.push(`+${ms.rewardCoins} 金幣`);
    if (ms.rewardGrowth > 0) extras.push(`+${ms.rewardGrowth} 成長值`);
    if (ms.rewardPoseId) extras.push('解鎖限定拍照姿勢');
    if (ms.rewardFrameId) extras.push('解鎖限定相框');
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: `milestone_${ms.id}`,
      petId: updatedActive.id,
      type: 'milestone',
      title: `達成里程碑：${ms.title}`,
      description: `${ms.description}（獲得「${ms.rewardCardTitle}」・${extras.join(' · ')}）`,
      emoji: ms.emoji,
      dateKey: todayKey,
      createdAt: now.getTime(),
      weight: updatedActive.weight,
      level: updatedActive.level,
    });
  }

  return { nextState, newlyUnlocked };
}

export function evaluateAndSyncSharedMemories(
  state: GameState,
  sharedRoom: SharedPetRoom | null,
  messages: PetMessage[],
  currentUserId: string,
  actorName: string,
  explicitEventKeys: SharedMemoryKey[] = [],
  now: Date = new Date()
): { nextState: GameState; newlyNotified: SharedMemory[] } {
  if (!sharedRoom) {
    return { nextState: state, newlyNotified: [] };
  }

  const todayKey = getMemoryDateKey(now);
  const album = state.memoryAlbum;
  const startedDate =
    album.sharedRoomId === sharedRoom.id && album.sharedRoomStartedDate
      ? album.sharedRoomStartedDate
      : todayKey;
  const coopAgeDays = daysBetweenDateKeys(startedDate, todayKey) + 1;

  const partnerActorName =
    sharedRoom.ownerId === currentUserId
      ? sharedRoom.partnerEmail?.split('@')[0] || '共養夥伴'
      : sharedRoom.ownerEmail?.split('@')[0] || '共養夥伴';
  const defaultActors = Array.from(
    new Set([actorName || '飼主', ...(sharedRoom.partnerId ? [partnerActorName] : [])])
  );

  const distinctMsgAuthors = new Set(messages.map((m) => m.authorId).filter(Boolean));
  const hasCoopTaskCompleted =
    state.coop.pendingRewards.length > 0 ||
    state.coop.earnedCards.length > 0 ||
    state.coop.dailyFarmOrder.completed ||
    state.coop.activeRoomSession?.status === 'completed' ||
    state.coop.unlockedBadges.length > 0;

  const hasPartnerFeed =
    state.dialogue.memoryEvents.some((ev) => ev.type === 'partnerFed') ||
    explicitEventKeys.includes('shared_first_feed');

  const sharedPet = state.pets.find((p) => p.isSharedCoopPet || p.id === 'pet_1') ?? getActivePet(state);

  const conditionByKey: Record<SharedMemoryKey, boolean> = {
    shared_first_naming:
      sharedPet.hatched || explicitEventKeys.includes('shared_first_naming'),
    shared_first_feed: hasPartnerFeed,
    shared_first_message:
      distinctMsgAuthors.size >= 2 ||
      explicitEventKeys.includes('shared_first_message'),
    shared_first_coop_task:
      hasCoopTaskCompleted || explicitEventKeys.includes('shared_first_coop_task'),
    shared_first_buy_furniture:
      explicitEventKeys.includes('shared_first_buy_furniture') ||
      (state.house.treasuryHistory.length > 0 &&
        state.house.collectedFurnitureIds.length > 0),
    shared_house_7_days: coopAgeDays >= 7,
    shared_house_30_days: coopAgeDays >= 30,
    shared_house_100_days: coopAgeDays >= 100,
  };

  const existingByKey = new Map<SharedMemoryKey, SharedMemory>();
  for (const sm of album.sharedMemories) {
    existingByKey.set(sm.key, sm);
  }

  let rewardCoins = 0;
  let rewardIntimacy = 0;
  const newlyUnlockedForTimeline: SharedMemory[] = [];
  const newlyNotified: SharedMemory[] = [];

  const nextSharedMemories: SharedMemory[] = SHARED_MEMORY_DEFINITIONS.map((def) => {
    const prev = existingByKey.get(def.key);
    const shouldUnlock = Boolean(prev?.unlocked) || conditionByKey[def.key];

    if (!shouldUnlock) {
      return (
        prev ?? {
          id: `smem_${def.key}`,
          key: def.key,
          title: def.title,
          description: def.description,
          emoji: def.emoji,
          unlocked: false,
          createdAt: null,
          dateKey: null,
          petName: sharedPet.name,
          actors: [],
          rewardCoins: def.rewardCoins,
          rewardIntimacy: def.rewardIntimacy,
          rewardCardTitle: def.rewardCardTitle,
          notifiedUserIds: [],
        }
      );
    }

    const wasUnlockedBefore = Boolean(prev?.unlocked);
    const prevNotified = prev?.notifiedUserIds ?? [];
    const needsNotification = !prevNotified.includes(currentUserId);
    const nextNotified = needsNotification
      ? [...prevNotified, currentUserId]
      : prevNotified;

    const mergedActors = Array.from(
      new Set([...(prev?.actors ?? []), ...defaultActors])
    );

    const updated: SharedMemory = {
      id: prev?.id ?? `smem_${def.key}`,
      key: def.key,
      title: def.title,
      description: def.description,
      emoji: def.emoji,
      unlocked: true,
      createdAt: prev?.createdAt ?? now.getTime(),
      dateKey: prev?.dateKey ?? todayKey,
      petName: prev?.petName || sharedPet.name,
      actors: mergedActors,
      rewardCoins: def.rewardCoins,
      rewardIntimacy: def.rewardIntimacy,
      rewardCardTitle: def.rewardCardTitle,
      notifiedUserIds: nextNotified,
    };

    if (!wasUnlockedBefore) {
      newlyUnlockedForTimeline.push(updated);
    }
    if (needsNotification) {
      rewardCoins += def.rewardCoins;
      rewardIntimacy += def.rewardIntimacy;
      newlyNotified.push(updated);
    }
    return updated;
  });

  if (
    newlyNotified.length === 0 &&
    newlyUnlockedForTimeline.length === 0 &&
    album.sharedRoomId === sharedRoom.id &&
    album.sharedRoomStartedDate === startedDate
  ) {
    return { nextState: state, newlyNotified: [] };
  }

  const withSharedPetIntimacy = updateActivePet(
    state,
    (pet) =>
      pet.id === sharedPet.id
        ? { ...pet, intimacy: pet.intimacy + rewardIntimacy }
        : pet
  );
  const nextPetsWithShared = withSharedPetIntimacy.pets.map((pet) =>
    pet.id === sharedPet.id && pet.id !== withSharedPetIntimacy.activePetId
      ? { ...pet, intimacy: pet.intimacy + rewardIntimacy }
      : pet
  );

  let nextState: GameState = {
    ...withSharedPetIntimacy,
    pets: nextPetsWithShared,
    coins: withSharedPetIntimacy.coins + rewardCoins,
    memoryAlbum: {
      ...album,
      sharedRoomId: sharedRoom.id,
      sharedRoomStartedDate: startedDate,
      sharedMemories: nextSharedMemories,
    },
  };

  for (const sm of newlyUnlockedForTimeline) {
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: `shared_mem_${sm.key}`,
      type: 'coop',
      title: `共同回憶：${sm.title}`,
      description: `${sm.description}（獲得「${sm.rewardCardTitle}」）`,
      emoji: sm.emoji,
      dateKey: sm.dateKey ?? todayKey,
      createdAt: sm.createdAt ?? now.getTime(),
      actorName: sm.actors.join(' & '),
      isShared: true,
    });
  }

  return { nextState, newlyNotified };
}

export function saveScenePhoto(
  state: GameState,
  params: {
    title: string;
    caption: string;
    scene: PhotoScene;
    poseId: PhotoPose;
    facing?: PetViewDirection;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }
): { nextState: GameState; photo: RoomPhotoRecord } {
  const activePet = getActivePet(state);
  const sceneMeta = PHOTO_SCENES.find((s) => s.id === params.scene) ?? PHOTO_SCENES[0];
  const cleanTitle =
    params.title.trim().slice(0, 20) ||
    `${activePet.name}的${sceneMeta.defaultTitleSuffix}`.slice(0, 20);
  const nowTs = Date.now();
  const photo: RoomPhotoRecord = {
    id: `photo_${nowTs}_${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    caption:
      params.caption.trim().slice(0, 60) ||
      `${sceneMeta.label}留念 · ${activePet.name} (${activePet.weight.toFixed(1)} kg)`,
    createdAt: nowTs,
    houseName: state.house.houseName,
    petId: activePet.id,
    species: activePet.species,
    petName: activePet.name,
    equipped: { ...activePet.accessories },
    poseId: 'normal',
    wallpaperId: state.house.roomLayout.wallpaperId,
    flooringId: state.house.roomLayout.flooringId,
    placedItems:
      params.scene === 'room' ? [...state.house.roomLayout.placedItems] : [],
    noteHighlight:
      params.scene === 'room' ? state.house.furnitureNotes[0]?.content : undefined,
    photoKind: params.scene,
    scene: params.scene,
    wardrobePoseId: params.poseId,
    facing: params.facing ?? 'front',
    filterId: params.filterId,
    frameId: params.frameId,
    stickers: params.stickers.slice(0, 6),
    weightAtCapture: activePet.weight,
    likes: [],
    comments: [],
  };

  let nextState: GameState = {
    ...state,
    house: {
      ...state.house,
      photos: [photo, ...state.house.photos].slice(0, 36),
    },
  };

  nextState = recordMonthlyActivity(nextState, { interactionLabel: '拍照留念' });
  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `photo_${photo.id}`,
    petId: activePet.id,
    type:
      params.scene === 'room'
        ? 'room'
        : params.scene === 'farm'
        ? 'farm'
        : 'wardrobe',
    title: `拍下「${photo.title}」`,
    description: `${sceneMeta.label}寫真紀念（當時體重 ${activePet.weight.toFixed(1)} kg）`,
    emoji: '📸',
    photoId: photo.id,
    weight: activePet.weight,
    level: activePet.level,
  });

  nextState = maybeGrantCatPhotoMemoryCard(nextState).nextState;

  return { nextState, photo };
}

export function buildMonthlyRecapDraft(
  state: GameState,
  monthKey: string,
  messages: PetMessage[],
  customCoverPhotoId?: string | null,
  now: Date = new Date()
): MonthlyRecap {
  const tracker = state.memoryAlbum.monthlyTrackers[monthKey];

  // Favorite food: prefer monthly tracker, fallback to feedLogs of monthKey
  const foodMap = new Map<string, number>();
  if (tracker) {
    for (const [k, v] of Object.entries(tracker.foodCounts)) {
      foodMap.set(k, (foodMap.get(k) ?? 0) + v);
    }
  }
  for (const log of state.feedLogs) {
    if (log.date.startsWith(monthKey)) {
      foodMap.set(log.foodId, (foodMap.get(log.foodId) ?? 0) + 1);
    }
  }
  let favoriteFoodId: string | null = null;
  let maxFoodQty = 0;
  foodMap.forEach((qty, id) => {
    if (qty > maxFoodQty) {
      maxFoodQty = qty;
      favoriteFoodId = id;
    }
  });
  const favoriteFoodDef = favoriteFoodId
    ? FOODS.find((f) => f.id === favoriteFoodId)
    : null;
  const favoriteFoodName = favoriteFoodDef
    ? `${favoriteFoodDef.emoji} ${favoriteFoodDef.name} (${maxFoodQty}次)`
    : '等待本月第一次餵食';

  // Top interaction
  let topInteractionLabel = '陪伴互動';
  let maxInt = 0;
  if (tracker) {
    for (const [label, count] of Object.entries(tracker.interactionCounts)) {
      if (count > maxInt) {
        maxInt = count;
        topInteractionLabel = `${label} (${count}次)`;
      }
    }
  }

  // Favorite accessory
  const accMap = new Map<string, number>();
  if (tracker) {
    for (const [k, v] of Object.entries(tracker.accessoryCounts)) {
      accMap.set(k, (accMap.get(k) ?? 0) + v);
    }
  }
  let favoriteAccessoryId: string | null = null;
  let maxAcc = 0;
  accMap.forEach((qty, id) => {
    if (qty > maxAcc) {
      maxAcc = qty;
      favoriteAccessoryId = id;
    }
  });
  if (!favoriteAccessoryId) {
    const activePet = getActivePet(state);
    const equippedFirst = Object.values(activePet.accessories).find(
      (id): id is string => Boolean(id)
    );
    favoriteAccessoryId = equippedFirst ?? state.accessories[0] ?? null;
  }
  const accDef = favoriteAccessoryId
    ? ACCESSORIES.find((a) => a.id === favoriteAccessoryId)
    : null;
  const favoriteAccessoryName = accDef
    ? `${accDef.emoji} ${accDef.name}`
    : '尚未穿戴配件';

  // Weight delta in month
  const monthWeightLogs = state.weightLogs
    .filter((w) => w.date.startsWith(monthKey))
    .sort((a, b) => a.timestamp - b.timestamp);
  let weightDelta = 0;
  if (monthWeightLogs.length >= 2) {
    weightDelta =
      Math.round(
        (monthWeightLogs[monthWeightLogs.length - 1].weight -
          monthWeightLogs[0].weight) *
          10
      ) / 10;
  } else if (
    tracker &&
    tracker.startWeight !== null &&
    tracker.endWeight !== null
  ) {
    weightDelta = Math.round((tracker.endWeight - tracker.startWeight) * 10) / 10;
  }

  // Messages count in month
  const monthMessagesCount = Math.max(
    tracker?.coopMessagesCount ?? 0,
    messages.filter((m) => getMonthKeyFromDate(new Date(m.createdAt)) === monthKey)
      .length
  );

  // Best photo of month (most likes + comments, or newest)
  const monthPhotos = state.house.photos.filter(
    (p) => getMonthKeyFromDate(new Date(p.createdAt)) === monthKey
  );
  const candidatePhotos = monthPhotos.length > 0 ? monthPhotos : state.house.photos;
  let bestPhoto: RoomPhotoRecord | null = null;
  let bestScore = -1;
  for (const p of candidatePhotos) {
    const score = (p.likes?.length ?? 0) * 2 + (p.comments?.length ?? 0);
    if (score > bestScore) {
      bestScore = score;
      bestPhoto = p;
    }
  }
  const bestPhotoId = bestPhoto?.id ?? null;
  const coverPhotoId =
    customCoverPhotoId && state.house.photos.some((p) => p.id === customCoverPhotoId)
      ? customCoverPhotoId
      : bestPhotoId;

  return {
    id: `recap_${monthKey}`,
    monthKey,
    createdAt: now.getTime(),
    generatedDateKey: getMemoryDateKey(now),
    favoriteFoodId,
    favoriteFoodName,
    topInteractionLabel,
    favoriteAccessoryId,
    favoriteAccessoryName,
    weightDelta,
    growthGained: tracker?.growthGained ?? 0,
    coopMessagesCount: monthMessagesCount,
    coopTasksCount: tracker?.coopTasksCount ?? 0,
    bestPhotoId,
    coverPhotoId,
    savedToAlbum: false,
  };
}

export function syncAutoMonthlyRecap(
  state: GameState,
  messages: PetMessage[],
  now: Date = new Date()
): GameState {
  let targetMonthKey: string | null = null;
  if (isLastDayOfMonth(now)) {
    targetMonthKey = getMonthKeyFromDate(now);
  } else if (isFirstDayOfMonth(now)) {
    targetMonthKey = getPreviousMonthKey(now);
  }
  if (!targetMonthKey) return state;

  const alreadyExists = state.memoryAlbum.monthlyRecaps.some(
    (r) => r.monthKey === targetMonthKey
  );
  if (alreadyExists) return state;

  const recap = buildMonthlyRecapDraft(state, targetMonthKey, messages, null, now);
  const nextRecaps = [recap, ...state.memoryAlbum.monthlyRecaps].slice(0, 12);

  let nextState: GameState = {
    ...state,
    memoryAlbum: {
      ...state.memoryAlbum,
      monthlyRecaps: nextRecaps,
    },
  };

  nextState = recordMemoryEntry(nextState, {
    uniqueKey: `monthly_recap_${targetMonthKey}`,
    type: 'milestone',
    title: `${targetMonthKey} 本月回顧卡出爐！`,
    description: `最愛食物：${recap.favoriteFoodName} · 體重變化 ${
      recap.weightDelta >= 0 ? `+${recap.weightDelta.toFixed(1)}` : recap.weightDelta.toFixed(1)
    } kg · 成長 +${recap.growthGained}`,
    emoji: '🗓️',
    photoId: recap.coverPhotoId ?? undefined,
    createdAt: now.getTime(),
  });

  return nextState;
}

export function saveOrUpdateMonthlyRecap(
  state: GameState,
  recap: MonthlyRecap,
  saveToTimeline = true
): GameState {
  const existingIdx = state.memoryAlbum.monthlyRecaps.findIndex(
    (r) => r.monthKey === recap.monthKey
  );
  const updatedRecap: MonthlyRecap = {
    ...recap,
    savedToAlbum: saveToTimeline ? true : recap.savedToAlbum,
  };
  const nextRecaps =
    existingIdx >= 0
      ? state.memoryAlbum.monthlyRecaps.map((r, i) =>
          i === existingIdx ? updatedRecap : r
        )
      : [updatedRecap, ...state.memoryAlbum.monthlyRecaps].slice(0, 12);

  let nextState: GameState = {
    ...state,
    memoryAlbum: {
      ...state.memoryAlbum,
      monthlyRecaps: nextRecaps,
    },
  };

  if (saveToTimeline) {
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: `monthly_recap_saved_${recap.monthKey}`,
      type: 'milestone',
      title: `珍藏 ${recap.monthKey} 月度回憶卡`,
      description: `最愛：${recap.favoriteFoodName} · 最常互動：${recap.topInteractionLabel} · 成長 +${recap.growthGained}`,
      emoji: '🗓️',
      photoId: updatedRecap.coverPhotoId ?? undefined,
    });
  }

  return nextState;
}

export function mergeMemoryAlbumRemoteState(
  localAlbum: MemoryAlbumState,
  remoteAlbum: MemoryAlbumState
): MemoryAlbumState {
  const memByKey = new Map<string, MemoryEntry>();
  for (const m of remoteAlbum.memories) {
    // Only merge shared co-op / default shared pet memories from remote; keep partner's personal pet memories isolated
    const isSharedOrDefaultPet =
      m.isShared || !m.petId || m.petId === 'pet_1';
    if (isSharedOrDefaultPet) {
      memByKey.set(m.uniqueKey || m.id, m);
    }
  }
  for (const lm of localAlbum.memories) {
    const k = lm.uniqueKey || lm.id;
    if (!memByKey.has(k)) {
      memByKey.set(k, lm);
    }
  }
  const mergedMemories = Array.from(memByKey.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 180);

  const favIds = Array.from(
    new Set([...remoteAlbum.favoriteMemoryIds, ...localAlbum.favoriteMemoryIds])
  );

  // Merge milestones (OR unlocked)
  const localMsMap = new Map(localAlbum.milestones.map((m) => [m.id, m]));
  const remoteMsMap = new Map(remoteAlbum.milestones.map((m) => [m.id, m]));
  const mergedMilestones = MILESTONE_DEFINITIONS.map((def) => {
    const lm = localMsMap.get(def.id);
    const rm = remoteMsMap.get(def.id);
    const unlocked = Boolean(lm?.unlocked || rm?.unlocked);
    return {
      ...def,
      unlocked,
      unlockedAt: rm?.unlockedAt ?? lm?.unlockedAt ?? null,
      unlockedDateKey: rm?.unlockedDateKey ?? lm?.unlockedDateKey ?? null,
    };
  });

  // Merge shared memories (preserve both partners' notification flags & actors)
  const localSmMap = new Map(localAlbum.sharedMemories.map((s) => [s.key, s]));
  const remoteSmMap = new Map(remoteAlbum.sharedMemories.map((s) => [s.key, s]));
  const mergedSharedMemories: SharedMemory[] = SHARED_MEMORY_DEFINITIONS.map((def) => {
    const ls = localSmMap.get(def.key);
    const rs = remoteSmMap.get(def.key);
    const unlocked = Boolean(ls?.unlocked || rs?.unlocked);
    return {
      id: rs?.id ?? ls?.id ?? `smem_${def.key}`,
      key: def.key,
      title: def.title,
      description: def.description,
      emoji: def.emoji,
      unlocked,
      createdAt: rs?.createdAt ?? ls?.createdAt ?? null,
      dateKey: rs?.dateKey ?? ls?.dateKey ?? null,
      petName: rs?.petName || ls?.petName || '布丁',
      actors: Array.from(new Set([...(rs?.actors ?? []), ...(ls?.actors ?? [])])),
      rewardCoins: def.rewardCoins,
      rewardIntimacy: def.rewardIntimacy,
      rewardCardTitle: def.rewardCardTitle,
      notifiedUserIds: Array.from(
        new Set([...(rs?.notifiedUserIds ?? []), ...(ls?.notifiedUserIds ?? [])])
      ),
    };
  });

  const recapMap = new Map<string, MonthlyRecap>();
  for (const r of localAlbum.monthlyRecaps) recapMap.set(r.monthKey, r);
  for (const r of remoteAlbum.monthlyRecaps) recapMap.set(r.monthKey, r);

  return {
    memories: mergedMemories,
    favoriteMemoryIds: favIds,
    milestones: mergedMilestones,
    sharedMemories: mergedSharedMemories,
    sharedRoomStartedDate:
      remoteAlbum.sharedRoomStartedDate ?? localAlbum.sharedRoomStartedDate,
    sharedRoomId: remoteAlbum.sharedRoomId ?? localAlbum.sharedRoomId,
    monthlyRecaps: Array.from(recapMap.values())
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
      .slice(0, 12),
    monthlyTrackers: {
      ...localAlbum.monthlyTrackers,
      ...remoteAlbum.monthlyTrackers,
    },
    unlockedPhotoPoses: Array.from(
      new Set([...localAlbum.unlockedPhotoPoses, ...remoteAlbum.unlockedPhotoPoses])
    ),
    unlockedPhotoFrames: Array.from(
      new Set([...localAlbum.unlockedPhotoFrames, ...remoteAlbum.unlockedPhotoFrames])
    ),
    savedDialogueIds: Array.from(
      new Set([...localAlbum.savedDialogueIds, ...remoteAlbum.savedDialogueIds])
    ),
  };
}
