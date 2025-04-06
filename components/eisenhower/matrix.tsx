import { ActionButton } from "./action-button"
import { TaskCard } from "./task-card"

interface Task {
    id: string
    title: string
    description?: string
    priority: "urgent" | "important" | "delegate" | "eliminate"
    dueDate?: Date
}

interface EisenhowerMatrixProps {
    tasks: Task[]
    onTaskEdit?: (taskId: string) => void
    onTaskDelete?: (taskId: string) => void
    onTaskOrder?: (quadrant: string) => void
}

export function EisenhowerMatrix({
    tasks,
    onTaskEdit,
    onTaskDelete,
    onTaskOrder
}: EisenhowerMatrixProps) {
    const quadrants = {
        urgent: tasks.filter(task => task.priority === "urgent"),
        important: tasks.filter(task => task.priority === "important"),
        delegate: tasks.filter(task => task.priority === "delegate"),
        eliminate: tasks.filter(task => task.priority === "eliminate")
    }

    return (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-2">
            {/* Urgent & Important */}
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                        Urgent & Important
                    </h2>
                    <ActionButton
                        variant="outline"
                        size="sm"
                        onClick={() => onTaskOrder?.("urgent")}
                    >
                        Order
                    </ActionButton>
                </div>
                <div className="space-y-4">
                    {quadrants.urgent.map(task => (
                        <TaskCard
                            key={task.id}
                            {...task}
                            onEdit={() => onTaskEdit?.(task.id)}
                            onDelete={() => onTaskDelete?.(task.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Important & Not Urgent */}
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        Important & Not Urgent
                    </h2>
                    <ActionButton
                        variant="outline"
                        size="sm"
                        onClick={() => onTaskOrder?.("important")}
                    >
                        Order
                    </ActionButton>
                </div>
                <div className="space-y-4">
                    {quadrants.important.map(task => (
                        <TaskCard
                            key={task.id}
                            {...task}
                            onEdit={() => onTaskEdit?.(task.id)}
                            onDelete={() => onTaskDelete?.(task.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Urgent & Not Important */}
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        Urgent & Not Important
                    </h2>
                    <ActionButton
                        variant="outline"
                        size="sm"
                        onClick={() => onTaskOrder?.("delegate")}
                    >
                        Order
                    </ActionButton>
                </div>
                <div className="space-y-4">
                    {quadrants.delegate.map(task => (
                        <TaskCard
                            key={task.id}
                            {...task}
                            onEdit={() => onTaskEdit?.(task.id)}
                            onDelete={() => onTaskDelete?.(task.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Not Urgent & Not Important */}
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                        Not Urgent & Not Important
                    </h2>
                    <ActionButton
                        variant="outline"
                        size="sm"
                        onClick={() => onTaskOrder?.("eliminate")}
                    >
                        Order
                    </ActionButton>
                </div>
                <div className="space-y-4">
                    {quadrants.eliminate.map(task => (
                        <TaskCard
                            key={task.id}
                            {...task}
                            onEdit={() => onTaskEdit?.(task.id)}
                            onDelete={() => onTaskDelete?.(task.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
} 