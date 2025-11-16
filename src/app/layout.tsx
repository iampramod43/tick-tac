import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/src/components/providers/ThemeProvider";
import { QueryProvider } from "@/src/components/providers/QueryProvider";
import { FlowModeProvider } from "@/src/context/FlowModeContext";

export const metadata: Metadata = {
  title: "TickTac - AI-Powered Productivity Hub",
  description: "Your intelligent task management and productivity companion. Organize tasks, track habits, manage time, and boost productivity with AI assistance.",
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
