import React, { useEffect, useState } from 'react';
import { getGrowthStage } from '../data/growth';
import { getPetSpeciesInfo } from '../data/species';
import {
  AccessorySlot,
  FeedingVisualEffect,
  PetExpression,
  PetSpecies,
  PetTouchZone,
  PetViewDirection,
  PiggyActionState,
} from '../types';

interface PiggyCharacterProps {
  species?: PetSpecies;
  growth: number;
  roundness: number;
  action: PiggyActionState;
  expression?: PetExpression;
  equipped: Record<AccessorySlot, string | null>;
  flyingFoodEmoji?: string | null;
  feedEffect?: FeedingVisualEffect;
  feedParticles?: string[];
  onPet?: (zone: PetTouchZone) => void;
  size?: number;
  interactive?: boolean;
  isDropTarget?: boolean;
  customAnimClass?: string;
  viewDirection?: PetViewDirection;
}

export const PiggyCharacter: React.FC<PiggyCharacterProps> = ({
  species = 'pig',
  growth,
  roundness,
  action,
  expression = 'normal',
  equipped,
  flyingFoodEmoji = null,
  feedEffect = 'none',
  feedParticles = [],
  onPet,
  size = 216,
  interactive = true,
  isDropTarget = false,
  customAnimClass = '',
  viewDirection = 'front',
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [chewTick, setChewTick] = useState(false);
  const [tapKey, setTapKey] = useState(0);

  const stage = getGrowthStage(growth);
  const speciesInfo = getPetSpeciesInfo(species);
  const clampedRoundness = Math.min(100, Math.max(0, roundness));
  const chubbyFactor = 0.95 + clampedRoundness * 0.0018;
  const scaleX = stage.bodyScaleX * chubbyFactor;
  const scaleY = stage.bodyScaleY * (0.97 + clampedRoundness * 0.0006);
  const bodyRx = 68 + clampedRoundness * 0.1;
  const bodyRy = 61 + clampedRoundness * 0.05;

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

  useEffect(() => {
    if (action !== 'eating') {
      setChewTick(false);
      return;
    }
    const interval = setInterval(() => {
      setChewTick((prev) => !prev);
    }, 180);
    return () => clearInterval(interval);
  }, [action]);

  const detectTouchZone = (clientX?: number, clientY?: number, target?: HTMLElement): PetTouchZone => {
    if (clientX === undefined || clientY === undefined || !target) {
      return 'head';
    }
    const rect = target.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return 'head';
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;

    if (relY < 0.42) return 'head';
    if (relY < 0.62) return 'cheek';
    if (relX < 0.28 || relX > 0.72 || relY >= 0.8) return 'paw';
    return 'belly';
  };

  const handleTap = (zone: PetTouchZone) => {
    if (!interactive) return;
    setTapKey((k) => k + 1);
    onPet?.(zone);
  };

  const animClass =
    customAnimClass
      ? customAnimClass
      : feedEffect === 'favoriteJump'
      ? 'animate-piggy-jump'
      : action === 'stuffed' || feedEffect === 'stuffed'
      ? 'animate-piggy-stuffed'
      : action === 'eating'
      ? 'animate-piggy-chew'
      : action === 'sleeping'
      ? ''
      : 'animate-piggy-float';

  const eyesClosed = isBlinking || action === 'sleeping';
  const happyArcEyes =
    (action === 'eating' && feedEffect !== 'favoriteJump' && expression === 'normal') ||
    action === 'opening' ||
    action === 'walking' ||
    (action === 'petted' && expression === 'normal');

  const palette =
    species === 'rabbit'
      ? {
          body: stage.level >= 4 ? '#FFF9FC' : '#FFFDF9',
          belly: '#FFEAF2',
          bellyLine: '#F0B8CC',
          limb: '#FFEFF5',
          blush: '#FF9AB8',
        }
      : species === 'dog'
      ? {
          body: stage.level >= 4 ? '#FFE09E' : '#FFE7B3',
          belly: '#FFF6DC',
          bellyLine: '#DCA75B',
          limb: '#F9D68D',
          blush: '#FF8D8D',
        }
      : {
          body: stage.level >= 4 ? '#FFACC3' : '#FFB7CB',
          belly: '#FFD3E0',
          bellyLine: '#E991AA',
          limb: '#FF9EB8',
          blush: '#FF7B9C',
        };

  const renderHeadAccessories = () => (
    <>
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
      {equipped.head === 'beret_hat' && (
        <g transform="translate(120, 68)">
          <path d="M 0 -22 L 3 -29" stroke="#5A3E36" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="0" cy="-6" rx="30" ry="14" fill="#C97E49" stroke="#5A3E36" strokeWidth="3.5" />
          <path d="M -24 4 Q 0 12 24 4" fill="none" stroke="#5A3E36" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}
      {equipped.head === 'sprout_clip' && (
        <g transform="translate(120, 68)">
          <path d="M 0 6 L 0 -12" stroke="#5A3E36" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M 0 -10 C -5 -26 -24 -26 -22 -12 C -20 -2 -5 -2 0 -10 Z" fill="#6CD4B5" stroke="#5A3E36" strokeWidth="3.2" />
          <path d="M 0 -12 C 5 -28 24 -28 22 -14 C 20 -4 5 -4 0 -12 Z" fill="#95E8C9" stroke="#5A3E36" strokeWidth="3.2" />
        </g>
      )}
      {equipped.head === 'crystal_crown' && (
        <g transform="translate(120, 62)">
          <path
            d="M -24 12 L -28 -11 L -12 0 L 0 -18 L 12 0 L 28 -11 L 24 12 Z"
            fill="#FFD54F"
            stroke="#5A3E36"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <path d="M -21 6 L 21 6" stroke="#F4B400" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="-28" cy="-13" r="3.4" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
          <circle cx="0" cy="-20" r="3.8" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
          <circle cx="28" cy="-13" r="3.4" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
          <polygon points="0,-5 5,1 0,7 -5,1" fill="#6EC6FF" stroke="#5A3E36" strokeWidth="2" />
          <circle cx="-13" cy="4" r="2.8" fill="#FF6B9A" />
          <circle cx="13" cy="4" r="2.8" fill="#FF6B9A" />
        </g>
      )}
      {equipped.head === 'bunny_flower_crown' && (
        <g transform="translate(120, 72)">
          <path d="M -32 6 Q 0 -6 32 6" fill="none" stroke="#68B984" strokeWidth="4.6" strokeLinecap="round" />
          <ellipse cx="-26" cy="3" rx="6" ry="3.2" transform="rotate(-28 -26 3)" fill="#7EDBC0" stroke="#5A3E36" strokeWidth="2.2" />
          <ellipse cx="26" cy="3" rx="6" ry="3.2" transform="rotate(28 26 3)" fill="#7EDBC0" stroke="#5A3E36" strokeWidth="2.2" />
          <g transform="translate(-16, -1)">
            <circle cx="0" cy="-4.5" r="3.8" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="4.5" cy="0" r="3.8" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="-4.5" cy="0" r="3.8" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="0" cy="4.5" r="3.8" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="0" cy="0" r="3" fill="#FFE066" />
          </g>
          <g transform="translate(0, -4)">
            <circle cx="0" cy="-5" r="4.2" fill="#FFB8D0" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="5" cy="0" r="4.2" fill="#FFB8D0" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="-5" cy="0" r="4.2" fill="#FFB8D0" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="0" cy="5" r="4.2" fill="#FFB8D0" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="0" cy="0" r="3.2" fill="#FFE066" />
          </g>
          <g transform="translate(16, -1)">
            <circle cx="0" cy="-4.5" r="3.8" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="4.5" cy="0" r="3.8" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="-4.5" cy="0" r="3.8" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="0" cy="4.5" r="3.8" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.8" />
            <circle cx="0" cy="0" r="3" fill="#FFE066" />
          </g>
        </g>
      )}
      {equipped.head === 'strawberry_shake_headband' && (
        <g transform="translate(120, 72)">
          <path d="M -34 10 C -32 -10 32 -10 34 10" fill="none" stroke="#FF8EB0" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M -34 10 C -32 -10 32 -10 34 10" fill="none" stroke="#5A3E36" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="-11" cy="-8" r="6" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.6" />
          <circle cx="0" cy="-12" r="7.5" fill="#FFF5F8" stroke="#5A3E36" strokeWidth="2.6" />
          <circle cx="11" cy="-8" r="6" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.6" />
          <path d="M 0 -30 C 10 -30 12 -18 0 -9 C -12 -18 -10 -30 0 -30 Z" fill="#FF5484" stroke="#5A3E36" strokeWidth="2.8" />
          <path d="M -6 -30 Q 0 -35 6 -30" fill="none" stroke="#6CD4B5" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="-3" cy="-20" r="1.4" fill="#FFF8E1" />
          <circle cx="3" cy="-18" r="1.4" fill="#FFF8E1" />
        </g>
      )}
      {equipped.head === 'mini_mushroom_hat' && (
        <g transform="translate(120, 62)">
          <path d="M -28 8 C -28 -22 28 -22 28 8 Q 0 15 -28 8 Z" fill="#F05D5E" stroke="#5A3E36" strokeWidth="3.5" strokeLinejoin="round" />
          <ellipse cx="-13" cy="-5" rx="5.2" ry="4.4" fill="#FFFDF7" />
          <ellipse cx="4" cy="-10" rx="5.8" ry="4.6" fill="#FFFDF7" />
          <ellipse cx="17" cy="-2" rx="4.2" ry="3.6" fill="#FFFDF7" />
          <path d="M -13 10 Q 0 16 13 10 L 11 17 Q 0 20 -11 17 Z" fill="#FFF3DC" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}
      {equipped.head === 'cloud_nightcap' && (
        <g transform="translate(120, 64)">
          <path d="M -25 10 Q 0 -28 30 -10 Q 18 3 23 12 Z" fill="#89B9FA" stroke="#5A3E36" strokeWidth="3.4" strokeLinejoin="round" />
          <rect x="-27" y="7" width="52" height="11" rx="5.5" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="3.2" />
          <circle cx="31" cy="-8" r="7" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="3" />
        </g>
      )}
      {equipped.head === 'mini_chef_hat' && (
        <g transform="translate(120, 64)">
          <path d="M -18 8 C -26 -5 -14 -19 -2 -14 C 2 -23 16 -21 16 -11 C 27 -12 27 3 18 8 Z" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="3.2" strokeLinejoin="round" />
          <rect x="-17" y="6" width="34" height="9" rx="3.5" fill="#FFF5DA" stroke="#5A3E36" strokeWidth="3" />
          <path d="M 0 7.5 L 1.6 10.5 L 4.8 11 L 2.4 13 L 3 16 L 0 14.5 L -3 16 L -2.4 13 L -4.8 11 L -1.6 10.5 Z" fill="#FFD54F" />
        </g>
      )}
      {equipped.head === 'star_detector_hat' && (
        <g transform="translate(120, 66)">
          <line x1="0" y1="-12" x2="0" y2="-28" stroke="#5A3E36" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="0" cy="-31" r="5.5" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.8" />
          <path d="M -26 9 C -26 -14 26 -14 26 9 Z" fill="#6374C9" stroke="#5A3E36" strokeWidth="3.4" strokeLinejoin="round" />
          <path d="M -21 9 L 21 9" stroke="#85D7FF" strokeWidth="4" strokeLinecap="round" />
          <circle cx="-9" cy="-1" r="2.8" fill="#FFE066" />
          <circle cx="10" cy="-2" r="3" fill="#85D7FF" />
        </g>
      )}
      {equipped.head === 'birthday_mini_crown' && (
        <g transform="translate(120, 64)">
          <line x1="0" y1="-12" x2="0" y2="-24" stroke="#FF8EB0" strokeWidth="4" strokeLinecap="round" />
          <path d="M 0 -33 C 4 -28 4 -24 0 -24 C -4 -24 -4 -28 0 -33 Z" fill="#FFB300" stroke="#5A3E36" strokeWidth="2" />
          <path d="M -21 11 L -24 -10 L -10 1 L 0 -13 L 10 1 L 24 -10 L 21 11 Z" fill="#FFE082" stroke="#5A3E36" strokeWidth="3.2" strokeLinejoin="round" />
          <path d="M -18 4 Q -9 9 0 4 Q 9 9 18 4" fill="none" stroke="#FF6B9A" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="-9" cy="6" r="2.4" fill="#6EC6FF" />
          <circle cx="9" cy="6" r="2.4" fill="#6CD4B5" />
        </g>
      )}
      {equipped.head === 'starlight_spark_pin' && (
        <g transform="translate(152, 74) rotate(14)">
          <path d="M -16 3 L 16 3" stroke="#F4B43E" strokeWidth="4.6" strokeLinecap="round" />
          <path d="M -16 3 L 16 3" stroke="#FFF2A8" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M -5 -11 L -2 -3.5 L 6 -2.6 L 0 2.6 L 1.6 10 L -5 6.2 L -11.6 10 L -10 2.6 L -16 -2.6 L -8 -3.5 Z"
            fill="#FFE066"
            stroke="#5A3E36"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path
            d="M 9 -7.5 L 11 -2.5 L 16.5 -1.8 L 12.4 1.6 L 13.4 6.8 L 9 4 L 4.6 6.8 L 5.6 1.6 L 1.5 -1.8 L 7 -2.5 Z"
            fill="#FF8EB0"
            stroke="#5A3E36"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="-5" cy="0" r="2" fill="#FFFDF7" />
        </g>
      )}
    </>
  );

  return (
    <div
      key={tapKey}
      onClick={(e) => handleTap(detectTouchZone(e.clientX, e.clientY, e.currentTarget))}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `摸摸${speciesInfo.shortName}的頭、臉頰、肚子或小手` : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleTap('head');
        }
      }}
      style={{ width: size, height: size }}
      className={`relative select-none flex items-center justify-center transition-transform duration-200 ${
        interactive
          ? 'cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A9E]/40 rounded-full'
          : ''
      } ${action === 'petted' ? 'animate-piggy-squish' : ''} ${
        isDropTarget ? 'scale-105' : ''
      }`}
    >
      {isDropTarget && (
        <div className="absolute inset-2 rounded-full bg-[#FFE082]/45 border-2 border-dashed border-[#FF7A9E] pointer-events-none" />
      )}

      {/* Flying food animation toward pet mouth */}
      {flyingFoodEmoji && (
        <div
          key={flyingFoodEmoji + '_' + action}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          aria-hidden="true"
        >
          <span className="text-4xl animate-food-fly drop-shadow-sm translate-y-6">
            {flyingFoodEmoji}
          </span>
        </div>
      )}

      {stage.level === 4 && (
        <svg
          viewBox="0 0 240 240"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
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
        <div
          className="absolute right-5 top-4 pointer-events-none flex flex-col items-end font-extrabold text-[#7B6594]"
          aria-hidden="true"
        >
          <span className="text-lg animate-bounce">Z</span>
          <span className="text-sm -mt-1 mr-2 opacity-80">z</span>
        </div>
      )}

      {(action === 'eating' || feedEffect === 'hearts' || feedEffect === 'favoriteJump') && (
        <div className="absolute inset-0 pointer-events-none z-20" aria-hidden="true">
          {(feedParticles.length > 0 ? feedParticles : ['🩷', '💖', '✨']).map((emoji, idx) => {
            const positions = [
              'left-6 top-10',
              'right-6 top-8',
              'left-1/2 -translate-x-1/2 top-4',
            ];
            return (
              <span
                key={`${emoji}_${idx}_${action}`}
                className={`absolute text-xl animate-feed-burst ${positions[idx % positions.length]}`}
                style={{ animationDelay: `${idx * 0.12}s` }}
              >
                {emoji}
              </span>
            );
          })}
        </div>
      )}

      {(() => {
        const isHorizontallyFlipped = viewDirection === 'right' || viewDirection === 'flipped';
        const isSideView = viewDirection === 'left' || viewDirection === 'right';
        return (
          <div
            className="w-full h-full transition-transform duration-300"
            style={{ transform: isHorizontallyFlipped ? 'scaleX(-1)' : undefined }}
          >
            <svg
              viewBox="0 0 240 240"
              className={`w-full h-full overflow-visible ${animClass}`}
              aria-hidden="true"
            >
              <ellipse cx="120" cy="212" rx={58 * scaleX} ry="11" fill="#E8D2C8" opacity="0.7" />

              <g transform={`translate(120, 128) scale(${scaleX}, ${scaleY}) translate(-120, -128)`}>
                {viewDirection === 'back' ? (
            <g>
              {/* Held accessory peeking on right paw */}
              {equipped.held === 'pink_balloon' && (
                <g transform="translate(194, 144)">
                  <path d="M -2 2 Q 8 -22 8 -46" fill="none" stroke="#5A3E36" strokeWidth="2.6" strokeLinecap="round" />
                  <ellipse cx="10" cy="-64" rx="18" ry="20" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="3.4" />
                  <ellipse cx="4" cy="-72" rx="4.5" ry="6.5" transform="rotate(-18 4 -72)" fill="#FFD3E3" />
                  <polygon points="9,-44 5,-38 13,-38" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="2.4" />
                </g>
              )}
              {equipped.held === 'milk_bottle' && (
                <g transform="translate(192, 134) rotate(-20)">
                  <path d="M -4 -22 C -4 -28 4 -28 4 -22 L 5 -16 L -5 -16 Z" fill="#FFE082" stroke="#5A3E36" strokeWidth="2.5" />
                  <rect x="-8" y="-16" width="16" height="6" rx="2.5" fill="#8ED8FF" stroke="#5A3E36" strokeWidth="2.5" />
                  <rect x="-10" y="-10" width="20" height="26" rx="7" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="3" />
                  <rect x="-8" y="1" width="16" height="13" rx="5" fill="#FFF4D8" />
                </g>
              )}
              {equipped.held === 'mini_camera' && (
                <g transform="translate(192, 142) rotate(-8)">
                  <rect x="-18" y="-12" width="36" height="25" rx="7" fill="#D79458" stroke="#5A3E36" strokeWidth="3.2" />
                  <rect x="-15" y="-3" width="30" height="14" rx="4" fill="#FFFDF7" />
                  <circle cx="0" cy="2" r="8" fill="#5B4D4B" stroke="#5A3E36" strokeWidth="2.6" />
                </g>
              )}
              {equipped.held === 'strawberry_icecream' && (
                <g transform="translate(194, 136) rotate(10)">
                  <polygon points="-10,-1 10,-1 0,22" fill="#F0BA72" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
                  <circle cx="0" cy="-7" r="10.5" fill="#FF8EB0" stroke="#5A3E36" strokeWidth="3" />
                  <circle cx="0" cy="-16" r="8" fill="#FFF7EA" stroke="#5A3E36" strokeWidth="2.8" />
                </g>
              )}
              {equipped.held === 'little_star_wand' && (
                <g transform="translate(196, 134) rotate(18)">
                  <line x1="0" y1="-2" x2="0" y2="26" stroke="#D99B26" strokeWidth="4.8" strokeLinecap="round" />
                  <path
                    d="M 0 -22 L 4.5 -11 L 16 -9.5 L 7.5 -2 L 9.5 9.5 L 0 4 L -9.5 9.5 L -7.5 -2 L -16 -9.5 L -4.5 -11 Z"
                    fill="#FFE066"
                    stroke="#5A3E36"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                </g>
              )}
              {equipped.held === 'little_lantern' && (
                <g transform="translate(196, 144)">
                  <line x1="0" y1="-10" x2="0" y2="2" stroke="#5A3E36" strokeWidth="3" strokeLinecap="round" />
                  <rect x="-8" y="2" width="16" height="4" rx="2" fill="#D99B26" stroke="#5A3E36" strokeWidth="2.2" />
                  <ellipse cx="0" cy="17" rx="13" ry="13" fill="#FF8A5B" stroke="#5A3E36" strokeWidth="3" />
                  <rect x="-7" y="29" width="14" height="4" rx="2" fill="#D99B26" stroke="#5A3E36" strokeWidth="2.2" />
                </g>
              )}
              {equipped.held === 'superstar_star_wand' && (
                <g transform="translate(196, 134) rotate(16)">
                  <line x1="0" y1="-2" x2="0" y2="26" stroke="#B67628" strokeWidth="5" strokeLinecap="round" />
                  <path
                    d="M -11 -3 L -14 -16 L -5 -9 L 0 -21 L 5 -9 L 14 -16 L 11 -3 Z"
                    fill="#FFD447"
                    stroke="#5A3E36"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {/* Rear Ears (no inner pink ear details) */}
              {species === 'rabbit' ? (
                <g>
                  <ellipse cx="86" cy="48" rx="14" ry="38" transform="rotate(-12 86 58)" fill="#FFFDF9" stroke="#5A3E36" strokeWidth="4.5" />
                  <ellipse cx="154" cy="48" rx="14" ry="38" transform="rotate(12 154 58)" fill="#FFFDF9" stroke="#5A3E36" strokeWidth="4.5" />
                </g>
              ) : species === 'dog' ? (
                <g>
                  <ellipse cx="56" cy="104" rx="17" ry="34" transform="rotate(24 56 104)" fill="#E4AA68" stroke="#5A3E36" strokeWidth="4.5" />
                  <ellipse cx="184" cy="104" rx="17" ry="34" transform="rotate(-24 184 104)" fill="#E4AA68" stroke="#5A3E36" strokeWidth="4.5" />
                </g>
              ) : (
                <g>
                  <ellipse cx="68" cy={stage.level >= 3 ? 68 : 72} rx={stage.level >= 2 ? 21 : 19} ry={stage.level >= 2 ? 27 : 24} transform="rotate(-24 68 72)" fill="#FF9EB8" stroke="#5A3E36" strokeWidth="4.5" />
                  <ellipse cx="172" cy={stage.level >= 3 ? 68 : 72} rx={stage.level >= 2 ? 21 : 19} ry={stage.level >= 2 ? 27 : 24} transform="rotate(24 172 72)" fill="#FF9EB8" stroke="#5A3E36" strokeWidth="4.5" />
                </g>
              )}

              {/* Feet & Arms */}
              <ellipse cx="88" cy="194" rx="14" ry="10" fill={palette.limb} stroke="#5A3E36" strokeWidth="4" />
              <ellipse cx="152" cy="194" rx="14" ry="10" fill={palette.limb} stroke="#5A3E36" strokeWidth="4" />
              <ellipse cx="54" cy="148" rx="12" ry="16" transform="rotate(16 54 148)" fill={palette.body} stroke="#5A3E36" strokeWidth="4" />
              <ellipse cx="186" cy="148" rx="12" ry="16" transform="rotate(-16 186 148)" fill={palette.body} stroke="#5A3E36" strokeWidth="4" />

              {/* Main Chubby Back Body */}
              <ellipse cx="120" cy="134" rx={bodyRx} ry={bodyRy} fill={palette.body} stroke="#5A3E36" strokeWidth="4.5" />

              {/* Back Outfit Hem / Cape Base */}
              {(equipped.body === 'strawberry_dot_dress' ||
                equipped.body === 'cloud_pajamas' ||
                equipped.body === 'mint_apron' ||
                equipped.body === 'red_plaid_apron') && (
                <g>
                  <path
                    d="M 76 144 Q 120 150 164 144 L 170 187 Q 120 198 70 187 Z"
                    fill={
                      equipped.body === 'strawberry_dot_dress'
                        ? '#FF8EB0'
                        : equipped.body === 'cloud_pajamas'
                        ? '#B5D4FF'
                        : equipped.body === 'mint_apron'
                        ? '#7EDBC0'
                        : '#FFFFFF'
                    }
                    stroke="#5A3E36"
                    strokeWidth="3.8"
                    strokeLinejoin="round"
                  />
                  {equipped.body === 'red_plaid_apron' && (
                    <path d="M 78 160 L 162 160 M 74 174 L 166 174 M 102 147 L 102 191 M 138 147 L 138 191" stroke="#FF6B6B" strokeWidth="4" opacity="0.82" />
                  )}
                  <path d="M 106 154 L 120 160 L 134 154 L 128 166 L 120 161 L 112 166 Z" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round" />
                </g>
              )}
              {equipped.body === 'sailor_collar' && (
                <g>
                  <path d="M 76 122 L 164 122 L 158 158 L 82 158 Z" fill="#5D9CEC" stroke="#5A3E36" strokeWidth="3.8" strokeLinejoin="round" />
                  <path d="M 86 150 L 154 150" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
                </g>
              )}
              {(equipped.body === 'strawberry_cape' ||
                equipped.body === 'star_pajama' ||
                equipped.body === 'hero_cape' ||
                equipped.body === 'party_mini_cape') && (
                <path
                  d="M 60 128 Q 44 176 58 196 Q 120 208 182 196 Q 196 176 180 128 Q 120 140 60 128 Z"
                  fill={
                    equipped.body === 'strawberry_cape'
                      ? '#FF8AA8'
                      : equipped.body === 'star_pajama'
                      ? '#A996E6'
                      : equipped.body === 'hero_cape'
                      ? '#FF6464'
                      : '#FF85B3'
                  }
                  stroke="#5A3E36"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              )}

              {/* Back of Neck Scarf Strap */}
              {equipped.neck && (
                <path
                  d="M 84 148 Q 120 158 156 148"
                  fill="none"
                  stroke={
                    equipped.neck === 'mint_bell_tie'
                      ? '#6CD4B5'
                      : equipped.neck === 'carrot_scarf'
                      ? '#FF8C42'
                      : equipped.neck === 'knit_scarf'
                      ? '#D98A4E'
                      : equipped.neck === 'star_scarf'
                      ? '#9BC3FF'
                      : equipped.neck === 'plaid_neckerchief'
                      ? '#FF6B6B'
                      : equipped.neck === 'galaxy_necklace'
                      ? '#C5B4F5'
                      : '#FF8EB0'
                  }
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              )}

              {/* FULL BACK ACCESSORIES CENTERED ON THE BACK */}
              {equipped.back === 'camping_backpack' && (
                <g transform="translate(120, 142)">
                  <path d="M -24 -40 Q 0 -52 24 -40" fill="none" stroke="#5A3E36" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M -38 -16 Q -48 6 -36 28" fill="none" stroke="#8C5B32" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 38 -16 Q 48 6 36 28" fill="none" stroke="#8C5B32" strokeWidth="6" strokeLinecap="round" />
                  <rect x="-36" y="-28" width="72" height="68" rx="20" fill="#679E6B" stroke="#5A3E36" strokeWidth="4" />
                  <rect x="-28" y="-38" width="56" height="22" rx="10" fill="#D89B5B" stroke="#5A3E36" strokeWidth="3.6" />
                  <rect x="-24" y="4" width="48" height="26" rx="10" fill="#82BA86" stroke="#5A3E36" strokeWidth="3.2" />
                  <circle cx="0" cy="-16" r="4.5" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.4" />
                  <circle cx="0" cy="14" r="3.5" fill="#FFE066" />
                </g>
              )}
              {equipped.back === 'space_mini_cape' && (
                <g>
                  <path
                    d="M 64 124 Q 44 176 58 202 Q 120 214 182 202 Q 196 176 176 124 Q 120 136 64 124 Z"
                    fill="#463F8F"
                    stroke="#5A3E36"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <path d="M 68 128 Q 120 140 172 128" fill="none" stroke="#85D7FF" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M 86 164 L 106 148 L 100 168 Z" fill="#85D7FF" />
                  <circle cx="144" cy="166" r="7" fill="#FFE066" />
                  <ellipse cx="144" cy="166" rx="13" ry="3.5" transform="rotate(-18 144 166)" fill="none" stroke="#FF8EB0" strokeWidth="2.4" />
                  <circle cx="96" cy="186" r="3" fill="#FFFDF7" />
                  <circle cx="128" cy="188" r="2.6" fill="#9AE6FF" />
                  <circle cx="156" cy="146" r="2.5" fill="#FFFDF7" />
                </g>
              )}
              {equipped.back === 'angel_feather_wings' && (
                <g transform="translate(120, 134)">
                  <path d="M -8 -2 C -26 -36 -74 -42 -74 -6 C -74 10 -62 18 -62 18 C -70 30 -50 44 -34 32 C -26 42 -12 36 -8 18 Z" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="3.8" strokeLinejoin="round" />
                  <path d="M 8 -2 C 26 -36 74 -42 74 -6 C 74 10 62 18 62 18 C 70 30 50 44 34 32 C 26 42 12 36 8 18 Z" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="3.8" strokeLinejoin="round" />
                  <path d="M -22 6 C -38 -12 -56 -12 -52 6" fill="none" stroke="#E9D8C8" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 22 6 C 38 -12 56 -12 52 6" fill="none" stroke="#E9D8C8" strokeWidth="3" strokeLinecap="round" />
                  <path d="M -20 18 C -34 10 -44 14 -38 24" fill="none" stroke="#E9D8C8" strokeWidth="2.6" strokeLinecap="round" />
                  <path d="M 20 18 C 34 10 44 14 38 24" fill="none" stroke="#E9D8C8" strokeWidth="2.6" strokeLinecap="round" />
                  <circle cx="0" cy="6" r="8" fill="#FFE066" stroke="#5A3E36" strokeWidth="3" />
                </g>
              )}
              {equipped.back === 'butterfly_dream_wings' && (
                <g transform="translate(120, 134)">
                  <path d="M -6 -4 C -28 -44 -76 -36 -70 -2 C -68 14 -44 18 -18 14 C -54 22 -60 46 -36 48 C -20 50 -8 30 -6 10 Z" fill="#FF9AC2" stroke="#5A3E36" strokeWidth="3.8" strokeLinejoin="round" />
                  <path d="M 6 -4 C 28 -44 76 -36 70 -2 C 68 14 44 18 18 14 C 54 22 60 46 36 48 C 20 50 8 30 6 10 Z" fill="#8BE0CE" stroke="#5A3E36" strokeWidth="3.8" strokeLinejoin="round" />
                  <circle cx="-42" cy="-10" r="8" fill="#FFF5B8" />
                  <circle cx="42" cy="-10" r="8" fill="#FFF5B8" />
                  <circle cx="-34" cy="30" r="5" fill="#FFFDF7" opacity="0.85" />
                  <circle cx="34" cy="30" r="5" fill="#FFFDF7" opacity="0.85" />
                  <rect x="-6" y="-14" width="12" height="40" rx="6" fill="#FFF3C4" stroke="#5A3E36" strokeWidth="3" />
                </g>
              )}
              {equipped.back === 'devil_bat_wings' && (
                <g transform="translate(120, 136)">
                  <path d="M -8 -2 C -28 -36 -68 -34 -74 -6 Q -58 2 -54 18 Q -38 10 -30 26 Q -16 18 -8 14 Z" fill="#8A63B8" stroke="#5A3E36" strokeWidth="3.8" strokeLinejoin="round" />
                  <path d="M 8 -2 C 28 -36 68 -34 74 -6 Q 58 2 54 18 Q 38 10 30 26 Q 16 18 8 14 Z" fill="#8A63B8" stroke="#5A3E36" strokeWidth="3.8" strokeLinejoin="round" />
                  <path d="M -16 0 Q -42 -12 -64 -4" fill="none" stroke="#B692E3" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M 16 0 Q 42 -12 64 -4" fill="none" stroke="#B692E3" strokeWidth="2.8" strokeLinecap="round" />
                  <circle cx="0" cy="5" r="7.5" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="3" />
                </g>
              )}
              {equipped.back === 'bee_honey_wings' && (
                <g transform="translate(120, 134)">
                  <ellipse cx="-38" cy="14" rx="24" ry="15" transform="rotate(-14 -38 14)" fill="#FFF2B2" stroke="#5A3E36" strokeWidth="3.4" />
                  <ellipse cx="38" cy="14" rx="24" ry="15" transform="rotate(14 38 14)" fill="#FFF2B2" stroke="#5A3E36" strokeWidth="3.4" />
                  <ellipse cx="-40" cy="-10" rx="32" ry="19" transform="rotate(-22 -40 -10)" fill="#E3F6FF" stroke="#5A3E36" strokeWidth="3.6" />
                  <ellipse cx="40" cy="-10" rx="32" ry="19" transform="rotate(22 40 -10)" fill="#E3F6FF" stroke="#5A3E36" strokeWidth="3.6" />
                  <path d="M -22 -6 Q -44 -14 -56 -12" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 22 -6 Q 44 -14 56 -12" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="0" cy="4" r="8" fill="#FFD54F" stroke="#5A3E36" strokeWidth="3" />
                </g>
              )}

              {/* Cute Species Tail Centered on Lower Back */}
              {species === 'rabbit' ? (
                <circle cx="120" cy="176" r="15" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="4.2" />
              ) : species === 'dog' ? (
                <g>
                  <path d="M 120 176 Q 140 166 134 146" fill="none" stroke="#E4AA68" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 120 176 Q 140 166 134 146" fill="none" stroke="#5A3E36" strokeWidth="4" strokeLinecap="round" opacity="0.38" />
                </g>
              ) : (
                <path
                  d="M 116 178 C 128 176, 134 164, 122 162 C 113 161, 113 171, 124 171 C 132 171, 136 164, 132 157"
                  fill="none"
                  stroke="#5A3E36"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              )}

              {/* Head Accessories visible from behind */}
              <g>{renderHeadAccessories()}</g>
            </g>
          ) : (
            <g>
          {/* Tail */}
          {species === 'rabbit' ? (
            <circle
              cx="188"
              cy="160"
              r="14"
              fill="#FFFFFF"
              stroke="#5A3E36"
              strokeWidth="4.2"
            />
          ) : species === 'dog' ? (
            <path
              d="M 182 162 Q 208 148 202 124"
              fill="none"
              stroke="#E4AA68"
              strokeWidth="12"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 184 156 C 202 150, 206 134, 194 132 C 185 131, 185 144, 196 144 C 204 144, 210 138, 208 130"
              fill="none"
              stroke="#5A3E36"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          )}
          {species === 'dog' && (
            <path
              d="M 182 162 Q 208 148 202 124"
              fill="none"
              stroke="#5A3E36"
              strokeWidth="4.2"
              strokeLinecap="round"
              opacity="0.35"
            />
          )}

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
          {equipped.body === 'star_pajama' && (
            <g>
              <path
                d="M 60 132 Q 44 176 58 194 Q 120 206 182 194 Q 196 176 180 132 Q 120 144 60 132 Z"
                fill="#A996E6"
                stroke="#5A3E36"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path d="M 82 162 L 85 167 L 91 168 L 87 171 L 88 177 L 82 174 L 76 177 L 77 171 L 73 168 L 79 167 Z" fill="#FFE066" />
              <path d="M 158 162 L 161 167 L 167 168 L 163 171 L 164 177 L 158 174 L 152 177 L 153 171 L 149 168 L 155 167 Z" fill="#FFE066" />
              <circle cx="120" cy="182" r="3.5" fill="#FFE066" />
            </g>
          )}
          {equipped.body === 'hero_cape' && (
            <g>
              <path
                d="M 54 132 Q 34 176 48 198 Q 120 212 192 198 Q 206 176 186 132 Q 120 146 54 132 Z"
                fill="#FF6464"
                stroke="#5A3E36"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M 58 190 Q 120 202 182 190"
                fill="none"
                stroke="#FFD54F"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          )}
          {equipped.body === 'party_mini_cape' && (
            <g>
              <path
                d="M 55 132 Q 36 176 50 198 Q 120 210 190 198 Q 204 176 185 132 Q 120 144 55 132 Z"
                fill="#FF85B3"
                stroke="#5A3E36"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <circle cx="76" cy="176" r="4" fill="#85D7FF" />
              <circle cx="164" cy="176" r="4" fill="#FFE066" />
              <circle cx="120" cy="190" r="4" fill="#95E8C9" />
            </g>
          )}
          {equipped.back === 'space_mini_cape' && (
            isSideView ? (
              <g>
                <path
                  d="M 68 132 Q 60 176 74 202 Q 140 214 212 198 Q 222 170 194 128 Q 130 142 68 132 Z"
                  fill="#463F8F"
                  stroke="#5A3E36"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path d="M 182 162 L 194 152 L 190 165 Z" fill="#85D7FF" />
                <circle cx="196" cy="182" r="4.5" fill="#FFE066" />
                <circle cx="174" cy="192" r="2.8" fill="#FFFDF7" />
              </g>
            ) : (
              <g>
                <path
                  d="M 50 130 Q 28 176 44 202 Q 120 214 196 202 Q 212 176 190 130 Q 120 144 50 130 Z"
                  fill="#463F8F"
                  stroke="#5A3E36"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path d="M 60 176 L 70 166 L 67 178 Z" fill="#85D7FF" />
                <circle cx="172" cy="178" r="4.5" fill="#FFE066" />
                <circle cx="92" cy="192" r="2.8" fill="#FFFDF7" />
                <circle cx="146" cy="192" r="2.5" fill="#9AE6FF" />
              </g>
            )
          )}
          {equipped.back === 'camping_backpack' && (
            isSideView ? (
              <g transform="translate(8, -12)">
                <rect
                  x="162"
                  y="112"
                  width="36"
                  height="58"
                  rx="14"
                  fill="#679E6B"
                  stroke="#5A3E36"
                  strokeWidth="4"
                />
                <rect
                  x="166"
                  y="102"
                  width="28"
                  height="16"
                  rx="8"
                  fill="#D89B5B"
                  stroke="#5A3E36"
                  strokeWidth="3.5"
                />
                <circle cx="184" cy="142" r="3" fill="#FFE066" />
              </g>
            ) : (
              <g>
                <rect
                  x="44"
                  y="112"
                  width="34"
                  height="62"
                  rx="14"
                  fill="#679E6B"
                  stroke="#5A3E36"
                  strokeWidth="4"
                />
                <rect
                  x="48"
                  y="104"
                  width="26"
                  height="16"
                  rx="8"
                  fill="#D89B5B"
                  stroke="#5A3E36"
                  strokeWidth="3.5"
                />
                <rect
                  x="162"
                  y="112"
                  width="34"
                  height="62"
                  rx="14"
                  fill="#679E6B"
                  stroke="#5A3E36"
                  strokeWidth="4"
                />
                <rect
                  x="166"
                  y="104"
                  width="26"
                  height="16"
                  rx="8"
                  fill="#D89B5B"
                  stroke="#5A3E36"
                  strokeWidth="3.5"
                />
              </g>
            )
          )}
          {equipped.back === 'angel_feather_wings' && (
            isSideView ? (
              <g>
                <g transform="translate(230, -8) scale(-0.86, 0.86)">
                  <path
                    d="M 60 124 C 38 92 8 92 14 122 C 16 134 26 140 26 140 C 18 150 34 162 50 152 C 56 156 64 150 64 136 Z"
                    fill="#FFFDF7"
                    stroke="#5A3E36"
                    strokeWidth="3.8"
                    strokeLinejoin="round"
                  />
                  <path d="M 46 130 C 34 118 24 120 28 132" fill="none" stroke="#E9D8C8" strokeWidth="2.8" strokeLinecap="round" />
                </g>
                <g transform="translate(-4, 2)">
                  <path
                    d="M 180 124 C 202 92 232 92 226 122 C 224 134 214 140 214 140 C 222 150 206 162 190 152 C 184 156 176 150 176 136 Z"
                    fill="#FFFDF7"
                    stroke="#5A3E36"
                    strokeWidth="3.8"
                    strokeLinejoin="round"
                  />
                  <path d="M 194 130 C 206 118 216 120 212 132" fill="none" stroke="#E9D8C8" strokeWidth="2.8" strokeLinecap="round" />
                </g>
              </g>
            ) : (
              <g>
                <path
                  d="M 60 124 C 38 92 8 92 14 122 C 16 134 26 140 26 140 C 18 150 34 162 50 152 C 56 156 64 150 64 136 Z"
                  fill="#FFFDF7"
                  stroke="#5A3E36"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M 180 124 C 202 92 232 92 226 122 C 224 134 214 140 214 140 C 222 150 206 162 190 152 C 184 156 176 150 176 136 Z"
                  fill="#FFFDF7"
                  stroke="#5A3E36"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
                />
                <path d="M 46 130 C 34 118 24 120 28 132" fill="none" stroke="#E9D8C8" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M 194 130 C 206 118 216 120 212 132" fill="none" stroke="#E9D8C8" strokeWidth="2.8" strokeLinecap="round" />
              </g>
            )
          )}
          {equipped.back === 'butterfly_dream_wings' && (
            isSideView ? (
              <g>
                <g transform="translate(230, -8) scale(-0.86, 0.86)">
                  <path
                    d="M 62 122 C 40 84 6 92 14 124 C 16 136 32 140 50 138 C 24 146 22 168 42 170 C 54 170 62 154 64 138 Z"
                    fill="#FF9AC2"
                    stroke="#5A3E36"
                    strokeWidth="3.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="34" cy="118" r="6" fill="#FFF5B8" />
                </g>
                <g transform="translate(-4, 2)">
                  <path
                    d="M 178 122 C 200 84 234 92 226 124 C 224 136 208 140 190 138 C 216 146 218 168 198 170 C 186 170 178 154 176 138 Z"
                    fill="#8BE0CE"
                    stroke="#5A3E36"
                    strokeWidth="3.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="206" cy="118" r="6" fill="#FFF5B8" />
                </g>
              </g>
            ) : (
              <g>
                <path
                  d="M 62 122 C 40 84 6 92 14 124 C 16 136 32 140 50 138 C 24 146 22 168 42 170 C 54 170 62 154 64 138 Z"
                  fill="#FF9AC2"
                  stroke="#5A3E36"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M 178 122 C 200 84 234 92 226 124 C 224 136 208 140 190 138 C 216 146 218 168 198 170 C 186 170 178 154 176 138 Z"
                  fill="#8BE0CE"
                  stroke="#5A3E36"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
                />
                <circle cx="34" cy="118" r="6" fill="#FFF5B8" />
                <circle cx="206" cy="118" r="6" fill="#FFF5B8" />
              </g>
            )
          )}
          {equipped.back === 'devil_bat_wings' && (
            isSideView ? (
              <g>
                <g transform="translate(230, -8) scale(-0.86, 0.86)">
                  <path
                    d="M 62 126 C 42 94 14 96 12 122 Q 24 128 28 142 Q 40 134 46 148 Q 56 140 64 138 Z"
                    fill="#8A63B8"
                    stroke="#5A3E36"
                    strokeWidth="3.8"
                    strokeLinejoin="round"
                  />
                </g>
                <g transform="translate(-4, 2)">
                  <path
                    d="M 178 126 C 198 94 226 96 228 122 Q 216 128 212 142 Q 200 134 194 148 Q 184 140 176 138 Z"
                    fill="#8A63B8"
                    stroke="#5A3E36"
                    strokeWidth="3.8"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            ) : (
              <g>
                <path
                  d="M 62 126 C 42 94 14 96 12 122 Q 24 128 28 142 Q 40 134 46 148 Q 56 140 64 138 Z"
                  fill="#8A63B8"
                  stroke="#5A3E36"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M 178 126 C 198 94 226 96 228 122 Q 216 128 212 142 Q 200 134 194 148 Q 184 140 176 138 Z"
                  fill="#8A63B8"
                  stroke="#5A3E36"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
                />
              </g>
            )
          )}
          {equipped.back === 'bee_honey_wings' && (
            isSideView ? (
              <g>
                <g transform="translate(230, -8) scale(-0.86, 0.86)">
                  <ellipse cx="40" cy="142" rx="18" ry="11" transform="rotate(-14 40 142)" fill="#FFF2B2" stroke="#5A3E36" strokeWidth="3.2" />
                  <ellipse cx="36" cy="118" rx="24" ry="15" transform="rotate(-24 36 118)" fill="#E3F6FF" stroke="#5A3E36" strokeWidth="3.4" />
                </g>
                <g transform="translate(-4, 2)">
                  <ellipse cx="200" cy="142" rx="18" ry="11" transform="rotate(14 200 142)" fill="#FFF2B2" stroke="#5A3E36" strokeWidth="3.2" />
                  <ellipse cx="204" cy="118" rx="24" ry="15" transform="rotate(24 204 118)" fill="#E3F6FF" stroke="#5A3E36" strokeWidth="3.4" />
                </g>
              </g>
            ) : (
              <g>
                <ellipse cx="40" cy="142" rx="18" ry="11" transform="rotate(-14 40 142)" fill="#FFF2B2" stroke="#5A3E36" strokeWidth="3.2" />
                <ellipse cx="200" cy="142" rx="18" ry="11" transform="rotate(14 200 142)" fill="#FFF2B2" stroke="#5A3E36" strokeWidth="3.2" />
                <ellipse cx="36" cy="118" rx="24" ry="15" transform="rotate(-24 36 118)" fill="#E3F6FF" stroke="#5A3E36" strokeWidth="3.4" />
                <ellipse cx="204" cy="118" rx="24" ry="15" transform="rotate(24 204 118)" fill="#E3F6FF" stroke="#5A3E36" strokeWidth="3.4" />
              </g>
            )
          )}

          {/* Ears behind body */}
          {species === 'rabbit' ? (
            <g>
              <ellipse
                cx="86"
                cy="48"
                rx="14"
                ry="38"
                transform="rotate(-12 86 58)"
                fill="#FFFDF9"
                stroke="#5A3E36"
                strokeWidth="4.5"
              />
              <ellipse
                cx="86"
                cy="50"
                rx="7"
                ry="24"
                transform="rotate(-12 86 58)"
                fill="#FFBFCF"
              />
              <ellipse
                cx="154"
                cy="48"
                rx="14"
                ry="38"
                transform="rotate(12 154 58)"
                fill="#FFFDF9"
                stroke="#5A3E36"
                strokeWidth="4.5"
              />
              <ellipse
                cx="154"
                cy="50"
                rx="7"
                ry="24"
                transform="rotate(12 154 58)"
                fill="#FFBFCF"
              />
            </g>
          ) : species === 'dog' ? (
            <g>
              <ellipse
                cx="56"
                cy="104"
                rx="17"
                ry="34"
                transform="rotate(24 56 104)"
                fill="#E4AA68"
                stroke="#5A3E36"
                strokeWidth="4.5"
              />
              <ellipse
                cx="57"
                cy="108"
                rx="8"
                ry="20"
                transform="rotate(24 57 108)"
                fill="#D3924E"
                opacity="0.7"
              />
              <ellipse
                cx="184"
                cy="104"
                rx="17"
                ry="34"
                transform="rotate(-24 184 104)"
                fill="#E4AA68"
                stroke="#5A3E36"
                strokeWidth="4.5"
              />
              <ellipse
                cx="183"
                cy="108"
                rx="8"
                ry="20"
                transform="rotate(-24 183 108)"
                fill="#D3924E"
                opacity="0.7"
              />
            </g>
          ) : (
            <g>
              <ellipse
                cx="68"
                cy={stage.level >= 3 ? 68 : 72}
                rx={stage.level >= 2 ? 21 : 19}
                ry={stage.level >= 2 ? 27 : 24}
                transform="rotate(-24 68 72)"
                fill="#FF9EB8"
                stroke="#5A3E36"
                strokeWidth="4.5"
              />
              <ellipse
                cx="69"
                cy={stage.level >= 3 ? 71 : 75}
                rx="10"
                ry="14"
                transform="rotate(-24 69 75)"
                fill="#FFD1DF"
              />
              <ellipse
                cx="172"
                cy={stage.level >= 3 ? 68 : 72}
                rx={stage.level >= 2 ? 21 : 19}
                ry={stage.level >= 2 ? 27 : 24}
                transform="rotate(24 172 72)"
                fill="#FF9EB8"
                stroke="#5A3E36"
                strokeWidth="4.5"
              />
              <ellipse
                cx="171"
                cy={stage.level >= 3 ? 71 : 75}
                rx="10"
                ry="14"
                transform="rotate(24 171 75)"
                fill="#FFD1DF"
              />
            </g>
          )}

          {/* Main Chubby Pet Body / Head (scales dynamically with growth & roundness) */}
          <ellipse
            cx="120"
            cy="134"
            rx={bodyRx}
            ry={bodyRy}
            fill={palette.body}
            stroke="#5A3E36"
            strokeWidth="4.5"
          />

          <ellipse
            cx="120"
            cy="162"
            rx={38 + clampedRoundness * 0.1}
            ry={23 + clampedRoundness * 0.05}
            fill={palette.belly}
            opacity="0.82"
          />

          {/* Cute roundness belly curve when chubby */}
          {clampedRoundness >= 60 && (
            <path
              d="M 102 174 Q 120 182 138 174"
              fill="none"
              stroke={palette.bellyLine}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          )}

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
          {equipped.body === 'sailor_collar' && (
            <g>
              <path
                d="M 74 146 L 120 162 L 166 146 L 172 184 L 120 194 L 68 184 Z"
                fill="#5D9CEC"
                stroke="#5A3E36"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />
              <path
                d="M 78 174 L 120 184 L 162 174"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M 108 158 L 120 165 L 132 158 L 127 174 L 120 167 L 113 174 Z"
                fill="#FF6B8B"
                stroke="#5A3E36"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
            </g>
          )}
          {equipped.body === 'hero_cape' && (
            <g>
              <path
                d="M 76 150 Q 120 165 164 150"
                fill="none"
                stroke="#FFD54F"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 120 152 L 123 158 L 130 159 L 125 164 L 126 171 L 120 168 L 114 171 L 115 164 L 110 159 L 117 158 Z"
                fill="#FFE066"
                stroke="#5A3E36"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
            </g>
          )}
          {equipped.body === 'strawberry_dot_dress' && (
            <g>
              <path
                d="M 78 144 L 162 144 L 174 188 Q 120 200 66 188 Z"
                fill="#FF8EB0"
                stroke="#5A3E36"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />
              <circle cx="96" cy="162" r="4" fill="#FFFDF7" />
              <circle cx="142" cy="164" r="4" fill="#FFFDF7" />
              <circle cx="118" cy="176" r="4" fill="#FFFDF7" />
              <circle cx="88" cy="178" r="3.5" fill="#FFFDF7" />
              <circle cx="152" cy="180" r="3.5" fill="#FFFDF7" />
              <path d="M 70 186 Q 95 194 120 188 Q 145 194 170 186" fill="none" stroke="#FFFDF7" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}
          {equipped.body === 'cloud_pajamas' && (
            <g>
              <path
                d="M 76 144 Q 120 150 164 144 L 168 188 Q 120 198 72 188 Z"
                fill="#B5D4FF"
                stroke="#5A3E36"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />
              <circle cx="96" cy="168" r="6" fill="#FFFFFF" />
              <circle cx="104" cy="167" r="5" fill="#FFFFFF" />
              <circle cx="142" cy="174" r="5.5" fill="#FFFFFF" />
              <circle cx="120" cy="158" r="3" fill="#FFE066" />
            </g>
          )}
          {equipped.body === 'red_plaid_apron' && (
            <g>
              <path
                d="M 79 144 Q 120 150 161 144 L 167 188 Q 120 198 73 188 Z"
                fill="#FFFFFF"
                stroke="#5A3E36"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />
              <path
                d="M 80 160 L 160 160 M 76 174 L 164 174 M 102 147 L 102 192 M 138 147 L 138 192"
                stroke="#FF6B6B"
                strokeWidth="4.2"
                opacity="0.82"
              />
              <rect x="104" y="162" width="32" height="19" rx="7" fill="#FFF8EC" stroke="#5A3E36" strokeWidth="2.8" />
            </g>
          )}
          {equipped.body === 'party_mini_cape' && (
            <g>
              <path
                d="M 78 150 Q 120 164 162 150"
                fill="none"
                stroke="#FFE066"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <circle cx="120" cy="161" r="6" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="2.6" />
            </g>
          )}
          <g transform={isSideView ? 'translate(-8, 0)' : undefined}>
            {equipped.back === 'camping_backpack' && (
              <g>
                <path d="M 76 138 Q 84 156 76 174" fill="none" stroke="#8C5B32" strokeWidth="5.5" strokeLinecap="round" />
                <path d="M 164 138 Q 156 156 164 174" fill="none" stroke="#8C5B32" strokeWidth="5.5" strokeLinecap="round" />
              </g>
            )}
            {equipped.back === 'space_mini_cape' && (
              <g>
                <path d="M 78 148 Q 120 161 162 148" fill="none" stroke="#85D7FF" strokeWidth="4" strokeLinecap="round" />
                <circle cx="120" cy="158" r="5" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.4" />
              </g>
            )}
            {(equipped.back === 'angel_feather_wings' ||
              equipped.back === 'butterfly_dream_wings' ||
              equipped.back === 'devil_bat_wings' ||
              equipped.back === 'bee_honey_wings') && (
              <g>
                <path
                  d="M 74 138 Q 84 156 76 172"
                  fill="none"
                  stroke={
                    equipped.back === 'butterfly_dream_wings'
                      ? '#FF9AC2'
                      : equipped.back === 'devil_bat_wings'
                      ? '#9A74C9'
                      : equipped.back === 'bee_honey_wings'
                      ? '#FFD54F'
                      : '#F5E7CE'
                  }
                  strokeWidth="4.8"
                  strokeLinecap="round"
                />
                <path
                  d="M 166 138 Q 156 156 164 172"
                  fill="none"
                  stroke={
                    equipped.back === 'butterfly_dream_wings'
                      ? '#8BE0CE'
                      : equipped.back === 'devil_bat_wings'
                      ? '#9A74C9'
                      : equipped.back === 'bee_honey_wings'
                      ? '#FFD54F'
                      : '#F5E7CE'
                  }
                  strokeWidth="4.8"
                  strokeLinecap="round"
                />
              </g>
            )}
          </g>

          <ellipse cx="88" cy="194" rx="14" ry="10" fill={palette.limb} stroke="#5A3E36" strokeWidth="4" />
          <ellipse cx="152" cy="194" rx="14" ry="10" fill={palette.limb} stroke="#5A3E36" strokeWidth="4" />

          <ellipse
            cx="54"
            cy="148"
            rx="12"
            ry="16"
            transform={action === 'walking' ? 'rotate(25 54 148)' : 'rotate(16 54 148)'}
            fill={palette.body}
            stroke="#5A3E36"
            strokeWidth="4"
          />
          <ellipse
            cx="186"
            cy="148"
            rx="12"
            ry="16"
            transform={action === 'walking' ? 'rotate(-25 186 148)' : 'rotate(-16 186 148)'}
            fill={palette.body}
            stroke="#5A3E36"
            strokeWidth="4"
          />

          {/* Held accessory near right paw */}
          {equipped.held === 'pink_balloon' && (
            <g transform="translate(194, 144)">
              <path d="M -2 2 Q 8 -22 8 -46" fill="none" stroke="#5A3E36" strokeWidth="2.6" strokeLinecap="round" />
              <ellipse cx="10" cy="-64" rx="18" ry="20" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="3.4" />
              <ellipse cx="4" cy="-72" rx="4.5" ry="6.5" transform="rotate(-18 4 -72)" fill="#FFD3E3" />
              <polygon points="9,-44 5,-38 13,-38" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="2.4" />
            </g>
          )}
          {equipped.held === 'milk_bottle' && (
            <g transform="translate(192, 134) rotate(-20)">
              <path d="M -4 -22 C -4 -28 4 -28 4 -22 L 5 -16 L -5 -16 Z" fill="#FFE082" stroke="#5A3E36" strokeWidth="2.5" />
              <rect x="-8" y="-16" width="16" height="6" rx="2.5" fill="#8ED8FF" stroke="#5A3E36" strokeWidth="2.5" />
              <rect x="-10" y="-10" width="20" height="26" rx="7" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="3" />
              <rect x="-8" y="1" width="16" height="13" rx="5" fill="#FFF4D8" />
            </g>
          )}
          {equipped.held === 'mini_camera' && (
            <g transform="translate(192, 142) rotate(-8)">
              <rect x="-18" y="-12" width="36" height="25" rx="7" fill="#D79458" stroke="#5A3E36" strokeWidth="3.2" />
              <rect x="-15" y="-3" width="30" height="14" rx="4" fill="#FFFDF7" />
              <circle cx="0" cy="2" r="8" fill="#5B4D4B" stroke="#5A3E36" strokeWidth="2.6" />
              <circle cx="0" cy="2" r="4" fill="#82D4FA" />
              <circle cx="11" cy="-7" r="2.4" fill="#FFE066" />
            </g>
          )}
          {equipped.held === 'strawberry_icecream' && (
            <g transform="translate(194, 136) rotate(10)">
              <polygon points="-10,-1 10,-1 0,22" fill="#F0BA72" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="0" cy="-7" r="10.5" fill="#FF8EB0" stroke="#5A3E36" strokeWidth="3" />
              <circle cx="0" cy="-16" r="8" fill="#FFF7EA" stroke="#5A3E36" strokeWidth="2.8" />
              <circle cx="0" cy="-24" r="3.4" fill="#FF477E" stroke="#5A3E36" strokeWidth="2" />
            </g>
          )}
          {equipped.held === 'little_star_wand' && (
            <g transform="translate(196, 134) rotate(18)">
              <line x1="0" y1="-2" x2="0" y2="26" stroke="#D99B26" strokeWidth="4.8" strokeLinecap="round" />
              <path
                d="M 0 -22 L 4.5 -11 L 16 -9.5 L 7.5 -2 L 9.5 9.5 L 0 4 L -9.5 9.5 L -7.5 -2 L -16 -9.5 L -4.5 -11 Z"
                fill="#FFE066"
                stroke="#5A3E36"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <circle cx="0" cy="-5" r="2.8" fill="#FF7AA8" />
            </g>
          )}
          {equipped.held === 'little_lantern' && (
            <g transform="translate(196, 144)">
              <line x1="0" y1="-10" x2="0" y2="2" stroke="#5A3E36" strokeWidth="3" strokeLinecap="round" />
              <rect x="-8" y="2" width="16" height="4" rx="2" fill="#D99B26" stroke="#5A3E36" strokeWidth="2.2" />
              <ellipse cx="0" cy="17" rx="13" ry="13" fill="#FF8A5B" stroke="#5A3E36" strokeWidth="3" />
              <ellipse cx="0" cy="17" rx="6" ry="13" fill="none" stroke="#FFE082" strokeWidth="2" />
              <rect x="-7" y="29" width="14" height="4" rx="2" fill="#D99B26" stroke="#5A3E36" strokeWidth="2.2" />
              <line x1="0" y1="33" x2="0" y2="39" stroke="#FF5E5B" strokeWidth="2.8" strokeLinecap="round" />
            </g>
          )}
          {equipped.held === 'superstar_star_wand' && (
            <g transform="translate(196, 134) rotate(16)">
              <line x1="0" y1="-2" x2="0" y2="26" stroke="#B67628" strokeWidth="5" strokeLinecap="round" />
              <line x1="0" y1="2" x2="0" y2="22" stroke="#FFE066" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M -11 -3 L -14 -16 L -5 -9 L 0 -21 L 5 -9 L 14 -16 L 11 -3 Z"
                fill="#FFD447"
                stroke="#5A3E36"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <circle cx="0" cy="-9" r="3.4" fill="#FF6B9A" stroke="#5A3E36" strokeWidth="1.8" />
              <circle cx="-15" cy="-19" r="2.5" fill="#FFE066" />
              <circle cx="15" cy="-18" r="2.5" fill="#85D7FF" />
            </g>
          )}

          <g transform={isSideView ? 'translate(-15, 0)' : undefined}>
          <ellipse
            cx="72"
            cy="132"
            rx={expression === 'shy' ? 16 : stage.level >= 3 ? 14 : 11}
            ry={expression === 'shy' ? 9.5 : stage.level >= 3 ? 8 : 6.5}
            fill={palette.blush}
            opacity={expression === 'shy' ? 0.88 : action === 'petted' || stage.level >= 3 ? 0.8 : 0.55}
          />
          <ellipse
            cx="168"
            cy="132"
            rx={expression === 'shy' ? 16 : stage.level >= 3 ? 14 : 11}
            ry={expression === 'shy' ? 9.5 : stage.level >= 3 ? 8 : 6.5}
            fill={palette.blush}
            opacity={expression === 'shy' ? 0.88 : action === 'petted' || stage.level >= 3 ? 0.8 : 0.55}
          />

          {expression === 'shy' && (
            <g stroke="#E85B7B" strokeWidth="2.2" strokeLinecap="round" opacity="0.8">
              <path d="M 65 130 L 68 135" />
              <path d="M 72 130 L 75 135" />
              <path d="M 164 130 L 167 135" />
              <path d="M 171 130 L 174 135" />
            </g>
          )}

          {eyesClosed ? (
            <g stroke="#4A3531" strokeWidth="4" strokeLinecap="round" fill="none">
              <path d="M 78 112 Q 87 118 96 112" />
              <path d="M 144 112 Q 153 118 162 112" />
            </g>
          ) : expression === 'ticklish' ? (
            <g stroke="#4A3531" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M 78 106 L 94 112 L 78 118" />
              <path d="M 162 106 L 146 112 L 162 118" />
            </g>
          ) : expression === 'wink' ? (
            <g>
              <circle cx="87" cy="112" r="8" fill="#4A3531" />
              <circle cx="84.5" cy="109" r="3" fill="#FFFFFF" />
              <circle cx="90" cy="115" r="1.6" fill="#FFFFFF" />
              <path
                d="M 144 114 Q 153 103 162 114"
                stroke="#4A3531"
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : expression === 'sparkle' ? (
            <g>
              <circle cx="87" cy="112" r="9" fill="#4A3531" />
              <path d="M 86 105 L 88 109 L 92 111 L 88 113 L 86 117 L 84 113 L 80 111 L 84 109 Z" fill="#FFF8B8" />
              <circle cx="91" cy="116" r="1.8" fill="#FFFFFF" />
              <circle cx="153" cy="112" r="9" fill="#4A3531" />
              <path d="M 152 105 L 154 109 L 158 111 L 154 113 L 152 117 L 150 113 L 146 111 L 150 109 Z" fill="#FFF8B8" />
              <circle cx="157" cy="116" r="1.8" fill="#FFFFFF" />
            </g>
          ) : happyArcEyes || expression === 'happyTongue' ? (
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

          {/* Species-specific Nose & Muzzle */}
          {species === 'rabbit' ? (
            <g>
              {/* Soft whiskers */}
              <g stroke="#C6A9A2" strokeWidth="2.4" strokeLinecap="round">
                <path d="M 60 128 L 76 130" />
                <path d="M 59 136 L 75 135" />
                <path d="M 164 130 L 180 128" />
                <path d="M 165 135 L 181 136" />
              </g>
              {/* Cute pink triangle bunny nose */}
              <path
                d="M 113 124 Q 120 121 127 124 Q 124 133 120 133 Q 116 133 113 124 Z"
                fill="#FF85A6"
                stroke="#5A3E36"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </g>
          ) : species === 'dog' ? (
            <g>
              {/* Cream puppy muzzle patch */}
              <ellipse cx="120" cy="134" rx="23" ry="15" fill="#FFF8E6" />
              {/* Cute brown puppy nose */}
              <ellipse
                cx="120"
                cy="126"
                rx="10"
                ry="7"
                fill="#5A3E36"
              />
              <ellipse cx="117" cy="124" rx="3" ry="1.8" fill="#8C675B" />
            </g>
          ) : (
            <g>
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
            </g>
          )}

          {/* Mouth: Wide open -> chewing -> stuffed -> sleeping -> expression -> smile */}
          {action === 'opening' ? (
            <ellipse
              cx="120"
              cy="155"
              rx="12"
              ry="10"
              fill="#E85B7B"
              stroke="#5A3E36"
              strokeWidth="3.6"
            />
          ) : action === 'eating' ? (
            <ellipse
              cx="120"
              cy="154"
              rx={chewTick ? 10 : 6.5}
              ry={chewTick ? 7.5 : 4}
              fill="#E85B7B"
              stroke="#5A3E36"
              strokeWidth="3.4"
            />
          ) : action === 'stuffed' ? (
            <path
              d="M 110 154 Q 115 149 120 154 Q 125 159 130 154"
              fill="none"
              stroke="#5A3E36"
              strokeWidth="3.8"
              strokeLinecap="round"
            />
          ) : action === 'sleeping' ? (
            <circle cx="120" cy="153" r="3.4" fill="#5A3E36" />
          ) : expression === 'happyTongue' ? (
            <g>
              <path
                d="M 108 148 Q 120 158 132 148"
                fill="none"
                stroke="#5A3E36"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
              <path
                d="M 114 152 Q 120 167 126 152 Z"
                fill="#FF7A9E"
                stroke="#5A3E36"
                strokeWidth="2.8"
              />
            </g>
          ) : expression === 'ticklish' ? (
            <path
              d="M 106 151 Q 113 145 120 151 Q 127 157 134 151"
              fill="none"
              stroke="#5A3E36"
              strokeWidth="3.6"
              strokeLinecap="round"
            />
          ) : expression === 'shy' ? (
            <path
              d="M 114 152 Q 120 156 126 152"
              fill="none"
              stroke="#5A3E36"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          ) : species === 'rabbit' || species === 'dog' ? (
            <g>
              <path
                d="M 108 144 Q 114 150 120 142 Q 126 150 132 144"
                fill="none"
                stroke="#5A3E36"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {species === 'dog' && action === 'petted' && (
                <path
                  d="M 115 146 Q 120 160 125 146 Z"
                  fill="#FF7A9E"
                  stroke="#5A3E36"
                  strokeWidth="2.6"
                />
              )}
            </g>
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
          {equipped.neck === 'pearl_necklace' && (
            <g>
              <path d="M 88 158 Q 120 182 152 158" fill="none" stroke="#5A3E36" strokeWidth="2.2" />
              <circle cx="91" cy="161" r="4.8" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
              <circle cx="101" cy="168" r="5" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
              <circle cx="111" cy="172" r="5.2" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
              <circle cx="120" cy="174" r="6" fill="#FFE6EA" stroke="#5A3E36" strokeWidth="2.4" />
              <circle cx="129" cy="172" r="5.2" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
              <circle cx="139" cy="168" r="5" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
              <circle cx="149" cy="161" r="4.8" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
            </g>
          )}
          {equipped.neck === 'carrot_scarf' && (
            <g>
              <path
                d="M 86 158 Q 120 170 154 158 L 120 192 Z"
                fill="#FF8C42"
                stroke="#5A3E36"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              <path
                d="M 102 166 L 120 180 L 138 166"
                fill="none"
                stroke="#FFF4D8"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <circle cx="120" cy="166" r="5.5" fill="#FF6B4A" stroke="#5A3E36" strokeWidth="2.8" />
            </g>
          )}
          {equipped.neck === 'lucky_clover_tie' && (
            <g transform="translate(120, 168)">
              <path
                d="M 0 0 C -14 -18 -30 -5 -16 0 C -30 5 -14 18 0 0 Z"
                fill="#68C98D"
                stroke="#5A3E36"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M 0 0 C 14 -18 30 -5 16 0 C 30 5 14 18 0 0 Z"
                fill="#82DB9F"
                stroke="#5A3E36"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <circle cx="0" cy="0" r="6" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.8" />
            </g>
          )}
          {equipped.neck === 'anniversary_bib' && (
            <g>
              <path
                d="M 90 157 Q 120 171 150 157 Q 156 187 120 195 Q 84 187 90 157 Z"
                fill="#FFE1EC"
                stroke="#5A3E36"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path
                d="M 97 180 Q 120 189 143 180"
                fill="none"
                stroke="#FFD54F"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 120 168 L 122.5 173 L 128 173.8 L 124 177.5 L 125 183 L 120 180.2 L 115 183 L 116 177.5 L 112 173.8 L 117.5 173 Z"
                fill="#FFD54F"
                stroke="#5A3E36"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </g>
          )}
          {equipped.neck === 'strawberry_shake_bib' && (
            <g>
              <path
                d="M 91 158 Q 120 170 149 158 Q 155 185 120 193 Q 85 185 91 158 Z"
                fill="#FFD2E2"
                stroke="#5A3E36"
                strokeWidth="3.4"
                strokeLinejoin="round"
              />
              <path d="M 94 160 Q 120 171 146 160" fill="none" stroke="#FFFDF7" strokeWidth="4" strokeLinecap="round" />
              <path d="M 120 170 C 127 170 128 180 120 185 C 112 180 113 170 120 170 Z" fill="#FF5484" stroke="#5A3E36" strokeWidth="2.4" />
            </g>
          )}
          {equipped.neck === 'knit_scarf' && (
            <g>
              <rect x="88" y="154" width="64" height="16" rx="8" fill="#D98A4E" stroke="#5A3E36" strokeWidth="3.2" />
              <path d="M 132 164 L 146 164 L 148 188 L 134 188 Z" fill="#C9783D" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 100 162 L 110 162 M 116 162 L 126 162" stroke="#FFF4D8" strokeWidth="2.6" strokeLinecap="round" />
            </g>
          )}
          {equipped.neck === 'star_scarf' && (
            <g>
              <rect x="88" y="154" width="64" height="15" rx="7.5" fill="#9BC3FF" stroke="#5A3E36" strokeWidth="3.2" />
              <path d="M 96 164 L 110 164 L 108 188 L 94 188 Z" fill="#82B0FA" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="132" cy="161.5" r="3" fill="#FFE066" />
              <circle cx="102" cy="176" r="3" fill="#FFE066" />
            </g>
          )}
          {equipped.neck === 'plaid_neckerchief' && (
            <g>
              <path d="M 86 158 Q 120 170 154 158 L 120 192 Z" fill="#FF6B6B" stroke="#5A3E36" strokeWidth="3.2" strokeLinejoin="round" />
              <path d="M 106 164 L 126 182 M 134 164 L 114 182" stroke="#FFFDF7" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="120" cy="165" r="5" fill="#FFF8E1" stroke="#5A3E36" strokeWidth="2.6" />
            </g>
          )}
          {equipped.neck === 'galaxy_necklace' && (
            <g>
              <path d="M 90 158 Q 120 180 150 158" fill="none" stroke="#C5B4F5" strokeWidth="3.8" strokeLinecap="round" />
              <circle cx="120" cy="174" r="7" fill="#7068D9" stroke="#5A3E36" strokeWidth="2.8" />
              <ellipse cx="120" cy="174" rx="14" ry="3.8" transform="rotate(-18 120 174)" fill="none" stroke="#FFE066" strokeWidth="2.5" />
            </g>
          )}
          {equipped.neck === 'ribbon_bowtie' && (
            <g transform="translate(120, 168)">
              <path d="M 0 0 L -24 -13 L -22 10 Z" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 0 0 L 24 -13 L 22 10 Z" fill="#6EC6FF" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
              <path d="M -4 4 L -11 22 M 4 4 L 11 22" stroke="#FFD54F" strokeWidth="3.6" strokeLinecap="round" />
              <circle cx="0" cy="0" r="6" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.8" />
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
          {equipped.face === 'bandaid_cute' && (
            <g transform="translate(70, 126) rotate(-18)">
              <rect x="-12" y="-5" width="24" height="10" rx="5" fill="#FFB2C8" stroke="#5A3E36" strokeWidth="2.6" />
              <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill="#FFF7EC" stroke="#5A3E36" strokeWidth="1.8" />
            </g>
          )}
          {equipped.face === 'monocle_gold' && (
            <g>
              <circle cx="153" cy="112" r="15" fill="#FFF7D6" fillOpacity="0.28" stroke="#D99B26" strokeWidth="3.6" />
              <path d="M 167 118 Q 172 132 167 144" fill="none" stroke="#D99B26" strokeWidth="2.6" strokeLinecap="round" />
            </g>
          )}
          {equipped.face === 'pilot_goggles' && (
            <g>
              <path d="M 55 110 L 66 110 M 174 110 L 185 110" stroke="#8D5B34" strokeWidth="5.2" strokeLinecap="round" />
              <rect
                x="66"
                y="97"
                width="40"
                height="29"
                rx="11"
                fill="#7ED4F7"
                fillOpacity="0.6"
                stroke="#8D5B34"
                strokeWidth="4.6"
              />
              <rect
                x="134"
                y="97"
                width="40"
                height="29"
                rx="11"
                fill="#7ED4F7"
                fillOpacity="0.6"
                stroke="#8D5B34"
                strokeWidth="4.6"
              />
              <path d="M 106 110 Q 120 106 134 110" fill="none" stroke="#5A3E36" strokeWidth="4.2" strokeLinecap="round" />
              <path d="M 74 104 L 82 112" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.88" />
              <path d="M 142 104 L 150 112" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.88" />
            </g>
          )}
          {equipped.face === 'strawberry_blush_sticker' && (
            <g>
              <path d="M 70 123 C 77 123 78 134 70 139 C 62 134 63 123 70 123 Z" fill="#FF6B9A" stroke="#5A3E36" strokeWidth="2.4" />
              <path d="M 170 123 C 177 123 178 134 170 139 C 162 134 163 123 170 123 Z" fill="#FF6B9A" stroke="#5A3E36" strokeWidth="2.4" />
              <path d="M 66 123 Q 70 119 74 123" fill="none" stroke="#6CD4B5" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 166 123 Q 170 119 174 123" fill="none" stroke="#6CD4B5" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="70" cy="130" r="1.4" fill="#FFF8E1" />
              <circle cx="170" cy="130" r="1.4" fill="#FFF8E1" />
            </g>
          )}
          {equipped.face === 'leaf_sunglasses' && (
            <g stroke="#5A3E36" strokeWidth="3">
              <path d="M 65 107 C 75 97 95 99 101 112 C 95 126 73 124 65 107 Z" fill="#52B788" />
              <path d="M 175 107 C 165 97 145 99 139 112 C 145 126 167 124 175 107 Z" fill="#52B788" />
              <path d="M 101 110 Q 120 106 139 110" fill="none" strokeWidth="3.6" />
              <path d="M 74 109 L 87 110" stroke="#D8F3DC" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 153 110 L 166 109" stroke="#D8F3DC" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          )}
          {equipped.face === 'moon_sleep_mask' && (
            <g>
              <path d="M 57 93 L 68 93 M 172 93 L 183 93" stroke="#5A3E36" strokeWidth="3.4" strokeLinecap="round" />
              <rect x="68" y="81" width="104" height="24" rx="12" fill="#B5A4F2" stroke="#5A3E36" strokeWidth="3.2" />
              <path d="M 114 86 C 108 89 108 98 116 100 C 110 100 105 97 105 93 C 105 88 110 85 114 86 Z" fill="#FFE066" />
              <circle cx="144" cy="91" r="2.6" fill="#FFE066" />
              <circle cx="154" cy="96" r="1.8" fill="#FFFDF7" />
            </g>
          )}
          {equipped.face === 'chef_glasses' && (
            <g fill="none" stroke="#7A869A" strokeWidth="3.4">
              <rect x="69" y="100" width="36" height="24" rx="8" fill="#FFFFFF" fillOpacity="0.28" />
              <rect x="135" y="100" width="36" height="24" rx="8" fill="#FFFFFF" fillOpacity="0.28" />
              <path d="M 105 111 L 135 111" stroke="#5A3E36" strokeWidth="3.4" />
              <path d="M 77 106 L 85 114" stroke="#90C2FF" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M 143 106 L 151 114" stroke="#90C2FF" strokeWidth="2.4" strokeLinecap="round" />
            </g>
          )}
          {equipped.face === 'starry_goggles' && (
            <g>
              <path d="M 55 110 L 66 110 M 174 110 L 185 110" stroke="#5A3E36" strokeWidth="4.6" strokeLinecap="round" />
              <rect x="66" y="97" width="40" height="29" rx="11" fill="#463F8F" fillOpacity="0.86" stroke="#D9A441" strokeWidth="4.2" />
              <rect x="134" y="97" width="40" height="29" rx="11" fill="#463F8F" fillOpacity="0.86" stroke="#D9A441" strokeWidth="4.2" />
              <path d="M 106 110 Q 120 106 134 110" fill="none" stroke="#5A3E36" strokeWidth="3.8" />
              <circle cx="78" cy="107" r="2.8" fill="#FFE066" />
              <circle cx="92" cy="116" r="2" fill="#9AE6FF" />
              <circle cx="146" cy="107" r="2.8" fill="#FFE066" />
              <circle cx="160" cy="116" r="2" fill="#9AE6FF" />
            </g>
          )}
          {equipped.face === 'party_star_glasses' && (
            <g stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round">
              <path d="M 87 95 L 92 105 L 103 107 L 95 114 L 97 125 L 87 120 L 77 125 L 79 114 L 71 107 L 82 105 Z" fill="#FFD54F" />
              <path d="M 153 95 L 158 105 L 169 107 L 161 114 L 163 125 L 153 120 L 143 125 L 145 114 L 137 107 L 148 105 Z" fill="#FF7AA8" />
              <path d="M 102 108 L 138 108" fill="none" strokeWidth="3.6" />
            </g>
          )}
          </g>

                <g transform={isSideView ? 'translate(-8, 0)' : undefined}>
                  {renderHeadAccessories()}
                </g>
              </g>
            )}
              </g>
            </svg>
          </div>
        );
      })()}
    </div>
  );
};
