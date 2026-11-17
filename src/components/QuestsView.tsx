import React from 'react';
import { CheckCircle2, Coins, Gift } from 'lucide-react';
import { getFoodById } from '../data/foods';
import { DailyTask } from '../types';

interface QuestsViewProps {
  dailyTasks: DailyTask[];
  dateStr: string;
  onClaimTask: (taskId: string) => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  dailyTasks,
  dateStr,
  onClaimTask,
}) => {
  const claimedCount = dailyTasks.filter((t) => t.claimed).length;

  return (
    <div className="px-4 pt-3 pb-24 space-y-4">
      <section className="rounded-3xl bg-gradient-to-r from-[#FFF4D1] to-[#FFE9F0] border-2 border-[#F5DFD7] p-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#4A3531]">今日每日任務</h2>
          <p className="text-xs text-[#7D635D] mt-0.5 tabular-nums">
            日期 {dateStr} · 每日凌晨自動更新
          </p>
        </div>
        <div className="text-right tabular-nums">
          <span className="text-xl font-extrabold text-[#D64470]">
            {claimedCount} / {dailyTasks.length}
          </span>
          <p className="text-[11px] font-bold text-[#826862]">已領取</p>
        </div>
      </section>

      <div className="space-y-3">
        {dailyTasks.map((task) => {
          const current = Math.min(task.target, task.progress);
          const isReady = task.completed || current >= task.target;
          const isClaimed = task.claimed;
          const rewardFood = getFoodById(task.reward.foodId);
          const pct = Math.round((current / task.target) * 100);

          return (
            <article
              key={task.id}
              className={`rounded-3xl border-2 p-4 space-y-3 transition ${
                isClaimed
                  ? 'bg-[#F7F3EE] border-[#E8DED8] opacity-85'
                  : isReady
                  ? 'bg-[#FFF5F8] border-[#FF8AA8]'
                  : 'bg-[#FFFDF8] border-[#F4DFD7]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-[#4A3531]">
                    {task.title}
                  </h3>
                  <p className="text-xs text-[#7D635D] mt-0.5 leading-relaxed">
                    {task.description}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#D64470] tabular-nums shrink-0">
                  {current} / {task.target}
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-[#F2E6DF] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5CC9A7] transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-3 text-xs font-bold text-[#6E544E] tabular-nums">
                  <span className="inline-flex items-center gap-1 text-[#A46D0F]">
                    <Coins className="w-3.5 h-3.5" />
                    +{task.reward.coins} 金幣
                  </span>
                  {rewardFood && (
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden="true">{rewardFood.emoji}</span>
                      +{task.reward.foodQty} {rewardFood.name}
                    </span>
                  )}
                </div>

                {isClaimed ? (
                  <span className="min-h-[40px] px-3.5 rounded-2xl bg-[#E1EFEA] text-[#28735B] text-xs font-extrabold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    已領取
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!isReady}
                    onClick={() => onClaimTask(task.id)}
                    className={`min-h-[40px] px-4 rounded-2xl text-xs font-extrabold inline-flex items-center gap-1.5 transition ${
                      isReady
                        ? 'bg-[#FF7A9E] text-white shadow-[0_3px_0_#D9577B] hover:bg-[#F45D86] active:translate-y-0.5'
                        : 'bg-[#EFE6E2] text-[#A4938D] cursor-not-allowed'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>{isReady ? '領取獎勵' : '進行中'}</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
