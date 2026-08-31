import { createClient } from "@/lib/supabase/server";
import { TransactionsView } from "@/components/TransactionsView";
import type { Transaction } from "@/lib/types";

export default async function TransactionsPage() {
  const supabase = createClient();
  const { data } = await supabase.from("transactions").select("*").order("date", { ascending: false }).limit(500);
  return <TransactionsView transactions={(data ?? []) as Transaction[]} />;
}
