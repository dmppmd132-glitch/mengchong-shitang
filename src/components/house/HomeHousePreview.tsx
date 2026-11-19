import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Home, Sparkles } from 'lucide-react';
import {
  FLOORING_BY_ID,
  ROOM_GRID_COLS,
  ROOM_GRID_ROWS,
  ROOM_ITEM_BY_ID,
  ROOM_ZONES,
  WALLPAPER_BY_ID,
  getZoneForCell,
} from '../../data/house';
import { Pet, PlacedRoomItem, SharedHouse } from '../../types';
import {
  HousePetCoordinates,
  HousePetInteractionTarget,
  getHouseEntryCoordinates,
  getHouseFurnitureReactionType,
  selectRandomHouseInteraction,
} from '../../utils/house';
import { PiggyCharacter } from '../PiggyCharacter';
import { FurnitureGraphic } from './FurnitureGraphic';
import { HouseSubTab } from './HouseView';

interface HomeHousePreviewProps {
  pet: Pet;
  house: SharedHouse;
  onOpenHouse: (tab?: HouseSubTab) => void;
}

type InteractionPhase = 'idle' | 'entering' | 'approaching' | 'interacting';

export const HomeHousePreview: React.FC<HomeHousePreviewProps> = ({
  pet,
  house,
  onOpenHouse,
}) => {
  const entryCoords = useMemo(
    () => getHouseEntryCoordinates(house.roomLayout.cols, house.roomLayout.rows),
    [house.roomLayout.cols, house.roomLayout.rows]
  );

  const [target, setTarget] = useState<HousePetInteractionTarget | null>(null);
  const [phase, setPhase] = useState<InteractionPhase>('idle');
  const [petCoords, setPetCoords] = useState<HousePetCoordinates>(entryCoords);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);
  const [customHint, setCustomHint] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const arriveTimerRef = useRef<number | null>(null);
  const targetRef = useRef<HousePetInteractionTarget | null>(null);
  const petCoordsRef = useRef<HousePetCoordinates>(entryCoords);

  targetRef.current = target;
  petCoordsRef.current = petCoords;

  const clearTimers = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (arriveTimerRef.current !== null) {
      window.clearTimeout(arriveTimerRef.current);
      arriveTimerRef.current = null;
    }
  }, []);

  const placedSignature = useMemo(
    () =>
      house.roomLayout.placedItems
        .map((p) => `${p.instanceId}:${p.itemId}:${p.x},${p.y}`)
        .join('|'),
    [house.roomLayout.placedItems]
  );

  const placedCellMap = useMemo(() => {
    const map = new Map<string, PlacedRoomItem>();
    for (const item of house.roomLayout.placedItems) {
      map.set(`${item.x}_${item.y}`, item);
    }
    return map;
  }, [house.roomLayout.placedItems]);

  const startInteraction = useCallback(
    (options?: { fromDoorway?: boolean; preferredInstanceId?: string; excludeInstanceId?: string }) => {
      clearTimers();
      setCustomHint(null);

      const nextTarget = selectRandomHouseInteraction(house, {
        preferredInstanceId: options?.preferredInstanceId,
        excludeInstanceId: options?.excludeInstanceId,
        species: pet.species,
      });

      if (!nextTarget) {
        setTarget(null);
        setPhase('idle');
        setFacingLeft(false);
        setPetCoords({ cellX: 2.5, cellY: 1.5, xPercent: 50, yPercent: 54 });
        return;
      }

      const startCoords = options?.fromDoorway
        ? nextTarget.entryCoordinates
        : petCoordsRef.current;

      setTarget(nextTarget);
      setPhase('entering');
      setPetCoords(startCoords);
      setFacingLeft(nextTarget.targetCoordinates.xPercent < startCoords.xPercent);

      // 下一幀切換為目標座標，觸發 CSS transition 靠近家具動畫
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = window.requestAnimationFrame(() => {
          setPhase('approaching');
          setPetCoords(nextTarget.targetCoordinates);
        });
      });

      arriveTimerRef.current = window.setTimeout(() => {
        setPhase('interacting');
        setFacingLeft(false);
      }, 1080);
    },
    [clearTimers, house, pet.species]
  );

  // 進入首頁小屋區塊或家具變動時，觸發寵物進屋並走向隨機床／玩具
  useEffect(() => {
    startInteraction({ fromDoorway: true });
    return () => clearTimers();
  }, [placedSignature, startInteraction, clearTimers]);

  // 若屋內有多個床或玩具，定時在家具間漫步互動
  useEffect(() => {
    const interactiveCount = house.roomLayout.placedItems.filter((p) => {
      const def = ROOM_ITEM_BY_ID[p.itemId];
      return def ? getHouseFurnitureReactionType(def, pet.species) !== null : false;
    }).length;

    if (interactiveCount <= 1) return;

    const timer = window.setInterval(() => {
      startInteraction({
        fromDoorway: false,
        excludeInstanceId: targetRef.current?.placedItem.instanceId,
      });
    }, 9500);

    return () => window.clearInterval(timer);
  }, [house.roomLayout.placedItems, pet.species, startInteraction]);

  const wallDef = WALLPAPER_BY_ID[house.roomLayout.wallpaperId] ?? WALLPAPER_BY_ID.cream_warm;
  const floorDef = FLOORING_BY_ID[house.roomLayout.flooringId] ?? FLOORING_BY_ID.oak_wood;

  const hasClaimableMilestone = house.achievedMilestones.some(
    (id) => !house.claimedMilestones.includes(id)
  );

  const isApproaching = phase === 'approaching';
  const isInteracting = phase === 'interacting' && target !== null;

  const currentPetAction = isApproaching
    ? 'walking'
    : isInteracting
    ? target.petAction
    : 'idle';

  const currentPetExpression = isApproaching
    ? 'sparkle'
    : isInteracting
    ? target.expression
    : 'normal';

  const petAnimWrapperClass = isApproaching
    ? 'animate-house-pet-walk'
    : isInteracting
    ? target.preferenceMatch === 'favorite'
      ? 'animate-house-pet-favorite'
      : target.reactionType === 'sleep'
      ? 'animate-house-pet-sleep'
      : 'animate-house-pet-play'
    : 'animate-house-pet-breathe';

  const statusText = customHint
    ? customHint
    : !target
    ? `放張「床」或「玩具」進小屋，${pet.name}就會自己過去睡覺或玩耍喔！`
    : isApproaching || phase === 'entering'
    ? `🐾 ${pet.name}${target.approachText}`
    : target.preferenceMatch === 'favorite'
    ? `✨ ${target.reactionText}`
    : target.reactionType === 'sleep'
    ? `💤 ${target.reactionText}`
    : `⚽ ${target.reactionText}`;

  const handleCellTap = (occupant: PlacedRoomItem | null) => {
    if (!occupant) {
      onOpenHouse('room');
      return;
    }
    const itemDef = ROOM_ITEM_BY_ID[occupant.itemId];
    if (!itemDef) return;
    const reaction = getHouseFurnitureReactionType(itemDef, pet.species);
    if (reaction) {
      startInteraction({ fromDoorway: false, preferredInstanceId: occupant.instanceId });
    } else {
      setCustomHint(
        `「${itemDef.name}」是${ROOM_ZONES[itemDef.zone].name}家具，點床或玩具看牠互動吧！`
      );
    }
  };

  return (
    <section
      className="rounded-3xl bg-gradient-to-b from-[#FFFDF8] to-[#FFF5F8] border-2 border-[#F3CBD9] p-3 space-y-2.5 shadow-xs"
      aria-label="首頁萌寵小屋互動區"
    >
      {/* Top Action Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenHouse('room')}
          className="flex items-center gap-2.5 min-w-0 text-left flex-1 group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FFEAF0] text-[#D64470] flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-[#4A3531] truncate">
                {house.houseName}
              </span>
              {hasClaimableMilestone && (
                <span className="px-1.5 py-0.5 rounded-lg bg-[#FF7A9E] text-white text-[10px] font-extrabold shrink-0">
                  有獎勵
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#7D635D] truncate tabular-nums">
              已放 {house.roomLayout.placedItems.length} 件家具 · 金庫 {house.treasuryCoins} 幣
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {target && (
            <button
              type="button"
              onClick={() =>
                startInteraction({
                  fromDoorway: true,
                  excludeInstanceId: target.placedItem.instanceId,
                })
              }
              title="讓寵物重新進屋隨機互動"
              className="min-h-[36px] px-2.5 rounded-xl bg-[#EEF8F4] border border-[#B2E3CF] text-[#1F6B54] text-[11px] font-extrabold inline-flex items-center gap-1 hover:bg-[#DFF3EA] active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>進小屋</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenHouse('room')}
            className="min-h-[36px] px-2.5 rounded-xl bg-[#FFEAF0] border border-[#F4C4D4] text-[#B83B64] text-[11px] font-extrabold hover:bg-[#FFDDE7] active:scale-95 transition"
          >
            佈置
          </button>

          <button
            type="button"
            onClick={() => onOpenHouse('photo')}
            aria-label="小屋拍照模式"
            title="小屋拍照模式"
            className="min-h-[36px] min-w-[36px] rounded-xl bg-[#FFF6DF] border border-[#F2D59B] text-[#9D5B12] flex items-center justify-center hover:bg-[#FFEDC6] active:scale-95 transition"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Cozy 2D Room Stage */}
      <div className="rounded-2xl border border-[#EAD4CB] overflow-hidden bg-[#FFF9F2]">
        {/* Wallpaper + Wooden Baseboard + Pet Reaction Bubble */}
        <div
          className="relative px-2.5 pt-2 pb-3 border-b-2 border-[#9C6F45] flex items-center justify-between gap-2"
          style={{ background: wallDef.wallBgStyle }}
        >
          <p className="flex-1 min-w-0 rounded-xl bg-white/90 border border-[#F1D5DF] px-2.5 py-1 text-[11px] font-extrabold text-[#4A3531] leading-snug truncate">
            {statusText}
          </p>
          {isInteracting && (
            <div className="flex items-center gap-1 shrink-0">
              {target.preferenceMatch === 'favorite' && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#FFEAF2] text-[#D64470] border border-[#F5B4CA]">
                  ♥ 最愛！
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                  target.reactionType === 'sleep'
                    ? 'bg-[#EDE7FA] text-[#5C459E] border-[#CFC3F2]'
                    : 'bg-[#E6F8F0] text-[#1F6B54] border-[#B2E3CF]'
                }`}
              >
                {target.reactionType === 'sleep' ? '💤 睡覺中' : '⚽ 玩耍中'}
              </span>
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2"
            style={{
              background: 'linear-gradient(180deg, #E2BD95 0%, #CFA275 65%, #BA8B5E 100%)',
            }}
          />
        </div>

        {/* 6x4 Cozy Floor + Plush Rug + CSS-animated Pet */}
        <div
          className="relative p-1.5 overflow-hidden"
          style={{ background: floorDef.floorBgStyle }}
        >
          {/* Subtle Oak Plank Lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(180deg, rgba(130,86,48,0) 0px, rgba(130,86,48,0) 18px, rgba(130,86,48,0.28) 19px, rgba(130,86,48,0) 20px)',
            }}
          />

          {/* Centered Round Plush Rug */}
          <div
            className="pointer-events-none absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[54%] max-w-[180px] h-[56%]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 220 120" className="w-full h-full opacity-90">
              <ellipse cx="110" cy="62" rx="100" ry="48" fill="#FFE9F0" stroke="#F4C7D6" strokeWidth="3" strokeDasharray="6 4" />
              <ellipse cx="110" cy="60" rx="84" ry="39" fill="#FFF7EE" />
            </svg>
          </div>

          {/* Starter Ambient Corner Plant & Box if Empty */}
          {house.roomLayout.placedItems.length === 0 && (
            <>
              <div className="pointer-events-none absolute left-2 top-1.5 opacity-95" aria-hidden="true">
                <svg width="32" height="34" viewBox="0 0 52 56" fill="none">
                  <path d="M16 33H36L33 50H19L16 33Z" fill="#DF8E66" stroke="#B66843" strokeWidth="2" />
                  <rect x="14" y="29" width="24" height="5" rx="2.5" fill="#EA9F78" stroke="#B66843" strokeWidth="1.8" />
                  <path d="M26 29C26 21 20 14 14 14C14 21 18 26 26 29Z" fill="#77C88E" stroke="#4D9B64" strokeWidth="1.8" />
                  <path d="M26 29C26 20 32 13 38 14C38 21 33 26 26 29Z" fill="#63B87B" stroke="#4D9B64" strokeWidth="1.8" />
                </svg>
              </div>
              <div className="pointer-events-none absolute right-2 top-1.5 opacity-95" aria-hidden="true">
                <svg width="34" height="32" viewBox="0 0 56 52" fill="none">
                  <rect x="10" y="20" width="36" height="26" rx="3" fill="#E3BA8D" stroke="#AD7E52" strokeWidth="2" />
                  <path d="M10 20L17 12H40L46 20H10Z" fill="#EECCA3" stroke="#AD7E52" strokeWidth="1.8" />
                  <path d="M28 38C25.5 36.2 24 34.4 24 32.8C24 31.6 25 30.8 26.2 30.8C27 30.8 27.6 31.2 28 31.9C28.4 31.2 29 30.8 29.8 30.8C31 30.8 32 31.6 32 32.8C32 34.4 30.5 36.2 28 38Z" fill="#FF7A9E" />
                </svg>
              </div>
            </>
          )}

          <div className="relative z-10 grid grid-cols-6 gap-1">
            {Array.from({ length: ROOM_GRID_ROWS * ROOM_GRID_COLS }, (_, idx) => {
              const x = idx % ROOM_GRID_COLS;
              const y = Math.floor(idx / ROOM_GRID_COLS);
              const zone = getZoneForCell(x, y);
              const zoneMeta = ROOM_ZONES[zone];
              const occupant = placedCellMap.get(`${x}_${y}`) ?? null;
              const itemDef = occupant ? ROOM_ITEM_BY_ID[occupant.itemId] : null;
              const isTargetCell =
                target !== null &&
                target.placedItem.instanceId === occupant?.instanceId;
              const cellReactionClass =
                isTargetCell && isInteracting
                  ? target.reactionType === 'sleep'
                    ? 'animate-house-furniture-sleep bg-[#F3EEFF]/80 border-[#B3A4E8]'
                    : 'bg-[#E9FAF2]/80 border-[#5CC9A7]'
                  : isTargetCell && isApproaching
                  ? 'border-[#FF8AA8] bg-white/60'
                  : occupant
                  ? 'border-transparent hover:bg-white/30'
                  : 'border-transparent bg-transparent';

              return (
                <button
                  key={`${x}_${y}`}
                  type="button"
                  onClick={() => handleCellTap(occupant)}
                  title={itemDef ? `${itemDef.name}` : `${zoneMeta.name}（點擊佈置）`}
                  aria-label={
                    itemDef ? `與${itemDef.name}互動` : `前往佈置${zoneMeta.name}`
                  }
                  className={`relative h-9 rounded-lg border flex items-center justify-center transition ${cellReactionClass}`}
                >
                  {occupant && itemDef ? (
                    <div
                      className={`drop-shadow-[0_2px_2px_rgba(74,53,49,0.2)] ${
                        isTargetCell && isInteracting && target.reactionType === 'play'
                          ? target.preferenceMatch === 'favorite' || itemDef.category === 'toy'
                            ? 'animate-house-toy-bounce'
                            : 'animate-house-furniture-play'
                          : ''
                      }`}
                    >
                      <FurnitureGraphic itemId={itemDef.id} size={26} />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Moving & Interacting Pet Layer */}
          <div
            className="pointer-events-none absolute inset-1.5 z-20"
            aria-hidden="true"
          >
            <div
              className="house-pet-mover absolute z-10"
              style={{
                left: `${petCoords.xPercent}%`,
                top: `${petCoords.yPercent}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Floating Reaction Particles */}
              {isInteracting && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
                  <span className="text-xs animate-house-zzz">
                    {target.reactionType === 'sleep' ? '💤' : '🩷'}
                  </span>
                  <span
                    className="text-[11px] animate-house-zzz"
                    style={{ animationDelay: '0.55s' }}
                  >
                    {target.reactionType === 'sleep' ? '🌙' : '🎵'}
                  </span>
                </div>
              )}

              <div
                style={{
                  transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
                  transition: 'transform 0.22s ease',
                }}
              >
                <div className={petAnimWrapperClass}>
                  <PiggyCharacter
                    species={pet.species}
                    growth={pet.growth}
                    roundness={pet.roundness}
                    action={currentPetAction}
                    expression={currentPetExpression}
                    equipped={pet.accessories}
                    interactive={false}
                    size={46}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
