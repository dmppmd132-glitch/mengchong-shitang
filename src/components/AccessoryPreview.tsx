import React from 'react';

interface AccessoryPreviewProps {
  accessoryId: string;
}

export const AccessoryPreview: React.FC<AccessoryPreviewProps> = ({ accessoryId }) => {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
      {accessoryId === 'pink_bow' && (
        <g transform="translate(32, 32)">
          <path d="M 0 0 L -20 -10 Q -24 2 -18 10 Z" fill="#FF6B9A" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
          <path d="M 0 0 L 20 -10 Q 24 2 18 10 Z" fill="#FF6B9A" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="0" cy="0" r="6.5" fill="#FFE082" stroke="#5A3E36" strokeWidth="3" />
        </g>
      )}
      {accessoryId === 'strawberry_clip' && (
        <g transform="translate(32, 34)">
          <path d="M 0 -12 C 15 -12 18 5 0 18 C -18 5 -15 -12 0 -12 Z" fill="#FF5C8D" stroke="#5A3E36" strokeWidth="3" />
          <path d="M -10 -12 Q 0 -20 10 -12 Q 0 -7 -10 -12 Z" fill="#6CD4B5" stroke="#5A3E36" strokeWidth="2.5" />
          <circle cx="-4" cy="-2" r="1.8" fill="#FFF8E1" />
          <circle cx="5" cy="1" r="1.8" fill="#FFF8E1" />
          <circle cx="0" cy="8" r="1.8" fill="#FFF8E1" />
        </g>
      )}
      {accessoryId === 'mini_crown' && (
        <g transform="translate(32, 34)">
          <path d="M -20 12 L -24 -10 L -9 2 L 0 -14 L 9 2 L 24 -10 L 20 12 Z" fill="#FFD54F" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="0" cy="4" r="3" fill="#FF6B9A" />
        </g>
      )}
      {accessoryId === 'chef_hat' && (
        <g transform="translate(32, 34)">
          <path d="M -20 10 C -30 -2 -18 -20 -4 -14 C 0 -24 14 -22 15 -12 C 26 -14 30 2 20 10 Z" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
          <rect x="-18" y="8" width="36" height="9" rx="3" fill="#FFF5DA" stroke="#5A3E36" strokeWidth="2.8" />
        </g>
      )}
      {accessoryId === 'round_glasses' && (
        <g fill="none" stroke="#6B4423" strokeWidth="3.2">
          <circle cx="20" cy="32" r="10" fill="#FFFFFF" fillOpacity="0.4" />
          <circle cx="44" cy="32" r="10" fill="#FFFFFF" fillOpacity="0.4" />
          <path d="M 30 32 Q 32 29 34 32" />
        </g>
      )}
      {accessoryId === 'star_blush' && (
        <g fill="#FFE066" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M 20 22 L 23 29 L 30 30 L 25 35 L 26 42 L 20 38 L 14 42 L 15 35 L 10 30 L 17 29 Z" />
          <path d="M 44 22 L 47 29 L 54 30 L 49 35 L 50 42 L 44 38 L 38 42 L 39 35 L 34 30 L 41 29 Z" />
        </g>
      )}
      {accessoryId === 'heart_shades' && (
        <g stroke="#5A3E36" strokeWidth="2.8">
          <path d="M 20 42 C 9 35 8 24 16 24 C 19 24 20 27 20 28 C 20 27 21 24 24 24 C 32 24 31 35 20 42 Z" fill="#FF6B9A" />
          <path d="M 44 42 C 33 35 32 24 40 24 C 43 24 44 27 44 28 C 44 27 45 24 48 24 C 56 24 55 35 44 42 Z" fill="#FF6B9A" />
          <path d="M 29 30 L 35 30" fill="none" />
        </g>
      )}
      {accessoryId === 'baby_bib' && (
        <g transform="translate(32, 32)">
          <path d="M -20 -14 Q 0 -4 20 -14 Q 24 14 0 20 Q -24 14 -20 -14 Z" fill="#FFF0A5" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="0" cy="4" r="4.5" fill="#FF7A9E" />
        </g>
      )}
      {accessoryId === 'mint_bell_tie' && (
        <g transform="translate(32, 32)">
          <path d="M -20 -8 L 0 0 L -20 8 Z" fill="#6CD4B5" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M 20 -8 L 0 0 L 20 8 Z" fill="#6CD4B5" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <circle cx="0" cy="4" r="6" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.6" />
        </g>
      )}
      {accessoryId === 'mint_apron' && (
        <g transform="translate(32, 32)">
          <path d="M -18 -14 Q 0 -10 18 -14 L 22 18 Q 0 24 -22 18 Z" fill="#7EDBC0" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
          <rect x="-10" y="-2" width="20" height="12" rx="4" fill="#FFF8E1" stroke="#5A3E36" strokeWidth="2.5" />
        </g>
      )}
      {accessoryId === 'strawberry_cape' && (
        <g transform="translate(32, 32)">
          <path d="M -18 -16 Q -26 8 -20 18 Q 0 24 20 18 Q 26 8 18 -16 Q 0 -10 -18 -16 Z" fill="#FF8AA8" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="-8" cy="4" r="3" fill="#FFFDF7" />
          <circle cx="8" cy="4" r="3" fill="#FFFDF7" />
          <circle cx="0" cy="12" r="3" fill="#FFFDF7" />
        </g>
      )}
      {accessoryId === 'beret_hat' && (
        <g transform="translate(32, 35)">
          <path d="M 0 -18 L 2 -23" stroke="#5A3E36" strokeWidth="3.2" strokeLinecap="round" />
          <ellipse cx="0" cy="-4" rx="22" ry="12" fill="#C97E49" stroke="#5A3E36" strokeWidth="3" />
          <path d="M -18 4 Q 0 11 18 4" fill="none" stroke="#5A3E36" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {accessoryId === 'sprout_clip' && (
        <g transform="translate(32, 36)">
          <path d="M 0 10 L 0 -6" stroke="#5A3E36" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 0 -4 C -4 -18 -20 -18 -18 -6 C -16 2 -4 2 0 -4 Z" fill="#6CD4B5" stroke="#5A3E36" strokeWidth="2.8" />
          <path d="M 0 -6 C 4 -20 20 -20 18 -8 C 16 0 4 0 0 -6 Z" fill="#95E8C9" stroke="#5A3E36" strokeWidth="2.8" />
        </g>
      )}
      {accessoryId === 'bandaid_cute' && (
        <g transform="translate(32, 32) rotate(-20)">
          <rect x="-20" y="-8" width="40" height="16" rx="8" fill="#FFB2C8" stroke="#5A3E36" strokeWidth="2.8" />
          <rect x="-7" y="-7" width="14" height="14" rx="2" fill="#FFF7EC" stroke="#5A3E36" strokeWidth="2.2" />
          <circle cx="-13" cy="-2" r="1.4" fill="#5A3E36" />
          <circle cx="-13" cy="2" r="1.4" fill="#5A3E36" />
          <circle cx="13" cy="-2" r="1.4" fill="#5A3E36" />
          <circle cx="13" cy="2" r="1.4" fill="#5A3E36" />
        </g>
      )}
      {accessoryId === 'monocle_gold' && (
        <g transform="translate(32, 30)">
          <circle cx="-2" cy="0" r="14" fill="#FFF7D6" fillOpacity="0.45" stroke="#D99B26" strokeWidth="3.6" />
          <circle cx="-2" cy="0" r="11" fill="none" stroke="#5A3E36" strokeWidth="1.5" opacity="0.5" />
          <path d="M 12 4 Q 16 14 13 24" fill="none" stroke="#D99B26" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      )}
      {accessoryId === 'pearl_necklace' && (
        <g transform="translate(32, 32)">
          <path d="M -20 -6 Q 0 18 20 -6" fill="none" stroke="#5A3E36" strokeWidth="2" />
          <circle cx="-18" cy="-4" r="4.2" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.2" />
          <circle cx="-10" cy="4" r="4.5" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.2" />
          <circle cx="0" cy="8" r="5" fill="#FFE6EA" stroke="#5A3E36" strokeWidth="2.2" />
          <circle cx="10" cy="4" r="4.5" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.2" />
          <circle cx="18" cy="-4" r="4.2" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.2" />
        </g>
      )}
      {accessoryId === 'carrot_scarf' && (
        <g transform="translate(32, 34)">
          <path d="M -22 -12 Q 0 -4 22 -12 L 0 16 Z" fill="#FF8C42" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -10 -7 L 0 3 L 10 -7" fill="none" stroke="#FFF4D8" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="0" cy="-6" r="4.5" fill="#FF6B4A" stroke="#5A3E36" strokeWidth="2.4" />
        </g>
      )}
      {accessoryId === 'sailor_collar' && (
        <g transform="translate(32, 32)">
          <path d="M -20 -12 L 0 -2 L 20 -12 L 22 14 L 0 18 L -22 14 Z" fill="#5D9CEC" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -16 8 L 0 12 L 16 8" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M -7 -2 L 0 2 L 7 -2 L 4 8 L 0 4 L -4 8 Z" fill="#FF6B8B" stroke="#5A3E36" strokeWidth="2.2" strokeLinejoin="round" />
        </g>
      )}
      {accessoryId === 'star_pajama' && (
        <g transform="translate(32, 32)">
          <path d="M -19 -14 Q -24 8 -18 18 Q 0 22 18 18 Q 24 8 19 -14 Q 0 -8 -19 -14 Z" fill="#A996E6" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -8 0 L -6 4 L -2 5 L -5 7 L -4 11 L -8 9 L -12 11 L -11 7 L -14 5 L -10 4 Z" fill="#FFE066" />
          <path d="M 8 2 L 10 6 L 14 7 L 11 9 L 12 13 L 8 11 L 4 13 L 5 9 L 2 7 L 6 6 Z" fill="#FFE066" />
        </g>
      )}
      {accessoryId === 'crystal_crown' && (
        <g transform="translate(32, 36)">
          <path
            d="M -20 10 L -23 -9 L -11 0 L 0 -15 L 11 0 L 23 -9 L 20 10 Z"
            fill="#FFD54F"
            stroke="#5A3E36"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path d="M -18 5 L 18 5" stroke="#F4B400" strokeWidth="3" strokeLinecap="round" />
          <circle cx="-23" cy="-11" r="2.8" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2" />
          <circle cx="0" cy="-17" r="3.2" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2" />
          <circle cx="23" cy="-11" r="2.8" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2" />
          <polygon points="0,-4 4,1 0,6 -4,1" fill="#6EC6FF" stroke="#5A3E36" strokeWidth="1.6" />
          <circle cx="-11" cy="4" r="2.3" fill="#FF6B9A" />
          <circle cx="11" cy="4" r="2.3" fill="#FF6B9A" />
        </g>
      )}
      {accessoryId === 'bunny_flower_crown' && (
        <g transform="translate(32, 34)">
          <path d="M -22 4 Q 0 -6 22 4" fill="none" stroke="#68B984" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="-17" cy="2" rx="5" ry="2.8" transform="rotate(-30 -17 2)" fill="#7EDBC0" stroke="#5A3E36" strokeWidth="1.8" />
          <ellipse cx="17" cy="2" rx="5" ry="2.8" transform="rotate(30 17 2)" fill="#7EDBC0" stroke="#5A3E36" strokeWidth="1.8" />
          <g transform="translate(-11, -1)">
            <circle cx="0" cy="-4" r="3.4" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="4" cy="0" r="3.4" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="-4" cy="0" r="3.4" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="0" cy="4" r="3.4" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="0" cy="0" r="2.5" fill="#FFE066" />
          </g>
          <g transform="translate(0, -4)">
            <circle cx="0" cy="-4.5" r="3.6" fill="#FFB8D0" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="4.5" cy="0" r="3.6" fill="#FFB8D0" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="-4.5" cy="0" r="3.6" fill="#FFB8D0" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="0" cy="4.5" r="3.6" fill="#FFB8D0" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="0" cy="0" r="2.8" fill="#FFE066" />
          </g>
          <g transform="translate(11, -1)">
            <circle cx="0" cy="-4" r="3.4" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="4" cy="0" r="3.4" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="-4" cy="0" r="3.4" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="0" cy="4" r="3.4" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="1.6" />
            <circle cx="0" cy="0" r="2.5" fill="#FFE066" />
          </g>
        </g>
      )}
      {accessoryId === 'pilot_goggles' && (
        <g transform="translate(32, 32)">
          <path d="M -27 -2 L -20 -2 M 20 -2 L 27 -2" stroke="#8D5B34" strokeWidth="4.2" strokeLinecap="round" />
          <rect x="-22" y="-11" width="19" height="17" rx="7" fill="#7ED4F7" stroke="#8D5B34" strokeWidth="3.8" />
          <rect x="3" y="-11" width="19" height="17" rx="7" fill="#7ED4F7" stroke="#8D5B34" strokeWidth="3.8" />
          <path d="M -3 -3 L 3 -3" stroke="#5A3E36" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -17 -6 L -12 -1" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
          <path d="M 8 -6 L 13 -1" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        </g>
      )}
      {accessoryId === 'lucky_clover_tie' && (
        <g transform="translate(32, 32)">
          <path d="M 0 0 C -12 -16 -24 -4 -14 0 C -24 4 -12 16 0 0 Z" fill="#68C98D" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 0 0 C 12 -16 24 -4 14 0 C 24 4 12 16 0 0 Z" fill="#82DB9F" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx="0" cy="0" r="5" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.4" />
        </g>
      )}
      {accessoryId === 'hero_cape' && (
        <g transform="translate(32, 32)">
          <path
            d="M -18 -14 L -24 16 Q 0 22 24 16 L 18 -14 Q 0 -7 -18 -14 Z"
            fill="#FF6464"
            stroke="#5A3E36"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path d="M -16 -12 Q 0 -5 16 -12" fill="none" stroke="#FFD54F" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M 0 -5 L 2 -1 L 6 0 L 3 3 L 4 7 L 0 5 L -4 7 L -3 3 L -6 0 L -2 -1 Z" fill="#FFE066" stroke="#5A3E36" strokeWidth="1.6" />
        </g>
      )}
      {accessoryId === 'anniversary_bib' && (
        <g transform="translate(32, 32)">
          <path
            d="M -21 -14 Q 0 -3 21 -14 Q 25 15 0 21 Q -25 15 -21 -14 Z"
            fill="#FFE1EC"
            stroke="#5A3E36"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M -16 8 Q 0 15 16 8"
            fill="none"
            stroke="#FFD54F"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M 0 -4 L 2.6 1 L 8 1.8 L 4 5.5 L 5 11 L 0 8.2 L -5 11 L -4 5.5 L -8 1.8 L -2.6 1 Z"
            fill="#FFD54F"
            stroke="#5A3E36"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </g>
      )}
      {accessoryId === 'strawberry_shake_headband' && (
        <g transform="translate(32, 36)">
          <path d="M -20 12 C -20 -6 20 -6 20 12" fill="none" stroke="#FF8EB0" strokeWidth="4.8" strokeLinecap="round" />
          <path d="M -20 12 C -20 -6 20 -6 20 12" fill="none" stroke="#5A3E36" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="-8" cy="-4" r="5" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
          <circle cx="0" cy="-7" r="6" fill="#FFF5F8" stroke="#5A3E36" strokeWidth="2.4" />
          <circle cx="8" cy="-4" r="5" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" />
          <path d="M 0 -22 C 8 -22 10 -12 0 -5 C -10 -12 -8 -22 0 -22 Z" fill="#FF5484" stroke="#5A3E36" strokeWidth="2.4" />
          <path d="M -5 -22 Q 0 -26 5 -22" fill="none" stroke="#6CD4B5" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="-2" cy="-14" r="1.2" fill="#FFF8E1" />
          <circle cx="2" cy="-12" r="1.2" fill="#FFF8E1" />
        </g>
      )}
      {accessoryId === 'mini_mushroom_hat' && (
        <g transform="translate(32, 34)">
          <path d="M -22 6 C -22 -16 22 -16 22 6 Q 0 12 -22 6 Z" fill="#F05D5E" stroke="#5A3E36" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="-10" cy="-4" rx="4.2" ry="3.6" fill="#FFFDF7" />
          <ellipse cx="3" cy="-8" rx="4.6" ry="3.8" fill="#FFFDF7" />
          <ellipse cx="13" cy="-2" rx="3.5" ry="3" fill="#FFFDF7" />
          <path d="M -11 8 Q 0 13 11 8 L 9 15 Q 0 18 -9 15 Z" fill="#FFF3DC" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
        </g>
      )}
      {accessoryId === 'cloud_nightcap' && (
        <g transform="translate(32, 34)">
          <path d="M -18 8 Q 0 -22 22 -8 Q 14 2 18 10 Z" fill="#89B9FA" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <rect x="-20" y="6" width="38" height="9" rx="4.5" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="2.6" />
          <circle cx="22" cy="-6" r="5.5" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="2.4" />
        </g>
      )}
      {accessoryId === 'mini_chef_hat' && (
        <g transform="translate(32, 36)">
          <path d="M -16 6 C -22 -4 -12 -16 -2 -12 C 2 -19 13 -17 13 -9 C 22 -10 22 2 15 6 Z" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <rect x="-15" y="4" width="30" height="8" rx="3" fill="#FFF5DA" stroke="#5A3E36" strokeWidth="2.6" />
          <path d="M 0 5.5 L 1.4 8 L 4 8.4 L 2 10.2 L 2.5 12.8 L 0 11.4 L -2.5 12.8 L -2 10.2 L -4 8.4 L -1.4 8 Z" fill="#FFD54F" />
        </g>
      )}
      {accessoryId === 'star_detector_hat' && (
        <g transform="translate(32, 38)">
          <line x1="0" y1="-10" x2="0" y2="-22" stroke="#5A3E36" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="0" cy="-24" r="4.5" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.4" />
          <path d="M -20 8 C -20 -10 20 -10 20 8 Z" fill="#6374C9" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -16 8 L 16 8" stroke="#85D7FF" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="-7" cy="0" r="2.2" fill="#FFE066" />
          <circle cx="8" cy="-1" r="2.6" fill="#85D7FF" />
        </g>
      )}
      {accessoryId === 'birthday_mini_crown' && (
        <g transform="translate(32, 36)">
          <line x1="0" y1="-10" x2="0" y2="-20" stroke="#FF8EB0" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 0 -27 C 3 -23 3 -20 0 -20 C -3 -20 -3 -23 0 -27 Z" fill="#FFB300" stroke="#5A3E36" strokeWidth="1.6" />
          <path d="M -18 10 L -21 -8 L -8 1 L 0 -10 L 8 1 L 21 -8 L 18 10 Z" fill="#FFE082" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -16 4 Q -8 8 0 4 Q 8 8 16 4" fill="none" stroke="#FF6B9A" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="-8" cy="6" r="2" fill="#6EC6FF" />
          <circle cx="8" cy="6" r="2" fill="#6CD4B5" />
        </g>
      )}
      {accessoryId === 'starlight_spark_pin' && (
        <g transform="translate(32, 34)">
          <path d="M -20 4 L 20 4" stroke="#F4B43E" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M -20 4 L 20 4" stroke="#FFF2A8" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M -6 -13 L -2.5 -4 L 7 -3 L -0.5 3 L 1.5 12 L -6 7.5 L -13.5 12 L -11.5 3 L -19 -3 L -9.5 -4 Z"
            fill="#FFE066"
            stroke="#5A3E36"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M 11 -9 L 13.2 -3 L 19.5 -2.2 L 14.8 1.8 L 16 8 L 11 4.8 L 6 8 L 7.2 1.8 L 2.5 -2.2 L 8.8 -3 Z"
            fill="#FF8EB0"
            stroke="#5A3E36"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="-6" cy="0" r="2" fill="#FFFDF7" />
        </g>
      )}
      {accessoryId === 'strawberry_blush_sticker' && (
        <g transform="translate(32, 34)">
          <path d="M -14 -7 C -8 -7 -7 4 -14 9 C -21 4 -20 -7 -14 -7 Z" fill="#FF6B9A" stroke="#5A3E36" strokeWidth="2.4" />
          <path d="M 14 -7 C 20 -7 21 4 14 9 C 7 4 8 -7 14 -7 Z" fill="#FF6B9A" stroke="#5A3E36" strokeWidth="2.4" />
          <path d="M -18 -7 Q -14 -11 -10 -7" fill="none" stroke="#6CD4B5" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 10 -7 Q 14 -11 18 -7" fill="none" stroke="#6CD4B5" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="-14" cy="0" r="1.2" fill="#FFF8E1" />
          <circle cx="14" cy="0" r="1.2" fill="#FFF8E1" />
        </g>
      )}
      {accessoryId === 'leaf_sunglasses' && (
        <g transform="translate(32, 32)" stroke="#5A3E36" strokeWidth="2.6">
          <path d="M -23 -4 C -16 -12 -5 -10 -4 0 C -8 9 -19 8 -23 -4 Z" fill="#52B788" />
          <path d="M 23 -4 C 16 -12 5 -10 4 0 C 8 9 19 8 23 -4 Z" fill="#52B788" />
          <path d="M -4 -2 L 4 -2" fill="none" strokeWidth="3" />
          <path d="M -17 -2 L -9 -1" stroke="#D8F3DC" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 9 -1 L 17 -2" stroke="#D8F3DC" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}
      {accessoryId === 'moon_sleep_mask' && (
        <g transform="translate(32, 32)">
          <rect x="-23" y="-10" width="46" height="20" rx="10" fill="#B5A4F2" stroke="#5A3E36" strokeWidth="2.8" />
          <path d="M -3 -5 C -7 -3 -7 4 -2 6 C -5 6 -9 4 -9 0 C -9 -4 -6 -6 -3 -5 Z" fill="#FFE066" />
          <circle cx="9" cy="-2" r="2" fill="#FFE066" />
          <circle cx="14" cy="3" r="1.5" fill="#FFFDF7" />
        </g>
      )}
      {accessoryId === 'chef_glasses' && (
        <g transform="translate(32, 32)" fill="none" stroke="#7A869A" strokeWidth="3">
          <rect x="-23" y="-8" width="19" height="15" rx="5" fill="#FFFFFF" fillOpacity="0.55" />
          <rect x="4" y="-8" width="19" height="15" rx="5" fill="#FFFFFF" fillOpacity="0.55" />
          <path d="M -4 -1 L 4 -1" stroke="#5A3E36" />
          <path d="M -18 -3 L -12 2" stroke="#90C2FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M 9 -3 L 15 2" stroke="#90C2FF" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      {accessoryId === 'starry_goggles' && (
        <g transform="translate(32, 32)">
          <rect x="-23" y="-10" width="20" height="18" rx="8" fill="#463F8F" stroke="#D9A441" strokeWidth="3.2" />
          <rect x="3" y="-10" width="20" height="18" rx="8" fill="#463F8F" stroke="#D9A441" strokeWidth="3.2" />
          <path d="M -3 -1 L 3 -1" stroke="#5A3E36" strokeWidth="3" />
          <circle cx="-15" cy="-3" r="2.2" fill="#FFE066" />
          <circle cx="-9" cy="2" r="1.5" fill="#9AE6FF" />
          <circle cx="11" cy="-3" r="2.2" fill="#FFE066" />
          <circle cx="17" cy="2" r="1.5" fill="#9AE6FF" />
        </g>
      )}
      {accessoryId === 'party_star_glasses' && (
        <g transform="translate(32, 32)" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M -14 -11 L -11 -4 L -4 -3 L -9 2 L -8 9 L -14 5 L -20 9 L -19 2 L -24 -3 L -17 -4 Z" fill="#FFD54F" />
          <path d="M 14 -11 L 17 -4 L 24 -3 L 19 2 L 20 9 L 14 5 L 8 9 L 9 2 L 4 -3 L 11 -4 Z" fill="#FF7AA8" />
          <path d="M -5 -2 L 5 -2" fill="none" strokeWidth="3" />
        </g>
      )}
      {accessoryId === 'strawberry_shake_bib' && (
        <g transform="translate(32, 32)">
          <path d="M -20 -13 Q 0 -3 20 -13 Q 24 14 0 20 Q -24 14 -20 -13 Z" fill="#FFD2E2" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -18 -11 Q 0 -2 18 -11" fill="none" stroke="#FFFDF7" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 0 -1 C 6 -1 7 7 0 11 C -7 7 -6 -1 0 -1 Z" fill="#FF5484" stroke="#5A3E36" strokeWidth="2" />
        </g>
      )}
      {accessoryId === 'knit_scarf' && (
        <g transform="translate(32, 32)">
          <rect x="-21" y="-11" width="42" height="14" rx="7" fill="#D98A4E" stroke="#5A3E36" strokeWidth="2.8" />
          <path d="M 4 -2 L 16 -2 L 18 18 L 6 18 Z" fill="#C9783D" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M -12 -4 L -4 -4 M 0 -4 L 8 -4" stroke="#FFF4D8" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
      {accessoryId === 'star_scarf' && (
        <g transform="translate(32, 32)">
          <rect x="-21" y="-11" width="42" height="13" rx="6.5" fill="#9BC3FF" stroke="#5A3E36" strokeWidth="2.8" />
          <path d="M -14 -2 L -4 -2 L -6 17 L -16 17 Z" fill="#82B0FA" stroke="#5A3E36" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="8" cy="-4.5" r="2.6" fill="#FFE066" />
          <circle cx="-10" cy="8" r="2.6" fill="#FFE066" />
        </g>
      )}
      {accessoryId === 'plaid_neckerchief' && (
        <g transform="translate(32, 33)">
          <path d="M -21 -12 Q 0 -3 21 -12 L 0 16 Z" fill="#FF6B6B" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -10 -7 L 6 8 M 10 -7 L -6 8" stroke="#FFFDF7" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="0" cy="-6" r="4.2" fill="#FFF8E1" stroke="#5A3E36" strokeWidth="2.2" />
        </g>
      )}
      {accessoryId === 'galaxy_necklace' && (
        <g transform="translate(32, 32)">
          <path d="M -20 -8 Q 0 12 20 -8" fill="none" stroke="#C5B4F5" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="0" cy="6" r="6" fill="#7068D9" stroke="#5A3E36" strokeWidth="2.4" />
          <ellipse cx="0" cy="6" rx="12" ry="3.2" transform="rotate(-18 0 6)" fill="none" stroke="#FFE066" strokeWidth="2.2" />
        </g>
      )}
      {accessoryId === 'ribbon_bowtie' && (
        <g transform="translate(32, 32)">
          <path d="M 0 0 L -20 -11 L -18 8 Z" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 0 0 L 20 -11 L 18 8 Z" fill="#6EC6FF" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M -3 3 L -9 18 M 3 3 L 9 18" stroke="#FFD54F" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="0" cy="0" r="5" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.4" />
        </g>
      )}
      {accessoryId === 'strawberry_dot_dress' && (
        <g transform="translate(32, 32)">
          <path d="M -15 -14 L 15 -14 L 22 18 Q 0 24 -22 18 Z" fill="#FF8EB0" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <circle cx="-8" cy="-2" r="2.6" fill="#FFFDF7" />
          <circle cx="7" cy="2" r="2.6" fill="#FFFDF7" />
          <circle cx="-6" cy="11" r="2.6" fill="#FFFDF7" />
          <circle cx="9" cy="12" r="2.6" fill="#FFFDF7" />
          <path d="M -19 16 Q -10 21 0 17 Q 10 21 19 16" fill="none" stroke="#FFFDF7" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}
      {accessoryId === 'cloud_pajamas' && (
        <g transform="translate(32, 32)">
          <path d="M -17 -14 L 17 -14 L 21 17 Q 0 21 -21 17 Z" fill="#B5D4FF" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <circle cx="-7" cy="2" r="4.5" fill="#FFFFFF" />
          <circle cx="-2" cy="1" r="4" fill="#FFFFFF" />
          <circle cx="9" cy="8" r="3.5" fill="#FFFFFF" />
          <circle cx="0" cy="-5" r="2.2" fill="#FFE066" />
        </g>
      )}
      {accessoryId === 'red_plaid_apron' && (
        <g transform="translate(32, 32)">
          <path d="M -17 -14 L 17 -14 L 21 18 Q 0 22 -21 18 Z" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -14 -4 L 14 -4 M -16 6 L 16 6 M -7 -12 L -7 17 M 7 -12 L 7 17" stroke="#FF6B6B" strokeWidth="3.2" opacity="0.82" />
          <rect x="-8" y="3" width="16" height="10" rx="4" fill="#FFF8EC" stroke="#5A3E36" strokeWidth="2.2" />
        </g>
      )}
      {accessoryId === 'party_mini_cape' && (
        <g transform="translate(32, 32)">
          <path d="M -18 -14 L -23 16 Q 0 22 23 16 L 18 -14 Q 0 -7 -18 -14 Z" fill="#FF85B3" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -15 -10 Q 0 -4 15 -10" fill="none" stroke="#FFE066" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="-8" cy="4" r="2.5" fill="#85D7FF" />
          <circle cx="8" cy="4" r="2.5" fill="#FFE066" />
          <circle cx="0" cy="11" r="2.5" fill="#95E8C9" />
        </g>
      )}
      {accessoryId === 'pink_balloon' && (
        <g transform="translate(32, 32)">
          <path d="M 0 5 Q -4 14 2 22" fill="none" stroke="#5A3E36" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="0" cy="-6" rx="14" ry="16" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="2.8" />
          <ellipse cx="-5" cy="-12" rx="3.5" ry="5" transform="rotate(-20 -5 -12)" fill="#FFD3E3" />
          <polygon points="0,10 -3,14 3,14" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="2" />
        </g>
      )}
      {accessoryId === 'milk_bottle' && (
        <g transform="translate(32, 34) rotate(-14)">
          <path d="M -4 -20 C -4 -25 4 -25 4 -20 L 5 -14 L -5 -14 Z" fill="#FFE082" stroke="#5A3E36" strokeWidth="2.2" />
          <rect x="-8" y="-14" width="16" height="5" rx="2" fill="#8ED8FF" stroke="#5A3E36" strokeWidth="2.2" />
          <rect x="-9" y="-9" width="18" height="24" rx="6" fill="#FFFFFF" stroke="#5A3E36" strokeWidth="2.6" />
          <rect x="-7" y="1" width="14" height="12" rx="4" fill="#FFF4D8" />
          <path d="M -4 -3 L 0 -3 M -4 3 L 1 3" stroke="#9EA9B8" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}
      {accessoryId === 'mini_camera' && (
        <g transform="translate(32, 34)">
          <rect x="-18" y="-11" width="36" height="25" rx="7" fill="#D79458" stroke="#5A3E36" strokeWidth="2.8" />
          <rect x="-16" y="-2" width="32" height="14" rx="4" fill="#FFFDF7" />
          <circle cx="0" cy="2" r="8" fill="#5B4D4B" stroke="#5A3E36" strokeWidth="2.4" />
          <circle cx="0" cy="2" r="4" fill="#82D4FA" />
          <circle cx="11" cy="-6" r="2.2" fill="#FFE066" />
        </g>
      )}
      {accessoryId === 'strawberry_icecream' && (
        <g transform="translate(32, 34)">
          <polygon points="-10,-1 10,-1 0,21" fill="#F0BA72" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx="0" cy="-6" r="10" fill="#FF8EB0" stroke="#5A3E36" strokeWidth="2.6" />
          <circle cx="0" cy="-14" r="7.5" fill="#FFF7EA" stroke="#5A3E36" strokeWidth="2.4" />
          <circle cx="0" cy="-21" r="3" fill="#FF477E" stroke="#5A3E36" strokeWidth="1.8" />
        </g>
      )}
      {accessoryId === 'little_star_wand' && (
        <g transform="translate(32, 32) rotate(14)">
          <line x1="0" y1="-2" x2="0" y2="21" stroke="#D99B26" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M 0 -20 L 4 -10 L 15 -9 L 7 -2 L 9 9 L 0 4 L -9 9 L -7 -2 L -15 -9 L -4 -10 Z"
            fill="#FFE066"
            stroke="#5A3E36"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="-5" r="2.5" fill="#FF7AA8" />
        </g>
      )}
      {accessoryId === 'little_lantern' && (
        <g transform="translate(32, 33)">
          <line x1="0" y1="-20" x2="0" y2="-13" stroke="#5A3E36" strokeWidth="2.8" strokeLinecap="round" />
          <rect x="-8" y="-13" width="16" height="4" rx="2" fill="#D99B26" stroke="#5A3E36" strokeWidth="2" />
          <ellipse cx="0" cy="2" rx="13" ry="13" fill="#FF8A5B" stroke="#5A3E36" strokeWidth="2.8" />
          <ellipse cx="0" cy="2" rx="6" ry="13" fill="none" stroke="#FFE082" strokeWidth="2" />
          <rect x="-7" y="14" width="14" height="4" rx="2" fill="#D99B26" stroke="#5A3E36" strokeWidth="2" />
          <line x1="0" y1="18" x2="0" y2="23" stroke="#FF5E5B" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}
      {accessoryId === 'superstar_star_wand' && (
        <g transform="translate(32, 34) rotate(12)">
          <line x1="0" y1="-2" x2="0" y2="21" stroke="#B67628" strokeWidth="4.2" strokeLinecap="round" />
          <line x1="0" y1="2" x2="0" y2="18" stroke="#FFE066" strokeWidth="1.6" strokeLinecap="round" />
          <path
            d="M -9 -3 L -11 -13 L -4 -8 L 0 -17 L 4 -8 L 11 -13 L 9 -3 Z"
            fill="#FFD447"
            stroke="#5A3E36"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="-7" r="3" fill="#FF6B9A" stroke="#5A3E36" strokeWidth="1.5" />
          <circle cx="-13" cy="-16" r="2" fill="#FFE066" />
          <circle cx="13" cy="-15" r="2" fill="#85D7FF" />
        </g>
      )}
      {accessoryId === 'camping_backpack' && (
        <g transform="translate(32, 34)">
          <path d="M -10 -14 Q 0 -22 10 -14" fill="none" stroke="#5A3E36" strokeWidth="3.2" strokeLinecap="round" />
          <rect x="-17" y="-12" width="34" height="32" rx="11" fill="#679E6B" stroke="#5A3E36" strokeWidth="2.8" />
          <rect x="-13" y="-16" width="26" height="9" rx="4.5" fill="#D89B5B" stroke="#5A3E36" strokeWidth="2.4" />
          <rect x="-11" y="2" width="22" height="12" rx="5" fill="#82BA86" stroke="#5A3E36" strokeWidth="2.2" />
          <circle cx="0" cy="6" r="2.4" fill="#FFE066" />
        </g>
      )}
      {accessoryId === 'space_mini_cape' && (
        <g transform="translate(32, 32)">
          <path d="M -18 -14 L -24 18 Q 0 22 24 18 L 18 -14 Q 0 -8 -18 -14 Z" fill="#463F8F" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -12 2 L -4 -6 L -6 4 Z" fill="#85D7FF" />
          <circle cx="8" cy="4" r="3.2" fill="#FFE066" />
          <circle cx="-6" cy="11" r="2" fill="#FFFDF7" />
          <circle cx="11" cy="-3" r="1.8" fill="#FFFDF7" />
        </g>
      )}
      {accessoryId === 'angel_feather_wings' && (
        <g transform="translate(32, 33)">
          <path d="M -3 0 C -11 -14 -27 -16 -26 -2 C -26 4 -22 7 -22 7 C -25 11 -18 17 -12 13 C -9 16 -4 14 -3 7 Z" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 3 0 C 11 -14 27 -16 26 -2 C 26 4 22 7 22 7 C 25 11 18 17 12 13 C 9 16 4 14 3 7 Z" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M -8 2 C -14 -4 -20 -4 -19 2" fill="none" stroke="#E9D8C8" strokeWidth="2" strokeLinecap="round" />
          <path d="M 8 2 C 14 -4 20 -4 19 2" fill="none" stroke="#E9D8C8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="3" r="4" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.2" />
        </g>
      )}
      {accessoryId === 'butterfly_dream_wings' && (
        <g transform="translate(32, 33)">
          <path d="M -2 -2 C -11 -18 -27 -14 -25 -1 C -24 5 -16 7 -6 5 C -19 8 -22 17 -13 18 C -7 19 -3 11 -2 4 Z" fill="#FF9AC2" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 2 -2 C 11 -18 27 -14 25 -1 C 24 5 16 7 6 5 C 19 8 22 17 13 18 C 7 19 3 11 2 4 Z" fill="#8BE0CE" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="-15" cy="-4" r="3" fill="#FFF5B8" />
          <circle cx="15" cy="-4" r="3" fill="#FFF5B8" />
          <rect x="-2.5" y="-6" width="5" height="16" rx="2.5" fill="#FFF3C4" stroke="#5A3E36" strokeWidth="2" />
        </g>
      )}
      {accessoryId === 'devil_bat_wings' && (
        <g transform="translate(32, 34)">
          <path d="M -3 0 C -11 -13 -24 -12 -26 -2 Q -21 1 -19 7 Q -14 4 -11 10 Q -6 7 -3 5 Z" fill="#8A63B8" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 3 0 C 11 -13 24 -12 26 -2 Q 21 1 19 7 Q 14 4 11 10 Q 6 7 3 5 Z" fill="#8A63B8" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="0" cy="2" r="3.5" fill="#FF7AA8" stroke="#5A3E36" strokeWidth="2" />
        </g>
      )}
      {accessoryId === 'bee_honey_wings' && (
        <g transform="translate(32, 34)">
          <ellipse cx="-14" cy="4" rx="9" ry="6" transform="rotate(-14 -14 4)" fill="#FFF2B2" stroke="#5A3E36" strokeWidth="2.2" />
          <ellipse cx="14" cy="4" rx="9" ry="6" transform="rotate(14 14 4)" fill="#FFF2B2" stroke="#5A3E36" strokeWidth="2.2" />
          <ellipse cx="-14" cy="-5" rx="11.5" ry="7.5" transform="rotate(-24 -14 -5)" fill="#E3F6FF" stroke="#5A3E36" strokeWidth="2.4" />
          <ellipse cx="14" cy="-5" rx="11.5" ry="7.5" transform="rotate(24 14 -5)" fill="#E3F6FF" stroke="#5A3E36" strokeWidth="2.4" />
          <circle cx="0" cy="1" r="4" fill="#FFD54F" stroke="#5A3E36" strokeWidth="2.2" />
        </g>
      )}
      {accessoryId === 'visitor_feather_clip' && (
        <g transform="translate(32, 34)">
          <path d="M -16 6 L 16 6" stroke="#E5A93B" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M -4 4 C -10 -16 8 -22 14 -6 C 10 2 2 5 -4 4 Z" fill="#8CE0FF" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 4 4 C 4 -12 20 -14 22 -2 C 17 5 9 6 4 4 Z" fill="#FFE082" stroke="#5A3E36" strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="-4" cy="5" r="4" fill="#FFD54F" stroke="#5A3E36" strokeWidth="2.2" />
        </g>
      )}
      {accessoryId === 'visitor_acorn_charm' && (
        <g transform="translate(32, 32)">
          <path d="M -20 -10 Q 0 2 20 -10" fill="none" stroke="#68B984" strokeWidth="4.6" strokeLinecap="round" />
          <line x1="0" y1="-8" x2="0" y2="-3" stroke="#5A3E36" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M -11 3 C -11 16 -5 22 0 22 C 5 22 11 16 11 3 Z" fill="#D98A4E" stroke="#5A3E36" strokeWidth="2.6" />
          <path d="M -14 3 Q 0 -9 14 3 Z" fill="#8C4E27" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
        </g>
      )}
      {accessoryId === 'visitor_rabbit_wreath' && (
        <g transform="translate(32, 36)">
          <path d="M -22 6 Q 0 -3 22 6" fill="none" stroke="#7EDBC0" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="-11" cy="-12" rx="4" ry="9" transform="rotate(-10 -11 -12)" fill="#FFFDF9" stroke="#5A3E36" strokeWidth="2.4" />
          <ellipse cx="11" cy="-12" rx="4" ry="9" transform="rotate(10 11 -12)" fill="#FFFDF9" stroke="#5A3E36" strokeWidth="2.4" />
          <circle cx="-10" cy="1" r="5" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="2" />
          <circle cx="0" cy="-2" r="5.5" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2" />
          <circle cx="10" cy="1" r="5" fill="#FF9EBB" stroke="#5A3E36" strokeWidth="2" />
          <circle cx="0" cy="-2" r="2.4" fill="#FFE066" />
        </g>
      )}
      {accessoryId === 'town_deer_antlers' && (
        <g transform="translate(32, 36)">
          <path d="M -20 8 Q 0 -2 20 8" fill="none" stroke="#8C5630" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M -12 2 L -18 -18 M -15 -8 L -23 -11 M 12 2 L 18 -18 M 15 -8 L 23 -11" fill="none" stroke="#8C5630" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="-21" cy="-12" rx="4.5" ry="2.8" transform="rotate(-24 -21 -12)" fill="#77C986" stroke="#5A3E36" strokeWidth="1.8" />
          <circle cx="19" cy="-13" r="3.4" fill="#FF6B8B" stroke="#5A3E36" strokeWidth="1.8" />
        </g>
      )}
      {accessoryId === 'town_duck_hat' && (
        <g transform="translate(32, 36)">
          <path d="M -20 4 C -20 -16 20 -16 20 4 Z" fill="#FFE474" stroke="#5A3E36" strokeWidth="2.6" />
          <ellipse cx="0" cy="6" rx="24" ry="6" fill="#FFCC4D" stroke="#5A3E36" strokeWidth="2.6" />
          <ellipse cx="0" cy="7" rx="9" ry="4" fill="#FF9B3D" stroke="#5A3E36" strokeWidth="2" />
          <circle cx="-7" cy="-3" r="2.2" fill="#5A3E36" />
          <circle cx="7" cy="-3" r="2.2" fill="#5A3E36" />
        </g>
      )}
      {accessoryId === 'town_fox_tail' && (
        <g transform="translate(32, 34)">
          <path
            d="M -18 14 C -24 -10 2 -22 18 -10 C 24 -4 20 12 6 16 C -6 19 -14 18 -18 14 Z"
            fill="#F2843C"
            stroke="#5A3E36"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path d="M 8 -14 C 18 -11 22 0 15 9 C 10 4 7 -5 8 -14 Z" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2" />
          <circle cx="-12" cy="11" r="4" fill="#FFE066" stroke="#5A3E36" strokeWidth="2" />
        </g>
      )}
      {accessoryId === 'collection_prism_crown' && (
        <g transform="translate(32, 34)">
          <path
            d="M -21 10 L -24 -10 L -10 0 L 0 -18 L 10 0 L 24 -10 L 21 10 Z"
            fill="#FFE066"
            stroke="#5A3E36"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <rect x="-21" y="9" width="42" height="6" rx="3" fill="#FFAFD0" stroke="#5A3E36" strokeWidth="2.4" />
          <polygon points="0,-10 5,-2 0,5 -5,-2" fill="#82E9FF" stroke="#5A3E36" strokeWidth="1.8" />
          <circle cx="-13" cy="2" r="2.8" fill="#FF7EB6" stroke="#5A3E36" strokeWidth="1.5" />
          <circle cx="13" cy="2" r="2.8" fill="#A78BFA" stroke="#5A3E36" strokeWidth="1.5" />
        </g>
      )}
      {accessoryId === 'birthday_hat' && (
        <g transform="translate(32, 37)">
          <polygon points="-17,12 0,-21 17,12" fill="#FF92B4" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M -11 2 L 8 -7 M -14 8 L 12 0" stroke="#FFE066" strokeWidth="2.6" strokeLinecap="round" />
          <ellipse cx="0" cy="12" rx="19" ry="4.5" fill="#FFFDF7" stroke="#5A3E36" strokeWidth="2.2" />
          <circle cx="-8" cy="12" r="2.6" fill="#82E9FF" />
          <circle cx="0" cy="12" r="2.6" fill="#FFE066" />
          <circle cx="8" cy="12" r="2.6" fill="#A78BFA" />
          <circle cx="0" cy="-23" r="4.8" fill="#FFE066" stroke="#5A3E36" strokeWidth="2.2" />
        </g>
      )}
      {accessoryId === 'birthday_crown' && (
        <g transform="translate(32, 36)">
          <path d="M -21 10 L -24 -10 L -10 -1 L 0 -19 L 10 -1 L 24 -10 L 21 10 Z" fill="#FFD447" stroke="#5A3E36" strokeWidth="2.6" strokeLinejoin="round" />
          <rect x="-21" y="9" width="42" height="6" rx="3" fill="#FF7EA8" stroke="#5A3E36" strokeWidth="2.2" />
          <circle cx="0" cy="-17" r="3" fill="#FF7EA8" stroke="#5A3E36" strokeWidth="1.6" />
          <polygon points="0,-9 4,-1 0,5 -4,-1" fill="#82E9FF" stroke="#5A3E36" strokeWidth="1.6" />
        </g>
      )}
      {accessoryId === 'birthday_cape' && (
        <g transform="translate(32, 32)">
          <path d="M -19 -14 L -24 18 Q 0 23 24 18 L 19 -14 Q 0 -7 -19 -14 Z" fill="#FF7EB6" stroke="#5A3E36" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -17 15 Q 0 20 17 15" fill="none" stroke="#FFE066" strokeWidth="3" strokeLinecap="round" />
          <path d="M -14 -10 Q 0 -3 14 -10" fill="none" stroke="#FFE066" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="-9" cy="4" r="2.8" fill="#FFE066" />
          <circle cx="9" cy="4" r="2.8" fill="#82E9FF" />
          <circle cx="0" cy="10" r="2.6" fill="#FFFDF7" />
        </g>
      )}
    </svg>
  );
};
