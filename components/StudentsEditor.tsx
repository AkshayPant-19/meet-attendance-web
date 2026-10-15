"use client";

import { useState } from "react";

export default function StudentsEditor({ initial }: { initial: string[] }) {
  const [text, setText] = useState(initial.join("\n"));
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const count = text.split("\n").map((s) => s.trim()).filter(Boolean).length;

  async function save() {
    setBusy(true);
    setError(null);
    setStatus(null);
    const students = text.split("\n").map((s) => s.trim()).filter(Boolean);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) setStatus(`Saved ${data.count} students.`);
    else setError(data.error || "Failed to save.");
  }

  return (
    <div className="card stack">
      <div className="spread">
        <h2 style={{ margin: 0 }}>Student list</h2>
        <span className="muted">{count} names</span>
      </div>
      <label htmlFor="roster">One name per line</label>
      <textarea
        id="roster"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ height: 320 }}
        spellCheck={false}
        placeholder={"SHAURYA SINGH\nTANISHK BHATT\n..."}
      />
      <div className="row">
        <button className="btn primary" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save list"}
        </button>
        {status && <span className="success-text">{status}</span>}
        {error && <span className="error">{error}</span>}
      </div>
    </div>
  );
}
