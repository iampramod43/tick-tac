import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/src/components/providers/ThemeProvider";
import { QueryProvider } from "@/src/components/providers/QueryProvider";
import { FlowModeProvider } from "@/src/context/FlowModeContext";
import { ActionEngineProvider } from "@/src/providers/ActionEngineProvider";
import { NudgeToast } from "@/src/components/action-engine/NudgeToast";
import { MicroFlowPanel } from "@/src/components/action-engine/MicroFlowPanel";
import { DebriefModal } from "@/src/components/action-engine/DebriefModal";
import { IdleDetectionWrapper } from "@/src/components/action-engine/IdleDetectionWrapper";
import { FocusLockBanner } from "@/src/components/action-engine/FocusLockBanner";
import { AnimatedCursorHint } from "@/src/components/action-engine/AnimatedCursorHint";
import { AdaptiveTextGlow } from "@/src/components/action-engine/AdaptiveTextGlow";
import { AIMicroHandTap } from "@/src/components/action-engine/AIMicroHandTap";
import { SmartFadeContext } from "@/src/components/action-engine/SmartFadeContext";
import { AILineGuide } from "@/src/components/action-engine/AILineGuide";

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
              <ActionEngineProvider>
                <FlowModeProvider>
                  <IdleDetectionWrapper>
                    <FocusLockBanner />
                    <AnimatedCursorHint />
                    <AdaptiveTextGlow />
                    <AIMicroHandTap />
                    <SmartFadeContext />
                    <AILineGuide />
                    {children}
                    <NudgeToast />
                    <MicroFlowPanel />
                    <DebriefModal />
                  </IdleDetectionWrapper>
                </FlowModeProvider>
              </ActionEngineProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
