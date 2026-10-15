import { createClient } from "@/lib/supabase/server";
import StudentsEditor from "@/components/StudentsEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Students — Meet Attendance" };

export default async function StudentsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("students")
    .select("name")
    .order("name", { ascending: true });
  const names = (data ?? []).map((s) => s.name);

  return (
    <div className="stack">
      <StudentsEditor initial={names} />
      <div className="card">
        <h3>Use this list in the extension</h3>
        <p className="muted" style={{ margin: 0 }}>
          Copy the names above into the extension&apos;s panel or the toolbar
          popup and press <b>Save list</b> so both stay in sync.
        </p>
      </div>
    </div>
  );
}
