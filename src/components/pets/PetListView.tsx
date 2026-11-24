import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Heart, Lock, Plus, Sparkles, Users } from 'lucide-react';
import { FOOD_BY_ID } from '../../data/foods';
import { PET_ABILITIES, RESERVED_SPECIAL_PETS } from '../../data/pets';
import { getPetSpeciesInfo } from '../../data/species';
import { GameState, Pet, PetSpecies } from '../../types';
import {
  evaluatePetSlots,
  evaluateSpeciesUnlocks,
  getActivePet,
  getPetPreferenceProfile,
  isSharedCoopPet,
} from '../../utils/pets';
import { PiggyCharacter } from '../PiggyCharacter';

interface PetListViewProps {
  game: GameState;
  hasSharedRoom: boolean;
  onBack: () => void;
  onSwitchPet: (petId: string) => void;
  onAdoptPet: (species: PetSpecies, name: string) => boolean;
  onClaimSlotReward: (slotNumber: number) => void;
  onOpenMemories?: () => void;
}

export const PetListView: React.FC<PetListViewProps> = ({
  game,
  hasSharedRoom,
  onBack,
  onSwitchPet,
  onAdoptPet,
  onClaimSlotReward,
  onOpenMemories,
}) => {
  const activePet = getActivePet(game);
  const slotEval = useMemo(
    () => evaluatePetSlots(game, hasSharedRoom),
    [game, hasSharedRoom]
  );
  const speciesUnlocks = useMemo(
    () => evaluateSpeciesUnlocks(game, hasSharedRoom),
    [game, hasSharedRoom]
  );

  const firstUnlockedSpecies =
    speciesUnlocks.find((s) => s.unlocked)?.species ?? 'pig';
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies>(firstUnlockedSpecies);
  const [newPetName, setNewPetName] = useState('');
  const [subTab, setSubTab] = useState<'roster' | 'adopt' | 'slots'>('roster');

  const hasFreeSlot = game.pets.length < slotEval.maxSlots;
  const selectedUnlockInfo =
    speciesUnlocks.find((s) => s.species === selectedSpecies) ?? speciesUnlocks[0];
  const partnerPets = game.coop.partnerShowcasePets ?? [];

  const handleAdoptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onAdoptPet(selectedSpecies, newPetName);
    if (ok) {
      setNewPetName('');
      setSubTab('roster');
    }
  };

  const renderPetCard = (pet: Pet, readOnly = false) => {
    const isActive = !readOnly && pet.id === activePet.id;
    const isShared = isSharedCoopPet(pet);
    const spInfo = getPetSpeciesInfo(pet.species);
    const ability = PET_ABILITIES[pet.species];
    const pref = getPetPreferenceProfile(pet);
    const favFoodNames = pref.favoriteFoodIds
      .slice(0, 2)
      .map((id) => FOOD_BY_ID[id]?.name ?? id)
      .join('、');

    return (
      <div
        key={pet.id}
        className={`rounded-3xl border-2 p-3.5 transition-all ${
          isActive
            ? 'bg-[#FFFDF9] border-[#FF7A9E] shadow-[0_6px_18px_rgba(255,122,158,0.18)]'
            : readOnly
            ? 'bg-[#FAF6F1] border-[#E8D9CE]'
            : 'bg-white border-[#F0DDD3]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-[76px] h-[76px] rounded-2xl bg-[#FFF4EC] border border-[#F3D8CB] flex items-center justify-center overflow-hidden">
            <PiggyCharacter
              species={pet.species}
              growth={pet.growth}
              roundness={pet.roundness}
              action={isActive ? 'idle' : 'petted'}
              equipped={pet.accessories}
              size={72}
              interactive={false}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-base font-black text-[#5A3E36] truncate">
                {pet.name}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFEAF0] text-[#D84C78]">
                {spInfo.shortName}
              </span>
              {isShared ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F8F2] text-[#2F8568]">
                  <Users className="w-3 h-3" />
                  共養夥伴
                </span>
              ) : readOnly ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFEAE4] text-[#7D655B]">
                  <Lock className="w-3 h-3" />
                  夥伴個人寵物
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF3D8] text-[#B86E1D]">
                  個人寵物
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-[11px] font-bold text-[#8A6D63]">
              <span>Lv.{pet.level}</span>
              <span>·</span>
              <span>{pet.weight.toFixed(1)} kg</span>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5 text-[#E85D88]">
                <Heart className="w-3 h-3 fill-current" />
                {pet.intimacy}
              </span>
            </div>

            <div className="mt-2 rounded-xl bg-[#FFF8F1] border border-[#F5E4D6] px-2.5 py-1.5">
              <p className="text-[11px] font-extrabold text-[#B8652B]">
                {ability.emoji} 專屬能力：{ability.title}
              </p>
              <p className="text-[10px] text-[#7D635A] leading-snug mt-0.5">
                {ability.summary}
                {favFoodNames ? ` · 最愛：${favFoodNames}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* 4 compact status bars */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-[10px]">
          {[
            { label: '飽足', val: pet.hunger, color: 'bg-[#FFB76B]' },
            { label: '心情', val: pet.mood, color: 'bg-[#FF85A6]' },
            { label: '清潔', val: pet.cleanliness, color: 'bg-[#7EDBC0]' },
            { label: '活力', val: pet.energy, color: 'bg-[#94BFFF]' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#FFF9F4] rounded-xl px-2 py-1 border border-[#F3E4D8]">
              <div className="flex justify-between font-bold text-[#7A5E54]">
                <span>{stat.label}</span>
                <span>{Math.round(stat.val)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-[#F1E2D7] overflow-hidden">
                <div
                  className={`h-full rounded-full ${stat.color}`}
                  style={{ width: `${Math.min(100, Math.max(0, stat.val))}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          {readOnly ? (
            <span className="text-[11px] font-bold text-[#8B736B]">
              住進共同小屋作伴中（僅飼主本人可照顧與裝扮）
            </span>
          ) : isActive ? (
            <div className="w-full flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#E0537F]">
                <CheckCircle2 className="w-4 h-4" />
                目前互動陪伴中
              </span>
              {onOpenMemories && (
                <button
                  type="button"
                  onClick={onOpenMemories}
                  className="px-3 py-1.5 rounded-xl bg-[#FFF0F5] border border-[#FFD0DF] text-[11px] font-extrabold text-[#D64B78] active:scale-95"
                >
                  📖 {pet.name}的回憶
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSwitchPet(pet.id)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#FF85A6] to-[#FF9F7A] text-white text-xs font-black shadow-sm active:scale-[0.98] transition-transform"
            >
              切換為「{pet.name}」互動照顧
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[430px] mx-auto px-3 pb-24 pt-2 space-y-3 overflow-x-clip">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#FFFDF9] border-2 border-[#F2DFD3] rounded-3xl px-3.5 py-3 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[#FFF2E8] text-[#5A3E36] text-xs font-black active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          首頁
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black text-[#5A3E36]">🐾 寵物清單與領養</h1>
          <p className="text-[11px] font-bold text-[#8E6F64]">
            已養 {game.pets.length} / 已解鎖 {slotEval.maxSlots} 欄（上限 6 隻）
          </p>
        </div>
        <div className="w-[62px] text-right">
          {slotEval.claimableSlotsCount > 0 && (
            <span className="inline-block px-2 py-0.5 rounded-full bg-[#FF6B9A] text-white text-[10px] font-black">
              有獎勵
            </span>
          )}
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="grid grid-cols-3 gap-2 bg-[#FFF6EC] p-1.5 rounded-2xl border border-[#F2DFD3]">
        {[
          { id: 'roster' as const, label: `我的寵物 (${game.pets.length})` },
          {
            id: 'adopt' as const,
            label: hasFreeSlot ? '領養新夥伴 ✨' : '種族圖鑑',
          },
          {
            id: 'slots' as const,
            label:
              slotEval.claimableSlotsCount > 0
                ? `欄位條件 (${slotEval.claimableSlotsCount})`
                : '欄位 1~6',
          },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSubTab(item.id)}
            className={`py-2 rounded-xl text-xs font-black transition-all ${
              subTab === item.id
                ? 'bg-white text-[#D84C78] shadow-sm border border-[#FFD8E4]'
                : 'text-[#87695E]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Roster */}
      {subTab === 'roster' && (
        <div className="space-y-3">
          {/* Family Care Note */}
          <div className="rounded-2xl bg-[#FFF9E8] border border-[#F5DFA8] px-3.5 py-2.5 text-[11px] font-bold text-[#8A5A19] leading-relaxed">
            💡 切換不同寵物時，首頁、食堂、衣櫃、成長手帳與回憶冊都會同步呈現該隻寵物的狀態與紀錄；「全家今日任務」只要任一隻完成就能共享領獎喔！
          </div>

          {game.pets.map((pet) => renderPetCard(pet, false))}

          {hasFreeSlot && (
            <button
              type="button"
              onClick={() => setSubTab('adopt')}
              className="w-full py-3.5 rounded-3xl border-2 border-dashed border-[#FF94B4] bg-[#FFF4F8] text-[#D84C78] text-xs font-black flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              還有 {slotEval.maxSlots - game.pets.length} 個空位！前往領養新寵物
            </button>
          )}

          {partnerPets.length > 0 && (
            <div className="space-y-2 pt-1">
              <h2 className="text-xs font-black text-[#6E534A] px-1">
                🏡 共養小屋中的夥伴個人寵物
              </h2>
              {partnerPets.map((pet) => renderPetCard(pet, true))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Adoption (No Gacha) */}
      {subTab === 'adopt' && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-[#FFF8F2] border border-[#F2DFD3] px-3.5 py-2.5 text-xs font-bold text-[#6E534A]">
            {hasFreeSlot ? (
              <span>
                🎉 目前有 <strong className="text-[#E0537F]">{slotEval.maxSlots - game.pets.length}</strong>{' '}
                個可領養欄位！選擇已解鎖的動物並取名，即可直接領養回家。
              </span>
            ) : (
              <span>
                🔒 目前欄位已滿（{game.pets.length}/{slotEval.maxSlots}）。請前往「欄位 1~6」查看下一欄解鎖條件！
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {speciesUnlocks.map((item) => {
              const spInfo = getPetSpeciesInfo(item.species);
              const isSelected = selectedSpecies === item.species;
              return (
                <button
                  key={item.species}
                  type="button"
                  onClick={() => setSelectedSpecies(item.species)}
                  className={`text-left rounded-3xl border-2 p-3 transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#FFFDF9] border-[#FF7A9E] shadow-sm'
                      : item.unlocked
                      ? 'bg-white border-[#F0DDD3]'
                      : 'bg-[#FAF5F0] border-[#E6D7CC] opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-[#5A3E36]">
                      {item.ability.emoji} {spInfo.shortName}
                    </span>
                    {item.unlocked ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E8F8F2] text-[#2F8568]">
                        已解鎖
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#EFE6DE] text-[#846A60]">
                        未解鎖
                      </span>
                    )}
                  </div>

                  <div className="my-1.5 flex justify-center">
                    <PiggyCharacter
                      species={item.species}
                      growth={0}
                      roundness={28}
                      action="idle"
                      equipped={{
                        head: null,
                        face: null,
                        neck: null,
                        body: null,
                        held: null,
                        back: null,
                      }}
                      size={74}
                      interactive={false}
                    />
                  </div>

                  <p className="text-[11px] font-extrabold text-[#C0682B] truncate">
                    {item.ability.title}
                  </p>
                  <p className="text-[10px] text-[#7D635A] leading-snug mt-0.5">
                    {item.ability.summary}
                  </p>
                  <p className="mt-1.5 text-[10px] font-bold text-[#96786D]">
                    {item.progressLabel}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedUnlockInfo && (
            <form
              onSubmit={handleAdoptSubmit}
              className="rounded-3xl border-2 border-[#FFD2DF] bg-[#FFFDF9] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#5A3E36]">
                    {selectedUnlockInfo.ability.emoji}{' '}
                    {getPetSpeciesInfo(selectedUnlockInfo.species).label}
                  </h3>
                  <p className="text-[11px] font-bold text-[#8E6F64]">
                    {selectedUnlockInfo.ability.detail}
                  </p>
                </div>
              </div>

              {selectedUnlockInfo.unlocked ? (
                <>
                  <div>
                    <label className="block text-[11px] font-black text-[#6E534A] mb-1">
                      幫新夥伴取個名字（1～8 字）
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                      placeholder={`例如：${getPetSpeciesInfo(selectedUnlockInfo.species).shortName}麻糬`}
                      className="w-full rounded-2xl border-2 border-[#F0D9CC] bg-white px-3.5 py-2.5 text-sm font-bold text-[#5A3E36] focus:outline-none focus:border-[#FF7A9E]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!hasFreeSlot || !newPetName.trim()}
                    className={`w-full py-3 rounded-2xl text-xs font-black text-white transition-all ${
                      hasFreeSlot && newPetName.trim()
                        ? 'bg-gradient-to-r from-[#FF7A9E] to-[#FFA07A] shadow-sm active:scale-[0.98]'
                        : 'bg-[#D8C5BC] cursor-not-allowed'
                    }`}
                  >
                    {hasFreeSlot ? '🐾 領養回家（免抽蛋直接領養）' : '請先解鎖下一個寵物欄位'}
                  </button>
                </>
              ) : (
                <div className="rounded-2xl bg-[#FFF4EC] border border-[#F0D9CC] px-3 py-2.5 text-xs font-bold text-[#8A5A3E]">
                  🔒 解鎖條件：{selectedUnlockInfo.condition.label}（{selectedUnlockInfo.progressLabel}）
                </div>
              )}
            </form>
          )}

          {/* Reserved future festival / co-op exclusive pets */}
          <div className="rounded-3xl border border-[#E8D8CC] bg-[#FAF5F0] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#6E534A]">
              <Sparkles className="w-4 h-4 text-[#D99B26]" />
              <span>未來限定寵物預留欄位</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {RESERVED_SPECIAL_PETS.map((rp) => (
                <div
                  key={rp.id}
                  className="rounded-2xl bg-white/80 border border-[#EAE0D7] p-2.5 text-[11px]"
                >
                  <p className="font-black text-[#5A3E36]">
                    {rp.emoji} {rp.name}
                  </p>
                  <p className="text-[10px] font-bold text-[#9A7E73] mt-0.5">
                    {rp.category === 'festival' ? '節日限定預留' : '共養限定預留'} · {rp.unlockHint}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Slots 1-6 Tracker */}
      {subTab === 'slots' && (
        <div className="space-y-2.5">
          {slotEval.slots.map((slot) => (
            <div
              key={slot.rule.slotNumber}
              className={`rounded-3xl border-2 p-3.5 ${
                slot.unlocked
                  ? 'bg-[#FFFDF9] border-[#A7DFC5]'
                  : 'bg-white border-[#EFE0D6]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-[#5A3E36]">
                    {slot.unlocked ? '🔓' : '🔒'} {slot.rule.title}
                  </span>
                  {slot.occupiedByPet && (
                    <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFEAF0] text-[#D84C78]">
                      住著「{slot.occupiedByPet.name}」
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-black text-[#7E655B]">
                  {slot.progressText}
                </span>
              </div>

              <p className="text-[11px] font-bold text-[#7A6158] mt-1">
                解鎖條件：{slot.rule.conditionLabel}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold text-[#B8652B]">
                  🎁 獎勵：{slot.rule.rewardText}
                </span>
                {slot.canClaimReward ? (
                  <button
                    type="button"
                    onClick={() => onClaimSlotReward(slot.rule.slotNumber)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#5EC49E] to-[#46AD89] text-white text-[11px] font-black active:scale-95"
                  >
                    領取獎勵
                  </button>
                ) : slot.claimed && slot.rule.slotNumber > 1 ? (
                  <span className="text-[10px] font-black text-[#3A9A78]">✅ 已領取</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
