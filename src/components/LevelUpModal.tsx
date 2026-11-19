import React from 'react';
import { Camera, Gift, Sparkles, Star, X } from 'lucide-react';
import { GrowthStageInfo, Pet } from '../types';
import { PiggyCharacter } from './PiggyCharacter';

interface LevelUpModalProps {
  stage: GrowthStageInfo | null;
  prestigeStar?: number | null;
  rewardText?: string | null;
  pet: Pet;
  onClose: () => void;
  onTakeGrowthPhoto?: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  stage,
  prestigeStar = null,
  rewardText = null,
  pet,
  onClose,
  onTakeGrowthPhoto,
}) => {
  if (!stage && prestigeStar === null) return null;

  const isPrestige = prestigeStar !== null && prestigeStar > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[368px] rounded-3xl bg-[#FFFDF8] border-2 border-[#FAD5E0] p-6 shadow-2xl text-center relative animate-summary-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉升級視窗"
          className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-[#F7ECE6] text-[#5A3E36] hover:bg-[#EEDCD3]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Live Evolved Pet Showcase */}
        <div className="mx-auto w-28 h-28 rounded-3xl bg-gradient-to-b from-[#FFF4D6] via-[#FFEAF0] to-[#E8F8F2] border-2 border-[#F5CF6B] flex items-center justify-center relative overflow-hidden">
          <div className="animate-piggy-float">
            <PiggyCharacter
              species={pet.species}
              growth={pet.growth}
              roundness={pet.roundness}
              action="idle"
              expression="sparkle"
              equipped={pet.accessories}
              interactive={false}
              size={96}
            />
          </div>
          <span
            className="pointer-events-none absolute top-1.5 left-2 text-sm"
            aria-hidden="true"
          >
            {isPrestige ? '🌟' : '✨'}
          </span>
        </div>

        <p className="mt-3.5 text-xs font-extrabold text-[#D64470] inline-flex items-center justify-center gap-1">
          {isPrestige ? (
            <>
              <Star className="w-3.5 h-3.5 fill-[#FFD166] text-[#D4880F]" />
              <span>閃耀星等晉升！</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>成長等級提升！</span>
            </>
          )}
        </p>

        <h2 id="levelup-title" className="mt-1 text-xl font-extrabold text-[#4A3531]">
          {isPrestige
            ? `${pet.name} 達成「閃耀 ★${prestigeStar}」`
            : `${pet.name} 變成「${stage?.name ?? ''}」了`}
        </h2>

        <p className="mt-1.5 text-xs text-[#6E544E] leading-relaxed">
          {isPrestige
            ? `滿滿的愛與細心陪伴讓 ${pet.name} 閃閃發亮，繼續朝下一個星等前進吧！`
            : stage?.tagline}
        </p>

        {!isPrestige && stage && (
          <div className="mt-3 rounded-2xl bg-[#E8F8F2] border border-[#ADE6D3] px-3.5 py-2.5 text-xs font-bold text-[#256D57]">
            新解鎖：{stage.unlockFeature}
          </div>
        )}

        {rewardText && (
          <div className="mt-2.5 rounded-2xl bg-[#FFF6DC] border border-[#F2CE6D] px-3.5 py-2 text-xs font-extrabold text-[#8A5610] inline-flex items-center justify-center gap-1.5 w-full tabular-nums">
            <Gift className="w-4 h-4 shrink-0 text-[#D4880F]" />
            <span>已領取祝賀禮：{rewardText}</span>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {onTakeGrowthPhoto && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onTakeGrowthPhoto();
              }}
              className="w-full min-h-[44px] rounded-2xl bg-[#5CC9A7] text-white font-extrabold text-xs border border-[#45B592] border-b-4 border-b-[#329475] inline-flex items-center justify-center gap-1.5 active:translate-y-[2px] active:border-b-2 transition"
            >
              <Camera className="w-4 h-4" />
              <span>拍一張成長紀念照</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-2xl bg-[#FF7A9E] text-white font-extrabold text-sm border border-[#E55E83] border-b-4 border-b-[#C54368] active:translate-y-[2px] active:border-b-2 transition"
          >
            太棒了！繼續陪伴
          </button>
        </div>
      </div>
    </div>
  );
};
