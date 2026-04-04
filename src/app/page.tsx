import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Gear</CardTitle>
          <CardDescription>
            Track outdoor gear with Supabase and Next.js.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/gear"
            className={cn(buttonVariants(), "flex-1 justify-center")}
          >
            Open gear list
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-1 justify-center",
            )}
          >
            Sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
