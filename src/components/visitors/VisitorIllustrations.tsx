import React from 'react';
import { VisitorBehavior, VisitorDecorId, VisitorId } from '../../types';

const COCOA = '#5A3E36';

interface VisitorSpriteProps {
  visitorId: VisitorId;
  behavior?: VisitorBehavior;
  reaction?: 'favorite' | 'neutral' | 'disliked' | null;
  size?: number;
  className?: string;
  showAffinityBadge?: number;
}

export const VisitorSprite: React.FC<VisitorSpriteProps> = ({
  visitorId,
  behavior = 'walking',
  reaction = null,
  size = 64,
  className = '',
  showAffinityBadge,
}) => {
  const animClass =
    reaction === 'favorite'
      ? 'animate-bounce'
      : behavior === 'walking'
      ? 'animate-piggy-float'
      : behavior === 'smelling'
      ? 'animate-pulse'
      : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${animClass} ${className}`}
      style={{ width: size, height: size }}
    >
      {reaction === 'favorite' && (
        <span
          className="pointer-events-none absolute -top-2 right-0 text-xs animate-bounce"
          aria-hidden="true"
        >
          💖
        </span>
      )}
      {typeof showAffinityBadge === 'number' && showAffinityBadge >= 5 && (
        <span
          className="pointer-events-none absolute -top-2 left-0 text-xs"
          aria-hidden="true"
        >
          👑
        </span>
      )}

      <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-sm" aria-hidden="true">
        {/* Soft ground shadow */}
        <ellipse cx="40" cy="70" rx="22" ry="5" fill="#5A3E36" fillOpacity="0.14" />

        {visitorId === 'bird' && (
          <g transform={behavior === 'smelling' ? 'rotate(6 40 46)' : ''}>
            {/* Tail feathers */}
            <path
              d="M 18 46 L 8 36 L 15 51 L 9 54 L 22 54 Z"
              fill="#6ABCE2"
              stroke={COCOA}
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            {/* Wing */}
            <ellipse
              cx="36"
              cy="46"
              rx="13"
              ry="10"
              transform="rotate(-12 36 46)"
              fill="#7ED1F3"
              stroke={COCOA}
              strokeWidth="2.6"
            />
            {/* Round bird body & head */}
            <ellipse
              cx="42"
              cy="45"
              rx="18"
              ry="16"
              fill="#8CE0FF"
              stroke={COCOA}
              strokeWidth="2.8"
            />
            {/* Cream belly */}
            <ellipse cx="46" cy="51" rx="11" ry="9" fill="#FFF9E8" />
            {/* Crest feather */}
            <path
              d="M 41 29 Q 38 18 47 22 Q 48 27 45 29 Z"
              fill="#6ABCE2"
              stroke={COCOA}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Cute eye & cheek */}
            <circle cx="49" cy="39" r="3" fill={COCOA} />
            <circle cx="50" cy="38" r="1" fill="#FFFFFF" />
            <ellipse cx="44" cy="43" rx="3.2" ry="2" fill="#FF9EB8" opacity="0.7" />
            {/* Beak */}
            <polygon
              points="57,40 67,43 57,46"
              fill="#FFB84D"
              stroke={COCOA}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Feet */}
            {behavior === 'sitting' ? (
              <path d="M 36 60 L 40 64 M 46 60 L 50 64" stroke="#E28743" strokeWidth="2.8" strokeLinecap="round" />
            ) : (
              <g stroke="#E28743" strokeWidth="2.8" strokeLinecap="round">
                <line x1="38" y1="60" x2="36" y2="68" />
                <line x1="46" y1="60" x2="48" y2="68" />
              </g>
            )}
          </g>
        )}

        {visitorId === 'squirrel' && (
          <g transform={behavior === 'looking_farm' ? 'translate(2, -1)' : ''}>
            {/* Big fluffy squirrel tail */}
            <path
              d="M 27 56 C 10 56 6 24 22 18 C 33 14 36 28 29 36 C 34 39 34 52 27 56 Z"
              fill="#D98A4E"
              stroke={COCOA}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <path
              d="M 20 26 C 14 29 14 42 21 47"
              fill="none"
              stroke="#FFE3B8"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Body */}
            <ellipse
              cx="44"
              cy="50"
              rx="14"
              ry="14"
              fill="#E59A5D"
              stroke={COCOA}
              strokeWidth="2.8"
            />
            <ellipse cx="47" cy="53" rx="8.5" ry="9.5" fill="#FFF3DC" />
            {/* Head */}
            <circle
              cx="46"
              cy="33"
              r="13"
              fill="#E59A5D"
              stroke={COCOA}
              strokeWidth="2.8"
            />
            {/* Ears */}
            <path
              d="M 37 23 L 34 12 L 43 20 Z"
              fill="#D98A4E"
              stroke={COCOA}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 48 21 L 52 10 L 56 22 Z"
              fill="#D98A4E"
              stroke={COCOA}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Cheek */}
            <ellipse cx="52" cy="36" rx="4.2" ry="3.2" fill="#FFF3DC" />
            <ellipse cx="47" cy="37" rx="3.2" ry="2" fill="#FF9EB8" opacity="0.7" />
            {/* Eye & nose */}
            <circle cx="51" cy="31" r="2.8" fill={COCOA} />
            <circle cx="52" cy="30" r="1" fill="#FFFFFF" />
            <circle cx="58" cy="34" r="2" fill={COCOA} />
            {/* Acorn held in paws */}
            <circle cx="56" cy="50" r="4.5" fill="#C97A3E" stroke={COCOA} strokeWidth="2.2" />
            <path d="M 52 48 Q 56 43 60 48 Z" fill="#8D5524" stroke={COCOA} strokeWidth="2" />
            {/* Feet */}
            <ellipse cx="40" cy="64" rx="5.5" ry="3" fill="#D98A4E" stroke={COCOA} strokeWidth="2.4" />
            <ellipse cx="51" cy="64" rx="5.5" ry="3" fill="#D98A4E" stroke={COCOA} strokeWidth="2.4" />
          </g>
        )}

        {visitorId === 'rabbit' && (
          <g transform={behavior === 'smelling' ? 'rotate(5 40 50)' : ''}>
            {/* Fluffy tail */}
            <circle cx="24" cy="54" r="6" fill="#FFFFFF" stroke={COCOA} strokeWidth="2.5" />
            {/* Ears */}
            <ellipse
              cx="36"
              cy="19"
              rx="4.8"
              ry="13"
              transform="rotate(-10 36 19)"
              fill="#FFFDF9"
              stroke={COCOA}
              strokeWidth="2.6"
            />
            <ellipse
              cx="36"
              cy="19"
              rx="2.3"
              ry="8"
              transform="rotate(-10 36 19)"
              fill="#FFB8D0"
            />
            <ellipse
              cx="48"
              cy="18"
              rx="4.8"
              ry="13"
              transform="rotate(8 48 18)"
              fill="#FFFDF9"
              stroke={COCOA}
              strokeWidth="2.6"
            />
            <ellipse
              cx="48"
              cy="18"
              rx="2.3"
              ry="8"
              transform="rotate(8 48 18)"
              fill="#FFB8D0"
            />
            {/* Body */}
            <ellipse
              cx="41"
              cy="51"
              rx="15"
              ry="14"
              fill="#FFFDF9"
              stroke={COCOA}
              strokeWidth="2.8"
            />
            {/* Head */}
            <ellipse
              cx="44"
              cy="35"
              rx="14"
              ry="12"
              fill="#FFFDF9"
              stroke={COCOA}
              strokeWidth="2.8"
            />
            {/* Cheeks & eyes */}
            <circle cx="40" cy="34" r="2.6" fill={COCOA} />
            <circle cx="40.8" cy="33" r="0.9" fill="#FFFFFF" />
            <circle cx="51" cy="34" r="2.6" fill={COCOA} />
            <circle cx="51.8" cy="33" r="0.9" fill="#FFFFFF" />
            <ellipse cx="36" cy="38" rx="3.2" ry="2" fill="#FF9EB8" opacity="0.7" />
            <ellipse cx="53" cy="38" rx="3.2" ry="2" fill="#FF9EB8" opacity="0.7" />
            {/* Pink nose & smile */}
            <polygon points="45.5,36 48,38.5 43,38.5" fill="#FF7A9E" />
            <path d="M 43 40 Q 45.5 42.5 48 40" fill="none" stroke={COCOA} strokeWidth="2" strokeLinecap="round" />
            {/* Tiny flower ribbon */}
            <circle cx="32" cy="44" r="3.5" fill="#FF8AA8" stroke={COCOA} strokeWidth="2" />
            {/* Paws */}
            <ellipse cx="36" cy="64" rx="5" ry="3" fill="#FFFDF9" stroke={COCOA} strokeWidth="2.4" />
            <ellipse cx="48" cy="64" rx="5" ry="3" fill="#FFFDF9" stroke={COCOA} strokeWidth="2.4" />
          </g>
        )}
      </svg>
    </div>
  );
};

interface VisitorDecorSvgProps {
  decorId: VisitorDecorId;
  size?: number;
  className?: string;
}

export const VisitorDecorSvg: React.FC<VisitorDecorSvgProps> = ({
  decorId,
  size = 44,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {decorId === 'oak_tree' && (
        <g>
          <rect x="27" y="34" width="10" height="22" rx="4" fill="#A66E43" stroke={COCOA} strokeWidth="2.4" />
          <circle cx="22" cy="27" r="12" fill="#77C98E" stroke={COCOA} strokeWidth="2.4" />
          <circle cx="41" cy="28" r="11" fill="#64B87D" stroke={COCOA} strokeWidth="2.4" />
          <circle cx="32" cy="18" r="13" fill="#89DC9D" stroke={COCOA} strokeWidth="2.4" />
          <circle cx="27" cy="16" r="2.2" fill="#FFE680" />
          <circle cx="39" cy="25" r="2.2" fill="#FF8EB0" />
        </g>
      )}
      {decorId === 'potted_herbs' && (
        <g>
          <path d="M 20 38 L 44 38 L 40 56 L 24 56 Z" fill="#D98856" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" />
          <rect x="18" y="33" width="28" height="6" rx="3" fill="#E99F6E" stroke={COCOA} strokeWidth="2.2" />
          <path d="M 32 33 C 22 28 18 16 26 14 C 30 20 32 28 32 33 Z" fill="#68C88C" stroke={COCOA} strokeWidth="2.2" />
          <path d="M 32 33 C 42 28 46 16 38 14 C 34 20 32 28 32 33 Z" fill="#83DC9F" stroke={COCOA} strokeWidth="2.2" />
          <circle cx="32" cy="15" r="4.5" fill="#FFE066" stroke={COCOA} strokeWidth="2" />
        </g>
      )}
      {decorId === 'bird_feeder' && (
        <g>
          <line x1="32" y1="36" x2="32" y2="57" stroke="#A66E43" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 16 24 L 32 11 L 48 24 Z" fill="#FF8AA8" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" />
          <rect x="20" y="24" width="24" height="14" rx="3" fill="#FFF3DC" stroke={COCOA} strokeWidth="2.4" />
          <circle cx="32" cy="30" r="4" fill="#5A3E36" />
          <rect x="17" y="37" width="30" height="5" rx="2.5" fill="#D99B56" stroke={COCOA} strokeWidth="2.2" />
          <circle cx="28" cy="36" r="1.8" fill="#FFD54F" />
          <circle cx="35" cy="36" r="1.8" fill="#FFD54F" />
        </g>
      )}
      {decorId === 'nut_bowl' && (
        <g>
          <path d="M 14 34 Q 32 38 50 34 Q 48 53 32 53 Q 16 53 14 34 Z" fill="#C9834C" stroke={COCOA} strokeWidth="2.4" />
          <ellipse cx="32" cy="34" rx="18" ry="5" fill="#E4A36C" stroke={COCOA} strokeWidth="2.2" />
          <circle cx="26" cy="32" r="4.5" fill="#A65E2E" stroke={COCOA} strokeWidth="2" />
          <circle cx="35" cy="31" r="4.8" fill="#B86B35" stroke={COCOA} strokeWidth="2" />
          <circle cx="31" cy="34" r="4.2" fill="#8C4A22" stroke={COCOA} strokeWidth="2" />
        </g>
      )}
      {decorId === 'flower_arch' && (
        <g>
          <path d="M 14 56 L 14 28 A 18 18 0 0 1 50 28 L 50 56" fill="none" stroke="#85C997" strokeWidth="6" strokeLinecap="round" />
          <path d="M 14 56 L 14 28 A 18 18 0 0 1 50 28 L 50 56" fill="none" stroke={COCOA} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="18" cy="24" r="5" fill="#FF9EB8" stroke={COCOA} strokeWidth="1.8" />
          <circle cx="32" cy="11" r="5.5" fill="#FFE066" stroke={COCOA} strokeWidth="1.8" />
          <circle cx="46" cy="24" r="5" fill="#FF9EB8" stroke={COCOA} strokeWidth="1.8" />
          <circle cx="24" cy="14" r="3.5" fill="#FFFDF7" stroke={COCOA} strokeWidth="1.6" />
          <circle cx="40" cy="14" r="3.5" fill="#FFFDF7" stroke={COCOA} strokeWidth="1.6" />
        </g>
      )}
      {decorId === 'feather_windchime' && (
        <g>
          <path d="M 16 18 Q 32 10 48 18" fill="none" stroke={COCOA} strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="14" r="5" fill="#8CE0FF" stroke={COCOA} strokeWidth="2.2" />
          <line x1="22" y1="18" x2="22" y2="38" stroke={COCOA} strokeWidth="1.8" />
          <line x1="32" y1="19" x2="32" y2="44" stroke={COCOA} strokeWidth="1.8" />
          <line x1="42" y1="18" x2="42" y2="38" stroke={COCOA} strokeWidth="1.8" />
          <ellipse cx="22" cy="43" rx="4" ry="8" fill="#8CE0FF" stroke={COCOA} strokeWidth="2" />
          <ellipse cx="32" cy="48" rx="4.5" ry="9" fill="#FFE066" stroke={COCOA} strokeWidth="2" />
          <ellipse cx="42" cy="43" rx="4" ry="8" fill="#FF9EB8" stroke={COCOA} strokeWidth="2" />
        </g>
      )}
      {decorId === 'acorn_ornament' && (
        <g>
          <path d="M 32 12 L 32 18" stroke={COCOA} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 19 30 C 19 45 25 54 32 54 C 39 54 45 45 45 30 Z" fill="#D98A4E" stroke={COCOA} strokeWidth="2.4" />
          <path d="M 16 30 Q 32 14 48 30 Z" fill="#8C4E27" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="28" cy="39" r="2.2" fill="#FFFDF7" opacity="0.65" />
        </g>
      )}
      {decorId === 'rabbit_garden_statue' && (
        <g>
          <rect x="16" y="48" width="32" height="8" rx="4" fill="#E6E1DA" stroke={COCOA} strokeWidth="2.2" />
          <ellipse cx="28" cy="20" rx="3" ry="9" fill="#FFFDF9" stroke={COCOA} strokeWidth="2.2" />
          <ellipse cx="36" cy="20" rx="3" ry="9" fill="#FFFDF9" stroke={COCOA} strokeWidth="2.2" />
          <circle cx="32" cy="32" r="9" fill="#FFFDF9" stroke={COCOA} strokeWidth="2.2" />
          <ellipse cx="32" cy="43" rx="10" ry="7" fill="#FFFDF9" stroke={COCOA} strokeWidth="2.2" />
          <circle cx="22" cy="48" r="3.5" fill="#FF8AA8" stroke={COCOA} strokeWidth="1.8" />
          <circle cx="42" cy="48" r="3.5" fill="#FFE066" stroke={COCOA} strokeWidth="1.8" />
        </g>
      )}
    </svg>
  );
};
