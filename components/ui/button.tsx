import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:focus-glow hover-lift",
  {
    variants: {
      variant: {
        default: "gradient-accent gradient-accent-glow text-[var(--color-black)] hover:shadow-[0_12px_40px_rgba(46,220,152,0.18)] rounded-[var(--radius-pill)]",
        destructive:
          "bg-[var(--color-danger)] text-[var(--color-white)] hover:bg-[var(--color-danger)]/90 focus-visible:ring-[var(--color-danger)]/20 rounded-[var(--radius-pill)]",
        outline:
          "border border-[rgba(255,255,255,0.06)] bg-transparent hover:bg-[rgba(255,255,255,0.04)] text-[var(--color-text-primary)] rounded-[var(--radius-md)]",
        secondary:
          "bg-transparent border border-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-[var(--radius-pill)]",
        ghost:
          "bg-[rgba(255,255,255,0.02)] text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)] rounded-[var(--radius-pill)]",
        link: "text-[var(--color-accent-mint)] underline-offset-4 hover:underline bg-transparent",
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
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
