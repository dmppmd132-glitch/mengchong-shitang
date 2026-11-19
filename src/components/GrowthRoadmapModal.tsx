import React from 'react';
import { Award, CheckCircle2, Sparkles, Star, X } from 'lucide-react';
import {
  GROWTH_SOURCES_GUIDE,
  PRESTIGE_STAR_REWARD_COINS,
  PRESTIGE_STAR_STEP,
  STAGE_LEVEL_REWARDS,
  getGrowthRemaining,
  getSpeciesStages,
  isCareBalanced,
} from '../data/growth';
import { Pet } from '../types';
import { PiggyCharacter } from './PiggyCharacter';

interface GrowthRoadmapModalProps {
  open: boolean;
  pet: Pet;
  onClose: () => void;
}

export const GrowthRoadmapModal: React.FC<GrowthRoadmapModalProps> = ({
  open,
  pet,
  onClose,
}) => {
  if (!open) return null;

  const stages = getSpeciesStages(pet.species);
  const growthInfo = getGrowthRemaining(pet.growth, pet.species);
  const balanced = isCareBalanced(pet);

  const lowStats: string[] = [];
  if (pet.hunger < 70) lowStats.push(`飽食 ${pet.hunger}%`);
  if (pet.mood < 70) lowStats.push(`心情 ${pet.mood}%`);
  if (pet.cleanliness < 70) lowStats.push(`清潔 ${pet.cleanliness}%`);
  if (pet.energy < 70) lowStats.push(`精力 ${pet.energy}%`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="growth-roadmap-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] max-h-[86vh] rounded-3xl bg-[#FFFDF8] border-2 border-[#F3DFD7] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-[#FFEAF0] via-[#FFF6DA] to-[#E6F8F1] border-b border-[#EFE0D7] flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white/90 border border-[#F2D5DF] flex items-center justify-center shrink-0 overflow-hidden">
              <PiggyCharacter
                species={pet.species}
                growth={pet.growth}
                roundness={pet.roundness}
                action="idle"
                expression="sparkle"
                equipped={pet.accessories}
                interactive={false}
                size={52}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-[#B83B64]">
                成長里程路線圖
              </p>
              <h2
                id="growth-roadmap-title"
                className="text-base font-extrabold text-[#4A3531] truncate"
              >
                {pet.name} · Lv.{growthInfo.currentStage.level}{' '}
                {growthInfo.currentStage.name}
                {growthInfo.prestigeStars > 0 ? ` ★${growthInfo.prestigeStars}` : ''}
              </h2>
              <p className="text-[11px] font-bold text-[#6E544E] tabular-nums">
                累積成長值 {pet.growth}
                {growthInfo.nextStage
                  ? ` / ${growthInfo.nextStage.minGrowth}（距下一階還差 ${growthInfo.remaining}）`
                  : `（距 ★${growthInfo.prestigeStars + 1} 還差 ${growthInfo.remaining}）`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="關閉成長路線圖"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/90 text-[#5A3E36] hover:bg-white flex items-center justify-center shrink-0 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Care Balance Buff Card */}
          <section
            className={`rounded-2xl border p-3 space-y-1 ${
              balanced
                ? 'bg-[#E6F8F1] border-[#A3DFC8]'
                : 'bg-[#FFF8EC] border-[#F2D59B]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs font-extrabold inline-flex items-center gap-1.5 ${
                  balanced ? 'text-[#1F6B54]' : 'text-[#8A5610]'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  {balanced
                    ? '元氣滿分狀態啟動中！'
                    : '均衡照顧加成（+25% 成長）'}
                </span>
              </span>
              <span
                className={`text-[11px] font-extrabold tabular-nums ${
                  balanced ? 'text-[#1F6B54]' : 'text-[#9D5B12]'
                }`}
              >
                {balanced ? '+25% 生效中' : '四項 ≥ 70%'}
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#5A423C] leading-snug">
              {balanced
                ? '飽食、心情、清潔與精力都在 70% 以上，現在餵食、摸摸、洗澡與散步都會額外獲得 +25% 成長值！'
                : `目前還差：${lowStats.join('、')}，補滿 70% 即可啟動 +25% 成長加成！`}
            </p>
          </section>

          {/* 4-Stage Progression Timeline */}
          <section className="space-y-2.5">
            <h3 className="text-xs font-extrabold text-[#4A3531] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#D64470]" />
              <span>成長階段一覽（Lv.1 ～ Lv.4）</span>
            </h3>

            <div className="space-y-2">
              {stages.map((st) => {
                const isReached = pet.growth >= st.minGrowth;
                const isCurrent = growthInfo.currentStage.level === st.level;
                const reward = STAGE_LEVEL_REWARDS[st.level];
                const stagePct =
                  st.nextGrowth === null
                    ? isReached
                      ? 100
                      : 0
                    : isReached
                    ? pet.growth >= st.nextGrowth
                      ? 100
                      : Math.round(
                          ((pet.growth - st.minGrowth) /
                            (st.nextGrowth - st.minGrowth)) *
                            100
                        )
                    : 0;

                return (
                  <div
                    key={st.level}
                    className={`rounded-2xl border-2 p-3 space-y-1.5 transition ${
                      isCurrent
                        ? 'bg-[#FFF5F8] border-[#FF7A9E]'
                        : isReached
                        ? 'bg-[#F4FBF8] border-[#BFE6D5]'
                        : 'bg-[#FAF5F0] border-[#ECE0D9]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-extrabold text-[#4A3531] truncate">
                          Lv.{st.level} {st.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold text-[#D64470] shrink-0">
                            · 目前階段
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-extrabold tabular-nums shrink-0 inline-flex items-center gap-1 ${
                          isReached ? 'text-[#1F6B54]' : 'text-[#826862]'
                        }`}
                      >
                        {isReached ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {st.minGrowth}+ 已解鎖
                            </span>
                          </>
                        ) : (
                          <span>
                            需 {st.minGrowth}（還差 {st.minGrowth - pet.growth}）
                          </span>
                        )}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6E544E] leading-snug">
                      {st.tagline}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10.5px] font-bold">
                      <span className="text-[#256D57]">
                        解鎖：{st.unlockFeature}
                      </span>
                      {reward && (
                        <span className="text-[#A46D0F] tabular-nums">
                          祝賀禮：{reward.rewardText}
                        </span>
                      )}
                    </div>

                    {isCurrent && st.nextGrowth !== null && (
                      <div className="pt-1">
                        <div className="h-2 w-full rounded-full bg-[#F5E1E7] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#FF8AA8] to-[#5CC9A7] transition-all duration-300"
                            style={{ width: `${stagePct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Lv.4+ Endgame Prestige Stars Loop */}
          <section className="rounded-2xl border-2 border-[#F2CE6D] bg-gradient-to-r from-[#FFF8DC] to-[#FFF2F6] p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#D4880F] fill-[#FFD166]" />
                <span className="text-xs font-extrabold text-[#7A500B]">
                  滿級閃耀星等循環（Lv.4 之後開啟）
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#B83B64] tabular-nums">
                {growthInfo.isPrestigeActive
                  ? `★${growthInfo.prestigeStars}`
                  : '500 起開啟'}
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#6E544E] leading-snug">
              達到 Lv.4（500 成長值）後，每再累積 {PRESTIGE_STAR_STEP}{' '}
              成長值即可提升 1 顆「閃耀星等」，每次升星立即獲贈{' '}
              <span className="font-extrabold text-[#A46D0F]">
                +{PRESTIGE_STAR_REWARD_COINS} 金幣
              </span>{' '}
              與專屬回憶紀念！
            </p>
            {growthInfo.isPrestigeActive && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10.5px] font-extrabold text-[#7A500B] tabular-nums">
                  <span>目前星等：★{growthInfo.prestigeStars}</span>
                  <span>
                    距 ★{growthInfo.prestigeStars + 1} 還需 {growthInfo.remaining}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/80 overflow-hidden border border-[#F0D388]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FFD166] to-[#FF7A9E] transition-all duration-300"
                    style={{ width: `${growthInfo.progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Growth Sources Guide */}
          <section className="space-y-2">
            <h3 className="text-xs font-extrabold text-[#4A3531]">
              成長值獲得途徑一覽
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {GROWTH_SOURCES_GUIDE.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#FAF5F0] border border-[#EDE0D8] p-2.5 space-y-0.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-extrabold text-[#4A3531] truncate">
                      {item.emoji} {item.label}
                    </span>
                  </div>
                  <p className="text-[11px] font-extrabold text-[#256D57] tabular-nums">
                    {item.gainText}
                  </p>
                  <p className="text-[10px] text-[#7D635D] leading-snug">
                    {item.hint}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#EFE0D7] bg-[#FFF8F2]">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold border border-[#E55E83] border-b-4 border-b-[#C54368] active:translate-y-[2px] active:border-b-2 transition"
          >
            知道了！繼續陪伴 {pet.name}
          </button>
        </div>
      </div>
    </div>
  );
};
