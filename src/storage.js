// 資料存取層。config.js 有填 Supabase 設定就走雲端共享,沒填自動退回 localStorage 單機。
// localStorage 同時當快取:雲端讀取失敗時(斷網)顯示最後一次成功的資料。

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, BOARD_ID } from "./config";

const STORE_KEY = "camp-schedule-v1";

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

function loadLocal() {
  const raw = localStorage.getItem(STORE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveLocal(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export async function loadData() {
  if (!supabase) return loadLocal();
  try {
    const { data: row, error } = await supabase
      .from("boards")
      .select("data")
      .eq("id", BOARD_ID)
      .maybeSingle();
    if (error) throw error;
    if (row?.data) saveLocal(row.data);
    return row?.data ?? null;
  } catch {
    return loadLocal();
  }
}

export async function saveData(data) {
  saveLocal(data);
  if (!supabase) return;
  const { error } = await supabase.from("boards").upsert({
    id: BOARD_ID,
    data,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error; // App 端會顯示「儲存失敗,請重試」
}
