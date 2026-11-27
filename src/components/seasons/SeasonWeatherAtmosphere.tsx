import React from 'react';
import { SEASON_META } from '../../data/seasons';
import { SeasonId, WeatherCondition } from '../../types';

interface SeasonWeatherAtmosphereProps {
  seasonId: SeasonId;
  weatherCondition: WeatherCondition;
  variant?: 'stage' | 'yard' | 'farm' | 'studio';
  className?: string;
}

const PARTICLE_SLOTS = [
  { left: '8%', delay: '0s', duration: '6.2s', size: 12 },
  { left: '22%', delay: '1.4s', duration: '7.1s', size: 10 },
  { left: '38%', delay: '2.7s', duration: '6.5s', size: 13 },
  { left: '56%', delay: '0.8s', duration: '7.4s', size: 11 },
  { left: '74%', delay: '2.1s', duration: '6.0s', size: 12 },
  { left: '88%', delay: '3.2s', duration: '6.9s', size: 10 },
];

const RAIN_SLOTS = [
  { left: '10%', delay: '0s' },
  { left: '24%', delay: '0.35s' },
  { left: '38%', delay: '0.7s' },
  { left: '52%', delay: '0.2s' },
  { left: '66%', delay: '0.55s' },
  { left: '80%', delay: '0.9s' },
  { left: '91%', delay: '0.42s' },
];

export const SeasonWeatherAtmosphere: React.FC<SeasonWeatherAtmosphereProps> = ({
  seasonId,
  weatherCondition,
  variant = 'stage',
  className = '',
}) => {
  const seasonMeta = SEASON_META[seasonId];
  const isStorm = weatherCondition === 'storm';
  const isRain = weatherCondition === 'rain';
  const isSnowWeather = weatherCondition === 'snow';
  const isHot = weatherCondition === 'hot';
  const isWindy = weatherCondition === 'windy';
  const isClear = weatherCondition === 'clear';

  const densitySlice = variant === 'studio' ? 4 : 6;
  const slots = PARTICLE_SLOTS.slice(0, densitySlice);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden z-[6] ${className}`}
      aria-hidden="true"
    >
      <div className={`absolute inset-0 ${seasonMeta.stageTintClass}`} />

      {isClear && seasonId === 'summer' && (
        <div
          className="absolute inset-0 opacity-35"
          style={{
            background:
              'radial-gradient(circle at 86% 10%, rgba(255, 224, 102, 0.55) 0%, rgba(255, 224, 102, 0) 48%)',
          }}
        />
      )}

      {isHot && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 80% 12%, rgba(255, 166, 86, 0.28) 0%, rgba(255, 166, 86, 0) 55%)',
          }}
        />
      )}

      {seasonId === 'winter' && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 18% 82%, rgba(255, 225, 165, 0.26) 0%, rgba(255, 225, 165, 0) 45%)',
          }}
        />
      )}

      {isStorm && (
        <div className="absolute inset-0 bg-[#2E294E]/18" />
      )}

      {(seasonId === 'spring' && !isSnowWeather && !isStorm) &&
        slots.map((slot, idx) => (
          <svg
            key={`petal-${idx}`}
            viewBox="0 0 16 16"
            className="animate-season-petal absolute -top-4"
            style={{
              left: slot.left,
              width: `${slot.size}px`,
              height: `${slot.size}px`,
              animationDelay: slot.delay,
              animationDuration: slot.duration,
            }}
          >
            <path
              d="M8 2C11 2 14 5 13 9C12 12 9 14 6 13C3 12 2 8 4 5C5 3 6.5 2 8 2Z"
              fill={idx % 2 === 0 ? '#FFB3CD' : '#FFD4E3'}
              opacity="0.88"
            />
          </svg>
        ))}

      {seasonId === 'autumn' && !isSnowWeather &&
        slots.map((slot, idx) => (
          <svg
            key={`leaf-${idx}`}
            viewBox="0 0 16 16"
            className="animate-season-petal absolute -top-4"
            style={{
              left: slot.left,
              width: `${slot.size + 1}px`,
              height: `${slot.size + 1}px`,
              animationDelay: slot.delay,
              animationDuration: slot.duration,
            }}
          >
            <path
              d="M8 1L10.2 5.2L14.5 4.8L11.5 8.5L13.5 12L9.2 11.2L8 15L6.8 11.2L2.5 12L4.5 8.5L1.5 4.8L5.8 5.2Z"
              fill={idx % 2 === 0 ? '#E76F51' : '#F4A261'}
              opacity="0.85"
            />
          </svg>
        ))}

      {(seasonId === 'winter' || isSnowWeather) &&
        slots.map((slot, idx) => (
          <svg
            key={`snow-${idx}`}
            viewBox="0 0 12 12"
            className="animate-season-snow absolute -top-3"
            style={{
              left: slot.left,
              width: `${slot.size - 1}px`,
              height: `${slot.size - 1}px`,
              animationDelay: slot.delay,
              animationDuration: isSnowWeather ? '5.2s' : slot.duration,
            }}
          >
            <circle cx="6" cy="6" r="3.4" fill="#FFFFFF" opacity="0.9" />
            <circle cx="6" cy="6" r="4.8" fill="#DCEEFF" opacity="0.35" />
          </svg>
        ))}

      {(isRain || isStorm) &&
        RAIN_SLOTS.map((slot, idx) => (
          <span
            key={`rain-${idx}`}
            className="animate-season-rain absolute -top-6 w-[1.5px] h-5 rounded-full bg-[#7EC4F7]/75"
            style={{
              left: slot.left,
              animationDelay: slot.delay,
            }}
          />
        ))}

      {isWindy && (
        <>
          <svg
            viewBox="0 0 64 16"
            className="animate-season-wind absolute top-[24%] left-0 w-16 h-4"
          >
            <path
              d="M2 10Q20 4 38 9T60 7"
              fill="none"
              stroke="#7CCBA8"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
          <svg
            viewBox="0 0 64 16"
            className="animate-season-wind absolute top-[58%] left-0 w-14 h-4"
            style={{ animationDelay: '1.6s' }}
          >
            <path
              d="M2 8Q18 12 34 7T58 9"
              fill="none"
              stroke="#9DD9BF"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.65"
            />
          </svg>
        </>
      )}
    </div>
  );
};
