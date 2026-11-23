import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckSquare, Cloud, Coins, Volume2, VolumeX } from 'lucide-react';
import { AuthSyncModal } from './components/AuthSyncModal';
import { BottomTabBar } from './components/BottomTabBar';
import { CanteenSection, CanteenView } from './components/CanteenView';
import { CoopHubModal } from './components/coop/CoopHubModal';
import { DialogueHistoryModal } from './components/dialogue/DialogueHistoryModal';
import { EncyclopediaSection } from './components/EncyclopediaView';
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
import { PWAInstallButton } from './components/PWAInstallButton';
import { PWAUpdateBanner } from './components/PWAUpdateBanner';
import { QuestsView } from './components/QuestsView';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { SharedPetModal } from './components/SharedPetModal';
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
import {
  TOUCH_ZONE_META,
  getPetSpeciesInfo,
  getRandomZoneSpeech,
  pickRandomNonRepeating,
} from './data/species';
import { getStickerById } from './data/stickers';
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
  CloudSavePayload,
  CloudSyncStatus,
  CloudUser,
  DialogueLine,
  DialogueSettings,
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
  PetExpression,
  PetMessage,
  PetSpecies,
  PetStickerId,
  PetTouchZone,
  PetViewDirection,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScene,
  PhotoStickerId,
  PiggyActionState,
  RoomPhotoRecord,
  SharedPetRoom,
  StageBackgroundId,
  TabKey,
  ThemeSetId,
  TitleId,
  WeightLog,
} from './types';
import { MinigameResult, MinigameWeeklyChallengeId } from './types/minigame';
import {
  acknowledgeOfflinePartnerEvents,
  claimCoopReward,
  cookCoopOrderRecipe,
  depositIngredientToCoopWarehouse,
  getOfflinePartnerEvents,
  harvestCoopCropToWarehouse,
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
  getWaterBoostMs,
} from './utils/farmGrowth';
import {
  applyPersonalityDevelopment,
  evaluateAccessoryPreference,
} from './utils/personality';
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
  const [personalityModalOpen, setPersonalityModalOpen] = useState<boolean>(false);
  const [dialogueHistoryOpen, setDialogueHistoryOpen] = useState<boolean>(false);
  const [wardrobePhotoOpen, setWardrobePhotoOpen] = useState<boolean>(false);
  const [wardrobePhotoScene, setWardrobePhotoScene] = useState<PhotoScene>('wardrobe');
  const [shareCardPayload, setShareCardPayload] = useState<ShareCardPayload | null>(null);
  const [selectedMemoryEntry, setSelectedMemoryEntry] = useState<MemoryEntry | null>(null);
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
  const lastPuppyTreasureAtRef = useRef<number>(Date.now());

  const currentUserId = cloudUser?.id ?? 'local';
  const actorName = cloudUser?.email ? cloudUser.email.split('@')[0] || '飼主' : '飼主';
  const {
    showUpdateBanner,
    updating: updatingApp,
    applyUpdate: handleApplyAppUpdate,
    dismissUpdate: handleDismissAppUpdate,
  } = usePWAUpdate();

  const actionTimerRef = useRef<number | null>(null);
  const feedPhaseTimerRef = useRef<number | null>(null);
  const prevStageLevelRef = useRef<number>(
    getGrowthStage(game.pet.growth, game.pet.species).level
  );
  const prevPrestigeStarsRef = useRef<number>(
    getPrestigeStarInfo(game.pet.growth).stars
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
  const prevTitlesCountRef = useRef<number>(
    game.encyclopedia.unlockedTitles.length
  );

  gameRef.current = game;
  messageModalOpenRef.current = messageModalOpen;

  useEffect(() => {
    saveGameState(game);
  }, [game]);

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
    const milestoneLen = game.encyclopedia.claimedAccessoryMilestones.length;
    if (milestoneLen > prevMilestonesCountRef.current) {
      const latest = game.encyclopedia.claimedAccessoryMilestones[milestoneLen - 1];
      pushFeedback(`收集 ${latest} 款配件里程碑 +50 金幣！`, '🎉');
    }
    prevMilestonesCountRef.current = milestoneLen;

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
    game.encyclopedia.unlockedTitles,
    game.soundEnabled,
  ]);

  const applyCloudStateLocally = useCallback((cloudState: GameState, customSpeech?: string) => {
    skipNextCloudUploadRef.current = true;
    prevStageLevelRef.current = getGrowthStage(
      cloudState.pet.growth,
      cloudState.pet.species
    ).level;
    prevPrestigeStarsRef.current = getPrestigeStarInfo(cloudState.pet.growth).stars;
    setGame(cloudState);
    setSpeech(customSpeech ?? `歡迎回來，${cloudState.pet.name}！`);
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
          applyCloudStateLocally(
            sharedRes.state,
            `回到與夥伴共養的「${sharedRes.state.pet.name}」身邊囉！`
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

      if (cloudState) {
        if (!currentLocal.pet.hatched) {
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

      if (currentLocal.pet.hatched) {
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
        const mergedState = mergeCoopRemoteState(gameRef.current, remoteState);
        const partnerFedNow = remoteState.feedLogs.length > gameRef.current.feedLogs.length;
        const withPartnerFeedMem = partnerFedNow
          ? recordMemoryEntry(mergedState, {
              uniqueKey: 'coop_partner_first_feed',
              type: 'coop',
              title: `夥伴第一次餵食 ${mergedState.pet.name}`,
              description: `共養夥伴細心照顧 ${mergedState.pet.name}，一起分享美味時光！`,
              emoji: '🍱',
              isShared: true,
            })
          : mergedState;
        const evaluatedDialogue = evaluateAndSelectDialogue(withPartnerFeedMem, cloudUser.id);
        const nextMerged: GameState = { ...withPartnerFeedMem, dialogue: evaluatedDialogue };
        applyCloudStateLocally(nextMerged, `夥伴剛剛照顧了${nextMerged.pet.name}與小屋！`);
        const fbId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        setFeedbacks((prev) => [...prev.slice(-4), { id: fbId, text: '夥伴剛更新了共養空間！', emoji: '💞' }]);
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
          const mergedState = mergeCoopRemoteState(gameRef.current, res.state);
          const evaluatedDialogue = evaluateAndSelectDialogue(mergedState, cloudUser.id);
          applyCloudStateLocally({ ...mergedState, dialogue: evaluatedDialogue });
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
    if (!isSupabaseConfigured || !cloudUser || pendingCloudSave || !game.pet.hatched) {
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
    const currentStage = getGrowthStage(game.pet.growth, game.pet.species);
    const currentStars = getPrestigeStarInfo(game.pet.growth).stars;

    if (currentStage.level > prevStageLevelRef.current) {
      const reward = STAGE_LEVEL_REWARDS[currentStage.level];
      soundFX.levelUp(game.soundEnabled);
      setLevelUpStage(currentStage);
      setLevelUpPrestigeStar(null);
      setLevelUpRewardText(reward?.rewardText ?? null);

      setGame((prev) => {
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
            uniqueKey: `growth_lv_${currentStage.level}`,
            type: 'growth',
            title: `成長至 Lv.${currentStage.level}「${currentStage.name}」！`,
            description: `${prev.pet.name}邁入全新成長階段，獲得祝賀禮 ${reward?.rewardText ?? ''}！`,
            emoji: '✨',
            level: currentStage.level,
            weight: prev.pet.weight,
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
        const next: GameState = {
          ...prev,
          coins: prev.coins + PRESTIGE_STAR_REWARD_COINS,
          dialogue: appendMemoryEvent(prev.dialogue, {
            type: 'milestone',
            detail: `達成閃耀星等 ★${currentStars}`,
          }),
        };
        return recordMemoryEntry(next, {
          uniqueKey: `growth_prestige_star_${currentStars}`,
          type: 'growth',
          title: `達成 Lv.4 閃耀星等 ★${currentStars}！`,
          description: `細心陪伴讓 ${prev.pet.name} 獲得閃耀 ★${currentStars} 榮譽，獲贈 +${PRESTIGE_STAR_REWARD_COINS} 金幣！`,
          emoji: '🌟',
          level: 4,
          weight: prev.pet.weight,
        });
      });
    }

    prevStageLevelRef.current = currentStage.level;
    prevPrestigeStarsRef.current = currentStars;
  }, [game.pet.growth, game.pet.species, game.soundEnabled]);

  // 自動評估 12 項里程碑、8 項共養共同回憶（支援離線後恢復同步雙端通知）與月末/月初月度回顧卡
  useEffect(() => {
    if (!game.pet.hatched) return;
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
    if (!game.pet.hatched) return;
    const evaluateNow = () => {
      setGame((prev) => {
        if (!prev.pet.hatched) return prev;
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
  }, [game.pet.hatched, currentUserId]);

  useEffect(() => {
    if (!game.pet.hatched) return;
    const timer = window.setInterval(() => {
      setGame((prev) => {
        const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
        const decayedPet = applyTimeDecay(prev.pet, 20000);
        const syncedCoop = syncCoopHubState(prev.coop);
        const draft: GameState = {
          ...prev,
          dailyTasks: synced.dailyTasks,
          dailyTasksDate: synced.dailyTasksDate,
          pet: decayedPet,
          coop: syncedCoop,
        };
        const nextDialogue = evaluateAndSelectDialogue(draft, currentUserId);
        return {
          ...draft,
          dialogue: nextDialogue,
        };
      });
    }, 20000);
    return () => window.clearInterval(timer);
  }, [game.pet.hatched, currentUserId]);

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
    const initialWeightLog: WeightLog = {
      id: `wlog_${Date.now()}`,
      date: todayStr,
      weight: game.pet.weight,
      foodName: '破殼報到',
      note: `${petName}（${speciesInfo.label}）來到萌寵食堂的第一天！`,
      weightDelta: 0,
      timeStr: formatLocalTime(now),
      timestamp: now.getTime(),
    };
    soundFX.petVoice(game.soundEnabled, species);
    setGame((prev) => {
      const hatchedState: GameState = {
        ...prev,
        pet: {
          ...prev.pet,
          name: petName,
          species,
          hatched: true,
        },
        weightLogs: [initialWeightLog, ...prev.weightLogs],
        noviceGrowth: {
          ...prev.noviceGrowth,
          startedDate: prev.noviceGrowth.startedDate || todayStr,
        },
      };
      const withMemory = recordMemoryEntry(hatchedState, {
        uniqueKey: 'hatching_welcome',
        type: 'hatching',
        title: `${petName} 加入我們的家！`,
        description: `在萌寵食堂破殼報到（${speciesInfo.label}），正式展開幸福的美食與陪伴之旅！`,
        emoji: '🐣',
        weight: prev.pet.weight,
        level: 1,
        createdAt: now.getTime(),
      });
      return syncAllAccessoryProgress(withMemory).nextState;
    });
    setSpeech(`嗨～我是${petName}，${speciesInfo.greeting}`);
  };

  const handleChangeSpecies = (species: PetSpecies) => {
    if (game.pet.species === species) return;
    const speciesInfo = getPetSpeciesInfo(species);
    soundFX.petVoice(game.soundEnabled, species);
    setGame((prev) => ({
      ...prev,
      pet: {
        ...prev.pet,
        species,
      },
    }));
    setSpeech(`變身成「${speciesInfo.label}」囉！${speciesInfo.greeting}`);
    pushFeedback(`切換為${speciesInfo.shortName}`, '✨');
  };

  const handlePet = (zone: PetTouchZone = 'head') => {
    const zoneMeta = TOUCH_ZONE_META[zone];
    const nextSpeech = getRandomZoneSpeech(
      game.pet.species,
      zone,
      game.pet.mood,
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
    soundFX.petVoice(game.soundEnabled, game.pet.species);
    setTemporaryAction('petted', 1100, nextExpression);
    pushFeedback(
      isStormWeather ? `${nextFeedback.text} (雷雨安慰加成)` : nextFeedback.text,
      nextFeedback.emoji
    );
    setSpeech(nextSpeech);

    setGame((prev) => {
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const stormMoodBonus = prev.dialogue.weather.condition === 'storm' ? 2 : 0;
      const stormIntimacyBonus = prev.dialogue.weather.condition === 'storm' ? 1 : 0;
      const gainInfo = computeGrowthGain(5, prev.pet);
      const nextGrowth = prev.pet.growth + gainInfo.total;
      const dev = applyPersonalityDevelopment(prev.personality, 'pet_or_message');
      const zoneLabels: Record<PetTouchZone, string> = {
        head: '摸摸頭',
        cheek: '捏捏臉頰',
        belly: '揉揉肚肚',
        paw: '牽牽小手',
      };
      const nextDialogue = appendMemoryEvent(prev.dialogue, {
        type: 'petted',
        detail: zoneLabels[zone],
      });
      const draftState: GameState = {
        ...prev,
        pet: {
          ...prev.pet,
          mood: clampStat(prev.pet.mood + 6 + stormMoodBonus, 0, 100),
          intimacy: prev.pet.intimacy + 2 + stormIntimacyBonus,
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth, prev.pet.species).level,
        },
        personality: dev.nextPersonality,
        dialogue: nextDialogue,
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'pet_3', 1),
        dailyTasksDate: synced.dailyTasksDate,
        noviceGrowth: {
          ...prev.noviceGrowth,
          petCount: prev.noviceGrowth.petCount + 1,
        },
      };
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

    if (game.pet.hunger >= 100) {
      soundFX.pop(game.soundEnabled);
      const fullMessage = `${game.pet.name}已經吃飽了！`;
      setSpeech(fullMessage);
      pushFeedback(fullMessage, '🍽️');
      return;
    }

    const speciesInfo = getPetSpeciesInfo(game.pet.species);
    const isFavorite = speciesInfo.favoriteFoodIds.includes(food.id);
    const nextFastFoodStreak =
      food.category === 'fastFood' ? game.pet.consecutiveFastFood + 1 : 0;
    const outcome = resolveFeedingOutcome(
      food,
      game.pet.species,
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
        soundFX.petVoice(game.soundEnabled, game.pet.species);
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

    const now = new Date();
    const dateStr = formatLocalDate(now);
    const timeStr = formatLocalTime(now);
    const effectiveFavorite = outcome.isFavorite;
    const bonusMood = effectiveFavorite ? 6 : 0;
    const bonusGrowth = effectiveFavorite ? 4 : 0;
    const bonusIntimacy = effectiveFavorite ? 1 : 0;
    const isDessertOrFastFood =
      food.category === 'snack' || food.category === 'fastFood';

    setGame((prev) => {
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const newWeight = clampWeight(prev.pet.weight + food.weightGain);
      const actualDelta = roundWeight(newWeight - prev.pet.weight);
      const feedGainInfo = computeGrowthGain(food.growthGain + bonusGrowth, prev.pet);
      const nextGrowth = prev.pet.growth + feedGainInfo.total;
      const nextPersonality = isDessertOrFastFood
        ? applyPersonalityDevelopment(prev.personality, 'feed_dessert_fastfood')
            .nextPersonality
        : prev.personality;

      const newWeightLog: WeightLog = {
        id: `wlog_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
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
          detail: food.name,
          foodId: food.id,
        });
      } else if (effectiveFavorite) {
        nextDialogue = appendMemoryEvent(nextDialogue, {
          type: 'fedFavoriteFood',
          detail: food.name,
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

      const draftState: GameState = {
        ...prev,
        foods: {
          ...prev.foods,
          [food.id]: Math.max(0, (prev.foods[food.id] ?? 1) - 1),
        },
        pet: {
          ...prev.pet,
          hunger: clampStat(prev.pet.hunger + food.hunger, 0, 100),
          mood: clampStat(prev.pet.mood + food.mood + bonusMood, 0, 100),
          weight: newWeight,
          roundness: clampStat(prev.pet.roundness + food.roundness, 0, 100),
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth).level,
          intimacy: prev.pet.intimacy + 2 + bonusIntimacy,
          consecutiveFastFood: nextFastFoodStreak,
        },
        personality: nextPersonality,
        dialogue: nextDialogue,
        weightLogs: [newWeightLog, ...prev.weightLogs],
        feedLogs: [newFeedLog, ...prev.feedLogs],
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'feed_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
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

      nextMem = recordMemoryEntry(nextMem, {
        uniqueKey: `feed_first_food_${food.id}`,
        type: 'feeding',
        title: `第一次品嚐「${food.name}」`,
        description: `${nextMem.pet.name}首次吃下 ${food.emoji} ${food.name}，目前體重 ${newWeight.toFixed(1)} kg！`,
        emoji: food.emoji,
        foodId: food.id,
        weight: newWeight,
        level: nextMem.pet.level,
      });

      if (effectiveFavorite) {
        nextMem = recordMemoryEntry(nextMem, {
          uniqueKey: 'feed_first_favorite',
          type: 'feeding',
          title: `第一次吃到最愛料理！`,
          description: `${food.emoji} ${food.name}讓${nextMem.pet.name}眼睛發亮、開心轉圈圈！`,
          emoji: '💖',
          foodId: food.id,
          weight: newWeight,
          level: nextMem.pet.level,
        });
      }

      if (food.id === 'cheese_burger') {
        nextMem = recordMemoryEntry(nextMem, {
          uniqueKey: 'feed_first_burger',
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
          type: 'feeding',
          title: '第一次香脆薯條派對',
          description: `咔滋咔滋的金黃薯條，一根接著一根停不下來！`,
          emoji: '🍟',
          foodId: food.id,
          weight: newWeight,
        });
      }

      const nextRoundness = nextMem.pet.roundness;
      if (nextRoundness >= 40) {
        const tier = getRoundnessTier(nextRoundness);
        nextMem = recordMemoryEntry(nextMem, {
          uniqueKey:
            nextRoundness >= 85
              ? 'weight_round_85'
              : nextRoundness >= 65
              ? 'weight_round_65'
              : 'weight_round_40',
          type: 'weight',
          title: `體態成長為「${tier.label}」！`,
          description: `${nextMem.pet.name}吃得圓滾滾超療癒（目前體重 ${newWeight.toFixed(1)} kg）`,
          emoji: '⚖️',
          weight: newWeight,
        });
      }

      if (newWeight >= 8) {
        const milestoneKg = newWeight >= 16 ? 16 : newWeight >= 12 ? 12 : 8;
        nextMem = recordMemoryEntry(nextMem, {
          uniqueKey: `weight_milestone_${milestoneKg}`,
          type: 'weight',
          title: `體重突破 ${milestoneKg} kg 里程碑！`,
          description: `${nextMem.pet.name}健康幸福地長大中，目前 ${newWeight.toFixed(1)} kg！`,
          emoji: '🐷',
          weight: newWeight,
        });
      }

      return nextMem;
    });
  };

  const handleSleep = () => {
    soundFX.pop(game.soundEnabled);
    setTemporaryAction('sleeping', 2400);
    setSpeech('晚安… 睡飽飽更有精神！');
    pushFeedback('精力恢復中', '💤');

    setGame((prev) => {
      const gainInfo = computeGrowthGain(4, prev.pet);
      const nextGrowth = prev.pet.growth + gainInfo.total;
      const dev = applyPersonalityDevelopment(prev.personality, 'sleep');
      const nextDialogue = appendMemoryEvent(prev.dialogue, {
        type: 'slept',
        detail: '安心午睡',
      });
      return {
        ...prev,
        pet: {
          ...prev.pet,
          energy: clampStat(prev.pet.energy + 28, 0, 100),
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth, prev.pet.species).level,
        },
        personality: dev.nextPersonality,
        dialogue: nextDialogue,
      };
    });
  };

  const handleBath = () => {
    soundFX.bubble(game.soundEnabled);
    setTemporaryAction('bathing', 2200, 'shy');
    setSpeech('洗澎澎囉～全身香噴噴！');
    pushFeedback('香噴噴！', '🫧');

    setGame((prev) => {
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const gainInfo = computeGrowthGain(6, prev.pet);
      const nextGrowth = prev.pet.growth + gainInfo.total;
      const dev = applyPersonalityDevelopment(prev.personality, 'clean_or_bath');
      const nextDialogue = appendMemoryEvent(prev.dialogue, {
        type: 'bathed',
        detail: '香噴噴泡泡浴',
      });
      return {
        ...prev,
        pet: {
          ...prev.pet,
          cleanliness: clampStat(prev.pet.cleanliness + 35, 0, 100),
          mood: clampStat(prev.pet.mood + 6, 0, 100),
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth, prev.pet.species).level,
        },
        personality: dev.nextPersonality,
        dialogue: nextDialogue,
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'clean_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
      };
    });
  };

  const handleWalk = () => {
    const isSunny = game.dialogue.weather.condition === 'clear';
    soundFX.heart(game.soundEnabled);
    setTemporaryAction('walking', 1800, 'wink');
    setSpeech(
      isSunny
        ? '大晴天出來散步曬太陽，心情好到飛起來！'
        : '出來散步吹吹風，身體好輕鬆！'
    );
    pushFeedback(isSunny ? '晴天散步加成 +3 心情！' : '活力滿滿！', isSunny ? '☀️' : '🌿');

    setGame((prev) => {
      const gainInfo = computeGrowthGain(8, prev.pet);
      const nextGrowth = prev.pet.growth + gainInfo.total;
      const newWeight = clampWeight(prev.pet.weight - 0.1);
      const sunnyMoodBonus = prev.dialogue.weather.condition === 'clear' ? 3 : 0;
      const sunnyIntimacyBonus = prev.dialogue.weather.condition === 'clear' ? 1 : 0;
      const nextDialogue = appendMemoryEvent(prev.dialogue, {
        type: 'walked',
        detail: prev.dialogue.weather.condition === 'clear' ? '晴天外出散步' : '外出散步',
      });
      return {
        ...prev,
        pet: {
          ...prev.pet,
          mood: clampStat(prev.pet.mood + 12 + sunnyMoodBonus, 0, 100),
          energy: clampStat(prev.pet.energy + 10, 0, 100),
          hunger: clampStat(prev.pet.hunger - 6, 0, 100),
          weight: newWeight,
          roundness: clampStat(prev.pet.roundness - 8, 0, 100),
          consecutiveFastFood: 0,
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth, prev.pet.species).level,
          intimacy: prev.pet.intimacy + 1 + sunnyIntimacyBonus,
        },
        dialogue: nextDialogue,
        noviceGrowth: {
          ...prev.noviceGrowth,
          walkCount: prev.noviceGrowth.walkCount + 1,
        },
      };
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
    const expectedDurationMs = getExpectedCropDurationMs(
      durationMs,
      plantedAt,
      game.yardMoodBuffPeriods ?? []
    );
    const effectiveSec = Math.max(1, Math.round(expectedDurationMs / 1000));
    const isGolden = Math.random() < 0.1;

    if (hasFreeSeed) {
      setFreeSeeds((prev) => {
        const nextCount = Math.max(0, (prev[ingredientId] ?? 0) - 1);
        return { ...prev, [ingredientId]: nextCount };
      });
    }

    setGame((prev) => ({
      ...prev,
      coins: hasFreeSeed ? prev.coins : prev.coins - info.seedCost,
      farmPlots: prev.farmPlots.map((p) =>
        p.id === plotId
          ? { ...p, cropId: ingredientId, plantedAt, durationMs, watered: false, isGolden }
          : p
      ),
      noviceGrowth: {
        ...prev.noviceGrowth,
        plantedCarrotCount:
          prev.noviceGrowth.plantedCarrotCount + (ingredientId === 'carrot' ? 1 : 0),
      },
    }));
    const durationText = formatCropDurationLabel(effectiveSec);
    setSpeech(
      hasFreeSeed
        ? `用免費種子種下${info.name}囉，再等 ${durationText}就可以收成了！`
        : `種下${info.name}種子囉，再等 ${durationText}就可以收成了！`
    );
  };

  const handleWaterCrop = (plotId: number) => {
    const targetPlot = game.farmPlots.find((p) => p.id === plotId);
    if (!targetPlot || !targetPlot.cropId || targetPlot.plantedAt === null) return;
    if (targetPlot.watered) return;
    if (getCropGrowthState(targetPlot, Date.now(), game.yardMoodBuffPeriods ?? []).isReady) return;

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
    if (!getCropGrowthState(targetPlot, Date.now(), game.yardMoodBuffPeriods ?? []).isReady) return;

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

    const totalYield = getEffectiveHarvestYield(cropInfo.harvestYield, game.house);
    const nextQty = Math.min(storageCap, curQty + totalYield);
    const actualGain = Math.max(1, nextQty - curQty);
    const isGolden = Boolean(targetPlot.isGolden);
    const goldenCoinBonus = isGolden ? cropInfo.seedCost * 2 : 0;

    if (isGolden) {
      soundFX.levelUp(game.soundEnabled);
      triggerHaptic(25);
    } else {
      soundFX.heart(game.soundEnabled);
    }

    setGame((prev) => {
      const harvestedState: GameState = {
        ...prev,
        coins: prev.coins + goldenCoinBonus,
        ingredients: {
          ...prev.ingredients,
          [harvestedId]: Math.min(storageCap, (prev.ingredients[harvestedId] ?? 0) + totalYield),
        },
        farmPlots: prev.farmPlots.map((p) =>
          p.id === plotId
            ? { ...p, cropId: null, plantedAt: null, durationMs: 0, watered: false, isGolden: false }
            : p
        ),
      };
      let withMem = recordMonthlyActivity(harvestedState, {
        interactionLabel: '農場收成',
      });
      withMem = recordMemoryEntry(withMem, {
        uniqueKey: 'farm_harvest_first',
        type: 'farm',
        title: `第一次農場收成：${cropInfo.name}`,
        description: `親手種植的${cropInfo.name}成熟採收 +${actualGain}，食材小倉庫大豐收！`,
        emoji: cropInfo.emoji,
        weight: withMem.pet.weight,
      });
      return withMem;
    });

    if (isGolden) {
      pushFeedback(`大豐收！獲得雙倍金幣 +${goldenCoinBonus}`, '🌟');
      setSpeech(`大豐收！黃金${cropInfo.name}閃閃發光，獲得雙倍金幣 +${goldenCoinBonus} 🪙！`);
    } else {
      pushFeedback(`${cropInfo.name} +${actualGain}`, cropInfo.emoji);
      setSpeech(`採收了新鮮${cropInfo.name}！快去廚房做料理或手作家具吧～`);
    }
  };

  const handleWaterAllCrops = () => {
    const nowTs = Date.now();
    const buffs = game.yardMoodBuffPeriods ?? [];
    const targetPlots = game.farmPlots.filter(
      (p) =>
        p.cropId !== null &&
        p.plantedAt !== null &&
        !p.watered &&
        !getCropGrowthState(p, nowTs, buffs).isReady
    );
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
    const readyPlots = game.farmPlots.filter(
      (p) =>
        p.cropId !== null &&
        p.plantedAt !== null &&
        getCropGrowthState(p, nowTs, buffs).isReady
    );
    if (readyPlots.length === 0) return;

    const simIngredients: Record<IngredientId, number> = { ...game.ingredients };
    const harvestedIds = new Set<number>();
    let harvestedCount = 0;
    let skippedFullCount = 0;
    let totalGoldenCoins = 0;
    let firstHarvestedCropName = '';
    let firstHarvestedCropEmoji = '🌾';
    let firstHarvestedGain = 0;

    for (const plot of readyPlots) {
      if (!plot.cropId) continue;
      const cropInfo = INGREDIENTS[plot.cropId];
      const curQty = simIngredients[plot.cropId] ?? 0;
      if (curQty >= storageCap) {
        skippedFullCount += 1;
        continue;
      }
      const totalYield = getEffectiveHarvestYield(cropInfo.harvestYield, game.house);
      const nextQty = Math.min(storageCap, curQty + totalYield);
      const actualGain = Math.max(1, nextQty - curQty);
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
        const totalYield = getEffectiveHarvestYield(info.harvestYield, prev.house);
        nextIngredients[p.cropId] = Math.min(
          storageCap,
          (nextIngredients[p.cropId] ?? 0) + totalYield
        );
        if (p.isGolden) {
          coinBonus += info.seedCost * 2;
        }
      }

      const harvestedState: GameState = {
        ...prev,
        coins: prev.coins + coinBonus,
        ingredients: nextIngredients,
        farmPlots: prev.farmPlots.map((p) =>
          harvestedIds.has(p.id)
            ? { ...p, cropId: null, plantedAt: null, durationMs: 0, watered: false, isGolden: false }
            : p
        ),
      };
      let withMem = recordMonthlyActivity(harvestedState, {
        interactionLabel: '農場收成',
      });
      withMem = recordMemoryEntry(withMem, {
        uniqueKey: 'farm_harvest_first',
        type: 'farm',
        title: `第一次農場收成：${firstHarvestedCropName}`,
        description: `親手種植的${firstHarvestedCropName}成熟採收 +${firstHarvestedGain}，食材小倉庫大豐收！`,
        emoji: firstHarvestedCropEmoji,
        weight: withMem.pet.weight,
      });
      return withMem;
    });

    if (totalGoldenCoins > 0) {
      pushFeedback(`一鍵採收 ${harvestedCount} 塊 · 黃金金幣 +${totalGoldenCoins}`, '🌟');
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
        }！`
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
      const nextIngredients = { ...prev.ingredients };
      for (const [id, need] of reqEntries) {
        nextIngredients[id] = Math.max(0, (nextIngredients[id] ?? 0) - need);
      }
      const nextGrowth = prev.pet.growth + recipe.bonusGrowth;
      const nextCollectedFoods = prev.encyclopedia.collectedFoodIds.includes(recipe.outputFoodId)
        ? prev.encyclopedia.collectedFoodIds
        : [...prev.encyclopedia.collectedFoodIds, recipe.outputFoodId];
      const prevLearnedRecipes = prev.encyclopedia.learnedRecipeIds ?? [];
      const nextLearnedRecipes = prevLearnedRecipes.includes(recipe.id)
        ? prevLearnedRecipes
        : [...prevLearnedRecipes, recipe.id];

      const draftState: GameState = {
        ...prev,
        ingredients: nextIngredients,
        foods: {
          ...prev.foods,
          [recipe.outputFoodId]: (prev.foods[recipe.outputFoodId] ?? 0) + 1,
        },
        pet: {
          ...prev.pet,
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth).level,
        },
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
      let withMem = recordMonthlyActivity(syncedAcc, {
        interactionLabel: '廚房料理',
        growthDelta: recipe.bonusGrowth,
      });
      withMem = recordMemoryEntry(withMem, {
        uniqueKey: 'farm_cook_first',
        type: 'farm',
        title: `第一次料理合成：${recipe.name}`,
        description: `用新鮮農場作物親手完成美味的「${recipe.name}」！`,
        emoji: recipe.emoji,
        weight: withMem.pet.weight,
      });
      return withMem;
    });
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

    setGame((prev) => {
      const settled = settleMinigameOutcome(prev, result).nextState;
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
      return {
        ...settled,
        personality: nextPersonality,
        dialogue: nextDialogue,
      };
    });

    pushFeedback(`獲得 +${preview.reward.coins} 金幣`, '🪙');
    if (preview.reward.ingredientReward) {
      const ingInfo = INGREDIENTS[preview.reward.ingredientReward.id];
      pushFeedback(
        `${ingInfo.name} +${preview.reward.ingredientReward.qty}`,
        ingInfo.emoji
      );
    }
    setSpeech(
      `玩「${cfg.name}」拿了 ${result.score} 分，賺到 ${preview.reward.coins} 金幣好開心！`
    );

    return {
      result,
      reward: preview.reward,
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
    const currentlyEquipped = game.pet.accessories[item.slot] === item.id;
    const isEquipping = !currentlyEquipped;

    if (isEquipping) {
      const match = evaluateAccessoryPreference(
        game.personality,
        game.pet.species,
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
      const current = prev.pet.accessories[item.slot];
      const next = current === item.id ? null : item.id;
      let updated: GameState = {
        ...prev,
        pet: {
          ...prev.pet,
          accessories: {
            ...prev.pet.accessories,
            [item.slot]: next,
          },
        },
      };
      if (next) {
        updated = recordMonthlyActivity(updated, {
          interactionLabel: '穿搭換裝',
          accessoryId: item.id,
        });
        updated = recordMemoryEntry(updated, {
          uniqueKey: 'wardrobe_first_equip',
          type: 'wardrobe',
          title: `第一次穿戴配件：${item.name}`,
          description: `${prev.pet.name}戴上第一件專屬造型配件，可愛度爆表！`,
          emoji: item.emoji,
          accessoryId: item.id,
          weight: prev.pet.weight,
        });
        if (item.rarity !== 'common') {
          updated = recordMemoryEntry(updated, {
            uniqueKey: `wardrobe_rare_${item.id}`,
            type: 'wardrobe',
            title: `換上稀有造型「${item.name}」`,
            description: `閃閃發光的稀有配件登場，${prev.pet.name}成為全場焦點！`,
            emoji: item.emoji,
            accessoryId: item.id,
            weight: prev.pet.weight,
          });
        }
      }
      return updated;
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

    const stage = getGrowthStage(game.pet.growth);
    const canAutoEquip = stage.unlockedSlots.includes(item.slot);
    const match = evaluateAccessoryPreference(
      game.personality,
      game.pet.species,
      item
    );

    const draftState: GameState = {
      ...game,
      coins: game.coins - item.price,
      accessories: [...game.accessories, item.id],
      pet: {
        ...game.pet,
        accessories: canAutoEquip
          ? { ...game.pet.accessories, [item.slot]: item.id }
          : game.pet.accessories,
      },
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
    if (canAutoEquip) {
      nextBought = recordMonthlyActivity(nextBought, {
        interactionLabel: '穿搭換裝',
        accessoryId: item.id,
      });
      nextBought = recordMemoryEntry(nextBought, {
        uniqueKey: 'wardrobe_first_equip',
        type: 'wardrobe',
        title: `第一次穿戴配件：${item.name}`,
        description: `${nextBought.pet.name}戴上第一件專屬造型配件，可愛度爆表！`,
        emoji: item.emoji,
        accessoryId: item.id,
        weight: nextBought.pet.weight,
      });
      if (item.rarity !== 'common') {
        nextBought = recordMemoryEntry(nextBought, {
          uniqueKey: `wardrobe_rare_${item.id}`,
          type: 'wardrobe',
          title: `收藏並穿戴「${item.name}」`,
          description: `獲得進階限定造型「${item.name}」，穿搭圖鑑更豐富啦！`,
          emoji: item.emoji,
          accessoryId: item.id,
          weight: nextBought.pet.weight,
        });
      }
    }
    if (item.rarity === 'event') {
      nextBought = recordMemoryEntry(nextBought, {
        uniqueKey: `festival_acc_${item.id}`,
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
    setGame(nextBought);

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
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const delta = roundWeight(boundedWeight - prev.pet.weight);
      const nextGrowth = prev.pet.growth + 6;

      const newWeightLog: WeightLog = {
        id: `wlog_${Date.now()}`,
        date: formatLocalDate(now),
        weight: boundedWeight,
        foodName: '手動紀錄',
        note: note || '在成長手帳更新體重紀錄',
        weightDelta: delta,
        timeStr: formatLocalTime(now),
        timestamp: now.getTime(),
      };

      const updated: GameState = {
        ...prev,
        pet: {
          ...prev.pet,
          weight: boundedWeight,
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth).level,
        },
        dialogue: appendMemoryEvent(prev.dialogue, {
          type: 'weightLogged',
          detail: `${boundedWeight.toFixed(1)} kg`,
        }),
        weightLogs: [newWeightLog, ...prev.weightLogs],
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'weigh_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
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
      withMem = recordMemoryEntry(withMem, {
        uniqueKey: 'weight_first_manual',
        type: 'weight',
        title: `第一次記錄體重：${boundedWeight.toFixed(1)} kg`,
        description: `在成長手帳仔細量測體重，守護 ${prev.pet.name} 健康長大！`,
        emoji: '⚖️',
        weight: boundedWeight,
        level: withMem.pet.level,
      });
      if (boundedWeight >= 8) {
        const milestoneKg = boundedWeight >= 16 ? 16 : boundedWeight >= 12 ? 12 : 8;
        withMem = recordMemoryEntry(withMem, {
          uniqueKey: `weight_milestone_${milestoneKg}`,
          type: 'weight',
          title: `體重突破 ${milestoneKg} kg 里程碑！`,
          description: `${prev.pet.name}目前體重 ${boundedWeight.toFixed(1)} kg，幸福成長中！`,
          emoji: '🐷',
          weight: boundedWeight,
        });
      }
      return withMem;
    });
  };

  const handleClaimTask = (taskId: string) => {
    soundFX.levelUp(game.soundEnabled);

    setGame((prev) => {
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const targetTask = synced.dailyTasks.find((t) => t.id === taskId);
      if (!targetTask || targetTask.claimed || !targetTask.completed) {
        return prev;
      }

      const nextGrowth = prev.pet.growth + 15;
      const updatedTasks = synced.dailyTasks.map((t) =>
        t.id === taskId ? { ...t, claimed: true } : t
      );

      const draftState: GameState = {
        ...prev,
        coins: prev.coins + targetTask.reward.coins,
        foods: {
          ...prev.foods,
          [targetTask.reward.foodId]:
            (prev.foods[targetTask.reward.foodId] ?? 0) + targetTask.reward.foodQty,
        },
        pet: {
          ...prev.pet,
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth).level,
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
      return finalNovice;
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
      applyCloudStateLocally(
        res.state,
        `成功加入！一起來照顧${res.state.pet.name}吧！`
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
    stickerId: PetStickerId | null
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
        let updated: GameState = {
          ...prev,
          personality: applyPersonalityDevelopment(prev.personality, 'pet_or_message')
            .nextPersonality,
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
      content: cleanText,
      stickerId,
      createdAt: Date.now(),
    };

    setGame((prev) => {
      const updated: GameState = {
        ...prev,
        messages: [...prev.messages, localMsg].slice(-80),
        personality: applyPersonalityDevelopment(prev.personality, 'pet_or_message')
          .nextPersonality,
      };
      return recordMonthlyActivity(updated, {
        coopMessageDelta: 1,
        interactionLabel: '留言互動',
      });
    });
    soundFX.heart(game.soundEnabled);
    if (stickerInfo) {
      setSpeech(stickerInfo.caption);
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

      if (newCollectedId) {
        const buyName = ROOM_ITEM_BY_ID[newCollectedId]?.name ?? '新家具';
        next = recordMemoryEntry(next, {
          uniqueKey: 'room_first_buy',
          type: 'room',
          title: `第一次購買家具：${buyName}`,
          description: `為 ${next.pet.name} 的小屋添購「${buyName}」，空間越來越溫馨！`,
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

      if (newPlaced) {
        const placeName = ROOM_ITEM_BY_ID[newPlaced.itemId]?.name ?? '新家具';
        next = recordMemoryEntry(next, {
          uniqueKey: 'room_first_place',
          type: 'room',
          title: `第一次放置家具：${placeName}`,
          description: `把「${placeName}」擺進寵物房間裡，${next.pet.name}開心地逛起新角落！`,
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
          type: 'room',
          title: `拍下「${newPhoto.title}」`,
          description: `在房間留下的溫馨合照（當時體重 ${next.pet.weight.toFixed(1)} kg）`,
          emoji: '📸',
          photoId: newPhoto.id,
          weight: next.pet.weight,
          level: next.pet.level,
        });
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
    const res = harvestCoopCropToWarehouse(
      gameRef.current,
      plotId,
      currentUserId,
      actorName
    );
    if (res.ok) {
      soundFX.heart(game.soundEnabled);
      setGame(res.nextState);
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
      let next = recordMonthlyActivity(res.nextState, {
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
    prevStageLevelRef.current = getGrowthStage(fresh.pet.growth, fresh.pet.species).level;
    prevPrestigeStarsRef.current = getPrestigeStarInfo(fresh.pet.growth).stars;
    prevMilestonesCountRef.current = fresh.encyclopedia.claimedAccessoryMilestones.length;
    prevTitlesCountRef.current = fresh.encyclopedia.unlockedTitles.length;
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
    setResetModalOpen(false);
  };

  const handleSharePhotoToBoard = async (
    photo: RoomPhotoRecord,
    caption: string
  ): Promise<string | null> => {
    const cleanCaption = caption.trim() || photo.title;
    return handleSendMessage(`${cleanCaption} [photo:${photo.id}]`, null);
  };

  const handleOpenScenePhoto = (scene: PhotoScene = 'wardrobe') => {
    setWardrobePhotoScene(scene);
    setWardrobePhotoOpen(true);
  };

  const handleSaveWardrobePhoto = (params: {
    title: string;
    caption: string;
    scene: PhotoScene;
    poseId: PhotoPose;
    facing?: PetViewDirection;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }): RoomPhotoRecord => {
    soundFX.heart(game.soundEnabled);
    const { nextState, photo } = saveScenePhoto(gameRef.current, params);
    setGame(nextState);
    pushFeedback('已儲存寫真到照片牆！', '📸');
    return photo;
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

  const activeMessages = sharedRoom ? sharedMessages : game.messages;
  const latestMessage =
    activeMessages.length > 0 ? activeMessages[activeMessages.length - 1] : null;

  const noviceEval = evaluateAllNoviceDays(game, Boolean(sharedRoom));
  const claimableQuestsCount =
    game.dailyTasks.filter((t) => t.completed && !t.claimed).length +
    noviceEval.claimableCount;

  const unclaimedCoopRewardsCount = game.coop.pendingRewards.filter(
    (r) => !r.claimedByUserIds.includes(currentUserId)
  ).length;
  const offlinePartnerEventsCount = getOfflinePartnerEvents(
    game.coop,
    currentUserId
  ).length;
  const coopBadgeCount = unclaimedCoopRewardsCount + offlinePartnerEventsCount;
  const [farmClockNow, setFarmClockNow] = useState<number>(() => Date.now());
  const hasGrowingUnreadyCrops = game.farmPlots.some(
    (p) =>
      p.cropId !== null &&
      !getCropGrowthState(p, farmClockNow, game.yardMoodBuffPeriods ?? []).isReady
  );

  useEffect(() => {
    if (!hasGrowingUnreadyCrops) return;
    setFarmClockNow(Date.now());
    const timer = window.setInterval(() => {
      setFarmClockNow(Date.now());
    }, 2000);
    return () => window.clearInterval(timer);
  }, [hasGrowingUnreadyCrops]);

  const readyCropsCount = game.farmPlots.filter(
    (p) =>
      p.cropId !== null &&
      getCropGrowthState(p, farmClockNow, game.yardMoodBuffPeriods ?? []).isReady
  ).length;

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
        {!game.pet.hatched ? (
          <>
            <PWAUpdateBanner
              show={showUpdateBanner}
              updating={updatingApp}
              onUpdate={() => void handleApplyAppUpdate()}
              onDismiss={handleDismissAppUpdate}
              stickyClassName="sticky top-2 z-40"
            />
            <IntroHatching
              defaultName={game.pet.name}
              defaultSpecies={game.pet.species}
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
                  pet={game.pet}
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
                  personality={game.personality}
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
                />
              )}

              {activeTab === 'canteen' && (
                <CanteenView
                  pet={game.pet}
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
                />
              )}

              {activeTab === 'wardrobe' && (
                <WardrobeView
                  pet={game.pet}
                  personality={game.personality}
                  coins={game.coins}
                  unlockedAccessories={game.accessories}
                  onToggleEquip={handleToggleEquip}
                  onBuyAccessory={handleBuyAccessory}
                  onChangeSpecies={handleChangeSpecies}
                  onOpenPhotoStudio={() => handleOpenScenePhoto('wardrobe')}
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
                    setJournalEncyclopediaSection('house');
                    setActiveTab('journal');
                  }}
                  onGoToFarm={() => {
                    setCanteenInitialSection('farm');
                    setActiveTab('canteen');
                  }}
                  onSharePhotoToBoard={handleSharePhotoToBoard}
                  onTogglePhotoLike={handleTogglePhotoLike}
                  onAddPhotoComment={handleAddPhotoComment}
                  onOpenShareCard={(payload) => setShareCardPayload(payload)}
                />
              )}

              {activeTab === 'journal' && (
                <JournalView
                  pet={game.pet}
                  personality={game.personality}
                  weightLogs={game.weightLogs}
                  onRecordWeight={handleRecordWeight}
                  onRequestReset={() => setResetModalOpen(true)}
                  cloudUser={cloudUser}
                  syncStatus={syncStatus}
                  onOpenCloudAuth={() => setAuthModalOpen(true)}
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
                  onOpenShareCard={(payload) => setShareCardPayload(payload)}
                  onSaveMonthlyRecap={handleSaveMonthlyRecap}
                  onShareRecapToBoard={handleShareRecapToBoard}
                  onShareTextToBoard={handleShareCoopCardToBoard}
                  onGoToKitchen={() => {
                    setCanteenInitialSection('kitchen');
                    setActiveTab('canteen');
                  }}
                />
              )}

              {activeTab === 'quests' && (
                <QuestsView
                  dailyTasks={game.dailyTasks}
                  dateStr={game.dailyTasksDate}
                  onClaimTask={handleClaimTask}
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
                  setJournalEncyclopediaSection('foods');
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
              pet={game.pet}
              onClose={() => {
                setLevelUpStage(null);
                setLevelUpPrestigeStar(null);
                setLevelUpRewardText(null);
              }}
              onTakeGrowthPhoto={() => {
                setWardrobePhotoScene('album');
                setWardrobePhotoOpen(true);
              }}
            />

            <GrowthRoadmapModal
              open={growthRoadmapOpen}
              pet={game.pet}
              onClose={() => setGrowthRoadmapOpen(false)}
            />

            <ResetConfirmModal
              open={resetModalOpen}
              petName={game.pet.name}
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
          localPetName={game.pet.name}
          localPetLevel={game.pet.level}
          localPetWeight={game.pet.weight}
          localHatched={game.pet.hatched}
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
          localPetName={game.pet.name}
          localHatched={game.pet.hatched}
          onOpenCloudAuth={() => setAuthModalOpen(true)}
          onCreateSharedRoom={handleCreateSharedRoom}
          onJoinSharedRoom={handleJoinSharedRoom}
          onRegenerateInviteCode={handleRegenerateInviteCode}
          onLeaveSharedRoom={handleLeaveSharedRoom}
          onRefreshSharedRoom={handleRefreshSharedRoom}
          onOpenCoopGames={() => setCoopModalOpen(true)}
        />

        <MessageBoardModal
          open={messageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          petName={game.pet.name}
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
        />

        <MinigameHubModal
          open={minigameOpen}
          onClose={() => setMinigameOpen(false)}
          pet={game.pet}
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
          pet={game.pet}
          personality={game.personality}
        />

        <WardrobePhotoModal
          open={wardrobePhotoOpen}
          onClose={() => setWardrobePhotoOpen(false)}
          pet={game.pet}
          sharedRoom={sharedRoom}
          initialScene={wardrobePhotoScene}
          unlockedPoses={game.memoryAlbum.unlockedPhotoPoses}
          unlockedFrames={game.memoryAlbum.unlockedPhotoFrames}
          onSavePhoto={handleSaveWardrobePhoto}
          onSharePhotoToBoard={handleSharePhotoToBoard}
        />

        <DialogueHistoryModal
          open={dialogueHistoryOpen}
          onClose={() => setDialogueHistoryOpen(false)}
          pet={game.pet}
          dialogue={game.dialogue}
          onUpdateSettings={handleUpdateDialogueSettings}
          savedDialogueIds={game.memoryAlbum.savedDialogueIds}
          onSaveDialogueToMemory={handleSaveDialogueToMemory}
        />

        <MemoryDetailModal
          open={Boolean(selectedMemoryEntry)}
          onClose={() => setSelectedMemoryEntry(null)}
          memory={selectedMemoryEntry}
          pet={game.pet}
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
          onOpenShareCard={(payload) => setShareCardPayload(payload)}
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
        />
      </div>
    </div>
  );
}
