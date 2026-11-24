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
  companionPets?: Pet[];
  house: SharedHouse;
  onOpenHouse: (tab?: HouseSubTab) => void;
}

type InteractionPhase = 'idle' | 'entering' | 'approaching' | 'interacting';

export const HomeHousePreview: React.FC<HomeHousePreviewProps> = ({
  pet,
  companionPets = [],
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
        {/* Wallpaper + Pastel Bunting + Wooden Baseboard + Pet Reaction Bubble */}
        <div
          className="relative px-2.5 pt-3.5 pb-3 border-b-2 border-[#9C6F45] flex items-center justify-between gap-2 overflow-hidden"
          style={{ background: wallDef.wallBgStyle }}
        >
          {/* Delicate Top Macaron Bunting */}
          <svg
            viewBox="0 0 360 14"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 w-full h-3.5"
            aria-hidden="true"
          >
            <path d="M0 2Q90 7 180 2.5Q270 7 360 2" fill="none" stroke="#8C624D" strokeWidth="1.2" />
            {[
              { x: 14, c: '#FFB3C7' },
              { x: 38, c: '#FFE596' },
              { x: 62, c: '#B6E1FF' },
              { x: 86, c: '#DEC8FF' },
              { x: 110, c: '#FFB3C7' },
              { x: 134, c: '#FFE596' },
              { x: 158, c: '#B6E1FF' },
              { x: 184, c: '#DEC8FF' },
              { x: 208, c: '#FFB3C7' },
              { x: 232, c: '#FFE596' },
              { x: 256, c: '#B6E1FF' },
              { x: 280, c: '#DEC8FF' },
              { x: 304, c: '#FFB3C7' },
              { x: 328, c: '#FFE596' },
            ].map((b, i) => (
              <polygon
                key={i}
                points={`${b.x},3 ${b.x + 16},4 ${b.x + 8},12`}
                fill={b.c}
                stroke="#8C624D"
                strokeWidth="0.9"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <p className="relative z-10 flex-1 min-w-0 rounded-xl bg-white/90 border border-[#F1D5DF] px-2.5 py-1 text-[11px] font-extrabold text-[#4A3531] leading-snug truncate">
            {statusText}
          </p>
          {isInteracting && (
            <div className="relative z-10 flex items-center gap-1 shrink-0">
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

        {/* 6x4 Cozy Floor + Wavy Cocoa Grain + Lace Rug & Props + CSS-animated Pet */}
        <div
          className="relative p-1.5 overflow-hidden"
          style={{ background: floorDef.floorBgStyle }}
        >
          {/* Subtle Oak Plank Lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(180deg, rgba(122,82,56,0) 0px, rgba(122,82,56,0) 18px, rgba(122,82,56,0.28) 19px, rgba(122,82,56,0) 20px)',
            }}
          />
          {/* Hand-drawn Wavy Cocoa Wood Grain */}
          <svg
            viewBox="0 0 360 150"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.22]"
            aria-hidden="true"
          >
            <g fill="none" stroke="#7A5238" strokeWidth="1.2" strokeLinecap="round">
              <path d="M12 16C48 11 90 21 132 15" />
              <path d="M168 17C214 12 262 22 316 16" />
              <path d="M36 48C86 42 136 53 188 47" />
              <path d="M220 49C268 43 312 53 348 48" />
              <path d="M16 82C62 77 108 87 154 81" />
              <path d="M192 83C242 77 294 88 344 82" />
              <path d="M32 116C84 110 138 121 190 115" />
              <path d="M222 118C268 112 310 121 348 117" />
            </g>
          </svg>

          {/* Centered Pink Lace Round Rug + Bowl & Wind-up Mouse */}
          <div
            className="pointer-events-none absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[74%] max-w-[240px] h-[58%] flex items-center justify-center"
            aria-hidden="true"
          >
            <svg width="26" height="20" viewBox="0 0 42 32" fill="none" className="absolute left-0 bottom-[16%]">
              <ellipse cx="21" cy="12" rx="12.5" ry="4.5" fill="#FFE8B8" stroke="#7A5238" strokeWidth="1.6" />
              <path d="M7 12C7 15.2 13.3 17.5 21 17.5C28.7 17.5 35 15.2 35 12L37 22.5C37 25.5 29.8 27.5 21 27.5C12.2 27.5 5 25.5 5 22.5L7 12Z" fill="#FFA9C4" stroke="#7A5238" strokeWidth="1.8" />
              <ellipse cx="21" cy="23" rx="2.6" ry="2" fill="#FFF8FA" />
            </svg>

            <svg viewBox="0 0 240 132" className="w-[74%] max-w-[180px] h-full opacity-95">
              <ellipse cx="120" cy="67" rx="110" ry="54" fill="#FFE6EF" stroke="#F5B9CD" strokeWidth="6" strokeDasharray="2 9" strokeLinecap="round" />
              <ellipse cx="120" cy="67" rx="104" ry="49" fill="#FFEAF1" stroke="#F2B4C8" strokeWidth="2.2" />
              <ellipse cx="120" cy="66" rx="86" ry="39" fill="#FFF8F0" />
            </svg>

            <svg width="28" height="20" viewBox="0 0 44 32" fill="none" className="absolute right-0 bottom-[18%]">
              <line x1="22" y1="8" x2="22" y2="13" stroke="#C68E3E" strokeWidth="2" />
              <circle cx="19.5" cy="6.5" r="2.7" fill="none" stroke="#E2AC4C" strokeWidth="1.8" />
              <circle cx="24.5" cy="6.5" r="2.7" fill="none" stroke="#E2AC4C" strokeWidth="1.8" />
              <path d="M9 22C9 16 14 12.5 21.5 12.5C28 12.5 32.5 16.5 32.5 21.5C32.5 24.2 28.5 25.5 21 25.5C13.5 25.5 9 24.5 9 22Z" fill="#E0D8EE" stroke="#7A5238" strokeWidth="1.6" />
              <circle cx="16.5" cy="13" r="3.4" fill="#FFB5CA" stroke="#7A5238" strokeWidth="1.4" />
              <circle cx="8.6" cy="20.6" r="1.6" fill="#FF7AA2" />
            </svg>
          </div>

          {/* Starter Cat-Face Flower Pot & Bunny-in-Box if Empty */}
          {house.roomLayout.placedItems.length === 0 && (
            <>
              <div className="pointer-events-none absolute left-2 top-1 opacity-95" aria-hidden="true">
                <svg width="34" height="36" viewBox="0 0 58 62" fill="none">
                  <path d="M29 31C23 24 16 23 13 26C16 30 22 32 29 31Z" fill="#77C88E" stroke="#4D8F68" strokeWidth="1.6" />
                  <path d="M29 31C35 24 42 23 45 26C42 30 36 32 29 31Z" fill="#63B87B" stroke="#4D8F68" strokeWidth="1.6" />
                  <circle cx="29" cy="13" r="4.5" fill="#FF98B8" />
                  <circle cx="29" cy="13" r="2" fill="#FFE37A" />
                  <circle cx="18" cy="18" r="3.6" fill="#FFB0C9" />
                  <circle cx="40" cy="18" r="3.6" fill="#FFB0C9" />
                  <path d="M16 32L18 25L24 31Z" fill="#FFFDF9" stroke="#7A5238" strokeWidth="1.8" />
                  <path d="M42 32L40 25L34 31Z" fill="#FFFDF9" stroke="#7A5238" strokeWidth="1.8" />
                  <path d="M15 32C15 30.5 16.5 30 29 30C41.5 30 43 30.5 43 32L40 53C39.6 55 36 56 29 56C22 56 18.4 55 18 53L15 32Z" fill="#FFFDF9" stroke="#7A5238" strokeWidth="1.8" />
                  <circle cx="23.5" cy="40.5" r="1.7" fill="#6B4732" />
                  <circle cx="34.5" cy="40.5" r="1.7" fill="#6B4732" />
                  <path d="M26.8 43.2Q28 45 29 43.5Q30 45 31.2 43.2" fill="none" stroke="#6B4732" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="pointer-events-none absolute right-2 top-0.5 opacity-95" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 64 62" fill="none">
                  <ellipse cx="25" cy="14" rx="4.2" ry="9.5" transform="rotate(-14 25 14)" fill="#FFF9F2" stroke="#7A5238" strokeWidth="1.8" />
                  <ellipse cx="39" cy="14" rx="4.2" ry="9.5" transform="rotate(14 39 14)" fill="#FFF9F2" stroke="#7A5238" strokeWidth="1.8" />
                  <ellipse cx="32" cy="24" rx="10.5" ry="9" fill="#FFF9F2" stroke="#7A5238" strokeWidth="1.8" />
                  <circle cx="28" cy="23.2" r="1.5" fill="#6B4732" />
                  <circle cx="36" cy="23.2" r="1.5" fill="#6B4732" />
                  <rect x="12" y="28" width="40" height="27" rx="3" fill="#E3BA8D" stroke="#7A5238" strokeWidth="1.9" />
                  <ellipse cx="32" cy="45.8" rx="3" ry="2.3" fill="#FF8EB0" />
                  <circle cx="28.7" cy="42.4" r="1.3" fill="#FF8EB0" />
                  <circle cx="32" cy="41.4" r="1.3" fill="#FF8EB0" />
                  <circle cx="35.3" cy="42.4" r="1.3" fill="#FF8EB0" />
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
            {companionPets.slice(0, 2).map((comp, idx) => (
              <div
                key={comp.id}
                className="absolute animate-house-pet-breathe opacity-95"
                style={{
                  left: idx === 0 ? '20%' : '80%',
                  top: idx === 0 ? '70%' : '68%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <PiggyCharacter
                  species={comp.species}
                  growth={comp.growth}
                  roundness={comp.roundness}
                  action="idle"
                  expression="normal"
                  equipped={comp.accessories}
                  interactive={false}
                  size={34}
                />
              </div>
            ))}

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
