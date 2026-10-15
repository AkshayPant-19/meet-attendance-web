import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseRoster } from "@/lib/parse";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ students: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const names: string[] = Array.isArray(body.students)
    ? body.students.map((s: unknown) => String(s).trim()).filter(Boolean)
    : parseRoster(String(body.text ?? ""));

  // Replace the user's roster: delete-then-insert keeps it simple and exact.
  const { error: delError } = await supabase
    .from("students")
    .delete()
    .eq("user_id", user.id);
  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });

  // De-duplicate while preserving order.
  const unique = Array.from(new Set(names));
  if (unique.length) {
    const rows = unique.map((name) => ({ user_id: user.id, name }));
    const { error } = await supabase.from("students").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: unique.length });
}
