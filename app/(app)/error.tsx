"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production Next.js strips the real message from what's shown to the
    // user, but it's still logged server-side (Vercel → Observability → Logs)
    // and available here via error.digest for cross-referencing.
    console.error("(app) route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="p-3 rounded-full mb-4" style={{ background: "#FCEAE9" }}>
        <AlertTriangle size={22} style={{ color: "#E0483E" }} />
      </div>
      <h2 className="font-semibold text-lg mb-1">เกิดข้อผิดพลาดบางอย่าง</h2>
      <p className="text-sm text-mf-sub max-w-xs mb-1">
        หน้านี้โหลดไม่สำเร็จ ลองใหม่อีกครั้ง — ถ้ายังไม่หาย ข้อมูลของคุณยังปลอดภัยอยู่ครบ
      </p>
      {error.digest && (
        <p className="text-xs text-mf-sub mb-5 mf-num">รหัสอ้างอิง: {error.digest}</p>
      )}
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
        style={{ background: "#5B4FE0" }}
      >
        <RotateCcw size={15} /> ลองใหม่
      </button>
    </div>
  );
}
