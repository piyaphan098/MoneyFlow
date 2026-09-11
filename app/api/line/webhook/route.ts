import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyLineSignature, lineReply, parseTransactionText, bangkokTodayISO } from "@/lib/line";
import { currentBalance, currentMonthSummary } from "@/lib/summary";
import { baht } from "@/lib/helpers";

type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { type: string; text?: string };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as { events: LineEvent[] };
  const supabase = createAdminClient();

  await Promise.all(
    (body.events ?? []).map(async (event) => {
      if (event.type !== "message" || event.message?.type !== "text") return;

      const lineUserId = event.source?.userId;
      const replyToken = event.replyToken;
      const text = event.message.text?.trim() ?? "";
      if (!lineUserId || !replyToken) return;

      // ---- 1) is this a link code? ("123456" or "LINK 123456") ----
      const codeMatch = text.match(/\b(\d{6})\b/);
      const looksLikeLinkAttempt = /link/i.test(text) || text.replace(/\s/g, "") === codeMatch?.[1];

      if (codeMatch && looksLikeLinkAttempt) {
        const code = codeMatch[1];
        const { data: pending } = await supabase
          .from("line_links")
          .select("*")
          .eq("link_code", code)
          .gt("link_code_expires_at", new Date().toISOString())
          .maybeSingle();

        if (!pending) {
          await lineReply(replyToken, "รหัสไม่ถูกต้องหรือหมดอายุแล้ว ไปที่หน้า “ตั้งค่า” ในเว็บ MoneyFlow เพื่อขอรหัสใหม่นะครับ");
          return;
        }

        await supabase
          .from("line_links")
          .update({ line_user_id: lineUserId, link_code: null, link_code_expires_at: null })
          .eq("id", pending.id);

        await lineReply(replyToken, "เชื่อมต่อสำเร็จ ✅\nตอนนี้พิมพ์รายการได้เลย เช่น\n\"กาแฟ 60\"\n\"+30000 เงินเดือน\"");
        return;
      }

      // ---- 2) otherwise, is this LINE user already linked to an account? ----
      const { data: link } = await supabase
        .from("line_links")
        .select("user_id")
        .eq("line_user_id", lineUserId)
        .maybeSingle();

      if (!link) {
        await lineReply(
          replyToken,
          "ยังไม่ได้เชื่อมต่อบัญชี MoneyFlow ครับ ไปที่หน้า “ตั้งค่า” ในเว็บ แล้วกด “เชื่อมต่อ LINE” เพื่อรับรหัส 6 หลัก จากนั้นพิมพ์รหัสนั้นส่งมาที่แชทนี้"
        );
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("plan").eq("id", link.user_id).single();
      if (profile?.plan === "free") {
        await lineReply(replyToken, "แผนฟรีไม่รองรับการเชื่อมต่อ LINE แล้วครับ อัปเกรดแผนในหน้า “ตั้งค่า” เพื่อใช้งานต่อ");
        return;
      }

      // ---- 3) rich-menu keyword commands ----
      if (text === "ยอดคงเหลือ") {
        const balance = await currentBalance(link.user_id);
        await lineReply(replyToken, `💰 ยอดคงเหลือ: ${baht(balance)}`);
        return;
      }

      if (text === "สรุปเดือนนี้") {
        const { cur, prev, rangeLabel } = await currentMonthSummary(link.user_id);
        const changePct = prev.expense > 0 ? Math.round(((cur.expense - prev.expense) / prev.expense) * 100) : null;
        const lines = [
          `📊 สรุปเดือนนี้ (${rangeLabel})`,
          `รายรับ: ${baht(cur.income)}`,
          `รายจ่าย: ${baht(cur.expense)}` +
            (changePct !== null ? ` (${changePct >= 0 ? "มากกว่า" : "น้อยกว่า"}เดือนก่อน ${Math.abs(changePct)}%)` : ""),
        ];
        if (cur.topCategory) lines.push(`หมวดที่ใช้เยอะสุด: ${cur.topCategory} (${baht(cur.topCategoryAmount)})`);
        await lineReply(replyToken, lines.join("\n"));
        return;
      }

      if (text === "วิธีใช้") {
        await lineReply(
          replyToken,
          "วิธีใช้ MoneyFlow ผ่าน LINE:\n\n" +
            "พิมพ์รายจ่าย เช่น\n\"กาแฟ 60\"\n\n" +
            "พิมพ์รายรับ ให้ขึ้นต้นด้วย + หรือ \"รับ\" เช่น\n\"+30000 เงินเดือน\"\n\n" +
            "แตะเมนูด้านล่างเพื่อดูยอดคงเหลือหรือสรุปเดือนนี้ได้ทันที"
        );
        return;
      }

      // ---- 4) parse as a transaction ----
      const parsed = parseTransactionText(text);
      if (!parsed) {
        await lineReply(replyToken, "พิมพ์ไม่เข้าใจครับ ลองแบบนี้ดู:\n\"กาแฟ 60\" (รายจ่าย)\n\"+30000 เงินเดือน\" (รายรับ)");
        return;
      }

      const { error } = await supabase.from("transactions").insert({
        user_id: link.user_id,
        type: parsed.type,
        description: parsed.description,
        amount: parsed.amount,
        category: parsed.category,
        date: bangkokTodayISO(),
        note: "เพิ่มผ่าน LINE",
      });

      if (error) {
        await lineReply(replyToken, "บันทึกไม่สำเร็จ ลองใหม่อีกครั้งนะครับ");
        return;
      }

      const sign = parsed.type === "income" ? "+" : "-";
      await lineReply(replyToken, `บันทึกแล้ว ✅\n${parsed.description} ${sign}฿${parsed.amount.toLocaleString("th-TH")}`);
    })
  );

  return NextResponse.json({ ok: true });
}
