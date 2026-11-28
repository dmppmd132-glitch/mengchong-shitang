import React, { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  Check,
  Gift,
  HeartHandshake,
  History,
  Lock,
  PartyPopper,
  Send,
  Sparkles,
  Ticket,
  Utensils,
  X,
} from 'lucide-react';
import {
  BIRTHDAY_CAKES,
  BIRTHDAY_CAKE_BASE_OPTIONS,
  BIRTHDAY_CAKE_BY_ID,
  BIRTHDAY_CAKE_CREAM_OPTIONS,
  BIRTHDAY_CAKE_DECOR_OPTIONS,
  BIRTHDAY_GIFTS,
  BIRTHDAY_PANTRY_SHOP,
  BIRTHDAY_TICKET_SHOP_ITEMS,
  FRUIT_CAKE_INGREDIENT_IDS,
  ROOM_BIRTHDAY_DECORATIONS,
  YARD_BIRTHDAY_DECORATIONS,
} from '../../data/birthday';
import { INGREDIENTS } from '../../data/kitchen';
import { PHOTO_STICKER_BY_ID } from '../../data/photoStudio';
import { getPetSpeciesInfo } from '../../data/species';
import {
  BirthdayCakeBase,
  BirthdayCakeCream,
  BirthdayCakeDecor,
  BirthdayCakeId,
  BirthdayDecorationId,
  BirthdayGiftId,
  BirthdayLeapChoice,
  BirthdayPantryState,
  CoopBirthdayTaskKey,
  GameState,
  IngredientId,
  PhotoStickerId,
} from '../../types';
import {
  getAllPetBirthdayStatuses,
  getBirthdayStatusForPet,
  getBirthdaySystemState,
  getOrCreateBirthdayCard,
  getOrCreateCoopBirthdaySession,
  getSuggestedFruitForCake,
  isBirthdayTicketShopItemOwned,
} from '../../utils/birthday';
import { AccessoryPreview } from '../AccessoryPreview';
import { BirthdayCakeArt } from './BirthdayCakeArt';
import { RoomPhotoCard } from '../house/RoomPhotoCard';

export type BirthdayModalTab =
  | 'overview'
  | 'cakes'
  | 'gifts_decor'
  | 'card_coop'
  | 'memories';

const CARD_STICKER_CHOICES: PhotoStickerId[] = [
  'bday_happy',
  'bday_heart',
  'bday_candle',
  'bday_gift',
  'bday_streamer',
];

interface BirthdayModalProps {
  open: boolean;
  game: GameState;
  initialTab?: BirthdayModalTab;
  actorName: string;
  currentUserId: string | null;
  notice?: string;
  errorMsg?: string;
  onClearBanner?: () => void;
  onClose: () => void;
  onUpdatePetBirthday: (
    petId: string,
    month: number,
    day: number,
    leapChoice: BirthdayLeapChoice
  ) => void;
  onBuyPantryItem: (itemId: keyof BirthdayPantryState, qty?: number) => void;
  onReserveCake: (petId: string, cakeId: BirthdayCakeId) => void;
  onBakeCake: (params: {
    cakeTypeId: BirthdayCakeId | 'custom';
    petId: string;
    base: BirthdayCakeBase;
    cream: BirthdayCakeCream;
    decors: BirthdayCakeDecor[];
    plaqueText: string;
    fruitIngredientId?: IngredientId;
  }) => void;
  onPlaceCake: (cakeId: string, target: 'room' | 'yard' | null) => void;
  onEatCake: (cakeId: string, petId: string) => void;
  onBuyGift: (giftId: BirthdayGiftId, petId: string) => void;
  onBuyTicketShopItem: (itemId: string, petId: string) => void;
  onBuyOrToggleDecoration: (decorId: BirthdayDecorationId) => void;
  onAddCardBlessing: (params: {
    petId: string;
    text: string;
    stickers: PhotoStickerId[];
  }) => void;
  onFinalizeCard: (petId: string, stickers: PhotoStickerId[]) => void;
  onShareCardToBoard: (cardId: string) => Promise<void> | void;
  onClaimTask: (taskId: string) => void;
  onClaimOrder: (orderId: string) => void;
  onContributeCoopStep: (stepKey: CoopBirthdayTaskKey) => void;
  onClaimCoopReward: () => void;
  onOpenBirthdayPhoto: () => void;
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({
  open,
  game,
  initialTab = 'overview',
  currentUserId,
  notice,
  errorMsg,
  onClearBanner,
  onClose,
  onUpdatePetBirthday,
  onBuyPantryItem,
  onReserveCake,
  onBakeCake,
  onPlaceCake,
  onEatCake,
  onBuyGift,
  onBuyTicketShopItem,
  onBuyOrToggleDecoration,
  onAddCardBlessing,
  onFinalizeCard,
  onShareCardToBoard,
  onClaimTask,
  onClaimOrder,
  onContributeCoopStep,
  onClaimCoopReward,
  onOpenBirthdayPhoto,
}) => {
  const [tab, setTab] = useState<BirthdayModalTab>(initialTab);
  const [selectedPetId, setSelectedPetId] = useState<string>(game.activePetId);

  const selectedPet =
    game.pets.find((p) => p.id === selectedPetId) ??
    game.pets.find((p) => p.id === game.activePetId) ??
    game.pets[0];

  const petStatus = getBirthdayStatusForPet(selectedPet);
  const allStatuses = getAllPetBirthdayStatuses(game);
  const sys = getBirthdaySystemState(game);

  const [editMonth, setEditMonth] = useState<number>(petStatus.month);
  const [editDay, setEditDay] = useState<number>(petStatus.day);
  const [editLeapChoice, setEditLeapChoice] = useState<BirthdayLeapChoice>(
    petStatus.config.leapYearChoice
  );

  const [fruitChoice, setFruitChoice] = useState<IngredientId>(
    getSuggestedFruitForCake(game)
  );
  const [customBase, setCustomBase] = useState<BirthdayCakeBase>('sponge');
  const [customCream, setCustomCream] = useState<BirthdayCakeCream>('strawberry');
  const [customDecors, setCustomDecors] = useState<BirthdayCakeDecor[]>([
    'strawberry',
    'candle',
  ]);
  const [customPlaque, setCustomPlaque] = useState<string>(
    `${selectedPet.name}生日快樂！`
  );

  const [decorSubTab, setDecorSubTab] = useState<'gifts' | 'room' | 'yard' | 'shop'>(
    'gifts'
  );

  const card = getOrCreateBirthdayCard(game, selectedPet.id);
  const cardStickersKey = card.stickers.join(',');
  const stableCardStickers = useMemo<PhotoStickerId[]>(
    () => (cardStickersKey ? (cardStickersKey.split(',') as PhotoStickerId[]) : []),
    [cardStickersKey]
  );
  const [blessingText, setBlessingText] = useState<string>('');
  const [cardStickers, setCardStickers] = useState<PhotoStickerId[]>(stableCardStickers);
  const [sharingCard, setSharingCard] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setSelectedPetId((prev) =>
        game.pets.some((p) => p.id === prev) ? prev : game.activePetId
      );
    }
  }, [open, initialTab, game.activePetId, game.pets]);

  useEffect(() => {
    if (!open) return;
    setEditMonth(petStatus.month);
    setEditDay(petStatus.day);
    setEditLeapChoice(petStatus.config.leapYearChoice);
    setCustomPlaque(`${selectedPet.name}生日快樂！`);
    setCardStickers(stableCardStickers);
  }, [
    open,
    selectedPet.id,
    selectedPet.name,
    petStatus.month,
    petStatus.day,
    petStatus.config.leapYearChoice,
    card.id,
    stableCardStickers,
  ]);

  if (!open) return null;

  const maxDayForEditMonth =
    editMonth === 2 ? 29 : new Date(2024, editMonth, 0).getDate();

  const toggleCustomDecor = (decorId: BirthdayCakeDecor) => {
    setCustomDecors((prev) =>
      prev.includes(decorId)
        ? prev.length > 1
          ? prev.filter((d) => d !== decorId)
          : prev
        : [...prev, decorId].slice(0, 5)
    );
  };

  const toggleCardSticker = (stickerId: PhotoStickerId) => {
    setCardStickers((prev) =>
      prev.includes(stickerId)
        ? prev.filter((s) => s !== stickerId)
        : [...prev, stickerId].slice(0, 6)
    );
  };

  const reservedCakeId = sys.reservedCakeByPetId[selectedPet.id] ?? null;
  const reservedCakeDef = reservedCakeId
    ? BIRTHDAY_CAKE_BY_ID[reservedCakeId]
    : null;
  const coopSession = getOrCreateCoopBirthdaySession(game);
  const coopAllDone = coopSession.steps.every((s) => s.progress >= s.target);
  const coopActorKey = currentUserId || 'local';
  const coopRewardClaimed = coopSession.claimedByUserIds.includes(coopActorKey);
  const birthdayStreak = game.coop.birthdayStreak ?? 0;

  const birthdayPhotos = game.house.photos.filter(
    (p) =>
      p.scene === 'birthday' ||
      p.photoKind === 'birthday' ||
      (sys.birthdayPhotosByYearKey[petStatus.yearKey] ?? []).includes(p.id)
  );
  const birthdayMemories = game.memoryAlbum.memories
    .filter((m) => m.type === 'birthday')
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center bg-[#3C2824]/55 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="生日派對中心"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] max-h-[92vh] rounded-t-3xl sm:rounded-3xl bg-[#FFF9F2] border-2 border-[#F2C6D8] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 bg-gradient-to-r from-[#FFE3EF] via-[#FFF4DB] to-[#FFE8F3] border-b border-[#F2D1DE] px-4 py-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🎂</span>
              <h2 className="text-base font-extrabold text-[#4A3531] truncate">
                生日派對中心
              </h2>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] font-extrabold tabular-nums">
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#FFFDF8] border border-[#F3C5D8] px-2 py-0.5 text-[#B83B64]">
                <Ticket className="w-3.5 h-3.5" />
                {sys.tickets.balance} 張生日券
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#FFFDF8] border border-[#EFD7A8] px-2 py-0.5 text-[#8A5610]">
                🪙 {game.coins}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="關閉生日派對中心"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/90 border border-[#EED2DC] text-[#6E544E] flex items-center justify-center hover:bg-white active:scale-95 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
          {allStatuses.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {allStatuses.map((st) => {
                const petObj = game.pets.find((p) => p.id === st.petId);
                const sp = petObj ? getPetSpeciesInfo(petObj.species) : null;
                const active = st.petId === selectedPet.id;
                return (
                  <button
                    key={st.petId}
                    type="button"
                    onClick={() => setSelectedPetId(st.petId)}
                    className={`min-h-[40px] px-3 rounded-2xl border text-xs font-extrabold inline-flex items-center gap-1.5 shrink-0 transition ${
                      active
                        ? 'bg-[#FFE7F0] border-[#EC7FA3] text-[#B83B64]'
                        : 'bg-white border-[#EFE0D7] text-[#6E544E]'
                    }`}
                  >
                    <span>{sp?.emoji ?? '🐾'}</span>
                    <span>{st.petName}</span>
                    {st.isTodayBirthday ? (
                      <span className="text-[10px] text-[#D64470]">🎂今天</span>
                    ) : st.isCountdown ? (
                      <span className="text-[10px] text-[#9D5B12] tabular-nums">
                        {st.daysUntil}天
                      </span>
                    ) : st.isReviewPeriod ? (
                      <span className="text-[10px] text-[#1F6B54]">回顧</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}

          <div
            className={`rounded-2xl border-2 p-3 space-y-2 ${
              petStatus.isTodayBirthday
                ? 'bg-gradient-to-br from-[#FFE4F0] via-[#FFF6DC] to-[#FFEAF3] border-[#F093B5]'
                : petStatus.isCountdown
                ? 'bg-gradient-to-br from-[#FFF4DC] to-[#FFEAF1] border-[#F2C38F]'
                : petStatus.isReviewPeriod
                ? 'bg-gradient-to-br from-[#E9F9F2] to-[#FFF9EE] border-[#A7DFC8]'
                : 'bg-white border-[#F0DDE3]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold text-[#7D635D]">
                  壽星檔案：{selectedPet.name} · 生日 {petStatus.dateLabel}
                </div>
                <p className="mt-0.5 text-sm font-extrabold text-[#4A3531]">
                  {petStatus.countdownText}
                </p>
                <p className="mt-0.5 text-[11px] text-[#6E544E]">
                  {petStatus.isTodayBirthday
                    ? '蛋糕、禮物、合照與賀卡全部解鎖中！錯過也沒關係，沒有懲罰機制。'
                    : petStatus.isCountdown
                    ? '倒數期間可先預約蛋糕、準備禮物與佈置房間，迎接生日派對！'
                    : petStatus.isReviewPeriod
                    ? '生日後 3 天回顧期，可重溫慶生照片、賀卡祝福與專屬回憶！'
                    : '任何時候都可以先準備蛋糕或設定專屬生日，一起留下溫暖回憶。'}
                </p>
              </div>
              <span className="text-2xl shrink-0">
                {petStatus.isTodayBirthday
                  ? '🎂'
                  : petStatus.isCountdown
                  ? '🎈'
                  : petStatus.isReviewPeriod
                  ? '🎞️'
                  : '🗓️'}
              </span>
            </div>

            {reservedCakeDef && (
              <div className="rounded-xl bg-white/85 border border-[#F0D5DF] px-2.5 py-1.5 text-[11px] font-extrabold text-[#9A4262] flex items-center justify-between gap-2">
                <span>
                  已預約派對蛋糕：{reservedCakeDef.emoji} {reservedCakeDef.name}
                </span>
                <button
                  type="button"
                  onClick={() => setTab('cakes')}
                  className="text-[11px] underline text-[#D64470]"
                >
                  前往烘焙
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={onOpenBirthdayPhoto}
                className="min-h-[40px] rounded-xl bg-[#FF7EA8] text-white text-[11px] font-extrabold inline-flex items-center justify-center gap-1 hover:opacity-95 active:scale-95 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>拍生日合照</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('cakes')}
                className="min-h-[40px] rounded-xl bg-white border border-[#ECC3D2] text-[#B83B64] text-[11px] font-extrabold inline-flex items-center justify-center gap-1 hover:bg-[#FFF5F8] transition"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>做生日蛋糕</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('card_coop')}
                className="min-h-[40px] rounded-xl bg-white border border-[#BDE4D5] text-[#1F6B54] text-[11px] font-extrabold inline-flex items-center justify-center gap-1 hover:bg-[#F1FBF7] transition"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>共養寫賀卡</span>
              </button>
            </div>
          </div>

          {(notice || errorMsg) && (
            <div
              className={`rounded-2xl border px-3 py-2 text-xs font-extrabold flex items-center justify-between gap-2 ${
                errorMsg
                  ? 'bg-[#FFEAF0] border-[#F4B4C7] text-[#B83B64]'
                  : 'bg-[#E7F9F1] border-[#ADE2CB] text-[#1F6B54]'
              }`}
            >
              <span>{errorMsg || notice}</span>
              {onClearBanner && (
                <button
                  type="button"
                  onClick={onClearBanner}
                  aria-label="關閉訊息"
                  className="min-h-[32px] min-w-[32px] flex items-center justify-center shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div
            role="tablist"
            aria-label="生日派對功能分頁"
            className="grid grid-cols-5 gap-1 rounded-2xl bg-[#F3E4DF] p-1"
          >
            {(
              [
                { key: 'overview', label: '壽星', icon: PartyPopper },
                { key: 'cakes', label: '蛋糕', icon: Utensils },
                { key: 'gifts_decor', label: '禮與飾', icon: Gift },
                { key: 'card_coop', label: '賀卡', icon: HeartHandshake },
                { key: 'memories', label: '回憶', icon: History },
              ] as {
                key: BirthdayModalTab;
                label: string;
                icon: React.ComponentType<{ className?: string }>;
              }[]
            ).map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`min-h-[44px] rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center gap-0.5 transition ${
                    active
                      ? 'bg-white text-[#D64470] shadow-xs'
                      : 'text-[#6E544E] hover:text-[#4A3531]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {tab === 'overview' && (
            <div className="space-y-3">
              <section className="rounded-2xl bg-white border border-[#EFE0D7] p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-extrabold text-[#4A3531]">
                    📅 {selectedPet.name}的生日設定
                  </h3>
                  <span className="text-[11px] font-bold text-[#7D635D]">
                    {petStatus.config.customized ? '已自訂月／日' : '預設領養日'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1 text-[11px] font-bold text-[#6E544E]">
                    <span>月份</span>
                    <select
                      value={editMonth}
                      onChange={(e) => {
                        const nextM = Number(e.target.value);
                        setEditMonth(nextM);
                        const cap =
                          nextM === 2 ? 29 : new Date(2024, nextM, 0).getDate();
                        if (editDay > cap) setEditDay(cap);
                      }}
                      className="w-full min-h-[44px] rounded-xl bg-[#FFFDF8] border border-[#E5C9B0] px-2.5 text-sm font-extrabold text-[#4A3531]"
                    >
                      {Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => (
                        <option key={m} value={m}>
                          {m} 月
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 text-[11px] font-bold text-[#6E544E]">
                    <span>日期</span>
                    <select
                      value={editDay}
                      onChange={(e) => setEditDay(Number(e.target.value))}
                      className="w-full min-h-[44px] rounded-xl bg-[#FFFDF8] border border-[#E5C9B0] px-2.5 text-sm font-extrabold text-[#4A3531]"
                    >
                      {Array.from({ length: maxDayForEditMonth }, (_, idx) => idx + 1).map(
                        (d) => (
                          <option key={d} value={d}>
                            {d} 日
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>

                {editMonth === 2 && editDay === 29 && (
                  <div className="rounded-xl bg-[#FFF5F8] border border-[#F3C8D7] p-2.5 space-y-1.5">
                    <div className="text-[11px] font-extrabold text-[#B83B64]">
                      ✨ 2 月 29 日閏年慶祝設定（非閏年時慶祝日）：
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditLeapChoice('feb28')}
                        className={`min-h-[40px] rounded-xl border text-xs font-extrabold transition ${
                          editLeapChoice === 'feb28'
                            ? 'bg-[#FF8EB4] border-[#D64470] text-white'
                            : 'bg-white border-[#E5C9B0] text-[#6E544E]'
                        }`}
                      >
                        2 月 28 日慶祝
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditLeapChoice('mar1')}
                        className={`min-h-[40px] rounded-xl border text-xs font-extrabold transition ${
                          editLeapChoice === 'mar1'
                            ? 'bg-[#FF8EB4] border-[#D64470] text-white'
                            : 'bg-white border-[#E5C9B0] text-[#6E544E]'
                        }`}
                      >
                        3 月 1 日慶祝
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    onUpdatePetBirthday(
                      selectedPet.id,
                      editMonth,
                      editDay,
                      editLeapChoice
                    )
                  }
                  className="w-full min-h-[44px] rounded-2xl bg-[#FF7EA8] text-white text-xs font-extrabold hover:opacity-95 active:scale-[0.99] transition"
                >
                  儲存 {selectedPet.name} 的生日（{editMonth} 月 {editDay} 日）
                </button>
              </section>

              <section className="rounded-2xl bg-white border border-[#EFE0D7] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#4A3531]">
                    🎫 今日生日任務
                  </h3>
                  <span className="text-[11px] font-bold text-[#7D635D]">
                    每日登入 +1 券 · 生日當天 +10 券
                  </span>
                </div>

                <div className="space-y-2">
                  {sys.tasks.map((task) => {
                    const pct = Math.min(
                      100,
                      Math.round((task.progress / task.target) * 100)
                    );
                    return (
                      <div
                        key={task.id}
                        className="rounded-xl bg-[#FFFDF8] border border-[#F0E2DA] p-2.5 flex items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span>{task.emoji}</span>
                            <span className="text-xs font-extrabold text-[#4A3531] truncate">
                              {task.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7D635D]">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-[#EFE3DC] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#FF8EB4]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-extrabold text-[#7D635D] tabular-nums">
                              {task.progress}/{task.target}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!task.completed || task.claimed}
                          onClick={() => onClaimTask(task.id)}
                          className={`min-h-[44px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 transition ${
                            task.claimed
                              ? 'bg-[#EAE4E1] text-[#8F7B74]'
                              : task.completed
                              ? 'bg-[#5CC9A7] text-white hover:opacity-95 active:scale-95'
                              : 'bg-[#F8EFEA] text-[#9A857E]'
                          }`}
                        >
                          {task.claimed
                            ? '已領取'
                            : task.completed
                            ? `+${task.rewardTickets}券`
                            : `${task.rewardTickets}券`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl bg-white border border-[#EFE0D7] p-3 space-y-2">
                <h3 className="text-xs font-extrabold text-[#4A3531]">
                  📦 生日限定訂單（+5～10 張生日券）
                </h3>
                <div className="space-y-2">
                  {sys.orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl bg-[#FFFDF8] border border-[#F0E2DA] p-2.5 flex items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold text-[#4A3531]">
                          {order.emoji} {order.title}
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#7D635D]">
                          {order.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!order.completed || order.claimed}
                        onClick={() => onClaimOrder(order.id)}
                        className={`min-h-[44px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 transition ${
                          order.claimed
                            ? 'bg-[#EAE4E1] text-[#8F7B74]'
                            : order.completed
                            ? 'bg-[#FF8EB4] text-white hover:opacity-95 active:scale-95'
                            : 'bg-[#F8EFEA] text-[#9A857E]'
                        }`}
                      >
                        {order.claimed
                          ? '已完成'
                          : order.completed
                          ? `領 +${order.rewardTickets}券`
                          : `+${order.rewardTickets}券`}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {tab === 'cakes' && (
            <div className="space-y-3">
              <section className="rounded-2xl bg-white border border-[#EFE0D7] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#4A3531]">
                    🧈 烘焙材料櫃（奶油／糖／冰淇淋）
                  </h3>
                  <span className="text-[11px] font-bold text-[#7D635D] tabular-nums">
                    金幣：{game.coins}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {BIRTHDAY_PANTRY_SHOP.map((item) => {
                    const count = sys.pantry[item.id] ?? 0;
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl bg-[#FFFDF8] border border-[#F0E2DA] p-2 flex flex-col justify-between gap-1.5"
                      >
                        <div>
                          <div className="text-xs font-extrabold text-[#4A3531]">
                            {item.emoji} {item.name}
                          </div>
                          <div className="text-[11px] font-extrabold text-[#B83B64] tabular-nums">
                            庫存 {count}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onBuyPantryItem(item.id, 1)}
                          className="min-h-[38px] rounded-lg bg-[#FFF3DB] border border-[#EED3A1] text-[11px] font-extrabold text-[#8A5610] hover:bg-[#FFEBC2] active:scale-95 transition tabular-nums"
                        >
                          +1（{item.priceCoins}幣）
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              {sys.cakes.filter((c) => !c.eaten).length > 0 && (
                <section className="rounded-2xl bg-white border border-[#F2C8D7] p-3 space-y-2">
                  <h3 className="text-xs font-extrabold text-[#4A3531]">
                    🎂 已完成的生日蛋糕（可擺進房間／庭院或切開享用）
                  </h3>
                  <div className="space-y-2">
                    {sys.cakes
                      .filter((c) => !c.eaten)
                      .map((cake) => (
                        <div
                          key={cake.id}
                          className="rounded-xl bg-[#FFF9FB] border border-[#F4D6E1] p-2.5 flex items-center gap-2.5"
                        >
                          <BirthdayCakeArt
                            base={cake.base}
                            cream={cake.cream}
                            decors={cake.decors}
                            size={66}
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-extrabold text-[#4A3531] truncate">
                                {cake.name}
                              </span>
                              {cake.placedIn && (
                                <span className="text-[10px] font-extrabold text-[#1F6B54] shrink-0">
                                  {cake.placedIn === 'room' ? '已擺房間' : '已擺庭院'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#7D635D] truncate">
                              🏷️ 「{cake.plaqueText}」 · 心情 +{cake.moodBonus} · 親密 +
                              {cake.intimacyBonus}
                            </p>
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onPlaceCake(
                                    cake.id,
                                    cake.placedIn === 'room' ? null : 'room'
                                  )
                                }
                                className={`min-h-[36px] px-2.5 rounded-lg border text-[11px] font-extrabold transition ${
                                  cake.placedIn === 'room'
                                    ? 'bg-[#E6F8F0] border-[#9ADBC2] text-[#1F6B54]'
                                    : 'bg-white border-[#E5C9B0] text-[#5A3E36]'
                                }`}
                              >
                                {cake.placedIn === 'room' ? '收回房間' : '擺進房間'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onPlaceCake(
                                    cake.id,
                                    cake.placedIn === 'yard' ? null : 'yard'
                                  )
                                }
                                className={`min-h-[36px] px-2.5 rounded-lg border text-[11px] font-extrabold transition ${
                                  cake.placedIn === 'yard'
                                    ? 'bg-[#E6F8F0] border-[#9ADBC2] text-[#1F6B54]'
                                    : 'bg-white border-[#E5C9B0] text-[#5A3E36]'
                                }`}
                              >
                                {cake.placedIn === 'yard' ? '收回庭院' : '擺進庭院'}
                              </button>
                              <button
                                type="button"
                                onClick={() => onEatCake(cake.id, selectedPet.id)}
                                className="min-h-[36px] px-2.5 rounded-lg bg-[#FF7EA8] text-white text-[11px] font-extrabold hover:opacity-95 active:scale-95 transition"
                              >
                                切蛋糕一起吃
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              <section className="rounded-2xl bg-white border border-[#EFE0D7] p-3 space-y-2.5">
                <h3 className="text-xs font-extrabold text-[#4A3531]">
                  🍰 經典派對蛋糕食譜（可預約或立即烘焙）
                </h3>
                <div className="space-y-2">
                  {BIRTHDAY_CAKES.map((cakeDef) => {
                    const isLimitedLocked =
                      Boolean(cakeDef.limitedTicketUnlock) &&
                      !sys.unlockedLimitedCakeRecipe;
                    const isReserved = reservedCakeId === cakeDef.id;
                    const ingText = cakeDef.requiresFruitChoice
                      ? '任選水果 2'
                      : Object.entries(cakeDef.recipeIngredients)
                          .map(
                            ([id, q]) =>
                              `${INGREDIENTS[id as IngredientId]?.name ?? id} ${q}`
                          )
                          .join('、');
                    const pantryText = [
                      cakeDef.pantryCost.cream > 0
                        ? `奶油 ${cakeDef.pantryCost.cream}`
                        : null,
                      cakeDef.pantryCost.sugar > 0
                        ? `糖 ${cakeDef.pantryCost.sugar}`
                        : null,
                      cakeDef.pantryCost.iceCream > 0
                        ? `冰淇淋 ${cakeDef.pantryCost.iceCream}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join('、');

                    return (
                      <div
                        key={cakeDef.id}
                        className="rounded-xl bg-[#FFFDF8] border border-[#F0E2DA] p-2.5 space-y-2"
                      >
                        <div className="flex items-start gap-2.5">
                          <BirthdayCakeArt
                            base={cakeDef.defaultBase}
                            cream={cakeDef.defaultCream}
                            decors={cakeDef.defaultDecors}
                            size={58}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-extrabold text-[#4A3531]">
                                {cakeDef.emoji} {cakeDef.name}
                              </span>
                              <span className="text-[10px] font-extrabold text-[#B83B64] tabular-nums">
                                心情+{cakeDef.moodBonus} 親密+{cakeDef.intimacyBonus}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-[#7D635D]">
                              材料：{[ingText, pantryText].filter(Boolean).join('、')}
                            </p>
                            {cakeDef.requiresFruitChoice && (
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="text-[10px] font-extrabold text-[#6E544E]">
                                  水果：
                                </span>
                                <select
                                  value={fruitChoice}
                                  onChange={(e) =>
                                    setFruitChoice(e.target.value as IngredientId)
                                  }
                                  className="min-h-[32px] rounded-lg bg-white border border-[#E5C9B0] px-2 text-[11px] font-extrabold text-[#4A3531]"
                                >
                                  {FRUIT_CAKE_INGREDIENT_IDS.map((fId) => (
                                    <option key={fId} value={fId}>
                                      {INGREDIENTS[fId].emoji} {INGREDIENTS[fId].name}（
                                      {game.ingredients[fId] ?? 0}）
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onReserveCake(selectedPet.id, cakeDef.id)}
                            className={`min-h-[40px] px-3 rounded-xl border text-[11px] font-extrabold transition ${
                              isReserved
                                ? 'bg-[#FFEAF2] border-[#EC7FA3] text-[#B83B64]'
                                : 'bg-white border-[#E5C9B0] text-[#6E544E]'
                            }`}
                          >
                            {isReserved ? '✓ 已預約' : '預約蛋糕'}
                          </button>

                          {isLimitedLocked ? (
                            <button
                              type="button"
                              onClick={() => {
                                setTab('gifts_decor');
                                setDecorSubTab('shop');
                              }}
                              className="flex-1 min-h-[40px] rounded-xl bg-[#F6ECE8] text-[#8E6F66] text-[11px] font-extrabold inline-flex items-center justify-center gap-1"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>{cakeDef.limitedTicketUnlock} 張生日券解鎖食譜</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                onBakeCake({
                                  cakeTypeId: cakeDef.id,
                                  petId: selectedPet.id,
                                  base: cakeDef.defaultBase,
                                  cream: cakeDef.defaultCream,
                                  decors: cakeDef.defaultDecors,
                                  plaqueText: `${selectedPet.name}生日快樂！`,
                                  fruitIngredientId: cakeDef.requiresFruitChoice
                                    ? fruitChoice
                                    : undefined,
                                })
                              }
                              className="flex-1 min-h-[40px] rounded-xl bg-[#FF7EA8] text-white text-[11px] font-extrabold hover:opacity-95 active:scale-95 transition"
                            >
                              立即烘焙製作
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl bg-white border border-[#EFE0D7] p-3 space-y-2.5">
                <h3 className="text-xs font-extrabold text-[#4A3531]">
                  🎨 自訂生日蛋糕工坊（基底 × 奶油 × 裝飾 × 專屬字牌）
                </h3>

                <div className="rounded-2xl bg-[#FFF6FA] border border-[#F3D5E1] py-2 flex flex-col items-center">
                  <BirthdayCakeArt
                    base={customBase}
                    cream={customCream}
                    decors={customDecors}
                    plaqueText={customPlaque}
                    showPlaque
                    size={104}
                  />
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-[11px] font-extrabold text-[#6E544E] mb-1">
                      1. 選擇蛋糕基底
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {BIRTHDAY_CAKE_BASE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCustomBase(opt.id)}
                          className={`min-h-[40px] rounded-xl border px-2 text-[11px] font-extrabold transition ${
                            customBase === opt.id
                              ? 'bg-[#FFE7F0] border-[#EC7FA3] text-[#B83B64]'
                              : 'bg-[#FFFDF8] border-[#E8D6CE] text-[#5A3E36]'
                          }`}
                        >
                          {opt.emoji} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-extrabold text-[#6E544E] mb-1">
                      2. 選擇奶油口味
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {BIRTHDAY_CAKE_CREAM_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCustomCream(opt.id)}
                          className={`min-h-[40px] rounded-xl border px-2 text-[11px] font-extrabold transition ${
                            customCream === opt.id
                              ? 'bg-[#FFE7F0] border-[#EC7FA3] text-[#B83B64]'
                              : 'bg-[#FFFDF8] border-[#E8D6CE] text-[#5A3E36]'
                          }`}
                        >
                          {opt.emoji} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-extrabold text-[#6E544E] mb-1">
                      3. 挑選蛋糕裝飾（可複選）
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {BIRTHDAY_CAKE_DECOR_OPTIONS.map((opt) => {
                        const active = customDecors.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleCustomDecor(opt.id)}
                            className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                              active
                                ? 'bg-[#E6F8F0] border-[#78C9AA] text-[#1F6B54]'
                                : 'bg-[#FFFDF8] border-[#E8D6CE] text-[#5A3E36]'
                            }`}
                          >
                            {opt.emoji} {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-[11px] font-extrabold text-[#6E544E]">
                      4. 寫上名字與祝福字牌（最多 18 字）
                    </span>
                    <input
                      type="text"
                      maxLength={18}
                      value={customPlaque}
                      onChange={(e) => setCustomPlaque(e.target.value)}
                      placeholder={`${selectedPet.name}生日快樂！`}
                      className="w-full min-h-[44px] rounded-xl bg-[#FFFDF8] border border-[#E5C9B0] px-3 text-xs font-bold text-[#4A3531]"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onBakeCake({
                      cakeTypeId: 'custom',
                      petId: selectedPet.id,
                      base: customBase,
                      cream: customCream,
                      decors: customDecors,
                      plaqueText: customPlaque,
                    })
                  }
                  className="w-full min-h-[44px] rounded-2xl bg-[#5CC9A7] text-white text-xs font-extrabold hover:opacity-95 active:scale-[0.99] transition"
                >
                  烘焙客製蛋糕（需奶油 1、糖 1）
                </button>
              </section>
            </div>
          )}

          {tab === 'gifts_decor' && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-1 rounded-xl bg-[#F5E7E2] p-1">
                {(
                  [
                    { key: 'gifts', label: '🎁 禮物' },
                    { key: 'room', label: '🏠 房間' },
                    { key: 'yard', label: '🌿 庭院' },
                    { key: 'shop', label: '🎫 券商店' },
                  ] as const
                ).map((sub) => (
                  <button
                    key={sub.key}
                    type="button"
                    onClick={() => setDecorSubTab(sub.key)}
                    className={`min-h-[40px] rounded-lg text-[11px] font-extrabold transition ${
                      decorSubTab === sub.key
                        ? 'bg-white text-[#D64470] shadow-xs'
                        : 'text-[#6E544E]'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {decorSubTab === 'gifts' && (
                <div className="space-y-2">
                  {BIRTHDAY_GIFTS.map((gift) => {
                    const isOwned =
                      gift.category !== 'box' &&
                      (sys.ownedGiftIds.includes(gift.id) ||
                        (gift.category === 'accessory' &&
                          Boolean(gift.targetId) &&
                          game.accessories.includes(gift.targetId!)) ||
                        (gift.id === 'birthday_frame' &&
                          (game.photoStudio?.unlockedFrames.includes('birthday_frame') ??
                            false)) ||
                        (gift.id === 'birthday_bg' &&
                          (game.photoStudio?.unlockedBackgrounds.includes('birthday_bg') ??
                            false)) ||
                        (gift.id === 'birthday_balloons' &&
                          sys.ownedYardDecorIds.includes('yard_balloons')) ||
                        (gift.id === 'birthday_streamers' &&
                          sys.ownedRoomDecorIds.includes('room_streamers')));

                    return (
                      <div
                        key={gift.id}
                        className="rounded-2xl bg-white border border-[#EFE0D7] p-2.5 flex items-center gap-2.5"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#FFF6FA] border border-[#F3D5E1] flex items-center justify-center shrink-0">
                          {gift.category === 'accessory' && gift.targetId ? (
                            <AccessoryPreview accessoryId={gift.targetId} />
                          ) : (
                            <span className="text-2xl">{gift.emoji}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-[#4A3531] truncate">
                              {gift.name}
                            </span>
                            <span className="text-[10px] font-extrabold text-[#D64470]">
                              心情+{gift.moodBonus}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#7D635D] line-clamp-2">
                            {gift.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isOwned}
                          onClick={() => onBuyGift(gift.id, selectedPet.id)}
                          className={`min-h-[44px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 tabular-nums transition ${
                            isOwned
                              ? 'bg-[#E9F8F1] text-[#1F6B54]'
                              : gift.currency === 'birthday_tickets'
                              ? 'bg-[#FF7EA8] text-white hover:opacity-95 active:scale-95'
                              : 'bg-[#FFF3DB] border border-[#EED3A1] text-[#8A5610] hover:bg-[#FFEBC2] active:scale-95'
                          }`}
                        >
                          {isOwned
                            ? '已擁有'
                            : gift.currency === 'birthday_tickets'
                            ? `${gift.price} 券`
                            : `${gift.price} 幣`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {(decorSubTab === 'room' || decorSubTab === 'yard') && (
                <div className="space-y-2">
                  <div className="rounded-xl bg-[#EFFAF5] border border-[#B5E5D1] px-3 py-2 text-[11px] font-bold text-[#1F6B54]">
                    ✨ 派對佈置不會覆蓋或改動原本的家具與庭院擺設，隨時都能一鍵開啟或收起！
                  </div>
                  {(decorSubTab === 'room'
                    ? ROOM_BIRTHDAY_DECORATIONS
                    : YARD_BIRTHDAY_DECORATIONS
                  ).map((decor) => {
                    const owned =
                      decor.target === 'room'
                        ? sys.ownedRoomDecorIds.includes(decor.id)
                        : sys.ownedYardDecorIds.includes(decor.id);
                    const active =
                      decor.target === 'room'
                        ? sys.activeRoomDecorIds.includes(decor.id)
                        : sys.activeYardDecorIds.includes(decor.id);
                    return (
                      <div
                        key={decor.id}
                        className="rounded-2xl bg-white border border-[#EFE0D7] p-2.5 flex items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span>{decor.emoji}</span>
                            <span className="text-xs font-extrabold text-[#4A3531]">
                              {decor.name}
                            </span>
                            <span className="text-[10px] font-extrabold text-[#D64470]">
                              心情+{decor.moodBonus}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#7D635D]">
                            {decor.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onBuyOrToggleDecoration(decor.id)}
                          className={`min-h-[44px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 transition tabular-nums ${
                            owned
                              ? active
                                ? 'bg-[#5CC9A7] text-white'
                                : 'bg-[#F3ECE9] text-[#6E544E]'
                              : 'bg-[#FFF3DB] border border-[#EED3A1] text-[#8A5610]'
                          }`}
                        >
                          {owned
                            ? active
                              ? '顯示中'
                              : '已收起'
                            : `${decor.priceCoins} 幣`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {decorSubTab === 'shop' && (
                <div className="space-y-2">
                  <div className="rounded-xl bg-[#FFF3F8] border border-[#F2C8D8] px-3 py-2 flex items-center justify-between text-xs font-extrabold text-[#B83B64]">
                    <span>🎫 我的生日券餘額</span>
                    <span className="tabular-nums">{sys.tickets.balance} 張</span>
                  </div>
                  {BIRTHDAY_TICKET_SHOP_ITEMS.map((item) => {
                    const owned = isBirthdayTicketShopItemOwned(game, item.id);
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white border border-[#EFE0D7] p-2.5 flex items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{item.emoji}</span>
                            <span className="text-xs font-extrabold text-[#4A3531] truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-bold text-[#9A4262] shrink-0">
                              {item.badgeText}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#7D635D]">
                            {item.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={owned}
                          onClick={() => onBuyTicketShopItem(item.id, selectedPet.id)}
                          className={`min-h-[44px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 tabular-nums transition ${
                            owned
                              ? 'bg-[#E9F8F1] text-[#1F6B54]'
                              : 'bg-[#FF7EA8] text-white hover:opacity-95 active:scale-95'
                          }`}
                        >
                          {owned ? '已擁有' : `${item.ticketPrice} 券`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'card_coop' && (
            <div className="space-y-3">
              <section className="rounded-2xl bg-gradient-to-br from-[#FFF4F8] to-[#FFFDF4] border-2 border-[#F2C6D8] p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#4A3531]">
                      💌 給 {selectedPet.name} 的生日賀卡
                    </h3>
                    <p className="text-[11px] text-[#7D635D]">
                      共養雙方都能寫祝福語和貼貼圖，完成後存入回憶也可分享到留言板！
                    </p>
                  </div>
                  {card.completed && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-extrabold text-[#1F6B54] shrink-0">
                      <Check className="w-3.5 h-3.5" />
                      已存回憶
                    </span>
                  )}
                </div>

                {card.blessings.length > 0 ? (
                  <div className="space-y-1.5 rounded-xl bg-white/90 border border-[#F2D5DF] p-2.5">
                    {card.blessings.map((b, idx) => (
                      <div
                        key={`${b.userId}_${b.createdAt}_${idx}`}
                        className="text-xs text-[#4A3531] leading-relaxed"
                      >
                        <span className="font-extrabold text-[#B83B64]">
                          {b.userName}：
                        </span>
                        <span>「{b.text}」</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-white/80 border border-dashed border-[#E8C5D3] p-2.5 text-center text-[11px] text-[#8E766E]">
                    還沒有人寫祝福喔，成為第一個送上暖心祝賀的人吧！
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-extrabold text-[#6E544E] mb-1">
                    選擇賀卡貼圖
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CARD_STICKER_CHOICES.map((stId) => {
                      const meta = PHOTO_STICKER_BY_ID[stId];
                      const active = cardStickers.includes(stId);
                      return (
                        <button
                          key={stId}
                          type="button"
                          onClick={() => toggleCardSticker(stId)}
                          className={`min-h-[38px] px-2.5 rounded-xl border text-[11px] font-extrabold transition ${
                            active
                              ? 'bg-[#FFE7F0] border-[#EC7FA3] text-[#B83B64]'
                              : 'bg-white border-[#E5C9B0] text-[#5A3E36]'
                          }`}
                        >
                          {meta?.emoji ?? '🎂'} {meta?.label ?? stId}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={120}
                    value={blessingText}
                    onChange={(e) => setBlessingText(e.target.value)}
                    placeholder={`寫一句話祝福 ${selectedPet.name}...`}
                    className="flex-1 min-w-0 min-h-[44px] rounded-xl bg-white border border-[#E5C9B0] px-3 text-xs font-bold text-[#4A3531]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onAddCardBlessing({
                        petId: selectedPet.id,
                        text: blessingText,
                        stickers: cardStickers,
                      });
                      setBlessingText('');
                    }}
                    className="min-h-[44px] px-3 rounded-xl bg-[#FF7EA8] text-white text-xs font-extrabold shrink-0 hover:opacity-95 active:scale-95 transition"
                  >
                    寫上祝福
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onFinalizeCard(selectedPet.id, cardStickers)}
                    className="min-h-[44px] rounded-xl bg-[#5CC9A7] text-white text-xs font-extrabold hover:opacity-95 active:scale-95 transition"
                  >
                    {card.completed ? '更新並保存回憶' : '完成賀卡存回憶'}
                  </button>
                  <button
                    type="button"
                    disabled={sharingCard || card.blessings.length === 0}
                    onClick={async () => {
                      setSharingCard(true);
                      try {
                        await onShareCardToBoard(card.id);
                      } finally {
                        setSharingCard(false);
                      }
                    }}
                    className="min-h-[44px] rounded-xl bg-white border border-[#EC7FA3] text-[#B83B64] text-xs font-extrabold inline-flex items-center justify-center gap-1 disabled:opacity-50 hover:bg-[#FFF5F8] transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{card.sharedToBoard ? '再次分享留言板' : '分享到留言板'}</span>
                  </button>
                </div>
              </section>

              <section className="rounded-2xl bg-white border border-[#BEE5D6] p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#1F6B54]">
                      💞 共養生日合作：為 {coopSession.petName} 慶生
                    </h3>
                    <p className="text-[11px] text-[#6E544E]">
                      完成全部 4 項合作準備，雙方皆可領 +8 生日券、+80 金幣、+6 親密度！
                    </p>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#1F6B54] tabular-nums shrink-0">
                    累計 {birthdayStreak} 次
                  </span>
                </div>

                <div className="space-y-2">
                  {coopSession.steps.map((step) => {
                    const done = step.progress >= step.target;
                    return (
                      <div
                        key={step.key}
                        className="rounded-xl bg-[#F8FDFB] border border-[#D4EFE3] p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold text-[#4A3531]">
                            {step.emoji} {step.label}
                          </div>
                          <div className="mt-0.5 text-[11px] font-bold text-[#1F6B54] tabular-nums">
                            已完成 {step.progress} / {step.target}
                            {step.contributorNames.length > 0
                              ? ` · 參與：${step.contributorNames.join('、')}`
                              : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={done || coopSession.completed}
                          onClick={() => onContributeCoopStep(step.key)}
                          className={`min-h-[40px] px-3 rounded-xl text-[11px] font-extrabold shrink-0 transition ${
                            done
                              ? 'bg-[#DDF5EA] text-[#1F6B54]'
                              : 'bg-[#5CC9A7] text-white hover:opacity-95 active:scale-95'
                          }`}
                        >
                          {done ? '✓ 已完成' : '一起準備'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl bg-[#FFFDF8] border border-[#EFE0D7] px-3 py-2 text-[11px] text-[#6E544E]">
                  🏆 共養里程碑：一起慶生 3 次解鎖徽章「生日派對搭檔」（{Math.min(3, birthdayStreak)}/3）、
                  5 次解鎖稱號「🎂 最佳慶生搭檔」（{Math.min(5, birthdayStreak)}/5）
                </div>

                <button
                  type="button"
                  disabled={!coopAllDone || coopRewardClaimed}
                  onClick={onClaimCoopReward}
                  className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
                    coopRewardClaimed
                      ? 'bg-[#EAE4E1] text-[#8F7B74]'
                      : coopAllDone
                      ? 'bg-[#FF7EA8] text-white hover:opacity-95 active:scale-[0.99]'
                      : 'bg-[#F3ECE9] text-[#9A857E]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {coopRewardClaimed
                      ? '已完成並領取本場共養生日獎勵'
                      : coopAllDone
                      ? '領取共養生日獎勵（+8 生日券 · +80 金幣 · +6 親密度）'
                      : '完成上方 4 項合作準備即可領取雙方共同獎勵'}
                  </span>
                </button>
              </section>
            </div>
          )}

          {tab === 'memories' && (
            <div className="space-y-3">
              {birthdayPhotos.length > 0 && (
                <section className="rounded-2xl bg-white border border-[#EFE0D7] p-3 space-y-2">
                  <h3 className="text-xs font-extrabold text-[#4A3531]">
                    📸 生日慶生寫真集（{birthdayPhotos.length}）
                  </h3>
                  <div className="space-y-2.5">
                    {birthdayPhotos.slice(0, 6).map((photo) => (
                      <RoomPhotoCard
                        key={photo.id}
                        photo={photo}
                        compact
                        onToggleLike={() => {}}
                        onAddComment={() => {}}
                      />
                    ))}
                  </div>
                </section>
              )}

              {sys.cards.length > 0 && (
                <section className="rounded-2xl bg-white border border-[#EFE0D7] p-3 space-y-2">
                  <h3 className="text-xs font-extrabold text-[#4A3531]">
                    💌 已保存的生日賀卡（{sys.cards.length}）
                  </h3>
                  <div className="space-y-2">
                    {sys.cards.map((savedCard) => (
                      <div
                        key={savedCard.id}
                        className="rounded-xl bg-[#FFF6FA] border border-[#F2D5E0] p-2.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-[#B83B64]">
                            🎂 給 {savedCard.petName}（{savedCard.birthdayDateLabel}）
                          </span>
                          <span className="text-xs">
                            {savedCard.stickers
                              .map((id) => PHOTO_STICKER_BY_ID[id]?.emoji ?? '🎂')
                              .join(' ')}
                          </span>
                        </div>
                        {savedCard.blessings.length > 0 ? (
                          <div className="space-y-0.5 text-[11px] text-[#4A3531]">
                            {savedCard.blessings.map((b, i) => (
                              <div key={`${b.createdAt}_${i}`}>
                                <span className="font-bold text-[#9A4262]">
                                  {b.userName}：
                                </span>
                                「{b.text}」
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#7D635D]">尚未寫入祝福文字</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-2xl bg-white border border-[#EFE0D7] p-3 space-y-2">
                <h3 className="text-xs font-extrabold text-[#4A3531]">
                  🎞️ 生日回憶時間軸（{birthdayMemories.length}）
                </h3>
                {birthdayMemories.length === 0 ? (
                  <p className="text-[11px] text-[#7D635D] text-center py-4">
                    還沒有生日回憶紀錄喔，先去設定生日或烤一個生日蛋糕吧！
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {birthdayMemories.map((mem) => (
                      <div
                        key={mem.id}
                        className="rounded-xl bg-[#FFFDF8] border border-[#F0E2DA] p-2.5 flex items-start gap-2"
                      >
                        <span className="text-lg shrink-0">{mem.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-[#4A3531] truncate">
                              {mem.title}
                            </span>
                            <span className="text-[10px] font-bold text-[#8E766E] shrink-0 tabular-nums">
                              {mem.dateKey}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#7D635D]">
                            {mem.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
