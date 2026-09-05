"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/helpers";
import type { CategoryId, TxType } from "@/lib/types";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ");
  return { supabase, user };
}

/* ------------------------------- transactions ------------------------------- */

export async function saveTransaction(input: {
  id?: string;
  type: TxType;
  description: string;
  amount: number;
  category: CategoryId;
  date: string;
  note?: string;
}) {
  const { supabase, user } = await requireUser();

  const row = {
    user_id: user.id,
    type: input.type,
    description: input.description,
    amount: input.amount,
    category: input.type === "income" ? "work" : input.category,
    date: input.date,
    note: input.note || null,
  };

  const { error } = input.id
    ? await supabase.from("transactions").update(row).eq("id", input.id).eq("user_id", user.id)
    : await supabase.from("transactions").insert(row);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteTransaction(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/* ----------------------------------- debts ----------------------------------- */

export async function saveDebt(input: {
  id?: string;
  name: string;
  icon: string;
  original_amount: number;
  remaining_amount: number;
  monthly_payment: number;
  interest_rate: number;
  due_day: number;
  note?: string;
}) {
  const { supabase, user } = await requireUser();

  const row = {
    user_id: user.id,
    name: input.name,
    icon: input.icon,
    type: "other",
    original_amount: input.original_amount,
    remaining_amount: input.remaining_amount,
    monthly_payment: input.monthly_payment,
    interest_rate: input.interest_rate,
    due_day: input.due_day,
    note: input.note || null,
  };

  const { error } = input.id
    ? await supabase.from("debts").update(row).eq("id", input.id).eq("user_id", user.id)
    : await supabase.from("debts").insert(row);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteDebt(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("debts").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/** Marks a debt's monthly payment as paid: logs it as an expense transaction
 *  AND reduces the debt's remaining balance — one tap instead of re-entering
 *  the same amount manually in Transactions. */
export async function logDebtPayment(debtId: string) {
  const { supabase, user } = await requireUser();

  const { data: debt, error: fetchErr } = await supabase
    .from("debts").select("*").eq("id", debtId).eq("user_id", user.id).single();
  if (fetchErr || !debt) throw new Error(fetchErr?.message || "ไม่พบรายการหนี้นี้");

  const { error: txErr } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: "expense",
    description: debt.name,
    amount: debt.monthly_payment,
    category: "debt",
    date: todayISO(),
    note: "บันทึกอัตโนมัติจากหน้าหนี้สิน",
  });
  if (txErr) throw new Error(txErr.message);

  const newRemaining = Math.max(0, Number(debt.remaining_amount) - Number(debt.monthly_payment));
  const { error: updateErr } = await supabase
    .from("debts").update({ remaining_amount: newRemaining }).eq("id", debtId).eq("user_id", user.id);
  if (updateErr) throw new Error(updateErr.message);

  revalidatePath("/", "layout");
}

/* ----------------------------------- bills ----------------------------------- */

export async function saveBill(input: {
  id?: string;
  name: string;
  icon: string;
  category: CategoryId;
  monthly_payment: number;
  due_day: number;
  note?: string;
}) {
  const { supabase, user } = await requireUser();

  const row = {
    user_id: user.id,
    name: input.name,
    icon: input.icon,
    category: input.category,
    monthly_payment: input.monthly_payment,
    due_day: input.due_day,
    note: input.note || null,
  };

  const { error } = input.id
    ? await supabase.from("bills").update(row).eq("id", input.id).eq("user_id", user.id)
    : await supabase.from("bills").insert(row);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteBill(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("bills").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/** Logs a bill's amount as an expense transaction for today — one tap instead
 *  of re-entering the same recurring amount manually in Transactions. */
export async function logBillPayment(billId: string) {
  const { supabase, user } = await requireUser();

  const { data: bill, error: fetchErr } = await supabase
    .from("bills").select("*").eq("id", billId).eq("user_id", user.id).single();
  if (fetchErr || !bill) throw new Error(fetchErr?.message || "ไม่พบรายการนี้");

  const { error: txErr } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: "expense",
    description: bill.name,
    amount: bill.monthly_payment,
    category: bill.category,
    date: todayISO(),
    note: "บันทึกอัตโนมัติจากหน้าค่าใช้จ่ายประจำ",
  });
  if (txErr) throw new Error(txErr.message);

  revalidatePath("/", "layout");
}

/* --------------------------------- reminders --------------------------------- */

export async function setReminderLevel(input: { debt_id: string; reminder_days: 7 | 3 | 1 | 0; enabled: boolean }) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("reminders")
    .update({ enabled: input.enabled })
    .eq("user_id", user.id)
    .eq("debt_id", input.debt_id)
    .eq("reminder_days", input.reminder_days);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

/* ----------------------------------- LINE link ----------------------------------- */

export async function createLineLinkCode() {
  const { supabase, user } = await requireUser();

  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  const { error } = await supabase
    .from("line_links")
    .upsert(
      { user_id: user.id, link_code: code, link_code_expires_at: expiresAt },
      { onConflict: "user_id" }
    );

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { code, expiresAt };
}

export async function unlinkLine() {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("line_links")
    .update({ line_user_id: null, link_code: null, link_code_expires_at: null })
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}
