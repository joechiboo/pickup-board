# pickup-board 接送看板

家庭用接送看板:兩個小孩的夏令營/課後活動,讓爸媽和爺爺奶奶都看得懂誰送誰接。原型來自 claude.ai artifact,已移植成 Vite + React 專案。

## 架構速覽

- 單頁 React app,所有 UI 都在 `src/App.jsx`(今天/本週/分享/管理 四個 tab),inline style、無 CSS framework
- 資料存取層在 `src/storage.js`:Supabase(`boards` 表,單 row 存整包 JSON)+ localStorage 當快取與 fallback。`src/config.js` 沒填 Supabase 設定時自動退回單機模式
- 資料格式:`{ kids: [{id, name}], activities: [{id, kidId, title, days:[0-6], start, end, location, dropoff, pickup, from, to, note}] }`
- 部署:`npm run deploy`(build + 推 `gh-pages` 分支)→ GitHub Pages(`vite.config.js` 設了 `base: './'`)。**改完程式要記得跑 deploy,push main 不會自動部署**(gh token 缺 workflow scope,推不了 Actions workflow 檔)

## 使用情境(影響設計決策)

- 主要讀者是長輩,手機瀏覽:字要大(16px+)、對比要夠、操作要少
- 「分享」tab 產生 LINE 純文字版是目前跨裝置的主要手段
- 地點只寫到認得出來的程度,不放詳細個資(連結可能外流)

## 下一步(優先序)

1. 輸入實際兩個小孩的暑期行程(在網頁「管理」頁直接輸入即可,存進 Supabase 全家共享)
2. PWA / 加到主畫面、Supabase Realtime 自動更新

Supabase 已於 2026-07-15 串接完成(專案 fyfmhdoluahjvncmgcaq,region Asia-Pacific,`boards` 表單 row)。建置流程紀錄在 `supabase/SETUP.md`。

## 幫使用者登打行程到 Supabase(自然語言 → 資料)

使用者會用口語描述行程(例:「老大週一三五早上游泳營,爸爸送奶奶接」),請整理成 activity 物件寫入。連線資訊都在 `src/config.js`(SUPABASE_URL、SUPABASE_ANON_KEY、BOARD_ID)。

**⚠ 整個看板存在一個 row 的 `data` 欄位,必須先讀、合併、再寫回,直接覆蓋會弄丟既有活動:**

```bash
KEY=$(grep -o 'sb_publishable_[A-Za-z0-9_]*' src/config.js)
URL=https://fyfmhdoluahjvncmgcaq.supabase.co
BOARD=214215b4ab10445da370077a3d789b7d028d62ba

# 1. 讀出現況
curl -s "$URL/rest/v1/boards?id=eq.$BOARD&select=data" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"

# 2. 在既有 data.activities 陣列後面 append 新活動(id 用 "a" + 任意唯一字串),整包寫回
curl -s -X POST "$URL/rest/v1/boards?on_conflict=id" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" -H "Prefer: resolution=merge-duplicates" \
  -d '[{"id":"'$BOARD'","data":{...合併後的完整 data...}}]'
```

activity 欄位:`kidId`(k1=老大/k2=老二)、`title`、`days`(0=日...6=六 的陣列)、`start`/`end`(HH:MM)、`location`、`dropoff`/`pickup`(誰送/誰接)、`from`/`to`(YYYY-MM-DD,選填,梯次起訖)、`note`(選填)。登打完請使用者重新整理網頁確認。
