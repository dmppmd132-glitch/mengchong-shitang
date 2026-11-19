import React, { useEffect, useState } from 'react';
import { BookMarked, Camera, Check, Lock, Send, Sparkles, X } from 'lucide-react';
import {
  PHOTO_FILTERS,
  PHOTO_FILTER_BY_ID,
  PHOTO_FRAMES,
  PHOTO_FRAME_BY_ID,
  PHOTO_POSES,
  PHOTO_POSE_BY_ID,
  PHOTO_SCENES,
  PHOTO_SCENE_BY_ID,
  PHOTO_STICKERS,
  PHOTO_STICKER_BY_ID,
} from '../data/photoStudio';
import {
  Pet,
  PetViewDirection,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScene,
  PhotoStickerId,
  RoomPhotoRecord,
  SharedPetRoom,
} from '../types';
import { PiggyCharacter } from './PiggyCharacter';

interface WardrobePhotoModalProps {
  open: boolean;
  onClose: () => void;
  pet: Pet;
  sharedRoom: SharedPetRoom | null;
  initialScene?: PhotoScene;
  unlockedPoses?: PhotoPose[];
  unlockedFrames?: PhotoFrame[];
  onSavePhoto: (params: {
    title: string;
    caption: string;
    scene: PhotoScene;
    poseId: PhotoPose;
    facing?: PetViewDirection;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }) => RoomPhotoRecord;
  onSharePhotoToBoard?: (photo: RoomPhotoRecord, caption: string) => Promise<string | null>;
}

export const WardrobePhotoModal: React.FC<WardrobePhotoModalProps> = ({
  open,
  onClose,
  pet,
  sharedRoom,
  initialScene = 'wardrobe',
  unlockedPoses = [],
  unlockedFrames = [],
  onSavePhoto,
  onSharePhotoToBoard,
}) => {
  const [scene, setScene] = useState<PhotoScene>(initialScene);
  const [poseId, setPoseId] = useState<PhotoPose>('happy');
  const [facing, setFacing] = useState<PetViewDirection>('front');
  const [filterId, setFilterId] = useState<PhotoFilter>('strawberry');
  const [frameId, setFrameId] = useState<PhotoFrame>('polaroid');
  const [stickers, setStickers] = useState<PhotoStickerId[]>([]);
  const [title, setTitle] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    setSavedNotice('');
    setScene(initialScene);
    const sceneMeta = PHOTO_SCENE_BY_ID[initialScene] ?? PHOTO_SCENES[0];
    const defaultFilter: PhotoFilter =
      initialScene === 'farm'
        ? 'forest'
        : initialScene === 'room'
        ? 'kitchen'
        : 'strawberry';
    setFilterId(defaultFilter);
    setPoseId('happy');
    setFacing('front');
    setStickers([]);
    setTitle(`${pet.name}的${sceneMeta.defaultTitleSuffix}`.slice(0, 20));
    setCaption('');
  }, [open, initialScene, pet.name]);

  if (!open) return null;

  const activeScene = PHOTO_SCENE_BY_ID[scene] ?? PHOTO_SCENES[0];
  const activePose = PHOTO_POSE_BY_ID[poseId] ?? PHOTO_POSE_BY_ID.happy;
  const activeFilter = PHOTO_FILTER_BY_ID[filterId] ?? PHOTO_FILTER_BY_ID.strawberry;
  const activeFrame = PHOTO_FRAME_BY_ID[frameId] ?? PHOTO_FRAME_BY_ID.rounded;
  const isDarkBackdrop = filterId === 'starry';
  const todayLabel = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const handleSelectScene = (nextScene: PhotoScene) => {
    setScene(nextScene);
    const meta = PHOTO_SCENE_BY_ID[nextScene];
    const isDefaultOldTitle = PHOTO_SCENES.some(
      (s) => title === `${pet.name}的${s.defaultTitleSuffix}`.slice(0, 20)
    );
    if (!title.trim() || isDefaultOldTitle) {
      setTitle(`${pet.name}的${meta.defaultTitleSuffix}`.slice(0, 20));
    }
    if (nextScene === 'farm') setFilterId('forest');
    if (nextScene === 'wardrobe') setFilterId('strawberry');
  };

  const toggleSticker = (id: PhotoStickerId) => {
    setStickers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].slice(0, 6)
    );
  };

  const getCleanTitle = () =>
    title.trim().slice(0, 20) ||
    `${pet.name}的${activeScene.defaultTitleSuffix}`.slice(0, 20);

  const handleSaveOnly = () => {
    const photo = onSavePhoto({
      title: getCleanTitle(),
      caption:
        caption.trim() ||
        `${activeScene.label} · ${activeFilter.label}背景 · ${activePose.label}姿勢紀念`,
      scene,
      poseId,
      facing,
      filterId,
      frameId,
      stickers,
    });
    setSavedNotice(`已將「${photo.title}」存入照片牆與回憶冊！`);
  };

  const handleSaveAndShare = async () => {
    if (!onSharePhotoToBoard) {
      handleSaveOnly();
      return;
    }
    setSubmitting(true);
    try {
      const cleanCaption =
        caption.trim() ||
        `在${activeScene.label}留下可愛寫真啦～（${activeFilter.label}濾鏡・${activePose.label}）`;
      const photo = onSavePhoto({
        title: getCleanTitle(),
        caption: cleanCaption,
        scene,
        poseId,
        facing,
        filterId,
        frameId,
        stickers,
      });
      const err = await onSharePhotoToBoard(photo, cleanCaption);
      setSavedNotice(
        err
          ? `已儲存到照片牆！（留言板提醒：${err}）`
          : sharedRoom
          ? `已存入照片牆並同步分享給共養夥伴！`
          : `已存入照片牆並發佈到留言板！`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2621]/55 backdrop-blur-xs flex items-center justify-center p-2 overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wardrobe-photo-title"
    >
      <div className="w-full max-w-[420px] max-h-[92dvh] rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD7] shadow-2xl flex flex-col overflow-hidden">
        <header className="px-4 py-3 bg-gradient-to-r from-[#FFEAF0] via-[#FFF6DA] to-[#E8F8F2] border-b border-[#F2DFD5] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-white/90 text-[#D64470] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="wardrobe-photo-title"
                className="text-base font-extrabold text-[#4A3531] truncate"
              >
                {pet.name}的回憶攝影棚
              </h2>
              <p className="text-[11px] font-bold text-[#7D635D] truncate">
                挑選場景、姿勢、濾鏡、相框與貼圖，留住最萌時刻
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉攝影棚"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/85 text-[#5A3E36] flex items-center justify-center hover:bg-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5">
          {/* Scene Selector */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-extrabold text-[#4A3531] px-0.5">
              📍 拍攝場景
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {PHOTO_SCENES.map((sc) => {
                const selected = scene === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleSelectScene(sc.id)}
                    className={`min-h-[44px] rounded-2xl px-1 border-2 text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition active:scale-95 ${
                      selected
                        ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#C43463]'
                        : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36]'
                    }`}
                  >
                    <span aria-hidden="true">{sc.emoji}</span>
                    <span className="truncate">{sc.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Live Photo Preview */}
          <div className={`${activeFrame.outerClass} relative`}>
            {activeFrame.cornerEmojis && (
              <>
                <span
                  className="pointer-events-none absolute -top-2 -left-1.5 text-lg select-none z-10"
                  aria-hidden="true"
                >
                  {activeFrame.cornerEmojis[0]}
                </span>
                <span
                  className="pointer-events-none absolute -top-2 -right-1.5 text-lg select-none z-10"
                  aria-hidden="true"
                >
                  {activeFrame.cornerEmojis[1]}
                </span>
              </>
            )}

            <div
              className={`${activeFrame.innerClass} ${activeFilter.backdropClass} relative min-h-[224px] flex flex-col items-center justify-center px-3 py-4`}
            >
              <span
                className="pointer-events-none absolute top-2.5 left-3 text-xl opacity-80 select-none"
                aria-hidden="true"
              >
                {activeFilter.accentEmojis[0]}
              </span>
              <span
                className="pointer-events-none absolute top-3 right-3.5 text-lg opacity-80 select-none"
                aria-hidden="true"
              >
                {activeFilter.accentEmojis[1]}
              </span>
              <span
                className="pointer-events-none absolute bottom-3 left-4 text-lg opacity-75 select-none"
                aria-hidden="true"
              >
                {activeFilter.accentEmojis[2]}
              </span>
              <span
                className="pointer-events-none absolute bottom-3 right-4 text-xl opacity-80 select-none"
                aria-hidden="true"
              >
                {activeFilter.accentEmojis[3]}
              </span>

              {/* Scene Props Backdrop */}
              {scene === 'farm' && (
                <div
                  className="pointer-events-none absolute inset-x-4 bottom-2 flex items-center justify-between text-xl opacity-80 select-none"
                  aria-hidden="true"
                >
                  <span>🌱</span>
                  <span>🥕</span>
                  <span>🍓</span>
                  <span>🌻</span>
                </div>
              )}
              {scene === 'room' && (
                <div
                  className="pointer-events-none absolute inset-x-4 bottom-2 flex items-center justify-between text-xl opacity-80 select-none"
                  aria-hidden="true"
                >
                  <span>🛋️</span>
                  <span>🪴</span>
                  <span>🧸</span>
                  <span>🛏️</span>
                </div>
              )}

              {/* Selected Stickers */}
              {stickers.map((sid) => {
                const st = PHOTO_STICKER_BY_ID[sid];
                if (!st) return null;
                return (
                  <span
                    key={sid}
                    className={`pointer-events-none absolute z-20 text-2xl drop-shadow-sm select-none ${st.positionClass}`}
                    aria-hidden="true"
                  >
                    {st.emoji}
                  </span>
                );
              })}

              <div
                className={`mb-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl border text-[10px] font-extrabold ${
                  isDarkBackdrop
                    ? 'bg-white/20 border-white/35 text-white'
                    : 'bg-white/85 border-white text-[#5A3E36]'
                }`}
              >
                <span>{activeScene.emoji}</span>
                <span>{activeScene.label}</span>
                <span>·</span>
                <span>{activePose.emoji}</span>
                <span>{activePose.label}</span>
              </div>

              <div className="drop-shadow-md">
                <PiggyCharacter
                  species={pet.species}
                  growth={pet.growth}
                  roundness={pet.roundness}
                  action={activePose.action}
                  expression={activePose.expression}
                  equipped={pet.accessories}
                  interactive={false}
                  customAnimClass={activePose.animClass}
                  viewDirection={facing}
                  size={156}
                />
              </div>

              {/* Auto-displayed Date, Pet Name & Weight */}
              <div
                className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-[10px] font-extrabold tabular-nums ${
                  isDarkBackdrop
                    ? 'bg-black/30 text-white/95'
                    : 'bg-white/85 text-[#5A3E36]'
                }`}
              >
                <span>{todayLabel}</span>
                <span>·</span>
                <span>{pet.name}</span>
                <span>·</span>
                <span>{pet.weight.toFixed(1)} kg</span>
              </div>
            </div>

            {activeFrame.isPolaroid && (
              <div className="pt-2 px-1 flex items-center justify-between text-[11px] font-extrabold text-[#5A3E36]">
                <span className="truncate">{getCleanTitle()}</span>
                <span className="text-[10px] text-[#8E756E] tabular-nums shrink-0">
                  {pet.weight.toFixed(1)} kg · 萌寵食堂
                </span>
              </div>
            )}
          </div>

          {savedNotice && (
            <div className="rounded-2xl bg-[#E4F7F0] border border-[#A7E0CB] px-3 py-2.5 text-xs font-extrabold text-[#1F6B54] flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{savedNotice}</span>
            </div>
          )}

          {/* 1. Pose selector */}
          <section className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-xs font-extrabold text-[#4A3531]">
                ✨ 選擇姿勢
              </h3>
              <span className="text-[10px] font-bold text-[#8A716B]">
                {activePose.description}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {PHOTO_POSES.map((pose) => {
                const unlocked =
                  !pose.requiresUnlock || unlockedPoses.includes(pose.id);
                const selected = poseId === pose.id;
                return (
                  <button
                    key={pose.id}
                    type="button"
                    disabled={!unlocked}
                    title={unlocked ? pose.description : pose.unlockHint}
                    onClick={() => setPoseId(pose.id)}
                    className={`min-h-[44px] rounded-2xl px-1.5 border-2 text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition active:scale-95 ${
                      !unlocked
                        ? 'bg-[#F3ECE8] border-[#E4D6CE] text-[#9E8B84] cursor-not-allowed'
                        : selected
                        ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#C43463] shadow-xs'
                        : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36] hover:bg-[#FFF6EE]'
                    }`}
                  >
                    {unlocked ? (
                      <span aria-hidden="true">{pose.emoji}</span>
                    ) : (
                      <Lock className="w-3 h-3 shrink-0" />
                    )}
                    <span className="truncate">{pose.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 1.5 Facing direction selector */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-extrabold text-[#4A3531] px-0.5">
              🔄 寵物面向（展現正面或背部翅膀）
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: 'front', label: '正面' },
                  { id: 'left', label: '朝左' },
                  { id: 'back', label: '背面' },
                  { id: 'right', label: '朝右' },
                ] as const
              ).map((dir) => {
                const selected = facing === dir.id;
                return (
                  <button
                    key={dir.id}
                    type="button"
                    onClick={() => setFacing(dir.id)}
                    className={`min-h-[44px] rounded-2xl px-2 border-2 text-[11px] font-extrabold transition active:scale-95 ${
                      selected
                        ? 'bg-[#E6F8F1] border-[#5CC9A7] text-[#1F6B54] shadow-xs'
                        : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36] hover:bg-[#FFF6EE]'
                    }`}
                  >
                    {dir.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Background Filter selector (6 filters) */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-extrabold text-[#4A3531] px-0.5">
              🎨 背景濾鏡（6 種）
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {PHOTO_FILTERS.map((filter) => {
                const selected = filterId === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setFilterId(filter.id)}
                    className={`min-h-[44px] rounded-2xl px-2 border-2 text-xs font-extrabold inline-flex items-center justify-center gap-1 transition active:scale-95 ${
                      selected
                        ? 'bg-[#E6F8F1] border-[#5CC9A7] text-[#1F6B54] shadow-xs'
                        : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36] hover:bg-[#FFF6EE]'
                    }`}
                  >
                    <span aria-hidden="true">{filter.emoji}</span>
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Frame selector */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-extrabold text-[#4A3531] px-0.5">
              🖼️ 選擇相框
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {PHOTO_FRAMES.map((frame) => {
                const unlocked =
                  !frame.requiresUnlock || unlockedFrames.includes(frame.id);
                const selected = frameId === frame.id;
                return (
                  <button
                    key={frame.id}
                    type="button"
                    disabled={!unlocked}
                    title={unlocked ? frame.label : frame.unlockHint}
                    onClick={() => setFrameId(frame.id)}
                    className={`min-h-[44px] rounded-2xl px-1.5 border-2 text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition active:scale-95 ${
                      !unlocked
                        ? 'bg-[#F3ECE8] border-[#E4D6CE] text-[#9E8B84] cursor-not-allowed'
                        : selected
                        ? 'bg-[#FFF3D1] border-[#F2C94C] text-[#8A5610] shadow-xs'
                        : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36] hover:bg-[#FFF6EE]'
                    }`}
                  >
                    {unlocked ? (
                      <span aria-hidden="true">{frame.emoji}</span>
                    ) : (
                      <Lock className="w-3 h-3 shrink-0" />
                    )}
                    <span className="truncate">{frame.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. Stickers selector (6 stickers) */}
          <section className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-xs font-extrabold text-[#4A3531]">
                🩷 加入相片貼圖（可複選）
              </h3>
              <span className="text-[10px] font-bold text-[#8A716B] tabular-nums">
                已選 {stickers.length} / 6
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PHOTO_STICKERS.map((st) => {
                const selected = stickers.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleSticker(st.id)}
                    className={`min-h-[44px] rounded-2xl px-2 border-2 text-xs font-extrabold inline-flex items-center justify-center gap-1 transition active:scale-95 ${
                      selected
                        ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#C43463] shadow-xs'
                        : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36] hover:bg-[#FFF6EE]'
                    }`}
                  >
                    <span aria-hidden="true">{st.emoji}</span>
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 5. Title (max 20 chars) & Caption */}
          <section className="space-y-2 pt-0.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-0.5 text-[11px] font-bold text-[#7D635D]">
                <span>相片標題（最長 20 字）</span>
                <span className="tabular-nums">{title.length}/20</span>
              </div>
              <input
                type="text"
                maxLength={20}
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 20))}
                placeholder={`${pet.name}的${activeScene.defaultTitleSuffix}`}
                aria-label="相片標題"
                className="w-full min-h-[44px] rounded-2xl bg-white border border-[#EED9D0] px-3.5 text-sm font-bold text-[#4A3531] placeholder:text-[#B5A19B] focus:outline-none focus:border-[#FF7A9E]"
              />
            </div>
            <input
              type="text"
              maxLength={60}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="寫一句今天的心得或紀念吧（選填）"
              aria-label="相片留言說明"
              className="w-full min-h-[44px] rounded-2xl bg-white border border-[#EED9D0] px-3.5 text-sm font-medium text-[#4A3531] placeholder:text-[#B5A19B] focus:outline-none focus:border-[#FF7A9E]"
            />
          </section>
        </div>

        <footer className="p-3 bg-[#FFF8F2] border-t border-[#F2DFD5] space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSaveOnly}
              className="min-h-[46px] rounded-2xl bg-[#FFF3D8] border-2 border-[#F2CE6D] text-xs font-extrabold text-[#8A5610] inline-flex items-center justify-center gap-1.5 hover:bg-[#FFE9BF] active:scale-95 transition disabled:opacity-50"
            >
              <BookMarked className="w-4 h-4 shrink-0" />
              <span>存到照片牆</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                void handleSaveAndShare();
              }}
              className="min-h-[46px] rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center justify-center gap-1.5 hover:bg-[#F76890] active:translate-y-0.5 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>
                {sharedRoom ? '存檔並分享共養' : '存檔並發佈留言板'}
              </span>
            </button>
          </div>
          {sharedRoom && (
            <p className="text-[10px] font-bold text-[#256D57] text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>已連線共養小屋「{sharedRoom.inviteCode}」，夥伴可按愛心與留言！</span>
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};
