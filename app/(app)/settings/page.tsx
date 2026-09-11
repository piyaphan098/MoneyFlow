import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/SettingsView";
import { LineConnect } from "@/components/LineConnect";
import { PlanCard } from "@/components/PlanCard";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";
import type { Bill, Debt, LineLink, Reminder } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = createClient();
  const [{ data: debts }, { data: bills }, { data: reminders }, { data: lineLink }, { data: userData }] = await Promise.all([
    supabase.from("debts").select("*").order("due_day", { ascending: true }),
    supabase.from("bills").select("*").order("due_day", { ascending: true }),
    supabase.from("reminders").select("*"),
    supabase.from("line_links").select("*").maybeSingle(),
    supabase.auth.getUser(),
  ]);

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", userData.user!.id).single();
  const plan = (profile?.plan as Plan) ?? "free";

  return (
    <div className="space-y-4">
      <PlanCard plan={plan} />
      <LineConnect initial={(lineLink ?? null) as LineLink | null} lineEnabled={PLAN_LIMITS[plan].lineEnabled} />
      <SettingsView
        debts={(debts ?? []) as Debt[]}
        bills={(bills ?? []) as Bill[]}
        reminders={(reminders ?? []) as Reminder[]}
        userEmail={userData.user?.email ?? null}
      />
    </div>
  );
}
