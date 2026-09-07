import { NextResponse } from "next/server";

const LINE_API = "https://api.line.me/v2/bot";
const LINE_DATA_API = "https://api-data.line.me/v2/bot"; // content endpoints use a separate host

async function lineFetch(base: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE API ${path} failed (${res.status}): ${text}`);
  }
  return res;
}

/**
 * One-time setup — run this once (or again whenever you change the menu
 * design) by visiting this URL with the CRON_SECRET bearer token. It:
 *   1. deletes any existing rich menus (so re-runs don't accumulate clutter)
 *   2. creates the new rich menu (4 tap zones)
 *   3. uploads public/richmenu.png as its image
 *   4. sets it as the default menu for every user of the OA
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 1) clean up old rich menus
  const listRes = await lineFetch(LINE_API, "/richmenu/list", { method: "GET" });
  const { richmenus } = (await listRes.json()) as { richmenus: { richMenuId: string }[] };
  for (const rm of richmenus ?? []) {
    await lineFetch(LINE_API, `/richmenu/${rm.richMenuId}`, { method: "DELETE" });
  }

  // 2) create the new rich menu definition (4 equal tap zones, 2500x843)
  const zoneW = 2500 / 4;
  const appUrl = new URL(request.url).origin;

  const areas = [
    { bounds: { x: 0, y: 0, width: zoneW, height: 843 }, action: { type: "message", text: "ยอดคงเหลือ" } },
    { bounds: { x: zoneW, y: 0, width: zoneW, height: 843 }, action: { type: "message", text: "สรุปเดือนนี้" } },
    { bounds: { x: zoneW * 2, y: 0, width: zoneW, height: 843 }, action: { type: "uri", uri: appUrl } },
    { bounds: { x: zoneW * 3, y: 0, width: zoneW, height: 843 }, action: { type: "message", text: "วิธีใช้" } },
  ];

  const createRes = await lineFetch(LINE_API, "/richmenu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      size: { width: 2500, height: 843 },
      selected: true,
      name: "MoneyFlow menu",
      chatBarText: "เมนู",
      areas,
    }),
  });
  const { richMenuId } = (await createRes.json()) as { richMenuId: string };

  // 3) upload the image (fetched from this same deployment's /public folder)
  const imgRes = await fetch(new URL("/richmenu.png", request.url));
  if (!imgRes.ok) {
    return NextResponse.json({ error: "could not fetch /richmenu.png from this deployment" }, { status: 500 });
  }
  const imgBuffer = await imgRes.arrayBuffer();
  await lineFetch(LINE_DATA_API, `/richmenu/${richMenuId}/content`, {
    method: "POST",
    headers: { "Content-Type": "image/png" },
    body: imgBuffer,
  });

  // 4) set as default for everyone
  await lineFetch(LINE_API, `/user/all/richmenu/${richMenuId}`, { method: "POST" });

  return NextResponse.json({ ok: true, richMenuId, deletedOldMenus: richmenus?.length ?? 0 });
}
