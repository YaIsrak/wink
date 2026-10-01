import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  size?: number;
  alt?: string;
  priority?: boolean;
}

export function Logo({
  className,
  size = 32,
  alt = "Wink logo",
  priority = true,
}: LogoProps) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-dark.png"
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-contain dark:hidden"
      />
      <Image
        src="/logo-light.png"
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className="hidden h-full w-full object-contain dark:block"
      />
    </div>
  );
}
