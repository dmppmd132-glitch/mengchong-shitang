import {
  BirthdayOrderKind,
  BirthdayTask,
  CoopBirthdayStepProgress,
} from '../../types';

export function buildInitialCoopBirthdaySteps(): CoopBirthdayStepProgress[] {
  return [
    {
      key: 'cake',
      label: '一起做蛋糕（各自放入奶油／糖或食材）',
      emoji: '🎂',
      target: 2,
      progress: 0,
      contributorUserIds: [],
      contributorNames: [],
    },
    {
      key: 'room',
      label: '一起佈置房間（掛氣球／貼彩帶）',
      emoji: '🎈',
      target: 2,
      progress: 0,
      contributorUserIds: [],
      contributorNames: [],
    },
    {
      key: 'photo',
      label: '一起拍照（選背景／加生日濾鏡）',
      emoji: '📸',
      target: 2,
      progress: 0,
      contributorUserIds: [],
      contributorNames: [],
    },
    {
      key: 'card',
      label: '一起寫賀卡（寫祝福／貼貼圖）',
      emoji: '💌',
      target: 2,
      progress: 0,
      contributorUserIds: [],
      contributorNames: [],
    },
  ];
}

export function buildDailyBirthdayTasks(dateKey: string): BirthdayTask[] {
  return [
    {
      id: `btask_cake_${dateKey}`,
      kind: 'prep_cake',
      title: '準備生日蛋糕',
      description: '在蛋糕廚房製作 1 個生日蛋糕慶祝派對！',
      emoji: '🎂',
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
      rewardTickets: 5,
      rewardCoins: 30,
    },
    {
      id: `btask_decor_${dateKey}`,
      kind: 'prep_decor',
      title: '佈置派對角落',
      description: '開啟或購買 1 項房間／庭院生日派對佈置！',
      emoji: '🎈',
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
      rewardTickets: 3,
      rewardCoins: 25,
    },
    {
      id: `btask_photo_${dateKey}`,
      kind: 'birthday_photo',
      title: '拍下壽星慶生照',
      description: '到攝影棚拍下 1 張可愛的生日寫真！',
      emoji: '📸',
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
      rewardTickets: 4,
      rewardCoins: 30,
    },
    {
      id: `btask_card_${dateKey}`,
      kind: 'birthday_card',
      title: '寄出溫暖生日賀卡',
      description: '在生日賀卡寫下一句祝福並完成存檔！',
      emoji: '💌',
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
      rewardTickets: 4,
      rewardCoins: 25,
    },
  ];
}

export const BIRTHDAY_ORDER_TEMPLATES: Array<{
  kind: BirthdayOrderKind;
  title: string;
  description: string;
  emoji: string;
  target: number;
  rewardTickets: number;
  rewardCoins: number;
}> = [
  {
    kind: 'cake',
    title: '生日甜點訂單：完成 1 個手工蛋糕',
    description: '為即將過生日的小壽星烘烤並享用或擺出 1 個生日蛋糕。',
    emoji: '🍰',
    target: 1,
    rewardTickets: 8,
    rewardCoins: 45,
  },
  {
    kind: 'photo',
    title: '派對寫真訂單：拍攝 1 張生日主題照',
    description: '在攝影棚選用生日主題完成 1 張慶生合照存入照片牆。',
    emoji: '📷',
    target: 1,
    rewardTickets: 6,
    rewardCoins: 40,
  },
  {
    kind: 'gift',
    title: '禮物祝福訂單：送出 1 份生日禮物或寫賀卡',
    description: '準備 1 份生日禮物或寫 1 則生日賀卡祝福送給毛孩！',
    emoji: '🎁',
    target: 1,
    rewardTickets: 5,
    rewardCoins: 35,
  },
];
