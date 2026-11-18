import React, { useState } from 'react';
import { Check, Heart, Send, Sparkles, X } from 'lucide-react';
import { ACCESSORIES } from '../../data/accessories';
import { MEMORY_TYPE_META } from '../../data/memories';
import {
  MemoryEntry,
  Pet,
  RoomPhotoRecord,
  SharedPetRoom,
} from '../../types';
import { ShareCardPayload } from '../../utils/shareCardCanvas';
import { AccessoryPreview } from '../AccessoryPreview';
import { RoomPhotoCard } from '../house/RoomPhotoCard';

interface MemoryDetailModalProps {
  open: boolean;
  onClose: () => void;
  memory: MemoryEntry | null;
  pet: Pet;
  isFavorite: boolean;
  relatedPhoto: RoomPhotoRecord | null;
  sharedRoom: SharedPetRoom | null;
  currentUserId: string;
  onToggleFavorite: (memoryId: string) => void;
  onTogglePhotoLike?: (photoId: string) => void;
  onAddPhotoComment?: (photoId: string, content: string) => void;
  onOpenShareCard: (payload: ShareCardPayload) => void;
  onShareMemoryToBoard?: (memory: MemoryEntry) => Promise<string | null>;
}

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  open,
  onClose,
  memory,
  pet,
  isFavorite,
  relatedPhoto,
  sharedRoom,
  currentUserId,
  onToggleFavorite,
  onTogglePhotoLike,
  onAddPhotoComment,
  onOpenShareCard,
  onShareMemoryToBoard,
}) => {
  const [notice, setNotice] = useState<string>('');
  const [sharing, setSharing] = useState<boolean>(false);

  if (!open || !memory) return null;

  const typeMeta = MEMORY_TYPE_META[memory.type];
  const accessoryDef = memory.accessoryId
    ? ACCESSORIES.find((a) => a.id === memory.accessoryId) ?? null
    : null;

  const handleOpenCard = () => {
    onOpenShareCard({
      petName: pet.name,
      species: pet.species,
      title: memory.title,
      subtitle: memory.description,
      dateLabel: memory.dateKey,
      badgeText: `${typeMeta.emoji} ${typeMeta.label}`,
      emoji: memory.emoji,
      weight: memory.weight ?? relatedPhoto?.weightAtCapture ?? pet.weight,
      level: memory.level ?? pet.level,
      photo: relatedPhoto,
      accessoryId: memory.accessoryId,
    });
  };

  const handleShareBoard = async () => {
    if (!onShareMemoryToBoard) return;
    setSharing(true);
    setNotice('');
    try {
      const err = await onShareMemoryToBoard(memory);
      setNotice(
        err
          ? err
          : sharedRoom
          ? '已分享這則回憶給共養夥伴！'
          : '已分享這則回憶到留言板！'
      );
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2621]/55 backdrop-blur-xs flex items-center justify-center p-2 overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-detail-title"
    >
      <div className="w-full max-w-[420px] max-h-[92dvh] rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD7] shadow-2xl flex flex-col overflow-hidden">
        <header className="px-4 py-3 bg-gradient-to-r from-[#FFEAF0] via-[#FFF6DA] to-[#E8F8F2] border-b border-[#F2DFD5] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl leading-none shrink-0" aria-hidden="true">
              {memory.emoji}
            </span>
            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${typeMeta.badgeClass}`}
              >
                <span>{typeMeta.emoji}</span>
                <span>{typeMeta.label}</span>
              </span>
              <h2
                id="memory-detail-title"
                className="text-sm font-extrabold text-[#4A3531] truncate mt-0.5"
              >
                {memory.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="關閉回憶詳情"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/85 text-[#5A3E36] flex items-center justify-center hover:bg-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-[#826862] tabular-nums">
              📅 {memory.dateKey}
              {memory.actorName ? ` · 💞 ${memory.actorName}` : ''}
            </span>
            <button
              type="button"
              onClick={() => onToggleFavorite(memory.id)}
              className={`min-h-[44px] px-3.5 rounded-2xl border text-xs font-extrabold inline-flex items-center gap-1.5 transition active:scale-95 ${
                isFavorite
                  ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#C43463]'
                  : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E]'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-[#FF5C8D] text-[#FF5C8D]' : ''
                }`}
              />
              <span>{isFavorite ? '已加入最愛' : '加入最愛'}</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#FFF9F2] border border-[#F0DFD6] p-3.5 space-y-2">
            <p className="text-sm font-bold text-[#4A3531] leading-relaxed break-words">
              {memory.description}
            </p>
            {(typeof memory.weight === 'number' || typeof memory.level === 'number') && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {typeof memory.level === 'number' && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#FFF3D8] border border-[#F2CE6D] text-[11px] font-extrabold text-[#8A5610] tabular-nums">
                    ✨ Lv.{memory.level}
                  </span>
                )}
                {typeof memory.weight === 'number' && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#EAF3FF] border border-[#B6D1FA] text-[11px] font-extrabold text-[#2F5B9E] tabular-nums">
                    ⚖️ 當時體重 {memory.weight.toFixed(1)} kg
                  </span>
                )}
              </div>
            )}
          </div>

          {memory.dialogueText && (
            <div className="rounded-2xl bg-[#EFEAFF] border border-[#C9BDF2] p-3 text-xs font-bold text-[#4A387B] leading-relaxed">
              💬 「{memory.dialogueText}」
            </div>
          )}

          {accessoryDef && (
            <div className="rounded-2xl bg-[#FFF6FA] border border-[#F4C4D3] p-3 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#F2D5DF] flex items-center justify-center shrink-0">
                <AccessoryPreview accessoryId={accessoryDef.id} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[#B83B64]">相關穿搭配件</div>
                <div className="text-sm font-extrabold text-[#4A3531] truncate">
                  {accessoryDef.emoji} {accessoryDef.name}
                </div>
                <div className="text-[11px] text-[#7D635D] truncate">
                  {accessoryDef.description}
                </div>
              </div>
            </div>
          )}

          {relatedPhoto && (
            <div className="space-y-1.5">
              <div className="text-xs font-extrabold text-[#4A3531]">📸 相關紀念相片</div>
              <RoomPhotoCard
                photo={relatedPhoto}
                currentUserId={currentUserId}
                onToggleLike={onTogglePhotoLike}
                onAddComment={onAddPhotoComment}
              />
            </div>
          )}

          {notice && (
            <div className="rounded-2xl bg-[#E4F7F0] border border-[#A7E0CB] px-3 py-2 text-xs font-extrabold text-[#1F6B54] flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
        </div>

        <footer className="p-3 bg-[#FFF8F2] border-t border-[#F2DFD5] grid grid-cols-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenCard}
            className="min-h-[46px] rounded-2xl bg-[#E5F8F0] border border-[#9BE0C4] text-xs font-extrabold text-[#1F6B54] inline-flex items-center justify-center gap-1.5 hover:bg-[#D5F2E5] active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>生成分享圖卡</span>
          </button>

          {onShareMemoryToBoard ? (
            <button
              type="button"
              disabled={sharing}
              onClick={() => void handleShareBoard()}
              className="min-h-[46px] rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center justify-center gap-1.5 hover:bg-[#F45D86] active:translate-y-0.5 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>{sharing ? '分享中…' : '分享到留言板'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] rounded-2xl bg-[#F2E5DE] text-[#5A3E36] text-xs font-extrabold"
            >
              關閉
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
