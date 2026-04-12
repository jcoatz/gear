"use client";

import { Backpack, Map, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "./theme-toggle";

type NavBarProps = {
  userEmail: string;
};

const NAV_ITEMS = [
  { href: "/gear", label: "Gear", icon: Backpack },
  { href: "/trips", label: "Trips", icon: Map },
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
    <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-stone-950/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-stone-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/gear" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 dark:bg-amber-500/15 dark:text-amber-400">
            <Backpack size={16} strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold tracking-tight text-stone-100 dark:text-stone-100">
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
                    ? "bg-white/[0.08] text-stone-100 dark:bg-white/[0.08] dark:text-stone-100"
                    : "text-stone-400 hover:text-stone-200 dark:text-stone-400 dark:hover:text-stone-200"
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
        <span className="hidden text-xs text-stone-500 sm:block">{userEmail}</span>
        <ThemeToggle />
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-stone-800/60 px-3 text-sm text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-300 dark:border-white/[0.08] dark:bg-stone-800/60"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
