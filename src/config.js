// Supabase 連線設定。anon key 本來就會隨前端 bundle 公開,放這裡沒關係(安全靠 RLS + BOARD_ID)。
// 兩個值留空時 app 自動退回 localStorage 單機模式。
export const SUPABASE_URL = "https://fyfmhdoluahjvncmgcaq.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_r32ZjBy2q2nbXrMZXSp2XA_7UAR_tVk";

// 看板資料的主鍵,同時是「知道的人才找得到資料」的暗門,不要外流到 LINE 群以外
export const BOARD_ID = "214215b4ab10445da370077a3d789b7d028d62ba";
