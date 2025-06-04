import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MarkdownTextarea } from "@/components/ui/markdown-textarea";
import { useImageUrls } from "@/lib/hooks/use-image-urls";
import { imageStorage } from "@/lib/stores/image-storage";
import { useTaskStore } from "@/lib/stores/task-store";
import type { TaskImage, TaskPriority } from "@/lib/stores/types";
import { cn } from "@/lib/utils";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ImageIcon, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ImagePreviewDialog } from "./image-preview-dialog";
import { TaskImageManager } from "./task-image-manager";

interface TaskCardProps {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: Date;
    completed?: boolean;
    images?: TaskImage[];
    onEdit?: (updates?: { title?: string; description?: string }) => void;
    onDelete?: () => void;
    onToggleComplete?: () => void;
    className?: string;
    isDragging?: boolean;
}

const priorityColors = {
    urgent: {
        badge: "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200",
        border: "border-red-200 dark:border-red-900",
        accent: "bg-red-50 dark:bg-red-950/30",
    },
    important: {
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200",
        border: "border-blue-200 dark:border-blue-900",
        accent: "bg-blue-50 dark:bg-blue-950/30",
    },
    delegate: {
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
        border: "border-amber-200 dark:border-amber-900",
        accent: "bg-amber-50 dark:bg-amber-950/30",
    },
    eliminate: {
        badge: "bg-gray-100 text-gray-800 dark:bg-gray-800/60 dark:text-gray-300",
        border: "border-gray-200 dark:border-gray-800",
        accent: "bg-gray-50 dark:bg-gray-900/50",
    },
    unclassified: {
        badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200",
        border: "border-purple-200 dark:border-purple-900",
        accent: "bg-purple-50 dark:bg-purple-950/30",
    }
};

const priorityLabels: Record<TaskPriority, string> = {
    urgent: "Urgent",
    important: "Important",
    delegate: "Delegate",
    eliminate: "Eliminate",
    unclassified: "Unclassified",
};

export function TaskCard({
    id,
    title,
    description,
    priority,
    dueDate,
    completed = false,
    images = [],
    onEdit,
    onDelete,
    onToggleComplete,
    className,
}: TaskCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedDescription, setEditedDescription] = useState(description || "");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImageIndex, setPreviewImageIndex] = useState(0);
    const [previousImageUrls, setPreviousImageUrls] = useState<string[]>([]);
    const [fullImageRecords, setFullImageRecords] = useState<TaskImage[]>([]);

    const imageUrls = useImageUrls(fullImageRecords);
    const { removeImageFromTask, getTaskImages } = useTaskStore();

    const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } =
        useDraggable({
            id,
            data: {
                type: "task",
                task: { id, title, description, priority, dueDate, completed },
            },
        });

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id,
        data: {
            type: "task",
            task: { id, title, description, priority, dueDate, completed },
        },
    });

    const setNodeRef = (node: HTMLElement | null) => {
        setDraggableRef(node);
        setDroppableRef(node);
    };

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
        cursor: isEditing ? "default" : "grab",
    };

    const handleEditClick = () => {
        if (onEdit) {
            if (isEditing) {
                onEdit({
                    title: editedTitle,
                    description: editedDescription || undefined,
                });
                setIsEditing(false);
            } else {
                onEdit();
                setIsEditing(true);
            }
        } else {
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        setEditedTitle(title);
        setEditedDescription(description || "");
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleEditClick();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    };

    const formatDueDate = (date: Date) => {
        // Check if the date is today
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        // Check if the date is tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        // Format date based on proximity
        if (isToday) {
            return "Today";
        }

        if (isTomorrow) {
            return "Tomorrow";
        }

        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
        });
    };

    const isOverdue = dueDate && new Date(dueDate) < new Date() && !completed;

    const handleImageClick = (imageIndex: number) => {
        setPreviewImageIndex(imageIndex);
        setPreviewOpen(true);
    };

    // Function to extract image URLs from markdown text
    const extractImageUrls = useCallback((text: string): string[] => {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const urls: string[] = [];
        let match: RegExpExecArray | null;

        match = imageRegex.exec(text);
        while (match !== null) {
            urls.push(match[2]);
            match = imageRegex.exec(text);
        }
        return urls;
    }, []);

    // Function to handle image removal when markdown text changes
    const handleDescriptionChange = useCallback(async (newValue: string) => {
        const currentUrls = extractImageUrls(newValue);
        const removedUrls = previousImageUrls.filter(url => !currentUrls.includes(url));

        // Remove images that were deleted from the markdown
        if (removedUrls.length > 0) {
            try {
                const taskImages = await getTaskImages(id);
                for (const removedUrl of removedUrls) {
                    // Find the image that matches this URL
                    const imageToRemove = taskImages.find(img => {
                        if (img.file) { // Explicitly check if img.file is defined
                            const imageUrl = imageStorage.createImageUrl(img.file);
                            const match = imageUrl === removedUrl;
                            if (!match) {
                                // If this imageUrl was created just for comparison and it didn't match,
                                // it's a new blob URL that needs to be revoked.
                                imageStorage.revokeImageUrl(imageUrl);
                            }
                            // If it *does* match, 'removedUrl' (which is 'imageUrl') will be revoked later if 'imageToRemove' is true.
                            return match;
                        }
                        return false; // If img.file is undefined, it cannot match
                    });

                    if (imageToRemove) {
                        await removeImageFromTask(id, imageToRemove.id);
                        // Revoke the object URL to free memory
                        imageStorage.revokeImageUrl(removedUrl);
                    }
                }
            } catch (error) {
                console.error('Error removing deleted images:', error);
            }
        }

        setPreviousImageUrls(currentUrls);
        setEditedDescription(newValue);
    }, [previousImageUrls, id, getTaskImages, removeImageFromTask, extractImageUrls]);

    // Update previous URLs when description changes
    useEffect(() => {
        if (isEditing) {
            const currentUrls = extractImageUrls(editedDescription);
            setPreviousImageUrls(currentUrls);
        }
    }, [isEditing, editedDescription, extractImageUrls]);

    // Load full image records with file objects when images change
    useEffect(() => {
        const loadFullImages = async () => {
            if (images.length > 0) {
                try {
                    const imageRecords = await getTaskImages(id);
                    const fullImages = imageRecords.map(record => ({
                        id: record.id,
                        file: record.file,
                        name: record.name,
                        size: record.size,
                        type: record.type,
                        createdAt: record.createdAt,
                    }));
                    setFullImageRecords(fullImages);
                } catch (error) {
                    console.error('Error loading full image records:', error);
                    setFullImageRecords([]);
                }
            } else {
                setFullImageRecords([]);
            }
        };

        loadFullImages();
    }, [images, id, getTaskImages]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
        >
            <Card
                ref={setNodeRef}
                style={style}
                {...(isEditing ? {} : { ...attributes, ...listeners })}
                className={cn(
                    "relative group transition-all duration-200 overflow-visible border",
                    priorityColors[priority].border,
                    {
                        "shadow-sm": !isHovered && !isEditing,
                        "shadow-md": isHovered && !isEditing,
                        "shadow-lg": isEditing,
                        "opacity-60 bg-muted/30": completed,
                        "border-green-300 dark:border-green-800": completed,
                        "ring-1 ring-primary/20": isHovered && !isEditing,
                        "ring-2 ring-primary ring-offset-2": isOver,
                        [priorityColors[priority].accent]: !completed,
                    },
                    className,
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Priority indicator strip */}
                <div className={cn(
                    "absolute top-0 left-0 w-1 h-full rounded-l-md",
                    priorityColors[priority].badge.replace("bg-", "").split(" ")[0],
                    completed ? "opacity-30" : ""
                )} />

                <CardHeader className={cn(
                    "px-4 py-3 pb-2 flex flex-col gap-2 rounded-t-lg",
                    isEditing ? "bg-background" : ""
                )}>
                    <div className="flex flex-col items-start gap-2 relative pr-10 sm:pr-6">
                        <div className="flex items-center justify-between w-full">
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "shrink-0 whitespace-nowrap text-xs font-medium",
                                    priorityColors[priority].badge,
                                    completed ? "opacity-70" : ""
                                )}
                            >
                                {priorityLabels[priority]}
                            </Badge>

                            {dueDate && !isEditing && (
                                <div className={cn(
                                    "flex items-center gap-1 text-xs",
                                    isOverdue ? "text-red-500 dark:text-red-400" : "text-muted-foreground",
                                    completed ? "line-through opacity-70" : ""
                                )}>
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDueDate(new Date(dueDate))}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-2 w-full">
                            <Checkbox
                                checked={completed}
                                onCheckedChange={onToggleComplete}
                                className={cn(
                                    "mt-1 shrink-0",
                                    isEditing && "hidden",
                                    completed ? "opacity-100" : "opacity-90"
                                )}
                                aria-hidden={isEditing}
                            />
                            {isEditing ? (
                                <Input
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="font-medium text-base w-full"
                                    autoFocus
                                />
                            ) : (
                                <div className="min-w-0 flex-1">
                                    <h3
                                        className={cn(
                                            "font-medium text-base leading-normal tracking-tight",
                                            "transition-colors duration-200",
                                            {
                                                "line-through text-muted-foreground": completed,
                                            }
                                        )}
                                    >
                                        {title}
                                    </h3>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>

                {isEditing ? (
                    <CardContent className="p-3 pt-0 space-y-4">
                        <MarkdownTextarea
                            taskId={id}
                            value={editedDescription}
                            onChange={handleDescriptionChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Add a description... (Supports Markdown - paste images directly!)"
                            className="min-h-[80px] resize-none w-full mt-2"
                            onImageUpload={(imageId) => {
                                console.log('Image uploaded:', imageId);
                            }}
                            onImageRemove={async (imageId, imageUrl) => {
                                try {
                                    // Remove from task store
                                    await removeImageFromTask(id, imageId);

                                    // Remove from markdown text
                                    const updatedDescription = editedDescription.replace(
                                        new RegExp(`!\\[([^\\]]*)\\]\\(${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
                                        ''
                                    ).replace(/\n\s*\n\s*\n/g, '\n\n'); // Clean up extra line breaks

                                    handleDescriptionChange(updatedDescription);

                                    // Revoke the object URL to free memory
                                    imageStorage.revokeImageUrl(imageUrl);
                                } catch (error) {
                                    console.error('Error removing image:', error);
                                }
                            }}
                            showImagePreview={false}
                        />

                        {/* TaskImageManager para manejar imágenes en modo edición */}
                        <div className="border-t pt-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Images
                            </h5>
                            <TaskImageManager
                                taskId={id}
                                images={fullImageRecords}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleEditClick}
                                className="w-full sm:w-auto"
                            >
                                Save
                            </Button>
                        </div>
                    </CardContent>
                ) : (
                    <>
                        {description && (
                            <CardContent className="p-3 pt-0">
                                <div className={cn(
                                    "prose prose-sm dark:prose-invert max-w-none",
                                    "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                                    "prose-p:my-1.5 prose-headings:mt-2 prose-headings:mb-1",
                                    "text-sm",
                                    { "text-muted-foreground line-through opacity-80": completed }
                                )}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: ({ href, children }) => (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline-offset-2"
                                                >
                                                    {children}
                                                </a>
                                            ),
                                            img: ({ src, alt }) => {
                                                // Don't render if src is empty, null, or undefined
                                                if (!src || (typeof src === 'string' && src.trim() === '')) {
                                                    return (
                                                        <span className="inline-flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                                                            <ImageIcon className="h-3 w-3" />
                                                            <span>{alt || 'Image loading...'}</span>
                                                        </span>
                                                    );
                                                }
                                                // Using Next/Image in Markdown can be tricky due to required width/height
                                                // and potential layout shifts if dimensions are unknown.
                                                // The onError handling also needs to be adapted for Next/Image.
                                                // This is a placeholder implementation.
                                                // Consider a custom component or further refinement for production.
                                                const finalSrc = typeof src === 'string' ? src : URL.createObjectURL(src as Blob);
                                                return (
                                                    <div style={{ position: 'relative', maxWidth: '100%', margin: '0.5rem 0' }}>
                                                        <Image
                                                            src={finalSrc}
                                                            alt={alt || 'Image'}
                                                            width={500}
                                                            height={300}
                                                            style={{
                                                                width: '100%',
                                                                height: 'auto',
                                                                objectFit: 'contain'
                                                            }}
                                                            className="rounded border"
                                                            unoptimized={true}
                                                            onError={(e) => {
                                                                console.error("Failed to load image in markdown:", finalSrc, e);
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            },
                                            code: ({ children }) => (
                                                <code className="bg-muted px-1 py-0.5 rounded text-xs">
                                                    {children}
                                                </code>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="pl-5 list-disc space-y-1 my-2">
                                                    {children}
                                                </ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="pl-5 list-decimal space-y-1 my-2">
                                                    {children}
                                                </ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="my-0.5">
                                                    {children}
                                                </li>
                                            ),
                                        }}
                                    >
                                        {description}
                                    </ReactMarkdown>
                                </div>
                            </CardContent>
                        )}

                        {/* Mostrar imágenes en modo lectura */}
                        {fullImageRecords.length > 0 && (
                            <CardContent className="p-3 pt-0">
                                <div className="space-y-2">
                                    {!description && <div className="border-t" />}
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <ImageIcon className="h-3 w-3" />
                                        <span>{fullImageRecords.length} {fullImageRecords.length === 1 ? 'image' : 'images'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {fullImageRecords.slice(0, 4).map((image, index) => {
                                            const imageUrl = imageUrls[image.id];

                                            // No renderizar si no hay URL válida
                                            if (!imageUrl) {
                                                return (
                                                    <div key={image.id} className="aspect-square rounded overflow-hidden border shadow-sm bg-gray-100 flex items-center justify-center">
                                                        <div className="text-center text-gray-400">
                                                            <ImageIcon className="h-4 w-4 mx-auto mb-1" />
                                                            <span className="text-xs">Loading...</span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={image.id}
                                                    type="button"
                                                    onClick={() => handleImageClick(index)}
                                                    className="relative aspect-square rounded overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                >
                                                    <Image
                                                        src={imageUrl}
                                                        alt={image.name || "Task image"}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        className={cn(
                                                            "transition-opacity",
                                                            { "opacity-50": completed }
                                                        )}
                                                        unoptimized={true}
                                                    />
                                                </button>
                                            );
                                        })}
                                        {fullImageRecords.length > 4 && (
                                            <button
                                                type="button"
                                                onClick={() => handleImageClick(4)}
                                                className={cn(
                                                    "aspect-square rounded bg-gray-100 flex items-center justify-center text-sm border hover:bg-gray-200 transition-colors",
                                                    { "opacity-50": completed }
                                                )}
                                            >
                                                <div className="text-center text-gray-500">
                                                    <ImageIcon className="h-4 w-4 mx-auto mb-1" />
                                                    <span className="text-xs">+{fullImageRecords.length - 4}</span>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </>
                )}

                <AnimatePresence>
                    {isHovered && !isEditing && (
                        <div
                            className={cn(
                                "absolute top-2 flex gap-1",
                                "right-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150",
                                "bg-gradient-to-l from-background via-background to-transparent sm:bg-none",
                                "pl-4 pr-0.5 py-0.5 -mr-0.5 sm:p-0"
                            )}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.1 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleEditClick}
                                    className="h-7 w-7 rounded-full"
                                    aria-label="Edit task"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.1 }}
                            >
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                            aria-label="Delete task"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={onDelete}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </Card>

            {/* Image Preview Dialog */}
            {fullImageRecords.length > 0 && (
                <ImagePreviewDialog
                    images={fullImageRecords}
                    imageUrls={imageUrls}
                    initialImageIndex={previewImageIndex}
                    open={previewOpen}
                    onOpenChange={setPreviewOpen}
                />
            )}
        </motion.div>
    );
}
