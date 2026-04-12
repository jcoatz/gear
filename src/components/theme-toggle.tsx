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
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-g-input-border bg-g-input text-g-text-3 ${className ?? ""}`}
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
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-g-input-border bg-g-input text-g-accent transition-colors hover:bg-g-raised ${className ?? ""}`}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
