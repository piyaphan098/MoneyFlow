import { NextResponse } from "next/server";
import { sendPeriodSummaries } from "@/lib/summary";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await sendPeriodSummaries("month");
  return NextResponse.json(result);
}
