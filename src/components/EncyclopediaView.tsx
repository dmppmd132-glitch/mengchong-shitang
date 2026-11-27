import React, { useEffect, useMemo, useState } from 'react';
import { Award, BookOpen, Layers, Search, Sparkles, X } from 'lucide-react';
import { COLLECTION_CATEGORIES, COLLECTION_FILTERS } from '../data/collection';
import { TOWN_LOCATION_BY_ID } from '../data/town';
import {
  ActiveTownLocationId,
  CollectionCategoryId,
  CollectionFilterId,
  CollectionItem,
  CollectionJumpTarget,
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
  buildCollectionItems,
  computeCollectionProgress,
  filterCollectionItems,
} from '../utils/collection';
import { createInitialPhotoStudioState } from '../utils/photoStudio';
import { CollectionChainSetsView } from './collection/CollectionChainSetsView';
import { CollectionItemCard } from './collection/CollectionItemCard';
import { CollectionItemDetailModal } from './collection/CollectionItemDetailModal';
import { CollectionOverviewHero } from './collection/CollectionOverviewHero';
import { TitleBadgeWall } from './collection/TitleBadgeWall';
import { StudioCatalogSection } from './studio/StudioCatalogSection';
import { TownEncyclopediaSection } from './town/TownEncyclopediaSection';

export type EncyclopediaSection =
  | CollectionCategoryId
  | 'recipes'
  | 'house'
  | 'events';

type EncyclopediaMode = 'album' | 'sets' | 'titles';

function normalizeInitialCategory(section: EncyclopediaSection): CollectionCategoryId {
  if (section === 'recipes') return 'farm';
  if (section === 'house') return 'room';
  if (section === 'events') return 'memories';
  return section;
}

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
  hasSharedRoom?: boolean;
  initialSection?: EncyclopediaSection;
  onSelectTitle?: (titleId: TitleId | null) => void;
  onGoToKitchen?: (recipeId?: string) => void;
  onCraftStudioRecipe?: (recipeId: string) => void;
  onOpenStudio?: () => void;
  onClaimTownEncyclopediaReward?: (locationId: ActiveTownLocationId) => void;
  onOpenTownMap?: (locationId?: ActiveTownLocationId) => void;
  onJumpToTarget?: (target: CollectionJumpTarget, item: CollectionItem) => void;
  onToggleCollectionReminder?: () => void;
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
  game,
  hasSharedRoom = false,
  initialSection = 'pets',
  onSelectTitle,
  onGoToKitchen,
  onCraftStudioRecipe,
  onOpenStudio,
  onClaimTownEncyclopediaReward,
  onOpenTownMap,
  onJumpToTarget,
  onToggleCollectionReminder,
}) => {
  const [mode, setMode] = useState<EncyclopediaMode>(() =>
    initialSection === 'sets' ? 'sets' : 'album'
  );
  const [activeCategory, setActiveCategory] = useState<CollectionCategoryId | 'all'>(() =>
    normalizeInitialCategory(initialSection)
  );
  const [activeFilter, setActiveFilter] = useState<CollectionFilterId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  useEffect(() => {
    const normalized = normalizeInitialCategory(initialSection);
    setActiveCategory(normalized);
    if (normalized === 'sets') {
      setMode('sets');
    } else {
      setMode('album');
    }
  }, [initialSection]);

  const effectiveStudio = useMemo<PhotoStudioState>(() => {
    const base = photoStudio ?? createInitialPhotoStudioState();
    return {
      ...base,
      unlockedPoses: Array.from(new Set([...base.unlockedPoses, ...unlockedPhotoPoses])),
      unlockedFrames: Array.from(new Set([...base.unlockedFrames, ...unlockedPhotoFrames])),
    };
  }, [photoStudio, unlockedPhotoPoses, unlockedPhotoFrames]);

  const snapshotState = useMemo<GameState | null>(() => {
    if (game) return game;
    return null;
  }, [game]);

  const allItems = useMemo(() => {
    if (snapshotState) {
      return buildCollectionItems(snapshotState, hasSharedRoom);
    }
    // Lightweight fallback if called without full game prop
    return [] as CollectionItem[];
  }, [snapshotState, hasSharedRoom]);

  const progress = useMemo(() => {
    if (snapshotState) {
      return computeCollectionProgress(snapshotState, hasSharedRoom, new Date(), allItems);
    }
    return {
      totalCollected: 0,
      totalCount: 0,
      totalPercent: 0,
      categories: COLLECTION_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        emoji: c.emoji,
        description: c.description,
        collected: 0,
        total: 0,
        percent: 0,
      })),
      nextMilestone: null,
      itemsToNextMilestone: 0,
    };
  }, [snapshotState, hasSharedRoom, allItems]);

  const filteredItems = useMemo(
    () => filterCollectionItems(allItems, activeCategory, activeFilter, searchQuery),
    [allItems, activeCategory, activeFilter, searchQuery]
  );

  const handleFallbackJump = (target: CollectionJumpTarget, item: CollectionItem) => {
    if (onJumpToTarget) {
      onJumpToTarget(target, item);
      return;
    }
    if (target === 'canteen') onGoToKitchen?.();
    else if (target === 'studio') onOpenStudio?.();
    else if (target === 'town') onOpenTownMap?.();
  };

  const activeCategoryMeta =
    activeCategory === 'all'
      ? null
      : COLLECTION_CATEGORIES.find((c) => c.id === activeCategory) ?? null;

  const reservedPlaza = TOWN_LOCATION_BY_ID.festival_plaza;
  void house;
  void visitorState;
  void ingredients;

  return (
    <div className="space-y-4">
      {/* Top 3 Sub-Mode Tabs */}
      <div
        className="grid grid-cols-3 gap-1.5 bg-[#F2E5DE] p-1.5 rounded-2xl"
        role="tablist"
        aria-label="圖鑑功能分頁"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'album'}
          onClick={() => setMode('album')}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
            mode === 'album'
              ? 'bg-white text-[#D64470] shadow-xs'
              : 'text-[#6E544E] hover:text-[#4A3531]'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>圖鑑收集冊</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'sets'}
          onClick={() => setMode('sets')}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
            mode === 'sets'
              ? 'bg-white text-[#B83B64] shadow-xs'
              : 'text-[#6E544E] hover:text-[#4A3531]'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>套裝連鎖</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'titles'}
          onClick={() => setMode('titles')}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
            mode === 'titles'
              ? 'bg-white text-[#256D57] shadow-xs'
              : 'text-[#6E544E] hover:text-[#4A3531]'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>稱號徽章牆</span>
        </button>
      </div>

      {mode === 'titles' ? (
        <TitleBadgeWall
          unlockedTitles={encyclopedia.unlockedTitles}
          activeTitle={encyclopedia.activeTitle}
          unlockedBadges={encyclopedia.unlockedCollectionBadges ?? []}
          onSelectTitle={onSelectTitle}
        />
      ) : mode === 'sets' ? (
        <CollectionChainSetsView
          ownedAccessoryIds={unlockedAccessories}
          unlockedChainSetIds={encyclopedia.unlockedChainSetIds ?? []}
          onGoToWardrobe={() => {
            if (onJumpToTarget) {
              const dummy: CollectionItem = {
                id: 'jump_wardrobe',
                categoryId: 'sets',
                name: '衣櫥',
                emoji: '👗',
                description: '',
                owned: true,
                rarity: 'common',
                obtainMethod: '',
                filters: ['owned'],
                jumpTarget: 'wardrobe',
                jumpLabel: '前往衣櫥',
                previewKind: 'emoji',
                previewId: '👗',
              };
              onJumpToTarget('wardrobe', dummy);
            }
          }}
        />
      ) : (
        <>
          <CollectionOverviewHero
            progress={progress}
            claimedMilestones={encyclopedia.claimedTotalMilestones ?? []}
            activeCategory={activeCategory}
            reminderEnabled={encyclopedia.collectionReminderEnabled !== false}
            offlineSummary={encyclopedia.collectionOfflineSummary}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              if (cat === 'sets') {
                setMode('album');
              }
            }}
            onToggleReminder={() => onToggleCollectionReminder?.()}
          />

          {/* 10 Category Horizontal Switcher */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`min-h-[40px] px-3 rounded-xl border text-xs font-extrabold whitespace-nowrap shrink-0 transition ${
                  activeCategory === 'all'
                    ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#C43463]'
                    : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E]'
                }`}
              >
                全部 ({progress.totalCount})
              </button>
              {COLLECTION_CATEGORIES.map((cat) => {
                const catProg = progress.categories.find((c) => c.id === cat.id);
                const selected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`min-h-[40px] px-3 rounded-xl border text-xs font-extrabold whitespace-nowrap shrink-0 inline-flex items-center gap-1 transition tabular-nums ${
                      selected
                        ? `${cat.accentClass} shadow-2xs`
                        : 'bg-[#FFFDF8] border-[#EAD9D0] text-[#6E544E] hover:bg-[#FFF7F2]'
                    }`}
                  >
                    <span aria-hidden="true">{cat.emoji}</span>
                    <span>{cat.shortLabel}</span>
                    {catProg && (
                      <span className="text-[10.5px] opacity-80">
                        {catProg.collected}/{catProg.total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {activeCategoryMeta && (
              <div className="rounded-2xl bg-[#FFFDF8] border border-[#EFE0D7] px-3.5 py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-[#4A3531]">
                    {activeCategoryMeta.emoji} {activeCategoryMeta.label}
                  </div>
                  <p className="text-[11px] font-bold text-[#7D635D] mt-0.5 leading-snug">
                    {activeCategoryMeta.description}
                  </p>
                </div>
                {activeCategoryMeta.id === 'sets' && (
                  <button
                    type="button"
                    onClick={() => setMode('sets')}
                    className="min-h-[38px] px-3 rounded-xl bg-[#FFEAF0] border border-[#F4B4CA] text-[11px] font-extrabold text-[#B83B64] shrink-0 whitespace-nowrap"
                  >
                    看套裝清單 ›
                  </button>
                )}
              </div>
            )}

            {/* Search Input + 8 Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8D766F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋圖鑑項目名稱、取得方式或線索…"
                  aria-label="搜尋圖鑑項目"
                  className="w-full min-h-[44px] rounded-2xl bg-[#FFFDF8] border border-[#E8D7CE] pl-10 pr-10 text-sm font-bold text-[#4A3531] placeholder:text-xs placeholder:text-[#AD9992] focus:outline-none focus:border-[#FF7A9E]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="清除搜尋"
                    className="min-h-[38px] min-w-[38px] absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl flex items-center justify-center text-[#7D635D] hover:bg-[#F5ECE6]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {COLLECTION_FILTERS.map((f) => {
                  const active = activeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className={`min-h-[36px] px-3 rounded-xl border text-[11px] font-extrabold whitespace-nowrap shrink-0 transition ${
                        active
                          ? 'bg-[#4A3531] border-[#4A3531] text-white'
                          : 'bg-[#FAF3ED] border-[#E7D8D0] text-[#6E544E] hover:bg-[#FFFDF8]'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Collection Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-6 text-center space-y-2">
              <div className="text-3xl">🔍</div>
              <p className="text-sm font-extrabold text-[#4A3531]">
                目前篩選條件下沒有符合的項目
              </p>
              <p className="text-xs font-bold text-[#7D635D]">
                試著切換「全部」篩選或清除關鍵字，探索更多等待解鎖的收藏吧！
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
                className="min-h-[40px] px-4 rounded-2xl bg-[#FFEAF0] text-xs font-extrabold text-[#B83B64]"
              >
                重置篩選條件
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filteredItems.map((item) => (
                <CollectionItemCard
                  key={item.id}
                  item={item}
                  onSelect={(picked) => setSelectedItem(picked)}
                />
              ))}
            </div>
          )}

          {/* Embedded Studio Craft & Details Section when viewing Studio */}
          {activeCategory === 'studio' && (
            <div className="pt-2">
              <StudioCatalogSection
                studio={effectiveStudio}
                coins={coins}
                extraUnlockedPoses={unlockedPhotoPoses}
                extraUnlockedFrames={unlockedPhotoFrames}
                onCraftRecipe={onCraftStudioRecipe}
                onOpenStudio={onOpenStudio}
              />
            </div>
          )}

          {/* Embedded Town Location Encyclopedia & Reserved Festival Plaza when viewing Town */}
          {activeCategory === 'town' && snapshotState && (
            <div className="pt-2 space-y-3">
              <TownEncyclopediaSection
                game={snapshotState}
                onClaimLocationReward={onClaimTownEncyclopediaReward}
                onOpenLocation={(locId) => onOpenTownMap?.(locId)}
              />
            </div>
          )}

          {activeCategory === 'town' && !snapshotState && reservedPlaza && (
            <div className="rounded-2xl bg-[#FAF4EE] border border-dashed border-[#DFCBBF] p-3 text-xs font-bold text-[#6E544E] inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D64470]" />
              <span>
                {reservedPlaza.emoji} {reservedPlaza.name}（預留）：{reservedPlaza.subtitle}
              </span>
            </div>
          )}
        </>
      )}

      <CollectionItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onJumpToTarget={(target, item) => {
          setSelectedItem(null);
          handleFallbackJump(target, item);
        }}
      />
    </div>
  );
};
