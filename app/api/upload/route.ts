import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSessionFromPayload } from "@/lib/sessions";
import { parseExtensionCsv } from "@/lib/parse";
import type { SyncPayload } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Manual upload of an exported CSV or a JSON payload.
 * Body: { text: string, format?: "csv" | "json" }
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const text = String(body.text ?? "");
  if (!text.trim()) {
    return NextResponse.json({ error: "empty file" }, { status: 400 });
  }

  let payload: SyncPayload;
  const looksJson = text.trim().startsWith("{");
  try {
    if (body.format === "json" || looksJson) {
      payload = JSON.parse(text) as SyncPayload;
    } else {
      payload = parseExtensionCsv(text);
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "could not parse file" },
      { status: 400 },
    );
  }

  const result = await createSessionFromPayload(supabase, user.id, payload);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
