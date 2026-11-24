import React, { useMemo, useState } from 'react';
import { Award, Bell, Flame, Gift, Home, Sprout, X } from 'lucide-react';
import { COOP_BADGES } from '../../data/coop';
import { INGREDIENTS } from '../../data/kitchen';
import { VISITOR_BY_ID } from '../../data/visitors';
import {
  CoopGameType,
  GameState,
  IngredientId,
  KitchenRecipe,
  SharedPetRoom,
  ThemeSetId,
  VisitorId,
} from '../../types';
import { getOfflinePartnerEvents } from '../../utils/coop';
import { getPlayerStockForRequirement } from '../../utils/townOrders';
import { VisitorSprite } from '../visitors/VisitorIllustrations';
import { CoopFarmRelayGame } from './CoopFarmRelayGame';
import { CoopRoomDecorGame } from './CoopRoomDecorGame';

interface CoopHubModalProps {
  open: boolean;
  onClose: () => void;
  game: GameState;
  sharedRoom: SharedPetRoom | null;
  currentUserId: string;
  actorName: string;
  onStartRoomSession: (themeId?: ThemeSetId) => void;
  onSelectFurniture: (itemId: string) => { ok: boolean; error?: string; notice?: string };
  onPlaceCandidate: (
    queueId: string,
    x: number,
    y: number
  ) => { ok: boolean; error?: string; notice?: string };
  onSettleRoomSession: () => { ok: boolean; error?: string; notice?: string };
  onPlantCoopCrop: (
    plotId: number,
    ingredientId: IngredientId
  ) => { ok: boolean; error?: string; notice?: string };
  onHarvestCoopCrop: (plotId: number) => { ok: boolean; error?: string; notice?: string };
  onDepositIngredient: (
    ingredientId: IngredientId
  ) => { ok: boolean; error?: string; notice?: string };
  onCookCoopRecipe: (
    recipe: KitchenRecipe
  ) => { ok: boolean; error?: string; notice?: string };
  onClaimReward: (rewardId: string) => { ok: boolean; error?: string; notice?: string };
  onAcknowledgeOfflineEvents: () => void;
  onShareCardToBoard?: (title: string, body: string) => Promise<string | null>;
  onContributeCoopVisitor?: (itemKey: string) => { ok: boolean; error?: string; notice?: string };
  onClaimCoopVisitorReward?: () => { ok: boolean; error?: string; notice?: string };
  onCaptureCoopVisitorPhoto?: (visitorId: VisitorId, shareToBoard: boolean) => void;
}

export const CoopHubModal: React.FC<CoopHubModalProps> = ({
  open,
  onClose,
  game,
  sharedRoom,
  currentUserId,
  actorName,
  onStartRoomSession,
  onSelectFurniture,
  onPlaceCandidate,
  onSettleRoomSession,
  onPlantCoopCrop,
  onHarvestCoopCrop,
  onDepositIngredient,
  onCookCoopRecipe,
  onClaimReward,
  onAcknowledgeOfflineEvents,
  onShareCardToBoard,
  onContributeCoopVisitor,
  onClaimCoopVisitorReward,
  onCaptureCoopVisitorPhoto,
}) => {
  const [gameTab, setGameTab] = useState<CoopGameType>('room_decor');
  const [rewardToast, setRewardToast] = useState<string>('');

  const unclaimedRewards = useMemo(
    () =>
      game.coop.pendingRewards.filter(
        (r) => !r.claimedByUserIds.includes(currentUserId)
      ),
    [game.coop.pendingRewards, currentUserId]
  );

  const offlineEvents = useMemo(
    () => getOfflinePartnerEvents(game.coop, currentUserId),
    [game.coop, currentUserId]
  );

  if (!open) return null;

  const partnerTitleUnlocked =
    game.encyclopedia.unlockedTitles.includes('coop_partner');
  const bestPartnerUnlocked = game.coop.unlockedBadges.includes('best_partner');

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2621]/55 backdrop-blur-xs flex items-center justify-center p-2 overflow-x-hidden overscroll-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coop-hub-title"
    >
      <div className="w-full max-w-[420px] max-h-[94dvh] rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD7] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-4 py-3 bg-gradient-to-r from-[#FFEAF0] via-[#FFF6DA] to-[#E8F8F2] border-b border-[#F2DFD5] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <h2 id="coop-hub-title" className="text-base font-extrabold text-[#4A3531] truncate">
              🤝 共養合作小遊戲
            </h2>
            <p className="text-[11px] font-bold text-[#7D635D] truncate tabular-nums">
              {sharedRoom ? `小屋同步中 · 家具碎片 ${game.furnitureShards}` : '單人／共養體驗中'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉合作遊戲"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/85 text-[#5A3E36] flex items-center justify-center hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3">
          {/* Streak & Milestones Banner (3-day Best Partner badge / 7-day Tacit Partner title) */}
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F3DCAB] p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#9D5B12]">
                <Flame className="w-4 h-4 text-[#FF7A9E]" />
                <span>連續合作天數：{game.coop.streakDays} 天</span>
              </div>
              <span className="text-[10px] font-bold text-[#7D635D]">
                所有獎勵兩人相同・絕不依貢獻區分
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div
                className={`rounded-2xl border px-2.5 py-1.5 text-[11px] ${
                  bestPartnerUnlocked
                    ? 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]'
                    : 'bg-[#FAF5F0] border-[#E7DAD2] text-[#8B756F]'
                }`}
              >
                <div className="font-extrabold">
                  {bestPartnerUnlocked ? '🤝 已解鎖' : '🔒 連續 3 天'} · 最佳搭檔徽章
                </div>
                <div className="text-[10px] tabular-nums">
                  進度 {Math.min(3, game.coop.streakDays)} / 3 天
                </div>
              </div>

              <div
                className={`rounded-2xl border px-2.5 py-1.5 text-[11px] ${
                  partnerTitleUnlocked
                    ? 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]'
                    : 'bg-[#FAF5F0] border-[#E7DAD2] text-[#8B756F]'
                }`}
              >
                <div className="font-extrabold">
                  {partnerTitleUnlocked ? '💞 已解鎖' : '🔒 連續 7 天'} · 默契搭檔稱號
                </div>
                <div className="text-[10px] tabular-nums">
                  進度 {Math.min(7, game.coop.streakDays)} / 7 天
                </div>
              </div>
            </div>

            {game.coop.unlockedBadges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {game.coop.unlockedBadges.map((bId) => {
                  const def = COOP_BADGES[bId];
                  if (!def) return null;
                  return (
                    <span
                      key={bId}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${def.badgeClass}`}
                    >
                      <Award className="w-3 h-3" />
                      <span>
                        {def.emoji} {def.name}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </section>

          {/* Offline Partner Summary Banner */}
          {offlineEvents.length > 0 && (
            <section className="rounded-3xl bg-[#EEF4FF] border-2 border-[#BCD2FA] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#355A9C]">
                  <Bell className="w-4 h-4" />
                  <span>你不在線時，夥伴剛完成了 {offlineEvents.length} 項協力！</span>
                </div>
                <button
                  type="button"
                  onClick={onAcknowledgeOfflineEvents}
                  className="min-h-[30px] px-2.5 rounded-xl bg-white border border-[#BCD2FA] text-[10px] font-extrabold text-[#355A9C]"
                >
                  我知道了
                </button>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {offlineEvents.slice(0, 4).map((ev) => (
                  <p key={ev.id} className="text-[11px] font-bold text-[#384C75]">
                    • {ev.actorName} {ev.summary}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Claimable Equal Rewards */}
          {rewardToast && (
            <div className="rounded-2xl bg-[#E5F8F0] border border-[#AEE3D0] px-3 py-2 text-xs font-extrabold text-[#1F6B54]">
              🎁 {rewardToast}
            </div>
          )}

          {unclaimedRewards.length > 0 && (
            <section className="rounded-3xl bg-[#FFF6DF] border-2 border-[#F2CE6D] p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#8A5610]">
                <Gift className="w-4 h-4" />
                <span>可領取合作獎勵（雙方各得相同份額）</span>
              </div>
              <div className="space-y-2">
                {unclaimedRewards.map((rw) => {
                  const rareList = Object.entries(rw.rareIngredients)
                    .filter(([, qty]) => (qty ?? 0) > 0)
                    .map(
                      ([id, qty]) =>
                        `${INGREDIENTS[id as IngredientId]?.name ?? id}×${qty}`
                    );
                  return (
                    <div
                      key={rw.id}
                      className="rounded-2xl bg-white border border-[#F2D59B] p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#4A3531] truncate">
                          {rw.title}
                        </div>
                        <div className="text-[10px] font-bold text-[#9D5B12] tabular-nums">
                          +{rw.coins} 金幣 · +{rw.furnitureShards} 碎片 · +{rw.intimacy} 親密度
                          {rareList.length > 0 ? ` · ${rareList.join('、')}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const res = onClaimReward(rw.id);
                          if (res.notice) setRewardToast(res.notice);
                        }}
                        className="min-h-[40px] px-3 rounded-xl bg-[#FF7A9E] text-white text-xs font-extrabold shrink-0 active:scale-95 transition"
                      >
                        領取獎勵
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Three Co-op Games Switcher */}
          <nav className="grid grid-cols-3 gap-1 bg-[#F2E5DE] p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setGameTab('room_decor')}
              className={`min-h-[44px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition ${
                gameTab === 'room_decor'
                  ? 'bg-white text-[#D64470] shadow-xs'
                  : 'text-[#6E544E]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>佈置房間</span>
            </button>
            <button
              type="button"
              onClick={() => setGameTab('farm_relay')}
              className={`min-h-[44px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition ${
                gameTab === 'farm_relay'
                  ? 'bg-white text-[#1F6B54] shadow-xs'
                  : 'text-[#6E544E]'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>農場接力</span>
            </button>
            <button
              type="button"
              onClick={() => setGameTab('visitor_coop')}
              className={`min-h-[44px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition ${
                gameTab === 'visitor_coop'
                  ? 'bg-white text-[#B83B64] shadow-xs'
                  : 'text-[#6E544E]'
              }`}
            >
              <span>🐾</span>
              <span>共同訪客</span>
            </button>
          </nav>

          {gameTab === 'room_decor' ? (
            <CoopRoomDecorGame
              game={game}
              actorUserId={currentUserId}
              actorName={actorName}
              onStartSession={onStartRoomSession}
              onSelectFurniture={onSelectFurniture}
              onPlaceCandidate={onPlaceCandidate}
              onSettleSession={onSettleRoomSession}
            />
          ) : gameTab === 'farm_relay' ? (
            <CoopFarmRelayGame
              game={game}
              onPlantCrop={onPlantCoopCrop}
              onHarvestCrop={onHarvestCoopCrop}
              onDepositIngredient={onDepositIngredient}
              onCookRecipe={onCookCoopRecipe}
              onShareCardToBoard={onShareCardToBoard}
            />
          ) : (
            <section className="rounded-3xl bg-gradient-to-br from-[#FFF0F6] to-[#FFFDF9] border-2 border-[#F4B4CB] p-3.5 space-y-3">
              {!game.coop.coopVisitor ? (
                <div className="text-center py-4 space-y-1.5">
                  <p className="text-sm font-extrabold text-[#4A3531]">🐾 共養共同訪客</p>
                  <p className="text-xs font-bold text-[#7D635D]">
                    建立或加入共養小屋後，每日會自動迎來 1 位共同訪客，完成招待即可領取相同獎勵！
                  </p>
                </div>
              ) : (() => {
                const cv = game.coop.coopVisitor;
                const vDef = VISITOR_BY_ID[cv.visitorId];
                const done = cv.requirements.reduce((s, r) => s + r.contributedQty, 0);
                const total = cv.requirements.reduce((s, r) => s + r.requiredQty, 0);
                const vStreak = game.coop.visitorStreakDays ?? 0;
                const townHostUnlocked = game.coop.unlockedBadges.includes('town_host');
                const bestHostUnlocked = game.encyclopedia.unlockedTitles.includes('coop_best_host');

                return (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-white border border-[#F4D0DE] p-1.5 shrink-0">
                        <VisitorSprite
                          visitorId={cv.visitorId}
                          behavior="sitting"
                          reaction={cv.completed ? 'favorite' : null}
                          size={62}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-[#4A3531]">
                            {vDef.emoji} {cv.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-lg bg-[#FFF3D8] border border-[#F2CE6D] text-[10px] font-extrabold text-[#8A5610] shrink-0">
                            連續 {vStreak} 天
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#6E544E] mt-0.5">
                          {cv.description}
                        </p>
                        <p className="text-[11px] font-extrabold text-[#B83B64] mt-1 tabular-nums">
                          已提供 {done} / {total} 項食材（雙方相同獎勵）
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-extrabold">
                      <div
                        className={`rounded-xl border px-2 py-1.5 ${
                          townHostUnlocked
                            ? 'bg-[#E6F8F1] border-[#9ADBC2] text-[#1F6B54]'
                            : 'bg-white/80 border-[#EAD9D0] text-[#7D635D]'
                        }`}
                      >
                        {townHostUnlocked ? '🏡 已解鎖' : `🔒 ${Math.min(3, vStreak)}/3 天`} · 小鎮招待員徽章
                      </div>
                      <div
                        className={`rounded-xl border px-2 py-1.5 ${
                          bestHostUnlocked
                            ? 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]'
                            : 'bg-white/80 border-[#EAD9D0] text-[#7D635D]'
                        }`}
                      >
                        {bestHostUnlocked ? '🌟 已解鎖' : `🔒 ${Math.min(7, vStreak)}/7 天`} · 最佳招待搭檔稱號
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {cv.requirements.map((req) => {
                        const stock = getPlayerStockForRequirement(game, req);
                        const fulfilled = req.contributedQty >= req.requiredQty;
                        return (
                          <div
                            key={req.key}
                            className="rounded-2xl bg-white border border-[#F0D7E2] px-3 py-2 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-extrabold text-[#4A3531]">
                                {req.emoji} {req.label} ({req.contributedQty}/{req.requiredQty})
                              </div>
                              <div className="text-[10px] font-bold text-[#8E756E] tabular-nums">
                                持有：{stock} · 夥伴離線時也能先提供自己的份！
                              </div>
                            </div>
                            {fulfilled ? (
                              <span className="px-2.5 py-1 rounded-xl bg-[#E6F8F1] text-[#1F6B54] text-[10px] font-extrabold shrink-0">
                                ✓ 已齊全
                              </span>
                            ) : (
                              onContributeCoopVisitor && (
                                <button
                                  type="button"
                                  disabled={stock <= 0}
                                  onClick={() => {
                                    const res = onContributeCoopVisitor(req.key);
                                    if (res.notice) setRewardToast(res.notice);
                                    else if (res.error) setRewardToast(res.error);
                                  }}
                                  className="min-h-[38px] px-3 rounded-xl bg-[#FF7A9E] text-white text-[11px] font-extrabold disabled:opacity-40 active:scale-95 shrink-0"
                                >
                                  提供 1 份
                                </button>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {cv.contributions.length > 0 && (
                      <div className="rounded-2xl bg-white/80 border border-[#F0D7E2] p-2.5 space-y-1">
                        {cv.contributions.slice(0, 3).map((c) => (
                          <p key={c.id} className="text-[11px] font-bold text-[#4A3531]">
                            • <span className="text-[#B83B64]">{c.userName}</span> 提供了 {c.itemLabel} ×{c.qty}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[10px] font-extrabold text-[#6E544E]">
                        相同獎勵：🪙{cv.rewardCoins} · 🧩{cv.rewardShards} · ⚡{cv.rewardTickets}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {cv.completed && onCaptureCoopVisitorPhoto && (
                          <button
                            type="button"
                            onClick={() => onCaptureCoopVisitorPhoto(cv.visitorId, true)}
                            className="min-h-[38px] px-3 rounded-xl bg-[#FFF3D8] border border-[#F2CE6D] text-[#8A5610] text-[11px] font-extrabold active:scale-95"
                          >
                            📸 合照＆分享留言板
                          </button>
                        )}
                        {cv.completed &&
                          !cv.claimedByUserIds.includes(currentUserId) &&
                          onClaimCoopVisitorReward && (
                            <button
                              type="button"
                              onClick={() => {
                                const res = onClaimCoopVisitorReward();
                                if (res.notice) setRewardToast(res.notice);
                              }}
                              className="min-h-[38px] px-3 rounded-xl bg-[#5CC9A7] text-white text-[11px] font-extrabold active:scale-95"
                            >
                              領取獎勵
                            </button>
                          )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
