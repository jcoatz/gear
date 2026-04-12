"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-stone-800/60 text-stone-400 ${className ?? ""}`}
        aria-label="Toggle theme"
      >
        <Moon size={16} />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
        isDark
          ? "border-white/[0.08] bg-stone-800/60 text-amber-400 hover:bg-stone-800 hover:text-amber-300"
          : "border-stone-300 bg-white text-amber-600 hover:bg-stone-50"
      } ${className ?? ""}`}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
