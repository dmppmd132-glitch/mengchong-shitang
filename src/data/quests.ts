import { DailyTask } from '../types';

export type TaskId =
  | 'feed_1'
  | 'pet_3'
  | 'clean_1'
  | 'weigh_1'
  | 'harvest_1'
  | 'cook_1'
  | 'minigame_1'
  | 'dress_1';

export const DAILY_TASK_TEMPLATES: DailyTask[] = [
  {
    id: 'feed_1',
    title: '餵食 1 次',
    description: '在食堂挑選喜歡的食物餵給{pet}吃。',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      coins: 35,
      foodId: 'veggie_porridge',
      foodQty: 1,
    },
  },
  {
    id: 'pet_3',
    title: '摸摸 3 次',
    description: '輕點主畫面的{pet}，給牠 3 次暖心摸摸。',
    target: 3,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      coins: 30,
      foodId: 'caramel_pudding',
      foodQty: 1,
    },
  },
  {
    id: 'clean_1',
    title: '清理 1 次',
    description: '按下「洗澡」按鈕幫{pet}洗出香香泡泡澡。',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      coins: 30,
      foodId: 'carrot_salad',
      foodQty: 1,
    },
  },
  {
    id: 'weigh_1',
    title: '記錄體重 1 次',
    description: '到「成長手帳」手動輸入或調整一次體重紀錄。',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      coins: 40,
      foodId: 'butter_cookie',
      foodQty: 2,
    },
  },
  {
    id: 'harvest_1',
    title: '農場採收 1 次',
    description: '到「食堂 → 開心農場」收成任意 1 次成熟作物。',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      coins: 36,
      foodId: 'fruit_box',
      foodQty: 1,
    },
  },
  {
    id: 'cook_1',
    title: '廚房料理 1 次',
    description: '到「食堂 → 萌寵廚房」親手合成 1 道美味餐點。',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      coins: 42,
      foodId: 'pumpkin_soup',
      foodQty: 1,
    },
  },
  {
    id: 'minigame_1',
    title: '小遊戲挑戰 1 次',
    description: '打開「萌寵小遊戲中心」完成 1 場遊戲結算。',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      coins: 45,
      foodId: 'blueberry_tart',
      foodQty: 1,
    },
  },
  {
    id: 'dress_1',
    title: '造型或小屋佈置 1 次',
    description: '幫{pet}換上 1 件穿搭配件，或在「小屋」擺放/裝飾 1 個角落。',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      coins: 34,
      foodId: 'mint_parfait',
      foodQty: 1,
    },
  },
];

function hashDateSeed(dateStr: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dateStr.length; i += 1) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createDailyTasksForDate(dateStr?: string): DailyTask[] {
  if (!dateStr) {
    return DAILY_TASK_TEMPLATES.slice(0, 4).map((task) => ({
      ...task,
      reward: { ...task.reward },
    }));
  }

  // Always include 1 core care task + rotate 3 from the remaining 7 tasks deterministically by date
  const seed = hashDateSeed(dateStr);
  const corePool = DAILY_TASK_TEMPLATES.slice(0, 2); // feed_1 or pet_3
  const primaryTask = corePool[seed % corePool.length];
  const remaining = DAILY_TASK_TEMPLATES.filter((t) => t.id !== primaryTask.id);

  // Deterministic Fisher-Yates shuffle on remaining 7 tasks
  const pool = [...remaining];
  let rng = seed ^ 0x9e3779b9;
  for (let i = pool.length - 1; i > 0; i -= 1) {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    const j = rng % (i + 1);
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }

  const chosen = [primaryTask, ...pool.slice(0, 3)];
  return chosen.map((task) => ({
    ...task,
    reward: { ...task.reward },
  }));
}

export function createInitialDailyTasks(dateStr?: string): DailyTask[] {
  return createDailyTasksForDate(dateStr);
}

export function formatDailyTaskDescription(description: string, petName: string): string {
  const safeName = petName.trim() || '萌寵';
  return description.replace(/\{pet\}/g, safeName).replace(/小豬/g, safeName);
}
