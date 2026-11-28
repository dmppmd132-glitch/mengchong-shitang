import { useCallback, useState } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  PhotoContestDraftConfig,
  PhotoContestTab,
} from '../components/photoContest/PhotoContestModal';
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
} from '../types';
import {
  buyPhotoContestShopItem,
  claimCoopPhotoReward,
  dismissContestSettlementNotice,
  getPhotoContestSchedule,
  submitContestVote,
  submitCoopPhotoContestEntry,
  submitPhotoContestEntry,
  updateCoopPhotoDecor,
  updateCoopPhotoOutfit,
} from '../utils/photoContest';
import { soundFX } from '../utils/sound';

interface UsePhotoContestOptions {
  game: GameState;
  gameRef: MutableRefObject<GameState>;
  setGame: Dispatch<SetStateAction<GameState>>;
  currentUserId: string;
  actorName: string;
  pushFeedback: (text: string, emoji?: string) => void;
  setSpeech: (text: string) => void;
}

export function usePhotoContest({
  game,
  gameRef,
  setGame,
  currentUserId,
  actorName,
  pushFeedback,
  setSpeech,
}: UsePhotoContestOptions) {
  const [photoContestOpen, setPhotoContestOpen] = useState<boolean>(false);
  const [photoContestTab, setPhotoContestTab] = useState<PhotoContestTab>('overview');
  const [photoContestDraft, setPhotoContestDraft] =
    useState<PhotoContestDraftConfig | null>(null);

  const currentContestSchedule = getPhotoContestSchedule(
    new Date(),
    game.photoContest?.currentThemeId ?? null
  );

  const handleOpenPhotoContest = useCallback(
    (tab: PhotoContestTab = 'overview', draft?: PhotoContestDraftConfig | null) => {
      soundFX.pop(gameRef.current.soundEnabled);
      setPhotoContestTab(tab);
      setPhotoContestDraft(draft ?? null);
      setPhotoContestOpen(true);
    },
    [gameRef]
  );

  const handleClosePhotoContest = useCallback(() => {
    setPhotoContestOpen(false);
  }, []);

  const handleSubmitPhotoContest = useCallback(
    (params: {
      title: string;
      caption: string;
      poseId: PhotoPose;
      facing: PetViewDirection;
      backgroundId: PhotoBackground;
      filterId: PhotoFilter;
      frameId: PhotoFrame;
      stickers: PhotoStickerId[];
    }): { ok: boolean; notice: string; score?: PhotoScore } => {
      const res = submitPhotoContestEntry(gameRef.current, {
        userId: currentUserId,
        authorLabel: actorName,
        ...params,
      });
      soundFX.levelUp(gameRef.current.soundEnabled);
      setGame(res.nextState);
      const notice =
        `參賽提交成功！${res.submission.score.totalScore} 分（${res.submission.score.rank} 級），獲得 +${res.submission.rewardCoins} 金幣、+${res.submission.rewardTickets} 攝影券` +
        (res.unlockedNotices.length > 0 ? ` · ${res.unlockedNotices.join(' · ')}` : '');
      pushFeedback(notice, '🏆');
      setSpeech(
        `「${res.submission.title}」在攝影比賽拿到 ${res.submission.score.totalScore} 分（${res.submission.score.rank} 級）！`
      );
      return { ok: true, notice, score: res.submission.score };
    },
    [actorName, currentUserId, gameRef, pushFeedback, setGame, setSpeech]
  );

  const handleVotePhotoContest = useCallback(
    (params: {
      leftSubmission: PhotoSubmission;
      rightSubmission: PhotoSubmission;
      chosenSubmissionId: string;
    }): { ok: boolean; notice: string } => {
      const res = submitContestVote(gameRef.current, {
        voterUserId: currentUserId,
        voterName: actorName,
        ...params,
      });
      if (res.ok) {
        soundFX.heart(gameRef.current.soundEnabled);
        setGame(res.nextState);
        const msText =
          res.unlockedMilestones.length > 0
            ? `（達成 ${res.unlockedMilestones.join('/')} 票里程碑！）`
            : '';
        pushFeedback(`${res.notice}${msText}`, '🗳️');
      } else {
        soundFX.miss(gameRef.current.soundEnabled);
      }
      return { ok: res.ok, notice: res.notice };
    },
    [actorName, currentUserId, gameRef, pushFeedback, setGame]
  );

  const handleBuyPhotoContestShopItem = useCallback(
    (itemId: string): { ok: boolean; notice: string } => {
      const res = buyPhotoContestShopItem(gameRef.current, itemId);
      if (res.ok) {
        soundFX.levelUp(gameRef.current.soundEnabled);
        setGame(res.nextState);
        pushFeedback(res.notice, '🛍️');
        setSpeech(res.notice);
      } else {
        soundFX.miss(gameRef.current.soundEnabled);
      }
      return { ok: res.ok, notice: res.notice };
    },
    [gameRef, pushFeedback, setGame, setSpeech]
  );

  const handleCoopPhotoOutfit = useCallback(
    (poseId: PhotoPose): { ok: boolean; notice: string } => {
      const res = updateCoopPhotoOutfit(gameRef.current, currentUserId, actorName, poseId);
      if (res.ok) {
        soundFX.heart(gameRef.current.soundEnabled);
        setGame(res.nextState);
        pushFeedback(res.notice, '👗');
      } else {
        soundFX.miss(gameRef.current.soundEnabled);
      }
      return { ok: res.ok, notice: res.notice };
    },
    [actorName, currentUserId, gameRef, pushFeedback, setGame]
  );

  const handleCoopPhotoDecor = useCallback(
    (decor: {
      backgroundId: PhotoBackground;
      filterId: PhotoFilter;
      frameId: PhotoFrame;
      stickers: PhotoStickerId[];
    }): { ok: boolean; notice: string } => {
      const res = updateCoopPhotoDecor(gameRef.current, currentUserId, actorName, decor);
      if (res.ok) {
        soundFX.heart(gameRef.current.soundEnabled);
        setGame(res.nextState);
        pushFeedback(res.notice, '🎨');
      } else {
        soundFX.miss(gameRef.current.soundEnabled);
      }
      return { ok: res.ok, notice: res.notice };
    },
    [actorName, currentUserId, gameRef, pushFeedback, setGame]
  );

  const handleSubmitCoopPhotoContest = useCallback(
    (params: {
      partnerPet: Pet;
      title: string;
      caption: string;
      poseId: PhotoPose;
      facing: PetViewDirection;
      backgroundId: PhotoBackground;
      filterId: PhotoFilter;
      frameId: PhotoFrame;
      stickers: PhotoStickerId[];
    }): { ok: boolean; notice: string } => {
      const res = submitCoopPhotoContestEntry(gameRef.current, {
        userId: currentUserId,
        userName: actorName,
        ...params,
      });
      if (res.ok) {
        soundFX.levelUp(gameRef.current.soundEnabled);
        setGame(res.nextState);
        pushFeedback(res.notice, '💞');
        setSpeech(`雙寵合照「${res.submission.title}」提交成功！`);
      } else {
        soundFX.miss(gameRef.current.soundEnabled);
      }
      return { ok: res.ok, notice: res.notice };
    },
    [actorName, currentUserId, gameRef, pushFeedback, setGame, setSpeech]
  );

  const handleClaimCoopPhotoReward = useCallback((): { ok: boolean; notice: string } => {
    const res = claimCoopPhotoReward(gameRef.current, currentUserId);
    if (res.ok) {
      soundFX.levelUp(gameRef.current.soundEnabled);
      setGame(res.nextState);
      pushFeedback(res.notice, '🏆');
      setSpeech(res.notice);
    } else {
      soundFX.miss(gameRef.current.soundEnabled);
    }
    return { ok: res.ok, notice: res.notice };
  }, [currentUserId, gameRef, pushFeedback, setGame, setSpeech]);

  const handleDismissContestSettlement = useCallback(() => {
    setGame((prev) => dismissContestSettlementNotice(prev));
  }, [setGame]);

  return {
    photoContestOpen,
    photoContestTab,
    photoContestDraft,
    currentContestSchedule,
    handleOpenPhotoContest,
    handleClosePhotoContest,
    handleSubmitPhotoContest,
    handleVotePhotoContest,
    handleBuyPhotoContestShopItem,
    handleCoopPhotoOutfit,
    handleCoopPhotoDecor,
    handleSubmitCoopPhotoContest,
    handleClaimCoopPhotoReward,
    handleDismissContestSettlement,
  };
}
