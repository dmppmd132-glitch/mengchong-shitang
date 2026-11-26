import React, { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  Check,
  Coins,
  Compass,
  Gift,
  HeartHandshake,
  Home,
  Lock,
  MapPin,
  ShoppingBag,
  Sparkles,
  Ticket,
  Utensils,
  X,
} from 'lucide-react';
import { FOODS } from '../../data/foods';
import { ROOM_ITEM_BY_ID } from '../../data/house';
import { INGREDIENT_IDS, INGREDIENTS } from '../../data/kitchen';
import {
  ACTIVE_TOWN_LOCATIONS,
  TOWN_LOCATION_BY_ID,
  TOWN_MARKET_FURNITURE_IDS,
  TOWN_SHOP_ITEMS,
  TOWN_VISITOR_AFFINITY_THRESHOLDS,
  TOWN_VISITOR_BY_ID,
  VISITOR_HUT_FACILITIES,
  VISITOR_HUT_LEVEL_BY_NUM,
  VISITOR_HUT_LEVELS,
} from '../../data/town';
import { VISITOR_TREATS } from '../../data/visitors';
import {
  ActiveTownLocationId,
  GameState,
  SharedPetRoom,
  TownVisitorId,
  VisitorHutFacilityId,
  VisitorOffering,
} from '../../types';
import { getPhotoStudioState } from '../../utils/photoStudio';
import {
  createInitialTownMapState,
  getLocationDailyVisitorMax,
  getTownOfferingKey,
  getTownOfferingLabel,
  getTownRareVisitorRatePercent,
  isTownLocationUnlocked,
  isTownShopItemOwned,
} from '../../utils/townMap';
import { FurnitureGraphic } from '../house/FurnitureGraphic';
import { LakeFishingMiniGame } from './LakeFishingMiniGame';
import {
  TownLocationThumbnail,
  TownVisitorSprite,
  VisitorHutIllustration,
} from './TownArtwork';

export type TownMapTab = 'map' | 'location' | 'hut' | 'shop' | 'coop';

interface TownMapModalProps {
  open: boolean;
  onClose: () => void;
  game: GameState;
  sharedRoom: SharedPetRoom | null;
  currentUserId: string;
  initialTab?: TownMapTab;
  initialLocationId?: ActiveTownLocationId | null;
  onEnterLocation: (locationId: ActiveTownLocationId) => { ok: boolean; notice?: string; error?: string };
  onSpawnVisitor: (locationId: ActiveTownLocationId) => { ok: boolean; notice?: string; error?: string };
  onFeedVisitor: (
    locationId: ActiveTownLocationId,
    visitId: string,
    offerings: VisitorOffering[]
  ) => { ok: boolean; notice?: string; error?: string };
  onOpenLocationPhoto: (locationId: ActiveTownLocationId, visitorId?: TownVisitorId | null) => void;
  onForageAcorn: () => { ok: boolean; notice?: string; error?: string };
  onSettleFishing: (caughtCount: number) => { ok: boolean; notice?: string; error?: string };
  onDeliverMarketDish: (foodId: string) => { ok: boolean; notice?: string; error?: string };
  onBuyMarketFurniture: (itemId: string) => { ok: boolean; notice?: string; error?: string };
  onClaimLocationQuest: (
    locationId: ActiveTownLocationId,
    questId: string
  ) => { ok: boolean; notice?: string; error?: string };
  onClaimLocationAllBonus: (
    locationId: ActiveTownLocationId
  ) => { ok: boolean; notice?: string; error?: string };
  onUpgradeHut: () => { ok: boolean; notice?: string; error?: string };
  onBuyHutFacility: (facilityId: VisitorHutFacilityId) => { ok: boolean; notice?: string; error?: string };
  onBuyShopItem: (shopItemId: string) => { ok: boolean; notice?: string; error?: string };
  onClaimCoopTownReward: () => { ok: boolean; notice?: string; error?: string };
  onOpenSharedPet?: () => void;
}

export const TownMapModal: React.FC<TownMapModalProps> = ({
  open,
  onClose,
  game,
  sharedRoom,
  currentUserId,
  initialTab = 'map',
  initialLocationId = null,
  onEnterLocation,
  onSpawnVisitor,
  onFeedVisitor,
  onOpenLocationPhoto,
  onForageAcorn,
  onSettleFishing,
  onDeliverMarketDish,
  onBuyMarketFurniture,
  onClaimLocationQuest,
  onClaimLocationAllBonus,
  onUpgradeHut,
  onBuyHutFacility,
  onBuyShopItem,
  onClaimCoopTownReward,
  onOpenSharedPet,
}) => {
  const townMap = game.townMap ?? createInitialTownMapState();
  const studio = getPhotoStudioState(game);

  const [activeTab, setActiveTab] = useState<TownMapTab>(initialTab);
  const [selectedLocId, setSelectedLocId] = useState<ActiveTownLocationId>(
    initialLocationId ?? townMap.currentLocationId
  );
  const [selectedOfferings, setSelectedOfferings] = useState<VisitorOffering[]>([]);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [fishingOpen, setFishingOpen] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    kind: 'ok' | 'err';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveTab(initialTab);
    setSelectedLocId(initialLocationId ?? townMap.currentLocationId);
    setSelectedOfferings([]);
    setSelectedVisitId(null);
    setFeedbackBanner(null);
  }, [open, initialTab, initialLocationId, townMap.currentLocationId]);

  const currentLocState = townMap.locations[selectedLocId];
  const currentLocDef = TOWN_LOCATION_BY_ID[selectedLocId];
  const hasTreatTable = townMap.visitorHut.builtFacilities.includes('treat_table');
  const maxOfferSelect = hasTreatTable ? 3 : 1;

  const activeVisitor = useMemo(() => {
    if (currentLocState.activeVisitors.length === 0) return null;
    return (
      currentLocState.activeVisitors.find((v) => v.visitId === selectedVisitId) ??
      currentLocState.activeVisitors[0]
    );
  }, [currentLocState.activeVisitors, selectedVisitId]);

  // Build available offerings from player's inventory (treats, ingredients, cooked foods)
  const availableOfferings = useMemo(() => {
    const list: Array<{ offering: VisitorOffering; qty: number; emoji: string; name: string }> = [];
    for (const tr of VISITOR_TREATS) {
      const qty = game.visitorTreats?.[tr.id] ?? 0;
      if (qty > 0) {
        list.push({
          offering: { kind: 'treat', id: tr.id },
          qty,
          emoji: tr.emoji,
          name: tr.name,
        });
      }
    }
    for (const ingId of INGREDIENT_IDS) {
      const qty = game.ingredients[ingId] ?? 0;
      if (qty > 0) {
        const ing = INGREDIENTS[ingId];
        list.push({
          offering: { kind: 'ingredient', id: ingId },
          qty,
          emoji: ing.emoji,
          name: ing.name,
        });
      }
    }
    for (const food of FOODS) {
      const qty = game.foods[food.id] ?? 0;
      if (qty > 0) {
        list.push({
          offering: { kind: 'food', id: food.id },
          qty,
          emoji: food.emoji,
          name: food.name,
        });
      }
    }
    return list;
  }, [game.visitorTreats, game.ingredients, game.foods]);

  const ownedDishesForMarket = useMemo(
    () =>
      FOODS.filter((f) => (game.foods[f.id] ?? 0) > 0).map((f) => ({
        food: f,
        qty: game.foods[f.id] ?? 0,
      })),
    [game.foods]
  );

  if (!open) return null;

  const showResult = (res: { ok: boolean; notice?: string; error?: string }) => {
    if (res.ok && res.notice) {
      setFeedbackBanner({ kind: 'ok', text: res.notice });
    } else if (!res.ok && res.error) {
      setFeedbackBanner({ kind: 'err', text: res.error });
    }
  };

  const handleGoToLocation = (locId: ActiveTownLocationId) => {
    const res = onEnterLocation(locId);
    showResult(res);
    if (res.ok) {
      setSelectedLocId(locId);
      setSelectedOfferings([]);
      setSelectedVisitId(null);
      setActiveTab('location');
    }
  };

  const toggleOffering = (off: VisitorOffering) => {
    const key = getTownOfferingKey(off);
    setSelectedOfferings((prev) => {
      const exists = prev.some((o) => getTownOfferingKey(o) === key);
      if (exists) {
        return prev.filter((o) => getTownOfferingKey(o) !== key);
      }
      if (maxOfferSelect === 1) {
        return [off];
      }
      if (prev.length >= maxOfferSelect) {
        return [...prev.slice(1), off];
      }
      return [...prev, off];
    });
  };

  const coopSession = game.coop.coopTownSession;
  const coopCanClaim =
    Boolean(coopSession?.completed) &&
    !(coopSession?.claimedByUserIds ?? []).includes(currentUserId);
  const hutInfo = VISITOR_HUT_LEVEL_BY_NUM[townMap.visitorHut.level];
  const nextHutInfo =
    townMap.visitorHut.level < 5
      ? VISITOR_HUT_LEVEL_BY_NUM[(townMap.visitorHut.level + 1) as 2 | 3 | 4 | 5]
      : null;

  const dailyMaxHere = getLocationDailyVisitorMax(townMap, selectedLocId);
  const rareRateHere = getTownRareVisitorRatePercent(game, selectedLocId);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-[#3B2621]/55 backdrop-blur-xs flex items-center justify-center p-2 overflow-x-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="town-map-modal-title"
      >
        <div className="w-full max-w-[424px] max-h-[93dvh] rounded-3xl bg-[#FFFDF8] border-2 border-[#DCECE4] shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <header className="px-4 py-2.5 bg-gradient-to-r from-[#E6F8EE] via-[#FFF6DC] to-[#FFEAF0] border-b border-[#E8DED6] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-white/90 text-[#1F6B54] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2
                  id="town-map-modal-title"
                  className="text-sm font-extrabold text-[#4A3531] truncate"
                >
                  🗺️ 小鎮地圖與訪客小屋
                </h2>
                <p className="text-[11px] font-bold text-[#6F5A54] tabular-nums truncate">
                  🪙 {game.coins} · 🎫 {townMap.townTickets.balance} 小鎮券 · 🎨{' '}
                  {game.filterShards ?? 0} 濾鏡碎片 · 🎞️ {studio.studioMaterials} 材料
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉小鎮地圖"
              className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/85 text-[#5A3E36] flex items-center justify-center hover:bg-white transition shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Top 5 Navigation Tabs */}
          <nav
            aria-label="小鎮地圖分頁"
            className="px-3 pt-2 pb-1.5 bg-[#F8FAF7] border-b border-[#EAE3DC] shrink-0"
          >
            <div className="grid grid-cols-5 gap-1 bg-[#EAE3DA] p-1 rounded-2xl">
              {(
                [
                  { id: 'map', label: '地圖', icon: MapPin },
                  { id: 'location', label: '探索', icon: Compass },
                  { id: 'hut', label: '小屋', icon: Home },
                  { id: 'shop', label: '商店', icon: ShoppingBag },
                  { id: 'coop', label: '共養', icon: HeartHandshake },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setFeedbackBanner(null);
                      setActiveTab(tab.id);
                    }}
                    className={`min-h-[40px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 whitespace-nowrap transition relative ${
                      active
                        ? 'bg-white text-[#1F6B54] shadow-xs'
                        : 'text-[#6D564E] hover:text-[#4A3531]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                    {tab.id === 'coop' && coopCanClaim && (
                      <span className="w-2 h-2 rounded-full bg-[#FF5A87]" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5">
            {feedbackBanner && (
              <div
                className={`rounded-2xl border px-3 py-2 text-xs font-extrabold flex items-center gap-2 ${
                  feedbackBanner.kind === 'ok'
                    ? 'bg-[#E5F7F0] border-[#A6DFCA] text-[#1F6B54]'
                    : 'bg-[#FFF0F3] border-[#F4BDC9] text-[#B83B64]'
                }`}
              >
                <span>{feedbackBanner.kind === 'ok' ? '✨' : '💡'}</span>
                <span className="leading-snug">{feedbackBanner.text}</span>
              </div>
            )}

            {/* TAB 1: TOWN MAP (4 active locations) */}
            {activeTab === 'map' && (
              <div className="space-y-3">
                {/* Co-op Exploration Quick Banner */}
                {sharedRoom && coopSession && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('coop')}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#FFF0F5] via-[#FFF6DF] to-[#E6F8F1] border-2 border-[#F2C9D7] p-3 flex items-center justify-between gap-2 text-left active:scale-[0.99] transition"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-[#B83B64] flex items-center gap-1.5">
                        <span>{coopSession.emoji}</span>
                        <span className="truncate">{coopSession.title}</span>
                      </div>
                      <p className="text-[11px] font-bold text-[#6E544E] truncate mt-0.5">
                        {coopSession.completed
                          ? coopCanClaim
                            ? '🎉 已合力達成！點擊領取 +8 小鎮券相同獎勵'
                            : '✓ 今日共養探索完成 · 連勝 ' + (game.coop.townExploreStreakDays ?? 0) + ' 天'
                          : `前往「${TOWN_LOCATION_BY_ID[coopSession.locationId].name}」與夥伴一起探索！`}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-[#F2BDCE] text-[11px] font-extrabold text-[#B83B64] shrink-0">
                      查看 ›
                    </span>
                  </button>
                )}

                <div className="space-y-2.5">
                  {ACTIVE_TOWN_LOCATIONS.map((loc) => {
                    const unlockStatus = isTownLocationUnlocked(game, loc.id);
                    const locProgress = townMap.locations[loc.id];
                    const completedQuests = locProgress.dailyQuests.filter((q) => q.completed).length;
                    const isHere = townMap.currentLocationId === loc.id;
                    const maxCap = getLocationDailyVisitorMax(townMap, loc.id);

                    return (
                      <article
                        key={loc.id}
                        className={`rounded-3xl border-2 p-3.5 transition ${
                          unlockStatus.unlocked
                            ? `bg-gradient-to-br ${loc.themeGradient} ${
                                isHere ? 'border-[#52B788] ring-2 ring-[#52B788]/25' : 'border-[#E6DDD5]'
                              }`
                            : 'bg-[#F3EEE9] border-[#E0D6CE] opacity-90'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <TownLocationThumbnail
                            locationId={loc.id}
                            className={`w-22 h-16 rounded-2xl shrink-0 border border-white shadow-xs ${
                              unlockStatus.unlocked ? '' : 'grayscale opacity-65'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <h3 className="text-sm font-extrabold text-[#4A3531] truncate">
                                {loc.emoji} {loc.name}
                              </h3>
                              {isHere ? (
                                <span className="px-2 py-0.5 rounded-lg bg-[#2E9E75] text-white text-[10px] font-extrabold shrink-0">
                                  📍 目前所在地
                                </span>
                              ) : unlockStatus.unlocked ? (
                                <span className="px-2 py-0.5 rounded-lg bg-white/90 border border-[#C6E6D6] text-[#1F6B54] text-[10px] font-extrabold shrink-0">
                                  已解鎖
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-lg bg-[#E4DAD3] text-[#7D6861] text-[10px] font-extrabold inline-flex items-center gap-0.5 shrink-0">
                                  <Lock className="w-3 h-3" />
                                  未解鎖
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] font-bold text-[#6E5953] mt-0.5">
                              {unlockStatus.unlocked ? loc.subtitle : `解鎖條件：${unlockStatus.reason}`}
                            </p>

                            <div className="mt-1.5 flex items-center flex-wrap gap-1">
                              {loc.commonVisitorIds.map((vid) => (
                                <span
                                  key={vid}
                                  className="px-1.5 py-0.5 rounded-md bg-white/85 border border-[#E7DDD6] text-[10px] font-bold text-[#5A3E36]"
                                >
                                  {TOWN_VISITOR_BY_ID[vid].emoji}{' '}
                                  {TOWN_VISITOR_BY_ID[vid].speciesLabel}
                                </span>
                              ))}
                              {loc.rareVisitorIds.map((vid) => (
                                <span
                                  key={vid}
                                  className="px-1.5 py-0.5 rounded-md bg-[#FFF3D1] border border-[#F2CE6D] text-[10px] font-extrabold text-[#8A5610]"
                                >
                                  ✨ {TOWN_VISITOR_BY_ID[vid].speciesLabel}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between gap-2 flex-wrap">
                          <div className="text-[11px] font-bold text-[#5D4B45] space-y-0.5">
                            <div className="tabular-nums">
                              今日任務 {completedQuests}/2 · 今日訪客 {locProgress.dailyVisitorsCount}/{maxCap}
                            </div>
                            <div className="text-[10px] text-[#7B655E]">
                              獎勵：{loc.rewardHighlights.slice(0, 3).join(' · ')}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={!unlockStatus.unlocked}
                            onClick={() => handleGoToLocation(loc.id)}
                            className={`min-h-[42px] px-3.5 rounded-2xl text-xs font-extrabold shrink-0 transition ${
                              unlockStatus.unlocked
                                ? 'bg-[#5CC9A7] text-white shadow-[0_3px_0_#3BA585] active:translate-y-0.5'
                                : 'bg-[#DDD3CB] text-[#8E7D76] cursor-not-allowed'
                            }`}
                          >
                            {unlockStatus.unlocked ? (isHere ? '進入地點 ›' : '前往地點 ›') : '待解鎖'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: LOCATION DETAIL VIEW */}
            {activeTab === 'location' && (
              <div className="space-y-3.5">
                {/* Quick Location Switcher Strip */}
                <div className="grid grid-cols-4 gap-1.5">
                  {ACTIVE_TOWN_LOCATIONS.map((loc) => {
                    const unlocked = isTownLocationUnlocked(game, loc.id).unlocked;
                    const active = selectedLocId === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => {
                          if (!unlocked) return;
                          handleGoToLocation(loc.id);
                        }}
                        className={`min-h-[42px] rounded-xl border px-1.5 py-1 text-[10.5px] font-extrabold flex flex-col items-center justify-center transition ${
                          active
                            ? 'bg-[#E6F8F1] border-[#52B788] text-[#1F6B54]'
                            : unlocked
                            ? 'bg-white border-[#E7DCD5] text-[#5A3E36]'
                            : 'bg-[#F2ECE7] border-[#E4DAD3] text-[#A2918B] cursor-not-allowed'
                        }`}
                      >
                        <span>{unlocked ? loc.emoji : '🔒'}</span>
                        <span className="truncate max-w-full">{loc.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Location Banner */}
                <section
                  className={`rounded-3xl bg-gradient-to-br ${currentLocDef.themeGradient} border-2 border-[#DCE9DF] p-3.5 space-y-2.5`}
                >
                  <div className="flex items-start gap-3">
                    <TownLocationThumbnail
                      locationId={selectedLocId}
                      className="w-24 h-18 rounded-2xl border-2 border-white shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base font-extrabold text-[#4A3531] truncate">
                          {currentLocDef.emoji} {currentLocDef.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-lg bg-white/90 text-[10px] font-extrabold text-[#8A5610] tabular-nums shrink-0">
                          稀有率 {rareRateHere}%
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#5A4741] leading-snug mt-1">
                        {currentLocDef.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => showResult(onSpawnVisitor(selectedLocId))}
                      disabled={currentLocState.dailyVisitorsCount >= dailyMaxHere}
                      className={`min-h-[44px] rounded-2xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
                        currentLocState.dailyVisitorsCount < dailyMaxHere
                          ? 'bg-white border-2 border-[#A7DFC8] text-[#1F6B54] active:scale-95'
                          : 'bg-[#ECE6E1] border border-[#DDD4CD] text-[#9A8882] cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span className="tabular-nums">
                        邀請訪客 ({currentLocState.dailyVisitorsCount}/{dailyMaxHere})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenLocationPhoto(selectedLocId, activeVisitor?.visitorId ?? null)
                      }
                      className="min-h-[44px] rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center justify-center gap-1.5 active:translate-y-0.5 transition"
                    >
                      <Camera className="w-4 h-4 shrink-0" />
                      <span>{activeVisitor ? '與訪客地點攝影' : '拍攝地點寫真'}</span>
                    </button>
                  </div>
                </section>

                {/* Location Exclusive Interactive Activities */}
                {selectedLocId === 'acorn_forest' && (
                  <section className="rounded-3xl bg-[#F8F3E6] border-2 border-[#E6D3B1] p-3.5 flex items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-[#6E491E]">
                        🌰 橡果採集林地（累計 {townMap.acornsCollectedTotal} 顆）
                      </h4>
                      <p className="text-[11px] font-medium text-[#7C6245] mt-0.5">
                        每次採集可獲得 +8 金幣與濾鏡碎片機會，並推進森林任務與共養野餐！
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => showResult(onForageAcorn())}
                      className="min-h-[44px] px-3.5 rounded-2xl bg-[#D9822B] text-white text-xs font-extrabold shadow-[0_3px_0_#A65D17] shrink-0 active:translate-y-0.5 transition"
                    >
                      🌰 採集橡果
                    </button>
                  </section>
                )}

                {selectedLocId === 'lake_park' && (
                  <section className="rounded-3xl bg-[#EAF6FF] border-2 border-[#B3DCF5] p-3.5 flex items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-[#1E567B]">
                        🎣 湖邊木棧橋釣魚（最佳 {townMap.fishingBestScore} 條）
                      </h4>
                      <p className="text-[11px] font-medium text-[#4A728D] mt-0.5">
                        單手點擊揮竿 5 次！釣滿 3 條可獲水滴相框、小鎮券與大量金幣！
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFishingOpen(true)}
                      className="min-h-[44px] px-3.5 rounded-2xl bg-[#3898D4] text-white text-xs font-extrabold shadow-[0_3px_0_#246E9E] shrink-0 active:translate-y-0.5 transition"
                    >
                      🎣 開始釣魚
                    </button>
                  </section>
                )}

                {selectedLocId === 'town_market' && (
                  <section className="rounded-3xl bg-[#FFF6E7] border-2 border-[#F0D1A1] p-3.5 space-y-3">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#8A5012]">
                        🍱 市集美食交付攤（已交付 {townMap.marketDishesDeliveredTotal} 道）
                      </h4>
                      <p className="text-[11px] font-medium text-[#826345] mt-0.5">
                        把食堂料理送到市集木攤，賺取高額金幣、+2 小鎮券與「市集招牌框」！
                      </p>
                      {ownedDishesForMarket.length === 0 ? (
                        <div className="mt-2 rounded-xl bg-white/80 border border-[#ECDCC2] px-3 py-2 text-[11px] font-bold text-[#8A7466]">
                          倉庫目前沒有做好的料理，去「食堂廚房」煮一道再來交付吧！
                        </div>
                      ) : (
                        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                          {ownedDishesForMarket.map(({ food, qty }) => (
                            <button
                              key={food.id}
                              type="button"
                              onClick={() => showResult(onDeliverMarketDish(food.id))}
                              className="min-h-[44px] shrink-0 rounded-xl bg-white border border-[#EAC998] px-2.5 py-1.5 text-left hover:bg-[#FFF9ED] active:scale-95 transition"
                            >
                              <div className="text-xs font-extrabold text-[#4A3531]">
                                {food.emoji} {food.name} ×{qty}
                              </div>
                              <div className="text-[10px] font-bold text-[#9D5B12]">
                                交付賺金幣＋小鎮券
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#EED9B8] space-y-2">
                      <h4 className="text-xs font-extrabold text-[#8A5012]">
                        🪑 市集限定家具選購（購置後可直接放進小屋）
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {TOWN_MARKET_FURNITURE_IDS.map((fid) => {
                          const item = ROOM_ITEM_BY_ID[fid];
                          if (!item) return null;
                          const owned =
                            (game.house.ownedFurnitureCounts[fid] ?? 0) > 0 ||
                            game.house.collectedFurnitureIds.includes(fid);
                          return (
                            <div
                              key={fid}
                              className="rounded-2xl bg-white border border-[#EED8B7] p-2 flex flex-col items-center text-center gap-1"
                            >
                              <FurnitureGraphic itemId={fid} size={42} />
                              <div className="text-[10.5px] font-extrabold text-[#4A3531] leading-tight line-clamp-2 min-h-[28px]">
                                {item.name}
                              </div>
                              <button
                                type="button"
                                disabled={game.coins < item.price}
                                onClick={() => showResult(onBuyMarketFurniture(fid))}
                                className={`min-h-[36px] w-full rounded-xl text-[10px] font-extrabold transition ${
                                  game.coins >= item.price
                                    ? 'bg-[#FFE7B3] text-[#7D4B0E] border border-[#ECC368] active:scale-95'
                                    : 'bg-[#F0E8E2] text-[#A2918B] cursor-not-allowed'
                                }`}
                              >
                                {owned ? `再買 ${item.price}🪙` : `${item.price}🪙 購買`}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                )}

                {/* Active Visitors & Feeding Area */}
                <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EEDFD6] p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#4A3531]">
                      🐾 正在此地點散步的訪客
                    </h4>
                    <span className="text-[11px] font-bold text-[#7D635D] tabular-nums">
                      {currentLocState.activeVisitors.length} 位在場
                    </span>
                  </div>

                  {currentLocState.activeVisitors.length > 1 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {currentLocState.activeVisitors.map((v) => {
                        const def = TOWN_VISITOR_BY_ID[v.visitorId];
                        const isSelected = activeVisitor?.visitId === v.visitId;
                        return (
                          <button
                            key={v.visitId}
                            type="button"
                            onClick={() => setSelectedVisitId(v.visitId)}
                            className={`min-h-[38px] px-2.5 rounded-xl border text-xs font-extrabold inline-flex items-center gap-1 ${
                              isSelected
                                ? 'bg-[#E6F8F1] border-[#52B788] text-[#1F6B54]'
                                : 'bg-white border-[#E8DAD2] text-[#5A3E36]'
                            }`}
                          >
                            <span>{def.emoji}</span>
                            <span>{def.speciesLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!activeVisitor ? (
                    <div className="rounded-2xl bg-[#FAF4EE] border border-[#EEDFD6] p-4 text-center space-y-2">
                      <p className="text-xs font-bold text-[#7D635D]">
                        目前這裡安安靜靜的，試著點擊上方「邀請訪客」看看誰會來吧！
                      </p>
                    </div>
                  ) : (
                    (() => {
                      const vDef = TOWN_VISITOR_BY_ID[activeVisitor.visitorId];
                      const aff = townMap.visitorAffinities[activeVisitor.visitorId];
                      const nextLvExp =
                        aff.level < 5
                          ? TOWN_VISITOR_AFFINITY_THRESHOLDS[aff.level]
                          : TOWN_VISITOR_AFFINITY_THRESHOLDS[4];
                      const pct =
                        aff.level >= 5
                          ? 100
                          : Math.min(100, Math.round((aff.exp / Math.max(1, nextLvExp)) * 100));

                      return (
                        <div
                          className={`rounded-2xl bg-gradient-to-br ${vDef.bgGradient} border border-[#E6DCD4] p-3 space-y-2.5`}
                        >
                          <div className="flex items-center gap-3">
                            <TownVisitorSprite
                              visitorId={activeVisitor.visitorId}
                              happy={activeVisitor.lastFeedReaction === 'favorite'}
                              className="w-16 h-16 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-sm font-extrabold text-[#4A3531]">
                                  {vDef.name}
                                </span>
                                {vDef.rarity === 'rare' && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-[#FFE69A] border border-[#E6B84C] text-[10px] font-extrabold text-[#7D4D0B]">
                                    ✨ 稀有訪客
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 rounded-md bg-white border border-[#E4D5CD] text-[10px] font-extrabold text-[#B83B64] tabular-nums">
                                  好感 Lv.{aff.level}
                                </span>
                              </div>
                              <p className="text-[11px] font-medium text-[#5A4741] mt-0.5 leading-snug">
                                {activeVisitor.lastFeedLine ?? vDef.arrivalLines[0]}
                              </p>
                              <div className="mt-1.5 h-1.5 rounded-full bg-white/80 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#FF7A9E]"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-xl bg-white/85 border border-[#EDE0D8] px-2.5 py-1.5 text-[11px] space-y-0.5">
                            <div className="font-bold text-[#1F6B54]">
                              ❤️ 最愛：{vDef.favoriteTagsLabel}
                            </div>
                            <div className="font-medium text-[#9A5266]">
                              💭 不太喜歡：{vDef.dislikedTagsLabel}
                            </div>
                          </div>

                          {activeVisitor.lastRewardSummary && (
                            <div className="rounded-xl bg-[#E8F8F1] border border-[#A6DFCA] px-2.5 py-1.5 text-[11px] font-extrabold text-[#1F6B54]">
                              🎁 剛才回禮：{activeVisitor.lastRewardSummary}
                            </div>
                          )}

                          {/* Offering Picker */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-extrabold text-[#5A3E36]">
                              <span>
                                🍪 選擇點心或食材招待（已招待 {activeVisitor.fedCount}/
                                {activeVisitor.maxFeedCount}）
                              </span>
                              {hasTreatTable && (
                                <span className="text-[#B83B64]">
                                  🍰 招待桌：可一次選 {selectedOfferings.length}/3 份
                                </span>
                              )}
                            </div>

                            {availableOfferings.length === 0 ? (
                              <p className="text-[11px] font-bold text-[#8A746C] bg-white/80 rounded-xl px-2.5 py-2">
                                倉庫裡暫時沒有食材、料理或訪客點心，去農場收成或商店補貨吧！
                              </p>
                            ) : (
                              <div className="flex gap-1.5 overflow-x-auto pb-1">
                                {availableOfferings.map((item) => {
                                  const key = getTownOfferingKey(item.offering);
                                  const selected = selectedOfferings.some(
                                    (o) => getTownOfferingKey(o) === key
                                  );
                                  const isFav = vDef.favoriteOfferingKeys.includes(key);
                                  return (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => toggleOffering(item.offering)}
                                      className={`min-h-[42px] shrink-0 rounded-xl border px-2 py-1 text-left transition ${
                                        selected
                                          ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#B83B64] shadow-xs'
                                          : isFav
                                          ? 'bg-[#FFFDF5] border-[#F0CE74] text-[#5A3E36]'
                                          : 'bg-white border-[#E8DAD2] text-[#5A3E36]'
                                      }`}
                                    >
                                      <div className="text-[11px] font-extrabold whitespace-nowrap">
                                        {item.emoji} {item.name} ×{item.qty}
                                      </div>
                                      <div className="text-[9.5px] font-bold text-[#8B726A]">
                                        {isFav ? '❤️ 喜歡' : '點心'}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            <button
                              type="button"
                              disabled={
                                activeVisitor.fedCount >= activeVisitor.maxFeedCount ||
                                selectedOfferings.length === 0
                              }
                              onClick={() => {
                                const res = onFeedVisitor(
                                  selectedLocId,
                                  activeVisitor.visitId,
                                  selectedOfferings
                                );
                                showResult(res);
                                if (res.ok) setSelectedOfferings([]);
                              }}
                              className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
                                activeVisitor.fedCount < activeVisitor.maxFeedCount &&
                                selectedOfferings.length > 0
                                  ? 'bg-[#5CC9A7] text-white shadow-[0_3px_0_#3BA585] active:translate-y-0.5'
                                  : 'bg-[#E6DDD6] text-[#9A8882] cursor-not-allowed'
                              }`}
                            >
                              <Utensils className="w-4 h-4" />
                              <span>
                                {activeVisitor.fedCount >= activeVisitor.maxFeedCount
                                  ? '本次已招待滿足囉 ✓'
                                  : selectedOfferings.length > 0
                                  ? `端出 ${selectedOfferings
                                      .map((o) => getTownOfferingLabel(o).name)
                                      .join('＋')} 招待！`
                                  : '請先從上方點選點心或食材'}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </section>

                {/* Daily Location Quests */}
                <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#EEDFD6] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#4A3531]">
                      📋 今日地點任務（{currentLocDef.name}）
                    </h4>
                    <button
                      type="button"
                      disabled={
                        !currentLocState.dailyQuests.every((q) => q.completed) ||
                        currentLocState.allQuestsBonusClaimed
                      }
                      onClick={() => showResult(onClaimLocationAllBonus(selectedLocId))}
                      className={`min-h-[34px] px-2.5 rounded-xl text-[10.5px] font-extrabold transition ${
                        currentLocState.allQuestsBonusClaimed
                          ? 'bg-[#E6F8F1] text-[#1F6B54]'
                          : currentLocState.dailyQuests.every((q) => q.completed)
                          ? 'bg-[#FF7A9E] text-white shadow-xs animate-pulse'
                          : 'bg-[#F2EAE4] text-[#9A8882] cursor-not-allowed'
                      }`}
                    >
                      {currentLocState.allQuestsBonusClaimed
                        ? '✓ 全完成加碼已領'
                        : '全部完成加碼 +3🎫'}
                    </button>
                  </div>

                  {currentLocState.dailyQuests.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-2xl bg-[#FAF5F0] border border-[#ECE0D7] p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold text-[#4A3531] flex items-center gap-1">
                          <span>{q.emoji}</span>
                          <span className="truncate">{q.title}</span>
                          <span className="text-[10.5px] text-[#256D57] tabular-nums shrink-0">
                            ({q.progress}/{q.target})
                          </span>
                        </div>
                        <p className="text-[10.5px] text-[#7D635D] leading-snug mt-0.5">
                          {q.description}
                        </p>
                        <div className="text-[10px] font-bold text-[#8A5610] mt-0.5">
                          獎勵：+{q.rewardTownTickets} 小鎮券 · +{q.rewardCoins} 金幣
                          {q.rewardStudioMaterials ? ` · +${q.rewardStudioMaterials} 材料` : ''}
                          {q.rewardFilterShards ? ` · +${q.rewardFilterShards} 濾鏡碎片` : ''}
                          {q.rewardFurnitureShards ? ` · +${q.rewardFurnitureShards} 家具碎片` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!q.completed || q.claimed}
                        onClick={() => showResult(onClaimLocationQuest(selectedLocId, q.id))}
                        className={`min-h-[40px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 transition ${
                          q.claimed
                            ? 'bg-[#E6F8F1] text-[#1F6B54]'
                            : q.completed
                            ? 'bg-[#5CC9A7] text-white shadow-xs active:scale-95'
                            : 'bg-[#E8DDD6] text-[#9A8882] cursor-not-allowed'
                        }`}
                      >
                        {q.claimed ? '✓ 已領' : q.completed ? '領取' : '進行中'}
                      </button>
                    </div>
                  ))}
                </section>
              </div>
            )}

            {/* TAB 3: VISITOR HUT UPGRADE & 8 FACILITIES */}
            {activeTab === 'hut' && (
              <div className="space-y-3.5">
                <section className="rounded-3xl bg-gradient-to-br from-[#F2FAF5] via-[#FFF9EC] to-[#FFF2F5] border-2 border-[#D2E8DC] p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-lg bg-white border border-[#BFE3D2] text-[10.5px] font-extrabold text-[#1F6B54]">
                        Lv.{hutInfo.level} 訪客小屋
                      </span>
                      <h3 className="text-base font-extrabold text-[#4A3531] mt-1">
                        {hutInfo.emoji} {hutInfo.name}
                      </h3>
                    </div>
                    <div className="text-right text-[11px] font-bold text-[#6E544E] tabular-nums">
                      <div>設施 {townMap.visitorHut.builtFacilities.length} / 8</div>
                      <div>稀有率加成 +{hutInfo.rareRateBonusPercent}%</div>
                    </div>
                  </div>

                  <VisitorHutIllustration
                    level={townMap.visitorHut.level}
                    builtFacilities={townMap.visitorHut.builtFacilities}
                    className="w-full max-w-[260px] mx-auto rounded-2xl border-2 border-white shadow-sm"
                  />

                  <p className="text-xs font-medium text-[#5A4741] leading-snug">
                    {hutInfo.description}
                  </p>
                  <div className="rounded-xl bg-white/85 border border-[#DCEAE2] px-3 py-2 text-[11px] font-extrabold text-[#1F6B54]">
                    ✨ 目前效果：{hutInfo.unlockBonusText}
                  </div>

                  {nextHutInfo ? (
                    <div className="rounded-2xl bg-white border-2 border-[#F0D59B] p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-extrabold text-[#4A3531]">
                          下一階段：Lv.{nextHutInfo.level} {nextHutInfo.emoji} {nextHutInfo.name}
                        </div>
                        <span className="text-xs font-extrabold text-[#8A5610] tabular-nums">
                          {nextHutInfo.upgradeCostCoins} 金幣
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-[#6E544E]">
                        升級解鎖：{nextHutInfo.unlockBonusText}
                      </p>
                      <button
                        type="button"
                        disabled={game.coins < nextHutInfo.upgradeCostCoins}
                        onClick={() => showResult(onUpgradeHut())}
                        className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
                          game.coins >= nextHutInfo.upgradeCostCoins
                            ? 'bg-[#FF7A9E] text-white shadow-[0_3px_0_#D9577B] active:translate-y-0.5'
                            : 'bg-[#E9DFD8] text-[#9A8882] cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        <span>花費 {nextHutInfo.upgradeCostCoins} 金幣升級訪客小屋</span>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#FFF3D8] border border-[#F2CE6D] px-3 py-2 text-xs font-extrabold text-[#8A5610] text-center">
                      🏰 訪客小屋已達最高 Lv.5「夢幻招待所」＆解鎖夢幻招待所背景！
                    </div>
                  )}

                  {/* Level Roadmap Preview */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {VISITOR_HUT_LEVELS.map((lv) => {
                      const reached = townMap.visitorHut.level >= lv.level;
                      return (
                        <span
                          key={lv.level}
                          className={`px-2 py-1 rounded-lg border text-[10px] font-extrabold whitespace-nowrap ${
                            reached
                              ? 'bg-[#E6F8F1] border-[#9CDDC0] text-[#1F6B54]'
                              : 'bg-white/75 border-[#E6DCD4] text-[#8E7B75]'
                          }`}
                        >
                          {lv.emoji} Lv.{lv.level} {lv.name}
                        </span>
                      );
                    })}
                  </div>
                </section>

                {/* 8 Facilities */}
                <section className="space-y-2">
                  <h4 className="text-xs font-extrabold text-[#4A3531] px-1">
                    🛠️ 訪客小屋設施建造（共 8 項）
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {VISITOR_HUT_FACILITIES.map((fac) => {
                      const built = townMap.visitorHut.builtFacilities.includes(fac.id);
                      const canAfford = game.coins >= fac.priceCoins;
                      return (
                        <article
                          key={fac.id}
                          className={`rounded-2xl border-2 p-3 flex items-center justify-between gap-2.5 ${
                            built
                              ? 'bg-[#ECFAF3] border-[#A7DFC8]'
                              : 'bg-white border-[#EFE0D7]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl">{fac.emoji}</span>
                              <span className="text-xs font-extrabold text-[#4A3531]">
                                {fac.name}
                              </span>
                            </div>
                            <p className="text-[10.5px] font-medium text-[#6E544E] mt-0.5 leading-snug">
                              {fac.description}
                            </p>
                            <p className="text-[10.5px] font-extrabold text-[#1F6B54] mt-0.5">
                              效果：{fac.effectLabel}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={built || !canAfford}
                            onClick={() => showResult(onBuyHutFacility(fac.id))}
                            className={`min-h-[42px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 transition ${
                              built
                                ? 'bg-white text-[#1F6B54] border border-[#9CDDC0]'
                                : canAfford
                                ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E] active:scale-95'
                                : 'bg-[#EFE6E2] text-[#A4928C] cursor-not-allowed'
                            }`}
                          >
                            {built ? '✓ 已建造' : `${fac.priceCoins}🪙 建造`}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 4: TOWN TICKET SHOP (10 exclusive items) */}
            {activeTab === 'shop' && (
              <div className="space-y-3">
                <section className="rounded-2xl bg-gradient-to-r from-[#FFF3D8] to-[#E8F8F2] border border-[#E5DCCD] p-3 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#4A3531]">
                      🎫 小鎮紀念品兌換商店（10 款限定）
                    </h3>
                    <p className="text-[11px] font-bold text-[#6E544E] mt-0.5">
                      完成地點任務、招待訪客、地點拍照或小鎮訂單即可獲得小鎮券！
                    </p>
                  </div>
                  <span className="px-2.5 py-1.5 rounded-xl bg-white border border-[#F0D182] text-xs font-extrabold text-[#8A5610] inline-flex items-center gap-1 tabular-nums shrink-0">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{townMap.townTickets.balance}</span>
                  </span>
                </section>

                <div className="grid grid-cols-2 gap-2.5">
                  {TOWN_SHOP_ITEMS.map((item) => {
                    const owned = isTownShopItemOwned(game, item.id);
                    const canBuy = townMap.townTickets.balance >= item.ticketPrice;
                    return (
                      <article
                        key={item.id}
                        className={`rounded-2xl border-2 p-2.5 flex flex-col justify-between gap-2 ${
                          owned
                            ? 'bg-[#EFFAF4] border-[#B2E3CC]'
                            : 'bg-white border-[#EFE0D7]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-2xl">{item.emoji}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-[#FAF4EE] text-[9.5px] font-bold text-[#7D635D]">
                              {item.locationLabel}
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-[#4A3531] mt-1">
                            {item.name}
                          </div>
                          <p className="text-[10.5px] font-medium text-[#7D635D] leading-snug mt-0.5">
                            {item.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={owned || !canBuy}
                          onClick={() => showResult(onBuyShopItem(item.id))}
                          className={`min-h-[40px] w-full rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition ${
                            owned
                              ? 'bg-white text-[#1F6B54] border border-[#A6DFCA]'
                              : canBuy
                              ? 'bg-[#5CC9A7] text-white shadow-xs active:scale-95'
                              : 'bg-[#EDE5DF] text-[#9E8B85] cursor-not-allowed'
                          }`}
                        >
                          {owned ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>已擁有</span>
                            </>
                          ) : (
                            <>
                              <Ticket className="w-3.5 h-3.5" />
                              <span>{item.ticketPrice} 小鎮券兌換</span>
                            </>
                          )}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: CO-OP TOWN EXPLORATION */}
            {activeTab === 'coop' && (
              <div className="space-y-3.5">
                {!sharedRoom ? (
                  <section className="rounded-3xl bg-[#FFF3F7] border-2 border-[#F4C4D3] p-4 text-center space-y-2.5">
                    <div className="text-3xl">💞</div>
                    <h3 className="text-sm font-extrabold text-[#B83B64]">
                      建立共養小屋，開啟小鎮合作探索！
                    </h3>
                    <p className="text-xs font-medium text-[#6E544E] leading-relaxed">
                      連線共養小屋後，每天會輪替出現「森林野餐」或「湖邊釣魚」合作任務！兩人共同累積進度，完成後雙方都能獲得完全相同的 +8 小鎮券、金幣與稀有材料，連續 3 天與 7 天還可獲得專屬共養徽章與稱號！
                    </p>
                    {onOpenSharedPet && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenSharedPet();
                        }}
                        className="min-h-[44px] px-4 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B]"
                      >
                        前往設定共養小屋 ›
                      </button>
                    )}
                  </section>
                ) : coopSession ? (
                  <>
                    <section className="rounded-3xl bg-gradient-to-br from-[#FFF1F6] via-[#FFF9E8] to-[#E8F8F2] border-2 border-[#F2C7D6] p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded-lg bg-white border border-[#F2BDCE] text-[10.5px] font-extrabold text-[#B83B64]">
                            今日共養探索 · {TOWN_LOCATION_BY_ID[coopSession.locationId].name}
                          </span>
                          <h3 className="text-base font-extrabold text-[#4A3531] mt-1">
                            {coopSession.emoji} {coopSession.title}
                          </h3>
                        </div>
                        <span className="px-2 py-1 rounded-xl bg-white border border-[#BFE3D2] text-[11px] font-extrabold text-[#1F6B54] tabular-nums shrink-0">
                          🔥 連續 {game.coop.townExploreStreakDays ?? 0} 天
                        </span>
                      </div>

                      <p className="text-xs font-medium text-[#5A423C] leading-snug">
                        {coopSession.description}
                      </p>

                      <div className="space-y-2">
                        {coopSession.steps.map((step) => {
                          const pct = Math.min(
                            100,
                            Math.round((step.progress / Math.max(1, step.target)) * 100)
                          );
                          const done = step.progress >= step.target;
                          return (
                            <div
                              key={step.key}
                              className="rounded-2xl bg-white/90 border border-[#EED8D0] p-2.5 space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-xs font-extrabold text-[#4A3531]">
                                <span>
                                  {step.emoji} {step.label}
                                </span>
                                <span
                                  className={`tabular-nums ${
                                    done ? 'text-[#1F6B54]' : 'text-[#B83B64]'
                                  }`}
                                >
                                  {step.progress} / {step.target} {done ? '✓' : ''}
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-[#F3EAE5] overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    done ? 'bg-[#5CC9A7]' : 'bg-[#FF7A9E]'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleGoToLocation(coopSession.locationId)}
                          className="min-h-[44px] rounded-2xl bg-white border-2 border-[#BCE3D2] text-xs font-extrabold text-[#1F6B54]"
                        >
                          前往「{TOWN_LOCATION_BY_ID[coopSession.locationId].name}」
                        </button>
                        <button
                          type="button"
                          disabled={!coopSession.completed || !coopCanClaim}
                          onClick={() => showResult(onClaimCoopTownReward())}
                          className={`min-h-[44px] rounded-2xl text-xs font-extrabold inline-flex items-center justify-center gap-1 transition ${
                            coopSession.completed && !coopCanClaim
                              ? 'bg-[#E6F8F1] text-[#1F6B54]'
                              : coopCanClaim
                              ? 'bg-[#FF7A9E] text-white shadow-[0_3px_0_#D9577B] active:translate-y-0.5'
                              : 'bg-[#E8DDD6] text-[#9A8882] cursor-not-allowed'
                          }`}
                        >
                          <Gift className="w-4 h-4" />
                          <span>
                            {coopSession.completed && !coopCanClaim
                              ? '✓ 今日已領取'
                              : coopCanClaim
                              ? '領取 +8 小鎮券相同獎勵'
                              : '合作進行中'}
                          </span>
                        </button>
                      </div>
                    </section>

                    <section className="rounded-2xl bg-[#FAF4EE] border border-[#EEDFD6] p-3 space-y-1.5 text-[11px] font-bold text-[#6E544E]">
                      <div className="text-xs font-extrabold text-[#4A3531]">
                        🏆 共養探索里程碑
                      </div>
                      <div>
                        {game.coop.unlockedBadges.includes('town_explore_partner') ? '✅' : '🔒'}{' '}
                        連續合作 3 天：解鎖共養徽章「🧭 探險夥伴」（進度{' '}
                        {Math.min(3, game.coop.townExploreStreakDays ?? 0)}/3）
                      </div>
                      <div>
                        {game.encyclopedia.unlockedTitles.includes('town_explorer') ? '✅' : '🔒'}{' '}
                        連續合作 7 天：解鎖專屬稱號「🗺️ 小鎮探險家」（進度{' '}
                        {Math.min(7, game.coop.townExploreStreakDays ?? 0)}/7）
                      </div>
                    </section>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <LakeFishingMiniGame
        open={fishingOpen}
        onClose={() => setFishingOpen(false)}
        onComplete={(caughtCount) => showResult(onSettleFishing(caughtCount))}
      />
    </>
  );
};
