"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setText(await file.text());
  }

  async function submit() {
    setBusy(true);
    setError(null);
    setStatus(null);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setStatus(
        `Session saved — ${data.present} present, ${data.absent} absent.`,
      );
      setText("");
      setFileName(null);
      router.refresh();
    } else {
      setError(data.error || "Upload failed.");
    }
  }

  return (
    <div className="card stack">
      <h2 style={{ margin: 0 }}>Upload a session</h2>
      <p className="muted" style={{ margin: 0 }}>
        Upload the <code>meeting_attendance.csv</code> exported by the
        extension, or a JSON payload (same shape as the sync API).
      </p>
      <div>
        <label htmlFor="file">CSV or JSON file</label>
        <input id="file" type="file" accept=".csv,.json,text/csv,application/json" onChange={onFile} />
        {fileName && <p className="muted" style={{ marginTop: 6 }}>{fileName}</p>}
      </div>
      <div>
        <label htmlFor="paste">…or paste it here</label>
        <textarea
          id="paste"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ height: 200 }}
          spellCheck={false}
          placeholder={`"Student Name","Status","Join Time","Leave Time","Duration"\n"SHAURYA SINGH","Present",...`}
        />
      </div>
      <div className="row">
        <button className="btn primary" onClick={submit} disabled={busy || !text.trim()}>
          {busy ? "Uploading…" : "Upload session"}
        </button>
        {status && <span className="success-text">{status}</span>}
        {error && <span className="error">{error}</span>}
      </div>
    </div>
  );
}
