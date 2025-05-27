"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useClipboardPaste } from '@/lib/hooks/use-clipboard-paste';
import { useImageUrls } from '@/lib/hooks/use-image-urls';
import { useTaskStore } from '@/lib/stores/task-store';
import type { TaskImage } from '@/lib/stores/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Clipboard, Info, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface TaskImageManagerProps {
    taskId: string;
    images?: TaskImage[];
    onImagesChange?: (images: TaskImage[]) => void;
}

export function TaskImageManager({ taskId, images = [] }: TaskImageManagerProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [showClipboardHint, setShowClipboardHint] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { addImageToTask, removeImageFromTask } = useTaskStore();
    const imageUrls = useImageUrls(images);

    // Hook para manejar el paste desde clipboard
    const { pasteFromClipboard, isPasting } = useClipboardPaste({
        onImagePaste: async (file: File) => {
            setIsUploading(true);
            try {
                await addImageToTask(taskId, file);
                setShowClipboardHint(true);
                setTimeout(() => setShowClipboardHint(false), 3000);
            } finally {
                setIsUploading(false);
            }
        },
        enabled: true,
        targetElement: containerRef.current,
        onPasteStart: () => setIsUploading(true),
        onPasteComplete: (success) => {
            setIsUploading(false);
            if (success) {
                setShowClipboardHint(true);
                setTimeout(() => setShowClipboardHint(false), 3000);
            }
        }
    });

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        setIsUploading(true);
        try {
            for (const file of Array.from(files)) {
                if (file.type.startsWith('image/')) {
                    await addImageToTask(taskId, file);
                }
            }
        } finally {
            setIsUploading(false);
            // Limpiar el input
            event.target.value = '';
        }
    };

    const handleDrop = async (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);

        const files = event.dataTransfer.files;
        setIsUploading(true);
        try {
            for (const file of Array.from(files)) {
                if (file.type.startsWith('image/')) {
                    await addImageToTask(taskId, file);
                }
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleRemoveImage = async (imageId: string) => {
        await removeImageFromTask(taskId, imageId);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        // Mostrar hint cuando se presiona Ctrl/Cmd + V
        if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
            setShowClipboardHint(true);
            setTimeout(() => setShowClipboardHint(false), 2000);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div
            ref={containerRef}
            className="space-y-3"
            onKeyDown={handleKeyDown}
            onFocus={() => setShowClipboardHint(false)}
        >
            {/* Clipboard hint */}
            <AnimatePresence>
                {showClipboardHint && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Alert className="border-blue-200 bg-blue-50">
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                Image pasted from clipboard! 📋✨
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${isDragOver
                    ? 'border-primary bg-primary/5 scale-105'
                    : 'border-gray-300 hover:border-gray-400'
                    } ${isUploading || isPasting ? 'opacity-50 pointer-events-none' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    id={`images-${taskId}`}
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading || isPasting}
                />

                <div className="space-y-3">
                    {isUploading || isPasting ? (
                        <div className="animate-spin h-8 w-8 mx-auto border-2 border-primary border-t-transparent rounded-full" />
                    ) : (
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    )}

                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium">
                            {isUploading || isPasting ? 'Uploading images...' : 'Add images to your task'}
                        </p>

                        {!isUploading && !isPasting && (
                            <div className="space-y-1 text-xs text-gray-500">
                                <p>• Drag & drop images here</p>
                                <p>• Click to browse files</p>
                                <p>• Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs font-mono">Ctrl+V</kbd> to paste from clipboard</p>
                            </div>
                        )}

                        <p className="text-xs text-gray-400">
                            PNG, JPG, GIF up to 10MB each
                        </p>
                    </div>

                    {!isUploading && !isPasting && (
                        <div className="flex gap-2 justify-center">
                            <label htmlFor={`images-${taskId}`}>
                                <Button variant="outline" size="sm" asChild>
                                    <span className="cursor-pointer">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Browse Files
                                    </span>
                                </Button>
                            </label>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={pasteFromClipboard}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                disabled={isPasting}
                            >
                                <Clipboard className="h-4 w-4 mr-2" />
                                {isPasting ? 'Pasting...' : 'Paste'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <h4 className="text-sm font-medium text-gray-700">
                        Attached Images ({images.length})
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <AnimatePresence>
                            {images.map((image) => {
                                const imageUrl = imageUrls[image.id];

                                return (
                                    <motion.div
                                        key={image.id}
                                        className="relative group"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border shadow-sm">
                                            <img
                                                src={imageUrl}
                                                alt={image.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Remove button */}
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg scale-90 hover:scale-100"
                                            onClick={() => handleRemoveImage(image.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>

                                        {/* Image info */}
                                        <div className="mt-1 text-xs text-gray-500">
                                            <p className="truncate font-medium" title={image.name}>
                                                {image.name}
                                            </p>
                                            <p className="text-gray-400">{formatFileSize(image.size)}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </div>
    );
} 