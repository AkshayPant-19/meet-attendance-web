import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meet Attendance",
  description:
    "Install the extension, track sessions, manage your roster, and review attendance across Google Meet, Zoom, Teams and Webex.",
};

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand">
          <span className="logo" />
          Meet Attendance
        </Link>
        <nav className="nav">
          <Link href="/install">Install</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Log in</Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
