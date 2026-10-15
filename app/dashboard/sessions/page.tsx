import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteSessionButton from "@/components/DeleteSessionButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sessions — Meet Attendance" };

function fmt(dt: string | null) {
  return dt ? new Date(dt).toLocaleString() : "—";
}

export default async function SessionsPage() {
  const supabase = createClient();
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="card">
      <div className="spread">
        <h2 style={{ margin: 0 }}>Sessions</h2>
        <Link className="btn primary" href="/dashboard/upload">
          Add session
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
              <th>Started</th>
              <th></th>
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
                <td className="muted">{fmt(s.started_at ?? s.created_at)}</td>
                <td style={{ textAlign: "right" }}>
                  <DeleteSessionButton id={s.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted" style={{ marginTop: 12 }}>
          No sessions yet.
        </p>
      )}
    </div>
  );
}
