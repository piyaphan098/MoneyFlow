"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.replace("/");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) setError(error.message);
      else setNotice("สมัครสำเร็จ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ (ถ้าเปิด Email confirmation ไว้)");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mf-bg px-4">
      <div className="w-full max-w-sm bg-mf-card rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="MoneyFlow" className="w-9 h-9 rounded-xl object-cover" />
          <div>
            <p className="font-bold leading-tight text-mf-text">MoneyFlow</p>
            <p className="text-[10px] text-mf-sub">Know your money. Know your next payment.</p>
          </div>
        </div>

        <div className="flex rounded-xl p-1 mb-5 bg-mf-bg">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-lg text-sm font-medium"
              style={mode === m ? { background: "#fff", color: "#1C1A2E" } : { color: "#77748F" }}
            >
              {m === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium text-mf-sub">ชื่อ</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl px-3 py-2.5 border border-mf-line outline-none"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-mf-sub">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl px-3 py-2.5 border border-mf-line outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-mf-sub">รหัสผ่าน</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl px-3 py-2.5 border border-mf-line outline-none"
            />
          </div>

          {error && <p className="text-xs text-mf-expense">{error}</p>}
          {notice && <p className="text-xs text-mf-income">{notice}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-white bg-mf-primary disabled:opacity-60"
          >
            {loading ? "กำลังดำเนินการ..." : mode === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="text-center text-[11px] text-mf-sub mt-5">
          การใช้งานถือว่ายอมรับ{" "}
          <a href="/terms" target="_blank" className="underline">ข้อกำหนดการใช้งาน</a>{" "}
          และ{" "}
          <a href="/privacy" target="_blank" className="underline">นโยบายความเป็นส่วนตัว</a>
        </p>
      </div>
    </div>
  );
}
