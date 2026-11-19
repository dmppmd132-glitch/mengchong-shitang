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
  strawberry_dreamer: {
    id: 'strawberry_dreamer',
    name: '草莓甜心家',
    emoji: '🍓',
    description: '集齊「草莓甜心」主題套裝，把房間變成粉嫩甜點屋！',
    unlockCondition: '完成「草莓甜心」主題套裝',
    badgeClass: 'bg-[#FFEAF2] border-[#F5B0C8] text-[#C83B67]',
  },
  forest_camper: {
    id: 'forest_camper',
    name: '森林露營家',
    emoji: '🌲',
    description: '集齊「森林露營」主題套裝，在微風燈火旁享受自然野趣！',
    unlockCondition: '完成「森林露營」主題套裝',
    badgeClass: 'bg-[#E7F7EE] border-[#A6DFC5] text-[#1F6B54]',
  },
  cloud_napper: {
    id: 'cloud_napper',
    name: '雲朵築夢師',
    emoji: '☁️',
    description: '集齊「雲朵午睡」主題套裝，擁有最軟綿治癒的空中夢境房！',
    unlockCondition: '完成「雲朵午睡」主題套裝',
    badgeClass: 'bg-[#EEF4FF] border-[#BFD4FA] text-[#355A9C]',
  },
  coop_partner: {
    id: 'coop_partner',
    name: '默契搭檔',
    emoji: '💞',
    description: '連續 7 天攜手完成共養合作遊戲，兩人的默契已達滿分殿堂！',
    unlockCondition: '連續 7 天完成合作遊戲',
    badgeClass: 'bg-[#FFEAF2] border-[#F4A6C2] text-[#B83B64]',
  },
  berry_sweetheart: {
    id: 'berry_sweetheart',
    name: '草莓甜心派',
    emoji: '🍓',
    description: '收集全套「草莓甜心」穿搭配件，甜美氣息讓食堂每天都像草莓季！',
    unlockCondition: '完成「草莓甜心」穿搭套裝 (4/4)',
    badgeClass: 'bg-[#FFEAF2] border-[#F4A6C2] text-[#C83B67]',
  },
  forest_explorer: {
    id: 'forest_explorer',
    name: '森系露營王',
    emoji: '🍄',
    description: '收集全套「森林露營」穿搭配件，帶著蘑菇帽與背包出發探險！',
    unlockCondition: '完成「森林露營」穿搭套裝 (4/4)',
    badgeClass: 'bg-[#E7F7EE] border-[#A6DFC5] text-[#1F6B54]',
  },
  cloud_dreamer: {
    id: 'cloud_dreamer',
    name: '雲端睡美夢',
    emoji: '☁️',
    description: '收集全套「雲朵午睡」穿搭配件，軟綿綿造型療癒全場！',
    unlockCondition: '完成「雲朵午睡」穿搭套裝 (4/4)',
    badgeClass: 'bg-[#EEF4FF] border-[#BFD4FA] text-[#355A9C]',
  },
  little_master_chef: {
    id: 'little_master_chef',
    name: '料理小當家',
    emoji: '👩‍🍳',
    description: '收集全套「廚師小當家」穿搭配件，食堂最耀眼的萌萌主廚誕生！',
    unlockCondition: '完成「廚師小當家」穿搭套裝 (4/4)',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
  },
  starlight_voyager: {
    id: 'starlight_voyager',
    name: '銀河星際旅人',
    emoji: '🚀',
    description: '收集全套「星空探險」穿搭配件，披上太空披風遨遊宇宙星海！',
    unlockCondition: '完成「星空探險」穿搭套裝 (4/4)',
    badgeClass: 'bg-[#EFEAFF] border-[#C9BDF2] text-[#5B449C]',
  },
  party_superstar: {
    id: 'party_superstar',
    name: '派對閃亮星',
    emoji: '🎉',
    description: '收集全套「節日派對」穿搭配件，走到哪裡都是最耀眼的慶典之星！',
    unlockCondition: '完成「節日派對」穿搭套裝 (4/4)',
    badgeClass: 'bg-[#FFF0F6] border-[#F4B4CB] text-[#B83B64]',
  },
  growth_sprout: {
    id: 'growth_sprout',
    name: '破殼萌芽星',
    emoji: '🐣',
    description: '破殼來到萌寵食堂報到，邁開軟萌可愛的成長第一步！',
    unlockCondition: '完成破殼孵化並進入 Lv.1',
    badgeClass: 'bg-[#FFF6DA] border-[#EED387] text-[#8A5610]',
  },
  growth_chubby: {
    id: 'growth_chubby',
    name: '圓滾幸福團',
    emoji: '🍡',
    description: '進化至 Lv.2 圓潤階段，臉頰鼓鼓、解鎖身體穿搭的幸福時光！',
    unlockCondition: '寵物成長達 Lv.2（100 成長值）',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
  growth_radiant: {
    id: 'growth_radiant',
    name: '元氣閃亮星',
    emoji: '✨',
    description: '進化至 Lv.3 元氣階段，雙眼閃閃發光、每天精力滿滿！',
    unlockCondition: '寵物成長達 Lv.3（250 成長值）',
    badgeClass: 'bg-[#E6F8F1] border-[#9ADBC2] text-[#1F6B54]',
  },
  growth_superstar: {
    id: 'growth_superstar',
    name: '食堂超級巨星',
    emoji: '🌟',
    description: '進化至 Lv.4 巔峰階段，擁有專屬金星光環與閃耀星等認證！',
    unlockCondition: '寵物成長達 Lv.4（500 成長值）',
    badgeClass: 'bg-[#F3EBFF] border-[#C9BDF2] text-[#5B449C]',
  },
};

export const ACCESSORY_MILESTONE_STEP = 5;
export const ACCESSORY_MILESTONE_COINS = 50;
export const ACCESSORY_MILESTONE_GROWTH = 20;

export const FURNITURE_MILESTONE_STEP = 5;
export const FURNITURE_MILESTONE_COINS = 80;
export const FURNITURE_MILESTONE_GROWTH = 25;

export function getTitleDefinition(id: TitleId): TitleDefinition {
  return TITLE_DEFINITIONS[id];
}
