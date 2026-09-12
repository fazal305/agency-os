"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "./actions";

const initialState = { error: null };

export function LoginForm({ supabaseConfigured, reason }) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  if (!supabaseConfigured) {
    return (
      <p className="rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        Login isn&rsquo;t available yet — this environment doesn&rsquo;t have Supabase
        configured.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {reason === "session_expired" ? (
        <p role="alert" className="text-sm text-danger-foreground">
          Your session expired — please sign in again.
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state?.error ? (
        <p role="alert" className="text-sm text-danger-foreground">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Log in
      </Button>
    </form>
  );
}
