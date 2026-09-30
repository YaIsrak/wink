'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Send, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MessageComposerProps {
  conversationId: string;
  currentUserId?: string;
  onSendMessage: (content?: string, imageUrl?: string) => Promise<void>;
  onTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageComposer({
  conversationId,
  currentUserId,
  onSendMessage,
  onTyping,
  placeholder = 'Write a message...',
  disabled = false,
}: MessageComposerProps) {
  const [content, setContent] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image attachments are supported');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed && !selectedFile) return;

    setIsUploading(true);
    let uploadedImageUrl: string | undefined = undefined;

    try {
      if (selectedFile && currentUserId) {
        const supabase = createClient();
        const fileExt = selectedFile.name.split('.').pop() || 'jpg';
        const fileName = `${currentUserId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('messages')
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error('Failed to upload image attachment');
        }

        const { data: publicUrlData } = supabase.storage
          .from('messages')
          .getPublicUrl(fileName);

        uploadedImageUrl = publicUrlData.publicUrl;
      }

      const textToSend = trimmed || undefined;
      setContent('');
      removeSelectedFile();

      await onSendMessage(textToSend, uploadedImageUrl);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-border/40 bg-card select-none shrink-0">
      {/* Photo attachment preview */}
      {previewUrl && (
        <div className="relative inline-block mb-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Upload preview"
            className="size-16 object-cover rounded-xl border border-border/50 shadow-xs"
          />
          <button
            onClick={removeSelectedFile}
            className="absolute -top-1.5 -right-1.5 size-5 bg-background border border-border rounded-full flex items-center justify-center text-foreground hover:bg-secondary cursor-pointer shadow-xs"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Bar */}
      <div className="flex items-end gap-2 bg-secondary/40 rounded-2xl p-1.5 border border-border/40 focus-within:border-border transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0"
          title="Attach photo"
        >
          <ImagePlus className="size-4" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            if (onTyping && e.target.value.trim()) {
              onTyping();
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isUploading}
          rows={1}
          className="min-h-[36px] max-h-[120px] resize-none border-none bg-transparent p-2 text-sm focus-visible:ring-0 leading-relaxed"
        />

        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={(!content.trim() && !selectedFile) || disabled || isUploading}
          className="size-8 rounded-xl shrink-0"
          title="Send"
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 px-1 mt-1.5 font-normal">
        <span>Press Enter to send, Shift + Enter for new line</span>
        <span>Mutual Privacy Protected</span>
      </div>
    </div>
  );
}
