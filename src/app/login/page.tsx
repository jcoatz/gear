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
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      {/* Subtle background decoration */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary/6 via-transparent to-amber-500/4"
      />
      <div aria-hidden className="pointer-events-none fixed right-[5%] bottom-[10%]">
        <Mountain
          className="text-primary/[0.05]"
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
