"use client";

import * as React from "react";
import Link from "next/link";
import { HERO_CYCLING_PHRASES } from "@/lib/data/landing-fixtures";
import { Button } from "@/components/ui/button";
import { MockPostCard } from "@/components/landing/mock-post-card";
import {
  SparklesIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export function HeroSection() {
  const [index, setIndex] = React.useState(0);
  const [isFading, setIsFading] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % HERO_CYCLING_PHRASES.length);
        setIsFading(false);
      }, 250);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  const currentPhrase = HERO_CYCLING_PHRASES[index];

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden">
      {/* Ambient Electric Mesh Gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-secondary/20 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent blur-[90px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Witty Typography & Call to Action */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Human Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-border text-xs font-semibold text-foreground mb-6 shadow-xs animate-in fade-in duration-500">
              <span className="flex size-2 rounded-full bg-primary animate-ping" />
              <span className="text-secondary font-bold">Unsponsored</span>
              <span className="text-muted-foreground">•</span>
              <span>The internet used to be fun. Let us fix that.</span>
            </div>

            {/* Main Headline with Animated Text Cycler */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.08] mb-6">
              Social media without the{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span
                  className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-300 to-secondary transition-all duration-300 transform ${
                    isFading
                      ? "opacity-0 -translate-y-2 blur-xs"
                      : "opacity-100 translate-y-0 blur-none"
                  }`}
                >
                  {currentPhrase}.
                </span>
                {/* Wavy subtle underline accent */}
                <span className="absolute bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-60" />
              </span>
            </h1>

            {/* Subtitle / Anti corporate manifesto */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed mb-8">
              Post random espresso photos at dawn. Like things because they made
              you grin, not because an algorithm held your friends hostage. DMs
              reserved strictly for mutual follows. Zero ads. Zero hustle gurus.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto font-black text-base px-8 h-13 rounded-xl bg-primary text-primary-foreground hover:brightness-105 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>Sign up</span>
                  <ArrowRightIcon className="size-4 ml-1 stroke-[3]" />
                </Button>
              </Link>

              <a href="#preview" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-bold text-base px-6 h-13 rounded-xl border-border hover:bg-muted text-foreground transition-all"
                >
                  <span>Poke Around First</span>
                </Button>
              </a>
            </div>

            {/* Micro Guarantees */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="size-4 text-primary" />
                <span>No sponsored post spam</span>
              </div>
              <div className="flex items-center gap-1.5">
                <SparklesIcon className="size-4 text-secondary" />
                <span>Mutuals only direct messaging</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>100% human crafted interface</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Mock Post Card */}
          <div
            id="preview"
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
              <MockPostCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
