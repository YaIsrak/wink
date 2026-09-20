import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-20 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:border-white dark:focus-visible:ring-white",
          error &&
            "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500 dark:border-red-500 dark:focus-visible:border-red-500 dark:focus-visible:ring-red-500",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
