export type TxType = "income" | "expense";

export type CategoryId =
  | "food" | "transport" | "home" | "debt" | "shopping" | "utility" | "work" | "other";

export type Transaction = {
  id: string;
  user_id: string;
  type: TxType;
  amount: number;
  category: CategoryId;
  description: string;
  date: string; // ISO date (yyyy-mm-dd)
  note: string | null;
  created_at: string;
};

export type Debt = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  icon: string;
  original_amount: number;
  remaining_amount: number;
  monthly_payment: number;
  interest_rate: number;
  due_day: number;
  note: string | null;
  created_at: string;
};

export type Bill = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  category: CategoryId;
  monthly_payment: number;
  due_day: number;
  note: string | null;
  created_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  debt_id: string | null;
  bill_id: string | null;
  reminder_days: 7 | 3 | 1 | 0;
  enabled: boolean;
};

export type LineLink = {
  id: string;
  user_id: string;
  line_user_id: string | null;
  link_code: string | null;
  link_code_expires_at: string | null;
};
