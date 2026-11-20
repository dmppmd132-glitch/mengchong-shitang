import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sprout, X } from 'lucide-react';
import { ROOM_ITEM_BY_ID, STORAGE_CAPS_BY_LEVEL } from '../../data/house';
import { INGREDIENT_IDS, INGREDIENTS } from '../../data/kitchen';
import {
  IngredientId,
  Pet,
  PetExpression,
  PiggyActionState,
  SharedHouse,
} from '../../types';
import { soundFX, triggerHaptic } from '../../utils/sound';
import { PiggyCharacter } from '../PiggyCharacter';
import { CropIllustration } from './FarmIllustrations';
import { FurnitureGraphic } from './FurnitureGraphic';
import {
  YardBarnStorageSvg,
  YardCottageSvg,
  YardFlowerSwingSvg,
  YardFlowerbedAccent,
  YardFountainSvg,
  YardPicnicAreaSvg,
  YardRibbonBottomFence,
  YardSceneBackdropSvg,
} from './YardIllustrations';

const OUTDOOR_PLAYGROUND_ITEM_IDS = new Set([
  'camp_picnic_table',
  'forest_woven_rug',
  'strawberry_bow_rug',
  'cream_round_rug',
  'rainbow_bounce_ball',
  'cloud_star_ball',
  'sunflower_vase',
  'blueberry_scent_pot',
  'wooden_welcome_sign',
  'camp_trail_sign',
  'toy_mini_tent',
  'toy_rainbow_ball',
  'toy_throw_pillow',
  'toy_plush_bear',
]);

interface FarmSceneBannerProps {
  house: SharedHouse;
  pet: Pet;
  ingredients: Record<IngredientId, number>;
  soundEnabled: boolean;
  onEditHouseName: () => void;
  onGoToFarm: () => void;
}

export const FarmSceneBanner: React.FC<FarmSceneBannerProps> = ({
  house,
  pet,
  ingredients,
  soundEnabled,
  onEditHouseName,
  onGoToFarm,
}) => {
  const { fenceId, flowerbedId, signId } = house.activeFarmDecor;
  const hasSprinkler = house.farmUpgrades.sprinklerLevel > 0;
  const hasGreenhouse = house.farmUpgrades.greenhouseLevel > 0;
  const storageLevel = house.farmUpgrades.storageLevel;
  const storageCap = STORAGE_CAPS_BY_LEVEL[storageLevel] ?? 15;

  const [storageOpen, setStorageOpen] = useState<boolean>(false);
  const [selectedYardItemId, setSelectedYardItemId] = useState<string | null>(null);

  const [petAction, setPetAction] = useState<PiggyActionState>('idle');
  const [petExpression, setPetExpression] = useState<PetExpression>('normal');
  const [moodBubble, setMoodBubble] = useState<{ key: number; symbol: '♪' | '🩷' } | null>(null);

  const bubbleTimerRef = useRef<number | null>(null);

  const ownedOutdoorItems = useMemo(() => {
    const ownedIds = Object.entries(house.ownedFurnitureCounts)
      .filter(([, count]) => count > 0)
      .map(([id]) => id);
    return ownedIds
      .filter((id) => OUTDOOR_PLAYGROUND_ITEM_IDS.has(id))
      .map((id) => ROOM_ITEM_BY_ID[id])
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [house.ownedFurnitureCounts]);

  const activeOutdoorItem = selectedYardItemId
    ? ownedOutdoorItems.find((item) => item.id === selectedYardItemId) ?? null
    : null;

  // Periodic ♪ or 🩷 speech bubble above pet
  useEffect(() => {
    const popMood = () => {
      const symbol: '♪' | '🩷' = Math.random() < 0.55 ? '♪' : '🩷';
      setMoodBubble({ key: Date.now(), symbol });
      if (bubbleTimerRef.current !== null) {
        window.clearTimeout(bubbleTimerRef.current);
      }
      bubbleTimerRef.current = window.setTimeout(() => {
        setMoodBubble(null);
      }, 2500);
    };

    const initial = window.setTimeout(popMood, 1100);
    const interval = window.setInterval(popMood, 4200);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current !== null) window.clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  const handleTapYardPet = () => {
    soundFX.petVoice(soundEnabled, pet.species);
    soundFX.heart(soundEnabled);
    triggerHaptic(14);
    setPetAction('petted');
    setPetExpression('happyTongue');
    setMoodBubble({ key: Date.now(), symbol: '🩷' });
    if (bubbleTimerRef.current !== null) {
      window.clearTimeout(bubbleTimerRef.current);
    }
    bubbleTimerRef.current = window.setTimeout(() => {
      setMoodBubble(null);
      setPetAction('idle');
      setPetExpression('normal');
    }, 1800);
  };

  const totalIngredientCount = INGREDIENT_IDS.reduce(
    (sum, id) => sum + (ingredients[id] ?? 0),
    0
  );

  return (
    <section
      aria-label="萌寵暖暖庭院手繪場景"
      className="relative -mx-4 sm:mx-0 sm:rounded-[28px] overflow-hidden border-y-2 sm:border-2 border-[#6B5344] bg-[#D9E8C4] shadow-[0_4px_0_rgba(107,83,68,0.16)]"
    >
        {/* Full illustrated courtyard backdrop: warm sky, soft hills, open lawn and short path */}
      <YardSceneBackdropSvg fenceId={fenceId} hasGreenhouse={hasGreenhouse} />

      <div className="relative z-10 flex flex-col">
        {/* 1. TOP ARCHITECTURE ROW: Left Cottage + Clickable Signboard / Right Red-Roofed Barn Storage */}
        <div className="relative flex items-start justify-between pt-2 px-1.5 sm:px-3">
          <YardCottageSvg
            houseName={house.houseName}
            signId={signId}
            onEditHouseName={onEditHouseName}
          />

          <div className="flex flex-col items-end gap-1 pt-2 pr-0.5 w-[46%]">
            <div className="w-full flex justify-end">
              <YardBarnStorageSvg
                storageLevel={storageLevel}
                storageCap={storageCap}
                onOpenStorage={() => {
                  soundFX.pop(soundEnabled);
                  setStorageOpen(true);
                }}
              />
            </div>

            {/* Subtle Active Facility Status Badges (Only Shown When Purchased) */}
            {(hasSprinkler || hasGreenhouse) && (
              <div className="flex flex-wrap justify-end gap-1 -mt-1">
                {hasSprinkler && (
                  <span className="rounded-full bg-[#E5F7FF]/95 border-[1.5px] border-[#6B5344] px-2 py-0.5 text-[9.5px] font-extrabold text-[#175B78] whitespace-nowrap">
                    💧 灑水器 -30%
                  </span>
                )}
                {hasGreenhouse && (
                  <span className="rounded-full bg-[#E7FAEE]/95 border-[1.5px] border-[#6B5344] px-2 py-0.5 text-[9.5px] font-extrabold text-[#1E634C] whitespace-nowrap">
                    🏡 溫室 +1產量
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. MIDDLE OUTDOOR LAWN PLAYGROUND: Left Fountain + Center Picnic Blanket & Live Pet + Right Flower Swing */}
        <div className="relative w-full h-[252px] sm:h-[280px] -mt-3 px-2 select-none">
          {/* Independent furniture layer: left fountain */}
          <div className="absolute left-1 sm:left-3 top-8 z-10 isolate">
            <YardFountainSvg />
          </div>

          {/* Independent furniture layer: right flower-vine swing */}
          <div className="absolute right-1 sm:right-3 top-1 z-10 isolate">
            <YardFlowerSwingSvg />
          </div>

          {/* Independent furniture layer: enlarged central picnic area */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10 isolate">
            {activeOutdoorItem ? (
              <div className="relative flex flex-col items-center">
                <YardPicnicAreaSvg />
                <div className="absolute -top-6 right-5 drop-shadow-[0_2px_2px_rgba(107,83,68,0.22)]">
                  <FurnitureGraphic itemId={activeOutdoorItem.id} size={52} />
                </div>
              </div>
            ) : (
              <YardPicnicAreaSvg />
            )}
          </div>

          {/* Pet stays centered on the picnic blanket while remaining tappable */}
          <button
            type="button"
            onClick={handleTapYardPet}
            aria-label={`跟在庭院玩耍的 ${pet.name} 互動`}
            className="house-pet-mover absolute z-30 -translate-x-1/2 -translate-y-1/2 min-w-[82px] min-h-[82px] flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7A9E] rounded-full"
            style={{
              left: '50%',
              top: '78%',
            }}
          >
            {/* Soft Ground Shadow Under Pet */}
            <span
              className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full bg-[#6B5344]/20"
              aria-hidden="true"
            />

            {/* Hand-Drawn Comic Speech Bubble (♪ or 🩷) */}
            {moodBubble && (
              <div
                key={moodBubble.key}
                className="pointer-events-none animate-house-mood-pop absolute -top-7 left-1/2 -translate-x-1/2 z-30"
                aria-hidden="true"
              >
                <div className="relative w-8 h-7 rounded-full bg-[#FFFDF8] border-2 border-[#6B5344] flex items-center justify-center text-sm font-extrabold text-[#D64470] shadow-xs">
                  <span>{moodBubble.symbol}</span>
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-[#FFFDF8] border-r-2 border-b-2 border-[#6B5344]" />
                </div>
              </div>
            )}

            {/* Breathing pet sprite */}
            <div
              className="animate-house-pet-breathe transition-transform duration-300"
            >
              <PiggyCharacter
                species={pet.species}
                growth={pet.growth}
                roundness={pet.roundness}
                action={petAction}
                expression={petExpression}
                equipped={pet.accessories}
                size={88}
                interactive={false}
              />
            </div>
          </button>

          {/* Optional Compact Lawn Furniture Switcher (Shown Only When Player Owns Outdoor-Friendly Items) */}
          {ownedOutdoorItems.length > 0 && (
            <div className="absolute left-2 bottom-1 z-40 flex items-center gap-1 max-w-[42%] overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  soundFX.pop(soundEnabled);
                  setSelectedYardItemId(null);
                }}
                className={`shrink-0 rounded-full border-[1.5px] border-[#6B5344] px-2 py-0.5 text-[9.5px] font-extrabold transition ${
                  selectedYardItemId === null
                    ? 'bg-[#FFEAF0] text-[#B83B64]'
                    : 'bg-[#FFF9EE]/90 text-[#5C4438]'
                }`}
              >
                🧺 野餐墊
              </button>
              {ownedOutdoorItems.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    soundFX.pop(soundEnabled);
                    setSelectedYardItemId((prev) => (prev === item.id ? null : item.id));
                  }}
                  className={`shrink-0 rounded-full border-[1.5px] border-[#6B5344] px-2 py-0.5 text-[9.5px] font-extrabold transition whitespace-nowrap ${
                    selectedYardItemId === item.id
                      ? 'bg-[#E5F7ED] text-[#1F6B54]'
                      : 'bg-[#FFF9EE]/90 text-[#5C4438]'
                  }`}
                >
                  {item.emoji} {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Yard Flowerbed Strip (Daisy / Lavender When Equipped) */}
        <YardFlowerbedAccent flowerbedId={flowerbedId} />

        {/* Bottom wooden fence + wildflowers + mint ribbon gate to the separate farm page */}
        <YardRibbonBottomFence fenceId={fenceId} onGoToFarm={onGoToFarm} />
      </div>

      {/* BARN STORAGE INVENTORY MODAL (Opens When Clicking Top-Right Red Barn) */}
      {storageOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="小倉庫食材庫存清單"
          onClick={() => setStorageOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[#FFFDF8] border-2 border-[#6B5344] shadow-[0_6px_0_#A67A50] p-4 space-y-3 max-h-[82vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#EFE0D8]">
              <div>
                <h3 className="text-sm font-extrabold text-[#4A3531]">
                  🏚️ 小倉庫食材清單（Lv.{storageLevel + 1}）
                </h3>
                <p className="text-[11px] font-bold text-[#7D635D] tabular-nums">
                  單種上限 {storageCap} 份 · 目前共 {totalIngredientCount} 份新鮮食材
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStorageOpen(false)}
                aria-label="關閉倉庫清單"
                className="min-w-[40px] min-h-[40px] rounded-xl bg-[#F6ECE4] border border-[#DFC7B8] text-[#5A3E36] inline-flex items-center justify-center hover:bg-[#EFE0D5] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1">
              {INGREDIENT_IDS.map((id) => {
                const info = INGREDIENTS[id];
                const qty = ingredients[id] ?? 0;
                const pct = Math.min(100, Math.round((qty / storageCap) * 100));
                const isFull = qty >= storageCap;

                return (
                  <div
                    key={id}
                    className="rounded-2xl bg-[#FFF8EE] border border-[#EBD6C3] px-3 py-2 flex items-center gap-3"
                  >
                    <CropIllustration cropId={id} stage="mature" size={34} className="shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-[#4A3531]">{info.name}</span>
                        <span
                          className={`text-xs font-extrabold tabular-nums ${
                            isFull ? 'text-[#C84B31]' : qty > 0 ? 'text-[#256D57]' : 'text-[#9A857E]'
                          }`}
                        >
                          {qty} / {storageCap}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EFE3D6] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? 'bg-[#F59E0B]' : 'bg-[#6CC99C]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStorageOpen(false);
                  onGoToFarm();
                }}
                className="flex-1 min-h-[44px] rounded-2xl bg-[#5CC9A7] border-2 border-[#6B5344] shadow-[0_3px_0_#3BA886] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 active:translate-y-0.5 transition"
              >
                <Sprout className="w-4 h-4" />
                <span>前往農場種植採收</span>
              </button>
              <button
                type="button"
                onClick={() => setStorageOpen(false)}
                className="min-h-[44px] px-4 rounded-2xl bg-[#F5EAE1] border-2 border-[#6B5344] text-xs font-extrabold text-[#5A3E36]"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
