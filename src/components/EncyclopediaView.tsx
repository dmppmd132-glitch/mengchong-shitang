import React, { useState } from 'react';
import { Award, CheckCircle2, Coins, HelpCircle, Sparkles, Utensils } from 'lucide-react';
import { ACCESSORIES, ACCESSORY_SLOT_LABELS } from '../data/accessories';
import {
  ACCESSORY_MILESTONE_COINS,
  ACCESSORY_MILESTONE_GROWTH,
  TITLE_DEFINITIONS,
} from '../data/encyclopedia';
import { FOOD_CATEGORY_LABELS, FOODS } from '../data/foods';
import { EncyclopediaState, TitleId } from '../types';
import { getAccessoryMilestoneThresholds } from '../utils/encyclopedia';
import { AccessoryPreview } from './AccessoryPreview';

interface EncyclopediaViewProps {
  encyclopedia: EncyclopediaState;
  unlockedAccessories: string[];
  initialSection?: 'foods' | 'accessories';
  onSelectTitle?: (titleId: TitleId | null) => void;
}

export const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({
  encyclopedia,
  unlockedAccessories,
  initialSection = 'foods',
  onSelectTitle,
}) => {
  const [section, setSection] = useState<'foods' | 'accessories'>(initialSection);

  const collectedFoodSet = new Set(encyclopedia.collectedFoodIds);
  const collectedFoodCount = FOODS.filter((f) => collectedFoodSet.has(f.id)).length;

  const ownedAccessorySet = new Set(unlockedAccessories);
  const collectedAccessoryCount = ACCESSORIES.filter((a) =>
    ownedAccessorySet.has(a.id)
  ).length;

  const milestones = getAccessoryMilestoneThresholds();
  const titleIds: TitleId[] = ['gourmet_owner', 'fashion_stylist'];

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-r from-[#FFF3D8] via-[#FFEAF0] to-[#E6F8F1] border-2 border-[#F3DFD7] p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-[#4A3531]">
              美食與時尚圖鑑
            </h2>
            <p className="text-xs text-[#7D635D] mt-0.5">
              收集料理與可愛配件，解鎖里程碑獎勵與專屬稱號！
            </p>
          </div>
          <Award className="w-6 h-6 text-[#D64470] shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-2xl bg-white/85 border border-[#F2E0D6] px-3 py-2">
            <div className="text-[11px] font-bold text-[#826862]">食物圖鑑</div>
            <div className="text-sm font-extrabold text-[#D64470] tabular-nums mt-0.5">
              已收集 {collectedFoodCount} / {FOODS.length}
            </div>
          </div>
          <div className="rounded-2xl bg-white/85 border border-[#F2E0D6] px-3 py-2">
            <div className="text-[11px] font-bold text-[#826862]">配件圖鑑</div>
            <div className="text-sm font-extrabold text-[#256D57] tabular-nums mt-0.5">
              已收集 {collectedAccessoryCount} / {ACCESSORIES.length}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-extrabold text-[#6E544E]">
            專屬榮譽稱號（點擊已解鎖稱號可佩戴於首頁）
          </div>
          <div className="grid grid-cols-2 gap-2">
            {titleIds.map((tId) => {
              const def = TITLE_DEFINITIONS[tId];
              const isUnlocked = encyclopedia.unlockedTitles.includes(tId);
              const isActive = encyclopedia.activeTitle === tId;
              return (
                <button
                  key={tId}
                  type="button"
                  disabled={!isUnlocked || !onSelectTitle}
                  onClick={() => onSelectTitle?.(isActive ? null : tId)}
                  className={`rounded-2xl border-2 px-3 py-2 text-left transition ${
                    isUnlocked
                      ? isActive
                        ? `${def.badgeClass} ring-2 ring-[#FF7A9E]/40`
                        : `${def.badgeClass} opacity-90 hover:opacity-100`
                      : 'bg-[#F7F2ED] border-[#E7DDD6] text-[#9B8982] cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold inline-flex items-center gap-1">
                      <span>{isUnlocked ? def.emoji : '🔒'}</span>
                      <span>{def.name}</span>
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-extrabold text-[#D64470]">
                        佩戴中
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold mt-0.5 opacity-85">
                    {isUnlocked ? def.description : def.unlockCondition}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-1.5 bg-[#F2E5DE] p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setSection('foods')}
          className={`min-h-[42px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
            section === 'foods'
              ? 'bg-white text-[#D64470] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>食物圖鑑 ({collectedFoodCount}/{FOODS.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('accessories')}
          className={`min-h-[42px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
            section === 'accessories'
              ? 'bg-white text-[#256D57] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>配件圖鑑 ({collectedAccessoryCount}/{ACCESSORIES.length})</span>
        </button>
      </div>

      {section === 'foods' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-[#4A3531]">全部料理收集進度</h3>
            <span className="text-xs font-extrabold text-[#D64470] tabular-nums">
              已收集 {collectedFoodCount} / {FOODS.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {FOODS.map((food) => {
              const collected = collectedFoodSet.has(food.id);
              return (
                <article
                  key={food.id}
                  className={`rounded-3xl border-2 p-3 flex flex-col items-center text-center transition ${
                    collected
                      ? 'bg-[#FFFDF8] border-[#F4DFD7]'
                      : 'bg-[#F5EFEA] border-[#E7DCD5]'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl relative ${
                      collected
                        ? 'bg-[#FFF3DC] border border-[#F3DCAB]'
                        : 'bg-[#E9DFD8] border border-[#DBD0C8]'
                    }`}
                  >
                    {collected ? (
                      <span aria-hidden="true">{food.emoji}</span>
                    ) : (
                      <>
                        <span
                          className="grayscale brightness-0 opacity-20 select-none"
                          aria-hidden="true"
                        >
                          {food.emoji}
                        </span>
                        <HelpCircle className="w-5 h-5 text-[#8A766F] absolute" />
                      </>
                    )}
                  </div>

                  <h4 className="mt-2 text-xs font-extrabold text-[#4A3531]">
                    {collected ? food.name : '???'}
                  </h4>
                  <span className="text-[10px] font-bold text-[#8B716A] mt-0.5">
                    {collected
                      ? FOOD_CATEGORY_LABELS[food.category]
                      : '餵食或料理後解鎖'}
                  </span>
                  {collected && (
                    <p className="mt-1 text-[10px] text-[#7D635D] leading-snug">
                      {food.description}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {section === 'accessories' && (
        <section className="space-y-3">
          <div className="rounded-2xl bg-[#FFFDF8] border-2 border-[#E6DFD7] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#4A3531]">
                每收集 5 款配件獎勵里程碑
              </span>
              <span className="font-extrabold text-[#256D57] tabular-nums">
                已收集 {collectedAccessoryCount} / {ACCESSORIES.length}
              </span>
            </div>
            <p className="text-[11px] text-[#7D635D]">
              每達成 5 款自動發放 +{ACCESSORY_MILESTONE_COINS} 金幣與 +{ACCESSORY_MILESTONE_GROWTH} 成長值
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {milestones.map((m) => {
                const reached = encyclopedia.claimedAccessoryMilestones.includes(m) || collectedAccessoryCount >= m;
                return (
                  <span
                    key={m}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1 tabular-nums ${
                      reached
                        ? 'bg-[#E2F6EE] text-[#256D57] border border-[#AEE3D0]'
                        : 'bg-[#F3ECE6] text-[#8E7A73] border border-[#E4D9D0]'
                    }`}
                  >
                    {reached ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Coins className="w-3 h-3" />
                    )}
                    <span>{m} 款</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {ACCESSORIES.map((item) => {
              const collected = ownedAccessorySet.has(item.id);
              return (
                <article
                  key={item.id}
                  className={`rounded-3xl border-2 p-3 flex flex-col items-center text-center transition ${
                    collected
                      ? 'bg-[#FFFDF8] border-[#F4DFD7]'
                      : 'bg-[#F5EFEA] border-[#E7DCD5]'
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center relative ${
                      collected
                        ? 'bg-[#FFF8EB] border border-[#F3E2C3]'
                        : 'bg-[#E9DFD8] border border-[#DBD0C8]'
                    }`}
                  >
                    {collected ? (
                      <AccessoryPreview accessoryId={item.id} />
                    ) : (
                      <>
                        <div className="grayscale brightness-0 opacity-20 pointer-events-none">
                          <AccessoryPreview accessoryId={item.id} />
                        </div>
                        <HelpCircle className="w-5 h-5 text-[#8A766F] absolute" />
                      </>
                    )}
                  </div>

                  <h4 className="mt-2 text-xs font-extrabold text-[#4A3531]">
                    {collected ? item.name : '???'}
                  </h4>
                  <span className="text-[10px] font-bold text-[#8B716A] mt-0.5">
                    {ACCESSORY_SLOT_LABELS[item.slot]}配件
                  </span>
                  <p className="mt-1 text-[10px] text-[#7D635D] leading-snug">
                    {collected
                      ? item.description
                      : item.id === 'anniversary_bib'
                      ? '新手第 7 天成長之路限定解鎖'
                      : '於更衣室解鎖購買'}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
