import React, { useEffect, useState } from 'react';
import {
  Award,
  Camera,
  ChefHat,
  CheckCircle2,
  Coins,
  CookingPot,
  Gift,
  HelpCircle,
  Home,
  Lock,
  MapPin,
  PawPrint,
  Sparkles,
  Utensils,
} from 'lucide-react';
import {
  ACCESSORIES,
  ACCESSORY_SLOT_LABELS,
  ACCESSORY_THEME_BY_ID,
} from '../data/accessories';
import {
  ACCESSORY_MILESTONE_COINS,
  ACCESSORY_MILESTONE_GROWTH,
  FURNITURE_MILESTONE_COINS,
  FURNITURE_MILESTONE_GROWTH,
  RECIPE_MILESTONE_COINS,
  RECIPE_MILESTONE_GROWTH,
  TITLE_DEFINITIONS,
} from '../data/encyclopedia';
import { FOOD_CATEGORY_LABELS, FOODS } from '../data/foods';
import {
  FARM_DECORATIONS,
  FARM_UPGRADES,
  FLOORINGS,
  FURNITURE_CATEGORY_LABELS,
  ROOM_ITEMS,
  ROOM_ZONES,
  WALLPAPERS,
} from '../data/house';
import { INGREDIENTS, KITCHEN_RECIPES } from '../data/kitchen';
import { STRAWBERRY_EVENT_CATALOG_ENTRIES } from '../data/events/strawberrySeason';
import {
  PHOTO_BACKGROUND_BY_ID,
  PHOTO_FILTER_BY_ID,
  PHOTO_FRAME_BY_ID,
} from '../data/photoStudio';
import {
  VISITOR_AFFINITY_THRESHOLDS,
  VISITOR_DECOR_BY_ID,
  VISITORS,
} from '../data/visitors';
import {
  ActiveTownLocationId,
  EncyclopediaState,
  GameState,
  IngredientId,
  PhotoFrame,
  PhotoPose,
  PhotoStudioState,
  SharedHouse,
  TitleId,
  VisitorSystemState,
} from '../types';
import {
  getAccessoryObtainLabel,
  getAccessoryRarityMeta,
  getAccessoryThemeProgress,
} from '../utils/accessories';
import {
  getAccessoryMilestoneThresholds,
  getRecipeMilestoneThresholds,
} from '../utils/encyclopedia';
import {
  getFurnitureMilestoneThresholds,
  getHouseEncyclopediaCounts,
} from '../utils/house';
import {
  createInitialPhotoStudioState,
  getStudioCollectionProgress,
} from '../utils/photoStudio';
import { getOverallTownEncyclopediaSummary } from '../utils/townMap';
import { formatAffinityExp } from '../utils/visitors';
import { AccessoryPreview } from './AccessoryPreview';
import { CropIllustration } from './house/FarmIllustrations';
import { FurnitureGraphic } from './house/FurnitureGraphic';
import { StudioCatalogSection } from './studio/StudioCatalogSection';
import { TownEncyclopediaSection } from './town/TownEncyclopediaSection';
import { VisitorSprite } from './visitors/VisitorIllustrations';

export type EncyclopediaSection =
  | 'foods'
  | 'recipes'
  | 'accessories'
  | 'house'
  | 'events'
  | 'visitors'
  | 'studio'
  | 'town';
type RecipeFilter = 'all' | 'learned' | 'locked';

interface EncyclopediaViewProps {
  encyclopedia: EncyclopediaState;
  unlockedAccessories: string[];
  house: SharedHouse;
  visitorState?: VisitorSystemState;
  photoStudio?: PhotoStudioState;
  unlockedPhotoPoses?: PhotoPose[];
  unlockedPhotoFrames?: PhotoFrame[];
  coins?: number;
  ingredients?: Record<IngredientId, number>;
  favoriteFoodIds?: string[];
  eventOwnedCatalogIds?: string[];
  eventEnded?: boolean;
  game?: GameState;
  initialSection?: EncyclopediaSection;
  onSelectTitle?: (titleId: TitleId | null) => void;
  onGoToKitchen?: (recipeId?: string) => void;
  onCraftStudioRecipe?: (recipeId: string) => void;
  onOpenStudio?: () => void;
  onClaimTownEncyclopediaReward?: (locationId: ActiveTownLocationId) => void;
  onOpenTownMap?: (locationId?: ActiveTownLocationId) => void;
}

export const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({
  encyclopedia,
  unlockedAccessories,
  house,
  visitorState,
  photoStudio,
  unlockedPhotoPoses = [],
  unlockedPhotoFrames = [],
  coins = 0,
  ingredients,
  favoriteFoodIds = [],
  eventOwnedCatalogIds = [],
  eventEnded = false,
  game,
  initialSection = 'foods',
  onSelectTitle,
  onGoToKitchen,
  onCraftStudioRecipe,
  onOpenStudio,
  onClaimTownEncyclopediaReward,
  onOpenTownMap,
}) => {
  const [section, setSection] = useState<EncyclopediaSection>(initialSection);
  const [recipeFilter, setRecipeFilter] = useState<RecipeFilter>('all');

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  const collectedFoodSet = new Set(encyclopedia.collectedFoodIds);
  const collectedFoodCount = FOODS.filter((f) => collectedFoodSet.has(f.id)).length;

  const learnedRecipeSet = new Set(encyclopedia.learnedRecipeIds ?? []);
  const learnedRecipeCount = KITCHEN_RECIPES.filter((r) => learnedRecipeSet.has(r.id)).length;
  const lockedRecipeCount = KITCHEN_RECIPES.length - learnedRecipeCount;
  const recipeProgressPct = Math.round((learnedRecipeCount / KITCHEN_RECIPES.length) * 100);
  const foodById = new Map(FOODS.map((f) => [f.id, f]));

  const ownedAccessorySet = new Set(unlockedAccessories);
  const collectedAccessoryCount = ACCESSORIES.filter((a) =>
    ownedAccessorySet.has(a.id)
  ).length;

  const houseCounts = getHouseEncyclopediaCounts(house);
  const collectedFurnitureSet = new Set(house.collectedFurnitureIds);

  const recipeMilestones = getRecipeMilestoneThresholds();
  const accessoryMilestones = getAccessoryMilestoneThresholds();
  const furnitureMilestones = getFurnitureMilestoneThresholds();
  const themeProgressList = getAccessoryThemeProgress(
    unlockedAccessories,
    encyclopedia.claimedAccessoryThemeSets
  );

  const titleIds: TitleId[] = [
    'growth_sprout',
    'growth_chubby',
    'growth_radiant',
    'growth_superstar',
    'gourmet_owner',
    'recipe_master',
    'fashion_stylist',
    'strawberry_dreamer',
    'forest_camper',
    'cloud_napper',
    'coop_partner',
    'berry_sweetheart',
    'forest_explorer',
    'cloud_dreamer',
    'little_master_chef',
    'starlight_voyager',
    'party_superstar',
    'bird_whisperer',
    'squirrel_friend',
    'rabbit_guardian',
    'coop_best_host',
    'fashion_photographer',
    'strawberry_sweetheart_title',
    'strawberry_fashionista',
    'town_explorer',
    'yard_host_master',
    'acorn_forest_ranger',
    'lakeside_angler',
    'town_market_vip',
  ];

  const eventOwnedSet = new Set(eventOwnedCatalogIds);
  const collectedEventCount = STRAWBERRY_EVENT_CATALOG_ENTRIES.filter((entry) =>
    eventOwnedSet.has(entry.id)
  ).length;

  const visitedCount = VISITORS.filter((v) => {
    const aff = visitorState?.affinities[v.id];
    return Boolean(aff && (aff.firstHostedAt !== null || aff.totalVisits > 0));
  }).length;

  const baseStudio = photoStudio ?? createInitialPhotoStudioState();
  const effectiveStudio: PhotoStudioState = {
    ...baseStudio,
    unlockedPoses: Array.from(new Set([...baseStudio.unlockedPoses, ...unlockedPhotoPoses])),
    unlockedFrames: Array.from(new Set([...baseStudio.unlockedFrames, ...unlockedPhotoFrames])),
  };
  const studioProgress = getStudioCollectionProgress(effectiveStudio);
  const townSummary = game ? getOverallTownEncyclopediaSummary(game) : null;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-r from-[#FFF3D8] via-[#FFEAF0] to-[#E6F8F1] border-2 border-[#F3DFD7] p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-[#4A3531]">
              美食、時尚與佈置圖鑑
            </h2>
            <p className="text-xs text-[#7D635D] mt-0.5">
              收集料理、可愛配件與溫馨家具，解鎖里程碑獎勵與專屬稱號！
            </p>
          </div>
          <Award className="w-6 h-6 text-[#D64470] shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSection('foods')}
            className="rounded-2xl bg-white/85 border border-[#F2E0D6] px-3 py-2 text-left hover:bg-white transition"
          >
            <div className="text-[11px] font-bold text-[#826862]">🍽️ 食物圖鑑</div>
            <div className="text-xs font-extrabold text-[#D64470] tabular-nums mt-0.5">
              已收集 {collectedFoodCount} / {FOODS.length}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSection('recipes')}
            className="rounded-2xl bg-white/85 border border-[#F2E0D6] px-3 py-2 text-left hover:bg-white transition"
          >
            <div className="text-[11px] font-bold text-[#826862]">👩‍🍳 料理食譜圖鑑</div>
            <div className="text-xs font-extrabold text-[#B84C24] tabular-nums mt-0.5">
              已學會 {learnedRecipeCount} / {KITCHEN_RECIPES.length}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSection('accessories')}
            className="rounded-2xl bg-white/85 border border-[#F2E0D6] px-3 py-2 text-left hover:bg-white transition"
          >
            <div className="text-[11px] font-bold text-[#826862]">✨ 配件圖鑑</div>
            <div className="text-xs font-extrabold text-[#256D57] tabular-nums mt-0.5">
              已收集 {collectedAccessoryCount} / {ACCESSORIES.length}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSection('house')}
            className="rounded-2xl bg-white/85 border border-[#F2E0D6] px-3 py-2 text-left hover:bg-white transition"
          >
            <div className="text-[11px] font-bold text-[#826862]">🏡 佈置圖鑑</div>
            <div className="text-xs font-extrabold text-[#9D5B12] tabular-nums mt-0.5">
              已收集 {houseCounts.totalCollected} / {houseCounts.totalItems}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSection('events')}
            className="rounded-2xl bg-white/90 border border-[#F4C8D8] px-3 py-2 text-left hover:bg-white transition"
          >
            <div className="text-[11px] font-bold text-[#826862]">🍓 活動圖鑑</div>
            <div className="text-xs font-extrabold text-[#C43463] tabular-nums mt-0.5">
              已收集 {collectedEventCount} / {STRAWBERRY_EVENT_CATALOG_ENTRIES.length}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSection('visitors')}
            className="rounded-2xl bg-white/90 border border-[#BFE6D6] px-3 py-2 text-left hover:bg-white transition"
          >
            <div className="text-[11px] font-bold text-[#826862]">🐾 訪客圖鑑</div>
            <div className="text-xs font-extrabold text-[#1F6B54] tabular-nums mt-0.5">
              已相遇 {visitedCount} / {VISITORS.length}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSection('studio')}
            className="rounded-2xl bg-white/95 border border-[#F2C9D8] px-3 py-2 text-left hover:bg-white transition"
          >
            <div className="text-[11px] font-bold text-[#826862]">📸 攝影棚圖鑑</div>
            <div className="text-xs font-extrabold text-[#B83B64] tabular-nums mt-0.5">
              已收集 {studioProgress.totalOwned} / {studioProgress.totalCatalog}
            </div>
            <div className="text-[10px] font-bold text-[#8A5610] tabular-nums mt-0.5">
              🎞️ {effectiveStudio.studioMaterials} 材料・合成區
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSection('town')}
            className="rounded-2xl bg-white/95 border border-[#BFE6D6] px-3 py-2 text-left hover:bg-white transition"
          >
            <div className="text-[11px] font-bold text-[#826862]">🗺️ 小鎮圖鑑</div>
            <div className="text-xs font-extrabold text-[#1F6B54] tabular-nums mt-0.5">
              已收集 {townSummary ? `${townSummary.collected} / ${townSummary.total}` : '查看進度'}
            </div>
            <div className="text-[10px] font-bold text-[#256D57] mt-0.5">
              📍 4 大地點＆訪客
            </div>
          </button>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-extrabold text-[#6E544E]">
            專屬榮譽稱號（點擊已解鎖稱號可佩戴於首頁）
          </div>
          <div className="grid grid-cols-2 gap-2">
            {titleIds.map((tId) => {
              const def = TITLE_DEFINITIONS[tId];
              const isUnlocked = encyclopedia.unlockedTitles.includes(tId);
              const isActive = encyclopedia.activeTitle === tId;
              return (
                <button
                  key={tId}
                  type="button"
                  disabled={!isUnlocked || !onSelectTitle}
                  onClick={() => onSelectTitle?.(isActive ? null : tId)}
                  className={`rounded-2xl border-2 px-3 py-2 text-left transition ${
                    isUnlocked
                      ? isActive
                        ? `${def.badgeClass} ring-2 ring-[#FF7A9E]/40`
                        : `${def.badgeClass} opacity-90 hover:opacity-100`
                      : 'bg-[#F7F2ED] border-[#E7DDD6] text-[#9B8982] cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold inline-flex items-center gap-1 truncate">
                      <span>{isUnlocked ? def.emoji : '🔒'}</span>
                      <span className="truncate">{def.name}</span>
                    </span>
                    {isActive && (
                      <span className="text-[11px] font-extrabold text-[#D64470] shrink-0">
                        佩戴中
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold mt-0.5 opacity-85 leading-snug">
                    {isUnlocked ? def.description : def.unlockCondition}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-4 gap-1 bg-[#F2E5DE] p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setSection('foods')}
          className={`min-h-[46px] rounded-xl text-[10.5px] font-extrabold inline-flex flex-col items-center justify-center gap-0.5 transition whitespace-nowrap ${
            section === 'foods'
              ? 'bg-white text-[#D64470] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 shrink-0" />
          <span className="tabular-nums">食物 {collectedFoodCount}/{FOODS.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('recipes')}
          className={`min-h-[46px] rounded-xl text-[10.5px] font-extrabold inline-flex flex-col items-center justify-center gap-0.5 transition whitespace-nowrap ${
            section === 'recipes'
              ? 'bg-white text-[#B84C24] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5 shrink-0" />
          <span className="tabular-nums">食譜 {learnedRecipeCount}/{KITCHEN_RECIPES.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('accessories')}
          className={`min-h-[46px] rounded-xl text-[10.5px] font-extrabold inline-flex flex-col items-center justify-center gap-0.5 transition whitespace-nowrap ${
            section === 'accessories'
              ? 'bg-white text-[#256D57] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="tabular-nums">配件 {collectedAccessoryCount}/{ACCESSORIES.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('house')}
          className={`min-h-[46px] rounded-xl text-[10.5px] font-extrabold inline-flex flex-col items-center justify-center gap-0.5 transition whitespace-nowrap ${
            section === 'house'
              ? 'bg-white text-[#9D5B12] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Home className="w-3.5 h-3.5 shrink-0" />
          <span className="tabular-nums">佈置 {houseCounts.totalCollected}/{houseCounts.totalItems}</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('events')}
          className={`min-h-[46px] rounded-xl text-[10.5px] font-extrabold inline-flex flex-col items-center justify-center gap-0.5 transition whitespace-nowrap ${
            section === 'events'
              ? 'bg-white text-[#C43463] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Gift className="w-3.5 h-3.5 shrink-0" />
          <span className="tabular-nums">活動 {collectedEventCount}/{STRAWBERRY_EVENT_CATALOG_ENTRIES.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('visitors')}
          className={`min-h-[46px] rounded-xl text-[10.5px] font-extrabold inline-flex flex-col items-center justify-center gap-0.5 transition whitespace-nowrap ${
            section === 'visitors'
              ? 'bg-white text-[#1F6B54] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <PawPrint className="w-3.5 h-3.5 shrink-0" />
          <span className="tabular-nums">訪客 {visitedCount}/{VISITORS.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('studio')}
          className={`min-h-[46px] rounded-xl text-[10.5px] font-extrabold inline-flex flex-col items-center justify-center gap-0.5 transition whitespace-nowrap ${
            section === 'studio'
              ? 'bg-white text-[#B83B64] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span className="tabular-nums">
            攝影棚 {studioProgress.totalOwned}/{studioProgress.totalCatalog}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSection('town')}
          className={`min-h-[46px] rounded-xl text-[10.5px] font-extrabold inline-flex flex-col items-center justify-center gap-0.5 transition whitespace-nowrap ${
            section === 'town'
              ? 'bg-white text-[#1F6B54] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="tabular-nums">
            小鎮 {townSummary ? `${townSummary.collected}/${townSummary.total}` : '圖鑑'}
          </span>
        </button>
      </div>

      {section === 'foods' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-[#4A3531]">全部料理收集進度</h3>
            <span className="text-xs font-extrabold text-[#D64470] tabular-nums">
              已收集 {collectedFoodCount} / {FOODS.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {FOODS.map((food) => {
              const collected = collectedFoodSet.has(food.id);
              return (
                <article
                  key={food.id}
                  className={`rounded-3xl border-2 p-3 flex flex-col items-center text-center transition ${
                    collected
                      ? 'bg-[#FFFDF8] border-[#F4DFD7]'
                      : 'bg-[#F5EFEA] border-[#E7DCD5]'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl relative ${
                      collected
                        ? 'bg-[#FFF3DC] border border-[#F3DCAB]'
                        : 'bg-[#E9DFD8] border border-[#DBD0C8]'
                    }`}
                  >
                    {collected ? (
                      <span aria-hidden="true">{food.emoji}</span>
                    ) : (
                      <>
                        <span
                          className="grayscale brightness-0 opacity-20 select-none"
                          aria-hidden="true"
                        >
                          {food.emoji}
                        </span>
                        <HelpCircle className="w-5 h-5 text-[#8A766F] absolute" />
                      </>
                    )}
                  </div>

                  <h4 className="mt-2 text-xs font-extrabold text-[#4A3531]">
                    {collected ? food.name : '???'}
                  </h4>
                  <span className="text-[11px] font-bold text-[#8B716A] mt-0.5">
                    {collected
                      ? FOOD_CATEGORY_LABELS[food.category]
                      : '餵食或料理後解鎖'}
                  </span>
                  {collected && (
                    <p className="mt-1 text-[11px] text-[#7D635D] leading-snug">
                      {food.description}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {section === 'recipes' && (
        <section className="space-y-3">
          {/* Progress Summary Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#FFF6E5] via-[#FFFDF8] to-[#FFEFF4] border-2 border-[#F2DFD3] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#4A3531]">
                  👩‍🍳 料理食譜圖鑑
                </h3>
                <p className="text-[11px] text-[#7D635D] mt-0.5">
                  在廚房親手合成料理即可學會食譜，查看配方與隱藏提示！
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-[#F0D5C2] text-xs font-extrabold text-[#B84C24] tabular-nums shrink-0">
                {learnedRecipeCount} / {KITCHEN_RECIPES.length}
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[#EFE3DA] overflow-hidden border border-black/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF9A6C] to-[#FF7A9E] transition-all duration-300"
                style={{ width: `${recipeProgressPct}%` }}
              />
            </div>

            <div className="rounded-2xl bg-white/80 border border-[#EEDBD0] px-2.5 py-2 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-extrabold text-[#6E5246]">
                <span>🏆 食譜里程碑獎勵</span>
                <span className="text-[#9A581B] tabular-nums">
                  每階段 +{RECIPE_MILESTONE_COINS} 金幣 · +{RECIPE_MILESTONE_GROWTH} 成長
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {recipeMilestones.map((m) => {
                  const reached =
                    (encyclopedia.claimedRecipeMilestones ?? []).includes(m) ||
                    learnedRecipeCount >= m;
                  return (
                    <span
                      key={m}
                      className={`px-2 py-0.5 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1 tabular-nums ${
                        reached
                          ? 'bg-[#FFEEDB] text-[#9A4816] border border-[#F0B892]'
                          : 'bg-[#F3ECE6] text-[#8E7A73] border border-[#E4D9D0]'
                      }`}
                    >
                      {reached ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Coins className="w-3 h-3" />
                      )}
                      <span>{m} 道</span>
                    </span>
                  );
                })}
                <span className="text-[10px] font-bold text-[#826862]">
                  全收集解鎖「👨‍🍳 食堂神廚」
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="grid grid-cols-3 gap-1 bg-[#F2E5DE] p-1 rounded-xl flex-1 min-w-[200px]">
                {(
                  [
                    { key: 'all', label: `全部 (${KITCHEN_RECIPES.length})` },
                    { key: 'learned', label: `已學會 (${learnedRecipeCount})` },
                    { key: 'locked', label: `隱藏 (${lockedRecipeCount})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRecipeFilter(tab.key)}
                    className={`min-h-[34px] rounded-lg px-1.5 text-[11px] font-extrabold transition whitespace-nowrap ${
                      recipeFilter === tab.key
                        ? 'bg-white text-[#B84C24] shadow-xs'
                        : 'text-[#7D635D] hover:text-[#4A3531]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {onGoToKitchen && (
                <button
                  type="button"
                  onClick={() => onGoToKitchen()}
                  className="min-h-[38px] px-3 rounded-xl bg-[#5CC9A7] text-white text-xs font-extrabold shadow-[0_2px_0_#3BA886] inline-flex items-center gap-1 hover:bg-[#49B895] active:translate-y-0.5 transition shrink-0"
                >
                  <CookingPot className="w-3.5 h-3.5" />
                  <span>去廚房試做</span>
                </button>
              )}
            </div>
          </div>

          {/* Recipe List */}
          {(() => {
            const visibleRecipes = KITCHEN_RECIPES.filter((r) => {
              const isLearned = learnedRecipeSet.has(r.id);
              if (recipeFilter === 'learned') return isLearned;
              if (recipeFilter === 'locked') return !isLearned;
              return true;
            });

            if (visibleRecipes.length === 0) {
              return (
                <div className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE0D8] p-6 text-center space-y-2">
                  <div className="text-3xl">
                    {recipeFilter === 'learned' ? '🍳' : '🎉'}
                  </div>
                  <p className="text-sm font-extrabold text-[#4A3531]">
                    {recipeFilter === 'learned'
                      ? '目前還沒有已學會的食譜喔！'
                      : '太厲害了！全部隱藏食譜都已經學會了！'}
                  </p>
                  <p className="text-xs text-[#7D635D]">
                    {recipeFilter === 'learned'
                      ? '切換到「隱藏」分頁查看提示，再到食堂廚房合成第一道料理吧～'
                      : '你已經掌握了萌寵食堂的所有秘密食譜！'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-2.5">
                {visibleRecipes.map((recipe) => {
                  const isLearned = learnedRecipeSet.has(recipe.id);
                  const reqEntries = Object.entries(recipe.ingredients) as [
                    IngredientId,
                    number,
                  ][];
                  const usesOvernightCrop = reqEntries.some(
                    ([id]) => Boolean(INGREDIENTS[id]?.isOvernight)
                  );
                  const outputFood = foodById.get(recipe.outputFoodId);
                  const isFavorite = favoriteFoodIds.includes(recipe.outputFoodId);
                  const totalUnits = reqEntries.reduce((sum, [, need]) => sum + need, 0);
                  const canCookNow =
                    ingredients !== undefined &&
                    reqEntries.every(([id, need]) => (ingredients[id] ?? 0) >= need);

                  if (!isLearned) {
                    return (
                      <article
                        key={recipe.id}
                        className="rounded-3xl bg-[#F6EFEA] border-2 border-dashed border-[#DCCBC0] p-3.5 space-y-2.5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-[#EAE0D9] border border-[#D9CBC1] flex items-center justify-center text-3xl relative shrink-0">
                            <span
                              className="grayscale brightness-0 opacity-20 select-none"
                              aria-hidden="true"
                            >
                              {recipe.emoji}
                            </span>
                            <Lock className="w-5 h-5 text-[#7F6B64] absolute" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <h4 className="text-sm font-extrabold text-[#5A443E]">
                                ??? 隱藏料理食譜
                              </h4>
                              <span className="px-2 py-0.5 rounded-lg bg-[#EAE0D9] text-[#76615A] text-[10px] font-extrabold">
                                尚未解鎖
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="px-2 py-0.5 rounded-lg bg-white/80 border border-[#E2D4CB] text-[10px] font-extrabold text-[#7A5E52] tabular-nums">
                                需 {reqEntries.length} 種食材（共 {totalUnits} 份）
                              </span>
                              {usesOvernightCrop && (
                                <span className="px-2 py-0.5 rounded-lg bg-[#EFE4FA] border border-[#D4BEEB] text-[10px] font-extrabold text-[#623D85]">
                                  🌙 含過夜長作物
                                </span>
                              )}
                            </div>

                            <div className="mt-2 rounded-2xl bg-[#FFF9F2] border border-[#EAD7C7] px-3 py-2">
                              <p className="text-[11px] font-extrabold text-[#9A581B]">
                                💡 隱藏食譜提示
                              </p>
                              <p className="text-xs text-[#6B4F45] mt-0.5 leading-relaxed">
                                {recipe.hint ?? '收集對應食材並前往食堂廚房合成後即可解鎖！'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                          <div className="flex flex-wrap gap-1.5">
                            {reqEntries.map(([id, need]) => {
                              const isOvernight = Boolean(INGREDIENTS[id]?.isOvernight);
                              return (
                                <span
                                  key={id}
                                  className={`px-2 py-1 rounded-xl border text-[11px] font-extrabold tabular-nums ${
                                    isOvernight
                                      ? 'bg-[#F5ECF9] border-[#DEC9F2] text-[#664188]'
                                      : 'bg-[#EDE3DC] border-[#DDD0C7] text-[#7D665E]'
                                  }`}
                                >
                                  {isOvernight ? '🌙 過夜食材' : '❓ 未知食材'} ×{need}
                                </span>
                              );
                            })}
                          </div>
                          {onGoToKitchen ? (
                            <button
                              type="button"
                              onClick={() => onGoToKitchen(recipe.id)}
                              className="min-h-[32px] px-2.5 rounded-xl bg-[#5CC9A7] text-white text-[11px] font-extrabold inline-flex items-center gap-1 shadow-[0_2px_0_#3BA886] hover:bg-[#49B895] active:translate-y-0.5 transition shrink-0"
                            >
                              <CookingPot className="w-3 h-3" />
                              <span>去廚房試做 ›</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-[#8A7168]">
                              廚房製作後收錄
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  }

                  return (
                    <article
                      key={recipe.id}
                      className={`rounded-3xl bg-[#FFFDF8] border-2 p-3.5 space-y-2.5 ${
                        isFavorite ? 'border-[#FFACC3]' : 'border-[#F2DFD5]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#FFF3DC] border border-[#F3DCAB] flex items-center justify-center text-3xl shrink-0">
                          <span aria-hidden="true">{recipe.emoji}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className="text-sm font-extrabold text-[#4A3531] truncate">
                                {recipe.name}
                              </h4>
                              {outputFood && (
                                <span className="px-1.5 py-0.5 rounded-md bg-[#F6ECE4] text-[10px] font-extrabold text-[#7D5E52] shrink-0">
                                  {FOOD_CATEGORY_LABELS[outputFood.category]}
                                </span>
                              )}
                            </div>
                            <span className="px-2 py-0.5 rounded-lg bg-[#E4F7EE] border border-[#B2E3CF] text-[#1F6B54] text-[10px] font-extrabold inline-flex items-center gap-0.5 shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>已學會</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {isFavorite && (
                              <span className="text-[11px] font-extrabold text-[#D64470]">
                                ♥ 寶貝最愛料理
                              </span>
                            )}
                            {usesOvernightCrop && (
                              <span className="px-1.5 py-0.5 rounded-md bg-[#F3E8FC] text-[#613D84] text-[10px] font-extrabold">
                                🌙 過夜特製
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#7D635D] mt-1 leading-relaxed">
                            {recipe.description}
                          </p>
                        </div>
                      </div>

                      {/* Required Ingredients */}
                      <div className="rounded-2xl bg-[#FAF4ED] border border-[#EBDAD0] p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-[#6E5246]">
                          <span>🧺 製作所需食材</span>
                          {ingredients && (
                            <span
                              className={
                                canCookNow ? 'text-[#1F6B54]' : 'text-[#9A715F]'
                              }
                            >
                              {canCookNow ? '✓ 目前食材齊全可製作' : '尚缺部分食材'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {reqEntries.map(([id, need]) => {
                            const ing = INGREDIENTS[id];
                            const owned = ingredients?.[id];
                            const enough = owned !== undefined && owned >= need;
                            return (
                              <div
                                key={id}
                                className={`rounded-xl border px-2 py-1 inline-flex items-center gap-1.5 text-[11px] font-extrabold tabular-nums ${
                                  ingredients === undefined
                                    ? 'bg-white border-[#E7D5C8] text-[#4E3629]'
                                    : enough
                                    ? 'bg-[#E9F9F2] border-[#AEE3CD] text-[#1F6B54]'
                                    : 'bg-white border-[#E7D5C8] text-[#6E544E]'
                                }`}
                              >
                                <CropIllustration cropId={id} stage="mature" size={20} />
                                <span>{ing.name}</span>
                                <span className="text-[#B84C24]">×{need}</span>
                                {owned !== undefined && (
                                  <span className="text-[10px] opacity-80">
                                    (庫存 {owned})
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bonus & Nutrition Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-[#7D635D] px-0.5 tabular-nums">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                          <span>✨ 合成成長 +{recipe.bonusGrowth}</span>
                          {outputFood && (
                            <span>
                              飽食 +{outputFood.hunger} · 心情 +{outputFood.mood} · 餵食成長 +
                              {outputFood.growthGain}
                            </span>
                          )}
                        </div>
                        {onGoToKitchen && (
                          <button
                            type="button"
                            onClick={() => onGoToKitchen(recipe.id)}
                            className="min-h-[30px] px-2.5 rounded-xl bg-[#E8F8F2] border border-[#AEE3D0] text-[11px] font-extrabold text-[#1F6B54] inline-flex items-center gap-1 hover:bg-[#D5F3E8] active:scale-95 transition shrink-0"
                          >
                            <CookingPot className="w-3 h-3" />
                            <span>前往製作 ›</span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            );
          })()}
        </section>
      )}

      {section === 'accessories' && (
        <section className="space-y-3">
          <div className="rounded-2xl bg-[#FFFDF8] border-2 border-[#E6DFD7] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#4A3531]">
                每收集 5 款配件獎勵里程碑
              </span>
              <span className="font-extrabold text-[#256D57] tabular-nums">
                已收集 {collectedAccessoryCount} / {ACCESSORIES.length}
              </span>
            </div>
            <p className="text-[11px] text-[#7D635D]">
              每達成 5 款自動發放 +{ACCESSORY_MILESTONE_COINS} 金幣與 +{ACCESSORY_MILESTONE_GROWTH} 成長值
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {accessoryMilestones.map((m) => {
                const reached =
                  encyclopedia.claimedAccessoryMilestones.includes(m) ||
                  collectedAccessoryCount >= m;
                return (
                  <span
                    key={m}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1 tabular-nums ${
                      reached
                        ? 'bg-[#E2F6EE] text-[#256D57] border border-[#AEE3D0]'
                        : 'bg-[#F3ECE6] text-[#8E7A73] border border-[#E4D9D0]'
                    }`}
                  >
                    {reached ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Coins className="w-3 h-3" />
                    )}
                    <span>{m} 款</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* 6 Theme Sets Progress */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-extrabold text-[#4A3531]">
                🎀 主題穿搭套裝收集（共 6 套）
              </h3>
              <span className="text-xs font-extrabold text-[#D64470] tabular-nums">
                已完成 {themeProgressList.filter((t) => t.isComplete).length} / {themeProgressList.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {themeProgressList.map((prog) => {
                const { theme } = prog;
                const pct = Math.round((prog.collectedCount / prog.totalCount) * 100);
                const themeTitle = TITLE_DEFINITIONS[theme.rewardTitleId];
                return (
                  <article
                    key={theme.id}
                    className={`rounded-3xl border-2 p-3.5 space-y-2 ${theme.cardBgClass}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-lg shrink-0" aria-hidden="true">
                          {theme.emoji}
                        </span>
                        <h4 className="text-sm font-extrabold text-[#4A3531] truncate">
                          {theme.name}
                        </h4>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-xl border text-[11px] font-extrabold tabular-nums shrink-0 ${
                          prog.isComplete
                            ? 'bg-[#E2F6EE] border-[#A7E0CB] text-[#1F6B54]'
                            : theme.badgeClass
                        }`}
                      >
                        {prog.isComplete
                          ? '✨ 套裝完成！'
                          : `已收集 ${prog.collectedCount} / ${prog.totalCount}`}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6E544E] leading-snug">
                      {theme.description}
                    </p>

                    <div className="w-full h-2 rounded-full bg-white/80 overflow-hidden border border-black/5">
                      <div
                        className="h-full rounded-full bg-[#FF7A9E] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                      {theme.accessoryIds.map((accId) => {
                        const acc = ACCESSORIES.find((a) => a.id === accId);
                        const owned = ownedAccessorySet.has(accId);
                        return (
                          <div
                            key={accId}
                            className={`rounded-2xl border p-1.5 flex flex-col items-center text-center ${
                              owned
                                ? 'bg-white/95 border-[#F2D5C9]'
                                : 'bg-[#EFE7E1]/80 border-[#E2D6CE]'
                            }`}
                          >
                            <div className="w-9 h-9 flex items-center justify-center relative">
                              {owned ? (
                                <AccessoryPreview accessoryId={accId} />
                              ) : (
                                <>
                                  <div className="grayscale brightness-0 opacity-20 scale-75">
                                    <AccessoryPreview accessoryId={accId} />
                                  </div>
                                  <HelpCircle className="w-4 h-4 text-[#8A766F] absolute" />
                                </>
                              )}
                            </div>
                            <span className="mt-0.5 text-[9px] font-extrabold text-[#5A3E36] leading-tight line-clamp-1">
                              {owned && acc ? acc.name : '???'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl bg-white/80 border border-[#F0DFD7] px-2.5 py-1.5 text-[10px] font-extrabold text-[#7D5744] flex flex-wrap items-center justify-between gap-1">
                      <span>🎁 完成獎勵：{themeTitle?.name ?? '專屬稱號'}</span>
                      <span className="text-[#9D5B12] tabular-nums">
                        +{theme.rewardCoins} 金幣 / +{theme.rewardGrowth} 成長 / 限定背景
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <h3 className="text-sm font-extrabold text-[#4A3531]">
              全部配件圖鑑（共 {ACCESSORIES.length} 款）
            </h3>
            <span className="text-xs font-extrabold text-[#256D57] tabular-nums">
              已收集 {collectedAccessoryCount} / {ACCESSORIES.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {ACCESSORIES.map((item) => {
              const collected = ownedAccessorySet.has(item.id);
              const rarityMeta = getAccessoryRarityMeta(item);
              const themeDef = item.theme ? ACCESSORY_THEME_BY_ID[item.theme] : null;
              return (
                <article
                  key={item.id}
                  className={`rounded-3xl border-2 p-3 flex flex-col items-center text-center transition ${
                    collected
                      ? 'bg-[#FFFDF8] border-[#F4DFD7]'
                      : 'bg-[#F5EFEA] border-[#E7DCD5]'
                  }`}
                >
                  <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded-md border text-[10px] font-extrabold ${rarityMeta.badgeClass}`}
                    >
                      {rarityMeta.label}
                    </span>
                    <span className="text-[10px] font-bold text-[#8B716A]">
                      {ACCESSORY_SLOT_LABELS[item.slot]}
                    </span>
                  </div>

                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center relative ${
                      collected
                        ? 'bg-[#FFF8EB] border border-[#F3E2C3]'
                        : 'bg-[#E9DFD8] border border-[#DBD0C8]'
                    }`}
                  >
                    {collected ? (
                      <AccessoryPreview accessoryId={item.id} />
                    ) : (
                      <>
                        <div className="grayscale brightness-0 opacity-20 pointer-events-none">
                          <AccessoryPreview accessoryId={item.id} />
                        </div>
                        <HelpCircle className="w-5 h-5 text-[#8A766F] absolute" />
                      </>
                    )}
                  </div>

                  <h4 className="mt-2 text-xs font-extrabold text-[#4A3531]">
                    {collected ? item.name : '???'}
                  </h4>
                  {themeDef && (
                    <span
                      className={`mt-0.5 px-1.5 py-0.5 rounded-md border text-[10px] font-extrabold ${themeDef.badgeClass}`}
                    >
                      {themeDef.emoji} {themeDef.name}
                    </span>
                  )}
                  <p className="mt-1 text-[11px] text-[#7D635D] leading-snug">
                    {collected ? item.description : getAccessoryObtainLabel(item)}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {section === 'house' && (
        <section className="space-y-4">
          <div className="rounded-2xl bg-[#FFFDF8] border-2 border-[#E6DFD7] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#4A3531]">
                每收集 5 款家具獎勵里程碑
              </span>
              <span className="font-extrabold text-[#9D5B12] tabular-nums">
                已收集 {houseCounts.collectedFurniture} / {houseCounts.totalFurniture}
              </span>
            </div>
            <p className="text-[11px] text-[#7D635D]">
              每收集 5 款家具自動發放 +{FURNITURE_MILESTONE_COINS} 金幣與 +{FURNITURE_MILESTONE_GROWTH} 成長值；收齊主題套裝可解鎖專屬稱號與拍照姿勢！
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {furnitureMilestones.map((m) => {
                const reached =
                  house.claimedFurnitureMilestones.includes(m) ||
                  houseCounts.collectedFurniture >= m;
                return (
                  <span
                    key={m}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1 tabular-nums ${
                      reached
                        ? 'bg-[#FFF3D1] text-[#9D5B12] border border-[#F2CE6D]'
                        : 'bg-[#F3ECE6] text-[#8E7A73] border border-[#E4D9D0]'
                    }`}
                  >
                    {reached ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Coins className="w-3 h-3" />
                    )}
                    <span>{m} 款</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Furniture Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-extrabold text-[#4A3531]">房間家具圖鑑</h3>
              <span className="text-xs font-extrabold text-[#9D5B12] tabular-nums">
                已收集 {houseCounts.collectedFurniture} / {houseCounts.totalFurniture}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {ROOM_ITEMS.map((item) => {
                const collected = collectedFurnitureSet.has(item.id);
                return (
                  <article
                    key={item.id}
                    className={`rounded-3xl border-2 p-3 flex flex-col items-center text-center transition ${
                      collected
                        ? 'bg-[#FFFDF8] border-[#F4DFD7]'
                        : 'bg-[#F5EFEA] border-[#E7DCD5]'
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center relative ${
                        collected
                          ? 'bg-[#FFF8EB] border border-[#F3E2C3]'
                          : 'bg-[#E9DFD8] border border-[#DBD0C8]'
                      }`}
                    >
                      {collected ? (
                        <FurnitureGraphic itemId={item.id} size={46} />
                      ) : (
                        <>
                          <div className="grayscale brightness-0 opacity-20 pointer-events-none">
                            <FurnitureGraphic itemId={item.id} size={46} />
                          </div>
                          <HelpCircle className="w-5 h-5 text-[#8A766F] absolute" />
                        </>
                      )}
                    </div>

                    <h4 className="mt-2 text-xs font-extrabold text-[#4A3531]">
                      {collected ? item.name : '???'}
                    </h4>
                    <span className="text-[11px] font-bold text-[#8B716A] mt-0.5">
                      {ROOM_ZONES[item.zone].name} · {FURNITURE_CATEGORY_LABELS[item.category]}
                    </span>
                    <p className="mt-1 text-[11px] text-[#7D635D] leading-snug">
                      {collected
                        ? item.description
                        : item.craftIngredients
                        ? '於家具店購買或農場作物手作'
                        : '於「佈置小屋 → 家具店」解鎖'}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Wallpapers & Floorings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-extrabold text-[#4A3531]">壁紙與地板圖鑑</h3>
              <span className="text-xs font-extrabold text-[#256D57] tabular-nums">
                已收集 {houseCounts.collectedWallpapers + houseCounts.collectedFloorings} /{' '}
                {houseCounts.totalWallpapers + houseCounts.totalFloorings}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {WALLPAPERS.map((wall) => {
                const collected = house.unlockedWallpapers.includes(wall.id);
                return (
                  <article
                    key={wall.id}
                    className={`rounded-3xl border-2 p-3 space-y-1.5 ${
                      collected
                        ? 'bg-[#FFFDF8] border-[#F4DFD7]'
                        : 'bg-[#F5EFEA] border-[#E7DCD5]'
                    }`}
                  >
                    <div
                      className={`h-11 rounded-xl border flex items-center justify-center text-lg relative ${
                        collected ? 'border-[#EAD4CA]' : 'border-[#DBD0C8] bg-[#E9DFD8]'
                      }`}
                      style={collected ? { background: wall.wallBgStyle } : undefined}
                    >
                      {collected ? wall.emoji : <HelpCircle className="w-5 h-5 text-[#8A766F]" />}
                    </div>
                    <h4 className="text-xs font-extrabold text-[#4A3531] text-center">
                      {collected ? `${wall.name}（壁紙）` : '???（壁紙）'}
                    </h4>
                  </article>
                );
              })}

              {FLOORINGS.map((floor) => {
                const collected = house.unlockedFloorings.includes(floor.id);
                return (
                  <article
                    key={floor.id}
                    className={`rounded-3xl border-2 p-3 space-y-1.5 ${
                      collected
                        ? 'bg-[#FFFDF8] border-[#F4DFD7]'
                        : 'bg-[#F5EFEA] border-[#E7DCD5]'
                    }`}
                  >
                    <div
                      className={`h-11 rounded-xl border flex items-center justify-center text-lg relative ${
                        collected ? 'border-[#EAD4CA]' : 'border-[#DBD0C8] bg-[#E9DFD8]'
                      }`}
                      style={collected ? { background: floor.floorBgStyle } : undefined}
                    >
                      {collected ? floor.emoji : <HelpCircle className="w-5 h-5 text-[#8A766F]" />}
                    </div>
                    <h4 className="text-xs font-extrabold text-[#4A3531] text-center">
                      {collected ? `${floor.name}（地板）` : '???（地板）'}
                    </h4>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Farm Upgrades & Decorations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-extrabold text-[#4A3531]">農場設施與裝飾圖鑑</h3>
              <span className="text-xs font-extrabold text-[#256D57] tabular-nums">
                已收集 {houseCounts.collectedFarmDecor} / {houseCounts.totalFarmDecor}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {FARM_UPGRADES.map((u) => {
                const lvl =
                  u.id === 'sprinkler'
                    ? house.farmUpgrades.sprinklerLevel
                    : u.id === 'greenhouse'
                    ? house.farmUpgrades.greenhouseLevel
                    : house.farmUpgrades.storageLevel;
                const collected = lvl > 0;
                return (
                  <article
                    key={u.id}
                    className={`rounded-3xl border-2 p-3 text-center space-y-1 ${
                      collected
                        ? 'bg-[#FFFDF8] border-[#C5E8DA]'
                        : 'bg-[#F5EFEA] border-[#E7DCD5]'
                    }`}
                  >
                    <div className="text-2xl">{collected ? u.emoji : '❓'}</div>
                    <h4 className="text-xs font-extrabold text-[#4A3531]">
                      {collected ? `${u.name} Lv.${lvl}` : '???（農場設施）'}
                    </h4>
                    <p className="text-[11px] text-[#7D635D] leading-snug">
                      {collected ? u.description : '於「食堂 → 農場」升級建造'}
                    </p>
                  </article>
                );
              })}

              {FARM_DECORATIONS.map((dec) => {
                const collected = house.ownedFarmDecorations.includes(dec.id);
                return (
                  <article
                    key={dec.id}
                    className={`rounded-3xl border-2 p-3 text-center space-y-1 ${
                      collected
                        ? 'bg-[#FFFDF8] border-[#F4DFD7]'
                        : 'bg-[#F5EFEA] border-[#E7DCD5]'
                    }`}
                  >
                    <div className="text-2xl">{collected ? dec.emoji : '❓'}</div>
                    <h4 className="text-xs font-extrabold text-[#4A3531]">
                      {collected ? dec.name : '???（農場裝飾）'}
                    </h4>
                    <p className="text-[11px] text-[#7D635D] leading-snug">
                      {collected ? dec.description : '於「食堂 → 農場」購買佈置'}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {section === 'events' && (
        <section className="space-y-3">
          <div className="rounded-3xl bg-gradient-to-br from-[#FFF0F6] to-[#FFFDF8] border-2 border-[#F4C2D2] p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-[#C43463]">
                  🍓 草莓季限定活動圖鑑
                </h3>
                <p className="text-[11px] font-bold text-[#7D635D] mt-0.5">
                  {eventEnded
                    ? '草莓季已圓滿結束！已取得物品永久保留，未取得物品可在此圖鑑查看取得來源與紀念紀錄。'
                    : '收錄草莓季限定配件、攝影背景、濾鏡、拍立得相框、姿勢與榮譽稱號／徽章！'}
                </p>
              </div>
              <span className="text-xs font-extrabold text-[#C43463] tabular-nums shrink-0">
                {collectedEventCount} / {STRAWBERRY_EVENT_CATALOG_ENTRIES.length}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F7DCE6] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF7A9E] to-[#E6497C] transition-all duration-300"
                style={{
                  width: `${Math.round(
                    (collectedEventCount / STRAWBERRY_EVENT_CATALOG_ENTRIES.length) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {STRAWBERRY_EVENT_CATALOG_ENTRIES.map((entry) => {
              const collected = eventOwnedSet.has(entry.id);
              return (
                <article
                  key={entry.id}
                  className={`rounded-3xl border-2 p-3 flex flex-col items-center text-center transition ${
                    collected
                      ? 'bg-[#FFFDF8] border-[#F4B4CB]'
                      : 'bg-[#F5EFEA] border-[#E7DCD5]'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl relative ${
                      collected
                        ? 'bg-[#FFEAF2] border border-[#F5B4CB]'
                        : 'bg-[#E9DFD8] border border-[#DBD0C8]'
                    }`}
                  >
                    {collected ? (
                      <span aria-hidden="true">{entry.emoji}</span>
                    ) : (
                      <>
                        <span
                          className="grayscale brightness-0 opacity-20 select-none"
                          aria-hidden="true"
                        >
                          {entry.emoji}
                        </span>
                        <Lock className="w-4 h-4 text-[#8A766F] absolute" />
                      </>
                    )}
                  </div>

                  <h4 className="mt-2 text-xs font-extrabold text-[#4A3531]">
                    {entry.name}
                  </h4>
                  <span className="mt-0.5 px-1.5 py-0.5 rounded-md border text-[10px] font-extrabold bg-[#FFF5F8] border-[#F4D0DE] text-[#B83B64]">
                    {entry.categoryLabel}
                  </span>
                  <p className="mt-1 text-[11px] font-bold text-[#7D635D] leading-snug">
                    {collected ? '✅ 已收藏保留' : entry.unlockHint}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {section === 'visitors' && (
        <section className="space-y-3">
          <div className="rounded-3xl bg-gradient-to-br from-[#E9F8F2] to-[#FFFDF8] border-2 border-[#BFE6D6] p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-[#1F6B54]">
                  🐾 小鎮庭院訪客圖鑑
                </h3>
                <p className="text-[11px] font-bold text-[#6E5C56] mt-0.5">
                  在庭院擺設樹木、盆栽或花圃吸引客人！累積好感度可解鎖限定擺飾、攝影棚濾鏡／相框／背景與榮譽稱號。
                </p>
              </div>
              <span className="text-xs font-extrabold text-[#1F6B54] tabular-nums shrink-0">
                {visitedCount} / {VISITORS.length}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#D8EFE5] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#52B788] to-[#2D8B68] transition-all duration-300"
                style={{
                  width: `${Math.round((visitedCount / VISITORS.length) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {VISITORS.map((visitor) => {
              const aff = visitorState?.affinities[visitor.id];
              const level = aff?.level ?? 1;
              const exp = aff?.exp ?? 0;
              const met = Boolean(aff && (aff.firstHostedAt !== null || aff.totalVisits > 0));
              const nextThreshold =
                level < 5 ? VISITOR_AFFINITY_THRESHOLDS[level] ?? null : null;
              const prevThreshold = VISITOR_AFFINITY_THRESHOLDS[level - 1] ?? 0;
              const pct = nextThreshold
                ? Math.min(
                    100,
                    Math.max(
                      0,
                      Math.round(((exp - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
                    )
                  )
                : 100;

              return (
                <article
                  key={visitor.id}
                  className={`rounded-3xl border-2 p-3.5 space-y-2.5 ${
                    met
                      ? 'bg-[#FFFDF8] border-[#CFE8DC]'
                      : 'bg-[#F6F1EC] border-[#E6DCD4]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#F4FBF8] border border-[#D4ECE1] flex items-center justify-center shrink-0">
                      <VisitorSprite
                        visitorId={visitor.id}
                        behavior="sitting"
                        size={56}
                        showAffinityBadge={level}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-[#4A3531] truncate">
                          {visitor.emoji} {visitor.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-lg bg-[#FFF3D8] border border-[#F2CE6D] text-[10px] font-extrabold text-[#8A5610] tabular-nums shrink-0">
                          Lv.{level} / 5
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#6E544E] leading-snug">
                        {visitor.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-[#E8F7F0] text-[#1F6B54]">
                          ❤️ 喜歡：{visitor.preference.favoriteTagsLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF2EE] text-[#A84836]">
                          🙅 不愛：{visitor.preference.dislikedTagsLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Affinity meter */}
                  <div className="rounded-2xl bg-[#FAF4EE] border border-[#EFE2D8] px-3 py-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-[#5A3E36] tabular-nums">
                      <span>
                        好感度累積 {formatAffinityExp(exp)}
                        {nextThreshold ? ` / ${nextThreshold}` : ' (MAX)'}
                      </span>
                      <span className="text-[10px] font-bold text-[#826862]">
                        {met
                          ? `來訪 ${aff?.totalVisits ?? 0} 次 · 招待 ${aff?.totalFed ?? 0} 次`
                          : '尚未在庭院相遇'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#EADCD3] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF9DB8] to-[#52B788] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] font-bold text-[#256D57] bg-[#EFFAF5] border border-[#CDECE0] rounded-xl px-2.5 py-1.5">
                    🏡 {visitor.yardTip}
                  </p>

                  {/* Lv.2 ~ Lv.5 milestones */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold text-[#7D635D]">
                      好感度解鎖里程碑
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {visitor.levelRewards
                        .filter((r) => r.level >= 2)
                        .map((reward) => {
                          const unlocked = level >= reward.level;
                          const decor = reward.decorId
                            ? VISITOR_DECOR_BY_ID[reward.decorId]
                            : null;
                          const studioBits: string[] = [];
                          if (reward.unlockStudio?.filterId) {
                            const f = PHOTO_FILTER_BY_ID[reward.unlockStudio.filterId];
                            if (f) studioBits.push(`濾鏡「${f.label}」`);
                          }
                          if (reward.unlockStudio?.frameId) {
                            const fr = PHOTO_FRAME_BY_ID[reward.unlockStudio.frameId];
                            if (fr) studioBits.push(`相框「${fr.label}」`);
                          }
                          if (reward.unlockStudio?.backgroundId) {
                            const bg = PHOTO_BACKGROUND_BY_ID[reward.unlockStudio.backgroundId];
                            if (bg) studioBits.push(`背景「${bg.label}」`);
                          }
                          return (
                            <div
                              key={reward.level}
                              className={`rounded-xl border px-2.5 py-1.5 flex items-center justify-between gap-2 text-[11px] ${
                                unlocked
                                  ? 'bg-[#E9F8F1] border-[#A7E0CB] text-[#1F6B54]'
                                  : 'bg-[#FAF5F0] border-[#EAE0D7] text-[#7D635D]'
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="font-extrabold">
                                  {unlocked ? '✅' : '🔒'} Lv.{reward.level} · {reward.title}
                                </span>
                                <p className="text-[10px] font-medium leading-snug mt-0.5">
                                  {decor ? `${decor.emoji} ${decor.name} · ` : ''}
                                  {studioBits.length > 0 ? `${studioBits.join('、')} · ` : ''}
                                  {reward.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {section === 'studio' && (
        <StudioCatalogSection
          studio={effectiveStudio}
          coins={coins}
          extraUnlockedPoses={unlockedPhotoPoses}
          extraUnlockedFrames={unlockedPhotoFrames}
          onCraftRecipe={onCraftStudioRecipe}
          onOpenStudio={onOpenStudio}
        />
      )}
      {section === 'town' && game && (
        <TownEncyclopediaSection
          game={game}
          onClaimLocationReward={onClaimTownEncyclopediaReward}
          onOpenLocation={(locId) => onOpenTownMap?.(locId)}
        />
      )}
    </div>
  );
};

