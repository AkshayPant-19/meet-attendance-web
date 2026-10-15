import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  const { count: sessionCount } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true });

  const totalPresent =
    sessions?.reduce((sum, s) => sum + (s.present_count || 0), 0) ?? 0;
  const totalStudents =
    sessions?.reduce(
      (sum, s) => sum + (s.present_count || 0) + (s.absent_count || 0),
      0,
    ) ?? 0;
  const rate = totalStudents ? Math.round((totalPresent / totalStudents) * 100) : 0;

  return (
    <div className="stack">
      <div className="grid cols-3">
        <div className="card stat">
          <b>{sessionCount ?? 0}</b>
          <span className="muted">Sessions recorded</span>
        </div>
        <div className="card stat">
          <b>{studentCount ?? 0}</b>
          <span className="muted">Students on roster</span>
        </div>
        <div className="card stat success">
          <b>{rate}%</b>
          <span className="muted">Attendance rate (recent)</span>
        </div>
      </div>

      <div className="card">
        <div className="spread">
          <h2 style={{ margin: 0 }}>Recent sessions</h2>
          <Link className="btn" href="/dashboard/sessions">
            View all
          </Link>
        </div>
        {sessions && sessions.length ? (
          <table style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Platform</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/dashboard/sessions/${s.id}`}>{s.title}</Link>
                  </td>
                  <td className="muted">{s.platform ?? "—"}</td>
                  <td>{s.present_count}</td>
                  <td>{s.absent_count}</td>
                  <td className="muted">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted" style={{ marginTop: 12 }}>
            No sessions yet.{" "}
            <Link href="/dashboard/upload">Upload a CSV</Link> or set up the{" "}
            <Link href="/dashboard/sync">Sync API</Link>.
          </p>
        )}
      </div>

      <div className="card">
        <h2>Welcome{user?.email ? `, ${user.email}` : ""}</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          Tip: keep your <Link href="/dashboard/students">student list</Link> up
          to date so the extension and dashboard always agree.
        </p>
      </div>
    </div>
  );
}
