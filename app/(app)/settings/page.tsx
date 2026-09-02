import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/SettingsView";
import { LineConnect } from "@/components/LineConnect";
import type { Debt, LineLink, Reminder } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = createClient();
  const [{ data: debts }, { data: reminders }, { data: lineLink }, { data: userData }] = await Promise.all([
    supabase.from("debts").select("*").order("due_day", { ascending: true }),
    supabase.from("reminders").select("*"),
    supabase.from("line_links").select("*").maybeSingle(),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="space-y-4">
      <LineConnect initial={(lineLink ?? null) as LineLink | null} />
      <SettingsView debts={(debts ?? []) as Debt[]} reminders={(reminders ?? []) as Reminder[]} userEmail={userData.user?.email ?? null} />
    </div>
  );
}
