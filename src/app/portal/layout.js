import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/supabase/require-role";

export default async function PortalLayout({ children }) {
  const { user, profile } = await requireRole("client");

  return (
    <AppShell
      navKey="portal"
      brandLabel="Client portal"
      brandHref="/portal"
      userLabel={profile?.full_name || user?.email}
    >
      {children}
    </AppShell>
  );
}
