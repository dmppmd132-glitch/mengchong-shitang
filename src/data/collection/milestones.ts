import { CollectionMilestone } from '../../types';

export const COLLECTION_MILESTONES: CollectionMilestone[] = [
  {
    percent: 10,
    title: '圖鑑初心者',
    rewardSummary: '100 金幣 + 1 攝影材料',
    rewardCoins: 100,
    rewardFilterShards: 1,
  },
  {
    percent: 25,
    title: '小鎮拾光收藏家',
    rewardSummary: '200 金幣 + 限定相框「稜鏡紀念框」',
    rewardCoins: 200,
    rewardStudioFrameId: 'collection_prism_frame',
  },
  {
    percent: 40,
    title: '七彩光影獵人',
    rewardSummary: '300 金幣 + 限定濾鏡「七彩極光」',
    rewardCoins: 300,
    rewardStudioFilterId: 'collection_rainbow',
  },
  {
    percent: 50,
    title: '半程星願達成',
    rewardSummary: '500 金幣 + 限定背景「彩虹小徑」',
    rewardCoins: 500,
    rewardStudioBgId: 'rainbow_trail_bg',
  },
  {
    percent: 60,
    title: '極光冠冕認證',
    rewardSummary: '600 金幣 + 限定頭部配件「極光星冠」',
    rewardCoins: 600,
    rewardAccessoryId: 'collection_prism_crown',
  },
  {
    percent: 75,
    title: '舞台謝幕焦點',
    rewardSummary: '800 金幣 + 限定姿勢「華麗謝幕轉」',
    rewardCoins: 800,
    rewardStudioPoseId: 'collection_twirl',
  },
  {
    percent: 90,
    title: '殿堂級珍藏家',
    rewardSummary: '1,000 金幣 + 限定家具「萌寵珍藏展示櫃」',
    rewardCoins: 1000,
    rewardFurnitureId: 'collection_display_shelf',
  },
  {
    percent: 100,
    title: '傳說全圖鑑大師',
    rewardSummary: '2,000 金幣 + 稱號「萌寵圖鑑大師」',
    rewardCoins: 2000,
    rewardTitleId: 'collection_master',
  },
];
