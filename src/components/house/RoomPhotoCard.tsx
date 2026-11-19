import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Sparkles } from 'lucide-react';
import {
  FLOORING_BY_ID,
  ROOM_GRID_COLS,
  ROOM_GRID_ROWS,
  ROOM_ITEM_BY_ID,
  ROOM_PHOTO_POSES,
  WALLPAPER_BY_ID,
} from '../../data/house';
import {
  PHOTO_FILTER_BY_ID,
  PHOTO_FRAME_BY_ID,
  PHOTO_POSE_BY_ID,
  PHOTO_SCENE_BY_ID,
  PHOTO_STICKER_BY_ID,
} from '../../data/photoStudio';
import { RoomPhotoRecord } from '../../types';
import { PiggyCharacter } from '../PiggyCharacter';
import { FurnitureGraphic } from './FurnitureGraphic';

interface RoomPhotoCardProps {
  photo: RoomPhotoRecord;
  compact?: boolean;
  currentUserId?: string | null;
  onToggleLike?: (photoId: string) => void;
  onAddComment?: (photoId: string, content: string) => void;
  onGenerateShareCard?: (photo: RoomPhotoRecord) => void;
}

export const RoomPhotoCard: React.FC<RoomPhotoCardProps> = ({
  photo,
  compact = false,
  currentUserId = 'local',
  onToggleLike,
  onAddComment,
  onGenerateShareCard,
}) => {
  const [commentInput, setCommentInput] = useState<string>('');
  const [commentOpen, setCommentOpen] = useState<boolean>(false);

  const actorId = currentUserId || 'local';
  const likes = photo.likes ?? [];
  const comments = photo.comments ?? [];
  const hasLiked = likes.includes(actorId);
  const resolvedScene = photo.scene ?? photo.photoKind ?? 'room';
  const sceneMeta = PHOTO_SCENE_BY_ID[resolvedScene] ?? PHOTO_SCENE_BY_ID.room;
  const isStudioScenePhoto =
    photo.photoKind === 'wardrobe' ||
    photo.photoKind === 'farm' ||
    photo.photoKind === 'album' ||
    (Boolean(photo.wardrobePoseId) && photo.placedItems.length === 0);
  const stickers = photo.stickers ?? [];

  const dateLabel = new Date(photo.createdAt).toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddComment) return;
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    onAddComment(photo.id, trimmed);
    setCommentInput('');
  };

  const renderStickersOverlay = () => {
    if (stickers.length === 0) return null;
    return stickers.map((sid) => {
      const st = PHOTO_STICKER_BY_ID[sid];
      if (!st) return null;
      return (
        <span
          key={sid}
          className={`pointer-events-none absolute z-20 ${
            compact ? 'text-base' : 'text-xl'
          } drop-shadow-sm select-none ${st.positionClass}`}
          aria-hidden="true"
        >
          {st.emoji}
        </span>
      );
    });
  };

  const renderPhotoStage = () => {
    if (isStudioScenePhoto) {
      const pose =
        PHOTO_POSE_BY_ID[photo.wardrobePoseId ?? 'happy'] ?? PHOTO_POSE_BY_ID.happy;
      const filter =
        PHOTO_FILTER_BY_ID[photo.filterId ?? 'strawberry'] ??
        PHOTO_FILTER_BY_ID.strawberry;
      const frame =
        PHOTO_FRAME_BY_ID[photo.frameId ?? 'rounded'] ?? PHOTO_FRAME_BY_ID.rounded;
      const isDark = filter.id === 'starry';

      return (
        <div className={`${frame.outerClass} relative`}>
          {frame.cornerEmojis && (
            <>
              <span
                className="pointer-events-none absolute -top-2 -left-1.5 text-sm select-none z-10"
                aria-hidden="true"
              >
                {frame.cornerEmojis[0]}
              </span>
              <span
                className="pointer-events-none absolute -top-2 -right-1.5 text-sm select-none z-10"
                aria-hidden="true"
              >
                {frame.cornerEmojis[1]}
              </span>
            </>
          )}

          <div
            className={`${frame.innerClass} ${filter.backdropClass} relative ${
              compact ? 'py-3 px-2 min-h-[132px]' : 'py-4 px-3 min-h-[172px]'
            } flex flex-col items-center justify-center`}
          >
            <span
              className="pointer-events-none absolute top-2 left-2.5 text-sm opacity-80 select-none"
              aria-hidden="true"
            >
              {filter.accentEmojis[0]}
            </span>
            <span
              className="pointer-events-none absolute top-2 right-2.5 text-sm opacity-80 select-none"
              aria-hidden="true"
            >
              {filter.accentEmojis[1]}
            </span>
            <span
              className="pointer-events-none absolute bottom-2 left-3 text-sm opacity-75 select-none"
              aria-hidden="true"
            >
              {filter.accentEmojis[2]}
            </span>
            <span
              className="pointer-events-none absolute bottom-2 right-3 text-sm opacity-80 select-none"
              aria-hidden="true"
            >
              {filter.accentEmojis[3]}
            </span>

            {resolvedScene === 'farm' && (
              <div
                className="pointer-events-none absolute inset-x-3 bottom-1.5 flex items-center justify-between text-base opacity-75 select-none"
                aria-hidden="true"
              >
                <span>🌱</span>
                <span>🥕</span>
                <span>🍓</span>
                <span>🌻</span>
              </div>
            )}

            {renderStickersOverlay()}

            <div
              className={`mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-extrabold ${
                isDark
                  ? 'bg-white/20 border-white/35 text-white'
                  : 'bg-white/80 border-white text-[#5A3E36]'
              }`}
            >
              <span>{sceneMeta.emoji}</span>
              <span>{sceneMeta.label}</span>
              <span>·</span>
              <span>{pose.emoji}</span>
              <span>{pose.label}</span>
            </div>

            <div className="drop-shadow-md">
              <PiggyCharacter
                species={photo.species}
                growth={60}
                roundness={36}
                action={pose.action}
                expression={pose.expression}
                equipped={photo.equipped}
                interactive={false}
                customAnimClass={pose.animClass}
                viewDirection={photo.facing ?? 'front'}
                size={compact ? 86 : 118}
              />
            </div>
          </div>

          {frame.isPolaroid && (
            <div className="pt-1.5 px-1 flex items-center justify-between text-[10px] font-extrabold text-[#5A3E36]">
              <span className="truncate">
                {photo.petName} · {sceneMeta.label}
              </span>
              <span className="text-[9px] text-[#8E756E] tabular-nums shrink-0">
                {typeof photo.weightAtCapture === 'number'
                  ? `${photo.weightAtCapture.toFixed(1)} kg`
                  : '萌寵食堂'}
              </span>
            </div>
          )}
        </div>
      );
    }

    const wall = WALLPAPER_BY_ID[photo.wallpaperId] ?? WALLPAPER_BY_ID.cream_warm;
    const floor = FLOORING_BY_ID[photo.flooringId] ?? FLOORING_BY_ID.oak_wood;
    const pose =
      ROOM_PHOTO_POSES.find((p) => p.id === photo.poseId) ?? ROOM_PHOTO_POSES[0];
    const frame = photo.frameId ? PHOTO_FRAME_BY_ID[photo.frameId] : null;

    const cellMap = new Map<string, string>();
    for (const placed of photo.placedItems) {
      cellMap.set(`${placed.x}_${placed.y}`, placed.itemId);
    }

    const roomContent = (
      <div className="rounded-2xl overflow-hidden border border-[#EAD5CC] relative">
        {renderStickersOverlay()}
        <div
          className={`${compact ? 'h-12' : 'h-16'} px-2.5 pt-2 flex items-start justify-between relative`}
          style={{ background: wall.wallBgStyle }}
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/85 border border-[#E7CFC4] text-[10px] font-extrabold text-[#5A3E36] truncate max-w-[65%]">
            🪧 {photo.houseName}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white/80 text-[10px] font-extrabold text-[#9D5B12]">
            {pose.emoji} {pose.label}
          </span>
        </div>

        <div
          className={`relative ${compact ? 'p-1.5' : 'p-2.5'}`}
          style={{ background: floor.floorBgStyle }}
        >
          <div className="grid grid-cols-6 gap-1 opacity-95">
            {Array.from({ length: ROOM_GRID_ROWS * ROOM_GRID_COLS }, (_, idx) => {
              const x = idx % ROOM_GRID_COLS;
              const y = Math.floor(idx / ROOM_GRID_COLS);
              const itemId = cellMap.get(`${x}_${y}`);
              const itemDef = itemId ? ROOM_ITEM_BY_ID[itemId] : null;
              return (
                <div
                  key={`${x}_${y}`}
                  className={`${
                    compact ? 'h-6' : 'h-9'
                  } rounded-lg flex items-center justify-center bg-white/25 border border-white/35`}
                  title={itemDef?.name}
                >
                  {itemId && <FurnitureGraphic itemId={itemId} size={compact ? 22 : 30} />}
                </div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="drop-shadow-md">
              <PiggyCharacter
                species={photo.species}
                growth={60}
                roundness={36}
                action={pose.action}
                expression={pose.expression}
                equipped={photo.equipped}
                interactive={false}
                customAnimClass={pose.animClass}
                size={compact ? 72 : 104}
              />
            </div>
          </div>
        </div>
      </div>
    );

    if (frame) {
      return <div className={`${frame.outerClass} relative`}>{roomContent}</div>;
    }

    return roomContent;
  };

  return (
    <article className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F2D9CF] p-2.5 shadow-sm overflow-hidden">
      {renderPhotoStage()}

      <div className="pt-2 px-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-extrabold text-[#4A3531] truncate">{photo.title}</h4>
          <span className="text-[10px] font-bold text-[#957B74] tabular-nums shrink-0">
            {dateLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 text-[10px] font-extrabold">
          <span className={`px-1.5 py-0.5 rounded-md border ${sceneMeta.badgeClass}`}>
            {sceneMeta.emoji} {sceneMeta.label}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-[#FAF3EE] border border-[#EAD9D0] text-[#5A3E36]">
            🐾 {photo.petName}
          </span>
          {typeof photo.weightAtCapture === 'number' && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#EAF3FF] border border-[#B6D1FA] text-[#2F5B9E] tabular-nums">
              ⚖️ {photo.weightAtCapture.toFixed(1)} kg
            </span>
          )}
        </div>

        {photo.caption && (
          <p className="text-[11px] font-medium text-[#6E544E] leading-snug break-words">
            {photo.caption}
          </p>
        )}

        {photo.noteHighlight && !compact && (
          <p className="text-[10px] font-bold text-[#B83B64] truncate">
            💌 「{photo.noteHighlight}」
          </p>
        )}

        {(onToggleLike ||
          onAddComment ||
          onGenerateShareCard ||
          likes.length > 0 ||
          comments.length > 0) && (
          <div className="pt-1 border-t border-[#F4E6DF] space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {onToggleLike ? (
                  <button
                    type="button"
                    onClick={() => onToggleLike(photo.id)}
                    aria-label={hasLiked ? '收回愛心' : '按愛心'}
                    className={`min-h-[36px] px-2.5 rounded-xl border text-[11px] font-extrabold inline-flex items-center gap-1 transition active:scale-95 ${
                      hasLiked
                        ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#C43463]'
                        : 'bg-white border-[#EFE0D7] text-[#6E544E] hover:bg-[#FFF5F8]'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        hasLiked ? 'fill-[#FF5C8D] text-[#FF5C8D]' : ''
                      }`}
                    />
                    <span className="tabular-nums">{likes.length}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B83B64]">
                    <Heart className="w-3.5 h-3.5 fill-[#FF5C8D] text-[#FF5C8D]" />
                    <span className="tabular-nums">{likes.length}</span>
                  </span>
                )}

                {onAddComment ? (
                  <button
                    type="button"
                    onClick={() => setCommentOpen((prev) => !prev)}
                    className="min-h-[36px] px-2.5 rounded-xl bg-white border border-[#EFE0D7] text-[11px] font-extrabold text-[#5A3E36] inline-flex items-center gap-1 hover:bg-[#FFF7EE] transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#5CC9A7]" />
                    <span className="tabular-nums">留言 {comments.length}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6E544E]">
                    <MessageCircle className="w-3.5 h-3.5 text-[#5CC9A7]" />
                    <span className="tabular-nums">{comments.length}</span>
                  </span>
                )}
              </div>

              {onGenerateShareCard && (
                <button
                  type="button"
                  onClick={() => onGenerateShareCard(photo)}
                  className="min-h-[36px] px-2.5 rounded-xl bg-[#E5F8F0] border border-[#9BE0C4] text-[11px] font-extrabold text-[#1F6B54] inline-flex items-center gap-1 hover:bg-[#D5F2E5] active:scale-95 transition shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>生成圖卡</span>
                </button>
              )}
            </div>

            {comments.length > 0 && (
              <div className="space-y-1 rounded-xl bg-[#FAF4EE] px-2.5 py-2">
                {comments.slice(-4).map((c) => (
                  <p key={c.id} className="text-[11px] leading-snug text-[#4A3531] break-words">
                    <span className="font-extrabold text-[#B83B64]">{c.authorName}：</span>
                    <span className="font-medium">{c.content}</span>
                  </p>
                ))}
              </div>
            )}

            {onAddComment && commentOpen && (
              <form onSubmit={handleSubmitComment} className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={80}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="留一句讚美給這張寫真…"
                  className="flex-1 min-w-0 min-h-[38px] rounded-xl bg-white border border-[#EED9D0] px-2.5 text-xs font-medium text-[#4A3531] placeholder:text-[#B5A19B] focus:outline-none focus:border-[#FF7A9E]"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  aria-label="送出相片留言"
                  className="min-h-[38px] px-3 rounded-xl bg-[#FF7A9E] text-white text-[11px] font-extrabold inline-flex items-center gap-1 disabled:opacity-45 shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>送出</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
