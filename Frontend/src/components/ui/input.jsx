import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-neutral-700 dark:file:text-neutral-300 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 selection:bg-primary selection:text-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600",
        "flex h-11 w-full min-w-0 rounded-xl border-[1.5px] bg-white px-4 py-3 text-base font-medium shadow-sm",
        "transition-all duration-300 ease-out outline-none",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "hover:border-accent/40 hover:shadow-md",
        "focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/15 focus-visible:shadow-lg",
        "dark:focus-visible:ring-offset-neutral-900",
        "aria-invalid:border-error aria-invalid:focus-visible:ring-error/20 dark:aria-invalid:ring-error/40",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100 dark:disabled:bg-neutral-700",
        className
      )}
      {...props} />
  );
}

export { Input }
