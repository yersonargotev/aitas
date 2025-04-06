import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { TaskPriority } from "@/lib/stores/types";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface TaskCardProps {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: Date;
    completed?: boolean;
    onEdit?: () => void;
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
        cursor: "grab",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={cn(
                    "relative group transition-all duration-200",
                    {
                        "opacity-50": completed,
                        "border-green-200 dark:border-green-800": completed,
                    },
                    className,
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={completed}
                                onCheckedChange={onToggleComplete}
                                className="mt-1"
                            />
                            <h3
                                className={cn("font-semibold leading-none tracking-tight", {
                                    "line-through text-muted-foreground": completed,
                                })}
                            >
                                {title}
                            </h3>
                        </div>
                        <Badge
                            variant="secondary"
                            className={cn("ml-auto", priorityColors[priority])}
                        >
                            {priorityLabels[priority]}
                        </Badge>
                    </div>
                </CardHeader>
                {description && (
                    <CardContent className="pb-2">
                        <p
                            className={cn("text-sm text-muted-foreground", {
                                "line-through": completed,
                            })}
                        >
                            {description}
                        </p>
                    </CardContent>
                )}
                {dueDate && (
                    <CardContent className="pb-2">
                        <p className="text-xs text-muted-foreground">
                            Vence: {new Date(dueDate).toLocaleDateString()}
                        </p>
                    </CardContent>
                )}
                <AnimatePresence>
                    {isHovered && (
                        <CardFooter className="absolute right-2 top-2 flex gap-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.1 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onEdit}
                                    className="h-8 w-8"
                                    aria-label="Editar tarea"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                        <path d="m15 5 4 4" />
                                    </svg>
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
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    aria-label="Eliminar tarea"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </Button>
                            </motion.div>
                        </CardFooter>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}
