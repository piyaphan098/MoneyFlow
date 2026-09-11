export type Plan = "free" | "basic" | "premium";

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
};

export const PLAN_LIMITS: Record<
  Plan,
  {
    label: string;
    maxDebtsAndBills: number; // combined count, across debts + bills
    maxChartMonths: number; // 1 | 3 | 6 | 12 — compared directly against the dashboard's range buttons
    lineEnabled: boolean;
    proactiveSummary: boolean; // weekly/monthly LINE push digest
  }
> = {
  free: {
    label: "Free",
    maxDebtsAndBills: 3,
    maxChartMonths: 3,
    lineEnabled: false,
    proactiveSummary: false,
  },
  basic: {
    label: "Basic",
    maxDebtsAndBills: Infinity,
    maxChartMonths: 6,
    lineEnabled: true,
    proactiveSummary: false,
  },
  premium: {
    label: "Premium",
    maxDebtsAndBills: Infinity,
    maxChartMonths: 12,
    lineEnabled: true,
    proactiveSummary: true,
  },
};

export function planLimits(plan: string | null | undefined) {
  return PLAN_LIMITS[plan === "basic" || plan === "premium" ? plan : "free"];
}

export const PLAN_FEATURES: { label: string; free: string; basic: string; premium: string }[] = [
  { label: "บันทึกรายรับ-รายจ่าย", free: "ไม่จำกัด", basic: "ไม่จำกัด", premium: "ไม่จำกัด" },
  { label: "หนี้ + ค่าใช้จ่ายประจำ", free: "รวมกันสูงสุด 3 รายการ", basic: "ไม่จำกัด", premium: "ไม่จำกัด" },
  { label: "ดูกราฟย้อนหลัง", free: "3 เดือน", basic: "6 เดือน", premium: "1 ปี" },
  { label: "เชื่อมต่อ LINE บันทึก/ดูยอด", free: "❌", basic: "✅", premium: "✅" },
  { label: "สรุปรายสัปดาห์/รายเดือนอัตโนมัติผ่าน LINE", free: "❌", basic: "❌", premium: "✅" },
];
