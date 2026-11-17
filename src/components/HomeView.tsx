import React, { useState } from 'react';
import { Bath, Footprints, Heart, Moon, Sparkles, Users, UtensilsCrossed, X } from 'lucide-react';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS, FOODS } from '../data/foods';
import { getGrowthRemaining, getRoundnessTier } from '../data/growth';
import {
  FloatingFeedback,
  Food,
  FoodCategory,
  Pet,
  PiggyActionState,
  SharedPetRoom,
} from '../types';
import { PiggyCharacter } from './PiggyCharacter';

interface HomeViewProps {
  pet: Pet;
  action: PiggyActionState;
  flyingFoodEmoji: string | null;
  speech: string;
  feedbacks: FloatingFeedback[];
  inventory: Record<string, number>;
  onPet: () => void;
  onFeed: (food: Food) => void;
  onSleep: () => void;
  onBath: () => void;
  onWalk: () => void;
  onGoToCanteen: () => void;
  sharedRoom?: SharedPetRoom | null;
  currentUserId?: string | null;
  onOpenSharedPet?: () => void;
}

type PetStatKey = 'hunger' | 'mood' | 'cleanliness' | 'energy';

const STAT_CONFIG: {
  key: PetStatKey;
  label: string;
  barColor: string;
  trackColor: string;
}[] = [
  { key: 'hunger', label: '飽食度', barColor: 'bg-[#FF8AA8]', trackColor: 'bg-[#FFE6ED]' },
  { key: 'mood', label: '心情', barColor: 'bg-[#FFD166]', trackColor: 'bg-[#FFF3D1]' },
  { key: 'cleanliness', label: '清潔度', barColor: 'bg-[#5CC9A7]', trackColor: 'bg-[#DFF6EE]' },
  { key: 'energy', label: '精力', barColor: 'bg-[#9C89D9]', trackColor: 'bg-[#EEE9FA]' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  pet,
  action,
  flyingFoodEmoji,
  speech,
  feedbacks,
  inventory,
  onPet,
  onFeed,
  onSleep,
  onBath,
  onWalk,
  onGoToCanteen,
  sharedRoom = null,
  currentUserId = null,
  onOpenSharedPet,
}) => {
  const [foodDrawerOpen, setFoodDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('meal');
  const [draggingFoodId, setDraggingFoodId] = useState<string | null>(null);
  const [isDropOver, setIsDropOver] = useState(false);

  const growthInfo = getGrowthRemaining(pet.growth);
  const roundnessTier = getRoundnessTier(pet.roundness);

  const filteredFoods = FOODS.filter((f) => f.category === selectedCategory);

  const handleDropOnPiggy = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDropOver(false);
    const foodId = e.dataTransfer.getData('text/plain') || draggingFoodId;
    if (!foodId) return;
    const food = FOODS.find((f) => f.id === foodId);
    if (food) {
      onFeed(food);
    }
    setDraggingFoodId(null);
  };

  return (
    <div className="px-4 pt-3 pb-24 space-y-3.5">
      <section className="rounded-3xl bg-[#FFFDF8] border-2 border-[#F5DFD7] p-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#4A3531] truncate">
                {pet.name}
              </h2>
              <span className="text-xs font-bold text-[#B84A6F]">
                Lv.{growthInfo.currentStage.level} {growthInfo.currentStage.name}
              </span>
            </div>
            <p className="text-xs text-[#826862] mt-0.5 tabular-nums">
              體重 {pet.weight.toFixed(1)} kg · {roundnessTier.label} · 親密值 {pet.intimacy}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#D64470] tabular-nums">
              <Heart className="w-3.5 h-3.5 fill-[#FF7A9E] text-[#FF7A9E]" />
              {pet.intimacy}
            </span>
            {onOpenSharedPet && (
              <button
                type="button"
                onClick={onOpenSharedPet}
                className={`min-h-[30px] px-2.5 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1 transition active:scale-95 ${
                  sharedRoom
                    ? 'bg-[#E3F7F0] border border-[#AEE3D0] text-[#256D57]'
                    : 'bg-[#FFF0F4] border border-[#F5C9D7] text-[#B83B64]'
                }`}
              >
                <Users className="w-3 h-3 shrink-0" />
                <span>
                  {sharedRoom
                    ? sharedRoom.partnerId
                      ? '兩人共養中'
                      : `邀請碼 ${sharedRoom.inviteCode}`
                    : '兩人共養'}
                </span>
              </button>
            )}
          </div>
        </div>
        {sharedRoom && (
          <p className="mt-1.5 text-[11px] font-bold text-[#256D57] truncate">
            {sharedRoom.partnerId
              ? `共養夥伴：${
                  sharedRoom.ownerId === currentUserId
                    ? sharedRoom.partnerEmail || '夥伴'
                    : sharedRoom.ownerEmail || '夥伴'
                }`
              : `邀請碼：${sharedRoom.inviteCode}（等待夥伴輸入加入）`}
          </p>
        )}

        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#7D635D] mb-1">
            <span>成長進度</span>
            <span className="tabular-nums">
              {growthInfo.nextStage
                ? `距離「${growthInfo.nextStage.name}」還需 ${growthInfo.remaining} 成長值`
                : '已達最高階時尚大豬'}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#F5E9E2] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF8AA8] to-[#5CC9A7] transition-all duration-300"
              style={{ width: `${growthInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2.5" aria-label="小豬狀態數值">
        {STAT_CONFIG.map(({ key, label, barColor, trackColor }) => {
          const val = pet[key];
          return (
            <div
              key={key}
              className="rounded-2xl bg-[#FFFDF8] border border-[#F3DFD7] px-3 py-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#5A423C] mb-1">
                <span>{label}</span>
                <span className="tabular-nums">{val}%</span>
              </div>
              <div className={`w-full h-2 rounded-full ${trackColor} overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-300`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {pet.consecutiveFastFood >= 3 && (
        <div className="rounded-2xl bg-[#FFF3D1] border border-[#F3CE72] px-3.5 py-2.5 flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-[#7B5610] leading-snug">
            有點撐了… 連續吃速食好幾次了，帶我去散步消化一下吧！
          </p>
          <button
            type="button"
            onClick={onWalk}
            className="min-h-[36px] px-3 rounded-xl bg-[#5CC9A7] text-white text-xs font-extrabold whitespace-nowrap shrink-0 active:scale-95 transition"
          >
            去散步
          </button>
        </div>
      )}

      <section
        onDragOver={(e) => {
          e.preventDefault();
          setIsDropOver(true);
        }}
        onDragLeave={() => setIsDropOver(false)}
        onDrop={handleDropOnPiggy}
        className="relative rounded-3xl bg-gradient-to-b from-[#FFEAF0] via-[#FFF9EA] to-[#E6F8F1] border-2 border-[#F5DFD7] px-4 pt-5 pb-4 flex flex-col items-center justify-center min-h-[270px] overflow-hidden"
      >
        <div className="min-h-[34px] mb-1 flex items-center justify-center">
          {speech && (
            <div className="relative rounded-2xl bg-white/95 border border-[#F1D5DF] px-4 py-1.5 text-xs font-extrabold text-[#4A3531] shadow-xs text-center max-w-[260px]">
              {speech}
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-14 flex flex-col items-center z-20">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="animate-float-up text-sm font-extrabold text-[#D64470] drop-shadow-xs flex items-center gap-1"
            >
              {fb.emoji && <span>{fb.emoji}</span>}
              <span>{fb.text}</span>
            </div>
          ))}
        </div>

        <PiggyCharacter
          growth={pet.growth}
          roundness={pet.roundness}
          action={action}
          equipped={pet.accessories}
          flyingFoodEmoji={flyingFoodEmoji}
          onPet={onPet}
          size={206}
          isDropTarget={isDropOver}
        />

        <p className="mt-1 text-[11px] font-bold text-[#8A716B] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FF7A9E]" />
          <span>輕點小豬可以摸摸牠，或把食物拖過來餵食</span>
        </p>
      </section>

      <section className="grid grid-cols-4 gap-2" aria-label="照護互動按鈕">
        <button
          type="button"
          onClick={() => setFoodDrawerOpen(true)}
          className="min-h-[60px] flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#FF7A9E] text-white font-extrabold text-xs shadow-[0_3px_0_#D9577B] hover:bg-[#F56990] active:translate-y-0.5 transition"
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span>食堂</span>
        </button>

        <button
          type="button"
          onClick={onSleep}
          className="min-h-[60px] flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#B3A4E8] text-white font-extrabold text-xs shadow-[0_3px_0_#8B79C9] hover:bg-[#A493E0] active:translate-y-0.5 transition"
        >
          <Moon className="w-5 h-5" />
          <span>睡覺</span>
        </button>

        <button
          type="button"
          onClick={onBath}
          className="min-h-[60px] flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#5CC9A7] text-white font-extrabold text-xs shadow-[0_3px_0_#3BA886] hover:bg-[#4DBE9B] active:translate-y-0.5 transition"
        >
          <Bath className="w-5 h-5" />
          <span>洗澡</span>
        </button>

        <button
          type="button"
          onClick={onWalk}
          className="min-h-[60px] flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#F8C956] text-[#4A3531] font-extrabold text-xs shadow-[0_3px_0_#D9A732] hover:bg-[#F3BE40] active:translate-y-0.5 transition"
        >
          <Footprints className="w-5 h-5" />
          <span>散步</span>
        </button>
      </section>

      {foodDrawerOpen && (
        <div className="rounded-3xl bg-[#FFFDF8] border-2 border-[#FAD5E0] p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#4A3531]">小豬點餐區</h3>
              <p className="text-[11px] text-[#826862]">點擊食物餵食，或長按拖曳到小豬身上</p>
            </div>
            <button
              type="button"
              onClick={() => setFoodDrawerOpen(false)}
              aria-label="關閉食堂選單"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-[#F7ECE6] text-[#5A3E36] hover:bg-[#EEDCD3]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {pet.hunger >= 100 && (
            <div className="rounded-2xl bg-[#FFEAF0] border border-[#F5B4C6] px-3 py-2 text-xs font-extrabold text-[#B83B64] text-center">
              {pet.name}已經吃飽了！
            </div>
          )}

          <div className="grid grid-cols-3 gap-1.5 bg-[#F8EFEA] p-1 rounded-2xl">
            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[38px] rounded-xl text-xs font-extrabold transition ${
                  selectedCategory === cat
                    ? 'bg-white text-[#D64470] shadow-xs'
                    : 'text-[#7D635D] hover:text-[#4A3531]'
                }`}
              >
                {FOOD_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {filteredFoods.map((food) => {
              const count = inventory[food.id] ?? 0;
              const isFull = pet.hunger >= 100;
              return (
                <div
                  key={food.id}
                  draggable={count > 0 && !isFull}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', food.id);
                    setDraggingFoodId(food.id);
                  }}
                  onDragEnd={() => {
                    setDraggingFoodId(null);
                    setIsDropOver(false);
                  }}
                  className="flex flex-col items-center rounded-2xl bg-[#FFF7EC] border border-[#F3DFD7] p-2.5 text-center"
                >
                  <span className="text-3xl leading-none my-1" aria-hidden="true">
                    {food.emoji}
                  </span>
                  <span className="text-xs font-extrabold text-[#4A3531] truncate w-full">
                    {food.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#826862] tabular-nums">
                    庫存 {count}
                  </span>
                  <button
                    type="button"
                    disabled={count <= 0}
                    onClick={() => {
                      if (count > 0) {
                        onFeed(food);
                      }
                    }}
                    className={`mt-2 w-full min-h-[36px] rounded-xl text-xs font-extrabold transition ${
                      count <= 0
                        ? 'bg-[#EAE0DA] text-[#9E8B85] cursor-not-allowed'
                        : isFull
                        ? 'bg-[#F8DDE5] text-[#B05B74]'
                        : 'bg-[#FF7A9E] text-white hover:bg-[#F45D86] active:scale-95'
                    }`}
                  >
                    {count <= 0 ? '缺貨' : '餵食'}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setFoodDrawerOpen(false);
              onGoToCanteen();
            }}
            className="w-full min-h-[42px] rounded-2xl bg-[#E8F8F2] border border-[#AEE4D1] text-xs font-extrabold text-[#256D57] hover:bg-[#D8F3E9] transition"
          >
            前往「食堂商店」購買更多美食
          </button>
        </div>
      )}
    </div>
  );
};
