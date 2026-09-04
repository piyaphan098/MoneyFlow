"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body style={{ background: "#F7F6FB", fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <h2 style={{ fontWeight: 600, fontSize: "1.125rem", marginBottom: "0.5rem", color: "#1C1A2E" }}>
            แอปเกิดข้อผิดพลาด
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#77748F", marginBottom: "1.25rem", maxWidth: 320 }}>
            กรุณาลองรีเฟรชหน้าเว็บอีกครั้ง ถ้ายังไม่หายกรุณาติดต่อผู้ดูแลระบบ
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#5B4FE0",
              color: "#fff",
              padding: "0.65rem 1.25rem",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            ลองใหม่
          </button>
        </div>
      </body>
    </html>
  );
}
