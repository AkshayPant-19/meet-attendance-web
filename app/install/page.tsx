import Link from "next/link";

export const metadata = { title: "Install — Meet Attendance" };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://your-app.vercel.app";

export default function InstallPage() {
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <h1 style={{ marginTop: 24 }}>Install the extension</h1>
      <p className="muted">
        The extension is a Chrome Manifest V3 add-on. It runs entirely in your
        browser; nothing is uploaded unless you enable sync.
      </p>

      <div
        className="card stack"
        style={{ marginTop: 8, borderColor: "var(--primary)", textAlign: "center" }}
      >
        <h3 style={{ margin: 0 }}>Download &amp; install</h3>
        <p className="muted" style={{ margin: 0 }}>
          Download the ZIP, then load the extracted folder into Chrome.
        </p>
        <div style={{ marginTop: 4 }}>
          <a
            className="btn primary"
            href="/meet-attendance-extension.zip"
            download="meet-attendance-extension.zip"
            style={{ fontSize: 15, padding: "12px 22px" }}
          >
            ⬇ Download extension (.zip)
          </a>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: 12 }}>
          31 KB · contains <code>manifest.json</code>, <code>content.js</code>,{" "}
          <code>core.js</code>, popup &amp; docs
        </p>
      </div>

      <div className="card stack" style={{ marginTop: 16 }}>
        <h3>1. Load the extension</h3>
        <ol className="muted" style={{ paddingLeft: 18 }}>
          <li>
            click the download button above and <b>extract</b> the ZIP (right-click
            → &quot;Extract All…&quot;). You should see a folder containing{" "}
            <code>manifest.json</code>.
          </li>
          <li>
            Open <code>chrome://extensions</code> in Chrome (or Edge / Brave).
          </li>
          <li>
            Turn on <b>Developer mode</b> (top-right).
          </li>
          <li>
            Click <b>Load unpacked</b> and select the extracted folder (the one
            containing <code>manifest.json</code>).
          </li>
        </ol>
      </div>

      <div className="card stack" style={{ marginTop: 16 }}>
        <h3>2. Auto-install on Windows (optional)</h3>
        <p className="muted">
          Prefer a script? Paste this into <b>PowerShell</b> — it downloads the
          extension and extracts it to a <code>meet-attendance</code> folder in
          your current directory:
        </p>
        <pre>
          <code>{`irm ${SITE_URL}/install.ps1 | iex`}</code>
        </pre>
        <p className="muted" style={{ fontSize: 12 }}>
          Then follow step 1 (Load unpacked) and select the printed folder path.
          The script only downloads and unpacks files — nothing is executed.
        </p>
      </div>

      <div className="card stack" style={{ marginTop: 16 }}>
        <h3>3. Use it in a class</h3>
        <ol className="muted" style={{ paddingLeft: 18 }}>
          <li>Join your class (Meet / Zoom / Teams / Webex).</li>
          <li>
            Press <b>Ctrl+M</b> to open the panel, and open the app&apos;s{" "}
            <b>Participants/People panel</b>.
          </li>
          <li>Save your student list and click <b>Start monitoring</b>.</li>
          <li>Export a CSV — or click <b>Sync to server</b> — at the end of class.</li>
        </ol>
      </div>

      <div className="card stack" style={{ marginTop: 16 }}>
        <h3>4. Sync to your dashboard (optional)</h3>
        <p className="muted">
          Set your server URL + API token in the extension <b>popup</b>, then use{" "}
          <b>Sync to server</b> inside a meeting. Create the token on the{" "}
          <Link href="/dashboard/sync">Sync page</Link> after you log in.
        </p>
        <div className="row">
          <Link className="btn primary" href="/signup">
            Create an account
          </Link>
          <Link className="btn" href="/login">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
