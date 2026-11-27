import React from 'react';
import {
  ActiveTownLocationId,
  TownLocationId,
  TownVisitorId,
  VisitorHutFacilityId,
} from '../../types';
import { VisitorSprite } from '../visitors/VisitorIllustrations';

const COCOA = '#5A3E36';

export const TownLocationThumbnail: React.FC<{
  locationId: TownLocationId;
  className?: string;
}> = ({ locationId, className = 'w-20 h-16' }) => {
  switch (locationId) {
    case 'home_yard':
      return (
        <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="thumbYardSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CBEFFF" />
              <stop offset="100%" stopColor="#FFF7E2" />
            </linearGradient>
          </defs>
          <rect width="120" height="90" rx="14" fill="url(#thumbYardSky)" />
          <circle cx="96" cy="22" r="10" fill="#FFE066" />
          <path d="M0,62 Q60,52 120,62 L120,90 L0,90 Z" fill="#95DC8D" />
          <rect x="26" y="42" width="44" height="28" rx="4" fill="#FFF3DA" stroke={COCOA} strokeWidth="2.5" />
          <polygon points="20,44 48,22 76,44" fill="#FF8AA8" stroke={COCOA} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="42" y="52" width="12" height="18" rx="3" fill="#B87748" stroke={COCOA} strokeWidth="2" />
          <circle cx="94" cy="64" r="5" fill="#FF8EB0" />
          <circle cx="104" cy="68" r="4" fill="#FFE066" />
        </svg>
      );

    case 'acorn_forest':
      return (
        <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="thumbForestSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE1A8" />
              <stop offset="100%" stopColor="#EAF7DA" />
            </linearGradient>
          </defs>
          <rect width="120" height="90" rx="14" fill="url(#thumbForestSky)" />
          <path d="M0,64 Q60,54 120,64 L120,90 L0,90 Z" fill="#89C77E" />
          <g transform="translate(28, 42)">
            <rect x="-4" y="8" width="8" height="22" fill="#8D5B4C" />
            <polygon points="0,-24 -18,10 18,10" fill="#4E9F63" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
          </g>
          <g transform="translate(88, 38)">
            <rect x="-4" y="10" width="8" height="24" fill="#8D5B4C" />
            <circle cx="0" cy="0" r="18" fill="#E89242" stroke={COCOA} strokeWidth="2" />
          </g>
          <g transform="translate(58, 66)">
            <ellipse cx="0" cy="4" rx="8" ry="9" fill="#C47C3C" stroke={COCOA} strokeWidth="2" />
            <path d="M-9,1 Q0,-9 9,1 Z" fill="#7D4927" stroke={COCOA} strokeWidth="2" />
          </g>
        </svg>
      );

    case 'lake_park':
      return (
        <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="thumbLakeSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BEE9FF" />
              <stop offset="100%" stopColor="#FFF4DB" />
            </linearGradient>
          </defs>
          <rect width="120" height="90" rx="14" fill="url(#thumbLakeSky)" />
          <ellipse cx="28" cy="20" rx="14" ry="7" fill="#FFFFFF" opacity="0.85" />
          <path d="M0,50 Q60,44 120,50 L120,90 L0,90 Z" fill="#6EC6EE" />
          <path d="M0,66 Q30,62 60,66 T120,66" fill="none" stroke="#DFF6FF" strokeWidth="2.5" strokeLinecap="round" />
          {/* Wooden Bridge */}
          <path d="M12,54 Q60,40 108,54" fill="none" stroke="#B67642" strokeWidth="7" strokeLinecap="round" />
          <path d="M12,48 Q60,34 108,48" fill="none" stroke="#D99B5B" strokeWidth="2.5" />
          {/* Cute Duck */}
          <g transform="translate(82, 68)">
            <ellipse cx="0" cy="4" rx="10" ry="6" fill="#FFE066" stroke={COCOA} strokeWidth="2" />
            <circle cx="-4" cy="-3" r="6" fill="#FFE066" stroke={COCOA} strokeWidth="2" />
            <ellipse cx="-10" cy="-2" rx="4" ry="2.2" fill="#FF9E3D" />
          </g>
        </svg>
      );

    case 'town_market':
    default:
      return (
        <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="thumbMarketSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A3F7A" />
              <stop offset="100%" stopColor="#A66B7A" />
            </linearGradient>
          </defs>
          <rect width="120" height="90" rx="14" fill="url(#thumbMarketSky)" />
          <circle cx="24" cy="18" r="2" fill="#FFE066" />
          <circle cx="96" cy="22" r="2.2" fill="#FFE066" />
          <rect x="0" y="64" width="120" height="26" fill="#D5B28C" />
          {/* Wooden Stall */}
          <rect x="26" y="42" width="68" height="28" rx="4" fill="#FFF3DC" stroke={COCOA} strokeWidth="2.4" />
          <path d="M22,42 L30,28 H90 L98,42 Z" fill="#FF7B8E" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" />
          <rect x="38" y="30" width="10" height="10" fill="#FFFDF7" />
          <rect x="62" y="30" width="10" height="10" fill="#FFFDF7" />
          <circle cx="20" cy="34" r="6" fill="#FFD166" stroke={COCOA} strokeWidth="2" />
          <circle cx="100" cy="34" r="6" fill="#FFD166" stroke={COCOA} strokeWidth="2" />
        </svg>
      );
  }
};

export const VisitorHutIllustration: React.FC<{
  level: 1 | 2 | 3 | 4 | 5;
  builtFacilities?: VisitorHutFacilityId[];
  className?: string;
}> = ({ level, builtFacilities = [], className = 'w-28 h-24' }) => {
  const roofColor =
    level === 5
      ? '#FF86B0'
      : level === 4
      ? '#E07A5F'
      : level === 3
      ? '#52A36B'
      : level === 2
      ? '#F2995D'
      : '#B97848';

  const wallColor =
    level >= 4 ? '#FFF9EE' : level === 3 ? '#F4ECD9' : level === 2 ? '#FFEAD2' : '#E7C198';

  return (
    <svg viewBox="0 0 140 110" className={className} aria-hidden="true">
      {/* Ground shadow */}
      <ellipse cx="70" cy="98" rx="56" ry="8" fill="#8CC983" opacity="0.5" />

      {/* Upper 2nd Story for Lv.4 & Lv.5 */}
      {level >= 4 && (
        <g>
          <rect x="38" y="24" width="64" height="32" rx="6" fill={wallColor} stroke={COCOA} strokeWidth="2.6" />
          <polygon
            points="30,28 70,6 110,28"
            fill={roofColor}
            stroke={COCOA}
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <circle cx="70" cy="19" r="5" fill="#FFE066" stroke={COCOA} strokeWidth="2" />
          <rect x="52" y="32" width="14" height="12" rx="3" fill="#BEE9FF" stroke={COCOA} strokeWidth="2" />
          <rect x="74" y="32" width="14" height="12" rx="3" fill="#BEE9FF" stroke={COCOA} strokeWidth="2" />
        </g>
      )}

      {/* Lv.5 Dream Crown & Star Garlands */}
      {level === 5 && (
        <g>
          <path d="M40,26 Q70,36 100,26" fill="none" stroke="#FFD54F" strokeWidth="2.4" />
          <circle cx="48" cy="28" r="2.6" fill="#FFE066" />
          <circle cx="70" cy="31" r="3" fill="#FF6B9A" />
          <circle cx="92" cy="28" r="2.6" fill="#85D7FF" />
          <path d="M70,2 L72,6 L76,7 L72,9 L70,13 L68,9 L64,7 L68,6 Z" fill="#FFE066" />
        </g>
      )}

      {/* Main Hut Body */}
      <rect
        x="26"
        y={level >= 4 ? 50 : 42}
        width="88"
        height={level >= 4 ? 46 : 54}
        rx="8"
        fill={wallColor}
        stroke={COCOA}
        strokeWidth="2.8"
      />

      {/* Main Roof for Lv.1-3 */}
      {level < 4 && (
        <polygon
          points="18,46 70,14 122,46"
          fill={roofColor}
          stroke={COCOA}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}

      {/* Lv.3 Forest Awning / Leaf Garland */}
      {level >= 3 && (
        <g>
          <circle cx="34" cy="48" r="6" fill="#77C986" stroke={COCOA} strokeWidth="1.8" />
          <circle cx="106" cy="48" r="6" fill="#77C986" stroke={COCOA} strokeWidth="1.8" />
        </g>
      )}

      {/* Door */}
      <path
        d="M58,96 V68 A12,12 0 0,1 82,68 V96 Z"
        fill={level >= 2 ? '#D68952' : '#A66C42'}
        stroke={COCOA}
        strokeWidth="2.5"
      />
      <circle cx="76" cy="82" r="2" fill="#FFE066" />

      {/* Windows (Lv.2+) */}
      {level >= 2 && (
        <>
          <rect x="34" y="64" width="16" height="15" rx="4" fill="#CBEFFF" stroke={COCOA} strokeWidth="2.2" />
          <rect x="90" y="64" width="16" height="15" rx="4" fill="#CBEFFF" stroke={COCOA} strokeWidth="2.2" />
        </>
      )}

      {/* Facilities Indicators */}
      {builtFacilities.includes('lantern') && (
        <g transform="translate(20, 62)">
          <line x1="0" y1="-12" x2="0" y2="-4" stroke={COCOA} strokeWidth="2" />
          <circle cx="0" cy="0" r="5.5" fill="#FF9854" stroke={COCOA} strokeWidth="2" />
        </g>
      )}
      {builtFacilities.includes('mini_pond') && (
        <ellipse cx="116" cy="96" rx="14" ry="5" fill="#7AD4F5" stroke={COCOA} strokeWidth="1.8" />
      )}
      {builtFacilities.includes('flower_bush') && (
        <g transform="translate(18, 92)">
          <circle cx="0" cy="0" r="7" fill="#6CCF82" stroke={COCOA} strokeWidth="1.8" />
          <circle cx="-2" cy="-2" r="2.6" fill="#FF8EB0" />
          <circle cx="3" cy="-1" r="2.2" fill="#FFE066" />
        </g>
      )}
      {builtFacilities.includes('rare_sign') && (
        <g transform="translate(119, 68)">
          <line x1="0" y1="6" x2="0" y2="26" stroke={COCOA} strokeWidth="2.4" />
          <rect x="-9" y="-6" width="18" height="13" rx="3" fill="#FFE066" stroke={COCOA} strokeWidth="2" />
          <circle cx="0" cy="0.5" r="2.5" fill="#FF6B9A" />
        </g>
      )}
    </svg>
  );
};

export const TownVisitorSprite: React.FC<{
  visitorId: TownVisitorId;
  className?: string;
  happy?: boolean;
}> = ({ visitorId, className = 'w-16 h-16', happy = false }) => {
  if (visitorId === 'bird' || visitorId === 'squirrel' || visitorId === 'rabbit') {
    return (
      <VisitorSprite
        visitorId={visitorId}
        className={className}
        reaction={happy ? 'favorite' : null}
      />
    );
  }

  const bounce = happy ? 'animate-bounce' : 'animate-piggy-float';

  switch (visitorId) {
    case 'butterfly':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <path
            d="M36,40 C20,16 4,22 10,42 C12,48 22,50 34,47 C18,52 16,66 28,66 C34,66 37,54 38,44 Z"
            fill="#F4A2D8"
            stroke={COCOA}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path
            d="M44,40 C60,16 76,22 70,42 C68,48 58,50 46,47 C62,52 64,66 52,66 C46,66 43,54 42,44 Z"
            fill="#8DE4D0"
            stroke={COCOA}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="35" r="4.5" fill="#FFF3A8" />
          <circle cx="58" cy="35" r="4.5" fill="#FFF3A8" />
          <rect x="37" y="26" width="6" height="32" rx="3" fill="#FFF0C2" stroke={COCOA} strokeWidth="2.4" />
          <path d="M38,26 Q33,16 28,18 M42,26 Q47,16 52,18" fill="none" stroke={COCOA} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'hedgehog':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <path
            d="M14,54 C12,30 28,18 46,20 C60,22 68,36 66,54 Z"
            fill="#9C6B43"
            stroke={COCOA}
            strokeWidth="2.8"
          />
          <ellipse cx="44" cy="50" rx="22" ry="15" fill="#FCE5C8" stroke={COCOA} strokeWidth="2.6" />
          <circle cx="54" cy="46" r="2.6" fill={COCOA} />
          <circle cx="65" cy="49" r="3" fill={COCOA} />
          <ellipse cx="48" cy="52" rx="4" ry="2.2" fill="#FF9CB8" opacity="0.6" />
          <circle cx="32" cy="64" r="4" fill="#FCE5C8" stroke={COCOA} strokeWidth="2" />
          <circle cx="52" cy="64" r="4" fill="#FCE5C8" stroke={COCOA} strokeWidth="2" />
        </svg>
      );

    case 'deer':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <path d="M29,24 L23,10 M26,17 L19,16 M51,24 L57,10 M54,17 L61,16" fill="none" stroke="#8C5630" strokeWidth="3.2" strokeLinecap="round" />
          <ellipse cx="22" cy="28" rx="6" ry="4" transform="rotate(-24 22 28)" fill="#EAB882" stroke={COCOA} strokeWidth="2.2" />
          <ellipse cx="58" cy="28" rx="6" ry="4" transform="rotate(24 58 28)" fill="#EAB882" stroke={COCOA} strokeWidth="2.2" />
          <ellipse cx="40" cy="46" rx="20" ry="22" fill="#E8B27A" stroke={COCOA} strokeWidth="2.8" />
          <ellipse cx="40" cy="54" rx="11" ry="9" fill="#FFF2DC" />
          <circle cx="32" cy="42" r="2.8" fill={COCOA} />
          <circle cx="48" cy="42" r="2.8" fill={COCOA} />
          <ellipse cx="40" cy="50" rx="4" ry="2.6" fill={COCOA} />
          <circle cx="29" cy="49" r="3" fill="#FF9AB5" opacity="0.65" />
          <circle cx="51" cy="49" r="3" fill="#FF9AB5" opacity="0.65" />
        </svg>
      );

    case 'duck':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <path d="M36,16 Q40,8 45,15" fill="none" stroke={COCOA} strokeWidth="2.6" strokeLinecap="round" />
          <ellipse cx="40" cy="48" rx="22" ry="20" fill="#FFE67A" stroke={COCOA} strokeWidth="2.8" />
          <circle cx="31" cy="40" r="2.8" fill={COCOA} />
          <circle cx="49" cy="40" r="2.8" fill={COCOA} />
          <ellipse cx="40" cy="48" rx="10" ry="5.5" fill="#FF9B3D" stroke={COCOA} strokeWidth="2.4" />
          <circle cx="26" cy="46" r="3.2" fill="#FF8DA8" opacity="0.65" />
          <circle cx="54" cy="46" r="3.2" fill="#FF8DA8" opacity="0.65" />
        </svg>
      );

    case 'frog':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <circle cx="27" cy="27" r="9" fill="#89DB8E" stroke={COCOA} strokeWidth="2.6" />
          <circle cx="53" cy="27" r="9" fill="#89DB8E" stroke={COCOA} strokeWidth="2.6" />
          <ellipse cx="40" cy="47" rx="24" ry="19" fill="#89DB8E" stroke={COCOA} strokeWidth="2.8" />
          <ellipse cx="40" cy="55" rx="15" ry="9" fill="#E8FAD8" />
          <circle cx="27" cy="27" r="3.4" fill={COCOA} />
          <circle cx="53" cy="27" r="3.4" fill={COCOA} />
          <path d="M32,46 Q40,52 48,46" fill="none" stroke={COCOA} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="23" cy="44" r="3.4" fill="#FF92B0" opacity="0.7" />
          <circle cx="57" cy="44" r="3.4" fill="#FF92B0" opacity="0.7" />
        </svg>
      );

    case 'otter':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <circle cx="22" cy="31" r="6" fill="#9E7354" stroke={COCOA} strokeWidth="2.4" />
          <circle cx="58" cy="31" r="6" fill="#9E7354" stroke={COCOA} strokeWidth="2.4" />
          <ellipse cx="40" cy="46" rx="22" ry="20" fill="#B58563" stroke={COCOA} strokeWidth="2.8" />
          <ellipse cx="40" cy="52" rx="14" ry="11" fill="#FBEBD6" />
          <circle cx="31" cy="42" r="2.8" fill={COCOA} />
          <circle cx="49" cy="42" r="2.8" fill={COCOA} />
          <ellipse cx="40" cy="48" rx="4.5" ry="3" fill={COCOA} />
          <path d="M19,49 L29,48 M19,54 L29,52 M61,49 L51,48 M61,54 L51,52" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'cat_visitor':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <polygon points="18,38 22,16 36,28" fill="#F6C28B" stroke={COCOA} strokeWidth="2.6" strokeLinejoin="round" />
          <polygon points="62,38 58,16 44,28" fill="#F6C28B" stroke={COCOA} strokeWidth="2.6" strokeLinejoin="round" />
          <ellipse cx="40" cy="48" rx="22" ry="19" fill="#F9CEA0" stroke={COCOA} strokeWidth="2.8" />
          <circle cx="31" cy="45" r="2.8" fill={COCOA} />
          <circle cx="49" cy="45" r="2.8" fill={COCOA} />
          <polygon points="40,51 37,48 43,48" fill="#FF85A6" />
          <path d="M34,53 Q37,56 40,52 Q43,56 46,53" fill="none" stroke={COCOA} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'dog_visitor':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <ellipse cx="18" cy="40" rx="7" ry="13" transform="rotate(14 18 40)" fill="#C97E3B" stroke={COCOA} strokeWidth="2.6" />
          <ellipse cx="62" cy="40" rx="7" ry="13" transform="rotate(-14 62 40)" fill="#C97E3B" stroke={COCOA} strokeWidth="2.6" />
          <ellipse cx="40" cy="47" rx="22" ry="20" fill="#F5C07A" stroke={COCOA} strokeWidth="2.8" />
          <ellipse cx="40" cy="54" rx="12" ry="9" fill="#FFF7E4" />
          <circle cx="31" cy="42" r="2.8" fill={COCOA} />
          <circle cx="49" cy="42" r="2.8" fill={COCOA} />
          <ellipse cx="40" cy="49" rx="4.2" ry="3" fill={COCOA} />
        </svg>
      );

    case 'hamster_visitor':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <circle cx="22" cy="28" r="6.5" fill="#F2B880" stroke={COCOA} strokeWidth="2.5" />
          <circle cx="58" cy="28" r="6.5" fill="#F2B880" stroke={COCOA} strokeWidth="2.5" />
          <ellipse cx="40" cy="48" rx="24" ry="20" fill="#F7CFA1" stroke={COCOA} strokeWidth="2.8" />
          <ellipse cx="40" cy="54" rx="15" ry="11" fill="#FFF7EB" />
          <circle cx="31" cy="42" r="2.8" fill={COCOA} />
          <circle cx="49" cy="42" r="2.8" fill={COCOA} />
          <circle cx="25" cy="49" r="5" fill="#FF9AB5" opacity="0.55" />
          <circle cx="55" cy="49" r="5" fill="#FF9AB5" opacity="0.55" />
          <ellipse cx="40" cy="48" rx="3" ry="2" fill="#FF85A6" />
        </svg>
      );

    case 'sakura_sprite':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <path d="M22,42 C10,24 14,16 32,32 Z" fill="#FFD6EA" stroke={COCOA} strokeWidth="2.2" />
          <path d="M58,42 C70,24 66,16 48,32 Z" fill="#FFD6EA" stroke={COCOA} strokeWidth="2.2" />
          <circle cx="40" cy="36" r="16" fill="#FFF3F8" stroke={COCOA} strokeWidth="2.6" />
          <path d="M28,24 Q40,12 52,24 Q44,28 36,28 Z" fill="#FF8EB8" stroke={COCOA} strokeWidth="2" />
          <circle cx="34" cy="36" r="2.4" fill={COCOA} />
          <circle cx="46" cy="36" r="2.4" fill={COCOA} />
          <circle cx="30" cy="41" r="2.8" fill="#FF94B6" opacity="0.65" />
          <circle cx="50" cy="41" r="2.8" fill="#FF94B6" opacity="0.65" />
          <path d="M26,52 L54,52 L50,68 L30,68 Z" fill="#FFA6CA" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" />
        </svg>
      );

    case 'firefly':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <ellipse cx="26" cy="30" rx="12" ry="7" transform="rotate(-25 26 30)" fill="#E4FAFF" stroke={COCOA} strokeWidth="2" opacity="0.9" />
          <ellipse cx="54" cy="30" rx="12" ry="7" transform="rotate(25 54 30)" fill="#E4FAFF" stroke={COCOA} strokeWidth="2" opacity="0.9" />
          <circle cx="40" cy="54" r="14" fill="#FFE66D" opacity="0.45" />
          <ellipse cx="40" cy="52" rx="10" ry="11" fill="#FFE875" stroke={COCOA} strokeWidth="2.4" />
          <circle cx="40" cy="34" r="12" fill="#4E4266" stroke={COCOA} strokeWidth="2.4" />
          <circle cx="35" cy="33" r="2.2" fill="#FFFFFF" />
          <circle cx="45" cy="33" r="2.2" fill="#FFFFFF" />
          <path d="M35,23 Q30,14 25,16 M45,23 Q50,14 55,16" fill="none" stroke={COCOA} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'snow_fox':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <polygon points="16,38 20,13 35,28" fill="#EBF4FF" stroke={COCOA} strokeWidth="2.6" strokeLinejoin="round" />
          <polygon points="64,38 60,13 45,28" fill="#EBF4FF" stroke={COCOA} strokeWidth="2.6" strokeLinejoin="round" />
          <ellipse cx="40" cy="48" rx="22" ry="19" fill="#FFFFFF" stroke={COCOA} strokeWidth="2.8" />
          <circle cx="31" cy="44" r="2.8" fill={COCOA} />
          <circle cx="49" cy="44" r="2.8" fill={COCOA} />
          <circle cx="40" cy="51" r="3" fill={COCOA} />
          <circle cx="26" cy="49" r="3.2" fill="#FFA6C2" opacity="0.65" />
          <circle cx="54" cy="49" r="3.2" fill="#FFA6C2" opacity="0.65" />
          <rect x="26" y="61" width="28" height="6" rx="3" fill="#7CB9F0" stroke={COCOA} strokeWidth="2" />
        </svg>
      );

    case 'arctic_bunny':
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <ellipse cx="29" cy="22" rx="6.5" ry="15" transform="rotate(-10 29 22)" fill="#FFFFFF" stroke={COCOA} strokeWidth="2.5" />
          <ellipse cx="51" cy="22" rx="6.5" ry="15" transform="rotate(10 51 22)" fill="#FFFFFF" stroke={COCOA} strokeWidth="2.5" />
          <ellipse cx="29" cy="22" rx="3" ry="9" transform="rotate(-10 29 22)" fill="#DCEEFF" />
          <ellipse cx="51" cy="22" rx="3" ry="9" transform="rotate(10 51 22)" fill="#DCEEFF" />
          <ellipse cx="40" cy="49" rx="22" ry="19" fill="#FFFFFF" stroke={COCOA} strokeWidth="2.8" />
          <circle cx="32" cy="46" r="2.7" fill={COCOA} />
          <circle cx="48" cy="46" r="2.7" fill={COCOA} />
          <ellipse cx="40" cy="51" rx="3" ry="2" fill="#FF9EB8" />
          <circle cx="26" cy="51" r="3.2" fill="#FFB3C9" opacity="0.65" />
          <circle cx="54" cy="51" r="3.2" fill="#FFB3C9" opacity="0.65" />
        </svg>
      );

    case 'fox':
    default:
      return (
        <svg viewBox="0 0 80 80" className={`${className} ${bounce}`} aria-hidden="true">
          <polygon points="16,38 20,13 35,28" fill="#EB7E3C" stroke={COCOA} strokeWidth="2.6" strokeLinejoin="round" />
          <polygon points="64,38 60,13 45,28" fill="#EB7E3C" stroke={COCOA} strokeWidth="2.6" strokeLinejoin="round" />
          <ellipse cx="40" cy="48" rx="22" ry="19" fill="#F28A44" stroke={COCOA} strokeWidth="2.8" />
          <path d="M22,52 Q40,66 58,52 Q48,66 40,66 Q32,66 22,52 Z" fill="#FFF9EE" />
          <circle cx="31" cy="44" r="2.8" fill={COCOA} />
          <circle cx="49" cy="44" r="2.8" fill={COCOA} />
          <circle cx="40" cy="52" r="3.4" fill={COCOA} />
          <rect x="26" y="61" width="28" height="6" rx="3" fill="#FF6B8B" stroke={COCOA} strokeWidth="2" />
        </svg>
      );
  }
};

export function getLocationLabelSafe(id: ActiveTownLocationId): string {
  switch (id) {
    case 'home_yard':
      return '自家庭院';
    case 'acorn_forest':
      return '橡果森林';
    case 'lake_park':
      return '湖邊公園';
    case 'town_market':
      return '小鎮市集';
  }
}
