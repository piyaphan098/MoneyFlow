# MoneyFlow

Personal money dashboard — Next.js (App Router) + TypeScript + Tailwind CSS + Supabase.

## 1. Set up Supabase

1. Create a project at https://supabase.com
2. Open **SQL Editor** in the dashboard, paste the contents of `supabase/schema.sql`, and run it.
   This creates `profiles`, `transactions`, `debts`, `reminders`, Row Level Security policies
   (every user can only see/edit their own data), and triggers that:
   - create a `profiles` row automatically when someone signs up
   - seed the 4 default reminder levels (7/3/1/0 days) whenever a debt is added
3. In **Project Settings → API**, copy the Project URL and the `anon public` key.

## 2. Configure environment variables

```
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 3. Install & run

```
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`. Sign up with an email + password
(if you left "Confirm email" on in Supabase Auth settings, confirm via the email link first).

## What's wired up

- **Auth**: Supabase Auth (email/password), session refreshed in `middleware.ts`, protected routes
  redirect to `/login` automatically.
- **Dashboard** (`/`): balance, this month's income/expense, 7-day upcoming total, cashflow chart
  (1/3/6/12 month toggle), upcoming payments, and computed insights — all derived live from your
  Supabase data (no AI, just real calculations, per the MVP spec).
- **Transactions** (`/transactions`): list + filter, tap a row to edit or delete, "+ เพิ่มรายการ"
  for a fast add.
- **Debts** (`/debts`): totals, progress bars, add/edit/delete a debt.
- **Calendar** (`/calendar`): month grid with due-date markers pulled from your debts.
- **Settings** (`/settings`): per-debt reminder toggles (7/3/1/0 days) — this is the schema hook
  point for a future Browser Notification / Email / LINE Notify integration; nothing sends yet,
  it just stores which levels are enabled.

## LINE integration (optional)

Once deployed to a public HTTPS URL (Vercel, etc — LINE can't call localhost):

1. Go to https://developers.line.biz → create a **Messaging API** channel.
2. In the channel's **Messaging API** tab:
   - Copy **Channel secret** → `LINE_CHANNEL_SECRET`
   - Issue and copy a **Channel access token** → `LINE_CHANNEL_ACCESS_TOKEN`
   - Set **Webhook URL** to `https://your-domain.com/api/line/webhook` and click **Verify**
   - Turn **Use webhook** ON, turn the default auto-reply messages OFF
3. In Supabase → **Project Settings → API**, copy the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
   (server-only — never expose this to the browser).
4. Add all three to your deployment's environment variables and redeploy.
5. In the app, go to **ตั้งค่า → เชื่อมต่อ LINE**, generate a 6-digit code, add the LINE OA as a
   friend, and send the code as a message. You'll get a confirmation reply, then you can text
   things like `กาแฟ 60` or `+30000 เงินเดือน` and they'll show up as transactions immediately.

### How linking works

`line_links` maps a `line_user_id` to your Supabase `auth.users.id`. The webhook is called by
LINE's servers (not a logged-in browser), so it has no session — it authenticates using the
Supabase **service role** key (`lib/supabase/admin.ts`), which bypasses Row Level Security. That's
why the link code / lookup step matters: it's how the webhook knows *whose* `transactions` table
to write into.

### Category guessing

`lib/line.ts` matches Thai keywords (กาแฟ, แท็กซี่, ค่าไฟ, ผ่อน, …) against the message text to
pick a category automatically. It's a simple substring match, not AI — tune the keyword lists in
`CATEGORY_KEYWORDS` as you go.


- Dashboard aggregates the most recent 500 transactions client-side rather than using a SQL
  view/RPC — fine for personal use, worth revisiting if transaction volume gets large.
- No bank connection, investments, crypto, AI advisor, or OCR — out of scope by design.
- Reminders are stored but not yet *sent* anywhere (structure is ready for that next step).
