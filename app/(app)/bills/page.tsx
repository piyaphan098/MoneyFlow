import { createClient } from "@/lib/supabase/server";
import { BillsView } from "@/components/BillsView";
import type { Bill } from "@/lib/types";

export default async function BillsPage() {
  const supabase = createClient();
  const { data } = await supabase.from("bills").select("*").order("due_day", { ascending: true });
  return <BillsView bills={(data ?? []) as Bill[]} />;
}
