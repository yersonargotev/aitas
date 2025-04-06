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
        <div className="relative w-full">
            {/* Headers */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center font-semibold text-lg">Urgente</div>
                <div className="text-center font-semibold text-lg">No Urgente</div>
            </div>

            {/* Left side label */}
            <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 transform">
                <div className="rotate-[-90deg] whitespace-nowrap">
                    <span className="font-semibold text-lg">Importante</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 relative">
                {/* Urgent & Important */}
                <div
                    className="rounded-lg border-2 border-red-200 bg-red-50/30 dark:bg-red-950/10 p-4"
                    data-quadrant="urgent"
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                            Do it now
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Tareas que requieren atención inmediata
                        </p>
                    </div>
                    <div className="space-y-4 min-h-[200px]">
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
                <div
                    className="rounded-lg border-2 border-blue-200 bg-blue-50/30 dark:bg-blue-950/10 p-4"
                    data-quadrant="important"
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            Decide
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Programa un tiempo específico para realizarlo
                        </p>
                    </div>
                    <div className="space-y-4 min-h-[200px]">
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
                <div
                    className="rounded-lg border-2 border-yellow-200 bg-yellow-50/30 dark:bg-yellow-950/10 p-4"
                    data-quadrant="delegate"
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                            Delegate
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            ¿Quién puede hacerlo por ti?
                        </p>
                    </div>
                    <div className="space-y-4 min-h-[200px]">
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
                <div
                    className="rounded-lg border-2 border-gray-200 bg-gray-50/30 dark:bg-gray-950/10 p-4"
                    data-quadrant="eliminate"
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                            Delete
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Elimínalo
                        </p>
                    </div>
                    <div className="space-y-4 min-h-[200px]">
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

            {/* Right side label */}
            <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 transform">
                <div className="rotate-90 whitespace-nowrap">
                    <span className="font-semibold text-lg">No Importante</span>
                </div>
            </div>
        </div>
    )
} 