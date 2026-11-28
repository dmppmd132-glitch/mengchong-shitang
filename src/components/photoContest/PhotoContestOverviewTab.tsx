import React from 'react';
import { Camera, Clock } from 'lucide-react';
import {
  PHOTO_BACKGROUNDS,
  PHOTO_FILTERS,
  PHOTO_FRAMES,
  PHOTO_POSES,
  PHOTO_STICKERS,
} from '../../data/photoStudio';
import {
  Pet,
  PetViewDirection,
  PhotoBackground,
  PhotoContestState,
  PhotoContestTheme,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScore,
  PhotoStickerId,
  PhotoStudioState,
  PhotoSubmission,
} from '../../types';
import { RankRewardTier } from '../../data/photoContest';
import { PhotoContestScheduleInfo } from '../../utils/photoContest';
import { SubmissionStagePreview } from './SubmissionStagePreview';

interface PhotoContestOverviewTabProps {
  pet: Pet;
  theme: PhotoContestTheme;
  schedule: PhotoContestScheduleInfo;
  contest: PhotoContestState;
  studio: PhotoStudioState;
  liveScore: PhotoScore;
  liveRankTier: RankRewardTier;
  currentWeekSubsCount: number;
  currentWeekBestSub: PhotoSubmission | null;
  poseId: PhotoPose;
  facing: PetViewDirection;
  backgroundId: PhotoBackground;
  filterId: PhotoFilter;
  frameId: PhotoFrame;
  stickers: PhotoStickerId[];
  entryTitle: string;
  entryCaption: string;
  onChangePose: (id: PhotoPose) => void;
  onToggleFacing: () => void;
  onChangeBackground: (id: PhotoBackground) => void;
  onChangeFilter: (id: PhotoFilter) => void;
  onChangeFrame: (id: PhotoFrame) => void;
  onToggleSticker: (id: PhotoStickerId) => void;
  onChangeTitle: (val: string) => void;
  onChangeCaption: (val: string) => void;
  onSubmit: () => void;
  onGoToWardrobe?: () => void;
}

export const PhotoContestOverviewTab: React.FC<PhotoContestOverviewTabProps> = ({
  pet,
  theme,
  schedule,
  contest,
  studio,
  liveScore,
  liveRankTier,
  currentWeekSubsCount,
  currentWeekBestSub,
  poseId,
  facing,
  backgroundId,
  filterId,
  frameId,
  stickers,
  entryTitle,
  entryCaption,
  onChangePose,
  onToggleFacing,
  onChangeBackground,
  onChangeFilter,
  onChangeFrame,
  onToggleSticker,
  onChangeTitle,
  onChangeCaption,
  onSubmit,
  onGoToWardrobe,
}) => {
  const unlockedPosesList = PHOTO_POSES.filter((p) => studio.unlockedPoses.includes(p.id));
  const unlockedBgsList = PHOTO_BACKGROUNDS.filter((b) =>
    studio.unlockedBackgrounds.includes(b.id)
  );
  const unlockedFiltersList = PHOTO_FILTERS.filter((f) =>
    studio.unlockedFilters.includes(f.id)
  );
  const unlockedFramesList = PHOTO_FRAMES.filter((fr) =>
    studio.unlockedFrames.includes(fr.id)
  );
  const unlockedStickersList = PHOTO_STICKERS.filter((st) =>
    studio.unlockedStickers.includes(st.id)
  );

  return (
    <div className="space-y-3">
      <section className="rounded-2xl bg-white border border-[#F2DCE4] p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${theme.badgeClass}`}
              >
                第 {theme.weekOrder} 週主題
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${schedule.phaseBadgeClass}`}
              >
                {schedule.phaseLabel}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#4A3531] mt-1">
              {theme.emoji} {theme.name}
            </h3>
            <p className="text-xs font-semibold text-[#6E544E] leading-snug mt-0.5">
              {theme.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#B83B64] tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              <span>{schedule.remainingPhaseText}</span>
            </div>
            <p className="text-[10px] font-bold text-[#8A7068] mt-0.5">
              週期 {contest.currentWeekKey}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#FFF9F2] border border-[#F3E2CE] p-2.5 text-[11px] space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold text-[#6E544E]">
              📌 必備條件：{theme.requiredConditionText}
            </span>
            <span
              className={`font-extrabold whitespace-nowrap ${
                liveScore.hasRequiredAccessory ? 'text-[#1D6B52]' : 'text-[#C25124]'
              }`}
            >
              {liveScore.hasRequiredAccessory ? '✅ 已達成' : '⚠️ 未穿戴'}
            </span>
          </div>
          <p className="font-bold text-[#7D635D]">✨ 建議風格：{theme.styleTags.join(' · ')}</p>
          <p className="font-bold text-[#B83B64]">
            🎁 主題獎勵：{theme.rewardLabel}（A 級以上立即解鎖）
          </p>
          <p className="text-[10px] font-semibold text-[#8A7068]">
            🗓️ {schedule.phaseRuleSummary}（週一 00:00 公布與結算）
          </p>
        </div>

        {!liveScore.hasRequiredAccessory && onGoToWardrobe && (
          <button
            type="button"
            onClick={onGoToWardrobe}
            className="w-full min-h-[44px] rounded-2xl bg-[#FFF1F5] border border-[#F5BACD] text-[#B83B64] text-xs font-extrabold hover:bg-[#FFE4ED] transition"
          >
            👗 前往更衣室換上「{theme.name}」主題配件
          </button>
        )}

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="rounded-xl bg-[#FFF7FA] border border-[#F3DCE4] p-2 text-center">
            <p className="text-[10px] font-bold text-[#8A7068]">本週最佳</p>
            <p className="text-sm font-extrabold text-[#4A3531] tabular-nums mt-0.5">
              {currentWeekBestSub
                ? `${currentWeekBestSub.score.totalScore} 分 (${currentWeekBestSub.score.rank})`
                : '尚無作品'}
            </p>
          </div>
          <div className="rounded-xl bg-[#F4FBF8] border border-[#D4EDE3] p-2 text-center">
            <p className="text-[10px] font-bold text-[#5E7C71]">本週參賽</p>
            <p className="text-sm font-extrabold text-[#256D57] tabular-nums mt-0.5">
              {currentWeekSubsCount} 張
            </p>
          </div>
          <div className="rounded-xl bg-[#F4F8FF] border border-[#D8E5FB] p-2 text-center">
            <p className="text-[10px] font-bold text-[#5C6F91]">攝影券</p>
            <p className="text-sm font-extrabold text-[#2E5999] tabular-nums mt-0.5">
              📷 {contest.tickets.balance}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-[#EFE2DD] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#4A3531]">📸 拍攝＆即時穿搭評分</h3>
          <span
            className={`px-2.5 py-0.5 rounded-lg border text-xs font-extrabold tabular-nums ${liveRankTier.badgeClass}`}
          >
            預估 {liveScore.totalScore} 分 · {liveScore.rank} 級
          </span>
        </div>

        <SubmissionStagePreview
          species={pet.species}
          equipped={pet.accessories}
          poseId={poseId}
          facing={facing}
          backgroundId={backgroundId}
          filterId={filterId}
          frameId={frameId}
          stickers={stickers}
        />

        <div className="rounded-xl bg-[#FFFDF9] border border-[#F0E3DD] p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-[#4A3531]">
            <span>評分細節（加權總分 100 分）</span>
            <span className="text-[#B83B64]">
              預估獎賞：+{liveRankTier.coins} 金幣 / +{liveRankTier.materials} 材料
            </span>
          </div>
          {[
            { label: '主題符合度 (40%)', val: liveScore.themeMatch, max: 40 },
            { label: '穿搭完整度 (25%)', val: liveScore.outfitCompleteness, max: 25 },
            { label: '照片完成度 (20%)', val: liveScore.photoCompletion, max: 20 },
            { label: '創意與個性 (10%)', val: liveScore.creativityBonus, max: 10 },
            { label: '人氣投票 (5%)', val: liveScore.popularityVotes, max: 5 },
          ].map((row) => (
            <div key={row.label} className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-bold text-[#6E544E]">
                <span>{row.label}</span>
                <span className="tabular-nums">
                  {row.val} / {row.max}
                </span>
              </div>
              <progress
                value={row.val}
                max={row.max}
                aria-label={row.label}
                className="w-full h-1.5 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-[#F5EAE5] [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-[#FF7A9E] [&::-webkit-progress-value]:to-[#FFB36B] [&::-moz-progress-bar]:bg-[#FF7A9E]"
              />
            </div>
          ))}
          {liveScore.notes.length > 0 && (
            <p className="text-[10px] font-bold text-[#7D635D] pt-1">
              💡 {liveScore.notes.slice(0, 2).join(' · ')}
            </p>
          )}
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <p className="text-[11px] font-extrabold text-[#6E544E] mb-1">姿勢與朝向</p>
            <div className="flex flex-wrap gap-1.5">
              {unlockedPosesList.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChangePose(p.id)}
                  className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                    poseId === p.id
                      ? 'bg-[#FF7A9E] border-[#E05E83] text-white'
                      : 'bg-[#FFFDF8] border-[#EAE0DA] text-[#5A4540]'
                  }`}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={onToggleFacing}
                className="min-h-[38px] px-2.5 rounded-xl border border-[#DCE8F7] bg-[#F5F9FF] text-[11px] font-extrabold text-[#2B5799]"
              >
                🔄 {facing === 'front' ? '正面' : '翻轉'}
              </button>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-extrabold text-[#6E544E] mb-1">攝影背景</p>
            <div className="flex flex-wrap gap-1.5">
              {unlockedBgsList.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onChangeBackground(b.id)}
                  className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                    backgroundId === b.id
                      ? 'bg-[#FF7A9E] border-[#E05E83] text-white'
                      : 'bg-[#FFFDF8] border-[#EAE0DA] text-[#5A4540]'
                  }`}
                >
                  {b.emoji} {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-extrabold text-[#6E544E] mb-1">風格濾鏡</p>
            <div className="flex flex-wrap gap-1.5">
              {unlockedFiltersList.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChangeFilter(f.id)}
                  className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                    filterId === f.id
                      ? 'bg-[#67B596] border-[#4A9678] text-white'
                      : 'bg-[#FFFDF8] border-[#EAE0DA] text-[#5A4540]'
                  }`}
                >
                  {f.emoji} {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-extrabold text-[#6E544E] mb-1">
              相框與貼紙（貼紙最多 3 個）
            </p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {unlockedFramesList.map((fr) => (
                <button
                  key={fr.id}
                  type="button"
                  onClick={() => onChangeFrame(fr.id)}
                  className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                    frameId === fr.id
                      ? 'bg-[#8D72E1] border-[#6F54C7] text-white'
                      : 'bg-[#FFFDF8] border-[#EAE0DA] text-[#5A4540]'
                  }`}
                >
                  {fr.emoji} {fr.label}
                </button>
              ))}
            </div>
            {unlockedStickersList.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {unlockedStickersList.map((st) => {
                  const selected = stickers.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => onToggleSticker(st.id)}
                      className={`min-h-[36px] px-2 rounded-xl border text-[11px] font-extrabold transition ${
                        selected
                          ? 'bg-[#FFD166] border-[#D9A732] text-[#4A3531]'
                          : 'bg-white border-[#EAE0DA] text-[#6E544E]'
                      }`}
                    >
                      {st.emoji} {st.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <input
              type="text"
              maxLength={20}
              value={entryTitle}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="輸入作品標題（最多 20 字）"
              className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFFDF8] border border-[#E6D6CF] text-xs font-bold text-[#4A3531] focus:outline-none focus:border-[#FF7A9E]"
            />
            <input
              type="text"
              maxLength={45}
              value={entryCaption}
              onChange={(e) => onChangeCaption(e.target.value)}
              placeholder="寫一句參賽宣言或心情留言（選填）"
              className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFFDF8] border border-[#E6D6CF] text-xs font-semibold text-[#4A3531] focus:outline-none focus:border-[#FF7A9E]"
            />
          </div>

          <button
            type="button"
            onClick={onSubmit}
            className="w-full min-h-[46px] rounded-2xl bg-[#FF7A9E] text-white text-sm font-extrabold shadow-[0_3px_0_#D9577B] hover:bg-[#F76890] active:translate-y-0.5 transition inline-flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>拍下並提交本週參賽作品</span>
          </button>
        </div>
      </section>
    </div>
  );
};
