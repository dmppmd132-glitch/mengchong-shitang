import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookMarked,
  Camera,
  Check,
  Clock,
  Coins,
  Hammer,
  HeartHandshake,
  Lock,
  Send,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { ACCESSORY_THEME_BY_ID } from '../data/accessories';
import {
  PHOTO_BACKGROUNDS,
  PHOTO_BACKGROUND_BY_ID,
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
  STUDIO_BADGES,
  STUDIO_CRAFT_RECIPES,
  STUDIO_SHOP_FILTERS,
} from '../data/photoStudio';
import { getPetSpeciesInfo } from '../data/species';
import {
  GameState,
  Pet,
  PetPersonality,
  PetViewDirection,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoScene,
  PhotoStickerId,
  RoomPhotoRecord,
  SharedPetRoom,
} from '../types';
import { DuoPhotoPetInfo } from '../types/house';
import { getPetDisplayPersonality } from '../utils/pets';
import {
  createInitialPhotoStudioState,
  evaluateWeeklyOutfitScore,
  getLocalWeekKey,
  getOrCreateWeeklyDuoChallenge,
  getStudioCollectionProgress,
  getWeekTimeRemainingText,
  getWeeklyChallengeTitleSuggestion,
  getWeeklyOutfitChallengeTheme,
  getWeeklyStudioShopRotation,
} from '../utils/photoStudio';
import { PiggyCharacter } from './PiggyCharacter';
import { StudioBackgroundArt } from './studio/StudioBackgroundArt';

type StudioTab = 'shoot' | 'shop' | 'challenge' | 'duo' | 'catalog';
type ShootStep = 'pose' | 'background' | 'filter' | 'frame' | 'sticker' | 'capture';

interface WardrobePhotoModalProps {
  open: boolean;
  onClose: () => void;
  game?: GameState;
  pet: Pet;
  personality?: PetPersonality;
  coins?: number;
  currentUserId?: string;
  actorName?: string;
  sharedRoom: SharedPetRoom | null;
  initialScene?: PhotoScene;
  initialTab?: StudioTab;
  unlockedPoses?: PhotoPose[];
  unlockedFrames?: PhotoFrame[];
  onSavePhoto: (params: {
    title: string;
    caption: string;
    scene: PhotoScene;
    poseId: PhotoPose;
    backgroundId?: PhotoBackground;
    facing?: PetViewDirection;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
    duoPet?: DuoPhotoPetInfo;
    isCoopPhoto?: boolean;
  }) => RoomPhotoRecord;
  onSharePhotoToBoard?: (photo: RoomPhotoRecord, caption: string) => Promise<string | null>;
  onBuyPose?: (poseId: PhotoPose) => void;
  onBuyBackground?: (bgId: PhotoBackground) => void;
  onBuyFilter?: (filterId: PhotoFilter) => void;
  onBuyFrame?: (frameId: PhotoFrame) => void;
  onBuySticker?: (stickerId: PhotoStickerId) => void;
  onCraftRecipe?: (recipeId: string) => void;
  onSubmitWeeklyChallenge?: (params: {
    title: string;
    caption: string;
    poseId: PhotoPose;
    backgroundId: PhotoBackground;
    facing: PetViewDirection;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }) => RoomPhotoRecord | null;
  onClaimChallengeTier?: (tier: 60 | 100 | 150) => void;
  onSubmitDuoChallenge?: (params: {
    pet: Pet;
    poseId: PhotoPose;
    facing: PetViewDirection;
    title: string;
    backgroundId: PhotoBackground;
    filterId: PhotoFilter;
    frameId: PhotoFrame;
    stickers: PhotoStickerId[];
  }) => RoomPhotoRecord | null;
  onClaimDuoChallengeReward?: () => void;
  onOpenSharedPet?: () => void;
}

const SHOOT_STEPS: Array<{ id: ShootStep; label: string; emoji: string }> = [
  { id: 'pose', label: '姿勢', emoji: '✨' },
  { id: 'background', label: '背景', emoji: '🏞️' },
  { id: 'filter', label: '濾鏡', emoji: '🎨' },
  { id: 'frame', label: '相框', emoji: '🖼️' },
  { id: 'sticker', label: '貼圖', emoji: '🩷' },
  { id: 'capture', label: '拍照', emoji: '📸' },
];

export const WardrobePhotoModal: React.FC<WardrobePhotoModalProps> = ({
  open,
  onClose,
  game,
  pet,
  personality,
  coins: coinsProp,
  currentUserId = 'local',
  sharedRoom,
  initialScene = 'wardrobe',
  initialTab = 'shoot',
  unlockedPoses = [],
  unlockedFrames = [],
  onSavePhoto,
  onSharePhotoToBoard,
  onBuyPose,
  onBuyBackground,
  onBuyFilter,
  onBuyFrame,
  onBuySticker,
  onCraftRecipe,
  onSubmitWeeklyChallenge,
  onClaimChallengeTier,
  onSubmitDuoChallenge,
  onClaimDuoChallengeReward,
  onOpenSharedPet,
}) => {
  const [studioTab, setStudioTab] = useState<StudioTab>(initialTab);
  const [shootStep, setShootStep] = useState<ShootStep>('pose');
  const [scene, setScene] = useState<PhotoScene>(initialScene);
  const [poseId, setPoseId] = useState<PhotoPose>('happy');
  const [backgroundId, setBackgroundId] = useState<PhotoBackground>('pink_room');
  const [facing, setFacing] = useState<PetViewDirection>('front');
  const [filterId, setFilterId] = useState<PhotoFilter>('none');
  const [frameId, setFrameId] = useState<PhotoFrame>('none');
  const [stickers, setStickers] = useState<PhotoStickerId[]>([]);
  const [title, setTitle] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Duo Photo State
  const [duoPartnerIndex, setDuoPartnerIndex] = useState<number>(0);
  const [duoPartnerPoseId, setDuoPartnerPoseId] = useState<PhotoPose>('happy');
  const [duoTitle, setDuoTitle] = useState<string>('');

  const coins = coinsProp ?? game?.coins ?? 0;
  const studio = game?.photoStudio ?? createInitialPhotoStudioState();
  const weekKey = getLocalWeekKey();
  const weeklyTheme = getWeeklyOutfitChallengeTheme(weekKey);
  const weeklyRotation = getWeeklyStudioShopRotation(weekKey);
  const timeRemainingText = getWeekTimeRemainingText();

  const effectivePersonality: PetPersonality =
    personality ??
    (game
      ? getPetDisplayPersonality(game, pet)
      : {
          primary: 'clingy',
          secondary: 'lively',
          scores: {
            greedy: 10,
            sleepy: 10,
            mischievous: 10,
            clingy: 25,
            elegant: 10,
            curious: 10,
            lively: 20,
            shy: 10,
          },
          careActionCounts: {},
          lastUpdatedAt: 0,
        });

  const ownedPoseSet = useMemo(
    () =>
      new Set<PhotoPose>([
        'happy',
        'shy',
        'sleep',
        'eat',
        ...unlockedPoses,
        ...studio.unlockedPoses,
      ]),
    [unlockedPoses, studio.unlockedPoses]
  );

  const ownedBgSet = useMemo(
    () =>
      new Set<PhotoBackground>([
        'pink_room',
        'strawberry_field',
        'cloud_sky',
        'kitchen',
        ...studio.unlockedBackgrounds,
      ]),
    [studio.unlockedBackgrounds]
  );

  const ownedFilterSet = useMemo(
    () =>
      new Set<PhotoFilter>([
        'none',
        'forest',
        'cloud',
        'kitchen',
        'party',
        ...studio.unlockedFilters,
      ]),
    [studio.unlockedFilters]
  );

  const ownedFrameSet = useMemo(
    () =>
      new Set<PhotoFrame>([
        'none',
        ...unlockedFrames,
        ...studio.unlockedFrames,
      ]),
    [unlockedFrames, studio.unlockedFrames]
  );

  const ownedStickerSet = useMemo(
    () => new Set<PhotoStickerId>(studio.unlockedStickers),
    [studio.unlockedStickers]
  );

  // Duo pet candidates: partner's showcase pets first, then other household pets
  const duoPartnerCandidates = useMemo<Pet[]>(() => {
    const list: Pet[] = [];
    const seen = new Set<string>();
    const partnerShowcase = game?.coop.partnerShowcasePets ?? [];
    for (const p of partnerShowcase) {
      if (p.id !== pet.id && !seen.has(p.id)) {
        seen.add(p.id);
        list.push(p);
      }
    }
    for (const p of game?.pets ?? []) {
      if (p.id !== pet.id && !seen.has(p.id)) {
        seen.add(p.id);
        list.push(p);
      }
    }
    if (list.length === 0) {
      // Fallback preview partner when shared room exists with single pet
      list.push({
        ...pet,
        id: 'coop_partner_preview',
        name: sharedRoom?.partnerEmail?.split('@')[0]
          ? `${sharedRoom.partnerEmail.split('@')[0].slice(0, 4)}的寶貝`
          : '夥伴咪',
        species: pet.species === 'cat' ? 'pig' : 'cat',
      });
    }
    return list;
  }, [game?.coop.partnerShowcasePets, game?.pets, pet, sharedRoom]);

  const selectedDuoPartner =
    duoPartnerCandidates[duoPartnerIndex % duoPartnerCandidates.length] ??
    duoPartnerCandidates[0];

  useEffect(() => {
    if (!open) return;
    setSavedNotice('');
    setStudioTab(initialTab);
    setShootStep('pose');
    setScene(initialScene);
    const defaultBg: PhotoBackground =
      initialScene === 'farm'
        ? 'strawberry_field'
        : initialScene === 'room'
        ? 'kitchen'
        : 'pink_room';
    setBackgroundId(defaultBg);
    setFilterId('none');
    setFrameId(ownedFrameSet.has('rounded') ? 'rounded' : 'none');
    setPoseId('happy');
    setFacing('front');
    setStickers([]);
    const sceneMeta = PHOTO_SCENE_BY_ID[initialScene] ?? PHOTO_SCENES[0];
    setTitle(`${pet.name}的${sceneMeta.defaultTitleSuffix}`.slice(0, 20));
    setCaption('');
    setDuoTitle(`${pet.name}與${selectedDuoPartner.name}的野餐日`.slice(0, 20));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialScene, initialTab, pet.name]);

  if (!open) return null;

  const activeScene = PHOTO_SCENE_BY_ID[scene] ?? PHOTO_SCENES[0];
  const activePose = PHOTO_POSE_BY_ID[poseId] ?? PHOTO_POSE_BY_ID.happy;
  const activeBg = PHOTO_BACKGROUND_BY_ID[backgroundId] ?? PHOTO_BACKGROUND_BY_ID.pink_room;
  const activeFilter = PHOTO_FILTER_BY_ID[filterId] ?? PHOTO_FILTER_BY_ID.none;
  const activeFrame = PHOTO_FRAME_BY_ID[frameId] ?? PHOTO_FRAME_BY_ID.none;
  const isDarkStage = Boolean(activeBg.isDark) || filterId === 'starry';
  const todayLabel = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const challengeEvaluation = evaluateWeeklyOutfitScore({
    pet,
    personality: effectivePersonality,
    backgroundId,
    filterId,
    frameId,
    theme: weeklyTheme,
  });

  const collectionProgress = getStudioCollectionProgress(studio);
  const duoChallengeState = game
    ? getOrCreateWeeklyDuoChallenge(game)
    : null;
  const duoSubmissionsList = duoChallengeState
    ? Object.values(duoChallengeState.submissions)
    : [];
  const hasSubmittedDuo = duoChallengeState
    ? Boolean(duoChallengeState.submissions[currentUserId || 'local'])
    : false;
  const hasClaimedDuo = duoChallengeState
    ? duoChallengeState.claimedByUserIds.includes(currentUserId || 'local')
    : false;

  const showToastNotice = (msg: string) => {
    setSavedNotice(msg);
  };

  const toggleSticker = (id: PhotoStickerId) => {
    if (!ownedStickerSet.has(id)) return;
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
        `${activeBg.label} · ${activePose.label} · ${activeFilter.label}濾鏡紀念`,
      scene,
      poseId,
      backgroundId,
      facing,
      filterId,
      frameId,
      stickers,
    });
    showToastNotice(`已將「${photo.title}」存入照片牆與回憶冊！`);
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
        `在${activeBg.label}留下可愛穿搭照～（${activePose.label}・${activeFilter.label}）`;
      const photo = onSavePhoto({
        title: getCleanTitle(),
        caption: cleanCaption,
        scene,
        poseId,
        backgroundId,
        facing,
        filterId,
        frameId,
        stickers,
      });
      const err = await onSharePhotoToBoard(photo, cleanCaption);
      showToastNotice(
        err
          ? `已儲存到照片牆！（留言板提醒：${err}）`
          : sharedRoom
          ? '已存入照片牆並同步分享給共養夥伴！'
          : '已存入照片牆並發佈到留言板！'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitChallenge = async (shareToBoard: boolean) => {
    if (!onSubmitWeeklyChallenge) return;
    setSubmitting(true);
    try {
      const challengeTitle =
        title.trim().slice(0, 20) ||
        getWeeklyChallengeTitleSuggestion(pet.name, weeklyTheme.id);
      const photo = onSubmitWeeklyChallenge({
        title: challengeTitle,
        caption:
          caption.trim() ||
          `參加每週穿搭主題「${weeklyTheme.title}」，個人評分 ${challengeEvaluation.totalScore} 分！`,
        poseId,
        backgroundId,
        facing,
        filterId,
        frameId,
        stickers,
      });
      if (photo && shareToBoard && onSharePhotoToBoard) {
        await onSharePhotoToBoard(
          photo,
          `參加本週主題「${weeklyTheme.title}」獲得 ${challengeEvaluation.totalScore} 分！`
        );
      }
      if (photo) {
        showToastNotice(
          `投稿成功！本週「${weeklyTheme.title}」評分 ${challengeEvaluation.totalScore} 分`
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDuoPhoto = async (shareToBoard: boolean) => {
    const cleanDuoTitle =
      duoTitle.trim().slice(0, 20) ||
      `${pet.name}與${selectedDuoPartner.name}的合照`.slice(0, 20);
    setSubmitting(true);
    try {
      const photo = onSavePhoto({
        title: cleanDuoTitle,
        caption: `${pet.name}與${selectedDuoPartner.name}在「${activeBg.label}」拍下超有愛雙人寫真！`,
        scene: 'wardrobe',
        poseId,
        backgroundId,
        facing,
        filterId,
        frameId,
        stickers,
        isCoopPhoto: Boolean(sharedRoom),
        duoPet: {
          petId: selectedDuoPartner.id,
          petName: selectedDuoPartner.name,
          species: selectedDuoPartner.species,
          equipped: { ...selectedDuoPartner.accessories },
          poseId: duoPartnerPoseId,
          facing: 'front',
          weightAtCapture: selectedDuoPartner.weight,
        },
      });
      if (shareToBoard && onSharePhotoToBoard) {
        const err = await onSharePhotoToBoard(
          photo,
          `💞 ${pet.name}與${selectedDuoPartner.name}的雙人合照「${cleanDuoTitle}」！`
        );
        showToastNotice(
          err
            ? `已存入雙人合照！（留言板提醒：${err}）`
            : '雙人合照已存入照片牆並分享到留言板！'
        );
      } else {
        showToastNotice(`已將雙人合照「${photo.title}」存入照片牆！`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderLiveStage = (duoPartner?: Pet | null) => {
    const duoPose = PHOTO_POSE_BY_ID[duoPartnerPoseId] ?? PHOTO_POSE_BY_ID.happy;
    return (
      <div className={`${activeFrame.outerClass} relative`}>
        {activeFrame.cornerEmojis && (
          <>
            <span
              className="pointer-events-none absolute -top-2 -left-1.5 text-lg select-none z-20"
              aria-hidden="true"
            >
              {activeFrame.cornerEmojis[0]}
            </span>
            <span
              className="pointer-events-none absolute -top-2 -right-1.5 text-lg select-none z-20"
              aria-hidden="true"
            >
              {activeFrame.cornerEmojis[1]}
            </span>
          </>
        )}

        <div
          className={`${activeFrame.innerClass} bg-[#FFFDF8] relative min-h-[214px] flex flex-col items-center justify-between px-3 py-3 overflow-hidden`}
          style={{
            filter:
              activeFilter.stageFilterCss && activeFilter.stageFilterCss !== 'none'
                ? activeFilter.stageFilterCss
                : undefined,
          }}
        >
          <StudioBackgroundArt backgroundId={backgroundId} filterId={filterId} />

          {/* Selected Stickers Overlay */}
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
            className={`relative z-10 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[10px] font-extrabold ${
              isDarkStage
                ? 'bg-black/35 border-white/30 text-white'
                : 'bg-white/85 border-white text-[#5A3E36]'
            }`}
          >
            <span>{activeBg.emoji}</span>
            <span>{activeBg.label}</span>
            <span>·</span>
            <span>{activePose.emoji}</span>
            <span>{activePose.label}</span>
            {filterId !== 'none' && (
              <>
                <span>·</span>
                <span>{activeFilter.label}</span>
              </>
            )}
          </div>

          <div className="relative z-10 flex items-end justify-center gap-2 my-1 drop-shadow-md">
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
              size={duoPartner ? 118 : 146}
            />
            {duoPartner && (
              <PiggyCharacter
                species={duoPartner.species}
                growth={duoPartner.growth}
                roundness={duoPartner.roundness}
                action={duoPose.action}
                expression={duoPose.expression}
                equipped={duoPartner.accessories}
                interactive={false}
                customAnimClass={duoPose.animClass}
                viewDirection="front"
                size={118}
              />
            )}
          </div>

          {/* Auto-displayed Date, Pet Name & Weight */}
          <div
            className={`relative z-10 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tabular-nums ${
              isDarkStage
                ? 'bg-black/35 text-white/95'
                : 'bg-white/85 text-[#5A3E36]'
            }`}
          >
            <span>{todayLabel}</span>
            <span>·</span>
            <span>
              {duoPartner ? `${pet.name} & ${duoPartner.name}` : pet.name}
            </span>
            <span>·</span>
            <span>{pet.weight.toFixed(1)} kg</span>
          </div>
        </div>

        {activeFrame.isPolaroid && (
          <div className="pt-2 px-1 flex items-center justify-between text-[11px] font-extrabold text-[#5A3E36]">
            <span className="truncate">
              {duoPartner ? duoTitle || `${pet.name} & ${duoPartner.name}` : getCleanTitle()}
            </span>
            <span className="text-[10px] text-[#8E756E] tabular-nums shrink-0">
              {pet.weight.toFixed(1)} kg · 萌寵食堂
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2621]/55 backdrop-blur-xs flex items-center justify-center p-2 overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wardrobe-photo-title"
    >
      <div className="w-full max-w-[424px] max-h-[93dvh] rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD7] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-4 py-2.5 bg-gradient-to-r from-[#FFEAF0] via-[#FFF6DA] to-[#E8F8F2] border-b border-[#F2DFD5] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-white/90 text-[#D64470] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="wardrobe-photo-title"
                className="text-sm font-extrabold text-[#4A3531] truncate"
              >
                {pet.name}的穿搭攝影棚
              </h2>
              <p className="text-[11px] font-bold text-[#7D635D] tabular-nums truncate">
                🪙 {coins} · 🎞️ {studio.studioMaterials} 材料 · 🖼️ {studio.studioFrameShards} 碎片
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

        {/* Top 5 Studio Mode Tabs */}
        <nav
          aria-label="攝影棚分頁"
          className="px-3 pt-2 pb-1.5 bg-[#FFF8F2] border-b border-[#F2DFD5] shrink-0"
        >
          <div className="grid grid-cols-5 gap-1 bg-[#F2E5DE] p-1 rounded-2xl">
            {(
              [
                { id: 'shoot', label: '拍攝棚', icon: Camera },
                { id: 'shop', label: '商店', icon: ShoppingBag },
                { id: 'challenge', label: '挑戰', icon: Trophy },
                { id: 'duo', label: '雙人', icon: Users },
                { id: 'catalog', label: '圖鑑', icon: Award },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = studioTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSavedNotice('');
                    setStudioTab(tab.id);
                  }}
                  className={`min-h-[40px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 whitespace-nowrap transition ${
                    active
                      ? 'bg-white text-[#D64470] shadow-xs'
                      : 'text-[#6E544E] hover:text-[#4A3531]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5">
          {savedNotice && (
            <div className="rounded-2xl bg-[#E4F7F0] border border-[#A7E0CB] px-3 py-2 text-xs font-extrabold text-[#1F6B54] flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span className="leading-snug">{savedNotice}</span>
            </div>
          )}

          {/* TAB 1: STUDIO SHOOT */}
          {studioTab === 'shoot' && (
            <>
              {renderLiveStage(null)}

              {/* Step Sequence Indicator: 姿勢 → 背景 → 濾鏡 → 相框 → 貼圖 → 拍照 */}
              <div className="grid grid-cols-6 gap-1 bg-[#F6ECE6] p-1 rounded-2xl">
                {SHOOT_STEPS.map((st) => {
                  const active = shootStep === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setShootStep(st.id)}
                      className={`min-h-[40px] rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center leading-tight whitespace-nowrap transition ${
                        active
                          ? 'bg-white text-[#D64470] shadow-xs'
                          : 'text-[#7D635D] hover:text-[#4A3531]'
                      }`}
                    >
                      <span aria-hidden="true" className="text-xs">
                        {st.emoji}
                      </span>
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Step 1: Poses */}
              {shootStep === 'pose' && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <h3 className="text-xs font-extrabold text-[#4A3531]">
                      1. 選擇動作姿勢
                    </h3>
                    <span className="text-[11px] font-bold text-[#7D635D]">
                      {activePose.description}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PHOTO_POSES.map((pose) => {
                      const unlocked = ownedPoseSet.has(pose.id);
                      const selected = poseId === pose.id;
                      const inWeeklyShop = weeklyRotation.poses.includes(pose.id);
                      return (
                        <button
                          key={pose.id}
                          type="button"
                          onClick={() => {
                            if (unlocked) {
                              setPoseId(pose.id);
                            } else if (inWeeklyShop && onBuyPose) {
                              setStudioTab('shop');
                            } else {
                              showToastNotice(pose.unlockHint || '尚未解鎖此姿勢');
                            }
                          }}
                          className={`min-h-[48px] rounded-2xl px-2 py-1.5 border-2 text-[11px] font-extrabold flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
                            !unlocked
                              ? 'bg-[#F3ECE8] border-[#E4D6CE] text-[#8E7B75]'
                              : selected
                              ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#C43463] shadow-xs'
                              : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36]'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {unlocked ? (
                              <span aria-hidden="true">{pose.emoji}</span>
                            ) : (
                              <Lock className="w-3 h-3 shrink-0" />
                            )}
                            <span className="truncate">{pose.label}</span>
                          </div>
                          {!unlocked && (
                            <span className="text-[9px] font-bold text-[#9D5B12]">
                              {inWeeklyShop
                                ? `本週商店 ${pose.price}🪙`
                                : pose.source === 'shop'
                                ? `${pose.price}🪙 (輪替)`
                                : '成就解鎖'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-extrabold text-[#5A3E36]">
                      🔄 轉動角度（展現正面或背後翅膀）
                    </p>
                    <div className="grid grid-cols-5 gap-1">
                      {(
                        [
                          { id: 'front', label: '正面' },
                          { id: 'flipped', label: '翻轉' },
                          { id: 'left', label: '朝左' },
                          { id: 'back', label: '背面' },
                          { id: 'right', label: '朝右' },
                        ] as const
                      ).map((dir) => (
                        <button
                          key={dir.id}
                          type="button"
                          onClick={() => setFacing(dir.id)}
                          className={`min-h-[40px] rounded-xl border text-[11px] font-extrabold whitespace-nowrap transition ${
                            facing === dir.id
                              ? 'bg-[#E6F8F1] border-[#5CC9A7] text-[#1F6B54]'
                              : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36]'
                          }`}
                        >
                          {dir.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Step 2: Backgrounds */}
              {shootStep === 'background' && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <h3 className="text-xs font-extrabold text-[#4A3531]">
                      2. 選擇攝影棚背景
                    </h3>
                    <span className="text-[11px] font-bold text-[#7D635D]">
                      {activeBg.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PHOTO_BACKGROUNDS.map((bg) => {
                      const unlocked = ownedBgSet.has(bg.id);
                      const selected = backgroundId === bg.id;
                      const inShop = weeklyRotation.backgrounds.includes(bg.id);
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => {
                            if (unlocked) {
                              setBackgroundId(bg.id);
                            } else if (inShop && onBuyBackground) {
                              setStudioTab('shop');
                            } else if (bg.source === 'limited') {
                              setStudioTab('catalog');
                            } else {
                              showToastNotice(bg.unlockHint || '等待每週輪替商店上架');
                            }
                          }}
                          className={`min-h-[52px] rounded-2xl p-2 border-2 text-left flex items-center gap-2 transition active:scale-95 ${
                            !unlocked
                              ? 'bg-[#F3ECE8] border-[#E4D6CE] text-[#8E7B75]'
                              : selected
                              ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#C43463] shadow-xs'
                              : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36]'
                          }`}
                        >
                          <span className="text-xl shrink-0" aria-hidden="true">
                            {unlocked ? bg.emoji : '🔒'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-extrabold truncate">
                              {bg.label}
                            </div>
                            <div className="text-[10px] font-bold opacity-85 truncate">
                              {unlocked
                                ? bg.source === 'limited'
                                  ? '限定已解鎖'
                                  : '已擁有'
                                : inShop
                                ? `本週特賣 ${bg.price}🪙`
                                : bg.source === 'limited'
                                ? '限定 / 材料合成'
                                : `${bg.price}🪙 (輪替)`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Step 3: Filters */}
              {shootStep === 'filter' && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <h3 className="text-xs font-extrabold text-[#4A3531]">
                      3. 選擇濾鏡（6 款攝影濾鏡＋原圖）
                    </h3>
                    <span className="text-[11px] font-bold text-[#7D635D]">
                      {activeFilter.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {STUDIO_SHOP_FILTERS.map((fl) => {
                      const unlocked = ownedFilterSet.has(fl.id);
                      const selected = filterId === fl.id;
                      const inShop = weeklyRotation.filters.includes(fl.id);
                      return (
                        <button
                          key={fl.id}
                          type="button"
                          onClick={() => {
                            if (unlocked) {
                              setFilterId(fl.id);
                            } else if (inShop && onBuyFilter) {
                              setStudioTab('shop');
                            } else {
                              showToastNotice(fl.unlockHint || '等待每週商店輪替或合成');
                            }
                          }}
                          className={`min-h-[48px] rounded-2xl px-3 border-2 flex items-center justify-between gap-2 transition active:scale-95 ${
                            !unlocked
                              ? 'bg-[#F3ECE8] border-[#E4D6CE] text-[#8E7B75]'
                              : selected
                              ? 'bg-[#E6F8F1] border-[#5CC9A7] text-[#1F6B54] shadow-xs'
                              : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36]'
                          }`}
                        >
                          <span className="text-xs font-extrabold flex items-center gap-1.5">
                            <span>{unlocked ? fl.emoji : '🔒'}</span>
                            <span>{fl.label}</span>
                          </span>
                          <span className="text-[10px] font-bold tabular-nums">
                            {unlocked
                              ? fl.source === 'free'
                                ? '免費'
                                : '已擁有'
                              : inShop
                              ? `本週 ${fl.price}🪙`
                              : `${fl.price}🪙`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Step 4: Frames */}
              {shootStep === 'frame' && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <h3 className="text-xs font-extrabold text-[#4A3531]">
                      4. 選擇相框
                    </h3>
                    <span className="text-[11px] font-bold text-[#7D635D]">
                      {activeFrame.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PHOTO_FRAMES.map((fr) => {
                      const unlocked = ownedFrameSet.has(fr.id);
                      const selected = frameId === fr.id;
                      const inShop = weeklyRotation.frames.includes(fr.id);
                      return (
                        <button
                          key={fr.id}
                          type="button"
                          onClick={() => {
                            if (unlocked) {
                              setFrameId(fr.id);
                            } else if (inShop && onBuyFrame) {
                              setStudioTab('shop');
                            } else {
                              showToastNotice(fr.unlockHint || '待輪替或使用相框碎片合成');
                            }
                          }}
                          className={`min-h-[48px] rounded-2xl px-2 py-1 border-2 text-[11px] font-extrabold flex flex-col items-center justify-center transition active:scale-95 ${
                            !unlocked
                              ? 'bg-[#F3ECE8] border-[#E4D6CE] text-[#8E7B75]'
                              : selected
                              ? 'bg-[#FFF3D1] border-[#F2C94C] text-[#8A5610] shadow-xs'
                              : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36]'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {unlocked ? (
                              <span>{fr.emoji}</span>
                            ) : (
                              <Lock className="w-3 h-3 shrink-0" />
                            )}
                            <span className="truncate">{fr.label}</span>
                          </div>
                          {!unlocked && (
                            <span className="text-[9px] font-bold text-[#9D5B12]">
                              {inShop
                                ? `本週 ${fr.price}🪙`
                                : fr.source === 'shop'
                                ? `${fr.price}🪙`
                                : '里程碑'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Step 5: Stickers (12 stickers) */}
              {shootStep === 'sticker' && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <h3 className="text-xs font-extrabold text-[#4A3531]">
                      5. 貼上可愛貼圖（購入後可重複使用）
                    </h3>
                    <span className="text-[11px] font-bold text-[#7D635D] tabular-nums">
                      已貼 {stickers.length} / 6
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PHOTO_STICKERS.map((st) => {
                      const owned = ownedStickerSet.has(st.id);
                      const selected = stickers.includes(st.id);
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            if (owned) {
                              toggleSticker(st.id);
                            } else if (onBuySticker) {
                              onBuySticker(st.id);
                            }
                          }}
                          className={`min-h-[48px] rounded-2xl px-2 py-1 border-2 text-[11px] font-extrabold flex flex-col items-center justify-center transition active:scale-95 ${
                            !owned
                              ? 'bg-[#FFF9EB] border-[#F0D9A8] text-[#8A5610]'
                              : selected
                              ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#C43463] shadow-xs'
                              : 'bg-[#FFFDF8] border-[#EFE0D7] text-[#5A3E36]'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{st.emoji}</span>
                            <span>{st.label}</span>
                          </div>
                          <span className="text-[9px] font-bold tabular-nums">
                            {owned
                              ? selected
                                ? '✓ 已貼上'
                                : '點擊貼上'
                              : `${st.price}🪙 購買`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Step 6: Capture & Save */}
              {shootStep === 'capture' && (
                <section className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#7D635D]">
                      <span>相片標題（最長 20 字）</span>
                      <span className="tabular-nums">{title.length}/20</span>
                    </div>
                    <input
                      type="text"
                      maxLength={20}
                      value={title}
                      onChange={(e) => setTitle(e.target.value.slice(0, 20))}
                      placeholder={`${pet.name}的${activeScene.defaultTitleSuffix}`}
                      className="w-full min-h-[44px] rounded-2xl bg-white border border-[#EED9D0] px-3.5 text-sm font-bold text-[#4A3531] placeholder:text-[#B5A19B] focus:outline-none focus:border-[#FF7A9E]"
                    />
                  </div>
                  <input
                    type="text"
                    maxLength={60}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="寫一句今天的心得或紀念吧（選填）"
                    className="w-full min-h-[44px] rounded-2xl bg-white border border-[#EED9D0] px-3.5 text-sm font-medium text-[#4A3531] placeholder:text-[#B5A19B] focus:outline-none focus:border-[#FF7A9E]"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSaveOnly}
                      className="min-h-[46px] rounded-2xl bg-[#FFF3D8] border-2 border-[#F2CE6D] text-xs font-extrabold text-[#8A5610] inline-flex items-center justify-center gap-1.5 hover:bg-[#FFE9BF] active:scale-95 transition"
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
                      className="min-h-[46px] rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center justify-center gap-1.5 hover:bg-[#F76890] active:translate-y-0.5 transition"
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      <span>{sharedRoom ? '存檔並分享共養' : '存檔並發留言板'}</span>
                    </button>
                  </div>
                </section>
              )}

              {/* Step Quick Next Action when on steps 1..5 */}
              {shootStep !== 'capture' && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveOnly}
                    className="min-h-[44px] px-3.5 rounded-2xl bg-[#FFF3D8] border border-[#F2CE6D] text-xs font-extrabold text-[#8A5610] inline-flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>直接快拍</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = SHOOT_STEPS.findIndex((s) => s.id === shootStep);
                      const next = SHOOT_STEPS[Math.min(SHOOT_STEPS.length - 1, idx + 1)];
                      setShootStep(next.id);
                    }}
                    className="min-h-[44px] flex-1 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center justify-center gap-1"
                  >
                    <span>
                      下一步：
                      {
                        SHOOT_STEPS[
                          Math.min(
                            SHOOT_STEPS.length - 1,
                            SHOOT_STEPS.findIndex((s) => s.id === shootStep) + 1
                          )
                        ].label
                      }
                    </span>
                    <span>›</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* TAB 2: WEEKLY ROTATING STUDIO SHOP */}
          {studioTab === 'shop' && (
            <div className="space-y-3.5">
              <section className="rounded-2xl bg-gradient-to-r from-[#FFF3D8] to-[#FFEAF0] border border-[#F2D5DF] p-3 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-extrabold text-[#4A3531]">
                    🛍️ 每週輪替攝影商店
                  </h3>
                  <p className="text-[11px] font-bold text-[#7D635D]">
                    每週一更新 2 濾鏡 · 2 相框 · 1 背景 · 1 姿勢
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#B83B64] tabular-nums shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeRemainingText}</span>
                </span>
              </section>

              {/* Rotating Filters (2) */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-[#4A3531]">🎨 本週輪替濾鏡 (2)</h4>
                <div className="grid grid-cols-2 gap-2">
                  {weeklyRotation.filters.map((fid) => {
                    const fl = PHOTO_FILTER_BY_ID[fid];
                    const owned = ownedFilterSet.has(fid);
                    return (
                      <article
                        key={fid}
                        className="rounded-2xl bg-white border-2 border-[#EFE0D7] p-2.5 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{fl.emoji}</span>
                          <div>
                            <div className="text-xs font-extrabold text-[#4A3531]">{fl.label}濾鏡</div>
                            <div className="text-[11px] font-bold text-[#8A5610] tabular-nums">
                              {fl.price} 金幣
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={owned || coins < fl.price}
                          onClick={() => onBuyFilter?.(fid)}
                          className={`min-h-[40px] w-full rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1 transition ${
                            owned
                              ? 'bg-[#E6F8F1] text-[#1F6B54]'
                              : coins >= fl.price
                              ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E] active:scale-95'
                              : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                          }`}
                        >
                          {owned ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>已擁有</span>
                            </>
                          ) : (
                            <>
                              <Coins className="w-3.5 h-3.5" />
                              <span>{fl.price} 金幣購買</span>
                            </>
                          )}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Rotating Frames (2) */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-[#4A3531]">🖼️ 本週輪替相框 (2)</h4>
                <div className="grid grid-cols-2 gap-2">
                  {weeklyRotation.frames.map((frid) => {
                    const fr = PHOTO_FRAME_BY_ID[frid];
                    const owned = ownedFrameSet.has(frid);
                    return (
                      <article
                        key={frid}
                        className="rounded-2xl bg-white border-2 border-[#EFE0D7] p-2.5 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{fr.emoji}</span>
                          <div>
                            <div className="text-xs font-extrabold text-[#4A3531]">{fr.label}相框</div>
                            <div className="text-[11px] font-bold text-[#8A5610] tabular-nums">
                              {fr.price} 金幣
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={owned || coins < fr.price}
                          onClick={() => onBuyFrame?.(frid)}
                          className={`min-h-[40px] w-full rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1 transition ${
                            owned
                              ? 'bg-[#E6F8F1] text-[#1F6B54]'
                              : coins >= fr.price
                              ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E] active:scale-95'
                              : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                          }`}
                        >
                          {owned ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>已擁有</span>
                            </>
                          ) : (
                            <>
                              <Coins className="w-3.5 h-3.5" />
                              <span>{fr.price} 金幣購買</span>
                            </>
                          )}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Rotating Background (1) & Pose (1) */}
              <div className="grid grid-cols-2 gap-2">
                {weeklyRotation.backgrounds.map((bgId) => {
                  const bg = PHOTO_BACKGROUND_BY_ID[bgId];
                  const owned = ownedBgSet.has(bgId);
                  return (
                    <article
                      key={bgId}
                      className="rounded-2xl bg-white border-2 border-[#EFE0D7] p-2.5 flex flex-col justify-between gap-2"
                    >
                      <div>
                        <span className="text-[10px] font-extrabold text-[#256D57]">
                          🏞️ 本週背景 (1)
                        </span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-2xl">{bg.emoji}</span>
                          <div>
                            <div className="text-xs font-extrabold text-[#4A3531]">{bg.label}</div>
                            <div className="text-[11px] font-bold text-[#8A5610] tabular-nums">
                              {bg.price} 金幣
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={owned || coins < bg.price}
                        onClick={() => onBuyBackground?.(bgId)}
                        className={`min-h-[40px] w-full rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1 ${
                          owned
                            ? 'bg-[#E6F8F1] text-[#1F6B54]'
                            : coins >= bg.price
                            ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E]'
                            : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                        }`}
                      >
                        {owned ? '✓ 已擁有' : `${bg.price}🪙 購買`}
                      </button>
                    </article>
                  );
                })}

                {weeklyRotation.poses.map((pId) => {
                  const pose = PHOTO_POSE_BY_ID[pId];
                  const owned = ownedPoseSet.has(pId);
                  return (
                    <article
                      key={pId}
                      className="rounded-2xl bg-white border-2 border-[#EFE0D7] p-2.5 flex flex-col justify-between gap-2"
                    >
                      <div>
                        <span className="text-[10px] font-extrabold text-[#C43463]">
                          ✨ 本週姿勢 (1)
                        </span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-2xl">{pose.emoji}</span>
                          <div>
                            <div className="text-xs font-extrabold text-[#4A3531]">{pose.label}</div>
                            <div className="text-[11px] font-bold text-[#8A5610] tabular-nums">
                              {pose.price} 金幣
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={owned || coins < pose.price}
                        onClick={() => onBuyPose?.(pId)}
                        className={`min-h-[40px] w-full rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1 ${
                          owned
                            ? 'bg-[#E6F8F1] text-[#1F6B54]'
                            : coins >= pose.price
                            ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E]'
                            : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                        }`}
                      >
                        {owned ? '✓ 已擁有' : `${pose.price}🪙 購買`}
                      </button>
                    </article>
                  );
                })}
              </div>

              {/* All 12 Stickers Shop */}
              <div className="space-y-1.5 pt-1">
                <h4 className="text-xs font-extrabold text-[#4A3531]">
                  🩷 可愛相片貼圖（12 款，購買後永久重複使用）
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {PHOTO_STICKERS.map((st) => {
                    const owned = ownedStickerSet.has(st.id);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        disabled={owned || coins < st.price}
                        onClick={() => onBuySticker?.(st.id)}
                        className={`min-h-[50px] rounded-2xl p-1.5 border text-[11px] font-extrabold flex flex-col items-center justify-center transition ${
                          owned
                            ? 'bg-[#E6F8F1] border-[#A7E0CB] text-[#1F6B54]'
                            : coins >= st.price
                            ? 'bg-white border-[#F2CE6D] text-[#7A540E] active:scale-95'
                            : 'bg-[#F3ECE8] border-[#E4D6CE] text-[#9E8B84] cursor-not-allowed'
                        }`}
                      >
                        <span>
                          {st.emoji} {st.label}
                        </span>
                        <span className="text-[10px] font-bold tabular-nums">
                          {owned ? '✓ 已擁有' : `${st.price} 金幣`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEEKLY OUTFIT CHALLENGE (PERSONAL SCORING) */}
          {studioTab === 'challenge' && (
            <div className="space-y-3">
              <section
                className={`rounded-2xl border-2 p-3 space-y-1.5 ${weeklyTheme.badgeClass}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold">
                    {weeklyTheme.emoji} 本週穿搭主題：{weeklyTheme.title}
                  </h3>
                  <span className="text-[10px] font-bold tabular-nums shrink-0">
                    {timeRemainingText}
                  </span>
                </div>
                <p className="text-xs font-medium leading-snug">
                  {weeklyTheme.description}
                </p>
                <p className="text-[11px] font-bold">
                  推薦搭配：
                  {ACCESSORY_THEME_BY_ID[weeklyTheme.requiredAccessoryTheme]?.name}配件 ·{' '}
                  {PHOTO_BACKGROUND_BY_ID[weeklyTheme.targetBackgroundId].label}背景 ·{' '}
                  {PHOTO_FILTER_BY_ID[weeklyTheme.targetFilterId].label}濾鏡 ·{' '}
                  {PHOTO_FRAME_BY_ID[weeklyTheme.targetFrameId].label}相框
                </p>
              </section>

              {renderLiveStage(null)}

              {/* Quick Switch to Shoot / Customize */}
              <div className="rounded-2xl bg-[#FFFDF8] border-2 border-[#F4DFD7] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#4A3531]">
                    📊 目前造型個人評分試算
                  </span>
                  <span className="text-lg font-extrabold text-[#D64470] tabular-nums">
                    {challengeEvaluation.totalScore} 分
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-bold text-[#6E544E]">
                  <span>
                    主題配件（{challengeEvaluation.themeAccessoryCount}件）：+
                    {challengeEvaluation.themeAccessoryPoints}
                  </span>
                  <span>
                    主題背景：{challengeEvaluation.backgroundMatched ? '+20' : '+0'}
                  </span>
                  <span>
                    主題濾鏡：{challengeEvaluation.filterMatched ? '+10' : '+0'}
                  </span>
                  <span>
                    主題相框：{challengeEvaluation.frameMatched ? '+10' : '+0'}
                  </span>
                  <span>
                    寶貝喜歡配件（{challengeEvaluation.likedAccessoryCount}件）：+
                    {challengeEvaluation.likedAccessoryPoints}
                  </span>
                  <span>
                    完整套裝加成：{challengeEvaluation.fullSetCompleted ? '+30' : '+0'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStudioTab('shoot')}
                    className="min-h-[42px] rounded-xl bg-[#FAF4EE] border border-[#EAD9D0] text-xs font-extrabold text-[#5A3E36]"
                  >
                    調整背景 / 濾鏡
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      void handleSubmitChallenge(false);
                    }}
                    className="min-h-[42px] rounded-xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center justify-center gap-1"
                  >
                    <Camera className="w-4 h-4" />
                    <span>送出拍照參賽</span>
                  </button>
                </div>
              </div>

              {/* Score Thresholds: 60 / 100 / 150 */}
              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#F4DFD7] p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#4A3531]">
                  <span>🏆 本週最高得分：{studio.weeklyChallenge.bestScore} 分</span>
                  <span className="text-[11px] text-[#B83B64] tabular-nums">
                    連續高分 {studio.consecutiveChallengeWeeks} 週
                  </span>
                </div>
                {(
                  [
                    { tier: 60, label: '60 分門檻', reward: '50 金幣 + 1 攝影材料' },
                    { tier: 100, label: '100 分門檻', reward: '100 金幣 + 1 限定相框碎片' },
                    { tier: 150, label: '150 分門檻', reward: '200 金幣 + 限定濾鏡或姿勢' },
                  ] as const
                ).map((item) => {
                  const reached = studio.weeklyChallenge.bestScore >= item.tier;
                  const claimed = studio.weeklyChallenge.claimedTiers.includes(item.tier);
                  return (
                    <div
                      key={item.tier}
                      className="flex items-center justify-between gap-2 rounded-xl bg-[#FAF4EE] px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#4A3531]">
                          {item.label}
                        </div>
                        <div className="text-[11px] font-bold text-[#7D635D]">
                          {item.reward}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!reached || claimed}
                        onClick={() => onClaimChallengeTier?.(item.tier)}
                        className={`min-h-[38px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 transition ${
                          claimed
                            ? 'bg-[#E6F8F1] text-[#1F6B54]'
                            : reached
                            ? 'bg-[#5CC9A7] text-white shadow-xs active:scale-95'
                            : 'bg-[#E9DFD8] text-[#9E8B84] cursor-not-allowed'
                        }`}
                      >
                        {claimed ? '✓ 已領取' : reached ? '領取獎勵' : '未達標'}
                      </button>
                    </div>
                  );
                })}
                <p className="text-[11px] font-bold text-[#7D635D]">
                  ✨ 連續 3 週達 100 分解鎖「👗 穿搭達人」徽章 · 連續 5 週解鎖「📸 時尚攝影師」稱號
                </p>
              </section>
            </div>
          )}

          {/* TAB 4: CO-OP DUO PHOTO & WEEKLY DUO CHALLENGE */}
          {studioTab === 'duo' && (
            <div className="space-y-3.5">
              {!sharedRoom && (
                <section className="rounded-2xl bg-[#FFF3F7] border-2 border-[#F4C4D3] p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs font-extrabold text-[#B83B64]">
                      🏡 共養雙人合照
                    </h3>
                    <p className="text-[11px] text-[#6E544E] leading-snug">
                      建立共養小屋即可與夥伴合拍與參加雙人週挑戰！（單人也可先跟家裡另一隻毛孩預覽合照）
                    </p>
                  </div>
                  {onOpenSharedPet && (
                    <button
                      type="button"
                      onClick={onOpenSharedPet}
                      className="min-h-[40px] px-3 rounded-xl bg-[#FF7A9E] text-white text-[11px] font-extrabold shrink-0"
                    >
                      共養小屋
                    </button>
                  )}
                </section>
              )}

              {renderLiveStage(selectedDuoPartner)}

              {/* Free Duo Photo Shoot */}
              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#F4DFD7] p-3 space-y-2.5">
                <h4 className="text-xs font-extrabold text-[#4A3531]">
                  💞 自由雙人合照（共用目前背景・濾鏡・相框・貼圖）
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#7D635D] mb-1">
                      選擇第二隻入鏡毛孩
                    </label>
                    <select
                      value={duoPartnerIndex % duoPartnerCandidates.length}
                      onChange={(e) => {
                        const idx = Number(e.target.value);
                        setDuoPartnerIndex(idx);
                        const chosen = duoPartnerCandidates[idx];
                        if (chosen) {
                          setDuoTitle(`${pet.name}與${chosen.name}的野餐日`.slice(0, 20));
                        }
                      }}
                      className="w-full min-h-[40px] rounded-xl bg-white border border-[#EED9D0] px-2 text-xs font-extrabold text-[#4A3531]"
                    >
                      {duoPartnerCandidates.map((cand, idx) => (
                        <option key={cand.id} value={idx}>
                          {getPetSpeciesInfo(cand.species).emoji} {cand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7D635D] mb-1">
                      夥伴動作姿勢
                    </label>
                    <select
                      value={duoPartnerPoseId}
                      onChange={(e) => setDuoPartnerPoseId(e.target.value as PhotoPose)}
                      className="w-full min-h-[40px] rounded-xl bg-white border border-[#EED9D0] px-2 text-xs font-extrabold text-[#4A3531]"
                    >
                      {PHOTO_POSES.filter((p) => ownedPoseSet.has(p.id)).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.emoji} {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  maxLength={20}
                  value={duoTitle}
                  onChange={(e) => setDuoTitle(e.target.value.slice(0, 20))}
                  placeholder={`${pet.name}與${selectedDuoPartner.name}的野餐日`}
                  className="w-full min-h-[42px] rounded-xl bg-white border border-[#EED9D0] px-3 text-xs font-bold text-[#4A3531]"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      void handleSaveDuoPhoto(false);
                    }}
                    className="min-h-[44px] rounded-xl bg-[#FFF3D8] border border-[#F2CE6D] text-xs font-extrabold text-[#8A5610]"
                  >
                    存到照片牆
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      void handleSaveDuoPhoto(true);
                    }}
                    className="min-h-[44px] rounded-xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B]"
                  >
                    存檔＋分享留言板
                  </button>
                </div>
              </section>

              {/* Weekly Co-op Duo Challenge */}
              {duoChallengeState && (
                <section className="rounded-2xl bg-gradient-to-br from-[#FFF6FA] to-[#F1FBF7] border-2 border-[#F2C7D6] p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-extrabold text-[#B83B64] inline-flex items-center gap-1">
                      <HeartHandshake className="w-4 h-4" />
                      <span>每週共養雙人挑戰：{weeklyTheme.title}</span>
                    </h4>
                    <span className="text-[11px] font-extrabold text-[#256D57] tabular-nums">
                      {duoSubmissionsList.length} / 2 人已提交
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-[#5A423C]">
                    {weeklyTheme.duoPrompt}
                  </p>

                  {duoSubmissionsList.length > 0 && (
                    <div className="space-y-1">
                      {duoSubmissionsList.map((sub) => (
                        <div
                          key={sub.userId}
                          className="rounded-xl bg-white/90 border border-[#EED6CD] px-2.5 py-1.5 text-[11px] font-bold text-[#4A3531] flex items-center justify-between"
                        >
                          <span>
                            {getPetSpeciesInfo(sub.species).emoji} {sub.userName} · {sub.petName}
                          </span>
                          <span className="text-[#1F6B54]">✓ 已送出穿搭</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!sharedRoom ? (
                    <p className="text-[11px] font-bold text-[#9D5B12]">
                      連線共養小屋後即可與夥伴共同合成雙人紀念照並領取雙人獎勵！
                    </p>
                  ) : duoChallengeState.completed ? (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] font-extrabold text-[#1F6B54]">
                        🎉 雙方合照已合成！獎勵：120🪙 + 1 材料 + 1 碎片
                      </span>
                      <button
                        type="button"
                        disabled={hasClaimedDuo}
                        onClick={() => onClaimDuoChallengeReward?.()}
                        className={`min-h-[40px] px-3 rounded-xl text-xs font-extrabold shrink-0 ${
                          hasClaimedDuo
                            ? 'bg-[#E6F8F1] text-[#1F6B54]'
                            : 'bg-[#5CC9A7] text-white shadow-xs'
                        }`}
                      >
                        {hasClaimedDuo ? '✓ 已領取' : '領取相同獎勵'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSubmitDuoChallenge?.({
                          pet,
                          poseId,
                          facing,
                          title: duoTitle,
                          backgroundId,
                          filterId,
                          frameId,
                          stickers,
                        });
                      }}
                      className="w-full min-h-[44px] rounded-xl bg-[#5CC9A7] text-white text-xs font-extrabold shadow-[0_3px_0_#3BA585]"
                    >
                      {hasSubmittedDuo
                        ? '更新我的雙人挑戰造型（等待夥伴送出）'
                        : '送出我的「雙人主題挑戰」造型！'}
                    </button>
                  )}

                  <p className="text-[10px] font-bold text-[#7D635D]">
                    連續達成雙人挑戰進度：{studio.duoChallengeStreakWeeks} / 3 週（解鎖「👯 最佳穿搭搭檔」徽章）
                  </p>
                </section>
              )}
            </div>
          )}

          {/* TAB 5: STUDIO CATALOG & MATERIAL CRAFTING */}
          {studioTab === 'catalog' && (
            <div className="space-y-3.5">
              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#F4DFD7] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#4A3531]">
                    📖 攝影棚收集圖鑑
                  </h3>
                  <span className="text-xs font-extrabold text-[#D64470] tabular-nums">
                    {collectionProgress.totalOwned} / {collectionProgress.totalCatalog}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-extrabold text-[#5A3E36]">
                  <div className="rounded-xl bg-[#FAF4EE] p-1.5">
                    <div>姿勢</div>
                    <div className="tabular-nums text-[#C43463]">
                      {collectionProgress.posesOwned}/{collectionProgress.posesTotal}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#FAF4EE] p-1.5">
                    <div>背景</div>
                    <div className="tabular-nums text-[#1F6B54]">
                      {collectionProgress.backgroundsOwned}/{collectionProgress.backgroundsTotal}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#FAF4EE] p-1.5">
                    <div>濾鏡</div>
                    <div className="tabular-nums text-[#355A9C]">
                      {collectionProgress.filtersOwned}/{collectionProgress.filtersTotal}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#FAF4EE] p-1.5">
                    <div>相框</div>
                    <div className="tabular-nums text-[#8A5610]">
                      {collectionProgress.framesOwned}/{collectionProgress.framesTotal}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#FAF4EE] p-1.5">
                    <div>貼圖</div>
                    <div className="tabular-nums text-[#B83B64]">
                      {collectionProgress.stickersOwned}/{collectionProgress.stickersTotal}
                    </div>
                  </div>
                </div>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {Object.values(STUDIO_BADGES).map((badge) => {
                    const owned = studio.unlockedStudioBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`rounded-xl border px-2.5 py-1.5 text-[10px] font-extrabold flex items-center gap-1.5 ${
                          owned
                            ? 'bg-[#FFF3D8] border-[#F0CF7A] text-[#7A540E]'
                            : 'bg-[#FAF4EE] border-[#EADCD5] text-[#8E756E]'
                        }`}
                      >
                        <span>{badge.emoji}</span>
                        <span>{badge.name}</span>
                        <span className="font-bold">
                          · {owned ? '已獲得' : badge.conditionText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Material Crafting Workshop */}
              <section className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <h4 className="text-xs font-extrabold text-[#4A3531] inline-flex items-center gap-1">
                    <Hammer className="w-3.5 h-3.5 text-[#C43463]" />
                    <span>攝影材料合成（限定背景＆相框）</span>
                  </h4>
                  <span className="text-[11px] font-bold text-[#7D635D] tabular-nums">
                    🎞️ {studio.studioMaterials} · 🖼️ {studio.studioFrameShards}
                  </span>
                </div>

                <div className="space-y-2">
                  {STUDIO_CRAFT_RECIPES.map((rec) => {
                    const alreadyOwned =
                      (rec.targetKind === 'background' &&
                        ownedBgSet.has(rec.targetId as PhotoBackground)) ||
                      (rec.targetKind === 'frame' &&
                        ownedFrameSet.has(rec.targetId as PhotoFrame)) ||
                      (rec.targetKind === 'filter' &&
                        ownedFilterSet.has(rec.targetId as PhotoFilter)) ||
                      (rec.targetKind === 'pose' &&
                        ownedPoseSet.has(rec.targetId as PhotoPose));

                    const canCraft =
                      !alreadyOwned &&
                      studio.studioMaterials >= rec.materialCost &&
                      studio.studioFrameShards >= rec.frameShardCost &&
                      coins >= rec.coinCost;

                    return (
                      <article
                        key={rec.id}
                        className="rounded-2xl bg-white border-2 border-[#EFE0D7] p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-[#4A3531]">
                            {rec.emoji} {rec.name}
                          </div>
                          <p className="text-[10px] text-[#7D635D] leading-snug">
                            {rec.description}
                          </p>
                          <p className="text-[10px] font-extrabold text-[#8A5610] tabular-nums mt-0.5">
                            需求：🎞️ {rec.materialCost} · 🖼️ {rec.frameShardCost} · 🪙 {rec.coinCost}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={alreadyOwned || !canCraft}
                          onClick={() => onCraftRecipe?.(rec.id)}
                          className={`min-h-[40px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 transition ${
                            alreadyOwned
                              ? 'bg-[#E6F8F1] text-[#1F6B54]'
                              : canCraft
                              ? 'bg-[#FF7A9E] text-white shadow-xs active:scale-95'
                              : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                          }`}
                        >
                          {alreadyOwned ? '已擁有' : '合成'}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* Full Catalog Overview of Out-of-Rotation & Achievement Items */}
              <section className="space-y-2">
                <h4 className="text-xs font-extrabold text-[#4A3531]">
                  ✨ 全部攝影棚藏品一覽
                </h4>
                <div className="space-y-1.5">
                  {PHOTO_POSES.filter((p) => !ownedPoseSet.has(p.id)).map((p) => (
                    <div
                      key={`cat_pose_${p.id}`}
                      className="rounded-xl bg-[#FAF4EE] px-3 py-2 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <span className="font-extrabold text-[#4A3531]">
                        {p.emoji} 姿勢：{p.label}
                      </span>
                      <span className="font-bold text-[#7D635D] text-right">
                        {p.unlockHint}
                      </span>
                    </div>
                  ))}
                  {PHOTO_BACKGROUNDS.filter((b) => !ownedBgSet.has(b.id)).map((b) => (
                    <div
                      key={`cat_bg_${b.id}`}
                      className="rounded-xl bg-[#FAF4EE] px-3 py-2 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <span className="font-extrabold text-[#4A3531]">
                        {b.emoji} 背景：{b.label}
                      </span>
                      <span className="font-bold text-[#7D635D] text-right">
                        {b.unlockHint}
                      </span>
                    </div>
                  ))}
                  {STUDIO_SHOP_FILTERS.filter((f) => !ownedFilterSet.has(f.id)).map((f) => (
                    <div
                      key={`cat_fl_${f.id}`}
                      className="rounded-xl bg-[#FAF4EE] px-3 py-2 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <span className="font-extrabold text-[#4A3531]">
                        {f.emoji} 濾鏡：{f.label}
                      </span>
                      <span className="font-bold text-[#7D635D] text-right">
                        {f.unlockHint}
                      </span>
                    </div>
                  ))}
                  {PHOTO_FRAMES.filter((fr) => !ownedFrameSet.has(fr.id)).map((fr) => (
                    <div
                      key={`cat_fr_${fr.id}`}
                      className="rounded-xl bg-[#FAF4EE] px-3 py-2 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <span className="font-extrabold text-[#4A3531]">
                        {fr.emoji} 相框：{fr.label}
                      </span>
                      <span className="font-bold text-[#7D635D] text-right">
                        {fr.unlockHint}
                      </span>
                    </div>
                  ))}
                  {collectionProgress.totalOwned === collectionProgress.totalCatalog && (
                    <div className="rounded-2xl bg-[#E6F8F1] border border-[#A7E0CB] p-3 text-center text-xs font-extrabold text-[#1F6B54]">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      恭喜收集完成全部攝影棚藏品！
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
