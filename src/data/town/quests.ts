import {
  ActiveTownLocationId,
  CoopTownExploreSession,
  CoopTownExploreTemplateId,
  TownLocationQuest,
} from '../../types';

type QuestTemplate = Omit<TownLocationQuest, 'progress' | 'completed' | 'claimed'>;

export const LOCATION_DAILY_QUEST_TEMPLATES: Record<ActiveTownLocationId, QuestTemplate[]> = {
  home_yard: [
    {
      id: 'home_yard_host',
      locationId: 'home_yard',
      kind: 'host_location_visitor',
      title: '庭院熱情招待',
      description: '在「自家庭院」餵食或招待任意 1 位來訪動物朋友。',
      emoji: '🍪',
      target: 1,
      rewardTownTickets: 3,
      rewardCoins: 35,
      rewardStudioMaterials: 1,
    },
    {
      id: 'home_yard_photo',
      locationId: 'home_yard',
      kind: 'photo_location',
      title: '拍 1 張庭院紀念照',
      description: '使用「地點攝影」或在庭院替訪客拍下 1 張美美寫真。',
      emoji: '📸',
      target: 1,
      rewardTownTickets: 4,
      rewardCoins: 40,
      rewardFilterShards: 1,
    },
  ],
  acorn_forest: [
    {
      id: 'acorn_forest_forage',
      locationId: 'acorn_forest',
      kind: 'forage_acorn',
      title: '採集 5 顆森林橡果',
      description: '在橡果森林點擊「採集橡果」收集滿 5 顆香脆橡果！',
      emoji: '🌰',
      target: 5,
      rewardTownTickets: 4,
      rewardCoins: 45,
      rewardFurnitureShards: 1,
    },
    {
      id: 'acorn_forest_photo',
      locationId: 'acorn_forest',
      kind: 'photo_visitor',
      targetVisitorId: 'squirrel',
      title: '拍 1 張松鼠或森林照',
      description: '在橡果森林拍攝訪客松鼠（或拍 1 張森林地點寫真）。',
      emoji: '🐿️',
      target: 1,
      rewardTownTickets: 5,
      rewardCoins: 50,
      rewardFilterShards: 1,
    },
  ],
  lake_park: [
    {
      id: 'lake_park_fishing',
      locationId: 'lake_park',
      kind: 'lake_fishing',
      title: '完成 1 次湖邊釣魚小遊戲',
      description: '在湖邊公園體驗 1 次輕鬆單手「湖邊釣魚」小遊戲。',
      emoji: '🎣',
      target: 1,
      rewardTownTickets: 4,
      rewardCoins: 55,
      rewardStudioMaterials: 1,
    },
    {
      id: 'lake_park_photo',
      locationId: 'lake_park',
      kind: 'photo_visitor',
      targetVisitorId: 'duck',
      title: '拍 1 張小鴨或湖畔照',
      description: '在湖邊公園拍攝可愛小鴨（或拍 1 張湖畔寫真）。',
      emoji: '🦆',
      target: 1,
      rewardTownTickets: 5,
      rewardCoins: 50,
      rewardFilterShards: 1,
    },
  ],
  town_market: [
    {
      id: 'town_market_deliver',
      locationId: 'town_market',
      kind: 'deliver_market_dish',
      title: '在市集交付 2 道料理',
      description: '從食堂倉庫挑選 2 道手作或精選料理交付給小鎮市集攤位。',
      emoji: '🍱',
      target: 2,
      rewardTownTickets: 5,
      rewardCoins: 65,
      rewardFurnitureShards: 1,
    },
    {
      id: 'town_market_buy_furniture',
      locationId: 'town_market',
      kind: 'buy_market_furniture',
      title: '選購或佈置 1 個市集家具',
      description: '於小鎮市集家具攤購買 1 件市集限定家具（若全購齊可替市集拍照完成）。',
      emoji: '🪑',
      target: 1,
      rewardTownTickets: 5,
      rewardCoins: 60,
      rewardFilterShards: 1,
    },
  ],
};

export interface CoopTownExploreTemplate {
  templateId: CoopTownExploreTemplateId;
  locationId: ActiveTownLocationId;
  title: string;
  emoji: string;
  description: string;
  steps: CoopTownExploreSession['steps'];
}

export const COOP_TOWN_EXPLORE_TEMPLATES: CoopTownExploreTemplate[] = [
  {
    templateId: 'forest_picnic',
    locationId: 'acorn_forest',
    title: '共養探索：森林野餐',
    emoji: '🧺',
    description:
      '和夥伴一起到「橡果森林」採集 5 顆橡果並拍下 1 張森林野餐照！雙方合力累積進度，每人都能領取完整獎勵與 +8 小鎮券。',
    steps: [
      {
        key: 'acorn',
        label: '一起在森林採集橡果',
        emoji: '🌰',
        target: 5,
        progress: 0,
        contributorUserIds: [],
      },
      {
        key: 'forest_photo',
        label: '拍攝橡果森林野餐紀念照',
        emoji: '📸',
        target: 1,
        progress: 0,
        contributorUserIds: [],
      },
    ],
  },
  {
    templateId: 'lake_fishing',
    locationId: 'lake_park',
    title: '共養探索：湖邊釣魚',
    emoji: '🎣',
    description:
      '和夥伴一起前往「湖邊公園」完成 2 次湖邊釣魚，並招待或拍攝 1 次小鴨！一人出力兩人同享，每人皆可獲得 +8 小鎮券與稀有獎勵。',
    steps: [
      {
        key: 'fishing',
        label: '合力完成湖邊釣魚小遊戲',
        emoji: '🐟',
        target: 2,
        progress: 0,
        contributorUserIds: [],
      },
      {
        key: 'duck_care',
        label: '招待或拍攝可愛小鴨',
        emoji: '🦆',
        target: 1,
        progress: 0,
        contributorUserIds: [],
      },
    ],
  },
];
