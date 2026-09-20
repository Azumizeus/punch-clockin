import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,opacity] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg hover:bg-fg",
        secondary:
          "bg-surface-2 text-fg shadow-border hover:shadow-border-hover",
        ghost: "bg-transparent text-fg hover:bg-surface-2",
        paper: "bg-paper text-paper-fg hover:bg-fg",
        danger: "bg-bad/15 text-bad hover:bg-bad/25",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-[var(--cta-radius,0.5rem)]",
        md: "h-11 px-4 text-sm rounded-[var(--cta-radius,0.75rem)]",
        lg: "h-12 px-5 text-base rounded-[var(--cta-radius,1rem)]",
        icon: "size-11 rounded-[var(--cta-radius,0.75rem)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
