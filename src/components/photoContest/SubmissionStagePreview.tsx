import React from 'react';
import {
  PHOTO_FILTER_BY_ID,
  PHOTO_FRAME_BY_ID,
  PHOTO_POSE_BY_ID,
  PHOTO_STICKER_BY_ID,
} from '../../data/photoStudio';
import {
  AccessorySlot,
  PetSpecies,
  PetViewDirection,
  PhotoBackground,
  PhotoFilter,
  PhotoFrame,
  PhotoPose,
  PhotoStickerId,
  PhotoSubmission,
} from '../../types';
import { PiggyCharacter } from '../PiggyCharacter';
import { StudioBackgroundArt } from '../studio/StudioBackgroundArt';

const STICKER_POSITIONS = [
  'top-3 left-3',
  'top-3 right-3',
  'bottom-3 right-3',
  'bottom-3 left-3',
];

export interface SubmissionStagePreviewProps {
  species: PetSpecies;
  equipped: Record<AccessorySlot, string | null>;
  poseId: PhotoPose;
  facing: PetViewDirection;
  backgroundId: PhotoBackground;
  filterId: PhotoFilter;
  frameId: PhotoFrame;
  stickers: PhotoStickerId[];
  duoPet?: PhotoSubmission['duoPet'];
  compact?: boolean;
}

export const SubmissionStagePreview: React.FC<SubmissionStagePreviewProps> = ({
  species,
  equipped,
  poseId,
  facing,
  backgroundId,
  filterId,
  frameId,
  stickers,
  duoPet,
  compact = false,
}) => {
  const pose = PHOTO_POSE_BY_ID[poseId] ?? PHOTO_POSE_BY_ID.happy;
  const duoPose =
    PHOTO_POSE_BY_ID[duoPet?.poseId ?? 'happy'] ?? PHOTO_POSE_BY_ID.happy;
  const filter = PHOTO_FILTER_BY_ID[filterId] ?? PHOTO_FILTER_BY_ID.none;
  const frame = PHOTO_FRAME_BY_ID[frameId] ?? PHOTO_FRAME_BY_ID.rounded;

  return (
    <div className={`${frame.outerClass} relative`}>
      {frame.cornerEmojis && (
        <>
          <span
            className="pointer-events-none absolute -top-2 -left-1.5 text-sm select-none z-20"
            aria-hidden="true"
          >
            {frame.cornerEmojis[0]}
          </span>
          <span
            className="pointer-events-none absolute -top-2 -right-1.5 text-sm select-none z-20"
            aria-hidden="true"
          >
            {frame.cornerEmojis[1]}
          </span>
        </>
      )}
      <div
        className={`${frame.innerClass} bg-[#FFFDF8] relative w-full ${
          compact ? 'aspect-[4/3]' : 'aspect-[16/11]'
        } rounded-2xl overflow-hidden border border-white/80 shadow-inner`}
        style={{
          filter:
            filter.stageFilterCss && filter.stageFilterCss !== 'none'
              ? filter.stageFilterCss
              : undefined,
        }}
      >
        <StudioBackgroundArt
          backgroundId={backgroundId}
          filterId={filterId}
          compact={compact}
        />
        {stickers.slice(0, 3).map((sid, idx) => {
          const st = PHOTO_STICKER_BY_ID[sid];
          if (!st) return null;
          return (
            <span
              key={`${sid}_${idx}`}
              className={`pointer-events-none absolute ${
                STICKER_POSITIONS[idx % STICKER_POSITIONS.length]
              } ${compact ? 'text-base' : 'text-xl'} drop-shadow-sm select-none z-10`}
              aria-hidden="true"
            >
              {st.emoji}
            </span>
          );
        })}
        <div className="absolute inset-0 flex items-end justify-center pb-2.5 gap-1 z-10">
          <PiggyCharacter
            species={species}
            growth={64}
            roundness={36}
            action={pose.action}
            expression={pose.expression}
            equipped={equipped}
            interactive={false}
            customAnimClass={pose.animClass}
            viewDirection={facing}
            size={compact ? (duoPet ? 64 : 78) : duoPet ? 92 : 114}
          />
          {duoPet && (
            <PiggyCharacter
              species={duoPet.species}
              growth={64}
              roundness={36}
              action={duoPose.action}
              expression={duoPose.expression}
              equipped={duoPet.equipped}
              interactive={false}
              customAnimClass={duoPose.animClass}
              viewDirection={duoPet.facing ?? 'front'}
              size={compact ? 64 : 92}
            />
          )}
        </div>
      </div>
    </div>
  );
};
