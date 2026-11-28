import React from 'react';
import { Heart } from 'lucide-react';
import {
  DAILY_VOTE_LIMIT,
  VOTE_MILESTONE_CONFIGS,
  WEEKLY_VOTE_LIMIT,
} from '../../data/photoContest';
import { PhotoContestState, PhotoSubmission } from '../../types';
import { SubmissionStagePreview } from './SubmissionStagePreview';

interface PhotoContestVoteTabProps {
  contest: PhotoContestState;
  votingPoolCount: number;
  votingPair: [PhotoSubmission, PhotoSubmission] | null;
  onVoteChoice: (chosenId: string) => void;
}

export const PhotoContestVoteTab: React.FC<PhotoContestVoteTabProps> = ({
  contest,
  votingPoolCount,
  votingPair,
  onVoteChoice,
}) => {
  return (
    <div className="space-y-3">
      <section className="rounded-2xl bg-white border border-[#F2DCE4] p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-[#4A3531]">
            🗳️ 匿名對比評選：更喜歡哪一張？
          </h3>
          <span className="text-[11px] font-extrabold text-[#B83B64] tabular-nums">
            今日 {contest.dailyVoteCount}/{DAILY_VOTE_LIMIT} · 本週{' '}
            {contest.weeklyVoteCount}/{WEEKLY_VOTE_LIMIT}
          </span>
        </div>
        <p className="text-[11px] font-bold text-[#7D635D] leading-snug">
          匿名顯示小鎮萌寵精選參賽作品（隱藏作者、不會抽到自己的作品與重複配對）。累積投票可解鎖攝影材料、攝影券與金冠相框！
        </p>

        {contest.dailyVoteCount >= DAILY_VOTE_LIMIT ? (
          <div className="rounded-2xl bg-[#FFF6EB] border border-[#F3D5A8] p-4 text-center space-y-1">
            <p className="text-sm font-extrabold text-[#8A5610]">
              今日投票已達上限（{DAILY_VOTE_LIMIT} / {DAILY_VOTE_LIMIT}）
            </p>
            <p className="text-xs font-semibold text-[#7D635D]">
              明天再來繼續投票評選，朝本週 50 票滿貫邁進吧！
            </p>
          </div>
        ) : contest.weeklyVoteCount >= WEEKLY_VOTE_LIMIT ? (
          <div className="rounded-2xl bg-[#EEFBF5] border border-[#BEE8D6] p-4 text-center space-y-1">
            <p className="text-sm font-extrabold text-[#1D6B52]">
              🎊 本週 50 票滿貫達成！
            </p>
            <p className="text-xs font-semibold text-[#5E7C71]">
              感謝你的熱情投票，下週一新主題開始時將重置每週配額！
            </p>
          </div>
        ) : votingPair ? (
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {votingPair.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-2xl bg-[#FFFDF8] border border-[#EFE1DC] p-2 flex flex-col justify-between gap-2"
              >
                <div className="space-y-1.5">
                  <SubmissionStagePreview
                    species={candidate.species}
                    equipped={candidate.equipped}
                    poseId={candidate.poseId}
                    facing={candidate.facing}
                    backgroundId={candidate.backgroundId}
                    filterId={candidate.filterId}
                    frameId={candidate.frameId}
                    stickers={candidate.stickers}
                    duoPet={candidate.duoPet}
                    compact
                  />
                  <div>
                    <p className="text-xs font-extrabold text-[#4A3531] truncate">
                      {candidate.title}
                    </p>
                    <p className="text-[10px] font-bold text-[#8A7068]">
                      匿名參賽者 · 目前 {candidate.votesReceived} 票
                    </p>
                    <p className="text-[10px] font-semibold text-[#6E544E] line-clamp-2 mt-0.5 leading-snug">
                      {candidate.caption}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onVoteChoice(candidate.id)}
                  className="w-full min-h-[44px] rounded-xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_2px_0_#D9577B] hover:bg-[#F76890] active:translate-y-0.5 transition inline-flex items-center justify-center gap-1"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>更喜歡這張</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#FFF7FA] border border-[#F3DCE4] p-4 text-center text-xs font-bold text-[#7D635D]">
            目前候選池（{votingPoolCount} 件）暫無可配對作品
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white border border-[#EFE2DD] p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-[#4A3531]">🎁 本週投票進度獎勵</h4>
          <span className="text-[11px] font-extrabold text-[#256D57] tabular-nums">
            {contest.weeklyVoteCount} / {WEEKLY_VOTE_LIMIT} 票
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {VOTE_MILESTONE_CONFIGS.map((ms) => {
            const reached = contest.claimedVoteMilestones.includes(ms.votes);
            return (
              <div
                key={ms.votes}
                className={`rounded-xl px-3 py-2 border flex items-center justify-between gap-2 ${
                  reached
                    ? 'bg-[#EEFBF5] border-[#BEE8D6]'
                    : 'bg-[#FFFDF8] border-[#EFE2DD]'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#4A3531] truncate">
                    {ms.label}
                  </p>
                  <p className="text-[10px] font-bold text-[#6E544E]">
                    +{ms.rewardMaterials} 攝影材料
                    {ms.rewardTickets > 0 ? ` · +${ms.rewardTickets} 攝影券` : ''}
                    {ms.rewardFrameId ? ' · 比賽限定框' : ''}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap ${
                    reached ? 'bg-[#256D57] text-white' : 'bg-[#F3EAE5] text-[#7D635D]'
                  }`}
                >
                  {reached ? '✅ 已獲得' : `目標 ${ms.votes} 票`}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
