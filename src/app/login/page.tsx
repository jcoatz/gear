import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/gear";

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
