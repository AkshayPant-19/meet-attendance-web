import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionFromPayload } from "@/lib/sessions";
import { hashToken } from "@/lib/tokens";
import type { SyncPayload } from "@/lib/types";

export const dynamic = "force-dynamic";

// The Chrome extension calls this endpoint from a meeting page (e.g.
// https://meet.google.com), i.e. cross-origin, so it must send CORS headers.
// Auth is via a bearer token, so a wildcard origin is safe (the token is the
// secret, and responses are never sent with credentials).
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

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
    return json({ error: "missing bearer token" }, 401);
  }
  const tokenHash = hashToken(match[1].trim());

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return json({ error: "server not configured" }, 500);
  }

  const { data: tokenRow, error: tokenError } = await admin
    .from("api_tokens")
    .select("id,user_id")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenError || !tokenRow) {
    return json({ error: "invalid token" }, 401);
  }

  const payload = (await request.json().catch(() => null)) as SyncPayload | null;
  if (!payload || (!payload.students?.length && !payload.records)) {
    return json({ error: "empty payload" }, 400);
  }

  const result = await createSessionFromPayload(admin, tokenRow.user_id, payload);
  if (!result.ok) {
    return json({ error: result.error }, 400);
  }

  await admin
    .from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenRow.id);

  return json(result, 201);
}
