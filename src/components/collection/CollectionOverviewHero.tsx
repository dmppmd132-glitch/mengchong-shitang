import React from 'react';
import { Bell, BellOff, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { COLLECTION_MILESTONES } from '../../data/collection';
import {
  CollectionCategoryId,
  CollectionOfflineSummary,
  CollectionProgress,
} from '../../types';

interface CollectionOverviewHeroProps {
  progress: CollectionProgress;
  claimedMilestones: number[];
  activeCategory: CollectionCategoryId | 'all';
  reminderEnabled: boolean;
  offlineSummary?: CollectionOfflineSummary | null;
  onSelectCategory: (catId: CollectionCategoryId | 'all') => void;
  onToggleReminder: () => void;
}

const MILESTONE_EMOJI_MAP: Record<number, string> = {
  10: '🌱',
  25: '🖼️',
  40: '🌈',
  50: '🛤️',
  60: '👑',
  75: '💃',
  90: '🏛️',
  100: '🏆',
};

function getMilestoneEmoji(percent: number): string {
  return MILESTONE_EMOJI_MAP[percent] ?? '✨';
}

export const CollectionOverviewHero: React.FC<CollectionOverviewHeroProps> = ({
  progress,
  claimedMilestones,
  activeCategory,
  reminderEnabled,
  offlineSummary,
  onSelectCategory,
  onToggleReminder,
}) => {
  const nextMs = progress.nextMilestone;

  return (
    <section
      aria-label="萌寵圖鑑總收集進度"
      className="rounded-3xl bg-gradient-to-br from-[#FFF4DC] via-[#FFF8F4] to-[#E8F8F1] border-2 border-[#F0D9CE] p-4 space-y-4"
    >
      {/* Top total summary + reminder toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              📖
            </span>
            <h2 className="text-base font-extrabold text-[#4A3531] tracking-tight">
              萌寵圖鑑與收集冊
            </h2>
          </div>
          <p className="text-xs font-bold text-[#7D635D] leading-snug">
            記錄一路以來的夥伴、料理、穿搭、小屋佈置、小鎮訪客與珍貴寫真記憶！
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleReminder}
          aria-pressed={reminderEnabled}
          className={`min-h-[44px] px-3 rounded-2xl border text-[11px] font-extrabold inline-flex items-center gap-1.5 shrink-0 transition ${
            reminderEnabled
              ? 'bg-white border-[#E8D1C5] text-[#5A3E36] hover:bg-[#FFFDFB]'
              : 'bg-[#F3EBE5] border-[#DFD2CA] text-[#8E7A73]'
          }`}
          title={reminderEnabled ? '每日收集提醒：開啟中' : '每日收集提醒：已關閉'}
        >
          {reminderEnabled ? (
            <Bell className="w-3.5 h-3.5 text-[#E05E83]" />
          ) : (
            <BellOff className="w-3.5 h-3.5" />
          )}
          <span>{reminderEnabled ? '每日提醒 開' : '每日提醒 關'}</span>
        </button>
      </div>

      {/* Main Total Progress Bar */}
      <div className="rounded-2xl bg-white/95 border border-[#EFE0D7] p-3.5 space-y-2.5">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#D64470] tabular-nums">
              {progress.totalCollected} / {progress.totalCount}
            </span>
            <span className="text-sm font-extrabold text-[#5A3E36] tabular-nums">
              （{progress.totalPercent}%）
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#7D635D] tabular-nums">
            已領里程碑 {claimedMilestones.length} / {COLLECTION_MILESTONES.length}
          </span>
        </div>

        <div
          className="w-full h-3 rounded-full bg-[#F3E7E1] overflow-hidden"
          role="progressbar"
          aria-valuenow={progress.totalPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF7A9E] via-[#F2B84B] to-[#52B788] transition-all duration-500"
            style={{ width: `${Math.min(100, progress.totalPercent)}%` }}
          />
        </div>

        {/* Next Milestone Callout */}
        {nextMs ? (
          <div className="flex items-center justify-between gap-2 pt-0.5 text-xs font-bold text-[#5A3E36] flex-wrap">
            <div className="inline-flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-4 h-4 text-[#D9821E] shrink-0" />
              <span className="truncate">
                下一目標 {nextMs.percent}%：{getMilestoneEmoji(nextMs.percent)} {nextMs.rewardSummary}
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-[#B83B64] tabular-nums shrink-0">
              {progress.itemsToNextMilestone > 0
                ? `還差 ${progress.itemsToNextMilestone} 項`
                : '即將發放獎勵'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pt-0.5 text-xs font-extrabold text-[#1F6B54]">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>恭喜達成 100% 萌寵全圖鑑收藏大師！</span>
          </div>
        )}

        {/* Milestone Track Dots */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1 border-t border-[#F4EAE3]">
          {COLLECTION_MILESTONES.map((ms) => {
            const unlocked = claimedMilestones.includes(ms.percent) || progress.totalPercent >= ms.percent;
            return (
              <div
                key={ms.percent}
                className={`rounded-xl px-1.5 py-1.5 text-center border transition ${
                  unlocked
                    ? 'bg-[#FFF3DC] border-[#F0CE7D] text-[#7D4F0C]'
                    : 'bg-[#FAF5F0] border-[#ECE2DA] text-[#8F7C75]'
                }`}
                title={`${ms.percent}%：${ms.rewardSummary}`}
              >
                <div className="text-xs leading-none">{getMilestoneEmoji(ms.percent)}</div>
                <div className="text-[10px] font-extrabold tabular-nums mt-0.5">
                  {ms.percent}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Offline / Recent Progress Summary */}
      {offlineSummary && offlineSummary.newItemsCount > 0 && (
        <div className="rounded-2xl bg-[#EFFAF4] border border-[#BEE5D3] px-3 py-2 text-[11px] font-bold text-[#1F6B54] flex items-center justify-between gap-2 flex-wrap">
          <span>
            ✨ 本次累積新收錄 <strong className="tabular-nums">{offlineSummary.newItemsCount}</strong> 項圖鑑藏品
            {offlineSummary.unlockedMilestones.length > 0
              ? ` · 達成 ${offlineSummary.unlockedMilestones.join('%、')}% 里程碑`
              : ''}
          </span>
          <span className="tabular-nums text-[10px] text-[#2B7B61]">
            {offlineSummary.dateKey}
          </span>
        </div>
      )}

      {/* 10 Category Progress Tiles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-extrabold text-[#4A3531]">
            十大圖鑑分類進度（點擊進入篩選）
          </h3>
          {activeCategory !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="min-h-[34px] px-2.5 rounded-xl bg-white border border-[#E7D8CE] text-[11px] font-extrabold text-[#6E544E] hover:bg-[#FAF4EE] transition"
            >
              顯示全部分類
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {progress.categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const isComplete = cat.total > 0 && cat.collected >= cat.total;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                className={`min-h-[76px] rounded-2xl border-2 p-2.5 text-left flex flex-col justify-between transition ${
                  isSelected
                    ? 'bg-white border-[#FF7A9E] ring-2 ring-[#FF7A9E]/25'
                    : isComplete
                    ? 'bg-[#F4FBF7] border-[#BBE5D0] hover:border-[#8FD4B4]'
                    : 'bg-white/90 border-[#EFE0D7] hover:border-[#E2C9BD]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-xs font-extrabold text-[#4A3531] inline-flex items-center gap-1 truncate">
                    <span aria-hidden="true">{cat.emoji}</span>
                    <span className="truncate">{cat.label}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9C867F] shrink-0" />
                </div>

                <div className="space-y-1 w-full">
                  <div className="flex items-baseline justify-between text-[11px] font-extrabold tabular-nums">
                    <span className={isComplete ? 'text-[#1F6B54]' : 'text-[#D64470]'}>
                      {cat.collected} / {cat.total}
                    </span>
                    <span className="text-[#7D635D]">{cat.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#EFE5DE] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete
                          ? 'bg-gradient-to-r from-[#52B788] to-[#2E9E75]'
                          : 'bg-gradient-to-r from-[#FF7A9E] to-[#F2B84B]'
                      }`}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
