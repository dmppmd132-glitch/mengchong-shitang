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
    </svg>
  );
};
