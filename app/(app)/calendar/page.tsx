import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/CalendarView";
import type { Debt } from "@/lib/types";

export default async function CalendarPage() {
  const supabase = createClient();
  const { data } = await supabase.from("debts").select("*");
  return <CalendarView debts={(data ?? []) as Debt[]} />;
}
