// 資料存取層 — 目前用 localStorage(單機),之後換共享後端(Firebase/gist/JSON API)只改這個檔案。
// 介面刻意保持 async,換成遠端儲存時呼叫端不用動。

const STORE_KEY = "camp-schedule-v1";

export async function loadData() {
  const raw = localStorage.getItem(STORE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}
