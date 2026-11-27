import React from 'react';
import { Award, CheckCircle2, Compass, Lock } from 'lucide-react';
import { TITLE_DEFINITIONS } from '../../data/encyclopedia';
import { TOWN_LOCATION_BY_ID } from '../../data/town';
import { ActiveTownLocationId, GameState } from '../../types';
import { getOverallTownEncyclopediaSummary } from '../../utils/townMap';
import { TownLocationThumbnail } from './TownArtwork';

interface TownEncyclopediaSectionProps {
  game: GameState;
  onClaimLocationReward?: (locationId: ActiveTownLocationId) => void;
  onOpenLocation?: (locationId: ActiveTownLocationId) => void;
}

export const TownEncyclopediaSection: React.FC<TownEncyclopediaSectionProps> = ({
  game,
  onClaimLocationReward,
  onOpenLocation,
}) => {
  const summary = getOverallTownEncyclopediaSummary(game);
  const overallPct =
    summary.total > 0 ? Math.round((summary.collected / summary.total) * 100) : 0;

  return (
    <section className="space-y-3.5" aria-label="小鎮收集圖鑑">
      <div className="rounded-3xl bg-gradient-to-br from-[#EAF8F2] via-[#FFF8E8] to-[#FFEFF4] border-2 border-[#CBE7DB] p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#1F5E4B]">
              🗺️ 小鎮探索收集圖鑑
            </h3>
            <p className="text-[11px] font-bold text-[#5B776D] mt-0.5">
              集齊各地點訪客、攝影背景濾鏡相框與限定家具配件，可領專屬稱號與 20 小鎮券！
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-white border border-[#BFE3D4] text-xs font-extrabold text-[#1F6B54] tabular-nums shrink-0">
            {summary.collected} / {summary.total} ({overallPct}%)
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white/85 border border-[#D4EAE0] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5CC9A7] to-[#4AA9DF] transition-all"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {summary.byLocation.map((locProg) => {
          const locDef = TOWN_LOCATION_BY_ID[locProg.locationId];
          const titleDef = TITLE_DEFINITIONS[locProg.completionTitleId];
          const pct =
            locProg.totalCount > 0
              ? Math.round((locProg.collectedCount / locProg.totalCount) * 100)
              : 0;

          return (
            <article
              key={locProg.locationId}
              className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EEDFD6] p-3.5 space-y-2.5"
            >
              <div className="flex items-start gap-3">
                <TownLocationThumbnail
                  locationId={locProg.locationId}
                  className="w-20 h-15 rounded-2xl shrink-0 border border-[#E5D5CA]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="text-sm font-extrabold text-[#4A3531] truncate">
                      {locDef.emoji} {locDef.name}
                    </div>
                    <span className="text-xs font-extrabold text-[#256D57] tabular-nums shrink-0">
                      {locProg.collectedCount}/{locProg.totalCount}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-[#7D635D] truncate mt-0.5">
                    {locDef.subtitle}
                  </p>
                  <div className="mt-1.5 h-2 rounded-full bg-[#F3EAE4] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#5CC9A7] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {locProg.items.map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-xl border px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] font-bold ${
                      item.collected
                        ? 'bg-[#ECFAF3] border-[#B4E3CE] text-[#1F6B54]'
                        : 'bg-[#F8F3EF] border-[#EAE0D8] text-[#8E7A74]'
                    }`}
                  >
                    {item.collected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#2E9E75]" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 shrink-0 text-[#B09D96]" />
                    )}
                    <span className="truncate">
                      {item.emoji} {item.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-[#FAF4EE] border border-[#EEDFD6] p-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold text-[#5A3E36] inline-flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#D64470] shrink-0" />
                    <span>
                      100% 完成獎勵：{titleDef?.emoji} {titleDef?.name} ＋ 20 小鎮券 ＋ 120 金幣
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenLocation && (
                    <button
                      type="button"
                      onClick={() => onOpenLocation(locProg.locationId)}
                      className="min-h-[38px] px-2.5 rounded-xl bg-white border border-[#DFCFC5] text-[11px] font-extrabold text-[#5A3E36] inline-flex items-center gap-1"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>前往</span>
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!locProg.completedAll || locProg.rewardClaimed || !onClaimLocationReward}
                    onClick={() => onClaimLocationReward?.(locProg.locationId)}
                    className={`min-h-[38px] px-3 rounded-xl text-[11px] font-extrabold transition ${
                      locProg.rewardClaimed
                        ? 'bg-[#E6F8F1] text-[#1F6B54]'
                        : locProg.completedAll
                        ? 'bg-[#FF7A9E] text-white shadow-xs active:scale-95'
                        : 'bg-[#E8DDD6] text-[#9A8780] cursor-not-allowed'
                    }`}
                  >
                    {locProg.rewardClaimed
                      ? '✓ 已領取'
                      : locProg.completedAll
                      ? '領取稱號與小鎮券'
                      : '收集中'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {(() => {
          const plaza = TOWN_LOCATION_BY_ID.festival_plaza;
          if (!plaza) return null;
          return (
            <article className="rounded-3xl bg-[#FAF4EE] border-2 border-dashed border-[#DFCBBF] p-3.5 flex items-center gap-3">
              <div className="w-16 h-14 rounded-2xl bg-gradient-to-br from-[#FFEAF3] via-[#FFF6DC] to-[#EAF8F2] border border-[#E7CFC8] flex items-center justify-center text-3xl shrink-0">
                <span aria-hidden="true">{plaza.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-[#5A3E36] truncate">
                    {plaza.name}
                  </span>
                  <span className="text-[11px] font-extrabold text-[#B83B64] shrink-0">
                    預留地點
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#7D635D] mt-0.5 leading-snug">
                  {plaza.subtitle} · {plaza.unlockConditionLabel}
                </p>
              </div>
            </article>
          );
        })()}
      </div>
    </section>
  );
};
