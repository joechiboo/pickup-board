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

目前存 **localStorage(單機)**,尚未跨裝置共享。存取層抽在 [src/storage.js](src/storage.js),之後換共享後端只改這個檔案。

## Roadmap

- [ ] **跨裝置共享資料**(關鍵!目前只有分享文字可跨裝置)— 候選方案:
  - 行程 JSON 放 repo、改資料走 commit(免後端,爸媽用 Claude/GitHub 改)
  - Firebase Realtime DB / Supabase(免費額度夠,即時同步)
  - GitHub Gist 當後端(token 管理較麻煩)
- [ ] 輸入實際兩個小孩的暑期行程
- [ ] PWA:加到主畫面、離線可看
- [ ] 「今日異動」提醒(例:今天改由爺爺接)
