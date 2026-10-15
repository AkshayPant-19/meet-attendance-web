import type { SupabaseClient } from "@supabase/supabase-js";
import type { SyncPayload } from "./types";
import { toIso } from "./types";

export type CreateResult =
  | {
      ok: true;
      sessionId: string;
      present: number;
      absent: number;
      created: boolean;
    }
  | { ok: false; error: string };

type Row = {
  student_name: string;
  status: "present" | "absent";
  join_time: string | null;
  leave_time: string | null;
  duration_ms: number | null;
};

/** Turn a payload's roster/records into attendance rows + counts. */
function buildRows(payload: SyncPayload) {
  const recordEntries = payload.records ? Object.entries(payload.records) : [];
  const roster =
    payload.students && payload.students.length
      ? payload.students
      : recordEntries.map(([name]) => name);

  let present = 0;
  let absent = 0;
  const rows: Row[] = roster.map((name) => {
    const r = payload.records?.[name] ?? {};
    const join = toIso(r.join ?? null);
    const leave = toIso(r.leave ?? null);
    const status: "present" | "absent" = r.status ?? (join ? "present" : "absent");
    if (status === "present") present++;
    else absent++;
    const duration =
      join && leave ? new Date(leave).getTime() - new Date(join).getTime() : null;
    return {
      student_name: name,
      status,
      join_time: join,
      leave_time: leave,
      duration_ms: duration,
    };
  });

  return { rows, present, absent, roster };
}

function sessionFields(payload: SyncPayload, present: number, absent: number) {
  return {
    title: payload.title?.trim() || "Untitled session",
    platform: payload.platform ?? null,
    meeting_code: payload.meetingCode ?? null,
    started_at: toIso(payload.startedAt ?? null),
    ended_at: toIso(payload.endedAt ?? null),
    present_count: present,
    absent_count: absent,
  };
}

/**
 * Create a brand-new session (used by the manual CSV/JSON upload).
 * Works with either an RLS-scoped user client or the service-role client.
 */
export async function createSessionFromPayload(
  supabase: SupabaseClient,
  userId: string,
  payload: SyncPayload,
): Promise<CreateResult> {
  const { rows, present, absent, roster } = buildRows(payload);
  if (!roster.length) {
    return { ok: false, error: "No students in payload." };
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({ user_id: userId, ...sessionFields(payload, present, absent) })
    .select("id")
    .single();

  if (sessionError || !session) {
    return { ok: false, error: sessionError?.message || "Failed to create session." };
  }

  const { error: recordsError } = await supabase
    .from("attendance_records")
    .insert(rows.map((r) => ({ ...r, session_id: session.id })));

  if (recordsError) {
    return { ok: false, error: recordsError.message };
  }

  return { ok: true, sessionId: session.id, present, absent, created: true };
}

/**
 * Create OR update a session. Used by the extension's /api/sync so that
 * periodic auto-syncs keep updating ONE session row instead of creating a new
 * one every 5 minutes. Resolution order:
 *   1. explicit `sessionId` (must belong to the user)
 *   2. `clientKey` (must belong to the user)
 *   3. otherwise create a new session
 * On update, the session's attendance records are replaced wholesale.
 */
export async function upsertSessionFromPayload(
  supabase: SupabaseClient,
  userId: string,
  payload: SyncPayload,
): Promise<CreateResult> {
  const { rows, present, absent, roster } = buildRows(payload);
  if (!roster.length) {
    return { ok: false, error: "No students in payload." };
  }

  let existingId: string | null = null;

  if (payload.sessionId) {
    const { data } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", payload.sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    if (data) existingId = data.id;
  }

  if (!existingId && payload.clientKey) {
    const { data } = await supabase
      .from("sessions")
      .select("id")
      .eq("client_key", payload.clientKey)
      .eq("user_id", userId)
      .maybeSingle();
    if (data) existingId = data.id;
  }

  const fields = sessionFields(payload, present, absent);
  let sessionId: string;
  let created: boolean;

  if (existingId) {
    const update: Record<string, unknown> = { ...fields };
    if (payload.clientKey) update.client_key = payload.clientKey;
    const { error } = await supabase
      .from("sessions")
      .update(update)
      .eq("id", existingId);
    if (error) return { ok: false, error: error.message };

    sessionId = existingId;
    created = false;

    const { error: delError } = await supabase
      .from("attendance_records")
      .delete()
      .eq("session_id", sessionId);
    if (delError) return { ok: false, error: delError.message };
  } else {
    const insert: Record<string, unknown> = { user_id: userId, ...fields };
    if (payload.clientKey) insert.client_key = payload.clientKey;
    const { data, error } = await supabase
      .from("sessions")
      .insert(insert)
      .select("id")
      .single();
    if (error || !data) {
      return { ok: false, error: error?.message || "Failed to create session." };
    }
    sessionId = data.id;
    created = true;
  }

  const { error: recordsError } = await supabase
    .from("attendance_records")
    .insert(rows.map((r) => ({ ...r, session_id: sessionId })));

  if (recordsError) {
    return { ok: false, error: recordsError.message };
  }

  return { ok: true, sessionId, present, absent, created };
}
