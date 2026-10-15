import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function fmtTime(dt: string | null) {
  return dt ? new Date(dt).toLocaleTimeString() : "";
}
function fmtDur(ms: number | null) {
  if (typeof ms !== "number" || ms <= 0) return "";
  const m = Math.max(1, Math.round(ms / 60000));
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : `${m}m`;
}

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!session) notFound();

  const { data: records } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("session_id", params.id)
    .order("student_name", { ascending: true });

  const total = (session.present_count || 0) + (session.absent_count || 0);
  const rate = total ? Math.round(((session.present_count || 0) / total) * 100) : 0;

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <h2 style={{ marginBottom: 2 }}>{session.title}</h2>
          <p className="muted" style={{ margin: 0 }}>
            {session.platform ? `${session.platform} · ` : ""}
            {session.meeting_code ? `${session.meeting_code} · ` : ""}
            {session.started_at
              ? new Date(session.started_at).toLocaleString()
              : new Date(session.created_at).toLocaleString()}
          </p>
        </div>
        <Link className="btn" href="/dashboard/sessions">
          ← All sessions
        </Link>
      </div>

      <div className="grid cols-3">
        <div className="card stat success">
          <b>{session.present_count}</b>
          <span className="muted">Present</span>
        </div>
        <div className="card stat danger">
          <b>{session.absent_count}</b>
          <span className="muted">Absent</span>
        </div>
        <div className="card stat">
          <b>{rate}%</b>
          <span className="muted">Attendance</span>
        </div>
      </div>

      <div className="card">
        <h3>Attendance</h3>
        {records && records.length ? (
          <table style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Join</th>
                <th>Leave</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.student_name}</td>
                  <td>
                    <span className={`badge ${r.status}`}>{r.status}</span>
                  </td>
                  <td className="muted">{fmtTime(r.join_time)}</td>
                  <td className="muted">{fmtTime(r.leave_time)}</td>
                  <td className="muted">{fmtDur(r.duration_ms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No records for this session.</p>
        )}
      </div>
    </div>
  );
}
