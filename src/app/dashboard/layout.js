import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/supabase/require-role";

export default async function DashboardLayout({ children }) {
  const { user, profile } = await requireRole("admin");

  return (
    <AppShell
      navKey="agency"
      brandLabel="Agency"
      brandHref="/dashboard"
      userLabel={profile?.full_name || user?.email}
    >
      {children}
    </AppShell>
  );
}
