import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CalendarHeart,
  Camera,
  CheckCircle2,
  Clock3,
  Heart,
  HeartHandshake,
  Image as ImageIcon,
  Lock,
  Send,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { ACCESSORIES } from '../../data/accessories';
import { MEMORY_TYPE_META, MEMORY_TYPE_ORDER } from '../../data/memories';
import { PHOTO_SCENES } from '../../data/photoStudio';
import { getPetSpeciesInfo } from '../../data/species';
import {
  GameState,
  MemoryEntry,
  MemoryType,
  MonthlyRecap,
  PetMessage,
  PhotoScene,
  RoomPhotoRecord,
  SharedPetRoom,
} from '../../types';
import { getActivePet } from '../../utils/pets';
import { ShareCardPayload } from '../../utils/shareCardCanvas';
import { RoomPhotoCard } from '../house/RoomPhotoCard';
import { MonthlyRecapCard } from './MonthlyRecapCard';

export type MemoriesSubTab = 'timeline' | 'photos' | 'milestones' | 'shared';

interface MemoriesViewProps {
  game: GameState;
  sharedRoom: SharedPetRoom | null;
  messages: PetMessage[];
  currentUserId: string;
  onOpenPhotoStudio: (scene?: PhotoScene) => void;
  onOpenMemoryDetail: (memory: MemoryEntry) => void;
  onToggleFavoriteMemory: (memoryId: string) => void;
  onTogglePhotoLike: (photoId: string) => void;
  onAddPhotoComment: (photoId: string, content: string) => void;
  onSharePhotoToBoard: (photo: RoomPhotoRecord, caption: string) => Promise<string | null>;
  onOpenShareCard: (payload: ShareCardPayload) => void;
  onSaveMonthlyRecap: (recap: MonthlyRecap) => void;
  onShareRecapToBoard?: (recap: MonthlyRecap) => Promise<string | null>;
  onShareTextToBoard?: (title: string, body: string) => Promise<string | null>;
  onOpenSharedPet?: () => void;
}

export const MemoriesView: React.FC<MemoriesViewProps> = ({
  game,
  sharedRoom,
  messages,
  currentUserId,
  onOpenPhotoStudio,
  onOpenMemoryDetail,
  onToggleFavoriteMemory,
  onTogglePhotoLike,
  onAddPhotoComment,
  onSharePhotoToBoard,
  onOpenShareCard,
  onSaveMonthlyRecap,
  onShareRecapToBoard,
  onShareTextToBoard,
  onOpenSharedPet,
}) => {
  const activePet = getActivePet(game);
  const firstPetId = game.pets[0]?.id ?? 'pet_1';
  const [subTab, setSubTab] = useState<MemoriesSubTab>('timeline');
  const [petFilter, setPetFilter] = useState<string>(activePet.id);
  const [typeFilter, setTypeFilter] = useState<'all' | MemoryType>('all');
  const [photoSceneFilter, setPhotoSceneFilter] = useState<'all' | PhotoScene>('all');
  const [photoPetFilter, setPhotoPetFilter] = useState<string>('all');
  const [showRecapPanel, setShowRecapPanel] = useState<boolean>(false);
  const [boardNotice, setBoardNotice] = useState<string>('');

  useEffect(() => {
    setPetFilter(activePet.id);
  }, [activePet.id]);

  const album = game.memoryAlbum;
  const favSet = useMemo(() => new Set(album.favoriteMemoryIds), [album.favoriteMemoryIds]);
  const photoById = useMemo(() => {
    const map = new Map<string, RoomPhotoRecord>();
    for (const p of game.house.photos) {
      map.set(p.id, p);
    }
    return map;
  }, [game.house.photos]);

  const sortedMemories = useMemo(() => {
    return [...album.memories].sort((a, b) => b.createdAt - a.createdAt);
  }, [album.memories]);

  const petScopedMemories = useMemo(() => {
    if (petFilter === 'all') return sortedMemories;
    return sortedMemories.filter((m) => (m.petId ?? firstPetId) === petFilter);
  }, [sortedMemories, petFilter, firstPetId]);

  const favoriteMemories = useMemo(() => {
    return petScopedMemories.filter((m) => favSet.has(m.id));
  }, [petScopedMemories, favSet]);

  const filteredTimeline = useMemo(() => {
    if (typeFilter === 'all') return petScopedMemories;
    return petScopedMemories.filter((m) => m.type === typeFilter);
  }, [petScopedMemories, typeFilter]);

  const filteredPhotos = useMemo(() => {
    return game.house.photos.filter((p) => {
      const sceneOk =
        photoSceneFilter === 'all' ||
        (p.scene ?? p.photoKind ?? 'room') === photoSceneFilter;
      const petOk =
        photoPetFilter === 'all' || (p.petId ?? firstPetId) === photoPetFilter;
      return sceneOk && petOk;
    });
  }, [game.house.photos, photoSceneFilter, photoPetFilter, firstPetId]);

  const completedMilestones = useMemo(
    () => album.milestones.filter((m) => m.unlocked),
    [album.milestones]
  );
  const incompleteMilestones = useMemo(
    () => album.milestones.filter((m) => !m.unlocked),
    [album.milestones]
  );

  const unlockedSharedCount = useMemo(
    () => album.sharedMemories.filter((s) => s.unlocked).length,
    [album.sharedMemories]
  );

  const handleShareBoardNotice = (msg: string) => {
    setBoardNotice(msg);
    window.setTimeout(() => setBoardNotice(''), 2500);
  };

  const selectedMemoryPet =
    game.pets.find((p) => p.id === petFilter) ?? activePet;

  return (
    <div className="space-y-3.5 overflow-x-hidden">
      {/* Top Memories Summary + Camera & Monthly Recap Buttons */}
      <section className="rounded-3xl bg-gradient-to-r from-[#FFEAF0] via-[#FFF6DA] to-[#E8F8F2] border-2 border-[#F4DFD7] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-[#4A3531] truncate">
              📖 {petFilter === 'all' ? '大家的回憶冊' : `${selectedMemoryPet.name}的回憶冊`}
            </h2>
            <p className="text-[11px] font-bold text-[#7D635D] tabular-nums">
              {petScopedMemories.length} 則回憶 · {game.house.photos.length} 張相片 ·{' '}
              {completedMilestones.length}/{album.milestones.length} 里程碑
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenPhotoStudio('album')}
            className="min-h-[44px] px-3.5 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center gap-1.5 hover:bg-[#F76890] active:translate-y-0.5 transition shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>拍照</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowRecapPanel((prev) => !prev)}
          className="w-full min-h-[44px] rounded-2xl bg-white/90 border border-[#EED6CD] px-3 flex items-center justify-between gap-2 text-xs font-extrabold text-[#5A3E36] hover:bg-white transition"
        >
          <span className="inline-flex items-center gap-1.5 truncate">
            <CalendarHeart className="w-4 h-4 text-[#D64470] shrink-0" />
            <span>本月回顧卡（最愛食物・體重變化・封面精選）</span>
          </span>
          <span className="text-[#D64470] shrink-0">
            {showRecapPanel ? '收合 ▲' : '查看 ▼'}
          </span>
        </button>
      </section>

      {showRecapPanel && (
        <MonthlyRecapCard
          game={game}
          messages={messages}
          sharedRoom={sharedRoom}
          onSaveRecap={onSaveMonthlyRecap}
          onOpenShareCard={onOpenShareCard}
          onShareRecapToBoard={onShareRecapToBoard}
        />
      )}

      {/* 4 Sub-tabs */}
      <div className="grid grid-cols-4 gap-1 bg-[#F2E5DE] p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setSubTab('timeline')}
          className={`min-h-[44px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition whitespace-nowrap ${
            subTab === 'timeline'
              ? 'bg-white text-[#D64470] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Clock3 className="w-3.5 h-3.5 shrink-0" />
          <span>時間軸</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('photos')}
          className={`min-h-[44px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition whitespace-nowrap ${
            subTab === 'photos'
              ? 'bg-white text-[#256D57] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
          <span>照片牆</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('milestones')}
          className={`min-h-[44px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition whitespace-nowrap ${
            subTab === 'milestones'
              ? 'bg-white text-[#9D5B12] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span>里程碑</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('shared')}
          className={`min-h-[44px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition whitespace-nowrap ${
            subTab === 'shared'
              ? 'bg-white text-[#B83B64] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
          <span>共同回憶</span>
        </button>
      </div>

      {boardNotice && (
        <div className="rounded-2xl bg-[#E4F7F0] border border-[#A7E0CB] px-3 py-2 text-xs font-extrabold text-[#1F6B54]">
          ✨ {boardNotice}
        </div>
      )}

      {/* SUB-TAB 1: TIMELINE */}
      {subTab === 'timeline' && (
        <div className="space-y-3">
          {/* Pinned Favorites at Top */}
          {favoriteMemories.length > 0 && (
            <section className="rounded-3xl bg-[#FFF6FA] border-2 border-[#F5C6D4] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#B83B64] inline-flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#FFD166] text-[#E6A222]" />
                  <span>最愛回憶精選（置頂）</span>
                </h3>
                <span className="text-[10px] font-bold text-[#B83B64] tabular-nums">
                  {favoriteMemories.length} 則
                </span>
              </div>

              <div className="space-y-2">
                {favoriteMemories.map((mem) => {
                  const meta = MEMORY_TYPE_META[mem.type];
                  return (
                    <div
                      key={`fav_${mem.id}`}
                      className="rounded-2xl bg-white border border-[#F3D2DC] p-2.5 flex items-center gap-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenMemoryDetail(mem)}
                        className="flex-1 min-w-0 text-left flex items-center gap-2.5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#FFF3F6] flex items-center justify-center text-xl shrink-0">
                          {mem.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold text-[#B83B64]">
                              {meta.label}
                            </span>
                            <span className="text-[10px] font-bold text-[#957B74] tabular-nums">
                              {mem.dateKey}
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-[#4A3531] truncate">
                            {mem.title}
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleFavoriteMemory(mem.id)}
                        aria-label="取消最愛"
                        className="min-h-[44px] min-w-[44px] rounded-xl bg-[#FFEAF0] text-[#D64470] flex items-center justify-center shrink-0"
                      >
                        <Heart className="w-4 h-4 fill-[#FF5C8D] text-[#FF5C8D]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Per-Pet Memory Tabs */}
          {game.pets.length > 1 && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {game.pets.map((p) => {
                const count = sortedMemories.filter(
                  (m) => (m.petId ?? firstPetId) === p.id
                ).length;
                const sp = getPetSpeciesInfo(p.species);
                const selected = petFilter === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPetFilter(p.id)}
                    className={`min-h-[38px] px-3 rounded-xl border text-[11px] font-extrabold inline-flex items-center gap-1 transition ${
                      selected
                        ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#B83B64]'
                        : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E]'
                    }`}
                  >
                    <span>{sp.emoji}</span>
                    <span>
                      {p.name} ({count})
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPetFilter('all')}
                className={`min-h-[38px] px-3 rounded-xl border text-[11px] font-extrabold transition ${
                  petFilter === 'all'
                    ? 'bg-[#5CC9A7] border-[#5CC9A7] text-white'
                    : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E]'
                }`}
              >
                全部寵物 ({sortedMemories.length})
              </button>
            </div>
          )}

          {/* Type Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`min-h-[36px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                typeFilter === 'all'
                  ? 'bg-[#FF7A9E] border-[#FF7A9E] text-white'
                  : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E]'
              }`}
            >
              全部 ({petScopedMemories.length})
            </button>
            {MEMORY_TYPE_ORDER.map((t) => {
              const count = petScopedMemories.filter((m) => m.type === t).length;
              if (count === 0 && typeFilter !== t) return null;
              const meta = MEMORY_TYPE_META[t];
              const active = typeFilter === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`min-h-[36px] px-2.5 rounded-xl border text-[11px] font-extrabold transition inline-flex items-center gap-1 ${
                    active
                      ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#B83B64]'
                      : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E]'
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>
                    {meta.label} ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chronological Memory Cards */}
          {filteredTimeline.length === 0 ? (
            <div className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD7] py-8 px-4 text-center space-y-2">
              <p className="text-xs font-bold text-[#8D746E]">
                目前這個分類還沒有回憶喔！餵食、換裝、佈置小屋或收成作物就會自動寫入回憶冊。
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTimeline.map((mem) => {
                const meta = MEMORY_TYPE_META[mem.type];
                const isFav = favSet.has(mem.id);
                const relPhoto = mem.photoId ? photoById.get(mem.photoId) : undefined;
                const relAcc = mem.accessoryId
                  ? ACCESSORIES.find((a) => a.id === mem.accessoryId)
                  : undefined;

                return (
                  <article
                    key={mem.id}
                    className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD7] p-3 flex items-start gap-2.5 shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenMemoryDetail(mem)}
                      className="flex-1 min-w-0 text-left flex items-start gap-2.5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF5EC] border border-[#F0DDD3] flex items-center justify-center text-2xl shrink-0">
                        {mem.emoji}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${meta.badgeClass}`}
                          >
                            <span>{meta.emoji}</span>
                            <span>{meta.label}</span>
                          </span>
                          <span className="text-[10px] font-bold text-[#957B74] tabular-nums">
                            {mem.dateKey}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-[#4A3531] truncate">
                          {mem.title}
                        </h4>
                        <p className="text-xs font-medium text-[#6E544E] line-clamp-2 leading-snug">
                          {mem.description}
                        </p>

                        {(relPhoto || relAcc) && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {relPhoto && (
                              <span className="px-2 py-0.5 rounded-lg bg-[#EAF3FF] border border-[#B6D1FA] text-[10px] font-extrabold text-[#2F5B9E]">
                                📸 {relPhoto.title}
                              </span>
                            )}
                            {relAcc && (
                              <span className="px-2 py-0.5 rounded-lg bg-[#FFEAF0] border border-[#F4B4CB] text-[10px] font-extrabold text-[#B83B64]">
                                {relAcc.emoji} {relAcc.name}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleFavoriteMemory(mem.id)}
                      aria-label={isFav ? '取消最愛回憶' : '加入最愛回憶'}
                      className={`min-h-[44px] min-w-[44px] rounded-2xl border flex items-center justify-center shrink-0 transition active:scale-95 ${
                        isFav
                          ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#C43463]'
                          : 'bg-[#FAF4EE] border-[#EFE0D7] text-[#9E8882]'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? 'fill-[#FF5C8D] text-[#FF5C8D]' : ''
                        }`}
                      />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PHOTO WALL */}
      {subTab === 'photos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPhotoSceneFilter('all')}
                className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                  photoSceneFilter === 'all'
                    ? 'bg-[#5CC9A7] border-[#5CC9A7] text-white'
                    : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E]'
                }`}
              >
                全部 ({game.house.photos.length})
              </button>
              {PHOTO_SCENES.map((sc) => {
                const active = photoSceneFilter === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setPhotoSceneFilter(sc.id)}
                    className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold inline-flex items-center gap-1 transition ${
                      active
                        ? 'bg-[#E5F8F0] border-[#5CC9A7] text-[#1F6B54]'
                        : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E]'
                    }`}
                  >
                    <span>{sc.emoji}</span>
                    <span>{sc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {game.pets.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPhotoPetFilter('all')}
                className={`min-h-[36px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                  photoPetFilter === 'all'
                    ? 'bg-[#FF7A9E] border-[#FF7A9E] text-white'
                    : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E]'
                }`}
              >
                全部寵物 ({game.house.photos.length})
              </button>
              {game.pets.map((p) => {
                const count = game.house.photos.filter(
                  (ph) => (ph.petId ?? firstPetId) === p.id
                ).length;
                const sp = getPetSpeciesInfo(p.species);
                const active = photoPetFilter === p.id;
                return (
                  <button
                    key={`photo_pet_${p.id}`}
                    type="button"
                    onClick={() => setPhotoPetFilter(p.id)}
                    className={`min-h-[36px] px-2.5 rounded-xl border text-[11px] font-extrabold inline-flex items-center gap-1 transition ${
                      active
                        ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#B83B64]'
                        : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E]'
                    }`}
                  >
                    <span>{sp.emoji}</span>
                    <span>
                      {p.name} ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredPhotos.length === 0 ? (
            <div className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD7] p-6 text-center space-y-3">
              <p className="text-xs font-bold text-[#7D635D]">
                這個篩選條件還沒有相片喔！幫 {activePet.name} 拍一張紀念寫真吧～
              </p>
              <button
                type="button"
                onClick={() =>
                  onOpenPhotoStudio(
                    photoSceneFilter === 'all' ? 'album' : photoSceneFilter
                  )
                }
                className="min-h-[44px] px-5 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>立刻拍照</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className="space-y-1.5">
                  <RoomPhotoCard
                    photo={photo}
                    currentUserId={currentUserId}
                    onToggleLike={onTogglePhotoLike}
                    onAddComment={onAddPhotoComment}
                    onGenerateShareCard={(p) =>
                      onOpenShareCard({
                        petName: p.petName,
                        species: p.species,
                        title: p.title,
                        subtitle: p.caption,
                        dateLabel: new Date(p.createdAt).toLocaleDateString('zh-TW'),
                        badgeText: '📸 照片牆精選',
                        emoji: '📸',
                        weight: p.weightAtCapture ?? activePet.weight,
                        level: activePet.level,
                        photo: p,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void onSharePhotoToBoard(photo, photo.caption).then((err) => {
                        handleShareBoardNotice(
                          err ? err : `已將「${photo.title}」分享到留言板！`
                        );
                      });
                    }}
                    className="w-full min-h-[44px] rounded-2xl bg-[#FFF3D8] border border-[#F2CE6D] text-xs font-extrabold text-[#8A5610] inline-flex items-center justify-center gap-1.5 hover:bg-[#FFE9BF] active:scale-[0.99] transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {sharedRoom ? '分享這張照片給共養夥伴' : '分享這張照片到留言板'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: MILESTONES (12 AUTO-TRACKED) */}
      {subTab === 'milestones' && (
        <div className="space-y-3.5">
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F2D59B] p-3.5 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#4A3531]">
                🏆 成長里程碑紀念（自動記錄）
              </h3>
              <p className="text-[11px] font-bold text-[#7D635D]">
                達成條件會自動解鎖獎勵，無需手動勾選！
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-2xl bg-[#FFF3D8] border border-[#F2CE6D] text-xs font-extrabold text-[#8A5610] tabular-nums shrink-0">
              {completedMilestones.length} / {album.milestones.length}
            </span>
          </section>

          {completedMilestones.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-extrabold text-[#1F6B54] px-1">
                ✓ 已完成紀念卡 ({completedMilestones.length})
              </h4>
              {completedMilestones.map((ms) => (
                <article
                  key={ms.id}
                  className="rounded-3xl bg-gradient-to-r from-[#F1FBF6] to-[#FFFDF8] border-2 border-[#B5E5D1] p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#BCE6D5] flex items-center justify-center text-2xl shrink-0">
                        {ms.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6B54] shrink-0" />
                          <h5 className="text-sm font-extrabold text-[#4A3531] truncate">
                            {ms.title}
                          </h5>
                        </div>
                        <p className="text-[11px] font-bold text-[#256D57] tabular-nums">
                          完成日期：{ms.unlockedDateKey} · {ms.rewardCardTitle}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenShareCard({
                          petName: activePet.name,
                          species: activePet.species,
                          title: ms.rewardCardTitle,
                          subtitle: ms.description,
                          dateLabel: ms.unlockedDateKey || '',
                          badgeText: `🏆 ${ms.title}`,
                          emoji: ms.emoji,
                          weight: activePet.weight,
                          level: activePet.level,
                        })
                      }
                      className="min-h-[38px] px-2.5 rounded-xl bg-white border border-[#9BE0C4] text-[11px] font-extrabold text-[#1F6B54] shrink-0 inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>圖卡</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#5A423C] leading-snug">{ms.description}</p>

                  <div className="flex flex-wrap gap-1.5 text-[10px] font-extrabold">
                    <span className="px-2 py-0.5 rounded-lg bg-white border border-[#D4EFE4] text-[#8A5610] tabular-nums">
                      🪙 +{ms.rewardCoins} 金幣
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white border border-[#D4EFE4] text-[#1F6B54] tabular-nums">
                      ✨ +{ms.rewardGrowth} 成長值
                    </span>
                    {ms.rewardPoseId && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#FFEAF0] border border-[#F4B4CB] text-[#B83B64]">
                        📸 限定拍照姿勢已解鎖
                      </span>
                    )}
                    {ms.rewardFrameId && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#FFF3D8] border border-[#F2CE6D] text-[#8A5610]">
                        🖼️ 限定相框已解鎖
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </section>
          )}

          {incompleteMilestones.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-extrabold text-[#7D635D] px-1">
                ⏳ 尚未完成 ({incompleteMilestones.length})
              </h4>
              {incompleteMilestones.map((ms) => (
                <article
                  key={ms.id}
                  className="rounded-3xl bg-[#FAF4EE] border border-[#E7D8CE] p-3.5 flex items-start gap-2.5 opacity-95"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/80 border border-[#E7D8CE] flex items-center justify-center text-xl shrink-0">
                    <Lock className="w-4 h-4 text-[#A8928B]" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-xs font-extrabold text-[#4A3531] truncate">
                        {ms.emoji} {ms.title}
                      </h5>
                      <span className="text-[10px] font-bold text-[#957B74] shrink-0">
                        自動偵測
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-[#7D635D]">
                      條件：{ms.conditionLabel}
                    </p>
                    <p className="text-[10px] font-extrabold text-[#9D5B12]">
                      獎勵：+{ms.rewardCoins} 金幣 · +{ms.rewardGrowth} 成長值 ·{' '}
                      {ms.rewardCardTitle}
                      {ms.rewardPoseId ? ' · 限定拍照姿勢' : ''}
                      {ms.rewardFrameId ? ' · 限定相框' : ''}
                    </p>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      )}

      {/* SUB-TAB 4: SHARED MEMORIES ("我們的小屋回憶牆") */}
      {subTab === 'shared' && (
        <div className="space-y-3">
          {!sharedRoom ? (
            <section className="rounded-3xl bg-gradient-to-br from-[#FFF0F5] to-[#FFFDF8] border-2 border-[#F4C8D7] p-5 text-center space-y-3">
              <div className="text-4xl">🏡💞</div>
              <h3 className="text-base font-extrabold text-[#4A3531]">
                我們的小屋回憶牆
              </h3>
              <p className="text-xs text-[#6E544E] leading-relaxed">
                建立或加入「兩人共養小屋」後，這裡會自動紀錄兩人共同完成的取名、一起餵食、互相留言、共同買家具與紀念天數，離線也可瀏覽！
              </p>
              {onOpenSharedPet && (
                <button
                  type="button"
                  onClick={onOpenSharedPet}
                  className="min-h-[44px] px-5 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>建立 / 加入共養小屋</span>
                </button>
              )}
            </section>
          ) : (
            <>
              <section className="rounded-3xl bg-gradient-to-r from-[#FFEAF0] to-[#E5F8F0] border-2 border-[#F2C7D6] p-3.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-[#B83B64] flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 shrink-0" />
                    <span>我們的小屋回憶牆</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-xl bg-white/90 text-[11px] font-extrabold text-[#256D57] tabular-nums">
                    {unlockedSharedCount} / {album.sharedMemories.length} 已記錄
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#6E544E]">
                  小屋「{game.house.houseName}」· 邀請碼 {sharedRoom.inviteCode} ·
                  支援離線瀏覽與雙裝置同步通知
                </p>
              </section>

              <div className="space-y-2.5">
                {album.sharedMemories.map((sm) => (
                  <article
                    key={sm.id}
                    className={`rounded-3xl border-2 p-3.5 space-y-2 ${
                      sm.unlocked
                        ? 'bg-[#FFFDF8] border-[#F4C4D3] shadow-xs'
                        : 'bg-[#FAF4EE] border-[#E7D8CE] opacity-90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                            sm.unlocked
                              ? 'bg-[#FFF0F5] border-[#F4C4D3]'
                              : 'bg-white/70 border-[#E7D8CE]'
                          }`}
                        >
                          {sm.unlocked ? sm.emoji : '🔒'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-[#4A3531] truncate">
                            {sm.title}
                          </h4>
                          <p className="text-[11px] font-bold text-[#826862] tabular-nums">
                            {sm.unlocked
                              ? `${sm.dateKey} · ${sm.actors.join(' & ') || '兩人共同完成'}`
                              : `達成獎勵：+${sm.rewardCoins} 金幣 · +${sm.rewardIntimacy} 親密`}
                          </p>
                        </div>
                      </div>

                      {sm.unlocked && (
                        <span className="px-2 py-0.5 rounded-lg bg-[#FFEAF0] text-[10px] font-extrabold text-[#B83B64] shrink-0">
                          ✓ 已達成
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#5A423C] leading-snug">{sm.description}</p>

                    {sm.unlocked && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded-lg bg-[#FFF3D8] border border-[#F2CE6D] text-[10px] font-extrabold text-[#8A5610]">
                          🪪 {sm.rewardCardTitle}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenShareCard({
                              petName: activePet.name,
                              species: activePet.species,
                              title: sm.title,
                              subtitle: `${sm.description}（${sm.actors.join(' & ')}）`,
                              dateLabel: sm.dateKey || '',
                              badgeText: '💞 我們的小屋回憶',
                              emoji: sm.emoji,
                              weight: activePet.weight,
                              level: activePet.level,
                            })
                          }
                          className="min-h-[36px] px-2.5 rounded-xl bg-[#E5F8F0] border border-[#9BE0C4] text-[11px] font-extrabold text-[#1F6B54] inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>紀念圖卡</span>
                        </button>
                        {onShareTextToBoard && (
                          <button
                            type="button"
                            onClick={() => {
                              void onShareTextToBoard(
                                sm.title,
                                `${sm.description}（獲得「${sm.rewardCardTitle}」）`
                              ).then((err) => {
                                handleShareBoardNotice(
                                  err ? err : `已將「${sm.title}」分享給共養夥伴！`
                                );
                              });
                            }}
                            className="min-h-[36px] px-2.5 rounded-xl bg-[#FFEAF0] border border-[#F4B4CB] text-[11px] font-extrabold text-[#B83B64] inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>分享留言板</span>
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
