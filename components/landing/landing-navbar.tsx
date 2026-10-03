"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if user has scrolled past initial threshold
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down -> hide navbar
          setIsVisible(false);
        } else {
          // Scrolling up -> show navbar
          setIsVisible(true);
        }
      } else {
        // At top of page -> always show
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full",
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-xs"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg py-1 px-1.5 -ml-1.5 transition-opacity"
        >
          <Logo size={28} priority />
          <span className="font-extrabold text-xl tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
            wink
          </span>
          <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20">
            beta
          </span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground font-semibold px-3"
            >
              Log in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button
              size="sm"
              className="font-bold bg-primary text-primary-foreground hover:brightness-105 shadow-xs transition-transform active:scale-95"
            >
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
