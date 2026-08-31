"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DebtModal } from "@/components/DebtModal";
import { saveDebt, deleteDebt } from "@/lib/actions";
import { baht } from "@/lib/helpers";
import type { Debt } from "@/lib/types";

export function DebtsView({ debts }: { debts: Debt[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Debt | null | "new">(null);

  const totalRemaining = debts.reduce((s, d) => s + d.remaining_amount, 0);
  const totalMonthly = debts.reduce((s, d) => s + d.monthly_payment, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-mf-card p-3.5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
          <p className="text-[11px] text-mf-sub">หนี้ทั้งหมด</p>
          <p className="text-base sm:text-lg font-bold mf-num mt-1">{baht(totalRemaining)}</p>
        </div>
        <div className="rounded-2xl bg-mf-card p-3.5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
          <p className="text-[11px] text-mf-sub">จำนวนหนี้</p>
          <p className="text-base sm:text-lg font-bold mf-num mt-1">{debts.length} รายการ</p>
        </div>
        <div className="rounded-2xl bg-mf-card p-3.5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
          <p className="text-[11px] text-mf-sub">ผ่อนรวม/เดือน</p>
          <p className="text-base sm:text-lg font-bold mf-num mt-1">{baht(totalMonthly)}</p>
        </div>
      </div>

      <button onClick={() => setEditing("new")}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium border-2 border-dashed"
        style={{ borderColor: "#5B4FE0", color: "#5B4FE0" }}>
        <Plus size={16} /> เพิ่มหนี้
      </button>

      <div className="space-y-3">
        {debts.length === 0 && <p className="text-sm text-center py-8 text-mf-sub">ยังไม่มีรายการหนี้</p>}
        {debts.map((d) => {
          const paid = d.original_amount - d.remaining_amount;
          const pct = Math.round((paid / d.original_amount) * 100);
          return (
            <button key={d.id} onClick={() => setEditing(d)} className="w-full text-left">
              <div className="rounded-2xl bg-mf-card p-4" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{d.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{d.name}</p>
                      <p className="text-xs text-mf-sub">ครบกำหนดวันที่ {d.due_day} · ดอกเบี้ย {d.interest_rate}%/ปี</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold mf-num">{baht(d.monthly_payment)}<span className="text-xs font-normal text-mf-sub">/เดือน</span></p>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-mf-line">
                  <div className="h-full rounded-full bg-mf-primary" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-mf-sub">
                  <span className="mf-num">{baht(paid)} / {baht(d.original_amount)} ผ่อนแล้ว</span>
                  <span className="mf-num">{pct}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {editing && (
        <DebtModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            await saveDebt(data);
            setEditing(null);
            router.refresh();
          }}
          onDelete={async (id) => {
            await deleteDebt(id);
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
