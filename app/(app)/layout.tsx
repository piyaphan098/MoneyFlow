import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toDueItems, withUpcoming } from "@/lib/helpers";
import { AppShell } from "@/components/AppShell";
import type { Bill, Debt } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: debts }, { data: bills }] = await Promise.all([
    supabase.from("debts").select("*").order("due_day", { ascending: true }),
    supabase.from("bills").select("*").order("due_day", { ascending: true }),
  ]);

  const upcomingItems = withUpcoming(
    toDueItems((debts ?? []) as Debt[], (bills ?? []) as Bill[])
  );

  return <AppShell upcomingItems={upcomingItems}>{children}</AppShell>;
}
