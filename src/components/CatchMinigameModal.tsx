import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Coins, Gamepad2, RotateCcw, Trophy, X } from 'lucide-react';
import { CatchGameMode, Pet } from '../types';
import { soundFX } from '../utils/sound';
import { PiggyCharacter } from './PiggyCharacter';

interface CatchMinigameModalProps {
  open: boolean;
  onClose: () => void;
  pet: Pet;
  soundEnabled: boolean;
  onFinishMinigame: (mode: CatchGameMode, earnedCoins: number, score: number) => void;
}

type GamePhase = 'TITLE_MENU' | 'PLAYING' | 'ROUND_SUMMARY';

interface FallingItem {
  id: number;
  x: number; // percentage 8..92
  y: number; // percentage -6..104
  speed: number; // percent per second
  kind: 'normal' | 'bonus' | 'hazard';
  emoji: string;
  points: number;
}

interface FloatingHit {
  id: number;
  x: number;
  text: string;
  isPositive: boolean;
}

const ROUND_SECONDS = 25;

const MODE_CONFIG: Record<
  CatchGameMode,
  {
    title: string;
    subtitle: string;
    normalEmoji: string;
    bonusEmoji: string;
    hazardEmoji: string;
    normalLabel: string;
    hazardLabel: string;
    bgGradient: string;
    borderColor: string;
  }
> = {
  apple: {
    title: '蘋果接接樂',
    subtitle: '接住香甜蘋果賺金幣，小心蟲蟲蘋果喔！',
    normalEmoji: '🍎',
    bonusEmoji: '🍏',
    hazardEmoji: '🪱',
    normalLabel: '甜蘋果 +2 · 青蘋果 +5',
    hazardLabel: '小蟲 -2',
    bgGradient: 'from-[#FFEFF4] via-[#FFF9E8] to-[#E6F8F1]',
    borderColor: '#F3D2DC',
  },
  fries: {
    title: '薯條接接樂',
    subtitle: '接住剛起鍋的黃金薯條，避開熱辣辣椒醬！',
    normalEmoji: '🍟',
    bonusEmoji: '🍔',
    hazardEmoji: '🌶️',
    normalLabel: '黃金薯條 +2 · 小漢堡 +5',
    hazardLabel: '太辣啦 -2',
    bgGradient: 'from-[#FFF3DA] via-[#FFF9EC] to-[#FFEAF0]',
    borderColor: '#F2D9A5',
  },
};

export const CatchMinigameModal: React.FC<CatchMinigameModalProps> = ({
  open,
  onClose,
  pet,
  soundEnabled,
  onFinishMinigame,
}) => {
  const [phase, setPhase] = useState<GamePhase>('TITLE_MENU');
  const [mode, setMode] = useState<CatchGameMode>('apple');
  const [playerX, setPlayerX] = useState<number>(50);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_SECONDS);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [hits, setHits] = useState<FloatingHit[]>([]);
  const [bestScore, setBestScore] = useState<number>(0);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const playerXRef = useRef<number>(50);
  const scoreRef = useRef<number>(0);
  const itemsRef = useRef<FallingItem[]>([]);
  const rafRef = useRef<number | null>(null);
  const holdDirRef = useRef<-1 | 0 | 1>(0);
  const keysPressedRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const nextIdRef = useRef<number>(1);
  const lastSpawnAtRef = useRef<number>(0);
  const roundStartAtRef = useRef<number>(0);
  const rewardedRef = useRef<boolean>(false);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    holdDirRef.current = 0;
    keysPressedRef.current = { left: false, right: false };
  }, []);

  useEffect(() => {
    if (!open) {
      stopLoop();
      setPhase('TITLE_MENU');
      setItems([]);
      setHits([]);
    }
    return () => {
      stopLoop();
    };
  }, [open, stopLoop]);

  const spawnHitFeedback = useCallback((x: number, text: string, isPositive: boolean) => {
    const id = nextIdRef.current++;
    setHits((prev) => [...prev.slice(-4), { id, x, text, isPositive }]);
    window.setTimeout(() => {
      setHits((prev) => prev.filter((h) => h.id !== id));
    }, 650);
  }, []);

  const startRound = useCallback(
    (chosenMode: CatchGameMode) => {
      stopLoop();
      setMode(chosenMode);
      setPlayerX(50);
      playerXRef.current = 50;
      setScore(0);
      scoreRef.current = 0;
      setTimeLeft(ROUND_SECONDS);
      itemsRef.current = [];
      setItems([]);
      setHits([]);
      rewardedRef.current = false;
      roundStartAtRef.current = performance.now();
      lastSpawnAtRef.current = performance.now() - 350;
      setPhase('PLAYING');
      soundFX.pop(soundEnabled);
    },
    [soundEnabled, stopLoop]
  );

  useEffect(() => {
    if (!open || phase !== 'PLAYING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressedRef.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressedRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressedRef.current.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressedRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let lastFrameTime = performance.now();
    const cfg = MODE_CONFIG[mode];

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
      lastFrameTime = now;

      const elapsedSec = (now - roundStartAtRef.current) / 1000;
      const remaining = Math.max(0, Math.ceil(ROUND_SECONDS - elapsedSec));
      setTimeLeft(remaining);

      // Update player horizontal velocity from hold buttons or keyboard
      let moveDir = holdDirRef.current;
      if (keysPressedRef.current.left && !keysPressedRef.current.right) moveDir = -1;
      if (keysPressedRef.current.right && !keysPressedRef.current.left) moveDir = 1;

      if (moveDir !== 0) {
        const nextX = Math.min(89, Math.max(11, playerXRef.current + moveDir * 72 * dt));
        playerXRef.current = nextX;
        setPlayerX(nextX);
      }

      // Spawn falling items every ~580ms (slightly faster toward end)
      const spawnInterval = Math.max(380, 620 - elapsedSec * 9);
      if (now - lastSpawnAtRef.current >= spawnInterval) {
        lastSpawnAtRef.current = now;
        const roll = Math.random();
        const kind: FallingItem['kind'] =
          roll < 0.2 ? 'hazard' : roll < 0.36 ? 'bonus' : 'normal';
        const newItem: FallingItem = {
          id: nextIdRef.current++,
          x: 10 + Math.random() * 80,
          y: -6,
          speed: 38 + Math.random() * 22 + elapsedSec * 0.65,
          kind,
          emoji:
            kind === 'hazard'
              ? cfg.hazardEmoji
              : kind === 'bonus'
              ? cfg.bonusEmoji
              : cfg.normalEmoji,
          points: kind === 'hazard' ? -2 : kind === 'bonus' ? 5 : 2,
        };
        itemsRef.current = [...itemsRef.current, newItem];
      }

      // Move items & resolve basket catches (basket sits around y: 74..90)
      const nextItems: FallingItem[] = [];
      let scoreDelta = 0;

      for (const item of itemsRef.current) {
        const nextY = item.y + item.speed * dt;
        const inCatchBand = nextY >= 74 && nextY <= 89;
        const dx = Math.abs(item.x - playerXRef.current);

        if (inCatchBand && dx <= 12.5) {
          scoreDelta += item.points;
          if (item.kind === 'hazard') {
            soundFX.miss(soundEnabled);
            spawnHitFeedback(item.x, `${item.points}`, false);
          } else if (item.kind === 'bonus') {
            soundFX.heart(soundEnabled);
            spawnHitFeedback(item.x, `+${item.points}`, true);
          } else {
            soundFX.pop(soundEnabled);
            spawnHitFeedback(item.x, `+${item.points}`, true);
          }
          continue;
        }

        if (nextY <= 104) {
          nextItems.push({ ...item, y: nextY });
        }
      }

      itemsRef.current = nextItems;
      setItems(nextItems);

      if (scoreDelta !== 0) {
        const updatedScore = Math.max(0, scoreRef.current + scoreDelta);
        scoreRef.current = updatedScore;
        setScore(updatedScore);
      }

      if (elapsedSec >= ROUND_SECONDS) {
        stopLoop();
        const finalScore = scoreRef.current;
        const earnedCoins = Math.min(80, Math.max(5, finalScore * 2));
        setBestScore((prev) => Math.max(prev, finalScore));
        setPhase('ROUND_SUMMARY');
        if (!rewardedRef.current) {
          rewardedRef.current = true;
          soundFX.levelUp(soundEnabled);
          onFinishMinigame(mode, earnedCoins, finalScore);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      stopLoop();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, onFinishMinigame, open, phase, soundEnabled, spawnHitFeedback, stopLoop]);

  const updatePointerPosition = (clientX: number) => {
    const el = arenaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(89, Math.max(11, pct));
    playerXRef.current = clamped;
    setPlayerX(clamped);
  };

  if (!open) return null;

  const cfg = MODE_CONFIG[mode];
  const earnedCoinsPreview = Math.min(80, Math.max(5, score * 2));

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2621]/55 backdrop-blur-xs flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="minigame-title"
    >
      <div className="w-full max-w-[400px] rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD8] p-4 shadow-2xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FFEAF0] text-[#D64470] flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="minigame-title" className="text-base font-extrabold text-[#4A3531] truncate">
                萌寵接接樂小遊戲
              </h2>
              <p className="text-[11px] font-bold text-[#826862] truncate">
                幫 {pet.name} 接住美味點心賺金幣
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopLoop();
              onClose();
            }}
            aria-label="關閉小遊戲"
            className="min-h-[40px] min-w-[40px] rounded-full bg-[#F7ECE6] text-[#5A3E36] flex items-center justify-center hover:bg-[#EEDCD3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {phase === 'TITLE_MENU' && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-[#FFF7EC] border border-[#F3DFD7] p-3 flex items-center gap-3">
              <div className="shrink-0">
                <PiggyCharacter
                  species={pet.species}
                  growth={pet.growth}
                  roundness={pet.roundness}
                  action="petted"
                  equipped={pet.accessories}
                  interactive={false}
                  size={74}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[#4A3531]">
                  選擇挑戰關卡
                </p>
                <p className="text-xs text-[#7D635D] leading-relaxed mt-0.5">
                  每回合 {ROUND_SECONDS} 秒，左右滑動或點擊方向鍵控制 {pet.name} 移動，分數越高賺越多金幣（最高 80 金幣）！
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(['apple', 'fries'] as CatchGameMode[]).map((gameMode) => {
                const itemCfg = MODE_CONFIG[gameMode];
                return (
                  <button
                    key={gameMode}
                    type="button"
                    onClick={() => startRound(gameMode)}
                    className="w-full rounded-2xl bg-[#FFFDF8] border-2 border-[#F4DFD7] hover:border-[#FF7A9E] p-3.5 flex items-center justify-between gap-3 text-left transition active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF4DC] border border-[#F3DFA6] flex items-center justify-center text-2xl shrink-0">
                        <span aria-hidden="true">{itemCfg.normalEmoji}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-[#4A3531]">
                          {itemCfg.title}
                        </h3>
                        <p className="text-[11px] font-bold text-[#7D635D] mt-0.5 truncate">
                          {itemCfg.normalLabel} · {itemCfg.hazardLabel}
                        </p>
                      </div>
                    </div>
                    <span className="min-h-[38px] px-3.5 rounded-xl bg-[#FF7A9E] text-white text-xs font-extrabold inline-flex items-center justify-center shrink-0">
                      開始
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {phase === 'PLAYING' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1 text-xs font-extrabold tabular-nums">
              <span className="text-[#D64470]">
                {cfg.title} · 得分 {score}
              </span>
              <span className={timeLeft <= 5 ? 'text-[#D64470]' : 'text-[#5A423C]'}>
                剩餘 {timeLeft} 秒
              </span>
            </div>

            <div
              ref={arenaRef}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                updatePointerPosition(e.clientX);
              }}
              onPointerMove={(e) => {
                if (e.buttons > 0 || e.pointerType === 'touch') {
                  updatePointerPosition(e.clientX);
                }
              }}
              style={{ borderColor: cfg.borderColor }}
              className={`relative w-full h-[300px] rounded-2xl border-2 bg-gradient-to-b ${cfg.bgGradient} overflow-hidden select-none touch-none`}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute text-2xl leading-none pointer-events-none select-none"
                  aria-hidden="true"
                >
                  {item.emoji}
                </div>
              ))}

              {hits.map((hit) => (
                <div
                  key={hit.id}
                  style={{
                    left: `${hit.x}%`,
                    bottom: '74px',
                    transform: 'translateX(-50%)',
                  }}
                  className={`absolute text-sm font-extrabold pointer-events-none animate-float-up ${
                    hit.isPositive ? 'text-[#256D57]' : 'text-[#D64470]'
                  }`}
                >
                  {hit.text}
                </div>
              ))}

              {/* Moving player pet + woven catch basket */}
              <div
                style={{
                  left: `${playerX}%`,
                  bottom: '6px',
                  transform: 'translateX(-50%)',
                }}
                className="absolute flex flex-col items-center pointer-events-none"
              >
                <div className="mb-[-14px] w-14 h-5 rounded-b-xl rounded-t-sm bg-[#E6B066] border-2 border-[#5A3E36] z-10 flex items-center justify-center text-[10px] font-extrabold text-[#4A3531]">
                  🧺
                </div>
                <PiggyCharacter
                  species={pet.species}
                  growth={pet.growth}
                  roundness={pet.roundness}
                  action="walking"
                  equipped={pet.accessories}
                  interactive={false}
                  size={66}
                />
              </div>

              <p className="absolute top-2 inset-x-0 text-center text-[11px] font-bold text-[#8A716B] pointer-events-none">
                在畫面左右拖曳或按下方按鈕移動
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onPointerDown={() => {
                  holdDirRef.current = -1;
                }}
                onPointerUp={() => {
                  holdDirRef.current = 0;
                }}
                onPointerLeave={() => {
                  holdDirRef.current = 0;
                }}
                onPointerCancel={() => {
                  holdDirRef.current = 0;
                }}
                className="min-h-[48px] rounded-2xl bg-[#FFF3D1] border-2 border-[#F2CE6D] text-[#7A540E] font-extrabold text-sm inline-flex items-center justify-center gap-1 active:scale-95 select-none touch-none"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>往左接</span>
              </button>
              <button
                type="button"
                onPointerDown={() => {
                  holdDirRef.current = 1;
                }}
                onPointerUp={() => {
                  holdDirRef.current = 0;
                }}
                onPointerLeave={() => {
                  holdDirRef.current = 0;
                }}
                onPointerCancel={() => {
                  holdDirRef.current = 0;
                }}
                className="min-h-[48px] rounded-2xl bg-[#FFF3D1] border-2 border-[#F2CE6D] text-[#7A540E] font-extrabold text-sm inline-flex items-center justify-center gap-1 active:scale-95 select-none touch-none"
              >
                <span>往右接</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {phase === 'ROUND_SUMMARY' && (
          <div className="space-y-3.5 text-center">
            <div className="rounded-2xl bg-gradient-to-b from-[#FFEAF0] to-[#FFF8E8] border border-[#F3D2DC] p-4 flex flex-col items-center space-y-2">
              <Trophy className="w-8 h-8 text-[#E6A222]" />
              <h3 className="text-lg font-extrabold text-[#4A3531]">
                {cfg.title} 結算完成！
              </h3>
              <p className="text-sm font-extrabold text-[#D64470] tabular-nums">
                本局得分 {score} 分 · 最高紀錄 {bestScore} 分
              </p>
              <div className="inline-flex items-center gap-1.5 text-base font-extrabold text-[#7A540E] tabular-nums pt-1">
                <Coins className="w-5 h-5 text-[#E6A222]" />
                <span>獲得 +{earnedCoinsPreview} 金幣</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => startRound(mode)}
                className="min-h-[46px] rounded-2xl bg-[#FF7A9E] text-white font-extrabold text-sm inline-flex items-center justify-center gap-1.5 hover:bg-[#F45D86] active:scale-95 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>再玩一次</span>
              </button>
              <button
                type="button"
                onClick={() => setPhase('TITLE_MENU')}
                className="min-h-[46px] rounded-2xl bg-[#E8F8F2] border border-[#AEE4D1] text-[#256D57] font-extrabold text-sm hover:bg-[#D8F3E9] active:scale-95 transition"
              >
                切換關卡
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] rounded-2xl bg-[#F7ECE6] text-[#5A3E36] text-xs font-extrabold hover:bg-[#EEDCD3] transition"
            >
              回到食堂照顧 {pet.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
