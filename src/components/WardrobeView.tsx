import React, { useState } from 'react';
import {
  BookOpen,
  Camera,
  Check,
  Coins,
  Heart,
  Lock,
  RotateCw,
  Shirt,
  Sparkles,
} from 'lucide-react';
import {
  ACCESSORIES,
  ACCESSORY_SLOT_LABELS,
  ACCESSORY_SLOTS,
  ACCESSORY_THEME_BY_ID,
} from '../data/accessories';
import { getGrowthStage } from '../data/growth';
import { PERSONALITY_DEFINITIONS } from '../data/personality';
import { PET_SPECIES_INFO, PET_SPECIES_LIST } from '../data/species';
import {
  Accessory,
  AccessorySlot,
  EncyclopediaState,
  Pet,
  PetPersonality,
  PetSpecies,
  PetViewDirection,
  SharedHouse,
  TitleId,
} from '../types';
import {
  getAccessoryObtainLabel,
  getAccessoryRarityMeta,
  isAccessoryPurchasable,
} from '../utils/accessories';
import { getPetPreference } from '../utils/personality';
import { AccessoryPreview } from './AccessoryPreview';
import { EncyclopediaView } from './EncyclopediaView';
import { PiggyCharacter } from './PiggyCharacter';

interface WardrobeViewProps {
  pet: Pet;
  personality: PetPersonality;
  coins: number;
  unlockedAccessories: string[];
  encyclopedia: EncyclopediaState;
  house: SharedHouse;
  onToggleEquip: (item: Accessory) => void;
  onBuyAccessory: (item: Accessory) => void;
  onChangeSpecies?: (species: PetSpecies) => void;
  onSelectTitle?: (titleId: TitleId | null) => void;
  onOpenPhotoStudio?: () => void;
  lastReactionText?: string | null;
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  pet,
  personality,
  coins,
  unlockedAccessories,
  encyclopedia,
  house,
  onToggleEquip,
  onBuyAccessory,
  onChangeSpecies,
  onSelectTitle,
  onOpenPhotoStudio,
  lastReactionText = null,
}) => {
  const [viewMode, setViewMode] = useState<'wardrobe' | 'encyclopedia'>('wardrobe');
  const [activeSlot, setActiveSlot] = useState<AccessorySlot>('head');
  const [viewDirection, setViewDirection] = useState<PetViewDirection>('front');

  const directionOptions: Array<{ id: PetViewDirection; label: string }> = [
    { id: 'front', label: '正面' },
    { id: 'left', label: '朝左' },
    { id: 'back', label: '背面' },
    { id: 'right', label: '朝右' },
  ];

  const handleCycleDirection = () => {
    const order: PetViewDirection[] = ['front', 'right', 'back', 'left'];
    const idx = order.indexOf(viewDirection);
    setViewDirection(order[(idx + 1) % order.length]);
  };

  const handleSelectSlot = (slot: AccessorySlot) => {
    setActiveSlot(slot);
    if (slot === 'back' && viewDirection === 'front') {
      setViewDirection('back');
    } else if ((slot === 'face' || slot === 'neck') && viewDirection === 'back') {
      setViewDirection('front');
    }
  };

  const stage = getGrowthStage(pet.growth);
  const slotUnlocked = stage.unlockedSlots.includes(activeSlot);
  const slotItems = ACCESSORIES.filter((a) => a.slot === activeSlot);
  const petPref = getPetPreference(pet.species);
  const primaryTrait = PERSONALITY_DEFINITIONS[personality.primary];
  const secondaryTrait = PERSONALITY_DEFINITIONS[personality.secondary];

  return (
    <div className="px-4 pt-3 pb-24 space-y-4 overflow-x-hidden">
      <div className="grid grid-cols-2 gap-1.5 bg-[#F2E5DE] p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setViewMode('wardrobe')}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
            viewMode === 'wardrobe'
              ? 'bg-white text-[#D64470] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>穿搭更衣</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('encyclopedia')}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
            viewMode === 'encyclopedia'
              ? 'bg-white text-[#256D57] shadow-xs'
              : 'text-[#7D635D] hover:text-[#4A3531]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>收集圖鑑</span>
        </button>
      </div>

      {viewMode === 'encyclopedia' ? (
        <EncyclopediaView
          encyclopedia={encyclopedia}
          unlockedAccessories={unlockedAccessories}
          house={house}
          initialSection="accessories"
          onSelectTitle={onSelectTitle}
        />
      ) : (
        <>
          <section className="rounded-3xl bg-gradient-to-b from-[#E6F8F1] to-[#FFFDF8] border-2 border-[#D2EFE4] p-4 flex flex-col items-center text-center relative">
            <div className="w-full flex items-center justify-between gap-2">
              <div className="text-left min-w-0">
                <h2 className="text-base font-extrabold text-[#4A3531] truncate">
                  {pet.name}的更衣室
                </h2>
                <p className="text-[11px] font-bold text-[#6E544E] truncate">
                  {primaryTrait.emoji} {primaryTrait.label} · {secondaryTrait.emoji} {secondaryTrait.label}
                </p>
              </div>
              {onOpenPhotoStudio && (
                <button
                  type="button"
                  onClick={onOpenPhotoStudio}
                  className="min-h-[44px] px-3.5 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center gap-1.5 hover:bg-[#F76890] active:translate-y-0.5 transition shrink-0"
                >
                  <Camera className="w-4 h-4" />
                  <span>拍照</span>
                </button>
              )}
            </div>

            {lastReactionText && (
              <div className="mt-2.5 w-full rounded-2xl bg-white/95 border border-[#F5C6D4] px-3 py-2 text-xs font-extrabold text-[#B83B64] flex items-center justify-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#FF7A9E]" />
                <span className="leading-snug">{lastReactionText}</span>
              </div>
            )}

            <div className="my-2 flex flex-col items-center">
              <button
                type="button"
                onClick={handleCycleDirection}
                aria-label="點擊讓寵物轉方向查看穿搭"
                className="relative rounded-full p-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7A9E]/35 active:scale-95 transition-transform cursor-pointer"
              >
                <PiggyCharacter
                  species={pet.species}
                  growth={pet.growth}
                  roundness={pet.roundness}
                  action="idle"
                  equipped={pet.accessories}
                  interactive={false}
                  viewDirection={viewDirection}
                  size={180}
                />
                <span className="absolute right-0 bottom-1 w-8 h-8 rounded-full bg-white/95 border border-[#D2EFE4] shadow-xs flex items-center justify-center text-[#256D57]">
                  <RotateCw className="w-4 h-4" />
                </span>
              </button>

              <div className="mt-1.5 w-full max-w-[300px] grid grid-cols-4 gap-1 bg-[#EBF7F2] p-1 rounded-2xl border border-[#D2EFE4]">
                {directionOptions.map((opt) => {
                  const selected = viewDirection === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setViewDirection(opt.id)}
                      className={`min-h-[38px] rounded-xl text-[11px] font-extrabold whitespace-nowrap transition ${
                        selected
                          ? 'bg-white text-[#256D57] shadow-xs'
                          : 'text-[#6E544E] hover:text-[#4A3531]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[10px] font-bold text-[#7D635D]">
                點擊寵物或方向按鈕可轉身查看背部翅膀與配件
              </p>
            </div>

            {onChangeSpecies && (
              <div className="w-full pt-2 border-t border-[#DFEFE9]">
                <p className="text-[11px] font-bold text-[#6E544E] mb-1.5">
                  切換寵物造型（共用目前成長與好感度）
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {PET_SPECIES_LIST.map((sp) => {
                    const info = PET_SPECIES_INFO[sp];
                    const isSelected = pet.species === sp;
                    return (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => onChangeSpecies(sp)}
                        className={`min-h-[44px] rounded-xl px-2 text-xs font-extrabold border transition flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#FF7A9E] border-[#E05E83] text-white shadow-xs'
                            : 'bg-white border-[#E4D8D2] text-[#6E544E] hover:bg-[#FFF5F8]'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-[#5A3E36] shrink-0"
                          style={{ backgroundColor: info.eggColor }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* 6-slot selector (3x2 grid, touch-friendly >=44px, zero horizontal scroll) */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#F6ECE6] p-1.5 rounded-2xl">
            {ACCESSORY_SLOTS.map((slot) => {
              const isUnlocked = stage.unlockedSlots.includes(slot);
              const hasEquipped = Boolean(pet.accessories[slot]);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleSelectSlot(slot)}
                  className={`min-h-[44px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1 transition whitespace-nowrap px-2 ${
                    activeSlot === slot
                      ? 'bg-white text-[#D64470] shadow-xs'
                      : 'text-[#7D635D] hover:text-[#4A3531]'
                  }`}
                >
                  {!isUnlocked && <Lock className="w-3 h-3 shrink-0" />}
                  <span>{ACCESSORY_SLOT_LABELS[slot]}</span>
                  {hasEquipped && (
                    <span
                      className="w-2 h-2 rounded-full bg-[#5CC9A7] shrink-0"
                      aria-label="已穿戴配件"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {!slotUnlocked && (
            <div className="rounded-2xl bg-[#FFF3D1] border border-[#F3CE72] px-4 py-3 text-xs font-bold text-[#7B5610]">
              「{ACCESSORY_SLOT_LABELS[activeSlot]}」欄位將於成長等級 Lv.2「圓滾小豬」（100 成長值）解鎖！現在可以先預覽與購買喔。
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {slotItems.map((item) => {
              const isOwned = unlockedAccessories.includes(item.id);
              const isEquipped = pet.accessories[item.slot] === item.id;
              const purchasable = isAccessoryPurchasable(item);
              const canBuy = purchasable && coins >= item.price;
              const rarityMeta = getAccessoryRarityMeta(item);
              const themeDef = item.theme ? ACCESSORY_THEME_BY_ID[item.theme] : null;
              const matchesPersonality =
                item.suitablePersonalities.includes(personality.primary) ||
                item.suitablePersonalities.includes(personality.secondary) ||
                Boolean(petPref.favoriteAccessoryIds?.includes(item.id));

              return (
                <article
                  key={item.id}
                  className={`rounded-3xl border-2 p-3 flex flex-col justify-between transition ${
                    isEquipped
                      ? 'bg-[#FFF0F5] border-[#FF7A9E]'
                      : 'bg-[#FFFDF8] border-[#F4DFD7]'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-full flex items-center justify-between gap-1 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-extrabold inline-flex items-center gap-1 ${rarityMeta.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${rarityMeta.dotClass}`} />
                        <span>{rarityMeta.label}</span>
                      </span>
                      {matchesPersonality && (
                        <span
                          className="px-1.5 py-0.5 rounded-lg bg-[#FFEAF0] border border-[#F5B9CB] text-[10px] font-extrabold text-[#C43463] inline-flex items-center gap-0.5"
                          title="符合寶貝目前個性或最愛穿搭"
                        >
                          <Heart className="w-2.5 h-2.5 fill-[#FF6B9A] text-[#FF6B9A]" />
                          <span>合拍</span>
                        </span>
                      )}
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-[#FFF8EB] border border-[#F3E2C3] flex items-center justify-center">
                      <AccessoryPreview accessoryId={item.id} />
                    </div>

                    <h3 className="mt-2 text-sm font-extrabold text-[#4A3531] leading-snug">
                      {item.name}
                    </h3>

                    {themeDef && (
                      <span
                        className={`mt-1 px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${themeDef.badgeClass}`}
                      >
                        {themeDef.emoji} {themeDef.name}
                      </span>
                    )}

                    <p className="mt-1 text-[11px] text-[#7D635D] leading-snug">
                      {item.description}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
                      {item.suitablePersonalities.map((pid) => {
                        const pDef = PERSONALITY_DEFINITIONS[pid];
                        return (
                          <span
                            key={pid}
                            className="px-1.5 py-0.5 rounded-md bg-[#FAF2EC] text-[10px] font-bold text-[#6E544E]"
                          >
                            {pDef.emoji} {pDef.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-[10px] font-bold text-[#8E756E] text-center leading-tight">
                      {getAccessoryObtainLabel(item)}
                    </p>
                    {isOwned ? (
                      <button
                        type="button"
                        disabled={!slotUnlocked}
                        onClick={() => onToggleEquip(item)}
                        className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold inline-flex items-center justify-center gap-1 transition ${
                          !slotUnlocked
                            ? 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                            : isEquipped
                            ? 'bg-[#5CC9A7] text-white hover:bg-[#49B895]'
                            : 'bg-[#FF7A9E] text-white hover:bg-[#F45D86] active:scale-95'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>已穿戴 · 脫下</span>
                          </>
                        ) : (
                          <span>穿戴</span>
                        )}
                      </button>
                    ) : !purchasable ? (
                      <div
                        className={`w-full min-h-[44px] rounded-2xl border text-[11px] font-extrabold inline-flex items-center justify-center px-2 text-center ${
                          item.rarity === 'coop'
                            ? 'bg-[#E6F8F1] border-[#A7E0CB] text-[#1F6B54]'
                            : 'bg-[#FFF3D8] border-[#F0CF7A] text-[#8A5A10]'
                        }`}
                      >
                        {item.rarity === 'coop' ? '共養任務解鎖' : '活動／成就解鎖'}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => onBuyAccessory(item)}
                        className={`w-full min-h-[44px] rounded-2xl text-xs font-extrabold inline-flex items-center justify-center gap-1 transition ${
                          canBuy
                            ? 'bg-[#FFF3D1] border border-[#F2CE6D] text-[#7A540E] hover:bg-[#FFEAA8] active:scale-95'
                            : 'bg-[#EFE6E2] text-[#A89690] cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{item.price} 金幣購買</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
