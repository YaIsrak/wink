"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EllipsisHorizontalIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { logoutAction } from "@/actions/auth";

export interface UserNavCardProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export function UserNavCard({ user }: UserNavCardProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logoutAction();
      if (result.error) {
        toast.error(result.error);
        setIsLoggingOut(false);
        return;
      }
      toast.success("Signed out successfully");
      router.push(result.redirectTo || "/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors hover:bg-muted/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          aria-label="User account menu"
        >
          <div className="flex items-center gap-3">
            <Avatar
              src={user.avatarUrl}
              fallback={
                user.displayName?.slice(0, 2) ||
                user.username?.slice(0, 2) ||
                "WK"
              }
              size="md"
              status="online"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {user.displayName || user.username}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </div>
          <div className="flex size-7 shrink-0 items-center justify-end rounded-lg text-muted-foreground group-hover:bg-muted group-hover:text-foreground transition-colors ml-1">
            <EllipsisHorizontalIcon className="size-4" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="left"
        className="w-59 p-1.5 shadow-xl"
      >
        <Link href="/profile">
          <DropdownMenuItem>
            <UserIcon className="mr-2.5 size-4 text-muted-foreground" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem>
            <Cog6ToothIcon className="mr-2.5 size-4 text-muted-foreground" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between px-2.5 py-1.5 text-sm text-foreground">
          <span className="text-muted-foreground text-xs font-medium">
            Theme mode
          </span>
          <ThemeToggle />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          destructive
          onClick={handleLogout}
          className="text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          <ArrowRightStartOnRectangleIcon className="mr-2.5 size-4" />
          <span>{isLoggingOut ? "Signing out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
