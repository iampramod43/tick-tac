'use client';

import { useState } from 'react';
import { SignIn, SignUp } from '@clerk/nextjs';
import { Check, Sparkles, Calendar, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/src/lib/utils';
import { clerkAppearance } from '@/src/lib/clerk-appearance';

export default function AuthPage() {
  const [mode, setMode] = useState<'landing' | 'signin' | 'signup'>('landing');

  const features = [
    {
      icon: Calendar,
      title: 'Smart Task Management',
      description: 'Organize your tasks with lists, priorities, and due dates',
    },
    {
      icon: Target,
      title: 'Eisenhower Matrix',
      description: 'Prioritize by urgency and importance',
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'Get help with Tikku, your AI productivity assistant',
    },
    {
      icon: Zap,
      title: 'Productivity Tools',
      description: 'Pomodoro, habits, countdowns, and more',
    },
  ];

  if (mode === 'signin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/auth" onClick={() => setMode('landing')}>
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
              onClick={() => setMode('landing')}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              ← Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/auth" onClick={() => setMode('landing')}>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--color-accent-mint)] to-[var(--color-accent-teal)] bg-clip-text text-transparent mb-2">
                tickTac
              </h1>
            </Link>
            <p className="text-[var(--color-text-secondary)]">Create your account</p>
          </div>
          <SignUp
            appearance={clerkAppearance}
            routing="hash"
            signInUrl="/auth/login"
            afterSignUpUrl="/"
          />
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => setMode('landing')}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              ← Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)]">
      {/* Header */}
      <header className="border-b border-[var(--color-glass-outline)] glass-1">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-[var(--color-accent-mint)] to-[var(--color-accent-teal)] bg-clip-text text-transparent">
            tickTac
          </h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setMode('signin')}
              className="text-[var(--color-text-primary)]"
            >
              Sign In
            </Button>
            <Button
              onClick={() => setMode('signup')}
              className="bg-[var(--color-accent-mint)] text-[var(--color-black)] hover:opacity-90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[var(--color-text-primary)] via-[var(--color-accent-mint)] to-[var(--color-accent-teal)] bg-clip-text text-transparent">
            Your Productivity
            <br />
            Command Center
          </h2>
          <p className="text-xl text-[var(--color-text-secondary)] mb-12 max-w-2xl mx-auto">
            Organize tasks, track habits, manage time, and boost productivity with AI-powered assistance.
            Everything you need in one beautiful app.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setMode('signup')}
              className="bg-[var(--color-accent-mint)] text-[var(--color-black)] hover:opacity-90 text-lg px-8 py-6"
            >
              Start Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setMode('signin')}
              className="border-[var(--color-glass-outline)] text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)] text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-[var(--color-text-primary)]">
            Everything you need to stay productive
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="glass-1 border border-[var(--color-glass-outline)] rounded-lg p-6 hover:border-[var(--color-accent-mint)]/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-[rgba(94,247,166,0.1)] flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-[var(--color-accent-mint)]" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center glass-1 border border-[var(--color-glass-outline)] rounded-lg p-12">
          <h3 className="text-4xl font-bold mb-4 text-[var(--color-text-primary)]">
            Ready to boost your productivity?
          </h3>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8">
            Join thousands of users who are already getting more done with tickTac
          </p>
          <Button
            size="lg"
            onClick={() => setMode('signup')}
            className="bg-[var(--color-accent-mint)] text-[var(--color-black)] hover:opacity-90 text-lg px-8 py-6"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-glass-outline)] glass-1 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">
              © 2024 tickTac. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('signin')}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                Sign In
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('signup')}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

