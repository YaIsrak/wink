import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export function LandingFooter() {
  return (
    <footer className="relative border-t border-border bg-card/40 overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-gradient-to-t from-primary/10 via-secondary/5 to-transparent blur-[100px] pointer-events-none -z-10" />

      {/* Pre-Footer Final Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="relative rounded-3xl bg-neutral-950 text-white border border-neutral-800 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          {/* Subtle radial lights inside card */}
          <div className="absolute top-0 left-1/4 size-72 bg-primary/20 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 size-72 bg-secondary/25 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-6">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              Zero Regrets Sign Up
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              The internet used to be fun.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Let us make it weird again.
              </span>
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              No credit card. No phone number sold to third-party telemarketers.
              Just pick a username, drop an avatar, and start sharing with
              people who actually care.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto font-black text-base px-9 h-13 rounded-xl bg-primary text-black hover:brightness-105 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>Claim Your Handle</span>
                  <ArrowRightIcon className="size-4 ml-1 stroke-[3]" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-bold text-base px-7 h-13 rounded-xl border-neutral-700 bg-neutral-900/80 text-white hover:bg-neutral-800 transition-all"
                >
                  Log In Instead
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Metadata & Copyright */}
        <div className="mt-16 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <Logo size={22} priority={false} />
            <span className="font-bold text-sm text-foreground">wink</span>
            <span className="text-muted-foreground/60">•</span>
            <span>
              © 2026{" "}
              <Link
                className="text-secondary underline"
                href="https://yaserisrak.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                YaIsrak
              </Link>{" "}
              | Wink. All rights reserved.{" "}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/theme"
              className="hover:text-foreground transition-colors"
            >
              Design System
            </Link>
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="hover:text-foreground transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
