import * as React from "react";
import {
  BENTO_FEATURES,
  PLATFORM_STATS,
} from "@/lib/data/landing-fixtures";
import {
  ChatBubbleLeftRightIcon,
  BoltIcon,
  EyeSlashIcon,
  PaintBrushIcon,
  CheckIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

export function BentoGrid() {
  return (
    <section id="features" className="py-20 md:py-32 relative">
      {/* Decorative background grid line accents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div id="manifesto" className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-bold text-secondary mb-4 uppercase tracking-wider">
            Built for humans, not focus groups
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-5">
            Four promises we will never break.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Most social apps optimize for outrage because angry people click
            more ads. We do not sell ads, so we can just build something that feels
            good to use.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-20">
          {/* Card 1: Mutuals Only DMs (spans 7 cols on lg) */}
          <div className="lg:col-span-7 rounded-3xl bg-card border border-border p-7 sm:p-9 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-secondary/40 transition-colors">
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 size-64 bg-secondary/10 blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/25">
                  <LockClosedIcon className="size-3.5" />
                  {BENTO_FEATURES[0].badge}
                </span>
                <ChatBubbleLeftRightIcon className="size-6 text-muted-foreground group-hover:text-secondary transition-colors" />
              </div>

              <h3 className="text-2xl font-black text-foreground mb-2">
                {BENTO_FEATURES[0].title}
              </h3>
              <p className="text-sm font-semibold text-secondary mb-3">
                {BENTO_FEATURES[0].punchline}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {BENTO_FEATURES[0].description}
              </p>
            </div>

            {/* Visual Chat Mockup Preview */}
            <div className="w-full rounded-2xl bg-muted/60 border border-border/80 p-4 space-y-3 font-sans select-none">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-2">
                <span className="font-mono text-[11px]">inbox gate status</span>
                <span className="text-primary font-bold flex items-center gap-1">
                  <CheckIcon className="size-3.5 stroke-[3]" /> Mutual Follow Verified
                </span>
              </div>

              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground text-xs font-medium rounded-2xl rounded-br-xs px-3.5 py-2 max-w-[80%] shadow-xs">
                  Hey! Coffee place on 4th still open?
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-card border border-border text-foreground text-xs font-medium rounded-2xl rounded-bl-xs px-3.5 py-2 max-w-[80%] shadow-xs">
                  Yeah until 9pm! Grabbing a seat right now.
                </div>
              </div>

              {/* Rejected Stranger Mockup */}
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 flex items-center justify-between text-xs text-destructive">
                <span className="font-medium truncate">
                  Unfollowed stranger wants to chat
                </span>
                <span className="font-mono text-[10px] uppercase font-bold bg-destructive/20 px-2 py-0.5 rounded-sm">
                  Blocked
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Zero Algorithmic Sludge (spans 5 cols on lg) */}
          <div className="lg:col-span-5 rounded-3xl bg-card border border-border p-7 sm:p-9 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-colors">
            <div className="absolute -bottom-8 -left-8 size-48 bg-primary/10 blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary/15 text-foreground border border-primary/25">
                  <EyeSlashIcon className="size-3.5 text-primary" />
                  {BENTO_FEATURES[1].badge}
                </span>
                <BoltIcon className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <h3 className="text-2xl font-black text-foreground mb-2">
                {BENTO_FEATURES[1].title}
              </h3>
              <p className="text-sm font-semibold text-primary mb-3">
                {BENTO_FEATURES[1].punchline}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {BENTO_FEATURES[1].description}
              </p>
            </div>

            {/* Visual Feed Timeline */}
            <div className="rounded-2xl bg-muted/60 border border-border/80 p-4 space-y-2.5 font-mono text-xs select-none">
              <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-card border border-border/60">
                <span className="text-foreground font-semibold">@leo_k</span>
                <span className="text-muted-foreground">Just now</span>
              </div>
              <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-card border border-border/60">
                <span className="text-foreground font-semibold">@miravance</span>
                <span className="text-muted-foreground">4m ago</span>
              </div>
              <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-card border border-border/60 opacity-60">
                <span className="text-foreground font-semibold">@sora_wave</span>
                <span className="text-muted-foreground">12m ago</span>
              </div>
            </div>
          </div>

          {/* Card 3: Snappy Realtime Reactivity (spans 5 cols on lg) */}
          <div className="lg:col-span-5 rounded-3xl bg-card border border-border p-7 sm:p-9 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-emerald-400/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  {BENTO_FEATURES[2].badge}
                </span>
                <BoltIcon className="size-6 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
              </div>

              <h3 className="text-2xl font-black text-foreground mb-2">
                {BENTO_FEATURES[2].title}
              </h3>
              <p className="text-sm font-semibold text-emerald-400 mb-3">
                {BENTO_FEATURES[2].punchline}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {BENTO_FEATURES[2].description}
              </p>
            </div>

            {/* Visual Realtime Pill */}
            <div className="rounded-2xl bg-muted/60 border border-border/80 p-4 flex items-center justify-between font-mono text-xs select-none">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-foreground">WebSocket Live</span>
              </div>
              <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                Optimistic &lt;50ms
              </span>
            </div>
          </div>

          {/* Card 4: OLED Black & Neon (spans 7 cols on lg) */}
          <div className="lg:col-span-7 rounded-3xl bg-card border border-border p-7 sm:p-9 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-secondary/40 transition-colors">
            <div className="absolute top-1/2 -right-12 size-60 bg-gradient-to-br from-primary/15 to-secondary/15 blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary/15 text-foreground border border-primary/25">
                  <PaintBrushIcon className="size-3.5 text-secondary" />
                  {BENTO_FEATURES[3].badge}
                </span>
                <span className="text-xs font-mono text-muted-foreground">#c9f997 • #e92ed3</span>
              </div>

              <h3 className="text-2xl font-black text-foreground mb-2">
                {BENTO_FEATURES[3].title}
              </h3>
              <p className="text-sm font-semibold text-secondary mb-3">
                {BENTO_FEATURES[3].punchline}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {BENTO_FEATURES[3].description}
              </p>
            </div>

            {/* Visual Color Palette Swatches */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl p-3 bg-black border border-neutral-800 text-white flex flex-col justify-between">
                <span className="text-[10px] font-mono text-neutral-400">Pure Black</span>
                <span className="text-xs font-mono font-bold mt-3">#000000</span>
              </div>
              <div className="rounded-xl p-3 bg-primary text-primary-foreground flex flex-col justify-between">
                <span className="text-[10px] font-mono opacity-80">Electric Lime</span>
                <span className="text-xs font-mono font-bold mt-3">#c9f997</span>
              </div>
              <div className="rounded-xl p-3 bg-secondary text-secondary-foreground flex flex-col justify-between">
                <span className="text-[10px] font-mono opacity-80">Hot Magenta</span>
                <span className="text-xs font-mono font-bold mt-3">#e92ed3</span>
              </div>
              <div className="rounded-xl p-3 bg-neutral-900 border border-neutral-800 text-white flex flex-col justify-between">
                <span className="text-[10px] font-mono text-neutral-400">Inter Sans</span>
                <span className="text-xs font-mono font-bold mt-3">Typography</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stat Banner */}
        <div className="rounded-3xl bg-surface-container-high border border-border p-8 sm:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label} className="space-y-1.5">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <div className="text-sm font-bold text-foreground">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
