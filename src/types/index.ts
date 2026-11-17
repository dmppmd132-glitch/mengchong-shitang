export type TabKey = 'home' | 'canteen' | 'wardrobe' | 'journal' | 'quests';

export type PetSpecies = 'pig' | 'rabbit' | 'dog';

export type FoodCategory = 'meal' | 'snack' | 'fastFood';

export type AccessorySlot = 'head' | 'face' | 'neck' | 'body';

export type PiggyActionState =
  | 'idle'
  | 'petted'
  | 'eating'
  | 'sleeping'
  | 'bathing'
  | 'walking'
  | 'stuffed';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  level: number;
  growth: number;
  intimacy: number;
  hunger: number;
  mood: number;
  cleanliness: number;
  energy: number;
  weight: number;
  roundness: number;
  accessories: Record<AccessorySlot, string | null>;
  hatched: boolean;
  consecutiveFastFood: number;
}

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  hunger: number;
  mood: number;
  weightGain: number;
  roundness: number;
  price: number;
  emoji: string;
  description: string;
  growthGain: number;
}

export interface Accessory {
  id: string;
  name: string;
  slot: AccessorySlot;
  price: number;
  emoji: string;
  description: string;
  initialUnlocked: boolean;
}

export interface WeightLog {
  id: string;
  date: string;
  weight: number;
  foodName: string;
  note: string;
  weightDelta: number;
  timeStr: string;
  timestamp: number;
}

export interface FeedLog {
  id: string;
  date: string;
  foodId: string;
  weightChange: number;
}

export interface TaskReward {
  coins: number;
  foodId: string;
  foodQty: number;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: TaskReward;
}

export interface GrowthStageInfo {
  level: number;
  name: string;
  minGrowth: number;
  nextGrowth: number | null;
  tagline: string;
  unlockFeature: string;
  bodyScaleX: number;
  bodyScaleY: number;
  unlockedSlots: AccessorySlot[];
}

export interface GameState {
  version: number;
  pet: Pet;
  coins: number;
  foods: Record<string, number>;
  accessories: string[];
  weightLogs: WeightLog[];
  feedLogs: FeedLog[];
  dailyTasks: DailyTask[];
  dailyTasksDate: string;
  soundEnabled: boolean;
  lastSavedAt: number;
}

export interface FloatingFeedback {
  id: string;
  text: string;
  emoji?: string;
}
