import React, { useEffect, useRef, useState } from 'react';
import { Coins, RotateCcw, Volume2, VolumeX } from 'lucide-react';
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
import { WardrobeView } from './components/WardrobeView';
import { FOOD_CATEGORY_LABELS } from './data/foods';
import { getGrowthStage } from './data/growth';
import {
  Accessory,
  FeedLog,
  FloatingFeedback,
  Food,
  GameState,
  GrowthStageInfo,
  PiggyActionState,
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

  const actionTimerRef = useRef<number | null>(null);
  const feedPhaseTimerRef = useRef<number | null>(null);
  const prevStageLevelRef = useRef<number>(getGrowthStage(game.pet.growth).level);

  useEffect(() => {
    saveGameState(game);
  }, [game]);

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

  const handleConfirmReset = () => {
    clearAnimationTimers();
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

  return (
    <div className="min-h-dvh w-full bg-[#FBECE3] flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[430px] min-h-dvh bg-[#FFF8ED] shadow-2xl relative flex flex-col overflow-x-hidden">
        {!game.pet.hatched ? (
          <IntroHatching
            defaultName={game.pet.name}
            onComplete={handleHatchComplete}
            onEggTapSound={() => soundFX.pop(game.soundEnabled)}
            onHatchSound={() => soundFX.hatch(game.soundEnabled)}
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
      </div>
    </div>
  );
}
