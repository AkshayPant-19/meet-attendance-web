import UploadForm from "@/components/UploadForm";

export const metadata = { title: "Upload — Meet Attendance" };

export default function UploadPage() {
  return (
    <div className="stack">
      <UploadForm />
      <div className="card">
        <h3>Expected CSV format</h3>
        <p className="muted">
          The extension exports exactly this. Column order is flexible — the
          importer looks for headers containing &quot;name&quot;,
          &quot;status&quot;, &quot;join&quot; and &quot;leave&quot;.
        </p>
        <pre>
          <code>{`"Student Name","Status","Join Time","Leave Time","Duration"
"SHAURYA SINGH","Present","09:02:11","10:01:40","1h 0m"
"TANISHK BHATT","Absent","","",""`}</code>
        </pre>
      </div>
    </div>
  );
}
