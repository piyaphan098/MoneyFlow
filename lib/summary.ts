import { createAdminClient } from "@/lib/supabase/admin";
import { linePush, bangkokTodayISO } from "@/lib/line";
import { baht, catInfo, thMonthsShort } from "@/lib/helpers";

function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}
function fmtShort(d: Date) {
  return `${d.getUTCDate()} ${thMonthsShort[d.getUTCMonth()]}`;
}

/** Mon–Sun of the week that just ended, given "today" = the Monday the cron runs on. */
function weekRanges(todayISO: string) {
  const today = parseISODate(todayISO);
  const end = addDays(today, -1); // yesterday (Sunday)
  const start = addDays(end, -6); // Monday
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -6);
  return { start, end, prevStart, prevEnd };
}

/** The calendar month that just ended, given "today" = the 1st the cron runs on. */
function monthRanges(todayISO: string) {
  const today = parseISODate(todayISO);
  const end = addDays(today, -1); // last day of previous month
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  const prevEnd = addDays(start, -1);
  const prevStart = new Date(Date.UTC(prevEnd.getUTCFullYear(), prevEnd.getUTCMonth(), 1));
  return { start, end, prevStart, prevEnd };
}

function summarize(transactions: { type: string; amount: number; category: string }[]) {
  let income = 0;
  let expense = 0;
  const catSums: Record<string, number> = {};

  for (const t of transactions) {
    if (t.type === "income") {
      income += Number(t.amount);
    } else {
      expense += Number(t.amount);
      catSums[t.category] = (catSums[t.category] || 0) + Number(t.amount);
    }
  }

  const top = Object.entries(catSums).sort((a, b) => b[1] - a[1])[0];
  return {
    income,
    expense,
    topCategory: top ? catInfo(top[0]).label : null,
    topCategoryAmount: top ? top[1] : 0,
  };
}

export async function sendPeriodSummaries(kind: "week" | "month") {
  const supabase = createAdminClient();

  const { data: links } = await supabase
    .from("line_links")
    .select("user_id, line_user_id")
    .not("line_user_id", "is", null);

  if (!links || links.length === 0) return { sent: 0, total: 0 };

  const { data: premiumProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("plan", "premium")
    .in("id", links.map((l) => l.user_id));

  const premiumIds = new Set((premiumProfiles ?? []).map((p) => p.id));
  const premiumLinks = links.filter((l) => premiumIds.has(l.user_id));

  if (premiumLinks.length === 0) return { sent: 0, total: 0 };

  const { start, end, prevStart, prevEnd } = kind === "week"
    ? weekRanges(bangkokTodayISO())
    : monthRanges(bangkokTodayISO());

  let sent = 0;

  for (const link of premiumLinks) {
    const [{ data: currentTx }, { data: prevTx }] = await Promise.all([
      supabase.from("transactions").select("type, amount, category")
        .eq("user_id", link.user_id).gte("date", toISODate(start)).lte("date", toISODate(end)),
      supabase.from("transactions").select("type, amount, category")
        .eq("user_id", link.user_id).gte("date", toISODate(prevStart)).lte("date", toISODate(prevEnd)),
    ]);

    const cur = summarize(currentTx ?? []);
    const prev = summarize(prevTx ?? []);

    // nothing happened this period — skip so we don't spam an empty summary
    if (cur.income === 0 && cur.expense === 0) continue;

    const expenseChangePct = prev.expense > 0
      ? Math.round(((cur.expense - prev.expense) / prev.expense) * 100)
      : null;

    const label = kind === "week" ? "รายสัปดาห์" : "ประจำเดือน";
    const rangeLabel = `${fmtShort(start)} - ${fmtShort(end)}`;

    const lines = [
      `📊 สรุป${label} (${rangeLabel})`,
      `รายรับ: ${baht(cur.income)}`,
      `รายจ่าย: ${baht(cur.expense)}` +
        (expenseChangePct !== null
          ? ` (${expenseChangePct >= 0 ? "มากกว่า" : "น้อยกว่า"}ช่วงก่อนหน้า ${Math.abs(expenseChangePct)}%)`
          : ""),
    ];
    if (cur.topCategory) {
      lines.push(`หมวดที่ใช้เยอะสุด: ${cur.topCategory} (${baht(cur.topCategoryAmount)})`);
    }

    await linePush(link.line_user_id!, lines.join("\n"));
    sent++;
  }

  return { sent, total: premiumLinks.length };
}

/** All-time balance (income minus expense) for a single user — used by the
 *  LINE rich menu's "ยอดคงเหลือ" button for an on-demand answer. */
export async function currentBalance(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("transactions").select("type, amount").eq("user_id", userId);
  return (data ?? []).reduce(
    (s, t) => s + (t.type === "income" ? Number(t.amount) : -Number(t.amount)),
    0
  );
}

/** This calendar month so far, vs. all of last month — used by the LINE rich
 *  menu's "สรุปเดือนนี้" button for an on-demand answer (mirrors the
 *  simplification the in-app dashboard insight already uses). */
export async function currentMonthSummary(userId: string) {
  const supabase = createAdminClient();
  const todayISOStr = bangkokTodayISO();
  const today = parseISODate(todayISOStr);
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const prevEnd = addDays(start, -1);
  const prevStart = new Date(Date.UTC(prevEnd.getUTCFullYear(), prevEnd.getUTCMonth(), 1));

  const [{ data: curTx }, { data: prevTx }] = await Promise.all([
    supabase.from("transactions").select("type, amount, category")
      .eq("user_id", userId).gte("date", toISODate(start)).lte("date", todayISOStr),
    supabase.from("transactions").select("type, amount, category")
      .eq("user_id", userId).gte("date", toISODate(prevStart)).lte("date", toISODate(prevEnd)),
  ]);

  const cur = summarize(curTx ?? []);
  const prev = summarize(prevTx ?? []);
  const rangeLabel = `${fmtShort(start)} - ${fmtShort(today)}`;
  return { cur, prev, rangeLabel };
}
