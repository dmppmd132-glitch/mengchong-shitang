import React from 'react';
import { ArrowUpRight, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { ACCESSORIES } from '../../data/accessories';
import { COLLECTION_CHAIN_SETS } from '../../data/collection';
import { AccessoryPreview } from '../AccessoryPreview';

interface CollectionChainSetsViewProps {
  ownedAccessoryIds: string[];
  unlockedChainSetIds: string[];
  onGoToWardrobe: () => void;
}

export const CollectionChainSetsView: React.FC<CollectionChainSetsViewProps> = ({
  ownedAccessoryIds,
  unlockedChainSetIds,
  onGoToWardrobe,
}) => {
  const ownedSet = new Set(ownedAccessoryIds);
  const accById = new Map(ACCESSORIES.map((a) => [a.id, a]));
  const activeSets = COLLECTION_CHAIN_SETS.filter((s) => s.tier === 'active');
  const chainSets = COLLECTION_CHAIN_SETS.filter((s) => s.tier === 'chain');

  const completedActiveCount = activeSets.filter((set) =>
    set.pieceIds.every((pid) => ownedSet.has(pid))
  ).length;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-gradient-to-br from-[#FFF0F6] via-[#FFFDF8] to-[#FFF4DF] border-2 border-[#F1D5DF] p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-0.5 min-w-0">
          <h3 className="text-sm font-extrabold text-[#4A3531] inline-flex items-center gap-1.5">
            <span>👗</span>
            <span>穿搭套裝與進階連鎖收集</span>
          </h3>
          <p className="text-xs font-bold text-[#7D635D]">
            集齊任一 4 件主題套裝，即可獲得專屬稱號與攝影背景，並開啟對應進階連鎖預覽！
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-extrabold text-[#B83B64] tabular-nums">
            已完成 {completedActiveCount} / {activeSets.length} 套
          </span>
          <button
            type="button"
            onClick={onGoToWardrobe}
            className="min-h-[44px] px-3.5 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_2px_0_#D9577B] inline-flex items-center gap-1 hover:bg-[#F56990] transition"
          >
            <span>前往衣櫥收集</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Active 6 Sets */}
      <section className="space-y-3">
        <h4 className="text-xs font-extrabold text-[#4A3531] px-0.5">
          主題穿搭套裝（每套 4 件）
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeSets.map((set) => {
            const ownedPieces = set.pieceIds.filter((pid) => ownedSet.has(pid)).length;
            const isComplete = ownedPieces === set.pieceIds.length;
            const linkedChain = chainSets.find(
              (c) => c.sourceThemeId === set.sourceThemeId
            );

            return (
              <article
                key={set.id}
                className={`rounded-3xl border-2 p-3.5 space-y-3 ${
                  isComplete
                    ? 'bg-[#FFFDF8] border-[#F0B8CC]'
                    : 'bg-[#FAF5F0] border-[#E7DCD5]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-extrabold text-[#4A3531]">
                      {set.emoji} {set.name}
                    </div>
                    <p className="text-[11px] font-bold text-[#7D635D] mt-0.5">
                      {set.description}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-extrabold tabular-nums shrink-0 ${
                      isComplete ? 'text-[#1F6B54]' : 'text-[#C43463]'
                    }`}
                  >
                    {ownedPieces} / {set.pieceIds.length}
                  </span>
                </div>

                {/* 4-piece grid */}
                <div className="grid grid-cols-2 gap-2">
                  {set.pieceIds.map((pid, idx) => {
                    const hasPiece = ownedSet.has(pid);
                    const acc = accById.get(pid);
                    return (
                      <div
                        key={pid}
                        className={`rounded-2xl border p-2 flex items-center gap-2 ${
                          hasPiece
                            ? 'bg-[#EFFAF4] border-[#B6E4CD]'
                            : 'bg-white/80 border-[#E7DCD5]'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            hasPiece
                              ? 'bg-white'
                              : 'bg-[#EDE3DC] grayscale brightness-0 opacity-25'
                          }`}
                        >
                          <div className="scale-75">
                            <AccessoryPreview accessoryId={pid} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-extrabold text-[#4A3531] truncate">
                            {acc?.name ?? set.pieceNames[idx]}
                          </div>
                          <div className="text-[10px] font-bold text-[#7D635D]">
                            {hasPiece ? '已收集' : acc && acc.price > 0 ? `${acc.price} 金幣` : '未取得'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#ECE1DA] flex items-center justify-between gap-2 text-[11px] font-bold text-[#5A3E36]">
                  <span>獎勵稱號：{set.rewardTitleName}</span>
                  {linkedChain && (
                    <span className="text-[#9A3A86] inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        連鎖：{linkedChain.name}
                        {isComplete ? '（已開啟）' : ''}
                      </span>
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Chain Preview Sets */}
      <section className="space-y-3">
        <h4 className="text-xs font-extrabold text-[#4A3531] px-0.5">
          進階連鎖套裝預覽（5 套）
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {chainSets.map((chain) => {
            const parent = activeSets.find(
              (a) => a.sourceThemeId === chain.sourceThemeId
            );
            const parentComplete = parent
              ? parent.pieceIds.every((pid) => ownedSet.has(pid))
              : false;
            const unlocked =
              parentComplete || unlockedChainSetIds.includes(chain.id);

            return (
              <article
                key={chain.id}
                className={`rounded-3xl border-2 p-3.5 space-y-2 ${
                  unlocked
                    ? 'bg-gradient-to-br from-[#FFF4FA] to-[#FFFDF8] border-[#E7BBE0]'
                    : 'bg-[#F5EFEA] border-[#E4D8D0]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-extrabold text-[#4A3531]">
                    {chain.emoji} {chain.name}
                  </div>
                  {unlocked ? (
                    <span className="text-[11px] font-extrabold text-[#1F6B54] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      已開啟
                    </span>
                  ) : (
                    <span className="text-[11px] font-extrabold text-[#8D7870] inline-flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      待開啟
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#6E544E] leading-snug">
                  {chain.description}
                </p>

                <div className="text-[11px] font-bold text-[#7D635D] pt-1 border-t border-[#EAE0D8]">
                  連鎖部件：{chain.pieceNames.join(' · ')}
                </div>
                <div className="text-[10.5px] font-extrabold text-[#9A3A86]">
                  {unlocked
                    ? `✨ 連鎖印記：${chain.rewardTitleName}`
                    : chain.unlockRequirementText}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
