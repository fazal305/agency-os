import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }) {
  const { reason } = (await searchParams) ?? {};

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      redirect(profile?.role === "admin" ? "/dashboard" : "/portal");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <p className="font-heading text-lg tracking-tight">Agency OS</p>
          <h1 className="text-xl font-semibold tracking-tight">Log in</h1>
          <p className="text-sm text-muted-foreground">
            Use the email and password your agency contact set up for you.
          </p>
        </div>
        <LoginForm supabaseConfigured={isSupabaseConfigured} reason={reason} />
      </div>
    </div>
  );
}
