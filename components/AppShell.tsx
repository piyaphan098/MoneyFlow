"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Receipt, CreditCard, Calendar as CalendarIcon, Settings as SettingsIcon,
  Plus, Bell, LogOut,
} from "lucide-react";
import { QuickAddModal } from "@/components/QuickAddModal";
import { saveTransaction } from "@/lib/actions";
import { baht } from "@/lib/helpers";
import type { Debt } from "@/lib/types";

const NAV = [
  { href: "/", label: "ภาพรวม", icon: Home },
  { href: "/transactions", label: "รายรับรายจ่าย", icon: Receipt },
  { href: "/debts", label: "หนี้สิน", icon: CreditCard },
  { href: "/calendar", label: "ปฏิทิน", icon: CalendarIcon },
  { href: "/settings", label: "ตั้งค่า", icon: SettingsIcon },
];

export function AppShell({
  children, upcomingDebts,
}: {
  children: React.ReactNode;
  upcomingDebts: (Debt & { days: number })[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const reminders7 = upcomingDebts.filter((d) => d.days <= 7);
  const activeLabel = NAV.find((n) => n.href === pathname)?.label ?? "MoneyFlow";

  return (
    <div className="min-h-screen bg-mf-bg">
      <div className="flex">
        {/* desktop sidebar */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 min-h-screen p-5 border-r border-mf-line">
          <div className="flex items-center gap-2 mb-8 px-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold bg-mf-primary">M</div>
            <div>
              <p className="font-bold leading-tight">MoneyFlow</p>
              <p className="text-[10px] text-mf-sub">Know your next payment</p>
            </div>
          </div>
          <nav className="space-y-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={active ? { background: "#EFECFC", color: "#5B4FE0" } : { color: "#77748F" }}>
                  <Icon size={17} />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <button onClick={() => setModalOpen(true)}
            className="mt-auto flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white bg-mf-primary">
            <Plus size={16} /> เพิ่มรายการ
          </button>
          <form action="/auth/signout" method="post" className="mt-2">
            <button className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-mf-sub">
              <LogOut size={15} /> ออกจากระบบ
            </button>
          </form>
        </aside>

        <div className="flex-1 min-w-0">
          {/* topbar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 backdrop-blur border-b border-mf-line" style={{ background: "#F7F6FBE6" }}>
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-mf-primary">M</div>
              <p className="font-bold">MoneyFlow</p>
            </div>
            <h2 className="hidden md:block font-semibold text-lg">{activeLabel}</h2>
            <div className="flex items-center gap-2 relative">
              <button onClick={() => setNotifOpen((v) => !v)} className="p-2 rounded-full relative bg-mf-card">
                <Bell size={17} />
                {reminders7.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white bg-mf-expense">
                    {reminders7.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-72 rounded-2xl p-3 z-30 bg-mf-card" style={{ boxShadow: "0 8px 30px rgba(28,26,46,0.16)" }}>
                  <p className="text-sm font-semibold mb-2 px-1">การแจ้งเตือนการชำระเงิน</p>
                  {reminders7.length === 0 && <p className="text-xs px-1 text-mf-sub">ไม่มีรายการใกล้ถึงกำหนด</p>}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {reminders7.map((d) => (
                      <div key={d.id} className="flex items-start gap-2 rounded-xl p-2 bg-mf-bg">
                        <span className="text-lg">{d.icon}</span>
                        <div className="flex-1">
                          <p className="text-xs font-medium">{d.name}จะครบกำหนดในอีก {d.days} วัน</p>
                          <p className="text-xs mf-num text-mf-sub">จำนวน {baht(d.monthly_payment)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white bg-mf-primary">
                <Plus size={15} /> เพิ่มรายการ
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-5 pb-24 md:pb-8 max-w-3xl mx-auto">{children}</div>
        </div>
      </div>

      {/* mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around py-2 px-2 bg-mf-card border-t border-mf-line">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = pathname === n.href;
          return (
            <Link key={n.href} href={n.href} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px]"
              style={{ color: active ? "#5B4FE0" : "#77748F" }}>
              <Icon size={19} />
              {n.label}
            </Link>
          );
        })}
      </div>

      <button onClick={() => setModalOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-20 w-14 h-14 rounded-full flex items-center justify-center text-white bg-mf-primary"
        style={{ boxShadow: "0 10px 24px -6px rgba(91,79,224,0.55)" }}>
        <Plus size={24} />
      </button>

      {modalOpen && (
        <QuickAddModal
          onClose={() => setModalOpen(false)}
          onSave={async (data) => {
            await saveTransaction(data);
            setModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
