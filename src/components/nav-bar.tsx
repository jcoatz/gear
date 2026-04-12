"use client";

import { Backpack, Briefcase, LayoutDashboard, Map, LogOut, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "./theme-toggle";

type NavBarProps = {
  userEmail: string;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/gear", label: "Gear", icon: Backpack },
  { href: "/bags", label: "Bags", icon: Briefcase },
  { href: "/trips", label: "Trips", icon: Map },
  { href: "/activities", label: "Activities", icon: Zap },
];

export function NavBar({ userEmail }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-g-border bg-g-page/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-g-accent-surface text-g-accent">
            <Backpack size={16} strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold tracking-tight text-g-text">
            Gear
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/[0.08] text-g-text"
                    : "text-g-text-3 hover:text-g-text"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Email + controls */}
        <span className="hidden text-xs text-g-text-3 sm:block">{userEmail}</span>
        <ThemeToggle />
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text-3 transition-colors hover:bg-g-raised hover:text-g-text-2"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
