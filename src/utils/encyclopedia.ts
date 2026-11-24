import { ACCESSORIES, ACCESSORY_THEME_SETS } from '../data/accessories';
import {
  ACCESSORY_MILESTONE_COINS,
  ACCESSORY_MILESTONE_GROWTH,
  ACCESSORY_MILESTONE_STEP,
  RECIPE_MILESTONE_COINS,
  RECIPE_MILESTONE_GROWTH,
  RECIPE_MILESTONE_THRESHOLDS,
} from '../data/encyclopedia';
import { FOODS } from '../data/foods';
import { getGrowthStage } from '../data/growth';
import { KITCHEN_RECIPES } from '../data/kitchen';
import {
  AccessoryTheme,
  EncyclopediaState,
  GameState,
  StageBackgroundId,
  TitleId,
} from '../types';

export function createInitialEncyclopediaState(
  seedFoodIds: string[] = []
): EncyclopediaState {
  const validFoodIds = new Set(FOODS.map((f) => f.id));
  const uniqueFoods = Array.from(
    new Set(seedFoodIds.filter((id) => validFoodIds.has(id)))
  );

  return {
    collectedFoodIds: uniqueFoods,
    learnedRecipeIds: [],
    claimedRecipeMilestones: [],
    claimedAccessoryMilestones: [],
    claimedAccessoryThemeSets: [],
    unlockedTitles: [],
    activeTitle: null,
  };
}

export function getAccessoryMilestoneThresholds(): number[] {
  const thresholds: number[] = [];
  for (let n = ACCESSORY_MILESTONE_STEP; n <= ACCESSORIES.length; n += ACCESSORY_MILESTONE_STEP) {
    thresholds.push(n);
  }
  return thresholds;
}

export function getRecipeMilestoneThresholds(): number[] {
  return RECIPE_MILESTONE_THRESHOLDS.filter((t) => t <= KITCHEN_RECIPES.length);
}

export interface EncyclopediaSyncOutcome {
  nextState: GameState;
  newlyAwardedMilestones: number[];
  newlyAwardedRecipeMilestones: number[];
  newlyCompletedThemes: AccessoryTheme[];
  newlyUnlockedTitles: TitleId[];
  bonusCoins: number;
  bonusGrowth: number;
}

export function syncEncyclopediaRewards(state: GameState): EncyclopediaSyncOutcome {
  const validAccessoryIds = new Set(ACCESSORIES.map((a) => a.id));
  const ownedSet = new Set(state.accessories.filter((id) => validAccessoryIds.has(id)));
  const ownedCount = ownedSet.size;

  const thresholds = getAccessoryMilestoneThresholds();
  const newlyAwardedMilestones = thresholds.filter(
    (threshold) =>
      ownedCount >= threshold &&
      !state.encyclopedia.claimedAccessoryMilestones.includes(threshold)
  );

  const validRecipeIds = new Set(KITCHEN_RECIPES.map((r) => r.id));
  const learnedRecipeCount = (state.encyclopedia.learnedRecipeIds ?? []).filter((id) =>
    validRecipeIds.has(id)
  ).length;
  const claimedRecipeMilestones = state.encyclopedia.claimedRecipeMilestones ?? [];
  const newlyAwardedRecipeMilestones = getRecipeMilestoneThresholds().filter(
    (threshold) =>
      learnedRecipeCount >= threshold && !claimedRecipeMilestones.includes(threshold)
  );

  let bonusCoins =
    newlyAwardedMilestones.length * ACCESSORY_MILESTONE_COINS +
    newlyAwardedRecipeMilestones.length * RECIPE_MILESTONE_COINS;
  let bonusGrowth =
    newlyAwardedMilestones.length * ACCESSORY_MILESTONE_GROWTH +
    newlyAwardedRecipeMilestones.length * RECIPE_MILESTONE_GROWTH;

  const validFoodIds = new Set(FOODS.map((f) => f.id));
  const collectedFoodCount = state.encyclopedia.collectedFoodIds.filter((id) =>
    validFoodIds.has(id)
  ).length;

  const unlockedTitles = [...state.encyclopedia.unlockedTitles];
  const newlyUnlockedTitles: TitleId[] = [];
  const claimedAccessoryThemeSets = [...(state.encyclopedia.claimedAccessoryThemeSets ?? [])];
  const newlyCompletedThemes: AccessoryTheme[] = [];
  const unlockedBackgrounds: StageBackgroundId[] = [...state.unlockedBackgrounds];

  for (const theme of ACCESSORY_THEME_SETS) {
    const isComplete = theme.accessoryIds.every((id) => ownedSet.has(id));
    if (!isComplete) continue;

    if (!claimedAccessoryThemeSets.includes(theme.id)) {
      claimedAccessoryThemeSets.push(theme.id);
      newlyCompletedThemes.push(theme.id);
      bonusCoins += theme.rewardCoins;
      bonusGrowth += theme.rewardGrowth;
    }

    if (!unlockedTitles.includes(theme.rewardTitleId)) {
      unlockedTitles.push(theme.rewardTitleId);
      newlyUnlockedTitles.push(theme.rewardTitleId);
    }

    if (!unlockedBackgrounds.includes(theme.rewardBackgroundId)) {
      unlockedBackgrounds.push(theme.rewardBackgroundId);
    }
  }

  if (collectedFoodCount >= FOODS.length && !unlockedTitles.includes('gourmet_owner')) {
    unlockedTitles.push('gourmet_owner');
    newlyUnlockedTitles.push('gourmet_owner');
  }

  if (learnedRecipeCount >= KITCHEN_RECIPES.length && !unlockedTitles.includes('recipe_master')) {
    unlockedTitles.push('recipe_master');
    newlyUnlockedTitles.push('recipe_master');
  }

  if (ownedCount >= ACCESSORIES.length && !unlockedTitles.includes('fashion_stylist')) {
    unlockedTitles.push('fashion_stylist');
    newlyUnlockedTitles.push('fashion_stylist');
  }

  const stageTitleRules: Array<{ titleId: TitleId; condition: boolean }> = [
    { titleId: 'growth_sprout', condition: state.pet.hatched || state.pet.level >= 1 },
    { titleId: 'growth_chubby', condition: state.pet.level >= 2 },
    { titleId: 'growth_radiant', condition: state.pet.level >= 3 },
    { titleId: 'growth_superstar', condition: state.pet.level >= 4 },
  ];
  for (const rule of stageTitleRules) {
    if (rule.condition && !unlockedTitles.includes(rule.titleId)) {
      unlockedTitles.push(rule.titleId);
      newlyUnlockedTitles.push(rule.titleId);
    }
  }

  if (
    newlyAwardedMilestones.length === 0 &&
    newlyAwardedRecipeMilestones.length === 0 &&
    newlyCompletedThemes.length === 0 &&
    newlyUnlockedTitles.length === 0 &&
    unlockedBackgrounds.length === state.unlockedBackgrounds.length
  ) {
    return {
      nextState: state,
      newlyAwardedMilestones: [],
      newlyAwardedRecipeMilestones: [],
      newlyCompletedThemes: [],
      newlyUnlockedTitles: [],
      bonusCoins: 0,
      bonusGrowth: 0,
    };
  }

  const nextGrowth = state.pet.growth + bonusGrowth;
  const nextActiveTitle =
    state.encyclopedia.activeTitle ??
    (unlockedTitles.length > 0 ? unlockedTitles[0] : null);

  return {
    nextState: {
      ...state,
      coins: state.coins + bonusCoins,
      unlockedBackgrounds,
      pet: {
        ...state.pet,
        growth: nextGrowth,
        level: getGrowthStage(nextGrowth).level,
      },
      encyclopedia: {
        ...state.encyclopedia,
        claimedRecipeMilestones: [
          ...claimedRecipeMilestones,
          ...newlyAwardedRecipeMilestones,
        ].sort((a, b) => a - b),
        claimedAccessoryMilestones: [
          ...state.encyclopedia.claimedAccessoryMilestones,
          ...newlyAwardedMilestones,
        ].sort((a, b) => a - b),
        claimedAccessoryThemeSets,
        unlockedTitles,
        activeTitle: nextActiveTitle,
      },
    },
    newlyAwardedMilestones,
    newlyAwardedRecipeMilestones,
    newlyCompletedThemes,
    newlyUnlockedTitles,
    bonusCoins,
    bonusGrowth,
  };
}

