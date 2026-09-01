import type { Bill, CategoryId, Debt } from "@/lib/types";

export const CATEGORIES: { id: CategoryId; label: string; color: string }[] = [
  { id: "food", label: "อาหาร", color: "#E0483E" },
  { id: "transport", label: "เดินทาง", color: "#5B4FE0" },
  { id: "home", label: "บ้าน", color: "#1F9D55" },
  { id: "debt", label: "หนี้", color: "#D9A404" },
  { id: "shopping", label: "ช้อปปิ้ง", color: "#C2489F" },
  { id: "utility", label: "ค่าสาธารณูปโภค", color: "#2AA7C4" },
  { id: "work", label: "งาน/อุปกรณ์", color: "#6B6B80" },
  { id: "other", label: "อื่น ๆ", color: "#9A97AE" },
];

export function catInfo(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function baht(n: number) {
  return "฿" + Math.round(n).toLocaleString("th-TH");
}

export const thMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
export const thMonthsShort = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
export const weekdaysTH = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** A due-dated recurring item — either a debt or a bill — normalized to one shape
 *  so Calendar / Dashboard / notifications don't need to special-case either kind. */
export type DueItem = {
  id: string;
  name: string;
  icon: string;
  due_day: number;
  monthly_payment: number;
  kind: "debt" | "bill";
};

export function toDueItems(debts: Debt[], bills: Bill[]): DueItem[] {
  return [
    ...debts.map((d) => ({ id: d.id, name: d.name, icon: d.icon, due_day: d.due_day, monthly_payment: d.monthly_payment, kind: "debt" as const })),
    ...bills.map((b) => ({ id: b.id, name: b.name, icon: b.icon, due_day: b.due_day, monthly_payment: b.monthly_payment, kind: "bill" as const })),
  ];
}

function nextDueDate(dueDay: number, from = new Date()) {
  const y = from.getFullYear(), m = from.getMonth(), d = from.getDate();
  let candidate = new Date(y, m, dueDay);
  if (dueDay < d) candidate = new Date(y, m + 1, dueDay);
  return candidate;
}
function daysBetween(a: Date, b: Date) {
  const MS = 24 * 60 * 60 * 1000;
  const a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((+b0 - +a0) / MS);
}

export const HIGHLIGHT_COLORS = [
  "#5B4FE0", // indigo (primary)
  "#1F9D55", // green
  "#E0483E", // red
  "#D9A404", // amber
  "#2AA7C4", // teal
  "#C2489F", // magenta
  "#F97316", // orange
  "#0EA5E9", // sky
];

/** Deterministic color per item, keyed by its position in a stable-ordered list. */
export function colorAt(index: number) {
  return HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length];
}

/** A soft highlight background for a calendar cell: a flat tint for one color,
 *  a diagonal multi-color gradient when several items land on the same day. */
export function cellHighlight(colors: string[]) {
  if (colors.length === 0) return "transparent";
  if (colors.length === 1) return colors[0] + "26"; // ~15% opacity
  const step = 100 / colors.length;
  const stops = colors
    .map((c, i) => `${c}40 ${i * step}%, ${c}40 ${(i + 1) * step}%`)
    .join(", ");
  return `linear-gradient(135deg, ${stops})`;
}

export function urgency(days: number) {
  if (days <= 3) return { color: "#E0483E", soft: "#FCEAE9", label: "ด่วน" };
  if (days <= 7) return { color: "#D9A404", soft: "#FBF3DC", label: "ใกล้ถึง" };
  return { color: "#77748F", soft: "#EAE8F4", label: "ปกติ" };
}

export function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Buckets transactions into the last `monthsBack` calendar months (oldest first). */
export function aggregateMonthly(
  transactions: { type: "income" | "expense"; amount: number; date: string }[],
  monthsBack = 12
) {
  const now = new Date();
  const buckets: Record<string, { income: number; expense: number }> = {};
  const order: string[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = monthKey(d);
    buckets[k] = { income: 0, expense: 0 };
    order.push(k);
  }

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const k = monthKey(d);
    if (buckets[k]) {
      if (t.type === "income") buckets[k].income += t.amount;
      else buckets[k].expense += t.amount;
    }
  });

  return order.map((k, i) => ({
    key: k,
    label: i === order.length - 1 ? "เดือนนี้" : thMonthsShort[Number(k.split("-")[1]) - 1],
    income: buckets[k].income,
    expense: buckets[k].expense,
  }));
}
export function withUpcoming<T extends { due_day: number }>(items: T[]) {
  const today = new Date();
  return items
    .map((d) => ({ ...d, days: daysBetween(today, nextDueDate(d.due_day)) }))
    .sort((a, b) => a.days - b.days);
}
