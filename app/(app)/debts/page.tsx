import { createClient } from "@/lib/supabase/server";
import { DebtsView } from "@/components/DebtsView";
import type { Debt } from "@/lib/types";

export default async function DebtsPage() {
  const supabase = createClient();
  const { data } = await supabase.from("debts").select("*").order("due_day", { ascending: true });
  return <DebtsView debts={(data ?? []) as Debt[]} />;
}
