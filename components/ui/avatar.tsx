"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away" | null;
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
  xl: "size-20 text-xl font-medium",
};

const statusClasses = {
  online: "bg-emerald-500 ring-2 ring-background",
  away: "bg-amber-500 ring-2 ring-background",
  offline: "bg-zinc-400 ring-2 ring-background",
};

const statusSizeClasses = {
  sm: "size-2 right-0 bottom-0",
  md: "size-2.5 right-0 bottom-0",
  lg: "size-3.5 right-0.5 bottom-0.5",
  xl: "size-4 right-1 bottom-1",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { src, alt = "Avatar", fallback, size = "md", status, className, ...props },
    ref,
  ) => {
    const [imageError, setImageError] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold overflow-visible border border-border select-none",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="size-full rounded-full object-cover"
          />
        ) : (
          <span className="uppercase">
            {fallback || alt.slice(0, 2) || "U"}
          </span>
        )}

        {status && (
          <span
            className={cn(
              "absolute rounded-full",
              statusClasses[status],
              statusSizeClasses[size],
            )}
          />
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
