"use client";

import * as React from "react";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { MOCK_POST_FIXTURE } from "@/lib/data/landing-fixtures";
import { cn } from "@/lib/utils";

export function MockPostCard({ className }: { className?: string }) {
  const [likes, setLikes] = React.useState(MOCK_POST_FIXTURE.initialLikes);
  const [isLiked, setIsLiked] = React.useState(false);
  const [likeAnimated, setLikeAnimated] = React.useState(false);
  const [copiedTip, setCopiedTip] = React.useState(false);

  const handleLikeToggle = () => {
    setIsLiked((prev) => !prev);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    setLikeAnimated(true);
    setTimeout(() => setLikeAnimated(false), 400);
  };

  const handleShareClick = () => {
    setCopiedTip(true);
    setTimeout(() => setCopiedTip(false), 2200);
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-md mx-auto rounded-2xl bg-card border border-border shadow-2xl p-5 select-none transition-all duration-300 hover:shadow-primary/5 hover:border-primary/40",
        className
      )}
    >
      {/* Decorative gradient flare behind card */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/30 to-secondary/30 -z-10 blur-xl opacity-60 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={cn(
                "size-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-inner ring-2 ring-background",
                MOCK_POST_FIXTURE.author.avatarGradient
              )}
            >
              MV
            </div>
            {/* Live Presence Dot */}
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-primary ring-2 ring-card" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">
                {MOCK_POST_FIXTURE.author.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-foreground border border-primary/25">
                <SparklesIcon className="size-2.5 text-secondary" />
                {MOCK_POST_FIXTURE.author.badgeText}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{MOCK_POST_FIXTURE.author.handle}</span>
              <span>•</span>
              <span>{MOCK_POST_FIXTURE.timeAgo}</span>
            </div>
          </div>
        </div>

        <span className="text-[11px] font-mono font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
          Live Mockup
        </span>
      </div>

      {/* Post Caption */}
      <p className="text-sm text-foreground leading-relaxed mb-4">
        {MOCK_POST_FIXTURE.caption}
      </p>

      {/* Abstract Pure CSS Photo Art */}
      <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden mb-4 border border-border/80 bg-neutral-900 group">
        {/* Layered Gradient Sunset & Mesh */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-900 via-amber-700 to-violet-950 opacity-90" />
        <div className="absolute -top-12 -left-12 size-48 rounded-full bg-primary/30 blur-2xl" />
        <div className="absolute -bottom-10 -right-10 size-48 rounded-full bg-secondary/40 blur-2xl" />

        {/* Abstract Geometric Composition */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg mb-3 transform -rotate-3 group-hover:rotate-0 transition-transform">
            <span className="text-3xl">☕️</span>
          </div>
          <span className="text-xs font-mono tracking-widest uppercase text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
            07:14 AM • UNFILTERED GRAIN
          </span>
        </div>

        {/* Polaroid Style Caption Strip */}
        <div className="absolute bottom-2.5 inset-x-2.5 bg-black/60 backdrop-blur-md rounded-lg py-1.5 px-3 flex items-center justify-between text-[11px] text-white/80 border border-white/10">
          <span>no algorithms were harmed</span>
          <span className="text-primary font-mono font-bold">100% human</span>
        </div>
      </div>

      {/* Interactive Action Bar */}
      <div className="flex items-center justify-between pt-1 pb-3 border-b border-border/60">
        <div className="flex items-center gap-4">
          {/* Like button */}
          <button
            type="button"
            onClick={handleLikeToggle}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
              isLiked
                ? "text-rose-500 bg-rose-500/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Click to test optimistic like"
          >
            {isLiked ? (
              <HeartSolidIcon
                className={cn(
                  "size-4 text-rose-500",
                  likeAnimated && "animate-pop"
                )}
              />
            ) : (
              <HeartIcon className="size-4" />
            )}
            <span>{likes}</span>
          </button>

          {/* Comment indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground px-2 py-1.5">
            <ChatBubbleLeftIcon className="size-4" />
            <span>{MOCK_POST_FIXTURE.comments.length}</span>
          </div>
        </div>

        {/* Share preview */}
        <div className="relative">
          <button
            type="button"
            onClick={handleShareClick}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            title="Share post"
          >
            <ShareIcon className="size-4" />
          </button>
          {copiedTip && (
            <span className="absolute right-0 bottom-full mb-1.5 whitespace-nowrap text-[10px] font-medium bg-foreground text-background py-1 px-2 rounded-md shadow-lg animate-in fade-in duration-200">
              Claim an account to share!
            </span>
          )}
        </div>
      </div>

      {/* Preview Comments */}
      <div className="mt-3.5 space-y-2.5">
        {MOCK_POST_FIXTURE.comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2.5 text-xs">
            <div
              className={cn(
                "size-5 rounded-full bg-gradient-to-br shrink-0 mt-0.5",
                comment.avatarColor
              )}
            />
            <div className="leading-snug bg-muted/60 rounded-xl p-2.5 flex-1 border border-border/40">
              <span className="font-bold text-foreground mr-1.5">
                {comment.author}
              </span>
              <span className="text-muted-foreground">{comment.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
