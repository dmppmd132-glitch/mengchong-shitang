import {
  ACCESSORIES,
  ACCESSORY_RARITY_META,
  ACCESSORY_THEME_SETS,
  AccessoryRarityMeta,
  AccessoryThemeSetConfig,
} from '../data/accessories';
import {
  Accessory,
  AccessorySlot,
  AccessoryTheme,
  GameState,
  PhotoComment,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  RoomPhotoRecord,
} from '../types';
import { syncEncyclopediaRewards } from './encyclopedia';
import { maybeGrantCatPhotoMemoryCard } from './memories';
import { getActivePet } from './pets';

export function isAccessoryPurchasable(item: Accessory): boolean {
  return (
    (item.rarity === 'common' || item.rarity === 'advanced') &&
    item.price > 0 &&
    !item.initialUnlocked
  );
}

export function getAccessoryRarityMeta(item: Accessory): AccessoryRarityMeta {
  return ACCESSORY_RARITY_META[item.rarity];
}

export function getAccessoryObtainLabel(item: Accessory): string {
  if (item.obtainMethod) return item.obtainMethod;
  if (item.rarity === 'event') return '活動／成就限定解鎖';
  if (item.rarity === 'coop') return '共養合作限定解鎖';
  if (item.initialUnlocked) return '初始免費解鎖';
  return `${item.price} 金幣購買`;
}

export interface AccessoryThemeProgress {
  theme: AccessoryThemeSetConfig;
  collectedCount: number;
  totalCount: number;
  collectedIds: string[];
  missingIds: string[];
  isComplete: boolean;
  isClaimed: boolean;
}

export function getAccessoryThemeProgress(
  ownedAccessoryIds: string[],
  claimedThemes: AccessoryTheme[] = []
): AccessoryThemeProgress[] {
  const ownedSet = new Set(ownedAccessoryIds);
  return ACCESSORY_THEME_SETS.map((theme) => {
    const collectedIds = theme.accessoryIds.filter((id) => ownedSet.has(id));
    const missingIds = theme.accessoryIds.filter((id) => !ownedSet.has(id));
    const isComplete = collectedIds.length >= theme.accessoryIds.length;
    return {
      theme,
      collectedCount: collectedIds.length,
      totalCount: theme.accessoryIds.length,
      collectedIds,
      missingIds,
      isComplete,
      isClaimed: claimedThemes.includes(theme.id) || isComplete,
    };
  });
}

export function countEquippedAccessories(
  equipped: Record<AccessorySlot, string | null>
): number {
  return Object.values(equipped).filter((id): id is string => Boolean(id)).length;
}

export interface LimitedUnlockResult {
  nextState: GameState;
  newlyUnlockedIds: string[];
}

export function syncLimitedAccessoryUnlocks(state: GameState): LimitedUnlockResult {
  const ownedSet = new Set(state.accessories);
  const newlyUnlockedIds: string[] = [];

  const grantIfMissing = (id: string, condition: boolean) => {
    if (condition && !ownedSet.has(id)) {
      ownedSet.add(id);
      newlyUnlockedIds.push(id);
    }
  };

  // 1. 生日小皇冠：活動或成就獲得（寵物達 Lv.2 / 解鎖非新手稱號或配件里程碑 / 完成 2 項每日任務）
  const maxPetLevel = Math.max(...state.pets.map((p) => p.level), 1);
  const nonSproutTitleUnlocked = state.encyclopedia.unlockedTitles.some(
    (t) => t !== 'growth_sprout'
  );
  const qualifiesForBirthdayCrown =
    maxPetLevel >= 2 ||
    state.encyclopedia.claimedAccessoryMilestones.length >= 1 ||
    nonSproutTitleUnlocked ||
    state.noviceGrowth.completedDailyTasksCount >= 2;
  grantIfMissing('birthday_mini_crown', qualifiesForBirthdayCrown);

  // 2. 派對星星眼鏡：小遊戲成就獲得（解鎖任一小遊戲徽章）
  const qualifiesForPartyGlasses = state.minigameHub.unlockedBadges.length >= 1;
  grantIfMissing('party_star_glasses', qualifiesForPartyGlasses);

  // 3. 彩帶領結：共養合作任務或共養里程碑獲得
  const qualifiesForCoopRibbon =
    state.coop.streakDays >= 1 ||
    state.coop.unlockedBadges.length >= 1 ||
    state.coop.pendingRewards.length >= 1 ||
    state.coop.dailyFarmOrder.completed;
  grantIfMissing('ribbon_bowtie', qualifiesForCoopRibbon);

  // 4. 派對小披風：7 天成長之路第 7 天獲得
  const qualifiesForPartyCape = state.noviceGrowth.claimedDays.includes(7);
  grantIfMissing('party_mini_cape', qualifiesForPartyCape);

  // 5. 星願閃亮髮夾：寵物進化達 Lv.3 自動解鎖
  grantIfMissing('starlight_spark_pin', maxPetLevel >= 3);

  // 6. 巨星閃耀手杖：寵物進化達 Lv.4 自動解鎖
  grantIfMissing('superstar_star_wand', maxPetLevel >= 4);

  if (newlyUnlockedIds.length === 0) {
    return { nextState: state, newlyUnlockedIds: [] };
  }

  return {
    nextState: {
      ...state,
      accessories: Array.from(ownedSet),
    },
    newlyUnlockedIds,
  };
}

/**
 * 兩段式同步：先檢查限定配件條件 -> 結算圖鑑里程碑與套裝稱號 -> 再補檢查一次成就觸發之限定配件
 */
export function syncAllAccessoryProgress(state: GameState): {
  nextState: GameState;
  newlyUnlockedIds: string[];
  newlyCompletedThemes: AccessoryTheme[];
} {
  const pass1 = syncLimitedAccessoryUnlocks(state);
  const encRes = syncEncyclopediaRewards(pass1.nextState);
  const pass2 = syncLimitedAccessoryUnlocks(encRes.nextState);
  const finalEnc =
    pass2.newlyUnlockedIds.length > 0
      ? syncEncyclopediaRewards(pass2.nextState)
      : encRes;

  return {
    nextState: finalEnc.nextState,
    newlyUnlockedIds: [...pass1.newlyUnlockedIds, ...pass2.newlyUnlockedIds],
    newlyCompletedThemes: [
      ...encRes.newlyCompletedThemes,
      ...(finalEnc !== encRes ? finalEnc.newlyCompletedThemes : []),
    ],
  };
}

export function getAccessoryNamesByIds(ids: string[]): string[] {
  return ids
    .map((id) => ACCESSORIES.find((a) => a.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

export function saveWardrobePhoto(
  state: GameState,
  params: {
    title: string;
    caption: string;
    poseId: PhotoPose;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
  }
): { nextState: GameState; photo: RoomPhotoRecord } {
  const activePet = getActivePet(state);
  const photo: RoomPhotoRecord = {
    id: `wphoto_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: params.title.trim() || `${activePet.name}的穿搭寫真`,
    caption:
      params.caption.trim() ||
      `換上最喜歡的造型留下閃耀紀念！`,
    createdAt: Date.now(),
    houseName: state.house.houseName,
    petId: activePet.id,
    species: activePet.species,
    petName: activePet.name,
    equipped: { ...activePet.accessories },
    poseId: 'normal',
    wallpaperId: state.house.roomLayout.wallpaperId,
    flooringId: state.house.roomLayout.flooringId,
    placedItems: [],
    photoKind: 'wardrobe',
    wardrobePoseId: params.poseId,
    filterId: params.filterId,
    frameId: params.frameId,
    likes: [],
    comments: [],
  };

  const withPhoto: GameState = {
    ...state,
    house: {
      ...state.house,
      photos: [photo, ...state.house.photos].slice(0, 36),
    },
  };

  return {
    photo,
    nextState: maybeGrantCatPhotoMemoryCard(withPhoto).nextState,
  };
}

export function togglePhotoLike(
  state: GameState,
  photoId: string,
  userId: string
): GameState {
  const actor = userId || 'local';
  const nextPhotos = state.house.photos.map((photo) => {
    if (photo.id !== photoId) return photo;
    const prevLikes = photo.likes ?? [];
    const exists = prevLikes.includes(actor);
    const nextLikes = exists
      ? prevLikes.filter((id) => id !== actor)
      : [...prevLikes, actor];
    return {
      ...photo,
      likes: nextLikes,
    };
  });

  return {
    ...state,
    house: {
      ...state.house,
      photos: nextPhotos,
    },
  };
}

export function addPhotoComment(
  state: GameState,
  photoId: string,
  authorId: string,
  authorName: string,
  content: string
): { nextState: GameState; added: boolean } {
  const clean = content.trim().slice(0, 80);
  if (!clean) return { nextState: state, added: false };

  const newComment: PhotoComment = {
    id: `pcom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    authorId: authorId || 'local',
    authorName: authorName.trim() || '飼主',
    content: clean,
    createdAt: Date.now(),
  };

  const nextPhotos = state.house.photos.map((photo) => {
    if (photo.id !== photoId) return photo;
    const prevComments = photo.comments ?? [];
    return {
      ...photo,
      comments: [...prevComments, newComment].slice(-30),
    };
  });

  return {
    added: true,
    nextState: {
      ...state,
      house: {
        ...state.house,
        photos: nextPhotos,
      },
    },
  };
}
