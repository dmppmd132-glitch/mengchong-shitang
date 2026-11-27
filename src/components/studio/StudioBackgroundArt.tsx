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

      case 'strawberry_season_field':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgSeasonBerrySky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFDCE8" />
                <stop offset="52%" stopColor="#FFF5E8" />
                <stop offset="100%" stopColor="#DFF5CE" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgSeasonBerrySky)" />
            {/* Ribbon Flower Archway */}
            <path
              d="M44,175 A136,130 0 0,1 316,175"
              fill="none"
              stroke="#FF9BB8"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M52,175 A128,122 0 0,1 308,175"
              fill="none"
              stroke="#FFF8FA"
              strokeWidth="3"
              strokeDasharray="6 6"
            />
            {[74, 122, 180, 238, 286].map((x, idx) => (
              <g
                key={x}
                transform={`translate(${x}, ${idx === 2 ? 44 : idx === 1 || idx === 3 ? 62 : 104})`}
              >
                <circle cx="0" cy="0" r="8" fill="#FF5A84" />
                <circle cx="-6" cy="-5" r="4" fill="#A6E080" />
                <circle cx="6" cy="-5" r="4" fill="#A6E080" />
              </g>
            ))}
            {/* Rolling Hills */}
            <path d="M0,152 Q95,124 180,148 T360,140 L360,220 L0,220 Z" fill="#BCE89D" />
            <path d="M0,172 Q125,156 245,174 T360,166 L360,220 L0,220 Z" fill="#8FD672" />
            {/* Picnic Blanket */}
            <polygon points="108,214 252,214 232,178 128,178" fill="#FFE6EE" stroke="#FF8EB0" strokeWidth="2.5" />
            {/* Lush Ripe Strawberry Bushes */}
            {[36, 82, 278, 324].map((bx, i) => (
              <g key={bx} transform={`translate(${bx}, ${i % 2 === 0 ? 176 : 186})`}>
                <ellipse cx="0" cy="0" rx="24" ry="13" fill="#4FB358" />
                <circle cx="-11" cy="2" r="5.5" fill="#FF4772" />
                <circle cx="0" cy="-4" r="5.5" fill="#FF668E" />
                <circle cx="11" cy="3" r="5.5" fill="#FF4772" />
                <circle cx="-5" cy="-8" r="3.5" fill="#FFFDF8" />
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

      case 'bird_treetop_sky':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgBirdSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8FD4FF" />
                <stop offset="65%" stopColor="#DFF4FF" />
                <stop offset="100%" stopColor="#D7F2C7" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgBirdSky)" />
            <circle cx="298" cy="40" r="22" fill="#FFE680" opacity="0.92" />
            <g fill="#FFFFFF" opacity="0.9">
              <circle cx="58" cy="52" r="18" />
              <circle cx="78" cy="46" r="22" />
              <circle cx="100" cy="54" r="16" />
              <circle cx="210" cy="42" r="15" />
              <circle cx="230" cy="40" r="18" />
            </g>
            {/* Lush Oak Treetop Canopy & Branches */}
            <path d="M0,168 Q180,150 360,166 L360,220 L0,220 Z" fill="#95D67B" />
            <path d="M-8,124 Q64,88 128,108" fill="none" stroke="#8C593B" strokeWidth="10" strokeLinecap="round" />
            <path d="M368,116 Q296,86 244,104" fill="none" stroke="#8C593B" strokeWidth="10" strokeLinecap="round" />
            {[16, 52, 88, 276, 314, 348].map((cx, i) => (
              <circle key={cx} cx={cx} cy={i % 2 === 0 ? 74 : 92} r="28" fill="#5CB86E" opacity="0.9" />
            ))}
            {/* Cute Hanging Wooden Bird Feeder */}
            <line x1="76" y1="98" x2="76" y2="122" stroke="#6E473B" strokeWidth="2.5" />
            <polygon points="58,124 76,112 94,124" fill="#D97A54" />
            <rect x="63" y="124" width="26" height="20" rx="3" fill="#FFF3DA" stroke="#8C593B" strokeWidth="2" />
          </svg>
        );

      case 'squirrel_acorn_forest':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgAcornForest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE1A8" />
                <stop offset="65%" stopColor="#FFF5E0" />
                <stop offset="100%" stopColor="#E4D29E" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgAcornForest)" />
            <circle cx="62" cy="44" r="24" fill="#FFD166" opacity="0.85" />
            {/* Autumn Trees */}
            {[36, 90, 278, 326].map((tx, idx) => (
              <g key={tx} transform={`translate(${tx}, ${idx % 2 === 0 ? 74 : 84})`}>
                <rect x="-7" y="40" width="14" height="58" fill="#8D5B4C" />
                <circle cx="0" cy="14" r="34" fill={idx % 2 === 0 ? '#E89242' : '#D97236'} opacity="0.9" />
                <circle cx="-18" cy="24" r="22" fill="#F2B154" opacity="0.85" />
              </g>
            ))}
            {/* Golden Forest Floor & Acorns */}
            <path d="M0,164 Q180,150 360,164 L360,220 L0,220 Z" fill="#C9A86A" />
            {[56, 108, 256, 312].map((ax, i) => (
              <g key={ax} transform={`translate(${ax}, ${178 + (i % 2) * 10})`}>
                <ellipse cx="0" cy="4" rx="7" ry="8" fill="#C47C3C" />
                <path d="M-8,0 Q0,-8 8,0 Z" fill="#6E4124" />
              </g>
            ))}
          </svg>
        );

      case 'rabbit_carrot_garden':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgCarrotGarden" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE0EC" />
                <stop offset="56%" stopColor="#FFF8EE" />
                <stop offset="100%" stopColor="#D7F3C4" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgCarrotGarden)" />
            {/* Floral Trellis Arch */}
            <path d="M52,168 A128,118 0 0,1 308,168" fill="none" stroke="#9ED685" strokeWidth="9" />
            {[74, 128, 180, 232, 286].map((fx, i) => (
              <g key={fx} transform={`translate(${fx}, ${i === 2 ? 50 : i === 1 || i === 3 ? 66 : 104})`}>
                <circle cx="0" cy="0" r="8" fill={i % 2 === 0 ? '#FF9EB8' : '#FFE07D'} />
                <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
              </g>
            ))}
            {/* Rolling Lawn & Carrot Garden Patches */}
            <path d="M0,156 Q180,140 360,156 L360,220 L0,220 Z" fill="#9DE07F" />
            {[46, 86, 274, 314].map((cx, i) => (
              <g key={cx} transform={`translate(${cx}, ${178 + (i % 2) * 8})`}>
                <ellipse cx="0" cy="6" rx="14" ry="5" fill="#8C593B" />
                <polygon points="0,6 -5,-6 5,-6" fill="#FF7E38" />
                <circle cx="-3" cy="-9" r="4" fill="#4EB55B" />
                <circle cx="3" cy="-9" r="4" fill="#4EB55B" />
              </g>
            ))}
          </svg>
        );

      case 'forest_cabin':
      case 'acorn_trail':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgTownForest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={backgroundId === 'forest_cabin' ? '#CDEFD6' : '#FFE4B5'} />
                <stop offset="65%" stopColor="#F4F8E6" />
                <stop offset="100%" stopColor="#B8DB9B" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgTownForest)" />
            <circle cx="305" cy="40" r="22" fill="#FFE07D" opacity="0.85" />
            {[36, 86, 286, 330].map((tx, i) => (
              <g key={tx} transform={`translate(${tx}, ${i % 2 === 0 ? 78 : 88})`}>
                <rect x="-6" y="34" width="12" height="58" fill="#8D5B4C" />
                <polygon points="0,-32 -28,22 28,22" fill={i % 2 === 0 ? '#4B9B63' : '#65B576'} />
                <polygon points="0,-10 -32,42 32,42" fill={i % 2 === 0 ? '#3E8754' : '#52A164'} />
              </g>
            ))}
            {backgroundId === 'forest_cabin' && (
              <g transform="translate(222, 108)">
                <rect x="0" y="18" width="66" height="46" rx="4" fill="#E3B382" stroke="#5A3E36" strokeWidth="2.5" />
                <polygon points="-8,20 33,-10 74,20" fill="#B97343" stroke="#5A3E36" strokeWidth="2.5" strokeLinejoin="round" />
                <rect x="24" y="36" width="16" height="28" rx="3" fill="#8D5632" />
                <rect x="8" y="32" width="11" height="11" rx="2" fill="#FFF3B8" />
              </g>
            )}
            <path d="M0,162 Q180,148 360,162 L360,220 L0,220 Z" fill="#90CA7C" />
            {backgroundId === 'acorn_trail' && (
              <path d="M88,220 Q168,176 235,158 L266,162 Q216,184 196,220 Z" fill="#E6C596" opacity="0.9" />
            )}
          </svg>
        );

      case 'lakeside_sunset':
      case 'waterfront_bridge':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgTownLake" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={backgroundId === 'lakeside_sunset' ? '#FFB59E' : '#9FDFFF'} />
                <stop offset="52%" stopColor={backgroundId === 'lakeside_sunset' ? '#FFE6BA' : '#EAF9FF'} />
                <stop offset="100%" stopColor={backgroundId === 'lakeside_sunset' ? '#7BBEE8' : '#73CEEE'} />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgTownLake)" />
            {backgroundId === 'lakeside_sunset' ? (
              <circle cx="180" cy="96" r="34" fill="#FFD17A" opacity="0.88" />
            ) : (
              <>
                <ellipse cx="82" cy="40" rx="28" ry="12" fill="#FFFFFF" opacity="0.88" />
                <ellipse cx="282" cy="36" rx="24" ry="11" fill="#FFFFFF" opacity="0.84" />
              </>
            )}
            <path d="M0,126 Q180,118 360,126 L360,220 L0,220 Z" fill={backgroundId === 'lakeside_sunset' ? '#70B0DC' : '#6CC8ED'} />
            <path d="M18,144 Q180,104 342,144" fill="none" stroke="#B67642" strokeWidth="10" strokeLinecap="round" />
            <path d="M18,132 Q180,92 342,132" fill="none" stroke="#D99B5B" strokeWidth="3.5" />
            <path d="M40,182 Q100,174 160,182 M210,192 Q270,184 330,192" stroke="#EAF9FF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          </svg>
        );

      case 'market_night':
      case 'wooden_stalls':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgTownMarket" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={backgroundId === 'market_night' ? '#362D66' : '#FFE3BD'} />
                <stop offset="68%" stopColor={backgroundId === 'market_night' ? '#6D4F7D' : '#FFF4E0'} />
                <stop offset="100%" stopColor="#D7B28E" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgTownMarket)" />
            {backgroundId === 'market_night' && (
              <>
                <circle cx="52" cy="32" r="2.2" fill="#FFE680" />
                <circle cx="136" cy="24" r="2.6" fill="#FFE680" />
                <circle cx="294" cy="30" r="2.2" fill="#FFE680" />
              </>
            )}
            <path d="M0,46 Q90,64 180,46 Q270,64 360,46" fill="none" stroke="#5A3E36" strokeWidth="2.5" />
            {[45, 115, 245, 315].map((lx) => (
              <circle key={lx} cx={lx} cy="56" r="10" fill="#FF9854" stroke="#5A3E36" strokeWidth="2" />
            ))}
            <rect x="24" y="106" width="84" height="62" rx="4" fill="#FFF3DC" stroke="#5A3E36" strokeWidth="2.2" />
            <path d="M18,106 L26,84 H106 L114,106 Z" fill="#FF7B8E" stroke="#5A3E36" strokeWidth="2.2" />
            <rect x="252" y="106" width="84" height="62" rx="4" fill="#FFF3DC" stroke="#5A3E36" strokeWidth="2.2" />
            <path d="M246,106 L254,84 H334 L342,106 Z" fill="#77C986" stroke="#5A3E36" strokeWidth="2.2" />
            <rect x="0" y="164" width="360" height="56" fill="#C9A27A" />
          </svg>
        );

      case 'dream_lodge_bg':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgDreamLodge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD9EB" />
                <stop offset="55%" stopColor="#FFF4EA" />
                <stop offset="100%" stopColor="#D7F3CE" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgDreamLodge)" />
            <rect x="108" y="54" width="144" height="114" rx="12" fill="#FFFDF6" stroke="#5A3E36" strokeWidth="2.6" />
            <polygon points="94,60 180,14 266,60" fill="#FF86B0" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
            <circle cx="180" cy="38" r="8" fill="#FFE066" />
            <path d="M126,64 Q180,82 234,64" fill="none" stroke="#FFD54F" strokeWidth="3" />
            <path d="M0,164 Q180,150 360,164 L360,220 L0,220 Z" fill="#9EE08A" />
          </svg>
        );

      case 'rainbow_trail_bg':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgRainbowTrail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CBEBFF" />
                <stop offset="55%" stopColor="#FFF6EB" />
                <stop offset="100%" stopColor="#D7F4C8" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgRainbowTrail)" />
            <path d="M 16 142 A 164 128 0 0 1 344 142" fill="none" stroke="#FF8EB0" strokeWidth="11" opacity="0.72" />
            <path d="M 27 142 A 153 118 0 0 1 333 142" fill="none" stroke="#FFD166" strokeWidth="10" opacity="0.75" />
            <path d="M 37 142 A 143 108 0 0 1 323 142" fill="none" stroke="#8CE99A" strokeWidth="10" opacity="0.75" />
            <path d="M 47 142 A 133 98 0 0 1 313 142" fill="none" stroke="#74C0FC" strokeWidth="10" opacity="0.75" />
            <ellipse cx="64" cy="46" rx="28" ry="14" fill="#FFFFFF" opacity="0.9" />
            <ellipse cx="296" cy="42" rx="30" ry="14" fill="#FFFFFF" opacity="0.9" />
            <path d="M0,156 Q180,144 360,156 L360,220 L0,220 Z" fill="#A6E690" />
            <path d="M135,220 Q168,178 180,154 Q192,178 225,220 Z" fill="#FFF3D6" />
            <circle cx="92" cy="186" r="4" fill="#FF8EB0" />
            <circle cx="268" cy="182" r="4" fill="#FFD166" />
            <circle cx="116" cy="172" r="3.5" fill="#74C0FC" />
          </svg>
        );

      case 'spring_picnic':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgSpringPicnic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DFF4FF" />
                <stop offset="55%" stopColor="#FFF5F9" />
                <stop offset="100%" stopColor="#C8EBB4" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgSpringPicnic)" />
            <circle cx="56" cy="38" r="18" fill="#FFE885" opacity="0.9" />
            <path d="M0,148 Q120,124 240,146 T360,136 L360,220 L0,220 Z" fill="#A5E089" />
            <circle cx="310" cy="48" r="36" fill="#FFB8D2" opacity="0.88" />
            <circle cx="280" cy="56" r="24" fill="#FFCBE0" opacity="0.85" />
            <rect x="304" y="80" width="12" height="72" rx="4" fill="#8C624A" />
            <polygon points="88,202 126,158 236,158 272,202" fill="#FFF7F4" stroke="#FF8EB0" strokeWidth="2.5" />
            <line x1="112" y1="176" x2="248" y2="176" stroke="#FFB6CA" strokeWidth="5" opacity="0.65" />
            <circle cx="72" cy="88" r="4" fill="#FFA6C9" />
            <circle cx="142" cy="54" r="3.5" fill="#FFA6C9" />
            <circle cx="215" cy="74" r="4" fill="#FFC2DB" />
          </svg>
        );

      case 'summer_festival':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgSummerFest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#26285C" />
                <stop offset="68%" stopColor="#494285" />
                <stop offset="100%" stopColor="#6D5E82" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgSummerFest)" />
            {/* Fireworks */}
            <g stroke="#FFD166" strokeWidth="2" strokeLinecap="round" opacity="0.88">
              <line x1="76" y1="22" x2="76" y2="62" />
              <line x1="56" y1="42" x2="96" y2="42" />
              <line x1="62" y1="28" x2="90" y2="56" />
              <line x1="90" y1="28" x2="62" y2="56" />
            </g>
            <g stroke="#FF8EB8" strokeWidth="2" strokeLinecap="round" opacity="0.88">
              <line x1="284" y1="28" x2="284" y2="64" />
              <line x1="266" y1="46" x2="302" y2="46" />
              <line x1="271" y1="33" x2="297" y2="59" />
              <line x1="297" y1="33" x2="271" y2="59" />
            </g>
            <path d="M0,48 Q90,68 180,48 Q270,68 360,48" fill="none" stroke="#FFE39E" strokeWidth="2" />
            {[46, 128, 232, 314].map((cx) => (
              <ellipse key={cx} cx={cx} cy="62" rx="10" ry="13" fill="#FF7C6B" stroke="#FFF2C2" strokeWidth="1.8" />
            ))}
            <rect x="0" y="162" width="360" height="58" fill="#5D4866" />
            <ellipse cx="180" cy="186" rx="94" ry="16" fill="#6FD2F5" stroke="#FFF3DA" strokeWidth="2.5" />
          </svg>
        );

      case 'maple_path':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgMaplePath" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE1BF" />
                <stop offset="60%" stopColor="#FFF2DA" />
                <stop offset="100%" stopColor="#E6B27A" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgMaplePath)" />
            <circle cx="48" cy="64" r="38" fill="#E87148" opacity="0.9" />
            <circle cx="312" cy="68" r="40" fill="#F0984B" opacity="0.9" />
            <rect x="42" y="96" width="12" height="70" fill="#7D523D" />
            <rect x="306" y="100" width="12" height="66" fill="#7D523D" />
            <path d="M0,158 Q180,142 360,158 L360,220 L0,220 Z" fill="#DDA15E" />
            <path d="M126,220 Q168,176 180,152 Q192,176 234,220 Z" fill="#F4D3A1" />
            <circle cx="96" cy="126" r="4.5" fill="#E76F51" />
            <circle cx="242" cy="112" r="4.5" fill="#F4A261" />
            <circle cx="164" cy="84" r="4" fill="#E76F51" />
          </svg>
        );

      case 'harvest_farm':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgHarvestFarm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE0AD" />
                <stop offset="62%" stopColor="#FFF3D6" />
                <stop offset="100%" stopColor="#E3BC78" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgHarvestFarm)" />
            <circle cx="290" cy="44" r="22" fill="#FFB703" opacity="0.88" />
            <rect x="26" y="88" width="84" height="72" rx="6" fill="#D95D4E" stroke="#6B4433" strokeWidth="2.4" />
            <polygon points="18,92 68,54 118,92" fill="#B54438" stroke="#6B4433" strokeWidth="2.4" />
            <rect x="0" y="156" width="360" height="64" fill="#D8AF68" />
            <circle cx="288" cy="156" r="20" fill="#F4B740" stroke="#6B4433" strokeWidth="2" />
            <ellipse cx="76" cy="172" rx="18" ry="14" fill="#F28A38" stroke="#6B4433" strokeWidth="2" />
            <ellipse cx="308" cy="176" rx="16" ry="13" fill="#FFA44E" stroke="#6B4433" strokeWidth="2" />
          </svg>
        );

      case 'snow_cabin':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgSnowCabin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CAE4FF" />
                <stop offset="65%" stopColor="#ECF5FF" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgSnowCabin)" />
            <rect x="116" y="74" width="128" height="90" rx="8" fill="#C98A5B" stroke="#5A3E36" strokeWidth="2.4" />
            <polygon points="102,78 180,32 258,78" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round" />
            <rect x="164" y="106" width="32" height="36" rx="4" fill="#FFE082" stroke="#5A3E36" strokeWidth="2" />
            <path d="M0,156 Q180,144 360,156 L360,220 L0,220 Z" fill="#F4F9FF" />
            {/* Snowman */}
            <circle cx="62" cy="164" r="18" fill="#FFFFFF" stroke="#B8D4EE" strokeWidth="2" />
            <circle cx="62" cy="138" r="13" fill="#FFFFFF" stroke="#B8D4EE" strokeWidth="2" />
            <polygon points="62,140 72,142 62,144" fill="#FF8C42" />
            {[40, 94, 150, 224, 290, 326].map((sx, i) => (
              <circle key={sx} cx={sx} cy={24 + (i % 3) * 22} r="3" fill="#FFFFFF" />
            ))}
          </svg>
        );

      case 'christmas_market':
        return (
          <svg
            viewBox="0 0 360 220"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bgXmasMarket" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#223259" />
                <stop offset="68%" stopColor="#3B4D7A" />
                <stop offset="100%" stopColor="#DDEAF8" />
              </linearGradient>
            </defs>
            <rect width="360" height="220" fill="url(#bgXmasMarket)" />
            <path d="M0,38 Q180,62 360,38" fill="none" stroke="#FFE082" strokeWidth="2.5" />
            {[54, 118, 180, 242, 306].map((lx, i) => (
              <circle key={lx} cx={lx} cy={46 + (i === 2 ? 6 : 0)} r="5" fill={i % 2 === 0 ? '#FFD166' : '#FF7B8E'} />
            ))}
            <rect x="26" y="102" width="76" height="62" rx="4" fill="#FFF3DC" stroke="#5A3E36" strokeWidth="2" />
            <polygon points="18,104 64,74 110,104" fill="#D94E5D" stroke="#FFFFFF" strokeWidth="3" />
            <rect x="258" y="102" width="76" height="62" rx="4" fill="#FFF3DC" stroke="#5A3E36" strokeWidth="2" />
            <polygon points="250,104 296,74 342,104" fill="#2E7D54" stroke="#FFFFFF" strokeWidth="3" />
            <rect x="0" y="162" width="360" height="58" fill="#EBF4FC" />
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
