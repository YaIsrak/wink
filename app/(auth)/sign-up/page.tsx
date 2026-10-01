"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { checkPasswordCriteria } from "@/lib/validation/auth";
import { signUpAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

function WinkBrand() {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <Logo size={28} />
      <span className="text-xl font-bold tracking-tight text-foreground">
        Wink
      </span>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isPasswordValid = React.useMemo(() => {
    const criteria = checkPasswordCriteria(password);
    return Object.values(criteria).every(Boolean);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error("Please enter your display name");
      return;
    }

    if (!username.trim() || username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      toast.error(
        "Username can only contain letters, numbers, and underscores",
      );
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Please ensure your password meets all stated requirements");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUpAction({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      toast.success("Account created! Welcome to Wink.");
      router.push(result.redirectTo || "/onboarding");
      router.refresh();
    } catch {
      toast.error("Unable to create account. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full p-6 sm:p-8 space-y-6">
      <WinkBrand />

      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-xs text-muted-foreground">
          Welcome! Please enter your details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1.5">
          <label
            htmlFor="displayName"
            className="text-xs font-medium text-foreground"
          >
            Display Name
          </label>
          <Input
            id="displayName"
            type="text"
            placeholder="Jane Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="username"
            className="text-xs font-medium text-foreground"
          >
            Username
          </label>
          <Input
            id="username"
            type="text"
            placeholder="janedoe"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
              )
            }
            disabled={isSubmitting}
            required
          />
          <p className="text-[11px] text-muted-foreground">
            3 to 20 characters, lowercase letters, numbers, and underscores
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium text-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium text-foreground"
          >
            Password
          </label>
          <PasswordInput
            className="mb-4"
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showChecklist={true}
            onlyShowOnFocus={true}
            disabled={isSubmitting}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="w-full"
        >
          Sign up
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
