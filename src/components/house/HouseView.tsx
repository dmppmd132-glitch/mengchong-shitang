import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRightLeft,
  BookOpen,
  Camera,
  Check,
  Coins,
  Hammer,
  HeartHandshake,
  Home,
  LayoutGrid,
  Lock,
  MessageCircleHeart,
  Move,
  Package,
  Pencil,
  PiggyBank,
  Send,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Trees,
  Trophy,
  Wand2,
  X,
} from 'lucide-react';
import {
  FARM_DECORATIONS,
  FARM_PLOT_EXPANSION_COSTS,
  FARM_UPGRADES,
  FLOORING_BY_ID,
  FLOORINGS,
  FURNITURE_CATEGORY_LABELS,
  ROOM_GRID_COLS,
  ROOM_GRID_ROWS,
  ROOM_ITEMS,
  ROOM_ITEM_BY_ID,
  ROOM_PHOTO_POSES,
  ROOM_ZONES,
  SHARED_GOALS,
  SHARED_GOAL_BY_ID,
  SHARED_MILESTONES,
  THEME_SETS,
  WALLPAPER_BY_ID,
  WALLPAPERS,
  getZoneForCell,
} from '../../data/house';
import { INGREDIENTS } from '../../data/kitchen';
import { PHOTO_STICKERS } from '../../data/photoStudio';
import {
  CropPlot,
  FarmDecorationId,
  FarmUpgradeId,
  FlooringId,
  GameState,
  IngredientId,
  PetExpression,
  PhotoStickerId,
  PiggyActionState,
  PlacedRoomItem,
  RoomPhotoPoseId,
  RoomPhotoRecord,
  RoomZone,
  SharedGoalId,
  SharedMilestoneId,
  SharedPetRoom,
  ThemeSetId,
  WallpaperId,
} from '../../types';
import {
  HouseActionOutcome,
  PaymentSource,
  addFurnitureNote,
  applyThemeRoomLayout,
  autoArrangeStowedFurniture,
  buyFurnitureItem,
  buyOrApplyFlooring,
  buyOrApplyWallpaper,
  buyThemeSetBundle,
  claimSharedMilestoneReward,
  completeActiveSharedGoal,
  craftFurnitureItem,
  depositToSharedTreasury,
  getHouseEncyclopediaCounts,
  getHouseSummaryStats,
  getStowedCountByItem,
  placeFurnitureItem,
  saveRoomSnapshotPhoto,
  selectActiveSharedGoal,
  sellFurnitureItem,
  stowAllFurniture,
  stowFurnitureItem,
  swapOrMoveFurnitureItem,
  updateHouseName,
} from '../../utils/house';
import { evaluateItemPreference } from '../../utils/personality';
import { ShareCardPayload } from '../../utils/shareCardCanvas';
import { soundFX, triggerHaptic } from '../../utils/sound';
import { PiggyCharacter } from '../PiggyCharacter';
import { FarmSceneBanner } from './FarmSceneBanner';
import { FurnitureGraphic } from './FurnitureGraphic';
import { RoomPhotoCard } from './RoomPhotoCard';

export type HouseSubTab = 'room' | 'yard' | 'shop' | 'coop' | 'photo';

type ShopFilter =
  | 'all'
  | 'toy'
  | RoomZone
  | 'surfaces'
  | 'themes'
  | 'craft';

interface HouseViewProps {
  game: GameState;
  farmPlots: CropPlot[];
  sharedRoom: SharedPetRoom | null;
  currentUserId: string | null;
  actorName: string;
  initialTab?: HouseSubTab;
  onUpdateGame: (updater: (prev: GameState) => GameState) => void;
  onExpandFarmPlot: (paySource: PaymentSource) => void;
  onUpgradeFarmFacility: (upgradeId: FarmUpgradeId, paySource: PaymentSource) => void;
  onToggleFarmDecoration: (decorId: FarmDecorationId, paySource: PaymentSource) => void;
  onOpenSharedPet: () => void;
  onOpenCoopGames?: () => void;
  onOpenHouseEncyclopedia: () => void;
  onGoToFarm: () => void;
  onSharePhotoToBoard: (photo: RoomPhotoRecord, caption: string) => Promise<string | null>;
  onTogglePhotoLike: (photoId: string) => void;
  onAddPhotoComment: (photoId: string, content: string) => void;
  onOpenShareCard: (payload: ShareCardPayload) => void;
}

const QUICK_NOTE_PRESETS = [
  '這張床是你喜歡的粉紅色！',
  '這個角落佈置起來好溫馨～',
  '下次一起存錢買雲朵大床吧！',
];

const ZONE_ORDER: RoomZone[] = ['sleep', 'decor', 'play', 'dining'];

export const HouseView: React.FC<HouseViewProps> = ({
  game,
  farmPlots,
  sharedRoom,
  currentUserId,
  actorName,
  initialTab = 'room',
  onUpdateGame,
  onExpandFarmPlot,
  onUpgradeFarmFacility,
  onToggleFarmDecoration,
  onOpenSharedPet,
  onOpenCoopGames,
  onOpenHouseEncyclopedia,
  onGoToFarm,
  onSharePhotoToBoard,
  onTogglePhotoLike,
  onAddPhotoComment,
  onOpenShareCard,
}) => {
  const [tab, setTab] = useState<HouseSubTab>(initialTab);
  const [shopFilter, setShopFilter] = useState<ShopFilter>('all');
  const [stowedZoneFilter, setStowedZoneFilter] = useState<'all' | RoomZone>('all');
  const [paySource, setPaySource] = useState<PaymentSource>('personal');
  const [notice, setNotice] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Room editing states
  const [decorateMode, setDecorateMode] = useState<boolean>(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [placingItemId, setPlacingItemId] = useState<string | null>(null);
  const [movingInstanceId, setMovingInstanceId] = useState<string | null>(null);
  const [draggingStowedId, setDraggingStowedId] = useState<string | null>(null);
  const [draggingInstanceId, setDraggingInstanceId] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ x: number; y: number } | null>(null);
  const [quickPlaceCell, setQuickPlaceCell] = useState<{ x: number; y: number } | null>(null);
  const [confirmStowAll, setConfirmStowAll] = useState<boolean>(false);

  // Live pet interaction inside room (smooth floor-layer movement + breathing + mood bubbles)
  const [petCoords, setPetCoords] = useState<{ xPercent: number; yPercent: number }>({
    xPercent: 50,
    yPercent: 56,
  });
  const [petFacingLeft, setPetFacingLeft] = useState<boolean>(false);
  const [isPetMoving, setIsPetMoving] = useState<boolean>(false);
  const [petAction, setPetAction] = useState<PiggyActionState>('idle');
  const [petExpression, setPetExpression] = useState<PetExpression>('normal');
  const [petSpeech, setPetSpeech] = useState<string>('房間好溫暖！點「佈置模式」或讓我隨意散步吧～');
  const [ambientMoodBubble, setAmbientMoodBubble] = useState<{
    key: number;
    emoji: '🩷' | '🎵';
  } | null>(null);

  const petCoordsRef = useRef(petCoords);
  petCoordsRef.current = petCoords;
  const moveDoneTimerRef = useRef<number | null>(null);
  const bubbleHideTimerRef = useRef<number | null>(null);

  // House signboard editor
  const [editingHouseName, setEditingHouseName] = useState<boolean>(false);
  const [yardRenameOpen, setYardRenameOpen] = useState<boolean>(false);
  const [houseNameInput, setHouseNameInput] = useState<string>(game.house.houseName);

  // Furniture note input
  const [noteInput, setNoteInput] = useState<string>('');

  // Treasury deposit input
  const [customDepositInput, setCustomDepositInput] = useState<string>('100');

  // Photo studio states
  const [selectedPoseId, setSelectedPoseId] = useState<RoomPhotoPoseId>('normal');
  const [photoTitle, setPhotoTitle] = useState<string>(
    `${game.house.houseName}的幸福時刻`.slice(0, 20)
  );
  const [photoCaption, setPhotoCaption] = useState<string>(
    `跟 ${game.pet.name} 一起在親手佈置的小房間拍照留念！`
  );
  const [photoStickers, setPhotoStickers] = useState<PhotoStickerId[]>([]);
  const [sharingPhoto, setSharingPhoto] = useState<boolean>(false);

  const house = game.house;
  const wallDef = WALLPAPER_BY_ID[house.roomLayout.wallpaperId] ?? WALLPAPER_BY_ID.cream_warm;
  const floorDef = FLOORING_BY_ID[house.roomLayout.flooringId] ?? FLOORING_BY_ID.oak_wood;
  const encCounts = getHouseEncyclopediaCounts(house);
  const summaryStats = useMemo(
    () => getHouseSummaryStats(house, game.pet.species),
    [house, game.pet.species]
  );

  const showPlacementGrid =
    decorateMode ||
    Boolean(placingItemId) ||
    Boolean(movingInstanceId) ||
    Boolean(draggingStowedId) ||
    Boolean(draggingInstanceId);

  const movePetSmoothly = useCallback((nextXPercent: number, nextYPercent: number) => {
    const clampedX = Math.max(14, Math.min(86, nextXPercent));
    const clampedY = Math.max(22, Math.min(84, nextYPercent));
    const dx = clampedX - petCoordsRef.current.xPercent;
    if (Math.abs(dx) > 2) {
      setPetFacingLeft(dx < 0);
    }
    setIsPetMoving(true);
    setPetCoords({ xPercent: clampedX, yPercent: clampedY });
    if (moveDoneTimerRef.current !== null) {
      window.clearTimeout(moveDoneTimerRef.current);
    }
    moveDoneTimerRef.current = window.setTimeout(() => {
      setIsPetMoving(false);
    }, 1060);
  }, []);

  const movePetToCell = useCallback(
    (x: number, y: number) => {
      const xPercent = ((x + 0.5) / ROOM_GRID_COLS) * 100;
      const yPercent = ((y + 0.5) / ROOM_GRID_ROWS) * 100;
      movePetSmoothly(xPercent, yPercent);
    },
    [movePetSmoothly]
  );

  useEffect(() => {
    return () => {
      if (moveDoneTimerRef.current !== null) {
        window.clearTimeout(moveDoneTimerRef.current);
      }
      if (bubbleHideTimerRef.current !== null) {
        window.clearTimeout(bubbleHideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setHouseNameInput(game.house.houseName);
  }, [game.house.houseName]);

  // Automatic cozy pet wandering across the 2D floor & furniture
  useEffect(() => {
    if (tab !== 'room') return;

    const strollOnFloor = (speech: string) => {
      const targetX = 20 + Math.random() * 60;
      const targetY = 30 + Math.random() * 48;
      movePetSmoothly(targetX, targetY);
      setPetAction('idle');
      setPetExpression(Math.random() < 0.4 ? 'sparkle' : 'normal');
      setPetSpeech(speech);
    };

    const triggerRandomVisit = () => {
      const placed = house.roomLayout.placedItems;
      if (placed.length === 0) {
        const idleLines = [
          '在圓形地毯上踩踩踏踏，橡木地板好暖和～',
          '陽光從窗戶照進來囉！開「佈置模式」或「智慧擺放」放家具吧！',
          '角落的小盆栽綠油油的，好喜歡這個溫馨小房間！',
        ];
        strollOnFloor(idleLines[Math.floor(Math.random() * idleLines.length)]);
        return;
      }

      // 25% chance to take a relaxing stroll onto the floor/rug between furniture visits
      if (Math.random() < 0.25) {
        strollOnFloor(`${game.pet.name} 在毛絨地毯上悠閒散步中～`);
        return;
      }

      const priority = placed.filter((p) => {
        const def = ROOM_ITEM_BY_ID[p.itemId];
        return (
          def &&
          (def.category === 'bed' ||
            def.category === 'toy' ||
            def.category === 'toyBall' ||
            def.category === 'snackRack' ||
            def.category === 'diningTable' ||
            evaluateItemPreference(game.pet.species, def.id) === 'favorite')
        );
      });
      const favPool = priority.filter(
        (p) => evaluateItemPreference(game.pet.species, p.itemId) === 'favorite'
      );
      const basePool =
        favPool.length > 0 && Math.random() < 0.72
          ? favPool
          : priority.length > 0
          ? priority
          : placed;
      const chosen = basePool[Math.floor(Math.random() * basePool.length)];
      const itemDef = ROOM_ITEM_BY_ID[chosen.itemId];
      if (!itemDef) return;

      const match = evaluateItemPreference(game.pet.species, itemDef.id);
      movePetToCell(chosen.x, chosen.y);
      setPetAction(itemDef.petAction);
      setPetExpression(
        match === 'favorite'
          ? 'sparkle'
          : itemDef.petAction === 'sleeping'
          ? 'shy'
          : 'sparkle'
      );
      setPetSpeech(
        match === 'favorite'
          ? `最愛這個！${itemDef.petReactionText}`
          : itemDef.petReactionText
      );
    };

    const initialTimer = window.setTimeout(triggerRandomVisit, 600);
    const timer = window.setInterval(triggerRandomVisit, 5200);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [
    tab,
    house.roomLayout.placedItems,
    game.pet.species,
    game.pet.name,
    movePetSmoothly,
    movePetToCell,
  ]);

  // Periodic heart / music note mood bubbles above pet
  useEffect(() => {
    if (tab !== 'room') return;

    const popBubble = () => {
      const emoji: '🩷' | '🎵' = Math.random() < 0.55 ? '🩷' : '🎵';
      setAmbientMoodBubble({ key: Date.now(), emoji });
      if (bubbleHideTimerRef.current !== null) {
        window.clearTimeout(bubbleHideTimerRef.current);
      }
      bubbleHideTimerRef.current = window.setTimeout(() => {
        setAmbientMoodBubble(null);
      }, 2400);
    };

    const firstPop = window.setTimeout(popBubble, 1500);
    const interval = window.setInterval(popBubble, 4200);
    return () => {
      window.clearTimeout(firstPop);
      window.clearInterval(interval);
    };
  }, [tab]);

  const placedCellMap = useMemo(() => {
    const map = new Map<string, PlacedRoomItem>();
    for (const p of house.roomLayout.placedItems) {
      map.set(`${p.x}_${p.y}`, p);
    }
    return map;
  }, [house.roomLayout.placedItems]);

  const stowedItems = useMemo(() => {
    return ROOM_ITEMS.filter((item) => getStowedCountByItem(house, item.id) > 0);
  }, [house]);

  const filteredStowedItems = useMemo(() => {
    if (stowedZoneFilter === 'all') return stowedItems;
    return stowedItems.filter((item) => item.zone === stowedZoneFilter);
  }, [stowedItems, stowedZoneFilter]);

  const selectedPlaced = useMemo(
    () => house.roomLayout.placedItems.find((p) => p.instanceId === selectedInstanceId) ?? null,
    [house.roomLayout.placedItems, selectedInstanceId]
  );

  const selectedItemDef = selectedPlaced ? ROOM_ITEM_BY_ID[selectedPlaced.itemId] ?? null : null;

  const roomPhotos = useMemo(
    () =>
      house.photos.filter(
        (p) => !p.photoKind || p.photoKind === 'room' || p.scene === 'room'
      ),
    [house.photos]
  );

  const showNotice = (msg?: string) => {
    setErrorMsg('');
    if (msg) setNotice(msg);
  };

  const showError = (msg?: string) => {
    if (msg) setErrorMsg(msg);
  };

  const runHouseAction = (fn: (state: GameState) => HouseActionOutcome): boolean => {
    const res = fn(game);
    if (!res.ok) {
      soundFX.miss(game.soundEnabled);
      showError(res.error);
      return false;
    }
    onUpdateGame(() => res.nextState);
    soundFX.pop(game.soundEnabled);
    triggerHaptic(12);
    showNotice(res.notice);
    return true;
  };

  const handlePlaceAt = (itemId: string, x: number, y: number) => {
    const res = placeFurnitureItem(game, itemId, x, y, actorName);
    setPlacingItemId(null);
    setDraggingStowedId(null);
    setDragOverCell(null);
    setQuickPlaceCell(null);
    if (res.ok) {
      onUpdateGame(() => res.nextState);
      const def = ROOM_ITEM_BY_ID[itemId];
      if (def) {
        movePetToCell(x, y);
        setPetAction(def.petAction);
        setPetExpression(def.petAction === 'sleeping' ? 'shy' : 'sparkle');
        setPetSpeech(def.petReactionText);
      }
      soundFX.heart(game.soundEnabled);
      triggerHaptic(14);
      showNotice(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
      showError(res.error);
    }
  };

  const handleMoveOrSwapTo = (instanceId: string, x: number, y: number) => {
    const res = swapOrMoveFurnitureItem(game, instanceId, x, y);
    setMovingInstanceId(null);
    setDraggingInstanceId(null);
    setDragOverCell(null);
    if (res.ok) {
      onUpdateGame(() => res.nextState);
      movePetToCell(x, y);
      soundFX.pop(game.soundEnabled);
      triggerHaptic(12);
      showNotice(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
      showError(res.error);
    }
  };

  const handleStow = (instanceId: string) => {
    const res = stowFurnitureItem(game, instanceId);
    if (res.ok) {
      onUpdateGame(() => res.nextState);
      setSelectedInstanceId(null);
      setMovingInstanceId(null);
      soundFX.pop(game.soundEnabled);
      showNotice(res.notice);
    } else {
      showError(res.error);
    }
  };

  const handleSell = (itemId: string) => {
    const res = sellFurnitureItem(game, itemId);
    if (res.ok) {
      onUpdateGame(() => res.nextState);
      setSelectedInstanceId(null);
      soundFX.pop(game.soundEnabled);
      showNotice(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
      showError(res.error);
    }
  };

  const handleTryFurnitureWithPet = (placed: PlacedRoomItem) => {
    const def = ROOM_ITEM_BY_ID[placed.itemId];
    if (!def) return;
    const match = evaluateItemPreference(game.pet.species, def.id);
    movePetToCell(placed.x, placed.y);
    setPetAction(def.petAction);
    setPetExpression(match === 'favorite' ? 'sparkle' : 'happyTongue');
    setPetSpeech(
      match === 'favorite'
        ? `最喜歡「${def.name}」了！${def.petReactionText}`
        : def.petReactionText
    );
    soundFX.heart(game.soundEnabled);
    triggerHaptic(12);
  };

  const handleAutoArrange = () => {
    runHouseAction((state) => autoArrangeStowedFurniture(state, actorName));
  };

  const handleStowAll = () => {
    const ok = runHouseAction((state) => stowAllFurniture(state));
    if (ok) {
      setSelectedInstanceId(null);
      setMovingInstanceId(null);
      setPlacingItemId(null);
      setQuickPlaceCell(null);
      setConfirmStowAll(false);
    }
  };

  const handleBuyFurniture = (itemId: string) => {
    runHouseAction((state) => buyFurnitureItem(state, itemId, paySource));
  };

  const handleCraftFurniture = (itemId: string) => {
    runHouseAction((state) => craftFurnitureItem(state, itemId));
  };

  const handleWallpaperAction = (wallId: WallpaperId) => {
    runHouseAction((state) => buyOrApplyWallpaper(state, wallId, paySource));
  };

  const handleFlooringAction = (floorId: FlooringId) => {
    runHouseAction((state) => buyOrApplyFlooring(state, floorId, paySource));
  };

  const handleBuyTheme = (themeId: ThemeSetId) => {
    runHouseAction((state) => buyThemeSetBundle(state, themeId, paySource));
  };

  const handleApplyThemeLayout = (themeId: ThemeSetId) => {
    const ok = runHouseAction((state) => applyThemeRoomLayout(state, themeId, actorName));
    if (ok) {
      setTab('room');
    }
  };

  const handleAddFurnitureNote = (textToSave: string) => {
    if (!selectedPlaced) return;
    const res = addFurnitureNote(game, selectedPlaced.itemId, actorName, textToSave);
    if (res.ok) {
      onUpdateGame(() => res.nextState);
      setNoteInput('');
      soundFX.heart(game.soundEnabled);
      showNotice(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
      showError(res.error);
    }
  };

  const handleSaveHouseName = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateHouseName(game, houseNameInput);
    if (res.ok) {
      onUpdateGame(() => res.nextState);
      setEditingHouseName(false);
      setYardRenameOpen(false);
      soundFX.pop(game.soundEnabled);
      showNotice(res.notice);
    } else {
      soundFX.miss(game.soundEnabled);
      showError(res.error);
    }
  };

  const handleDepositTreasury = (amount: number) => {
    runHouseAction((state) => depositToSharedTreasury(state, amount, actorName));
  };

  const handleCompleteGoal = () => {
    runHouseAction((state) => completeActiveSharedGoal(state));
  };

  const handleSelectGoal = (goalId: SharedGoalId) => {
    onUpdateGame((prev) => selectActiveSharedGoal(prev, goalId));
    soundFX.pop(game.soundEnabled);
  };

  const handleClaimMilestone = (milestoneId: SharedMilestoneId) => {
    runHouseAction((state) => claimSharedMilestoneReward(state, milestoneId));
  };

  const handleCellClick = (x: number, y: number) => {
    const occupant = placedCellMap.get(`${x}_${y}`) ?? null;

    if (movingInstanceId) {
      if (occupant && occupant.instanceId === movingInstanceId) {
        setMovingInstanceId(null);
        return;
      }
      handleMoveOrSwapTo(movingInstanceId, x, y);
      return;
    }

    if (placingItemId) {
      if (occupant) {
        soundFX.miss(game.soundEnabled);
        showError('每格只能放置一個家具，請點空白格子擺放！');
        return;
      }
      handlePlaceAt(placingItemId, x, y);
      return;
    }

    if (occupant) {
      setQuickPlaceCell(null);
      setSelectedInstanceId(occupant.instanceId);
      handleTryFurnitureWithPet(occupant);
      return;
    }

    if (!decorateMode) {
      setSelectedInstanceId(null);
      setQuickPlaceCell(null);
      movePetToCell(x, y);
      setPetAction('idle');
      setPetExpression('sparkle');
      setPetSpeech(`${game.pet.name} 開心地走到這裡散步囉～`);
      soundFX.pop(game.soundEnabled);
      return;
    }

    setSelectedInstanceId(null);
    setQuickPlaceCell({ x, y });
    soundFX.pop(game.soundEnabled);
  };

  const handleSavePhoto = (alsoShare: boolean) => {
    const saved = saveRoomSnapshotPhoto(game, {
      title: photoTitle.slice(0, 20),
      caption: photoCaption,
      poseId: selectedPoseId,
      stickers: photoStickers,
    });
    onUpdateGame(() => saved.nextState);

    soundFX.levelUp(game.soundEnabled);
    triggerHaptic(18);

    if (alsoShare) {
      setSharingPhoto(true);
      void onSharePhotoToBoard(saved.photo, photoCaption).then((err) => {
        setSharingPhoto(false);
        if (err) {
          showError(err);
        } else {
          showNotice('已拍照並分享到留言板與照片牆！');
        }
      });
    } else {
      showNotice('已拍下小屋合照並儲存到照片牆！');
    }
  };

  const activeGoal = SHARED_GOAL_BY_ID[house.activeGoalId] ?? SHARED_GOALS[0];
  const goalPct = Math.min(100, Math.round((house.treasuryCoins / activeGoal.targetCoins) * 100));
  const isGoalDone = house.completedGoalIds.includes(activeGoal.id);

  const claimableMilestoneCount = house.achievedMilestones.filter(
    (id) => !house.claimedMilestones.includes(id)
  ).length;

  const filteredShopItems = ROOM_ITEMS.filter((item) => {
    if (shopFilter === 'all') return true;
    if (shopFilter === 'toy') return item.category === 'toy' || item.category === 'toyBall';
    if (shopFilter === 'craft') return Boolean(item.craftIngredients);
    if (
      shopFilter === 'sleep' ||
      shopFilter === 'play' ||
      shopFilter === 'dining' ||
      shopFilter === 'decor'
    ) {
      return item.zone === shopFilter;
    }
    return false;
  });

  const nextExpandPlotNumber = house.unlockedFarmPlots < 8 ? house.unlockedFarmPlots + 1 : null;
  const nextExpandCost = nextExpandPlotNumber
    ? FARM_PLOT_EXPANSION_COSTS[nextExpandPlotNumber] ?? 0
    : 0;
  const availableYardCoins = paySource === 'treasury' ? house.treasuryCoins : game.coins;

  const previewPhotoRecord: RoomPhotoRecord = {
    id: 'preview',
    title: photoTitle.slice(0, 20) || `${house.houseName}的幸福時刻`.slice(0, 20),
    caption: photoCaption,
    createdAt: Date.now(),
    houseName: house.houseName,
    species: game.pet.species,
    petName: game.pet.name,
    equipped: game.pet.accessories,
    poseId: selectedPoseId,
    wallpaperId: house.roomLayout.wallpaperId,
    flooringId: house.roomLayout.flooringId,
    placedItems: house.roomLayout.placedItems,
    noteHighlight: house.furnitureNotes[0]?.content,
    photoKind: 'room',
    scene: 'room',
    stickers: photoStickers,
    weightAtCapture: game.pet.weight,
  };

  return (
    <div className="px-4 pt-3 pb-24 space-y-3.5 overflow-x-hidden">
      {/* Standalone House Overview Card */}
      <section className="rounded-3xl bg-gradient-to-r from-[#FFEAF0] via-[#FFF6DA] to-[#E8F8F2] border-2 border-[#F3DFD7] p-3.5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          {!editingHouseName ? (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-[#D64470] shrink-0" />
                <h2 className="text-base font-extrabold text-[#4A3531] truncate">
                  {house.houseName}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setHouseNameInput(house.houseName);
                    setEditingHouseName(true);
                  }}
                  aria-label="修改小屋名稱"
                  className="min-h-[32px] min-w-[32px] rounded-xl bg-white/80 text-[#7A540E] inline-flex items-center justify-center hover:bg-white transition shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] font-bold text-[#7D635D] mt-0.5 tabular-nums">
                家具 {summaryStats.placedCount}/{summaryStats.maxCells} 格 · 寵愛 {summaryStats.favoritePlacedCount} 件 · 金庫 {house.treasuryCoins} 幣
                {sharedRoom ? ' · 共養同步中' : ''}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveHouseName} className="w-full flex items-center gap-1.5">
              <input
                type="text"
                maxLength={14}
                value={houseNameInput}
                onChange={(e) => setHouseNameInput(e.target.value)}
                placeholder="輸入小屋名稱（最多14字）"
                className="flex-1 min-w-0 min-h-[44px] rounded-xl bg-white border border-[#E5C9B0] px-3 text-sm font-bold text-[#4A3531] focus:outline-none focus:border-[#FF7A9E]"
              />
              <button
                type="submit"
                className="min-h-[44px] px-3 rounded-xl bg-[#5CC9A7] text-white text-xs font-extrabold shrink-0 whitespace-nowrap"
              >
                儲存
              </button>
              <button
                type="button"
                onClick={() => setEditingHouseName(false)}
                className="min-h-[44px] px-2.5 rounded-xl bg-white/90 text-[#6E544E] text-xs font-extrabold shrink-0 whitespace-nowrap"
              >
                取消
              </button>
            </form>
          )}

          {!editingHouseName && (
            <button
              type="button"
              onClick={onOpenHouseEncyclopedia}
              className="min-h-[44px] px-3 rounded-2xl bg-white/90 border border-[#EED9D0] text-xs font-extrabold text-[#256D57] inline-flex items-center gap-1.5 hover:bg-white transition shrink-0 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="tabular-nums">圖鑑 {encCounts.totalCollected}/{encCounts.totalItems}</span>
            </button>
          )}
        </div>

        {/* Four-Zone Coverage Cards with Micro Progress Bars */}
        <div className="grid grid-cols-4 gap-1.5">
          {ZONE_ORDER.map((z) => {
            const meta = ROOM_ZONES[z];
            const cnt = summaryStats.zoneCounts[z];
            const pct = Math.min(100, Math.round((cnt / 6) * 100));
            const barColor =
              z === 'sleep'
                ? 'bg-[#9A85DB]'
                : z === 'decor'
                ? 'bg-[#FF7A9E]'
                : z === 'play'
                ? 'bg-[#5CC9A7]'
                : 'bg-[#F0A847]';
            const isZoneFull = cnt >= 6;
            return (
              <button
                key={z}
                type="button"
                onClick={() => {
                  setStowedZoneFilter(z);
                  setDecorateMode(true);
                  setTab('room');
                }}
                className="min-h-[54px] rounded-2xl bg-white/90 border border-[#EFE0D7] px-2 py-1.5 flex flex-col justify-between gap-1 hover:bg-white transition active:scale-[0.98]"
              >
                <div className="w-full flex items-center justify-between gap-0.5">
                  <span className="text-[11px] font-extrabold text-[#4A3531] whitespace-nowrap">
                    {meta.emoji} {meta.name}
                  </span>
                </div>
                <div className="w-full space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-[#EFE3DC] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9.5px] font-extrabold tabular-nums">
                    <span className={isZoneFull ? 'text-[#1F6B54]' : cnt > 0 ? 'text-[#5A423C]' : 'text-[#9A857E]'}>
                      {isZoneFull ? '滿格 ✓' : cnt > 0 ? '佈置中' : '待佈置'}
                    </span>
                    <span className={cnt > 0 ? 'text-[#256D57]' : 'text-[#9A857E]'}>
                      {cnt}/6
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5 Section Sub-Navigation */}
      <nav
        aria-label="家園分區導覽"
        className="grid grid-cols-5 gap-1 bg-[#F2E5DE] p-1 rounded-2xl"
      >
        {(
          [
            { key: 'room', label: '佈置', icon: Home },
            { key: 'yard', label: '庭院', icon: Trees },
            { key: 'shop', label: '工坊', icon: ShoppingBag },
            { key: 'coop', label: '金庫', icon: PiggyBank },
            { key: 'photo', label: '寫真', icon: Camera },
          ] as {
            key: HouseSubTab;
            label: string;
            icon: React.ComponentType<{ className?: string }>;
          }[]
        ).map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`relative min-h-[44px] rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center gap-0.5 transition whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-white text-[#D64470] shadow-xs'
                  : 'text-[#6E544E] hover:text-[#4A3531]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {key === 'coop' && claimableMilestoneCount > 0 && (
                <span className="absolute top-1 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D64470] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                  {claimableMilestoneCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Feedback Banners */}
      {errorMsg && (
        <div className="rounded-2xl bg-[#FFE9EF] border border-[#F5B4C6] px-3 py-2 text-xs font-extrabold text-[#B83B64] flex items-center justify-between gap-2">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            aria-label="關閉錯誤提示"
            className="min-h-[32px] min-w-[32px] flex items-center justify-center text-xs font-extrabold"
          >
            ✕
          </button>
        </div>
      )}

      {notice && (
        <div className="rounded-2xl bg-[#E5F8F0] border border-[#AEE3D0] px-3 py-2 text-xs font-extrabold text-[#1F6B54] flex items-center justify-between gap-2">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="關閉成功提示"
            className="min-h-[32px] min-w-[32px] flex items-center justify-center text-xs font-extrabold"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: ROOM DECORATION STUDIO */}
      {tab === 'room' && (
        <div className="space-y-3.5">
          {/* 3D Candy Smart Toolbar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !decorateMode;
                setDecorateMode(next);
                if (!next) {
                  setPlacingItemId(null);
                  setMovingInstanceId(null);
                  setQuickPlaceCell(null);
                }
                soundFX.pop(game.soundEnabled);
              }}
              className={`min-h-[46px] rounded-2xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 border border-b-4 transition active:translate-y-[2px] active:border-b-2 whitespace-nowrap ${
                showPlacementGrid
                  ? 'bg-[#FF7A9E] text-white border-[#E55E83] border-b-[#C54368]'
                  : 'bg-[#FFFDF8] text-[#B83B64] border-[#F3C5D4] border-b-[#E2A8BC] hover:bg-[#FFF5F8]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span>{showPlacementGrid ? '完成佈置' : '佈置模式'}</span>
            </button>

            <button
              type="button"
              onClick={handleAutoArrange}
              className="min-h-[46px] rounded-2xl bg-[#5CC9A7] text-white text-xs font-extrabold border border-[#45B592] border-b-4 border-b-[#329475] inline-flex items-center justify-center gap-1.5 active:translate-y-[2px] active:border-b-2 transition whitespace-nowrap"
            >
              <Wand2 className="w-3.5 h-3.5 shrink-0" />
              <span>智慧擺放</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShopFilter('surfaces');
                setTab('shop');
              }}
              className="min-h-[46px] rounded-2xl bg-[#FFFDF8] text-[#7A540E] text-xs font-extrabold border border-[#EED9D0] border-b-4 border-b-[#D9BCAD] inline-flex items-center justify-center gap-1 hover:bg-[#FFF6EB] active:translate-y-[2px] active:border-b-2 transition whitespace-nowrap"
            >
              <span>🎨 壁紙地板</span>
            </button>

            {!confirmStowAll ? (
              <button
                type="button"
                disabled={house.roomLayout.placedItems.length === 0}
                onClick={() => setConfirmStowAll(true)}
                className={`min-h-[46px] rounded-2xl border border-b-4 text-xs font-extrabold inline-flex items-center justify-center gap-1 transition whitespace-nowrap ${
                  house.roomLayout.placedItems.length === 0
                    ? 'bg-[#F5EFEA] border-[#E7DCD5] border-b-[#D8CBC2] text-[#A89690] cursor-not-allowed'
                    : 'bg-[#FFFDF8] border-[#EED9D0] border-b-[#D9BCAD] text-[#6E544E] hover:bg-[#FFF5F0] active:translate-y-[2px] active:border-b-2'
                }`}
              >
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span>全部收起</span>
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleStowAll}
                  className="flex-1 min-h-[46px] rounded-2xl bg-[#D64470] text-white border border-[#B8325A] border-b-4 border-b-[#982447] text-[11px] font-extrabold active:translate-y-[2px] active:border-b-2 whitespace-nowrap"
                >
                  確定收起
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmStowAll(false)}
                  className="px-2.5 min-h-[46px] rounded-2xl bg-[#EFE6E0] text-[#5A423C] border border-[#DDD0C8] border-b-4 border-b-[#C7B6AC] text-[11px] font-extrabold active:translate-y-[2px] active:border-b-2 whitespace-nowrap"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          {/* Active Placement / Move Guidance Banner */}
          {(placingItemId || movingInstanceId) && (
            <div className="rounded-2xl bg-[#FFF0F5] border-2 border-[#FF8AA8] px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-[#B83B64]">
                {placingItemId
                  ? `請點選或拖曳至地板上的虛線圓圈，擺放「${ROOM_ITEM_BY_ID[placingItemId]?.name ?? '家具'}」`
                  : '移動／交換模式：點空白虛線圓圈移過去，或點另一件家具直接互換！'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPlacingItemId(null);
                  setMovingInstanceId(null);
                }}
                className="min-h-[40px] px-3 rounded-xl bg-white border border-[#F3B8CA] text-xs font-extrabold text-[#B83B64] shrink-0 whitespace-nowrap"
              >
                取消
              </button>
            </div>
          )}

          {/* Cozy 2D Horizontal Room Stage (35% Wall + Baseboard/Window/Painting, 65% Oak Floor + Plush Rug) */}
          <section className="rounded-3xl border-2 border-[#EED8CE] overflow-hidden shadow-xs bg-[#FFFDF8]">
            {/* Room Info + Live Pet Speech Header */}
            <div className="px-3 py-2 border-b border-[#EFE0D7] bg-[#FFF8F2] space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold text-[#7D635D]">
                <span>
                  壁紙：{wallDef.name} · 地板：{floorDef.name}
                </span>
                <span className="tabular-nums">
                  {house.roomLayout.placedItems.length} / 24 格
                </span>
              </div>
              <div className="rounded-2xl bg-white border border-[#F1D5DF] px-3 py-1.5 text-xs font-extrabold text-[#4A3531] leading-snug">
                💬 {petSpeech}
              </div>
            </div>

            {/* 2D Horizontal Scene Canvas */}
            <div className="relative w-full h-[312px] sm:h-[336px] overflow-hidden select-none">
              {/* TOP 35%: Pastel Striped Wall + Macaron Bunting + Bear Frame + Shelf + Curtained Window + Baseboard */}
              <div
                className="relative h-[35%] w-full overflow-hidden"
                style={{ background: wallDef.wallBgStyle }}
              >
                {/* Delicate Soft Vertical Stripe & Top Glow Overlay */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 18px, rgba(242,206,166,0.08) 18px, rgba(242,206,166,0.08) 36px), linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 78%)',
                  }}
                />

                {/* Top Pastel Macaron Triangular Party Bunting + Cute Bows (頂部三角派對彩旗與蝴蝶結) */}
                <svg
                  viewBox="0 0 400 28"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-x-0 top-0 w-full h-6 z-[4]"
                  aria-hidden="true"
                >
                  {/* Curved Cocoa Garland String */}
                  <path
                    d="M0 4 Q100 13 200 5 Q300 13 400 4"
                    fill="none"
                    stroke="#8C624D"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  {/* Macaron Pastel Triangles: Pink, Soft Yellow, Baby Blue, Lavender */}
                  {[
                    { x1: 12, y1: 5, x2: 32, y2: 7, tx: 21, ty: 20, fill: '#FFB3C7' },
                    { x1: 36, y1: 7, x2: 56, y2: 8.5, tx: 45, ty: 22, fill: '#FFE596' },
                    { x1: 60, y1: 8.5, x2: 80, y2: 9.5, tx: 69, ty: 23, fill: '#B6E1FF' },
                    { x1: 84, y1: 9.5, x2: 104, y2: 9.5, tx: 94, ty: 23, fill: '#DEC8FF' },
                    { x1: 108, y1: 9.5, x2: 128, y2: 9, tx: 118, ty: 22.5, fill: '#FFB3C7' },
                    { x1: 132, y1: 9, x2: 152, y2: 8, tx: 142, ty: 21.5, fill: '#FFE596' },
                    { x1: 156, y1: 8, x2: 176, y2: 6.5, tx: 166, ty: 20, fill: '#B6E1FF' },
                    { x1: 180, y1: 6.5, x2: 196, y2: 5.5, tx: 188, ty: 18.5, fill: '#DEC8FF' },
                    { x1: 204, y1: 5.5, x2: 222, y2: 6.8, tx: 213, ty: 19.5, fill: '#FFB3C7' },
                    { x1: 226, y1: 6.8, x2: 246, y2: 8.2, tx: 236, ty: 21, fill: '#FFE596' },
                    { x1: 250, y1: 8.2, x2: 270, y2: 9.2, tx: 260, ty: 22, fill: '#B6E1FF' },
                    { x1: 274, y1: 9.2, x2: 294, y2: 9.5, tx: 284, ty: 22.5, fill: '#DEC8FF' },
                    { x1: 298, y1: 9.5, x2: 318, y2: 9.5, tx: 308, ty: 23, fill: '#FFB3C7' },
                    { x1: 322, y1: 9.5, x2: 342, y2: 8.5, tx: 332, ty: 22, fill: '#FFE596' },
                    { x1: 346, y1: 8.5, x2: 366, y2: 7, tx: 356, ty: 21, fill: '#B6E1FF' },
                    { x1: 370, y1: 7, x2: 390, y2: 5, tx: 380, ty: 19.5, fill: '#DEC8FF' },
                  ].map((flag, i) => (
                    <g key={i}>
                      <polygon
                        points={`${flag.x1},${flag.y1} ${flag.x2},${flag.y2} ${flag.tx},${flag.ty}`}
                        fill={flag.fill}
                        stroke="#8C624D"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                      <circle cx={flag.tx} cy={flag.ty - 5.5} r="1.1" fill="#FFFDF8" opacity="0.75" />
                    </g>
                  ))}
                  {/* Cute Ribbon Bows at Connection Knots */}
                  {[
                    { cx: 8, cy: 4.5, color: '#FF9BB8' },
                    { cx: 106, cy: 9.5, color: '#FFD470' },
                    { cx: 200, cy: 5.5, color: '#FF9BB8' },
                    { cx: 296, cy: 9.5, color: '#9FD3FF' },
                    { cx: 392, cy: 4.5, color: '#FF9BB8' },
                  ].map((bow, idx) => (
                    <g key={idx} transform={`translate(${bow.cx}, ${bow.cy})`}>
                      <path d="M-2 1L-5 6.5M2 1L5 6.5" stroke="#8C624D" strokeWidth="1.2" strokeLinecap="round" />
                      <ellipse cx="-4.2" cy="0" rx="3.8" ry="2.4" transform="rotate(-18 -4.2 0)" fill={bow.color} stroke="#8C624D" strokeWidth="1.1" />
                      <ellipse cx="4.2" cy="0" rx="3.8" ry="2.4" transform="rotate(18 4.2 0)" fill={bow.color} stroke="#8C624D" strokeWidth="1.1" />
                      <circle cx="0" cy="0" r="1.8" fill="#FFF7EE" stroke="#8C624D" strokeWidth="1.1" />
                    </g>
                  ))}
                </svg>

                {/* Left Bear-Ears Wooden Picture Frame (小熊耳朵造型的木質畫框) */}
                <div
                  className="pointer-events-none absolute left-[5%] top-[22%] drop-shadow-[0_2px_2px_rgba(90,62,54,0.16)]"
                  aria-hidden="true"
                >
                  <svg width="62" height="52" viewBox="0 0 62 52" fill="none">
                    {/* Hanging String & Wooden Pin */}
                    <path d="M23 11L31 2.5L39 11" stroke="#9B704A" strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="31" cy="2.6" r="1.9" fill="#8A5E3B" />
                    {/* Bear Wooden Ears */}
                    <circle cx="14" cy="12" r="7" fill="#D5A678" stroke="#8A5E3B" strokeWidth="1.8" />
                    <circle cx="14" cy="12" r="3.6" fill="#E8C39E" />
                    <circle cx="48" cy="12" r="7" fill="#D5A678" stroke="#8A5E3B" strokeWidth="1.8" />
                    <circle cx="48" cy="12" r="3.6" fill="#E8C39E" />
                    {/* Main Wooden Frame */}
                    <rect x="6" y="11" width="50" height="36" rx="7" fill="#D5A678" stroke="#8A5E3B" strokeWidth="2" />
                    <rect x="11" y="16" width="40" height="26" rx="4" fill="#FFFDF6" stroke="#BA8B5E" strokeWidth="1.1" />
                    {/* Cozy Hand-drawn Scenery Inside */}
                    <path d="M11 35C18 30 25 31 31 34C38 37 44 31 51 33V42H11V35Z" fill="#CFEAD6" />
                    <circle cx="42" cy="22" r="3.4" fill="#FFD97D" />
                    <path d="M17 22C17 20.3 18.8 19.4 20.2 20.2C21.2 19 23.2 19.3 23.7 20.8C25 21 25.6 22.5 24.8 23.5H17.4C16.8 23.2 16.8 22.4 17 22Z" fill="#EAF5FF" />
                    <circle cx="24" cy="29" r="3.5" fill="#FF94B4" />
                    <circle cx="24" cy="29" r="1.4" fill="#FFF3B0" />
                    <path d="M24 32.5V38" stroke="#5FA876" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Middle Wooden Wall Shelf with Pastel Books & Mini Succulent (木頭小壁架＋粉嫩書本＋迷你多肉) */}
                <div
                  className="pointer-events-none absolute left-[29%] top-[28%] drop-shadow-[0_2px_2px_rgba(90,62,54,0.14)]"
                  aria-hidden="true"
                >
                  <svg width="78" height="48" viewBox="0 0 78 48" fill="none">
                    {/* Pastel Leaning Books on Left of Shelf */}
                    <rect x="10" y="10" width="7.5" height="22" rx="1.8" fill="#FFB3C7" stroke="#8A5E3B" strokeWidth="1.3" />
                    <line x1="11.5" y1="15" x2="16" y2="15" stroke="#FFFDF8" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="18" y="13" width="7" height="19" rx="1.8" fill="#FFE599" stroke="#8A5E3B" strokeWidth="1.3" />
                    <line x1="19.5" y1="18" x2="23.5" y2="18" stroke="#FFFDF8" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="25.5" y="11" width="7" height="21" rx="1.8" fill="#BFE8DA" stroke="#8A5E3B" strokeWidth="1.3" />
                    <line x1="27" y1="16" x2="31" y2="16" stroke="#FFFDF8" strokeWidth="1.2" strokeLinecap="round" />
                    <rect
                      x="34"
                      y="13"
                      width="6.5"
                      height="19"
                      rx="1.6"
                      transform="rotate(-9 34 32)"
                      fill="#DFC9FF"
                      stroke="#8A5E3B"
                      strokeWidth="1.3"
                    />

                    {/* Mini Succulent Pot on Right of Shelf */}
                    <path d="M51 22H65L63 32H53L51 22Z" fill="#FFFDF7" stroke="#8A5E3B" strokeWidth="1.4" strokeLinejoin="round" />
                    <rect x="49.5" y="20" width="17" height="3.2" rx="1.6" fill="#FFE6EE" stroke="#8A5E3B" strokeWidth="1.2" />
                    <ellipse cx="55" cy="18" rx="3.4" ry="2.2" transform="rotate(-24 55 18)" fill="#7AD19B" stroke="#4D8F68" strokeWidth="1.1" />
                    <ellipse cx="61" cy="18" rx="3.4" ry="2.2" transform="rotate(24 61 18)" fill="#6EC28E" stroke="#4D8F68" strokeWidth="1.1" />
                    <ellipse cx="58" cy="15.5" rx="2.6" ry="3.2" fill="#95E0B0" stroke="#4D8F68" strokeWidth="1.1" />

                    {/* Wooden Shelf Plank & Curved Brackets */}
                    <rect x="4" y="32" width="70" height="5.5" rx="2.5" fill="#D9AA7B" stroke="#8A5E3B" strokeWidth="1.5" />
                    <path d="M14 37.5H21C19 41 16.5 43.5 14 45V37.5Z" fill="#C49161" stroke="#8A5E3B" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M64 37.5H57C59 41 61.5 43.5 64 45V37.5Z" fill="#C49161" stroke="#8A5E3B" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Right Sunlit Window with Tied Pink Bow Curtains, Mini Succulent & Cat Silhouette (窗戶＋蝴蝶結粉色窗簾＋多肉＋小貓背影) */}
                <div
                  className="pointer-events-none absolute right-[5%] top-[12%] drop-shadow-[0_2px_3px_rgba(90,62,54,0.15)]"
                  aria-hidden="true"
                >
                  <svg width="112" height="82" viewBox="0 0 112 82" fill="none">
                    {/* Curtain Rod & Finials */}
                    <line x1="6" y1="6" x2="106" y2="6" stroke="#9C6D46" strokeWidth="2.8" strokeLinecap="round" />
                    <circle cx="6" cy="6" r="3" fill="#DFAF80" stroke="#8A5E3B" strokeWidth="1.3" />
                    <circle cx="106" cy="6" r="3" fill="#DFAF80" stroke="#8A5E3B" strokeWidth="1.3" />

                    {/* Outer Wooden Window Frame */}
                    <rect x="14" y="8" width="84" height="64" rx="6" fill="#CCA072" stroke="#8A5E3B" strokeWidth="2" />
                    <rect x="19" y="13" width="74" height="54" rx="3" fill="#DFF2FF" />

                    {/* Sunny Sky, Clouds, Sun & Outdoor Greenery */}
                    <circle cx="72" cy="22" r="5.5" fill="#FFF1A3" />
                    <path d="M27 33C27 29.5 30.5 27 34.5 27.5C36 25 40 24.5 42.5 26.8C45 27 47 29.5 46.5 32.5H27Z" fill="#FFFFFF" opacity="0.92" />
                    <path d="M61 28C61 25.5 63.5 24 66.5 24.5C68 22.5 71.5 22.5 73 24.5C75 25 76.5 27 76 29H61Z" fill="#FFFFFF" opacity="0.86" />
                    <path d="M19 56C30 49 44 52 55 55C67 49 81 51 93 56V67H19V56Z" fill="#BEE7C7" opacity="0.88" />

                    {/* Window Panes */}
                    <line x1="56" y1="13" x2="56" y2="67" stroke="#A6784E" strokeWidth="2.2" />
                    <line x1="19" y1="39" x2="93" y2="39" stroke="#A6784E" strokeWidth="2.2" />

                    {/* Left & Right Gathered Pink Curtains Tied with Ribbon Bows */}
                    <path
                      d="M12 7H35C32 23 28 34 23 43C29 52 32 61 33 69H12C10 50 10 26 12 7Z"
                      fill="#FFC4D6"
                      stroke="#9F5F73"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path d="M17 11C17 24 16 33 18 42M24 11C23 22 22 31 20 40" stroke="#F49CB8" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Left Tieback Bow */}
                    <g transform="translate(22, 43)">
                      <path d="M-2 1L-5 7M2 1L5 7" stroke="#9F5F73" strokeWidth="1.3" strokeLinecap="round" />
                      <ellipse cx="-4" cy="0" rx="4" ry="2.4" transform="rotate(-18 -4 0)" fill="#FF8EB0" stroke="#9F5F73" strokeWidth="1.1" />
                      <ellipse cx="4" cy="0" rx="4" ry="2.4" transform="rotate(18 4 0)" fill="#FF8EB0" stroke="#9F5F73" strokeWidth="1.1" />
                      <circle cx="0" cy="0" r="1.9" fill="#FFEAF1" stroke="#9F5F73" strokeWidth="1.1" />
                    </g>

                    <path
                      d="M100 7H77C80 23 84 34 89 43C83 52 80 61 79 69H100C102 50 102 26 100 7Z"
                      fill="#FFC4D6"
                      stroke="#9F5F73"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path d="M95 11C95 24 96 33 94 42M88 11C89 22 90 31 92 40" stroke="#F49CB8" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Right Tieback Bow */}
                    <g transform="translate(90, 43)">
                      <path d="M-2 1L-5 7M2 1L5 7" stroke="#9F5F73" strokeWidth="1.3" strokeLinecap="round" />
                      <ellipse cx="-4" cy="0" rx="4" ry="2.4" transform="rotate(-18 -4 0)" fill="#FF8EB0" stroke="#9F5F73" strokeWidth="1.1" />
                      <ellipse cx="4" cy="0" rx="4" ry="2.4" transform="rotate(18 4 0)" fill="#FF8EB0" stroke="#9F5F73" strokeWidth="1.1" />
                      <circle cx="0" cy="0" r="1.9" fill="#FFEAF1" stroke="#9F5F73" strokeWidth="1.1" />
                    </g>

                    {/* Top Scalloped Pink Valance */}
                    <path
                      d="M11 7H101V14C94 18 85 18 79 14C73 18 65 18 59 14C53 18 47 18 41 14C35 18 27 18 21 14C17 17 13 17 11 14V7Z"
                      fill="#FFD9E5"
                      stroke="#9F5F73"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />

                    {/* Inner Sill Mini Succulent + Cozy Sitting Cat Back Silhouette */}
                    {/* Mini Succulent on Left Sill */}
                    <g transform="translate(34, 54)">
                      <path d="M2 7H13L11.5 15H3.5L2 7Z" fill="#FFFDF7" stroke="#8A5E3B" strokeWidth="1.2" />
                      <ellipse cx="5.2" cy="5.2" rx="2.8" ry="1.8" transform="rotate(-24 5.2 5.2)" fill="#7AD19B" stroke="#4D8F68" strokeWidth="1" />
                      <ellipse cx="9.8" cy="5.2" rx="2.8" ry="1.8" transform="rotate(24 9.8 5.2)" fill="#6EC28E" stroke="#4D8F68" strokeWidth="1" />
                      <ellipse cx="7.5" cy="3.5" rx="2.2" ry="2.6" fill="#95E0B0" stroke="#4D8F68" strokeWidth="1" />
                    </g>

                    {/* Wooden Window Sill */}
                    <rect x="8" y="69" width="96" height="6.5" rx="2.5" fill="#E2B688" stroke="#8A5E3B" strokeWidth="1.5" />

                    {/* Sitting Cat Back-View Silhouette on Inner Sill (柔和深可可色小貓背影剪影) */}
                    <g transform="translate(55, 45)">
                      {/* Curled Tail Hanging Down Over Sill */}
                      <path
                        d="M14 23C19 24 21 29 18 33C16.5 35 13.5 34.5 14 32.5"
                        fill="none"
                        stroke="#735145"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />
                      {/* Plump Sitting Body */}
                      <ellipse cx="9" cy="18.5" rx="7.5" ry="7" fill="#735145" />
                      {/* Round Head + Pointed Cat Ears */}
                      <polygon points="3.5,8 4.5,1 9,6" fill="#735145" />
                      <polygon points="14.5,8 13.5,1 9,6" fill="#735145" />
                      <circle cx="9" cy="9" r="5.8" fill="#735145" />
                      {/* Soft Pastel Collar Ribbon Hint */}
                      <path d="M5 13.5Q9 15 13 13.5" fill="none" stroke="#FF9BB8" strokeWidth="1.6" strokeLinecap="round" />
                    </g>
                  </svg>
                </div>

                {/* Wooden Baseboard (木質踢腳板) */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-3.5 border-t border-[#EED0AE] border-b-2 border-b-[#9C6F45]"
                  style={{
                    background:
                      'linear-gradient(180deg, #E2BD95 0%, #CFA275 58%, #BA8B5E 100%)',
                  }}
                />
              </div>

              {/* BOTTOM 65%: Warm Oak Floor + Soft Cocoa Wavy Wood Grain + Lace Rug & Props + Starter Cat Pot/Bunny Box */}
              <div
                className="relative h-[65%] w-full overflow-hidden"
                style={{ background: floorDef.floorBgStyle }}
              >
                {/* Oak Plank Seam Lines */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-25"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(180deg, rgba(122,82,56,0) 0px, rgba(122,82,56,0) 22px, rgba(122,82,56,0.28) 23px, rgba(122,82,56,0) 24px)',
                  }}
                />

                {/* Hand-Drawn Wavy Wood-Grain Texture in Soft Dark Cocoa (柔和深可可色水波紋木紋線條) */}
                <svg
                  viewBox="0 0 400 210"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.26]"
                  aria-hidden="true"
                >
                  <g fill="none" stroke="#7A5238" strokeWidth="1.35" strokeLinecap="round">
                    {/* Staggered Vertical Plank Joints */}
                    <line x1="92" y1="0" x2="92" y2="26" />
                    <line x1="256" y1="0" x2="256" y2="26" />
                    <line x1="168" y1="26" x2="168" y2="52" />
                    <line x1="334" y1="26" x2="334" y2="52" />
                    <line x1="68" y1="52" x2="68" y2="78" />
                    <line x1="224" y1="52" x2="224" y2="78" />
                    <line x1="142" y1="78" x2="142" y2="104" />
                    <line x1="310" y1="78" x2="310" y2="104" />
                    <line x1="88" y1="104" x2="88" y2="130" />
                    <line x1="268" y1="104" x2="268" y2="130" />
                    <line x1="184" y1="130" x2="184" y2="156" />
                    <line x1="342" y1="130" x2="342" y2="156" />
                    <line x1="112" y1="156" x2="112" y2="182" />
                    <line x1="286" y1="156" x2="286" y2="182" />
                    {/* Soft Wavy Wood-Grain Ripples & Knots */}
                    <path d="M12 12C34 8 56 16 80 11" />
                    <path d="M108 14C144 9 186 18 238 12" />
                    <path d="M274 11C312 16 348 8 386 13" />
                    <path d="M24 38C64 33 110 43 152 37" />
                    <path d="M184 40C226 34 274 44 320 38" />
                    <path d="M348 39C366 36 382 41 394 38" />
                    <path d="M84 65C124 59 168 70 208 63" />
                    <path d="M240 66C288 60 338 70 388 64" />
                    <path d="M18 90C58 85 96 95 130 89" />
                    <path d="M158 92C206 86 254 96 298 90" />
                    <path d="M324 91C352 87 374 94 392 90" />
                    <path d="M104 117C148 111 196 122 252 115" />
                    <path d="M284 118C322 113 356 122 390 117" />
                    <path d="M20 142C66 137 118 147 170 141" />
                    <path d="M204 144C246 138 294 147 330 142" />
                    <path d="M14 169C48 164 78 173 102 168" />
                    <path d="M126 170C174 164 224 174 274 168" />
                    <path d="M302 169C338 165 366 173 392 169" />
                    <path d="M36 194C88 189 144 198 198 193" />
                    <path d="M226 195C280 190 336 199 384 194" />
                    {/* Subtle Oval Wood Knots */}
                    <ellipse cx="48" cy="64" rx="10" ry="3.2" />
                    <ellipse cx="292" cy="143" rx="11" ry="3.2" />
                    <ellipse cx="144" cy="193" rx="9" ry="2.8" />
                  </g>
                </svg>

                {/* Pink Lace Round Rug + Left Paw Bowl & Right Wind-up Mouse Toy (粉色蕾絲圓地毯＋肉球碗＋發條小老鼠) */}
                <div
                  className="pointer-events-none absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[78%] max-w-[330px] h-[58%] flex items-center justify-center"
                  aria-hidden="true"
                >
                  {/* Left: Pink Paw Pet Bowl (粉色肉球寵物碗) */}
                  <div className="absolute left-0 sm:left-2 bottom-[14%] drop-shadow-[0_2px_2px_rgba(90,62,54,0.16)]">
                    <svg width="42" height="32" viewBox="0 0 42 32" fill="none">
                      <ellipse cx="21" cy="26.5" rx="16" ry="3.6" fill="rgba(110,74,56,0.16)" />
                      {/* Golden Kibble Inside Bowl */}
                      <ellipse cx="21" cy="12" rx="12.5" ry="4.5" fill="#FFE8B8" stroke="#7A5238" strokeWidth="1.4" />
                      <circle cx="17" cy="11.5" r="2.2" fill="#E39B54" />
                      <circle cx="21" cy="10.8" r="2.3" fill="#D5863E" />
                      <circle cx="25" cy="11.6" r="2.1" fill="#E39B54" />
                      {/* Pink Ceramic Bowl Body */}
                      <path
                        d="M7 12C7 15.2 13.3 17.5 21 17.5C28.7 17.5 35 15.2 35 12L37 22.5C37 25.5 29.8 27.5 21 27.5C12.2 27.5 5 25.5 5 22.5L7 12Z"
                        fill="#FFA9C4"
                        stroke="#7A5238"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                      {/* Cute Paw Print on Front of Bowl */}
                      <ellipse cx="21" cy="23" rx="2.6" ry="2" fill="#FFF8FA" />
                      <circle cx="17.8" cy="20.4" r="1.1" fill="#FFF8FA" />
                      <circle cx="21" cy="19.6" r="1.15" fill="#FFF8FA" />
                      <circle cx="24.2" cy="20.4" r="1.1" fill="#FFF8FA" />
                    </svg>
                  </div>

                  {/* Center: Pink Lace Round Rug (粉色蕾絲圓地毯) */}
                  <svg
                    viewBox="0 0 240 132"
                    className="w-[74%] max-w-[236px] h-full drop-shadow-[0_3px_4px_rgba(95,62,42,0.12)]"
                  >
                    {/* Outer Lace Scallops */}
                    <ellipse
                      cx="120"
                      cy="67"
                      rx="110"
                      ry="54"
                      fill="#FFE6EF"
                      stroke="#F5B9CD"
                      strokeWidth="6"
                      strokeDasharray="2 9"
                      strokeLinecap="round"
                    />
                    {/* Main Pastel Pink Rug Base */}
                    <ellipse cx="120" cy="67" rx="104" ry="49" fill="#FFEAF1" stroke="#F2B4C8" strokeWidth="2.2" />
                    {/* Cream Plush Inner Circle */}
                    <ellipse cx="120" cy="66" rx="86" ry="39" fill="#FFF8F0" />
                    {/* Delicate Stitched Lace Ring */}
                    <ellipse cx="120" cy="66" rx="70" ry="30" fill="none" stroke="#F8CEDB" strokeWidth="2" strokeDasharray="5 4" />
                  </svg>

                  {/* Right: Mini Wind-up Mouse Toy (迷你發條小老鼠玩具) */}
                  <div className="absolute right-0 sm:right-2 bottom-[18%] drop-shadow-[0_2px_2px_rgba(90,62,54,0.16)]">
                    <svg width="44" height="32" viewBox="0 0 44 32" fill="none">
                      <ellipse cx="21" cy="26.5" rx="14" ry="3.2" fill="rgba(110,74,56,0.16)" />
                      {/* Curly Tail */}
                      <path
                        d="M31 21C36 20 39 16 37 13.5C35.5 11.8 33.5 13 34.8 14.5"
                        fill="none"
                        stroke="#F29BB5"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      {/* Golden Wind-up Key on Back */}
                      <line x1="22" y1="8" x2="22" y2="13" stroke="#C68E3E" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="19.5" cy="6.5" r="2.7" fill="none" stroke="#E2AC4C" strokeWidth="1.8" />
                      <circle cx="24.5" cy="6.5" r="2.7" fill="none" stroke="#E2AC4C" strokeWidth="1.8" />
                      {/* Plump Toy Mouse Body */}
                      <path
                        d="M9 22C9 16 14 12.5 21.5 12.5C28 12.5 32.5 16.5 32.5 21.5C32.5 24.2 28.5 25.5 21 25.5C13.5 25.5 9 24.5 9 22Z"
                        fill="#E0D8EE"
                        stroke="#7A5238"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      {/* Cute Pink Round Ears */}
                      <circle cx="16.5" cy="13" r="3.4" fill="#FFB5CA" stroke="#7A5238" strokeWidth="1.3" />
                      <circle cx="16.5" cy="13" r="1.5" fill="#FFE8F0" />
                      {/* Tiny Cocoa Eye, Pink Nose & Whiskers */}
                      <circle cx="12.5" cy="18.5" r="1.2" fill="#6B4732" />
                      <circle cx="8.6" cy="20.6" r="1.5" fill="#FF7AA2" />
                      <path d="M9 21.5L5.5 22.5M9 19.5L5.8 18.8" stroke="#7A5238" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Starter Ambient Corner Decor when Room Has Zero Furniture */}
                {house.roomLayout.placedItems.length === 0 && (
                  <>
                    {/* Left Corner: Cute Cat-Face White Flower Pot with Blooming Pink Flowers (可愛貓咪臉花盆＋盛開粉色小花) */}
                    <div
                      className="pointer-events-none absolute left-2 top-1 z-[5] drop-shadow-[0_2px_2px_rgba(90,62,54,0.15)]"
                      aria-hidden="true"
                    >
                      <svg width="58" height="62" viewBox="0 0 58 62" fill="none">
                        <ellipse cx="29" cy="57" rx="17" ry="3.8" fill="rgba(110,74,56,0.16)" />
                        {/* Lush Green Leaves & Stems */}
                        <path d="M29 31C23 24 16 23 13 26C16 30 22 32 29 31Z" fill="#77C88E" stroke="#4D8F68" strokeWidth="1.4" />
                        <path d="M29 31C35 24 42 23 45 26C42 30 36 32 29 31Z" fill="#63B87B" stroke="#4D8F68" strokeWidth="1.4" />
                        <path d="M22 30L18 19M29 30V14M36 30L40 20" stroke="#4D8F68" strokeWidth="1.8" strokeLinecap="round" />
                        {/* Three Blooming Pink Little Flowers */}
                        {[
                          { cx: 18, cy: 17, r: 3.3 },
                          { cx: 29, cy: 12, r: 3.8 },
                          { cx: 40, cy: 18, r: 3.2 },
                        ].map((fl, idx) => (
                          <g key={idx} transform={`translate(${fl.cx}, ${fl.cy})`}>
                            <circle cx="0" cy={-fl.r} r={fl.r * 0.85} fill="#FF98B8" stroke="#9F5F73" strokeWidth="0.9" />
                            <circle cx={fl.r} cy="0" r={fl.r * 0.85} fill="#FFB0C9" stroke="#9F5F73" strokeWidth="0.9" />
                            <circle cx="0" cy={fl.r} r={fl.r * 0.85} fill="#FF98B8" stroke="#9F5F73" strokeWidth="0.9" />
                            <circle cx={-fl.r} cy="0" r={fl.r * 0.85} fill="#FFB0C9" stroke="#9F5F73" strokeWidth="0.9" />
                            <circle cx="0" cy="0" r={fl.r * 0.68} fill="#FFE37A" />
                          </g>
                        ))}
                        {/* White Cat-Face Ceramic Flower Pot */}
                        <path d="M16 32L18 25L24 31Z" fill="#FFFDF9" stroke="#7A5238" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M42 32L40 25L34 31Z" fill="#FFFDF9" stroke="#7A5238" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M18.3 30.5L19.3 27L22 30Z" fill="#FFC2D4" />
                        <path d="M39.7 30.5L38.7 27L36 30Z" fill="#FFC2D4" />
                        <path
                          d="M15 32C15 30.5 16.5 30 29 30C41.5 30 43 30.5 43 32L40 53C39.6 55 36 56 29 56C22 56 18.4 55 18 53L15 32Z"
                          fill="#FFFDF9"
                          stroke="#7A5238"
                          strokeWidth="1.7"
                          strokeLinejoin="round"
                        />
                        {/* Cute Cat Face Details */}
                        <circle cx="23.5" cy="40.5" r="1.5" fill="#6B4732" />
                        <circle cx="34.5" cy="40.5" r="1.5" fill="#6B4732" />
                        <ellipse cx="20.5" cy="43.5" rx="2.4" ry="1.4" fill="#FFB3C7" opacity="0.85" />
                        <ellipse cx="37.5" cy="43.5" rx="2.4" ry="1.4" fill="#FFB3C7" opacity="0.85" />
                        <path d="M26.8 43.2Q28 45 29 43.5Q30 45 31.2 43.2" fill="none" stroke="#6B4732" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M16.5 41.5L20 42M16.5 44L20 43.8M41.5 41.5L38 42M41.5 44L38 43.8" stroke="#9C7A66" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                    </div>

                    {/* Right Corner: Kraft Cardboard Box with Paw Sticker + Peeking Plush Bunny (肉球貼紙紙箱＋探頭布偶小兔子) */}
                    <div
                      className="pointer-events-none absolute right-2 top-0.5 z-[5] drop-shadow-[0_2px_2px_rgba(90,62,54,0.15)]"
                      aria-hidden="true"
                    >
                      <svg width="64" height="62" viewBox="0 0 64 62" fill="none">
                        <ellipse cx="32" cy="57" rx="21" ry="3.8" fill="rgba(110,74,56,0.16)" />
                        {/* Open Back Box Rim */}
                        <path d="M13 28L18 22H46L51 28H13Z" fill="#C99764" stroke="#7A5238" strokeWidth="1.5" strokeLinejoin="round" />

                        {/* Cute Plush Bunny Peeking Out of Box */}
                        <g>
                          {/* Floppy Bunny Ears */}
                          <ellipse cx="25" cy="14" rx="4.2" ry="9.5" transform="rotate(-14 25 14)" fill="#FFF9F2" stroke="#7A5238" strokeWidth="1.5" />
                          <ellipse cx="25.2" cy="14.5" rx="2.1" ry="6" transform="rotate(-14 25.2 14.5)" fill="#FFC4D6" />
                          <ellipse cx="39" cy="14" rx="4.2" ry="9.5" transform="rotate(14 39 14)" fill="#FFF9F2" stroke="#7A5E3B" strokeWidth="1.5" />
                          <ellipse cx="38.8" cy="14.5" rx="2.1" ry="6" transform="rotate(14 38.8 14.5)" fill="#FFC4D6" />
                          {/* Bunny Head */}
                          <ellipse cx="32" cy="24" rx="10.5" ry="9" fill="#FFF9F2" stroke="#7A5238" strokeWidth="1.6" />
                          {/* Stitched Eyes, Blush & Tiny Pink Nose */}
                          <circle cx="28" cy="23.2" r="1.4" fill="#6B4732" />
                          <circle cx="36" cy="23.2" r="1.4" fill="#6B4732" />
                          <ellipse cx="25" cy="25.5" rx="2.2" ry="1.3" fill="#FFB3C7" opacity="0.85" />
                          <ellipse cx="39" cy="25.5" rx="2.2" ry="1.3" fill="#FFB3C7" opacity="0.85" />
                          <ellipse cx="32" cy="25.2" rx="1.6" ry="1.1" fill="#FF8EB0" />
                          <path d="M30.4 26.8Q32 28.2 33.6 26.8" fill="none" stroke="#6B4732" strokeWidth="1.2" strokeLinecap="round" />
                        </g>

                        {/* Cardboard Box Front & Side Flaps */}
                        <path d="M12 28L7 33L12 36V28Z" fill="#EECFA8" stroke="#7A5238" strokeWidth="1.4" strokeLinejoin="round" />
                        <path d="M52 28L57 33L52 36V28Z" fill="#EECFA8" stroke="#7A5238" strokeWidth="1.4" strokeLinejoin="round" />
                        <rect x="12" y="28" width="40" height="27" rx="3" fill="#E3BA8D" stroke="#7A5238" strokeWidth="1.7" />
                        <path d="M12 28L16 33H48L52 28" fill="#EECCA3" stroke="#7A5238" strokeWidth="1.4" strokeLinejoin="round" />

                        {/* Bunny Little Paws Resting on Box Rim */}
                        <ellipse cx="24.5" cy="29.2" rx="3.4" ry="2.4" fill="#FFF9F2" stroke="#7A5238" strokeWidth="1.3" />
                        <ellipse cx="39.5" cy="29.2" rx="3.4" ry="2.4" fill="#FFF9F2" stroke="#7A5238" strokeWidth="1.3" />

                        {/* Cute Pink Paw-Print Sticker on Box Front */}
                        <rect x="24.5" y="37" width="15" height="14" rx="4" fill="#FFF8F0" stroke="#D9A87E" strokeWidth="1.1" />
                        <ellipse cx="32" cy="45.8" rx="3" ry="2.3" fill="#FF8EB0" />
                        <circle cx="28.7" cy="42.4" r="1.25" fill="#FF8EB0" />
                        <circle cx="32" cy="41.4" r="1.3" fill="#FF8EB0" />
                        <circle cx="35.3" cy="42.4" r="1.25" fill="#FF8EB0" />
                      </svg>
                    </div>
                  </>
                )}

                {/* Zone Hints Overlay ONLY visible in Decorate / Drag / Place Mode */}
                {showPlacementGrid && (
                  <div
                    className="pointer-events-none absolute inset-0 z-[6] grid grid-cols-2 grid-rows-2 text-[10px] font-extrabold"
                    aria-hidden="true"
                  >
                    <div className="border-r border-b border-dashed border-[#BFA89A]/45 p-1.5 flex items-start justify-start">
                      <span className="px-1.5 py-0.5 rounded-lg bg-white/75 text-[#5C459E]">
                        🌙 睡眠區
                      </span>
                    </div>
                    <div className="border-b border-dashed border-[#BFA89A]/45 p-1.5 flex items-start justify-end">
                      <span className="px-1.5 py-0.5 rounded-lg bg-white/75 text-[#B83B64]">
                        🎀 裝飾區
                      </span>
                    </div>
                    <div className="border-r border-dashed border-[#BFA89A]/45 p-1.5 flex items-end justify-start">
                      <span className="px-1.5 py-0.5 rounded-lg bg-white/75 text-[#1F6B54]">
                        ⚽ 遊玩區
                      </span>
                    </div>
                    <div className="p-1.5 flex items-end justify-end">
                      <span className="px-1.5 py-0.5 rounded-lg bg-white/75 text-[#9D5B12]">
                        🍽️ 用餐區
                      </span>
                    </div>
                  </div>
                )}

                {/* 6x4 Interactive Placement Slots (Transparent in Browse Mode, Soft Dashed Circles in Decorate Mode) */}
                <div className="relative z-10 h-full w-full p-2 grid grid-cols-6 grid-rows-4 gap-1">
                  {Array.from({ length: ROOM_GRID_ROWS * ROOM_GRID_COLS }, (_, idx) => {
                    const x = idx % ROOM_GRID_COLS;
                    const y = Math.floor(idx / ROOM_GRID_COLS);
                    const zone = getZoneForCell(x, y);
                    const zoneMeta = ROOM_ZONES[zone];
                    const occupant = placedCellMap.get(`${x}_${y}`) ?? null;
                    const itemDef = occupant ? ROOM_ITEM_BY_ID[occupant.itemId] : null;
                    const isSelected = occupant && selectedInstanceId === occupant.instanceId;
                    const isMovingThis = occupant && movingInstanceId === occupant.instanceId;
                    const noteCount = occupant
                      ? house.furnitureNotes.filter((n) => n.itemId === occupant.itemId).length
                      : 0;

                    const activePlaceId = draggingStowedId ?? placingItemId;
                    const placingItemDef = activePlaceId ? ROOM_ITEM_BY_ID[activePlaceId] : null;
                    const isTargetZoneHint = placingItemDef ? placingItemDef.zone === zone : false;
                    const isDragHovered = dragOverCell?.x === x && dragOverCell?.y === y;

                    const circleZoneBorder =
                      isDragHovered
                        ? 'border-[#FF5C8A] bg-[#FFEAF0]/80 scale-105'
                        : isTargetZoneHint
                        ? 'border-[#49B895] bg-[#E9FAF2]/70'
                        : zone === 'sleep'
                        ? 'border-[#9A85DB]/65 bg-white/35'
                        : zone === 'decor'
                        ? 'border-[#FF7A9E]/65 bg-white/35'
                        : zone === 'play'
                        ? 'border-[#5CC9A7]/65 bg-white/35'
                        : 'border-[#E69F45]/65 bg-white/35';

                    return (
                      <button
                        key={`${x}_${y}`}
                        type="button"
                        draggable={Boolean(occupant && decorateMode)}
                        onDragStart={(e) => {
                          if (!occupant || !decorateMode) return;
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', occupant.instanceId);
                          setDraggingInstanceId(occupant.instanceId);
                        }}
                        onDragEnd={() => {
                          setDraggingInstanceId(null);
                          setDragOverCell(null);
                        }}
                        onDragOver={(e) => {
                          if (!draggingStowedId && !draggingInstanceId) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (dragOverCell?.x !== x || dragOverCell?.y !== y) {
                            setDragOverCell({ x, y });
                          }
                        }}
                        onDragLeave={() => {
                          if (dragOverCell?.x === x && dragOverCell?.y === y) {
                            setDragOverCell(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverCell(null);
                          if (draggingStowedId) {
                            if (occupant) {
                              soundFX.miss(game.soundEnabled);
                              showError('這格已經有家具囉，請拖放到空白圓圈！');
                              setDraggingStowedId(null);
                              return;
                            }
                            handlePlaceAt(draggingStowedId, x, y);
                            return;
                          }
                          if (draggingInstanceId) {
                            handleMoveOrSwapTo(draggingInstanceId, x, y);
                          }
                        }}
                        onClick={() => handleCellClick(x, y)}
                        aria-label={
                          itemDef
                            ? `${zoneMeta.name} 已擺放 ${itemDef.name}`
                            : `${zoneMeta.name} 空格 (${x + 1},${y + 1})`
                        }
                        className={`relative rounded-xl flex items-center justify-center transition active:scale-95 ${
                          isSelected || isMovingThis
                            ? 'bg-[#FFEAF0]/85 border-2 border-[#FF5C8A] ring-2 ring-[#FF8AA8]/45'
                            : occupant && showPlacementGrid
                            ? 'bg-white/55 border border-[#E7CFC4]/80 hover:bg-white/80'
                            : occupant
                            ? 'bg-transparent border border-transparent hover:bg-white/20'
                            : isDragHovered
                            ? 'bg-white/40 border border-transparent'
                            : 'bg-transparent border border-transparent'
                        }`}
                      >
                        {occupant && itemDef ? (
                          <>
                            <div className="drop-shadow-[0_3px_2px_rgba(74,53,49,0.22)]">
                              <FurnitureGraphic itemId={itemDef.id} size={36} />
                            </div>
                            {noteCount > 0 && (
                              <span
                                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF7A9E] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs"
                                title="有家具留言"
                              >
                                💌
                              </span>
                            )}
                          </>
                        ) : (
                          showPlacementGrid && (
                            <span
                              className={`w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center text-[11px] font-extrabold transition ${circleZoneBorder}`}
                            >
                              <span className="text-[#6E544E]/70">
                                {activePlaceId || movingInstanceId ? '＋' : ''}
                              </span>
                            </span>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Smooth Floor-Wandering & Breathing Pet Layer */}
                <div className="pointer-events-none absolute inset-2 z-20" aria-hidden="true">
                  <div
                    className="house-pet-mover absolute"
                    style={{
                      left: `${petCoords.xPercent}%`,
                      top: `${petCoords.yPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Floating Heart / Music Note / Sleep Mood Bubble */}
                    {(ambientMoodBubble || (!isPetMoving && petAction === 'sleeping')) && (
                      <div
                        key={ambientMoodBubble ? ambientMoodBubble.key : 'sleep-zzz'}
                        className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-none z-30"
                      >
                        {!isPetMoving && petAction === 'sleeping' ? (
                          <span className="inline-block text-xs animate-house-zzz">💤</span>
                        ) : ambientMoodBubble ? (
                          <span className="animate-house-mood-pop inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/90 border border-[#F3CBD9] text-xs shadow-xs">
                            {ambientMoodBubble.emoji}
                          </span>
                        ) : null}
                      </div>
                    )}

                    {/* Pet Facing & Animation Wrapper (Breathing when idle) */}
                    <div
                      className="flex flex-col items-center"
                      style={{
                        transform: petFacingLeft ? 'scaleX(-1)' : 'scaleX(1)',
                        transition: 'transform 0.24s ease',
                      }}
                    >
                      <div
                        className={
                          isPetMoving
                            ? 'animate-house-pet-walk'
                            : petAction === 'sleeping'
                            ? 'animate-house-pet-sleep'
                            : petAction === 'petted' || petAction === 'walking'
                            ? 'animate-house-pet-play'
                            : 'animate-house-pet-breathe'
                        }
                      >
                        <PiggyCharacter
                          species={game.pet.species}
                          growth={game.pet.growth}
                          roundness={game.pet.roundness}
                          action={isPetMoving ? 'walking' : petAction}
                          expression={petExpression}
                          equipped={game.pet.accessories}
                          interactive={false}
                          size={50}
                        />
                      </div>
                      <div className="w-9 h-2 rounded-full bg-[#4A3531]/15 blur-[1px] -mt-1.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagonal Soft Sunlight Beams Spanning Window -> Floor (透出柔和陽光光束) */}
              <svg
                viewBox="0 0 400 320"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 w-full h-full z-[25]"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="cozySunBeam" x1="0.72" y1="0.08" x2="0.32" y2="0.96">
                    <stop offset="0%" stopColor="#FFF7C8" stopOpacity="0.44" />
                    <stop offset="52%" stopColor="#FFF7D6" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#FFF9E6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points="274,22 356,22 238,314 116,314" fill="url(#cozySunBeam)" />
                <polygon points="256,30 272,30 144,308 96,308" fill="url(#cozySunBeam)" opacity="0.65" />
                <circle cx="292" cy="86" r="2.2" fill="#FFFDF4" opacity="0.68" />
                <circle cx="256" cy="134" r="1.8" fill="#FFFDF4" opacity="0.58" />
                <circle cx="222" cy="186" r="2.4" fill="#FFFDF4" opacity="0.5" />
                <circle cx="192" cy="238" r="1.7" fill="#FFFDF4" opacity="0.42" />
              </svg>
            </div>
          </section>

          {/* Selected Placed Furniture Inspector */}
          {selectedPlaced && selectedItemDef && (
            <section className="rounded-3xl bg-[#FFF6FA] border-2 border-[#F5C6D6] p-3.5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#F2D5DF] flex items-center justify-center shrink-0">
                    <FurnitureGraphic itemId={selectedItemDef.id} size={40} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-[#4A3531] truncate">
                      {selectedItemDef.name}
                    </h3>
                    <p className="text-[11px] font-bold text-[#826862]">
                      {ROOM_ZONES[selectedPlaced.zone].name} ·{' '}
                      {FURNITURE_CATEGORY_LABELS[selectedItemDef.category]}
                      {selectedPlaced.placedBy ? ` · 由 ${selectedPlaced.placedBy} 擺放` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInstanceId(null)}
                  aria-label="取消選取家具"
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-white text-[#6E544E] flex items-center justify-center shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTryFurnitureWithPet(selectedPlaced)}
                  className="min-h-[44px] rounded-xl bg-[#FFEAF0] border border-[#F4C4D4] text-xs font-extrabold text-[#B83B64] inline-flex items-center justify-center gap-1 active:scale-95 transition whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>讓{game.pet.name}試用</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMovingInstanceId(selectedPlaced.instanceId);
                    setPlacingItemId(null);
                  }}
                  className="min-h-[44px] rounded-xl bg-white border border-[#E7CFD7] text-xs font-extrabold text-[#5A3E36] inline-flex items-center justify-center gap-1 active:scale-95 transition whitespace-nowrap"
                >
                  <Move className="w-3.5 h-3.5 shrink-0" />
                  <span>移動／交換位置</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStow(selectedPlaced.instanceId)}
                  className="min-h-[44px] rounded-xl bg-[#EEF8F4] border border-[#B2E3CF] text-xs font-extrabold text-[#256D57] inline-flex items-center justify-center gap-1 active:scale-95 transition whitespace-nowrap"
                >
                  <Package className="w-3.5 h-3.5 shrink-0" />
                  <span>收進收納袋</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSell(selectedItemDef.id)}
                  className="min-h-[44px] rounded-xl bg-[#FFF3D8] border border-[#F2CE6D] text-xs font-extrabold text-[#8A5610] inline-flex items-center justify-center gap-1 active:scale-95 transition whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="tabular-nums">出售 +{selectedItemDef.sellPrice} 幣</span>
                </button>
              </div>

              {/* Furniture Notes */}
              <div className="rounded-2xl bg-white border border-[#F3DCE4] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#B83B64]">
                  <MessageCircleHeart className="w-4 h-4" />
                  <span>家具悄悄話筆記</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {QUICK_NOTE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddFurnitureNote(preset)}
                      className="min-h-[36px] px-2.5 rounded-xl bg-[#FFF4F8] border border-[#F6CEDB] text-[11px] font-extrabold text-[#B83B64] hover:bg-[#FFE8F0] transition"
                    >
                      ＋「{preset}」
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={80}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="在這件家具寫一句話給夥伴…"
                    className="flex-1 min-w-0 min-h-[44px] rounded-xl bg-[#FFFDF8] border border-[#EAD4DC] px-2.5 text-sm font-medium text-[#4A3531] placeholder:text-xs placeholder:text-[#B5A19B] focus:outline-none focus:border-[#FF7A9E]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFurnitureNote(noteInput)}
                    className="min-h-[44px] px-3 rounded-xl bg-[#FF7A9E] text-white text-xs font-extrabold inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>貼上</span>
                  </button>
                </div>

                {house.furnitureNotes.filter((n) => n.itemId === selectedItemDef.id).length > 0 && (
                  <div className="space-y-1.5 pt-1 max-h-28 overflow-y-auto">
                    {house.furnitureNotes
                      .filter((n) => n.itemId === selectedItemDef.id)
                      .map((note) => (
                        <div
                          key={note.id}
                          className="rounded-xl bg-[#FFF8F4] border border-[#F3E1DA] px-2.5 py-1.5 text-[11px]"
                        >
                          <span className="font-extrabold text-[#B83B64]">{note.authorName}：</span>
                          <span className="text-[#4A3531] font-medium">{note.content}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Quick Place Sheet when user tapped an empty cell */}
          {quickPlaceCell && (
            <section className="rounded-3xl bg-[#F4FBF8] border-2 border-[#BCE6D5] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-extrabold text-[#1F6B54]">
                  擺放家具到 {ROOM_ZONES[getZoneForCell(quickPlaceCell.x, quickPlaceCell.y)].name} (
                  {quickPlaceCell.x + 1},{quickPlaceCell.y + 1})
                </h3>
                <button
                  type="button"
                  onClick={() => setQuickPlaceCell(null)}
                  className="min-h-[36px] px-2.5 rounded-xl bg-white border border-[#CFECE0] text-xs font-extrabold text-[#6E544E] shrink-0"
                >
                  關閉
                </button>
              </div>

              {stowedItems.length === 0 ? (
                <div className="text-center py-2 space-y-2">
                  <p className="text-xs text-[#6E544E]">
                    收納袋裡目前沒有尚未擺放的家具喔！
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickPlaceCell(null);
                      setTab('shop');
                    }}
                    className="min-h-[44px] px-4 rounded-xl bg-[#FF7A9E] text-white text-xs font-extrabold"
                  >
                    前往工坊選購家具
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {[...stowedItems]
                    .sort((a, b) => {
                      const targetZone = getZoneForCell(quickPlaceCell.x, quickPlaceCell.y);
                      const aMatch = a.zone === targetZone ? 0 : 1;
                      const bMatch = b.zone === targetZone ? 0 : 1;
                      return aMatch - bMatch;
                    })
                    .map((item) => {
                      const targetZone = getZoneForCell(quickPlaceCell.x, quickPlaceCell.y);
                      const zoneMatched = item.zone === targetZone;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handlePlaceAt(item.id, quickPlaceCell.x, quickPlaceCell.y)
                          }
                          className={`min-h-[76px] rounded-2xl border p-2 flex flex-col items-center justify-center gap-1 active:scale-95 transition ${
                            zoneMatched
                              ? 'bg-white border-2 border-[#5CC9A7]'
                              : 'bg-white border-[#CFECE0]'
                          }`}
                        >
                          <FurnitureGraphic itemId={item.id} size={32} />
                          <span className="text-[11px] font-extrabold text-[#4A3531] truncate w-full text-center">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-bold text-[#256D57]">
                            {zoneMatched ? '★ 推薦本區' : ROOM_ZONES[item.zone].name}
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </section>
          )}

          {/* Stowed Furniture Bag with Zone Filter */}
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE2DC] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold text-[#4A3531]">
                收納袋家具 ({stowedItems.length} 款待擺放)
              </h3>
              <button
                type="button"
                onClick={() => setTab('shop')}
                className="min-h-[36px] px-2 text-xs font-extrabold text-[#D64470] whitespace-nowrap"
              >
                去逛工坊 ›
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { key: 'all', label: '全部' },
                  { key: 'sleep', label: '🌙 睡眠' },
                  { key: 'decor', label: '🎀 裝飾' },
                  { key: 'play', label: '⚽ 遊玩' },
                  { key: 'dining', label: '🍽️ 用餐' },
                ] as { key: 'all' | RoomZone; label: string }[]
              ).map((zf) => (
                <button
                  key={zf.key}
                  type="button"
                  onClick={() => setStowedZoneFilter(zf.key)}
                  className={`min-h-[36px] px-2.5 rounded-xl text-[11px] font-extrabold border transition whitespace-nowrap ${
                    stowedZoneFilter === zf.key
                      ? 'bg-[#FF7A9E] text-white border-[#FF7A9E]'
                      : 'bg-[#FFF9F2] text-[#6E544E] border-[#EAD9D0]'
                  }`}
                >
                  {zf.label}
                </button>
              ))}
            </div>

            {filteredStowedItems.length === 0 ? (
              <p className="text-xs text-[#826862] py-1">
                {stowedItems.length === 0
                  ? '目前沒有尚未擺放的家具，可到「工坊」購買／手作，或點擊房間內家具收起調整！'
                  : '此分區分類下目前沒有待擺放的家具。'}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {filteredStowedItems.map((item) => {
                  const stowedCount = getStowedCountByItem(house, item.id);
                  const isPlacing = placingItemId === item.id;
                  const isFav = evaluateItemPreference(game.pet.species, item.id) === 'favorite';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', item.id);
                        setMovingInstanceId(null);
                        setSelectedInstanceId(null);
                        setDraggingStowedId(item.id);
                      }}
                      onDragEnd={() => {
                        setDraggingStowedId(null);
                        setDragOverCell(null);
                      }}
                      onClick={() => {
                        setMovingInstanceId(null);
                        setSelectedInstanceId(null);
                        setPlacingItemId(isPlacing ? null : item.id);
                      }}
                      className={`min-h-[78px] rounded-2xl p-2 border-2 flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-grab active:cursor-grabbing ${
                        isPlacing || draggingStowedId === item.id
                          ? 'bg-[#FFEAF0] border-[#FF7A9E]'
                          : isFav
                          ? 'bg-[#FFF7FA] border-[#F4C4D4]'
                          : 'bg-[#FFF9F2] border-[#EFE0D7]'
                      }`}
                    >
                      <FurnitureGraphic itemId={item.id} size={32} />
                      <span className="text-[11px] font-extrabold text-[#4A3531] truncate w-full text-center">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-bold text-[#826862] tabular-nums">
                        {isPlacing
                          ? '點虛線圓圈'
                          : `${isFav ? '♥ ' : ''}可放 ${stowedCount}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Switch Unlocked Wallpapers & Floorings */}
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE2DC] p-3.5 space-y-2.5">
            <h3 className="text-xs font-extrabold text-[#4A3531]">快速切換已擁有壁紙與地板</h3>
            <div className="grid grid-cols-2 gap-2">
              {WALLPAPERS.filter((w) => house.unlockedWallpapers.includes(w.id)).map((w) => {
                const active = house.roomLayout.wallpaperId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleWallpaperAction(w.id)}
                    className={`min-h-[44px] rounded-xl px-2.5 py-1.5 border text-left text-xs font-extrabold flex items-center justify-between gap-1 ${
                      active
                        ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#B83B64]'
                        : 'bg-[#FAF5F0] border-[#E8D8CE] text-[#5A423C]'
                    }`}
                  >
                    <span className="truncate">
                      {w.emoji} {w.name}
                    </span>
                    {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
              {FLOORINGS.filter((f) => house.unlockedFloorings.includes(f.id)).map((f) => {
                const active = house.roomLayout.flooringId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFlooringAction(f.id)}
                    className={`min-h-[44px] rounded-xl px-2.5 py-1.5 border text-left text-xs font-extrabold flex items-center justify-between gap-1 ${
                      active
                        ? 'bg-[#E8F8F2] border-[#5CC9A7] text-[#1F6B54]'
                        : 'bg-[#FAF5F0] border-[#E8D8CE] text-[#5A423C]'
                    }`}
                  >
                    <span className="truncate">
                      {f.emoji} {f.name}
                    </span>
                    {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: YARD & FARM LANDSCAPE */}
      {tab === 'yard' && (
        <div className="space-y-3.5">
          <FarmSceneBanner
            house={house}
            pet={game.pet}
            ingredients={game.ingredients}
            soundEnabled={game.soundEnabled}
            onEditHouseName={() => {
              setHouseNameInput(house.houseName);
              setYardRenameOpen(true);
            }}
            onGoToFarm={onGoToFarm}
          />

          {/* Storybook Cottage Signboard Rename Modal */}
          {yardRenameOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-label="修改小屋名稱"
              onClick={() => setYardRenameOpen(false)}
            >
              <form
                onSubmit={handleSaveHouseName}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl bg-[#FFFDF8] border-2 border-[#6B5344] shadow-[0_6px_0_#A67A50] p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-[#4A3531]">
                    🪧 修改小屋招牌名稱
                  </h3>
                  <button
                    type="button"
                    onClick={() => setYardRenameOpen(false)}
                    aria-label="關閉改名視窗"
                    className="min-w-[36px] min-h-[36px] rounded-xl bg-[#F6ECE4] text-[#5A3E36] inline-flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={14}
                  value={houseNameInput}
                  onChange={(e) => setHouseNameInput(e.target.value)}
                  placeholder="輸入小屋名稱（最多14字）"
                  autoFocus
                  className="w-full min-h-[44px] rounded-2xl bg-white border-2 border-[#D9BFA9] px-3 text-sm font-bold text-[#4A3531] focus:outline-none focus:border-[#FF7A9E]"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 min-h-[44px] rounded-2xl bg-[#5CC9A7] border-2 border-[#6B5344] shadow-[0_3px_0_#3BA886] text-white text-xs font-extrabold active:translate-y-0.5 transition"
                  >
                    儲存新名稱
                  </button>
                  <button
                    type="button"
                    onClick={() => setYardRenameOpen(false)}
                    className="min-h-[44px] px-4 rounded-2xl bg-[#F5EAE1] border-2 border-[#6B5344] text-xs font-extrabold text-[#5A3E36]"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment Source Toggle */}
          <section className="rounded-2xl bg-[#FFF6EA] border border-[#F0D9C0] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[#7D635D]">
              <span>庭院建設付款方式</span>
              <span className="tabular-nums">
                個人 {game.coins} 幣 · 金庫 {house.treasuryCoins} 幣
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-[#F2E5DE] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPaySource('personal')}
                className={`min-h-[44px] rounded-lg text-xs font-extrabold transition ${
                  paySource === 'personal'
                    ? 'bg-white text-[#9D5B12] shadow-xs'
                    : 'text-[#6E544E]'
                }`}
              >
                🪙 個人金幣 ({game.coins})
              </button>
              <button
                type="button"
                onClick={() => setPaySource('treasury')}
                className={`min-h-[44px] rounded-lg text-xs font-extrabold transition ${
                  paySource === 'treasury'
                    ? 'bg-white text-[#256D57] shadow-xs'
                    : 'text-[#6E544E]'
                }`}
              >
                💞 共同金庫 ({house.treasuryCoins})
              </button>
            </div>
          </section>

          {/* Farm Plot Expansion Card */}
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#D9BFA9] p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-[#4A3531]">
                🌾 農地開墾進度（{house.unlockedFarmPlots} / 8 塊）
              </h3>
              <p className="text-[11px] text-[#7D635D] mt-0.5">
                {nextExpandPlotNumber
                  ? `可開墾第 ${nextExpandPlotNumber} 塊農地，加快食堂食材與手作家具產出！`
                  : '已經開墾至全部 8 塊豪華莊園農地！'}
              </p>
            </div>
            {nextExpandPlotNumber ? (
              <button
                type="button"
                disabled={availableYardCoins < nextExpandCost}
                onClick={() => onExpandFarmPlot(paySource)}
                className={`min-h-[44px] px-3.5 rounded-2xl text-xs font-extrabold shrink-0 whitespace-nowrap transition ${
                  availableYardCoins >= nextExpandCost
                    ? 'bg-[#F8C956] text-[#4A3531] hover:bg-[#F3BE40] active:scale-95'
                    : 'bg-[#EAE0D9] text-[#9E8B84] cursor-not-allowed'
                }`}
              >
                開墾 ({nextExpandCost} 幣)
              </button>
            ) : (
              <span className="text-xs font-extrabold text-[#256D57] shrink-0">已滿格</span>
            )}
          </section>

          {/* Outdoor Farm Decorations */}
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE0D8] p-3.5 space-y-2.5">
            <div>
              <h3 className="text-sm font-extrabold text-[#4A3531]">
                🌼 庭院景觀佈置（圍欄、花圃與招牌）
              </h3>
              <p className="text-[11px] text-[#7D635D]">
                購買後可自由切換擺設，即時呈現在庭院預覽與農場中！
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FARM_DECORATIONS.map((dec) => {
                const owned = house.ownedFarmDecorations.includes(dec.id);
                const active =
                  house.activeFarmDecor.fenceId === dec.id ||
                  house.activeFarmDecor.flowerbedId === dec.id ||
                  house.activeFarmDecor.signId === dec.id;
                const canBuy = owned || availableYardCoins >= dec.price;

                return (
                  <article
                    key={dec.id}
                    className={`rounded-2xl border p-3 flex flex-col justify-between gap-2 ${
                      active
                        ? 'bg-[#FFF3F7] border-[#FF8AA8]'
                        : owned
                        ? 'bg-[#F5FBF8] border-[#CBE8DB]'
                        : 'bg-[#FAF6F2] border-[#E7DCD5]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-[#4A3531]">
                        {dec.emoji} {dec.name}
                      </div>
                      <p className="text-[10px] text-[#7D635D] mt-0.5 leading-snug">
                        {dec.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!canBuy}
                      onClick={() => onToggleFarmDecoration(dec.id, paySource)}
                      className={`w-full min-h-[44px] rounded-xl text-xs font-extrabold transition ${
                        active
                          ? 'bg-[#FF7A9E] text-white'
                          : owned
                          ? 'bg-white border border-[#B8DFCE] text-[#256D57]'
                          : canBuy
                          ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E]'
                          : 'bg-[#EAE0D9] text-[#9E8B84] cursor-not-allowed'
                      }`}
                    >
                      {active ? '擺設中 · 點擊收起' : owned ? '擺上庭院' : `購買 (${dec.price} 幣)`}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Farm Upgrades */}
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#CFECE0] p-3.5 space-y-2.5">
            <div>
              <h3 className="text-sm font-extrabold text-[#4A3531]">🚿 農園設施升級</h3>
              <p className="text-[11px] text-[#7D635D]">
                灑水器、玻璃溫室與小倉庫可大幅提升作物收成效率。
              </p>
            </div>
            <div className="space-y-2">
              {FARM_UPGRADES.map((upg) => {
                const curLvl =
                  upg.id === 'sprinkler'
                    ? house.farmUpgrades.sprinklerLevel
                    : upg.id === 'greenhouse'
                    ? house.farmUpgrades.greenhouseLevel
                    : house.farmUpgrades.storageLevel;
                const isMax = curLvl >= upg.maxLevel;
                const price = upg.prices[curLvl] ?? upg.prices[upg.prices.length - 1];
                const canUpgrade = !isMax && availableYardCoins >= price;

                return (
                  <div
                    key={upg.id}
                    className="rounded-2xl bg-[#F5FBF8] border border-[#CBE8DB] p-3 flex items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-[#4A3531]">
                        {upg.emoji} {upg.name}
                        {upg.maxLevel > 1 ? ` (Lv.${curLvl}/${upg.maxLevel})` : ''}
                      </div>
                      <p className="text-[10px] text-[#6E544E] mt-0.5 leading-snug">
                        {upg.description}
                      </p>
                      {!isMax && upg.effectSummaries[curLvl] && (
                        <p className="text-[10px] font-extrabold text-[#1F6B54] mt-0.5">
                          下一級：{upg.effectSummaries[curLvl]}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isMax || !canUpgrade}
                      onClick={() => onUpgradeFarmFacility(upg.id, paySource)}
                      className={`min-h-[44px] px-3 rounded-xl text-xs font-extrabold shrink-0 whitespace-nowrap transition ${
                        isMax
                          ? 'bg-[#E3F5ED] text-[#256D57]'
                          : canUpgrade
                          ? 'bg-[#5CC9A7] text-white active:scale-95'
                          : 'bg-[#EAE0D9] text-[#9E8B84] cursor-not-allowed'
                      }`}
                    >
                      {isMax ? '已啟用' : `${price} 金幣`}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: FURNITURE SHOP, SURFACES, DETAILED THEME SETS & CRAFTING */}
      {tab === 'shop' && (
        <div className="space-y-3.5">
          {/* Payment Source Toggle */}
          <section className="rounded-2xl bg-[#FFF6EA] border border-[#F0D9C0] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[#7D635D]">
              <span>工坊付款方式切換</span>
              <span className="tabular-nums">
                個人 {game.coins} 幣 · 金庫 {house.treasuryCoins} 幣
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-[#F2E5DE] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPaySource('personal')}
                className={`min-h-[44px] rounded-lg text-xs font-extrabold transition ${
                  paySource === 'personal'
                    ? 'bg-white text-[#9D5B12] shadow-xs'
                    : 'text-[#6E544E]'
                }`}
              >
                🪙 個人金幣 ({game.coins})
              </button>
              <button
                type="button"
                onClick={() => setPaySource('treasury')}
                className={`min-h-[44px] rounded-lg text-xs font-extrabold transition ${
                  paySource === 'treasury'
                    ? 'bg-white text-[#256D57] shadow-xs'
                    : 'text-[#6E544E]'
                }`}
              >
                💞 共同金庫 ({house.treasuryCoins})
              </button>
            </div>
          </section>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { key: 'all', label: '全部家具' },
                { key: 'toy', label: '🧸 玩具專區' },
                { key: 'sleep', label: '🌙 睡眠區' },
                { key: 'play', label: '⚽ 遊玩區' },
                { key: 'dining', label: '🍽️ 用餐區' },
                { key: 'decor', label: '🎀 裝飾區' },
                { key: 'surfaces', label: '🎨 壁紙地板' },
                { key: 'themes', label: '✨ 主題套裝' },
                { key: 'craft', label: '🌾 作物手作' },
              ] as { key: ShopFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setShopFilter(f.key)}
                className={`min-h-[40px] px-3 rounded-xl text-xs font-extrabold border transition whitespace-nowrap ${
                  shopFilter === f.key
                    ? 'bg-[#FF7A9E] text-white border-[#FF7A9E]'
                    : 'bg-[#FFF9F2] text-[#6E544E] border-[#EAD9D0]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Detailed Theme Sets */}
          {shopFilter === 'themes' && (
            <div className="space-y-3">
              {THEME_SETS.map((theme) => {
                const completed = house.completedThemeSets.includes(theme.id);
                const hasWall = house.unlockedWallpapers.includes(theme.wallpaperId);
                const hasFloor = house.unlockedFloorings.includes(theme.flooringId);
                const ownedPieceCount =
                  theme.itemIds.filter((id) => house.collectedFurnitureIds.includes(id)).length +
                  (hasWall ? 1 : 0) +
                  (hasFloor ? 1 : 0);
                const totalPieces = theme.itemIds.length + 2;
                const availableCoins =
                  paySource === 'treasury' ? house.treasuryCoins : game.coins;
                const canBuyBundle = completed || availableCoins >= theme.bundlePrice;
                const wall = WALLPAPER_BY_ID[theme.wallpaperId];
                const floor = FLOORING_BY_ID[theme.flooringId];

                return (
                  <article
                    key={theme.id}
                    className={`rounded-3xl border-2 p-3.5 space-y-3 ${theme.accentCardClass}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#4A3531]">
                          {theme.emoji} {theme.name}主題套裝
                        </h3>
                        <p className="text-[11px] font-bold text-[#7D635D] mt-0.5">
                          {theme.description}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-[#D64470] tabular-nums shrink-0">
                        {ownedPieceCount}/{totalPieces} 件
                      </span>
                    </div>

                    {/* Individual Checklist inside Theme Set */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {wall && (
                        <button
                          type="button"
                          onClick={() => handleWallpaperAction(wall.id)}
                          className={`min-h-[44px] rounded-xl px-2.5 py-1.5 border text-left text-[11px] font-extrabold flex items-center justify-between gap-1 ${
                            hasWall
                              ? 'bg-white/90 border-[#AEE3D0] text-[#1F6B54]'
                              : 'bg-white/65 border-[#EAD4DC] text-[#5A423C]'
                          }`}
                        >
                          <span className="truncate">
                            {wall.emoji} {wall.name}
                          </span>
                          <span className="shrink-0 tabular-nums">
                            {hasWall ? '✓' : `${wall.price}幣`}
                          </span>
                        </button>
                      )}
                      {floor && (
                        <button
                          type="button"
                          onClick={() => handleFlooringAction(floor.id)}
                          className={`min-h-[44px] rounded-xl px-2.5 py-1.5 border text-left text-[11px] font-extrabold flex items-center justify-between gap-1 ${
                            hasFloor
                              ? 'bg-white/90 border-[#AEE3D0] text-[#1F6B54]'
                              : 'bg-white/65 border-[#EAD4DC] text-[#5A423C]'
                          }`}
                        >
                          <span className="truncate">
                            {floor.emoji} {floor.name}
                          </span>
                          <span className="shrink-0 tabular-nums">
                            {hasFloor ? '✓' : `${floor.price}幣`}
                          </span>
                        </button>
                      )}
                      {theme.itemIds.map((itemId) => {
                        const def = ROOM_ITEM_BY_ID[itemId];
                        if (!def) return null;
                        const owned = house.collectedFurnitureIds.includes(itemId);
                        return (
                          <button
                            key={itemId}
                            type="button"
                            disabled={owned}
                            onClick={() => handleBuyFurniture(itemId)}
                            className={`min-h-[44px] rounded-xl px-2 py-1.5 border text-left text-[11px] font-extrabold flex items-center justify-between gap-1.5 ${
                              owned
                                ? 'bg-white/90 border-[#AEE3D0] text-[#1F6B54]'
                                : 'bg-white/65 border-[#EAD4DC] text-[#5A423C] hover:bg-white'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1 min-w-0">
                              <FurnitureGraphic itemId={def.id} size={22} />
                              <span className="truncate">{def.name}</span>
                            </span>
                            <span className="shrink-0 tabular-nums">
                              {owned ? '✓' : `${def.price}幣`}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[11px] font-extrabold text-[#9D5B12]">
                      完成獎勵：專屬稱號 ＋ 特殊拍照姿勢 📸
                    </p>

                    <div className="grid grid-cols-1 gap-2">
                      {!completed ? (
                        <button
                          type="button"
                          disabled={!canBuyBundle}
                          onClick={() => handleBuyTheme(theme.id)}
                          className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                            canBuyBundle
                              ? 'bg-[#FF7A9E] text-white shadow-[0_3px_0_#D9577B] active:translate-y-0.5'
                              : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span className="tabular-nums">
                            全套優惠打包購入 ({theme.bundlePrice} 金幣)
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyThemeLayout(theme.id)}
                          className="w-full min-h-[44px] rounded-2xl bg-[#5CC9A7] text-white text-xs font-extrabold shadow-[0_3px_0_#3BA886] flex items-center justify-center gap-1.5 active:translate-y-0.5 transition"
                        >
                          <Wand2 className="w-4 h-4 shrink-0" />
                          <span>已收集完成 · 一鍵套用此主題佈置並前往房間</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Wallpapers & Floorings */}
          {shopFilter === 'surfaces' && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-[#4A3531]">4 款牆面壁紙</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {WALLPAPERS.map((wall) => {
                  const owned = house.unlockedWallpapers.includes(wall.id);
                  const active = house.roomLayout.wallpaperId === wall.id;
                  const avail = paySource === 'treasury' ? house.treasuryCoins : game.coins;
                  const canAct = owned || avail >= wall.price;
                  return (
                    <article
                      key={wall.id}
                      className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE0D8] p-3 space-y-2"
                    >
                      <div
                        className="h-12 rounded-2xl border border-[#EAD4CA] flex items-center justify-center text-xl"
                        style={{ background: wall.wallBgStyle }}
                      >
                        {wall.emoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#4A3531]">{wall.name}</h4>
                        <p className="text-[10px] text-[#7D635D] leading-snug mt-0.5">
                          {wall.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!canAct}
                        onClick={() => handleWallpaperAction(wall.id)}
                        className={`w-full min-h-[44px] rounded-xl text-xs font-extrabold transition ${
                          active
                            ? 'bg-[#5CC9A7] text-white'
                            : owned
                            ? 'bg-[#FFEAF0] text-[#B83B64]'
                            : canAct
                            ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E]'
                            : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                        }`}
                      >
                        {active ? '使用中' : owned ? '套用壁紙' : `購買 (${wall.price} 幣)`}
                      </button>
                    </article>
                  );
                })}
              </div>

              <h3 className="text-xs font-extrabold text-[#4A3531] pt-1">4 款室內地板</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {FLOORINGS.map((floor) => {
                  const owned = house.unlockedFloorings.includes(floor.id);
                  const active = house.roomLayout.flooringId === floor.id;
                  const avail = paySource === 'treasury' ? house.treasuryCoins : game.coins;
                  const canAct = owned || avail >= floor.price;
                  return (
                    <article
                      key={floor.id}
                      className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE0D8] p-3 space-y-2"
                    >
                      <div
                        className="h-12 rounded-2xl border border-[#EAD4CA] flex items-center justify-center text-xl"
                        style={{ background: floor.floorBgStyle }}
                      >
                        {floor.emoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#4A3531]">{floor.name}</h4>
                        <p className="text-[10px] text-[#7D635D] leading-snug mt-0.5">
                          {floor.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!canAct}
                        onClick={() => handleFlooringAction(floor.id)}
                        className={`w-full min-h-[44px] rounded-xl text-xs font-extrabold transition ${
                          active
                            ? 'bg-[#5CC9A7] text-white'
                            : owned
                            ? 'bg-[#E8F8F2] text-[#1F6B54]'
                            : canAct
                            ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E]'
                            : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                        }`}
                      >
                        {active ? '使用中' : owned ? '鋪設地板' : `購買 (${floor.price} 幣)`}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Furniture Catalog List */}
          {shopFilter !== 'themes' && shopFilter !== 'surfaces' && (
            <div className="space-y-2.5">
              {filteredShopItems.map((item) => {
                const ownedCount = house.ownedFurnitureCounts[item.id] ?? 0;
                const stowedCount = getStowedCountByItem(house, item.id);
                const availCoins =
                  paySource === 'treasury' ? house.treasuryCoins : game.coins;
                const canBuy = availCoins >= item.price;
                const isFav = evaluateItemPreference(game.pet.species, item.id) === 'favorite';

                const craftEntries = item.craftIngredients
                  ? (Object.entries(item.craftIngredients) as [IngredientId, number][])
                  : [];
                const canCraft =
                  craftEntries.length > 0 &&
                  craftEntries.every(([id, need]) => (game.ingredients[id] ?? 0) >= need);

                const themeObj = item.themeId
                  ? THEME_SETS.find((t) => t.id === item.themeId) ?? null
                  : null;

                return (
                  <article
                    key={item.id}
                    className={`rounded-3xl bg-[#FFFDF8] border-2 p-3 space-y-2.5 ${
                      isFav ? 'border-[#F4C4D4]' : 'border-[#EFE0D8]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-13 h-13 rounded-2xl bg-[#FFF7EC] border border-[#F1DAC5] flex items-center justify-center shrink-0">
                        <FurnitureGraphic itemId={item.id} size={42} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-extrabold text-[#4A3531] truncate">
                            {item.name}
                          </h4>
                          <span className="text-[11px] font-extrabold text-[#9D5B12] tabular-nums shrink-0">
                            {item.tier === 'advanced' ? '進階' : '普通'} · {item.price} 幣
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-[#826862] mt-0.5 tabular-nums">
                          {ROOM_ZONES[item.zone].name} · {FURNITURE_CATEGORY_LABELS[item.category]}
                          {themeObj ? ` · ${themeObj.name}` : ''}
                          {isFav ? ' · ♥ 寵物最愛' : ''}
                          {ownedCount > 0 ? ` · 已擁有 ${ownedCount}` : ''}
                        </p>
                        <p className="text-xs text-[#6E544E] mt-0.5 leading-snug">
                          {item.description}
                        </p>
                        {craftEntries.length > 0 && (
                          <p className="text-[11px] font-extrabold text-[#256D57] mt-1 tabular-nums">
                            作物手作材料：
                            {craftEntries
                              .map(
                                ([id, need]) =>
                                  `${INGREDIENTS[id].emoji}${INGREDIENTS[id].name} ${game.ingredients[id] ?? 0}/${need}`
                              )
                              .join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => handleBuyFurniture(item.id)}
                        className={`flex-1 min-w-[120px] min-h-[44px] rounded-2xl px-3 text-xs font-extrabold inline-flex items-center justify-center gap-1 transition ${
                          canBuy
                            ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E] hover:bg-[#FFEAA8] active:scale-95'
                            : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5 shrink-0" />
                        <span className="tabular-nums">購買 ({item.price} 幣)</span>
                      </button>

                      {craftEntries.length > 0 && (
                        <button
                          type="button"
                          disabled={!canCraft}
                          onClick={() => handleCraftFurniture(item.id)}
                          className={`min-h-[44px] px-3 rounded-2xl text-xs font-extrabold inline-flex items-center justify-center gap-1 transition ${
                            canCraft
                              ? 'bg-[#5CC9A7] text-white hover:bg-[#49B895] active:scale-95'
                              : 'bg-[#E9F3EE] text-[#8EA99E] cursor-not-allowed'
                          }`}
                        >
                          <Hammer className="w-3.5 h-3.5 shrink-0" />
                          <span>作物手作</span>
                        </button>
                      )}

                      {stowedCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPlacingItemId(item.id);
                            setTab('room');
                          }}
                          className="min-h-[44px] px-3 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold inline-flex items-center gap-1 active:scale-95 transition"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                          <span>去擺放</span>
                        </button>
                      )}

                      {ownedCount > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSell(item.id)}
                          className="min-h-[44px] px-3 rounded-2xl bg-[#FAF1ED] border border-[#E7D3CA] text-xs font-extrabold text-[#7D635D] tabular-nums"
                        >
                          出售 +{item.sellPrice}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CO-OP TREASURY, GOALS & MILESTONES */}
      {tab === 'coop' && (
        <div className="space-y-3.5">
          {/* Shared Room Banner */}
          <section className="rounded-3xl bg-gradient-to-r from-[#FFEAF0] to-[#E8F8F2] border-2 border-[#F2D5DF] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2.5">
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#B83B64] flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 shrink-0" />
                  <span>{sharedRoom ? '兩人共養共同家園同步中' : '單人準備模式（隨時可邀夥伴）'}</span>
                </div>
                <p className="text-[11px] text-[#6E544E] mt-0.5">
                  {sharedRoom
                    ? '房間佈置、庭院農園與共同金庫會與夥伴即時同步！'
                    : '存入的共同金庫與家園佈置會在建立共養後完整延續給兩人。'}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSharedPet}
                className="min-h-[44px] px-3 rounded-2xl bg-white border border-[#F2C3D2] text-xs font-extrabold text-[#B83B64] shrink-0 whitespace-nowrap"
              >
                {sharedRoom ? '共養管理' : '建立 / 加入'}
              </button>
            </div>

            {sharedRoom && onOpenCoopGames && (
              <button
                type="button"
                onClick={onOpenCoopGames}
                className="w-full min-h-[44px] rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_2px_0_#D9577B] active:scale-[0.99] transition"
              >
                🎮 開啟共養「合作遊戲」（90 秒一起布置 / 農場接力）
              </button>
            )}
          </section>

          {/* Shared Treasury */}
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#BCE6D5] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#4A3531]">💞 我們的共同金庫</h3>
                <p className="text-[11px] text-[#7D635D]">
                  兩人都能存錢進去，用來一起買家具、壁紙或擴建庭院農園！
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-extrabold text-[#1F6B54] tabular-nums">
                  {house.treasuryCoins}
                </div>
                <div className="text-[10px] font-bold text-[#7D635D]">金庫餘額</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  disabled={game.coins < amt}
                  onClick={() => handleDepositTreasury(amt)}
                  className={`min-h-[44px] rounded-2xl text-xs font-extrabold transition tabular-nums ${
                    game.coins >= amt
                      ? 'bg-[#E6F8F0] border border-[#9BE0C4] text-[#1F6B54] hover:bg-[#D5F3E6] active:scale-95'
                      : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                  }`}
                >
                  存入 +{amt} 幣
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min={10}
                max={9999}
                value={customDepositInput}
                onChange={(e) => setCustomDepositInput(e.target.value)}
                aria-label="自訂存入金幣"
                className="flex-1 min-w-0 min-h-[44px] rounded-2xl bg-white border border-[#CFECE0] px-3 text-sm font-extrabold text-[#4A3531] tabular-nums focus:outline-none focus:border-[#5CC9A7]"
              />
              <button
                type="button"
                onClick={() => handleDepositTreasury(Number(customDepositInput) || 0)}
                className="min-h-[44px] px-4 rounded-2xl bg-[#5CC9A7] text-white text-xs font-extrabold shadow-[0_2px_0_#3BA886] shrink-0 whitespace-nowrap"
              >
                自訂存入
              </button>
            </div>

            {house.treasuryHistory.length > 0 && (
              <div className="pt-2 border-t border-[#E8F3EE] space-y-1 max-h-24 overflow-y-auto">
                <p className="text-[10px] font-extrabold text-[#7D635D]">最近金庫存入紀錄</p>
                {house.treasuryHistory.slice(0, 6).map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between text-[11px] font-bold text-[#5A423C]"
                  >
                    <span>{h.authorName} 存入共同基金</span>
                    <span className="text-[#1F6B54] tabular-nums">+{h.amount} 金幣</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Active Shared Goal */}
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F2D59B] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#4A3531]">🎯 兩人共同目標</h3>
              <span className="text-xs font-extrabold text-[#9D5B12] tabular-nums">
                {Math.min(house.treasuryCoins, activeGoal.targetCoins)} / {activeGoal.targetCoins} 幣
              </span>
            </div>

            <div className="rounded-2xl bg-[#FFF8E8] border border-[#F3DFAF] p-3 space-y-2">
              <p className="text-xs font-extrabold text-[#4A3531]">{activeGoal.title}</p>
              <p className="text-[11px] text-[#7D635D] leading-snug">{activeGoal.description}</p>
              <div className="w-full h-2.5 rounded-full bg-[#F4E6C8] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#F8C956] to-[#FF7A9E] transition-all duration-300"
                  style={{ width: `${goalPct}%` }}
                />
              </div>
              <p className="text-[11px] font-extrabold text-[#256D57]">
                獎勵：{activeGoal.rewardSummary}
              </p>

              <button
                type="button"
                disabled={isGoalDone || house.treasuryCoins < activeGoal.targetCoins}
                onClick={handleCompleteGoal}
                className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold transition ${
                  isGoalDone
                    ? 'bg-[#E5F2ED] text-[#6B9687] cursor-not-allowed'
                    : house.treasuryCoins >= activeGoal.targetCoins
                    ? 'bg-[#FF7A9E] text-white shadow-[0_3px_0_#D9577B] active:translate-y-0.5'
                    : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                }`}
              >
                {isGoalDone
                  ? '✓ 已達成此共同目標'
                  : house.treasuryCoins >= activeGoal.targetCoins
                  ? '達成目標！立刻兌換獎勵'
                  : `金庫再存 ${activeGoal.targetCoins - house.treasuryCoins} 幣即可兌換`}
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-extrabold text-[#7D635D]">切換其他共同目標：</p>
              <div className="grid grid-cols-2 gap-1.5">
                {SHARED_GOALS.map((g) => {
                  const active = g.id === house.activeGoalId;
                  const done = house.completedGoalIds.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelectGoal(g.id)}
                      className={`min-h-[44px] rounded-xl px-2.5 py-1.5 border text-left text-[11px] font-extrabold transition ${
                        active
                          ? 'bg-[#FFF3D1] border-[#E6A222] text-[#7A540E]'
                          : 'bg-[#FAF5F0] border-[#E7D8CE] text-[#6E544E]'
                      }`}
                    >
                      <div className="truncate">{done ? `✓ ${g.title}` : g.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Shared Milestones */}
          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE0D8] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#4A3531] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#E6A222]" />
                <span>共同佈置里程碑</span>
              </h3>
              <span className="text-xs font-extrabold text-[#826862] tabular-nums">
                {house.achievedMilestones.length} / {SHARED_MILESTONES.length}
              </span>
            </div>

            <div className="space-y-2">
              {SHARED_MILESTONES.map((m) => {
                const achieved = house.achievedMilestones.includes(m.id);
                const claimed = house.claimedMilestones.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={`rounded-2xl border p-3 flex items-center justify-between gap-2 ${
                      claimed
                        ? 'bg-[#F3FBF8] border-[#C5E8DA]'
                        : achieved
                        ? 'bg-[#FFF8DF] border-[#F2CE6D]'
                        : 'bg-[#FAF5F1] border-[#E8DBD3]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-[#4A3531]">
                        {m.emoji} {m.title}
                      </div>
                      <p className="text-[10px] text-[#7D635D] mt-0.5">{m.description}</p>
                      <p className="text-[10px] font-extrabold text-[#9D5B12] mt-0.5 tabular-nums">
                        獎勵 +{m.rewardCoins} 金幣 · +{m.rewardGrowth} 成長
                      </p>
                    </div>

                    {claimed ? (
                      <span className="text-[11px] font-extrabold text-[#256D57] shrink-0">
                        已領取
                      </span>
                    ) : achieved ? (
                      <button
                        type="button"
                        onClick={() => handleClaimMilestone(m.id)}
                        className="min-h-[44px] px-3 rounded-xl bg-[#FF7A9E] text-white text-xs font-extrabold shrink-0 active:scale-95 transition"
                      >
                        領取
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-[#957B74] shrink-0">
                        進行中
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 5: HOUSE PHOTO STUDIO & HOUSE ALBUM */}
      {tab === 'photo' && (
        <div className="space-y-3.5">
          <RoomPhotoCard photo={previewPhotoRecord} />

          <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE0D8] p-3.5 space-y-3">
            <div>
              <h3 className="text-xs font-extrabold text-[#4A3531]">選擇萌寵拍照姿勢</h3>
              <p className="text-[10px] text-[#826862]">
                收集完成「草莓甜心 / 森林露營 / 雲朵午睡」主題套裝可解鎖限定姿勢！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ROOM_PHOTO_POSES.map((pose) => {
                const unlocked =
                  !pose.requiresTheme || house.unlockedPhotoPoses.includes(pose.id);
                const active = selectedPoseId === pose.id;
                return (
                  <button
                    key={pose.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      setSelectedPoseId(pose.id);
                      soundFX.pop(game.soundEnabled);
                    }}
                    className={`min-h-[48px] rounded-2xl px-2.5 py-2 border text-left transition ${
                      !unlocked
                        ? 'bg-[#F3ECE8] border-[#E2D6CE] text-[#9E8B84] cursor-not-allowed'
                        : active
                        ? 'bg-[#FFEAF0] border-2 border-[#FF7A9E] text-[#B83B64]'
                        : 'bg-[#FFF9F2] border-[#EAD9D0] text-[#4A3531]'
                    }`}
                  >
                    <div className="text-xs font-extrabold">
                      {unlocked ? pose.emoji : '🔒'} {pose.label}
                    </div>
                    <div className="text-[10px] font-bold opacity-80">{pose.badgeText}</div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#4A3531]">
                <span>🩷 加入相片貼圖</span>
                <span className="text-[10px] font-bold text-[#826862] tabular-nums">
                  已選 {photoStickers.length} / 6
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {PHOTO_STICKERS.map((st) => {
                  const active = photoStickers.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        setPhotoStickers((prev) =>
                          prev.includes(st.id)
                            ? prev.filter((item) => item !== st.id)
                            : [...prev, st.id].slice(0, 6)
                        )
                      }
                      className={`min-h-[44px] rounded-xl px-2 border text-xs font-extrabold inline-flex items-center justify-center gap-1 transition active:scale-95 ${
                        active
                          ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#B83B64]'
                          : 'bg-[#FFF9F2] border-[#EAD9D0] text-[#5A3E36]'
                      }`}
                    >
                      <span aria-hidden="true">{st.emoji}</span>
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between gap-1.5 text-xs font-extrabold text-[#4A3531]">
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#D64470]" />
                  <span>寫下紀念標題（最長 20 字）</span>
                </span>
                <span className="text-[10px] font-bold text-[#826862] tabular-nums">
                  {photoTitle.length}/20
                </span>
              </div>
              <input
                type="text"
                maxLength={20}
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value.slice(0, 20))}
                placeholder="相片標題（如：新沙發開箱日！）"
                className="w-full min-h-[44px] rounded-2xl bg-white border border-[#EED9D0] px-3 text-sm font-bold text-[#4A3531] focus:outline-none focus:border-[#FF7A9E]"
              />
              <input
                type="text"
                maxLength={60}
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="分享給照片牆與留言板的話…"
                className="w-full min-h-[44px] rounded-2xl bg-white border border-[#EED9D0] px-3 text-sm font-medium text-[#4A3531] focus:outline-none focus:border-[#FF7A9E]"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                type="button"
                disabled={sharingPhoto}
                onClick={() => handleSavePhoto(false)}
                className="min-h-[46px] rounded-2xl bg-[#5CC9A7] text-white text-xs font-extrabold shadow-[0_3px_0_#3BA886] hover:bg-[#49B895] active:translate-y-0.5 transition inline-flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>拍照並儲存到照片牆與相簿</span>
              </button>

              <button
                type="button"
                disabled={sharingPhoto}
                onClick={() => handleSavePhoto(true)}
                className="min-h-[46px] rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] hover:bg-[#F45D86] active:translate-y-0.5 transition inline-flex items-center justify-center gap-1.5"
              >
                <MessageCircleHeart className="w-4 h-4" />
                <span>{sharingPhoto ? '分享中…' : '拍照並分享到留言板'}</span>
              </button>
            </div>
          </section>

          {/* Saved Room Photos Gallery */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-extrabold text-[#4A3531]">
                📸 {house.houseName} 歷史合照 ({roomPhotos.length})
              </h3>
            </div>
            {roomPhotos.length === 0 ? (
              <div className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EFE0D8] p-5 text-center text-xs text-[#826862]">
                還沒有拍攝過小屋合照，在上方選個姿勢拍下第一張吧！
              </div>
            ) : (
              <div className="space-y-3">
                {roomPhotos.map((photo) => (
                  <RoomPhotoCard
                    key={photo.id}
                    photo={photo}
                    currentUserId={currentUserId}
                    onToggleLike={onTogglePhotoLike}
                    onAddComment={onAddPhotoComment}
                    onGenerateShareCard={() =>
                      onOpenShareCard({
                        petName: photo.petName,
                        species: photo.species,
                        title: photo.title,
                        subtitle: photo.caption || `${photo.houseName} 暖暖小屋合照`,
                        dateLabel: new Date(photo.createdAt).toLocaleDateString('zh-TW'),
                        badgeText: '小屋寫真紀念',
                        emoji: '📸',
                        weight: photo.weightAtCapture ?? game.pet.weight,
                        level: game.pet.level,
                        photo,
                      })
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
