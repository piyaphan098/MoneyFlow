"use client";

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, CalendarClock, Lightbulb, Lock } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { baht, urgency } from "@/lib/helpers";
import { OnboardingCard } from "@/components/OnboardingCard";

type MonthPoint = { key: string; label: string; income: number; expense: number };
type ReminderDebt = { id: string; name: string; icon: string; monthly_payment: number; days: number };

function FlowSpark({ values }: { values: number[] }) {
  const w = 200, h = 48;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - ((v - min) / range) * h]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#flowGrad)" />
      <path d={path} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.length > 0 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill="#ffffff" />}
    </svg>
  );
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl bg-mf-card ${className}`} style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)", ...style }}>
      {children}
    </div>
  );
}

function Pill({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: bg, color }}>{children}</span>;
}

export function DashboardView({
  balance, income, expense, upcoming7Total, monthly, reminders7, insights, isNewUser, maxChartMonths,
}: {
  balance: number;
  income: number;
  expense: number;
  upcoming7Total: number;
  monthly: MonthPoint[]; // last 12 months, oldest first
  reminders7: ReminderDebt[];
  insights: string[];
  isNewUser: boolean;
  maxChartMonths: number;
}) {
  const [range, setRange] = useState<"1" | "3" | "6" | "12">("3");
  const n = range === "1" ? 1 : range === "3" ? 3 : range === "6" ? 6 : 12;
  const chartData = monthly.slice(Math.max(0, monthly.length - n));
  const sparkValues = monthly.slice(-4).map((m) => m.income - m.expense);

  return (
    <div className="space-y-5">
      {isNewUser && <OnboardingCard />}
      <Card className="p-5 sm:p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #5B4FE0, #2E2860)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80">เงินคงเหลือ</p>
            <p className="text-4xl font-bold mf-num mt-1">{baht(balance)}</p>
          </div>
          <div className="p-2.5 rounded-full bg-white/15"><Wallet size={20} /></div>
        </div>
        <div className="mt-4"><FlowSpark values={sparkValues.length ? sparkValues : [0, 0]} /></div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-mf-income"><TrendingUp size={16} /><p className="text-xs font-medium text-mf-sub">รายรับเดือนนี้</p></div>
          <p className="text-xl font-bold mf-num mt-1.5">{baht(income)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-mf-expense"><TrendingDown size={16} /><p className="text-xs font-medium text-mf-sub">รายจ่ายเดือนนี้</p></div>
          <p className="text-xl font-bold mf-num mt-1.5">{baht(expense)}</p>
        </Card>
        <Card className="p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-mf-primary"><Wallet size={16} /><p className="text-xs font-medium text-mf-sub">เงินเหลือสุทธิ</p></div>
          <p className="text-xl font-bold mf-num mt-1.5">{baht(income - expense)}</p>
        </Card>
        <Card className="p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-mf-warn"><CalendarClock size={16} /><p className="text-xs font-medium text-mf-sub">ต้องจ่ายใน 7 วัน</p></div>
          <p className="text-xl font-bold mf-num mt-1.5">{baht(upcoming7Total)}</p>
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">ภาพรวมกระแสเงินสด</h3>
          <div className="flex rounded-lg p-0.5 bg-mf-bg">
            {(["1", "3", "6", "12"] as const).map((r) => {
              const months = r === "1" ? 1 : r === "3" ? 3 : r === "6" ? 6 : 12;
              const locked = months > maxChartMonths;
              return (
                <button
                  key={r}
                  onClick={() => (locked ? undefined : setRange(r))}
                  disabled={locked}
                  title={locked ? `แผนปัจจุบันดูย้อนหลังได้สูงสุด ${maxChartMonths} เดือน · อัปเกรดเพื่อดูได้ไกลขึ้น` : undefined}
                  className="px-2.5 py-1 text-xs rounded-md font-medium flex items-center gap-1"
                  style={
                    locked
                      ? { color: "#B9B6CC", cursor: "not-allowed" }
                      : range === r
                      ? { background: "#5B4FE0", color: "#fff" }
                      : { color: "#77748F" }
                  }
                >
                  {locked && <Lock size={10} />}
                  {r === "1" ? "เดือนนี้" : r === "12" ? "1 ปี" : r + " เดือน"}
                </button>
              );
            })}
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1F9D55" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1F9D55" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E0483E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#E0483E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#EAE8F4" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#77748F" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#77748F" }} axisLine={false} tickLine={false} width={44} />
              <Tooltip formatter={(v: number) => baht(v)} contentStyle={{ borderRadius: 12, border: "1px solid #EAE8F4", fontSize: 12 }} />
              <Area type="monotone" dataKey="income" stroke="#1F9D55" fill="url(#incGrad)" strokeWidth={2} name="รายรับ" />
              <Area type="monotone" dataKey="expense" stroke="#E0483E" fill="url(#expGrad)" strokeWidth={2} name="รายจ่าย" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-mf-sub">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-mf-income" />รายรับ</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-mf-expense" />รายจ่าย</span>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">🔔 ใกล้ถึงกำหนด</h3>
          <Pill bg="#FBF3DC" color="#D9A404">รวม {baht(upcoming7Total)}</Pill>
        </div>
        <div className="space-y-2">
          {reminders7.length === 0 && <p className="text-sm text-mf-sub">ไม่มีรายการที่ใกล้ถึงกำหนด</p>}
          {reminders7.map((d) => {
            const u = urgency(d.days);
            return (
              <div key={d.id} className="flex items-center justify-between rounded-xl p-3 bg-mf-bg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{d.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-mf-sub">ครบกำหนดอีก {d.days} วัน</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold mf-num">{baht(d.monthly_payment)}</p>
                  <Pill bg={u.soft} color={u.color}>{u.label}</Pill>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb size={17} className="text-mf-warn" />สรุปการเงิน</h3>
        <ul className="space-y-2.5">
          {insights.map((line, i) => (
            <li key={i} className="text-sm flex gap-2 items-start">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-mf-primary" />
              <span dangerouslySetInnerHTML={{ __html: line }} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
