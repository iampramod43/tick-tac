import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/src/components/providers/ThemeProvider";
import { QueryProvider } from "@/src/components/providers/QueryProvider";
import { FlowModeProvider } from "@/src/context/FlowModeContext";

export const metadata: Metadata = {
  title: "tickTac - Task Manager",
  description: "A modern task management application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/auth/login"
      signUpUrl="/auth/register"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <ThemeProvider>
            <QueryProvider>
              <FlowModeProvider>{children}</FlowModeProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
