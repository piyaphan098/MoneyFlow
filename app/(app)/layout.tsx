import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withUpcoming } from "@/lib/helpers";
import { AppShell } from "@/components/AppShell";
import type { Debt } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: debts } = await supabase
    .from("debts")
    .select("*")
    .order("due_day", { ascending: true });

  const upcomingDebts = withUpcoming((debts ?? []) as Debt[]);

  return <AppShell upcomingDebts={upcomingDebts}>{children}</AppShell>;
}
