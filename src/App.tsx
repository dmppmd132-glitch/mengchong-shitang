import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Cloud, Coins, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { AuthSyncModal } from './components/AuthSyncModal';
import { BottomTabBar } from './components/BottomTabBar';
import { CanteenView } from './components/CanteenView';
import { HomeView } from './components/HomeView';
import { IntroHatching } from './components/IntroHatching';
import { JournalView } from './components/JournalView';
import { LevelUpModal } from './components/LevelUpModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { QuestsView } from './components/QuestsView';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { SharedPetModal } from './components/SharedPetModal';
import { WardrobeView } from './components/WardrobeView';
import { FOOD_CATEGORY_LABELS } from './data/foods';
import { getGrowthStage } from './data/growth';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  fetchCloudSave,
  signOutCloud,
  upsertCloudSave,
} from './services/cloudSync';
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
  FeedLog,
  FloatingFeedback,
  Food,
  GameState,
  GrowthStageInfo,
  PiggyActionState,
  SharedPetRoom,
  TabKey,
  WeightLog,
} from './types';
import { soundFX } from './utils/sound';
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
  const [actionState, setActionState] = useState<PiggyActionState>('idle');
  const [flyingFoodEmoji, setFlyingFoodEmoji] = useState<string | null>(null);
  const [speech, setSpeech] = useState<string>('今天也想吃好吃的！');
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [levelUpStage, setLevelUpStage] = useState<GrowthStageInfo | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('local');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [sharedModalOpen, setSharedModalOpen] = useState<boolean>(false);
  const [pendingCloudSave, setPendingCloudSave] = useState<CloudSavePayload | null>(null);
  const [sharedRoom, setSharedRoom] = useState<SharedPetRoom | null>(null);

  const actionTimerRef = useRef<number | null>(null);
  const feedPhaseTimerRef = useRef<number | null>(null);
  const prevStageLevelRef = useRef<number>(getGrowthStage(game.pet.growth).level);
  const gameRef = useRef<GameState>(game);
  const skipNextCloudUploadRef = useRef<boolean>(false);
  const lastHandledUserIdRef = useRef<string | null>(null);
  const lastSharedUpdatedAtRef = useRef<string | null>(null);

  gameRef.current = game;

  useEffect(() => {
    saveGameState(game);
  }, [game]);

  const applyCloudStateLocally = useCallback((cloudState: GameState, customSpeech?: string) => {
    skipNextCloudUploadRef.current = true;
    prevStageLevelRef.current = getGrowthStage(cloudState.pet.growth).level;
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
        applyCloudStateLocally(remoteState, `夥伴剛剛照顧了${remoteState.pet.name}！`);
        const fbId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        setFeedbacks((prev) => [...prev.slice(-4), { id: fbId, text: '夥伴剛更新了小豬！', emoji: '💞' }]);
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
          applyCloudStateLocally(res.state);
        }
      });
    };

    window.addEventListener('focus', handleResumeSync);
    window.addEventListener('online', handleResumeSync);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleResumeSync);
      window.removeEventListener('online', handleResumeSync);
    };
  }, [cloudUser, sharedRoom?.id, applyCloudStateLocally]);

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

    const delayMs = sharedRoom ? 800 : 1500;
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
    const currentStage = getGrowthStage(game.pet.growth);
    if (currentStage.level > prevStageLevelRef.current) {
      soundFX.levelUp(game.soundEnabled);
      setLevelUpStage(currentStage);
    }
    prevStageLevelRef.current = currentStage.level;
  }, [game.pet.growth, game.soundEnabled]);

  useEffect(() => {
    if (!game.pet.hatched) return;
    const timer = window.setInterval(() => {
      setGame((prev) => {
        const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
        return {
          ...prev,
          dailyTasks: synced.dailyTasks,
          dailyTasksDate: synced.dailyTasksDate,
          pet: applyTimeDecay(prev.pet, 20000),
        };
      });
    }, 20000);
    return () => window.clearInterval(timer);
  }, [game.pet.hatched]);

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

  const setTemporaryAction = (nextAction: PiggyActionState, durationMs = 1500) => {
    clearAnimationTimers();
    setFlyingFoodEmoji(null);
    setActionState(nextAction);
    actionTimerRef.current = window.setTimeout(() => {
      setActionState('idle');
    }, durationMs);
  };

  const pushFeedback = (text: string, emoji?: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setFeedbacks((prev) => [...prev.slice(-4), { id, text, emoji }]);
    window.setTimeout(() => {
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
    }, 1250);
  };

  const handleHatchComplete = (petName: string) => {
    const now = new Date();
    const initialWeightLog: WeightLog = {
      id: `wlog_${Date.now()}`,
      date: formatLocalDate(now),
      weight: game.pet.weight,
      foodName: '破殼報到',
      note: `${petName} 來到萌寵食堂的第一天！`,
      weightDelta: 0,
      timeStr: formatLocalTime(now),
      timestamp: now.getTime(),
    };
    setGame((prev) => ({
      ...prev,
      pet: {
        ...prev.pet,
        name: petName,
        hatched: true,
      },
      weightLogs: [initialWeightLog, ...prev.weightLogs],
    }));
    setSpeech(`嗨～我是${petName}，請多多指教！`);
  };

  const handlePet = () => {
    soundFX.heart(game.soundEnabled);
    setTemporaryAction('petted', 950);
    pushFeedback('好喜歡摸摸！', '🩷');
    setSpeech('呼嚕呼嚕～好舒服喔！');

    setGame((prev) => {
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const nextGrowth = prev.pet.growth + 5;
      return {
        ...prev,
        pet: {
          ...prev.pet,
          mood: clampStat(prev.pet.mood + 6, 0, 100),
          intimacy: prev.pet.intimacy + 2,
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth).level,
        },
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'pet_3', 1),
        dailyTasksDate: synced.dailyTasksDate,
      };
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
      pushFeedback(fullMessage, '🐷');
      return;
    }

    const nextFastFoodStreak =
      food.category === 'fastFood' ? game.pet.consecutiveFastFood + 1 : 0;

    // Phase 1: Food flies toward piggy + piggy opens mouth
    clearAnimationTimers();
    setFlyingFoodEmoji(food.emoji);
    setActionState('opening');
    soundFX.pop(game.soundEnabled);

    // Phase 2: Piggy chews + hearts appear
    feedPhaseTimerRef.current = window.setTimeout(() => {
      setFlyingFoodEmoji(null);
      soundFX.chew(game.soundEnabled);

      if (nextFastFoodStreak >= 3) {
        setActionState('stuffed');
        setSpeech('有點撐了… 要不要帶我去散步呢？');
        pushFeedback('有點撐了…', '💦');
      } else {
        setActionState('eating');
        setSpeech(`${food.name}好好吃喔！幸福～`);
        pushFeedback('好吃！', '💖');
      }

      actionTimerRef.current = window.setTimeout(() => {
        setActionState('idle');
      }, 1350);
    }, 480);

    const now = new Date();
    const dateStr = formatLocalDate(now);
    const timeStr = formatLocalTime(now);

    setGame((prev) => {
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const newWeight = clampWeight(prev.pet.weight + food.weightGain);
      const actualDelta = roundWeight(newWeight - prev.pet.weight);
      const nextGrowth = prev.pet.growth + food.growthGain;

      const newWeightLog: WeightLog = {
        id: `wlog_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        date: dateStr,
        weight: newWeight,
        foodName: food.name,
        note:
          nextFastFoodStreak >= 3
            ? '連吃三次速食，肚子圓鼓鼓建議散步'
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

      return {
        ...prev,
        foods: {
          ...prev.foods,
          [food.id]: Math.max(0, (prev.foods[food.id] ?? 1) - 1),
        },
        pet: {
          ...prev.pet,
          hunger: clampStat(prev.pet.hunger + food.hunger, 0, 100),
          mood: clampStat(prev.pet.mood + food.mood, 0, 100),
          weight: newWeight,
          roundness: clampStat(prev.pet.roundness + food.roundness, 0, 100),
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth).level,
          intimacy: prev.pet.intimacy + 2,
          consecutiveFastFood: nextFastFoodStreak,
        },
        weightLogs: [newWeightLog, ...prev.weightLogs],
        feedLogs: [newFeedLog, ...prev.feedLogs],
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'feed_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
      };
    });
  };

  const handleSleep = () => {
    soundFX.pop(game.soundEnabled);
    setTemporaryAction('sleeping', 2400);
    setSpeech('晚安… 睡飽飽更有精神！');
    pushFeedback('精力恢復中', '💤');

    setGame((prev) => {
      const nextGrowth = prev.pet.growth + 4;
      return {
        ...prev,
        pet: {
          ...prev.pet,
          energy: clampStat(prev.pet.energy + 28, 0, 100),
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth).level,
        },
      };
    });
  };

  const handleBath = () => {
    soundFX.bubble(game.soundEnabled);
    setTemporaryAction('bathing', 2200);
    setSpeech('洗澎澎囉～全身香噴噴！');
    pushFeedback('香噴噴！', '🫧');

    setGame((prev) => {
      const synced = syncDailyTasks(prev.dailyTasks, prev.dailyTasksDate);
      const nextGrowth = prev.pet.growth + 6;
      return {
        ...prev,
        pet: {
          ...prev.pet,
          cleanliness: clampStat(prev.pet.cleanliness + 35, 0, 100),
          mood: clampStat(prev.pet.mood + 6, 0, 100),
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth).level,
        },
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'clean_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
      };
    });
  };

  const handleWalk = () => {
    soundFX.heart(game.soundEnabled);
    setTemporaryAction('walking', 1800);
    setSpeech('出來散步吹吹風，身體好輕鬆！');
    pushFeedback('活力滿滿！', '🌿');

    setGame((prev) => {
      const nextGrowth = prev.pet.growth + 8;
      const newWeight = clampWeight(prev.pet.weight - 0.1);
      return {
        ...prev,
        pet: {
          ...prev.pet,
          mood: clampStat(prev.pet.mood + 12, 0, 100),
          energy: clampStat(prev.pet.energy + 10, 0, 100),
          hunger: clampStat(prev.pet.hunger - 6, 0, 100),
          weight: newWeight,
          roundness: clampStat(prev.pet.roundness - 8, 0, 100),
          consecutiveFastFood: 0,
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth).level,
          intimacy: prev.pet.intimacy + 1,
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

  const handleToggleEquip = (item: Accessory) => {
    soundFX.pop(game.soundEnabled);
    setGame((prev) => {
      const current = prev.pet.accessories[item.slot];
      const next = current === item.id ? null : item.id;
      return {
        ...prev,
        pet: {
          ...prev.pet,
          accessories: {
            ...prev.pet.accessories,
            [item.slot]: next,
          },
        },
      };
    });
  };

  const handleBuyAccessory = (item: Accessory) => {
    if (game.coins < item.price || game.accessories.includes(item.id)) return;
    soundFX.levelUp(game.soundEnabled);
    setGame((prev) => {
      const stage = getGrowthStage(prev.pet.growth);
      const canAutoEquip = stage.unlockedSlots.includes(item.slot);
      return {
        ...prev,
        coins: prev.coins - item.price,
        accessories: [...prev.accessories, item.id],
        pet: {
          ...prev.pet,
          accessories: canAutoEquip
            ? { ...prev.pet.accessories, [item.slot]: item.id }
            : prev.pet.accessories,
        },
      };
    });
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

      return {
        ...prev,
        pet: {
          ...prev.pet,
          weight: boundedWeight,
          growth: nextGrowth,
          level: getGrowthStage(nextGrowth).level,
        },
        weightLogs: [newWeightLog, ...prev.weightLogs],
        dailyTasks: incrementTaskProgress(synced.dailyTasks, 'weigh_1', 1),
        dailyTasksDate: synced.dailyTasksDate,
      };
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

      return {
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
      };
    });
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

  const handleConfirmReset = () => {
    clearAnimationTimers();
    if (sharedRoom) {
      const leavingRoomId = sharedRoom.id;
      lastSharedUpdatedAtRef.current = null;
      setSharedRoom(null);
      void leaveSharedPetRoom(leavingRoomId);
    }
    const fresh = resetGameState();
    prevStageLevelRef.current = getGrowthStage(fresh.pet.growth).level;
    setGame(fresh);
    setActiveTab('home');
    setActionState('idle');
    setFlyingFoodEmoji(null);
    setSpeech('今天也想吃好吃的！');
    setFeedbacks([]);
    setLevelUpStage(null);
    setResetModalOpen(false);
  };

  const claimableQuestsCount = game.dailyTasks.filter(
    (t) => t.completed && !t.claimed
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
    <div className="min-h-dvh w-full bg-[#FBECE3] flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[430px] min-h-dvh bg-[#FFF8ED] shadow-2xl relative flex flex-col overflow-x-hidden">
        {!game.pet.hatched ? (
          <IntroHatching
            defaultName={game.pet.name}
            onComplete={handleHatchComplete}
            onEggTapSound={() => soundFX.pop(game.soundEnabled)}
            onHatchSound={() => soundFX.hatch(game.soundEnabled)}
            onOpenCloudAuth={() => setAuthModalOpen(true)}
            onOpenSharedPet={() => setSharedModalOpen(true)}
          />
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
                  onClick={() => setResetModalOpen(true)}
                  aria-label="重置遊戲"
                  title="重置遊戲"
                  className="min-h-[38px] min-w-[38px] rounded-xl bg-[#FFE9EF] text-[#C4315B] flex items-center justify-center hover:bg-[#FFD9E3] transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </header>

            <OfflineIndicator />

            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              {activeTab === 'home' && (
                <HomeView
                  pet={game.pet}
                  action={actionState}
                  flyingFoodEmoji={flyingFoodEmoji}
                  speech={speech}
                  feedbacks={feedbacks}
                  inventory={game.foods}
                  onPet={handlePet}
                  onFeed={handleFeed}
                  onSleep={handleSleep}
                  onBath={handleBath}
                  onWalk={handleWalk}
                  onGoToCanteen={() => setActiveTab('canteen')}
                  sharedRoom={sharedRoom}
                  currentUserId={cloudUser?.id ?? null}
                  onOpenSharedPet={() => setSharedModalOpen(true)}
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
                  onFeed={handleFeed}
                  onBuyFood={handleBuyFood}
                />
              )}

              {activeTab === 'wardrobe' && (
                <WardrobeView
                  pet={game.pet}
                  coins={game.coins}
                  unlockedAccessories={game.accessories}
                  onToggleEquip={handleToggleEquip}
                  onBuyAccessory={handleBuyAccessory}
                />
              )}

              {activeTab === 'journal' && (
                <JournalView
                  pet={game.pet}
                  weightLogs={game.weightLogs}
                  onRecordWeight={handleRecordWeight}
                  onRequestReset={() => setResetModalOpen(true)}
                  cloudUser={cloudUser}
                  syncStatus={syncStatus}
                  onOpenCloudAuth={() => setAuthModalOpen(true)}
                  sharedRoom={sharedRoom}
                  onOpenSharedPet={() => setSharedModalOpen(true)}
                />
              )}

              {activeTab === 'quests' && (
                <QuestsView
                  dailyTasks={game.dailyTasks}
                  dateStr={game.dailyTasksDate}
                  onClaimTask={handleClaimTask}
                />
              )}
            </main>

            <BottomTabBar
              activeTab={activeTab}
              onChange={setActiveTab}
              claimableQuestsCount={claimableQuestsCount}
            />

            <LevelUpModal
              stage={levelUpStage}
              petName={game.pet.name}
              onClose={() => setLevelUpStage(null)}
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
        />
      </div>
    </div>
  );
}
