# 萌寵食堂

可愛療癒的繁體中文行動裝置優先電子寵物養成 PWA 遊戲。  
無需登入或後端伺服器，所有養成進度、穿搭、每日任務與體重成長紀錄皆安全保存在本機 `localStorage`。

## 專案架構

```text
public/
  manifest.json               # Web App Manifest 設定（萌寵食堂、standalone、粉紅/奶油色主題）
  icon.svg                    # SVG 可愛小豬圖示
  apple-touch-icon.png        # iOS 主畫面圖示 (180x180)
  pwa-192x192.png             # PWA 圖示 (192x192)
  pwa-512x512.png             # PWA 圖示 (512x512)
  pwa-maskable-512x512.png    # Android Maskable 圖示 (512x512)
src/
  types/index.ts              # Pet、Food、Accessory、WeightLog、FeedLog、DailyTask、GameState 型別
  data/
    foods.ts                  # 正餐、零食、速食資料與初始庫存
    accessories.ts            # 頭部、臉部、脖子、身體配件資料
    growth.ts                 # 成長階段與圓滾滾體態等級邏輯
    quests.ts                 # 每日任務定義
  utils/
    storage.ts                # localStorage 讀寫、時間衰減、每日任務重設
    sound.ts                  # Web Audio API 輕量化可愛音效
  hooks/
    usePWAInstall.ts          # PWA 安裝偵測與 iOS Safari 判斷
    useOnlineStatus.ts        # 離線狀態偵測
  components/
    IntroHatching.tsx         # 開場粉紅蛋點擊孵化與命名畫面
    PiggyCharacter.tsx        # 可愛 SVG 動畫小豬與即時配件穿戴層
    AccessoryPreview.tsx      # 衣櫃配件 SVG 預覽圖示
    HomeView.tsx              # 主畫面：狀態條、摸摸、拖曳/點擊餵食與照護按鈕
    CanteenView.tsx           # 食堂頁面：食物分類、購買與餵食
    WardrobeView.tsx          # 衣櫃頁面：穿戴、脫下與解鎖配件
    JournalView.tsx           # 成長手帳：7/30 天體重折線圖、手動輸入體重與紀錄列表
    QuestsView.tsx            # 每日任務：進度條與領取金幣/食材獎勵
    BottomTabBar.tsx          # 固定底部五分頁導覽列
    LevelUpModal.tsx          # 成長升級彈窗
    PWAInstallButton.tsx      # 非強制式安裝提示按鈕與 iOS 加到主畫面引導彈窗
    OfflineIndicator.tsx      # 離線模式提示條
```

## 本機開發執行

請先確認已安裝 Node.js 18 以上版本，於專案根目錄執行：

```bash
npm install
npm run dev
```

啟動後於瀏覽器開啟 `http://localhost:3000`（建議使用瀏覽器開發者工具切換至 iPhone 尺寸預覽）。

## 建置與預覽

```bash
npm run lint
npm run build
npm run preview
```

- `npm run lint` 會執行 TypeScript 型別檢查（`tsc --noEmit`）。
- `npm run build` 會於 `dist/` 產生最佳化後的靜態檔案，並透過 `vite-plugin-pwa` 自動生成 Service Worker (`sw.js`)。
- Service Worker 僅快取靜態資源（JS、CSS、HTML、圖示、字型），`/api/*` 請求設定為 `NetworkOnly`，且 `localStorage` 存檔資料不會被 Service Worker 快取。

## 部署到 Vercel

### 方法一：透過 GitHub 連線部署（推薦）

1. 將本專案推送至您的 GitHub 儲存庫。
2. 前往 [Vercel](https://vercel.com) 並登入帳號，點擊 **Add New Project**。
3. 匯入該 GitHub 儲存庫，Vercel 會自動偵測為 **Vite** 專案：
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. 點擊 **Deploy**，數十秒內即可取得 HTTPS 線上網址。

### 方法二：使用 Vercel CLI 部署

```bash
npm i -g vercel
vercel --prod
```

## iPhone Safari 如何加到主畫面

1. 使用 iPhone 的 **Safari** 開啟《萌寵食堂》的 HTTPS 網址（請勿使用 LINE 或 IG 內建瀏覽器）。
2. 點擊 Safari 下方工具列的 **「分享」** 圖示（方形加上向上箭頭），或點擊遊戲右上角的 **「加到主畫面」** 按鈕查看操作步驟。
3. 往下滑動選單並選擇 **「加入主畫面」**。
4. 確認名稱為 **「萌寵食堂」** 後點擊右上角 **「新增」**。
5. 回到 iPhone 桌面即可看到粉紅小豬圖示，點擊即可全螢幕（`standalone`）啟動並在離線時繼續遊玩！
