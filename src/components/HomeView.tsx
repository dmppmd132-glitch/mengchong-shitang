import React, { useEffect, useRef, useState } from 'react';
import {
  Bath,
  BookHeart,
  FlipHorizontal2,
  Footprints,
  Gamepad2,
  Heart,
  HeartHandshake,
  MessageCircleHeart,
  MessageSquareText,
  Moon,
  Sparkles,
  Sprout,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { getTitleDefinition } from '../data/encyclopedia';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS, FOODS } from '../data/foods';
import {
  getGrowthRemaining,
  getRoundnessTier,
  isCareBalanced,
} from '../data/growth';
import { STAGE_BACKGROUNDS } from '../data/noviceGrowth';
import { getPetSpeciesInfo } from '../data/species';
import { getStickerById } from '../data/stickers';
import {
  DialogueLine,
  FeedingVisualEffect,
  FloatingFeedback,
  Food,
  FoodCategory,
  Pet,
  PetExpression,
  PetMessage,
  PetPersonality,
  PetTouchZone,
  PetViewDirection,
  PiggyActionState,
  SharedHouse,
  SharedPetRoom,
  StageBackgroundId,
  TitleId,
  WeatherState,
} from '../types';
import { evaluateFoodPreference, getPersonalitySummaryLabel } from '../utils/personality';
import { PetDialogueBubble } from './dialogue/PetDialogueBubble';
import { HomeHousePreview } from './house/HomeHousePreview';
import { HouseSubTab } from './house/HouseView';
import { PiggyCharacter } from './PiggyCharacter';

interface HomeViewProps {
  pet: Pet;
  action: PiggyActionState;
  expression?: PetExpression;
  flyingFoodEmoji: string | null;
  feedEffect?: FeedingVisualEffect;
  feedParticles?: string[];
  speech: string;
  feedbacks: FloatingFeedback[];
  inventory: Record<string, number>;
  onPet: (zone: PetTouchZone) => void;
  onFeed: (food: Food) => void;
  onSleep: () => void;
  onBath: () => void;
  onWalk: () => void;
  onGoToCanteen: () => void;
  onOpenMinigame?: () => void;
  onOpenHouse?: (tab?: HouseSubTab) => void;
  house?: SharedHouse;
  onOpenNoviceGrowth?: () => void;
  noviceClaimableCount?: number;
  activeTitle?: TitleId | null;
  activeBackground?: StageBackgroundId;
  unlockedBackgrounds?: StageBackgroundId[];
  onSelectBackground?: (bg: StageBackgroundId) => void;
  sharedRoom?: SharedPetRoom | null;
  currentUserId?: string | null;
  onOpenSharedPet?: () => void;
  latestMessage?: PetMessage | null;
  unreadMessagesCount?: number;
  onOpenMessageBoard?: () => void;
  personality?: PetPersonality;
  onOpenPersonality?: () => void;
  onOpenCoopGames?: () => void;
  coopBadgeCount?: number;
  activeDialogue?: DialogueLine | null;
  weather?: WeatherState;
  dialogueHistoryCount?: number;
  onRespondDialogue?: (responseId: string) => void;
  onDismissDialogue?: () => void;
  onOpenDialogueHistory?: () => void;
  savedDialogueIds?: string[];
  onSaveDialogueToMemory?: (line: DialogueLine) => void;
  onOpenMemories?: () => void;
  onOpenGrowthRoadmap?: () => void;
}

type PetStatKey = 'hunger' | 'mood' | 'cleanliness' | 'energy';

const STAT_CONFIG: {
  key: PetStatKey;
  label: string;
  barColor: string;
  trackColor: string;
}[] = [
  { key: 'hunger', label: '飽食度', barColor: 'bg-[#FF8AA8]', trackColor: 'bg-[#FFE6ED]' },
  { key: 'mood', label: '心情', barColor: 'bg-[#FFD166]', trackColor: 'bg-[#FFF3D1]' },
  { key: 'cleanliness', label: '清潔度', barColor: 'bg-[#5CC9A7]', trackColor: 'bg-[#DFF6EE]' },
  { key: 'energy', label: '精力', barColor: 'bg-[#9C89D9]', trackColor: 'bg-[#EEE9FA]' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  pet,
  action,
  expression = 'normal',
  flyingFoodEmoji,
  feedEffect = 'none',
  feedParticles = [],
  speech,
  feedbacks,
  inventory,
  onPet,
  onFeed,
  onSleep,
  onBath,
  onWalk,
  onGoToCanteen,
  onOpenMinigame,
  onOpenHouse,
  house,
  onOpenNoviceGrowth,
  noviceClaimableCount = 0,
  activeTitle = null,
  activeBackground = 'default',
  unlockedBackgrounds = ['default'],
  onSelectBackground,
  sharedRoom = null,
  currentUserId = null,
  onOpenSharedPet,
  latestMessage = null,
  unreadMessagesCount = 0,
  onOpenMessageBoard,
  personality,
  onOpenPersonality,
  onOpenCoopGames,
  coopBadgeCount = 0,
  activeDialogue = null,
  weather,
  dialogueHistoryCount = 0,
  onRespondDialogue,
  onDismissDialogue,
  onOpenDialogueHistory,
  savedDialogueIds = [],
  onSaveDialogueToMemory,
  onOpenMemories,
  onOpenGrowthRoadmap,
}) => {
  const [foodDrawerOpen, setFoodDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('meal');
  const [draggingFoodId, setDraggingFoodId] = useState<string | null>(null);
  const [isDropOver, setIsDropOver] = useState(false);
  const [petDirection, setPetDirection] = useState<PetViewDirection>('front');
  const [pointerDrag, setPointerDrag] = useState<{
    food: Food;
    x: number;
    y: number;
  } | null>(null);

  const stageRef = useRef<HTMLElement | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const dragCandidateRef = useRef<{
    food: Food;
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  } | null>(null);
  const activePointerDragRef = useRef<{
    food: Food;
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);
  const onFeedRef = useRef(onFeed);
  onFeedRef.current = onFeed;

  const isPointInsideStage = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const pad = 12;
    return (
      clientX >= rect.left - pad &&
      clientX <= rect.right + pad &&
      clientY >= rect.top - pad &&
      clientY <= rect.bottom + pad
    );
  };

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      const active = activePointerDragRef.current;
      if (active && e.pointerId === active.pointerId) {
        const next = { ...active, x: e.clientX, y: e.clientY };
        activePointerDragRef.current = next;
        setPointerDrag({ food: active.food, x: e.clientX, y: e.clientY });
        setIsDropOver(isPointInsideStage(e.clientX, e.clientY));
        return;
      }

      const candidate = dragCandidateRef.current;
      if (candidate && e.pointerId === candidate.pointerId) {
        candidate.lastX = e.clientX;
        candidate.lastY = e.clientY;
        const dist = Math.hypot(e.clientX - candidate.startX, e.clientY - candidate.startY);
        if (dist > 10) {
          clearHoldTimer();
          dragCandidateRef.current = null;
        }
      }
    };

    const handleWindowPointerEnd = (e: PointerEvent) => {
      const candidate = dragCandidateRef.current;
      if (candidate && e.pointerId === candidate.pointerId) {
        clearHoldTimer();
        dragCandidateRef.current = null;
      }

      const active = activePointerDragRef.current;
      if (active && e.pointerId === active.pointerId) {
        const droppedOnStage =
          e.type === 'pointerup' && isPointInsideStage(e.clientX, e.clientY);
        const droppedFood = active.food;
        activePointerDragRef.current = null;
        setPointerDrag(null);
        setIsDropOver(false);
        if (droppedOnStage) {
          onFeedRef.current(droppedFood);
        }
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerEnd);
    window.addEventListener('pointercancel', handleWindowPointerEnd);
    return () => {
      clearHoldTimer();
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerEnd);
      window.removeEventListener('pointercancel', handleWindowPointerEnd);
    };
  }, []);

  useEffect(() => {
    if (!pointerDrag) return;
    const preventTouchScroll = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };
    window.addEventListener('touchmove', preventTouchScroll, { passive: false });
    return () => {
      window.removeEventListener('touchmove', preventTouchScroll);
    };
  }, [Boolean(pointerDrag)]);

  const handleFoodPointerDown = (e: React.PointerEvent<HTMLDivElement>, food: Food) => {
    if (e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('button')) return;
    clearHoldTimer();
    dragCandidateRef.current = {
      food,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    holdTimerRef.current = window.setTimeout(() => {
      const candidate = dragCandidateRef.current;
      if (!candidate || candidate.pointerId !== e.pointerId) return;
      dragCandidateRef.current = null;
      holdTimerRef.current = null;
      const next = {
        food: candidate.food,
        pointerId: candidate.pointerId,
        x: candidate.lastX,
        y: candidate.lastY,
      };
      activePointerDragRef.current = next;
      setPointerDrag({ food: next.food, x: next.x, y: next.y });
      setIsDropOver(isPointInsideStage(next.x, next.y));
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(12);
      }
    }, 160);
  };

  const petDirectionOrder: PetViewDirection[] = ['front', 'flipped', 'right', 'back', 'left'];
  const petDirectionLabels: Record<PetViewDirection, string> = {
    front: '正面',
    flipped: '翻轉',
    right: '朝右',
    back: '背面',
    left: '朝左',
  };
  const handleCyclePetDirection = () => {
    const idx = petDirectionOrder.indexOf(petDirection);
    setPetDirection(petDirectionOrder[(idx + 1) % petDirectionOrder.length]);
  };

  const growthInfo = getGrowthRemaining(pet.growth, pet.species);
  const careBalanced = isCareBalanced(pet);
  const roundnessTier = getRoundnessTier(pet.roundness);
  const speciesInfo = getPetSpeciesInfo(pet.species);
  const stageBgConfig = STAGE_BACKGROUNDS[activeBackground] ?? STAGE_BACKGROUNDS.default;
  const activeTitleDef = activeTitle ? getTitleDefinition(activeTitle) : null;

  const filteredFoods = FOODS.filter((f) => f.category === selectedCategory);

  const handleDropOnPiggy = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDropOver(false);
    const foodId = e.dataTransfer.getData('text/plain') || draggingFoodId;
    if (!foodId) return;
    const food = FOODS.find((f) => f.id === foodId);
    if (food) {
      onFeed(food);
    }
    setDraggingFoodId(null);
  };

  return (
    <div className="px-4 pt-3 pb-24 space-y-3.5">
      <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F5DFD7] p-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-[#4A3531] truncate">
                {pet.name}
              </h2>
              <span className="text-xs font-bold text-[#B84A6F]">
                Lv.{growthInfo.currentStage.level} {growthInfo.currentStage.name}
                {growthInfo.prestigeStars > 0 ? ` ★${growthInfo.prestigeStars}` : ''}
              </span>
              {activeTitleDef && (
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg border text-[11px] font-extrabold ${activeTitleDef.badgeClass}`}
                >
                  <span aria-hidden="true">{activeTitleDef.emoji}</span>
                  <span>{activeTitleDef.name}</span>
                </span>
              )}
              {personality && onOpenPersonality && (
                <button
                  type="button"
                  onClick={onOpenPersonality}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FFF3D8] border border-[#F2CE6D] text-[11px] font-extrabold text-[#8A5610] hover:bg-[#FFE9BE] active:scale-95 transition"
                >
                  <span>{getPersonalitySummaryLabel(personality)}</span>
                  <span className="opacity-70">›</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#826862] mt-0.5 tabular-nums">
              體重 {pet.weight.toFixed(1)} kg · {roundnessTier.label}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#D64470] tabular-nums">
              <Heart className="w-3.5 h-3.5 fill-[#FF7A9E] text-[#FF7A9E]" />
              {pet.intimacy}
            </span>
            {onOpenSharedPet && (
              <button
                type="button"
                onClick={onOpenSharedPet}
                className={`min-h-[30px] px-2.5 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1 transition active:scale-95 ${
                  sharedRoom
                    ? 'bg-[#E3F7F0] border border-[#AEE3D0] text-[#256D57]'
                    : 'bg-[#FFF0F4] border border-[#F5C9D7] text-[#B83B64]'
                }`}
              >
                <Users className="w-3 h-3 shrink-0" />
                <span>
                  {sharedRoom
                    ? sharedRoom.partnerId
                      ? '兩人共養中'
                      : `邀請碼 ${sharedRoom.inviteCode}`
                    : '兩人共養'}
                </span>
              </button>
            )}
          </div>
        </div>
        {sharedRoom && (
          <p className="mt-1.5 text-[11px] font-bold text-[#256D57] truncate">
            {sharedRoom.partnerId
              ? `共養夥伴：${
                  sharedRoom.ownerId === currentUserId
                    ? sharedRoom.partnerEmail || '夥伴'
                    : sharedRoom.ownerEmail || '夥伴'
                }`
              : `邀請碼：${sharedRoom.inviteCode}（等待夥伴輸入加入）`}
          </p>
        )}

        <button
          type="button"
          onClick={onOpenGrowthRoadmap}
          className="mt-2.5 w-full text-left rounded-2xl bg-[#FFF8F4] hover:bg-[#FFF2EC] border border-[#F2DFD6] px-3 py-2 transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-[#7D635D] mb-1">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span>成長進度</span>
              {careBalanced && (
                <span className="text-[11px] font-extrabold text-[#1F6B54]">
                  · ✨ 元氣滿分 +25%
                </span>
              )}
            </span>
            <span className="tabular-nums text-right truncate">
              {growthInfo.nextStage
                ? `距「${growthInfo.nextStage.name}」還需 ${growthInfo.remaining} · 路線圖 ›`
                : `★${growthInfo.prestigeStars} 距下一星還需 ${growthInfo.remaining} · 路線圖 ›`}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#F2E2DA] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                growthInfo.isPrestigeActive
                  ? 'bg-gradient-to-r from-[#FFD166] to-[#FF7A9E]'
                  : 'bg-gradient-to-r from-[#FF8AA8] to-[#5CC9A7]'
              }`}
              style={{ width: `${growthInfo.progressPercent}%` }}
            />
          </div>
        </button>
      </section>

      <section className="grid grid-cols-2 gap-2.5" aria-label={`${speciesInfo.shortName}狀態數值`}>
        {STAT_CONFIG.map(({ key, label, barColor, trackColor }) => {
          const val = pet[key];
          return (
            <div
              key={key}
              className="rounded-2xl bg-[#FFFDF8] border border-[#F3DFD7] px-3 py-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#5A423C] mb-1">
                <span>{label}</span>
                <span className="tabular-nums">{val}%</span>
              </div>
              <div className={`w-full h-2 rounded-full ${trackColor} overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-300`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {pet.consecutiveFastFood >= 3 && (
        <div className="rounded-2xl bg-[#FFF3D1] border border-[#F3CE72] px-3.5 py-2.5 flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-[#7B5610] leading-snug">
            有點撐了… 連續吃速食好幾次了，帶我去散步消化一下吧！
          </p>
          <button
            type="button"
            onClick={onWalk}
            className="min-h-[36px] px-3 rounded-xl bg-[#5CC9A7] text-white text-xs font-extrabold whitespace-nowrap shrink-0 active:scale-95 transition"
          >
            去散步
          </button>
        </div>
      )}

      <section
        ref={stageRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDropOver(true);
        }}
        onDragLeave={() => setIsDropOver(false)}
        onDrop={handleDropOnPiggy}
        className={`relative rounded-3xl ${stageBgConfig.stageClass} border-2 px-3.5 pt-12 pb-4 flex flex-col items-center justify-center min-h-[276px] overflow-hidden transition-colors ${
          isDropOver
            ? 'border-[#FF7A9E] ring-4 ring-[#FF7A9E]/20'
            : pointerDrag || draggingFoodId
            ? 'border-[#F5A3B8]'
            : 'border-[#F5DFD7]'
        }`}
      >
        {activeBackground === 'starlight_garden' && (
          <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
            <span className="absolute left-5 top-4 text-sm">✨</span>
            <span className="absolute right-8 top-6 text-xs">🌟</span>
            <span className="absolute left-10 bottom-10 text-xs">🌙</span>
            <span className="absolute right-6 bottom-12 text-sm">✨</span>
          </div>
        )}

        {onOpenDialogueHistory && (
          <button
            type="button"
            onClick={onOpenDialogueHistory}
            className="absolute left-3 top-3 z-20 px-2.5 py-1 rounded-xl bg-white/88 border border-[#EAD4DC] text-[11px] font-extrabold text-[#6E544E] inline-flex items-center gap-1 hover:bg-white transition"
          >
            {weather && <span aria-hidden="true">{weather.emoji}</span>}
            {weather && <span>{weather.label}</span>}
            <span className="opacity-50">·</span>
            <MessageSquareText className="w-3 h-3 text-[#D64470]" />
            <span>對話紀錄 ({dialogueHistoryCount})</span>
          </button>
        )}

        {unlockedBackgrounds.length > 1 && onSelectBackground && (
          <button
            type="button"
            onClick={() =>
              onSelectBackground(
                activeBackground === 'starlight_garden' ? 'default' : 'starlight_garden'
              )
            }
            className="absolute right-3 top-3 z-20 px-2.5 py-1 rounded-xl bg-white/85 border border-[#E6D6E8] text-[11px] font-extrabold text-[#5E478C] hover:bg-white transition"
          >
            {activeBackground === 'starlight_garden' ? '🌌 星光花園' : '☀️ 暖陽食堂'}
          </button>
        )}

        {activeDialogue && onRespondDialogue && onDismissDialogue ? (
          <PetDialogueBubble
            pet={pet}
            line={activeDialogue}
            onRespond={onRespondDialogue}
            onClose={onDismissDialogue}
            onOpenHistory={onOpenDialogueHistory}
            savedToMemories={savedDialogueIds.includes(activeDialogue.id)}
            onSaveToMemory={onSaveDialogueToMemory}
          />
        ) : (
          <div className="min-h-[34px] mb-1 flex items-center justify-center">
            {speech && (
              <div className="relative rounded-2xl bg-white/95 border border-[#F1D5DF] px-4 py-1.5 text-xs font-extrabold text-[#4A3531] shadow-xs text-center max-w-[260px]">
                {speech}
              </div>
            )}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-14 flex flex-col items-center z-20">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="animate-float-up text-sm font-extrabold text-[#D64470] drop-shadow-xs flex items-center gap-1"
            >
              {fb.emoji && <span>{fb.emoji}</span>}
              <span>{fb.text}</span>
            </div>
          ))}
        </div>

        <PiggyCharacter
          species={pet.species}
          growth={pet.growth}
          roundness={pet.roundness}
          action={action}
          expression={expression}
          equipped={pet.accessories}
          flyingFoodEmoji={flyingFoodEmoji}
          feedEffect={feedEffect}
          feedParticles={feedParticles}
          onPet={onPet}
          viewDirection={petDirection}
          size={206}
          isDropTarget={isDropOver}
        />

        <div className="w-full mt-1.5 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold text-[#8A716B] flex items-center gap-1 min-w-0">
            <Sparkles className="w-3 h-3 text-[#FF7A9E] shrink-0" />
            <span className="truncate">
              輕點{speciesInfo.shortName}的頭、臉頰、肚肚或小手有不同反應
            </span>
          </p>
          <button
            type="button"
            onClick={handleCyclePetDirection}
            aria-label={`轉向：目前為${petDirectionLabels[petDirection]}，點擊切換方向`}
            className="min-h-[36px] px-2.5 py-1 rounded-xl bg-white/92 border border-[#EAD4DC] text-[11px] font-extrabold text-[#5A3E36] inline-flex items-center gap-1 shadow-xs hover:bg-white active:scale-95 transition shrink-0"
          >
            <FlipHorizontal2 className="w-3.5 h-3.5 text-[#D64470]" />
            <span>轉向 · {petDirectionLabels[petDirection]}</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-2" aria-label="照護互動按鈕">
        <button
          type="button"
          onClick={() => setFoodDrawerOpen((prev) => !prev)}
          aria-expanded={foodDrawerOpen}
          className={`min-h-[60px] flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#FF7A9E] text-white font-extrabold text-xs shadow-[0_3px_0_#D9577B] hover:bg-[#F56990] active:translate-y-0.5 transition ${
            foodDrawerOpen ? 'ring-2 ring-offset-2 ring-[#FF7A9E] ring-offset-[#FFF8ED]' : ''
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span>食堂</span>
        </button>

        <button
          type="button"
          onClick={onSleep}
          className="min-h-[60px] flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#B3A4E8] text-white font-extrabold text-xs shadow-[0_3px_0_#8B79C9] hover:bg-[#A493E0] active:translate-y-0.5 transition"
        >
          <Moon className="w-5 h-5" />
          <span>睡覺</span>
        </button>

        <button
          type="button"
          onClick={onBath}
          className="min-h-[60px] flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#5CC9A7] text-white font-extrabold text-xs shadow-[0_3px_0_#3BA886] hover:bg-[#4DBE9B] active:translate-y-0.5 transition"
        >
          <Bath className="w-5 h-5" />
          <span>洗澡</span>
        </button>

        <button
          type="button"
          onClick={onWalk}
          className="min-h-[60px] flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#F8C956] text-[#4A3531] font-extrabold text-xs shadow-[0_3px_0_#D9A732] hover:bg-[#F3BE40] active:translate-y-0.5 transition"
        >
          <Footprints className="w-5 h-5" />
          <span>散步</span>
        </button>
      </section>

      {foodDrawerOpen && (
        <section
          aria-label={`${pet.name}點餐區`}
          className="rounded-3xl bg-[#FFFDF8] border-2 border-[#FAD5E0] p-3.5 shadow-md space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-[#4A3531]">{pet.name}點餐區</h3>
              <p className="text-[11px] text-[#826862] truncate">
                點擊食物餵食，或長按拖曳到上方{speciesInfo.shortName}身上
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFoodDrawerOpen(false)}
              aria-label="關閉食堂選單"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-[#F7ECE6] text-[#5A3E36] hover:bg-[#EEDCD3] shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {pet.hunger >= 100 && (
            <div className="rounded-2xl bg-[#FFEAF0] border border-[#F5B4C6] px-3 py-1.5 text-xs font-extrabold text-[#B83B64] text-center">
              {pet.name}已經吃飽了！
            </div>
          )}

          <div className="grid grid-cols-3 gap-1.5 bg-[#F8EFEA] p-1 rounded-2xl">
            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[34px] rounded-xl text-xs font-extrabold transition ${
                  selectedCategory === cat
                    ? 'bg-white text-[#D64470] shadow-xs'
                    : 'text-[#7D635D] hover:text-[#4A3531]'
                }`}
              >
                {FOOD_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {filteredFoods.map((food) => {
              const count = inventory[food.id] ?? 0;
              const isFull = pet.hunger >= 100;
              const pref = evaluateFoodPreference(pet.species, food.id);
              const isFavorite = pref === 'favorite';
              const isDisliked = pref === 'disliked';
              const isBeingPointerDragged = pointerDrag?.food.id === food.id;
              return (
                <div
                  key={food.id}
                  draggable={count > 0 && !isFull}
                  onDragStart={(e) => {
                    if (activePointerDragRef.current) {
                      e.preventDefault();
                      return;
                    }
                    e.dataTransfer.setData('text/plain', food.id);
                    setDraggingFoodId(food.id);
                  }}
                  onDragEnd={() => {
                    setDraggingFoodId(null);
                    setIsDropOver(false);
                  }}
                  onPointerDown={
                    count > 0 && !isFull
                      ? (e) => handleFoodPointerDown(e, food)
                      : undefined
                  }
                  className={`flex flex-col items-center rounded-2xl bg-[#FFF7EC] border p-2 text-center select-none transition ${
                    isBeingPointerDragged
                      ? 'border-[#FF7A9E] opacity-55 scale-95'
                      : isFavorite
                      ? 'border-[#FF9AB8]'
                      : 'border-[#F3DFD7]'
                  }`}
                >
                  <span className="text-2xl leading-none my-0.5" aria-hidden="true">
                    {food.emoji}
                  </span>
                  <span className="text-xs font-extrabold text-[#4A3531] truncate w-full">
                    {food.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#826862] tabular-nums">
                    {isFavorite ? '♥ 最愛 · ' : isDisliked ? '💭 · ' : ''}庫存 {count}
                  </span>
                  <button
                    type="button"
                    disabled={count <= 0}
                    onClick={() => {
                      if (count > 0) {
                        onFeed(food);
                      }
                    }}
                    className={`mt-1.5 w-full min-h-[34px] rounded-xl text-xs font-extrabold transition ${
                      count <= 0
                        ? 'bg-[#EAE0DA] text-[#9E8B85] cursor-not-allowed'
                        : isFull
                        ? 'bg-[#F8DDE5] text-[#B05B74]'
                        : 'bg-[#FF7A9E] text-white hover:bg-[#F45D86] active:scale-95'
                    }`}
                  >
                    {count <= 0 ? '缺貨' : '餵食'}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setFoodDrawerOpen(false);
              onGoToCanteen();
            }}
            className="w-full min-h-[38px] rounded-2xl bg-[#E8F8F2] border border-[#AEE4D1] text-xs font-extrabold text-[#256D57] hover:bg-[#D8F3E9] transition"
          >
            前往「食堂商店」購買更多美食
          </button>
        </section>
      )}

      {onOpenHouse && house && (
        <HomeHousePreview pet={pet} house={house} onOpenHouse={onOpenHouse} />
      )}

      {(sharedRoom && onOpenCoopGames) ||
      onOpenMinigame ||
      onOpenNoviceGrowth ||
      onOpenMessageBoard ||
      onOpenMemories ? (
        <section className="grid grid-cols-2 gap-2.5" aria-label="快捷功能中心">
          {sharedRoom && onOpenCoopGames && (
            <button
              type="button"
              onClick={onOpenCoopGames}
              className="col-span-2 min-h-[54px] rounded-2xl bg-gradient-to-r from-[#FFF0F5] via-[#FFF6DF] to-[#E8F8F2] border-2 border-[#F3C8D7] px-3.5 py-2.5 flex items-center justify-between gap-2.5 hover:brightness-[0.99] active:scale-[0.99] transition text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#FFE3EE] text-[#D64470] flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-[#4A3531]">
                      雙人合作遊戲
                    </span>
                    {coopBadgeCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-[#D64470] text-white text-[10px] font-extrabold tabular-nums">
                        {coopBadgeCount} 待領
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#7D635D] truncate">
                    雙人房間佈置＆每日農場接力訂單
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#B83B64] whitespace-nowrap shrink-0">
                玩合作 ›
              </span>
            </button>
          )}

          {onOpenMinigame && (
            <button
              type="button"
              onClick={onOpenMinigame}
              className="rounded-2xl bg-[#FFFDF8] border-2 border-[#F2D9A5] p-3 flex flex-col justify-between gap-2 hover:bg-[#FFF8E8] active:scale-[0.98] transition text-left min-h-[92px]"
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF3D1] text-[#9D5B12] flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold text-[#9D5B12]">開始 ›</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#4A3531] truncate">
                  小遊戲中心
                </div>
                <p className="text-[11px] text-[#7D635D] truncate mt-0.5">
                  每日輪替賺金幣
                </p>
              </div>
            </button>
          )}

          {onOpenNoviceGrowth && (
            <button
              type="button"
              onClick={onOpenNoviceGrowth}
              className="rounded-2xl bg-[#FFFDF8] border-2 border-[#C7EAE0] p-3 flex flex-col justify-between gap-2 hover:bg-[#F3FCF8] active:scale-[0.98] transition text-left min-h-[92px]"
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#E3F7F0] text-[#256D57] flex items-center justify-center shrink-0">
                  <Sprout className="w-4 h-4" />
                </div>
                {noviceClaimableCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-lg bg-[#3BA886] text-white text-[10px] font-extrabold">
                    可領獎勵
                  </span>
                ) : (
                  <span className="text-[11px] font-extrabold text-[#256D57]">查看 ›</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#4A3531] truncate">
                  新手 7 天成長
                </div>
                <p className="text-[11px] text-[#7D635D] truncate mt-0.5">
                  拿金幣與限定配件
                </p>
              </div>
            </button>
          )}

          {onOpenMessageBoard && (
            <button
              type="button"
              onClick={onOpenMessageBoard}
              className="rounded-2xl bg-[#FFFDF8] border-2 border-[#F4DFD7] p-3 flex flex-col justify-between gap-2 hover:bg-[#FFF5F8] active:scale-[0.98] transition text-left min-h-[92px]"
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFEAF0] text-[#D64470] flex items-center justify-center shrink-0">
                  <MessageCircleHeart className="w-4 h-4" />
                </div>
                {unreadMessagesCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-lg bg-[#FF5A87] text-white text-[10px] font-extrabold tabular-nums">
                    {unreadMessagesCount} 新
                  </span>
                ) : (
                  <span className="text-[11px] font-extrabold text-[#B83B64]">打開 ›</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#4A3531] truncate">
                  留言板與貼圖
                </div>
                <p className="text-[11px] text-[#7D635D] truncate mt-0.5">
                  {latestMessage
                    ? `${latestMessage.authorName}：${
                        latestMessage.stickerId
                          ? `[${getStickerById(latestMessage.stickerId)?.label ?? '貼圖'}] `
                          : ''
                      }${latestMessage.content.replace(/\[photo:[^\]]+\]/g, '📸 合照').trim()}`
                    : '傳送貼圖與悄悄話'}
                </p>
              </div>
            </button>
          )}

          {onOpenMemories && (
            <button
              type="button"
              onClick={onOpenMemories}
              className="rounded-2xl bg-gradient-to-br from-[#FFF4EC] to-[#FFFDF8] border-2 border-[#F4DFD7] p-3 flex flex-col justify-between gap-2 hover:bg-[#FFF5EE] active:scale-[0.98] transition text-left min-h-[92px]"
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF3D8] text-[#9D5B12] flex items-center justify-center shrink-0">
                  <BookHeart className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold text-[#9D5B12]">回味 ›</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#4A3531] truncate">
                  照片牆與回憶冊
                </div>
                <p className="text-[11px] text-[#7D635D] truncate mt-0.5">
                  寫真集與本月回顧
                </p>
              </div>
            </button>
          )}
        </section>
      ) : null}

      {pointerDrag && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
          style={{ left: pointerDrag.x, top: pointerDrag.y }}
          aria-hidden="true"
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-xl border-2 transition-transform ${
              isDropOver
                ? 'bg-[#FFEAF0] border-[#FF7A9E] scale-115'
                : 'bg-[#FFFDF8] border-[#F5C6D4] scale-105'
            }`}
          >
            {pointerDrag.food.emoji}
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-xs whitespace-nowrap ${
              isDropOver ? 'bg-[#FF7A9E] text-white' : 'bg-[#4A3531]/85 text-white'
            }`}
          >
            {isDropOver ? `放開餵食 ${pet.name}` : `拖到${speciesInfo.shortName}身上`}
          </span>
        </div>
      )}
    </div>
  );
};
