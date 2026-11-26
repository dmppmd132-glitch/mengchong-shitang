import React, { useEffect, useRef, useState } from 'react';
import { Fish, Sparkles, X } from 'lucide-react';

interface LakeFishingMiniGameProps {
  open: boolean;
  onClose: () => void;
  onComplete: (caughtCount: number) => void;
}

const TOTAL_CASTS = 5;

const CATCH_POOL = [
  { emoji: '🐟', name: '銀鱗小鯉魚' },
  { emoji: '🐠', name: '陽光小鯛魚' },
  { emoji: '🐡', name: '圓滾滾河豚' },
  { emoji: '🦀', name: '水岸小螃蟹' },
  { emoji: '🐚', name: '閃亮小貝殼' },
];

export const LakeFishingMiniGame: React.FC<LakeFishingMiniGameProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const [round, setRound] = useState<number>(1);
  const [phase, setPhase] = useState<'ready' | 'aiming' | 'result' | 'finished'>('ready');
  const [cursor, setCursor] = useState<number>(18);
  const [caughtCount, setCaughtCount] = useState<number>(0);
  const [caughtLog, setCaughtLog] = useState<Array<{ emoji: string; name: string; hit: boolean }>>([]);
  const [lastResultText, setLastResultText] = useState<string>('輕點「拋竿下鉤」，在浮標滑入綠色魚群區時收竿！');

  const dirRef = useRef<number>(1);
  const posRef = useRef<number>(18);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!open) return;
    setRound(1);
    setPhase('ready');
    setCursor(18);
    posRef.current = 18;
    dirRef.current = 1;
    setCaughtCount(0);
    setCaughtLog([]);
    setLastResultText('輕點「拋竿下鉤」，在浮標滑入綠色魚群區時收竿！');
  }, [open]);

  useEffect(() => {
    if (!open || phase !== 'aiming') {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();
    const speed = 78 + round * 11;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;
      let next = posRef.current + dirRef.current * speed * dt;
      if (next >= 96) {
        next = 96;
        dirRef.current = -1;
      } else if (next <= 4) {
        next = 4;
        dirRef.current = 1;
      }
      posRef.current = next;
      setCursor(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [open, phase, round]);

  if (!open) return null;

  const handleCast = () => {
    posRef.current = 12;
    dirRef.current = 1;
    setCursor(12);
    setPhase('aiming');
    setLastResultText('盯緊浮標！滑進中央綠區就點擊收竿～');
  };

  const handleReel = () => {
    const val = posRef.current;
    const isHit = val >= 30 && val <= 70;
    const isPerfect = val >= 43 && val <= 57;

    if (isHit) {
      const picked = CATCH_POOL[(round + Math.floor(val)) % CATCH_POOL.length];
      setCaughtCount((c) => c + 1);
      setCaughtLog((prev) => [...prev, { emoji: picked.emoji, name: picked.name, hit: true }]);
      setLastResultText(
        isPerfect
          ? `✨ 完美拉竿！釣到了閃亮「${picked.name}」${picked.emoji}！`
          : `🎉 成功上鉤！獲得「${picked.name}」${picked.emoji}！`
      );
    } else {
      setCaughtLog((prev) => [...prev, { emoji: '💦', name: '溜走的小水花', hit: false }]);
      setLastResultText('💦 哎呀差一點點！小魚吐了個泡泡游走了～');
    }

    if (round >= TOTAL_CASTS) {
      setPhase('finished');
    } else {
      setPhase('result');
    }
  };

  const handleNextRound = () => {
    setRound((r) => r + 1);
    handleCast();
  };

  const handleFinishClaim = () => {
    onComplete(caughtCount);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#1F3A4D]/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lake-fishing-title"
    >
      <div className="w-full max-w-[408px] rounded-3xl bg-[#FFFDF8] border-2 border-[#BCE2F7] shadow-2xl overflow-hidden">
        <header className="px-4 py-3 bg-gradient-to-r from-[#DFF3FF] via-[#EBF9FF] to-[#E5F8F2] border-b border-[#CBE8F8] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-white text-[#2574A9] flex items-center justify-center shrink-0">
              <Fish className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="lake-fishing-title" className="text-sm font-extrabold text-[#1E4761] truncate">
                🎣 湖邊悠閒釣魚趣
              </h2>
              <p className="text-[11px] font-bold text-[#4B7792] tabular-nums">
                第 {Math.min(round, TOTAL_CASTS)} / {TOTAL_CASTS} 竿 · 已釣到 {caughtCount} 條
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉釣魚小遊戲"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/85 text-[#375A70] flex items-center justify-center hover:bg-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 space-y-3.5">
          {/* Scenic Lake Surface */}
          <div className="relative h-36 rounded-2xl bg-gradient-to-b from-[#BCEBFF] via-[#8ED7F7] to-[#58B8E5] border-2 border-[#9AD2F0] overflow-hidden flex flex-col items-center justify-between p-3">
            <div className="w-full flex items-center justify-between text-xs font-extrabold text-[#174868]">
              <span>🏞️ 微風木棧橋</span>
              <span className="tabular-nums bg-white/75 px-2 py-0.5 rounded-lg">
                🐟 × {caughtCount}
              </span>
            </div>

            <div className="relative flex items-center justify-center gap-5 my-1">
              <span className="text-3xl animate-bounce" style={{ animationDuration: '2.4s' }}>
                🦆
              </span>
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-[#5A3E36]/60" />
                <div
                  className={`w-5 h-5 rounded-full border-2 border-[#5A3E36] ${
                    phase === 'aiming' ? 'bg-[#FF6B8B] animate-pulse' : 'bg-[#FFF5EE]'
                  }`}
                />
              </div>
              <span className="text-2xl opacity-85">🐟</span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-white/30" />
          </div>

          {/* Timing Bar */}
          <div className="rounded-2xl bg-[#F2FAFF] border border-[#CFE9F7] p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[#2B5D7C]">
              <span>魚群感應條</span>
              <span>🎯 停在中央綠色區就上鉤</span>
            </div>
            <div className="relative h-8 rounded-full bg-[#DCEEF8] border-2 border-[#9CCBE6] overflow-hidden">
              {/* Green catch zone 30% - 70% */}
              <div
                className="absolute inset-y-0 bg-[#86E0B4]/80"
                style={{ left: '30%', width: '40%' }}
              />
              {/* Golden center zone 43% - 57% */}
              <div
                className="absolute inset-y-0 bg-[#FFE066]/90"
                style={{ left: '43%', width: '14%' }}
              />
              {/* Moving bobber cursor */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-7 rounded-full bg-[#FF6B8B] border-2 border-white shadow-md"
                style={{ left: `${cursor}%` }}
              />
            </div>
            <p className="text-xs font-bold text-[#355A72] text-center leading-snug min-h-[34px] flex items-center justify-center">
              {lastResultText}
            </p>
          </div>

          {/* Catch icons */}
          {caughtLog.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {caughtLog.map((entry, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-extrabold ${
                    entry.hit
                      ? 'bg-[#E8F9F0] border-[#9CDDC0] text-[#1F6B54]'
                      : 'bg-[#F3F5F7] border-[#DCE3E8] text-[#7A8B99]'
                  }`}
                >
                  {entry.emoji} {entry.hit ? entry.name : '沒中'}
                </span>
              ))}
            </div>
          )}

          {/* Action button */}
          {phase === 'ready' && (
            <button
              type="button"
              onClick={handleCast}
              className="w-full min-h-[48px] rounded-2xl bg-[#3898D4] text-white text-sm font-extrabold shadow-[0_3px_0_#246E9E] active:translate-y-0.5 transition"
            >
              🎣 拋竿下鉤！（第 1 竿）
            </button>
          )}

          {phase === 'aiming' && (
            <button
              type="button"
              onClick={handleReel}
              className="w-full min-h-[50px] rounded-2xl bg-[#FF7A9E] text-white text-sm font-extrabold shadow-[0_3px_0_#D9577B] active:translate-y-0.5 transition"
            >
              ✋ 立刻收竿拉魚！
            </button>
          )}

          {phase === 'result' && (
            <button
              type="button"
              onClick={handleNextRound}
              className="w-full min-h-[48px] rounded-2xl bg-[#5CC9A7] text-white text-sm font-extrabold shadow-[0_3px_0_#3BA585] active:translate-y-0.5 transition"
            >
              再甩一竿！（第 {round + 1} / {TOTAL_CASTS} 竿）
            </button>
          )}

          {phase === 'finished' && (
            <button
              type="button"
              onClick={handleFinishClaim}
              className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#45B894] to-[#3B9BD4] text-white text-sm font-extrabold shadow-[0_3px_0_#2B757A] inline-flex items-center justify-center gap-1.5 active:translate-y-0.5 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>結束釣魚，結算 {caughtCount} 條魚獎勵！</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
