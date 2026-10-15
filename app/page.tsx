import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container">
      <section className="hero">
        <span className="badge present">Chrome extension + dashboard</span>
        <h1>Attendance for every online class, in one place.</h1>
        <p className="lead">
          Install the browser extension to mark attendance live inside Google
          Meet, Zoom, Microsoft Teams and Webex — then sign in here to review
          sessions, update your roster, and keep a permanent record.
        </p>
        <div className="row" style={{ marginTop: 24 }}>
          <Link className="btn primary" href="/install">
            Install the extension
          </Link>
          <Link className="btn" href="/signup">
            Create an account
          </Link>
          <Link className="btn" href="/dashboard">
            Open dashboard
          </Link>
        </div>
      </section>

      <section className="grid cols-3" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>Live in-meeting panel</h3>
          <p className="muted">
            A floating panel reads the participant list and marks each student
            Present or Absent in real time.
          </p>
        </div>
        <div className="card">
          <h3>Works across apps</h3>
          <p className="muted">
            Google Meet, Zoom (web), Microsoft Teams, Cisco Webex, Whereby and a
            generic fallback.
          </p>
        </div>
        <div className="card">
          <h3>Sessions &amp; roster</h3>
          <p className="muted">
            Sync or upload sessions, review join/leave times, and keep your
            student list up to date from the dashboard.
          </p>
        </div>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <div className="spread">
          <div>
            <h2>How it works</h2>
            <ol className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              <li>Install the extension and open your class.</li>
              <li>
                Press <b>Ctrl+M</b> and open the app&apos;s Participants panel.
              </li>
              <li>Click Start monitoring — attendance is tracked live.</li>
              <li>
                Export a CSV or sync it here to keep a permanent record.
              </li>
            </ol>
          </div>
          <Link className="btn" href="/install">
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
