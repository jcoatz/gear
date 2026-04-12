"use client";

import Link from "next/link";
import { Backpack } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        router.push(nextPath);
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        router.push(nextPath);
        router.refresh();
        return;
      }
      setInfo(
        "Check your email to confirm your account, then sign in here.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-g-input-border bg-g-input px-3 text-sm text-g-text placeholder:text-g-text-3 focus:border-g-border-active focus:outline-none focus:ring-1 focus:ring-g-accent-surface";

  return (
    <div className="w-full max-w-md rounded-2xl border border-g-border bg-g-card backdrop-blur-md">
      <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-g-accent-surface text-g-accent">
          <Backpack size={24} strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold text-g-text">
          {mode === "sign-in" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm text-g-text-3">
          {mode === "sign-in"
            ? "Sign in to access your gear inventory."
            : "Create an account to start tracking your gear."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="px-6 py-6 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="text-sm font-medium text-g-text-2">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="auth-password" className="text-sm font-medium text-g-text-2">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={inputClass}
          />
          <p className="text-xs text-g-text-4">At least 6 characters.</p>
        </div>

        {error ? (
          <p className="rounded-lg border border-g-error-border bg-g-error-bg px-3 py-2 text-sm text-g-error-text">
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {info}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-g-accent-hover px-5 py-2.5 text-sm font-semibold text-g-accent transition-colors hover:bg-g-accent-hover disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "sign-in"
                ? "Sign in"
                : "Sign up"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"));
              setError(null);
              setInfo(null);
            }}
            className="text-sm text-g-text-3 transition-colors hover:text-g-text-2"
          >
            {mode === "sign-in"
              ? "Need an account? Sign up"
              : "Have an account? Sign in"}
          </button>
        </div>
      </form>

      <div className="border-t border-g-border px-6 py-4 text-center">
        <Link href="/" className="text-sm text-g-text-3 underline underline-offset-4 hover:text-g-text-2">
          Back to home
        </Link>
      </div>
    </div>
  );
}
