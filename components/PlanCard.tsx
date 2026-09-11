import { PLAN_FEATURES, PLAN_LABELS, type Plan } from "@/lib/plans";

const PLAN_COLORS: Record<Plan, { bg: string; text: string }> = {
  free: { bg: "#EAE8F4", text: "#77748F" },
  basic: { bg: "#E7F7ED", text: "#1F9D55" },
  premium: { bg: "#EFECFC", text: "#5B4FE0" },
};

export function PlanCard({ plan }: { plan: Plan }) {
  const c = PLAN_COLORS[plan];

  return (
    <div id="plan" className="rounded-2xl bg-mf-card p-4 sm:p-5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">แผนการใช้งาน</h3>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.text }}>
          แผน{PLAN_LABELS[plan]}
        </span>
      </div>
      <p className="text-xs text-mf-sub mb-4">
        ตอนนี้ยังเปิดใช้แผนผ่านผู้ดูแลระบบเป็นรายคนก่อน (ยังไม่เปิดชำระเงินอัตโนมัติ) — สนใจอัปเกรดทักผู้ดูแลระบบได้เลย
      </p>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs min-w-[420px]">
          <thead>
            <tr className="text-mf-sub">
              <th className="text-left font-medium py-2 px-1">ฟีเจอร์</th>
              <th className="font-medium py-2 px-1">ฟรี</th>
              <th className="font-medium py-2 px-1">เบสิก</th>
              <th className="font-medium py-2 px-1">พรีเมียม</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_FEATURES.map((f) => (
              <tr key={f.label} className="border-t border-mf-line">
                <td className="py-2 px-1 text-mf-text">{f.label}</td>
                <td className="py-2 px-1 text-center" style={plan === "free" ? { fontWeight: 600, color: "#5B4FE0" } : {}}>{f.free}</td>
                <td className="py-2 px-1 text-center" style={plan === "basic" ? { fontWeight: 600, color: "#5B4FE0" } : {}}>{f.basic}</td>
                <td className="py-2 px-1 text-center" style={plan === "premium" ? { fontWeight: 600, color: "#5B4FE0" } : {}}>{f.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
