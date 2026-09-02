"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { setReminderLevel } from "@/lib/actions";
import type { Debt, Reminder } from "@/lib/types";

const LEVELS: { days: 7 | 3 | 1 | 0; label: string }[] = [
  { days: 7, label: "7 วันก่อนครบกำหนด" },
  { days: 3, label: "3 วันก่อนครบกำหนด" },
  { days: 1, label: "1 วันก่อนครบกำหนด" },
  { days: 0, label: "วันครบกำหนด" },
];

export function SettingsView({ debts, reminders, userEmail }: { debts: Debt[]; reminders: Reminder[]; userEmail: string | null }) {
  const router = useRouter();

  const byDebt = new Map<string, Map<number, Reminder>>();
  reminders.forEach((r) => {
    if (!byDebt.has(r.debt_id)) byDebt.set(r.debt_id, new Map());
    byDebt.get(r.debt_id)!.set(r.reminder_days, r);
  });

  async function toggle(debtId: string, days: 7 | 3 | 1 | 0, enabled: boolean) {
    await setReminderLevel({ debt_id: debtId, reminder_days: days, enabled });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-mf-card p-4 sm:p-5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
        <h3 className="font-semibold mb-1">การแจ้งเตือน</h3>
        <p className="text-xs mb-4 text-mf-sub">เลือกช่วงเวลาที่ต้องการให้ MoneyFlow แจ้งเตือนก่อนถึงกำหนดชำระ ต่อรายการหนี้แต่ละรายการ</p>

        {debts.length === 0 && <p className="text-sm text-mf-sub">ยังไม่มีรายการหนี้ให้ตั้งการแจ้งเตือน — ไปเพิ่มที่หน้าหนี้สินก่อน</p>}

        <div className="space-y-5">
          {debts.map((d) => (
            <div key={d.id}>
              <p className="text-sm font-medium mb-2 flex items-center gap-2"><span>{d.icon}</span>{d.name}</p>
              <div className="space-y-2">
                {LEVELS.map((l) => {
                  const r = byDebt.get(d.id)?.get(l.days);
                  const enabled = r?.enabled ?? false;
                  return (
                    <button key={l.days} onClick={() => toggle(d.id, l.days, !enabled)}
                      className="w-full flex items-center justify-between rounded-xl p-3 bg-mf-bg">
                      <span className="text-sm">{l.label}</span>
                      <span className="w-9 h-5 rounded-full relative transition-colors" style={{ background: enabled ? "#5B4FE0" : "#D8D6E8" }}>
                        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: enabled ? 18 : 2 }} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-mf-line">
          <p className="text-xs text-mf-sub">ต่อยอดได้ในอนาคต: Browser Notification, Email, LINE Notify / LINE Messaging API</p>
        </div>
      </div>

      <div className="rounded-2xl bg-mf-card p-4 sm:p-5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
        <h3 className="font-semibold mb-1">บัญชีผู้ใช้</h3>
        {userEmail && <p className="text-xs text-mf-sub mb-4">เข้าสู่ระบบด้วย {userEmail}</p>}
        <form action="/auth/signout" method="post">
          <button className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
            style={{ color: "#E0483E", background: "#FCEAE9" }}>
            <LogOut size={15} /> ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
