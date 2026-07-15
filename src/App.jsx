import { useState, useEffect } from "react";
import { loadData, saveData } from "./storage";

// ===== 常數 =====
const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
const KID_COLORS = [
  { main: "#1F5FA8", soft: "#E8F0FA" }, // 藍
  { main: "#2E7D5B", soft: "#E7F3EE" }, // 綠
];

const DEFAULT_DATA = {
  kids: [
    { id: "k1", name: "老大" },
    { id: "k2", name: "老二" },
  ],
  activities: [],
};

const font = '"PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';

// ===== 小工具 =====
const fmtDate = (d) =>
  `${d.getMonth() + 1}/${d.getDate()}(${DAY_LABELS[d.getDay()]})`;

const toMin = (t) => {
  const [h, m] = (t || "0:0").split(":").map(Number);
  return h * 60 + m;
};

const toDS = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function activeOnDate(act, date) {
  if (!act.days.includes(date.getDay())) return false;
  const ds = toDS(date);
  if (act.from && ds < act.from) return false;
  if (act.to && ds > act.to) return false;
  return true;
}

// 單日提醒:activity 可掛 alerts:[{date:"YYYY-MM-DD", note:"原因", part?:"dropoff"|"pickup"}]
// 沒有 part 整張卡片變淡紅;有 part 只有該段(送或接)標紅
function alertOnDate(act, date) {
  const ds = toDS(date);
  return (act.alerts || []).find((al) => al.date === ds) || null;
}

const ALERT_BG = "#FDECEC";
const ALERT_COLOR = "#B00020";

// ===== 主元件 =====
export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("today"); // today | week | share | manage
  const [dayOffset, setDayOffset] = useState(0);
  const [editing, setEditing] = useState(null); // null | activity obj
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    loadData()
      .then((d) => setData(d ?? DEFAULT_DATA))
      .catch(() => setData(DEFAULT_DATA));
  }, []);

  async function save(next) {
    setData(next);
    try {
      await saveData(next);
      setSaveMsg("已儲存 ✓");
      setTimeout(() => setSaveMsg(""), 1500);
    } catch {
      setSaveMsg("儲存失敗,請重試");
    }
  }

  if (!data)
    return (
      <div style={{ fontFamily: font, padding: 40, textAlign: "center", color: "#888" }}>
        載入中…
      </div>
    );

  const kidColor = (kidId) => {
    const i = data.kids.findIndex((k) => k.id === kidId);
    return KID_COLORS[i >= 0 ? i % KID_COLORS.length : 0];
  };
  const kidName = (kidId) => data.kids.find((k) => k.id === kidId)?.name || "?";

  const viewDate = new Date();
  viewDate.setDate(viewDate.getDate() + dayOffset);

  return (
    <div style={{ fontFamily: font, background: "#F6F7F5", minHeight: "100vh", color: "#222" }}>
      {/* 頁首 */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E3E5E1", padding: "14px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>接送看板</div>
          <div style={{ fontSize: 13, color: "#2E7D5B", minHeight: 18 }}>{saveMsg}</div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
          {[
            ["today", "今天"],
            ["week", "本週"],
            ["share", "分享"],
            ["manage", "管理"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setEditing(null); }}
              style={{
                flex: key === "manage" ? 0.7 : 1,
                padding: "10px 0",
                fontSize: 17,
                fontWeight: tab === key ? 700 : 500,
                fontFamily: font,
                color: tab === key ? "#1F5FA8" : "#777",
                background: "none",
                border: "none",
                borderBottom: tab === key ? "3px solid #1F5FA8" : "3px solid transparent",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 560, margin: "0 auto" }}>
        {tab === "today" && (
          <TodayView
            date={viewDate}
            dayOffset={dayOffset}
            setDayOffset={setDayOffset}
            data={data}
            kidColor={kidColor}
          />
        )}
        {tab === "week" && <WeekView data={data} kidColor={kidColor} kidName={kidName} />}
        {tab === "share" && <ShareView data={data} />}
        {tab === "manage" && (
          <ManageView
            data={data}
            save={save}
            editing={editing}
            setEditing={setEditing}
            kidColor={kidColor}
            kidName={kidName}
          />
        )}
      </div>
    </div>
  );
}

// ===== 今天 =====
function TodayView({ date, dayOffset, setDayOffset, data, kidColor }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <NavBtn onClick={() => setDayOffset(dayOffset - 1)}>‹ 前一天</NavBtn>
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          {dayOffset === 0 ? "今天 " : dayOffset === 1 ? "明天 " : ""}
          {fmtDate(date)}
        </div>
        <NavBtn onClick={() => setDayOffset(dayOffset + 1)}>後一天 ›</NavBtn>
      </div>

      {data.kids.map((kid) => {
        const acts = data.activities
          .filter((a) => a.kidId === kid.id && activeOnDate(a, date))
          .sort((a, b) => toMin(a.start) - toMin(b.start));
        const c = kidColor(kid.id);
        return (
          <div key={kid.id} style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "inline-block",
                background: c.main,
                color: "#fff",
                fontSize: 18,
                fontWeight: 800,
                padding: "4px 16px",
                borderRadius: "10px 10px 0 0",
              }}
            >
              {kid.name}
            </div>
            <div
              style={{
                background: "#fff",
                border: `2px solid ${c.main}`,
                borderRadius: "0 12px 12px 12px",
                overflow: "hidden",
              }}
            >
              {acts.length === 0 && (
                <div style={{ padding: 18, fontSize: 17, color: "#999" }}>今天沒有安排 🎉</div>
              )}
              {acts.map((a, i) => {
                const alert = alertOnDate(a, date);
                const wholeAlert = alert && !alert.part;
                return (
                  <div
                    key={a.id}
                    style={{
                      padding: "14px 16px",
                      borderTop: i > 0 ? "1px solid #EEE" : "none",
                      background: wholeAlert ? ALERT_BG : i % 2 ? c.soft : "#fff",
                    }}
                  >
                    <div style={{ fontSize: 19, fontWeight: 800 }}>
                      {a.start}–{a.end}　{a.title}
                    </div>
                    {alert && (
                      <div style={{ fontSize: 17, marginTop: 4, color: ALERT_COLOR, fontWeight: 800 }}>
                        ❗ {alert.note}
                      </div>
                    )}
                    <div style={{ fontSize: 17, marginTop: 4, color: "#444" }}>📍 {a.location || "—"}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <Badge
                        label="送"
                        who={a.dropoff}
                        color={alert?.part === "dropoff" ? ALERT_COLOR : c.main}
                        highlight={alert?.part === "dropoff"}
                      />
                      <Badge
                        label="接"
                        who={a.pickup}
                        color={alert?.part === "pickup" ? ALERT_COLOR : "#B54A1F"}
                        highlight={alert?.part === "pickup"}
                      />
                    </div>
                    {a.note && (
                      <div style={{ fontSize: 15, marginTop: 6, color: "#8A6D1A" }}>⚠ {a.note}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Badge({ label, who, color, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: `2px solid ${color}`,
        borderRadius: 8,
        overflow: "hidden",
        fontSize: 17,
        fontWeight: 800,
      }}
    >
      <span style={{ background: color, color: "#fff", padding: "3px 10px" }}>{label}</span>
      <span style={{ padding: "3px 12px", color, background: highlight ? ALERT_BG : "transparent" }}>
        {highlight ? "❗" : ""}{who || "未定"}
      </span>
    </div>
  );
}

function NavBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: font,
        fontSize: 15,
        padding: "6px 10px",
        border: "1px solid #CCC",
        borderRadius: 8,
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ===== 本週 =====
function WeekView({ data, kidColor, kidName }) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div>
      {days.map((d) => {
        const acts = data.activities
          .filter((a) => activeOnDate(a, d))
          .sort((a, b) => toMin(a.start) - toMin(b.start));
        const isToday = d.toDateString() === today.toDateString();
        if (acts.length === 0) return null;
        return (
          <div key={d} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                marginBottom: 6,
                color: isToday ? "#1F5FA8" : "#333",
              }}
            >
              {fmtDate(d)} {isToday && "← 今天"}
            </div>
            <div style={{ background: "#fff", border: "1px solid #E3E5E1", borderRadius: 12, overflow: "hidden" }}>
              {acts.map((a, i) => {
                const c = kidColor(a.kidId);
                const alert = alertOnDate(a, d);
                const mark = (part) =>
                  alert?.part === part ? { color: ALERT_COLOR, fontWeight: 800 } : {};
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderTop: i > 0 ? "1px solid #EEE" : "none",
                      fontSize: 16,
                      background: alert && !alert.part ? ALERT_BG : "#fff",
                    }}
                  >
                    <span
                      style={{
                        background: c.main,
                        color: "#fff",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {kidName(a.kidId)}
                    </span>
                    <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                      {a.start}–{a.end}
                    </span>
                    <span style={{ flex: 1 }}>
                      {a.title}
                      <span style={{ color: "#888" }}>
                        ｜<span style={mark("dropoff")}>送:{a.dropoff || "?"}</span>{" "}
                        <span style={mark("pickup")}>接:{a.pickup || "?"}</span>
                      </span>
                      {alert && (
                        <div style={{ color: ALERT_COLOR, fontWeight: 700 }}>❗ {alert.note}</div>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {data.activities.length === 0 && (
        <div style={{ textAlign: "center", color: "#999", fontSize: 17, padding: 40 }}>
          還沒有任何活動,到「管理」新增
        </div>
      )}
    </div>
  );
}

// ===== 分享 =====
function ShareView({ data }) {
  const [range, setRange] = useState("today"); // today | tomorrow | week
  const [copied, setCopied] = useState(false);

  function dayText(date) {
    let out = `📅 ${fmtDate(date)} 接送安排\n`;
    let any = false;
    for (const kid of data.kids) {
      const acts = data.activities
        .filter((a) => a.kidId === kid.id && activeOnDate(a, date))
        .sort((a, b) => toMin(a.start) - toMin(b.start));
      if (acts.length === 0) continue;
      any = true;
      out += `\n【${kid.name}】\n`;
      for (const a of acts) {
        out += `🕒 ${a.start}–${a.end} ${a.title}\n`;
        const alert = alertOnDate(a, date);
        if (alert) out += `❗ ${alert.note}\n`;
        if (a.location) out += `📍 ${a.location}\n`;
        out += `🚗 送:${a.dropoff || "未定"}｜接:${a.pickup || "未定"}\n`;
        if (a.note) out += `⚠️ ${a.note}\n`;
      }
    }
    if (!any) out += "\n(這天沒有安排)\n";
    return out;
  }

  let text = "";
  const today = new Date();
  if (range === "today") text = dayText(today);
  else if (range === "tomorrow") {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    text = dayText(d);
  } else {
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const parts = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const hasActs = data.activities.some((a) => activeOnDate(a, d));
      if (hasActs) parts.push(dayText(d));
    }
    text = parts.length ? "📋 本週接送總表\n\n" + parts.join("\n————————\n") : "本週沒有任何安排";
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪貼簿失敗時,使用者仍可長按下方文字手動複製
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          ["today", "今天"],
          ["tomorrow", "明天"],
          ["week", "本週"],
        ].map(([k, label]) => (
          <Chip key={k} active={range === k} color="#1F5FA8" onClick={() => setRange(k)}>
            {label}
          </Chip>
        ))}
      </div>

      <button
        onClick={copy}
        style={{
          width: "100%",
          padding: 14,
          fontSize: 18,
          fontWeight: 800,
          fontFamily: font,
          color: "#fff",
          background: copied ? "#2E7D5B" : "#1F5FA8",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        {copied ? "已複製 ✓ 去 LINE 貼上" : "複製文字"}
      </button>

      <textarea
        readOnly
        value={text}
        rows={Math.min(20, text.split("\n").length + 1)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 12,
          fontSize: 15,
          fontFamily: font,
          lineHeight: 1.6,
          border: "1px solid #E3E5E1",
          borderRadius: 12,
          background: "#fff",
          resize: "none",
        }}
      />
      <div style={{ fontSize: 13, color: "#999", marginTop: 8 }}>
        複製失敗的話,長按上方文字也可以手動全選複製。
      </div>
    </div>
  );
}

// ===== 管理 =====
const EMPTY_ACT = {
  id: "",
  kidId: "k1",
  title: "",
  days: [],
  start: "08:30",
  end: "12:00",
  location: "",
  dropoff: "",
  pickup: "",
  from: "",
  to: "",
  note: "",
};

function ManageView({ data, save, editing, setEditing, kidColor, kidName }) {
  const [names, setNames] = useState(data.kids.map((k) => k.name));

  if (editing) {
    return (
      <ActivityForm
        act={editing}
        kids={data.kids}
        onCancel={() => setEditing(null)}
        onSave={(act) => {
          const exists = data.activities.some((a) => a.id === act.id);
          const activities = exists
            ? data.activities.map((a) => (a.id === act.id ? act : a))
            : [...data.activities, act];
          save({ ...data, activities });
          setEditing(null);
        }}
        onDelete={(id) => {
          save({ ...data, activities: data.activities.filter((a) => a.id !== id) });
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div>
      <button
        onClick={() => setEditing({ ...EMPTY_ACT, id: "a" + Date.now() })}
        style={{
          width: "100%",
          padding: 14,
          fontSize: 18,
          fontWeight: 800,
          fontFamily: font,
          color: "#fff",
          background: "#1F5FA8",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        ＋ 新增活動
      </button>

      {data.activities.map((a) => {
        const c = kidColor(a.kidId);
        return (
          <div
            key={a.id}
            onClick={() => setEditing({ ...EMPTY_ACT, ...a })}
            style={{
              background: "#fff",
              border: "1px solid #E3E5E1",
              borderLeft: `6px solid ${c.main}`,
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 8,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            <b>{kidName(a.kidId)}</b>｜{a.title}｜週{a.days.map((d) => DAY_LABELS[d]).join("")}{" "}
            {a.start}–{a.end}
            <div style={{ color: "#888", fontSize: 14 }}>點一下修改</div>
          </div>
        );
      })}

      <div style={{ background: "#fff", border: "1px solid #E3E5E1", borderRadius: 12, padding: 14, marginTop: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>小孩名稱</div>
        {names.map((n, i) => (
          <input
            key={i}
            value={n}
            onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))}
            style={inputStyle}
          />
        ))}
        <button
          onClick={() =>
            save({ ...data, kids: data.kids.map((k, i) => ({ ...k, name: names[i] || k.name })) })
          }
          style={{ ...smallBtn, marginTop: 4 }}
        >
          更新名稱
        </button>
      </div>

      <div style={{ fontSize: 13, color: "#999", marginTop: 16, lineHeight: 1.6 }}>
        目前資料只存在這台裝置(localStorage),尚未跨裝置共享——要給爺爺奶奶看請先用「分享」複製文字貼 LINE。
      </div>
    </div>
  );
}

function ActivityForm({ act, kids, onCancel, onSave, onDelete }) {
  const [f, setF] = useState(act);
  const set = (k, v) => setF({ ...f, [k]: v });

  return (
    <div style={{ background: "#fff", border: "1px solid #E3E5E1", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
        {act.title ? "修改活動" : "新增活動"}
      </div>

      <Field label="哪個小孩">
        <div style={{ display: "flex", gap: 8 }}>
          {kids.map((k, i) => (
            <Chip
              key={k.id}
              active={f.kidId === k.id}
              color={KID_COLORS[i % KID_COLORS.length].main}
              onClick={() => set("kidId", k.id)}
            >
              {k.name}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="活動名稱">
        <input style={inputStyle} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="例:游泳夏令營" />
      </Field>

      <Field label="星期幾(可多選)">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <Chip
              key={d}
              active={f.days.includes(d)}
              color="#1F5FA8"
              onClick={() =>
                set("days", f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d])
              }
            >
              {DAY_LABELS[d]}
            </Chip>
          ))}
        </div>
      </Field>

      <div style={{ display: "flex", gap: 10 }}>
        <Field label="開始" style={{ flex: 1 }}>
          <input type="time" style={inputStyle} value={f.start} onChange={(e) => set("start", e.target.value)} />
        </Field>
        <Field label="結束" style={{ flex: 1 }}>
          <input type="time" style={inputStyle} value={f.end} onChange={(e) => set("end", e.target.value)} />
        </Field>
      </div>

      <Field label="地點">
        <input style={inputStyle} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="例:市立游泳池 2F" />
      </Field>

      <div style={{ display: "flex", gap: 10 }}>
        <Field label="誰送" style={{ flex: 1 }}>
          <input style={inputStyle} value={f.dropoff} onChange={(e) => set("dropoff", e.target.value)} placeholder="例:爸爸" />
        </Field>
        <Field label="誰接" style={{ flex: 1 }}>
          <input style={inputStyle} value={f.pickup} onChange={(e) => set("pickup", e.target.value)} placeholder="例:奶奶" />
        </Field>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Field label="開始日期(選填)" style={{ flex: 1 }}>
          <input type="date" style={inputStyle} value={f.from} onChange={(e) => set("from", e.target.value)} />
        </Field>
        <Field label="結束日期(選填)" style={{ flex: 1 }}>
          <input type="date" style={inputStyle} value={f.to} onChange={(e) => set("to", e.target.value)} />
        </Field>
      </div>

      <Field label="備註(選填)">
        <input style={inputStyle} value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="例:要帶泳帽、蛙鏡" />
      </Field>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          onClick={() => f.title && f.days.length > 0 && onSave(f)}
          style={{
            flex: 2,
            padding: 12,
            fontSize: 17,
            fontWeight: 800,
            fontFamily: font,
            color: "#fff",
            background: f.title && f.days.length ? "#1F5FA8" : "#BBB",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          儲存
        </button>
        <button onClick={onCancel} style={{ ...smallBtn, flex: 1 }}>取消</button>
        {act.title && (
          <button
            onClick={() => onDelete(f.id)}
            style={{ ...smallBtn, flex: 1, color: "#B00020", borderColor: "#B00020" }}
          >
            刪除
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function Chip({ active, color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        fontSize: 16,
        fontWeight: 700,
        fontFamily: font,
        borderRadius: 999,
        border: `2px solid ${active ? color : "#CCC"}`,
        background: active ? color : "#fff",
        color: active ? "#fff" : "#555",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  fontSize: 16,
  fontFamily: font,
  border: "1px solid #CCC",
  borderRadius: 8,
  marginBottom: 6,
  background: "#fff",
};

const smallBtn = {
  padding: "10px 12px",
  fontSize: 15,
  fontFamily: font,
  fontWeight: 700,
  background: "#fff",
  border: "1px solid #CCC",
  borderRadius: 10,
  cursor: "pointer",
};
