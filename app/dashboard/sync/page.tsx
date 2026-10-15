import TokenManager from "@/components/TokenManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sync API — Meet Attendance" };

export default function SyncPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-app.vercel.app";
  return <TokenManager siteUrl={siteUrl} />;
}
