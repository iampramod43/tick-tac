"use client";

import { useState, useEffect } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { Check, Sparkles, Calendar, Target, Zap, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import { clerkAppearance } from "@/src/lib/clerk-appearance";
import { motion } from "framer-motion";
import { Logo } from "@/src/components/branding/Logo";

// Sparkle component for magical effect
const Sparkle = ({
  delay = 0,
  style = {},
}: {
  delay?: number;
  style?: React.CSSProperties;
}) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: 1,
      ease: "easeInOut",
    }}
    style={style}
    className="absolute w-2 h-2 bg-(--color-accent-mint) rounded-full blur-[1px]"
  />
);

// Generate random particle data outside component to avoid purity issues
const generateParticleData = (seed: number) => {
  // Use seed to create deterministic but varied values
  const x = ((seed * 9301 + 49297) % 233280) / 2332.8;
  const y = (((seed + 1) * 9301 + 49297) % 233280) / 2332.8;
  const delay = (((seed + 2) * 9301 + 49297) % 233280) / 46656;
  const duration = 15 + (((seed + 3) * 9301 + 49297) % 233280) / 23328;
  const offsetX = (((seed + 4) * 9301 + 49297) % 233280) / 2332.8 - 50;
  const offsetY = (((seed + 5) * 9301 + 49297) % 233280) / 2332.8 - 50;

  return { x, y, delay, duration, offsetX, offsetY };
};

// Floating particle component for AI feel
const FloatingParticle = ({ index }: { index: number }) => {
  const data = generateParticleData(index);

  return (
    <motion.div
      initial={{ x: `${data.x}vw`, y: `${data.y}vh`, opacity: 0 }}
      animate={{
        x: [`${data.x}vw`, `${data.x + data.offsetX * 0.6}vw`, `${data.x}vw`],
        y: [`${data.y}vh`, `${data.y + data.offsetY * 0.6}vh`, `${data.y}vh`],
        opacity: [0, 0.6, 0],
      }}
      transition={{
        duration: data.duration,
        delay: data.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute w-1 h-1 bg-(--color-accent-mint) rounded-full blur-[2px]"
    />
  );
};

// AI Grid background
const AIGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ duration: 2 }}
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(var(--color-accent-mint) 1px, transparent 1px),
                         linear-gradient(90deg, var(--color-accent-mint) 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
        maskImage:
          "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 0%, transparent 70%)",
      }}
    />
    {/* Floating particles for AI effect */}
    {Array.from({ length: 15 }).map((_, i) => (
      <FloatingParticle key={i} index={i} />
    ))}
  </div>
);

export default function AuthPage() {
  const [mode, setMode] = useState<"landing" | "signin" | "signup">("landing");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Smart Task Management",
      description: "Organize your tasks with lists, priorities, and due dates",
    },
    {
      icon: Target,
      title: "Eisenhower Matrix",
      description: "Prioritize by urgency and importance",
    },
    {
      icon: Brain,
      title: "AI Assistant",
      description: "Get help with Tikku, your AI productivity assistant",
    },
    {
      icon: Zap,
      title: "Productivity Tools",
      description: "Pomodoro, habits, countdowns, and more",
    },
  ];

  if (mode === "signin") {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] p-4 overflow-hidden">
        <AIGrid />

        {/* Animated glow orb following cursor */}
        <motion.div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(94,247,166,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10 flex flex-col items-center"
        >
          {/* Sparkles around the card */}
          <Sparkle delay={0} style={{ top: -10, right: 20 }} />
          <Sparkle delay={0.5} style={{ bottom: -10, left: 30 }} />
          <Sparkle delay={1} style={{ top: 50, left: -10 }} />
          <Sparkle delay={1.5} style={{ bottom: 50, right: -10 }} />

          <div className="text-center mb-8 w-full">
            <Link href="/auth" onClick={() => setMode("landing")} className="inline-block mb-2">
              <Logo size="lg" animated={true} />
            </Link>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[var(--color-text-secondary)]"
            >
              Welcome back to your AI-powered productivity hub
            </motion.p>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="w-full flex justify-center"
          >
            <SignIn
              // appearance={clerkAppearance}
              routing="hash"
              signUpUrl="/auth/register"
              forceRedirectUrl="/"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6 w-full"
          >
            <Button
              variant="ghost"
              onClick={() => setMode("landing")}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              ← Back to home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (mode === "signup") {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] p-4 overflow-hidden">
        <AIGrid />

        {/* Animated glow orb following cursor */}
        <motion.div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(94,247,166,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10 flex flex-col items-center"
        >
          {/* Sparkles around the card */}
          <Sparkle delay={0} style={{ top: -10, right: 20 }} />
          <Sparkle delay={0.5} style={{ bottom: -10, left: 30 }} />
          <Sparkle delay={1} style={{ top: 50, left: -10 }} />
          <Sparkle delay={1.5} style={{ bottom: 50, right: -10 }} />
          <Sparkle delay={2} style={{ top: 100, right: -10 }} />

          <div className="text-center mb-8 w-full">
            <Link href="/auth" onClick={() => setMode("landing")} className="inline-block mb-2">
              <Logo size="lg" animated={true} />
            </Link>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[var(--color-text-secondary)]"
            >
              Start your journey with AI-powered productivity
            </motion.p>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="w-full flex justify-center"
          >
            <SignUp
              // appearance={clerkAppearance}
              routing="hash"
              signInUrl="/auth/login"
              afterSignUpUrl="/"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6 w-full"
          >
            <Button
              variant="ghost"
              onClick={() => setMode("landing")}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              ← Back to home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-linear-to-br from-(--color-bg-gradient-start) to-(--color-bg-gradient-end) overflow-hidden">
      <AIGrid />

      {/* Animated background orbs */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(94,247,166,0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(84,163,136,0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-(--color-glass-outline) glass-1">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Logo size="md" animated={true} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="ghost"
              onClick={() => setMode("signin")}
              className="text-(--color-text-primary)"
            >
              Sign In
            </Button>
            <Button
              onClick={() => setMode("signup")}
              className="bg-(--color-accent-mint) text-(--color-black) hover:opacity-90 shadow-[0_8px_30px_rgba(94,247,166,0.2)]"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Floating sparkles */}
          <Sparkle delay={0} style={{ top: 0, left: "10%" }} />
          <Sparkle delay={0.5} style={{ top: 20, right: "15%" }} />
          <Sparkle delay={1} style={{ bottom: 0, left: "20%" }} />
          <Sparkle delay={1.5} style={{ bottom: 20, right: "10%" }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-1 border border-(--color-glass-outline) mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-4 h-4 text-(--color-accent-mint)" />
              </motion.div>
              <span className="text-sm text-(--color-text-secondary)">
                Powered by AI
              </span>
            </motion.div>

            <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-(--color-text-primary) via-(--color-accent-mint) to-(--color-accent-teal) bg-clip-text text-transparent">
              Your Productivity
              <br />
              <motion.span
                className="inline-block bg-clip-text text-transparent"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundSize: "200% auto",
                  backgroundImage:
                    "linear-gradient(90deg, var(--color-accent-mint), var(--color-accent-teal), var(--color-accent-mint))",
                }}
              >
                Command Center
              </motion.span>
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-(--color-text-secondary) mb-12 max-w-2xl mx-auto"
            >
              Organize tasks, track habits, manage time, and boost productivity
              with AI-powered assistance. Everything you need in one beautiful
              app.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-4 flex-wrap"
            >
              <Button
                size="lg"
                onClick={() => setMode("signup")}
                className="bg-(--color-accent-mint) text-(--color-black) hover:opacity-90 text-lg px-8 py-6 shadow-[0_8px_30px_rgba(94,247,166,0.3)] hover:shadow-[0_12px_40px_rgba(94,247,166,0.4)] transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setMode("signin")}
                className="border-(--color-glass-outline) text-(--color-text-primary) hover:bg-[rgba(255,255,255,0.04)] text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 text-(--color-text-primary)"
          >
            Everything you need to stay productive
          </motion.h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="glass-1 border border-(--color-glass-outline) rounded-lg p-6 hover:border-(--color-accent-mint)/30 transition-all relative group"
                >
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-linear-to-br from-(--color-accent-mint)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                  <div className="relative z-10">
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-[rgba(94,247,166,0.1)] flex items-center justify-center mb-4"
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-6 w-6 text-(--color-accent-mint)" />
                    </motion.div>
                    <h4 className="text-lg font-semibold mb-2 text-(--color-text-primary)">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-(--color-text-muted)">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass-1 border border-(--color-glass-outline) rounded-lg p-12 relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-linear-to-br from-(--color-accent-mint)/10 to-(--color-accent-teal)/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            initial={false}
          />
          <div className="relative z-10">
            <Sparkle delay={0} style={{ top: 10, left: "15%" }} />
            <Sparkle delay={0.7} style={{ top: 20, right: "10%" }} />
            <Sparkle delay={1.4} style={{ bottom: 10, left: "10%" }} />

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-4 text-(--color-text-primary)"
            >
              Ready to boost your productivity?
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-(--color-text-secondary) mb-8"
            >
              Join thousands of users who are already getting more done with
              tickTac
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Button
                size="lg"
                onClick={() => setMode("signup")}
                className="bg-(--color-accent-mint) text-black hover:opacity-90 text-lg px-8 py-6 shadow-[0_8px_30px_rgba(94,247,166,0.3)] hover:shadow-[0_12px_40px_rgba(94,247,166,0.4)] transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-(--color-glass-outline) glass-1 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm text-(--color-text-muted)"
            >
              © 2024 tickTac. All rights reserved.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-6"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("signin")}
                className="text-(--color-text-muted) hover:text-(--color-text-primary)"
              >
                Sign In
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("signup")}
                className="text-(--color-text-muted) hover:text-(--color-text-primary)"
              >
                Sign Up
              </Button>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
