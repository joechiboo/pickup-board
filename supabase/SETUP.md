# Supabase 建置步驟(一次性)

手機瀏覽器就能完成,約 5-10 分鐘。**不需要** Connect to GitHub(那是 database branching 用的,本專案用不到)。

## 1. 建立專案

1. 開 <https://supabase.com/dashboard> 登入(用 GitHub 帳號登入 OK,這只是登入方式)
2. **New project**
   - Organization:選既有的即可
   - Name:`pickup-board`
   - Database Password:隨便產一組存好(這個 app 不會用到它,但重設資料庫時需要)
   - Region:**Northeast Asia (Tokyo)** 離台灣最近
3. Create,等 1-2 分鐘 provision 完成

> 也可以不開新專案、用既有專案,只是多一張 `boards` 表。

## 2. 建表

1. 左側選單 → **SQL Editor** → New query
2. 把 [schema.sql](schema.sql) 整段貼上 → **Run**
3. 看到 Success 即可(左側 Table Editor 應出現 `boards` 表)

## 3. 取得連線資訊

1. 左側選單 → **Project Settings**(齒輪)→ **Data API**:複製 **Project URL**(`https://xxxx.supabase.co`)
2. 同頁或 **API Keys** 分頁:複製 **anon / public** key(很長的一串,是公開用的,不是 service_role)

## 4. 填進程式

把兩個值貼給 Claude session,請它填入 [src/config.js](../src/config.js) 的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`,然後:

- 桌機:`npm run deploy`
- 雲端/手機 session:填完 push main,回桌機再跑 deploy

## 5. 驗證

兩台裝置開 <https://joechiboo.github.io/pickup-board/>,A 裝置「管理」新增一筆活動,B 裝置重新整理後看得到 → 完成。

## 疑難排解

- **B 裝置看不到**:先確認 deploy 過了(gh-pages 分支要有新 bundle);再開瀏覽器 DevTools 看 Network 有沒有打到 `supabase.co`
- **儲存失敗,請重試**:多半是 RLS policy 沒建到,回 SQL Editor 重跑 schema.sql
- config 留空時 app 會退回 localStorage 單機模式,不會壞,只是不共享
