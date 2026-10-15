"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/sessions", label: "Sessions" },
  { href: "/dashboard/students", label: "Students" },
  { href: "/dashboard/upload", label: "Upload" },
  { href: "/dashboard/sync", label: "Sync API" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="tabs">
      {LINKS.map((l) => {
        const active =
          l.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={active ? "active" : ""}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
