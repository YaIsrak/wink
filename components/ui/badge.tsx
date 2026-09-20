import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-black text-white dark:bg-white dark:text-black",
        secondary:
          "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        outline:
          "border border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200",
        destructive: "bg-red-500 text-white dark:bg-red-600 dark:text-white",
        success:
          "bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs rounded-full min-h-[1.25rem]",
        sm: "px-1.5 py-0.2 text-[10px] rounded-full min-h-[1rem]",
        pill: "h-[18px] min-w-[18px] px-1 text-[11px] rounded-full tracking-wide",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
