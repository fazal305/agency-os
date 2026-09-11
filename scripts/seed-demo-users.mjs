// One-time seed script for local/demo use: creates a demo admin account, a
// demo client account, and the client company that links them. Uses the
// Supabase service-role ("secret") key, so it must run server-side/locally —
// never ship this key to the browser.
//
// Usage: npm run seed:demo   (requires SUPABASE_SECRET_KEY in .env.local)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local — add the secret key from Supabase Project Settings > API before running this."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_ADMIN = { email: "demo-admin@agencyos.test", password: "DemoAdmin123!" };
const DEMO_CLIENT = { email: "demo-client@agencyos.test", password: "DemoClient123!" };

async function upsertUser({ email, password }, metadata) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error && error.message?.toLowerCase().includes("already been registered")) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list.users.find((u) => u.email === email);
    console.log(`  already exists: ${email}`);
    return existing;
  }

  if (error) throw error;
  console.log(`  created: ${email}`);
  return data.user;
}

async function main() {
  console.log("Seeding demo client company...");
  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("company_name", "Acme Studios")
    .maybeSingle();

  let clientId = existingClient?.id;
  if (!clientId) {
    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        company_name: "Acme Studios",
        primary_contact_name: "Casey Client",
        primary_contact_email: DEMO_CLIENT.email,
        status: "active",
      })
      .select("id")
      .single();
    if (error) throw error;
    clientId = client.id;
    console.log(`  created client: Acme Studios (${clientId})`);
  } else {
    console.log(`  already exists: Acme Studios (${clientId})`);
  }

  console.log("Seeding demo admin user...");
  await upsertUser(DEMO_ADMIN, { role: "admin", full_name: "Alex Admin" });

  console.log("Seeding demo client user...");
  const clientUser = await upsertUser(DEMO_CLIENT, {
    role: "client",
    full_name: "Casey Client",
  });

  await supabase.from("profiles").update({ client_id: clientId }).eq("id", clientUser.id);

  console.log("\nDone. Demo credentials:");
  console.log(`  Admin:  ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`);
  console.log(`  Client: ${DEMO_CLIENT.email} / ${DEMO_CLIENT.password}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
