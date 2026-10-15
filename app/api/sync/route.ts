import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionFromPayload } from "@/lib/sessions";
import { hashToken } from "@/lib/tokens";
import type { SyncPayload } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Extension sync endpoint.
 *
 *   POST /api/sync
 *   Authorization: Bearer ma_xxxxxxxx...
 *   Content-Type: application/json
 *
 * Body (SyncPayload):
 *   {
 *     "title": "Period 3 — Algebra",
 *     "platform": "meet",
 *     "meetingCode": "abc-defg-hij",
 *     "students": ["SHAURYA SINGH", "TANISHK BHATT"],
 *     "records": {
 *       "SHAURYA SINGH": { "join": 1729000000000, "leave": 1729003600000, "status": "present" },
 *       "TANISHK BHATT": { "status": "absent" }
 *     }
 *   }
 */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
  if (!match) {
    return NextResponse.json({ error: "missing bearer token" }, { status: 401 });
  }
  const tokenHash = hashToken(match[1].trim());

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  const { data: tokenRow, error: tokenError } = await admin
    .from("api_tokens")
    .select("id,user_id")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenError || !tokenRow) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as SyncPayload | null;
  if (!payload || (!payload.students?.length && !payload.records)) {
    return NextResponse.json({ error: "empty payload" }, { status: 400 });
  }

  const result = await createSessionFromPayload(admin, tokenRow.user_id, payload);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await admin
    .from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenRow.id);

  return NextResponse.json(result, { status: 201 });
}
