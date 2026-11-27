import React from 'react';
import { ROOM_ITEM_BY_ID } from '../../data/house';

const COCOA = '#6B5344';

export interface FurnitureGraphicProps {
  itemId: string;
  size?: number;
  className?: string;
}

export const FurnitureGraphic: React.FC<FurnitureGraphicProps> = ({
  itemId,
  size = 40,
  className = '',
}) => {
  const renderGraphic = () => {
    switch (itemId) {
      case 'wood_cozy_bed':
        return (
          <g>
            <rect x="10" y="20" width="44" height="28" rx="6" fill="#C98E5B" stroke={COCOA} strokeWidth="2.2" />
            <rect x="14" y="25" width="36" height="19" rx="4" fill="#FFF7EB" stroke={COCOA} strokeWidth="1.8" />
            <rect x="16" y="27" width="14" height="10" rx="4" fill="#FFE2B8" stroke={COCOA} strokeWidth="1.6" />
            <path d="M27 27H48V43H27C25 38 25 32 27 27Z" fill="#9EDAC1" stroke={COCOA} strokeWidth="1.6" />
            <rect x="12" y="48" width="6" height="6" rx="2" fill="#A67144" stroke={COCOA} strokeWidth="1.8" />
            <rect x="46" y="48" width="6" height="6" rx="2" fill="#A67144" stroke={COCOA} strokeWidth="1.8" />
          </g>
        );

      case 'strawberry_lace_bed':
        return (
          <g>
            <path d="M10 22C10 15 54 15 54 22V48H10V22Z" fill="#FF9EB8" stroke={COCOA} strokeWidth="2.2" />
            <rect x="14" y="25" width="36" height="19" rx="5" fill="#FFF4F7" stroke={COCOA} strokeWidth="1.8" />
            <ellipse cx="23" cy="31" rx="7" ry="4.5" fill="#FFD1E0" stroke={COCOA} strokeWidth="1.5" />
            <path d="M26 26H49V43H26C24 37 24 31 26 26Z" fill="#FFB3CA" stroke={COCOA} strokeWidth="1.6" />
            <circle cx="38" cy="34" r="3.5" fill="#FF5C8A" stroke={COCOA} strokeWidth="1.3" />
            <path d="M36 30L38 28L40 30" stroke="#53B06B" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M10 47Q15 53 21 47Q26 53 32 47Q37 53 43 47Q48 53 54 47" fill="#FFE6EE" stroke={COCOA} strokeWidth="1.6" />
          </g>
        );

      case 'cloud_big_bed':
        return (
          <g>
            <path
              d="M12 36C8 36 6 31 9 27C8 21 15 16 22 19C26 14 38 14 42 19C49 16 56 21 55 27C58 31 56 36 52 36V48H12V36Z"
              fill="#F5F9FF"
              stroke={COCOA}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <rect x="16" y="28" width="32" height="16" rx="6" fill="#DCEBFF" stroke={COCOA} strokeWidth="1.6" />
            <ellipse cx="24" cy="33" rx="6" ry="3.5" fill="#FFFDF8" stroke={COCOA} strokeWidth="1.4" />
            <path d="M28 31H47V43H28Z" fill="#C9DFFF" stroke={COCOA} strokeWidth="1.4" />
            <circle cx="38" cy="37" r="2.2" fill="#FFE27A" />
          </g>
        );

      case 'fluffy_cotton_pillow':
      case 'toy_throw_pillow':
        return (
          <g>
            <path
              d="M14 22C24 18 40 18 50 22C54 30 54 38 50 46C40 50 24 50 14 46C10 38 10 30 14 22Z"
              fill={itemId === 'toy_throw_pillow' ? '#FFD6E5' : '#FFF7E8'}
              stroke={COCOA}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="34" r="4" fill={itemId === 'toy_throw_pillow' ? '#FF9EB8' : '#F2D2A9'} stroke={COCOA} strokeWidth="1.5" />
            <path d="M22 28Q26 34 22 40M42 28Q38 34 42 40" stroke={COCOA} strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
          </g>
        );

      case 'pumpkin_plush_pillow':
        return (
          <g>
            <path d="M32 13C33 10 36 9 37 11C37 14 34 17 32 19" stroke="#5A9658" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="32" cy="36" rx="20" ry="15" fill="#FF9E4F" stroke={COCOA} strokeWidth="2.2" />
            <ellipse cx="32" cy="36" rx="11" ry="15" fill="#FFB26B" stroke={COCOA} strokeWidth="1.8" />
            <ellipse cx="32" cy="36" rx="4.5" ry="15" fill="#FFC388" stroke={COCOA} strokeWidth="1.5" />
          </g>
        );

      case 'cloud_puff_pillow':
        return (
          <g>
            <path
              d="M14 42C9 42 7 36 11 32C10 25 17 20 24 23C28 17 38 17 42 23C49 21 55 26 53 32C57 36 55 42 49 42H14Z"
              fill="#F2F7FF"
              stroke={COCOA}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <circle cx="25" cy="33" r="1.5" fill={COCOA} />
            <circle cx="39" cy="33" r="1.5" fill={COCOA} />
            <path d="M30 35Q32 37 34 35" stroke={COCOA} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );

      case 'mint_breeze_blanket':
        return (
          <g>
            <rect x="12" y="20" width="40" height="26" rx="6" fill="#9CE2C6" stroke={COCOA} strokeWidth="2.2" />
            <path d="M12 28H52M12 36H52" stroke="#6AC4A2" strokeWidth="2" />
            <path d="M16 46V51M24 46V51M32 46V51M40 46V51M48 46V51" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );

      case 'forest_plaid_blanket':
        return (
          <g>
            <rect x="12" y="20" width="40" height="26" rx="5" fill="#E39D6B" stroke={COCOA} strokeWidth="2.2" />
            <path d="M22 20V46M32 20V46M42 20V46M12 29H52M12 38H52" stroke="#9B5B3A" strokeWidth="1.8" opacity="0.65" />
            <path d="M16 46V51M24 46V51M32 46V51M40 46V51M48 46V51" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );

      case 'cream_round_rug':
        return (
          <g>
            <ellipse cx="32" cy="36" rx="23" ry="13" fill="#FFF3DC" stroke={COCOA} strokeWidth="2.2" />
            <ellipse cx="32" cy="36" rx="15" ry="8" fill="#F9E3BE" stroke={COCOA} strokeWidth="1.5" strokeDasharray="3 3" />
          </g>
        );

      case 'strawberry_bow_rug':
        return (
          <g>
            <ellipse cx="32" cy="37" rx="23" ry="13" fill="#FFD1E0" stroke={COCOA} strokeWidth="2.2" />
            <ellipse cx="32" cy="37" rx="16" ry="8.5" fill="#FFF2F6" stroke="#FF85AC" strokeWidth="1.6" />
            <path d="M26 24L32 28L38 24L36 30L32 28L28 30Z" fill="#FF6E9B" stroke={COCOA} strokeWidth="1.5" strokeLinejoin="round" />
          </g>
        );

      case 'forest_woven_rug':
        return (
          <g>
            <ellipse cx="32" cy="36" rx="23" ry="13" fill="#D4C29A" stroke={COCOA} strokeWidth="2.2" />
            <ellipse cx="32" cy="36" rx="16" ry="8.5" fill="none" stroke="#9C8459" strokeWidth="1.8" />
            <ellipse cx="32" cy="36" rx="9" ry="4.5" fill="#9ED49C" stroke={COCOA} strokeWidth="1.5" />
          </g>
        );

      case 'rainbow_bounce_ball':
      case 'toy_rainbow_ball':
        return (
          <g>
            <circle cx="32" cy="34" r="18" fill="#FFE680" stroke={COCOA} strokeWidth="2.2" />
            <path d="M16 26C24 22 40 22 48 26" stroke="#FF7AA2" strokeWidth="5" strokeLinecap="round" />
            <path d="M14 34C24 30 40 30 50 34" stroke="#7AD6B8" strokeWidth="5" strokeLinecap="round" />
            <path d="M17 42C25 38 39 38 47 42" stroke="#85B8FF" strokeWidth="5" strokeLinecap="round" />
            <circle cx="32" cy="34" r="18" fill="none" stroke={COCOA} strokeWidth="2.2" />
            <circle cx="25" cy="25" r="2.5" fill="#FFFFFF" opacity="0.85" />
          </g>
        );

      case 'cloud_star_ball':
        return (
          <g>
            <circle cx="32" cy="34" r="18" fill="#CBE2FF" stroke={COCOA} strokeWidth="2.2" />
            <path
              d="M32 22L35 29L42 30L37 35L38 42L32 39L26 42L27 35L22 30L29 29Z"
              fill="#FFE47A"
              stroke={COCOA}
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="24" r="2" fill="#FFFFFF" opacity="0.9" />
          </g>
        );

      case 'oak_snack_table':
        return (
          <g>
            <rect x="18" y="34" width="5" height="16" rx="2" fill="#B57E4E" stroke={COCOA} strokeWidth="1.8" />
            <rect x="41" y="34" width="5" height="16" rx="2" fill="#B57E4E" stroke={COCOA} strokeWidth="1.8" />
            <ellipse cx="32" cy="28" rx="22" ry="9" fill="#E3B382" stroke={COCOA} strokeWidth="2.2" />
            <ellipse cx="32" cy="27" rx="16" ry="5.5" fill="#F0C79B" />
          </g>
        );

      case 'camp_picnic_table':
        return (
          <g>
            <path d="M18 32L14 50M46 32L50 50" stroke="#9B6940" strokeWidth="4" strokeLinecap="round" />
            <rect x="10" y="25" width="44" height="9" rx="3" fill="#D59D6A" stroke={COCOA} strokeWidth="2.1" />
            <rect x="13" y="38" width="38" height="5" rx="2" fill="#E4B382" stroke={COCOA} strokeWidth="1.8" />
          </g>
        );

      case 'gingham_placemat':
        return (
          <g>
            <rect x="11" y="21" width="42" height="26" rx="5" fill="#FFF7EA" stroke={COCOA} strokeWidth="2.1" />
            <rect x="16" y="25" width="10" height="8" fill="#FFB877" opacity="0.75" />
            <rect x="36" y="25" width="12" height="8" fill="#FFB877" opacity="0.75" />
            <rect x="26" y="33" width="10" height="9" fill="#FFB877" opacity="0.75" />
            <circle cx="32" cy="34" r="6" fill="#FFFFFF" stroke={COCOA} strokeWidth="1.6" />
          </g>
        );

      case 'strawberry_heart_mat':
        return (
          <g>
            <path
              d="M32 50C17 41 11 33 11 25C11 19 16 15 22 15C26 15 30 18 32 21C34 18 38 15 42 15C48 15 53 19 53 25C53 33 47 41 32 50Z"
              fill="#FFB3C9"
              stroke={COCOA}
              strokeWidth="2.1"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="31" r="6" fill="#FFF8FA" stroke={COCOA} strokeWidth="1.5" />
          </g>
        );

      case 'bakery_snack_rack':
        return (
          <g>
            <line x1="32" y1="14" x2="32" y2="50" stroke={COCOA} strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="32" cy="13" r="3.5" fill="#FFD166" stroke={COCOA} strokeWidth="1.6" />
            <ellipse cx="32" cy="43" rx="19" ry="5.5" fill="#FFE6EE" stroke={COCOA} strokeWidth="2" />
            <ellipse cx="32" cy="27" rx="14" ry="4.5" fill="#FFF5F8" stroke={COCOA} strokeWidth="2" />
            <circle cx="27" cy="24" r="3.5" fill="#FF7EA5" stroke={COCOA} strokeWidth="1.4" />
            <circle cx="37" cy="24" r="3.5" fill="#FFE082" stroke={COCOA} strokeWidth="1.4" />
            <circle cx="24" cy="40" r="3.5" fill="#FFB870" stroke={COCOA} strokeWidth="1.4" />
            <circle cx="40" cy="40" r="3.5" fill="#9CE2C6" stroke={COCOA} strokeWidth="1.4" />
          </g>
        );

      case 'cloud_dessert_tower':
        return (
          <g>
            <path d="M22 50H42L38 42H26Z" fill="#C9DFFF" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
            <ellipse cx="32" cy="38" rx="17" ry="5" fill="#F2F7FF" stroke={COCOA} strokeWidth="2" />
            <ellipse cx="32" cy="25" rx="12" ry="4" fill="#FFFDF8" stroke={COCOA} strokeWidth="1.8" />
            <path d="M27 23C27 18 37 18 37 23Z" fill="#FFE17D" stroke={COCOA} strokeWidth="1.5" />
            <path d="M29 19H35" stroke="#A66A46" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );

      case 'monstera_pot':
        return (
          <g>
            <path d="M22 36H42L39 52H25Z" fill="#E39D74" stroke={COCOA} strokeWidth="2.1" strokeLinejoin="round" />
            <rect x="20" y="33" width="24" height="5" rx="2" fill="#EEB08B" stroke={COCOA} strokeWidth="1.8" />
            <path d="M32 34C24 28 16 20 20 14C26 12 31 20 32 34Z" fill="#70C47F" stroke={COCOA} strokeWidth="1.8" />
            <path d="M32 34C40 28 48 20 44 14C38 12 33 20 32 34Z" fill="#5CB26B" stroke={COCOA} strokeWidth="1.8" />
            <path d="M32 34C29 22 29 12 32 10C35 12 35 22 32 34Z" fill="#82D48F" stroke={COCOA} strokeWidth="1.8" />
          </g>
        );

      case 'sunflower_vase':
        return (
          <g>
            <path d="M23 36H41L38 52H26Z" fill="#FFF4DC" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
            <line x1="32" y1="36" x2="32" y2="23" stroke="#5A9A58" strokeWidth="3" />
            <circle cx="32" cy="20" r="11" fill="#FFD54F" stroke={COCOA} strokeWidth="2" />
            <circle cx="32" cy="20" r="5.5" fill="#7D4E32" stroke={COCOA} strokeWidth="1.5" />
          </g>
        );

      case 'blueberry_scent_pot':
        return (
          <g>
            <path d="M23 36H41L38 52H26Z" fill="#DCE6FF" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
            <path d="M32 36C23 31 18 22 23 16C29 15 32 24 32 36Z" fill="#6EBF7B" stroke={COCOA} strokeWidth="1.8" />
            <path d="M32 36C41 31 46 22 41 16C35 15 32 24 32 36Z" fill="#5AAE68" stroke={COCOA} strokeWidth="1.8" />
            <circle cx="25" cy="22" r="4.2" fill="#6F8DF2" stroke={COCOA} strokeWidth="1.5" />
            <circle cx="38" cy="21" r="4.2" fill="#6F8DF2" stroke={COCOA} strokeWidth="1.5" />
            <circle cx="32" cy="16" r="4.2" fill="#88A3FA" stroke={COCOA} strokeWidth="1.5" />
          </g>
        );

      case 'linen_flower_curtain':
        return (
          <g>
            <rect x="13" y="14" width="38" height="36" rx="4" fill="#CBE8F7" stroke={COCOA} strokeWidth="2.1" />
            <path d="M13 14H31C30 28 24 40 13 46Z" fill="#FFF6E8" stroke={COCOA} strokeWidth="1.8" />
            <path d="M51 14H33C34 28 40 40 51 46Z" fill="#FFF6E8" stroke={COCOA} strokeWidth="1.8" />
            <line x1="10" y1="14" x2="54" y2="14" stroke={COCOA} strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="21" cy="26" r="2.2" fill="#FF9EB8" />
            <circle cx="43" cy="26" r="2.2" fill="#FF9EB8" />
          </g>
        );

      case 'cloud_gauze_curtain':
        return (
          <g>
            <rect x="13" y="14" width="38" height="36" rx="4" fill="#B9D0FA" stroke={COCOA} strokeWidth="2.1" />
            <path d="M13 14H31C29 29 22 41 13 48Z" fill="#EEF4FF" stroke={COCOA} strokeWidth="1.8" />
            <path d="M51 14H33C35 29 42 41 51 48Z" fill="#EEF4FF" stroke={COCOA} strokeWidth="1.8" />
            <line x1="10" y1="14" x2="54" y2="14" stroke={COCOA} strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="32" cy="26" r="3" fill="#FFE47A" />
          </g>
        );

      case 'pet_sketch_painting':
        return (
          <g>
            <rect x="14" y="16" width="36" height="32" rx="4" fill="#D59E6A" stroke={COCOA} strokeWidth="2.2" />
            <rect x="18" y="20" width="28" height="24" rx="2" fill="#FFFDF8" stroke={COCOA} strokeWidth="1.5" />
            <circle cx="32" cy="33" r="7" fill="#FFD1DC" stroke={COCOA} strokeWidth="1.5" />
            <circle cx="29.5" cy="32" r="1" fill={COCOA} />
            <circle cx="34.5" cy="32" r="1" fill={COCOA} />
            <ellipse cx="32" cy="34.5" rx="2.3" ry="1.6" fill="#FF9EB8" />
          </g>
        );

      case 'strawberry_cafe_art':
        return (
          <g>
            <rect x="14" y="16" width="36" height="32" rx="4" fill="#FF9EB8" stroke={COCOA} strokeWidth="2.2" />
            <rect x="18" y="20" width="28" height="24" rx="2" fill="#FFF7FA" stroke={COCOA} strokeWidth="1.5" />
            <path d="M26 35C26 29 38 29 38 35C38 40 32 42 32 42C32 42 26 40 26 35Z" fill="#FF6B94" stroke={COCOA} strokeWidth="1.5" />
            <path d="M28 29L32 25L36 29" fill="#70C47F" stroke={COCOA} strokeWidth="1.4" />
          </g>
        );

      case 'warm_star_lights':
        return (
          <g>
            <path d="M10 22Q32 34 54 22" fill="none" stroke={COCOA} strokeWidth="2" strokeLinecap="round" />
            {[17, 32, 47].map((cx, i) => (
              <g key={i} transform={`translate(${cx}, ${i === 1 ? 30 : 27})`}>
                <path
                  d="M0 -7L2 -2L7 -2L3 1L4 6L0 3L-4 6L-3 1L-7 -2L-2 -2Z"
                  fill="#FFE36E"
                  stroke={COCOA}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </g>
            ))}
          </g>
        );

      case 'camp_lantern_lights':
        return (
          <g>
            <path d="M10 20Q32 30 54 20" fill="none" stroke={COCOA} strokeWidth="2" strokeLinecap="round" />
            {[18, 32, 46].map((cx, i) => (
              <g key={i} transform={`translate(${cx}, ${i === 1 ? 30 : 27})`}>
                <rect x="-4" y="-3" width="8" height="10" rx="3" fill="#FFD166" stroke={COCOA} strokeWidth="1.6" />
                <path d="M-5 -3H5" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />
              </g>
            ))}
          </g>
        );

      case 'wooden_welcome_sign':
        return (
          <g>
            <line x1="32" y1="34" x2="32" y2="52" stroke={COCOA} strokeWidth="3.5" strokeLinecap="round" />
            <rect x="12" y="18" width="40" height="20" rx="5" fill="#E3B382" stroke={COCOA} strokeWidth="2.2" />
            <path d="M19 28H45" stroke={COCOA} strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="16" cy="28" r="1.5" fill={COCOA} />
            <circle cx="48" cy="28" r="1.5" fill={COCOA} />
          </g>
        );

      case 'camp_trail_sign':
        return (
          <g>
            <line x1="32" y1="16" x2="32" y2="52" stroke={COCOA} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M14 20H44L50 25L44 30H14Z" fill="#D59E6A" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
            <path d="M50 33H20L14 38L20 43H50Z" fill="#9ED49C" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
          </g>
        );

      case 'toy_mini_tent':
        return (
          <g>
            <path d="M12 48L32 14L52 48Z" fill="#FFD480" stroke={COCOA} strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M24 48L32 28L40 48Z" fill="#7D5A4B" stroke={COCOA} strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M32 14L27 24H37Z" fill="#FF8FA8" stroke={COCOA} strokeWidth="1.6" strokeLinejoin="round" />
          </g>
        );

      case 'toy_puzzle_cube':
        return (
          <g>
            <rect x="16" y="18" width="32" height="32" rx="6" fill="#FFE17D" stroke={COCOA} strokeWidth="2.2" />
            <line x1="32" y1="18" x2="32" y2="50" stroke={COCOA} strokeWidth="1.8" />
            <line x1="16" y1="34" x2="48" y2="34" stroke={COCOA} strokeWidth="1.8" />
            <rect x="16" y="18" width="16" height="16" rx="4" fill="#FF9EB8" stroke={COCOA} strokeWidth="1.8" />
            <rect x="32" y="34" width="16" height="16" rx="4" fill="#8ED9BF" stroke={COCOA} strokeWidth="1.8" />
          </g>
        );

      case 'toy_mirror':
        return (
          <g>
            <path d="M22 50H42" stroke={COCOA} strokeWidth="3" strokeLinecap="round" />
            <line x1="32" y1="42" x2="32" y2="50" stroke={COCOA} strokeWidth="2.8" />
            <ellipse cx="32" cy="28" rx="14" ry="17" fill="#FFF0C2" stroke={COCOA} strokeWidth="2.2" />
            <ellipse cx="32" cy="28" rx="10" ry="13" fill="#DDF3FF" stroke={COCOA} strokeWidth="1.6" />
            <path d="M26 22L31 18M25 28L34 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'toy_frisbee':
        return (
          <g>
            <ellipse cx="32" cy="34" rx="22" ry="11" fill="#82C6FF" stroke={COCOA} strokeWidth="2.2" />
            <ellipse cx="32" cy="33" rx="15" ry="6.5" fill="#B5E0FF" stroke={COCOA} strokeWidth="1.6" />
            <ellipse cx="32" cy="32" rx="7" ry="2.8" fill="#FFE680" stroke={COCOA} strokeWidth="1.4" />
          </g>
        );

      case 'visitor_birdhouse_clock':
        return (
          <g>
            <path d="M 16 26 L 32 12 L 48 26 V 48 H 16 Z" fill="#FFF2D6" stroke={COCOA} strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 13 27 L 32 10 L 51 27" stroke="#6ABCE2" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="32" cy="34" r="9" fill="#FFFFFF" stroke={COCOA} strokeWidth="2" />
            <path d="M 32 34 V 29 M 32 34 L 36 36" stroke={COCOA} strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="21" r="3.5" fill="#8CE0FF" stroke={COCOA} strokeWidth="1.8" />
          </g>
        );

      case 'visitor_acorn_lamp':
        return (
          <g>
            <path d="M 24 52 H 40" stroke={COCOA} strokeWidth="3" strokeLinecap="round" />
            <line x1="32" y1="42" x2="32" y2="52" stroke={COCOA} strokeWidth="2.8" />
            <path d="M 20 28 C 20 40 26 44 32 44 C 38 44 44 40 44 28 Z" fill="#FFE699" stroke={COCOA} strokeWidth="2.2" />
            <path d="M 17 28 Q 32 14 47 28 Z" fill="#A65E2E" stroke={COCOA} strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="32" cy="14" r="2.2" fill={COCOA} />
          </g>
        );

      case 'visitor_carrot_sofa':
        return (
          <g>
            <ellipse cx="22" cy="20" rx="4" ry="8" fill="#FFFDF9" stroke={COCOA} strokeWidth="2" />
            <ellipse cx="42" cy="20" rx="4" ry="8" fill="#FFFDF9" stroke={COCOA} strokeWidth="2" />
            <rect x="12" y="25" width="40" height="22" rx="10" fill="#FFB38A" stroke={COCOA} strokeWidth="2.2" />
            <rect x="16" y="34" width="32" height="14" rx="7" fill="#FFE0CC" stroke={COCOA} strokeWidth="2" />
            <circle cx="24" cy="39" r="2" fill="#FF7A45" />
            <circle cx="40" cy="39" r="2" fill="#FF7A45" />
          </g>
        );

      case 'market_acorn_stall':
        return (
          <g>
            <line x1="16" y1="22" x2="16" y2="50" stroke={COCOA} strokeWidth="2.8" />
            <line x1="48" y1="22" x2="48" y2="50" stroke={COCOA} strokeWidth="2.8" />
            <rect x="14" y="36" width="36" height="14" rx="4" fill="#E3B382" stroke={COCOA} strokeWidth="2.2" />
            <path d="M10,24 L16,12 H48 L54,24 Z" fill="#FF8A9E" stroke={COCOA} strokeWidth="2.2" strokeLinejoin="round" />
            <rect x="25" y="13" width="14" height="10" fill="#FFF8EC" />
            <ellipse cx="32" cy="33" rx="6" ry="5" fill="#C47C3C" stroke={COCOA} strokeWidth="1.8" />
            <path d="M25,31 Q32,25 39,31 Z" fill="#7D4927" stroke={COCOA} strokeWidth="1.6" />
          </g>
        );

      case 'market_lantern_stand':
        return (
          <g>
            <path d="M22,52 H42" stroke={COCOA} strokeWidth="3" strokeLinecap="round" />
            <line x1="26" y1="14" x2="26" y2="52" stroke={COCOA} strokeWidth="3" strokeLinecap="round" />
            <path d="M26,16 H44" stroke={COCOA} strokeWidth="2.8" strokeLinecap="round" />
            <line x1="41" y1="16" x2="41" y2="23" stroke={COCOA} strokeWidth="2" />
            <ellipse cx="41" cy="31" rx="9" ry="10" fill="#FF9A5A" stroke={COCOA} strokeWidth="2.2" />
            <ellipse cx="41" cy="31" rx="4" ry="10" fill="none" stroke="#FFE699" strokeWidth="1.6" />
            <rect x="37" y="21" width="8" height="3" rx="1" fill={COCOA} />
            <rect x="37" y="40" width="8" height="3" rx="1" fill={COCOA} />
          </g>
        );

      case 'market_flower_cart':
        return (
          <g>
            <rect x="14" y="28" width="32" height="14" rx="5" fill="#DDA774" stroke={COCOA} strokeWidth="2.2" />
            <path d="M46,31 L54,24" stroke={COCOA} strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="22" cy="46" r="6" fill="#FFE6B3" stroke={COCOA} strokeWidth="2.2" />
            <circle cx="40" cy="46" r="6" fill="#FFE6B3" stroke={COCOA} strokeWidth="2.2" />
            <circle cx="22" cy="24" r="5" fill="#FF8EB0" stroke={COCOA} strokeWidth="1.8" />
            <circle cx="31" cy="21" r="5.5" fill="#FFE066" stroke={COCOA} strokeWidth="1.8" />
            <circle cx="40" cy="25" r="5" fill="#8CD9B0" stroke={COCOA} strokeWidth="1.8" />
          </g>
        );

      case 'collection_display_shelf':
        return (
          <g>
            <rect x="13" y="11" width="38" height="42" rx="6" fill="#E8B888" stroke={COCOA} strokeWidth="2.4" />
            <rect x="17" y="15" width="30" height="33" rx="3" fill="#FFF9F0" stroke={COCOA} strokeWidth="1.8" />
            <line x1="17" y1="26" x2="47" y2="26" stroke={COCOA} strokeWidth="2" />
            <line x1="17" y1="37" x2="47" y2="37" stroke={COCOA} strokeWidth="2" />
            <path d="M23,24 L25,18 H29 L31,24 Z" fill="#FFD166" stroke={COCOA} strokeWidth="1.4" />
            <circle cx="40" cy="21" r="3" fill="#FF8EB0" stroke={COCOA} strokeWidth="1.4" />
            <rect x="21" y="29" width="7" height="6" rx="2" fill="#8CD9B0" stroke={COCOA} strokeWidth="1.4" />
            <circle cx="38" cy="32" r="3.2" fill="#82E9FF" stroke={COCOA} strokeWidth="1.4" />
            <circle cx="25" cy="43" r="3" fill="#FFE066" stroke={COCOA} strokeWidth="1.4" />
            <rect x="34" y="40" width="9" height="6" rx="2" fill="#C9BDF2" stroke={COCOA} strokeWidth="1.4" />
          </g>
        );

      default: {
        const item = ROOM_ITEM_BY_ID[itemId];
        return (
          <g>
            <rect x="12" y="14" width="40" height="36" rx="10" fill="#FFF3DC" stroke={COCOA} strokeWidth="2" />
            <text
              x="32"
              y="38"
              textAnchor="middle"
              fontSize="22"
              dominantBaseline="middle"
            >
              {item?.emoji ?? '🪑'}
            </text>
          </g>
        );
      }
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {renderGraphic()}
    </svg>
  );
};
