import crypto from "crypto";
import type { CategoryId, TxType } from "@/lib/types";

/* ------------------------------ signature check ------------------------------ */

/** Verifies the `x-line-signature` header against the raw request body. */
export function verifyLineSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const secret = process.env.LINE_CHANNEL_SECRET!;
  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  // constant-time compare
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* --------------------------------- messaging --------------------------------- */

const LINE_API = "https://api.line.me/v2/bot/message";

export async function lineReply(replyToken: string, text: string) {
  await fetch(`${LINE_API}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
  });
}

/** Proactively sends a message to a LINE user — not in response to anything
 *  they sent. Used for scheduled digests (weekly/monthly summaries). LINE's
 *  free tier includes 500 push messages/month per OA; beyond that it's billed
 *  per message, so keep an eye on volume as the user base grows. */
export async function linePush(to: string, text: string) {
  await fetch(`${LINE_API}/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
  });
}

/* ---------------------------- transaction text parsing ---------------------------- */

const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  food: ["กาแฟ", "ข้าว", "อาหาร", "กับข้าว", "ก๋วยเตี๋ยว", "ชานม", "ร้านอาหาร", "เครื่องดื่ม", "ขนม", "ชา", "นม"],
  transport: ["แท็กซี่", "แกร็บ", "grab", "รถไฟฟ้า", "บีทีเอส", "bts", "mrt", "น้ำมัน", "ค่ารถ", "วิน", "มอเตอร์ไซค์", "รถเมล์"],
  home: ["บ้าน", "เช่าบ้าน", "ค่าเช่า", "ซ่อมบ้าน", "เฟอร์นิเจอร์"],
  debt: ["ผ่อน", "หนี้", "บัตรเครดิต", "ดอกเบี้ย"],
  shopping: ["ช้อปปิ้ง", "เสื้อผ้า", "ซื้อของ", "shopee", "lazada", "รองเท้า"],
  utility: ["ค่าไฟ", "ค่าน้ำ", "ค่าเน็ต", "อินเทอร์เน็ต", "โทรศัพท์", "ค่ามือถือ", "ค่าโทร"],
  work: ["อุปกรณ์", "งาน", "ซอฟต์แวร์", "สมัครสมาชิก", "หนังสือ", "คอร์ส"],
  other: [],
};

function guessCategory(description: string): CategoryId {
  const lower = description.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [CategoryId, string[]][]) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) return cat;
  }
  return "other";
}

export type ParsedTx = {
  type: TxType;
  amount: number;
  description: string;
  category: CategoryId;
};

/**
 * Parses free-form text like:
 *   "กาแฟ 60"        -> expense, 60, "กาแฟ", food
 *   "60 กาแฟ"         -> expense, 60, "กาแฟ", food
 *   "รับ เงินเดือน 30000" -> income, 30000, "เงินเดือน", work
 *   "+2000 งานพิเศษ"  -> income, 2000, "งานพิเศษ", work
 * Returns null if no amount could be found.
 */
export function parseTransactionText(raw: string): ParsedTx | null {
  let text = raw.trim();
  if (!text) return null;

  let type: TxType = "expense";
  if (text.startsWith("+")) {
    type = "income";
    text = text.slice(1).trim();
  } else if (/^(รับ|รายรับ|income)(?=\s|$)/i.test(text)) {
    type = "income";
    text = text.replace(/^(รับ|รายรับ|income)(?=\s|$)/i, "").trim();
  }

  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;

  const amount = Number(match[1].replace(",", ""));
  if (!(amount > 0)) return null;

  const description = text.replace(match[1], "").trim().replace(/^[-–:\s]+|[-–:\s]+$/g, "") || (type === "income" ? "รายรับ" : "รายจ่าย");

  return {
    type,
    amount,
    description,
    category: type === "income" ? "work" : guessCategory(description),
  };
}

/** Today's date as YYYY-MM-DD in Asia/Bangkok, regardless of server timezone. */
export function bangkokTodayISO() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });
}
