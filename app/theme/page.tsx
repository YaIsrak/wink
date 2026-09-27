"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Heart,
  MessageCircle,
  Search,
  Send,
  MoreHorizontal,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Share2,
  Trash2,
  Settings,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function ThemePreviewPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(42);
  const [inputValue, setInputValue] = React.useState("");
  const [hasInputError, setHasInputError] = React.useState(false);

  const toggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      if (next) {
        toast.success("Post liked!", {
          description: "Your like was recorded.",
        });
      }
      return next;
    });
  };

  const handleSimulateAction = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      toast.success("Action complete", {
        description: "Simulated server response finished successfully.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-12">
        {/* Page Header (No Navbar) */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex size-7 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-bold tracking-tighter">
                W
              </span>
              <Badge variant="outline" size="sm">
                Tailwind v4
              </Badge>
              <Badge variant="default" size="sm">
                Monochrome Minimal
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Design System &amp; Component Gallery
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Live interactive preview of typography, enhanced corner radii,
              hairline borders, state transitions, Sonner toasts, and feedback
              states.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <ThemeToggle />
          </div>
        </section>

        {/* 1. Typography */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">
              1. Typography Scale (Inter)
            </h3>
            <span className="text-xs text-muted-foreground">
              Bifurcated font weights &amp; optical tracking
            </span>
          </div>
          <Card className="divide-y divide-border overflow-hidden">
            <div className="py-4">
              <span className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                Display Lg · 48px · Bold (-0.03em)
              </span>
              <p className="text-4xl sm:text-5xl font-bold tracking-[-0.03em]">
                Share what matters.
              </p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                Headline Lg · 32px · Semi-Bold (-0.02em)
              </span>
              <p className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em]">
                Wink feeds and direct messaging
              </p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                Headline Md · 24px · Semi-Bold (-0.015em)
              </span>
              <p className="text-xl sm:text-2xl font-semibold tracking-[-0.015em]">
                Mutual connections only
              </p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                Headline Sm · 18px · Semi-Bold (-0.01em)
              </span>
              <p className="text-lg font-semibold tracking-[-0.01em]">
                Getting started with your profile
              </p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                Body Lg · 16px · Regular
              </span>
              <p className="text-base text-foreground">
                Users sign up, complete onboarding, post photos and captions,
                and engage with followers.
              </p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                Body Md · 14px · Regular
              </span>
              <p className="text-sm text-foreground">
                Optimistic mutations update the interface immediately while
                server verification happens quietly.
              </p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                Caption / Muted · 12px · Regular
              </span>
              <p className="text-xs text-muted-foreground">
                Posted 2 hours ago · Mutual follow · 42 likes
              </p>
            </div>
          </Card>
        </section>

        {/* 2. Buttons & Animated States */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">
              2. Buttons &amp; Interactive States
            </h3>
            <span className="text-xs text-muted-foreground">
              Standard 6px radius · Active scale micro-pop
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Variants</CardTitle>
                <CardDescription>
                  All standard button appearances
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button variant="default">Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link Style</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sizes &amp; States</CardTitle>
                <CardDescription>
                  Sizes, loading spinner, disabled, icons
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small (32px)</Button>
                <Button size="default">Default (40px)</Button>
                <Button size="lg">Large (44px)</Button>
                <Button size="icon" variant="outline" title="Search">
                  <Search className="size-4" />
                </Button>
                <Button size="icon-sm" variant="ghost" title="Options">
                  <MoreHorizontal className="size-4" />
                </Button>
                <Button
                  variant="default"
                  isLoading={btnLoading}
                  onClick={handleSimulateAction}
                >
                  {btnLoading ? "Processing" : "Simulate Async"}
                </Button>
                <Button disabled variant="secondary">
                  Disabled
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. Toasts (Sonner) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">
              3. Feedback Toasts (Sonner)
            </h3>
            <span className="text-xs text-muted-foreground">
              Consistent response feedback
            </span>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    toast.success("Profile updated", {
                      description: "Your bio and avatar have been saved.",
                    })
                  }
                >
                  <CheckCircle2 className="size-4 text-emerald-500 mr-1" />
                  Success Toast
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    toast.error("Failed to post", {
                      description:
                        "Only mutual follows can send direct messages.",
                    })
                  }
                >
                  <AlertCircle className="size-4 text-red-500 mr-1" />
                  Error Toast
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    toast.info("New notification", {
                      description: "@alex started following you.",
                    })
                  }
                >
                  <Bell className="size-4 text-zinc-500 mr-1" />
                  Info Toast
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const promise = () =>
                      new Promise((resolve) => setTimeout(resolve, 2000));
                    toast.promise(promise, {
                      loading: "Uploading image...",
                      success: "Image published to feed!",
                      error: "Upload failed. Please retry.",
                    });
                  }}
                >
                  <Sparkles className="size-4 text-amber-500 mr-1" />
                  Promise Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Form Controls & Search */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">
              4. Form Inputs &amp; Search
            </h3>
            <span className="text-xs text-muted-foreground">
              Crisp hairline borders · Solid focus ring
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Standard Input
                </label>
                <Input
                  placeholder="e.g. username, email..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Validation State
                  </label>
                  <button
                    onClick={() => setHasInputError(!hasInputError)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Toggle Error
                  </button>
                </div>
                <Input
                  placeholder="Required field"
                  error={hasInputError}
                  defaultValue={hasInputError ? "invalid_username" : ""}
                />
                {hasInputError && (
                  <p className="text-xs text-red-500 mt-1">
                    Username is already taken.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Search Bar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users or captions..."
                    className="pl-9 pr-8"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
                    ⌘K
                  </span>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Textarea (Post Composer)
                </label>
                <Textarea
                  placeholder="What's happening? Share a caption..."
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="theme-cb"
                    defaultChecked
                    className="size-4 rounded border-border text-primary focus:ring-ring bg-card"
                  />
                  <label
                    htmlFor="theme-cb"
                    className="text-sm cursor-pointer select-none"
                  >
                    Notify followers
                  </label>
                </div>

                <Button size="sm" variant="default">
                  <Send className="size-3.5 mr-1" />
                  Post
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* 5. Avatars & Presence Badges */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">
              5. Avatars &amp; Badges
            </h3>
            <span className="text-xs text-muted-foreground">
              DM presence indicator dots · Pill badges
            </span>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col items-center gap-1.5">
                  <Avatar size="sm" fallback="JD" status="online" />
                  <span className="text-[11px] text-muted-foreground">
                    Online (sm)
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <Avatar size="md" fallback="WK" status="away" />
                  <span className="text-[11px] text-muted-foreground">
                    Away (md)
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <Avatar size="lg" fallback="IS" status="offline" />
                  <span className="text-[11px] text-muted-foreground">
                    Offline (lg)
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <Avatar
                    size="xl"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
                    alt="Photo profile"
                    status="online"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Image (xl)
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex flex-wrap items-center gap-3">
                <Badge variant="default">Black Capsule</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Alert</Badge>
                <Badge variant="success">Mutual</Badge>
                <Badge variant="default" size="pill">
                  3
                </Badge>
                <Badge variant="destructive" size="pill">
                  9+
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 6. Overlays: Dialog & Dropdown Menu */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">
              6. Dialogs &amp; Dropdown Menus
            </h3>
            <span className="text-xs text-muted-foreground">
              Dual-edge containment · Razor-sharp elevation
            </span>
          </div>

          <Card>
            <CardContent className="pt-6 flex flex-wrap items-center gap-4">
              <Button variant="default" onClick={() => setDialogOpen(true)}>
                Open Dialog Modal
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreHorizontal className="size-4 mr-2" />
                    Open Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="left">
                  <DropdownMenuItem onClick={() => toast("Profile clicked")}>
                    <User className="size-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast("Share link copied")}>
                    <Share2 className="size-4 mr-2" />
                    Share Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast("Settings opened")}>
                    <Settings className="size-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    destructive
                    onClick={() => toast.error("Account logged out")}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogHeader>
                  <DialogTitle>Confirm Unfollow</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to unfollow @alex? You will no longer
                    be mutual follows and real-time direct messages will be
                    paused.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDialogOpen(false);
                      toast.error("Unfollowed @alex");
                    }}
                  >
                    Unfollow
                  </Button>
                </DialogFooter>
              </Dialog>
            </CardContent>
          </Card>
        </section>

        {/* 7. Skeleton Loading State & Micro-Interactions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">
              7. Skeleton Loading &amp; Feed Card Demo
            </h3>
            <span className="text-xs text-muted-foreground">
              Optimistic like animation · Zero blank states
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Feed Card */}
            <Card interactive className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar size="sm" fallback="JD" status="online" />
                  <div>
                    <span className="text-sm font-semibold hover:underline cursor-pointer">
                      jane_doe
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      2 hours ago
                    </span>
                  </div>
                </div>
                <Badge variant="outline" size="sm">
                  Mutual
                </Badge>
              </div>

              <p className="text-sm leading-relaxed">
                Just completed the onboarding flow! Loving the crisp monochrome
                aesthetic on Wink ✨
              </p>

              <div className="h-44 w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs border border-border">
                [Photo Attachment Preview]
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleLike}
                    className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Heart
                      className={`size-4 transition-transform ${
                        liked
                          ? "fill-red-500 text-red-500 animate-pop scale-110"
                          : "group-hover:scale-110"
                      }`}
                    />
                    <span
                      className={liked ? "font-medium text-foreground" : ""}
                    >
                      {likeCount}
                    </span>
                  </button>

                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="size-4" />
                    <span>8 comments</span>
                  </button>
                </div>

                <Button size="icon-sm" variant="ghost">
                  <Share2 className="size-3.5" />
                </Button>
              </div>
            </Card>

            {/* Skeleton Loading Card */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>

              <div className="space-y-2 py-1">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>

              <Skeleton className="h-44 w-full rounded-md" />

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="size-6 rounded-md" />
              </div>
            </Card>
          </div>
        </section>

        {/* 8. Gamification Touchpoints Preview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">
              8. Gamification Elements
            </h3>
            <span className="text-xs text-muted-foreground">
              Profile completion &amp; getting started checklist
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Completion Banner */}
            <Card className="space-y-3 bg-muted/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Profile Completion
                </span>
                <span className="text-xs font-bold font-mono">75%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500 w-[75%]" />
              </div>
              <p className="text-xs text-muted-foreground">
                Add an avatar to reach 100% and unlock your profile verification
                badge.
              </p>
            </Card>

            {/* Getting Started Checklist Item */}
            <Card className="space-y-3">
              <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                Getting Started Checklist (2 of 4)
              </span>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2 line-through text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  Complete onboarding profile
                </li>
                <li className="flex items-center gap-2 line-through text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  Follow 3 people
                </li>
                <li className="flex items-center gap-2 font-medium text-foreground">
                  <div className="size-3.5 rounded-full border border-border shrink-0" />
                  Create your first photo post
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="size-3.5 rounded-full border border-border shrink-0" />
                  Send your first direct message to a mutual
                </li>
              </ul>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
