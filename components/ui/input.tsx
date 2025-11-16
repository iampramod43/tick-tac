import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--color-text-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] selection:bg-[var(--color-accent-mint)] selection:text-[var(--color-black)] h-11 w-full min-w-0 max-w-full rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 box-border",
        "focus-visible:border-[var(--color-accent-mint)]/30 focus-visible:shadow-[0_0_0_4px_rgba(94,247,166,0.08)]",
        "aria-invalid:ring-[var(--color-danger)]/20 aria-invalid:border-[var(--color-danger)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
