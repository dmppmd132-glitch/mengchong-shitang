import React from 'react';
import { Award, Check, Lock, ShieldCheck } from 'lucide-react';
import { COLLECTION_BADGES, COLLECTION_TITLE_GROUPS } from '../../data/collection';
import { getTitleDefinition } from '../../data/encyclopedia';
import { CollectionBadgeId, TitleId } from '../../types';

interface TitleBadgeWallProps {
  unlockedTitles: TitleId[];
  activeTitle: TitleId | null;
  unlockedBadges: CollectionBadgeId[];
  onSelectTitle?: (titleId: TitleId | null) => void;
}

export const TitleBadgeWall: React.FC<TitleBadgeWallProps> = ({
  unlockedTitles,
  activeTitle,
  unlockedBadges,
  onSelectTitle,
}) => {
  const unlockedTitleSet = new Set(unlockedTitles);
  const unlockedBadgeSet = new Set(unlockedBadges);
  const activeDef = activeTitle ? getTitleDefinition(activeTitle) : null;

  return (
    <div className="space-y-5">
      {/* Active Title Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-[#FFF4DD] via-[#FFF9F4] to-[#FFEAF2] border-2 border-[#F1D6CB] p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D64470] shrink-0" />
            <h3 className="text-sm font-extrabold text-[#4A3531]">
              稱號與徽章展示牆
            </h3>
          </div>
          <span className="text-xs font-extrabold text-[#7D635D] tabular-nums">
            稱號 {unlockedTitles.length} · 徽章 {unlockedBadges.length}/{COLLECTION_BADGES.length}
          </span>
        </div>

        <div className="rounded-2xl bg-white/95 border border-[#EFE0D7] p-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-[#856B64]">目前公開配戴稱號</div>
            <div className="text-sm font-extrabold text-[#4A3531] mt-0.5 truncate">
              {activeDef ? `${activeDef.emoji} ${activeDef.name}` : '尚未配戴任何稱號'}
            </div>
            <p className="text-[11px] text-[#7D635D] mt-0.5">
              配戴中的稱號會顯示於首頁名片、照片牆分享圖、留言板與共養小屋。
            </p>
          </div>
          {activeTitle && onSelectTitle && (
            <button
              type="button"
              onClick={() => onSelectTitle(null)}
              className="min-h-[44px] px-3.5 rounded-2xl bg-[#F3E9E2] text-xs font-extrabold text-[#5A3E36] hover:bg-[#EAE0D7] transition shrink-0"
            >
              卸下稱號
            </button>
          )}
        </div>
      </section>

      {/* 10 Collection Badges */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h4 className="text-xs font-extrabold text-[#4A3531] inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2E9E75]" />
            <span>收集榮譽徽章（{unlockedBadges.length} / {COLLECTION_BADGES.length}）</span>
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {COLLECTION_BADGES.map((badge) => {
            const owned = unlockedBadgeSet.has(badge.id);
            return (
              <article
                key={badge.id}
                className={`rounded-2xl border-2 p-3 flex flex-col justify-between gap-1.5 transition ${
                  owned
                    ? 'bg-[#FFFDF8] border-[#F0CF7B]'
                    : 'bg-[#F5EFEA] border-[#E5D9D1]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-2xl leading-none ${
                      owned ? '' : 'grayscale brightness-0 opacity-25'
                    }`}
                    aria-hidden="true"
                  >
                    {badge.emoji}
                  </span>
                  {owned ? (
                    <Check className="w-4 h-4 text-[#2E9E75]" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#8D7870]" />
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-[#4A3531]">
                    {badge.name}
                  </h5>
                  <p className="text-[10.5px] text-[#7D635D] leading-snug mt-0.5">
                    {owned ? badge.description : badge.unlockCondition}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Grouped Titles */}
      <div className="space-y-4">
        {COLLECTION_TITLE_GROUPS.map((group) => {
          const groupUnlocked = group.titleIds.filter((id) =>
            unlockedTitleSet.has(id)
          ).length;

          return (
            <section key={group.id} className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <h4 className="text-xs font-extrabold text-[#4A3531]">
                  {group.emoji} {group.label}
                </h4>
                <span className="text-[11px] font-extrabold text-[#7D635D] tabular-nums">
                  {groupUnlocked} / {group.titleIds.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.titleIds.map((tId) => {
                  const def = getTitleDefinition(tId);
                  const isUnlocked = unlockedTitleSet.has(tId);
                  const isActive = activeTitle === tId;

                  return (
                    <button
                      key={tId}
                      type="button"
                      disabled={!isUnlocked || !onSelectTitle}
                      onClick={() => onSelectTitle?.(isActive ? null : tId)}
                      className={`min-h-[76px] rounded-2xl border-2 px-3.5 py-2.5 text-left flex flex-col justify-between transition ${
                        isUnlocked
                          ? isActive
                            ? `${def.badgeClass} ring-2 ring-[#FF7A9E]/45`
                            : `${def.badgeClass} hover:brightness-[0.98]`
                          : 'bg-[#F6F0EB] border-[#E5D9D1] text-[#8F7C75] cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="text-xs font-extrabold inline-flex items-center gap-1.5 truncate">
                          <span aria-hidden="true">
                            {isUnlocked ? def.emoji : '🔒'}
                          </span>
                          <span className="truncate">{def.name}</span>
                        </span>
                        <span className="text-[11px] font-extrabold shrink-0">
                          {isActive
                            ? '配戴中'
                            : isUnlocked
                            ? '點擊配戴'
                            : '未解鎖'}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold mt-1 leading-snug opacity-90">
                        {isUnlocked ? def.description : def.unlockCondition}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
