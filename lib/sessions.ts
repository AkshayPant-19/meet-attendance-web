import type { SupabaseClient } from "@supabase/supabase-js";
import type { SyncPayload } from "./types";
import { toIso } from "./types";

export type CreateResult =
  | { ok: true; sessionId: string; present: number; absent: number }
  | { ok: false; error: string };

/**
 * Persist a session (and its per-student records) for a user.
 * Works with either an RLS-scoped user client or the service-role client.
 */
export async function createSessionFromPayload(
  supabase: SupabaseClient,
  userId: string,
  payload: SyncPayload,
): Promise<CreateResult> {
  const recordEntries = payload.records ? Object.entries(payload.records) : [];
  const roster =
    payload.students && payload.students.length
      ? payload.students
      : recordEntries.map(([name]) => name);

  if (!roster.length) {
    return { ok: false, error: "No students in payload." };
  }

  let present = 0;
  let absent = 0;
  const rows = roster.map((name) => {
    const r = payload.records?.[name] ?? {};
    const join = toIso(r.join ?? null);
    const leave = toIso(r.leave ?? null);
    const status: "present" | "absent" =
      r.status ?? (join ? "present" : "absent");
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

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      title: payload.title?.trim() || "Untitled session",
      platform: payload.platform ?? null,
      meeting_code: payload.meetingCode ?? null,
      started_at: toIso(payload.startedAt ?? null),
      ended_at: toIso(payload.endedAt ?? null),
      present_count: present,
      absent_count: absent,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return { ok: false, error: sessionError?.message || "Failed to create session." };
  }

  const records = rows.map((r) => ({ ...r, session_id: session.id }));
  const { error: recordsError } = await supabase
    .from("attendance_records")
    .insert(records);

  if (recordsError) {
    return { ok: false, error: recordsError.message };
  }

  return { ok: true, sessionId: session.id, present, absent };
}
