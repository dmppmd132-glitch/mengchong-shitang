import React, { useMemo, useState } from 'react';
import { Camera, Check, Hammer, Lock, Sparkles } from 'lucide-react';
import {
  PHOTO_BACKGROUNDS,
  PHOTO_FRAMES,
  PHOTO_POSES,
  PHOTO_STICKERS,
  STUDIO_BADGES,
  STUDIO_CRAFT_RECIPES,
  STUDIO_SHOP_FILTERS,
} from '../../data/photoStudio';
import {
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoStickerId,
  PhotoStudioState,
  StudioCraftRecipe,
  StudioItemSource,
  StudioShopCategory,
} from '../../types';
import { createInitialPhotoStudioState } from '../../utils/photoStudio';

interface StudioCatalogSectionProps {
  studio?: PhotoStudioState;
  coins: number;
  extraUnlockedPoses?: PhotoPose[];
  extraUnlockedFrames?: PhotoFrame[];
  onCraftRecipe?: (recipeId: string) => void;
  onOpenStudio?: () => void;
}

type CatalogFilter = 'all' | StudioShopCategory;
type CraftFilter = 'all' | StudioCraftRecipe['targetKind'];
type OwnedFilter = 'all' | 'owned' | 'locked';

interface CatalogItemEntry {
  key: string;
  category: StudioShopCategory;
  categoryLabel: string;
  id: string;
  label: string;
  emoji: string;
  description: string;
  owned: boolean;
  source: StudioItemSource;
  price: number;
  unlockHint: string;
  craftable: boolean;
}

const SOURCE_BADGE: Record<StudioItemSource, { label: string; className: string }> = {
  free: {
    label: '免費內建',
    className: 'bg-[#E9F8F1] border-[#B4E3CE] text-[#1F6B54]',
  },
  shop: {
    label: '攝影商店',
    className: 'bg-[#FFF3D8] border-[#F0CF7A] text-[#8A5610]',
  },
  achievement: {
    label: '成就解鎖',
    className: 'bg-[#EEF4FF] border-[#BBD3FA] text-[#2F5B9E]',
  },
  limited: {
    label: '稀有／限定',
    className: 'bg-[#FFEAF2] border-[#F4B4CB] text-[#B83B64]',
  },
};

const CRAFT_KIND_LABELS: Record<StudioCraftRecipe['targetKind'], string> = {
  background: '背景',
  filter: '濾鏡',
  frame: '相框',
  pose: '姿勢',
  sticker: '貼圖',
};

export const StudioCatalogSection: React.FC<StudioCatalogSectionProps> = ({
  studio: studioProp,
  coins,
  extraUnlockedPoses = [],
  extraUnlockedFrames = [],
  onCraftRecipe,
  onOpenStudio,
}) => {
  const studio = studioProp ?? createInitialPhotoStudioState();
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>('all');
  const [ownedFilter, setOwnedFilter] = useState<OwnedFilter>('all');
  const [craftFilter, setCraftFilter] = useState<CraftFilter>('all');

  const ownedPoseSet = useMemo(
    () =>
      new Set<PhotoPose>([
        'happy',
        'shy',
        'sleep',
        'eat',
        ...studio.unlockedPoses,
        ...extraUnlockedPoses,
      ]),
    [studio.unlockedPoses, extraUnlockedPoses]
  );

  const ownedBgSet = useMemo(
    () =>
      new Set<PhotoBackground>([
        'pink_room',
        'strawberry_field',
        'cloud_sky',
        'kitchen',
        ...studio.unlockedBackgrounds,
      ]),
    [studio.unlockedBackgrounds]
  );

  const ownedFilterSet = useMemo(
    () =>
      new Set<PhotoFilter>([
        'none',
        'forest',
        'cloud',
        'kitchen',
        'party',
        ...studio.unlockedFilters,
      ]),
    [studio.unlockedFilters]
  );

  const ownedFrameSet = useMemo(
    () =>
      new Set<PhotoFrame>([
        'none',
        ...studio.unlockedFrames,
        ...extraUnlockedFrames,
      ]),
    [studio.unlockedFrames, extraUnlockedFrames]
  );

  const ownedStickerSet = useMemo(
    () => new Set<PhotoStickerId>(studio.unlockedStickers),
    [studio.unlockedStickers]
  );

  const craftableTargetKeys = useMemo(
    () => new Set(STUDIO_CRAFT_RECIPES.map((r) => `${r.targetKind}:${r.targetId}`)),
    []
  );

  const progressStats = useMemo(() => {
    const posesOwned = PHOTO_POSES.filter((p) => ownedPoseSet.has(p.id)).length;
    const bgsOwned = PHOTO_BACKGROUNDS.filter((b) => ownedBgSet.has(b.id)).length;
    const filtersOwned = STUDIO_SHOP_FILTERS.filter((f) => ownedFilterSet.has(f.id)).length;
    const framesOwned = PHOTO_FRAMES.filter((f) => ownedFrameSet.has(f.id)).length;
    const stickersOwned = PHOTO_STICKERS.filter((s) => ownedStickerSet.has(s.id)).length;

    const categories: Array<{
      id: StudioShopCategory;
      label: string;
      emoji: string;
      owned: number;
      total: number;
      barClass: string;
      textClass: string;
      bgClass: string;
    }> = [
      {
        id: 'pose',
        label: '姿勢',
        emoji: '✨',
        owned: posesOwned,
        total: PHOTO_POSES.length,
        barClass: 'from-[#FF7A9E] to-[#E6497C]',
        textClass: 'text-[#C43463]',
        bgClass: 'bg-[#FFF0F6] border-[#F4C8D8]',
      },
      {
        id: 'background',
        label: '背景',
        emoji: '🏞️',
        owned: bgsOwned,
        total: PHOTO_BACKGROUNDS.length,
        barClass: 'from-[#52B788] to-[#2D8B68]',
        textClass: 'text-[#1F6B54]',
        bgClass: 'bg-[#E9F8F1] border-[#B4E3CE]',
      },
      {
        id: 'filter',
        label: '濾鏡',
        emoji: '🎨',
        owned: filtersOwned,
        total: STUDIO_SHOP_FILTERS.length,
        barClass: 'from-[#6898F0] to-[#3B6DD4]',
        textClass: 'text-[#2F5B9E]',
        bgClass: 'bg-[#EEF4FF] border-[#C1D6FA]',
      },
      {
        id: 'frame',
        label: '相框',
        emoji: '🖼️',
        owned: framesOwned,
        total: PHOTO_FRAMES.length,
        barClass: 'from-[#F2B84B] to-[#D48817]',
        textClass: 'text-[#8A5610]',
        bgClass: 'bg-[#FFF5DF] border-[#F2D391]',
      },
      {
        id: 'sticker',
        label: '貼圖',
        emoji: '🩷',
        owned: stickersOwned,
        total: PHOTO_STICKERS.length,
        barClass: 'from-[#B682E8] to-[#8C4EC9]',
        textClass: 'text-[#6A359C]',
        bgClass: 'bg-[#F6EEFF] border-[#DEC6FA]',
      },
    ];

    const totalOwned = categories.reduce((s, c) => s + c.owned, 0);
    const totalCatalog = categories.reduce((s, c) => s + c.total, 0);
    const totalPct = totalCatalog > 0 ? Math.round((totalOwned / totalCatalog) * 100) : 0;

    return { categories, totalOwned, totalCatalog, totalPct };
  }, [ownedPoseSet, ownedBgSet, ownedFilterSet, ownedFrameSet, ownedStickerSet]);

  const allCatalogEntries = useMemo<CatalogItemEntry[]>(() => {
    const entries: CatalogItemEntry[] = [];

    for (const p of PHOTO_POSES) {
      entries.push({
        key: `pose:${p.id}`,
        category: 'pose',
        categoryLabel: '姿勢',
        id: p.id,
        label: p.label,
        emoji: p.emoji,
        description: p.description,
        owned: ownedPoseSet.has(p.id),
        source: p.source,
        price: p.price,
        unlockHint: p.unlockHint ?? '初始免費解鎖',
        craftable: craftableTargetKeys.has(`pose:${p.id}`),
      });
    }

    for (const b of PHOTO_BACKGROUNDS) {
      entries.push({
        key: `background:${b.id}`,
        category: 'background',
        categoryLabel: '背景',
        id: b.id,
        label: b.label,
        emoji: b.emoji,
        description: b.description,
        owned: ownedBgSet.has(b.id),
        source: b.source,
        price: b.price,
        unlockHint: b.unlockHint ?? '初始免費解鎖',
        craftable: craftableTargetKeys.has(`background:${b.id}`),
      });
    }

    for (const f of STUDIO_SHOP_FILTERS) {
      entries.push({
        key: `filter:${f.id}`,
        category: 'filter',
        categoryLabel: '濾鏡',
        id: f.id,
        label: f.label,
        emoji: f.emoji,
        description: `${f.label}專屬色調濾鏡`,
        owned: ownedFilterSet.has(f.id),
        source: f.source,
        price: f.price,
        unlockHint: f.unlockHint ?? '初始免費解鎖',
        craftable: craftableTargetKeys.has(`filter:${f.id}`),
      });
    }

    for (const fr of PHOTO_FRAMES) {
      entries.push({
        key: `frame:${fr.id}`,
        category: 'frame',
        categoryLabel: '相框',
        id: fr.id,
        label: fr.label,
        emoji: fr.emoji,
        description: `${fr.label}攝影邊框裝飾`,
        owned: ownedFrameSet.has(fr.id),
        source: fr.source,
        price: fr.price,
        unlockHint: fr.unlockHint ?? '初始免費解鎖',
        craftable: craftableTargetKeys.has(`frame:${fr.id}`),
      });
    }

    for (const st of PHOTO_STICKERS) {
      const isCraftable = craftableTargetKeys.has(`sticker:${st.id}`);
      entries.push({
        key: `sticker:${st.id}`,
        category: 'sticker',
        categoryLabel: '貼圖',
        id: st.id,
        label: st.label,
        emoji: st.emoji,
        description: '可貼在寫真照片上的可愛裝飾貼圖（可無限次使用）',
        owned: ownedStickerSet.has(st.id),
        source: isCraftable ? 'limited' : 'shop',
        price: st.price,
        unlockHint: isCraftable
          ? `攝影商店購買（${st.price} 金幣）或於合成區以 1 份攝影材料合成`
          : `於攝影棚商店購買（${st.price} 金幣）`,
        craftable: isCraftable,
      });
    }

    return entries;
  }, [
    ownedPoseSet,
    ownedBgSet,
    ownedFilterSet,
    ownedFrameSet,
    ownedStickerSet,
    craftableTargetKeys,
  ]);

  const filteredCatalogEntries = useMemo(
    () =>
      allCatalogEntries.filter((entry) => {
        if (catalogFilter !== 'all' && entry.category !== catalogFilter) return false;
        if (ownedFilter === 'owned' && !entry.owned) return false;
        if (ownedFilter === 'locked' && entry.owned) return false;
        return true;
      }),
    [allCatalogEntries, catalogFilter, ownedFilter]
  );

  const filteredCraftRecipes = useMemo(() => {
    const list = STUDIO_CRAFT_RECIPES.filter(
      (rec) => craftFilter === 'all' || rec.targetKind === craftFilter
    );
    return [...list].sort((a, b) => {
      const aOwned = isRecipeOwned(a);
      const bOwned = isRecipeOwned(b);
      if (aOwned !== bOwned) return aOwned ? 1 : -1;
      return 0;
    });
    function isRecipeOwned(rec: StudioCraftRecipe): boolean {
      if (rec.targetKind === 'background') {
        return ownedBgSet.has(rec.targetId as PhotoBackground);
      }
      if (rec.targetKind === 'frame') {
        return ownedFrameSet.has(rec.targetId as PhotoFrame);
      }
      if (rec.targetKind === 'filter') {
        return ownedFilterSet.has(rec.targetId as PhotoFilter);
      }
      if (rec.targetKind === 'pose') {
        return ownedPoseSet.has(rec.targetId as PhotoPose);
      }
      return ownedStickerSet.has(rec.targetId as PhotoStickerId);
    }
  }, [
    craftFilter,
    ownedBgSet,
    ownedFrameSet,
    ownedFilterSet,
    ownedPoseSet,
    ownedStickerSet,
  ]);

  const checkRecipeOwned = (rec: StudioCraftRecipe): boolean => {
    if (rec.targetKind === 'background') {
      return ownedBgSet.has(rec.targetId as PhotoBackground);
    }
    if (rec.targetKind === 'frame') {
      return ownedFrameSet.has(rec.targetId as PhotoFrame);
    }
    if (rec.targetKind === 'filter') {
      return ownedFilterSet.has(rec.targetId as PhotoFilter);
    }
    if (rec.targetKind === 'pose') {
      return ownedPoseSet.has(rec.targetId as PhotoPose);
    }
    return ownedStickerSet.has(rec.targetId as PhotoStickerId);
  };

  return (
    <div className="space-y-4">
      {/* 1. 攝影棚圖鑑總覽與 5 大分類進度 */}
      <section className="rounded-3xl bg-gradient-to-br from-[#FFF0F6] via-[#FFF8EA] to-[#EEF8F4] border-2 border-[#F3D5DF] p-3.5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-[#4A3531]">
              📸 攝影棚圖鑑
            </h3>
            <p className="text-[11px] font-bold text-[#7D635D] mt-0.5 leading-snug">
              完整收錄姿勢、背景、濾鏡、相框與貼圖收藏進度，點擊分類卡即可篩選明細！
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-white/95 border border-[#F2C7D6] text-xs font-extrabold text-[#D64470] tabular-nums shrink-0">
            {progressStats.totalOwned} / {progressStats.totalCatalog} ({progressStats.totalPct}%)
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-white/85 border border-[#F1D5DF] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF7A9E] via-[#F2B84B] to-[#52B788] transition-all duration-300"
            style={{ width: `${progressStats.totalPct}%` }}
          />
        </div>

        {/* 5 Categories Progress Grid */}
        <div className="grid grid-cols-2 gap-2">
          {progressStats.categories.map((cat, idx) => {
            const pct = cat.total > 0 ? Math.round((cat.owned / cat.total) * 100) : 0;
            const isSelected = catalogFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCatalogFilter(isSelected ? 'all' : cat.id)}
                className={`rounded-2xl border p-2.5 text-left transition ${
                  idx === 4 ? 'col-span-2' : ''
                } ${
                  isSelected
                    ? `${cat.bgClass} ring-2 ring-[#FF7A9E]/45`
                    : 'bg-white/90 border-[#EFE0D7] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-extrabold text-[#4A3531] inline-flex items-center gap-1">
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className={`text-[11px] font-extrabold tabular-nums ${cat.textClass}`}>
                    {cat.owned} / {cat.total} ({pct}%)
                  </span>
                </div>
                <div className="mt-1.5 w-full h-1.5 rounded-full bg-[#EFE5DF] overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.barClass} transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Resources + Jump to Studio */}
        <div className="rounded-2xl bg-white/90 border border-[#EEDCD4] px-3 py-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 text-[11px] font-extrabold text-[#5A3E36] tabular-nums flex-wrap">
            <span>🎞️ 攝影材料 {studio.studioMaterials}</span>
            <span>🖼️ 相框碎片 {studio.studioFrameShards}</span>
            <span>🪙 {coins}</span>
          </div>
          {onOpenStudio && (
            <button
              type="button"
              onClick={onOpenStudio}
              className="min-h-[36px] px-3 rounded-xl bg-[#FF7A9E] text-white text-[11px] font-extrabold shadow-[0_2px_0_#D9577B] inline-flex items-center gap-1 hover:bg-[#F76890] active:translate-y-0.5 transition shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>前往攝影棚</span>
            </button>
          )}
        </div>

        {/* Studio Honors */}
        <div className="flex flex-wrap gap-1.5">
          {Object.values(STUDIO_BADGES).map((badge) => {
            const owned = studio.unlockedStudioBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-xl border px-2.5 py-1.5 text-[10px] font-extrabold flex items-center gap-1.5 ${
                  owned
                    ? 'bg-[#FFF3D8] border-[#F0CF7A] text-[#7A540E]'
                    : 'bg-white/75 border-[#EADCD5] text-[#8E756E]'
                }`}
              >
                <span>{badge.emoji}</span>
                <span>{badge.name}</span>
                <span className="font-bold">
                  · {owned ? '已獲得' : badge.conditionText}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. 合成區：攝影材料合成稀有道具 */}
      <section
        aria-labelledby="studio-craft-section-title"
        className="rounded-3xl bg-gradient-to-br from-[#FFF6EC] via-[#FFFDF8] to-[#FFF0F6] border-2 border-[#F4CFDC] p-3.5 space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4
              id="studio-craft-section-title"
              className="text-sm font-extrabold text-[#B83B64] inline-flex items-center gap-1.5"
            >
              <Hammer className="w-4 h-4 shrink-0" />
              <span>合成區・攝影材料工坊</span>
            </h4>
            <p className="text-[11px] font-bold text-[#7D635D] mt-0.5 leading-snug">
              使用「🎞️ 攝影材料」（可於週穿搭挑戰、小鎮攝影訂單、招待訪客取得）合成限定稀有道具！
            </p>
          </div>
          <div className="rounded-xl bg-white border border-[#F0D3DE] px-2.5 py-1 text-[11px] font-extrabold text-[#5A3E36] tabular-nums shrink-0">
            🎞️ {studio.studioMaterials}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {(
            [
              { id: 'all', label: '全部配方' },
              { id: 'background', label: '限定背景' },
              { id: 'filter', label: '特調濾鏡' },
              { id: 'frame', label: '限定相框' },
              { id: 'pose', label: '稀有姿勢' },
              { id: 'sticker', label: '稀有貼圖' },
            ] as const
          ).map((tab) => {
            const active = craftFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCraftFilter(tab.id)}
                className={`min-h-[34px] px-2.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap border transition ${
                  active
                    ? 'bg-[#FF7A9E] border-[#E05E83] text-white shadow-xs'
                    : 'bg-white border-[#EAD9D0] text-[#6E544E]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {filteredCraftRecipes.map((rec) => {
            const alreadyOwned = checkRecipeOwned(rec);
            const hasMaterials = studio.studioMaterials >= rec.materialCost;
            const hasShards = studio.studioFrameShards >= rec.frameShardCost;
            const hasCoins = coins >= rec.coinCost;
            const canCraft = !alreadyOwned && hasMaterials && hasShards && hasCoins;

            return (
              <article
                key={rec.id}
                className={`rounded-2xl border-2 p-2.5 flex items-center justify-between gap-2.5 ${
                  alreadyOwned
                    ? 'bg-[#F5FBF8] border-[#CFECE0]'
                    : canCraft
                    ? 'bg-white border-[#F5B8CC] shadow-xs'
                    : 'bg-white/85 border-[#EFE0D7]'
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-[#4A3531]">
                      {rec.emoji} {rec.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#FAF4EE] border border-[#E8D8CE] text-[9px] font-extrabold text-[#7D635D]">
                      {CRAFT_KIND_LABELS[rec.targetKind]}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#7D635D] leading-snug">
                    {rec.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold tabular-nums">
                    <span
                      className={`px-2 py-0.5 rounded-md border ${
                        hasMaterials
                          ? 'bg-[#E9F8F1] border-[#B4E3CE] text-[#1F6B54]'
                          : 'bg-[#FFF1EE] border-[#F4C4BC] text-[#B84C24]'
                      }`}
                    >
                      🎞️ 攝影材料 {rec.materialCost}
                    </span>
                    {rec.frameShardCost > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-md border ${
                          hasShards
                            ? 'bg-[#FFF5DF] border-[#F0D391] text-[#8A5610]'
                            : 'bg-[#FFF1EE] border-[#F4C4BC] text-[#B84C24]'
                        }`}
                      >
                        🖼️ 相框碎片 {rec.frameShardCost}
                      </span>
                    )}
                    {rec.coinCost > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-md border ${
                          hasCoins
                            ? 'bg-[#FAF4EE] border-[#E7D8CE] text-[#6E544E]'
                            : 'bg-[#FFF1EE] border-[#F4C4BC] text-[#B84C24]'
                        }`}
                      >
                        🪙 {rec.coinCost}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={alreadyOwned || !canCraft || !onCraftRecipe}
                  onClick={() => onCraftRecipe?.(rec.id)}
                  className={`min-h-[42px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 transition whitespace-nowrap ${
                    alreadyOwned
                      ? 'bg-[#E6F8F1] text-[#1F6B54]'
                      : canCraft && onCraftRecipe
                      ? 'bg-[#FF7A9E] text-white shadow-[0_2px_0_#D9577B] active:translate-y-0.5'
                      : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                  }`}
                >
                  {alreadyOwned ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      已擁有
                    </span>
                  ) : canCraft ? (
                    '立即合成'
                  ) : (
                    '材料不足'
                  )}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. 全部攝影棚藏品清單（姿勢・背景・濾鏡・相框・貼圖） */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <h4 className="text-xs font-extrabold text-[#4A3531] inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D64470]" />
            <span>攝影棚藏品圖鑑明細</span>
          </h4>
          <div className="inline-flex rounded-xl bg-[#F2E5DE] p-0.5 text-[10px] font-extrabold">
            {(
              [
                { id: 'all', label: '全部' },
                { id: 'owned', label: '已收集' },
                { id: 'locked', label: '未解鎖' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setOwnedFilter(opt.id)}
                className={`min-h-[28px] px-2 rounded-lg transition ${
                  ownedFilter === opt.id
                    ? 'bg-white text-[#4A3531] shadow-xs'
                    : 'text-[#7D635D]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1 bg-[#F2E5DE] p-1 rounded-2xl">
          {(
            [
              { id: 'all', label: '全部' },
              { id: 'pose', label: '姿勢' },
              { id: 'background', label: '背景' },
              { id: 'filter', label: '濾鏡' },
              { id: 'frame', label: '相框' },
              { id: 'sticker', label: '貼圖' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCatalogFilter(tab.id)}
              className={`min-h-[36px] rounded-xl text-[10.5px] font-extrabold transition whitespace-nowrap ${
                catalogFilter === tab.id
                  ? 'bg-white text-[#D64470] shadow-xs'
                  : 'text-[#7D635D] hover:text-[#4A3531]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredCatalogEntries.length === 0 ? (
          <div className="rounded-2xl bg-[#FAF4EE] border border-[#EAE0D7] p-4 text-center text-xs font-bold text-[#7D635D]">
            此分類目前沒有符合篩選條件的藏品！
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredCatalogEntries.map((entry) => {
              const sourceMeta = SOURCE_BADGE[entry.source];
              return (
                <article
                  key={entry.key}
                  className={`rounded-2xl border-2 p-2.5 flex flex-col justify-between gap-2 transition ${
                    entry.owned
                      ? 'bg-[#FFFDF8] border-[#F4DFD7]'
                      : 'bg-[#F5EFEA] border-[#E7DCD5]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl relative shrink-0 ${
                          entry.owned
                            ? 'bg-[#FFF3DC] border border-[#F3DCAB]'
                            : 'bg-[#E9DFD8] border border-[#DBD0C8]'
                        }`}
                      >
                        {entry.owned ? (
                          <span aria-hidden="true">{entry.emoji}</span>
                        ) : (
                          <>
                            <span
                              className="grayscale brightness-0 opacity-20 select-none"
                              aria-hidden="true"
                            >
                              {entry.emoji}
                            </span>
                            <Lock className="w-3.5 h-3.5 text-[#8A766F] absolute" />
                          </>
                        )}
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded-md border text-[9px] font-extrabold shrink-0 ${sourceMeta.className}`}
                      >
                        {entry.categoryLabel} · {sourceMeta.label}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-xs font-extrabold text-[#4A3531] truncate">
                        {entry.label}
                      </h5>
                      <p className="text-[10px] text-[#7D635D] leading-snug mt-0.5">
                        {entry.owned ? entry.description : entry.unlockHint}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-[#F1E6DF] flex items-center justify-between text-[10px] font-extrabold">
                    {entry.owned ? (
                      <span className="text-[#1F6B54] inline-flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        已收集
                      </span>
                    ) : (
                      <span className="text-[#9D5B12]">
                        {entry.craftable
                          ? '🔨 可於合成區合成'
                          : entry.price > 0
                          ? `🪙 ${entry.price} 金幣`
                          : '🔒 未解鎖'}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
