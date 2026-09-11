import { Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CLIENT_STATUS } from "@/lib/client-status";
import { NewClientDialog } from "./new-client-dialog";
import { SendWelcomeButton } from "./send-welcome-button";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  let clients = [];
  let loadError = false;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clients")
      .select(
        "id, company_name, primary_contact_name, primary_contact_email, status, created_at, welcome_sent_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      loadError = true;
    } else {
      clients = data;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Every client company, from prospect to archived."
        actions={isSupabaseConfigured ? <NewClientDialog /> : null}
      />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={Users}
          title="Database not connected"
          description="Configure Supabase environment variables to start adding clients."
        />
      ) : loadError ? (
        <EmptyState
          icon={Users}
          title="We couldn't load your clients"
          description="Something went wrong reaching the database. Try refreshing the page."
        />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to start their onboarding."
          action={<NewClientDialog />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Primary contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Welcome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const status = CLIENT_STATUS[client.status] ?? CLIENT_STATUS.prospect;
              return (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.company_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.primary_contact_name || client.primary_contact_email || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={status.tone} label={status.label} />
                  </TableCell>
                  <TableCell>
                    <SendWelcomeButton clientId={client.id} sent={client.welcome_sent_at} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
