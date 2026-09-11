import { createClient } from "@/lib/supabase/server";
import { BillsView } from "@/components/BillsView";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";
import type { Bill } from "@/lib/types";

export default async function BillsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data }, { count: debtCount }, { data: profile }] = await Promise.all([
    supabase.from("bills").select("*").order("due_day", { ascending: true }),
    supabase.from("debts").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("profiles").select("plan").eq("id", user!.id).single(),
  ]);

  const bills = (data ?? []) as Bill[];
  const plan = (profile?.plan as Plan) ?? "free";
  const maxItems = PLAN_LIMITS[plan].maxDebtsAndBills;
  const atLimit = Number.isFinite(maxItems) && bills.length + (debtCount ?? 0) >= maxItems;

  return <BillsView bills={bills} atLimit={atLimit} maxItems={maxItems} />;
}
