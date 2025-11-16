import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:focus-glow hover-lift shadow-lg backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "gradient-accent gradient-accent-glow text-[var(--color-black)] shadow-[0_8px_32px_rgba(94,247,166,0.25),0_0_16px_rgba(94,247,166,0.2)] hover:shadow-[0_12px_40px_rgba(94,247,166,0.35),0_0_24px_rgba(94,247,166,0.3)] rounded-[var(--radius-pill)]",
        destructive:
          "bg-[var(--color-danger)] text-[var(--color-white)] shadow-[0_8px_32px_rgba(226,74,106,0.25),0_0_16px_rgba(226,74,106,0.2)] hover:bg-[var(--color-danger)]/90 hover:shadow-[0_12px_40px_rgba(226,74,106,0.35),0_0_24px_rgba(226,74,106,0.3)] focus-visible:ring-[var(--color-danger)]/20 rounded-[var(--radius-pill)]",
        outline:
          "border border-[rgba(255,255,255,0.06)] bg-transparent shadow-[0_4px_16px_rgba(0,0,0,0.2),0_0_8px_rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.04)] hover:shadow-[0_8px_24px_rgba(255,255,255,0.1),0_0_16px_rgba(255,255,255,0.15)] text-[var(--color-text-primary)] rounded-[var(--radius-md)]",
        secondary:
          "bg-transparent border border-[rgba(255,255,255,0.06)] shadow-[0_4px_16px_rgba(0,0,0,0.2),0_0_8px_rgba(255,255,255,0.05)] hover:shadow-[0_8px_24px_rgba(255,255,255,0.1),0_0_16px_rgba(255,255,255,0.15)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-[var(--radius-pill)]",
        ghost:
          "bg-[rgba(255,255,255,0.02)] shadow-[0_4px_16px_rgba(0,0,0,0.15),0_0_8px_rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.04)] hover:shadow-[0_8px_24px_rgba(255,255,255,0.08),0_0_16px_rgba(255,255,255,0.12)] text-[var(--color-text-primary)] rounded-[var(--radius-pill)]",
        link: "text-[var(--color-accent-mint)] underline-offset-4 hover:underline bg-transparent shadow-none backdrop-blur-none",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-[var(--radius-pill)] gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-[var(--radius-pill)] px-8 has-[>svg]:px-6",
        icon: "size-11 rounded-[var(--radius-pill)]",
        "icon-sm": "size-9 rounded-[var(--radius-pill)]",
        "icon-lg": "size-12 rounded-[var(--radius-pill)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
