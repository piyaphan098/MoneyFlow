import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY. Uses the Supabase service role key, which bypasses Row Level
 * Security entirely. Only ever import this from server code that has no
 * other way to know "which user" — like the LINE webhook, which is called
 * by LINE's servers, not by a logged-in browser session.
 *
 * Never import this into a client component or expose the key to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
