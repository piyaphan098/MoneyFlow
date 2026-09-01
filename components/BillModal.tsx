"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CATEGORIES } from "@/lib/helpers";
import type { Bill, CategoryId } from "@/lib/types";

const ICON_CHOICES = ["💡", "💧", "📶", "📱", "🏠", "🗑️", "📺", "📦"];

export function BillModal({
  onClose, onSave, onDelete, initial = null,
}: {
  onClose: () => void;
  onSave: (data: {
    id?: string; name: string; icon: string; category: CategoryId;
    monthly_payment: number; due_day: number; note?: string;
  }) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  initial?: Bill | null;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "💡");
  const [category, setCategory] = useState<CategoryId>(initial?.category ?? "utility");
  const [amount, setAmount] = useState(initial ? String(initial.monthly_payment) : "");
  const [dueDay, setDueDay] = useState(initial ? String(initial.due_day) : "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);

  const numOnly = (v: string) => v.replace(/[^0-9.]/g, "");
  const canSave =
    name.trim().length > 0 && Number(amount) >= 0 &&
    Number(dueDay) >= 1 && Number(dueDay) <= 31 && !saving;

  async function submit() {
    setSaving(true);
    try {
      await onSave({
        id: initial?.id,
        name: name.trim(),
        icon,
        category,
        monthly_payment: Number(amount),
        due_day: Number(dueDay),
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
          <h3 className="text-lg font-semibold">{isEdit ? "แก้ไขค่าใช้จ่ายประจำ" : "เพิ่มค่าใช้จ่ายประจำ"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-mf-sub">ไอคอน</label>
            <div className="mt-1 flex gap-2 flex-wrap">
              {ICON_CHOICES.map((ic) => (
                <button key={ic} onClick={() => setIcon(ic)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border"
                  style={{ borderColor: icon === ic ? "#5B4FE0" : "#EAE8F4", background: icon === ic ? "#EFECFC" : "transparent" }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-mf-sub">ชื่อรายการ</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ค่าไฟ, ค่าน้ำ, ค่าเน็ต"
              className="mt-1 w-full rounded-xl px-3 py-2.5 outline-none border border-mf-line" />
          </div>

          <div>
            <label className="text-xs font-medium text-mf-sub">หมวดหมู่</label>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <button key={c.id} onClick={() => setCategory(c.id)}
                    className="rounded-xl py-2 border text-[11px]"
                    style={{ borderColor: active ? c.color : "#EAE8F4", background: active ? c.color + "1A" : "transparent", color: active ? c.color : "#77748F" }}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-mf-sub">จำนวนเงินโดยประมาณ/เดือน</label>
              <input value={amount} onChange={(e) => setAmount(numOnly(e.target.value))} inputMode="decimal" placeholder="0"
                className="mt-1 w-full rounded-xl px-3 py-2.5 outline-none border border-mf-line mf-num" />
            </div>
            <div className="w-28">
              <label className="text-xs font-medium text-mf-sub">วันที่จ่าย</label>
              <input value={dueDay} onChange={(e) => setDueDay(numOnly(e.target.value))} inputMode="numeric" placeholder="1-31"
                className="mt-1 w-full rounded-xl px-3 py-2.5 outline-none border border-mf-line mf-num" />
            </div>
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
          {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
        </button>

        {isEdit && onDelete && (
          <button onClick={() => onDelete(initial!.id)} className="mt-2 w-full py-2.5 rounded-xl font-medium text-sm"
            style={{ color: "#E0483E", background: "#FCEAE9" }}>
            ลบรายการนี้
          </button>
        )}
      </div>
    </div>
  );
}
