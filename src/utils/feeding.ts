import {
  FAVORITE_FEED_RULE,
  FEED_REACTION_BY_CATEGORY,
  FEED_REACTION_BY_FOOD_ID,
  STUFFED_FEED_RULE,
} from '../data/feedingReactions';
import { getPetSpeciesInfo, pickRandomNonRepeating } from '../data/species';
import {
  FeedingVisualEffect,
  Food,
  PetExpression,
  PetSpecies,
  PiggyActionState,
} from '../types';

export interface FeedingOutcome {
  action: PiggyActionState;
  visualEffect: FeedingVisualEffect;
  expression: PetExpression;
  speech: string;
  feedbackText: string;
  feedbackEmoji: string;
  particleEmojis: string[];
  isFavorite: boolean;
  isStuffed: boolean;
}

export function resolveFeedingOutcome(
  food: Food,
  species: PetSpecies,
  nextFastFoodStreak: number,
  lastSpeech?: string
): FeedingOutcome {
  const speciesInfo = getPetSpeciesInfo(species);
  const isFavorite = speciesInfo.favoriteFoodIds.includes(food.id);
  const isStuffed = nextFastFoodStreak >= 3;

  if (isStuffed) {
    return {
      action: 'stuffed',
      visualEffect: 'stuffed',
      expression: STUFFED_FEED_RULE.expression,
      speech: pickRandomNonRepeating(STUFFED_FEED_RULE.speeches, lastSpeech),
      feedbackText: STUFFED_FEED_RULE.feedbackText,
      feedbackEmoji: STUFFED_FEED_RULE.feedbackEmoji,
      particleEmojis: STUFFED_FEED_RULE.particleEmojis,
      isFavorite,
      isStuffed: true,
    };
  }

  const rule =
    FEED_REACTION_BY_FOOD_ID[food.id] ?? FEED_REACTION_BY_CATEGORY[food.category];

  if (isFavorite) {
    const favoriteSpeeches = [
      speciesInfo.favoriteFoodReaction,
      ...rule.speeches.map((s) => `${s}（最愛料理大滿足！）`),
    ];
    return {
      action: 'eating',
      visualEffect: 'favoriteJump',
      expression: FAVORITE_FEED_RULE.expression,
      speech: pickRandomNonRepeating(favoriteSpeeches, lastSpeech),
      feedbackText: `${food.name} · ${FAVORITE_FEED_RULE.feedbackText}`,
      feedbackEmoji: FAVORITE_FEED_RULE.feedbackEmoji,
      particleEmojis: FAVORITE_FEED_RULE.particleEmojis,
      isFavorite: true,
      isStuffed: false,
    };
  }

  return {
    action: 'eating',
    visualEffect: 'hearts',
    expression: rule.expression,
    speech: pickRandomNonRepeating(rule.speeches, lastSpeech),
    feedbackText: rule.feedbackText,
    feedbackEmoji: rule.feedbackEmoji,
    particleEmojis: rule.particleEmojis,
    isFavorite: false,
    isStuffed: false,
  };
}
