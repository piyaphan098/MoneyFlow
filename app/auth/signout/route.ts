import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  // 303 forces the browser to switch to GET on redirect — the default 307
  // would re-POST to /login (a page route with no POST handler) and 405.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
