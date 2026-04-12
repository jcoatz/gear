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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-stone-950 p-6">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-stone-950"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
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
