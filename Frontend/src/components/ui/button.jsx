import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-base disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-md hover:bg-primary-dark hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5",
        destructive:
          "bg-error text-white shadow-md hover:bg-error/80 focus-visible:ring-error/30 dark:focus-visible:ring-error/40",
        outline:
          "border border-primary text-primary bg-white dark:bg-neutral-800 dark:border-accent shadow-sm hover:border-accent hover:bg-secondary dark:hover:bg-neutral-700",
        secondary:
          "bg-secondary dark:bg-neutral-700 text-primary dark:text-accent shadow-sm hover:bg-secondary/80 dark:hover:bg-neutral-600",
        accent:
          "bg-accent text-white shadow-md hover:bg-accent-dark hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5",
        ghost:
          "text-primary dark:text-accent hover:bg-secondary dark:hover:bg-neutral-800 transition-colors duration-base",
        link: "text-primary dark:text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        md: "h-12 px-6 py-3 text-base has-[>svg]:px-4",
        lg: "h-14 rounded-lg px-8 py-4 text-lg has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-8",
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
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
