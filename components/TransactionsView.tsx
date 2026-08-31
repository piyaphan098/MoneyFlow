"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Utensils, Car, Home, CreditCard, ShoppingBag, Zap, Laptop, Package } from "lucide-react";
import { QuickAddModal } from "@/components/QuickAddModal";
import { saveTransaction, deleteTransaction } from "@/lib/actions";
import { baht, catInfo, thMonthsShort } from "@/lib/helpers";
import type { CategoryId, Transaction } from "@/lib/types";

const ICONS: Record<CategoryId, any> = {
  food: Utensils, transport: Car, home: Home, debt: CreditCard,
  shopping: ShoppingBag, utility: Zap, work: Laptop, other: Package,
};

export function TransactionsView({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [editing, setEditing] = useState<Transaction | null | "new">(null);

  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
  const filtered = sorted.filter((t) => (filter === "all" ? true : t.type === filter));

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl p-1 w-full sm:w-72 bg-mf-bg">
        {(["all", "income", "expense"] as const).map((k) => (
          <button key={k} onClick={() => setFilter(k)} className="flex-1 py-1.5 rounded-lg text-sm font-medium"
            style={filter === k ? { background: "#fff", color: "#1C1A2E", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : { color: "#77748F" }}>
            {k === "all" ? "ทั้งหมด" : k === "income" ? "รายรับ" : "รายจ่าย"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-mf-card p-2 sm:p-3" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
        {filtered.length === 0 && <p className="text-sm text-center py-8 text-mf-sub">ยังไม่มีรายการ</p>}
        <div className="divide-y divide-mf-line">
          {filtered.map((t) => {
            const cat = catInfo(t.category);
            const Icon = ICONS[t.category as CategoryId] ?? Package;
            const d = new Date(t.date);
            return (
              <button key={t.id} onClick={() => setEditing(t)} className="w-full flex items-center justify-between py-3 px-2 rounded-xl hover:bg-gray-50 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full" style={{ background: cat.color + "1A", color: cat.color }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-mf-sub">{d.getDate()} {thMonthsShort[d.getMonth()]} · {cat.label}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold mf-num" style={{ color: t.type === "income" ? "#1F9D55" : "#E0483E" }}>
                  {t.type === "income" ? "+" : "-"}{baht(t.amount)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {editing && (
        <QuickAddModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            await saveTransaction(data);
            setEditing(null);
            router.refresh();
          }}
          onDelete={async (id) => {
            await deleteTransaction(id);
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
