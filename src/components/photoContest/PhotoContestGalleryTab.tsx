import React from 'react';
import { ACCESSORIES } from '../../data/accessories';
import { getTitleDefinition } from '../../data/encyclopedia';
import { PHOTO_CONTEST_THEME_BY_ID } from '../../data/photoContest';
import {
  GameState,
  PhotoContestState,
  PhotoStudioState,
  PhotoSubmission,
} from '../../types';
import { SubmissionStagePreview } from './SubmissionStagePreview';

const ACCESSORY_NAME_BY_ID = new Map<string, string>(
  ACCESSORIES.map((a) => [a.id, `${a.emoji} ${a.name}`])
);

interface PhotoContestGalleryTabProps {
  game: GameState;
  contest: PhotoContestState;
  studio: PhotoStudioState;
  coopSubs: PhotoSubmission[];
  wallView: 'personal' | 'coop' | 'history';
  onChangeWallView: (view: 'personal' | 'coop' | 'history') => void;
}

export const PhotoContestGalleryTab: React.FC<PhotoContestGalleryTabProps> = ({
  game,
  contest,
  studio,
  coopSubs,
  wallView,
  onChangeWallView,
}) => {
  const duoCoopSubs = coopSubs.filter((s) => s.isCoop);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white border border-[#EFE2DD] p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-[#4A3531]">🏆 我的比賽檔案</span>
          <span className="font-bold text-[#7D635D] tabular-nums">
            📷 攝影券 {contest.tickets.balance} · 🎨 材料 {studio.studioMaterials}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['contest_photographer', 'best_photo_partner'] as const).map((tid) => {
            const owned = game.encyclopedia.unlockedTitles.includes(tid);
            const def = getTitleDefinition(tid);
            return (
              <span
                key={tid}
                className={`px-2 py-1 rounded-lg border text-[10px] font-extrabold ${
                  owned
                    ? 'bg-[#FFF5DC] border-[#E8C46E] text-[#7B4F08]'
                    : 'bg-[#F7F1EE] border-[#E5D7D0] text-[#9A857E]'
                }`}
              >
                {owned ? '👑 ' : '🔒 '}
                {def.name}
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 bg-[#F6ECE7] p-1 rounded-2xl">
        {(
          [
            { id: 'personal', label: `個人作品 (${contest.submissions.length})` },
            { id: 'coop', label: `雙寵牆 (${duoCoopSubs.length})` },
            { id: 'history', label: `歷週結算 (${contest.settledWeeks.length})` },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChangeWallView(opt.id)}
            className={`min-h-[38px] rounded-xl text-[11px] font-extrabold transition ${
              wallView === opt.id ? 'bg-white text-[#4A3531] shadow-xs' : 'text-[#7D635D]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {wallView === 'history' ? (
        contest.settledWeeks.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#EFE2DD] p-6 text-center text-xs font-bold text-[#8A7068]">
            尚無歷週結算紀錄，每週一 00:00 將自動結算並保存成果！
          </div>
        ) : (
          <div className="space-y-2">
            {contest.settledWeeks.map((rec) => (
              <div
                key={rec.weekKey}
                className="rounded-2xl bg-white border border-[#EFE2DD] p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#4A3531]">
                    {PHOTO_CONTEST_THEME_BY_ID[rec.themeId]?.emoji ?? '🏆'} {rec.themeName}
                  </span>
                  <span className="text-[11px] font-bold text-[#8A7068] tabular-nums">
                    {rec.weekKey}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#6E544E]">
                  最佳：{rec.bestScore} 分
                  {rec.bestRank ? ` (${rec.bestRank} 級)` : ''} · 投稿 {rec.submissionsCount} 次 ·
                  投票 {rec.votesCastCount} 次 · 攝影券 +{rec.ticketsEarned}
                </p>
                <p className="text-[10px] font-semibold text-[#B83B64]">{rec.rewardSummary}</p>
              </div>
            ))}
          </div>
        )
      ) : (
        (() => {
          const list = wallView === 'coop' ? duoCoopSubs : contest.submissions;
          if (list.length === 0) {
            return (
              <div className="rounded-2xl bg-white border border-[#EFE2DD] p-6 text-center text-xs font-bold text-[#8A7068]">
                {wallView === 'coop'
                  ? '還沒有雙寵攝影作品，快去「雙寵攝影」分頁拍下可愛合影吧！'
                  : '尚未提交任何參賽作品，快到「比賽總覽」幫寶貝拍照參賽吧！'}
              </div>
            );
          }
          return (
            <div className="space-y-2.5">
              {list.map((sub) => {
                const subTheme = PHOTO_CONTEST_THEME_BY_ID[sub.themeId];
                const eqNames = (Object.values(sub.equipped) as Array<string | null>)
                  .filter((id): id is string => Boolean(id))
                  .map((id) => ACCESSORY_NAME_BY_ID.get(id) ?? id);
                return (
                  <article
                    key={sub.id}
                    className="rounded-2xl bg-white border border-[#EFE2DD] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#4A3531] truncate">
                          {sub.title}
                          {sub.isCoop ? ' 🤝' : ''}
                        </p>
                        <p className="text-[10px] font-bold text-[#8A7068]">
                          {subTheme?.emoji} {subTheme?.name} · {sub.contestWeekKey}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-xl bg-[#FFF0F5] border border-[#F3CEDB] text-xs font-extrabold text-[#B83B64] tabular-nums shrink-0">
                        {sub.score.totalScore} 分 · {sub.score.rank} 級
                      </span>
                    </div>
                    <SubmissionStagePreview
                      species={sub.species}
                      equipped={sub.equipped}
                      poseId={sub.poseId}
                      facing={sub.facing}
                      backgroundId={sub.backgroundId}
                      filterId={sub.filterId}
                      frameId={sub.frameId}
                      stickers={sub.stickers}
                      duoPet={sub.duoPet}
                      compact
                    />
                    <p className="text-[11px] font-semibold text-[#6E544E]">{sub.caption}</p>
                    {eqNames.length > 0 && (
                      <p className="text-[10px] font-bold text-[#7D635D]">
                        穿搭：{eqNames.join(' · ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-[#256D57] bg-[#F5FBF8] rounded-xl px-2.5 py-1.5 tabular-nums">
                      <span>
                        獎勵：+{sub.rewardCoins} 金幣 · +{sub.rewardMaterials} 材料 · +
                        {sub.rewardTickets} 攝影券
                      </span>
                      <span>❤️ {sub.votesReceived} 票</span>
                    </div>
                  </article>
                );
              })}
            </div>
          );
        })()
      )}
    </div>
  );
};
