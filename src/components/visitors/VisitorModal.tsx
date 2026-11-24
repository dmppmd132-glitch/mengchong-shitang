import React, { useMemo, useState } from 'react';
import { Camera, Check, Heart, Share2, Sparkles, X } from 'lucide-react';
import {
  VISITOR_AFFINITY_THRESHOLDS,
  VISITOR_BEHAVIOR_META,
  VISITOR_BY_ID,
  VISITOR_TREAT_BY_ID,
  VISITOR_TREATS,
  VISITORS,
} from '../../data/visitors';
import {
  GameState,
  VisitorId,
  VisitorOffering,
  VisitorTreatId,
} from '../../types';
import {
  getAvailableVisitorOfferings,
  getNextAffinityThreshold,
  isYardMoodBuffActive,
} from '../../utils/visitors';
import { VisitorSprite } from './VisitorIllustrations';

interface VisitorModalProps {
  open: boolean;
  game: GameState;
  hasSharedRoom: boolean;
  onClose: () => void;
  onFeedVisitor: (offering: VisitorOffering) => void;
  onBuyTreat: (treatId: VisitorTreatId) => void;
  onCapturePhoto: (visitorId: VisitorId, shareToBoard?: boolean) => void;
  onOpenOrderBoard: () => void;
}

export const VisitorModal: React.FC<VisitorModalProps> = ({
  open,
  game,
  hasSharedRoom,
  onClose,
  onFeedVisitor,
  onBuyTreat,
  onCapturePhoto,
  onOpenOrderBoard,
}) => {
  const visitorState = game.visitorState;
  const activeVisit = visitorState?.activeVisit ?? null;
  const [selectedTab, setSelectedTab] = useState<'active' | 'codex'>('active');
  const [offeringFilter, setOfferingFilter] = useState<'all' | 'ingredient' | 'treat_food'>('all');
  const [justFedSparkle, setJustFedSparkle] = useState(false);

  const activeVisitorDef = activeVisit ? VISITOR_BY_ID[activeVisit.visitorId] : null;
  const activeAffinity = activeVisit
    ? visitorState?.affinities[activeVisit.visitorId]
    : null;

  const offerings = useMemo(() => {
    if (!activeVisit) return [];
    const list = getAvailableVisitorOfferings(game, activeVisit.visitorId);
    if (offeringFilter === 'ingredient') {
      return list.filter((item) => item.offering.kind === 'ingredient');
    }
    if (offeringFilter === 'treat_food') {
      return list.filter(
        (item) => item.offering.kind === 'treat' || item.offering.kind === 'food'
      );
    }
    return list;
  }, [activeVisit, game, offeringFilter]);

  if (!open) return null;

  const now = Date.now();
  const picnicBuffActive = isYardMoodBuffActive(game, now);
  const effectiveTab = activeVisit ? selectedTab : 'codex';

  const formatRemaining = (departAt: number) => {
    const mins = Math.max(1, Math.ceil((departAt - now) / 60000));
    return `約 ${mins} 分鐘後離開`;
  };

  const handleFeed = (offering: VisitorOffering) => {
    onFeedVisitor(offering);
    setJustFedSparkle(true);
    window.setTimeout(() => setJustFedSparkle(false), 1200);
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
        <div className="px-4 pt-3 pb-2.5 bg-gradient-to-r from-[#E6F8F1] via-[#FFF6E5] to-[#FFEAF2] border-b border-[#F2E0D6] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-[#4A3531] flex items-center gap-1.5">
              <span>🐾</span>
              <span>庭院訪客與友誼手帳</span>
            </h2>
            <p className="text-[11px] font-bold text-[#7D635D]">
              今日已拜訪 {visitorState?.dailyVisitCount ?? 0} / {visitorState?.maxDailyVisits ?? 3} 位
              {picnicBuffActive ? ' · 野餐好心情 +10% 出現率生效中' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉庭院訪客視窗"
            className="w-10 h-10 rounded-full bg-white/90 border border-[#EED8CE] flex items-center justify-center text-[#5A3E36] active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-nav */}
        <div className="px-4 pt-2.5 pb-1.5 flex items-center gap-2 shrink-0">
          {activeVisit && (
            <button
              type="button"
              onClick={() => setSelectedTab('active')}
              className={`flex-1 min-h-[40px] rounded-2xl text-xs font-extrabold border transition ${
                effectiveTab === 'active'
                  ? 'bg-[#FF7A9E] border-[#FF7A9E] text-white shadow-sm'
                  : 'bg-white border-[#EFE0D7] text-[#6E544E]'
              }`}
            >
              正在來訪：{activeVisitorDef?.speciesLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => setSelectedTab('codex')}
            className={`flex-1 min-h-[40px] rounded-2xl text-xs font-extrabold border transition ${
              effectiveTab === 'codex'
                ? 'bg-[#5CC9A7] border-[#5CC9A7] text-white shadow-sm'
                : 'bg-white border-[#EFE0D7] text-[#6E544E]'
            }`}
          >
            訪客圖鑑＆好感度 (3)
          </button>
          <button
            type="button"
            onClick={onOpenOrderBoard}
            className="min-h-[40px] px-3 rounded-2xl bg-[#FFF3D8] border border-[#F2CE6D] text-[#8A5610] text-xs font-extrabold active:scale-95 shrink-0"
          >
            📋 訂單板
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-1 space-y-3">
          {effectiveTab === 'active' && activeVisit && activeVisitorDef && activeAffinity ? (
            <>
              {/* Hero Visitor Card */}
              <div
                className={`rounded-3xl bg-gradient-to-br ${activeVisitorDef.bgGradient} border-2 border-[#EEDCD2] p-3.5 space-y-2.5`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative rounded-2xl bg-white/85 border border-[#EFE0D7] p-2 shrink-0">
                    <VisitorSprite
                      visitorId={activeVisit.visitorId}
                      behavior={activeVisit.behavior}
                      reaction={justFedSparkle ? 'favorite' : activeVisit.lastFeedReaction}
                      size={74}
                      showAffinityBadge={activeAffinity.level}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="text-sm font-extrabold text-[#4A3531] truncate">
                        {activeVisitorDef.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-lg bg-[#FFF3D8] border border-[#F2CE6D] text-[#8A5610] text-[10px] font-extrabold shrink-0">
                        Lv.{activeAffinity.level} 好感
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-[#6E544E] flex items-center gap-1">
                      <span>{VISITOR_BEHAVIOR_META[activeVisit.behavior].emoji}</span>
                      <span>{VISITOR_BEHAVIOR_META[activeVisit.behavior].label}</span>
                      <span>·</span>
                      <span className="text-[#957B74]">{formatRemaining(activeVisit.departAt)}</span>
                    </p>
                    {activeVisit.likesYard ? (
                      <p className="text-[11px] font-extrabold text-[#1F6B54] bg-[#E6F8F1] border border-[#9ADBC2] rounded-xl px-2 py-1">
                        🌿 這位訪客喜歡你的庭院（{activeVisit.yardMatchReasons.join('、')}）
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-[#8B6F68] bg-white/75 rounded-xl px-2 py-1">
                        💡 {activeVisitorDef.yardTip}
                      </p>
                    )}
                  </div>
                </div>

                {/* Speech & Reward Bubble */}
                {activeVisit.lastFeedLine && (
                  <div className="rounded-2xl bg-white/95 border border-[#EAD9D0] px-3 py-2 space-y-1">
                    <p className="text-xs font-bold text-[#4A3531] leading-relaxed">
                      💬 「{activeVisit.lastFeedLine}」
                    </p>
                    {activeVisit.lastRewardSummary && (
                      <p className="text-[11px] font-extrabold text-[#D64470] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>招待獲得：{activeVisit.lastRewardSummary}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Affinity Progress Bar */}
                {(() => {
                  const curBase = VISITOR_AFFINITY_THRESHOLDS[activeAffinity.level - 1] ?? 0;
                  const nextCap = getNextAffinityThreshold(activeAffinity.level);
                  const pct =
                    nextCap === null
                      ? 100
                      : Math.min(
                          100,
                          Math.max(
                            6,
                            Math.round(((activeAffinity.exp - curBase) / (nextCap - curBase)) * 100)
                          )
                        );
                  return (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-extrabold text-[#6E544E]">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-[#FF5C8D] fill-[#FF5C8D]" />
                          好感度 Lv.{activeAffinity.level} / 5
                        </span>
                        <span className="tabular-nums">
                          {nextCap === null ? '已滿級 MAX' : `${activeAffinity.exp} / ${nextCap}`}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/80 border border-[#EED9D0] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF8EB0] to-[#FF5C8D] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Preferences & Photo Capture */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold">
                  <span className="px-2 py-0.5 rounded-lg bg-[#E6F8F1] text-[#1F6B54] border border-[#9ADBC2]">
                    喜歡：{activeVisitorDef.preference.favoriteTagsLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#FFF0EC] text-[#B84C35] border border-[#F4C4B8]">
                    不喜歡：{activeVisitorDef.preference.dislikedTagsLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onCapturePhoto(activeVisit.visitorId, false)}
                    className="flex-1 min-h-[44px] rounded-2xl bg-[#FFF3D8] border border-[#F2CE6D] text-[#8A5610] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{activeVisit.photoTaken ? '再拍一張合照' : '拍照存入回憶冊'}</span>
                  </button>
                  {hasSharedRoom && (
                    <button
                      type="button"
                      onClick={() => onCapturePhoto(activeVisit.visitorId, true)}
                      className="min-h-[44px] px-3.5 rounded-2xl bg-[#FFEAF2] border border-[#F4B4CB] text-[#B83B64] text-xs font-extrabold inline-flex items-center justify-center gap-1 active:scale-95 transition shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>拍＆分享留言板</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Feeding Section */}
              <div className="rounded-3xl bg-white border-2 border-[#EFE0D7] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#4A3531]">
                      選擇食材或點心招待（本次 {activeVisit.fedCount}/{activeVisit.maxFeedCount} 次）
                    </h4>
                    <p className="text-[10px] font-bold text-[#8E756E]">
                      餵喜歡的食物可獲得較多好感與禮物；不喜歡的食物也不會扣分喔！
                    </p>
                  </div>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'all', label: '全部可送' },
                    { id: 'ingredient', label: '農場食材' },
                    { id: 'treat_food', label: '點心＆料理' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setOfferingFilter(tab.id as 'all' | 'ingredient' | 'treat_food')
                      }
                      className={`px-2.5 min-h-[34px] rounded-xl text-[11px] font-extrabold border transition ${
                        offeringFilter === tab.id
                          ? 'bg-[#5A3E36] border-[#5A3E36] text-white'
                          : 'bg-[#FAF5F0] border-[#EAD9D0] text-[#6E544E]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeVisit.fedCount >= activeVisit.maxFeedCount ? (
                  <div className="rounded-2xl bg-[#FFF6EB] border border-[#F2D5B8] p-3 text-center text-xs font-bold text-[#8A5610]">
                    ✨ {activeVisitorDef.name}這次已經吃得很滿足了！拍張照留念或期待下次來訪吧～
                  </div>
                ) : offerings.length === 0 ? (
                  <div className="rounded-2xl bg-[#FAF4EE] border border-[#EAD9D0] p-3 text-center text-xs font-bold text-[#7D635D]">
                    倉庫裡目前沒有符合分類的點心，可在下方小鎮點心鋪快速購入！
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {offerings.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleFeed(item.offering)}
                        className={`min-h-[54px] rounded-2xl border p-2 text-left flex items-center gap-2 transition active:scale-95 ${
                          item.reaction === 'favorite'
                            ? 'bg-[#E9FAF2] border-[#98DEC0] hover:bg-[#DDF6EB]'
                            : item.reaction === 'disliked'
                            ? 'bg-[#FFF5F2] border-[#F4CBC0] hover:bg-[#FCECE7]'
                            : 'bg-[#FFFDF8] border-[#EAD9D0] hover:bg-[#FFF6EB]'
                        }`}
                      >
                        <span className="text-xl shrink-0">{item.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-extrabold text-[#4A3531] truncate">
                            {item.name}
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span
                              className={
                                item.reaction === 'favorite'
                                  ? 'text-[#1F6B54]'
                                  : item.reaction === 'disliked'
                                  ? 'text-[#B84C35]'
                                  : 'text-[#8E756E]'
                              }
                            >
                              {item.reaction === 'favorite'
                                ? '♥ 最愛'
                                : item.reaction === 'disliked'
                                ? '不太習慣'
                                : '一般'}
                            </span>
                            <span className="text-[#6E544E] tabular-nums">×{item.count}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Treat Shop */}
                <div className="pt-2 border-t border-[#F4E6DF] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-[#5A3E36]">
                    <span>🧺 快速補充訪客小點心（目前金幣：{game.coins}）</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {VISITOR_TREATS.map((treat) => {
                      const owned = game.visitorTreats?.[treat.id] ?? 0;
                      return (
                        <button
                          key={treat.id}
                          type="button"
                          onClick={() => onBuyTreat(treat.id)}
                          disabled={game.coins < treat.price}
                          className="min-h-[44px] rounded-xl bg-[#FAF4EE] border border-[#EAD9D0] px-2.5 py-1.5 flex items-center justify-between gap-1 text-left disabled:opacity-50 active:scale-95"
                        >
                          <div className="min-w-0">
                            <div className="text-[11px] font-extrabold text-[#4A3531] truncate">
                              {treat.emoji} {treat.name}
                            </div>
                            <div className="text-[10px] font-bold text-[#8E756E] tabular-nums">
                              持有 {owned} · 🪙 {treat.price}
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded-lg bg-white border border-[#E5D2C7] text-[10px] font-extrabold text-[#8A5610] shrink-0">
                            +1
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Visitor Affinity Codex */
            <div className="space-y-3">
              {!activeVisit && (
                <div className="rounded-2xl bg-[#FFF6EB] border border-[#F2D5B8] p-3 text-xs font-bold text-[#8A5610] leading-relaxed">
                  🌿 目前庭院安靜悠閒，小動物訪客每 2～4 小時會隨機前來（每天最多 3 位）。擺放喜歡的庭院裝飾可提高出現機率喔！
                </div>
              )}

              {VISITORS.map((visitor) => {
                const aff = visitorState?.affinities[visitor.id];
                const level = aff?.level ?? 1;
                const exp = aff?.exp ?? 0;
                const nextCap = getNextAffinityThreshold(level);
                return (
                  <div
                    key={visitor.id}
                    className={`rounded-3xl bg-gradient-to-br ${visitor.bgGradient} border-2 border-[#EFE0D7] p-3.5 space-y-2.5`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-white/85 border border-[#EFE0D7] p-1.5 shrink-0">
                        <VisitorSprite
                          visitorId={visitor.id}
                          behavior="sitting"
                          size={58}
                          showAffinityBadge={level}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-[#4A3531]">
                            {visitor.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-lg bg-white border border-[#EED9D0] text-[10px] font-extrabold text-[#B83B64]">
                            Lv.{level} / 5
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#6E544E] leading-snug">
                          {visitor.description}
                        </p>
                        <p className="text-[10px] font-extrabold text-[#1F6B54]">
                          {visitor.yardTip}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[10px] font-extrabold">
                      <span className="px-2 py-0.5 rounded-lg bg-white/85 border border-[#C6EBD9] text-[#1F6B54]">
                        喜歡：{visitor.preference.favoriteTagsLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-white/85 border border-[#F2CCC3] text-[#B84C35]">
                        不喜歡：{visitor.preference.dislikedTagsLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-white/85 border border-[#EAD9D0] text-[#6E544E] tabular-nums">
                        累積招待 {aff?.totalFed ?? 0} 次 · {nextCap ? `${exp}/${nextCap}` : 'MAX'}
                      </span>
                    </div>

                    {/* Level 2-5 milestone roadmap */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {visitor.levelRewards
                        .filter((r) => r.level >= 2)
                        .map((reward) => {
                          const unlocked = level >= reward.level;
                          return (
                            <div
                              key={reward.level}
                              className={`rounded-xl border px-2 py-1.5 text-[10px] leading-snug ${
                                unlocked
                                  ? 'bg-[#E8F8F0] border-[#9ADBC2] text-[#1F6B54]'
                                  : 'bg-white/70 border-[#EAD9D0] text-[#7D635D]'
                              }`}
                            >
                              <div className="font-extrabold flex items-center justify-between">
                                <span>Lv.{reward.level} {reward.title}</span>
                                {unlocked && <Check className="w-3 h-3 shrink-0" />}
                              </div>
                              <p className="mt-0.5 opacity-90">{reward.description}</p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}

              {/* Treat bag summary */}
              <div className="rounded-3xl bg-white border-2 border-[#EFE0D7] p-3.5 space-y-2">
                <h4 className="text-xs font-extrabold text-[#4A3531]">
                  🧺 小鎮訪客點心鋪（可用金幣備貨）
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {VISITOR_TREATS.map((treat) => (
                    <button
                      key={treat.id}
                      type="button"
                      onClick={() => onBuyTreat(treat.id)}
                      disabled={game.coins < treat.price}
                      className="min-h-[48px] rounded-2xl bg-[#FFFDF8] border border-[#EAD9D0] px-2.5 py-2 flex items-center justify-between gap-1 text-left disabled:opacity-50 active:scale-95"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-extrabold text-[#4A3531] truncate">
                          {treat.emoji} {treat.name}
                        </div>
                        <div className="text-[10px] font-bold text-[#8E756E] tabular-nums">
                          持有 {game.visitorTreats?.[treat.id] ?? 0} · 🪙 {treat.price}
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-xl bg-[#FFEAF2] text-[#B83B64] text-[10px] font-extrabold shrink-0">
                        買 1
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
