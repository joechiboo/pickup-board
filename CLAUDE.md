# pickup-board 接送看板

家庭用接送看板:兩個小孩的夏令營/課後活動,讓爸媽和爺爺奶奶都看得懂誰送誰接。原型來自 claude.ai artifact,已移植成 Vite + React 專案。

## 架構速覽

- 單頁 React app,所有 UI 都在 `src/App.jsx`(今天/本週/分享/管理 四個 tab),inline style、無 CSS framework
- 資料存取層在 `src/storage.js`:目前 localStorage,**介面刻意 async**,之後換共享後端只改這個檔案
- 資料格式:`{ kids: [{id, name}], activities: [{id, kidId, title, days:[0-6], start, end, location, dropoff, pickup, from, to, note}] }`
- 部署:`npm run deploy`(build + 推 `gh-pages` 分支)→ GitHub Pages(`vite.config.js` 設了 `base: './'`)。**改完程式要記得跑 deploy,push main 不會自動部署**(gh token 缺 workflow scope,推不了 Actions workflow 檔)

## 使用情境(影響設計決策)

- 主要讀者是長輩,手機瀏覽:字要大(16px+)、對比要夠、操作要少
- 「分享」tab 產生 LINE 純文字版是目前跨裝置的主要手段
- 地點只寫到認得出來的程度,不放詳細個資(連結可能外流)

## 下一步(優先序)

1. **跨裝置共享資料** — 最重要的缺口。目前 localStorage 單機,爺爺奶奶開網頁看不到爸媽輸入的行程。方案比較在 README Roadmap。
2. 輸入實際行程資料
3. PWA / 加到主畫面
