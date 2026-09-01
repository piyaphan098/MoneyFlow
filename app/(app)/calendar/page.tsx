import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/CalendarView";
import { toDueItems } from "@/lib/helpers";
import type { Bill, Debt } from "@/lib/types";

export default async function CalendarPage() {
  const supabase = createClient();
  const [{ data: debts }, { data: bills }] = await Promise.all([
    supabase.from("debts").select("*"),
    supabase.from("bills").select("*"),
  ]);
  const items = toDueItems((debts ?? []) as Debt[], (bills ?? []) as Bill[]);
  return <CalendarView items={items} />;
}
