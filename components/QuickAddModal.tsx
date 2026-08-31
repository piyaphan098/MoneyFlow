"use client";

import { useState } from "react";
import { X, Utensils, Car, Home, CreditCard, ShoppingBag, Zap, Laptop, Package } from "lucide-react";
import { CATEGORIES, todayISO } from "@/lib/helpers";
import type { CategoryId, Transaction, TxType } from "@/lib/types";

const ICONS: Record<CategoryId, any> = {
  food: Utensils, transport: Car, home: Home, debt: CreditCard,
  shopping: ShoppingBag, utility: Zap, work: Laptop, other: Package,
};

export function QuickAddModal({
  onClose, onSave, onDelete, defaultType = "expense", initial = null,
}: {
  onClose: () => void;
  onSave: (data: { id?: string; type: TxType; description: string; amount: number; category: CategoryId; date: string; note?: string }) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  defaultType?: TxType;
  initial?: Transaction | null;
}) {
  const isEdit = !!initial;
  const [type, setType] = useState<TxType>(initial?.type ?? defaultType);
  const [item, setItem] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState<CategoryId>(initial?.category ?? "food");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);

  const canSave = item.trim().length > 0 && Number(amount) > 0 && !saving;

  async function submit() {
    setSaving(true);
    try {
      await onSave({
        id: initial?.id,
        type,
        description: item.trim(),
        amount: Number(amount),
        category,
        date,
        note,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] sm:rounded-3xl rounded-t-3xl p-5 sm:p-6 bg-mf-card" style={{ maxHeight: "88vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{isEdit ? "แก้ไขรายการ" : "เพิ่มรายการ"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="flex rounded-xl p-1 mb-4 bg-mf-bg">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="flex-1 py-2 rounded-lg text-sm font-medium"
              style={type === t ? { background: t === "expense" ? "#E0483E" : "#1F9D55", color: "#fff" } : { color: "#77748F" }}
            >
              {t === "expense" ? "รายจ่าย" : "รายรับ"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-mf-sub">รายการ</label>
            <input autoFocus value={item} onChange={(e) => setItem(e.target.value)} placeholder="เช่น ข้าวเที่ยง"
              className="mt-1 w-full rounded-xl px-3 py-2.5 outline-none border border-mf-line" />
          </div>

          <div>
            <label className="text-xs font-medium text-mf-sub">จำนวนเงิน (THB)</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" inputMode="decimal"
              className="mt-1 w-full rounded-xl px-3 py-2.5 outline-none border border-mf-line mf-num text-lg" />
          </div>

          {type === "expense" && (
            <div>
              <label className="text-xs font-medium text-mf-sub">หมวดหมู่</label>
              <div className="mt-1 grid grid-cols-4 gap-2">
                {CATEGORIES.map((c) => {
                  const Icon = ICONS[c.id];
                  const active = category === c.id;
                  return (
                    <button key={c.id} onClick={() => setCategory(c.id)}
                      className="flex flex-col items-center gap-1 rounded-xl py-2 border text-[11px]"
                      style={{ borderColor: active ? c.color : "#EAE8F4", background: active ? c.color + "1A" : "transparent", color: active ? c.color : "#77748F" }}>
                      <Icon size={16} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-mf-sub">วันที่</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-xl px-3 py-2.5 outline-none border border-mf-line" />
          </div>

          <div>
            <label className="text-xs font-medium text-mf-sub">หมายเหตุ (ไม่บังคับ)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-xl px-3 py-2.5 outline-none border border-mf-line" />
          </div>
        </div>

        <button disabled={!canSave} onClick={submit}
          className="mt-5 w-full py-3 rounded-xl font-medium text-white"
          style={{ background: canSave ? "#5B4FE0" : "#C7C3E8", cursor: canSave ? "pointer" : "not-allowed" }}>
          {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "บันทึกรายการ"}
        </button>

        {isEdit && onDelete && (
          <button onClick={() => onDelete(initial!.id)} className="mt-2 w-full py-2.5 rounded-xl font-medium text-sm text-mf-expense bg-mf-expenseSoft"
            style={{ color: "#E0483E", background: "#FCEAE9" }}>
            ลบรายการนี้
          </button>
        )}
      </div>
    </div>
  );
}
