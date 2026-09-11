import { createClient } from "@/lib/supabase/server";
import { aggregateMonthly, baht, catInfo, toDueItems, withUpcoming } from "@/lib/helpers";
import { DashboardView } from "@/components/DashboardView";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";
import type { Bill, Debt, Transaction } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // last ~500 rows is plenty for a personal MVP; move to a SQL view/RPC
  // if this ever needs true all-time aggregation at scale.
  const { data: txData } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .limit(500);
  const transactions = (txData ?? []) as Transaction[];

  const [{ data: debtsData }, { data: billsData }, { data: profile }] = await Promise.all([
    supabase.from("debts").select("*"),
    supabase.from("bills").select("*"),
    supabase.from("profiles").select("plan").eq("id", user!.id).single(),
  ]);
  const debts = (debtsData ?? []) as Debt[];
  const bills = (billsData ?? []) as Bill[];
  const plan = (profile?.plan as Plan) ?? "free";

  const monthly = aggregateMonthly(transactions, 12);
  const thisMonth = monthly[monthly.length - 1];
  const lastMonth = monthly[monthly.length - 2] ?? { income: 0, expense: 0 };

  const income = thisMonth.income;
  const expense = thisMonth.expense;
  const balance = transactions.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);

  // debts + bills share the same "due soon" logic (Calendar-style)
  const upcomingItems = withUpcoming(toDueItems(debts, bills));
  const reminders7 = upcomingItems
    .filter((d) => d.days <= 7)
    .map((d) => ({ id: d.id, name: d.name, icon: d.icon, monthly_payment: d.monthly_payment, days: d.days }));
  const upcoming7Total = reminders7.reduce((s, d) => s + d.monthly_payment, 0);

  const now = new Date();
  const thisMonthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const expenseChangePct = lastMonth.expense > 0 ? Math.round(((expense - lastMonth.expense) / lastMonth.expense) * 100) : 0;

  const catSums: Record<string, number> = {};
  thisMonthTx.filter((t) => t.type === "expense").forEach((t) => (catSums[t.category] = (catSums[t.category] || 0) + t.amount));
  const topCatEntry = Object.entries(catSums).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCatEntry ? catInfo(topCatEntry[0]).label : "-";

  // debt-to-income ratio is about debts specifically, not recurring bills
  const totalMonthlyDebt = debts.reduce((s, d) => s + d.monthly_payment, 0);
  const debtRatio = income > 0 ? Math.round((totalMonthlyDebt / income) * 100) : 0;

  const insights =
    thisMonthTx.length === 0
      ? ["ยังไม่มีรายการเดือนนี้ — เริ่มเพิ่มรายการแรกได้จากปุ่ม \"เพิ่มรายการ\""]
      : [
          `เดือนนี้คุณใช้เงิน${expenseChangePct >= 0 ? "มากกว่า" : "น้อยกว่า"}เดือนก่อน <b>${Math.abs(expenseChangePct)}%</b>`,
          ...(topCatEntry ? [`<b>${topCategory}</b> เป็นหมวดที่มีค่าใช้จ่ายสูงสุดเดือนนี้`] : []),
          `อีก 7 วันมีรายการที่ต้องจ่ายรวม <b>${baht(upcoming7Total)}</b>`,
          `ยอดผ่อนหนี้คิดเป็น <b>${debtRatio}%</b> ของรายรับเดือนนี้`,
        ];

  const isNewUser = transactions.length === 0 && debts.length === 0 && bills.length === 0;

  return (
    <DashboardView
      balance={balance}
      income={income}
      expense={expense}
      upcoming7Total={upcoming7Total}
      monthly={monthly}
      reminders7={reminders7}
      insights={insights}
      isNewUser={isNewUser}
      maxChartMonths={PLAN_LIMITS[plan].maxChartMonths}
    />
  );
}
