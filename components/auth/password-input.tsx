"use client";

import * as React from "react";
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  checkPasswordCriteria,
  type PasswordCriteriaStatus,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showChecklist?: boolean;
  onlyShowOnFocus?: boolean;
  error?: boolean;
  onValidityChange?: (isValid: boolean) => void;
}

const CRITERIA_ITEMS: Array<{
  key: keyof PasswordCriteriaStatus;
  label: string;
}> = [
  { key: "minLength", label: "At least 8 characters" },
  { key: "hasUpper", label: "At least one uppercase letter (A-Z)" },
  { key: "hasLower", label: "At least one lowercase letter (a-z)" },
  { key: "hasNumber", label: "At least one number (0-9)" },
  { key: "hasSpecial", label: "At least one special symbol (!@#$%...)" },
];

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  (
    {
      className,
      value,
      onChange,
      onFocus,
      onBlur,
      showChecklist = false,
      onlyShowOnFocus = false,
      onValidityChange,
      error,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(
      typeof value === "string" ? value : "",
    );

    const currentValue = typeof value === "string" ? value : internalValue;
    const criteria = React.useMemo(
      () => checkPasswordCriteria(currentValue),
      [currentValue],
    );

    const isAllValid = React.useMemo(
      () => Object.values(criteria).every(Boolean),
      [criteria],
    );

    React.useEffect(() => {
      onValidityChange?.(isAllValid);
    }, [isAllValid, onValidityChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const shouldDisplayChecklist =
      showChecklist &&
      (!onlyShowOnFocus || isFocused || currentValue.length > 0);

    return (
      <div className="w-full space-y-2">
        <div className="relative">
          <input
            ref={ref}
            type={isVisible ? "text" : "password"}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 pr-10 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              error &&
                "border-destructive focus-visible:border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            disabled={disabled}
            aria-label={isVisible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none disabled:opacity-50"
          >
            {isVisible ? (
              <EyeSlashIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>

        {shouldDisplayChecklist && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs transition-all duration-200 mb-4">
            <p className="mb-2 font-medium text-foreground">
              Password requirements:
            </p>
            <ul className="space-y-1.5">
              {CRITERIA_ITEMS.map((item) => {
                const met = criteria[item.key];
                return (
                  <li
                    key={item.key}
                    className={cn(
                      "flex items-center gap-2 transition-colors duration-150",
                      met
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-500 dark:text-zinc-400",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full text-[10px]",
                        met
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 dark:border dark:border-emerald-800/60"
                          : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
                      )}
                    >
                      {met ? (
                        <CheckIcon className="size-2.5 stroke-[3]" />
                      ) : (
                        <XMarkIcon className="size-2.5 stroke-[2.5]" />
                      )}
                    </span>
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
