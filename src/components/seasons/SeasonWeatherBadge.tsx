import React from 'react';
import { ChevronRight } from 'lucide-react';
import { SEASON_META, WEATHER_EFFECT_PROFILES } from '../../data/seasons';
import { SeasonId, WeatherState } from '../../types';

interface SeasonWeatherBadgeProps {
  seasonId: SeasonId;
  weather: WeatherState;
  pendingWeatherTasksCount?: number;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SeasonWeatherBadge: React.FC<SeasonWeatherBadgeProps> = ({
  seasonId,
  weather,
  pendingWeatherTasksCount = 0,
  compact = false,
  onClick,
  className = '',
}) => {
  const seasonMeta = SEASON_META[seasonId];
  const profile = WEATHER_EFFECT_PROFILES[weather.condition];

  const content = (
    <>
      <span aria-hidden="true">{seasonMeta.emoji}</span>
      <span>{seasonMeta.name}</span>
      <span className="opacity-45">·</span>
      <span aria-hidden="true">{weather.emoji || profile.emoji}</span>
      <span>{weather.label || profile.label}</span>
      {!compact && (
        <>
          <span className="tabular-nums">{weather.temperatureC}°C</span>
          <span className="opacity-65 truncate max-w-[72px]">({weather.cityName})</span>
        </>
      )}
      {pendingWeatherTasksCount > 0 && (
        <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-[#FF6B97] text-white text-[10px] font-extrabold tabular-nums">
          {pendingWeatherTasksCount}
        </span>
      )}
      {onClick && <ChevronRight className="w-3.5 h-3.5 opacity-65 shrink-0" />}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`目前${seasonMeta.name}、${weather.cityName}${weather.label} ${weather.temperatureC}°C，點擊查看四季與天氣中心`}
        className={`min-h-[44px] px-3 py-1.5 rounded-2xl border text-[11px] font-extrabold inline-flex items-center gap-1.5 shadow-xs hover:brightness-[0.99] active:scale-[0.98] transition ${seasonMeta.badgeClass} ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`min-h-[34px] px-2.5 py-1 rounded-xl border text-[11px] font-extrabold inline-flex items-center gap-1.5 ${seasonMeta.badgeClass} ${className}`}
    >
      {content}
    </div>
  );
};
