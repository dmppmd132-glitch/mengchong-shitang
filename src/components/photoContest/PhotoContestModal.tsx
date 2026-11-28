import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Camera,
  Check,
  Clock,
  Heart,
  HeartHandshake,
  Lock,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
  Vote,
  X,
} from 'lucide-react';
import { ACCESSORIES } from '../../data/accessories';
import { getTitleDefinition } from '../../data/encyclopedia';
import {
  COOP_PHOTO_REWARDS,
  COOP_PHOTO_TASK_TEMPLATES,
  DAILY_VOTE_LIMIT,
  PHOTO_CONTEST_RANK_TIERS,
  PHOTO_CONTEST_SHOP_ITEMS,
  PHOTO_CONTEST_THEME_BY_ID,
  VOTE_MILESTONE_CONFIGS,
  WEEKLY_VOTE_LIMIT,
} from '../../data/photoContest';
import {
  PHOTO_BACKGROUNDS,
  PHOTO_BACKGROUND_BY_ID,
  PHOTO_FILTERS,
  PHOTO_FILTER_BY_ID,
  PHOTO_FRAMES,
  PHOTO_FRAME_BY_ID,
  PHOTO_POSES,
  PHOTO_POSE_BY_ID,
  PHOTO_STICKERS,
  PHOTO_STICKER_BY_ID,
} from '../../data/photoStudio';
import {
  AccessorySlot,
  GameState,
  Pet,
  PetSpecies,
  PetViewDirection,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScore,
  PhotoStickerId,
  PhotoSubmission,
  SharedPetRoom,
} from '../../types';
import { getPetDisplayPersonality } from '../../utils/pets';
import {
  evaluatePhotoContestScore,
  getNextVotingPair,
  getOrCreateCoopPhotoSession,
  getPhotoContestSchedule,
  getPhotoContestState,
  getVotingCandidatePool,
  isShopItemOwned,
} from '../../utils/photoContest';
import { createInitialPhotoStudioState } from '../../utils/photoStudio';
import { PiggyCharacter } from '../PiggyCharacter';
import { StudioBackgroundArt } from '../studio/StudioBackgroundArt';

export type PhotoContestTab = 'overview' | 'vote' | 'shop' | 'coop' | 'gallery';

export interface PhotoContestDraftConfig {
  poseId?: PhotoPose;
  backgroundId?: PhotoBackground;
  filterId?: PhotoFilter;
  frameId?: PhotoFrame;
  stickers?: PhotoStickerId[];
  facing?: PetViewDirection;
}

interface PhotoContestModalProps {
  open: boolean;
  onClose: () => void;
  game: GameState;
  pet: Pet;
  currentUserId: string;
  actorName: string;
  sharedRoom: SharedPetRoom | null;
  initialTab?: PhotoContestTab;
  initialDraft?: PhotoContestDraftConfig | null;
  onOpenWardrobe?: () => void;
  onSubmitEntry: (params: {
    title: string;
    caption: string;
    poseId: PhotoPose;
    facing: PetViewDirection;
    backgroundId: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }) => { ok: boolean; notice: string; score?: PhotoScore };
  onSubmitVote: (params: {
    leftSubmission: PhotoSubmission;
    rightSubmission: PhotoSubmission;
    chosenSubmissionId: string;
  }) => { ok: boolean; notice: string };
  onBuyShopItem: (itemId: string) => { ok: boolean; notice: string };
  onCoopOutfit: (poseId: PhotoPose) => { ok: boolean; notice: string };
  onCoopDecor: (decor: {
    backgroundId: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }) => { ok: boolean; notice: string };
  onSubmitCoopEntry: (params: {
    partnerPet: Pet;
    title: string;
    caption: string;
    poseId: PhotoPose;
    facing: PetViewDirection;
    backgroundId: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }) => { ok: boolean; notice: string };
  onClaimCoopReward: () => { ok: boolean; notice: string };
  onDismissSettlement: () => void;
}

const ACCESSORY_NAME_BY_ID = new Map<string, string>(
  ACCESSORIES.map((a) => [a.id, `${a.emoji} ${a.name}`])
);

const TABS: Array<{ id: PhotoContestTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: '比賽總覽', icon: <Trophy className="w-3.5 h-3.5" /> },
  { id: 'vote', label: '投票評選', icon: <Vote className="w-3.5 h-3.5" /> },
  { id: 'shop', label: '攝影商店', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { id: 'coop', label: '共養攝影', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'gallery', label: '作品牆', icon: <Award className="w-3.5 h-3.5" /> },
];

function SubmissionStagePreview({
  species,
  equipped,
  poseId,
  facing,
  backgroundId,
  filterId,
  frameId,
  stickers,
  duoPet,
  compact = false,
}: {
  species: PetSpecies;
  equipped: Record<AccessorySlot, string | null>;
  poseId: PhotoPose;
  facing: PetViewDirection;
  backgroundId: PhotoBackground;
  filterId: PhotoFilter;
  frameId: PhotoFrame;
  stickers: PhotoStickerId[];
  duoPet?: PhotoSubmission['duoPet'];
  compact?: boolean;
}) {
  const pose = PHOTO_POSE_BY_ID[poseId] ?? PHOTO_POSE_BY_ID.happy;
  const duoPose =
    PHOTO_POSE_BY_ID[duoPet?.poseId ?? 'happy'] ?? PHOTO_POSE_BY_ID.happy;
  const bgMeta = PHOTO_BACKGROUND_BY_ID[backgroundId] ?? PHOTO_BACKGROUND_BY_ID.pink_room;
  const filter = PHOTO_FILTER_BY_ID[filterId] ?? PHOTO_FILTER_BY_ID.none;
  const frame = PHOTO_FRAME_BY_ID[frameId] ?? PHOTO_FRAME_BY_ID.rounded;

  return (
    <div className={`${frame.outerClass} relative`}>
      {frame.cornerEmojis && (
        <>
          <span
            className="pointer-events-none absolute -top-2 -left-1.5 text-sm select-none z-20"
            aria-hidden="true"
          >
            {frame.cornerEmojis[0]}
          </span>
          <span
            className="pointer-events-none absolute -top-2 -right-1.5 text-sm select-none z-20"
            aria-hidden="true"
          >
            {frame.cornerEmojis[1]}
          </span>
        </>
      )}
      <div
        className={`${frame.innerClass} bg-[#FFFDF8] relative ${
          compact ? 'py-3 px-2 min-h-[126px]' : 'py-4 px-3 min-h-[172px]'
        } flex flex-col items-center justify-center overflow-hidden`}
      >
        <StudioBackgroundArt
          backgroundId={bgMeta.id}
          filterId={filter.id}
          compact={compact}
        />

        {stickers.map((sid) => {
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
        })}

        <div className="relative z-10 drop-shadow-md flex items-end justify-center gap-1.5">
          <PiggyCharacter
            species={species}
            growth={64}
            roundness={36}
            action={pose.action}
            expression={pose.expression}
            equipped={equipped}
            interactive={false}
            customAnimClass={pose.animClass}
            viewDirection={facing}
            size={compact ? (duoPet ? 64 : 78) : duoPet ? 92 : 114}
          />
          {duoPet && (
            <PiggyCharacter
              species={duoPet.species}
              growth={64}
              roundness={36}
              action={duoPose.action}
              expression={duoPose.expression}
              equipped={duoPet.equipped}
              interactive={false}
              customAnimClass={duoPose.animClass}
              viewDirection={duoPet.facing ?? 'front'}
              size={compact ? 64 : 92}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export const PhotoContestModal: React.FC<PhotoContestModalProps> = ({
  open,
  onClose,
  game,
  pet,
  currentUserId,
  sharedRoom,
  initialTab = 'overview',
  initialDraft = null,
  onOpenWardrobe,
  onSubmitEntry,
  onSubmitVote,
  onBuyShopItem,
  onCoopOutfit,
  onCoopDecor,
  onSubmitCoopEntry,
  onClaimCoopReward,
  onDismissSettlement,
}) => {
  const [activeTab, setActiveTab] = useState<PhotoContestTab>(initialTab);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [poseId, setPoseId] = useState<PhotoPose>('happy');
  const [facing, setFacing] = useState<PetViewDirection>('front');
  const [backgroundId, setBackgroundId] = useState<PhotoBackground>('pink_room');
  const [filterId, setFilterId] = useState<PhotoFilter>('none');
  const [frameId, setFrameId] = useState<PhotoFrame>('rounded');
  const [stickers, setStickers] = useState<PhotoStickerId[]>([]);
  const [entryTitle, setEntryTitle] = useState<string>('');
  const [entryCaption, setEntryCaption] = useState<string>('');
  const [wallView, setWallView] = useState<'personal' | 'coop' | 'history'>('personal');
  const [coopTitle, setCoopTitle] = useState<string>('');

  const contest = useMemo(() => getPhotoContestState(game), [game]);
  const schedule = useMemo(
    () => getPhotoContestSchedule(new Date(), contest.currentThemeId),
    [contest.currentThemeId]
  );
  const theme = schedule.theme;
  const studio = useMemo(
    () => game.photoStudio ?? createInitialPhotoStudioState(),
    [game.photoStudio]
  );
  const personality = useMemo(() => getPetDisplayPersonality(game, pet), [game, pet]);

  const partnerPet = useMemo<Pet>(() => {
    const showcase = (game.coop.partnerShowcasePets ?? []).find((p) => p.id !== pet.id);
    if (showcase) return showcase;
    const otherOwn = game.pets.find((p) => p.id !== pet.id);
    if (otherOwn) return otherOwn;
    return {
      ...pet,
      id: 'coop_partner_preview',
      name: sharedRoom?.partnerEmail?.split('@')[0]
        ? `${sharedRoom.partnerEmail.split('@')[0].slice(0, 4)}的寶貝`
        : '夥伴咪',
      species: pet.species === 'cat' ? 'pig' : 'cat',
    };
  }, [game.coop.partnerShowcasePets, game.pets, pet, sharedRoom]);

  useEffect(() => {
    if (!open) return;
    setActiveTab(initialTab);
    setToastMsg('');
    const unlockedPoses = studio.unlockedPoses;
    const unlockedBgs = studio.unlockedBackgrounds;
    const unlockedFilters = studio.unlockedFilters;
    const unlockedFrames = studio.unlockedFrames;

    const preferredPose =
      initialDraft?.poseId && unlockedPoses.includes(initialDraft.poseId)
        ? initialDraft.poseId
        : theme.preferredPoses.find((p) => unlockedPoses.includes(p)) ?? 'happy';
    const preferredBg =
      initialDraft?.backgroundId && unlockedBgs.includes(initialDraft.backgroundId)
        ? initialDraft.backgroundId
        : theme.preferredBackgroundIds.find((b) => unlockedBgs.includes(b)) ??
          unlockedBgs[0] ??
          'pink_room';
    const preferredFilter =
      initialDraft?.filterId && unlockedFilters.includes(initialDraft.filterId)
        ? initialDraft.filterId
        : theme.preferredFilterIds.find((f) => unlockedFilters.includes(f)) ?? 'none';
    const preferredFrame =
      initialDraft?.frameId && unlockedFrames.includes(initialDraft.frameId)
        ? initialDraft.frameId
        : theme.preferredFrameIds.find((fr) => unlockedFrames.includes(fr)) ??
          (unlockedFrames.includes('rounded') ? 'rounded' : 'none');

    setPoseId(preferredPose);
    setFacing(initialDraft?.facing ?? 'front');
    setBackgroundId(preferredBg);
    setFilterId(preferredFilter);
    setFrameId(preferredFrame);
    setStickers((initialDraft?.stickers ?? []).slice(0, 3));
    setEntryTitle(`${pet.name}・${theme.name}`.slice(0, 20));
    setEntryCaption('');
    setCoopTitle(`${pet.name}與${partnerPet.name}的${theme.name}`.slice(0, 20));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialTab, theme.id, pet.name]);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = window.setTimeout(() => setToastMsg(''), 3400);
    return () => window.clearTimeout(timer);
  }, [toastMsg]);

  const liveScore = useMemo(
    () =>
      evaluatePhotoContestScore({
        equipped: pet.accessories,
        personality,
        poseId,
        backgroundId,
        filterId,
        frameId,
        stickers,
        theme,
        votesReceived: 0,
      }),
    [pet.accessories, personality, poseId, backgroundId, filterId, frameId, stickers, theme]
  );

  const liveRankTier = useMemo(
    () =>
      PHOTO_CONTEST_RANK_TIERS.find(
        (t) => liveScore.totalScore >= t.minScore && liveScore.totalScore <= t.maxScore
      ) ?? PHOTO_CONTEST_RANK_TIERS[PHOTO_CONTEST_RANK_TIERS.length - 1],
    [liveScore.totalScore]
  );

  const currentWeekSubs = useMemo(
    () => contest.submissions.filter((s) => s.contestWeekKey === contest.currentWeekKey),
    [contest.submissions, contest.currentWeekKey]
  );

  const currentWeekBestSub = useMemo(() => {
    const bestId = contest.bestSubmissionByWeek[contest.currentWeekKey];
    if (bestId) {
      const found = currentWeekSubs.find((s) => s.id === bestId);
      if (found) return found;
    }
    return [...currentWeekSubs].sort(
      (a, b) => b.score.totalScore - a.score.totalScore
    )[0] ?? null;
  }, [contest.bestSubmissionByWeek, contest.currentWeekKey, currentWeekSubs]);

  const votingPool = useMemo(
    () => getVotingCandidatePool(game, currentUserId),
    [game, currentUserId]
  );

  const votingPair = useMemo(
    () => getNextVotingPair(game, currentUserId),
    [game, currentUserId]
  );

  const coopSession = useMemo(() => getOrCreateCoopPhotoSession(game), [game]);
  const coopHasClaimed = coopSession.claimedByUserIds.includes(currentUserId || 'local');
  const coopStreak = game.coop.photoContestStreakWeeks ?? 0;
  const coopSubs = game.coop.coopPhotoSubmissions ?? [];

  if (!open) return null;

  const unlockedPosesList = PHOTO_POSES.filter((p) => studio.unlockedPoses.includes(p.id));
  const unlockedBgsList = PHOTO_BACKGROUNDS.filter((b) =>
    studio.unlockedBackgrounds.includes(b.id)
  );
  const unlockedFiltersList = PHOTO_FILTERS.filter((f) =>
    studio.unlockedFilters.includes(f.id)
  );
  const unlockedFramesList = PHOTO_FRAMES.filter((fr) =>
    studio.unlockedFrames.includes(fr.id)
  );
  const unlockedStickersList = PHOTO_STICKERS.filter((st) =>
    studio.unlockedStickers.includes(st.id)
  );

  const handleToggleSticker = (sid: PhotoStickerId) => {
    setStickers((prev) => {
      if (prev.includes(sid)) return prev.filter((x) => x !== sid);
      if (prev.length >= 3) return [...prev.slice(1), sid];
      return [...prev, sid];
    });
  };

  const handleSubmitClick = () => {
    const res = onSubmitEntry({
      title: entryTitle,
      caption: entryCaption,
      poseId,
      facing,
      backgroundId,
      filterId,
      frameId,
      stickers,
    });
    setToastMsg(res.notice);
  };

  const handleVoteChoice = (chosenId: string) => {
    if (!votingPair) return;
    const res = onSubmitVote({
      leftSubmission: votingPair[0],
      rightSubmission: votingPair[1],
      chosenSubmissionId: chosenId,
    });
    setToastMsg(res.notice);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3"
      role="dialog"
      aria-modal="true"
      aria-label="每週攝影比賽與穿搭評分"
    >
      <div className="w-full max-w-[424px] max-h-[90vh] bg-[#FFFDF8] rounded-3xl border-2 border-[#F4CED9] shadow-2xl flex flex-col overflow-hidden">
        <header className="shrink-0 bg-gradient-to-r from-[#FFF0F5] via-[#FFF8EC] to-[#EEF8FF] border-b border-[#F4DCE4] px-4 py-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg leading-none" aria-hidden="true">
                {theme.emoji}
              </span>
              <h2 className="text-base font-extrabold text-[#4A3531] truncate">
                每週攝影比賽
              </h2>
            </div>
            <p className="text-[11px] font-bold text-[#7D635D] truncate">
              {theme.name} · {schedule.phaseLabel} · 剩 {schedule.remainingWeekText}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="px-2.5 py-1.5 rounded-xl bg-white border border-[#F2D5DF] text-[11px] font-extrabold text-[#B83B64] tabular-nums inline-flex items-center gap-1 shadow-xs">
              <span>📷</span>
              <span>{contest.tickets.balance}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉攝影比賽"
              className="min-h-[44px] min-w-[44px] rounded-2xl bg-white border border-[#EBDAD5] text-[#6E544E] hover:bg-[#FFF5F8] flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <nav
          className="shrink-0 px-2.5 py-2 bg-[#FFF8FA] border-b border-[#F4DCE4] grid grid-cols-5 gap-1"
          aria-label="攝影比賽分頁"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] rounded-xl px-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition ${
                  active
                    ? 'bg-[#FF7A9E] text-white shadow-[0_2px_0_#D9577B]'
                    : 'bg-white text-[#6E544E] border border-[#EFE2DD] hover:bg-[#FFF5F8]'
                }`}
              >
                {tab.icon}
                <span className="leading-none whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
          {toastMsg && (
            <div
              role="status"
              className="rounded-2xl bg-[#4A3531] text-white px-3.5 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#FFD166] shrink-0" />
              <span className="leading-snug">{toastMsg}</span>
            </div>
          )}

          {contest.pendingWeekSettlementNotice && (
            <div className="rounded-2xl bg-gradient-to-r from-[#FFF6DB] to-[#FFEAF2] border border-[#F0C878] p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-extrabold text-[#7B4F08]">
                    🎉 上週「{contest.pendingWeekSettlementNotice.themeName}」結算完成！
                  </p>
                  <p className="text-[11px] font-bold text-[#6E544E] mt-0.5 leading-snug">
                    {contest.pendingWeekSettlementNotice.rewardSummary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDismissSettlement}
                  className="min-h-[36px] px-2.5 rounded-xl bg-white border border-[#E5C17B] text-[11px] font-extrabold text-[#7B4F08] shrink-0"
                >
                  知道了
                </button>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-3">
              <section className="rounded-2xl bg-white border border-[#F2DCE4] p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${theme.badgeClass}`}
                      >
                        第 {theme.weekOrder} 週主題
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${schedule.phaseBadgeClass}`}
                      >
                        {schedule.phaseLabel}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#4A3531] mt-1">
                      {theme.emoji} {theme.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#6E544E] leading-snug mt-0.5">
                      {theme.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#B83B64] tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{schedule.remainingPhaseText}</span>
                    </div>
                    <p className="text-[10px] font-bold text-[#8A7068] mt-0.5">
                      週期 {contest.currentWeekKey}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#FFF9F2] border border-[#F3E2CE] p-2.5 text-[11px] space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[#6E544E]">
                      📌 必備條件：{theme.requiredConditionText}
                    </span>
                    <span
                      className={`font-extrabold whitespace-nowrap ${
                        liveScore.hasRequiredAccessory
                          ? 'text-[#1D6B52]'
                          : 'text-[#C25124]'
                      }`}
                    >
                      {liveScore.hasRequiredAccessory ? '✅ 已達成' : '⚠️ 未穿戴'}
                    </span>
                  </div>
                  <p className="font-bold text-[#7D635D]">
                    ✨ 建議風格：{theme.styleTags.join(' · ')}
                  </p>
                  <p className="font-bold text-[#B83B64]">
                    🎁 主題獎勵：{theme.rewardLabel}（A 級以上立即解鎖）
                  </p>
                  <p className="text-[10px] font-semibold text-[#8A7068]">
                    🗓️ {schedule.phaseRuleSummary}（週一 00:00 公布與結算）
                  </p>
                </div>

                {!liveScore.hasRequiredAccessory && onOpenWardrobe && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenWardrobe();
                    }}
                    className="w-full min-h-[44px] rounded-2xl bg-[#FFF1F5] border border-[#F5BACD] text-[#B83B64] text-xs font-extrabold hover:bg-[#FFE4ED] transition"
                  >
                    👗 前往更衣室換上「{theme.name}」主題配件
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="rounded-xl bg-[#FFF7FA] border border-[#F3DCE4] p-2 text-center">
                    <p className="text-[10px] font-bold text-[#8A7068]">本週最佳</p>
                    <p className="text-sm font-extrabold text-[#4A3531] tabular-nums mt-0.5">
                      {currentWeekBestSub
                        ? `${currentWeekBestSub.score.totalScore} 分 (${currentWeekBestSub.score.rank})`
                        : '尚無作品'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F4FBF8] border border-[#D4EDE3] p-2 text-center">
                    <p className="text-[10px] font-bold text-[#5E7C71]">本週參賽</p>
                    <p className="text-sm font-extrabold text-[#256D57] tabular-nums mt-0.5">
                      {currentWeekSubs.length} 張
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F4F8FF] border border-[#D8E5FB] p-2 text-center">
                    <p className="text-[10px] font-bold text-[#5C6F91]">攝影券</p>
                    <p className="text-sm font-extrabold text-[#2E5999] tabular-nums mt-0.5">
                      📷 {contest.tickets.balance}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-white border border-[#EFE2DD] p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#4A3531]">
                    📸 拍攝＆即時穿搭評分
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg border text-xs font-extrabold tabular-nums ${liveRankTier.badgeClass}`}
                  >
                    預估 {liveScore.totalScore} 分 · {liveScore.rank} 級
                  </span>
                </div>

                <SubmissionStagePreview
                  species={pet.species}
                  equipped={pet.accessories}
                  poseId={poseId}
                  facing={facing}
                  backgroundId={backgroundId}
                  filterId={filterId}
                  frameId={frameId}
                  stickers={stickers}
                />

                <div className="rounded-xl bg-[#FFFDF9] border border-[#F0E3DD] p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-[#4A3531]">
                    <span>評分細節（加權總分 100 分）</span>
                    <span className="text-[#B83B64]">
                      預估獎賞：+{liveRankTier.coins} 金幣 / +{liveRankTier.materials} 材料
                    </span>
                  </div>
                  {[
                    { label: '主題符合度 (40%)', val: liveScore.themeMatch, max: 40 },
                    { label: '穿搭完整度 (25%)', val: liveScore.outfitCompleteness, max: 25 },
                    { label: '照片完成度 (20%)', val: liveScore.photoCompletion, max: 20 },
                    { label: '創意與個性 (10%)', val: liveScore.creativityBonus, max: 10 },
                    { label: '人氣投票 (5%)', val: liveScore.popularityVotes, max: 5 },
                  ].map((row) => (
                    <div key={row.label} className="space-y-0.5">
                      <div className="flex justify-between text-[10px] font-bold text-[#6E544E]">
                        <span>{row.label}</span>
                        <span className="tabular-nums">
                          {row.val} / {row.max}
                        </span>
                      </div>
                      <progress
                        value={row.val}
                        max={row.max}
                        aria-label={row.label}
                        className="w-full h-1.5 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-[#F5EAE5] [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-[#FF7A9E] [&::-webkit-progress-value]:to-[#FFB36B] [&::-moz-progress-bar]:bg-[#FF7A9E]"
                      />
                    </div>
                  ))}
                  {liveScore.notes.length > 0 && (
                    <p className="text-[10px] font-bold text-[#7D635D] pt-1">
                      💡 {liveScore.notes.slice(0, 2).join(' · ')}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <p className="text-[11px] font-extrabold text-[#6E544E] mb-1">姿勢與朝向</p>
                    <div className="flex flex-wrap gap-1.5">
                      {unlockedPosesList.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPoseId(p.id)}
                          className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                            poseId === p.id
                              ? 'bg-[#FF7A9E] border-[#E05E83] text-white'
                              : 'bg-[#FFFDF8] border-[#EAE0DA] text-[#5A4540]'
                          }`}
                        >
                          {p.emoji} {p.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setFacing((prev) => (prev === 'front' ? 'flipped' : 'front'))
                        }
                        className="min-h-[38px] px-2.5 rounded-xl border border-[#DCE8F7] bg-[#F5F9FF] text-[11px] font-extrabold text-[#2B5799]"
                      >
                        🔄 {facing === 'front' ? '正面' : '翻轉'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-extrabold text-[#6E544E] mb-1">攝影背景</p>
                    <div className="flex flex-wrap gap-1.5">
                      {unlockedBgsList.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBackgroundId(b.id)}
                          className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                            backgroundId === b.id
                              ? 'bg-[#FF7A9E] border-[#E05E83] text-white'
                              : 'bg-[#FFFDF8] border-[#EAE0DA] text-[#5A4540]'
                          }`}
                        >
                          {b.emoji} {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-extrabold text-[#6E544E] mb-1">風格濾鏡</p>
                    <div className="flex flex-wrap gap-1.5">
                      {unlockedFiltersList.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFilterId(f.id)}
                          className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                            filterId === f.id
                              ? 'bg-[#67B596] border-[#4A9678] text-white'
                              : 'bg-[#FFFDF8] border-[#EAE0DA] text-[#5A4540]'
                          }`}
                        >
                          {f.emoji} {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-extrabold text-[#6E544E] mb-1">相框與貼紙（貼紙最多 3 個）</p>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {unlockedFramesList.map((fr) => (
                        <button
                          key={fr.id}
                          type="button"
                          onClick={() => setFrameId(fr.id)}
                          className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                            frameId === fr.id
                              ? 'bg-[#8D72E1] border-[#6F54C7] text-white'
                              : 'bg-[#FFFDF8] border-[#EAE0DA] text-[#5A4540]'
                          }`}
                        >
                          {fr.emoji} {fr.label}
                        </button>
                      ))}
                    </div>
                    {unlockedStickersList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {unlockedStickersList.map((st) => {
                          const selected = stickers.includes(st.id);
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => handleToggleSticker(st.id)}
                              className={`min-h-[36px] px-2 rounded-xl border text-[11px] font-extrabold transition ${
                                selected
                                  ? 'bg-[#FFD166] border-[#D9A732] text-[#4A3531]'
                                  : 'bg-white border-[#EAE0DA] text-[#6E544E]'
                              }`}
                            >
                              {st.emoji} {st.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      maxLength={20}
                      value={entryTitle}
                      onChange={(e) => setEntryTitle(e.target.value)}
                      placeholder="輸入作品標題（最多 20 字）"
                      className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFFDF8] border border-[#E6D6CF] text-xs font-bold text-[#4A3531] focus:outline-none focus:border-[#FF7A9E]"
                    />
                    <input
                      type="text"
                      maxLength={45}
                      value={entryCaption}
                      onChange={(e) => setEntryCaption(e.target.value)}
                      placeholder="寫一句參賽宣言或心情留言（選填）"
                      className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFFDF8] border border-[#E6D6CF] text-xs font-semibold text-[#4A3531] focus:outline-none focus:border-[#FF7A9E]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitClick}
                    className="w-full min-h-[46px] rounded-2xl bg-[#FF7A9E] text-white text-sm font-extrabold shadow-[0_3px_0_#D9577B] hover:bg-[#F76890] active:translate-y-0.5 transition inline-flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>拍下並提交本週參賽作品</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'vote' && (
            <div className="space-y-3">
              <section className="rounded-2xl bg-white border border-[#F2DCE4] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-[#4A3531]">
                    🗳️ 匿名對比評選：更喜歡哪一張？
                  </h3>
                  <span className="text-[11px] font-extrabold text-[#B83B64] tabular-nums">
                    今日 {contest.dailyVoteCount}/{DAILY_VOTE_LIMIT} · 本週{' '}
                    {contest.weeklyVoteCount}/{WEEKLY_VOTE_LIMIT}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#7D635D] leading-snug">
                  匿名顯示其他飼主與精選作品（隱藏作者、不會抽到自己的作品與重複配對）。累積投票可解鎖攝影材料、攝影券與金冠相框！
                </p>

                {contest.dailyVoteCount >= DAILY_VOTE_LIMIT ? (
                  <div className="rounded-2xl bg-[#FFF6EB] border border-[#F3D5A8] p-4 text-center space-y-1">
                    <p className="text-sm font-extrabold text-[#8A5610]">
                      今日投票已達上限（{DAILY_VOTE_LIMIT} / {DAILY_VOTE_LIMIT}）
                    </p>
                    <p className="text-xs font-semibold text-[#7D635D]">
                      明天再來繼續投票評選，朝本週 50 票滿貫邁進吧！
                    </p>
                  </div>
                ) : contest.weeklyVoteCount >= WEEKLY_VOTE_LIMIT ? (
                  <div className="rounded-2xl bg-[#EEFBF5] border border-[#BEE8D6] p-4 text-center space-y-1">
                    <p className="text-sm font-extrabold text-[#1D6B52]">
                      🎊 本週 50 票滿貫達成！
                    </p>
                    <p className="text-xs font-semibold text-[#5E7C71]">
                      感謝你的熱情投票，下週一新主題開始時將重置每週配額！
                    </p>
                  </div>
                ) : votingPair ? (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {votingPair.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="rounded-2xl bg-[#FFFDF8] border border-[#EFE1DC] p-2 flex flex-col justify-between gap-2"
                      >
                        <div className="space-y-1.5">
                          <SubmissionStagePreview
                            species={candidate.species}
                            equipped={candidate.equipped}
                            poseId={candidate.poseId}
                            facing={candidate.facing}
                            backgroundId={candidate.backgroundId}
                            filterId={candidate.filterId}
                            frameId={candidate.frameId}
                            stickers={candidate.stickers}
                            duoPet={candidate.duoPet}
                            compact
                          />
                          <div>
                            <p className="text-xs font-extrabold text-[#4A3531] truncate">
                              {candidate.title}
                            </p>
                            <p className="text-[10px] font-bold text-[#8A7068]">
                              匿名參賽者 · 目前 {candidate.votesReceived} 票
                            </p>
                            <p className="text-[10px] font-semibold text-[#6E544E] line-clamp-2 mt-0.5 leading-snug">
                              {candidate.caption}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVoteChoice(candidate.id)}
                          className="w-full min-h-[44px] rounded-xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_2px_0_#D9577B] hover:bg-[#F76890] active:translate-y-0.5 transition inline-flex items-center justify-center gap-1"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>更喜歡這張</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#FFF7FA] border border-[#F3DCE4] p-4 text-center text-xs font-bold text-[#7D635D]">
                    目前候選池（{votingPool.length} 件）暫無可配對作品
                  </div>
                )}
              </section>

              <section className="rounded-2xl bg-white border border-[#EFE2DD] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#4A3531]">
                    🎁 本週投票進度獎勵
                  </h4>
                  <span className="text-[11px] font-extrabold text-[#256D57] tabular-nums">
                    {contest.weeklyVoteCount} / {WEEKLY_VOTE_LIMIT} 票
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {VOTE_MILESTONE_CONFIGS.map((ms) => {
                    const reached = contest.claimedVoteMilestones.includes(ms.votes);
                    return (
                      <div
                        key={ms.votes}
                        className={`rounded-xl px-3 py-2 border flex items-center justify-between gap-2 ${
                          reached
                            ? 'bg-[#EEFBF5] border-[#BEE8D6]'
                            : 'bg-[#FFFDF8] border-[#EFE2DD]'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-[#4A3531] truncate">
                            {ms.label}
                          </p>
                          <p className="text-[10px] font-bold text-[#6E544E]">
                            +{ms.rewardMaterials} 攝影材料
                            {ms.rewardTickets > 0 ? ` · +${ms.rewardTickets} 攝影券` : ''}
                            {ms.rewardFrameId ? ' · 比賽限定框' : ''}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap ${
                            reached
                              ? 'bg-[#256D57] text-white'
                              : 'bg-[#F3EAE5] text-[#7D635D]'
                          }`}
                        >
                          {reached ? '✅ 已獲得' : `目標 ${ms.votes} 票`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-gradient-to-r from-[#FFF0F5] to-[#FFF6E5] border border-[#F3D5E0] p-3.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-extrabold text-[#4A3531]">
                    📷 攝影券專屬兌換商店
                  </p>
                  <p className="text-[10px] font-bold text-[#7D635D] mt-0.5">
                    攝影券僅可透過攝影比賽、投票與共養獲得，不與金幣或其他券互通
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white border border-[#F2D5DF] text-xs font-extrabold text-[#B83B64] tabular-nums shrink-0">
                  📷 {contest.tickets.balance}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {PHOTO_CONTEST_SHOP_ITEMS.map((item) => {
                  const owned = isShopItemOwned(game, item.id);
                  const canAfford = contest.tickets.balance >= item.ticketPrice;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white border border-[#EFE2DD] p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{item.emoji}</span>
                          <p className="text-xs font-extrabold text-[#4A3531] truncate">
                            {item.name}
                          </p>
                          <span className="px-1.5 py-0.5 rounded-md bg-[#F7EFEA] text-[10px] font-extrabold text-[#7D635D]">
                            {item.badgeText}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#6E544E] leading-snug mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      {owned ? (
                        <span className="min-h-[40px] px-3 rounded-xl bg-[#EEFBF5] border border-[#BEE8D6] text-[#1D6B52] text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                          <Check className="w-3.5 h-3.5" />
                          <span>已擁有</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const res = onBuyShopItem(item.id);
                            setToastMsg(res.notice);
                          }}
                          className={`min-h-[44px] px-3 rounded-xl text-xs font-extrabold shrink-0 whitespace-nowrap transition ${
                            canAfford
                              ? 'bg-[#FF7A9E] text-white shadow-[0_2px_0_#D9577B] hover:bg-[#F76890]'
                              : 'bg-[#F5ECE8] text-[#9A857E] border border-[#E5D7D0]'
                          }`}
                        >
                          📷 {item.ticketPrice} 兌換
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'coop' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-gradient-to-r from-[#FFF0F6] to-[#EFF7FF] border border-[#F2D5DF] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-[#D94D7B]" />
                    <h3 className="text-sm font-extrabold text-[#4A3531]">
                      雙人共養攝影比賽
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-white border border-[#F2D5DF] text-[10px] font-extrabold text-[#B83B64] tabular-nums">
                    連續合作 {coopStreak} 週
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#6E544E] leading-snug">
                  完賽雙方獲得相同大獎：+{COOP_PHOTO_REWARDS.coins} 金幣 · +
                  {COOP_PHOTO_REWARDS.materials} 攝影材料 · +{COOP_PHOTO_REWARDS.tickets} 攝影券 · 親密度 +
                  {COOP_PHOTO_REWARDS.intimacy}！
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-extrabold">
                  <div
                    className={`rounded-xl px-2.5 py-1.5 border ${
                      game.coop.unlockedBadges.includes('photo_partner')
                        ? 'bg-[#EEFBF5] border-[#BEE8D6] text-[#1D6B52]'
                        : 'bg-white border-[#EFE2DD] text-[#7D635D]'
                    }`}
                  >
                    🏅 連續 3 週：攝影搭檔徽章
                  </div>
                  <div
                    className={`rounded-xl px-2.5 py-1.5 border ${
                      game.encyclopedia.unlockedTitles.includes('best_photo_partner')
                        ? 'bg-[#FFF5DC] border-[#E8C46E] text-[#7B4F08]'
                        : 'bg-white border-[#EFE2DD] text-[#7D635D]'
                    }`}
                  >
                    👑 連續 5 週：最佳攝影搭檔稱號
                  </div>
                </div>
              </div>

              {!sharedRoom ? (
                <div className="rounded-2xl bg-white border border-[#EFE2DD] p-4 text-center space-y-1.5">
                  <Lock className="w-6 h-6 mx-auto text-[#C09CA8]" />
                  <p className="text-xs font-extrabold text-[#4A3531]">
                    尚未建立共養小屋
                  </p>
                  <p className="text-[11px] font-semibold text-[#7D635D]">
                    前往首頁建立或加入共養小屋後，即可與夥伴合作穿搭、佈置舞台、累積投票與共拍雙人比賽照！
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl bg-white border border-[#EFE2DD] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-[#4A3531]">
                        🤝 本週「{theme.name}」合作進度
                      </h4>
                      {coopSession.lastUpdatedByName && (
                        <span className="text-[10px] font-bold text-[#8A7068]">
                          最近更新：{coopSession.lastUpdatedByName}
                        </span>
                      )}
                    </div>

                    {coopSession.steps.map((step) => {
                      const tpl = COOP_PHOTO_TASK_TEMPLATES.find((t) => t.key === step.key);
                      const done = step.progress >= step.target;
                      return (
                        <div
                          key={step.key}
                          className={`rounded-xl p-2.5 border space-y-2 ${
                            done
                              ? 'bg-[#EEFBF5] border-[#BEE8D6]'
                              : 'bg-[#FFFDF8] border-[#EFE2DD]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-[#4A3531]">
                                {step.emoji} {step.label}（{step.progress} / {step.target}）
                              </p>
                              <p className="text-[10px] font-semibold text-[#7D635D]">
                                {tpl?.hint}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg shrink-0 ${
                                done
                                  ? 'bg-[#256D57] text-white'
                                  : 'bg-[#F5EAE5] text-[#7D635D]'
                              }`}
                            >
                              {done ? '✅ 完成' : '進行中'}
                            </span>
                          </div>

                          {step.key === 'outfit' && !done && (
                            <button
                              type="button"
                              onClick={() => {
                                const res = onCoopOutfit(poseId);
                                setToastMsg(res.notice);
                              }}
                              className="w-full min-h-[40px] rounded-xl bg-[#FF7A9E] text-white text-[11px] font-extrabold"
                            >
                              👗 提交目前「{theme.name}」穿搭與姿勢
                            </button>
                          )}

                          {step.key === 'decor' && !done && (
                            <button
                              type="button"
                              onClick={() => {
                                const res = onCoopDecor({
                                  backgroundId,
                                  filterId,
                                  frameId,
                                  stickers,
                                });
                                setToastMsg(res.notice);
                              }}
                              className="w-full min-h-[40px] rounded-xl bg-[#67B596] text-white text-[11px] font-extrabold"
                            >
                              🎨 套用目前舞台佈置與濾鏡
                            </button>
                          )}

                          {step.key === 'vote' && !done && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('vote')}
                              className="w-full min-h-[40px] rounded-xl bg-[#8D72E1] text-white text-[11px] font-extrabold"
                            >
                              🗳️ 前往投票評選（每投 1 票同步推進）
                            </button>
                          )}
                        </div>
                      );
                    })}

                    <div className="pt-1 space-y-2 border-t border-[#F4EAE4]">
                      <p className="text-[11px] font-extrabold text-[#4A3531]">
                        📸 雙人共養合影預覽：{pet.name} ＆ {partnerPet.name}
                      </p>
                      <SubmissionStagePreview
                        species={pet.species}
                        equipped={pet.accessories}
                        poseId={poseId}
                        facing={facing}
                        backgroundId={backgroundId}
                        filterId={filterId}
                        frameId={frameId}
                        stickers={stickers}
                        duoPet={{
                          petId: partnerPet.id,
                          petName: partnerPet.name,
                          species: partnerPet.species,
                          equipped: partnerPet.accessories,
                          poseId: coopSession.draftPoseId,
                          facing: 'front',
                          weightAtCapture: partnerPet.weight,
                        }}
                        compact
                      />
                      <input
                        type="text"
                        maxLength={20}
                        value={coopTitle}
                        onChange={(e) => setCoopTitle(e.target.value)}
                        placeholder="共養比賽合照標題"
                        className="w-full min-h-[40px] px-3 rounded-xl bg-[#FFFDF8] border border-[#E6D6CF] text-xs font-bold text-[#4A3531]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const res = onSubmitCoopEntry({
                            partnerPet,
                            title: coopTitle,
                            caption: `${pet.name}與${partnerPet.name}的共養「${theme.name}」特輯！`,
                            poseId,
                            facing,
                            backgroundId,
                            filterId,
                            frameId,
                            stickers,
                          });
                          setToastMsg(res.notice);
                        }}
                        className="w-full min-h-[44px] rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B]"
                      >
                        📸 提交共養雙人參賽合照
                      </button>

                      <button
                        type="button"
                        disabled={!coopSession.completed || coopHasClaimed}
                        onClick={() => {
                          const res = onClaimCoopReward();
                          setToastMsg(res.notice);
                        }}
                        className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold transition ${
                          coopHasClaimed
                            ? 'bg-[#EEFBF5] border border-[#BEE8D6] text-[#1D6B52]'
                            : coopSession.completed
                            ? 'bg-[#FFD166] text-[#4A3531] shadow-[0_3px_0_#D9A732]'
                            : 'bg-[#F5ECE8] text-[#9A857E]'
                        }`}
                      >
                        {coopHasClaimed
                          ? '✅ 已領取本週共養攝影合作大獎'
                          : coopSession.completed
                          ? '🎁 領取雙方等額共養大獎 (+280金幣 +4材料 +30攝影券)'
                          : '完成上述 4 項共養任務後即可領取大獎'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-white border border-[#EFE2DD] p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#4A3531]">🏆 我的比賽檔案</span>
                  <span className="font-bold text-[#7D635D] tabular-nums">
                    📷 攝影券 {contest.tickets.balance} · 🎨 材料 {studio.studioMaterials}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['contest_photographer', 'best_photo_partner'] as const).map((tid) => {
                    const owned = game.encyclopedia.unlockedTitles.includes(tid);
                    const def = getTitleDefinition(tid);
                    return (
                      <span
                        key={tid}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-extrabold ${
                          owned
                            ? 'bg-[#FFF5DC] border-[#E8C46E] text-[#7B4F08]'
                            : 'bg-[#F7F1EE] border-[#E5D7D0] text-[#9A857E]'
                        }`}
                      >
                        {owned ? '👑 ' : '🔒 '}
                        {def.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 bg-[#F6ECE7] p-1 rounded-2xl">
                {(
                  [
                    { id: 'personal', label: `個人作品 (${contest.submissions.length})` },
                    { id: 'coop', label: `共養牆 (${coopSubs.length})` },
                    { id: 'history', label: `歷週結算 (${contest.settledWeeks.length})` },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setWallView(opt.id)}
                    className={`min-h-[38px] rounded-xl text-[11px] font-extrabold transition ${
                      wallView === opt.id
                        ? 'bg-white text-[#4A3531] shadow-xs'
                        : 'text-[#7D635D]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {wallView === 'history' ? (
                contest.settledWeeks.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-[#EFE2DD] p-6 text-center text-xs font-bold text-[#8A7068]">
                    尚無歷週結算紀錄，每週一 00:00 將自動結算並保存成果！
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contest.settledWeeks.map((rec) => (
                      <div
                        key={rec.weekKey}
                        className="rounded-2xl bg-white border border-[#EFE2DD] p-3 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#4A3531]">
                            {PHOTO_CONTEST_THEME_BY_ID[rec.themeId]?.emoji ?? '🏆'}{' '}
                            {rec.themeName}
                          </span>
                          <span className="text-[11px] font-bold text-[#8A7068] tabular-nums">
                            {rec.weekKey}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-[#6E544E]">
                          最佳：{rec.bestScore} 分
                          {rec.bestRank ? ` (${rec.bestRank} 級)` : ''} · 投稿{' '}
                          {rec.submissionsCount} 次 · 投票 {rec.votesCastCount} 次 · 攝影券 +
                          {rec.ticketsEarned}
                        </p>
                        <p className="text-[10px] font-semibold text-[#B83B64]">
                          {rec.rewardSummary}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                (() => {
                  const list = wallView === 'coop' ? coopSubs : contest.submissions;
                  if (list.length === 0) {
                    return (
                      <div className="rounded-2xl bg-white border border-[#EFE2DD] p-6 text-center text-xs font-bold text-[#8A7068]">
                        {wallView === 'coop'
                          ? '還沒有共養雙人攝影作品，快去「共養攝影」分頁與夥伴合影吧！'
                          : '尚未提交任何參賽作品，快到「比賽總覽」幫寶貝拍照參賽吧！'}
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2.5">
                      {list.map((sub) => {
                        const subTheme = PHOTO_CONTEST_THEME_BY_ID[sub.themeId];
                        const eqNames = (
                          Object.values(sub.equipped) as Array<string | null>
                        )
                          .filter((id): id is string => Boolean(id))
                          .map((id) => ACCESSORY_NAME_BY_ID.get(id) ?? id);
                        return (
                          <article
                            key={sub.id}
                            className="rounded-2xl bg-white border border-[#EFE2DD] p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-extrabold text-[#4A3531] truncate">
                                  {sub.title}
                                  {sub.isCoop ? ' 🤝' : ''}
                                </p>
                                <p className="text-[10px] font-bold text-[#8A7068]">
                                  {subTheme?.emoji} {subTheme?.name} · {sub.contestWeekKey}
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded-xl bg-[#FFF0F5] border border-[#F3CEDB] text-xs font-extrabold text-[#B83B64] tabular-nums shrink-0">
                                {sub.score.totalScore} 分 · {sub.score.rank} 級
                              </span>
                            </div>
                            <SubmissionStagePreview
                              species={sub.species}
                              equipped={sub.equipped}
                              poseId={sub.poseId}
                              facing={sub.facing}
                              backgroundId={sub.backgroundId}
                              filterId={sub.filterId}
                              frameId={sub.frameId}
                              stickers={sub.stickers}
                              duoPet={sub.duoPet}
                              compact
                            />
                            <p className="text-[11px] font-semibold text-[#6E544E]">
                              {sub.caption}
                            </p>
                            {eqNames.length > 0 && (
                              <p className="text-[10px] font-bold text-[#7D635D]">
                                穿搭：{eqNames.join(' · ')}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-[10px] font-extrabold text-[#256D57] bg-[#F5FBF8] rounded-xl px-2.5 py-1.5 tabular-nums">
                              <span>
                                獎勵：+{sub.rewardCoins} 金幣 · +{sub.rewardMaterials} 材料 · +
                                {sub.rewardTickets} 攝影券
                              </span>
                              <span>❤️ {sub.votesReceived} 票</span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
