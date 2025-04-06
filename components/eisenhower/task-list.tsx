import { cn } from "@/lib/utils"
import { DroppableZone } from "./droppable-zone"
import { TaskCard } from "./task-card"

interface Task {
    id: string
    title: string
    description?: string
    priority: "urgent" | "important" | "delegate" | "eliminate"
    dueDate?: Date
    completed?: boolean
}

interface TaskListProps {
    title: string
    tasks: Task[]
    type: "pending" | "completed"
    onTaskEdit?: (taskId: string) => void
    onTaskDelete?: (taskId: string) => void
    className?: string
}

export function TaskList({
    title,
    tasks,
    type,
    onTaskEdit,
    onTaskDelete,
    className
}: TaskListProps) {
    return (
        <DroppableZone
            id={type}
            className={cn(
                "rounded-lg border bg-card p-4",
                {
                    "border-primary/20": type === "pending",
                    "border-green-200": type === "completed"
                },
                className
            )}
        >
            <div className="mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-sm text-muted-foreground">
                    {type === "pending" ? "Tareas pendientes" : "Tareas completadas"}
                </p>
            </div>
            <div className="space-y-4 min-h-[200px]">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        {...task}
                        onEdit={() => onTaskEdit?.(task.id)}
                        onDelete={() => onTaskDelete?.(task.id)}
                    />
                ))}
            </div>
        </DroppableZone>
    )
} 