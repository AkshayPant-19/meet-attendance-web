"use client";

import { useEffect, useState } from "react";

type TokenRow = {
  id: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
};

export default function TokenManager({ siteUrl }: { siteUrl: string }) {
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [label, setLabel] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    const res = await fetch("/api/tokens");
    const data = await res.json().catch(() => ({}));
    if (res.ok) setTokens(data.tokens ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setBusy(true);
    setError(null);
    setNewToken(null);
    setCopied(false);
    const res = await fetch("/api/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setNewToken(data.token);
      setLabel("");
      load();
    } else {
      setError(data.error || "Failed to create token.");
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this token? Anything using it will stop working.")) return;
    await fetch(`/api/tokens?id=${id}`, { method: "DELETE" });
    load();
  }

  const example = `curl -X POST ${siteUrl}/api/sync \\
  -H "Authorization: Bearer ${newToken ?? "ma_your_token"}" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Period 3","platform":"meet","students":["SHAURYA SINGH"],"records":{"SHAURYA SINGH":{"join":1729000000000,"leave":1729003600000,"status":"present"}}}'`;

  return (
    <div className="stack">
      <div className="card stack">
        <h2 style={{ margin: 0 }}>API tokens</h2>
        <p className="muted" style={{ margin: 0 }}>
          Create a token and paste it (with the server URL) into the extension
          to sync sessions automatically. Tokens are shown once.
        </p>
        <div className="row">
          <input
            style={{ maxWidth: 260 }}
            placeholder="Label (e.g. My laptop)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button className="btn primary" onClick={create} disabled={busy}>
            {busy ? "Creating…" : "Create token"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {newToken && (
          <div className="card" style={{ background: "var(--bg-soft)" }}>
            <label>New token (copy it now — won&apos;t be shown again)</label>
            <div className="row">
              <code style={{ wordBreak: "break-all", flex: 1 }}>{newToken}</code>
              <button
                className="btn"
                onClick={() => {
                  navigator.clipboard.writeText(newToken);
                  setCopied(true);
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {tokens.length ? (
          <table style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Label</th>
                <th>Created</th>
                <th>Last used</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id}>
                  <td>{t.label}</td>
                  <td className="muted">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="muted">
                    {t.last_used_at
                      ? new Date(t.last_used_at).toLocaleString()
                      : "never"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn danger" onClick={() => revoke(t.id)}>
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No tokens yet.</p>
        )}
      </div>

      <div className="card">
        <h2>Sync endpoint</h2>
        <p className="muted">
          Send a JSON <code>POST</code> with your token:
        </p>
        <pre>
          <code>{example}</code>
        </pre>
        <p className="muted">
          <b>students</b> is your roster; <b>records</b> maps each student to
          join/leave (epoch-ms or ISO time) and an optional status. Missing
          students default to <b>absent</b>.
        </p>
      </div>
    </div>
  );
}
