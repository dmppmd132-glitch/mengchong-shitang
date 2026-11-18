import { TitleId } from '../types';

export interface TitleDefinition {
  id: TitleId;
  name: string;
  emoji: string;
  description: string;
  unlockCondition: string;
  badgeClass: string;
}

export const TITLE_DEFINITIONS: Record<TitleId, TitleDefinition> = {
  gourmet_owner: {
    id: 'gourmet_owner',
    name: '美食家飼主',
    emoji: '🍽️',
    description: '嘗遍萌寵食堂全部料理，最懂寶貝味蕾的超級大廚！',
    unlockCondition: '收集完所有食物圖鑑',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
  },
  fashion_stylist: {
    id: 'fashion_stylist',
    name: '時尚造型師',
    emoji: '👑',
    description: '集齊全系列可愛配件，走在路上永遠是全場焦點！',
    unlockCondition: '收集完所有配件圖鑑',
    badgeClass: 'bg-[#FFEAF2] border-[#F3B6CC] text-[#B83B64]',
  },
};

export const ACCESSORY_MILESTONE_STEP = 5;
export const ACCESSORY_MILESTONE_COINS = 50;
export const ACCESSORY_MILESTONE_GROWTH = 20;

export function getTitleDefinition(id: TitleId): TitleDefinition {
  return TITLE_DEFINITIONS[id];
}
