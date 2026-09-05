"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2 } from "lucide-react";
import { BillModal } from "@/components/BillModal";
import { saveBill, deleteBill, logBillPayment } from "@/lib/actions";
import { baht, catInfo } from "@/lib/helpers";
import type { Bill } from "@/lib/types";

export function BillsView({ bills }: { bills: Bill[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Bill | null | "new">(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const total = bills.reduce((s, b) => s + b.monthly_payment, 0);
  const sorted = [...bills].sort((a, b) => a.due_day - b.due_day);

  async function handlePay(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setPayingId(id);
    try {
      await logBillPayment(id);
      router.refresh();
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-mf-card p-3.5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
          <p className="text-[11px] text-mf-sub">รวมต่อเดือน</p>
          <p className="text-base sm:text-lg font-bold mf-num mt-1">{baht(total)}</p>
        </div>
        <div className="rounded-2xl bg-mf-card p-3.5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
          <p className="text-[11px] text-mf-sub">จำนวนรายการ</p>
          <p className="text-base sm:text-lg font-bold mf-num mt-1">{bills.length} รายการ</p>
        </div>
      </div>

      <button onClick={() => setEditing("new")}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium border-2 border-dashed"
        style={{ borderColor: "#5B4FE0", color: "#5B4FE0" }}>
        <Plus size={16} /> เพิ่มค่าใช้จ่ายประจำ
      </button>

      <div className="space-y-3">
        {sorted.length === 0 && <p className="text-sm text-center py-8 text-mf-sub">ยังไม่มีค่าใช้จ่ายประจำ เช่น ค่าน้ำ ค่าไฟ ค่าเน็ต</p>}
        {sorted.map((b) => {
          const cat = catInfo(b.category);
          return (
            <div key={b.id} onClick={() => setEditing(b)} className="w-full text-left cursor-pointer">
              <div className="rounded-2xl bg-mf-card p-4" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{b.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{b.name}</p>
                      <p className="text-xs text-mf-sub">จ่ายทุกวันที่ {b.due_day} · {cat.label}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold mf-num">{baht(b.monthly_payment)}<span className="text-xs font-normal text-mf-sub">/เดือน</span></p>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={(e) => handlePay(b.id, e)}
                    disabled={payingId === b.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-60"
                    style={{ color: "#1F9D55", background: "#E7F7ED" }}
                  >
                    <CheckCircle2 size={14} />
                    {payingId === b.id ? "กำลังบันทึก..." : "จ่ายแล้ว"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <BillModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            await saveBill(data);
            setEditing(null);
            router.refresh();
          }}
          onDelete={async (id) => {
            await deleteBill(id);
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
