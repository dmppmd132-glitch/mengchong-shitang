import React from 'react';
import { Award, CheckCircle2, Lock, Sparkles, Star } from 'lucide-react';
import {
  ACCESSORY_SLOT_LABELS,
  getAccessoryById,
} from '../data/accessories';
import { TITLE_DEFINITIONS } from '../data/encyclopedia';
import {
  EVOLUTION_MILESTONE_META,
  PRESTIGE_STAR_REWARD_COINS,
  PRESTIGE_STAR_STEP,
  STAGE_LEVEL_REWARDS,
  getGrowthRemaining,
  getPrestigeStarInfo,
  getSpeciesStages,
} from '../data/growth';
import { getPetSpeciesInfo } from '../data/species';
import {
  EncyclopediaState,
  MemoryEntry,
  Pet,
  TitleId,
} from '../types';
import { getAccessoryRarityMeta } from '../utils/accessories';
import { AccessoryPreview } from './AccessoryPreview';
import { PiggyCharacter } from './PiggyCharacter';

interface EvolutionAtlasViewProps {
  pet: Pet;
  encyclopedia: EncyclopediaState;
  unlockedAccessories: string[];
  memories?: MemoryEntry[];
  onSelectTitle?: (titleId: TitleId | null) => void;
}

export const EvolutionAtlasView: React.FC<EvolutionAtlasViewProps> = ({
  pet,
  encyclopedia,
  unlockedAccessories,
  memories = [],
  onSelectTitle,
}) => {
  const speciesInfo = getPetSpeciesInfo(pet.species);
  const stages = getSpeciesStages(pet.species);
  const growthInfo = getGrowthRemaining(pet.growth, pet.species);
  const prestige = getPrestigeStarInfo(pet.growth);
  const ownedAccessorySet = new Set(unlockedAccessories);
  const unlockedTitleSet = new Set(encyclopedia.unlockedTitles);

  const hatchMemory = memories.find(
    (m) => m.uniqueKey === 'hatching_welcome' || m.type === 'hatching'
  );

  const getStageMemoryDate = (level: number): string | null => {
    if (level === 0 || level === 1) {
      return hatchMemory?.dateKey ?? null;
    }
    const found = memories.find(
      (m) =>
        m.uniqueKey === `growth_lv_${level}` ||
        (m.type === 'growth' && m.level === level)
    );
    return found?.dateKey ?? null;
  };

  // Total 5 timeline nodes: Egg (0) + Lv.1..Lv.4
  const unlockedNodesCount = 1 + stages.filter((s) => pet.growth >= s.minGrowth).length;

  const eggMeta = EVOLUTION_MILESTONE_META[0];
  const eggAccessories = eggMeta.accessoryIds
    .map((id) => getAccessoryById(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="space-y-4">
      {/* Evolution Overview Header Card */}
      <section className="rounded-3xl bg-gradient-to-br from-[#FFF4DD] via-[#FFEBF1] to-[#E6F8F1] border-2 border-[#F4DFD7] p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white/90 border border-[#F3D7E0] flex items-center justify-center shrink-0 overflow-hidden">
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
                成長進化路徑圖鑑 · {speciesInfo.label}
              </p>
              <h2 className="text-base font-extrabold text-[#4A3531] truncate">
                {pet.name} · Lv.{growthInfo.currentStage.level}{' '}
                {growthInfo.currentStage.name}
                {growthInfo.prestigeStars > 0 ? ` ★${growthInfo.prestigeStars}` : ''}
              </h2>
              <p className="text-[11px] font-bold text-[#6E544E] tabular-nums mt-0.5">
                已點亮 {unlockedNodesCount} / 5 進化里程 · 成長值 {pet.growth}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/85 border border-[#F2E0D6] px-2.5 py-1.5 text-center shrink-0">
            <div className="text-[10px] font-bold text-[#826862]">階段進度</div>
            <div className="text-xs font-extrabold text-[#D64470] tabular-nums">
              {unlockedNodesCount} / 5
            </div>
          </div>
        </div>

        {/* 5-step Mini Horizontal Evolution Track */}
        <div className="rounded-2xl bg-white/80 border border-[#F2E2D9] px-3 py-2.5 space-y-2">
          <div className="flex items-center justify-between gap-1">
            {[
              { key: 0, label: '蛋殼', reached: true, current: false },
              ...stages.map((st) => ({
                key: st.level,
                label: `Lv.${st.level}`,
                reached: pet.growth >= st.minGrowth,
                current: growthInfo.currentStage.level === st.level,
              })),
            ].map((step, idx, arr) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold border-2 transition ${
                      step.current
                        ? 'bg-[#FF7A9E] border-[#E0537C] text-white ring-3 ring-[#FF7A9E]/25'
                        : step.reached
                        ? 'bg-[#5CC9A7] border-[#3BA686] text-white'
                        : 'bg-[#F5EDE7] border-[#DECFC6] text-[#9A857E]'
                    }`}
                  >
                    {step.key === 0 ? '🥚' : step.reached && !step.current ? '✓' : step.key}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold whitespace-nowrap ${
                      step.current
                        ? 'text-[#D64470]'
                        : step.reached
                        ? 'text-[#256D57]'
                        : 'text-[#9A857E]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`h-1 flex-1 rounded-full -mt-4 ${
                      arr[idx + 1].reached ? 'bg-[#6CD4B5]' : 'bg-[#E9DDD6]'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="pt-0.5 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#6E544E] tabular-nums">
              <span>
                {growthInfo.nextStage
                  ? `距離 Lv.${growthInfo.nextStage.level}「${growthInfo.nextStage.name}」`
                  : `閃耀星等 ★${prestige.stars + 1} 修行中`}
              </span>
              <span className="font-extrabold text-[#D64470]">
                {growthInfo.nextStage
                  ? `還差 ${growthInfo.remaining} 成長值`
                  : `還差 ${prestige.remainingToNextStar} 成長值`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#EFE2DA] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF7A9E] via-[#FFB36B] to-[#5CC9A7] transition-all duration-300"
                style={{ width: `${Math.max(4, growthInfo.progressPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vertical Visual Evolution Timeline */}
      <section className="space-y-0">
        {/* Node 0: Egg / Hatching Stage */}
        <div className="relative pl-9 pb-5">
          {/* Timeline Vertical Connector */}
          <div
            className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-[#6CD4B5]"
            aria-hidden="true"
          />
          <div
            className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-[#5CC9A7] border-2 border-white shadow-xs flex items-center justify-center text-white"
            aria-hidden="true"
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>

          <article className="rounded-3xl bg-[#FFFDF8] border-2 border-[#BEE6D5] p-3.5 space-y-3">
            <div className="flex items-start gap-3">
              {/* Custom Egg SVG matching IntroHatching */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#FFF3DF] to-[#FFE8EE] border border-[#F2DFD5] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 120 130" className="w-16 h-16 overflow-visible" aria-hidden="true">
                  <ellipse cx="60" cy="110" rx="42" ry="11" fill="#F5DDA4" stroke="#6E4E42" strokeWidth="3" />
                  <path
                    d="M 26 108 Q 60 120 94 108"
                    fill="none"
                    stroke="#E0BC75"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 60 18 C 84 18, 97 56, 95 82 C 93 102, 78 110, 60 110 C 42 110, 27 102, 25 82 C 23 56, 36 18, 60 18 Z"
                    fill={speciesInfo.eggColor}
                    stroke="#5A3E36"
                    strokeWidth="3.2"
                  />
                  <ellipse cx="46" cy="45" rx="6" ry="12" transform="rotate(-18 46 45)" fill="#FFFFFF" opacity="0.55" />
                  <circle cx="76" cy="60" r="5" fill="#FFE8A3" opacity="0.9" />
                  <circle cx="42" cy="78" r="6" fill="#9CE5CE" opacity="0.8" />
                  <path
                    d="M 58 46 L 51 55 L 59 63 L 52 72"
                    fill="none"
                    stroke="#5A3E36"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 59 63 L 70 69 L 64 78"
                    fill="none"
                    stroke="#5A3E36"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-[#256D57]">
                    Stage 0 · 破殼蛋時期
                  </span>
                  <span className="text-[10px] font-bold text-[#6E544E] tabular-nums">
                    {getStageMemoryDate(0) ? `${getStageMemoryDate(0)} 誕生` : '已孵化 ✓'}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-[#4A3531]">
                  溫馨破殼誕生（{speciesInfo.label}蛋）
                </h3>
                <p className="text-xs text-[#6E544E] leading-relaxed">
                  {eggMeta.highlightFeature}
                </p>
              </div>
            </div>

            {eggAccessories.length > 0 && (
              <div className="rounded-2xl bg-[#F7FAF8] border border-[#DFEFE7] p-2.5 space-y-1.5">
                <div className="text-[10px] font-extrabold text-[#256D57]">
                  破殼新手穿搭禮
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {eggAccessories.map((acc) => {
                    const owned = ownedAccessorySet.has(acc.id);
                    return (
                      <div
                        key={acc.id}
                        className="rounded-xl bg-white border border-[#E6EFEA] px-2 py-1.5 flex items-center gap-2 min-w-0"
                      >
                        <div className="w-9 h-9 flex items-center justify-center shrink-0 scale-75">
                          <AccessoryPreview accessoryId={acc.id} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-extrabold text-[#4A3531] truncate">
                            {acc.name}
                          </div>
                          <div className="text-[10px] font-bold text-[#256D57]">
                            {ACCESSORY_SLOT_LABELS[acc.slot]} · {owned ? '已獲得 ✓' : '初始贈送'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Nodes 1..4: Evolution Stages */}
        {stages.map((stage, idx) => {
          const isReached = pet.growth >= stage.minGrowth;
          const isCurrent = growthInfo.currentStage.level === stage.level;
          const isLastStage = idx === stages.length - 1;
          const nextStageReached =
            !isLastStage && pet.growth >= stages[idx + 1].minGrowth;

          const meta =
            EVOLUTION_MILESTONE_META[stage.level as 1 | 2 | 3 | 4] ??
            EVOLUTION_MILESTONE_META[1];
          const stageReward = STAGE_LEVEL_REWARDS[stage.level];
          const recordedDate = isReached ? getStageMemoryDate(stage.level) : null;
          const stageAccessories = meta.accessoryIds
            .map((id) => getAccessoryById(id))
            .filter((a): a is NonNullable<typeof a> => Boolean(a));
          const titleDef = meta.titleId ? TITLE_DEFINITIONS[meta.titleId] : null;
          const isTitleUnlocked = meta.titleId
            ? unlockedTitleSet.has(meta.titleId)
            : false;
          const isTitleActive = meta.titleId
            ? encyclopedia.activeTitle === meta.titleId
            : false;

          const remainingGrowth = Math.max(0, stage.minGrowth - pet.growth);

          return (
            <div key={stage.level} className="relative pl-9 pb-5">
              {/* Vertical Connector Line */}
              <div
                className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${
                  nextStageReached || (isLastStage && isReached)
                    ? 'bg-[#6CD4B5]'
                    : isCurrent
                    ? 'bg-gradient-to-b from-[#FF9AB6] to-[#E9DDD6]'
                    : 'bg-[#E9DDD6]'
                }`}
                aria-hidden="true"
              />

              {/* Timeline Node Marker */}
              <div
                className={`absolute left-0 top-1.5 w-7 h-7 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-[11px] font-extrabold ${
                  isCurrent
                    ? 'bg-[#FF7A9E] text-white ring-4 ring-[#FF7A9E]/25'
                    : isReached
                    ? 'bg-[#5CC9A7] text-white'
                    : 'bg-[#EDE3DC] text-[#8E7972]'
                }`}
                aria-hidden="true"
              >
                {isCurrent ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : isReached ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </div>

              <article
                className={`rounded-3xl border-2 p-3.5 space-y-3 transition ${
                  isCurrent
                    ? 'bg-gradient-to-br from-[#FFFDF9] to-[#FFF1F6] border-[#FF94B2] shadow-xs'
                    : isReached
                    ? 'bg-[#FFFDF8] border-[#BEE6D5]'
                    : 'bg-[#F8F3EE] border-[#E7DCD4]'
                }`}
              >
                {/* Portrait + Stage Details */}
                <div className="flex items-start gap-3">
                  <div
                    className={`relative w-20 h-20 rounded-2xl border flex items-center justify-center shrink-0 overflow-hidden ${
                      isCurrent
                        ? 'bg-white border-[#F6C8D6]'
                        : isReached
                        ? 'bg-gradient-to-b from-[#FFF9EE] to-[#F3FBF7] border-[#D9EDE3]'
                        : 'bg-[#EFE6DF] border-[#DFD2C8]'
                    }`}
                  >
                    <div
                      className={
                        isReached
                          ? ''
                          : 'opacity-45 grayscale-[50%] contrast-90 pointer-events-none'
                      }
                    >
                      <PiggyCharacter
                        species={pet.species}
                        growth={stage.minGrowth}
                        roundness={isReached ? pet.roundness : 28}
                        action="idle"
                        expression={
                          isReached && stage.level >= 3 ? 'sparkle' : 'normal'
                        }
                        equipped={pet.accessories}
                        interactive={false}
                        size={74}
                      />
                    </div>
                    {!isReached && (
                      <div className="absolute inset-x-1 bottom-1 rounded-lg bg-[#4A3531]/75 text-white text-[9px] font-extrabold text-center py-0.5 tabular-nums">
                        🔒 Lv.{stage.level}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-extrabold tabular-nums ${
                          isCurrent
                            ? 'text-[#D64470]'
                            : isReached
                            ? 'text-[#256D57]'
                            : 'text-[#8C756E]'
                        }`}
                      >
                        Lv.{stage.level} · 需求 {stage.minGrowth} 成長值
                      </span>
                      <span
                        className={`text-[10px] font-extrabold tabular-nums ${
                          isCurrent
                            ? 'text-[#D64470]'
                            : isReached
                            ? 'text-[#256D57]'
                            : 'text-[#9A6820]'
                        }`}
                      >
                        {isCurrent
                          ? '★ 目前階段'
                          : isReached
                          ? recordedDate
                            ? `${recordedDate} 達成`
                            : '已進化 ✓'
                          : `尚需 ${remainingGrowth} 成長值`}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-[#4A3531]">
                      {stage.name}
                    </h3>

                    <p className="text-xs text-[#6E544E] leading-relaxed">
                      {stage.tagline}
                    </p>

                    <div className="pt-0.5 text-[11px] font-bold text-[#7A5E57]">
                      解鎖能力：{stage.unlockFeature}
                      {stageReward ? `（${stageReward.rewardText}）` : ''}
                    </div>
                  </div>
                </div>

                {/* Special Unlocked Accessories & Honor Title */}
                <div className="grid grid-cols-1 gap-2">
                  {stageAccessories.map((acc) => {
                    const owned = ownedAccessorySet.has(acc.id);
                    const rarityMeta = getAccessoryRarityMeta(acc);
                    return (
                      <div
                        key={acc.id}
                        className={`rounded-2xl border px-3 py-2 flex items-center gap-2.5 ${
                          owned
                            ? 'bg-white border-[#EBDAD1]'
                            : 'bg-[#F3ECE6] border-[#E4D7CE]'
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                            owned
                              ? 'bg-[#FFF9F2] border-[#F0DFD3]'
                              : 'bg-[#E9DFD7] border-[#DBD0C8] opacity-65 grayscale-[45%]'
                          }`}
                        >
                          <div className="scale-[0.85] flex items-center justify-center">
                            <AccessoryPreview accessoryId={acc.id} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-[#4A3531] truncate">
                              特殊配件：{acc.name}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold shrink-0 ${
                                owned ? 'text-[#256D57]' : 'text-[#8C756E]'
                              }`}
                            >
                              {owned ? '已獲得 ✓' : `Lv.${stage.level} 解鎖`}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-[#7D635D] mt-0.5">
                            {ACCESSORY_SLOT_LABELS[acc.slot]} · {rarityMeta.label} ·{' '}
                            {acc.obtainMethod}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {titleDef && meta.titleId && (
                    <div
                      className={`rounded-2xl border px-3 py-2 flex items-center justify-between gap-2.5 ${
                        isTitleUnlocked
                          ? titleDef.badgeClass
                          : 'bg-[#F3ECE6] border-[#E4D7CE] text-[#8C756E]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold">
                          <Award className="w-3.5 h-3.5 shrink-0" />
                          <span>{isTitleUnlocked ? titleDef.emoji : '🔒'}</span>
                          <span className="truncate">專屬稱號：{titleDef.name}</span>
                        </div>
                        <p className="text-[10px] font-bold opacity-85 mt-0.5 leading-snug">
                          {isTitleUnlocked
                            ? titleDef.description
                            : titleDef.unlockCondition}
                        </p>
                      </div>

                      {isTitleUnlocked && onSelectTitle ? (
                        <button
                          type="button"
                          onClick={() =>
                            onSelectTitle(isTitleActive ? null : meta.titleId)
                          }
                          className={`min-h-[38px] px-3 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 transition ${
                            isTitleActive
                              ? 'bg-[#D64470] text-white shadow-xs'
                              : 'bg-white/90 text-[#4A3531] border border-black/10 hover:bg-white'
                          }`}
                        >
                          {isTitleActive ? '佩戴中 ✓' : '佩戴稱號'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-extrabold shrink-0">
                          未解鎖
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </div>
          );
        })}

        {/* Final Endgame Node: Lv.4+ Prestige Stars */}
        <div className="relative pl-9">
          <div
            className={`absolute left-0 top-1.5 w-7 h-7 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
              prestige.isPrestigeActive
                ? 'bg-gradient-to-br from-[#F7B733] to-[#FF7A9E] text-white'
                : 'bg-[#EDE3DC] text-[#8E7972]'
            }`}
            aria-hidden="true"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>

          <article
            className={`rounded-3xl border-2 p-3.5 space-y-2 ${
              prestige.isPrestigeActive
                ? 'bg-gradient-to-r from-[#FFF5DA] via-[#FFEAF2] to-[#EFEAFF] border-[#F0C87D]'
                : 'bg-[#F8F3EE] border-[#E7DCD4]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#4A3531]">
                <span>🌟</span>
                <span>Lv.4+ 閃耀星等無限循環</span>
              </div>
              <span
                className={`text-xs font-extrabold tabular-nums ${
                  prestige.isPrestigeActive ? 'text-[#9A5A00]' : 'text-[#8C756E]'
                }`}
              >
                {prestige.isPrestigeActive
                  ? `目前 ★${prestige.stars}`
                  : '達 Lv.4 開啟'}
              </span>
            </div>

            <p className="text-xs text-[#6E544E] leading-relaxed">
              滿級後每額外累積 {PRESTIGE_STAR_STEP} 成長值即可點亮 1 顆閃耀星（★1, ★2, ★3…），每次進階自動獲贈 +{PRESTIGE_STAR_REWARD_COINS} 金幣與紀念回憶！
            </p>

            {prestige.isPrestigeActive && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#7A5418] tabular-nums">
                  <span>下一顆 ★{prestige.stars + 1} 進度</span>
                  <span>
                    {prestige.currentStarProgress} / {PRESTIGE_STAR_STEP}（還差{' '}
                    {prestige.remainingToNextStar}）
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/80 border border-[#F0D6A1] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#F7B733] to-[#FF7A9E] transition-all duration-300"
                    style={{ width: `${Math.max(4, prestige.progressPercent)}%` }}
                  />
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
};
