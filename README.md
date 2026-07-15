# 接送看板 pickup-board

給家庭用的小孩夏令營/課後活動接送看板。目標:讓爸媽、爺爺奶奶都能一眼看懂「今天誰送誰接、幾點、在哪」,解決交接資訊只在爸媽腦袋裡的問題。

## 功能

- **今天**:兩個小孩各一張卡片,顯示活動時間、地點、誰送誰接、備註
- **本週**:整週總覽
- **分享**:一鍵產生 LINE 純文字版(今天/明天/本週),複製貼到家庭群組
- **管理**:新增/修改活動(支援週幾重複 + 起訖日期,不同梯次營隊各建一筆)

## 開發

```bash
npm install
npm run dev      # 本機開發 http://localhost:5173
npm run build    # 產出 dist/
```

## 部署

部署到 GitHub Pages(`gh-pages` 分支):

```bash
npm run deploy
```

> 註:原本想用 GitHub Actions 自動部署,但本機 gh token 缺 `workflow` scope 推不上 workflow 檔。之後想改自動部署:`gh auth refresh -s workflow` 再加回 `.github/workflows/deploy.yml`。

## 資料儲存

**Supabase**(`boards` 表,單 row 存整包 JSON)+ localStorage 當快取/斷網 fallback。存取層在 [src/storage.js](src/storage.js)。

啟用步驟:

1. 在 Supabase SQL Editor 執行 [supabase/schema.sql](supabase/schema.sql)
2. 把 Project URL 和 anon key 填進 [src/config.js](src/config.js)
3. `npm run deploy`

`config.js` 留空時自動退回 localStorage 單機模式,網站照常運作。

## Roadmap

- [x] **完成 Supabase 串接**(2026-07-15,專案 fyfmhdoluahjvncmgcaq,REST 讀寫驗證通過)
- [ ] 輸入實際兩個小孩的暑期行程
- [ ] Supabase Realtime:開著的頁面自動更新
- [ ] PWA:加到主畫面、離線可看
- [ ] 「今日異動」提醒(例:今天改由爺爺接)
