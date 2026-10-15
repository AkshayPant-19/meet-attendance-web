import type { SyncPayload } from "./types";
import { toIso } from "./types";

/** Parse a roster from a textarea / file (one name per line). */
export function parseRoster(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Minimal CSV row splitter that respects double quotes. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseTime(value: string): string | null {
  return toIso(value);
}

/**
 * Parse the CSV exported by the extension:
 *   "Student Name","Status","Join Time","Leave Time","Duration"
 */
export function parseExtensionCsv(csv: string): SyncPayload {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { students: [], records: {} };

  const students: string[] = [];
  const records: SyncPayload["records"] = {};

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = header.findIndex((h) => h.includes("name"));
  const statusIdx = header.findIndex((h) => h.includes("status"));
  const joinIdx = header.findIndex((h) => h.includes("join"));
  const leaveIdx = header.findIndex((h) => h.includes("leave"));

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    if (!cells.length || !cells[0]) continue;
    const name = cells[nameIdx >= 0 ? nameIdx : 0];
    if (!name) continue;
    const statusRaw = statusIdx >= 0 ? (cells[statusIdx] || "").toLowerCase() : "";
    const status: "present" | "absent" | undefined = statusRaw
      ? statusRaw.startsWith("p")
        ? "present"
        : "absent"
      : undefined;
    students.push(name);
    records[name] = {
      join: joinIdx >= 0 ? parseTime(cells[joinIdx]) : null,
      leave: leaveIdx >= 0 ? parseTime(cells[leaveIdx]) : null,
      status,
    };
  }

  return { students, records, title: "Uploaded session", platform: "unknown" };
}
