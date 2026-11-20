import React from 'react';

interface YardMoodBuffBadgeProps {
  expiresAt: number | null;
  now: number;
  className?: string;
}

export const YardMoodBuffBadge: React.FC<YardMoodBuffBadgeProps> = ({
  expiresAt,
  now,
  className = '',
}) => {
  if (expiresAt === null) return null;
  const seconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  if (seconds <= 0) return null;
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div
      role="status"
      aria-live="off"
      aria-label={`野餐好心情 Buff，剩餘 ${clock}，農場作物生長速度加 10%`}
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-[#6B5344] bg-[#FFFDF8]/95 px-2.5 py-1 text-[10px] font-extrabold text-[#4B6845] shadow-[0_2px_0_rgba(107,83,68,0.18)] ${className}`}
    >
      <span aria-hidden="true">🌼</span>
      <span>野餐好心情</span>
      <span className="rounded-full bg-[#E4F5D8] px-1.5 py-0.5 tabular-nums">{clock}</span>
      <span className="text-[#7D614A]">作物 +10%</span>
    </div>
  );
};
