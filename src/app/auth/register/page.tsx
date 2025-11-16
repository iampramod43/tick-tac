import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { clerkAppearance } from "@/src/lib/clerk-appearance";
import { Logo } from "@/src/components/branding/Logo";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8 w-full">
          <Link href="/auth" className="inline-block mb-2">
            <Logo size="lg" animated={true} />
          </Link>
          <p className="text-[var(--color-text-secondary)]">
            Create your account
          </p>
        </div>
        <div className="w-full flex justify-center">
          <SignUp
            // appearance={clerkAppearance}
            routing="hash"
            signInUrl="/auth/login"
            afterSignUpUrl="/"
          />
        </div>
        <div className="text-center mt-6 w-full">
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
