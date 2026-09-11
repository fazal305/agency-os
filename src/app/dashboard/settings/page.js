import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const bookingUrlConfigured = Boolean(process.env.NEXT_PUBLIC_BOOKING_URL);

  const rows = [
    {
      label: "Database & auth (Supabase)",
      configured: isSupabaseConfigured,
      detail: isSupabaseConfigured
        ? "Connected"
        : "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    },
    {
      label: "Transactional email (Resend)",
      configured: resendConfigured,
      detail: resendConfigured ? "Live" : "Test mode — emails are not sent",
    },
    {
      label: "Kickoff booking link",
      configured: bookingUrlConfigured,
      detail: bookingUrlConfigured
        ? process.env.NEXT_PUBLIC_BOOKING_URL
        : "Not set — hidden from the client portal",
    },
  ];

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title="Settings" description="Integration status for this environment." />
      <ul className="divide-y divide-border rounded-lg border border-border">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-4 px-4 py-4">
            <div>
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-sm text-muted-foreground">{row.detail}</p>
            </div>
            <StatusBadge
              tone={row.configured ? "success" : "neutral"}
              label={row.configured ? "Configured" : "Not configured"}
            />
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        These are read from environment variables at deploy time — change them
        in your hosting provider&rsquo;s dashboard, not here.
      </p>
    </div>
  );
}
