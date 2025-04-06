import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

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
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                "w-full transition-all hover:shadow-md",
                {
                    "ring-2 ring-primary": isDragging,
                    "cursor-grabbing": isDragging,
                },
                className
            )}
            {...attributes}
            {...listeners}
        >
            <CardHeader className="space-y-1">
                <div className="flex items-start justify-between">
                    <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                    <Badge variant="secondary" className={priorityColors[priority]}>
                        {priority}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                {dueDate && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Due: {dueDate.toLocaleDateString()}
                    </p>
                )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    aria-label="Edit task"
                >
                    Edit
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    aria-label="Delete task"
                >
                    Delete
                </Button>
            </CardFooter>
        </Card>
    )
} 