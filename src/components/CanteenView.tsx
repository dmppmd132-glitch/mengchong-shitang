import React, { useEffect, useState } from 'react';
import { Coins, CookingPot, Gamepad2, ShoppingBag, Sprout, Utensils } from 'lucide-react';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS, FOODS } from '../data/foods';
import { INGREDIENT_IDS, INGREDIENTS, KITCHEN_RECIPES } from '../data/kitchen';
import { getPetSpeciesInfo } from '../data/species';
import {
  CropPlot,
  Food,
  FoodCategory,
  IngredientId,
  KitchenRecipe,
  Pet,
  PiggyActionState,
} from '../types';
import { PiggyCharacter } from './PiggyCharacter';

interface CanteenViewProps {
  pet: Pet;
  action: PiggyActionState;
  flyingFoodEmoji: string | null;
  speech: string;
  coins: number;
  inventory: Record<string, number>;
  ingredients: Record<IngredientId, number>;
  farmPlots: CropPlot[];
  onFeed: (food: Food) => void;
  onBuyFood: (food: Food) => void;
  onPlantCrop: (plotId: number, ingredientId: IngredientId) => void;
  onHarvestCrop: (plotId: number) => void;
  onCookRecipe: (recipe: KitchenRecipe) => void;
  onOpenMinigame?: () => void;
}

type CanteenSection = 'shop' | 'farm' | 'kitchen';
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
  onFeed,
  onBuyFood,
  onPlantCrop,
  onHarvestCrop,
  onCookRecipe,
  onOpenMinigame,
}) => {
  const [section, setSection] = useState<CanteenSection>('shop');
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [selectedSeed, setSelectedSeed] = useState<IngredientId>('carrot');
  const [now, setNow] = useState<number>(() => Date.now());

  const hasGrowingCrops = farmPlots.some((p) => p.cropId !== null);

  useEffect(() => {
    if (!hasGrowingCrops) return;
    setNow(Date.now());
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hasGrowingCrops]);

  const speciesInfo = getPetSpeciesInfo(pet.species);
  const items = filter === 'all' ? FOODS : FOODS.filter((f) => f.category === filter);
  const isFull = pet.hunger >= 100;

  const readyCropsCount = farmPlots.filter(
    (p) => p.cropId !== null && p.plantedAt !== null && now >= p.plantedAt + p.durationMs
  ).length;

  return (
    <div className="px-4 pt-3 pb-24 space-y-4">
      <section className="rounded-3xl bg-gradient-to-r from-[#FFEAF0] to-[#FFF6DA] border-2 border-[#F5DFD7] p-3.5 flex items-center gap-3">
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
        <div className="space-y-3.5">
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#D4EFE4] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#4A3531]">食材庫存</h3>
              <span className="text-[11px] font-bold text-[#7D635D]">收成後可到廚房做料理</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {INGREDIENT_IDS.map((id) => {
                const info = INGREDIENTS[id];
                const qty = ingredients[id] ?? 0;
                return (
                  <div
                    key={id}
                    className="rounded-2xl bg-[#F4FBF8] border border-[#CFECE0] p-2.5 text-center"
                  >
                    <div className="text-2xl leading-none" aria-hidden="true">
                      {info.emoji}
                    </div>
                    <p className="text-xs font-extrabold text-[#4A3531] mt-1">{info.name}</p>
                    <p className="text-xs font-extrabold text-[#256D57] tabular-nums">
                      庫存 {qty}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD7] p-3.5 space-y-2.5">
            <div>
              <h3 className="text-sm font-extrabold text-[#4A3531]">選擇要種植的種子</h3>
              <p className="text-[11px] text-[#7D635D]">
                先點選一種作物種子，再點擊下方空田地即可開始種植
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {INGREDIENT_IDS.map((id) => {
                const info = INGREDIENTS[id];
                const active = selectedSeed === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedSeed(id)}
                    className={`min-h-[68px] rounded-2xl p-2 border-2 text-center transition flex flex-col items-center justify-center gap-0.5 ${
                      active
                        ? 'bg-[#E8F8F2] border-[#5CC9A7] text-[#1E5C49]'
                        : 'bg-[#FFFDF8] border-[#EFE2DC] text-[#5A423C] hover:bg-[#FAF6F2]'
                    }`}
                  >
                    <span className="text-xl leading-none" aria-hidden="true">
                      {info.emoji}
                    </span>
                    <span className="text-xs font-extrabold">{info.name}</span>
                    <span className="text-[11px] font-bold text-[#826862] tabular-nums">
                      {info.seedCost} 金幣 · {info.growSeconds}秒
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2.5">
            {farmPlots.map((plot) => {
              const crop = plot.cropId ? INGREDIENTS[plot.cropId] : null;
              const plantedAt = plot.plantedAt ?? now;
              const elapsed = Math.max(0, now - plantedAt);
              const remainingSec = crop
                ? Math.max(0, Math.ceil((plot.durationMs - elapsed) / 1000))
                : 0;
              const isReady = crop !== null && elapsed >= plot.durationMs;
              const progressPct =
                crop && plot.durationMs > 0
                  ? Math.min(100, Math.round((elapsed / plot.durationMs) * 100))
                  : 0;
              const seedInfo = INGREDIENTS[selectedSeed];
              const canPlant = coins >= seedInfo.seedCost;

              return (
                <article
                  key={plot.id}
                  className={`rounded-3xl border-2 p-3 flex flex-col justify-between gap-2.5 ${
                    isReady
                      ? 'bg-[#FFF8DF] border-[#F2CE6D]'
                      : crop
                      ? 'bg-[#F3FBF8] border-[#BCE6D5]'
                      : 'bg-[#FFFDF8] border-[#EFE2DC]'
                  }`}
                >
                  <div className="text-center space-y-1">
                    <div className="text-3xl leading-none py-1" aria-hidden="true">
                      {crop ? (isReady ? crop.emoji : '🌱') : '🟫'}
                    </div>
                    <h4 className="text-xs font-extrabold text-[#4A3531]">
                      {crop ? crop.name : `田地 #${plot.id + 1}`}
                    </h4>
                    {crop ? (
                      isReady ? (
                        <p className="text-[11px] font-extrabold text-[#9D5B12]">
                          已成熟！可採收 +{crop.harvestYield}
                        </p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-[#256D57] tabular-nums">
                            生長中 · 剩餘 {remainingSec} 秒
                          </p>
                          <div className="w-full h-1.5 rounded-full bg-[#DCEFE7] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#5CC9A7] transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )
                    ) : (
                      <p className="text-[11px] text-[#8A716B]">空田地 · 可播種</p>
                    )}
                  </div>

                  {crop ? (
                    <button
                      type="button"
                      disabled={!isReady}
                      onClick={() => onHarvestCrop(plot.id)}
                      className={`w-full min-h-[40px] rounded-xl text-xs font-extrabold transition ${
                        isReady
                          ? 'bg-[#5CC9A7] text-white shadow-[0_2px_0_#3BA886] hover:bg-[#49B895] active:translate-y-0.5'
                          : 'bg-[#E5F2ED] text-[#6B9687] cursor-not-allowed'
                      }`}
                    >
                      {isReady ? `採收 ${crop.name} +${crop.harvestYield}` : '細心灌溉中…'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canPlant}
                      onClick={() => onPlantCrop(plot.id, selectedSeed)}
                      className={`w-full min-h-[40px] rounded-xl text-xs font-extrabold transition ${
                        canPlant
                          ? 'bg-[#FF7A9E] text-white hover:bg-[#F45D86] active:scale-95'
                          : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                      }`}
                    >
                      種{seedInfo.name} ({seedInfo.seedCost} 金幣)
                    </button>
                  )}
                </article>
              );
            })}
          </section>
        </div>
      )}

      {section === 'kitchen' && (
        <div className="space-y-3">
          <section className="rounded-2xl bg-[#FFF6E5] border border-[#F2D9A5] px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-[#7A540E]">
            <span>目前食材：</span>
            <span className="tabular-nums">
              {INGREDIENT_IDS.map((id) => `${INGREDIENTS[id].emoji} ${ingredients[id] ?? 0}`).join('  ·  ')}
            </span>
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
                  <span>{canCook ? `合成料理 (+1 份 · 成長 +${recipe.bonusGrowth})` : '食材不足，先去農場種植'}</span>
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
