"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useImageUrls } from "@/lib/hooks/use-image-urls";
import { useMarkdownTextarea } from "@/lib/hooks/use-markdown-textarea";
import { useTaskStore } from "@/lib/stores/task-store";
import type { TaskImage } from "@/lib/stores/types";
import { cn } from "@/lib/utils";
import { Eye, ImageIcon, Loader2, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { ImagePreviewDialog } from "../eisenhower/image-preview-dialog";

interface MarkdownTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
    taskId: string;
    value: string;
    onChange: (value: string) => void;
    onImageUpload?: (imageId: string) => void;
    onImageRemove?: (imageId: string, imageUrl: string) => void;
    showImagePreview?: boolean;
    compactPreview?: boolean;
}

export const MarkdownTextarea = forwardRef<HTMLTextAreaElement, MarkdownTextareaProps>(
    ({ taskId, value, onChange, onImageUpload, onImageRemove, showImagePreview = true, compactPreview = false, className, placeholder, ...props }, ref) => {
        const [previewOpen, setPreviewOpen] = useState(false);
        const [previewImageIndex, setPreviewImageIndex] = useState(0);
        const [taskImages, setTaskImages] = useState<TaskImage[]>([]);

        const { getTaskImages } = useTaskStore();
        const imageUrls = useImageUrls(taskImages);

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
            onImageUpload: (imageId) => {
                // Refresh task images when a new image is uploaded
                refreshTaskImages();
                onImageUpload?.(imageId);
            },
        });

        // Function to refresh task images
        const refreshTaskImages = useCallback(async () => {
            try {
                const images = await getTaskImages(taskId);
                setTaskImages(images);
            } catch (error) {
                console.error("Error refreshing task images:", error);
            }
        }, [taskId, getTaskImages]);

        // Load task images on mount and when taskId changes
        useEffect(() => {
            refreshTaskImages();
        }, [refreshTaskImages]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e.target.value);
        };

        // Extract image references from markdown text
        const extractImageReferences = useCallback(() => {
            const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
            const matches: Array<{
                alt: string;
                src: string;
                fullMatch: string;
                index: number;
            }> = [];
            let match: RegExpExecArray | null;

            match = imageRegex.exec(value);
            while (match !== null) {
                matches.push({
                    alt: match[1],
                    src: match[2],
                    fullMatch: match[0],
                    index: match.index
                });
                match = imageRegex.exec(value);
            }

            return matches;
        }, [value]);

        // Handle clicking on images for preview
        const handleImageClick = useCallback((imageIndex: number) => {
            if (showImagePreview && taskImages.length > 0) {
                setPreviewImageIndex(imageIndex);
                setPreviewOpen(true);
            }
        }, [showImagePreview, taskImages.length]);

        // Handle image removal
        const handleImageRemove = useCallback((imageId: string, imageUrl: string, event: React.MouseEvent) => {
            event.stopPropagation();
            onImageRemove?.(imageId, imageUrl);
        }, [onImageRemove]);

        const enhancedPlaceholder = isStorageReady
            ? placeholder || "Type your description... (Paste images directly!)"
            : "Loading image support...";

        const imageReferences = extractImageReferences();
        const hasImages = taskImages.length > 0;

        return (
            <div className="space-y-3">
                {/* Main textarea */}
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
                            "min-h-[120px] resize-none",
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

                {/* Image preview section */}
                {showImagePreview && hasImages && (
                    <div className={cn(
                        "border rounded-lg bg-muted/30",
                        compactPreview ? "p-2" : "p-3"
                    )}>
                        <div className={cn(
                            "flex items-center justify-between",
                            compactPreview ? "mb-2" : "mb-3"
                        )}>
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <ImageIcon className="h-4 w-4" />
                                <span>
                                    {compactPreview
                                        ? `${taskImages.length} image${taskImages.length !== 1 ? 's' : ''}`
                                        : `Attached Images (${taskImages.length})`
                                    }
                                </span>
                            </div>
                            {taskImages.length > 0 && !compactPreview && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleImageClick(0)}
                                    className="text-xs"
                                >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Preview All
                                </Button>
                            )}
                        </div>

                        <div className={cn(
                            "grid gap-2",
                            compactPreview
                                ? "grid-cols-6 sm:grid-cols-8"
                                : "grid-cols-4 sm:grid-cols-6"
                        )}>
                            {taskImages.slice(0, compactPreview ? 6 : 12).map((image, index) => {
                                const imageUrl = imageUrls[image.id];
                                return (
                                    <div
                                        key={image.id}
                                        className="relative group"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleImageClick(index)}
                                            className={cn(
                                                "aspect-square rounded-md overflow-hidden border border-border hover:border-primary/50 transition-colors w-full",
                                                compactPreview && "rounded-sm"
                                            )}
                                            title={`Click to preview ${image.name}`}
                                        >
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={image.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                                    <ImageIcon className={cn(
                                                        "text-muted-foreground",
                                                        compactPreview ? "h-3 w-3" : "h-4 w-4"
                                                    )} />
                                                </div>
                                            )}
                                        </button>

                                        {/* Remove button */}
                                        {onImageRemove && (
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg scale-90 hover:scale-100"
                                                onClick={(e) => handleImageRemove(image.id, imageUrl || '', e)}
                                                title={`Remove ${image.name}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                            {taskImages.length > (compactPreview ? 6 : 12) && (
                                <button
                                    type="button"
                                    onClick={() => handleImageClick(compactPreview ? 6 : 12)}
                                    className={cn(
                                        "aspect-square rounded-md bg-muted flex items-center justify-center text-sm border hover:bg-muted/80 transition-colors",
                                        compactPreview && "rounded-sm"
                                    )}
                                >
                                    <div className="text-center text-muted-foreground">
                                        <span className={cn(
                                            "font-medium",
                                            compactPreview ? "text-xs" : "text-sm"
                                        )}>
                                            +{taskImages.length - (compactPreview ? 6 : 12)}
                                        </span>
                                    </div>
                                </button>
                            )}
                        </div>

                        {!compactPreview && imageReferences.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground">
                                    {imageReferences.length} image{imageReferences.length !== 1 ? 's' : ''} referenced in text
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Image Preview Dialog */}
                {showImagePreview && taskImages.length > 0 && (
                    <ImagePreviewDialog
                        images={taskImages}
                        imageUrls={imageUrls}
                        initialImageIndex={previewImageIndex}
                        open={previewOpen}
                        onOpenChange={setPreviewOpen}
                    />
                )}
            </div>
        );
    }
);

MarkdownTextarea.displayName = "MarkdownTextarea"; 