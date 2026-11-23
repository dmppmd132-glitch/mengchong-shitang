import React from 'react';
import { BookOpen, Home, Palette, Shirt, UtensilsCrossed } from 'lucide-react';
import { TabKey } from '../types';

interface BottomTabBarProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  claimableHouseCount?: number;
  readyCropsCount?: number;
  unreadMessagesCount?: number;
}

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'home', label: '首頁', icon: Home },
  { key: 'canteen', label: '食堂', icon: UtensilsCrossed },
  { key: 'wardrobe', label: '衣櫃', icon: Shirt },
  { key: 'house', label: '家園', icon: Palette },
  { key: 'journal', label: '手帳', icon: BookOpen },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onChange,
  claimableHouseCount = 0,
  readyCropsCount = 0,
  unreadMessagesCount = 0,
}) => {
  return (
    <nav
      aria-label="主導覽列"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-t-2 border-[#F4DFD8] pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 px-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          const badgeCount =
            key === 'house'
              ? claimableHouseCount
              : key === 'canteen'
              ? readyCropsCount
              : key === 'home' && !isActive
              ? unreadMessagesCount
              : 0;
          const badgeColorClass =
            key === 'canteen' ? 'bg-[#3BA886]' : 'bg-[#FF5A87]';
          const badgeAria =
            key === 'canteen'
              ? `${badgeCount} 塊成熟作物可採收`
              : key === 'home'
              ? `${badgeCount} 則未讀留言`
              : `${badgeCount} 項待領取獎勵`;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative min-h-[48px] flex flex-col items-center justify-center rounded-2xl mx-0.5 transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-[#D64470] bg-[#FFEBF0]'
                  : 'text-[#826862] hover:text-[#4A3531] hover:bg-[#FFF5EB]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-bold tracking-tight mt-0.5 leading-none">
                {label}
              </span>
              {badgeCount > 0 && (
                <span
                  aria-label={badgeAria}
                  className={`absolute top-1.5 right-3 min-w-[16px] h-4 px-1 rounded-full ${badgeColorClass} text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums`}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
