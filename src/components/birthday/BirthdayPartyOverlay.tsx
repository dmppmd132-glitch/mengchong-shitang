import React from 'react';
import { BirthdayCake, BirthdaySystemState } from '../../types';
import { BirthdayCakeArt } from './BirthdayCakeArt';

interface BirthdayPartyOverlayProps {
  target: 'room-mini' | 'room' | 'yard';
  birthdaySystem?: BirthdaySystemState;
  onTapCake?: (cake: BirthdayCake) => void;
}

export const BirthdayPartyOverlay: React.FC<BirthdayPartyOverlayProps> = ({
  target,
  birthdaySystem,
  onTapCake,
}) => {
  if (!birthdaySystem) return null;

  const isYard = target === 'yard';
  const activeDecors = isYard
    ? birthdaySystem.activeYardDecorIds
    : birthdaySystem.activeRoomDecorIds;

  const placedCake =
    birthdaySystem.cakes.find(
      (c) => !c.eaten && c.placedIn === (isYard ? 'yard' : 'room')
    ) ?? null;

  if (activeDecors.length === 0 && !placedCake) return null;

  if (isYard) {
    const hasBalloons = activeDecors.includes('yard_balloons');
    const hasFlags = activeDecors.includes('yard_flags');
    const hasPicnicMat = activeDecors.includes('yard_picnic_mat');
    const hasCakeTable = activeDecors.includes('yard_cake_table');
    const hasGiftPile = activeDecors.includes('yard_gift_pile');
    const hasPartyLights = activeDecors.includes('yard_party_lights');

    return (
      <>
        {hasPartyLights && (
          <svg
            viewBox="0 0 360 34"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 z-[15] w-full h-8"
            aria-hidden="true"
          >
            <path d="M 0 6 Q 90 24 180 10 Q 270 24 360 6" fill="none" stroke="#6E4E3A" strokeWidth="1.6" />
            {[30, 74, 122, 180, 238, 286, 330].map((x, i) => (
              <g key={x}>
                <circle
                  cx={x}
                  cy={i === 3 ? 13 : i % 2 === 0 ? 15 : 19}
                  r="4.5"
                  fill={i % 2 === 0 ? '#FFE27A' : '#FFB3D1'}
                  stroke="#6E4E3A"
                  strokeWidth="1.2"
                />
              </g>
            ))}
          </svg>
        )}

        {hasFlags && (
          <svg
            viewBox="0 0 360 28"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-1 z-[16] w-full h-7"
            aria-hidden="true"
          >
            <path d="M 8 5 Q 180 19 352 5" fill="none" stroke="#7A5238" strokeWidth="1.4" />
            {[28, 66, 104, 142, 180, 218, 256, 294, 332].map((x, idx) => (
              <polygon
                key={x}
                points={`${x - 9},10 ${x + 9},10 ${x},23`}
                fill={idx % 3 === 0 ? '#FF88B4' : idx % 3 === 1 ? '#FFE066' : '#82E9FF'}
                stroke="#6E4E3A"
                strokeWidth="1.1"
              />
            ))}
          </svg>
        )}

        {hasBalloons && (
          <div className="pointer-events-none absolute right-2 top-8 z-[18]" aria-hidden="true">
            <svg width="46" height="58" viewBox="0 0 46 58" fill="none">
              <path d="M 16 28 Q 20 42 23 56 M 30 24 Q 26 40 23 56" stroke="#7A5238" strokeWidth="1.4" />
              <ellipse cx="15" cy="18" rx="9" ry="11" fill="#FF8EB8" stroke="#5A3E36" strokeWidth="1.8" />
              <ellipse cx="31" cy="14" rx="9" ry="11" fill="#FFE066" stroke="#5A3E36" strokeWidth="1.8" />
              <ellipse cx="23" cy="24" rx="8" ry="10" fill="#82E9FF" stroke="#5A3E36" strokeWidth="1.8" />
            </svg>
          </div>
        )}

        {hasPicnicMat && (
          <div
            className="pointer-events-none absolute left-1/2 bottom-1 -translate-x-1/2 z-[6] opacity-90"
            aria-hidden="true"
          >
            <svg width="168" height="36" viewBox="0 0 168 36" fill="none">
              <rect x="6" y="4" width="156" height="28" rx="10" fill="#FFF2F5" stroke="#FF8EB0" strokeWidth="2.2" />
              <path d="M 16 14 H 152 M 16 22 H 152" stroke="#FFD0DF" strokeWidth="3" />
            </svg>
          </div>
        )}

        {hasGiftPile && (
          <div className="pointer-events-none absolute left-2 bottom-9 z-[24]" aria-hidden="true">
            <svg width="48" height="42" viewBox="0 0 48 42" fill="none">
              <rect x="4" y="18" width="22" height="18" rx="3" fill="#FF92B4" stroke="#5A3E36" strokeWidth="1.8" />
              <rect x="13" y="18" width="4" height="18" fill="#FFE066" />
              <rect x="24" y="22" width="18" height="14" rx="3" fill="#82E9FF" stroke="#5A3E36" strokeWidth="1.8" />
              <rect x="31" y="22" width="4" height="14" fill="#FFFDF7" />
              <rect x="14" y="7" width="16" height="12" rx="3" fill="#FFE066" stroke="#5A3E36" strokeWidth="1.8" />
              <circle cx="22" cy="6" r="3" fill="#FF7EB6" stroke="#5A3E36" strokeWidth="1.4" />
            </svg>
          </div>
        )}

        {(hasCakeTable || placedCake) && (
          <div className="absolute right-[16%] bottom-9 z-[28] flex flex-col items-center">
            {placedCake && (
              <button
                type="button"
                onClick={() => onTapCake?.(placedCake)}
                title={`${placedCake.name}（點擊慶祝享用）`}
                className="-mb-3 relative z-10 hover:scale-105 active:scale-95 transition"
              >
                <BirthdayCakeArt
                  base={placedCake.base}
                  cream={placedCake.cream}
                  decors={placedCake.decors}
                  size={52}
                />
              </button>
            )}
            {hasCakeTable && (
              <svg
                width="60"
                height="28"
                viewBox="0 0 60 28"
                fill="none"
                className="pointer-events-none"
                aria-hidden="true"
              >
                <line x1="18" y1="14" x2="16" y2="26" stroke="#6E4E3A" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="42" y1="14" x2="44" y2="26" stroke="#6E4E3A" strokeWidth="2.4" strokeLinecap="round" />
                <ellipse cx="30" cy="10" rx="24" ry="7" fill="#FFF6EC" stroke="#5A3E36" strokeWidth="2" />
                <path d="M 8 11 Q 30 20 52 11 L 49 17 Q 30 24 11 17 Z" fill="#FF92B4" stroke="#5A3E36" strokeWidth="1.6" />
              </svg>
            )}
          </div>
        )}
      </>
    );
  }

  // Room or Room-mini
  const hasBalloonArch = activeDecors.includes('room_balloon_arch');
  const hasBanner = activeDecors.includes('room_banner');
  const hasStreamers = activeDecors.includes('room_streamers');
  const hasCakeTable = activeDecors.includes('room_cake_table');
  const hasGiftPile = activeDecors.includes('room_gift_pile');
  const hasPartyLights = activeDecors.includes('room_party_lights');

  const isMini = target === 'room-mini';

  return (
    <>
      {hasPartyLights && (
        <svg
          viewBox="0 0 360 22"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-0 z-[15] w-full h-5"
          aria-hidden="true"
        >
          <path d="M 0 4 Q 90 17 180 7 Q 270 17 360 4" fill="none" stroke="#8C624D" strokeWidth="1.4" />
          {[32, 82, 132, 180, 228, 278, 328].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={i === 3 ? 9 : i % 2 === 0 ? 11 : 13}
              r="3.8"
              fill={i % 2 === 0 ? '#FFE066' : '#FFB0CE'}
              stroke="#8C624D"
              strokeWidth="1"
            />
          ))}
        </svg>
      )}

      {hasBanner && (
        <div
          className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 z-[16]"
          aria-hidden="true"
        >
          <div className="rounded-lg border border-[#D497AF] bg-[#FFF5F8]/92 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-[#B83B64]">
            🎂 HAPPY BIRTHDAY
          </div>
        </div>
      )}

      {hasStreamers && (
        <svg
          viewBox="0 0 360 44"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-0 z-[14] w-full h-10 opacity-90"
          aria-hidden="true"
        >
          <path d="M 18 0 Q 26 16 18 32" stroke="#FF7EB6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 46 0 Q 54 14 44 28" stroke="#FFE066" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 314 0 Q 306 14 316 28" stroke="#82E9FF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 342 0 Q 334 16 342 32" stroke="#FF7EB6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )}

      {hasBalloonArch && (
        <div
          className="pointer-events-none absolute left-1.5 top-2 z-[15]"
          aria-hidden="true"
        >
          <svg width={isMini ? 34 : 48} height={isMini ? 36 : 48} viewBox="0 0 48 48" fill="none">
            <ellipse cx="14" cy="18" rx="8" ry="10" fill="#FF92B4" stroke="#5A3E36" strokeWidth="1.8" />
            <ellipse cx="28" cy="14" rx="8" ry="10" fill="#FFE066" stroke="#5A3E36" strokeWidth="1.8" />
            <ellipse cx="21" cy="24" rx="7" ry="9" fill="#82E9FF" stroke="#5A3E36" strokeWidth="1.8" />
          </svg>
        </div>
      )}

      {hasGiftPile && (
        <div
          className="pointer-events-none absolute left-2 bottom-2 z-[18]"
          aria-hidden="true"
        >
          <svg width={isMini ? 30 : 42} height={isMini ? 26 : 36} viewBox="0 0 42 36" fill="none">
            <rect x="3" y="14" width="18" height="16" rx="3" fill="#FF92B4" stroke="#5A3E36" strokeWidth="1.8" />
            <rect x="10" y="14" width="4" height="16" fill="#FFE066" />
            <rect x="20" y="18" width="16" height="12" rx="3" fill="#82E9FF" stroke="#5A3E36" strokeWidth="1.8" />
            <rect x="26" y="18" width="4" height="12" fill="#FFFDF7" />
          </svg>
        </div>
      )}

      {(hasCakeTable || placedCake) && (
        <div
          className={`absolute right-2 bottom-2 z-[22] flex flex-col items-center ${
            onTapCake && placedCake ? '' : 'pointer-events-none'
          }`}
        >
          {placedCake && (
            <button
              type="button"
              onClick={() => onTapCake?.(placedCake)}
              disabled={!onTapCake}
              title={`${placedCake.name}`}
              className="-mb-2.5 relative z-10 hover:scale-105 active:scale-95 transition"
            >
              <BirthdayCakeArt
                base={placedCake.base}
                cream={placedCake.cream}
                decors={placedCake.decors}
                size={isMini ? 36 : 48}
              />
            </button>
          )}
          {hasCakeTable && (
            <svg
              width={isMini ? 40 : 54}
              height={isMini ? 20 : 25}
              viewBox="0 0 54 25"
              fill="none"
              className="pointer-events-none"
              aria-hidden="true"
            >
              <line x1="16" y1="12" x2="14" y2="23" stroke="#6E4E3A" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="38" y1="12" x2="40" y2="23" stroke="#6E4E3A" strokeWidth="2.2" strokeLinecap="round" />
              <ellipse cx="27" cy="9" rx="22" ry="6.5" fill="#FFF6EC" stroke="#5A3E36" strokeWidth="1.8" />
              <path d="M 7 10 Q 27 17 47 10 L 44 15 Q 27 21 10 15 Z" fill="#FF92B4" stroke="#5A3E36" strokeWidth="1.5" />
            </svg>
          )}
        </div>
      )}
    </>
  );
};
