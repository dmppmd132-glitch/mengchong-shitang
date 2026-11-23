import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Camera,
  Check,
  Coins,
  CookingPot,
  Gamepad2,
  Lock,
  Pencil,
  ShoppingBag,
  Sprout,
  Utensils,
} from 'lucide-react';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS, FOODS } from '../data/foods';
import {
  FARM_DECORATIONS,
  FARM_PLOT_EXPANSION_COSTS,
  FARM_UPGRADES,
} from '../data/house';
import { INGREDIENT_IDS, INGREDIENTS, KITCHEN_RECIPES } from '../data/kitchen';
import { getPetSpeciesInfo } from '../data/species';
import {
  CropPlot,
  FarmDecorationId,
  FarmUpgradeId,
  Food,
  FoodCategory,
  IngredientId,
  KitchenRecipe,
  Pet,
  PiggyActionState,
  SharedHouse,
  YardMoodBuffPeriod,
} from '../types';
import {
  PaymentSource,
  getEffectiveGrowDurationMs,
  getEffectiveHarvestYield,
  getIngredientStorageCap,
} from '../utils/house';
import {
  getActiveYardBuffExpiresAt,
  getCropGrowthState,
  getExpectedCropDurationMs,
} from '../utils/farmGrowth';
import { PiggyCharacter } from './PiggyCharacter';
import { YardMoodBuffBadge } from './house/YardMoodBuffBadge';
import {
  BottomLeftGardenToolsSvg,
  CropIllustration,
  FarmBottomFenceScene,
  FarmSideFenceSvg,
  GoldenAuraSvg,
  GrassTuftSvg,
  LeftMiniWateringCanSvg,
  PastoralHorizonBackdrop,
  RightWateringCanSvg,
  SeedSproutBadge,
  SoilBedBackdropSvg,
  WateringButtonIconSvg,
  WateringPourOverlaySvg,
  WoodenPlotSignSvg,
} from './house/FarmIllustrations';

interface CanteenViewProps {
  pet: Pet;
  action: PiggyActionState;
  flyingFoodEmoji: string | null;
  speech: string;
  coins: number;
  inventory: Record<string, number>;
  ingredients: Record<IngredientId, number>;
  farmPlots: CropPlot[];
  yardMoodBuffPeriods: YardMoodBuffPeriod[];
  freeSeeds?: Partial<Record<IngredientId, number>>;
  puppyTreasureReady?: boolean;
  house: SharedHouse;
  onFeed: (food: Food) => void;
  onBuyFood: (food: Food) => void;
  onPlantCrop: (plotId: number, ingredientId: IngredientId) => void;
  onWaterCrop?: (plotId: number) => void;
  onWaterAllCrops?: () => void;
  onHarvestCrop: (plotId: number) => void;
  onHarvestAllCrops?: () => void;
  onClaimPuppyTreasure?: () => string | null;
  onCookRecipe: (recipe: KitchenRecipe) => void;
  onOpenMinigame?: () => void;
  onOpenFarmPhotoStudio?: () => void;
  onExpandFarmPlot: (paySource: PaymentSource) => void;
  onUpgradeFarmFacility: (upgradeId: FarmUpgradeId, paySource: PaymentSource) => void;
  onToggleFarmDecoration: (decorId: FarmDecorationId, paySource: PaymentSource) => void;
  onUpdateHouseName: (newName: string) => void;
  initialSection?: CanteenSection;
}

export type CanteenSection = 'shop' | 'farm' | 'kitchen';
type CategoryFilter = 'all' | FoodCategory;

const FILTER_OPTIONS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  ...FOOD_CATEGORIES.map((cat) => ({
    key: cat,
    label: FOOD_CATEGORY_LABELS[cat],
  })),
];

export const CanteenView: React.FC<CanteenViewProps> = ({
  pet,
  action,
  flyingFoodEmoji,
  speech,
  coins,
  inventory,
  ingredients,
  farmPlots,
  yardMoodBuffPeriods,
  freeSeeds = {},
  puppyTreasureReady = false,
  house,
  onFeed,
  onBuyFood,
  onPlantCrop,
  onWaterCrop,
  onWaterAllCrops,
  onHarvestCrop,
  onHarvestAllCrops,
  onClaimPuppyTreasure,
  onCookRecipe,
  onOpenMinigame,
  onOpenFarmPhotoStudio,
  onExpandFarmPlot,
  onUpgradeFarmFacility,
  onToggleFarmDecoration,
  onUpdateHouseName,
  initialSection = 'shop',
}) => {
  const [section, setSection] = useState<CanteenSection>(initialSection);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [selectedSeed, setSelectedSeed] = useState<IngredientId>('carrot');
  const [farmPaySource, setFarmPaySource] = useState<PaymentSource>('personal');
  const [editingSignName, setEditingSignName] = useState<boolean>(false);
  const [signNameDraft, setSignNameDraft] = useState<string>(house.houseName);
  const [now, setNow] = useState<number>(() => Date.now());
  const [harvestBursts, setHarvestBursts] = useState<
    Array<{ id: number; plotId: number; text: string; emoji: string; isGolden?: boolean }>
  >([]);
  const [waterPourPlotIds, setWaterPourPlotIds] = useState<Record<number, number>>({});
  const [puppyHappy, setPuppyHappy] = useState<boolean>(false);
  const [puppyRewardText, setPuppyRewardText] = useState<string | null>(null);
  const [isBannerCompact, setIsBannerCompact] = useState<boolean>(false);
  const burstTimersRef = useRef<number[]>([]);
  const bannerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (section === 'farm') {
      setIsBannerCompact(false);
      return;
    }
    const target = bannerRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBannerCompact(!entry.isIntersecting);
      },
      {
        rootMargin: '-56px 0px 0px 0px',
        threshold: 0.15,
      }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [section]);

  const hasGrowingCrops = farmPlots.some((p) => p.cropId !== null);
  const activeBuffExpiresAt = getActiveYardBuffExpiresAt(yardMoodBuffPeriods, now);
  const hasTimedFarmActivity = hasGrowingCrops || activeBuffExpiresAt !== null;

  useEffect(() => {
    if (!hasTimedFarmActivity) return;
    setNow(Date.now());
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hasTimedFarmActivity]);

  useEffect(() => {
    setSignNameDraft(house.houseName);
  }, [house.houseName]);

  useEffect(() => {
    return () => {
      burstTimersRef.current.forEach((id) => window.clearTimeout(id));
      burstTimersRef.current = [];
    };
  }, []);

  const handleWaterPlot = (plotId: number) => {
    if (!onWaterCrop) return;
    onWaterCrop(plotId);
    const stamp = Date.now();
    setWaterPourPlotIds((prev) => ({ ...prev, [plotId]: stamp }));
    const tId = window.setTimeout(() => {
      setWaterPourPlotIds((prev) => {
        if (prev[plotId] !== stamp) return prev;
        const next = { ...prev };
        delete next[plotId];
        return next;
      });
      burstTimersRef.current = burstTimersRef.current.filter((id) => id !== tId);
    }, 1100);
    burstTimersRef.current.push(tId);
  };

  const handleHarvestPlot = (plot: CropPlot, effectiveYield: number) => {
    if (!plot.cropId) return;
    const crop = INGREDIENTS[plot.cropId];
    const currentQty = ingredients[plot.cropId] ?? 0;
    const isGolden = Boolean(plot.isGolden);
    onHarvestCrop(plot.id);

    if (currentQty < storageCap) {
      const burstId = Date.now() + plot.id * 100 + Math.floor(Math.random() * 90);
      setHarvestBursts((prev) => [
        ...prev,
        {
          id: burstId,
          plotId: plot.id,
          text: isGolden
            ? `大豐收！獲得雙倍金幣 +${crop.seedCost * 2}`
            : `${crop.name} +${effectiveYield}`,
          emoji: isGolden ? '🌟' : crop.emoji,
          isGolden,
        },
      ]);
      const tId = window.setTimeout(() => {
        setHarvestBursts((prev) => prev.filter((b) => b.id !== burstId));
        burstTimersRef.current = burstTimersRef.current.filter((id) => id !== tId);
      }, 1350);
      burstTimersRef.current.push(tId);
    }
  };

  const handleClickPuppy = () => {
    if (!onClaimPuppyTreasure) return;
    const rewardMessage = onClaimPuppyTreasure();
    if (!rewardMessage) return;
    setPuppyHappy(true);
    setPuppyRewardText(rewardMessage);
    const tId = window.setTimeout(() => {
      setPuppyHappy(false);
      setPuppyRewardText(null);
      burstTimersRef.current = burstTimersRef.current.filter((id) => id !== tId);
    }, 1800);
    burstTimersRef.current.push(tId);
  };

  const handleWaterAllPlots = () => {
    if (!onWaterAllCrops) return;
    const targets = farmPlots.filter(
      (p) =>
        p.cropId !== null &&
        !p.watered &&
        !getCropGrowthState(p, now, yardMoodBuffPeriods).isReady
    );
    if (targets.length === 0) return;
    onWaterAllCrops();
    const stamp = Date.now();
    setWaterPourPlotIds((prev) => {
      const next = { ...prev };
      targets.forEach((p) => {
        next[p.id] = stamp;
      });
      return next;
    });
    const tId = window.setTimeout(() => {
      setWaterPourPlotIds((prev) => {
        const next = { ...prev };
        targets.forEach((p) => {
          if (next[p.id] === stamp) delete next[p.id];
        });
        return next;
      });
      burstTimersRef.current = burstTimersRef.current.filter((id) => id !== tId);
    }, 1100);
    burstTimersRef.current.push(tId);
  };

  const handleHarvestAllPlots = () => {
    if (!onHarvestAllCrops) return;
    const readyTargets = farmPlots.filter(
      (p) =>
        p.cropId !== null &&
        getCropGrowthState(p, now, yardMoodBuffPeriods).isReady
    );
    if (readyTargets.length === 0) return;

    const simQty: Record<string, number> = { ...ingredients };
    const burstsToAdd: Array<{
      id: number;
      plotId: number;
      text: string;
      emoji: string;
      isGolden?: boolean;
    }> = [];
    const baseStamp = Date.now();
    for (const p of readyTargets) {
      if (!p.cropId) continue;
      const cur = simQty[p.cropId] ?? 0;
      if (cur >= storageCap) continue;
      const crop = INGREDIENTS[p.cropId];
      const effYield = getEffectiveHarvestYield(crop.harvestYield, house);
      simQty[p.cropId] = Math.min(storageCap, cur + effYield);
      const isGolden = Boolean(p.isGolden);
      burstsToAdd.push({
        id: baseStamp + p.id * 100 + Math.floor(Math.random() * 90),
        plotId: p.id,
        text: isGolden ? `雙倍金幣 +${crop.seedCost * 2}` : `${crop.name} +${effYield}`,
        emoji: isGolden ? '🌟' : crop.emoji,
        isGolden,
      });
    }

    onHarvestAllCrops();
    if (burstsToAdd.length > 0) {
      const addedIds = new Set(burstsToAdd.map((b) => b.id));
      setHarvestBursts((prev) => [...prev, ...burstsToAdd]);
      const tId = window.setTimeout(() => {
        setHarvestBursts((prev) => prev.filter((b) => !addedIds.has(b.id)));
        burstTimersRef.current = burstTimersRef.current.filter((id) => id !== tId);
      }, 1350);
      burstTimersRef.current.push(tId);
    }
  };

  const speciesInfo = getPetSpeciesInfo(pet.species);
  const items = filter === 'all' ? FOODS : FOODS.filter((f) => f.category === filter);
  const isFull = pet.hunger >= 100;
  const storageCap = getIngredientStorageCap(house);
  const availableFarmCoins = farmPaySource === 'treasury' ? house.treasuryCoins : coins;

  const readyCropsCount = farmPlots.filter(
    (plot) => getCropGrowthState(plot, now, yardMoodBuffPeriods).isReady
  ).length;
  const waterableCropsCount = farmPlots.filter(
    (plot) =>
      plot.cropId !== null &&
      !plot.watered &&
      !getCropGrowthState(plot, now, yardMoodBuffPeriods).isReady
  ).length;

  const nextExpandPlotNumber = house.unlockedFarmPlots < 8 ? house.unlockedFarmPlots + 1 : null;
  const nextExpandCost = nextExpandPlotNumber
    ? FARM_PLOT_EXPANSION_COSTS[nextExpandPlotNumber] ?? 0
    : 0;

  return (
    <div className="px-4 pt-3 pb-24 space-y-4">
      <section
        ref={bannerRef}
        className="rounded-3xl bg-gradient-to-r from-[#FFEAF0] to-[#FFF6DA] border-2 border-[#F5DFD7] p-3.5 flex items-center gap-3"
      >
        <div className="shrink-0">
          <PiggyCharacter
            species={pet.species}
            growth={pet.growth}
            roundness={pet.roundness}
            action={action}
            equipped={pet.accessories}
            flyingFoodEmoji={flyingFoodEmoji}
            interactive={false}
            size={84}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold text-[#4A3531] truncate">
              {pet.name}的食堂桌
            </h2>
            <span className="text-xs font-extrabold text-[#D64470] tabular-nums whitespace-nowrap">
              飽食 {pet.hunger}%
            </span>
          </div>
          <p className="text-xs font-bold text-[#6E544E] leading-snug">
            {isFull ? `${pet.name}已經吃飽了！` : speech || speciesInfo.greeting}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-1.5 bg-[#F2E5DE] p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setSection('shop')}
          className={`min-h-[42px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1 transition whitespace-nowrap ${
            section === 'shop'
              ? 'bg-white text-[#D64470] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>點餐商店</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('farm')}
          className={`min-h-[42px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1 transition whitespace-nowrap ${
            section === 'farm'
              ? 'bg-white text-[#256D57] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>開心農場{readyCropsCount > 0 ? ` (${readyCropsCount})` : ''}</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('kitchen')}
          className={`min-h-[42px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1 transition whitespace-nowrap ${
            section === 'kitchen'
              ? 'bg-white text-[#9D5B12] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <CookingPot className="w-3.5 h-3.5" />
          <span>萌寵廚房</span>
        </button>
      </div>

      {section === 'shop' && (
        <>
          {isFull && (
            <div className="rounded-2xl bg-[#FFEAF0] border border-[#F5B4C6] px-4 py-2.5 text-xs font-extrabold text-[#B83B64] text-center">
              {pet.name}已經吃飽了！目前飽食度已達 100%，先陪牠散步或休息吧。
            </div>
          )}

          {onOpenMinigame && (
            <button
              type="button"
              onClick={onOpenMinigame}
              className="w-full min-h-[46px] rounded-2xl bg-[#FFF3D1] border border-[#F2CE6D] px-3.5 py-2 flex items-center justify-between gap-2 text-left hover:bg-[#FFEAA8] active:scale-[0.99] transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Gamepad2 className="w-4 h-4 text-[#9D5B12] shrink-0" />
                <span className="text-xs font-extrabold text-[#7A540E] truncate">
                  金幣不夠買美食？去小遊戲中心挑戰 5 種玩法賺金幣與稀有食材！
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#9D5B12] whitespace-nowrap shrink-0">
                去挑戰 ›
              </span>
            </button>
          )}

          <div className="grid grid-cols-4 gap-1.5 bg-[#F6ECE6] p-1.5 rounded-2xl">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className={`min-h-[40px] rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
                  filter === opt.key
                    ? 'bg-white text-[#D64470] shadow-xs'
                    : 'text-[#7D635D] hover:text-[#4A3531]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {items.map((food) => {
              const count = inventory[food.id] ?? 0;
              const canBuy = coins >= food.price;
              const isFavorite = speciesInfo.favoriteFoodIds.includes(food.id);

              return (
                <article
                  key={food.id}
                  className={`rounded-3xl bg-[#FFFDF8] border-2 p-3.5 space-y-2.5 ${
                    isFavorite ? 'border-[#FFACC3]' : 'border-[#F4DFD7]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFF4DC] border border-[#F5DFA8] flex items-center justify-center text-3xl shrink-0">
                      <span aria-hidden="true">{food.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-extrabold text-[#4A3531] truncate">
                          {food.name}
                        </h3>
                        <span className="text-xs font-bold text-[#826862] tabular-nums whitespace-nowrap">
                          {FOOD_CATEGORY_LABELS[food.category]} · 庫存 {count}
                        </span>
                      </div>
                      {isFavorite && (
                        <p className="text-[11px] font-extrabold text-[#D64470] mt-0.5">
                          ♥ {speciesInfo.shortName}最愛料理 · 心情與成長額外加成
                        </p>
                      )}
                      <p className="text-xs text-[#7D635D] mt-0.5 leading-relaxed">
                        {food.description}
                      </p>
                      <p className="text-[11px] font-bold text-[#9A7A73] mt-1 tabular-nums">
                        飽食 +{food.hunger} · 心情 +{food.mood} · 體重 +{food.weightGain.toFixed(1)} kg · 圓滾 +{food.roundness}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      disabled={!canBuy}
                      onClick={() => onBuyFood(food)}
                      className={`min-h-[44px] rounded-2xl px-3 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
                        canBuy
                          ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E] hover:bg-[#FFEAA8] active:scale-[0.98]'
                          : 'bg-[#F2EAE6] text-[#A89690] cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-4 h-4" />
                      <span className="tabular-nums">購買 ({food.price} 金幣)</span>
                    </button>

                    <button
                      type="button"
                      disabled={count <= 0}
                      onClick={() => onFeed(food)}
                      className={`min-h-[44px] rounded-2xl px-3 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
                        count <= 0
                          ? 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                          : isFull
                          ? 'bg-[#F8DCE4] text-[#B05B74]'
                          : 'bg-[#FF7A9E] text-white shadow-[0_3px_0_#D9577B] hover:bg-[#F45D86] active:translate-y-0.5'
                      }`}
                    >
                      {count <= 0 ? (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>請先購買</span>
                        </>
                      ) : (
                        <>
                          <Utensils className="w-4 h-4" />
                          <span>餵食給{pet.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {section === 'farm' && (
        <div className="space-y-4">
          {/* Outdoor Storybook Meadow Scene Matching Reference Design */}
          <div className="relative rounded-[28px] border-[3px] border-[#6B5344] bg-[#C6E189] shadow-[0_6px_0_#9AB865] overflow-hidden">
            {/* Upper Pastel Sky, Flanking Leafy Trees, Rolling Hills & Right Red Barn Backdrop */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[350px] z-0">
              <PastoralHorizonBackdrop />
            </div>

            {/* Glass Greenhouse Subtle Roof Sparkle if Upgraded */}
            {house.farmUpgrades.greenhouseLevel > 0 && (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-14 z-10 border-b border-white/75"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, rgba(255,255,255,0.36) 0px, rgba(255,255,255,0.36) 32px, rgba(145,214,229,0.22) 32px, rgba(145,214,229,0.22) 34px)',
                }}
              />
            )}

            {/* Top Compact Controls Over Sky (Signboard, Storage Cap, Active Facilities & Photo Button) */}
            <div className="relative z-10 px-3.5 pt-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSignNameDraft(house.houseName);
                    setEditingSignName((prev) => !prev);
                  }}
                  className={`min-h-[40px] px-2.5 py-1 rounded-2xl border-2 border-[#6B5344] text-left inline-flex items-center gap-1.5 max-w-[65%] shadow-[0_2px_0_#A67E58] transition active:translate-y-0.5 ${
                    house.activeFarmDecor.signId === 'berry_arch_sign'
                      ? 'bg-[#FFEAF2] text-[#A22E58]'
                      : 'bg-[#FFF9EE]/95 text-[#5C3919]'
                  }`}
                >
                  <span className="text-sm shrink-0" aria-hidden="true">
                    {house.activeFarmDecor.signId === 'berry_arch_sign' ? '🌸' : '🪧'}
                  </span>
                  <span className="text-xs font-extrabold truncate">{house.houseName}</span>
                  <Pencil className="w-3 h-3 shrink-0 opacity-75" />
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenFarmPhotoStudio && (
                    <button
                      type="button"
                      onClick={onOpenFarmPhotoStudio}
                      aria-label="在開心農場拍照留念"
                      className="min-h-[40px] px-2.5 rounded-2xl bg-[#FF7CA4] border-2 border-[#6B5344] text-white text-xs font-extrabold shadow-[0_2px_0_#C94D70] inline-flex items-center gap-1 hover:bg-[#FF6B98] active:translate-y-0.5 transition"
                    >
                      <Camera className="w-3.5 h-3.5 shrink-0" />
                      <span>拍照</span>
                    </button>
                  )}
                  <div className="rounded-2xl bg-[#FFF9EE]/95 border-2 border-[#6B5344] px-2.5 py-1 text-right shadow-[0_2px_0_#9AB865]">
                    <div className="text-[10px] font-extrabold text-[#4E3629] leading-tight tabular-nums">
                      倉庫 Lv.{house.farmUpgrades.storageLevel + 1} · {storageCap}份
                    </div>
                  </div>
                </div>
              </div>

              {(house.farmUpgrades.sprinklerLevel > 0 ||
                house.farmUpgrades.greenhouseLevel > 0 ||
                house.activeFarmDecor.flowerbedId !== null ||
                house.activeFarmDecor.fenceId !== null) && (
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold text-[#4E3629]">
                  {house.farmUpgrades.sprinklerLevel > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-[#E9F7FF]/95 border border-[#6B5344]/60 text-[#1E678A]">
                      💧 灑水器運轉中 (-30%時間)
                    </span>
                  )}
                  {house.farmUpgrades.greenhouseLevel > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-[#EAFBF1]/95 border border-[#6B5344]/60 text-[#1F6B54]">
                      🏡 玻璃溫室 (+1收成)
                    </span>
                  )}
                  {house.activeFarmDecor.flowerbedId && (
                    <span className="px-2 py-0.5 rounded-lg bg-[#FFF4DC]/95 border border-[#6B5344]/60 text-[#8A5A12]">
                      {house.activeFarmDecor.flowerbedId === 'lavender_flowerbed'
                        ? '🪻 薰衣草花圃'
                        : '🌼 雛菊花圃'}
                    </span>
                  )}
                  {house.activeFarmDecor.fenceId && (
                    <span className="px-2 py-0.5 rounded-lg bg-[#FFF9EE]/95 border border-[#6B5344]/60 text-[#6B5344]">
                      {house.activeFarmDecor.fenceId === 'white_picket_fence'
                        ? '🤍 奶油白柵欄'
                        : '🪵 暖木圍欄'}
                    </span>
                  )}
                </div>
              )}

              {editingSignName && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (signNameDraft.trim()) {
                      onUpdateHouseName(signNameDraft);
                      setEditingSignName(false);
                    }
                  }}
                  className="rounded-2xl bg-[#FFF9EE] border-2 border-[#6B5344] p-2 flex items-center gap-2 shadow-[0_3px_0_#9AB865]"
                >
                  <input
                    type="text"
                    maxLength={14}
                    value={signNameDraft}
                    onChange={(e) => setSignNameDraft(e.target.value)}
                    placeholder="輸入農場招牌名稱（最多14字）"
                    className="flex-1 min-w-0 min-h-[40px] rounded-xl bg-white border-2 border-[#D7B99B] px-3 text-sm font-bold text-[#4A3531] focus:outline-none focus:border-[#76C8A5]"
                  />
                  <button
                    type="submit"
                    className="min-h-[40px] px-3.5 rounded-xl bg-[#76C8A5] border-2 border-[#6B5344] text-white text-xs font-extrabold shrink-0 shadow-[0_2px_0_#4E9979]"
                  >
                    改名
                  </button>
                </form>
              )}
            </div>

            {/* 1. Scalloped-Top Cream Bulletin Board Floating Over Sky & Barn */}
            <section className="relative z-10 px-3.5 pt-2">
              {/* Continuous Scalloped Cream Top Edge */}
              <div className="w-full overflow-hidden -mb-px" aria-hidden="true">
                <svg
                  viewBox="0 0 360 18"
                  preserveAspectRatio="none"
                  className="w-full h-4 block"
                >
                  <path
                    d="M2 18V12C6 3 18 3 22 12C26 3 38 3 42 12C46 3 58 3 62 12C66 3 78 3 82 12C86 3 98 3 102 12C106 3 118 3 122 12C126 3 138 3 142 12C146 3 158 3 162 12C166 3 178 3 182 12C186 3 198 3 202 12C206 3 218 3 222 12C226 3 238 3 242 12C246 3 258 3 262 12C266 3 278 3 282 12C286 3 298 3 302 12C306 3 318 3 322 12C326 3 338 3 342 12C346 3 356 3 358 12V18Z"
                    fill="#FFF9EE"
                    stroke="#6B5344"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  {/* Mask bottom stroke so scalloped crown joins card body seamlessly */}
                  <rect x="3" y="15" width="354" height="4" fill="#FFF9EE" />
                </svg>
              </div>

              <div className="relative rounded-b-[24px] border-x-[2.4px] border-b-[2.4px] border-[#6B5344] bg-[#FFF9EE] shadow-[0_5px_0_rgba(125,152,78,0.45)] px-3 pb-3.5 pt-1">
                {/* Subtle Inner Cream-Wood Double Frame Line */}
                <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 top-0 rounded-b-[18px] border-x border-b border-[#E5CFAF]" />

                <div className="relative z-10 space-y-2.5">
                  <div className="px-0.5">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#4E3629] leading-snug">
                      選擇要種植的種子（7 種作物）
                    </h3>
                    <p className="text-[11px] font-bold text-[#7A5E4E] mt-0.5">
                      新作物可製作限定美食與手作家具！點選作物後點擊空田地播種。
                    </p>
                  </div>

                  {/* 7 Wooden Plaque Seed Cards (3-Column Grid Matching Artwork) */}
                  <div className="grid grid-cols-3 gap-2">
                    {INGREDIENT_IDS.map((id) => {
                      const info = INGREDIENTS[id];
                      const active = selectedSeed === id;
                      const freeCount = freeSeeds[id] ?? 0;
                      const effectiveSec = Math.max(
                        1,
                        Math.round(
                          getExpectedCropDurationMs(
                            getEffectiveGrowDurationMs(info.growSeconds, house),
                            now,
                            yardMoodBuffPeriods
                          ) / 1000
                        )
                      );
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedSeed(id)}
                          className={`relative min-h-[82px] rounded-[14px] p-1.5 text-center transition flex flex-col items-center justify-center gap-0.5 active:translate-y-0.5 ${
                            active
                              ? 'bg-[#CCF0E4] border-[2.2px] border-[#5BB493] shadow-[0_0_10px_rgba(118,200,165,0.55),0_3px_0_#7AC4A8] text-[#215B46]'
                              : 'bg-gradient-to-b from-[#F8E9D0] to-[#EED5B1] border-[2px] border-[#6B5344] shadow-[0_3px_0_#C9A982] text-[#4E3629] hover:brightness-[1.02]'
                          }`}
                        >
                          {/* Inner Dashed Border for Active Seed Matching Artwork */}
                          {active && (
                            <span
                              className="pointer-events-none absolute inset-[3px] rounded-[10px] border-[1.5px] border-dashed border-[#5DB392]"
                              aria-hidden="true"
                            />
                          )}

                          {/* Subtle Hand-Drawn Wood Grain Lines on Wooden Plaques */}
                          {!active && (
                            <svg
                              viewBox="0 0 90 60"
                              preserveAspectRatio="none"
                              className="pointer-events-none absolute inset-0 w-full h-full opacity-35"
                              aria-hidden="true"
                            >
                              <path
                                d="M6 15Q30 13 54 16M38 46Q62 48 84 44M8 52Q28 50 48 52"
                                fill="none"
                                stroke="#BA9266"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}

                          {/* Top-Right Bare Twin-Leaf Sprout Badge */}
                          {active && (
                            <span className="absolute -top-3 -right-2 z-20 pointer-events-none">
                              <SeedSproutBadge />
                            </span>
                          )}

                          <div className="relative z-10 flex flex-col items-center">
                            <CropIllustration cropId={id} stage="mature" size={34} />
                            <span className="text-xs font-extrabold leading-tight mt-0.5">
                              {info.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold tabular-nums mt-0.5 ${
                                freeCount > 0
                                  ? 'text-[#C83D68]'
                                  : active
                                  ? 'text-[#256D53]'
                                  : 'text-[#6E513F]'
                              }`}
                            >
                              {freeCount > 0
                                ? `🎁免費×${freeCount} · ${effectiveSec}秒`
                                : `${info.seedCost}幣 · ${effectiveSec}秒`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Lush Green Meadow Canvas with Side Fences, Watering Cans, Tools & Cardless 3D Soil Plots */}
            <div className="relative z-10 pt-5 pb-1">
              <YardMoodBuffBadge
                expiresAt={activeBuffExpiresAt}
                now={now}
                className="absolute right-4 top-0 z-30 max-w-[calc(100%-2rem)]"
              />
              {/* Left & Right Wooden Side Fences With Flowers */}
              <div className="pointer-events-none absolute left-0 top-2 z-0">
                <FarmSideFenceSvg side="left" />
              </div>
              <div className="pointer-events-none absolute right-0 top-2 z-0">
                <FarmSideFenceSvg side="right" />
              </div>

              {/* Left Small Watering Cup & Right Watering Can Matching Artwork */}
              <LeftMiniWateringCanSvg className="absolute left-1 top-[148px] z-20" />
              <RightWateringCanSvg className="absolute right-0.5 top-[142px] z-20" />

              {/* Scattered Grass Blades on Lawn */}
              <GrassTuftSvg className="absolute left-9 top-2 opacity-80" />
              <GrassTuftSvg className="absolute right-10 top-6 opacity-80" />
              <GrassTuftSvg className="absolute left-[46%] top-[168px] opacity-80" />
              <GrassTuftSvg className="absolute left-8 bottom-12 opacity-80" />
              <GrassTuftSvg className="absolute right-12 bottom-10 opacity-80" />

              {/* Cardless Soil Plots Sitting Directly on Green Meadow Grass */}
              <section className="relative z-10 px-4 pt-3 space-y-3">
                {((waterableCropsCount > 0 && onWaterAllCrops) ||
                  (readyCropsCount > 0 && onHarvestAllCrops)) && (
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {waterableCropsCount > 0 && onWaterAllCrops && (
                      <button
                        type="button"
                        onClick={handleWaterAllPlots}
                        className="min-h-[38px] px-3 rounded-2xl bg-gradient-to-b from-[#B3ECFF] to-[#74CEF2] border-2 border-[#6B5344] shadow-[0_3px_0_#4396B8] text-xs font-extrabold text-[#154A63] inline-flex items-center gap-1 hover:brightness-105 active:translate-y-0.5 transition"
                      >
                        <span aria-hidden="true">💧</span>
                        <span>一鍵澆水 ({waterableCropsCount})</span>
                      </button>
                    )}
                    {readyCropsCount > 0 && onHarvestAllCrops && (
                      <button
                        type="button"
                        onClick={handleHarvestAllPlots}
                        className="min-h-[38px] px-3 rounded-2xl bg-gradient-to-b from-[#86D6B3] to-[#63BA95] border-2 border-[#6B5344] shadow-[0_3px_0_#439070] text-xs font-extrabold text-white inline-flex items-center gap-1 hover:brightness-105 active:translate-y-0.5 transition"
                      >
                        <span aria-hidden="true">🧺</span>
                        <span>一鍵採收 ({readyCropsCount})</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-3.5 gap-y-8">
                  {farmPlots.map((plot) => {
                    const crop = plot.cropId ? INGREDIENTS[plot.cropId] : null;
                    const growth = getCropGrowthState(plot, now, yardMoodBuffPeriods);
                    const remainingSec = crop
                      ? Math.max(0, Math.ceil(growth.remainingMs / 1000))
                      : 0;
                    const isReady = crop !== null && growth.isReady;
                    const progressPct = crop ? growth.progressPercent : 0;
                    const seedInfo = INGREDIENTS[selectedSeed];
                    const selectedFreeCount = freeSeeds[selectedSeed] ?? 0;
                    const canPlant = selectedFreeCount > 0 || coins >= seedInfo.seedCost;
                    const effectiveYield = crop
                      ? getEffectiveHarvestYield(crop.harvestYield, house)
                      : 2;
                    const isGoldenMature = isReady && Boolean(plot.isGolden);
                    const isWateringNow = Boolean(waterPourPlotIds[plot.id]);
                    const canWater = crop !== null && !isReady && !plot.watered && Boolean(onWaterCrop);
                    const plotBursts = harvestBursts.filter((b) => b.plotId === plot.id);
                    const growthStage: 'sprout' | 'growing' | 'mature' = isReady
                      ? 'mature'
                      : progressPct < 45
                      ? 'sprout'
                      : 'growing';

                    return (
                      <div key={plot.id} className="relative flex flex-col items-center">
                        {/* Floating Harvest Burst Animation */}
                        {plotBursts.map((burst) => (
                          <div
                            key={burst.id}
                            className={`pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 z-30 animate-float-up whitespace-nowrap rounded-full border-2 border-[#6B5344] px-2.5 py-0.5 text-xs font-extrabold shadow-sm ${
                              burst.isGolden
                                ? 'bg-[#FFE77A] text-[#6B3F05]'
                                : 'bg-[#FFF7D6] text-[#9A5B14]'
                            }`}
                          >
                            {burst.emoji} {burst.text}
                          </div>
                        ))}

                        {/* Pouring Water & Floating Hearts Overlay When Watered */}
                        {isWateringNow && <WateringPourOverlaySvg />}

                        {/* Top-Left Tilted Wooden Plot Sign Stake */}
                        <div className="absolute -top-4 left-2 z-20">
                          <WoodenPlotSignSvg label={`田地 #${plot.id + 1}`} />
                        </div>

                        {/* Interactive Watering Can / Droplet Button Beside Growing Plot (1x Per Crop, -5s) */}
                        {canWater && (
                          <button
                            type="button"
                            onClick={() => handleWaterPlot(plot.id)}
                            aria-label={`為田地 #${plot.id + 1} 澆水減少 5 秒`}
                            className="absolute -top-3.5 -right-1 z-20 min-w-[44px] min-h-[44px] px-2 rounded-full bg-gradient-to-b from-[#B3ECFF] to-[#74CEF2] border-2 border-[#6B5344] shadow-[0_3px_0_#4396B8] inline-flex items-center justify-center gap-0.5 text-[10px] font-extrabold text-[#154A63] hover:brightness-105 active:translate-y-0.5 transition"
                          >
                            <WateringButtonIconSvg />
                            <span>-5s</span>
                          </button>
                        )}

                        {/* Organic Lumpy 3D Brown Soil Bed (#C6A484) Directly on Grass */}
                        <div
                          onClick={() => {
                            if (isReady && plot.cropId) {
                              handleHarvestPlot(plot, effectiveYield);
                            }
                          }}
                          className={`relative w-full min-h-[122px] px-3 pt-6 pb-6 flex flex-col items-center justify-center text-center transition ${
                            isReady ? 'cursor-pointer hover:brightness-[1.03]' : ''
                          }`}
                        >
                          <SoilBedBackdropSvg isReady={isReady} isGolden={isGoldenMature} />

                          {/* Sprinkler / Already Watered Subtle Indicator */}
                          {crop && !isReady && plot.watered && (
                            <span className="absolute right-3 top-2.5 text-[10px] font-extrabold text-[#1F5A78] z-10 pointer-events-none">
                              💧已澆水
                            </span>
                          )}
                          {(!crop || !plot.watered) &&
                            house.farmUpgrades.sprinklerLevel > 0 &&
                            plot.id % 2 === 0 && (
                              <span
                                className="absolute right-3.5 top-3 text-xs z-10 pointer-events-none"
                                aria-hidden="true"
                              >
                                💧
                              </span>
                            )}

                          {crop ? (
                            <div className="relative z-10 w-full flex flex-col items-center gap-0.5">
                              <div className="relative flex items-center justify-center">
                                {isGoldenMature && <GoldenAuraSvg />}
                                <div
                                  className={
                                    isGoldenMature
                                      ? 'scale-[1.3] drop-shadow-[0_0_8px_rgba(255,204,41,0.95)] brightness-110 saturate-125'
                                      : ''
                                  }
                                >
                                  <CropIllustration
                                    cropId={plot.cropId!}
                                    stage={growthStage}
                                    size={isReady ? 52 : 46}
                                    className={isReady ? 'animate-bounce' : ''}
                                  />
                                </div>
                                {isReady && !isGoldenMature && (
                                  <span
                                    className="absolute -top-1 -right-2 text-xs animate-pulse"
                                    aria-hidden="true"
                                  >
                                    ✨
                                  </span>
                                )}
                              </div>

                              <span
                                className={`text-xs font-extrabold ${
                                  isGoldenMature ? 'text-[#7A4403]' : 'text-[#462E20]'
                                }`}
                              >
                                {isGoldenMature ? `🌟 黃金${crop.name}` : crop.name}
                              </span>

                              {isReady ? (
                                <span
                                  className={`text-[11px] font-extrabold ${
                                    isGoldenMature ? 'text-[#9A4E04]' : 'text-[#8A4A0B]'
                                  }`}
                                >
                                  {isGoldenMature
                                    ? `雙倍金幣 +${crop.seedCost * 2}`
                                    : `點擊可採收 +${effectiveYield}`}
                                </span>
                              ) : (
                                <div className="w-full max-w-[112px] space-y-1 mt-0.5">
                                  <p className="text-[10px] font-extrabold text-[#462E20] tabular-nums">
                                    剩餘 {remainingSec} 秒
                                  </p>
                                  <div className="w-full h-2 rounded-full bg-[#FFF6E6] border-[1.5px] border-[#6B5344] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#76C8A5] transition-all duration-300"
                                      style={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="relative z-10 flex flex-col items-center justify-center py-2">
                              <span className="text-xs font-extrabold text-[#462E20]">
                                田地 #{plot.id + 1}
                              </span>
                              <p className="text-[11px] font-bold text-[#5B4030] mt-0.5">
                                空田地，可播種
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Floating 3D Candy / Golden Harvest Button Overlapping Bottom Dirt Rim */}
                        <div className="-mt-5 relative z-20 w-[92%]">
                          {crop ? (
                            <button
                              type="button"
                              disabled={!isReady}
                              onClick={() => handleHarvestPlot(plot, effectiveYield)}
                              className={`w-full min-h-[42px] rounded-full border-2 border-[#6B5344] px-2.5 text-xs font-extrabold transition ${
                                isGoldenMature
                                  ? 'bg-gradient-to-b from-[#FFE675] to-[#F7B932] text-[#5C3A08] shadow-[inset_0_2px_0_rgba(255,255,255,0.6),0_4px_0_#C28816] hover:brightness-105 active:translate-y-0.5'
                                  : isReady
                                  ? 'bg-gradient-to-b from-[#86D6B3] to-[#63BA95] text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.45),0_4px_0_#439070] hover:brightness-105 active:translate-y-0.5'
                                  : 'bg-[#EDE3D6] text-[#7D6658] shadow-[0_3px_0_#C2B29F] cursor-not-allowed'
                              }`}
                            >
                              {isGoldenMature
                                ? `採收黃金${crop.name} (+${crop.seedCost * 2}幣)`
                                : isReady
                                ? `採收 ${crop.name} +${effectiveYield}`
                                : '細心灌溉中…'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!canPlant}
                              onClick={() => onPlantCrop(plot.id, selectedSeed)}
                              className={`w-full min-h-[42px] rounded-full border-2 border-[#6B5344] px-2.5 text-xs font-extrabold transition ${
                                canPlant
                                  ? 'bg-gradient-to-b from-[#FF8AA8] to-[#FF6D92] text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.45),0_4px_0_#C94D70] hover:brightness-105 active:translate-y-0.5'
                                  : 'bg-[#E5DCD4] text-[#8E7C71] shadow-[0_3px_0_#BFB2A7] cursor-not-allowed'
                              }`}
                            >
                              {selectedFreeCount > 0
                                ? `免費種${seedInfo.name} (🎁×${selectedFreeCount})`
                                : `種${seedInfo.name} (${seedInfo.seedCost} 金幣)`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Next Expansion Plot Integrated on the Meadow */}
                  {nextExpandPlotNumber && (
                    <div className="relative flex flex-col items-center">
                      <div className="absolute -top-4 left-2 z-20">
                        <WoodenPlotSignSvg label={`新田地 #${nextExpandPlotNumber}`} />
                      </div>

                      <div className="w-full min-h-[122px] rounded-[24px] border-[2.5px] border-dashed border-[#6B5344]/70 bg-[#BFE084]/80 px-2.5 pt-6 pb-6 flex flex-col items-center justify-center text-center">
                        <div className="w-9 h-9 rounded-full bg-[#FFF9EE] border-2 border-[#6B5344] text-[#6B5344] flex items-center justify-center mb-1">
                          <Lock className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-extrabold text-[#4E3629]">
                          擴建第 {nextExpandPlotNumber} 塊農地
                        </h4>
                        <p className="text-[11px] font-bold text-[#61493B] mt-0.5">
                          開墾後一起播種採收！
                        </p>
                      </div>

                      <div className="-mt-5 relative z-20 w-[92%]">
                        <button
                          type="button"
                          disabled={availableFarmCoins < nextExpandCost}
                          onClick={() => onExpandFarmPlot(farmPaySource)}
                          className={`w-full min-h-[42px] rounded-full border-2 border-[#6B5344] px-2.5 text-xs font-extrabold transition ${
                            availableFarmCoins >= nextExpandCost
                              ? 'bg-gradient-to-b from-[#FFE073] to-[#F7C548] text-[#4E3629] shadow-[inset_0_2px_0_rgba(255,255,255,0.5),0_4px_0_#C29327] hover:brightness-105 active:translate-y-0.5'
                              : 'bg-[#E5DCD4] text-[#8E7C71] shadow-[0_3px_0_#BFB2A7] cursor-not-allowed'
                          }`}
                        >
                          開墾 ({nextExpandCost} 幣)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Bottom-Left Garden Trowel & Hand Fork Resting on Grass Above Bottom Fence */}
              <div className="relative h-8 mt-1">
                <BottomLeftGardenToolsSvg className="absolute left-3 -top-2 z-20" />
              </div>

              {/* Split Bottom Fence + Flowers + Center Interactive Treasure Puppy */}
              <FarmBottomFenceScene
                puppyHasTreasure={puppyTreasureReady}
                puppyHappy={puppyHappy}
                puppyRewardText={puppyRewardText}
                onClickPuppy={handleClickPuppy}
              />
            </div>
          </div>

          {/* Ingredients Warehouse Below the Meadow Artwork */}
          <section className="rounded-3xl bg-[#FFF9EE] border-2 border-[#6B5344] p-3.5 space-y-2.5 shadow-[0_4px_0_#D8C3AE]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#4E3629]">🧺 食材小倉庫</h3>
              <span className="text-[11px] font-extrabold text-[#2D7A5D] tabular-nums">
                每種儲存上限 {storageCap} 份
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {INGREDIENT_IDS.map((id) => {
                const info = INGREDIENTS[id];
                const qty = ingredients[id] ?? 0;
                const isNearCap = qty >= storageCap;
                return (
                  <div
                    key={id}
                    className={`rounded-xl border-[1.8px] border-[#6B5344]/75 p-1.5 text-center flex flex-col items-center ${
                      isNearCap ? 'bg-[#FFF0C8]' : 'bg-[#F2FBF5]'
                    }`}
                  >
                    <CropIllustration cropId={id} stage="mature" size={26} />
                    <p className="text-[10px] font-extrabold text-[#5C4132] mt-0.5 truncate w-full">
                      {info.name}
                    </p>
                    <p className="text-[10px] font-extrabold text-[#2D7A5D] tabular-nums">
                      {qty}/{storageCap}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Farm Upgrades & Decorations Shop */}
          <section className="rounded-3xl bg-[#FFF9EE] border-2 border-[#6B5344] p-3.5 space-y-3 shadow-[0_4px_0_#D8C3AE]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#4A3531]">農場設施升級與裝飾</h3>
                <p className="text-[11px] text-[#7D635D]">
                  購買灑水器、玻璃溫室、小倉庫與圍欄花圃，打造夢幻莊園！
                </p>
              </div>
            </div>

            {/* Pay Source Toggle */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#EFE2D5] p-1 rounded-xl border border-[#6B5344]/30">
              <button
                type="button"
                onClick={() => setFarmPaySource('personal')}
                className={`min-h-[40px] rounded-lg text-xs font-extrabold transition ${
                  farmPaySource === 'personal'
                    ? 'bg-white text-[#9D5B12] shadow-xs'
                    : 'text-[#6E544E]'
                }`}
              >
                🪙 個人金幣 ({coins})
              </button>
              <button
                type="button"
                onClick={() => setFarmPaySource('treasury')}
                className={`min-h-[40px] rounded-lg text-xs font-extrabold transition ${
                  farmPaySource === 'treasury'
                    ? 'bg-white text-[#256D57] shadow-xs'
                    : 'text-[#6E544E]'
                }`}
              >
                💞 共同金庫 ({house.treasuryCoins})
              </button>
            </div>

            {/* Facility Upgrades */}
            <div className="space-y-2">
              {FARM_UPGRADES.map((upg) => {
                const curLvl =
                  upg.id === 'sprinkler'
                    ? house.farmUpgrades.sprinklerLevel
                    : upg.id === 'greenhouse'
                    ? house.farmUpgrades.greenhouseLevel
                    : house.farmUpgrades.storageLevel;
                const isMax = curLvl >= upg.maxLevel;
                const price = upg.prices[curLvl] ?? upg.prices[upg.prices.length - 1];
                const canUpgrade = !isMax && availableFarmCoins >= price;

                return (
                  <div
                    key={upg.id}
                    className="rounded-2xl bg-[#F4FBF7] border-2 border-[#6B5344]/40 p-3 flex items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-[#4A3531]">
                        {upg.emoji} {upg.name}
                        {upg.maxLevel > 1 ? ` (Lv.${curLvl}/${upg.maxLevel})` : ''}
                      </div>
                      <p className="text-[11px] text-[#6E544E] mt-0.5 leading-snug">
                        {upg.description}
                      </p>
                      {!isMax && upg.effectSummaries[curLvl] && (
                        <p className="text-[11px] font-extrabold text-[#1F6B54] mt-0.5">
                          下一級：{upg.effectSummaries[curLvl]}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isMax || !canUpgrade}
                      onClick={() => onUpgradeFarmFacility(upg.id, farmPaySource)}
                      className={`min-h-[44px] px-3 rounded-xl border-2 border-[#6B5344] text-xs font-extrabold shrink-0 transition ${
                        isMax
                          ? 'bg-[#DFF5EA] text-[#256D57]'
                          : canUpgrade
                          ? 'bg-[#76C8A5] text-white shadow-[0_3px_0_#4E9979] active:translate-y-0.5'
                          : 'bg-[#EAE0D9] text-[#9E8B84] border-[#B6A598] cursor-not-allowed'
                      }`}
                    >
                      {isMax ? '已啟用' : `${price} 金幣`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Farm Decorations */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-extrabold text-[#4A3531]">裝飾圍欄、花圃與招牌</p>
              <div className="grid grid-cols-2 gap-2">
                {FARM_DECORATIONS.map((dec) => {
                  const owned = house.ownedFarmDecorations.includes(dec.id);
                  const active =
                    house.activeFarmDecor.fenceId === dec.id ||
                    house.activeFarmDecor.flowerbedId === dec.id ||
                    house.activeFarmDecor.signId === dec.id;
                  const canAfford = owned || availableFarmCoins >= dec.price;

                  return (
                    <article
                      key={dec.id}
                      className="rounded-2xl bg-[#FFFDF8] border-2 border-[#6B5344]/35 p-2.5 flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-extrabold text-[#4A3531]">
                          {dec.emoji} {dec.name}
                        </div>
                        <p className="text-[11px] text-[#7D635D] mt-0.5 leading-snug">
                          {dec.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onToggleFarmDecoration(dec.id, farmPaySource)}
                        className={`min-h-[40px] rounded-xl border-[1.8px] border-[#6B5344] text-xs font-extrabold inline-flex items-center justify-center gap-1 transition ${
                          active
                            ? 'bg-[#76C8A5] text-white'
                            : owned
                            ? 'bg-[#FFEAF0] text-[#B83B64]'
                            : canAfford
                            ? 'bg-[#FFF3D1] text-[#7A540E]'
                            : 'bg-[#EAE0D9] text-[#9E8B84] border-[#B6A598] cursor-not-allowed'
                        }`}
                      >
                        {active ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>擺設中</span>
                          </>
                        ) : owned ? (
                          <span>啟用裝飾</span>
                        ) : (
                          <span>購買 ({dec.price} 幣)</span>
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}

      {section === 'kitchen' && (
        <div className="space-y-3">
          <section className="rounded-2xl bg-[#FFF6E5] border border-[#F2D9A5] px-3.5 py-2.5 space-y-1 text-xs font-bold text-[#7A540E]">
            <div>目前食材庫存：</div>
            <div className="tabular-nums leading-relaxed">
              {INGREDIENT_IDS.map((id) => `${INGREDIENTS[id].emoji} ${ingredients[id] ?? 0}`).join(
                ' · '
              )}
            </div>
          </section>

          {KITCHEN_RECIPES.map((recipe) => {
            const reqEntries = Object.entries(recipe.ingredients) as [IngredientId, number][];
            const canCook = reqEntries.every(([id, need]) => (ingredients[id] ?? 0) >= need);
            const isFavorite = speciesInfo.favoriteFoodIds.includes(recipe.outputFoodId);
            const currentFoodCount = inventory[recipe.outputFoodId] ?? 0;

            return (
              <article
                key={recipe.id}
                className={`rounded-3xl bg-[#FFFDF8] border-2 p-3.5 space-y-2.5 ${
                  isFavorite ? 'border-[#FFACC3]' : 'border-[#F4DFD7]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF4DC] border border-[#F5DFA8] flex items-center justify-center text-3xl shrink-0">
                    <span aria-hidden="true">{recipe.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-extrabold text-[#4A3531] truncate">
                        {recipe.name}
                      </h3>
                      <span className="text-xs font-bold text-[#826862] tabular-nums whitespace-nowrap">
                        餐點庫存 {currentFoodCount}
                      </span>
                    </div>
                    {isFavorite && (
                      <p className="text-[11px] font-extrabold text-[#D64470] mt-0.5">
                        ♥ {speciesInfo.shortName}最愛料理
                      </p>
                    )}
                    <p className="text-xs text-[#7D635D] mt-0.5 leading-relaxed">
                      {recipe.description}
                    </p>
                    <p className="text-[11px] font-bold text-[#5A423C] mt-1.5 tabular-nums">
                      所需食材：
                      {reqEntries
                        .map(
                          ([id, need]) =>
                            `${INGREDIENTS[id].emoji} ${INGREDIENTS[id].name} ${ingredients[id] ?? 0}/${need}`
                        )
                        .join('  ·  ')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canCook}
                  onClick={() => onCookRecipe(recipe)}
                  className={`w-full min-h-[44px] rounded-2xl px-3 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
                    canCook
                      ? 'bg-[#5CC9A7] text-white shadow-[0_3px_0_#3BA886] hover:bg-[#49B895] active:translate-y-0.5'
                      : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                  }`}
                >
                  <CookingPot className="w-4 h-4" />
                  <span>
                    {canCook ? `合成料理 (+1 份 · 成長 +${recipe.bonusGrowth})` : '食材不足，先去農場種植'}
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      )}
      {isBannerCompact && (section === 'shop' || section === 'kitchen') && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pt-1.5 z-20 pointer-events-none">
          <div className="pointer-events-auto rounded-2xl bg-[#FFFDF8]/95 backdrop-blur-md border-2 border-[#F5DFD7] shadow-lg px-3 py-2 flex items-center gap-2.5">
            <div className="shrink-0 rounded-2xl bg-gradient-to-b from-[#FFEAF0] to-[#FFF6DA] border border-[#F3D7DF] p-0.5">
              <PiggyCharacter
                species={pet.species}
                growth={pet.growth}
                roundness={pet.roundness}
                action={action}
                equipped={pet.accessories}
                flyingFoodEmoji={flyingFoodEmoji}
                interactive={false}
                size={54}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-[#4A3531] truncate">
                  {section === 'kitchen' ? '萌寵廚房 · 食材庫存' : `${pet.name}的食堂桌`}
                </span>
                <span className="text-[11px] font-extrabold text-[#D64470] tabular-nums shrink-0">
                  飽食 {pet.hunger}%
                </span>
              </div>
              {section === 'kitchen' ? (
                <p className="text-[11px] font-bold text-[#7A540E] truncate tabular-nums mt-0.5">
                  {INGREDIENT_IDS.map((id) => `${INGREDIENTS[id].emoji}${ingredients[id] ?? 0}`).join(
                    ' · '
                  )}
                </p>
              ) : (
                <p className="text-[11px] font-bold text-[#6E544E] truncate mt-0.5">
                  {isFull ? `${pet.name}已經吃飽了！` : speech || speciesInfo.greeting}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="回到食堂頂部"
              className="min-h-[36px] min-w-[36px] rounded-xl bg-[#F3EAE5] text-[#5A3E36] flex items-center justify-center hover:bg-[#E7DBD4] active:scale-95 transition shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
