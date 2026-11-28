import React from 'react';
import { Check } from 'lucide-react';
import { PHOTO_CONTEST_SHOP_ITEMS } from '../../data/photoContest';
import { GameState, PhotoContestState } from '../../types';
import { isShopItemOwned } from '../../utils/photoContest';

interface PhotoContestShopTabProps {
  game: GameState;
  contest: PhotoContestState;
  onBuyItem: (itemId: string) => void;
}

export const PhotoContestShopTab: React.FC<PhotoContestShopTabProps> = ({
  game,
  contest,
  onBuyItem,
}) => {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-r from-[#FFF0F5] to-[#FFF6E5] border border-[#F3D5E0] p-3.5 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold text-[#4A3531]">📷 攝影券專屬兌換商店</p>
          <p className="text-[10px] font-bold text-[#7D635D] mt-0.5">
            攝影券僅可透過攝影比賽、投票與雙人攝影獲得，不與金幣或其他券互通
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white border border-[#F2D5DF] text-xs font-extrabold text-[#B83B64] tabular-nums shrink-0">
          📷 {contest.tickets.balance}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {PHOTO_CONTEST_SHOP_ITEMS.map((item) => {
          const owned = isShopItemOwned(game, item.id);
          const canAfford = contest.tickets.balance >= item.ticketPrice;
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-white border border-[#EFE2DD] p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{item.emoji}</span>
                  <p className="text-xs font-extrabold text-[#4A3531] truncate">
                    {item.name}
                  </p>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#F7EFEA] text-[10px] font-extrabold text-[#7D635D]">
                    {item.badgeText}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#6E544E] leading-snug mt-0.5">
                  {item.description}
                </p>
              </div>
              {owned ? (
                <span className="min-h-[40px] px-3 rounded-xl bg-[#EEFBF5] border border-[#BEE8D6] text-[#1D6B52] text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <Check className="w-3.5 h-3.5" />
                  <span>已擁有</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onBuyItem(item.id)}
                  className={`min-h-[44px] px-3 rounded-xl text-xs font-extrabold shrink-0 whitespace-nowrap transition ${
                    canAfford
                      ? 'bg-[#FF7A9E] text-white shadow-[0_2px_0_#D9577B] hover:bg-[#F76890]'
                      : 'bg-[#F5ECE8] text-[#9A857E] border border-[#E5D7D0]'
                  }`}
                >
                  📷 {item.ticketPrice} 兌換
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
