import React from 'react';
import { IngredientId } from '../../types';
import type { TimeOfDayPeriod } from '../../utils/farmGrowth';

const COCOA = '#6B5344';

interface CropIllustrationProps {
  cropId: IngredientId;
  stage?: 'sprout' | 'growing' | 'mature';
  size?: number;
  className?: string;
}

export const CropIllustration: React.FC<CropIllustrationProps> = ({
  cropId,
  stage = 'mature',
  size = 44,
  className = '',
}) => {
  if (stage === 'sprout') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M16 50C18 44 25 42 32 42C39 42 46 44 48 50Z"
          fill="#A98260"
          stroke={COCOA}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M32 43C32 35 32 29 32 25"
          stroke="#4F9A66"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M32 28C24 26 17 20 19 14C24 12 31 18 32 28Z"
          fill="#8CE09C"
          stroke={COCOA}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M32 27C39 24 46 18 44 13C39 11 33 17 32 27Z"
          fill="#73CE86"
          stroke={COCOA}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="23" cy="17" r="1.4" fill="#E8FFF0" />
      </svg>
    );
  }

  if (stage === 'growing') {
    const budColor =
      cropId === 'strawberry'
        ? '#FFF7FA'
        : cropId === 'sunflower'
        ? '#FFE066'
        : cropId === 'moon_wheat'
        ? '#FFE885'
        : cropId === 'dream_cocoa'
        ? '#C27A54'
        : cropId === 'blueberry'
        ? '#9DB6F7'
        : cropId === 'pumpkin' || cropId === 'carrot'
        ? '#FFA85C'
        : cropId === 'corn'
        ? '#F9DC6D'
        : cropId === 'watermelon'
        ? '#FF7B8E'
        : cropId === 'apple'
        ? '#FF6B6B'
        : cropId === 'mushroom'
        ? '#E6B89C'
        : cropId === 'white_radish' || cropId === 'snowberry'
        ? '#F4F9FF'
        : '#9DF0BD';

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M14 52C17 45 24 43 32 43C40 43 47 45 50 52Z"
          fill="#A98260"
          stroke={COCOA}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M32 44C23 41 14 33 16 25C22 24 30 31 32 44Z"
          fill="#6FC782"
          stroke={COCOA}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M32 44C41 41 50 33 48 25C42 24 34 31 32 44Z"
          fill="#5DB972"
          stroke={COCOA}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M32 43V20" stroke="#4A8E5C" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M32 30C26 24 22 16 26 11C31 12 34 20 32 30Z"
          fill="#8CE09C"
          stroke={COCOA}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M32 30C38 24 42 16 38 11C33 12 30 20 32 30Z"
          fill="#78D28C"
          stroke={COCOA}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="17" r="5.5" fill={budColor} stroke={COCOA} strokeWidth="2.1" />
        <circle cx="30.5" cy="15.5" r="1.4" fill="#FFFFFF" opacity="0.8" />
      </svg>
    );
  }

  switch (cropId) {
    case 'carrot':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M32 21C27 14 21 9 18 12C17 15 24 20 32 21Z"
            fill="#7AD18C"
            stroke={COCOA}
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <path
            d="M32 21C32 12 31 6 34 6C37 6 36 14 32 21Z"
            fill="#61BD75"
            stroke={COCOA}
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <path
            d="M32 21C38 15 45 11 47 14C48 17 40 21 32 21Z"
            fill="#8DE09D"
            stroke={COCOA}
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <path
            d="M21 25C21 19 43 19 43 25C43 36 36 53 32 57C28 53 21 36 21 25Z"
            fill="#FF944D"
            stroke={COCOA}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M26 27C26 32 27.5 39 29.5 45"
            stroke="#FFC28A"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M35 28H40M33 36H38M31 44H35"
            stroke={COCOA}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'corn':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M30 11C28 7 25 6 23 8M32 10V5M34 11C36 7 39 6 41 8"
            stroke="#E2A44D"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <ellipse
            cx="32"
            cy="31"
            rx="11"
            ry="19"
            fill="#FFD65A"
            stroke={COCOA}
            strokeWidth="2.4"
          />
          <path
            d="M27 17V41M32 14V44M37 17V41M23 23H41M22 30H42M24 37H40"
            stroke="#D99B26"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M32 54C21 51 14 40 16 26C21 30 27 39 32 54Z"
            fill="#7ED68D"
            stroke={COCOA}
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <path
            d="M32 54C43 51 50 40 48 26C43 30 37 39 32 54Z"
            fill="#66C077"
            stroke={COCOA}
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'strawberry':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path d="M32 14V8" stroke="#539D68" strokeWidth="2.6" strokeLinecap="round" />
          <path
            d="M16 27C16 18 48 18 48 27C48 40 37 54 32 56C27 54 16 40 16 27Z"
            fill="#FF7496"
            stroke={COCOA}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M17 23C20 16 27 17 32 21C37 17 44 16 47 23C42 25 37 24 32 22C27 24 22 25 17 23Z"
            fill="#73CE86"
            stroke={COCOA}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <ellipse
            cx="23.5"
            cy="30"
            rx="2.3"
            ry="4.5"
            transform="rotate(-14 23.5 30)"
            fill="#FFB3C7"
          />
          <circle cx="31" cy="31" r="1.4" fill="#FFF7DF" />
          <circle cx="39" cy="30" r="1.4" fill="#FFF7DF" />
          <circle cx="27" cy="39" r="1.4" fill="#FFF7DF" />
          <circle cx="35" cy="39" r="1.4" fill="#FFF7DF" />
          <circle cx="31.5" cy="47" r="1.4" fill="#FFF7DF" />
        </svg>
      );

    case 'pumpkin':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M36 16C42 12 48 14 46 19C44 22 40 20 42 18"
            stroke="#59A66E"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M29 22L28 12C28 10 34 10 35 13L35 22Z"
            fill="#69B57D"
            stroke={COCOA}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <ellipse
            cx="22"
            cy="37"
            rx="12"
            ry="15"
            fill="#F28A38"
            stroke={COCOA}
            strokeWidth="2.3"
          />
          <ellipse
            cx="42"
            cy="37"
            rx="12"
            ry="15"
            fill="#F28A38"
            stroke={COCOA}
            strokeWidth="2.3"
          />
          <ellipse
            cx="32"
            cy="37"
            rx="11.5"
            ry="16.5"
            fill="#FFA44E"
            stroke={COCOA}
            strokeWidth="2.3"
          />
          <path
            d="M26 26C25 29 25 32 25.5 34"
            stroke="#FFD09E"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          {/* Cute Storybook Face */}
          <circle cx="27.5" cy="36" r="1.7" fill={COCOA} />
          <circle cx="36.5" cy="36" r="1.7" fill={COCOA} />
          <ellipse cx="25" cy="39" rx="2.1" ry="1.2" fill="#FF847A" opacity="0.65" />
          <ellipse cx="39" cy="39" rx="2.1" ry="1.2" fill="#FF847A" opacity="0.65" />
          <path
            d="M29.8 39Q32 41.5 34.2 39"
            stroke={COCOA}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'blueberry':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M30 22C22 14 14 14 13 20C16 25 23 26 30 22Z"
            fill="#7AD18C"
            stroke={COCOA}
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <path
            d="M34 22C42 14 50 14 51 20C48 25 41 26 34 22Z"
            fill="#63BC77"
            stroke={COCOA}
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="28" r="10.5" fill="#6F8BE0" stroke={COCOA} strokeWidth="2.2" />
          <path d="M29 19L32 21L35 19" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="22" cy="40" r="11.5" fill="#5D78D1" stroke={COCOA} strokeWidth="2.3" />
          <circle cx="41" cy="40" r="11.5" fill="#7894E8" stroke={COCOA} strokeWidth="2.3" />
          <path d="M19 32L22 34L25 32" stroke={COCOA} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M38 32L41 34L44 32" stroke={COCOA} strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="18" cy="39" r="2.1" fill="#C7D6FF" />
          <circle cx="37" cy="39" r="2.1" fill="#D5E1FF" />
        </svg>
      );

    case 'mint':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path d="M32 54V26" stroke="#468F66" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M32 44C20 44 11 36 13 27C20 26 28 32 32 44Z"
            fill="#6AD4A4"
            stroke={COCOA}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M32 44C44 44 53 36 51 27C44 26 36 32 32 44Z"
            fill="#56C291"
            stroke={COCOA}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M32 32C24 27 19 17 24 11C30 12 34 20 32 32Z"
            fill="#88E4BA"
            stroke={COCOA}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M32 32C40 27 45 17 40 11C34 12 30 20 32 32Z"
            fill="#73D9AB"
            stroke={COCOA}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M18 32L27 38M46 32L37 38"
            stroke="#E2FFF2"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="26" cy="18" r="1.8" fill="#FFFFFF" opacity="0.9" />
        </svg>
      );

    case 'sunflower':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path d="M32 36V56" stroke="#4D9464" strokeWidth="3.4" strokeLinecap="round" />
          <path
            d="M32 49C24 47 18 42 20 37C25 37 30 41 32 49Z"
            fill="#77CF88"
            stroke={COCOA}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M32 49C40 47 46 42 44 37C39 37 34 41 32 49Z"
            fill="#63BC75"
            stroke={COCOA}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
            <ellipse
              key={deg}
              cx="32"
              cy="12"
              rx="4.6"
              ry="8.5"
              transform={`rotate(${deg} 32 25)`}
              fill="#FFD54F"
              stroke={COCOA}
              strokeWidth="1.8"
            />
          ))}
          <circle cx="32" cy="25" r="9.5" fill="#8C5D42" stroke={COCOA} strokeWidth="2.2" />
          <circle cx="29" cy="23.5" r="1.2" fill="#FFF7DF" />
          <circle cx="35" cy="23.5" r="1.2" fill="#FFF7DF" />
          <path
            d="M29.5 27Q32 29.2 34.5 27"
            stroke="#FFF7DF"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'moon_wheat':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          {/* Moonlight Crescent Accent */}
          <path
            d="M15 11C11.5 11.8 9.8 15.2 11 18.6C12.2 21.8 15.8 23.2 19 21.8C16.2 21.5 14.3 19.3 14.3 16.5C14.3 14.1 15.5 12 17.6 11.1C16.7 10.9 15.8 10.8 15 11Z"
            fill="#FFF099"
            stroke={COCOA}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="49" cy="14" r="1.8" fill="#FFF3AA" stroke={COCOA} strokeWidth="1" />
          {/* Wheat Stalks */}
          <path d="M26 53L22 20M32 54V13M38 53L42 20" stroke="#D69C38" strokeWidth="2.6" strokeLinecap="round" />
          {/* Left Stalk Grains */}
          <ellipse cx="19" cy="25" rx="3.4" ry="5.5" transform="rotate(-24 19 25)" fill="#F9D569" stroke={COCOA} strokeWidth="1.8" />
          <ellipse cx="24" cy="29" rx="3.4" ry="5.2" transform="rotate(14 24 29)" fill="#F3C54D" stroke={COCOA} strokeWidth="1.8" />
          <ellipse cx="20" cy="34" rx="3.2" ry="5" transform="rotate(-18 20 34)" fill="#F9D569" stroke={COCOA} strokeWidth="1.8" />
          {/* Center Stalk Grains */}
          <ellipse cx="32" cy="14" rx="3.6" ry="6" fill="#FFE07D" stroke={COCOA} strokeWidth="1.8" />
          <ellipse cx="28" cy="21" rx="3.4" ry="5.2" transform="rotate(-18 28 21)" fill="#F9D569" stroke={COCOA} strokeWidth="1.8" />
          <ellipse cx="36" cy="21" rx="3.4" ry="5.2" transform="rotate(18 36 21)" fill="#F3C54D" stroke={COCOA} strokeWidth="1.8" />
          <ellipse cx="29" cy="30" rx="3.2" ry="5" transform="rotate(-15 29 30)" fill="#FFE07D" stroke={COCOA} strokeWidth="1.8" />
          <ellipse cx="35" cy="30" rx="3.2" ry="5" transform="rotate(15 35 30)" fill="#F9D569" stroke={COCOA} strokeWidth="1.8" />
          {/* Right Stalk Grains */}
          <ellipse cx="45" cy="25" rx="3.4" ry="5.5" transform="rotate(24 45 25)" fill="#F9D569" stroke={COCOA} strokeWidth="1.8" />
          <ellipse cx="40" cy="29" rx="3.4" ry="5.2" transform="rotate(-14 40 29)" fill="#F3C54D" stroke={COCOA} strokeWidth="1.8" />
          <ellipse cx="44" cy="34" rx="3.2" ry="5" transform="rotate(18 44 34)" fill="#FFE07D" stroke={COCOA} strokeWidth="1.8" />
          {/* Cute Cream-Mint Ribbon Tie */}
          <path d="M25 46Q32 49 39 46L37 51Q32 53 27 51Z" fill="#7CD4B2" stroke={COCOA} strokeWidth="1.9" strokeLinejoin="round" />
          <circle cx="32" cy="48.5" r="2.6" fill="#A6EBD0" stroke={COCOA} strokeWidth="1.5" />
        </svg>
      );

    case 'dream_cocoa':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          {/* Leaves */}
          <path
            d="M31 20C22 12 13 12 12 19C16 24 23 25 31 20Z"
            fill="#73CE86"
            stroke={COCOA}
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <path
            d="M34 20C43 12 52 12 53 19C49 24 42 25 34 20Z"
            fill="#5EBA72"
            stroke={COCOA}
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          {/* Stem */}
          <path d="M32 18V11" stroke={COCOA} strokeWidth="2.6" strokeLinecap="round" />
          {/* Main Ribbed Cocoa Pod */}
          <path
            d="M32 18C42 18 48 27 46 39C44 48 37 55 32 56C27 55 20 48 18 39C16 27 22 18 32 18Z"
            fill="#A66041"
            stroke={COCOA}
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          {/* Cocoa Pod Highlight & Ribs */}
          <path
            d="M27 20C23 27 23 42 29 53M37 20C41 27 41 42 35 53"
            stroke="#7F4329"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M24 28C23.5 32 24 37 25 40"
            stroke="#D69473"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Two Cute Front Cocoa Beans */}
          <ellipse
            cx="23"
            cy="49"
            rx="6"
            ry="4.2"
            transform="rotate(-16 23 49)"
            fill="#7D442B"
            stroke={COCOA}
            strokeWidth="1.9"
          />
          <ellipse
            cx="41"
            cy="49"
            rx="6"
            ry="4.2"
            transform="rotate(16 41 49)"
            fill="#8F5136"
            stroke={COCOA}
            strokeWidth="1.9"
          />
          {/* Tiny Star Accent */}
          <circle cx="49" cy="29" r="2" fill="#FFE680" stroke={COCOA} strokeWidth="1" />
        </svg>
      );

    case 'watermelon':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M32 15C35 10 41 9 43 13" stroke="#4D9464" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="32" cy="35" r="20" fill="#4EB86E" stroke={COCOA} strokeWidth="2.4" />
          <path d="M23 17C20 26 20 44 23 53M32 15V55M41 17C44 26 44 44 41 53" stroke="#2D7845" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="22" cy="25" rx="3" ry="5" transform="rotate(-18 22 25)" fill="#A9F0BE" opacity="0.7" />
        </svg>
      );

    case 'apple':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M32 18V10" stroke={COCOA} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M33 14C39 9 47 10 47 16C42 19 36 18 33 14Z" fill="#77CF88" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 20C23 16 14 23 15 36C16 48 24 55 30 53C31 52.5 33 52.5 34 53C40 55 48 48 49 36C50 23 41 16 32 20Z" fill="#FF5E6C" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" />
          <ellipse cx="23" cy="29" rx="2.8" ry="5.5" transform="rotate(-14 23 29)" fill="#FFB3BC" opacity="0.8" />
        </svg>
      );

    case 'mushroom':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M24 36H40L42 54C42 56 22 56 22 54L24 36Z" fill="#FFF3DC" stroke={COCOA} strokeWidth="2.3" strokeLinejoin="round" />
          <path d="M11 37C11 19 22 12 32 12C42 12 53 19 53 37C42 39 22 39 11 37Z" fill="#E87A54" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="24" cy="24" r="3.8" fill="#FFF5DF" />
          <circle cx="39" cy="22" r="3.2" fill="#FFF5DF" />
          <circle cx="33" cy="31" r="2.8" fill="#FFF5DF" />
        </svg>
      );

    case 'white_radish':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M32 21C25 14 20 9 18 13C19 17 25 21 32 21Z" fill="#7CD490" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 21C32 11 32 6 35 6C38 7 35 15 32 21Z" fill="#63BC75" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 21C39 14 45 10 47 14C46 18 39 21 32 21Z" fill="#8AE09D" stroke={COCOA} strokeWidth="2" strokeLinejoin="round" />
          <path d="M22 25C22 19 42 19 42 25C42 38 35 53 32 56C29 53 22 38 22 25Z" fill="#FAFBFD" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M27 29V42" stroke="#DCE6F2" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );

    case 'winter_greens':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M20 50C14 38 14 20 24 14C30 18 31 32 28 50Z" fill="#77D48C" stroke={COCOA} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M44 50C50 38 50 20 40 14C34 18 33 32 36 50Z" fill="#5DBA72" stroke={COCOA} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M24 52C22 36 25 14 32 10C39 14 42 36 40 52Z" fill="#92E6A4" stroke={COCOA} strokeWidth="2.3" strokeLinejoin="round" />
          <path d="M27 52H37" stroke="#F4FAF0" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'snowberry':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M31 21C22 14 14 14 13 20C17 25 23 25 31 21Z" fill="#7BC9B8" stroke={COCOA} strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M33 21C42 14 50 14 51 20C47 25 41 25 33 21Z" fill="#63B4A3" stroke={COCOA} strokeWidth="2.1" strokeLinejoin="round" />
          <circle cx="32" cy="28" r="10.5" fill="#EBF6FF" stroke={COCOA} strokeWidth="2.2" />
          <circle cx="22" cy="40" r="11.5" fill="#D4EAFF" stroke={COCOA} strokeWidth="2.3" />
          <circle cx="42" cy="40" r="11.5" fill="#F4FAFF" stroke={COCOA} strokeWidth="2.3" />
          <circle cx="28" cy="26" r="2" fill="#FFFFFF" />
          <circle cx="19" cy="38" r="2.2" fill="#FFFFFF" />
          <circle cx="39" cy="38" r="2.2" fill="#FFFFFF" />
        </svg>
      );
  }
};

/* Top-Right Twin-Leaf Sprout Badge Matching Reference Artwork (Bare Leaves Without Circle) */
export const SeedSproutBadge: React.FC = () => (
  <svg width="26" height="24" viewBox="0 0 28 26" fill="none" aria-hidden="true">
    <path
      d="M14 23C14 18 14 15 14 13"
      stroke="#5A9A6B"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M14 17C8 17 3 12 4 6C9 5 14 10 14 17Z"
      fill="#8EE0A2"
      stroke={COCOA}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M14 16C19 14 24 9 23 3C18 3 14 9 14 16Z"
      fill="#6CC985"
      stroke={COCOA}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M7.5 9.5L12 13.5" stroke="#DFFAE7" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* Full Upper Sky + Flanking Trees + Rolling Hills + Right Red Barn Backdrop */
export const PastoralHorizonBackdrop: React.FC<{ timeOfDay?: TimeOfDayPeriod }> = ({
  timeOfDay = 'day',
}) => {
  const skyTop =
    timeOfDay === 'morning'
      ? '#FCE2C7'
      : timeOfDay === 'night'
      ? '#495488'
      : '#D8F0F6';
  const skyMid =
    timeOfDay === 'morning'
      ? '#FFF3DF'
      : timeOfDay === 'night'
      ? '#6D73A6'
      : '#ECFAEE';
  const skyBot =
    timeOfDay === 'morning'
      ? '#D9EFC6'
      : timeOfDay === 'night'
      ? '#88A692'
      : '#D3EBC4';

  return (
    <svg
      viewBox="0 0 400 330"
      preserveAspectRatio="none"
      className="pointer-events-none w-full h-full block"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="farmPastoralSkyRef" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="55%" stopColor={skyMid} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id="farmMeadowSlopeRef" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B8DC80" />
          <stop offset="100%" stopColor="#CBE494" />
        </linearGradient>
      </defs>

      {/* Pastel Sky */}
      <rect x="0" y="0" width="400" height="330" fill="url(#farmPastoralSkyRef)" />

      {/* Night Stars & Crescent Moon */}
      {timeOfDay === 'night' && (
        <g opacity="0.88">
          <circle cx="96" cy="36" r="1.6" fill="#FFF7CC" />
          <circle cx="152" cy="24" r="1.3" fill="#FFF7CC" />
          <circle cx="238" cy="32" r="1.8" fill="#FFF7CC" />
          <circle cx="282" cy="22" r="1.4" fill="#FFF7CC" />
          <path
            d="M358 26C353 27 350 32 351 37C352 42 357 45 362 44C357 46 351 43 349 38C347 32 351 26 358 26Z"
            fill="#FFEFA6"
          />
        </g>
      )}

      {/* Soft Clouds */}
      <path
        d="M28 56C28 48 35 43 43 44C47 38 57 37 63 42C70 42 75 48 74 56H28Z"
        fill="#FFFFFF"
        opacity={timeOfDay === 'night' ? '0.32' : '0.82'}
      />
      <path
        d="M312 70C312 63 318 59 325 60C328 55 337 55 341 59C347 59 351 64 350 70H312Z"
        fill="#FFFFFF"
        opacity={timeOfDay === 'night' ? '0.32' : '0.82'}
      />

    {/* Distant Soft Hills Behind Bulletin Board */}
    <path d="M0 198Q110 158 225 186T400 176V330H0Z" fill="#D5ECC5" />

    {/* Left Fluffy Tree Silhouettes Flanking the Bulletin Board */}
    <g>
      <path d="M18 265V220M44 265V232" stroke="#9B7557" strokeWidth="6" strokeLinecap="round" />
      <circle cx="14" cy="186" r="24" fill="#9CC47C" stroke={COCOA} strokeWidth="1.6" />
      <circle cx="38" cy="176" r="21" fill="#A9CF86" stroke={COCOA} strokeWidth="1.6" />
      <circle cx="24" cy="204" r="20" fill="#8FB86F" stroke={COCOA} strokeWidth="1.6" />
      <circle cx="48" cy="212" r="18" fill="#A4CA82" stroke={COCOA} strokeWidth="1.6" />
      <circle cx="6" cy="222" r="20" fill="#94BE76" stroke={COCOA} strokeWidth="1.6" />
    </g>

    {/* Right Fluffy Tree Silhouettes */}
    <g>
      <circle cx="388" cy="176" r="22" fill="#98C077" stroke={COCOA} strokeWidth="1.6" />
      <circle cx="368" cy="186" r="19" fill="#A7CD85" stroke={COCOA} strokeWidth="1.6" />
      <circle cx="394" cy="208" r="21" fill="#8DB76E" stroke={COCOA} strokeWidth="1.6" />
    </g>

    {/* Cute Right-Side Red & Cream Barn Tucked Behind Fence & Lower-Right Board */}
    <g transform="translate(274, 182)">
      {/* Cream Front Barn Wall */}
      <path
        d="M8 38L44 10L80 38V92H8V38Z"
        fill="#F6ECD9"
        stroke={COCOA}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Red Barn Roof & Right Side Extension */}
      <path
        d="M80 42L122 46V92H80V42Z"
        fill="#E07D77"
        stroke={COCOA}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M44 10L100 14L126 46L80 42L44 10Z"
        fill="#CE6D68"
        stroke={COCOA}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M4 40L44 9L83 40"
        fill="none"
        stroke="#FBF4E6"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 40L44 9L83 40"
        fill="none"
        stroke={COCOA}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Loft Window */}
      <rect
        x="36"
        y="30"
        width="16"
        height="14"
        rx="2"
        fill="#FFF8EC"
        stroke={COCOA}
        strokeWidth="1.6"
      />
      <line x1="44" y1="30" x2="44" y2="44" stroke={COCOA} strokeWidth="1.3" />
      <line x1="36" y1="37" x2="52" y2="37" stroke={COCOA} strokeWidth="1.3" />
      {/* Double Cross Barn Door */}
      <rect
        x="26"
        y="55"
        width="36"
        height="34"
        rx="2"
        fill="#E5B78A"
        stroke={COCOA}
        strokeWidth="1.8"
      />
      <line x1="44" y1="55" x2="44" y2="89" stroke={COCOA} strokeWidth="1.6" />
      <line x1="26" y1="55" x2="44" y2="89" stroke="#FFF8EC" strokeWidth="2.2" />
      <line x1="44" y1="55" x2="26" y2="89" stroke="#FFF8EC" strokeWidth="2.2" />
      <line x1="44" y1="55" x2="62" y2="89" stroke="#FFF8EC" strokeWidth="2.2" />
      <line x1="62" y1="55" x2="44" y2="89" stroke="#FFF8EC" strokeWidth="2.2" />
    </g>

    {/* Mini Distant Fence Behind Meadow Horizon */}
    <g opacity="0.9">
      <rect x="200" y="255" width="90" height="5" fill="#D5A678" stroke={COCOA} strokeWidth="1.3" />
      {[208, 224, 240, 256, 272].map((x) => (
        <rect
          key={x}
          x={x}
          y="246"
          width="7"
          height="22"
          rx="3"
          fill="#E4BA8E"
          stroke={COCOA}
          strokeWidth="1.3"
        />
      ))}
    </g>

    {/* Lush Rolling Meadow Foreground Transition */}
    <path d="M0 264Q120 242 245 262T400 268V330H0Z" fill="url(#farmMeadowSlopeRef)" />
    <path
      d="M0 264Q120 242 245 262T400 268"
      fill="none"
      stroke="#96BA68"
      strokeWidth="1.6"
      opacity="0.7"
    />
  </svg>
  );
};

/* Hand-Drawn Organic Lumpy 3D Soil Bed SVG (#C6A484) */
export const SoilBedBackdropSvg: React.FC<{ isReady?: boolean; isGolden?: boolean }> = ({
  isReady = false,
  isGolden = false,
}) => (
  <svg
    viewBox="0 0 220 148"
    preserveAspectRatio="none"
    className="pointer-events-none absolute inset-0 w-full h-full"
    aria-hidden="true"
  >
    {/* Golden Aura Shadow Behind Golden Plot */}
    {isGolden && (
      <ellipse
        cx="110"
        cy="76"
        rx="105"
        ry="68"
        fill="rgba(255, 217, 74, 0.34)"
      />
    )}

    {/* Soft Meadow Drop Shadow */}
    <ellipse cx="110" cy="136" rx="96" ry="10" fill="rgba(96, 128, 56, 0.28)" />

    {/* 3D Lower Soil Mound Skirt (Thickness) */}
    <path
      d="M14 82C11 104 12 124 28 131C48 138 78 136 110 137C142 136 172 138 192 131C208 124 209 104 206 82Z"
      fill="#A47E5B"
      stroke={COCOA}
      strokeWidth="2.8"
      strokeLinejoin="round"
    />

    {/* Fluffy Lumpy Outer Dirt Ridge (#C6A484) */}
    <path
      d="M22 25C36 16 56 20 72 17C90 14 110 19 128 16C146 14 166 20 184 18C199 17 210 30 207 48C211 66 208 86 204 104C201 120 186 127 166 126C146 125 128 128 110 127C92 128 74 125 54 126C34 127 19 120 16 104C12 86 9 66 13 48C10 35 14 29 22 25Z"
      fill={isGolden ? '#DFBA88' : isReady ? '#CFA986' : '#C6A484'}
      stroke={isGolden ? '#B67B1E' : COCOA}
      strokeWidth="2.8"
      strokeLinejoin="round"
    />

    {/* Warm Top Ridge Highlights */}
    <path
      d="M32 25C48 20 66 23 84 21M134 21C154 19 172 23 188 23"
      stroke={isGolden ? '#FFF0B3' : '#DFC1A3'}
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.8"
    />

    {/* Sunken Inner Soil Furrow Bed */}
    <path
      d="M30 37C55 31 85 34 110 33C135 34 165 31 190 37C196 54 196 84 188 106C166 113 136 111 110 112C84 111 54 113 32 106C24 84 24 54 30 37Z"
      fill="#CEA986"
      stroke="#96704E"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Soft Hand-Drawn Soil Clods & Furrow Lines */}
    <path
      d="M42 52Q74 47 104 52M118 52Q150 47 180 52M40 94Q75 99 112 95M122 95Q156 99 182 94"
      stroke="#AD8460"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.55"
    />
    <circle cx="48" cy="117" r="2.5" fill="#9E7654" opacity="0.65" />
    <circle cx="172" cy="116" r="2.2" fill="#9E7654" opacity="0.65" />
    <circle cx="158" cy="27" r="2" fill="#9E7654" opacity="0.55" />
  </svg>
);

/* Mini Watering Can + Droplet Icon for Plot Watering Button */
export const WateringButtonIconSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <path d="M18 9C22 8 23 15 18 17" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M9 13L3 8L2 10L8 16Z"
      fill="#7ED6F4"
      stroke={COCOA}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <rect
      x="8"
      y="9"
      width="11"
      height="11"
      rx="3.5"
      fill="#8EE0FA"
      stroke={COCOA}
      strokeWidth="1.6"
    />
    <path
      d="M3.5 16.5C3.5 16.5 1.8 18.8 1.8 20.1C1.8 21 2.6 21.8 3.5 21.8C4.4 21.8 5.2 21 5.2 20.1C5.2 18.8 3.5 16.5 3.5 16.5Z"
      fill="#59C4EE"
      stroke={COCOA}
      strokeWidth="1.2"
    />
  </svg>
);

/* Pouring Water + Floating Hearts Overlay on Plot After Watering */
export const WateringPourOverlaySvg: React.FC<{ boostLabel?: string }> = ({
  boostLabel = '-5秒!',
}) => (
  <div
    className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 z-30 flex flex-col items-center justify-start overflow-visible"
    aria-hidden="true"
  >
    {/* Pouring Watering Can + Droplet Stream */}
    <div className="animate-water-pour flex flex-col items-center">
      <svg width="64" height="58" viewBox="0 0 72 64" fill="none">
        {/* Tilted Watering Can */}
        <g transform="translate(26, 2) rotate(-28)">
          <path d="M24 10C30 9 31 18 24 20" stroke={COCOA} strokeWidth="2" strokeLinecap="round" />
          <path
            d="M10 15L2 9L0 12L9 19Z"
            fill="#84D8F5"
            stroke={COCOA}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <rect
            x="9"
            y="9"
            width="16"
            height="16"
            rx="4.5"
            fill="#A6E6FA"
            stroke={COCOA}
            strokeWidth="1.8"
          />
        </g>
        {/* Falling Water Droplets */}
        <path
          d="M20 28C20 28 17 33 17 35C17 36.7 18.3 38 20 38C21.7 38 23 36.7 23 35C23 33 20 28 20 28Z"
          fill="#62CAEE"
          stroke={COCOA}
          strokeWidth="1.3"
        />
        <path
          d="M31 36C31 36 28 41 28 43C28 44.7 29.3 46 31 46C32.7 46 34 44.7 34 43C34 41 31 36 31 36Z"
          fill="#80DAF7"
          stroke={COCOA}
          strokeWidth="1.3"
        />
        <path
          d="M22 46C22 46 19.5 50 19.5 51.8C19.5 53.2 20.6 54.3 22 54.3C23.4 54.3 24.5 53.2 24.5 51.8C24.5 50 22 46 22 46Z"
          fill="#62CAEE"
          stroke={COCOA}
          strokeWidth="1.3"
        />
      </svg>
    </div>

    {/* Floating Hearts */}
    <div className="animate-float-up -mt-4 flex items-center gap-1.5 rounded-full bg-[#FFF0F5]/95 border-2 border-[#6B5344] px-2.5 py-0.5 text-[11px] font-extrabold text-[#D64470] shadow-xs">
      <span>💕</span>
      <span>{boostLabel}</span>
    </div>
  </div>
);

/* Golden Halo & Starburst Aura Behind Giant Golden Mutated Crop */
export const GoldenAuraSvg: React.FC = () => (
  <svg
    width="86"
    height="86"
    viewBox="0 0 96 96"
    fill="none"
    className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 animate-golden-glow"
    aria-hidden="true"
  >
    <circle cx="48" cy="48" r="34" fill="#FFE678" opacity="0.45" />
    <circle cx="48" cy="48" r="24" fill="#FFF2A6" opacity="0.7" />
    {/* Sparkle Stars */}
    <path
      d="M16 24L18.2 29.8L24 32L18.2 34.2L16 40L13.8 34.2L8 32L13.8 29.8Z"
      fill="#FFD54F"
      stroke={COCOA}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M80 18L81.8 22.2L86 24L81.8 25.8L80 30L78.2 25.8L74 24L78.2 22.2Z"
      fill="#FFE066"
      stroke={COCOA}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M78 62L79.5 65.5L83 67L79.5 68.5L78 72L76.5 68.5L73 67L76.5 65.5Z"
      fill="#FFD54F"
      stroke={COCOA}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

/* Tilted Top-Left Wooden Plot Sign Stake */
export const WoodenPlotSignSvg: React.FC<{ label: string }> = ({ label }) => (
  <div className="pointer-events-none relative flex flex-col items-center -rotate-6 select-none">
    <div className="relative rounded-[9px] bg-gradient-to-b from-[#EAC192] to-[#D8A570] border-[2.2px] border-[#6B5344] px-2.5 py-0.5 shadow-[0_2px_0_#A67A50]">
      {/* Subtle Wood Grain */}
      <span
        className="block absolute inset-x-2 top-1.5 h-[1.5px] rounded-full bg-[#B98656]/45"
        aria-hidden="true"
      />
      <span className="relative text-[11px] font-extrabold text-[#533827] tracking-tight whitespace-nowrap">
        {label}
      </span>
    </div>
    <div className="w-2.5 h-3 bg-[#C89362] border-x-[2.2px] border-b-[2.2px] border-[#6B5344] rounded-b-sm -mt-0.5" />
  </div>
);

/* Left & Right Side Picket Wooden Fences + Wildflowers */
export const FarmSideFenceSvg: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <svg
    width="34"
    height="136"
    viewBox="0 0 34 136"
    fill="none"
    className={`pointer-events-none select-none ${side === 'right' ? '-scale-x-100' : ''}`}
    aria-hidden="true"
  >
    {/* Horizontal Wooden Rails */}
    <path d="M0 34L28 24V32L0 42Z" fill="#CCA072" stroke={COCOA} strokeWidth="1.7" />
    <path d="M0 78L28 68V76L0 86Z" fill="#C49668" stroke={COCOA} strokeWidth="1.7" />
    {/* Rounded Wooden Posts */}
    {[
      { x: 2, y: 18, h: 86 },
      { x: 16, y: 12, h: 84 },
    ].map((p, idx) => (
      <g key={idx}>
        <rect
          x={p.x}
          y={p.y}
          width="11"
          height={p.h}
          rx="5.5"
          fill="#E2B88B"
          stroke={COCOA}
          strokeWidth="1.8"
        />
        <circle cx={p.x + 5.5} cy={p.y + 18} r="1.4" fill="#B58458" />
        <circle cx={p.x + 5.5} cy={p.y + 62} r="1.4" fill="#B58458" />
      </g>
    ))}
    {/* Flower Cluster at Fence Base */}
    <path
      d="M5 110Q2 100 7 98M12 112Q13 101 18 100M21 112Q25 103 28 102"
      stroke="#6BA35A"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <g transform="translate(10, 98)">
      <circle cx="0" cy="-3" r="2.6" fill="#EE9EE0" />
      <circle cx="3" cy="0" r="2.6" fill="#F5B8EB" />
      <circle cx="0" cy="3" r="2.6" fill="#EE9EE0" />
      <circle cx="-3" cy="0" r="2.6" fill="#F5B8EB" />
      <circle cx="0" cy="0" r="1.7" fill="#FFE67D" />
    </g>
    <g transform="translate(23, 104)">
      <circle cx="0" cy="-2.4" r="2.2" fill="#FFE785" />
      <circle cx="2.4" cy="0" r="2.2" fill="#FFF0A8" />
      <circle cx="0" cy="2.4" r="2.2" fill="#FFE785" />
      <circle cx="-2.4" cy="0" r="2.2" fill="#FFF0A8" />
      <circle cx="0" cy="0" r="1.4" fill="#F79EC2" />
    </g>
  </svg>
);

/* Cute Left Small Watering Cup Standing Near Left Fence */
export const LeftMiniWateringCanSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="50"
    height="38"
    viewBox="0 0 56 44"
    fill="none"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    <ellipse cx="32" cy="38" rx="14" ry="3.5" fill="rgba(96,128,56,0.22)" />
    {/* Spout pointing left */}
    <path
      d="M23 26L10 15L7 18L21 32Z"
      fill="#9BC8D4"
      stroke={COCOA}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <ellipse
      cx="8"
      cy="16"
      rx="2.6"
      ry="4"
      transform="rotate(38 8 16)"
      fill="#C5E2EB"
      stroke={COCOA}
      strokeWidth="1.6"
    />
    {/* Handle */}
    <path
      d="M41 18C48 16 49 28 41 31"
      fill="none"
      stroke={COCOA}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Can Body */}
    <rect
      x="22"
      y="16"
      width="20"
      height="20"
      rx="5"
      fill="#A8D4E0"
      stroke={COCOA}
      strokeWidth="1.9"
    />
    <ellipse cx="32" cy="16" rx="8" ry="2.6" fill="#CEE9F2" stroke={COCOA} strokeWidth="1.6" />
  </svg>
);

/* Right-Side Cute Larger Watering Can */
export const RightWateringCanSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="62"
    height="48"
    viewBox="0 0 70 54"
    fill="none"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    <ellipse cx="40" cy="48" rx="18" ry="4" fill="rgba(96,128,56,0.24)" />
    {/* Top & Side Curved Handle */}
    <path
      d="M32 16C34 5 54 6 56 22C58 32 52 38 48 39"
      fill="none"
      stroke="#B2C7CE"
      strokeWidth="4.2"
      strokeLinecap="round"
    />
    <path
      d="M32 16C34 5 54 6 56 22C58 32 52 38 48 39"
      fill="none"
      stroke={COCOA}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    {/* Spout Pointing Left */}
    <path
      d="M28 36L11 22L8 25L26 42Z"
      fill="#B8CED6"
      stroke={COCOA}
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <ellipse
      cx="9"
      cy="23"
      rx="3"
      ry="4.8"
      transform="rotate(38 9 23)"
      fill="#DFEDF2"
      stroke={COCOA}
      strokeWidth="1.7"
    />
    {/* Body */}
    <path
      d="M27 18H49L51 45C51 47 25 47 25 45L27 18Z"
      fill="#C9DCE3"
      stroke={COCOA}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <ellipse cx="38" cy="18" rx="10" ry="3.2" fill="#E6F1F5" stroke={COCOA} strokeWidth="1.8" />
    {/* Cute Heart Accent */}
    <path
      d="M38 37C35.2 34.8 33.5 32.6 33.5 30.8C33.5 29.4 34.6 28.4 35.9 28.4C36.9 28.4 37.6 29 38 29.8C38.4 29 39.1 28.4 40.1 28.4C41.4 28.4 42.5 29.4 42.5 30.8C42.5 32.6 40.8 34.8 38 37Z"
      fill="#FF8EB0"
    />
  </svg>
);

/* Bottom-Left Garden Trowel & Hand Fork on Meadow */
export const BottomLeftGardenToolsSvg: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    width="64"
    height="44"
    viewBox="0 0 74 52"
    fill="none"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    {/* Hand Trowel */}
    <g transform="translate(8, 12) rotate(-42)">
      <rect x="6" y="0" width="6" height="16" rx="3" fill="#D9945C" stroke={COCOA} strokeWidth="1.7" />
      <rect x="7.8" y="16" width="2.4" height="6" fill="#AAB9C2" stroke={COCOA} strokeWidth="1.4" />
      <path
        d="M4 21H14L12.5 33C11.5 37 6.5 37 5.5 33L4 21Z"
        fill="#CBD9E0"
        stroke={COCOA}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </g>
    {/* Mini 3-Prong Cultivator Fork */}
    <g transform="translate(36, 16) rotate(-32)">
      <rect x="7" y="0" width="5.5" height="15" rx="2.7" fill="#D9945C" stroke={COCOA} strokeWidth="1.7" />
      <path d="M9.8 15V22" stroke={COCOA} strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M4 22H15.5M4.5 22V32M9.8 22V33M15 22V32"
        stroke="#8F9DA6"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

interface FarmBottomFenceSceneProps {
  puppyHasTreasure?: boolean;
  puppyHappy?: boolean;
  puppyRewardText?: string | null;
  onClickPuppy?: () => void;
}

/* Bottom Fence Split Left & Right + Wildflowers + Interactive Treasure Puppy */
export const FarmBottomFenceScene: React.FC<FarmBottomFenceSceneProps> = ({
  puppyHasTreasure = false,
  puppyHappy = false,
  puppyRewardText = null,
  onClickPuppy,
}) => (
  <div className="relative w-full pt-8 pb-0 overflow-visible select-none">
    {/* Interactive Puppy Floating Speech Bubble / Reward Toast */}
    {puppyRewardText && (
      <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-30 animate-float-up whitespace-nowrap rounded-full bg-[#FFF7D6] border-2 border-[#6B5344] px-3 py-1 text-xs font-extrabold text-[#7B4B12] shadow-sm">
        🐶 {puppyRewardText}
      </div>
    )}

    <svg
      viewBox="0 0 380 88"
      className="w-full h-[80px] sm:h-[88px] block pointer-events-none"
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      aria-hidden="true"
    >
      {/* Left Bottom Wooden Fence */}
      <g>
        <rect x="2" y="46" width="122" height="7.5" rx="3.5" fill="#CCA072" stroke={COCOA} strokeWidth="1.8" />
        <rect x="2" y="65" width="122" height="7.5" rx="3.5" fill="#C49668" stroke={COCOA} strokeWidth="1.8" />
        {[12, 42, 72, 102].map((x) => (
          <g key={x}>
            <rect
              x={x - 7}
              y="31"
              width="14"
              height="52"
              rx="6.5"
              fill="#E2B88B"
              stroke={COCOA}
              strokeWidth="1.8"
            />
            <circle cx={x} cy="49.5" r="1.4" fill="#B58458" />
            <circle cx={x} cy="68.5" r="1.4" fill="#B58458" />
          </g>
        ))}
      </g>

      {/* Right Bottom Wooden Fence */}
      <g>
        <rect x="256" y="46" width="122" height="7.5" rx="3.5" fill="#CCA072" stroke={COCOA} strokeWidth="1.8" />
        <rect x="256" y="65" width="122" height="7.5" rx="3.5" fill="#C49668" stroke={COCOA} strokeWidth="1.8" />
        {[278, 308, 338, 368].map((x) => (
          <g key={x}>
            <rect
              x={x - 7}
              y="31"
              width="14"
              height="52"
              rx="6.5"
              fill="#E2B88B"
              stroke={COCOA}
              strokeWidth="1.8"
            />
            <circle cx={x} cy="49.5" r="1.4" fill="#B58458" />
            <circle cx={x} cy="68.5" r="1.4" fill="#B58458" />
          </g>
        ))}
      </g>

      {/* Colorful Wildflowers on Left & Right Corners */}
      {[
        { x: 24, y: 78, c: '#FFF9EC', center: '#FFE066' },
        { x: 56, y: 80, c: '#F39CC2', center: '#FFF4B8' },
        { x: 88, y: 79, c: '#CFA3E8', center: '#FFE066' },
        { x: 292, y: 79, c: '#F39CC2', center: '#FFF4B8' },
        { x: 324, y: 80, c: '#FFE47D', center: '#F294B8' },
        { x: 356, y: 78, c: '#CFA3E8', center: '#FFE066' },
      ].map((fl, i) => (
        <g key={i} transform={`translate(${fl.x}, ${fl.y})`}>
          <path
            d="M-5 5Q-7 -2 -3 -5M0 5V-6M5 5Q7 -2 3 -5"
            stroke="#6AA158"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="0" cy="-8" r="2.7" fill={fl.c} stroke={COCOA} strokeWidth="0.9" />
          <circle cx="-3.2" cy="-5.5" r="2.5" fill={fl.c} stroke={COCOA} strokeWidth="0.9" />
          <circle cx="3.2" cy="-5.5" r="2.5" fill={fl.c} stroke={COCOA} strokeWidth="0.9" />
          <circle cx="0" cy="-5.2" r="1.8" fill={fl.center} />
        </g>
      ))}

      {/* Center Caramel-Cream Puppy (Sleeping / Treasure Alert / Happy Wagging Jump) */}
      <g transform="translate(152, 31)" className={puppyHappy ? 'animate-puppy-jump' : ''}>
        <ellipse cx="38" cy="48" rx="30" ry="5.5" fill="rgba(96,128,56,0.24)" />
        {/* Wagging / Curled Tail */}
        <g className={puppyHappy ? 'animate-puppy-wag' : ''}>
          <path
            d="M59 38C68 35 71 27 66 24C62 22 60 26 62 29"
            fill="none"
            stroke="#DFAA71"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M59 38C68 35 71 27 66 24"
            fill="none"
            stroke={COCOA}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
        {/* Cozy Body */}
        <ellipse cx="43" cy="38" rx="21" ry="12" fill="#FFF7EA" stroke={COCOA} strokeWidth="2" />
        {/* Caramel Back Saddle Patch */}
        <path
          d="M32 28C40 24 55 25 60 34C54 40 38 40 32 34Z"
          fill="#DFAA71"
          stroke={COCOA}
          strokeWidth="1.5"
        />
        {/* Tucked Front Paws */}
        <ellipse cx="14" cy="45" rx="7" ry="4" fill="#FFF7EA" stroke={COCOA} strokeWidth="1.8" />
        <ellipse cx="26" cy="46" rx="7" ry="4" fill="#FFF7EA" stroke={COCOA} strokeWidth="1.8" />
        {/* Puppy Head */}
        <circle cx="21" cy="31" r="12.5" fill="#FFF7EA" stroke={COCOA} strokeWidth="2" />
        {/* Caramel Head Patch & Floppy Ear */}
        <path d="M11 26C13 19 23 17 30 22C28 28 19 29 11 26Z" fill="#DFAA71" />
        <ellipse
          cx="29.5"
          cy="31"
          rx="5.2"
          ry="9"
          transform="rotate(-10 29.5 31)"
          fill="#D39252"
          stroke={COCOA}
          strokeWidth="1.9"
        />

        {puppyHappy ? (
          <>
            {/* Awake Happy ^ ^ Eyes & Cute Smile */}
            <path d="M13 30Q15.5 27.5 18 30" fill="none" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M21 30Q23.5 27.5 26 30" fill="none" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />
            <ellipse cx="13" cy="34" rx="2.5" ry="1.5" fill="#FF9BBA" opacity="0.9" />
            <ellipse cx="19" cy="34.5" rx="2.3" ry="1.7" fill={COCOA} />
            <path d="M16.5 37.5Q19 40 21.5 37.5" fill="none" stroke={COCOA} strokeWidth="1.6" strokeLinecap="round" />
            {/* Happy Sparkles */}
            <text x="-4" y="16" fill="#FF7CA4" fontSize="11" fontWeight="800">
              ♥
            </text>
            <text x="68" y="16" fill="#FFD147" fontSize="11" fontWeight="800">
              ★
            </text>
          </>
        ) : (
          <>
            {/* Closed Peaceful Sleeping Eyes, Rosy Cheek & Cocoa Nose */}
            <path d="M13.5 31Q15.5 33 17.5 31" fill="none" stroke={COCOA} strokeWidth="1.7" strokeLinecap="round" />
            <path d="M21 31Q23 33 25 31" fill="none" stroke={COCOA} strokeWidth="1.7" strokeLinecap="round" />
            <ellipse cx="13.5" cy="34.5" rx="2.4" ry="1.4" fill="#FFB0C7" opacity="0.85" />
            <ellipse cx="19" cy="35" rx="2.3" ry="1.7" fill={COCOA} />
            {!puppyHasTreasure && (
              <>
                <text x="2" y="17" fill="#7D6496" fontSize="10" fontWeight="800">
                  Z
                </text>
                <text x="10" y="11" fill="#7D6496" fontSize="8" fontWeight="800" opacity="0.8">
                  z
                </text>
              </>
            )}
          </>
        )}
      </g>
    </svg>

    {/* Clickable Hitbox & Exclamation Bubble Over Puppy When Treasure Ready */}
    {puppyHasTreasure && onClickPuppy && (
      <button
        type="button"
        onClick={onClickPuppy}
        aria-label="小狗發現寶藏！點擊領取驚喜獎勵"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-20 z-20 flex flex-col items-center justify-start cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7CA4] rounded-2xl"
      >
        <span className="animate-bounce inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFE26A] border-2 border-[#6B5344] text-sm font-extrabold text-[#5C3919] shadow-[0_3px_0_#C99A2E] -mt-3">
          !
        </span>
      </button>
    )}
  </div>
);

export const GrassTuftSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="26"
    height="16"
    viewBox="0 0 26 16"
    fill="none"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    <path
      d="M5 14C4 9 2 6 1 5C4 6 6 9 8 14M12 14C12 7 13 3 14 1C15 4 15 8 14 14M19 14C20 9 23 6 25 5C22 7 20 10 18 14"
      stroke="#75AD5F"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
