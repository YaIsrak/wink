"use client";

import * as React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("wink-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("wink-theme", "light");
    }
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="size-9" disabled>
        <SunIcon className="size-4 opacity-50" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-9"
      onClick={toggleTheme}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <SunIcon className="size-4 text-amber-400 transition-transform duration-200" />
      ) : (
        <MoonIcon className="size-4 text-foreground transition-transform duration-200" />
      )}
    </Button>
  );
}
