import React, { useEffect, useMemo, useState } from 'react';
import { Award, ShoppingBag, Sparkles, Trophy, Users, Vote, X } from 'lucide-react';
import { PHOTO_CONTEST_RANK_TIERS } from '../../data/photoContest';
import {
  GameState,
  Pet,
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
} from '../../utils/photoContest';
import { createInitialPhotoStudioState } from '../../utils/photoStudio';
import { PhotoContestCoopTab } from './PhotoContestCoopTab';
import { PhotoContestGalleryTab } from './PhotoContestGalleryTab';
import { PhotoContestOverviewTab } from './PhotoContestOverviewTab';
import { PhotoContestShopTab } from './PhotoContestShopTab';
import { PhotoContestVoteTab } from './PhotoContestVoteTab';

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

const TABS: Array<{ id: PhotoContestTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: '比賽總覽', icon: <Trophy className="w-3.5 h-3.5" /> },
  { id: 'vote', label: '投票評選', icon: <Vote className="w-3.5 h-3.5" /> },
  { id: 'shop', label: '攝影商店', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { id: 'coop', label: '雙寵攝影', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'gallery', label: '作品牆', icon: <Award className="w-3.5 h-3.5" /> },
];

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
    return (
      [...currentWeekSubs].sort((a, b) => b.score.totalScore - a.score.totalScore)[0] ??
      null
    );
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

  const handleToggleSticker = (sid: PhotoStickerId) => {
    setStickers((prev) => {
      if (prev.includes(sid)) return prev.filter((x) => x !== sid);
      if (prev.length >= 3) return [...prev.slice(1), sid];
      return [...prev, sid];
    });
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
            <PhotoContestOverviewTab
              pet={pet}
              theme={theme}
              schedule={schedule}
              contest={contest}
              studio={studio}
              liveScore={liveScore}
              liveRankTier={liveRankTier}
              currentWeekSubsCount={currentWeekSubs.length}
              currentWeekBestSub={currentWeekBestSub}
              poseId={poseId}
              facing={facing}
              backgroundId={backgroundId}
              filterId={filterId}
              frameId={frameId}
              stickers={stickers}
              entryTitle={entryTitle}
              entryCaption={entryCaption}
              onChangePose={setPoseId}
              onToggleFacing={() =>
                setFacing((prev) => (prev === 'front' ? 'flipped' : 'front'))
              }
              onChangeBackground={setBackgroundId}
              onChangeFilter={setFilterId}
              onChangeFrame={setFrameId}
              onToggleSticker={handleToggleSticker}
              onChangeTitle={setEntryTitle}
              onChangeCaption={setEntryCaption}
              onSubmit={() => {
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
              }}
              onGoToWardrobe={
                onOpenWardrobe
                  ? () => {
                      onClose();
                      onOpenWardrobe();
                    }
                  : undefined
              }
            />
          )}

          {activeTab === 'vote' && (
            <PhotoContestVoteTab
              contest={contest}
              votingPoolCount={votingPool.length}
              votingPair={votingPair}
              onVoteChoice={(chosenId) => {
                if (!votingPair) return;
                const res = onSubmitVote({
                  leftSubmission: votingPair[0],
                  rightSubmission: votingPair[1],
                  chosenSubmissionId: chosenId,
                });
                setToastMsg(res.notice);
              }}
            />
          )}

          {activeTab === 'shop' && (
            <PhotoContestShopTab
              game={game}
              contest={contest}
              onBuyItem={(itemId) => {
                const res = onBuyShopItem(itemId);
                setToastMsg(res.notice);
              }}
            />
          )}

          {activeTab === 'coop' && (
            <PhotoContestCoopTab
              game={game}
              pet={pet}
              partnerPet={partnerPet}
              theme={theme}
              sharedRoom={sharedRoom}
              coopSession={coopSession}
              coopStreak={coopStreak}
              coopHasClaimed={coopHasClaimed}
              poseId={poseId}
              facing={facing}
              backgroundId={backgroundId}
              filterId={filterId}
              frameId={frameId}
              stickers={stickers}
              coopTitle={coopTitle}
              onChangeCoopTitle={setCoopTitle}
              onCoopOutfit={() => {
                const res = onCoopOutfit(poseId);
                setToastMsg(res.notice);
              }}
              onCoopDecor={() => {
                const res = onCoopDecor({
                  backgroundId,
                  filterId,
                  frameId,
                  stickers,
                });
                setToastMsg(res.notice);
              }}
              onGoToVote={() => setActiveTab('vote')}
              onSubmitCoopEntry={() => {
                const res = onSubmitCoopEntry({
                  partnerPet,
                  title: coopTitle,
                  caption: `${pet.name}與${partnerPet.name}的「${theme.name}」雙寵特輯！`,
                  poseId,
                  facing,
                  backgroundId,
                  filterId,
                  frameId,
                  stickers,
                });
                setToastMsg(res.notice);
              }}
              onClaimCoopReward={() => {
                const res = onClaimCoopReward();
                setToastMsg(res.notice);
              }}
            />
          )}

          {activeTab === 'gallery' && (
            <PhotoContestGalleryTab
              game={game}
              contest={contest}
              studio={studio}
              coopSubs={coopSubs}
              wallView={wallView}
              onChangeWallView={setWallView}
            />
          )}
        </div>
      </div>
    </div>
  );
};
