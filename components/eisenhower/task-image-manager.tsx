"use client";

import { Button } from '@/components/ui/button';
import { useImageUrls } from '@/lib/hooks/use-image-urls';
import { useTaskStore } from '@/lib/stores/task-store';
import type { TaskImage } from '@/lib/stores/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageIcon, X } from 'lucide-react';
import { useState } from 'react';
import { ImagePreviewDialog } from './image-preview-dialog';

interface TaskImageManagerProps {
    taskId: string;
    images?: TaskImage[];
    onImagesChange?: (images: TaskImage[]) => void;
}

export function TaskImageManager({ taskId, images = [] }: TaskImageManagerProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImageIndex, setPreviewImageIndex] = useState(0);
    const { removeImageFromTask } = useTaskStore();
    const imageUrls = useImageUrls(images);

    const handleRemoveImage = async (imageId: string) => {
        await removeImageFromTask(taskId, imageId);
    };

    const handleImageClick = (imageIndex: number) => {
        setPreviewImageIndex(imageIndex);
        setPreviewOpen(true);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-3">

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
                            {images.map((image, index) => {
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
                                            {imageUrl ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleImageClick(index)}
                                                    className="w-full h-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={image.name}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </button>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <div className="text-center">
                                                        <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                                                        <span className="text-xs">Loading...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove button */}
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg scale-90 hover:scale-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveImage(image.id);
                                            }}
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

            {/* Image Preview Dialog */}
            {images.length > 0 && (
                <ImagePreviewDialog
                    images={images}
                    imageUrls={imageUrls}
                    initialImageIndex={previewImageIndex}
                    open={previewOpen}
                    onOpenChange={setPreviewOpen}
                />
            )}
        </div>
    );
} 