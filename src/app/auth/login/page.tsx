import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { clerkAppearance } from "@/src/lib/clerk-appearance";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/auth">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--color-accent-mint)] to-[var(--color-accent-teal)] bg-clip-text text-transparent mb-2">
              tickTac
            </h1>
          </Link>
          <p className="text-[var(--color-text-secondary)]">Welcome back</p>
        </div>
        <SignIn
          appearance={clerkAppearance}
          routing="hash"
          signUpUrl="/auth/register"
          forceRedirectUrl="/"
        />
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            asChild
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <Link href="/auth">← Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
