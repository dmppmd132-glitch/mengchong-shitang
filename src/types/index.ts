export type TabKey = 'home' | 'canteen' | 'wardrobe' | 'journal' | 'quests';

export type PetSpecies = 'pig' | 'rabbit' | 'dog';

export type FoodCategory = 'meal' | 'snack' | 'fastFood';

export type AccessorySlot = 'head' | 'face' | 'neck' | 'body';

export type PiggyActionState =
  | 'idle'
  | 'petted'
  | 'opening'
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

export type PetStickerId =
  | 'heart'
  | 'hungry'
  | 'happy'
  | 'sleepy'
  | 'cheers'
  | 'hug'
  | 'walk'
  | 'thankyou';

export interface PetStickerInfo {
  id: PetStickerId;
  label: string;
  caption: string;
  bgClass: string;
}

export interface PetMessage {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  stickerId: PetStickerId | null;
  createdAt: number;
}

export type IngredientId = 'carrot' | 'corn' | 'strawberry';

export interface IngredientInfo {
  id: IngredientId;
  name: string;
  emoji: string;
  growSeconds: number;
  seedCost: number;
  harvestYield: number;
  description: string;
}

export interface CropPlot {
  id: number;
  cropId: IngredientId | null;
  plantedAt: number | null;
  durationMs: number;
}

export interface KitchenRecipe {
  id: string;
  outputFoodId: string;
  name: string;
  emoji: string;
  description: string;
  ingredients: Partial<Record<IngredientId, number>>;
  bonusGrowth: number;
}

export interface PetSpeciesInfo {
  id: PetSpecies;
  label: string;
  shortName: string;
  eggColor: string;
  accentColor: string;
  favoriteFoodIds: string[];
  greeting: string;
  pettedSpeech: string;
  favoriteFoodReaction: string;
}

export type CatchGameMode = 'apple' | 'fries';

export interface GameState {
  version: number;
  pet: Pet;
  coins: number;
  foods: Record<string, number>;
  ingredients: Record<IngredientId, number>;
  farmPlots: CropPlot[];
  accessories: string[];
  weightLogs: WeightLog[];
  feedLogs: FeedLog[];
  dailyTasks: DailyTask[];
  dailyTasksDate: string;
  messages: PetMessage[];
  soundEnabled: boolean;
  lastSavedAt: number;
}

export interface FloatingFeedback {
  id: string;
  text: string;
  emoji?: string;
}

export type CloudSyncStatus = 'local' | 'syncing' | 'synced' | 'error';

export interface CloudUser {
  id: string;
  email: string;
}

export interface CloudSavePayload {
  state: GameState;
  updatedAt: string;
}

export interface SharedPetRoom {
  id: string;
  inviteCode: string;
  ownerId: string;
  ownerEmail: string;
  partnerId: string | null;
  partnerEmail: string | null;
  lastActorId: string | null;
  lastActorEmail: string | null;
  updatedAt: string;
}

