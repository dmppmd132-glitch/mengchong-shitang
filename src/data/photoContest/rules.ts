import {
  PhotoContestRank,
  PhotoFrame,
  VoteMilestoneConfig,
} from '../../types';

export const PHOTO_CONTEST_WEIGHTS = {
  themeMatch: 0.4, // 40% -> max 40 pts
  outfitCompleteness: 0.25, // 25% -> max 25 pts
  photoCompletion: 0.2, // 20% -> max 20 pts
  creativityBonus: 0.1, // 10% -> max 10 pts
  popularityVotes: 0.05, // 5% -> max 5 pts
} as const;

export const OUTFIT_SLOT_SCORE_WEIGHTS = {
  head: 5,
  face: 5,
  neck: 5,
  body: 5,
  held: 3,
  back: 2,
} as const; // Total = 25 pts

export const PHOTO_COMPLETION_SCORE_WEIGHTS = {
  background: 5,
  filter: 5,
  frame: 5,
  stickerOrPose: 5,
} as const; // Total = 20 pts

export const CREATIVITY_SCORE_WEIGHTS = {
  colorHarmony: 5,
  poseMatch: 3,
  personalityFit: 2,
} as const; // Total = 10 pts

export const DAILY_VOTE_LIMIT = 10;
export const WEEKLY_VOTE_LIMIT = 50;
export const MAX_POPULARITY_BONUS_POINTS = 5;

export interface RankRewardTier {
  rank: PhotoContestRank;
  minScore: number;
  maxScore: number;
  label: string;
  badgeClass: string;
  coins: number;
  materials: number;
  bonusTickets: number;
  grantsLimitedFrame: boolean;
}

export const PHOTO_CONTEST_RANK_TIERS: RankRewardTier[] = [
  {
    rank: 'S',
    minScore: 90,
    maxScore: 100,
    label: 'S 級完美焦點',
    badgeClass: 'bg-gradient-to-r from-[#FFE37E] to-[#FF9BC2] border-[#E09B1F] text-[#5C3108]',
    coins: 500,
    materials: 5,
    bonusTickets: 50,
    grantsLimitedFrame: true,
  },
  {
    rank: 'A',
    minScore: 80,
    maxScore: 89,
    label: 'A 級雜誌封面',
    badgeClass: 'bg-[#FFEAF2] border-[#F07EA8] text-[#B82858]',
    coins: 300,
    materials: 3,
    bonusTickets: 30,
    grantsLimitedFrame: false,
  },
  {
    rank: 'B',
    minScore: 70,
    maxScore: 79,
    label: 'B 級亮眼佳作',
    badgeClass: 'bg-[#EFEAFF] border-[#B69DF0] text-[#533899]',
    coins: 200,
    materials: 2,
    bonusTickets: 20,
    grantsLimitedFrame: false,
  },
  {
    rank: 'C',
    minScore: 60,
    maxScore: 69,
    label: 'C 級可愛入選',
    badgeClass: 'bg-[#E6F8F1] border-[#8DD9BC] text-[#1D6B52]',
    coins: 100,
    materials: 1,
    bonusTickets: 0,
    grantsLimitedFrame: false,
  },
  {
    rank: 'D',
    minScore: 50,
    maxScore: 59,
    label: 'D 級元氣紀錄',
    badgeClass: 'bg-[#EAF3FF] border-[#A7C9F7] text-[#285699]',
    coins: 50,
    materials: 0,
    bonusTickets: 0,
    grantsLimitedFrame: false,
  },
  {
    rank: 'E',
    minScore: 40,
    maxScore: 49,
    label: 'E 級隨手萌拍',
    badgeClass: 'bg-[#FFF5E2] border-[#E7C68E] text-[#8A5610]',
    coins: 20,
    materials: 0,
    bonusTickets: 0,
    grantsLimitedFrame: false,
  },
  {
    rank: 'F',
    minScore: 0,
    maxScore: 39,
    label: 'F 級初心留念',
    badgeClass: 'bg-[#F5ECE8] border-[#DFCFC7] text-[#6E544E]',
    coins: 10,
    materials: 0,
    bonusTickets: 0,
    grantsLimitedFrame: false,
  },
];

export const SUBMIT_BASE_TICKETS = 10;
export const COOP_CONTEST_TICKETS = 30;
export const CONTEST_CHAMPION_FRAME_ID: PhotoFrame = 'contest_champion_frame';

export const VOTE_MILESTONE_CONFIGS: VoteMilestoneConfig[] = [
  {
    votes: 1,
    rewardMaterials: 1,
    rewardTickets: 0,
    label: '累積 1 票・小試評審眼',
  },
  {
    votes: 5,
    rewardMaterials: 2,
    rewardTickets: 0,
    label: '累積 5 票・熱心鑑賞員',
  },
  {
    votes: 10,
    rewardMaterials: 3,
    rewardTickets: 5,
    label: '累積 10 票・時尚觀察家',
  },
  {
    votes: 20,
    rewardMaterials: 5,
    rewardTickets: 0,
    label: '累積 20 票・靈感收集手',
  },
  {
    votes: 30,
    rewardMaterials: 8,
    rewardTickets: 0,
    label: '累積 30 票・造型評論家',
  },
  {
    votes: 40,
    rewardMaterials: 10,
    rewardTickets: 0,
    label: '累積 40 票・殿堂評審團',
  },
  {
    votes: 50,
    rewardMaterials: 15,
    rewardTickets: 20,
    rewardFrameId: CONTEST_CHAMPION_FRAME_ID,
    label: '累積 50 票・滿貫金冠評審',
  },
];

export function getRankTierForScore(score: number): RankRewardTier {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return (
    PHOTO_CONTEST_RANK_TIERS.find(
      (tier) => clamped >= tier.minScore && clamped <= tier.maxScore
    ) ?? PHOTO_CONTEST_RANK_TIERS[PHOTO_CONTEST_RANK_TIERS.length - 1]
  );
}
