"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Copy, Check } from "lucide-react";
import { createLineLinkCode, unlinkLine } from "@/lib/actions";
import type { LineLink } from "@/lib/types";

export function LineConnect({ initial }: { initial: LineLink | null }) {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(
    initial?.link_code && initial.link_code_expires_at && new Date(initial.link_code_expires_at) > new Date()
      ? initial.link_code
      : null
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLinked = !!initial?.line_user_id;

  async function generateCode() {
    setLoading(true);
    try {
      const { code } = await createLineLinkCode();
      setCode(code);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink() {
    setLoading(true);
    try {
      await unlinkLine();
      setCode(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl bg-mf-card p-4 sm:p-5" style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}>
      <div className="flex items-center gap-2 mb-1">
        <MessageCircle size={18} className="text-mf-income" />
        <h3 className="font-semibold">เชื่อมต่อ LINE</h3>
      </div>
      <p className="text-xs text-mf-sub mb-4">
        พิมพ์รายการสั้นๆ ส่งเข้า LINE ได้เลย เช่น <span className="mf-num">&quot;กาแฟ 60&quot;</span> หรือ{" "}
        <span className="mf-num">&quot;+30000 เงินเดือน&quot;</span> ระบบจะบันทึกให้อัตโนมัติ
      </p>

      {isLinked ? (
        <div className="flex items-center justify-between rounded-xl p-3 bg-mf-incomeSoft">
          <span className="text-sm font-medium text-mf-income">เชื่อมต่อ LINE แล้ว ✅</span>
          <button onClick={handleUnlink} disabled={loading} className="text-xs font-medium text-mf-expense">
            ยกเลิกการเชื่อมต่อ
          </button>
        </div>
      ) : code ? (
        <div className="space-y-3">
          <div className="rounded-xl p-4 bg-mf-bg text-center">
            <p className="text-xs text-mf-sub mb-1">รหัสเชื่อมต่อของคุณ (หมดอายุใน 10 นาที)</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold mf-num tracking-widest">{code}</p>
              <button onClick={copyCode} className="p-1.5 rounded-lg hover:bg-white">
                {copied ? <Check size={16} className="text-mf-income" /> : <Copy size={16} className="text-mf-sub" />}
              </button>
            </div>
          </div>
          <ol className="text-xs text-mf-sub space-y-1 list-decimal list-inside">
            <li>เพิ่มเพื่อน LINE Official Account ของ MoneyFlow</li>
            <li>
              พิมพ์รหัส <span className="mf-num font-medium">{code}</span> ส่งไปในแชท
            </li>
            <li>รอข้อความยืนยัน &quot;เชื่อมต่อสำเร็จ&quot;</li>
          </ol>
          <button onClick={generateCode} disabled={loading} className="text-xs font-medium text-mf-primary">
            ขอรหัสใหม่
          </button>
        </div>
      ) : (
        <button
          onClick={generateCode}
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-medium text-sm text-white bg-mf-primary disabled:opacity-60"
        >
          {loading ? "กำลังสร้างรหัส..." : "สร้างรหัสเชื่อมต่อ"}
        </button>
      )}
    </div>
  );
}
