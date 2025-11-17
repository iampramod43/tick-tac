"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { useState, useEffect } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
  showText?: boolean;
}

const sizeMap = {
  sm: { logo: 24, text: "text-xl" },
  md: { logo: 32, text: "text-2xl" },
  lg: { logo: 40, text: "text-4xl" },
  xl: { logo: 48, text: "text-5xl" },
};

export function Logo({
  size = "lg",
  className,
  animated = true,
  showText = true,
}: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which logo to use based on theme
  const currentTheme = resolvedTheme || theme || "dark";
  const logoSrc = currentTheme === "dark" ? "/DB.svg" : "/WB.svg";

  // Render a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("inline-flex items-center gap-3", className)}>
        <div className="relative flex-shrink-0">
          <Image
            src="/DB.svg"
            alt="TickTac Logo"
            width={sizeMap[size].logo}
            height={sizeMap[size].logo}
            className="w-auto h-auto"
            priority
          />
        </div>
        {showText && (
          <span
            className={cn(
              "font-bold bg-gradient-to-r from-[var(--color-accent-mint)] to-[var(--color-accent-teal)] bg-clip-text text-transparent",
              sizeMap[size].text
            )}
          >
            TickTac
          </span>
        )}
      </div>
    );
  }

  const { logo: logoSize, text: textSize } = sizeMap[size];

  const LogoImage = animated ? motion.div : "div";
  const LogoText = animated ? motion.span : "span";

  const logoAnimation = animated
    ? {
        whileHover: {
          scale: 1.05,
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.3 }
        },
      }
    : {};

  const textAnimation = animated
    ? {
        whileHover: {
          scale: 1.02,
          transition: { duration: 0.2 }
        },
      }
    : {};

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <LogoImage
        {...logoAnimation}
        className="relative flex-shrink-0"
      >
        <Image
          src={logoSrc}
          alt="TickTac Logo"
          width={logoSize}
          height={logoSize}
          className="w-auto h-auto"
          priority
        />
      </LogoImage>
      {showText && (
        <LogoText
          {...textAnimation}
          className={cn(
            "font-bold bg-gradient-to-r from-[var(--color-accent-mint)] to-[var(--color-accent-teal)] bg-clip-text text-transparent",
            textSize
          )}
        >
          TickTac
        </LogoText>
      )}
    </div>
  );
}
