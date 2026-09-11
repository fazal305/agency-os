"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENCY_NAV, PORTAL_NAV } from "@/lib/nav";
import { signOut } from "@/lib/supabase/actions";

const NAV_SETS = { agency: AGENCY_NAV, portal: PORTAL_NAV };

function NavLink({ item, pathname, onNavigate }) {
  const isActive =
    item.href === pathname || (item.href !== "/dashboard" && item.href !== "/portal" && pathname.startsWith(`${item.href}/`));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {item.label}
    </Link>
  );
}

/**
 * Shared sidebar + topbar shell for both the agency dashboard and the client
 * portal. `nav` decides which link set renders; everything else (mobile
 * drawer, active link state) is identical between the two areas by design —
 * the client should recognize the same structure the agency team works in.
 */
export function AppShell({ navKey, brandLabel, brandHref, userLabel, children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = NAV_SETS[navKey];

  const sidebarContent = (
    <>
      <Link href={brandHref} className="flex items-center gap-2 px-3 py-4">
        <span className="font-heading text-lg tracking-tight text-sidebar-foreground">
          Agency OS
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 px-2" aria-label={`${brandLabel} navigation`}>
        {nav.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        ))}
      </nav>
      {userLabel ? (
        <div className="flex items-center justify-between gap-2 border-t border-sidebar-border px-3 py-3">
          <span className="truncate text-sm text-sidebar-foreground/80">{userLabel}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent"
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-foreground hover:bg-accent"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-heading text-base tracking-tight">Agency OS</span>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
