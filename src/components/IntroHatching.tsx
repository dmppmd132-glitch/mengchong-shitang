import React, { useState } from 'react';
import { PiggyCharacter } from './PiggyCharacter';

interface IntroHatchingProps {
  defaultName: string;
  onComplete: (petName: string) => void;
  onEggTapSound: () => void;
  onHatchSound: () => void;
}

export const IntroHatching: React.FC<IntroHatchingProps> = ({
  defaultName,
  onComplete,
  onEggTapSound,
  onHatchSound,
}) => {
  const [taps, setTaps] = useState(0);
  const [wobbleKey, setWobbleKey] = useState(0);
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState('');

  const isHatched = taps >= 3;

  const handleEggClick = () => {
    if (isHatched) return;
    const next = taps + 1;
    setTaps(next);
    setWobbleKey((k) => k + 1);
    if (next >= 3) {
      onHatchSound();
    } else {
      onEggTapSound();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('名字不能空白喔，請輸入 1～8 個字！');
      return;
    }
    if (trimmed.length > 8) {
      setError('名字最多只能 8 個字喔！');
      return;
    }
    onComplete(trimmed);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-between px-6 py-10 bg-gradient-to-b from-[#FFE9F0] via-[#FFF8E8] to-[#E6F8F1]">
      <div className="text-center space-y-2 mt-2">
        <p className="text-xs font-bold tracking-wider text-[#B85776]">
          歡迎來到溫馨療癒的
        </p>
        <h1 className="text-3xl font-extrabold text-[#4A3531] tracking-tight">
          萌寵食堂
        </h1>
      </div>

      <div className="w-full flex flex-col items-center justify-center my-4">
        {!isHatched ? (
          <div className="flex flex-col items-center">
            <button
              type="button"
              key={wobbleKey}
              onClick={handleEggClick}
              aria-label="點擊粉紅色蛋孵化小豬"
              className={`relative p-4 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A9E]/40 active:scale-95 transition-transform ${
                wobbleKey > 0 ? 'animate-egg-wobble' : 'animate-piggy-float'
              }`}
            >
              <svg viewBox="0 0 220 240" className="w-56 h-60 overflow-visible" aria-hidden="true">
                {/* Soft Nest */}
                <ellipse cx="110" cy="204" rx="84" ry="22" fill="#F5DDA4" stroke="#6E4E42" strokeWidth="4" />
                <path
                  d="M 42 200 Q 110 222 178 200"
                  fill="none"
                  stroke="#E0BC75"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Cute Pink Egg */}
                <path
                  d="M 110 34 C 154 34, 178 106, 174 152 C 170 190, 144 206, 110 206 C 76 206, 50 190, 46 152 C 42 106, 66 34, 110 34 Z"
                  fill="#FFB6CA"
                  stroke="#5A3E36"
                  strokeWidth="5"
                />
                {/* Egg Highlight & Polka Dots */}
                <ellipse cx="84" cy="84" rx="12" ry="22" transform="rotate(-18 84 84)" fill="#FFE1EB" opacity="0.75" />
                <circle cx="140" cy="112" r="10" fill="#FFE8A3" opacity="0.85" />
                <circle cx="76" cy="144" r="12" fill="#9CE5CE" opacity="0.75" />
                <circle cx="136" cy="164" r="8" fill="#FFE1EB" opacity="0.9" />

                {/* Crack Stage 1 */}
                {taps >= 1 && (
                  <path
                    d="M 106 86 L 94 102 L 108 116 L 96 130"
                    fill="none"
                    stroke="#5A3E36"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Crack Stage 2 */}
                {taps >= 2 && (
                  <path
                    d="M 108 116 L 128 126 L 118 144 L 138 152"
                    fill="none"
                    stroke="#5A3E36"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>

            <div className="mt-4 text-center space-y-1.5">
              <p className="text-base font-extrabold text-[#4A3531]">
                {taps === 0 && '輕點粉紅蛋，看看裡面是誰！'}
                {taps === 1 && '咦！蛋殼輕輕動了一下…'}
                {taps === 2 && '快破殼了！再點最後一下！'}
              </p>
              <p className="text-xs font-bold text-[#856C66] tabular-nums">
                孵化進度：{taps} / 3 次點擊
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-5">
            <div className="relative">
              <PiggyCharacter
                growth={0}
                roundness={28}
                action="petted"
                equipped={{ head: 'pink_bow', face: null, neck: null, body: null }}
                interactive={false}
                size={200}
              />
              <span className="absolute -top-2 right-2 text-2xl animate-bounce" aria-hidden="true">
                ✨
              </span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-[#4A3531]">
                小豬豬破殼而出啦！
              </h2>
              <p className="text-sm text-[#7D635D]">
                幫牠取個可愛的名字，一起經營萌寵食堂吧。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-[320px] space-y-3">
              <div>
                <label
                  htmlFor="piggy-name-input"
                  className="block text-xs font-bold text-[#6E544E] mb-1.5"
                >
                  小豬名字（最多 8 個字）
                </label>
                <input
                  id="piggy-name-input"
                  type="text"
                  maxLength={8}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="輸入小豬名字，例如：布丁"
                  className="w-full min-h-[48px] rounded-2xl bg-white border-2 border-[#F2CAD6] px-4 text-center text-lg font-extrabold text-[#4A3531] placeholder:text-[#BBA7A2] focus:outline-none focus:border-[#FF7A9E]"
                />
                <div className="mt-1 flex items-center justify-between text-xs text-[#856C66] px-1">
                  <span>{error ? <span className="text-[#D9426C] font-bold">{error}</span> : '不可空白'}</span>
                  <span className="tabular-nums">{name.trim().length} / 8</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[50px] rounded-2xl bg-[#FF7A9E] text-white font-extrabold text-base shadow-[0_4px_0_#D9577B] hover:bg-[#F76890] active:translate-y-0.5 active:shadow-[0_2px_0_#D9577B] transition-all"
              >
                開始照顧小豬
              </button>
            </form>
          </div>
        )}
      </div>

      <p className="text-xs text-[#917973] text-center">
        所有成長與體重紀錄皆安全保存在本機裝置中
      </p>
    </div>
  );
};
