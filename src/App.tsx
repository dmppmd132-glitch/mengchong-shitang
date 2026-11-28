import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckSquare, Cloud, Coins, Volume2, VolumeX } from 'lucide-react';
import { AuthSyncModal } from './components/AuthSyncModal';
import { BirthdayModal, BirthdayModalTab } from './components/birthday/BirthdayModal';
import { BottomTabBar } from './components/BottomTabBar';
import { CanteenSection, CanteenView } from './components/CanteenView';
import { CollectionCelebrationModal } from './components/collection/CollectionCelebrationModal';
import { CoopHubModal } from './components/coop/CoopHubModal';
import { DialogueHistoryModal } from './components/dialogue/DialogueHistoryModal';
import { EncyclopediaSection } from './components/EncyclopediaView';
import { SeasonalEventModal } from './components/events/SeasonalEventModal';
import { GrowthRoadmapModal } from './components/GrowthRoadmapModal';
import { HomeView } from './components/HomeView';
import { HouseSubTab, HouseView } from './components/house/HouseView';
import {
  MinigameHubModal,
  MinigameSettlementSummary,
} from './components/minigames/MinigameHubModal';
import { IntroHatching } from './components/IntroHatching';
import { JournalSection, JournalView } from './components/JournalView';
import { LevelUpModal } from './components/LevelUpModal';
import { MemoryDetailModal } from './components/memories/MemoryDetailModal';
import { ShareCardModal } from './components/memories/ShareCardModal';
import { MessageBoardModal } from './components/MessageBoardModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PersonalityProfileModal } from './components/PersonalityProfileView';
import { PhotoContestModal } from './components/photoContest/PhotoContestModal';
import { PetListView } from './components/pets/PetListView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { PWAUpdateBanner } from './components/PWAUpdateBanner';
import { QuestsView } from './components/QuestsView';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { SeasonEventModal } from './components/seasons/SeasonEventModal';
import { WeatherCenterModal } from './components/seasons/WeatherCenterModal';
import { SharedPetModal } from './components/SharedPetModal';
import { TownOrderBoardModal } from './components/visitors/TownOrderBoardModal';
import { VisitorModal } from './components/visitors/VisitorModal';
import { TownMapModal, TownMapTab } from './components/town/TownMapModal';
import { WardrobePhotoModal } from './components/WardrobePhotoModal';
import { WardrobeView } from './components/WardrobeView';
import { ACCESSORY_THEME_BY_ID } from './data/accessories';
import { FOOD_CATEGORY_LABELS } from './data/foods';
import { getTitleDefinition } from './data/encyclopedia';
import {
  PRESTIGE_STAR_REWARD_COINS,
  STAGE_LEVEL_REWARDS,
  computeGrowthGain,
  getGrowthStage,
  getPrestigeStarInfo,
  getRoundnessTier,
} from './data/growth';
import { ROOM_ITEM_BY_ID } from './data/house';
import { INGREDIENT_IDS, INGREDIENTS } from './data/kitchen';
import { MINIGAME_BY_ID, MINIGAME_WEEKLY_CHALLENGES } from './data/minigames';
import { NOVICE_GROWTH_DAYS, STAGE_BACKGROUNDS } from './data/noviceGrowth';
import { PET_PREFERENCES } from './data/personality';
import { PHOTO_POSE_BY_ID } from './data/photoStudio';
import {
  TOUCH_ZONE_META,
  getPetSpeciesInfo,
  getRandomZoneSpeech,
  pickRandomNonRepeating,
} from './data/species';
import { getStickerById } from './data/stickers';
import {
  COOLING_FOOD_IDS,
  SEASON_META,
  WEATHER_AUTO_REFRESH_MS,
} from './data/seasons';
import { VISITOR_BY_ID } from './data/visitors';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  fetchCloudSave,
  signOutCloud,
  upsertCloudSave,
} from './services/cloudSync';
import {
  deleteSharedMessage,
  fetchSharedMessages,
  sendSharedMessage,
  subscribeToSharedMessages,
} from './services/messageBoard';
import {
  createSharedPetRoom,
  fetchMySharedPet,
  joinSharedPetByCode,
  leaveSharedPetRoom,
  regenerateSharedInviteCode,
  subscribeToSharedPet,
  updateSharedPetSave,
} from './services/sharedPet';
import {
  Accessory,
  ActiveTownLocationId,
  BirthdayCake,
  BirthdayCakeBase,
  BirthdayCakeCream,
  BirthdayCakeDecor,
  BirthdayCakeId,
  BirthdayDecorationId,
  BirthdayGiftId,
  BirthdayLeapChoice,
  BirthdayPantryState,
  CloudSavePayload,
  CoopBirthdayTaskKey,
  CloudSyncStatus,
  CloudUser,
  CollectionCategoryId,
  CollectionItem,
  CollectionJumpTarget,
  DialogueLine,
  DialogueSettings,
  DuoPhotoPetInfo,
  EventMilestoneId,
  FamilyTaskId,
  FarmDecorationId,
  FarmUpgradeId,
  FeedLog,
  FeedingVisualEffect,
  FloatingFeedback,
  Food,
  GameState,
  GrowthStageInfo,
  IngredientId,
  KitchenRecipe,
  MemoryEntry,
  MonthlyRecap,
  Pet,
  PetExpression,
  PetMessage,
  PetSpecies,
  PetStickerId,
  PetTouchZone,
  PetViewDirection,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScene,
  PhotoStickerId,
  PiggyActionState,
  RoomPhotoRecord,
  SeasonRoomThemeId,
  SeasonYardThemeId,
  SharedPetRoom,
  StageBackgroundId,
  TabKey,
  ThemeSetId,
  TitleId,
  TownVisitorId,
  VisitorHutFacilityId,
  VisitorId,
  VisitorOffering,
  VisitorTreatId,
  WeightLog,
} from './types';
import { MinigameResult, MinigameWeeklyChallengeId } from './types/minigame';
import {
  acknowledgeOfflinePartnerEvents,
  claimCoopReward,
  claimCoopVisitorReward,
  contributeCoopVisitorItem,
  cookCoopOrderRecipe,
  depositIngredientToCoopWarehouse,
  getOfflinePartnerEvents,
  harvestCoopCropToWarehouse,
  markCoopVisitorPhotoShared,
  mergeCoopRemoteState,
  placeCoopCandidateInRoom,
  plantCoopCrop,
  selectCoopFurnitureForQueue,
  settleRoomDecorSession,
  startRoomDecorSession,
  syncCoopHubState,
} from './utils/coop';
import {
  appendMemoryEvent,
  dismissActiveDialogue,
  evaluateAndSelectDialogue,
  respondToActiveDialogue,
  updateDialogueSettings,
} from './utils/dialogue';
import {
  addPhotoComment,
  isAccessoryPurchasable,
  syncAllAccessoryProgress,
  togglePhotoLike,
} from './utils/accessories';
import {
  CollectionCelebrationEvent,
  computeCollectionProgress,
  dismissDailyCollectionReminder,
  getDailyCollectionReminder,
  recordAccessoryWear,
  setCollectionReminderEnabled,
  syncCollectionProgress,
} from './utils/collection';
import { syncEncyclopediaRewards } from './utils/encyclopedia';
import { resolveFeedingOutcome } from './utils/feeding';
import {
  PaymentSource,
  buyOrToggleFarmDecoration,
  expandNextFarmPlot,
  getEffectiveGrowDurationMs,
  getEffectiveHarvestYield,
  getIngredientStorageCap,
  updateHouseName,
  upgradeFarmFacility,
} from './utils/house';
import {
  claimWeeklyMinigameChallenge,
  settleMinigameOutcome,
} from './utils/minigame';
import {
  evaluateAndSyncMilestones,
  evaluateAndSyncSharedMemories,
  maybeGrantCatPhotoMemoryCard,
  recordMemoryEntry,
  recordMonthlyActivity,
  saveDialogueToMemories,
  saveOrUpdateMonthlyRecap,
  saveScenePhoto,
  syncAutoMonthlyRecap,
  toggleFavoriteMemory,
} from './utils/memories';
import { evaluateAllNoviceDays, getLocalDateString } from './utils/noviceGrowth';
import {
  formatCropDurationLabel,
  formatWaterBoostLabel,
  getCropGrowthState,
  getExpectedCropDurationMs,
  getTimeOfDayPeriod,
  getWaterBoostMs,
} from './utils/farmGrowth';
import {
  applyPersonalityDevelopment,
  createInitialPetPersonality,
  evaluateAccessoryPreference,
} from './utils/personality';
import {
  adoptNewPet,
  claimFamilyDailyTaskReward,
  claimPetSlotReward,
  evaluatePetSlots,
  getActivePet,
  getActivePetAbilityBonus,
  getDefaultWeightForSpecies,
  getPetDisplayPersonality,
  incrementFamilyTaskProgress,
  switchActivePet,
  syncFamilyDailyTasks,
  updateActivePet,
  updatePetById,
} from './utils/pets';
import {
  buyStudioBackground,
  buyStudioFilter,
  buyStudioFrame,
  buyStudioPose,
  buyStudioSticker,
  claimCoopDuoChallengeReward,
  claimWeeklyOutfitTier,
  craftStudioRecipe,
  getPhotoStudioState,
  getStudioCollectionProgress,
  getWeeklyOutfitChallengeTheme,
  submitCoopDuoChallengeEntry,
  submitWeeklyOutfitChallenge,
  syncPhotoStudioState,
} from './utils/photoStudio';
import { ShareCardPayload } from './utils/shareCardCanvas';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import { soundFX, triggerHaptic } from './utils/sound';
import {
  applyTimeDecay,
  clampStat,
  clampWeight,
  formatLocalDate,
  formatLocalTime,
  incrementTaskProgress,
  loadGameState,
  resetGameState,
  roundWeight,
  saveGameState,
  syncDailyTasks,
} from './utils/storage';
import {
  advancePhotoTownOrders,
  claimTownOrderReward,
  deliverTownOrderItem,
  syncTownOrders,
} from './utils/townOrders';
import {
  advanceCoopTownExploreStep,
  buyMarketFurniture,
  buyTownShopItem,
  buyVisitorHutFacility,
  captureTownVisitorPhoto,
  claimCoopTownReward,
  claimLocationAllQuestsBonus,
  claimLocationEncyclopediaReward,
  claimLocationQuestReward,
  deliverMarketDish,
  enterTownLocation,
  feedTownVisitor,
  forageForestAcorn,
  recordTownLocationPhoto,
  settleLakeFishingMinigame,
  spawnTownLocationVisitor,
  syncCoopTownExploration,
  syncTownMapState,
  upgradeVisitorHut,
} from './utils/townMap';
import {
  applyEventOnCookStrawberry,
  applyEventOnFeedStrawberry,
  applyEventOnHarvestStrawberry,
  applyEventOnMinigamePlayed,
  applyEventOnPlantStrawberry,
  applyEventOnStrawberryPhoto,
  buyEventShopItem,
  claimCoopEventSessionReward,
  claimEventChallengeTier,
  claimEventDailyTask,
  claimEventMilestone,
  convertRemainingEventTickets,
  createStrawberryPicnicPhoto,
  getEventActionBadgeCount,
  isStrawberryRecipe,
  saveEventRecapToMemories,
  selectEventRecapCoverPhoto,
  submitEventPhotoChallenge,
  syncSeasonalEventState,
} from './utils/seasonalEvent';
import {
  buyVisitorTreat,
  captureVisitorPhoto,
  craftShardFurniture,
  dismissVisitorArrivalNotice,
  feedVisitor,
  syncVisitorSystem,
  useFarmSpeedTicket,
} from './utils/visitors';
import {
  advanceSakuraCoopStep,
  advanceSakuraEventTask,
  advanceWeatherTaskProgress,
  applyRainAutoWaterToPlots,
  buySakuraShopItem,
  claimSakuraCoopReward,
  claimSakuraEventTask,
  claimWeatherTask,
  createInitialSeasonSystemState,
  dismissSeasonNotice,
  dismissSeasonOfflineSummary,
  evaluateCropConditions,
  evaluateCropSeasonAndWeather,
  fetchAndApplyWeather,
  getSeasonFromDate,
  maybeTriggerWindblownPlot,
  mergeSeasonSystemRemoteState,
  selectWeatherCity,
  stabilizeWindblownPlot,
  switchSeasonRoomTheme,
  switchSeasonYardTheme,
  syncSeasonSystemState,
  unlockWinterSnowPhotoBonus,
} from './utils/seasons';
import {
  addBirthdayCardBlessing,
  applyBirthdayOnPhotoTaken,
  bakeBirthdayCake,
  buyBirthdayDecoration,
  buyBirthdayGift,
  buyBirthdayPantryItem,
  buyBirthdayTicketShopItem,
  celebrateEatBirthdayCake,
  claimBirthdayOrder,
  claimBirthdayTask,
  claimCoopBirthdayReward,
  contributeCoopBirthdayStep,
  finalizeBirthdayCard,
  getBirthdaySystemState,
  getOrCreateCoopBirthdaySession,
  getPrimaryBirthdayPetStatus,
  markBirthdayCardShared,
  mergeBirthdaySystemRemoteState,
  placeBirthdayCake,
  reserveBirthdayCake,
  syncBirthdaySystemState,
  updatePetBirthday,
} from './utils/birthday';
import {
  mergePhotoContestRemoteState,
  syncPhotoContestState,
} from './utils/photoContest';
import { usePhotoContest } from './hooks/usePhotoContest';

export default function App() {
  const [game, setGame] = useState<GameState>(() => loadGameState());
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [questsInitialSection, setQuestsInitialSection] = useState<'daily' | 'growth'>('daily');
  const [journalInitialSection, setJournalInitialSection] =
    useState<JournalSection>('journal');
  const [journalEncyclopediaSection, setJournalEncyclopediaSection] =
    useState<EncyclopediaSection>('foods');
  const [canteenInitialSection, setCanteenInitialSection] =
    useState<CanteenSection>('shop');
  const [canteenHighlightedRecipeId, setCanteenHighlightedRecipeId] =
    useState<string | null>(null);
  const [houseInitialTab, setHouseInitialTab] = useState<HouseSubTab>('room');
  const [actionState, setActionState] = useState<PiggyActionState>('idle');
  const [expressionState, setExpressionState] = useState<PetExpression>('normal');
  const [flyingFoodEmoji, setFlyingFoodEmoji] = useState<string | null>(null);
  const [feedEffect, setFeedEffect] = useState<FeedingVisualEffect>('none');
  const [feedParticles, setFeedParticles] = useState<string[]>([]);
  const [speech, setSpeech] = useState<string>('今天也想吃好吃的！');
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [levelUpStage, setLevelUpStage] = useState<GrowthStageInfo | null>(null);
  const [levelUpPrestigeStar, setLevelUpPrestigeStar] = useState<number | null>(null);
  const [levelUpRewardText, setLevelUpRewardText] = useState<string | null>(null);
  const [growthRoadmapOpen, setGrowthRoadmapOpen] = useState<boolean>(false);
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('local');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [sharedModalOpen, setSharedModalOpen] = useState<boolean>(false);
  const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);
  const [minigameOpen, setMinigameOpen] = useState<boolean>(false);
  const [coopModalOpen, setCoopModalOpen] = useState<boolean>(false);
  const [eventModalOpen, setEventModalOpen] = useState<boolean>(false);
  const [visitorModalOpen, setVisitorModalOpen] = useState<boolean>(false);
  const [townOrderModalOpen, setTownOrderModalOpen] = useState<boolean>(false);
  const [townMapOpen, setTownMapOpen] = useState<boolean>(false);
  const [townMapInitialTab, setTownMapInitialTab] = useState<TownMapTab>('map');
  const [townMapFocusLocationId, setTownMapFocusLocationId] =
    useState<ActiveTownLocationId | null>(null);
  const [weatherCenterOpen, setWeatherCenterOpen] = useState<boolean>(false);
  const [seasonFestivalOpen, setSeasonFestivalOpen] = useState<boolean>(false);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [birthdayModalOpen, setBirthdayModalOpen] = useState<boolean>(false);
  const [birthdayModalTab, setBirthdayModalTab] = useState<BirthdayModalTab>('overview');
  const [birthdayNotice, setBirthdayNotice] = useState<string>('');
  const [birthdayError, setBirthdayError] = useState<string>('');
  const [personalityModalOpen, setPersonalityModalOpen] = useState<boolean>(false);
  const [dialogueHistoryOpen, setDialogueHistoryOpen] = useState<boolean>(false);
  const [wardrobePhotoOpen, setWardrobePhotoOpen] = useState<boolean>(false);
  const [wardrobePhotoScene, setWardrobePhotoScene] = useState<PhotoScene>('wardrobe');
  const [wardrobePhotoTab, setWardrobePhotoTab] = useState<
    'shoot' | 'shop' | 'challenge' | 'duo' | 'catalog'
  >('shoot');
  const [wardrobePhotoVisitorId, setWardrobePhotoVisitorId] = useState<VisitorId | null>(null);
  const [wardrobePhotoTownLocationId, setWardrobePhotoTownLocationId] =
    useState<ActiveTownLocationId | null>(null);
  const [wardrobePhotoTownVisitorId, setWardrobePhotoTownVisitorId] =
    useState<TownVisitorId | null>(null);
  const [shareCardPayload, setShareCardPayload] = useState<ShareCardPayload | null>(null);
  const [selectedMemoryEntry, setSelectedMemoryEntry] = useState<MemoryEntry | null>(null);
  const [collectionCelebrations, setCollectionCelebrations] = useState<
    CollectionCelebrationEvent[]
  >([]);
  const [wardrobeReactionText, setWardrobeReactionText] = useState<string | null>(null);
  const [pendingCloudSave, setPendingCloudSave] = useState<CloudSavePayload | null>(null);
  const [sharedRoom, setSharedRoom] = useState<SharedPetRoom | null>(null);
  const [sharedMessages, setSharedMessages] = useState<PetMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [freeSeeds, setFreeSeeds] = useState<Partial<Record<IngredientId, number>>>(() => {
    try {
      const raw = localStorage.getItem('farm_free_seeds_v1');
      if (!raw) return {};
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      const result: Partial<Record<IngredientId, number>> = {};
      for (const id of INGREDIENT_IDS) {
        const val = (parsed as Record<string, unknown>)[id];
        if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
          result[id] = Math.floor(val);
        }
      }
      return result;
    } catch {
      return {};
    }
  });
  const [puppyTreasureReady, setPuppyTreasureReady] = useState<boolean>(false);
  const [cropNotifyEnabled, setCropNotifyEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mengchong_crop_notify_v1') === '1';
    } catch {
      return false;
    }
  });
  const lastPuppyTreasureAtRef = useRef<number>(Date.now());
  const notifiedReadyPlotsRef = useRef<Set<string>>(new Set());

  const currentUserId = cloudUser?.id ?? 'local';
  const actorName = cloudUser?.email ? cloudUser.email.split('@')[0] || '飼主' : '飼主';
  const {
    showUpdateBanner,
    updating: updatingApp,
    applyUpdate: handleApplyAppUpdate,
    dismissUpdate: handleDismissAppUpdate,
  } = usePWAUpdate();

  const activePet = getActivePet(game);
  const activePersonality = getPetDisplayPersonality(game, activePet);
  const activeAbility = getActivePetAbilityBonus(game);
  const petSlotsSummary = evaluatePetSlots(game, Boolean(sharedRoom));

  const actionTimerRef = useRef<number | null>(null);
  const feedPhaseTimerRef = useRef<number | null>(null);
  const prevActivePetIdRef = useRef<string>(activePet.id);
  const prevStageLevelRef = useRef<number>(
    getGrowthStage(activePet.growth, activePet.species).level
  );
  const prevPrestigeStarsRef = useRef<number>(
    getPrestigeStarInfo(activePet.growth).stars
  );
  const gameRef = useRef<GameState>(game);
  const skipNextCloudUploadRef = useRef<boolean>(false);
  const lastHandledUserIdRef = useRef<string | null>(null);
  const lastSharedUpdatedAtRef = useRef<string | null>(null);
  const messageModalOpenRef = useRef<boolean>(messageModalOpen);
  const lastSpeechRef = useRef<string>('');
  const lastExpressionRef = useRef<PetExpression>('normal');
  const prevMilestonesCountRef = useRef<number>(
    game.encyclopedia.claimedAccessoryMilestones.length
  );
  const prevRecipeMilestonesCountRef = useRef<number>(
    (game.encyclopedia.claimedRecipeMilestones ?? []).length
  );
  const prevTitlesCountRef = useRef<number>(
    game.encyclopedia.unlockedTitles.length
  );
  const lastAnnouncedVisitIdRef = useRef<string | null>(
    game.visitorState?.activeVisit?.visitId ?? null
  );

  gameRef.current = game;
  messageModalOpenRef.current = messageModalOpen;

  useEffect(() => {
    saveGameState(game);
  }, [game]);

  useEffect(() => {
    if (!activePet.hatched) return;
    const syncRes = syncCollectionProgress(game, Boolean(sharedRoom));
    if (syncRes.nextState !== game) {
      setGame(syncRes.nextState);
    }
    if (syncRes.celebrations.length > 0) {
      soundFX.levelUp(game.soundEnabled);
      setCollectionCelebrations((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        const fresh = syncRes.celebrations.filter((c) => !seen.has(c.id));
        return fresh.length > 0 ? [...prev, ...fresh] : prev;
      });
    }
  }, [activePet.hatched, game, sharedRoom]);

  const collectionProgress = useMemo(
    () => computeCollectionProgress(game, Boolean(sharedRoom)),
    [game, sharedRoom]
  );

  const dailyCollectionReminder = useMemo(
    () =>
      activePet.hatched
        ? getDailyCollectionReminder(game, Boolean(sharedRoom))
        : null,
    [activePet.hatched, game, sharedRoom]
  );

  useEffect(() => {
    try {
      localStorage.setItem('farm_free_seeds_v1', JSON.stringify(freeSeeds));
    } catch {
      // Ignore storage quota errors
    }
  }, [freeSeeds]);

  useEffect(() => {
    if (puppyTreasureReady) return;
    const elapsed = Date.now() - lastPuppyTreasureAtRef.current;
    const delay = Math.max(200, 30_000 - elapsed);
    const timer = window.setTimeout(() => {
      setPuppyTreasureReady(true);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [puppyTreasureReady]);

  useEffect(() => {
    try {
      localStorage.setItem('mengchong_crop_notify_v1', cropNotifyEnabled ? '1' : '0');
    } catch {
      // Ignore storage quota errors
    }
  }, [cropNotifyEnabled]);

  useEffect(() => {
    const milestoneLen = game.encyclopedia.claimedAccessoryMilestones.length;
    if (milestoneLen > prevMilestonesCountRef.current) {
      const latest = game.encyclopedia.claimedAccessoryMilestones[milestoneLen - 1];
      pushFeedback(`收集 ${latest} 款配件里程碑 +50 金幣！`, '🎉');
    }
    prevMilestonesCountRef.current = milestoneLen;

    const recipeMilestones = game.encyclopedia.claimedRecipeMilestones ?? [];
    if (recipeMilestones.length > prevRecipeMilestonesCountRef.current) {
      const latestRecipeMilestone = recipeMilestones[recipeMilestones.length - 1];
      pushFeedback(`收集 ${latestRecipeMilestone} 道食譜里程碑 +60 金幣！`, '👩‍🍳');
    }
    prevRecipeMilestonesCountRef.current = recipeMilestones.length;

    const titlesLen = game.encyclopedia.unlockedTitles.length;
    if (titlesLen > prevTitlesCountRef.current) {
      const latestTitleId = game.encyclopedia.unlockedTitles[titlesLen - 1];
      const def = getTitleDefinition(latestTitleId);
      soundFX.levelUp(game.soundEnabled);
      pushFeedback(`獲得稱號「${def.name}」！`, def.emoji);
      setSpeech(`太厲害了！我們獲得專屬稱號「${def.name}」囉！`);
    }
    prevTitlesCountRef.current = titlesLen;
  }, [
    game.encyclopedia.claimedAccessoryMilestones,
    game.encyclopedia.claimedRecipeMilestones,
    game.encyclopedia.unlockedTitles,
    game.soundEnabled,
  ]);

  const applyCloudStateLocally = useCallback((cloudState: GameState, customSpeech?: string) => {
    skipNextCloudUploadRef.current = true;
    const cloudActive = getActivePet(cloudState);
    prevActivePetIdRef.current = cloudActive.id;
    prevStageLevelRef.current = getGrowthStage(
      cloudActive.growth,
      cloudActive.species
    ).level;
    prevPrestigeStarsRef.current = getPrestigeStarInfo(cloudActive.growth).stars;
    setGame(cloudState);
    setSpeech(customSpeech ?? `歡迎回來，${cloudActive.name}！`);
  }, []);

  const syncAfterSignIn = useCallback(
    async (user: CloudUser, openModalOnConflict: boolean) => {
      setSyncStatus('syncing');
      setSyncError(null);

      // 1. 優先檢查是否已加入兩人共養小屋
      const sharedRes = await fetchMySharedPet(user.id);
      if (sharedRes.room) {
        setSharedRoom(sharedRes.room);
        lastSharedUpdatedAtRef.current = sharedRes.room.updatedAt;
        if (sharedRes.state) {
          const sharedActive = getActivePet(sharedRes.state);
          applyCloudStateLocally(
            sharedRes.state,
            `回到與夥伴共養的「${sharedActive.name}」身邊囉！`
          );
        }
        setPendingCloudSave(null);
        setSyncStatus('synced');
        setLastSyncedAt(sharedRes.room.updatedAt);
        return;
      }

      setSharedRoom(null);

      // 2. 若未加入共養，改同步個人雲端存檔
      const { state: cloudState, updatedAt, error } = await fetchCloudSave(user.id);

      if (error) {
        setSyncStatus('error');
        setSyncError(error);
        return;
      }

      const currentLocal = gameRef.current;
      const localActive = getActivePet(currentLocal);

      if (cloudState) {
        if (!localActive.hatched) {
          applyCloudStateLocally(cloudState);
          setSyncStatus('synced');
          setLastSyncedAt(updatedAt);
          setPendingCloudSave(null);
          return;
        }

        if (cloudState.lastSavedAt === currentLocal.lastSavedAt) {
          setSyncStatus('synced');
          setLastSyncedAt(updatedAt);
          setPendingCloudSave(null);
          return;
        }

        setPendingCloudSave({
          state: cloudState,
          updatedAt: updatedAt ?? new Date().toISOString(),
        });
        setSyncStatus('local');
        if (openModalOnConflict) {
          setAuthModalOpen(true);
        }
        return;
      }

      if (localActive.hatched) {
        const uploaded = await upsertCloudSave(user.id, currentLocal);
        if (uploaded.error) {
          setSyncStatus('error');
          setSyncError(uploaded.error);
        } else {
          setSyncStatus('synced');
          setLastSyncedAt(uploaded.updatedAt);
        }
      } else {
        setSyncStatus('synced');
      }
    },
    [applyCloudStateLocally]
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const nextUser: CloudUser = {
          id: sessionUser.id,
          email: sessionUser.email ?? '',
        };
        setCloudUser(nextUser);
        if (lastHandledUserIdRef.current !== nextUser.id) {
          lastHandledUserIdRef.current = nextUser.id;
          void syncAfterSignIn(nextUser, false);
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const sessionUser = session?.user;
      if (sessionUser) {
        const nextUser: CloudUser = {
          id: sessionUser.id,
          email: sessionUser.email ?? '',
        };
        setCloudUser(nextUser);
        if (lastHandledUserIdRef.current !== nextUser.id) {
          lastHandledUserIdRef.current = nextUser.id;
          void syncAfterSignIn(nextUser, true);
        }
      } else {
        lastHandledUserIdRef.current = null;
        lastSharedUpdatedAtRef.current = null;
        setCloudUser(null);
        setSharedRoom(null);
        setPendingCloudSave(null);
        setSyncStatus('local');
        setSyncError(null);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncAfterSignIn]);

  // 兩人共養即時訂閱（Supabase Realtime）＋回到頁面自動刷新
  useEffect(() => {
    if (!isSupabaseConfigured || !cloudUser || !sharedRoom) return;

    const roomId = sharedRoom.id;
    const unsubscribe = subscribeToSharedPet(roomId, (remoteRoom, remoteState, deleted) => {
      if (deleted) {
        lastSharedUpdatedAtRef.current = null;
        setSharedRoom(null);
        setSpeech('共養小屋已解散，已切回單人照護模式。');
        return;
      }

      if (!remoteRoom) return;

      setSharedRoom(remoteRoom);

      const isFromPartner =
        remoteRoom.lastActorId !== null && remoteRoom.lastActorId !== cloudUser.id;
      const isNewerTimestamp = remoteRoom.updatedAt !== lastSharedUpdatedAtRef.current;

      if (isFromPartner && remoteState && isNewerTimestamp) {
        lastSharedUpdatedAtRef.current = remoteRoom.updatedAt;
        setLastSyncedAt(remoteRoom.updatedAt);
        setSyncStatus('synced');
        const mergedCoopState = mergeCoopRemoteState(gameRef.current, remoteState, cloudUser.id);
        const mergedState: GameState = {
          ...mergedCoopState,
          seasonSystem: mergeSeasonSystemRemoteState(
            mergedCoopState.seasonSystem,
            remoteState.seasonSystem
          ),
          birthdaySystem: mergeBirthdaySystemRemoteState(
            mergedCoopState.birthdaySystem,
            remoteState.birthdaySystem
          ),
          photoContest: mergePhotoContestRemoteState(
            mergedCoopState.photoContest,
            remoteState.photoContest,
            remoteState.coop.coopPhotoSubmissions
          ),
        };
        const mergedActive = getActivePet(mergedState);
        const partnerFedNow = remoteState.feedLogs.length > gameRef.current.feedLogs.length;
        const withPartnerFeedMem = partnerFedNow
          ? recordMemoryEntry(mergedState, {
              uniqueKey: 'coop_partner_first_feed',
              petId: 'pet_1',
              type: 'coop',
              title: `夥伴第一次餵食 ${mergedActive.name}`,
              description: `共養夥伴細心照顧 ${mergedActive.name}，一起分享美味時光！`,
              emoji: '🍱',
              isShared: true,
            })
          : mergedState;
        const evaluatedDialogue = evaluateAndSelectDialogue(withPartnerFeedMem, cloudUser.id);
        const nextMerged: GameState = { ...withPartnerFeedMem, dialogue: evaluatedDialogue };
        const prevPartnerEventIds = new Set(
          gameRef.current.coop.offlineEvents.map((ev) => ev.id)
        );
        const newPartnerCoopEv = getOfflinePartnerEvents(nextMerged.coop, cloudUser.id).find(
          (ev) =>
            (ev.gameType === 'event_coop' ||
              ev.gameType === 'visitor_coop' ||
              ev.gameType === 'town_coop' ||
              ev.gameType === 'birthday_coop' ||
              ev.gameType === 'photo_contest') &&
            !prevPartnerEventIds.has(ev.id)
        );
        const nextMergedActive = getActivePet(nextMerged);
        applyCloudStateLocally(nextMerged, `夥伴剛剛照顧了${nextMergedActive.name}與小屋！`);
        const fbId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        setFeedbacks((prev) => [
          ...prev.slice(-4),
          {
            id: fbId,
            text: newPartnerCoopEv
              ? `${newPartnerCoopEv.actorName} ${newPartnerCoopEv.summary}`
              : '夥伴剛更新了共養空間！',
            emoji: newPartnerCoopEv
              ? newPartnerCoopEv.gameType === 'event_coop'
                ? '🍓'
                : newPartnerCoopEv.gameType === 'town_coop'
                ? '🗺️'
                : newPartnerCoopEv.gameType === 'birthday_coop'
                ? '🎂'
                : newPartnerCoopEv.gameType === 'photo_contest'
                ? '📸'
                : '🐾'
              : '💞',
          },
        ]);
        window.setTimeout(() => {
          setFeedbacks((prev) => prev.filter((item) => item.id !== fbId));
        }, 1500);
      }
    });

    const handleResumeSync = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      void fetchMySharedPet(cloudUser.id).then((res) => {
        if (res.error) return;
        if (!res.room) {
          setSharedRoom(null);
          return;
        }
        setSharedRoom(res.room);
        if (
          res.room.lastActorId !== cloudUser.id &&
          res.state &&
          res.room.updatedAt !== lastSharedUpdatedAtRef.current
        ) {
          lastSharedUpdatedAtRef.current = res.room.updatedAt;
          setLastSyncedAt(res.room.updatedAt);
          const prevPartnerEventIds = new Set(
            gameRef.current.coop.offlineEvents.map((ev) => ev.id)
          );
          const mergedCoopState = mergeCoopRemoteState(gameRef.current, res.state, cloudUser.id);
          const mergedState: GameState = {
            ...mergedCoopState,
            seasonSystem: mergeSeasonSystemRemoteState(
              mergedCoopState.seasonSystem,
              res.state.seasonSystem
            ),
            birthdaySystem: mergeBirthdaySystemRemoteState(
              mergedCoopState.birthdaySystem,
              res.state.birthdaySystem
            ),
            photoContest: mergePhotoContestRemoteState(
              mergedCoopState.photoContest,
              res.state.photoContest,
              res.state.coop.coopPhotoSubmissions
            ),
          };
          const newPartnerCoopEv = getOfflinePartnerEvents(mergedState.coop, cloudUser.id).find(
            (ev) =>
              (ev.gameType === 'event_coop' ||
                ev.gameType === 'visitor_coop' ||
                ev.gameType === 'town_coop' ||
                ev.gameType === 'birthday_coop' ||
                ev.gameType === 'photo_contest') &&
              !prevPartnerEventIds.has(ev.id)
          );
          const evaluatedDialogue = evaluateAndSelectDialogue(mergedState, cloudUser.id);
          applyCloudStateLocally({ ...mergedState, dialogue: evaluatedDialogue });
          if (newPartnerCoopEv) {
            const fbId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            setFeedbacks((prev) => [
              ...prev.slice(-4),
              {
                id: fbId,
                text: `${newPartnerCoopEv.actorName} ${newPartnerCoopEv.summary}`,
                emoji:
                  newPartnerCoopEv.gameType === 'event_coop'
                    ? '🍓'
                    : newPartnerCoopEv.gameType === 'town_coop'
                    ? '🗺️'
                    : newPartnerCoopEv.gameType === 'birthday_coop'
                    ? '🎂'
                    : newPartnerCoopEv.gameType === 'photo_contest'
                    ? '📸'
                    : '🐾',
              },
            ]);
            window.setTimeout(() => {
              setFeedbacks((prev) => prev.filter((item) => item.id !== fbId));
            }, 1800);
          }
        }
      });
    };

    const periodicTimer = window.setInterval(handleResumeSync, 15000);
    window.addEventListener('focus', handleResumeSync);
    window.addEventListener('online', handleResumeSync);

    return () => {
      unsubscribe();
      window.clearInterval(periodicTimer);
      window.removeEventListener('focus', handleResumeSync);
      window.removeEventListener('online', handleResumeSync);
    };
  }, [cloudUser, sharedRoom?.id, applyCloudStateLocally]);

  // 共養留言板與貼圖載入＋Realtime 訂閱
  useEffect(() => {
    if (!isSupabaseConfigured || !cloudUser || !sharedRoom) {
      setSharedMessages([]);
      setMessagesError(null);
      setMessagesLoading(false);
      return;
    }

    let mounted = true;
    const roomId = sharedRoom.id;
    setMessagesLoading(true);
    setMessagesError(null);

    void fetchSharedMessages(roomId).then((res) => {
      if (!mounted) return;
      setMessagesLoading(false);
      if (res.error) {
        setMessagesError(res.error);
      } else {
        setSharedMessages(res.messages);
      }
    });

    const unsubscribeMessages = subscribeToSharedMessages(roomId, {
      onInsert: (incoming) => {
        if (!mounted) return;
        setSharedMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming].slice(-80);
        });

        if (incoming.authorId !== cloudUser.id) {
          soundFX.heart(gameRef.current.soundEnabled);
          if (!messageModalOpenRef.current) {
            setUnreadMessagesCount((c) => c + 1);
          }
          const stickerInfo = getStickerById(incoming.stickerId);
          const toastText = stickerInfo
            ? `夥伴傳來「${stickerInfo.label}」貼圖！`
            : '夥伴傳來新留言！';
          const fbId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          setFeedbacks((prev) => [...prev.slice(-4), { id: fbId, text: toastText, emoji: '💌' }]);
          window.setTimeout(() => {
            setFeedbacks((prev) => prev.filter((item) => item.id !== fbId));
          }, 1600);

          setGame((prev) => {
            const nextDialogue = appendMemoryEvent(prev.dialogue, {
              type: 'partnerMessage',
              detail: incoming.content || stickerInfo?.label || '貼圖留言',
              actorId: incoming.authorId,
              actorName: incoming.authorName,
              isCoopHighlight: true,
              createdAt: incoming.createdAt,
            });
            const evaluated = evaluateAndSelectDialogue(
              { ...prev, dialogue: nextDialogue },
              cloudUser.id
            );
            let updated: GameState = {
              ...prev,
              dialogue: evaluated,
            };
            updated = recordMonthlyActivity(updated, {
              coopMessageDelta: 1,
              interactionLabel: '留言互動',
            });
            updated = recordMemoryEntry(updated, {
              uniqueKey: 'coop_partner_first_msg',
              type: 'coop',
              title: `收到 ${incoming.authorName} 的第一則留言`,
              description: incoming.content
                ? `「${incoming.content.slice(0, 40)}」`
                : `傳來可愛貼圖「${stickerInfo?.label ?? '問候'}」`,
              emoji: '💌',
              actorName: incoming.authorName,
              isShared: true,
            });
            return updated;
          });
        }
      },
      onDelete: (deletedId) => {
        if (!mounted) return;
        setSharedMessages((prev) => prev.filter((m) => m.id !== deletedId));
      },
    });

    return () => {
      mounted = false;
      unsubscribeMessages();
    };
  }, [cloudUser, sharedRoom?.id]);

  useEffect(() => {
    if (!isSupabaseConfigured || !cloudUser || pendingCloudSave || !activePet.hatched) {
      return;
    }

    if (skipNextCloudUploadRef.current) {
      skipNextCloudUploadRef.current = false;
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    const delayMs = sharedRoom
      ? game.coop.activeRoomSession?.status === 'active'
        ? 250
        : 800
      : 1500;
    const timer = window.setTimeout(() => {
      setSyncStatus('syncing');
      setSyncError(null);

      if (sharedRoom) {
        void updateSharedPetSave(
          sharedRoom.id,
          game,
          cloudUser.id,
          cloudUser.email
        ).then((res) => {
          if (res.error) {
            setSyncStatus('error');
            setSyncError(res.error);
          } else {
            lastSharedUpdatedAtRef.current = res.updatedAt;
            setSyncStatus('synced');
            setLastSyncedAt(res.updatedAt);
          }
        });
      } else {
        void upsertCloudSave(cloudUser.id, game).then((res) => {
          if (res.error) {
            setSyncStatus('error');
            setSyncError(res.error);
          } else {
            setSyncStatus('synced');
            setLastSyncedAt(res.updatedAt);
          }
        });
      }
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [game, cloudUser, pendingCloudSave, sharedRoom]);

  useEffect(() => {
    const currentStage = getGrowthStage(activePet.growth, activePet.species);
    const currentStars = getPrestigeStarInfo(activePet.growth).stars;

    if (prevActivePetIdRef.current !== activePet.id) {
      prevActivePetIdRef.current = activePet.id;
      prevStageLevelRef.current = currentStage.level;
      prevPrestigeStarsRef.current = currentStars;
      return;
    }

    if (currentStage.level > prevStageLevelRef.current) {
      const reward = STAGE_LEVEL_REWARDS[currentStage.level];
      soundFX.levelUp(game.soundEnabled);
      setLevelUpStage(currentStage);
      setLevelUpPrestigeStar(null);
      setLevelUpRewardText(reward?.rewardText ?? null);

      setGame((prev) => {
        const prevActive = getActivePet(prev);
        const nextFoods =
          reward?.foodId && reward.foodQty
            ? {
                ...prev.foods,
                [reward.foodId]: (prev.foods[reward.foodId] ?? 0) + reward.foodQty,
              }
            : prev.foods;

        let next: GameState = {
          ...prev,
          coins: prev.coins + (reward?.coins ?? 0),
          foods: nextFoods,
          dialogue: appendMemoryEvent(prev.dialogue, {
            type: 'milestone',
            detail: `升上 Lv.${currentStage.level} ${currentStage.name}`,
          }),
        };
        if (currentStage.level >= 2) {
          next = recordMemoryEntry(next, {
            uniqueKey: `growth_lv_${prevActive.id}_${currentStage.level}`,
            petId: prevActive.id,
            type: 'growth',
            title: `${prevActive.name}成長至 Lv.${currentStage.level}「${currentStage.name}」！`,
            description: `${prevActive.name}邁入全新成長階段，獲得祝賀禮 ${reward?.rewardText ?? ''}！`,
            emoji: '✨',
            level: currentStage.level,
            weight: prevActive.weight,
          });
        }
        return syncAllAccessoryProgress(next).nextState;
      });
    } else if (currentStars > prevPrestigeStarsRef.current) {
      soundFX.levelUp(game.soundEnabled);
      setLevelUpStage(null);
      setLevelUpPrestigeStar(currentStars);
      setLevelUpRewardText(`+${PRESTIGE_STAR_REWARD_COINS} 金幣`);

      setGame((prev) => {
        const prevActive = getActivePet(prev);
        const next: GameState = {
          ...prev,
          coins: prev.coins + PRESTIGE_STAR_REWARD_COINS,
          dialogue: appendMemoryEvent(prev.dialogue, {
            type: 'milestone',
            detail: `達成閃耀星等 ★${currentStars}`,
          }),
        };
        return recordMemoryEntry(next, {
          uniqueKey: `growth_prestige_star_${prevActive.id}_${currentStars}`,
          petId: prevActive.id,
          type: 'growth',
          title: `${prevActive.name}達成 Lv.4 閃耀星等 ★${currentStars}！`,
          description: `細心陪伴讓 ${prevActive.name} 獲得閃耀 ★${currentStars} 榮譽，獲贈 +${PRESTIGE_STAR_REWARD_COINS} 金幣！`,
          emoji: '🌟',
          level: 4,
          weight: prevActive.weight,
        });
      });
    }

    prevStageLevelRef.current = currentStage.level;
    prevPrestigeStarsRef.current = currentStars;
  }, [activePet.id, activePet.growth, activePet.species, game.soundEnabled]);

  // 自動評估 12 項里程碑、8 項共養共同回憶（支援離線後恢復同步雙端通知）與月末/月初月度回顧卡
  useEffect(() => {
    if (!activePet.hatched) return;
    const activeMsgs = sharedRoom ? sharedMessages : game.messages;
    let nextState = game;

    const msRes = evaluateAndSyncMilestones(nextState, Boolean(sharedRoom));
    nextState = msRes.nextState;

    const smRes = evaluateAndSyncSharedMemories(
      nextState,
      sharedRoom,
      activeMsgs,
      currentUserId,
      actorName
    );
    nextState = smRes.nextState;

    const withRecap = syncAutoMonthlyRecap(nextState, activeMsgs);
    nextState = withRecap;

    if (nextState !== game) {
      setGame(nextState);
      if (msRes.newlyUnlocked.length > 0) {
        soundFX.levelUp(game.soundEnabled);
        msRes.newlyUnlocked.forEach((ms) => {
          pushFeedback(`達成里程碑「${ms.title}」！`, ms.emoji);
        });
      }
      if (smRes.newlyNotified.length > 0) {
        soundFX.levelUp(game.soundEnabled);
        smRes.newlyNotified.forEach((sm) => {
          pushFeedback(`共同回憶解鎖「${sm.title}」！`, sm.emoji);
        });
      }
    }
  }, [
    game,
    sharedRoom,
    sharedMessages,
    currentUserId,
    actorName,
  ]);

  // 啟動與回到頁面時評估一次對話氣泡（含昨日最愛食物回顧 / 急迫需求 / 時間問候）
  useEffect(() => {
    if (!activePet.hatched) return;
    const evaluateNow = () => {
      setGame((prev) => {
        if (!getActivePet(prev).hatched) return prev;
        const nextDialogue = evaluateAndSelectDialogue(prev, currentUserId);
        return nextDialogue === prev.dialogue
          ? prev
          : { ...prev, dialogue: nextDialogue };
      });
    };
    const initTimer = window.setTimeout(evaluateNow, 900);
    window.addEventListener('focus', evaluateNow);
    return () => {
      window.clearTimeout(initTimer);
      window.removeEventListener('focus', evaluateNow);
    };
  }, [activePet.hatched, currentUserId]);

  useEffect(() => {
    if (!activePet.hatched) return;
    const hasShared = Boolean(sharedRoom);

    const runWorldSync = (applyDecay: boolean) => {
      const now = Date.now();
      setGame((prev) => {
        const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
        const syncedFamily = syncFamilyDailyTasks(
          prev.familyDailyTasks,
          prev.familyDailyTasksDate
        );
        const decayedPets = applyDecay
          ? prev.pets.map((p) => applyTimeDecay(p, 20000))
          : prev.pets;
        const syncedCoop = syncCoopHubState(prev.coop, undefined, now, hasShared);
        let draft: GameState = {
          ...prev,
          dailyTasks: synced.dailyTasks,
          dailyTasksDate: synced.dailyTasksDate,
          familyDailyTasks: syncedFamily.familyDailyTasks,
          familyDailyTasksDate: syncedFamily.familyDailyTasksDate,
          pets: decayedPets,
          coop: syncedCoop,
        };
        draft = syncTownOrders(draft, now);
        draft = syncVisitorSystem(draft, now).nextState;
        draft = syncSeasonalEventState(draft, new Date(now));
        draft = syncTownMapState(draft, new Date(now));
        draft = syncCoopTownExploration(draft, hasShared, new Date(now));
        draft = syncSeasonSystemState(draft, now);
        draft = syncBirthdaySystemState(draft, new Date(now));
        draft = syncPhotoContestState(draft, new Date(now));
        if (draft.dialogue.weather.condition === 'windy') {
          draft = maybeTriggerWindblownPlot(draft, now);
        }
        const nextDialogue = evaluateAndSelectDialogue(draft, currentUserId);
        return {
          ...draft,
          dialogue: nextDialogue,
        };
      });
    };

    const bootTimer = window.setTimeout(() => runWorldSync(false), 400);
    const timer = window.setInterval(() => runWorldSync(true), 20000);
    return () => {
      window.clearTimeout(bootTimer);
      window.clearInterval(timer);
    };
  }, [activePet.hatched, currentUserId, sharedRoom?.id]);

  const applyWeatherRefresh = useCallback(
    async (opts?: { cityId?: string; force?: boolean }) => {
      setWeatherLoading(true);
      try {
        const fetched = await fetchAndApplyWeather(gameRef.current, opts);
        if (fetched === gameRef.current) return;
        setGame((prev) => {
          const baseSys = prev.seasonSystem ?? createInitialSeasonSystemState();
          const fetchedWeather = fetched.dialogue.weather;
          const fetchedSys = fetched.seasonSystem ?? baseSys;
          const keepExistingTasks =
            baseSys.weatherTasksDate === fetchedSys.weatherTasksDate &&
            baseSys.weatherTasks[0]?.weatherCondition === fetchedWeather.condition;
          let updated: GameState = {
            ...prev,
            dialogue: {
              ...prev.dialogue,
              weather: fetchedWeather,
            },
            seasonSystem: {
              ...baseSys,
              currentSeason: fetchedSys.currentSeason,
              lastKnownSeason: fetchedSys.lastKnownSeason,
              selectedCityId: fetchedSys.selectedCityId,
              weatherTasksDate: fetchedSys.weatherTasksDate,
              weatherTasks: keepExistingTasks ? baseSys.weatherTasks : fetchedSys.weatherTasks,
              offlineSummary: fetchedSys.offlineSummary,
            },
          };
          if (fetchedWeather.condition === 'rain') {
            updated = applyRainAutoWaterToPlots(updated);
          } else if (fetchedWeather.condition === 'windy') {
            updated = maybeTriggerWindblownPlot(updated);
          } else if (fetchedWeather.condition === 'snow') {
            updated = unlockWinterSnowPhotoBonus(updated).nextState;
          }
          return updated;
        });
      } finally {
        setWeatherLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!activePet.hatched) return;
    const bootTimer = window.setTimeout(() => {
      void applyWeatherRefresh({ force: false });
    }, 650);
    const timer = window.setInterval(() => {
      void applyWeatherRefresh({ force: false });
    }, WEATHER_AUTO_REFRESH_MS);
    const onOnline = () => {
      void applyWeatherRefresh({ force: true });
    };
    window.addEventListener('online', onOnline);
    return () => {
      window.clearTimeout(bootTimer);
      window.clearInterval(timer);
      window.removeEventListener('online', onOnline);
    };
  }, [activePet.hatched, applyWeatherRefresh]);

  // 新訪客到達時發出提醒
  useEffect(() => {
    const activeVisit = game.visitorState?.activeVisit ?? null;
    if (!activeVisit) return;
    if (
      game.visitorState?.arrivalNoticeUnread &&
      activeVisit.visitId !== lastAnnouncedVisitIdRef.current
    ) {
      lastAnnouncedVisitIdRef.current = activeVisit.visitId;
      soundFX.heart(game.soundEnabled);
      const info = VISITOR_BY_ID[activeVisit.visitorId];
      if (activeVisit.likesYard) {
        pushFeedback('庭院好像有客人來了！訪客很喜歡這裡！', info.emoji);
        setSpeech(`庭院好像有客人來了！${info.speciesLabel}看起來好喜歡這裡的佈置～`);
      } else {
        pushFeedback('庭院好像有客人來了！', info.emoji);
        setSpeech('庭院好像有客人來了！快去看看是誰吧～');
      }
    }
  }, [
    game.visitorState?.activeVisit?.visitId,
    game.visitorState?.arrivalNoticeUnread,
    game.soundEnabled,
  ]);

  const clearAnimationTimers = () => {
    if (actionTimerRef.current) {
      window.clearTimeout(actionTimerRef.current);
      actionTimerRef.current = null;
    }
    if (feedPhaseTimerRef.current) {
      window.clearTimeout(feedPhaseTimerRef.current);
      feedPhaseTimerRef.current = null;
    }
  };

  const setTemporaryAction = (
    nextAction: PiggyActionState,
    durationMs = 1500,
    nextExpression: PetExpression = 'normal'
  ) => {
    clearAnimationTimers();
    setFlyingFoodEmoji(null);
    setFeedEffect('none');
    setFeedParticles([]);
    setActionState(nextAction);
    setExpressionState(nextExpression);
    actionTimerRef.current = window.setTimeout(() => {
      setActionState('idle');
      setExpressionState('normal');
    }, durationMs);
  };

  const pushFeedback = (text: string, emoji?: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setFeedbacks((prev) => [...prev.slice(-4), { id, text, emoji }]);
    window.setTimeout(() => {
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
    }, 1250);
  };

  const handleHatchComplete = (petName: string, species: PetSpecies) => {
    const now = new Date();
    const todayStr = formatLocalDate(now);
    const speciesInfo = getPetSpeciesInfo(species);
    const initialWeight = getDefaultWeightForSpecies(species);
    const initialWeightLog: WeightLog = {
      id: `wlog_${Date.now()}`,
      petId: 'pet_1',
      date: todayStr,
      weight: initialWeight,
      foodName: '破殼報到',
      note: `${petName}（${speciesInfo.label}）來到萌寵食堂的第一天！`,
      weightDelta: 0,
      timeStr: formatLocalTime(now),
      timestamp: now.getTime(),
    };
    soundFX.petVoice(game.soundEnabled, species);
    setGame((prev) => {
      const nextPersonality = createInitialPetPersonality(species);
      const primaryId = prev.pets[0]?.id ?? 'pet_1';
      const updated = updatePetById(prev, primaryId, (pet) => ({
        ...pet,
        name: petName,
        species,
        hatched: true,
        weight: initialWeight,
        ownerId: cloudUser?.id ?? 'local',
        isSharedCoopPet: true,
        personality: nextPersonality,
        preference: PET_PREFERENCES[species],
      }));
      const hatchedState: GameState = {
        ...updated,
        activePetId: primaryId,
        personality: nextPersonality,
        weightLogs: [initialWeightLog, ...prev.weightLogs],
        noviceGrowth: {
          ...prev.noviceGrowth,
          startedDate: prev.noviceGrowth.startedDate || todayStr,
        },
      };
      const withMemory = recordMemoryEntry(hatchedState, {
        uniqueKey: `hatching_welcome_${primaryId}`,
        petId: primaryId,
        type: 'hatching',
        title: `${petName} 加入我們的家！`,
        description: `在萌寵食堂破殼報到（${speciesInfo.label}），正式展開幸福的美食與陪伴之旅！`,
        emoji: '🐣',
        weight: initialWeight,
        level: 1,
        createdAt: now.getTime(),
      });
      return syncAllAccessoryProgress(withMemory).nextState;
    });
    setSpeech(`嗨～我是${petName}，${speciesInfo.greeting}`);
  };

  const handleSwitchPet = (petId: string) => {
    const res = switchActivePet(gameRef.current, petId);
    if (!res.ok) {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
      return;
    }
    const targetPet = getActivePet(res.nextState);
    const stage = getGrowthStage(targetPet.growth, targetPet.species);
    prevActivePetIdRef.current = targetPet.id;
    prevStageLevelRef.current = stage.level;
    prevPrestigeStarsRef.current = getPrestigeStarInfo(targetPet.growth).stars;
    soundFX.petVoice(game.soundEnabled, targetPet.species);
    setGame(res.nextState);
    const speciesInfo = getPetSpeciesInfo(targetPet.species);
    setSpeech(`切換陪「${targetPet.name}」玩囉！${speciesInfo.greeting}`);
    if (res.notice) pushFeedback(res.notice, '🐾');
  };

  const handleAdoptPet = (species: PetSpecies, name: string): boolean => {
    const res = adoptNewPet(gameRef.current, {
      species,
      name,
      ownerId: currentUserId,
      hasSharedRoom: Boolean(sharedRoom),
    });
    if (!res.ok || !res.pet) {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
      return false;
    }
    prevActivePetIdRef.current = res.pet.id;
    prevStageLevelRef.current = 1;
    prevPrestigeStarsRef.current = 0;
    soundFX.petVoice(game.soundEnabled, res.pet.species);
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    const speciesInfo = getPetSpeciesInfo(res.pet.species);
    setSpeech(`歡迎「${res.pet.name}」加入！${speciesInfo.greeting}`);
    if (res.notice) pushFeedback(res.notice, '🎉');
    return true;
  };

  const handleClaimPetSlotReward = (slotNumber: number) => {
    const res = claimPetSlotReward(gameRef.current, slotNumber, Boolean(sharedRoom));
    if (!res.ok) {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) {
      pushFeedback(res.notice, '🎁');
      setSpeech(res.notice);
    }
  };

  const handleClaimFamilyTask = (taskId: FamilyTaskId) => {
    const res = claimFamilyDailyTaskReward(gameRef.current, taskId);
    if (!res.ok) {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) {
      pushFeedback(res.notice, '🏡');
      setSpeech(res.notice);
    }
  };

  const handlePet = (zone: PetTouchZone = 'head') => {
    const zoneMeta = TOUCH_ZONE_META[zone];
    const nextSpeech = getRandomZoneSpeech(
      activePet.species,
      zone,
      activePet.mood,
      lastSpeechRef.current
    );
    const nextFeedback = pickRandomNonRepeating(zoneMeta.feedbacks);
    const nextExpression = pickRandomNonRepeating(
      zoneMeta.expressions,
      lastExpressionRef.current
    );

    lastSpeechRef.current = nextSpeech;
    lastExpressionRef.current = nextExpression;

    const isStormWeather = game.dialogue.weather.condition === 'storm';
    soundFX.petVoice(game.soundEnabled, activePet.species);
    setTemporaryAction('petted', 1100, nextExpression);
    pushFeedback(
      isStormWeather ? `${nextFeedback.text} (+3🪙 雷雨安撫加成)` : nextFeedback.text,
      nextFeedback.emoji
    );
    setSpeech(nextSpeech);

    setGame((prev) => {
      const prevActive = getActivePet(prev);
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const syncedFamily = syncFamilyDailyTasks(
        prev.familyDailyTasks,
        prev.familyDailyTasksDate
      );
      const isStorm = prev.dialogue.weather.condition === 'storm';
      const isCloudy = prev.dialogue.weather.condition === 'cloudy';
      const stormMoodBonus = isStorm ? 2 : 0;
      const stormIntimacyBonus = isStorm ? 1 : 0;
      const stormCoinBonus = isStorm ? 3 : 0;
      const gainInfo = computeGrowthGain(5, prevActive);
      const nextGrowth = prevActive.growth + gainInfo.total;
      const dev = applyPersonalityDevelopment(
        getPetDisplayPersonality(prev, prevActive),
        'pet_or_message'
      );
      const zoneLabels: Record<PetTouchZone, string> = {
        head: '摸摸頭',
        cheek: '捏捏臉頰',
        belly: '揉揉肚肚',
        paw: '牽牽小手',
      };
      const nextDialogue = appendMemoryEvent(prev.dialogue, {
        type: 'petted',
        detail: `${prevActive.name}：${zoneLabels[zone]}`,
      });
      const updatedPetState = updateActivePet(prev, (pet) => ({
        ...pet,
        mood: clampStat(pet.mood + 6 + stormMoodBonus, 0, 100),
        intimacy: pet.intimacy + 2 + stormIntimacyBonus,
        growth: nextGrowth,
        level: getGrowthStage(nextGrowth, pet.species).level,
        personality: dev.nextPersonality,
      }));
      let draftState: GameState = {
        ...updatedPetState,
        coins: updatedPetState.coins + stormCoinBonus,
        personality: dev.nextPersonality,
        dialogue: nextDialogue,
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'pet_3', 1),
        dailyTasksDate: synced.dailyTasksDate,
        familyDailyTasks: incrementFamilyTaskProgress(
          syncedFamily.familyDailyTasks,
          'family_pet_3',
          1
        ),
        familyDailyTasksDate: syncedFamily.familyDailyTasksDate,
        noviceGrowth: {
          ...prev.noviceGrowth,
          petCount: prev.noviceGrowth.petCount + 1,
        },
      };
      if (isStorm) {
        draftState = advanceWeatherTaskProgress(draftState, 'soothe_pet', 1);
      } else if (isCloudy) {
        draftState = advanceWeatherTaskProgress(draftState, 'indoor_care', 1);
      }
      return recordMonthlyActivity(draftState, {
        interactionLabel: '撫摸互動',
        growthDelta: gainInfo.total,
      });
    });
  };

  const handleFeed = (food: Food) => {
    if ((game.foods[food.id] ?? 0) <= 0) {
      setSpeech(`哎呀，${food.name}吃光了，去食堂買一些吧！`);
      return;
    }

    if (activePet.hunger >= 100) {
      soundFX.pop(game.soundEnabled);
      const fullMessage = `${activePet.name}已經吃飽了！`;
      setSpeech(fullMessage);
      pushFeedback(fullMessage, '🍽️');
      return;
    }

    const speciesInfo = getPetSpeciesInfo(activePet.species);
    const nextFastFoodStreak =
      food.category === 'fastFood' ? activePet.consecutiveFastFood + 1 : 0;
    const outcome = resolveFeedingOutcome(
      food,
      activePet.species,
      nextFastFoodStreak,
      lastSpeechRef.current
    );
    lastSpeechRef.current = outcome.speech;

    // Phase 1: Food flies toward pet + pet opens mouth
    clearAnimationTimers();
    setFlyingFoodEmoji(food.emoji);
    setFeedEffect('none');
    setFeedParticles([]);
    setActionState('opening');
    setExpressionState('sparkle');
    soundFX.pop(game.soundEnabled);

    // Phase 2: Pet chews + hearts/particles + data-driven reaction
    feedPhaseTimerRef.current = window.setTimeout(() => {
      setFlyingFoodEmoji(null);
      soundFX.chew(game.soundEnabled);
      if (outcome.isFavorite && !outcome.isStuffed) {
        soundFX.petVoice(game.soundEnabled, activePet.species);
      }

      setActionState(outcome.action);
      setFeedEffect(outcome.visualEffect);
      setFeedParticles(outcome.particleEmojis);
      setExpressionState(outcome.expression);
      setSpeech(outcome.speech);
      pushFeedback(outcome.feedbackText, outcome.feedbackEmoji);

      actionTimerRef.current = window.setTimeout(() => {
        setActionState('idle');
        setFeedEffect('none');
        setFeedParticles([]);
        setExpressionState('normal');
      }, 1450);
    }, 480);

    const isHotCoolingFood =
      game.dialogue.weather.condition === 'hot' && COOLING_FOOD_IDS.includes(food.id);
    const now = new Date();
    const dateStr = formatLocalDate(now);
    const timeStr = formatLocalTime(now);
    const effectiveFavorite = outcome.isFavorite;
    const bonusMood = (effectiveFavorite ? 6 : 0) + (isHotCoolingFood ? 5 : 0);
    const bonusGrowth = effectiveFavorite ? 4 : 0;
    const bonusIntimacy = effectiveFavorite ? 1 : 0;
    const isDessertOrFastFood =
      food.category === 'snack' || food.category === 'fastFood';
    if (isHotCoolingFood) {
      pushFeedback('炎熱吃清涼食物！心情額外 +5', '❄️');
    }

    setGame((prev) => {
      const prevActive = getActivePet(prev);
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const syncedFamily = syncFamilyDailyTasks(
        prev.familyDailyTasks,
        prev.familyDailyTasksDate
      );
      const newWeight = clampWeight(prevActive.weight + food.weightGain);
      const actualDelta = roundWeight(newWeight - prevActive.weight);
      const feedGainInfo = computeGrowthGain(food.growthGain + bonusGrowth, prevActive);
      const nextGrowth = prevActive.growth + feedGainInfo.total;
      const basePersonality = getPetDisplayPersonality(prev, prevActive);
      const nextPersonality = isDessertOrFastFood
        ? applyPersonalityDevelopment(basePersonality, 'feed_dessert_fastfood')
            .nextPersonality
        : basePersonality;

      const newWeightLog: WeightLog = {
        id: `wlog_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        petId: prevActive.id,
        date: dateStr,
        weight: newWeight,
        foodName: food.name,
        note:
          nextFastFoodStreak >= 3
            ? '連吃三次速食，肚子圓鼓鼓建議散步'
            : effectiveFavorite
            ? `吃到${speciesInfo.shortName}最愛料理！心情與成長額外加成`
            : outcome.isDisliked
            ? `雖然不太合胃口，還是乖乖吃完了（零懲罰）`
            : `享用美味${FOOD_CATEGORY_LABELS[food.category]}，心情超好！`,
        weightDelta: actualDelta,
        timeStr,
        timestamp: now.getTime(),
      };

      const newFeedLog: FeedLog = {
        id: `flog_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        petId: prevActive.id,
        date: dateStr,
        foodId: food.id,
        weightChange: actualDelta,
      };

      const nextCollectedFoods = prev.encyclopedia.collectedFoodIds.includes(food.id)
        ? prev.encyclopedia.collectedFoodIds
        : [...prev.encyclopedia.collectedFoodIds, food.id];

      let nextDialogue = prev.dialogue;
      if (outcome.isStuffed) {
        nextDialogue = appendMemoryEvent(nextDialogue, {
          type: 'stuffed',
          detail: `${prevActive.name}吃太撐（${food.name}）`,
          foodId: food.id,
        });
      } else if (effectiveFavorite) {
        nextDialogue = appendMemoryEvent(nextDialogue, {
          type: 'fedFavoriteFood',
          detail: `${prevActive.name}愛吃${food.name}`,
          foodId: food.id,
        });
      } else if (outcome.isDisliked) {
        nextDialogue = appendMemoryEvent(nextDialogue, {
          type: 'fedDislikedFood',
          detail: food.name,
          foodId: food.id,
        });
      }
      if (sharedRoom) {
        nextDialogue = appendMemoryEvent(nextDialogue, {
          type: 'partnerFed',
          detail: food.name,
          foodId: food.id,
          actorId: currentUserId,
          actorName,
          isCoopHighlight: true,
        });
      }

      const withUpdatedPet = updateActivePet(prev, (pet) => ({
        ...pet,
        hunger: clampStat(pet.hunger + food.hunger, 0, 100),
        mood: clampStat(pet.mood + food.mood + bonusMood, 0, 100),
        weight: newWeight,
        roundness: clampStat(pet.roundness + food.roundness, 0, 100),
        growth: nextGrowth,
        level: getGrowthStage(nextGrowth).level,
        intimacy: pet.intimacy + 2 + bonusIntimacy,
        consecutiveFastFood: nextFastFoodStreak,
        personality: nextPersonality,
      }));

      const draftState: GameState = {
        ...withUpdatedPet,
        foods: {
          ...prev.foods,
          [food.id]: Math.max(0, (prev.foods[food.id] ?? 1) - 1),
        },
        personality: nextPersonality,
        dialogue: nextDialogue,
        weightLogs: [newWeightLog, ...prev.weightLogs],
        feedLogs: [newFeedLog, ...prev.feedLogs],
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'feed_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
        familyDailyTasks: incrementFamilyTaskProgress(
          syncedFamily.familyDailyTasks,
          'family_feed_1',
          1
        ),
        familyDailyTasksDate: syncedFamily.familyDailyTasksDate,
        noviceGrowth: {
          ...prev.noviceGrowth,
          feedCount: prev.noviceGrowth.feedCount + 1,
          fedFavoriteCount: prev.noviceGrowth.fedFavoriteCount + (effectiveFavorite ? 1 : 0),
        },
        encyclopedia: {
          ...prev.encyclopedia,
          collectedFoodIds: nextCollectedFoods,
        },
      };

      const syncedAcc = syncAllAccessoryProgress(draftState).nextState;
      let nextMem = recordMonthlyActivity(syncedAcc, {
        foodId: food.id,
        interactionLabel: '餵食料理',
        weight: newWeight,
        growthDelta: feedGainInfo.total,
      });
      const updatedActive = getActivePet(nextMem);

      nextMem = recordMemoryEntry(nextMem, {
        uniqueKey: `feed_first_pet_${updatedActive.id}`,
        petId: updatedActive.id,
        type: 'feeding',
        title: `${updatedActive.name}的第一餐：「${food.name}」`,
        description: `${updatedActive.name}首次吃下 ${food.emoji} ${food.name}，開啟美食日記！`,
        emoji: food.emoji,
        foodId: food.id,
        weight: newWeight,
        level: updatedActive.level,
      });

      nextMem = recordMemoryEntry(nextMem, {
        uniqueKey: `feed_first_food_${food.id}`,
        petId: updatedActive.id,
        type: 'feeding',
        title: `第一次品嚐「${food.name}」`,
        description: `${updatedActive.name}首次吃下 ${food.emoji} ${food.name}，目前體重 ${newWeight.toFixed(1)} kg！`,
        emoji: food.emoji,
        foodId: food.id,
        weight: newWeight,
        level: updatedActive.level,
      });

      if (effectiveFavorite) {
        nextMem = recordMemoryEntry(nextMem, {
          uniqueKey: `feed_first_favorite_${updatedActive.id}`,
          petId: updatedActive.id,
          type: 'feeding',
          title: `${updatedActive.name}第一次吃到最愛料理！`,
          description: `${food.emoji} ${food.name}讓${updatedActive.name}眼睛發亮、開心轉圈圈！`,
          emoji: '💖',
          foodId: food.id,
          weight: newWeight,
          level: updatedActive.level,
        });
      }

      if (food.id === 'cheese_burger') {
        nextMem = recordMemoryEntry(nextMem, {
          uniqueKey: 'feed_first_burger',
          petId: updatedActive.id,
          type: 'feeding',
          title: '第一次漢堡美味時刻',
          description: `大口咬下多汁的起司漢堡，滿足感直衝 100%！`,
          emoji: '🍔',
          foodId: food.id,
          weight: newWeight,
        });
      }

      if (food.id === 'crispy_fries') {
        nextMem = recordMemoryEntry(nextMem, {
          uniqueKey: 'feed_first_fries',
          petId: updatedActive.id,
          type: 'feeding',
          title: '第一次香脆薯條派對',
          description: `咔滋咔滋的金黃薯條，一根接著一根停不下來！`,
          emoji: '🍟',
          foodId: food.id,
          weight: newWeight,
        });
      }

      const nextRoundness = updatedActive.roundness;
      if (nextRoundness >= 40) {
        const tier = getRoundnessTier(nextRoundness);
        nextMem = recordMemoryEntry(nextMem, {
          uniqueKey:
            nextRoundness >= 85
              ? `weight_round_${updatedActive.id}_85`
              : nextRoundness >= 65
              ? `weight_round_${updatedActive.id}_65`
              : `weight_round_${updatedActive.id}_40`,
          petId: updatedActive.id,
          type: 'weight',
          title: `${updatedActive.name}體態成長為「${tier.label}」！`,
          description: `${updatedActive.name}吃得圓滾滾超療癒（目前體重 ${newWeight.toFixed(1)} kg）`,
          emoji: '⚖️',
          weight: newWeight,
        });
      }

      if (newWeight >= 8) {
        const milestoneKg = newWeight >= 16 ? 16 : newWeight >= 12 ? 12 : 8;
        nextMem = recordMemoryEntry(nextMem, {
          uniqueKey: `weight_milestone_${updatedActive.id}_${milestoneKg}`,
          petId: updatedActive.id,
          type: 'weight',
          title: `${updatedActive.name}體重突破 ${milestoneKg} kg 里程碑！`,
          description: `${updatedActive.name}健康幸福地長大中，目前 ${newWeight.toFixed(1)} kg！`,
          emoji: speciesInfo.emoji,
          weight: newWeight,
        });
      }

      nextMem = syncPhotoStudioState(nextMem).nextState;
      nextMem = applyEventOnFeedStrawberry(nextMem, food.id);
      if (nextMem.dialogue.weather.condition === 'hot' && COOLING_FOOD_IDS.includes(food.id)) {
        nextMem = advanceWeatherTaskProgress(nextMem, 'cooling_food', 1);
      } else if (nextMem.dialogue.weather.condition === 'cloudy') {
        nextMem = advanceWeatherTaskProgress(nextMem, 'indoor_care', 1);
      }
      if (
        food.category === 'meal' ||
        food.category === 'snack' ||
        COOLING_FOOD_IDS.includes(food.id)
      ) {
        nextMem = advanceSakuraCoopStep(nextMem, 'food', currentUserId);
      }
      return nextMem;
    });
  };

  const handleSleep = () => {
    const isRainWeather = game.dialogue.weather.condition === 'rain';
    soundFX.pop(game.soundEnabled);
    setTemporaryAction('sleeping', 2400);
    setSpeech(
      isRainWeather
        ? '聽著窗外細雨睡覺好香甜！雨天休息獎勵 +3 金幣、心情 +3'
        : '晚安… 睡飽飽更有精神！'
    );
    pushFeedback(isRainWeather ? '雨天好眠 +3 金幣 · 心情 +3' : '精力恢復中', isRainWeather ? '🌧️' : '💤');

    setGame((prev) => {
      const prevActive = getActivePet(prev);
      const isRain = prev.dialogue.weather.condition === 'rain';
      const gainInfo = computeGrowthGain(4, prevActive);
      const nextGrowth = prevActive.growth + gainInfo.total;
      const dev = applyPersonalityDevelopment(
        getPetDisplayPersonality(prev, prevActive),
        'sleep'
      );
      const nextDialogue = appendMemoryEvent(prev.dialogue, {
        type: 'slept',
        detail: `${prevActive.name}安心午睡`,
      });
      const updated = updateActivePet(prev, (pet) => ({
        ...pet,
        energy: clampStat(pet.energy + 28 + (isRain ? 5 : 0), 0, 100),
        mood: clampStat(pet.mood + (isRain ? 3 : 0), 0, 100),
        growth: nextGrowth,
        level: getGrowthStage(nextGrowth, pet.species).level,
        personality: dev.nextPersonality,
      }));
      let nextState: GameState = {
        ...updated,
        coins: updated.coins + (isRain ? 3 : 0),
        personality: dev.nextPersonality,
        dialogue: nextDialogue,
      };
      if (isRain) {
        nextState = advanceWeatherTaskProgress(nextState, 'bath_or_sleep', 1);
      }
      return nextState;
    });
  };

  const handleBath = () => {
    const isRainWeather = game.dialogue.weather.condition === 'rain';
    soundFX.bubble(game.soundEnabled);
    setTemporaryAction('bathing', 2200, 'shy');
    setSpeech(
      isRainWeather
        ? '雨天洗暖呼呼泡泡浴最舒服了！雨天照護獎勵 +3 金幣、心情額外 +4'
        : '洗澎澎囉～全身香噴噴！'
    );
    pushFeedback(isRainWeather ? '雨天泡泡浴 +3 金幣 · 心情加成' : '香噴噴！', isRainWeather ? '🌧️' : '🫧');

    setGame((prev) => {
      const prevActive = getActivePet(prev);
      const isRain = prev.dialogue.weather.condition === 'rain';
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const gainInfo = computeGrowthGain(6, prevActive);
      const nextGrowth = prevActive.growth + gainInfo.total;
      const dev = applyPersonalityDevelopment(
        getPetDisplayPersonality(prev, prevActive),
        'clean_or_bath'
      );
      const nextDialogue = appendMemoryEvent(prev.dialogue, {
        type: 'bathed',
        detail: `${prevActive.name}香噴噴泡泡浴`,
      });
      const updated = updateActivePet(prev, (pet) => ({
        ...pet,
        cleanliness: clampStat(pet.cleanliness + 35, 0, 100),
        mood: clampStat(pet.mood + 6 + (isRain ? 4 : 0), 0, 100),
        growth: nextGrowth,
        level: getGrowthStage(nextGrowth, pet.species).level,
        personality: dev.nextPersonality,
      }));
      let nextState: GameState = {
        ...updated,
        coins: updated.coins + (isRain ? 3 : 0),
        personality: dev.nextPersonality,
        dialogue: nextDialogue,
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'clean_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
      };
      if (isRain) {
        nextState = advanceWeatherTaskProgress(nextState, 'bath_or_sleep', 1);
      }
      return nextState;
    });
  };

  const handleWalk = () => {
    const isSunny = game.dialogue.weather.condition === 'clear';
    const isDogBonus = activePet.species === 'dog';
    const baseWalkCoins = Math.round(5 * activeAbility.walkBonusMultiplier);
    const walkCoins = isSunny
      ? Math.max(baseWalkCoins + 1, Math.round(baseWalkCoins * 1.1))
      : baseWalkCoins;
    soundFX.heart(game.soundEnabled);
    setTemporaryAction('walking', 1800, 'wink');
    setSpeech(
      isDogBonus
        ? `汪！${activePet.name}發揮散步尋寶天賦，散步獎勵額外 +10%（+${walkCoins} 金幣）！`
        : isSunny
        ? `大晴天出來散步曬太陽！晴天散步獎勵 +10%（+${walkCoins} 金幣）`
        : '出來散步吹吹風，身體好輕鬆！'
    );
    pushFeedback(
      isDogBonus
        ? `散步尋寶 +${walkCoins} 金幣（+10% 加成）`
        : isSunny
        ? `晴天散步 +10% · +${walkCoins} 金幣 · +3 心情`
        : `散步開心 +${walkCoins} 金幣`,
      isDogBonus ? '🐶' : isSunny ? '☀️' : '🌿'
    );

    setGame((prev) => {
      const prevActive = getActivePet(prev);
      const syncedFamily = syncFamilyDailyTasks(
        prev.familyDailyTasks,
        prev.familyDailyTasksDate
      );
      const ability = getActivePetAbilityBonus(prev);
      const gainInfo = computeGrowthGain(8, prevActive);
      const nextGrowth = prevActive.growth + gainInfo.total;
      const newWeight = clampWeight(prevActive.weight - 0.1);
      const sunny = prev.dialogue.weather.condition === 'clear';
      const sunnyMoodBonus = sunny ? 3 : 0;
      const sunnyIntimacyBonus = sunny ? 1 : 0;
      const baseIntimacy = 1 + sunnyIntimacyBonus;
      const intimacyGain =
        ability.walkBonusMultiplier > 1
          ? Math.max(baseIntimacy + 1, Math.round(baseIntimacy * ability.walkBonusMultiplier))
          : baseIntimacy;
      const baseCoins = Math.round(5 * ability.walkBonusMultiplier);
      const rewardCoins = sunny
        ? Math.max(baseCoins + 1, Math.round(baseCoins * 1.1))
        : baseCoins;
      const nextDialogue = appendMemoryEvent(prev.dialogue, {
        type: 'walked',
        detail: sunny ? '晴天外出散步' : '外出散步',
      });
      const updated = updateActivePet(prev, (pet) => ({
        ...pet,
        mood: clampStat(pet.mood + 12 + sunnyMoodBonus, 0, 100),
        energy: clampStat(pet.energy + 10, 0, 100),
        hunger: clampStat(pet.hunger - 6, 0, 100),
        weight: newWeight,
        roundness: clampStat(pet.roundness - 8, 0, 100),
        consecutiveFastFood: 0,
        growth: nextGrowth,
        level: getGrowthStage(nextGrowth, pet.species).level,
        intimacy: pet.intimacy + intimacyGain,
      }));
      let nextState: GameState = {
        ...updated,
        coins: updated.coins + rewardCoins,
        dialogue: nextDialogue,
        familyDailyTasks: incrementFamilyTaskProgress(
          syncedFamily.familyDailyTasks,
          'family_walk_1',
          1
        ),
        familyDailyTasksDate: syncedFamily.familyDailyTasksDate,
        noviceGrowth: {
          ...prev.noviceGrowth,
          walkCount: prev.noviceGrowth.walkCount + 1,
        },
      };
      if (sunny) {
        nextState = advanceWeatherTaskProgress(nextState, 'walk', 1);
      }
      return nextState;
    });
  };

  const handleBuyFood = (food: Food) => {
    if (game.coins < food.price) return;
    soundFX.pop(game.soundEnabled);
    setGame((prev) => ({
      ...prev,
      coins: prev.coins - food.price,
      foods: {
        ...prev.foods,
        [food.id]: (prev.foods[food.id] ?? 0) + 1,
      },
    }));
    setSpeech(`買到「${food.name}」了，好期待開飯！`);
  };

  const handlePlantCrop = (plotId: number, ingredientId: IngredientId) => {
    const info = INGREDIENTS[ingredientId];
    const hasFreeSeed = (freeSeeds[ingredientId] ?? 0) > 0;
    if (!hasFreeSeed && game.coins < info.seedCost) return;
    const targetPlot = game.farmPlots.find((p) => p.id === plotId);
    if (!targetPlot || targetPlot.cropId !== null) return;

    soundFX.pop(game.soundEnabled);
    const plantedAt = Date.now();
    const durationMs = getEffectiveGrowDurationMs(info.growSeconds, game.house);
    const seedEval = evaluateCropConditions({
      cropId: ingredientId,
      watered: false,
      windblown: false,
      seasonId: game.seasonSystem?.currentSeason ?? getSeasonFromDate(new Date(plantedAt)),
      weatherCondition: game.dialogue.weather.condition ?? 'clear',
      greenhouseLevel: game.house.farmUpgrades.greenhouseLevel ?? 0,
    });
    const expectedDurationMs = getExpectedCropDurationMs(
      durationMs,
      plantedAt,
      game.yardMoodBuffPeriods ?? [],
      activeAbility.cropGrowthRateMultiplier * seedEval.rateMultiplier,
      { isPaused: seedEval.isPaused, minRate: 0.4 }
    );
    const effectiveSec = Math.max(1, Math.round(expectedDurationMs / 1000));
    const isGolden = Math.random() < 0.1;

    if (hasFreeSeed) {
      setFreeSeeds((prev) => {
        const nextCount = Math.max(0, (prev[ingredientId] ?? 0) - 1);
        return { ...prev, [ingredientId]: nextCount };
      });
    }

    setGame((prev) => {
      let planted: GameState = {
        ...prev,
        coins: hasFreeSeed ? prev.coins : prev.coins - info.seedCost,
        farmPlots: prev.farmPlots.map((p) =>
          p.id === plotId
            ? {
                ...p,
                cropId: ingredientId,
                plantedAt,
                durationMs,
                watered: false,
                isGolden,
                windblown: false,
                autoWateredByRainDate: undefined,
              }
            : p
        ),
        noviceGrowth: {
          ...prev.noviceGrowth,
          plantedCarrotCount:
            prev.noviceGrowth.plantedCarrotCount + (ingredientId === 'carrot' ? 1 : 0),
        },
      };
      if (planted.dialogue.weather.condition === 'rain') {
        planted = applyRainAutoWaterToPlots(planted);
      }
      planted = advanceSakuraEventTask(planted, 'plant_or_harvest', 1);
      return ingredientId === 'strawberry'
        ? applyEventOnPlantStrawberry(planted)
        : planted;
    });
    const durationText = seedEval.isPaused ? '（天候暫停中）' : formatCropDurationLabel(effectiveSec);
    setSpeech(
      hasFreeSeed
        ? `用免費種子種下${info.name}囉，再等 ${durationText}就可以收成了！`
        : `種下${info.name}種子囉，再等 ${durationText}就可以收成了！`
    );
  };

  const handlePlantAllCrops = (ingredientId: IngredientId) => {
    const info = INGREDIENTS[ingredientId];
    const emptyPlots = game.farmPlots.filter((p) => p.cropId === null);
    if (emptyPlots.length === 0) return;

    let remainingFree = freeSeeds[ingredientId] ?? 0;
    let remainingCoins = game.coins;
    let freeUsed = 0;
    let coinsUsed = 0;
    const plantedPlotIds = new Map<number, boolean>();

    for (const plot of emptyPlots) {
      if (remainingFree > 0) {
        remainingFree -= 1;
        freeUsed += 1;
        plantedPlotIds.set(plot.id, Math.random() < 0.1);
      } else if (remainingCoins >= info.seedCost) {
        remainingCoins -= info.seedCost;
        coinsUsed += info.seedCost;
        plantedPlotIds.set(plot.id, Math.random() < 0.1);
      } else {
        break;
      }
    }

    const plantedCount = plantedPlotIds.size;
    if (plantedCount === 0) {
      soundFX.miss(game.soundEnabled);
      pushFeedback('金幣不足，無法播種喔', '🪙');
      return;
    }

    soundFX.pop(game.soundEnabled);
    triggerHaptic(16);
    const plantedAt = Date.now();
    const durationMs = getEffectiveGrowDurationMs(info.growSeconds, game.house);
    const seedEval = evaluateCropConditions({
      cropId: ingredientId,
      watered: false,
      windblown: false,
      seasonId: game.seasonSystem?.currentSeason ?? getSeasonFromDate(new Date(plantedAt)),
      weatherCondition: game.dialogue.weather.condition ?? 'clear',
      greenhouseLevel: game.house.farmUpgrades.greenhouseLevel ?? 0,
    });
    const expectedDurationMs = getExpectedCropDurationMs(
      durationMs,
      plantedAt,
      game.yardMoodBuffPeriods ?? [],
      activeAbility.cropGrowthRateMultiplier * seedEval.rateMultiplier,
      { isPaused: seedEval.isPaused, minRate: 0.4 }
    );
    const effectiveSec = Math.max(1, Math.round(expectedDurationMs / 1000));

    if (freeUsed > 0) {
      setFreeSeeds((prev) => ({
        ...prev,
        [ingredientId]: Math.max(0, (prev[ingredientId] ?? 0) - freeUsed),
      }));
    }

    setGame((prev) => {
      let plantedAll: GameState = {
        ...prev,
        coins: Math.max(0, prev.coins - coinsUsed),
        farmPlots: prev.farmPlots.map((p) =>
          plantedPlotIds.has(p.id)
            ? {
                ...p,
                cropId: ingredientId,
                plantedAt,
                durationMs,
                watered: false,
                isGolden: plantedPlotIds.get(p.id),
                windblown: false,
                autoWateredByRainDate: undefined,
              }
            : p
        ),
        noviceGrowth: {
          ...prev.noviceGrowth,
          plantedCarrotCount:
            prev.noviceGrowth.plantedCarrotCount + (ingredientId === 'carrot' ? plantedCount : 0),
        },
      };
      if (plantedAll.dialogue.weather.condition === 'rain') {
        plantedAll = applyRainAutoWaterToPlots(plantedAll);
      }
      plantedAll = advanceSakuraEventTask(plantedAll, 'plant_or_harvest', plantedCount);
      return ingredientId === 'strawberry'
        ? applyEventOnPlantStrawberry(plantedAll)
        : plantedAll;
    });

    const durationText = seedEval.isPaused ? '（天候暫停中）' : formatCropDurationLabel(effectiveSec);
    pushFeedback(`一鍵種下 ${plantedCount} 塊${info.name}`, info.emoji);
    setSpeech(
      `一口氣種下 ${plantedCount} 塊${info.name}囉，再等 ${durationText}就能一起大豐收！`
    );
  };

  const handleToggleCropNotify = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      pushFeedback('此瀏覽器暫不支援通知提醒', '🔔');
      return;
    }
    if (cropNotifyEnabled) {
      setCropNotifyEnabled(false);
      pushFeedback('已關閉作物成熟通知', '🔕');
      return;
    }
    if (Notification.permission === 'granted') {
      setCropNotifyEnabled(true);
      pushFeedback('已開啟作物成熟通知提醒', '🔔');
      return;
    }
    if (Notification.permission === 'denied') {
      setCropNotifyEnabled(false);
      pushFeedback('請先於瀏覽器網站設定允許通知權限', '⚠️');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setCropNotifyEnabled(true);
        pushFeedback('已開啟作物成熟通知提醒', '🔔');
      } else {
        setCropNotifyEnabled(false);
        pushFeedback('未授權通知權限，維持關閉', '🔕');
      }
    } catch {
      setCropNotifyEnabled(false);
      pushFeedback('無法開啟瀏覽器通知提醒', '⚠️');
    }
  };

  const handleWaterCrop = (plotId: number) => {
    const targetPlot = game.farmPlots.find((p) => p.id === plotId);
    if (!targetPlot || !targetPlot.cropId || targetPlot.plantedAt === null) return;
    if (targetPlot.watered) return;
    const waterPlotEval = evaluateCropSeasonAndWeather(game, targetPlot);
    if (
      getCropGrowthState(
        targetPlot,
        Date.now(),
        game.yardMoodBuffPeriods ?? [],
        activeAbility.cropGrowthRateMultiplier * waterPlotEval.rateMultiplier,
        { isPaused: waterPlotEval.isPaused, minRate: 0.4 }
      ).isReady
    ) {
      return;
    }

    const cropInfo = INGREDIENTS[targetPlot.cropId];
    const boostMs = getWaterBoostMs(targetPlot.durationMs);
    const boostLabel = formatWaterBoostLabel(boostMs);
    const boostDurationText = formatCropDurationLabel(Math.round(boostMs / 1000));
    soundFX.splash(game.soundEnabled);
    soundFX.heart(game.soundEnabled);
    triggerHaptic(15);

    setGame((prev) => ({
      ...prev,
      farmPlots: prev.farmPlots.map((p) =>
        p.id === plotId && p.plantedAt !== null
          ? { ...p, plantedAt: p.plantedAt - boostMs, watered: true }
          : p
      ),
    }));
    pushFeedback(`${cropInfo.name} 澆水加速 ${boostLabel}`, '💧');
    setSpeech(`幫${cropInfo.name}澆水囉！等待時間立刻減少 ${boostDurationText} 💧`);
  };

  const handleHarvestCrop = (plotId: number) => {
    const targetPlot = game.farmPlots.find((p) => p.id === plotId);
    if (!targetPlot || !targetPlot.cropId || targetPlot.plantedAt === null) return;
    const harvestPlotEval = evaluateCropSeasonAndWeather(game, targetPlot);
    if (
      !getCropGrowthState(
        targetPlot,
        Date.now(),
        game.yardMoodBuffPeriods ?? [],
        activeAbility.cropGrowthRateMultiplier * harvestPlotEval.rateMultiplier,
        { isPaused: harvestPlotEval.isPaused, minRate: 0.4 }
      ).isReady
    ) {
      return;
    }

    const cropInfo = INGREDIENTS[targetPlot.cropId];
    const harvestedId = targetPlot.cropId;
    const storageCap = getIngredientStorageCap(game.house);
    const curQty = game.ingredients[harvestedId] ?? 0;

    if (curQty >= storageCap) {
      soundFX.miss(game.soundEnabled);
      pushFeedback(`倉庫上限已滿 (${storageCap})`, '🏚️');
      setSpeech(`${cropInfo.name}已達小倉庫上限 ${storageCap} 個！快去升級小倉庫或先到廚房做料理吧！`);
      return;
    }

    const baseYield = Math.max(
      1,
      getEffectiveHarvestYield(cropInfo.harvestYield, game.house) + harvestPlotEval.yieldDelta
    );
    const extraRollChance =
      activeAbility.pigHarvestBonusChance + activeAbility.hamsterIngredientBonusChance;
    const extraPetBonus = extraRollChance > 0 && Math.random() < extraRollChance ? 1 : 0;
    const totalYield = baseYield + extraPetBonus;
    const nextQty = Math.min(storageCap, curQty + totalYield);
    const actualGain = Math.max(1, nextQty - curQty);
    const gainedPetExtra = actualGain > baseYield;
    const isGolden = Boolean(targetPlot.isGolden);
    const goldenCoinBonus = isGolden ? cropInfo.seedCost * 2 : 0;

    if (isGolden) {
      soundFX.levelUp(game.soundEnabled);
      triggerHaptic(25);
    } else {
      soundFX.heart(game.soundEnabled);
    }

    setGame((prev) => {
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const harvestedState: GameState = {
        ...prev,
        coins: prev.coins + goldenCoinBonus,
        ingredients: {
          ...prev.ingredients,
          [harvestedId]: Math.min(storageCap, (prev.ingredients[harvestedId] ?? 0) + totalYield),
        },
        farmPlots: prev.farmPlots.map((p) =>
          p.id === plotId
            ? {
                ...p,
                cropId: null,
                plantedAt: null,
                durationMs: 0,
                watered: false,
                isGolden: false,
                windblown: false,
                autoWateredByRainDate: undefined,
              }
            : p
        ),
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'harvest_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
      };
      let withMem = recordMonthlyActivity(harvestedState, {
        interactionLabel: '農場收成',
      });
      const currentActive = getActivePet(withMem);
      withMem = recordMemoryEntry(withMem, {
        uniqueKey: 'farm_harvest_first',
        petId: currentActive.id,
        type: 'farm',
        title: `第一次農場收成：${cropInfo.name}`,
        description: `親手種植的${cropInfo.name}成熟採收 +${actualGain}，食材小倉庫大豐收！`,
        emoji: cropInfo.emoji,
        weight: currentActive.weight,
      });
      withMem = advanceSakuraEventTask(withMem, 'plant_or_harvest', 1);
      if (harvestedId === 'strawberry') {
        withMem = applyEventOnHarvestStrawberry(withMem, {
          actorUserId: currentUserId,
          actorName,
          hasSharedRoom: Boolean(sharedRoom),
          harvestedPlotsCount: 1,
        }).nextState;
      }
      return withMem;
    });

    if (harvestedId === 'strawberry' && game.seasonalEvent?.status === 'active') {
      pushFeedback('草莓季 +2 草莓券', '🍓');
    }

    if (isGolden) {
      pushFeedback(`大豐收！獲得雙倍金幣 +${goldenCoinBonus}`, '🌟');
      setSpeech(`大豐收！黃金${cropInfo.name}閃閃發光，獲得雙倍金幣 +${goldenCoinBonus} 🪙！`);
    } else if (gainedPetExtra) {
      pushFeedback(
        `${activePet.name}發揮「${activeAbility.ability.title}」額外 +1 ${cropInfo.name}！`,
        activeAbility.ability.emoji
      );
      setSpeech(`${activePet.name}憑「${activeAbility.ability.title}」幫你多找到 1 個${cropInfo.name}！`);
    } else {
      pushFeedback(`${cropInfo.name} +${actualGain}`, cropInfo.emoji);
      setSpeech(`採收了新鮮${cropInfo.name}！快去廚房做料理或手作家具吧～`);
    }
  };

  const handleWaterAllCrops = () => {
    const nowTs = Date.now();
    const buffs = game.yardMoodBuffPeriods ?? [];
    const targetPlots = game.farmPlots.filter((p) => {
      if (p.cropId === null || p.plantedAt === null || p.watered) return false;
      const ev = evaluateCropSeasonAndWeather(game, p);
      return !getCropGrowthState(
        p,
        nowTs,
        buffs,
        activeAbility.cropGrowthRateMultiplier * ev.rateMultiplier,
        { isPaused: ev.isPaused, minRate: 0.4 }
      ).isReady;
    });
    const targetIds = new Set(targetPlots.map((p) => p.id));
    if (targetIds.size === 0) return;

    const maxBoostMs = targetPlots.reduce(
      (max, p) => Math.max(max, getWaterBoostMs(p.durationMs)),
      5000
    );
    const minBoostMs = targetPlots.reduce(
      (min, p) => Math.min(min, getWaterBoostMs(p.durationMs)),
      maxBoostMs
    );
    const summaryLabel =
      maxBoostMs === minBoostMs
        ? formatWaterBoostLabel(maxBoostMs)
        : `最多 ${formatWaterBoostLabel(maxBoostMs)}`;

    soundFX.splash(game.soundEnabled);
    soundFX.heart(game.soundEnabled);
    triggerHaptic(18);

    setGame((prev) => ({
      ...prev,
      farmPlots: prev.farmPlots.map((p) =>
        targetIds.has(p.id) && p.plantedAt !== null
          ? { ...p, plantedAt: p.plantedAt - getWaterBoostMs(p.durationMs), watered: true }
          : p
      ),
    }));
    pushFeedback(`一次為 ${targetIds.size} 塊田地澆水 ${summaryLabel}`, '💧');
    setSpeech(`一口氣幫 ${targetIds.size} 塊農地澆水囉！全部作物都加速成長 💧`);
  };

  const handleHarvestAllCrops = () => {
    const nowTs = Date.now();
    const buffs = game.yardMoodBuffPeriods ?? [];
    const storageCap = getIngredientStorageCap(game.house);
    const readyPlots = game.farmPlots.filter((p) => {
      if (p.cropId === null || p.plantedAt === null) return false;
      const ev = evaluateCropSeasonAndWeather(game, p);
      return getCropGrowthState(
        p,
        nowTs,
        buffs,
        activeAbility.cropGrowthRateMultiplier * ev.rateMultiplier,
        { isPaused: ev.isPaused, minRate: 0.4 }
      ).isReady;
    });
    if (readyPlots.length === 0) return;

    const simIngredients: Record<IngredientId, number> = { ...game.ingredients };
    const harvestedIds = new Set<number>();
    const perPlotYield = new Map<number, number>();
    let harvestedCount = 0;
    let skippedFullCount = 0;
    let totalGoldenCoins = 0;
    let totalPetExtraBonus = 0;
    let firstHarvestedCropName = '';
    let firstHarvestedCropEmoji = '🌾';
    let firstHarvestedGain = 0;

    const extraRollChance =
      activeAbility.pigHarvestBonusChance + activeAbility.hamsterIngredientBonusChance;

    for (const plot of readyPlots) {
      if (!plot.cropId) continue;
      const cropInfo = INGREDIENTS[plot.cropId];
      const curQty = simIngredients[plot.cropId] ?? 0;
      if (curQty >= storageCap) {
        skippedFullCount += 1;
        continue;
      }
      const ev = evaluateCropSeasonAndWeather(game, plot);
      const baseYield = Math.max(
        1,
        getEffectiveHarvestYield(cropInfo.harvestYield, game.house) + ev.yieldDelta
      );
      const extraBonus = extraRollChance > 0 && Math.random() < extraRollChance ? 1 : 0;
      const totalYield = baseYield + extraBonus;
      const nextQty = Math.min(storageCap, curQty + totalYield);
      const actualGain = Math.max(1, nextQty - curQty);
      if (actualGain > baseYield) {
        totalPetExtraBonus += actualGain - baseYield;
      }
      perPlotYield.set(plot.id, totalYield);
      simIngredients[plot.cropId] = nextQty;
      harvestedIds.add(plot.id);
      harvestedCount += 1;
      if (!firstHarvestedCropName) {
        firstHarvestedCropName = cropInfo.name;
        firstHarvestedCropEmoji = cropInfo.emoji;
        firstHarvestedGain = actualGain;
      }
      if (plot.isGolden) {
        totalGoldenCoins += cropInfo.seedCost * 2;
      }
    }

    if (harvestedCount === 0) {
      soundFX.miss(game.soundEnabled);
      pushFeedback(`倉庫上限已滿 (${storageCap})`, '🏚️');
      setSpeech(`食材小倉庫已達上限 ${storageCap} 個！先去升級倉庫或到廚房合成料理吧！`);
      return;
    }

    if (totalGoldenCoins > 0) {
      soundFX.levelUp(game.soundEnabled);
      triggerHaptic(25);
    } else {
      soundFX.heart(game.soundEnabled);
      triggerHaptic(18);
    }

    setGame((prev) => {
      const nextIngredients: Record<IngredientId, number> = { ...prev.ingredients };
      let coinBonus = 0;
      for (const p of prev.farmPlots) {
        if (!harvestedIds.has(p.id) || !p.cropId) continue;
        const info = INGREDIENTS[p.cropId];
        const totalYield =
          perPlotYield.get(p.id) ?? getEffectiveHarvestYield(info.harvestYield, prev.house);
        nextIngredients[p.cropId] = Math.min(
          storageCap,
          (nextIngredients[p.cropId] ?? 0) + totalYield
        );
        if (p.isGolden) {
          coinBonus += info.seedCost * 2;
        }
      }

      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const harvestedState: GameState = {
        ...prev,
        coins: prev.coins + coinBonus,
        ingredients: nextIngredients,
        farmPlots: prev.farmPlots.map((p) =>
          harvestedIds.has(p.id)
            ? {
                ...p,
                cropId: null,
                plantedAt: null,
                durationMs: 0,
                watered: false,
                isGolden: false,
                windblown: false,
                autoWateredByRainDate: undefined,
              }
            : p
        ),
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'harvest_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
      };
      let withMem = recordMonthlyActivity(harvestedState, {
        interactionLabel: '農場收成',
      });
      const currentActive = getActivePet(withMem);
      withMem = recordMemoryEntry(withMem, {
        uniqueKey: 'farm_harvest_first',
        petId: currentActive.id,
        type: 'farm',
        title: `第一次農場收成：${firstHarvestedCropName}`,
        description: `親手種植的${firstHarvestedCropName}成熟採收 +${firstHarvestedGain}，食材小倉庫大豐收！`,
        emoji: firstHarvestedCropEmoji,
        weight: currentActive.weight,
      });
      withMem = advanceSakuraEventTask(withMem, 'plant_or_harvest', harvestedCount);
      const strawberryPlotCount = prev.farmPlots.filter(
        (p) => harvestedIds.has(p.id) && p.cropId === 'strawberry'
      ).length;
      if (strawberryPlotCount > 0) {
        withMem = applyEventOnHarvestStrawberry(withMem, {
          actorUserId: currentUserId,
          actorName,
          hasSharedRoom: Boolean(sharedRoom),
          harvestedPlotsCount: strawberryPlotCount,
        }).nextState;
      }
      return withMem;
    });

    const strawberryHarvestedCount = readyPlots.filter(
      (p) => harvestedIds.has(p.id) && p.cropId === 'strawberry'
    ).length;
    if (strawberryHarvestedCount > 0 && game.seasonalEvent?.status === 'active') {
      pushFeedback(`草莓季 +${strawberryHarvestedCount * 2} 草莓券`, '🍓');
    }

    if (totalGoldenCoins > 0) {
      pushFeedback(`一鍵採收 ${harvestedCount} 塊 · 黃金金幣 +${totalGoldenCoins}`, '🌟');
    } else if (totalPetExtraBonus > 0) {
      pushFeedback(
        `${activePet.name}「${activeAbility.ability.title}」額外 +${totalPetExtraBonus} 食材！`,
        activeAbility.ability.emoji
      );
    } else {
      pushFeedback(`一鍵採收 ${harvestedCount} 塊農地`, '🧺');
    }

    if (skippedFullCount > 0) {
      setSpeech(
        `已採收 ${harvestedCount} 塊農地！另有 ${skippedFullCount} 塊因倉庫滿載先保留在田裡喔～`
      );
    } else {
      setSpeech(
        `大豐收！一口氣採收了 ${harvestedCount} 塊農地${
          totalGoldenCoins > 0 ? `，還拿到黃金雙倍金幣 +${totalGoldenCoins} 🪙` : ''
        }${totalPetExtraBonus > 0 ? `，${activePet.name}還幫忙多收了 ${totalPetExtraBonus} 個食材` : ''}！`
      );
    }
  };

  const handleClaimPuppyTreasure = (): string | null => {
    if (!puppyTreasureReady) return null;
    lastPuppyTreasureAtRef.current = Date.now();
    setPuppyTreasureReady(false);

    soundFX.petVoice(game.soundEnabled, 'dog');
    soundFX.heart(game.soundEnabled);
    triggerHaptic(18);

    const giveCoins = Math.random() < 0.5;
    if (giveCoins) {
      const coinBonus = Math.floor(Math.random() * 3) + 1;
      setGame((prev) => ({
        ...prev,
        coins: prev.coins + coinBonus,
      }));
      const msg = `尋寶成功！獲得 ${coinBonus} 枚免費金幣`;
      pushFeedback(`小狗送你 ${coinBonus} 金幣！`, '🪙');
      setSpeech(`汪！草地小狗挖到寶藏了，送你 ${coinBonus} 枚免費金幣！`);
      return msg;
    }

    const randomSeedId = INGREDIENT_IDS[Math.floor(Math.random() * INGREDIENT_IDS.length)];
    const seedInfo = INGREDIENTS[randomSeedId];
    setFreeSeeds((prev) => ({
      ...prev,
      [randomSeedId]: (prev[randomSeedId] ?? 0) + 1,
    }));
    const msg = `尋寶成功！獲得 1 顆免費${seedInfo.name}種子`;
    pushFeedback(`小狗送你 1 顆免費${seedInfo.name}種子！`, seedInfo.emoji);
    setSpeech(`汪！小狗撿到了 1 顆免費${seedInfo.name}種子，快選來種植吧！`);
    return msg;
  };

  const handleExpandFarmPlot = (paySource: PaymentSource) => {
    const res = expandNextFarmPlot(game, paySource);
    if (!res.ok) {
      soundFX.miss(game.soundEnabled);
      pushFeedback(res.error ?? '無法擴建農地', '⚠️');
      if (res.error) setSpeech(res.error);
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(() => res.nextState);
    if (res.notice) {
      pushFeedback(res.notice, '🌱');
      setSpeech(res.notice);
    }
  };

  const handleUpgradeFarmFacility = (upgradeId: FarmUpgradeId, paySource: PaymentSource) => {
    const res = upgradeFarmFacility(game, upgradeId, paySource);
    if (!res.ok) {
      soundFX.miss(game.soundEnabled);
      pushFeedback(res.error ?? '無法升級設施', '⚠️');
      if (res.error) setSpeech(res.error);
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(() => res.nextState);
    if (res.notice) {
      pushFeedback(res.notice, '🏡');
      setSpeech(res.notice);
    }
  };

  const handleToggleFarmDecoration = (decorId: FarmDecorationId, paySource: PaymentSource) => {
    const res = buyOrToggleFarmDecoration(game, decorId, paySource);
    if (!res.ok) {
      soundFX.miss(game.soundEnabled);
      pushFeedback(res.error ?? '無法佈置裝飾', '⚠️');
      if (res.error) setSpeech(res.error);
      return;
    }
    soundFX.pop(game.soundEnabled);
    setGame(() => res.nextState);
    if (res.notice) {
      pushFeedback(res.notice, '🌸');
      setSpeech(res.notice);
    }
  };

  const handleUpdateHouseName = (newName: string) => {
    const res = updateHouseName(game, newName);
    if (!res.ok) {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
      return;
    }
    soundFX.pop(game.soundEnabled);
    setGame(() => res.nextState);
    if (res.notice) {
      pushFeedback(res.notice, '🪧');
      setSpeech(res.notice);
    }
  };

  const handleCookRecipe = (recipe: KitchenRecipe) => {
    const reqEntries = Object.entries(recipe.ingredients) as [IngredientId, number][];
    const canCook = reqEntries.every(([id, need]) => (game.ingredients[id] ?? 0) >= need);
    if (!canCook) return;

    const isNewRecipe = !(game.encyclopedia.learnedRecipeIds ?? []).includes(recipe.id);
    soundFX.levelUp(game.soundEnabled);
    setGame((prev) => {
      const prevActive = getActivePet(prev);
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const nextIngredients = { ...prev.ingredients };
      for (const [id, need] of reqEntries) {
        nextIngredients[id] = Math.max(0, (nextIngredients[id] ?? 0) - need);
      }
      const nextGrowth = prevActive.growth + recipe.bonusGrowth;
      const nextCollectedFoods = prev.encyclopedia.collectedFoodIds.includes(recipe.outputFoodId)
        ? prev.encyclopedia.collectedFoodIds
        : [...prev.encyclopedia.collectedFoodIds, recipe.outputFoodId];
      const prevLearnedRecipes = prev.encyclopedia.learnedRecipeIds ?? [];
      const nextLearnedRecipes = prevLearnedRecipes.includes(recipe.id)
        ? prevLearnedRecipes
        : [...prevLearnedRecipes, recipe.id];

      const updatedWithPet = updateActivePet(prev, (pet) => ({
        ...pet,
        growth: nextGrowth,
        level: getGrowthStage(nextGrowth).level,
      }));
      const draftState: GameState = {
        ...updatedWithPet,
        ingredients: nextIngredients,
        foods: {
          ...prev.foods,
          [recipe.outputFoodId]: (prev.foods[recipe.outputFoodId] ?? 0) + 1,
        },
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'cook_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
        noviceGrowth: {
          ...prev.noviceGrowth,
          cookedCount: prev.noviceGrowth.cookedCount + 1,
        },
        encyclopedia: {
          ...prev.encyclopedia,
          collectedFoodIds: nextCollectedFoods,
          learnedRecipeIds: nextLearnedRecipes,
        },
      };
      const syncedAcc = syncAllAccessoryProgress(draftState).nextState;
      const syncedEncyclopedia = syncEncyclopediaRewards(syncedAcc).nextState;
      let withMem = recordMonthlyActivity(syncedEncyclopedia, {
        interactionLabel: '廚房料理',
        growthDelta: recipe.bonusGrowth,
      });
      const currentActive = getActivePet(withMem);
      withMem = recordMemoryEntry(withMem, {
        uniqueKey: 'farm_cook_first',
        petId: currentActive.id,
        type: 'farm',
        title: `第一次料理合成：${recipe.name}`,
        description: `用新鮮農場作物親手完成美味的「${recipe.name}」！`,
        emoji: recipe.emoji,
        weight: currentActive.weight,
      });
      withMem = advanceSakuraEventTask(withMem, 'cook_seasonal', 1);
      withMem = advanceSakuraCoopStep(withMem, 'food', currentUserId);
      if (isStrawberryRecipe(recipe)) {
        withMem = applyEventOnCookStrawberry(withMem, {
          recipe,
          actorUserId: currentUserId,
          actorName,
          hasSharedRoom: Boolean(sharedRoom),
        }).nextState;
      }
      return withMem;
    });
    if (isStrawberryRecipe(recipe) && game.seasonalEvent?.status === 'active') {
      pushFeedback('草莓料理 +3 草莓券', '🍓');
    }
    pushFeedback(
      isNewRecipe ? `解鎖新食譜：${recipe.name}！` : `做出 ${recipe.name}！`,
      recipe.emoji
    );
    setSpeech(
      isNewRecipe
        ? `哇～學會新食譜「${recipe.name}」並收錄進圖鑑囉！好想馬上吃一口！`
        : `香噴噴的「${recipe.name}」出爐囉～好想馬上吃一口！`
    );
  };

  const handleSpendReplayCoins = (cost: number): boolean => {
    if (game.coins < cost) return false;
    setGame((prev) => {
      if (prev.coins < cost) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
      };
    });
    return true;
  };

  const handleFinishMinigame = (result: MinigameResult): MinigameSettlementSummary => {
    const preview = settleMinigameOutcome(game, result);
    const cfg = MINIGAME_BY_ID[result.gameId];
    const isWindyWeather = game.dialogue.weather.condition === 'windy';
    const windyBonusCoins = isWindyWeather
      ? Math.max(1, Math.round(preview.reward.coins * 0.15))
      : 0;

    setGame((prev) => {
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const settledOutcome = settleMinigameOutcome(prev, result);
      const settled = settledOutcome.nextState;
      const isWindy = prev.dialogue.weather.condition === 'windy';
      const extraWindyCoins = isWindy
        ? Math.max(1, Math.round(settledOutcome.reward.coins * 0.15))
        : 0;
      let nextPersonality = applyPersonalityDevelopment(
        settled.personality,
        'minigame'
      ).nextPersonality;
      let nextDialogue = settled.dialogue;
      if (result.gameId === 'mudBath') {
        nextPersonality = applyPersonalityDevelopment(
          nextPersonality,
          'clean_or_bath'
        ).nextPersonality;
        nextDialogue = appendMemoryEvent(nextDialogue, {
          type: 'bathed',
          detail: '泥巴澡小遊戲',
        });
      }
      let drafted: GameState = {
        ...settled,
        coins: settled.coins + extraWindyCoins,
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'minigame_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
        personality: nextPersonality,
        dialogue: nextDialogue,
      };
      if (isWindy) {
        drafted = advanceWeatherTaskProgress(drafted, 'minigame', 1);
      }
      return applyEventOnMinigamePlayed(syncPhotoStudioState(drafted).nextState);
    });

    const totalCoins = preview.reward.coins + windyBonusCoins;
    pushFeedback(`獲得 +${totalCoins} 金幣`, '🪙');
    if (windyBonusCoins > 0) {
      pushFeedback(`大風小遊戲 +15% 加成 (+${windyBonusCoins} 金幣)`, '🍃');
    }
    if (preview.reward.ingredientReward) {
      const ingInfo = INGREDIENTS[preview.reward.ingredientReward.id];
      pushFeedback(
        `${ingInfo.name} +${preview.reward.ingredientReward.qty}`,
        ingInfo.emoji
      );
    }
    setSpeech(
      `玩「${cfg.name}」拿了 ${result.score} 分，賺到 ${totalCoins} 金幣好開心！`
    );

    return {
      result,
      reward: {
        ...preview.reward,
        coins: totalCoins,
      },
      isNewHighScore: preview.isNewHighScore,
      newlyUnlockedBadges: preview.newlyUnlockedBadges,
    };
  };

  const handleClaimWeeklyChallenge = (challengeId: MinigameWeeklyChallengeId) => {
    const challenge = MINIGAME_WEEKLY_CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) return;
    soundFX.levelUp(game.soundEnabled);
    setGame((prev) => claimWeeklyMinigameChallenge(prev, challengeId).nextState);
    pushFeedback(`週挑戰 +${challenge.rewardCoins} 金幣`, '🏆');
    setSpeech(`完成每週挑戰「${challenge.title}」，領到 ${challenge.rewardCoins} 金幣！`);
  };

  const handleToggleEquip = (item: Accessory) => {
    const currentlyEquipped = activePet.accessories[item.slot] === item.id;
    const isEquipping = !currentlyEquipped;

    if (isEquipping) {
      const match = evaluateAccessoryPreference(
        activePersonality,
        activePet.species,
        item
      );
      setWardrobeReactionText(match.reactionText);
      setSpeech(match.reactionText);
      if (match.isLiked) {
        soundFX.heart(game.soundEnabled);
        setTemporaryAction('petted', 1500, match.expression);
        pushFeedback('最愛穿搭加成！', '💖');
      } else {
        soundFX.pop(game.soundEnabled);
      }
    } else {
      soundFX.pop(game.soundEnabled);
      const offMsg = `先脫下「${item.name}」透透氣～`;
      setWardrobeReactionText(offMsg);
    }

    setGame((prev) => {
      const prevActive = getActivePet(prev);
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const current = prevActive.accessories[item.slot];
      const next = current === item.id ? null : item.id;
      const updatedPet = updateActivePet(prev, (pet) => ({
        ...pet,
        accessories: {
          ...pet.accessories,
          [item.slot]: next,
        },
      }));
      let updated: GameState = {
        ...updatedPet,
        dailyTasks: next
          ? incrementTaskProgress(synced.dailyTasks, 'dress_1', 1)
          : synced.dailyTasks,
        dailyTasksDate: synced.dailyTasksDate,
      };
      if (next) {
        updated = recordAccessoryWear(updated, item.id);
        updated = recordMonthlyActivity(updated, {
          interactionLabel: '穿搭換裝',
          accessoryId: item.id,
        });
        updated = recordMemoryEntry(updated, {
          uniqueKey: `wardrobe_first_equip_${prevActive.id}`,
          petId: prevActive.id,
          type: 'wardrobe',
          title: `${prevActive.name}第一次穿戴配件：${item.name}`,
          description: `${prevActive.name}戴上第一件專屬造型配件，可愛度爆表！`,
          emoji: item.emoji,
          accessoryId: item.id,
          weight: prevActive.weight,
        });
        if (item.rarity !== 'common') {
          updated = recordMemoryEntry(updated, {
            uniqueKey: `wardrobe_rare_${prevActive.id}_${item.id}`,
            petId: prevActive.id,
            type: 'wardrobe',
            title: `${prevActive.name}換上稀有造型「${item.name}」`,
            description: `閃閃發光的稀有配件登場，${prevActive.name}成為全場焦點！`,
            emoji: item.emoji,
            accessoryId: item.id,
            weight: prevActive.weight,
          });
        }
      }
      return syncSeasonalEventState(updated);
    });
  };

  const handleBuyAccessory = (item: Accessory) => {
    if (
      !isAccessoryPurchasable(item) ||
      game.coins < item.price ||
      game.accessories.includes(item.id)
    ) {
      return;
    }
    soundFX.levelUp(game.soundEnabled);

    const stage = getGrowthStage(activePet.growth);
    const canAutoEquip = stage.unlockedSlots.includes(item.slot);
    const match = evaluateAccessoryPreference(
      activePersonality,
      activePet.species,
      item
    );

    const withBoughtPet = canAutoEquip
      ? updateActivePet(game, (pet) => ({
          ...pet,
          accessories: { ...pet.accessories, [item.slot]: item.id },
        }))
      : game;
    const draftState: GameState = {
      ...withBoughtPet,
      coins: game.coins - item.price,
      accessories: [...game.accessories, item.id],
      dialogue: appendMemoryEvent(game.dialogue, {
        type: 'newAccessory',
        detail: item.name,
        itemId: item.id,
      }),
      noviceGrowth: {
        ...game.noviceGrowth,
        boughtAccessoryCount: game.noviceGrowth.boughtAccessoryCount + 1,
      },
    };
    const synced = syncAllAccessoryProgress(draftState);
    let nextBought = synced.nextState;
    const boughtActive = getActivePet(nextBought);
    if (canAutoEquip) {
      nextBought = recordMonthlyActivity(nextBought, {
        interactionLabel: '穿搭換裝',
        accessoryId: item.id,
      });
      nextBought = recordMemoryEntry(nextBought, {
        uniqueKey: `wardrobe_first_equip_${boughtActive.id}`,
        petId: boughtActive.id,
        type: 'wardrobe',
        title: `${boughtActive.name}第一次穿戴配件：${item.name}`,
        description: `${boughtActive.name}戴上第一件專屬造型配件，可愛度爆表！`,
        emoji: item.emoji,
        accessoryId: item.id,
        weight: boughtActive.weight,
      });
      if (item.rarity !== 'common') {
        nextBought = recordMemoryEntry(nextBought, {
          uniqueKey: `wardrobe_rare_${boughtActive.id}_${item.id}`,
          petId: boughtActive.id,
          type: 'wardrobe',
          title: `${boughtActive.name}收藏並穿戴「${item.name}」`,
          description: `獲得進階限定造型「${item.name}」，穿搭圖鑑更豐富啦！`,
          emoji: item.emoji,
          accessoryId: item.id,
          weight: boughtActive.weight,
        });
      }
    }
    if (item.rarity === 'event') {
      nextBought = recordMemoryEntry(nextBought, {
        uniqueKey: `festival_acc_${item.id}`,
        petId: boughtActive.id,
        type: 'festival',
        title: `獲得節日限定配件：${item.name}`,
        description: `解鎖活動限定珍藏「${item.name}」，紀念美好派對時刻！`,
        emoji: '🎉',
        accessoryId: item.id,
      });
    }
    for (const themeId of synced.newlyCompletedThemes) {
      const themeDef = ACCESSORY_THEME_BY_ID[themeId];
      if (themeDef) {
        nextBought = recordMemoryEntry(nextBought, {
          uniqueKey: `wardrobe_theme_${themeId}`,
          type: 'wardrobe',
          title: `集齊「${themeDef.name}」主題套裝！`,
          description: `成功收集 4 件「${themeDef.name}」配件，解鎖專屬稱號與獎勵！`,
          emoji: themeDef.emoji,
          accessoryId: item.id,
        });
      }
    }
    setGame(syncSeasonalEventState(nextBought));

    if (canAutoEquip) {
      setWardrobeReactionText(match.reactionText);
      setSpeech(match.reactionText);
      if (match.isLiked) {
        setTemporaryAction('petted', 1500, match.expression);
        pushFeedback('最愛新穿搭！', '💖');
      }
    }
    if (synced.newlyCompletedThemes.length > 0) {
      const firstTheme = ACCESSORY_THEME_BY_ID[synced.newlyCompletedThemes[0]];
      if (firstTheme) {
        pushFeedback(`集齊「${firstTheme.name}」套裝！`, firstTheme.emoji);
      }
    }
  };

  const handleRecordWeight = (newWeight: number, note?: string) => {
    soundFX.pop(game.soundEnabled);
    const boundedWeight = clampWeight(newWeight);
    const now = new Date();
    setGame((prev) => {
      const prevActive = getActivePet(prev);
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const syncedFamily = syncFamilyDailyTasks(
        prev.familyDailyTasks,
        prev.familyDailyTasksDate
      );
      const delta = roundWeight(boundedWeight - prevActive.weight);
      const nextGrowth = prevActive.growth + 6;
      const speciesEmoji = getPetSpeciesInfo(prevActive.species).emoji;

      const newWeightLog: WeightLog = {
        id: `wlog_${Date.now()}`,
        petId: prevActive.id,
        date: formatLocalDate(now),
        weight: boundedWeight,
        foodName: '手動紀錄',
        note: note || `在成長手帳更新${prevActive.name}的體重紀錄`,
        weightDelta: delta,
        timeStr: formatLocalTime(now),
        timestamp: now.getTime(),
      };

      const withUpdatedPet = updateActivePet(prev, (pet) => ({
        ...pet,
        weight: boundedWeight,
        growth: nextGrowth,
        level: getGrowthStage(nextGrowth).level,
      }));
      const updated: GameState = {
        ...withUpdatedPet,
        dialogue: appendMemoryEvent(prev.dialogue, {
          type: 'weightLogged',
          detail: `${prevActive.name} ${boundedWeight.toFixed(1)} kg`,
        }),
        weightLogs: [newWeightLog, ...prev.weightLogs],
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'weigh_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
        familyDailyTasks: incrementFamilyTaskProgress(
          syncedFamily.familyDailyTasks,
          'family_weigh_1',
          1
        ),
        familyDailyTasksDate: syncedFamily.familyDailyTasksDate,
        noviceGrowth: {
          ...prev.noviceGrowth,
          weightRecordCount: prev.noviceGrowth.weightRecordCount + 1,
        },
      };
      let withMem = recordMonthlyActivity(updated, {
        interactionLabel: '量體重',
        weight: boundedWeight,
        growthDelta: 6,
      });
      const updatedActive = getActivePet(withMem);
      withMem = recordMemoryEntry(withMem, {
        uniqueKey: `weight_first_manual_${updatedActive.id}`,
        petId: updatedActive.id,
        type: 'weight',
        title: `${updatedActive.name}第一次記錄體重：${boundedWeight.toFixed(1)} kg`,
        description: `在成長手帳仔細量測體重，守護 ${updatedActive.name} 健康長大！`,
        emoji: '⚖️',
        weight: boundedWeight,
        level: updatedActive.level,
      });
      if (boundedWeight >= 8) {
        const milestoneKg = boundedWeight >= 16 ? 16 : boundedWeight >= 12 ? 12 : 8;
        withMem = recordMemoryEntry(withMem, {
          uniqueKey: `weight_milestone_${updatedActive.id}_${milestoneKg}`,
          petId: updatedActive.id,
          type: 'weight',
          title: `${updatedActive.name}體重突破 ${milestoneKg} kg 里程碑！`,
          description: `${updatedActive.name}目前體重 ${boundedWeight.toFixed(1)} kg，幸福成長中！`,
          emoji: speciesEmoji,
          weight: boundedWeight,
        });
      }
      return withMem;
    });
  };

  const handleClaimTask = (taskId: string) => {
    soundFX.levelUp(game.soundEnabled);

    setGame((prev) => {
      const prevActive = getActivePet(prev);
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const targetTask = synced.dailyTasks.find((t) => t.id === taskId);
      if (!targetTask || targetTask.claimed || !targetTask.completed) {
        return prev;
      }

      const nextGrowth = prevActive.growth + 15;
      const updatedTasks = synced.dailyTasks.map((t) =>
        t.id === taskId ? { ...t, claimed: true } : t
      );
      const updatedPet = updateActivePet(prev, (pet) => ({
        ...pet,
        growth: nextGrowth,
        level: getGrowthStage(nextGrowth).level,
      }));

      const draftState: GameState = {
        ...updatedPet,
        coins: prev.coins + targetTask.reward.coins,
        foods: {
          ...prev.foods,
          [targetTask.reward.foodId]:
            (prev.foods[targetTask.reward.foodId] ?? 0) + targetTask.reward.foodQty,
        },
        dailyTasks: updatedTasks,
        dailyTasksDate: synced.dailyTasksDate,
        noviceGrowth: {
          ...prev.noviceGrowth,
          completedDailyTasksCount: prev.noviceGrowth.completedDailyTasksCount + 1,
        },
      };
      return syncAllAccessoryProgress(draftState).nextState;
    });
  };

  const handleClaimNoviceDay = (day: number) => {
    const todayStr = getLocalDateString();
    const evaluation = evaluateAllNoviceDays(game, Boolean(sharedRoom), todayStr);
    const targetDay = evaluation.days.find((d) => d.config.day === day);
    if (!targetDay || !targetDay.canClaim) return;

    const dayConfig = NOVICE_GROWTH_DAYS.find((d) => d.day === day);
    if (!dayConfig) return;

    soundFX.levelUp(game.soundEnabled);
    pushFeedback(`領取第 ${day} 天獎勵 +${dayConfig.rewardCoins} 金幣！`, '🎁');
    setSpeech(`完成新手第 ${day} 天目標！獲得滿滿獎勵好開心～`);

    setGame((prev) => {
      let nextCoins = prev.coins + dayConfig.rewardCoins;
      const nextFoods = { ...prev.foods };
      const nextIngredients = { ...prev.ingredients };
      const nextAccessories = [...prev.accessories];
      const nextBackgrounds = [...prev.unlockedBackgrounds];
      let nextActiveBackground = prev.activeBackground;

      for (const rw of dayConfig.rewardItems) {
        if (rw.kind === 'accessory') {
          if (!nextAccessories.includes(rw.id)) {
            nextAccessories.push(rw.id);
          } else {
            nextCoins += 15;
          }
        } else if (rw.kind === 'food') {
          nextFoods[rw.id] = (nextFoods[rw.id] ?? 0) + rw.qty;
        } else if (rw.kind === 'ingredient') {
          const ingKey = rw.id as IngredientId;
          nextIngredients[ingKey] = (nextIngredients[ingKey] ?? 0) + rw.qty;
        } else if (rw.kind === 'background') {
          const bgKey = rw.id as StageBackgroundId;
          if (!nextBackgrounds.includes(bgKey)) {
            nextBackgrounds.push(bgKey);
          }
          nextActiveBackground = bgKey;
        }
      }

      const draftState: GameState = {
        ...prev,
        coins: nextCoins,
        foods: nextFoods,
        ingredients: nextIngredients,
        accessories: nextAccessories,
        unlockedBackgrounds: nextBackgrounds,
        activeBackground: nextActiveBackground,
        noviceGrowth: {
          ...prev.noviceGrowth,
          claimedDays: Array.from(new Set([...prev.noviceGrowth.claimedDays, day])).sort(
            (a, b) => a - b
          ),
          lastClaimDate: todayStr,
        },
      };

      let finalNovice = syncAllAccessoryProgress(draftState).nextState;
      if (day === 7) {
        finalNovice = recordMemoryEntry(finalNovice, {
          uniqueKey: 'festival_novice_day7',
          type: 'festival',
          title: '完成 7 天新手成長慶典！',
          description: `連續完成 7 天成長之路任務，獲得派對限定獎勵與星光背景！`,
          emoji: '🎉',
          accessoryId: 'party_cape',
        });
      }
      return syncPhotoStudioState(finalNovice).nextState;
    });
  };

  const handleSelectBackground = (bg: StageBackgroundId) => {
    if (!game.unlockedBackgrounds.includes(bg)) return;
    soundFX.pop(game.soundEnabled);
    setGame((prev) => ({
      ...prev,
      activeBackground: bg,
    }));
    const cfg = STAGE_BACKGROUNDS[bg];
    pushFeedback(`切換為${cfg.name}`, '✨');
  };

  const handleSelectTitle = (titleId: TitleId | null) => {
    if (titleId !== null && !game.encyclopedia.unlockedTitles.includes(titleId)) return;
    soundFX.pop(game.soundEnabled);
    setGame((prev) => ({
      ...prev,
      encyclopedia: {
        ...prev.encyclopedia,
        activeTitle: titleId,
      },
    }));
    if (titleId) {
      const def = getTitleDefinition(titleId);
      pushFeedback(`佩戴「${def.name}」`, def.emoji);
    } else {
      pushFeedback('已取消佩戴稱號', '✨');
    }
  };

  const handleForceUpload = async () => {
    if (!cloudUser) return;
    setSyncStatus('syncing');
    setSyncError(null);

    if (sharedRoom) {
      const res = await updateSharedPetSave(
        sharedRoom.id,
        gameRef.current,
        cloudUser.id,
        cloudUser.email
      );
      if (res.error) {
        setSyncStatus('error');
        setSyncError(res.error);
      } else {
        lastSharedUpdatedAtRef.current = res.updatedAt;
        setSyncStatus('synced');
        setLastSyncedAt(res.updatedAt);
        pushFeedback('已同步至共養小屋！', '💞');
      }
      return;
    }

    const res = await upsertCloudSave(cloudUser.id, gameRef.current);
    if (res.error) {
      setSyncStatus('error');
      setSyncError(res.error);
    } else {
      setSyncStatus('synced');
      setLastSyncedAt(res.updatedAt);
      pushFeedback('已上傳至雲端！', '☁️');
    }
  };

  const handleForceDownload = async () => {
    if (!cloudUser) return;
    setSyncStatus('syncing');
    setSyncError(null);

    if (sharedRoom) {
      const res = await fetchMySharedPet(cloudUser.id);
      if (res.error) {
        setSyncStatus('error');
        setSyncError(res.error);
        return;
      }
      if (!res.room || !res.state) {
        setSharedRoom(null);
        setSyncStatus('local');
        setSyncError('共養小屋目前無法讀取，已切回單人模式。');
        return;
      }
      setSharedRoom(res.room);
      lastSharedUpdatedAtRef.current = res.room.updatedAt;
      applyCloudStateLocally(res.state);
      setSyncStatus('synced');
      setLastSyncedAt(res.room.updatedAt);
      pushFeedback('已重新載入共養小豬！', '💞');
      return;
    }

    const res = await fetchCloudSave(cloudUser.id);
    if (res.error) {
      setSyncStatus('error');
      setSyncError(res.error);
      return;
    }
    if (!res.state) {
      setSyncStatus('synced');
      setSyncError('雲端目前還沒有任何存檔喔！');
      return;
    }
    applyCloudStateLocally(res.state);
    setSyncStatus('synced');
    setLastSyncedAt(res.updatedAt);
    pushFeedback('已載入雲端存檔！', '☁️');
  };

  const handleResolveConflictUseCloud = () => {
    if (!pendingCloudSave) return;
    applyCloudStateLocally(pendingCloudSave.state);
    setLastSyncedAt(pendingCloudSave.updatedAt);
    setPendingCloudSave(null);
    setSyncStatus('synced');
    setAuthModalOpen(false);
    pushFeedback('已載入雲端小豬！', '☁️');
  };

  const handleResolveConflictUseLocal = async () => {
    if (!cloudUser) return;
    setSyncStatus('syncing');
    setSyncError(null);
    const res = await upsertCloudSave(cloudUser.id, gameRef.current);
    if (res.error) {
      setSyncStatus('error');
      setSyncError(res.error);
      return;
    }
    setPendingCloudSave(null);
    setSyncStatus('synced');
    setLastSyncedAt(res.updatedAt);
    setAuthModalOpen(false);
    pushFeedback('已將本機進度同步至雲端！', '☁️');
  };

  const handleCloudSignOut = async () => {
    await signOutCloud();
    lastHandledUserIdRef.current = null;
    lastSharedUpdatedAtRef.current = null;
    setCloudUser(null);
    setSharedRoom(null);
    setPendingCloudSave(null);
    setLastSyncedAt(null);
    setSyncStatus('local');
    setSyncError(null);
    setAuthModalOpen(false);
  };

  const handleCreateSharedRoom = async (): Promise<string | null> => {
    if (!cloudUser) return '請先登入雲端帳號。';
    setSyncStatus('syncing');
    const res = await createSharedPetRoom(gameRef.current, cloudUser.email);
    if (res.error || !res.room) {
      setSyncStatus('error');
      return res.error ?? '建立共養小屋失敗。';
    }
    setSharedRoom(res.room);
    lastSharedUpdatedAtRef.current = res.room.updatedAt;
    if (res.state) {
      applyCloudStateLocally(res.state);
    }
    setGame((prev) => {
      const updated: GameState = {
        ...prev,
        noviceGrowth: { ...prev.noviceGrowth, createdSharedRoom: true },
      };
      return recordMemoryEntry(updated, {
        uniqueKey: 'coop_join_room',
        type: 'coop',
        title: `建立兩人共養小屋「${updated.house.houseName}」`,
        description: `產生專屬邀請碼 ${res.room!.inviteCode}，開啟雙人共同照護模式！`,
        emoji: '💞',
        isShared: true,
      });
    });
    setSyncStatus('synced');
    setLastSyncedAt(res.room.updatedAt);
    pushFeedback(`共養邀請碼：${res.room.inviteCode}`, '💞');
    return null;
  };

  const handleJoinSharedRoom = async (inviteCode: string): Promise<string | null> => {
    if (!cloudUser) return '請先登入雲端帳號。';
    setSyncStatus('syncing');
    const res = await joinSharedPetByCode(inviteCode, cloudUser.email);
    if (res.error || !res.room) {
      setSyncStatus('local');
      return res.error ?? '加入共養小屋失敗。';
    }
    setSharedRoom(res.room);
    lastSharedUpdatedAtRef.current = res.room.updatedAt;
    setPendingCloudSave(null);
    if (res.state) {
      const joinedActive = getActivePet(res.state);
      applyCloudStateLocally(
        res.state,
        `成功加入！一起來照顧${joinedActive.name}吧！`
      );
    }
    setGame((prev) => {
      const updated: GameState = {
        ...prev,
        noviceGrowth: { ...prev.noviceGrowth, createdSharedRoom: true },
      };
      return recordMemoryEntry(updated, {
        uniqueKey: 'coop_join_room',
        type: 'coop',
        title: `加入兩人共養小屋「${updated.house.houseName}」`,
        description: `與夥伴會合啦！一起餵食、佈置房間並寫下專屬共同回憶！`,
        emoji: '💞',
        isShared: true,
      });
    });
    setSyncStatus('synced');
    setLastSyncedAt(res.room.updatedAt);
    pushFeedback('成功加入兩人共養！', '💞');
    return null;
  };

  const handleRegenerateInviteCode = async (): Promise<string | null> => {
    if (!sharedRoom) return '目前尚未建立共養小屋。';
    const res = await regenerateSharedInviteCode(sharedRoom.id);
    if (res.error || !res.room) {
      return res.error ?? '更新邀請碼失敗。';
    }
    setSharedRoom(res.room);
    lastSharedUpdatedAtRef.current = res.room.updatedAt;
    pushFeedback(`新邀請碼：${res.room.inviteCode}`, '✨');
    return null;
  };

  const handleRefreshSharedRoom = async (): Promise<string | null> => {
    if (!cloudUser) return '請先登入雲端帳號。';
    const res = await fetchMySharedPet(cloudUser.id);
    if (res.error) return res.error;
    if (!res.room) {
      setSharedRoom(null);
      return '找不到共養小屋，可能已被退出或解散。';
    }
    setSharedRoom(res.room);
    lastSharedUpdatedAtRef.current = res.room.updatedAt;
    if (res.state) {
      applyCloudStateLocally(res.state);
    }
    setSyncStatus('synced');
    setLastSyncedAt(res.room.updatedAt);
    return null;
  };

  const handleLeaveSharedRoom = async (): Promise<string | null> => {
    if (!sharedRoom) return null;
    const res = await leaveSharedPetRoom(sharedRoom.id);
    if (res.error) {
      return res.error;
    }
    lastSharedUpdatedAtRef.current = null;
    setSharedRoom(null);
    setSpeech('已退出共養小屋，切回個人照顧模式。');
    pushFeedback('已退出兩人共養', '☁️');
    return null;
  };

  const handleOpenMessageBoard = () => {
    setUnreadMessagesCount(0);
    setMessageModalOpen(true);
  };

  const handleSendMessage = async (
    content: string,
    stickerId: PetStickerId | null,
    targetPetId: string | null = null,
    targetPetName: string | null = null
  ): Promise<string | null> => {
    const cleanText = content.trim();
    if (!cleanText && !stickerId) {
      return '請輸入留言或選擇一張貼圖！';
    }

    const stickerInfo = getStickerById(stickerId);

    if (sharedRoom && cloudUser) {
      const res = await sendSharedMessage({
        sharedPetId: sharedRoom.id,
        authorId: cloudUser.id,
        authorEmail: cloudUser.email,
        content: cleanText,
        stickerId,
        targetPetId,
        targetPetName,
        authorTitleId: game.encyclopedia.activeTitle ?? null,
      });
      if (res.error || !res.message) {
        return res.error ?? '傳送失敗，請稍後再試。';
      }
      const created = res.message;
      setSharedMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return [...prev, created].slice(-80);
      });
      setGame((prev) => {
        const nextPersonality = applyPersonalityDevelopment(
          activePersonality,
          'pet_or_message'
        ).nextPersonality;
        const withUpdatedPet = updateActivePet(prev, (pet) => ({
          ...pet,
          personality: nextPersonality,
        }));
        let updated: GameState = {
          ...withUpdatedPet,
          personality: nextPersonality,
          dialogue: appendMemoryEvent(prev.dialogue, {
            type: 'partnerMessage',
            detail: cleanText || stickerInfo?.label || '貼圖留言',
            actorId: cloudUser.id,
            actorName,
            isCoopHighlight: true,
          }),
        };
        updated = recordMonthlyActivity(updated, {
          coopMessageDelta: 1,
          interactionLabel: '留言互動',
        });
        return updated;
      });
      soundFX.heart(game.soundEnabled);
      if (stickerInfo) {
        setSpeech(stickerInfo.caption);
      } else if (targetPetName) {
        setSpeech(`替你把悄悄話帶給「${targetPetName}」囉～💌`);
      } else {
        setSpeech('收到你的悄悄話囉～🩷');
      }
      return null;
    }

    const authorLabel = cloudUser?.email
      ? cloudUser.email.split('@')[0] || '飼主'
      : '飼主';
    const localMsg: PetMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      authorId: cloudUser?.id ?? 'local',
      authorName: authorLabel,
      authorTitleId: game.encyclopedia.activeTitle ?? null,
      content: cleanText,
      stickerId,
      createdAt: Date.now(),
      targetPetId,
      targetPetName,
    };

    setGame((prev) => {
      const prevActive = getActivePet(prev);
      const nextPersonality = applyPersonalityDevelopment(
        getPetDisplayPersonality(prev, prevActive),
        'pet_or_message'
      ).nextPersonality;
      const withUpdatedPet = updateActivePet(prev, (pet) => ({
        ...pet,
        personality: nextPersonality,
      }));
      const updated: GameState = {
        ...withUpdatedPet,
        messages: [...prev.messages, localMsg].slice(-80),
        personality: nextPersonality,
      };
      return recordMonthlyActivity(updated, {
        coopMessageDelta: 1,
        interactionLabel: '留言互動',
      });
    });
    soundFX.heart(game.soundEnabled);
    if (stickerInfo) {
      setSpeech(stickerInfo.caption);
    } else if (targetPetName) {
      setSpeech(`已經把給「${targetPetName}」的留言記下來囉！`);
    } else {
      setSpeech('悄悄話已記在留言板裡囉！');
    }
    return null;
  };

  const handleDeleteMessage = async (messageId: string): Promise<void> => {
    if (sharedRoom && cloudUser) {
      const res = await deleteSharedMessage(messageId);
      if (res.error) {
        setMessagesError(res.error);
        return;
      }
      setSharedMessages((prev) => prev.filter((m) => m.id !== messageId));
      return;
    }

    setGame((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== messageId),
    }));
  };

  const handleUpdateHouseGame = (updater: (prev: GameState) => GameState) => {
    setGame((prev) => {
      let next = updater(prev);
      const prevPlacedIds = new Set(prev.house.roomLayout.placedItems.map((p) => p.instanceId));
      const newPlaced = next.house.roomLayout.placedItems.find((p) => !prevPlacedIds.has(p.instanceId));
      const newCollectedId = next.house.collectedFurnitureIds.find(
        (id) => !prev.house.collectedFurnitureIds.includes(id)
      );
      const newThemeId = next.house.completedThemeSets.find(
        (id) => !prev.house.completedThemeSets.includes(id)
      );
      const newPhoto = next.house.photos.find(
        (p) => !prev.house.photos.some((op) => op.id === p.id)
      );
      const treasurySpent = next.house.treasuryCoins < prev.house.treasuryCoins;

      const nextActive = getActivePet(next);

      if (newCollectedId) {
        const buyName = ROOM_ITEM_BY_ID[newCollectedId]?.name ?? '新家具';
        next = recordMemoryEntry(next, {
          uniqueKey: 'room_first_buy',
          petId: nextActive.id,
          type: 'room',
          title: `第一次購買家具：${buyName}`,
          description: `為 ${nextActive.name} 的小屋添購「${buyName}」，空間越來越溫馨！`,
          emoji: '🛋️',
        });
        if (sharedRoom && treasurySpent) {
          next = recordMemoryEntry(next, {
            uniqueKey: 'coop_first_buy_furniture',
            type: 'coop',
            title: `共同購買第一件家具「${buyName}」`,
            description: `使用兩人共同金庫買下「${buyName}」，攜手築起溫暖小屋！`,
            emoji: '🛋️',
            isShared: true,
          });
        }
      }

      const roomSurfaceChanged =
        next.house.roomLayout.wallpaperId !== prev.house.roomLayout.wallpaperId ||
        next.house.roomLayout.flooringId !== prev.house.roomLayout.flooringId;
      if (newPlaced || roomSurfaceChanged) {
        const synced = syncDailyTasks(next.dailyTasks, next.dailyTasksDate);
        next = {
          ...next,
          dailyTasks: incrementTaskProgress(synced.dailyTasks, 'dress_1', 1),
          dailyTasksDate: synced.dailyTasksDate,
        };
      }

      if (newPlaced) {
        const placeName = ROOM_ITEM_BY_ID[newPlaced.itemId]?.name ?? '新家具';
        next = recordMemoryEntry(next, {
          uniqueKey: 'room_first_place',
          petId: nextActive.id,
          type: 'room',
          title: `第一次放置家具：${placeName}`,
          description: `把「${placeName}」擺進寵物房間裡，${nextActive.name}開心地逛起新角落！`,
          emoji: '🏡',
        });
        next = recordMonthlyActivity(next, { interactionLabel: '佈置房間' });
      }

      if (newThemeId) {
        next = recordMemoryEntry(next, {
          uniqueKey: `room_theme_${newThemeId}`,
          type: 'room',
          title: '完成主題房間套裝佈置！',
          description: `在小屋湊齊同一主題系列的所有家具，房間煥然一新！`,
          emoji: '✨',
        });
      }

      if (newPhoto) {
        next = recordMemoryEntry(next, {
          uniqueKey: `photo_${newPhoto.id}`,
          petId: nextActive.id,
          type: 'room',
          title: `拍下「${newPhoto.title}」`,
          description: `在房間留下的溫馨合照（當時體重 ${nextActive.weight.toFixed(1)} kg）`,
          emoji: '📸',
          photoId: newPhoto.id,
          weight: nextActive.weight,
          level: nextActive.level,
        });
        next = maybeGrantCatPhotoMemoryCard(next).nextState;
      }

      const changedItemId = newPlaced?.itemId ?? newCollectedId ?? null;
      if (!changedItemId) {
        return next;
      }
      const itemName = ROOM_ITEM_BY_ID[changedItemId]?.name ?? '新家具';
      return {
        ...next,
        dialogue: appendMemoryEvent(next.dialogue, {
          type: 'newRoomItem',
          detail: itemName,
          itemId: changedItemId,
          actorId: currentUserId,
          actorName,
          isCoopHighlight: Boolean(sharedRoom),
        }),
      };
    });
  };

  const handleRespondDialogue = (responseId: string) => {
    const res = respondToActiveDialogue(gameRef.current, responseId);
    if (!res.response) return;
    soundFX.heart(game.soundEnabled);
    setTemporaryAction(res.response.petAction, 1500, res.response.expression);
    setSpeech(res.response.replyText);
    pushFeedback(
      `心情 +${res.response.moodGain} · 親密 +${res.response.intimacyGain}`,
      '💬'
    );
    setGame(res.nextState);
  };

  const handleDismissDialogue = () => {
    setGame((prev) => ({
      ...prev,
      dialogue: dismissActiveDialogue(prev.dialogue),
    }));
  };

  const handleUpdateDialogueSettings = (patch: Partial<DialogueSettings>) => {
    soundFX.pop(game.soundEnabled);
    setGame((prev) => ({
      ...prev,
      dialogue: updateDialogueSettings(prev.dialogue, patch),
    }));
  };

  const handleStartCoopRoomSession = (themeId?: ThemeSetId) => {
    const res = startRoomDecorSession(gameRef.current, themeId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '🏡');
        setSpeech(res.notice);
      }
    }
  };

  const handleSelectCoopFurniture = (itemId: string) => {
    const res = selectCoopFurnitureForQueue(
      gameRef.current,
      itemId,
      currentUserId,
      actorName
    );
    if (res.ok) {
      soundFX.pop(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) pushFeedback(res.notice, '🪑');
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, error: res.error, notice: res.notice };
  };

  const handlePlaceCoopCandidate = (queueId: string, x: number, y: number) => {
    const prevCount = gameRef.current.house.roomLayout.placedItems.length;
    const res = placeCoopCandidateInRoom(
      gameRef.current,
      queueId,
      x,
      y,
      currentUserId,
      actorName
    );
    if (res.ok) {
      soundFX.heart(game.soundEnabled);
      let nextState = res.nextState;
      if (nextState.house.roomLayout.placedItems.length > prevCount) {
        const added =
          nextState.house.roomLayout.placedItems[
            nextState.house.roomLayout.placedItems.length - 1
          ];
        const itemName = added
          ? ROOM_ITEM_BY_ID[added.itemId]?.name ?? '新家具'
          : '新家具';
        nextState = {
          ...nextState,
          dialogue: appendMemoryEvent(nextState.dialogue, {
            type: 'newRoomItem',
            detail: itemName,
            itemId: added?.itemId,
            actorId: currentUserId,
            actorName,
            isCoopHighlight: Boolean(sharedRoom),
          }),
        };
      }
      setGame(nextState);
      if (res.notice) pushFeedback(res.notice, '✨');
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, error: res.error, notice: res.notice };
  };

  const handleSettleCoopRoomSession = () => {
    const res = settleRoomDecorSession(gameRef.current);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      let next = recordMonthlyActivity(res.nextState, {
        coopTaskDelta: 1,
        interactionLabel: '合作佈置',
      });
      next = recordMemoryEntry(next, {
        uniqueKey: 'cooperation_room_decor',
        type: 'cooperation',
        title: '完成「一起布置房間」合作挑戰！',
        description: `兩人並肩合作擺放家具，打造充滿默契的夢幻空間！`,
        emoji: '🤝',
        isShared: true,
      });
      setGame(next);
      if (res.notice) {
        pushFeedback('佈置挑戰結算！', '🎁');
        setSpeech(res.notice);
      }
    }
    return { ok: res.ok, error: res.error, notice: res.notice };
  };

  const handlePlantCoopCrop = (plotId: number, ingredientId: IngredientId) => {
    const res = plantCoopCrop(
      gameRef.current,
      plotId,
      ingredientId,
      currentUserId,
      actorName
    );
    if (res.ok) {
      soundFX.pop(game.soundEnabled);
      setGame(res.nextState);
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, error: res.error, notice: res.notice };
  };

  const handleHarvestCoopCrop = (plotId: number) => {
    const targetPlot = gameRef.current.coop.coopFarmPlots.find((p) => p.id === plotId);
    const res = harvestCoopCropToWarehouse(
      gameRef.current,
      plotId,
      currentUserId,
      actorName
    );
    if (res.ok) {
      soundFX.heart(game.soundEnabled);
      let nextState = res.nextState;
      if (targetPlot?.cropId === 'strawberry') {
        const evtRes = applyEventOnHarvestStrawberry(nextState, {
          actorUserId: currentUserId,
          actorName,
          hasSharedRoom: Boolean(sharedRoom),
          harvestedPlotsCount: 1,
        });
        nextState = evtRes.nextState;
        if (evtRes.ticketsEarned > 0) {
          pushFeedback(`草莓季 +${evtRes.ticketsEarned} 草莓券`, '🍓');
        }
      }
      setGame(nextState);
      if (res.notice) pushFeedback(res.notice, '🧺');
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, error: res.error, notice: res.notice };
  };

  const handleDepositCoopIngredient = (ingredientId: IngredientId) => {
    const res = depositIngredientToCoopWarehouse(
      gameRef.current,
      ingredientId,
      currentUserId,
      actorName
    );
    if (res.ok) {
      soundFX.pop(game.soundEnabled);
      setGame(res.nextState);
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, error: res.error, notice: res.notice };
  };

  const handleCookCoopRecipe = (recipe: KitchenRecipe) => {
    const prevOrderDone = gameRef.current.coop.dailyFarmOrder.completed;
    const res = cookCoopOrderRecipe(
      gameRef.current,
      recipe,
      currentUserId,
      actorName
    );
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      const synced = syncDailyTasks(res.nextState.dailyTasks, res.nextState.dailyTasksDate);
      let next: GameState = syncEncyclopediaRewards({
        ...res.nextState,
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'cook_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
      }).nextState;
      next = recordMonthlyActivity(next, {
        coopTaskDelta: 1,
        interactionLabel: '農場接力',
      });
      next = recordMemoryEntry(next, {
        uniqueKey: 'farm_coop_order_first',
        type: 'farm',
        title: `完成農場訂單：${recipe.name}`,
        description: `協力把農場新鮮作物端上料理台，順利完成合作訂單！`,
        emoji: recipe.emoji,
      });
      if (next.coop.dailyFarmOrder.completed && !prevOrderDone) {
        next = recordMemoryEntry(next, {
          uniqueKey: 'cooperation_farm_relay',
          type: 'cooperation',
          title: '完成「農場訂單接力」合作任務！',
          description: `兩人接力種植、收成並端出每日特餐，默契滿分！`,
          emoji: '🌾',
          isShared: true,
        });
      }
      if (isStrawberryRecipe(recipe)) {
        const evtRes = applyEventOnCookStrawberry(next, {
          recipe,
          actorUserId: currentUserId,
          actorName,
          hasSharedRoom: Boolean(sharedRoom),
        });
        next = evtRes.nextState;
        if (evtRes.ticketsEarned > 0) {
          pushFeedback(`草莓料理 +${evtRes.ticketsEarned} 草莓券`, '🍓');
        }
      }
      setGame(next);
      if (res.notice) {
        pushFeedback(`完成「${recipe.name}」`, recipe.emoji);
        setSpeech(res.notice);
      }
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, error: res.error, notice: res.notice };
  };

  const handleClaimCoopReward = (rewardId: string) => {
    const res = claimCoopReward(gameRef.current, rewardId, currentUserId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback('領取合作獎勵！', '🎁');
        setSpeech(res.notice);
      }
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, error: res.error, notice: res.notice };
  };

  const handleAcknowledgeOfflineEvents = () => {
    setGame((prev) => acknowledgeOfflinePartnerEvents(prev, currentUserId));
  };

  const handleShareCoopCardToBoard = async (
    title: string,
    body: string
  ): Promise<string | null> => {
    return handleSendMessage(`💌 ${title}：${body}`, 'heart');
  };

  const handleOpenVisitorModal = () => {
    setGame((prev) => dismissVisitorArrivalNotice(prev));
    setVisitorModalOpen(true);
  };

  const handleFeedVisitor = (offering: VisitorOffering) => {
    const res = feedVisitor(gameRef.current, offering, actorName);
    if (res.ok) {
      soundFX.heart(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '🎁');
        setSpeech(res.notice);
      }
    } else {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
    }
  };

  const handleBuyVisitorTreat = (treatId: VisitorTreatId) => {
    const res = buyVisitorTreat(gameRef.current, treatId, 1);
    if (res.ok) {
      soundFX.pop(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) pushFeedback(res.notice, '🍪');
    } else {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
    }
  };

  const handleCaptureVisitorPhoto = (visitorId: VisitorId, shareToBoard = false) => {
    const isCoopPhoto = shareToBoard && Boolean(sharedRoom);
    const res = captureVisitorPhoto(gameRef.current, {
      visitorId,
      isCoopPhoto,
    });
    if (!res.ok) return;
    soundFX.heart(game.soundEnabled);
    const capturedPhoto = res.photo ?? res.nextState.house.photos[0];
    let finalState = res.nextState;
    if (shareToBoard && finalState.coop.coopVisitor?.visitorId === visitorId) {
      finalState = markCoopVisitorPhotoShared(finalState);
    }
    const orderRes = capturedPhoto
      ? advancePhotoTownOrders(finalState, capturedPhoto)
      : { nextState: finalState, newlyCompletedOrderTitles: [] };
    finalState = orderRes.nextState;
    setGame(finalState);
    if (res.notice) pushFeedback(res.notice, '📸');
    for (const orderTitle of orderRes.newlyCompletedOrderTitles) {
      pushFeedback(`完成攝影訂單「${orderTitle}」！可領取攝影材料囉`, '📋');
    }
    if (shareToBoard && capturedPhoto) {
      void handleSharePhotoToBoard(capturedPhoto, capturedPhoto.caption);
    }
  };

  const handleUseFarmSpeedTicket = (plotId: number) => {
    const res = useFarmSpeedTicket(gameRef.current, plotId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '⚡');
        setSpeech(res.notice);
      }
    } else {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
    }
  };

  const handleDeliverTownOrderItem = (orderId: string, itemKey: string) => {
    const res = deliverTownOrderItem(gameRef.current, orderId, itemKey);
    if (res.ok) {
      soundFX.pop(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) pushFeedback(res.notice, '📦');
    } else {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
    }
  };

  const handleClaimTownOrderReward = (orderId: string) => {
    const res = claimTownOrderReward(gameRef.current, orderId, currentUserId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '🎁');
        setSpeech(res.notice);
      }
    } else {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
    }
  };

  const handleCraftShardFurniture = (itemId: string) => {
    const res = craftShardFurniture(gameRef.current, itemId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '🧩');
        setSpeech(res.notice);
      }
    } else {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
    }
  };

  const handleContributeCoopVisitor = (itemKey: string) => {
    const res = contributeCoopVisitorItem(
      gameRef.current,
      currentUserId,
      actorName,
      itemKey
    );
    if (res.ok) {
      soundFX.heart(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '🐾');
        setSpeech(res.notice);
      }
    } else {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
    }
    return { ok: res.ok, error: res.error, notice: res.notice };
  };

  const handleClaimCoopVisitorReward = () => {
    const res = claimCoopVisitorReward(gameRef.current, currentUserId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '🎁');
        setSpeech(res.notice);
      }
    } else {
      soundFX.miss(game.soundEnabled);
      if (res.error) pushFeedback(res.error, '⚠️');
    }
    return { ok: res.ok, error: res.error, notice: res.notice };
  };

  const handleConfirmReset = () => {
    clearAnimationTimers();
    if (sharedRoom) {
      const leavingRoomId = sharedRoom.id;
      lastSharedUpdatedAtRef.current = null;
      setSharedRoom(null);
      setSharedMessages([]);
      void leaveSharedPetRoom(leavingRoomId);
    }
    const fresh = resetGameState();
    const freshActive = getActivePet(fresh);
    prevActivePetIdRef.current = freshActive.id;
    prevStageLevelRef.current = getGrowthStage(freshActive.growth, freshActive.species).level;
    prevPrestigeStarsRef.current = getPrestigeStarInfo(freshActive.growth).stars;
    prevMilestonesCountRef.current = fresh.encyclopedia.claimedAccessoryMilestones.length;
    prevRecipeMilestonesCountRef.current = (fresh.encyclopedia.claimedRecipeMilestones ?? []).length;
    prevTitlesCountRef.current = fresh.encyclopedia.unlockedTitles.length;
    lastAnnouncedVisitIdRef.current = null;
    setGame(fresh);
    setActiveTab('home');
    setQuestsInitialSection('daily');
    setActionState('idle');
    setFlyingFoodEmoji(null);
    setFeedEffect('none');
    setFeedParticles([]);
    setSpeech('今天也想吃好吃的！');
    setFeedbacks([]);
    setUnreadMessagesCount(0);
    setLevelUpStage(null);
    setLevelUpPrestigeStar(null);
    setLevelUpRewardText(null);
    setGrowthRoadmapOpen(false);
    setVisitorModalOpen(false);
    setTownOrderModalOpen(false);
    setTownMapOpen(false);
    setTownMapFocusLocationId(null);
    setEventModalOpen(false);
    setResetModalOpen(false);
  };

  const handleSharePhotoToBoard = async (
    photo: RoomPhotoRecord,
    caption: string
  ): Promise<string | null> => {
    const cleanCaption = caption.trim() || photo.title;
    return handleSendMessage(`${cleanCaption} [photo:${photo.id}]`, null);
  };

  const handleOpenScenePhoto = (
    scene: PhotoScene = 'wardrobe',
    tab: 'shoot' | 'shop' | 'challenge' | 'duo' | 'catalog' = 'shoot',
    visitorId: VisitorId | null = null,
    townLocationId: ActiveTownLocationId | null = null,
    townVisitorId: TownVisitorId | null = null
  ) => {
    setWardrobePhotoScene(scene);
    setWardrobePhotoTab(tab);
    setWardrobePhotoVisitorId(visitorId);
    setWardrobePhotoTownLocationId(townLocationId);
    setWardrobePhotoTownVisitorId(townVisitorId);
    setWardrobePhotoOpen(true);
  };

  const handleOpenShareCard = (payload: ShareCardPayload) => {
    setShareCardPayload({
      ...payload,
      activeTitleId: payload.activeTitleId ?? game.encyclopedia.activeTitle ?? null,
    });
  };

  const handleOpenCollection = (categoryId?: CollectionCategoryId) => {
    setJournalInitialSection('encyclopedia');
    setJournalEncyclopediaSection(categoryId ?? 'pets');
    setActiveTab('journal');
  };

  const handleToggleCollectionReminder = () => {
    setGame((prev) =>
      setCollectionReminderEnabled(
        prev,
        prev.encyclopedia.collectionReminderEnabled === false
      )
    );
  };

  const handleDismissCollectionReminder = () => {
    setGame((prev) => dismissDailyCollectionReminder(prev));
  };

  const handleCollectionJump = (
    target: CollectionJumpTarget,
    item: CollectionItem
  ) => {
    if (target === 'pets') {
      setActiveTab('pets');
    } else if (target === 'canteen') {
      setCanteenInitialSection(
        item.previewKind === 'crop'
          ? 'farm'
          : item.filters.includes('craftable') && !item.price
          ? 'kitchen'
          : 'shop'
      );
      setActiveTab('canteen');
    } else if (target === 'wardrobe') {
      setActiveTab('wardrobe');
    } else if (target === 'house') {
      setHouseInitialTab(item.categoryId === 'farm' ? 'yard' : 'room');
      setActiveTab('house');
    } else if (target === 'town') {
      handleOpenTownMap('map');
    } else if (target === 'studio') {
      handleOpenScenePhoto(
        'wardrobe',
        item.filters.includes('craftable') ? 'catalog' : 'shoot'
      );
    } else if (target === 'memories') {
      setJournalInitialSection('memories');
      setActiveTab('journal');
    } else if (target === 'events') {
      setEventModalOpen(true);
    } else {
      setActiveTab('home');
    }
  };

  const handleOpenVisitorStudio = (visitorId?: VisitorId) => {
    const targetId =
      visitorId ?? gameRef.current.visitorState?.activeVisit?.visitorId ?? 'bird';
    setVisitorModalOpen(false);
    setTownOrderModalOpen(false);
    handleOpenScenePhoto('visitor', 'shoot', targetId);
  };

  const handleOpenTownMap = (
    tab: TownMapTab = 'map',
    locationId: ActiveTownLocationId | null = null
  ) => {
    setGame((prev) =>
      syncCoopTownExploration(syncTownMapState(prev), Boolean(sharedRoom))
    );
    setTownMapInitialTab(tab);
    setTownMapFocusLocationId(locationId);
    setTownMapOpen(true);
  };

  const handleOpenTownLocationStudio = (
    locationId: ActiveTownLocationId,
    visitorId?: TownVisitorId | null
  ) => {
    setTownMapOpen(false);
    handleOpenScenePhoto('town', 'shoot', null, locationId, visitorId ?? null);
  };

  const handleTownEnterLocation = (locationId: ActiveTownLocationId) => {
    const res = enterTownLocation(gameRef.current, locationId);
    setGame(res.nextState);
    if (res.ok && res.notice) {
      soundFX.heart(game.soundEnabled);
      pushFeedback(res.notice, '🗺️');
    }
    return res;
  };

  const handleTownSpawnVisitor = (locationId: ActiveTownLocationId) => {
    const res = spawnTownLocationVisitor(gameRef.current, locationId);
    if (res.ok) {
      soundFX.heart(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) pushFeedback(res.notice, '🐾');
    }
    return res;
  };

  const handleTownFeedVisitor = (
    locationId: ActiveTownLocationId,
    visitId: string,
    offerings: VisitorOffering[]
  ) => {
    const visit = gameRef.current.townMap?.locations[locationId]?.activeVisitors.find(
      (v) => v.visitId === visitId
    );
    const res = feedTownVisitor(gameRef.current, locationId, visitId, offerings);
    if (!res.ok) return res;
    let nextState = res.nextState;
    if (locationId === 'lake_park' && visit?.visitorId === 'duck') {
      const coopRes = advanceCoopTownExploreStep(
        nextState,
        'duck_care',
        currentUserId,
        actorName,
        1
      );
      nextState = coopRes.nextState;
      if (coopRes.notice) pushFeedback(coopRes.notice, '💞');
    }
    soundFX.heart(game.soundEnabled);
    setGame(nextState);
    if (res.notice) pushFeedback(res.notice, '🍪');
    return { ...res, nextState };
  };

  const handleTownForageAcorn = () => {
    const res = forageForestAcorn(gameRef.current);
    if (!res.ok) return res;
    const coopRes = advanceCoopTownExploreStep(
      res.nextState,
      'acorn',
      currentUserId,
      actorName,
      1
    );
    soundFX.pop(game.soundEnabled);
    setGame(coopRes.nextState);
    if (res.notice) pushFeedback(res.notice, '🌰');
    if (coopRes.notice) pushFeedback(coopRes.notice, '💞');
    return { ...res, nextState: coopRes.nextState };
  };

  const handleTownSettleFishing = (caughtCount: number) => {
    const res = settleLakeFishingMinigame(gameRef.current, caughtCount);
    if (!res.ok) return res;
    const coopRes = advanceCoopTownExploreStep(
      res.nextState,
      'fishing',
      currentUserId,
      actorName,
      1
    );
    soundFX.levelUp(game.soundEnabled);
    setGame(coopRes.nextState);
    if (res.notice) pushFeedback(res.notice, '🎣');
    if (coopRes.notice) pushFeedback(coopRes.notice, '💞');
    return { ...res, nextState: coopRes.nextState };
  };

  const handleTownDeliverMarketDish = (foodId: string) => {
    const res = deliverMarketDish(gameRef.current, foodId);
    if (!res.ok) return res;
    soundFX.pop(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) pushFeedback(res.notice, '🍱');
    return res;
  };

  const handleTownBuyMarketFurniture = (itemId: string) => {
    const res = buyMarketFurniture(gameRef.current, itemId);
    if (!res.ok) return res;
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) pushFeedback(res.notice, '🪑');
    return res;
  };

  const handleTownClaimLocationQuest = (
    locationId: ActiveTownLocationId,
    questId: string
  ) => {
    const res = claimLocationQuestReward(gameRef.current, locationId, questId);
    if (!res.ok) return res;
    soundFX.pop(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) pushFeedback(res.notice, '🎫');
    return res;
  };

  const handleTownClaimAllQuestsBonus = (locationId: ActiveTownLocationId) => {
    const res = claimLocationAllQuestsBonus(gameRef.current, locationId);
    if (!res.ok) return res;
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) pushFeedback(res.notice, '🎉');
    return res;
  };

  const handleTownUpgradeHut = () => {
    const res = upgradeVisitorHut(gameRef.current);
    if (!res.ok) return res;
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) pushFeedback(res.notice, '🏡');
    return res;
  };

  const handleTownBuyFacility = (facilityId: VisitorHutFacilityId) => {
    const res = buyVisitorHutFacility(gameRef.current, facilityId);
    if (!res.ok) return res;
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) pushFeedback(res.notice, '🛠️');
    return res;
  };

  const handleTownBuyShopItem = (shopItemId: string) => {
    const res = buyTownShopItem(gameRef.current, shopItemId);
    if (!res.ok) return res;
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) pushFeedback(res.notice, '🛍️');
    return res;
  };

  const handleTownClaimCoopReward = () => {
    const res = claimCoopTownReward(gameRef.current, currentUserId);
    if (!res.ok) return res;
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) pushFeedback(res.notice, '💞');
    return res;
  };

  const handleClaimTownEncyclopediaReward = (locationId: ActiveTownLocationId) => {
    const res = claimLocationEncyclopediaReward(gameRef.current, locationId);
    if (!res.ok) {
      if (res.error) pushFeedback(res.error, '💡');
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    if (res.notice) pushFeedback(res.notice, '🏆');
  };

  const handleSaveWardrobePhoto = (params: {
    title: string;
    caption: string;
    scene: PhotoScene;
    poseId: PhotoPose;
    backgroundId?: PhotoBackground;
    facing?: PetViewDirection;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
    duoPet?: DuoPhotoPetInfo;
    visitorId?: VisitorId;
    townLocationId?: ActiveTownLocationId;
    townVisitorId?: TownVisitorId;
    isCoopPhoto?: boolean;
  }): RoomPhotoRecord => {
    soundFX.heart(game.soundEnabled);
    const { nextState, photo } = saveScenePhoto(gameRef.current, params);
    const evtRes = applyEventOnStrawberryPhoto(nextState, {
      photo,
      actorUserId: currentUserId,
      actorName,
      hasSharedRoom: Boolean(sharedRoom),
    });
    const orderRes = advancePhotoTownOrders(evtRes.nextState, photo);
    let finalState = orderRes.nextState;
    if (params.scene === 'town' && params.townLocationId) {
      const townPhotoRes = recordTownLocationPhoto(
        finalState,
        photo,
        params.townLocationId,
        params.townVisitorId
      );
      finalState = townPhotoRes.nextState;
      if (townPhotoRes.notice) {
        pushFeedback(townPhotoRes.notice, '🗺️');
      }
      if (params.townVisitorId) {
        const activeVisit = finalState.townMap?.locations[
          params.townLocationId
        ]?.activeVisitors.find((v) => v.visitorId === params.townVisitorId);
        if (activeVisit) {
          const capRes = captureTownVisitorPhoto(
            finalState,
            params.townLocationId,
            activeVisit.visitId
          );
          finalState = capRes.nextState;
        }
      }
      if (params.townLocationId === 'acorn_forest') {
        const coopRes = advanceCoopTownExploreStep(
          finalState,
          'forest_photo',
          currentUserId,
          actorName,
          1
        );
        finalState = coopRes.nextState;
        if (coopRes.notice) pushFeedback(coopRes.notice, '💞');
      } else if (
        params.townLocationId === 'lake_park' &&
        params.townVisitorId === 'duck'
      ) {
        const coopRes = advanceCoopTownExploreStep(
          finalState,
          'duck_care',
          currentUserId,
          actorName,
          1
        );
        finalState = coopRes.nextState;
        if (coopRes.notice) pushFeedback(coopRes.notice, '💞');
      }
    }
    finalState = advanceWeatherTaskProgress(finalState, 'snow_photo', 1);
    finalState = advanceSakuraEventTask(finalState, 'take_photo', 1);
    finalState = advanceSakuraCoopStep(finalState, 'photo', currentUserId);
    const snowBonus = unlockWinterSnowPhotoBonus(finalState);
    finalState = snowBonus.nextState;
    const bdayPhotoRes = applyBirthdayOnPhotoTaken(finalState, {
      photoId: photo.id,
      scene: params.scene,
      poseId: params.poseId,
      backgroundId: params.backgroundId,
      filterId: params.filterId,
      frameId: params.frameId,
      stickers: params.stickers,
      petId: activePet.id,
      petName: activePet.name,
    });
    finalState = bdayPhotoRes.nextState;
    setGame(finalState);
    pushFeedback(
      params.duoPet
        ? '已儲存雙人合照到照片牆！'
        : params.visitorId
        ? `已將與${VISITOR_BY_ID[params.visitorId].speciesLabel}的合影存入照片牆！`
        : params.townLocationId
        ? '已儲存小鎮地點寫真到照片牆！'
        : params.scene === 'birthday'
        ? '已儲存生日派對寫真到照片牆！'
        : '已儲存寫真到照片牆！',
      params.scene === 'birthday' ? '🎂' : '📸'
    );
    if (bdayPhotoRes.birthdayNotice) {
      pushFeedback(bdayPhotoRes.birthdayNotice, '🎂');
    }
    for (const label of snowBonus.newlyUnlockedLabels) {
      pushFeedback(`❄️ 下雪限定解鎖「${label}」！`, '❄️');
    }
    if (evtRes.ticketsEarned > 0) {
      pushFeedback(`草莓主題寫真 +${evtRes.ticketsEarned} 草莓券`, '🍓');
    }
    for (const orderTitle of orderRes.newlyCompletedOrderTitles) {
      pushFeedback(`完成攝影訂單「${orderTitle}」！可領取攝影材料囉`, '📋');
    }
    return photo;
  };

  const handleStabilizeWindblownPlot = (plotId: number) => {
    const res = stabilizeWindblownPlot(gameRef.current, plotId);
    if (res.ok) {
      soundFX.heart(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '🍃');
        setSpeech(res.notice);
      }
    } else if (res.error) {
      pushFeedback(res.error, '⚠️');
    }
  };

  const handleSelectWeatherCity = (cityId: string) => {
    soundFX.pop(game.soundEnabled);
    setGame((prev) => selectWeatherCity(prev, cityId));
    void applyWeatherRefresh({ cityId, force: false });
  };

  const handleRefreshWeather = () => {
    soundFX.pop(game.soundEnabled);
    void applyWeatherRefresh({ force: true });
  };

  const handleClaimWeatherTask = (taskId: string) => {
    const res = claimWeatherTask(gameRef.current, taskId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '🌤️');
        setSpeech(res.notice);
      }
    } else if (res.error) {
      soundFX.miss(game.soundEnabled);
      pushFeedback(res.error, '⚠️');
    }
    return res;
  };

  const handleSwitchSeasonRoomTheme = (themeId: SeasonRoomThemeId) => {
    soundFX.pop(game.soundEnabled);
    setGame((prev) => switchSeasonRoomTheme(prev, themeId));
    pushFeedback(themeId === 'none' ? '已恢復原本房間風格' : '已切換季節房間主題！', '🏠');
  };

  const handleSwitchSeasonYardTheme = (themeId: SeasonYardThemeId) => {
    soundFX.pop(game.soundEnabled);
    setGame((prev) => switchSeasonYardTheme(prev, themeId));
    pushFeedback(themeId === 'none' ? '已恢復原本庭院風格' : '已切換季節庭院主題！', '🌿');
  };

  const handleDismissSeasonNotice = () => {
    soundFX.heart(game.soundEnabled);
    setGame((prev) => dismissSeasonNotice(prev));
    const meta = SEASON_META[gameRef.current.seasonSystem?.currentSeason ?? getSeasonFromDate()];
    pushFeedback(`已收藏「${meta.name}」季節回憶卡！`, meta.emoji);
  };

  const handleDismissOfflineSummary = () => {
    setGame((prev) => dismissSeasonOfflineSummary(prev));
  };

  const handleClaimSakuraDailyTask = (taskId: string) => {
    const res = claimSakuraEventTask(gameRef.current, taskId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '🌸');
        setSpeech(res.notice);
      }
    } else if (res.error) {
      soundFX.miss(game.soundEnabled);
      pushFeedback(res.error, '⚠️');
    }
    return res;
  };

  const handleBuySakuraShopItem = (shopItemId: string) => {
    const res = buySakuraShopItem(gameRef.current, shopItemId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '🎁');
        setSpeech(res.notice);
      }
    } else if (res.error) {
      soundFX.miss(game.soundEnabled);
      pushFeedback(res.error, '⚠️');
    }
    return res;
  };

  const handleClaimSakuraCoopReward = () => {
    const res = claimSakuraCoopReward(gameRef.current, currentUserId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      if (res.notice) {
        pushFeedback(res.notice, '💞');
        setSpeech(res.notice);
      }
    } else if (res.error) {
      soundFX.miss(game.soundEnabled);
      pushFeedback(res.error, '⚠️');
    }
    return res;
  };

  const handleBuyStudioPose = (poseId: PhotoPose) => {
    const res = buyStudioPose(gameRef.current, poseId);
    if (!res.ok) {
      pushFeedback(res.notice, '💡');
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    pushFeedback(res.notice, '✨');
    setSpeech(`學會新拍照姿勢「${PHOTO_POSE_BY_ID[poseId]?.label ?? poseId}」囉！`);
  };

  const handleBuyStudioBackground = (bgId: PhotoBackground) => {
    const res = buyStudioBackground(gameRef.current, bgId);
    if (!res.ok) {
      pushFeedback(res.notice, '💡');
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    pushFeedback(res.notice, '🏞️');
  };

  const handleBuyStudioFilter = (filterId: PhotoFilter) => {
    const res = buyStudioFilter(gameRef.current, filterId);
    if (!res.ok) {
      pushFeedback(res.notice, '💡');
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    pushFeedback(res.notice, '🎨');
  };

  const handleBuyStudioFrame = (frameId: PhotoFrame) => {
    const res = buyStudioFrame(gameRef.current, frameId);
    if (!res.ok) {
      pushFeedback(res.notice, '💡');
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    pushFeedback(res.notice, '🖼️');
  };

  const handleBuyStudioSticker = (stickerId: PhotoStickerId) => {
    const res = buyStudioSticker(gameRef.current, stickerId);
    if (!res.ok) {
      pushFeedback(res.notice, '💡');
      return;
    }
    soundFX.heart(game.soundEnabled);
    setGame(res.nextState);
    pushFeedback(res.notice, '🩷');
  };

  const handleCraftStudioRecipe = (recipeId: string) => {
    const res = craftStudioRecipe(gameRef.current, recipeId);
    if (!res.ok) {
      pushFeedback(res.notice, '💡');
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    pushFeedback(res.notice, '🔨');
    setSpeech(res.notice);
  };

  const handleSubmitWeeklyStudioChallenge = (params: {
    title: string;
    caption: string;
    poseId: PhotoPose;
    backgroundId: PhotoBackground;
    facing: PetViewDirection;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }): RoomPhotoRecord | null => {
    const res = submitWeeklyOutfitChallenge(gameRef.current, params);
    soundFX.heart(game.soundEnabled);
    const evtRes = applyEventOnStrawberryPhoto(res.nextState, {
      photo: res.photo,
      actorUserId: currentUserId,
      actorName,
      hasSharedRoom: Boolean(sharedRoom),
    });
    setGame(evtRes.nextState);
    pushFeedback(`週挑戰評分 ${res.breakdown.totalScore} 分！`, '🏆');
    if (evtRes.ticketsEarned > 0) {
      pushFeedback(`草莓主題寫真 +${evtRes.ticketsEarned} 草莓券`, '🍓');
    }
    for (const note of res.unlockedItemsNotice) {
      pushFeedback(note, '🎉');
    }
    setSpeech(`本週穿搭挑戰拿到 ${res.breakdown.totalScore} 分！照片已存入照片牆～`);
    return res.photo;
  };

  const handleClaimWeeklyStudioTier = (tier: 60 | 100 | 150) => {
    const res = claimWeeklyOutfitTier(gameRef.current, tier);
    if (!res.ok) {
      pushFeedback(res.notice, '💡');
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    pushFeedback(res.notice, '🎁');
    setSpeech(res.notice);
  };

  const handleSubmitCoopDuoChallenge = (params: {
    pet: Pet;
    poseId: PhotoPose;
    facing: PetViewDirection;
    title: string;
    backgroundId: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }): RoomPhotoRecord | null => {
    const res = submitCoopDuoChallengeEntry(gameRef.current, {
      userId: currentUserId,
      userName: actorName,
      ...params,
    });
    soundFX.heart(game.soundEnabled);
    let nextState = res.nextState;
    if (res.mergedPhoto) {
      const evtRes = applyEventOnStrawberryPhoto(nextState, {
        photo: res.mergedPhoto,
        actorUserId: currentUserId,
        actorName,
        hasSharedRoom: Boolean(sharedRoom),
      });
      nextState = evtRes.nextState;
      if (evtRes.ticketsEarned > 0) {
        pushFeedback(`草莓主題合照 +${evtRes.ticketsEarned} 草莓券`, '🍓');
      }
    }
    setGame(nextState);
    pushFeedback(res.notice, res.mergedPhoto ? '👯' : '💌');
    setSpeech(res.notice);
    return res.mergedPhoto;
  };

  const handleClaimCoopDuoChallengeReward = () => {
    const res = claimCoopDuoChallengeReward(gameRef.current, currentUserId);
    if (!res.ok) {
      pushFeedback(res.notice, '💡');
      return;
    }
    soundFX.levelUp(game.soundEnabled);
    setGame(res.nextState);
    pushFeedback(res.notice, '🎁');
    setSpeech('領取共養雙人合照挑戰獎勵！我們是最棒的穿搭搭檔！');
  };

  const handleClaimEventDailyTask = (taskId: string) => {
    const res = claimEventDailyTask(gameRef.current, taskId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      pushFeedback(res.notice, '🍓');
      setSpeech(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, notice: res.notice };
  };

  const handleClaimEventMilestone = (milestoneId: EventMilestoneId) => {
    const res = claimEventMilestone(gameRef.current, milestoneId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      pushFeedback(res.notice, '🏆');
      setSpeech(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, notice: res.notice };
  };

  const handleBuyEventShopItem = (shopItemId: string) => {
    const res = buyEventShopItem(gameRef.current, shopItemId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      pushFeedback(res.notice, '🛍️');
      setSpeech(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, notice: res.notice };
  };

  const handleSubmitEventPhotoChallenge = (params: {
    title: string;
    caption: string;
    poseId: PhotoPose;
    backgroundId: PhotoBackground;
    facing: PetViewDirection;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }) => {
    const res = submitEventPhotoChallenge(gameRef.current, {
      ...params,
      actorUserId: currentUserId,
      actorName,
      hasSharedRoom: Boolean(sharedRoom),
    });
    soundFX.heart(game.soundEnabled);
    setGame(res.nextState);
    pushFeedback(`草莓寫真挑戰 ${res.breakdown.totalScore} 分！`, '🍓');
    for (const n of res.unlockedNotices) {
      pushFeedback(n, '🎉');
    }
    setSpeech(`參加草莓季攝影挑戰獲得 ${res.breakdown.totalScore} 分，同時收錄到照片牆囉！`);
    return {
      photo: res.photo,
      breakdown: res.breakdown,
      unlockedNotices: res.unlockedNotices,
    };
  };

  const handleClaimEventChallengeTier = (tier: 60 | 100 | 150) => {
    const res = claimEventChallengeTier(gameRef.current, tier);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      pushFeedback(res.notice, '🎁');
      setSpeech(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, notice: res.notice };
  };

  const handleClaimCoopEventReward = () => {
    const res = claimCoopEventSessionReward(gameRef.current, currentUserId);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      pushFeedback(res.notice, '💞');
      setSpeech(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, notice: res.notice };
  };

  const handleCreateStrawberryPicnicPhoto = (partnerPet: DuoPhotoPetInfo) => {
    const res = createStrawberryPicnicPhoto(gameRef.current, {
      partnerPet,
      actorUserId: currentUserId,
      actorName,
    });
    if (res.photo) {
      soundFX.heart(game.soundEnabled);
      setGame(res.nextState);
      pushFeedback('製作限定「草莓野餐合照」！', '🧺');
      setSpeech(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { photo: res.photo, notice: res.notice };
  };

  const handleConvertEventTickets = () => {
    const res = convertRemainingEventTickets(gameRef.current);
    if (res.ok) {
      soundFX.levelUp(game.soundEnabled);
      setGame(res.nextState);
      pushFeedback(res.notice, '🪙');
      setSpeech(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
    }
    return { ok: res.ok, notice: res.notice };
  };

  const handleSelectEventRecapCoverPhoto = (photoId: string) => {
    soundFX.pop(game.soundEnabled);
    setGame((prev) => selectEventRecapCoverPhoto(prev, photoId));
  };

  const handleSaveEventRecapToMemories = () => {
    const res = saveEventRecapToMemories(gameRef.current);
    soundFX.heart(game.soundEnabled);
    setGame(res.nextState);
    pushFeedback(res.notice, '📖');
    setSpeech(res.notice);
    return { ok: res.ok, notice: res.notice };
  };

  const handleTogglePhotoLike = (photoId: string) => {
    soundFX.pop(game.soundEnabled);
    setGame((prev) => togglePhotoLike(prev, photoId, currentUserId));
  };

  const handleAddPhotoComment = (photoId: string, content: string) => {
    soundFX.heart(game.soundEnabled);
    setGame(
      (prev) =>
        addPhotoComment(prev, photoId, currentUserId, actorName, content).nextState
    );
  };

  const handleSaveDialogueToMemory = (line: DialogueLine) => {
    const res = saveDialogueToMemories(gameRef.current, line);
    if (res.saved) {
      soundFX.heart(game.soundEnabled);
      setGame(res.nextState);
      pushFeedback('已收藏這句話到回憶冊！', '💬');
    }
  };

  const handleToggleFavoriteMemory = (memoryId: string) => {
    soundFX.pop(game.soundEnabled);
    setGame((prev) => toggleFavoriteMemory(prev, memoryId));
  };

  const handleSaveMonthlyRecap = (recap: MonthlyRecap) => {
    soundFX.heart(game.soundEnabled);
    setGame((prev) => saveOrUpdateMonthlyRecap(prev, recap, true));
    pushFeedback(`已收藏 ${recap.monthKey} 回顧卡！`, '🗓️');
  };

  const handleShareRecapToBoard = async (
    recap: MonthlyRecap
  ): Promise<string | null> => {
    const deltaLabel =
      recap.weightDelta >= 0
        ? `+${recap.weightDelta.toFixed(1)}`
        : recap.weightDelta.toFixed(1);
    const body = `最愛食物：${recap.favoriteFoodName} · 最常互動：${recap.topInteractionLabel} · 體重變化 ${deltaLabel} kg · 成長 +${recap.growthGained}`;
    if (recap.coverPhotoId) {
      return handleSendMessage(
        `🗓️ ${recap.monthKey} 本月回顧卡：${body} [photo:${recap.coverPhotoId}]`,
        null
      );
    }
    return handleSendMessage(`🗓️ ${recap.monthKey} 本月回顧卡：${body}`, 'heart');
  };

  const handleShareMemoryToBoard = async (
    memory: MemoryEntry
  ): Promise<string | null> => {
    if (memory.photoId) {
      return handleSendMessage(
        `${memory.emoji} ${memory.title}：${memory.description} [photo:${memory.photoId}]`,
        null
      );
    }
    return handleSendMessage(
      `${memory.emoji} ${memory.title}：${memory.description}`,
      'heart'
    );
  };

  const handleShareCardPayloadToBoard = async (
    payload: ShareCardPayload
  ): Promise<string | null> => {
    const summary = payload.subtitle ? `：${payload.subtitle}` : '';
    if (payload.photo) {
      return handleSendMessage(
        `${payload.emoji} ${payload.title}${summary} [photo:${payload.photo.id}]`,
        null
      );
    }
    return handleSendMessage(`${payload.emoji} ${payload.title}${summary}`, 'heart');
  };

  // ==================== 生日派對系統 Handlers ====================
  const applyBirthdayActionResult = (
    res: { nextState: GameState; ok: boolean; notice: string; error?: string },
    emoji = '🎂',
    celebrationSound = false
  ) => {
    setBirthdayNotice('');
    setBirthdayError('');
    if (!res.ok) {
      soundFX.miss(game.soundEnabled);
      if (res.error) {
        setBirthdayError(res.error);
        pushFeedback(res.error, '⚠️');
      }
      return false;
    }
    if (celebrationSound) {
      soundFX.levelUp(game.soundEnabled);
    } else {
      soundFX.heart(game.soundEnabled);
    }
    setGame(res.nextState);
    if (res.notice) {
      setBirthdayNotice(res.notice);
      pushFeedback(res.notice, emoji);
      setSpeech(res.notice);
    }
    return true;
  };

  const handleUpdatePetBirthday = (
    petId: string,
    month: number,
    day: number,
    leapChoice: BirthdayLeapChoice
  ) => {
    applyBirthdayActionResult(
      updatePetBirthday(gameRef.current, petId, month, day, leapChoice),
      '📅'
    );
  };

  const handleBuyBirthdayPantryItem = (
    itemId: keyof BirthdayPantryState,
    qty = 1
  ) => {
    applyBirthdayActionResult(
      buyBirthdayPantryItem(gameRef.current, itemId, qty),
      '🧁'
    );
  };

  const handleReserveBirthdayCake = (petId: string, cakeId: BirthdayCakeId) => {
    applyBirthdayActionResult(
      reserveBirthdayCake(gameRef.current, petId, cakeId),
      '🗓️'
    );
  };

  const handleBakeBirthdayCake = (params: {
    cakeTypeId: BirthdayCakeId | 'custom';
    petId: string;
    base: BirthdayCakeBase;
    cream: BirthdayCakeCream;
    decors: BirthdayCakeDecor[];
    plaqueText: string;
    fruitIngredientId?: IngredientId;
  }) => {
    applyBirthdayActionResult(
      bakeBirthdayCake(gameRef.current, params),
      '🍰',
      true
    );
  };

  const handlePlaceBirthdayCake = (
    cakeId: string,
    target: 'room' | 'yard' | null
  ) => {
    applyBirthdayActionResult(
      placeBirthdayCake(gameRef.current, cakeId, target),
      '🎂'
    );
  };

  const handleCelebrateEatBirthdayCake = (cakeId: string, petId: string) => {
    applyBirthdayActionResult(
      celebrateEatBirthdayCake(gameRef.current, cakeId, petId),
      '🎉',
      true
    );
  };

  const handleTapBirthdayCake = (cake: BirthdayCake) => {
    if (!cake.eaten) {
      handleCelebrateEatBirthdayCake(cake.id, cake.petId);
      return;
    }
    setBirthdayModalTab('cakes');
    setBirthdayNotice('');
    setBirthdayError('');
    setBirthdayModalOpen(true);
  };

  const handleBuyBirthdayGift = (giftId: BirthdayGiftId, petId: string) => {
    applyBirthdayActionResult(
      buyBirthdayGift(gameRef.current, giftId, petId),
      '🎁',
      true
    );
  };

  const handleBuyBirthdayTicketShopItem = (itemId: string, petId: string) => {
    applyBirthdayActionResult(
      buyBirthdayTicketShopItem(gameRef.current, itemId, petId),
      '🎫',
      true
    );
  };

  const handleBuyOrToggleBirthdayDecor = (decorId: BirthdayDecorationId) => {
    applyBirthdayActionResult(
      buyBirthdayDecoration(gameRef.current, decorId),
      '🎈'
    );
  };

  const handleAddBirthdayCardBlessing = (params: {
    petId: string;
    text: string;
    stickers: PhotoStickerId[];
  }) => {
    applyBirthdayActionResult(
      addBirthdayCardBlessing(gameRef.current, {
        petId: params.petId,
        userId: currentUserId,
        userName: actorName,
        text: params.text,
        stickers: params.stickers,
      }),
      '💌'
    );
  };

  const handleFinalizeBirthdayCard = (
    petId: string,
    stickers: PhotoStickerId[]
  ) => {
    applyBirthdayActionResult(
      finalizeBirthdayCard(gameRef.current, petId, stickers),
      '💌',
      true
    );
  };

  const handleShareBirthdayCardToBoard = async (cardId: string) => {
    setBirthdayNotice('');
    setBirthdayError('');
    const sys = getBirthdaySystemState(gameRef.current);
    const card = sys.cards.find((c) => c.id === cardId);
    if (!card) {
      setBirthdayError('找不到要分享的生日賀卡喔！');
      return;
    }
    const err = await handleSendMessage(
      `🎂 送上${card.petName}的生日賀卡！ [bdaycard:${card.id}]`,
      'heart'
    );
    if (err) {
      setBirthdayError(err);
      pushFeedback(err, '⚠️');
      return;
    }
    setGame((prev) => markBirthdayCardShared(prev, card.id));
    setBirthdayNotice('賀卡已分享到萌寵留言板！');
    pushFeedback(`已將${card.petName}的生日賀卡分享到留言板！`, '💌');
  };

  const handleClaimBirthdayTask = (taskId: string) => {
    applyBirthdayActionResult(
      claimBirthdayTask(gameRef.current, taskId),
      '🎫',
      true
    );
  };

  const handleClaimBirthdayOrder = (orderId: string) => {
    applyBirthdayActionResult(
      claimBirthdayOrder(gameRef.current, orderId),
      '🎁',
      true
    );
  };

  const handleContributeCoopBirthdayStep = (stepKey: CoopBirthdayTaskKey) => {
    applyBirthdayActionResult(
      contributeCoopBirthdayStep(
        gameRef.current,
        stepKey,
        currentUserId,
        actorName
      ),
      '💞'
    );
  };

  const handleClaimCoopBirthdayReward = () => {
    applyBirthdayActionResult(
      claimCoopBirthdayReward(gameRef.current, currentUserId),
      '🎂',
      true
    );
  };

  const {
    photoContestOpen,
    photoContestTab,
    photoContestDraft,
    currentContestSchedule,
    handleOpenPhotoContest,
    handleClosePhotoContest,
    handleSubmitPhotoContest,
    handleVotePhotoContest,
    handleBuyPhotoContestShopItem,
    handleCoopPhotoOutfit,
    handleCoopPhotoDecor,
    handleSubmitCoopPhotoContest,
    handleClaimCoopPhotoReward,
    handleDismissContestSettlement,
  } = usePhotoContest({
    game,
    gameRef,
    setGame,
    currentUserId,
    actorName,
    pushFeedback,
    setSpeech,
  });

  const primaryBirthdayStatus = getPrimaryBirthdayPetStatus(game);
  const birthdaySystemState = getBirthdaySystemState(game);
  const coopBirthdaySession = getOrCreateCoopBirthdaySession(game);
  const birthdayBadgeCount =
    birthdaySystemState.tasks.filter((t) => t.completed && !t.claimed).length +
    birthdaySystemState.orders.filter((o) => o.completed && !o.claimed).length +
    (coopBirthdaySession.completed &&
    !coopBirthdaySession.claimedByUserIds.includes(currentUserId || 'local')
      ? 1
      : 0);

  useEffect(() => {
    if (!activePet.hatched) return;
    if (!primaryBirthdayStatus.isCountdown && !primaryBirthdayStatus.isTodayBirthday) {
      return;
    }
    const toastKey = `${primaryBirthdayStatus.yearKey}_${primaryBirthdayStatus.daysUntil}`;
    const currentSys = getBirthdaySystemState(gameRef.current);
    if (currentSys.lastCountdownToastKey === toastKey) return;

    setGame((prev) => {
      const prevSys = getBirthdaySystemState(prev);
      if (prevSys.lastCountdownToastKey === toastKey) return prev;
      return {
        ...prev,
        birthdaySystem: {
          ...prevSys,
          lastCountdownToastKey: toastKey,
        },
      };
    });
    pushFeedback(
      primaryBirthdayStatus.countdownText,
      primaryBirthdayStatus.isTodayBirthday ? '🎂' : '🗓️'
    );
    setSpeech(primaryBirthdayStatus.countdownText);
  }, [
    activePet.hatched,
    primaryBirthdayStatus.isCountdown,
    primaryBirthdayStatus.isTodayBirthday,
    primaryBirthdayStatus.yearKey,
    primaryBirthdayStatus.daysUntil,
    primaryBirthdayStatus.countdownText,
  ]);

  const activeMessages = sharedRoom ? sharedMessages : game.messages;
  const latestMessage =
    activeMessages.length > 0 ? activeMessages[activeMessages.length - 1] : null;

  const noviceEval = evaluateAllNoviceDays(game, Boolean(sharedRoom));
  const claimableQuestsCount =
    game.dailyTasks.filter((t) => t.completed && !t.claimed).length +
    (game.familyDailyTasks ?? []).filter((t) => t.completed && !t.claimed).length +
    noviceEval.claimableCount;

  const unclaimedCoopRewardsCount = game.coop.pendingRewards.filter(
    (r) => !r.claimedByUserIds.includes(currentUserId)
  ).length;
  const offlinePartnerEventsCount = getOfflinePartnerEvents(
    game.coop,
    currentUserId
  ).length;
  const coopVisitorClaimable =
    game.coop.coopVisitor &&
    game.coop.coopVisitor.completed &&
    !game.coop.coopVisitor.claimedByUserIds.includes(currentUserId)
      ? 1
      : 0;
  const coopBadgeCount =
    unclaimedCoopRewardsCount + offlinePartnerEventsCount + coopVisitorClaimable;
  const pendingOrderCount = (game.townOrders ?? []).filter(
    (o) => !o.claimedByUserIds.includes(currentUserId)
  ).length;
  const currentWeeklyOutfitTheme = getWeeklyOutfitChallengeTheme();
  const studioCollectionProgress = getStudioCollectionProgress(
    getPhotoStudioState(game)
  );
  const [farmClockNow, setFarmClockNow] = useState<number>(() => Date.now());
  const hasGrowingUnreadyCrops = game.farmPlots.some((p) => {
    if (p.cropId === null) return false;
    const ev = evaluateCropSeasonAndWeather(game, p);
    return !getCropGrowthState(
      p,
      farmClockNow,
      game.yardMoodBuffPeriods ?? [],
      activeAbility.cropGrowthRateMultiplier * ev.rateMultiplier,
      { isPaused: ev.isPaused, minRate: 0.4 }
    ).isReady;
  });

  useEffect(() => {
    if (!hasGrowingUnreadyCrops) return;
    setFarmClockNow(Date.now());
    const timer = window.setInterval(() => {
      setFarmClockNow(Date.now());
    }, 2000);
    return () => window.clearInterval(timer);
  }, [hasGrowingUnreadyCrops]);

  useEffect(() => {
    if (!activePet.hatched || !hasGrowingUnreadyCrops) return;
    const checkCropNotifications = () => {
      const nowTs = Date.now();
      const buffs = gameRef.current.yardMoodBuffPeriods ?? [];
      const growthMult = getActivePetAbilityBonus(gameRef.current).cropGrowthRateMultiplier;
      for (const plot of gameRef.current.farmPlots) {
        if (!plot.cropId || plot.plantedAt === null) continue;
        const ev = evaluateCropSeasonAndWeather(gameRef.current, plot);
        const growth = getCropGrowthState(
          plot,
          nowTs,
          buffs,
          growthMult * ev.rateMultiplier,
          { isPaused: ev.isPaused, minRate: 0.4 }
        );
        if (!growth.isReady) continue;
        const notifyKey = `${plot.id}:${plot.plantedAt}`;
        if (notifiedReadyPlotsRef.current.has(notifyKey)) continue;
        notifiedReadyPlotsRef.current.add(notifyKey);
        const cropInfo = INGREDIENTS[plot.cropId];
        pushFeedback(`${cropInfo.name}成熟可以採收囉！`, cropInfo.emoji);
        if (
          cropNotifyEnabled &&
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          try {
            new Notification('🌱 萌寵農場收成囉！', {
              body: `田地 #${plot.id + 1} 的${cropInfo.name}已經成熟，快來採收吧！`,
            });
          } catch {
            // Ignore browser Notification runtime restrictions
          }
        }
      }
    };
    const timer = window.setInterval(checkCropNotifications, 15000);
    return () => window.clearInterval(timer);
  }, [activePet.hatched, hasGrowingUnreadyCrops, cropNotifyEnabled]);

  const readyCropsCount = game.farmPlots.filter((p) => {
    if (p.cropId === null) return false;
    const ev = evaluateCropSeasonAndWeather(game, p);
    return getCropGrowthState(
      p,
      farmClockNow,
      game.yardMoodBuffPeriods ?? [],
      activeAbility.cropGrowthRateMultiplier * ev.rateMultiplier,
      { isPaused: ev.isPaused, minRate: 0.4 }
    ).isReady;
  }).length;
  const overnightReadyCount = game.farmPlots.filter((p) => {
    if (p.cropId === null || !INGREDIENTS[p.cropId]?.isOvernight) return false;
    const ev = evaluateCropSeasonAndWeather(game, p);
    return getCropGrowthState(
      p,
      farmClockNow,
      game.yardMoodBuffPeriods ?? [],
      activeAbility.cropGrowthRateMultiplier * ev.rateMultiplier,
      { isPaused: ev.isPaused, minRate: 0.4 }
    ).isReady;
  }).length;

  const claimableHouseCount = game.house.achievedMilestones.filter(
    (id) => !game.house.claimedMilestones.includes(id)
  ).length;

  const cloudDotColor =
    syncStatus === 'synced'
      ? 'bg-[#3BA886]'
      : syncStatus === 'syncing'
      ? 'bg-[#E6A222]'
      : syncStatus === 'error'
      ? 'bg-[#D64470]'
      : 'bg-[#BBA7A2]';

  return (
    <div className="min-h-dvh w-full bg-[#FBECE3] flex justify-center overflow-x-clip">
      <div className="w-full max-w-[430px] min-h-dvh bg-[#FFF8ED] shadow-2xl relative flex flex-col overflow-x-clip">
        {!activePet.hatched ? (
          <>
            <PWAUpdateBanner
              show={showUpdateBanner}
              updating={updatingApp}
              onUpdate={() => void handleApplyAppUpdate()}
              onDismiss={handleDismissAppUpdate}
              stickyClassName="sticky top-2 z-40"
            />
            <IntroHatching
              defaultName={activePet.name}
              defaultSpecies={activePet.species}
              onComplete={handleHatchComplete}
              onEggTapSound={() => soundFX.pop(game.soundEnabled)}
              onHatchSound={() => soundFX.hatch(game.soundEnabled)}
              onOpenCloudAuth={() => setAuthModalOpen(true)}
              onOpenSharedPet={() => setSharedModalOpen(true)}
            />
          </>
        ) : (
          <>
            <header className="sticky top-0 z-30 h-14 px-3.5 bg-[#FFFDF8]/92 backdrop-blur-md border-b-2 border-[#F4DFD8] flex items-center justify-between gap-2">
              <h1 className="text-lg font-extrabold text-[#4A3531] tracking-tight whitespace-nowrap shrink-0">
                萌寵食堂
              </h1>

              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className="inline-flex items-center gap-1 text-sm font-extrabold text-[#A46D0F] tabular-nums mr-0.5"
                  aria-label={`目前擁有 ${game.coins} 金幣`}
                >
                  <Coins className="w-4 h-4 text-[#E6A222]" />
                  <span>{game.coins}</span>
                </div>

                <PWAInstallButton />

                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  aria-label="雲端存檔與帳號"
                  title="雲端存檔與帳號"
                  className="relative min-h-[38px] min-w-[38px] rounded-xl bg-[#E9F7F2] text-[#256D57] flex items-center justify-center hover:bg-[#D7F0E7] transition"
                >
                  <Cloud className="w-4 h-4" />
                  <span
                    className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${cloudDotColor}`}
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setGame((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
                  }
                  aria-label={game.soundEnabled ? '關閉音效' : '開啟音效'}
                  className="min-h-[38px] min-w-[38px] rounded-xl bg-[#F7ECE6] text-[#5A3E36] flex items-center justify-center hover:bg-[#EEDCD3] transition"
                >
                  {game.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'quests') {
                      setActiveTab('home');
                    } else {
                      setQuestsInitialSection('daily');
                      setActiveTab('quests');
                    }
                  }}
                  aria-label={
                    claimableQuestsCount > 0
                      ? `任務與成長中心（${claimableQuestsCount} 項待領取獎勵）`
                      : '任務與成長中心'
                  }
                  title="每日任務與新手成長"
                  className={`relative min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center transition ${
                    activeTab === 'quests'
                      ? 'bg-[#FFEBF0] text-[#D64470] ring-1 ring-[#F5B4C6]'
                      : 'bg-[#FFF3D8] text-[#9D5B12] hover:bg-[#FFE9BE]'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  {claimableQuestsCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#FF5A87] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums shadow-xs"
                    >
                      {claimableQuestsCount}
                    </span>
                  )}
                </button>
              </div>
            </header>

            <OfflineIndicator />

            <PWAUpdateBanner
              show={showUpdateBanner}
              updating={updatingApp}
              onUpdate={() => void handleApplyAppUpdate()}
              onDismiss={handleDismissAppUpdate}
            />

            <main className="flex-1 overflow-x-clip">
              {activeTab === 'home' && (
                <HomeView
                  pet={activePet}
                  pets={game.pets}
                  maxPetSlots={petSlotsSummary.maxSlots}
                  onSwitchPet={handleSwitchPet}
                  onOpenPetList={() => setActiveTab('pets')}
                  action={actionState}
                  expression={expressionState}
                  flyingFoodEmoji={flyingFoodEmoji}
                  feedEffect={feedEffect}
                  feedParticles={feedParticles}
                  speech={speech}
                  feedbacks={feedbacks}
                  inventory={game.foods}
                  onPet={handlePet}
                  onFeed={handleFeed}
                  onSleep={handleSleep}
                  onBath={handleBath}
                  onWalk={handleWalk}
                  onGoToCanteen={() => {
                    setCanteenInitialSection('shop');
                    setActiveTab('canteen');
                  }}
                  onOpenMinigame={() => setMinigameOpen(true)}
                  onOpenHouse={(tab = 'room') => {
                    setHouseInitialTab(tab);
                    setActiveTab('house');
                  }}
                  house={game.house}
                  onOpenNoviceGrowth={() => {
                    setQuestsInitialSection('growth');
                    setActiveTab('quests');
                  }}
                  noviceClaimableCount={noviceEval.claimableCount}
                  activeTitle={game.encyclopedia.activeTitle}
                  activeBackground={game.activeBackground}
                  unlockedBackgrounds={game.unlockedBackgrounds}
                  onSelectBackground={handleSelectBackground}
                  sharedRoom={sharedRoom}
                  currentUserId={cloudUser?.id ?? null}
                  onOpenSharedPet={() => setSharedModalOpen(true)}
                  latestMessage={latestMessage}
                  unreadMessagesCount={unreadMessagesCount}
                  onOpenMessageBoard={handleOpenMessageBoard}
                  personality={activePersonality}
                  onOpenPersonality={() => setPersonalityModalOpen(true)}
                  onOpenCoopGames={() => setCoopModalOpen(true)}
                  coopBadgeCount={coopBadgeCount}
                  activeDialogue={game.dialogue.activeBubble}
                  weather={game.dialogue.weather}
                  dialogueHistoryCount={game.dialogue.history.length}
                  onRespondDialogue={handleRespondDialogue}
                  onDismissDialogue={handleDismissDialogue}
                  onOpenDialogueHistory={() => setDialogueHistoryOpen(true)}
                  savedDialogueIds={game.memoryAlbum.savedDialogueIds}
                  onSaveDialogueToMemory={handleSaveDialogueToMemory}
                  onOpenMemories={() => {
                    setJournalInitialSection('memories');
                    setActiveTab('journal');
                  }}
                  onOpenGrowthRoadmap={() => setGrowthRoadmapOpen(true)}
                  overnightReadyCount={overnightReadyCount}
                  onGoToFarm={() => {
                    setCanteenInitialSection('farm');
                    setActiveTab('canteen');
                  }}
                  activeVisitor={game.visitorState?.activeVisit ?? null}
                  arrivalNoticeUnread={game.visitorState?.arrivalNoticeUnread ?? false}
                  pendingOrderCount={pendingOrderCount}
                  onOpenVisitorModal={handleOpenVisitorModal}
                  onOpenTownOrders={() => setTownOrderModalOpen(true)}
                  seasonalEvent={game.seasonalEvent ?? null}
                  eventBadgeCount={getEventActionBadgeCount(game, currentUserId)}
                  onOpenSeasonalEvent={() => setEventModalOpen(true)}
                  townMap={game.townMap}
                  onOpenTownMap={() => handleOpenTownMap('map')}
                  collectionProgress={collectionProgress}
                  dailyCollectionReminder={dailyCollectionReminder}
                  onOpenCollection={handleOpenCollection}
                  onDismissCollectionReminder={handleDismissCollectionReminder}
                  seasonSystem={game.seasonSystem}
                  onOpenWeatherCenter={() => setWeatherCenterOpen(true)}
                  onOpenSeasonFestival={() => setSeasonFestivalOpen(true)}
                  onDismissSeasonNotice={handleDismissSeasonNotice}
                  onDismissOfflineSummary={handleDismissOfflineSummary}
                  birthdaySystem={birthdaySystemState}
                  primaryBirthdayStatus={primaryBirthdayStatus}
                  birthdayBadgeCount={birthdayBadgeCount}
                  onOpenBirthdayParty={() => {
                    setBirthdayModalTab('overview');
                    setBirthdayNotice('');
                    setBirthdayError('');
                    setBirthdayModalOpen(true);
                  }}
                  onTapBirthdayCake={handleTapBirthdayCake}
                  photoContest={game.photoContest}
                  onOpenPhotoContest={() => handleOpenPhotoContest('overview')}
                />
              )}

              {activeTab === 'pets' && (
                <PetListView
                  game={game}
                  hasSharedRoom={Boolean(sharedRoom)}
                  onBack={() => setActiveTab('home')}
                  onSwitchPet={handleSwitchPet}
                  onAdoptPet={handleAdoptPet}
                  onClaimSlotReward={handleClaimPetSlotReward}
                  onOpenMemories={() => {
                    setJournalInitialSection('memories');
                    setActiveTab('journal');
                  }}
                  onUpdatePetBirthday={handleUpdatePetBirthday}
                  onOpenBirthdayParty={() => {
                    setBirthdayModalTab('overview');
                    setBirthdayNotice('');
                    setBirthdayError('');
                    setBirthdayModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'canteen' && (
                <CanteenView
                  pet={activePet}
                  action={actionState}
                  flyingFoodEmoji={flyingFoodEmoji}
                  speech={speech}
                  coins={game.coins}
                  inventory={game.foods}
                  ingredients={game.ingredients}
                  farmPlots={game.farmPlots}
                  yardMoodBuffPeriods={game.yardMoodBuffPeriods ?? []}
                  freeSeeds={freeSeeds}
                  puppyTreasureReady={puppyTreasureReady}
                  house={game.house}
                  onFeed={handleFeed}
                  onBuyFood={handleBuyFood}
                  onPlantCrop={handlePlantCrop}
                  onPlantAllCrops={handlePlantAllCrops}
                  onWaterCrop={handleWaterCrop}
                  onWaterAllCrops={handleWaterAllCrops}
                  onHarvestCrop={handleHarvestCrop}
                  onHarvestAllCrops={handleHarvestAllCrops}
                  onClaimPuppyTreasure={handleClaimPuppyTreasure}
                  onCookRecipe={handleCookRecipe}
                  onOpenMinigame={() => setMinigameOpen(true)}
                  onOpenFarmPhotoStudio={() => handleOpenScenePhoto('farm')}
                  onExpandFarmPlot={handleExpandFarmPlot}
                  onUpgradeFarmFacility={handleUpgradeFarmFacility}
                  onToggleFarmDecoration={handleToggleFarmDecoration}
                  onUpdateHouseName={handleUpdateHouseName}
                  initialSection={canteenInitialSection}
                  learnedRecipeIds={game.encyclopedia.learnedRecipeIds}
                  collectedFoodIds={game.encyclopedia.collectedFoodIds}
                  highlightedRecipeId={canteenHighlightedRecipeId}
                  cropNotifyEnabled={cropNotifyEnabled}
                  onToggleCropNotify={() => void handleToggleCropNotify()}
                  timeOfDay={getTimeOfDayPeriod(new Date(farmClockNow))}
                  farmSpeedTickets={game.farmSpeedTickets ?? 0}
                  onUseSpeedTicket={handleUseFarmSpeedTicket}
                  onOpenTownOrders={() => setTownOrderModalOpen(true)}
                  pendingOrderCount={pendingOrderCount}
                  seasonSystem={game.seasonSystem}
                  weather={game.dialogue.weather}
                  onStabilizeWindblownPlot={handleStabilizeWindblownPlot}
                  onOpenWeatherCenter={() => setWeatherCenterOpen(true)}
                />
              )}

              {activeTab === 'wardrobe' && (
                <WardrobeView
                  pet={activePet}
                  personality={activePersonality}
                  coins={game.coins}
                  unlockedAccessories={game.accessories}
                  onToggleEquip={handleToggleEquip}
                  onBuyAccessory={handleBuyAccessory}
                  onOpenPetList={() => setActiveTab('pets')}
                  onOpenPhotoStudio={() => handleOpenScenePhoto('wardrobe', 'shoot')}
                  onOpenStudioTab={(tab) => handleOpenScenePhoto('wardrobe', tab)}
                  onOpenPhotoContest={() => handleOpenPhotoContest('overview')}
                  photoContestThemeLabel={`${currentContestSchedule.theme.emoji} ${currentContestSchedule.theme.name}`}
                  weeklyThemeLabel={`${currentWeeklyOutfitTheme.emoji} ${currentWeeklyOutfitTheme.title}`}
                  studioCollectionText={`${studioCollectionProgress.totalOwned}/${studioCollectionProgress.totalCatalog}`}
                  onOpenEncyclopedia={() => {
                    setJournalInitialSection('encyclopedia');
                    setJournalEncyclopediaSection('accessories');
                    setActiveTab('journal');
                  }}
                  onOpenGrowthRoadmap={() => setGrowthRoadmapOpen(true)}
                  lastReactionText={wardrobeReactionText}
                />
              )}

              {activeTab === 'house' && (
                <HouseView
                  game={game}
                  farmPlots={game.farmPlots}
                  sharedRoom={sharedRoom}
                  currentUserId={currentUserId}
                  actorName={actorName}
                  initialTab={houseInitialTab}
                  onUpdateGame={handleUpdateHouseGame}
                  onExpandFarmPlot={handleExpandFarmPlot}
                  onUpgradeFarmFacility={handleUpgradeFarmFacility}
                  onToggleFarmDecoration={handleToggleFarmDecoration}
                  onOpenSharedPet={() => setSharedModalOpen(true)}
                  onOpenCoopGames={() => setCoopModalOpen(true)}
                  onOpenHouseEncyclopedia={() => {
                    setJournalInitialSection('encyclopedia');
                    setJournalEncyclopediaSection('room');
                    setActiveTab('journal');
                  }}
                  onGoToFarm={() => {
                    setCanteenInitialSection('farm');
                    setActiveTab('canteen');
                  }}
                  onOpenVisitorModal={handleOpenVisitorModal}
                  onOpenTownOrders={() => setTownOrderModalOpen(true)}
                  onOpenTownMap={() => handleOpenTownMap('map')}
                  onOpenWeatherCenter={() => setWeatherCenterOpen(true)}
                  onSharePhotoToBoard={handleSharePhotoToBoard}
                  onTogglePhotoLike={handleTogglePhotoLike}
                  onAddPhotoComment={handleAddPhotoComment}
                  onOpenShareCard={handleOpenShareCard}
                  onCelebrateBirthdayCake={handleTapBirthdayCake}
                />
              )}

              {activeTab === 'journal' && (
                <JournalView
                  pet={activePet}
                  personality={activePersonality}
                  weightLogs={game.weightLogs}
                  onRecordWeight={handleRecordWeight}
                  onRequestReset={() => setResetModalOpen(true)}
                  cloudUser={cloudUser}
                  syncStatus={syncStatus}
                  lastSyncedAt={lastSyncedAt}
                  onOpenCloudAuth={() => setAuthModalOpen(true)}
                  onForceUpload={handleForceUpload}
                  sharedRoom={sharedRoom}
                  onOpenSharedPet={() => setSharedModalOpen(true)}
                  messageCount={activeMessages.length}
                  onOpenMessageBoard={handleOpenMessageBoard}
                  encyclopedia={game.encyclopedia}
                  unlockedAccessories={game.accessories}
                  house={game.house}
                  initialSection={journalInitialSection}
                  initialEncyclopediaSection={journalEncyclopediaSection}
                  onOpenHousePhotoMode={() => {
                    setHouseInitialTab('photo');
                    setActiveTab('house');
                  }}
                  onOpenWardrobePhotoMode={(sc) => handleOpenScenePhoto(sc ?? 'wardrobe')}
                  onSharePhotoToBoard={handleSharePhotoToBoard}
                  onTogglePhotoLike={handleTogglePhotoLike}
                  onAddPhotoComment={handleAddPhotoComment}
                  onSelectTitle={handleSelectTitle}
                  dialogueCount={game.dialogue.history.length}
                  onOpenDialogueHistory={() => setDialogueHistoryOpen(true)}
                  game={game}
                  messages={activeMessages}
                  onOpenMemoryDetail={(m) => setSelectedMemoryEntry(m)}
                  onToggleFavoriteMemory={handleToggleFavoriteMemory}
                  onOpenShareCard={handleOpenShareCard}
                  onSaveMonthlyRecap={handleSaveMonthlyRecap}
                  onShareRecapToBoard={handleShareRecapToBoard}
                  onShareTextToBoard={handleShareCoopCardToBoard}
                  onGoToKitchen={(recipeId) => {
                    setCanteenHighlightedRecipeId(recipeId ?? null);
                    setCanteenInitialSection('kitchen');
                    setActiveTab('canteen');
                  }}
                  onCraftStudioRecipe={handleCraftStudioRecipe}
                  onOpenPetList={() => setActiveTab('pets')}
                  onClaimTownEncyclopediaReward={handleClaimTownEncyclopediaReward}
                  onOpenTownMap={(locId) =>
                    handleOpenTownMap(locId ? 'location' : 'map', locId ?? null)
                  }
                  onJumpToCollectionTarget={handleCollectionJump}
                  onToggleCollectionReminder={handleToggleCollectionReminder}
                />
              )}

              {activeTab === 'quests' && (
                <QuestsView
                  dailyTasks={game.dailyTasks}
                  dateStr={game.dailyTasksDate}
                  onClaimTask={handleClaimTask}
                  onClaimFamilyTask={handleClaimFamilyTask}
                  game={game}
                  hasSharedRoom={Boolean(sharedRoom)}
                  onClaimNoviceDay={handleClaimNoviceDay}
                  onSelectBackground={handleSelectBackground}
                  initialSection={questsInitialSection}
                  onBackHome={() => setActiveTab('home')}
                />
              )}
            </main>

            <BottomTabBar
              activeTab={activeTab}
              onChange={(tab) => {
                if (tab === 'canteen') {
                  setCanteenHighlightedRecipeId(null);
                  setCanteenInitialSection('shop');
                }
                if (tab === 'house') {
                  setHouseInitialTab('room');
                }
                if (tab === 'quests') {
                  setQuestsInitialSection('daily');
                }
                if (tab === 'journal') {
                  setJournalInitialSection('journal');
                  setJournalEncyclopediaSection('pets');
                }
                setActiveTab(tab);
              }}
              claimableHouseCount={claimableHouseCount}
              readyCropsCount={readyCropsCount}
              unreadMessagesCount={unreadMessagesCount}
            />

            <LevelUpModal
              stage={levelUpStage}
              prestigeStar={levelUpPrestigeStar}
              rewardText={levelUpRewardText}
              pet={activePet}
              onClose={() => {
                setLevelUpStage(null);
                setLevelUpPrestigeStar(null);
                setLevelUpRewardText(null);
              }}
              onTakeGrowthPhoto={() => {
                setWardrobePhotoScene('album');
                setWardrobePhotoTab('shoot');
                setWardrobePhotoOpen(true);
              }}
            />

            <GrowthRoadmapModal
              open={growthRoadmapOpen}
              pet={activePet}
              onClose={() => setGrowthRoadmapOpen(false)}
            />

            <ResetConfirmModal
              open={resetModalOpen}
              petName={activePet.name}
              onClose={() => setResetModalOpen(false)}
              onConfirmReset={handleConfirmReset}
            />
          </>
        )}

        <AuthSyncModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          isConfigured={isSupabaseConfigured}
          user={cloudUser}
          syncStatus={syncStatus}
          lastSyncedAt={lastSyncedAt}
          syncError={syncError}
          pendingCloudSave={pendingCloudSave}
          localPetName={activePet.name}
          localPetLevel={activePet.level}
          localPetWeight={activePet.weight}
          localHatched={activePet.hatched}
          sharedRoom={sharedRoom}
          onOpenSharedPet={() => setSharedModalOpen(true)}
          onAuthSuccess={(loggedInUser) => {
            setCloudUser(loggedInUser);
            if (lastHandledUserIdRef.current !== loggedInUser.id) {
              lastHandledUserIdRef.current = loggedInUser.id;
              void syncAfterSignIn(loggedInUser, true);
            }
          }}
          onSignOut={handleCloudSignOut}
          onForceUpload={handleForceUpload}
          onForceDownload={handleForceDownload}
          onResolveConflictUseCloud={handleResolveConflictUseCloud}
          onResolveConflictUseLocal={handleResolveConflictUseLocal}
        />

        <SharedPetModal
          open={sharedModalOpen}
          onClose={() => setSharedModalOpen(false)}
          isConfigured={isSupabaseConfigured}
          cloudUser={cloudUser}
          sharedRoom={sharedRoom}
          syncStatus={syncStatus}
          localPetName={game.pets[0]?.name ?? activePet.name}
          localHatched={activePet.hatched}
          onOpenCloudAuth={() => setAuthModalOpen(true)}
          onCreateSharedRoom={handleCreateSharedRoom}
          onJoinSharedRoom={handleJoinSharedRoom}
          onRegenerateInviteCode={handleRegenerateInviteCode}
          onLeaveSharedRoom={handleLeaveSharedRoom}
          onRefreshSharedRoom={handleRefreshSharedRoom}
          onOpenCoopGames={() => setCoopModalOpen(true)}
          activeTitle={game.encyclopedia.activeTitle}
        />

        <MessageBoardModal
          open={messageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          petName={activePet.name}
          pets={game.pets}
          messages={activeMessages}
          roomPhotos={game.house.photos}
          loading={messagesLoading}
          error={messagesError}
          currentUserId={cloudUser?.id ?? null}
          sharedRoom={sharedRoom}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onTogglePhotoLike={handleTogglePhotoLike}
          onAddPhotoComment={handleAddPhotoComment}
          activeTitle={game.encyclopedia.activeTitle}
          birthdayCards={birthdaySystemState.cards}
        />

        <MinigameHubModal
          open={minigameOpen}
          onClose={() => setMinigameOpen(false)}
          pet={activePet}
          coins={game.coins}
          soundEnabled={game.soundEnabled}
          hubState={game.minigameHub}
          onSpendReplayCoins={handleSpendReplayCoins}
          onFinishMinigame={handleFinishMinigame}
          onClaimWeeklyChallenge={handleClaimWeeklyChallenge}
        />

        <PersonalityProfileModal
          open={personalityModalOpen}
          onClose={() => setPersonalityModalOpen(false)}
          pet={activePet}
          personality={activePersonality}
        />

        <WardrobePhotoModal
          open={wardrobePhotoOpen}
          onClose={() => setWardrobePhotoOpen(false)}
          game={game}
          pet={activePet}
          personality={activePersonality}
          coins={game.coins}
          currentUserId={currentUserId}
          actorName={actorName}
          sharedRoom={sharedRoom}
          initialScene={wardrobePhotoScene}
          initialTab={wardrobePhotoTab}
          initialVisitorId={wardrobePhotoVisitorId}
          initialTownLocationId={wardrobePhotoTownLocationId}
          initialTownVisitorId={wardrobePhotoTownVisitorId}
          unlockedPoses={game.memoryAlbum.unlockedPhotoPoses}
          unlockedFrames={game.memoryAlbum.unlockedPhotoFrames}
          onSavePhoto={handleSaveWardrobePhoto}
          onSharePhotoToBoard={handleSharePhotoToBoard}
          onBuyPose={handleBuyStudioPose}
          onBuyBackground={handleBuyStudioBackground}
          onBuyFilter={handleBuyStudioFilter}
          onBuyFrame={handleBuyStudioFrame}
          onBuySticker={handleBuyStudioSticker}
          onCraftRecipe={handleCraftStudioRecipe}
          onSubmitWeeklyChallenge={handleSubmitWeeklyStudioChallenge}
          onClaimChallengeTier={handleClaimWeeklyStudioTier}
          onSubmitDuoChallenge={handleSubmitCoopDuoChallenge}
          onClaimDuoChallengeReward={handleClaimCoopDuoChallengeReward}
          onOpenSharedPet={() => {
            setWardrobePhotoOpen(false);
            setSharedModalOpen(true);
          }}
          seasonSystem={game.seasonSystem}
          weather={game.dialogue.weather}
          onOpenWeatherCenter={() => setWeatherCenterOpen(true)}
          onOpenPhotoContest={(draft) => {
            setWardrobePhotoOpen(false);
            handleOpenPhotoContest('overview', draft ?? null);
          }}
        />

        <DialogueHistoryModal
          open={dialogueHistoryOpen}
          onClose={() => setDialogueHistoryOpen(false)}
          pet={activePet}
          dialogue={game.dialogue}
          onUpdateSettings={handleUpdateDialogueSettings}
          savedDialogueIds={game.memoryAlbum.savedDialogueIds}
          onSaveDialogueToMemory={handleSaveDialogueToMemory}
        />

        <MemoryDetailModal
          open={Boolean(selectedMemoryEntry)}
          onClose={() => setSelectedMemoryEntry(null)}
          memory={selectedMemoryEntry}
          pet={activePet}
          isFavorite={
            selectedMemoryEntry
              ? game.memoryAlbum.favoriteMemoryIds.includes(selectedMemoryEntry.id)
              : false
          }
          relatedPhoto={
            selectedMemoryEntry?.photoId
              ? game.house.photos.find((p) => p.id === selectedMemoryEntry.photoId) ?? null
              : null
          }
          sharedRoom={sharedRoom}
          currentUserId={currentUserId}
          onToggleFavorite={handleToggleFavoriteMemory}
          onTogglePhotoLike={handleTogglePhotoLike}
          onAddPhotoComment={handleAddPhotoComment}
          onOpenShareCard={handleOpenShareCard}
          onShareMemoryToBoard={handleShareMemoryToBoard}
        />

        <ShareCardModal
          open={Boolean(shareCardPayload)}
          onClose={() => setShareCardPayload(null)}
          payload={shareCardPayload}
          sharedRoom={sharedRoom}
          onShareToBoard={handleShareCardPayloadToBoard}
        />

        <CoopHubModal
          open={coopModalOpen}
          onClose={() => setCoopModalOpen(false)}
          game={game}
          sharedRoom={sharedRoom}
          currentUserId={currentUserId}
          actorName={actorName}
          onStartRoomSession={handleStartCoopRoomSession}
          onSelectFurniture={handleSelectCoopFurniture}
          onPlaceCandidate={handlePlaceCoopCandidate}
          onSettleRoomSession={handleSettleCoopRoomSession}
          onPlantCoopCrop={handlePlantCoopCrop}
          onHarvestCoopCrop={handleHarvestCoopCrop}
          onDepositIngredient={handleDepositCoopIngredient}
          onCookCoopRecipe={handleCookCoopRecipe}
          onClaimReward={handleClaimCoopReward}
          onAcknowledgeOfflineEvents={handleAcknowledgeOfflineEvents}
          onShareCardToBoard={handleShareCoopCardToBoard}
          onContributeCoopVisitor={handleContributeCoopVisitor}
          onClaimCoopVisitorReward={handleClaimCoopVisitorReward}
          onCaptureCoopVisitorPhoto={handleCaptureVisitorPhoto}
        />

        <VisitorModal
          open={visitorModalOpen}
          game={game}
          hasSharedRoom={Boolean(sharedRoom)}
          onClose={() => setVisitorModalOpen(false)}
          onFeedVisitor={handleFeedVisitor}
          onBuyTreat={handleBuyVisitorTreat}
          onCapturePhoto={handleCaptureVisitorPhoto}
          onOpenVisitorStudio={(vId) => handleOpenVisitorStudio(vId)}
          onOpenOrderBoard={() => {
            setVisitorModalOpen(false);
            setTownOrderModalOpen(true);
          }}
        />

        <TownOrderBoardModal
          open={townOrderModalOpen}
          game={game}
          currentUserId={currentUserId}
          hasSharedRoom={Boolean(sharedRoom)}
          onClose={() => setTownOrderModalOpen(false)}
          onDeliverOrderItem={handleDeliverTownOrderItem}
          onClaimOrderReward={handleClaimTownOrderReward}
          onContributeCoopVisitor={handleContributeCoopVisitor}
          onClaimCoopVisitorReward={handleClaimCoopVisitorReward}
          onCaptureVisitorPhoto={handleCaptureVisitorPhoto}
          onOpenPhotoOrderStudio={(vId) => handleOpenVisitorStudio(vId)}
          onCraftShardFurniture={handleCraftShardFurniture}
          onBuyTreat={handleBuyVisitorTreat}
        />

        <SeasonalEventModal
          open={eventModalOpen}
          onClose={() => setEventModalOpen(false)}
          game={game}
          sharedRoom={sharedRoom}
          currentUserId={currentUserId}
          actorName={actorName}
          onClaimDailyTask={handleClaimEventDailyTask}
          onClaimMilestone={handleClaimEventMilestone}
          onBuyShopItem={handleBuyEventShopItem}
          onSubmitEventPhotoChallenge={handleSubmitEventPhotoChallenge}
          onClaimChallengeTier={handleClaimEventChallengeTier}
          onClaimCoopReward={handleClaimCoopEventReward}
          onCreatePicnicPhoto={handleCreateStrawberryPicnicPhoto}
          onConvertTickets={handleConvertEventTickets}
          onSelectRecapCoverPhoto={handleSelectEventRecapCoverPhoto}
          onSaveRecapToMemories={handleSaveEventRecapToMemories}
          onOpenStudioShoot={() => handleOpenScenePhoto('wardrobe', 'shoot')}
          onOpenEventCatalog={() => {
            setJournalInitialSection('encyclopedia');
            setJournalEncyclopediaSection('events');
            setActiveTab('journal');
          }}
          onGoToFarm={() => {
            setCanteenInitialSection('farm');
            setActiveTab('canteen');
          }}
          onGoToKitchen={() => {
            setCanteenInitialSection('kitchen');
            setActiveTab('canteen');
          }}
          onOpenSharedPet={() => setSharedModalOpen(true)}
          onSharePhotoToBoard={handleSharePhotoToBoard}
        />

        <TownMapModal
          open={townMapOpen}
          onClose={() => setTownMapOpen(false)}
          game={game}
          sharedRoom={sharedRoom}
          currentUserId={currentUserId}
          initialTab={townMapInitialTab}
          initialLocationId={townMapFocusLocationId}
          onEnterLocation={handleTownEnterLocation}
          onSpawnVisitor={handleTownSpawnVisitor}
          onFeedVisitor={handleTownFeedVisitor}
          onOpenLocationPhoto={handleOpenTownLocationStudio}
          onForageAcorn={handleTownForageAcorn}
          onSettleFishing={handleTownSettleFishing}
          onDeliverMarketDish={handleTownDeliverMarketDish}
          onBuyMarketFurniture={handleTownBuyMarketFurniture}
          onClaimLocationQuest={handleTownClaimLocationQuest}
          onClaimLocationAllBonus={handleTownClaimAllQuestsBonus}
          onUpgradeHut={handleTownUpgradeHut}
          onBuyHutFacility={handleTownBuyFacility}
          onBuyShopItem={handleTownBuyShopItem}
          onClaimCoopTownReward={handleTownClaimCoopReward}
          onOpenSharedPet={() => setSharedModalOpen(true)}
        />

        <CollectionCelebrationModal
          event={collectionCelebrations[0] ?? null}
          onClose={() => setCollectionCelebrations((prev) => prev.slice(1))}
        />

        <WeatherCenterModal
          open={weatherCenterOpen}
          onClose={() => setWeatherCenterOpen(false)}
          game={game}
          weatherLoading={weatherLoading}
          onSelectCity={handleSelectWeatherCity}
          onRefreshWeather={handleRefreshWeather}
          onDismissOfflineSummary={handleDismissOfflineSummary}
          onClaimWeatherTask={handleClaimWeatherTask}
          onSwitchRoomTheme={handleSwitchSeasonRoomTheme}
          onSwitchYardTheme={handleSwitchSeasonYardTheme}
          onOpenSeasonEvent={() => {
            setWeatherCenterOpen(false);
            setSeasonFestivalOpen(true);
          }}
        />

        <SeasonEventModal
          open={seasonFestivalOpen}
          onClose={() => setSeasonFestivalOpen(false)}
          game={game}
          sharedRoom={sharedRoom}
          currentUserId={currentUserId}
          onClaimDailyTask={handleClaimSakuraDailyTask}
          onBuyShopItem={handleBuySakuraShopItem}
          onClaimCoopReward={handleClaimSakuraCoopReward}
          onOpenSharedPet={() => {
            setSeasonFestivalOpen(false);
            setSharedModalOpen(true);
          }}
        />

        <BirthdayModal
          open={birthdayModalOpen}
          game={game}
          initialTab={birthdayModalTab}
          actorName={actorName}
          currentUserId={cloudUser?.id ?? null}
          notice={birthdayNotice}
          errorMsg={birthdayError}
          onClearBanner={() => {
            setBirthdayNotice('');
            setBirthdayError('');
          }}
          onClose={() => setBirthdayModalOpen(false)}
          onUpdatePetBirthday={handleUpdatePetBirthday}
          onBuyPantryItem={handleBuyBirthdayPantryItem}
          onReserveCake={handleReserveBirthdayCake}
          onBakeCake={handleBakeBirthdayCake}
          onPlaceCake={handlePlaceBirthdayCake}
          onEatCake={handleCelebrateEatBirthdayCake}
          onBuyGift={handleBuyBirthdayGift}
          onBuyTicketShopItem={handleBuyBirthdayTicketShopItem}
          onBuyOrToggleDecoration={handleBuyOrToggleBirthdayDecor}
          onAddCardBlessing={handleAddBirthdayCardBlessing}
          onFinalizeCard={handleFinalizeBirthdayCard}
          onShareCardToBoard={handleShareBirthdayCardToBoard}
          onClaimTask={handleClaimBirthdayTask}
          onClaimOrder={handleClaimBirthdayOrder}
          onContributeCoopStep={handleContributeCoopBirthdayStep}
          onClaimCoopReward={handleClaimCoopBirthdayReward}
          onOpenBirthdayPhoto={() => {
            setBirthdayModalOpen(false);
            handleOpenScenePhoto('birthday', 'shoot');
          }}
        />

        <PhotoContestModal
          open={photoContestOpen}
          onClose={handleClosePhotoContest}
          game={game}
          pet={activePet}
          currentUserId={currentUserId}
          actorName={actorName}
          sharedRoom={sharedRoom}
          initialTab={photoContestTab}
          initialDraft={photoContestDraft}
          onOpenWardrobe={() => setActiveTab('wardrobe')}
          onSubmitEntry={handleSubmitPhotoContest}
          onSubmitVote={handleVotePhotoContest}
          onBuyShopItem={handleBuyPhotoContestShopItem}
          onCoopOutfit={handleCoopPhotoOutfit}
          onCoopDecor={handleCoopPhotoDecor}
          onSubmitCoopEntry={handleSubmitCoopPhotoContest}
          onClaimCoopReward={handleClaimCoopPhotoReward}
          onDismissSettlement={handleDismissContestSettlement}
        />
      </div>
    </div>
  );
}
