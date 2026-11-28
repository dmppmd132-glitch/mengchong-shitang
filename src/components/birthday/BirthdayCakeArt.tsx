import React from 'react';
import {
  BIRTHDAY_CAKE_BASE_OPTIONS,
  BIRTHDAY_CAKE_CREAM_OPTIONS,
} from '../../data/birthday';
import {
  BirthdayCakeBase,
  BirthdayCakeCream,
  BirthdayCakeDecor,
} from '../../types';

interface BirthdayCakeArtProps {
  base: BirthdayCakeBase;
  cream: BirthdayCakeCream;
  decors: BirthdayCakeDecor[];
  plaqueText?: string;
  size?: number;
  showPlaque?: boolean;
  className?: string;
}

export const BirthdayCakeArt: React.FC<BirthdayCakeArtProps> = ({
  base,
  cream,
  decors,
  plaqueText,
  size = 92,
  showPlaque = false,
  className = '',
}) => {
  const baseMeta =
    BIRTHDAY_CAKE_BASE_OPTIONS.find((b) => b.id === base) ??
    BIRTHDAY_CAKE_BASE_OPTIONS[0];
  const creamMeta =
    BIRTHDAY_CAKE_CREAM_OPTIONS.find((c) => c.id === cream) ??
    BIRTHDAY_CAKE_CREAM_OPTIONS[0];

  const hasCandle = decors.includes('candle');
  const hasStrawberry = decors.includes('strawberry');
  const hasSprinkles = decors.includes('sprinkles');
  const hasFlags = decors.includes('flags');
  const hasHeart = decors.includes('heart');

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        {/* Cake Stand */}
        <ellipse cx="50" cy="86" rx="34" ry="7" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
        <rect x="44" y="88" width="12" height="6" rx="2" fill="#F2D7A8" stroke="#5A3E36" strokeWidth="2" />
        <ellipse cx="50" cy="95" rx="18" ry="3.2" fill="#FFF3D6" stroke="#5A3E36" strokeWidth="2" />

        {/* Lower Cake Tier */}
        <rect
          x="18"
          y="56"
          width="64"
          height="28"
          rx="8"
          fill={baseMeta.bodyColor}
          stroke="#5A3E36"
          strokeWidth="2.5"
        />
        <path
          d="M 19 72 Q 50 76 81 72 L 81 78 Q 50 82 19 78 Z"
          fill={baseMeta.shadeColor}
          opacity="0.7"
        />
        {/* Lower Tier Cream Drips */}
        <path
          d="M 18 56 C 18 50 82 50 82 56 L 82 62 Q 74 68 68 61 Q 61 69 54 61 Q 47 68 40 61 Q 33 69 26 61 Q 21 66 18 61 Z"
          fill={creamMeta.frostingColor}
          stroke="#5A3E36"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Upper Cake Tier */}
        <rect
          x="27"
          y="36"
          width="46"
          height="21"
          rx="7"
          fill={baseMeta.bodyColor}
          stroke="#5A3E36"
          strokeWidth="2.4"
        />
        <path
          d="M 27 36 C 27 30 73 30 73 36 L 73 43 Q 65 48 59 42 Q 52 48 46 42 Q 39 48 33 42 Q 29 46 27 42 Z"
          fill={creamMeta.frostingColor}
          stroke="#5A3E36"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
        <ellipse cx="50" cy="34.5" rx="19" ry="3.4" fill={creamMeta.highlightColor} opacity="0.85" />

        {/* Sprinkles Decor */}
        {hasSprinkles && (
          <g>
            <circle cx="33" cy="67" r="2" fill="#FF7EB6" />
            <circle cx="44" cy="70" r="2" fill="#FFE066" />
            <circle cx="56" cy="68" r="2" fill="#82E9FF" />
            <circle cx="67" cy="69" r="2" fill="#A78BFA" />
            <circle cx="37" cy="49" r="1.8" fill="#FFE066" />
            <circle cx="63" cy="48" r="1.8" fill="#FF7EB6" />
          </g>
        )}

        {/* Strawberries Decor */}
        {hasStrawberry && (
          <g>
            <path d="M 35 28 C 32 28 31 33 35 35 C 39 33 38 28 35 28 Z" fill="#FF5A7E" stroke="#5A3E36" strokeWidth="1.6" />
            <path d="M 32 28 L 35 26 L 38 28" stroke="#4CA66B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 65 28 C 62 28 61 33 65 35 C 69 33 68 28 65 28 Z" fill="#FF5A7E" stroke="#5A3E36" strokeWidth="1.6" />
            <path d="M 62 28 L 65 26 L 68 28" stroke="#4CA66B" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        {/* Mini Flags Decor */}
        {hasFlags && (
          <g>
            <line x1="25" y1="18" x2="25" y2="36" stroke="#5A3E36" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="75" y1="18" x2="75" y2="36" stroke="#5A3E36" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 25 20 Q 50 26 75 20" fill="none" stroke="#8C5A3C" strokeWidth="1.4" />
            <polygon points="34,21 42,22 38,28" fill="#FF8EB8" stroke="#5A3E36" strokeWidth="1" />
            <polygon points="46,22 54,22 50,29" fill="#FFE066" stroke="#5A3E36" strokeWidth="1" />
            <polygon points="58,22 66,21 62,28" fill="#82E9FF" stroke="#5A3E36" strokeWidth="1" />
          </g>
        )}

        {/* Heart Topper Decor */}
        {hasHeart && (
          <path
            d="M 50 51 C 46 47 41 49 41 53 C 41 57 50 62 50 62 C 50 62 59 57 59 53 C 59 49 54 47 50 51 Z"
            fill="#FF6B9A"
            stroke="#5A3E36"
            strokeWidth="1.7"
          />
        )}

        {/* Candles */}
        {hasCandle && (
          <g>
            <rect x="47.5" y="18" width="5" height="15" rx="2" fill="#FFE5EC" stroke="#5A3E36" strokeWidth="1.7" />
            <line x1="47.5" y1="23" x2="52.5" y2="21" stroke="#FF7AA8" strokeWidth="1.6" />
            <line x1="47.5" y1="28" x2="52.5" y2="26" stroke="#82E9FF" strokeWidth="1.6" />
            <path
              d="M 50 9 C 53 13 53 17 50 17 C 47 17 47 13 50 9 Z"
              fill="#FFD166"
              stroke="#D97706"
              strokeWidth="1.3"
            />
            {!hasStrawberry && (
              <>
                <rect x="36" y="22" width="4" height="12" rx="1.6" fill="#E0F7FF" stroke="#5A3E36" strokeWidth="1.5" />
                <path d="M 38 15 C 40 18 40 21 38 21 C 36 21 36 18 38 15 Z" fill="#FFD166" stroke="#D97706" strokeWidth="1.1" />
                <rect x="60" y="22" width="4" height="12" rx="1.6" fill="#FFF3C4" stroke="#5A3E36" strokeWidth="1.5" />
                <path d="M 62 15 C 64 18 64 21 62 21 C 60 21 60 18 62 15 Z" fill="#FFD166" stroke="#D97706" strokeWidth="1.1" />
              </>
            )}
          </g>
        )}
      </svg>
      {showPlaque && plaqueText && (
        <span className="mt-0.5 max-w-[140px] truncate rounded-lg border border-[#EBC0CF] bg-[#FFF8EB] px-2 py-0.5 text-[10px] font-extrabold text-[#7D4B3B]">
          🏷️ {plaqueText}
        </span>
      )}
    </div>
  );
};
