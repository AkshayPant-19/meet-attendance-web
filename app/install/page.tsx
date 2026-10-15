import Link from "next/link";

export const metadata = { title: "Install — Meet Attendance" };

export default function InstallPage() {
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <h1 style={{ marginTop: 24 }}>Install the extension</h1>
      <p className="muted">
        The extension is a Chrome Manifest V3 add-on. It runs entirely in your
        browser; nothing is uploaded unless you enable sync.
      </p>

      <div className="card stack" style={{ marginTop: 8 }}>
        <h3>1. Load the extension</h3>
        <ol className="muted" style={{ paddingLeft: 18 }}>
          <li>
            Download the extension source (the{" "}
            <code>meet-attendance</code> folder / ZIP).
          </li>
          <li>
            Open <code>chrome://extensions</code> in Chrome (or Edge / Brave).
          </li>
          <li>
            Turn on <b>Developer mode</b> (top-right).
          </li>
          <li>
            Click <b>Load unpacked</b> and select the folder containing{" "}
            <code>manifest.json</code>.
          </li>
        </ol>
        <pre>
          <code>{`# from a terminal, in the extension folder
# then load that folder in chrome://extensions`}</code>
        </pre>
      </div>

      <div className="card stack" style={{ marginTop: 16 }}>
        <h3>2. Use it in a class</h3>
        <ol className="muted" style={{ paddingLeft: 18 }}>
          <li>Join your class (Meet / Zoom / Teams / Webex).</li>
          <li>
            Press <b>Ctrl+M</b> to open the panel, and open the app&apos;s{" "}
            <b>Participants/People panel</b>.
          </li>
          <li>Save your student list and click <b>Start monitoring</b>.</li>
          <li>Export a CSV at the end of class.</li>
        </ol>
      </div>

      <div className="card stack" style={{ marginTop: 16 }}>
        <h3>3. Sync to your dashboard (optional)</h3>
        <p className="muted">
          Generate an API token in the dashboard and POST the session to the
          sync endpoint. Full instructions are on the{" "}
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
