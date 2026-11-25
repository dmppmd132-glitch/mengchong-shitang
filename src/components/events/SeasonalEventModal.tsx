import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Camera,
  Check,
  Clock,
  Gift,
  HeartHandshake,
  Send,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { STRAWBERRY_SET_ACCESSORY_IDS, STRAWBERRY_SHOP_ITEMS } from '../../data/events/strawberrySeason';
import { INGREDIENTS } from '../../data/kitchen';
import {
  PHOTO_BACKGROUNDS,
  PHOTO_FILTERS,
  PHOTO_FRAMES,
  PHOTO_POSES,
  STUDIO_BADGES,
} from '../../data/photoStudio';
import { getPetSpeciesInfo } from '../../data/species';
import {
  DuoPhotoPetInfo,
  EventMilestoneId,
  EventPhotoScoreBreakdown,
  GameState,
  Pet,
  PetViewDirection,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoStickerId,
  RoomPhotoRecord,
  SharedPetRoom,
} from '../../types';
import { getActivePet } from '../../utils/pets';
import { getPhotoStudioState } from '../../utils/photoStudio';
import {
  createDailyCoopEventSession,
  createInitialSeasonalEvent,
  evaluateEventPhotoScore,
  getEventRemainingText,
  isEventShopItemOwned,
  isStrawberryAccessoryId,
} from '../../utils/seasonalEvent';
import { RoomPhotoCard } from '../house/RoomPhotoCard';

type EventTab = 'tasks' | 'challenge' | 'milestones' | 'shop' | 'coop';

interface SeasonalEventModalProps {
  open: boolean;
  onClose: () => void;
  game: GameState;
  sharedRoom: SharedPetRoom | null;
  currentUserId: string;
  actorName: string;
  onClaimDailyTask: (taskId: string) => { ok: boolean; notice: string };
  onClaimMilestone: (milestoneId: EventMilestoneId) => { ok: boolean; notice: string };
  onBuyShopItem: (shopItemId: string) => { ok: boolean; notice: string };
  onSubmitEventPhotoChallenge: (params: {
    title: string;
    caption: string;
    poseId: PhotoPose;
    backgroundId: PhotoBackground;
    facing: PetViewDirection;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }) => {
    photo: RoomPhotoRecord;
    breakdown: EventPhotoScoreBreakdown;
    unlockedNotices: string[];
  };
  onClaimChallengeTier: (tier: 60 | 100 | 150) => { ok: boolean; notice: string };
  onClaimCoopReward: () => { ok: boolean; notice: string };
  onCreatePicnicPhoto: (partnerPet: DuoPhotoPetInfo) => {
    photo: RoomPhotoRecord | null;
    notice: string;
  };
  onConvertTickets: () => { ok: boolean; notice: string };
  onSelectRecapCoverPhoto: (photoId: string) => void;
  onSaveRecapToMemories: () => { ok: boolean; notice: string };
  onOpenStudioShoot: () => void;
  onOpenEventCatalog: () => void;
  onGoToFarm: () => void;
  onGoToKitchen: () => void;
  onOpenSharedPet: () => void;
  onSharePhotoToBoard?: (photo: RoomPhotoRecord, caption: string) => Promise<string | null>;
}

const CHALLENGE_TIERS: Array<{
  tier: 60 | 100 | 150;
  rewardText: string;
  emoji: string;
}> = [
  { tier: 60, rewardText: '草莓券 ×10 ＋ 金幣 ×50', emoji: '🎟️' },
  { tier: 100, rewardText: '草莓券 ×20 ＋ 限定相框碎片 ×1', emoji: '🖼️' },
  { tier: 150, rewardText: '草莓券 ×30 ＋ 限定姿勢「草莓甜心」', emoji: '✨' },
];

export const SeasonalEventModal: React.FC<SeasonalEventModalProps> = ({
  open,
  onClose,
  game,
  sharedRoom,
  currentUserId,
  onClaimDailyTask,
  onClaimMilestone,
  onBuyShopItem,
  onSubmitEventPhotoChallenge,
  onClaimChallengeTier,
  onClaimCoopReward,
  onCreatePicnicPhoto,
  onConvertTickets,
  onSelectRecapCoverPhoto,
  onSaveRecapToMemories,
  onOpenStudioShoot,
  onOpenEventCatalog,
  onGoToFarm,
  onGoToKitchen,
  onOpenSharedPet,
  onSharePhotoToBoard,
}) => {
  const [activeTab, setActiveTab] = useState<EventTab>('tasks');
  const [showRecapPanel, setShowRecapPanel] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('');
  const [sharingPhotoId, setSharingPhotoId] = useState<string | null>(null);

  const event = game.seasonalEvent ?? createInitialSeasonalEvent();
  const activePet = getActivePet(game);
  const studio = getPhotoStudioState(game);
  const isEnded = event.status === 'ended';

  const ownedPoses = useMemo(
    () =>
      PHOTO_POSES.filter(
        (p) =>
          p.source === 'free' ||
          studio.unlockedPoses.includes(p.id) ||
          game.memoryAlbum.unlockedPhotoPoses.includes(p.id)
      ),
    [studio.unlockedPoses, game.memoryAlbum.unlockedPhotoPoses]
  );

  const ownedBgs = useMemo(
    () =>
      PHOTO_BACKGROUNDS.filter(
        (b) => b.source === 'free' || studio.unlockedBackgrounds.includes(b.id)
      ),
    [studio.unlockedBackgrounds]
  );

  const ownedFilters = useMemo(
    () =>
      PHOTO_FILTERS.filter(
        (f) => f.id === 'none' || studio.unlockedFilters.includes(f.id)
      ),
    [studio.unlockedFilters]
  );

  const ownedFrames = useMemo(
    () =>
      PHOTO_FRAMES.filter(
        (f) =>
          f.id === 'none' ||
          studio.unlockedFrames.includes(f.id) ||
          game.memoryAlbum.unlockedPhotoFrames.includes(f.id)
      ),
    [studio.unlockedFrames, game.memoryAlbum.unlockedPhotoFrames]
  );

  const [challengePoseId, setChallengePoseId] = useState<PhotoPose>('happy');
  const [challengeBgId, setChallengeBgId] = useState<PhotoBackground>('strawberry_field');
  const [challengeFilterId, setChallengeFilterId] = useState<PhotoFilter>('none');
  const [challengeFrameId, setChallengeFrameId] = useState<PhotoFrame>('none');
  const [challengeTitle, setChallengeTitle] = useState<string>('');
  const [partnerIndex, setPartnerIndex] = useState<number>(0);

  useEffect(() => {
    if (!open) return;
    setNotice('');
    setShowRecapPanel(isEnded);
    const defaultBg: PhotoBackground = ownedBgs.some((b) => b.id === 'strawberry_season_field')
      ? 'strawberry_season_field'
      : 'strawberry_field';
    setChallengeBgId(defaultBg);
    setChallengePoseId(
      ownedPoses.some((p) => p.id === 'strawberry_sweetheart')
        ? 'strawberry_sweetheart'
        : 'happy'
    );
    setChallengeFilterId(
      ownedFilters.some((f) => f.id === 'strawberry') ? 'strawberry' : 'none'
    );
    setChallengeFrameId(
      ownedFrames.some((f) => f.id === 'strawberry_polaroid')
        ? 'strawberry_polaroid'
        : ownedFrames[0]?.id ?? 'none'
    );
    setChallengeTitle(`草莓季寫真・${activePet.name}`.slice(0, 20));
  }, [open, isEnded, activePet.name, ownedBgs, ownedPoses, ownedFilters, ownedFrames]);

  const partnerCandidates = useMemo<Pet[]>(() => {
    const list: Pet[] = [];
    const seen = new Set<string>();
    for (const p of game.coop.partnerShowcasePets ?? []) {
      if (p.id !== activePet.id && !seen.has(p.id)) {
        seen.add(p.id);
        list.push(p);
      }
    }
    for (const p of game.pets) {
      if (p.id !== activePet.id && !seen.has(p.id)) {
        seen.add(p.id);
        list.push(p);
      }
    }
    if (list.length === 0) {
      list.push({
        ...activePet,
        id: 'coop_strawberry_partner',
        name: sharedRoom?.partnerEmail?.split('@')[0]
          ? `${sharedRoom.partnerEmail.split('@')[0].slice(0, 4)}的寶貝`
          : '夥伴甜心',
        species: activePet.species === 'rabbit' ? 'cat' : 'rabbit',
      });
    }
    return list;
  }, [game.coop.partnerShowcasePets, game.pets, activePet, sharedRoom]);

  const selectedPartnerPet =
    partnerCandidates[partnerIndex % partnerCandidates.length] ?? partnerCandidates[0];

  if (!open) return null;

  const remainingText = getEventRemainingText(event);
  const claimableTasksCount = event.dailyTasks.filter((t) => t.completed && !t.claimed).length;
  const claimableMilestonesCount = event.milestones.filter(
    (m) => m.completed && !m.claimed
  ).length;
  const coopSession =
    game.coop.coopEventSession ?? createDailyCoopEventSession(event.dailyDate);
  const actorKey = currentUserId || 'local';
  const coopClaimedByMe = coopSession.claimedByUserIds.includes(actorKey);
  const coopCanClaim = Boolean(sharedRoom) && coopSession.completed && !coopClaimedByMe;
  const recentCoopEventLogs = game.coop.offlineEvents
    .filter((ev) => ev.gameType === 'event_coop')
    .slice(0, 3);

  const fedThisWeek = event.fedStrawberryFoodWeekKey === event.weeklyChallenge.weekKey;
  const liveBreakdown = evaluateEventPhotoScore({
    equipped: activePet.accessories,
    backgroundId: challengeBgId,
    filterId: challengeFilterId,
    frameId: challengeFrameId,
    fedStrawberryFoodThisWeek: fedThisWeek,
  });

  const equippedStrawberryAccCount = Object.values(activePet.accessories).filter((id) =>
    isStrawberryAccessoryId(id)
  ).length;
  const equippedFullSetCount = STRAWBERRY_SET_ACCESSORY_IDS.filter((reqId) =>
    Object.values(activePet.accessories).includes(reqId)
  ).length;

  const lastChallengePhoto = event.weeklyChallenge.lastPhotoId
    ? game.house.photos.find((p) => p.id === event.weeklyChallenge.lastPhotoId) ?? null
    : null;
  const picnicPhoto = coopSession.picnicPhotoId
    ? game.house.photos.find((p) => p.id === coopSession.picnicPhotoId) ?? null
    : null;

  const eventPhotos = game.house.photos.filter((p) => event.eventPhotoIds.includes(p.id));
  const coverPhotoId = event.recap.coverPhotoId ?? event.recap.bestPhotoId;
  const coverPhoto = coverPhotoId
    ? game.house.photos.find((p) => p.id === coverPhotoId) ?? null
    : null;

  const handleSubmitChallenge = () => {
    const res = onSubmitEventPhotoChallenge({
      title: challengeTitle.trim().slice(0, 20) || `草莓季寫真・${activePet.name}`.slice(0, 20),
      caption: `草莓甜心造型參加每週寫真挑戰，獲得 ${liveBreakdown.totalScore} 分！`,
      poseId: challengePoseId,
      backgroundId: challengeBgId,
      facing: 'front',
      filterId: challengeFilterId,
      frameId: challengeFrameId,
      stickers: studio.unlockedStickers.includes('strawberry') ? ['strawberry'] : [],
    });
    const extra = res.unlockedNotices.length > 0 ? ` · ${res.unlockedNotices.join(' ')}` : '';
    setNotice(`📸 已提交草莓季挑戰！獲得 ${res.breakdown.totalScore} 分${extra}`);
  };

  const handleSharePhoto = async (photo: RoomPhotoRecord, caption: string) => {
    if (!onSharePhotoToBoard || sharingPhotoId) return;
    setSharingPhotoId(photo.id);
    const err = await onSharePhotoToBoard(photo, caption);
    setSharingPhotoId(null);
    setNotice(err ? `分享失敗：${err}` : '💌 已將草莓季美照分享至共養留言板！');
  };

  const handleCreatePicnic = () => {
    if (!selectedPartnerPet) return;
    const partnerInfo: DuoPhotoPetInfo = {
      petId: selectedPartnerPet.id,
      petName: selectedPartnerPet.name,
      species: selectedPartnerPet.species,
      equipped: { ...selectedPartnerPet.accessories },
      poseId: 'strawberry_sweetheart',
      facing: 'front',
    };
    const res = onCreatePicnicPhoto(partnerInfo);
    setNotice(res.notice);
  };

  const handleQuickTaskJump = (kind: string) => {
    if (kind === 'plant_strawberry') {
      onClose();
      onGoToFarm();
    } else if (kind === 'cook_strawberry') {
      onClose();
      onGoToKitchen();
    } else if (kind === 'photo_strawberry') {
      setActiveTab('challenge');
    } else if (kind === 'coop_event_task') {
      setActiveTab('coop');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-label="草莓季活動中心"
    >
      <div className="w-full max-w-[430px] max-h-[92dvh] bg-[#FFF8F4] rounded-t-3xl sm:rounded-3xl border-2 border-[#F6C8D7] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFE3EE] via-[#FFF0F5] to-[#FFE8D6] px-4 pt-3.5 pb-3 border-b-2 border-[#F5CAD9] shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xl" aria-hidden="true">🍓</span>
                <h2 className="text-base font-extrabold text-[#7D2143] truncate">
                  {event.name}・限定攝影季
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                    isEnded
                      ? 'bg-[#EAE0DC] text-[#6E544E]'
                      : 'bg-[#FF6B97] text-white'
                  }`}
                >
                  {isEnded ? '已結束' : '14天慶典'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#9A4B67] mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{remainingText}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowRecapPanel((v) => !v)}
                className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                  showRecapPanel
                    ? 'bg-[#7D2143] border-[#7D2143] text-white'
                    : 'bg-white/90 border-[#F2BDCE] text-[#9A2D54]'
                }`}
              >
                {isEnded ? '活動回顧' : '戰績回顧'}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="關閉草莓季活動視窗"
                className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/90 border border-[#F2BDCE] text-[#6E3B4E] flex items-center justify-center hover:bg-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="mt-2 text-[11px] font-medium text-[#6B4854] leading-relaxed">
            {event.description}
          </p>

          {/* Currency & Quick Catalog Bar */}
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-2xl bg-white/90 border border-[#F3C8D7] px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0" aria-hidden="true">🍓</span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-[#9A4B67]">活動代幣 · 草莓券</div>
                <div className="text-sm font-extrabold text-[#C43463] tabular-nums">
                  {event.currency.balance} 張
                  <span className="ml-1.5 text-[10px] font-bold text-[#8B6A75]">
                    （累計 {event.currency.totalEarned}）
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEventCatalog();
              }}
              className="min-h-[36px] px-2.5 rounded-xl bg-[#FFF2F6] border border-[#F2BDCE] text-[11px] font-extrabold text-[#B83B64] inline-flex items-center gap-1 shrink-0 hover:bg-[#FFE4EE] active:scale-95 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>活動圖鑑</span>
            </button>
          </div>
        </div>

        {/* Notice Toast */}
        {notice && (
          <div className="mx-3 mt-2.5 rounded-2xl bg-[#E8F8F2] border border-[#96DFC2] px-3 py-2 text-xs font-extrabold text-[#1E6A52] flex items-center justify-between gap-2 shrink-0">
            <span className="break-words">{notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
              aria-label="關閉提示"
              className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-[#1E6A52]/70 hover:text-[#1E6A52] shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Recap / End-of-event Settlement Panel */}
        {(showRecapPanel || isEnded) && (
          <div className="mx-3 mt-2.5 rounded-3xl bg-gradient-to-br from-[#FFF4F8] to-[#FFF9EE] border-2 border-[#F4C2D4] p-3.5 space-y-3 shrink-0 max-h-[42dvh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold text-[#7D2143] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF6B97]" />
                <span>{isEnded ? '🍓 草莓季圓滿落幕・活動回顧' : '🍓 草莓季戰績回顧預覽'}</span>
              </h3>
              {!isEnded && (
                <button
                  type="button"
                  onClick={() => setShowRecapPanel(false)}
                  className="text-[11px] font-extrabold text-[#9A4B67]"
                >
                  收合
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white border border-[#F3D8E1] p-2">
                <div className="text-[10px] font-bold text-[#8A6D76]">完成任務</div>
                <div className="text-sm font-extrabold text-[#C43463] tabular-nums">
                  {event.recap.completedTasksCount}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-[#F3D8E1] p-2">
                <div className="text-[10px] font-bold text-[#8A6D76]">獲得草莓券</div>
                <div className="text-sm font-extrabold text-[#C43463] tabular-nums">
                  {event.recap.totalTicketsEarned}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-[#F3D8E1] p-2">
                <div className="text-[10px] font-bold text-[#8A6D76]">草莓主題照</div>
                <div className="text-sm font-extrabold text-[#C43463] tabular-nums">
                  {event.recap.photosTakenCount}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-[#F3D8E1] p-2">
                <div className="text-[10px] font-bold text-[#8A6D76]">草莓配件</div>
                <div className="text-sm font-extrabold text-[#4A3531] tabular-nums">
                  {event.recap.accessoriesCollectedCount}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-[#F3D8E1] p-2">
                <div className="text-[10px] font-bold text-[#8A6D76]">草莓料理</div>
                <div className="text-sm font-extrabold text-[#4A3531] tabular-nums">
                  {event.recap.recipesCookedCount}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-[#F3D8E1] p-2">
                <div className="text-[10px] font-bold text-[#8A6D76]">共養派對</div>
                <div className="text-sm font-extrabold text-[#1F6B54] tabular-nums">
                  {event.recap.coopCompletedCount}
                </div>
              </div>
            </div>

            {eventPhotos.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-extrabold text-[#6E4552]">
                  挑選回顧封面照片（{eventPhotos.length} 張草莓主題照）
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {eventPhotos.slice(0, 8).map((p) => {
                    const selected = p.id === coverPhotoId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectRecapCoverPhoto(p.id);
                          setNotice(`已選擇「${p.title}」作為草莓季回顧封面！`);
                        }}
                        className={`min-h-[36px] px-2.5 rounded-xl border text-[11px] font-extrabold whitespace-nowrap shrink-0 transition ${
                          selected
                            ? 'bg-[#FF6B97] border-[#FF6B97] text-white'
                            : 'bg-white border-[#F2D5DF] text-[#5A3E36]'
                        }`}
                      >
                        📸 {p.title}
                      </button>
                    );
                  })}
                </div>
                {coverPhoto && <RoomPhotoCard photo={coverPhoto} compact currentUserId={currentUserId} />}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const res = onSaveRecapToMemories();
                  setNotice(res.notice);
                }}
                className="flex-1 min-h-[44px] px-3 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_2px_0_#D45276] active:scale-95 transition"
              >
                {event.recap.savedToMemories ? '✨ 更新回憶冊回顧卡' : '📖 存入回憶冊回顧卡'}
              </button>
              {isEnded && event.currency.balance > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const res = onConvertTickets();
                    setNotice(res.notice);
                  }}
                  className="flex-1 min-h-[44px] px-3 rounded-2xl bg-[#F8C956] text-[#4A3531] text-xs font-extrabold shadow-[0_2px_0_#D3A02B] active:scale-95 transition"
                >
                  🪙 轉換 {event.currency.balance} 張剩餘券
                </button>
              )}
            </div>

            {isEnded && (
              <div className="rounded-2xl bg-white/90 border border-[#F3D8E1] px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-bold text-[#6E544E]">
                  未取得的限定品已收錄於活動圖鑑，可查看取得方式。
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEventCatalog();
                  }}
                  className="min-h-[34px] px-2.5 rounded-xl bg-[#FFEAF0] text-[#B83B64] font-extrabold whitespace-nowrap shrink-0"
                >
                  前往圖鑑 ›
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div
          className="px-3 pt-2.5 pb-1.5 grid grid-cols-5 gap-1 shrink-0 border-b border-[#F4DDE5]"
          role="tablist"
          aria-label="草莓季功能頁籤"
        >
          {(
            [
              { id: 'tasks', label: '任務', icon: Gift, badge: claimableTasksCount },
              { id: 'challenge', label: '攝影挑戰', icon: Camera, badge: 0 },
              { id: 'milestones', label: '里程碑', icon: Trophy, badge: claimableMilestonesCount },
              { id: 'shop', label: '商店', icon: ShoppingBag, badge: 0 },
              { id: 'coop', label: '共養派對', icon: HeartHandshake, badge: coopCanClaim ? 1 : 0 },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`relative min-h-[44px] px-1 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition ${
                  active
                    ? 'bg-[#FF6B97] text-white shadow-xs'
                    : 'bg-white border border-[#F3DDE5] text-[#6E4D57] hover:bg-[#FFF0F5]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate max-w-full">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#3BA886] text-white text-[9px] font-extrabold flex items-center justify-center tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* 1. DAILY TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-2.5">
              <div className="rounded-2xl bg-[#FFF0F5] border border-[#F5C9D7] px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-extrabold text-[#8E2B4E]">
                  今日任務（{event.dailyDate} · 每天隨機開放 4 項）
                </span>
                <span className="font-bold text-[#9A4B67] tabular-nums">
                  收成草莓 +2券 · 料理 +3券 · 拍照 +5券
                </span>
              </div>

              {event.dailyTasks.map((task) => {
                const pct = Math.min(100, Math.round((task.progress / task.target) * 100));
                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border-2 p-3 space-y-2 ${
                      task.claimed
                        ? 'bg-[#F8F4F2] border-[#E7DCD7] opacity-80'
                        : task.completed
                        ? 'bg-[#F0FBF6] border-[#96DFC2]'
                        : 'bg-white border-[#F3DDE5]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-xl shrink-0">{task.emoji}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-[#4A3531]">
                            {task.title}
                          </h4>
                          <p className="text-[11px] font-medium text-[#7D635D]">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-[#9A4B67] tabular-nums shrink-0">
                        {task.progress}/{task.target}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#F3E4EA] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF7A9E] to-[#5CC9A7] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-[11px] font-bold text-[#6E544E] flex items-center gap-1.5 flex-wrap">
                        <span className="text-[#C43463] font-extrabold">
                          🍓 +{task.rewardTickets} 券
                        </span>
                        <span>🪙 +{task.rewardCoins}</span>
                        {task.rewardIngredientId && task.rewardIngredientQty && (
                          <span>
                            {INGREDIENTS[task.rewardIngredientId].emoji} +
                            {task.rewardIngredientQty}
                          </span>
                        )}
                        {task.rewardStudioMaterials && (
                          <span>🎞️ 材料 +{task.rewardStudioMaterials}</span>
                        )}
                      </div>

                      {task.claimed ? (
                        <span className="min-h-[36px] px-3 rounded-xl bg-[#E4ECE8] text-[#457263] text-[11px] font-extrabold inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>已領取</span>
                        </span>
                      ) : task.completed ? (
                        <button
                          type="button"
                          disabled={isEnded}
                          onClick={() => {
                            const res = onClaimDailyTask(task.id);
                            setNotice(res.notice);
                          }}
                          className="min-h-[40px] px-3.5 rounded-xl bg-[#3BA886] text-white text-xs font-extrabold shadow-[0_2px_0_#298064] active:scale-95 transition disabled:opacity-50"
                        >
                          領取獎勵
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickTaskJump(task.kind)}
                          className="min-h-[36px] px-3 rounded-xl bg-[#FFF2F6] border border-[#F2BDCE] text-[11px] font-extrabold text-[#B83B64] active:scale-95 transition"
                        >
                          {task.kind === 'plant_strawberry'
                            ? '去種草莓 ›'
                            : task.kind === 'cook_strawberry'
                            ? '去廚房 ›'
                            : task.kind === 'photo_strawberry'
                            ? '去拍照 ›'
                            : task.kind === 'coop_event_task'
                            ? '看派對 ›'
                            : '進行中'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. WEEKLY PHOTO CHALLENGE */}
          {activeTab === 'challenge' && (
            <div className="space-y-3">
              <div className="rounded-3xl bg-gradient-to-br from-[#FFF0F6] to-[#FFF7E6] border-2 border-[#F4C2D4] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#8E2B4E]">
                      📸 {event.weeklyChallenge.title}
                    </h3>
                    <p className="text-[11px] font-medium text-[#6B4854] mt-0.5">
                      {event.weeklyChallenge.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-bold text-[#8B6A75]">本週最高</div>
                    <div className="text-base font-extrabold text-[#C43463] tabular-nums">
                      {event.weeklyChallenge.bestScore} 分
                    </div>
                  </div>
                </div>

                {/* Streak rewards */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-2xl bg-white/90 border border-[#F3D8E1] px-2.5 py-2">
                    <div className="text-[10px] font-extrabold text-[#9A4B67]">
                      {STUDIO_BADGES.strawberry_photographer.emoji} 連續 2 週 ≥100 分
                    </div>
                    <div className="text-[11px] font-extrabold text-[#4A3531] mt-0.5 tabular-nums">
                      {studio.unlockedStudioBadges.includes('strawberry_photographer')
                        ? '✅ 已獲「草莓攝影師」'
                        : `進度 ${Math.min(2, event.consecutiveChallengeWeeks)}/2 週`}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/90 border border-[#F3D8E1] px-2.5 py-2">
                    <div className="text-[10px] font-extrabold text-[#9A4B67]">
                      👑 連續 3 週 ≥100 分
                    </div>
                    <div className="text-[11px] font-extrabold text-[#4A3531] mt-0.5 tabular-nums">
                      {game.encyclopedia.unlockedTitles.includes('strawberry_fashionista')
                        ? '✅ 已獲「草莓時尚家」'
                        : `進度 ${Math.min(3, event.consecutiveChallengeWeeks)}/3 週`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Score Checklist */}
              <div className="rounded-2xl bg-white border-2 border-[#F3DDE5] p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#4A3531]">
                    目前穿搭預估評分（個人分數制）
                  </span>
                  <span className="px-2.5 py-0.5 rounded-xl bg-[#FFEAF0] text-[#C43463] text-xs font-extrabold tabular-nums">
                    {liveBreakdown.totalScore} 分
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div
                    className={`rounded-xl px-2.5 py-1.5 border font-bold ${
                      equippedStrawberryAccCount > 0
                        ? 'bg-[#F0FBF6] border-[#96DFC2] text-[#1E6A52]'
                        : 'bg-[#FAF5F2] border-[#EFE1DA] text-[#7D635D]'
                    }`}
                  >
                    🍓 草莓配件 +10/件（目前 {equippedStrawberryAccCount} 件 · +
                    {liveBreakdown.strawberryAccPoints}）
                  </div>
                  <div
                    className={`rounded-xl px-2.5 py-1.5 border font-bold ${
                      liveBreakdown.backgroundMatched
                        ? 'bg-[#F0FBF6] border-[#96DFC2] text-[#1E6A52]'
                        : 'bg-[#FAF5F2] border-[#EFE1DA] text-[#7D635D]'
                    }`}
                  >
                    🏞️ 草莓田背景 +20（{liveBreakdown.backgroundMatched ? '已達成' : '未選擇'}）
                  </div>
                  <div
                    className={`rounded-xl px-2.5 py-1.5 border font-bold ${
                      liveBreakdown.filterMatched
                        ? 'bg-[#F0FBF6] border-[#96DFC2] text-[#1E6A52]'
                        : 'bg-[#FAF5F2] border-[#EFE1DA] text-[#7D635D]'
                    }`}
                  >
                    🎨 草莓濾鏡 +10（{liveBreakdown.filterMatched ? '已套用' : '未套用'}）
                  </div>
                  <div
                    className={`rounded-xl px-2.5 py-1.5 border font-bold ${
                      liveBreakdown.frameMatched
                        ? 'bg-[#F0FBF6] border-[#96DFC2] text-[#1E6A52]'
                        : 'bg-[#FAF5F2] border-[#EFE1DA] text-[#7D635D]'
                    }`}
                  >
                    🖼️ 拍立得相框 +10（{liveBreakdown.frameMatched ? '已套用' : '未套用'}）
                  </div>
                  <div
                    className={`rounded-xl px-2.5 py-1.5 border font-bold ${
                      liveBreakdown.fedStrawberryFood
                        ? 'bg-[#F0FBF6] border-[#96DFC2] text-[#1E6A52]'
                        : 'bg-[#FAF5F2] border-[#EFE1DA] text-[#7D635D]'
                    }`}
                  >
                    🧁 餵草莓食物 +15（{liveBreakdown.fedStrawberryFood ? '本週已餵' : '待餵食'}）
                  </div>
                  <div
                    className={`rounded-xl px-2.5 py-1.5 border font-bold ${
                      liveBreakdown.fullSetCompleted
                        ? 'bg-[#F0FBF6] border-[#96DFC2] text-[#1E6A52]'
                        : 'bg-[#FAF5F2] border-[#EFE1DA] text-[#7D635D]'
                    }`}
                  >
                    👗 草莓甜心 4 件套 +30（{equippedFullSetCount}/4）
                  </div>
                </div>

                {/* Quick Studio Controls */}
                <div className="pt-1 space-y-2 border-t border-[#F4E6DF]">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-[11px] font-bold text-[#6E544E] space-y-1">
                      <span>姿勢</span>
                      <select
                        value={challengePoseId}
                        onChange={(e) => setChallengePoseId(e.target.value as PhotoPose)}
                        className="w-full min-h-[40px] rounded-xl bg-[#FFF8F4] border border-[#EAD4DC] px-2 text-xs font-bold text-[#4A3531]"
                      >
                        {ownedPoses.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.emoji} {p.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-[11px] font-bold text-[#6E544E] space-y-1">
                      <span>背景</span>
                      <select
                        value={challengeBgId}
                        onChange={(e) => setChallengeBgId(e.target.value as PhotoBackground)}
                        className="w-full min-h-[40px] rounded-xl bg-[#FFF8F4] border border-[#EAD4DC] px-2 text-xs font-bold text-[#4A3531]"
                      >
                        {ownedBgs.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.emoji} {b.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-[11px] font-bold text-[#6E544E] space-y-1">
                      <span>濾鏡</span>
                      <select
                        value={challengeFilterId}
                        onChange={(e) => setChallengeFilterId(e.target.value as PhotoFilter)}
                        className="w-full min-h-[40px] rounded-xl bg-[#FFF8F4] border border-[#EAD4DC] px-2 text-xs font-bold text-[#4A3531]"
                      >
                        {ownedFilters.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.emoji} {f.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-[11px] font-bold text-[#6E544E] space-y-1">
                      <span>相框</span>
                      <select
                        value={challengeFrameId}
                        onChange={(e) => setChallengeFrameId(e.target.value as PhotoFrame)}
                        className="w-full min-h-[40px] rounded-xl bg-[#FFF8F4] border border-[#EAD4DC] px-2 text-xs font-bold text-[#4A3531]"
                      >
                        {ownedFrames.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.emoji} {f.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <input
                    type="text"
                    maxLength={20}
                    value={challengeTitle}
                    onChange={(e) => setChallengeTitle(e.target.value)}
                    placeholder="輸入寫真標題（最多 20 字）"
                    className="w-full min-h-[40px] rounded-xl bg-[#FFF8F4] border border-[#EAD4DC] px-3 text-xs font-bold text-[#4A3531]"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isEnded}
                      onClick={handleSubmitChallenge}
                      className="flex-1 min-h-[44px] px-3 rounded-2xl bg-[#FF6B97] text-white text-xs font-extrabold shadow-[0_2px_0_#D14772] active:scale-95 transition disabled:opacity-50"
                    >
                      📸 提交挑戰寫真（+5 券）
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStudioShoot();
                      }}
                      className="min-h-[44px] px-3 rounded-2xl bg-[#FFF2F6] border border-[#F2BDCE] text-xs font-extrabold text-[#B83B64] whitespace-nowrap shrink-0 active:scale-95 transition"
                    >
                      進階攝影棚 ›
                    </button>
                  </div>
                </div>
              </div>

              {/* Claimable Score Tiers */}
              <div className="space-y-2">
                {CHALLENGE_TIERS.map(({ tier, rewardText, emoji }) => {
                  const reached = event.weeklyChallenge.bestScore >= tier;
                  const claimed = event.weeklyChallenge.claimedTiers.includes(tier);
                  return (
                    <div
                      key={tier}
                      className={`rounded-2xl border-2 px-3 py-2.5 flex items-center justify-between gap-2 ${
                        claimed
                          ? 'bg-[#F8F4F2] border-[#E7DCD7]'
                          : reached
                          ? 'bg-[#F0FBF6] border-[#96DFC2]'
                          : 'bg-white border-[#F3DDE5]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#4A3531]">
                          {emoji} 達成 {tier} 分獎勵
                        </div>
                        <div className="text-[11px] font-bold text-[#7D635D] truncate">
                          {rewardText}
                        </div>
                      </div>
                      {claimed ? (
                        <span className="px-2.5 py-1 rounded-xl bg-[#E4ECE8] text-[#457263] text-[11px] font-extrabold shrink-0">
                          已領取
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!reached}
                          onClick={() => {
                            const res = onClaimChallengeTier(tier);
                            setNotice(res.notice);
                          }}
                          className={`min-h-[40px] px-3 rounded-xl text-xs font-extrabold shrink-0 transition ${
                            reached
                              ? 'bg-[#3BA886] text-white shadow-[0_2px_0_#298064] active:scale-95'
                              : 'bg-[#EEE4DF] text-[#9C867F]'
                          }`}
                        >
                          {reached ? '領取' : `差 ${tier - event.weeklyChallenge.bestScore} 分`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {lastChallengePhoto && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold text-[#6E4552]">
                    本週最新參賽寫真
                  </div>
                  <RoomPhotoCard
                    photo={lastChallengePhoto}
                    compact
                    currentUserId={currentUserId}
                  />
                </div>
              )}
            </div>
          )}

          {/* 3. MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="space-y-2.5">
              {event.milestones.map((m) => {
                const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
                return (
                  <div
                    key={m.id}
                    className={`rounded-2xl border-2 p-3 space-y-2 ${
                      m.claimed
                        ? 'bg-[#F8F4F2] border-[#E7DCD7]'
                        : m.completed
                        ? 'bg-[#F0FBF6] border-[#96DFC2]'
                        : 'bg-white border-[#F3DDE5]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-xl shrink-0">{m.emoji}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-[#4A3531]">
                            {m.title}
                          </h4>
                          <p className="text-[11px] font-medium text-[#7D635D]">
                            {m.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-[#9A4B67] tabular-nums shrink-0">
                        {m.progress}/{m.target}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#F3E4EA] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF7A9E] to-[#FFD166] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#B83B64] min-w-0">
                        🎁 {m.rewardSummary}
                      </span>
                      {m.claimed ? (
                        <span className="px-2.5 py-1 rounded-xl bg-[#E4ECE8] text-[#457263] text-[11px] font-extrabold shrink-0">
                          已完成
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!m.completed}
                          onClick={() => {
                            const res = onClaimMilestone(m.id);
                            setNotice(res.notice);
                          }}
                          className={`min-h-[40px] px-3 rounded-xl text-xs font-extrabold shrink-0 transition ${
                            m.completed
                              ? 'bg-[#3BA886] text-white shadow-[0_2px_0_#298064] active:scale-95'
                              : 'bg-[#EEE4DF] text-[#9C867F]'
                          }`}
                        >
                          {m.completed ? '領取' : '進行中'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. STRAWBERRY SHOP */}
          {activeTab === 'shop' && (
            <div className="space-y-2.5">
              <div className="rounded-2xl bg-[#FFF0F5] border border-[#F5C9D7] px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-bold text-[#8E2B4E]">
                  使用「🍓 草莓券」兌換限定精品，兌換後收錄於配件/攝影棚/活動圖鑑
                </span>
                <span className="font-extrabold text-[#C43463] tabular-nums shrink-0">
                  餘額 {event.currency.balance} 張
                </span>
              </div>

              {STRAWBERRY_SHOP_ITEMS.map((item) => {
                const owned = isEventShopItemOwned(game, item);
                const canAfford = event.currency.balance >= item.ticketPrice;
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border-2 p-3 flex items-center justify-between gap-2.5 ${
                      owned
                        ? 'bg-[#F6FBF8] border-[#BCE6D4]'
                        : 'bg-white border-[#F3DDE5]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="w-10 h-10 rounded-2xl bg-[#FFF2F6] border border-[#F3C8D7] flex items-center justify-center text-xl shrink-0">
                        {item.emoji}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-extrabold text-[#4A3531]">
                            {item.name}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded-md bg-[#FFF2F6] text-[#B83B64] text-[10px] font-extrabold">
                            {item.badgeText}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#7D635D] mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {owned ? (
                      <span className="min-h-[38px] px-3 rounded-xl bg-[#E3F7F0] border border-[#AEE3D0] text-[#1F6B54] text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        <span>已擁有</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford || isEnded}
                        onClick={() => {
                          const res = onBuyShopItem(item.id);
                          setNotice(res.notice);
                        }}
                        className={`min-h-[44px] px-3 rounded-xl text-xs font-extrabold shrink-0 transition tabular-nums ${
                          canAfford && !isEnded
                            ? 'bg-[#FF6B97] text-white shadow-[0_2px_0_#D14772] active:scale-95'
                            : 'bg-[#EEE4DF] text-[#9C867F]'
                        }`}
                      >
                        🍓 {item.ticketPrice} 兌換
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. CO-OP STRAWBERRY PARTY */}
          {activeTab === 'coop' && (
            <div className="space-y-3">
              {!sharedRoom ? (
                <div className="rounded-3xl bg-white border-2 border-[#F3C8D7] p-4 text-center space-y-3">
                  <div className="text-3xl">💞🍓</div>
                  <h3 className="text-sm font-extrabold text-[#4A3531]">
                    共養限定合作任務「草莓派對」
                  </h3>
                  <p className="text-xs font-medium text-[#6E544E] leading-relaxed">
                    建立或加入兩人共養小屋後，每天可一起完成採收草莓、料理草莓甜品與雙人拍照，領取完全相同的獎勵並解鎖「草莓野餐合照」與專屬徽章！
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSharedPet();
                    }}
                    className="w-full min-h-[44px] rounded-2xl bg-[#FF6B97] text-white text-xs font-extrabold shadow-[0_2px_0_#D14772] inline-flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <Users className="w-4 h-4" />
                    <span>前往建立 / 加入共養小屋 ›</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="rounded-3xl bg-gradient-to-br from-[#FFF0F5] via-[#FFF9EE] to-[#E8F8F2] border-2 border-[#AEE3D0] p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-extrabold text-[#1F6B54] flex items-center gap-1">
                          <HeartHandshake className="w-4 h-4 text-[#D64470]" />
                          <span>{coopSession.title}</span>
                        </h3>
                        <p className="text-[11px] font-medium text-[#5A423C] mt-0.5">
                          {coopSession.description}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-white border border-[#96DFC2] text-[10px] font-extrabold text-[#1F6B54] shrink-0 tabular-nums">
                        連勝 {event.coopStreakDays}/3 天
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="rounded-xl bg-white/90 border border-[#E5ECE8] px-3 py-2 flex items-center justify-between">
                        <span className="font-bold text-[#4A3531]">🍓 共同收成草莓</span>
                        <span className="font-extrabold text-[#C43463] tabular-nums">
                          {coopSession.harvestCount}/{coopSession.harvestTarget}
                        </span>
                      </div>
                      <div className="rounded-xl bg-white/90 border border-[#E5ECE8] px-3 py-2 flex items-center justify-between">
                        <span className="font-bold text-[#4A3531]">🧁 共同烘焙草莓料理</span>
                        <span className="font-extrabold text-[#C43463] tabular-nums">
                          {coopSession.cookCount}/{coopSession.cookTarget}
                        </span>
                      </div>
                      <div className="rounded-xl bg-white/90 border border-[#E5ECE8] px-3 py-2 flex items-center justify-between">
                        <span className="font-bold text-[#4A3531]">📸 各自拍 1 張草莓主題照</span>
                        <span className="font-extrabold text-[#C43463] tabular-nums">
                          {coopSession.photoCount}/{coopSession.photoTarget}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/85 border border-[#F3C8D7] px-3 py-2 text-[11px] font-bold text-[#6E4552]">
                      雙方完全相同獎勵：🍓 +8 草莓券、🪙 +100 金幣、🎞️ +1 攝影材料、💞 +4 親密度
                      {coopSession.lastUpdatedByName && (
                        <span className="block text-[10px] text-[#1F6B54] mt-0.5">
                          最近更新：{coopSession.lastUpdatedByName}
                        </span>
                      )}
                    </div>

                    {coopClaimedByMe ? (
                      <div className="min-h-[42px] rounded-2xl bg-[#E3F7F0] border border-[#9BE0C4] text-[#1F6B54] text-xs font-extrabold flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>今日已領取草莓派對獎勵！</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!coopSession.completed}
                        onClick={() => {
                          const res = onClaimCoopReward();
                          setNotice(res.notice);
                        }}
                        className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold transition ${
                          coopSession.completed
                            ? 'bg-[#3BA886] text-white shadow-[0_2px_0_#298064] active:scale-95'
                            : 'bg-[#E9DFDA] text-[#8E7A73]'
                        }`}
                      >
                        {coopSession.completed
                          ? '🎁 領取雙方共享草莓派對獎勵'
                          : '合作達成 3 項目標後即可領取'}
                      </button>
                    )}

                    <div className="rounded-2xl bg-white/85 border border-[#E5CEF5] px-3 py-2 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#5D3D7A]">
                        <Award className="w-3.5 h-3.5 inline mr-1" />
                        連續 3 天完成「草莓派對」
                      </span>
                      <span className="font-extrabold text-[#8A46B5]">
                        {game.coop.unlockedBadges.includes('strawberry_sweetheart_partner')
                          ? '✅ 已解鎖「草莓甜心搭檔」'
                          : `${Math.min(3, event.coopStreakDays)}/3 天`}
                      </span>
                    </div>
                  </div>

                  {/* Picnic Photo Section */}
                  <div className="rounded-2xl bg-white border-2 border-[#F3DDE5] p-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-extrabold text-[#4A3531]">
                        🧺 草莓野餐合照（完成今日派對解鎖）
                      </h4>
                      {partnerCandidates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPartnerIndex((i) => i + 1)}
                          className="min-h-[32px] px-2.5 rounded-xl bg-[#FFF2F6] border border-[#F2BDCE] text-[11px] font-extrabold text-[#B83B64]"
                        >
                          換夥伴 ({selectedPartnerPet?.name})
                        </button>
                      )}
                    </div>

                    {selectedPartnerPet && (
                      <p className="text-[11px] font-bold text-[#7D635D]">
                        合照搭檔：{activePet.name} ×{' '}
                        {getPetSpeciesInfo(selectedPartnerPet.species).emoji}{' '}
                        {selectedPartnerPet.name}
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={!coopSession.completed}
                      onClick={handleCreatePicnic}
                      className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold transition ${
                        coopSession.completed
                          ? 'bg-[#FF6B97] text-white shadow-[0_2px_0_#D14772] active:scale-95'
                          : 'bg-[#E9DFDA] text-[#8E7A73]'
                      }`}
                    >
                      {picnicPhoto ? '📸 再拍一張草莓野餐合照' : '🧺 製作限定「草莓野餐合照」'}
                    </button>

                    {picnicPhoto && (
                      <div className="space-y-2">
                        <RoomPhotoCard
                          photo={picnicPhoto}
                          compact
                          currentUserId={currentUserId}
                        />
                        {onSharePhotoToBoard && (
                          <button
                            type="button"
                            disabled={sharingPhotoId === picnicPhoto.id}
                            onClick={() =>
                              void handleSharePhoto(
                                picnicPhoto,
                                `${picnicPhoto.title} 🍓 一起慶祝草莓派對！`
                              )
                            }
                            className="w-full min-h-[40px] rounded-xl bg-[#E8F8F2] border border-[#96DFC2] text-xs font-extrabold text-[#1F6B54] inline-flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>
                              {sharingPhotoId === picnicPhoto.id
                                ? '分享中…'
                                : '分享草莓野餐合照到留言板'}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {recentCoopEventLogs.length > 0 && (
                    <div className="rounded-2xl bg-[#FAF4EE] border border-[#EADCD3] p-3 space-y-1">
                      <div className="text-[11px] font-extrabold text-[#6E544E]">
                        最近共養草莓派對紀錄
                      </div>
                      {recentCoopEventLogs.map((ev) => (
                        <p key={ev.id} className="text-[11px] font-medium text-[#5A423C]">
                          <span className="font-extrabold text-[#B83B64]">{ev.actorName}</span>{' '}
                          {ev.summary}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
