import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { CollectionCelebrationEvent } from '../../utils/collection';

interface CollectionCelebrationModalProps {
  event: CollectionCelebrationEvent | null;
  onClose: () => void;
}

export const CollectionCelebrationModal: React.FC<CollectionCelebrationModalProps> = ({
  event,
  onClose,
}) => {
  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2620]/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collection-celebration-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#FFF5E2] via-[#FFFDF8] to-[#FFF0F6] border-2 border-[#F3C8D8] p-5 text-center space-y-3.5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉賀禮彈窗"
          className="min-h-[44px] min-w-[44px] absolute top-2 right-2 rounded-2xl flex items-center justify-center text-[#7D635D] hover:bg-[#F5ECE6] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-3xl bg-white border-2 border-[#F3D5DF] mx-auto flex items-center justify-center text-4xl shadow-xs">
          {event.emoji}
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#C43463]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {event.kind === 'milestone' ? '圖鑑總收集里程碑達成' : '套裝連鎖進階解鎖'}
            </span>
          </div>
          <h3
            id="collection-celebration-title"
            className="text-lg font-extrabold text-[#4A3531]"
          >
            {event.title}
          </h3>
          <p className="text-xs font-bold text-[#6E544E] leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="rounded-2xl bg-white/95 border border-[#EFE0D7] px-3.5 py-2.5 text-xs font-extrabold text-[#1F6B54]">
          🎁 獲得獎勵：{event.rewardSummary}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-[46px] w-full rounded-2xl bg-[#FF7A9E] text-white text-sm font-extrabold shadow-[0_3px_0_#D9577B] hover:bg-[#F56990] active:translate-y-0.5 transition"
        >
          開心收下！
        </button>
      </div>
    </div>
  );
};
