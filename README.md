# Meet Attendance — Web Dashboard

A Next.js (App Router) + TypeScript + Supabase dashboard for the **Meet
Attendance** Chrome extension. Install the extension, create an account, review
sessions, manage your roster, and sync or upload attendance records.

> Companion to the extension in `../meet attendance`. Designed to deploy on
> **Vercel** with **Supabase** for auth + database.

## Features

- **Auth** — email/password sign-up and log-in via Supabase Auth (cookie-based
  sessions, protected `/dashboard`).
- **Install page** — step-by-step instructions for loading the extension.
- **Sessions** — list every session; drill into a session to see per-student
  status, join/leave times and duration.
- **Students** — edit your roster on the web and keep it in sync with the
  extension.
- **Upload** — import the extension's `meeting_attendance.csv` or a JSON payload.
- **Sync API** — per-user API tokens so the extension (or any script) can POST
  sessions to `POST /api/sync`.

## Tech

- Next.js 14 (App Router) + React + TypeScript
- `@supabase/ssr` + `@supabase/supabase-js`
- Plain CSS (no UI framework), dark theme

## 1. Create a Supabase project

1. Go to <https://supabase.com>, create a project.
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql). This
   creates `students`, `sessions`, `attendance_records`, `api_tokens` and their
   Row Level Security policies.
3. (Optional) In **Authentication → Providers**, keep **Email** enabled. For
   quick testing you can turn **Confirm email** off so sign-up logs in directly.

## 2. Configure env

Copy `.env.local.example` to `.env.local` and fill in the values from
**Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...       # server only, never expose
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Run locally

```bash
npm install
npm run dev
# http://localhost:3000
```

## 4. Deploy to Vercel

1. Push this folder to its own GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo.
3. Add the same environment variables (Project → Settings → Environment
   Variables). Set `NEXT_PUBLIC_SITE_URL` to your production URL,
   e.g. `https://meet-attendance-web.vercel.app`.
4. Deploy. Then in Supabase → **Authentication → URL Configuration**, add your
   Vercel URL to **Site URL** and **Redirect URLs**
   (`https://<your-app>.vercel.app/auth/callback`).

## 5. Sync from the extension

In the dashboard open **Sync API**, create a token, then POST sessions:

```bash
curl -X POST https://<your-app>.vercel.app/api/sync \
  -H "Authorization: Bearer ma_xxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Period 3 — Algebra",
    "platform": "meet",
    "meetingCode": "abc-defg-hij",
    "students": ["SHAURYA SINGH", "TANISHK BHATT"],
    "records": {
      "SHAURYA SINGH": { "join": 1729000000000, "leave": 1729003600000, "status": "present" },
      "TANISHK BHATT": { "status": "absent" }
    }
  }'
```

Missing students default to **absent**. `join`/`leave` accept epoch-ms,
ISO strings, or `HH:MM:SS`.

## API reference

| Method & path | Auth | Purpose |
| --- | --- | --- |
| `POST /api/sync` | `Bearer ma_…` | Create a session from the extension |
| `GET/POST /api/students` | session cookie | Read / replace the roster |
| `GET/POST /api/sessions` | session cookie | List / create sessions |
| `DELETE /api/sessions/:id` | session cookie | Delete a session |
| `POST /api/upload` | session cookie | Import CSV or JSON |
| `GET/POST/DELETE /api/tokens` | session cookie | Manage API tokens |

## Project structure

```
meet-attendance-web/
├── app/
│   ├── page.tsx                     # Landing
│   ├── install/page.tsx             # Install instructions
│   ├── login, signup                # Auth pages
│   ├── auth/callback, auth/signout  # Auth routes
│   ├── dashboard/                   # Overview, sessions, students, upload, sync
│   └── api/                         # students, sessions, upload, tokens, sync
├── components/                      # AuthForm, StudentsEditor, UploadForm, TokenManager…
├── lib/
│   ├── supabase/                    # client, server, admin, middleware
│   ├── sessions.ts                  # createSessionFromPayload
│   ├── parse.ts                     # CSV / roster parsing
│   ├── tokens.ts                    # token hash/generate
│   └── types.ts                     # shared types
├── supabase/schema.sql              # tables + RLS
└── middleware.ts                    # session refresh + route protection
```

## Security notes

- Tokens are stored as SHA-256 hashes; the plaintext is shown once.
- `SUPABASE_SERVICE_ROLE_KEY` is only used in the server-only sync route and
  bypasses RLS — never expose it to the client.
- All user tables use Row Level Security scoped to `auth.uid()`.
