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
import { Textarea } from "@/components/ui/textarea";
import type { TaskPriority } from "@/lib/stores/types";
import { cn } from "@/lib/utils";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TaskCardProps {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: Date;
    completed?: boolean;
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
    onEdit,
    onDelete,
    onToggleComplete,
    className,
}: TaskCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedDescription, setEditedDescription] = useState(description || "");

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
                        <Textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add a description... (Supports Markdown)"
                            className="min-h-[80px] resize-none w-full mt-2"
                        />
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
        </motion.div>
    );
}
