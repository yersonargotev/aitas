import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TaskPriority } from "@/lib/stores/types";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

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
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    important: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    delegate:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    eliminate: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    unclassified:
        "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100",
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

    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id,
            data: {
                type: "task",
                task: { id, title, description, priority, dueDate, completed },
            },
        });

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
                    "relative group transition-all duration-200 hover:shadow-md h-full",
                    {
                        "opacity-50": completed,
                        "border-green-200 dark:border-green-800": completed,
                        "ring-1 ring-primary/10": isHovered && !isEditing,
                    },
                    className,
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <CardHeader className="px-4 py-3">
                    <div className="flex flex-col items-start gap-2 relative pr-8 sm:pr-2">
                        <Badge
                            variant="secondary"
                            className={cn("shrink-0 whitespace-nowrap", priorityColors[priority])}
                        >
                            {priorityLabels[priority]}
                        </Badge>
                        <div className="flex items-start sm:items-center gap-2 w-full">
                            <Checkbox
                                checked={completed}
                                onCheckedChange={onToggleComplete}
                                className="mt-1.5 sm:mt-0 shrink-0"
                            />
                            {isEditing ? (
                                <Input
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="font-semibold w-full"
                                    autoFocus
                                />
                            ) : (
                                <div className="min-w-0 flex-1">
                                    <h3
                                        className={cn("font-semibold leading-normal tracking-tight line-clamp-2", {
                                            "line-through text-muted-foreground": completed,
                                        })}
                                    >
                                        {title}
                                    </h3>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                {isEditing ? (
                    <CardContent className="pb-2 space-y-4">
                        <Textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add a description..."
                            className="min-h-[80px] resize-none w-full"
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
                            <CardContent className="pb-2">
                                <p
                                    className={cn(
                                        "text-sm text-muted-foreground line-clamp-3 break-words",
                                        {
                                            "line-through": completed,
                                        }
                                    )}
                                >
                                    {description}
                                </p>
                            </CardContent>
                        )}
                        {dueDate && (
                            <CardContent className="pb-2">
                                <p className="text-xs text-muted-foreground">
                                    Due: {new Date(dueDate).toLocaleDateString()}
                                </p>
                            </CardContent>
                        )}
                    </>
                )}
                <AnimatePresence>
                    {isHovered && !isEditing && (
                        <div
                            className={cn(
                                "absolute top-2 flex gap-1",
                                "right-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200",
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onDelete}
                                    className="h-7 w-7 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                    aria-label="Delete task"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}
