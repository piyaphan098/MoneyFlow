"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { baht, cellHighlight, colorAt, thMonths, weekdaysTH } from "@/lib/helpers";
import type { Debt } from "@/lib/types";

export function CalendarView({ debts }: { debts: Debt[] }) {
  const today = new Date();
  const [offset, setOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // stable color per debt, based on its position in the (server-sorted) list
  const debtColor = new Map(debts.map((d, i) => [d.id, colorAt(i)]));

  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const y = base.getFullYear();
  const m = base.getMonth();
  const firstDay = new Date(y, m, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const dueMap: Record<number, Debt[]> = {};
  debts.forEach((d) => {
    (dueMap[d.due_day] ??= []).push(d);
  });

  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isCurrentMonth = offset === 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-mf-card p-4 sm:p-5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { setOffset((v) => v - 1); setSelectedDay(null); }} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={18} /></button>
          <h3 className="font-semibold">{thMonths[m]} {y + 543}</h3>
          <button onClick={() => { setOffset((v) => v + 1); setSelectedDay(null); }} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1 text-mf-sub">
          {weekdaysTH.map((w) => <div key={w} className="py-1">{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const items = dueMap[d] || [];
            const colors = items.map((it) => debtColor.get(it.id)!);
            const isToday = isCurrentMonth && d === today.getDate();
            const isSelected = selectedDay === d;
            return (
              <button key={i} onClick={() => setSelectedDay(items.length ? d : null)}
                className="aspect-square rounded-xl flex flex-col items-center justify-center relative text-sm transition-colors"
                style={{
                  background: isSelected ? "#EFECFC" : cellHighlight(colors),
                  border: isToday ? "1.5px solid #5B4FE0" : isSelected ? "1px solid #5B4FE0" : "1px solid transparent",
                  color: isToday ? "#5B4FE0" : "#1C1A2E",
                  fontWeight: isToday ? 700 : 400,
                }}>
                {d}
                {items.length > 0 && (
                  <span className="absolute bottom-1.5 flex gap-0.5">
                    {colors.slice(0, 4).map((c, idx) => (
                      <span key={idx} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {debts.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-4 pt-3 border-t border-mf-line">
            {debts.map((d) => (
              <span key={d.id} className="flex items-center gap-1.5 text-xs text-mf-sub">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: debtColor.get(d.id) }} />
                {d.icon} {d.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {selectedDay && (
        <div className="rounded-2xl bg-mf-card p-4 sm:p-5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
          <h4 className="font-semibold mb-3">รายการที่ต้องจ่ายวันที่ {selectedDay}</h4>
          <div className="space-y-2">
            {dueMap[selectedDay].map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: debtColor.get(d.id) + "14" }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: debtColor.get(d.id) }} />
                  <span className="text-lg">{d.icon}</span>
                  <p className="text-sm font-medium">{d.name}</p>
                </div>
                <p className="text-sm font-semibold mf-num">{baht(d.monthly_payment)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
