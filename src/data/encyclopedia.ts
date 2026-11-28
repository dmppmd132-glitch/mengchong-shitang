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
  recipe_master: {
    id: 'recipe_master',
    name: '食堂神廚',
    emoji: '👨‍🍳',
    description: '精通萌寵食堂全部拿手料理，從香脆可頌到晚安熔岩可可都完美呈現！',
    unlockCondition: '收集完所有料理食譜圖鑑',
    badgeClass: 'bg-[#FFF0E5] border-[#F0B892] text-[#9A4816]',
  },
  bird_whisperer: {
    id: 'bird_whisperer',
    name: '林間鳥語友',
    emoji: '🐦',
    description: '成為小鳥啾啾最信任的朋友，清晨總會聽見牠在窗邊歌唱！',
    unlockCondition: '小鳥好感度達到 Lv.5',
    badgeClass: 'bg-[#E6F5FF] border-[#9ECFF0] text-[#225C82]',
  },
  squirrel_friend: {
    id: 'squirrel_friend',
    name: '橡果收藏家',
    emoji: '🐿️',
    description: '松鼠果果把最閃亮的秘密橡果寶藏都與你分享！',
    unlockCondition: '松鼠好感度達到 Lv.5',
    badgeClass: 'bg-[#FFF4E0] border-[#E7BC78] text-[#8C4D16]',
  },
  rabbit_guardian: {
    id: 'rabbit_guardian',
    name: '花田守護兔友',
    emoji: '🐇',
    description: '與小兔子雪球一起守護繽紛花圃，庭院每天都飄著花香與甜紅蘿蔔味！',
    unlockCondition: '小兔子好感度達到 Lv.5',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
  coop_best_host: {
    id: 'coop_best_host',
    name: '最佳招待搭檔',
    emoji: '🌟',
    description: '連續 7 天攜手招待庭院共同訪客，小鎮居民公認最暖心的神仙搭檔！',
    unlockCondition: '連續 7 天完成共養共同訪客',
    badgeClass: 'bg-[#FFF3C4] border-[#E6A222] text-[#7A540E]',
  },
  fashion_photographer: {
    id: 'fashion_photographer',
    name: '時尚攝影師',
    emoji: '📸',
    description: '連續 5 週制霸每週穿搭主題挑戰，每張作品都像雜誌封面一樣迷人！',
    unlockCondition: '連續 5 週完成每週穿搭主題挑戰（達 100 分）',
    badgeClass: 'bg-[#FFEAF2] border-[#F4A6C2] text-[#B83B64]',
  },
  strawberry_sweetheart_title: {
    id: 'strawberry_sweetheart_title',
    name: '草莓甜心',
    emoji: '🍓',
    description: '草莓季限定稱號！把草莓香氣、粉嫩造型與滿滿幸福笑容一起帶進食堂。',
    unlockCondition: '草莓季商店兌換（300 草莓券）或達成「草莓甜心」活動里程碑',
    badgeClass: 'bg-[#FFE8F0] border-[#F29AB8] text-[#C43463]',
  },
  strawberry_fashionista: {
    id: 'strawberry_fashionista',
    name: '草莓時尚家',
    emoji: '🍓',
    description: '連續 3 週在草莓季攝影挑戰突破 100 分，公認的莓果系潮流穿搭大師！',
    unlockCondition: '連續 3 週於草莓季攝影挑戰達到 100 分以上',
    badgeClass: 'bg-[#FFF0F6] border-[#E885AA] text-[#B83B64]',
  },
  town_explorer: {
    id: 'town_explorer',
    name: '小鎮探險家',
    emoji: '🧭',
    description: '踏遍自家庭院、橡果森林、湖邊公園與小鎮市集，把小鎮動物朋友都記進心裡！',
    unlockCondition: '於小鎮商店兌換（400 小鎮券）或共養探索連續 7 天完成',
    badgeClass: 'bg-[#E6F8EE] border-[#8BD7B3] text-[#1D6B4F]',
  },
  yard_host_master: {
    id: 'yard_host_master',
    name: '庭院好鄰居',
    emoji: '🏡',
    description: '完成自家庭院全圖鑑收集，連最害羞的閃亮蝴蝶也愛來你家作客！',
    unlockCondition: '完成「自家庭院」小鎮圖鑑 100%',
    badgeClass: 'bg-[#EAF9EE] border-[#9ADBC0] text-[#1F6B54]',
  },
  acorn_forest_ranger: {
    id: 'acorn_forest_ranger',
    name: '橡果林巡守員',
    emoji: '🌲',
    description: '完成橡果森林全圖鑑收集，小鹿與松鼠總是會把第一顆甜橡果留給你。',
    unlockCondition: '完成「橡果森林」小鎮圖鑑 100%',
    badgeClass: 'bg-[#E9F6E8] border-[#9CCFA5] text-[#226142]',
  },
  lakeside_angler: {
    id: 'lakeside_angler',
    name: '湖畔悠閒釣手',
    emoji: '🎣',
    description: '完成湖邊公園全圖鑑收集，最懂得在微風水岸和小鴨水獺共享午后時光！',
    unlockCondition: '完成「湖邊公園」小鎮圖鑑 100%',
    badgeClass: 'bg-[#E5F4FF] border-[#98D1F5] text-[#1D5C8A]',
  },
  town_market_vip: {
    id: 'town_market_vip',
    name: '小鎮市集貴賓',
    emoji: '🏮',
    description: '完成小鎮市集全圖鑑收集，市集每個暖燈木攤都認識這位超暖心的美食飼主！',
    unlockCondition: '完成「小鎮市集」小鎮圖鑑 100%',
    badgeClass: 'bg-[#FFF3DC] border-[#F0CA82] text-[#8B5212]',
  },
  pet_collector: {
    id: 'pet_collector',
    name: '萌寵收藏家',
    emoji: '🐾',
    description: '把 6 位性格迥異又軟萌的動物寶貝通通接回食堂大家庭！',
    unlockCondition: '收集全部 6 種寵物（小豬、兔子、小狗、小貓、小鴨、小倉鼠）',
    badgeClass: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
  house_designer: {
    id: 'house_designer',
    name: '溫馨小屋設計師',
    emoji: '🛋️',
    description: '親手把小屋佈置得暖呼呼又充滿主題感，每件家具都載滿回憶！',
    unlockCondition: '房間圖鑑收集度達到 60% 以上',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
  },
  town_farmer: {
    id: 'town_farmer',
    name: '小鎮農夫',
    emoji: '🌾',
    description: '細心照料菜園、升級農具並料理出滿滿香氣食材的田園職人！',
    unlockCondition: '農場圖鑑收集度達到 70% 以上',
    badgeClass: 'bg-[#E7F7EE] border-[#9CD5B1] text-[#1F6A47]',
  },
  town_host_title: {
    id: 'town_host_title',
    name: '小鎮招待員',
    emoji: '🫖',
    description: '不管是庭院或小鎮各地的動物客人，都被你溫柔招待得心花怒放！',
    unlockCondition: '在訪客圖鑑解鎖 8 位以上訪客朋友',
    badgeClass: 'bg-[#E6F5FF] border-[#9ECFF0] text-[#225C82]',
  },
  memory_collector: {
    id: 'memory_collector',
    name: '回憶收藏家',
    emoji: '📖',
    description: '把每一刻成長、美食、拍照與小鎮相遇都好好收進回憶冊的暖心飼主！',
    unlockCondition: '回憶圖鑑收集度達到 60% 以上',
    badgeClass: 'bg-[#F3EBFF] border-[#C9BDF2] text-[#5B449C]',
  },
  collection_master: {
    id: 'collection_master',
    name: '萌寵圖鑑大師',
    emoji: '🏆',
    description: '達成萌寵圖鑑 100% 傳說級全收集成就，見證食堂與小鎮的每一份美好！',
    unlockCondition: '總收集圖鑑達到 100% 里程碑',
    badgeClass: 'bg-[#FFF3C4] border-[#E6A222] text-[#7A540E]',
  },
  sakura_picnic_host: {
    id: 'sakura_picnic_host',
    name: '櫻花野餐王',
    emoji: '🌸',
    description: '在春天櫻花樹下舉辦最幸福野餐派對的紀念稱號！',
    unlockCondition: '於「櫻花野餐祭」商店兌換（30 櫻花券）',
    badgeClass: 'bg-[#FFEAF3] border-[#F4B4CD] text-[#B83B64]',
  },
  four_seasons_keeper: {
    id: 'four_seasons_keeper',
    name: '四季旅伴',
    emoji: '🍂',
    description: '陪伴萌寵走過春櫻、夏陽、秋楓與冬雪的四季守護者。',
    unlockCondition: '見證季節變換並獲得季節回憶卡',
    badgeClass: 'bg-[#FFEEDB] border-[#EEB982] text-[#964B12]',
  },
  weather_watcher: {
    id: 'weather_watcher',
    name: '晴雨小氣象員',
    emoji: '⛅',
    description: '總是貼心依照晴雨雪風照顧萌寵與農地的細心飼主！',
    unlockCondition: '完成任意天氣每日任務領獎',
    badgeClass: 'bg-[#E3F2FF] border-[#9EC9F2] text-[#1D5A94]',
  },
  birthday_superstar: {
    id: 'birthday_superstar',
    name: '生日派對壽星',
    emoji: '🎂',
    description: '生日商店限定！戴上壽星光環接受全小鎮祝福的慶生主角稱號。',
    unlockCondition: '於生日商店兌換（400 生日券）',
    badgeClass: 'bg-[#FFEAF2] border-[#FF8EB0] text-[#C43463]',
  },
  best_birthday_partner: {
    id: 'best_birthday_partner',
    name: '最佳生日搭檔',
    emoji: '🥳',
    description: '連續 5 次與重要的人共同完成共養生日慶祝，把每個生日都變成雙倍幸福！',
    unlockCondition: '連續完成 5 次共養生日任務',
    badgeClass: 'bg-[#FFF3D8] border-[#F2CE6D] text-[#8A5610]',
  },
};

export const ACCESSORY_MILESTONE_STEP = 5;
export const ACCESSORY_MILESTONE_COINS = 50;
export const ACCESSORY_MILESTONE_GROWTH = 20;

export const RECIPE_MILESTONE_THRESHOLDS = [4, 8, 12];
export const RECIPE_MILESTONE_COINS = 60;
export const RECIPE_MILESTONE_GROWTH = 24;

export const FURNITURE_MILESTONE_STEP = 5;
export const FURNITURE_MILESTONE_COINS = 80;
export const FURNITURE_MILESTONE_GROWTH = 25;

export function getTitleDefinition(id: TitleId): TitleDefinition {
  return TITLE_DEFINITIONS[id];
}
