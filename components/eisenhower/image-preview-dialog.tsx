"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { TaskImage } from "@/lib/stores/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ImagePreviewDialogProps {
    images: TaskImage[];
    imageUrls: Record<string, string>;
    initialImageIndex?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImagePreviewDialog({
    images,
    imageUrls,
    initialImageIndex = 0,
    open,
    onOpenChange,
}: ImagePreviewDialogProps) {
    const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const currentImage = images[currentIndex];
    const currentImageUrl = currentImage ? imageUrls[currentImage.id] : "";

    // Reset zoom and position when image changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, [currentIndex]);

    // Reset current index when dialog opens
    useEffect(() => {
        if (open) {
            setCurrentIndex(initialImageIndex);
        }
    }, [open, initialImageIndex]);

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, [images.length]);

    const handleZoomIn = useCallback(() => {
        setZoom((prev) => Math.min(prev * 1.5, 5));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((prev) => Math.max(prev / 1.5, 0.5));
    }, []);

    const handleDownload = () => {
        if (currentImageUrl && currentImage) {
            const link = document.createElement("a");
            link.href = currentImageUrl;
            link.download = currentImage.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;

            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault();
                    handlePrevious();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    handleNext();
                    break;
                case "Escape":
                    e.preventDefault();
                    onOpenChange(false);
                    break;
                case "+":
                case "=":
                    e.preventDefault();
                    handleZoomIn();
                    break;
                case "-":
                    e.preventDefault();
                    handleZoomOut();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, handlePrevious, handleNext, handleZoomIn, handleZoomOut, onOpenChange]);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (!currentImage || !currentImageUrl) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-lg font-semibold truncate max-w-full">
                                {currentImage.name}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                                {formatFileSize(currentImage.size)} • {currentIndex + 1} of {images.length}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Zoom controls */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleZoomOut}
                                disabled={zoom <= 0.5}
                                className="h-8 w-8"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-mono min-w-[4rem] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleZoomIn}
                                disabled={zoom >= 5}
                                className="h-8 w-8"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>

                            {/* Download button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDownload}
                                className="h-8 w-8"
                            >
                                <Download className="h-4 w-4" />
                            </Button>

                            {/* Close button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Image container */}
                <div className="relative flex-1 flex items-center justify-center bg-black/5 pt-20 pb-4">
                    <div
                        className="relative max-w-full max-h-full overflow-hidden cursor-move"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        style={{
                            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImage.id}
                                className="max-w-full max-h-full"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Ensure motion.div and its parent are styled for layout="fill" if that's used.
                                    Given existing styles, direct width/height might be complex due to zoom/pan.
                                    Let's assume for now the existing classNames on motion.div handle sizing
                                    and we use layout="fill" with objectFit="contain".
                                    The parent div of motion.div already has position relative.
                                    The motion.div itself will act as the immediate parent for Next/Image.
                                */}
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    <Image
                                        src={currentImageUrl}
                                        alt={currentImage.name || "Image preview"}
                                        fill
                                        style={{
                                            objectFit: 'contain',
                                            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                                            transformOrigin: "center",
                                        }}
                                        className="select-none"
                                        draggable={false}
                                        unoptimized={true}
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation buttons */}
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg"
                                onClick={handlePrevious}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg"
                                onClick={handleNext}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </>
                    )}
                </div>

                {/* Thumbnail navigation */}
                {images.length > 1 && (
                    <div className="border-t bg-background p-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {images.map((image, index) => {
                                const thumbnailUrl = imageUrls[image.id];
                                return (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() => setCurrentIndex(index)}
                                        className={cn(
                                            "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all", // Added relative
                                            index === currentIndex
                                                ? "border-primary ring-2 ring-primary/20"
                                                : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        {thumbnailUrl ? (
                                            <Image
                                                src={thumbnailUrl}
                                                alt={image.name || "Thumbnail"}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <span className="text-xs text-muted-foreground">...</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
} 