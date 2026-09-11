import { createClient } from "@/lib/supabase/server";
import { DebtsView } from "@/components/DebtsView";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";
import type { Debt } from "@/lib/types";

export default async function DebtsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data }, { count: billCount }, { data: profile }] = await Promise.all([
    supabase.from("debts").select("*").order("due_day", { ascending: true }),
    supabase.from("bills").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("profiles").select("plan").eq("id", user!.id).single(),
  ]);

  const debts = (data ?? []) as Debt[];
  const plan = (profile?.plan as Plan) ?? "free";
  const maxItems = PLAN_LIMITS[plan].maxDebtsAndBills;
  const atLimit = Number.isFinite(maxItems) && debts.length + (billCount ?? 0) >= maxItems;

  return <DebtsView debts={debts} atLimit={atLimit} maxItems={maxItems} />;
}
