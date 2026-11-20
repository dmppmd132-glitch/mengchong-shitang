import { useCallback, useEffect, useRef, useState } from 'react';
import { IngredientId, YardMoodBuffPeriod } from '../types';
import { getActiveYardBuffExpiresAt } from '../utils/farmGrowth';

export const SYSTEM_COOKIE_ID = 'system_cookie' as const;
export type PicnicSnackId = IngredientId | typeof SYSTEM_COOKIE_ID;

interface UseYardActivitiesOptions {
  buffPeriods: YardMoodBuffPeriod[];
  onSwingReward: () => void;
  onAddCoins: (amount: number) => void;
  onFeedSnack: (snackId: PicnicSnackId) => void;
}

export function useYardActivities({
  buffPeriods,
  onSwingReward,
  onAddCoins,
  onFeedSnack,
}: UseYardActivitiesOptions) {
  const timersRef = useRef<Map<string, number>>(new Map());
  const swingCooldownUntilRef = useRef<number>(0);
  const swingBusyRef = useRef<boolean>(false);
  const birdRewardedRef = useRef<boolean>(false);

  const [now, setNow] = useState<number>(() => Date.now());
  const [isSwinging, setIsSwinging] = useState<boolean>(false);
  const [swingNotice, setSwingNotice] = useState<string | null>(null);
  const [birdVisible, setBirdVisible] = useState<boolean>(false);
  const [birdFlyingAway, setBirdFlyingAway] = useState<boolean>(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [activityBubble, setActivityBubble] = useState<{
    key: number;
    symbol: '♪' | '🩷';
  } | null>(null);
  const [isPicnicMenuOpen, setIsPicnicMenuOpen] = useState<boolean>(false);
  const [selectedSnack, setSelectedSnack] = useState<PicnicSnackId | null>(null);
  const [isEating, setIsEating] = useState<boolean>(false);

  useEffect(() => {
    setNow(Date.now());
  }, [buffPeriods]);

  const clearTimer = useCallback((key: string) => {
    const timer = timersRef.current.get(key);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(key);
    }
  }, []);

  const schedule = useCallback(
    (key: string, callback: () => void, delayMs: number) => {
      clearTimer(key);
      const timer = window.setTimeout(() => {
        timersRef.current.delete(key);
        callback();
      }, delayMs);
      timersRef.current.set(key, timer);
    },
    [clearTimer]
  );

  useEffect(() => {
    schedule('first-bird', () => {
      birdRewardedRef.current = false;
      setBirdVisible(true);
    }, 10_000);

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [schedule]);

  const activeBuffExpiresAt = getActiveYardBuffExpiresAt(buffPeriods, now);
  useEffect(() => {
    if (activeBuffExpiresAt === null) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [activeBuffExpiresAt]);

  const startSwing = () => {
    const currentTime = Date.now();
    if (swingBusyRef.current || currentTime < swingCooldownUntilRef.current) {
      setSwingNotice('鞦韆正在休息，等一下再來玩喔！');
      schedule('swing-notice', () => setSwingNotice(null), 1800);
      return;
    }

    clearTimer('swing-notice');
    setSwingNotice(null);
    setIsSwinging(true);
    setActivityBubble({ key: currentTime, symbol: '🩷' });
    swingBusyRef.current = true;
    swingCooldownUntilRef.current = currentTime + 7000;
    onSwingReward();
    schedule('swing-end', () => setIsSwinging(false), 5000);
    schedule('swing-bubble', () => setActivityBubble(null), 5000);
    schedule('swing-cooldown', () => {
      swingBusyRef.current = false;
    }, 7000);
  };

  const handleBirdClick = () => {
    if (!birdVisible || birdRewardedRef.current) return;
    birdRewardedRef.current = true;
    setBirdFlyingAway(true);
    setRewardToast('獲得幸運小驚喜！金幣 +2');
    onAddCoins(2);
    schedule('bird-toast', () => setRewardToast(null), 1700);
    schedule('bird-departure', () => {
      setBirdVisible(false);
      setBirdFlyingAway(false);
      schedule(
        'next-bird',
        () => {
          birdRewardedRef.current = false;
          setBirdVisible(true);
        },
        30_000 + Math.floor(Math.random() * 10_001)
      );
    }, 850);
  };

  const togglePicnicMenu = () => setIsPicnicMenuOpen((open) => !open);
  const closePicnicMenu = () => setIsPicnicMenuOpen(false);

  const chooseSnack = (snackId: PicnicSnackId) => {
    setSelectedSnack(snackId);
    setIsPicnicMenuOpen(false);
    setIsEating(true);
    setActivityBubble({ key: Date.now(), symbol: '♪' });
    onFeedSnack(snackId);
    schedule('eating-end', () => setIsEating(false), 3600);
    schedule('eating-bubble', () => setActivityBubble(null), 3600);
  };

  const buffRemainingMs =
    activeBuffExpiresAt === null ? 0 : Math.max(0, activeBuffExpiresAt - now);

  return {
    now,
    isSwinging,
    swingNotice,
    startSwing,
    birdVisible,
    birdFlyingAway,
    rewardToast,
    handleBirdClick,
    isPicnicMenuOpen,
    togglePicnicMenu,
    closePicnicMenu,
    chooseSnack,
    selectedSnack,
    isEating,
    activityBubble,
    buffRemainingMs,
  };
}
