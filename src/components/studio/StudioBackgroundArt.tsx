import React from 'react';
import { PhotoBackground, PhotoFilter } from '../../types';
import { PHOTO_FILTER_BY_ID } from '../../data/photoStudio';

interface StudioBackgroundArtProps {
  backgroundId: PhotoBackground;
  filterId?: PhotoFilter;
  compact?: boolean;
}

export const StudioBackgroundArt: React.FC<StudioBackgroundArtProps> = ({
  backgroundId,
  filterId = 'none',
  compact = false,
}) => {
  const filterMeta = PHOTO_FILTER_BY_ID[filterId] ?? PHOTO_FILTER_BY_ID.none;

  const renderSvgScenery = () => {
    switch (backgroundId) {
      case 'pink_room':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgPinkWall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE1EC" />
                <stop offset="72%" stopColor="#FFF0F5" />
                <stop offset="100%" stopColor="#FBE0D4" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgPinkWall)" />
            {/* Wall Stripes */}
            {[24, 72, 120, 168, 216, 264, 312].map((x) => (
              <rect key={x} x={x} y="0" width="12" height="164" fill="#FFFFFF" opacity="0.28" />
            ))}
            {/* Floor */}
            <rect x="0" y="162" width="360" height="58" fill="#F6D5C7" />
            <ellipse cx="180" cy="190" rx="112" ry="20" fill="#FFF7FB" stroke="#F6B2C8" strokeWidth="3" strokeDasharray="6 4" />
            {/* Arched Window */}
            <path d="M134,126 L134,54 A46,46 0 0,1 226,54 L226,126 Z" fill="#DFF3FF" stroke="#FFFFFF" strokeWidth="6" />
            <line x1="180" y1="10" x2="180" y2="126" stroke="#FFFFFF" strokeWidth="3" />
            <line x1="134" y1="74" x2="226" y2="74" stroke="#FFFFFF" strokeWidth="3" />
            {/* Lace Curtains */}
            <path d="M126,12 Q148,68 130,128 L120,128 L120,12 Z" fill="#FFBBD2" opacity="0.85" />
            <path d="M234,12 Q212,68 230,128 L240,128 L240,12 Z" fill="#FFBBD2" opacity="0.85" />
            {/* Hanging Garland */}
            <path d="M20,24 Q90,46 130,24" fill="none" stroke="#F49CB8" strokeWidth="2" />
            <path d="M230,24 Q285,46 340,24" fill="none" stroke="#F49CB8" strokeWidth="2" />
            <circle cx="52" cy="33" r="6" fill="#FFD166" />
            <circle cx="94" cy="34" r="6" fill="#FF8EB0" />
            <circle cx="270" cy="34" r="6" fill="#FF8EB0" />
            <circle cx="312" cy="33" r="6" fill="#A8E6CF" />
          </svg>
        );

      case 'strawberry_field':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgBerrySky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CBEFFF" />
                <stop offset="60%" stopColor="#FFF5E6" />
                <stop offset="100%" stopColor="#E6F7D4" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgBerrySky)" />
            <circle cx="58" cy="40" r="20" fill="#FFE07D" opacity="0.9" />
            {/* Rolling Hills */}
            <path d="M0,145 Q90,112 185,140 T360,132 L360,220 L0,220 Z" fill="#B9E69B" />
            <path d="M0,164 Q130,145 250,168 T360,158 L360,220 L0,220 Z" fill="#92D674" />
            {/* White Fence */}
            {[20, 58, 96, 264, 302, 340].map((fx) => (
              <rect key={fx} x={fx} y="128" width="10" height="36" rx="4" fill="#FFFDF8" stroke="#E8D8CC" strokeWidth="1.5" />
            ))}
            <rect x="10" y="138" width="110" height="6" rx="3" fill="#FFFDF8" />
            <rect x="252" y="138" width="102" height="6" rx="3" fill="#FFFDF8" />
            {/* Strawberry Bushes */}
            {[42, 92, 268, 318].map((bx, i) => (
              <g key={bx} transform={`translate(${bx}, ${i % 2 === 0 ? 174 : 182})`}>
                <ellipse cx="0" cy="0" rx="22" ry="12" fill="#5DBB5E" />
                <circle cx="-10" cy="2" r="5" fill="#FF5A7E" />
                <circle cx="9" cy="4" r="5.5" fill="#FF476F" />
                <circle cx="0" cy="-6" r="4" fill="#FFFFFF" />
              </g>
            ))}
          </svg>
        );

      case 'cloud_sky':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgCloudSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9ED2FF" />
                <stop offset="65%" stopColor="#DCEEFF" />
                <stop offset="100%" stopColor="#FFFDFB" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgCloudSky)" />
            {/* Rainbow Arc */}
            <path d="M55,155 A125,105 0 0,1 305,155" fill="none" stroke="#FFB3C6" strokeWidth="8" opacity="0.45" />
            <path d="M65,155 A115,96 0 0,1 295,155" fill="none" stroke="#FFE08A" strokeWidth="8" opacity="0.45" />
            <path d="M75,155 A105,87 0 0,1 285,155" fill="none" stroke="#A7E8D0" strokeWidth="8" opacity="0.45" />
            {/* Fluffy Clouds */}
            <g fill="#FFFFFF" opacity="0.94">
              <circle cx="52" cy="56" r="20" />
              <circle cx="74" cy="50" r="24" />
              <circle cx="98" cy="58" r="18" />
              <circle cx="272" cy="48" r="18" />
              <circle cx="295" cy="44" r="22" />
              <circle cx="316" cy="52" r="16" />
              {/* Bottom Cloud Floor */}
              <circle cx="25" cy="204" r="42" />
              <circle cx="88" cy="196" r="46" />
              <circle cx="155" cy="202" r="48" />
              <circle cx="222" cy="198" r="46" />
              <circle cx="288" cy="200" r="44" />
              <circle cx="342" cy="206" r="40" />
            </g>
            {/* Twinkles */}
            <circle cx="152" cy="36" r="3" fill="#FFF7B2" />
            <circle cx="218" cy="28" r="3.5" fill="#FFF7B2" />
          </svg>
        );

      case 'kitchen':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgKitchenWall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE7C2" />
                <stop offset="72%" stopColor="#FFF6E5" />
                <stop offset="100%" stopColor="#F5D3B3" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgKitchenWall)" />
            {/* Tile Grid */}
            {[36, 72, 108].map((y) => (
              <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="#F2D7B6" strokeWidth="1.5" opacity="0.6" />
            ))}
            {/* Kitchen Shelves */}
            <rect x="26" y="54" width="96" height="8" rx="4" fill="#C98A5B" />
            <rect x="238" y="54" width="96" height="8" rx="4" fill="#C98A5B" />
            <rect x="38" y="34" width="18" height="20" rx="4" fill="#FF9EB8" />
            <rect x="64" y="30" width="22" height="24" rx="5" fill="#FFE07D" />
            <circle cx="102" cy="42" r="11" fill="#8CD7B8" />
            <rect x="250" y="32" width="22" height="22" rx="4" fill="#9ED2FF" />
            <rect x="282" y="36" width="20" height="18" rx="4" fill="#FFB284" />
            {/* Countertop */}
            <rect x="0" y="164" width="360" height="56" fill="#E8B98E" />
            <rect x="0" y="158" width="360" height="10" fill="#FFFDF8" />
          </svg>
        );

      case 'forest_camp':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgCampSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BCEAD5" />
                <stop offset="65%" stopColor="#E9F8EB" />
                <stop offset="100%" stopColor="#D7EBC5" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgCampSky)" />
            {/* Pine Trees */}
            {[36, 78, 286, 326].map((tx, idx) => (
              <g key={tx} transform={`translate(${tx}, ${idx % 2 === 0 ? 78 : 88})`}>
                <rect x="-5" y="48" width="10" height="28" fill="#8D5B4C" />
                <polygon points="0,-16 -28,28 28,28" fill="#5BAE7D" />
                <polygon points="0,4 -32,52 32,52" fill="#469668" />
              </g>
            ))}
            {/* Cozy Tent */}
            <polygon points="56,168 96,104 136,168" fill="#F4A261" stroke="#6E473B" strokeWidth="2.5" />
            <polygon points="84,168 96,130 108,168" fill="#5A3E36" />
            {/* String Fairy Lights */}
            <path d="M24,26 Q180,62 336,26" fill="none" stroke="#6E544E" strokeWidth="2" />
            {[64, 118, 180, 242, 298].map((lx, i) => (
              <circle key={lx} cx={lx} cy={i === 2 ? 44 : i === 1 || i === 3 ? 40 : 33} r="5.5" fill="#FFE07D" />
            ))}
            {/* Meadow Ground */}
            <path d="M0,164 Q180,152 360,164 L360,220 L0,220 Z" fill="#88C97E" />
          </svg>
        );

      case 'starry_night_market':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgNightMkt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#251D4D" />
                <stop offset="68%" stopColor="#43357D" />
                <stop offset="100%" stopColor="#5D487C" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgNightMkt)" />
            {/* Stars & Crescent Moon */}
            <circle cx="304" cy="40" r="16" fill="#FFE680" />
            <circle cx="312" cy="36" r="13" fill="#292154" />
            {[46, 98, 166, 224, 260, 128, 242].map((sx, idx) => (
              <circle key={sx + idx} cx={sx} cy={22 + (idx % 3) * 16} r="2.2" fill="#FFF8C9" />
            ))}
            {/* Market Stall Awnings */}
            <rect x="18" y="114" width="84" height="58" rx="6" fill="#7D4E57" />
            <path d="M12,114 L108,114 L100,132 L20,132 Z" fill="#FF7B89" />
            <rect x="258" y="114" width="84" height="58" rx="6" fill="#7D4E57" />
            <path d="M252,114 L348,114 L340,132 L260,132 Z" fill="#FFB347" />
            {/* Warm Hanging Lanterns */}
            <path d="M0,34 Q180,74 360,34" fill="none" stroke="#2D1D2B" strokeWidth="2.5" />
            {[44, 102, 180, 258, 316].map((lx, i) => (
              <g key={lx} transform={`translate(${lx}, ${i === 2 ? 54 : i === 1 || i === 3 ? 49 : 41})`}>
                <ellipse cx="0" cy="10" rx="10" ry="12" fill={i % 2 === 0 ? '#FF6B7D' : '#FFD166'} />
                <rect x="-5" y="-2" width="10" height="4" fill="#4A3531" />
              </g>
            ))}
            <rect x="0" y="168" width="360" height="52" fill="#4E3F63" />
          </svg>
        );

      case 'beach_vacation':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgBeachSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7FD8FF" />
                <stop offset="56%" stopColor="#D8F4FF" />
                <stop offset="100%" stopColor="#FFF4D1" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgBeachSky)" />
            <circle cx="294" cy="40" r="22" fill="#FFD95E" />
            {/* Ocean */}
            <rect x="0" y="122" width="360" height="48" fill="#4FC3E8" />
            <path d="M0,162 Q60,152 120,162 T240,162 T360,162 L360,178 L0,178 Z" fill="#FFFFFF" opacity="0.72" />
            {/* Sand Beach */}
            <path d="M0,168 Q180,154 360,170 L360,220 L0,220 Z" fill="#FBE1A6" />
            {/* Beach Umbrella */}
            <line x1="68" y1="86" x2="68" y2="176" stroke="#A66B43" strokeWidth="4" />
            <path d="M26,94 Q68,58 110,94 Z" fill="#FF7A9E" />
            <path d="M48,94 Q68,60 88,94 Z" fill="#FFFDF8" />
            {/* Palm Fronds */}
            <path d="M358,28 Q312,32 292,58" fill="none" stroke="#3FA36C" strokeWidth="8" strokeLinecap="round" />
            <path d="M358,42 Q316,56 306,82" fill="none" stroke="#53BA7E" strokeWidth="7" strokeLinecap="round" />
          </svg>
        );

      case 'sakura_path':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgSakura" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFDCEB" />
                <stop offset="60%" stopColor="#FFF2F7" />
                <stop offset="100%" stopColor="#F5E5DB" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgSakura)" />
            {/* Path */}
            <path d="M0,166 L360,166 L360,220 L0,220 Z" fill="#D4E8B6" />
            <path d="M130,220 Q168,184 180,166 L206,166 Q224,186 266,220 Z" fill="#F7EAE1" />
            {/* Sakura Branches */}
            <path d="M0,56 Q72,44 128,74" fill="none" stroke="#7A5248" strokeWidth="7" strokeLinecap="round" />
            <path d="M360,48 Q284,42 232,76" fill="none" stroke="#7A5248" strokeWidth="7" strokeLinecap="round" />
            {[28, 66, 98, 126, 238, 272, 310, 340].map((cx, idx) => (
              <circle key={cx} cx={cx} cy={idx % 2 === 0 ? 44 : 62} r="22" fill="#FFAEC9" opacity="0.88" />
            ))}
            {[46, 86, 260, 294, 326].map((cx) => (
              <circle key={`p_${cx}`} cx={cx} cy="52" r="14" fill="#FFD1E1" opacity="0.92" />
            ))}
            {/* Falling Petals */}
            {[88, 146, 212, 278, 122, 234].map((px, i) => (
              <ellipse key={px + i} cx={px} cy={94 + i * 16} rx="4" ry="2.5" fill="#FF9EC0" transform={`rotate(${i * 25} ${px} ${94 + i * 16})`} />
            ))}
          </svg>
        );

      case 'halloween_party':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgHalloween" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2E1B4E" />
                <stop offset="68%" stopColor="#58307B" />
                <stop offset="100%" stopColor="#3B234A" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgHalloween)" />
            <circle cx="72" cy="46" r="24" fill="#FFE699" />
            {/* Castle Silhouette */}
            <rect x="264" y="84" width="66" height="82" fill="#23123A" />
            <polygon points="264,84 280,54 296,84" fill="#23123A" />
            <polygon points="298,84 314,54 330,84" fill="#23123A" />
            <rect x="288" y="106" width="12" height="16" rx="6" fill="#FFD166" />
            {/* Ground */}
            <rect x="0" y="166" width="360" height="54" fill="#2A173B" />
            {/* Smiling Jack-o-lanterns */}
            {[52, 308].map((jx) => (
              <g key={jx} transform={`translate(${jx}, 168)`}>
                <ellipse cx="0" cy="0" rx="18" ry="14" fill="#FF8C24" />
                <rect x="-3" y="-18" width="6" height="6" fill="#4E944F" />
                <circle cx="-6" cy="-2" r="2.5" fill="#3B1D0A" />
                <circle cx="6" cy="-2" r="2.5" fill="#3B1D0A" />
                <path d="M-7,5 Q0,10 7,5" fill="none" stroke="#3B1D0A" strokeWidth="2" />
              </g>
            ))}
            {/* Cute Little Ghost */}
            <path d="M108,74 A12,12 0 0,1 132,74 L132,94 L126,89 L120,94 L114,89 L108,94 Z" fill="#FFFFFF" opacity="0.9" />
            <circle cx="116" cy="74" r="2" fill="#3B234A" />
            <circle cx="124" cy="74" r="2" fill="#3B234A" />
          </svg>
        );

      case 'christmas_cabin':
      default:
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgXmas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6D3B32" />
                <stop offset="70%" stopColor="#8C4F43" />
                <stop offset="100%" stopColor="#5D352B" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgXmas)" />
            {/* Snowy Window */}
            <rect x="26" y="28" width="76" height="72" rx="10" fill="#2A3E66" stroke="#E8C6A8" strokeWidth="5" />
            <line x1="64" y1="28" x2="64" y2="100" stroke="#E8C6A8" strokeWidth="3" />
            <line x1="26" y1="64" x2="102" y2="64" stroke="#E8C6A8" strokeWidth="3" />
            <circle cx="44" cy="44" r="2" fill="#FFFFFF" />
            <circle cx="84" cy="52" r="2.5" fill="#FFFFFF" />
            <circle cx="48" cy="82" r="2" fill="#FFFFFF" />
            {/* Decorated Christmas Tree */}
            <g transform="translate(300, 114)">
              <rect x="-8" y="42" width="16" height="20" fill="#6E473B" />
              <polygon points="0,-68 -36,-10 36,-10" fill="#2E7D54" />
              <polygon points="0,-38 -44,24 44,24" fill="#256B47" />
              <polygon points="0,-10 -50,48 50,48" fill="#1E593B" />
              <circle cx="0" cy="-70" r="7" fill="#FFD166" />
              <circle cx="-14" cy="-16" r="4.5" fill="#FF6B88" />
              <circle cx="16" cy="8" r="4.5" fill="#FFD166" />
              <circle cx="-18" cy="30" r="4.5" fill="#9ED2FF" />
            </g>
            {/* Floor */}
            <rect x="0" y="166" width="360" height="54" fill="#B67B56" />
            <ellipse cx="180" cy="192" rx="105" ry="18" fill="#D94E5D" stroke="#FFE6AA" strokeWidth="2.5" />
          </svg>
        );
    }
  };

  return (
    <>
      {renderSvgScenery()}
      {filterMeta.overlayStyle !== 'none' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: filterMeta.overlayStyle }}
          aria-hidden="true"
        />
      )}
      {compact && <span className="sr-only">{filterMeta.label}</span>}
    </>
  );
};
