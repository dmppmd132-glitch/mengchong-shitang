import React from 'react';
import { ArrowUpRight, CheckCircle2, Clock, Lock, Users, X } from 'lucide-react';
import { COLLECTION_CATEGORY_BY_ID } from '../../data/collection';
import { CollectionItem, CollectionJumpTarget } from '../../types';
import { CollectionItemVisual } from './CollectionItemCard';

interface CollectionItemDetailModalProps {
  item: CollectionItem | null;
  onClose: () => void;
  onJumpToTarget: (target: CollectionJumpTarget, item: CollectionItem) => void;
}

const RARITY_LABELS: Record<CollectionItem['rarity'], string> = {
  common: '一般日常',
  rare: '稀有收藏',
  epic: '閃耀珍藏',
  event: '活動限定',
  coop: '共養限定',
};

export const CollectionItemDetailModal: React.FC<CollectionItemDetailModalProps> = ({
  item,
  onClose,
  onJumpToTarget,
}) => {
  if (!item) return null;

  const category = COLLECTION_CATEGORY_BY_ID[item.categoryId];
  const displayName = item.isMysteryVisitor && !item.owned ? '???（神秘訪客）' : item.name;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2620]/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collection-detail-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-5 space-y-4 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="text-[11px] font-extrabold text-[#856B64]">
            {category.emoji} {category.label} · {RARITY_LABELS[item.rarity]}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉詳情"
            className="min-h-[44px] min-w-[44px] -mt-2 -mr-2 rounded-2xl flex items-center justify-center text-[#7D635D] hover:bg-[#F5ECE6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <CollectionItemVisual item={item} size="lg" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3
              id="collection-detail-title"
              className="text-lg font-extrabold text-[#4A3531] leading-tight"
            >
              {displayName}
            </h3>
            {item.subtitle && (
              <p className="text-xs font-bold text-[#7D635D]">{item.subtitle}</p>
            )}
            <div className="flex items-center gap-1.5 text-xs font-extrabold">
              {item.owned ? (
                <span className="inline-flex items-center gap-1 text-[#1F6B54]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>已收錄於圖鑑</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#9D5B12]">
                  <Lock className="w-4 h-4" />
                  <span>尚未解鎖</span>
                </span>
              )}
              {typeof item.wearCount === 'number' && (
                <span className="text-[#7D635D] tabular-nums">
                  · 穿戴次數 {item.wearCount} 次
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#FAF4EE] border border-[#EDE0D6] p-3.5 space-y-2.5 text-xs">
          <div>
            <div className="font-extrabold text-[#5A3E36] mb-0.5">藏品介紹</div>
            <p className="text-[#6E544E] leading-relaxed">{item.description}</p>
          </div>

          <div className="pt-2 border-t border-[#EAE0D7]">
            <div className="font-extrabold text-[#5A3E36] mb-0.5">取得方式</div>
            <p className="text-[#6E544E] leading-relaxed">{item.obtainMethod}</p>
          </div>

          {!item.owned && item.mysteryHint && (
            <div className="pt-2 border-t border-[#EAE0D7]">
              <div className="font-extrabold text-[#B84C24] mb-0.5">神秘線索</div>
              <p className="text-[#7D4B34] leading-relaxed">{item.mysteryHint}</p>
            </div>
          )}

          {item.coopProgressText && (
            <div className="pt-2 border-t border-[#EAE0D7] flex items-center gap-1.5 text-[#1F6B54] font-bold">
              <Users className="w-4 h-4 shrink-0" />
              <span>{item.coopProgressText}</span>
            </div>
          )}

          {item.eventRemainingText && (
            <div className="pt-2 border-t border-[#EAE0D7] flex items-center gap-1.5 text-[#B83B64] font-bold tabular-nums">
              <Clock className="w-4 h-4 shrink-0" />
              <span>限時活動剩餘：{item.eventRemainingText}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-4 rounded-2xl bg-[#F3E9E2] text-[#5A3E36] text-xs font-extrabold hover:bg-[#EAE0D7] transition"
          >
            關閉
          </button>
          <button
            type="button"
            onClick={() => {
              onJumpToTarget(item.jumpTarget, item);
              onClose();
            }}
            className="min-h-[46px] flex-1 px-4 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] hover:bg-[#F56990] active:translate-y-0.5 transition inline-flex items-center justify-center gap-1.5"
          >
            <span>{item.jumpLabel}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
