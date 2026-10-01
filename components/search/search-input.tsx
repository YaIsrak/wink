"use client";

import * as React from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  onSubmit,
  isLoading = false,
  placeholder = "Search users, names, or captions...",
  className,
  autoFocus = false,
}: SearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onClear();
      inputRef.current?.blur();
    } else if (e.key === "Enter") {
      onSubmit?.();
    }
  };

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div className="absolute left-3.5 flex items-center pointer-events-none text-foreground">
        <MagnifyingGlassIcon className="size-4.5" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "w-full h-11 pl-10.5 pr-10 rounded-xl border border-input bg-card/60 backdrop-blur-xs text-sm text-foreground placeholder:text-muted-foreground shadow-xs transition-all",
          "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
        )}
      />

      <div className="absolute right-3 flex items-center">
        {isLoading ? (
          <ArrowPathIcon className="size-4 animate-spin text-muted-foreground" />
        ) : value.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Clear search input"
          >
            <XMarkIcon className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
