import React, { useEffect, useState } from 'react';
import { getGrowthStage } from '../data/growth';
import { AccessorySlot, PiggyActionState } from '../types';

interface PiggyCharacterProps {
  growth: number;
  roundness: number;
  action: PiggyActionState;
  equipped: Record<AccessorySlot, string | null>;
  onPet?: () => void;
  size?: number;
  interactive?: boolean;
  isDropTarget?: boolean;
}

export const PiggyCharacter: React.FC<PiggyCharacterProps> = ({
  growth,
  roundness,
  action,
  equipped,
  onPet,
  size = 216,
  interactive = true,
  isDropTarget = false,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [tapKey, setTapKey] = useState(0);

  const stage = getGrowthStage(growth);
  const chubbyFactor = 0.97 + Math.min(roundness, 100) * 0.0012;
  const scaleX = stage.bodyScaleX * chubbyFactor;
  const scaleY = stage.bodyScaleY;

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => setIsBlinking(false), 150);
    }, 3400);
    return () => {
      clearInterval(interval);
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, []);

  const handleTap = () => {
    if (!interactive) return;
    setTapKey((k) => k + 1);
    onPet?.();
  };

  const animClass =
    action === 'eating'
      ? 'animate-piggy-chew'
      : action === 'sleeping'
      ? ''
      : 'animate-piggy-float';

  const eyesClosed = isBlinking || action === 'sleeping';
  const happyArcEyes = action === 'petted' || action === 'eating' || action === 'walking';

  return (
    <div
      key={tapKey}
      onClick={handleTap}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? '摸摸小豬' : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleTap();
        }
      }}
      style={{ width: size, height: size }}
      className={`relative select-none flex items-center justify-center transition-transform duration-200 ${
        interactive ? 'cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A9E]/40 rounded-full' : ''
      } ${action === 'petted' ? 'animate-piggy-squish' : ''} ${
        isDropTarget ? 'scale-105' : ''
      }`}
    >
      {isDropTarget && (
        <div className="absolute inset-2 rounded-full bg-[#FFE082]/45 border-2 border-dashed border-[#FF7A9E] pointer-events-none" />
      )}

      {stage.level === 4 && (
        <svg
          viewBox="0 0 240 240"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
          aria-hidden="true"
        >
          <circle cx="120" cy="126" r="92" fill="#FFF3C4" opacity="0.55" />
          <path d="M40 72 L44 82 L54 86 L44 90 L40 100 L36 90 L26 86 L36 82 Z" fill="#FFD54F" />
          <path d="M198 64 L201 72 L209 75 L201 78 L198 86 L195 78 L187 75 L195 72 Z" fill="#FFD54F" />
        </svg>
      )}

      {action === 'bathing' && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <span className="absolute left-6 bottom-12 w-5 h-5 rounded-full bg-white/80 border-2 border-[#7EDBC0] animate-bubble-rise" />
          <span
            className="absolute right-8 bottom-14 w-7 h-7 rounded-full bg-white/80 border-2 border-[#7EDBC0] animate-bubble-rise"
            style={{ animationDelay: '0.35s' }}
          />
          <span
            className="absolute left-14 top-10 w-4 h-4 rounded-full bg-white/85 border-2 border-[#A7EDE0] animate-bubble-rise"
            style={{ animationDelay: '0.7s' }}
          />
          <span
            className="absolute right-14 top-12 w-6 h-6 rounded-full bg-white/85 border-2 border-[#7EDBC0] animate-bubble-rise"
            style={{ animationDelay: '0.15s' }}
          />
        </div>
      )}

      {action === 'sleeping' && (
        <div className="absolute right-5 top-4 pointer-events-none flex flex-col items-end font-extrabold text-[#7B6594]" aria-hidden="true">
          <span className="text-lg animate-bounce">Z</span>
          <span className="text-sm -mt-1 mr-2 opacity-80">z</span>
        </div>
      )}

      <svg
        viewBox="0 0 240 240"
        className={`w-full h-full overflow-visible ${animClass}`}
        aria-hidden="true"
      >
        <ellipse cx="120" cy="212" rx={58 * scaleX} ry="11" fill="#E8D2C8" opacity="0.7" />

        <g transform={`translate(120, 128) scale(${scaleX}, ${scaleY}) translate(-120, -128)`}>
          <path
            d="M 184 156 C 202 150, 206 134, 194 132 C 185 131, 185 144, 196 144 C 204 144, 210 138, 208 130"
            fill="none"
            stroke="#5A3E36"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {equipped.body === 'strawberry_cape' && (
            <g>
              <path
                d="M 60 132 Q 44 176 58 194 Q 120 206 182 194 Q 196 176 180 132 Q 120 144 60 132 Z"
                fill="#FF8AA8"
                stroke="#5A3E36"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <circle cx="84" cy="166" r="4" fill="#FFFDF7" />
              <circle cx="156" cy="166" r="4" fill="#FFFDF7" />
              <circle cx="120" cy="180" r="4" fill="#FFFDF7" />
            </g>
          )}

          <g>
            <ellipse
              cx="68"
              cy="72"
              rx="20"
              ry="26"
              transform="rotate(-24 68 72)"
              fill="#FF9EB8"
              stroke="#5A3E36"
              strokeWidth="4.5"
            />
            <ellipse
              cx="69"
              cy="75"
              rx="10"
              ry="14"
              transform="rotate(-24 69 75)"
              fill="#FFD1DF"
            />
            <ellipse
              cx="172"
              cy="72"
              rx="20"
              ry="26"
              transform="rotate(24 172 72)"
              fill="#FF9EB8"
              stroke="#5A3E36"
              strokeWidth="4.5"
            />
            <ellipse
              cx="171"
              cy="75"
              rx="10"
              ry="14"
              transform="rotate(24 171 75)"
              fill="#FFD1DF"
            />
          </g>

          <ellipse
            cx="120"
            cy="134"
            rx="72"
            ry="64"
            fill="#FFB7CB"
            stroke="#5A3E36"
            strokeWidth="4.5"
          />

          <ellipse cx="120" cy="162" rx="44" ry="26" fill="#FFD3E0" opacity="0.7" />

          {equipped.body === 'mint_apron' && (
            <g>
              <path
                d="M 80 144 Q 120 150 160 144 L 166 186 Q 120 198 74 186 Z"
                fill="#7EDBC0"
                stroke="#5A3E36"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />
              <rect
                x="102"
                y="158"
                width="36"
                height="20"
                rx="8"
                fill="#FFF8E1"
                stroke="#5A3E36"
                strokeWidth="3"
              />
              <path d="M 114 168 L 126 168" stroke="#FF7A9E" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          <ellipse cx="88" cy="194" rx="14" ry="10" fill="#FF9EB8" stroke="#5A3E36" strokeWidth="4" />
          <ellipse cx="152" cy="194" rx="14" ry="10" fill="#FF9EB8" stroke="#5A3E36" strokeWidth="4" />

          <ellipse
            cx="54"
            cy="148"
            rx="12"
            ry="16"
            transform={action === 'walking' ? 'rotate(25 54 148)' : 'rotate(16 54 148)'}
            fill="#FFB7CB"
            stroke="#5A3E36"
            strokeWidth="4"
          />
          <ellipse
            cx="186"
            cy="148"
            rx="12"
            ry="16"
            transform={action === 'walking' ? 'rotate(-25 186 148)' : 'rotate(-16 186 148)'}
            fill="#FFB7CB"
            stroke="#5A3E36"
            strokeWidth="4"
          />

          <ellipse
            cx="72"
            cy="132"
            rx={stage.level >= 3 ? 14 : 11}
            ry={stage.level >= 3 ? 8 : 6.5}
            fill="#FF7B9C"
            opacity={action === 'petted' || stage.level >= 3 ? 0.78 : 0.55}
          />
          <ellipse
            cx="168"
            cy="132"
            rx={stage.level >= 3 ? 14 : 11}
            ry={stage.level >= 3 ? 8 : 6.5}
            fill="#FF7B9C"
            opacity={action === 'petted' || stage.level >= 3 ? 0.78 : 0.55}
          />

          {eyesClosed ? (
            <g stroke="#4A3531" strokeWidth="4" strokeLinecap="round" fill="none">
              <path d="M 78 112 Q 87 118 96 112" />
              <path d="M 144 112 Q 153 118 162 112" />
            </g>
          ) : happyArcEyes ? (
            <g stroke="#4A3531" strokeWidth="4.2" strokeLinecap="round" fill="none">
              <path d="M 78 114 Q 87 103 96 114" />
              <path d="M 144 114 Q 153 103 162 114" />
            </g>
          ) : (
            <g>
              <circle cx="87" cy="112" r="8" fill="#4A3531" />
              <circle cx="84.5" cy="109" r="3" fill="#FFFFFF" />
              {stage.level >= 3 && <circle cx="90" cy="115" r="1.6" fill="#FFFFFF" />}
              <circle cx="153" cy="112" r="8" fill="#4A3531" />
              <circle cx="150.5" cy="109" r="3" fill="#FFFFFF" />
              {stage.level >= 3 && <circle cx="156" cy="115" r="1.6" fill="#FFFFFF" />}
            </g>
          )}

          {action === 'stuffed' && (
            <path
              d="M 184 94 Q 192 106 184 112 Q 176 106 184 94 Z"
              fill="#A5E7F5"
              stroke="#5A3E36"
              strokeWidth="2.5"
            />
          )}

          <ellipse
            cx="120"
            cy="128"
            rx="27"
            ry="19"
            fill="#FF90AE"
            stroke="#5A3E36"
            strokeWidth="4"
          />
          <ellipse cx="110" cy="128" rx="4.2" ry="6.2" fill="#5A3E36" />
          <ellipse cx="130" cy="128" rx="4.2" ry="6.2" fill="#5A3E36" />

          {action === 'eating' ? (
            <ellipse cx="120" cy="155" rx="9" ry="7" fill="#E85B7B" stroke="#5A3E36" strokeWidth="3.5" />
          ) : action === 'stuffed' ? (
            <path
              d="M 110 156 Q 115 151 120 156 Q 125 161 130 156"
              fill="none"
              stroke="#5A3E36"
              strokeWidth="3.8"
              strokeLinecap="round"
            />
          ) : action === 'sleeping' ? (
            <circle cx="120" cy="155" r="3.5" fill="#5A3E36" />
          ) : (
            <path
              d="M 108 152 Q 120 163 132 152"
              fill="none"
              stroke="#5A3E36"
              strokeWidth="3.8"
              strokeLinecap="round"
            />
          )}

          {equipped.neck === 'baby_bib' && (
            <g>
              <path
                d="M 92 158 Q 120 170 148 158 Q 154 184 120 192 Q 86 184 92 158 Z"
                fill="#FFF0A5"
                stroke="#5A3E36"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <circle cx="120" cy="176" r="5" fill="#FF7A9E" />
            </g>
          )}
          {equipped.neck === 'mint_bell_tie' && (
            <g>
              <path d="M 96 160 L 120 168 L 96 176 Z" fill="#6CD4B5" stroke="#5A3E36" strokeWidth="3.2" strokeLinejoin="round" />
              <path d="M 144 160 L 120 168 L 144 176 Z" fill="#6CD4B5" stroke="#5A3E36" strokeWidth="3.2" strokeLinejoin="round" />
              <circle cx="120" cy="172" r="7" fill="#FFE066" stroke="#5A3E36" strokeWidth="3" />
              <circle cx="120" cy="174" r="1.8" fill="#5A3E36" />
            </g>
          )}

          {equipped.face === 'round_glasses' && (
            <g fill="none" stroke="#6B4423" strokeWidth="3.6">
              <circle cx="87" cy="112" r="15" fill="#FFFFFF" fillOpacity="0.22" />
              <circle cx="153" cy="112" r="15" fill="#FFFFFF" fillOpacity="0.22" />
              <path d="M 102 112 Q 120 107 138 112" />
              <path d="M 65 110 L 72 112" />
              <path d="M 168 112 L 175 110" />
            </g>
          )}
          {equipped.face === 'star_blush' && (
            <g fill="#FFE066" stroke="#5A3E36" strokeWidth="2">
              <path d="M 68 122 L 71 128 L 77 129 L 72 133 L 73 139 L 68 136 L 63 139 L 64 133 L 59 129 L 65 128 Z" />
              <path d="M 172 122 L 175 128 L 181 129 L 176 133 L 177 139 L 172 136 L 167 139 L 168 133 L 163 129 L 169 128 Z" />
            </g>
          )}
          {equipped.face === 'heart_shades' && (
            <g stroke="#5A3E36" strokeWidth="3">
              <path
                d="M 87 124 C 72 115 70 101 81 101 C 85 101 87 105 87 106 C 87 105 89 101 93 101 C 104 101 102 115 87 124 Z"
                fill="#FF6B9A"
              />
              <path
                d="M 153 124 C 138 115 136 101 147 101 C 151 101 153 105 153 106 C 153 105 155 101 159 101 C 170 101 168 115 153 124 Z"
                fill="#FF6B9A"
              />
              <path d="M 101 108 L 139 108" fill="none" strokeWidth="3.5" />
            </g>
          )}

          {equipped.head === 'pink_bow' && (
            <g transform="translate(120, 68)">
              <path d="M 0 0 L -24 -12 Q -28 2 -22 12 Z" fill="#FF6B9A" stroke="#5A3E36" strokeWidth="3.5" strokeLinejoin="round" />
              <path d="M 0 0 L 24 -12 Q 28 2 22 12 Z" fill="#FF6B9A" stroke="#5A3E36" strokeWidth="3.5" strokeLinejoin="round" />
              <circle cx="0" cy="0" r="8" fill="#FFE082" stroke="#5A3E36" strokeWidth="3.5" />
            </g>
          )}
          {equipped.head === 'strawberry_clip' && (
            <g transform="translate(152, 74) rotate(16)">
              <path d="M 0 -10 C 12 -10 14 4 0 14 C -14 4 -12 -10 0 -10 Z" fill="#FF5C8D" stroke="#5A3E36" strokeWidth="3.2" />
              <path d="M -8 -10 Q 0 -16 8 -10 Q 0 -6 -8 -10 Z" fill="#6CD4B5" stroke="#5A3E36" strokeWidth="2.5" />
              <circle cx="-3" cy="-1" r="1.5" fill="#FFF8E1" />
              <circle cx="4" cy="1" r="1.5" fill="#FFF8E1" />
              <circle cx="0" cy="6" r="1.5" fill="#FFF8E1" />
            </g>
          )}
          {equipped.head === 'mini_crown' && (
            <g transform="translate(120, 62)">
              <path
                d="M -22 12 L -26 -10 L -10 2 L 0 -14 L 10 2 L 26 -10 L 22 12 Z"
                fill="#FFD54F"
                stroke="#5A3E36"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <circle cx="0" cy="4" r="3.5" fill="#FF6B9A" />
            </g>
          )}
          {equipped.head === 'chef_hat' && (
            <g transform="translate(120, 56)">
              <path
                d="M -24 14 C -36 0 -22 -22 -6 -16 C 0 -28 16 -26 18 -14 C 32 -16 36 4 24 14 Z"
                fill="#FFFFFF"
                stroke="#5A3E36"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <rect x="-22" y="10" width="44" height="10" rx="4" fill="#FFF5DA" stroke="#5A3E36" strokeWidth="3.2" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
