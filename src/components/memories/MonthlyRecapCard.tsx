import React, { useEffect, useMemo, useState } from 'react';
import {
  BookmarkCheck,
  CalendarHeart,
  Check,
  Image as ImageIcon,
  Send,
  Sparkles,
} from 'lucide-react';
import { GameState, MonthlyRecap, PetMessage, RoomPhotoRecord, SharedPetRoom } from '../../types';
import { buildMonthlyRecapDraft, getMonthKeyFromDate } from '../../utils/memories';
import { getActivePet } from '../../utils/pets';
import { ShareCardPayload } from '../../utils/shareCardCanvas';
import { RoomPhotoCard } from '../house/RoomPhotoCard';

interface MonthlyRecapCardProps {
  game: GameState;
  messages: PetMessage[];
  sharedRoom: SharedPetRoom | null;
  onSaveRecap: (recap: MonthlyRecap) => void;
  onOpenShareCard: (payload: ShareCardPayload) => void;
  onShareRecapToBoard?: (recap: MonthlyRecap) => Promise<string | null>;
}

export const MonthlyRecapCard: React.FC<MonthlyRecapCardProps> = ({
  game,
  messages,
  sharedRoom,
  onSaveRecap,
  onOpenShareCard,
  onShareRecapToBoard,
}) => {
  const currentMonthKey = getMonthKeyFromDate(new Date());
  const availableMonths = useMemo(() => {
    const keys = new Set<string>([currentMonthKey]);
    for (const r of game.memoryAlbum.monthlyRecaps) {
      keys.add(r.monthKey);
    }
    return Array.from(keys).sort((a, b) => b.localeCompare(a));
  }, [currentMonthKey, game.memoryAlbum.monthlyRecaps]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    game.memoryAlbum.monthlyRecaps[0]?.monthKey ?? currentMonthKey
  );
  const [selectedCoverId, setSelectedCoverId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>('');
  const [sharing, setSharing] = useState<boolean>(false);

  const savedRecap = useMemo(
    () =>
      game.memoryAlbum.monthlyRecaps.find((r) => r.monthKey === selectedMonth) ??
      null,
    [game.memoryAlbum.monthlyRecaps, selectedMonth]
  );

  const liveDraft = useMemo(
    () =>
      buildMonthlyRecapDraft(
        game,
        selectedMonth,
        messages,
        selectedCoverId ?? savedRecap?.coverPhotoId ?? null
      ),
    [game, selectedMonth, messages, selectedCoverId, savedRecap?.coverPhotoId]
  );

  const activeRecap: MonthlyRecap = useMemo(() => {
    if (!savedRecap) return liveDraft;
    return {
      ...savedRecap,
      favoriteFoodName: liveDraft.favoriteFoodName,
      topInteractionLabel: liveDraft.topInteractionLabel,
      favoriteAccessoryName: liveDraft.favoriteAccessoryName,
      weightDelta: liveDraft.weightDelta,
      growthGained: Math.max(savedRecap.growthGained, liveDraft.growthGained),
      coopMessagesCount: Math.max(
        savedRecap.coopMessagesCount,
        liveDraft.coopMessagesCount
      ),
      coopTasksCount: Math.max(savedRecap.coopTasksCount, liveDraft.coopTasksCount),
      coverPhotoId:
        selectedCoverId ?? savedRecap.coverPhotoId ?? liveDraft.coverPhotoId,
    };
  }, [savedRecap, liveDraft, selectedCoverId]);

  useEffect(() => {
    setSelectedCoverId(savedRecap?.coverPhotoId ?? null);
    setNotice('');
  }, [selectedMonth, savedRecap?.coverPhotoId]);

  const monthPhotos = useMemo(() => {
    const inMonth = game.house.photos.filter(
      (p) => getMonthKeyFromDate(new Date(p.createdAt)) === selectedMonth
    );
    return inMonth.length > 0 ? inMonth : game.house.photos;
  }, [game.house.photos, selectedMonth]);

  const coverPhoto: RoomPhotoRecord | null = useMemo(() => {
    if (!activeRecap.coverPhotoId) return monthPhotos[0] ?? null;
    return (
      game.house.photos.find((p) => p.id === activeRecap.coverPhotoId) ??
      monthPhotos[0] ??
      null
    );
  }, [activeRecap.coverPhotoId, game.house.photos, monthPhotos]);

  const weightDeltaLabel =
    activeRecap.weightDelta > 0
      ? `+${activeRecap.weightDelta.toFixed(1)} kg`
      : activeRecap.weightDelta < 0
      ? `${activeRecap.weightDelta.toFixed(1)} kg`
      : '0.0 kg';

  const handleSave = () => {
    onSaveRecap({
      ...activeRecap,
      coverPhotoId: coverPhoto?.id ?? activeRecap.coverPhotoId,
      savedToAlbum: true,
    });
    setNotice(`已將「${selectedMonth} 本月回顧卡」收藏至回憶冊！`);
    window.setTimeout(() => setNotice(''), 2600);
  };

  const handleShareBoard = async () => {
    if (!onShareRecapToBoard) return;
    setSharing(true);
    try {
      const err = await onShareRecapToBoard({
        ...activeRecap,
        coverPhotoId: coverPhoto?.id ?? activeRecap.coverPhotoId,
      });
      setNotice(
        err
          ? err
          : sharedRoom
          ? '已分享本月回顧卡給共養夥伴！'
          : '已分享本月回顧卡到留言板！'
      );
      window.setTimeout(() => setNotice(''), 2600);
    } finally {
      setSharing(false);
    }
  };

  const activePet = getActivePet(game);

  const handleOpenCard = () => {
    onOpenShareCard({
      petName: activePet.name,
      species: activePet.species,
      title: `${selectedMonth} 本月回顧卡`,
      subtitle: `最愛食物：${activeRecap.favoriteFoodName} · 最常互動：${activeRecap.topInteractionLabel} · 體重變化 ${weightDeltaLabel} · 成長 +${activeRecap.growthGained}`,
      dateLabel: selectedMonth,
      badgeText: '🗓️ 月度成長精選',
      emoji: '🗓️',
      weight: activePet.weight,
      level: activePet.level,
      photo: coverPhoto,
      accessoryId: activeRecap.favoriteAccessoryId ?? undefined,
    });
  };

  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#FFF4EC] via-[#FFFDF8] to-[#ECF9F3] border-2 border-[#F3D8CE] p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#FFEAF0] text-[#C43463] flex items-center justify-center shrink-0">
            <CalendarHeart className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-[#4A3531] truncate">
              本月回顧卡
            </h3>
            <p className="text-[11px] font-bold text-[#7D635D] truncate">
              每月自動整理最愛與成長紀錄，可自選封面並收藏分享
            </p>
          </div>
        </div>

        <select
          aria-label="選擇回顧月份"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="min-h-[38px] rounded-xl bg-white border border-[#EAD4CC] px-2.5 text-xs font-extrabold text-[#5A3E36] tabular-nums shrink-0 focus:outline-none focus:border-[#FF7A9E]"
        >
          {availableMonths.map((mk) => (
            <option key={mk} value={mk}>
              {mk}
            </option>
          ))}
        </select>
      </div>

      {/* 8 Monthly Highlight Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/90 border border-[#F1DFD6] px-3 py-2">
          <div className="text-[11px] font-bold text-[#8A716B]">🍽️ 本月最愛食物</div>
          <div className="text-xs font-extrabold text-[#4A3531] mt-0.5 truncate">
            {activeRecap.favoriteFoodName}
          </div>
        </div>

        <div className="rounded-2xl bg-white/90 border border-[#F1DFD6] px-3 py-2">
          <div className="text-[11px] font-bold text-[#8A716B]">💞 本月最常互動</div>
          <div className="text-xs font-extrabold text-[#4A3531] mt-0.5 truncate">
            {activeRecap.topInteractionLabel}
          </div>
        </div>

        <div className="rounded-2xl bg-white/90 border border-[#F1DFD6] px-3 py-2">
          <div className="text-[11px] font-bold text-[#8A716B]">🎀 本月最愛配件</div>
          <div className="text-xs font-extrabold text-[#4A3531] mt-0.5 truncate">
            {activeRecap.favoriteAccessoryName}
          </div>
        </div>

        <div className="rounded-2xl bg-white/90 border border-[#F1DFD6] px-3 py-2">
          <div className="text-[11px] font-bold text-[#8A716B]">⚖️ 本月體重變化</div>
          <div className="text-xs font-extrabold text-[#B83B64] mt-0.5 tabular-nums">
            {weightDeltaLabel}
          </div>
        </div>

        <div className="rounded-2xl bg-white/90 border border-[#F1DFD6] px-3 py-2">
          <div className="text-[11px] font-bold text-[#8A716B]">✨ 本月成長值增加</div>
          <div className="text-xs font-extrabold text-[#1F6B54] mt-0.5 tabular-nums">
            +{activeRecap.growthGained} 成長值
          </div>
        </div>

        <div className="rounded-2xl bg-white/90 border border-[#F1DFD6] px-3 py-2">
          <div className="text-[11px] font-bold text-[#8A716B]">
            💌 共養留言 / 合作任務
          </div>
          <div className="text-xs font-extrabold text-[#4A3531] mt-0.5 tabular-nums">
            {activeRecap.coopMessagesCount} 則留言 · {activeRecap.coopTasksCount} 次合作
          </div>
        </div>
      </div>

      {/* Best Photo / Cover Photo Preview & Picker */}
      <div className="rounded-2xl bg-white/85 border border-[#EFE0D8] p-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-[#4A3531] inline-flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-[#D64470]" />
            <span>本月精選封面照</span>
          </span>
          {coverPhoto && (
            <span className="text-[11px] font-bold text-[#8A716B] truncate max-w-[160px]">
              {coverPhoto.title}
            </span>
          )}
        </div>

        {coverPhoto ? (
          <RoomPhotoCard photo={coverPhoto} compact />
        ) : (
          <p className="text-xs text-[#8D746E] py-3 text-center">
            本月還沒有拍攝寫真喔！拍一張就能設為回顧卡封面～
          </p>
        )}

        {monthPhotos.length > 1 && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[#7D635D]">
              切換本月回顧封面照：
            </p>
            <div className="flex flex-wrap gap-1.5">
              {monthPhotos.slice(0, 6).map((p) => {
                const isSelected = coverPhoto?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedCoverId(p.id)}
                    className={`min-h-[34px] px-2.5 rounded-xl border text-[11px] font-extrabold transition max-w-[140px] truncate ${
                      isSelected
                        ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#B83B64]'
                        : 'bg-[#FFFDF8] border-[#EAE0D8] text-[#5A3E36]'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {notice && (
        <div className="rounded-2xl bg-[#E4F7F0] border border-[#A7E0CB] px-3 py-2 text-xs font-extrabold text-[#1F6B54] flex items-center gap-1.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Single-hand bottom CTA row */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={handleSave}
          className="min-h-[44px] rounded-2xl bg-[#FFF3D8] border border-[#F2CE6D] text-[11px] font-extrabold text-[#8A5610] inline-flex items-center justify-center gap-1 hover:bg-[#FFE9BF] active:scale-95 transition px-2"
        >
          <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
          <span>{savedRecap?.savedToAlbum ? '已收藏' : '收藏回憶'}</span>
        </button>

        <button
          type="button"
          onClick={handleOpenCard}
          className="min-h-[44px] rounded-2xl bg-[#E5F8F0] border border-[#9BE0C4] text-[11px] font-extrabold text-[#1F6B54] inline-flex items-center justify-center gap-1 hover:bg-[#D5F2E5] active:scale-95 transition px-2"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>生成圖卡</span>
        </button>

        {onShareRecapToBoard && (
          <button
            type="button"
            disabled={sharing}
            onClick={() => void handleShareBoard()}
            className="min-h-[44px] rounded-2xl bg-[#FF7A9E] text-white text-[11px] font-extrabold shadow-[0_2px_0_#D9577B] inline-flex items-center justify-center gap-1 hover:bg-[#F45D86] active:translate-y-0.5 transition px-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>{sharing ? '分享中' : '分享板板'}</span>
          </button>
        )}
      </div>
    </section>
  );
};
