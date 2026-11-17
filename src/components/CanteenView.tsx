import React, { useState } from 'react';
import { Coins, ShoppingBag, Utensils } from 'lucide-react';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS, FOODS } from '../data/foods';
import { Food, FoodCategory, Pet, PiggyActionState } from '../types';
import { PiggyCharacter } from './PiggyCharacter';

interface CanteenViewProps {
  pet: Pet;
  action: PiggyActionState;
  speech: string;
  coins: number;
  inventory: Record<string, number>;
  onFeed: (food: Food) => void;
  onBuyFood: (food: Food) => void;
}

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
  speech,
  coins,
  inventory,
  onFeed,
  onBuyFood,
}) => {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const items = filter === 'all' ? FOODS : FOODS.filter((f) => f.category === filter);
  const isFull = pet.hunger >= 100;

  return (
    <div className="px-4 pt-3 pb-24 space-y-4">
      <section className="rounded-3xl bg-gradient-to-r from-[#FFEAF0] to-[#FFF6DA] border-2 border-[#F5DFD7] p-3.5 flex items-center gap-3">
        <div className="shrink-0">
          <PiggyCharacter
            growth={pet.growth}
            roundness={pet.roundness}
            action={action}
            equipped={pet.accessories}
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
            {speech || (isFull ? '吃得飽嘟嘟了，先去散步或休息吧！' : '今天想吃點什麼好料呢？')}
          </p>
        </div>
      </section>

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

          return (
            <article
              key={food.id}
              className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD7] p-3.5 space-y-2.5"
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF4DC] border border-[#F5DFA8] flex items-center justify-center text-3xl shrink-0">
                  <span aria-hidden="true">{food.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-extrabold text-[#4A3531]">
                      {food.name}
                    </h3>
                    <span className="text-xs font-bold text-[#826862] tabular-nums">
                      {FOOD_CATEGORY_LABELS[food.category]} · 庫存 {count}
                    </span>
                  </div>
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
    </div>
  );
};
