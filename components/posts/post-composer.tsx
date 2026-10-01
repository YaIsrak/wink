"use client";

import * as React from "react";
import {
  PhotoIcon as ImageIcon,
  XMarkIcon,
  ArrowPathIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { createPostAction } from "@/actions/post";
import { usePostStore } from "@/lib/store";
import { useUiStore } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/types/post";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_CAPTION_LENGTH = 1000;

export interface PostComposerProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "inline" | "dialog" | "trigger";
  autoFocus?: boolean;
  placeholder?: string;
}

export interface PostComposerTriggerProps {
  user: {
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  onClick?: () => void;
  placeholder?: string;
  className?: string;
}

export function PostComposerTrigger({
  user,
  onClick,
  placeholder = "What's on your mind?",
  className,
}: PostComposerTriggerProps) {
  const setActiveModal = useUiStore((state) => state.setActiveModal);

  const handleOpen = () => {
    if (onClick) {
      onClick();
    } else {
      setActiveModal("create-post");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className={cn(
        "group rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-border/80 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar
          src={user.avatarUrl}
          fallback={
            user.displayName?.slice(0, 2) || user.username?.slice(0, 2) || "WK"
          }
          size="md"
          className="shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="w-full rounded-xl bg-muted/20 px-2 py-2 text-sm text-muted-foreground transition-all group-hover:bg-muted/30 group-hover:text-foreground/80 flex items-center leading-relaxed">
            <span>{placeholder}</span>
          </div>
        </div>
        <Button
          type="button"
          className="rounded-lg px-4 font-semibold pointer-events-none"
        >
          <span>Post</span>
        </Button>
      </div>
    </div>
  );
}

export function PostComposer({
  user,
  onSuccess,
  onCancel,
  variant = "inline",
  autoFocus = false,
  placeholder = "What's on your mind?",
}: PostComposerProps) {
  if (variant === "trigger") {
    return <PostComposerTrigger user={user} placeholder={placeholder} />;
  }
  const [caption, setCaption] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const addOptimisticPost = usePostStore((state) => state.addOptimisticPost);
  const reconcilePost = usePostStore((state) => state.reconcilePost);
  const rollbackOptimisticPost = usePostStore(
    (state) => state.rollbackOptimisticPost,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WebP, and GIF images are allowed");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image must be 5MB or smaller");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedCaption = caption.trim();
    if (!trimmedCaption && !selectedFile) {
      toast.error("Please enter a caption or attach a photo");
      return;
    }

    if (trimmedCaption.length > MAX_CAPTION_LENGTH) {
      toast.error(`Caption cannot exceed ${MAX_CAPTION_LENGTH} characters`);
      return;
    }

    setIsSubmitting(true);

    // Capture state for potential rollback/retry
    const draftCaption = caption;
    const draftFile = selectedFile;
    const draftPreview = previewUrl;

    // 1. Generate client optimistic ID & model
    const tempId = "temp-" + crypto.randomUUID();
    const optimisticPost: FeedPost = {
      id: tempId,
      authorId: user.id,
      caption: trimmedCaption || null,
      imageUrl: draftPreview,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl ?? null,
      },
      isOptimistic: true,
      likesCount: 0,
      commentsCount: 0,
      isLikedByMe: false,
      previewComments: [],
    };

    // 2. Prepend optimistic post to store immediately
    addOptimisticPost(optimisticPost);

    // Clear form so user can continue seamlessly
    setCaption("");
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onSuccess?.();

    try {
      let finalImageUrl: string | undefined = undefined;

      // 3. If file attached, upload to Supabase Storage
      if (draftFile) {
        const supabase = createClient();
        const fileExt = draftFile.name.split(".").pop() || "jpg";
        const cleanFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${fileExt}`;
        const storagePath = `${user.id}/${cleanFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(storagePath, draftFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(storagePath);

        finalImageUrl = publicUrl;
      }

      // 4. Call server action to create DB record
      const result = await createPostAction({
        caption: trimmedCaption || undefined,
        imageUrl: finalImageUrl,
      });

      if (!result.success || !result.post) {
        throw new Error(result.error || "Failed to publish post");
      }

      // 5. Reconcile temporary optimistic post with real DB record
      reconcilePost(tempId, result.post);
      toast.success("Post published!");
    } catch (err: unknown) {
      console.error("Post creation failed:", err);
      // Roll back optimistic post from feed
      rollbackOptimisticPost(tempId);

      // Restore user's draft text and preview
      setCaption(draftCaption);
      setSelectedFile(draftFile);
      setPreviewUrl(draftPreview);

      const message =
        err instanceof Error
          ? err.message
          : "Could not create post. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInline = variant === "inline";
  const isPostDisabled =
    isSubmitting ||
    (!caption.trim() && !selectedFile) ||
    caption.length > MAX_CAPTION_LENGTH;

  return (
    <div
      className={
        isInline
          ? "rounded-xl border border-border bg-card p-4 shadow-xs"
          : "flex flex-col gap-4"
      }
    >
      <div className="flex items-start gap-3">
        <Avatar
          src={user.avatarUrl}
          fallback={
            user.displayName?.slice(0, 2) || user.username?.slice(0, 2) || "WK"
          }
          size="md"
        />
        <div className="flex-1 min-w-0">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`resize-none border-border bg-muted/20 focus-visible:bg-background transition-colors ${
              isInline ? "min-h-22.5" : "min-h-30"
            } ${
              caption.length > MAX_CAPTION_LENGTH ? "border-destructive" : ""
            }`}
          />

          {/* Attached Image Preview */}
          {previewUrl && (
            <div className="relative mt-3 inline-block overflow-hidden rounded-lg border border-border bg-muted/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected attachment preview"
                className="max-h-64 max-w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isSubmitting}
                className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-xs hover:bg-background transition-colors cursor-pointer shadow-xs"
                title="Remove image"
              >
                <XMarkIcon className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ALLOWED_MIME_TYPES.join(",")}
            className="hidden"
          />
          <Button
            type="button"
            size={"icon"}
            variant={"outline"}
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Attach a photo"
          >
            <ImageIcon className="size-4 text-primary" />
          </Button>

          {caption.length > 0 && (
            <span
              className={`text-xs tabular-nums ml-2 ${
                caption.length > MAX_CAPTION_LENGTH
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {caption.length}/{MAX_CAPTION_LENGTH}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-lg"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isPostDisabled}
            className="rounded-lg px-4 font-semibold"
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="mr-1.5 size-3.5 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <span>Post</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
