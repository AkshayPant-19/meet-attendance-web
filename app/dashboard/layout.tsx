import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="container">
      <div className="spread" style={{ margin: "24px 0 8px" }}>
        <div>
          <h1 style={{ marginBottom: 2 }}>Dashboard</h1>
          <p className="muted" style={{ margin: 0 }}>
            {user?.email}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="btn" type="submit">
            Log out
          </button>
        </form>
      </div>

      <DashboardNav />

      {children}
    </div>
  );
}
