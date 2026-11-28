import {
  ACCESSORIES,
  ACCESSORY_SLOT_LABELS,
  ACCESSORY_THEME_SETS,
} from '../data/accessories';
import {
  COLLECTION_BADGES,
  COLLECTION_CATEGORIES,
  COLLECTION_CHAIN_SETS,
  COLLECTION_MILESTONES,
} from '../data/collection';
import { getTitleDefinition } from '../data/encyclopedia';
import {
  STRAWBERRY_ACCESSORY_IDS,
  STRAWBERRY_EVENT_NAME,
  STRAWBERRY_FOOD_IDS,
  STRAWBERRY_SHOP_ITEMS,
  createInitialStrawberryMilestones,
} from '../data/events/strawberrySeason';
import {
  BIRTHDAY_CAKE_FOOD_IDS,
  FOOD_CATEGORY_LABELS,
  FOODS,
} from '../data/foods';
import {
  FARM_DECORATIONS,
  FARM_UPGRADES,
  FLOORINGS,
  FURNITURE_CATEGORY_LABELS,
  ROOM_ITEMS,
  THEME_SETS,
  WALLPAPERS,
} from '../data/house';
import { INGREDIENT_IDS, INGREDIENTS, KITCHEN_RECIPES } from '../data/kitchen';
import { MILESTONE_DEFINITIONS, SHARED_MEMORY_DEFINITIONS } from '../data/memories';
import { PET_ABILITIES, PET_UNLOCK_CONDITIONS } from '../data/pets';
import {
  PHOTO_BACKGROUNDS,
  PHOTO_FRAMES,
  PHOTO_POSES,
  PHOTO_STICKERS,
  STUDIO_CRAFT_RECIPES,
  STUDIO_SHOP_FILTERS,
} from '../data/photoStudio';
import { PET_SPECIES_INFO, PET_SPECIES_LIST } from '../data/species';
import {
  ACTIVE_TOWN_LOCATIONS,
  TOWN_SHOP_ITEMS,
  TOWN_VISITORS,
  VISITOR_HUT_LEVELS,
} from '../data/town';
import { VISITOR_BY_ID, VISITOR_DECORS } from '../data/visitors';
import { SEASON_CROP_BY_ID, SEASON_META } from '../data/seasons';
import {
  CollectionBadgeId,
  CollectionCategoryId,
  CollectionCategoryProgress,
  CollectionFilterId,
  CollectionItem,
  CollectionMilestone,
  CollectionOfflineSummary,
  CollectionProgress,
  GameState,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  TitleId,
} from '../types';
import { getMemoryDateKey, recordMemoryEntry } from './memories';
import { getLocalDateString } from './noviceGrowth';
import { getPhotoStudioState } from './photoStudio';
import { getEventRemainingText } from './seasonalEvent';

export interface CollectionCelebrationEvent {
  id: string;
  kind: 'milestone' | 'chain_set';
  title: string;
  emoji: string;
  description: string;
  rewardSummary: string;
}

export interface CollectionReminderPayload {
  id: string;
  title: string;
  message: string;
  emoji: string;
  categoryId: CollectionCategoryId;
  jumpTargetLabel: string;
}

const CRAFT_TARGET_SET = new Set(
  STUDIO_CRAFT_RECIPES.map((r) => `${r.targetKind}:${r.targetId}`)
);

const STRAWBERRY_SHOP_BY_TARGET = new Map(
  STRAWBERRY_SHOP_ITEMS.map((item) => [`${item.category}:${item.targetId}`, item])
);

const TOWN_SHOP_BY_TARGET = new Map(
  TOWN_SHOP_ITEMS.map((item) => [`${item.category}:${item.targetId}`, item])
);

const KITCHEN_RECIPE_BY_OUTPUT = new Map(
  KITCHEN_RECIPES.map((r) => [r.outputFoodId, r])
);

function mapAccessoryRarity(
  rarity: 'common' | 'advanced' | 'event' | 'coop'
): CollectionItem['rarity'] {
  if (rarity === 'advanced') return 'rare';
  return rarity;
}

function isIngredientCollected(state: GameState, ingredientId: (typeof INGREDIENT_IDS)[number]): boolean {
  if ((state.ingredients[ingredientId] ?? 0) > 0) return true;
  if (state.farmPlots.some((p) => p.cropId === ingredientId)) return true;
  const learnedSet = new Set(state.encyclopedia.learnedRecipeIds ?? []);
  return KITCHEN_RECIPES.some(
    (r) =>
      learnedSet.has(r.id) &&
      (r.ingredients[ingredientId] ?? 0) > 0
  );
}

export function buildCollectionItems(
  state: GameState,
  hasSharedRoom = false,
  now: Date = new Date()
): CollectionItem[] {
  const items: CollectionItem[] = [];
  const studio = getPhotoStudioState(state);
  const wearCounts = state.encyclopedia.accessoryWearCounts ?? {};
  const ownedAccSet = new Set(state.accessories);
  const collectedFoodSet = new Set(state.encyclopedia.collectedFoodIds);
  const learnedRecipeSet = new Set(state.encyclopedia.learnedRecipeIds ?? []);
  const collectedFurnitureSet = new Set(state.house.collectedFurnitureIds);
  const unlockedWallpaperSet = new Set(state.house.unlockedWallpapers);
  const unlockedFlooringSet = new Set(state.house.unlockedFloorings);
  const completedHouseThemeSet = new Set(state.house.completedThemeSets);
  const unlockedStudioPoses = new Set(studio.unlockedPoses);
  const unlockedStudioBgs = new Set(studio.unlockedBackgrounds);
  const unlockedStudioFilters = new Set(studio.unlockedFilters);
  const unlockedStudioFrames = new Set(studio.unlockedFrames);
  const unlockedStudioStickers = new Set(studio.unlockedStickers);

  const seasonalEvent = state.seasonalEvent;
  const eventIsActive = seasonalEvent?.status === 'active';
  const eventRemaining = seasonalEvent
    ? getEventRemainingText(seasonalEvent, now)
    : undefined;

  const coopSessionLabel = hasSharedRoom
    ? '已與共養夥伴連線共享進度'
    : '建立共養小屋後可解鎖雙人同步進度';

  // 1. 寵物圖鑑
  for (const species of PET_SPECIES_LIST) {
    const info = PET_SPECIES_INFO[species];
    const ability = PET_ABILITIES[species];
    const cond = PET_UNLOCK_CONDITIONS[species];
    const owned = state.pets.some((p) => p.species === species);
    const isStarter = cond.ruleType === 'starter';
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    items.push({
      id: `pet_${species}`,
      categoryId: 'pets',
      name: info.label,
      emoji: info.emoji,
      description: `${info.greeting} 天賦「${ability.title}」：${ability.summary}。`,
      owned,
      rarity: isStarter ? 'common' : 'rare',
      obtainMethod: cond.description,
      mysteryHint: owned ? undefined : `解鎖線索：${cond.label}`,
      filters,
      jumpTarget: 'pets',
      jumpLabel: '前往多寵物窩',
      previewKind: 'pet',
      previewId: species,
      subtitle: ability.summary,
      tagText: isStarter ? '初始可選' : '進階夥伴',
    });
  }

  // 2. 食物圖鑑
  for (const food of FOODS) {
    const owned = collectedFoodSet.has(food.id);
    const recipe = KITCHEN_RECIPE_BY_OUTPUT.get(food.id);
    const isSeasonalFood = STRAWBERRY_FOOD_IDS.includes(food.id);
    const isBirthdayCake = (BIRTHDAY_CAKE_FOOD_IDS as readonly string[]).includes(food.id);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (food.price > 0) filters.push('purchasable');
    if (recipe || isBirthdayCake) filters.push('craftable');
    if (isSeasonalFood || isBirthdayCake) {
      filters.push('event');
      if (isSeasonalFood && eventIsActive) filters.push('expiring');
    }
    const obtainParts: string[] = [];
    if (food.price > 0) obtainParts.push(`食堂商店購買（${food.price} 金幣）`);
    if (recipe) obtainParts.push(`廚房料理「${recipe.name}」烹飪取得`);
    if (isSeasonalFood) obtainParts.push(`${STRAWBERRY_EVENT_NAME}推薦料理`);
    if (isBirthdayCake) obtainParts.push('生日派對蛋糕廚房烘焙取得');

    items.push({
      id: `food_${food.id}`,
      categoryId: 'foods',
      name: food.name,
      emoji: food.emoji,
      description: food.description,
      owned,
      rarity: isSeasonalFood || isBirthdayCake ? 'event' : recipe ? 'rare' : 'common',
      obtainMethod: obtainParts.join(' 或 ') || '食堂料理取得',
      mysteryHint: !owned && recipe ? `料理提示：${recipe.hint ?? '嘗試在廚房搭配農場作物料理'}` : undefined,
      filters,
      price: food.price,
      eventRemainingText: isSeasonalFood && eventIsActive ? eventRemaining : undefined,
      isExpiring: isSeasonalFood && eventIsActive,
      jumpTarget: 'canteen',
      jumpLabel: isBirthdayCake ? '前往生日蛋糕廚房' : recipe ? '前往廚房料理' : '前往食堂商店',
      previewKind: 'food',
      previewId: food.id,
      subtitle: `${FOOD_CATEGORY_LABELS[food.category]} · 飽足 +${food.hunger}`,
      tagText: isBirthdayCake ? '生日派對烘焙' : food.price > 0 ? `${food.price} 金幣` : '手作料理',
    });
  }

  // 3. 配件圖鑑
  for (const acc of ACCESSORIES) {
    const owned = ownedAccSet.has(acc.id);
    const isStrawberryEvent = STRAWBERRY_ACCESSORY_IDS.includes(acc.id);
    const sbShop = STRAWBERRY_SHOP_BY_TARGET.get(`accessory:${acc.id}`);
    const townShop = TOWN_SHOP_BY_TARGET.get(`accessory:${acc.id}`);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (acc.price > 0) filters.push('purchasable');
    if (acc.rarity === 'event' || isStrawberryEvent) filters.push('event');
    if (acc.rarity === 'coop') filters.push('coop');
    if ((isStrawberryEvent || Boolean(sbShop)) && eventIsActive) {
      filters.push('expiring');
    }

    items.push({
      id: `acc_${acc.id}`,
      categoryId: 'accessories',
      name: acc.name,
      emoji: acc.emoji,
      description: acc.description,
      owned,
      rarity: mapAccessoryRarity(acc.rarity),
      obtainMethod: acc.obtainMethod,
      mysteryHint:
        !owned && acc.rarity === 'event'
          ? `神秘線索：${acc.obtainMethod}`
          : undefined,
      filters,
      price: acc.price > 0 ? acc.price : undefined,
      wearCount: wearCounts[acc.id] ?? 0,
      coopProgressText: acc.rarity === 'coop' ? coopSessionLabel : undefined,
      eventRemainingText:
        (isStrawberryEvent || Boolean(sbShop)) && eventIsActive
          ? eventRemaining
          : townShop
          ? `小鎮商店 ${townShop.ticketPrice} 小鎮券`
          : undefined,
      isExpiring: (isStrawberryEvent || Boolean(sbShop)) && eventIsActive,
      jumpTarget: sbShop ? 'events' : townShop ? 'town' : 'wardrobe',
      jumpLabel: sbShop ? '前往草莓季商店' : townShop ? '前往小鎮商店' : '前往衣櫥試穿',
      previewKind: 'accessory',
      previewId: acc.id,
      subtitle: `${ACCESSORY_SLOT_LABELS[acc.slot]}配件${
        acc.theme ? ` · ${ACCESSORY_THEME_SETS.find((t) => t.id === acc.theme)?.name ?? ''}` : ''
      }`,
      tagText: owned ? `已穿戴 ${wearCounts[acc.id] ?? 0} 次` : acc.price > 0 ? `${acc.price} 金幣` : '限定解鎖',
    });
  }

  // 4. 穿搭套裝（含 6 套主題套裝 + 5 套進階連鎖預覽）
  for (const chainSet of COLLECTION_CHAIN_SETS) {
    if (chainSet.tier === 'active') {
      const collectedPieces = chainSet.pieceIds.filter((pid) => ownedAccSet.has(pid)).length;
      const owned = collectedPieces === chainSet.pieceIds.length;
      const isEventSet = chainSet.id === 'strawberry_sweet' || chainSet.id === 'festival_party';
      const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned', 'purchasable'];
      if (isEventSet) filters.push('event');
      if (chainSet.id === 'strawberry_sweet' && eventIsActive) filters.push('expiring');

      items.push({
        id: `set_${chainSet.id}`,
        categoryId: 'sets',
        name: `${chainSet.name}套裝`,
        emoji: chainSet.emoji,
        description: `${chainSet.description}（包含：${chainSet.pieceNames.join('、')}）`,
        owned,
        rarity: isEventSet ? 'event' : 'rare',
        obtainMethod: `${chainSet.unlockRequirementText}（獎勵稱號「${chainSet.rewardTitleName}」）`,
        filters,
        eventRemainingText:
          chainSet.id === 'strawberry_sweet' && eventIsActive ? eventRemaining : undefined,
        isExpiring: chainSet.id === 'strawberry_sweet' && eventIsActive,
        jumpTarget: 'wardrobe',
        jumpLabel: '前往衣櫥收集套裝',
        previewKind: 'accessory',
        previewId: chainSet.pieceIds[0],
        subtitle: `進度 ${collectedPieces} / ${chainSet.pieceIds.length} 件`,
        tagText: owned ? '套裝完成' : `尚缺 ${chainSet.pieceIds.length - collectedPieces} 件`,
      });
    } else {
      const parentSet = COLLECTION_CHAIN_SETS.find(
        (s) => s.tier === 'active' && s.sourceThemeId === chainSet.sourceThemeId
      );
      const parentDone = parentSet
        ? parentSet.pieceIds.every((pid) => ownedAccSet.has(pid))
        : false;
      const owned =
        parentDone ||
        (state.encyclopedia.unlockedChainSetIds ?? []).includes(chainSet.id);
      const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];

      items.push({
        id: `set_${chainSet.id}`,
        categoryId: 'sets',
        name: `${chainSet.name}（連鎖進階）`,
        emoji: chainSet.emoji,
        description: `${chainSet.description}（連鎖部件預覽：${chainSet.pieceNames.join('、')}）`,
        owned,
        rarity: 'epic',
        obtainMethod: chainSet.unlockRequirementText,
        mysteryHint: owned ? undefined : `需先完成「${parentSet?.name ?? ''}」4 件套裝開啟連鎖系列`,
        filters,
        jumpTarget: 'wardrobe',
        jumpLabel: '查看前置穿搭套裝',
        previewKind: 'emoji',
        previewId: chainSet.emoji,
        subtitle: `進階連鎖預覽 · ${chainSet.rewardTitleName}`,
        tagText: owned ? '連鎖已解鎖' : '待開啟連鎖',
      });
    }
  }

  // 5. 房間圖鑑（家具 + 壁紙 + 地板 + 主題房 + 庭院擺飾）
  for (const furn of ROOM_ITEMS) {
    const owned = collectedFurnitureSet.has(furn.id);
    const hasCraft = Boolean(furn.craftIngredients || furn.shardCost);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (furn.price > 0) filters.push('purchasable');
    if (hasCraft) filters.push('craftable');
    if (furn.id.startsWith('visitor_') || furn.id === 'collection_display_shelf') {
      filters.push('event');
    }

    items.push({
      id: `room_item_${furn.id}`,
      categoryId: 'room',
      name: furn.name,
      emoji: furn.emoji,
      description: furn.description,
      owned,
      rarity: furn.tier === 'advanced' ? 'rare' : 'common',
      obtainMethod:
        furn.id === 'collection_display_shelf'
          ? '總收集圖鑑達到 90% 里程碑解鎖'
          : furn.price > 0
          ? `小屋家具商店購買（${furn.price} 金幣）`
          : furn.shardCost
          ? `使用家具碎片合成（${furn.shardCost} 碎片）`
          : '完成活動／訪客／共養目標取得',
      filters,
      price: furn.price > 0 ? furn.price : undefined,
      jumpTarget: 'house',
      jumpLabel: '前往小屋佈置',
      previewKind: 'furniture',
      previewId: furn.id,
      subtitle: `${FURNITURE_CATEGORY_LABELS[furn.category]} · ${furn.tier === 'advanced' ? '高階家具' : '基礎家具'}`,
      tagText: furn.price > 0 ? `${furn.price} 金幣` : '限定家具',
    });
  }

  for (const wall of WALLPAPERS) {
    const owned = unlockedWallpaperSet.has(wall.id);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (wall.price > 0) filters.push('purchasable');
    items.push({
      id: `room_wall_${wall.id}`,
      categoryId: 'room',
      name: `壁紙 · ${wall.name}`,
      emoji: wall.emoji,
      description: wall.description,
      owned,
      rarity: wall.price > 0 ? 'rare' : 'common',
      obtainMethod: wall.price > 0 ? `小屋裝潢商店購買（${wall.price} 金幣）` : '初始免費解鎖',
      filters,
      price: wall.price > 0 ? wall.price : undefined,
      jumpTarget: 'house',
      jumpLabel: '前往更換壁紙',
      previewKind: 'emoji',
      previewId: wall.emoji,
      subtitle: '小屋牆面裝潢',
      tagText: wall.price > 0 ? `${wall.price} 金幣` : '初始裝潢',
    });
  }

  for (const floor of FLOORINGS) {
    const owned = unlockedFlooringSet.has(floor.id);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (floor.price > 0) filters.push('purchasable');
    items.push({
      id: `room_floor_${floor.id}`,
      categoryId: 'room',
      name: `地板 · ${floor.name}`,
      emoji: floor.emoji,
      description: floor.description,
      owned,
      rarity: floor.price > 0 ? 'rare' : 'common',
      obtainMethod: floor.price > 0 ? `小屋裝潢商店購買（${floor.price} 金幣）` : '初始免費解鎖',
      filters,
      price: floor.price > 0 ? floor.price : undefined,
      jumpTarget: 'house',
      jumpLabel: '前往更換地板',
      previewKind: 'emoji',
      previewId: floor.emoji,
      subtitle: '小屋地板裝潢',
      tagText: floor.price > 0 ? `${floor.price} 金幣` : '初始裝潢',
    });
  }

  for (const theme of THEME_SETS) {
    const owned = completedHouseThemeSet.has(theme.id);
    items.push({
      id: `room_theme_${theme.id}`,
      categoryId: 'room',
      name: `主題房 · ${theme.name}`,
      emoji: theme.emoji,
      description: theme.description,
      owned,
      rarity: 'epic',
      obtainMethod: `收集該主題家具、壁紙與地板組合（或套組優惠 ${theme.bundlePrice} 金幣）`,
      filters: [owned ? 'owned' : 'unowned', 'purchasable'],
      price: theme.bundlePrice,
      jumpTarget: 'house',
      jumpLabel: '前往小屋主題館',
      previewKind: 'emoji',
      previewId: theme.emoji,
      subtitle: `專屬獎勵：${getTitleDefinition(theme.rewardTitleId).name}`,
      tagText: owned ? '主題完成' : '主題套房',
    });
  }

  for (const decor of VISITOR_DECORS) {
    const unlockedSet = new Set(state.visitorState?.ownedYardDecors ?? ['oak_tree']);
    const owned = unlockedSet.has(decor.id);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (decor.price > 0) filters.push('purchasable');
    if (decor.unlockByAffinity) filters.push('event');
    items.push({
      id: `room_decor_${decor.id}`,
      categoryId: 'room',
      name: `庭院擺飾 · ${decor.name}`,
      emoji: decor.emoji,
      description: decor.description,
      owned,
      rarity: decor.unlockByAffinity ? 'rare' : 'common',
      obtainMethod: decor.unlockByAffinity
        ? `庭院訪客好感度達到 Lv.${decor.unlockByAffinity.level} 解鎖`
        : decor.price > 0
        ? `庭院商店購買（${decor.price} 金幣）`
        : '初始庭院自帶擺飾',
      filters,
      price: decor.price > 0 ? decor.price : undefined,
      jumpTarget: 'town',
      jumpLabel: '前往庭院與小鎮',
      previewKind: 'emoji',
      previewId: decor.emoji,
      subtitle: '庭院專屬擺飾',
      tagText: decor.price > 0 ? `${decor.price} 金幣` : '訪客好感贈禮',
    });
  }

  // 6. 農場圖鑑（作物食材 + 料理食譜 + 農具設施 + 農場裝飾）
  for (const ingId of INGREDIENT_IDS) {
    const ing = INGREDIENTS[ingId];
    const owned = isIngredientCollected(state, ingId);
    const seasonCrop = SEASON_CROP_BY_ID[ingId];
    const seasonMeta = seasonCrop ? SEASON_META[seasonCrop.primarySeason] : null;
    items.push({
      id: `farm_ing_${ingId}`,
      categoryId: 'farm',
      name: ing.name,
      emoji: ing.emoji,
      description: ing.description,
      owned,
      rarity: ing.isOvernight ? 'rare' : 'common',
      obtainMethod: seasonMeta
        ? `${seasonMeta.emoji} ${seasonMeta.name}當季作物（${ing.seedCost} 金幣 / 收成 ${ing.harvestYield} 份）`
        : `於農場購買種子種植收成（${ing.seedCost} 金幣 / 單次收成 ${ing.harvestYield} 份）`,
      filters: [owned ? 'owned' : 'unowned', 'purchasable'],
      price: ing.seedCost,
      jumpTarget: 'house',
      jumpLabel: '前往小屋農場',
      previewKind: 'crop',
      previewId: ingId,
      subtitle: seasonMeta
        ? `${seasonMeta.name}作物${seasonCrop?.coldHardy ? ' · 耐寒可抗雪' : ''}`
        : ing.isOvernight
        ? '過夜稀有作物'
        : '常規農場作物',
      tagText: `${ing.seedCost} 金幣/種子`,
    });
  }

  for (const recipe of KITCHEN_RECIPES) {
    const owned = learnedRecipeSet.has(recipe.id);
    items.push({
      id: `farm_recipe_${recipe.id}`,
      categoryId: 'farm',
      name: `食譜 · ${recipe.name}`,
      emoji: recipe.emoji,
      description: recipe.description,
      owned,
      rarity: 'rare',
      obtainMethod: '使用農場收成的食材於食堂廚房研製成功即可學會',
      mysteryHint: owned ? undefined : recipe.hint,
      filters: [owned ? 'owned' : 'unowned', 'craftable'],
      jumpTarget: 'canteen',
      jumpLabel: '前往廚房烹飪',
      previewKind: 'food',
      previewId: recipe.outputFoodId,
      subtitle: `料理成果 · 額外成長 +${recipe.bonusGrowth}`,
      tagText: owned ? '已學會食譜' : '待研製食譜',
    });
  }

  for (const upg of FARM_UPGRADES) {
    const currentLv =
      upg.id === 'sprinkler'
        ? state.house.farmUpgrades.sprinklerLevel
        : upg.id === 'greenhouse'
        ? state.house.farmUpgrades.greenhouseLevel
        : state.house.farmUpgrades.storageLevel;
    const owned = currentLv >= 1;
    items.push({
      id: `farm_upg_${upg.id}`,
      categoryId: 'farm',
      name: `設施 · ${upg.name}`,
      emoji: upg.emoji,
      description: upg.description,
      owned,
      rarity: 'epic',
      obtainMethod: `農場設施商店升級（起始 ${upg.prices[0]} 金幣，最高 Lv.${upg.maxLevel}）`,
      filters: [owned ? 'owned' : 'unowned', 'purchasable'],
      price: upg.prices[0],
      jumpTarget: 'house',
      jumpLabel: '前往升級農場設施',
      previewKind: 'emoji',
      previewId: upg.emoji,
      subtitle: `目前等級 Lv.${currentLv} / ${upg.maxLevel}`,
      tagText: `${upg.prices[0]} 金幣起`,
    });
  }

  for (const fDecor of FARM_DECORATIONS) {
    const owned = state.house.ownedFarmDecorations.includes(fDecor.id);
    items.push({
      id: `farm_decor_${fDecor.id}`,
      categoryId: 'farm',
      name: `裝飾 · ${fDecor.name}`,
      emoji: fDecor.emoji,
      description: fDecor.description,
      owned,
      rarity: 'common',
      obtainMethod: `農場裝飾商店購買（${fDecor.price} 金幣）`,
      filters: [owned ? 'owned' : 'unowned', 'purchasable'],
      price: fDecor.price,
      jumpTarget: 'house',
      jumpLabel: '前往裝飾農場',
      previewKind: 'emoji',
      previewId: fDecor.emoji,
      subtitle: '農場外觀裝飾',
      tagText: `${fDecor.price} 金幣`,
    });
  }

  // 7. 訪客圖鑑（13 位庭院與小鎮訪客）
  const yardAffinities = state.visitorState?.affinities;
  const townAffinities = state.townMap?.visitorAffinities;
  for (const tv of TOWN_VISITORS) {
    const yardRec =
      tv.id === 'bird' || tv.id === 'squirrel' || tv.id === 'rabbit'
        ? yardAffinities?.[tv.id]
        : undefined;
    const townRec = townAffinities?.[tv.id];
    const totalVisits = (yardRec?.totalVisits ?? 0) + (townRec?.totalVisits ?? 0);
    const totalFed = (yardRec?.totalFed ?? 0) + (townRec?.totalFed ?? 0);
    const maxAffinityLv = Math.max(yardRec?.level ?? 1, townRec?.level ?? 1);
    const owned =
      totalVisits > 0 ||
      totalFed > 0 ||
      Boolean(yardRec?.firstHostedAt) ||
      Boolean(townRec?.firstMetAt) ||
      maxAffinityLv > 1;

    const yardDef =
      tv.id === 'bird' || tv.id === 'squirrel' || tv.id === 'rabbit'
        ? VISITOR_BY_ID[tv.id]
        : undefined;
    const rewardSummary = yardDef
      ? `Lv.2～5 贈禮：專屬庭院擺飾、限定攝影濾鏡／相框／背景與配件稱號`
      : tv.rareBonusLabel ?? `於出現地點招待累積好感度，獲得小鎮券與專屬攝影素材`;

    items.push({
      id: `visitor_${tv.id}`,
      categoryId: 'visitors',
      name: owned ? tv.name : '???',
      emoji: owned ? tv.emoji : '❓',
      description: owned
        ? `${tv.description} 最愛：${tv.favoriteTagsLabel}。${rewardSummary}`
        : `尚未遇見的小鎮或庭院神秘訪客！多前往對應地點並準備喜愛點心吧。`,
      owned,
      rarity: tv.rarity === 'rare' ? 'epic' : 'rare',
      obtainMethod: `出沒地點：${tv.homeLocationIds.map((lid) =>
        lid === 'home_yard'
          ? '自家庭院'
          : lid === 'acorn_forest'
          ? '橡果森林'
          : lid === 'lake_park'
          ? '湖邊公園'
          : '小鎮市集'
      ).join('、')} · 喜愛點心：${tv.favoriteTagsLabel}`,
      mysteryHint: owned
        ? undefined
        : `線索：經常出沒於「${tv.homeLocationIds
            .map((lid) =>
              lid === 'home_yard'
                ? '自家庭院'
                : lid === 'acorn_forest'
                ? '橡果森林'
                : lid === 'lake_park'
                ? '湖邊公園'
                : '小鎮市集'
            )
            .join('／')}」，似乎喜歡「${tv.favoriteTagsLabel.split('、')[0]}」`,
      filters: [owned ? 'owned' : 'unowned', ...(tv.rarity === 'rare' ? (['event'] as const) : [])],
      affinityLevel: maxAffinityLv,
      isMysteryVisitor: !owned,
      jumpTarget: 'town',
      jumpLabel: '前往小鎮與庭院遇見訪客',
      previewKind: 'visitor',
      previewId: tv.id,
      subtitle: owned ? `好感度 Lv.${maxAffinityLv} · 已相遇 ${totalVisits} 次` : '神秘訪客 · 待相遇',
      tagText: tv.rarity === 'rare' ? '稀有訪客' : '小鎮常客',
    });
  }

  // 8. 小鎮圖鑑（4 個開放地點 + 訪客小屋擴建 + 小鎮券商店限定）
  const unlockedLocSet = new Set(state.townMap?.unlockedLocationIds ?? ['home_yard']);
  for (const loc of ACTIVE_TOWN_LOCATIONS) {
    const owned = unlockedLocSet.has(loc.id) || loc.id === 'home_yard';
    const locState = state.townMap?.locations?.[loc.id];
    const questDone = (locState?.dailyQuests ?? []).filter((q) => q.completed).length;
    items.push({
      id: `town_loc_${loc.id}`,
      categoryId: 'town',
      name: `地點 · ${loc.name}`,
      emoji: loc.emoji,
      description: `${loc.description}（可遇見：${loc.commonVisitorIds.length} 種常客 + ${loc.rareVisitorIds.length} 種稀有訪客）`,
      owned,
      rarity: loc.id === 'home_yard' ? 'common' : 'rare',
      obtainMethod: loc.unlockConditionLabel,
      filters: [owned ? 'owned' : 'unowned', 'coop'],
      coopProgressText:
        loc.id === 'acorn_forest' || loc.id === 'lake_park' || loc.id === 'town_market'
          ? `支援雙人共養探索任務（${hasSharedRoom ? '已連線' : '單人可單獨累積'}）`
          : undefined,
      jumpTarget: 'town',
      jumpLabel: `前往「${loc.name}」`,
      previewKind: 'emoji',
      previewId: loc.emoji,
      subtitle: `今日據點任務 ${questDone} / ${locState?.dailyQuests.length ?? 2} · 獎勵：${loc.rewardHighlights[0]}`,
      tagText: owned ? '據點已解鎖' : loc.unlockConditionLabel,
    });
  }

  const currentHutLevel = state.townMap?.visitorHut.level ?? 1;
  for (const hut of VISITOR_HUT_LEVELS.filter((h) => h.level >= 2)) {
    const owned = currentHutLevel >= hut.level;
    items.push({
      id: `town_hut_lv${hut.level}`,
      categoryId: 'town',
      name: `訪客小屋 Lv.${hut.level} · ${hut.name}`,
      emoji: hut.emoji,
      description: `${hut.description}（${hut.unlockBonusText}）`,
      owned,
      rarity: hut.level >= 4 ? 'epic' : 'rare',
      obtainMethod: `於自家庭院花費 ${hut.upgradeCostCoins} 金幣升級訪客小屋`,
      filters: [owned ? 'owned' : 'unowned', 'purchasable'],
      price: hut.upgradeCostCoins,
      jumpTarget: 'town',
      jumpLabel: '前往升級訪客小屋',
      previewKind: 'emoji',
      previewId: hut.emoji,
      subtitle: hut.unlockBonusText,
      tagText: `${hut.upgradeCostCoins} 金幣`,
    });
  }

  for (const shopItem of TOWN_SHOP_ITEMS) {
    const purchasedIds = state.townMap?.purchasedShopItemIds ?? [];
    const owned =
      purchasedIds.includes(shopItem.id) ||
      (shopItem.category === 'accessory' && ownedAccSet.has(shopItem.targetId)) ||
      (shopItem.category === 'background' &&
        unlockedStudioBgs.has(shopItem.targetId as PhotoBackground)) ||
      (shopItem.category === 'filter' &&
        unlockedStudioFilters.has(shopItem.targetId as PhotoFilter)) ||
      (shopItem.category === 'title' &&
        state.encyclopedia.unlockedTitles.includes(shopItem.targetId as TitleId));
    items.push({
      id: `town_shop_${shopItem.id}`,
      categoryId: 'town',
      name: `小鎮典藏 · ${shopItem.name}`,
      emoji: shopItem.emoji,
      description: shopItem.description,
      owned,
      rarity: shopItem.category === 'title' ? 'epic' : 'rare',
      obtainMethod: `小鎮商店使用 ${shopItem.ticketPrice} 張小鎮券兌換（${shopItem.locationLabel}）`,
      filters: [owned ? 'owned' : 'unowned', 'event'],
      jumpTarget: 'town',
      jumpLabel: '前往小鎮商店兌換',
      previewKind:
        shopItem.category === 'accessory'
          ? 'accessory'
          : shopItem.category === 'background'
          ? 'studio_bg'
          : shopItem.category === 'filter'
          ? 'studio_filter'
          : 'emoji',
      previewId: shopItem.targetId,
      subtitle: `${shopItem.locationLabel} · ${shopItem.ticketPrice} 小鎮券`,
      tagText: owned ? '已典藏' : `${shopItem.ticketPrice} 小鎮券`,
    });
  }

  // 9. 攝影圖鑑（姿勢 + 背景 + 濾鏡 + 相框 + 貼圖）
  for (const pose of PHOTO_POSES) {
    const owned = unlockedStudioPoses.has(pose.id);
    const isCraft = CRAFT_TARGET_SET.has(`pose:${pose.id}`);
    const isSb = STRAWBERRY_SHOP_BY_TARGET.has(`pose:${pose.id}`);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (pose.price > 0) filters.push('purchasable');
    if (pose.source === 'limited' || pose.source === 'achievement') filters.push('event');
    if (isCraft) filters.push('craftable');
    if (isSb && eventIsActive) filters.push('expiring');
    items.push({
      id: `studio_pose_${pose.id}`,
      categoryId: 'studio',
      name: `姿勢 · ${pose.label}`,
      emoji: pose.emoji,
      description: pose.description,
      owned,
      rarity:
        pose.source === 'limited'
          ? 'event'
          : pose.source === 'achievement' || pose.source === 'shop'
          ? 'rare'
          : 'common',
      obtainMethod: pose.unlockHint ?? '初始免費解鎖',
      filters,
      price: pose.price > 0 ? pose.price : undefined,
      eventRemainingText: isSb && eventIsActive ? eventRemaining : undefined,
      isExpiring: isSb && eventIsActive,
      jumpTarget: 'studio',
      jumpLabel: '前往攝影棚',
      previewKind: 'emoji',
      previewId: pose.emoji,
      subtitle: '攝影棚姿勢',
      tagText: pose.price > 0 ? `${pose.price} 金幣` : pose.source === 'free' ? '免費' : '限定/成就',
    });
  }

  for (const bg of PHOTO_BACKGROUNDS) {
    const owned = unlockedStudioBgs.has(bg.id);
    const isCraft = CRAFT_TARGET_SET.has(`background:${bg.id}`);
    const isSb = STRAWBERRY_SHOP_BY_TARGET.has(`background:${bg.id}`);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (bg.price > 0) filters.push('purchasable');
    if (bg.source === 'limited' || bg.source === 'achievement') filters.push('event');
    if (isCraft) filters.push('craftable');
    if (isSb && eventIsActive) filters.push('expiring');
    items.push({
      id: `studio_bg_${bg.id}`,
      categoryId: 'studio',
      name: `背景 · ${bg.label}`,
      emoji: bg.emoji,
      description: bg.description,
      owned,
      rarity: bg.source === 'limited' || bg.source === 'achievement' ? 'epic' : bg.price > 0 ? 'rare' : 'common',
      obtainMethod: bg.unlockHint ?? '初始免費解鎖',
      filters,
      price: bg.price > 0 ? bg.price : undefined,
      eventRemainingText: isSb && eventIsActive ? eventRemaining : undefined,
      isExpiring: isSb && eventIsActive,
      jumpTarget: 'studio',
      jumpLabel: isCraft ? '前往合成或攝影棚' : '前往攝影棚',
      previewKind: 'studio_bg',
      previewId: bg.id,
      subtitle: '攝影棚背景',
      tagText: isCraft ? '可合成/解鎖' : bg.price > 0 ? `${bg.price} 金幣` : bg.source === 'free' ? '免費' : '限定背景',
    });
  }

  for (const filter of STUDIO_SHOP_FILTERS) {
    const owned = unlockedStudioFilters.has(filter.id);
    const isCraft = CRAFT_TARGET_SET.has(`filter:${filter.id}`);
    const isSb = STRAWBERRY_SHOP_BY_TARGET.has(`filter:${filter.id}`);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (filter.price > 0) filters.push('purchasable');
    if (filter.source === 'limited' || filter.source === 'achievement') filters.push('event');
    if (isCraft) filters.push('craftable');
    if (isSb && eventIsActive) filters.push('expiring');
    items.push({
      id: `studio_filter_${filter.id}`,
      categoryId: 'studio',
      name: `濾鏡 · ${filter.label}`,
      emoji: filter.emoji,
      description: filter.unlockHint ?? '柔和襯托穿搭色調的專屬攝影濾鏡。',
      owned,
      rarity: filter.source === 'limited' || filter.source === 'achievement' ? 'rare' : 'common',
      obtainMethod: filter.unlockHint ?? '初始免費解鎖',
      filters,
      price: filter.price > 0 ? filter.price : undefined,
      eventRemainingText: isSb && eventIsActive ? eventRemaining : undefined,
      isExpiring: isSb && eventIsActive,
      jumpTarget: 'studio',
      jumpLabel: '前往攝影棚',
      previewKind: 'studio_filter',
      previewId: filter.id,
      subtitle: '攝影棚濾鏡',
      tagText: isCraft ? '可合成' : filter.price > 0 ? `${filter.price} 金幣` : '限定/免費',
    });
  }

  for (const frame of PHOTO_FRAMES) {
    const owned = unlockedStudioFrames.has(frame.id);
    const isCraft = CRAFT_TARGET_SET.has(`frame:${frame.id}`);
    const isSb = STRAWBERRY_SHOP_BY_TARGET.has(`frame:${frame.id}`);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (frame.price > 0) filters.push('purchasable');
    if (frame.source === 'limited' || frame.source === 'achievement') filters.push('event');
    if (isCraft) filters.push('craftable');
    if (frame.id === 'coop_heart') filters.push('coop');
    if (isSb && eventIsActive) filters.push('expiring');
    items.push({
      id: `studio_frame_${frame.id}`,
      categoryId: 'studio',
      name: `相框 · ${frame.label}`,
      emoji: frame.emoji,
      description: frame.unlockHint ?? '質感滿分的寫真邊框。',
      owned,
      rarity: frame.id === 'coop_heart' ? 'coop' : frame.source === 'limited' || frame.source === 'achievement' ? 'rare' : 'common',
      obtainMethod: frame.unlockHint ?? '初始免費解鎖',
      filters,
      price: frame.price > 0 ? frame.price : undefined,
      coopProgressText: frame.id === 'coop_heart' ? coopSessionLabel : undefined,
      eventRemainingText: isSb && eventIsActive ? eventRemaining : undefined,
      isExpiring: isSb && eventIsActive,
      jumpTarget: 'studio',
      jumpLabel: '前往攝影棚',
      previewKind: 'studio_frame',
      previewId: frame.id,
      subtitle: '攝影棚相框',
      tagText: isCraft ? '可合成' : frame.price > 0 ? `${frame.price} 金幣` : '限定/免費',
    });
  }

  for (const sticker of PHOTO_STICKERS) {
    const owned = unlockedStudioStickers.has(sticker.id);
    const isCraft = CRAFT_TARGET_SET.has(`sticker:${sticker.id}`);
    const filters: CollectionFilterId[] = [owned ? 'owned' : 'unowned'];
    if (sticker.price > 0) filters.push('purchasable');
    if (isCraft) filters.push('craftable');
    items.push({
      id: `studio_sticker_${sticker.id}`,
      categoryId: 'studio',
      name: `貼圖 · ${sticker.label}`,
      emoji: sticker.emoji,
      description: '可自由貼在照片四周點綴氣氛的可愛造型貼圖！',
      owned,
      rarity: isCraft ? 'rare' : 'common',
      obtainMethod: isCraft
        ? '於攝影棚購買或用 1 份攝影材料免費合成'
        : `於攝影棚商店購買（${sticker.price} 金幣）`,
      filters,
      price: sticker.price,
      jumpTarget: 'studio',
      jumpLabel: '前往購買或合成貼圖',
      previewKind: 'emoji',
      previewId: sticker.emoji,
      subtitle: '攝影棚貼圖',
      tagText: isCraft ? '可材料合成' : `${sticker.price} 金幣`,
    });
  }

  // 10. 回憶圖鑑（12 成長里程碑 + 8 共養回憶 + 4 活動回憶卡）
  const milestoneMap = new Map(state.memoryAlbum.milestones.map((m) => [m.id, m]));
  for (const msDef of MILESTONE_DEFINITIONS) {
    const rec = milestoneMap.get(msDef.id);
    const owned = Boolean(rec?.unlocked);
    const isCoopMs = msDef.id === 'coop_7_days';
    items.push({
      id: `mem_ms_${msDef.id}`,
      categoryId: 'memories',
      name: msDef.title,
      emoji: msDef.emoji,
      description: msDef.description,
      owned,
      rarity: isCoopMs ? 'coop' : msDef.rewardPoseId || msDef.rewardFrameId ? 'epic' : 'rare',
      obtainMethod: `${msDef.conditionLabel}（獲得「${msDef.rewardCardTitle}」）`,
      filters: [owned ? 'owned' : 'unowned', ...(isCoopMs ? (['coop'] as const) : [])],
      coopProgressText: isCoopMs ? coopSessionLabel : undefined,
      jumpTarget: 'memories',
      jumpLabel: '前往回憶相冊',
      previewKind: 'emoji',
      previewId: msDef.emoji,
      subtitle: `紀念卡 · ${msDef.rewardCardTitle}`,
      tagText: owned ? `已收錄 ${rec?.unlockedDateKey ?? ''}` : '待解鎖回憶',
    });
  }

  const sharedMemMap = new Map(state.memoryAlbum.sharedMemories.map((s) => [s.key, s]));
  for (const smDef of SHARED_MEMORY_DEFINITIONS) {
    const rec = sharedMemMap.get(smDef.key);
    const owned = Boolean(rec?.unlocked);
    items.push({
      id: `mem_shared_${smDef.key}`,
      categoryId: 'memories',
      name: `共養 · ${smDef.title}`,
      emoji: smDef.emoji,
      description: smDef.description,
      owned,
      rarity: 'coop',
      obtainMethod: `共養小屋專屬紀念：「${smDef.rewardCardTitle}」（+${smDef.rewardCoins} 金幣）`,
      filters: [owned ? 'owned' : 'unowned', 'coop'],
      coopProgressText: hasSharedRoom
        ? owned
          ? `已與夥伴共同解鎖（${rec?.dateKey ?? ''}）`
          : '已連線共養小屋，達成條件即同步雙方回憶'
        : '需要建立或加入共養小屋',
      jumpTarget: 'house',
      jumpLabel: '前往共養小屋',
      previewKind: 'emoji',
      previewId: smDef.emoji,
      subtitle: smDef.rewardCardTitle,
      tagText: owned ? '共養已達成' : '共養回憶',
    });
  }

  const eventMilestones =
    seasonalEvent?.milestones ?? createInitialStrawberryMilestones();
  for (const evtMs of eventMilestones) {
    const owned = evtMs.completed || evtMs.claimed;
    items.push({
      id: `mem_evt_${evtMs.id}`,
      categoryId: 'memories',
      name: `${STRAWBERRY_EVENT_NAME} · ${evtMs.title}`,
      emoji: evtMs.emoji,
      description: `${evtMs.description}（獎勵：${evtMs.rewardSummary}）`,
      owned,
      rarity: 'event',
      obtainMethod: `${STRAWBERRY_EVENT_NAME}期間達成（${evtMs.progress} / ${evtMs.target}）`,
      filters: [
        owned ? 'owned' : 'unowned',
        'event',
        ...(eventIsActive ? (['expiring'] as const) : []),
      ],
      eventRemainingText: eventIsActive ? eventRemaining : undefined,
      isExpiring: eventIsActive,
      jumpTarget: 'events',
      jumpLabel: '前往草莓季活動',
      previewKind: 'emoji',
      previewId: evtMs.emoji,
      subtitle: `活動紀念 · 進度 ${evtMs.progress}/${evtMs.target}`,
      tagText: owned ? '活動已達成' : '限定紀念',
    });
  }

  return items;
}

export function filterCollectionItems(
  items: CollectionItem[],
  categoryId: CollectionCategoryId | 'all',
  filterId: CollectionFilterId,
  searchQuery = ''
): CollectionItem[] {
  const q = searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    if (categoryId !== 'all' && item.categoryId !== categoryId) return false;
    if (filterId !== 'all' && !item.filters.includes(filterId)) return false;
    if (q) {
      const hay = `${item.name} ${item.description} ${item.obtainMethod} ${item.subtitle ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function computeCollectionProgress(
  state: GameState,
  hasSharedRoom = false,
  now: Date = new Date(),
  precomputedItems?: CollectionItem[]
): CollectionProgress {
  const items = precomputedItems ?? buildCollectionItems(state, hasSharedRoom, now);
  const categories: CollectionCategoryProgress[] = COLLECTION_CATEGORIES.map((cat) => {
    const catItems = items.filter((i) => i.categoryId === cat.id);
    const collected = catItems.filter((i) => i.owned).length;
    const total = catItems.length;
    const percent = total > 0 ? Math.round((collected / total) * 100) : 0;
    return {
      id: cat.id,
      label: cat.label,
      emoji: cat.emoji,
      description: cat.description,
      collected,
      total,
      percent,
    };
  });

  const totalCollected = items.filter((i) => i.owned).length;
  const totalCount = items.length;
  const totalPercent = totalCount > 0 ? Math.round((totalCollected / totalCount) * 100) : 0;

  const claimed = new Set(state.encyclopedia.claimedTotalMilestones ?? []);
  const nextMilestone =
    COLLECTION_MILESTONES.find((m) => totalPercent < m.percent || !claimed.has(m.percent)) ?? null;
  const itemsToNextMilestone = nextMilestone
    ? Math.max(0, Math.ceil((nextMilestone.percent / 100) * totalCount) - totalCollected)
    : 0;

  return {
    totalCollected,
    totalCount,
    totalPercent,
    categories,
    nextMilestone,
    itemsToNextMilestone,
  };
}

export function syncCollectionProgress(
  state: GameState,
  hasSharedRoom = false,
  now: Date = new Date()
): { nextState: GameState; celebrations: CollectionCelebrationEvent[] } {
  const items = buildCollectionItems(state, hasSharedRoom, now);
  const progress = computeCollectionProgress(state, hasSharedRoom, now, items);
  const studio = getPhotoStudioState(state);

  const claimedTotalMilestones = [...(state.encyclopedia.claimedTotalMilestones ?? [])];
  const unlockedTitles = [...state.encyclopedia.unlockedTitles];
  const unlockedBadges = new Set<CollectionBadgeId>(
    state.encyclopedia.unlockedCollectionBadges ?? []
  );
  const unlockedChainSetIds = new Set<string>(
    state.encyclopedia.unlockedChainSetIds ?? []
  );
  const unlockedAccessories = [...state.accessories];
  const collectedFurnitureIds = [...state.house.collectedFurnitureIds];
  const ownedFurnitureCounts = { ...state.house.ownedFurnitureCounts };
  const unlockedPoses = [...studio.unlockedPoses];
  const unlockedBgs = [...studio.unlockedBackgrounds];
  const unlockedFilters = [...studio.unlockedFilters];
  const unlockedFrames = [...studio.unlockedFrames];

  let bonusCoins = 0;
  let bonusShards = 0;
  const celebrations: CollectionCelebrationEvent[] = [];
  const memoryEntriesToAdd: Array<{
    uniqueKey: string;
    title: string;
    description: string;
    emoji: string;
  }> = [];

  // 1. Check 8 Total Milestones (10% ~ 100%)
  for (const ms of COLLECTION_MILESTONES) {
    if (progress.totalPercent >= ms.percent && !claimedTotalMilestones.includes(ms.percent)) {
      claimedTotalMilestones.push(ms.percent);
      bonusCoins += ms.rewardCoins;
      if (ms.rewardFilterShards) bonusShards += ms.rewardFilterShards;
      if (ms.rewardStudioPoseId && !unlockedPoses.includes(ms.rewardStudioPoseId)) {
        unlockedPoses.push(ms.rewardStudioPoseId);
      }
      if (ms.rewardStudioBgId && !unlockedBgs.includes(ms.rewardStudioBgId)) {
        unlockedBgs.push(ms.rewardStudioBgId);
      }
      if (ms.rewardStudioFilterId && !unlockedFilters.includes(ms.rewardStudioFilterId)) {
        unlockedFilters.push(ms.rewardStudioFilterId);
      }
      if (ms.rewardStudioFrameId && !unlockedFrames.includes(ms.rewardStudioFrameId)) {
        unlockedFrames.push(ms.rewardStudioFrameId);
      }
      if (ms.rewardAccessoryId && !unlockedAccessories.includes(ms.rewardAccessoryId)) {
        unlockedAccessories.push(ms.rewardAccessoryId);
      }
      if (ms.rewardFurnitureId) {
        if (!collectedFurnitureIds.includes(ms.rewardFurnitureId)) {
          collectedFurnitureIds.push(ms.rewardFurnitureId);
        }
        if (!ownedFurnitureCounts[ms.rewardFurnitureId]) {
          ownedFurnitureCounts[ms.rewardFurnitureId] = 1;
        }
      }
      if (ms.rewardTitleId && !unlockedTitles.includes(ms.rewardTitleId)) {
        unlockedTitles.push(ms.rewardTitleId);
      }

      celebrations.push({
        id: `col_ms_${ms.percent}`,
        kind: 'milestone',
        title: `總收集圖鑑 ${ms.percent}% 達成！`,
        emoji: ms.percent >= 90 ? '🏆' : ms.percent >= 50 ? '🌈' : '🎉',
        description: `解鎖里程碑「${ms.title}」，你已收集 ${progress.totalCollected} / ${progress.totalCount} 項珍藏！`,
        rewardSummary: ms.rewardSummary,
      });

      memoryEntriesToAdd.push({
        uniqueKey: `collection_milestone_${ms.percent}`,
        title: `圖鑑達成 ${ms.percent}%・${ms.title}`,
        description: `總收集進度達 ${ms.percent}%！獲得獎勵：${ms.rewardSummary}`,
        emoji: ms.percent === 100 ? '🏆' : '📚',
      });
    }
  }

  // 2. Check chain set unlocks when prerequisite active sets complete
  const ownedAccSet = new Set(unlockedAccessories);
  for (const chainSet of COLLECTION_CHAIN_SETS) {
    if (chainSet.tier !== 'chain') continue;
    const parent = COLLECTION_CHAIN_SETS.find(
      (s) => s.tier === 'active' && s.sourceThemeId === chainSet.sourceThemeId
    );
    if (!parent) continue;
    const parentDone = parent.pieceIds.every((pid) => ownedAccSet.has(pid));
    if (parentDone && !unlockedChainSetIds.has(chainSet.id)) {
      unlockedChainSetIds.add(chainSet.id);
      celebrations.push({
        id: `chain_${chainSet.id}`,
        kind: 'chain_set',
        title: `開啟連鎖套裝：${chainSet.name}`,
        emoji: chainSet.emoji,
        description: `已完成「${parent.name}」4 件套裝，解鎖進階連鎖「${chainSet.name}」圖鑑預覽！`,
        rewardSummary: `套裝收藏印記「${chainSet.rewardTitleName}」`,
      });
      memoryEntriesToAdd.push({
        uniqueKey: `collection_chain_${chainSet.id}`,
        title: `解鎖連鎖套裝「${chainSet.name}」`,
        description: `集齊「${parent.name}」全套 4 件，正式開啟「${chainSet.name}」進階系列收集線！`,
        emoji: chainSet.emoji,
      });
    }
  }

  // 3. Check 10 Collection Titles & Badges
  const catById = new Map(progress.categories.map((c) => [c.id, c]));
  const petsCat = catById.get('pets');
  const foodsCat = catById.get('foods');
  const accCat = catById.get('accessories');
  const roomCat = catById.get('room');
  const farmCat = catById.get('farm');
  const visitorsCat = catById.get('visitors');
  const studioCat = catById.get('studio');
  const memoriesCat = catById.get('memories');
  const completedActiveSetsCount = COLLECTION_CHAIN_SETS.filter(
    (s) => s.tier === 'active' && s.pieceIds.every((pid) => ownedAccSet.has(pid))
  ).length;

  const titleRules: Array<{ titleId: TitleId; condition: boolean }> = [
    { titleId: 'pet_collector', condition: (petsCat?.collected ?? 0) >= (petsCat?.total ?? 6) },
    { titleId: 'gourmet_owner', condition: (foodsCat?.collected ?? 0) >= (foodsCat?.total ?? 999) },
    { titleId: 'fashion_stylist', condition: (accCat?.collected ?? 0) >= (accCat?.total ?? 999) },
    { titleId: 'house_designer', condition: (roomCat?.percent ?? 0) >= 60 },
    { titleId: 'town_farmer', condition: (farmCat?.percent ?? 0) >= 70 },
    { titleId: 'town_host_title', condition: (visitorsCat?.collected ?? 0) >= 8 },
    { titleId: 'memory_collector', condition: (memoriesCat?.percent ?? 0) >= 60 },
    { titleId: 'collection_master', condition: progress.totalPercent >= 100 },
  ];

  const newlyUnlockedTitleIds: TitleId[] = [];
  for (const rule of titleRules) {
    if (rule.condition && !unlockedTitles.includes(rule.titleId)) {
      unlockedTitles.push(rule.titleId);
      newlyUnlockedTitleIds.push(rule.titleId);
    }
  }

  const badgeRules: Array<{ id: CollectionBadgeId; condition: boolean }> = [
    { id: 'badge_collection_10', condition: progress.totalPercent >= 10 },
    { id: 'badge_collection_50', condition: progress.totalPercent >= 50 },
    { id: 'badge_collection_100', condition: progress.totalPercent >= 100 },
    { id: 'badge_pets_master', condition: (petsCat?.percent ?? 0) >= 100 },
    { id: 'badge_foods_master', condition: (foodsCat?.percent ?? 0) >= 100 },
    { id: 'badge_fashion_master', condition: (accCat?.percent ?? 0) >= 80 },
    { id: 'badge_sets_3', condition: completedActiveSetsCount >= 3 },
    { id: 'badge_house_master', condition: (roomCat?.percent ?? 0) >= 60 },
    { id: 'badge_town_explorer', condition: (visitorsCat?.collected ?? 0) >= 8 },
    { id: 'badge_studio_director', condition: (studioCat?.percent ?? 0) >= 60 },
  ];
  let badgesChanged = false;
  for (const br of badgeRules) {
    if (br.condition && !unlockedBadges.has(br.id)) {
      unlockedBadges.add(br.id);
      badgesChanged = true;
    }
  }

  const prevOffline = state.encyclopedia.collectionOfflineSummary;
  const todayKey = getLocalDateString(now);
  const prevCollectedCount = prevOffline?.totalCollected ?? progress.totalCollected;
  const newItemsDelta = Math.max(0, progress.totalCollected - prevCollectedCount);
  const offlineChanged =
    !prevOffline ||
    prevOffline.totalCollected !== progress.totalCollected ||
    prevOffline.totalCount !== progress.totalCount ||
    celebrations.length > 0 ||
    newlyUnlockedTitleIds.length > 0;

  if (
    claimedTotalMilestones.length === (state.encyclopedia.claimedTotalMilestones ?? []).length &&
    unlockedTitles.length === state.encyclopedia.unlockedTitles.length &&
    !badgesChanged &&
    unlockedChainSetIds.size === (state.encyclopedia.unlockedChainSetIds ?? []).length &&
    unlockedAccessories.length === state.accessories.length &&
    collectedFurnitureIds.length === state.house.collectedFurnitureIds.length &&
    unlockedPoses.length === studio.unlockedPoses.length &&
    unlockedBgs.length === studio.unlockedBackgrounds.length &&
    unlockedFilters.length === studio.unlockedFilters.length &&
    unlockedFrames.length === studio.unlockedFrames.length &&
    !offlineChanged
  ) {
    return { nextState: state, celebrations: [] };
  }

  const nextOfflineSummary: CollectionOfflineSummary = {
    dateKey: todayKey,
    totalCollected: progress.totalCollected,
    totalCount: progress.totalCount,
    totalPercent: progress.totalPercent,
    newItemsCount:
      prevOffline && prevOffline.dateKey === todayKey
        ? (prevOffline.newItemsCount ?? 0) + newItemsDelta
        : newItemsDelta,
    unlockedMilestones: celebrations
      .filter((c) => c.kind === 'milestone')
      .map((c) => Number(c.id.replace('col_ms_', '')))
      .filter((n) => Number.isFinite(n)),
    unlockedTitleIds: newlyUnlockedTitleIds,
  };

  let nextState: GameState = {
    ...state,
    coins: state.coins + bonusCoins,
    filterShards: (state.filterShards ?? 0) + bonusShards,
    accessories: unlockedAccessories,
    house: {
      ...state.house,
      collectedFurnitureIds,
      ownedFurnitureCounts,
    },
    photoStudio: {
      ...studio,
      unlockedPoses,
      unlockedBackgrounds: unlockedBgs,
      unlockedFilters,
      unlockedFrames,
    },
    encyclopedia: {
      ...state.encyclopedia,
      unlockedTitles,
      activeTitle: state.encyclopedia.activeTitle ?? unlockedTitles[0] ?? null,
      claimedTotalMilestones: claimedTotalMilestones.sort((a, b) => a - b),
      unlockedCollectionBadges: Array.from(unlockedBadges),
      unlockedChainSetIds: Array.from(unlockedChainSetIds),
      collectionOfflineSummary: nextOfflineSummary,
    },
  };

  for (const entry of memoryEntriesToAdd) {
    nextState = recordMemoryEntry(nextState, {
      uniqueKey: entry.uniqueKey,
      type: 'milestone',
      title: entry.title,
      description: entry.description,
      emoji: entry.emoji,
      dateKey: getMemoryDateKey(now),
    });
  }

  return { nextState, celebrations };
}

export function recordAccessoryWear(state: GameState, accessoryId: string): GameState {
  const prevCounts = state.encyclopedia.accessoryWearCounts ?? {};
  return {
    ...state,
    encyclopedia: {
      ...state.encyclopedia,
      accessoryWearCounts: {
        ...prevCounts,
        [accessoryId]: (prevCounts[accessoryId] ?? 0) + 1,
      },
    },
  };
}

export function getDailyCollectionReminder(
  state: GameState,
  hasSharedRoom = false,
  now: Date = new Date()
): CollectionReminderPayload | null {
  if (state.encyclopedia.collectionReminderEnabled === false) return null;
  const todayKey = getLocalDateString(now);
  if (state.encyclopedia.lastCollectionReminderDismissedDate === todayKey) {
    return null;
  }

  const ownedSet = new Set(state.accessories);
  // 1. Check if any outfit set is 1 piece away from completion
  for (const set of COLLECTION_CHAIN_SETS) {
    if (set.tier !== 'active') continue;
    const missing = set.pieceIds.filter((pid) => !ownedSet.has(pid));
    if (missing.length === 1) {
      const missingAcc = ACCESSORIES.find((a) => a.id === missing[0]);
      return {
        id: `remind_set_${set.id}`,
        emoji: set.emoji,
        title: `還差 1 件就集齊「${set.name}」套裝！`,
        message: `只差「${missingAcc?.name ?? '最後一件'}」就能解鎖稱號「${set.rewardTitleName}」與進階連鎖預覽囉！`,
        categoryId: 'sets',
        jumpTargetLabel: '查看穿搭套裝',
      };
    }
  }

  // 2. Check if total collection is <= 3 items away from next milestone
  const progress = computeCollectionProgress(state, hasSharedRoom, now);
  if (progress.nextMilestone && progress.itemsToNextMilestone > 0 && progress.itemsToNextMilestone <= 3) {
    return {
      id: `remind_ms_${progress.nextMilestone.percent}`,
      emoji: '📚',
      title: `距離圖鑑 ${progress.nextMilestone.percent}% 只差 ${progress.itemsToNextMilestone} 項！`,
      message: `再收集 ${progress.itemsToNextMilestone} 項即可領取「${progress.nextMilestone.rewardSummary}」！`,
      categoryId: 'pets',
      jumpTargetLabel: '開啟圖鑑總覽',
    };
  }

  // 3. Check if any category is <= 2 items away from 100%
  for (const cat of progress.categories) {
    const left = cat.total - cat.collected;
    if (left > 0 && left <= 2) {
      return {
        id: `remind_cat_${cat.id}`,
        emoji: cat.emoji,
        title: `「${cat.label}」快要全收集啦！`,
        message: `目前進度 ${cat.collected} / ${cat.total}，只差最後 ${left} 項就能圓滿達標！`,
        categoryId: cat.id,
        jumpTargetLabel: `前往${cat.label}`,
      };
    }
  }

  return null;
}

export function dismissDailyCollectionReminder(
  state: GameState,
  now: Date = new Date()
): GameState {
  const todayKey = getLocalDateString(now);
  return {
    ...state,
    encyclopedia: {
      ...state.encyclopedia,
      lastCollectionReminderDate: todayKey,
      lastCollectionReminderDismissedDate: todayKey,
    },
  };
}

export function setCollectionReminderEnabled(
  state: GameState,
  enabled: boolean
): GameState {
  return {
    ...state,
    encyclopedia: {
      ...state.encyclopedia,
      collectionReminderEnabled: enabled,
    },
  };
}

export {
  COLLECTION_BADGES,
  COLLECTION_CATEGORIES,
  COLLECTION_CHAIN_SETS,
  COLLECTION_MILESTONES,
};
