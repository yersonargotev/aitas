import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

interface TaskCardProps {
    id: string
    title: string
    description?: string
    priority: "urgent" | "important" | "delegate" | "eliminate" | "unclassified"
    dueDate?: Date
    onEdit?: () => void
    onDelete?: () => void
    className?: string
    isDragging?: boolean
}

const priorityColors = {
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    important: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    delegate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    eliminate: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    unclassified: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100"
}

export function TaskCard({
    id,
    title,
    description,
    priority,
    dueDate,
    onEdit,
    onDelete,
    className,
}: TaskCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data: {
            type: 'task',
            task: { id, title, description, priority, dueDate }
        }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
        cursor: 'grab'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Card
                ref={setNodeRef}
                style={style}
                className={cn(
                    "w-full transition-all",
                    {
                        "ring-2 ring-primary ring-offset-2": isDragging,
                        "cursor-grabbing": isDragging,
                        "shadow-lg": isHovered,
                    },
                    className
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                {...attributes}
                {...listeners}
            >
                <CardHeader className="space-y-1">
                    <div className="flex items-start justify-between">
                        <motion.h3
                            className="font-semibold leading-none tracking-tight"
                            layout
                        >
                            {title}
                        </motion.h3>
                        <Badge
                            variant="secondary"
                            className={cn(
                                priorityColors[priority],
                                "transition-colors duration-200"
                            )}
                        >
                            {priority}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        {description && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-sm text-muted-foreground"
                            >
                                {description}
                            </motion.p>
                        )}
                    </AnimatePresence>
                    {dueDate && (
                        <motion.p
                            className="mt-2 text-xs text-muted-foreground"
                            layout
                        >
                            Due: {dueDate.toLocaleDateString()}
                        </motion.p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                            aria-label="Edit task"
                        >
                            Edit
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onDelete}
                            aria-label="Delete task"
                        >
                            Delete
                        </Button>
                    </motion.div>
                </CardFooter>
            </Card>
        </motion.div>
    )
} 