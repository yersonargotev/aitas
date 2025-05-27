"use client";

import { Textarea } from "@/components/ui/textarea";
import { useMarkdownTextarea } from "@/lib/hooks/use-markdown-textarea";
import { cn } from "@/lib/utils";
import { ImageIcon, Loader2 } from "lucide-react";
import { forwardRef } from "react";

interface MarkdownTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
    taskId: string;
    value: string;
    onChange: (value: string) => void;
    onImageUpload?: (imageId: string) => void;
}

export const MarkdownTextarea = forwardRef<HTMLTextAreaElement, MarkdownTextareaProps>(
    ({ taskId, value, onChange, onImageUpload, className, placeholder, ...props }, ref) => {
        const {
            textareaRef,
            isUploading,
            isStorageReady,
            handlePaste,
            handleDrop,
            handleDragOver,
        } = useMarkdownTextarea({
            taskId,
            value,
            onChange,
            onImageUpload,
        });

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e.target.value);
        };

        const enhancedPlaceholder = isStorageReady
            ? placeholder || "Type your description... (Paste images directly!)"
            : "Loading image support...";

        return (
            <div className="relative">
                <Textarea
                    ref={(node) => {
                        if (typeof ref === 'function') {
                            ref(node);
                        } else if (ref) {
                            ref.current = node;
                        }
                        if (textareaRef) {
                            textareaRef.current = node;
                        }
                    }}
                    value={value}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    placeholder={enhancedPlaceholder}
                    disabled={!isStorageReady}
                    className={cn(
                        "min-h-[80px] resize-none",
                        isUploading && "opacity-75",
                        !isStorageReady && "opacity-50",
                        className
                    )}
                    {...props}
                />

                {/* Storage loading indicator */}
                {!isStorageReady && (
                    <div className="absolute top-2 right-2 flex items-center gap-2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-2 py-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Initializing...</span>
                    </div>
                )}

                {/* Upload indicator */}
                {isUploading && isStorageReady && (
                    <div className="absolute top-2 right-2 flex items-center gap-2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-2 py-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading image...</span>
                    </div>
                )}

                {/* Image support indicator */}
                {isStorageReady && !isUploading && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-muted-foreground/60">
                        <ImageIcon className="h-3 w-3" />
                        <span>Paste images</span>
                    </div>
                )}
            </div>
        );
    }
);

MarkdownTextarea.displayName = "MarkdownTextarea"; 