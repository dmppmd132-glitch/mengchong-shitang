import React from 'react';
import { HeartHandshake } from 'lucide-react';
import {
  COOP_PHOTO_REWARDS,
  COOP_PHOTO_TASK_TEMPLATES,
} from '../../data/photoContest';
import {
  CoopPhotoSession,
  GameState,
  Pet,
  PetViewDirection,
  PhotoBackground,
  PhotoContestTheme,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoStickerId,
  SharedPetRoom,
} from '../../types';
import { SubmissionStagePreview } from './SubmissionStagePreview';

interface PhotoContestCoopTabProps {
  game: GameState;
  pet: Pet;
  partnerPet: Pet;
  theme: PhotoContestTheme;
  sharedRoom: SharedPetRoom | null;
  coopSession: CoopPhotoSession;
  coopStreak: number;
  coopHasClaimed: boolean;
  poseId: PhotoPose;
  facing: PetViewDirection;
  backgroundId: PhotoBackground;
  filterId: PhotoFilter;
  frameId: PhotoFrame;
  stickers: PhotoStickerId[];
  coopTitle: string;
  onChangeCoopTitle: (val: string) => void;
  onCoopOutfit: () => void;
  onCoopDecor: () => void;
  onGoToVote: () => void;
  onSubmitCoopEntry: () => void;
  onClaimCoopReward: () => void;
}

export const PhotoContestCoopTab: React.FC<PhotoContestCoopTabProps> = ({
  game,
  pet,
  partnerPet,
  theme,
  sharedRoom,
  coopSession,
  coopStreak,
  coopHasClaimed,
  poseId,
  facing,
  backgroundId,
  filterId,
  frameId,
  stickers,
  coopTitle,
  onChangeCoopTitle,
  onCoopOutfit,
  onCoopDecor,
  onGoToVote,
  onSubmitCoopEntry,
  onClaimCoopReward,
}) => {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-r from-[#FFF0F6] to-[#EFF7FF] border border-[#F2D5DF] p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-[#D94D7B]" />
            <h3 className="text-sm font-extrabold text-[#4A3531]">
              {sharedRoom ? '雙人共養攝影比賽' : '雙寵搭檔攝影挑戰'}
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-white border border-[#F2D5DF] text-[10px] font-extrabold text-[#B83B64] tabular-nums">
            連續合作 {coopStreak} 週
          </span>
        </div>
        <p className="text-[11px] font-bold text-[#6E544E] leading-snug">
          完賽可領大獎：+{COOP_PHOTO_REWARDS.coins} 金幣 · +{COOP_PHOTO_REWARDS.materials}{' '}
          攝影材料 · +{COOP_PHOTO_REWARDS.tickets} 攝影券 · 親密度 +{COOP_PHOTO_REWARDS.intimacy}！
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-extrabold">
          <div
            className={`rounded-xl px-2.5 py-1.5 border ${
              game.coop.unlockedBadges.includes('photo_partner')
                ? 'bg-[#EEFBF5] border-[#BEE8D6] text-[#1D6B52]'
                : 'bg-white border-[#EFE2DD] text-[#7D635D]'
            }`}
          >
            🏅 連續 3 週：攝影搭檔徽章
          </div>
          <div
            className={`rounded-xl px-2.5 py-1.5 border ${
              game.encyclopedia.unlockedTitles.includes('best_photo_partner')
                ? 'bg-[#FFF5DC] border-[#E8C46E] text-[#7B4F08]'
                : 'bg-white border-[#EFE2DD] text-[#7D635D]'
            }`}
          >
            👑 連續 5 週：最佳攝影搭檔稱號
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#EFE2DD] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-[#4A3531]">
            🤝 本週「{theme.name}」雙寵合照進度
          </h4>
          {coopSession.lastUpdatedByName && (
            <span className="text-[10px] font-bold text-[#8A7068]">
              最近更新：{coopSession.lastUpdatedByName}
            </span>
          )}
        </div>

        {coopSession.steps.map((step) => {
          const tpl = COOP_PHOTO_TASK_TEMPLATES.find((t) => t.key === step.key);
          const done = step.progress >= step.target;
          return (
            <div
              key={step.key}
              className={`rounded-xl p-2.5 border space-y-2 ${
                done
                  ? 'bg-[#EEFBF5] border-[#BEE8D6]'
                  : 'bg-[#FFFDF8] border-[#EFE2DD]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#4A3531]">
                    {step.emoji} {step.label}（{step.progress} / {step.target}）
                  </p>
                  <p className="text-[10px] font-semibold text-[#7D635D]">{tpl?.hint}</p>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg shrink-0 ${
                    done ? 'bg-[#256D57] text-white' : 'bg-[#F5EAE5] text-[#7D635D]'
                  }`}
                >
                  {done ? '✅ 完成' : '進行中'}
                </span>
              </div>

              {step.key === 'outfit' && !done && (
                <button
                  type="button"
                  onClick={onCoopOutfit}
                  className="w-full min-h-[40px] rounded-xl bg-[#FF7A9E] text-white text-[11px] font-extrabold"
                >
                  👗 確認目前「{theme.name}」主題穿搭與姿勢
                </button>
              )}

              {step.key === 'decor' && !done && (
                <button
                  type="button"
                  onClick={onCoopDecor}
                  className="w-full min-h-[40px] rounded-xl bg-[#67B596] text-white text-[11px] font-extrabold"
                >
                  🎨 套用目前舞台佈置與濾鏡
                </button>
              )}

              {step.key === 'vote' && !done && (
                <button
                  type="button"
                  onClick={onGoToVote}
                  className="w-full min-h-[40px] rounded-xl bg-[#8D72E1] text-white text-[11px] font-extrabold"
                >
                  🗳️ 前往投票評選（每投 1 票同步推進）
                </button>
              )}
            </div>
          );
        })}

        <div className="pt-1 space-y-2 border-t border-[#F4EAE4]">
          <p className="text-[11px] font-extrabold text-[#4A3531]">
            📸 雙寵合影預覽：{pet.name} ＆ {partnerPet.name}
          </p>
          <SubmissionStagePreview
            species={pet.species}
            equipped={pet.accessories}
            poseId={poseId}
            facing={facing}
            backgroundId={backgroundId}
            filterId={filterId}
            frameId={frameId}
            stickers={stickers}
            duoPet={{
              petId: partnerPet.id,
              petName: partnerPet.name,
              species: partnerPet.species,
              equipped: partnerPet.accessories,
              poseId: coopSession.draftPoseId,
              facing: 'front',
              weightAtCapture: partnerPet.weight,
            }}
            compact
          />
          <input
            type="text"
            maxLength={20}
            value={coopTitle}
            onChange={(e) => onChangeCoopTitle(e.target.value)}
            placeholder="雙寵合照標題"
            className="w-full min-h-[40px] px-3 rounded-xl bg-[#FFFDF8] border border-[#E6D6CF] text-xs font-bold text-[#4A3531]"
          />
          <button
            type="button"
            onClick={onSubmitCoopEntry}
            className="w-full min-h-[44px] rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B]"
          >
            📸 提交雙寵參賽合照
          </button>

          <button
            type="button"
            disabled={!coopSession.completed || coopHasClaimed}
            onClick={onClaimCoopReward}
            className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold transition ${
              coopHasClaimed
                ? 'bg-[#EEFBF5] border border-[#BEE8D6] text-[#1D6B52]'
                : coopSession.completed
                ? 'bg-[#FFD166] text-[#4A3531] shadow-[0_3px_0_#D9A732]'
                : 'bg-[#F5ECE8] text-[#9A857E]'
            }`}
          >
            {coopHasClaimed
              ? '✅ 已領取本週雙寵攝影大獎'
              : coopSession.completed
              ? '🎁 領取雙寵完賽大獎 (+280金幣 +4材料 +30攝影券)'
              : '完成上述 4 項雙寵攝影任務後即可領取大獎'}
          </button>
        </div>
      </div>
    </div>
  );
};
