import { DroppableZone } from "@/components/eisenhower/droppable-zone";
import { TaskCard } from "@/components/eisenhower/task-card";
import { Card, CardHeader } from "@/components/ui/card";
import type { Task } from "@/lib/stores/types";
import { InboxIcon } from "lucide-react";

interface UnclassifiedTasksSectionProps {
    tasks: Task[];
    onEdit: (taskId: string, updates?: { title?: string; description?: string }) => void;
    onDelete: (taskId: string) => void;
    onToggleComplete: (taskId: string) => void;
}

export function UnclassifiedTasksSection({
    tasks,
    onEdit,
    onDelete,
    onToggleComplete,
}: UnclassifiedTasksSectionProps) {
    const unclassifiedTasks = tasks.filter(
        (task) => task.priority === "unclassified" && !task.completed
    );

    return (
        <Card className="mb-6 border-dashed">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <InboxIcon className="h-5 w-5" />
                    <div className="flex items-center justify-between flex-1">
                        <h2 className="text-lg font-semibold">Unclassified Tasks</h2>
                        <span className="text-sm">
                            {unclassifiedTasks.length} {unclassifiedTasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <DroppableZone id="unclassified" className="p-4 min-h-[100px]">
                {unclassifiedTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Drop tasks here
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {unclassifiedTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                {...task}
                                onEdit={(updates) => onEdit(task.id, updates)}
                                onDelete={() => onDelete(task.id)}
                                onToggleComplete={() => onToggleComplete(task.id)}
                            />
                        ))}
                    </div>
                )}
            </DroppableZone>
        </Card>
    );
} 