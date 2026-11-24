import React, { useState } from 'react';
import { Award, Check, Clock, Sparkles, X } from 'lucide-react';
import { ROOM_ITEMS } from '../../data/house';
import { INGREDIENT_IDS, INGREDIENTS } from '../../data/kitchen';
import { VISITOR_BY_ID, VISITOR_TREAT_BY_ID, VISITOR_TREATS } from '../../data/visitors';
import { GameState, TownOrderCategory, VisitorId, VisitorTreatId } from '../../types';
import { getPlayerStockForRequirement } from '../../utils/townOrders';
import { VisitorSprite } from './VisitorIllustrations';

interface TownOrderBoardModalProps {
  open: boolean;
  game: GameState;
  currentUserId: string;
  hasSharedRoom: boolean;
  onClose: () => void;
  onDeliverOrderItem: (orderId: string, itemKey: string) => void;
  onClaimOrderReward: (orderId: string) => void;
  onContributeCoopVisitor: (itemKey: string) => void;
  onClaimCoopVisitorReward: () => void;
  onCaptureVisitorPhoto: (visitorId: VisitorId, shareToBoard?: boolean) => void;
  onCraftShardFurniture: (itemId: string) => void;
  onBuyTreat: (treatId: VisitorTreatId) => void;
}

type BoardTab = 'orders' | 'coop_visitor' | 'shards';

const CATEGORY_LABEL: Record<TownOrderCategory, { label: string; badgeClass: string }> = {
  visitor: {
    label: '訪客訂單',
    badgeClass: 'bg-[#E6F8F1] border-[#9ADBC2] text-[#1F6B54]',
  },
  coop: {
    label: '共養訂單',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
  advanced: {
    label: '高級訂單',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
  },
};

export const TownOrderBoardModal: React.FC<TownOrderBoardModalProps> = ({
  open,
  game,
  currentUserId,
  hasSharedRoom,
  onClose,
  onDeliverOrderItem,
  onClaimOrderReward,
  onContributeCoopVisitor,
  onClaimCoopVisitorReward,
  onCaptureVisitorPhoto,
  onCraftShardFurniture,
  onBuyTreat,
}) => {
  const [activeTab, setActiveTab] = useState<BoardTab>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | TownOrderCategory>('all');

  if (!open) return null;

  const orders = game.townOrders ?? [];
  const filteredOrders =
    orderFilter === 'all'
      ? orders
      : orders.filter((o) => o.category === orderFilter);

  const shardFurniture = ROOM_ITEMS.filter(
    (item) => typeof item.shardCost === 'number' && item.shardCost > 0
  );
  const coopVisitor = game.coop.coopVisitor ?? null;
  const visitorStreak = game.coop.visitorStreakDays ?? 0;

  const formatExpiry = (expiresAt: number, overdue: boolean) => {
    if (overdue) return '已逾期（不扣資源，完成可得基礎謝禮）';
    const diffMs = Math.max(0, expiresAt - Date.now());
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `剩餘 ${hrs} 小時 ${mins} 分`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#3C2925]/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] max-h-[88vh] rounded-t-[30px] bg-[#FFFDF9] border-t-2 border-x-2 border-[#F0D9CE] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 pt-3 pb-2.5 bg-gradient-to-r from-[#FFF3D8] via-[#FFEAF0] to-[#E6F8F1] border-b border-[#F2E0D6] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-[#4A3531] flex items-center gap-1.5">
              <span>📋</span>
              <span>小鎮訂單板＆碎片工坊</span>
            </h2>
            <p className="text-[11px] font-bold text-[#7D635D] tabular-nums">
              🧩 碎片 {game.furnitureShards} · ⚡ 加速券 {game.farmSpeedTickets ?? 0} · 🪙 {game.coins}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉小鎮訂單板"
            className="w-10 h-10 rounded-full bg-white/90 border border-[#EED8CE] flex items-center justify-center text-[#5A3E36] active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main tabs */}
        <div className="px-4 pt-2.5 pb-1.5 grid grid-cols-3 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`min-h-[40px] rounded-2xl text-xs font-extrabold border transition ${
              activeTab === 'orders'
                ? 'bg-[#FF7A9E] border-[#FF7A9E] text-white'
                : 'bg-white border-[#EFE0D7] text-[#6E544E]'
            }`}
          >
            小鎮訂單 ({orders.filter((o) => !o.claimedByUserIds.includes(currentUserId)).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coop_visitor')}
            className={`min-h-[40px] rounded-2xl text-xs font-extrabold border transition ${
              activeTab === 'coop_visitor'
                ? 'bg-[#5CC9A7] border-[#5CC9A7] text-white'
                : 'bg-white border-[#EFE0D7] text-[#6E544E]'
            }`}
          >
            共同訪客 {coopVisitor && !coopVisitor.completed ? '●' : ''}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shards')}
            className={`min-h-[40px] rounded-2xl text-xs font-extrabold border transition ${
              activeTab === 'shards'
                ? 'bg-[#F59E0B] border-[#F59E0B] text-white'
                : 'bg-white border-[#EFE0D7] text-[#6E544E]'
            }`}
          >
            碎片＆點心
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-1 space-y-3">
          {activeTab === 'orders' && (
            <>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'visitor', label: '🐾 訪客訂單' },
                  { id: 'coop', label: '💞 共養訂單' },
                  { id: 'advanced', label: '🌙 高級訂單' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOrderFilter(f.id as 'all' | TownOrderCategory)}
                    className={`px-3 min-h-[34px] rounded-xl text-[11px] font-extrabold border shrink-0 transition ${
                      orderFilter === f.id
                        ? 'bg-[#5A3E36] border-[#5A3E36] text-white'
                        : 'bg-white border-[#EAD9D0] text-[#6E544E]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredOrders.map((order) => {
                const catMeta = CATEGORY_LABEL[order.category];
                const claimed = order.claimedByUserIds.includes(currentUserId);
                const doneQty = order.requirements.reduce((s, r) => s + r.deliveredQty, 0);
                const totalQty = order.requirements.reduce((s, r) => s + r.requiredQty, 0);
                const pct = totalQty > 0 ? Math.round((doneQty / totalQty) * 100) : 0;

                return (
                  <div
                    key={order.id}
                    className={`rounded-3xl border-2 p-3.5 space-y-2.5 ${
                      claimed
                        ? 'bg-[#F7FBF8] border-[#CBEAD9] opacity-85'
                        : order.overdue
                        ? 'bg-[#FFF8F4] border-[#F3CFC2]'
                        : 'bg-white border-[#EFE0D7]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${catMeta.badgeClass}`}>
                            {catMeta.label}
                          </span>
                          <span className="text-[10px] font-bold text-[#8E756E] inline-flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {formatExpiry(order.expiresAt, order.overdue)}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-[#4A3531] mt-1">
                          {order.emoji} {order.title}
                        </h3>
                        <p className="text-[11px] font-medium text-[#7D635D] leading-snug">
                          {order.description}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-[#B83B64] tabular-nums shrink-0">
                        {doneQty}/{totalQty}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-[#F5ECE6] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#5CC9A7] to-[#34A885] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Requirements */}
                    <div className="space-y-1.5">
                      {order.requirements.map((req) => {
                        const stock = getPlayerStockForRequirement(game, req);
                        const fulfilled = req.deliveredQty >= req.requiredQty;
                        return (
                          <div
                            key={req.key}
                            className="rounded-2xl bg-[#FAF5F0] border border-[#EAD9D0] px-2.5 py-1.5 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-extrabold text-[#4A3531]">
                                {req.emoji} {req.label}{' '}
                                <span className="text-[#8A5610] tabular-nums">
                                  ({req.deliveredQty}/{req.requiredQty})
                                </span>
                              </div>
                              <div className="text-[10px] font-bold text-[#8E756E] tabular-nums">
                                目前持有：{stock}
                              </div>
                            </div>
                            {fulfilled ? (
                              <span className="px-2.5 py-1 rounded-xl bg-[#E6F8F1] text-[#1F6B54] text-[10px] font-extrabold inline-flex items-center gap-0.5 shrink-0">
                                <Check className="w-3 h-3" /> 已備齊
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={stock <= 0 || claimed}
                                onClick={() => onDeliverOrderItem(order.id, req.key)}
                                className="min-h-[38px] px-3 rounded-xl bg-[#FF7A9E] text-white text-[11px] font-extrabold disabled:opacity-40 active:scale-95 shrink-0"
                              >
                                交付 1 份
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Reward strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F4E6DF]">
                      <div className="flex flex-wrap gap-1 text-[10px] font-extrabold text-[#6E544E]">
                        <span className="px-2 py-0.5 rounded-lg bg-[#FFF6DC] border border-[#F2CE6D] text-[#8A5610]">
                          🪙 {order.overdue ? Math.round(order.reward.coins * 0.65) : order.reward.coins}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-[#EEF4FF] border border-[#BFD4FA] text-[#355A9C]">
                          🧩 {order.overdue ? Math.max(1, Math.floor(order.reward.furnitureShards * 0.5)) : order.reward.furnitureShards} 碎片
                        </span>
                        {!order.overdue && order.reward.farmSpeedTickets > 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#E6F8F1] border border-[#9ADBC2] text-[#1F6B54]">
                            ⚡ {order.reward.farmSpeedTickets} 加速券
                          </span>
                        )}
                        {!order.overdue &&
                          INGREDIENT_IDS.map((ingId) => {
                            const qty = order.reward.rareIngredients[ingId] ?? 0;
                            if (!qty) return null;
                            return (
                              <span
                                key={ingId}
                                className="px-2 py-0.5 rounded-lg bg-[#FFF0F6] border border-[#F4B4CB] text-[#B83B64]"
                              >
                                {INGREDIENTS[ingId].emoji} {INGREDIENTS[ingId].name}×{qty}
                              </span>
                            );
                          })}
                      </div>

                      {claimed ? (
                        <span className="text-[11px] font-extrabold text-[#1F6B54]">
                          ✓ 已領取獎勵
                        </span>
                      ) : order.completed ? (
                        <button
                          type="button"
                          onClick={() => onClaimOrderReward(order.id)}
                          className="min-h-[40px] px-3.5 rounded-xl bg-[#5CC9A7] text-white text-xs font-extrabold inline-flex items-center gap-1 active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>領取獎勵</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {activeTab === 'coop_visitor' && (
            <div className="space-y-3">
              {!hasSharedRoom || !coopVisitor ? (
                <div className="rounded-3xl bg-[#FFF6EB] border-2 border-[#F2D5B8] p-4 text-center space-y-2">
                  <p className="text-sm font-extrabold text-[#4A3531]">💞 共養共同訪客</p>
                  <p className="text-xs font-bold text-[#7D635D] leading-relaxed">
                    建立或加入「共養小屋」後，每天會出現 1 位專屬共同訪客！兩人攜手準備點心，完成後兩人都能獲得相同獎勵，連續 3 天解鎖「小鎮招待員」徽章、連續 7 天解鎖「最佳招待搭檔」稱號！
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl bg-gradient-to-br from-[#FFF0F6] to-[#FFFDF9] border-2 border-[#F4B4CB] p-3.5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white border border-[#F4D0DE] p-1.5 shrink-0">
                      <VisitorSprite
                        visitorId={coopVisitor.visitorId}
                        behavior="sitting"
                        reaction={coopVisitor.completed ? 'favorite' : null}
                        size={66}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-[#4A3531]">
                          {coopVisitor.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-lg bg-[#FFF3D8] border border-[#F2CE6D] text-[10px] font-extrabold text-[#8A5610] shrink-0">
                          連續 {visitorStreak} 天
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#6E544E] mt-0.5">
                        {coopVisitor.description}
                      </p>
                      <p className="text-[11px] font-extrabold text-[#B83B64] mt-1 tabular-nums">
                        已提供{' '}
                        {coopVisitor.requirements.reduce((s, r) => s + r.contributedQty, 0)} /{' '}
                        {coopVisitor.requirements.reduce((s, r) => s + r.requiredQty, 0)} 項食材
                      </p>
                    </div>
                  </div>

                  {/* Streak milestones */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-extrabold">
                    <div
                      className={`rounded-xl border px-2.5 py-1.5 flex items-center gap-1 ${
                        visitorStreak >= 3
                          ? 'bg-[#E6F8F1] border-[#9ADBC2] text-[#1F6B54]'
                          : 'bg-white/80 border-[#EAD9D0] text-[#7D635D]'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span>連 3 天：小鎮招待員徽章</span>
                    </div>
                    <div
                      className={`rounded-xl border px-2.5 py-1.5 flex items-center gap-1 ${
                        visitorStreak >= 7
                          ? 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]'
                          : 'bg-white/80 border-[#EAD9D0] text-[#7D635D]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>連 7 天：最佳招待搭檔稱號</span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-1.5">
                    {coopVisitor.requirements.map((req) => {
                      const stock = getPlayerStockForRequirement(game, req);
                      const done = req.contributedQty >= req.requiredQty;
                      return (
                        <div
                          key={req.key}
                          className="rounded-2xl bg-white border border-[#F0D7E2] px-3 py-2 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-[#4A3531]">
                              {req.emoji} {req.label}{' '}
                              <span className="text-[#B83B64] tabular-nums">
                                ({req.contributedQty}/{req.requiredQty})
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-[#8E756E] tabular-nums">
                              你的庫存：{stock}（離線時也能先貢獻自己的份！）
                            </div>
                          </div>
                          {done ? (
                            <span className="px-2.5 py-1 rounded-xl bg-[#E6F8F1] text-[#1F6B54] text-[10px] font-extrabold shrink-0">
                              ✓ 已齊全
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={stock <= 0}
                              onClick={() => onContributeCoopVisitor(req.key)}
                              className="min-h-[40px] px-3 rounded-xl bg-[#FF7A9E] text-white text-[11px] font-extrabold disabled:opacity-40 active:scale-95 shrink-0"
                            >
                              提供 1 份
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Partner contributions */}
                  {coopVisitor.contributions.length > 0 && (
                    <div className="rounded-2xl bg-white/80 border border-[#F0D7E2] p-2.5 space-y-1">
                      <p className="text-[10px] font-extrabold text-[#6E544E]">🤝 最近貢獻紀錄</p>
                      {coopVisitor.contributions.slice(0, 4).map((c) => (
                        <p key={c.id} className="text-[11px] font-bold text-[#4A3531]">
                          • <span className="text-[#B83B64]">{c.userName}</span> 提供了 {c.itemLabel} ×{c.qty}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Equal reward & photo */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F2DAE4]">
                    <p className="text-[10px] font-extrabold text-[#6E544E]">
                      雙方相同獎勵：🪙{coopVisitor.rewardCoins} · 🧩{coopVisitor.rewardShards} · ⚡{coopVisitor.rewardTickets}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {coopVisitor.completed && (
                        <button
                          type="button"
                          onClick={() => onCaptureVisitorPhoto(coopVisitor.visitorId, true)}
                          className="min-h-[38px] px-3 rounded-xl bg-[#FFF3D8] border border-[#F2CE6D] text-[#8A5610] text-[11px] font-extrabold active:scale-95"
                        >
                          📸 合照＆分享留言板
                        </button>
                      )}
                      {coopVisitor.completed &&
                        !coopVisitor.claimedByUserIds.includes(currentUserId) && (
                          <button
                            type="button"
                            onClick={onClaimCoopVisitorReward}
                            className="min-h-[38px] px-3 rounded-xl bg-[#5CC9A7] text-white text-[11px] font-extrabold active:scale-95"
                          >
                            領取相同獎勵
                          </button>
                        )}
                      {coopVisitor.completed &&
                        coopVisitor.claimedByUserIds.includes(currentUserId) && (
                          <span className="text-[11px] font-extrabold text-[#1F6B54]">
                            ✓ 已領取
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shards' && (
            <div className="space-y-3">
              {/* Shard crafting workshop */}
              <div className="rounded-3xl bg-white border-2 border-[#EFE0D7] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#4A3531]">
                    🧩 家具碎片限定工坊
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-xl bg-[#EEF4FF] border border-[#BFD4FA] text-[11px] font-extrabold text-[#355A9C] tabular-nums">
                    目前擁有 {game.furnitureShards} 碎片
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#7D635D]">
                  透過招待訪客、共同訪客與小鎮訂單收集碎片，即可合成金幣買不到的限定家具！
                </p>

                <div className="space-y-2">
                  {shardFurniture.map((item) => {
                    const cost = item.shardCost ?? 8;
                    const ownedCount = game.house.ownedFurnitureCounts[item.id] ?? 0;
                    const canCraft = game.furnitureShards >= cost;
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-[#FFFDF8] border border-[#EAD9D0] p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-[#4A3531]">
                            {item.emoji} {item.name}{' '}
                            {ownedCount > 0 && (
                              <span className="text-[10px] text-[#1F6B54]">（已擁有 {ownedCount}）</span>
                            )}
                          </div>
                          <p className="text-[10px] font-medium text-[#7D635D] leading-snug mt-0.5">
                            {item.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={!canCraft}
                          onClick={() => onCraftShardFurniture(item.id)}
                          className="min-h-[42px] px-3 rounded-xl bg-[#5CC9A7] text-white text-[11px] font-extrabold disabled:opacity-45 active:scale-95 shrink-0 tabular-nums"
                        >
                          🧩 {cost} 合成
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visitor Treat Shop */}
              <div className="rounded-3xl bg-white border-2 border-[#EFE0D7] p-3.5 space-y-2">
                <h3 className="text-xs font-extrabold text-[#4A3531]">
                  🧺 小鎮點心鋪（招待訪客與訂單專用）
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {VISITOR_TREATS.map((treat) => {
                    const qty = game.visitorTreats?.[treat.id] ?? 0;
                    return (
                      <div
                        key={treat.id}
                        className="rounded-2xl bg-[#FAF5F0] border border-[#EAD9D0] px-3 py-2 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-[#4A3531]">
                            {treat.emoji} {treat.name}{' '}
                            <span className="text-[10px] text-[#8E756E] tabular-nums">
                              （持有 {qty}）
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-[#7D635D]">
                            {treat.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={game.coins < treat.price}
                          onClick={() => onBuyTreat(treat.id)}
                          className="min-h-[40px] px-3 rounded-xl bg-[#FFF3D8] border border-[#F2CE6D] text-[#8A5610] text-[11px] font-extrabold disabled:opacity-45 active:scale-95 shrink-0 tabular-nums"
                        >
                          🪙 {treat.price}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
