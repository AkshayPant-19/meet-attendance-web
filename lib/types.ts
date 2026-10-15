export type Student = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Session = {
  id: string;
  user_id: string;
  title: string;
  platform: string | null;
  meeting_code: string | null;
  started_at: string | null;
  ended_at: string | null;
  present_count: number;
  absent_count: number;
  created_at: string;
};

export type AttendanceRecord = {
  id: string;
  session_id: string;
  student_name: string;
  status: "present" | "absent";
  join_time: string | null;
  leave_time: string | null;
  duration_ms: number | null;
};

/** Shape posted by the Chrome extension to /api/sync. */
export type SyncPayload = {
  meetingCode?: string;
  title?: string;
  platform?: string;
  startedAt?: string;
  endedAt?: string;
  students?: string[];
  records?: Record<
    string,
    {
      join?: number | string | null;
      leave?: number | string | null;
      status?: "present" | "absent";
    }
  >;
};

/** Normalize an epoch-ms number or ISO/`HH:MM:SS` string to an ISO timestamp. */
export function toIso(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return new Date(value).toISOString();
  const hm = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (hm) {
    const d = new Date();
    d.setHours(Number(hm[1]), Number(hm[2]), Number(hm[3] || 0), 0);
    return d.toISOString();
  }
  const parsed = Date.parse(value);
  return isNaN(parsed) ? null : new Date(parsed).toISOString();
}
