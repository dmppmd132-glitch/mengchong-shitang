import React, { useState } from 'react';
import {
  Check,
  Clock,
  Flower2,
  HeartHandshake,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import {
  SAKURA_PICNIC_SHOP_ITEMS,
  SEASON_FESTIVAL_BLUEPRINTS,
} from '../../data/seasons';
import { GameState, SharedPetRoom } from '../../types';
import {
  createInitialSeasonSystemState,
  getSeasonEventRemainingText,
  isSakuraShopItemOwned,
} from '../../utils/seasons';

type FestivalTab = 'tasks' | 'coop' | 'shop' | 'calendar';

interface SeasonEventModalProps {
  open: boolean;
  onClose: () => void;
  game: GameState;
  sharedRoom: SharedPetRoom | null;
  currentUserId: string;
  onClaimDailyTask: (taskId: string) => { ok: boolean; notice?: string; error?: string };
  onBuyShopItem: (shopItemId: string) => { ok: boolean; notice?: string; error?: string };
  onClaimCoopReward: () => { ok: boolean; notice?: string; error?: string };
  onOpenSharedPet?: () => void;
}

export const SeasonEventModal: React.FC<SeasonEventModalProps> = ({
  open,
  onClose,
  game,
  sharedRoom,
  currentUserId,
  onClaimDailyTask,
  onBuyShopItem,
  onClaimCoopReward,
  onOpenSharedPet,
}) => {
  const [tab, setTab] = useState<FestivalTab>('tasks');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!open) return null;

  const sys = game.seasonSystem ?? createInitialSeasonSystemState();
  const ev = sys.seasonEvent;
  const coop = ev.coopTask;
  const coopClaimed = Boolean(coop?.claimedByUserIds.includes(currentUserId));
  const claimableDailyCount = ev.dailyTasks.filter((t) => t.completed && !t.claimed).length;
  const coopReady = Boolean(coop?.completed && !coopClaimed);

  const showOutcome = (res: { ok: boolean; notice?: string; error?: string }) => {
    if (res.ok && res.notice) setFeedback(res.notice);
    else if (!res.ok && res.error) setFeedback(res.error);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2621]/55 backdrop-blur-xs flex items-center justify-center p-2 overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="season-event-modal-title"
    >
      <div className="w-full max-w-[424px] max-h-[93dvh] rounded-3xl bg-[#FFFDF8] border-2 border-[#F4C4D4] shadow-2xl flex flex-col overflow-hidden">
        <header className="px-4 py-2.5 bg-gradient-to-r from-[#FFE3EF] via-[#FFF4E0] to-[#E8F8F1] border-b border-[#F2D5DF] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-white/90 text-[#D64470] flex items-center justify-center text-xl shrink-0">
              {ev.emoji}
            </div>
            <div className="min-w-0">
              <h2
                id="season-event-modal-title"
                className="text-sm font-extrabold text-[#4A3531] truncate"
              >
                {ev.name}
              </h2>
              <p className="text-[11px] font-bold text-[#8E2B4E] tabular-nums truncate inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{getSeasonEventRemainingText(ev)}</span>
                <span>·</span>
                <span>
                  {ev.currencyEmoji} {ev.ticketBalance} {ev.currencyName}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉櫻花野餐祭"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/85 text-[#5A3E36] flex items-center justify-center hover:bg-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <nav
          aria-label="櫻花野餐祭分頁"
          className="px-3 pt-2 pb-1.5 bg-[#FFF7FA] border-b border-[#F2DCE4] shrink-0"
        >
          <div className="grid grid-cols-4 gap-1 bg-[#F2E2E8] p-1 rounded-2xl">
            {(
              [
                { id: 'tasks', label: '每日任務', icon: Flower2, badge: claimableDailyCount },
                { id: 'coop', label: '共養野餐', icon: HeartHandshake, badge: coopReady ? 1 : 0 },
                { id: 'shop', label: '櫻花商店', icon: ShoppingBag, badge: 0 },
                { id: 'calendar', label: '四季慶典', icon: Sparkles, badge: 0 },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setTab(item.id);
                  }}
                  className={`min-h-[44px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 whitespace-nowrap transition ${
                    active
                      ? 'bg-white text-[#D64470] shadow-xs'
                      : 'text-[#6E544E] hover:text-[#4A3531]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#FF6B97] text-white text-[10px] tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5">
          <section className="rounded-2xl bg-gradient-to-r from-[#FFF0F6] to-[#FFF7E8] border border-[#F3CBD9] p-3 text-xs font-bold text-[#6E544E] leading-relaxed">
            {ev.description}
          </section>

          {feedback && (
            <div className="rounded-2xl bg-[#E5F7F0] border border-[#A6DFCA] px-3 py-2 text-xs font-extrabold text-[#1F6B54] flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {tab === 'tasks' && (
            <section className="space-y-2.5">
              {ev.dailyTasks.map((task) => {
                const pct = Math.min(100, Math.round((task.progress / Math.max(1, task.target)) * 100));
                return (
                  <article
                    key={task.id}
                    className="rounded-2xl bg-[#FFFDF8] border-2 border-[#F4DFD7] p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-xl shrink-0">{task.emoji}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-[#4A3531]">{task.title}</div>
                          <p className="text-[11px] font-bold text-[#7D635D] mt-0.5">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-[#B83B64] tabular-nums shrink-0">
                        {task.progress}/{task.target}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#F3E2DA] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FF7A9E] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-[#8E2B4E] tabular-nums">
                        獎勵：🌸 {task.rewardTickets} 櫻花券 · 🪙 {task.rewardCoins} 金幣
                      </span>
                      <button
                        type="button"
                        disabled={!task.completed || task.claimed}
                        onClick={() => showOutcome(onClaimDailyTask(task.id))}
                        className={`min-h-[44px] px-3.5 rounded-xl text-xs font-extrabold shrink-0 transition ${
                          task.claimed
                            ? 'bg-[#E6F8F1] text-[#1F6B54]'
                            : task.completed
                            ? 'bg-[#FF7A9E] text-white shadow-[0_2px_0_#D9577B] active:scale-95'
                            : 'bg-[#EDE2DC] text-[#8E7B75] cursor-not-allowed'
                        }`}
                      >
                        {task.claimed ? '✓ 已領取' : task.completed ? '領取櫻花券' : '進行中'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {tab === 'coop' && coop && (
            <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#F3C8D7] p-3.5 space-y-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#B83B64]">{coop.title}</h3>
                <p className="text-xs font-bold text-[#6E544E] mt-1 leading-relaxed">
                  {coop.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#FFF5F8] border border-[#F3D2DF] p-2.5 text-center">
                  <div className="text-[11px] font-bold text-[#7D635D]">野餐料理／餵食</div>
                  <div className="text-base font-extrabold text-[#B83B64] tabular-nums mt-0.5">
                    {coop.picnicFoodCount} / {coop.picnicFoodTarget}
                  </div>
                </div>
                <div className="rounded-xl bg-[#E8F8F2] border border-[#B5E5D3] p-2.5 text-center">
                  <div className="text-[11px] font-bold text-[#5A756B]">櫻花留念合照</div>
                  <div className="text-base font-extrabold text-[#1F6B54] tabular-nums mt-0.5">
                    {coop.photoCount} / {coop.photoTarget}
                  </div>
                </div>
              </div>

              {!sharedRoom && onOpenSharedPet && (
                <div className="rounded-xl bg-[#FFF6DF] border border-[#F2CE6D] p-2.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#8A5610]">
                    單人也可累積進度；加入共養小屋即可與夥伴領取相同雙人獎勵！
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSharedPet();
                    }}
                    className="min-h-[40px] px-3 rounded-xl bg-[#FF7A9E] text-white text-xs font-extrabold shrink-0"
                  >
                    共養小屋
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs font-extrabold text-[#8E2B4E] tabular-nums">
                  🎁 🌸 {coop.rewardTickets} 櫻花券 · 🪙 {coop.rewardCoins} 金幣
                </span>
                <button
                  type="button"
                  disabled={!coop.completed || coopClaimed}
                  onClick={() => showOutcome(onClaimCoopReward())}
                  className={`min-h-[44px] px-4 rounded-xl text-xs font-extrabold shrink-0 transition ${
                    coopClaimed
                      ? 'bg-[#E6F8F1] text-[#1F6B54]'
                      : coop.completed
                      ? 'bg-[#5CC9A7] text-white shadow-[0_2px_0_#3BA886] active:scale-95'
                      : 'bg-[#EDE2DC] text-[#8E7B75] cursor-not-allowed'
                  }`}
                >
                  {coopClaimed ? '✓ 已領取' : coop.completed ? '領取共養獎勵' : '進行中'}
                </button>
              </div>
            </section>
          )}

          {tab === 'shop' && (
            <section className="space-y-2.5">
              {SAKURA_PICNIC_SHOP_ITEMS.map((item) => {
                const owned = isSakuraShopItemOwned(game, item);
                const canBuy = !owned && ev.ticketBalance >= item.ticketPrice;
                return (
                  <article
                    key={item.id}
                    className="rounded-2xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{item.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#4A3531]">{item.name}</div>
                        <p className="text-[11px] font-bold text-[#7D635D] leading-snug mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={owned || !canBuy}
                      onClick={() => showOutcome(onBuyShopItem(item.id))}
                      className={`min-h-[44px] px-3 rounded-xl text-xs font-extrabold shrink-0 tabular-nums transition ${
                        owned
                          ? 'bg-[#E6F8F1] text-[#1F6B54]'
                          : canBuy
                          ? 'bg-[#FF7A9E] text-white shadow-[0_2px_0_#D9577B] active:scale-95'
                          : 'bg-[#EDE2DC] text-[#8E7B75] cursor-not-allowed'
                      }`}
                    >
                      {owned ? '✓ 已擁有' : `🌸 ${item.ticketPrice} 兌換`}
                    </button>
                  </article>
                );
              })}
            </section>
          )}

          {tab === 'calendar' && (
            <section className="space-y-2.5">
              {SEASON_FESTIVAL_BLUEPRINTS.map((bp) => (
                <article
                  key={bp.eventId}
                  className="rounded-2xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-extrabold text-[#4A3531]">
                      {bp.emoji} {bp.name} · {bp.durationDays} 天
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                        bp.status === 'active'
                          ? 'bg-[#FFEAF3] text-[#B83B64]'
                          : 'bg-[#EDE3DC] text-[#6E544E]'
                      }`}
                    >
                      {bp.status === 'active' ? '當期開放' : '預留結構'}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-[#7D635D] leading-relaxed">
                    {bp.description}
                  </p>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
