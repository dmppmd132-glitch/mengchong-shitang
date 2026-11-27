import React from 'react';
import { CheckCircle2, HelpCircle, Lock } from 'lucide-react';
import { PHOTO_BACKGROUND_BY_ID, PHOTO_FILTER_BY_ID, PHOTO_FRAME_BY_ID } from '../../data/photoStudio';
import {
  CollectionItem,
  IngredientId,
  PetSpecies,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  TownVisitorId,
} from '../../types';
import { AccessoryPreview } from '../AccessoryPreview';
import { CropIllustration } from '../house/FarmIllustrations';
import { FurnitureGraphic } from '../house/FurnitureGraphic';
import { PiggyCharacter } from '../PiggyCharacter';
import { StudioBackgroundArt } from '../studio/StudioBackgroundArt';
import { TownVisitorSprite } from '../town/TownArtwork';

interface CollectionItemCardProps {
  item: CollectionItem;
  onSelect: (item: CollectionItem) => void;
}

const RARITY_LABEL: Record<CollectionItem['rarity'], string> = {
  common: '日常',
  rare: '稀有',
  epic: '珍藏',
  event: '活動限定',
  coop: '共養限定',
};

const EMPTY_EQUIPPED = {
  head: null,
  face: null,
  neck: null,
  body: null,
  held: null,
  back: null,
} as const;

export const CollectionItemVisual: React.FC<{
  item: CollectionItem;
  size?: 'sm' | 'lg';
}> = ({ item, size = 'sm' }) => {
  const isLg = size === 'lg';
  const boxClass = isLg ? 'w-24 h-24 rounded-3xl' : 'w-14 h-14 rounded-2xl';
  const silhouetteWrap = item.owned ? '' : 'grayscale brightness-0 opacity-20 select-none';

  // Mystery visitor before first encounter: strictly ? silhouette
  if (item.isMysteryVisitor && !item.owned) {
    return (
      <div
        className={`${boxClass} bg-[#EDE4DD] border border-[#DCD0C7] flex flex-col items-center justify-center relative shrink-0`}
      >
        <HelpCircle className={`${isLg ? 'w-9 h-9' : 'w-6 h-6'} text-[#8D7870]`} />
      </div>
    );
  }

  let visualNode: React.ReactNode = (
    <span className={isLg ? 'text-4xl' : 'text-2xl'} aria-hidden="true">
      {item.emoji}
    </span>
  );

  if (item.previewKind === 'pet') {
    visualNode = (
      <div className={isLg ? 'scale-90' : 'scale-[0.58]'}>
        <PiggyCharacter
          species={item.previewId as PetSpecies}
          growth={120}
          roundness={55}
          action="idle"
          expression="sparkle"
          equipped={{ ...EMPTY_EQUIPPED }}
          size={84}
          interactive={false}
        />
      </div>
    );
  } else if (item.previewKind === 'accessory') {
    visualNode = (
      <div className={isLg ? 'scale-125' : 'scale-90'}>
        <AccessoryPreview accessoryId={item.previewId} />
      </div>
    );
  } else if (item.previewKind === 'furniture') {
    visualNode = (
      <FurnitureGraphic itemId={item.previewId} size={isLg ? 64 : 40} />
    );
  } else if (item.previewKind === 'crop') {
    visualNode = (
      <CropIllustration
        cropId={item.previewId as IngredientId}
        stage="mature"
        size={isLg ? 64 : 42}
      />
    );
  } else if (item.previewKind === 'visitor') {
    visualNode = (
      <TownVisitorSprite
        visitorId={item.previewId as TownVisitorId}
        className={isLg ? 'w-16 h-16' : 'w-11 h-11'}
      />
    );
  } else if (item.previewKind === 'studio_bg') {
    const bgId = item.previewId as PhotoBackground;
    if (bgId in PHOTO_BACKGROUND_BY_ID) {
      visualNode = (
        <div className="relative w-full h-full overflow-hidden rounded-[inherit]">
          <StudioBackgroundArt backgroundId={bgId} compact />
        </div>
      );
    }
  } else if (item.previewKind === 'studio_filter') {
    const filterMeta = PHOTO_FILTER_BY_ID[item.previewId as PhotoFilter];
    if (filterMeta) {
      visualNode = (
        <div
          className={`w-full h-full rounded-[inherit] flex items-center justify-center ${filterMeta.backdropClass}`}
        >
          <span className={isLg ? 'text-3xl' : 'text-xl'} aria-hidden="true">
            {filterMeta.emoji}
          </span>
        </div>
      );
    }
  } else if (item.previewKind === 'studio_frame') {
    const frameMeta = PHOTO_FRAME_BY_ID[item.previewId as PhotoFrame];
    visualNode = (
      <div
        className={`w-full h-full rounded-[inherit] flex items-center justify-center ${
          frameMeta ? frameMeta.outerClass : 'bg-[#FFFDF8] border-2 border-[#E7D8CE]'
        }`}
      >
        <span className={isLg ? 'text-3xl' : 'text-xl'} aria-hidden="true">
          {frameMeta?.emoji ?? item.emoji}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${boxClass} relative flex items-center justify-center overflow-hidden shrink-0 border ${
        item.owned
          ? 'bg-[#FFF5E4] border-[#F2DAB4]'
          : 'bg-[#EDE4DD] border-[#DCD0C7]'
      }`}
    >
      <div
        className={`w-full h-full flex items-center justify-center ${silhouetteWrap}`}
      >
        {visualNode}
      </div>
      {!item.owned && (
        <Lock
          className={`${
            isLg ? 'w-5 h-5' : 'w-3.5 h-3.5'
          } text-[#7B665E] absolute bottom-1.5 right-1.5 drop-shadow-xs`}
        />
      )}
    </div>
  );
};

export const CollectionItemCard: React.FC<CollectionItemCardProps> = ({
  item,
  onSelect,
}) => {
  const showName = item.isMysteryVisitor && !item.owned ? '???' : item.name;
  const metadataSegments: string[] = [RARITY_LABEL[item.rarity]];
  if (typeof item.wearCount === 'number' && item.owned) {
    metadataSegments.push(`穿戴 ${item.wearCount} 次`);
  } else if (item.isExpiring && item.eventRemainingText) {
    metadataSegments.push(item.eventRemainingText);
  } else if (typeof item.price === 'number' && item.price > 0 && !item.owned) {
    metadataSegments.push(`${item.price} 金幣`);
  } else if (item.tagText) {
    metadataSegments.push(item.tagText);
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`min-h-[136px] rounded-2xl border-2 p-3 text-left flex flex-col justify-between gap-2 transition active:scale-[0.99] ${
        item.owned
          ? 'bg-[#FFFDF8] border-[#F0DDD3] hover:border-[#FF9BB8]'
          : 'bg-[#F5EFEA] border-[#E5D9D1] hover:border-[#D5C3B8]'
      }`}
    >
      <div className="flex items-start gap-2.5 w-full">
        <CollectionItemVisual item={item} size="sm" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-1">
            <h4 className="text-xs font-extrabold text-[#4A3531] leading-snug line-clamp-2">
              {showName}
            </h4>
            {item.owned && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E9E75] shrink-0 mt-0.5" />
            )}
          </div>
          <p className="text-[10.5px] font-bold text-[#856B64] tabular-nums leading-snug">
            {metadataSegments.join(' · ')}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-[#6E544E] leading-snug line-clamp-2">
        {item.owned
          ? item.description
          : item.mysteryHint ?? item.obtainMethod}
      </p>
    </button>
  );
};
