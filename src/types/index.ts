import type { FarmDecorationId } from './house';
import type { MinigameHubState } from './minigame';
export type { DuoPhotoPetInfo } from './house';

export type TabKey = 'home' | 'canteen' | 'wardrobe' | 'house' | 'journal' | 'quests' | 'pets';

export type PetSpecies = 'pig' | 'rabbit' | 'dog' | 'cat' | 'duck' | 'hamster';

export type FoodCategory = 'meal' | 'snack' | 'fastFood';

export type AccessorySlot = 'head' | 'face' | 'neck' | 'body' | 'held' | 'back';

export type AccessoryRarity = 'common' | 'advanced' | 'event' | 'coop';

export type AccessoryTheme =
  | 'strawberry_sweet'
  | 'forest_camp'
  | 'cloud_nap'
  | 'chef_master'
  | 'starry_explorer'
  | 'festival_party';

export type PhotoPose =
  | 'happy'
  | 'shy'
  | 'sleep'
  | 'eat'
  | 'spin'
  | 'pounce'
  | 'runway'
  | 'dance'
  | 'salute'
  | 'star_eyes'
  | 'crown_star'
  | 'anniversary_cheer'
  | 'strawberry_sweetheart'
  | 'collection_twirl';

export type PhotoBackground =
  | 'pink_room'
  | 'strawberry_field'
  | 'strawberry_season_field'
  | 'cloud_sky'
  | 'kitchen'
  | 'forest_camp'
  | 'starry_night_market'
  | 'beach_vacation'
  | 'sakura_path'
  | 'halloween_party'
  | 'christmas_cabin'
  | 'bird_treetop_sky'
  | 'squirrel_acorn_forest'
  | 'rabbit_carrot_garden'
  | 'forest_cabin'
  | 'acorn_trail'
  | 'lakeside_sunset'
  | 'waterfront_bridge'
  | 'market_night'
  | 'wooden_stalls'
  | 'dream_lodge_bg'
  | 'rainbow_trail_bg'
  | 'spring_picnic'
  | 'summer_festival'
  | 'maple_path'
  | 'harvest_farm'
  | 'snow_cabin'
  | 'christmas_market';

export type PhotoFilter =
  | 'none'
  | 'cream'
  | 'pink'
  | 'mint'
  | 'vintage'
  | 'starry'
  | 'candy'
  | 'strawberry'
  | 'forest'
  | 'cloud'
  | 'kitchen'
  | 'party'
  | 'morning_glow'
  | 'forest_warm_sun'
  | 'meadow_pastel'
  | 'forest_filter'
  | 'lake_aqua'
  | 'lakeside_breeze'
  | 'market_warm_sun'
  | 'collection_rainbow'
  | 'sakura_pink'
  | 'morning_dawn'
  | 'ocean_blue'
  | 'sunny_orange'
  | 'maple_red'
  | 'warm_gold'
  | 'snow_white'
  | 'hearth_orange';

export type PhotoFrame =
  | 'none'
  | 'rounded'
  | 'heart'
  | 'star'
  | 'polaroid'
  | 'lace'
  | 'gold'
  | 'golden_memory'
  | 'coop_heart'
  | 'strawberry_polaroid'
  | 'feather_frame'
  | 'acorn_frame'
  | 'carrot_frame'
  | 'waterdrop_frame'
  | 'duck_frame'
  | 'market_sign_frame'
  | 'wood_frame'
  | 'collection_prism_frame'
  | 'petal_frame'
  | 'butterfly_frame'
  | 'shell_frame'
  | 'popsicle_frame'
  | 'maple_frame'
  | 'pumpkin_frame'
  | 'snowflake_frame'
  | 'gingerbread_frame';

export type PhotoScene = 'wardrobe' | 'room' | 'farm' | 'album' | 'visitor' | 'town';

export type PhotoStickerId =
  | 'heart'
  | 'kiss'
  | 'burger'
  | 'fries'
  | 'carrot'
  | 'star'
  | 'ribbon'
  | 'pudding'
  | 'apple'
  | 'balloon'
  | 'moon'
  | 'fish'
  | 'strawberry';

export type StudioShopCategory = 'pose' | 'background' | 'filter' | 'frame' | 'sticker';

export type StudioItemSource = 'free' | 'shop' | 'achievement' | 'limited';

export type StudioBadgeId = 'outfit_master' | 'strawberry_photographer';

export type WeeklyOutfitChallengeThemeId =
  | 'strawberry_sweet'
  | 'forest_camp'
  | 'cloud_nap'
  | 'chef_master'
  | 'starry_explorer';

export interface WeeklyOutfitChallengeTheme {
  id: WeeklyOutfitChallengeThemeId;
  title: string;
  emoji: string;
  description: string;
  requiredAccessoryTheme: AccessoryTheme;
  targetBackgroundId: PhotoBackground;
  targetFilterId: PhotoFilter;
  targetFrameId: PhotoFrame;
  duoPrompt: string;
  badgeClass: string;
}

export interface StudioScoreBreakdown {
  totalScore: number;
  themeAccessoryCount: number;
  themeAccessoryPoints: number;
  backgroundMatched: boolean;
  backgroundPoints: number;
  filterMatched: boolean;
  filterPoints: number;
  frameMatched: boolean;
  framePoints: number;
  likedAccessoryCount: number;
  likedAccessoryPoints: number;
  fullSetCompleted: boolean;
  fullSetPoints: number;
}

export interface StudioCraftRecipe {
  id: string;
  targetKind: 'background' | 'frame' | 'filter' | 'pose' | 'sticker';
  targetId: string;
  name: string;
  emoji: string;
  description: string;
  materialCost: number;
  frameShardCost: number;
  coinCost: number;
}

export interface WeeklyPhotoChallengeProgress {
  weekKey: string;
  themeId: WeeklyOutfitChallengeThemeId;
  bestScore: number;
  submittedCount: number;
  claimedTiers: number[];
  lastBreakdown: StudioScoreBreakdown | null;
  lastPhotoId: string | null;
}

export interface CoopDuoChallengeSubmission {
  userId: string;
  userName: string;
  petId: string;
  petName: string;
  species: PetSpecies;
  equipped: Record<AccessorySlot, string | null>;
  poseId: PhotoPose;
  facing: PetViewDirection;
  weightAtCapture: number;
  submittedAt: number;
}

export interface CoopDuoPhotoChallengeState {
  weekKey: string;
  themeId: WeeklyOutfitChallengeThemeId;
  title: string;
  backgroundId: PhotoBackground;
  filterId: PhotoFilter;
  frameId: PhotoFrame;
  stickers: PhotoStickerId[];
  submissions: Record<string, CoopDuoChallengeSubmission>;
  mergedPhotoId: string | null;
  completed: boolean;
  completedAt: number | null;
  claimedByUserIds: string[];
}

export interface PhotoStudioState {
  unlockedPoses: PhotoPose[];
  unlockedBackgrounds: PhotoBackground[];
  unlockedFilters: PhotoFilter[];
  unlockedFrames: PhotoFrame[];
  unlockedStickers: PhotoStickerId[];
  studioMaterials: number;
  studioFrameShards: number;
  weeklyChallenge: WeeklyPhotoChallengeProgress;
  consecutiveChallengeWeeks: number;
  lastQualifiedChallengeWeek: string | null;
  unlockedStudioBadges: StudioBadgeId[];
  duoChallengeStreakWeeks: number;
  lastQualifiedDuoWeek: string | null;
  totalStudioPhotos: number;
}

export type PiggyActionState =
  | 'idle'
  | 'petted'
  | 'opening'
  | 'eating'
  | 'sleeping'
  | 'bathing'
  | 'walking'
  | 'stuffed';

export type PetTouchZone = 'head' | 'cheek' | 'belly' | 'paw';

export type PetExpression =
  | 'normal'
  | 'wink'
  | 'sparkle'
  | 'shy'
  | 'happyTongue'
  | 'ticklish';

export type PetViewDirection = 'front' | 'left' | 'back' | 'right' | 'flipped';

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
  personality?: PetPersonality;
  preference?: PetPreference;
  ownerId?: string;
  isSharedCoopPet?: boolean;
  adoptedAt?: number;
  source?: PetUnlockRuleType;
}

export type PetAbilityId =
  | 'pig_harvest_bonus'
  | 'rabbit_crop_speed'
  | 'dog_walk_bonus'
  | 'cat_photo_memory'
  | 'duck_visitor_rate'
  | 'hamster_ingredient_bonus';

export interface PetAbility {
  id: PetAbilityId;
  species: PetSpecies;
  title: string;
  summary: string;
  detail: string;
  bonusPercent: number;
  emoji: string;
}

export type PetUnlockRuleType =
  | 'starter'
  | 'slot_unlock'
  | 'minigames_count'
  | 'visitors_hosted'
  | 'town_orders_completed'
  | 'future_festival'
  | 'future_coop';

export interface PetUnlockCondition {
  species: PetSpecies;
  ruleType: PetUnlockRuleType;
  targetCount: number;
  label: string;
  description: string;
  reservedOnly?: boolean;
}

export interface PetSlotUnlockRule {
  slotNumber: number;
  title: string;
  conditionLabel: string;
  rewardText: string;
  rewardCoins: number;
  rewardShards?: number;
  rewardTickets?: number;
}

export interface ReservedSpecialPet {
  id: string;
  name: string;
  category: 'festival' | 'coop';
  unlockHint: string;
  emoji: string;
  status: 'coming_soon';
}

export type FamilyTaskId =
  | 'family_feed_1'
  | 'family_pet_3'
  | 'family_walk_1'
  | 'family_weigh_1';

export interface FamilyDailyTask {
  id: FamilyTaskId;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: TaskReward;
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
  rarity: AccessoryRarity;
  obtainMethod: string;
  theme: AccessoryTheme | null;
  suitablePersonalities: PersonalityId[];
}

export interface WeightLog {
  id: string;
  petId?: string;
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
  petId?: string;
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
  authorTitleId?: TitleId | null;
  content: string;
  stickerId: PetStickerId | null;
  createdAt: number;
  targetPetId?: string | null;
  targetPetName?: string | null;
}

export type IngredientId =
  | 'carrot'
  | 'corn'
  | 'strawberry'
  | 'pumpkin'
  | 'blueberry'
  | 'mint'
  | 'sunflower'
  | 'moon_wheat'
  | 'dream_cocoa'
  | 'watermelon'
  | 'apple'
  | 'mushroom'
  | 'white_radish'
  | 'winter_greens'
  | 'snowberry';

export interface IngredientInfo {
  id: IngredientId;
  name: string;
  emoji: string;
  growSeconds: number;
  seedCost: number;
  harvestYield: number;
  description: string;
  isOvernight?: boolean;
}

export interface CropPlot {
  id: number;
  cropId: IngredientId | null;
  plantedAt: number | null;
  durationMs: number;
  watered?: boolean;
  isGolden?: boolean;
  windblown?: boolean;
  autoWateredByRainDate?: string | null;
}

export interface YardMoodBuffPeriod {
  startedAt: number;
  expiresAt: number;
}

export interface KitchenRecipe {
  id: string;
  outputFoodId: string;
  name: string;
  emoji: string;
  description: string;
  hint?: string;
  ingredients: Partial<Record<IngredientId, number>>;
  bonusGrowth: number;
}

export interface PetSpeciesInfo {
  id: PetSpecies;
  label: string;
  shortName: string;
  emoji: string;
  eggColor: string;
  accentColor: string;
  favoriteFoodIds: string[];
  greeting: string;
  pettedSpeech: string;
  favoriteFoodReaction: string;
  zoneSpeeches: Record<PetTouchZone, string[]>;
}

export type CatchGameMode = 'apple' | 'fries';

export type TitleId =
  | 'gourmet_owner'
  | 'fashion_stylist'
  | 'strawberry_dreamer'
  | 'forest_camper'
  | 'cloud_napper'
  | 'coop_partner'
  | 'berry_sweetheart'
  | 'forest_explorer'
  | 'cloud_dreamer'
  | 'little_master_chef'
  | 'starlight_voyager'
  | 'party_superstar'
  | 'growth_sprout'
  | 'growth_chubby'
  | 'growth_radiant'
  | 'growth_superstar'
  | 'recipe_master'
  | 'bird_whisperer'
  | 'squirrel_friend'
  | 'rabbit_guardian'
  | 'coop_best_host'
  | 'fashion_photographer'
  | 'strawberry_sweetheart_title'
  | 'strawberry_fashionista'
  | 'town_explorer'
  | 'yard_host_master'
  | 'acorn_forest_ranger'
  | 'lakeside_angler'
  | 'town_market_vip'
  | 'pet_collector'
  | 'house_designer'
  | 'town_farmer'
  | 'town_host_title'
  | 'memory_collector'
  | 'collection_master'
  | 'sakura_picnic_host'
  | 'four_seasons_keeper'
  | 'weather_watcher';

export type PersonalityId =
  | 'greedy'
  | 'sleepy'
  | 'mischievous'
  | 'clingy'
  | 'elegant'
  | 'curious'
  | 'lively'
  | 'shy';

export interface PetPersonality {
  primary: PersonalityId;
  secondary: PersonalityId;
  scores: Record<PersonalityId, number>;
  careActionCounts: Record<string, number>;
  lastUpdatedAt: number;
}

export interface PetPreference {
  species: PetSpecies;
  favoriteFoodIds: string[];
  favoriteToyIds: string[];
  favoriteFurnitureIds: string[];
  favoriteAccessoryIds?: string[];
  dislikedFoodIds: string[];
  dislikedToyIds: string[];
  dislikedFurnitureIds: string[];
}

export interface Toy {
  id: string;
  name: string;
  emoji: string;
  category: 'toy';
  zone: 'play';
  price: number;
  sellPrice: number;
  description: string;
  petReactionText: string;
  petAction: PiggyActionState;
}

export type CoopGameType = 'room_decor' | 'farm_relay' | 'visitor_coop' | 'event_coop' | 'town_coop';

export type CoopRole = 'selector' | 'placer' | 'farmer' | 'chef';

export type CoopBadgeId =
  | 'best_partner'
  | 'room_stylist'
  | 'farm_relay_master'
  | 'town_host'
  | 'best_outfit_partner'
  | 'strawberry_sweetheart_partner'
  | 'town_explore_partner';

export interface CoopGoal {
  id: string;
  gameType: CoopGameType;
  title: string;
  description: string;
  themeId?: ThemeSetId;
  targetItemCount?: number;
  requiredFoodCounts?: Record<string, number>;
  requiredHarvestTotal?: number;
  requiredCraftTotal?: number;
}

export interface CoopProgress {
  completedCount: number;
  targetCount: number;
  harvestedCount: number;
  harvestTarget: number;
  craftedCount: number;
  craftTarget: number;
  foodsDone: Record<string, number>;
}

export interface CoopReward {
  id: string;
  gameType: CoopGameType;
  title: string;
  coins: number;
  furnitureShards: number;
  intimacy: number;
  rareIngredients: Partial<Record<IngredientId, number>>;
  badgeId?: CoopBadgeId;
  messageCardTitle?: string;
  messageCardBody?: string;
  claimedByUserIds: string[];
  createdAt: number;
}

export interface CoopRoomCandidate {
  queueId: string;
  itemId: string;
  selectedByUserId: string;
  selectedByName: string;
  selectedAt: number;
  placed: boolean;
}

export interface CoopOfflineEvent {
  id: string;
  actorUserId: string;
  actorName: string;
  gameType: CoopGameType;
  summary: string;
  createdAt: number;
}

export interface CoopMessageCard {
  id: string;
  title: string;
  body: string;
  emoji: string;
  earnedDate: string;
  createdAt: number;
}

export interface CoopSession {
  id: string;
  gameType: CoopGameType;
  status: 'idle' | 'active' | 'completed' | 'expired';
  themeId: ThemeSetId;
  goal: CoopGoal;
  progress: CoopProgress;
  startedAt: number;
  expiresAt: number;
  durationSeconds: number;
  candidateQueue: CoopRoomCandidate[];
  placedInstanceIds: string[];
  settled: boolean;
  rewardId: string | null;
}

export interface CoopFarmOrderState {
  dateKey: string;
  goal: CoopGoal;
  progress: CoopProgress;
  expiresAt: number;
  completed: boolean;
  overdue: boolean;
  rewardClaimed: boolean;
  rewardId: string | null;
}

export type VisitorId = 'bird' | 'squirrel' | 'rabbit';

export type VisitorBehavior = 'walking' | 'sitting' | 'smelling' | 'looking_farm';

export type VisitorTreatId =
  | 'seeds_mix'
  | 'roasted_nuts'
  | 'fresh_lettuce'
  | 'red_chili';

export type VisitorOffering =
  | { kind: 'ingredient'; id: IngredientId }
  | { kind: 'food'; id: string }
  | { kind: 'treat'; id: VisitorTreatId };

export type VisitorDecorId =
  | 'oak_tree'
  | 'potted_herbs'
  | 'bird_feeder'
  | 'nut_bowl'
  | 'flower_arch'
  | 'feather_windchime'
  | 'acorn_ornament'
  | 'rabbit_garden_statue';

export interface VisitorDecorItem {
  id: VisitorDecorId;
  name: string;
  emoji: string;
  price: number;
  description: string;
  attractsVisitorId: VisitorId;
  unlockByAffinity?: { visitorId: VisitorId; level: number };
}

export interface VisitorTreat {
  id: VisitorTreatId;
  name: string;
  emoji: string;
  price: number;
  description: string;
}

export interface VisitorPreference {
  favoriteOfferingKeys: string[];
  neutralOfferingKeys: string[];
  dislikedOfferingKeys: string[];
  favoriteTagsLabel: string;
  dislikedTagsLabel: string;
  preferredYardDecorIds: VisitorDecorId[];
  preferredFarmDecorIds: FarmDecorationId[];
  preferredCropIds: IngredientId[];
}

export interface VisitorLevelReward {
  level: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  decorId?: VisitorDecorId;
  accessoryId?: string;
  titleId?: TitleId;
  studioMaterials?: number;
  unlockStudio?: {
    backgroundId?: PhotoBackground;
    filterId?: PhotoFilter;
    frameId?: PhotoFrame;
  };
}

export interface Visitor {
  id: VisitorId;
  name: string;
  speciesLabel: string;
  emoji: string;
  accentColor: string;
  bgGradient: string;
  description: string;
  yardTip: string;
  baseWeight: number;
  stayDurationMs: number;
  preference: VisitorPreference;
  arrivalLines: string[];
  favoriteFeedLines: string[];
  neutralFeedLines: string[];
  dislikedFeedLines: string[];
  yardLikeLine: string;
  levelRewards: VisitorLevelReward[];
}

export interface VisitorVisit {
  visitId: string;
  visitorId: VisitorId;
  arrivedAt: number;
  departAt: number;
  behavior: VisitorBehavior;
  behaviorChangedAt: number;
  fedCount: number;
  maxFeedCount: number;
  lastFeedReaction: 'favorite' | 'neutral' | 'disliked' | null;
  lastFeedLine: string | null;
  lastRewardSummary: string | null;
  photoTaken: boolean;
  likesYard: boolean;
  yardMatchReasons: string[];
}

export interface VisitorAffinity {
  visitorId: VisitorId;
  level: number;
  exp: number;
  totalVisits: number;
  totalFed: number;
  unlockedCostume: boolean;
  unlockedDecor: boolean;
  firstHostedAt: number | null;
}

export interface VisitorSystemState {
  dateKey: string;
  dailyVisitCount: number;
  maxDailyVisits: number;
  nextSpawnAt: number;
  activeVisit: VisitorVisit | null;
  affinities: Record<VisitorId, VisitorAffinity>;
  ownedYardDecors: VisitorDecorId[];
  placedYardDecors: VisitorDecorId[];
  arrivalNoticeUnread: boolean;
}

export interface CoopVisitorRequirement {
  key: string;
  kind: 'ingredient' | 'food' | 'treat';
  itemId: string;
  label: string;
  emoji: string;
  requiredQty: number;
  contributedQty: number;
}

export interface CoopVisitorContribution {
  id: string;
  userId: string;
  userName: string;
  itemKey: string;
  itemLabel: string;
  qty: number;
  createdAt: number;
}

export interface CoopVisitorSession {
  id: string;
  dateKey: string;
  visitorId: VisitorId;
  title: string;
  description: string;
  requirements: CoopVisitorRequirement[];
  contributions: CoopVisitorContribution[];
  completed: boolean;
  completedAt: number | null;
  rewardCoins: number;
  rewardShards: number;
  rewardTickets: number;
  rewardRareIngredients: Partial<Record<IngredientId, number>>;
  claimedByUserIds: string[];
  photoTaken: boolean;
  sharedToBoard: boolean;
}

export type TownOrderCategory = 'visitor' | 'coop' | 'photo' | 'advanced';

export interface TownOrderItemReq {
  key: string;
  kind: 'ingredient' | 'food' | 'treat';
  itemId: string;
  label: string;
  emoji: string;
  requiredQty: number;
  deliveredQty: number;
}

export interface TownOrderPhotoReq {
  targetCount: number;
  currentCount: number;
  visitorId?: VisitorId;
  requiresStudioScene?: boolean;
  label: string;
}

export interface TownOrderReward {
  coins: number;
  furnitureShards: number;
  farmSpeedTickets: number;
  rareIngredients: Partial<Record<IngredientId, number>>;
  treats?: Partial<Record<VisitorTreatId, number>>;
  studioMaterials?: number;
  unlockStudio?: {
    backgroundId?: PhotoBackground;
    filterId?: PhotoFilter;
    frameId?: PhotoFrame;
  };
}

export interface TownOrder {
  id: string;
  dateKey: string;
  category: TownOrderCategory;
  visitorId?: VisitorId;
  title: string;
  description: string;
  emoji: string;
  requirements: TownOrderItemReq[];
  photoRequirement?: TownOrderPhotoReq;
  reward: TownOrderReward;
  createdAt: number;
  expiresAt: number;
  completed: boolean;
  completedAt: number | null;
  overdue: boolean;
  claimedByUserIds: string[];
}

export interface CoopHubState {
  activeRoomSession: CoopSession | null;
  dailyFarmOrder: CoopFarmOrderState;
  sharedWarehouse: Record<IngredientId, number>;
  coopFarmPlots: CropPlot[];
  pendingRewards: CoopReward[];
  unlockedBadges: CoopBadgeId[];
  earnedCards: CoopMessageCard[];
  streakDays: number;
  lastCoopCompletedDate: string | null;
  offlineEvents: CoopOfflineEvent[];
  lastSeenByUserId: Record<string, number>;
  coopVisitor?: CoopVisitorSession | null;
  visitorStreakDays?: number;
  lastVisitorCompletedDate?: string | null;
  partnerShowcasePets?: Pet[];
  duoChallenge?: CoopDuoPhotoChallengeState | null;
  duoStreakWeeks?: number;
  lastDuoCompletedWeek?: string | null;
  coopEventSession?: CoopEventSession | null;
  coopTownSession?: CoopTownExploreSession | null;
  townExploreStreakDays?: number;
  lastTownExploreCompletedDate?: string | null;
}

export type TownLocationId =
  | 'home_yard'
  | 'acorn_forest'
  | 'lake_park'
  | 'town_market'
  | 'festival_plaza';

export type ActiveTownLocationId = Exclude<TownLocationId, 'festival_plaza'>;

export type TownVisitorId =
  | 'bird'
  | 'squirrel'
  | 'rabbit'
  | 'butterfly'
  | 'hedgehog'
  | 'deer'
  | 'duck'
  | 'frog'
  | 'otter'
  | 'cat_visitor'
  | 'dog_visitor'
  | 'hamster_visitor'
  | 'fox'
  | 'sakura_sprite'
  | 'firefly'
  | 'snow_fox'
  | 'arctic_bunny';

export type TownVisitorRarity = 'common' | 'rare';

export type VisitorHutFacilityId =
  | 'bird_feeder'
  | 'nut_bowl'
  | 'carrot_patch'
  | 'mini_pond'
  | 'flower_bush'
  | 'lantern'
  | 'treat_table'
  | 'rare_sign';

export interface VisitorHutLevelInfo {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  emoji: string;
  upgradeCostCoins: number;
  dailyCapacityBonus: number;
  stayBonusPercent: number;
  rareRateBonusPercent: number;
  description: string;
  unlockBonusText: string;
  rewardBackgroundId?: PhotoBackground;
}

export interface VisitorHutFacility {
  id: VisitorHutFacilityId;
  name: string;
  emoji: string;
  priceCoins: number;
  description: string;
  effectLabel: string;
  targetVisitorId?: TownVisitorId;
}

export interface VisitorHutState {
  level: 1 | 2 | 3 | 4 | 5;
  builtFacilities: VisitorHutFacilityId[];
}

export interface TownLocationDefinition {
  id: TownLocationId;
  name: string;
  subtitle: string;
  emoji: string;
  themeGradient: string;
  badgeClass: string;
  description: string;
  unlockConditionLabel: string;
  commonVisitorIds: TownVisitorId[];
  rareVisitorIds: TownVisitorId[];
  rewardHighlights: string[];
  recommendedBackgroundIds: PhotoBackground[];
  recommendedFilterIds: PhotoFilter[];
  recommendedFrameIds: PhotoFrame[];
  reserved?: boolean;
}

export interface TownVisitorDefinition {
  id: TownVisitorId;
  name: string;
  speciesLabel: string;
  emoji: string;
  rarity: TownVisitorRarity;
  homeLocationIds: ActiveTownLocationId[];
  accentColor: string;
  bgGradient: string;
  description: string;
  baseWeight: number;
  stayDurationMs: number;
  favoriteOfferingKeys: string[];
  dislikedOfferingKeys: string[];
  favoriteTagsLabel: string;
  dislikedTagsLabel: string;
  arrivalLines: string[];
  favoriteFeedLines: string[];
  neutralFeedLines: string[];
  dislikedFeedLines: string[];
  rareBonusLabel?: string;
}

export interface TownLocationVisitorInstance {
  visitId: string;
  locationId: ActiveTownLocationId;
  visitorId: TownVisitorId;
  rarity: TownVisitorRarity;
  arrivedAt: number;
  departAt: number;
  fedCount: number;
  maxFeedCount: number;
  photoTaken: boolean;
  lastFeedReaction: 'favorite' | 'neutral' | 'disliked' | null;
  lastFeedLine: string | null;
  lastRewardSummary: string | null;
}

export interface TownVisitorAffinityRecord {
  visitorId: TownVisitorId;
  level: number;
  exp: number;
  totalVisits: number;
  totalFed: number;
  totalPhotos: number;
  firstMetAt: number | null;
}

export type TownQuestKind =
  | 'host_location_visitor'
  | 'photo_location'
  | 'photo_visitor'
  | 'forage_acorn'
  | 'lake_fishing'
  | 'deliver_market_dish'
  | 'buy_market_furniture';

export interface TownLocationQuest {
  id: string;
  locationId: ActiveTownLocationId;
  kind: TownQuestKind;
  title: string;
  description: string;
  emoji: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  targetVisitorId?: TownVisitorId;
  rewardTownTickets: number;
  rewardCoins: number;
  rewardStudioMaterials?: number;
  rewardFurnitureShards?: number;
  rewardFilterShards?: number;
  rewardIngredientId?: IngredientId;
  rewardIngredientQty?: number;
}

export interface TownLocationProgressState {
  locationId: ActiveTownLocationId;
  dailyDate: string;
  dailyVisitorsCount: number;
  activeVisitors: TownLocationVisitorInstance[];
  dailyQuests: TownLocationQuest[];
  allQuestsBonusClaimed: boolean;
  totalVisitsHosted: number;
  totalPhotosTaken: number;
  unlockedBackgroundIds: PhotoBackground[];
  unlockedFilterIds: PhotoFilter[];
  unlockedFrameIds: PhotoFrame[];
  encyclopediaRewardClaimed: boolean;
}

export type TownShopItemCategory = 'filter' | 'background' | 'accessory' | 'title';

export interface TownShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: TownShopItemCategory;
  targetId: string;
  ticketPrice: number;
  locationLabel: string;
}

export type CoopTownExploreTemplateId = 'forest_picnic' | 'lake_fishing';

export interface CoopTownExploreStep {
  key: 'acorn' | 'forest_photo' | 'fishing' | 'duck_care';
  label: string;
  emoji: string;
  target: number;
  progress: number;
  contributorUserIds: string[];
}

export interface CoopTownExploreSession {
  id: string;
  templateId: CoopTownExploreTemplateId;
  locationId: ActiveTownLocationId;
  dateKey: string;
  title: string;
  description: string;
  emoji: string;
  steps: CoopTownExploreStep[];
  completed: boolean;
  completedAt: number | null;
  claimedByUserIds: string[];
  lastUpdatedByName: string | null;
  lastUpdatedAt: number | null;
}

export interface TownCurrency {
  balance: number;
  totalEarned: number;
}

export interface TownMapState {
  currentLocationId: ActiveTownLocationId;
  unlockedLocationIds: ActiveTownLocationId[];
  townTickets: TownCurrency;
  visitorHut: VisitorHutState;
  locations: Record<ActiveTownLocationId, TownLocationProgressState>;
  visitorAffinities: Record<TownVisitorId, TownVisitorAffinityRecord>;
  purchasedShopItemIds: string[];
  unlockedMarketFurnitureIds: string[];
  acornsCollectedTotal: number;
  fishingGamesPlayedTotal: number;
  fishingBestScore: number;
  marketDishesDeliveredTotal: number;
}

export type EventId = 'strawberry_season';

export type EventCurrencyId = 'strawberry_ticket';

export interface EventCurrency {
  id: EventCurrencyId;
  name: string;
  emoji: string;
  balance: number;
  totalEarned: number;
  convertedToCoins: number;
  convertedToMaterials: number;
}

export type EventTaskKind =
  | 'plant_strawberry'
  | 'feed_strawberry'
  | 'photo_strawberry'
  | 'equip_strawberry_acc'
  | 'cook_strawberry'
  | 'play_minigame'
  | 'coop_event_task';

export interface EventTask {
  id: string;
  kind: EventTaskKind;
  title: string;
  description: string;
  emoji: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardTickets: number;
  rewardCoins: number;
  rewardIngredientId?: IngredientId;
  rewardIngredientQty?: number;
  rewardStudioMaterials?: number;
}

export type EventMilestoneId =
  | 'strawberry_rookie'
  | 'strawberry_photographer'
  | 'strawberry_stylist'
  | 'strawberry_chef'
  | 'strawberry_sweetheart'
  | 'strawberry_party';

export interface EventMilestone {
  id: EventMilestoneId;
  title: string;
  description: string;
  emoji: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardTickets: number;
  rewardCoins: number;
  rewardSummary: string;
  rewardAccessoryId?: string;
  rewardFilterId?: PhotoFilter;
  rewardBackgroundId?: PhotoBackground;
  rewardFrameId?: PhotoFrame;
  rewardTitleId?: TitleId;
  rewardIngredient?: { id: IngredientId; qty: number };
  createsSharedMemory?: boolean;
}

export type EventShopItemCategory =
  | 'accessory'
  | 'background'
  | 'filter'
  | 'frame'
  | 'pose'
  | 'title';

export interface EventShopItem {
  id: string;
  eventId: EventId;
  name: string;
  emoji: string;
  description: string;
  category: EventShopItemCategory;
  targetId: string;
  ticketPrice: number;
  badgeText: string;
}

export interface EventPhotoScoreBreakdown {
  totalScore: number;
  strawberryAccCount: number;
  strawberryAccPoints: number;
  backgroundMatched: boolean;
  backgroundPoints: number;
  filterMatched: boolean;
  filterPoints: number;
  frameMatched: boolean;
  framePoints: number;
  fedStrawberryFood: boolean;
  fedStrawberryPoints: number;
  fullSetCompleted: boolean;
  fullSetPoints: number;
}

export interface EventPhotoChallenge {
  weekKey: string;
  weekNumber: number;
  title: string;
  description: string;
  bestScore: number;
  submittedCount: number;
  claimedTiers: number[];
  lastPhotoId: string | null;
  lastBreakdown: EventPhotoScoreBreakdown | null;
}

export interface CoopEventSession {
  id: string;
  eventId: EventId;
  dateKey: string;
  title: string;
  description: string;
  harvestTarget: number;
  harvestCount: number;
  harvestedByUserIds: string[];
  cookTarget: number;
  cookCount: number;
  cookedByUserIds: string[];
  photoTarget: number;
  photoCount: number;
  photoByUserIds: string[];
  completed: boolean;
  completedAt: number | null;
  claimedByUserIds: string[];
  picnicPhotoId: string | null;
  lastUpdatedByName: string | null;
  lastUpdatedAt: number | null;
}

export interface EventRecapCard {
  eventId: EventId;
  seasonKey: string;
  completedTasksCount: number;
  totalTicketsEarned: number;
  photosTakenCount: number;
  accessoriesCollectedCount: number;
  recipesCookedCount: number;
  coopCompletedCount: number;
  bestPhotoId: string | null;
  coverPhotoId: string | null;
  savedToMemories: boolean;
  endedSettled: boolean;
  convertedCoins: number;
  convertedMaterials: number;
}

export interface EventStatsCounter {
  completedTasksCount: number;
  plantedOrHarvestedStrawberries: number;
  strawberryDishesCooked: number;
  strawberryPhotosTaken: number;
  coopPartyCompletedCount: number;
}

export interface SeasonalEvent {
  eventId: EventId;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'ended';
  currency: EventCurrency;
  dailyDate: string;
  dailyTasks: EventTask[];
  weeklyChallenge: EventPhotoChallenge;
  consecutiveChallengeWeeks: number;
  lastQualifiedChallengeWeek: string | null;
  fedStrawberryFoodWeekKey: string | null;
  milestones: EventMilestone[];
  purchasedShopItemIds: string[];
  eventPhotoIds: string[];
  stats: EventStatsCounter;
  coopStreakDays: number;
  lastCoopCompletedDate: string | null;
  recap: EventRecapCard;
  carryoverCatalogItemIds: string[];
}

export type DialogueId = string;

export type DialogueCategory =
  | 'urgent'
  | 'memory'
  | 'special'
  | 'personality'
  | 'time'
  | 'weather'
  | 'daily'
  | 'coop';

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export type WeatherCondition =
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'snow'
  | 'storm'
  | 'hot'
  | 'windy';

export interface WeatherCityOption {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  climateBias: 'warm' | 'mild' | 'cool' | 'snowy';
}

export interface WeatherState {
  condition: WeatherCondition;
  temperatureC: number;
  label: string;
  emoji: string;
  source: 'fixed' | 'api_ready';
  updatedAt: number;
  cityId?: string;
  cityName?: string;
  nextRefreshAt?: number;
  lastSyncedOnlineAt?: number | null;
  isOfflineFallback?: boolean;
  seasonId?: SeasonId;
  mode?: 'simulated' | 'live';
}

export type TimePeriodId =
  | 'dawn'
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'late_night';

export type PetMemoryEventType =
  | 'fedFavoriteFood'
  | 'fedDislikedFood'
  | 'petted'
  | 'bathed'
  | 'walked'
  | 'slept'
  | 'newAccessory'
  | 'newRoomItem'
  | 'partnerMessage'
  | 'partnerFed'
  | 'weightLogged'
  | 'stuffed'
  | 'milestone';

export interface PetMemoryEvent {
  id: string;
  type: PetMemoryEventType;
  detail: string;
  createdAt: number;
  dateKey: string;
  actorId?: string;
  actorName?: string;
  foodId?: string;
  itemId?: string;
  mentionedAt?: number | null;
  isCoopHighlight?: boolean;
}

export type DialogueActionType =
  | 'walk'
  | 'feed_pudding'
  | 'feed_meal'
  | 'hug'
  | 'sleep'
  | 'bath'
  | 'ack';

export interface DialogueResponse {
  id: string;
  label: string;
  emoji: string;
  actionType: DialogueActionType;
  replyText: string;
  intimacyGain: number;
  moodGain: number;
  petAction: PiggyActionState;
  expression: PetExpression;
}

export interface DialogueLine {
  id: DialogueId;
  category: DialogueCategory;
  text: string;
  priority: number;
  createdAt: number;
  memoryEventId?: string;
  memoryEventType?: PetMemoryEventType;
  timePeriod?: TimePeriodId;
  weatherCondition?: WeatherCondition;
  responses: DialogueResponse[];
  respondedId?: string | null;
  respondedLabel?: string;
  isCoopHighlight?: boolean;
  actorId?: string;
}

export interface DialogueSettings {
  muteWeatherChat: boolean;
  muteNightNotice: boolean;
  muteAllProactive: boolean;
}

export interface DialogueState {
  activeBubble: DialogueLine | null;
  history: DialogueLine[];
  memoryEvents: PetMemoryEvent[];
  settings: DialogueSettings;
  weather: WeatherState;
  lastProactiveAt: number;
  nextCooldownMs: number;
  dailyKey: string;
  urgentRemindersToday: number;
  lastUrgentAtByStat: Partial<Record<'hunger' | 'mood' | 'cleanliness' | 'energy', number>>;
  greetedPeriodsToday: TimePeriodId[];
  consecutiveCareDays: number;
  lastCareDate: string | null;
  announcedWeightMilestones: number[];
  lastWeatherDialogueDate?: string | null;
  lastWeatherDialogueCondition?: WeatherCondition | null;
}

export type StageBackgroundId =
  | 'default'
  | 'starlight_garden'
  | 'strawberry_cafe'
  | 'forest_camp_bg'
  | 'cloud_dream_bg'
  | 'chef_bistro_bg'
  | 'starry_cosmos_bg'
  | 'party_carnival_bg';

export type NoviceDayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface NoviceGrowthStats {
  startedDate: string;
  claimedDays: number[];
  lastClaimDate: string | null;
  feedCount: number;
  petCount: number;
  plantedCarrotCount: number;
  minigameCount: number;
  cookedCount: number;
  weightRecordCount: number;
  boughtAccessoryCount: number;
  walkCount: number;
  fedFavoriteCount: number;
  completedDailyTasksCount: number;
  createdSharedRoom: boolean;
}

export interface EncyclopediaState {
  collectedFoodIds: string[];
  learnedRecipeIds: string[];
  claimedRecipeMilestones?: number[];
  claimedAccessoryMilestones: number[];
  claimedAccessoryThemeSets: AccessoryTheme[];
  unlockedTitles: TitleId[];
  activeTitle: TitleId | null;
  accessoryWearCounts?: Record<string, number>;
  claimedTotalMilestones?: number[];
  unlockedCollectionBadges?: CollectionBadgeId[];
  unlockedChainSetIds?: string[];
  collectionReminderEnabled?: boolean;
  lastCollectionReminderDate?: string | null;
  lastCollectionReminderDismissedDate?: string | null;
  collectionOfflineSummary?: CollectionOfflineSummary | null;
}

export type FeedingVisualEffect = 'none' | 'hearts' | 'favoriteJump' | 'stuffed';

export interface FeedingReactionRule {
  speeches: string[];
  feedbackText: string;
  feedbackEmoji: string;
  expression: PetExpression;
  particleEmojis: string[];
}

import type { RoomPhotoRecord, SharedHouse, ThemeSetId } from './house';

export type {
  RoomZone,
  FurnitureCategory,
  FurnitureTier,
  ThemeSetId,
  WallpaperId,
  FlooringId,
  RoomPhotoPoseId,
  RoomItem,
  PlacedRoomItem,
  FurnitureNote,
  RoomLayout,
  FarmUpgradeId,
  FarmUpgrade,
  FarmDecorationCategory,
  FarmDecorationId,
  FarmDecoration,
  SharedGoalId,
  SharedGoal,
  SharedMilestoneId,
  PhotoComment,
  RoomPhotoRecord,
  TreasuryContribution,
  SharedHouse,
} from './house';

export type MemoryType =
  | 'hatching'
  | 'feeding'
  | 'wardrobe'
  | 'room'
  | 'farm'
  | 'weight'
  | 'growth'
  | 'coop'
  | 'cooperation'
  | 'festival'
  | 'dialogue'
  | 'milestone'
  | 'visitor'
  | 'town';

export interface MemoryEntry {
  id: string;
  uniqueKey?: string;
  petId?: string;
  type: MemoryType;
  title: string;
  description: string;
  dateKey: string;
  createdAt: number;
  emoji: string;
  photoId?: string;
  accessoryId?: string;
  foodId?: string;
  weight?: number;
  level?: number;
  dialogueText?: string;
  actorName?: string;
  isShared?: boolean;
}

export type PhotoEntry = RoomPhotoRecord;

export type GameMilestoneId =
  | 'first_feed'
  | 'first_burger'
  | 'first_fries'
  | 'first_equip_accessory'
  | 'first_weight_log'
  | 'first_room_decor'
  | 'first_farm_harvest'
  | 'reach_lv2'
  | 'reach_lv3'
  | 'reach_lv4'
  | 'coop_7_days'
  | 'day_100_anniversary';

export interface Milestone {
  id: GameMilestoneId;
  title: string;
  description: string;
  conditionLabel: string;
  emoji: string;
  rewardCoins: number;
  rewardGrowth: number;
  rewardCardTitle: string;
  rewardPoseId?: PhotoPose;
  rewardFrameId?: PhotoFrame;
  unlocked: boolean;
  unlockedAt: number | null;
  unlockedDateKey: string | null;
}

export type SharedMemoryKey =
  | 'shared_first_naming'
  | 'shared_first_feed'
  | 'shared_first_message'
  | 'shared_first_coop_task'
  | 'shared_first_buy_furniture'
  | 'shared_house_7_days'
  | 'shared_house_30_days'
  | 'shared_house_100_days';

export interface SharedMemory {
  id: string;
  key: SharedMemoryKey;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  createdAt: number | null;
  dateKey: string | null;
  petName: string;
  actors: string[];
  rewardCoins: number;
  rewardIntimacy: number;
  rewardCardTitle: string;
  notifiedUserIds: string[];
}

export interface MonthlyActivityTracker {
  monthKey: string;
  foodCounts: Record<string, number>;
  interactionCounts: Record<string, number>;
  accessoryCounts: Record<string, number>;
  startWeight: number | null;
  endWeight: number | null;
  growthGained: number;
  coopMessagesCount: number;
  coopTasksCount: number;
}

export interface MonthlyRecap {
  id: string;
  monthKey: string;
  createdAt: number;
  generatedDateKey: string;
  favoriteFoodId: string | null;
  favoriteFoodName: string;
  topInteractionLabel: string;
  favoriteAccessoryId: string | null;
  favoriteAccessoryName: string;
  weightDelta: number;
  growthGained: number;
  coopMessagesCount: number;
  coopTasksCount: number;
  bestPhotoId: string | null;
  coverPhotoId: string | null;
  savedToAlbum: boolean;
}

export interface MemoryAlbumState {
  memories: MemoryEntry[];
  favoriteMemoryIds: string[];
  milestones: Milestone[];
  sharedMemories: SharedMemory[];
  sharedRoomStartedDate: string | null;
  sharedRoomId: string | null;
  monthlyRecaps: MonthlyRecap[];
  monthlyTrackers: Record<string, MonthlyActivityTracker>;
  unlockedPhotoPoses: PhotoPose[];
  unlockedPhotoFrames: PhotoFrame[];
  savedDialogueIds: string[];
}

export interface GameState {
  version: number;
  pets: Pet[];
  activePetId: string;
  coins: number;
  furnitureShards: number;
  foods: Record<string, number>;
  ingredients: Record<IngredientId, number>;
  farmPlots: CropPlot[];
  yardMoodBuffPeriods: YardMoodBuffPeriod[];
  accessories: string[];
  weightLogs: WeightLog[];
  feedLogs: FeedLog[];
  dailyTasks: DailyTask[];
  dailyTasksDate: string;
  familyDailyTasks?: FamilyDailyTask[];
  familyDailyTasksDate?: string;
  claimedPetSlots?: number[];
  completedTownOrdersCount?: number;
  reservedSpecialPets?: ReservedSpecialPet[];
  messages: PetMessage[];
  soundEnabled: boolean;
  lastSavedAt: number;
  noviceGrowth: NoviceGrowthStats;
  encyclopedia: EncyclopediaState;
  unlockedBackgrounds: StageBackgroundId[];
  activeBackground: StageBackgroundId;
  minigameHub: MinigameHubState;
  house: SharedHouse;
  personality: PetPersonality;
  coop: CoopHubState;
  dialogue: DialogueState;
  memoryAlbum: MemoryAlbumState;
  farmSpeedTickets?: number;
  visitorTreats?: Partial<Record<VisitorTreatId, number>>;
  visitorState?: VisitorSystemState;
  townOrders?: TownOrder[];
  photoStudio?: PhotoStudioState;
  seasonalEvent?: SeasonalEvent;
  filterShards?: number;
  townMap?: TownMapState;
  seasonSystem?: SeasonSystemState;
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

export type CollectionCategoryId =
  | 'pets'
  | 'foods'
  | 'accessories'
  | 'sets'
  | 'room'
  | 'farm'
  | 'visitors'
  | 'town'
  | 'studio'
  | 'memories';

export type CollectionFilterId =
  | 'all'
  | 'owned'
  | 'unowned'
  | 'purchasable'
  | 'event'
  | 'coop'
  | 'craftable'
  | 'expiring';

export type CollectionJumpTarget =
  | 'home'
  | 'canteen'
  | 'wardrobe'
  | 'house'
  | 'town'
  | 'studio'
  | 'memories'
  | 'pets'
  | 'events';

export type CollectionRarity = 'common' | 'rare' | 'epic' | 'event' | 'coop';

export type CollectionPreviewKind =
  | 'pet'
  | 'food'
  | 'accessory'
  | 'furniture'
  | 'crop'
  | 'visitor'
  | 'studio_bg'
  | 'studio_filter'
  | 'studio_frame'
  | 'emoji';

export interface CollectionItem {
  id: string;
  categoryId: CollectionCategoryId;
  name: string;
  emoji: string;
  description: string;
  owned: boolean;
  rarity: CollectionRarity;
  obtainMethod: string;
  mysteryHint?: string;
  filters: CollectionFilterId[];
  price?: number;
  wearCount?: number;
  affinityLevel?: number;
  coopProgressText?: string;
  eventRemainingText?: string;
  isExpiring?: boolean;
  isMysteryVisitor?: boolean;
  jumpTarget: CollectionJumpTarget;
  jumpLabel: string;
  previewKind: CollectionPreviewKind;
  previewId: string;
  subtitle?: string;
  tagText?: string;
}

export interface CollectionCategoryProgress {
  id: CollectionCategoryId;
  label: string;
  emoji: string;
  description: string;
  collected: number;
  total: number;
  percent: number;
}

export interface CollectionMilestone {
  percent: number;
  title: string;
  rewardSummary: string;
  rewardCoins: number;
  rewardFilterShards?: number;
  rewardStudioBgId?: PhotoBackground;
  rewardStudioFilterId?: PhotoFilter;
  rewardStudioFrameId?: PhotoFrame;
  rewardStudioPoseId?: PhotoPose;
  rewardAccessoryId?: string;
  rewardFurnitureId?: string;
  rewardTitleId?: TitleId;
}

export interface CollectionChainSet {
  id: string;
  name: string;
  emoji: string;
  tier: 'active' | 'chain';
  sourceThemeId?: AccessoryTheme;
  unlockRequirementText: string;
  rewardTitleId?: TitleId;
  rewardTitleName: string;
  description: string;
  pieceIds: string[];
  pieceNames: string[];
}

export type CollectionBadgeId =
  | 'badge_collection_10'
  | 'badge_collection_50'
  | 'badge_collection_100'
  | 'badge_pets_master'
  | 'badge_foods_master'
  | 'badge_fashion_master'
  | 'badge_sets_3'
  | 'badge_house_master'
  | 'badge_town_explorer'
  | 'badge_studio_director';

export interface CollectionBadge {
  id: CollectionBadgeId;
  name: string;
  emoji: string;
  description: string;
  unlockCondition: string;
  categoryId?: CollectionCategoryId;
}

export interface CollectionOfflineSummary {
  dateKey: string;
  totalCollected: number;
  totalCount: number;
  totalPercent: number;
  newItemsCount: number;
  unlockedMilestones: number[];
  unlockedTitleIds: TitleId[];
}

export interface CollectionProgress {
  totalCollected: number;
  totalCount: number;
  totalPercent: number;
  categories: CollectionCategoryProgress[];
  nextMilestone: CollectionMilestone | null;
  itemsToNextMilestone: number;
}

export interface SeasonCrop {
  id: IngredientId;
  name: string;
  emoji: string;
  primarySeason: SeasonId;
  coldHardy?: boolean;
  weatherBonusTags: string[];
  description: string;
}

export interface SeasonVisitor {
  visitorId: TownVisitorId;
  name: string;
  speciesLabel: string;
  emoji: string;
  seasons: SeasonId[];
  rarity: TownVisitorRarity;
  preferredWeather: WeatherCondition[];
  description: string;
  bonusTags: string[];
}

export interface SeasonPhotoContent {
  seasonId: SeasonId;
  label: string;
  backgroundIds: PhotoBackground[];
  filterIds: PhotoFilter[];
  frameIds: PhotoFrame[];
  unlockHint: string;
}

export type WeatherTaskKind =
  | 'walk'
  | 'bath_or_sleep'
  | 'snow_photo'
  | 'cooling_food'
  | 'minigame'
  | 'soothe_pet'
  | 'indoor_care';

export interface WeatherTask {
  id: string;
  dateKey: string;
  weatherCondition: WeatherCondition;
  kind: WeatherTaskKind;
  title: string;
  description: string;
  emoji: string;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  rewardCoins: number;
  rewardStudioMaterials?: number;
  rewardFilterShards?: number;
  rewardSpeedTickets?: number;
  rewardSummary: string;
}

export type SeasonEventId =
  | 'spring_sakura_picnic'
  | 'summer_beach_fest'
  | 'autumn_harvest_fest'
  | 'winter_warm_fest';

export type SeasonEventTaskKind =
  | 'plant_or_harvest'
  | 'cook_seasonal'
  | 'take_photo'
  | 'host_visitor'
  | 'coop_picnic';

export interface SeasonEventTask {
  id: string;
  kind: SeasonEventTaskKind;
  title: string;
  description: string;
  emoji: string;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  rewardTickets: number;
  rewardCoins: number;
}

export interface SeasonEventShopItem {
  id: string;
  eventId: SeasonEventId;
  name: string;
  emoji: string;
  description: string;
  category: 'accessory' | 'background' | 'filter' | 'frame' | 'title';
  targetId: string;
  ticketPrice: number;
}

export interface SeasonEventCoopTask {
  id: string;
  dateKey: string;
  title: string;
  description: string;
  picnicFoodCount: number;
  picnicFoodTarget: number;
  photoCount: number;
  photoTarget: number;
  contributorUserIds: string[];
  completed: boolean;
  claimedByUserIds: string[];
  rewardTickets: number;
  rewardCoins: number;
}

export interface SeasonEvent {
  eventId: SeasonEventId;
  seasonId: SeasonId;
  name: string;
  emoji: string;
  description: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'reserved' | 'ended';
  currencyName: string;
  currencyEmoji: string;
  ticketBalance: number;
  ticketTotalEarned: number;
  dailyDate: string;
  dailyTasks: SeasonEventTask[];
  purchasedShopItemIds: string[];
  coopTask: SeasonEventCoopTask | null;
  carryoverItemIds: string[];
}

export type SeasonRoomThemeId =
  | 'none'
  | 'sakura_sweet'
  | 'spring_picnic'
  | 'beach_vacation'
  | 'ice_cream_cottage'
  | 'maple_study'
  | 'harvest_cottage'
  | 'snow_cottage'
  | 'christmas_bedroom';

export type SeasonYardThemeId = 'none' | 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonOfflineSummary {
  dateKey: string;
  seasonId: SeasonId;
  weatherCondition: WeatherCondition;
  weatherLabel: string;
  cityName: string;
  isOffline: boolean;
  summaryText: string;
}

export interface SeasonSystemState {
  currentSeason: SeasonId;
  lastKnownSeason: SeasonId;
  seasonNoticePending: boolean;
  selectedCityId: string;
  roomThemeOverride: SeasonRoomThemeId;
  yardThemeOverride: SeasonYardThemeId;
  weatherTasksDate: string;
  weatherTasks: WeatherTask[];
  seasonEvent: SeasonEvent;
  offlineSummary: SeasonOfflineSummary | null;
}

