import Link from "next/link";
import { Receipt, CreditCard, Zap, MessageCircle, Sparkles } from "lucide-react";

const STEPS = [
  {
    href: "/transactions",
    icon: Receipt,
    title: "เพิ่มรายการแรก",
    desc: "ลองบันทึกรายรับหรือรายจ่ายวันนี้ดูสักรายการ",
  },
  {
    href: "/debts",
    icon: CreditCard,
    title: "มีหนี้ที่ต้องผ่อนไหม",
    desc: "ผ่อนบ้าน ผ่อนรถ บัตรเครดิต — ใส่ไว้จะได้เห็นวันครบกำหนด",
  },
  {
    href: "/bills",
    icon: Zap,
    title: "ค่าน้ำค่าไฟ ค่าเน็ต",
    desc: "ค่าใช้จ่ายประจำที่มีวันจ่ายแน่นอนทุกเดือน",
  },
  {
    href: "/settings",
    icon: MessageCircle,
    title: "เชื่อมต่อ LINE (ไม่บังคับ)",
    desc: "พิมพ์ \"กาแฟ 60\" ในแชท บันทึกให้อัตโนมัติ ไม่ต้องเปิดเว็บ",
  },
];

export function OnboardingCard() {
  return (
    <div
      className="rounded-2xl p-5 sm:p-6 text-white"
      style={{ background: "linear-gradient(135deg, #5B4FE0, #2E2860)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} />
        <h3 className="font-semibold">ยินดีต้อนรับสู่ MoneyFlow</h3>
      </div>
      <p className="text-sm opacity-80 mb-4">
        ยังไม่มีข้อมูลในระบบเลย — เริ่มจากสัก 1 ข้อด้านล่างนี้ แล้ว Dashboard จะเริ่มมีอะไรให้ดูทันที
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-start gap-3 rounded-xl p-3 bg-white/10 hover:bg-white/15 transition-colors"
            >
              <div className="p-2 rounded-full bg-white/15 shrink-0">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs opacity-75 mt-0.5">{s.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
