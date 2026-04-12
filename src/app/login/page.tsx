import { Mountain } from "lucide-react";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/gear";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-g-page p-6">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-gradient-to-br from-[var(--g-glow)] via-transparent to-g-page"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--g-dot) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div aria-hidden className="pointer-events-none fixed right-[5%] bottom-[10%]">
        <Mountain
          className="text-amber-500/[0.04]"
          size={200}
          strokeWidth={1}
        />
      </div>
      <div className="relative z-10">
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}
