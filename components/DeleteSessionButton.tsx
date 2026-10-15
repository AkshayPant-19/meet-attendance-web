"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteSessionButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!confirm("Delete this session and its records?")) return;
    setBusy(true);
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Failed to delete session.");
  }

  return (
    <button className="btn danger" onClick={onClick} disabled={busy}>
      {busy ? "…" : "Delete"}
    </button>
  );
}
